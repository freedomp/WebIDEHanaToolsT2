define([
        'sap/hana/ide/editor/plugin/analytics/base/common',
        'sap/hana/ide/editor/plugin/analytics/base/modelbase',
        'sap/hana/ide/editor/plugin/analytics/base/XmlReader',
        'sap/hana/ide/editor/plugin/analytics/base/XmlWriter',
        'sap/hana/ide/editor/plugin/analytics/base/XmlSerializer',
        'sap/hana/ide/editor/plugin/analytics/viewmodel/RepositoryXmlParser',
        'sap/hana/ide/editor/plugin/analytics/viewmodel/RepositoryXmlRenderer',
        'sap/hana/ide/editor/plugin/analytics/viewmodel/model',
        'sap/hana/ide/editor/plugin/analytics/sharedmodel/sharedmodel'
    ],
    function(common, modelbase, XmlReader, XmlWriter, XmlSerializer, RepositoryXmlParser, RepositoryXmlRenderer, viewmodel, sharedmodel) {
        "use strict";

        var SkippedNodes = common.SkippedNodes;

        var loadXMLDoc = function(fileName) {
            var url = "/sap/hana/xs/dt/base/file" + require.toUrl("idetests/editor/plugin/analytics/testdata/") + fileName;
            return $.ajax({
                url: url,
                async: false,
                dataType: "text"
            });
        };

        //Temporarily adding UnsupportedOperationException boolean flag - Need to delete later - TODO
        var readRepoFile = function(fileName) {
            var url = "/sap/hana/xs/dt/base/file" + require.toUrl("idetests/editor/plugin/analytics/testdata/") + fileName;
            $.ajax({
                url: url,
                async: false,
                dataType: "text"
            }).done(function(data) {
                data = data.replace(/\x0d/g, ""); // remove CR added by REST API 
                var model = new viewmodel.ViewModel();
                var props = RepositoryXmlParser.parseScenario(data, model);
                var doc = RepositoryXmlRenderer.renderScenario(model, props.detectedLineEndings);
                model.$finishLoading();
                var xmlString = XmlSerializer.serializeToString(doc) + props.spacesAfterDocumentElement;
                strictEqual(xmlString, data, fileName);
            });
        };

        module("RepositoryXmlParser");
        
        test("Element By Element Deep Compare Using RepositoryXmlParser", function() { // setup
            loadXMLDoc("customer.xml").done(function(data) {
                data = data.replace(/\x0d/g, ""); // remove CR added by REST API 
                
                var model = new viewmodel.ViewModel();
                RepositoryXmlParser.parseScenario(data, model);
                
                var columnView = model.columnView;
                ok(columnView instanceof viewmodel.ColumnView, "ColumnView Created");
                
                var viewNode = columnView.viewNodes.getAt(0);
                ok(viewNode instanceof viewmodel.ViewNode && viewNode.type === 'Projection', "ViewNode Created of Type JoinNode");
                
                var element = viewNode.elements.getAt(0);
                ok(element instanceof viewmodel.Element && element.name === 'CUSTOMER_ID');
                
                var defaultViewNode = columnView.viewNodes.getAt(1);
                ok(defaultViewNode instanceof viewmodel.ViewNode && columnView._defaultNode.name === defaultViewNode.name);
                var defaultViewNodeElement = defaultViewNode.elements.getAt(1);
                ok(defaultViewNodeElement instanceof viewmodel.Element && defaultViewNodeElement.name === 'CUSTOMER_CATEGORY');
            });
        });

        //I066990: Add more tests where UnsupportedOperationException can be thrown - TODO  
        test("Expect UnsupportedOperation Exception", function() {
            throws(function() {
                readRepoFile("CV_DECISION_TABLE.calculationview.xml");
            }, modelbase.UnsupportedOperationException, "must throw UnsupportedOperationException to pass");
        });
        test("Expect UnsupportedOperation Exception", function() {
            throws(function() {
                readRepoFile("CV_CDS_ARTIFACT.calculationview.xml");
            }, modelbase.UnsupportedOperationException, "must throw UnsupportedOperationException to pass");
        });
        test("Expect UnsupportedOperation Exception", function() {
            throws(function() {
                readRepoFile("CV_MULTI_DB.calculationview.xml");
            }, modelbase.UnsupportedOperationException, "must throw UnsupportedOperationException to pass");
        });
        
      test("CV Properties Test", function() { // setup
                loadXMLDoc("ALWAYS_AGGREGATED_RESULT.XML").done(function(data) {
				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
				var model = new viewmodel.ViewModel();
				RepositoryXmlParser.parseScenario(data, model);
				
			    var columnView = model.columnView;
			    var executionHints = columnView.executionHints;
			    //ok(columnView instanceof viewmodel.ColumnView && columnView.deprecated === false, "ColumnView Created and is deprecated");
				//ok(columnView instanceof viewmodel.ColumnView && columnView.translationRelevant === false, "ColumnView Created and is deprecated");
				ok(columnView instanceof viewmodel.ColumnView && executionHints.alwaysAggregateResult === true, "Always Aggreagted Result");
				
				var doc = RepositoryXmlRenderer.renderScenario(model);
                model.$finishLoading();
                var xmlString = XmlSerializer.serializeToString(doc);
                model = new viewmodel.ViewModel();
                RepositoryXmlParser.parseScenario(xmlString, model);
                //ok(columnView instanceof viewmodel.ColumnView && columnView.deprecated === false, "ColumnView Created and is deprecated");
                //ok(columnView instanceof viewmodel.ColumnView && columnView.translationRelevant === false, "ColumnView Created and is deprecated");
                ok(columnView instanceof viewmodel.ColumnView && executionHints.alwaysAggregateResult === true, "Always Aggreagted Result");
             });
       });
       
       test("Union Pruning Test", function() { // setup
                loadXMLDoc("PruningCV.calculationview.xml").done(function(data) {
    				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
    				var model = new viewmodel.ViewModel();
    				RepositoryXmlParser.parseScenario(data, model);
    				
    			    var columnView = model.columnView;
    			    var unionViewNode = columnView.viewNodes.get("Union_1");
    			    var unionInput1 = unionViewNode.inputs.get(0);
    			    var unionInput2 = unionViewNode.inputs.get(1);
    				ok(columnView instanceof viewmodel.ColumnView && columnView.pruningTable && columnView.readPruningInformation === true, "Union Pruning");
    				ok(unionInput1 instanceof viewmodel.Input && unionInput1.repositoryInputNodeId === 'CUSTOMER', "Union Pruning");
    				ok(unionInput2 instanceof viewmodel.Input && unionInput2.repositoryInputNodeId === 'CUSTOMER_TEXT', "Union Pruning");
                });
				
				loadXMLDoc("ALWAYS_AGGREGATED_RESULT.XML").done(function(data) {
    				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
    				var model = new viewmodel.ViewModel();
    				RepositoryXmlParser.parseScenario(data, model);
    				
    			    var columnView1 = model.columnView;
    				ok(columnView1 instanceof viewmodel.ColumnView && columnView1.pruningTable === undefined && columnView1.readPruningInformation === undefined, "Union Pruning");
                });
       });
       
       test("Missing_Mapping_For_Attribute_Measure", function() { // setup
                loadXMLDoc("Missing_Mapping_For_Attribute_Measure.calculationview.xml").done(function(data) {
				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
				var model = new viewmodel.ViewModel();
				RepositoryXmlParser.parseScenario(data, model);
				
			    var columnView = model.columnView;
			    var _defaultNode = columnView._defaultNode;
			    var PartnerId_1 = _defaultNode.elements.get("PartnerId_1");
			    var NetAmount = _defaultNode.elements.get("NetAmount");
			    var BillingStatus = _defaultNode.elements.get("BillingStatus");
			    var CreatedAt = _defaultNode.elements.get("CreatedAt");
				ok(PartnerId_1 && PartnerId_1.hasNoMapping === true, "PartnerId_1 hasNoMapping");
				ok(NetAmount && NetAmount.hasNoMapping === true, "NetAmount hasNoMapping");
				ok(BillingStatus && BillingStatus.hasNoMapping === undefined, "PartnerId_1 has Mapping");
				ok(CreatedAt && CreatedAt.hasNoMapping === undefined, "NetAmount has Mapping");
             });
       });
       
       test("DataSource As Projection", function() { // setup
                loadXMLDoc("ProjectionAsDataSource.calculationview.xml").done(function(data) {
				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
				var model = new viewmodel.ViewModel();
				RepositoryXmlParser.parseScenario(data, model);
				
			    var columnView = model.columnView;
			    var DataSourceNode = columnView.viewNodes.get("SALES");
			    var JoinNode = columnView.viewNodes.get("Join_1");
				ok(DataSourceNode && DataSourceNode.isDataSource === true, "DataSource As Projection true");
				ok(JoinNode && JoinNode.isDataSource === undefined, "DataSource As Projection false");
             });
       });
       
       test("Graph Node", function() { // setup
                loadXMLDoc("GraphNode.calculationview.xml").done(function(data) {
				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
				var model = new viewmodel.ViewModel();
				RepositoryXmlParser.parseScenario(data, model);
				
			    var columnView = model.columnView;
			    var graphNode = columnView.viewNodes.get("GraphDSNode");
				ok(graphNode && graphNode.workspace && graphNode.graphExpression && graphNode.algorithm === "GEM", "Graph Node");
				ok(graphNode.workspace && graphNode.workspace.id === 'ns1::cetest', "Graph Node workspace");
				ok(graphNode.graphExpression && graphNode.graphExpression === "graph expression", "graph expression");
				ok(graphNode.algorithm === "GEM", "Graph Node algorithm");
             });
       });
       
       test("DeprecatedColumn", function() { // setup
                loadXMLDoc("DeprecatedColumn.calculationview.xml").done(function(data) {
				data = data.replace(/\x0d/g, ""); // remove CR added by REST API
				var model = new viewmodel.ViewModel();
				RepositoryXmlParser.parseScenario(data, model);
				
			    var columnView = model.columnView;
			    var _defaultNode = columnView._defaultNode;
			    var PartnerId_1 = _defaultNode.elements.get("PartnerId_1");
			    var ProductId_1 = _defaultNode.elements.get("ProductId_1");
			    var NetAmount = _defaultNode.elements.get("NetAmount");
			    var TaxAmount = _defaultNode.elements.get("TaxAmount");
				ok(PartnerId_1 && PartnerId_1.deprecated === true, "PartnerId_1 deprecated");
				ok(NetAmount && NetAmount.deprecated === true, "NetAmount deprecated");
				ok(ProductId_1 && ProductId_1.deprecated === false, "ProductId_1 not deprecated");
				ok(TaxAmount && TaxAmount.deprecated === false, "TaxAmount not deprecated");
				
				var doc = RepositoryXmlRenderer.renderScenario(model);
                model.$finishLoading();
                var xmlString = XmlSerializer.serializeToString(doc);
                model = new viewmodel.ViewModel();
                RepositoryXmlParser.parseScenario(xmlString, model);
                var columnView = model.columnView;
			    var _defaultNode = columnView._defaultNode;
			    var PartnerId_1 = _defaultNode.elements.get("PartnerId_1");
			    var ProductId_1 = _defaultNode.elements.get("ProductId_1");
			    var NetAmount = _defaultNode.elements.get("NetAmount");
			    var TaxAmount = _defaultNode.elements.get("TaxAmount");
				ok(PartnerId_1 && PartnerId_1.deprecated === true, "PartnerId_1 deprecated");
				ok(NetAmount && NetAmount.deprecated === true, "NetAmount deprecated");
				ok(ProductId_1 && ProductId_1.deprecated === false, "ProductId_1 not deprecated");
				ok(TaxAmount && TaxAmount.deprecated === false, "TaxAmount not deprecated");
             });
       });
       
        //I066990: Add more tests using readRepoFile() and apply compare documents - TODO
        test("compare documents", function() {
            readRepoFile("GraphNode.calculationview.xml");
            readRepoFile("customer.xml");
            // readRepoFile("CV_UnitCurrencyAttribute.calculationview.xml");
            readRepoFile("PARAMETER_SUPPORTED.calculationview.xml", true);
            readRepoFile("VARIABLES.calculationview.xml");
            readRepoFile("TEST_RESTRICTED_MEASURE_AND_COUNTER.calculationview.xml");
            readRepoFile("TEST_CurrencyAndUnitConversion.calculationview.xml");
            readRepoFile("SIMPLE_UNION_VIEW.calculationview.xml");
            readRepoFile("CvUnion.calculationview.xml");
            readRepoFile("UNION_WITH_MORE_THAN_TWO_INPUT.calculationview.xml");
            readRepoFile("UNION_BEFORE_REQUIRED_PROJECTION_NODE.calculationview.xml");
            readRepoFile("CV_RankNode_Test.calculationview.xml");
            readRepoFile("TIME_CV.calculationview.xml");
            readRepoFile("CV_HIERARCHY_CUBE.calculationview.xml");
            readRepoFile("CV_HIERARCHY_DIMENSION.calculationview.xml");
            readRepoFile("HISTORY_VIEW.calculationview.xml");
            readRepoFile("NEW_WAY_OF_DESCRIPTION_COLUMN.calculationview.xml");
            readRepoFile("CV_PARAMETER_COLUMN.calculationview.xml");
            readRepoFile("CV_PARAM_MAPPING_DATA_SOURCE_DEFAULT_NODE.calculationview.xml");
            readRepoFile("CV_CONSTANT_PARAM_MAPPING_DATA_SOURCE_DEFAULT_NODE.calculationview.xml");
            readRepoFile("CV_PARAM_MAPPING_DATA_SOURCE_NON_DEFAULT_NODE.calculationview.xml");
            readRepoFile("CV_PARAM_MAPPING_EXTERNAL_LIKE_ELEMENT.calculationview.xml");
            readRepoFile("CV_VAR_PARAM_Mulitple_DefaultValue.calculationview.xml");
            readRepoFile("DefaultValueRange_BackwardCompatability.calculationview.xml");
            readRepoFile("Executionhints.calculationview.xml");
            readRepoFile("PARAMETER_DERIVED_FROM_PROCEDURE.calculationview.xml");
            readRepoFile("PARAMETER_DERIVED_FROM_PROCEDURE_PARAMETER_MAPPING.calculationview.xml");
            readRepoFile("PARAMETER_NOT_SUPPORTED.calculationview.xml");
            readRepoFile("CV_VALUE_HELP_FOR_ATTRIBUTES_PRIVATE_COLUMN.calculationview.xml");
            readRepoFile("CV_VALUE_HELP_FOR_ATTRIBUTES_SHARED_COLUMN.calculationview.xml");
            readRepoFile("CV_VALUE_HELP_FOR_ATTRIBUTES_SHARED_COLUMN_Parameter_Mapping.calculationview.xml");
            readRepoFile("MODELER_STAR_NEW.calculationview.xml");
            readRepoFile("MODELER_STAR_Cal_Attr_Value_Help.calculationview.xml");
            readRepoFile("CV_TRANSPARENT_FILTER.calculationview.xml");
            readRepoFile("CV_CALCULATED_RESTRICTED_MEASURE_COUNTER.calculationview.xml");
            // readRepoFile("CV_STAR_JOIN_HIERAR.calculationview.xml");
            readRepoFile("CV_STAR_JOIN_HIERARCHY.calculationview.xml");
        });
        
        //I066990: Add more tests using readRepoFile() and apply compare documents - TODO
        test("test Compare documents - new tests", function() {
            readRepoFile("MODELER_STAR.calculationview.xml");
            readRepoFile("STAR.calculationview.xml");
            readRepoFile("star1.calculationview.xml");
            readRepoFile("STARJV_SALESORDERS.calculationview.xml");
            readRepoFile("STAR_C3.calculationview.xml");
            readRepoFile("STAR_CV_Hidden_Column.calculationview.xml");
            readRepoFile("STAR_Variable_Applied_Shared_Column.calculationview.xml");
            readRepoFile("STAR_Variable_Applied_Shared_Column_Local_Column.calculationview.xml");
            readRepoFile("STAR_Counter_based_on_shared_column.calculationview.xml");
            readRepoFile("STAR_JOIN_PRIVATE_JOIN_COLUMN_ADDED.calculationview.xml");
            readRepoFile("STAR_JOIN_PRIVATE_JOIN_COLUMN_ADDED_Same_Name.calculationview.xml");
            readRepoFile("STAR_C3_COUNTER_RESTRICTED_MEASURE.calculationview.xml");
            readRepoFile("STARJV_SALESORDERS_CURRENCY_MAPPING.calculationview.xml");
            readRepoFile("STAR_C3_CURRENCY_CONVERSION_SHARED_COLUMN.calculationview.xml");
            // readRepoFile("STAR_CV_RESTRICTED_MEASURE.calculationview.xml");
            // readRepoFile("Currency_Conversion_Special_Case.calculationview.xml");
            readRepoFile("CV_TABLE_FUNCTION_With_Column.calculationview.xml");
            readRepoFile("CV_TABLE_FUNCTION_With_Parameter.calculationview.xml");
            readRepoFile("TABLE_FUNCTION_CONSTANT_PARAMETER_MAPPING.calculationview.xml");
            readRepoFile("CV_SAME_DATASOURCE_TWICE.calculationview.xml");
            readRepoFile("CV_SAME_DATASOURCE_TWICE_ALIAS.calculationview.xml");
            readRepoFile("PROD.calculationview.xml");
            readRepoFile("COMMENT_CALC.calculationview.xml");
            readRepoFile("SpatialJoin.calculationview.xml");
            readRepoFile("SpatialJoinDistanceByValue.calculationview.xml");
            readRepoFile("SpatialJoinDistanceParameter.calculationview.xml");
            readRepoFile("SpatialJoinIntersectionMatrixParameter.calculationview.xml");
            readRepoFile("SpatialJoinIntersectionMatrixDistanceByValue.calculationview.xml");
            readRepoFile("CV_RankNode_With_Parameter.calculationview.xml");
            readRepoFile("Text_Join.calculationview.xml");
            readRepoFile("ProjectionAsDataSource.calculationview.xml");
            //readRepoFile("Missing_Mapping_For_Attribute_Measure.calculationview.xml");
            //readRepoFile("DeprecatedColumn.calculationview.xml");
        });    
    });