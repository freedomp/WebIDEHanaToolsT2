define(function() {
	"use strict";
	var Log = function() {
	};

	Log.prototype = jQuery.extend(Log.prototype, {

		// This object defines the order of the logging levels
		_oOrder : {
			"debug" : 0,
			"info" : 1,
			"warn" : 2,
			"error" : 3
		},

		_sLogLevel : "info",

		_targets : null,

		_defaultTargets : [],

		_getTarget : function(sTargetName) {
			return this._targets ? this._targets[sTargetName] : null;
		},
		
		_getTargetService : function(sTargetName) {
			return this._targets ? this._targets[sTargetName].service : null;
		},

		init : function() {
		},

		configure : function(mConfig) {
			if (mConfig.targets && mConfig.targets.length > 0) {
				this._targets = {};
				for ( var i = 0; i < mConfig.targets.length; i++) {
					var oActTarget = mConfig.targets[i];
					this._targets[oActTarget.name] = oActTarget;
					this._defaultTargets.push(oActTarget.name);
				}
			} else {
				this._targets = null;
				this._sLogLevel = mConfig.logLevel;
				this._oBuffer = this.LogBuffer(mConfig.bufferSize);
			}
		},

		LogBuffer : function(sSize) {
			return this._circularBuffer(sSize);
		},

		_createLogNode : function(sLevel, sTag, sMessage) {
			return new function() {
				this.timestamp = new Date();
				this.tag = sTag;
				this.message = sMessage;
				this.level = sLevel;
			};
		},

		setLogSize : function(sTargetName, iSize) {
			var oTarget = this._getTargetService(sTargetName);
			if (oTarget) {
				return oTarget.setLogSize(sTargetName, iSize);
			} else {
				this._logSize = iSize;
				this._oBuffer = this.LogBuffer(iSize);
			}
		},

		getLogSize : function(sTargetName) {
			var oTarget = this._getTargetService(sTargetName);
			if (oTarget) {
				return oTarget.getLogSize(sTargetName);
			} else {
				return this._logSize;
			}
		},

		info : function(sTag, sMessage, aTargets) {
			return this._addLogNode("info", sTag, sMessage, aTargets);
		},

		warn : function(sTag, sMessage, aTargets) {
			return this._addLogNode("warn", sTag, sMessage, aTargets);
		},

		error : function(sTag, sMessage, aTargets) {
			return this._addLogNode("error", sTag, sMessage, aTargets);
		},

		debug : function(sTag, sMessage, aTargets) {
			return this._addLogNode("debug", sTag, sMessage, aTargets);
		},

		addMessage : function(sSeverity, sTag, sMessage, aTargets) {
			return this._addLogNode(sSeverity, sTag, sMessage, aTargets);
		},

		setLevel : function(sTargetName, sLevel) {
			var oTarget = this._getTargetService(sTargetName);
			if (oTarget) {
				oTarget.setLevel("", sLevel);
			} else {
				this._sLogLevel = sLevel;
			}
		},

		getLevel : function(sTargetName) {
			var oTarget = this._getTargetService(sTargetName);
			if (oTarget) {
				return oTarget.getLevel();
			} else {
				return this._sLogLevel;
			}
		},

		getLog : function(sTargetName) {
			var oTarget = this._getTargetService(sTargetName);
			if (oTarget) {
				return oTarget.getLog(sTargetName);
			} else {
				return this._oBuffer.getBuffer();
			}
		},

		getLastLogMessage : function(sTargetName) {
			var oTarget = this._getTargetService(sTargetName);
			if (oTarget) {
				return oTarget.getLastLogMessage(sTargetName);
			} else {
				return this._oBuffer.read();
			}
		},

		_delegate : function(aActTargets, sLevel, sTag, sMessage) {
			var that = this;
			var aPromises = [];
			jQuery.each(aActTargets, function(i, sService) {
				var oAct = that._targets[sService];
				if (oAct) {
					// delegate to specified logger
					aPromises.push(oAct.service.getLevel().then(function(sThatLevel){
						if (that._oOrder[sLevel] >= that._oOrder[sThatLevel]) {
							return oAct.service.addMessage(sLevel, sTag, sMessage).then(function(oNode) {
								return that.context.event.fireChanged({
									target : oAct.name,
									service : oAct.service,
									node : oNode
								});
							});
						} else {
							return Q();
						}
					}));
				}
			});
			return Q.all(aPromises);
		},

		_addLogNode : function(sLevel, sTag, sMessage, aActTargets) {

			if (this._targets) {
				aActTargets = aActTargets ? aActTargets : this._defaultTargets;
				// iterate over all target names, find the target logger and send message
				return this._delegate(aActTargets, sLevel, sTag, sMessage);
			} else {
				// write to the own ringbuffer
				var oNode = new this._createLogNode(sLevel, sTag, sMessage);
				this._oBuffer.add(oNode);
				return Q(oNode);
			}
		},

		_circularBuffer : function(bufferSize) {
			var aBuffer = [];
			var start = 0;
			var end = -1;

			return {
				add : function(node) {
					end++;
					// Set end pointer to 0 when at the end of the array
					end %= bufferSize;
					if (end > aBuffer.length - 1) {
						aBuffer.push(node);
					} else {
						aBuffer[end] = node;
					}
					if (end == start) {
						start = (start) % bufferSize;
					}
				},
				read : function() {
					var elem = aBuffer[start];
					start = (start + 1) % bufferSize;
					return elem;
				},
				readLatest : function() {
					return aBuffer[end];
				},
				isEmpty : function() {
					return start === end;
				},
				isFull : function() {
					return (end + 1) % bufferSize === start;
				},
				getBuffer : function() {
					return aBuffer;
				}
			};
		}
	});

	return Log;
});