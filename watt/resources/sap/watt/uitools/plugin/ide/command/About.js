define(function() {
	"use strict";
	return {

		_oContent : null,
		_oDialog : null,
		_oOkButton : null,
		_oDialogLayout : null,

		init : function() {
			var that = this;
			this._oContent = new sap.ui.core.HTML({

			});

			this._oOkButton = new sap.ui.commons.Button({
				text : this.context.i18n.getText("i18n", "about_ok"),
				enabled : true,
				press : [ that._closeDialog, that ]
			});

			this._oDialog = new sap.ui.commons.Dialog("AboutDialog", {
				title : this.context.i18n.getText("i18n", "about_about"),
				buttons : [ this._oOkButton ],
				defaultButton : this._oOkButton,
				resizable : false,
				keepInWindow : true,
				modal : true
			});
		},

		execute : function() {
			var that = this;

			var fShowVersionMessageBox = function(sMessage) {
				if (!sMessage || sMessage == "") {
					sMessage = this.context.i18n.getText("i18n", "about_noVersionAvailable");
				}
				that._oContent.setContent(sMessage);
				that._oDialog.removeAllContent();
				that._oDialog.addContent(that._oContent);
				that._oDialog.open();
			};

			var sUrl = jQuery.sap.getModulePath("sap.watt.uitools.version", ".json");
			Q(jQuery.ajax({
				url : sUrl,
				dataType : "json"
			}).then(function(mVersion) {

				var sVersion = "<td>Version:</td><td id='watt--ide--version'>" //id is used by selenium test only
						+ mVersion.version.replace("SNAPSHOT", mVersion.timestamp) + "</td>";

				var sInternal = "";
				if (sap.watt.getEnv("internal")) {
					sInternal = "<td colspan=2><br>" + that.context.i18n.getText("i18n", "about_internal") + "</td>";
				}

				var sText = "<table>" + "<tr>" + sVersion + "</tr>" + "<tr>" + sInternal + "</tr>" + "</table>";
				fShowVersionMessageBox(sText);
			}, function() {
				fShowVersionMessageBox();
			})).done();
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
		},

		_closeDialog : function() {
			this._oDialog.close();
		}
	};
});