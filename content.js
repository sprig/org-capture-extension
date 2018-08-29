Mousetrap.bind('ctrl+c c', function() {
  chrome.runtime.sendMessage("orgcapture");
});
