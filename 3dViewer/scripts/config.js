// Configure Require.js
require = {
    //baseUrl: 'scripts',
    paths: {
        // --- start THREE sub-components
       
            //app: 'app',
     
        three: 'app/three',
        //threeCore: 'lib/threejs/three',  
        threeCore: 'lib/bower/threejs/three',
        //OrbitControls: 'lib/TrackballControls',
        //helvetiker: 'lib/helvetiker_regular',
        jquery: 'lib/jquery/jquery-2.1.4',
        //toastr: 'toastr',
        i18n: "i18n"
        //proj4js: "proj4js-amd"
    },
    //debug: true,
    urlArgs: "version=1.11",
    shim: {
        'threeCore': { exports: 'THREE' },
        //'OrbitControls': { deps: ['threeCore'], exports: 'THREE' },       
        //toastr: { deps: ['jquery'], exports: 'toastr' }
    }
};