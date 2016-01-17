define(function() {
	"use strict";
	return {

		_messageBox: null,

		_oOpenQueue: new Q.sap.Queue(),

		_oResult: {
			sResult: null,
			bResult: undefined
		},

		_oMessageTypes: {
			"error": {
				"type": "error",
				"title": "",
				"id": "MSG_ERROR"
			},
			"info": {
				"type": "info",
				"title": "",
				"id": "MSG_INFO"
			},
			"warning": {
				"type": "warning",
				"title": "",
				"id": "MSG_WARNING"
			},
			"confirm": {
				"type": "info",
				"title": "",
				"id": "MSG_CONFIRM"
			},
			"confirmYesNo": {
				"type": "info",
				"title": "",
				"id": "MSG_YESNO"
			},
			"confirmWithCancel": {
				"type": "info",
				"title": "",
				"id": "MSG_YESNOCANCEL"
			}
		},

		init: function() {
			for (var oType in this._oMessageTypes) {
				this._oMessageTypes[oType].title = this.context.i18n.getText("i18n", "usernotification_" + oType + "_title");
			}
			jQuery.sap.require("sap.ui.commons.MessageBox");
			this._messageBox = sap.ui.commons.MessageBox;
		},

		_processMessage: function(sMessage) {
			return sMessage.replace("/", "\/").replace("{", "\{").replace("}", "\}");
		},

		_confirm: function(oControl, bCancleable) {
			var oDeferred = Q.defer();
			var that = this;
			if (typeof(oControl) === "string") {
				oControl = this._processMessage(oControl);
			}
			this.context.service.focus.context.event.fire$dialogOpened();
			if (bCancleable) {
				this._messageBox.show(oControl, this._messageBox.Icon.NONE, this._oMessageTypes.confirmWithCancel.title, [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons
						.MessageBox.Action.NO,
								sap.ui.commons.MessageBox.Action.CANCEL], function(sResult) {
					that.context.service.focus.context.event.fire$dialogClosed();
					that._oResult.sResult = sResult;
					that._oResult.bResult = (sResult === "YES");
					oDeferred.resolve(that._oResult);
				}, sap.ui.commons.MessageBox.Action.CANCEL, this._oMessageTypes.confirmWithCancel.id);
			} else {
				this._messageBox.confirm(oControl, function(bResult) {
					that.context.service.focus.context.event.fire$dialogClosed();
					that._oResult.sResult = (bResult ? "YES" : "NO");
					that._oResult.bResult = bResult;
					oDeferred.resolve(that._oResult);
				}, this._oMessageTypes.confirm.title, this._oMessageTypes.confirm.id);
			}
			return oDeferred.promise;
		},

		confirm: function(oControl, bCancleable) {
			var that = this;
			return this._oOpenQueue.next(function() {
				return that._confirm(oControl, bCancleable);
			});
		},

		_confirmYesNo: function(oControl, title) {
			var oDeferred = Q.defer();
			var that = this;
			if (typeof(oControl) === "string") {
				oControl = this._processMessage(oControl);
			}
			this.context.service.focus.context.event.fire$dialogOpened();
			this._messageBox.show(oControl, this._messageBox.Icon.NONE, title, [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(
				sResult) {
				that.context.service.focus.context.event.fire$dialogClosed();
				that._oResult.sResult = sResult;
				that._oResult.bResult = (sResult === "YES");
				oDeferred.resolve(that._oResult);
			}, sap.ui.commons.MessageBox.Action.CANCEL, this._oMessageTypes.confirmWithCancel.id);

			return oDeferred.promise;
		},

		confirmYesNo: function(oControl, title) {
			var that = this;
			title = title || this._oMessageTypes.confirmWithCancel.title;
			return this._oOpenQueue.next(function() {
				return that._confirmYesNo(oControl, title);
			});
		},

		_okDialog: function(oControl, oMsgType) {
			var oDeferred = Q.defer();
			var that = this;
			if (typeof(oControl) === "string") {
				oControl = this._processMessage(oControl);
				switch (oMsgType.type) {
					case "error":
						console.error(oControl);
						break;
					case "warning":
						console.warn(oControl);
						break;
					default:
						console.info(oControl);
						break;
				}
			}
			this.context.service.focus.context.event.fire$dialogOpened();
			this._messageBox.show((oControl.message || oControl), this._messageBox.Icon.NONE, oMsgType.title, [sap.ui.commons.MessageBox.Action.OK], function(sResult) {
				that.context.service.focus.context.event.fire$dialogClosed();
				that._oResult.sResult = sResult;
				that._oResult.bResult = (sResult === "OK");
				oDeferred.resolve(that._oResult);
			}, sap.ui.commons.MessageBox.Action.OK, oMsgType.id);

			return oDeferred.promise;
		},

		info: function(oControl) {
			var that = this;
			return this._oOpenQueue.next(function() {
				return that._okDialog(oControl, that._oMessageTypes.info);
			});
		},

		warning: function(oControl) {
			var that = this;
			return this._oOpenQueue.next(function() {
				return that._okDialog(oControl, that._oMessageTypes.warning);
			});
		},

		alert: function(oControl) {
			var that = this;
			return this._oOpenQueue.next(function() {
				return that._okDialog(oControl, that._oMessageTypes.error);
			});
		},

		liteInfo: function(sMessage, bAutoDisappear) {
			return this.context.service.usernotificationbar.display(sMessage, null, bAutoDisappear);
		},

		liteInfoWithAction: function(sMessage, sCommandId, bAutoDisappear, oCommandExecuteValue) {
			return this.context.service.usernotificationbar.display(sMessage, sCommandId, bAutoDisappear, oCommandExecuteValue);
		}
	};
});