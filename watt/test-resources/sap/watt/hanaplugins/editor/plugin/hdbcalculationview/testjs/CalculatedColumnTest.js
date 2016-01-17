define(["watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/Util",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/RepositoryXmlParser",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/CalcViewEditorUtil",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/commands",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/calculatedcolumn/CalculatedColumnsPane",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/calculatedcolumn/CalculatedColumnDetails"
        
    ],
    function(Util, viewmodel, RepositoryXmlParser, CalcViewEditorUtil, commands,CalculatedColumnsPane,CalculatedColumnDetails) {

        "use strict";

        var model = new viewmodel.ViewModel(true);
        ( function() {
            var url =   require.toUrl("/watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/testdata/") + "CalculatedColumnTest.hdbcalculationview.xml";
            $.ajax({
                url: url,
                async: false,
                dataType: "text"
            })
                .done(function(data) {
                    data = data.replace(/\x0d/g, ""); // remove CR added by REST API 
                    //var calculationViewModel = model.createColumnView(mAttr,skipNodes);
                    RepositoryXmlParser.parseScenario(data, model, true);

                    //   parameter = model.columnView.parameters.getAt(0);
                    // RepositoryXmlParser.parseCalculationView(data);
                    // oModel = calculationViewModel;
                });


        })();
        var i18n = {
            applyTo: sinon.spy()
        };
        var context = {
            i18n: i18n,
            service: {
                catalogDAO: {
                    sqlMultiExecute: function(statment, setting, callback) {
                        var result = {

                        };
                        callback(result);
                    },
                    getSchemas: function() {}
                }
            }
        };
        
        var columnView = model.columnView;
        var viewNode = columnView._defaultNode;


        var calculatedColumnsPane = new CalculatedColumnsPane({
            undoManager: model.$getUndoManager(),
            viewNode: viewNode,
            context: context,
            model: model,
            columnView: columnView
        });

        var calculatedColumns = calculatedColumnsPane.getContent();
        calculatedColumns.placeAt("CalculatedColumnTest");

        QUnit.module('Ui Unit Test For Calculated Columns ', {
            setup: function() {

            },
            teardown: function() {

            }
        });
        QUnit.test("Genaral Pane Test Case for field Label", function() {
            var labelTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest2")[0].id);
            var element = model.columnView.getDefaultNode().elements.get("CC_1");
            equal(labelTextField.getValue(), (element.label === undefined)?"":element.label, "Intialy Label Field value is  " + element.label);
            labelTextField.setValue("CC_10");
            labelTextField.fireChange({
                newValue: "CC_10"
            });
            sap.ui.getCore().applyChanges();
            equal(labelTextField.getValue(), (element.label === undefined)?"":element.label, "After Updating Label Field value is  " + labelTextField.getValue());
        });
        QUnit.test("Genaral Pane Test Case for field Name", function() {
            var nameTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest1")[0].id);
            var element = model.columnView.getDefaultNode().elements.get(nameTextField.getValue());
            equal(nameTextField.getValue(), element.name, "Intialy Name Field value is  " + nameTextField.getValue());
            nameTextField.setValue("CC_10");
            nameTextField.fireChange({
                newValue: "CC_10"
            });
            sap.ui.getCore().applyChanges();
            equal(nameTextField.getValue(), element.name, "After Updating Name Field value is  " + nameTextField.getValue());
            nameTextField.setValue("CC_1");
            nameTextField.fireChange({
                newValue: "CC_1"
            });
            sap.ui.getCore().applyChanges();
        });
        QUnit.test("Genaral Pane Test Case for Data Type Drop down Field", function() {
            var nameTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest1")[0].id);
           var element = model.columnView.getDefaultNode().elements.get(nameTextField.getValue());
           var dataTypeCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest3")[0].id);
           ok(dataTypeCombo.getValue(), "Intialy Data Type Drop down  Field value is " + dataTypeCombo.getValue());
           dataTypeCombo.setValue("DECIMAL");
           dataTypeCombo.fireChange({
               newValue: "DECIMAL"
           });
           sap.ui.getCore().applyChanges();
           equal(dataTypeCombo.getValue(), "DECIMAL", "After Updating Data Type Drop down Field value is  " + dataTypeCombo.getValue());
       });
       QUnit.test("Genaral Pane Test Case for Length Field", function() {
            var nameTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest1")[0].id);
           var element = model.columnView.getDefaultNode().elements.get(nameTextField.getValue());
           //var dataTypeCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest3")[0].id);
           var lengthField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest4")[0].id);
           equals(lengthField.getValue(), element.inlineType.length,"Intialy Length Field value is  " + lengthField.getValue());
           lengthField.setValue("12");
           lengthField.fireChange({
               newValue: "12"
           });
           equals(lengthField.getValue(), element.inlineType.length,"After Updating Length Field value is  " + lengthField.getValue());

       });
       QUnit.test("Genaral Pane Test Case for Scale Field", function() {
           var nameTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest1")[0].id);
           var element = model.columnView.getDefaultNode().elements.get(nameTextField.getValue());
     
           var dataTypeCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest3")[0].id);
           var scaleField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest5")[0].id);
           ok(true, "Intialy Scale Field value is  " + scaleField.getEnabled());
           scaleField.setValue("12");
           scaleField.fireChange({
               newValue: "12"
           });
           equals(scaleField.getValue(), element.inlineType.scale,"After Updating Scale Field value is  " + scaleField.getValue());
           dataTypeCombo.setValue("DECIMAL");
           dataTypeCombo.focus();
           dataTypeCombo._doSelect();
       });

       QUnit.test("Genaral Pane Test Case for Drill Down Field", function() {
           var drildownCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest7")[0].id);
           var nameTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest1")[0].id);
           var element = model.columnView.getDefaultNode().elements.get(nameTextField.getValue());
           equal(drildownCombo.getValue(), (element.drillDownEnablement === "DRILL_DOWN") ? "Drill Down" : "", "Intialy Drill Down  Field value is  " + drildownCombo.getValue());
           drildownCombo.setValue(drildownCombo.getItems()[0].getText());
           drildownCombo.fireChange({
               newValue: drildownCombo.getItems()[0].getText()
           });
           sap.ui.getCore().applyChanges();
           equal(drildownCombo.getValue(), (element.drillDownEnablement === "DRILL_DOWN_WITH_HIERARCHY") ? "Drill Down with flat Hierarchy (MDX)" : "", "After Updating Drill Down  Field value is  " + drildownCombo.getValue());
       });
       QUnit.test("Semantic Pane Test Case for ColumnType Field", function() {
            var nameTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest1")[0].id);
           var element = model.columnView.getDefaultNode().elements.get(nameTextField.getValue());
           var columnTypeCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest6")[0].id);
           equals(columnTypeCombo.getValue(),(element.aggregationBehavior==="NONE")?"":"Attribute", "Intialy Column Type  Field value is  " + columnTypeCombo.getValue());
       });
       QUnit.test(" Semantic Pane Test Case for Aggregation Type Field", function() {
           var element = model.columnView.getDefaultNode().elements.get("CC_1");
           var attribute = CalcViewEditorUtil.getAttributePropertiesModel(element);
           var aggregationType = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest8")[0].id);
           equal(aggregationType.getValue(),( attribute.objectAttributes.aggregationBehavior.toUpperCase() === "NONE")? "":(attribute.objectAttributes.aggregationBehavior.toUpperCase()), "Intialy Aggregation Type Field is " + aggregationType.getValue());

       });
       QUnit.test(" Semantic Pane Test Case for Enable client side aggregation Checkbox", function() {
           var element = model.columnView.getDefaultNode().elements.get("CC_1");
           var attribute = CalcViewEditorUtil.getAttributePropertiesModel(element);
           var aggregationCheckBox = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest8")[0].id);
           equal(aggregationCheckBox.getValue(), (attribute.objectAttributes.aggregationBehavior.toUpperCase()=="NONE")?"":(attribute.objectAttributes.aggregationBehavior.toUpperCase()), "Intialy client side aggregation Checkbox is " + aggregationCheckBox.getEnabled());
       });
       QUnit.test(" Semantic Pane Test Case for Hidden  Checkbox", function() {
             var element = model.columnView.getDefaultNode().elements.get("CC_1");
           var hiddenCheckBox = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest10")[0].id);
           equal(hiddenCheckBox.getChecked(), element.hidden, "Intialy Hidden Checkbox is " + hiddenCheckBox.getChecked());
           hiddenCheckBox.setChecked(true);
           hiddenCheckBox.fireChange({
               checked: true
           });
           sap.ui.getCore().applyChanges();
           equal(hiddenCheckBox.getChecked(),  element.hidden, "After cheked Hidden Checkbox is " + hiddenCheckBox.getChecked());

       });

       QUnit.test(" Semantic Pane Test Case for Semantic Type Field", function() {
var element = model.columnView.getDefaultNode().elements.get("CC_1");
           var semantic = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest11")[0].id);
           equal(semantic.getValue(), (element.inlineType.semanticType==="empty")?"":element.inlineType.semanticType, "Intialy  Semantic Type Field value is " + semantic.getValue());
           semantic.setValue("Quantity with Unit Of Measure");
           semantic.fireChange({
               newValue: "Quantity with Unit Of Measure"
           });
           sap.ui.getCore().applyChanges();
           equal(semantic.getValue(), (element.inlineType.semanticType==="quantity")?"Quantity with Unit Of Measure":"", "After updated  Semantic Type Field value is " + semantic.getValue());
                });

       QUnit.test(" Expression Pane Test Case for Aggregation Type Field", function() {

           var expression = sap.ui.getCore().byId(calculatedColumns.$().find(".detailsExpressionTextArea")[0].id);
           equal(expression.getValue(), "", "Intialy expression Type Field is " + expression.getValue());
           expression.setValue("Quantity with Unit Of Measure");
           expression.fireChange({
               newValue: "Quantity with Unit Of Measure"
           });
           sap.ui.getCore().applyChanges();
           equal(expression.getValue(), "Quantity with Unit Of Measure", "Intialy expression Type Field is " + expression.getValue());
          
       });

       QUnit.test("Genaral Pane and Semantic Pane Test Case fore ColumnTyp Field is 'Measure' ", function() {

           var detailTab = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTabTest")[0].id);
           detailTab.setSelectedIndex(1);
            sap.ui.getCore().applyChanges();
           var drildownCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest7")[0].id);
           ok(true,  "After Updating ColumnTyp Field then Drill Down  Field value is enabled  " + drildownCombo.getEnabled());
           var aggregationType = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest8")[0].id);
           ok(true, "After Updating ColumnTyp Field then Aggregation Type Field is " + aggregationType.getEnabled());

       });
       QUnit.test(" Semantic Pane Test Case fore ColumnTyp Field is 'Measure' then Column Field", function() {
           var semantic = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest11")[0].id);
           equals(semantic.getValue(), false,"Now  Semantic Type Field value is " + semantic.getValue());
           semantic.setValue("Amount with Currency Code");
           semantic.fireChange({				
				selectedItem: semantic.getItems()[1].getKey()
			});
           sap.ui.getCore().applyChanges();
       /*    var currency = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest12")[0].id);
           ok(semantic.getVisible(), "Now  Currency Type Field Visible" + currency.getVisible());
           ok(semantic.getValue(), "Now  Currency Type Field value is " + currency.getValue());*/
       });
        
});