var Gba3D = { VERSION: "1.4" };
Gba3D.Options = {
    bgcolor: null,
    light: {
        directional: {
            azimuth: 220,   // note: default light azimuth of gdaldem hillshade is 315.
            altitude: 45    // altitude angle
        }
    },
    side: { color: 0xc7ac92, bottomZ: 0 },
    //frame: { color: 0, bottomZ: -1.5 },
    label: { visible: true, connectorColor: 0xc0c0d0, autoSize: false, minFontSize: 10 },
    qmarker: { r: 0.25, c: 0xffff00, o: 0.8 },
    debugMode: false,
    exportMode: false,
    jsonLoader: "JSONLoader"  // JSONLoader or ObjectLoader
};

Gba3D.LayerType = { DEM: "dem", Point: "point", Line: "line", Polygon: "polygon" };
Gba3D.MaterialType = { MeshLambert: 0, MeshPhong: 1, LineBasic: 2, Sprite: 3, Unknown: -1 };
Gba3D.uv = { i: new THREE.Vector3(1, 0, 0), j: new THREE.Vector3(0, 1, 0), k: new THREE.Vector3(0, 0, 1) };

Gba3D.$ = function (elementId) {
    return document.getElementById(elementId);
};

Gba3D.Project = function (params) {
    for (var k in params) {
        this[k] = params[k];
    }

    var w = (this.baseExtent[2] - this.baseExtent[0]);
    var   h = (this.baseExtent[3] - this.baseExtent[1]);

    this.height = this.width * h / w;
    this.scale = this.width / w;
    this.zScale = this.scale * this.zExaggeration;

    this.origin = {
        x: this.baseExtent[0] + w / 2,
        y: this.baseExtent[1] + h / 2,
        z: -this.zShift
    };

    this.layers = [];
    this.models = [];
    this.images = [];
};

Gba3D.Project.prototype = {

    constructor: Gba3D.Project,

    addLayer: function (layer) {
        layer.index = this.layers.length;
        layer.project = this;
        this.layers.push(layer);
        return layer;
    } 
   
};


