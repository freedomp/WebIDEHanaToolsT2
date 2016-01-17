define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "SmartDocProvider_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oSmartDocProviderService, oMockServer, iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {
					iFrameWindow = oWindow;
					oSmartDocProviderService = getService('smartDocProvider');

					// prepare mock server
					iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
					oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
						requests: [{
							method: "GET",
							path: new iFrameWindow.RegExp(".+\\model.json$"),
							response: function(oXhr) {
								var model = {
									"myRoot2" : {
										"parameters" : {
											"ApplicationTypesCollection" :
											{
												"type" : "Entity",
												"multiplicity" : "many",
												"isRoot" : true,
												"value" : {
													"name": "Desktop",
													"value": "Desktop"
												},
												"wizard" :
												{
													"control" : "ComboBox",
													"required" : true,
													"title" : "basicSAPUI5ApplicationProject_application_type_title",
													"tooltip" : "basicSAPUI5ApplicationProject_application_type_title"
												}
											}
										}
									}
								};
								if (oXhr.url.indexOf("myplugin") > -1) {
									model = {
										"Import" : ["ui5template.basicSAPUI5ApplicationComponent"],
										"myRoot" : {
											"parameters" : {
												"ApplicationTypesCollection" :
												{
													"type" : "Entity",
													"multiplicity" : "many",
													"isRoot" : true,
													"value" : {
														"name": "Desktop",
														"value": "Desktop"
													},
													"wizard" :
													{
														"control" : "ComboBox",
														"required" : true,
														"title" : "basicSAPUI5ApplicationProject_application_type_title",
														"tooltip" : "basicSAPUI5ApplicationProject_application_type_title"
													}
												}
											}
										}
									};
								}

								var sContent = JSON.stringify(model);
								oXhr.respond(200, {
									"Content-Type": "application/xml;charset=utf-8"
								}, sContent);
							}
						}]
					});
					oMockServer.start();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});

		it("Test create smartDoc", function(){
			return oSmartDocProviderService.createSmartDoc("myplugin/mytemplate","model.json").then(function(oSmartDoc){
				assert.ok(oSmartDoc !== undefined, "success to create a smartdoc.");
				assert.ok(oSmartDoc.myRoot2.parameters.ApplicationTypesCollection.type === "Entity",
					"success to create a smartdoc content with import.");
			});
		});

		it("Test get smartDoc by template", function(){
			var oTemplate = {
				getTemplateClass : function(){
					return {
						getProxyMetadata : function(){
							return {
								getName : function() {
									return "myplugin/mytemplate";
								}
							};
						}
					};
				},
				getModelFileName : function(){
					return "model.json";
				},
				getId : function() {
					return "myid1";
				},
				getPath : function() {
					return "";
				}
			};
			return oSmartDocProviderService.getSmartDocByTemplate(oTemplate).then(function(oSmartDoc){
				assert.ok(oSmartDoc !== undefined, "success to get a smartdoc.");
				assert.ok(oSmartDoc.myRoot2.parameters.ApplicationTypesCollection.type === "Entity", "success to create a smartdoc content with import.");
				return oSmartDocProviderService.getSmartDocByTemplate(oTemplate).then(function(oSmartDoc2){
					assert.ok(oSmartDoc2 !== undefined, "success to get a smartdoc2.");
					assert.ok(oSmartDoc2.id === oSmartDoc.id, "success to get cached smartdoc.");
				});
			});
		});

		it("Test invalidate cached smart doc", function(){
			var oTemplate = {
				getTemplateClass : function(){
					return {
						getProxyMetadata : function(){
							return {
								getName : function() {
									return "myplugin/mytemplate";
								}
							};
						}
					};
				},
				getModelFileName : function(){
					return "model.json";
				},
				getId : function() {
					return "myid1";
				},
				getPath : function() {
					return "";
				}
			};
			return oSmartDocProviderService.getSmartDocByTemplate(oTemplate).then(function(oSmartDoc){
				assert.ok(oSmartDoc !== undefined, "success to get a smartdoc.");
				assert.ok(oSmartDoc.myRoot2.parameters.ApplicationTypesCollection.type === "Entity", "success to create a smartdoc content with import.");
				return oSmartDocProviderService.invalidateCachedSmartDoc().then(function(){
					return oSmartDocProviderService.getSmartDocByTemplate(oTemplate).then(function(oSmartDoc2){
						assert.ok(oSmartDoc2 !== undefined, "success to get a smartdoc2.");
						assert.ok(oSmartDoc2.id !== oSmartDoc.id, "success invalidating cached smart doc.");
					});
				});

			});
		});
	});
});
