module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		haml: {                                   // Task
      		dist: {                                 // Target
        	files: {                              // Dictionary of files
          		'index.html': 'index.haml',         // 'destination': 'source'
        	}
      	},


	});

	grunt.loadNpmTasks('grunt-haml2html');
	grunt.registerTask('default', ['haml']);

}