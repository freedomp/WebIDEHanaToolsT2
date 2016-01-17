define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"],
	function(AbstractConfig) {
		"use strict";
		return AbstractConfig.extend("sap.watt.hana.common.hdiservice.service.HDIService", {

			_oDropdownServices: null,
			_HDIServiceFragment: null,
			_oListBox: null,
			_oGridForm: null,
			_oNewService: {
				"provider": "hana",
				"plan": "hdi-shared",
				"name": ""
			},

			init: function() {},
			
			isAvailable: function(){
				
			},
			


			saveProjectSetting: function(id, group, sProjectPath) {
				var oHDIServiceDropDown = sap.ui.getCore().byId("HDIServicesDropDown");
				var oModel = this._HDIServiceFragment.getModel();
				if (oModel.getProperty("/modelData/bNewSelected")) {
					var sNewServiceName = oModel.getProperty("/modelData/sNewServiceName");
					
					var aServices = oModel.getProperty("/modelData/aServices");
					if (sNewServiceName !== ""){
						var bNewServiceNameExists = false;
						for (var i = 0; aServices && i <  aServices.length; i++) {
							if (aServices[i].name === sNewServiceName){
								bNewServiceNameExists = true;
								break;
							} 
						}
						if (!bNewServiceNameExists){
							oModel.setProperty("/modelData/oNewService/name",sNewServiceName );
							this._addNewService(sNewServiceName).done();
							this._assignServiceToProject(sNewServiceName).done();
							aServices.push(oModel.getProperty("/modelData/oNewService"));
							oModel.setProperty("/modelData/aServices", aServices);
							oHDIServiceDropDown.setSelectedKey("");
						}
						else {
							//TODO add error that service already exists.
						}
					}
				} else {
					var sExistingServiceName = oHDIServiceDropDown.getSelectedKey();
					this._assignServiceToProject(sExistingServiceName && sExistingServiceName != "" ? sExistingServiceName : "" ).done();
					
				}
				//this._clearSettings();
			},

			getProjectSettingContent: function(id, group, sProjectPath) {
				var that = this;
				return this._getListOfServices().then(function(aServices) {
					if (!that._HDIServiceFragment) {
						that._createUI();
					}
					//Init the model for existing services
					that._clearSettings();
					aServices.unshift({text: "", name: ""});
					that._HDIServiceFragment.getModel().setProperty("/modelData/aServices", aServices);
					return that._setAssignedServiceInDropDown().then(function(){
						return that._HDIServiceFragment;
					});					
				});
			},
			
			_clearSettings: function(){
				this._HDIServiceFragment.getModel().setProperty("/modelData/bNewSelected", false);
				this._HDIServiceFragment.getModel().setProperty("/modelData/bExistingSelected", true);
				this._HDIServiceFragment.getModel().setProperty("/modelData/sNewServiceName", "");
				//set selected to the current HDI service if exists
				this._setAssignedServiceInDropDown().done();
			},			

			_getListOfServices: function() {
				return this.context.service.chebackend.XS2ServicesDAO.getAvailableServices(this._oNewService.provider, this._oNewService.plan);
			},
			
			_getAssignedService: function() {
				var that = this;
				return this._getSelectedDocument().then(function(oDocument){
					return that.context.service.chebackend.XS2ServicesDAO.getProjectActiveServiceName(oDocument, that._oNewService.provider);
				});
				
			},

			_addNewService: function(sName) {
				return this.context.service.chebackend.XS2ServicesDAO.createService(sName, this._oNewService.provider, this._oNewService.plan);
			},
			
			_assignServiceToProject: function(sName) {
				var that = this;
				if (sName && sName != "" ) {
					return this._getSelectedDocument().then(function(oDocument){
						return that.context.service.chebackend.XS2ServicesDAO.attachServiceToProject(sName, that._oNewService.provider, oDocument);
					});
				}							
			},			

			_onExistingSelected: function() {
				var oHDIServiceDropDown = sap.ui.getCore().byId("HDIServicesDropDown");
				this._HDIServiceFragment.getModel().setProperty("/modelData/bNewSelected", false);
				this._HDIServiceFragment.getModel().setProperty("/modelData/bExistingSelected", true);
				oHDIServiceDropDown.setSelectedKey("");
				this._HDIServiceFragment.getModel().setProperty("/modelData/sNewServiceName","");
				//Get the current assigned HDi service and set it as the current existing 
				this._setAssignedServiceInDropDown().done();
					
			},

			_onNewSelected: function() {
				var oHDIServiceDropDown = sap.ui.getCore().byId("HDIServicesDropDown");
				oHDIServiceDropDown.setSelectedKey("");
				this._HDIServiceFragment.getModel().setProperty("/modelData/bNewSelected", true);
				this._HDIServiceFragment.getModel().setProperty("/modelData/bExistingSelected", false);
			},
			
			_getSelectedDocument: function() {
				return this.context.service.repositorybrowser.getSelection().then(function(aSelectedDocuments) {
            		if ((aSelectedDocuments instanceof Array) && aSelectedDocuments.length === 1) {
            			//assuming single selection
            			return aSelectedDocuments[0].document;
            		} 
            		return null;
              });
			},
			
			_setAssignedServiceInDropDown: function() {
				var oHDIServiceDropDown = sap.ui.getCore().byId("HDIServicesDropDown");
				return this._getAssignedService().then(function(sAssignedServiceName){
					oHDIServiceDropDown.setSelectedKey(sAssignedServiceName && sAssignedServiceName != ""? sAssignedServiceName: "");
				});
			},

			_createUI: function() {
				this._HDIServiceFragment = sap.ui.jsfragment("sap.watt.hana.common.hdiservice.view.HDIServiceSettings", this);
				var oData = {
					bNewSelected: false,
					bExistingSelected: true,
					aServices: [],
					sNewServiceName: "",
					oNewService: {
						"provider": "hana",
						"plan": "hdi-shared",
						"name": ""
					}
				};
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					modelData: oData
				});
				this._HDIServiceFragment.setModel(oModel);
				this._HDIServiceFragment.bindElement("/modelData");
				this.context.i18n.applyTo(this._HDIServiceFragment);
			}
		});
	});