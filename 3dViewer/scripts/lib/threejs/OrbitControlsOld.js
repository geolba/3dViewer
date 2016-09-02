/*
 (c)author qiao / https://github.com/qiao
 (c) author mrdoob / http://mrdoob.com
 (c) author alteredq / http://alteredqualia.com/
 (c) author WestLangley / http://github.com/WestLangley
 (c) author erich666 / http://erichaines.com 
 */
define('lib/threejs/OrbitControlsOld',
    ["three", "helper/utilities", "helper/Events", "helper/dom", "helper/domEvent"], function (THREE, util, Events, dom, domEvent) {

        ////constant static variable
        //var LOADING_ID_PREFIX = "loading__";

        var controls = {

            type: "OrbitControls",

            //keyList: [
            //  "* Mouse",
            //  "Left button + Move : Orbit",
            //  "Middle button + Move : Zoom",
            //  "Right button + Move : Pan",
            //  "* Keys",
            //  "Arrow keys : Move Horizontally",
            //  "Shift + Arrow keys : Orbit",
            //  "Ctrl + Arrow keys : Rotate",
            //  "Shift + Ctrl + Up / Down : Zoom In / Out",
            //  "R : Auto Rotate On / Off",
            //  "U : Switch Upside Down"
            //],

            create: function (camera,scene, domElement) {
                var oControls = new THREE.OrbitControls(camera,scene, domElement);
                oControls._initControlPos();
                return oControls;
            }

        };

        THREE.OrbitControls = function (camera, scene, domElement) {

            this.object = camera;
            this.domElement = (domElement !== undefined) ? domElement : document;
            this.scene = scene;

            // API

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

            ////////////
            // internals
            var scope = this;
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

          

            // events
            //var changeEvent = { type: 'change' };
            //var startEvent = { type: 'start' };
            //var endEvent = { type: 'end' };            

            this.rotateLeft = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle();
                }
                thetaDelta += angle;
            };

            this._initControlPos = function () {
                var test =  document.getElementById("webgl");

                var corners = this._controlCorners = {};
                var l = 'gba-';
                var container = this._controlContainer =
                            //util.create('div', l + 'control-container', this.domElement);
                            dom.createDom("div", { "class": l + 'control-container' }, test);

                function createCorner(vSide, hSide) {
                    var className = l + vSide + ' ' + l + hSide;

                    //corners[vSide + hSide] = util.create('div', className, container);
                    corners[vSide + hSide] = dom.createDom("div", { "class": className }, container);
                }

                createCorner('top', 'left');
                createCorner('top', 'right');
                createCorner('bottom', 'left');
                createCorner('bottom', 'right');
            };

            this.rotateUp = function (angle) {
                if (angle === undefined) {
                    angle = getAutoRotationAngle();
                }
                phiDelta -= angle;
            };

            this.cameraRotateLeft = function (angle) {
                cameraThetaDelta -= angle;
            };

            this.cameraRotateUp = function (angle) {
                cameraPhiDelta -= angle;
            };

            // pass in distance in world space to move left
            this.panLeft = function (distance) {

                var te = this.object.matrix.elements;

                // get X column of matrix
                panOffset.set(te[0], te[1], te[2]);
                panOffset.multiplyScalar(-distance);

                pan.add(panOffset);

            };

            // pass in distance in world space to move up
            this.panUp = function (distance) {

                var te = this.object.matrix.elements;

                // get Y column of matrix
                panOffset.set(te[4], te[5], te[6]);
                panOffset.multiplyScalar(distance);

                pan.add(panOffset);

            };

            // pass in x,y of change desired in pixel space,
            // right and down are positive
            this.pan = function (deltaX, deltaY) {

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                if (scope.object.fov !== undefined) {

                    // perspective
                    var position = scope.object.position;
                    var offset = position.clone().sub(scope.target);
                    var targetDistance = offset.length();

                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

                    // we actually don't use screenWidth, since perspective camera is fixed to screen height
                    scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
                    scope.panUp(2 * deltaY * targetDistance / element.clientHeight);

                } else if (scope.object.top !== undefined) {

                    // orthographic
                    scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
                    scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);

                } else {
                    // camera neither orthographic or perspective
                    console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                }

            };

            this.moveForward = function (delta) {

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                panOffset.copy(scope.object.position).sub(this.target);
                var targetDistance = panOffset.length() * Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
                panOffset.z = 0;
                panOffset.normalize();
                panOffset.multiplyScalar(-2 * delta * targetDistance / element.clientHeight);

                pan.add(panOffset);

            };

            this.dollyIn = function (dollyScale) {
                if (dollyScale === undefined) {
                    dollyScale = getZoomScale();
                }
                scale /= dollyScale;
                this.update();
            };

            this.dollyOut = function (dollyScale) {
                if (dollyScale === undefined) {
                    dollyScale = getZoomScale();
                }
                scale *= dollyScale;
                this.update();
            };

            this.update = function () {
                var position = this.object.position; //x = 0, y = -100, z = 200;

                // move target to panned location
                this.target.add(pan);//target ist am Anfang immer x = 0; y = 0; z = 0;
                //auch pan ist am Anfang immer x = 0; y = 0; z = 0;

                //if (this.autoRotate) { //R
                //    this.rotateLeft(getAutoRotationAngle());
                //}
                var theta, phi, radius;
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
                scope.emit("change");

            };

            this.reset = function () {
                state = STATE.NONE;
                this.target.copy(this.target0);//0 0 0
                this.object.position.copy(this.position0);
                //this.object.position.set(0, 0, 180);
                this.update();
            };

            function getAutoRotationAngle() {
                return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
            }

            function getZoomScale() {
                return Math.pow(0.95, scope.zoomSpeed);
            }

            function onMouseDown(event) {

                if (scope.enabled === false) {
                    return;
                }
                event.preventDefault();
                //2d vector:
                mouseDownPoint.set(event.clientX, event.clientY);

                //linke Maustaste
                if (event.button === 0) {
                    if (scope.noRotate === true) {
                        return;
                    }
                    state = STATE.ROTATE;
                    rotateStart.set(event.clientX, event.clientY);

                }
                else if (event.button === 1) {
                    if (scope.noZoom === true) {
                        return;
                    }
                    state = STATE.DOLLY;
                    //2d vector:
                    dollyStart.set(event.clientX, event.clientY);
                }
                //rechte Maustaste
                else if (event.button === 2) {
                    if (scope.noPan === true) {
                        return;
                    }
                    state = STATE.PAN;
                    panStart.set(event.clientX, event.clientY);
                }

                scope.domElement.addEventListener('mousemove', onMouseDrag, false);
                scope.domElement.addEventListener('mouseup', onMouseUp, false);

                //scope.dispatchEvent(startEvent);
                scope.emit('movestart');
            }

            function onMouseMove(event) {
                scope.emit('mouse-move', event);
            }

            function onMouseDrag(event) {

                if (scope.enabled === false) {
                    return;
                }
                event.preventDefault();

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                if (state === STATE.ROTATE) {

                    if (scope.noRotate === true) return;

                    rotateEnd.set(event.clientX, event.clientY);
                    rotateDelta.subVectors(rotateEnd, rotateStart);

                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

                    rotateStart.copy(rotateEnd);
                    scope.emit("mouse-pan", event);
                }
                else if (state === STATE.DOLLY) {

                    if (scope.noZoom === true) return;

                    dollyEnd.set(event.clientX, event.clientY);
                    dollyDelta.subVectors(dollyEnd, dollyStart);

                    if (dollyDelta.y > 0) {
                        scope.dollyIn();

                    } else {
                        scope.dollyOut();
                    }
                    dollyStart.copy(dollyEnd);

                } else if (state === STATE.PAN) {

                    if (scope.noPan === true) return;
                    panEnd.set(event.clientX, event.clientY);
                    panDelta.subVectors(panEnd, panStart);

                    scope.pan(panDelta.x, panDelta.y);
                    panStart.copy(panEnd);

                    scope.emit("mouse-pan", event);
                }
                //scope.emit('mouse-move', event);
                scope.update();

            }

            function onMouseUp(event) {

                if (scope.enabled === false) return;

                scope.domElement.removeEventListener('mousemove', onMouseDrag, false);
                scope.domElement.removeEventListener('mouseup', onMouseUp, false);
                //scope.dispatchEvent(endEvent);
                state = STATE.NONE;

                mouseUpPoint.set(event.clientX, event.clientY);
                if (event.button === 0 && mouseDownPoint.equals(mouseUpPoint)) {
                    //var homeEvt = { extent: defaultExtent };
                    scope.emit("clicked", event);
                    //Q3D.application.canvasClicked(event);
                }
            }

            function onMouseWheel(event) {

                if (scope.enabled === false || scope.noZoom === true) return;

                event.preventDefault();
                var delta = 0;
                if (event.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
                    delta = event.wheelDelta;
                }
                else if (event.detail !== undefined) { // Firefox
                    delta = - event.detail;
                }
                if (delta > 0) {
                    scope.dollyOut();
                }
                else {
                    scope.dollyIn();
                }
                scope.update();
                //scope.dispatchEvent(startEvent);
                //scope.dispatchEvent(endEvent);
            }

            function onKeyDown(event) {

                if (scope.enabled === false || scope.noKeys === true || scope.noPan === true) return;

                if (event.shiftKey && event.ctrlKey) {
                    //zoom +
                    if (event.keyCode === scope.keys.UP) scope.dollyOut();
                    else if (event.keyCode === scope.keys.BOTTOM) scope.dollyIn();
                    else return;

                }
                else if (event.shiftKey) {

                    switch (event.keyCode) {

                        case scope.keys.UP:
                            scope.rotateUp(scope.keyRotateAngle);
                            break;
                        case scope.keys.BOTTOM:
                            scope.rotateUp(-scope.keyRotateAngle);
                            break;
                        case scope.keys.LEFT:
                            scope.rotateLeft(-scope.keyRotateAngle);
                            break;
                        case scope.keys.RIGHT:
                            scope.rotateLeft(scope.keyRotateAngle);
                            break;
                            //neu
                        case scope.keys.RESET:
                            scope.reset();
                            break;
                        default:
                            return;
                    }
                }
                else if (event.ctrlKey) {

                    switch (event.keyCode) {

                        case scope.keys.UP:
                            scope.cameraRotateUp(scope.keyRotateAngle);
                            break;
                        case scope.keys.BOTTOM:
                            scope.cameraRotateUp(-scope.keyRotateAngle);
                            break;
                        case scope.keys.LEFT:
                            scope.cameraRotateLeft(scope.keyRotateAngle);
                            break;
                        case scope.keys.RIGHT:
                            scope.cameraRotateLeft(-scope.keyRotateAngle);
                            break;
                        default:
                            break;
                    }

                }
                else {

                    switch (event.keyCode) {

                        case scope.keys.UP:
                            scope.moveForward(scope.keyPanSpeed);
                            break;
                        case scope.keys.BOTTOM:
                            scope.moveForward(-scope.keyPanSpeed);
                            break;
                        case scope.keys.LEFT:
                            scope.pan(scope.keyPanSpeed, 0);
                            break;
                        case scope.keys.RIGHT:
                            scope.pan(-scope.keyPanSpeed, 0);
                            break;
                        //case scope.keys.AUTOROTATE: //R
                        //    scope.autoRotate = !scope.autoRotate;
                        //    break;
                        case scope.keys.UPSIDEDOWN:
                            scope.upsideDown = !scope.upsideDown;
                            if (scope.upsideDown) scope.object.up.set(0, 0, -1);
                            else scope.object.up.set(0, 0, 1);
                            break;
                        default:
                            break;
                    }
                }
                scope.update();
            }

            function touchstart(event) {

                if (scope.enabled === false) return;

                switch (event.touches.length) {

                    case 1:	// one-fingered touch: rotate

                        if (scope.noRotate === true) return;

                        state = STATE.TOUCH_ROTATE;

                        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                        break;

                    case 2:	// two-fingered touch: dolly

                        if (scope.noZoom === true) return;

                        state = STATE.TOUCH_DOLLY;

                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        dollyStart.set(0, distance);
                        break;

                    case 3: // three-fingered touch: pan

                        if (scope.noPan === true) return;

                        state = STATE.TOUCH_PAN;

                        panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                        break;

                    default:

                        state = STATE.NONE;

                }

                scope.dispatchEvent(startEvent);

            }

            function touchmove(event) {

                if (scope.enabled === false) return;

                event.preventDefault();
                event.stopPropagation();

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                switch (event.touches.length) {

                    case 1: // one-fingered touch: rotate

                        if (scope.noRotate === true) return;
                        if (state !== STATE.TOUCH_ROTATE) return;

                        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        rotateDelta.subVectors(rotateEnd, rotateStart);

                        // rotating across whole screen goes 360 degrees around
                        scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                        // rotating up and down along whole screen attempts to go 360, but limited to 180
                        scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

                        rotateStart.copy(rotateEnd);

                        scope.update();
                        break;

                    case 2: // two-fingered touch: dolly

                        if (scope.noZoom === true) return;
                        if (state !== STATE.TOUCH_DOLLY) return;

                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);

                        dollyEnd.set(0, distance);
                        dollyDelta.subVectors(dollyEnd, dollyStart);

                        if (dollyDelta.y > 0) {

                            scope.dollyOut();

                        } else {

                            scope.dollyIn();

                        }

                        dollyStart.copy(dollyEnd);

                        scope.update();
                        break;

                    case 3: // three-fingered touch: pan

                        if (scope.noPan === true) return;
                        if (state !== STATE.TOUCH_PAN) return;

                        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        panDelta.subVectors(panEnd, panStart);

                        scope.pan(panDelta.x, panDelta.y);

                        panStart.copy(panEnd);

                        scope.update();
                        break;

                    default:

                        state = STATE.NONE;

                }

            }

            function touchend( /* event */) {

                if (scope.enabled === false) return;

                scope.dispatchEvent(endEvent);
                state = STATE.NONE;

            }

            //this.domElement.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);
            domEvent
               .on(this.domElement, 'contextmenu', domEvent.stopPropagation)
               .on(this.domElement, 'contextmenu', domEvent.preventDefault);

            //this.domElement.addEventListener('mousedown', onMouseDown, false);
            domEvent
                 .on(this.domElement, 'mousedown', domEvent.stopPropagation)
               .on(this.domElement, 'click', domEvent.stopPropagation)
               .on(this.domElement, 'dblclick', domEvent.stopPropagation)
               .on(this.domElement, 'mousedown', domEvent.preventDefault)
               .on(this.domElement, 'mousedown', onMouseDown);


            //this.domElement.addEventListener('mousewheel', onMouseWheel, false);
            domEvent
                 .on(this.domElement, 'mousewheel', domEvent.preventDefault)
               .on(this.domElement, 'mousewheel', domEvent.stopPropagation)              
               .on(this.domElement, 'mousewheel', onMouseWheel);

            //this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
            domEvent
                .on(this.domElement, 'DOMMouseScroll', domEvent.preventDefault)
              .on(this.domElement, 'DOMMouseScroll', domEvent.stopPropagation)
              .on(this.domElement, 'DOMMouseScroll', onMouseWheel);
         

            //window.addEventListener('keydown', onKeyDown, false);  
            domEvent
                .on(window, 'keydown', domEvent.stopPropagation)
                .on(window, 'keydown', domEvent.preventDefault)
                .on(window, 'keydown', onKeyDown);

            //this.domElement.addEventListener('mousemove', onMouseMove, false);
            domEvent.on(this.domElement, 'mousemove', onMouseMove);

            //this.domElement.addEventListener('touchstart', touchstart, false);
            //this.domElement.addEventListener('touchend', touchend, false);
            //this.domElement.addEventListener('touchmove', touchmove, false);

            //this.handleResize();

        };

        //THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);

        //THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype, {
        //    constructor: THREE.OrbitControls
        //});

        THREE.OrbitControls.prototype = Object.create(Events.prototype, {
            constructor: THREE.OrbitControls
        });      
        //THREE.OrbitControls = EventEmitter.extend({
        //    //EventEmitter.prototype = Object.create(THREE.EventDispatcher.prototype, {

        //    //constructor: EventEmitter,
        //    init: THREE.OrbitControls
        //});

       

        return controls;
});