define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function (AbstractConfig) {
	"use strict";

	return AbstractConfig.extend("sap.watt.common.plugin.javascript.service.Config", {
		_oView : null,
		_oController : null,
		_mSettings : null,
		_oSettings : null,
		_options: [],

		getProjectSettingContent : function(id, group) {
			var that = this;
			return this.context.service.beautifier.getSettings().then(function(oSettings) {
				that._oSettings = oSettings;
				if (!that._oView){
					that._oView = that._createControl();
				}

				return that._oView;
			});
		},

		saveProjectSetting : function(id, group) {
			if (!this._oView){
				return Q();
			}

			for (var i=0;i<this._options.length;i++){
				if (this._options[i].type=="boolean"){
					this._setSettings(this._options[i].id,this._options[i].control.getChecked());
				} else if (this._options[i].type=="array"){
					this._setSettings(this._options[i].id,this._options[i].control.getSelectedKey());
				}
			}
			return this.context.service.beautifier.setSettings(this._oSettings);			
		},

		_createControl: function(){
			var oSettings = this._oSettings;
			var oForm = new sap.ui.layout.form.Form("F1",{
				title: new sap.ui.core.Title({text:this.context.i18n.getText("i18n", "dlg_beautify_subtitle_1")}),
				layout: new sap.ui.layout.form.GridLayout("L1")
			});
			oForm.addStyleClass("beautifierSetting_form");

			var oUpperForm =new sap.ui.layout.form.FormContainer("F1C1");
			var oBelowForm =new sap.ui.layout.form.FormContainer("F1C2");
			var booleanCount=0,arrayCount=0;
			var oFormElement,oItem, oItemText, oItemSpace;

			for (var i=0; i<oSettings.length; i++){
				if (oSettings[i].type=="boolean"){
					oItem=	new sap.ui.commons.CheckBox({
									text : this.context.i18n.getText("i18n", oSettings[i].text),
									checked : oSettings[i].value,
									layoutData: new sap.ui.layout.form.GridElementData({hCells: "8"})
									});
					this._options.push({id:oSettings[i].id,control:oItem,type:"boolean"});
					if ((booleanCount % 2)==0){
						oFormElement= new sap.ui.layout.form.FormElement();
						oUpperForm.addFormElement(oFormElement);
					}
					oFormElement.addField(oItem);
					booleanCount++;
				} else if (oSettings[i].type=="array"){
					oItemText  = new sap.ui.commons.Label({text:this.context.i18n.getText("i18n", oSettings[i].text)
						, layoutData: new sap.ui.layout.form.GridElementData({hCells: "2"})
					});
					oItem = new sap.ui.commons.DropdownBox(
						{layoutData: new sap.ui.layout.form.GridElementData({hCells: "5"})}
					);
					this._options.push({id:oSettings[i].id,control:oItem,type:"array"});
					var selectedText;
					for (var j=0;j<oSettings[i].items.length;j++){
						var oListItem=new sap.ui.core.ListItem({text:oSettings[i].items[j].text,key:oSettings[i].items[j].value});
						oItem.addItem(oListItem);
						if (oSettings[i].items[j].value==oSettings[i].value){
							selectedText=oSettings[i].items[j].text;
						}
					}
					oItem.setValue(selectedText);
					oItemSpace = new sap.ui.commons.Label(
						{layoutData: new sap.ui.layout.form.GridElementData({hCells: "1"})}
					);

					if ((arrayCount % 2)==0){
						oFormElement= new sap.ui.layout.form.FormElement();
						oBelowForm.addFormElement(oFormElement);
					}

					oFormElement.addField(oItemText);
					oFormElement.addField(oItem);
					oFormElement.addField(oItemSpace);
					arrayCount++;
				}
			}

			oFormElement= new sap.ui.layout.form.FormElement();
			oItemSpace = new  sap.ui.layout.VerticalLayout({height:"10px"
				,layoutData: new sap.ui.layout.form.GridElementData({hCells: "16"})
			});
			oItemSpace.addStyleClass("beautifierSetting_middleForm");
			oFormElement.addField(oItemSpace);

			oUpperForm.addFormElement(oFormElement);
			oForm.addFormContainer(oUpperForm);
			oForm.addFormContainer(oBelowForm);

			var that=this;
			oForm.addEventDelegate({
				onAfterRendering : function(evt) {
					that.context.service.beautifier.getSettings().then(function(oSettings) {
						that.oSettings=oSettings;
						that._restoreSettings();
					}).done();
				}
			});

			return oForm;
		},
		_restoreSettings: function(){
			for (var i=0;i<this._options.length;i++){
				if (this._options[i].type=="boolean"){
					this._options[i].control.setChecked(this._getSettings(this._options[i].id));
				} else if (this._options[i].type=="array"){
					this._options[i].control.setSelectedKey(this._getSettings(this._options[i].id));
				}
			}
		},
		_setSettings: function(id,value){
			for (var i=0;i<this._oSettings.length;i++){
				if (this._oSettings[i].id==id){
					this._oSettings[i].value=value;
					return;
				}
			}
		},
		_getSettings: function(id){
			for (var i=0;i<this._oSettings.length;i++){
				if (this._oSettings[i].id==id){
					return this._oSettings[i].value;
				}
			}
		}
	});
});
