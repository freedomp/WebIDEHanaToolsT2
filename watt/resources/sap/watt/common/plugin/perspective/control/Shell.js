(function() {
	"use strict";
	jQuery.sap.declare("sap.watt.common.plugin.perspective.control.Shell");

	sap.ui.core.Control.extend("sap.watt.common.plugin.perspective.control.Shell", {

		metadata : {

			aggregations : {
				"content" : {
					type : "sap.ui.core.Control"
				}
			}

		},

		renderer : function(rm, oControl) {

			rm.write("<div");
			rm.writeControlData(oControl);
			rm.write(">");

			//content area
			rm.write('<div');
			rm.addClass("perspectiveContent");
			rm.writeClasses();
			rm.write('>');

			// main content
			var aContent = oControl.getContent();
			for ( var i = 0; i < aContent.length; i++) {
				rm.renderControl(aContent[i]);
			}
			rm.write("</div>");
			rm.write("</div>");
		}

	});
}());