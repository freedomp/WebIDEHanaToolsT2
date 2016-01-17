jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.CustomTile");

sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.CustomTile", {
	metadata: {
		aggregations: {
			"title": {
				type: "sap.ui.commons.Label",
				multiple: false
			},
			"subtitle": {
				type: "sap.ui.commons.Label",
				multiple: false
			},
			"icon": {
				type: "sap.ui.commons.Button",
				multiple: false
			},
			"count": {
				type: "sap.ui.commons.Label",
				multiple: false
			},
			"numberunit": {
				type: "sap.ui.commons.Label",
				multiple: false
			}
		}
	},

	renderer: function(rm, ctrl) {
		rm.write("<div");
    		rm.writeControlData(ctrl);
    		rm.writeAttribute("class", "CustomItemLayout");
		    rm.write(">");
    		rm.write("<div");
    		    rm.writeAttribute("class", "CustomItemLayoutInner");
    		    rm.write(">");
		        rm.write("<div");
		            rm.writeAttribute("class", "CustomItemLayoutTitle");
		            rm.write(">");
		            rm.renderControl(ctrl.getTitle());
		        rm.write("</div>");
		        rm.write("<div");
		            rm.writeAttribute("class", "CustomItemLayoutCntnt");
		            rm.write(">");
		            rm.renderControl(ctrl.getSubtitle());
		            rm.renderControl(ctrl.getIcon());
		            //rm.renderControl(ctrl.getCount());
		            //rm.renderControl(ctrl.getNumberunit());
		        rm.write("</div>");
		    rm.write("</div>");
		rm.write("</div>");
	},

	onBeforeRendering: function() {
		if (this.resizeTimer) {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = null;
		}
	},

	onAfterRendering: function() {
		var $This = this.$();
		if ($This.parent().parent().hasClass("sapUiUx3DSSVSingleRow")) {
			this._resize();
		} else {
			$This.addClass("CustomItemLayoutSmall");
		}
	},

	_resize: function() {
		if (!this.getDomRef()) {
			return;
		}
		var $This = this.$();
		if ($This.outerWidth() >= 440) {
			$This.removeClass("CustomItemLayoutSmall").addClass("CustomItemLayoutLarge");
		} else {
			$This.removeClass("CustomItemLayoutLarge").addClass("CustomItemLayoutSmall");
		}
		setTimeout(jQuery.proxy(this._resize, this), 300);
	}
});
