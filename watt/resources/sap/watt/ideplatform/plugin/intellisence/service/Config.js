define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function (AbstractConfig) {
	"use strict";
	
	return AbstractConfig.extend("sap.watt.common.plugin.intellisence.service.Config", {
	
		_oContent : null,		
		
		getUserPreferenceContent : function() {
			var that = this;
			if (!this._oContent){
				this._oContent= this._createUI();
			}
			
			return this.getUserSetting().then(function(oSetting) {
				that._oSetting=oSetting;
				that._initUI();
				return that._oContent;
			});
		},
		
		configure : function(mConfig) {		
			this._oPreferenceModel = new this.PreferenceModel(mConfig.preferenceService);			
			this._aStyles = mConfig.styles;
		},
		
		saveUserPreference : function() {
			if (!this._oContent) {
				return Q();
			}

			this._oSetting={hintCode:this._oHintCode.getChecked()};
			var that = this;			
			return this.context.service.intellisence.setSetting(this._oSetting).then(function(){								
				return that._oPreferenceModel.storeSession(that._oSetting);											
			});
		},
		
		cancel : function(){
			var that=this;
			this.context.service.intellisence.getSetting().then(function(oSetting){								
				that._oSetting=oSetting;
				that._initUI();
			}).done();
		},
		
		_createUI: function(){
			var that=this;
			this.context.service.resource.includeStyles(this._aStyles).done();	
			
			var oForm = new sap.ui.layout.form.Form("IntellisenceConfigForm",{
				title: null,
				layout: new sap.ui.layout.form.GridLayout("IntellisenceConfigLayout")
			}).addStyleClass("IntellisenceSetting_form");		
			
			var oFormContainer =new sap.ui.layout.form.FormContainer("IntellisenceConfigContainer");			
			
			//autohint ui
			var oAutoHintheader = new sap.ui.commons.Label({
									text : "Set auto hint",										
									layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({linebreak:true})
									}).addStyleClass("subheader");			

			this._oHintCode = new sap.ui.commons.CheckBox({
									text : "Enable",
									checked : true								
									}).addStyleClass("edtCheckbox");

			var oCBContainer = new  sap.ui.layout.VerticalLayout({layoutData: new sap.ui.layout.form.GridElementData({hCells: "16"})});
			
			oCBContainer.addContent();
			
			var oFormElementAutoHintHeader= new sap.ui.layout.form.FormElement();
			var oFormElementAutoHint= new sap.ui.layout.form.FormElement();			
			oCBContainer.addContent(this._oHintCode);
			oFormElementAutoHintHeader.addField(oAutoHintheader);
			oFormElementAutoHint.addField(oCBContainer);
			
			oFormContainer.addFormElement(oFormElementAutoHintHeader);						
			oFormContainer.addFormElement(oFormElementAutoHint);						
												
			
			oForm.addFormContainer(oFormContainer);		
			return oForm;
		},

		_initUI : function(){
			this._oHintCode.setChecked(this._oSetting.hintCode);
		},


		// This object handles the user settings and Persistence service
		PreferenceModel : function(oPreferenceService) {
			// an empty model implementation 
			var mDummy = {
				beginSession : function() {
					return Q(true);
				},
				storeSession : function(oUserSettingsAsJson) {
				},
				getSession : function() {
					return null;
				},
				removeSession : function() {
					return Q(true);
				}
			};

			var mFunc = {
				_fPersistenceSrv : undefined,
				_sPersistenceNode : undefined,
				_oUserPreferencesAsJson : undefined,
				_bLoaded : false,
				beginSession : function() {
					var that = this;
					if (!this._bLoaded) {
						this._bLoaded = true;
						return this._fPersistenceSrv.get(this._sPersistenceNode).then(function(oUserSettingsAsJson) {
							if (oUserSettingsAsJson) {
								that._oUserPreferencesAsJson = oUserSettingsAsJson;
							}
							return that._oUserPreferencesAsJson;
						}).fail(function(oError) {
							that._oUserPreferencesAsJson = undefined;
						});
					} else {
						return Q(this._oUserPreferencesAsJson);
					}
				},

				storeSession : function(oUserSettingsAsJson) {
					// Cache current user settings					
					this._oUserPreferencesAsJson = oUserSettingsAsJson;
					// Write through to orion
					return this._fPersistenceSrv.set(oUserSettingsAsJson, this._sPersistenceNode);					
				},

				getSession : function() {
					// may or may not initialized
					return this._oUserPreferencesAsJson;
				},

				removeSession : function() {
					this._oUserPreferencesAsJson = undefined;
					this._fPersistenceSrv.remove(this._sPersistenceNode).done();
				}
			};

			if (oPreferenceService && oPreferenceService.service) {
				mFunc._fPersistenceSrv = oPreferenceService.service;
				mFunc._sPersistenceNode = oPreferenceService.node;
				return mFunc;
			} else {
				return mDummy;
			}
		},
         
		/**
		 * Get User Settings. It is called from intellisence to initialize properties.
		 *
		 * @param 	the user settings
		 */
		getUserSetting : function(){
			if (this._oSetting) {
				return Q(this._oSetting);
			} else {
				var that = this;					
				return this._oPreferenceModel.beginSession().then(function(oSetting){
					if (!oSetting) {
						return that.context.service.intellisence.getSetting().then(function(oSetting){								
							that._oSetting=oSetting;
							return Q(oSetting);
						});
					} else {
						that._oSetting = oSetting;
						return Q(oSetting);
					}
				});
			}
		}		
	});
});