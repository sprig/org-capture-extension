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

function storeIt() {
    var url = encodeURIComponent(location.href);
    var title = escapeIt(document.title);

    chrome.storage.sync.get({
        selectedTemplate: 'nql',
        unselectedTemplate: 'b',
        useOldStyleLinks: false
    }, function(items) {
        var uri = createStoreURL(title, url, items.useOldStyleLinks);
        console.log(uri);
        location.href = uri;
    });
}

storeIt();
