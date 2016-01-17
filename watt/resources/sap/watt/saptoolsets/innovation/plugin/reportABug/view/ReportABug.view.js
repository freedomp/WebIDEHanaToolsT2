sap.ui.jsview("sap.watt.saptoolsets.innovation.plugin.reportABug.view.ReportABug", {
    
    getControllerName : function() {
		return "sap.watt.saptoolsets.innovation.plugin.reportABug.view.ReportABug";
	},

	createContent : function(oController) {
		var that = this; 	
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			component:[
				{text:"", name:"None"},
				{text:"Core", name:"CORE"},
				{text:"Templates", name:"TEMPLATES"},
				{text:"W5G", name:"W5G"},
				{text:"Git", name:"GIT"},
				{text:"Editor", name:"EDITOR"},
				{text:"Deployment", name:"DEPLOYMENT"},
				{text:"Extensibility", name:"EXTENSIBILITY"}],
				editable: true, 
				tooltip: "Componennt"});
		
		this.oComponentDB = new sap.ui.commons.DropdownBox("oComponentDB");
		this.oComponentDB.bindProperty("tooltip", "/tooltip");
		this.oComponentDB.bindProperty("editable", "/editable");
		this.oComponentDB.setModel(oModel);
		var oItemTemplate1 = new sap.ui.core.ListItem();
		oItemTemplate1.bindProperty("text", "text");
		oItemTemplate1.bindProperty("key", "name");
		this.oComponentDB.bindItems("/component", oItemTemplate1);
		this.oComponentDB.setWidth("200px");
		this.oComponentDB.attachChange (function(oEvent){oController.descriptionLiveChange(oEvent);});
		
		//todo : externalize strings
		var oComponentLbl = new sap.ui.commons.Label({ 
			text : "Where was the problem found?",
			labelFor : this.oComponentDB
		});
		
		this.aBugDescription = new sap.ui.commons.TextArea({
    		    rows : 6,
    		    placeholder :that.oViewData.context.i18n.getText("i18n", "describe_hint"),
    		    maxLength : 2000,
    		    liveChange: function(oEvent){
    		    	oController.descriptionLiveChange(oEvent);
    		    }
    		    
    	});
		var DescribtionLbl = new sap.ui.commons.Label({
			text : that.oViewData.context.i18n.getText("i18n", "describe_problem"), 
			labelFor : 	this.aBugDescription
		});

		this.bScreenshotAllowed  = new sap.ui.commons.CheckBox({
			text : that.oViewData.context.i18n.getText("i18n", "include_screenshot"),
			tooltip : that.oViewData.context.i18n.getText("i18n", "reportABug_screenshot_tot"),
			checked : true
		});
		
		
		//Form
		var oBugReportForm = new sap.ui.layout.form.Form({
			layout : new sap.ui.layout.form.ResponsiveGridLayout(),
			formContainers : [ new sap.ui.layout.form.FormContainer({
				expandable : false,
				formElements : [ new sap.ui.layout.form.FormElement({
					fields : [ oComponentLbl ,this.oComponentDB, DescribtionLbl, this.aBugDescription,this.bScreenshotAllowed],
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12"
					})
    			}) ]
			}) ]
		});
		
        //Dialog Buttonsa
		this._oSendButton = new sap.ui.commons.Button({
			text : "Tell us",
			enabled : false,
			press : function(){
				oController.sendReport();
				that._oReportABugDialog.close();
			}
        });

		var oCanclButton = new sap.ui.commons.Button({
			text : "Cancel",
			press : function(){
				that._oReportABugDialog.close();
			}
		});

		this._oReportABugDialog = new sap.ui.commons.Dialog({
			width : "600px",
			hight:"400px",
			modal : true,
			title : that.oViewData.context.i18n.getText("i18n", "reportABug_title"),
			content : [ oBugReportForm ],
			buttons : [this._oSendButton, oCanclButton],
			resizable : false,
			keepInWindow : true
		});
		this._oReportABugDialog.oPopup.setPosition(sap.ui.core.Popup.Dock.CenterBottom, sap.ui.core.Popup.Dock.CenterCenter);


		return undefined;
	}

});