(function () {
    // the application
    var app = {};
    Gba3D.application = app;

    app.init = function (container) {
        app.container = container;
        app.running = false;

        // URL parameters
        app.urlParams = app.parseUrlParameters();
        if ("popup" in app.urlParams) {
            // open popup window
            var c = window.location.href.split("?");
            window.open(c[0] + "?" + c[1].replace(/&?popup/, ""), "popup", "width=" + app.urlParams.width + ",height=" + app.urlParams.height);
            app.popup.show("Another window has been opened.");
            return;
        }

        if (app.urlParams.width && app.urlParams.height) {
            // set container size
            container.style.width = app.urlParams.width + "px";
            container.style.height = app.urlParams.height + "px";
        }

        if (container.clientWidth && container.clientHeight) {
            app.width = container.clientWidth;
            app.height = container.clientHeight;
            app._fullWindow = false;
        } else {
            app.width = window.innerWidth;
            app.height = window.innerHeight;
            app._fullWindow = true;
        }

        // WebGLRenderer
        var bgcolor = Gba3D.Options.bgcolor;
        app.renderer = new THREE.WebGLRenderer({ alpha: true });
        app.renderer.setSize(app.width, app.height);
        app.renderer.setClearColor(bgcolor || 0, (bgcolor === null) ? 0 : 1);
        app.container.appendChild(app.renderer.domElement);

        // scene
        app.scene = new THREE.Scene();
        app.scene.autoUpdate = false;

        // show axes in the screen
        app.scene.add(new THREE.AxisHelper(200));

        app._queryableObjects = [];
        app.queryObjNeedsUpdate = true;

        // label
        app.labelVisibility = Gba3D.Options.label.visible;
        app.labelConnectorGroup = new THREE.Group();
        app.labels = [];     // labels of visible layers

        // root element for labels
        var e = document.createElement("div");
        e.style.display = (app.labelVisibility) ? "block" : "none";
        app.container.appendChild(e);
        app.labelRootElement = e;

        app.modelBuilders = [];
        app._wireframeMode = false;
    };

    app.parseUrlParameters = function () {
        var p, vars = {};
        var params = window.location.search.substring(1).split('&').concat(window.location.hash.substring(1).split('&'));
        params.forEach(function (param) {
            p = param.split('=');
            vars[p[0]] = p[1];
        });
        return vars;
    };

    app.loadProject = function (project) {
        app.project = project;

        // light
        if (project.buildCustomLights) project.buildCustomLights(app.scene);
        else app.buildDefaultLights(app.scene);

        // camera
        if (project.buildCustomCamera) project.buildCustomCamera();
        else app.buildDefaultCamera();

        // restore view (camera position and its target) from URL parameters
        var vars = app.urlParams;
        if (vars.cx !== undefined) app.camera.position.set(parseFloat(vars.cx), parseFloat(vars.cy), parseFloat(vars.cz));
        if (vars.ux !== undefined) app.camera.up.set(parseFloat(vars.ux), parseFloat(vars.uy), parseFloat(vars.uz));
        if (vars.tx !== undefined) app.camera.lookAt(parseFloat(vars.tx), parseFloat(vars.ty), parseFloat(vars.tz));

        // controls
        app.controls = new THREE.TrackballControls(app.camera);
        //if (Gba3D.Controls) {
        //    app.controls = Gba3D.Controls.create(app.camera, app.renderer.domElement);           
        //    if (vars.tx !== undefined) {
        //        app.controls.target.set(parseFloat(vars.tx), parseFloat(vars.ty), parseFloat(vars.tz));
        //        app.controls.target0.copy(app.controls.target);   // for reset
        //    }
        //}

        // load models
        //if (project.models.length > 0) {
        //    project.models.forEach(function (model, index) {
        //        if (model.type == "COLLADA") {
        //            app.modelBuilders[index] = new Gba3D.ModelBuilder.COLLADA(app.project, model);
        //        }
        //        else if (Gba3D.Options.jsonLoader == "ObjectLoader") {
        //            app.modelBuilders[index] = new Gba3D.ModelBuilder.JSONObject(app.project, model);
        //        }
        //        else {
        //            app.modelBuilders[index] = new Gba3D.ModelBuilder.JSON(app.project, model);
        //        }
        //    });
        //}

        // build models
        project.layers.forEach(function (layer) {
            layer.initMaterials();
            layer.build(app.scene);

            // build labels
            if (layer.l) {
                layer.buildLabels(app.labelConnectorGroup, app.labelRootElement);
                app.labels = app.labels.concat(layer.labels);
            }
        });

        if (app.labels.length) app.scene.add(app.labelConnectorGroup);

        // wireframe mode setting
        if ("wireframe" in app.urlParams) app.setWireframeMode(true);

        // create a marker for queried point
        var opt = Gba3D.Options.qmarker;
        app.queryMarker = new THREE.Mesh(new THREE.SphereGeometry(opt.r),
                                          new THREE.MeshLambertMaterial({ color: opt.c, ambient: opt.c, opacity: opt.o, transparent: (opt.o < 1) }));
        app.queryMarker.visible = false;
        app.scene.add(app.queryMarker);

        // update matrix world here
        app.scene.updateMatrixWorld();

        app.highlightMaterial = new THREE.MeshLambertMaterial({ emissive: 0x999900, transparent: true, opacity: 0.5 });
        //if (!Gba3D.isIE) app.highlightMaterial.side = THREE.DoubleSide;    // Shader compilation error occurs with double sided material on IE11

        app.selectedLayerId = null;
        app.selectedFeatureId = null;
        app.highlightObject = null;
    };

    app.addEventListeners = function () {
        window.addEventListener("keydown", app.eventListener.keydown);
        window.addEventListener("resize", app.eventListener.resize);

        var e = Gba3D.$("closebtn");
        if (e) e.addEventListener("click", app.closePopup);
    };

    app.eventListener = {

        keydown: function (e) {
            if (e.ctrlKey || e.altKey) return;
            var keyPressed = e.which;
            if (!e.shiftKey) {
                if (keyPressed == 27) app.closePopup(); // ESC
                else if (keyPressed == 73) app.showInfo();  // I
                else if (keyPressed == 76) app.setLabelVisibility(!app.labelVisibility);  // L
                else if (keyPressed == 87) app.setWireframeMode(!app._wireframeMode);    // W
            }
            else {
                if (keyPressed == 82) app.controls.reset();   // Shift + R
                else if (keyPressed == 83) app.showPrintDialog();    // Shift + S
            }
        },

        resize: function () {
            if (app._fullWindow) app.setCanvasSize(window.innerWidth, window.innerHeight);
        }

    };

    app.setCanvasSize = function (width, height) {
        app.width = width;
        app.height = height;
        app.camera.aspect = width / height;
        app.camera.updateProjectionMatrix();
        app.renderer.setSize(width, height);
    };

    app.buildDefaultLights = function (parent) {
        var deg2rad = Math.PI / 180;

        // ambient light
        parent.add(new THREE.AmbientLight(0x999999));

        // directional lights
        var opt = Gba3D.Options.light.directional;
        var lambda = (90 - opt.azimuth) * deg2rad;
        var phi = opt.altitude * deg2rad;

        var x = Math.cos(phi) * Math.cos(lambda),
            y = Math.cos(phi) * Math.sin(lambda),
            z = Math.sin(phi);

        var light1 = new THREE.DirectionalLight(0xffffff, 0.5);
        light1.position.set(x, y, z);
        parent.add(light1);

        // thin light from the opposite direction
        var light2 = new THREE.DirectionalLight(0xffffff, 0.1);
        light2.position.set(-x, -y, -z);
        parent.add(light2);
    };

    app.buildDefaultCamera = function () {
        app.camera = new THREE.PerspectiveCamera(45, app.width / app.height, 0.1, 1000);
        app.camera.position.set(0, -100, 100);
    };

    app.currentViewUrl = function () {
        var c = app.camera.position, t = app.controls.target, u = app.camera.up;
        var hash = "#cx=" + c.x + "&cy=" + c.y + "&cz=" + c.z;
        if (t.x || t.y || t.z) hash += "&tx=" + t.x + "&ty=" + t.y + "&tz=" + t.z;
        if (u.x || u.y || u.z != 1) hash += "&ux=" + u.x + "&uy=" + u.y + "&uz=" + u.z;
        return window.location.href.split("#")[0] + hash;
    };

    // start rendering loop
    app.start = function () {
        app.running = true;
        //if (app.controls) app.controls.enabled = true;
        //app.animate();

        
        if (app.controls) app.controls.update();
        requestAnimationFrame(app.animate);
        app.renderer.render(app.scene, app.camera);
    };

    app.pause = function () {
        app.running = false;
        if (app.controls) app.controls.enabled = false;
    };

    // animation loop
    app.animate = function () {
        if (app.running) requestAnimationFrame(app.animate);
        if (app.controls) app.controls.update();
        app.render();
    };

    app.render = function () {
        app.renderer.render(app.scene, app.camera);
        app.updateLabelPosition();
    };

    // update label position
    app.updateLabelPosition = function () {
        if (!app.labelVisibility || app.labels.length == 0) return;

        var widthHalf = app.width / 2,
            heightHalf = app.height / 2,
            autosize = Q3D.Options.label.autoSize,
            camera = app.camera,
            camera_pos = camera.position,
            c2t = app.controls.target.clone().sub(camera_pos),
            c2l = new THREE.Vector3(),
            v = new THREE.Vector3();

        // make a list of [label index, distance to camera]
        var idx_dist = [];
        for (var i = 0, l = app.labels.length; i < l; i++) {
            idx_dist.push([i, camera_pos.distanceTo(app.labels[i].pt)]);
        }

        // sort label indexes in descending order of distances
        idx_dist.sort(function (a, b) {
            if (a[1] < b[1]) return 1;
            if (a[1] > b[1]) return -1;
            return 0;
        });

        var label, e, x, y, dist, fontSize;
        var minFontSize = Q3D.Options.label.minFontSize;
        for (var i = 0, l = idx_dist.length; i < l; i++) {
            label = app.labels[idx_dist[i][0]];
            e = label.e;
            if (c2l.subVectors(label.pt, camera_pos).dot(c2t) > 0) {
                // label is in front
                // calculate label position
                v.copy(label.pt).project(camera);
                x = (v.x * widthHalf) + widthHalf;
                y = -(v.y * heightHalf) + heightHalf;

                // set label position
                e.style.display = "block";
                e.style.left = (x - (e.offsetWidth / 2)) + "px";
                e.style.top = (y - (e.offsetHeight / 2)) + "px";
                e.style.zIndex = i + 1;

                // set font size
                if (autosize) {
                    dist = idx_dist[i][1];
                    if (dist < 10) dist = 10;
                    fontSize = Math.max(Math.round(1000 / dist), minFontSize);
                    e.style.fontSize = fontSize + "px";
                }
            }
            else {
                // label is in back
                e.style.display = "none";
            }
        }
    };

    app.labelVisibilityChanged = function () {
        app.labels = [];
        app.project.layers.forEach(function (layer) {
            if (layer.l && layer.visible) app.labels = app.labels.concat(layer.labels);
        });
    };

    app.setLabelVisibility = function (visible) {
        app.labelVisibility = visible;
        app.labelRootElement.style.display = (visible) ? "block" : "none";
        app.labelConnectorGroup.visible = visible;

        if (app.labels.length) app.render();
    };

    app.setWireframeMode = function (wireframe) {
        if (wireframe == app._wireframeMode) return;

        app.project.layers.forEach(function (layer) {
            layer.setWireframeMode(wireframe);
        });

        app._wireframeMode = wireframe;
    };

    app.queryableObjects = function () {
        if (app.queryObjNeedsUpdate) {
            app._queryableObjects = [];
            app.project.layers.forEach(function (layer) {
                if (layer.visible && layer.queryableObjects.length) app._queryableObjects = app._queryableObjects.concat(layer.queryableObjects);
            });
        }
        return app._queryableObjects;
    };

    app.intersectObjects = function (offsetX, offsetY) {
        var x = (offsetX / app.width) * 2 - 1;
        var y = -(offsetY / app.height) * 2 + 1;
        var vector = new THREE.Vector3(x, y, 1);
        vector.unproject(app.camera);
        var ray = new THREE.Raycaster(app.camera.position, vector.sub(app.camera.position).normalize());
        return ray.intersectObjects(app.queryableObjects());
    };

    app._offset = function (elm) {
        var top = 0, left = 0;
        do {
            top += elm.offsetTop || 0; left += elm.offsetLeft || 0; elm = elm.offsetParent;
        } while (elm);
        return { top: top, left: left };
    };

    app.help = function () {
        var lines = (Q3D.Controls === undefined) ? [] : Q3D.Controls.keyList;
        if (lines.indexOf("* Keys") == -1) lines.push("* Keys");
        lines = lines.concat([
          "I : Show Information About Page",
          "L : Toggle Label Visibility",
          "W : Wireframe Mode",
          "Shift + R : Reset View",
          "Shift + S : Save Image"
        ]);
        var html = '<table>';
        lines.forEach(function (line) {
            if (line.trim() == "") return;

            if (line[0] == "*") {
                html += '<tr><td colspan="2" class="star">' + line.substr(1).trim() + "</td></tr>";
            }
            else if (line.indexOf(":") == -1) {
                html += '<tr><td colspan="2">' + line.trim() + "</td></tr>";
            }
            else {
                var p = line.split(":");
                html += "<tr><td>" + p[0].trim() + "</td><td>" + p[1].trim() + "</td></tr>";
            }
        });
        html += "</table>";
        return html;
    };

    app.popup = {

        modal: false,

        // show box
        // obj: html or element
        show: function (obj, title, modal) {

            if (modal) app.pause();
            else if (this.modal) app.start();   // enable controls

            this.modal = Boolean(modal);

            var content = Q3D.$("popupcontent");
            if (obj === undefined) {
                // show page info
                content.style.display = "none";
                Q3D.$("pageinfo").style.display = "block";
            }
            else {
                Q3D.$("pageinfo").style.display = "none";
                if (obj instanceof HTMLElement) {
                    content.innerHTML = "";
                    content.appendChild(obj);
                }
                else {
                    content.innerHTML = obj;
                }
                content.style.display = "block";
            }
            Q3D.$("popupbar").innerHTML = title || "";
            Q3D.$("popup").style.display = "block";
        },

        hide: function () {
            Q3D.$("popup").style.display = "none";
            if (this.modal) app.start();    // enable controls
        }

    };

    app.showInfo = function () {
        Q3D.$("urlbox").value = app.currentViewUrl();
        Q3D.$("usage").innerHTML = app.help();
        app.popup.show();
    };

    app.showQueryResult = function (point, layerId, featureId) {
        var layer, r = [];
        if (layerId !== undefined) {
            // layer name
            layer = app.project.layers[layerId];
            r.push('<table class="layer">');
            r.push("<caption>Layer name</caption>");
            r.push("<tr><td>" + layer.name + "</td></tr>");
            r.push("</table>");
        }

        // clicked coordinates
        var pt = app.project.toMapCoordinates(point.x, point.y, point.z);
        r.push('<table class="coords">');
        r.push("<caption>Clicked coordinates</caption>");
        r.push("<tr><td>");

        if (typeof proj4 === "undefined") r.push([pt.x.toFixed(2), pt.y.toFixed(2), pt.z.toFixed(2)].join(", "));
        else {
            var lonLat = proj4(app.project.proj).inverse([pt.x, pt.y]);
            r.push(Q3D.Utils.convertToDMS(lonLat[1], lonLat[0]) + ", Elev. " + pt.z.toFixed(2));
        }

        r.push("</td></tr></table>");

        if (layerId !== undefined && featureId !== undefined && layer.a !== undefined) {
            // attributes
            r.push('<table class="attrs">');
            r.push("<caption>Attributes</caption>");
            var f = layer.f[featureId];
            for (var i = 0, l = layer.a.length; i < l; i++) {
                r.push("<tr><td>" + layer.a[i] + "</td><td>" + f.a[i] + "</td></tr>");
            }
            r.push("</table>");
        }
        app.popup.show(r.join(""));
    };

    app.showPrintDialog = function () {

        function e(tagName, parent, innerHTML) {
            var elem = document.createElement(tagName);
            if (parent) parent.appendChild(elem);
            if (innerHTML) elem.innerHTML = innerHTML;
            return elem;
        }

        var f = e("form");
        f.className = "print";

        var d1 = e("div", f, "Image Size");
        d1.style.textDecoration = "underline";

        var d2 = e("div", f),
            l1 = e("label", d2, "Width:"),
            width = e("input", d2);
        d2.style.cssFloat = "left";
        l1.htmlFor = width.id = width.name = "printwidth";
        width.type = "text";
        width.value = app.width;
        e("span", d2, "px,");

        var d3 = e("div", f),
            l2 = e("label", d3, "Height:"),
            height = e("input", d3);
        l2.htmlFor = height.id = height.name = "printheight";
        height.type = "text";
        height.value = app.height;
        e("span", d3, "px");

        var d4 = e("div", f),
            ka = e("input", d4);
        ka.type = "checkbox";
        ka.checked = true;
        e("span", d4, "Keep Aspect Ratio");

        var d5 = e("div", f, "Option");
        d5.style.textDecoration = "underline";

        var d6 = e("div", f),
            bg = e("input", d6);
        bg.type = "checkbox";
        bg.checked = true;
        e("span", d6, "Fill Background");

        var d7 = e("div", f),
            ok = e("span", d7, "OK"),
            cancel = e("span", d7, "Cancel");
        d7.className = "buttonbox";

        e("input", f).type = "submit";

        // event handlers
        // width and height boxes
        var aspect = app.width / app.height;

        width.oninput = function () {
            if (ka.checked) height.value = Math.round(width.value / aspect);
        };

        height.oninput = function () {
            if (ka.checked) width.value = Math.round(height.value * aspect);
        };

        ok.onclick = function () {
            app.popup.show("Rendering...");
            window.setTimeout(function () {
                app.saveCanvasImage(width.value, height.value, bg.checked);
            }, 10);
        };

        cancel.onclick = app.closePopup;

        // enter key pressed
        f.onsubmit = function () {
            ok.onclick();
            return false;
        };

        app.popup.show(f, "Save Image", true);   // modal
    };

    app.closePopup = function () {
        app.popup.hide();
        app.queryMarker.visible = false;
        app.highlightFeature(null, null);
        if (app._canvasImageUrl) {
            URL.revokeObjectURL(app._canvasImageUrl);
            app._canvasImageUrl = null;
        }
    };

    app.highlightFeature = function (layerId, featureId) {
        if (app.highlightObject) {
            // remove highlight object from the scene
            app.scene.remove(app.highlightObject);
            app.selectedLayerId = null;
            app.selectedFeatureId = null;
            app.highlightObject = null;
        }

        if (layerId === null || featureId === null) return;

        var layer = app.project.layers[layerId];
        if (layer === undefined) return;
        if (["Icon", "JSON model", "COLLADA model"].indexOf(layer.objType) != -1) return;

        var f = layer.f[featureId];
        if (f === undefined || f.objs.length == 0) return;

        var high_mat = app.highlightMaterial;
        var setMaterial = function (obj) {
            obj.material = high_mat;
        };

        // create a highlight object (if layer type is Point, slightly bigger than the object)
        var highlightObject = new THREE.Group();
        var clone, s = (layer.type == Q3D.LayerType.Point) ? 1.01 : 1;

        for (var i = 0, l = f.objs.length; i < l; i++) {
            clone = f.objs[i].clone();
            clone.traverse(setMaterial);
            if (s != 1) clone.scale.set(clone.scale.x * s, clone.scale.y * s, clone.scale.z * s);
            highlightObject.add(clone);
        }

        // add the highlight object to the scene
        app.scene.add(highlightObject);

        app.selectedLayerId = layerId;
        app.selectedFeatureId = featureId;
        app.highlightObject = highlightObject;
    };

})();

