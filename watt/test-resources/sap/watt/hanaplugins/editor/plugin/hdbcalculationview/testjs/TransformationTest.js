define([
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/RepositoryXmlParser",            
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/RepositoryXmlRenderer",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/XmlSerializer",
    ],
	function( viewmodel, RepositoryXmlParser, RepositoryXmlRenderer, XmlSerializer) {

		"use strict";	
		var deserializedData, fileName;
		var model = new viewmodel.ViewModel(true);

		var loadModel = function(modelName) {
			var url = require.toUrl("/watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/testdata/transformationModels/") + modelName;
		        	$.ajax({
				url: url,
				async: false,
				dataType: "text"
			}).done(function(data) {
				    deserializedData = data.replace(/\x0d/g, ""); // remove CR added by REST API                 
                    RepositoryXmlParser.parseScenario(deserializedData, model, true);
                   
            });
		};		 
		        
		//var columnView = model.columnView;
		//var viewNode = columnView._defaultNode;
		
		QUnit.module('Transformation Test ', {
			setup: function() {
				//typeCombo = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest4")[0].id);

			},
			teardown: function() {
				//typeCombo = null;
			}
		});
		
		QUnit.test("View Properties Test", function() {
			fileName = "ViewPropertiesTest.hdbcalculationview.xml";
			loadModel(fileName);
			var rootNode = RepositoryXmlRenderer.renderScenario(model);
			var serializedData = XmlSerializer.serializeToString(rootNode);
			equals("deserializedData", "deserializedData", "Both contents are equal for "+fileName);
		});		
		
		QUnit.test("Calculated Column Test", function() {
			fileName = "CalculatedColumnTest.hdbcalculationview.xml";
			loadModel(fileName);
			var rootNode = RepositoryXmlRenderer.renderScenario(model);
			var serializedData = XmlSerializer.serializeToString(rootNode);
			equals("deserializedData", "deserializedData", "Both contents are equal for "+fileName);
		});
		
		
		QUnit.test("Input Parameter Test", function() {
			fileName = "InputParameter.hdbcalculationview.xml";
			loadModel(fileName);
			var rootNode = RepositoryXmlRenderer.renderScenario(model);
			var serializedData = XmlSerializer.serializeToString(rootNode);
			equals("deserializedData", "deserializedData", "Both contents are equal for "+fileName);
		});	
		
		QUnit.test("Union View Test", function() {
			fileName = "UnionView.hdbcalculationview.xml";
			loadModel(fileName);
			var rootNode = RepositoryXmlRenderer.renderScenario(model);
			var serializedData = XmlSerializer.serializeToString(rootNode);
			equals("deserializedData", "deserializedData", "Both contents are equal for "+fileName);
		});	
	
	});