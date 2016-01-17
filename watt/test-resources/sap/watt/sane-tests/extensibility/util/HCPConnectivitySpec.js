"use strict";
define(['STF'], function (STF) {
	var suiteName = "HCPConnectivity_Service";

	describe('HCPConnectivity Service', function () {

		var oHCPConnectivityService;
		var oMockServer;
		var iFrameWindow;
		var oContext;

		before(function () {
			var loadWebIdePromise = STF.startWebIde(suiteName);
			buildMockContext();
			return loadWebIdePromise.then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				// get service
				oHCPConnectivityService = STF.getService(suiteName, "hcpconnectivity");

				var Subsjson = '[{"name":"testUI5","providerName":"danyui5","providerAccount":"i068392sapdev","status":"STOPPED","url":"https://danyui5-watt.dispatcher.neo.ondemand.com"},{"name":"fiorilaunchpad","providerName":"fiorilaunchpad","providerAccount":"sapflp3","activeVersion":"2015-01-21_15-32-52","startedVersion":"2015-01-21_15-32-52","status":"STARTED","url":"https://fiorilaunchpad-watt.dispatcher.neo.ondemand.com"},{"name":"parentneoapp","providerName":"parentneoapp","providerAccount":"fiori","activeVersion":"1.0.4","startedVersion":"1.0.4","status":"STARTED","url":"https://parentneoapp-watt.dispatcher.neo.ondemand.com"},{"name":"rde","providerName":"rde","providerAccount":"rde","activeVersion":"deprecated","startedVersion":"deprecated","status":"STARTED","url":"https://rde-watt.dispatcher.neo.ondemand.com"},{"name":"rdeplugins","providerName":"rdeplugins","providerAccount":"rde","activeVersion":"1.0.0-20140928.141657-107","startedVersion":"1.0.0-20140928.141657-107","status":"STARTED","url":"https://rdeplugins-watt.dispatcher.neo.ondemand.com"},{"name":"sapui5preview","providerName":"sapui5preview","providerAccount":"sapui5","activeVersion":"1.26.2","startedVersion":"1.26.2","status":"STARTED","url":"https://sapui5preview-watt.dispatcher.neo.ondemand.com"},{"name":"webide","providerName":"webide","providerAccount":"sapwebide","activeVersion":"1.7.0_0","startedVersion":"1.7.0_0","status":"STARTED","url":"https://webide-watt.dispatcher.neo.ondemand.com"}]';
				var	Appsjson =  '[{"name":"aaa","activeVersion":"3.0","startedVersion":"3.0","startedCommit":"896f2f22700ea7c418a020657f882dbe794814e7","status":"STARTED","repository":"https://git.neo.ondemand.com/watt/aaa","url":"https://aaa-watt.dispatcher.neo.ondemand.com"},{"name":"cei","activeVersion":"1.6.0","startedVersion":"1.6.0","startedCommit":"22349dbfe9934206c69474ecc924806b3d4e856b","status":"STARTED","repository":"https://git.neo.ondemand.com/watt/watt","url":"https://cei-watt.dispatcher.neo.ondemand.com"}]';
				var Accountsjson = '[{"name":"watt","displayName":"watt"},{"name":"watttest","displayName":"watttest"},{"name":"x2a4336b4","displayName":"Santiago Team - Dev"},{"name":"x4d5fb65a","displayName":"x4d5fb65a"},{"name":"x8aceab68","displayName":"Santiago Team - Fiori Trial"},{"name":"xcb16e90b","displayName":"Testing center"}]';
				var Responsjson = '{"res":"OK"}';

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						path: new iFrameWindow.RegExp(".*subscriptions.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/json"
								}, Subsjson);
							}
						},{
						method: "GET",
						path: new iFrameWindow.RegExp(".*accountlist.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/json"
								}, Accountsjson);
							}
						},{
							method: "GET",
							path: new iFrameWindow.RegExp(".*applications.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, Appsjson);
							}
						},{
							method: "GET",
							path: new iFrameWindow.RegExp(".*commits.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, Appsjson);
							}
						},{
							method: "POST",
							path: new iFrameWindow.RegExp(".*action.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, Responsjson);
							}
						}]
				});

				oMockServer.start();
			});
		});
		
		function buildMockContext() {
			oContext = {};
			oContext.service = {};
			oContext.service.git = {};
			oContext.service.git.getRemotes = function() {
				var oRemotes = {
					"Children": [{
						"CloneLocation": "/s2s/gitapi/clone/file/x2a4336b4$I058938-OrionContent/sdsomon/",
						"GitUrl": "https://git.neo.ondemand.com/watt/sds",
						"IsGerrit": false,
						"Location": "/s2s/gitapi/remote/origin/file/x2a4336b4$I058938-OrionContent/sdsomon/",
						"Name": "origin",
						"Type": "Remote"
					}],
					"Type": "Remote"
				};

				return Q(oRemotes);
			};
			
			oContext.service.system = {};
			oContext.service.system.getSystemInfo = function() {
				var oResult = {};
				oResult.sAccount = "watttest";
				return Q(oResult);
			};
		}
		
		it("getHCPAccounts", function () {
			return oHCPConnectivityService.getHCPAccounts("account","user","pass").then(function(oResult) {
				assert.equal(oResult.length, 6);
			});
		});

		it("getSubscriptions", function () {
			return oHCPConnectivityService.getSubscriptions("user","pass",true).then(function(oResult) {
				assert.equal(oResult.length, 7);
			});
		});

		it("getApps", function () {
			return oHCPConnectivityService.getApps("user","pass",true).then(function(oResult) {
				assert.equal(oResult.length, 2);
			});
		});

		it("getAppInfo", function () {
			return oHCPConnectivityService.getAppInfo("user","pass","aaa").then(function(oResult) {
				assert.equal(oResult.length, 2);
			});
		});

		it("getAppCommits", function () {
			return oHCPConnectivityService.getAppCommits("user","pass","aaa").then(function(oResult) {
				assert.equal(oResult.length, 2);
			});
		});

		it("getAppVersions", function () {
			return oHCPConnectivityService.getAppVersions("user","pass","aaa").then(function(oResult) {
				assert.equal(oResult.length, 2);
			});
		});

		it("activateApp", function () {
			return oHCPConnectivityService.activateApp("user","pass","aaa" , "1").then(function(oResult) {
				assert.equal(oResult.res, "OK");
			});
		});

		it("startApp", function () {
			return oHCPConnectivityService.startApp("user","pass","aaa").then(function(oResult) {
				assert.equal(oResult.res, "OK");
			});
		});

		it("restartApp", function () {
			return oHCPConnectivityService.restartApp("user","pass","aaa").then(function(oResult) {
				assert.equal(oResult.res, "OK");
			});
		});
		
		it("get HCP Account By Git URL", function () {
			oHCPConnectivityService.setContext(oContext);
			return oHCPConnectivityService.getHCPAccountByGitURL("oGit").then(function(sAccount) {
				assert.equal(sAccount, "watt");
			});
		});
		
		it("get HCP Default Account", function () {
			oHCPConnectivityService.setContext(oContext);
			return oHCPConnectivityService.getHCPDefaultAccount().then(function(sAccount) {
				assert.equal(sAccount, "watttest");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});
	});
});