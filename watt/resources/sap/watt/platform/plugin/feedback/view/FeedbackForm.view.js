sap.ui.jsview("sap.watt.platform.plugin.feedback.view.FeedbackForm", {
    
    getControllerName : function() {
		return "sap.watt.platform.plugin.feedback.view.FeedbackForm";
	},

	createContent : function(oController) {
	    var that = this;
	    
	    // Rating Bar
	    var aRatingButtons = [];
	    var iRatingLength = 5;
	    for (var i = 0; i < iRatingLength; i++) {
	        aRatingButtons[i] = new sap.ui.commons.Button({
            	lite : true
            }).addStyleClass("ratingButton");
            aRatingButtons[i].ratingValue = iRatingLength - i;
	    }
	    
	    aRatingButtons[0].addStyleClass("firstRatingButton");
	    aRatingButtons[0].setIcon("sap-icon://smile/very_happy");
	    aRatingButtons[1].setIcon("sap-icon://smile/happy");
	    aRatingButtons[2].setIcon("sap-icon://smile/natural");
	    aRatingButtons[3].setIcon("sap-icon://smile/sad");
	    aRatingButtons[4].setIcon("sap-icon://smile/very_sad");
	    
		this._oSegmentedButton = new sap.ui.commons.SegmentedButton({
            buttons : aRatingButtons,
    	    select : [ oController.onRatingSelect, oController ],
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
        });
        
		var oRatingLabel = new sap.ui.commons.Label({
            labelFor : this._oSegmentedButton,
			text : that.oViewData.context.i18n.getText("i18n", "reting_text")
		});

        // Text Areas
        this._aTextAreas = [];
        var iTextAreasAmount = 3;
        for (var i=0; i<iTextAreasAmount; i++) {
            this._aTextAreas[i] = new sap.ui.commons.TextArea({
    		    rows : 3,
    		    maxLength : 2000
    		});
        }
        
        // Text Area Labels
        var aTextAreaLabels = [];
        for (var i=0; i<iTextAreasAmount; i++) {
        	aTextAreaLabels[i] = new sap.ui.commons.Label({
                labelFor : this._aTextAreas[i],
    			text : that.oViewData.context.i18n.getText("i18n", "palce_holder_" + i)
    		});
        }


		//Form
		var oFeedbackDialogForm = new sap.ui.layout.form.Form({
			layout : new sap.ui.layout.form.ResponsiveGridLayout(),
			formContainers : [ new sap.ui.layout.form.FormContainer({
				expandable : false,
				formElements : [ new sap.ui.layout.form.FormElement({
					fields : [ oRatingLabel ,this._oSegmentedButton, aTextAreaLabels[0], this._aTextAreas[0], aTextAreaLabels[1], this._aTextAreas[1], aTextAreaLabels[2], this._aTextAreas[2]],
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12"
					})
    			}) ]
			}) ]
		});
		
        //Dialog Buttons
		this._oSendButton = new sap.ui.commons.Button({
			text : that.oViewData.context.i18n.getText("i18n", "button_send"),
			tooltip : that.oViewData.context.i18n.getText("i18n", "button_send"),
			enabled : false,
			press : function(){
				oController.sendFeedback().fail(function(){}).done();
			}
        });

		var oCanclButton = new sap.ui.commons.Button({
			text : that.oViewData.context.i18n.getText("i18n", "button_cancel"),
			tooltip : that.oViewData.context.i18n.getText("i18n", "button_cancel"),
			press : [ oController.cancelFeedback, oController ]
		});

		this._oFeedbackDialog = new sap.ui.commons.Dialog({
			width : "400px",
			modal : true,
			title : that.oViewData.context.i18n.getText("i18n", "feedback_form_title"),     
			content : [ oFeedbackDialogForm ],
			buttons : [this._oSendButton, oCanclButton],
			resizable : false,
			keepInWindow : true
		});
		this._oFeedbackDialog.oPopup.setPosition(sap.ui.core.Popup.Dock.CenterBottom, sap.ui.core.Popup.Dock.CenterCenter);


		return undefined;
	}

});