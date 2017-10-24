/*
 (c)author qiao / https://github.com/qiao
 (c) author mrdoob / http://mrdoob.com
 (c) author alteredq / http://alteredqualia.com/
 (c) author WestLangley / http://github.com/WestLangley
 (c) author erich666 / http://erichaines.com
 */
define('lib/threejs/OrbitControls',
    ["three", "helper/utilities", "helper/Events", "helper/dom", "helper/domEvent"], function (THREE, util, Events, dom, domEvent) {
           
        "use strict";
        //var util = require("helper/utilities");
        //var Events = require("helper/Events");
        //var dom = require("helper/dom");
        //var domEvent = require("helper/domEvent");

        /**
      * INTERNALS: Any functions not added to the OrbitControls reference won't be visible, or accessible outside of
      * this file (closure); however, these methods and functions don't belong to the OrbitControls class either
      * and are static as a result.
      */
        var EPS = 0.000001;
        var mouseDownPoint = new THREE.Vector2();
        var mouseUpPoint = new THREE.Vector2();
        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();
        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();

        var panOffset = new THREE.Vector3();
        var offset = new THREE.Vector3();

        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();

        var phiDelta = 0;
        var thetaDelta = 0;
        var cameraPhiDelta = 0;
        var cameraThetaDelta = 0;
        var scale = 1;
        var pan = new THREE.Vector3();

        var lastPosition = new THREE.Vector3();

        var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5, CAMERA_ROTATE: 6 };
        var state = STATE.NONE;  
       

        //THREE.OrbitControls.prototype = {
        THREE.OrbitControls = Events.extend({

            //statische Klassenvriablen und Methoden:
            statics: {

                RETIREMENT_AGE: 60,
                create : function (camera, scene, domElement) {
                    var oControls = new THREE.OrbitControls(camera, scene, domElement);
                    oControls._initControlPos();
                    return oControls;
                }

            },
         
            //constructor
            init: function (camera, scene, domElement) {
                this.object = camera;
                this.domElement = (domElement !== undefined) ? domElement : document;
                this.scene = scene;

                // Set to false to disable this control
                this.enabled = true;

                // "target" sets the location of focus, where the control orbits around
                // and where it pans with respect to.
                this.target = new THREE.Vector3();
                // center is old, deprecated; use "target" instead
                this.center = this.target;

                // This option actually enables dollying in and out; left as "zoom" for
                // backwards compatibility
                this.noZoom = false;
                this.zoomSpeed = 1.0;

                // Limits to how far you can dolly in and out
                this.minDistance = 0;
                this.maxDistance = Infinity;

                // Set to true for upside down
                this.upsideDown = false;
                this.object.up.set(0, 0, 1);

                // Set to true to disable this control
                this.noRotate = false;
                this.rotateSpeed = 1.0;
                this.keyRotateAngle = Math.PI / 90;

                // Set to true to disable this control
                this.noPan = false;
                this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

                // Set to true to automatically rotate around the target
                this.autoRotate = false;
                this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

                // How far you can orbit vertically, upper and lower limits.
                // Range is 0 to Math.PI radians.
                this.minPolarAngle = 0; // radians
                this.maxPolarAngle = Math.PI; // radians

                // Set to true to disable use of the keys
                this.noKeys = false;

                // The four arrow keys and additional keys
                this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, AUTOROTATE: 82, UPSIDEDOWN: 85, RESET: 82 };

                // for reset
                this.target0 = this.target.clone();
                this.position0 = this.object.position.clone();

               
                this._initEvents();

            },          

            _initEvents: function (onOff) {
                if (!domEvent) { return; }

                onOff = onOff || 'on';

                //this.domElement.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);
                domEvent
                   [onOff](this.domElement, 'contextmenu', domEvent.stopPropagation)
                   [onOff](this.domElement, 'contextmenu', domEvent.preventDefault);


                //this.domElement.addEventListener('mousedown', onMouseDown, false);
                domEvent
                     [onOff](this.domElement, 'mousedown', domEvent.stopPropagation)
                   [onOff](this.domElement, 'click', domEvent.stopPropagation)
                   [onOff](this.domElement, 'dblclick', domEvent.stopPropagation)
                   [onOff](this.domElement, 'mousedown', domEvent.preventDefault)
                   [onOff](this.domElement, 'mousedown', this.onMouseDown, this);

                //this.domElement.addEventListener('mousewheel', onMouseWheel, false);
                domEvent
                     [onOff](this.domElement, 'mousewheel', domEvent.preventDefault)
                   [onOff](this.domElement, 'mousewheel', domEvent.stopPropagation)
                   [onOff](this.domElement, 'mousewheel', this.onMouseWheel, this);

                //this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
                domEvent
                    [onOff](this.domElement, 'DOMMouseScroll', domEvent.preventDefault)
                  [onOff](this.domElement, 'DOMMouseScroll', domEvent.stopPropagation)
                  [onOff](this.domElement, 'DOMMouseScroll', this.onMouseWheel, this);


                //window.addEventListener('keydown', onKeyDown, false);  
                domEvent
                    [onOff](window, 'keydown', domEvent.stopPropagation)
                    [onOff](window, 'keydown', domEvent.preventDefault)
                    [onOff](window, 'keydown', this.onKeyDown, this);

                //this.domElement.addEventListener('mousemove', onMouseMove, false);
                domEvent[onOff](this.domElement, 'mousemove', this.onMouseMove, this);

                //this.domElement.addEventListener('touchstart', touchstart, false);
                domEvent[onOff](this.domElement, 'touchstart', this.onTouchStart, this);
                //this.domElement.addEventListener('touchend', touchend, false);
                domEvent[onOff](this.domElement, 'touchend', this.onTouchEnd, this);
                //this.domElement.addEventListener('touchmove', touchmove, false);
                domEvent[onOff](this.domElement, 'touchmove', this.onTouchMove, this);

                domEvent[onOff](this.domElement, 'mouseleave', this.onMouseLeave, this);
            },

            _getZoomScale : function () {
                return Math.pow(0.95, this.zoomSpeed);
            },

            _AutoRotationAngle : function() {
                return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
            },

            rotateLeft : function (angle) {
                if (angle === undefined) {
                    angle = this._AutoRotationAngle();
                }
                thetaDelta += angle;
            },

            rotateUp : function (angle) {
                if (angle === undefined) {
                    angle = this._AutoRotationAngle();
                }
                phiDelta -= angle;
            },
                    
            
            // pass in distance in world space to move left
            panLeft : function (distance) {

                var te = this.object.matrix.elements;

                // get X column of matrix
                panOffset.set(te[0], te[1], te[2]);
                panOffset.multiplyScalar(-distance);

                pan.add(panOffset);

            },

            // pass in distance in world space to move up
            panUp : function (distance) {

                var te = this.object.matrix.elements;

                // get Y column of matrix
                panOffset.set(te[4], te[5], te[6]);
                panOffset.multiplyScalar(distance);

                pan.add(panOffset);

            },

            // pass in x,y of change desired in pixel space,
            // right and down are positive
            pan : function (deltaX, deltaY) {

                var element = this.domElement === document ? this.domElement.body : this.domElement;

                if (this.object.fov !== undefined) {

                    // perspective
                    var position = this.object.position;
                    var offset = position.clone().sub(this.target);
                    var targetDistance = offset.length();

                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

                    // we actually don't use screenWidth, since perspective camera is fixed to screen height
                    this.panLeft(2 * deltaX * targetDistance / element.clientHeight);
                    this.panUp(2 * deltaY * targetDistance / element.clientHeight);

                }
                else if (this.object.top !== undefined) {

                    // orthographic
                    this.panLeft(deltaX * (this.object.right - this.object.left) / element.clientWidth);
                    this.panUp(deltaY * (this.object.top - this.object.bottom) / element.clientHeight);

                }
                else {
                    // camera neither orthographic or perspective
                    console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                }

            },

            moveForward : function (delta) {

                var element = this.domElement === document ? this.domElement.body : this.domElement;

                panOffset.copy(this.object.position).sub(this.target);
                var targetDistance = panOffset.length() * Math.tan((this.object.fov / 2) * Math.PI / 180.0);
                panOffset.z = 0;
                panOffset.normalize();
                panOffset.multiplyScalar(-2 * delta * targetDistance / element.clientHeight);

                pan.add(panOffset);

            },

            dollyIn: function (dollyScale) {
                if (dollyScale === undefined) {
                    dollyScale = this._getZoomScale();
                }
                scale /= dollyScale;
                this.update();
            },

            dollyOut : function (dollyScale) {
                if (dollyScale === undefined) {
                    dollyScale = this._getZoomScale();
                }
                scale *= dollyScale;
                this.update();
            },

            update : function () {
                var position = this.object.position; //x = 0, y = -100, z = 200;

                // move target to panned location
                this.target.add(pan);//target ist am Anfang immer x = 0; y = 0; z = 0;
                //auch pan ist am Anfang immer x = 0; y = 0; z = 0;

                //if (this.autoRotate) { //R
                //    this.rotateLeft(getAutoRotationAngle());
                //}
                var theta, phi, radius;
                //if rotate:
                if (thetaDelta || phiDelta) {

                    offset.copy(position).sub(this.target);

                    // angle from y-axis around z-axis
                    theta = Math.atan2(offset.x, offset.y);

                    // angle from z-axis
                    phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.y * offset.y), offset.z);

                    theta += thetaDelta;
                    phi += phiDelta;

                    // restrict phi to be between desired limits
                    phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

                    // restrict phi to be betwee EPS and PI-EPS
                    phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

                    radius = offset.length() * scale;

                    // restrict radius to be between desired limits
                    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

                    offset.x = radius * Math.sin(phi) * Math.sin(theta);
                    offset.y = radius * Math.sin(phi) * Math.cos(theta);
                    offset.z = radius * Math.cos(phi);

                    position.copy(this.target).add(offset);

                }
                    //else if (cameraThetaDelta || cameraPhiDelta) {

                    //    offset.copy(this.target).sub(position);

                    //    // angle from y-axis around z-axis
                    //    theta = Math.atan2(offset.x, offset.y);

                    //    // angle from z-axis
                    //    phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.y * offset.y), offset.z);

                    //    theta += cameraThetaDelta;
                    //    phi += cameraPhiDelta;

                    //    // restrict phi to be between desired limits
                    //    phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

                    //    // restrict phi to be betwee EPS and PI-EPS
                    //    phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

                    //    radius = offset.length() * scale;

                    //    // restrict radius to be between desired limits
                    //    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

                    //    offset.x = radius * Math.sin(phi) * Math.sin(theta);
                    //    offset.y = radius * Math.sin(phi) * Math.cos(theta);
                    //    offset.z = radius * Math.cos(phi);

                    //    this.target.copy(position).add(offset);

                    //}
                else if (scale !== 1) {

                    offset.copy(position).sub(this.target);

                    offset.multiplyScalar(scale);
                    position.copy(this.target).add(offset);

                }
                //pan
                else {
                    position.add(pan);
                }

                this.object.lookAt(this.target);

                thetaDelta = 0;
                phiDelta = 0;
                cameraThetaDelta = 0;
                cameraPhiDelta = 0;
                scale = 1;
                pan.set(0, 0, 0);

                if (lastPosition.distanceTo(this.object.position) > 0) {
                    //this.dispatchEvent(changeEvent);
                    //scope.emit("change");
                    lastPosition.copy(this.object.position);
                }
                this.emit("change");

            },

            reset : function () {
                state = STATE.NONE;
                this.target.copy(this.target0);//0 0 0
                this.object.position.copy(this.position0);
                //this.object.position.set(0, 0, 180);
                this.update();
            },
            
            onMouseDown: function(event) {

                if (this.enabled === false) {
                    return;
                }
                this.rotateDifference = 0;
                event.preventDefault();
                //2d vector:
                mouseDownPoint.set(event.clientX, event.clientY);

                //linke Maustaste
                if (event.button === 0) {
                    if (this.noRotate === true) {
                        return;
                    }
                    state = STATE.ROTATE;
                    rotateStart.set(event.clientX, event.clientY);
                    this.emit("mousedown", event);
                }
                else if (event.button === 1) {
                    if (this.noZoom === true) {
                        return;
                    }
                    state = STATE.DOLLY;
                    //2d vector:
                    dollyStart.set(event.clientX, event.clientY);
                }
                    //rechte Maustaste
                else if (event.button === 2) {
                    if (this.noPan === true) {
                        return;
                    }
                    state = STATE.PAN;
                    panStart.set(event.clientX, event.clientY);
                }

                //this.domElement.addEventListener('mousemove', onMouseDrag, false);
                domEvent.on(this.domElement, 'mousemove', this.onMouseDrag, this);

                //this.domElement.addEventListener('mouseup', onMouseUp, false);
                domEvent.on(this.domElement, 'mouseup', this.onMouseUp, this);

                //scope.dispatchEvent(startEvent);
                this.emit('movestart');

            },

            onMouseMove: function(event) {
                this.emit('mouse-move', event);
            },

            onMouseDrag: function(event) {

                if (this.enabled === false) {
                    return;
                }
                event.preventDefault();

                var element = this.domElement === document ? this.domElement.body : this.domElement;

                if (state === STATE.ROTATE) {

                    if (this.noRotate === true) return;

                    rotateEnd.set(event.clientX, event.clientY);
                    rotateDelta.subVectors(rotateEnd, rotateStart);

                    // rotating across whole screen goes 360 degrees around
                    this.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * this.rotateSpeed);

                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    this.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * this.rotateSpeed);

                    this.rotateDifference = rotateStart.distanceTo(rotateEnd);
                    rotateStart.copy(rotateEnd);
                    this.emit("mouse-pan", event);
                }
                else if (state === STATE.DOLLY) {

                    if (this.noZoom === true) return;

                    dollyEnd.set(event.clientX, event.clientY);
                    dollyDelta.subVectors(dollyEnd, dollyStart);

                    if (dollyDelta.y > 0) {
                        this.dollyIn();

                    } else {
                        this.dollyOut();
                    }
                    dollyStart.copy(dollyEnd);

                }
                else if (state === STATE.PAN) {

                    if (this.noPan === true) return;
                    panEnd.set(event.clientX, event.clientY);
                    panDelta.subVectors(panEnd, panStart);

                    this.pan(panDelta.x, panDelta.y);
                    panStart.copy(panEnd);

                    this.emit("mouse-pan", event);
                }
                //scope.emit('mouse-move', event);
                this.update();

            },//onMouseDrag end

            onMouseUp: function(event) {

                if (this.enabled === false) {
                    return;
                }

                //this.domElement.removeEventListener('mousemove', onMouseDrag, false);
                domEvent.off(this.domElement, 'mousemove', this.onMouseDrag, this);
                //this.domElement.removeEventListener('mouseup', onMouseUp, false);
                domEvent.off(this.domElement, 'mouseup', this.onMouseUp, this);


                //scope.dispatchEvent(endEvent);
                state = STATE.NONE;

                mouseUpPoint.set(event.clientX, event.clientY);

                //var distance = mouseDownPoint.distanceTo(mouseUpPoint);
                //linke Maustaste
                if (event.button === 0 && mouseDownPoint.equals(mouseUpPoint)){// && Math.abs(this.rotateDifference) === 0 ) {
                    //if (event.button === 0 && (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) ) {

                  
                    this.emit("clicked", event);
                    //Q3D.application.canvasClicked(event);
                }
            },//onMoseUp end

            onMouseWheel: function(event) {

                if (this.enabled === false || this.noZoom === true) return;

                event.preventDefault();
                var delta = 0;
                if (event.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
                    delta = event.wheelDelta;
                }
                else if (event.detail !== undefined) { // Firefox
                    delta = - event.detail;
                }
                if (delta > 0) {
                    this.dollyOut();
                }
                else {
                    this.dollyIn();
                }
                this.update();
                //scope.dispatchEvent(startEvent);
                //scope.dispatchEvent(endEvent);
            },

            onMouseLeave: function(event){
                domEvent.off(this.domElement, 'mousemove', this.onMouseDrag, this);
                //this.domElement.removeEventListener('mouseup', onMouseUp, false);
                domEvent.off(this.domElement, 'mouseup', this.onMouseUp, this);
            },

            onKeyDown: function(event) {

                if (this.enabled === false || this.noKeys === true || this.noPan === true) return;

                if (event.shiftKey && event.ctrlKey) {
                    //zoom +
                    if (event.keyCode === this.keys.UP) this.dollyOut();
                    else if (event.keyCode === this.keys.BOTTOM) this.dollyIn();
                    else return;

                }
                else if (event.shiftKey) {

                    switch (event.keyCode) {

                        case this.keys.UP:
                            this.rotateUp(this.keyRotateAngle);
                            break;
                        case this.keys.BOTTOM:
                            this.rotateUp(-this.keyRotateAngle);
                            break;
                        case this.keys.LEFT:
                            this.rotateLeft(-this.keyRotateAngle);
                            break;
                        case this.keys.RIGHT:
                            this.rotateLeft(this.keyRotateAngle);
                            break;
                            //neu
                        case this.keys.RESET:
                            this.reset();
                            break;
                        default:
                            return;
                    }
                }
                else if (event.ctrlKey) {

                    switch (event.keyCode) {

                        case this.keys.UP:
                            this.cameraRotateUp(this.keyRotateAngle);
                            break;
                        case this.keys.BOTTOM:
                            this.cameraRotateUp(-this.keyRotateAngle);
                            break;
                        case this.keys.LEFT:
                            this.cameraRotateLeft(this.keyRotateAngle);
                            break;
                        case this.keys.RIGHT:
                            this.cameraRotateLeft(-this.keyRotateAngle);
                            break;
                        default:
                            break;
                    }

                }
                else {

                    switch (event.keyCode) {

                        case this.keys.UP:
                            this.moveForward(-this.keyPanSpeed);
                            break;
                        case this.keys.BOTTOM:
                            this.moveForward(+this.keyPanSpeed);
                            break;
                        case this.keys.LEFT:
                            this.pan(-this.keyPanSpeed, 0);
                            break;
                        case this.keys.RIGHT:
                            this.pan(+this.keyPanSpeed, 0);
                            break;
                            //case scope.keys.AUTOROTATE: //R
                            //    scope.autoRotate = !scope.autoRotate;
                            //    break;
                        case this.keys.UPSIDEDOWN:
                            this.upsideDown = !this.upsideDown;
                            if (this.upsideDown) this.object.up.set(0, 0, -1);
                            else this.object.up.set(0, 0, 1);
                            break;
                        default:
                            break;
                    }
                }
                this.update();
            },
            
            onTouchStart: function( event ) {

                if ( this.enabled === false ) return;

                switch ( event.touches.length ) {

                    case 1:	// one-fingered touch: rotate

                        //if (scope.enableRotate === false) return;
                        if (this.noRotate === true) return;

                        state = STATE.TOUCH_ROTATE;

                        rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                        break;

                    case 2:	// two-fingered touch: dolly

                        //if ( scope.enableZoom === false ) return;
                        if (this.noZoom === true) {
                            return;
                        }

                        state = STATE.TOUCH_DOLLY;

                        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                        var distance = Math.sqrt( dx * dx + dy * dy );
                        dollyStart.set( 0, distance );
                        break;

                    case 3: // three-fingered touch: pan

                        //if ( scope.enablePan === false ) return;
                        if (this.noPan === true) {
                            return;
                        }

                        state = STATE.TOUCH_PAN;

                        panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                        break;

                    default:

                        state = STATE.NONE;

                }

                //if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );
                if (state !== STATE.NONE) {
                    this.emit('touchstart');
                }
            },

            onTouchMove: function (event) {
                if (this.enabled === false) return;

                event.preventDefault();
                event.stopPropagation();

                var element = this.domElement === document ? this.domElement.body : this.domElement;

                switch (event.touches.length) {

                    case 1: // one-fingered touch: rotate

                        //if (scope.enableRotate === false) return;
                        if (this.noRotate === true) return;
                        if (state !== STATE.TOUCH_ROTATE) return;

                        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        rotateDelta.subVectors(rotateEnd, rotateStart);

                        // rotating across whole screen goes 360 degrees around
                        this.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * this.rotateSpeed);
                        // rotating up and down along whole screen attempts to go 360, but limited to 180
                        this.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * this.rotateSpeed);

                        rotateStart.copy(rotateEnd);
                        this.emit("mouse-pan", event);

                        this.update();
                        break;

                    case 2: // two-fingered touch: dolly

                        //if (scope.enableZoom === false) return;
                        if (this.noZoom === true) return;
                        if (state !== STATE.TOUCH_DOLLY) return;

                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);

                        dollyEnd.set(0, distance);
                        dollyDelta.subVectors(dollyEnd, dollyStart);

                        if (dollyDelta.y > 0) {

                            this.dollyOut(this._getZoomScale());

                        }
                        else if (dollyDelta.y < 0) {
                            this.dollyIn(this._getZoomScale());
                        }
                        dollyStart.copy(dollyEnd);
                        this.emit("mouse-pan", event);

                        this.update();
                        break;

                    case 3: // three-fingered touch: pan

                        //if (scope.enablePan === false) return;
                        if (this.noPan === true) return;
                        if (state !== STATE.TOUCH_PAN) return;

                        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        panDelta.subVectors(panEnd, panStart);

                        pan(panDelta.x, panDelta.y);

                        panStart.copy(panEnd);

                        this.update();
                        break;

                    default:

                        state = STATE.NONE;

                }

            },

            onTouchEnd: function( /* event */ ) {
                if (this.enabled === false) {
                    return;
                }
                //scope.dispatchEvent(endEvent);
                this.emit('touchend');
                state = STATE.NONE;
            },          
   
            
        });
        
        return THREE.OrbitControls;        
});