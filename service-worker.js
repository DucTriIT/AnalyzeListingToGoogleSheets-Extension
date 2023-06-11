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

chrome.runtime.onInstalled.addListener(async () => {
  const { access_token } = await chrome.identity.getAuthToken({
    interactive: true,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  globalAccessToken = access_token;
  // Use the access_token to create the spreadsheet
  //createSpreadsheet(access_token);
});

async function createSpreadsheet() {
  accessToken = globalAccessToken;
  const spreadsheetData = {
    properties: {
      title: 'My New Spreadsheet'
    }
  };

  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
