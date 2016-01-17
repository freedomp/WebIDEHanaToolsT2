define(["STF"], function(STF) {
	"use strict";

	var oLogServerService;
	var ologServerServiceImpl;
	var _oMockServer;
	var requestBody;
	var serverIsCalled = false;

	var suiteName = "logserver_test";
	var iFrameWindow = null;

	describe("logserver test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/logserver/config.json"
			}).
				then(function(webIdeWindowObj) {
				iFrameWindow = webIdeWindowObj;
				oLogServerService = getService("logserver");
				
        		// mock the logger server
	            iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
	           _oMockServer = new iFrameWindow.sap.ui.app.MockServer();
	            
	            _oMockServer.setRequests([{method:"POST",path:"/logger",response:  function(oXhr) {
                    serverIsCalled= true;
                	requestBody = oXhr.requestBody;
                }}]);
	            _oMockServer.start();
				
				return STF.getServicePrivateImpl(oLogServerService).then(function(ologServerServiceImplResult) {
        			ologServerServiceImpl = ologServerServiceImplResult;
				});
			});
		});

		describe("Calculation methods test", function() {
			var nodeWarn;
			var nodeError;
			var nodeInfo;
			before(function() {
				 nodeWarn = {
					timestamp : Date.now(),
					tag : "logConsumer1",
					message : "log server node 1",
					level : "warn"
				};
				 nodeError = {
					timestamp : Date.now(),
					tag : "logConsumer2",
					message : "log server node 2",
					level : "error"
			};
				nodeInfo = {
					timestamp : Date.now(),
					tag : "logConsumer3",
					message : "log server node 3",
					level : "info"
				};
			});
			beforeEach(function(){
				/*Ensure the _currentBufferSize is init to 0.When WebIde is started it write to the log.
				_currentBufferSize is changes so we need to clear  it before the test.*/
				ologServerServiceImpl._currentBufferSize = 0;
				ologServerServiceImpl._aBuffer = [];
				serverIsCalled = false;
			});
			
			it('calculate Node Size', function() {
				var nodeSize = ologServerServiceImpl._calculateNodeSize(nodeWarn)
				assert.equal(nodeSize,46);	
			});
			
			it('is buffer in max range', function() {
				return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
					return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
						return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
							var isBufferInMaxRange = ologServerServiceImpl._isBufferInMaxRange();
								assert.isTrue(isBufferInMaxRange);	
						});
					});
				});
			});
			
			it('is buffer in optimal range - positive', function() {
				return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
					return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
						return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
							var isBufferInOptimalRange = ologServerServiceImpl._isBufferInOptimalRange();
								assert.isTrue(isBufferInOptimalRange);	
						});
					});
				});
			});
			
			describe("optimal range limits - negative test ", function() {
				beforeEach(function() {
					ologServerServiceImpl._currentBufferSize = 50001;
				});	
				it('is buffer in optimal range - negative', function() {
					var isBufferInOptimalRange = ologServerServiceImpl._isBufferInOptimalRange();
					assert.isFalse(isBufferInOptimalRange);
				});
			});
			
			describe("maximal range limits - negative test ", function() {
				beforeEach(function() {
					ologServerServiceImpl._currentBufferSize = 10485761;
				});	
				it('is buffer in max range - negative', function() {
						var isBufferInMaxRange = ologServerServiceImpl._isBufferInMaxRange();
						assert.isFalse(isBufferInMaxRange);
				});
			});
			
				it('add to buffer', function() {
					return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
						return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
							return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
									assert.equal(ologServerServiceImpl._currentBufferSize, 139);
									assert.equal(ologServerServiceImpl._aBuffer.length, 3);
							});
						});
					});
				});
				
				it('override Oldest Massge In Buffer - buffer is reduced', function() {
					return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
						return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
							return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
								return ologServerServiceImpl._overrideOldestMassgeInBuffer(nodeWarn).then(function(){
									assert.equal(ologServerServiceImpl._currentBufferSize, 138);
									assert.equal(ologServerServiceImpl._aBuffer.length, 3);	
								});
							});
						});
					});
				});
				
				it('override Oldest Massge In Buffer - buffer is increased', function() {
					return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
						return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
							return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
								return ologServerServiceImpl._overrideOldestMassgeInBuffer(nodeError).then(function(){
									assert.equal(ologServerServiceImpl._currentBufferSize, 140);
									assert.equal(ologServerServiceImpl._aBuffer.length, 3);	
								});
							});
						});
					});
				});
				
				describe("Interaction with the server", function() {
					beforeEach(function() {
						ologServerServiceImpl._aBuffer = [nodeInfo];
						serverIsCalled = false;
					});	
					it('validation And Saving', function() {
						//var result;
						return ologServerServiceImpl._validationAndSaving(nodeWarn).then(function(result){
							assert.equal(result, undefined, "undefined means saving wasn't perform as expected");
								return ologServerServiceImpl._validationAndSaving(nodeError).then(function(){
									assert.equal(serverIsCalled, true);
								});
						});
					});	
					
					it('save and clear', function() {
						return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
							return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
								return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
								return ologServerServiceImpl._saveAndClear().then(function(){
										var requestBodyObj = JSON.parse(requestBody);
										assert.equal(requestBodyObj.messages.length, 4);	
										assert.equal(serverIsCalled, true);	
									});
								});
							});
						});
					});
				
					it('save log', function() {
						return ologServerServiceImpl._addToBuffer(nodeWarn).then(function(){
							return ologServerServiceImpl._addToBuffer(nodeError).then(function(){
								return ologServerServiceImpl._addToBuffer(nodeInfo).then(function(){
									return ologServerServiceImpl._saveLog().then(function(){
										var requestBodyObj = JSON.parse(requestBody);
										assert.equal(requestBodyObj.messages.length, 4);	
										assert.equal(serverIsCalled, true);	
									});
								});
							});
						});
					});
				});

		});	

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});

});