sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase", "uitests/eslintDefaults"], function(Opa5, WebIDEBase, eslintDefaults) {
	"use strict";
	
	var i18nModel = new sap.ui.model.resource.ResourceModel({
		bundleUrl: "sap/watt/ideplatform/plugin/basevalidator/i18n/i18n.properties"
	});

	return Opa5.createPageObjects({
		inTheJavaScriptRules: {
			baseClass: WebIDEBase,

			actions: {
				iHaveRulesInMyTable: function() {
					return this.waitFor({
						id: "__xmlview1--ESLintRules",
						check: function(oTable) {
						    if (oTable.getModel()){
						         return (oTable.getModel().getData() !== null);
						    } else {
						        return false;
						    }
						},
						success: function(oTable) {
                            oTable.setVisibleRowCount(oTable.getModel().getData().rules.length);
                            ok(oTable.getModel().getData().rules.length > 100, "there should be more then 100 eslint rules");
                            var aColumnsNames = _.map(oTable.getColumns(), function(column){
                               return column.getLabel().getText();
                            });
                            var aExpectedColumnsNames = ["Enabled", "Rule", "Severity", "Category", "Additional Information"];
                            ok(_.difference(aColumnsNames,aExpectedColumnsNames).length === 0, "rules table columns adhere to pre-define list");
                            
                            var aRowCellsControls = oTable.getRows()[0].getCells();
                            var aControlTypesInRow = _.map( aRowCellsControls ,function(control){
                                            return control.getMetadata().getName();
                            });
                            var aExpectedControlTypes = ["sap.ui.commons.ToggleButton", "sap.ui.commons.Link", "sap.ui.commons.DropdownBox", "sap.ui.commons.ComboBox", "sap.ui.commons.TextField"];
                            ok(_.difference(aControlTypesInRow,aExpectedControlTypes).length === 0, "Row controls should be sap.ui.commons.ToggleButton, sap.ui.commons.Link, sap.ui.commons.DropdownBox, sap.ui.commons.ComboBox, sap.ui.commons.TextField");
						}
					});
				}
			
			},

			assertions: {
                iCheckRulesInformationContent: function(){
				    return this.waitFor({
				        controlType: "sap.ui.commons.Panel",
				        matchers: new sap.ui.test.matchers.Properties({
        						text: i18nModel.getProperty("RulesInformationEditor")
        				}),
        				success: function(aPanels) {
        				    var oPanel = aPanels[0];
        				    if (oPanel.getCollapsed()){
        				        oPanel.setCollapsed(false);
        				    }
        				    this.aPanelContentControls= oPanel.getContent();
        				    var that = this;
        				    ok(this.aPanelContentControls.length === 1, "content found in Rules information Panel");
        				    return that.waitFor({
        				        id : "__xmlview1--aceEditorValidatorSettings",
        				        check: function(aceEditor){
        				            return aceEditor.getVisible();
        				        },
        				        success: function(aceEditor){
        				            ok(that.aPanelContentControls[0] === aceEditor, "ACE editor found inside the Rules information Panel");
        				            deepEqual(JSON.parse(aceEditor.getValue()), eslintDefaults, "ACE editor content ok");
        				        }
        				    });
        				},
        				errorMessage: "no Control found inside the rules information Panel"
				    });
				}

			}
		}

	}); //end of Opa5.createPageObjects
});