define([], function() {
	"use strict";

	sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.welcomescreen/ui/css/welcomescreen.css"));

	sap.ui.commons.Button.extend("sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile", {
		metadata: {
			properties: {
				"title": {
					type: "string",
					multiple: false
				},
				"icon": {
					type: "string",
					multiple: false
				}
			},
			aggregations: {
				"textView": {
					type: "sap.ui.commons.Label",
					multiple: false
				},
				"iconControl": {
					type: "sap.ui.core.Icon",
					multiple: false
				}
			}
		},

		init: function() {
			this.setAggregation("iconControl", new sap.ui.core.Icon({
				src: ""
			}));

			this.setAggregation("textView", new sap.ui.commons.Label({
				text: "",
				wrapping: true
			}));
		},

		setTitle: function(sTitle) {
			this.setAggregation("textView", new sap.ui.commons.Label({
				text: sTitle,
				wrapping: true,
				textAlign: "Center"
			}));
		},

		attachPress : function (oData, fnFunction, oListener) {
			// Need to check oData type, as it is optional
			if(typeof(oData) === "function" && oListener === undefined) {
				oListener = fnFunction;
				fnFunction = oData;
				oData = undefined;
			}

			var that = this;
			// wrap the event handler in a function that disables the control while executing handler
			var fnWrapper = function (oEvent) {
				if (that.getEnabled() === true) {
					that.setEnabled(false);
					fnFunction(oEvent);
					// prevent double click by delaying reactivation of tile
					setTimeout(function () {
						that.setEnabled(true);
					}, 500);
				}
			};

			this.attachEvent("press", oData, fnWrapper, oListener);
			return this;
		},

		// in case the DOM event of double click is fired, shut it down
		ondblclick : function (oEvent) {
			oEvent.stopImmediatePropagation();
			oEvent.preventDefault();
			oEvent.cancelBubble = true;
			return false;
		},

		getTitle: function() {
			return this.getTextView().getText();
		},

		setIcon: function(sIconUrl) {
			this.setAggregation("iconControl", new sap.ui.core.Icon({
				src: sIconUrl,
				height: "100%",
				width: "100%",
				useIconTooltip: false
			}));
		},

		getIcon: function() {
			return this.getIconControl().getSrc();
		},

		renderer: function(rm, ctrl) {
			rm.write("<div");
			rm.writeControlData(ctrl);
			rm.write("><div");
			rm.writeClasses(ctrl);
			rm.write("><div");
			rm.writeAttribute("class", "welcomeTileDiv");
			rm.writeAttribute("tabindex", "0");
			rm.write(">");
			rm.write("<div");
			rm.writeAttribute("class", "welcomeTileIcon");
			rm.write(">");
			rm.renderControl(ctrl.getIconControl());
			rm.write("</div>");
			rm.write("<div");
			rm.writeAttribute("class", "welcomeTileLabel");
			rm.write(">");
			rm.renderControl(ctrl.getTextView());
			rm.write("</div></div></div></div>");
		}
	});
});