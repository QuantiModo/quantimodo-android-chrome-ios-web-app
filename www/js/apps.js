var appsManager = { // jshint ignore:line
	apps : {
		"moodimodo" : "configs/moodimodo",
		"energymodo" : "configs/energymodo",
		"mindfirst" : "configs/mindfirst",
		"medtlc" : "configs/medtlc",
		"quantimodo" : "configs/quantimodo",
<<<<<<< HEAD
		"tobenamed":"configs/tobenamed"
	},
	defaultApp : "tobenamed",
=======
		"yourlowercaseappnamehere": "configs/yourlowercaseappnamehere"
	},
	defaultApp : "default",
>>>>>>> 6dd6498a1a5070db9eb9ccac3949e145555092d9
	getAppConfig : function(app){
		if(appsManager.apps[app]){
			return 'configs/' + app + '.js';
		} else {
			return 'configs/' + appsManager.defaultApp + '.js';
		}
	},
	getPrivateConfig : function(app){
		if(appsManager.apps[app]){
			return './private_configs/'+ app + '.config.js';
		} else {
			return './private_configs/'+ appsManager.defaultApp + '.config.js';
		}
	}
};