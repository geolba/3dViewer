// Filename: utilities.js -> static class
define('helper/mixin',
    ["helper/Events"], function (Events) {

        var mixin = {

            Events: Events.prototype
    
        };

        return mixin;

});