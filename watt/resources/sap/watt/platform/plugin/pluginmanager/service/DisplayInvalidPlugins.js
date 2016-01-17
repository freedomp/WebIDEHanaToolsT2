define(function() {
	"use strict";
	return {
		
		_aPluginToBeRemovedFromUserPrefs : null,

		onAfterPluginsStarted : function(oEvent) {
			sap.watt.includeCSS(require.toUrl("sap.watt.platform.pluginmanager/css/pluginManager.css"));
			var aPlugins = oEvent.params.params;
			this._aPluginToBeRemovedFromUserPrefs = [];
			// Add plugin to be removed array and Extract the message from the reason object and put it on the plugin object (for the formatter of textField)
			for (var i=0; i<aPlugins.length; i++) {
				aPlugins[i].message = aPlugins[i].reason.message;
				this._addPluginToBeRemoved(aPlugins[i]);
			}
			if(aPlugins.length > 0){
    			var oDialog = sap.ui.getCore().byId("PluginManagerDialog");
    			if (!oDialog) {
            		oDialog = this._createDialog();
    			}
    
    			var oPluginsModel = new sap.ui.model.json.JSONModel();
    			oPluginsModel.setData({
    				"plugins" : aPlugins
    			});
    			this._oPluginManagerTable.setModel(oPluginsModel);
    			this._oPluginManagerTable.bindRows("/plugins");
        		
    		    oDialog.open();
			}
	    },
	    
	    _addPluginToBeRemoved : function(oPlugin) {
	    	if (oPlugin.name && oPlugin.message) {
	    		//check if probably duplicate plugin is loaded
	    		if (oPlugin.message.indexOf("is already implemented") > -1 || oPlugin.message.indexOf("is already registered") > -1) {
	    			//check if external plugin
	    			if (oPlugin.baseURI.indexOf("/plugins/pluginrepository") > -1) {
	    				this._aPluginToBeRemovedFromUserPrefs.push(oPlugin.baseURI);
	    			}
	    		}
	    	}
	    },


		_createDialog : function() {
			sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/wizard.css"));

            var that = this;
			//Create an instance of the table control
			this._oPluginManagerTable = new sap.ui.table.Table({
				selectionMode : sap.ui.table.SelectionMode.Single,
				layoutData : new sap.ui.layout.GridData({
					span : "L12 M12 S12",
					linebreak : true
				})
			});

            
			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "{i18n>pluginManagement_pluginNameColumn}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "name",
						formatter: function(sValue) {
							return sValue ? sValue : that.context.i18n.getText("i18n", "pluginManagement_unavailableProperty");
						}
					}
				}),
				sortProperty : "pluginDescription",
				filterProperty : "pluginDescription"
			}));
			
			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "{i18n>pluginManagement_pluginDescriptionColumn}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "description",
						formatter: function(sValue) {
							return sValue ? sValue : that.context.i18n.getText("i18n", "pluginManagement_unavailableProperty");
						}
					}
				}),
				sortProperty : "pluginDescription",
				filterProperty : "pluginDescription"
			}));

			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "{i18n>pluginManagement_pluginReasonColumn}"
				}),
                template : new sap.ui.commons.TextView().bindProperty("text", "message"),
                sortProperty : "pluginDescription",
				filterProperty : "pluginDescription"
			}));

			this._oPluginManagerTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);


			var oCloseButton = new sap.ui.commons.Button({
				text : "{i18n>pluginManagement_okButton}",
				tooltip : "{i18n>pluginManagement_okButton}",
				press : [ this.closeDialog, this ],
				layoutData : new sap.ui.layout.GridData({
					span : "L2 M3 S8"
				})

			}).addStyleClass("buttonWidth");
			
        	var sHtmlText = this.context.i18n.getText("i18n", "pluginManagement_gotoLabel") + '<embed data-index=\"0\">.';
        	
        	var oLink = new sap.ui.commons.Link({
        		text:  this.context.i18n.getText("i18n", "pluginManagement_gotoLink"),
            	press: [ this.gotoPreference, this ],
				layoutData : new sap.ui.layout.GridData({
					span : "L2 M3 S8"
				})
        	}).addStyleClass("linkStyle");
        	
        	var oGotoPreferenceFTV = new sap.ui.commons.FormattedTextView({
        	    htmlText : sHtmlText,
        	    controls : oLink
        	}).addStyleClass("FTVstyle");
        	
			var oPluginManagerDialog = new sap.ui.commons.Dialog("PluginManagerDialog", {
				width : "70%",
				title : "{i18n>pluginManagement_managePluginTitle}",
				content : [ this._oPluginManagerTable ],
				buttons : [ oGotoPreferenceFTV, oCloseButton ],
				defaultButton: oCloseButton,
				keepInWindow : true,
				resizable : false,
				modal : true
			}).addStyleClass("dialogStyle");
			
			this.addi18nBundleToDialog(oPluginManagerDialog);

			return oPluginManagerDialog;

		},
		
		gotoPreference : function() {
		    this.closeDialog();
			this.context.service.perspective.renderPerspective("userpreference").done();
			
		},
			
		addi18nBundleToDialog : function(oDialog) {
			if (this.context.i18n) {
				this.context.i18n.applyTo(oDialog);
			}
		},
		
		closeDialog : function() {
			var oDialog = sap.ui.getCore().byId("PluginManagerDialog");
			if (oDialog !== undefined) {
				if (this._aPluginToBeRemovedFromUserPrefs && this._aPluginToBeRemovedFromUserPrefs.length > 0) {
					this.context.service.pluginmanagement.removePluginsFromUserPreferences(this._aPluginToBeRemovedFromUserPrefs).fail(function(oError) {
						console.log(oError);
						}).done();
				}
				oDialog.close();
			}
		}
	};
});