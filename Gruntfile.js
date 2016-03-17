module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {cwd: 'static/img', src: '**/*', dest: 'build/img', expand: true},
                    {cwd: 'static/css/fonts', src: '**/*', dest: 'build/fonts', expand: true}
                ]
            }
        },
        // concatinate the js files
        concat: {
            js: {
                src: [
                    "static/bower_components/jquery/jquery.min.js",
                    "static/bower_components/bootstrap/js/alert.js",
                    "static/bower_components/bootstrap/js/dropdown.js",
                    "static/bower_components/underscore/underscore.js",
                    "static/bower_components/backbone/backbone.js",
                    "static/js/release.js",
                    "static/js/song.js",
                    "static/js/search.js",
                    "static/js/disconest.js"
                    ],
                dest: 'build/main.js'
            },
            css:{
                src: [
                    "static/bower_components/bootstrap/dist/css/bootstrap.css",
                    "static/css/style.css"
                ],
                dest: "build/style.css"
            }
        },
        // compress and uglify js files:
        uglify: {
            my_target: {
                files: {
                    'build/main.min.js': ['build/main.js']
                }
            }
        },
        // process the html file, change from individual js files to the concated and minified one 
        processhtml:{
            dist: {
                files: {
                    'build/index.html': ['static/index.html']
                }
            }
        },
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-processhtml');

    // Default task(s).
    grunt.registerTask('default', ['copy', 'concat', 'uglify', 'processhtml']);
    grunt.registerTask('build', ['copy', 'concat', 'uglify', 'processhtml']);
};