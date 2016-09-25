var appsManager = {
	apps : {
		"moodimodo" : "configs/moodimodo",
		"energymodo" : "configs/energymodo",
		"mindfirst" : "configs/mindfirst",
		"medtlc" : "configs/medtlc",
		"quantimodo" : "configs/quantimodo",
		"supercell" : "configs/supercell",
	},

	defaultApp : "moodimodo",
	getDefaultConfig : function(){
		return appsManager.apps[appsManager.defaultApp] ? appsManager.apps[appsManager.defaultApp]+'.js' : false;
	},
	getDefaultApp : function(){
		return appsManager.defaultApp;
	},
	getDefaultPrivateConfig : function(){
		return appsManager.apps[appsManager.defaultApp] ? './private_'+appsManager.apps[appsManager.defaultApp]+'.config.js' : false;
	},
	getAppConfig : function(app){
		return appsManager.apps[app] ? appsManager.apps[app]+'.js' : appsManager.getDefaultConfig();
	},
	getPrivateConfig : function(app){
		return appsManager.apps[app] ? './private_'+appsManager.apps[app]+'.config.js' : appsManager.getDefaultPrivateConfig();
	}
};