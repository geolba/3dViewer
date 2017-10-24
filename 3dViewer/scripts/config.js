// Configure Require.js
window.require = {
    //baseUrl: 'scripts',
    paths: {
        // --- start THREE sub-components
       
            //app: 'app',
     
        three: 'app/three',
        //threeCore: 'lib/threejs/three',  
        threeLib: '../bower_components/three.js/three',
        //OrbitControls: 'lib/TrackballControls',      
        //jquery: 'lib/jquery/jquery-2.1.4',
        jquery: '../bower_components/jquery/dist/jquery',
        //toastr: 'toastr',
        i18n: "i18n"
        //proj4js: "proj4js-amd"
    },
    //debug: true,
    urlArgs: "version=1.15",
    shim: {
        'threeLib': { exports: 'THREE' },
        //'OrbitControls': { deps: ['threeCore'], exports: 'THREE' },       
        //toastr: { deps: ['jquery'], exports: 'toastr' }
    }
};