/*
Q3D.DEMLayer --> Q3D.MapLayer
*/
Gba3D.DEMLayer = function (params) {

    this.visible = true;
    this.opacity = 1;

    this.materialParameter = [];
    for (var k in params) {
        this[k] = params[k];
    }

    // this.materials = undefined;
    this.objectGroup = new THREE.Group();
    this.queryableObjects = [];

    //Gba3D.MapLayer.call(this, params);
    this.type = Gba3D.LayerType.DEM;
    this.blocks = [];
};

//Gba3D.DEMLayer.prototype = Object.create(Gba3D.MapLayer.prototype);
Gba3D.DEMLayer.prototype.constructor = Gba3D.DEMLayer;

Gba3D.DEMLayer.prototype.addBlock = function (params, clipped) {
    var BlockClass = (clipped) ? Gba3D.ClippedDEMBlock : Gba3D.DEMBlock,
        block = new BlockClass(params);
    this.blocks.push(block);
    return block;
};

Gba3D.DEMLayer.prototype.addObject = function (object, queryable) {
    if (queryable === undefined) queryable = this.q;

    this.objectGroup.add(object);
    if (queryable) this._addQueryableObject(object);
};

Gba3D.DEMLayer.prototype._addQueryableObject = function (object) {
    this.queryableObjects.push(object);
    for (var i = 0, l = object.children.length; i < l; i++) {
        this._addQueryableObject(object.children[i]);
    }
};

