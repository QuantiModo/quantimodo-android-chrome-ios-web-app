var fs = require("fs"),
    path = require("path"),
    exec = require("child_process").exec;

// Load taco.json
var taco = require("./taco.json");
var cordovaVersion = taco["cordova-cli"];

// Check if Cordova is already present in the cache, install it if not
var cordovaModulePath = path.resolve(process.env["CORDOVA_CACHE"], cordovaVersion);
if (!fs.existsSync(cordovaModulePath)) {
    fs.mkdirSync(cordovaModulePath);
    fs.mkdirSync(path.join(cordovaModulePath, "node_modules"));
    console.log("Installing Cordova " + cordovaVersion + ".");
    exec("npm install cordova@" + cordovaVersion, { cwd: cordovaModulePath }, function (err, stdout, stderr) {
        console.log(stdout);
        if (stderr) {
            console.error(stderr);
        }
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log("Cordova " + cordovaVersion + " installed at " + cordovaModulePath);
    });
} else {
    console.log("Cordova " + cordovaVersion + " already installed at " + cordovaModulePath);
}

// Create shell scripts
if (process.platform == "darwin") {
    // OSX
    fs.writeFileSync("cordova.sh", "#!/bin/sh\n" + path.join(cordovaModulePath, "node_modules", "cordova", "bin", "cordova") + " $@", "utf8");
    fs.chmodSync("cordova.sh", "0777")
} else {
    // Windows
    fs.writeFileSync("cordova.cmd", "@" + path.join(cordovaModulePath, "node_modules", "cordova", "bin", "cordova") + " %*", "utf8");
}
