/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/* global File */

// Provides the DownloadManager class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/EventProvider"
], function(jQuery, library, EventProvider) {
	"use strict";

	/**
	 * Creates a new DownloadManager object.
	 *
	 * @class
	 * Provides the functionality to download multiple files from remote locations (URLs) and from local files.
	 *
	 * @param {any[]} sources An array of strings (URLs) and File objects to download.
	 * @param {int} maxParallelTasks The maximum number of downloading tasks to execute in parallel.
	 * @private
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.DownloadManager
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var DownloadManager = EventProvider.extend("sap.ui.vk.DownloadManager", /** @lends sap.ui.vk.DownloadManager.prototype */ {
		metadata: {
			publicMethods: [
				"start",
				"attachItemSucceeded",
				"detachItemSucceeded",
				"attachItemFailed",
				"detachItemFailed",
				"attachAllItemsCompleted",
				"detachAllItemsCompleted"
			],

			events: {
				/**
				 * Item is successfully downloaded.
				 */
				itemSucceeded: {
					parameters: {
						/**
						 * The source of type sap.ui.core.URI or File.
						 */
						source: { type: "any" },
						/**
						 * The content of source of type ArrayBuffer.
						 */
						response: { type: "object" }
					}
				},

				/**
				 * Item is not downloaded due to an error.
				 */
				itemFailed: {
					parameters: {
						/**
						 * The source of type sap.ui.core.URI or File.
						 */
						source: { type: "any" },
						/**
						 * The status of the downloading process. Type might be int or string.
						 */
						status: { type: "any" },
						statusText: { type: "string" }
					}
				},

				/**
				 * Downloading all items is completed, successfully or not.
				 */
				allItemsCompleted: {}
			}
		},

		constructor: function(sources, maxParallelTasks) {
			EventProvider.apply(this);

			this._maxParallelTasks = maxParallelTasks || 5;
			this._sourcesToProcess = sources.slice();
			this._sourcesBeingProcessed = [];
		},

		/**
		 * Starts the downloading process.
		 * @returns {sap.ui.vk.DownloadManager} <code>this</code> to allow method chaining.
		 * @public
		 */
		start: function() {
			/* eslint-disable no-empty */
			while (this._pickAndDispatchTask()) {
				// A comment to avoid ESLint warnings.
			}
			/* eslint-enable no-empty */

			return this;
		},

		/**
		 * Picks and dispatches a source for downloading.
		 * @return {boolean} Returns <code>true</code> if a source is picked and dispatched, returns <code>false</code> if there are no more sources to download.
		 * @private
		 */
		_pickAndDispatchTask: function() {
			if (this._sourcesToProcess.length > 0 && this._sourcesBeingProcessed.length < this._maxParallelTasks) {
				var source = this._sourcesToProcess.shift();
				this._sourcesBeingProcessed.push(source);
				this._runTask(source);
				return true;
			}
			return false;
		},

		/**
		 * @param {sap.ui.core.URI|File} source The URL or File that is completed.
		 * @return {boolean} Returns <code>true</code> if it is the last task completed.
		 * @private
		 */
		_taskFinished: function(source) {
			var index = this._sourcesBeingProcessed.indexOf(source);
			if (index >= 0) {
				this._sourcesBeingProcessed.splice(index, 1);
			}

			return this._sourcesToProcess.length === 0 && this._sourcesBeingProcessed.length === 0;
		},

		_runTask: function(source) {
			var that = this;
			if (typeof source === "string") {
				var xhr = new XMLHttpRequest();

				xhr.onreadystatechange = function(event) {
					if (xhr.readyState === xhr.DONE) {
						var isLast = that._taskFinished(source);
						that._pickAndDispatchTask();

						if (xhr.status === 200) {
							that.fireItemSucceeded({
								source: source,
								response: xhr.response
							});
						} else {
							that.fireItemFailed({
								source: source,
								status: xhr.status,
								statusText: xhr.statusText
							});
						}

						if (isLast) {
							that.fireAllItemsCompleted({});
						}
					}
				};

				xhr.open("GET", source, true);
				xhr.responseType = "arraybuffer";
				xhr.send(null);
			} else if (source instanceof File) {
				var fileReader = new FileReader();

				fileReader.onload = function(event) {
					var isLast = that._taskFinished(source);
					that._pickAndDispatchTask();
					that.fireItemSucceeded({
						source: source,
						response: fileReader.result
					});
					if (isLast) {
						that.fireAllItemsCompleted({});
					}
				};

				fileReader.onerror = function(event) {
					var isLast = that._taskFinished(source);
					that._pickAndDispatchTask();
					that.fireItemFailed({
						source: source,
						status: fileReader.error.name,
						statusText: fileReader.error.message
					});
					if (isLast) {
						that.fireAllItemsCompleted({});
					}
				};

				fileReader.readAsArrayBuffer(source);
			} else {
				throw new Error("Unsupported type of the 'source' parameter");
			}

			return this;
		},

		attachItemSucceeded: function(data, func, listener) {
			return this.attachEvent("itemSucceeded", data, func, listener);
		},

		detachItemSucceeded: function(func, listener) {
			return this.detachEvent("itemSucceeded", func, listener);
		},

		fireItemSucceeded: function(parameters, allowPreventDefault, enableEventBubbling) {
			return this.fireEvent("itemSucceeded", parameters, allowPreventDefault, enableEventBubbling);
		},

		attachItemFailed: function(data, func, listener) {
			return this.attachEvent("itemFailed", data, func, listener);
		},

		detachItemFailed: function(func, listener) {
			return this.detachEvent("itemFailed", func, listener);
		},

		fireItemFailed: function(parameters, allowPreventDefault, enableEventBubbling) {
			return this.fireEvent("itemFailed", parameters, allowPreventDefault, enableEventBubbling);
		},

		attachAllItemsCompleted: function(data, func, listener) {
			return this.attachEvent("allItemsCompleted", data, func, listener);
		},

		detachAllItemsCompleted: function(func, listener) {
			return this.detachEvent("allItemsCompleted", func, listener);
		},

		fireAllItemsCompleted: function(parameters, allowPreventDefault, enableEventBubbling) {
			return this.fireEvent("allItemsCompleted", parameters, allowPreventDefault, enableEventBubbling);
		}
	});

	return DownloadManager;
});
