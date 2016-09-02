/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade

  L.Class powers the OOP facilities of the library.
  Thanks to John Resig and Dean Edwards for inspiration!
 */

define('lib/leaflet/Class', ["helper/utilities"], function (util) {


    var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    var Class = function () { };

    // Create a new Class that inherits from this class
    Class.extend = function (props) {
        var NewClass = function () {

            // call the constructor
            if (this.init) {
                this.init.apply(this, arguments);
            }

            //// call all constructor hooks
            //if (this._initHooks) {
            //    this.callInitHooks();
            //}
        };

        // instantiate class without calling constructor
        var F = function () { };
        F.prototype = this.prototype;

        var proto = new F();
        proto.constructor = NewClass;

        NewClass.prototype = proto;

        //inherit parent's statics
        for (var i in this) {
            if (this.hasOwnProperty(i) && i !== 'prototype') {
                NewClass[i] = this[i];
            }
        }

        // mix static properties into the class
        if (props.statics) {
            util._extend(NewClass, props.statics);
            delete props.statics;
        }

        // mix includes into the prototype
        if (props.includes) {
            util.extend.apply(null, [proto].concat(props.includes));
            delete props.includes;
        }

        // merge options
        if (props.options && proto.options) {
            props.options = util._extend({}, proto.options, props.options);
        }

        // mix given properties into the prototype
        util._extend(proto, props);

        //proto._initHooks = [];

        var parent = this;
        // jshint camelcase: false
        NewClass.__super__ = parent.prototype;

        //// add method for calling all hooks
        //proto.callInitHooks = function () {

        //    if (this._initHooksCalled) { return; }

        //    if (parent.prototype.callInitHooks) {
        //        parent.prototype.callInitHooks.call(this);
        //    }

        //    this._initHooksCalled = true;

        //    for (var i = 0, len = proto._initHooks.length; i < len; i++) {
        //        proto._initHooks[i].call(this);
        //    }
        //};

        return NewClass;
    };



    //// method for adding properties to prototype
    //Class.include = function (props) {
    //    util._extend(this.prototype, props);
    //};



    return Class;

  

});
