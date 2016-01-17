sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";
	return Control.extend("sap.ovp.cards.charts.AggregateNumber", {
		metadata : {
			aggregations : {
				singleton : {
					type : "sap.ui.core.Element"
				},
				content : {
					multiple : false
				}
			}
		},
		renderer : function(r, c) {
			r.write("<div");
			r.writeElementData(c);
			r.writeClasses();
			r.write(">");
			if (c.getContent()) {
				r.renderControl(c.getContent());
			}
			r.write("</div>");
		},

		updateBindingContext : function() {
			var binding = this.getBinding("singleton");
			if (binding) {
				var that = this;
				binding.attachEventOnce("dataReceived", function() {
					that.getContent().setBindingContext(this.getContexts()[0]);
				});
			}
			Control.prototype.updateBindingContext.apply(this, arguments);
		}
	});
}, true);
