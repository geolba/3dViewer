/// <vs />
module.exports = function (grunt) {
    grunt.initConfig({

        clean: {
            // clean the output directory before each build
            dist: ['dist'],
          
            // remove pre/uncompressed files from dist
            uncompressed: ['dist/**/*.min.js'],
            // remove intellisense files from dist
            intellisense: ['dist/**/*.intellisense.js'],

            //// remove console stripped files from dist
            //stripped: ['dist/**/*.consoleStripped.js']
        },

        requirejs: {
            compileStyles: {
                options: {
                    //keepBuildDir: false,
                    optimizeCss: "default",
                    cssIn: "content/page.css",
                    out: "content/concat.min.css"
                }
            },
            compileScripts: {
                options: {
                    mainConfigFile: "scripts/config.js",
                    //appDir: "src",
                    // base path for the r.js compiler to use
                    baseUrl: "scripts",
                    dir: "dist",
                    optimize: "uglify2",
                    //cssIn: "content/page-layout.css",
                    //out: "content/concat.min.css",
                    optimizeCss: "default",
                    fileExclusionRegExp: /^(r|build)\.js$/,
                    removeCombined: true,
                    findNestedDependencies: false,
                    paths: {
                        // --- start THREE sub-components
                        three: 'app/three',
                        threeCore: 'lib/threejs/three',
                        //OrbitControls: 'lib/TrackballControls',                      
                        jquery: 'lib/jquery/jquery-2.1.4',                     
                        i18n: "i18n"
                    },
                    modules: [{
                       name: "main",
                       exclude: [
                           "jquery",                          
                           //"i18n",
                           "threeCore",
                           "lib/threejs/OrbitControls",
                           "lib/proj4js/proj4js-amd",
                           "lib/leaflet/Class",
                           "lib/leaflet/Control",
                           "lib/jrespond/jRespond"
                           //"nls/template"                          
                       ]
                    }]

                }
            }
        }

       


    });
 
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    //alaiases:
    //clean esri folder & download esri js files
    //grunt.registerTask('cleanUnnecessaryFiles', ['clean:uncompressed', 'clean:intellisense']);
    grunt.registerTask('buildDist', ['requirejs:compileStyles', 'requirejs:compileScripts', 'clean:uncompressed', 'clean:intellisense']);

};