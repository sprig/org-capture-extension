///////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2015-2017 Konstantin Kliakhandler				 //
// 										 //
// Permission is hereby granted, free of charge, to any person obtaining a copy	 //
// of this software and associated documentation files (the "Software"), to deal //
// in the Software without restriction, including without limitation the rights	 //
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell	 //
// copies of the Software, and to permit persons to whom the Software is	 //
// furnished to do so, subject to the following conditions:			 //
// 										 //
// The above copyright notice and this permission notice shall be included in	 //
// all copies or substantial portions of the Software.				 //
// 										 //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR	 //
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,	 //
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE	 //
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER	 //
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, //
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN	 //
// THE SOFTWARE.								 //
///////////////////////////////////////////////////////////////////////////////////


(function () {


  class Capture {

   createCaptureURI(note="") {
     var protocol = "capture";

     if (this.selection_text != "") {
       note = this.selection_text;
     }

     var template = (note != "" ? this.selectedTemplate : this.unselectedTemplate);
     if (this.useNewStyleLinks)
       return "org-protocol://"+protocol+"?template="+template+'&url='+this.encoded_url+'&title='+this.escaped_title+'&body='+note;
     else
       return "org-protocol://"+protocol+":/"+template+'/'+this.encoded_url+'/'+this.escaped_title+'/'+note;
    }

    constructor(with_note) {
      this.window = window;
      this.document = document;
      this.location = location;

      this.selection_text = escapeIt(window.getSelection().toString());
      this.encoded_url = encodeURIComponent(location.href);
      this.escaped_title = escapeIt(document.title);
      this.with_note = with_note;
    }

    triggerCapture(uri) {
      if (this.debug) {
        logURI(uri);
      }
      location.href = uri;
    }

    capture() {
      if (this.with_note) {
          // we have to show overlay in this case
          const that = this;
          toggleOverlay(function(note_text) {
              const uri = that.createCaptureURI(note_text);
              that.triggerCapture(uri);
          });
      } else {
          if (this.overlay) {
              toggleOverlay();
          }
          this.triggerCapture(this.createCaptureURI());
      }
    }

    captureIt(options) {
      if (chrome.runtime.lastError) {
        alert("Could not capture url. Error loading options: " + chrome.runtime.lastError.message);
        return;
      }

      if (this.selection_text) {
        this.template = this.selectedTemplate;
        this.protocol = this.selectedProtocol;
      } else {
        this.template = this.unselectedTemplate;
        this.protocol = this.unselectedProtocol;
      }

      for(var k in options) this[k] = options[k];
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

  function toggleOverlay(callback=null) {
    var outer_id  = "org-capture-extension-overlay";
    var inner_id  = "org-capture-extension-text";
    var note_id   = "org-capture-extension-note";
    var button_id = "org-capture-extension-button";
    const prev = document.getElementById(outer_id);
    if (prev) {
        prev.parentNode.removeChild(prev); // to refresh in between 'normal capture' and 'capture with note'
    }

      var outer_div = document.createElement("div");
      outer_div.id = outer_id;

      var inner_div = document.createElement("div");
      inner_div.id = inner_id;
      inner_div.innerHTML = "Captured";

      if (callback !== null) { // capturing with note
          inner_div.innerHTML = `
<div><textarea id="${note_id}" rows="4" cols="50" placeholder="enter your note..."></textarea></div>
<div><button id="${button_id}" type="button">capture!</button></div>
`;
      }

      outer_div.appendChild(inner_div);

      document.body.appendChild(outer_div);

      if (callback !== null) {
        const outer = document.getElementById(outer_id);
        // cancel popup on clicking anywhere else or on escape press
        outer.addEventListener('click', function (e) {
          if (e.target !== this) {
            return;
          };
          off();
        });
        outer.addEventListener('keydown', function (e) {
          if (e.key == 'Escape') {
            off();
          }
        });

        const submit_note = function () {
          const note_text = document.getElementById(note_id).value;
          callback(note_text);
          off();
        };
        document.getElementById(button_id).addEventListener('click', submit_note);

        const note = document.getElementById(note_id);
        note.addEventListener('keydown', function (e) {
	        if (e.ctrlKey && e.key === 'Enter') {
		        submit_note();
	        }
        });
        note.focus();
      }


      var css = document.createElement("style");
      css.type = "text/css";
      // noinspection JSAnnotator
      css.innerHTML = `#${outer_id} {
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

    #${inner_id}{
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 50px;
    color: white;
    transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
}`;
    document.body.appendChild(css);

    function on() {
      document.getElementById(outer_id).style.display = "block";
    }

    function off() {
      document.getElementById(outer_id).style.display = "none";
    }

    on();
    if (callback === null) {
        setTimeout(off, 200);
    } // otherwise we're waiting for user action to hide overlay

  }

    // capture_with_note is passed in background.js
  var capture = new Capture(capture_with_note);
  var f = function (options) {capture.captureIt(options)};
  chrome.storage.sync.get(null, f);
})();
