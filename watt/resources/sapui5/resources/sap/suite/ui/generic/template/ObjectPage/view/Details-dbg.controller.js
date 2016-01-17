sap.ui.define(["sap/suite/ui/generic/template/lib/TemplateViewController", "sap/m/Table"], function(BaseController, Table) {
	"use strict";

	return BaseController.extend("sap.suite.ui.generic.template.ObjectPage.view.Details", {

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this.triggerPrepareOnEnterKeyPress();
			var bShell = false;
			try {
				bShell = sap.ushell.Container.getService("URLParsing").isIntentUrl(document.URL) ? true : false;
			} catch (err) {
				jQuery.sap.log.error("Detail.controller: UShell service is not available.");
			}
			var oAdminModel = new sap.ui.model.json.JSONModel({
				HasDetail: !this.getOwnerComponent().getIsLeaf(),
				HasShell: bShell
			});
			oAdminModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oAdminModel, "admin");
		},
	
		onPressDraftInfo: function(oEvent) {
			var oContext = this.getContext();
			var oLockButton = sap.ui.getCore().byId(oEvent.getSource().getId() + "-lock");
			BaseController.prototype.fnDraftPopover.call(this, this, oContext, this.oView, oLockButton);
		}
	});
}, /* bExport= */true);
