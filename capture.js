function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
                                   "[)]", escape(")")),
                       "[']" ,escape("'"));
}

function createCaptureURL(template, title, url, selection, oldStyle) {
    if (oldStyle == true)
        return "org-protocol://capture:/"+template+'/'+url+'/'+title + ((selection === '') ? '' : ('/' + selection));
    else
        return "org-protocol://capture?template="+template+'&url='+url+'&title='+title+((selection === '') ? '' : ('&body=' + selection));
}

function captureIt() {
    var selection = window.getSelection().toString();
    var url = encodeURIComponent(location.href);
    var title = escapeIt(document.title);

    chrome.storage.sync.get({
        selectedTemplate: 'nql',
        unselectedTemplate: 'b',
        useOldStyleLinks: false
    }, function(items) {
        var uri = '';
        if (selection != '')
            uri = createCaptureURL(items.selectedTemplate, title, url, selection, items.useOldStyleLinks);
        else
            uri = createCaptureURL(items.unselectedTemplate, title, url, selection, items.useOldStyleLinks);
        location.href = uri;
    });
}

captureIt();
