var appsManager = {
	apps : {
		"moodimodo" : "configs/moodimodo",
		"energymodo" : "configs/energymodo",
		"mindfirst" : "configs/mindfirst",
		"medtlc" : "configs/medtlc",
		"quantimodo" : "configs/quantimodo"
	},
	defaultApp : "medtlc",
	getAppConfig : function(app){
		if(appsManager.apps[app]){
			return 'configs/' + app + '.js';
		} else {
			console.debug("getAppConfig returning appsManager.getDefaultConfig()");
			return 'configs/' + appsManager.defaultApp + '.js';
		}
	},
	getPrivateConfig : function(app){
		if(appsManager.apps[app]){
			return './private_configs/'+ app + '.config.js';
		} else {
			console.debug("getPrivateConfig returning appsManager.getDefaultPrivateConfig()");
			return './private_configs/'+ appsManager.defaultApp + '.config.js';
		}
	}
};