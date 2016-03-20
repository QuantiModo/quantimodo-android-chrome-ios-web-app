var onNavigationButtonClicked = function()
{
	var buttonId = this.id;
	if(buttonId == "appearanceButton")
	{
		// Set appearanceButton selected
		var button = document.getElementById("appearanceButton");
		button.className = button.className + " selected";
		
		// Remove selected from settingsButton
		button = document.getElementById("settingsButton");
		button.className = button.className.replace("selected", "");
		
		// Show appearanceContent
		var contents = document.getElementById("appearanceContent");
		contents.style.zIndex = 3;
		
		// Hide settingsContent
		contents = document.getElementById("settingsContent");
		contents.style.zIndex = 1;	
	}
	else if(buttonId == "settingsButton")
	{
		var button = document.getElementById("settingsButton");
		button.className = button.className + " selected";
		
		button = document.getElementById("appearanceButton");
		button.className = button.className.replace(" selected", "");
		
		var contents = document.getElementById("settingsContent");
		contents.style.zIndex = 3;
		
		contents = document.getElementById("appearanceContent");
		contents.style.zIndex = 1;	
	}
}

document.addEventListener('DOMContentLoaded', function () 
{
	document.getElementById('appearanceButton').onclick=onNavigationButtonClicked;
	document.getElementById('settingsButton').onclick=onNavigationButtonClicked;
});