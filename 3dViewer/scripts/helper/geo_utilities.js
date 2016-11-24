// Filename: utilities.js -> static class
define('helper/geo_utilities',
    ["jquery", "helper/dom", "three", 'gba/geometry/Vector3'], function ($, dom, THREE, Vector3) {
        "use strict";

        //constant static variable
        var LOADING_ID_PREFIX = "loading_";
       
        var geo_util = {
            
            calculateDistance: function(a, b) {
                    var xd = b.x - a.y;
                    var yd = b.y - a.y;
                    return Math.sqrt(xd * xd + yd * yd);
            } ,

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

            clipOld: function (subjectPolygon, clipPolygon) {
                var clip1, clip2, s, e;
                var inside = function (p) {
                    return (clip2[0] - clip1[0]) * (p[1] - clip1[1]) > (clip2[1] - clip1[1]) * (p[0] - clip1[0]);
                };
                var intersection = function () {
                    var dc = [clip1[0] - clip2[0], clip1[1] - clip2[1]],
                        dp = [s[0] - e[0], s[1] - e[1]],
                        n1 = clip1[0] * clip2[1] - clip1[1] * clip2[0],
                        n2 = s[0] * e[1] - s[1] * e[0],
                        n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
                    return [(n1 * dp[0] - n2 * dc[0]) * n3, (n1 * dp[1] - n2 * dc[1]) * n3];
                };
                var outputList = subjectPolygon;
                //get last point of clip polygon
                clip1 = clipPolygon[clipPolygon.length - 1];
                for (var j in clipPolygon) {
                    var clip2 = clipPolygon[j];
                    var inputList = outputList;
                    outputList = [];
                    s = inputList[inputList.length - 1]; //last on the input list
                    for (var i in inputList) {
                        var e = inputList[i];
                        if (inside(e)) {
                            if (!inside(s)) {
                                outputList.push(intersection());
                            }
                            outputList.push(e);
                        }
                        else if (inside(s)) {
                            outputList.push(intersection());
                        }
                        s = e;
                    }
                    clip1 = clip2;
                }
                return outputList
            }



        };

        return geo_util;

    });