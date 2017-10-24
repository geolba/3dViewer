define('gba/geometry/Graph', ["lib/leaflet/Class", "gba/geometry/Node", "gba/geometry/Edge", "gba/geometry/Face"], function (Class, Node, Edge, Face) {
    "use strict";

    //Mesh.prototype = {
    var Graph = Class.extend({

        init: function () {
            this.faces = [];
            this.nodes = {};//[];
            //this.nodes = [];
            this.edges = [];
        },

        addNode: function (pos, id) {
            var node = new Node(pos, id);
            //this.nodes.push(node);
            this.nodes[id] = node;
            return node;
        },

        addEdge: function (n1, n2) {
            var edge = new Edge(n1, n2);
            this.edges.push(edge);

            n1.edges.push(edge);
            n2.edges.push(edge);
            //n1.edges[n1.edges.length] = edge;
            //n2.edges[n2.edges.length] = edge;

            return edge;
        },

        addFaceFromNodes: function (nodes) {
            var edges = [];
            var edge;
            for (var i = 0; i < nodes.length; i++) {
                var n1 = nodes[i];
                var n2 = nodes[(i + 1) % nodes.length];
                edge = n1.findEdgeWith(n2);
                if (edge === null) {
                    edge = this.addEdge(n1, n2);
                }
                edges.push(edge);
            }

            var face = new Face(nodes, edges);
            this.faces.push(face);

            for (i = 0; i < edges.length; i++) {
                edge = edges[i];
                edge.faces.push(face);
            }

            return face;
        }


    });

    return Graph;

});