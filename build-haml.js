var hamlc = require("haml-coffee");
var fs = require("fs");
var cp = require("child_process");

var packageInfo = JSON.parse(fs.readFileSync("package.json").toString());

process.chdir("./site");
var rawHaml = fs.readFileSync("markup/index.haml").toString();
var buildNumber = "Failure get build number with 'git rev-list HEAD --count' during build";
cp.exec("git rev-list HEAD --count", function(err,gitOutput,stderr){
    if (gitOutput){
        buildNumber = gitOutput;
    }

    var html = hamlc.render(rawHaml,{
        "version": packageInfo.version + " b" + buildNumber
    });
    fs.writeFileSync("index.html", html);

});
