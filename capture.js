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

  function toggleOverlay() {
    var outer_id = "org-capture-extension-overlay";
    var inner_id = "org-capture-extension-text";
    if (! document.getElementById(outer_id)) {
      var outer_div = document.createElement("div");
      outer_div.id = outer_id;

      var inner_div = document.createElement("div");
      inner_div.id = inner_id;
      inner_div.innerHTML = "Captured";

      outer_div.appendChild(inner_div);
      document.body.appendChild(outer_div);

      var css = document.createElement("style");
      css.type = "text/css";
      css.innerHTML = `#org-capture-extension-overlay {
        position: fixed; /* Sit on top of the page content */
        display: none; /* Hidden by default */
        width: 100%; /* Full width (cover the whole page) */
        height: 100%; /* Full height (cover the whole page) */
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.2); /* Black background with opacity */
        z-index: 1; /* Specify a stack order in case you're using a different order for other elements */
        cursor: pointer; /* Add a pointer on hover */
    }

    #org-capture-extension-text{
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 50px;
    color: white;
    transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
}`;
        document.body.appendChild(css);
    }

    function on() {
      document.getElementById(outer_id).style.display = "block";
    }

    function off() {
      document.getElementById(outer_id).style.display = "none";
    }

    on();
    setTimeout(off, 200);

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

      if (options.overlay)
        toggleOverlay();
    };

    chrome.storage.sync.get(
      {
        selectedTemplate: 'p',
        unselectedTemplate: 'L',
        useNewStyleLinks: false,
        debug: false,
        overlay: true
      },
      capture);

    return uri;
  }
  captureIt();
})();
