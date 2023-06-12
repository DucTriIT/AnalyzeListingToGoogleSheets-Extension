// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open('my-cache').then((cache) => {
//       return cache.addAll([
//         '/path/to/asset1',
//         '/path/to/asset2',
//         // Add more static assets to cache
//       ]);
//     })
//   );
// });
//
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });
var globalAccessToken;
const cellSetting ={
  region: "",
  listingId: "",
  prix: "",
  infoGenerale: "",
  evalMunicipale: "",
  rentabilite: "",
  taxesAnnuelles: "",
  depensesAnnuelsHorsExploitation: "",
  sommaireFinancier: "",
  revenusCommerciaux: "",
  sommaireFinancier: "",
}
chrome.runtime.onInstalled.addListener(async () => {
  chrome.identity.getAuthToken({interactive: true}, async (access_token) => {
    chrome.storage.local.set({"access_token": access_token})
  });
  // Use the access_token to create the spreadsheet
  //createSpreadsheet(access_token);
});
chrome.runtime.onMessage.addListener(function (msg, sender,sendResponse) {
	if (msg.action === 'createSpreadsheet')
	{
    createSpreadsheet().then((getMesResp)=>{
      sendResponse(getMesResp);
    });		
    return true;
  }
});
const getAccessToken = () => new Promise(async (resolve, reject) => {
  chrome.storage.local.get("access_token", function(result){
    if( typeof result.access_token != "undefined" && result.access_token != "" ){
      resolve(result.access_token);
    }
  });

})
async function createSpreadsheet() {
  globalAccessToken = await getAccessToken();
  const spreadsheetData = {
      // properties: {
      //   name:"My New Spreadsheet",
      //   title: 'My New Spreadsheet',
      //   mimeType: 'application/vnd.google-apps.spreadsheet'
      // }
      title: 'My New Spreadsheet',
    };
  
    try {
      const apiKey = chrome.runtime.getManifest().oauth2['api_key'];
      ''
      const url = new URL('https://www.googleapis.com/drive/v3/files/13iDLoiI6z0fdmQTSWLYAsb1AWOUOBSeAIbfql44sgt0/copy');
  
      url.searchParams.set('key', apiKey);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${globalAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(spreadsheetData)
      });
  
      if (response.ok) {
        const spreadsheet = await response.json();
        console.log('Spreadsheet created:', spreadsheet);
      } else {
        console.error('Failed to create spreadsheet:', response.status);
      }
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
    }
}
