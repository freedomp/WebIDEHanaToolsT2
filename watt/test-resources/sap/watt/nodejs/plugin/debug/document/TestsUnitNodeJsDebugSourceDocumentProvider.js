define([ //
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsBreakpointManager",
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/document/NodeJsDebugSourceDocumentProvider",
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsDebugSession",
    "../util/MessageChannelMock",
    "../util/LoggerMock",
    "../util/NodeJsDebugSessionManagerMock"], function(
   		NodeJsBreakpointManager, NodeJsDebugSourceDocumentProvider, NodeJsDebugSession, MessageChannelMock, LoggerMock, NodeJsDebugSessionManagerMock) {

	"use strict";

	var SCRIPT_CONTENT_1 = "function helloworld() { console.log('The most primitive hello world of the world');};";

	var _messageBus;
	var _debugSessionManager;

	// console logger
	var _logger = new LoggerMock();

	// MessageBus mock
	var MessageBusMock = function MessageBusMock() {
		this.channels = [];

		this.newChannel = function newChannel(channelName, onMessageCallback) {
			var channel = new MessageChannelMock(channelName, onMessageCallback);
			this.channels.push(channel);
			return Q.resolve(channel);
		};
	};

	module("NodeJsDebugSourceDocumentProvider", {
		setup: function() {
			_messageBus = new MessageBusMock();
			_debugSessionManager = new NodeJsDebugSessionManagerMock(_logger);
		},

		teardown: function() {
			_logger.log.errorExpected = false;
		}
	});

	var _createDebugSession = function _createDebugSession(assert, sessionChannel, sessionId, sessionDefinition) {
		var debugSession = new NodeJsDebugSession(_logger, _messageBus, _debugSessionManager, new NodeJsBreakpointManager(), sessionChannel,
			sessionId, sessionDefinition);
		_debugSessionManager.data.debugSessions.push(debugSession);

		return debugSession.connect().then(function() {
			assert.equal(_messageBus.channels.length, 1, "There must be at least one message bus channel after debugSession.connect()");
			assert.equal(_messageBus.channels[0].subscribed, true,
				"MessageBus.subscribeToChannel must have been called by debugSession.connect()");
			assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "connected"), true,
				"Debug session must be in connected state after debugSession.connect()");

			// reset cached posts
			_messageBus.channels[0].posts.length = 0;
			return Q.resolve(debugSession);
		});
	};

	test("document provider content", window.withPromise(function(assert) {

		return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {

			var requestCount = 0;

			var channel = _messageBus.channels[0];

			channel.onPostDataPrepareHandler = function(postData) {
				if (postData.payload && (postData.payload.params.scriptId === 1) && postData.payload.method === "Debugger.getScriptSource") {
					postData.message = {
							id: postData.message.id,
	    	    			method: "Debugger.getScriptSource",
		    	    		result: {
			    		    	scriptSource: SCRIPT_CONTENT_1
					    	}
	    				};
					requestCount++;
				}
			};

			var documentProvider = new NodeJsDebugSourceDocumentProvider(debugSession);

			var sourceCodeDocument = documentProvider.getDocumentByKey({ id: 1, url:MessageChannelMock.URL_1});

			sourceCodeDocument.getContent().done();

			return sourceCodeDocument.getContent().then(function(sourceCode) {
				assert.equal(sourceCode, SCRIPT_CONTENT_1);
				assert.equal(requestCount, 1);
			});
		});
	}));

	test("document provider entity", window.withPromise(function(assert) {

		return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {

			var channel = _messageBus.channels[0];

			channel.onPostDataPrepareHandler = function(postData) {
				if (postData.payload && (postData.payload.params.scriptId === 1) && postData.payload.method === "Debugger.getScriptSource") {
					postData.message = {
							id: postData.message.id,
	    	    			method: "Debugger.getScriptSource",
		    	    		result: {
			    		    	scriptSource: SCRIPT_CONTENT_1
					    	}
	    				};
				}
			};

			var documentProvider = new NodeJsDebugSourceDocumentProvider(debugSession);

			var sourceCodeDocument = documentProvider.getDocumentByKey({ id: 1, url: MessageChannelMock.URL_1});

			var name = sourceCodeDocument.getTitle();

			var entity = sourceCodeDocument.getEntity();

			var path = entity.getFullPath();

			assert.equal(path, MessageChannelMock.URL_1);

			assert.equal(entity.isFolder(), false);
			assert.equal(entity.isFile(), true);

			assert.equal(name, _getFileName(MessageChannelMock.URL_1));
		});
	}));

	test("document provider entity using key string", window.withPromise(function(assert) {

		return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {

			var channel = _messageBus.channels[0];
			//prepare the post response for 'Debugger.setBreakpointByUrl'
			channel.onPostDataPrepareHandler = function(postData) {
				if (postData.payload && (postData.payload.params.scriptId === 1) && postData.payload.method === "Debugger.getScriptSource") {
					postData.message = {
							id: postData.message.id,
	    	    			method: "Debugger.getScriptSource",
		    	    		result: {
			    		    	scriptSource: SCRIPT_CONTENT_1
					    	}
	    				};
				}
			};

			var documentProvider = new NodeJsDebugSourceDocumentProvider(debugSession);

			var sourceCodeDocument = documentProvider.getDocumentByKeyString(JSON.stringify({ id: 1, url: MessageChannelMock.URL_1}));

			var name = sourceCodeDocument.getTitle();

			var entity = sourceCodeDocument.getEntity();

			var path = entity.getFullPath();

			assert.equal(path, MessageChannelMock.URL_1);

			assert.equal(entity.isFolder(), false);
			assert.equal(entity.isFile(), true);

			assert.equal(name, _getFileName(MessageChannelMock.URL_1));
		});
	}));

	function _getFileName(filePath) {
		return filePath.split("/").pop();
	}

});
