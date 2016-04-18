chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({file: "capture.js"}, (function (url_array) {}));
});
