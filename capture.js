(function () {

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
      return "org-protocol://capture?template="+template+'&url='+url+'&title='+title+'&body='+selection;
    else
      return "org-protocol://capture:/"+template+'/'+url+'/'+title+'/'+selection;
  }

  function logURI(uri) {
    window.console.log("Capturing the following URI with new org-protocol: ", uri);
    return uri;
  }

  function captureIt(tab) {
    var selection = escapeIt(window.getSelection().toString());
    var url = encodeURIComponent(location.href);
    var title = escapeIt(document.title);
    var uri;

    var capture = function(options) {
      if (chrome.runtime.lastError) {
        alert("Could not capture url. Error loading options: " + chrome.runtime.lastError.message);
      }

      uri = createCaptureURL(selection?options.selectedTemplate:options.unselectedTemplate, title, url, selection, options.useNewStyleLinks);

      if (options.debug)
	logURI(uri);

      location.href = uri;
    }
    chrome.storage.sync.get(
      {
        selectedTemplate: 'p',
        unselectedTemplate: 'L',
        useNewStyleLinks: false,
        debug: false
      },
      capture);

    return uri;
  }
  captureIt();
})();
