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
        },
        
        bower: {
            install: {
                options: {
                    //Whether you want to run bower install task itself 
                    install: true,
                    targetDir: 'content/components',
                    //Will clean target dir before running install.
                    cleanTargetDir: true,
                    layout: 'byComponent'
                    //layout: function (type, component, source) {
                    //    return type;
                    //}
                }
            }
        },
        
        bowercopy: {

            options: {
                // Bower components folder will be removed afterwards
                clean: false
            },
            js: {
                options: {
                    destPrefix: 'scripts/lib/bower'
                },
                files: {
                    'threejs/three.js': 'three.js/build/three.js'
                }

            },
            css: {
                options: {
                    destPrefix: 'content/components'
                },
                files: {
                   
                    'font-awesome/css/font-awesome.css': 'font-awesome/css/font-awesome.css',
                    'font-awesome/fonts/fontawesome-webfont.eot': 'font-awesome/fonts/fontawesome-webfont.eot',
                    'font-awesome/fonts/fontawesome-webfont.svg': 'font-awesome/fonts/fontawesome-webfont.svg',
                    'font-awesome/fonts/fontawesome-webfont.ttf': 'font-awesome/fonts/fontawesome-webfont.ttf',
                    'font-awesome/fonts/fontawesome-webfont.woff': 'font-awesome/fonts/fontawesome-webfont.woff',
                    'font-awesome/fonts/fontawesome-webfont.woff2': 'font-awesome/fonts/fontawesome-webfont.woff2',
                    'font-awesome/fonts/FontAwesome.otf': 'font-awesome/fonts/FontAwesome.otf',

                    'pure/css/grids-responsive.css': 'pure/grids-responsive.css',
                    'pure/css/pure.css': 'pure/pure.css',
                    'pure/css/LICENSE.md': 'pure/LICENSE.md'
                }

            }
        }

       


    });

    grunt.loadNpmTasks('grunt-bowercopy');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-bower-task');
 
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    //alaiases:
    //clean esri folder & download esri js files
    //grunt.registerTask('cleanUnnecessaryFiles', ['clean:uncompressed', 'clean:intellisense']);
    grunt.registerTask('buildDist', ['requirejs:compileStyles', 'requirejs:compileScripts', 'clean:uncompressed', 'clean:intellisense']);

};