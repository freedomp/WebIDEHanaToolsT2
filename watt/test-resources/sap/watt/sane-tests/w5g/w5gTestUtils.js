define(["sap/watt/lib/lodash/lodash",
	"sap/watt/core/I18nBundle",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ControlMetadata",
	"STF"], function (_, I18nBundle, W5gUtils, ControlMetadata, STF) {
	"use strict";

	sap.watt = sap.watt || {};
	sap.watt.getEnv = sap.watt.getEnv || function () {
			return true;
		};


	function switchToSection(oPropertiesService, index) {
		return oPropertiesService.getFocusElement().then(function (oRoot) {
			var oSection = oRoot.getSections()[index];
			oRoot.openSection(oSection.sId);
			return oSection;
		});
	}

	var w5gTestUtils = {

		oW5G: undefined,
		oScope: undefined,

		placeWysiwygAt: function (sPlaceAt) {
			var sPlace = sPlaceAt || "content";
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg");
			this.oW5G = this.oW5G || new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg();

			this.placeAt(sPlace);
			sap.ui.getCore().applyChanges();

			return this.oW5G;
		},

		/**
		 * Compares the given arrays of messages
		 *
		 * @param {object} oI18n i18n service object
		 * @param {!Array<string>} aSourceMessages Translated messages from NotificationBar control
		 * @param {Array<string>} aDestMessages i18n keys for check
		 * @param {Array<Array<string>>} [aTranslationArguments] Array of arrays. Each element of the top array is the
		 * array of arguments for i18n translation mechanism
		 *
		 * @return {boolean}
		 */
		compareMessages: function (oI18n, aSourceMessages, aDestMessages, aTranslationArguments) {
			aSourceMessages = aSourceMessages || [];
			aDestMessages = aDestMessages || [];
			aTranslationArguments = aTranslationArguments || [];

			var bRes = 1;
			for (var i = 0, len = aDestMessages.length; i < len; i++) {
				bRes &= aSourceMessages[i] === oI18n.getText("i18n", aDestMessages[i], aTranslationArguments[i]);
			}
			return !!bRes;
		},

		placeReadyWysiwygWithDefaultApp: function () {
			return this.placeReadyWysiwygWithSrc("oneViewApp/index.html", "phone", "w5g");
		},

		toFullURL: function (sSrc) {
			return window.webappPath() + "test-resources/sap/watt/sane-tests/w5g/resources/" + sSrc;
		},

		placeAt: function (sPlace, oControl) {
			function setElementVisible(oElement) {
				oElement.style.width = "100%";
				oElement.style.height = "100%";
			}

			function setVisibleByTag(sTagName) {
				setElementVisible(document.getElementsByTagName(sTagName)[0]);
			}

			var div = document.createElement("div");
			div.id = sPlace;
			setElementVisible(div);
			document.body.appendChild(div);
			setVisibleByTag("html");
			setVisibleByTag("body");
			(oControl || this.oW5G).placeAt(sPlace);
		},

		placeReadyWysiwygWithSrc: function (sSrc, sDevice, sPlaceAt) {
			var oReady = Q.defer(),
				sDeviceType = sDevice,
				sPlace = sPlaceAt,
				sAppUrl = this.toFullURL(sSrc),
				that = this;

			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg");
			this.oW5G = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg({
				src: sAppUrl,
				device: sDeviceType
			});
			this.placeAt(sPlace);
			this.oW5G.attachLoaded(function (oEvent) {
				var oWindow = oEvent.getParameter("window");
				oWindow.jQuery.sap.registerModulePath('Fiori', that.toFullURL('oneViewApp'));
				oWindow.jQuery.sap.registerModulePath('sap.watt', window.webappPath() + 'resources/sap/watt');
				var oComponentContainer = new oWindow.sap.ui.core.ComponentContainer("main", {
					height: "100%",
					name: "Fiori"
				});
				oComponentContainer.placeAt("content");
				oWindow.sap.ui.getCore().applyChanges();
				oWindow.jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");
				that.oW5G.$().css({
					"height": "100%",
					"width": "100%"
				});
				oWindow.jQuery.sap.require("sap.ui.dt.DesignTime");
				that.oDesignTime = new oWindow.sap.ui.dt.DesignTime({
					rootElements: [oWindow.sap.ui.getCore().byId("Detail--page")]
				});
				oWindow.sap.ui.getCore().applyChanges();
				that.oScope = {
					getCore: function () {
						return oWindow.sap.ui.getCore();
					},
					getControl: function (sId) {
						return this.getCore().byId(sId);
					},
					getWindow: function () {
						return oWindow;
					},
					jQuery: oWindow.jQuery
				};
				oReady.resolve();
			});
			return oReady.promise;
		},
		cleanupWysiwyg: function () {
			if (this.oDesignTime) {
				this.oDesignTime.destroy();
				this.oDesignTime = null;
			}
			this.oW5G.destroy();
			assert(!jQuery("iframe")[0], "the iframe is destroyed");
			delete this.oW5G;
		},

		getCurrentWindowPatchedDesignTime: function () {
			this.oDesignTime = w5gTestUtils.createDesignTime();
			return this.oDesignTime;
		},

		createDesignTime: function (mSettings) {
			jQuery.sap.require("sap.ui.dt.DesignTime");
			var oDesignTime = new sap.ui.dt.DesignTime(mSettings);
			ControlMetadata.setDesignTime(oDesignTime);
			return oDesignTime;
		},

		getFieldByInnerId: function (sId) {
			return jQuery("[id$='--" + sId + "']").control()[0];
		},

		getNodeFromXMLById: function (sXMLContent, sId) {
			return jQuery(jQuery.parseXML(sXMLContent)).find("[id$='" + sId + "']");
		},

		getAttributeFromXML: function (sXMLContent, sId, sAttribute) {
			return this.getNodeFromXMLById(sXMLContent, sId).attr(sAttribute);
		},

		selectAndRefreshUI: function (oControl, oWysiwygEditorService) {
			return oWysiwygEditorService.selectUI5Control(oControl).then(function () {
				sap.ui.getCore().applyChanges();
			});
		},

		switchToEventsSection: function (oPropertiesService) {
			return switchToSection(oPropertiesService, 0);
		},

		switchToPropertiesSection: function (oPropertiesService) {
			return switchToSection(oPropertiesService, 1);
		},

		getI18n: function () {
			window.sap.watt.getLocale = window.sap.watt.getLocale || function () {
					return "en";
				};
			return new I18nBundle("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor/i18n/i18n");
		},

		/**
		 * performs editor configurations
		 * @param {function} fnGetService the service getter
		 * @param {string} sDefaultEditor default editor ace or ui5wysiwygeditor
		 */
		configureEditor: function (fnGetService, sDefaultEditor) {
			return Q.all([
				fnGetService("commandGroup").$configure("groups", [{"id": "applicationMenu"}]).then(function () {
					return fnGetService("menuBar").$configure("group", "applicationMenu");
				}),
				fnGetService("editor").$configure("defaultEditors", [
					{"extention": "xml", "editorId": sDefaultEditor},
					{"extention": "js", "editorId": sDefaultEditor}
				]),
				fnGetService("editor").$configure("editors", [{
					"fileExtension": ["xml"],
					"service": fnGetService("ui5wysiwygeditor"),
					"name": "Layout Editor",
					"id": "ui5wysiwygeditor"
				}])
			]);
		},

		waitForOverlayToRender: function (oScope, oControl) {
			var oOverlay = oScope.sap.ui.dt.OverlayRegistry.getOverlay(oControl);
			if (oOverlay.getDomRef()) {
				return Q();
			}
			var deferred = Q.defer();
			var oDelegate = {
				onAfterRendering: function () {
					oOverlay.removeEventDelegate(oDelegate);
					deferred.resolve();
				}
			};
			oOverlay.addEventDelegate(oDelegate);
			return deferred.promise;
		},

		/**
		 * Return a promise that is resolved after the given event name is triggered once
		 *
		 * @param {sap.ui.base.EventProvider} eventProvider
		 * @param {string} sEvent
		 * @return {Q}
		 */
		event2Promise: function (eventProvider, sEvent) {
			var deferred = Q.defer();
			var _resolve = function () {
				eventProvider.detachEvent(sEvent, _resolve);
				deferred.resolve();
			};
			eventProvider.attachEvent(sEvent, _resolve);
			return deferred.promise;
		},

		/**
		 * navigate to outline tab, wait for it to render and return a promise to the outline view instance
		 * @param {object} oW5GOutline
		 * @param {object} oWysiwygEditorService
		 * @return {Q<sap.ui.core.mvc.View>}
		 */
		navigateToOutline: function (oW5GOutline, oWysiwygEditorService) {
			return STF.getServicePrivateImpl(oWysiwygEditorService).then(function (oPrivateW5g) {
				return oW5GOutline.getContent().then(function (oOutlineView) {
					if (oOutlineView.getDomRef()) {
						return Q(oOutlineView);
					}
					var q = w5gTestUtils.event2Promise(oOutlineView, "afterRendering");
					oPrivateW5g._oEditorContentLayout.getAggregation("leftPane").setSelectedIndex(1);
					return q.then(function () {
						return oOutlineView;
					});
				});
			});
		},


		initializeBeforeServiceTest: function (oProjectSettings) {
			window["sap-ide-env"] = window["sap-ide-env"] || {};
			window["sap-ide-env"]["base_path"] = "../../../../../../resources/";
			window["sap-ide-env"]["ui5_root"] = window["sap-ide-env"]["ui5_root"].replace("$prefix$", parent.window.W5G_LIBS_PREFIX);

			var oSettings = {
				namespace: "",
				type: "Workspace",
				parentResourceRootUrl: "",
				"/DataBindingTest.view.xml": {
					"entitySet": "SubscriptionCollection"
				},
				"/SetTemplateTest.view.xml": {
					"entitySet": "SubscriptionCollection"
				},
				"/Associations.view.xml": {
					"entitySet": "SalesOrders"
				}
			};

			oProjectSettings.get = oProjectSettings.getProjectSettings = function () {
				return Q(oSettings);
			};
			oProjectSettings.set = oProjectSettings.setProjectSettings = function (srv, dataBinding) {
				oSettings = dataBinding;
				return Q();
			};
			window["sap-ide-env"]["orion_server"] = window.webappPath() + "test-resources";

			return oSettings;
		},

		openDocument: function (oWysiwygService, oDocument) {
			return oWysiwygService.open(oDocument)
				.then(_.bindKey(oDocument, 'getContent'))
				.then(function (sContent) {
					oDocument.__sOldContent = sContent;
					return Q.all([oWysiwygService.getScope(), oWysiwygService.getRoot()]);
				}).spread(function (oScope, oView) {
					return w5gTestUtils.waitForOverlayToRender(oScope, oView);
				}).then(function () {
					sap.ui.getCore().applyChanges();
				});
		},

		closeAndResetDocument: function (oWysiwygService, oDocument) {
			return oWysiwygService.close(oDocument)
				.then(function () {
					return oDocument.setContent(oDocument.__sOldContent);
				});
		},

		getViewFromScope: function (oScope) {
			return oScope.jQuery("[data-sap-ui-area]:not([data-sap-ui-area=sap-ui-static])").uiarea()[0].getContent()[0];
		},

		/**
		 * Given a control overlay, returns the overlay of a child aggregation
		 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - The overlay of the control
		 * @param {string} sAggregationName - The name of the aggregation which its overlay is returned
		 *
		 * @returns {sap.ui.dt.AggregationOverlay}
		 */
		getChildAggregationOverlay: function (oElementOverlay, sAggregationName) {
			return _.find(oElementOverlay.getChildren(), function (oAggOverlay) {
				return oAggOverlay.getAggregationName() === sAggregationName;
			});
		},

		/**
		 *
		 * @param {object} oWysiwygService
		 * @param {object} oDocument
		 * @param {function=} fnBody
		 */
		openDocAndCleanAfter: function (oWysiwygService, oDocument, fnBody) {
			return w5gTestUtils.openDocument(oWysiwygService, oDocument).then(fnBody ? fnBody : _.noop).fin(function () {
				return w5gTestUtils.closeAndResetDocument(oWysiwygService, oDocument);
			});
		},

		/**
		 * @param {boolean=} bShouldKeepFlushEvent indicates whether the flush on design time view changes should be
		 *    kept. Otherwise it is overridden and the test should call flush programmatically.
		 * @param {function} fnGetService
		 * @returns {Q}
		 */
		retrieveDocumentsAndSetupW5G: function (fnGetService, bShouldKeepFlushEvent) {
			var oFakeFileDAO = fnGetService("fakeFileDAO"),
				oFileSystem = fnGetService("filesystem.documentProvider"),
				oWysiwygEditorService = fnGetService("ui5wysiwygeditor");
			return STF.getServicePrivateImpl(oWysiwygEditorService)
				.then(function (_impl) {//_impl is the private implementation
					if (!bShouldKeepFlushEvent) {
						// prevent asynchronous flushes in tests
						_impl._flushWrapper = _.noop;
					}
				}).then(function () {
					return Q.all(["sane-tests/w5g/resources/xmlView/View.view.xml",
						"sane-tests/w5g/resources/xmlView/OtherView.view.xml",
						"sane-tests/w5g/resources/xmlView/DataBindingView.view.xml",
						"sane-tests/w5g/resources/xmlView/RootXMLView.view.xml",
						"sane-tests/w5g/resources/xmlView/LocalNestedXMLView.view.xml",
						"sane-tests/w5g/resources/xmlView/extended/Extended.view.xml",
						"sane-tests/w5g/resources/xmlView/FragmentWithImage.fragment.xml",
						"sane-tests/w5g/resources/xmlView/DataBindingTest.view.xml",
						"sane-tests/w5g/resources/model/metadata.xml",
						"sane-tests/w5g/resources/xmlView/UserMessagesView.view.xml",
						"sane-tests/w5g/resources/xmlView/ViewWithUnsupported.view.xml",
						"sane-tests/w5g/resources/xmlView/SetTemplateTest.view.xml",
						"sane-tests/w5g/resources/xmlView/NestedXMLView.view.xml",
						"sane-tests/w5g/resources/xmlView/DataDependedExpression.view.xml",
						"sane-tests/w5g/resources/xmlView/Associations.view.xml",
						"sane-tests/w5g/resources/xmlView/Events.view.xml",
						"sane-tests/w5g/resources/xmlView/Events.controller.js",
						"sane-tests/w5g/resources/xmlView/EventsSimpleController.view.xml",
						"sane-tests/w5g/resources/xmlView/EventsSimpleController.controller.js",
						"sane-tests/w5g/resources/xmlView/EventsEmptyController.view.xml",
						"sane-tests/w5g/resources/xmlView/EventsEmptyController.controller.js",
						"sane-tests/w5g/resources/xmlView/EmptyView.view.xml"
					].map(function (sPath) {
						return Q(jQuery.ajax({url: require.toUrl(sPath), dataType: "text"}));
					})).spread(
						function (view, otherView, databindingView, rootXMLView, localNestedXMLView, extendedView,
								  fragmentWithImage, databindingTest, metadata, userMessages, unsupportedControlView,
								  setTemplateView, nestedXMLView, dataDependedExpressionView, associationsView, eventsView, eventsController,
								  eventsSimpleView, eventsSimpleController, eventsEmptyView, eventsEmptyController, emptyView) {

							var sBrokenXMLViewContent = '<sap.ui.core.mvc:View controllerName="xmlView.OtherView" xmlns="sap.m"\n'
								+ 'xmlns:sap.ui.core.mvc="sap.ui.core.mvc" >\n'
								+ '<<Page id="page" title="Empty Page">\n'
								+ '<content>\n'
								+ '</content>\n'
								+ '</Page>\n'
								+ '</sap.ui.core.mvc:View>\n';
							var sContainsFragmentXMLViewContent = '<sap.ui.core.mvc:View xmlns="sap.m" controllerName="xmlView.ContainsFragmentView" \n'
								+ 'xmlns:sap.ui.core.mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">\n'
								+ '<Page id="page" title="Empty Page">\n'
								+ '<content>\n'
								+ '<core:Fragment id="fragment0" fragmentName="xmlView.FragmentWithImage" type="XML" />\n'
								+ '</content>\n'
								+ '</Page>\n'
								+ '</sap.ui.core.mvc:View>\n';
							var sFragmentXMLViewContent = '<Button xmlns="sap.ui.commons" id="btnInFragment" text="Hello World"/>';
							var sViewWithNonStandardNamespaceContent = '<sap.ui.core.mvc:View controllerName="xmlView.ViewWithNonStandardNamespaceContent" \n'
								+ 'xmlns:m="sap.m"\n'
								+ 'xmlns:sap.ui.core.mvc="sap.ui.core.mvc" >\n'
								+ '<m:Page id="page" title="Empty Page">\n'
								+ '</m:Page>\n'
								+ '</sap.ui.core.mvc:View>\n';
							return oFakeFileDAO.setContent({
								"xmlView": {
									"View.view.xml": view,
									"View.controller.js": 'sap.ui.controller("xmlView.View", {})',
									"OtherView.view.xml": otherView,
									"OtherView.controller.js": 'sap.ui.controller("xmlView.OtherView", {})',
									"BrokenView.view.xml": sBrokenXMLViewContent,
									"BrokenView.controller.js": 'sap.ui.controller("xmlView.BrokenView", {})',
									"DataBindingView.view.xml": databindingView,
									"DataBindingView.controller.js": 'sap.ui.controller("xmlView.DataBindingView", {})',
									"UserMessagesView.view.xml": userMessages,
									"UserMessagesView.controller.js": 'sap.ui.controller("xmlView.UserMessagesView", {})',
									"ViewWithUnsupported.view.xml": unsupportedControlView,
									"ViewWithUnsupported.controller.js": 'sap.ui.controller("xmlView.ViewWithUnsupported", {})',
									"SetTemplateTest.view.xml": setTemplateView,
									"FragmentView.fragment.xml": sFragmentXMLViewContent,
									"FragmentView.controller.js": 'sap.ui.controller("xmlView.FragmentView", {})',
									"ContainsFragmentView.view.xml": sContainsFragmentXMLViewContent,
									"ContainsFragmentView.controller.js": 'sap.ui.controller("xmlView.ContainsFragmentView", {})',
									"ViewWithNonStandardNamespaceContent.view.xml": sViewWithNonStandardNamespaceContent,
									"ViewWithNonStandardNamespaceContent.controller.js": 'sap.ui.controller("xmlView.ViewWithNonStandardNamespaceContent", {})',
									"index.html": "<script data-sap-ui-resourceroots='{\"xmlView\": \"./\" , \"xmlView2\": \"" + sap.watt.getEnv("orion_server") + "/sap/watt/sane-tests/w5g/resources/xmlView/\"}'/>",
									"RootXMLView.view.xml": rootXMLView,
									"RootXMLView.controller.js": 'sap.ui.controller("xmlView.RootXMLView", {})',
									"LocalNestedXMLView.view.xml": localNestedXMLView,
									"LocalNestedXMLView.controller.js": 'sap.ui.controller("xmlView.LocalNestedXMLView", {})',
									"FragmentWithImage.fragment.xml": fragmentWithImage,
									"DataBindingTest.view.xml": databindingTest,
									"NestedXMLView.view.xml": nestedXMLView,
									"NestedXMLView.controller.js": 'sap.ui.controller("xmlView.NestedXMLView", {})',
									"DataDependedExpression.view.xml": dataDependedExpressionView,
									"EmptyView.controller.js": 'sap.ui.controller("xmlView.EmptyView", {})',
									"EmptyView.view.xml": emptyView,
									extended: {
										"Extended.view.xml": extendedView
									},
									"model": {
										"metadata.xml": metadata
									},
									"Associations.view.xml": associationsView,
									"Associations.controller.js": 'sap.ui.controller("xmlView.Associations", {})',
									"Events.view.xml": eventsView,
									"Events.controller.js": eventsController,
									"EventsSimpleController.view.xml": eventsSimpleView,
									"EventsSimpleController.controller.js": eventsSimpleController,
									"EventsEmptyController.view.xml": eventsEmptyView,
									"EventsEmptyController.controller.js": eventsEmptyController
								}
							});
						}).then(
						function () {
							return Q.all(
								[oFileSystem.getDocument("/xmlView/View.view.xml"),
									oFileSystem.getDocument("/xmlView/View.controller.js"),
									oFileSystem.getDocument("/xmlView/OtherView.view.xml"),
									oFileSystem.getDocument("/xmlView/BrokenView.view.xml"),
									oFileSystem.getDocument("/xmlView/DataBindingView.view.xml"),
									oFileSystem.getDocument("/xmlView/FragmentView.fragment.xml"),
									oFileSystem.getDocument("/xmlView/ContainsFragmentView.view.xml"),
									oFileSystem.getDocument("/xmlView/FragmentView.view.xml"),
									oFileSystem.getDocument("/xmlView/ViewWithNonStandardNamespaceContent.view.xml"),
									oFileSystem.getDocument("/xmlView"),
									oFileSystem.getDocument("/xmlView/RootXMLView.view.xml"),
									oFileSystem.getDocument("/xmlView/LocalNestedXMLView.view.xml"),
									oFileSystem.getDocument("/xmlView/extended/Extended.view.xml"),
									oFileSystem.getDocument("/xmlView/FragmentWithImage.fragment.xml"),
									oFileSystem.getDocument("/xmlView/DataBindingTest.view.xml"),
									oFileSystem.getDocument("/xmlView/model/metadata.xml"),
									oFileSystem.getDocument("/xmlView/UserMessagesView.view.xml"),
									oFileSystem.getDocument("/xmlView/ViewWithUnsupported.view.xml"),
									oFileSystem.getDocument("/xmlView/SetTemplateTest.view.xml"),
									oFileSystem.getDocument("/xmlView/NestedXMLView.view.xml"),
									oFileSystem.getDocument("/xmlView/DataDependedExpression.view.xml"),
									oFileSystem.getDocument("/xmlView/Associations.view.xml"),
									oFileSystem.getDocument("/xmlView/Events.view.xml"),
									oFileSystem.getDocument("/xmlView/Events.controller.js"),
									oFileSystem.getDocument("/xmlView/EmptyView.view.xml"),
									oFileSystem.getDocument("/xmlView/EventsSimpleController.view.xml"),
									oFileSystem.getDocument("/xmlView/EventsEmptyController.view.xml"),
									oFileSystem.getDocument("/xmlView/model")
								]).spread(function (oDoc1, oDoc2, oDoc3, oDoc4, oDoc5, oDoc6, oDoc7, oDoc8, oDoc9,
													oDoc10, oDoc11, oDoc12, oDoc13, oDoc14, oDoc15, oDoc16, oDoc17,
													oDoc18, oDoc19, oDoc20, oDoc21, oDoc22, oDoc23, oDoc24, oDoc25,
													oDoc26, oDoc27, oDoc28) {
								_.forEach(arguments, function (oDocument) {
									if (oDocument) {
										oDocument.getEntity().getBackendData().location = "/sap/watt/sane-tests/w5g/resources";
									}
								});
								oDoc10.getEntity().getBackendData().location = "/sap/watt/sane-tests/w5g/resources/xmlView/";
								return oWysiwygEditorService.getContent().then(function (oEditorContent) {
									oEditorContent.placeAt("content");
									return {
										oViewDoc: oDoc1,
										oViewController: oDoc2,
										oOtherViewDoc: oDoc3,
										oBrokenViewDoc: oDoc4,
										oDatabindingViewDoc: oDoc5,
										oFragmentViewDoc: oDoc6,
										oContainsFragmentViewDoc: oDoc7,
										oViewWithNonStandardNamespaceContent: oDoc9,
										oViewFolder: oDoc10,
										oRootXMLViewDoc: oDoc11,
										oLocalNestedXMLViewDoc: oDoc12,
										oExtendedViewWithControlInParent: oDoc13,
										oFragmentWithImageDoc: oDoc14,
										oDataBindingTestViewDoc: oDoc15,
										oMetadataXmlDoc: oDoc16,
										oUserMessagesViewDoc: oDoc17,
										oViewWithUnsupportedControl: oDoc18,
										oSetTemplateTestDoc: oDoc19,
										oNestedXMLView: oDoc20,
										oDataDependedExpression: oDoc21,
										oAssociationsView: oDoc22,
										oEventsView: oDoc23,
										oEventsController: oDoc24,
										oEmptyView: oDoc25,
										oEventsSimpleCtrlView: oDoc26,
										oEventsEmptyCtrlView: oDoc27,
										oModelDir: oDoc28
									};
								});
							});
						});
				});

		},

		createViewWithFragmentAndNestedView: function () {

			var oView = sap.ui.view({
				viewContent: "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\r\n" +
				"    <Page id=\"detailPage\" title=\"Roomba\">\r\n" +
				"        <content>\r\n" +
				"			<Button text=\"Button\" id=\"btn0\"/>\r\n" +
				"        </content>\r\n" +
				"    </Page>\r\n" +
				"</mvc:View>",
				type: sap.ui.core.mvc.ViewType.XML
			});

			var oFragmentXMl =
				"<core:FragmentDefinition xmlns=\"sap.m\" xmlns:l=\"sap.ui.layout\" xmlns:core=\"sap.ui.core\" xmlns:sap.ui.layout.form=\"sap.ui.layout.form\">" +
				"	<sap.ui.layout.form:SimpleForm xmlns:sap.ui.layout.form=\"sap.ui.layout.form\" editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"__fragment_form0\">" +
				"		<sap.ui.layout.form:content>" +
				"			<core:Title text=\"Fragment\" id=\"__fragment_title0\"/>" +
				"			<Label text=\"Label 1\" id=\"__fragment_label0\"/>" +
				"			<Input width=\"100%\" id=\"__fragment_input0\"/>" +
				"			<Input width=\"100%\" id=\"__fragment_input1\"/>" +
				"			<Label text=\"Label 2\" id=\"__fragment_label1\"/>" +
				"			<Input width=\"100%\" id=\"__fragment_input2\"/>" +
				"		</sap.ui.layout.form:content>" +
				"	</sap.ui.layout.form:SimpleForm>" +
				"</core:FragmentDefinition>";

			var oFragment = sap.ui.xmlfragment({fragmentContent: oFragmentXMl});
			oFragment.__FragmentName = "fragName";
			var oPage = oView.byId("detailPage");
			oPage.addContent(oFragment);

			var oNestedView = sap.ui.view({
				viewContent: "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\r\n" +
				"	<f:SimpleForm xmlns:sap.ui.layout.form=\"sap.ui.layout.form\" editable=\"false\" id=\"__nested_form0\">" +
				"		<f:content>" +
				"			<core:Title text=\"NestedView\" id=\"__nested_title0\"/>" +
				"			<Label text=\"Label 1\" id=\"__nested_label0\"/>" +
				"			<Input width=\"100%\" id=\"__nested_input0\"/>" +
				"			<Input width=\"100%\" id=\"__nested_input1\"/>" +
				"			<Label text=\"Label 2\" id=\"__nestedt_label1\"/>" +
				"			<Input width=\"100%\" id=\"__nested_input2\"/>" +
				"		</f:content>" +
				"	</f:SimpleForm>" +
				"</mvc:View>",
				type: sap.ui.core.mvc.ViewType.XML
			});
			oPage.addContent(oNestedView);

			return oView;
		},

		createViewWithOutlineControls: function () {

			var oView = sap.ui.view({
				viewContent: "<mvc:View xmlns:core=\"sap.ui.core\" xmlns:html=\"http://www.w3.org/1999/xhtml\" xmlns:sap.suite.ui.commons=\"sap.suite.ui.commons\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" xmlns:sap.uxap=\"sap.uxap\">\r\n" +
				"    <Page id=\"page1\" title=\"Welcome\">\r\n" +
				"        <content>\r\n" +
				"			<Button text=\"Button\" id=\"btn0\"/>\r\n" +
				"			<sap.suite.ui.commons:HeaderContainer id=\"__container0\">" +
				" 				<sap.suite.ui.commons:items>" +
				"					<Button class=\"sapSuiteHrdrCntrInner\" text=\"Button\" width=\"100px\" id=\"__button0\"/>" +
				"				</sap.suite.ui.commons:items>" +
				"			</sap.suite.ui.commons:HeaderContainer>" +
				"			<sap.uxap:ObjectPageHeader xmlns:sap.uxap=\"sap.uxap\" id=\"__header0\">" +
				" 				<sap.uxap:navigationBar>" +
				"					<Bar id=\"__bar0\">" +
				"						<customData>" +
				"							<core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\" id=\"__data1\"/> " +
				"						</customData>" +
				"						<contentLeft>" +
				"							<Button text=\"Button\" width=\"100px\" id=\"__button1\"/>" +
				"						</contentLeft>" +
				"					</Bar>" +
				"				</sap.uxap:navigationBar>" +
				"			</sap.uxap:ObjectPageHeader>" +
				"        </content>\r\n" +
				"    </Page>\r\n" +
				"</mvc:View>",
				type: sap.ui.core.mvc.ViewType.XML
			});

			return oView;
		},

		/**
		 * Bind property using a Property Binding Dialog
		 * @param {string} sAttribute - attribute name , which is going to be bond
		 * @param {string} sBinding - The name of value from appropriate model's values list
		 * @param {chai.assert} oAssert - assert object from chai library to verify expectation
		 * @param {boolean=} isAppend - (optional) whether the only new value will be applied or the new value will be appended to existed one
		 *
		 * @returns
		 */
		bindPropertyUsingDialog: function (sAttribute, sBinding, oAssert, isAppend) {
			var aPropDataBindingButton = jQuery("[id$='--" + sAttribute + "']").next();
			oAssert.equal(aPropDataBindingButton.length, 1);
			aPropDataBindingButton.trigger("click");
			if (!isAppend) {
				var clearBtn = jQuery(".sapWysiwygDialog button:contains('Clear')");
				oAssert.equal(clearBtn.length, 1);
				clearBtn.trigger("click");
			}
			var aPropertyToBind = jQuery('li:contains("' + sBinding + '")');
			oAssert.equal(aPropertyToBind.length, 1);
			aPropertyToBind.dblclick();
			var ok = jQuery(".sapWysiwygDialog button:contains('OK')");
			oAssert.equal(ok.length, 1);
			ok.trigger("click");
		},

		/**
		 * Editor for DT plugins that imitate the wysiwyg editor. It only select the underneath control (while w5g does more)
		 */
		DummySelectorEditor: {
			selectUI5Control: function (oControl) {
				var oOverlay = W5gUtils.getControlOverlay(oControl, window);
				oOverlay.setSelected(true);
				return Q();
			}
		}
	};

	return w5gTestUtils;
});
