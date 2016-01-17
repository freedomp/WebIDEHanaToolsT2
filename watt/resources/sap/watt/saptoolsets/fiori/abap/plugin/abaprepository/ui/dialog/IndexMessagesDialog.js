define([], function() {
	var _open = function(oContext, aMessages) {
		var oDeferred = Q.defer();
		//sap.watt.includeCSS(require.toUrl("sap.watt.common.externalcommand/ui/css/Dialog.css"));

		var oDialog = new sap.ui.commons.Dialog({
			title: oContext.i18n.getText("i18n", "IndexMessageDialog_Title"),
			resizable: true,
			width: "50%",
			modal: true,
			keepInWindow: true
		});

		var infoLabel = new sap.ui.commons.Label({
			text: oContext.i18n.getText("i18n", "IndexMessageDialog_MultiHeading"),
			textAlign: "Left",
			design: sap.ui.commons.LabelDesign.Bold,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		var oTable = new sap.ui.table.Table({
			visibleRowCount: 3,
			selectionMode: sap.ui.table.SelectionMode.None,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		var typeLabel = new sap.ui.commons.Label({
			text: oContext.i18n.getText("i18n", "IndexMessageDialog_TypeColumn"),
			design: "Bold"
		});

		oTable.addColumn(new sap.ui.table.Column({
			label: typeLabel,
			template: new sap.ui.commons.TextView().bindProperty("text", "messageType"),
			width: "6rem"
		}));

		var messageLabel = new sap.ui.commons.Label({
			text: oContext.i18n.getText("i18n", "IndexMessageDialog_MessageColumn"),
			design: "Bold"
		});

		oTable.addColumn(new sap.ui.table.Column({
			label: messageLabel,
			template: new sap.ui.commons.TextView({
			    text : "{messageText}",
			    tooltip : "{messageText}"
			}),
			width: "30rem"
		}));

		var longTextLabel = new sap.ui.commons.Label({
			text: oContext.i18n.getText("i18n", "IndexMessageDialog_LongTextColumn"),
			design: "Bold"
		});

		oTable.addColumn(new sap.ui.table.Column({
			label: longTextLabel,
			template: new sap.ui.commons.TextView({
			    text : "{longText}",
			    tooltip : "{longText}"
			})
		}));

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: aMessages
		});
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");

		var oMainGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [ infoLabel, oTable ],
			vSpacing: 0
		});

		oDialog.addContent(oMainGrid);

		oDialog.addButton(new sap.ui.commons.Button({
			text: oContext.i18n.getText("i18n", "OK"),
			press: function() {
				oDialog.close();
				oDeferred.resolve({
					sResult: "YES",
					bResult: true
				});
			}
		}));

		oDialog.open();

		return oDeferred.promise;
	};

	return {
		open : _open
	};
});