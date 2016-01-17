define(["STF"], function(STF) {
	"use strict";

	var oConsoleService;
	var oLayoutService;
	var oPerspectiveService;
	var oLogService;
	var oCommandService;
	var fSendAInfo;
	var fLogAInfo;
	var fSendAWarning;
	var fLogAWarning;
	var fSendAError;
	var fLogAError;
	var fSendADebug;
	var fLogADebug;

	var suiteName = "console_test";
	var iFrameWindow = null;
	var sap;
	var sTAG;
	var sINFO;
	var sWARN;
	var sERR;
	var sDBG;

	describe("Console test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/console/config.json"
			}).
				then(function(webIdeWindowObj) {
				 
				iFrameWindow = webIdeWindowObj;
				sap = iFrameWindow.sap;
				oConsoleService = getService("console");
				oLayoutService = getService("layout");
				oPerspectiveService = getService("perspective");
				oLogService = getService("log");
				oCommandService = getService("command");
				sTAG = "TEST";
				sINFO = "This is a info message";
				sWARN = "This is a warning message";
				sERR = "This is a error message";
				sDBG = "This is a debug message";

				fSendAInfo = function(){
					return oConsoleService.addMessage({"timestamp": new Date(), "tag": sTAG, "level": "info", "message": sINFO});
				};

				fLogAInfo = function(){
					return oLogService.info(sTAG, sINFO);
				};

				fSendAWarning = function(){
					return oConsoleService.addMessage({"timestamp": new Date(), "tag": sTAG, "level": "warn", "message": sWARN});
				};

				fLogAWarning = function(){
					return oLogService.warn(sTAG, sWARN);
				};

				fSendAError = function(){
					return oConsoleService.addMessage({"timestamp": new Date(), "tag": sTAG, "level": "error", "message": sERR});
				};

				fLogAError = function(){
					return oLogService.error(sTAG, sERR);
				};

				fSendADebug = function(){
					return oConsoleService.addMessage({"timestamp": new Date(), "tag": sTAG, "level": "debug", "message": sDBG});
				};

				fLogADebug = function(){
					return oLogService.debug(sTAG, sDBG);
				};
			});
		});

		describe("Directly add messages and check", function() {
			before(function() {
				return oLayoutService.getLayoutTypes().then(function(oLayoutTypes) {
					return oLayoutService.show(oLayoutTypes.MAIN).then(function(){
						return oPerspectiveService.renderPerspective("development").then(function(){
							return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(){
								return fSendAInfo()
									.then(fSendAWarning)
									.then(fSendAError)
									.then(fSendADebug);
							});
						});
					});
				});
			});
			it('positive find', function() {
					sap.ui.getCore().applyChanges();
					var oConsoleElement = iFrameWindow.$("#Console")[0];
					assert.ok(oConsoleElement.getElementsByClassName("info selectable")[0].innerHTML.indexOf("("+sTAG+") "+sINFO)>-1, "Console message not found");
					assert.ok(oConsoleElement.getElementsByClassName("warn selectable")[0].innerHTML.indexOf("("+sTAG+") "+sWARN)>-1, "Console message not found");
					assert.ok(oConsoleElement.getElementsByClassName("error selectable")[0].innerHTML.indexOf("("+sTAG+") "+sERR)>-1, "Console message not found");
					assert.ok(oConsoleElement.getElementsByClassName("debug selectable")[0].innerHTML.indexOf("("+sTAG+") "+sDBG)>-1, "Console message not found");
			});

			it("clear and negative find", function() {

				return oConsoleService.clear().then(function(){
					return oConsoleService.getContent().then(function(){
						sap.ui.getCore().applyChanges();
						var oConsoleElement = iFrameWindow.$("#Console")[0];
						assert.ok(oConsoleElement.getElementsByClassName("info selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("warn selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("error selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("debug selectable").length===0, "Console message unexpectedly found");
					});
				});

			});
		});

		describe("Write messages by log service and check", function() {
			before(function() {
				return oLayoutService.getLayoutTypes().then(function(oLayoutTypes) {
					return oLayoutService.show(oLayoutTypes.MAIN).then(function(){
						return oPerspectiveService.renderPerspective("development").then(function(){
							return oPerspectiveService.placeServiceAt("center_bottom", "console").then(function(){
								return fLogAInfo()
									.then(fLogAWarning)
									.then(fLogAError)
									.then(fLogADebug);
							});
						});
					});
				});
			});
			
			it('positive find', function() {
					sap.ui.getCore().applyChanges();
					var oConsoleElement = iFrameWindow.$("#Console")[0];
					assert.ok(oConsoleElement.getElementsByClassName("info selectable")[0].innerHTML.indexOf("("+sTAG+") "+sINFO)>-1, "Console message not found");
					assert.ok(oConsoleElement.getElementsByClassName("warn selectable")[0].innerHTML.indexOf("("+sTAG+") "+sWARN)>-1, "Console message not found");
					assert.ok(oConsoleElement.getElementsByClassName("error selectable")[0].innerHTML.indexOf("("+sTAG+") "+sERR)>-1, "Console message not found");
					assert.ok(oConsoleElement.getElementsByClassName("debug selectable")[0].innerHTML.indexOf("("+sTAG+") "+sDBG)>-1, "Console message not found");
			});

			it("clear and negative find", function() {
				return oConsoleService.clear().then(function(){
					return oConsoleService.getContent().then(function(){
						sap.ui.getCore().applyChanges();
						var oConsoleElement = iFrameWindow.$("#Console")[0];
						assert.ok(oConsoleElement.getElementsByClassName("info selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("warn selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("error selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("debug selectable").length===0, "Console message unexpectedly found");
					});
				});
			});
			
			it("clear with command and negative find", function() {
				return oCommandService.getCommand("console.clear").then(function(oCommand) {
					assert.ok(oCommand, "getCommand returns a result");
					return oCommand.execute().then(function(){
						sap.ui.getCore().applyChanges();
						var oConsoleElement = iFrameWindow.$("#Console")[0];
						assert.ok(oConsoleElement.getElementsByClassName("info selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("warn selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("error selectable").length===0, "Console message unexpectedly found");
						assert.ok(oConsoleElement.getElementsByClassName("debug selectable").length===0, "Console message unexpectedly found");
					});
				});
			});
		});
		
		describe("Write over capacity by log service and check", function() {
			before(function() {
				return oLayoutService.getLayoutTypes().then (function(oLayoutTypes) {
					return oLayoutService.show(oLayoutTypes.MAIN).then(function(){
						return oPerspectiveService.renderPerspective("development").then(function(){
							return oCommandService.getCommand("console.toggle").then(function(oCommand){
								return oCommand.execute().then(function(){
								return fLogAInfo()
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo)
								.then(fLogAInfo);
								});
							});
						});
					});
				});
			});
			
			it("capacity check", function() {
				sap.ui.getCore().applyChanges();
				var oConsoleElement = iFrameWindow.$("#Console")[0];
				// Maximum capacity is 4, but in the setup we wrote 10 lines. Check for allowed 4 lines.
				assert.ok(oConsoleElement.getElementsByClassName("info selectable").length==4, "Wrote over capacity");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});

});