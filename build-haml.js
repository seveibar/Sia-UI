var hamlc = require("haml-coffee");
var fs = require("fs");

process.chdir("./site");
var rawHaml = fs.readFileSync("markup/index.haml").toString();
var html = hamlc.render(rawHaml);

fs.writeFileSync("index.html", html);
