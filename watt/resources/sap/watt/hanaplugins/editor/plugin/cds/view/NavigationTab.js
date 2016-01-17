/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/ux3/NavigationBar", "sap/ui/ux3/NavigationBarRenderer"], function(NavigationBar, NavigationBarRenderer) {

	var NavigationTab = NavigationBar.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.NavigationTab", {

		metadata: {
			aggregations: {
				"icon": {
					type: "sap.ui.commons.Image",
					multiple: false,
					visibility: "public"
				}
			}
		},
		renderer: {
			render: function(oRm, oControl) {
				oRm.write("<div style='float:left'>");
				oRm.renderControl(oControl.getIcon());
				oRm.write("</div>");
				oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0;height: 100%;'>");
				NavigationBarRenderer.render(oRm, oControl);
				oRm.write("</div>");
				oRm.write("<div style='clear:left'></div>");

				var I = oControl.getItems();
				var a = I.length;
				var n = false;
				if (!I || I.length == 0) {
					I = oControl.getAssociatedItems();
					n = true;
				}
				for (var i = 0; i < a; i++) {
					var b = n ? sap.ui.getCore().byId(I[i]) : I[i];
					var li = document.getElementById(b.getId());

					var proxy = b.getIsProxy();
					if (proxy) {
						//    li.classList.add("icon_camera");
					}
				}
			}
		},
		onAfterRendering: function(event) {
			var oControl = event.srcControl;
			var I = oControl.getItems();
			var a = I.length;
			var n = false;
			var x = function() {
				var id = oControl.sId;
				var L = document.getElementById(id + "-list");
				var o = document.getElementById(id + "-ofl");
				var a = document.getElementById(id + "-ofb");
				var ab = document.getElementById(id);
				if ((L != null) && (o != null) && (a != null)) {
					var s = L.scrollLeft;
					var S = false;
					var b = false;
					var r = L.scrollWidth;
					var c = L.clientWidth;
					if (ab.scrollWidth < L.scrollWidth) {
						$('#' + id).addClass("sapUiUx3NavBarScrollForward");
					} else {
						$('#' + id).removeClass("sapUiUx3NavBarScrollForward");

					}
					if (ab.scrollLeft == 0 && L.scrollLeft > 0) {
						$('#' + id + "-ofb").addClass("navigationBIcon");
					} else {
						$('#' + id + "-ofb").removeClass("navigationBIcon");
					}
					// Rigtht forward icon
					if (L.scrollWidth < L.scrollLeft + L.clientWidth + 2) {
						$('#' + id + "-off").addClass("navigationFIcon");
					} else {
						$('#' + id + "-off").removeClass("navigationFIcon");
					}
				}
			};
			$('body').click(x);
			window.onresize = x;
			$(document).ready(function() {
				$("nav").mouseover(x).mouseup(x).mouseout(x).mousemove(x).mousedown(x).mouseenter(x).mouseleave(x);
				$("nav").bind('DOMNodeInserted', x);
				$(".sapUiVerticalSplitterBar").mouseover(x);
				$("img[src$='performance_workbench.png']").mouseover(x).mouseup(x).mouseout(x).mousemove(x).mousedown(x).mouseenter(x).mouseleave(x);
				$("img[src$='close.gif']").mouseover(x).mouseup(x).mouseout(x).mousemove(x).mousedown(x).mouseenter(x).mouseleave(x);
				$(".sapUiVerticalSplitterBar").keydown(function(e) {
					x();
				});
			});
			if (($("#" + oControl.sId + "-list").width()) < ($("#" + oControl.sId).scrollWidth)) {
				x();
			} else {
				x();
			}
			//var myVar = setInterval(x, 100);
			if (!I || I.length == 0) {
				I = oControl.getAssociatedItems();
				n = true;
			}
			for (var i = 0; i < a; i++) {
				var b = n ? sap.ui.getCore().byId(I[i]) : I[i];
				var li = document.getElementById(b.getId());
				var proxy = b.getIsProxy();
				if (proxy) {
					li.classList.add("navigProxy");
				}
			}
		}
	});

	return NavigationTab;

}, true);