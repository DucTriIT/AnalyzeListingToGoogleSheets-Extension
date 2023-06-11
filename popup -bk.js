var myFileEntry = undefined;

function errorHandler(e) {
  var msg = '';

  chrome.extension.getBackgroundPage().console.log('error = ' + e.message);

  switch (e.name) {
    case QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  chrome.extension.getBackgroundPage().console.log('Error: ' + msg);
}

function onInitFs(fs) {

  myFS = fs;

  fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

    myFileEntry = fileEntry;
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      myFileWriter = fileWriter;

    }, errorHandler);

  }, errorHandler);

}

function onInitFsWrite(fs) {

  fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        chrome.extension.getBackgroundPage().console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        chrome.extension.getBackgroundPage().console.log('Write failed: ' + e.toString());
      };

      // Start write position at EOF
      fileWriter.seek(fileWriter.length);

      // Create a new Blob and write it to log.txt.
      var blob = new Blob(['Hello World'], {type: 'text/plain'});

      fileWriter.write(blob);

    }, errorHandler);

  }, errorHandler);

}

function onInitFsRead(fs) {

  fs.root.getFile('log.txt', {}, function(fileEntry) {

    // Get a File object representing the file,
    // then use FileReader to read its contents.
    fileEntry.file(function(file) {
       var reader = new FileReader();

       reader.onloadend = function(e) {
         var txtArea = document.createElement('textarea');
         txtArea.value = this.result;
         document.body.appendChild(txtArea);
         chrome.extension.getBackgroundPage().console.log(this.result);
       };

       reader.readAsText(file);

       var url = fileEntry.toURL();
       chrome.extension.getBackgroundPage().console.log('url = ' + url);
    }, errorHandler);

  }, errorHandler);

}

function writeToFile(line){

  //chrome.extension.getBackgroundPage().console.log('writeToFile...');
  chrome.extension.getBackgroundPage().console.log('line to write: ' + line);

  if(myFileEntry){
    myFileEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        chrome.extension.getBackgroundPage().console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        chrome.extension.getBackgroundPage().console.log('Write failed: ' + e.toString());
      };

      chrome.extension.getBackgroundPage().console.log('fileWriter.length = ' + fileWriter.length);

      // Start write position at EOF
      fileWriter.seek(fileWriter.length);

      // Create a new Blob and write it to log.txt.
      var blob = new Blob([line + '\n'], {type: 'text/plain'});

      chrome.extension.getBackgroundPage().console.log('writing...');
      fileWriter.write(blob);
    }, errorHandler);
  }
}

function readFile(){
  myFileEntry.file(function(file) {
     var reader = new FileReader();

     var url = myFileEntry.toURL();
     chrome.extension.getBackgroundPage().console.log('url = ' + url);

     reader.onloadend = function(e) {
       var txtArea = document.createElement('textarea');
       txtArea.value = 'url: ' + url + '\n\n' + this.result;
       txtArea.id = 'textareaFile';
       document.body.appendChild(txtArea);

       $('textareaFile').width('auto');

       /*var fileContent = 'url: ' + url + '<br/><br/>' + this.result;
       document.getElementById('fileContent').innerHTML = fileContent;*/

       chrome.extension.getBackgroundPage().console.log(this.result);
     };

     reader.readAsText(file);
  }, errorHandler);
}

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
//window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFsWrite, errorHandler);
//window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFsRead, errorHandler);

