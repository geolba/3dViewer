define('gba/geometry/Vector3', ["lib/leaflet/Class"], function (Class) {
    "use strict";

    var Vector3 = Class.extend({

        init: function (x, y, z, index, oppositePointIndex) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.index = index || 0;
            this.oppositePointIndex = oppositePointIndex || 0;
        },

        set: function (x, y, z) {

            this.x = x;
            this.y = y;
            this.z = z;

            return this;

        },

        setIndex: function (index) {

            this.index = index;
            return this;

        },

        setX: function (x) {
            this.x = x;
            return this;
        },

        setY: function (y) {
            this.y = y;
            return this;
        },

        setZ: function (z) {
            this.z = z;
            return this;
        },

        copy: function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        },

        min: function (v) {
            this.x = Math.min(this.x, v.x);
            this.y = Math.min(this.y, v.y);
            this.z = Math.min(this.z, v.z);
            return this;
        },

        max: function (v) {
            this.x = Math.max(this.x, v.x);
            this.y = Math.max(this.y, v.y);
            this.z = Math.max(this.z, v.z);
            return this;
        },

        equals: function (v) {
            return v.x.toFixed(0) === this.x.toFixed(0) && v.y.toFixed(0) === this.y.toFixed(0);//&& v.z === this.z;
        },

        toString: function () {
            return "(x: " + this.x + ", y: " + this.y + ")";
        }

    });

    return Vector3;

});