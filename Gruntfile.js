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
    grunt.registerTask("run", ["default","start-ui"]);
    grunt.registerTask('start-ui', "Running Sia UI with atom shell...", function(){
        var atom_path;
        var done = this.async();
        var cp = require("child_process");
        if (process.platform == "darwin"){
            atom_path = path.join("atom-shell","Atom.app","Contents","MacOS","Atom");
        }else{
            atom_path = path.join("atom-shell","atom");
        }
        var atomProcess = cp.spawn(atom_path, ["."]);
        atomProcess.stdout.on("data", function(output){
            console.log(output.toString());
        });
        atomProcess.stderr.on("data", function(output){
            console.log(output.toString());
        });
        atomProcess.on("error", function(output){
            console.log(output.toString());
        });
        atomProcess.on("close", function(){
            done(true);
        })
    });

};
