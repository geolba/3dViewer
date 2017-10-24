// Configure Require.js
window.require = {   
    paths: {
        // --- start THREE sub-components
        three: 'app/three',      
        threeLib: 'threeLib',     
        jquery: 'jquery',     
        i18n: "i18n"     
    },
    debug: false,
    urlArgs: "version=1.15",
    shim: {
        'threeLib': { exports: 'THREE' }
    }
};