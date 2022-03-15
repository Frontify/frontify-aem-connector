import {GraphQLClient} from 'graphql-request';
import {handleUpdateCategoriesList} from './ffy-filter.js';

var hasNextPage = false;
var noPages = 0;
var pageNumber = 1;
var scrollTriggered = false;
var frontifyAssets = null;
var selectedCategory = "";
var selectedSort = "";

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

function renderAssets(frontifyAssets) {

  frontifyAssets.forEach(asset => asset.imagePreviewUrl = asset.previewUrl.replace(new RegExp(/\{width\}$/g), 319));
  var coralItems = ``;
  for (const frontifyAsset of frontifyAssets) {
    const focalPoint = frontifyAsset.focalPoint === null ? "" : frontifyAsset.focalPoint;
    coralItems += `<coral-masonry-item class="coral3-Masonry-item is-managed" aria-selected="false">
                    <coral-card class="editor-Card-asset card-asset cq-draggable u-coral-openHand coral3-Card" draggable="true"
                                data-param="{
            &quot;./imageMap@Delete&quot;:&quot;&quot;,
            &quot;./imageCrop@Delete&quot;:&quot;&quot;,
            &quot;./imageRotate@Delete&quot;:&quot;&quot;,
            &quot;./focalPoint@Delete&quot;:&quot;&quot;,
            &quot;./alt&quot;:&quot;${getAltText(frontifyAsset)}&quot;,
            &quot;./title&quot;:&quot;${frontifyAsset.title}&quot;, 
            &quot;./focalPoint&quot;:&quot;${focalPoint}&quot;}"
                                data-path=${frontifyAsset.previewUrl} data-asset-group="ffymedia"
                                data-type="Images"
                                data-asset-mimetype="image/jpeg">
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
                                        <coral-card-property-content>${frontifyAsset.width} x ${frontifyAsset.height} | ${frontifyAsset.size / 1024} KB</coral-card-property-content>
                                    </coral-card-property>
                                </coral-card-propertylist>
                            </coral-card-content>
                        </div>
                    </coral-card>
                </coral-masonry-item>`;
  }
  var coralMasonry = '<coral-masonry class="coral3-Masonry is-loaded" layout="variable">' + coralItems + '</coral-masonry>';
  $('.frontifyfinder').html(coralMasonry);
  $('.frontifyfinder').show();
  $(".emptyresult").hide();
  $(".resultspinner").hide();


}

function cleanUpDataAssets(data) {
  return data.filter(function (element, index) {
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
      projects {
        __typename
        ... on MediaLibrary {
          id
        }
      }
    }
    project(id: "$category") {
      ... on MediaLibrary {
        id
        name
        assetCount
        assets(page: $page,  query: {search: $term, type: [IMAGE], $sort}) {
          total
          page
          limit
          hasNextPage
          items {
            ... on Image {
              title
              description
              size
              extension
              previewUrl
              width
              height
              focalPoint
            }
          }
        }
      }
    }
  }
  `;
  var queryParsed = query;
  var categoriesListSelected = $("input[name=frontifyfilter_type_selector]").val();
  if (selectedCategory !== categoriesListSelected) {
    selectedCategory = categoriesListSelected;
    resetGlobals();
  }

  var sortListSelected = $("input[name=frontifyfilter_sort_selector]").val();
  if (selectedSort !== sortListSelected) {
    selectedSort = sortListSelected;
    resetGlobals();
  }

  if (sortListSelected != "") {
    queryParsed = queryParsed.replace(new RegExp(/\$sort/g), ",sortBy: " + sortListSelected);
  } else {
    queryParsed = queryParsed.replace(new RegExp(/\$sort/g), "");
  }

  if (categoriesListSelected !== null || categoriesListSelected !== undefined) {
    if (pageNumber === noPages) {
      return;
    }
    if (hasNextPage && pageNumber < noPages) {
      $(".resultspinner").show();
      pageNumber += 1;
      queryParsed = queryParsed.replace(new RegExp(/\$category/g), categoriesListSelected).replace(new RegExp(/\$page/g), pageNumber); // check
      scrollTriggered = true;
    } else {
      queryParsed = queryParsed.replace(new RegExp(/\$category/g), categoriesListSelected).replace(new RegExp(/\$page/g), pageNumber); // check

    }
  } else {
    $('.frontifyfinder').hide();
    $(".emptyresult").show();
  }

  var queryTerm = JSON.stringify($("#frontifysearch").val());
  queryParsed = queryParsed.replace(new RegExp(/\$term/g), queryTerm);
  var data;

  try {
    data = await graphQLClient.request(queryParsed);
    hasNextPage = data.project.assets.hasNextPage;
    noPages = Math.ceil(data.project.assets.total / data.project.assets.limit);
  } catch (error) {
    $(window).adaptTo("foundation-ui").alert("Error", "Error while executing the search");
  }

  if (data !== null && data.project.assets != null && data.project.assets.items != null && !scrollTriggered) {
    frontifyAssets = cleanUpDataAssets(data.project.assets.items);
  } else if (data !== null && scrollTriggered) {
    frontifyAssets = cleanUpDataAssets(frontifyAssets.concat(data.project.assets.items));
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
      handleUpdateCategoriesList(endpoint, domain, handleUpdateAssetList);
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

if (localStorage.FrontifyAuthenticator_token) {
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

$("#frontifyfilter_type_selector").on("change", function (event) {
  if (typeof (event.isTrigger) === 'undefined') {
    sessionStorage.setItem("ffy.chosenCategory", $("input[name=frontifyfilter_type_selector]").val());
    obtainCloudConfiguration();
  }
});

$("#frontifyfilter_sort_selector").on("change", function (event) {
  if (typeof (event.isTrigger) === 'undefined') {
    obtainCloudConfiguration();
  }
});

$("#frontifysearch").on("change", function (event) {
  //save chosen option
  sessionStorage.setItem("ffy.chosenCategory", $("input[name=frontifyfilter_type_selector]").val());
  resetGlobals();
  obtainCloudConfiguration();
});


$('.frontify-content-panel').on('scroll', function () {
  if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    if (!scrollTriggered) {
      obtainCloudConfiguration();
    }
  }
});

$(".clearFrontifySearch").on("click", function () {
  $("#frontifysearch").val("");
  resetGlobals();
  obtainCloudConfiguration();
});
