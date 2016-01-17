define(function() {
	"use strict";
	return {
		execute: function() {
			var that = this;
			var oSelectionService = this.context.service.selection;
			var oUserNotificationService = this.context.service.usernotification;
			return oSelectionService.getSelection().then(function(aSelection) {
				if (aSelection[0] && aSelection[0].document && aSelection[0].document.getEntity()) {
					var oDocument = aSelection[0].document;
					var warningMessage = that.context.i18n.getText("i18n", "commandDelete_confirm", [oDocument.getEntity().getName()]);
					return oUserNotificationService.confirm(warningMessage).then(function(oUserResult) {
						if (oUserResult.bResult) {
							return oDocument.delete();
						}
					});
				}
			});
		},

		isEnabled: function() {
			var oSelectionService = this.context.service.selection;
			return oSelectionService.assertNotEmpty().then(function(aSelection) {
				var rowSelectedAndNotStaged = aSelection[0].stageTableRow && !aSelection[0].stageTableRow.Stage;
				var status = aSelection[0].stageTableRow.Status;
				return (aSelection[0].document && rowSelectedAndNotStaged && (status === "U" || status === "M"));
				
			});
		}
	};
});