///////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2015-2017 Konstantin Kliakhandler                              //
//                                                                               //
// Permission is hereby granted, free of charge, to any person obtaining a copy  //
// of this software and associated documentation files (the "Software"), to deal //
// in the Software without restriction, including without limitation the rights  //
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      //
// copies of the Software, and to permit persons to whom the Software is          //
// furnished to do so, subject to the following conditions:                      //
//                                                                               //
// The above copyright notice and this permission notice shall be included in    //
// all copies or substantial portions of the Software.                           //
//                                                                               //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    //
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,      //
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE   //
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        //
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, //
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN     //
// THE SOFTWARE.                                                                //
///////////////////////////////////////////////////////////////////////////////////

const defaults = {
  selectedTemplate: "p",
  unselectedTemplate: "L",
  useNewStyleLinks: true,
  debug: false,
  overlay: true
};

chrome.runtime.onInstalled.addListener(({reason, previousVersion}) => {
  if (reason === "install") {
    chrome.storage.sync.set(defaults);
  } else if (reason === "update" && previousVersion?.startsWith("0.1")) {
    chrome.storage.sync.set({...defaults, useNewStyleLinks: false});
  }
});

function encode(text) {
  return encodeURIComponent(text).replace(/[!'()*]/g, character =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function createCaptureURI(page, options) {
  const template = page.selection ? options.selectedTemplate : options.unselectedTemplate;
  const url = encodeURIComponent(page.url);
  const title = encode(page.title);
  const selection = encode(page.selection);
  if (options.useNewStyleLinks) {
    return `org-protocol://capture?template=${encodeURIComponent(template)}&url=${url}&title=${title}&body=${selection}`;
  }
  return `org-protocol://capture:/${encodeURIComponent(template)}/${url}/${title}/${selection}`;
}

chrome.action.onClicked.addListener(async tab => {
  try {
    const [injection, options] = await Promise.all([
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["capture.js"]
      }),
      chrome.storage.sync.get(defaults)
    ]);
    const page = injection[0]?.result;
    if (!page) throw new Error("Could not read the active page");
    const uri = createCaptureURI(page, options);
    if (options.debug) console.log("Capturing:", uri);
    await chrome.tabs.update(tab.id, {url: uri});
  } catch (error) {
    console.error("Org Capture failed:", error);
  }
});
