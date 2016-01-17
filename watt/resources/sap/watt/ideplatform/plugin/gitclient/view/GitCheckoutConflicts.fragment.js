sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitCheckoutConflicts", {

	createContent : function(oController) {
		var oDialog = new sap.ui.commons.Dialog({
			width : "40%",
			modal : true,
			title : "{i18n>gITConflictErrorFragment_dialog_title}"
		});

		var oDescriptionLabel = new sap.ui.commons.Label({
			width : "100%",
			text : {
				path : "/checkoutBranch",
				formatter : function(checkoutBranch) {
					if (!checkoutBranch) {
						return "";
					}
					return this.getModel("i18n").getResourceBundle().getText("gITConflictErrorFragment_description_label",
							[ checkoutBranch ]);
				}
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			wrapping : true
		}).addStyleClass("gitCheckoutConflictsLabel");

		var oConflictsTable = new sap.ui.table.Table({
			selectionMode : sap.ui.table.SelectionMode.None,
			editable : false,
			columnHeaderVisible : false,
			width : "100%"
		}).addStyleClass("gitCheckoutConflictsTable");

		oConflictsTable.addColumn(new sap.ui.table.Column({
			label : "File Path",
			template : "fileName",
			width : "100%"
		}));

		oConflictsTable.bindRows("/files");

		oDialog.addContent(oDescriptionLabel);
		oDialog.addContent(oConflictsTable);

		oDialog.addButton(new sap.ui.commons.Button({
			text : "{i18n>gitErrorFragment_reset_button}",
			tooltip : "{i18n>gITConflictErrorFragment_reset_tooltip}",
			press : [ oController.resetHard, oController ]
		}));

		oDialog.addButton(new sap.ui.commons.Button({
			text : "{i18n>button_cancel}",
			press : [ oController.cancel, oController ]
		}));

		//Add event listener to escape in order to stop button spinning 
		oDialog.addEventDelegate({
			onsapescape : oController.cancel
		}, oController);

		return oDialog;

	}

});