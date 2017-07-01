function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
                                   "[)]", escape(")")),
                       "[']" ,escape("'"));
}

function createOpenSourceURL(url, oldStyle) {
    if (oldStyle == true)
        return "org-protocol://open-source:/"+url;
    else
        return "org-protocol://capture?&url="+url;
}

function openIt() {
    var selection = window.getSelection().toString();
    var url = encodeURIComponent(location.href);
    var title = escapeIt(document.title);

    chrome.storage.sync.get({
        selectedTemplate: 'nql',
        unselectedTemplate: 'b',
        useOldStyleLinks: false
    }, function(items) {
        var uri = createOpenSourceURL(url, items.useOldStyleLinks);
        location.href = uri;
    });
}

open_It();
