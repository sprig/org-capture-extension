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


chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install")
    chrome.storage.sync.set(
      {
        selectedTemplate: 'p',
        unselectedTemplate: 'L',
        useNewStyleLinks: true,
        debug: false,
        overlay: true
      });
  else if ((details.reason == "update" && details.previousVersion.startsWith("0.1")))
    chrome.storage.sync.set(
      {
        selectedTemplate: 'p',
        unselectedTemplate: 'L',
        useNewStyleLinks: false,
        debug: false,
        overlay: true
      });
});

function executeCapture(tab, with_note) {
    chrome.tabs.executeScript(tab.id, {
        code: 'var capture_with_note = ' + String(with_note) + ';'
    }, function() {
        chrome.tabs.executeScript(tab.id, {file: "capture.js"});
    });
}

chrome.browserAction.onClicked.addListener(function (tab) {
    executeCapture(tab, false);
});

chrome.commands.onCommand.addListener(function(command) {
    if (command === 'capture-with-note') {
        chrome.tabs.query({currentWindow: true, active: true }, function (tabs) {
            const current = tabs[0];
            executeCapture(current, true);
        });
    }
});

