/****************************************************************************************************************
 * UIContent - a service exposes the public API of the extensibility pane and is used for opening / closing the pane, 
 * as well as performing operations from the outline commands.
 *
 * The service is responsible for creating the UI of the pane (iFrame with the application preview, and outline)
 * and managing its logic.
 * 
 * For creating the UI of the outline tree and filtering as well as managing its logic - the UI content is delegating
 * the responsibility into ExtensionProjectTree. The UI content can get from the selected node in the tree its model data,
 * but for read-only purposes (for manipulating the UI in the UI Content responsibility). 
 * Any tree UI / model creation and manipulation must be done only in the ExtensionProjectTree component.
 *
 * In future, this service should be implemented with MVC concepts (while the whole outline UI should be moved into a separate view with controller).
 *
 ****************************************************************************************************************/
define(["../outline/ExtensionProjectTree",
		"../outline/MessageHandler",
		"../util/ExtendUtil"], function(ExtensionProjectTree, MessageHandler, ExtendUtil) {

	var extendUtil = null;
	var extendGridLayout = null;
	var filterOptionsDropdownBox = null;
	var oRemoveExtButton = null;
	var oExtensionCodeItem = null;
	var oLayoutEditorItem = null;
	var oContext = null;
	var oContextMenuGroup = null;
	var oMyCustomLayout = null;
	var extProjTree = null;
	var oExtOptionsMenuButton = null;
	var frameUrl = null;
	var displayElement = null;
	var refreshDialog = false;
	var extensibilityPaneOpened = false;
	var isFirstRun = true;
	var messageHandler = null;
	var statusMessage = null;
	var dialog = null;
	var isRunWithMock = null;
	var extensionProjectDocument = null;
	var extensibilityModel = null;
	var oSplitterV = null;
	var oContainer = null;
	var sActionOrigin = null;

	this.mExtensionTypes = ExtendUtil.EXTENSION_TYPES;

	this.mReportTypes = {
		FROM_BUTTON : "from_button",
		FROM_OUTLINE : "from_right_click_on_outline",
		FROM_APPLICATION : "from_right_click_on_application"
	};

	var that = this;

	var _configure = function(mConfig) {
		if (mConfig.contextMenu) {
			return this.context.service.commandGroup.getGroup(mConfig.contextMenu).then(function(oGroup) {
				oContextMenuGroup = oGroup;
			});
		}
	};

	var _showProgress = function(sMessage, iValue, bWithoutProgress) {
		return that.oContext.service.dialogprogress.show(sMessage, bWithoutProgress).then(function() {
			return _setProgress(iValue);
		});
	};

	var _setProgress = function(iValue) {
		return that.oContext.service.dialogprogress.setProgress(iValue || 0);
	};

	var _hideProgress = function() {
		return that.oContext.service.dialogprogress.hide();
	};

	var _isExtensibilityOpen = function() {
		return extensibilityPaneOpened;
	};

	/**
	 * Load and open the Extensibilty Pane
	 * @returns {Object} - The promise chain responsible for loading the Extensibility Pane
	 * @private
	 */
	var _open = function() {
		var sLoadingMessage = that.oContext.i18n.getText("VisualExt_ProgressMessage");
		return _showProgress(sLoadingMessage, 20).then(function() {


			var documentation;
			return that.oContext.service.ui5projecthandler.getHandlerFilePath(extensionProjectDocument).then(function (sHandlerFilePath) {
				extensibilityModel.extensionHandlerPath = sHandlerFilePath;
				return extensibilityModel.extensibility.BSPName ? ExtendUtil.getFioriAppExtensionsDocumentation(extensibilityModel.extensibility.BSPName) : undefined;
			}).then(function(_documentation) {
				documentation = _documentation;
			}).fail(function() {
				that.oContext.service.log.info("Extensibility Pane", that.oContext.i18n.getText("VisualExt_AppDocFailedLogMessage"), ["user"]).done();
				//documentation will be undefined and that's OK
			}).finally(function() {
				var oDocumentationMap = documentation ? documentation.map : undefined;
				extProjTree = new ExtensionProjectTree(that.oContext, extensionProjectDocument, extensibilityModel, oDocumentationMap);

				if (extensibilityPaneOpened) {
					return;
				} else {
					extensibilityPaneOpened = true;
				}

				// create UI (Trees) with content
				return extProjTree.createContent().then(function(oContent) {
					extProjTree.attachRightClickHandler(onRightClick);
					extProjTree.attachTreeSelectionHandler(onNodeSelectChanged);

					messageHandler = {};
					return _setProgress(30).then(function() {
						return createUi(that.oContext, documentation ? documentation.url : undefined, oContent);
					});
				}).fail(function(oError) {
					extensibilityPaneOpened = false;
					return _hideProgress().then(function() {
						return that.oContext.service.usernotification.warning(oError.message);
					});
				});
			});
		}).fail(function(oError) {
			return _hideProgress().then(function() {
				return that.oContext.service.usernotification.warning(oError.message);
			});
		});
	};

	/*
	 *  The method exposed by the UIContent service for opening the Extensibility Pane, initializes variables, performs
	 *  authentication to HCP if needed and calls usage monitoring.
	 */
	var _openVisualExt = function(context, extProjectDocument, extModel, isMock) {
		that.oContext = context;
		var oPromise;
		if (isFirstRun) {
			oPromise = that.oContext.service.usagemonitoring.startPerf("extensibility", "open_extensibility_pane");
		} else {
			oPromise = that.oContext.service.usagemonitoring.startPerf("extensibility", "open_cached_ext_pane");
		}

		extensibilityModel = extModel;
		extensionProjectDocument = extProjectDocument;
		isRunWithMock = isMock;

		return oPromise.then(function () {

			var hcpExtensibilityService = {
				getProxyMetadata: function() {
					return {
						getName: function() {
							return "extensibility"; // the block name
						}
					};
				}
			};

			// get the extensibility block from the .project,json
			return that.oContext.service.setting.project.get(hcpExtensibilityService, extensionProjectDocument).then(function(oExt) {
				if (oExt && oExt.type && oExt.type === "hcp") {
					//first make the authentication in dialog
					return that.oContext.service.hcpauthentication.authenticate().then(function() {
						return _open().then(function () {
							if (isFirstRun) {
								isFirstRun = false;
								return that.oContext.service.usagemonitoring.report("extensibility", "open_extensibility_pane", "open");
							} else {
								return that.oContext.service.usagemonitoring.report("extensibility", "open_cached_ext_pane", "open");
							}
						});
					}).fail(function(oError) {
						if (oError.message !== "Authentication_Cancel") {
							throw new Error(oError.message);
						}
					});
				} else {
					return _open().then(function () {
						if (isFirstRun) {
							isFirstRun = false;
							return that.oContext.service.usagemonitoring.report("extensibility", "open_extensibility_pane", "open");
						} else {
							return that.oContext.service.usagemonitoring.report("extensibility", "open_cached_ext_pane", "open");
						}
					});
				}
			}).fail(function(oError) {
				if (oError.message === "INVALID_JSON_FORMAT") {
					// the project json is not valid
					throw new Error(that.context.i18n.getText("i18n", "Command_invalidProjectJson"));
				}
			});
		});
	};

	// Append url parameters and/or hash fragment from run configuration into the given URL
	// Returns an updated URL, or the same, if there is no applicable info from run configurations
	var _appendRunConfigurationInfoToIframeUrl = function(sRawUrl) {
		return ExtendUtil.getRunConfigurationInfo(that.oContext, extensionProjectDocument).then(function(oUri) {
			var oUpdatedUri = new URI(sRawUrl);
			// If we got information from run confniguration
			if (oUri) {
				// Get the parameters from the configuration
				var oUrlParameters = oUri.search(true);	
				var aKeys = Object.keys(oUrlParameters);
				for (var i = 0; i < aKeys.length; i++) {
					var sParamName = aKeys[i];
					var sParamValue = oUrlParameters[sParamName];
					// Add to the raw URL
					oUpdatedUri.addSearch(sParamName, sParamValue);
				}
				
				// Add the hash fragment - if it exist in the configuration AND it doesn't exist in the raw URL
				var sHashFromConfiguration = oUri.hash();
				if (!oUpdatedUri.hash() && sHashFromConfiguration) {
					oUpdatedUri.hash(sHashFromConfiguration);
				}
			}
			return oUpdatedUri.toString();
		});
	};
	
	// Update the value of sap-ui-xx-componentPreload automatically added when using buildHtml method in preview API
	// This to improve performace while loading parent project resources in the extensbility pane (by loading the ComponentPreload.js file if exists)
	var _enableComponentPreloadInIframeUrl = function(sRawUrl) {
		var oUpdatedUri = URI(sRawUrl);
		oUpdatedUri.removeSearch("sap-ui-xx-componentPreload");
		oUpdatedUri.addSearch("sap-ui-xx-componentPreload", "async");
		return oUpdatedUri.toString();
	};

	/*
	 * Creates the UI.
	 */
	var createUi = function(context, sExtensibilityDocumentationURL, oContent) {
		return _setProgress(50).then(function() {
			oContainer = sap.ui.getCore().byId("ExtensionPreviewContainer");

			if (oContainer !== undefined) {
				oContainer.destroy();
			}

			sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.project.fioriexttemplate/visualExt/ui/css/Preview.css"));

			// OverlayContainer
			oContainer = new sap.ui.ux3.OverlayContainer("ExtensionPreviewContainer", {
				openButtonVisible: false
			}).addStyleClass("wizardBodyVisualExt");

			// The filter grid layout and the tree are created by the ExtensionProjectTree

			// Create the extending Vertical Layout
			createExtendGridLayout(sExtensibilityDocumentationURL);

			createMyCustomLayout(oContent);

			//attachEventHandlers(that.oTree);
			var oApp = new sap.ui.core.HTML();

			var updateDTTree = {
				onAfterRendering: function(wattSrc) {
					$('#previewApp').load(function() {
						try {
							$(this).contents();
						} catch (e) {
							return;
						}
						// when the preview iframe is loaded, find the app iframe element (its id is "display")
						// check if the iFrame has an event handler for messages ("this" is the iFrame)
						displayElement = $(this).contents().find("#display");
						displayElement.on("load", function() {
							var target = this.src;
							// TODO: The following "if" statement is a temporary patch until preview server on local installation is fixed
							if (sap.watt.getEnv("server_type") === "java" || sap.watt.getEnv("server_type") === "local_hcproxy") {
								target = "*";
							}

							if (!that.messageHandler) {
								// we now add the domains of the preview iframe and the actual application iframe to the message handler,
								// with the application iframe as the only destination for the messages.
								var origins = [];
								origins.push(wattSrc);
								origins.push(this.src);
								var oHandlers = {
									hover : onHover,
									select : onSelectFromApp,
									contextMenu : onRightClickOnApp,
									clear : clearTree
								};
								that.messageHandler = new MessageHandler(this, origins, target, oHandlers, context);
							}
							// In case we refresh the application, deactivate "Extensibility Mode" from Ext. Pane
							that.$("#previewApp").contents().find("div#UNLOCK_UI").click();

							extProjTree.clearSelection();

							this.contentWindow.postMessage('INITIALIZE', target);

							// get all extension points of the application and set them in JSON format to transceiver.js
							var allExtensionPoints = extProjTree.getAllExtensionPoints();
							try {
								this.contentWindow.postMessage("EXTENSION_POINTS" + JSON.stringify(allExtensionPoints), target);
							} catch(oError) {
								context.service.log.info("Extensibility Pane", "Could not locate extension points", ["user"]).done();
							}
						});
					});
				}
			};

			// create the dialog for after extension
			dialog = new sap.ui.commons.Dialog({
				title: that.oContext.i18n.getText("i18n", "VisualExt_ApplicationChanged"),
				resizable: false,
				width: "760px",
				modal: true
			});

			dialog.insertButton(new sap.ui.commons.Button({
				text: that.oContext.i18n.getText("i18n", "command_goToCode"),
				press: function() {
					dialog.close();
					dialog.removeAllContent();
					_openExtensionCodeOfSelectedElement(false).done();
				},
				tooltip: that.oContext.i18n.getText("i18n", "ExtPane_Dialog_OpenExtensionCode_Tooltip")
			}), 0);

			dialog.insertButton(new sap.ui.commons.Button({
				text: that.oContext.i18n.getText("i18n", "DialogAfterExtension_Refresh"),
				press: function() {
					//Refresh the application in preview pane
					displayElement.attr("src", displayElement.attr("src"));

					// disable the "Open" menu button if there's no selection in the tree
					var oGoToCodeMenuButton = sap.ui.getCore().byId("goToCodeButton");
					oGoToCodeMenuButton.setEnabled(false);

					// disable the "Extend" menu button if there's no selection in the tree
					var oExtendMenuButton = sap.ui.getCore().byId("extOptionsMenuButton");
					oExtendMenuButton.setEnabled(false);

					dialog.close();
					dialog.removeAllContent();
				},
				tooltip: that.oContext.i18n.getText("i18n", "ExtPane_Dialog_YesButton_Tooltip")
			}), 1);

			dialog.insertButton(new sap.ui.commons.Button({
				text: that.oContext.i18n.getText("i18n", "DialogAfterExtension_Close"),
				press: function() {
					dialog.close();
					dialog.removeAllContent();
				},
				tooltip: that.oContext.i18n.getText("i18n", "ExtPane_Dialog_NoButton_Tooltip")
			}), 2);

			dialog.insertButton(new sap.ui.commons.Button({
				text: that.oContext.i18n.getText("i18n", "OK"),
				press: function() {
					dialog.close();
					dialog.removeAllContent();
				}
			}), 3);

			return _setProgress(70).then(function() {
				return createiFrame(context).then(function(iFrame) {
					oApp.addDelegate(updateDTTree);
					oApp.setContent(iFrame);

					// create main splitter
					createVerticalSplitter(oApp, oMyCustomLayout);

					oContainer.addContent(oSplitterV);

					oContainer.attachClose(function() {
						if (that.messageHandler) {
							that.messageHandler.detachHandler();
						}
						that.messageHandler = null;

						if (oContainer !== undefined) {
							oContainer.close();
						}

						extensibilityPaneOpened = false;

						if (oSplitterV) {
							oSplitterV.destroy();
						}
					});
					return _setProgress(85).then(function() {
						oContainer.open();

						// Enable component preload loading for performance improvement
						frameUrl = _enableComponentPreloadInIframeUrl(frameUrl);
						// Append url parameters and hash from configuration (if exist)
						return _appendRunConfigurationInfoToIframeUrl(frameUrl).then(function(sUpdatedUrl) {
							frameUrl = sUpdatedUrl;
							
							// After the container is loaded, replace the dummy iframe with the preview frame
							var frame = document.createElement("iframe");
							frame.setAttribute("src", frameUrl);
							frame.setAttribute("style", "border : none;");
							frame.setAttribute("id", "previewApp");
							frame.setAttribute("height", "100%");
							frame.setAttribute("width", "100%");
							var oldIframe = $("#previewApp").replaceWith(frame);
							oldIframe = null;

							var origin = this.location.origin || this.location.href;
							updateDTTree.onAfterRendering(origin);

							return that.oContext.service.preview.showPreview(frameUrl, $("#previewApp")[0].contentWindow, false, {
								"ExtDropDown": {
									"id": "ExtDropDown",
									"default": "UNLOCK_UI",
									"items": {
										"UNLOCK_UI": {
											"label": that.oContext.i18n.getText("i18n", "VisualExt_PreviewMode")
										},
										"LOCK_UI": {
											"label": that.oContext.i18n.getText("i18n", "VisualExt_ExtensibilityMode")
										}
									}
								}
							}).then(function () {
								return _setProgress(100).then(function() {
									return _hideProgress();
								});
							});
						});
					});
				});
			});
		});
	};

	var createMyCustomLayout = function(oContent) {

		sap.ui.core.Control.extend("my.Layout", {

			metadata: {

				aggregations: {

					"top": {
						"type": "sap.ui.core.Control",
						"multiple": false
					},

					"middle": {
						"type": "sap.ui.core.Control",
						"multiple": false
					},

					"bottom": {
						"type": "sap.ui.core.Control",
						"multiple": false
					}
				}
			},

			renderer: function(oRM, oControl) {

				// inline styles should normally be avoided and classes
				// should be used to layout and position controls

				oRM.write("<div ");
				oRM.writeControlData(oControl);
				oRM.addClass("extPane filesearch");
				oRM.writeClasses();
				oRM.addStyle("position", "relative");
				oRM.addStyle("height", "100%");
				oRM.addStyle("width", "100%");
				oRM.writeStyles();
				oRM.write(">");

				oRM.write("<div ");
				oRM.addStyle("position", "absolute");
				oRM.addStyle("width", "95%");
				oRM.addStyle("background-color", "#FAF9F7");
				oRM.addStyle("margin-right", "8px");
				oRM.addStyle("margin-left", "8px");
				oRM.addStyle("top", "80px");
				oRM.addStyle("bottom", "160px");
				oRM.writeStyles();

				oRM.write("><div ");
				oRM.addStyle("height", "100%");
				oRM.writeStyles();
				oRM.write(">");
				if (oControl.getMiddle()) {
					oRM.renderControl(oControl.getMiddle());
				}
				oRM.write("</div></div>");

				oRM.write("<div ");
				oRM.addStyle("position", "absolute");
				oRM.addStyle("top", "0");
				oRM.addStyle("height", "80px");
				oRM.addStyle("width", "100%");

				oRM.writeStyles();
				oRM.write(">");
				if (oControl.getTop()) {
					oRM.renderControl(oControl.getTop());
				}
				oRM.write("</div>");

				oRM.write("<div ");
				oRM.addStyle("position", "absolute");
				oRM.addStyle("bottom", "0");
				oRM.addStyle("height", "160px");
				oRM.addStyle("width", "100%");
				oRM.addStyle("overflow", "auto");
				oRM.writeStyles();
				oRM.write(">");
				if (oControl.getBottom()) {
					oRM.renderControl(oControl.getBottom());
				}
				oRM.write("</div>");
				oRM.write("</div>");
			}
		});

		oMyCustomLayout = new my.Layout({
			top: oContent.top,
			middle: oContent.middle,
			bottom: extendGridLayout
		});
	};

	/*
	 * Create the grid layout of the extending line.
	 */
	var createExtendGridLayout = function(sExtensibilityDocumentationURL) {

		// Status message TextView
		statusMessage = new sap.ui.commons.TextView({
			text: "No control is selected",
			width: "100%",
			wrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("statusMessage");

		// "Possible Extensions" label
		var extensionLabel = new sap.ui.commons.TextView({
			text: that.oContext.i18n.getText("i18n", "VisualExt_PossibleExtensions"),
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L11 M11 S11",
				linebreak: true
			})
		}).addStyleClass("label");

		//Extension options menu button
		oExtOptionsMenuButton = new sap.ui.commons.MenuButton("extOptionsMenuButton", {
			text: that.oContext.i18n.getText("i18n", "VisualExt_ExtOptionsMenuButton"),
			tooltip: that.oContext.i18n.getText("i18n", "VisualExt_ExtOptionsTooltip"),
			enabled: false
		}).addStyleClass("extendButton flatControlSmall");
		var oExtOptionsMenu = new sap.ui.commons.Menu();
		oExtOptionsMenuButton.setMenu(oExtOptionsMenu);

		// Extend button
		oRemoveExtButton = sap.ui.getCore().byId("removeExtBtn");
		if (oRemoveExtButton === undefined) {
			oRemoveExtButton = new sap.ui.commons.Button("removeExtBtn", {
				text: that.oContext.i18n.getText("i18n", "VisualExt_RemoveExtensionButton"),
				tooltip: that.oContext.i18n.getText("i18n", "VisualExt_RemoveExtensionTooltip"),
				enabled: false
			}).addStyleClass("removeExtBtn flatControlSmall");
		}
		oRemoveExtButton.attachPress(_removeExtensionFromSelectedElement, this);

		var oGoToCodeMenuButton = new sap.ui.commons.MenuButton("goToCodeButton", {
			text: that.oContext.i18n.getText("i18n", "VisualExt_GoToCode"),
			tooltip: that.oContext.i18n.getText("i18n", "VisualExt_GoToCodeTooltip"),
			enabled: false
		}).addStyleClass("extendButton flatControlSmall");

		// create the menu
		var oMenu = new sap.ui.commons.Menu();
		// add menu options
		oLayoutEditorItem = new sap.ui.unified.MenuItem("openLayoutEditorItem", {
			text: that.oContext.i18n.getText("i18n", "VisualExt_OpenLayoutEditor"),
			tooltip: that.oContext.i18n.getText("i18n", "VisualExt_openLayoutEditorTooltip"),
			enabled: false,
			select: [onOpenLayoutEditorClick, this]
		});
		oMenu.addItem(oLayoutEditorItem);

		oExtensionCodeItem = new sap.ui.unified.MenuItem("goToExtensionCodeItem", {
			text: that.oContext.i18n.getText("i18n", "VisualExt_GoToExtensionCode"),
			tooltip: that.oContext.i18n.getText("i18n", "VisualExt_GoToCodeTooltip"),
			enabled: false,
			select: [onGoToCodeClick, this]
		});
		oMenu.addItem(oExtensionCodeItem);

		var oParentCodeItem = new sap.ui.unified.MenuItem("goToParentCodeItem", {
			text: that.oContext.i18n.getText("i18n", "VisualExt_GoToParentCode"),
			tooltip: that.oContext.i18n.getText("i18n", "VisualExt_GoToCodeTooltip"),
			enabled: true,
			select: [_openOriginalCodeOfSelectedElement, this]
		});

		oMenu.addItem(oParentCodeItem);
		oGoToCodeMenuButton.setMenu(oMenu);

		var oExtendHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			width: "100%",
			content: [oExtOptionsMenuButton, oRemoveExtButton, oGoToCodeMenuButton]
		});

		var extendGridLayoutContent;

		if (sExtensibilityDocumentationURL) {
			var oExtensibilityDocLink = new sap.ui.commons.Link({
				text: that.oContext.i18n.getText("i18n", "ExtDocumentation_LinkText"),
				tooltip: that.oContext.i18n.getText("i18n", "ExtDocumentation_LinkTooltipText"),
				target: "_blank",
				href: sExtensibilityDocumentationURL
			}).addStyleClass("extDocumentationLink");
			oExtensibilityDocLink.setLayoutData(new sap.ui.layout.GridData({
				span: "L11 M11 S11",
				linebreak: true
			}));
			extendGridLayoutContent = [statusMessage, oExtendHorizontalLayout, oExtensibilityDocLink];
		} else {
			extendGridLayoutContent = [statusMessage, oExtendHorizontalLayout];
		}

		// Extend Grid Layout
		extendGridLayout = sap.ui.getCore().byId("ExtendGridLayout");
		if (extendGridLayout === undefined) {
			extendGridLayout = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L11 M11 S11",
					linebreak: true
				}),
				content: extendGridLayoutContent
			});
		}

		extendGridLayout.setVSpacing(0);
	};

	/*
	 * Create the vertical splitter that holds the horizontal splitter and the outline
	 */
	var createVerticalSplitter = function(firstPane, secondPane) {
		// vertical Splitter
		oSplitterV = sap.ui.getCore().byId("splitterV");
		if (oSplitterV === undefined) {
			oSplitterV = new sap.ui.commons.Splitter("splitterV");
			oSplitterV.setSplitterOrientation(sap.ui.commons.Orientation.vertical);
			oSplitterV.setSplitterPosition("73%");
			oSplitterV.setWidth("100%");
			oSplitterV.setHeight("100%");
			oSplitterV.addStyleClass("splitter");
		}
		oSplitterV.setShowScrollBars(false);
		oSplitterV.addFirstPaneContent(firstPane);
		oSplitterV.addSecondPaneContent(secondPane);
	};

	var onSelectFromApp = function (sResourceId, sControlId, sType) {
		extProjTree.selectTreeElement(sResourceId, sControlId, sType);
		sActionOrigin = that.mReportTypes.FROM_APPLICATION;
	};

	var onRightClick = function(oEvent, oSelectedNode) {
		var oNodeModel = oSelectedNode.getBindingContext().getObject();
		if (!oNodeModel.isRoot) {
			// open context menu only if the selected element isn't a root element
			sActionOrigin = that.mReportTypes.FROM_OUTLINE;
			that.oContext.service.contextMenu.open(oContextMenuGroup, oEvent.pageX, oEvent.pageY).done();
		}
	};

	/*
	 * handle 'open extension code' click - opesn the relevant file according to the selected resource type (extension)
	 */
	var onGoToCodeClick = function() {
		_openExtensionCodeOfSelectedElement(false).done();
	};

	/*
	 * handle 'open layout editor' click - open the relevant file in the layout editor
	 */
	var onOpenLayoutEditorClick = function() {
		_openExtensionCodeOfSelectedElement(true).done();
	};

	var setPaneToBusy = function() {
		// disable all buttons in the pane before beginning add/remove flow
		var oGoToCodeMenuButton = sap.ui.getCore().byId("goToCodeButton");
		oGoToCodeMenuButton.setEnabled(false);

		var oExtendMenuButton = sap.ui.getCore().byId("extOptionsMenuButton");
		oExtendMenuButton.setEnabled(false);

		var oRemoveExtButton = sap.ui.getCore().byId("removeExtBtn");
		oRemoveExtButton.setEnabled(false);

		oContainer.setBusy(true);
	};

	var closeBusyIndicator = function () {
		oContainer.setBusy(false);
	};

	var report = function(oNodeModel, isAdded, sExtensionType) {
		if (isAdded === true) { //added an extension
			switch (sExtensionType) {
				case that.mExtensionTypes.REPLACE_VIEW_WITH_EMPTY:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_with_empty_view" + "_" + sActionOrigin).done();
					break;
				case that.mExtensionTypes.REPLACE_VIEW_WITH_COPY:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_with_copy_of_original_view" + "_" + sActionOrigin).done();
					break;

				case that.mExtensionTypes.EXTEND_VIEW:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "extend_extension_point" + "_" + sActionOrigin).done();
					break;

				case that.mExtensionTypes.EXTEND_CONTROLLER_WITH_EMPTY:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_with_empty_controller" + "_" + sActionOrigin).done();
					break;

				case that.mExtensionTypes.EXTEND_CONTROLLER_WITH_COPY:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_with_copy_of_original_controller" + "_" + sActionOrigin).done();
					break;

				case that.mExtensionTypes.EXTEND_CONTROLLER_HOOK:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "implement_controller_hook" + "_" + sActionOrigin).done();
					break;

				case that.mExtensionTypes.HIDE_CONTROL:
					that.oContext.service.usagemonitoring.report("extensibility", "add_extension", "hide_control" + "_" + sActionOrigin).done();
			}
		} else { //removed an extension
			switch (oNodeModel.type) {
				case ExtendUtil.EXT_TYPE_VIEW: // 'replace view'
					that.oContext.service.usagemonitoring.report("extensibility", "remove_extension", "remove_view_extension" + "_" + sActionOrigin).done();
					break;

				case ExtendUtil.EXT_TYPE_EXT_POINT:
					that.oContext.service.usagemonitoring.report("extensibility", "remove_extension", "remove_extension_point" + "_" + sActionOrigin).done();
					break;

				case ExtendUtil.EXT_TYPE_CONTROLLER:
					that.oContext.service.usagemonitoring.report("extensibility", "remove_extension", "remove_controller_extension" + "_" + sActionOrigin).done();
					break;

				case ExtendUtil.EXT_TYPE_HOOK:
					that.oContext.service.usagemonitoring.report("extensibility", "remove_extension", "remove_controller_hook" + "_" + sActionOrigin).done();
					break;

				default: // an extensible element we can hide
					that.oContext.service.usagemonitoring.report("extensibility", "remove_extension", "remove_hide_extension" + "_" + sActionOrigin).done();
			}
		}
	};

	var handleAddExtensionMessage = function(nodeModel, componentName, newComponentName, sExtensionType) {
		var message;
		var extensionType;

		switch (sExtensionType) {
			case that.mExtensionTypes.REPLACE_VIEW_WITH_COPY:
				refreshDialog = false;
				extensionType = that.oContext.i18n.getText("i18n", "VisualExt_ReplacedSuccess", ['"' + newComponentName + '"', nodeModel.type]);
				message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionAdded", ['"' + componentName + '"', nodeModel.type, extensionType]);
				break;

			case that.mExtensionTypes.REPLACE_VIEW_WITH_EMPTY: // 'replace view'
				refreshDialog = true;
				extensionType = that.oContext.i18n.getText("i18n", "VisualExt_ReplacedSuccess", ['"' + newComponentName + '"', nodeModel.type]);
				message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionAdded", ['"' + componentName + '"', nodeModel.type, extensionType]);
				break;

			case that.mExtensionTypes.EXTEND_VIEW:
				refreshDialog = false;
				extensionType = that.oContext.i18n.getText("i18n", "VisualExt_ExtendedSuccess");
				message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionAdded", ['"' + componentName + '"', "extension point", extensionType]);
				break;

			case that.mExtensionTypes.EXTEND_CONTROLLER_WITH_COPY:
			case that.mExtensionTypes.EXTEND_CONTROLLER_WITH_EMPTY:
				refreshDialog = false;
				extensionType = that.oContext.i18n.getText("i18n", "VisualExt_ExtendedSuccessBy", ['"' + newComponentName + '"', nodeModel.type]);
				message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionAdded", ['"' + componentName + '"', nodeModel.type, extensionType]);
				break;

			case that.mExtensionTypes.EXTEND_CONTROLLER_HOOK:
				refreshDialog = true;
				extensionType = that.oContext.i18n.getText("i18n", "VisualExt_ExtendedSuccess");
				message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionAdded", ['"' + componentName + '"', "extension hook", extensionType]);
				break;

			default: // an extensible element we can hide
				refreshDialog = true;
				extensionType = that.oContext.i18n.getText("i18n", "VisualExt_HiddenSuccess");
				message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionAdded", ['"' + componentName + '"', "control", extensionType]);
		}

		return message;
	};

	var handleRemoveExtensionMessage = function(nodeModel, componentName, newComponentName) {
		var message;

		if (nodeModel.type === ExtendUtil.EXT_TYPE_VIEW || nodeModel.type === ExtendUtil.EXT_TYPE_CONTROLLER) {
			message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionRemoved", ['"' + newComponentName + '"', nodeModel.type]);
		} else if (nodeModel.type === ExtendUtil.EXT_TYPE_EXT_POINT) {
			message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionRemoved", ['"' + componentName + '"', "extension point"]);
		} else {
			message = that.oContext.i18n.getText("i18n", "VisualExt_ExtensionRemoved", ['"' + componentName + '"', "control"]);
		}

		return message;
	};

	var displayExtensionMessage = function(oNodeModel, isAdded, sExtensionType) {
		var componentName;
		var newComponentName;
		if (oNodeModel.type === ExtendUtil.EXT_TYPE_VIEW || oNodeModel.type === ExtendUtil.EXT_TYPE_CONTROLLER) {
			componentName = oNodeModel.resourceInfo.originalName || oNodeModel.resourceInfo.name;
			newComponentName = oNodeModel.resourceInfo.newResourceName;
		} else if (oNodeModel.type === ExtendUtil.EXT_TYPE_EXT_POINT) {
			componentName = oNodeModel.attributes.name;
		} else if (oNodeModel.type === ExtendUtil.EXT_TYPE_HOOK) {
			componentName = oNodeModel.attributes.id;
		} else {
			componentName = oNodeModel.attributes.id;
		}

		var finalMessage;
		if (isAdded === true) {
			// case of new extension added
			finalMessage = handleAddExtensionMessage(oNodeModel, componentName, newComponentName, sExtensionType);
			// show the "Go to Extension Code" button
			dialog.getButtons()[0].setVisible(true);
		} else {
			// case of removing an extension
			finalMessage = handleRemoveExtensionMessage(oNodeModel, componentName, newComponentName);
			// always offer to refresh the application in case of 'Remove Extension'
			refreshDialog = true;
			// hide the "Go to Extension Code" button
			dialog.getButtons()[0].setVisible(false);
		}

		var oExtensionText = new sap.ui.commons.Label({
			text: finalMessage,
			width: "100%"
		});

		dialog.addContent(oExtensionText);

		// if this extension was added and it's replacing a view/controller - add more text
		if ((isAdded === true) && (oNodeModel.type === ExtendUtil.EXT_TYPE_VIEW || oNodeModel.type === ExtendUtil.EXT_TYPE_CONTROLLER)) {

			var oImportantText = new sap.ui.commons.Label({
				text: that.oContext.i18n.getText("i18n", "AddExtensionMessage_Important") + " ",
				design: sap.ui.commons.LabelDesign.Bold
			});

			dialog.addContent(oImportantText);

			var oImplicationText = new sap.ui.commons.Label({
				wrapping: true
			}).addStyleClass("implicationTextAfterExtension");

			switch (sExtensionType) {
				case that.mExtensionTypes.REPLACE_VIEW_WITH_COPY:
					oImplicationText.setText(that.oContext.i18n.getText("i18n", "ReplaceViewWithCopy_Implication", ['"' + newComponentName + '"', '"' + componentName + '"']));
					break;

				case that.mExtensionTypes.REPLACE_VIEW_WITH_EMPTY:
					oImplicationText.setText(that.oContext.i18n.getText("i18n", "ReplaceViewWithEmpty_Implication", ['"' + newComponentName + '"', '"' + componentName + '"']));
					break;

				case that.mExtensionTypes.EXTEND_CONTROLLER_WITH_COPY:
					oImplicationText.setText(that.oContext.i18n.getText("i18n", "ReplaceControllerWithCopy_Implication", ['"' + newComponentName + '"', '"' + componentName + '"']));
					break;

				case that.mExtensionTypes.EXTEND_CONTROLLER_WITH_EMPTY:
					oImplicationText.setText(that.oContext.i18n.getText("i18n", "ReplaceControllerWithEmpty_Implication", ['"' + newComponentName + '"', '"' + componentName + '"']));
					break;

				default:
					oImplicationText.setText("");
					dialog.removeContent(oImportantText);
			}

			dialog.addContent(oImplicationText);
			
			var oLink = new sap.ui.commons.Link({
				text: that.oContext.i18n.getText("i18n", "AddExtensionMessage_ImplicationsLink"),
				target: "_blank",
				href: "https://sapui5.hana.ondemand.com/sdk/#docs/guide/aef3384510724522a07df94ec90d1351.html"
			}).addStyleClass("implicationLinkAfterExtension");
			
			dialog.addContent(oLink);
		}

		if (refreshDialog) {
			dialog.getButtons()[1].setVisible(true); // show Yes button
			dialog.getButtons()[2].setVisible(true); // show No button
			dialog.getButtons()[3].setVisible(false); // hide OK button
		} else {
			// no need to suggest refresh
			dialog.getButtons()[1].setVisible(false); // hide Yes button
			dialog.getButtons()[2].setVisible(false); // hide No button
			dialog.getButtons()[3].setVisible(true); // show OK button
		}

		dialog.open();
	};

	var onAddExtension = function(oEvent, oData) {
		sActionOrigin = that.mReportTypes.FROM_BUTTON;
		_extendSelectedElement(oData.type).done();
	};

	/*
	 * Disable the ability to remove 'view replacement' and 'controller' extensions from Extensibility Pane until the refactoring is done.
	 */
	var handleRemoveExtButton = function(oSelectedNodeModel) {
		var nodeType = oSelectedNodeModel.type;
		if (nodeType === ExtendUtil.EXT_TYPE_VIEW || nodeType === ExtendUtil.EXT_TYPE_CONTROLLER) {
			oRemoveExtButton.setEnabled(false);
		} else {
			oRemoveExtButton.setEnabled(ExtendUtil.isExtendedByNode(oSelectedNodeModel));
		}
	};

	var handleExtendedNode = function(oNodeModel) {
		if (extensibilityPaneOpened === true) {
			if (oNodeModel.isExtended === true) {
				oExtensionCodeItem.setEnabled(true);
				if (oNodeModel.type === ExtendUtil.EXT_TYPE_VIEW || oNodeModel.type === ExtendUtil.EXT_TYPE_EXT_POINT) {
					oLayoutEditorItem.setEnabled(true);
				}
				oExtOptionsMenuButton.getMenu().removeAllItems();
				populateExtensionsMenuButton(oNodeModel);
			} else {
				populateExtensionsMenuButton(oNodeModel);
				oExtensionCodeItem.setEnabled(false);
				oLayoutEditorItem.setEnabled(false);
			}
		}
	};

	/*
	 * The method that called when a node is selected.
	 */
	var onNodeSelectChanged = function(oEvent, oSelectedNode) {
		sActionOrigin = that.mReportTypes.FROM_OUTLINE;
		var oGoToCodeMenuButton = sap.ui.getCore().byId("goToCodeButton");
		
		if (!oSelectedNode) {
			oGoToCodeMenuButton.setEnabled(false);
			oExtOptionsMenuButton.setEnabled(false);
			oRemoveExtButton.setEnabled(false);
			populateExtensionsMenuButton(null);
			updatePreview(null);
			return;
		}
		
		var oNodeModel = oSelectedNode.getBindingContext().getObject();
		
		handleRemoveExtButton(oNodeModel);
		oGoToCodeMenuButton.setEnabled(true);

		statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_NodeIsSelected", [oSelectedNode.getText()]));

		if (oNodeModel.isRoot) { // root element
			oGoToCodeMenuButton.setEnabled(false);
			oExtOptionsMenuButton.setEnabled(false);
			populateExtensionsMenuButton(null);
			return;
		}

		if (oNodeModel.resourceInfo.type === "fragment" && oNodeModel.type !== "extensionpoint") {
			oExtOptionsMenuButton.setEnabled(false); // disable extension options for fragments and their elements (except for extension points in fragments)
			return;
		}

		updatePreview(oNodeModel);
		handleExtendedNode(oNodeModel);

	};

	// Add items to the DDB according to the selected node type and updates the status text message
	var populateExtensionsMenuButton = function(nodeModel) {
		var oMenu = oExtOptionsMenuButton.getMenu();

		if (nodeModel === null) { //case of clearing the outline
			statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_NoControlIsSelected"));
			return;
		}

		// in case the node belongs to an extended node, do not allow further extensions (except for hooks)
		if (nodeModel.type !== ExtendUtil.EXT_TYPE_HOOK) {
			if (nodeModel.resourceInfo.newId || (nodeModel.resourceInfo.isExtended && nodeModel.resourceInfo.isExtended === true)) {

				oMenu.removeAllItems();

				if (nodeModel.resourceInfo.name) {
					statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_NodeAlreadyExtended", [nodeModel.resourceInfo.name]));
				} else {
					statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_ElementAlreadyExtended"));
				}

				oExtOptionsMenuButton.setEnabled(false);
				return;
			}
		}

		if (nodeModel.isExtended === true) {
			statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_NodeAlreadyExtended", [nodeModel.extensionId]));

			oExtOptionsMenuButton.setEnabled(false);
			return;
		}

		if (oMenu.getItems().length > 0) {
			oMenu.removeAllItems();
		}

		switch (nodeModel.type) {
			case ExtendUtil.EXT_TYPE_VIEW:
				var replaceEmptyViewItem = new sap.ui.unified.MenuItem({
					text: that.oContext.i18n.getText("i18n", "VisualExt_ReplaceWithEmptyView"),
					select: [{ type : that.mExtensionTypes.REPLACE_VIEW_WITH_EMPTY }, onAddExtension, this]
				});
				var replaceParentViewItem = new sap.ui.unified.MenuItem({
					text: that.oContext.i18n.getText("i18n", "VisualExt_ReplaceCopyParentView"),
					select: [{ type : that.mExtensionTypes.REPLACE_VIEW_WITH_COPY }, onAddExtension, this]
				});

				oMenu.addItem(replaceEmptyViewItem);
				oMenu.addItem(replaceParentViewItem);

				break;

			case ExtendUtil.EXT_TYPE_EXT_POINT:
				var extendViewItem = new sap.ui.unified.MenuItem({
					text: that.oContext.i18n.getText("i18n", "VisualExt_ExtendView"),
					select: [{ type : that.mExtensionTypes.EXTEND_VIEW }, onAddExtension, this]
				});

				oMenu.addItem(extendViewItem);
				break;

			case ExtendUtil.EXT_TYPE_CONTROLLER:
				var extendEmptyControllerItem = new sap.ui.unified.MenuItem({
					text: that.oContext.i18n.getText("i18n", "VisualExt_ExtendEmptyController"),
					select: [{ type : that.mExtensionTypes.EXTEND_CONTROLLER_WITH_EMPTY }, onAddExtension, this]
				});

				var extendParentControllerItem = new sap.ui.unified.MenuItem({
					text: that.oContext.i18n.getText("i18n", "VisualExt_ExtendParentController"),
					select: [{ type : that.mExtensionTypes.EXTEND_CONTROLLER_WITH_COPY }, onAddExtension, this]
				});

				oMenu.addItem(extendEmptyControllerItem);
				oMenu.addItem(extendParentControllerItem);
				break;

			case ExtendUtil.EXT_TYPE_HOOK:
				var implementHookItem = new sap.ui.unified.MenuItem({
					text: that.oContext.i18n.getText("i18n", "VisualExt_ExtendHook"),
					select: [{ type : that.mExtensionTypes.EXTEND_CONTROLLER_HOOK }, onAddExtension, this]
				});

				oMenu.addItem(implementHookItem);
				break;

			default:
				if (nodeModel.isVisible && nodeModel.attributes.id) {
					var hideControlItem = new sap.ui.unified.MenuItem({
						text: that.oContext.i18n.getText("i18n", "VisualExt_HideControl"),
						select: [{ type : that.mExtensionTypes.HIDE_CONTROL }, onAddExtension, this]
					});

					oMenu.addItem(hideControlItem);
				}
		}

		// If the node is not extendable, present the reasons in the status message
		if (oMenu.getItems().length <= 0) {
			if (!nodeModel.attributes.id) {
				// the selected element does not have an ID configured
				statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_NoIdAvailable"));
			} else if (nodeModel.isVisible === false) {
				// the selected element does not have the "visible" property
				statusMessage.setText(that.oContext.i18n.getText("i18n", "VisualExt_ElementNotVisible", [nodeModel.attributes.id]));
			}

			oExtOptionsMenuButton.setEnabled(false);
		} else {
			oExtOptionsMenuButton.setEnabled(true);
		}
	};

	var updatePreview = function(oSelectedNodeModelData) {

		if (!that.messageHandler) {
			that.oContext.service.usernotification.alert(that.oContext.i18n.getText("i18n", "VisualExt_ErrorOccurred")).then(function(oResult) {
				if (oResult.sResult === "OK") {
					// refresh the application
					displayElement.attr("src", displayElement.attr("src"));
					// disable the "Open" menu
					var oGoToCodeMenuButton = sap.ui.getCore().byId("goToCodeButton");
					oGoToCodeMenuButton.setEnabled(false);
				}
			}).done();
		} else {
			if (!oSelectedNodeModelData) {
				that.messageHandler.sendMessage('CLEAR', "", "");
				return;
			}
			
			if (oSelectedNodeModelData.type === ExtendUtil.EXT_TYPE_VIEW) {
				that.messageHandler.sendMessage('SELECT_', oSelectedNodeModelData.resourceInfo.id);
				return;
			}

			var viewId = oSelectedNodeModelData.resourceInfo.id;
			if (oSelectedNodeModelData.resourceInfo.type === ExtendUtil.EXT_TYPE_FRAGMENT) {
				// fragments don't exist in runtime, switch to the view containing it
				viewId = extProjTree.getParentViewOfFragment(viewId);
			}

			if (oSelectedNodeModelData.isVisible === true && oSelectedNodeModelData.attributes.id) {
				that.messageHandler.sendMessage('SELECT_', viewId, oSelectedNodeModelData.attributes.id);
			} else { // this element is either not visible or has no id
				if (oSelectedNodeModelData.type === ExtendUtil.EXT_TYPE_EXT_POINT) {
					that.messageHandler.sendMessage('SELECT_', viewId, oSelectedNodeModelData.attributes.name);
				}
				// clear all previously selected elements in the application
				else {
					that.messageHandler.sendMessage('CLEAR', "", "");
				}
			}
		}
	};

	var onFilterDropDownChange = function() {
		oExtOptionsMenuButton.getMenu().removeAllItems();

		var oGoToCodeMenuButton = sap.ui.getCore().byId("goToCodeButton");
		extProjTree.getSelectedElementData().then(function (oNodeModel) {
			if (oNodeModel) {
				// enable the "Open" button if there's a selection in the tree
				oGoToCodeMenuButton.setEnabled(true);
				populateExtensionsMenuButton(oNodeModel);
				handleRemoveExtButton(oNodeModel);
			} else {
				// disable the "Open" button if there's no selection in the tree
				oGoToCodeMenuButton.setEnabled(false);
			}
		}).done();
	};

	var getIndexDocument = function(context) {
		var filePathAtRoot = extensionProjectDocument.getEntity().getFullPath() + "/index.html";
		var filePathAtWebapp = extensionProjectDocument.getEntity().getFullPath() + "/webapp/index.html";
		return context.service.filesystem.documentProvider.getDocument(filePathAtWebapp).then(function(indexDocument) {
			if (indexDocument) {
				return Q(indexDocument);
			} else {
				// backwards compatibility to old structured extension projects
				return context.service.filesystem.documentProvider.getDocument(filePathAtRoot);
			}
		});
	};

	var createiFrame = function(context) {
		return getIndexDocument(context).then(function(indexDocument) {
			if (indexDocument) {
				// append the scripts for mock (if needed) and the reciever.js to the application index.html
				var requirePath = require.toUrl("sap.watt.saptoolsets.fiori.project.fioriexttemplate/visualExt/transceiver.js");
				var sScript = '<script src="' + requirePath + '" type="text/javascript"></script>';
				if (isRunWithMock) {
					return context.service.mockpreview.getRunnableMockSettings(indexDocument, extensibilityModel.mockpreview).then(function(
						oRunnableMockSettings) {
						return context.service.mockpreview.buildRunnableDocument(oRunnableMockSettings, indexDocument).then(function(oNewDocument) {
							return context.service.htmlbuilder.build(oNewDocument, sScript, "visual_ext_index.html").then(
								// build a dummy iframe tag for the preview window
								function(url) {
									frameUrl = url;
									var iFrame = "<iframe style='border : none;' id='previewApp' height='100%' width='100%'></iframe>";
									return iFrame;
								});
						});
					});
				}
				return context.service.htmlbuilder.build(indexDocument, sScript, "visual_ext_index.html").then(
					// build a dummy iframe tag for the preview window
					function(url) {
						frameUrl = url;
						var iFrame = "<iframe style='border : none;' id='previewApp' height='100%' width='100%'></iframe>";
						return iFrame;
					});
			}
		});
	};

	var closeContainer = function() {
		oContainer.fireClose();
	};

	var _getFocusElement = function() {
		return extProjTree.getSelectedElementData();
	};

	/*
	 * Clears the outline of any selection, and the dropdown as well
	 */
	var clearTree = function() {
		extProjTree.clearSelection();

		populateExtensionsMenuButton(null);
		oRemoveExtButton.setEnabled(false);

		oExtensionCodeItem.setEnabled(false);
		that.oContext.service.contextMenu.close().done();
	};

	var onRightClickOnApp = function(iPageX, iPageY) {
		return that.oContext.service.contextMenu.open(oContextMenuGroup, iPageX, iPageY);
	};

	var onHover = function(viewId, controlId, sType) {
		extProjTree.hoverOnTreeElement(viewId, controlId, sType);
	};

	var _getExtensionTypes = function () {
		return that.mExtensionTypes;
	};

	var _extendSelectedElement = function (sExtensionType) {
		setPaneToBusy();
		return that.oContext.service.usagemonitoring.startPerf("extensibility", "add_extension").then(function () {
			return extProjTree.extendSelectedElement(sExtensionType).then(function (oModel) {
				report(oModel, true, sExtensionType);
				displayExtensionMessage(oModel, true, sExtensionType);

				handleRemoveExtButton(oModel);
	
				var oGoToCodeMenuButton = sap.ui.getCore().byId("goToCodeButton");
				oGoToCodeMenuButton.setEnabled(true);
	
				if (oModel.isRoot) { // root element
					oGoToCodeMenuButton.setEnabled(false);
					oExtOptionsMenuButton.setEnabled(false);
					populateExtensionsMenuButton(null);
					return;
				}
	
				if (oModel.resourceInfo.type === "fragment" && oModel.type !== "extensionpoint") {
					oExtOptionsMenuButton.setEnabled(false); // disable extension options for fragments and their elements (except for extension points in fragments)
					return;
				}
	
				updatePreview(oModel);
				handleExtendedNode(oModel);
			});
		}).fail(function (oError) {
			return that.oContext.service.usernotification.alert(oError);
		}).finally(function() {
			closeBusyIndicator();
		});
	};

	var _isSelectedElementExtensibleForType = function(sExtensionType) {
		return extProjTree.isSelectedElementExtensibleForType(sExtensionType);
	};

	var _removeExtensionFromSelectedElement = function () {
		setPaneToBusy();
		return extProjTree.removeExtensionFromSelectedElement().then(function (oModel) {
			report(oModel, false);
			displayExtensionMessage(oModel, false);
			// The update of the buttons and status message is done by the selction handler "onNodeSelectChanged"
			// It is triggered inside the remove extension method of the tree
		}).fail(function (oError) {
			return that.oContext.service.usernotification.alert(oError);
		}).finally(function() {
			closeBusyIndicator();
		});
	};
	
	var _openOriginalCodeOfSelectedElement = function () {
		closeContainer();
		return extProjTree.openOriginalCodeOfSelectedElement();
	};

	var _openExtensionCodeOfSelectedElement = function (bWithW5G) {
		closeContainer();
		return extProjTree.openExtensionCodeOfSelectedElement(bWithW5G, sActionOrigin);
	};

	return {
		isExtensibilityOpen : _isExtensibilityOpen,
		openVisualExt : _openVisualExt,
		closeVisualExt : closeContainer,
		configure : _configure,
		getFocusElement : _getFocusElement,
		getExtensionTypes : _getExtensionTypes,
		extendSelectedElement : _extendSelectedElement,
		isSelectedElementExtensibleForType : _isSelectedElementExtensibleForType,
		removeExtensionFromSelectedElement : _removeExtensionFromSelectedElement,
		openOriginalCodeOfSelectedElement : _openOriginalCodeOfSelectedElement,
		openExtensionCodeOfSelectedElement : _openExtensionCodeOfSelectedElement,
		// Internal functions exposed for unit testing:
		_appendRunConfigurationInfoToIframeUrl: _appendRunConfigurationInfoToIframeUrl,
		_enableComponentPreloadInIframeUrl: _enableComponentPreloadInIframeUrl
	};
});
