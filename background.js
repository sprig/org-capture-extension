chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({file: "capture.js"}, (function (url_array) {}));
});

chrome.commands.onCommand.addListener(function(command) {
    if(command === "do-capture") {
        chrome.tabs.executeScript({file: "capture.js"}, (function (url_array) {}));
    }
    else if(command === "do-store-link") {
        chrome.tabs.executeScript({file: "storeLink.js"}, (function (url_array) {}));
    }
    else if(command === "do-open-source") {
        chrome.tabs.executeScript({file: "openSource.js"}, (function (url_array) {}));
    }
});
