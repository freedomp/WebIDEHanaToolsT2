/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define, XMLHttpRequest*/
define(function(require) {
	"use strict";

	var Util = require("./Util"),
		Cache = require("./MetadataCache"),
		cachedAccessObj = {},
		consoleLog = Util.makeLog("sqlparser.CatalogAccess");

	function CatalogAccess(url, useHttpPost) {
		this.metadataCallback = null;
		this.metadataUrl = url;
		this.cache = new Cache();
		this.useHttpPost = !!useHttpPost;
	}

	CatalogAccess.prototype.getMetadata = function(data, callback) {
		var cacheResult, sapBackPack,
			request = new XMLHttpRequest(),
			allMetadata = [],
			that = this;

		function done(result) {
			var cb;
			if (that.metadataCallback) {
				cb = that.metadataCallback;
				that.metadataCallback = null;
				cb(result);
			}
		}

		function processResponse(response) {
			var metadata;
			if (response && Array.isArray(response.metadata) && response.metadata.length > 0) {
				metadata = response.metadata;
				Array.prototype.push.apply(allMetadata, metadata);
				consoleLog(function() {
					var i, msg = "metadata received for request: " + sapBackPack + "\n";
					for (i = 0; i < metadata.length; i++) {
						msg += (i > 0 ? ", " : " ") + metadata[i].mainType + " " + (metadata[i].schema ? metadata[i].schema + "." : "") + metadata[i].objectName;
					}
					return msg;
				});
			} else {
				consoleLog("no metadata received for request: " + sapBackPack, "warn");
			}
		}

		function metadataReceived() {
			var response;

			try {
				if (request.status === 200 && typeof request.responseText === "string" && request.responseText.charAt(0) ===
					"{") {
					response = JSON.parse(request.responseText);
					processResponse(response);
				} else {
					consoleLog("no metadata received for request: " + sapBackPack + "\n" + request.responseText, "error");
				}

				// update cache with catalog data
				that.cache.add(allMetadata);
				// add cached metadata
				Array.prototype.push.apply(allMetadata, cacheResult.found);
			} catch (e) {
				consoleLog(e);
			} finally {
				done(allMetadata);
			}
		}

		function metadataError() {
			consoleLog("error sending metadata request");
			done();
		}

		function metadataAbort() {
			consoleLog("metadata request aborted");
			done();
		}

		// try to get data from cache
		cacheResult = this.cache.get(data);

		// cancel previous request (either open() or abort()), finalize old callback
		if (that.metadataCallback) {
			that.metadataCallback();
		}
		that.metadataCallback = callback;

		// fetch remaining data from catalog
		if (cacheResult.notFound.length > 0) {
			sapBackPack = JSON.stringify(cacheResult.notFound);

			request.onload = metadataReceived;
			request.onerror = metadataError;
			request.onabort = metadataAbort;
			if (that.useHttpPost) {
				request.open("POST", that.metadataUrl);
				request.open("POST", that.metadataUrl);
				request.setRequestHeader('Content-Type', 'application/json');
				request.send(sapBackPack);
			} else {
				request.open("GET", that.metadataUrl);
				request.setRequestHeader("SapBackPack", sapBackPack);
				request.send();
			}
		} else {
			// all data found, no need to send a new request
			request.abort();
			done(cacheResult.found);
		}

	};

	function get(url, currentDB, useHttpPost) {
		var access, key;

		url = url || "/sap/hana/ide/common/lib/sqlparser/server/metadata.xsjs";
		url += currentDB ? "?db=" + encodeURIComponent(currentDB) : "";
		key = url;
		access = cachedAccessObj[key];
		if (!access) {
			access = new CatalogAccess(url, useHttpPost);
			cachedAccessObj[key] = access;
		}
		return access;
	}

	return {
		"get": get
	};
});