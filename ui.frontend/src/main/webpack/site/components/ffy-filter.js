import {GraphQLClient} from 'graphql-request';

function setUserSelectionLocalStorage(type, item, value) {
  if (type === 'library') {
    var chosenLibraryStorage = sessionStorage.getItem(item);
    if (chosenLibraryStorage != null && $("#frontifyfilter_library_selector coral-select-item[value='" + chosenLibraryStorage + "']").length) {
      $("#frontifyfilter_library_selector coral-select-item[value='" + chosenLibraryStorage + "']").attr('selected', 'selected');
      $("#frontifyfilter_library_selector coral-select-item[value='" + chosenLibraryStorage + "']").change();
    } else {
      $("#frontifyfilter_library_selector coral-select-item[value='" + value + "']").attr('selected', 'selected');
      $("#frontifyfilter_library_selector coral-select-item[value='" + value + "']").change();
    }
  }
  if (type === 'brand') {
    $("#frontifyfilter_brand_selector coral-select-item[value='" + value + "']").attr('selected', 'selected');
    $("#frontifyfilter_brand_selector coral-select-item[value='" + value + "']").change();
  }
}

export async function handleUpdateLibrariesList(endpoint, domain, callback) {

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'x-frontify-beta': 'enabled',
      authorization: 'Bearer ' + localStorage.getItem('FrontifyAuthenticator_token'),
    },
  });

  //Make call to fetch libraries

  const query = `{
  brands {
    id
    name
    libraries {
      ... on LibraryItems {
        total
        items {
          ... on Library {
            id
            name
            assetCount
          }
        }
      }
    }
  }
}
        `;

  var data;

  //cache values
  var localBrands = sessionStorage.getItem("ffy.libraries");
  if (localBrands == null || localBrands == undefined) {
    try {
      data = await graphQLClient.request(query);
    } catch (error) {
      $(window).adaptTo("foundation-ui").alert("Error", "Error while executing the search");
    }
    if (data != null || data != undefined) {
      sessionStorage.setItem("ffy.libraries", JSON.stringify(data));
      localBrands = JSON.stringify(data);
    } else {
      $(window).adaptTo("foundation-ui").alert("Error", "Error obtaining libraries");
    }
  }

  if (localBrands != null && localBrands != undefined) {
    var brandsListSelectHidden = $("#frontifyfilter_brand_selector");
    var librariesListSelectHidden = $("#frontifyfilter_library_selector");

    //Reset library values
    $("#frontifyfilter_library_selector coral-select-item").remove()

    // Setting brand dropdown values
    var entries = JSON.parse(localBrands).brands;
    if ($("#frontifyfilter_brand_selector coral-selectlist").children().length == 0) {
      for (var brandIndex = 0; brandIndex < entries.length; brandIndex++) {
        var brand = entries[brandIndex];
        brandsListSelectHidden.append($('<coral-select-item>', {
          value: brand.id,
          text: brand.name
        }));
      }
    }
    var selectedBrand = JSON.parse(sessionStorage.getItem("ffy.libraries")).brands[0].id;
    var selectedLibrary = JSON.parse(sessionStorage.getItem("ffy.libraries")).brands[0].libraries.items[0].id;
    if (sessionStorage.getItem("ffy.chosenBrand") != null) {
      selectedBrand = sessionStorage.getItem("ffy.chosenBrand");
    }
    // Setting localStorage for selectedBrand by user
    setUserSelectionLocalStorage('brand', '', selectedBrand);
    // Setting library dropdown values
      for (var i in entries) {
        var brand = entries[i];
        if (brand.id === selectedBrand && brand.libraries.total > 0) {
          selectedLibrary = brand.libraries.items[0].id;
          for (var library in brand.libraries.items) {
            var lib = brand.libraries.items[library];
            librariesListSelectHidden.append($('<coral-select-item>', {
              value: lib.id,
              text: lib.name
            }));
          }
        }
      }
    setUserSelectionLocalStorage('library', 'ffy.chosenLibrary', selectedLibrary);
    }
    callback(endpoint, domain);
}
