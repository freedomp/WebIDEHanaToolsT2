define(['STF',
		"sap/watt/core/q", "sane-tests/util/RepositoryBrowserUtil",
		"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/replaceviewcomponent/ReplaceViewComponent", "sap/watt/lib/jszip/jszip-shim"],
	function (STF, coreQ, repositoryBrowserUtil, replaceViewComponent, JSZip) {

		"use strict";

		var sPathToZip = "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/replaceviewcomponent/ReplaceViewTemplate.zip";
		var sZipURL = require.toUrl(sPathToZip);
		var oTemplateZip = null;
		var model = null;
		var oContext = null;

		var prepareContext = function() {
			oContext = {};
			oContext.service = {};
			oContext.service.extensionproject = {};
			oContext.service.extensionproject.getExtensionRevision = function () {
				return coreQ(0);
			};

			oContext.service.filesystem = {};
			oContext.service.filesystem.documentProvider = {};
			oContext.service.filesystem.documentProvider.getDocument = function () {
				return coreQ({});
			};

			oContext.service.ui5projecthandler = {};
			oContext.service.ui5projecthandler.getHandlerDocument = function () {
				var fileDocument = {};

				fileDocument.getEntity = function () {
					var getType = function () {
						return "file";
					};

					var getName = function () {
						return "manifest.json";
					};

					var getFullPath = function () {
						return "/App1/manifest.json";
					};

					return {
						getType: getType,
						getName: getName,
						getFullPath: getFullPath
					};
				};
				return coreQ(fileDocument);
			};

			oContext.service.ui5projecthandler.getAllExtensions = function () {
				return coreQ([]);
			};

			oContext.service.parentproject = {};
			oContext.service.parentproject.getDocument = function() {
				var fileDocument = {};
				fileDocument.getContent = function() {
					var oDeferred = Q.defer();
					oDeferred.resolve("<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\" controllerName=\"Flights.view.Detail\" xmlns:sap.ui.unified=\"sap.ui.unified\"><Page id=\"detailPage\" navButtonPress=\"onNavBack\" title=\"{i18n&gt;detailTitle}\" showNavButton=\"{device&gt;/isPhone}\"><content><ObjectHeader id=\"detailHeader\" title=\"{connid}\" number=\"{carrid}\" numberUnit=\"{CURRENCY}\" introActive=\"false\" titleActive=\"false\" iconActive=\"false\"><attributes id=\"detailAttributes\"><ObjectAttribute id=\"attribute\" text=\"{i18n&gt;detailText}\" active=\"false\"></ObjectAttribute></attributes><firstStatus id=\"detailStatus\"><ObjectStatus id=\"status\" text=\"{flightDetails/airportFrom}\"></ObjectStatus></firstStatus></ObjectHeader><sap.ui.unified:Calendar xmlns:sap.ui.unified=\"sap.ui.unified\" id=\"__calendar0\"><sap.ui.unified:customData><core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\" id=\"__data4\"/></sap.ui.unified:customData></sap.ui.unified:Calendar><sap.ui.unified:CalendarLegend xmlns:sap.ui.unified=\"sap.ui.unified\" id=\"__legend0\"/><IconTabBar id=\"idIconTabBar\" expanded=\"{device&gt;/isNoPhone}\"><items id=\"detailsItems\"><IconTabFilter id=\"iconTabFilter1\" key=\"selfInfo\" icon=\"sap-icon:\/\/hint\"><content><f:SimpleForm id=\"iconTabFilter1form\" minWidth=\"1024\" editable=\"false\" layout=\"ResponsiveGridLayout\" labelSpanL=\"3\" labelSpanM=\"3\" emptySpanL=\"4\" emptySpanM=\"4\" columnsL=\"1\"><f:content><Label id=\"label1\" text=\"flightDetails/airportTo\"></Label><Text id=\"text1\" text=\"{flightDetails/airportTo}\" maxLines=\"0\"></Text><Label id=\"label2\" text=\"flightDetails/arrivalTime\"></Label><Text id=\"text2\" text=\"{flightDetails/arrivalTime}\" maxLines=\"0\"></Text><Label id=\"label3\" text=\"flightDetails/distance\"></Label><Text id=\"text3\" text=\"{flightDetails/distance}\" maxLines=\"0\"></Text><core:ExtensionPoint name=\"extIconTabFilterForm1\"/></f:content></f:SimpleForm></content></IconTabFilter><IconTabFilter id=\"iconTabFilter2\" key=\"FlightCarrier\" icon=\"sap-icon:\/\/enter-more\"><content><f:SimpleForm id=\"iconTabFilter2form\" minWidth=\"1024\" editable=\"false\" layout=\"ResponsiveGridLayout\" labelSpanL=\"3\" labelSpanM=\"3\" emptySpanL=\"4\" emptySpanM=\"4\" columnsL=\"1\"><f:content><Label id=\"label4\" text=\"CARRNAME\"></Label><Text id=\"text4\" text=\"{CARRNAME}\" maxLines=\"0\"></Text><Label id=\"label5\" text=\"CURRCODE\"></Label><Text id=\"text5\" text=\"{CURRCODE}\" maxLines=\"0\"></Text><Label id=\"label6\" text=\"URL\"></Label><Text id=\"text6\" text=\"{URL}\" maxLines=\"0\"></Text><core:ExtensionPoint name=\"extIconTabFilterForm2\"/></f:content></f:SimpleForm></content></IconTabFilter><core:ExtensionPoint name=\"extIconTabFilter\"/></items></IconTabBar><core:ExtensionPoint name=\"extDetail\"/></content><footer id=\"detailFooter\"><Toolbar id=\"detailToolbar\"><content><ToolbarSpacer id=\"toolbarSpacer\"></ToolbarSpacer><Button id=\"actionButton\" press=\"openActionSheet\" icon=\"sap-icon:\/\/action\"></Button></content></Toolbar></footer></Page></mvc:View>");
					return oDeferred.promise;
				};
				return coreQ(fileDocument);
			};
		};

		var prepareModel = function() {
			model = {
				"extensibility" : {
					"component" : "/Flights/Component.js",
					"namespace" : "Flights",
					"parentResourceRootUrl" : "../Flights",
					"resourceBundle" : "i18n/messageBundle.properties",
					"type" : "Workspace",
					"controllers" : {
						"App": "/Flights/view/App.controller.js",
						"Detail": "/Flights/view/Detail.controller.js",
						"Master": "/Flights/view/Master.controller.js",
						"NotFound": "/Flights/view/NotFound.controller.js"
					},
					"views" : {
						"App": "/Flights/view/App.view.xml",
						"Detail": "/Flights/view/Detail.view.xml",
						"Master": "/Flights/view/Master.view.xml",
						"NotFound": "/Flights/view/NotFound.view.xml"
					},
					"fragments" : {}
				},
				"extensionProjectName" : "FlightsExtension",
				"extensionProjectPath" : "/FlightsExtension",
				"extensionResourceLocationPath" : "webapp/",
				"fiori" : {
					"extensionCommon" : {
						"extensionId": "Empty view",
						"resourceId": "Flights.view.Detail",
						"resourceLocationPath": "webapp/view/",
						"resourceName": "Detail",
						"selectedDocumentPath": "/Flights/view/Detail.view.xml"
					},
					"replaceView" : {}
				},
				"resources" : [
					{
						"id": "Flights.view.Master",
						"name": "Master",
						"parentNamespace": "Flights",
						"path": "/Flights/view/Master.view.xml",
						"resourceLocationPath": "view/",
						"type": "views"
					},
					{
						"id": "Flights.view.NotFound",
						"name": "NotFound",
						"parentNamespace": "Flights",
						"path": "/Flights/view/NotFound.view.xml",
						"resourceLocationPath": "view/",
						"type": "views"
					},
					{
						"id": "Flights.view.Detail",
						"name": "Detail",
						"parentNamespace": "Flights",
						"path": "/Flights/view/Detail.view.xml",
						"resourceLocationPath": "view/",
						"type": "views"
					},
					{
						"id": "Flights.view.App",
						"name": "App",
						"parentNamespace": "Flights",
						"path": "/Flights/view/App.view.xml",
						"resourceLocationPath": "view/",
						"type": "views"
					}
				]
			};
		};

		var prepareTemplateZip = function() {
			return coreQ.sap.ajax(sZipURL, {
				responseType: "arraybuffer"
			}).then(function (ajaxRes) {
				oTemplateZip = new JSZip(ajaxRes[0]);
			});
		};

		describe('Replace View Extension', function () {

			before(function (done) {

				prepareContext();
				replaceViewComponent.setContext(oContext);

				prepareModel();

				prepareTemplateZip().then(function() {
					done();
				});
			});

			it("Replace Details View with Empty: test onBeforeReplaceViewGenerate", function (done) {

				return replaceViewComponent.onBeforeReplaceViewGenerate(oTemplateZip, model).then(function () {
					var prefix = "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\" controllerName=\"Flights.view.Detail\" xmlns:sap.ui.unified=\"sap.ui.unified\">";
					var suffix = "</mvc:View>";
					expect(model.fiori.replaceView.parentAttributesPrefix).to.equal(prefix);
					expect(model.fiori.replaceView.parentAttributesSuffix).to.equal(suffix);
					expect(oTemplateZip.files.hasOwnProperty("EmptyView.xml.tmpl")).to.equal(true);
					expect(oTemplateZip.files.hasOwnProperty("ParentView.xml.tmpl")).to.equal(false); // this file was removed from the zip
					done();
				});
			});

			it("Replace Details View with Copy of Original View: test onBeforeReplaceViewGenerate", function (done) {

				prepareModel(); // reset the model as it was changed in previous test
				model.fiori.extensionCommon.extensionId = "Parent view"; // set the extension id

				return prepareTemplateZip().then(function() { // reset the template zip
					return replaceViewComponent.onBeforeReplaceViewGenerate(oTemplateZip, model).then(function () {
						var parentViewContent = "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\" controllerName=\"Flights.view.Detail\" xmlns:sap.ui.unified=\"sap.ui.unified\"><Page id=\"detailPage\" navButtonPress=\"onNavBack\" title=\"{i18n&gt;detailTitle}\" showNavButton=\"{device&gt;/isPhone}\"><content><ObjectHeader id=\"detailHeader\" title=\"{connid}\" number=\"{carrid}\" numberUnit=\"{CURRENCY}\" introActive=\"false\" titleActive=\"false\" iconActive=\"false\"><attributes id=\"detailAttributes\"><ObjectAttribute id=\"attribute\" text=\"{i18n&gt;detailText}\" active=\"false\"></ObjectAttribute></attributes><firstStatus id=\"detailStatus\"><ObjectStatus id=\"status\" text=\"{flightDetails/airportFrom}\"></ObjectStatus></firstStatus></ObjectHeader><sap.ui.unified:Calendar xmlns:sap.ui.unified=\"sap.ui.unified\" id=\"__calendar0\"><sap.ui.unified:customData><core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\" id=\"__data4\"/></sap.ui.unified:customData></sap.ui.unified:Calendar><sap.ui.unified:CalendarLegend xmlns:sap.ui.unified=\"sap.ui.unified\" id=\"__legend0\"/><IconTabBar id=\"idIconTabBar\" expanded=\"{device&gt;/isNoPhone}\"><items id=\"detailsItems\"><IconTabFilter id=\"iconTabFilter1\" key=\"selfInfo\" icon=\"sap-icon:\/\/hint\"><content><f:SimpleForm id=\"iconTabFilter1form\" minWidth=\"1024\" editable=\"false\" layout=\"ResponsiveGridLayout\" labelSpanL=\"3\" labelSpanM=\"3\" emptySpanL=\"4\" emptySpanM=\"4\" columnsL=\"1\"><f:content><Label id=\"label1\" text=\"flightDetails/airportTo\"></Label><Text id=\"text1\" text=\"{flightDetails/airportTo}\" maxLines=\"0\"></Text><Label id=\"label2\" text=\"flightDetails/arrivalTime\"></Label><Text id=\"text2\" text=\"{flightDetails/arrivalTime}\" maxLines=\"0\"></Text><Label id=\"label3\" text=\"flightDetails/distance\"></Label><Text id=\"text3\" text=\"{flightDetails/distance}\" maxLines=\"0\"></Text><core:ExtensionPoint name=\"extIconTabFilterForm1\"/></f:content></f:SimpleForm></content></IconTabFilter><IconTabFilter id=\"iconTabFilter2\" key=\"FlightCarrier\" icon=\"sap-icon:\/\/enter-more\"><content><f:SimpleForm id=\"iconTabFilter2form\" minWidth=\"1024\" editable=\"false\" layout=\"ResponsiveGridLayout\" labelSpanL=\"3\" labelSpanM=\"3\" emptySpanL=\"4\" emptySpanM=\"4\" columnsL=\"1\"><f:content><Label id=\"label4\" text=\"CARRNAME\"></Label><Text id=\"text4\" text=\"{CARRNAME}\" maxLines=\"0\"></Text><Label id=\"label5\" text=\"CURRCODE\"></Label><Text id=\"text5\" text=\"{CURRCODE}\" maxLines=\"0\"></Text><Label id=\"label6\" text=\"URL\"></Label><Text id=\"text6\" text=\"{URL}\" maxLines=\"0\"></Text><core:ExtensionPoint name=\"extIconTabFilterForm2\"/></f:content></f:SimpleForm></content></IconTabFilter><core:ExtensionPoint name=\"extIconTabFilter\"/></items></IconTabBar><core:ExtensionPoint name=\"extDetail\"/></content><footer id=\"detailFooter\"><Toolbar id=\"detailToolbar\"><content><ToolbarSpacer id=\"toolbarSpacer\"></ToolbarSpacer><Button id=\"actionButton\" press=\"openActionSheet\" icon=\"sap-icon:\/\/action\"></Button></content></Toolbar></footer></Page></mvc:View>";
						expect(model.fiori.replaceView.parentViewContent).to.equal(parentViewContent);
						expect(oTemplateZip.files.hasOwnProperty("ParentView.xml.tmpl")).to.equal(true);
						expect(oTemplateZip.files.hasOwnProperty("EmptyView.xml.tmpl")).to.equal(false); // this file was removed from the zip
						done();
					});
				});
			});
		});
	});
