// Filename: DxfIdentify.js -> class
define('gba/tasks/DxfIdentify', ["jquery", "three"
], function ($, THREE) {
    "use strict";

    function DxfIdentify(defaults) {

        if (!(this instanceof DxfIdentify)) {
            throw new TypeError("DxfIdentify constructor cannot be called as a function.");
        }

        this.type = "DxfIdentify";
        this.searchUrl = "";
        this.camera = defaults.camera;
        this.domElement = defaults.domElement;
        //this.layer = defaults.layer;
        this.highlightMaterial = defaults.highlightMaterial;
        this.layers = defaults.layers;
    }


    DxfIdentify.prototype = {

        config: {},
        
        constructor: DxfIdentify,

        execute: function (params) {
            var canvasOffset = $(this.domElement).offset();
            var xClickedOnCanvas = params.clientX - canvasOffset.left;
            var yClickedonCanvas = params.clientY - canvasOffset.top;
            //this.camera = params.camera;

            var eventsResponse = this._intersectObjects(xClickedOnCanvas, yClickedonCanvas, params.width, params.height);
            //if (objs.length == 0) {
            //    //
            //}
            return eventsResponse.then(
                  function (response) {
                      return response;
                  });
        },
        //returnEvents: function (response) {
        //    return response
        //},
        //err: function (err) {
        //    console.log("Failed to get results from GetFeatureInfo: ", err);
        //},

        _intersectObjects: function (offsetX, offsetY, width, height) {
            var deferred = $.Deferred();

            //// calculate mouse position in normalized device coordinates
            //// (-1 to +1) for both components
            //mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            //mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            var mouseXForRay = (offsetX / width) * 2 - 1;
            var mouseYForRay = -(offsetY / height) * 2 + 1;
            var z = 0.5;
            var vector = new THREE.Vector3(mouseXForRay, mouseYForRay, z);
            vector.unproject(this.camera);
            // Convert the [-1, 1] screen coordinate into a world coordinate on the near plane
            //var projector = new THREE.Projector();
            //projector.unprojectVector(vector, this.camera);

            vector.sub(this.camera.position);
            vector.normalize();
            var raycaster = new THREE.Raycaster(this.camera.position, vector);
            //var raycaster = new THREE.Raycaster(vector, new THREE.Vector3(0, 1, 0).normalize());

            //var direction = new THREE.Vector3(0, 0, 1);
            //var raycaster = new THREE.Raycaster();
            //raycaster.set(vector, direction);

            //var raycaster = new THREE.Raycaster();           
            //raycaster.setFromCamera(mouse, this.camera);

            var a = this._getQueryableObjects2();
            //var intersects = raycaster.intersectObjects(a, true);
            var intersects = raycaster.identifyObjects(a, true);
            var resultObjects = [];

            //for (var i = objs.length - 1; i >= 0; i--) {
            for (var i = 0; i < intersects.length; i++) {
                var obj = intersects[i];
                if (!obj.object.visible) continue;
                // get layerId and featureId of clicked object
                var layer = obj.object;
                var layerId = layer.userData.layerId;
                var featureId = obj.faceIndex;//obj.index;

                //var feature = this._highlightFeature((layerId === undefined) ? null : layerId, (featureId === undefined) ? null : featureId);
                var result = {
                    //highlightFeature: feature,
                    point: obj.point,
                    distance: obj.distance,
                    layerId: layerId,
                    featureId: featureId
                };
                resultObjects.push(result);
                break;
            }


            //// resolve the deferred with the result of the slow process
            deferred.resolve({ resultObjects: resultObjects, offsetX: offsetX, offsetY: offsetY });
            // and return the deferred
            return deferred.promise();
        },

        _highlightFeature : function (layerId, featureId) {
            //if (app.highlightObject) {
            //    // remove highlight object from the scene
            //    app.scene.remove(app.highlightObject);
            //    app.selectedLayerId = null;
            //    app.selectedFeatureId = null;
            //    app.highlightObject = null;
            //}

            if (layerId === null) return;
            var layer = this.layers[layerId];
            if (layer === undefined) return;           
            var f;
            if (layer.features) {
                f = layer.features[featureId];
                if (f === undefined) return;
            } else {
                return;
            }

            var high_mat = this.highlightMaterial;
            //var setMaterial = function (obj) {
            //    obj.material = high_mat;
            //};

            // create a highlight object (if layer type is Point, slightly bigger than the object)
            var highlightObject = new THREE.Group();
            //var clone;
            //var s = (layer.type == Q3D.LayerType.Point) ? 1.01 : 1;

            var geo = new THREE.Geometry();
            var v1 = new THREE.Vector3(f.Punkt0.x, f.Punkt0.y, f.Punkt0.z);
            var v2 = new THREE.Vector3(f.Punkt1.x, f.Punkt1.y, f.Punkt1.z);
            var v3 = new THREE.Vector3(f.Punkt2.x, f.Punkt2.y, f.Punkt2.z);
            geo.vertices.push(v1);
            geo.vertices.push(v2);
            geo.vertices.push(v3);
            var face = new THREE.Face3(0, 1, 2);
            geo.faces.push(face);
            //clone.traverse(setMaterial);           
            var clone = new THREE.Mesh(geo, high_mat);

            return clone;
        },

        _getQueryableObjects: function () {
            var _queryableObjects = [];
            if (this.layer.visible && this.layer.queryableObjects.length) {
                _queryableObjects = _queryableObjects.concat(this.layer.queryableObjects);
            }  
            return _queryableObjects;
        },
        _getQueryableObjects2 : function () {
           
            var _queryableObjects = [];
            this.layers.forEach(function (layer) {
                if (layer.visible && layer.queryableObjects.length) {
                    _queryableObjects = _queryableObjects.concat(layer.queryableObjects);
                }
            });
            
            return _queryableObjects;
        },

    };

    return DxfIdentify;

});