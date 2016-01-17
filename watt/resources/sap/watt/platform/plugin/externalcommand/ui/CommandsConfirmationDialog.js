define(["sap/watt/lib/lodash/lodash"], function(_) {

	var oDeferred = null;

	var createParamsData = function(aParams) {
		var aParamsData = [];

		jQuery.each(aParams, function(jkey, jval) {
			aParamsData.push({
				"parameter": jkey,
				"value": jval
			});
		});
		return aParamsData;
	};
	var getCommandDescription = function(oCommandDesc, aParams) {

		jQuery.each(aParams, function(jkey, jval) {
		    if(_.isString(jval)) {
    		    jval = jval.trim();
    		    jkey= jkey.trim();
                jval = "\"" + jval + "\"";
    			oCommandDesc = oCommandDesc.replace("{" + jkey + "}", jval);
		    }
		});
		
		oCommandDesc = oCommandDesc.split("{").join("<");
		oCommandDesc = oCommandDesc.split("}").join(">");
		
		return oCommandDesc;
	};

	var createParamsPanel = function(oCommand, oContext) {

		var oPanel = new sap.ui.commons.Panel({
			expandable: true,
			collapsed: true,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: oContext.i18n.getText("i18n", "More_Details"),
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		var oTableParams = new sap.ui.table.Table({
			visibleRowCount: 3,
			selectionMode: sap.ui.table.SelectionMode.None,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			noData: oContext.i18n.getText("i18n", "No_Params")
		});

		var keyLabel = new sap.ui.commons.Label({
			text: "Key",
			design: "Bold"
		});

		oTableParams.addColumn(new sap.ui.table.Column({
			label: keyLabel,
			template: new sap.ui.commons.TextView().bindProperty("text", "parameter"),
			width: "50%"
		}));

		oTableParams.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "Value",
				design: "Bold"
			}),
			template: new sap.ui.commons.TextView().bindProperty("text", "value"),
			width: "50%"
		}));

		var aData = createParamsData(oCommand.getParameters());
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: aData
		});
		oTableParams.setModel(oModel);
		oTableParams.bindRows("/modelData");

		oPanel.addContent(oTableParams);
		return oPanel;

	};
	var createCommandsGrid = function(oContext, aCommands) {
		var i = 0;

		var oCommandGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing:0
		});

		for (i = 0; i < aCommands.length; i++) {

			oCommandGrid.addContent(new sap.ui.commons.TextArea({
				value: getCommandDescription(aCommands[i]._mConfig.description, aCommands[i].getParameters()),
				textAlign: "Left",
				height:"65px",
				editable:false,
				wrapping: sap.ui.core.Wrapping.Soft,
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M12 S12",
					linebreak: true
				})
			}).addStyleClass("TextArea"));

			
			oCommandGrid.addContent(createParamsPanel(aCommands[i], oContext));
			
			oCommandGrid.addContent( new sap.ui.commons.HorizontalDivider({
			    layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			}).addStyleClass("HorizontalDivider"));
            
		}


		return oCommandGrid;
	};

	var _open = function(aCommands, oContext) {
	    
		oDeferred = Q.defer();
		sap.watt.includeCSS(require.toUrl("sap.watt.platform.externalcommand/ui/css/Dialog.css"));
		
		var oDialog = new sap.ui.commons.Dialog({
			title: oContext.i18n.getText("i18n", "Confirmation_dialog_title"),
			resizable: true,
			width: "50%",
			modal: true,
			keepInWindow: true
		});
       
		var commandHeadingLabel = new sap.ui.commons.Label({
			text: (aCommands.length === 1) ? oContext.i18n.getText("i18n", "Single_Heading") : oContext.i18n.getText("i18n",
				"Multi_Heading"),
			textAlign: "Left",
			design: sap.ui.commons.LabelDesign.Bold ,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("commandHeadingLabel");

		oDialog.addContent(commandHeadingLabel);

		var oGridCommandsDetails = createCommandsGrid(oContext, aCommands);

		var oGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [commandHeadingLabel, oGridCommandsDetails],
			vSpacing: 0
		});

		oDialog.addContent(oGrid);

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

		oDialog.addButton(new sap.ui.commons.Button({
			text: oContext.i18n.getText("i18n", "Cancel"),
			press: function() {

				oDialog.close();
				oDeferred.resolve({
					sResult: "NO",
					bResult: false
				});
			}
		}));
		oDialog.open();

		return oDeferred.promise;
	};

	return {
		open: _open

	};
});