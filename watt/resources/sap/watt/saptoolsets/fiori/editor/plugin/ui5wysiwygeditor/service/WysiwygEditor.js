define(
	[
		"sap/watt/common/plugin/platform/service/ui/AbstractEditor",
		"../control/serialization/XMLManipulator",
		"sap/watt/lib/lodash/lodash",
		"../utils/BindingUtils",
		"../utils/ModulePath",
		"../utils/W5gBindingHelper",
		"../utils/ResourcesHelper",
		"../utils/W5gUtils",
		"../utils/CopyPasteUtils",
		"../control/layout/WysiwygLayout",
		"../control/layout/MessageBar",
		"../control/layout/NotificationBar",
		"../control/palette/Palette",
		"../utils/UndoRedoStack",
		"../databinding/DataBinding",
		"../utils/UsageMonitoringUtils",
		"../utils/W5gUi5LibraryMediator",
		"../dtplugins/listener/NotificationListener",
		"../dtplugins/listener/XMLAdaptListener",
		"../dtplugins/listener/OverlappingOverlaysShrinkListener",
		"../dtplugins/listener/HiddenControlPartsListener",
		"../utils/EventsHelper",
		"../utils/ViewState",
		"../utils/ControlMetadata",
		"../utils/EventBusHelper"
	],
	function (AbstractEditor, XMLManipulator, _, BindingUtils, ModulePath, W5gBindingHelper, ResourcesHelper, W5gUtils,
			  CopyPasteUtils, WysiwygLayout, MessageBar, NotificationBar, Palette, UndoRedoStack, DataBinding,
			  UsageMonitoringUtils, W5gUi5LibraryMediator, NotificationListener, XMLAdaptListener,
			  OverlappingOverlaysShrinkListener, HiddenControlPartsListener, EventsHelper, ViewState, ControlMetadata, EventBusHelper) {
		"use strict";

		// optimizations until all resources are using requirejs and benefit from its optimizer
		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg");
		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.WysiwygRenderer");
		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode");

		var /** const */ ALERT = "alert";

		var Editor = AbstractEditor.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.WysiwygEditor", {
			constructor: function () {

				/**
				 * Current opened document
				 *
				 * @type {object}
				 * @private
				 */
				this._oCurrentDocument = null;

				/**
				 * Canvas control
				 *
				 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg}
				 * @private
				 */
				this._oWysiwygCtrl = null;

				/**
				 * Configured styles
				 *
				 * @type {Array<{uri: string}>}
				 * @private
				 */
				this._aCssStyles = [];

				/**
				 * Current view injected to iframe
				 *
				 * @type {sap.ui.core.mvc.View}
				 * @private
				 */
				this._oCurrentInjectedView = null;

				/**
				 * Wysiwyg layout control
				 *
				 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout}
				 * @private
				 */
				this._oEditorContentLayout = null;

				/**
				 * Map of opened documents by key strings
				 *
				 * @type {Object.<string, object>}
				 * @private
				 */
				this._mOpenedDocuments = {};

				/**
				 * Layout model for the undo, redo buttons (and maybe more in the future)
				 *
				 * @type {sap.ui.model.json.JSONModel}
				 * @private
				 */
				this._oLayoutModel = new sap.ui.model.json.JSONModel();

				/**
				 * Last opened document content
				 *
				 * @type{string}
				 * @private
				 */
				this._sLastViewContent = null;

				/**
				 * Promise for document opened and view loaded
				 *
				 * @type {Q}
				 * @private
				 */
				this._oOnViewLoadedPromise = null;

				/**
				 * Promise for flushing finished
				 *
				 * @type {Q}
				 * @private
				 */
				this._oIsFlushingPromise = null;

				/**
				 * Map of selected controls in opened documents by documents key strings
				 *
				 * @type {Object.<string, {control: sap.ui.core.Control|string, aggregation: string}>}
				 * @private
				 */
				this._mSelectedUI5Control = {};

				/**
				 * open state could be null or "loading"
				 *
				 * @type {string}
				 * @private
				 */
				this._sEditorOpenState = null;

				/**
				 * a map containing all documents undo\redo histories by document key
				 *
				 * @type{Object.<string, sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack<string>>}
				 * @private
				 */
				this._mDocumentUndoRedoStacks = {};

				/**
				 * Group of commands for context menu in the canvas
				 *
				 * @type {sap.watt.common.plugin.commandgroup.command.module.Group}
				 * @private
				 */
				this._oContextMenuGroup = null;

				/**
				 * The serialized control that has been cut/copied
				 *
				 * @type {string}
				 * @private
				 */
				this._sClipboardControlXML = null;
			},

			configure: function (mConfig) {
				var that = this;
				this._aCssStyles = mConfig.styles;
				if (mConfig.contextMenu) {
					return this.getContext().service.commandGroup.getGroup(mConfig.contextMenu).then(function (oGroup) {
						that._oContextMenuGroup = oGroup;
					});
				}
			},

			init: function () {
				var that = this,
					oContext = this.getContext();

				W5gUtils.init(oContext);
				ResourcesHelper.init(oContext);
				W5gBindingHelper.init(oContext);
				UsageMonitoringUtils.init(oContext);
				W5gUi5LibraryMediator.init(oContext);
				BindingUtils.init(oContext);
				ModulePath.init(oContext);
				EventsHelper.init(oContext);
				ResourcesHelper.retrieveUserPreferences().then(function (oSettings) {
					that._sDevice = oSettings.device;
					that._oLayoutInfo = {
						left: oSettings.left,
						right: oSettings.right
					};
					if (!/phone|tablet|desktop/.test(that._sDevice)) {
						// TODO we don't bring the value from sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.library because the separate project cause errors on wattonwatt
						that._sDevice = "tablet";
						that._updateUserPreferences({
							device: that._sDevice
						});
					}
				}).done();

				// To stop the resizing event of a widget when clicking outside the canvas iFrame
				$("body").on("mouseup", function () {
					var oSelectedControl = that.getCurrentSelectedControl();
					var oScope = that.getScope();
					var oOverlay = W5gUtils.getControlOverlay(oSelectedControl, oScope);
					if (oOverlay && oOverlay.$().hasClass("ui-resizable-resizing")) {
						oScope.$("body").mouseup();
					}
				});

				EventBusHelper.subscribe(EventBusHelper.IDENTIFIERS.NOTIFICATION_BAR_ADD_MESSAGE, function (oData) {
					that._addMessageToNotificationBar(oData.sLine1, oData.sLine2, true);
				});
			},

			getState: function () {
				return this._sEditorOpenState;
			},

			getContext: function () {
				return this.context.service.ui5wysiwygeditor.context;
			},

			//Only Chrome is supported as of now
			isRestorable: function () {
				return jQuery.browser.chrome;
			},

			isAvailable: function () {
				return sap.watt.getEnv("server_type") !== "xs2";
			},

			/**
			 * Opens a document in the editor control
			 * <p>
			 * If the document is not being edited (in any tab), a new edit session will be created and the control will be filled with the document content.
			 * @param {Document} oDocument the document to open
			 */
			open: function (oDocument) {
				return this._open(oDocument);
			},

			/**
			 * Opens a document in the editor control
			 * <p>
			 * If the document is not being edited (in any tab), a new edit session will be created and the control will be filled with the document content.
			 * @param {Document} oDocument the document to open
			 * @param {boolean=} bWithoutProgress whether to hide loading progress
			 */
			_open: function (oDocument, bWithoutProgress) {
				var that = this;

				that._sEditorOpenState = "loading";
				// wait for other unfinished open process
				var oOldLoadedPromise = Q(that._oOnViewLoadedPromise && that._oOnViewLoadedPromise.promise);
				that._oOnViewLoadedPromise = Q.defer();
				// we don't care if previous open failed or succeeded as long as it finished, hence the catch
				return oOldLoadedPromise.catch(_.noop).then(function () {
					// handle unsupported browsers (alert and quit)
					if (!jQuery.browser.chrome) {
						var sMessage = W5gUtils.getText("editor_unsupported_browser_error_message");
						var oError = new Error(sMessage);
						oError.sMessageType = 'alert';
						that._handleViewCreationError(oError);
						jQuery.sap.log.error(sMessage);
						return that._oOnViewLoadedPromise.promise;
					}
					UsageMonitoringUtils.startPerf("open_w5g");
					AbstractEditor.prototype.open.apply(that, arguments);
					var /**boolean*/ bDocumentChanged = (that._oCurrentDocument !== oDocument);
					that._oCurrentDocument = oDocument;
					var sLoadingMessage = W5gUtils.getText("editor_loading_layout_editor_message");
					var sDocumentStatus = "new";
					return that._showProgress(sLoadingMessage, bWithoutProgress).then(function () {
						return Q.all([
							oDocument.getContent(),
							W5gUi5LibraryMediator.loadLibrary(oDocument)
						]).spread(function (sContent) {
							if (!that._mOpenedDocuments[oDocument.getKeyString()]) {
								//opens a new document
								if (!that._isXMLFragment(oDocument) && !that._ensureIsXMLView(oDocument)) {
									return Q();
								}
								that._openNewDocument(oDocument);
							} else {
								//switches to an existing opened document
								sDocumentStatus = "existed";
								that._openExistingDocument(bDocumentChanged, sContent);
							}

							that.oCommandService = that.getContext().service.command;
							var oSelectedCtrl = that.getCurrentSelectedControl();
							var sSelectedCtrlId = oSelectedCtrl && oSelectedCtrl.getId();
							that._getCurrentUndoRedoStack().push(new ViewState(sContent, sSelectedCtrlId));
							return that._oOnViewLoadedPromise.promise.then(function () {
								return EventsHelper.fireViewHasChanged();
							}).then(function () {
								// id is used since the actual control might be corrupted after switch device for example
								return that.selectUI5Control(sSelectedCtrlId || that.getRoot(), sSelectedCtrlId && that._getSelectedAggregation());
							}).then(function () {
								that._sEditorOpenState = null;
							});
						}).finally(function () {
							UsageMonitoringUtils.report("open_w5g", sDocumentStatus + '#' + oDocument.getKeyString());
							return that._hideProgress();
						});
					});
				});
			},

			_showProgress: function (sMessage, bWithoutProgress) {
				return this.getContext().service.dialogprogress.show(sMessage, bWithoutProgress);
			},

			_setProgress: function (iValue) {
				return this.getContext().service.dialogprogress.setProgress(iValue || 0);
			},

			_hideProgress: function () {
				return this.getContext().service.dialogprogress.hide();
			},

			_updateUserPreferences: function (oData) {
				ResourcesHelper.updateUserPreferences(oData).done();
			},

			_openInWysiwyg: function () {
				var that = this;
				that._removeViewInstance();
				return that._setProgress(50).then(function () {
					var bDebugUI5 = window.parent["sap-ui-debug"] ? "true" : "false";
					var sUrl = require.toUrl("sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor/control/staticIndex.html?sap-ui-debug=" + bDebugUI5) + W5gUtils.getFakeOsUrlParam(that._sDevice);
					if (that._oWysiwygCtrl.getSrc() !== sUrl) {
						that._oWysiwygCtrl.attachEventOnce("loaded", that._onOpen.bind(that));
						that._oWysiwygCtrl.setSrc(sUrl);
						that._oWysiwygCtrl.setDevice(that._sDevice);
					} else {
						that._onOpen();
					}
				});
			},

			_openNewDocument: function (oDocument) {
				var that = this;
				this._mOpenedDocuments[oDocument.getKeyString()] = oDocument;
				this._createUIControls().then(function () {
					return that._openInWysiwyg();
				}).done();
			},

			/**
			 *
			 * @param {boolean} bDocumentChanged indicates whether the opened document in layout editor has changed
			 * @param {string} sContent current document content
			 * @private
			 */
			_openExistingDocument: function (bDocumentChanged, sContent) {
				var that = this;
				if (bDocumentChanged || this._sLastViewContent !== sContent) {
					this._openInWysiwyg();
				} else {
					// property pane, outline, etc. need to be acknowledged about selection change
					return that.fireViewElementSelected().then(function () {
						that._oOnViewLoadedPromise.resolve();
					}).done();
				}
			},

			//TODO: Remove dependency to the databinding service
			onDataBindingChanged: function () {
				var that = this;
				this.iterateOverAllPublicAggregationsOfRootControl(function (oContent, oValue) {
					that._oDataBinding.displayDataBinding(oValue);
				});
			},

			/**
			 * Handle resource change events of whole IDE environment.
			 *
			 * Synchronize opened documents list
			 * because some resource manipulation (like rename/move/delete files)
			 * the internal _mOpenedDocument list might be not synchronized. Fix it there.
			 */
			onDocumentChanged: function (oEvent) {
				if (ResourcesHelper.isSupportedResourceChangeEvent(oEvent)) {
					var that = this;

					this.getContext().service.content.getDocuments().then(function (oDocuments) {
						var contentDocuments = oDocuments.map(function (oDoc) {
							return oDoc.getKeyString();
						});
						that._mOpenedDocuments = _.pick(that._mOpenedDocuments, contentDocuments);
					}).done();
				}
			},

			_onOpen: function () {
				var that = this;
				that._oXmlManipulator = new XMLManipulator(that.getScope(), _.bindKey(that, "_flushWrapper"));
				that.getScope().jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");

				this._createView().then(function (oView) {
					that._injectViewInstance(oView);
					return that._setProgress(70);
				}).fail(function (oError) {
					return that._handleViewCreationError(oError);
				}).done();
			},

			getXmlManipulator: function () {
				return this._oXmlManipulator;
			},

			serialize: function () {
				return this.getRoot().__XMLRootNode.outerHTML;
			},

			_rememberInitialViewContent: function () {
				var that = this;
				this._sOriginalSerializedViewContent = this.serialize();
				return this._oCurrentDocument.getContent().then(function (sContent) {
					that._sOriginalViewContent = sContent;
				});
			},

			/**
			 * handle error occurring during view creation
			 */
			_handleViewCreationError: function (oError) {
				if (!oError) {
					oError = new Error();
				}
				//this is a writing to WebIDE console
				this.getContext().service.log.error(oError.message);
				// Complete details of error if not supplied (which shouldn't happen but we don't want the IDE to get stuck)
				oError.message = W5gUtils.getText("editor_view_creation_error");
				oError.sMessageType = oError.sMessageType || ALERT;
				this._oOnViewLoadedPromise.reject(oError);
				this._hideProgress().done();
			},

			/**
			 * Returns the message that should appear in the notification bar upon selection of special controls
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @return {{line1: string, line2: string}} an object contains the first and the second line in the message that should appear in the notification bar
			 *
			 * @name _getMessagesOnSelection
			 * @function
			 * @private
			 */
			_getMessagesOnSelection: function (oControl) {
				var messages = {
						line1: "",
						line2: ""
					},
					sControlName = oControl && W5gUtils.getControlTitle(oControl);

				if (oControl) {
					if (W5gUtils.isCompositeControl(oControl)) {
						messages.line1 = W5gUtils.getText("message_area_cannot_change_inner_properties_from_canvas", [sControlName]);
					} else if (ControlMetadata.isControlUnsupported(oControl)) { //Selected control is not supported
						messages.line1 = W5gUtils.getText("unsupported_message");
					} else if (ControlMetadata.isControlToBeSupported(oControl)) { //Selected control is not supported
						messages.line1 = W5gUtils.getText("properties_tobe_supported_message");
					}
				}

				return messages;
			},

			/**
			 * Event handler for changed selection.
			 *
			 * @param {object} oEvent event object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.WysiwygEditor#onViewElementSelected
			 * @function
			 * @public
			 */
			onViewElementSelected: function (oEvent) {
				if (this._oMessageBar) {
					var oControl = oEvent.params.selection[0].control;
					if (oControl !== this._oMessageBar.getSelection()) {
						this._oMessageBar.setSelection(oControl);
						var mMessages = this._getMessagesOnSelection(oControl);
						this._oNotificationBar.updateMessageArea(mMessages.line1, mMessages.line2, true);
					}
				}
			},

			_onDesignTimeReady: function () {
				var that = this;

				this.palette.onCanvasLoaded();
				this._oDataBinding = new DataBinding(this.getScope());
				this.iterateOverAllPublicAggregationsOfRootControl(function (oContent, oValue) {
					try {
						that._oDataBinding.displayDataBinding(oValue);
					} catch (oError) {
						jQuery.sap.log.error(oError);
						return that._oOnViewLoadedPromise.reject(oError);
					}
				});
				that._setProgress(100).then(function () {
					return that.getContext().event.fireOpened({
						document: that._oCurrentDocument
					});
				}).then(function () {
					return that.oCommandService.registerDocument(that.getScope().document);
				}).then(function () {
					return that._rememberInitialViewContent();
				}).then(function () {
					return W5gBindingHelper.setDocumentData(
						that._oCurrentDocument, that.getRoot(), that._oXmlManipulator
					);
				}).finally(function () {
					that._oEditorContentLayout.setBusy(false);
					if (that._oCurrentDocument) {
						if (that.palette) { //can happen because events race conditions
							that.palette.restoreFilter(that._oCurrentDocument);
						}
					}
					return that._hideProgress().then(function () {
						that._updateLayoutModel();
						that._oOnViewLoadedPromise.resolve();
					});
				}).catch(function (oError) {
					jQuery.sap.log.error(oError);
					that._oOnViewLoadedPromise.reject(oError);
				}).done();
			},

			_ensureIsXMLView: function (oDocument) {
				var that = this;
				var oRegExViewValidation = new RegExp("(.+)(\.view)(.+)");
				var sName = oDocument.getEntity().getName();
				var aNameParts = oRegExViewValidation.exec(sName);
				if (!aNameParts || (aNameParts && aNameParts.indexOf(".xml")) === -1) {
					var sMessage = W5gUtils.getText("editor_wrong_file_type_message");
					that._oOnViewLoadedPromise.reject({message: sMessage});
					return false;
				}
				return true;
			},

			_isXMLFragment: function (oDocument) {
				var oRegExViewValidation = new RegExp("(.+)(\.fragment)(.+)");
				var sName = oDocument.getEntity().getName();
				var aNameParts = oRegExViewValidation.exec(sName);
				return !!aNameParts;

			},

			//TODO: Move injection code into wysiwyg control
			_injectViewInstance: function (oView) {
				// The view must be also stored on the iframe window otherwise databindings are not displayed on canvas
				this.getScope().oView = this._oCurrentInjectedView = oView.placeAt("content").addStyleClass("sapUiScroll");
				this._createDesignTime(oView);
			},

			_loadDesignTimeCSS: function (oWindow, aElements) {
				function getPath(sCssName) {
					return oWindow.jQuery.sap.getResourcePath("sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/iframe/style/" + sCssName);
				}

				function appendStyle(sCssName) {
					var sId = W5gUtils.getDesignTimeCssId(sCssName);
					if (!oWindow.jQuery("link[id=" + sId + "]").length) {
						var $style = oWindow.jQuery("<link type='text/css' rel='stylesheet' href='" + getPath(sCssName) + "' id='" + sId + "' />");
						oWindow.document.head.appendChild($style[0]);
					}
				}

				appendStyle("style.css");
				jQuery.each(aElements, function () {
					if (this.css) {
						appendStyle(this.css);
					}
				});
			},

			_createDesignTime: function (oView) {
				var that = this;
				var oWindow = this.getScope();
				oWindow._ = _;
				oWindow.Q = Q;
				var sapui = oWindow.sap.ui;
				var _require = oWindow.jQuery.sap.require;
				var core = sapui.getCore();
				core.loadLibrary("sap.ui.dt");
				_require("sap.ui.dt.DesignTime");
				_require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop");
				_require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gBadge");
				_require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection");
				_require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gContextMenu");
				_require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.Actions");
				_require("sap.ui.dt.ElementUtil");
				_require("sap.ui.dt.Preloader");

				var /** Array */ aElements = sapui.dt.ElementUtil.findAllPublicElements(oView);
				aElements = aElements.concat(_.keys(oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata));
				sapui.dt.Preloader.load(aElements).then(function () {
					var oW5gDragDropPlugin = new oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop({
						w5gUtils: W5gUtils,
						controlMetadata: ControlMetadata,
						editor: that
					});
					oW5gDragDropPlugin.setListeners(
						[
							new NotificationListener(that._oNotificationBar, oW5gDragDropPlugin),
							new XMLAdaptListener(that._oXmlManipulator, oWindow),
							new OverlappingOverlaysShrinkListener(oW5gDragDropPlugin),
							new HiddenControlPartsListener(oW5gDragDropPlugin)
						]
					);
					that._oDesignTime = new sapui.dt.DesignTime({
						designTimeMetadata: oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
						rootElements: [oView],
						plugins: [
							new oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection({
								w5gUtils: W5gUtils,
								editor: that
							}),
							new oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gContextMenu({
								context: that.context,
								contextMenuConfig: {
									group: that._oContextMenuGroup,
									getIFramePosition: that._oWysiwygCtrl.getIFramePosition()
								}
							}),
							oW5gDragDropPlugin,
							new oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gBadge({
								w5gUtils: W5gUtils
							}),
							new oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.Actions()
						]
					});
					that._loadDesignTimeCSS(oWindow, oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata);
					that.palette.setDesignTime(that._oDesignTime);
					ControlMetadata.setDesignTime(that._oDesignTime);
					that.palette.setWindow(that.getScope());
					that._onDesignTimeReady();
				});
			},

			getDesignTime: function () {
				return this._oDesignTime;
			},

			/**
			 * @returns {boolean} whether module paths are configured for the project
			 * @private
			 */
			_registerUI5ModulePaths: function () {
				var that = this;
				return ModulePath.getModulePaths(this._oCurrentDocument).then(function (oModulePathsMetadata) {
					if (!oModulePathsMetadata) {
						return false;
					}
					_.forEach(oModulePathsMetadata.resourcesroots, function (path, module) {
						var url = that._calculateUrlFromDocument(oModulePathsMetadata.parentFolder, path);
						that.getScope().jQuery.sap.registerModulePath(module, url);
					});
					return true;
				});
			},

			_registerExtensionModulePaths: function (oDocument) {
				var that = this,
					extensibilityService = {
						getProxyMetadata: function () {
							return {
								getName: function () {
									return "extensibility";
								}
							};
						}
					};
				return that.getContext().service.setting.project.get(extensibilityService, oDocument).then(function (oSettings) {
					if (oSettings) {
						var path;
						var module = oSettings.namespace;
						switch (oSettings.type) {
							case "Workspace":
							case "abaprep":
							case "hcp":
								path = oSettings.parentResourceRootUrl;
								break;
						}
						if (path && module) {
							return oDocument.getProject().then(function (oProject) {
								var url = that._calculateUrlFromDocument(oProject.getEntity().getBackendData().location, path);
								that.getScope().jQuery.sap.registerModulePath(module, url);
							});
						}
					}
				});
			},

			_calculateUrlFromDocument: function _calculateUrlFromDocument(sDocLocation, sPath) {
				if (sPath.indexOf("/") === 0) {
					return sPath;
				}
				var sOrionPathSegment = sap.watt.getEnv("orion_server");
				if (sOrionPathSegment && sOrionPathSegment.lastIndexOf('/') === sOrionPathSegment.length - 1) {
					sOrionPathSegment = sOrionPathSegment.substring(0, sOrionPathSegment.length - 1);
				}
				if (sDocLocation[0] !== '/') {
					sDocLocation = '/' + sDocLocation;
				}
				return sOrionPathSegment + sDocLocation + sPath;
			},

			_removeViewInstance: function () {
				var oScope = this.getScope();
				var oCore = oScope && oScope.sap.ui.getCore();

				if (this._oDesignTime) {
					this.palette.reset();
					this._oDesignTime.destroy();
					this._oDesignTime = null;
				}
				//refresh view
				if (this._oCurrentInjectedView && this._oCurrentInjectedView.destroy) {
					//it might not exist in case of loading error (e.g. error in application)
					this._oCurrentInjectedView.destroy();
					this._oCurrentInjectedView = null;
				}
				if (oCore) {
					oCore.reset();
				}
			},

			_createView: function () {
				var that = this;
				return this._oCurrentDocument.getContent().then(function (sContent) {
					var ui5modulePathPromise = that._registerUI5ModulePaths();
					var extensionModulePathPromise = that._registerExtensionModulePaths(that._oCurrentDocument);

					return Q.all([ui5modulePathPromise, extensionModulePathPromise]).spread(function (/**boolean*/ui5modulePathStatus) {
						var oError;
						if (!that._oWysiwygCtrl) {
							return null;
						}
						var sType = that._oCurrentDocument.getEntity().getFileExtension().toUpperCase();
						var sapui = that.getScope().sap.ui;
						if (sContent.length === 0) {
							oError = new Error(W5gUtils.getText("editor_empty_view_error_message"));
							oError.sMessageType = 'alert';
							throw oError;
						}
						//validate xml string
						var oParser = new DOMParser();
						var oDOM = oParser.parseFromString(sContent, "text/xml");

						if (oDOM.getElementsByTagName("parsererror").length > 0) {
							var sErrorMsg = oDOM.getElementsByTagName("parsererror")[0].childNodes[1].innerHTML;
							oError = new Error(W5gUtils.getText("editor_view_xml_malformed_message") + "\n\n" + sErrorMsg);
							oError.sMessageType = 'alert';
							throw oError;
						}
						//  Try to create the layout editor's view. If some problem occurs an error category will be added.
						var oView;
						try {
							oView = sapui.view({
								viewContent: sContent,
								type: sapui.core.mvc.ViewType[sType]
							});
						} catch (oErr) {
							if (!ui5modulePathStatus) { // if no ui5 module paths, it might be related
								var sResourceRootsNote = W5gUtils.getText("editor_view_xml_no_resource_roots_message");
								oErr.message = sResourceRootsNote + "\n\n" + oErr.message;
							}
							oErr.sMessageType = 'alert';
							jQuery.sap.log.error(oErr);
							throw oErr;
						}
						return oView;
					});
				});
			},

			_flushWrapper: function () {
				var that = this;
				return EventsHelper.fireViewHasChanged().then(function () {
					return that.flush();
				}).done();
			},

			/**
			 * Iterates over all aggregations of the root control inside the canvas
			 * <p>
			 * This method cleans up the edit session of a document.
			 * @param {Function} fnCallback callback function
			 * @param {Function=} fnBreakCondition callback function which provides the break condition
			 * @param {Array=} aAggregationFilter An array to filter specific aggregations
			 */
			iterateOverAllPublicAggregationsOfRootControl: function (fnCallback, fnBreakCondition, aAggregationFilter) {
				// TODO : error when selection event comes from LayoutEditor to Outline too early and then promise resolves when DesignTime is already destroyed
				if (this._oDesignTime) {
					var oWindow = this.getScope();
					if (oWindow.oView instanceof oWindow.sap.ui.core.mvc.View) {
						var Utils = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils;
						var aFilter = aAggregationFilter || Utils.getAggregationFilter();
						return Utils.iterateOverAllPublicAggregations(oWindow.oView, fnCallback, fnBreakCondition, aFilter);
					}
				} else {
					return Q();
				}
			},

			/**
			 * @param {object} oDocument
			 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack<string>}
			 */
			_getUndoRedoStackForDocument: function (oDocument) {
				var keyString = oDocument.getKeyString();
				if (!this._mDocumentUndoRedoStacks[keyString]) {
					this._mDocumentUndoRedoStacks[keyString] = new UndoRedoStack(15);
				}
				return this._mDocumentUndoRedoStacks[keyString];
			},

			/**
			 *
			 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack<string>}
			 */
			_getCurrentUndoRedoStack: function () {
				if (!this._oCurrentDocument) {
					// undo redo API is called asynchronously even before the editor is opened.
					// return dummy stack in this case
					return new UndoRedoStack(0);
				}
				return this._getUndoRedoStackForDocument(this._oCurrentDocument);
			},

			/**
			 *    Writes the content in the editor into current document
			 */
			flush: function () {
				var that = this;
				if (this._oOnViewLoadedPromise.promise.isRejected() || !this._oCurrentDocument) {
					return Q();
				}
				this._oIsFlushingPromise = Q.defer();

				return this._oOnViewLoadedPromise.promise.then(function () {
					var sViewContent = that._getSerializedViewContent();
					return that._oCurrentDocument.setContent(sViewContent, that.getContext().self).then(function () {
						that._getCurrentUndoRedoStack().push(new ViewState(sViewContent, that.getCurrentSelectedControl() && that.getCurrentSelectedControl().getId()));
						that._sLastViewContent = sViewContent;
						//to retrigger hasUndo call from the content
						return that.fireViewElementSelected();
					}).then(function () {
						that._updateLayoutModel();
						that._oIsFlushingPromise.resolve();
						return that._oIsFlushingPromise.promise;
					});
				});
			},

			_updateLayoutModel: function () {
				this._oLayoutModel.setData({
					undoEnabled: this.hasUndo(),
					redoEnabled: this.hasRedo()
				});
			},

			_getSerializedViewContent: function () {
				var sViewContent = this.serialize();
				if (sViewContent === this._sOriginalSerializedViewContent) {
					//prevent serializer to make unchanged documents dirty
					sViewContent = this._sOriginalViewContent;
				}
				return sViewContent;
			},

			/**
			 * Clean up the edit session of a document
			 * <p>
			 * This method cleans up the edit session of a document.
			 * @param {Document} oDocument the document to close
			 */
			close: function (oDocument) {

				if (this.palette) {
					this.palette.cleanUpFilter();
				}

				var that = this;
				var originalArguments = arguments;

				return Q(this._oIsFlushingPromise).then(function () {
					var sDocKeyString = oDocument.getKeyString();

					delete that._mOpenedDocuments[sDocKeyString];
					delete that._mSelectedUI5Control[sDocKeyString];
					if (oDocument === that._oCurrentDocument) {
						that._oCurrentDocument = null;
					}
					delete that._mDocumentUndoRedoStacks[sDocKeyString];
					return AbstractEditor.prototype.close.apply(that, originalArguments);
				});
			},

			getContent: function () {
				var that = this;
				return that._createUIControls().then(function () {
					return that.getContext().service.resource.includeStyles(that._aCssStyles).then(function () {
						that._oEditorContentLayout.setBusy(true);
						return that._oEditorContentLayout;
					});
				});
			},

			_onDeviceTypeChanged: function (oEvent) {
				this._sDevice = oEvent.getParameter("deviceType");
				this._updateUserPreferences({
					device: this._sDevice
				});
				this._mOpenedDocuments[this._oCurrentDocument.getKeyString()] = null;
				return this.open(this._oCurrentDocument);
			},

			_createUIControls: _.once(function () {
				var that = this;
				return that._setProgress().then(function () {
					that._oWysiwygCtrl = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg({
						device: that._sDevice
					});
					that._oMessageBar = new MessageBar({
						navigate: function (oEvent) {
							UsageMonitoringUtils.report("breadcrumb");
							var sControlId = oEvent.getParameter("controlId");
							return that.selectUI5Control(sControlId);
						}
					});
					that._oNotificationBar = new NotificationBar();
					that.palette = new Palette();
				}).then(function () {
					return that._setProgress(20);
				}).then(function () {
					if (!that._oEditorContentLayout) {
						that._oEditorContentLayout = new WysiwygLayout("wysiwygContainerLayout" + that._oWysiwygCtrl.getId(), {
							deviceType: that._oWysiwygCtrl.getDevice(),
							layoutInfo: that._oLayoutInfo,
							deviceTypeChange: function (oEvent) {
								that._onDeviceTypeChanged(oEvent).done();
							},
							layoutInfoChange: function (oEvent) {
								that._oLayoutInfo = oEvent.getParameter("info");
								that._updateUserPreferences(that._oLayoutInfo);
							},
							undo: that.undo.bind(that),
							redo: that.redo.bind(that)
						}).addStyleClass("wysiwygContainerLayout");
						W5gUtils.applyBundleTo(that._oEditorContentLayout);
						that._oEditorContentLayout.setModel(that._oLayoutModel, "layoutModel");

						that._oEditorContentLayout.addEventDelegate({
							onAfterRendering: function () {
								if (that._oWysiwygCtrl) {
									that._oWysiwygCtrl.$().parents(".wysiwygLayoutCanvasContainer")
										.unbind("click")
										.bind("click", function () {
											that.deselectUI5Control();
										});
								}
							}
						});
					}
				}).then(function () {
					return that._setProgress(30);
				}).then(function () {
					return that.getContext().service.w5gOutline.getContent();
				}).then(function (oOutline) {
					that._oEditorContentLayout.setMessageBar(that._oMessageBar);
					that._oEditorContentLayout.setNotificationBar(that._oNotificationBar);
					that._oEditorContentLayout.setPalette(that.palette);
					that._oEditorContentLayout.setOutline(oOutline);
					that._oEditorContentLayout.setCanvas(that._oWysiwygCtrl);
					return that.getContext().service.w5gproperties.getContent().then(function (oProperties) {
						that._oEditorContentLayout.setRightPane(oProperties);
						return that._setProgress(40);
					});
				});
			}),

			getTitle: function () {
				return (this._oCurrentDocument) ? this._oCurrentDocument.getEntity().getName() : "";
			},

			getTooltip: function () {
				return (this._oCurrentDocument) ? this._oCurrentDocument.getEntity().getFullPath() : "";
			},

			/**
			 * Opens a fragment or a sub view in the layout editor.
			 */
			openInLayoutEditor: function () {
				var oSelectedControl = this.getCurrentSelectedControl(), that = this,
					oWindow = this.getScope();

				return this.getContext().service.filesystem.documentProvider.getDocument(W5gUtils.getFilePathByControl(oSelectedControl, oWindow))
					.then(function (oDocument) {
						return that.getContext().service.content.open(oDocument, that.getContext().service.ui5wysiwygeditor);
					});
			},


			_addXMLNamespaces: function (mNamespaces, sXMLNode) {
				var aParts = sXMLNode.split(/\/?>/);//identify opening tag > as well as single tag />
				var sFirstPart = aParts[0];
				sFirstPart += _.map(mNamespaces, function (sValue, sKey) {
					var sAttr = sValue === "" ? ' xmlns=' + '"' + sKey + '"' : ' xmlns:' + sValue + '=' + '"' + sKey + '"';
					return sFirstPart.indexOf(sAttr) === -1 ? sAttr : "";
				}).join("");
				return sXMLNode.replace(aParts[0], sFirstPart);
			},

			/**
			 * Transform the given control into XML (serialization)
			 *
			 * @param {sap.ui.core.Control} oClipboardDataControl
			 * @return {string}
			 * @private
			 */
			_controlToXML: function (oClipboardDataControl) {
				var sActualControlXML = oClipboardDataControl.__XMLNode.outerHTML;
				var mNamespaces = XMLManipulator.getNamespaceMap(oClipboardDataControl.__XMLRootNode);
				// Adding namespaces
				for (var n in mNamespaces) {
					var sNamespaceKey = mNamespaces[n];
					if (sNamespaceKey === "") {
						continue;
					}
					var oFinder = new RegExp(n + ":", 'g');
					sActualControlXML = sActualControlXML.replace(oFinder, sNamespaceKey + ":");
				}
				return this._addXMLNamespaces(mNamespaces, sActualControlXML);
			},

			/**
			 * Utility for copy and cut that performs the copy and based on parameter flag maybe also delete it
			 *
			 * @param {boolean} bShouldDelete
			 * @private
			 */
			_copyAndMaybeDelete: function (bShouldDelete) {
				var oSelectedControl = this.getCurrentSelectedControl(),
					sControlName = oSelectedControl && W5gUtils.getControlTitle(oSelectedControl);
				if (CopyPasteUtils.isControlCopyUnsupported(oSelectedControl, this.getScope())) {
					var sLine1 = W5gUtils.getText("message_area_control_copy_unsupported", [sControlName]);
					this._oNotificationBar.updateMessageArea(sLine1, "");
				} else {
					this._sClipboardControlXML = this._controlToXML(oSelectedControl);
					if (bShouldDelete) {
						return this.deleteUI5Control(oSelectedControl);
					}
				}
			},

			/**
			 * Cuts the selected control
			 */
			cut: function () {
				return this._copyAndMaybeDelete(true);
			},

			/**
			 * Copy the selected control
			 */
			copy: function () {
				return this._copyAndMaybeDelete(false);
			},

			/**
			 * Creates control and place it in the given aggregation of the selected control
			 *
			 * @param {string} sClassName
			 * @param {string} sAggregationName
			 */
			injectElementToAggregation: function (sClassName, sAggregationName) {
				var oUtils = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils;
				var iLastPosition;
				var oInstance = W5gUtils.createControl(sClassName, this.getScope(), this._oDesignTime);
				this._oDesignTime.createOverlayFor(oInstance);
				var oParentControl = this.getCurrentSelectedControl();
				var oOverlay = W5gUtils.getControlOverlay(oParentControl, this.getScope());
				iLastPosition = oUtils.getAggregationByName(oParentControl, sAggregationName).length;
				return this._insertControl(oParentControl, sAggregationName, oInstance, iLastPosition);
			},

			/**
			 * Insert given element in the specific index inside an aggregation. If not multiple aggregation index is ignored.
			 *
			 * @param {sap.ui.core.Element} oParentControl
			 * @param {string} sAggregationName
			 * @param {sap.ui.core.Control} oControl
			 * @param {number=} iControlIndex
			 * @return {Q}
			 * @private
			 */
			_insertControl: function (oParentControl, sAggregationName, oControl, iControlIndex) {
				var oAggregationOverlay = _.find(W5gUtils.getControlOverlay(oParentControl, this.getScope()).getAggregationOverlays(), function (oAggregationOverlay) {
					return oAggregationOverlay.getAggregationName() === sAggregationName;
				});
				if (!W5gUtils.canAggregationOverlayContain(oAggregationOverlay, oControl)) {
					this._notifyInvalidPaste(oControl, oParentControl, sAggregationName);
					//...otherwise control's instance hangs out of DOM, but responsive for all events
					oControl.destroy();
					return Q();
				}

				oControl = CopyPasteUtils.adjustControlBeforeAdd(oControl, oParentControl, sAggregationName, this.getDesignTime());

				this.getScope().jQuery.sap.require('sap.ui.dt.ElementUtil');
				if (oParentControl.getMetadata().getAggregation(sAggregationName).multiple) {
					this.getScope().sap.ui.dt.ElementUtil.insertAggregation(oParentControl, sAggregationName, oControl, iControlIndex);
				} else {
					this.getScope().sap.ui.dt.ElementUtil.addAggregation(oParentControl, sAggregationName, oControl);
				}
				this._oXmlManipulator.emitAddEvent(oControl, sAggregationName, oParentControl.getId(), iControlIndex);
				this.onDataBindingChanged();
				this.selectUI5Control(oControl);
			},

			/**
			 * De-serializes the control from clipboard and return it
			 *
			 * @return {sap.ui.core.Control}
			 * @private
			 */
			_getControlFromClipboard: function () {
				var sXMLWithRevisedIds = CopyPasteUtils.fixAllIds(
					this._sClipboardControlXML,
					this.getRoot().__XMLRootNode.parentNode,
					this._getUI5ControlById.bind(this)
				);
				return this.getScope().sap.ui.xmlfragment({fragmentContent: sXMLWithRevisedIds});
			},

			/**
			 * Publish a generic message to notification area in case of invalid paste
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @param {sap.ui.core.Control} oParentControl
			 * @param {string=} sAggregationName
			 * @private
			 */
			_notifyInvalidPaste: function (oControl, oParentControl, sAggregationName) {
				var sLine1, sControlName = oControl && W5gUtils.getControlTitle(oControl);
				var sControlTitle = W5gUtils.getControlTitle(oParentControl);
				if (sAggregationName) {
					sLine1 = W5gUtils.getText("message_area_control_insert_invalid_in_aggregation", [sControlName, sControlTitle, sAggregationName]);
				} else {
					sLine1 = W5gUtils.getText("message_area_control_insert_invalid", [sControlName, sControlTitle]);
				}
				this._oNotificationBar.updateMessageArea(sLine1, "");
			},

			/**
			 * Paste a control
			 *
			 * @return {Q}
			 */
			paste: function () {
				var that = this,
					oSelectedControl = this.getCurrentSelectedControl(),
					sAggregationName = this._getSelectedAggregation(),
					oUtils = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils, iLastPosition;

				//(1) Aggregation is selected - paste inside it
				if (sAggregationName) {
					iLastPosition = oUtils.getAggregationByName(oSelectedControl, sAggregationName).length;
					return that._insertControl(oSelectedControl, sAggregationName, that._getControlFromClipboard(), iLastPosition);
				} //(2) Paste inside a container control (contains aggregation)
				else if (ControlMetadata.isContainer(oSelectedControl)) {
					var oControlToPaste = that._getControlFromClipboard();
					var aValidAggregationsOverlays = W5gUtils.getValidAggregations(oSelectedControl, oControlToPaste);
					var aValidAggregations = _.map(aValidAggregationsOverlays, function (oAggregationOverlay) {
						return oAggregationOverlay.getAggregationName();
					});
					if (aValidAggregationsOverlays.length === 0) {
						that._notifyInvalidPaste(oControlToPaste, oSelectedControl);
					} else {
						sAggregationName = oSelectedControl.getMetadata().getDefaultAggregationName();
						if (aValidAggregations.indexOf(sAggregationName) === -1) {
							sAggregationName = aValidAggregations[0];
						}
						iLastPosition = oUtils.getAggregationByName(oSelectedControl, sAggregationName).length;
						return that._insertControl(oSelectedControl, sAggregationName, oControlToPaste, iLastPosition);
					}
				} else { //(3) Paste next to a selected control
					return that.pasteSibling(1);
				}
			},

			/**
			 * Paste before or after the selected control depending on the offset parameter
			 *
			 * @param {number} iOffset if zero paste before, if 1 paste after
			 * @return {Q}
			 */
			pasteSibling: function (iOffset) {
				var that = this,
					oSelectedControl = this.getCurrentSelectedControl(),
					oControlToPaste = this._getControlFromClipboard();

				var oSelectedControlOverlay = W5gUtils.getControlOverlay(oSelectedControl);
				var oAggregationOverlay = oSelectedControlOverlay.getParentAggregationOverlay();
				var iControlIndex = oAggregationOverlay.getChildren().indexOf(oSelectedControlOverlay) + iOffset;
				var oParentControl = oAggregationOverlay.getElementInstance();
				return that._insertControl(oParentControl, oAggregationOverlay.getAggregationName(), oControlToPaste, iControlIndex);
			},

			/**
			 * @return {boolean}
			 */
			hasClipboard: function () {
				return !!this._sClipboardControlXML;
			},

			/**
			 * @returns {sap.ui.core.Control}
			 */
			getCurrentSelectedControl: function () {
				var oResult = this._getSelectedControlAndAggregation();
				oResult = oResult && oResult.control;
				if (typeof oResult === "string") {
					oResult = this._getUI5ControlById(oResult);
				}
				return oResult;
			},

			/**
			 * @return {?string}
			 * @private
			 */
			_getSelectedAggregation: function () {
				var oResult = this._getSelectedControlAndAggregation();
				return oResult && oResult.aggregation;
			},

			/**
			 * Get selected control and aggregation stored for current document
			 *
			 * @return {?{control: (sap.ui.core.Control|string), aggregation: string}}
			 * @private
			 */
			_getSelectedControlAndAggregation: function () {
				return this._oCurrentDocument && this._mSelectedUI5Control[this._oCurrentDocument.getKeyString()];
			},

			/**
			 * @return {sap.ui.core.mvc.View}
			 */

			getRoot: function () {
				return this._oCurrentInjectedView;
			},

			/**
			 * Get UI5 control by ID from the view
			 *
			 * @param {string} sId
			 * @return {sap.ui.core.Control|null}
			 * @private
			 */
			_getUI5ControlById: function (sId) {
				var oControl, oView = this.getRoot();
				if (this._oWysiwygCtrl && this.getScope()) {
					oControl = this.getScope().sap.ui.getCore().byId(sId);
				}
				//fallback for a case where id is searched relatively in the view
				return oControl || (oView && oView.byId(sId));
			},

			/**
			 * @return {Window} iframe window
			 */
			getScope: function () {
				return this._oWysiwygCtrl && this._oWysiwygCtrl.getScope();
			},

			/**
			 * Selects UI5 control from the canvas
			 *
			 * @param {sap.ui.core.Control|string} vControl Control to be selected
			 * @param {string=} sAggregation aggregation name, if null it means no aggregation is selected
			 * @return {Q}
			 */
			selectUI5Control: function (vControl, sAggregation) {
				var that = this;
				if (!vControl) {
					return this.deselectUI5Control();
				}
				var oOverlay = this._getOverlay(vControl);
				if (oOverlay) {
					oOverlay.setSelected(true);
				}
				this._mSelectedUI5Control[this._oCurrentDocument.getKeyString()] = {
					control: vControl,
					aggregation: sAggregation
				};
				// grab WebIDE focus
				return this.focus().then(function () {
					return that.fireViewElementSelected();
				});
			},

			/**
			 * Deselects UI5 control from the canvas
			 *
			 */
			deselectUI5Control: function () {
				var assertedSelection = this.getCurrentSelectedControl();
				var oOverlay = this._getOverlay(assertedSelection);
				if (oOverlay) {
					oOverlay.setSelected(false);
				}
				delete this._mSelectedUI5Control[this._oCurrentDocument.getKeyString()];
				return this.fireViewElementSelected();
			},

			/**
			 * Highlights UI5 control from the canvas
			 *
			 * @param  {sap.ui.core.Control|string} oControl Control to be highlighted
			 * @return {undefined}
			 */
			highlightUI5Control: function (oControl) {
				var oOverlay = this._getOverlay(oControl);
				if (oOverlay) {
					oOverlay.addStyleClass("widget-overlay-highlighted");
				}
			},

			/**
			 * Downplays UI5 control from the canvas
			 * @param  {sap.ui.core.Control|string} oControl Control to be downplayed
			 * @return {undefined}
			 */
			downplayUI5Control: function (oControl) {
				var oOverlay = this._getOverlay(oControl);
				if (oOverlay) {
					oOverlay.removeStyleClass("widget-overlay-highlighted");
				}
			},

			/**
			 * Delete after checks if need to ask the user about the deleting before we delete the control
			 *
			 * @return {Q}
			 */
			deleteUI5ControlWithValidations: function () {
				var that = this;
				return W5gUtils.deleteControlWithConfirmationDialog_aux(that.getContext()).then(function (oReturn) {
					if (oReturn.bResult) {
						return that.deleteUI5Control();
					}
				});
			},

			/**
			 * Select another control: Preferably a sibling
			 *
			 * @param {sap.ui.core.Control} oCurrSelection
			 * @private
			 */
			_selectAnother: function (oCurrSelection) {
				var that = this, /** sap.ui.core.Control*/ oAnother = null;
				_.forEach(["next", "previous", "up"], function (sDirection) {
					oAnother = W5gUtils.navigateUI5Control(sDirection, that._oDesignTime);
					if (oAnother && oAnother !== oCurrSelection) { // if they are different break (return false)
						return false;
					}
				});
				return this.selectUI5Control(oAnother);
			},

			/**
			 * Deletes UI5 control from the canvas
			 * The selection is set on another control and triggers re-rendering of the parent control.
			 *
			 * @param  {sap.ui.core.Control=} oControl Control to be deleted
			 * @return {Q}
			 */
			deleteUI5Control: function (oControl) {
				var that = this;
				oControl = oControl || this.getCurrentSelectedControl();

				if (oControl) {
					UsageMonitoringUtils.report("delete_control", oControl.getMetadata().getName());
					var fnAfterRemoveControl = W5gBindingHelper.beforeRemoveControl(oControl);
					return that._selectAnother(oControl).then(function () {
						W5gUtils.removeControl(oControl, that._oXmlManipulator);
						if (fnAfterRemoveControl) {
							fnAfterRemoveControl();
						}
					});
				}
			},

			/**
			 * Changes the selected control
			 *
			 * @param  {"up"|"down"|"previous"|"next"} sTarget Indicates which control is to be selected
			 */
			navigateUI5Control: function (sTarget) {
				var oControl = W5gUtils.navigateUI5Control(sTarget, this._oDesignTime);
				if (oControl) {
					return this.selectUI5Control(oControl);
				}
			},

			getSelection: function () {
				// in the flow of closing editor tabs, it might happen, that getSelection() is called, although the selected Document is null
				// check and return respectively
				if (this._oCurrentDocument) {
					return [{
						document: this._oCurrentDocument,
						control: this.getCurrentSelectedControl(),
						aggregation: this._getSelectedAggregation()
					}];
				} else {
					return null;
				}
			},

			fireViewElementSelected: function () {
				return this.getContext().event.fireViewElementSelected({selection: this.getSelection()});
			},

			goToCode: function () {
				var that = this;
				return that._oCurrentDocument.getContent().then(function (/** string*/ sContent) {
					var oSelectedControl = that.getCurrentSelectedControl();
					var oRange = W5gUtils.xmlNodeToSourceRange(W5gUtils.getXMLNode(oSelectedControl), W5gUtils.getXMLRootNode(oSelectedControl), sContent);
					return W5gUtils.goToCode(that.context, that._oCurrentDocument, oRange);
				});
			},

			getFocusElement: function () {
				var aElement = [],
					oIFrameDomRef = this._oWysiwygCtrl && this._oWysiwygCtrl.getIFrameDomRef();

				if (oIFrameDomRef) {
					var oCanvasContainerLayoutDomRef = this._oEditorContentLayout.$().find(".wysiwygLayoutCanvasContainer")[0];
					if (oCanvasContainerLayoutDomRef) {
						aElement = [oIFrameDomRef, oCanvasContainerLayoutDomRef];
					}
				}
				return aElement;
			},

			/**
			 * Reopens W5G in current tab with new content
			 *
			 * @param {ViewState} oViewStateAfterUndoOrRedo
			 * @returns {Q}
			 * @private
			 */
			_reopenWithViewState: function (oViewStateAfterUndoOrRedo) {
				var sContent = oViewStateAfterUndoOrRedo.getViewStateContent();
				var sSelectedControlId = oViewStateAfterUndoOrRedo.getViewStateSelectedControlId();
				var that = this;
				return that._oCurrentDocument.setContent(sContent, that.getContext().self).then(function () {
					that._sLastViewContent = null; // invalidate cache
					return that._open(that._oCurrentDocument, true);
				}).then(function () {
					that.selectUI5Control(sSelectedControlId);
				});
			},

			undo: function () {
				return this._reopenWithViewState(this._getCurrentUndoRedoStack().undo());
			},

			redo: function () {
				return this._reopenWithViewState(this._getCurrentUndoRedoStack().redo());
			},

			hasUndo: function () {
				return this._getCurrentUndoRedoStack().hasUndo();
			},

			hasRedo: function () {
				return this._getCurrentUndoRedoStack().hasRedo();
			},

			markClean: function () {
				this._getCurrentUndoRedoStack().clean();
			},

			isClean: function () {
				this._getCurrentUndoRedoStack().isClean();
			},

			_getOverlay: function (vControl) {
				if (typeof (vControl) === "string") {
					vControl = this._getUI5ControlById(vControl);
				}
				return W5gUtils.getControlOverlay(vControl, this.getScope());
			},

			/**
			 * Add message to notification bar area
			 *
			 * @param {string} sLine1 line 1 message
			 * @param {string} sLine2 line 2 message
			 * @param {boolean} bAutoClose auto close after some time
			 *
			 * @private
			 */
			_addMessageToNotificationBar: function (sLine1, sLine2, bAutoClose) {
				if (this._oNotificationBar) {
					this._oNotificationBar.updateMessageArea(sLine1, sLine2, bAutoClose);
				}
			}

		});

		return Editor;

	}
);
