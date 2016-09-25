var appsManager = { // jshint ignore:line
	apps : {
		"moodimodo" : "configs/moodimodo",
		"energymodo" : "configs/energymodo",
		"mindfirst" : "configs/mindfirst",
		"medtlc" : "configs/medtlc",
		"quantimodo" : "configs/quantimodo",
		"supercell" : "configs/supercell"

	},
	defaultApp : "supercell",
	getDefaultConfig : function(){
		if(appsManager.apps[appsManager.defaultApp]){
			console.log("getDefaultPrivateConfig returning " + appsManager.apps[appsManager.defaultApp]+'.js');
			return appsManager.apps[appsManager.defaultApp]+'.js';
		} else {
			console.log("ERROR: getDefaultConfig appsManager.apps[appsManager.defaultApp] does not exist");
			return false;
		}
	},
	getDefaultApp : function(){
		console.log("getDefaultApp is returning " + appsManager.defaultApp);
		return appsManager.defaultApp;
	},
	getDefaultPrivateConfig : function(){
		if(appsManager.apps[appsManager.defaultApp]){
			console.log("getDefaultPrivateConfig returning " +
				'./private_'+appsManager.apps[appsManager.defaultApp]+ '.config.js');
			return './private_'+appsManager.apps[appsManager.defaultApp]+ '.config.js';
		} else {
			console.log("ERROR: getDefaultPrivateConfig appsManager.apps[appsManager.defaultApp] does not exist");
			return false;
		}
	},
	getAppConfig : function(app){
		if(appsManager.apps[app]){
			console.log("getAppConfig returning " +
				appsManager.apps[app]+'.js');
			return appsManager.apps[app]+'.js';
		} else {
			console.log("getAppConfig returning appsManager.getDefaultConfig()");
			return appsManager.getDefaultConfig();
		}
	},
	getPrivateConfig : function(app){
		if(appsManager.apps[app]){
			console.log("getPrivateConfig returning " +
				'./private_'+appsManager.apps[app]+'.config.js');
			return './private_'+appsManager.apps[app]+'.config.js';
		} else {
			console.log("getPrivateConfig returning appsManager.getDefaultPrivateConfig()");
			return appsManager.getDefaultPrivateConfig();
		}
	}
};