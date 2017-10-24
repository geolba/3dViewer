//define('gba/tasks/RaycasterVertices', ['three'], function (THREE) {
//    "use strict";

function RaycasterVertices(origin, direction, near, far) {

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
//RaycasterVertices.LAYERS;
//DxfLayer.prototype = {
//var Raycaster = Class.extend({
RaycasterVertices.prototype = {

    constructor: RaycasterVertices,

    identifyObjects3: function (indices, vertices, origin, direction, check) {
        //this.ray = new THREE.Ray(origin, direction);
        this.vertices = vertices;
        this.origin = origin;
        this.direction = direction;
        //this.faces = faces;
        this.check = check != undefined ? check : true;

        var intersects = [];

        //if (Array.isArray(indices) === false) {
        //    //console.warn('Raycaster.intersectObjects: objects is not an Array.');
        //    return intersects;
        //}
        for (var i = 0, l = indices.length; i < l; i += 3) {
            var a = indices[i];
            var b = indices[i + 1];
            var c = indices[i + 2];

            this.raycast3(a, b, c, intersects, i);


            if (intersects.length > 0) { break; }
        }
        //intersects.sort( ascSort );
        return intersects;
    },


    raycast3: function (a, b, c, intersects, i) {


        //var geometry = object.geometry;
        //var material = object.material;
        //var matrixWorld = object.matrixWorld;



        var intersectionPoint = new THREE.Vector3(this.origin.x, this.origin.y, 0);

        this.vA.fromArray(this.vertices, a * 3);//.multiplyScalar(this.tolerance);
        this.vB.fromArray(this.vertices, b * 3);//.multiplyScalar(this.tolerance);
        this.vC.fromArray(this.vertices, c * 3);//.multiplyScalar(this.tolerance);





        //intersection = this.checkBufferGeometryIntersection(object, positions, a, b, c);

        var intersection = this.checkIntersection(this.vA, this.vB, this.vC, intersectionPoint);

        if (intersection) {
            intersection.faceIndex = i; // triangle number in indices buffer semantics
            intersects.push(intersection);
        }



    },

    checkIntersection: function (pA, pB, pC, point) {
        //var intersectionPointWorld = new THREE.Vector3();

        //var intersect;
        //var material = object.material;

        //if ( material.side === THREE.BackSide ) {

        //    intersect = this.ray.intersectTriangle( pC, pB, pA, true, point );

        //} else {
        var intersect = null;

        if (this.check === false) {
            intersect = this.intersectTriangle(pA, pB, pC, false, point, false);
        }
        else if (this.check === true) {
            if (this.pointInBoundingBox(point, pA.x, pA.y, pB.x, pB.y, pC.x, pC.y)) {
                //if (this.pointInTriangle(point, pA, pB, pC)) {
                intersect = this.intersectTriangle(pA, pB, pC, false, point, true);
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


    //pre-check
    pointInBoundingBox: function (point, x1, y1, x2, y2, x3, y3) {
        var xMin = Math.min(x1, Math.min(x2, x3)) - EPSILON;
        var yMin = Math.min(y1, Math.min(y2, y3)) - EPSILON;

        var xMax = Math.max(x1, Math.max(x2, x3)) + EPSILON;
        var yMax = Math.max(y1, Math.max(y2, y3)) + EPSILON;

        return !(point.x < xMin || point.x > xMax || point.y < yMin || point.y > yMax);
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

        return function (a, b, c, backfaceCulling, optionalTarget, check) {

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

            if (check) {
                //////wieder auskommentieren
                var b1 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));
                //// b1 < 0, no intersection
                if (b1 < 0) {
                    return null;
                }

                ////wieder auskommentieren
                var b2 = sign * this.direction.dot(edge1.cross(diff));
                // b2 < 0, no intersection
                if (b2 < 0) {
                    //var QdN = -sign * diff.dot(normal);
                    //var result = this.at(QdN / DdN, optionalTarget);
                    return null;
                }

                //damit nicht runter sticht
                // b1+b2 > 1, no intersection
                if (b1 + b2 > DdN) {
                    return null;
                }
            }


            // Line intersects triangle, check if ray does.
            var t = -sign * diff.dot(normal);
            //wieder auskommentieren
            // t < 0, no intersection
            if (t < 0) {
                return null;
            }



            // Ray intersects triangle.
            var result = this.at(t / DdN, optionalTarget);
            //if (check) {
            //    if (result.z > this.origin.z) {
            //        return null;
            //    }
            //    //if (this.pointInTriangleBoundingBox(a.x, a.y, b.x, b.y, c.x, c.y) == false) {
            //    //    return null;
            //    //}
            //}
            return result;

        };

    }(),

    at: function (t, optionalTarget) {
        var result = optionalTarget || new THREE.Vector3();
        return result.copy(this.direction).multiplyScalar(t).add(this.origin);
    },

    pointInTriangle: function (p, p0, p1, p2) {
        var s = p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y;
        var t = p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y;

        if ((s < 0) != (t < 0))
            return false;

        var A = -p1.y * p2.x + p0.y * (p2.x - p1.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y;
        if (A < 0.0) {
            s = -s;
            t = -t;
            A = -A;
        }
        return s > 0 && t > 0 && (s + t) <= A;
    }




};

//    return RaycasterVertices;

//});
