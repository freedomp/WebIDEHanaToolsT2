module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //cleanup imported source
        clean: ['resources/rndrt', 'resources/commonddl', 'resources/hanaddl', 'hdbdd-to-hdbcds*.tgz'],

        //jshint on our sources
        jshint: {
            src: [ '*.js', '!nodesPoc.js', '!Gruntfile.js'],
            options: {
                globals: {
                    node: true
                }
            }
        },

        //copy rnd in our package
        copy: {
            rndrt: {
                files: [
                    {expand: true, flaten: true, cwd: '../../../../../resources/lib/rndrt/', src: ['rnd.js'], dest: 'resources/rndrt/', filter: 'isFile'}
                ]
            },
            commonddl: {
                files: [
                    {expand: true, flaten: true, cwd: '../../../../../resources/editor/plugin/hdbdd/commonddl/',
                        src: ['*.js',
                            '*/*',
                            '!commonddlUi.js',
                            '!_optimize_local_config.js',
                            '!ace/*'],
                        dest: 'resources/commonddl/', filter: 'isFile'}
                ]
            },
            hanaddl: {
                files: [
                    {expand: true, flaten: true, cwd: '../../../../../resources/editor/plugin/hdbdd/hanaddl/',
                        src: ['**/*.js',
                             'hanav5/*.pad', 'hanav5/annotations.txt',
                            '!ace/*.js',
                            '!hanav1/*.js',
                            '!hanav2/*.js',
                            '!hanav3/*.js',
                            '!hanav4/*.js',
                            '!hanaddlUi.js'],
                        dest: 'resources/hanaddl/', filter: 'isFile'}
                ]
            }

        },

//        //FFS:  minimize  commonddl in our package
//        uglify: {
//            options:{
//                mangle:false,
//                compress:false,
//                beautify:true,
//                preserveComments:'all'
//            },
//            commonddl: {
//                files: {
//                    'resources/commonddl/commonddlNonUi.js': ['../../webapp/resources/editor/plugin/hdbdd/commonddl/**/*js',
//                        '!../../webapp/resources/editor/plugin/hdbdd/commonddl/commonddlUi.js',
//                        '!../../webapp/resources/editor/plugin/hdbdd/commonddl/_optimize_local_config.js',
//                        '!../../webapp/resources/editor/plugin/hdbdd/commonddl/ace/*.js']
//                }
//            }
//        }

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    //quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        }
    });


    grunt.registerTask('package', 'call npm pack to build a package.', function() {

        // Fail task if "build" task failed or never ran.
        //grunt.task.requires('build');


        var done = this.async()
        var npm = require("npm");
        npm.load(function (err) {

            // call "npm pack" without arguments to pack the current directory
            npm.commands.pack( function (er, data) {

                // log the error or data
                if (er) {
                    grunt.log.error('Pack failed.');
                    grunt.log.writeln(data);
                    return done(false);
                }
                done(true);
            });
            npm.on("log", function (message) {
                // log the progress of the installation
                grunt.log.writeln(message);
            });
        });
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');


    grunt.registerTask('default', ['mochaTest']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('build', ['jshint', 'clean', 'copy', 'mochaTest']);
    grunt.registerTask('dist', ['build', 'package']);
};