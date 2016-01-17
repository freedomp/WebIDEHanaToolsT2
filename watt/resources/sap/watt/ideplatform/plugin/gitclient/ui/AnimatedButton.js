jQuery.sap.declare("sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton");

sap.ui.core.Control.extend("sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton", {
	metadata: {
		properties: {
			tooltip: "string",
			enabled: "boolean",
			wait: "boolean",
			text: "string",
			waitingText: "string",
			icon: "sap.ui.core.URI",
			visible: {
				type: "boolean",
				defaultValue: true
			}
		},
		events: {
			press: {}
		}
	},

	ondragstart: function(oEvent) {
		oEvent.preventDefault();
	},

	setWait: function(bWait) {
		this.setProperty("wait", bWait, true);
		if (this.getDomRef()) {
			this.$().toggleClass("gitPaneWaitButtonWait", this.getWait()).toggleClass("gitPaneWaitButtonActive", !this.getWait());
			this.$("txt").text((this.getWait() ? this.getWaitingText() : this.getText()) || "");
		}
		return this;
	},

	onclick: function() {
		if (!this.getWait() && this.getEnabled()) {
			this.firePress();
		}
	},

	renderer: function(rm, ctrl) {
		if (!ctrl.getVisible()) {
			return;
		}
		rm.write("<div");
		rm.writeControlData(ctrl);
		rm.addClass("gitPaneWaitButton");
		if (sap.ui.getCore().getConfiguration().getAnimation()) {
			rm.addClass("gitPaneWaitButtonAnim");
		}
		rm.addClass(ctrl.getWait() ? "gitPaneWaitButtonWait" : "gitPaneWaitButtonActive");
		rm.addClass(!ctrl.getEnabled() ? "gitPaneWaitButtonDisabled" : "");
		rm.writeClasses();
		rm.writeAttribute("title", ctrl.getTooltip());
		rm.write("><div class='gitPaneWaitButtonAnimCont'>");
		rm.write("<div class='gitPaneWaitButtonAnimCont1'><div></div></div>");
		rm.write("<div class='gitPaneWaitButtonAnimCont2'><div></div></div>");
		rm.write("</div><a href='javascript:void(0);' class='gitPaneWaitButtonCircle' tabindex='0'>");
		rm.writeIcon(ctrl.getIcon());
		rm.write("</a><div class='gitPaneWaitButtonTxt' id='", ctrl.getId(), "-txt'>");
		rm.writeEscaped((ctrl.getWait() ? ctrl.getWaitingText() : ctrl.getText()) || "");
		rm.write("</div></div>");
	}
});