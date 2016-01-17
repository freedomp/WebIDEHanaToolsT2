module.exports = function (grunt) {
	"use strict";

	grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			sass: {
				dist: {
					options: {
						update : true,
						outputStyle: 'expanded',
						sourceMap: true
					},
					files: [{
						expand : true,
						src: [
							'styles/*.scss'
						],
						ext: '.css'
					}]
				}
			},
			watch: {
				css: {
					files: 'styles/*.scss',
					tasks: ['sass']
				}
			}
		}
	);

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('watch-sass',['watch']);
	grunt.registerTask('sass-compile',['sass']);

};
