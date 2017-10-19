define('app/Dataservice', ["lib/leaflet/Class", "jquery", "gba/layer/DemLayer", "gba/layer/DxfLayer", "helper/utilities", "helper/domUtil"],
    function (Class, $, DemLayer, DxfLayer, util, domUtil) {
        "use strict";

        /**
         * This is our classes constructor; unlike AS3 this is where we define our member properties (fields).
         * To differentiate constructor functions from regular functions, by convention we start the function 
         * name with a capital letter.  This informs users that they must invoke the Person function using
         * the `new` keyword and treat it as a constructor (ie: it returns a new instance of the Class).
         */
        //    function Dataservice(options) {

        //    if (!(this instanceof Dataservice)) {
        //        throw new TypeError("Dataservice constructor cannot be called as a function.");
        //    }

        //    // properties  

        //    //util.mixin(this.config, defaults);
        //    ////for (var k in params) {
        //    ////    this[k] = params[k];
        //    ////}
        //    util.mixin(this, options);

        //    //var w = (this.config.baseExtent[2] - this.config.baseExtent[0]);
        //    //var h = (this.config.baseExtent[3] - this.config.baseExtent[1]);
        //    //this.height = this.config.width * h / w;
        //    //this.scale = this.config.width / w;
        //    //this.zScale = this.scale * this.config.zExaggeration;

        //    //this.origin = {
        //    //    x: this.config.baseExtent[0] + w / 2,
        //    //    y: this.config.baseExtent[1] + h / 2,
        //    //    z: -this.config.zShift
        //    //};

        //    this.layers = [];
        //    this.models = [];
        //    this.images = [];
        //    //this.name = "";

        //    // private members    

        //}

        /**
         * Adding static properties is as simple as adding them directly to the constructor
         * function directly.
         */
        //Dataservice.RETIREMENT_AGE = 60;
        //Dataservice.LAYERS = [];

        /**
         * Public Static methods are defined in the same way; here's a static constructor for our Person class
         * which also sets the person's age.
         */
        //Dataservice.create = function (name, age) {
        //    var result = new Dataservice(name);
        //    result.setAge(age);
        //    return result;
        //};



        /**
         * The prototype is a special type of Object which is used as a the blueprint for all instances
         * of a given Class; by defining functions and properties on the prototype we reduce memory
         * overhead.  We can also achieve inheritance by pointing one classes' prototype at another, for
         * example, if we introduced a BankManager class which extended our Person class, we could write:
         *
         *	`BankManager.prototype = Person.prototype`
         *	`BankManager.prototype.constructor = BankManager`   
         */

        //Dataservice.prototype = {
        var Dataservice = Class.extend({

            //statische Klassenvriablen und Methoden:
            statics: {
                LAYERS: []
            },

            config: {},


            //constructor: Dataservice,  
            init: function (options) {
                if (!(this instanceof Dataservice)) {
                    throw new TypeError("Dataservice constructor cannot be called as a function.");
                }

                util.mixin(this, options);
                //var w = (this.config.baseExtent[2] - this.config.baseExtent[0]);
                //var h = (this.config.baseExtent[3] - this.config.baseExtent[1]);
                //this.height = this.config.width * h / w;
                //this.scale = this.config.width / w;
                //this.zScale = this.scale * this.config.zExaggeration;

                //this.origin = {
                //    x: this.config.baseExtent[0] + w / 2,
                //    y: this.config.baseExtent[1] + h / 2,
                //    z: -this.config.zShift
                //};

                this.layers = [];
                this.models = [];
                this.images = [];
            },

            /*
           * All methods added to a Class' prototype are public (visible); they are able to 
           * access the properties and methods of the Person class via the `this` keyword.  
           */
            init2: function () {
                // run in parallel         
                //var urlObject = util.urlToObject(document.location.href);
                //alert(urlObject);

                //var currUrl = document.URL, newUrl;
                //if (currUrl.charAt(currUrl.length - 1) === '/') {
                //    newUrl = currUrl.slice(0, currUrl.lastIndexOf('/'));
                //    newUrl = newUrl.slice(0, newUrl.lastIndexOf('/')) + '/';
                //} else {
                //    newUrl = currUrl.slice(0, currUrl.lastIndexOf('/')) + '/';
                //}
                //alert(newUrl);

                return $.when(this._requestProject(), this._getTouch());
                //return $.when(_init());
            },

            /*
            * private method for initializing
            */
            _getTouch: function () {
                var deferred = $.Deferred();


                var dirNode = document.getElementsByTagName("body")[0];

                //if (this.config.i18n.isRightToLeft) {
                if (util.hasTouch()) {
                    //dirNode.setAttribute("dir", "ltr");
                    domUtil.addClass(dirNode, "touch");
                }
                else {
                    domUtil.addClass(dirNode, "notouch");
                }

                deferred.resolve(true);
                return deferred.promise();
            },

            // private method for initializing
            _requestProject: function () {
                // 1) create the jQuery Deferred object that will be used
                var deferred = $.Deferred();
                //var dataPath = $UrlHelper.resolve('~');
                var dataPath = util.rootFolder();              

                //var sPageURL = window.location.href;
                //var number = sPageURL.substring(sPageURL.lastIndexOf('/') + 1);              
                //this.requestUrl = dataPath + "Dataset/View?id=" + number;// "/Dataset/View";  // _getEndpoint(self.StartUri);
                this.requestUrl = dataPath + "data/dem.json?_";

                var dataRequest = $.ajax({                  
                    type: "GET",
                    contentType: "application/json",//tell the server we're looking for json
                    url: this.requestUrl,// + date.getTime(), 
                    dataType: 'json'
                 
                });

                dataRequest.done($.proxy(dataRequestSucceeded, this))
               .fail(dataRequestFailed);

                function dataRequestSucceeded(data) {
                    if (typeof data != 'object') {
                        data = jQuery.parseJSON(data);
                    }                  
                    this.images = data.images;


                    this.crs = data.crs;
                    this.wgs84Center = data.wgs84Center;
                    this.proj = data.proj;
                    this.title = data.title;
                    this.baseExtent = data.baseExtent;
                    this.rotation = data.rotation;
                    this.zShift = data.zShift;
                    this.width = data.width;
                    this.zExaggeration = data.zExaggeration;


                    var w = this.baseExtent[2] - this.baseExtent[0];
                    var h = this.baseExtent[3] - this.baseExtent[1];
                    this.height = this.width * h / w;
                    this.scale = this.width / w;
                    this.zScale = this.scale * this.zExaggeration;

                    this.origin = {
                        x: this.baseExtent[0] + w / 2,
                        y: this.baseExtent[1] + h / 2,
                        z: -this.zShift
                    };
                    for (var i = 0; i < data.layer.length; i++) {
                        var layerData = data.layer[i];
                        var layer;
                        if (layerData.type === "3dface") {
                            layer = new DxfLayer({ q: layerData.q, type: layerData.type, name: layerData.name, description: layerData.description });
                            this.addLayer(layer);
                            //var block = layer.addBlock(layerData.block);
                            layer.features = layerData.vertices;
                            layer.idx = layerData.features;
                            //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                            //layer.materialParameter[0] = { color: 0xc696db, materialtypee: 1, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                            //layer.materialParameter[0] = { color: 0xc696db, materialtypee: 1, ds: 1 };
                            layer.materialParameter[0] = layerData.materialParameter[0];
                            layer.initMaterials();
                        }
                        if (layerData.type === "dem") {
                            layer = new DemLayer({ q: layerData.q, shading: layerData.shading, type: layerData.type, name: layerData.name });
                            this.addLayer(layer);
                            layer.addBlock(layerData.block);
                            //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                            //layer.materialParameter[0] = { color: 0x00ff00, materialtypee: 0, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                            //if (i === 0){
                            //    layer.materialParameter[0] = { i: 0, materialtypee: 0, ds: 1, side: { color: 0x00ff00, bottomZ: -1.5 } };
                            //}else{
                            layer.materialParameter[0] = layerData.materialParameter[0];
                            layer.initMaterials();
                        }
                    }

                    //var layer;
                    //var layerData = data.layer[0];
                    //if (layerData.type == "dem") {
                    //    var layer = new DemLayer({ q: layerData.q, shading: layerData.shading, type: layerData.type, name: layerData.name });
                    //    this.addLayer(layer);                   
                    //    var block = layer.addBlock(layerData.block);                    
                    //    //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                    //    //layer.materialParameter[0] = { color: 0x00ff00, materialtypee: 0, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                    //    layer.materialParameter[0] = { i: 0, materialtypee: 0, ds: 1, side: { color: 0x00ff00, bottomZ: -1.5 } };                   
                    //}

                    //var layerData = data.layer[0]; 
                    //if (layerData.type === "3dface") {
                    //    layer = new DxfLayer({ q: layerData.q, type: layerData.type, name: layerData.name, description: layerData.description });
                    //    this.addLayer(layer);                  
                    //    layer.features = layerData.features;
                    //    //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                    //    //layer.materialParameter[0] = { color: 0xc696db, materialtypee: 1, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                    //    //layer.materialParameter[0] = { color: 0xc696db, materialtypee: 1, ds: 1 };
                    //    layer.materialParameter[0] = layerData.materialParameter[0];
                    //}

                    //layerData = data.layer[1];
                    //if (layerData.type === "3dface") {
                    //    layer = new DxfLayer({ q: layerData.q, type: layerData.type, name: layerData.name, description: layerData.description });
                    //    this.addLayer(layer);                 
                    //    layer.features = layerData.features;
                    //    //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                    //    //layer.materialParameter[0] = { color: 0x07d8e7, materialtypee: 1, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                    //    layer.materialParameter[0] = layerData.materialParameter[0];
                    //}

                    //layerData = data.layer[2];
                    //if (layerData.type === "3dface") {
                    //    layer = new DxfLayer({ q: layerData.q, type: layerData.type, name: layerData.name, description: layerData.description });
                    //    this.addLayer(layer);                
                    //    layer.features = layerData.features;
                    //    //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                    //    //layer.materialParameter[0] = { color: 0xa07e7e, materialtypee: 1, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                    //    layer.materialParameter[0] = layerData.materialParameter[0];
                    //}

                    //layerData = data.layer[3];
                    //if (layerData.type === "3dface") {
                    //    layer = new DxfLayer({ q: layerData.q, type: layerData.type, name: layerData.name, description: layerData.description });
                    //    this.addLayer(layer);                  
                    //    layer.features = layerData.features;
                    //    //lyr.stats = { max: 115.801765442, min: 27.8207530975 };
                    //    //layer.materialParameter[0] = { color: 0xfc46fc, materialtypee: 1, ds: 1, side: { color: 0xc7ac92, bottomZ: -1.5 } };
                    //    layer.materialParameter[0] = layerData.materialParameter[0];
                    //}

                    deferred.resolve();
                }

                function dataRequestFailed(data) {
                    deferred.reject(data);
                }

                // Return the Promise so caller can't change the Deferred
                return deferred.promise();

            },

            setAge: function (value) {
                // Ensure the supplied value is numeric.
                if (typeof value !== 'number') {
                    throw new TypeError(typeof value + " is not a number.");
                }

                // Ensure the supplied value is valid.
                if (isNaN(value) || value < 0) {
                    throw new RangeError("Supplied value is out of range.");
                }
                this._age = value;
            },

            addLayer: function (layer) {
                //layer.index = this.layers.length;
                layer.dataservice = this;
                this.layers.push(layer);
                Dataservice.LAYERS.push(layer);
                //return layer;
            },

            toMapCoordinates: function (x, y, z) {
                if (this.rotation) {
                    var pt = this._rotatePoint({ x: x, y: y }, this.rotation);
                    x = pt.x;
                    y = pt.y;
                }
                return {
                    x: x / this.scale + this.origin.x,
                    y: y / this.scale + this.origin.y,
                    z: z / this.zScale + this.origin.z
                };
            }

        });

        return Dataservice;
    });