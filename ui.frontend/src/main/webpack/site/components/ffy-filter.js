import { GraphQLClient  } from 'graphql-request';

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
    var localLibraries = sessionStorage.getItem("ffy.libraries");
    if (localLibraries == null || localLibraries == undefined) {
        try {
            data = await graphQLClient.request(query);
            } catch (error) {
            $(window).adaptTo("foundation-ui").alert("Error", "Error while executing the search");
        }
        if (data != null || data != undefined) {
            sessionStorage.setItem("ffy.libraries", JSON.stringify(data));
            localLibraries = JSON.stringify(data);
        } else {
            $(window).adaptTo("foundation-ui").alert("Error", "Error obtaining libraries");
        }
    }

    if (localLibraries != null && localLibraries != undefined) {
        var librariesListSelectHidden = $("#frontifyfilter_library_selector");

    var entries = JSON.parse(localLibraries).brands;
    if ($("#frontifyfilter_library_selector coral-selectlist").children().length == 0 ) {
        for (var brandIndex = 0; brandIndex < entries.length; brandIndex++ ) {
            var brand = entries[brandIndex];
            for (var i = 0; i < brand.projects.length; i++) {
                var item = brand.projects[i];
                librariesListSelectHidden.append($('<coral-select-item>', {
                    value: item.id,
                    text: brand.name + ' -  ' + item.name
                }));
            }
        }
    }

        if (sessionStorage.getItem("ffy.chosenLibrary") != null) {
            var selectedValue = sessionStorage.getItem("ffy.chosenLibrary");
            $("#frontifyfilter_library_selector coral-select-item[value='" + sessionStorage.getItem("ffy.chosenLibrary") + "']").attr('selected', 'selected');
            $("#frontifyfilter_library_selector coral-select-item[value='" + sessionStorage.getItem("ffy.chosenLibrary") + "']").change();
        } else {
            var firstProjectId = JSON.parse(sessionStorage.getItem("ffy.libraries")).brands[0].projects[0].id;
            $("#frontifyfilter_library_selector coral-select-item[value='" + firstProjectId + "']").attr('selected', 'selected');
            $("#frontifyfilter_library_selector coral-select-item[value='" + firstProjectId + "']").change();

    }

    callback(endpoint, domain);

    }


}
