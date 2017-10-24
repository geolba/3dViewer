define('gba/tasks/Raycaster', ['three'], function (THREE) {
    "use strict";

    function Raycaster(origin, direction, near, far) {

        //this.ray = new THREE.Ray(origin, direction);


        this.near = near || 0;
        this.far = far || Infinity;


        this.vA = new THREE.Vector3();
        this.vB = new THREE.Vector3();
        this.vC = new THREE.Vector3();
        //this.intersectionPoint = new THREE.Vector3();
        //this.params = {
        //    Mesh: {},
        //    Line: {},
        //    LOD: {},
        //    Points: { threshold: 1 },
        //    Sprite: {}
        //};
    }

    var EPSILON = 0.01;
    Raycaster.LAYERS;
    //DxfLayer.prototype = {
    //var Raycaster = Class.extend({
    Raycaster.prototype = {

        /**
    	 * constructor: Raycaster
    	 */
        //init: function (origin, direction, near, far) {

        //   this.ray = new THREE.Ray(origin, direction);

        //    this.near = near || 0;
        //    this.far = far || Infinity;

        //    this.params = {
        //        Mesh: {},
        //        Line: {},
        //        LOD: {},
        //        Points: { threshold: 1 },
        //        Sprite: {}
        //    };

        //},
        constructor: Raycaster,

        identifyObjects3: function (faces, origin, direction, check) {
            //this.ray = new THREE.Ray(origin, direction);
            this.origin = origin;
            this.direction = direction;
            //this.faces = faces;
            this.check = check != undefined ? check : true;

            var intersects = [];

            if (Array.isArray(faces) === false) {
                //console.warn('Raycaster.intersectObjects: objects is not an Array.');
                return intersects;
            }
            for (var i = 0, l = faces.length; i < l; i++) {
                //this.intersectObject(faces[i], this, intersects);

                //var xMax = Math.max(faces[i].nodes[0].x, faces[i].nodes[1].x, faces[i].nodes[2].x);
                //if (xMax < origin.x) {
                //    continue;
                //}

                this.raycast3(faces[i], intersects, i);




                if (intersects.length > 0) { break; }
            }
            //intersects.sort( ascSort );
            return intersects;
        },

        identifyObjects: function (objects, origin, direction, check) {
            //this.ray = new THREE.Ray(origin, direction);
            this.origin = origin;
            this.direction = direction;
            //this.faces = faces;
            this.check = check != undefined ? check : true;

            var intersects = [];

            if (Array.isArray(objects) === false) {
                console.warn('Raycaster.intersectObjects: objects is not an Array.');
                return intersects;
            }
            for (var i = 0, l = objects.length; i < l; i++) {
                this.intersectObject(objects[i], this, intersects);
                if (intersects.length > 0) { break; }
            }
            //intersects.sort( ascSort );
            return intersects;
        },

        intersectObject: function (object, raycaster, intersects) {
            if (object.visible === false) { return; }
            //object.raycast(raycaster, intersects);
            this.raycast(object, intersects);
        },



        containsPoint: function (box) {

            if (this.origin.x < box.min.x || this.origin.x > box.max.x ||
                 this.origin.y < box.min.y || this.origin.y > box.max.y) {

                return false;

            }

            return true;

        },

        raycast3: function (face, intersects, i) {


            //var geometry = object.geometry;
            //var material = object.material;
            //var matrixWorld = object.matrixWorld;



            var intersectionPoint = new THREE.Vector3(this.origin.x, this.origin.y, 0);

            var vA = face.nodes[0].pos;
            var vB = face.nodes[1].pos;
            var vC = face.nodes[2].pos;





            //intersection = this.checkBufferGeometryIntersection(object, positions, a, b, c);

            var intersection = this.checkIntersection(face, vA, vB, vC, intersectionPoint);

            if (intersection) {
                intersection.faceIndex = i; // triangle number in indices buffer semantics
                intersects.push(intersection);
            }



        },

        raycast: function (object, intersects) {


            var geometry = object.geometry;
            var material = object.material;
            var matrixWorld = object.matrixWorld;

            //// Checking boundingSphere distance to ray
            //var sphere = new THREE.Sphere();
            //if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

            //sphere.copy(geometry.boundingSphere);
            //sphere.applyMatrix4(matrixWorld);
            //if (this.ray.intersectsSphere(sphere) === false) {
            //    return;
            //}
            if (this.check) {
                if (this.containsPoint(geometry.boundingBox) === false) {
                    return;
                }
            }

            var uvs, intersection;
            if (geometry instanceof THREE.BufferGeometry) {

                var a, b, c;
                var index = geometry.index;
                var attributes = geometry.attributes;
                var positions = attributes.position.array;
                //var positions = this.origin.x <= 0 ? attributes.firstArray.array : attributes.secondArray.array;

                //if (attributes.uv !== undefined) {
                //    uvs = attributes.uv.array;
                //}

                if (index !== null) {

                    //var indices = index.array;   
                    var indices = index.array;

                    for (var i = 0, l = indices.length; i < l; i += 3) {
                        a = indices[i];
                        b = indices[i + 1];
                        c = indices[i + 2];
                        intersection = this.checkBufferGeometryIntersection(object, positions, a, b, c);

                        if (intersection) {
                            intersection.faceIndex = Math.floor(i / 3); // triangle number in indices buffer semantics
                            intersects.push(intersection);
                            break;
                        }
                    }
                } //if index

                //for (var i = 0, l = positions.length; i < l; i += 3) {
                //    //a = indices[i];
                //    //b = indices[i + 1];
                //    //c = indices[i + 2];
                //    a = i;
                //    b = i + 1;
                //    c = i + 2;
                //    intersection = this.checkBufferGeometryIntersection(object, positions, uvs, a, b, c);

                //    if (intersection) {
                //        intersection.faceIndex = Math.floor(i / 3); // triangle number in indices buffer semantics
                //        intersects.push(intersection);
                //        break;
                //    }
                //}

            }

        },

        checkBufferGeometryIntersection: function (object, positions, a, b, c) {
            //var vA = new THREE.Vector3();
            //var vB = new THREE.Vector3();
            //var vC = new THREE.Vector3();
            var intersectionPoint = new THREE.Vector3(this.origin.x, this.origin.y);

            this.vA.fromArray(positions, a * 3);
            this.vB.fromArray(positions, b * 3);
            this.vC.fromArray(positions, c * 3);

            var intersection = this.checkIntersection(object, this.vA, this.vB, this.vC, intersectionPoint);

            if (intersection) {

                //if ( uvs ) {

                //    uvA.fromArray( uvs, a * 2 );
                //    uvB.fromArray( uvs, b * 2 );
                //    uvC.fromArray( uvs, c * 2 );

                //    intersection.uv = uvIntersection( intersectionPoint,  vA, vB, vC,  uvA, uvB, uvC );

                //}

                //intersection.face = new THREE.Face3( a, b, c, THREE.Triangle.normal( vA, vB, vC ) );
                intersection.faceIndex = a;

            }

            return intersection;

        },



        checkIntersection: function (object, pA, pB, pC, point) {
            //var intersectionPointWorld = new THREE.Vector3();

            //var intersect;
            //var material = object.material;

            //if ( material.side === THREE.BackSide ) {

            //    intersect = this.ray.intersectTriangle( pC, pB, pA, true, point );

            //} else {
            var intersect = null;

            if (this.check === false) {
                intersect = this.intersectTriangle(pA, pB, pC, false, point);
            }
            else {
                if (this.pointInTriangleBoundingBox(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y)) {
                    intersect = this.intersectTriangle(pA, pB, pC, false, point);
                }

            }

            //}

            if (intersect === null) return null;

            //intersectionPointWorld.copy( point );
            //intersectionPointWorld.applyMatrix4( object.matrixWorld );

            //var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );
            //if ( distance < raycaster.near || distance > raycaster.far ) return null;

            return {
                //distance: distance,
                point: point.clone(), //intersectionPointWorld.clone(),
                //object: object
            };

        },


        //first method:
        pointInTriangle1: function (x1, y1, x2, y2, x3, y3, x, y) {
            var denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
            var a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
            var b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
            var c = 1 - a - b;

            return 0 <= a && a <= 1 && 0 <= b && b <= 1 && 0 <= c && c <= 1;
        },
        //second method:
        pointInTriangle2: function (x1, y1, x2, y2, x3, y3, x, y) {
            var denominator = (x1 * (y2 - y3) + y1 * (x3 - x2) + x2 * y3 - y2 * x3);
            var t1 = (x * (y3 - y1) + y * (x1 - x3) - x1 * y3 + y1 * x3) / denominator;
            var t2 = (x * (y2 - y1) + y * (x1 - x2) - x1 * y2 + y1 * x2) / -denominator;
            var s = t1 + t2;

            return 0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1 && s <= 1;
        },

        //third method
        pointInTriangle: function (x1, y1, x2, y2, x3, y3, x, y) {
            var checkSide1 = this.side(x1, y1, x2, y2, x, y) >= 0;
            var checkSide2 = this.side(x2, y2, x3, y3, x, y) >= 0;
            var checkSide3 = this.side(x3, y3, x1, y1, x, y) >= 0;
            return checkSide1 && checkSide2 && checkSide3;
        },
        side: function (x1, y1, x2, y2, x, y) {
            return (y2 - y1) * (x - x1) + (-x2 + x1) * (y - y1);
        },

        //pre-check
        pointInTriangleBoundingBox: function (x1, y1, x2, y2, x3, y3) {
            var xMin = Math.min(x1, Math.min(x2, x3)) - EPSILON;
            var yMin = Math.min(y1, Math.min(y2, y3)) - EPSILON;

            var xMax = Math.max(x1, Math.max(x2, x3)) + EPSILON;
            var yMax = Math.max(y1, Math.max(y2, y3)) + EPSILON;

            return !(this.origin.x < xMin || this.origin.x > xMax || this.origin.y < yMin || this.origin.y > yMax);
            //var xIntersects = (this.origin.x < xMax) && (this.origin.x > xMin);
            //if (xIntersects === true) {
            //    var yIntersects = (this.origin.y < yMax) && (this.origin.y > yMin);
            //    if (yIntersects === true) {
            //        return true;
            //    }
            //}
            //return false;

        },

        intersectTriangle: function () {

            // Compute the offset origin, edges, and normal.
            var diff = new THREE.Vector3();
            var edge1 = new THREE.Vector3();
            var edge2 = new THREE.Vector3();
            var normal = new THREE.Vector3();

            //var nullVector = new THREE.Vector3(0, 0, 0);

            return function (a, b, c, backfaceCulling, optionalTarget) {

                // from http://www.geometrictools.com/LibMathematics/Intersection/Wm5IntrRay3Triangle3.cpp

                edge1.subVectors(b, a);
                edge2.subVectors(c, a);
                normal.crossVectors(edge1, edge2);

                // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
                // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
                //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
                //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
                //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
                var DdN = this.direction.dot(normal);
                var sign;


                if (DdN > 0) {

                    //if (backfaceCulling) return null;
                    sign = 1;

                } else if (DdN < 0) {
                    sign = -1;
                    DdN = -DdN;
                }
                //else {

                //    return null;

                //}

                diff.subVectors(this.origin, a);

                //////wieder auskommentieren
                //var DdQxE2 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));
                ////// b1 < 0, no intersection
                //if (DdQxE2 < 0) {
                //    return null;
                //}

                ////wieder auskommentieren
                //var DdE1xQ = sign * this.direction.dot(edge1.cross(diff));
                //// b2 < 0, no intersection
                //if (DdE1xQ < 0) {
                //    //var QdN = -sign * diff.dot(normal);
                //    //var result = this.at(QdN / DdN, optionalTarget);
                //    return null;
                //}
                //// b1+b2 > 1, no intersection
                //if (DdQxE2 + DdE1xQ > DdN) {
                //    return null;
                //}

                // Line intersects triangle, check if ray does.
                var QdN = -sign * diff.dot(normal);

                ////wieder auskommentieren
                //// t < 0, no intersection
                //if (QdN < 0) {
                //    return null;
                //}

                // Ray intersects triangle.
                var result = this.at(QdN / DdN, optionalTarget);
                if (result.z > this.origin.z) {
                    return null;
                }
                //if (this.pointInTriangleBoundingBox(a.x, a.y, b.x, b.y, c.x, c.y) == false) {
                //    return null;
                //}
                return result;

            };

        }(),

        at: function (t, optionalTarget) {

            var result = optionalTarget || new THREE.Vector3();
            return result.copy(this.direction).multiplyScalar(t).add(this.origin);

        }


    };

    return Raycaster;

});