Gba3D.DEMLayer.prototype.loadTextureData = function (imageData) {
    var texture, image = new Image();
    image.onload = function () {
        texture.needsUpdate = true;
        if (!Gba3D.Options.exportMode && !Gba3D.application.running) Gba3D.application.render();
    };
    image.src = imageData;
    texture = new THREE.Texture(image);
    return texture;
};

Gba3D.DEMLayer.prototype.initMaterials = function () {
    this.materials = [];
    if (this.materialParameter.length == 0) return;

    var mat, sum_opacity = 0;
    for (var i = 0, l = this.materialParameter.length; i < l; i++) {
        var m = this.materialParameter[i];

        var opt = {};
        if (m.ds && !Gba3D.isIE) opt.side = THREE.DoubleSide;
        if (m.flat) opt.shading = THREE.FlatShading;
        if (m.i !== undefined) {
            var image = this.project.images[m.i];
            if (image.texture === undefined) {
                if (image.src !== undefined) {
                    image.texture = THREE.ImageUtils.loadTexture(image.src);
                }
                else {
                    image.texture = this.loadTextureData(image.data);
                }
            }
            opt.map = image.texture;
        }
        if (m.o !== undefined && m.o < 1) {
            opt.opacity = m.o;
            opt.transparent = true;
        }
        if (m.t) opt.transparent = true;
        if (m.w) opt.wireframe = true;

        if (m.materialtypee == Gba3D.MaterialType.MeshLambert) {
            if (m.color !== undefined) opt.color = opt.ambient = m.color;
            mat = new THREE.MeshLambertMaterial(opt);
        }
        else if (m.materialtype == Gba3D.MaterialType.MeshPhong) {
            if (m.color !== undefined) opt.color = opt.ambient = m.color;
            mat = new THREE.MeshPhongMaterial(opt);
        }
        else if (m.materialtype == Gba3D.MaterialType.LineBasic) {
            opt.color = m.color;
            mat = new THREE.LineBasicMaterial(opt);
        }
        else {
            opt.color = 0xffffff;
            mat = new THREE.SpriteMaterial(opt);
        }

        m.mat = mat;
        this.materials.push(m);
        sum_opacity += mat.opacity;
    }

    // layer opacity is the average opacity of materials
    this.opacity = sum_opacity / this.materials.length;
};


