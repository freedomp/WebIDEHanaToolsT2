jQuery.sap.require("sap.ui.generic.template.TemplateComponent");
jQuery.sap.require("sap.suite.ui.generic.template.library");
jQuery.sap.declare("sap.suite.ui.generic.template.lib.TemplateComponent");

jQuery.sap.require("sap.ui.core.CustomizingConfiguration");
(function() {
	//monkey patch the sap.ui.core.CustomizingConfiguration
	//as UI5 doesn't support viewExtensions for nested components we replace the component in vObject
	//with the parent component. The getAppComponent function comes from the component property appComponent
	//in sap.ui.generic.template.TemplateComponent.js
	var fOriginal = sap.ui.core.CustomizingConfiguration.getViewExtension;
	sap.ui.core.CustomizingConfiguration.getViewExtension = function(sViewName, sExtensionPointName, vObject) {
		// check whether a context is given and determine a componentId from it
		// - either it is a string, then this is the pre-processor use case and the string is a component id
		// - or it is a view or fragment and the Id of the owner component should be used
		var sComponentId = vObject && typeof vObject === "string" ? vObject : (vObject && sap.ui.core.Component.getOwnerIdFor(vObject));
		// retrieve the component (if an Id is known)
		var oComponent = sComponentId && sap.ui.component(sComponentId);
		// only when it inherits from TemplateComponent, ask for the AppComponent instead
		if (oComponent instanceof sap.suite.ui.generic.template.lib.TemplateComponent) {
			vObject = oComponent.getAppComponent().getId();
		}
		var oResultConfig = fOriginal(sViewName, sExtensionPointName, vObject);
		return oResultConfig;
	};

	// monkey patch for controller extension
	var fOriginal2 = sap.ui.core.CustomizingConfiguration.getControllerExtension;

	sap.ui.core.CustomizingConfiguration.getControllerExtension = function(sControllerName, sComponentID) {
		var oComponent = null;
		if (sComponentID) {
			oComponent = sap.ui.component(sComponentID);
			if (oComponent instanceof sap.suite.ui.generic.template.lib.TemplateComponent) {
				oComponent = oComponent.getAppComponent();
				if (oComponent) {
					sComponentID = oComponent.getId();
				}
			}
		}
		var oResultConfig = fOriginal2(sControllerName, sComponentID);
		return oResultConfig;
	};
})();

sap.ui.generic.template.TemplateComponent.extend("sap.suite.ui.generic.template.lib.TemplateComponent", {

	metadata: {
		library: "sap.suite.ui.generic.template",
		properties: {
			"isLeaf": {
				"type": "boolean"
			},
			preventBinding: {
				type: "boolean",
				defaultValue: true
			}
		}
	},

	getCreateMode: function (sBindingPath) {
		"use strict";
		var oEntity;
		var oModel = this.getModel();

		if (sBindingPath) {
			if (oModel) {
				oEntity = oModel.getProperty(sBindingPath);
			}
		} else {
			var oContext = this.getBindingContext();
			if (oContext){
				oEntity = oContext.getObject();
			}
		}

		if (oEntity && oEntity.__metadata && oEntity.__metadata.created) {
			// workaround until ODataModel provides method
			return true;
		}
		return false;
	},

	init: function () {
		"use strict";

		sap.ui.generic.template.TemplateComponent.prototype.init.apply(this, arguments);

		var oUIModel = new sap.ui.model.json.JSONModel({
			editable: false,
			enabled: false
		});
		this.setModel(oUIModel, "ui");
	},

	getEntityType: function () {
		"use strict";

		var oMetaModel = this.getModel().getMetaModel();
		var oEntitySet = oMetaModel.getODataEntitySet(this.getEntitySet(), false);
		var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType, false);
		return oEntityType.name;
	},

	bindComponent: function () {
		"use strict";

		var oParameter = {};
		if (this._sBindingPath) {
			var oComponentContainer = this.getComponentContainer();
			if (oComponentContainer) {
				if (this.getCreateMode(this._sBindingPath)) {
					oComponentContainer.unbindElement();
					oComponentContainer.setBindingContext(oComponentContainer.getModel().getContext(this._sBindingPath));
				} else {
					var oComponentData = this.getComponentData();
					if (oComponentData && oComponentData.preprocessorsData && oComponentData.preprocessorsData.rootContextExpand && oComponentData.preprocessorsData.rootContextExpand.length) {
						oParameter.expand = oComponentData.preprocessorsData.rootContextExpand.join(",");
					}
					oComponentContainer.bindElement({
						path: this._sBindingPath,
						parameters: oParameter,
						batchGroupId: "Changes",  // get navigation controller constant?
						changeSetId: "Changes"
					});
				}
			}
		}
	},

	onActivate: function (sBindingPath) {
		"use strict";

		this._sBindingPath = sBindingPath;

		var oComponentContainer = this.getComponentContainer();
		if (oComponentContainer && oComponentContainer.getElementBinding()) {
			// unbind element to avoid that old data is shown
			oComponentContainer.unbindElement();

			// set the UI model to not editable / enabled as long as the binding data is read
			this.getModel("ui").setProperty("/enabled", false);
			this.getModel("ui").setProperty("/editable", false);
		}

		if (this.getAggregation("rootControl")) {
			// root control is already created - do the binding
			this.bindComponent();
		}

		if (this.getIsRefreshRequired()) {
			this.refreshBinding();
			this.setIsRefreshRequired(false);
		}
	},

	refreshBinding: function () {
		"use strict";

		// default implementation: refresh element binding
		var oElementBinding = this.getComponentContainer().getElementBinding();
		if (oElementBinding) {
			oElementBinding.refresh();
		}
	}

});
