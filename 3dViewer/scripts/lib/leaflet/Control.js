/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade 
 */
define('lib/leaflet/Control', ["lib/leaflet/Class", "helper/utilities"], function (Class, util) {
    "use strict";

    /**
     * This is our classes constructor; unlike AS3 this is where we define our member properties (fields).
     */
    //function Control(defaults) {

    //    if (!(this instanceof Control)) {
    //        throw new TypeError("Control constructor cannot be called as a function.");
    //    }

    //    // properties  
    //    //util.setOptions(this.config, defaults)
    //    util.mixin(this.options, defaults);
    //}

    //Control.prototype = {
    var Control = Class.extend({

        options: {
            position: 'topright'
        },

        /**
    	 * Whenever you replace an Object's Prototype, you need to repoint
    	 * the base Constructor back at the original constructor Function, 
    	 * otherwise `instanceof` calls will fail.
    	 */
        //constructor: Control,
        init: function (defaults) {
                if (!(this instanceof Control)) {
                    throw new TypeError("Control constructor cannot be called as a function.");
                }

                // properties  
                //util.setOptions(this.config, defaults)
                util.setOptions(this, defaults);
        },
        //initialize: function (options) {
        //    L.setOptions(this, options);
        //},

        getPosition: function () {
            return this.options.position;
        },

        getContainer: function () {
            return this._container;
        },

        addTo: function (map) {
            this._map = map;

            var container = this._container = this.onAdd(map);
            var pos = this.getPosition();//"topright"
            var corner = map._controlCorners[pos];
            if (container) {
                $(container).addClass('gba-control');

                if (pos.indexOf('bottom') !== -1) {
                    corner.insertBefore(container, corner.firstChild);
                }
                else {
                    corner.appendChild(container);
                }
            }

            return this;
        },

        removeFrom: function (map) {
            var pos = this.getPosition(),
                corner = map._controlCorners[pos];

            corner.removeChild(this._container);
            this._map = null;

            if (this.onRemove) {
                this.onRemove(map);
            }
            return this;
        },
    
    });

    return Control;

});