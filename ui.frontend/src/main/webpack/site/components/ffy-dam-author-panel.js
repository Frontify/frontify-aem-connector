import {GraphQLClient} from 'graphql-request';
import {handleUpdateLibrariesList} from './ffy-filter.js';

var hasNextPage = false;
var noPages = 0;
var pageNumber = 1;
var scrollTriggered = false;
var frontifyAssets = null;
var selectedSort = "";
var selectedLibrary = "";
var selectedBrand = "";
var selectedType = "";

function resetGlobals() {
  hasNextPage = false;
  noPages = 0;
  pageNumber = 1;
  scrollTriggered = false;
  frontifyAssets = null;
}

function getAltText(asset) {
  if (asset.description === '' || asset.description === undefined || asset.description === null) {
    return asset.title;
  } else {
    return asset.description;
  }
}

function cleanUrl(url, paramToDelete) {
  var urlParts = url.split('?');
  var params = new URLSearchParams(urlParts[1]);
  params.delete(paramToDelete);
  return urlParts[0] + '?' + params.toString()
}

function renderAssets(frontifyAssets) {

  frontifyAssets.forEach(asset => asset.imagePreviewUrl = cleanUrl(asset.previewUrl.replace(new RegExp(/\{width\}/g), 319), "format"));
  var coralItems = ``;
  for (const frontifyAsset of frontifyAssets) {
    const focalPoint = frontifyAsset.focalPoint === null ? "" : frontifyAsset.focalPoint;
    const typename = frontifyAsset.__typename.toLowerCase();
    if (typename === "image") {
      coralItems += `<coral-masonry-item class="coral3-Masonry-item is-managed" aria-selected="false">
                    <coral-card class="editor-Card-asset card-asset cq-draggable u-coral-openHand coral3-Card" draggable="true"
                                data-param="{
            &quot;./imageMap@Delete&quot;:&quot;&quot;,
            &quot;./imageCrop@Delete&quot;:&quot;&quot;,
            &quot;./imageRotate@Delete&quot;:&quot;&quot;,
            &quot;./focalPoint@Delete&quot;:&quot;&quot;,
            &quot;./alt&quot;:&quot;${getAltText(frontifyAsset)}&quot;,
            &quot;./title&quot;:&quot;${frontifyAsset.title}&quot;, 
            &quot;./id&quot;:&quot;${frontifyAsset.id}&quot;, 
            &quot;./description&quot;:&quot;${frontifyAsset.description}&quot;,
            &quot;./focalPoint&quot;:&quot;${focalPoint}&quot;}"
                                data-path=${frontifyAsset.previewUrl} data-asset-group="ffymedia"
                                data-type="Images"
                                data-asset-mimetype="${typename}/${frontifyAsset.extension}">
                        <coral-card-asset>
                            <img class="cq-dd-image"
                                 src=${frontifyAsset.imagePreviewUrl}
                                 alt="frontifyImage">
                        </coral-card-asset>
                        <div class="coral3-Card-wrapper">
                            <coral-card-content>
                                <coral-card-title class="foundation-collection-item-title coral3-Card-title" title="frontifyImage">${frontifyAsset.title}</coral-card-title>
                                <coral-card-propertylist>
                                    <coral-card-property class="coral3-Card-property">
                                        <coral-card-property-content>${frontifyAsset.width} x ${frontifyAsset.height} | ${frontifyAsset.size / 1024} KB | ${frontifyAsset.extension}</coral-card-property-content>
                                    </coral-card-property>
                                </coral-card-propertylist>
                            </coral-card-content>
                        </div>
                    </coral-card>
                </coral-masonry-item>`;
    } else if (typename === "video") {
      coralItems += `<coral-masonry-item class="coral3-Masonry-item is-managed" aria-selected="false">
                    <coral-card class="editor-Card-asset card-asset cq-draggable u-coral-openHand coral3-Card" draggable="true"
                                data-param="{
            &quot;./alt&quot;:&quot;${getAltText(frontifyAsset)}&quot;,
            &quot;./title&quot;:&quot;${frontifyAsset.title}&quot;, 
            &quot;./previewUrl&quot;:&quot;${frontifyAsset.imagePreviewUrl}&quot;,
            &quot;./id&quot;:&quot;${frontifyAsset.id}&quot;, 
            &quot;./description&quot;:&quot;${frontifyAsset.description}&quot;,
            &quot;./extension&quot;:&quot;${frontifyAsset.extension}&quot;}"
                                data-path=${frontifyAsset.downloadUrl} data-asset-group="ffymedia"
                                data-type="Images"
                                data-asset-mimetype="${typename}/${frontifyAsset.extension}">
                        <coral-card-asset>
                            <img class="cq-dd-image"
                                 src=${frontifyAsset.imagePreviewUrl}
                                 alt="frontifyImage">
                        </coral-card-asset>
                        <div class="coral3-Card-wrapper">
                            <coral-card-content>
                                <coral-card-title class="foundation-collection-item-title coral3-Card-title" title="frontifyImage">${frontifyAsset.title}</coral-card-title>
                                <coral-card-propertylist>
                                    <coral-card-property class="coral3-Card-property">
                                        <coral-card-property-content>${frontifyAsset.width} x ${frontifyAsset.height} | ${frontifyAsset.size / 1024} KB | ${frontifyAsset.extension}</coral-card-property-content>
                                    </coral-card-property>
                                </coral-card-propertylist>
                            </coral-card-content>
                        </div>
                    </coral-card>
                </coral-masonry-item>`;
    } else {
      var mimetype = "application";
      if (typename === "audio") {
        frontifyAsset.imagePreviewUrl += "&format=jpg";
        mimetype = "audio";
      }
      coralItems += `<coral-masonry-item class="coral3-Masonry-item is-managed" aria-selected="false">
                    <coral-card class="editor-Card-asset card-asset cq-draggable u-coral-openHand coral3-Card" draggable="true"
                                data-param="{
            &quot;./imageMap@Delete&quot;:&quot;&quot;,
            &quot;./imageCrop@Delete&quot;:&quot;&quot;,
            &quot;./imageRotate@Delete&quot;:&quot;&quot;,
            &quot;./alt&quot;:&quot;${getAltText(frontifyAsset)}&quot;,
            &quot;./title&quot;:&quot;${frontifyAsset.title}&quot;,
            &quot;./previewUrl&quot;:&quot;${frontifyAsset.imagePreviewUrl}&quot;,
            &quot;./size&quot;:&quot;${frontifyAsset.size / 1024} KB&quot;,
            &quot;./id&quot;:&quot;${frontifyAsset.id}&quot;, 
            &quot;./description&quot;:&quot;${frontifyAsset.description}&quot;,
            &quot;./extension&quot;:&quot;${mimetype}/${frontifyAsset.extension}&quot;}"
                                data-path=${frontifyAsset.downloadUrl} data-asset-group="ffymedia"
                                data-type="Images"
                                data-asset-mimetype="${mimetype}/${frontifyAsset.extension}">
                        <coral-card-asset>
                            <img class="cq-dd-image frontify-type-${typename}"
                                 src=${frontifyAsset.imagePreviewUrl}
                                 alt="frontifyImage">
                        </coral-card-asset>
                        <div class="coral3-Card-wrapper">
                            <coral-card-content>
                                <coral-card-title class="foundation-collection-item-title coral3-Card-title" title="frontifyImage">${frontifyAsset.title}</coral-card-title>
                                <coral-card-propertylist>
                                    <coral-card-property class="coral3-Card-property">
                                        <coral-card-property-content>${frontifyAsset.size / 1024} KB | ${frontifyAsset.extension}</coral-card-property-content>
                                    </coral-card-property>
                                </coral-card-propertylist>
                            </coral-card-content>
                        </div>
                    </coral-card>
                </coral-masonry-item>`;
    }
  }
  var coralMasonry = '<coral-masonry class="coral3-Masonry is-loaded" layout="variable">' + coralItems + '</coral-masonry>';
  $('.frontifyfinder').html(coralMasonry);
  $('.frontifyfinder').show();
  $(".emptyresult").hide();
  $(".resultspinner").hide();
}

