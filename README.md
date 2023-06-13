# AnalyzeListingToGoogleSheets-Extension
Integrate OAuth Client ID 2 and Goggle Sheet API into Chrome Extension V3
# How To Use
Just replace your API KEY and CLIENT ID in manifest file.
![image](https://github.com/DucTriIT/AnalyzeListingToGoogleSheets-Extension/assets/64274096/ae97d26c-6fce-4cc9-ac88-318b2e7e5f10)
# Auth
When you install this extension, an OAuth consent screen will be popup.It requires permissions to give you access to your google sheet and google drive file.
An access token will be release when you agree allow this app access to your sheet and drive file.
# Duplicate an template sheet file to specific folder
![image](https://github.com/DucTriIT/AnalyzeListingToGoogleSheets-Extension/assets/64274096/69a6c1f7-9a8e-452f-bcf8-be5f72e11cd2)
<pre>
  URL: https://www.googleapis.com/drive/v3/files/${SPREADSHEET_SOURCE_ID}/copy
  METHOD: POST
  QUERY PARAMS: API_KEY
  HEADER: 
  {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
  BODY: we have two fields passed into body : name of file and id of a specific drive folder
</pre>

# Update a sheet file
![image](https://github.com/DucTriIT/AnalyzeListingToGoogleSheets-Extension/assets/64274096/0fd8351f-f06e-4415-94a6-6b61b4967706)
<pre>
  URL: https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values/${range}?valueInputOption=RAW
  METHOD: PUT
  QUERY PARAMS: API_KEY
  HEADER: 
  {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
  BODY: we have two importants fields : range and values. 
    * range : A syntax used to define a cell or range of cells with a string that contains the sheet name plus the starting and ending cell coordinates using column letters and row numbers.
              Format:`'${sheetName}'!${numberOfRowsToSkip}:${lastRowNumber}`
    * values: This is an array of arrays, the outer array representing all the data and each inner array representing a major dimension. Each item in the inner array corresponds with one cell.
</pre>
# Where to learn more
[Here](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets) is a more extensive general introduction to googlesheets4.
# Contributing
If you have best practives for google sheets api, I would be happy if you contribute it to this project.
**Thanks for your sharing**
