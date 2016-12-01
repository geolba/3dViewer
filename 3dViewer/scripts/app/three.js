// As THREE.js comes with many addons/plugins mix them all into one three object here
//define(["threeCore", "OrbitControls"], function (threeCore) {
define(["threeCore"], function (THREE) {

    function intersectObject(object, raycaster, intersects, recursive) {

        if (object.visible === false) return;

        object.raycast(raycaster, intersects);

        if (recursive === true) {

            var children = object.children;

            for (var i = 0, l = children.length; i < l; i++) {

                intersectObject(children[i], raycaster, intersects, true);

            }

        }

    }

    //Methoden überschreiben: 
    THREE.Raycaster.prototype.identifyObjects = function (objects, recursive) {

        var intersects = [];

        if (Array.isArray(objects) === false) {
            console.warn('THREE.Raycaster.intersectObjects: objects is not an Array.');
            return intersects;
        }
        for (var i = 0, l = objects.length; i < l; i++) {
            intersectObject(objects[i], this, intersects, recursive);
            if (intersects.length > 0) break;
        }
        //intersects.sort( ascSort );
        return intersects;
    };

    THREE.PerspectiveCamera.prototype.toLeftView = function () {

        this.rotation.x = 0;
        this.rotation.y = -Math.PI / 2;
        this.rotation.z = 0;

    };



    return THREE;
});