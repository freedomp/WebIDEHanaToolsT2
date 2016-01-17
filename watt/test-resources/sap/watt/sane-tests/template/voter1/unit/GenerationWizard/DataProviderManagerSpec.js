define(["STF",
	    "sap/watt/ideplatform/plugin/generationwizard/core/DataProviderManager",
		"sap/watt/saptoolsets/fiori/project/plugin/rdlastlibrary/service/astLibrary"
		] ,
	function(STF, oDataProviderManager, astLibrary) {

	"use strict";

	var suiteName = "DataProviderManager_Unit";

	describe(suiteName, function () {

		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter1/unit/GenerationWizard/" +
				sFileName;
		}

		it("init & getModelTemplateRepresentation RDL", function() {
			return Q(jQuery.ajax({url: require.toUrl(fullPath("ast.json")), dataType: "json"})).then(function (result) {
				var astJson = result;

				var astProvider = astLibrary.getRiverAstLibrary(astJson.response[0]);
				oDataProviderManager.init(astProvider, null, "river");
				var oResult = oDataProviderManager.getModelTemplateRepresentation();
				if (oResult) {
					assert.equal(JSON.stringify(oResult),"{\"entities\":[{\"name\":\"C\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.nestedFirstLevel1.nestedSecondLevel1.nestedThirdLevel1.C\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"}],\"navigations\":[]},{\"name\":\"B\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.nestedFirstLevel1.nestedSecondLevel1.B\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"}],\"navigations\":[]},{\"name\":\"D\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.nestedFirstLevel1.nestedSecondLevel2.D\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"}],\"navigations\":[]},{\"name\":\"A\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.nestedFirstLevel1.A\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"}],\"navigations\":[]},{\"name\":\"E\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.nestedFirstLevel2.E\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"}],\"navigations\":[]},{\"name\":\"Movie\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.Movie\",\"elements\":[{\"name\":\"title\",\"isKey\":true,\"remoteType\":\"String\"},{\"name\":\"year\",\"isKey\":false,\"remoteType\":\"Integer\"},{\"name\":\"cost\",\"isKey\":false,\"remoteType\":\"DecimalFloat\"},{\"name\":\"income\",\"isKey\":false,\"remoteType\":\"DecimalFloat\"},{\"name\":\"rating\",\"isKey\":false,\"remoteType\":\"Rating\"},{\"name\":\"genre\",\"isKey\":false,\"remoteType\":\"Genre\"},{\"name\":\"x\",\"isKey\":false,\"remoteType\":\"String\"}],\"navigations\":[{\"name\":\"producer\",\"multiplicity\":\"1\",\"elements\":\"@datasource.entities.6.elements\",\"navigations\":\"@datasource.entities.6.navigations\"},{\"name\":\"starring\",\"multiplicity\":\"*\",\"elements\":\"@datasource.entities.8.elements\",\"navigations\":\"@datasource.entities.8.navigations\"}]},{\"name\":\"Producer\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.Producer\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"}],\"navigations\":[{\"name\":\"movies\",\"multiplicity\":\"*\",\"elements\":\"@datasource.entities.5.elements\",\"navigations\":\"@datasource.entities.5.navigations\"}]},{\"name\":\"Actor\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.Actor\",\"elements\":[{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\"},{\"name\":\"emailAddress\",\"isKey\":false,\"remoteType\":\"String\"},{\"name\":\"age\",\"isKey\":false,\"remoteType\":\"Integer\"},{\"name\":\"totalIncome\",\"isKey\":false,\"remoteType\":\"_QUERY_GENERATED_STRUCT_RES_TYPE_2\"}],\"navigations\":[{\"name\":\"movies\",\"multiplicity\":\"*\",\"elements\":\"@datasource.entities.8.elements\",\"navigations\":\"@datasource.entities.8.navigations\"}]},{\"name\":\"Casting\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.Casting\",\"elements\":[{\"name\":\"salary\",\"isKey\":false,\"remoteType\":\"DecimalFloat\"},{\"name\":\"__ID\",\"isKey\":true,\"remoteType\":\"Integer\"}],\"navigations\":[{\"name\":\"movie\",\"multiplicity\":\"1\",\"elements\":\"@datasource.entities.5.elements\",\"navigations\":\"@datasource.entities.5.navigations\"},{\"name\":\"star\",\"multiplicity\":\"1\",\"elements\":\"@datasource.entities.7.elements\",\"navigations\":\"@datasource.entities.7.navigations\"}]},{\"name\":\"Blockbusters\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.Blockbusters\",\"elements\":[{\"name\":\"title\",\"isKey\":false,\"remoteType\":\"String\"},{\"name\":\"genre\",\"isKey\":false,\"remoteType\":\"Genre\"},{\"name\":\"income\",\"isKey\":false,\"remoteType\":\"DecimalFloat\"}],\"navigations\":[]},{\"name\":\"RichProducers\",\"fullyQualifiedName\":\"ShowBusiness.ShowBusiness.RichProducers\",\"elements\":[{\"name\":\"name\",\"isKey\":false,\"remoteType\":\"String\"},{\"name\":\"total\",\"isKey\":false,\"remoteType\":\"DecimalFloat\"}],\"navigations\":[]}]}", "get model as expected");
					//start();
				} else {
					assert.ok(null, "getModelTemplateRepresentation failed");
					//start();
				}
			});

		});

		it("init & getModelTemplateRepresentation RDL - multiple EntityContainer", function() {
			return Q(jQuery.ajax({url: require.toUrl(fullPath("iotAst.json")), dataType: "json"})).then(function (result) {
				var astJson = result;

				var astProvider = astLibrary.getRiverAstLibrary(astJson.response[0]);
				oDataProviderManager.init(astProvider, null, "river");
				var oResult = oDataProviderManager.getModelTemplateRepresentation();
				if (oResult) {
					assert.equal(JSON.stringify(oResult),"{\"entities\":[{\"name\":\"count\",\"entityType\":\"com.sap.iotservices.mms.entitySet\",\"fullyQualifiedName\":\"com.sap.iotservices.mms.D053601.count\",\"elements\":[{\"name\":\"schema\",\"isKey\":false,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"name\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"count\",\"isKey\":false,\"remoteType\":\"String\",\"annotations\":{}}],\"navigations\":[],\"annotations\":{\"entityType\":\"com.sap.iotservices.mms.entitySet\"}},{\"name\":\"T_IOT_CONFIG\",\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_CONFIG\",\"fullyQualifiedName\":\"com.sap.iotservices.mms.D053601.T_IOT_CONFIG\",\"elements\":[{\"name\":\"G_CREATED\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_KEY\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_VALUE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}}],\"navigations\":[],\"annotations\":{\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_CONFIG\"}},{\"name\":\"T_IOT_MONITOR_LOG\",\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_MONITOR_LOG\",\"fullyQualifiedName\":\"com.sap.iotservices.mms.D053601.T_IOT_MONITOR_LOG\",\"elements\":[{\"name\":\"G_CREATED\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"G_METRIC\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"G_VALUE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"G_COMPONENT\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"G_PROCESS\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}}],\"navigations\":[],\"annotations\":{\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_MONITOR_LOG\"}},{\"name\":\"T_IOT_PROCESSING_SERVICE_CONFIG\",\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_PROCESSING_SERVICE_CONFIG\",\"fullyQualifiedName\":\"com.sap.iotservices.mms.D053601.T_IOT_PROCESSING_SERVICE_CONFIG\",\"elements\":[{\"name\":\"G_CREATED\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_DEVICE_TYPE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_MESSAGE_TYPE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_PROCESSING_SERVICE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_PROPERTIES\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}}],\"navigations\":[],\"annotations\":{\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_PROCESSING_SERVICE_CONFIG\"}},{\"name\":\"T_IOT_M0T0Y0P0E1\",\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_M0T0Y0P0E1\",\"fullyQualifiedName\":\"com.sap.iotservices.mms.D053601.T_IOT_M0T0Y0P0E1\",\"elements\":[{\"name\":\"G_DEVICE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"G_CREATED\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_SENSOR\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_VALUE\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"C_TIMESTAMP\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}}],\"navigations\":[],\"annotations\":{\"entityType\":\"com.sap.iotservices.mms.D053601.T_IOT_M0T0Y0P0E1\"}},{\"name\":\"D053601_PDMS_TEST.PDMSTABLE\",\"entityType\":\"com.sap.iotservices.mms.D053601_PDMS_TEST.PDMSTABLE\",\"fullyQualifiedName\":\"com.sap.iotservices.mms.D053601_PDMS_TEST.PDMSTABLE\",\"elements\":[{\"name\":\"pdmssensor\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"pdmsvalue\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}},{\"name\":\"pdmstimestamp\",\"isKey\":true,\"remoteType\":\"String\",\"annotations\":{}}],\"navigations\":[],\"annotations\":{\"entityType\":\"com.sap.iotservices.mms.D053601_PDMS_TEST.PDMSTABLE\"}}]}", "get model as expected");
					//start();
				} else {
					assert.ok(null, "getModelTemplateRepresentation - multiple EntityContainer failed");
					//start();
				}
			});

		});

		it("getUrl", function() {
			return Q(jQuery.ajax({url: require.toUrl(fullPath("ast.json")), dataType: "json"})).then(function (result) {
				var astJson = result;

				var astProvider = astLibrary.getRiverAstLibrary(astJson.response[0]);
				oDataProviderManager.init(astProvider, "urlValue", "river");
				var url = oDataProviderManager.getUrl();
				assert.equal(url, "urlValue", "got right url value");
			});

		});

		it("isInitialized RDL", function() {
			oDataProviderManager.init({}, {}, "river");
			assert.ok(oDataProviderManager.isInitialized(), "isInitialized for RDL");
		});

		it("isInitialized OData", function() {
			oDataProviderManager.init({}, {}, "odata_abap");
			assert.ok(oDataProviderManager.isInitialized(), "isInitialized for OData");
		});

		it("getEntitiesFromRDL - _dataProvider is null", function() {
			return Q(jQuery.ajax({url: require.toUrl(fullPath("ast.json")), dataType: "json"})).then(function (result) {
				var astJson = result;

				var astProvider = astLibrary.getRiverAstLibrary(astJson.response[0]);
				oDataProviderManager.init(null, null, "river");
				var aEntities = oDataProviderManager._getEntitiesFromRDL();
				assert.equal(aEntities.length, 0, "got right value");
			});

		});

		it("isRootEntity", function() {
			var aEntities = [{"name" : "set1", "annotations" : {}} ,
				{"name" : "set2", "annotations" : {"addressable" : false}},
				{"name" : "set3", "annotations" : {"creatable" : false}}];
			//test is root true
			assert.equal(oDataProviderManager.isRootEntity("set1", aEntities), true, "set1 is a root entity");
			//test is root false
			assert.equal(oDataProviderManager.isRootEntity("set2", aEntities), false, "set2 is not a root entity");
			//test is root true
			assert.equal(oDataProviderManager.isRootEntity("set3", aEntities), true, "set3 is a root entity");
		});

		it("isRootEntity - false", function() {
			assert.equal(oDataProviderManager.isRootEntity("set2", []), false, "set2 is not a root entity");
		});


		it("isKeyProperty  - found value", function() {
			var aProperties = [
				{name: "prop1", isKey: true},
				{name: "prop2", remoteType: "2"}
			];
			var bIsKey = oDataProviderManager.isKeyProperty("prop1", aProperties);
			assert.equal(bIsKey, true, "got right value");
		});

		it("isKeyProperty  - found isKey: false", function() {
			var aProperties = [
				{name: "prop1", isKey: false},
				{name: "prop2", remoteType: "2"}
			];
			var bIsKey = oDataProviderManager.isKeyProperty("prop1", aProperties);
			assert.equal(bIsKey, false, "got right value");
		});

		it("isKeyProperty  - not found", function() {
			var aProperties = [
				{name: "prop1", isKey: false},
				{name: "prop2", remoteType: "2"}
			];
			var bIsKey = oDataProviderManager.isKeyProperty("prop3", aProperties);
			assert.equal(bIsKey, false, "got right value");
		});

		it("isKeyProperty  - false", function() {
			var bIsKey = oDataProviderManager.isKeyProperty("prop1", []);
			assert.equal(bIsKey, false, "got right value");
		});

		it("isStringProperty  - found value LargeString", function() {
			var aProperties = [
				{name: "prop1", remoteType: "LargeString"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isStringProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isStringProperty  - found value String", function() {
			var aProperties = [
				{name: "prop1", remoteType: "String"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isStringProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isStringProperty  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isStringProperty("prop3", aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isStringProperty  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isStringProperty(null, aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isStringProperty  - aProperties is null", function() {
			var bResult = oDataProviderManager.isStringProperty("dsds", null);
			assert.equal(bResult, false, "got right value");
		});



		it("isDateProperty  - found value UTCTimestamp", function() {
			var aProperties = [
				{name: "prop1", remoteType: "UTCTimestamp"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isDateProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isDateProperty  - found value UTCDateTime", function() {
			var aProperties = [
				{name: "prop1", remoteType: "UTCDateTime"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isDateProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isDateProperty  - found value LocalTime", function() {
			var aProperties = [
				{name: "prop1", remoteType: "LocalTime"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isDateProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isDateProperty  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isDateProperty("prop3", aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isDateProperty  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isDateProperty(null, aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isDateProperty  - aProperties is null", function() {
			var bResult = oDataProviderManager.isDateProperty("dsds", null);
			assert.equal(bResult, false, "got right value");
		});



		it("isNumericProperty  - found value Decimal", function() {
			var aProperties = [
				{name: "prop1", remoteType: "Decimal"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isNumericProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isNumericProperty  - found value DecimalFloat", function() {
			var aProperties = [
				{name: "prop1", remoteType: "DecimalFloat"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isNumericProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isNumericProperty  - found value Integer", function() {
			var aProperties = [
				{name: "prop1", remoteType: "Integer"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isNumericProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isNumericProperty  - found value BinaryFloat", function() {
			var aProperties = [
				{name: "prop1", remoteType: "BinaryFloat"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isNumericProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isNumericProperty  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isNumericProperty("prop3", aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isNumericProperty  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isNumericProperty(null, aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isNumericProperty  - aProperties is null", function() {
			var bResult = oDataProviderManager.isNumericProperty("dsds", null);
			assert.equal(bResult, false, "got right value");
		});



		it("isBooleanProperty  - found value Boolean", function() {
			var aProperties = [
				{name: "prop1", remoteType: "Boolean"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBooleanProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isBooleanProperty  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBooleanProperty("prop3", aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isBooleanProperty  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBooleanProperty(null, aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isBooleanProperty  - aProperties is null", function() {
			var bResult = oDataProviderManager.isBooleanProperty("dsds", null);
			assert.equal(bResult, false, "got right value");
		});



		it("isBinaryProperty  - found value LargeBinary", function() {
			var aProperties = [
				{name: "prop1", remoteType: "LargeBinary"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBinaryProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isBinaryProperty  - found value Binary", function() {
			var aProperties = [
				{name: "prop1", remoteType: "Binary"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBinaryProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isBinaryProperty  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBinaryProperty("prop3", aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isBinaryProperty  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isBinaryProperty(null, aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isBinaryProperty  - aProperties is null", function() {
			var bResult = oDataProviderManager.isBinaryProperty("dsds", null);
			assert.equal(bResult, false, "got right value");
		});


		it("isGuidProperty  - found value UUID", function() {
			var aProperties = [
				{name: "prop1", remoteType: "UUID"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isGuidProperty("prop1", aProperties);
			assert.equal(bResult, true, "got right value");
		});

		it("isGuidProperty  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isGuidProperty("prop3", aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isGuidProperty  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var bResult = oDataProviderManager.isGuidProperty(null, aProperties);
			assert.equal(bResult, false, "got right value");
		});

		it("isGuidProperty  - aProperties is null", function() {
			var bResult = oDataProviderManager.isGuidProperty("dsds", null);
			assert.equal(bResult, false, "got right value");
		});

		it("isNavigationsToMany", function() {
			var aNavigations = [{"name" : "nav1", "multiplicity" : "*"} ,
				{"name" : "nav2", "multiplicity" : "1"}
			];
			//test is to many true
			assert.equal(oDataProviderManager.isNavigationsToMany("nav1", aNavigations), true, "nav1 is a navigation to many");
			//test is to many false
			assert.equal(oDataProviderManager.isNavigationsToMany("nav2", aNavigations), false, "nav2 is not a navigation to many");
		});

		it("isNavigationsToOne", function() {
			var aNavigations = [{"name" : "nav1", "multiplicity" : "*"} ,
				{"name" : "nav2", "multiplicity" : "1"}
			];
			//test is to one true
			assert.equal(oDataProviderManager.isNavigationsToOne("nav2", aNavigations), true, "nav2 is a navigation to one");
			//test is to one false
			assert.equal(oDataProviderManager.isNavigationsToOne("nav1", aNavigations), false, "nav1 is not a navigation to one");
		});

		it("isNavigationByMultiplicity", function() {
			var aNavigations = [{"name" : "nav1", "multiplicity" : "*"} ,
				{"name" : "nav2", "multiplicity" : "1"}
			];
			//test is to * true
			assert.equal(oDataProviderManager.isNavigationByMultiplicity("nav1", aNavigations, "*"), true, "nav1 is a navigation to *");
			//test is to x false
			assert.equal(oDataProviderManager.isNavigationByMultiplicity("nav1", aNavigations, "x"), false, "nav1 is not a navigation to x");
			assert.equal(oDataProviderManager.isNavigationByMultiplicity("nav1", [], "x"), false, "empty aNavigations");
		});

		it("_getPropertyType  - found value", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var sRemoteType = oDataProviderManager._getPropertyType("prop1", aProperties);
			assert.equal(sRemoteType, 1, "got right value");
		});

		it("_getPropertyType  - value not exist in properties", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var sRemoteType = oDataProviderManager._getPropertyType("prop3", aProperties);
			assert.equal(sRemoteType, null, "got right value");
		});

		it("_getPropertyType  - sValue is null", function() {
			var aProperties = [
				{name: "prop1", remoteType: "1"},
				{name: "prop2", remoteType: "2"}
			];
			var sRemoteType = oDataProviderManager._getPropertyType(null, aProperties);
			assert.equal(sRemoteType, null, "got right value");
		});

		it("_getPropertyType  - aProperties is null", function() {
			var sRemoteType = oDataProviderManager._getPropertyType("dsds", null);
			assert.equal(sRemoteType, null, "got right value");
		});
	});
});