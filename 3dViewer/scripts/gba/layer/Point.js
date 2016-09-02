define('gba/layer/Point', ["lib/leaflet/Class", "helper/utilities", ], function (Class, util) {
    "use strict"; 
   
    


    var Point = Class.extend({

        options: {
            pane: 'overlayPane',
            nonBubblingEvents: []  // Array of events that should not be bubbled to DOM parents (like the map)
        },

        init: function (/*Number*/ x, /*Number*/ y, /*Boolean*/ round) {
            this.x = (round ? Math.round(x) : x);
            this.y = (round ? Math.round(y) : y);

        },

        distanceTo: function (point) {
            //point = L.point(point);

            var x = point.x - this.x,
                y = point.y - this.y;

            return Math.sqrt(x * x + y * y);
        }

    });
    return Point;


});