function cleanUpDataAssets(data) {
    return  data.filter(function(element, index) {
        if (element !== null && element !== undefined && element.hasOwnProperty("previewUrl")) {
            return element;
        }

    });
}


async function handleUpdateAssetList(endpoint, domain) {
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'x-frontify-beta': 'enabled',
      authorization: 'Bearer ' + localStorage.getItem('FrontifyAuthenticator_token'),

    },
  });

  const query = /* GraphQL */ `
  {
  brands {
    id
    libraries(limit: 100, page: 1) {
      __typename
      ... on LibraryItems {
        items {
          id
        }
      }
    }
  }
   workspaceProject: library(id: "$library") {
    id
    name
    assetCount
    assets(page: 1, query: {search: $term, type: [$asset_type], sortBy: $sort}) {
      total
      page
      limit
      hasNextPage
      items {
        ...onAsset
        ...onImage
        ...onDocument
        ...onVideo
        ...onFile
        ...onAudio
      }
    }
  }
}

fragment onAsset on Asset {
  id
  title
  description
  __typename
}

fragment onImage on Image {
  size
  extension
  downloadUrl(permanent: true)
  previewUrl
  width
  height
  focalPoint
}

fragment onDocument on Document {
  size
  extension
  previewUrl
  downloadUrl(permanent: true)
}

fragment onVideo on Video {
  size
  extension
  previewUrl
  width
  height
  downloadUrl(permanent: true)
}

fragment onAudio on Audio {
  size
  extension
  previewUrl
  downloadUrl(permanent: true)
}

fragment onFile on File {
  size
  extension
  previewUrl
  downloadUrl(permanent: true)
}
  `;

  var queryParsed = query;
  var librariesListSelected = $("input[name=frontifyfilter_library_selector]").val();
  if (selectedLibrary !== librariesListSelected) {
    selectedLibrary = librariesListSelected;
    resetGlobals();
  }

  var brandsListSelected = $("input[name=frontifyfilter_brand_selector]").val();
  if (selectedBrand !== brandsListSelected) {
    selectedBrand = brandsListSelected;
    resetGlobals();
  }

  var typesListSelected = $("input[name=frontifyfilter_type_selector]").val();
  if (selectedType !== typesListSelected) {
    selectedType = typesListSelected;
    resetGlobals();
  }


  var sortListSelected = $("input[name=frontifyfilter_sort_selector]").val();
  if (selectedSort !== sortListSelected) {
    selectedSort = sortListSelected;
    resetGlobals();
  } else if(sortListSelected === "") {
    selectedSort = "RELEVANCE";
    resetGlobals();
  }

  if (librariesListSelected !== null && librariesListSelected !== undefined && librariesListSelected !== "") {
    if (pageNumber === noPages) {
      return;
    }

    if (hasNextPage && pageNumber < noPages) {
      $(".resultspinner").show();
      pageNumber += 1;
      queryParsed = queryParsed.replace(new RegExp(/\$library/g), librariesListSelected).replace(new RegExp(/\$page/g), pageNumber).replace(new RegExp(/\$asset_type/g), typesListSelected).replace(new RegExp(/\$sort/g), selectedSort); // check
      scrollTriggered = true;
    } else {
      queryParsed = queryParsed.replace(new RegExp(/\$library/g), librariesListSelected).replace(new RegExp(/\$page/g), pageNumber).replace(new RegExp(/\$asset_type/g), typesListSelected).replace(new RegExp(/\$sort/g), selectedSort); // check

    }
    var queryTerm = JSON.stringify($("#frontifysearch").val());
    queryParsed = queryParsed.replace(new RegExp(/\$term/g), queryTerm);
    var data;

    try {
      data = await graphQLClient.request(queryParsed);
      hasNextPage = data.workspaceProject.assets.hasNextPage;
      noPages = Math.ceil(data.workspaceProject.assets.total / data.workspaceProject.assets.limit);
    } catch (error) {
      $(window).adaptTo("foundation-ui").alert("Error", "Error while executing the search");
    }

    if (data !== null && data.workspaceProject.assets != null && data.workspaceProject.assets.items != null && !scrollTriggered) {
      frontifyAssets = cleanUpDataAssets(data.workspaceProject.assets.items);
    } else if (data !== null && scrollTriggered) {
      frontifyAssets = cleanUpDataAssets(frontifyAssets.concat(data.workspaceProject.assets.items));
    } else {
      frontifyAssets = [];
    }

    if (Array.isArray(frontifyAssets) && frontifyAssets.length) {
      $(".emptyresult").hide();
      $(".resultspinner").hide();
      renderAssets(cleanUpDataAssets(frontifyAssets));
      $('.frontifyfinder').show();
    } else {
      $('.frontifyfinder').hide();
      $(".emptyresult").show();
    }
  } else {
    resetGlobals();
    $('.frontifyfinder').hide();
    $(".emptyresult").show();
  }
}

