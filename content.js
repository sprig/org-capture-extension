chrome.storage.sync.get({
  shortcut: "ctrl+c c"
}, function(options) {
  Mousetrap.bind(options.shortcut, function() {
    chrome.runtime.sendMessage("orgcapture");
  });
});
