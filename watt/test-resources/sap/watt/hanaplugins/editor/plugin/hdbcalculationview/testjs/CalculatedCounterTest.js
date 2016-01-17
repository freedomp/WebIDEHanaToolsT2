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
            var url =   require.toUrl("/watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/testdata/") + "CalculatedCounterTest.Hdbcalculationview.xml";
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
        calculatedColumns.placeAt("CalculatedCounterTest");
		QUnit.module('Ui Unit Test For Calculated Counters ', {
			setup: function() {
				//  calculatedColumns = calculatedColumnsPane.getContent();
			},
			teardown: function() {
				//calculatedColumns = null;
				// sap.ui.getCore().applyChanges();
			}
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
			nameTextField.setValue("COUNT_1");
			nameTextField.fireChange({
				newValue: "COUNT_1"
			});
			sap.ui.getCore().applyChanges();
		});
		QUnit.test("Genaral Pane Test Case for field Label", function() {
			var labelTextField = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest2")[0].id);
			var element = model.columnView.getDefaultNode().elements.get("COUNT_1");
			equal(labelTextField.getValue(), "", "Intialy Label Field value is  " + element.label);
			labelTextField.setValue("CC_10");
			labelTextField.fireChange({
				newValue: "CC_10"
			});
			sap.ui.getCore().applyChanges();
			equal(labelTextField.getValue(), element.label, "After Updating Label Field value is  " + labelTextField.getValue());
		});
		QUnit.test("Genaral Pane Test Case for Column Type Field", function() {
			var columnTypeCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest3")[0].id);
			ok(columnTypeCombo.getValue(), "Column Type Field value is  " + columnTypeCombo.getValue());
			equals(columnTypeCombo.getEnabled(), false, "Column Type Field  is enabled " + columnTypeCombo.getEnabled());

		});
		QUnit.test("Genaral Pane Test Case for Exception Aggregation Type Type Field", function() {
			var eaTypeCombo = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest4")[0].id);
			ok(eaTypeCombo.getValue(), "Exception Aggregation Type Type Field value is  " + eaTypeCombo.getValue());
			equals(eaTypeCombo.getEnabled(), false, "Exception Aggregation Type Type Field  is enabled " + eaTypeCombo.getEnabled());

		});
		QUnit.test(" Genaral Pane Test Case for Hidden  Checkbox", function() {
			var element = model.columnView.getDefaultNode().elements.get("COUNT_1");
			var hiddenCheckBox = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest5")[0].id);
			equal(hiddenCheckBox.getChecked(), element.hidden, "Intialy Hidden Checkbox is " + hiddenCheckBox.getChecked());
			hiddenCheckBox.setChecked(false);
			hiddenCheckBox.fireChange({
				checked: false
			});
			sap.ui.getCore().applyChanges();
			equal(hiddenCheckBox.getChecked(), element.hidden, "After cheked Hidden Checkbox is " + hiddenCheckBox.getChecked());

		});
		QUnit.test(" Counter Pane Test Case ", function() {

			var counterTable = sap.ui.getCore().byId(calculatedColumns.$().find(".dummyTest6")[0].id);
			counterTable.getT
			var fRow = counterTable.getRows()[0].getCells()[0];
			equal(fRow.getValue(),"", "Counter table first row value is " + fRow.getValue());
			var sRow = counterTable.getRows()[1].getCells()[0];
		//	ok(sRow.getValue(), "Counter table first row value is " + sRow.getValue());

		});
        
});