# Frontify AEM Connector

[![Maven Central](https://maven-badges.herokuapp.com/maven-central/io.github.frontify/frontify-aem-connector.all/badge.svg)](https://maven-badges.herokuapp.com/maven-central/io.github.frontify/frontify-aem-connector.all)

## Purpose

The Frontify AEM Connector allows to deliver meaningful experiences with digital assets originating from Frontify DAM in Adobe Experience Manager (AEM). The content author searches Frontify image assets directly from AEM pages. Integrated assets are delivered as part of AEM pages and are linked to the Frontify CDN.

## Connector Parts

The Frontify AEM Connector delivers the following parts:

* Cloud Configuration to configure Frontify endpoints in AEM
* Frontify Content Finder Tab
* Frontify API
* Example AEM component to be used directly or to be used as parent or as example for own custom components to use Frontify assets (i.e. a carousel)

## Pre-Requisites

For the Frontify AEM Connector to properly work, the following pre-requisites are required

1. Adobe Experience Manager 6.5 with installed ServicePack 14 or above. Use latest version https://search.maven.org/remotecontent?filepath=io/github/frontify/frontify-aem-connector.all
1. AEM Connector to be installed on AEM
1. Valid Frontify DAM account

The Frontify AEM Connector is tested in the following web browsers for content authoring in Adobe AEM:

* Google Chrome (Evergreen)
* Microsoft Edge (Evergreen)
* Mozilla Firefox (Evergreen)

## AEM Modules

The main parts of the project are:

* core: Java bundle containing all core functionality like OSGi services, listeners or schedulers, as well as component-related Java code such as servlets or request filters.
* ui.apps: contains the /apps (and /etc) parts of the project, ie JS&CSS clientlibs, components, templates, runmode specific configs as well as Hobbes-tests
* ui.content: contains sample content using the components from the ui.apps
* ui.frontend: an optional dedicated front-end build mechanism (Angular, React or general Webpack project)

### How to build

To build all the modules run in the project root directory the following command with Maven 3:

    mvn clean install

If you have a running AEM instance you can build and package the whole project and deploy into AEM with

    mvn clean install -PautoInstallPackage

Or to deploy it to a publish instance, run

    mvn clean install -PautoInstallPackagePublish

Or alternatively

    mvn clean install -PautoInstallPackage -Daem.port=4503

Or to deploy only the bundle to the author, run

    mvn clean install -PautoInstallBundle

### ClientLibs

The frontend module is made available using an [AEM ClientLib](https://helpx.adobe.com/experience-manager/6-5/sites/developing/using/clientlibs.html). When executing the NPM build script, the app is built and the [`aem-clientlib-generator`](https://github.com/wcm-io-frontend/aem-clientlib-generator) package takes the resulting build output and transforms it into such a ClientLib.

A ClientLib will consist of the following files and directories:

* `css/`: CSS files which can be requested in the HTML
* `css.txt` (tells AEM the order and names of files in `css/` so they can be merged)
* `js/`: JavaScript files which can be requested in the HTML
* `js.txt` (tells AEM the order and names of files in `js/` so they can be merged

### Image in Multifield support

Instruction on how enable drag and drop images from Frontify image panel to a multified dialog:

In your custom component dialog use the resource type frontify-aem-connector/components/fileupload

Example:

                                                <images
                                                jcr:primaryType="nt:unstructured"
                                                sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
                                                composite="{Boolean}true"
                                                deleteHint="{Boolean}false">
                                                <field
                                                    jcr:primaryType="nt:unstructured"
                                                    sling:resourceType="granite/ui/components/coral/foundation/container"
                                                    name="./images">
                                                    <items jcr:primaryType="nt:unstructured">
                                                        <file
                                                            jcr:primaryType="nt:unstructured"
                                                            sling:resourceType="frontify-aem-connector/components/fileupload"
                                                            allowUpload="false"
                                                            autoStart="{Boolean}false"
                                                            class="cq-droptarget"
                                                            fileNameParameter="./fileName"
                                                            fileReferenceParameter="./fileReference"
                                                            multiple="{Boolean}false"
                                                            name="./file"
                                                            title="Upload Image Asset"
                                                            uploadUrl="${suffix.path}"
                                                            useHTML5="{Boolean}true"/>
                                                    </items>
                                                </field>
                                            </images>

The properties will be automatically fetch from Frontify:
- title
- focalPoint
- alt

Note: It also supports the standard image from AEM.
