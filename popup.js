function SendToContent(tab, action, message, callback){
  var tabid = tab.id;
  //document.getElementById('contentMsg').innerHTML = 'Sending to content for : ' + action;
  console.log('Sending to content for : ' + action);
  chrome.tabs.sendMessage(tab.id, {"action": action, "message" : message}, function(response){
    if(!(response.error)){
      console.log('receiving response for action [' + action + '] : ' + response.value);

      //document.getElementById('contentMsg').innerHTML = 'Content results : ' + response.value;
      if(callback){
        callback(response.value);
      }
    } else {
      document.getElementById('contentMsg').innerHTML = 'Error for action [' + action + ']';
      console.log('Error for action [' + action + ']');
      if(callback){
        callback();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {

  var extractDataButton = document.getElementById('extractData');
  extractDataButton.addEventListener('click', function() {
    //chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      var tab = tabs[0];

      chrome.tabs.sendMessage(tab.id, {
        "action" : "extractPropertyInfo"
      }, function(response){
        if(!response.error){
          console.log('receiving response for action [extractPropertyInfo] : ' + response.value);

          document.getElementById('contentMsg').innerHTML = 'Info extracted result : ' + response.value;

          if(response.value == "OK"){
            document.getElementById('contentMsg').innerHTML = 'Extraction successful';
            console.log('Extraction successful');
          }

        } else {
          document.getElementById('contentMsg').innerHTML = 'Error for action [extractPropertyInfo]';
          console.log('Error for action [extractPropertyInfo]');
        }
      });
    });

    //chrome.extension.getBackgroundPage().console.log('taburl = ' + tab.url);
  }, false);

  var extractDataButton = document.getElementById('signIn');
  extractDataButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'createSpreadsheet' });
    //     // Get reference to background page.
    // const bgPage = chrome.extension.getBackgroundPage();
    // // Sign in with popup, typically attached to a button click.
    // bgPage.signInWithPopup();

    //chrome.extension.getBackgroundPage().console.log('taburl = ' + tab.url);
  }, false);

}, false);
