define('gba/geometry/Vector2', ["lib/leaflet/Class"], function (Class) {
    "use strict";
   
    var Vector2 = Class.extend({

        init : function(x, y) {
            this.x = x;
            this.y = y;
        },

        equals : function(v) {
            return v.x === this.x && v.y === this.y;
        },

        toString : function() {
            return "(x: " + this.x + ", y: " + this.y + ")";
        }

    });

    return Vector2;

});