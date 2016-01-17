define(["../util/UIAdaptationMessageHandler"], function (MessageHandler) {

	return sap.ui.controller("sap.watt.saptoolsets.fiori.project.plugin.uiadaptation.ui.UIAdaptationPane", {
		_oContext : null,
		_oMessageHandler : null,
		_oProjectDocument : null,
		_sComponentName : null,
		_sFrameUrl : null,
		_sIdeSrc : null,
		_oIframe : null,
		_oClosingPromise : null,

		onInit : function () {
			this._oClosingPromise = Q.defer();
			var mViewData = this.getView().getViewData();
			this._oContext = mViewData.oContext;
			this._sComponentName = mViewData.sComponentName;
			this._sFrameUrl = mViewData.sFrameUrl + "&sap-ui-layer=" + mViewData.sLayer;
			this._sIdeSrc = mViewData.sIdeSrc;
			this._oProjectDocument = mViewData.oProjectDoc;
		},

		onAfterRendering : function () {
			// Only execute on first load of pane, from there this should not happen again,
			// This is due to the fact that the iFrame element must be rendered before being passed tp the preview
			if (!this._oIframe) {
				var sFrameId = this.getView().createId("adaptUiPreview");
				this._oIframe = $("#" + sFrameId).load({
					oController : this
				}, this._onPreviewLoad);
				this._oContext.service.preview.showPreview(this._sFrameUrl, this._oIframe[0].contentWindow, false, {
					"AdaptUIDropDown": {
						"id": "AdaptUIDropDown",
						"default": "ADAPT_UI",
						"items": {
							"ADAPT_UI": {
								"label": this._oContext.i18n.getText("i18n", "AdaptationPane_AdaptUI")
							},
							"STOP_ADAPT_UI": {
								"label": this._oContext.i18n.getText("i18n", "AdaptationPane_PreviewMode")
							}
						}
					}
				}).done();
			}
		},

		getAppComponentName : function () {
			return this._sComponentName;
		},

		getChangesFromWorkspace : function () {
			return this._oContext.service.uiadaptation.loadChangesFromWorkspace(this._oProjectDocument);
		},

		createChange : function (oChange) {
			var that = this;
			return this._oContext.service.uiadaptation.saveChangeToWorkspace(this._oProjectDocument, oChange).then(function() {
				that._oMessageHandler.postMessage({
					action: "CHANGE_SAVED"
				});
			}).fail(function(oError) {
				that._oMessageHandler.postMessage({
					action: "CHANGE_SAVE_FAILED",
					message : oError.message || oError
				});
			});
		},

		getVariant : function () {
			return this._oContext.service.uiadaptation.getVariantForLREPChanges(this._oProjectDocument);
		},

		onSwitchToAdaptUi : function () {
			var that = this;
			return this.getVariant().then(function (sVariant) {
				that._oMessageHandler.postMessage({
					action : "START_RTA",
					variant : sVariant
				});
			});
		},

		onSwitchToPreview : function () {
			this._oMessageHandler.postMessage({
				action : "STOP_RTA"
			});
		},

		onLoadChangesFail : function (sError) {
			sap.ui.commons.MessageBox.alert(this._oContext.i18n.getText("i18n", "AdaptationPane_loadChangesFailed") + sError);
		},

		/**
		 * This handler releases the closing promise. It is triggered by an event inside the UIAdaptationTransceiver.js file
		 * when RTA is closed inside the preview frame after all changes made are saved.
		 */
		onClose : function() {
			this._oClosingPromise.resolve();
		},

		_onPreviewLoad : function(oParams) {
			var oPreviewFrame = this;
			var oPaneController = oParams.data.oController;
			try {
				$(oPreviewFrame).contents();
			} catch (e) {
				return;
			}
			// when the preview iframe is loaded, find the app iframe element (its id is "display")
			// check if the iFrame has an event handler for messages ("this" is the iFrame)
			var oDisplayElement = $(oPreviewFrame).contents().find("#display");
			oDisplayElement.load(function() {
				// The "this" in here is the iFrame in which the application itself is running
				var oTarget = this.src;
				// TODO: The following "if" statement is a temporary patch until preview server on local installation is fixed
				if (sap.watt.getEnv("server_type") === "java" || sap.watt.getEnv("server_type") === "local_hcproxy") {
					oTarget = "*";
				}
				if (oPaneController._oMessageHandler) {
					oPaneController._oMessageHandler.detachHandler();
				}

				var aOrigins = [];
				aOrigins.push(oPaneController._sIdeSrc);
				aOrigins.push(this.src);
				oPaneController._oMessageHandler = new MessageHandler(this, aOrigins, oTarget, oPaneController);
				// post changes at load
				oPaneController.getChangesFromWorkspace().then(function(oChanges) {
					oPaneController._oMessageHandler.postMessage({
						"action": "CHANGES",
						"changes": oChanges,
						"componentName": oPaneController.getAppComponentName()
					});
				}).fail(function(oError) {
					oPaneController._oMessageHandler.postMessage({
						"action": "LOAD_CHANGES_ERROR",
						"error": oError.message
					});
					oPaneController.onLoadChangesFail(oError.message);
				}).finally(function() {
					return oPaneController.onSwitchToAdaptUi();
				}).done();
			});
		},

		/**
		 * This is a handler that must be called by whoever wishes to close the pane.
		 * @returns {Promise} - when this promise is resolved the view is ready to be destroyed.
		 */
		onBeforeExit : function() {
			if (this._oMessageHandler) {
				//send post message to stop RTA - and triggers save changes.
				this._oMessageHandler.postMessage({
					action : "STOP_RTA",
					type : "close"
				});
			} else {
				// If message handler was never instantiated resolve the promise so that the pane can be closed (RTA is not usable at this point)
				this._oClosingPromise.resolve();
			}

			var that = this;
			return this._oClosingPromise.promise.then(function() {
				if (that._oMessageHandler) {
					that._oMessageHandler.detachHandler();
					that._oMessageHandler = null;
				}
			});
		}
	});
});