
function injectTheScript() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // query the active tab, which will be only one tab
    //and inject the script in it
    chrome.tabs.executeScript(tabs[0].id, {file: "sort.js"});

    console.log('-------------executeScript------------');
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('clickactivity') && document.getElementById('clickactivity').addEventListener('click', injectTheScript);
}, false);
