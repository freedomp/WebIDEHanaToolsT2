jQuery.sap.declare("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.ui.core.Control.extend("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent", {

	_bI18nAlreadySet : false,
	
	metadata : {
		properties : {
			"context" : "object",
			"contentHeight" : "string"
		},
		aggregations : {
			"content" : {
				singularName : "content"
			}
		// default type is control!
		},
		events : {
			"valueChange" : {},
			"validation" : {},
			"processingStarted" : {},
			"processingEnded" : {}
		}
	},

	cleanStep : function() {

	},

	renderer : function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeStyles();
		oRm.addClass("wizardStepContent");
		oRm.writeClasses();
		if (oControl.getContentHeight() !== undefined) {
			oRm.addStyle("height", oControl.getContentHeight());
			oRm.addStyle("overflow-y", "auto");
			oRm.addStyle("overflow-x", "hidden");
			oRm.writeStyles();
		}
		oRm.write(">");
		var aContent = oControl.getContent();
		if (aContent) {
		   for ( var i = 0, l = aContent.length; i < l; i++) {
			    oRm.renderControl(aContent[i]);
		    }
		}
		oRm.write("</div>");
	},

	markAsValid : function(oControl) {
		oControl.removeStyleClass("inputError");
		oControl.addStyleClass("inputConfirmed");

		var $This = jQuery("#" + oControl.getId());

		$This.animate({
			opacity : "1"
		}, 2000, function() {
			oControl.removeStyleClass("inputConfirmed");
		});
	},

	markAsInvalid : function(oControl) {
		oControl.removeStyleClass("inputConfirmed");
		oControl.addStyleClass("inputError");
	},

	clearValidationMarks : function(oControl) {
		oControl.removeStyleClass("inputConfirmed");
		oControl.removeStyleClass("inputError");
	},

	onBeforeRendering : function() {
		if (!this._bI18nAlreadySet) {
			this._bI18nAlreadySet = this.configureI18nResources();
		}
	},

	configureI18nResources : function(mAdditionalResources) {
		if (this.getContext() && this.getContext().i18n) {
			var mBundles = this.getContext().i18n.bundles;
			for ( var sBundle in mBundles) {
				var oModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl : mBundles[sBundle],
					bundleLocale : this.getContext().i18n.locale
				});
				if (mAdditionalResources !== undefined && mAdditionalResources[sBundle] !== undefined) {
					oModel.enhance(mAdditionalResources[sBundle].oData);
				}
				this.setModel(oModel, sBundle);
			}
			return true;
		}
		return false;
	},

	_isOnScreen : function() {
		var currentStep = this.getDomRef();
		var docViewTop = jQuery(window).scrollTop();
		var docViewBottom = docViewTop + jQuery(window).height();

		var elemTop = jQuery(currentStep).offset().top;
		var elemBottom = elemTop + jQuery(currentStep).height();

		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}

});
