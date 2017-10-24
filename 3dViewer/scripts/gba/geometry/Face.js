define('gba/geometry/Face', ["lib/leaflet/Class"], function (Class) {
    "use strict";

    //Face.prototype = {
    var Face = Class.extend({

        init: function (nodes, edges) {
            this.nodes = nodes;
            this.edges = edges;
        }

    });

    return Face;

});