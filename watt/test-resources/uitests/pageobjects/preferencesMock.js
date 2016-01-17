sap.ui.define([], function() {
	"use strict";

	var _oMockServer;

	function getNodeFromXHR(xhr) {
		var iOffset = xhr.url.indexOf("prefs/user/watt");
		return xhr.url.substr(iOffset + "prefs/user/watt".length + 1);
	}
	var _oMockedNodes = {},
		_oChangedNodes = {},

		// this is the inital request which gets all user settings - not via individal nodes
		aRequests = [
			{
				method: "GET",
				path: _buildURL(),
				response: function(xhr) {
					var sNode = getNodeFromXHR(xhr);
					
					var mResult;
					if (sNode) {
						mResult = _oMockedNodes[sNode];
					} else {
						mResult = _getAllPrefs();
					}

					xhr.respond(200, {
						"Content-Type": "application/json;charset=UTF-8"
					}, JSON.stringify(mResult));
				}
			},

			{
				method: "PUT",
				path: _buildURL(),
				response: function(xhr) {
					var sNode = getNodeFromXHR(xhr);
					if (!sNode) {
						throw new Error("Can't put here!");
					}
					if (_oMockedNodes.hasOwnProperty(sNode)) {
						_oMockedNodes[sNode] = JSON.parse(xhr.requestBody);
						_oChangedNodes[sNode] = true;
					}
					xhr.respond(204);
				}
			}
		];
	
	// there is currently in our used sinon.js version when the replacement of the server is done
	// so we put it once with the 'normal' and once with the absolute URL
	aRequests.forEach(function(mEntry) {
		aRequests.push({
			method: mEntry.method,
			path: (new URI(mEntry.path).absoluteTo(document.baseURI).query("").toString()),
			response: mEntry.response
		});
	});


	function getNode(sNode) {

		return _oMockedNodes[sNode];
	}

	function _getAllPrefs() {

		var mResult = {};
		for (var sNode in _oMockedNodes) {
			var mContent = _oMockedNodes[sNode];
			if (mContent) {
				for (var key in mContent) {
					mResult[sNode + "/" + key] = mContent[key];
				}
			}
		}
		return mResult;
	}

	function handleNode(sNode, oInitialState) {
		_oMockedNodes[sNode] = oInitialState;
	}

	function _buildURL() {
		return sap.watt.getEnv("orion_server") + "prefs/user/watt(.*)";
	}

	function installMockServerIntoWindow(oWindow) {

		oWindow.jQuery.sap.require("sap.ui.core.util.MockServer");
		_oMockServer = new oWindow.sap.ui.core.util.MockServer();
		_oMockServer.setRequests(aRequests);
		_oMockServer.start();
	}

	function resetNodeChanged(sNode) {

		delete _oChangedNodes[sNode];
	}

	function isNodeChanged(sNode) {
		
		return !!_oChangedNodes[sNode];
	}

	return {
		getNode: getNode,
		handleNode: handleNode,
		installMockServerIntoWindow: installMockServerIntoWindow,
		isNodeChanged: isNodeChanged,
		resetNodeChanged: resetNodeChanged
	};
});