define([ "sap/watt/common/error/AssertError" ], function(AssertError) {
	"use strict";
	return {

		_oSelectionProvider : null,

		init : function() {
		},

		configure : function(mConfig) {
			var that = this;
			this.typedSelections = {};
			mConfig.typedSelections.forEach(function(mEntry){
				var mDef;
				var handler = function(oProvider){
					return that.selectionProviderChanged(mDef, oProvider);
				};
				var providerHandler = function(){
					return that._specialSelectionChangedHandler(mDef);  
				};
				that.typedSelections[mEntry.id] = mDef = {
						id : mEntry.id,
						service : mEntry.service,
						provider : undefined,
						handler : handler,
						providerHandler : providerHandler
				};
				mEntry.service.attachEvent("selectionProviderChanged", handler, that);
			});
			
			//Entry for main focus
			that.typedSelections[""] = this.focusDef = {
				//As the event on focus is bound immediately we won't miss it
				//And if it has not occured yet, there is no focus
				provider : that.context.service.dummyselectionprovider
			};
		},
		
		getSelection : function(sID) {
			var that = this;
			
			return this.getOwner(sID).then(function(oProvider){
				if (oProvider) {
					return oProvider.getSelection().then(that._fixSelection);
				} else {
					return Q([]);
				}
			});
		},
		
		_fixSelection : function(oSelection) {
			// Remark: Cannot use "oSelection instanceof Array" because it isn't true when called from a Karma test.
			if (oSelection && jQuery.isArray(oSelection)) {
				//expecting a document
				for(var i=0; i<oSelection.length;i++) {
					if(!oSelection[i].document) {
						return [];
					}
				}
				return oSelection;
			} else if (oSelection && oSelection.document) {
				return [ oSelection ];
			} else {
				return [];
			}
		},

		getOwner : function(sID) {
			var that = this;
			sID = sID || "";
			var mDef = this.typedSelections[sID];
			var oProm;
			//We might have missed an early event, so fetch provider if not there yet
			if (mDef.provider === undefined){
				return mDef.service.getSelectionProvider().then(function(oProvider) {
					mDef.provider = oProvider || that.context.service.dummyselectionprovider;
					return mDef.provider;
				});
			} else {
				return Q(mDef.provider);
			}
		},
		
		isOwner : function(oService, sID) {
			return this.getOwner(sID).then(function(oOwner){
				return oService === oOwner;
			});
		},

		assertOwner : function(oService, sID) {
			return this.isOwner(oService, sID).then(function(bResult){
				if (!bResult){
					throw new AssertError("Service is not selected");
				}
				return oService;
			});
		},
		//no selection available
		isEmpty : function(sID) {
			return this.getSelection(sID).then(function(oSelection) {
				return oSelection.length == 0;
			});
		},

		assertNotEmpty : function(sID) {
			return this.getSelection(sID).then(function(oSelection) {
				if (oSelection.length == 0) {
					throw new AssertError("Selection is empty");
				}
				return oSelection;
			});
		},

		assertNotEmptySingleSelection : function(sID) {
			return this.assertNotEmpty(sID).then(function(oSelection) {
				if (oSelection.length !== 1) {
					throw new AssertError("Not single selection");
				}
				return oSelection[0];
			});
		},

		assertEmpty : function(sID) {
			return this.getSelection(sID).then(function(oSelection) {
				if (oSelection.length > 0) {
					throw new AssertError("Selection is not empty");
				}
				return oSelection;
			});
		},

		onFocusChanged : function() {
			var that = this;
			return this.context.service.focus.getFocus().then(function(oService) {
				if (that.focusDef.provider && that.focusDef.provider.detachEvent) {
					that.focusDef.provider.detachEvent("selectionChanged", that._selectionChangedHandler, that);
				}
				// if the new focused service can provide selections change the selection provider to this service
				if (oService.instanceOf && oService.instanceOf("sap.watt.common.service.selection.Provider")) {
					if (oService.attachEvent) {
						oService.attachEvent("selectionChanged", that._selectionChangedHandler, that);
					}
					that.focusDef.provider = oService;
					return that._selectionChangedHandler();
				} else {
					// New selection owner could not be set, set a dummy provider to prevent null pointer issues
					that.focusDef.provider = that.context.service.dummyselectionprovider;
					return that._selectionChangedHandler();
				}
			});
		},
		
		_selectionChangedHandler : function() {
			var that = this;
			return this.getSelection().then(function(aSelection) {
				return that.context.event.fireChanged({
					selection : aSelection,
					owner : that.focusDef.provider
				});
			});
		},
		
		selectionProviderChanged : function(mDef, oEvent){
			var that = this;
			var oSelectionProvider = oEvent.params.selectionProvider || that.context.service.dummyselectionprovider;
			if (mDef.provider == oSelectionProvider){
				return;
			}
			if (mDef.provider) {
				mDef.provider.detachEvent("selectionChanged", mDef.providerHandler, that);
			}
			mDef.provider = oSelectionProvider;
			oSelectionProvider.attachEvent("selectionChanged", mDef.providerHandler, that);
			return mDef.providerHandler();
		},
		
		_specialSelectionChangedHandler : function(mDef) {
			var that = this;
			return this.getSelection(mDef.id).then(function(aSelection) {
				return that.context.event.fireTypedSelectionChanged({
					id : mDef.id,
					selection : aSelection,
					owner : mDef.provider
				});
			});
		}
	};
});