document.addEventListener('DOMContentLoaded', function() {
  var extractDataButton = document.getElementById('extractData');
  extractDataButton.addEventListener('click', function() {
    chrome.extension.getBackgroundPage().console.log('click!');

    //chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      d = document;
      var tab = tabs[0];

      chrome.tabs.sendMessage(tab.id, {"action": "getSKU"}, function(response){
        if(response.error == undefined){
          //chrome.extension.getBackgroundPage().console.log('SKU = ' + response.value);
          document.getElementById('sku').innerHTML = 'SKU: ' + response.value;
          writeToFile(response.value);
        } else {
          chrome.extension.getBackgroundPage().console.log('There was an error getting the SKU');
        }
      });
      chrome.tabs.sendMessage(tab.id, {"action": "getProductName"}, function(response){
        if(response.error == undefined){
          //chrome.extension.getBackgroundPage().console.log('Product Name = ' + response.value);
          document.getElementById('productName').innerHTML = 'Name: ' + response.value;
          writeToFile(response.value);
        } else {
          chrome.extension.getBackgroundPage().console.log('There was an error getting the Product Name');
        }
      });
      chrome.tabs.sendMessage(tab.id, {"action": "getCost"}, function(response){
        if(response.error == undefined){
          //chrome.extension.getBackgroundPage().console.log('Cost = ' + response.value);
          document.getElementById('cost').innerHTML = 'Cost: ' + response.value;
          writeToFile(response.value);
        } else {
          chrome.extension.getBackgroundPage().console.log('There was an error getting the Cost');
        }
      });
      chrome.tabs.sendMessage(tab.id, {"action": "getShippingTime"}, function(response){
        if(response.error == undefined){
          //chrome.extension.getBackgroundPage().console.log('Shipping Time = ' + response.value);
          document.getElementById('shippingTime').innerHTML = 'Shipping Time: ' + response.value;
          //chrome.extension.getBackgroundPage().console.log('calling writeToFile');
          writeToFile(response.value);
        } else {
          chrome.extension.getBackgroundPage().console.log('There was an error getting the Shipping Time');
        }
      });
      /*chrome.tabs.sendMessage(tab.id, {"action": "getImagesURL"}, function(response){
        if(response.error == undefined){
          chrome.extension.getBackgroundPage().console.log('Images URL = ' + JSON.stringify(response.value));
          var URLs = response.value;
          //chrome.extension.getBackgroundPage().console.log('URL = ' + URLs);
          //chrome.extension.getBackgroundPage().console.log('URL.length = ' + URLs.length);
          for(var i=0; i<URLs.length; i++){
            chrome.downloads.download({
              url: URLs[i],
              filename: "Focalprice/" + URLs[i].split('/').pop() // Optional
            }, function(downloadId){
              if(downloadId){
                chrome.extension.getBackgroundPage().console.log('Images download: SUCCESSFUL');
                document.getElementById('imagesDownloaded').innerHTML = 'Images download: SUCCESSFUL';
              } else {
                chrome.extension.getBackgroundPage().console.log('Images download: FAILED');
                document.getElementById('imagesDownloaded').innerHTML = 'Images download: FAILED';
              }
            });
            chrome.extension.getBackgroundPage().console.log('downloading [' + i + '] ' + URLs[i]);
          }
          //document.getElementById('imagesURL').innerHTML = 'URLs: ' + request.value;
        } else {
          chrome.extension.getBackgroundPage().console.log('There was an error getting the images URL');
        }
      });*/

      chrome.extension.getBackgroundPage().console.log('taburl = ' + tab.url);
      document.getElementById('taburl').innerHTML = 'URL: ' + tab.url;

      /*var sku = d.createElement('div');
      var skuSpan = d.createElement('span');
      skuSpan.id = 'sku';
      sku.appendChild(skuSpan);
      d.body.appendChild(sku);*/



      /*
      var f = d.createElement('form');
      f.action = 'http://gtmetrix.com/analyze.html?bm';
      f.method = 'post';
      var i = d.createElement('input');
      i.type = 'hidden';
      i.name = 'url';
      i.value = tab.url;
      f.appendChild(i);
      d.body.appendChild(f);
      f.submit();*/
    });
  }, false);

  var showFileContentButton = document.getElementById('showFileContent');
  showFileContentButton.addEventListener('click', function() {
    readFile();
  }, false);

  /*var deleteFileContentButton = document.getElementById('deleteFileContent');
  deleteFileContentButton.addEventListener('click', function() {

  }, false);*/
}, false);
