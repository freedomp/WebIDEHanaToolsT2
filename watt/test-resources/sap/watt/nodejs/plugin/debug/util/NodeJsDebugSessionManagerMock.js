define([ //
  "./NodeJsDebugSessionMock",
  "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsDebugModelResolver"
], function(NodeJsDebugSessionMock, NodeJsDebugModelResolver) {
  "use strict";

  var NodeJsDebugSessionManagerMock = function NodeJsDebugSessionManagerMock(_logger, mockData) {
    this.data = {
      connected: mockData ? mockData.connected : false,
      debugSessions: mockData ? mockData.debugSessions : []
    };

    this.model = new sap.ui.model.json.JSONModel(this.data);
    this.events = [];
    this.eventListeners = [];
    var _modelResolver = new NodeJsDebugModelResolver(_logger, this.model);

    this.setModelProperty = function setModelProperty(sessionId, path, value) {
      return this.model.setProperty("/debugSessions/" + 0 + "/" + path, value);
    };

    this.getModelProperty = function getModelProperty(sessionId, path) {
      return this.model.getProperty("/debugSessions/" + 0 + "/" + path);
    };

    this.setModelPropertyByUri = function setModelPropertyByUri(uri, value) {
      var path = _modelResolver.convertUriToModelPath(uri);
      if (path) {
        this.model.setProperty(path, value);
      } else {
        throw new Error("The referenced property [" + uri + "] does not exist in the model.");
      }
    };

    this.getModelResolver = function getModelResolver() {
      return _modelResolver;
    };

    this.getJsonModel = function getJsonModel() {
      return this.model;
    };

    this.fireEvent = function fireEvent(eventId, params) {
      this.events.push({
        id: eventId,
        params: params
      });
    };

    this.isConnected = function isConnected() {
      return this.data.connected;
    };

    this.connect = function connect() {
      this.model.setProperty("/connected", true);
      return Q.resolve();
    };

    this.disconnect = function disconnect() {
      this.model.setProperty("/connected", false);
      return Q.resolve();
    };

    this.connectDebugSession = function connectDebugSession(debugSessionDefinition) {
      if (!debugSessionDefinition) {
        throw "Illegal debug session definition";
      }
      var debugSession = new NodeJsDebugSessionMock();
      this.data.debugSessions.push(debugSession);
      this.fireEvent("connected", {
        debugSession: debugSession
      });
      return Q.resolve(debugSession);
    };

    this.addSuspendResumeListener = function addSuspendResumeListener(listener, context) {
      this.eventListeners.push({
        id: "suspendedResumed",
        context: context,
        listener: listener
      });
    };

    this.addConnectDisconnectListener = function addConnectDisconnectListener(listener, context) {
      this.eventListeners.push({
        id: "connectedDisconnected",
        context: context,
        listener: listener
      });
    };

    this.validateEvent = function validateEvent(eventId, params) {
      var stringExpectedParams = JSON.stringify(params);
      for (var i = 0; i < this.events.length; i++) {
        if (this.events[i].id === eventId && JSON.stringify(this.events[i].params) === stringExpectedParams) {
          return true;
        }
      }
      return false;
    };
  };

  return NodeJsDebugSessionManagerMock;
});
