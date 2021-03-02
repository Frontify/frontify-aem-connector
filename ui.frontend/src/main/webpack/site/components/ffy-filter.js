import { GraphQLClient  } from 'graphql-request';

export async function handleUpdateCategoriesList(endpoint, domain, callback) {

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            authorization: 'Bearer ' + localStorage.getItem('FrontifyAuthenticator_token'),
        },
    });

    //Make call to categories

    const query = `{
        brands {
            name,
            projects(types: [MEDIA_LIBRARY]) {
                ...on MediaLibrary {
                id,
                name,
                assetCount
            }
            }
        }
        }
        `;

    var data;

    //cache values
    var localCategories = sessionStorage.getItem("ffy.categories");
    if (localCategories == null || localCategories == undefined) {
        try {
            data = await graphQLClient.request(query);
            } catch (error) {
            $(window).adaptTo("foundation-ui").alert("Error", "Error while executing the search");
        }
        if (data != null || data != undefined) {
            sessionStorage.setItem("ffy.categories", JSON.stringify(data));
            localCategories = JSON.stringify(data);
        } else {
            $(window).adaptTo("foundation-ui").alert("Error", "Error obtaining categories");
        }
    }

    if (localCategories != null && localCategories != undefined) {
        var categoriesListSelectHidden = $("#frontifyfilter_type_selector");

    var entries = JSON.parse(localCategories).brands;
    if ($("#frontifyfilter_type_selector coral-selectlist").children().length == 0 ) {
        for (var brandIndex = 0; brandIndex < entries.length; brandIndex++ ) {
            var brand = entries[brandIndex];
            for (var i = 0; i < brand.projects.length; i++) {
                var item = brand.projects[i];
                categoriesListSelectHidden.append($('<coral-select-item>', {
                    value: item.id,
                    text: brand.name + ' -  ' + item.name
                }));
            }
        }
    }

        if (sessionStorage.getItem("ffy.chosenCategory") != null) {
            var selectedValue = sessionStorage.getItem("ffy.chosenCategory");
            $("#frontifyfilter_type_selector coral-select-item[value='" + sessionStorage.getItem("ffy.chosenCategory") + "']").attr('selected', 'selected');
            $("#frontifyfilter_type_selector coral-select-item[value='" + sessionStorage.getItem("ffy.chosenCategory") + "']").change();
        } else {
            var firstProjectId = JSON.parse(sessionStorage.getItem("ffy.categories")).brands[0].projects[0].id;
            $("#frontifyfilter_type_selector coral-select-item[value='" + firstProjectId + "']").attr('selected', 'selected');
            $("#frontifyfilter_type_selector coral-select-item[value='" + firstProjectId + "']").change();

    }

    callback(endpoint, domain);

    }


}
    