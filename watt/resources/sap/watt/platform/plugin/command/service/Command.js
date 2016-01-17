define([ "sap/watt/lib/mousetrap/mousetrap", "sap/watt/common/error/AssertError" ], function(Mousetrap, AssertError) {
	"use strict";
	var bIsDialogOpen = false;
	var sLoadingPageUrl = require.toUrl("sap.watt.common.platform/ui/LoadingPage.html");

	var bIsMac = (sap.ui.Device.os.name === "mac");
	var bIsWin = (sap.ui.Device.os.name === "win");

	var mModifierFormats = {
			mod:       bIsMac ? "\u2318" : "Ctrl",
			ctrl:      bIsMac ? "\u2303" : "Ctrl",
			alt:       bIsMac ? "\u2325" : "Alt",
			shift:     bIsMac ? "\u21E7" : "Shift",
			del:       bIsMac ? "\u2326" : "Delete",
			left:      bIsMac ? "\u2190" : "Left",
			up:        bIsMac ? "\u2191" : "Up",
			right:     bIsMac ? "\u2192" : "Right",
			down:      bIsMac ? "\u2193" : "Down",
			home:      bIsMac ? "\u2196" : "Home",
			end:       bIsMac ? "\u2198" : "End",
			pageUp:    bIsMac ? "\u21DE" : "PageUp",
			pageDown:  bIsMac ? "\u21DF" : "PageDown",
			backspace: bIsMac ? "\u232B" : "Backspace",
			enter:     bIsMac ? "\u21A9" : "Enter"
	};
	var mKeyOrderLinux   = ["shift", "ctrl", "mod", "alt"];
	var mKeyOrderMac     = ["ctrl", "alt", "shift", "mod"];
	var mKeyOrderWindows = ["mod",   "ctrl", "alt", "shift"];
	var mKeyOrder = bIsMac ? mKeyOrderMac : (bIsWin ? mKeyOrderWindows : mKeyOrderLinux);
	var sKeyDelim = bIsMac ? "" : "+";

	var Command = function(sId, mConfig, oEventEmitter) {
		this._sId = sId;
		this._mConfig = mConfig;
		this._oEventEmitter = oEventEmitter;

		this._sIcon = mConfig.icon;
		this._sIconLabel = mConfig.iconLabel;
		this._sLabel = mConfig.label;

		this._oService = mConfig.service;
		this._sType = mConfig.type; // type of the value 
		this._mValues = {};
		this._mValues["default"] = mConfig.value;
		this._mServices = this._oService.context.service;
		this._bAvailable = compileExpression(mConfig.available);
		this._bEnabled = compileExpression(mConfig.enabled);
		this._sWindowTarget = mConfig.windowTarget;
		this._sKeyBinding = mConfig.keyBinding;

		this._registerKeyBinding(mConfig.keyBinding);
		if (Mousetrap.version && Mousetrap.version !== "1.4.6") {
			throw new Error("Version mismatch of mousetrap. SAP needs a patched version of 1.4.6.");
		}
	};

	Command.prototype.getId = function() {
		return this._sId;
	};

	Command.prototype.getIcon = function() {
		return this._sIcon;
	};

	Command.prototype.getKeyBindingAsText = function() {
		var sKeyBinding = null;
		if (this._sKeyBinding) {
			var aParts = this._sKeyBinding.split("+");
			aParts.sort(this._keySorter);
			for (var i = 0; i < aParts.length; i++) {
				var sPart = mModifierFormats[aParts[i].toLowerCase()];
				if (!sPart) { // normal key: uppercase the first char
					sPart = aParts[i].charAt(0).toUpperCase() + aParts[i].substring(1, aParts[i].length);
				}
				sKeyBinding = sKeyBinding ? sKeyBinding + sKeyDelim + sPart : sPart;
			}
		}
		return sKeyBinding;
	};

	Command.prototype.getKeyBindingTooltip = function(sText) {
		var sKeyBinding = this.getKeyBindingAsText();
		if (sKeyBinding) {
			return sText + " (" + sKeyBinding + ")";
		} else {
			return sText;
		}
	};

	Command.prototype.getIconLabel = function() {
		return this._sIconLabel;
	};

	Command.prototype.getType = function() {
		return this._sType;
	};

	Command.prototype.getValue = function(sId) {
		if (sId == undefined) {
			sId = "default";
		}

		return this._mValues[sId]||this._mValues["default"];
	};

	Command.prototype.getLabel = function() {
		return this._sLabel;
	};

	Command.prototype.checkValue = function(vValue) {
		// TODO: More assertions to be inserted
		if (this.getType() === "boolean" && typeof vValue !== "boolean") {
			throw new AssertError("Just boolean values are allowed in boolean commands");
		}
	};

	Command.prototype.setValue = function(vValue, sId) {
		this.checkValue(vValue);
		if (sId == undefined) {
			sId = "default";
		}
		if (this._mValues[sId] && vValue !== this._mValues[sId]) {
			this._oEventEmitter.fireInvalidated({
				commands : [ this ]
			}).done();
		}
		this._mValues[sId] = vValue;
	};

	Command.prototype.execute = function(vValue) {
		var that = this;
		this._oCommandWindow = this._getCommandWindow();
		return this._isExecutable().then(function(bExecutable) {
			if (vValue === undefined) {
				vValue = that.getValue();
			}
			that.setValue(vValue);
			if (bExecutable) {
				return that._oService.execute(vValue, that._oCommandWindow, that._mValues).fail(function(oError) {
					that._closeCommandWindow();
					throw oError;
				});
			} else {
				that._closeCommandWindow();
				return Q();
			}
		});
	};

	Command.prototype._getCommandWindow = function() {
		if (this._sWindowTarget) {
			var oWin = window.open(sLoadingPageUrl, this._sWindowTarget);
			oWin.focus();
			return oWin;
		} else {
			return undefined;
		}
	};

	Command.prototype._closeCommandWindow = function() {
		if (this._oCommandWindow) {
			this._oCommandWindow.close();
			this._oCommandWindow = undefined;
		}
	};

	Command.prototype._isExecutable = function() {
		return this.getState().then(function(mState) {
			return mState.available && mState.enabled;
		});
	};

	Command.prototype._isAvailable = function() {
		if (this._bAvailable != null) {
			return this._processStateValue("available", this._bAvailable);
		}
		return this._oService.isAvailable(this._mValues).then(null, function(oError) {
			if (oError instanceof AssertError) {
				return false;
			} else {
				throw oError;
			}
		});
	};

	Command.prototype._isEnabled = function() {

		if (this._bEnabled != null) {
			return this._processStateValue("enabled", this._bEnabled);
		}
		return this._oService.isEnabled(this._mValues).then(null, function(oError) {
			if (oError instanceof AssertError) {
				return false;
			} else {
				throw oError;
			}
		});

	};

	Command.prototype._processStateValue = function(sKey, vValue) {
		return Q(this._processStateValueSync(sKey, vValue));
	};

	Command.prototype._processStateValueSync = function(sKey, vValue) {
		if (typeof vValue === "boolean") {
		    return vValue;
		}
		
		vValue = vValue();
		
		if (typeof vValue === "boolean") {
			return vValue;
		} else {
			throw new AssertError(sKey + ": only accepts boolean value");
		}
	};

	Command.prototype.getState = function() {
		var that = this;
		return this._isAvailable().then(function(bAvailable){
		    if(bAvailable){
		        return [bAvailable,that._isEnabled()];
		    }else{
		        return [false,false];
		    }
		}).spread(function(bAvailable,bEnabled){
            return {
				id : that._sId,
				enabled : bEnabled,
				available : bAvailable
			};
		});
		
	};

	Command.prototype._registerKeyBinding = function(sKey) {
		var that = this;
		if (sKey) {
			require([ "sap/watt/lib/mousetrap/mousetrap-global-bind.min" ], function() {
				if (sKey === "mod+s" || sKey === "mod+o" || sKey === "mod+f" || sKey === "mod+shift+a" || sKey === "mod+shift+s"
					|| sKey === "mod+shift+m" || sKey === "mod+h" || sKey === "ctrl+space" || sKey === "esc" || sKey === "mod+shift+r" || sKey === "mod+shift+v") {
					Mousetrap.bindGlobal(sKey, function(e) {

						if (bIsDialogOpen) {
							return;
						}
						
						that.execute().done();
						return false;
					});
				// Wysiwyg editor: Change (left, right up, down) and move (shift+...) control currently selected
				} else if (sKey === "left"	|| sKey === "right" || sKey === "up" || sKey === "down" ||
						   sKey === "shift+left"	|| sKey === "shift+right" || sKey === "shift+up" || sKey === "shift+down") {
					Mousetrap.bind(sKey, function(e) {
						if (bIsDialogOpen) {
							return;
						}
						
						that.execute().done();
						return false;
					}); 
				} else {
					Mousetrap.bindGlobal(sKey, function(e) {

						if (bIsDialogOpen) {
							return;
						}
						
						// Allow command to stop event propagation if it has declared its available state.
						// This state can be calculated quickly.
						if (that._bAvailable) {
							// need to use the synchronous _processStateValueSync().
							var bCommandAvailable = that._processStateValueSync("available", that._bAvailable);
							// Only execute if available. This avoids double evaluation of available expression.
							if (bCommandAvailable) {
								that.execute(e).done();
							}
							// stop default event if command is available
							return !bCommandAvailable;
						} else {
							// Coded available state.  No chance to get to know it quickly and synchronously.
							that.execute(e).done();
						}
					});
				}
			});
		}
	};

	Command.prototype._keySorter = function(k1, k2) {
		var o1 = mKeyOrder.indexOf(k1);
		if (o1 < 0) { o1 = 100; } // normal key to the end
		var o2 = mKeyOrder.indexOf(k2);
		if (o2 < 0) { o2 = 100; } // normal key to the end
		return o1 - o2;
	};

	Command.prototype._error = function(sMessage) {
		Command._error(this._sId, sMessage);
	};

	/**
	 * =============================
	 * STATIC METHODS
	 * =============================
	 */

	Command._mCommands = {};

	Command.register = function(sId, mConfig, oEventEmitter) {
		if (this._mCommands[sId]) {
			this._error(sId, "Already registered");
		}

		mConfig = jQuery.extend({
			service : null,
			keyBinding : null,
			stateServices : []
		}, mConfig);

		var that = this;
		var oCommand = new Command(sId, mConfig, oEventEmitter);
		that._mCommands[sId] = oCommand;
		return oCommand;
	};

	Command.get = function(sId) {
		var oCommand = this._mCommands[sId];
		if (!oCommand) {
			this._error(sId, "Command not implemented");
		}
		return oCommand;
	};

	Command.getAll = function() {
		return this._mCommands;
	};

	Command._error = function(sId, sMessage) {
		// TODO: Should we only throw errors when IDE is in debug mode?
		var aMessage = [];
		if (sId) {
			aMessage.push("Command: " + sId);
		}
		if (sMessage) {
			aMessage.push("Message: " + sMessage);
		}
		throw new Error(aMessage.join(" | "));
	};

	/**
	 * =============================
	 * SERVICE
	 * =============================
	 */

	var CommandService = {

		configure : function(mConfig) {
			var that = this;
			jQuery.each(mConfig.commands, function(iIndex, mCommand) {
				Command.register(mCommand.id, mCommand, that.context.event);
			});
		},

		getCommand : function(sCommandId) {
			return Command.get(sCommandId);
		},

		registerDocument : function(documentScope) {
			Mousetrap.registerDocument(documentScope);
		},

		unregisterDocument : function(documentScope) {
			Mousetrap.unregisterDocument(documentScope);
		},

		filter : function(aItems) {
			var aFilteredItems = [];
			var aPromises = [];
			jQuery.each(aItems, function(iIndex, oItem) {
				if (oItem.getCommand && oItem.getCommand()) {
					aPromises.push(oItem.getCommand().getState());
				} else {
					aPromises.push(Q({
						enabled : true,
						available : true
					}));
				}
			});

			return Q.all(aPromises).then(function(aStates) {
				jQuery.each(aItems, function(iIndex, oItem) {
					var mState = aStates[iIndex];
					if (oItem && mState.available) {
						aFilteredItems.push({
							enabled : mState.enabled,
							item : oItem
						});
					}
				});
				return aFilteredItems;
			});
		},

		invalidateAll : function() {
			this.context.event.fireInvalidated({
				commands : Command.getAll()
			}).done();
		},

		onDialogOpened : function() {
			bIsDialogOpen = true;
		},

		onDialogClosed : function() {
			bIsDialogOpen = false;
		}

	};
	
	function compileEnv(mValue) {
		if (typeof(mValue) !== "string"){
			throw new Error("Invalid Expression: Parameter for 'env' must be string");
		}
		
		return function() {
			//Default is of type boolean
			return sap.watt.getEnv(mValue, false);
		};
	}
	
	function compileEquals(mValue) {
		if (jQuery.type(mValue) !== "array"){
			throw new Error("Invalid Expression: Parameter for 'equals' must be array with 2 elements");
		}
		if (mValue.length !== 2){
			throw new Error("Invalid Expression: Parameter for 'equals' must be array with 2 elements");
		}
		mValue = mValue.map(function(mEntry) {
			return compileExpression(mEntry);
		});
		return function() {
			return !!(mValue[0]() === mValue[1]());
		};
	}
	
	function compileNot(mValue) {
		mValue = compileExpression(mValue);
		return function() {
			return !mValue();
		};
	}
	
	function compileAnd(mValue) {
		if (jQuery.type(mValue) !== "array"){
			throw new Error("Invalid Expression: Parameter for 'and' must be array");
		}
		mValue = mValue.map(function(mEntry) {
			return compileExpression(mEntry);
		});
		return function() {
			return mValue.every(function(mEntry){
				return !!mEntry();
			});
		};
	}
	
	function compileOr(mValue) {
		if (jQuery.type(mValue) !== "array"){
			throw new Error("Invalid Expression: Parameter for 'or' must be array");
		}
		mValue = mValue.map(function(mEntry) {
			return compileExpression(mEntry);
		});
		return function() {
			return mValue.some(function(mEntry){
				return !!mEntry();
			});
		};
	}
	
	var expressions = {
			"env" : compileEnv,
			"equals" : compileEquals,
			"and" : compileAnd,
			"or" : compileOr,
			"not" : compileNot
	};
	
	function compileExpression(oExpression) {
		if (oExpression != null) {
		
			var sType = jQuery.type(oExpression);
			if (sType === "object") {
				var aKeys = Object.keys(oExpression);
				if (aKeys.length !== 1) {
					throw new Error("Invalid Expression: Only one entry allowed");
				}
				var sKey = aKeys[0];
				var mValue = oExpression[sKey];
				
				if (expressions[sKey]) {
					return expressions[sKey](mValue);
				} else {
					throw new Error("Invalid Expression: Unknown Type " + sKey);
				}
				
			} else if (sType === "array") {
				throw new Error("Invalid Expression: Array is not allowed");
			} else {
				//Simple type
				return function () {
					return oExpression;
				};
			}
		} else {
			return null;
		}
	}
	
	return CommandService;
});
