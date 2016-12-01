define('gba/layer/DemLayer', ['three', 'gba/layer/Layer', 'gba/layer/DemBlock', 'gba/geometry/Graph', 'app/commonConfig', 'app/appmodule'],
    function (THREE, Layer, DemBlock, Graph, Gba3D, app) {
    "use strict";

    /**
     * This is our classes constructor; unlike AS3 this is where we define our member properties (fields).
     * To differentiate constructor functions from regular functions, by convention we start the function 
     * name with a capital letter.  This informs users that they must invoke the DemLayer function using
     * the `new` keyword and treat it as a constructor (ie: it returns a new instance of the Class).
     */
    //function DemLayer(params) {

    //    //properties
    //    this.visible = true;
    //    this.opacity = 1;
    //    this.materialParameter = [];
    //    for (var k in params) {
    //        if (params.hasOwnProperty(k)) {
    //            this[k] = params[k];
    //        }
    //    }
    
    //    this.objectGroup = new THREE.Group();
    //    this.queryableObjects = [];
     
    //    //this.type = Gba3D.LayerType.DEM;
    //    this.blocks = [];
    //}

        //DemLayer.prototype = { 
    var DemLayer = Layer.extend({

        /**
    	 * Whenever you replace an Object's Prototype, you need to repoint
    	 * the base Constructor back at the original constructor Function, 
    	 * otherwise `instanceof` calls will fail.
    	 */
        //constructor: DemLayer,
        init: function (params) {
            //properties
            this.visible = true;
            this.opacity = 1;
            this.materialParameter = [];
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    this[k] = params[k];
                }
            }

            this.objectGroup = new THREE.Group();
            this.queryableObjects = [];

            //this.type = Gba3D.LayerType.DEM;
            this.blocks = [];
            this.declaredClass = "DemLayer";
        },

        setWireframeMode: function (wireframe) {
            this.materials.forEach(function (m) {
                if (m.w) return;               
                m.mat.wireframe = wireframe;
                //m.mat._needsUpdate = true;
            });
        },

        scaleZ: function (z) {
            //this.mainMesh.scale.z = z;
            this.objectGroup.scale.z = z;
        },

        setVisible: function (visible) {
            this.visible = visible;
            this.objectGroup.visible = visible;
            //Q3D.application.queryObjNeedsUpdate = true;
        },      

        getFilteredArray2: function (filterX, filterY) {//typedArray) {

            //var filteredArray = [];
            //var filteredArray = new Float32Array(this.mainGeometry.getAttribute('position').array.length);
            // allocate maximal size
            var filteredArray = new Float32Array(this.features.length);
            var filteredIndicesArray = [];// new Uint16Array(this.indices.length);
            //var index = this.mainGeometry.getIndex();
            //var indices = index.array;

            //var filteredArray = new Float32Array(288);
            //var filteredArray = this.mainGeometry.attributes.position.clone().array;
            var typedArray = this.features;
            var indices = this.idx;

            var x1, y1, z1;
            var x2, y2, z2;
            var x3, y3, z3;
            
            //iterate throug triabgles:
            for (var i = 0; i < indices.length; i += 3) {
                var v1index = indices[i] * 3;
                x1 = typedArray[v1index];
                y1 = typedArray[v1index + 1];
                z1 = typedArray[v1index + 2];
              

                var v2index = indices[i + 1] * 3;
                x2 = typedArray[v2index];
                y2 = typedArray[v2index + 1];
                z2 = typedArray[v2index + 2];

                var v3index = indices[i + 2] * 3;
                x3 = typedArray[v3index];
                y3 = typedArray[v3index + 1];
                z3 = typedArray[v3index + 2];

                if ((x1 < filterX && x2 < filterX && x3 < filterX) && (y1 > filterY && y2 > filterY && y3 > filterY)) {
                    filteredArray[v1index] = x1;
                    filteredArray[v1index + 1] = y1;
                    filteredArray[v1index + 2] = z1;

                    filteredArray[v2index] = x2;
                    filteredArray[v2index + 1] = y2;
                    filteredArray[v2index + 2] = z2;

                    filteredArray[v3index] = x3;
                    filteredArray[v3index + 1] = y3;
                    filteredArray[v3index + 2] = z3;

                    //filteredIndicesArray[i] = indices[i];
                    //filteredIndicesArray[i + 1] = indices[i + 1];
                    //filteredIndicesArray[i + 2] = indices[i + 2];
                    
                    //filteredIndicesArray[i] = indices[i];
                    //filteredIndicesArray[i + 1] = indices[i + 1];
                    //filteredIndicesArray[i + 2] = indices[i + 2];

                    filteredIndicesArray.push(indices[i]);
                    filteredIndicesArray.push(indices[i + 1]);
                    filteredIndicesArray.push(indices[i +2]);
                }
                //else {
                //    filteredIndicesArray[i] = undefined;
                //    filteredIndicesArray[i + 1] = undefined;
                //    filteredIndicesArray[i + 2] = undefined;
                //}
            }

          
            //var max_of_array = Math.max.apply(Math, filteredArray);
            //var min_of_array = Math.min.apply(Math, filteredArray);          
            //this.mainGeometry.setIndex(new THREE.BufferAttribute(indices2, 1).setDynamic(true));

            var indices2 = new Uint16Array(filteredIndicesArray);
            this.mainGeometry.index.array = indices2;         
            //this.mainGeometry.setIndex(new THREE.BufferAttribute(indices2, 1).setDynamic(true));

            //this.mainGeometry.index.needsUpdate = true;
            return filteredArray;        
        },
        getFilteredArray: function (filterX, filterY) {//typedArray) {

            //var filteredArray = [];
            var filteredArray = new Float32Array(this.positions.length);
            var typedArray = this.positions;

            var x1, y1, z1;
            var x2, y2, z2;
            var x3, y3, z3;
            //var filterX = x;
            for (var i = 0; i < typedArray.length; i += 3) {
                //
                x1 = typedArray[i * 3 + 0];// = vertexPositions[i][0];
                y1 = typedArray[i * 3 + 1];// = vertexPositions[i][1];
                z1 = typedArray[i * 3 + 2];// = vertexPositions[i][2];

                x2 = typedArray[i * 3 + 3];
                y2 = typedArray[i * 3 + 4];
                z2 = typedArray[i * 3 + 5];

                x3 = typedArray[i * 3 + 6];
                y3 = typedArray[i * 3 + 7];
                z3 = typedArray[i * 3 + 8];

                //if (vertex1x > 20) {
                if ((x1 < filterX && x2 < filterX && x3 < filterX) && (y1 < filterY && y2 < filterY && y3 < filterY)) {
                   
                    filteredArray[i * 3 + 0] = x1;
                    filteredArray[i * 3 + 1] = y1;
                    filteredArray[i * 3 + 2] = z1;
                  
                    filteredArray[i * 3 + 3] = x2;
                    filteredArray[i * 3 + 4] = y2;
                    filteredArray[i * 3 + 5] = z2;
                  
                    filteredArray[i * 3 + 6] = x3;
                    filteredArray[i * 3 + 7] = y3;
                    filteredArray[i * 3 + 8] = z3;
                }
            }
         
            return filteredArray;          
        },


        filterMaterial: function (filterX, filterY) {
            this.xLocalPlane.constant = filterX;
            this.yLocalPlane.constant = filterY;
        },

        //für Buffer:
        filter: function (filterX, filterY) {
            var bufferAttribute = this.mainGeometry.getAttribute('position');
            bufferAttribute.array = this.getFilteredArray2(filterX, filterY);
            //var test = new THREE.Float32Attribute(this.getFilteredArray2(filterX, filterY), 3).setDynamic(true);
            //this.mainGeometry.addAttribute('position', test);
           
            this.mainGeometry.attributes.position.needsUpdate = true;
            this.mainGeometry.index.needsUpdate = true;
            //this.mainGeometry.computeVertexNormals();

            //this.removeObject(this.mainMesh);
            //var mesh = new THREE.Mesh(this.mainGeometry, this.materials[0].mat);
            //mesh.name = "Filter";
            //this.removeObject(this.objectGroup.getObjectByName("Filter"), false);
            //this.addObject(mesh, false);

            //this.mainMesh.updateMatrix();
            //this.mainGeometry.getAttribute('position').needsUpdate = true;
            
           
         
            //this.mainGeometry.computeBoundingSphere();
            //this.materials[0].mat = new THREE.MeshLambertMaterial({ 'color': 0xf9f9f9, 'side': THREE.DoubleSide });

            //this.mainMesh.material.update();
            //this.mainMesh.needsUpdate = true;


            //var helper = new THREE.WireframeHelper(this.mainMesh, 0x00ff00);
            //this.addObject(helper);

                     
            //this.mainGeometry.getAttribute('normal').needsUpdate = true;
            //this.mainGeometry.getAttribute('uv').needsUpdate = true;
        
            //this.mainGeometry.index.needsUpdate = true;
        },
      

        addBlock : function (params, clipped) {
            var BlockClass = (clipped) ? ClippedDEMBlock : DemBlock;
            var block = new BlockClass(params);
            block.layer = this;
            this.blocks.push(block);
            return block;
        },

        initMaterials : function () {
            this.materials = [];
            if (this.materialParameter.length === 0) return;
            this.xLocalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 50);
            //this.addObject(this.xLocalPlane, false);
            this.yLocalPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 39);

            var mat, sum_opacity = 0;
            for (var i = 0, l = this.materialParameter.length; i < l; i++) {
                var m = this.materialParameter[i];

                var opt = {};
                //if (m.ds && !Gba3D.isIE) opt.side = THREE.DoubleSide;
                if (m.ds && !Gba3D.isIE) opt.side = THREE.DoubleSide;
                if (m.flat) opt.shading = THREE.FlatShading;
                //m.i = 1;
                if (m.i !== undefined) {
                    var image = this.dataservice.images[m.i];
                    if (image.texture === undefined) {
                        if (image.src !== undefined) {
                            image.texture = THREE.ImageUtils._loadTexture(image.src);
                        }
                        else {
                            image.texture = this._loadTextureData(image.data);
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
                //opt.wireframe = true;

                // Clipping setup:
                opt.clippingPlanes = [this.xLocalPlane, this.yLocalPlane];
                opt.clipIntersection = false;
                opt.clipShadows = true;

                if (m.materialtypee === Gba3D.MaterialType.MeshLambert) {
                    //if (m.color !== undefined) opt.color = opt.ambient = m.color;
                    if (m.color !== undefined) opt.color = m.color;
                    //opt.skinning = true;
                    mat = new THREE.MeshLambertMaterial(opt);
                }
                else if (m.materialtype === Gba3D.MaterialType.MeshPhong) {
                    if (m.color !== undefined) opt.color = opt.ambient = m.color;
                    mat = new THREE.MeshPhongMaterial(opt);
                }
                else if (m.materialtype === Gba3D.MaterialType.LineBasic) {
                    opt.color = m.color;
                    mat = new THREE.LineBasicMaterial(opt);
                }
                else {
                    opt.color = 0xffffff;
                    mat = new THREE.SpriteMaterial(opt);
                }

                m.mat = mat;
                //if (m.side !== undefined) {
                //    m.
                //}
                this.materials.push(m);
                sum_opacity += mat.opacity;
            }

            // layer opacity is the average opacity of materials
            this.opacity = sum_opacity / this.materials.length;
        },

        changeImage: function(i){
            //this.mainMesh.material.map = THREE.ImageUtils.loadTexture(src);
            var image = this.dataservice.images[i];
            if (image.texture === undefined) {
                image.texture = this._loadTextureData(image.data);
            }
            this.mainMesh.material.map = image.texture;
            this.mainMesh.material.needsUpdate = true;
            this._map.update();
        },

        onAdd: function (map) {
            //this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

            this.build(this.getPane());
            //this.update();
            //this.emit('add');
        },

        onRemove: function (map) {

            this.getPane().remove(this.objectGroup);
            //this.emit('remove');

            //map.off({
            //    'viewreset': this.update,
            //    'zoomanim': this._animateZoom
            //}, this);
            this._map = null;
        },

        build : function (app_scene) {
            //var opt = Gba3D.Options;
            this.blocks.forEach(function (block) {
                block.build(this);

                //// build sides, bottom and frame
                ////if (block.sides) {
               
                //// material
                //var opacity = this.materials[block.mIndex].o;
                //if (opacity === undefined) {
                //    opacity = 1;
                //}
                //var sidecolor = this.materials[block.mIndex].side.color;
       
                //var mat = new THREE.MeshLambertMaterial({
                //    color: sidecolor, //opt.side.color,
                //    ambient: sidecolor,//opt.side.color,
                //    opacity: opacity,
                //    transparent: (opacity < 1),
                //    side: THREE.DoubleSide //neu dazu
                //});
                //this.materials.push({ type: Gba3D.MaterialType.MeshLambert, m: mat });
                              
                //if (block.bottomData) {
                //    //block.extrudePlane(this, mat, opt.side.bottomZ);
                //    block.extrudePlane(this, mat, opt.side.bottomZ);
                //}
                //else {
                //    //var sidecolor = this.materials[block.mIndex].side.color;
                //    var bottomZ = this.materials[block.mIndex].side.bottomZ;
                //    block.extrudeBottomPlane(this, mat, bottomZ);
                //}                
                //this.sideVisible = true;
                ////}
             
            }, this);
            //this.scaleZ(1.5);
            if (app_scene) {
                app_scene.add(this.objectGroup);
            }


            //if (this.name === "Bottom") {
            //    this.buildGraph();
            //}

        },

        buildGraph: function () {
            var graph = new Graph();


            var typedArray = this.positions;
            var indices = this.indices;

            var x1, y1, z1;
            var x2, y2, z2;
            var x3, y3, z3;

            //////iterate throug triangles:
            //for (var i = 0; i < typedArray.length; i += 9) {
            //    x1 = typedArray[i];
            //    y1 = typedArray[i + 1];
            //    graph.addNode(new THREE.Vector2(x1, y1));
            //    //z1 = typedArray[i + 2];

            //    x2 = typedArray[i + 3];
            //    y2 = typedArray[i + 4];
            //    //z2 = typedArray[v2index + 5];
            //    graph.addNode(new THREE.Vector2(x2, y2));

            //    x3 = typedArray[i + 6];
            //    y3 = typedArray[i + 7];
            //    //z3 = typedArray[v2index + 8];
            //    graph.addNode(new THREE.Vector2(x3, y3));
            //}
            
            //iterate throug triangles:
            for (var i = 0; i < indices.length; i += 3) {
                var v1index = indices[i] * 3;
                x1 = typedArray[v1index];
                y1 = typedArray[v1index + 1];
                z1 = typedArray[v1index + 2];
                var node1;
                if (graph.nodes.hasOwnProperty(v1index)) {
                    node1 = graph.nodes[v1index];
                }
                else {
                    node1 = graph.addNode(new THREE.Vector3(x1, y1, z1), v1index);
                }


                var v2index = indices[i + 1] * 3;
                x2 = typedArray[v2index];
                y2 = typedArray[v2index + 1];
                z2 = typedArray[v2index + 2];
                //var node2 = graph.addNode(new THREE.Vector3(x2, y2, z2));
                var node2;
                if (graph.nodes.hasOwnProperty(v2index)) {
                    node2 = graph.nodes[v2index];
                }
                else {
                    node2 = graph.addNode(new THREE.Vector3(x2, y2, z2), v2index);
                }

                var v3index = indices[i + 2] * 3;
                x3 = typedArray[v3index];
                y3 = typedArray[v3index + 1];
                z3 = typedArray[v3index + 2];
                //var node3 = graph.addNode(new THREE.Vector3(x3, y3, z3));
                var node3;
                if (graph.nodes.hasOwnProperty(v3index)) {
                    node3 = graph.nodes[v3index];
                }
                else {
                    node3 = graph.addNode(new THREE.Vector3(x3, y3, z3), v3index);
                }

                //graph.addNode(new THREE.Vector2(x1, y1));
                //graph.addNode(new THREE.Vector2(x2, y2));
                //graph.addNode(new THREE.Vector2(x3, y3));


                graph.addFaceFromNodes([node1, node2, node3]);   

            }
            //var nodes = [];
            //var solved = false;
            //// init algorithm
            //nodes.push(graph.nodes[0]);
            //graph.nodes[0].visited = true;


            var geometry = new THREE.Geometry();

            for (i = 0; i < graph.edges.length; i++) {
                var edge = graph.edges[i];
                if (edge.faces.length === 1) {                  
                    edge.border === true;
                    geometry.vertices.push(
	                    edge.n1.pos,
	                    edge.n2.pos
                    );                   
                }
            }
                  
            var material = new THREE.LineBasicMaterial({ color: 0xff7700, opacity:1, linewidth: 2 });
            //var line = new THREE.Line(geometry, material);
            var line = new THREE.LineSegments(geometry, material);
            this.addObject(line, false);



            //if (nodes.length > 0) {
            //    var node = nodes.pop();
            //    // expand node
            //    var adjacentNodes = node.getAdjacentNodes();

            //    for (var i = 0; i < adjacentNodes.length; i++) {
            //        var adjacentNode = adjacentNodes[i];
            //        if (!adjacentNode.visited) {
            //            adjacentNode.visited = true;
            //            nodes.unshift(adjacentNode);
            //        }
            //        var edge = node.findEdgeWith(adjacentNode);
                    
            //        if (!edge.visited) {
            //            edge.visited = true;
            //            if (edge.faces.length == 1) {
            //                if (node.border === null) {
            //                    var border = { nodes: [node], edges: [] };
            //                    node.border = border;
            //                }
            //                if (adjacentNode.border != null) {
            //                    var adjacentBorderNodes = adjacentNode.border.nodes.slice(0);
            //                    var adjacentBorderEdges = adjacentNode.border.edges.slice(0);
            //                    for (var j = 0; j < adjacentBorderEdges.length; j++) {
            //                        var adjacentBorderEdge = adjacentBorderEdges[j];
            //                        adjacentBorderEdge.border = node.border;
            //                        node.border.edges.push(adjacentBorderEdge);
            //                    }
            //                    for (var j = 0; j < adjacentBorderNodes.length; j++) {
            //                        var adjacentBorderNode = adjacentBorderNodes[j];
            //                        adjacentBorderNode.border = node.border;
            //                        node.border.nodes.push(adjacentBorderNode);
            //                    }
            //                    edge.border = node.border;
            //                    node.border.edges.push(edge);
            //                }
            //                else {
            //                    adjacentNode.border = node.border;
            //                    edge.border = node.border;
            //                    node.border.nodes.push(adjacentNode);
            //                    node.border.edges.push(edge);
            //                }
            //            }
            //        }


            //    }//for



            //}//if

            //var test = graph;
        },

        addObject : function (object, queryable) {
            if (queryable === undefined) {
                queryable = this.q;
            }

            this.objectGroup.add(object);
            if (queryable) {
                this._addQueryableObject(object);
            }
        },
        
        _addQueryableObject: function (object) {
            this.queryableObjects.push(object);
            //for (var i = 0, l = object.children.length; i < l; i++) {
            //    this._addQueryableObject(object.children[i]);
            //}
        },

        removeObject : function (object, queryable) {
            if (queryable === undefined) {
                queryable = this.q;
            }

            this.objectGroup.remove(object);
            if (queryable) {
                
                var index = this.queryableObjects.indexOf(object);
                index !== -1 && this.queryableObjects.splice(index, 1);
            }
        },
       
        
        _loadTextureData : function (imageData) {
            var texture, image = new Image();
            image.onload = function () {
                texture.needsUpdate = true;
                app._render();
                //if (!Gba3D.Options.exportMode && !Gba3D.application.running)
                //if (app.running) {
                //    app._render();
                //}
            };
            image.src = imageData;
            texture = new THREE.Texture(image);
            return texture;
        }

    });

    return DemLayer;

});