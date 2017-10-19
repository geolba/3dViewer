define('gba/geometry/Edge', ["lib/leaflet/Class"], function (Class) {
    "use strict";

    //Edge.prototype = {
    var Edge = Class.extend({

        init: function (n1, n2) {
            this.n1 = n1;
            this.n2 = n2;
            this.faces = [];

            this.visited = false;
            this.strokeWidth = 1.2;
            this.border = false;
        },

        clone: function () {

            return new this.constructor(this.n1, this.n2);

        },

        //getAdjacentEdges : function() {
        //    var edges = [];

        //    for (var i = 0; i < this.faces.length; i++) {
        //        var face = this.faces[i];
        //        for (var j = 0; j < face.edges.length; j++) {
        //            var edge = face.edges[j];
        //            if (edges.indexOf(edge) === -1 && edge != this) {
        //                edges.push(edge);
        //            }
        //        }
        //    }

        //    return edges;
        //}

    });

    return Edge;

});