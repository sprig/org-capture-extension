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

   createCaptureURI() {
     var protocol = "capture";
     var template = (this.selection_text != "" ? this.selectedTemplate : this.unselectedTemplate);
     if (this.useNewStyleLinks)
       return "org-protocol://"+protocol+"?template="+template+'&url='+this.encoded_url+'&title='+this.escaped_title+'&body='+this.selection_text;
     else
       return "org-protocol://"+protocol+":/"+template+'/'+this.encoded_url+'/'+this.escaped_title+'/'+this.selection_text;
    }

    constructor() {
      this.window = window;
      this.document = document;
      this.location = location;

      this.selection_text = escapeIt(window.getSelection().toString());
      this.encoded_url = encodeURIComponent(location.href);
      this.escaped_title = escapeIt(document.title);

    }

    capture() {
      var uri = this.createCaptureURI();

      if (this.debug) {
        logURI(uri);
      }

      location.href = uri;

      if (this.overlay) {
        toggleOverlay();
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

      for (var k in options) this[k] = options[k];

      if (this.convert2org) {
        this.selection_text = escapeIt(conv2org(window.getSelection()));
      }

      this.capture();
    }
  }


  function replace_all(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  function escapeIt(text) {
    return replace_all(replace_all(replace_all(encodeURIComponent(text), "[(]", escape("(")),
      "[)]", escape(")")),
      "[']", escape("'"));
  }

  function conv2org(sel) {
    if (!sel) return "";
    var dom = document.createElement('div');
    for (var i = 0; i < sel.rangeCount; i++) {
      dom.appendChild(sel.getRangeAt(i).cloneContents());
    }

    dom.querySelectorAll('img').forEach(it => {
      var url = new URL(it.src, window.location.href).href;
      it.innerText = `[[${url}]]`;
    });

    dom.querySelectorAll('a').forEach(it => {
      if (/\[\[/.test(it.innerText))
        return;
      var url = new URL(it.href, window.location.href).href;
      it.innerText = `[[${url}][${it.innerText}]]`;
    });

    dom.querySelectorAll('blockquote').forEach(it => {
      it.innerHTML = srcBlock('#+begin_quote', '#+end_quote', it.innerText, "");
    });

    ['p', 'h1', 'h2', 'h3', 'h4'].forEach((tag, idx) => {
      dom.querySelectorAll(tag).forEach(it => {
        if (idx == 0) {
          it.querySelectorAll('code, kbd').forEach(code => {
            code.innerText = emphasize('~')(code.innerText);
          });
          it.querySelectorAll('b, strong').forEach(b => {
            b.innerText = emphasize('*')(b.innerText);
          });
          it.querySelectorAll('i, em').forEach(i => {
            i.innerText = emphasize('/')(i.innerText);
          });
          it.querySelectorAll('del, s').forEach(s => {
            s.innerText = emphasize('+')(s.innerText);
          });
        }
        it.innerHTML = idx > 0 ? `${repeatStar(idx)} ${it.innerText}` : it.innerText;
      });
    });

    dom.querySelectorAll('ul').forEach(ul => {
      ul.querySelectorAll('li').forEach(li => {
        li.innerText = `- ${li.innerText}`;
      });
    });

    dom.querySelectorAll('pre').forEach(pre => {
      var lang = pre.className.match(/lang-(\w+)/) || pre.parentNode.className.match(/highlight-source-(\w+)/);
      lang = lang ? lang[1] : "";

      var code = pre.querySelector('code');
      if (code) {
        code.innerHTML = srcBlock('#+begin_src', '#+end_src', code.innerText, lang);
      } else {
        pre.innerHTML = srcBlock('#+begin_src', '#+end_src', pre.innerText, lang);
      }
    });

    return dom.innerText.trim();
  }

  function emphasize(tag) {
    return text => `${tag}${text}${tag}`;
  }

  function srcBlock(start, end, body, header) {
    return `${start} ${header}
${body}
${end}`;
  }

  function repeatStar(n) {
    return n == 0 ? '' : '*' + repeatStar(n - 1);
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
