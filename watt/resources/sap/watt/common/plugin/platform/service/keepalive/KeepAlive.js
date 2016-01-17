define(["sap/watt/lib/lodash/lodash"], function (_) {
	
	"use strict";
	
	return {

		_bIsAlive : true,
		_activityWasDetected : false,
		_pingCounter : 0,
		_pingSessionTimeout : undefined,
		_actions : ["keydown", "mousemove", "mousedown"],

		configure : function(mConfig) {
			if (!mConfig.disabled) {
				
				this._contentService = mConfig.dirtyCheckService;
				this._ddsService = mConfig.dirtyDocumentsStorageService;
				this._iTimeoutInMinutes = mConfig.timeoutInMinutes;
				this._maxPingQuantity = mConfig.maxPingQuantity;
			    this._pingSession(1);
			    this._manageEvents();
			    this.context.service.usernotification.liteInfo(this.context.i18n.getText("i18n", "keepAlive_empty"), true).done();
			}
		},
		
		_manageEvents : function(attachEvents) {
			if (this.isAlive()) {
				var that = this;
				_.forEach(this._actions, function(action) {
					$(window).on(action, function() {
						that._onUserActivity();
					});
				});
			} 
		}, 
		
		_onUserActivity : function() {
	    	if (this._activityWasDetected === false) {
		    	this._activityWasDetected = true;

		    	if (this._pingCounter === this._maxPingQuantity && this.isAlive()) {
					var that = this;
		    		this.callKeepAlive().then(function() {
		    			if (that.isAlive()) {
		    				that._startPingCycle();
		    			}
		    		}).done();
		    	}
	    	}
		},
		
		_startPingCycle : function() {
			this._activityWasDetected = false;
			this._stop(this._pingSessionTimeout);
			this._pingSession(1);
		},
		
		_pingSession : function(counter) {
			var that = this;
			this._pingCounter = counter;
			// counter <this._maxPingQuantity
			var interval = ((this._iTimeoutInMinutes * 60) - 30) * 1000;
			if (counter === this._maxPingQuantity) { // last session ping
				interval = ((this._iTimeoutInMinutes * 60) + 60) * 1000;
			} 
			
			this._pingSessionTimeout = window.setTimeout(function() {
				that.callKeepAlive().then(function() {
					if (that.isAlive()) {
						if (counter < that._maxPingQuantity && that._activityWasDetected === true) {
							that._startPingCycle();
							return;
						}
						
						if (counter < that._maxPingQuantity) {
							// counter is less than _maxPingQuantity
							that._pingSession(++counter);
						} else {
							that._askUserForRestart();
						}
					}
				}).done();
			}, interval);
		},

		// Returns boolean that tells the caller whether or not it shall be re-sheduled
		callKeepAlive : function() {
			var that = this;

			return this.context.service.system.isAlive().then(function() {
				return that.context.service.log.debug("IDE", that.context.i18n.getText("i18n", "keepAlive_stillAlive"), [ "user" ]).then(function() {
					return true; // ping again
				});
			}, function() {
				that._askUserForRestart();
			});
		},

		_stop : function(iKeepAliveKind) {
			if (iKeepAliveKind) {
				window.clearTimeout(iKeepAliveKind);
				iKeepAliveKind = undefined;
			}
		},

		_askUserForRestart : function() {
			var that = this;
			this._bIsAlive = false;
			this._stop(this._pingSessionTimeout);
			
			this._contentService.getDocuments(true).then(function(dirtyDocuments) {
				
				var messageKey = "keepAlive_restartQuestion";
				
				if (dirtyDocuments.length > 0) {
					messageKey = "keepAlive_restartQuestionDirty";
				}
						
				return that.context.service.usernotification.info(that.context.i18n.getText("i18n", messageKey)).then(function() {
					// disable browser "unsaved content" notification
					return that.context.service.unloadHandler.setEnabled(false).then(function() {
						if (dirtyDocuments.length > 0) {
							// save dirty documents
							return that._ddsService.save(dirtyDocuments).then(function() {
								window.location.reload();
								return true;
							});
						} 
						
						window.location.reload();
						return true;
					});
				});
			}).done();
		},
		
		isAlive : function() {
			return this._bIsAlive;
		}
	};
});