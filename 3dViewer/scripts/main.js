﻿// Start the app
//require(['app/Project', 'app/DemLayer', 'helper/utilities', 'app/appmodule', 'jquery'], function (Project, DemLayer, util, app, $) {
define('main', ['app/Dataservice', 'helper/utilities', 'app/appmodule', 'jquery'], function (Dataservice, util, app, $) {


    $(document).ready(function () {

        var dataservice = new Dataservice({
            //crs: "EPSG:31256", wgs84Center: { lat: 48.1785955328, lon: 16.3277853077 },
            //proj: "+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
            //title: "Geologisches 3D Modell von Wien", baseExtent: [-983.764042601, 337378.432725, 336.578758745, 338215.286526],
            //rotation: 0, zShift: 0.0, width: 100.0, zExaggeration: 1.5
        });
         //Base64 encoded images
        //project.images[0] = {
        //    "width": 930,
        //    "height": 1386
        //};
       
        util.setLoading("webgl");
        dataservice.init2()
          .then(boot)
          .fail(failedInitialization);

        function boot() {
            if (webglAvailable() === true) {
                var container = document.getElementById("webgl");
                app.init(container, dataservice);
                app.loadData(dataservice);
                util.unsetLoading("webgl");               
                app.start();
                //logger.success("3D viewer successfully loaded!", true);
            }
            else {
                util.unsetLoading("webgl");
                //logger.error('Der Browser unterstützt kein WebGL!', true);
            }
        }
        function failedInitialization(error) {
            util.unsetLoading("webgl");
            //logger.error('App initialization failed: ' + error.statusText, true);
        }

    });

    var webglAvailable = function () {
        try {
            var canvas = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    };


});