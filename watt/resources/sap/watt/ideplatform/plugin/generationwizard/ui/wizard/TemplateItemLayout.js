jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout");

sap.ui.core.Control.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout", {
	metadata: {
		aggregations: {
			"tileText": {
				type: "sap.ui.commons.TextView",
				multiple: false
			},
			"button": {
				type: "sap.ui.commons.Button",
				multiple: true
			}
		}
	},

	onBeforeRendering: function() {
		var obtn = this.getAggregation("button");
		if (obtn !== null) {
			obtn.onclick = function(e) {};
		}
	},

	renderer: function(rm, ctrl) {

		var oFavBtn, oTemplateImageBtn;
		// if the first button has unfavorite or favorite icon then the second button is the template image
		var bFavBun = (ctrl.getButton()[0].getProperty('icon') === "sap-icon://watt/unfavorite" || ctrl.getButton()[0].getProperty('icon') ===
			"sap-icon://watt/favorite") ? true : false;

		if (bFavBun) {
			oFavBtn = ctrl.getButton()[0];
			oTemplateImageBtn = ctrl.getButton()[1];
		} else {
			oTemplateImageBtn = ctrl.getButton()[0];
		}

		if (oFavBtn) {
			oFavBtn.title = "";
			oFavBtn.addStyleClass("favoriteButton");
		}

		rm.write("<div");
		rm.writeControlData(ctrl);
		rm.write("><div");
		rm.write("><div");
		rm.writeAttribute("class", "wizardTileDiv");
		rm.writeAttribute("tabindex", "0");
		rm.write(">");
		if (bFavBun) {
			rm.write("<div");
			rm.writeAttribute("style", "position: absolute");
			rm.write(">");
			rm.renderControl(oFavBtn);
			rm.write("</div>");
		}
		rm.write("<div");
		rm.writeAttribute("class", "wizardImageDiv");
		rm.write(">");
		rm.renderControl(oTemplateImageBtn);
		rm.write("</div>");
		rm.write("<div>");
		rm.renderControl(ctrl.getTileText());
		rm.write("</div></div><div");
		rm.writeAttribute("class", "CustomItemLayoutCntnt");
		rm.write(">");
		rm.write("</div></div></div>");
	}
});