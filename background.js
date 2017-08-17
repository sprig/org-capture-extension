chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install")
        chrome.storage.sync.set(
            {
                selectedTemplate: 'L',
                unselectedTemplate: 'p',
                useNewStyleLinks: true,
		debug: false
            });
    else if ((details.reason == "update" && details.previousVersion.startsWith("0.1")))
        chrome.storage.sync.set(
            {
                selectedTemplate: 'L',
                unselectedTemplate: 'p',
                useNewStyleLinks: false,
		debug: false
            });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({file: "capture.js"}, (function (url_array) {}));
});
