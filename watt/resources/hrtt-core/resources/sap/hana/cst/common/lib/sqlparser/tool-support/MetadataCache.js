/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define*/
define(function() {
	"use strict";

	var MetadataCache;

	function buildKey(data) {
		return (data.mainType === "VIEW" ? "TABLE" : data.mainType) + ':"' + data.schema + '"."' + data.objectName + '"';
	}

	MetadataCache = function(maxSize, maxLifetime) {
		this.maxSize = maxSize || 1000;
		this.maxLifetime = maxLifetime || 10000; // in ms
		this.entries = [];
		this.names = {};
	};

	MetadataCache.prototype = {
		add: function(dataArray) {
			var now, i, replaceSize, data, entry, addSize, key,
				addedKeys = {};

			if (!Array.isArray(dataArray)) {
				dataArray = dataArray ? [dataArray] : [];
			}

			addSize = Math.min(this.maxSize, dataArray.length);
			replaceSize = Math.max(this.entries.length + addSize - this.maxSize, 0);
			this._removeFromNames(this.entries.splice(0, replaceSize));

			now = Date.now();
			for (i = 0; i < addSize; i++) {
				data = dataArray[i];
				if (!data) {
					continue;
				}
				key = buildKey(data);
				entry = this.names[key];
				if (!entry) {
					entry = {};
					this.entries.push(entry);
					this.names[key] = entry;
					addedKeys[key] = true;
				} else if (data.NOT_FOUND === true && addedKeys[key]) {
					// we expect that the entry does not exist yet
					// so we just update an existing entry for the sake of simplicity
					// except for entries added with the same add() call, since we might receive a NOT_FOUND
					// for a VIEW where as there exists a TABLE with the same name
					continue;
				}
				entry.date = now;
				entry.data = data;
			}
		},

		_removeFromNames: function(entryArray) {
			var i, entry, key;

			if (!Array.isArray(entryArray)) {
				entryArray = entryArray ? [entryArray] : [];
			}

			for (i = 0; i < entryArray.length; i++) {
				entry = entryArray[i];
				if (!entry) {
					continue;
				}
				key = buildKey(entry.data);
				delete this.names[key];
			}
		},

		get: function(dataArray) {
			var expired, data, i, entry, key,
				result = {
					found: [],
					notFound: []
				};

			if (!Array.isArray(dataArray)) {
				dataArray = dataArray ? [dataArray] : [];
			}

			// remove exired entries first
			expired = Date.now() - this.maxLifetime;
			for (i = 0; i < this.entries.length; i++) {
				if (this.entries[i].date > expired) {
					break;
				}
			}
			this._removeFromNames(this.entries.splice(0, i));

			// try to find the entries
			for (i = 0; i < dataArray.length; i++) {
				entry = null;
				data = dataArray[i];
				if (!data) {
					continue;
				}
				key = buildKey(data);
				entry = this.names[key];
				if (entry) {
					result.found.push(entry.data);
				} else {
					result.notFound.push(data);
				}
			}

			return result;
		}

	};

	return MetadataCache;

});