Gba3D.DEMLayer.prototype.build = function (parent) {
    var opt = Gba3D.Options;
    this.blocks.forEach(function (block) {
        block.build(this);

        // build sides, bottom and frame
        //if (block.sides) {
            // material
        var opacity = this.materials[block.mIndex].o;
        if (opacity === undefined) {
            opacity = 1;
        }
       

            var mat = new THREE.MeshLambertMaterial({
                color: opt.side.color,
                ambient: opt.side.color,
                opacity: opacity,
                transparent: (opacity < 1),
                side: THREE.DoubleSide //neu dazu
            });
            this.materials.push({ type: Gba3D.MaterialType.MeshLambert, m: mat });

            block.buildSides(this, mat, opt.side.bottomZ);
            this.sideVisible = true;
        //}
        //if (block.frame) {
        //    this.buildFrame(block, opt.frame.color, opt.frame.bottomZ);
        //    this.sideVisible = true;
        //}
    }, this);

    if (parent) parent.add(this.objectGroup);
};

Gba3D.DEMLayer.prototype.buildFrame = function (block, color, z0) {
    var dem = block;
    var opacity = this.materials[block.m].o;
    if (opacity === undefined) opacity = 1;
    var mat = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: (opacity < 1)
    });
    this.materials.push({ type: Gba3D.MaterialType.LineBasic, m: mat });

    // horizontal rectangle at bottom
    var hw = dem.plane.width / 2, hh = dem.plane.height / 2;
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(-hw, -hh, z0),
                       new THREE.Vector3(hw, -hh, z0),
                       new THREE.Vector3(hw, hh, z0),
                       new THREE.Vector3(-hw, hh, z0),
                       new THREE.Vector3(-hw, -hh, z0));

    var obj = new THREE.Line(geom, mat);
    this.addObject(obj, false);
    dem.aObjs.push(obj);

    // vertical lines at corners
    var pts = [[-hw, -hh, dem.data[dem.data.length - dem.width]],
               [hw, -hh, dem.data[dem.data.length - 1]],
               [hw, hh, dem.data[dem.width - 1]],
               [-hw, hh, dem.data[0]]];
    pts.forEach(function (pt) {
        var geom = new THREE.Geometry();
        geom.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]),
                           new THREE.Vector3(pt[0], pt[1], z0));

        var obj = new THREE.Line(geom, mat);
        this.addObject(obj, false);
        dem.aObjs.push(obj);
    }, this);
};

