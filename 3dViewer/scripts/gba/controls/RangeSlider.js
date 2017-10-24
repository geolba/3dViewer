// Filename: RangeSlider.js 
define('gba/controls/RangeSlider', ["lib/leaflet/Class", "jquery", "helper/dom", "helper/domEvent", 'helper/domUtil', "helper/utilities", "helper/mixin"
], function (Class, $, dom, domEvent, domUtil, util, mixin) {
    "use strict";
    /**
   * @class BootstrapSlider
   *
   * RangeSlider
   *
   */

    var BootstrapSlider = Class.extend({


        includes: mixin.Events,
        over: false,
        inDrag: false,

        options: {
            value: 0, // set default value on initiation from `0` to `100` (percentage based)
            vertical: false, // vertical or horizontal?
            orientation: "horizontal",
            rangeClass: "", // add extra custom class for the range slider track
            draggerClass: "",// add extra custom class for the range slider dragger
            //min: -50,
            //max: 50,
            selection: 'before',
            tooltip: 'show',
            handle: 'round',
            step: 1
        },

        init: function (elem, options) {
            util.setOptions(this, options);
            this.value = this.options.value;

            this.element = elem;

            //this._initLayout();
            this.picker = dom.createDom("div", {
                "class": 'slider', innerHTML:
                                '<div class="range-slider-track">' +
                                    '<div class="slider-selection"></div>' +
                                    '<div class="slider-handle"></div>' +
                                    '<div class="slider-handle"></div>' +
                                '</div>' +
                                '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'

            }, this.element);

            this.id = this.options.id;
            var tooltip = this.options.tooltip;
            this.tooltip = this.picker.getElementsByClassName('tooltip')[0];
            this.tooltipInner = this.tooltip.getElementsByClassName('tooltip-inner')[0];

            this.orientation = this.options.orientation;

            if (this.orientation === "horizontal") {
                domUtil.addClass(this.picker, "slider-horizontal");
                //.addClass('slider-horizontal')
                //.css('width', this.element.outerWidth());             
                //$(this.picker).css('width', $(this.element).outerWidth());
                //this.picker.style.width = this.element['offsetWidth'] + 'px';
                this.orientation = 'horizontal';
                this.stylePos = 'left';
                this.mousePos = 'pageX';
                this.sizePos = 'offsetWidth';
                //this.tooltip.addClass('top')[0].style.top = -this.tooltip.outerHeight() - 14 + 'px';
                domUtil.addClass(this.tooltip, "top");
                this.tooltip.style.top = -this.tooltip['offsetHeight'] - 14 + 'px';
            }

            this.min = this.options.min;
            this.max = this.options.max;
            this.step = this.options.step;
            this.value = this.options.value;
            //if (this.value[1]) {
            //    this.range = true;
            //}

            this.selection = this.options.selection;
            this.selectionEl = this.picker.getElementsByClassName('slider-selection')[0];
            if (this.selection === 'none') {
                //this.selectionEl.addClass('hide');
                domUtil.addClass(this.selectionEl, "hide");
            }
            this.selectionElStyle = this.selectionEl.style;

            this.handle1 = this.picker.getElementsByClassName('slider-handle')[0];
            this.handle1Stype = this.handle1.style;
            this.handle2 = this.picker.getElementsByClassName('slider-handle')[1];
            this.handle2Stype = this.handle2.style;

            var handle = this.options.handle;
            switch (handle) {
                case 'round':
                    domUtil.addClass(this.handle1, "round");
                    domUtil.addClass(this.handle2, "round");
                    break;
                case 'triangle':
                    domUtil.addClass(this.handle1, "triangle");
                    domUtil.addClass(this.handle2, "triangle");
                    break;
            }

            if (this.range) {
                this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
                this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
            }
            {
                this.value = [Math.max(this.min, Math.min(this.max, this.value))];
                //this.handle2.addClass('hide');
                domUtil.addClass(this.handle2, "hide");
                if (this.selection === 'after') {
                    this.value[1] = this.max;
                } else {
                    this.value[1] = this.min;
                }
            }

            this.diff = this.max - this.min;
            this.percentage = [
                (this.value[0] - this.min) * 100 / this.diff,
                (this.value[1] - this.min) * 100 / this.diff,
                this.step * 100 / this.diff
            ];

            //this.offset = this.picker.offset();
            this.offset = $(this.picker).offset();
            this.size = this.picker[this.sizePos];

            //this.formater = options.formater;

            this.layout();

            domEvent.on(this.picker, "mousedown", this.mousedown, this);
            domUtil.addClass(this.tooltip, "hide");

        },

        layout: function () {
            this.handle1Stype[this.stylePos] = this.percentage[0] + '%';
            //this.handle2Stype[this.stylePos] = this.percentage[1] + '%';

            //if (this.orientation == 'vertical') {
            //    this.selectionElStyle.top = Math.min(this.percentage[0], this.percentage[1]) + '%';
            //    this.selectionElStyle.height = Math.abs(this.percentage[0] - this.percentage[1]) + '%';
            //}

            this.selectionElStyle.left = Math.min(this.percentage[0], this.percentage[1]) + '%';
            this.selectionElStyle.width = Math.abs(this.percentage[0] - this.percentage[1]) + '%';

            //if (this.range) {
            //    this.tooltipInner.text(
            //		this.formater(this.value[0]) +
            //		' : ' +
            //		this.formater(this.value[1])
            //	);
            //    this.tooltip[0].style[this.stylePos] = this.size * (this.percentage[0] + (this.percentage[1] - this.percentage[0]) / 2) / 100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + 'px';
            //} else {
            //    this.tooltipInner.text(
            //		this.formater(this.value[0])
            //	);
            //    this.tooltip[0].style[this.stylePos] = this.size * this.percentage[0] / 100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + 'px';
            //}
        },


        mousedown: function (ev) {

            // Touch: Get the original event:
            if (this.touchCapable && ev.type === 'touchstart') {
                ev = ev.originalEvent;
            }

            //this.offset = this.picker.offset();
            this.offset = $(this.picker).offset();
            this.size = this.picker[this.sizePos];

            var percentage = this.getPercentage(ev);

            if (this.range) {
                var diff1 = Math.abs(this.percentage[0] - percentage);
                var diff2 = Math.abs(this.percentage[1] - percentage);
                this.dragged = (diff1 < diff2) ? 0 : 1;
            }
            else {
                this.dragged = 0;
            }

            this.percentage[this.dragged] = percentage;
            this.layout();

            domEvent.on(this.picker, "mousemove", this.mousemove, this);
            domEvent.on(this.picker, 'mouseup', this.mouseup, this);
            domEvent.on(this.picker, 'mouseleave', this.onMouseLeave, this);

            this.inDrag = true;
            var val = this.calculateValue();
            //if (this.options.inverse === true) {
            //    val = val * -1;
            //}

            this.emit("slide", val);
            return false;
        },

        mousemove: function (ev) {

            // Touch: Get the original event:
            if (this.touchCapable && ev.type === 'touchmove') {
                ev = ev.originalEvent;
            }

            var percentage = this.getPercentage(ev);
            if (this.range) {
                if (this.dragged === 0 && this.percentage[1] < percentage) {
                    this.percentage[0] = this.percentage[1];
                    this.dragged = 1;
                } else if (this.dragged === 1 && this.percentage[0] > percentage) {
                    this.percentage[1] = this.percentage[0];
                    this.dragged = 0;
                }
            }
            this.percentage[this.dragged] = percentage;
            this.layout();
            var val = this.calculateValue();
            //this.element
            //	.trigger({
            //	    type: 'slide',
            //	    value: val
            //	})
            //	.data('value', val)
            //	.prop('value', val);
            //if (this.options.inverse === true) {
            //    val = val * -1;
            //}
            this.emit("slide", val);
            return false;
        },

        mouseup: function (ev) {

            domEvent.off(this.picker, "mousemove", this.mousemove, this);
            domEvent.off(this.picker, 'mouseup', this.mouseup, this);
            domEvent.off(this.picker, 'mouseleave', this.onMouseLeave, this);

            this.inDrag = false;
            //if (this.over == false) {
            //    this.hideTooltip();
            //}
            this.element;
            var val = this.calculateValue();
            //this.element
            //	.trigger({
            //	    type: 'slideStop',
            //	    value: val
            //	})
            //	.data('value', val)
            // //	.prop('value', val);
            this.emit("changed", val);
            return false;
        },

        onMouseLeave: function () {

            domEvent.off(this.picker, "mousemove", this.mousemove, this);
            domEvent.off(this.picker, 'mouseup', this.mouseup, this);
            domEvent.off(this.picker, 'mouseleave', this.onMouseLeave, this);
            //also change border geometry
            var val = this.calculateValue();
            this.emit("changed", val);
        },

        calculateValue: function () {
            var val;
            if (this.range) {
                val = [
					(this.min + Math.round((this.diff * this.percentage[0] / 100) / this.step) * this.step),
					(this.min + Math.round((this.diff * this.percentage[1] / 100) / this.step) * this.step)
                ];
                this.value = val;
            } else {
                val = (this.min + Math.round((this.diff * this.percentage[0] / 100) / this.step) * this.step);
                this.value = [val, this.value[1]];
            }
            return val;
        },

        getPercentage: function (ev) {
            if (this.touchCapable) {
                ev = ev.touches[0];
            }
            var percentage = (ev[this.mousePos] - this.offset[this.stylePos]) * 100 / this.size;
            percentage = Math.round(percentage / this.percentage[2]) * this.percentage[2];
            return Math.max(0, Math.min(100, percentage));
        },

        getValue: function () {
            if (this.range) {
                return this.value;
            }
            return this.value[0];
        },

        setValue: function (val) {
            this.value = val;

            if (this.range) {
                this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
                this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
            } else {
                this.value = [Math.max(this.min, Math.min(this.max, this.value))];
                this.handle2.addClass('hide');
                if (this.selection === 'after') {
                    this.value[1] = this.max;
                } else {
                    this.value[1] = this.min;
                }
            }
            this.diff = this.max - this.min;
            this.percentage = [
				(this.value[0] - this.min) * 100 / this.diff,
				(this.value[1] - this.min) * 100 / this.diff,
				this.step * 100 / this.diff
            ];
            this.layout();
        }



    });

    return BootstrapSlider;


});