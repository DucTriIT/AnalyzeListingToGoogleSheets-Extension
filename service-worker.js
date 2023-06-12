var globalAccessToken;

//ID OF SPREADSHEET TEMPLATE
const SPREADSHEET_TEMPLATE_ID = "13iDLoiI6z0fdmQTSWLYAsb1AWOUOBSeAIbfql44sgt0"

// Object define range to update for each extraction data field
// Please see syntax used to define a cell or range of cells at https://developers.google.com/sheets/api/guides/concepts#cell
// that contains the sheet name plus the starting and ending cell coordinates using column letters and row numbers. 
// format:`'${sheetName}'!${numberOfRowsToSkip}:${lastRowNumber}`
const cellSetting ={
  region: `'Feuil1'!A103:A103`,
  listingId: "",
  prix: "",
  infoGenerale: `'Feuil1'!C103:D103`,
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
    createSpreadsheet(msg.data).then((getMesResp)=>{
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
async function createSpreadsheet(extractionData) {
  try {
    globalAccessToken = await getAccessToken();
    const apiKey = chrome.runtime.getManifest().oauth2['api_key'];
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${SPREADSHEET_TEMPLATE_ID}/copy`);
    const spreadsheetData = {
      name: extractionData.adresse,
    };
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
      if(spreadsheet.id != undefined)
      {
        // Document for updating value, pls see at https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
        //For each value of listing call function modifySpreadsheet
        //Sample update for 1 cell
        let range = cellSetting.region
        let values = [[extractionData.region]]
        await  modifySpreadsheet(spreadsheet.id,range,values)
        //Sample update for range
        if(extractionData.infoGenerale !=null){
          range = cellSetting.infoGenerale
          values = []
          Object.keys(extractionData.infoGenerale).forEach((filterKey) => {
            values.push([filterKey,extractionData.infoGenerale[filterKey]])
          });
          await modifySpreadsheet(spreadsheet.id,range,values)
        }
      }
    } else {
      console.error('Failed to create spreadsheet:', response.status);
    }
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
  }
}
async function modifySpreadsheet(spreadsheetID,range,values){
  try{
    globalAccessToken = await getAccessToken();
    const apiKey = chrome.runtime.getManifest().oauth2['api_key'];
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values/${range}?valueInputOption=RAW`);
    url.searchParams.set('key', apiKey);
    const valuerange = {
      "range": range,
      "majorDimension": "ROWS",
      "values": values
    }
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${globalAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(valuerange)
    });

    if (response.ok) {
      const spreadsheet = await response.json();
      console.log('Spreadsheet modified:', spreadsheet);
    } else {
      console.error('Failed to modify spreadsheet:', response.status);
    }
  }
  catch (error) {
    console.error('Error modifying spreadsheet:', error);
  }
}
