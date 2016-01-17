/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.generic.templates.TemplateComponent.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/UIComponent', 'sap/ui/generic/template/library', 'sap/m/MessageBox', 'sap/ui/model/json/JSONModel', 'sap/ui/core/mvc/ViewType'
], function(jQuery, UIComponent, library, MessageBox, JSONModel, ViewType) {
	"use strict";

	/**
	 * Constructor for a new TemplateComponent.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Creates and initializes a new Smart Template component with the given <code>sId</code> and settings.
	 * @extends sap.ui.core.UIComponent
	 * @author SAP SE
	 * @version 1.32.7
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.ui.generic.template.TemplateComponent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TemplateComponent = UIComponent.extend("sap.ui.generic.template.TemplateComponent", /** @lends sap.ui.generic.template.TemplateComponent.prototype */
	{
		metadata: {
			properties: {
				/**
				 * Name of template
				 */
				templateName: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Entity Set
				 */
				entitySet: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Navigation property of the current component
				 */
				navigationProperty: {
					type: "string",
					defaultValue: null
				},
				/**
				 * Instance of AppComponent
				 */
				appComponent: {
					type: "object",
					defaultValue: null
				},
				/**
				 * Refresh required when the component is activated
				 */
				isRefreshRequired: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Prevent binding done in the navigation controller when the component is activated/created.
				 * 
				 * @since 1.32.0
				 */
				preventBinding: {
					type: "boolean",
					defaultValue: false
				}
			},
			library: "sap.ui.generic.template"
		}
	});

	// TODO: clarify with Marcel: this.oContainer
	TemplateComponent.prototype.getComponentContainer = function() {
		// TODO: align with UI5 - how to access component container
		return this.oContainer;
	};
	// TODO: clarify with above todo (this.oContainer)
	TemplateComponent.prototype.setContainer = function() {
		var oModel;
		// call overwritten setContainer (sets this.oContainer)
		sap.ui.core.UIComponent.prototype.setContainer.apply(this, arguments);
		if (this.oContainer) {
			oModel = this.oContainer.getModel();
			if (oModel) {
				oModel.getMetaModel().loaded().then(function() {
					// Do the templating once the metamodel is loaded
					this.runAsOwner(function() {
						var oView = this._createXMLView();
						this.setAggregation("rootControl", oView);
						this.getUIArea().invalidate();
					}.bind(this));
				}.bind(this));
			}
		}
	};

	TemplateComponent.prototype._createXMLView = function() {
		var oView = null;

		var oMetaModel = this.getModel().getMetaModel();
		var oEntitySet = oMetaModel.getODataEntitySet(this.getEntitySet());
		if (!oEntitySet || !oEntitySet.entityType) {
			this.handleErrors();
			return null;
		}

		this._enhanceI18nModel();

		// TODO: how to get the helpers from a template definition
		jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");
		try {
			var sStableId = this._determineStableID();
			
			oView = sap.ui.getCore().byId(sStableId);
			if (oView){
				window.console.warn("View with ID: " + sStableId + " already exists - old view is getting destroyed now!");
				try {
					oView.destroy();
				} catch (ex) {
					window.console.error("Error destroying view: " + ex);
				}
				oView = null;
			}
			
			// device model
            var oDeviceModel = new JSONModel(sap.ui.Device);   
            oDeviceModel.setDefaultBindingMode("OneWay");
			
			oView = sap.ui.view({
				preprocessors: {
					xml: {
						bindingContexts: {
							meta: oMetaModel.createBindingContext(oMetaModel.getODataEntityType(oEntitySet.entityType, true)),
							entitySet: oMetaModel.createBindingContext(oMetaModel.getODataEntitySet(this.getEntitySet(), true))
						},
						models: {
							device: oDeviceModel,
							meta: oMetaModel,
							entitySet: oMetaModel,
							parameter: this._createParameterModel(oEntitySet.entityType)
						},
						preprocessorsData : this.getComponentData().preprocessorsData
					}
				},
				id: sStableId,
				type: ViewType.XML,
				viewName: this.getTemplateName(),
				height: "100%"
			});
		} catch (e) {
			this.handleErrors(e);
			// forward exception
			throw e;
		}
		return oView;
	};

	TemplateComponent.prototype._determineStableID = function() {
		if (this.getAppComponent().getMetadata().getComponentName() === "" || this.getTemplateName() === "" || this.getEntitySet() === "") {
			var sText = "Stable Id could not be determined in sap.ui.generic.template.TemplateComponent. Either application component name or template name or entity set is empty.";
			this.handleErrors(new Error(sText));
			throw new Error(sText + this);
		}
		return this.getAppComponent().getMetadata().getComponentName() + '::' + this.getTemplateName() + '::' + this.getEntitySet();
	};

	TemplateComponent.prototype._enhanceI18nModel = function() {
		var oModelApplication = this.getAppComponent().getModel('i18n|' + this.getMetadata().getComponentName() + '|' + this.getEntitySet());
		if (!oModelApplication) {
			return;
		}
		var oModelTemplate = this.getModel('i18n');
		oModelTemplate.enhance(oModelApplication.getResourceBundle());
	};

	TemplateComponent.prototype._createParameterModel = function(sEntityType) {
		var isDraftEnabled = this.getAppComponent().getTransactionController().getDraftController().getDraftContext().isDraftEnabled(this.getEntitySet());
		var oSettings = null;
		var oAllSettings = this.getComponentContainer().getSettings(); // this should have all settings passed to the component during creation

		// create settings section in parameter model with all settings passed to the component
		oSettings = jQuery.extend({}, oAllSettings);

		// remove properties not needed or available on the component itself
		delete oSettings.appComponent;
		delete oSettings.entitySet;
		delete oSettings.navigationProperty;

		return new JSONModel({
			entitySet: this.getEntitySet(),
			entityType: sEntityType,
			"sap-ui-debug": window['sap-ui-debug'],
			isDraftEnabled: isDraftEnabled,
			"settings": oSettings,
			"manifest": this.getAppComponent().getMetadata().getManifest()
		});
	};

	// TODO: Clarify error handling
	TemplateComponent.prototype.handleErrors = function(oError) {
		var oView = this.getAggregation("rootControl");
		if (!oView || !oView.getController()) {
			return;
		}
		var oController = oView.getController();
		oController.handleError(oError);
	};

	TemplateComponent.prototype.destroy = function() {
		UIComponent.prototype.destroy.apply(this, arguments);
	};

	TemplateComponent.prototype.getRouter = function() {
		if (this.getAppComponent()) {
			return this.getAppComponent().getRouter();
		}
		return UIComponent.prototype.getRouter.apply(this, arguments);
	};

	/**
	 * Method called if this component is activated. <b>Note</b>: This method is not called if the component is newly created. Example code:
	 * 
	 * <pre><code>
	 * if (this.getIsRefreshRequired()) {
	 * 	sap.ui.generic.template.TemplateComponent.prototype.onActivate.apply(this, arguments);
	 * 	// do refresh
	 * }
	 * </code></pre>
	 * 
	 * @protected
	 */
	TemplateComponent.prototype.onActivate = function() {
		this.setIsRefreshRequired(false);
	};

	/**
	 * Method called if this component is deactivated.
	 * 
	 * @protected
	 */
	TemplateComponent.prototype.onDeactivate = function() {
	};

	return TemplateComponent;

}, /* bExport= */true);
