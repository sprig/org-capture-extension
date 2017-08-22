(function () {


  class Capture {

    constructor() {
      this.window = window;
      this.document = document;
      this.location = location;

      this.selection_text = escapeIt(window.getSelection().toString());
      this.encoded_url = encodeURIComponent(location.href);
      this.escaped_title = escapeIt(document.title);

    }

    createCaptureURI() {
      var $ = this;
      eval(this.createURI);
    }

    capture() {
      this.createCaptureURI();

      if (this.debug) {
        logURI(this.uri);
      }

      location.href = this.uri;

      if (this.overlay) {
        toggleOverlay();
      }
    }

    captureIt(options) {
      if (chrome.runtime.lastError) {
        alert("Could not capture url. Error loading options: " + chrome.runtime.lastError.message);
        return;
      }

      for (var k in options) {
        this[k] = options[k];
      }

      if (this.selection_text) {
        this.template = this.selectedTemplate;
        this.protocol = this.selectedProtocol;
      } else {
        this.template = this.unselectedTemplate;
        this.protocol = this.unselectedProtocol;
      }

      this.protocol = "capture";

      this.capture();
    }
  }


  function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
                                   "[)]", escape(")")),
                       "[']" ,escape("'"));
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
      // noinspection JSAnnotator
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


  var capture = new Capture();
  var f = function (options) {capture.captureIt(options)};
  chrome.storage.sync.get(null, f);
})();
