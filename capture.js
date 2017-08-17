function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
                                   "[)]", escape(")")),
                       "[']" ,escape("'"));
}

function createCaptureURL(template, title, url, selection, oldStyle) {
    if (oldStyle)
        return "org-protocol://capture:/"+template+'/'+url+'/'+title + ((selection === '') ? '' : ('/' + selection));
    else
        return "org-protocol://capture?template="+template+'&url='+url+'&title='+title+((selection === '') ? '' : ('&body=' + selection));
}

function captureIt() {
    var selection = escapeIt(window.getSelection().toString());
    var url = encodeURIComponent(location.href);
    var title = escapeIt(document.title);

    chrome.storage.sync.get(
        {
            selectedTemplate: 'p',
            unselectedTemplate: 'L',
            useOldStyleLinks: true,
            debug: false
        },
        function(options) {
            var uri = '';

            if (selection)
                uri = createCaptureURL(options.selectedTemplate, title, url, selection, options.useOldStyleLinks);
            else
                uri = createCaptureURL(options.unselectedTemplate, title, url, selection, options.useOldStyleLinks);

            if (options.debug)
                console.log("Capturing the following URI with org-protocol:", uri);

            location.href = uri;
        });
}

captureIt();
