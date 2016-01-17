sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitFetchDialog", {

	getControllerName : function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitFetchDialog";
	},

	createContent : function(oController) {
		//Form
		this._oFetchTable = new sap.ui.table.TreeTable({
			selectionMode : sap.ui.table.SelectionMode.None,
			expandFirstLevel : true,
			editable : false,
			width : "100%",
			noData : new sap.ui.commons.TextView({
				text : "{i18n>gITFetchDialog_controller_fetchtable_nodata_text}"
			})
		});

		this._oFetchTable.addColumn(new sap.ui.table.Column({
			label : "{i18n>gITFetchDialog_fetchTable_summary_column}",
			template : new sap.ui.commons.TextView({
				text : {
					path : "summary",
					formatter : function(sSummary) {
						if (sSummary) {
                            return oController.calculateShortFileFoldername(sSummary);
						}
						return sSummary;
					}
				}
			}),
			width : "45%"
		}));

		this._oFetchTable.addColumn(new sap.ui.table.Column({
			label : "{i18n>gITFetchDialog_fetchTable_author_column}",
			template : "author",
			width : "15%"
		}));

		this._oFetchTable.addColumn(new sap.ui.table.Column({
			label : "{i18n>gITFetchDialog_fetchTable_date_column}",
			template : new sap.ui.commons.TextView({
				text : {
					path : "date",
					formatter : function(timestamp) {
						if (timestamp) {
							//TODO get the date object from the service
							var dFormatted = new Date(timestamp);
							return dFormatted.toLocaleString();
						}
					}
				}
			}),
			width : "25%"
		}));

		//Define the columns and the control templates to be used
		this._oFetchTable.addColumn(new sap.ui.table.Column({
			label : "{i18n>gITFetchDialog_fetchTable_changeid_column}",
			template : new sap.ui.commons.TextView({
				text : {
					path : "changeId",
					formatter : function(sChangeId) {
						//FIXME will "origin" always be present?
						if (sChangeId && sChangeId.indexOf("origin") === -1) {
							var iLength = sChangeId.length;
							return sChangeId.substring(iLength, iLength - 7);
						}
						return sChangeId;
					}
				}
			}),
			width : "15%"
		}));

		this._oFetchTable.bindRows("/modelFetchChangesData/branches");

		this._oFetchDialog = new sap.ui.commons.Dialog({
			width : "1000px",
			modal : true,
			title : "{i18n>gITFetchDialog_changes_fetched}",
			content : [ this._oFetchTable ]
		});

		this._oOKButton = new sap.ui.commons.Button({
			id : "fetch_dialog_ok_button",
			text : "{i18n>button_ok}",
			tooltip : "{i18n>button_ok}",
			enabled : true,
			press : [ oController._executeFetch, oController ]
		});
		this._oFetchDialog.addButton(this._oOKButton);

		return this._oFetchDialog;
	}

});