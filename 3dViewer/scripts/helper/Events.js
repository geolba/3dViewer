define('helper/Events', ["lib/leaflet/Class", 'helper/utilities'
], function (Class, util) {
    "use strict";
    /**
   * Class for managing events.
   * Can be extended to provide event functionality in other classes.
   *
   * @class EventEmitter Manages event registering and emitting.
   */

    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    var eventsKey = '_events';

    //EventEmitter.prototype = {
    var Evented = Class.extend({

        //constructor: EventEmitter,
        init: function () {
            //this.name = "test";
        },

        _getEvents: function _getEvents() {
            return this._events || (this._events = {});
        },

        getListeners: function getListeners(evt) {
            var events = this._getEvents();
            var response;
            var key;

            // Return a concatenated array of all matching events if
            // the selector is a regular expression.
            if (evt instanceof RegExp) {
                response = {};
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        response[key] = events[key];
                    }
                }
            }
            else {
                response = events[evt] || (events[evt] = []);
            }

            return response;
        },

        getListenersAsObject: function getListenersAsObject(evt) {
            var listeners = this.getListeners(evt);
            var response;

            if (listeners instanceof Array) {
                response = {};
                response[evt] = listeners;
            }

            return response || listeners;
        },

        addListener: function (evt, fn, context) { // (String, Function[, Object]) or (Object[, Object])

            // types can be a map of types/handlers
            //if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

            //var events = this.getListenersAsObject(evt);
            var events = this[eventsKey] = this[eventsKey] || {};
            var contextId = context && context !== this && util.stamp(context);
            var i, len, event, type, indexKey, indexLenKey, typeIndex;

            //// types can be a string of space-separated words
            //types = util.splitWords(types);

            //for (i = 0, len = types.length; i < len; i++) {
            event = {
                action: fn,
                context: context || this
            };
            type = evt;// types[i];

            if (contextId) {
                // store listeners of a particular context in a separate hash (if it has an id)
                // gives a major performance boost when removing thousands of map layers

                indexKey = type + '_idx';
                indexLenKey = indexKey + '_len';

                typeIndex = events[indexKey] = events[indexKey] || {};

                if (!typeIndex[contextId]) {
                    typeIndex[contextId] = [];

                    // keep track of the number of keys in the index to quickly check if it's empty
                    events[indexLenKey] = (events[indexLenKey] || 0) + 1;
                }

                typeIndex[contextId].push(event);


            }
            else {
                events[type] = events[type] || [];
                events[type].push(event);
            }
            //}

            return this;
        },

        /**
         * Adds a listener function to the specified event.
         * The listener will not be added if it is a duplicate.
         * If the listener returns true then it will be removed after it is called.
         * If you pass a regular expression as the event name then the listener will be added to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        //addListener: function addListener(evt, listener, context) {
        //    var listeners = this.getListenersAsObject(evt);
        //    var listenerIsWrapped = typeof listener === 'object';
        //    var key;
        //    var event = {
        //        action: listener,
        //        context: context || this
        //    };
        //    var contextId = context && context !== this && util.stamp(context);

        //    for (key in listeners) {
        //        if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
        //            //listeners[key].push(listenerIsWrapped ? event : {
        //            //    listener: event,
        //            //    once: false
        //            //});
        //            if (contextId) {
        //                // gives a major performance boost when removing thousands of map layers

        //                var indexKey = evt + '_idx';
        //                var indexLenKey = indexKey + '_len';

        //                var typeIndex = listeners[indexKey] = listeners[indexKey] || {};

        //                if (!typeIndex[contextId]) {
        //                    typeIndex[contextId] = [];

        //                    // keep track of the number of keys in the index to quickly check if it's empty
        //                    listeners[indexLenKey] = (listeners[indexLenKey] || 0) + 1;
        //                }

        //                typeIndex[contextId].push(event);
        //            }
        //            else {
        //                listeners[key].push(event);
        //            }

        //        }
        //    }

        //    return this;
        //},

        on: alias('addListener'),


        removeListener: function (evt, fn, context) { // ([String, Function, Object]) or (Object[, Object])

            if (!this[eventsKey]) {
                return this;
            }

            //if (!types) {
            //    return this.clearAllEventListeners();
            //}

            //if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

            var events = this[eventsKey],
                contextId = context && context !== this && util.stamp(context),
                i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

            //types = L.Util.splitWords(types);

            //for (i = 0, len = types.length; i < len; i++) {
            type = evt;//types[i];
            indexKey = type + '_idx';
            indexLenKey = indexKey + '_len';

            typeIndex = events[indexKey];

            if (!fn) {
                // clear all listeners for a type if function isn't specified
                delete events[type];
                delete events[indexKey];
                delete events[indexLenKey];

            }
            else {
                listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

                if (listeners) {
                    for (j = listeners.length - 1; j >= 0; j--) {
                        if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
                            removed = listeners.splice(j, 1);
                            // set the old action to a no-op, because it is possible
                            // that the listener is being iterated over as part of a dispatch
                            //removed[0].action = util.falseFn;
                        }
                    }

                    if (context && typeIndex && (listeners.length === 0)) {
                        delete typeIndex[contextId];
                        events[indexLenKey]--;
                    }
                }
            }
            //}

            return this;
        },

        /**
        * Removes a listener function from the specified event.
        * When passed a regular expression as the event name, it will remove the listener from all events that match it.
        *
        * @param {String|RegExp} evt Name of the event to remove the listener from.
        * @param {Function} listener Method to remove from the event.
        * @return {Object} Current instance of EventEmitter for chaining.
        */
        //removeListener: function removeListener(evt, listener) {
        //    var listeners = this.getListenersAsObject(evt);
        //    var index;
        //    var key;

        //    for (key in listeners) {
        //        if (listeners.hasOwnProperty(key)) {
        //            index = indexOfListener(listeners[key], listener);

        //            if (index !== -1) {
        //                listeners[key].splice(index, 1);
        //            }
        //        }
        //    }

        //    return this;
        //},

        off: alias('removeListener'),

        /**
        * Removes all listeners from a specified event.
        * If you do not specify an event then all listeners will be removed.
        * That means every event will be emptied.
        * You can also pass a regex to remove all events that match it.
        *
        * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
        * @return {Object} Current instance of EventEmitter for chaining.
        */
        removeEvent: function removeEvent(evt) {
            var type = typeof evt;
            var events = this._getEvents();
            var key;

            // Remove different things depending on the state of evt
            if (type === 'string') {
                // Remove all listeners for the specified event
                delete events[evt];
            }
            else if (evt instanceof RegExp) {
                // Remove all events matching the regex.
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        delete events[key];
                    }
                }
            }
            else {
                // Remove all listeners in all events
                delete this._events;
            }

            return this;
        },

        //emitEvent: function emitEvent(evt, args) {
        //    var listenersMap = this.getListenersAsObject(evt);
        //    var listeners;
        //    var listener;
        //    var i;
        //    var key;
        //    var response;

        //    for (key in listenersMap) {
        //        if (listenersMap.hasOwnProperty(key)) {
        //            listeners = listenersMap[key].slice(0);
        //            i = listeners.length;

        //            while (i--) {
        //                // If the listener returns true then it shall be removed from the event
        //                // The function is executed either with a basic call or an apply if there is an args array
        //                listener = listeners[i];

        //                if (listener.once === true) {
        //                    this.removeListener(evt, listener.listener);
        //                }

        //                response = listener.action.apply(this, args || []);

        //                //if (response === this._getOnceReturnValue()) {
        //                //    this.removeListener(evt, listener.listener);
        //                //}
        //            }
        //        }
        //    }           

        //    return this;
        //},

        //emit: function emit(evt) {
        //    var args = Array.prototype.slice.call(arguments, 1);
        //    return this.emitEvent(evt, args);
        //},

        hasEventListeners: function (type) { // (String) -> Boolean
            var events = this[eventsKey];
            return !!events && ((type in events && events[type].length > 0) ||
                                (type + '_idx' in events && events[type + '_idx_len'] > 0));
        },

        emit: function (type, data) { // (String[, Object])
            if (!this.hasEventListeners(type)) {
                return this;
            }

            var event = util.extend({}, data, { type: type, target: this });

            var events = this[eventsKey],
                listeners, i, len, typeIndex, contextId;

            if (events[type]) {
                // make sure adding/removing listeners inside other listeners won't cause infinite loop
                listeners = events[type].slice();

                for (i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].action.call(listeners[i].context, event);
                }
            }

            // fire event for the context-indexed listeners as well
            typeIndex = events[type + '_idx'];

            for (contextId in typeIndex) {
                listeners = typeIndex[contextId].slice();

                if (listeners) {
                    for (i = 0, len = listeners.length; i < len; i++) {
                        listeners[i].action.call(listeners[i].context, event);
                    }
                }
            }

            return this;
        },

    });

    return Evented;

});