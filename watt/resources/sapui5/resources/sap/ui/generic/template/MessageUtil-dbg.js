/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([
	"jquery.sap.global", "sap/ui/base/ManagedObject", "sap/m/MessageBox", "sap/m/Dialog"
], function(jQuery, ManagedObject, MessageBox, Dialog) {
	"use strict";

	var MessageUtil = ManagedObject.extend("sap.ui.generic.template.MessageUtil", {
		metadata: {
			properties: {
				/**
				 * The used controller
				 */
				controller: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The response (error or successful response)
				 */
				response: {
					type: "object",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	MessageUtil.prototype._httpStatusCodes = {
		badRequest: "400",
		forbidden: "403",
		methodNotAllowed: "405",
		preconditionFailed: "428",
		internalServerError: "500"
	};

	MessageUtil.prototype.handleError = function(mParameters) {
		mParameters = mParameters || {};
		var oErrorContext = mParameters.errorContext || {};
		var oError = this.getResponse();
		var oController = this.getController();

		var sMessage = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template").getText("ERROR_UNKNOWN");
		var sHttpStatusCode;

		if (oError instanceof Error) {
			// promise rejection
			if (oError.message) {
				// TODO differentiate between technical errors and business errors in case of promise rejections
				sMessage = oError.message;
			}
		} else if (oError.response) { // odata error
			if (oError.response.message) {
				// TODO differentiate between technical errors and business errors in case of promise rejections
				sMessage = oError.response.message;
			}

			// check http status code
			if (oError.response.statusCode) {
				sHttpStatusCode = oError.response.statusCode;
			}

			// check for content type of response - in case of a runtime error on the backend it is xml
			if (oError.response.headers) {
				for ( var sHeader in oError.response.headers) {
					if (sHeader.toLowerCase() === 'content-type') {
						var sHeaderValue = oError.response.headers[sHeader];
						if (sHeaderValue.toLowerCase().indexOf('application/json') === 0) {
							if (oError.response.responseText) {
								var oODataError = JSON.parse(oError.response.responseText);
								if (oODataError && oODataError.error && oODataError.error.message && oODataError.error.message.value) {
									sMessage = oODataError.error.message.value;
								}
							}
						} else {
							if (oError.message) {
								sMessage = oError.message;
							}
						}
						break;
					}// if content-type is not application/json it is usually an internal server error (status code 500)
				}
			}
		}

		var bShowMessageBox = true;

		// var isList = mParameters.isList || true;
		// error situations:
		// Draft SourceOperation=action
		// action & list & single select & editable=false -> MessageBox
		// action & detail & editable=false -> MessageBox
		// action & detail & editable=true -> MessageBox

		// Non-draft SourceOperation=action
		// action & list & single select & editable=false -> MessageBox
		// action & detail & editable=false -> MessageBox
		// action & detail & editable=true -> MessageBox
		// save/merge & action & detail & editable=true -> ?

		// Non-draft SourceOperation=create/update/patch
		// post/put/patch/merge & detail & editable=true -> evaluate status code
		// -> 400 Bad Request -> Message Box + MessagePopover
		// -> 403 Forbidden -> Message Page
		// -> 405 Method Not Allowed -> Message Page
		// -> 428 Precondition Failed -> Message Page
		// -> 500 Internal Server Error -> Message Page

		// Draft SourceOperation=create/update/patch
		// post on new root -> MessagePage
		// post on new item -> ?MessagePage
		// post/put/patch/merge/prepare & detail & editable=true -> evaluate status code
		// -> 400 Bad Request -> MessagePage
		// -> 403 Forbidden -> Message Page
		// -> 405 Method Not Allowed -> Message Page
		// -> 428 Precondition Failed -> Message Page
		// -> 500 Internal Server Error -> Message Page
		switch (oErrorContext.lastOperation.name) {
			case '':
				break;
			case oController.operations.callAction:
				break;
			case oController.operations.addEntry:
				bShowMessageBox = false;
				break;
			case oController.operations.modifyEntity:
				if (this._httpStatusCodes.preconditionFailed === sHttpStatusCode) {
					// navigate to message page if etag is invalid
					bShowMessageBox = false;
				}
				break;
			case oController.operations.saveEntity:
				if (oErrorContext.isDraft) {
					// save operation should always be successful in draft case - therefore navigate to message page
					bShowMessageBox = false;
				}
				// save operation (PUT/PATCH/MERGE) in non-draft scenarios fail due to business errors - therefore stay on details page
				break;
			case oController.operations.deleteEntity:
				// does it make a difference if it is the root or items of a root? what happens to list in details etc.?
				break;
			case oController.operations.editEntity:
				// edit function import or just edit mode in non-draft scenarios - stay on details screen
				break;
			case oController.operations.validateDraftEntity:
				break;
			case oController.operations.prepareDraftEntity:
				// prepare should never lead to technical errors
				bShowMessageBox = false;
				break;
			case oController.operations.activateDraftEntity:
				// business errors are transported via activation in case of minimal draft enabled
				break;
			default:
				break;
		}

		var mMessageParameters = {
			entitySet: oErrorContext.entitySet,
			title: mParameters.title,
			message: sMessage
		};

		if (bShowMessageBox) {
			if (oErrorContext.showMessages) {
				// only show message box if current view doesn't have a message popover
				this._showMessageBox(mMessageParameters);
			}
		} else {
			this._showMessagePage(mMessageParameters);
		}

	};

	MessageUtil.prototype._showMessageBox = function(mParameters) {
		sap.m.MessageBox.show(mParameters.message, {
			icon: mParameters.messageBoxIcon || sap.m.MessageBox.Icon.ERROR,
			title: mParameters.title || sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template").getText("ERROR_TITLE"),
			actions: [
				sap.m.MessageBox.Action.OK
			],
			onClose: function(oAction) {

			},
			styleClass: this._getCompactModeStyleClass()
		});
	};

	MessageUtil.prototype._showMessagePage = function(mParameters) {
		var oNavigationController = this.getController().getNavigationController();
		oNavigationController.navigateToMessagePage({
			entitySet: mParameters.entitySet,
			title: mParameters.title,
			text: mParameters.message
		});
	};

	MessageUtil.prototype._getCompactModeStyleClass = function() {
		if (this.getController().getView().$().closest(".sapUiSizeCompact").length) {
			return "sapUiSizeCompact";
		}
		return "";
	};

	MessageUtil.prototype.handleSuccess = function(mParameters) {
		mParameters = mParameters || {};
		var oSuccessContext = mParameters.successContext || {};
		var oResponse, oMessage, aMessages;
		oResponse = this.getResponse();
		// response of oResponse object contains response incl. http headers etc.
		aMessages = this._getMessages(oResponse.response);
		if (aMessages && aMessages.length > 0) {
			if (aMessages.length === 1) {
				oMessage = aMessages[0];
				if (oMessage.state === sap.ui.core.ValueState.Success) {
					this._showSuccessToast(oMessage);
				} else {
					if (oSuccessContext.showMessages) {
						// clarify with UX -> show single warning/error message also as toast
						this._showMessages(aMessages);
					}
				}
			} else {
				if (oSuccessContext.showMessages) {
					// only show message box if current view doesn't have a message popover
					this._showMessages(aMessages);
				}
			}
		}
	};

	/**
	 * Retrieves the messages of the response
	 */
	MessageUtil.prototype._getMessages = function(oResponse) {
		var aMessages = [];
		if (!oResponse || !oResponse.statusCode) {
			return;
		}
		// check whether request was successful
		if (oResponse.statusCode.toString().substring(0, 1) === "2") {

			// *** handle messages which were passed in SUCCESSFUL requests
			if (oResponse.headers["sap-message"]) {

				var oMessageJSON = oResponse.headers["sap-message"];
				var oMessage = JSON.parse(oMessageJSON);
				aMessages.push(this._getMessage(oMessage));

				if (oMessage.details) {
					for (var i = 0; i < oMessage.details.length; i++) {
						aMessages.push(this._getMessage(oMessage.details[i]));
					}
				}
			}
		}
		return aMessages;
	};

	/**
	 * Retrieves the message from the given raw message response entry
	 * 
	 * @private
	 */
	MessageUtil.prototype._getMessage = function(oMessageResponseEntry) {
		var sIcon, sState;

		switch (oMessageResponseEntry.severity) {
			case "info":
				sIcon = "sap-icon://sys-enter";
				sState = sap.ui.core.ValueState.Success;
				break;
			case "warning":
				sIcon = "sap-icon://notification";
				sState = sap.ui.core.ValueState.Warning;
				break;
			case "error":
				sIcon = "sap-icon://error";
				sState = sap.ui.core.ValueState.Error;
				break;
			default:
				sIcon = "sap-icon://sys-enter";
				sState = sap.ui.core.ValueState.Success;
				break;
		}

		var oMessage = {
			message: oMessageResponseEntry.message,
			code: oMessageResponseEntry.messageCode,
			target: oMessageResponseEntry.target,
			icon: sIcon,
			state: sState
		};

		return oMessage;
	};

	MessageUtil.prototype._showSuccessToast = function(oMessage) {
		sap.m.MessageToast.show(oMessage.message);
	};

	MessageUtil.prototype._showMessages = function(aMessages) {
		var oMessageModel, oDialog;
		var that = this;

		oMessageModel = new sap.ui.model.json.JSONModel();
		oMessageModel.setData({
			messages: aMessages
		});

		oDialog = new sap.m.Dialog({
			content: that.getMessageTable(),
			type: sap.m.DialogType.Message,
			state: "None",
			afterClose: function() {
				oDialog.destroy();
			},
			buttons: [
				new sap.m.Button({
					// TODO text
					text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template").getText("DIALOG_CLOSE"),
					press: function() {
						oDialog.close();
					}
				})
			]
		});
		oDialog.setModel(oMessageModel);
		oDialog.open();
	};

	MessageUtil.prototype.getMessageTable = function() {
		var oMessageTable = new sap.m.Table({
			growing: false,
			showSeparators: sap.m.ListSeparators.None,
			inset: false,
			fixedLayout: false,
			backgroundDesign: sap.m.BackgroundDesign.Transparent,
			columns: [
				new sap.m.Column({
					hAlign: "Left",
					vAlign: "Top"
				})
			]
		});

		var that = this;
		var template = new sap.m.ColumnListItem({
			unread: false,
			vAlign: "Top",
			type: "{itemType}",
			press: function(oEvt) {
				that._navigateToDetail(oEvt);
			},
			cells: [
				new sap.ui.layout.Grid({
					vSpacing: 0,
					hSpacing: 1,
					content: [

						new sap.m.ObjectStatus({
							icon: "{icon}",
							state: "{state}",
							layoutData: new sap.ui.layout.GridData({
								span: "L2 M2 S2"
							})
						}), new sap.m.Text({
							maxLines: 3,
							text: "{message}",
							layoutData: new sap.ui.layout.GridData({
								span: "L10 M10 S10"
							})
						})
					]
				})
			]
		});

		oMessageTable.bindAggregation("items", "/messages", template);
		return oMessageTable;
	};

	return MessageUtil;

}, /* bExport= */true);