Gba3D.DEMLayer.prototype.meshes = function () {
    var m = [];
    this.blocks.forEach(function (block) {
        m.push(block.obj);
        (block.aObjs || []).forEach(function (obj) {
            m.push(obj);
        });
    });
    return m;
};

// calculate elevation at the coordinates (x, y) on triangle face
Gba3D.DEMLayer.prototype.getZ = function (x, y) {
    var xmin = -this.project.width / 2,
        ymax = this.project.height / 2;

    for (var i = 0, l = this.blocks.length; i < l; i++) {
        var block = this.blocks[i];
        if (!block.contains(x, y)) continue;

        var ix = block.plane.width / (block.width - 1),
            iy = block.plane.height / (block.height - 1);

        xmin = block.plane.offsetX - block.plane.width / 2;
        ymax = block.plane.offsetY + block.plane.height / 2;

        var mx0 = Math.floor((x - xmin) / ix),
            my0 = Math.floor((ymax - y) / iy);

        var z = [block.getValue(mx0, my0),
                 block.getValue(mx0 + 1, my0),
                 block.getValue(mx0, my0 + 1),
                 block.getValue(mx0 + 1, my0 + 1)];

        var px0 = xmin + ix * mx0,
            py0 = ymax - iy * my0;

        var sdx = (x - px0) / ix,
            sdy = (py0 - y) / iy;

        // console.log(x, y, mx0, my0, sdx, sdy);

        if (sdx <= 1 - sdy) return z[0] + (z[1] - z[0]) * sdx + (z[2] - z[0]) * sdy;
        else return z[3] + (z[2] - z[3]) * (1 - sdx) + (z[1] - z[3]) * (1 - sdy);
    }
    return null;
};

