import { handleUpdateCategoriesList } from './ffy-filter.js';
import { obtainCloudConfiguration } from './ffy-dam-author-panel.js';

function obtainCloudConfigurationForAuth () {

    return $.ajax({
        url: "/bin/ffyconfig",
        method: "GET",
        data: {
            "uri": window.location.pathname.replace("/editor.html", "")
        }
    });
}


$("#frontifylogin").on("click", function (event) {

    obtainCloudConfigurationForAuth().then(
        function (data) {
            const endpoint = data.endPoint;
            const domain = data.domain;
            FrontifyAuthenticator.authorize({
                auth: {
                  clientId: 'aem',
                  redirectUri: '/connection/aem',
                  scopes: ['basic:read']
                },
                settings: {
                    popup: {
                      title: 'Frontify Authenticator Popup',
                      size: {
                        width: 800,
                        height: 600,
                      },
                      position: {
                        x: 50,
                        y: 50,
                      },
                    },
                },
                domain: domain,
                success: function(authClient) {
                    $('.frontify-login-panel').hide();
                    $('.frontify-logout-panel').show();
                    $('.frontify-filter-panel').show();
                    $('.frontifyfinder').show();
                    obtainCloudConfiguration();
                },
                cancel: function() {
                    console.log('Authenticator cancelled!');
                },
                error: function(info) {
                    console.log(info);
                },
                warning: function(info) {
                    console.log(info);
                }          
              });
                    
        });


});

$("#frontifylogout").on("click", function (event) {

    localStorage.removeItem("FrontifyAuthenticator_token");
    $('.frontify-logout-panel').hide();
    $('.frontify-filter-panel').hide();
    $('.frontifyfinder').hide();
    location.reload();

});


