sap.ui.jsfragment("sap.watt.hana.common.hdiservice.view.HDIServiceSettings", {

	createContent : function(oController) {
		
		var that = this;
		
		var oExistingHDIServiceRB = new sap.ui.commons.RadioButton({
			tooltip: "{i18n>hdi_service_existing_service_tooltip}",
			groupName : 'HDIRBG1',
			selected : "{bExistingSelected}",
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M1 S1"
			}),
			select: [oController._onExistingSelected, oController]
		});
		
		var oExistingServiceLabel = new sap.ui.commons.Label({
			tooltip: "{i18n>hdi_service_existing_service_tooltip}",
			text: "{i18n>hdi_service_service_name}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});	
		
		var oDropdownServices = new sap.ui.commons.DropdownBox(this.createId("HDIServicesDropDown"),{
			enabled: "{bExistingSelected}",
			tooltip: "{i18n>hdi_service_existing_service_tooltip}",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M6 S6"
				})
			});
		
		var oHDIExistingServiceListBox = new sap.ui.commons.ListBox();
		var oHDIExistingServiceListBoxItemTemplate = new sap.ui.core.ListItem({
			text: "{name}",
			key: "{name}"
		});
		
		oHDIExistingServiceListBox.bindAggregation("items", {
			path: "/modelData/aServices",
			template: oHDIExistingServiceListBoxItemTemplate
		});
		
		oDropdownServices.setListBox(oHDIExistingServiceListBox);
	
		var oNewHDIServiceRB = new sap.ui.commons.RadioButton({
				groupName : 'HDIRBG1',
				tooltip: "{i18n>hdi_service_add_service_tooltip}",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1",
					linebreak: true
				}),
				selected : "{bNewSelected}",
				select: [oController._onNewSelected, oController]
			});
		
			
		var oNewServiceLabel = new sap.ui.commons.Label({
			text: "{i18n>hdi_service_add_new_service}",
			tooltip: "{i18n>hdi_service_add_service_tooltip}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S4"
			})
		});
	
		var oNewHDIServiceText = new sap.ui.commons.TextField({
			tooltip: "{i18n>hdi_service_add_service_tooltip}",
			placeholder: "{i18n>hdi_service_enter_service_name_placeholder}",
			width: "100%",
			editable: "{bNewSelected}",			
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M6 S6"
			}),
			value: "{sNewServiceName}"
		});	
		
		this._oGrid = new sap.ui.layout.Grid({
			content:[oExistingHDIServiceRB, oExistingServiceLabel, oDropdownServices, oNewHDIServiceRB, oNewServiceLabel, oNewHDIServiceText ]
		});
		
		return this._oGrid;
	}
});				