Gba3D.DEMLayer.prototype.segmentizeLineString = function (lineString, zFunc) {
    // does not support multiple blocks
    if (zFunc === undefined) zFunc = function () { return 0; };
    var width = this.project.width, height = this.project.height;
    var xmin = -width / 2, ymax = height / 2;
    var block = this.blocks[0];
    var x_segments = block.width - 1,
        y_segments = block.height - 1;
    var ix = width / x_segments,
        iy = height / y_segments;

    var pts = [];
    for (var i = 1, l = lineString.length; i < l; i++) {
        var pt1 = lineString[i - 1], pt2 = lineString[i];
        var x1 = pt1[0], x2 = pt2[0], y1 = pt1[1], y2 = pt2[1], z1 = pt1[2], z2 = pt2[2];
        var nx1 = (x1 - xmin) / ix,
            nx2 = (x2 - xmin) / ix;
        var ny1 = (ymax - y1) / iy,
            ny2 = (ymax - y2) / iy;
        var ns1 = Math.abs(ny1 + nx1),
            ns2 = Math.abs(ny2 + nx2);

        var p = [0], nvp = [[nx1, nx2], [ny1, ny2], [ns1, ns2]];
        for (var j = 0; j < 3; j++) {
            var v1 = nvp[j][0], v2 = nvp[j][1];
            if (v1 == v2) continue;
            var k = Math.ceil(Math.min(v1, v2));
            var n = Math.floor(Math.max(v1, v2));
            for (; k <= n; k++) {
                p.push((k - v1) / (v2 - v1));
            }
        }

        p.sort(function (a, b) { return a - b; });

        var x, y, z, lp = null;
        for (var j = 0, m = p.length; j < m; j++) {
            if (lp === p[j]) continue;
            if (p[j] == 1) break;

            x = x1 + (x2 - x1) * p[j];
            y = y1 + (y2 - y1) * p[j];

            if (z1 === undefined || z2 === undefined) z = zFunc(x, y);
            else z = z1 + (z2 - z1) * p[j];

            pts.push(new THREE.Vector3(x, y, z));

            // Q3D.Utils.putStick(x, y, zFunc);

            lp = p[j];
        }
    }
    // last point (= the first point)
    var pt = lineString[lineString.length - 1];
    pts.push(new THREE.Vector3(pt[0], pt[1], (pt[2] === undefined) ? zFunc(pt[0], pt[1]) : pt[2]));

    /*
    for (var i = 0, l = lineString.length - 1; i < l; i++) {
      Q3D.Utils.putStick(lineString[i][0], lineString[i][1], zFunc, 0.8);
    }
    */

    return pts;
};

Gba3D.DEMLayer.prototype.setVisible = function (visible) {
    Gba3D.MapLayer.prototype.setVisible.call(this, visible);
    if (visible && this.sideVisible === false) this.setSideVisibility(false);
};

Gba3D.DEMLayer.prototype.setSideVisibility = function (visible) {
    this.sideVisible = visible;
    this.blocks[0].aObjs.forEach(function (obj) {
        obj.visible = visible;
    });
};





////////////////////BLOCK/////////////////////////////
Gba3D.DEMBlock = function (params) {
    for (var k in params) {
        this[k] = params[k];
    }
    this.aObjs = [];
};

