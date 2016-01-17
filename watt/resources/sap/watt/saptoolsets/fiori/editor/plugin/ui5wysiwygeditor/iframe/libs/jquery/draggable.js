/*!
 * @copyright@
 */

/**
 * Our jQuery Plugin to handle D&D events and delegate the event handler to a config object (in WYSIWYG case this is the DragManager).
 */
(function($, undefined) {
	"use strict";
	$.fn.draggable = function(options) {
		var method = String(options);
		options = $.extend({
			drag: null,
			start: null,
			stop: null,
			cursor: "move",
			helper: true,
			callee: this
		}, options);

		var windowMousemove = function(e) {
				onDragStop(e);
			};

		function getWysiwygWindow() {
			var oIFrame = jQuery(".sapWysiwygIframe").get(0);
			return oIFrame ? oIFrame.contentWindow : null;
		}

		function onDragStart(e) {
			var oWindow = getWysiwygWindow();
			if (oWindow) {
				oWindow.removeEventListener("mousemove", windowMousemove, true);
				oWindow.addEventListener("mousemove", windowMousemove, true);
			}
			e.stopPropagation();
			/*jshint validthis:true */
			var $this = $(this);

			var dT = (window._uiTestEvent && window._uiTestEvent.dataTransfer) || (e.originalEvent && e.originalEvent.dataTransfer);
			if (dT) {
				dT.effectAllowed = options.cursor;
				dT.setData("Text", "I'm sorry, Dave. I'm afraid I can't do that.");
			}
			if (options.helper) {
				setTimeout(function() {
					$this.hide();
				});
			}
			if (options.start) {
				options.start.call(options.callee, e.originalEvent);
			}
		}

		function onDragStop(e) {
			var oWindow = getWysiwygWindow();
			if (oWindow) {
				oWindow.removeEventListener("mousemove", windowMousemove, true);
			}
			/*jshint validthis:true */
			e.stopPropagation();
			var $this = $(this);
			if (options.stop) {
				options.stop.call(options.callee, e.originalEvent);
			}
		}

		function onDrag(e) {
			/*jshint validthis:true */
			e.stopPropagation();
			if (options.drag) {
				options.drag.call(options.callee, e.originalEvent || e);
			}
		}

		function onDragOver(e) {
			e.preventDefault();
			return false;
		}


		function setEvents($this) {
			$this.attr("draggable", "true")
				.on("dragstart", onDragStart)
				.on("dragend", onDragStop)
				.on("drag", onDrag);
		}



		function stylePropertiesToText(props) {
			var cssTxt = "";

			$.each(props, function(prop, val) {
				cssTxt += prop + ":" + val + "; ";
			});

			return cssTxt;
		}

		return this.each(function() {
			var $this = $(this);
			if (/^enable|disable|destroy$/.test(method)) {
				$this.attr("draggable", method == "enable");
				if (method == "destroy") {
					$this.off("dragstart dragend dragover drag");
					$this.removeAttr("draggable");
				} else if (method == "enable") {
					setEvents($this);
				}
				return;
			}
			$this.off("dragstart dragend dragover drag");
			setEvents($this);
		});
	};
})(jQuery);