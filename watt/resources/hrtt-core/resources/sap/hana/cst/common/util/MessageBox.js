/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(function() {

	jQuery.sap.require("sap.ui.commons.MessageBox");

	return {

		alert: function(sMessage, sTitle, fnCallback) {
			return this.showMsg(sMessage, sTitle, null, null, fnCallback);
		},

		showWarningMsg: function(sMessage, sTitle, fnCallback) {
			return this.showMsg(sMessage, sTitle, sap.ui.commons.MessageBox.Icon.WARNING, null, fnCallback);
		},

		showQuestionMsg: function(sMessage, sTitle, fnCallback) {
			return this.showMsg(sMessage, sTitle, sap.ui.commons.MessageBox.Icon.QUESTION, [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox
								.Action.NO],
				fnCallback,
				sap.ui.commons.MessageBox.Action.NO);
		},

		showErrorMsg: function(sMessage, sTitle, fnCallback) {
			return this.showMsg(sMessage, sTitle, sap.ui.commons.MessageBox.Icon.ERROR, null, fnCallback);
		},

		showMsg: function(sMessage, sTitle, oIcon, vActions, fnCallback, oDefaultAction) {
			if (!sTitle) {
				sTitle = "HANA Web CST";
			}

			if (!oIcon) {
				oIcon = sap.ui.commons.MessageBox.Icon.INFORMATION;
			}

			if (!vActions && !oDefaultAction) {
				vActions = [sap.ui.commons.MessageBox.Action.OK];
				oDefaultAction = sap.ui.commons.MessageBox.Action.OK;
			} else {
				if (!vActions) {
					vActions = [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO];
				}

				if (!oDefaultAction) {
					oDefaultAction = sap.ui.commons.MessageBox.Action.YES;
				}
			}

			sap.ui.commons.MessageBox.show(sMessage, oIcon, sTitle, vActions, fnCallback, oDefaultAction);
		},

		showCustomMsg: function(param) {
		    var that = this;
			param = param || {};
			param.autoClose = param.autoClose || false;
			if (param.bModal === null || param.bModal === undefined) {
				param.bModal = true;
			}

			if (!param.minWidth) {
				param.minWidth = "300px";
			}

			if (!param.minHeight) {
				param.minHeight = "120px";
			}

			var oDialog = new sap.ui.commons.Dialog({
				modal: param.bModal,
				minHeight: param.minHeight,
				minWidth: param.minWidth,
				autoClose: param.autoClose,
				resizable: false,
				keepInWindow: true
			});

			var i;
			if (param.vMessage && param.vMessage instanceof sap.ui.core.Control) {
				oDialog.addContent(param.vMessage);
			} else if (param.vMessage && typeof param.vMessage === "string") {
				var oText = new sap.ui.commons.TextView({
					text: param.vMessage
				});
				oDialog.addContent(oText);
			} else if (param.vMessage && param.vMessage.length > 0) {
				var oLayout = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: false
				});
				for (i = 0; i < param.vMessage.length; i++) {
					if (param.vMessage[i] instanceof sap.ui.core.Control) {
						oLayout.createRow(param.vMessage[i]);
					}
				}
				oDialog.addContent(oLayout);
			} else {
				// when using destroy the dialog the hotkey of the command be disabled
				// oDialog.destroy();
				return false;
			}

			if (param.sTitle) {
				oDialog.setTitle(param.sTitle);
			}

            if (param.autoClose === false && param.bModal === true) {
    			if (!param.aActions) {
    				param.aActions = [{
    					"text": "OK",
    					"keyid": "OK"
                    }, {
    					"text": "CANCEL",
    					"keyid": "CANCEL"
                    }];
    			}
            }

			if (!param.fnCallBack || !param.fnCallBack instanceof Function) {
				param.fnCallBack = function(keyid) {};
			}

			if (!param.iDefaultAction || param.iDefaultAction >= param.aActions.length) {
				param.iDefaultAction = 0;
			}
			
            if (param.aActions) {
    			for (i = 0; i < param.aActions.length; i++) {
    				oDialog.addButton(_createBtn(param.aActions[i].text, i));
    			}
            }

			var btns = oDialog.getButtons();
			oDialog.attachClosed(null, _closeDialog, that);
			oDialog.setInitialFocus(btns[param.iDefaultAction]);

			// createButton handler
			function _createBtn(sTxt, idx) {
				return new sap.ui.commons.Button({
					text: sTxt,
					press: function(oEvent) {
						if (oDialog) {
							oDialog.detachClosed(_closeDialog, that);
							oDialog.close();
							oDialog.destroy();
						}
						param.fnCallBack(param.aActions[idx].keyid);
					}
				});
			}

			// _closeDialog handler
			function _closeDialog(e) {
				if (param.fnAttachClosed && param.fnAttachClosed instanceof Function) {
					param.fnAttachClosed(e);
				}
				var oSrc = e.getSource();
				var sId = oSrc.getId();
				var oDlg = sap.ui.getCore().byId(sId);
				if (oDlg) {
					oDlg.destroy();
				}
				// when using destroy the dialog, the hotkey of the command be disabled
				// oDialog.destroy();
			}

			return oDialog;
		}
	};
});