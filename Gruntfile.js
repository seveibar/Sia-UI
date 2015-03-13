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
        }

    });

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-download-atom-shell');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['build', 'download-atom-shell']);
    grunt.registerTask('build', ['execute', 'less']);
    grunt.registerTask('test', ['build']);
    grunt.registerTask('run', "Running Sia UI with atom shell...", function(){
        grunt.task.run("default");
        var cp = require("child_process");
        if (process.platform == "darwin"){
            cp.execSync("./atom-shell/Atom.app/Contents/MacOS/Atom .", function(err,stdout,stderr){
                console.error(err,stderr);
                console.log(stdout);
           });
        }else{
            cp.execSync(path.join("atom-shell","atom") + " .", function(err,stdout,stderr){
                console.error(err,stderr);
                console.log(stdout);
            });
        }
    });

};
