define(["sap/watt/lib/lodash/lodash"],function(_) {
	"use strict";
	var LogServer = {

		_aBuffer : [],
		_oLogQueue :Q(),
		_currentBufferSize : 0,
		
		configure: function(mConfig) {
				var that = this;
				this._intervalInMilliSeconds = mConfig.intervalInMilliSeconds || 30000 ;
				this._bufferOptimalLimit = mConfig.bufferOptimalLimit || 50000;
				this._bufferMaxLimit = mConfig.bufferMaxLimit || 10485760;
				//Unsubscribe in case of log server is not aviliable on the lanscape
				return that.context.service.destination.getDestination("logger").then(function(aDestinations){
				if(aDestinations.length === 0){
					// Temporary workaround till detachEvent will work
					that.onLoggerEvent = function(){};
				}
				else{
					// should register to those if there is server available
					that._savingLogInterval();
					that._savingLogWhenWindowClose();	
				}
			});
			
		},
		
		_savingLogWhenWindowClose : function(){
			var that = this;
			if (this.context.service) {
				this.context.service.unloadHandler.addHandler(function(){
					if(that._aBuffer.length > 0){
					that._saveLog().done();
				}	
				}).done();
			}
		},

		_savingLogInterval : function() {
			var that = this;
			var interval = this._intervalInMilliSeconds;
			this._saveLogInterval = window.setInterval(function() {
				if(that._aBuffer.length > 0){
					return that._saveAndClear();
				}
			}, interval);
		},
		
		_saveAndClear : function(){
			var that = this;
			that._oLogQueue = that._oLogQueue.then(function() {
				return that._saveLog().then(function(){
					that._aBuffer = [];
					that._currentBufferSize = 0;
				});
			});
			
			return that._oLogQueue;
		},
		
		_addToBuffer : function(oNode){
			var that = this;
			that._oLogQueue = that._oLogQueue.then(function() {
				that._aBuffer.push(oNode);
				var bytes = that._calculateNodeSize(oNode);	
				that._currentBufferSize += bytes; 	
			});
			return that._oLogQueue;
		},
		
		_overrideOldestMassgeInBuffer : function(oNode){
			var that = this;
			that._oLogQueue = that._oLogQueue.then(function() {
				var removedNode = that._aBuffer.splice(0, 1, oNode);
				var nodeSizeInBytes = that._calculateNodeSize(oNode);		
				// splice retrun array.In this case legth 1 because we remove one item.
				var removedNodeSizeInBytes = that._calculateNodeSize(removedNode[0]);		
				that._currentBufferSize += (nodeSizeInBytes - removedNodeSizeInBytes); 
			});
			
			return that._oLogQueue;
		},
		
		_calculateNodeSize : function(oNode){
			var bytes = 0;
			_.forIn(oNode, function(value, key) {
				if(_.isString(value)){
					if(value && value.length){
						bytes += value.length;	
					}
				}
				else{
					if(value && value.toString().length){
						bytes += value.toString().length;
					}
				}
			});	
			return bytes;
		},

		_isBufferInOptimalRange : function() {
			//In bytes
			return this._currentBufferSize <= this._bufferOptimalLimit;
		},
		
		_isBufferInMaxRange : function() {
			//In bytes
			return this._currentBufferSize <= this._bufferMaxLimit;
		},

		_saveLog : function() {
			var that = this;
			if(that._aBuffer.length === 0){
				return Q();	
			} 
			var oData = that._aBuffer;
			var browser = that._getBrowserType();
			var mOptions = {
				method: "POST",
				processData: false,
				data: JSON.stringify({messages:oData, data:browser})
			};
			return Q.sap.ajax("/logger",
				mOptions
			).fail(function(oError) {
				console.error("logserver - problem with saving log data in server. Error: " + oError.message);
			});
		},
		
		_getBrowserType : function(){
			if(sap.ui.Device.browser.chrome){
				return "CHROME";	
			}
			else if(sap.ui.Device.browser.firefox){
				return "FIREFOX";	
			}
			else if(sap.ui.Device.browser.internet_explorer){
				return "INTERNET_EXPLORER";		
			}
			else if(sap.ui.Device.browser.safari){
				return "SAFARI";		
			}
		},
		
		_validationAndSaving : function(oNode){
			var that = this;
			var isInRange = that._isBufferInOptimalRange();
			// Over the optimal limit then we should save the buffer on server and empty the buffer array.
			if(!isInRange || oNode.level ===  "error" ){
				return that._saveAndClear();
			}
			else
			{
				return Q();
			}
		},

		onLoggerEvent : function(oEvent) {
			var that = this;
			var oNode = oEvent.params.node;
			if(oNode){
				
				/*
				This check is necessary  for case there is no connection in there is saving in server is failed and the buffer is keep increasing
				and we dont want it to increasing over the max limit.In this limit we start to ovveride the oldest massage in the array.
				*/
				if(that._isBufferInMaxRange()){
					return that._addToBuffer(oNode).then(function(){
						return that._validationAndSaving(oNode);
					});
				}
				
				that.context.service.usagemonitoring.report("logserver", "bufferMaxLimitExceed", that._bufferMaxLimit).done();
				// remove 1 item in index 0 in the array and add an item (the third parameter) in index 0.
				return that._overrideOldestMassgeInBuffer(oNode).then(function(){
					return that._validationAndSaving(oNode);
				});
			}
		}
	};
	return LogServer;
});