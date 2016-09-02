// Filename: domUtil.js -> static class
define('helper/domUtil',
    ["helper/utilities"], function (util) {
               
        var domUtil = {

            hasClass: function (el, name) {
                if (el.classList !== undefined) {
                    return el.classList.contains(name);
                }
                var className = domUtil.getClass(el);
                return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
            },

            getClass: function (el) {
                return el.className.baseVal === undefined ? el.className : el.className.baseVal;
            },

            addClass: function (el, name) {
                if (el.classList !== undefined) {
                    var classes = util.splitWords(name);
                    for (var i = 0, len = classes.length; i < len; i++) {
                        el.classList.add(classes[i]);
                    }
                }
                else if (!domUtil.hasClass(el, name)) {
                    var className = domUtil.getClass(el);
                    domUtil.setClass(el, (className ? className + ' ' : '') + name);
                }
            },

            removeClass: function (el, name) {
                if (el.classList !== undefined) {
                    el.classList.remove(name);
                }
                else {
                    domUtil.setClass(el, util.trim((' ' + domUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
                }
            },

            getNode: function (element) {
                return element && element.domNode || element;
            }
            
           

        };

        return domUtil;

});