export function obtainCloudConfiguration() {
  $.ajax({
    url: "/bin/ffyconfig",
    method: "GET",
    data: {
      "uri": window.location.pathname.replace("/editor.html", "")
    },
    success: function (data) {
      const endpoint = data.endPoint;
      const domain = data.domain;
      handleUpdateLibrariesList(endpoint, domain, handleUpdateAssetList);
    },
    error: function () {
      $('.frontify-login-panel').hide();
      $('.frontify-logout-panel').hide();
      $('.frontify-noconfig-panel').show();
      $('.frontify-filter-panel').hide();
      $('.frontify-content-panel').hide();
      return null;
    },
    statusCode: {
      404: function () {
        $('.frontify-login-panel').hide();
        $('.frontify-logout-panel').hide();
        $('.frontify-noconfig-panel').show();
        $('.frontify-filter-panel').hide();
        $('.frontify-content-panel').hide();
        return null;

      }

    }
  });
}

function initSearch() {
    obtainCloudConfiguration();
}

if( localStorage.FrontifyAuthenticator_token ) {
  $('.frontify-login-panel').hide();
  $('.frontify-logout-panel').show();
  $('.frontify-filter-panel').show();
  $(".emptyresult").hide();
  $(".resultspinner").hide();
  initSearch();
} else {
  $('.frontify-login-panel').show();
  $('.frontify-logout-panel').hide();
  $('.frontify-filter-panel').hide();
  $(".emptyresult").hide();
  $(".resultspinner").hide();

}

