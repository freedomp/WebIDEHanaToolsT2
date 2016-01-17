define(["STF"], function(STF) {
	"use strict";

	var oLogServerService;
	var ologServerServiceImpl;
	var oLogService;
	var _oMockServer;
	var fLogAInfo;
	var fLogAWarning;
	var fLogAError;
	var fLogADebug;
	var requestBody;
	var numberOfCalls = 0;
	var serverIsCalled = false;
	var sap;
	var sandbox;

	var suiteName = "logserverintegration_test";
	var iFrameWindow = null;
	var sTAG;
	var sINFO;
	var sWARN;
	var sERR;
	var sDBG;

	describe("logserverintegration test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/logserver/config.json"
			}).
				then(function(webIdeWindowObj) {
				iFrameWindow = webIdeWindowObj;
				sap = iFrameWindow.sap;
				oLogService = getService("log");
				oLogServerService = getService("logserver");
				
         		// mock the logger server
	            iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
				_oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "POST",
						path: new iFrameWindow.RegExp(".*/logger.*"),
						response: function (oXhr) {
							serverIsCalled = true;
							requestBody = oXhr.requestBody;
							numberOfCalls++;
						}
					}]
				});
	            _oMockServer.start();
				
				sTAG = "TEST";
				sINFO = "This is a info message";
				sWARN = "This is a warning message";
				sERR = "This is a error message";
				sDBG = "This is a debug message";
				
				fLogAInfo = function(){
					return oLogService.info(sTAG, sINFO);
				};
				
				fLogAWarning = function(){
					return oLogService.warn(sTAG, sWARN);
				};
				
				fLogAError = function(){
					return oLogService.error(sTAG, sERR);
				};
				fLogADebug = function(){
					return oLogService.debug(sTAG, sDBG);
				};
					return STF.getServicePrivateImpl(oLogServerService).then(function(ologServerServiceImplResult) {
    				ologServerServiceImpl = ologServerServiceImplResult;
				});
			});
		});
		
		describe("Integration tests", function() {
			beforeEach(function() {
				numberOfCalls = 0;
				serverIsCalled = false;
			});	
			
			it('server is called once after one error', function() {
				return fLogAInfo().then(function(){
					return fLogAWarning().then(function(){
						return fLogADebug().then(function(){
							return fLogAError().then(function(){
								var requestBodyObj = JSON.parse(requestBody);
								assert.equal(serverIsCalled, true);
								assert.equal(numberOfCalls,1);
								assert.equal(requestBodyObj.messages.length, 4);
								assert.equal(requestBodyObj.messages[0].level, "info");
								assert.equal(requestBodyObj.messages[1].level, "warn");
								assert.equal(requestBodyObj.messages[2].level, "debug");
								assert.equal(requestBodyObj.messages[3].level, "error");
							});	
						});		
					});	
				});
			});
			
			it('server is called twice after 2 errors', function() {
				return fLogAInfo().then(function(){
					return fLogAWarning().then(function(){
						return fLogAError().then(function(){
							return fLogADebug().then(function(){
								return fLogAError().then(function(){
									assert.equal(serverIsCalled, true);
									// After each call to log with "error" level server is called (in this case twice)
									assert.equal(numberOfCalls, 2);
									// check only the last call for the server
									var requestBodyObj = JSON.parse(requestBody);
									assert.equal(requestBodyObj.messages.length, 2);
									assert.equal(requestBodyObj.messages[0].level, "debug");
									assert.equal(requestBodyObj.messages[1].level, "error");
								});	
							});	
						});		
					});	
				});
			});
			describe("server takes long", function() {
				before(function() {
					sandbox = sinon.sandbox.create();
				});	
				it('save to server take long time - logerror + interval after 15sec', function(done) {
					/*
					This test end only when done() is called.we dont return any prommise.
					In case this test fail the error in the ui will be timeout error.but the real reason for the failer is probably failer
					in one of the asserts(from some reason failer in the assert pervent from the done to be called therefore the test is keep running till the timeout).
					In case of failer the recommendation is to debug it to discover the real root cause to the failer.
					*/
					sandbox.stub(ologServerServiceImpl, "_saveLog", function(){
						return Q.delay(3000).then(function(){	
							numberOfCalls++;
							if(numberOfCalls === 1){
								assert.equal(ologServerServiceImpl._aBuffer.length, 1);
								assert.equal(ologServerServiceImpl._aBuffer[0].level, "error");
							}
							else if(numberOfCalls === 2){
							/*	the second call is from the save from the interval - it was wating in the Queue and after the save of the error was done anf the buffer was cleard 
								then the buffer should be empty with length 0.*/
								assert.equal(ologServerServiceImpl._aBuffer.length, 0);
								done();
							}
						});	
					});
					fLogAError().done();
				});
			});
		});
		after(function() {
			STF.shutdownWebIde(suiteName);
			_oMockServer.stop();
			_oMockServer.destroy();
			sandbox.restore();
		});
	});

});