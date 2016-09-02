define('helper/unload',["helper/domEvent"], function (domEvent) {

    // module:
    //		helper/unload

    var win = window;

    var unload = {
        // summary:
        //		This module contains the document and window unload detection API.
        //		This module is deprecated.  Use on(window, "unload", func)
        //		and on(window, "beforeunload", func) instead.

        addOnWindowUnload: function (/*Object|Function?*/ obj, /*String|Function?*/ functionName) {
                
            domEvent.on(win, "unload", unload.hitch(obj, functionName));
        },

        addOnUnload: function (/*Object?|Function?*/ obj, /*String|Function?*/ functionName) {
           
            domEvent.on(win, "beforeunload", unload.hitch(obj, functionName));
        },

        isString: function (it) {
            // summary:
            //		Return true if it is a String
            // it: anything
            //		Item to test.
            return (typeof it == "string" || it instanceof String); // Boolean
        },
        hitch: function (scope, method) {           
            //if (arguments.length > 2) {
            //    return lang._hitchArgs.apply(dojo, arguments); // Function
            //}
            if (!method) {
                method = scope;
                scope = null;
            }
            if (unload.isString(method)) {
                //scope = scope || dojo.global;
                if (!scope[method]) { throw (['lang.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
                return function () { return scope[method].apply(scope, arguments || []); }; // Function
            }
            return !scope ? method : function () { return method.apply(scope, arguments || []); }; // Function
        }
    }; 

    return unload;

});
