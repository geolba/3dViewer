/// <vs />
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({

        'string-replace': {
            dist: {
                src: './dist/calc.js',
                dest: './dist/calc.js',
                options: {
                    replacements: [{
                        pattern: '../bower_components/three.js/three.js',
                        replacement: 'threeLib.js'
                    }]
                }
            }
        },

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
                    cssIn: "content/app.css",
                    out: "content/app.min.css"
                }
            },
            compileLibStyles: {
                    options: {
                        //keepBuildDir: false,
                            optimizeCss: "default",
                            cssIn: "content/lib.css",
                            out: "content/lib.min.css"
                }
                        },
            compileScripts: {
                options: {
                    mainConfigFile: "scripts/buildconfig.js",
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
                        threeLib: '../bower_components/three.js/three',
                        require: '../bower_components/requirejs/require',
                        jquery: '../bower_components/jquery/dist/jquery',
                        //i18n: "i18n"
                    },
                    modules: [{
                       name: "main",
                       exclude: [
                           "jquery",                          
                           //"i18n",
                           "threeLib",
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
        
             
        'bowercopy': {
            options: {
                // Bower components folder will be removed afterwards
                clean: false
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

   

    //alaiases:
    //clean esri folder & download esri js files
    //grunt.registerTask('cleanUnnecessaryFiles', ['clean:uncompressed', 'clean:intellisense']);
    grunt.registerTask('build', ['clean:dist','bowercopy:css', 'requirejs:compileStyles', 'requirejs:compileLibStyles', 'requirejs:compileScripts', 'string-replace:dist']);

};