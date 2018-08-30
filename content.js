chrome.storage.sync.get({
  shortcut: "ctrl+c c"
}, function(options) {
  Mousetrap.bindGlobal(options.shortcut, function() {
    chrome.runtime.sendMessage("orgcapture");
  });
});