Gba3D.DEMBlock.prototype = {

    constructor: Gba3D.DEMBlock,

    build: function (layer) {
        var xPixel = this.width;
        var widthSegments = xPixel - 1; //this.width = xPixel
        var yPixel = this.height;
        var heightSegments = yPixel - 1;

        //var PlaneGeometry = (Q3D.Options.exportMode) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry,
        var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
        var dem_data = this.data;

        //// Filling of the DEM plane
        var vertices = geom.attributes.position.array;
        for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            // x
            //vertices[i] = defaultVertices[i] + (rand(-opts.variance.x, opts.variance.x));
            // y
            //vertices[i + 1] =
          
            //z
            vertices[j + 2] = dem_data[i];   
        }
        //if (Gba3D.Options.exportMode) {
        //  for (var i = 0, l = geom.vertices.length; i < l; i++) {
        //    geom.vertices[i].z = dem_data[i];
        //  }
        //}
        //else {
        //  var vertices = geom.attributes.position.array;
        //  for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        //    vertices[j + 2] = dem_data[i];
        //  }
        //}

        // Calculate normals
        if (layer.shading) {
            geom.computeFaceNormals();
            geom.computeVertexNormals();
        }

        //var material = new THREE.MeshPhongMaterial({ color: 0x223322, wireframe: true });
        //var mesh = new THREE.Mesh(geom, material);
        var mesh = new THREE.Mesh(geom, layer.materials[this.mIndex].mat);

        //if (this.plane.offsetX != 0) mesh.position.x = this.plane.offsetX;
        //if (this.plane.offsetY != 0) mesh.position.y = this.plane.offsetY;
        mesh.userData.layerId = layer.index;
        this.obj = mesh;
        layer.addObject(mesh);
    },

    buildSides: function (layer, material, bottomZ) {
        Gba3D.Options.exportMode = true;
        var PlaneGeometry = (Gba3D.Options.exportMode) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry;
        var band_width = 3;//-bottomZ * 2;
        var dem_data = this.data;
        var xPixel = this.width;//this.width = xPixel
        var widthSegments = xPixel - 1; //xPixel = w
        var yPixel = this.height;//this.height = yPixel
        var heightSegments = yPixel - 1;
        var HALF_PI = Math.PI / 2;
        var i, mesh;
        var bottom_data = this.bottomData;
       
        // front and back
        var geom_fr = new PlaneGeometry(this.plane.width, band_width, widthSegments, 1);
        var geom_ba = new PlaneGeometry(this.plane.width, band_width, widthSegments, 1);

        var k = xPixel * (yPixel - 1);
        if (Gba3D.Options.exportMode) {
            for (i = 0; i < xPixel; i++) {
            //for (var i = 0, l = geom_fr.vertices.length; i < l; i++) {
                geom_fr.vertices[i].y = dem_data[k + i];//obere Seite der Front
                geom_fr.vertices[xPixel + i].y = bottom_data[k + i]; //untere Seite der Front

                geom_ba.vertices[i].y = dem_data[xPixel - 1 - i];//obere Seite der Rückansicht
                geom_ba.vertices[xPixel + i].y = bottom_data[xPixel - 1 - i]; //untere Seite der Rückansicht
            }
        }
        //else {
        //    var vertices_fr = geom_fr.attributes.position.array;
        //    //var vertices_ba = geom_ba.attributes.position.array;

        //    for (i = 0; i < w; i++) {
        //        //vertices_fr[i * 3 + 1] = dem_data[k + i];
        //        //vertices_fr[i + 1] = dem_data[k+i];
        //        vertices_fr[i * 3 + 1] = dem_data[k + i];

        //        //vertices_ba[i * 3 + 1] = dem_data[w - 1 - i];
        //    }
        //}

        var material2 = new THREE.MeshPhongMaterial({
            color: 0xdddddd,
            wireframe: true
        });

        mesh = new THREE.Mesh(geom_fr, material);
        mesh.position.y = -this.plane.height / 2;
        mesh.rotateOnAxis(Gba3D.uv.i, HALF_PI);
        layer.addObject(mesh, false);
        this.aObjs.push(mesh);

        mesh = new THREE.Mesh(geom_ba, material);
        mesh.position.y = this.plane.height / 2;
        mesh.rotateOnAxis(Gba3D.uv.k, Math.PI);
        mesh.rotateOnAxis(Gba3D.uv.i, HALF_PI);
        layer.addObject(mesh, false);
        this.aObjs.push(mesh);

        // left and right
        //widtSegments = 1; heightSegments: yPixel - 1;
        var geom_left = new PlaneGeometry(1, this.plane.height, 1, heightSegments);
        var geom_right = new PlaneGeometry(band_width, this.plane.height, 1, heightSegments);

        if (Gba3D.Options.exportMode) {
            for (i = 0; i < yPixel; i++) {
                geom_left.vertices[i * 2 + 1].x = dem_data[xPixel * i];//1, 3, 5, 7, 9 //obere Seite der linken Front; es gibt 252 Pixel entlang von x
                //var test = h + (i * 2 + 1)
                geom_left.vertices[i * 2].x = bottom_data[xPixel * i];//0, 2, 4, 6, 5, 10 //untere Seite der linken Front

                geom_right.vertices[i * 2].x = -dem_data[xPixel * (i + 1) - 1];//obere Seite der rechten Front
                geom_right.vertices[i * 2 + 1].x = -bottom_data[xPixel * (i + 1) - 1];//untere Seite der rechten Front
            }
        }
        //else {
        //    var vertices_le = geom_left.attributes.position.array,
        //        vertices_ri = geom_right.attributes.position.array;

        //    for (i = 0; i < h; i++) {
        //        vertices_le[(i * 2 + 1) * 3] = dem_data[w * i];
        //        vertices_ri[i * 2 * 3] = -dem_data[w * (i + 1) - 1];
        //    }
        //}
        mesh = new THREE.Mesh(geom_left, material);
        mesh.position.x = -this.plane.width / 2;
        mesh.rotateOnAxis(Gba3D.uv.j, -HALF_PI);
        layer.addObject(mesh, false);
        this.aObjs.push(mesh);

        mesh = new THREE.Mesh(geom_right, material);
        mesh.position.x = this.plane.width / 2;
        //mesh.rotateOnAxis(Gba3D.uv.j, HALF_PI);
        mesh.rotateOnAxis(Gba3D.uv.j, THREE.Math.degToRad(90));
        layer.addObject(mesh, false);
        this.aObjs.push(mesh);



        // bottom
        Gba3D.Options.exportMode = false;
        if (Gba3D.Options.exportMode) {
            var geom = new THREE.PlaneGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
        }
        else {
            //var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, 1, 1);
            var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
        }

        if (this.bottomData) {
            var dem_data = this.bottomData;
            //mesh.position.z = bottomZ;
            //mesh.rotateOnAxis(Gba3D.uv.i, Math.PI);
            //// Filling of the DEM plane
            var vertices = geom.attributes.position.array;
            for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                // x
                //vertices[i] = defaultVertices[i] + (rand(-opts.variance.x, opts.variance.x));
                // y
                //vertices[i + 1] =

                //z
                vertices[j + 2] = dem_data[i];
            }
        }

        mesh = new THREE.Mesh(geom, material);
        if (!this.bottomData) {
            mesh.position.z = bottomZ;
        }

        layer.addObject(mesh, false);
        this.aObjs.push(mesh);
    }

    

};


