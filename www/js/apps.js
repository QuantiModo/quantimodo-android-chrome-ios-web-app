var appsManager = {
	apps : {
		"moodimodo" : "configs/moodimodo.js",
		"energymodo" : "configs/energymodo.js",
		"mindfirst" : "configs/mindfirst.js"
	},
	defaultApp : "moodimodo",
	getDefaultConfig : function(){
		return appsManager.apps[appsManager.defaultApp] ? appsManager.apps[appsManager.defaultApp] : false;
	},
	getAppConfig : function(app){
		return appsManager.apps[app] ? appsManager.apps[app] : appsManager.getDefaultConfig();
	}
};