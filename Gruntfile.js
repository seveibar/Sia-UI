var path = require("path");
module.exports = function(grunt){

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'download-atom-shell': {
            version: '0.20.3',
            outputDir: 'atom-shell'
        },

        execute: {
            target: {
                src: ['build-haml.js']
            }
        },

        less: {
          development: {
            files: {
              "site/stylesheets/style.css": "site/stylesheets/main.less" // destination file and source file
            }
          }
        },

        shell: {
            target: {
                command: path.join('atom-shell','atom') + ' .'
            }
        }

    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-download-atom-shell');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['build', 'download-atom-shell']);
    grunt.registerTask('build', ['execute', 'less']);
    grunt.registerTask('test', ['build']);
    grunt.registerTask('run', ['default', 'shell']);

};
