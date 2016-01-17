/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([	"jquery.sap.global" ], function(jQuery) { // EXC_JSHINT_002
	"use strict";

	/* global Promise */
	
	/**
	 * Creates a new queue instance.
	 * 
	 * @private
	 * @class
	 * @classdesc Asynchronous queue for JavaScript functions.
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.util.Queue
	 * @param {integer} iMaxLength Maximum queue length
	 */
	var Queue = function(iMaxLength) { // EXC_JSLINT_021
		this._iMaxLength = iMaxLength;
		this._aQueue = [];
	};

	/**
	 * Removes the first item from the queue and executes the next item on the queue.
	 * 
	 * @private
	 */
	Queue.prototype._execNext = function() {
		var oNext;

		this._aQueue.shift();
		oNext = this._aQueue[0];

		if (oNext) {
			this._exec(oNext);
		}
	};

	/**
	 * Executes the given item and defers execution of the next item, if it exists.
	 * 
	 * @param {object} oItem The item to be executed
	 * @private
	 */
	Queue.prototype._exec = function(oItem) {
		var that = this, fSuccess = function() {
			that._execNext();
		};

		oItem.jqdeferred.resolve();
		oItem.wait.then(function() {
			// wait until other handlers have executed.
			oItem.wait.then(fSuccess);
		}, jQuery.proxy(that._cancel, that));
	};

	/**
	 * Enqueues a function. If the queue has reached its maximum capacity, the function is rejected.
	 * 
	 * @param {function} fFunc The function to be enqueued
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the enqueued item
	 * @public
	 */
	Queue.prototype.enqueue = function(fFunc) {
		var oItem = {
			fn: fFunc
		};
		
		// build up the item:
		// use jQuery.Deferred to create a pending promise.
		oItem.jqdeferred = jQuery.Deferred();
		oItem.defer = new Promise(function (fulfill, reject) {
			oItem.jqdeferred.then(fulfill, reject);
		});
		
		// enable consumers to chain to the executed function:
		// function also returns a promise:
		// so implicitly consumers chain to the resolved or rejected promise
		// returned by the function.
		oItem.wait = oItem.defer.then(fFunc);
		
		if (this._aQueue.length >= this._iMaxLength) {
			oItem.jqdeferred.reject(new Error("Queue overflow: " + this._aQueue.length));
		} else {
			this._aQueue.push(oItem);

			// if only one item is on the queue, execute it immediately.
			if (this._aQueue.length === 1) {
				this._exec(oItem);
			}
		}

		return oItem.wait.then();
	};

	/**
	 * Cancels the execution of the current queue by rejecting each enqueued item. Additionally all existing items are removed from the queue.
	 * 
	 * @private
	 */
	Queue.prototype._cancel = function() {
		var oItem, i, len = this._aQueue.length;
		
		for (i = 0; i < len; i++) {
			oItem = this._aQueue[i];
			oItem.jqdeferred.reject(new Error("Queue cancellation"));
		}

		this._aQueue = [];
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	Queue.prototype.destroy = function() { // EXC_JSLINT_021
		this._aQueue = [];
	};

	return Queue;

}, true);
