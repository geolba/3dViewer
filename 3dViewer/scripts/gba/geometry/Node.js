define('gba/geometry/Node', ["lib/leaflet/Class",'three'], function (Class, THREE) {
    "use strict";

    //Node.prototype = {
    var Node = Class.extend({

        init : function(pos, id) {
            this.pos = pos;
            this.id = id;
            this.edges = [];
            //this.edges = {};

            this.visited = false;
            //this.color = d3.rgb(0, 0, 0);
            this.border = null;

            this.raycastPos = null;//new THREE.Vector3();//null;
        },
        clone: function () {

            return new this.constructor(this.pos, this.id);

        },
        findEdgeWith : function(n) {
            for (var i = 0; i < this.edges.length; i++) {
                var edge = this.edges[i];
                if (edge.n1 == n || edge.n2 == n) {
                    return edge;
                }
            }
            return null;
        },
        //findEdgeWithD: function (n) {
           
        //    var result = this.edges.hasOwnProperty(n.id) ? this.edges[n.id] : null;
        //    return result;
        //},

        //getAdjacentNodes : function() {
        //    var nodes = [];
        //    for (var i = 0; i < this.edges.length; i++) {
        //        var edge = this.edges[i];
        //        if (edge.n1 == this) nodes.push(edge.n2);
        //        else nodes.push(edge.n1);
        //    }
        //    return nodes;
        //}

    });

    return Node;

});