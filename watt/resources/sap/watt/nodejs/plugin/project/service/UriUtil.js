define([], function() {
	"use strict";

	var _instance;

	var UriUtil = function() {
		if (!_instance) {
			_instance = this;
		}
		return _instance;
	};

	UriUtil.prototype._getWorkspaceId = function() {
		var that = this;
		var deferred = Q.defer();

		if (!this._workspaceId) {
			var sUri = this._getServiceUriPrefix() + "workspace/all";
			jQuery.ajax({
				url: sUri,
				type: "GET"
			}).done(function(aWorkspaces) {
				if (aWorkspaces && aWorkspaces.length > 0 && aWorkspaces[0].workspaceReference) {
					var oWorkspace = aWorkspaces[0].workspaceReference;
					that._workspaceId = oWorkspace.id;
					deferred.resolve(that._workspaceId);
				} else {
					deferred.reject("No workspaces available");
				}
			}).fail(function(jqXHR, sTextStatus) {
				var sMessage = "Status: " + jqXHR.status + " - " + jqXHR.statusText + ":\n" + jqXHR.responseText;
				deferred.reject(sMessage);
			});
		} else {
			deferred.resolve(that._workspaceId);
		}
		return deferred.promise;
	};

	UriUtil.prototype.createServiceUri = function(sPath) {
		var that = this;
		return this._getWorkspaceId().then(function(sWorkspaceId) {
			sPath = jQuery.sap.startsWith(sPath, "/") ? sPath.substr(1) : sPath;
			sPath = sPath.replace("{{workspaceId}}", sWorkspaceId);
			return that._getServiceUriPrefix() + sPath;
		}, function() {
			return sPath;
		});
	};

	UriUtil.prototype._getServiceUriPrefix = function() {
		if (!this._serviceUriPrefix) {
			this._serviceUriPrefix = sap.watt.getEnv("che_server") || "/che/";
		}
		return this._serviceUriPrefix;
	};

	return UriUtil;
});