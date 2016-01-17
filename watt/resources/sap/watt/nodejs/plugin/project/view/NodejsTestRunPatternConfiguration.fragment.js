(function() {

	"use strict";

	sap.ui.jsfragment("sap.xs.nodejs.project.view.NodejsTestRunPatternConfiguration", {

		_oContext: undefined,

		_onPatternFieldChange: function(oEvent) {

			var sValue = oEvent.getParameter("liveValue");

			var oControlData = {
				oControl: oEvent.getSource(),
				sControlId: oEvent.getSource().sId
			};

			if (/^[\w\,\s-\.\?\*]+$/igm.test(sValue)) {
				oControlData.isControlValid = true;
			} else {
				oControlData.isControlValid = false;
				var sMsg = this._oContext.i18n.getText("{i18n>testRunConfig_invalidTestPattern_xmsg}");
				oControlData.sInvalidMessage = sMsg;
			}

			this._oContext.service.baseerrorhandler.update(oControlData);
		},

		createContent: function(oController) {
			jQuery.sap.require("sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl");

			var that = this;
			this._oContext = oController.context;

			// label
			var oTitle = new sap.ui.commons.Title({
				text: "{i18n>testRunConfig_testPattern_xtit}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			var oTestPatternLabel = new sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl({});
			oTestPatternLabel.setAggregation("title", oTitle);

			// input field
			var oTestPatternText = new sap.ui.commons.TextField({
				value: "{/testPattern}",
				liveChange: function(oEvent) {
					that._onPatternFieldChange(oEvent);
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			return [oTestPatternLabel, oTestPatternText];
		}
	});
}());
