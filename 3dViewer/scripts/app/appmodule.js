define('app/appmodule', ['three',
    "app/commonConfig",
    "lib/proj4js/proj4js-amd",  
    "gba/controls/Map",
    "helper/utilities",
    "i18n!nls/template",
    "jquery",
    "gba/tasks/DxfIdentify", 
    "gba/controls/MobileDialog",
    "gba/controls/BasemapDialog",
    "gba/controls/Legend",
    "gba/controls/MobilePopup",
    "gba/controls/Popup",
    "gba/controls/BoreholePopup",   
    "helper/dom",
    "helper/domUtil",
    "helper/domEvent", "gba/controls/Fullscreen",'gba/layer/GridLayer','gba/controls/NorthArrow',
    "gba/controls/ControlButton",
    "gba/tasks/BoreHole",  
    "gba/controls/Slider", "gba/controls/LayerControl", "gba/controls/BorderControl", "gba/controls/MoreControls", "lib/jrespond/jRespond"],
    function (THREE, appSettings, Proj4js,
        map,
        util, i18n, $,
        DxfIdentify, Dialog, BasemapDialog, Legend, MobilePopup, Popup, BoreholePopup, dom, domUtil, domEvent, Fullscreen, GridLayer, NorthArrow,
        ControlButton, BoreHole, Slider, LayerControl, BorderControl, MoreControls, jRespond) {
        "use strict";

    var app = {

        init: function (container, dataservice) {
            app.collapse = false;

            app.container = container;
            app.running = false;
            app.dialog = new Dialog("Help", { klass: "fm_about" });
            //app.basemapDialog = new BasemapDialog("Basemap", { klass: "fm_basemap_list", contentId: "basemapList" });

            if (container.clientWidth && container.clientHeight) {
                app.width = container.clientWidth;
                app.height = container.clientHeight;
                app._fullWindow = false;
            } else {
                app.width = window.innerWidth;
                app.height = window.innerHeight;
                app._fullWindow = true;
            }

            var title = app.title = dataservice.title || i18n.viewer.mainPanel.title;
            //var description = dataservice.description || i18n.viewer.sidePanel.description;           
            document.getElementById('legendHeaderText').innerHTML = title;
            //document.getElementById('descriptionText').innerHTML = description;
            document.getElementById('footerText').innerHTML = i18n.viewer.footer.owner;
            //document.getElementById('creativeCommons').innerHTML = app._createCreativeCommonLogo('Copyright GBA, http://creativecommons.org/licenses/by-nc-nd/3.0/at/'); // configOptions.accessConstraints;
           

            /* Renderer */
            var bgcolor = 0xfdfdfd;//appSettings.Options.bgcolor;
            app.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            //app.renderer = new THREE.CanvasRenderer({ alpha: true });
            //app.renderer = app.webglAvailable() ? new THREE.WebGLRenderer({ alpha: true }) : new THREE.CanvasRenderer({ alpha: true });
            app.renderer.setSize(app.width, app.height);
            app.renderer.setClearColor(bgcolor, 1); // second param is opacity, 0 => transparent
            //document.getElementById('WebGL-output').appendChild(renderer.domElement);
            app.container.appendChild(app.renderer.domElement);

            /* Scene: that will hold all our elements such as objects, cameras and lights. */
            app.scene = new THREE.Scene();
            //app.scene.add(new THREE.AmbientLight(0xeeeeee));
            app._buildDefaultLights(app.scene);
            //app.scene.autoUpdate = false;
            //// show axes in the screen
            //app.scene.add(new THREE.AxisHelper(100));

            /* Camera */
            var angle = 45;
            var aspect = app.width / app.height;
            var near = 0.1; //This is the distance at which the camera will start rendering scene objects
            var far = 1000; //Anything beyond this distance will not be rendered                  
            app.camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
            app.camera.position.set(0, -0.1, 150);
            //app.camera.position.set(30, 50, 120);         
            //app.camera.lookAt(app.scene.position);
            app.camera.lookAt(new THREE.Vector3(0, 0, 0));

            /* Controls */
            //app.controls = controls.create(app.camera, app.scene, app.renderer.domElement);           
            app.controls = new map(app.camera, app.scene, app.renderer.domElement, container, dataservice);
           
            //create basemapDialog
            app.basemapDialog = new BasemapDialog("Basemap", {
                klass: "fm_basemap_list",
                contentId: "basemapList",
                map: app.controls
            });            
          
            //creating the popup for identify
            dom.createDom("div", { id: "identifyDiv" }, container, 'first');// document.getElementsByTagName("body")[0]);
            var popupClass = util.hasTouch() ? MobilePopup : Popup;
            app.popup = new popupClass({ domElement: app.renderer.domElement }, "identifyDiv");
            app.popup.addTo(app.controls);
                     
            app._queryableObjects = [];
            app.queryObjNeedsUpdate = true;

            // label
            app.labelVisibility = appSettings.Options.label.visible;
            app.labelConnectorGroup = new THREE.Group();
            app.labels = [];     // labels of visible layers
            // root element for labels
            var e = document.createElement("div");
            e.style.display = (app.labelVisibility) ? "block" : "none";           
            //e.style.className = 'label';           
            app.container.appendChild(e);
            app.labelRootElement = e;

            //create invisible grid layyer
            app.controls.gridlayer = new GridLayer().addTo(app.controls);
            app.controls.gridlayer.buildLabels(app.labelConnectorGroup, app.labelRootElement);
            app.labels = app.labels.concat(app.controls.gridlayer.labels);
            if (app.labels.length) {
                app.scene.add(app.labelConnectorGroup);
            }
                       
            app._wireframeMode = false;

            /* Inset */
            var inset = document.getElementById('inset');
            app.insetWidth = inset.clientWidth;
            app.insetHeight = inset.clientHeight;
            app.renderer2 = new THREE.WebGLRenderer({ alpha: true });
            //app.renderer2 = app.webglAvailable() ? new THREE.WebGLRenderer({ alpha: true }) : new THREE.CanvasRenderer({ alpha: true });
            app.renderer2.setSize(130, 130);
            inset.appendChild(app.renderer2.domElement);
            app.scene2 = new THREE.Scene();
            app.camera2 = new THREE.PerspectiveCamera(60, 1, 1, 1000);// new THREE.PerspectiveCamera(angle, aspect, near, far);
            app.camera2.up = app.camera.up;           
            app.scene2.add(app.camera2);
            //app.scene2.add(app._makeCoordinateArrows());
            var northArrow = app.northArrow = NorthArrow.create({ headLength: 1, headWidth: 1 });
            app.scene2.add(northArrow.objectGroup);
            northArrow.buildLabels(inset);
            app.insetLabels = northArrow.labels;

            app.setBindings();
            app.generateEmbedCode();
            app.setResponsive();
            //if (!(fm.collapse)) fm.setActiveTab(".fm_details_trigger"); //parte con la descrizione aperta
            if (!(app.collapse)) {
                app.setActiveTab(".legend_button");
            }
           
        },
         
        // update label position
        _updateLabelPosition : function () {
            if (!app.labelVisibility || app.labels.length == 0|| app.controls.gridlayer.objectGroup.visible === false) return;

            var widthHalf = app.width / 2,
                heightHalf = app.height / 2,
                autosize = appSettings.Options.label.autoSize,
                camera = app.camera,
                camera_pos = camera.position,
                c2t = app.controls.target.clone().sub(camera_pos),
                c2l = new THREE.Vector3(),
                v = new THREE.Vector3();
            //neu
            app.labels = app.controls.gridlayer.labels;
            var scaleFactor = app.controls.gridlayer.scale;

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

            var label, labelDiv, x, y, dist, fontSize;
            var minFontSize = appSettings.Options.label.minFontSize;
            for (var i = 0, l = idx_dist.length; i < l; i++) {
                label = app.labels[idx_dist[i][0]];
                labelDiv = label.labelDiv;
                if (c2l.subVectors(label.pt, camera_pos).dot(c2t) > 0) {
                    // label is in front
                    // calculate label position
                    v.copy(label.pt);                   
                    if (scaleFactor > 1) {
                        v.z = v.z * scaleFactor;                        
                    }
                    v.project(camera);
                  
                    x = (v.x * widthHalf) + widthHalf;
                    y = -(v.y * heightHalf) + heightHalf;
                   
                    // set label position
                    labelDiv.style.display = "block";
                    labelDiv.style.left = (x - (labelDiv.offsetWidth / 2)) + "px";
                    labelDiv.style.top = (y - (labelDiv.offsetHeight / 2)) + "px";
                    labelDiv.style.zIndex = i + 1;

                    //// set font size
                    //if (autosize) {
                    //    dist = idx_dist[i][1];
                    //    if (dist < 10) dist = 10;
                    //    fontSize = Math.max(Math.round(1000 / dist), minFontSize);
                    //    e.style.fontSize = fontSize + "px";
                    //}
                }
                else {
                    // label is in back
                    labelDiv.style.display = "none";
                }
            }
        },

        _updateInsetLabelPosition: function(){
            var widthHalf = app.insetWidth / 2;
            var heightHalf = app.insetHeight / 2;
            var autosize = appSettings.Options.label.autoSize;
            var camera = app.camera2;
            var camera_pos = camera.position;
            var target = new THREE.Vector3(0, 0, 0);
            var c2t = target.sub(camera_pos);
            var c2l = new THREE.Vector3();
            var v = new THREE.Vector3();
       
            // make a list of [label index, distance to camera]
            var idx_dist = [];
            for (var i = 0, l = app.insetLabels.length; i < l; i++) {
                idx_dist.push([i, camera_pos.distanceTo(app.insetLabels[i].pt)]);
            }

            // sort label indexes in descending order of distances
            idx_dist.sort(function (a, b) {
                if (a[1] < b[1]) return 1;
                if (a[1] > b[1]) return -1;
                return 0;
            });

            var label, labelDiv, x, y, dist, fontSize;
            var minFontSize = appSettings.Options.label.minFontSize;
            for (var i = 0, l = idx_dist.length; i < l; i++) {
                label = app.insetLabels[idx_dist[i][0]];
                labelDiv = label.labelDiv;
                if (c2l.subVectors(label.pt, camera_pos).dot(c2t) > 0) {
                    // label is in front
                    // calculate label position
                    v.copy(label.pt);                   
                    v.project(camera);

                    x = (v.x * widthHalf) + widthHalf;
                    y = -(v.y * heightHalf) + heightHalf;

                    // set label position
                    labelDiv.style.display = "block";
                    labelDiv.style.left = (x - (labelDiv.offsetWidth / 2)) + "px";
                    labelDiv.style.top = (y - (labelDiv.offsetHeight / 2)) + "px";
                    labelDiv.style.zIndex = i + 1;
                    
                }
                else {
                    // label is in back
                    labelDiv.style.display = "none";
                }
            }

        },
        
        setResponsive: function () {

            app.jRes = jRespond([
			{
			    label: 'phone',
			    enter: 0,
			    exit: 767
			}, {
			    label: 'tab',
			    enter: 768,
			    exit: 1279
			    //exit: 1024
			},
            //{
			//    label: 'laptop',
			//    enter: 1025,
			//    exit: 1279
            //},
            {
			    label: 'desktop',
			    enter: 1280,
			    exit: 100000
			}
            ]);

            app.jRes.addFunc({
                breakpoint: 'desktop',
                enter: function () {
                    //$(".fm_left_content").show();
                    $(".sidebar_right").show();
                    $(".gba_close.hide_closebtn").hide();
                    app.collapse = false;

                    ////switch to standard popups
                    //switchToDesktop();
                    //console.log('>>> desktop enter <<<');
                },
                exit: function () {
                    $(".gba_close.hide_closebtn").show();
                    app.collapse = true;
                    //console.log('<<< desktop exit >>>');
                }
            });
            //app.jRes.addFunc({
            //    breakpoint: 'laptop',
            //    enter: function () {
            //        $(".fm_left_content").show();
            //        $(".sidebar_right").show();
            //        $(".fm_left_content.collapse_first").hide();
            //        $(".fm_right_content.collapse_first").hide();
            //        $(".gba_close.hide_closebtn").hide();
            //        app.collapse = false;
            //        //switch to standard popups
            //        //switchToDesktop();
            //        console.log('>>> laptop enter <<<');
            //    },
            //    exit: function () {
            //        $(".gba_close.hide_closebtn").show();
            //        app.collapse = true;
            //        console.log('<<< laptop exit >>>');
            //    }
            //});
            app.jRes.addFunc({
                breakpoint: 'tab',
                enter: function () {
                    //hideZoomControl();
                    //$(".fm_left_content").hide();
                    $(".sidebar_right").hide();
                    app.collapse = true;
                    app.setActiveTab(null);
                    //switch to standard popups
                    //switchToDesktop();
                    //console.log('>>> tab enter <<<');
                },
                exit: function () {
                    //console.log('<<< tab exit >>>');
                    //showZoomControl();                   
                    //$(".sidebar_right").show();
                    //app.collapse = false;
                }
            });

            app.jRes.addFunc({
                breakpoint: 'phone',
                enter: function () {
                    //hideZoomControl();
                    //$(".fm_overlay").draggable('disable');
                    app.mobile = true;
                    app.collapse = true;
                    app.setActiveTab(null);
                    //$(".fm_show").hide();
                    //$(".fm_left_content").hide();
                    $(".sidebar_right").hide();

                    //switch to mobile popups
                    //switchToMobile();
                    //console.log('>>> phone enter <<<');
                },
                exit: function () {
                    //showZoomControl();
                    //$(".fm_overlay").draggable('enable');
                    app.mobile = false;
                    app.collapse = false;

                    //$(".fm_show").show();
                    //$(".fm_left_content").show();
                    //$(".sidebar_right").show();
                    //console.log('<<< phone exit >>>');
                }
            });

        },

        generateEmbedCode : function(){
            var pageUrl = window.location.href;
            //var code = "<iframe src='" + pageUrl + "' style='border:0px  none;' name='responsiveViewer' scrolling='no' frameborder='0' marginheight='0px' marginwidth='0px' height='60px' width='468px'></iframe>";
		
            var newcode = '<iframe src="' + pageUrl + '" frameborder="0" margin scrolling="no" style="width:100%;height:100%;" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
		
            $(".fm_embed_code").html(newcode);

            var title = app.title || i18n.viewer.mainPanel.title;
            var twitterUrl = "http://twitter.com/intent/tweet?" +
           "url=" + encodeURIComponent("http://gisgba.geologie.ac.at/3dViewer/index.html") +
           "&amp;text=" + encodeURIComponent(title);

            var facebook_url = "http://www.facebook.com/sharer.php?" +
                "s=100" +
                "&p[url]=" + encodeURIComponent("http://gisgba.geologie.ac.at/3dViewer/index.html") +
                 "&p[title]=" + encodeURIComponent(title);

            var google_url = "https://plus.google.com/share?" +
                "url=" + encodeURIComponent("http://gisgba.geologie.ac.at/3dViewer/index.html");


            var buttons = '<a  class="share-facebook" target="_blank"  href="' + facebook_url + '" rel="nofollow">Facebook</a>' +                           
                             '<a class="share-twitter" target="_blank" data-lang="de" href="' + twitterUrl + '" rel="nofollow">Twitter</a>' +                          
                            '<a class="share-google" target="_blank" href="' + google_url + '">Google+</a>';
            $("#socialButtons").html(buttons);
        },

        setBindings: function () {
            $('a.email').each(function () {
                var e = this.rel.replace('#/#', '@'); // replace #/# by @               
                this.href = 'mailto:' + e; // add mailto and href instead of rel
            });

            $(".gba_trigger").click(function (e) {
                e.preventDefault();
                app.setActiveTab(this);
                var panel = $(this).data('panel');
                app.showPanel(panel);
            });

            $(".gba_close").click(function () {
                if ($(this).hasClass('hide_closebtn')) {
                    $(this).hide();
                }
                $(this).parent().hide();
                if (app.collapse) {
                    app.setActiveTab(null);
                }
            });


            $(".about_button").click(function (e) {
                e.preventDefault();
                if (app.collapse) {
                    app.setActiveTab(null);
                    $(".sidebar_right").hide();
                }
                //$(".fm_basemap_list").hide();
                app.basemapDialog.hide();

                //$(".fm_about").toggle();
                app.dialog.show();
                return false;
            });
            $(".basemap_button").click(function (e) {
                e.preventDefault();
                if (app.collapse) {
                    app.setActiveTab(null);
                    $(".sidebar_right").hide();
                }
                //$(".fm_about").hide();
                app.dialog.hide();

                //$(".fm_basemap_list").toggle();
                app.basemapDialog.show("Click to save the image to a file.");
                return false;
            });
           

            $("#searchText").change(function (e) {
                e.preventDefault();
                var value = document.getElementById("searchText").value;
                if (value === "left") {
                    //from east
                    app.camera.position.set(-150, 0, 0);
                }
                else if (value === "right") {
                    //from west
                    app.camera.position.set(+150, 0, 0);
                }
                else if (value === "front") {
                    //from front
                    app.camera.position.set(0, -150, 0);
                }
                else if (value === "back") {
                    //from back
                    app.camera.position.set(0, +150, 0);
                }
                else if (value === "bottom") {
                    //from bottom
                    app.camera.position.set(0,1, -150);
                }
                app.controls.target.x = app.controls.target0.x;
                app.controls.target.y = app.controls.target0.y;
                app.controls.target.z = app.controls.target0.z;
                //app.camera.lookAt(app.scene.position);
                //app.camera.lookAt(app.controls.target);
                app.controls.update();

                return false;
            });

            //wirframe mode
            var chkWireframe = document.getElementById("chkWireframe");
            domEvent.on(chkWireframe, 'click', app._setWireframeMode, app);

            //fullscreen mode
            //var chkFullscreen = document.getElementById("chkFullscreen");
            //domEvent.on(chkFullscreen, 'click', app._setWireframeMode, app);
            Fullscreen.create({ containerSelector: "webgl", checkboxId: "chkFullscreen" });

            //BgColor.create({ containerSelector: "webgl", inputId: "ftbgcolor", renderer:  app.renderer, map: app.controls });

            //take a screenshot
            var btnScreenshot = document.getElementById("btnScreenshot");
            domEvent.on(btnScreenshot, 'click', function (e) {
                e.preventDefault();
                // render
                app.renderer.preserveDrawingBuffer = true;
                app.renderer.render(app.scene, app.camera);
                //get base64 image
                var imgUrl = app.getScreenshot();
                //window.open(imgUrl, 'gba3dScreenshot');
                var image = new Image();
                image.src = imgUrl;//"data:image/jpg;base64," + data.d;
                var w = window.open("", 'gba3dScreenshot');
                w.document.write(image.outerHTML);
            }, app);

            //toggle GridLayer
            var chkGrid = document.getElementById("chkGrid");
            domEvent.on(chkGrid, 'click', function (e) {               
                app.controls.gridlayer.toggle();
            }, app);

        },

        getScreenshot : function(){
            var url = "";
            var backend;
            var canvas = app.renderer.domElement;
            if(canvas){
                if(backend==="flash"){url=canvas.getScreenshot();}
                else {
                    var canvas2d = document.createElement("canvas");
                    canvas2d.width = canvas.width;
                    canvas2d.height = canvas.height;
                    var ctx = canvas2d.getContext("2d");
                    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
                    ctx.scale(1, -1);
                    ctx.translate(0, -canvas.height);
                    url = canvas2d.toDataURL();
                }
            }
            return url;
        },

        setActiveTab : function(tab){
            $(".gba_button").each(function(){
                $(this).removeClass('gba_active_button');
            });
            if (tab) {
                $(tab).addClass('gba_active_button');
            }
        },

        showPanel : function(panel){
            $(".sidebar_right").show();
            if (app.collapse){ 
                $(".sidebar_right").find(".gba_close").show();
                //x erneut anzeigen im tab und phone modus
            }
            //hide all panels
            $(".gba_panel").hide();
            //show only one panel
            var panelClass = '.' + panel;           
            $(panelClass).show();
        },

        highlightFeature : function (layerId, featureId) {
            //if (app.highlightObject) {
            //    // remove highlight object from the scene
            //    app.scene.remove(app.highlightObject);
            //    app.selectedLayerId = null;
            //    app.selectedFeatureId = null;
            //    app.highlightObject = null;
            //}

            if (layerId === null) return;

            var layer = app.dataservice.layers[layerId];
            if (layer === undefined) return;           

            var f = layer.features[featureId];
            if (f === undefined) return;

            var high_mat = app.highlightMaterial;
            //var setMaterial = function (obj) {
            //    obj.material = high_mat;
            //};

            // create a highlight object (if layer type is Point, slightly bigger than the object)
            var highlightObject = new THREE.Group();
            //var clone;
            //var s = (layer.type == Q3D.LayerType.Point) ? 1.01 : 1;

            var geo = new THREE.Geometry();
            var v1 = new THREE.Vector3(f.Punkt0.x, f.Punkt0.y, f.Punkt0.z);
            var v2 = new THREE.Vector3(f.Punkt1.x, f.Punkt1.y, f.Punkt1.z);
            var v3 = new THREE.Vector3(f.Punkt2.x, f.Punkt2.y, f.Punkt2.z);
            geo.vertices.push(v1);
            geo.vertices.push(v2);
            geo.vertices.push(v3);
            var face = new THREE.Face3(0, 1, 2);
            geo.faces.push(face);
            //clone.traverse(setMaterial);           
            var clone = new THREE.Mesh(geo, high_mat);
            highlightObject.add(clone);
            
            //for (var i = 0, l = f.objs.length; i < l; i++) {
            //    clone = f.objs[i].clone();
            //    clone.traverse(setMaterial);
            //    //if (s != 1) clone.scale.set(clone.scale.x * s, clone.scale.y * s, clone.scale.z * s);
            //    highlightObject.add(clone);
            //}

            // add the highlight object to the scene
            app.scene.add(highlightObject);

            app.selectedLayerId = layerId;
            app.selectedFeatureId = featureId;
            app.highlightObject = highlightObject;
        },     

        /* COORDINATE ARROWS */
        _makeCoordinateArrows: function() {
            var coordinateArrows = new THREE.Object3D();
            var org = new THREE.Vector3(0, 0, 0);
            var headLength = 1; var headWidth = 1;
            var sprite_parameters = {
                fontsize: 7,
                //fontcolor: { r: 255, g: 0, b: 0, a: 1.0 }
            };

            var direction = new THREE.Vector3(1, 0, 0);
            //coordinateArrows.add(new THREE.ArrowHelper(direction, org, 6, 0xFF0000, headLength, headWidth)); // Red = x
            //var spriteyX = this._makeTextSprite('x', sprite_parameters);
            //spriteyX.position.set(7, 0, 1);
            //coordinateArrows.add(spriteyX);

            direction = new THREE.Vector3(0, 1, 0);
            coordinateArrows.add(new THREE.ArrowHelper(direction, org, 6, 0x00FF00, headLength, headWidth)); // Green = y
            //var spriteyY = this._makeTextSprite('y', sprite_parameters);
            //spriteyY.position.set(0, 7,1);
            //coordinateArrows.add(spriteyY);
    
            direction = new THREE.Vector3( 0, 0, 1 );//blue z
            coordinateArrows.add(new THREE.ArrowHelper(direction, org, 6, 0x0000FF, headLength, headWidth)); //8 is the length,  Blue = z; 20 and 10 are head length and width
            //var spriteyZ = this._makeTextSprite('z', sprite_parameters);
            //spriteyZ.position.set(0, 0, 8);
            //coordinateArrows.add(spriteyZ);
           

            

           
    
            return coordinateArrows;
        },
             
        loadData: function (dataservice) {
            app.dataservice = dataservice;
            ////show coordinates
            //app.coordinates = new Coordinates({ camera: app.camera, dataservice: app.dataservice }).addTo(app.controls);

            var moreControl = new MoreControls().addTo(app.controls);
            ////add help button
            //var helpButton = new ControlButton({ className: 'gba-control-help', innerHtml: '?', zoomInTitle: 'Info' }).addTo(app.controls);
            //helpButton.on('click', function () {
            //    app.dialog.show();   
            //});

            //var borderButton = new ControlButton({ className: 'gba-control-border', zoomInTitle: 'create geometry' }).addTo(app.controls);
            //borderButton.on('click', function () {
            //    //app.dialog.show(); 

            //    //alert("start");
            //    //util.setLoading("webgl");
            //    app.dataservice.layers[1].buildTriangleBorder();
            //    app.dataservice.layers[2].buildTriangleBorder();
            //    app.dataservice.layers[3].buildTriangleBorder();
            //    app.dataservice.layers[4].buildTriangleBorder();
            //    app.dataservice.layers[5].buildTriangleBorder();
            //    app.dataservice.layers[6].buildTriangleBorder2();
            //    //alert("Fertig");
            //    //util.unsetLoading("webgl");
            //    app.controls.update();
            //});

            ////add print button
            //var printButton = new ControlButton({ className: 'gba-control-print', zoomInTitle: 'Print' });
            //printButton.addTo(app.controls);
            //printButton.on('click', function () {
            //    app.saveCanvasImage();
            //});

            //slider for scaling z value
            var slider = new Slider({ layers: app.dataservice.layers });
            slider.addTo(app.controls);   
           
          
            var map = app.controls;          
            var index;          
            for (index = 0; index < app.dataservice.layers.length; ++index) {
                var layer = app.dataservice.layers[index];
                map.addLayer(layer);
                if (index === 0) {
                    map.currentBasemap = layer;
                }
            }
            


            util.showLoading();
            var work1 = map.dataservice.layers[1].asyncBuildBorder(true);
            var work2 = map.dataservice.layers[2].asyncBuildBorder(true);
            var work3 = map.dataservice.layers[3].asyncBuildBorder(true);
            var work4 = map.dataservice.layers[4].asyncBuildBorder(true);
            var work5 = map.dataservice.layers[5].asyncBuildBorder(true);
            var work6 = map.dataservice.layers[6].asyncBuildBorder(false);

            $.when(work1, work2, work3, work4, work5, work6).then(function () {              
                util.hideLoading();
                var borderControl = new BorderControl(app.dataservice.layers, {});
                borderControl.addTo(app.controls);
                map.update();
            }).fail(function () {              
                util.hideLoading();
            });
                   
            app.legend = new Legend(app.dataservice.layers, app.controls);
            $(".legend_panel").show();

            //control for switsching basemap         
            //var overlayMaps = {               
            //    "selected points": app.dataservice.layers[0],
            //    "selected polygons": app.dataservice.layers[1]
            //};
            var layerControl = new LayerControl({}, app.dataservice.layers, {
                collapsed: true
            }).addTo(app.controls);
            


            // update matrix world here
            app.scene.updateMatrixWorld();
            app.highlightMaterial = new THREE.MeshLambertMaterial({ emissive: 0x999900, transparent: true, opacity: 0.5 });
            //app.highlightMaterial.side = THREE.DoubleSide;   

            //setup Identify:
            app.setupIdentify(app.dataservice.layers);
            // create a marker for queried point
            var opt = { r: 0.25, c: 0xffff00, o: 0.8 };
            app.queryMarker = new THREE.Mesh(new THREE.SphereGeometry(opt.r),
                                              new THREE.MeshLambertMaterial({ color: opt.c, opacity: opt.o, transparent: (opt.o < 1) }));
            app.queryMarker.visible = false;
            app.scene.add(app.queryMarker);

            //THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
            app.boreholeMarker = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5,2),
                                             new THREE.MeshLambertMaterial({ color: 0x38eeff, opacity: opt.o, transparent: (opt.o < 1) }));
            app.boreholeMarker.rotation.x = THREE.Math.degToRad(-90);
            app.boreholeMarker.visible = false;
            app.scene.add(app.boreholeMarker);

            app.selectedLayerId = null;
            app.selectedFeatureId = null;
            app.highlightObject = null;

           app.controls.on('clicked', app.doIdentify);                      
            //To avoid memory leaks, you should remove listeners when the application is being closed. 
            app.controls.on("unload", function () {

                app.controls.off('clicked', app.doIdentify);
                app.popup.destroy();
                //app.queryMarker
            });


            app._addEventListeners();
        },

        //_showLoading : function () {
        //    domUtil.show(app._loading);
        //    //map.disableMapNavigation();            
        //},

        //_hideLoading : function () {
        //    domUtil.hide(app._loading);
        //    //map.enableMapNavigation();            
        //},
        
        /**
        * Method:    start       
        * Access:    public 
        * Qualifier: start rendering loop
        * @param    
        * @return   void
        */
        start : function () {
            app.running = true;          
            //if (app.controls) {
            //    app.controls.enabled = true;
            //    app.controls.update();
            //}
            app.controls.on('change', app._animate); // add this only if there is no animation loop (requestAnimationFrame)
            app._animate();          
        },
       
        _createCreativeCommonLogo : function (accessConstraintsText) {       
            var accessConstraints = accessConstraintsText.split(',');
            if (accessConstraints.length < 2) {
                return "<span>" + accessConstraintsText + "</span>";
            }
            var url = accessConstraints[1];
            //var copyRightext = accessConstraints[0];

            //var url = accessConstraintsText;

            if (app._validate(url) === true) {
                if (url.indexOf("http://creativecommons.org/licenses/") !== -1) {
                    var link = '<a rel="license" href="' + url + '" target="_blank">' +
                       '<img alt="Creative Commons Lizenzvertrag" style="border-width:0" src="content/img/cc_logo.png" />' +
                       '</a>';// +               
                    var copyrightText = " &#8701; Klicken Sie hier zu Datennutzung und copyright";// url.replace("http://creativecommons.org/licenses/", "");
                    copyrightText = "<span>" + copyrightText + "</span>";
                    return link + " " + copyrightText;
                }
            }
            return "<span>" + accessConstraintsText + "</span>";
        },

        _validate : function (url) {
        var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (pattern.test(url)) {
            //alert("Url is valid");
            return true;
        }
        //alert("Url is not valid!");
        return false;
    },

        // animation loop
        _animate : function () {
            if (app.running) {

                //setTimeout(function () {
                //    requestAnimationFrame(app._animate);
                //}, 1000 / 30);

                app.camera2.position.copy(app.camera.position);               
                app.camera2.position.setLength(18);
                app.camera2.lookAt(app.scene2.position);
            }
            //if (app.controls) {
            //    app.controls.update();
            //}
            app._render();
        },
       
        _render : function () {
            app.renderer.render(app.scene, app.camera);
            app.renderer2.render(app.scene2, app.camera2);

            app._updateLabelPosition();
            app._updateInsetLabelPosition();
        },

        _addEventListeners: function () {         
            window.addEventListener("keydown", app._keydown);
            window.addEventListener("resize", app._resize);

            //if (map) map.remove();            
        },

        _resize: function () {
            if (app._fullWindow) {
                app._setCanvasSize(window.innerWidth, window.innerHeight);
            }
            else {
                app._setCanvasSize(app.container.clientWidth, app.container.clientHeight);
            }            
        },

        _setCanvasSize : function (width, height) {
            app.width = width;
            app.height = height;
            app.camera.aspect = width / height;
            app.camera.updateProjectionMatrix();
            app.renderer.setSize(width, height);
            app.camera.updateProjectionMatrix();

            app._render();
        },

        _keydown: function (e) {
            if (e.ctrlKey || e.altKey) return;
            var keyPressed = e.which;
            if (!e.shiftKey) {
                //if (keyPressed == 27) app.closePopup(); // ESC
                if (keyPressed === 73) {// I
                    app.dialog.show();
                    //app.controls.rotateLeft(- Math.PI/90);
                    //app.controls.dollyOut();
                }                
                else if (keyPressed === 87) {
                    app._setWireframeMode();    // W
                }
            }
            //else {
            //    if (keyPressed === 82) app.controls.reset();   // Shift + R
                    
            //}          
        },

        _setWireframeMode: function () {
            var wireframe = !app._wireframeMode;
            if (wireframe === app._wireframeMode) return;

            app.dataservice.layers.forEach(function (layer) {
                layer.setWireframeMode(wireframe);
            });
            app._wireframeMode = wireframe;

            app._render();
        },

        _buildDefaultLights : function (parent) {
            var deg2rad = Math.PI / 180;

            // ambient light
            parent.add(new THREE.AmbientLight(0x999999));
            //parent.add(new THREE.AmbientLight(0xeeeeee));

            // directional lights
            var opt = {
                azimuth: 220,   // note: default light azimuth of gdaldem hillshade is 315.
                altitude: 45    // altitude angle
            };
            //appSettings.Options.light.directional;
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
        },

        setupIdentify: function (layers) {           
            //app.tasks = layers.map(function (layer) {
            //    if (layer.type === "DxfLayer") {
            //        var deferred = new DxfIdentify({
            //            camera: app.camera,
            //            domElement: app.renderer.domElement,
            //            layer: layer,
            //            highlightMaterial: app.highlightMaterial                        
            //        });
            //        return deferred;
            //    }                
            //});

            app.task = new DxfIdentify({
                            camera: app.camera,
                            domElement: app.renderer.domElement,
                            //layer: layer,
                            highlightMaterial: app.highlightMaterial,
                            layers: layers
                        });
            //app.drillTask = new BoreholeIdentify({
            //    camera: app.camera,
            //    domElement: app.renderer.domElement,
            //    //layer: layer,
            //    highlightMaterial: app.highlightMaterial,
            //    layers: layers
            //});
        },

        doIdentify: function (event) {
            //app.coordinates.removeFrom(app.controls);


            var dxfIdentifyParams = {};
            dxfIdentifyParams.clientX = event.clientX;
            dxfIdentifyParams.clientY = event.clientY;
            dxfIdentifyParams.width = app.container.clientWidth;
            dxfIdentifyParams.height = app.container.clientHeight;

          
            var canvasOffset = $(app.renderer.domElement).offset();
            var xClickedOnCanvas = event.clientX - canvasOffset.left;
            var yClickedonCanvas = event.clientY - canvasOffset.top;           
           
            //wieder aktivieren:
            //var deferreds = app.tasks.map(function (task) {
            //    if (task instanceof DxfIdentify) {
            //        return task.execute(dxfIdentifyParams);
            //    }
               
            //}); 
            //$.when.apply($, deferreds).then(app.handleQueryResults);
                     
            var selectedMaptool = "Identify";
            //var maptools = document.getElementsByName("MaptoolMethode");
            //for (var i = 0; i < maptools.length; i++) {
            //    if (maptools[i].checked === true) {
            //        selectedMaptool = maptools[i].value;
            //    }
            //}

            var deferred;
            if (selectedMaptool === "Identify") {
                //app.popup.hide();
                //app.popup.show({
                //    x: xClickedOnCanvas,
                //    y: yClickedonCanvas
                //});
                deferred = app.task.execute(dxfIdentifyParams);
                deferred.then(app.handleQueryResults2);
            }
            //else {
                ////app.boreholePopup.hide();
                //app.boreholePopup.show();
                //deferred = app.drillTask.execute(dxfIdentifyParams);
                //deferred.then(app.handleQueryResults3);
            //}
            
        },

        //borehole identify
        handleQueryResults3: function () {
            var results = arguments;
            //var content = [];
            var features = results[0].features;
            var aufschlag = results[0].aufschlag;
            // query marker
            app.boreholeMarker.position.set(aufschlag.x, aufschlag.y, aufschlag.z);
            app.boreholeMarker.visible = true;
            //app.boreholeMarker.updateMatrixWorld();
        

            //app.boreHole = new BoreHole(app.scene, "d17100", 0, 0,
            //                         320, valTextColor, 'full', null,
            //                         {
            //                             row: "Product1",
            //                             col: "2010"
            //                         },
            //                          0,                                     
            //                           valHeight);   
            
            //for (var j = features.length - 1; j >= 0; j--) {
            //    var feature = features[j];
            //    var point = feature.point;
            //    var layerId = feature.layerId;
            //    var layer = app.dataservice.layers[layerId];
            //    var nextPoint;
            //    if (j !== features.length - 1) {
            //        var previousPoint = { x: features[0].point.x, y: features[0].point.y, z: features[j + 1].point.z };
            //        var barHeight = point.z - previousPoint.z;
            //        app.boreHole.addBar(0, 0, barHeight, layer.materialParameter[0].color);
            //    }
            //    //if (j === features.length - 1) {                
            //    //    var barHeight = point.z - (-50);
            //    //    app.boreHole.addBar(0, 0, barHeight, layer.materialParameter[0].color);
            //    //}
            //    //app.scene.add(feature.highlightFeature);
            //}

            //if (features.length > 0) {
            //    app.boreHole.reposition(features[0].point.x, features[0].point.y, features[0].point.z);
            //}  
                             

            var data = [];
            for (var j = features.length - 1; j >= 0; j--) {
                var feature = features[j];
                var point = feature.point;
                // clicked coordinates: skalierung wieder wegrechnen:
                var pt = app.dataservice.toMapCoordinates(point.x, point.y, point.z);

                var layerId = feature.layerId;
                var layer = app.dataservice.layers[layerId];
                //var nextPoint;
                if (j !== features.length - 1) {
                    var previousPoint = { x: features[j + 1].point.x, y: features[j + 1].point.y, z: features[j + 1].point.z };
                    var previousPt = app.dataservice.toMapCoordinates(previousPoint.x, previousPoint.y, previousPoint.z);

                    //var barHeight = point.z - previousPoint.z;

                    var realHeight = pt.z - previousPt.z;
                    //var dist = parseInt((300 / 6000) * realHeight);

                    data.push({
                        dist: realHeight,//dist,
                        max: pt.z,
                        min: previousPt.z,
                        color: layer.materialParameter[0].color,
                        name: layer.name
                    });
                    //app.barChart.addBar(dist, layer.materialParameter[0].color, layer.name);
                }               
            }          
            //app.barChart.draw(data);          
            //app.boreholePopup.setContent(app.barChart._container); 
            app.boreholePopup.setChartContent(data);          
            app._render();//wegen dem queryMarker
        },       

        //normal identify:
        handleQueryResults2: function () {
            var results = arguments;
            var content = [];
            var features = results[0].resultObjects;
            var xClickedOnCanvas = results[0].offsetX;
            var yClickedonCanvas = results[0].offsetY;

            if (features.length > 0) {
                app.popup.show({
                    x: xClickedOnCanvas,
                    y: yClickedonCanvas,
                    features: features
                });

                features.forEach(function (feature, j) {
                    // query marker
                    app.queryMarker.position.set(features[0].point.x, features[0].point.y, features[0].point.z);
                    app.queryMarker.visible = true;
                    app.queryMarker.updateMatrixWorld();

                    //app.scene.add(feature.highlightFeature);
                    content.push(app.showQueryResult(feature.point, feature.layerId, feature.featureId, feature.distance).join(""));
                });
                app.popup.setContent(content.join(""));
                app.popup.setTitle('Feature attributes');
                app._render();//wegen dem queryMarker
            }
            else {
                app.popup.hide();
            }
           
        },

        //allerestes identify mit array of tasks:
        handleQueryResults: function () {
            var results = arguments;
            var content = [];
            //var isEmpty = true;
            //var isHit = false;
            for (var i in results) {
                if (results.hasOwnProperty(i)) {
                    var features = results[i];                   

                    features.forEach(function (feature) {
                       
                        //// query marker
                        //app.queryMarker.position.set(features[0].point.x, features[0].point.y, features[0].point.z);
                        //app.queryMarker.visible = true;
                        //app.queryMarker.updateMatrixWorld();
                        //app._render();
                       
                        app.scene.add(feature.highlightFeature);
                        content.push(app.showQueryResult(feature.point, feature.layerId, feature.featureId, feature.distance).join(""));
                    });
                }
            }

            //if (isEmpty == true) {
            //    app.queryMarker.visible = false;
            //}          
            //app.dialog.show(content.join(""));
            app.popup.setContent(content.join(""));
            app.popup.setTitle('Feature attributes');
        },

        showQueryResult: function (point, layerId, featureId, distance) {
            var layer,content = [];
            if (layerId !== undefined) {
                // layer name
                //layer = app.dataservice.layers[layerId];
                layer = app.controls._layers[layerId];
                content.push('<table class="layer">');
                //content.push("<caption>Layer name</caption>");
                content.push("<tr><td><b>Layer: </b>" + layer.name + "</td></tr>");
                content.push("</table>");
            }

            // clicked coordinates: skalierung wieder wegrechnen:
            var pt = app.dataservice.toMapCoordinates(point.x, point.y, point.z);            

            content.push('<table class="coords">');
            content.push("<caption>Clicked coordinates</caption>");
            content.push("<tr><td>");

            var dest = new Proj4js.Proj("EPSG:4326");
            var source = new Proj4js.Proj(app.dataservice.crs);
            var minPoint = { x: pt.x, y: pt.y, spatialReference: { wkid: 31256 } };
            var point84 = Proj4js.transform(source, dest, minPoint);
            //var test = point84;
            //var sys84 = Proj4js.Proj.longlat(app.dataservice.config.proj).inverse([pt.x, pt.y]);
            content.push(util.convertToDMS(point84.x, point84.y) + ", Elev. " + pt.z.toFixed(2));
          

            content.push("</td></tr></table>");
           
            if (layerId !== undefined && featureId !== undefined) {
                // attributes
                content.push('<table class="attrs">');
                content.push("<caption>Attributes</caption>");
                //var f = layer.features[featureId];
              
                content.push("<tr><td><b>id: </b>" + featureId + "</td></tr>");
                //content.push("<tr><td><b>distance: </b>" + distance + "</td></tr>");
                content.push("</table>");
            }          
            return content;
        },
               
        saveCanvasImage : function () {
            //if (fill_background === undefined) fill_background = true;

            //// set canvas size
            //var old_size;
            //if (width && height) {
            //    old_size = [app.width, app.height];
            //    app.setCanvasSize(width, height);
            //}

            // functions
            var saveBlob = function (blob) {
                var filename = "image.png";

                // ie
                if (window.navigator.msSaveBlob !== undefined) {
                    window.navigator.msSaveBlob(blob, filename);
                    //app.popup.hide();
                }
                else {
                    // create object url
                    if (app._canvasImageUrl) {
                        URL.revokeObjectURL(app._canvasImageUrl);
                    }
                    app._canvasImageUrl = URL.createObjectURL(blob);

                    // display a link to save the image
                    var e = document.createElement("a");
                    e.className = "download-link";
                    e.href = app._canvasImageUrl;
                    e.download = filename;
                    e.innerHTML = "Save";
                    app.dialog.show("Click to save the image to a file." + e.outerHTML, "Image is ready");
                }
            };

            var saveCanvasImage = function (canvas) {
                if (canvas.toBlob !== undefined) {
                    canvas.toBlob(saveBlob);
                }
                else {    // !HTMLCanvasElement.prototype.toBlob
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement.toBlob
                    // decode the String
                    var binStr = atob(canvas.toDataURL("image/png").split(',')[1]);
                    var len = binStr.length;
                    var arr = new Uint8Array(len);

                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    saveBlob(new Blob([arr], { type: "image/png" }));
                }
            };
            // render
            app.renderer.preserveDrawingBuffer = true;
            app.renderer.render(app.scene, app.camera);
            // save webgl canvas image
            saveCanvasImage(app.renderer.domElement);

        }

    };  

    return app;

});