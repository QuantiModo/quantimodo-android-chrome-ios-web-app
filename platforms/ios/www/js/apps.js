var appsManager = {
	apps : {
		"moodimodo" : "configs/moodimodo",
		"energymodo" : "configs/energymodo",
		"mindfirst" : "configs/mindfirst"
	},
	defaultApp : "moodimodo",
	getDefaultConfig : function(){
		return appsManager.apps[appsManager.defaultApp] ? appsManager.apps[appsManager.defaultApp]+'.js' : false;
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