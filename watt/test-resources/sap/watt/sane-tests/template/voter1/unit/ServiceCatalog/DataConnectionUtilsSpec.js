define(["STF", "sap/watt/saptoolsets/fiori/project/plugin/servicecatalog/utils/DataConnectionUtils"] , function(STF, DataConnectionUtils) {

	"use strict";

	var suiteName = "DataConnectionUtils_Unit";

	describe(suiteName, function () {

		// Check getting base url tests

		it("Get Base from full url + metadata", function () {
			var result = DataConnectionUtils.getUrlPath("https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/$metadata");
			assert.equal(result, '/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/',"base url ok");
		});

		it("Get Base from full url no metadata", function () {
			var result = DataConnectionUtils.getUrlPath("https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/");
			assert.equal(result, '/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/',"base url ok");
		});

		it("Get Base from full url no metadata and no ending /", function () {
			var result = DataConnectionUtils.getUrlPath("https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2");
			assert.equal(result, '/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/',"base url ok");
		});

		it("Get Base from relative url no metadata", function () {
			var result = DataConnectionUtils.getUrlPath("/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/");
			assert.equal(result, '/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/',"base url ok");
		});

		it("Get Base from relative url + metadata", function () {
			var result = DataConnectionUtils.getUrlPath("/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/$metadata");
			assert.equal(result, '/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/',"base url ok");
		});

		it("Get Base from relative url no metadata and no ending / and no starting /", function () {
			var result = DataConnectionUtils.getUrlPath("destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2");
			assert.equal(result, '/destinations/dewdflhanaui5/iwbep/RMTSAMPLEFLIGHT_2/',"base url ok");
		});

		it("Get Base from  /", function () {
			var result = DataConnectionUtils.getUrlPath("/");
			assert.equal(result, '/',"base url ok");
		});

		it("Get Base from  string", function () {
			var result = DataConnectionUtils.getUrlPath("claims");
			assert.equal(result, '/claims/',"base url ok");
		});

		//Check convert Url to designtime Url tests

		it("Convert Url to designtime Url - full url", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "https://devint-x80be6fbb.dispatcher.neo.ondemand.com/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/$metadata";

			assert.throws(
				function() {
					DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
				},
				"URL is not supported."
			);

		});

		it("Convert Url to designtime Url- destination without path + relative url no destination", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination without path + relative url with destination", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination without path + /", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/',"designtime url ok");
		});

		//change destination

		it("Convert Url to designtime Url- destination with path + relative url no destination and path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + relative url with destination no path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + relative url with destination and path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + relative url with path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + /", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/',"designtime url ok");
		});

		//Check convert Url to designtime Url tests

		it("Convert Url to designtime Url - full url", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "https://devint-x80be6fbb.dispatcher.neo.ondemand.com/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/$metadata";

			assert.throws(
				function() {
					DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
				},
				"URL is not supported."
			);

		});

		it("Convert Url to designtime Url- destination without path + relative url no destination", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination without path + relative url with destination", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination without path + /", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = "/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/',"designtime url ok");
		});

		//change destination

		it("Convert Url to designtime Url- destination with path + relative url no destination and path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + relative url with destination no path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + relative url with destination and path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + relative url with path", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/',"designtime url ok");
		});

		it("Convert Url to designtime Url- destination with path + /", function () {
			var oDestination = {
				url : "/destinations/mydest/sap/opu/odata",
				path : "/sap/opu/odata"
			};
			var sUrl = "/";
			var result = DataConnectionUtils.getDesigntimeUrl(oDestination, sUrl);
			assert.equal(result, '/destinations/mydest/sap/opu/odata/',"designtime url ok");
		});

		//Get Runtime Url tests

		it("Get Runtime Url - destination without path + relative url with destination", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/iwbep/RMTSAMPLEFLIGHT_2/","designtime url ok");
		});

		it("Get Runtime Url - destination without path + relative url", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = '/iwbep/RMTSAMPLEFLIGHT_2/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/iwbep/RMTSAMPLEFLIGHT_2/","designtime url ok");
		});

		it("Get Runtime Url - destination without path + relative url with destination only", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = '/destinations/mydest/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/","designtime url ok");
		});

		it("Get Runtime Url - destination with path + relative url with destination", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : "/sap/opu/odata"
			};
			var sUrl = '/destinations/mydest/iwbep/RMTSAMPLEFLIGHT_2/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/","designtime url ok");
		});

		it("Get Runtime Url - destination with path + relative url", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : "/sap/opu/odata"
			};
			var sUrl = '/iwbep/RMTSAMPLEFLIGHT_2/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/sap/opu/odata/iwbep/RMTSAMPLEFLIGHT_2/","designtime url ok");
		});

		it("Get Runtime Url - destination without path + relative url with destination only", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : "/sap/opu/odata"
			};
			var sUrl = '/destinations/mydest/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/sap/opu/odata/","designtime url ok");
		});

		it("Get Runtime Url - destination without path + /", function () {
			var oDestination = {
				url : "/destinations/mydest",
				path : ""
			};
			var sUrl = '/';
			var result = DataConnectionUtils.getRuntimeUrl(sUrl, oDestination);
			assert.equal(result, "/","designtime url ok");
		});


		//Check getAdditionalData tests

		it("getAdditionalData", function () {

			var res = DataConnectionUtils.getAdditionalData([]);
			assert.ok(jQuery.isEmptyObject(res), "Empty array returns an empty object");

			res = DataConnectionUtils.getAdditionalData();
			assert.ok(jQuery.isEmptyObject(res), "undefined returns an empty object");

			res = DataConnectionUtils.getAdditionalData(["api_mgmt"]);
			assert.ok((res.isApimgmt && !res.isFullUrl), "isApimgmt true");

			res = DataConnectionUtils.getAdditionalData(["api_mgmt", "full_url"]);
			assert.ok((res.isApimgmt && res.isFullUrl), "isApimgmt & isFullUrl true");

			res = DataConnectionUtils.getAdditionalData(["api_mgmt", "full_url"]);
			assert.ok((res.isApimgmt && res.isFullUrl), "isApimgmt & isFullUrl true");

			res = DataConnectionUtils.getAdditionalData(["full_url"]);
			assert.ok((!res.isApimgmt && res.isFullUrl), "isFullUrl true");

			res = DataConnectionUtils.getAdditionalData(["api_mgmt", "full_url", "test"]);
			assert.ok((res.isApimgmt && res.isFullUrl), "isApimgmt & isFullUrl true");

			res = DataConnectionUtils.getAdditionalData(["test","full_url"]);
			assert.ok((!res.isApimgmt && res.isFullUrl), "isFullUrl true");
		});

		//Check compareDestinationsByDescription

		it("compareDestinationsByDescription", function () {
			var res = DataConnectionUtils.compareDestinationsByDescription({description : "a"},{description : "b"});
			assert.equal(res, -1 ,"a < b");

			res = DataConnectionUtils.compareDestinationsByDescription({description : "b"}, {description : "a"});
			assert.equal(res, 1 ,"b > a");

			res = DataConnectionUtils.compareDestinationsByDescription({description : "a"}, {description : "a"});
			assert.equal(res, 0 ,"b === a");

		});

		//Check getConnections
		var aDestination =[{
			name : "abap1",
			description : "FF",
			proxyUrlPrefix: "",
			path : "",
			url: "",
			wattUsage : "odata_abap",
			additionalData : []
		},{
			name : "abap2",
			description : "CA",
			proxyUrlPrefix: "",
			path : "",
			url: "",
			wattUsage : "odata_abap",
			additionalData : []
		},{
			name : "abap3",
			description : "C",
			proxyUrlPrefix: "",
			path : "",
			url: "",
			wattUsage : "odata_abap",
			additionalData : []
		},
			{
				name : "abap4",
				description : "A",
				proxyUrlPrefix: "",
				path : "",
				url: "",
				wattUsage : "odata_abap",
				additionalData : []
			},{
				name : "gen",
				description : "A",
				proxyUrlPrefix: "",
				path : "",
				url: "",
				wattUsage : "odata_gen",
				additionalData : []
			},{
				name : "gen1",
				description : "B",
				proxyUrlPrefix: "",
				path : "",
				url: "",
				wattUsage : "odata_gen",
				additionalData : []
			},{
				name : "bsp",
				description : "AAA",
				proxyUrlPrefix: "",
				path : "",
				url: "",
				wattUsage : "bsp_execute_abap",
				additionalData : []
			}];

		it("get connections - for odata_abap filter no bsp", function () {
			var aFilter = ["odata_abap"];
			var aConnections = DataConnectionUtils.getConnections(aDestination,aFilter,false);
			assert.equal(aConnections.length, 4,"getConnection returns odata_abap destinations");
			assert.equal(aConnections[2].name, "CA","getConnection sorts  destinations");
		});

		it("get connections - for odata_abap filter  and odata_gen no bsp", function () {
			var aFilter = ["odata_abap","odata_gen"];
			var aConnections = DataConnectionUtils.getConnections(aDestination,aFilter,false);
			assert.equal(aConnections.length, 6,"getConnection returns odata_abap and odata_gen destinations");
			assert.equal(aConnections[2].name, "B","getConnection sorts  destinations");
		});
		it("get connections - for odata_abap filter  and odata_gen with bsp", function () {
			var aFilter = ["odata_abap","odata_gen"];
			var aConnections = DataConnectionUtils.getConnections(aDestination,aFilter,true);
			assert.equal(aConnections.length, 7,"getConnection returns odata_abap and odata_gen destinations");
			assert.equal(aConnections[2].name, "B","getConnection sorts  destinations");
		});
		it("removeAbsoluteURL for metadata", function () {
			var sMetadata = '<?xml version="1.0" encoding="utf-8"?><edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData"><edmx:DataServices m:DataServiceVersion="2.0"><Schema Namespace="CATALOGSERVICE" xml:lang="en" xmlns="http://schemas.microsoft.com/ado/2008/09/edm"><EntityType Name="Service" sap:content-version="1"><Key><PropertyRef Name="ID"/></Key><Property Name="Description" Type="Edm.String" Nullable="false" MaxLength="60" m:FC_TargetPath="SyndicationTitle" m:FC_KeepInContent="true" sap:label="Description" sap:creatable="false" sap:updatable="false" sap:filterable="false"/><Property Name="Title" Type="Edm.String" Nullable="false" MaxLength="40" sap:label="External Name" sap:creatable="false" sap:updatable="false"/><Property Name="Author" Type="Edm.String" Nullable="false" MaxLength="12" m:FC_TargetPath="SyndicationAuthorName" m:FC_KeepInContent="true" sap:label="User Name" sap:creatable="false" sap:updatable="false"/><Property Name="TechnicalServiceVersion" Type="Edm.Int16" Nullable="false" sap:label="Technical Service Version" sap:creatable="false"/><Property Name="ID" Type="Edm.String" Nullable="false" MaxLength="40" sap:label="Identifier" sap:creatable="false" sap:updatable="false" sap:filterable="false"/><Property Name="MetadataUrl" Type="Edm.String" Nullable="false" sap:creatable="false" sap:updatable="false" sap:filterable="false"/><Property Name="TechnicalServiceName" Type="Edm.String" Nullable="false" MaxLength="35" sap:label="Technical Service Name" sap:creatable="false"/><Property Name="ImageUrl" Type="Edm.String" Nullable="false" sap:creatable="false" sap:updatable="false" sap:filterable="false"/><Property Name="ServiceUrl" Type="Edm.String" Nullable="false" sap:creatable="false" sap:updatable="false" sap:filterable="false"/><Property Name="UpdatedDate" Type="Edm.DateTime" Nullable="false" Precision="7" m:FC_TargetPath="SyndicationUpdated" m:FC_KeepInContent="true" sap:label="Time Stamp" sap:creatable="false" sap:updatable="false" sap:filterable="false"/></EntityType><EntityType Name="Catalog" sap:content-version="1"><Key><PropertyRef Name="ID"/></Key><Property Name="Url" Type="Edm.String" Nullable="false" sap:creatable="false" sap:filterable="false"/><Property Name="UpdatedDate" Type="Edm.DateTime" Nullable="false" Precision="7" sap:creatable="false" sap:filterable="false"/><Property Name="ImageUrl" Type="Edm.String" Nullable="false" sap:creatable="false" sap:filterable="false"/><Property Name="ID" Type="Edm.String" Nullable="false" sap:creatable="false" sap:filterable="false"/><Property Name="Description" Type="Edm.String" Nullable="false" sap:creatable="false" sap:filterable="false"/><Property Name="Title" Type="Edm.String" Nullable="false" sap:creatable="false" sap:filterable="false"/><NavigationProperty Name="Services" Relationship="CATALOGSERVICE.Services" FromRole="FromRole_Services" ToRole="ToRole_Services"/></EntityType><Association Name="Services" sap:content-version="1"><End Type="CATALOGSERVICE.Catalog" Multiplicity="1" Role="FromRole_Services"/><End Type="CATALOGSERVICE.Service" Multiplicity="*" Role="ToRole_Services"/></Association><EntityContainer Name="CATALOGSERVICE" m:IsDefaultEntityContainer="true"><EntitySet Name="ServiceCollection" EntityType="CATALOGSERVICE.Service" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:searchable="true" sap:content-version="1"/><EntitySet Name="CatalogCollection" EntityType="CATALOGSERVICE.Catalog" sap:content-version="1"/><AssociationSet Name="AssocSet_Services" Association="CATALOGSERVICE.Services" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1"><End EntitySet="CatalogCollection" Role="FromRole_Services"/><End EntitySet="ServiceCollection" Role="ToRole_Services"/></AssociationSet><FunctionImport Name="BestMatchingService" ReturnType="CATALOGSERVICE.Service" EntitySet="ServiceCollection" m:HttpMethod="GET"><Parameter Name="TechnicalServiceVersionMin" Type="Edm.Int16" Mode="In" Nullable="false"/><Parameter Name="TechnicalServiceName" Type="Edm.String" Mode="In" Nullable="false"/><Parameter Name="TechnicalServiceVersionMax" Type="Edm.Int16" Mode="In" Nullable="false"/></FunctionImport></EntityContainer><atom:link rel="self" href="https://ldcig8p.wdf.sap.corp:44318/sap/opu/odata/IWFND/CATALOGSERVICE/$metadata" xmlns:atom="http://www.w3.org/2005/Atom"/><atom:link rel="latest-version" href="https://ldcig8p.wdf.sap.corp:44318/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/$metadata" xmlns:atom="http://www.w3.org/2005/Atom"/></Schema></edmx:DataServices></edmx:Edmx>';
			assert.ok(sMetadata.indexOf("https://ldcig8p.wdf.sap.corp:4431") > 0, "Url exists on metadata");
			sMetadata = DataConnectionUtils.removeAbsoluteURL(sMetadata,"/sap/opu/odata/IWFND");
			var xmlDoc = jQuery.parseXML(sMetadata);
			assert.ok(xmlDoc, "removeAbsoluteURL returns legal xml");
			assert.equal(sMetadata.indexOf("https://ldcig8p.wdf.sap.corp:4431") , -1, "removeAbsoluteURL succeeded");
		});
		it("removeAbsoluteURL for annotation", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter1/unit/ServiceCatalog/annotations.xml"))).then(function (oAnnotaion) {
				var sAnnotations = new XMLSerializer().serializeToString(oAnnotaion);
				assert.ok(sAnnotations.indexOf("https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com") > 0, "Url exists on metadata");
				sAnnotations = DataConnectionUtils.removeAbsoluteURL(sAnnotations,"destinations/RefAppsBackendDev");
				var xmlDoc = jQuery.parseXML(sAnnotations);
				assert.ok(xmlDoc, "removeAbsoluteURL returns legal xml");
				assert.equal(sAnnotations.indexOf("https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com") , -1, "removeAbsoluteURL succeeded");
			});
		});
		it("removeAbsoluteURL for metadata with annotation", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter1/unit/ServiceCatalog/metadataWithannotations.xml"))).then(function (oAnnotaion) {
				var sAnnotations = new XMLSerializer().serializeToString(oAnnotaion);
				assert.ok(sAnnotations.indexOf("https://ldai6er3.wdf.sap.corp:44335") > 0, "Url exists on metadata");
				sAnnotations = DataConnectionUtils.removeAbsoluteURL(sAnnotations,"sap/opu/odata/sap/FTGEN_HB_TE");
				var xmlDoc = jQuery.parseXML(sAnnotations);
				assert.ok(xmlDoc, "removeAbsoluteURL returns legal xml");
				assert.equal(sAnnotations.indexOf("https://ldai6er3.wdf.sap.corp:44335") , -1, "removeAbsoluteURL succeeded");
			});
		});
		it("removeAbsoluteURL for metadata without domain ", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter1/unit/ServiceCatalog/metadataWithannotations.xml"))).then(function (oAnnotaion) {
				var sAnnotations = new XMLSerializer().serializeToString(oAnnotaion);
				assert.ok(sAnnotations.indexOf("https://ldai6er3.wdf.sap.corp:44335") > 0, "Url exists on metadata");
				var sAnnotationsAfter = DataConnectionUtils.removeAbsoluteURL(sAnnotations,"sap/opu/odata/sap/STRING_NOT_FOUND");
				var xmlDoc = jQuery.parseXML(sAnnotationsAfter);
				assert.ok(xmlDoc, "removeAbsoluteURL returns legal xml");
				assert.equal(sAnnotations , sAnnotationsAfter, "removeAbsoluteURL succeeded");
			});
		});
		it("removeAbsoluteURL for null", function () {
			var sMetadata = "";
			sMetadata = DataConnectionUtils.removeAbsoluteURL(sMetadata,"/sap/opu/odata/IWFND");
			assert.equal(sMetadata , "", "removeAbsoluteURL null check succeeded");
		});
		

	});
});