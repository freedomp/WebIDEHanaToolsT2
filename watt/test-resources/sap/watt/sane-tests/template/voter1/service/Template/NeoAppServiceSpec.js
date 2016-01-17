define(["sap/watt/lib/lodash/lodash",
	"STF"] , function(_, STF) {

	"use strict";

	var suiteName = "NeoApp_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oFileService, oNeoappService;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function () {
				oFakeFileDAO = getService('fakeFileDAO');
				oFileService = getService('filesystem.documentProvider');
				oNeoappService = getService('neoapp');

			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Test addDestination to empty neoapp", function(){
			var oFileStructure = {
				"test" : {}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/test").then(function(oTargetDocument){
					return oNeoappService.addDestination("/sap/opu/odata", { type : "destination", name : "test_abap_odata"},"Test OData",oTargetDocument, true).then(function(){

						return oFileService.getDocument("/test/neo-app.json").then(function(oNeoApp){
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent){
									var oNeoapp = JSON.parse(sContent);
									if (oNeoapp) {
										assert.ok(oNeoapp.welcomeFile === "index.html", "WelcomeFile created ok");
										assert.ok(oNeoapp.routes.length === 1, "Add one destination ok");
									}
								});
							}
						});
					});
				});
			});
		});

		it("Test addDestination with override", function(){
			var oFileStructure = {
				"test" : {}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/test").then(function(oTargetDocument){
					return oNeoappService.addDestination("/sap/opu/odata", { type : "destination", name : "test_abap_odata"},"Test2 OData",oTargetDocument, true).then(function(){

						return oFileService.getDocument("/test/neo-app.json").then(function(oNeoApp){
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent) {
									var oNeoapp = JSON.parse(sContent);
									if (oNeoapp) {
										assert.ok(oNeoapp.routes.length === 1, "Add one destination ok");
										assert.ok(oNeoapp.routes[0].description === "Test2 OData", "Overriden destination ok");
									}
								});
							}
						});
					});
				});
			});
		});

		it("Test addDestination no override", function(){
			var oFileStructure = {
				"test33" : {}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/test33").then(function(oTargetDocument){
					return oNeoappService.addDestination("/sap/opu/odata", { type : "destination", name : "test33_abap_odata"},"Test2 OData",oTargetDocument, false).then(function(){

						return oFileService.getDocument("/test33/neo-app.json").then(function(oNeoApp){
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent) {
									var oNeoapp = JSON.parse(sContent);
									if (oNeoapp) {
										assert.ok(oNeoapp.routes.length === 1, "Add one destination ok");
									}
								});
							}
						});
					});
				});
			});
		});

		it("Test addDestinations", function(){
			var oFileStructure = {
				"test2" : {}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/test2").then(function(oTargetDocument){
					var aDestinations = [];
					aDestinations.push({
						"path" : "/src/main/webapp/resources",
						"target" : {
							"type" : "destination",
							"name" : "ui5dist"
						},
						"description" : " SAPUI5 Resources"
					});

					aDestinations.push({
						"path" : "/src/main/webapp/test-resources",
						"target" : {
							"type" : "destination",
							"name" : "ui5dist-test-resources"
						},
						"description" : " SAPUI5 Test Resources"
					});
					return oNeoappService.addDestinations(aDestinations,oTargetDocument).then(function(){

						return oFileService.getDocument("/test2/neo-app.json").then(function(oNeoApp){
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent) {
									var oNeoapp = JSON.parse(sContent);
									if (oNeoapp) {
										assert.ok(oNeoapp.welcomeFile === "index.html", "WelcomeFile created ok");
										assert.ok(oNeoapp.routes.length === 4, "Add two destinations ok");
									}
								});
							}
						});
					});
				});
			});
		});

		it("Test addNeoapp", function(){
			var oFileStructure = {
				"test3" : {}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/test3").then(function(oTargetDocument){
					var aDestinations = [];
					aDestinations.push({
						"path" : "/src/main/webapp/resources",
						"target" : {
							"type" : "destination",
							"name" : "ui5dist"
						},
						"description" : " SAPUI5 Resources"
					});

					aDestinations.push({
						"path" : "/src/main/webapp/test-resources",
						"target" : {
							"type" : "destination",
							"name" : "ui5dist-test-resources"
						},
						"description" : " SAPUI5 Test Resources"
					});
					var oNeoapp = {
						welcomeFile : "test.html",
						sendWelcomeFileRedirect: true,
						authenticationMethod : "none",
						destinations : aDestinations
					};
					return oNeoappService.addNeoapp(oNeoapp,oTargetDocument).then(function(){

						return oFileService.getDocument("/test3/neo-app.json").then(function(oNeoApp){
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent) {
									var oNeoappContent = JSON.parse(sContent);
									if (oNeoappContent) {
										assert.ok(oNeoappContent.welcomeFile === "test.html", "WelcomeFile created ok");
										assert.ok(oNeoappContent.sendWelcomeFileRedirect === true, "sendWelcomeFileRedirect created ok");
										assert.ok(oNeoappContent.authenticationMethod === "none", "authenticationMethod created ok");
										assert.ok(oNeoappContent.routes.length === 4, "Add two destinations ok");
									}
								});
							}
						});
					});
				});
			});
		});

		it("Test addCacheControls - no override", function(){
			var oFileStructure = {
				"testCacheControl1" : {}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/testCacheControl1").then(function(oTargetDocument) {
					var aCacheControls = [];
					var oCacheControl = {
						"path": "*html",
						"directive": "private",
						"maxAge": 0
					};
					aCacheControls.push(oCacheControl);

					oCacheControl = {
						"directive": "public",
						"maxAge": 31536000
					};
					aCacheControls.push(oCacheControl);

					return oNeoappService.addCacheControls(aCacheControls, oTargetDocument, false).then(function() {
						return oFileService.getDocument("/testCacheControl1/neo-app.json").then(function(oNeoApp) {
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent) {
									var oNeoapp = JSON.parse(sContent);
									if (oNeoapp) {
										assert.ok(oNeoapp.cacheControl.length === 2, "Two blocks created");
									}
								});
							}
						});
					});
				});
			});
		});

		it("Test addCacheControls - override", function() {

			var neoAppDoc = {
				"cacheControl": [
					{
						"directive": "public",
						"maxAge": 100,
						"path": "*js"
					},
					{
						"directive": "private",
						"maxAge": 31536000
					}
				]
			};

			neoAppDoc = JSON.stringify(neoAppDoc);

			var oFileStructure = {
				"testCacheControl2" : {
					"neo-app.json" : neoAppDoc
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/testCacheControl2").then(function(oTargetDocument) {
					var aCacheControls = [];
					var oCacheControl = {
						"path": "*.html",
						"directive": "private",
						"maxAge": 0
					};
					aCacheControls.push(oCacheControl);

					oCacheControl = {
						"directive": "public",
						"maxAge": 31536000
					};
					aCacheControls.push(oCacheControl);

					return oNeoappService.addCacheControls(aCacheControls, oTargetDocument, true).then(function() {
						return oFileService.getDocument("/testCacheControl2/neo-app.json").then(function(oNeoApp) {
							if (oNeoApp) {
								return oNeoApp.getContent().then(function(sContent) {
									var oNeoapp = JSON.parse(sContent);
									if (oNeoapp) {
										assert.ok(oNeoapp.cacheControl.length === 2, "Two blocks created");
										assert.ok(oNeoapp.cacheControl[0].directive === "private", "directive in first block was overriden");
										assert.ok(oNeoapp.cacheControl[0].path === "*.html", "path was overriden");
										assert.ok(oNeoapp.cacheControl[1].directive === "public", "directive in second block was overriden");
									}
								});
							}
						});
					});
				});
			});
		});






	});
});
