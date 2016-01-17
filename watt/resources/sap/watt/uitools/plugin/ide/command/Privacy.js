define(function() {
	"use strict";
	return {

		_oDialog : null,
		_oAllowTrackingoCheckBox : null,

		init : function() {
			var that = this;
			var i18n = this.context.i18n;


			var oOkButton = new sap.ui.commons.Button({
				text : i18n.getText("i18n", "privacy_button_ok"),
				press : [ that._savePrivacy, that ]
			});

			var oCancelButton = new sap.ui.commons.Button({
				text : i18n.getText("i18n", "privacy_button_cancel"),
				press : [ that._closeDialog, that ]
			});

			var oLink = new sap.ui.commons.Link({
				text: i18n.getText("i18n", "privacy_form_statement_link_SAP_HANA_Cloud_Privacy_Statement"),
				press: function() {
					window.open("https://help.hana.ondemand.com/privacy.htm");
				}
			}).addStyleClass("privacyLink");


			var sHtmlText = i18n.getText("i18n", "privacy_form_statement_this_site_is_governed");
			sHtmlText += '<embed data-index=\"0\">.<br><br>';
			sHtmlText+= i18n.getText("i18n", "privacy_form_statement_details1");
			sHtmlText+='<br><br>';
			sHtmlText+= i18n.getText("i18n", "privacy_form_statement_details2");
			sHtmlText+='<br><br>';
			
			var oFormattedTextView = new sap.ui.commons.FormattedTextView({});
			oFormattedTextView.setHtmlText(sHtmlText);
			oFormattedTextView.addControl(oLink);

			this._oAllowTrackingoCheckBox = new sap.ui.commons.CheckBox({
				text: i18n.getText("i18n", "allow_tracking")
			});


			this._oDialog = new sap.ui.commons.Dialog("PrivacyDialog", {
				title : i18n.getText("i18n", "privacy_form_title"),
				content : [oFormattedTextView, this._oAllowTrackingoCheckBox],
				buttons : [ oOkButton, oCancelButton ],
				resizable : false,
				keepInWindow : true,
				modal : true,
				width : "30%"
			});
		},

		_savePrivacy : function() {
			this.context.service.preferences.set({allowTracking : this._oAllowTrackingoCheckBox.getChecked()}, "UsageAnalytics");
			this._oDialog.close();
		},

		_closeDialog : function() {
			this._oDialog.close();
		},
		execute : function(vValue, oWindow) {
			var that = this;
			this.context.service.usagemonitoring.report("IDE", "Commands", this.context.self._sName).done();
			return this.context.service.preferences.get("UsageAnalytics").then(function(oUsageAnalyticsReportSetting) {
				that._oAllowTrackingoCheckBox.setChecked(true);
				if (oUsageAnalyticsReportSetting && oUsageAnalyticsReportSetting.allowTracking === false){
					that._oAllowTrackingoCheckBox.setChecked(false);
				}

				that._oDialog.open();
			});
		}
	};
});