function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
                                   "[)]", escape(")")),
                       "[']" ,escape("'"));
}

function createCaptureURL(template, title, url, selection, NewStyle) {
    if (NewStyle)
        return "org-protocol://capture?template="+template+'&url='+url+'&title='+title+((selection === '') ? '' : ('&body=' + selection));
    else
        return "org-protocol://capture:/"+template+'/'+url+'/'+title + ((selection === '') ? '' : ('/' + selection));
}

function captureIt() {
    var selection = escapeIt(window.getSelection().toString());
    var url = encodeURIComponent(location.href);
    var title = escapeIt(document.title);

    chrome.storage.sync.get(
        {
            selectedTemplate: 'p',
            unselectedTemplate: 'L',
            useNewStyleLinks: false,
            debug: false
        },
        function(options) {
            var uri = '';

            if (selection)
                uri = createCaptureURL(options.selectedTemplate, title, url, selection, options.useNewStyleLinks);
            else
                uri = createCaptureURL(options.unselectedTemplate, title, url, selection, options.useNewStyleLinks);

            if (options.debug)
                console.log("Capturing the following URI with org-protocol:", uri);

            location.href = uri;
        });
}

captureIt();
