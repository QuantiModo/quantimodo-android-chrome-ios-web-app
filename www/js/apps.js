var appsManager = { // jshint ignore:line
	apps : {
		"moodimodo" : "configs/moodimodo",
		"energymodo" : "configs/energymodo",
		"mindfirst" : "configs/mindfirst",
		"medtlc" : "configs/medtlc",
		"quantimodo" : "configs/quantimodo",
		"tobenamed":"configs/tobenamed"
	},
	defaultApp : "tobenamed",
		
	
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