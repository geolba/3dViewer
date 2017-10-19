// Filename: utilities.js -> static class
define('helper/geo_utilities',
    ["jquery", "helper/dom", "three", 'gba/geometry/Vector3'], function ($, dom, THREE, Vector3) {
        "use strict";

        //constant static variable
        var LOADING_ID_PREFIX = "loading_";

        var geo_util = {

            calculateDistance: function (a, b) {
                var xd = b.x - a.y;
                var yd = b.y - a.y;
                return Math.sqrt(xd * xd + yd * yd);
            },

            clip: function (subjectPolygon, clipPolygon) {
                var clip1, clip2, s, e;
                var inside = function (p) {
                    return (clip2.x - clip1.x) * (p.y - clip1.y) > (clip2.y - clip1.y) * (p.x - clip1.x);
                };
                var intersection = function (eInside) {
                    var dc = [clip1.x - clip2.x, clip1.y - clip2.y],
                        dp = [s.x - e.x, s.y - e.y],
                        n1 = clip1.x * clip2.y - clip1.y * clip2.x,
                        n2 = s.x * e.y - s.y * e.x,
                        n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);

                    var pointIndex = eInside === true ? s.index : e.index;
                    var oppositePointIndex = eInside === true ? e.index : s.index;
                    var currentXYPoint = new Vector3((n1 * dp[0] - n2 * dc[0]) * n3, (n1 * dp[1] - n2 * dc[1]) * n3, 0, pointIndex, oppositePointIndex);

                    var prevdistance = geo_util.calculateDistance(s, currentXYPoint);
                    var nextdistance = geo_util.calculateDistance(currentXYPoint, e);
                    //generate a ratio
                    var fraction = prevdistance / (nextdistance + prevdistance);
                    //find out the difference between the two known points
                    var diffsBetweensZ = e.z - s.z;
                    //interpolate!
                    var newZvalue = (s.z + (diffsBetweensZ * fraction));
                    currentXYPoint.z = newZvalue;

                    return currentXYPoint;
                };
                var outputList = subjectPolygon;
                //get last point of clip polygon
                clip1 = clipPolygon[clipPolygon.length - 1];
                for (var j in clipPolygon) {
                    var clip2 = clipPolygon[j];
                    var inputList = outputList;
                    outputList = [];
                    s = inputList[inputList.length - 1]; //last on the input list (subject)
                    for (var i in inputList) {
                        var e = inputList[i];
                        if (inside(e)) {
                            if (!inside(s)) {
                                outputList.push(intersection(inside(e)));
                            }
                            outputList.push(e);
                        }
                        else if (inside(s)) {
                            outputList.push(intersection(inside(e)));
                        }
                        s = e;
                    }
                    clip1 = clip2;
                }
                return outputList
            },

            checkLineIntersection: function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
                // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
                var denominator, a, b, numerator1, numerator2, result = {
                    x: null,
                    y: null,
                    onLine1: false,
                    onLine2: false
                };
                denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
                if (denominator === 0) {
                    return result;
                }
                a = line1StartY - line2StartY;
                b = line1StartX - line2StartX;
                numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
                numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
                a = numerator1 / denominator;
                b = numerator2 / denominator;

                // if we cast these lines infinitely in both directions, they intersect here:
                result.x = line1StartX + (a * (line1EndX - line1StartX));
                result.y = line1StartY + (a * (line1EndY - line1StartY));
                /*
                        // it is worth noting that this should be the same as:
                        x = line2StartX + (b * (line2EndX - line2StartX));
                        y = line2StartX + (b * (line2EndY - line2StartY));
                        */
                // if line1 is a segment and line2 is infinite, they intersect if:
                if (a > 0 && a < 1) {
                    result.onLine1 = true;
                }
                // if line2 is a segment and line1 is infinite, they intersect if:
                if (b > 0 && b < 1) {
                    result.onLine2 = true;
                }
                // if line1 and line2 are segments, they intersect if both of the above are true
                return result;
            }

        };

        return geo_util;

    });