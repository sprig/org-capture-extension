function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
                                   "[)]", escape(")")),
                       "[']" ,escape("'"));
}

function createStoreURL(title, url, oldStyle) {
    if (oldStyle == true)
        return "org-protocol://store-link:/"+url+"/"+title;
    else
        return "org-protocol://store-link?url="+url+'&title='+title;
}

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
