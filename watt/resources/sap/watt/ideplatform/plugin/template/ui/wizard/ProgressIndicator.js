jQuery.sap.declare("sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator");

sap.ui.core.Control.extend("sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator", {

	_bAnimating : false,
	_bError : false,

	startAnimation : function() {
		this._bAnimating = true;
		$("#" + this.sId + "progressBarInner1").show().addClass("animate");
		$("#" + this.sId + "progressBarInner2").show().addClass("animate2");
	},

	stopAnimation : function() {
		this._bAnimating = false;
		$("#" + this.sId + "progressBarInner1").hide().removeClass("animate");
		$("#" + this.sId + "progressBarInner2").hide().removeClass("animate2");
	},

	changeStyleClass : function(sErr) {
		this.addStyleClass("spacer05 errorlineTop");
		this.removeStyleClass("spacer05 lineTop");
	},

	setErrorStatus : function(bErrorStatus) {
		this._bError = bErrorStatus;
		var oProgressBarInner1 = document.getElementById(this.getId() + "progressBarInner1");
		if (oProgressBarInner1) {
			oProgressBarInner1.parentElement.className = (bErrorStatus) ? "spacer05 errorlineTop" : "spacer05 lineTop";
		}

	},

	renderer : function(oRm, oControl) {
		if (oControl._bError) {
			oRm.write("<div class=\"spacer05 errorlineTop\">");
		} else {
			oRm.write("<div class=\"spacer05 lineTop\">");
		}

		oRm.write("<div class=\"progressBarInner1\" id=\"" + oControl.sId + "progressBarInner1\" style=\"display: none;\">");
		oRm.write("</div>");

		oRm.write("<div class=\"progressBarInner2\" id=\"" + oControl.sId + "progressBarInner2\" style=\"display: none;\">");
		oRm.write("</div>");

		oRm.write("</div>");
	},

	onAfterRendering : function() {
		if (this._bAnimating) {
			this.startAnimation();
		} else {
			this.stopAnimation();
		}
	}

});