define('gba/layer/DxfLayer',
    ['three', 'gba/layer/Layer', "jquery", 'gba/geometry/Graph', 'gba/tasks/Raycaster', 'helper/utilities', 'helper/geo_utilities', 'gba/geometry/Vector3', 'app/commonConfig'],
    function (THREE, Layer, $, Graph, Raycaster, util, geo_util, Vector3, Gba3D) {
        "use strict";

        /**
         * This is our classes constructor; unlike AS3 this is where we define our member properties (fields).
         */
        //function DxfLayer(params) {
        //    //vom VectorLayer
        //    this.features = [];

        //    this.visible = true;
        //    this.opacity = 1;
        //    this.materialParameter = [];
        //    for (var k in params) {
        //        this[k] = params[k];
        //    }
        //    // this.materials = undefined;
        //    this.objectGroup = new THREE.Group();
        //    this.queryableObjects = []

        //    ////vom VectorLayer
        //    //this.labels = [];
        //    ////vom PolygonLayer
        //    this.type = "DxfLayer";

        //}

        //DxfLayer.prototype = {
        var DxfLayer = Layer.extend({

            /**
             * Whenever you replace an Object's Prototype, you need to repoint
             * the base Constructor back at the original constructor Function, 
             * otherwise `instanceof` calls will fail.
             */
            //constructor: DxfLayer,
            init: function (params) {
                //vom VectorLayer
                this.features = [];

                this.visible = true;
                this.opacity = 1;
                this.materialParameter = [];
                for (var k in params) {
                    this[k] = params[k];
                }
                // this.materials = undefined;
                this.objectGroup = new THREE.Group();
                this.queryableObjects = [];
                this.borderVisible = false;

                ////vom VectorLayer
                //this.labels = [];
                ////vom PolygonLayer
                this.declaredClass = "DxfLayer";

                this.worker = undefined;
            },

            setWireframeMode: function (wireframe) {
                this.materialsArray.forEach(function (mat) {
                    //if (m.w) return;
                    //m.mat.wireframe = wireframe;
                    mat.wireframe = wireframe;
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

            toggleBorderVisible: function (visible) {
                this.borderVisible = visible;
                //var visible = !this.borderVisible;
                this.borderVisible = visible;
                if (this.borderMesh) {
                    this.borderMesh.visible = visible;
                }

                this.emit("border-change", { visible: visible });//BorderControl has on-event and changes color according to visible parameter
            },


            initMaterials: function () {
                this.materialsArray = [];
                if (this.materialParameter.length === 0) return;

                var mat, sum_opacity = 0;
                for (var i = 0, l = this.materialParameter.length; i < l; i++) {
                    var m = this.materialParameter[i];

                    var opt = {};
                    //if (m.ds && !Gba3D.isIE) opt.side = THREE.DoubleSide;
                    if (m.ds && !Gba3D.isIE) opt.side = THREE.DoubleSide;
                    if (m.flat) opt.shading = THREE.FlatShading;

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


                    if (m.t) opt.transparent = true;
                    if (m.w) opt.wireframe = true;

                    //opt.vertexColors = THREE.VertexColors; 
                    this.color = m.color;

                    if (m.materialtypee === Gba3D.MaterialType.MeshLambert) {
                        if (m.color !== undefined) {
                            //opt.color = opt.ambient = m.color;
                            opt.color = m.color;
                        }
                        //opt.specular = 0x555555;
                        //opt.shininess = 30;

                        mat = new THREE.MeshLambertMaterial(opt);
                    }
                    else if (m.materialtypee === Gba3D.MaterialType.MeshPhong) {
                        if (m.color !== undefined) opt.color = m.color;
                        opt.specular = 0x555555;
                        opt.shininess = 30;
                        mat = new THREE.MeshPhongMaterial(opt);
                    }
                        //else if (m.materialtype === Gba3D.MaterialType.LineBasic) {
                        //    opt.color = m.color;
                        //    mat = new THREE.LineBasicMaterial(opt);
                        //}
                    else {
                        opt.color = 0xffffff;
                        mat = new THREE.SpriteMaterial(opt);
                    }

                    m.mat = mat;
                    //if (m.side !== undefined) {
                    //    m.
                    //}
                    //this.materialsArray.push(m);
                    this.materialsArray.push(mat);
                    sum_opacity += mat.opacity;
                }
                var material2 = new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
                this.materialsArray.push(material2);
                sum_opacity += material2.opacity;

                // layer opacity is the average opacity of materials
                this.opacity = sum_opacity / this.materialsArray.length;
            },


            extractFormFromTypedArray: function (startIndex, endIndex, itemSize, typedArray) {
                // The startIndex and endIndex are the range of points to remove in order to delete the form the viewer has selected
                // startIndex is inclusive, end index in non-inclusive
                var deleteCount = (endIndex * itemSize) - (startIndex * itemSize);
                var regularArray = Array.from(typedArray);
                regularArray.splice(startIndex, deleteCount); // regular array now contains only the unselected motifs' values
                var newEditedTypedArray = new Float32Array(regularArray);
                return newEditedTypedArray;
            },
            getFilteredUnindexedArray: function (filterX, filterY) {//typedArray) {

                //var filteredArray = [];
                var filteredArray = new Float32Array(this.positions.length);
                var typedArray = this.positions;

                //var filteredArray = new Array(); //(NUM_TRIANGLES * 3 * 3);
                //var filteredArray = Array.from(typedArray);

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
                        //filteredArray.push(x1);
                        //filteredArray.push(y1);
                        //filteredArray.push(z1);
                        filteredArray[i * 3 + 0] = x1;
                        filteredArray[i * 3 + 1] = y1;
                        filteredArray[i * 3 + 2] = z1;

                        //filteredArray.push(x2);
                        //filteredArray.push(y2);
                        //filteredArray.push(z2);
                        filteredArray[i * 3 + 3] = x2;
                        filteredArray[i * 3 + 4] = y2;
                        filteredArray[i * 3 + 5] = z2;

                        //filteredArray.push(x3);
                        //filteredArray.push(y3);
                        //filteredArray.push(z3);
                        filteredArray[i * 3 + 6] = x3;
                        filteredArray[i * 3 + 7] = y3;
                        filteredArray[i * 3 + 8] = z3;
                    }
                }

                return filteredArray;
                //var newEditedTypedArray = new Float32Array(filteredArray);
                //return newEditedTypedArray;
            },

            getFilteredIndexedArray: function (filterX, filterY) {//typedArray) {

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

                    if ((x1 <= filterX && x2 <= filterX && x3 <= filterX) && (y1 >= filterY && y2 >= filterY && y3 >= filterY)) {
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

                        filteredIndicesArray.push(indices[i]);
                        filteredIndicesArray.push(indices[i + 1]);
                        filteredIndicesArray.push(indices[i + 2]);
                    }
                    else {

                        var coordinatesIn = {};// [];
                        var coordinatesOut = {};//[];
                        if (x1 < filterX && y1 > filterY) {
                            //coordinatesIn.push(new THREE.Vector3(x1, y1, z1));
                            coordinatesIn["p1"] = new THREE.Vector3(x1, y1, z1);
                        }
                        else {
                            //coordinatesOut.push(new THREE.Vector3(x1, y1, z1));
                            coordinatesOut["p1"] = new THREE.Vector3(x1, y1, z1);
                        }
                        if (x2 < filterX && y2 > filterY) {
                            //coordinatesIn.push(new THREE.Vector3(x2, y2, z2));
                            coordinatesIn["p2"] = new THREE.Vector3(x2, y2, z2);
                        }
                        else {
                            //coordinatesOut.push(new THREE.Vector3(x2, y2, z2));
                            coordinatesOut["p2"] = new THREE.Vector3(x2, y2, z2);
                        }
                        if (x3 < filterX && y3 > filterY) {
                            //coordinatesIn.push(new THREE.Vector3(x3, y3, z3));
                            coordinatesIn["p3"] = new THREE.Vector3(x3, y3, z3);
                        }
                        else {
                            //coordinatesOut.push(new THREE.Vector3(x3, y3, z3));
                            coordinatesOut["p3"] = new THREE.Vector3(x3, y3, z3);
                        }
                        //erster Fall!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        //if (coordinatesIn.length === 1) {
                        if (Object.keys(coordinatesIn).length === 1) {

                            var pointIn, pointOut1, pointOut2, firstPoint, secondPoint, thirdPoint;
                            if (coordinatesIn.hasOwnProperty('p1')) {
                                pointIn = firstPoint = coordinatesIn['p1'];
                                pointOut1 = secondPoint = coordinatesOut['p2'];
                                pointOut2 = thirdPoint = coordinatesOut['p3'];
                            }
                            else if (coordinatesIn.hasOwnProperty('p2')) {
                                pointIn = secondPoint = coordinatesIn['p2'];
                                pointOut1 = thirdPoint = coordinatesOut['p3'];
                                pointOut2 = firstPoint = coordinatesOut['p1'];
                            }
                            else if (coordinatesIn.hasOwnProperty('p3')) {
                                pointIn = thirdPoint = coordinatesIn['p3'];
                                pointOut1 = firstPoint = coordinatesOut['p1'];
                                pointOut2 = secondPoint = coordinatesOut['p2'];
                            }

                            //var pointIn = coordinatesIn[0];
                            //var pointOut1 = coordinatesOut[0];
                            //var pointOut2 = coordinatesOut[1];  

                            //x ist definiert: oder beide
                            if (pointOut1.x < filterX && pointOut1.y < filterY) {
                                var line1 = {
                                    startX: pointIn.x,
                                    startY: pointIn.y,
                                    endX: pointOut1.x,
                                    endY: pointOut1.y
                                };

                                var filterLine = {
                                    startX: -40,
                                    startY: filterY,
                                    endX: +40,
                                    endY: filterY
                                };
                                var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                pointOut1.x = results.x;
                                pointOut1.y = results.y;
                            }

                                //y ist definiert:
                            else if (pointOut1.x > filterX && pointOut1.y > filterY) {
                                var line1 = {
                                    startX: pointIn.x,
                                    startY: pointIn.y,
                                    endX: pointOut1.x,
                                    endY: pointOut1.y
                                };

                                var filterLine = {
                                    startX: filterX,
                                    startY: 30,
                                    endX: filterX,
                                    endY: -30
                                };
                                var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                pointOut1.x = results.x;
                                pointOut1.y = results.y;
                            }
                            else {
                                //alert("erster Fall");
                                continue;
                            }


                            //x ist definiert: oder beide
                            if (pointOut2.x < filterX && pointOut2.y < filterY) {
                                var line1 = {
                                    startX: pointIn.x,
                                    startY: pointIn.y,
                                    endX: pointOut2.x,
                                    endY: pointOut2.y
                                };

                                var filterLine = {
                                    startX: -40,
                                    startY: filterY,
                                    endX: +40,
                                    endY: filterY
                                };
                                var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                pointOut2.x = results.x;
                                pointOut2.y = results.y;
                            }

                                //y ist definiert:
                            else if (pointOut2.x > filterX && pointOut2.y > filterY) {
                                var line1 = {
                                    startX: pointIn.x,
                                    startY: pointIn.y,
                                    endX: pointOut2.x,
                                    endY: pointOut2.y
                                };

                                var filterLine = {
                                    startX: filterX,
                                    startY: 30,
                                    endX: filterX,
                                    endY: -30
                                };
                                var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                pointOut2.x = results.x;
                                pointOut2.y = results.y;
                            }
                            else {
                                //alert("erster Fall");
                                continue;
                            }



                            filteredArray[v1index] = firstPoint.x;
                            filteredArray[v1index + 1] = firstPoint.y;
                            filteredArray[v1index + 2] = firstPoint.z;

                            filteredArray[v2index] = secondPoint.x;
                            filteredArray[v2index + 1] = secondPoint.y;
                            filteredArray[v2index + 2] = secondPoint.z;

                            filteredArray[v3index] = thirdPoint.x;
                            filteredArray[v3index + 1] = thirdPoint.y;
                            filteredArray[v3index + 2] = thirdPoint.z;

                            filteredIndicesArray.push(indices[i]);
                            filteredIndicesArray.push(indices[i + 1]);
                            filteredIndicesArray.push(indices[i + 2]);
                        }

                        //zweiter Fall!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        //if (coordinatesIn.length === 2) {
                        if (Object.keys(coordinatesIn).length === 2 && Object.keys(coordinatesOut).length === 1) {
                            //    var pointIn1 = coordinatesIn[0];
                            //    var pointIn2 = coordinatesIn[1];
                            //    var pointOut = coordinatesOut[0];
                            var pointIn1, pointIn2, pointOut, firstPoint, secondPoint, thirdPoint;
                            if (coordinatesOut.hasOwnProperty('p1')) {
                                pointOut = firstPoint = coordinatesOut['p1'];
                                pointIn1 = secondPoint = coordinatesIn['p2'];
                                pointIn2 = thirdPoint = coordinatesIn['p3'];

                            }
                            else if (coordinatesOut.hasOwnProperty('p2')) {
                                pointOut = secondPoint = coordinatesOut['p2'];
                                pointIn1 = thirdPoint = coordinatesIn['p3'];
                                pointIn2 = firstPoint = coordinatesIn['p1'];
                            }
                            else if (coordinatesOut.hasOwnProperty('p3')) {
                                pointOut = thirdPoint = coordinatesOut['p3'];
                                pointIn1 = firstPoint = coordinatesIn['p1'];
                                pointIn2 = secondPoint = coordinatesIn['p2'];
                            }
                            //if (pointOut == undefined) {
                            //    var test = "test";
                            //}

                            //x ist definiert:                            
                            if (pointOut.x < filterX && pointOut.y < filterY) {
                                var line1 = {
                                    startX: pointIn1.x,
                                    startY: pointIn1.y,
                                    endX: pointOut.x,
                                    endY: pointOut.y
                                };

                                var filterLine = {
                                    startX: -40,
                                    startY: filterY,
                                    endX: +40,
                                    endY: filterY
                                };
                                var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                pointOut.x = results.x;
                                pointOut.y = results.y;
                            }
                                //y ist definiert:                      
                            else if (pointOut.x > filterX && pointOut.y > filterY) {
                                var line1 = {
                                    startX: pointIn1.x,
                                    startY: pointIn1.y,
                                    endX: pointOut.x,
                                    endY: pointOut.y
                                };

                                var filterLine = {
                                    startX: filterX,
                                    startY: 30,
                                    endX: filterX,
                                    endY: -30
                                };
                                var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                //var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                                pointOut.x = results.x;
                                pointOut.y = results.y;

                            }
                            else {
                                //alert("zweiter Fall");
                                continue;
                            }



                            filteredArray[v1index] = firstPoint.x;
                            filteredArray[v1index + 1] = firstPoint.y;
                            filteredArray[v1index + 2] = firstPoint.z;

                            filteredArray[v2index] = secondPoint.x;
                            filteredArray[v2index + 1] = secondPoint.y;
                            filteredArray[v2index + 2] = secondPoint.z;

                            filteredArray[v3index] = thirdPoint.x;
                            filteredArray[v3index + 1] = thirdPoint.y;
                            filteredArray[v3index + 2] = thirdPoint.z;

                            filteredIndicesArray.push(indices[i]);
                            filteredIndicesArray.push(indices[i + 1]);
                            filteredIndicesArray.push(indices[i + 2]);


                        } //if (coordinatesIn.length === 2) {

                    }//else


                    //else {
                    //    filteredIndicesArray[i] = undefined;
                    //    filteredIndicesArray[i + 1] = undefined;
                    //    filteredIndicesArray[i + 2] = undefined;
                    //}
                }


                //var max_of_array = Math.max.apply(Math, filteredArray);
                //var min_of_array = Math.min.apply(Math, filteredArray);          
                //this.mainGeometry.setIndex(new THREE.BufferAttribute(indices2, 1).setDynamic(true));

                var indices2 = this.indices = new Uint16Array(filteredIndicesArray);
                this.mainGeometry.index.array = indices2;
                //this.mainGeometry.setIndex(new THREE.BufferAttribute(indices2, 1).setDynamic(true));

                //this.mainGeometry.index.needsUpdate = true;
                return filteredArray;
            },

            getFilteredIndexedArrayTest: function (filterX, filterY) {//typedArray) {

                var filteredArray = [];
                //var filteredArray = new Float32Array(this.positions.length);
                var filteredIndicesArray = [];// new Uint16Array(this.indices.length);

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
                    var vector1NotNull = x1 && y1 & z1 != 0;

                    var v2index = indices[i + 1] * 3;
                    x2 = typedArray[v2index];
                    y2 = typedArray[v2index + 1];
                    z2 = typedArray[v2index + 2];
                    var vector2NotNull = x2 && y2 & z2 != 0;

                    var v3index = indices[i + 2] * 3;
                    x3 = typedArray[v3index];
                    y3 = typedArray[v3index + 1];
                    z3 = typedArray[v3index + 2];
                    var vector3NotNull = x3 && y3 & z3 != 0;

                    if (vector1NotNull === false || vector2NotNull === false || vector3NotNull === false) {
                        continue;
                    }

                    if ((x1 <= filterX && x2 <= filterX && x3 <= filterX) && (y1 >= filterY && y2 >= filterY && y3 >= filterY)) {

                        filteredArray.push(x1);
                        filteredArray.push(y1);
                        filteredArray.push(z1);


                        filteredArray.push(x2);
                        filteredArray.push(y2);
                        filteredArray.push(z2);


                        filteredArray.push(x3);
                        filteredArray.push(y3);
                        filteredArray.push(z3);


                        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                        //filteredIndicesArray.push(filteredIndicesArray.length);
                        //filteredIndicesArray.push(filteredIndicesArray.length);
                        //filteredIndicesArray.push(filteredIndicesArray.length);
                    }
                    //else {

                    //    var coordinatesIn = {};// [];
                    //    var coordinatesOut = {};//[];
                    //    if (x1 < filterX && y1 > filterY) {
                    //        //coordinatesIn.push(new THREE.Vector3(x1, y1, z1));
                    //        coordinatesIn["p1"] = new THREE.Vector3(x1, y1, z1);
                    //    }
                    //    else {
                    //        //coordinatesOut.push(new THREE.Vector3(x1, y1, z1));
                    //        coordinatesOut["p1"] = new THREE.Vector3(x1, y1, z1);
                    //    }
                    //    if (x2 < filterX && y2 > filterY) {
                    //        //coordinatesIn.push(new THREE.Vector3(x2, y2, z2));
                    //        coordinatesIn["p2"] = new THREE.Vector3(x2, y2, z2);
                    //    }
                    //    else {
                    //        //coordinatesOut.push(new THREE.Vector3(x2, y2, z2));
                    //        coordinatesOut["p2"] = new THREE.Vector3(x2, y2, z2);
                    //    }
                    //    if (x3 < filterX && y3 > filterY) {
                    //        //coordinatesIn.push(new THREE.Vector3(x3, y3, z3));
                    //        coordinatesIn["p3"] = new THREE.Vector3(x3, y3, z3);
                    //    }
                    //    else {
                    //        //coordinatesOut.push(new THREE.Vector3(x3, y3, z3));
                    //        coordinatesOut["p3"] = new THREE.Vector3(x3, y3, z3);
                    //    }

                    //    //erster Fall!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    //    //if (coordinatesIn.length === 1) {
                    //    if (Object.keys(coordinatesIn).length === 1) {

                    //        var pointIn, pointOut1, pointOut2, firstPoint, secondPoint, thirdPoint;
                    //        if (coordinatesIn.hasOwnProperty('p1')) {
                    //            pointIn = firstPoint = coordinatesIn['p1'];
                    //            pointOut1 = secondPoint = coordinatesOut['p2'];
                    //            pointOut2 = thirdPoint = coordinatesOut['p3'];
                    //        }
                    //        else if (coordinatesIn.hasOwnProperty('p2')) {
                    //            pointIn = secondPoint = coordinatesIn['p2'];
                    //            pointOut1 = thirdPoint = coordinatesOut['p3'];
                    //            pointOut2 = firstPoint = coordinatesOut['p1'];
                    //        }
                    //        else if (coordinatesIn.hasOwnProperty('p3')) {
                    //            pointIn = thirdPoint = coordinatesIn['p3'];
                    //            pointOut1 = firstPoint = coordinatesOut['p1'];
                    //            pointOut2 = secondPoint = coordinatesOut['p2'];
                    //        }

                    //        //var pointIn = coordinatesIn[0];
                    //        //var pointOut1 = coordinatesOut[0];
                    //        //var pointOut2 = coordinatesOut[1];  

                    //        //x ist definiert: oder beide
                    //        if (pointOut1.x < filterX && pointOut1.y < filterY) {
                    //            var line1 = {
                    //                startX: pointIn.x,
                    //                startY: pointIn.y,
                    //                endX: pointOut1.x,
                    //                endY: pointOut1.y
                    //            };

                    //            var filterLine = {
                    //                startX: -40,
                    //                startY: filterY,
                    //                endX: +40,
                    //                endY: filterY
                    //            };
                    //            var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            pointOut1.x = results.x;
                    //            pointOut1.y = results.y;
                    //        }

                    //            //y ist definiert:
                    //        else if (pointOut1.x > filterX && pointOut1.y > filterY) {
                    //            var line1 = {
                    //                startX: pointIn.x,
                    //                startY: pointIn.y,
                    //                endX: pointOut1.x,
                    //                endY: pointOut1.y
                    //            };

                    //            var filterLine = {
                    //                startX: filterX,
                    //                startY: 30,
                    //                endX: filterX,
                    //                endY: -30
                    //            };
                    //            var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            pointOut1.x = results.x;
                    //            pointOut1.y = results.y;
                    //        }
                    //        else {
                    //            //alert("erster Fall");
                    //            continue;
                    //        }


                    //        //Punkt2 x ist definiert: oder beide
                    //        if (pointOut2.x < filterX && pointOut2.y < filterY) {
                    //            var line1 = {
                    //                startX: pointIn.x,
                    //                startY: pointIn.y,
                    //                endX: pointOut2.x,
                    //                endY: pointOut2.y
                    //            };

                    //            var filterLine = {
                    //                startX: -40,
                    //                startY: filterY,
                    //                endX: +40,
                    //                endY: filterY
                    //            };
                    //            var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            pointOut2.x = results.x;
                    //            pointOut2.y = results.y;
                    //        }

                    //            //Punkt2y ist definiert:
                    //        else if (pointOut2.x > filterX && pointOut2.y > filterY) {
                    //            var line1 = {
                    //                startX: pointIn.x,
                    //                startY: pointIn.y,
                    //                endX: pointOut2.x,
                    //                endY: pointOut2.y
                    //            };

                    //            var filterLine = {
                    //                startX: filterX,
                    //                startY: 30,
                    //                endX: filterX,
                    //                endY: -30
                    //            };
                    //            var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            pointOut2.x = results.x;
                    //            pointOut2.y = results.y;
                    //        }
                    //        else {
                    //            //alert("erster Fall");
                    //            continue;
                    //        }



                    //        //filteredArray[v1index] = firstPoint.x;
                    //        //filteredArray[v1index + 1] = firstPoint.y;
                    //        //filteredArray[v1index + 2] = firstPoint.z;
                    //        filteredArray.push(firstPoint.x);
                    //        filteredArray.push(firstPoint.y);
                    //        filteredArray.push(firstPoint.z);

                    //        //filteredArray[v2index] = secondPoint.x;
                    //        //filteredArray[v2index + 1] = secondPoint.y;
                    //        //filteredArray[v2index + 2] = secondPoint.z;
                    //        filteredArray.push(secondPoint.x);
                    //        filteredArray.push(secondPoint.y);
                    //        filteredArray.push(secondPoint.z);

                    //        //filteredArray[v3index] = thirdPoint.x;
                    //        //filteredArray[v3index + 1] = thirdPoint.y;
                    //        //filteredArray[v3index + 2] = thirdPoint.z;
                    //        filteredArray.push(thirdPoint.x);
                    //        filteredArray.push(thirdPoint.y);
                    //        filteredArray.push(thirdPoint.z);

                    //        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                    //        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                    //        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                    //        //filteredIndicesArray.push(filteredIndicesArray.length);
                    //        //filteredIndicesArray.push(filteredIndicesArray.length);
                    //        //filteredIndicesArray.push(filteredIndicesArray.length);
                    //    }

                    //    //zweiter Fall!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    //    //if (coordinatesIn.length === 2) {
                    //    if (Object.keys(coordinatesIn).length === 2 && Object.keys(coordinatesOut).length === 1) {
                    //        //    var pointIn1 = coordinatesIn[0];
                    //        //    var pointIn2 = coordinatesIn[1];
                    //        //    var pointOut = coordinatesOut[0];
                    //        var pointIn1, pointIn2, pointOut, firstPoint, secondPoint, thirdPoint;
                    //        if (coordinatesOut.hasOwnProperty('p1')) {
                    //            pointOut = firstPoint = coordinatesOut['p1'];
                    //            pointIn1 = secondPoint = coordinatesIn['p2'];
                    //            pointIn2 = thirdPoint = coordinatesIn['p3'];

                    //        }
                    //        else if (coordinatesOut.hasOwnProperty('p2')) {
                    //            pointOut = secondPoint = coordinatesOut['p2'];
                    //            pointIn1 = thirdPoint = coordinatesIn['p3'];
                    //            pointIn2 = firstPoint = coordinatesIn['p1'];
                    //        }
                    //        else if (coordinatesOut.hasOwnProperty('p3')) {
                    //            pointOut = thirdPoint = coordinatesOut['p3'];
                    //            pointIn1 = firstPoint = coordinatesIn['p1'];
                    //            pointIn2 = secondPoint = coordinatesIn['p2'];
                    //        }
                    //        //if (pointOut == undefined) {
                    //        //    var test = "test";
                    //        //}

                    //        //Punkt1 x ist definiert:                            
                    //        if (pointOut.x < filterX && pointOut.y < filterY) {
                    //            var line1 = {
                    //                startX: pointIn1.x,
                    //                startY: pointIn1.y,
                    //                endX: pointOut.x,
                    //                endY: pointOut.y
                    //            };

                    //            var filterLine = {
                    //                startX: -40,
                    //                startY: filterY,
                    //                endX: +40,
                    //                endY: filterY
                    //            };
                    //            var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            pointOut.x = results.x;
                    //            pointOut.y = results.y;
                    //        }
                    //            //Punkt1 y ist definiert:                      
                    //        else if (pointOut.x > filterX && pointOut.y > filterY) {
                    //            var line1 = {
                    //                startX: pointIn1.x,
                    //                startY: pointIn1.y,
                    //                endX: pointOut.x,
                    //                endY: pointOut.y
                    //            };

                    //            var filterLine = {
                    //                startX: filterX,
                    //                startY: 30,
                    //                endX: filterX,
                    //                endY: -30
                    //            };
                    //            var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            //var results = this.checkLineIntersection(line1.startX, line1.startY, line1.endX, line1.endY, filterLine.startX, filterLine.startY, filterLine.endX, filterLine.endY);
                    //            pointOut.x = results.x;
                    //            pointOut.y = results.y;

                    //        }
                    //        else {
                    //            //alert("zweiter Fall");
                    //            continue;
                    //        }



                    //        //filteredArray[v1index] = firstPoint.x;
                    //        //filteredArray[v1index + 1] = firstPoint.y;
                    //        //filteredArray[v1index + 2] = firstPoint.z;
                    //        filteredArray.push(firstPoint.x);
                    //        filteredArray.push(firstPoint.y);
                    //        filteredArray.push(firstPoint.z);

                    //        //filteredArray[v2index] = secondPoint.x;
                    //        //filteredArray[v2index + 1] = secondPoint.y;
                    //        //filteredArray[v2index + 2] = secondPoint.z;
                    //        filteredArray.push(secondPoint.x);
                    //        filteredArray.push(secondPoint.y);
                    //        filteredArray.push(secondPoint.z);

                    //        //filteredArray[v3index] = thirdPoint.x;
                    //        //filteredArray[v3index + 1] = thirdPoint.y;
                    //        //filteredArray[v3index + 2] = thirdPoint.z;
                    //        filteredArray.push(thirdPoint.x);
                    //        filteredArray.push(thirdPoint.y);
                    //        filteredArray.push(thirdPoint.z);


                    //        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                    //        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                    //        filteredIndicesArray[filteredIndicesArray.length] = filteredIndicesArray.length;
                    //        //filteredIndicesArray.push(filteredIndicesArray.length);
                    //        //filteredIndicesArray.push(filteredIndicesArray.length);
                    //        //filteredIndicesArray.push(filteredIndicesArray.length);


                    //    } //if (coordinatesIn.length === 2) {

                    //}//else

                    //else {
                    //    filteredIndicesArray[i] = undefined;
                    //    filteredIndicesArray[i + 1] = undefined;
                    //    filteredIndicesArray[i + 2] = undefined;
                    //}
                }


                //var max_of_array = Math.max.apply(Math, filteredArray);
                //var min_of_array = Math.min.apply(Math, filteredArray);          
                //this.mainGeometry.setIndex(new THREE.BufferAttribute(indices2, 1).setDynamic(true));

                var indices2 = new Uint32Array(filteredIndicesArray);
                //this.mainGeometry.index.array = indices2;

                //return filteredArray;
                var newEditedTypedArray = new Float32Array(filteredArray);
                return { typedarray: newEditedTypedArray, indicesArray: indices2 };
            },

            getFilteredNewIndexedArray: function (filterX, filterY) {//typedArray) {

                var filteredArray = [];
                //var filteredArray = new Float32Array(this.positions.length);
                var filteredIndicesArray = [];// new Uint16Array(this.indices.length);

                //var typedArray = this.positions;//oder auch this.features
                //var indices = this.indices;
                var typedArray = this.features;
                var indices = this.idx;

                var x1, y1, z1;
                var x2, y2, z2;
                var x3, y3, z3;

                var OldIndices = {};
                //OldIndices["p1"] = new THREE.Vector3(x1, y1, z1);

                //iterate throug triabgles:
                for (var i = 0; i < indices.length; i += 3) {
                    var v1index = indices[i] * 3;
                    x1 = typedArray[v1index];
                    y1 = typedArray[v1index + 1];
                    z1 = typedArray[v1index + 2];
                    var vector1NotNull = x1 && y1 & z1 != 0;

                    var v2index = indices[i + 1] * 3;
                    x2 = typedArray[v2index];
                    y2 = typedArray[v2index + 1];
                    z2 = typedArray[v2index + 2];
                    var vector2NotNull = x2 && y2 & z2 != 0;

                    var v3index = indices[i + 2] * 3;
                    x3 = typedArray[v3index];
                    y3 = typedArray[v3index + 1];
                    z3 = typedArray[v3index + 2];
                    var vector3NotNull = x3 && y3 & z3 != 0;

                    if (vector1NotNull === false || vector2NotNull === false || vector3NotNull === false) {
                        continue;
                    }

                    if ((x1 < filterX && x2 < filterX && x3 < filterX) && (y1 > filterY && y2 > filterY && y3 > filterY)) {

                        //filteredArray.push(x1);
                        //filteredArray.push(y1);
                        //filteredArray.push(z1);
                        var newv1Index;// = filteredIndicesArray.length;
                        if (OldIndices.hasOwnProperty(v1index)) {
                            newv1Index = OldIndices[v1index];
                        }
                        else {
                            newv1Index = filteredArray.length / 3;
                            OldIndices[v1index] = filteredArray.length / 3;
                            filteredArray.push(x1);
                            filteredArray.push(y1);
                            filteredArray.push(z1);

                        }
                        filteredIndicesArray.push(newv1Index);


                        //filteredArray.push(x2);
                        //filteredArray.push(y2);
                        //filteredArray.push(z2);
                        var newv2Index;// = filteredIndicesArray.length;
                        if (OldIndices.hasOwnProperty(v2index)) {
                            newv2Index = OldIndices[v2index];
                        }
                        else {
                            OldIndices[v2index] = filteredArray.length / 3;
                            newv2Index = filteredArray.length / 3;
                            filteredArray.push(x2);
                            filteredArray.push(y2);
                            filteredArray.push(z2);

                        }
                        filteredIndicesArray.push(newv2Index);


                        //filteredArray.push(x3);
                        //filteredArray.push(y3);
                        //filteredArray.push(z3);
                        var newv3Index;// = filteredIndicesArray.length;
                        if (OldIndices.hasOwnProperty(v3index)) {
                            newv3Index = OldIndices[v3index];
                        }
                        else {
                            OldIndices[v3index] = filteredArray.length / 3;
                            newv3Index = filteredArray.length / 3;
                            filteredArray.push(x3);
                            filteredArray.push(y3);
                            filteredArray.push(z3);

                        }
                        filteredIndicesArray.push(newv3Index);

                        //filteredIndicesArray.push(newv1Index);
                        //filteredIndicesArray.push(newv2Index);
                        //filteredIndicesArray.push(newv3Index);
                    }

                        //cutting triangle:
                    else {

                        var coordinatesIn = {};// [];
                        var coordinatesOut = {};//[];
                        if (x1 < filterX && y1 > filterY) {
                            coordinatesIn["p1"] = new Vector3(x1, y1, z1);
                            coordinatesIn["p1"].setIndex(v1index);
                        }
                        else {
                            coordinatesOut["p1"] = new Vector3(x1, y1, z1);
                            coordinatesOut["p1"].setIndex(v1index);
                        }
                        if (x2 < filterX && y2 > filterY) {
                            coordinatesIn["p2"] = new Vector3(x2, y2, z2);
                            coordinatesIn["p2"].setIndex(v2index);
                        }
                        else {
                            coordinatesOut["p2"] = new Vector3(x2, y2, z2);
                            coordinatesOut["p2"].setIndex(v2index);
                        }
                        if (x3 < filterX && y3 > filterY) {
                            coordinatesIn["p3"] = new Vector3(x3, y3, z3);
                            coordinatesIn["p3"].setIndex(v3index);
                        }
                        else {
                            coordinatesOut["p3"] = new Vector3(x3, y3, z3);
                            coordinatesOut["p3"].setIndex(v3index);
                        }
                        var xmin = -50;
                        var xmax = 50;
                        var ymin = -50;
                        var ymax = 50;

                        //erster Fall!!!!!!!!!!!!!!!!!!!!!!!!!!!! 2 Punkte drausen
                        //if (coordinatesIn.length === 1) {
                        if (Object.keys(coordinatesIn).length === 1) {
                            var pointIn, pointOut1, pointOut2, firstPoint, secondPoint, thirdPoint;

                            if (coordinatesIn.hasOwnProperty('p1')) {
                                pointIn = firstPoint = coordinatesIn['p1'];
                                pointOut1 = secondPoint = coordinatesOut['p2'];
                                pointOut2 = thirdPoint = coordinatesOut['p3'];
                            }
                            else if (coordinatesIn.hasOwnProperty('p2')) {
                                pointIn = secondPoint = coordinatesIn['p2'];
                                pointOut1 = thirdPoint = coordinatesOut['p3'];
                                pointOut2 = firstPoint = coordinatesOut['p1'];
                            }
                            else if (coordinatesIn.hasOwnProperty('p3')) {
                                pointIn = thirdPoint = coordinatesIn['p3'];
                                pointOut1 = firstPoint = coordinatesOut['p1'];
                                pointOut2 = secondPoint = coordinatesOut['p2'];
                            }

                            var addClippedTriangleToIndices = function (clippedPolygon, newInnerPointIndex, definedPoint) {
                                //two outer points
                                for (var sub in clippedPolygon) {
                                    var point = clippedPolygon[sub];
                                    var isInnerPoint = point.index === definedPoint.index;

                                    var newPointIndex = -1;

                                    if (OldIndices.hasOwnProperty(point.index)) {
                                        if (isInnerPoint) {
                                            newPointIndex = OldIndices[definedPoint.index];
                                        }
                                        else {
                                            //ein äßerer Punkt
                                            var indexArray = OldIndices[point.index];
                                            for (var index in indexArray) {
                                                var item = indexArray[index];
                                                if (item.oppI == newInnerPointIndex) newPointIndex = item.i;
                                                if (newPointIndex !== -1) break;
                                            }
                                            if (newPointIndex === -1) {
                                                newPointIndex = filteredArray.length / 3
                                                //newPointIndex = { i: filteredArray.length / 3, oppI: newInnerPointIndex };
                                                OldIndices[point.index].push({ i: newPointIndex, oppI: newInnerPointIndex });
                                                filteredArray.push(point.x);
                                                filteredArray.push(point.y);
                                                filteredArray.push(point.z);

                                            }
                                            //var indexArray = OldIndices[point.index];
                                            //var item = indexArray[0]
                                            //newPointIndex = item.i;
                                        }

                                    }
                                    else {

                                        //define the array
                                        if (isInnerPoint) {
                                            newPointIndex = newInnerPointIndex;
                                            OldIndices[point.index] = newInnerPointIndex;
                                        }
                                        else {
                                            newPointIndex = filteredArray.length / 3;
                                            OldIndices[point.index] = [{ i: newPointIndex, oppI: newInnerPointIndex }];
                                            filteredArray.push(point.x);
                                            filteredArray.push(point.y);
                                            filteredArray.push(point.z);
                                        }


                                    }
                                    filteredIndicesArray.push(newPointIndex);

                                }
                            };

                            //var subjectPolygon = [[pointIn.x, pointIn.y], [pointOut1.x, pointOut1.y], [pointOut2.x, pointOut2.y]];
                            var subjectPolygon = [pointIn, pointOut1, pointOut2];
                            var clipPolygon = []; var clippedPolygon = []; var clippedPolygon2 = [];
                            clipPolygon = [new THREE.Vector2(xmin, filterY), new THREE.Vector2(filterX, filterY), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];

                            var point1IsOutsideOf_x = pointOut1.x > filterX;
                            var point2IsOutsideOf_x = pointOut2.x > filterX;
                            var bothPointsOutsideOf_x = (point1IsOutsideOf_x && point2IsOutsideOf_x);
                            var bothPointsInsideOf_x = (pointOut1.x < filterX) && (pointOut2.x < filterX);

                            var point1IsOutsideOf_y = pointOut1.y < filterY;
                            var point2IsOutsideOf_y = pointOut2.y < filterY;
                            var bothPointsOutsideOf_y = (point1IsOutsideOf_y && point2IsOutsideOf_y);
                            var bothPointsInsideOf_y = (pointOut1.y > filterY) && (pointOut2.y > filterY);

                            //var onlyOnepointIsOutsideOf_X = (point1IsOutsideOf_x && !point2IsOutsideOf_x) || (!point1IsOutsideOf_x && point2IsOutsideOf_x);
                            //var onlyOnepointIsOutsideOf_Y = (point1IsOutsideOf_y && !point2IsOutsideOf_y) || (!point1IsOutsideOf_y && point2IsOutsideOf_y);
                            ////var point1IsOutside = point1IsOutsideOf_x || point1IsOutsideOf_y;
                            ////var point2IsOutside = point2IsOutsideOf_x || point2IsOutsideOf_y;
                            ////var bothPointsAreOutside = point1IsOutside && point2IsOutside;

                            //two point are outside of x but inside of y
                            //if (pointOut1.x > filterX && pointOut1.y > filterY && pointOut2.x > filterX && pointOut2.y > filterY) {
                            if ((bothPointsOutsideOf_x && bothPointsInsideOf_y) || (bothPointsInsideOf_x && bothPointsOutsideOf_y)) {
                                ////clipPolygon = [new THREE.Vector2(xmin, ymin), new THREE.Vector2(filterX, ymin), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                                //clipPolygon = [new THREE.Vector2(xmin, filterY), new THREE.Vector2(filterX, filterY), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                                clippedPolygon = geo_util.clip(subjectPolygon, clipPolygon);
                            }
                                ////two ponts are outside of y but inside of x
                                //else if (bothPointsInsideOf_x && bothPointsOutsideOf_y) {
                                ////else if (pointOut1.x < filterX && pointOut1.y < filterY && pointOut2.x < filterX && pointOut2.y < filterY) {
                                //    ////clipPolygon = [new THREE.Vector2(xmin, ymin), new THREE.Vector2(filterX, ymin), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                                //    //clipPolygon = [new THREE.Vector2(xmin, filterY), new THREE.Vector2(filterX, filterY), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                                //    clippedPolygon = geo_util.clip(subjectPolygon, clipPolygon);
                                //}                     
                            else {
                                //else  {

                                var clippedPolygonTemp = geo_util.clip(subjectPolygon, clipPolygon);
                                if (clippedPolygonTemp.length > 3) {
                                    //clippedPolygon = clippedPolygonTemp.slice(0, 3);
                                    for (var idx in clippedPolygonTemp) {
                                        var point = clippedPolygonTemp[idx];
                                        if (point.index === pointIn.index) {
                                            clippedPolygon.push(point);
                                        }
                                        else if (point.oppositePointIndex === pointIn.index) {
                                            clippedPolygon.push(point);
                                        }
                                    }
                                    for (var idx in clippedPolygonTemp) {
                                        var point = clippedPolygonTemp[idx];
                                        if (point.oppositePointIndex === pointIn.index) {
                                            clippedPolygon2.push(point);
                                        }
                                    }
                                    var zeroPoint = new Vector3(filterX, filterY, pointIn.z, -1);
                                    clippedPolygon2.push(zeroPoint);
                                    var zeroPointIndex = filteredArray.length / 3;
                                    OldIndices[zeroPoint.index] = zeroPointIndex;
                                    filteredArray.push(zeroPoint.x);
                                    filteredArray.push(zeroPoint.y);
                                    filteredArray.push(zeroPoint.z);
                                    addClippedTriangleToIndices(clippedPolygon2, zeroPointIndex, zeroPoint);
                                }

                                else {
                                    clippedPolygon = clippedPolygonTemp;
                                }
                            }

                            //one innerPoint  
                            var newInnerPointIndex;
                            //isInnerPoint = point.index === pointIn.index;                    
                            if (OldIndices.hasOwnProperty(pointIn.index)) {
                                newInnerPointIndex = OldIndices[pointIn.index];
                            }
                            else {
                                newInnerPointIndex = filteredArray.length / 3;
                                OldIndices[pointIn.index] = newInnerPointIndex;
                                filteredArray.push(pointIn.x);
                                filteredArray.push(pointIn.y);
                                filteredArray.push(pointIn.z);
                            }
                            addClippedTriangleToIndices(clippedPolygon, newInnerPointIndex, pointIn);
                        }//erster Fall Ende


                        ///zweiter Fall - zwei Punkte drinnen 1 Punkt drausen - produziert zwei neue Punkte
                        if (Object.keys(coordinatesIn).length === 2) {

                            //    var pointIn1 = coordinatesIn[0];
                            //    var pointIn2 = coordinatesIn[1];
                            //    var pointOut = coordinatesOut[0];
                            var pointIn1, pointIn2, pointOut, firstPoint, secondPoint, thirdPoint;
                            if (coordinatesOut.hasOwnProperty('p1')) {
                                pointOut = firstPoint = coordinatesOut['p1'];
                                pointIn1 = secondPoint = coordinatesIn['p2'];
                                pointIn2 = thirdPoint = coordinatesIn['p3'];

                            }
                            else if (coordinatesOut.hasOwnProperty('p2')) {
                                pointOut = secondPoint = coordinatesOut['p2'];
                                pointIn1 = thirdPoint = coordinatesIn['p3'];
                                pointIn2 = firstPoint = coordinatesIn['p1'];
                            }
                            else if (coordinatesOut.hasOwnProperty('p3')) {
                                pointOut = thirdPoint = coordinatesOut['p3'];
                                pointIn1 = firstPoint = coordinatesIn['p1'];
                                pointIn2 = secondPoint = coordinatesIn['p2'];
                            }

                            var subjectPolygon = [pointIn1, pointIn2, pointOut];
                            //var clipPolygon = [
                            //    new THREE.Vector2(xmin, ymin),
                            //    new THREE.Vector2(filterX, ymin),
                            //    new THREE.Vector2(filterX, ymax),
                            //    new THREE.Vector2(xmin, ymax)
                            //];
                            var clipPolygon = [];

                            if ((pointOut.x > filterX && pointOut.y > filterY) || (pointOut.x < filterX && pointOut.y < filterY)) {
                                //clipPolygon = [new THREE.Vector2(xmin, ymin), new THREE.Vector2(filterX, ymin), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                                clipPolygon = [new THREE.Vector2(xmin, filterY), new THREE.Vector2(filterX, filterY), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                            }

                                //else if (pointOut.x < filterX && pointOut.y < filterY) {
                                //    //clipPolygon = [new THREE.Vector2(xmin, filterY), new THREE.Vector2(xmax, filterY), new THREE.Vector2(xmax, ymax), new THREE.Vector2(xmin, ymax)];
                                //    clipPolygon = [new THREE.Vector2(xmin, filterY), new THREE.Vector2(filterX, filterY), new THREE.Vector2(filterX, ymax), new THREE.Vector2(xmin, ymax)];
                                //}
                            else { continue; }

                            var clippedPolygon = geo_util.clip(subjectPolygon, clipPolygon);
                            if (clippedPolygon.length < 4) { continue; }

                            //two innerPoints with different indices and two outerPoints with same index
                            var innerPoints = [];
                            var outerPoints = [];
                            for (var sub in clippedPolygon) {
                                var point = clippedPolygon[sub];
                                if (point.index == pointIn1.index || point.index === pointIn2.index) {
                                    innerPoints.push(point);
                                }
                                else {
                                    outerPoints.push(point);
                                }
                            }

                            var point1, point2;
                            if (outerPoints[0].oppositePointIndex == innerPoints[0].index) {
                                point1 = outerPoints[0];
                                point2 = outerPoints[1];
                            }
                            else if (outerPoints[1].oppositePointIndex == innerPoints[0].index) {
                                point2 = outerPoints[0];
                                point1 = outerPoints[1];
                            }

                            var point0 = innerPoints[0];
                            var newPoint0Index;
                            if (OldIndices.hasOwnProperty(point0.index)) {
                                newPoint0Index = OldIndices[point0.index];
                            }
                            else {
                                newPoint0Index = filteredArray.length / 3;
                                OldIndices[point0.index] = newPoint0Index;
                                filteredArray.push(point0.x);
                                filteredArray.push(point0.y);
                                filteredArray.push(point0.z);

                            }
                            //filteredIndicesArray.push(newPoint0Index);

                            var point3 = innerPoints[1];
                            var newPoint3Index;
                            if (OldIndices.hasOwnProperty(point3.index)) {
                                newPoint3Index = OldIndices[point3.index];
                            }
                            else {
                                newPoint3Index = filteredArray.length / 3;
                                OldIndices[point3.index] = newPoint3Index;
                                filteredArray.push(point3.x);
                                filteredArray.push(point3.y);
                                filteredArray.push(point3.z);

                            }
                            //filteredIndicesArray.push(newPoint3Index);

                            //die zwei Punkte haben den gleichen Index
                            //var point2 = outerPoints[1];
                            var newPoint2Index = -1;
                            //var point1 = outerPoints[0];
                            var newPoint1Index = -1;
                            if (OldIndices.hasOwnProperty(point1.index)) {
                                var indexArray = OldIndices[point1.index];

                                //newPoint1Index = indexArray[0].i;
                                //newPoint2Index = indexArray[1].i;

                                var i1new = false, i2new = false;
                                for (var index in indexArray) {
                                    var item = indexArray[index];
                                    if (item.oppI == newPoint0Index) newPoint1Index = item.i;
                                    if (newPoint1Index !== -1) break;
                                }
                                if (newPoint1Index === -1) {
                                    i1new = true;
                                    newPoint1Index = filteredArray.length / 3;
                                    //OldIndices[point1.index].push({ i: newPoint1Index, oppI: newPoint0Index });
                                    //newPoint1Index = { i: filteredArray.length / 3, oppI: newPoint0Index };
                                    filteredArray.push(point1.x);
                                    filteredArray.push(point1.y);
                                    filteredArray.push(point1.z);
                                }

                                for (var index in indexArray) {
                                    var item = indexArray[index];
                                    if (item.oppI == newPoint3Index) newPoint2Index = item.i;
                                    if (newPoint2Index !== -1) break;
                                }
                                if (newPoint2Index === -1) {
                                    i2new = true;
                                    newPoint2Index = filteredArray.length / 3;
                                    //OldIndices[point2.index].push({ i: newPoint2Index, oppI: newPoint3Index });
                                    //newPoint2Index = { i: filteredArray.length / 3, oppI: newPoint3Index };
                                    filteredArray.push(point2.x);
                                    filteredArray.push(point2.y);
                                    filteredArray.push(point2.z);
                                }
                                if (i1new == true) indexArray.push({ i: newPoint1Index, oppI: newPoint0Index });
                                if (i2new == true) indexArray.push({ i: newPoint2Index, oppI: newPoint3Index });

                            }
                            else {
                                newPoint1Index = filteredArray.length / 3;
                                //OldIndices[point1.index] = filteredArray.length / 3;
                                filteredArray.push(point1.x);
                                filteredArray.push(point1.y);
                                filteredArray.push(point1.z);
                                newPoint2Index = filteredArray.length / 3;
                                //newPoint2Index = { i: newPoint2Index, oppI: newPoint3Index };
                                filteredArray.push(point2.x);
                                filteredArray.push(point2.y);
                                filteredArray.push(point2.z);
                                OldIndices[point1.index] = [{ i: newPoint1Index, oppI: newPoint0Index }, { i: newPoint2Index, oppI: newPoint3Index }];
                            }

                            //first tringle                           
                            filteredIndicesArray.push(newPoint3Index);
                            filteredIndicesArray.push(newPoint1Index);
                            filteredIndicesArray.push(newPoint0Index);

                            //second triangle                         
                            filteredIndicesArray.push(newPoint3Index);
                            filteredIndicesArray.push(newPoint2Index);
                            filteredIndicesArray.push(newPoint1Index);

                        }//zweiter Fall


                    }//else       

                }//for loop

                //var TypeArray = filteredIndicesArray.length > 65535 ? Uint32Array : Uint16Array;
                //var indices2 = new TypeArray(filteredIndicesArray);
                var indices2 = new Uint16Array(filteredIndicesArray);

                //return filteredArray;
                var newEditedTypedArray = new Float32Array(filteredArray);
                return { typedarray: newEditedTypedArray, indicesArray: indices2 };
            },

            filterNewGeometry: function (filterX, filterY) {
                this.stopWorker();

                //this.objectGroup.remove(this.mainMesh);
                this.removeObject(this.mainMesh, true);
                this.mainMesh.geometry.dispose();
                this.mainMesh.material.dispose();
                //this.mainMesh.texture.dispose()

                this.mainGeometry !== null && this.mainGeometry.dispose();
                var geometry = this.mainGeometry = new THREE.BufferGeometry();
                //geometry.dynamic = true;

                //this.mainGeometry.removeAttribute('position');
                var results = this.getFilteredNewIndexedArray(filterX, filterY);

                var positions = this.positions = results.typedarray;
                var bufferAttribute = new THREE.Float32Attribute(results.typedarray, 3);
                bufferAttribute.needsUpdate = true;
                //this.mainGeometry.addAttribute('position', new THREE.BufferAttribute(results.typedarray, 3).setDynamic(true));
                this.mainGeometry.addAttribute('position', bufferAttribute);

                var indices = this.indices = results.indicesArray;
                //var TypeArray = results.indicesArray.length > 65535 ? Uint32Array : Uint16Array;
                //var indices = this.indices = new TypeArray(results.indicesArray);
                var index = new THREE.BufferAttribute(indices, 1);//.setDynamic(true);
                geometry.setIndex(index);

                this.mainGeometry.computeVertexNormals(); // computed vertex normals are orthogonal to the face f       
                this.mainGeometry.computeBoundingBox();

                var mesh = this.mainMesh = new THREE.Mesh(this.mainGeometry, this.materialsArray[0]);
                //var mesh = new THREE.Mesh(geometry, material);  
                mesh.userData.layerId = this.index;
                this.addObject(mesh, true);

                this.buildGraph();
            },

            filter: function (filterX, filterY) {
                var bufferAttribute = this.mainGeometry.getAttribute('position');
                bufferAttribute.array = this.positions = this.getFilteredIndexedArray(filterX, filterY);//positionArray.array);// this.extractFormFromTypedArray(0, 50000, 3, positionArray.array);

                //this.mainGeometry.removeAttribute('position');
                //this.mainGeometry.addAttribute('position', new THREE.BufferAttribute(this.getFilteredIndexedArrayTest(filterX, filterY), 3).setDynamic(true));

                //this.mainGeometry.attributes.position.updateRange.offset = 0; // where to start updating
                //this.mainGeometry.attributes.position.updateRange.count = this.positions.length -1; // how many vertices to update
                //this.mainGeometry.computeVertexNormals();
                this.mainGeometry.attributes.position.needsUpdate = true;
                if (this.mainGeometry.index) {
                    this.mainGeometry.index.needsUpdate = true;
                }
                this.buildGraph();


                //if border is visible toggle the visibility to off
                //this.borderVisible && this.toggleBorderVisible();
            },

            //unindexed + 50 erhöhen
            filter2: function (filterX, filterY) {
                //var positions = this.mainGeometry.attributes.position.array;
                var positions = this.mainGeometry.getAttribute('position').array;
                //var colors = this.mainGeometry.attributes.color.array;

                //var color = new THREE.Color("blue");//0xff0000);
                // components of the position vector for each vertex are stored
                // contiguously in the buffer.
                for (var i = 0; i < positions.length; i += 3) {
                    var x1 = positions[i * 3 + 0];// = vertexPositions[i][0];
                    var y1 = positions[i * 3 + 1];// = vertexPositions[i][1];
                    var z1 = positions[i * 3 + 2];// = vertexPositions[i][2];

                    var x2 = positions[i * 3 + 3];
                    var y2 = positions[i * 3 + 4];
                    var z2 = positions[i * 3 + 5];

                    var x3 = positions[i * 3 + 6];
                    var y3 = positions[i * 3 + 7];
                    var z3 = positions[i * 3 + 8];

                    if ((x1 < filterX && x2 < filterX && x3 < filterX) && (y1 > filterY && y2 > filterY && y3 > filterY)) {

                        positions[i * 3 + 2] += 50;
                        positions[i * 3 + 5] += 50;
                        positions[i * 3 + 8] += 50;


                        //colors[i * 3] = color.r;
                        //colors[i  *3 + 1] = color.g;
                        //colors[i * 3 + 2] = color.b;

                        //colors[i * 3 + 3] = color.r;
                        //colors[i * 3 + 4] = color.g;
                        //colors[i*3 + 5] = color.b;

                        //colors[i * 3 + 6] = color.r;
                        //colors[i * 3 + 7] = color.g;
                        //colors[i * 3 + 8] = color.b;

                    }
                }
                this.mainGeometry.attributes.position.needsUpdate = true;
                //this.mainGeometry.attributes.color.needsUpdate = true;

                //this.mainMesh.geometry.verticesNeedUpdate = true;
            },

            _zfill: function (num, len) {
                return (Array(len).join("0") + num).slice(-len);
            },

            onAdd: function (map) {
                this._map = map;

                this.build(this.getPane());
                //this.update();
                //this.emit('add');

                //if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
                //    map.on('zoomanim', this._animateZoom, this);
                //}
            },

            onRemove: function (map) {

                this.getPane().remove(this.objectGroup);
                //this.emit('remove');

                if (this.mainGeometry) {
                    this.mainGeometry.dispose();
                    this.materialsArray[0].dispose();
                }
                if (this.borderMesh) {
                    this.borderMesh.geometry.dispose();
                    this.borderMesh.material.dispose();
                }
                delete this.features;
                delete this.positions;
                delete this.indices;
                delete this.idx;

                //map.off({
                //    'viewreset': this.update,
                //    'zoomanim': this._animateZoom
                //}, this);
                this._map = null;
            },

            //build BufferGeometry with Index
            build: function (app_scene) {

                var geometry = this.mainGeometry = new THREE.BufferGeometry();
                //geometry.dynamic = true;

                // number of triangles
                //var NUM_TRIANGLES = this.features.length;

                var positions = this.positions = new Float32Array(this.features);
                //var position = new THREE.Float32Attribute(positions, 3);//.setDynamic(true);
                var position = new THREE.Float32Attribute(this.features, 3);
                geometry.addAttribute('position', position);

                //var TypeArray = this.idx.length > 65535 ? Uint32Array : Uint16Array;
                //var indices = this.indices = new TypeArray(this.idx);
                var indices = this.indices = new Uint16Array(this.idx);
                var index = new THREE.BufferAttribute(indices, 1);//.setDynamic(true);
                geometry.setIndex(index);
                //geometry.setIndex((this.idx.length > 65535 ? THREE.Uint32Attribute : THREE.Uint16Attribute)(this.idx, 1));

                // set the normals
                geometry.computeVertexNormals(); // computed vertex normals are orthogonal to the face f
                //// Calculate normals      
                //geometry.computeFaceNormals();
                geometry.computeBoundingBox();

                //geometry.addGroup(0, positions.length, 0); // start, count, materialIndex
                //geometry.addGroup();
                //var material = new THREE.MultiMaterial(this.materialsArray);

                var mesh = this.mainMesh = new THREE.Mesh(geometry, this.materialsArray[0]);
                //var mesh = new THREE.Mesh(geometry, material);
                mesh.userData.layerId = this.index;
                this.addObject(mesh, true);
                //this.mainMesh = mesh;


                //var edges = new THREE.EdgesHelper(mesh, 0x00ff00);
                //this.addObject(edges, false);

                if (app_scene) {
                    app_scene.add(this.objectGroup);
                }
                //if (this.name === "Baden") {
                //    this.buildGraph();
                //}

                this.buildGraph();
            },

            //old build BufferGeometry without Index
            build2: function (app_scene) {
                //var materials = this.materialsArray;
                //var colorm = this._zfill(this.materialsArray[0].color.toString(16), 6);
                //var project = this.project;


                // non-indexed buffer geometry
                var geometry = this.mainGeometry = new THREE.BufferGeometry();
                geometry.dynamic = true;

                // number of triangles
                var NUM_TRIANGLES = this.features.length;

                // attributes

                var positions = this.positions = new Float32Array(NUM_TRIANGLES * 3 * 3);
                //var normals = new Float32Array(NUM_TRIANGLES * 3 * 3);
                //var colors = new Float32Array(NUM_TRIANGLES * 3 *3);
                //var uvs = new Float32Array(NUM_TRIANGLES * 3 * 2);

                //var color = new THREE.Color(colorm);
                ////color.setHex(colorm);

                //var color = new THREE.Color();
                //var scale = 15;
                //var size = 5;
                var x1, y1, z1;
                var x2, y2, z2;
                var x3, y3, z3;

                //for (var i = 0, l = NUM_TRIANGLES * 3; i < l; i++) {
                for (var i = 0, j = 0, l = NUM_TRIANGLES; i < l; i++, j += 9) {

                    var f = this.features[i];

                    x1 = f[0].x;
                    y1 = f[0].y;
                    z1 = f[0].z;
                    x2 = f[1].x;
                    y2 = f[1].y;
                    z2 = f[1].z;
                    x3 = f[2].x;
                    y3 = f[2].y;
                    z3 = f[2].z;


                    //var index = 3 * i;//0, 3, 6, 9
                    // positions
                    positions[j] = x1;
                    positions[j + 1] = y1;
                    positions[j + 2] = z1;

                    positions[j + 3] = x2;
                    positions[j + 4] = y2;
                    positions[j + 5] = z2;

                    positions[j + 6] = x3;
                    positions[j + 7] = y3;
                    positions[j + 8] = z3;

                    //normals -- we will set normals later

                    //// colors
                    ////color.setHSL(i / l, 1.0, 0.5);
                    //colors[j] = color.r;
                    //colors[j + 1] = color.g;
                    //colors[j + 2] = color.b;

                    //colors[j +3] = color.r;
                    //colors[j + 4] = color.g;
                    //colors[j + 5] = color.b;

                    //colors[j + 6] = color.r;
                    //colors[j + 7] = color.g;
                    //colors[j + 8] = color.b;

                    //// uvs
                    //uvs[j] = Math.random(); // just something...
                    //uvs[j + 1] = Math.random();

                }
                var position = new THREE.Float32Attribute(positions, 3).setDynamic(true);
                geometry.addAttribute('position', position);
                //geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
                //geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
                //geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

                //// optional
                //geometry.computeBoundingBox();
                //geometry.computeBoundingSphere();

                // set the normals
                geometry.computeVertexNormals(); // computed vertex normals are orthogonal to the face f
                //// Calculate normals      
                geometry.computeFaceNormals();

                //geometry.addGroup(0, positions.length, 0); // start, count, materialIndex
                //geometry.addGroup();
                //var material = new THREE.MultiMaterial(this.materialsArray);

                var mesh = new THREE.Mesh(geometry, this.materialsArray[0]);
                //var mesh = new THREE.Mesh(geometry, material);
                mesh.userData.layerId = this.index;
                this.addObject(mesh, true);
                this.mainMesh = mesh;


                //var edges = new THREE.EdgesHelper(mesh, 0x00ff00);
                //this.addObject(edges, false);

                if (app_scene) {
                    app_scene.add(this.objectGroup);
                }
                //this.features.length = 0;
                ////delete this.features;

            },

            //old build simple Geometry without Index
            build1: function (app_scene) {
                //var materials = this.materials;
                //var project = this.project;

                //var createObject = function (f) {
                //    //if (f.polygons.length == 1) return createSubObject(f, f.polygons[0], f.zs[0]);
                //    //var group = new THREE.Group();            
                //    //return group;
                //    var geom = new THREE.Geometry();
                //    var v1 = new THREE.Vector3(f.Punkt0.x, f.Punkt0.y, f.Punkt0.z);               
                //    var v2 = new THREE.Vector3(f.Punkt1.x, f.Punkt1.y, f.Punkt1.z);
                //    var v3 = new THREE.Vector3(f.Punkt2.x, f.Punkt2.y, f.Punkt2.z);
                //    geom.vertices.push(v1);
                //    geom.vertices.push(v2);
                //    geom.vertices.push(v3);

                //    geom.faces.push(new THREE.Face3(0, 1, 2));
                //    geom.computeFaceNormals();
                //    geom.computeVertexNormals();

                //    var mesh = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());
                //    mesh.userData.layerId = this.index;
                //    this.addObject(mesh); 
                //};

                var geom = new THREE.Geometry();

                var j = 0;
                for (var i = 0; i < this.features.length; i++) {
                    //var geom = new THREE.Geometry();               
                    var f = this.features[i];

                    //var v1 = new THREE.Vector3(f.Punkt0.x, f.Punkt0.y, f.Punkt0.z);
                    //var v2 = new THREE.Vector3(f.Punkt1.x, f.Punkt1.y, f.Punkt1.z);
                    //var v3 = new THREE.Vector3(f.Punkt2.x, f.Punkt2.y, f.Punkt2.z);
                    var v1 = new THREE.Vector3(f[0].x, f[0].y, f[0].z);
                    var v2 = new THREE.Vector3(f[1].x, f[1].y, f[1].z);
                    var v3 = new THREE.Vector3(f[2].x, f[2].y, f[2].z);

                    geom.vertices.push(v1);
                    geom.vertices.push(v2);
                    geom.vertices.push(v3);
                    var face = new THREE.Face3(j, j + 1, j + 2);
                    face.userData = {
                        featureId: f.id
                        //area: f.area
                    };
                    geom.faces.push(face);
                    //var mesh = new THREE.Mesh(geom, this.materials[0].mat);
                    //mesh.userData.layerId = this.index;
                    //mesh.userData.featureId = f.id;
                    //this.addObject(face);
                    j = j + 3;
                }

                // each feature in this layer
                //this.features.forEach(function (f, fid) {
                //    f.objs = [];
                //    //var obj = createObject(f);
                //    //obj.userData.layerId = this.index;
                //    //obj.userData.featureId = fid;
                //    //this.addObject(obj);
                //    //f.objs.push(obj);
                //}, this);

                //geom.mergeVertices();
                //geom.computeBoundingBox();
                //this.bbox = geom.boundingBox;
                //// Calculate normals      
                //geom.computeFaceNormals();
                //geom.computeVertexNormals();

                ////var mat = new THREE.MeshBasicMaterial({ color: 0xc7ac92, shading: THREE.FlatShading, wireframe: true });
                ////var mesh = new THREE.Mesh(geom, mat);
                var mesh = new THREE.Mesh(geom, this.materialsArray[0]);
                mesh.userData.layerId = this.index;
                this.addObject(mesh);
                this.mainMesh = mesh;

                ////var edges = new THREE.EdgesHelper(mesh, 0x00ff00);
                ////this.addObject(edges, false);
                //var hex = 0xff0000;
                //var bbox = new THREE.EdgesHelper(mesh, hex);
                ////bbox.update();
                //this.addObject(bbox, false);

                //scene.addObject(object);
                if (app_scene) {
                    app_scene.add(this.objectGroup);
                }
                delete this.features;

            },

            buildGraph: function () {
                var graph = this.graph = new Graph();
                //var bottomGraph = new Graph();


                var typedArray = this.positions;
                var indices = this.indices;
                //var typedArray = positions;
                //var indices = indices;

                var x1, y1, z1;
                var x2, y2, z2;
                var x3, y3, z3;

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
                    var node3;
                    if (graph.nodes.hasOwnProperty(v3index)) {
                        node3 = graph.nodes[v3index];
                    }
                    else {
                        node3 = graph.addNode(new THREE.Vector3(x3, y3, z3), v3index);
                    }
                    graph.addFaceFromNodes([node1, node2, node3]);
                }


                //graph.firstQuartalFaces = $.grep(graph.faces, function (face, i) {
                //    //return face.nodes[0].pos.x > 0 && face.nodes[1].pos.x > 0 && face.nodes[2].pos.x > 0 &&
                //    //    face.nodes[0].pos.y > 0 && face.nodes[1].pos.y > 0 && face.nodes[2].pos.y > 0 &&
                //    //    face.nodes[0].pos.x < xMax && face.nodes[1].pos.x < xMax && face.nodes[2].pos.x < xMax;

                //    return (Math.max(face.nodes[0].pos.x, face.nodes[1].pos.x, face.nodes[2].pos.x) < 0) &&
                //       (Math.max(face.nodes[0].pos.y, face.nodes[1].pos.y, face.nodes[2].pos.y) >= 0);

                //});
                //graph.secondQuartalFaces = $.grep(graph.faces, function (face, i) {

                //    return (Math.max(face.nodes[0].pos.x, face.nodes[1].pos.x, face.nodes[2].pos.x) >= 0) &&
                //       (Math.max(face.nodes[0].pos.y, face.nodes[1].pos.y, face.nodes[2].pos.y) >= 0);

                //});
                //graph.thirdQuartalFaces = $.grep(graph.faces, function (face, i) {

                //    return (Math.max(face.nodes[0].pos.x, face.nodes[1].pos.x, face.nodes[2].pos.x) < 0) &&
                //       (Math.max(face.nodes[0].pos.y, face.nodes[1].pos.y, face.nodes[2].pos.y) < 0);

                //});
                //graph.fourthQuartalFaces = $.grep(graph.faces, function (face, i) {

                //    return (Math.max(face.nodes[0].pos.x, face.nodes[1].pos.x, face.nodes[2].pos.x) >= 0) &&
                //       (Math.max(face.nodes[0].pos.y, face.nodes[1].pos.y, face.nodes[2].pos.y) < 0);

                //});
            },

            asyncBuildBorder: function (check) {

                var self = this;

                var def = $.Deferred();

                if (this.borderMesh) {
                    this.objectGroup.remove(this.borderMesh);
                    this.borderMesh.geometry.dispose();
                    this.borderMesh.material.dispose()
                }

                var borderEdges = this.graph.edges.filter(function (edge) {
                    return edge.faces.length === 1;
                });
                for (var i = 0; i < borderEdges.length; i++) {
                    var item = borderEdges[i];
                    item.faces = [];
                    item.n1.edges = [];
                    item.n2.edges = [];
                }

                //var worker;
                if (typeof (Worker) !== "undefined") {

                    var b = this._getQueryableObjects2()[0];
                    var index = b.geometry.index.array;
                    var vertices = b.geometry.attributes.position.array;

                    this.work({ file: util.scriptFolder() + 'calc.js', args: { borderEdges: borderEdges, vertices: vertices, index: index, check: check } }).then(function (data) {
                        //Worker completed successfully
                        //console.log(data);
                        //document.getElementById("footerText").innerHTML = data.length;
                        //alert(typeof (data));
                        //////////////////////test!!!!!!!!!!!!!!!!!!! test!!!!!!!!!!!

                        if (data.length > 0) {
                            var geometry = new THREE.BufferGeometry();
                            var positions = new Float32Array(data);
                            var position = new THREE.Float32Attribute(positions, 3);
                            geometry.addAttribute('position', position);
                            var borderMesh = self.borderMesh = new THREE.Mesh(geometry, self.materialsArray[0]);
                            self.addObject(borderMesh, false);
                            //self.borderVisible = true;
                        }
                        //else {
                        //    console.log("no data");
                        //}
                        //self._map.scene.updateMatrixWorld();
                        //self.emit("border-change", { test: "test" });
                        self.toggleBorderVisible(true);

                        def.resolve("success");
                    }).fail(function (data) {
                        //Worker threw an error
                        console.log(data);
                        def.reject(data);
                    });

                }
                else {
                    def.reject("Sorry! No Web Worker support.");
                }



                //Return the promise object (an "immutable" Deferred object for consumers to use)
                return def.promise();
            },

            work: function (args) {
                var def = $.Deferred();

                if (window.Worker) {
                    if (this.worker) {
                        this.stopWorker();
                    }
                    //Construct the Web Worker
                    this.worker = new Worker(args.file);

                    //worker.onmessage = function (event) {
                    this.worker.addEventListener('message', function (event) {
                        this.worker = null;
                        //this.setStatus("Finished");
                        //If the Worker reports success, resolve the Deferred
                        def.resolve(event.data);

                    }, false);

                    //worker.onerror = function(event) {
                    //    //If the Worker reports an error, reject the Deferred
                    //    dfd.reject(event); 
                    //};
                    this.worker.addEventListener('error', function (event) {
                        //Reject the Deferred if the Web Worker has an error
                        def.reject(event);
                    }, false);

                    this.worker.postMessage({ args: args.args });  //Start the worker with supplied args
                }
                else {
                    //Need to do something when the browser doesn't have Web Workers
                    def.reject("no worker");
                }

                //Return the promise object (an "immutable" Deferred object for consumers to use)
                return def.promise();
            },

            stopWorker: function () {
                if (this.worker) {
                    this.worker.terminate();
                    this.worker = null;
                }
            },

            buildLineBorder: function () {
                var graph = new Graph();
                //var bottomGraph = new Graph();


                var typedArray = this.positions;
                var indices = this.indices;

                var x1, y1, z1;
                var x2, y2, z2;
                var x3, y3, z3;

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


                    graph.addFaceFromNodes([node1, node2, node3]);

                }

                var geometry = new THREE.Geometry();

                //var geometry = new THREE.BufferGeometry();
                //var vertices = [];
                //var idx = [];

                ////var borderEdges = [];
                ////for (i = 0; i < graph.edges.length; i++) {
                ////    var edge = graph.edges[i];
                ////    if (edge.faces.length === 1) {
                ////        edge.border === true;
                ////        borderEdges.push(edge);
                ////    }
                ////}
                ////var borderArray = new Float32Array(borderEdges.length * 2);

                var b = this._getQueryableObjects();//alle
                var j = 0;
                for (i = 0; i < graph.edges.length; i++) {
                    var edge = graph.edges[i];
                    if (edge.faces.length === 1) {
                        edge.border === true;
                        //geometry.vertices.push(
                        //    edge.n1.pos,
                        //    edge.n2.pos
                        //);
                        //build Border

                        //var startPosition = edge.n1.pos;
                        //startPosition.z = 60;// += 0.5;
                        var direction = new THREE.Vector3(0, 0, -1);

                        var raycaster = new THREE.Raycaster(edge.n1.pos, direction);
                        var intersects = raycaster.identifyObjects(b, false);

                        //raycaster = new THREE.Raycaster(edge.n2.pos, direction);
                        //var intersects2 = raycaster.intersectObjects(b, false);

                        if (intersects.length > 0) {
                            //vertices.push(edge.n1.pos, intersects[0].point);
                            ////vertices.push(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);


                            geometry.vertices.push(
                               edge.n1.pos,
                               intersects[0].point
                               //edge.n2.pos,
                               //intersects2[0].point
                           );
                            //var face = new THREE.Face3(j, j + 1, j + 3);                        
                            //geometry.faces.push(face);
                            //face = new THREE.Face3(j, j + 2, j + 3);
                            //geometry.faces.push(face);
                            //j = j + 4;
                        }

                    }
                }

                var material = new THREE.LineBasicMaterial({ color: this.color, opacity: 1, linewidth: 2 });
                //var line = new THREE.Line(geometry, material);
                var line = new THREE.LineSegments(geometry, material);
                this.addObject(line, false);


            },

            buildTriangleBorder: function () {

                var borderEdges = this.graph.edges.filter(function (edge) {
                    return edge.faces.length === 1;
                });

                var geometry = new THREE.BufferGeometry();
                var vertices = [];
                //var idx = [];
                //var nullVector = new THREE.Vector3(0, 0, 0);

                var b = this._getQueryableObjects3();//alle faces vom nächsten Layer
                //var b = this._getQueryableObjects2();//alle abfragbaren Geometrien vom nächsten Layer
                var raycaster = new Raycaster();
                var j = 0;
                var direction = new THREE.Vector3(0, 0, -1);
                var faces;



                //this._getRaycastPositions(borderEdges);

                //var notVistedEdges = [];
                for (var i = 0; i < borderEdges.length; i++) {

                    var edge = borderEdges[i];
                    edge.border === true;

                    //var faces = $.grep(b.faces, function (face, i) {
                    //    //return face.nodes[0].pos.x > 0 && face.nodes[1].pos.x > 0 && face.nodes[2].pos.x > 0 &&
                    //    //    face.nodes[0].pos.y > 0 && face.nodes[1].pos.y > 0 && face.nodes[2].pos.y > 0 &&
                    //    //    face.nodes[0].pos.x < xMax && face.nodes[1].pos.x < xMax && face.nodes[2].pos.x < xMax;

                    //    var x1 = face.nodes[0].pos.x;
                    //    var x2 = face.nodes[1].pos.x;
                    //    var x3 = face.nodes[2].pos.x;
                    //    var y1 = face.nodes[0].pos.x;
                    //    var y2 = face.nodes[1].pos.x;
                    //    var y3 = face.nodes[2].pos.x;

                    //    var xMin = Math.min(x1, Math.min(x2, x3)) - 0.01;
                    //    var yMin = Math.min(y1, Math.min(y2, y3)) - 0.01;

                    //    var xMax = Math.max(x1, Math.max(x2, x3)) + 0.01;
                    //    var yMax = Math.max(y1, Math.max(y2, y3)) + 0.01;

                    //    return !(edge.n1.x < xMin || edge.n1.x > xMax || edge.n1.y < yMin || edge.n1.y > yMax);

                    //});


                    if (edge.n1.visited === false) {
                        faces = null;
                        if (edge.n1.pos.x < 0 && edge.n1.pos.y >= 0) {
                            faces = b.firstQuartalFaces;
                        }
                        else if (edge.n1.pos.x >= 0 && edge.n1.pos.y >= 0) {
                            faces = b.secondQuartalFaces;
                        }
                        else if (edge.n1.pos.x < 0 && edge.n1.pos.y < 0) {
                            faces = b.thirdQuartalFaces;
                        }
                        else if (edge.n1.pos.x >= 0 && edge.n1.pos.y < 0) {
                            faces = b.fourthQuartalFaces;
                        }
                        //else { continue;}

                        //var raycaster = new Raycaster(edge.n1.pos, direction);
                        var intersects = raycaster.identifyObjects3(faces, edge.n1.pos, direction, true);
                        if (intersects.length > 0) {//&& intersects[0].point.x != 0 && intersects[0].point.y != 0 && intersects[0].point.z != 0) {
                            edge.n1.raycastPos = intersects[0].point;
                            edge.n1.visited = true;
                        }
                    }


                    if (edge.n2.visited === false) {
                        faces = null;
                        if (edge.n2.pos.x < 0 && edge.n2.pos.y >= 0) {
                            faces = b.firstQuartalFaces;
                        }
                        else if (edge.n2.pos.x >= 0 && edge.n2.pos.y >= 0) {
                            faces = b.secondQuartalFaces;
                        }
                        else if (edge.n2.pos.x < 0 && edge.n2.pos.y < 0) {
                            faces = b.thirdQuartalFaces;
                        }
                        else if (edge.n1.pos.x >= 0 && edge.n1.pos.y < 0) {
                            faces = b.fourthQuartalFaces;
                        }
                        //else { continue; }

                        //var raycaster = new Raycaster(edge.n2.pos, direction);
                        var intersects2 = raycaster.identifyObjects3(faces, edge.n2.pos, direction, true);
                        if (intersects2.length > 0) {// && intersects2[0].point.x != 0 && intersects2[0].point.y != 0 && intersects2[0].point.z != 0) {
                            edge.n2.raycastPos = intersects2[0].point;
                            edge.n2.visited = true;
                        }
                    }



                    if (edge.n1.visited === true && edge.n2.visited === false) {
                        edge.n2.raycastPos = edge.n1.raycastPos;
                        //edge.n2.raycastPos = new THREE.Vector3(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                        //edge.n2.raycastPos.copy(edge.n1.raycastPos);
                        //edge.n2.raycastPos.set(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                        edge.n2.visited = true;
                    }
                    else if (edge.n1.visited === false && edge.n2.visited === true) {
                        edge.n1.raycastPos = edge.n2.raycastPos;
                        //edge.n1.raycastPos = new THREE.Vector3(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                        //edge.n1.raycastPos.copy(edge.n2.raycastPos);
                        //edge.n1.raycastPos.set(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                        edge.n1.visited = true;
                    }



                    ////if (edge.n1.visited == false && edge.n2.visited == false && i > 0) {
                    ////    //alert("test");                    
                    ////    var previousEdge = borderEdges[i - 1];
                    ////    //edge.n1.raycastPos = previousEdge.n2.visited === true ? previousEdge.n2.raycastPos : previousEdge.n1.raycastPos;
                    ////    //edge.n1.visited = true;

                    ////    if (previousEdge.n2.visited === true) {
                    ////        //edge.n1.raycastPos.copy(previousEdge.n2.raycastPos);  
                    ////        edge.n1.raycastPos = new THREE.Vector3(edge.n1.x, edge.n1.y, previousEdge.n2.raycastPos.z); //previousEdge.n2.raycastPos;
                    ////        edge.n1.visited = true;
                    ////        //edge.n2.raycastPos.copy(previousEdge.n2.raycastPos);
                    ////        edge.n2.raycastPos = new THREE.Vector3(edge.n2.x, edge.n2.y, previousEdge.n2.raycastPos.z); //previousEdge.n2.raycastPos;
                    ////        edge.n2.visited = true;
                    ////    }
                    ////    else if (previousEdge.n1.visited === true) {
                    ////        //edge.n1.raycastPos.copy(previousEdge.n1.raycastPos);
                    ////        edge.n1.raycastPos = new THREE.Vector3(edge.n1.x, edge.n1.y, previousEdge.n1.raycastPos.z); //previousEdge.n1.raycastPos;
                    ////        edge.n1.visited = true;
                    ////        //edge.n2.raycastPos.copy(previousEdge.n1.raycastPos);
                    ////        edge.n2.raycastPos = new THREE.Vector3(edge.n2.x, edge.n2.y, previousEdge.n1.raycastPos.z); // previousEdge.n1.raycastPos;
                    ////        edge.n2.visited = true;
                    ////    }
                    ////}



                    //if (intersects.length > 0 && intersects2.length > 0) {
                    if (edge.n1.raycastPos && edge.n2.raycastPos) {
                        ////vertices.push(edge.n1.pos, intersects[0].point);
                        ////vertices.push(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
                        vertices[vertices.length] = edge.n1.pos.x;
                        vertices[vertices.length] = edge.n1.pos.y;
                        vertices[vertices.length] = edge.n1.pos.z;
                        //vertices[vertices.length] = intersects[0].point.x;
                        //vertices[vertices.length] = intersects[0].point.y;
                        //vertices[vertices.length] = intersects[0].point.z;
                        //vertices[vertices.length] = intersects2[0].point.x;
                        //vertices[vertices.length] = intersects2[0].point.y;
                        //vertices[vertices.length] = intersects2[0].point.z;
                        vertices[vertices.length] = edge.n1.raycastPos.x;
                        vertices[vertices.length] = edge.n1.raycastPos.y;
                        vertices[vertices.length] = edge.n1.raycastPos.z;
                        vertices[vertices.length] = edge.n2.raycastPos.x;
                        vertices[vertices.length] = edge.n2.raycastPos.y;
                        vertices[vertices.length] = edge.n2.raycastPos.z;

                        vertices[vertices.length] = edge.n1.pos.x;
                        vertices[vertices.length] = edge.n1.pos.y;
                        vertices[vertices.length] = edge.n1.pos.z;
                        vertices[vertices.length] = edge.n2.pos.x;
                        vertices[vertices.length] = edge.n2.pos.y;
                        vertices[vertices.length] = edge.n2.pos.z;
                        //vertices[vertices.length] = intersects2[0].point.x;
                        //vertices[vertices.length] = intersects2[0].point.y;
                        //vertices[vertices.length] = intersects2[0].point.z;
                        vertices[vertices.length] = edge.n2.raycastPos.x;
                        vertices[vertices.length] = edge.n2.raycastPos.y;
                        vertices[vertices.length] = edge.n2.raycastPos.z;



                        j = j + 12;

                        ////vertices[vertices.length] = edge.n1.pos.y;
                        ////vertices[vertices.length] = edge.n1.pos.z;
                        ////vertices[vertices.length] = intersects[0].point.x;
                        ////vertices[vertices.length] = intersects[0].point.y;
                        ////vertices[vertices.length] = intersects[0].point.z;

                        // geometry.vertices.push(
                        //    edge.n1.pos,
                        //    intersects[0].point,
                        //    edge.n2.pos,
                        //    intersects2[0].point
                        //);
                        // var face = new THREE.Face3(j, j + 1, j + 3);                        
                        // geometry.faces.push(face);
                        // face = new THREE.Face3(j, j + 2, j + 3);
                        // geometry.faces.push(face);
                        // j = j + 4;
                    }

                } //for loop borderEdges

                // number of triangles
                //var NUM_TRIANGLES = vertices.length;
                var positions = new Float32Array(vertices);
                var position = new THREE.Float32Attribute(positions, 3);
                geometry.addAttribute('position', position);

                //for (var i = 0; i <= vertices.length -3; i+2)
                //{
                //    idx.push(i, i+1, i +2, i, i + 3, i + 2);
                //}
                //var indices = new Uint16Array(idx);
                //var index = new THREE.BufferAttribute(indices, 1);
                //geometry.setIndex(index);

                //var material = new THREE.LineBasicMaterial({ color: this.color, opacity:1, linewidth: 2 });
                //var line = new THREE.Line(geometry, material);
                //var line = new THREE.LineSegments(geometry, material);
                //this.addObject(line, false);

                var borderMesh = this.borderMesh = new THREE.Mesh(geometry, this.materialsArray[0]);
                this.addObject(borderMesh, false);


            },

            _getRaycastPositions: function (borderEdges) {
                var direction = new THREE.Vector3(0, 0, -1);
                var b = this._getQueryableObjects3();//alle faces vom nächsten Layer           
                var raycaster = new Raycaster();
                var notVistedEdges = [];
                for (var i = 0; i < borderEdges.length; i++) {

                    var edge = borderEdges[i];
                    edge.border === true;

                    //var startPosition = edge.n1.pos;
                    //startPosition.z = 60;// += 0.5;

                    //var tolerance = 0.15;            
                    var faces = null;
                    if (edge.n1.visited === false) {
                        faces = null;
                        if (edge.n1.pos.x < 0 && edge.n1.pos.y >= 0) {
                            faces = b.firstQuartalFaces;
                        }
                        else if (edge.n1.pos.x >= 0 && edge.n1.pos.y >= 0) {
                            faces = b.secondQuartalFaces;
                        }
                        else if (edge.n1.pos.x < 0 && edge.n1.pos.y < 0) {
                            faces = b.thirdQuartalFaces;
                        }
                        else if (edge.n1.pos.x >= 0 && edge.n1.pos.y < 0) {
                            faces = b.fourthQuartalFaces;
                        }
                        //else { continue;}

                        //var raycaster = new Raycaster(edge.n1.pos, direction);
                        var intersects = raycaster.identifyObjects3(faces, edge.n1.pos, direction, true);
                        if (intersects.length > 0) {//&& intersects[0].point.x != 0 && intersects[0].point.y != 0 && intersects[0].point.z != 0) {
                            edge.n1.raycastPos = intersects[0].point;
                            edge.n1.visited = true;
                        }
                    }


                    if (edge.n2.visited === false) {
                        faces = null;
                        if (edge.n2.pos.x < 0 && edge.n2.pos.y >= 0) {
                            faces = b.firstQuartalFaces;
                        }
                        else if (edge.n2.pos.x >= 0 && edge.n2.pos.y >= 0) {
                            faces = b.secondQuartalFaces;
                        }
                        else if (edge.n2.pos.x < 0 && edge.n2.pos.y < 0) {
                            faces = b.thirdQuartalFaces;
                        }
                        else if (edge.n1.pos.x >= 0 && edge.n1.pos.y < 0) {
                            faces = b.fourthQuartalFaces;
                        }
                        //else { continue; }
                        //var raycaster = new Raycaster(edge.n2.pos, direction);
                        var intersects2 = raycaster.identifyObjects3(faces, edge.n2.pos, direction, true);
                        if (intersects2.length > 0) {// && intersects2[0].point.x != 0 && intersects2[0].point.y != 0 && intersects2[0].point.z != 0) {
                            edge.n2.raycastPos = intersects2[0].point;
                            edge.n2.visited = true;
                        }
                    }



                    //this.findNeighbourNode();

                    if (edge.n1.visited === true && edge.n2.visited === false) {
                        edge.n2.raycastPos = edge.n1.raycastPos;
                        //edge.n2.raycastPos = new THREE.Vector3(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                        //edge.n2.raycastPos.copy(edge.n1.raycastPos);
                        //edge.n2.raycastPos.set(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                        edge.n2.visited = true;
                    }
                    else if (edge.n1.visited === false && edge.n2.visited === true) {
                        edge.n1.raycastPos = edge.n2.raycastPos;
                        //edge.n1.raycastPos = new THREE.Vector3(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                        //edge.n1.raycastPos.copy(edge.n2.raycastPos);
                        //edge.n1.raycastPos.set(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                        edge.n1.visited = true;
                    }
                    else if (edge.n1.visited === false && edge.n2.visited === false) {
                        notVistedEdges.push(edge);
                    }
                }//for loop
                if (notVistedEdges.length > 0) {
                    this._getRaycastPositions(notVistedEdges);
                }
            },

            //without check
            buildTriangleBorder2: function () {

                var borderEdges = this.graph.edges.filter(function (edge) {
                    return edge.faces.length === 1;
                });

                var geometry = new THREE.BufferGeometry();
                var vertices = [];
                var idx = [];
                //var nullVector = new THREE.Vector3(0, 0, 0);

                var b = this._getQueryableObjects2();//query queryable objects of next layer
                var raycaster = new Raycaster();
                var j = 0;


                for (var i = 0; i < borderEdges.length; i++) {
                    //var edge = this.graph.edges[i];
                    //if (edge.faces.length === 1) {   
                    var edge = borderEdges[i];
                    edge.border === true;

                    var direction = new THREE.Vector3(0, 0, -1);
                    //var tolerance = 0.15;


                    if (edge.n1.visited === false) {
                        //var raycaster = new Raycaster(edge.n1.pos, direction);
                        var intersects = raycaster.identifyObjects(b, edge.n1.pos, direction, false);
                        if (intersects.length > 0) {// && intersects[0].point.x !== 0 && intersects[0].point.y !== 0 && intersects[0].point.z !== 0) {
                            edge.n1.raycastPos = intersects[0].point;
                            edge.n1.visited = true;
                        }
                    }


                    if (edge.n2.visited === false) {
                        //var raycaster = new Raycaster(edge.n2.pos, direction);
                        var intersects2 = raycaster.identifyObjects(b, edge.n2.pos, direction, false);
                        if (intersects2.length) {// > 0 && intersects2[0].point.x !== 0 && intersects2[0].point.y !== 0 && intersects2[0].point.z !== 0) {
                            edge.n2.raycastPos = intersects2[0].point;
                            edge.n2.visited = true;
                        }
                    }

                    //if (intersects.length > 0 && intersects2.length > 0) {
                    if (edge.n1.raycastPos && edge.n2.raycastPos) {
                        ////vertices.push(edge.n1.pos, intersects[0].point);
                        ////vertices.push(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
                        vertices[vertices.length] = edge.n1.pos.x;
                        vertices[vertices.length] = edge.n1.pos.y;
                        vertices[vertices.length] = edge.n1.pos.z;
                        vertices[vertices.length] = edge.n1.raycastPos.x;
                        vertices[vertices.length] = edge.n1.raycastPos.y;
                        vertices[vertices.length] = edge.n1.raycastPos.z;
                        vertices[vertices.length] = edge.n2.raycastPos.x;
                        vertices[vertices.length] = edge.n2.raycastPos.y;
                        vertices[vertices.length] = edge.n2.raycastPos.z;

                        vertices[vertices.length] = edge.n1.pos.x;
                        vertices[vertices.length] = edge.n1.pos.y;
                        vertices[vertices.length] = edge.n1.pos.z;
                        vertices[vertices.length] = edge.n2.pos.x;
                        vertices[vertices.length] = edge.n2.pos.y;
                        vertices[vertices.length] = edge.n2.pos.z;
                        vertices[vertices.length] = edge.n2.raycastPos.x;
                        vertices[vertices.length] = edge.n2.raycastPos.y;
                        vertices[vertices.length] = edge.n2.raycastPos.z;

                        //j = j + 12;

                    }



                }
                // number of triangles
                //var NUM_TRIANGLES = vertices.length;
                var positions = new Float32Array(vertices);
                var position = new THREE.Float32Attribute(positions, 3);
                geometry.addAttribute('position', position);

                var borderMesh = this.borderMesh = new THREE.Mesh(geometry, this.materialsArray[0]);
                this.addObject(borderMesh, false);
            },

            _getQueryableObjects: function () {

                var _queryableObjects = [];
                this._map._layers.forEach(function (layer) {
                    //if (layer.visible && layer.queryableObjects.length) {
                    if (layer.queryableObjects.length && layer.index > this.index) {
                        _queryableObjects = _queryableObjects.concat(layer.queryableObjects);
                    }
                }, this);

                return _queryableObjects;
            },

            _getQueryableObjects2: function () {

                var _queryableObjects = [];
                //this.layers.forEach(function (layer) {
                //    //if (layer.visible && layer.queryableObjects.length) {
                //    if (layer.queryableObjects.length && layer.index > this.index) {
                //        _queryableObjects = _queryableObjects.concat(layer.queryableObjects);
                //    }
                //}, this);
                var layer = this._map._layers[this.index + 1];
                _queryableObjects = _queryableObjects.concat(layer.queryableObjects);

                return _queryableObjects;
            },
            _getQueryableObjects3: function () {

                //var _queryableObjects = [];
                //this.layers.forEach(function (layer) {
                //    //if (layer.visible && layer.queryableObjects.length) {
                //    if (layer.queryableObjects.length && layer.index > this.index) {
                //        _queryableObjects = _queryableObjects.concat(layer.queryableObjects);
                //    }
                //}, this);
                var layer = this._map._layers[this.index + 1];
                //_queryableObjects = _queryableObjects.concat(layer.queryableObjects);

                return layer.graph;
            },


            addObject: function (object, queryable) {
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

            removeObject: function (object, queryable) {
                if (queryable === undefined) {
                    queryable = this.q;
                }
                this.objectGroup.remove(object);
                if (queryable) {
                    this._removeQueryableObject(object);
                }
            },

            _removeQueryableObject: function (object) {
                var index = this.queryableObjects.indexOf(object);
                if (index != -1)
                    this.queryableObjects.splice(index, 1);

                //this.queryableObjects.length = 0;
            },

        });

        return DxfLayer;

    });