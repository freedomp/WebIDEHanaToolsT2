define(function() {
	"use strict";
	return {

		that: null,
		title: null,
		oDialog: undefined,

		init: function() {
		},

		info: function(flpURL, appUrl) {
		    if (this.oDialog !== undefined) {
				this.oDialog.destroy();
			}
			
			this.oDialog = new sap.ui.commons.Dialog({
				title: this.context.i18n.getText("i18n", "usernotification_title"),
				resizable: false,
				width: "500px",
				modal: true,
				keepInWindow: true
			});
			
			var that = this;
			
			var successMessage = new sap.ui.commons.TextView({
    			text: this.context.i18n.getText("i18n", "usernotification_success"),
    			textAlign: "Left",
    			layoutData: new sap.ui.layout.GridData({
    				span: "L12 M12 S12",
    				linebreak: true
    			})
    		}).addStyleClass("RegisterSuccessMessageTV");
			
			var oRegisteredApplicationLink = new sap.ui.commons.Link({
				text: this.context.i18n.getText("i18n", "open_registered_application_link_text"),
				href: flpURL ,
				target: "_blank",
				layoutData: new sap.ui.layout.GridData({
    				span: "L12 M12 S12"
    			})
			}).addStyleClass("successfullyRegisteredLink");
			
			var sHtmlRegisteredApplicationLinkText = " <embed data-index=\"0\"> ";
			
			var oRegisteredApplication = new sap.ui.commons.FormattedTextView();
    		oRegisteredApplication.setHtmlText(sHtmlRegisteredApplicationLinkText);
    		oRegisteredApplication.addControl(oRegisteredApplicationLink);
    		oRegisteredApplication.addStyleClass("successfullyRegisteredText");
    		oRegisteredApplication.setLayoutData(new sap.ui.layout.GridData({
    			span: "L12 M12 S12",
    			linebreak: true
    		}));
		
			//registered app in flp url control
			var oFioriLaunchpadLink = new sap.ui.commons.Link({
				text: this.context.i18n.getText("i18n", "open_fiori_Launchpad_link_text"),
				href: appUrl ,
				target: "_blank",
				layoutData: new sap.ui.layout.GridData({
    				span: "L12 M12 S12"
    			})
			}).addStyleClass("successfullyRegisteredLink");
			
			var sHtmlFioriLaunchpadLinkText = " <embed data-index=\"0\"> ";
			
			var oFioriLaunchpad = new sap.ui.commons.FormattedTextView();
    		oFioriLaunchpad.setHtmlText(sHtmlFioriLaunchpadLinkText);
    		oFioriLaunchpad.addControl(oFioriLaunchpadLink);
    		oFioriLaunchpad.addStyleClass("successfullyRegisteredText");
    		oFioriLaunchpad.setLayoutData(new sap.ui.layout.GridData({
    			span: "L12 M12 S12",
    			linebreak: true
    		}));
			
			var mainGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				vSpacing: 0,
				content: [successMessage, oRegisteredApplication, oFioriLaunchpad]
			});

            this.oDialog.addContent(mainGrid);

			this.oDialog.addButton(new sap.ui.commons.Button({
				text: this.context.i18n.getText("i18n", "OK"),
				press: function() {
					that.oDialog.close();
				}
			}));
			
			return this.oDialog.open();
		}
	};
});