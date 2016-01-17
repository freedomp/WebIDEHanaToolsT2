jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.XmlTemplateViewsStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.XmlTemplateViewsStepContent", {

    _bAlreadyReadXmlViews: null,
	_SAPUI5_XML_VIEW: "SAPUI5 XML View",
	_SAPUI5_XML_TEMPLATE:  "SAPUI5 XML Template",


	init : function() {
	    this._bAlreadyReadXmlViews = false;
	},

	
	onBeforeRendering : function() {
	    if(!this._bAlreadyReadXmlViews){
	        
	            // The step always valid ( because even if there is no selection, there are default values)
    	        this.fireValidation({
    				isValid: true
    			});
    			
    			this._bAlreadyReadXmlViews = true;
                if(this.getModel() && this.getModel().getData() && this.getModel().getData().xmlViewTemplates){
                    this.buildStepUI();
                }else{
                    var that = this;
                    this._loadModelForTemplate().then(function(oSmartDoc) {
    					   that._addXmlViewTemplatesToModel(oSmartDoc);
    					}).fin(function() {
    					   that.buildStepUI(); 
    					}).done();
                }
	    }
	},

	buildStepUI : function (){
	        var that = this;
	        
	        // The custom step title
	        var sHtmlText1 = this.getContext().i18n.getText("i18n", "projectGenWizard_xmlTemplateViews_header_ftv1");
	        var sHtmlText2 = this.getContext().i18n.getText("i18n", "projectGenWizard_xmlTemplateViews_header_ftv2");
	 
        	var oLink = new sap.ui.commons.Link("l1", {
        		text: "here.",
        		href: "https://wiki.wdf.sap.corp/wiki/display/fioritech/Smart+Templates",
        		title: "SAPUI5 Templates",
        		target: "_blank"
        	});
        	
        	var oFTV1 = new sap.ui.commons.FormattedTextView("otv1").addStyleClass("wizardBody xmlTemplatesViewStepFTV");
        	oFTV1.setHtmlText(sHtmlText1+sHtmlText2);
        	oFTV1.addControl(oLink);
	        this.addContent(oFTV1);
	        
            // create the row repeater control
            var oRowRepeater = new sap.ui.commons.RowRepeater();
    		oRowRepeater.setNoData(new sap.ui.commons.TextView({text: "No data available!"}));
        	oRowRepeater.setDesign("Transparent");

    		var oTitleRowTemplate = new sap.ui.commons.layout.MatrixLayout({
            	layoutFixed : true,
            	columns : 4,
            	width : "50%",
            	widths : ["30%", "40%", "30%" ]
    	    });
    	    
    	   var oRowTemplate = new sap.ui.commons.layout.MatrixLayout({
            	layoutFixed : true,
            	columns : 3,
            	width : "50%",
            	widths : [ "30%", "40%", "30%" ]
    	    });
    	    
        	var  matrixRow, matrixCell, control;
    		matrixRow = new sap.ui.commons.layout.MatrixLayoutRow();
    		matrixRow.setHeight("50px");
    		
    	    var	matrixRowTitle = new sap.ui.commons.layout.MatrixLayoutRow();
    		matrixRowTitle.setHeight("50px");
    		
	
    		//Name title
    		control = new sap.ui.commons.CheckBox();
    		control.addStyleClass("checkBoxVisibility");
    		matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
    		matrixCell.addContent(control);
    		control = new sap.ui.commons.TextView({
    		    text : "Name",
    		    design : sap.ui.commons.TextViewDesign.Bold
    		});
    		matrixCell.addContent(control);
    		matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
    		matrixRowTitle.addCell(matrixCell);
    		
    		
    		// Description title
     		control = new sap.ui.commons.TextView({
    		    text : "Description",
    		    design : sap.ui.commons.TextViewDesign.Bold
    		});
    		control.setWidth("100%");
    		matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
    		matrixCell.addContent(control);
    		matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
    		matrixRowTitle.addCell(matrixCell);
    		
    		
    		// Type title
    		control = new sap.ui.commons.TextView({
    		    text : "Type",
    		    design : sap.ui.commons.TextViewDesign.Bold
    		});
    		control.setWidth("100%");
    		matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
    		matrixCell.addContent(control);
    		matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
    		matrixRowTitle.addCell(matrixCell);
		
		
    		oTitleRowTemplate.addRow(matrixRowTitle);    		
    		this.addContent(oTitleRowTemplate);

 
         	// preprocess checkbox
    		control = new sap.ui.commons.CheckBox().addStyleClass("wizardCheckBox");
            control.bindProperty("checked", {
            	path: "preprocess",
            	formatter: function(value){
            	    return !value;
            	},
            	mode :sap.ui.model.BindingMode.TwoWay
            });
            control.bindProperty("text","viewPath");
            control.attachChange(function(oEvent){
              var sBindingPathInModel = oEvent.getSource().getBindingContext().sPath;
              var oViewInModel = this.getModel().getObject(sBindingPathInModel);
              if(oEvent.getParameters().checked){
                  oViewInModel.preprocess = false;
                  this.getModel().refresh();
                  that.fireValidation({
    				isValid: true,
    				message : ""
    			});
              }else{
                  oViewInModel.preprocess = true;
                  this.getModel().refresh();
                  that.fireValidation({
    				isValid: true,
    				message : "If you clear a checkbox, the view will be detached from its original repository."
    			});
              }
            });
    		control.setWidth("100%");
    		matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
    		matrixCell.addContent(control);
    		matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
    		matrixRow.addCell(matrixCell);   		
    		
	
    		//view description
    		control = new sap.ui.commons.TextView();
    		control.bindProperty("text","viewDescription");
    		control.setWidth("100%");
    		matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
    		matrixCell.addContent(control);
    		matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
    		matrixRow.addCell(matrixCell);
    		
    		
     		//view Type
    		control = new sap.ui.commons.TextView();
    		control.bindProperty("text", {
            	path: "preprocess",
            	formatter: function(value){
            	    if(!value){
            	        return that._SAPUI5_XML_TEMPLATE;            	        
            	    }else{
            	        return that._SAPUI5_XML_VIEW;
            	    }
            	},
            	mode :sap.ui.model.BindingMode.TwoWay
            });
    		control.setWidth("100%");
    		matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
    		matrixCell.addContent(control);
    		matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
    		matrixRow.addCell(matrixCell);   		

            var oModel = new sap.ui.model.json.JSONModel();
			oModel.setSizeLimit(500);
			var oDataModel = {
				xmlViewTemplates : []
			};
			jQuery.each(this.getModel().getData().xmlViewTemplates, function(key, item) {
				oDataModel.xmlViewTemplates.push(item);
			});
			oModel.setData(oDataModel);
			
			oRowRepeater.setModel(oModel);
    		oRowTemplate.addRow(matrixRow);
    		oRowRepeater.bindRows("/xmlViewTemplates", oRowTemplate);
            this.addContent(oRowRepeater);
    }, 
    
		/**
	 * Load the smart doc model for selected template
	 */
	_loadModelForTemplate: function() {
		return this.getContext().service.smartDocProvider.getSmartDocByTemplate(this.getModel().oData.selectedTemplate);
	},
	
	_addXmlViewTemplatesToModel: function(oSmartDoc) {
				if (oSmartDoc) {
					var that = this;
					jQuery.each(oSmartDoc.modelElements(), function(key, item) {
						if (item === "xmlViewTemplates") {
							that.getModel().oData[item] = oSmartDoc[item];
						}
					});
				}
	},
 

	renderer : {},

	onAfterRendering : function() {

	},

	cleanStep : function() {
	    this._bAlreadyReadXmlViews = false;
		this._clearXmlViewTemplatesFromModel();
		this._SAPUI5_XML_TEMPLATE = null;
		this._SAPUI5_XML_VIEW = null;
		this.getContext().service.smartDocProvider.invalidateCachedSmartDoc().done();
	},
	
	_clearXmlViewTemplatesFromModel: function() {
    	if (this.getModel()) {
    		delete this.getModel().oData["xmlViewTemplates"];
    	}
    }
});