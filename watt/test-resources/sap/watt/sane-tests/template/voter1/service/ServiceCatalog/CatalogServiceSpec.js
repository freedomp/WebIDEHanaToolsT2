define(["STF"] , function(STF) {

	"use strict";
	var suiteName = "CatalogService_Integration", getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		var _oMockServer, _oMockServer1, _oMockServer2, oCatalogStep, oCatalogService, iFrameWindow,
			_requestSentCallNumber, _deprecatedMode, _sEventMessage;

		var oDataType = {
			_CATALOG_RDL: "river",
			_CATALOG_ODATA_ABAP: "odata_abap",
			_CATALOG_GENERIC: "odata_gen",
			_CATALOG_APIMGMT: "api_mgmt",
			_CATALOG_APIMGMT_CATALOG: "api_mgmt_catalog",
			_CATALOG_APIMGMT_PROXY: "api_mgmt_proxy"
		};

		var that = this;

		before(function () {
			return STF.startWebIde(suiteName, {config: "template/config.json"})
				.then(function (oWindow) {
					iFrameWindow = oWindow;
					oCatalogStep = getService('catalogstep');
					oCatalogService = getService('servicecatalog');

					_requestSentCallNumber = 0;
					_deprecatedMode = false;

					oCatalogStep.setProgressBarOn = function(){
						switch(_requestSentCallNumber) {
							case 0:
								assert.ok(true, "Set progressbar to be on - populate Connections");
								break;
							case 1:
								assert.ok(true, "Set progressbar to be on - populate services tree");
								break;
							case 2:
								assert.ok(true, "Set progressbar to be on - service selection");
								break;
							default:
								assert.ok(true, "Set progressbar to be on");
						}
						_requestSentCallNumber++;
					};

					oCatalogStep.setProgressBarOff = function(){
						if (_deprecatedMode){
							//get in only after service selection
							assert.equal(_sEventMessage,"Not Found","Service metadata file not found as expected.");
							//start();
						}
					};

					oCatalogStep.onDestinationSelection = function(){
						assert.notEqual(that.oCatalogComboBox.getItems().length, 0, "The combo box updated with the destinations as expected.");
						var aListItems = that.oCatalogComboBox.getItems();
						//make sure no odata_gen exist
						var oDataGenExists = false;
						for ( var i = 1; i<=aListItems.length-1; i++){
							if (aListItems[i].data("connection").type === oDataType._CATALOG_GENERIC){
								oDataGenExists = true;
								break;
							}
						}
						//make sure no odata_gen destination type was found
						assert.ok(!oDataGenExists,"odata_gen destination type found for catalog service option");

						if(aListItems[1]) {
							aListItems[1].data("connection").url = that._oConnection.url;
							aListItems[1].data("connection").type = that._oConnection.type;
							aListItems[1].data("connection").destination.url = that._oConnection.destination.url;
							aListItems[1].data("connection").destination.wattUsage = that._oConnection.destination.wattUsage;

							// select a destination from the combo box.
							that.oCatalogComboBox.fireEvent("change", {
								selectedItem : aListItems[1]
							});
						}

						oCatalogService.detachEvent("requestCompleted");
						if (!that._deprecatedMode){
							oCatalogService.attachEvent("requestCompleted", oCatalogStep.onServiceSelectionFromTree, that);
						}
						else{
							oCatalogService.attachEvent("requestCompleted", oCatalogStep.onDeprecatedServiceSelectionFromTree, that);
						}
					};

					oCatalogStep.onServiceSelectionFromTree = function(){
						assert.ok(true, "Select a Service From Tree");
						var node = that._oTree.getNodes()[1];
						node.data("ServiceUrl", "/metamodel");
						node.data("serviceName", "RmtSampleFlight");

						that._oTree.setSelection(node);
						oCatalogService.detachEvent("requestCompleted");
						oCatalogService.attachEvent("requestCompleted", oCatalogStep.setProgressBarOff, that);
					};

					oCatalogStep.onServiceSelectionCompleted = function(oEvent){
						var oConnectionData = oEvent.params.connectionData;
						assert.notEqual(oConnectionData, null, "Success to select a Service.");
						//start();
					};

					oCatalogStep.onServiceCatalogStepNext = function(oEvent){
						if (oEvent.params){
							_sEventMessage = oEvent.params.sMessage;
						}
					};

					oCatalogStep.onDeprecatedServiceSelectionFromTree = function(){

						assert.ok(true, "Select a Deprecated Service From Tree");
						var node = that._oTree.getNodes()[1];
						node.data("ServiceUrl", "/Deprecatedmetamodel");
						node.data("serviceName", "RmtSampleFlight");

						that._oTree.setSelection(node);
						oCatalogService.detachEvent("requestCompleted");
						oCatalogService.attachEvent("requestCompleted", oCatalogStep.setProgressBarOff, that);
					};

					oCatalogStep.onApiProxieSelected = function(){
						assert.ok(that.oTree.getNodes()[0].data("ServiceUrl") === "https://navasz4-test.itc.sap.com:443/TestP1","failed to get products and proxie details");
						assert.ok(that.oProductTree.getNodes().length === 1,"failed to get products");
						that.oProductTree.getNodes()[0].select(false,true);
						that.oSubscribeToProduct.apply(that.onSelectionImpl);
						oCatalogService.detachEvent("requestCompleted"); // avoid call it again

					};
					oCatalogStep.onApiProdSubscribeCompleted = function(oEvent){

						var oConnectionData = oEvent.params.connectionData;
						assert.notEqual(oConnectionData.apiKey === "hVAW02CH9caWzgAoyBA4qjZKD88EeFgE", null, "Success to select a Service.");

						//start();
						_oMockServer2.stop();
					};

					// prepare mock server
					iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
					_oMockServer = new iFrameWindow.sap.ui.app.MockServer({ rootUri: "/metamodel/"});
					_oMockServer.simulate(fullPath("rmtsampleflightMetadata.xml"));
					_oMockServer.start();

					_oMockServer1 = new iFrameWindow.sap.ui.app.MockServer({ rootUri: '/model/'});
					_oMockServer1.simulate(fullPath("catalogmetadata.xml"));
					_oMockServer1.start();
				});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			_oMockServer.stop();
			_oMockServer.destroy();
			_oMockServer1.stop();
			_oMockServer1.destroy();
			_oMockServer2.stop();
			_oMockServer2.destroy();
		});

		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter1/service/ServiceCatalog/resources/" +
				sFileName;
		}

		it("Catalog service - get Catalog", function(done) {

			that._oConnection =  {
				name : "/model",
				url :  "/model",
				type : oDataType._CATALOG_ODATA_ABAP,
				destination : {
					url: "/model",
					wattUsage: oDataType._CATALOG_ODATA_ABAP
				}
			};

			oCatalogService.getCatalog(that._oConnection).then(function(oTree) {
				that._oTree = oTree;
				assert.ok(oTree, "success");
				assert.equal(oTree.getNodes().length, "100", "100 entries returned");
				done();
			});
		});

		it("Catalog service - get Catalog for oData", function(done) {

			that._oConnection =  {
				name : "/model",
				url :  "/model",
				type : oDataType._CATALOG_ODATA_ABAP,
				destination : {
					url: "/model",
					wattUsage: oDataType._CATALOG_ODATA_ABAP
				}
			};

			oCatalogService.getCatalog(that._oConnection).then(function(oTree) {
				that._oTree = oTree;
				assert.ok(oTree, "success");
				assert.equal(oTree.getNodes().length, "100", "100 entries returned");
				done();
			});
		});


		it("Catalog service - populate Connections", function(){

			// Events flow: select destination --> select service From tree --> onServiceSelectionCompleted

			oCatalogService.detachEvent("requestSent");
			oCatalogService.detachEvent("requestCompleted");
			oCatalogService.detachEvent("validateNextSent");
			oCatalogService.detachEvent("serviceSelectionCompleted");

			that._deprecatedMode = false;
			that._requestSentCallNumber = 0;

			oCatalogService.attachEvent("requestSent", oCatalogStep.setProgressBarOn, that);
			oCatalogService.attachEvent("requestCompleted", oCatalogStep.onDestinationSelection, that);
			oCatalogService.attachEvent("validateNextSent", oCatalogStep.onServiceCatalogStepNext, that);
			oCatalogService.attachEvent("serviceSelectionCompleted", oCatalogStep.onServiceSelectionCompleted, that);


			return oCatalogService.getContent().then(function(oGrid){
				that.oCatalogComboBox = oGrid.getContent()[2].getContent()[0];
			});
		});

		it("Catalog service - getServiceConnectionData", function(){

			oCatalogService.detachEvent("requestCompleted");
			oCatalogService.detachEvent("serviceSelectionCompleted");

			oCatalogService.attachEvent("requestCompleted", oCatalogStep.setProgressBarOff, that);
			oCatalogService.attachEvent("serviceSelectionCompleted", oCatalogStep.onServiceSelectionCompleted, that);

			var oConnection =  {
				name : "/metamodel",
				url :  "/metamodel",
				type : oDataType._CATALOG_ODATA_ABAP,
				destination : {
					url: "/metamodel",
					wattUsage: oDataType._CATALOG_ODATA_ABAP
				}
			};

			var sUrl = "/metamodel";
			that._requestSentCallNumber = 0;

			return oCatalogService.getServiceConnectionData(oConnection, sUrl).then(function() {
				assert.ok(true, "Get Service Connection Data method was run successfully");
			});

		});

		it("Catalog service - clean grid", function(done){
			oCatalogService.cleanGrid().then(function(){
				oCatalogService.getFocusElement().then(function(oGrid){
					assert.equal(oGrid, undefined, "Grid was removed as expected.");
					done();
				});
			});
		});

		it("Catalog service - populate Connections - negative test", function(){

			// Events flow: select destination --> select service From tree -->
			oCatalogService.detachEvent("requestSent");
			oCatalogService.detachEvent("requestCompleted");
			oCatalogService.detachEvent("validateNextSent");
			oCatalogService.detachEvent("serviceSelectionCompleted");

			oCatalogService.attachEvent("requestSent", oCatalogStep.setProgressBarOn, that);
			oCatalogService.attachEvent("requestCompleted", oCatalogStep.onDestinationSelection, that);
			oCatalogService.attachEvent("validateNextSent", oCatalogStep.onServiceCatalogStepNext, that);
			oCatalogService.attachEvent("serviceSelectionCompleted", oCatalogStep.onServiceSelectionCompleted, that);

			that._deprecatedMode = true;
			that._requestSentCallNumber = 0;

			return oCatalogService.getContent().then(function(oGrid){
				that.oCatalogComboBox = oGrid.getContent()[2].getContent()[0];
			});
		});


		it("Catalog service -  get Catalog - negative test", function(done){

			that._oConnection =  {
				name : "/model",
				url :  "/model1",
				type : oDataType._CATALOG_ODATA_ABAP,
				destination : {
					url: "/model",
					wattUsage: oDataType._CATALOG_ODATA_ABAP
				}
			};

			that._deprecatedMode = true;
			that._requestSentCallNumber = 0;

			return oCatalogService.getContent().then(function(){
				return oCatalogService.getCatalog(that._oConnection).then(function(oTree) {
					assert.ok(!oTree, "Wrong connection url get catalog method should be failed.");
					done();
				}).fail(function(oError){
					var sErrMsg = oError;
					if (oError.message){
						sErrMsg = oError.message;
					}
					assert.ok(sErrMsg, "Wrong connection url get catalog method failed as expected.");
					done();
				});
			});
		});

		it("Catalog service -  get API proxies catalog - api mgmnt", function(done){

			that._oConnection =  {
				name : "/proxies",
				url :  "/proxies",
				type : oDataType._CATALOG_APIMGMT_CATALOG,
				destination : {
					url: "/proxies",
					wattUsage: oDataType._CATALOG_APIMGMT_CATALOG
				}
			};

			that._deprecatedMode = true;
			that._requestSentCallNumber = 0;
			var jProxies =  "{\"d\":{\"results\":[{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"1ff55efada11468e9750b7c286de5394\",\"version\":\"1\",\"name\":\"TestGPN2\",\"title\":\"TestGPN2\",\"description\":\"TestGPN2\",\"published_at\":\"\\/Date(1432036365163)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"200583bcde51483bac5027babb22b3d1\",\"version\":\"1\",\"name\":\"SIMPLEURL\",\"title\":\"Simple\",\"description\":\"Simple\",\"published_at\":\"\\/Date(1432026466360)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"34a2289858214cc2a36ab0141eca3f87\",\"version\":\"1\",\"name\":\"banksoapservice\",\"title\":\"banksoapservice\",\"description\":null,\"published_at\":\"\\/Date(1432026466206)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"3b7341d9862c43668e06755f3fe2346d\",\"version\":\"1\",\"name\":\"testlinkdelink2\",\"title\":\"testlinkdelink2\",\"description\":\"testlinkdelink2\",\"published_at\":\"\\/Date(1432271384966)\\/\",\"published_by\":\"I071754\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"40a60f21a9704c74a2bb04690add77b7\",\"version\":\"1\",\"name\":\"oem_simple_05_05_6\",\"title\":\"oem_simple_05_05_6_T1title...\",\"description\":\"oem_simple_05_05_6_desc...\",\"published_at\":\"\\/Date(1432026465090)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"6f70008e05304104980818a639aa486c\",\"version\":\"1\",\"name\":\"TestRoleCatalogIntegration\",\"title\":\"Role Test\",\"description\":null,\"published_at\":\"\\/Date(1432197679746)\\/\",\"published_by\":\"C5203121\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"817c36c969c7495daa929373031c779d\",\"version\":\"1\",\"name\":\"TestP1\",\"title\":\"TestP1\",\"description\":\"TestP1\",\"published_at\":\"\\/Date(1433333833826)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"85dc17eceb604040a2515b8dccf7ed6c\",\"version\":\"1\",\"name\":\"testlinkdelink1\",\"title\":\"testlinkdelink1\",\"description\":\"testlinkdelink1\",\"published_at\":\"\\/Date(1432271343316)\\/\",\"published_by\":\"I071754\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"8a0234ddc65f4c798225244df7cce361\",\"version\":\"1\",\"name\":\"xsl_test\",\"title\":\"xsl_test\",\"description\":null,\"published_at\":\"\\/Date(1432026465380)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"8ac46bd607824ddf8ccd75deedf18aad\",\"version\":\"1\",\"name\":\"APIProxy16052015\",\"title\":\"APIProxy16052015\",\"description\":\"APIProxy160520154594\",\"published_at\":\"\\/Date(1432026465543)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"93cec4fc37234876b8cef9f3fcd01c6d\",\"version\":\"1\",\"name\":\"Test1256432\",\"title\":\"Tewst49878hjkjh\",\"description\":null,\"published_at\":\"\\/Date(1432026465203)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"96cc7ceb819849d690dcd633a048eb57\",\"version\":\"1\",\"name\":\"TestnewapiGPN1\",\"title\":\"TestnewapiGPN1\",\"description\":\"TestnewapiGPN1\",\"published_at\":\"\\/Date(1432719688563)\\/\",\"published_by\":\"I042713\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"a087691ed2364a3484ea09748cbe3bda\",\"version\":\"1\",\"name\":\"testproxy\",\"title\":\"testproxy\",\"description\":\"testproxy\",\"published_at\":\"\\/Date(1432026466046)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"ace8a4c0d4804a90b2c954c7281780fb\",\"version\":\"1\",\"name\":\"GPNtestsmoke111\",\"title\":\"GPNtestsmoke111\",\"description\":\"GPNtestsmoke111\",\"published_at\":\"\\/Date(1432701679033)\\/\",\"published_by\":\"I042713\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"bbbae5b5de1944aca3e89559e0f923d4\",\"version\":\"1\",\"name\":\"oem_simple_05_05_7\",\"title\":\"oem_simple_05_05_7_T1title...\",\"description\":\"oem_simple_05_05_7_desc...\",\"published_at\":\"\\/Date(1431683596753)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"d136fd1257774d49a4547deb93179b06\",\"version\":\"1\",\"name\":\"NorthwindSVC\",\"title\":\"NorthwindSVCs\",\"description\":\"NorthwindSVC\",\"published_at\":\"\\/Date(1432812598553)\\/\",\"published_by\":\"I043874\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"e112e548ec714f49ba548b4cda378f18\",\"version\":\"1\",\"name\":\"CATALOGSERVICE\",\"title\":\"CATALOGSERVICE\",\"description\":\"Catalog Service Version 2\",\"published_at\":\"\\/Date(1433757656243)\\/\",\"published_by\":\"I050442\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"e6a355000b9f41d397b063bae26cc9c8\",\"version\":\"1\",\"name\":\"NorthwindV2\",\"title\":\"V2\",\"description\":\"V2\",\"published_at\":\"\\/Date(1433333484726)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"eebecdf1dd734ec9a540dce0216b19f8\",\"version\":\"1\",\"name\":\"Test_api\",\"title\":\"test\",\"description\":null,\"published_at\":\"\\/Date(1431698075626)\\/\",\"published_by\":\"I302609\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"fc346df22fb344bbab8c0cd3d150b8a5\",\"version\":\"1\",\"name\":\"yahooApi\",\"title\":\"api\",\"description\":\"desc\",\"published_at\":\"\\/Date(1432201023706)\\/\",\"published_by\":\"I069135\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"fde2a821f33244999d1d709789e4dd70\",\"version\":\"1\",\"name\":\"verify_key\",\"title\":\"verify_key\",\"description\":null,\"published_at\":\"\\/Date(1433742590680)\\/\",\"published_by\":\"I061882\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')/ToProxyEndPoints\"}}}]}}";

			_oMockServer2 = new iFrameWindow.sap.ui.core.util.MockServer({
				rootUri: "",
				requests: [{
					method: "GET",
					path: new iFrameWindow.RegExp(".*APIProxies.*"),
					response: function (oXhr) {
						oXhr.respond(200, {
							"Content-Type": "application/json"
						}, jProxies);
					}
				}]
			});
			_oMockServer2.start();

			return oCatalogService.getContent().then(function(){
				return oCatalogService.getCatalog(that._oConnection).then(function(oTree) {
					assert.ok(oTree.getNodes()[0].data("APIProxy") === "APIMgmt.APIProxies('TestGPN2')", "Failed to get node APIProxy.");
					assert.ok(oTree.getNodes()[0].data("Description") === "TestGPN2", "Failed to get node APIProxy Description.");
					assert.ok(oTree.getNodes()[0].data("ServiceName")==="TestGPN2", "Failed to get node ServiceName.");
					done();
					_oMockServer2.stop();
				}).fail(function(oError) {
					assert.ok(true, "Failed with error." + oError.message);
					done();
				});
			}).fail(function(oError) {
				assert.ok(true, "Failed with error." + oError.message);
				done();
			});
		});

		it.skip("Catalog service -  subscribe API's products - api mgmnt", function(){

			oCatalogService.detachEvent("requestSent");
			oCatalogService.detachEvent("serviceSelectionCompleted");
			oCatalogService.detachEvent("requestCompleted");
			oCatalogService.attachEvent("serviceSelectionCompleted", oCatalogStep.onApiProdSubscribeCompleted, that);

			that._oConnection =  {
				name : "/proxies",
				url :  "/proxies",
				type : oDataType._CATALOG_APIMGMT_CATALOG,
				destination : {
					url: "/proxies",
					wattUsage: oDataType._CATALOG_APIMGMT_CATALOG
				}
			};
			that._oProductsConnection =  {
				name : "/products",
				url :  "/products",
				type : oDataType._CATALOG_APIMGMT_CATALOG,
				destination : {
					url: "/products",
					wattUsage: oDataType._CATALOG_APIMGMT_CATALOG
				}
			};

			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/service/ServiceCatalog/resources/apiProxyMetadata.xml"))).then(
				function(oEndpointMD){
					var jProducts =  "{\"d\":{\"__metadata\":{\"id\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')\",\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"817c36c969c7495daa929373031c779d\",\"version\":\"1\",\"name\":\"TestP1\",\"title\":\"TestP1\",\"description\":\"TestP1\",\"published_at\":\"\\/Date(1433333833826)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"results\":[{\"__metadata\":{\"id\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProducts('TestP1Prod')\",\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProducts('TestP1Prod')\",\"type\":\"developer.APIProductsType\"},\"name\":\"TestP1Prod\",\"title\":\"TestP1Prod\",\"reg_id\":\"3852a769094f41cebdce3628ecef700e\",\"version\":\"1\",\"vendor\":null,\"description\":\"TestP1Prod\",\"published_at\":\"\\/Date(1433334097480)\\/\",\"published_by\":\"I055339\",\"ToApplicationDetails\":{\"__deferred\":{\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProducts('TestP1Prod')/ToApplicationDetails\"}},\"ToAPIProxies\":{\"__deferred\":{\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProducts('TestP1Prod')/ToAPIProxies\"}}}]},\"ToProxyEndPoints\":{\"results\":[{\"__metadata\":{\"id\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.ProxyEndPoints('AD4ACF8C-E371-4002-85CD-EEE2CA4CCD76')\",\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.ProxyEndPoints('AD4ACF8C-E371-4002-85CD-EEE2CA4CCD76')\",\"type\":\"developer.ProxyEndPointsType\"},\"id\":\"AD4ACF8C-E371-4002-85CD-EEE2CA4CCD76\",\"reg_id\":\"6e01bf45a6b744b3b143d862ab8e03b9\",\"name\":\"default\",\"base_path\":\"https://navasz4-test.itc.sap.com:443/TestP1\",\"apiproxy_name\":null,\"ToAPIResources\":{\"__deferred\":{\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.ProxyEndPoints('AD4ACF8C-E371-4002-85CD-EEE2CA4CCD76')/ToAPIResources\"}}}]}}}";
					var jProxies =  "{\"d\":{\"results\":[{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"1ff55efada11468e9750b7c286de5394\",\"version\":\"1\",\"name\":\"TestGPN2\",\"title\":\"TestGPN2\",\"description\":\"TestGPN2\",\"published_at\":\"\\/Date(1432036365163)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestGPN2')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"200583bcde51483bac5027babb22b3d1\",\"version\":\"1\",\"name\":\"SIMPLEURL\",\"title\":\"Simple\",\"description\":\"Simple\",\"published_at\":\"\\/Date(1432026466360)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('SIMPLEURL')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"34a2289858214cc2a36ab0141eca3f87\",\"version\":\"1\",\"name\":\"banksoapservice\",\"title\":\"banksoapservice\",\"description\":null,\"published_at\":\"\\/Date(1432026466206)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('banksoapservice')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"3b7341d9862c43668e06755f3fe2346d\",\"version\":\"1\",\"name\":\"testlinkdelink2\",\"title\":\"testlinkdelink2\",\"description\":\"testlinkdelink2\",\"published_at\":\"\\/Date(1432271384966)\\/\",\"published_by\":\"I071754\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink2')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"40a60f21a9704c74a2bb04690add77b7\",\"version\":\"1\",\"name\":\"oem_simple_05_05_6\",\"title\":\"oem_simple_05_05_6_T1title...\",\"description\":\"oem_simple_05_05_6_desc...\",\"published_at\":\"\\/Date(1432026465090)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_6')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"6f70008e05304104980818a639aa486c\",\"version\":\"1\",\"name\":\"TestRoleCatalogIntegration\",\"title\":\"Role Test\",\"description\":null,\"published_at\":\"\\/Date(1432197679746)\\/\",\"published_by\":\"C5203121\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestRoleCatalogIntegration')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"817c36c969c7495daa929373031c779d\",\"version\":\"1\",\"name\":\"TestP1\",\"title\":\"TestP1\",\"description\":\"TestP1\",\"published_at\":\"\\/Date(1433333833826)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestP1')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"85dc17eceb604040a2515b8dccf7ed6c\",\"version\":\"1\",\"name\":\"testlinkdelink1\",\"title\":\"testlinkdelink1\",\"description\":\"testlinkdelink1\",\"published_at\":\"\\/Date(1432271343316)\\/\",\"published_by\":\"I071754\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testlinkdelink1')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"8a0234ddc65f4c798225244df7cce361\",\"version\":\"1\",\"name\":\"xsl_test\",\"title\":\"xsl_test\",\"description\":null,\"published_at\":\"\\/Date(1432026465380)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('xsl_test')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"8ac46bd607824ddf8ccd75deedf18aad\",\"version\":\"1\",\"name\":\"APIProxy16052015\",\"title\":\"APIProxy16052015\",\"description\":\"APIProxy160520154594\",\"published_at\":\"\\/Date(1432026465543)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('APIProxy16052015')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"93cec4fc37234876b8cef9f3fcd01c6d\",\"version\":\"1\",\"name\":\"Test1256432\",\"title\":\"Tewst49878hjkjh\",\"description\":null,\"published_at\":\"\\/Date(1432026465203)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test1256432')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"96cc7ceb819849d690dcd633a048eb57\",\"version\":\"1\",\"name\":\"TestnewapiGPN1\",\"title\":\"TestnewapiGPN1\",\"description\":\"TestnewapiGPN1\",\"published_at\":\"\\/Date(1432719688563)\\/\",\"published_by\":\"I042713\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('TestnewapiGPN1')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"a087691ed2364a3484ea09748cbe3bda\",\"version\":\"1\",\"name\":\"testproxy\",\"title\":\"testproxy\",\"description\":\"testproxy\",\"published_at\":\"\\/Date(1432026466046)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('testproxy')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"ace8a4c0d4804a90b2c954c7281780fb\",\"version\":\"1\",\"name\":\"GPNtestsmoke111\",\"title\":\"GPNtestsmoke111\",\"description\":\"GPNtestsmoke111\",\"published_at\":\"\\/Date(1432701679033)\\/\",\"published_by\":\"I042713\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('GPNtestsmoke111')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"bbbae5b5de1944aca3e89559e0f923d4\",\"version\":\"1\",\"name\":\"oem_simple_05_05_7\",\"title\":\"oem_simple_05_05_7_T1title...\",\"description\":\"oem_simple_05_05_7_desc...\",\"published_at\":\"\\/Date(1431683596753)\\/\",\"published_by\":\"P1940019872\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('oem_simple_05_05_7')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"d136fd1257774d49a4547deb93179b06\",\"version\":\"1\",\"name\":\"NorthwindSVC\",\"title\":\"NorthwindSVCs\",\"description\":\"NorthwindSVC\",\"published_at\":\"\\/Date(1432812598553)\\/\",\"published_by\":\"I043874\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindSVC')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"e112e548ec714f49ba548b4cda378f18\",\"version\":\"1\",\"name\":\"CATALOGSERVICE\",\"title\":\"CATALOGSERVICE\",\"description\":\"Catalog Service Version 2\",\"published_at\":\"\\/Date(1433757656243)\\/\",\"published_by\":\"I050442\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('CATALOGSERVICE')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"e6a355000b9f41d397b063bae26cc9c8\",\"version\":\"1\",\"name\":\"NorthwindV2\",\"title\":\"V2\",\"description\":\"V2\",\"published_at\":\"\\/Date(1433333484726)\\/\",\"published_by\":\"I055339\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('NorthwindV2')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"eebecdf1dd734ec9a540dce0216b19f8\",\"version\":\"1\",\"name\":\"Test_api\",\"title\":\"test\",\"description\":null,\"published_at\":\"\\/Date(1431698075626)\\/\",\"published_by\":\"I302609\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('Test_api')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"fc346df22fb344bbab8c0cd3d150b8a5\",\"version\":\"1\",\"name\":\"yahooApi\",\"title\":\"api\",\"description\":\"desc\",\"published_at\":\"\\/Date(1432201023706)\\/\",\"published_by\":\"I069135\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('yahooApi')/ToProxyEndPoints\"}}},{\"__metadata\":{\"id\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')\",\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')\",\"type\":\"developer.APIProxiesType\"},\"reg_id\":\"fde2a821f33244999d1d709789e4dd70\",\"version\":\"1\",\"name\":\"verify_key\",\"title\":\"verify_key\",\"description\":null,\"published_at\":\"\\/Date(1433742590680)\\/\",\"published_by\":\"I061882\",\"ToAPIProducts\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')/ToAPIProducts\"}},\"ToProxyEndPoints\":{\"__deferred\":{\"uri\":\"https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.APIProxies('verify_key')/ToProxyEndPoints\"}}}]}}";
					var jApplications =  "{\"d\":{\"__metadata\":{\"id\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.Applications('F572B423-B1C4-45A5-A482-DA9D372D18AA')\",\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.Applications('F572B423-B1C4-45A5-A482-DA9D372D18AA')\",\"type\":\"developer.ApplicationsType\"},\"reg_id\":\"f1d28874f0724521a15071de18b82abd\",\"id\":\"F572B423-B1C4-45A5-A482-DA9D372D18AA\",\"version\":\"1\",\"developer_id\":\"I040922\",\"title\":\"er\",\"description\":null,\"app_key\":\"hVAW02CH9caWzgAoyBA4qjZKD88EeFgE\",\"app_secret\":\"rx0miBcOCAXAhvrA\",\"callbackurl\":null,\"valid_from\":null,\"valid_to\":null,\"status_code\":\"APPROVED\",\"created_by\":\"I040922\",\"created_at\":\"\\/Date(1434289977086)\\/\",\"modified_by\":\"I040922\",\"modified_at\":\"\\/Date(1434289977090)\\/\",\"ToAPIProductsDetails\":{\"__deferred\":{\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/BAPIManagementgwapitest:443/odata/1.0/data.svc/APIMgmt.Applications('F572B423-B1C4-45A5-A482-DA9D372D18AA')/ToAPIProductsDetails\"}}}}";
					var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oEndpointMD);
					_oMockServer2 = new iFrameWindow.sap.ui.core.util.MockServer({
						rootUri: "",
						requests: [{
							method: "GET",
							path: new iFrameWindow.RegExp(".*ToAPIProducts.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, jProducts);
							}
						},{
							method: "GET",
							path: new iFrameWindow.RegExp(".*APIProxies"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, jProxies);
							}
						},{
							method: "GET",
							path: new iFrameWindow.RegExp(".*Applications.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, jApplications);
							}
						},{
							method: "POST",
							path: new iFrameWindow.RegExp(".*Applications"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, jApplications);
							}
						},
							{
								method: "GET",
								path: new iFrameWindow.RegExp(".*metadata"),
								response: function (oXhr) {
									oXhr.respond(200, {
										"Content-Type": "application/json"
									}, sMetadata);
								}
							}]
					});
					_oMockServer2.start();

					return oCatalogService.getContent().then(function(){
						return oCatalogService.getCatalog(that._oConnection).then(function(oTree) {
							that.oTree = oTree;
							oTree.getNodes()[0].select(false,true);
							assert.equal(oTree.getNodes().length, 21, "Failed to get Api Managment Proxies tree.");
							return STF.getServicePrivateImpl(oCatalogService).then(function (onSelectionImpl){
								that.onSelectionImpl = onSelectionImpl;
								that.oProductTree = onSelectionImpl["oProductsTree"];
								oCatalogService.attachEvent("requestCompleted", oCatalogStep.onApiProxieSelected, that);
								onSelectionImpl["_oConnectionDetails"] = that._oProductsConnection;
								onSelectionImpl["_oApiManagmentEndPointDest"] = {name:"B_API_Managment_EndPoint"};
								that.oSubscribeToProduct = onSelectionImpl["_onSubscribeToProduct"];
								onSelectionImpl["_handleOnSelectedForApiMgm"].apply(onSelectionImpl,[oTree.getNodes()[0]]);
							});
						});
					});
				});
		});
	});
});
