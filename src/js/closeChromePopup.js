console.log("Opening website popup!!!");
var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
windowParams.url = "https://quantimodo.quantimo.do";
console.info("Opening " + windowParams.url);
chrome.windows.create(windowParams, function(chromeWindow){
    chrome.windows.update(chromeWindow.id, {focused: true});
});
window.setTimeout(function(){
    window.close();
}, 1000);

