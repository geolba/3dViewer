define('gba/layer/DemBlock', ['three', 'app/commonConfig'], function (THREE, appSettings) {
    "use strict";

    /**
     * This is our classes constructor; unlike AS3 this is where we define our member properties (fields).
     * To differentiate constructor functions from regular functions, by convention we start the function 
     * name with a capital letter.  This informs users that they must invoke the Person function using
     * the `new` keyword and treat it as a constructor (ie: it returns a new instance of the Class).
     */
    function DemBlock(params) {

        //properties
        for (var k in params) {
            this[k] = params[k];
        }
        this.aObjs = [];
        //eventuell wieder löschen:
        this.mIndex = 0;
    }

    DemBlock.prototype = {

        /**
    	 * Whenever you replace an Object's Prototype, you need to repoint
    	 * the base Constructor back at the original constructor Function, 
    	 * otherwise `instanceof` calls will fail.
    	 */
        constructor: DemBlock,

        buidldPlaneBufferGeometry: function (width, height, widthSegments, heightSegments) {
            var geometry = new THREE.BufferGeometry();
            //geometry.dynamic = true;

            var width_half = width / 2;
            var height_half = height / 2;

            var gridX = widthSegments || 1;
            var gridY = heightSegments || 1;

            var gridX1 = gridX + 1;
            var gridY1 = gridY + 1;

            var segment_width = width / gridX;
            var segment_height = height / gridY;

            //var vertices = this.layer.positions = new Float32Array(gridX1 * gridY1 * 3);
            var vertices = new Float32Array(gridX1 * gridY1 * 3);
            var normals = new Float32Array(gridX1 * gridY1 * 3);
            var uvs = new Float32Array(gridX1 * gridY1 * 2);

            var offset = 0;
            var offset2 = 0;

            for (var iy = 0; iy < gridY1; iy++) {

                var y = iy * segment_height - height_half;

                for (var ix = 0; ix < gridX1; ix++) {

                    var x = ix * segment_width - width_half;

                    vertices[offset] = x;
                    vertices[offset + 1] = -y;                   
                    vertices[offset + 2] = this.layer.materialParameter[0].bottomZ;

                    normals[offset + 2] = 1;

                    uvs[offset2] = ix / gridX;
                    uvs[offset2 + 1] = 1 - (iy / gridY);

                    offset += 3;
                    offset2 += 2;

                }

            }
            var position = new THREE.Float32Attribute(vertices, 3).setDynamic(true);
            geometry.addAttribute('position', position);

            offset = 0;
            //var indices = this.layer.indices = new Uint16Array(gridX * gridY * 6);
            var indices = new Uint16Array(gridX * gridY * 6);

            for (var iy = 0; iy < gridY; iy++) {

                for (var ix = 0; ix < gridX; ix++) {

                    var a = ix + gridX1 * iy;
                    var b = ix + gridX1 * (iy + 1);
                    var c = (ix + 1) + gridX1 * (iy + 1);
                    var d = (ix + 1) + gridX1 * iy;

                    indices[offset] = a;
                    indices[offset + 1] = b;
                    indices[offset + 2] = d;

                    indices[offset + 3] = b;
                    indices[offset + 4] = c;
                    indices[offset + 5] = d;

                    offset += 6;

                }

            }
            //geometry.attributes['index'] = { array: indices, itemSize: 1 };
            //geometry.setIndex(new THREE.BufferAttribute(indices, 1).setDynamic(true));
            //geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));
            var index = new THREE.BufferAttribute(indices, 1).setDynamic(true);
            geometry.setIndex(index);

            geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
            geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            //geometry.attributes['normal'] = { array: normals, itemSize: 3 };
            //geometry.attributes['uv'] = { array: uvs, itemSize: 2 };

            return geometry;
        },

        build: function (layer) {
            var xPixel = this.width;
            var widthSegments = xPixel - 1; //this.width = xPixel
            var yPixel = this.height;
            var heightSegments = yPixel - 1;
            
            //appSettings.Options.exportMode = true;
            var PlaneGeometry = (appSettings.Options.exportMode) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry;
            //var geom = layer.mainGeometry = new PlaneGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
            var geom = layer.mainGeometry = this.buidldPlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);// new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, 11, 7);

            //var geom = layer.mainGeometry = planeGeometry.toNonIndexed();
            this.layer.features = geom.attributes.position.array;
            this.layer.idx = geom.getIndex() !== null ? geom.getIndex().array : null;
            var dem_data = this.dem_values;
          

            ////// Filling of the DEM plane
            //var vertices = geom.attributes.position.array;
            //for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            //    // x
            //    //vertices[i] = defaultVertices[i] + (rand(-opts.variance.x, opts.variance.x));
            //    // y
            //    //vertices[i + 1] =

            //    //z
            //    vertices[j + 2] = dem_data[i];
            //}
            var i, j, l;
            if (appSettings.Options.exportMode) { //PlaneGeometry
                if (dem_data.length > 0) {
                    for (i = 0, l = geom.vertices.length; i < l; i++) {                  
                        geom.vertices[i].z = dem_data[i];
                    }                   
                }
                else {
                    for (i = 0, l = geom.vertices.length; i < l; i++) {
                        geom.vertices[i].z = layer.materialParameter[0].bottomZ;
                    }
                }
            }

            else { //Plane PlaneBufferGeometry
                var vertices = geom.attributes.position.array;
                if (dem_data.length > 0) {
                    for (i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                        //z
                        var hoehenwert = !isNaN(dem_data[i]) ? dem_data[i] : 5;
                        vertices[j + 2] = hoehenwert;//dem_data[i];
                    }
                }
                else {
                    for (i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
                        //z
                        vertices[j + 2] = layer.materialParameter[0].bottomZ;
                    }
                }
                //var bufferAttribute = layer.mainGeometry.getAttribute('position');
                //bufferAttribute.setDynamic(true);
                //layer.positions = bufferAttribute.clone().array;
                ////defaultVertices = planeGeometry.attributes.position.clone().array;
            }
          

            // Calculate normals
            //if (layer.shading) {
            //    //geom.computeFaceNormals();obsolete
            //    geom.computeVertexNormals();            
            //}
            geom.computeBoundingBox();//for building border geometry

            //var material = new THREE.MeshPhongMaterial({ color: 0x223322, wireframe: true });
            //var mesh = new THREE.Mesh(geom, material);

            //var wireframe_material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframe_linewidth: 10 });
            //var materials = [layer.materials[this.mIndex].mat, wireframe_material];
            //var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, materials);

            var mesh = layer.mainMesh = new THREE.Mesh(geom, layer.materials[this.mIndex].mat);
            //mesh.name = "Oberkante";
            
            //mesh.matrixAutoUpdate = true;

            //var egh = new THREE.EdgesHelper(mesh, 0x00ffff);
            //egh.material.linewidth = 2;
            //layer.addObject(egh);

            //if (this.plane.offsetX != 0) mesh.position.x = this.plane.offsetX;
            //if (this.plane.offsetY != 0) mesh.position.y = this.plane.offsetY;
            mesh.userData.layerId = layer.index;
            this.obj = mesh;
            layer.addObject(mesh);
            //layer.mainMesh = mesh;
           
        },

        extrudeBottomPlane: function (layer, material, bottomZ) {
            var band_width = 3;//-bottomZ * 2;
            var dem_data = this.data;
            var xPixel = this.width;//this.width = xPixel
            var widthSegments = xPixel - 1; //xPixel = w
            var yPixel = this.height;//this.height = yPixel = h
            var heightSegments = yPixel - 1;
            var HALF_PI = Math.PI / 2;
            var i, mesh;

            var PlaneGeometry = (appSettings.Options.exportMode) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry;

            // front and back
            var geom_fr = new PlaneGeometry(this.plane.width, band_width, widthSegments, 1);
            var geom_ba = new PlaneGeometry(this.plane.width, band_width, widthSegments, 1);
            var k = xPixel * (yPixel - 1);
            if (appSettings.Options.exportMode) {
                for (i = 0; i < xPixel; i++) {
                    geom_fr.vertices[i].y = dem_data[k + i];
                    geom_ba.vertices[i].y = dem_data[xPixel - 1 - i];
                }
            }
            else {
                var vertices_fr = geom_fr.attributes.position.array,
                    vertices_ba = geom_ba.attributes.position.array;

                for (i = 0; i < xPixel; i++) {
                    vertices_fr[i * 3 + 1] = dem_data[k + i];
                    vertices_ba[i * 3 + 1] = dem_data[xPixel - 1 - i];
                }
            }
            mesh = new THREE.Mesh(geom_fr, material);
            mesh.position.y = -this.plane.height / 2;           
            mesh.rotateOnAxis(appSettings.uv.i, HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);
            mesh = new THREE.Mesh(geom_ba, material);
            mesh.position.y = this.plane.height / 2;
            mesh.rotateOnAxis(appSettings.uv.k, Math.PI);
            mesh.rotateOnAxis(appSettings.uv.i, HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);

            // left and right
            var geom_left = new PlaneGeometry(band_width, this.plane.height, 1, heightSegments);
            var geom_right = new PlaneGeometry(band_width, this.plane.height, 1, heightSegments);
            if (appSettings.Options.exportMode) {
                for (i = 0; i < yPixel; i++) {
                    geom_left.vertices[i * 2 + 1].x = dem_data[xPixel * i];
                    geom_right.vertices[i * 2].x = -dem_data[xPixel * (i + 1) - 1];
                }
            }
            else {
                var vertices_le = geom_left.attributes.position.array,
                    vertices_ri = geom_right.attributes.position.array;

                for (i = 0; i < yPixel; i++) {
                    vertices_le[(i * 2 + 1) * 3] = dem_data[xPixel * i];
                    vertices_ri[i * 2 * 3] = -dem_data[xPixel * (i + 1) - 1];
                }
            }
            mesh = new THREE.Mesh(geom_left, material);
            mesh.position.x = -this.plane.width / 2;
            mesh.rotateOnAxis(appSettings.uv.j, -HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);
            mesh = new THREE.Mesh(geom_right, material);
            mesh.position.x = this.plane.width / 2;
            mesh.rotateOnAxis(appSettings.uv.j, HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);

            // bottom
            var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments); 
            var mesh = new THREE.Mesh(geom, material);
            mesh.position.z = bottomZ;
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);
        },

        extrudePlane: function (layer, material, bottomZ) {
            //appSettings.Options.exportMode = true;
            var PlaneGeometry = (appSettings.Options.exportMode) ? THREE.PlaneGeometry : THREE.PlaneBufferGeometry;
            //var PlaneGeometry = THREE.PlaneGeometry;
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
            if (appSettings.Options.exportMode) {
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

            //var material2 = new THREE.MeshPhongMaterial({
            //    color: 0xdddddd,
            //    wireframe: true
            //});

            mesh = new THREE.Mesh(geom_fr, material);
            mesh.position.y = -this.plane.height / 2;
            mesh.rotateOnAxis(appSettings.uv.i, HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);

            mesh = new THREE.Mesh(geom_ba, material);
            mesh.position.y = this.plane.height / 2;
            mesh.rotateOnAxis(appSettings.uv.k, Math.PI);
            mesh.rotateOnAxis(appSettings.uv.i, HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);

            // left and right
            //widtSegments = 1; heightSegments: yPixel - 1;
            var geom_left = new PlaneGeometry(1, this.plane.height, 1, heightSegments);
            var geom_right = new PlaneGeometry(band_width, this.plane.height, 1, heightSegments);

            if (appSettings.Options.exportMode) {
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
            mesh.rotateOnAxis(appSettings.uv.j, -HALF_PI);
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);

            mesh = new THREE.Mesh(geom_right, material);
            mesh.position.x = this.plane.width / 2;
            //mesh.rotateOnAxis(appSettings.uv.j, HALF_PI);
            mesh.rotateOnAxis(appSettings.uv.j, THREE.Math.degToRad(90));
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);



            // bottom
            //appSettings.Options.exportMode = false;
            //if (appSettings.Options.exportMode) {
            //    var geom = new THREE.PlaneGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
            //}
            //else {
            //    //var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, 1, 1);
            //    var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);
            //}

            var geom = new THREE.PlaneBufferGeometry(this.plane.width, this.plane.height, widthSegments, heightSegments);

                var dem_data = this.bottomData;

                //mesh.position.z = bottomZ;
            //mesh.rotateOnAxis(appSettings.uv.i, Math.PI);
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
          

            mesh = new THREE.Mesh(geom, material);          
            layer.addObject(mesh, false);
            this.aObjs.push(mesh);
        }


    };

    return DemBlock;

});