$("#frontifyfilter_brand_selector").on("change", function (event) {
  if (typeof (event.isTrigger) === 'undefined') {
    sessionStorage.setItem("ffy.chosenBrand", $("input[name=frontifyfilter_brand_selector]").val());
    obtainCloudConfiguration();
  }
});

$("#frontifyfilter_library_selector").on("change", function (event) {
  if (typeof (event.isTrigger) === 'undefined') {
    sessionStorage.setItem("ffy.chosenLibrary", $("input[name=frontifyfilter_library_selector]").val());
    obtainCloudConfiguration();
  }
});

$("#frontifyfilter_sort_selector").on("change", function (event) {
  if (typeof (event.isTrigger) === 'undefined') {
    obtainCloudConfiguration();
  }
});

$("#frontifyfilter_type_selector").on("change", function (event) {
  if (typeof (event.isTrigger) === 'undefined') {
    obtainCloudConfiguration();
  }
});

$("#frontifysearch").on("change", function (event) {
  //save chosen option
  sessionStorage.setItem("ffy.chosenLibrary", $("input[name=frontifyfilter_library_selector]").val());
  resetGlobals();
  obtainCloudConfiguration();
});


$('.frontify-content-panel').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        if(!scrollTriggered){
            obtainCloudConfiguration();
        }
    }
});

$(".clearFrontifySearch").on("click", function () {
    $("#frontifysearch").val("");
    resetGlobals();
    obtainCloudConfiguration();
});
