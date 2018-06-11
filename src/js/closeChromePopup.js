qm.client.getClientWebsiteUrl(function (fullWebsiteUrl) {
    var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
    windowParams.url = fullWebsiteUrl;
    console.info("Opening "+fullWebsiteUrl);
    chrome.windows.create(windowParams, function (chromeWindow) {
        chrome.windows.update(chromeWindow.id, { focused: true });
    });
});
window.setTimeout(function () {
    window.close();
}, 1000);

