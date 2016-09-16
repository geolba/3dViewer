define('gba/layer/GridLayer', ['three', 'gba/layer/Layer', 'app/commonConfig'],
    function (THREE, Layer, Gba3D) {
        "use strict";

       
        var GridLayer = Layer.extend({

            //constructor: GridLayer,
            init: function (size, step, position, height) {
               
                this.visible = true;
                this.opacity = 1;
                this.objectGroup = new THREE.Group();
                this.objectGroup.visible = false;

                this.size = size;
                this.step = step;
                this.position = position;


                this.height = height || 30;
              
                this.declaredClass = "GridLayer";
              
                //for labeling
                this.l = { i: 0, v: 4.99999999998, ht:3 };//ht:3, ht:1 an der Ebene
                this.labels = [];
                this.scale = 1;
            },

            toggle: function(){
                var visible = !this.objectGroup.visible;
                this.objectGroup.visible = visible;
                //this._map.update();
                if (this.labels.length != 0) {

                    this.labelParentElement.style.display = (visible) ? "block" : "none";
                    this.labelConnectorGroup.visible = visible;
                }
                this._map.update();
            },

            scaleZ: function (z) {
                //this.mainMesh.scale.z = z;
                this.objectGroup.scale.z = z;
                if (this.labels.length != 0) {
                    this.labelConnectorGroup.scale.z = z;

                   
                    //for (var i = 0, len = this.f.length; i < len; i++) {
                    //    var feat = this.f[i];
                    //    var labelDiv = feat.labelDiv;
                    //    labelDiv.style.top = labelDiv.style.top * z;
                    //}
                }
                this.scale = z;
                this._map.update();
            },

            onRemove: function (map) {
          
                this.getPane().remove(this.objectGroup); 
            },

            onAdd: function (map) {
                this._map = map;

                var width = 40;//map.width / 2;
                //this.build(this.size, this.step, this.position, this.height);    

                var gridXZ = this.build(map.length / 2, 10, width, this.height);

                var gridYZ = this.build(width, 10, map.length / 2, this.height);
                gridYZ.rotation.z = Math.PI / 2;

                //waagrechtes grid
                var gridXY = this.build(map.length / 2, 10, -this.height, width);
                gridXY.rotation.x = Math.PI / 2;

                //build labels
                //var text = this._createTextLabel();
                //text.setHTML("Label " + 1);
                //text.setParent(gridXZ);
                //this.textlabels.push(text);              
                //text.updatePosition();
                //this._map.container.appendChild(text.element);

                this.getPane().add(this.objectGroup);
            },

            build: function (size, step, position, height) {

                //color1 = new THREE.Color(color1 !== undefined ? color1 : 0x444444);
                //color2 = new THREE.Color(color2 !== undefined ? color2 : 0x888888);

                var vertices = [];
                var colors = [];
                //var height = 40;

                //for (var i = -size; i <= size; i += step) {
                //    vertices.push(i, position, height, i, position, -height);//senkrecht
                //}
                for (var i = size; i >= -size; i -= step) {
                    vertices.push(i, position, height, i, position, -height);//senkrecht
                }

                for (var j = -height; j <= height; j += step) {
                //for (var j = height; j >= -height; j -= step) {
                    vertices.push(-size, position, j, size, position, j);//waagrecht    
                }

                //var j = -height;
                //do {
                //    j += step
                //    if (j > height) {
                //        j = height;
                //    }
                //    vertices.push(-size, position, j, size, position, j);//waagrecht
                //} while (j < height);

                               

                var geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.Float32Attribute(vertices, 3));
                //geometry.addAttribute('color', new THREE.Float32Attribute(colors, 3));

                var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

                //THREE.LineSegments.call(this, geometry, material);
                 var lineSegments = new THREE.LineSegments(geometry, material);
                //this.visible = false;
                //this.geometry.visible = this.visible;

                 this.objectGroup.add(lineSegments);
                 return lineSegments;
                //this.getPane().add(this.geometry);
            },

            buildLabels: function (parent, parentElement) {
                this.parent = parent;
                this.parentElement = parentElement;
                var width = 80;
                //label
                this.f = [                    
                    { a: [this._map.getMapX(-10)], cl: "red-label", h: 0.0, centroid: [[-10, width / 2, this.height]] },
                    { a: [this._map.getMapX(-20)], cl: "red-label", h: 0.6, centroid: [[-20, width / 2, this.height]] },
                    { a: [this._map.getMapX(-30)], cl: "red-label", h: 0.6, centroid: [[-30, width / 2, this.height]] },
                    { a: [this._map.getMapX(-40)], cl: "red-label", h: 0.6, centroid: [[-40, width / 2, this.height]] },
                    { a: [this._map.getMapX(-50)], cl: "red-label", h: 0.6, hs: 4, centroid: [[-50, width / 2, this.height]] },
                    { a: [this._map.getMapX(0)], cl: "red-label", h: 0.6, centroid: [[0, width / 2, this.height]] },
                    { a: [this._map.getMapX(10)], cl: "red-label", h: 0.6, centroid: [[10, width / 2, this.height]] },
                    { a: [this._map.getMapX(20)], cl: "red-label", h: 0.6, centroid: [[20, width / 2, this.height]] },
                    { a: [this._map.getMapX(30)], cl: "red-label", h: 0.6, centroid: [[30, width / 2, this.height]] },
                    { a: [this._map.getMapX(40)], cl: "red-label", h: 0.6, centroid: [[40, width / 2, this.height]] },
                    { a: [this._map.getMapX(50)], cl: "red-label", h: 0.6, centroid: [[50, width / 2, this.height]] },

                    { a: [this._map.getMapY(-10)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), -10, this.height]] },
                    { a: [this._map.getMapY(-20)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), -20, this.height]] },
                    { a: [this._map.getMapY(-30)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), -30, this.height]] },
                     { a: [this._map.getMapY(-40)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), -40, this.height]] },
                    { a: [this._map.getMapY(0)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), 0, this.height]] },
                    { a: [this._map.getMapY(10)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), 10, this.height]] },
                    { a: [this._map.getMapY(20)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), 20, this.height]] },
                    { a: [this._map.getMapY(30)], cl: "green-label", h: 0.6, centroid: [[-(this._map.length / 2), 30, this.height]] },
                    { a: [this._map.getMapY(40)], cl: "green-label", h: 0.6, hs: -4, centroid: [[-(this._map.length / 2), 40, this.height]] },

                    { a: [this._map.getMapZ(-10)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2) - 1, -width / 2, -10]] },
                    { a: [this._map.getMapZ(-20)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2), -width / 2, -20]] },
                    { a: [this._map.getMapZ(-30)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2), -width / 2, -30]] },                  
                    { a: [this._map.getMapZ(0)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2), -width / 2, 0]] },
                    { a: [this._map.getMapZ(10)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2), -width / 2, 10]] },
                    { a: [this._map.getMapZ(20)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2), -width / 2, 20]] },
                    { a: [this._map.getMapZ(30)], cl: "blue-label", ht: 1, hs: -2, centroid: [[-(this._map.length / 2), -width / 2, 30]] }                   
                ];

                var zFunc, getPointsFunc = function (f) { return f.centroid; };

                // Layer must belong to a project
                var label = this.l;
                if (label === undefined || getPointsFunc === undefined) return;

                //var zShift = this._map.dataservice.zShift;
                //var zScale = this._map.dataservice.zScale;

                var labelHeightFunc = function (f, pt) {
                    var z0 = (zFunc === undefined) ? pt[2] : zFunc(pt[0], pt[1]);

                    //if (label.ht == 1) {
                    //    return [z0, label.v];
                    //}
                    if (f.ht == 1) {
                        return [z0, z0];
                    }
                    //if (label.ht == 3) {
                    //    z0 += f.h;
                    //}
                    return [z0, z0 + label.v];
                };
                var line_mat = new THREE.LineBasicMaterial({ color: Gba3D.Options.label.connectorColor });
                this.labelConnectorGroup = new THREE.Group();
                this.labelConnectorGroup.userData.layerId = this.index;
                if (parent) {
                    parent.add(this.labelConnectorGroup);
                }
                this.labelConnectorGroup.visible = this.objectGroup.visible;

                // create parent element for labels
                var e = document.createElement("div");
                parentElement.appendChild(e);
                e.style.display = (this.objectGroup.visible) ? "block" : "none";
                this.labelParentElement = e; //lable parent div for this layer


                for (var i = 0, l = this.f.length; i < l; i++) {
                    var f = this.f[i];
                    f.aElems = [];
                    f.aObjs = [];
                    var text = f.a[label.i];
                    if (text === null || text === "") continue;

                    var classLabel = f.cl;
                    if (classLabel === undefined || classLabel === "") classLabel = "label";

                    var horizontalShiftLabel = f.hs;
                    if (horizontalShiftLabel === undefined || horizontalShiftLabel === "") horizontalShiftLabel = 0;

                    var pts = getPointsFunc(f);
                    for (var j = 0, m = pts.length; j < m; j++) {
                        var pt = pts[j];
                     
                        // create div element for label
                        var e = document.createElement("div");
                        e.appendChild(document.createTextNode(text));
                        e.className = classLabel;// "label";
                        this.labelParentElement.appendChild(e);

                        var z = labelHeightFunc(f, pt);
                        var pt0 = new THREE.Vector3(pt[0], pt[1], z[0]);    // bottom
                        var pt1 = new THREE.Vector3(pt[0] + horizontalShiftLabel, pt[1], z[1]);    // top

                        // create connector
                        var geom = new THREE.Geometry();
                        geom.vertices.push(pt1, pt0);
                        var conn = new THREE.Line(geom, line_mat);
                        conn.userData.layerId = this.index;
                        conn.userData.featureId = i;
                        this.labelConnectorGroup.add(conn);

                        f.aElems.push(e);
                        //f.labelDiv = e;
                        f.aObjs.push(conn);
                        this.labels.push({ labelDiv: e, obj: conn, pt: pt1 });
                    }
                }

            },

            _createTextLabel: function() {
                var div = document.createElement('div');
                div.display = "block";
                div.className = 'text-label';
                div.style.position = 'absolute';
                div.style.width = 100;
                div.style.height = 100;
                div.innerHTML = "hi there!";
                div.style.top = -1000;
                div.style.left = -1000;

                var _this = this;

                return {
                    element: div,
                    parent: false,
                    position: new THREE.Vector3(20,30,60),
                    setHTML: function(html) {
                        this.element.innerHTML = html;
                    },
                    setParent: function(threejsobj) {
                        this.parent = threejsobj;
                    },
                    updatePosition: function() {
                        //if(parent) {
                        //    this.position.copy(this.parent.position);
                        //}

                        var coords2d = this.get2DCoords(this.position, _this._map.object);
                        this.element.style.left = coords2d.x + 'px';
                        this.element.style.top = coords2d.y + 'px';
                    },
                    get2DCoords: function(position, camera) {
                        var vector = position.project(camera);
                        vector.x = (vector.x + 1)/2 * window.innerWidth;
                        vector.y = -(vector.y - 1)/2 * window.innerHeight;
                        return vector;
                    }
                };
            },

        });

        return GridLayer;

    });