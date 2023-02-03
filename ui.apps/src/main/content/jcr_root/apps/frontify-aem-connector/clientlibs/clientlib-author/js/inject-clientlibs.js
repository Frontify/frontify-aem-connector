/*
With this Script we are injecting the Frontify Authoring Clientlibs on Author.
We need to do it like that as Google Closure Compiler is having issues with already minified scripts
when adding those directly to cq.authoring.dialog clientlib. Options to disable gcc will not help as other clientlibs
of same category have minification turned on.
 */

// That's the library we need to authenticate. As this is already minified we simply just load it from resources
const ffyAuthenticatorScript = document.createElement("script");
ffyAuthenticatorScript.type = "text/javascript"
ffyAuthenticatorScript.src = "/etc.clientlibs/frontify-aem-connector/clientlibs/clientlib-author/resources/frontify-authenticator-latest.min.js"
document.head.appendChild(ffyAuthenticatorScript)

const clientLibScript = document.createElement("script");
clientLibScript.type = "text/javascript"
clientLibScript.src = "/etc.clientlibs/frontify-aem-connector/clientlibs/clientlib-site.js"
document.head.appendChild(clientLibScript)

const clientLibCss = document.createElement("link");
clientLibCss.rel = "stylesheet"
clientLibCss.href = "/etc.clientlibs/frontify-aem-connector/clientlibs/clientlib-site.css"
document.head.appendChild(clientLibCss)
