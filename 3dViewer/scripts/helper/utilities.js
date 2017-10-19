// Filename: utilities.js -> static class
define('helper/utilities',
    ["jquery", "helper/dom", "i18n!nls/template"], function ($, dom, myLabels) {
        "use strict";

        //constant static variable
        var LOADING_ID_PREFIX = "loading_";

        //Used to filter out dependencies that are already paths.
        var jsExtRegExp = /^\/|:|\?|\.js$/;

        var util = {

            //Add a work helper function to the jQuery object
            work: function (args) {
                var def = $.Deferred(function (dfd) {
                    var worker;
                    if (window.Worker) {
                        //Construct the Web Worker
                        worker = new Worker(args.file);

                        //worker.onmessage = function (event) {
                        worker.addEventListener('message', function (event) {
                            // get data from the worker.
                            //if (event.data == "in require") {
                            //   // Send data to our worker.
                            //    worker.postMessage({
                            //        args: args.args                                   
                            //    });                                
                            //}

                            //If the Worker reports success, resolve the Deferred
                            dfd.resolve(event.data);

                            //};
                        }, false);

                        //worker.onerror = function(event) {
                        //    //If the Worker reports an error, reject the Deferred
                        //    dfd.reject(event); 
                        //};
                        worker.addEventListener('error', function (event) {
                            //Reject the Deferred if the Web Worker has an error
                            def.reject(event);
                        }, false);

                        worker.postMessage({ args: args.args });  //Start the worker with supplied args
                    }
                    else {
                        //Need to do something when the browser doesn't have Web Workers
                    }
                });

                //Return the promise object (an "immutable" Deferred object for consumers to use)
                return def.promise();
            },

            //Add a work helper function to the jQuery object
            workRequire: function (args) {
                var def = $.Deferred(function (dfd) {
                    var worker;
                    if (window.Worker) {
                        //Construct the Web Worker
                        worker = new Worker(args.file);

                        //worker.onmessage = function (event) {
                        worker.addEventListener('message', function (event) {
                            // get data from the worker.
                            if (event.data === "in require") {
                                //worker.postMessage(borderEdges); // Send data to our worker.
                                worker.postMessage({
                                    args: args.args,
                                    //graph: args.graph
                                }); //Start the worker with supplied args
                                //worker.postMessage({ index: args.index });
                            }
                            else {
                                //If the Worker reports success, resolve the Deferred
                                dfd.resolve(event.data);
                            }
                            //};
                        }, false);

                        //worker.onerror = function(event) {
                        //    //If the Worker reports an error, reject the Deferred
                        //    dfd.reject(event); 
                        //};
                        worker.addEventListener('error', function (event) {
                            //Reject the Deferred if the Web Worker has an error
                            def.reject(event);
                        }, false);
                        //worker.postMessage(args.args); //Start the worker with supplied args
                    }
                    else {
                        //Need to do something when the browser doesn't have Web Workers
                    }
                });

                //Return the promise object (an "immutable" Deferred object for consumers to use)
                return def.promise();
            },

            setLoading: function (elemID) {
                //debug("setting loading " + elemID);

                //// 1) create the jQuery Deferred object that will be used
                //var deferred = $.Deferred();
                //var ownerDocumentBody = document.getElementById(elemID);

                var loadingDivID = LOADING_ID_PREFIX + elemID;
                //var loadingDivID = "loading_" + elemID;
                var existingDiv = $("#" + loadingDivID);
                //var existingDiv = dom.byId(loadingDivID);


                // if the loading div for given element already exists,
                // increment the lock attribute value (or create the attribute,
                // if not exists)
                if (existingDiv.length > 0) {
                    //existingDiv.css("display", "inline");
                    //dom.setProperties(existingDiv, {
                    //    style: "display: block"
                    //});
                    if (typeof (existingDiv.attr("lock")) === "undefined") {
                        existingDiv.attr("lock", 1);
                    } else {
                        existingDiv.attr("lock", parseInt(existingDiv.attr("lock")) + 1);
                    }

                }
                    // otherwise, create the div and append it to body
                else {
                    // construct the div from markup
                    //var loadingDiv = dom.createDom("div", { id: loadingDivID, "class": "loading" }, ownerDocumentBody);
                    var loadingDiv = $("<div id=\"" + loadingDivID + "\" class=\"loading\"></div>");

                    //var loadingDivContent = dom.createDom("div", { id: loadingDivID, innerHTML: myLabels.viewer.messages.waitMessage, "class": "loading-content" }, loadingDiv);
                    var loadingDivContent = $("<div class=\"loading-content\">" + myLabels.viewer.messages.waitMessage + "</div>");
                    loadingDiv.append(loadingDivContent);

                    // get the element to be covered with the loading div...
                    var targetElement = $("#" + elemID);

                    // ... and get its proportions
                    var offset = targetElement.offset();
                    var width = targetElement.outerWidth();
                    var height = targetElement.outerHeight();

                    // make the div fit the target element
                    loadingDiv.css({
                        "left": offset.left,
                        "top": offset.top,
                        "width": width + "px",
                        "height": height + "px"
                    });
                    //dom.setProperties(loadingDiv, {
                    //    style: "width:" + width + "px;  height:" + height + "px;"// left:" + offset.left + "px; top:" + offset.top + "px"
                    //});


                    // make the text appear in the middle of the loading div
                    //dom.setProperties(loadingDivContent, {
                    //    style: "line-height:" + height  + "px;"
                    //});
                    loadingDivContent.css({
                        "line-height": height + "px"
                    });


                    $("body").append(loadingDiv);
                    //loadingDiv.appendTo('body');
                    //document.body.appendChild(loadingDiv);
                    //deferred.resolve();
                    return loadingDiv;
                }
                //return deferred.promise();
            },

            unsetLoading: function (elemID) {
                //debug("unsetting loading " + elemID);

                var loadingDivElement = $("#" + LOADING_ID_PREFIX + elemID);
                //loadingDivElement.css("display", "none");

                //var loadingDiv = dom.byId(LOADING_ID_PREFIX + elemID);
                //dom.setProperties(loadingDiv, {
                //    style: "display: none"
                //});

                var lock = loadingDivElement.attr("lock");

                if (typeof (lock) === "undefined") {
                    loadingDivElement.remove();
                } else {
                    var lockValue = parseInt(lock);

                    if (lockValue > 1) {
                        loadingDivElement.attr("lock", lockValue - 1);
                    } else {
                        loadingDivElement.removeAttr("lock");
                    }
                }
            },

            stamp: (function () {
                var lastId = 0,
                    key = '_gba_id';
                return function (obj) {
                    obj[key] = obj[key] || ++lastId;
                    return obj[key];
                };
            }()),

            // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
            createRadioElement: function (name, checked) {

                var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
                if (checked) {
                    radioHtml += ' checked="checked"';
                }
                radioHtml += '/>';

                var radioFragment = document.createElement('div');
                radioFragment.innerHTML = radioHtml;

                return radioFragment.firstChild;
            },

            mixin: function (dest, sources) {
                if (!dest) { dest = {}; }
                for (var i = 1, l = arguments.length; i < l; i++) {
                    util._mixin(dest, arguments[i]);
                }
                return dest; // Object
            },

            _mixin: function (dest, source, copyFunc) {

                var name, s, empty = {};
                for (name in source) {
                    s = source[name];
                    if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                        dest[name] = copyFunc ? copyFunc(s) : s;
                    }
                }

                return dest; // Object
            },

            setOptions: function (obj, options) {
                obj.options = this._extend({}, obj.options, options);
                return obj.options;
            },

            _extend: function (dest) { // (Object[, Object, ...]) ->
                var sources = Array.prototype.slice.call(arguments, 1),
                    i, j, len, src;

                for (j = 0, len = sources.length; j < len; j++) {
                    src = sources[j] || {};
                    for (i in src) {
                        if (src.hasOwnProperty(i)) {
                            dest[i] = src[i];
                        }
                    }
                }
                return dest;
            },
            // extend an object with properties of one or more other objects
            extend: function (dest) {
                var i, j, len, src;

                for (j = 1, len = arguments.length; j < len; j++) {
                    src = arguments[j];
                    for (i in src) {
                        dest[i] = src[i];
                    }
                }
                return dest;
            },

            // trim whitespace from both sides of a string
            trim: function (str) {
                return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
            },

            // split a string into words
            splitWords: function (str) {
                return util.trim(str).split(/\s+/);
            },

            convertToDMS: function (lat, lon) {
                function toDMS(degrees) {
                    var deg = Math.floor(degrees),
                        m = (degrees - deg) * 60,
                        min = Math.floor(m),
                        sec = (m - min) * 60;
                    return deg + "°" + ("0" + min).slice(-2) + "′" + ((sec < 10) ? "0" : "") + sec.toFixed(2) + "″";
                }

                return ((lat < 0) ? "S" : "N") + toDMS(Math.abs(lat)) + ", " +
                       ((lon < 0) ? "W" : "E") + toDMS(Math.abs(lon));
            },


            showLoading: function () {
                var element = dom.byId("loadingImg");
                //domUtil.show(_loading);
                if (element) {
                    element.style.display = "block";
                }
            },

            hideLoading: function () {
                var element = dom.byId("loadingImg");
                if (element) {
                    element.style.display = "none";
                }
            },

            hasTouch: function () {
                var phantomjs = navigator.userAgent.toLowerCase().indexOf('phantom') !== -1;

                var isTouchDevice = phantomjs
                    || 'ontouchstart' in window
                    || (window.DocumentTouch && document instanceof window.DocumentTouch)
                    || ("onpointerdown" in document && navigator.maxTouchPoints > 0)
                    || window.navigator.msMaxTouchPoints;
                return isTouchDevice;
            },

            scriptFolder: function () {
                var baseURL = require.toUrl('./');
                baseURL = baseURL.substring(0, baseURL.indexOf('?'));
                return baseURL;
            },


            rootFolder: function () {
                var baseURL = require.toUrl('./');
                baseURL = baseURL.substring(0, baseURL.indexOf('?'));
                var res = baseURL.replace("scripts/", "").replace("dist/", "");
                return res;
            }

        }

        return util;

    });