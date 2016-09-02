// Filename: dom.js -> static class
define('helper/dom',
    ["jquery"], function ($) {

       
        var dom = {

            //create: function (tagName, className, container) {
            //    var el = document.createElement(tagName);
            //    el.className = className;
            //    if (container) {
            //        container.appendChild(el);
            //    }
            //    return el;
            //},

            getDocument : function() {
                return document;
            },
            byId : function(id, doc){
                // inline'd type check.
                // be sure to return null per documentation, to match IE branch.
                return ((typeof id == "string") ? (doc || document).getElementById(id) : id) || null; // DOMNode
            },

            /**
             * Returns a dom node with a set of attributes.  This function accepts varargs
             * for subsequent nodes to be added.  Subsequent nodes will be added to the
             * first node as childNodes.
             *
             * So:
             * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
             * would return a div with two child paragraphs
             *
             * @param {String} tagName Tag to create
             * @param {Object} opt_attributes Map of name-value pairs for attributes
             * @param {Object|Array} var_args Further DOM nodes or strings for text nodes.
             *     If one of the var_args is an array, its children will be added as
             *     childNodes instead.
             * @return {Element} Reference to a DOM node
             */
            createDom : function(tagName, opt_attributes, parent_node) {
                return dom._createDom(document, arguments);
            },
            _escapeHtml: function(str) {
                if (str) return $('<div />').html(str).text();
            },

            _createDom: function(doc, args) {
                var tagName = args[0];
                var attributes = args[1];
                //var var_args =  args[2];

                //if (attributes && (attributes.name || attributes.type)) {
                //    var tagNameArr = ['<', tagName];
                //    if (attributes.name) {
                //        tagNameArr.push(' name="', dom._escapeHtml(attributes.name), '"');
                //    }
                //    if (attributes.type) {
                //        tagNameArr.push(' type="', dom._escapeHtml(attributes.type), '"');

                //        // Clone attributes map to remove 'type' without mutating the input.
                //        var clone = {};
                //       util._extend(clone, attributes);

                //        // JSCompiler can't see how goog.object.extend added this property,
                //        // because it was essentially added by reflection.
                //        // So it needs to be quoted.
                //        delete clone['type'];

                //        attributes = clone;
                //    }
                //    tagNameArr.push('>');
                //    tagName = '<input type="checkbox">'; //tagNameArr.join('');
                //}

                var element = doc.createElement(tagName);
                //var element = $(tagName);

                if (attributes) {
                    if ($.type(attributes) === "string") {
                        element.className = attributes;
                    }
                    //else if ($.isArray(attributes)) {
                    //    //goog.dom.classes.add.apply(null, [element].concat(attributes));
                    //}
                    else {
                        dom.setProperties(element, attributes);
                    }
                }

                if (args.length > 2) {
                    var parent_node = args[2];
                    parent_node.appendChild(element);
                    //parent_node.insertBefore(element, parent_node.firstChild)
                }

                return element;
            },

            setProperties : function(element, properties) {
                //goog.object.forEach(properties, function(val, key) {
                $.each( properties, function( key, val ) {
              
                    if (key === 'style') {
                        element.style.cssText = val;
                    }
                    else if (key === 'class') {
                        element.className = val;
                    }
                    else if (key === 'for') {
                        element.htmlFor = val;
                    }
                    else if (key in dom.ATTRIBUTE_MAP) {
                        element.setAttribute(dom.ATTRIBUTE_MAP[key], val);
                    }                   
                    else {
                        element[key] = val;
                    }
                });
            },

            ATTRIBUTE_MAP: {
                'cellpadding': 'cellPadding',
                'cellspacing': 'cellSpacing',
                'colspan': 'colSpan',
                'frameborder': 'frameBorder',
                'height': 'height',
                'maxlength': 'maxLength',
                'role': 'role',
                'rowspan': 'rowSpan',
                'type': 'type',
                'usemap': 'useMap',
                'valign': 'vAlign',
                'width': 'width'
            }



        };

        return dom;

    });