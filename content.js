var currentAction;


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.action === "extractPropertyInfo"){
      console.log('extractPropertyInfo');

      let listing = extractPropertyInfo();
      // createGoogleSheet(listing, function(response){
      //   sendResponse({"value": response});
      // });
    } else {
      console.log('Error: Wrong action');
      sendResponse({"value": "KO"});
    }
    return true;
  }
)

function extractPropertyInfo() {

  let listingElement = document.body.querySelectorAll('.inscription-detail-container');
  let listing = Object.values(listingElement).map(x => {
    return {
      adresse: x.querySelector('.adresse').textContent ?? null,
      region: x.querySelector('.region-zone').textContent ?? null,
      listingId: x.querySelector('.id').textContent ?? null,
      prix: x.querySelector('.asking-price').textContent ?? null,
    }
  });

  //console.log(listing);

  //----------- Getting data from infoGenerale -------------
  let info = document.getElementsByClassName("information-generale")[0].getElementsByTagName("li");
  if(info){
    let infoGenerale = {};
    for(var i=0; i<info.length; i++){
      //console.log('info[' + i + '].innerHTML = ' + info[i].innerHTML);

      let term = info[i].getElementsByClassName("term")[0].innerHTML;
      let value = info[i].getElementsByClassName("value")[0].innerHTML.replace(/<[^>]+>/g, '');

      infoGenerale[term] = value;
    }
    listing["infoGenerale"] = infoGenerale;
  }

  //----------- Getting data from evaluation-municipale -------------
  info = document.getElementsByClassName("evaluation-municipale")[0].getElementsByTagName("li");
  if(info){
    let evalMunicipale = {};
    for(var i=0; i<info.length; i++){
      //console.log('info[' + i + '].innerHTML = ' + info[i].innerHTML);

      let term = info[i].getElementsByClassName("term")[0].innerHTML;
      let value = info[i].getElementsByClassName("value")[0].innerHTML.replace(/<[^>]+>/g, '');

      evalMunicipale[term] = value;
    }
    listing["evalMunicipale"] = evalMunicipale;
  }

  //----------- Getting data from rentabilite -------------
  info = document.getElementsByClassName("rentabilite")[0].getElementsByTagName("li");
  if(info){
    let rentabilite = {};
    for(var i=0; i<info.length; i++){
      //console.log('info[' + i + '].innerHTML = ' + info[i].innerHTML);

      let term = info[i].getElementsByClassName("term")[0].innerHTML;
      let value = info[i].getElementsByClassName("value")[0].innerHTML.replace(/<[^>]+>/g, '');

      rentabilite[term] = value;
    }
    listing["rentabilite"] = rentabilite;
  }

  //----------- Getting data from taxes-annuelles -------------
  info = document.querySelector('section.collapse-box.taxes-annuelles');
  if(info){
    const dataElements = info.querySelectorAll('table');
    const taxesAnnuelles = {};

    dataElements.forEach((element) => {
      if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        const header = [];
        let currentKey = '';
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          cells.forEach((cell) => {
            header.push(cell.textContent.trim());
          });
        });

        const rowElements = element.querySelectorAll('tbody tr');

        rowElements.forEach((rowElement) => {
          const keys = rowElement.querySelectorAll('th');
          currentKey = keys[0].textContent.trim();
          const subResult = {};
          const cells = rowElement.querySelectorAll('td');

          cells.forEach((cell, index) => {
            const value = cell.textContent.trim();
            subResult[header[index+1]] = value;
          });
          taxesAnnuelles[currentKey] = subResult;
        });
      }
    });
    listing["taxesAnnuelles"] = taxesAnnuelles;
  }

  //----------- Getting data from depenses-annuels-hors-exploitation -------------
  info = document.getElementsByClassName("depenses-annuels-hors-exploitation")[0].getElementsByTagName("li");
  if(info){
    let depensesAnnuelsHorsExpl = {};
    for(var i=0; i<info.length; i++){
      //console.log('info[' + i + '].innerHTML = ' + info[i].innerHTML);

      let term = info[i].getElementsByClassName("term")[0].innerHTML;
      let value = info[i].getElementsByClassName("value")[0].innerHTML.replace(/<[^>]+>/g, '');

      depensesAnnuelsHorsExpl[term] = value;
    }
    listing["depenses-annuels-hors-exploitation"] = depensesAnnuelsHorsExpl;
  }

  //----------- Getting data from sommaire-financier -------------
  info = document.querySelector('section.collapse-box.sommaire-financier');
  if(info){
    const dataElements = info.querySelectorAll('h3, ul.term-value-list.sub-list, table.nb-unit');
    const sommaireFinancier = {};

    let currentKey = '';

    dataElements.forEach((element) => {
      if (element.tagName === 'H3') {
        currentKey = element.textContent.trim();
        sommaireFinancier[currentKey] = {};
      } else if (element.tagName === 'UL') {
        const listItemElements = element.querySelectorAll('li');
        listItemElements.forEach((listItemElement) => {
          const termElement = listItemElement.querySelector('p.term');
          const valueElement = listItemElement.querySelector('p.value');
          sommaireFinancier[currentKey][termElement.textContent.trim()] = valueElement.textContent.trim();
        });
      } else if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        let header;
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          header = cells[0].textContent.trim();
        });

        const rowElements = element.querySelectorAll('tbody tr');
        const subResult = {};
        rowElements.forEach((rowElement) => {
          const cells = rowElement.querySelectorAll('td');
          const term = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          subResult[term] = value;
        });
        sommaireFinancier[currentKey][header] = subResult;
      }
    });

    //console.log(sommaireFinancier);
    listing["sommaireFinancier"] = sommaireFinancier;
  }

  //----------- Getting data from revenus-commerciaux -------------
  info = document.querySelector('section.collapse-box.revenus-commerciaux');
  if(info){
    console.log('found section.collapse-box.revenus-commerciaux');
    const dataElements = info.querySelectorAll('h3, ul.term-value-list.sub-list, table');
    const revenusCommerciaux = {};

    let currentKey = '';

    dataElements.forEach((element) => {
      if (element.tagName === 'H3') {
        currentKey = element.textContent.trim();
        revenusCommerciaux[currentKey] = {};
      } else if (element.tagName === 'UL') {
        const listItemElements = element.querySelectorAll('li');
        listItemElements.forEach((listItemElement) => {
          const termElement = listItemElement.querySelector('p.term');
          const valueElement = listItemElement.querySelector('p.value');
          revenusCommerciaux[currentKey][termElement.textContent.trim()] = valueElement.textContent.trim();
        });
      } else if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        let header;
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          header = cells[0].textContent.trim();
        });

        const rowElements = element.querySelectorAll('tbody tr');
        const subResult = {};
        rowElements.forEach((rowElement) => {
          const cells = rowElement.querySelectorAll('td');
          const term = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          subResult[term] = value;
        });
        revenusCommerciaux[currentKey][header] = subResult;
      }
    });

    //console.log(revenusCommerciaux);
    listing["revenusCommerciaux"] = revenusCommerciaux;
  }

  //----------- Getting data from logements-residentiels -------------
  info = document.querySelector('section.collapse-box.logements-residentiels');
  if(info){
    console.log('found section.collapse-box.logements-residentiels');
    const dataElements = info.querySelectorAll('h3, table');
    const logementsResidentiels = {};

    let currentKey = '';

    dataElements.forEach((element) => {
      if (element.tagName === 'H3') {
        currentKey = element.textContent.trim();
        logementsResidentiels[currentKey] = [];
      } else if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        const header = [];
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          cells.forEach((cell) => {
            header.push(cell.textContent.trim());
          });
        });

        console.log('header = ' + header);

        const rowElements = element.querySelectorAll('tbody tr');
        const subResult = {};
        rowElements.forEach((rowElement) => {
          const cells = rowElement.querySelectorAll('td');
          cells.forEach((cell, index) => {
            const value = cell.textContent.trim();
            subResult[header[index]] = value;
          });
          logementsResidentiels[currentKey].push(subResult);
        });
        //logementsResidentiels[currentKey][header] = subResult;
      }
    });
    listing["logementsResidentiels"] = logementsResidentiels;
  }

  //----------- Getting data from autres-revenus -------------
  info = document.getElementsByClassName("autres-revenus")[0];
  if(info){
    console.log('found section.collapse-box.autres-revenus');

    const dataElements = info.querySelectorAll('table');
    const autresRevenus = [];

    dataElements.forEach((element) => {
      if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        const header = [];
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          cells.forEach((cell) => {
            header.push(cell.textContent.trim());
          });
        });

        console.log('header = ' + header);

        const rowElements = element.querySelectorAll('tbody tr');
        const subResult = {};
        rowElements.forEach((rowElement) => {
          const cells = rowElement.querySelectorAll('td');
          cells.forEach((cell, index) => {
            const value = cell.textContent.trim();
            subResult[header[index]] = value;
          });
          autresRevenus.push(subResult);
        });
      }
    });
    listing["autresRevenus"] = autresRevenus;
  }

  //----------- Getting data from zonages -------------
  info = document.getElementsByClassName("zonages")[0];
  if(info){
    console.log('found section.collapse-box.zonages');

    const dataElements = info.querySelectorAll('table');
    const zonages = [];

    dataElements.forEach((element) => {
      if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        const header = [];
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          cells.forEach((cell) => {
            header.push(cell.textContent.trim());
          });
        });

        console.log('header = ' + header);

        const rowElements = element.querySelectorAll('tbody tr');
        const subResult = {};
        rowElements.forEach((rowElement) => {
          const cells = rowElement.querySelectorAll('td');
          cells.forEach((cell, index) => {
            const value = cell.textContent.trim();
            subResult[header[index]] = value;
          });
          zonages.push(subResult);
        });
      }
    });
    listing["zonages"] = zonages;
  }

  //----------- Getting data from dimensions -------------
  info = document.querySelector('section.collapse-box.dimensions');
  if(info){
    const dataElements = info.querySelectorAll('table');
    const dimensions = {};

    dataElements.forEach((element) => {
      if (element.tagName === 'TABLE') {
        const rowHeaders = element.querySelectorAll('thead tr');
        const header = [];
        let currentKey = '';
        rowHeaders.forEach((rowHeader) => {
          const cells = rowHeader.querySelectorAll('th');
          cells.forEach((cell) => {
            header.push(cell.textContent.trim());
          });
        });

        const rowElements = element.querySelectorAll('tbody tr');

        rowElements.forEach((rowElement) => {
          const keys = rowElement.querySelectorAll('th');
          currentKey = keys[0].textContent.trim();
          const subResult = {};
          const cells = rowElement.querySelectorAll('td');

          cells.forEach((cell, index) => {
            const value = cell.textContent.trim();
            subResult[header[index+1]] = value;
          });
          dimensions[currentKey] = subResult;
        });
      }
    });
    listing["dimensions"] = dimensions;
  }

  console.log(listing);

  return(listing);

}

// async function createGoogleSheet(listing, callback){
//
//   // Authenticate with google
//   const authClient = await authorize();
//
//   // Create a new spreadsheet
//   const request = {
//     resource: {
//       // TODO: Add desired properties to the request body.
//     },
//
//     auth: authClient,
//   };
//
//   try {
//     const response = (await sheets.spreadsheets.create(request)).data;
//     // TODO: Change code below to process the `response` object:
//     console.log(JSON.stringify(response, null, 2));
//   } catch (err) {
//     console.error(err);
//   }
//
//
//   // Then copy the sheets (in order for the dependencies) from the template to the new spreadsheet
//
//   callback("OK");
// }
