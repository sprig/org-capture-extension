// Saves options to chrome.storage.sync.
function save_options() {
  var inp = document.getElementsByTagName('input');
  var areas = document.getElementsByTagName('textarea');
  var d = {};

  for (var i = 0; i < inp.length; i++) {
    var el = inp[i];
    d[el.id] = (el.value == 'on') ? el.checked : el.value;
  }
  for (var i = 0; i < areas.length; i++) {
    var el = areas[i];
    d[el.id] = el.value;
  }

  chrome.storage.sync.set(d, function () {
    if (chrome.runtime.lastError) {
      alert("Could not set options! Error: " + chrome.runtime.lastError.message);
      return;
    }

    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    selectedTemplate: 'p',
    unselectedTemplate: 'L',
    selectedProtocol: 'capture',
    unselectedProtocol: 'capture',
    useNewStyleLinks: true,
    debug: false,
    overlay: true,
    expert: false,
    createURI: `if ($.useNewStyleLinks) {$.uri = "org-protocol://" + $.protocol + "?template="+$.template+'&url='+$.encoded_url+'&title='+$.escaped_title+'&body='+$.selection_text;}
else {$.uri = "org-protocol://" + $.protocol + ":/"+$.template+'/'+$.encoded_url+'/'+$.escaped_title+'/'+$.selection_text;}`
  }, function (options) {
    if (chrome.runtime.lastError) {
      alert("Could not restore options! Error: " + chrome.runtime.lastError.message);
      return;
    }

    for (key in options) {
      var el = document.getElementById(key);
      if (el.value == "on") {
        el.checked = options[key];
      } else {
        el.value = options[key];
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);
