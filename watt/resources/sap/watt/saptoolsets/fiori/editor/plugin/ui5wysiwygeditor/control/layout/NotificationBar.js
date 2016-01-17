define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar");

// Private variables and methods
// Begin
		var

			/**
			 * The ID of the last automatically close timer if any
			 *
			 * @type {number}
			 * @private
			 */
			_iTimeoutId = null;


		/**
		 * Setter for property autoClose.
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar} oNotificationBar context
		 *
		 * @name _autoClose
		 * @function
		 * @private
		 */
		function _autoClose(oNotificationBar) {
			if (_iTimeoutId) {
				clearTimeout(_iTimeoutId);
			}
			_iTimeoutId = setTimeout(function () {
				oNotificationBar.$().fadeOut("slow", function () {
					oNotificationBar.removeStyleClass("notificationBarVisible");
					jQuery(this).css("display", ""); //remove the side effect of "fadeOut" animation
				});
			}, oNotificationBar.getAutoCloseDelay());
		}

		/**
		 * Checks if the given arrays are equal.
		 * This function helps to prevent unnecessary renderings.
		 * We need to update messages only if at least one message has been changed.
		 * Any "empty" (undefined, null, "") message will rendered as an empty string, so
		 * [], null, ["", null] etc will be "equals".
		 *
		 * In other words the function returns false if at least one "non empty" message from one of the given array
		 * won't be equal to appropriate message from another array (NXOR logic)
		 *
		 * @param {Array<string>=} newMessages
		 * @param {Array<string>=} oldMessages
		 * @return {boolean} Returns true if the given arrays are equal
		 *
		 * @name _isEqual
		 * @function
		 * @private
		 */
		function _isEqual(newMessages, oldMessages) {
			newMessages = newMessages || [];
			oldMessages = oldMessages || [];
			for (var iIndex = 0; iIndex < 2; iIndex++) {
				if ((newMessages[iIndex] || "") !== (oldMessages[iIndex] || "")) {
					return false;
				}
			}
			return true;
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new NotificationBar.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG notification bar control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar
		 */
		var NotificationBar = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar.prototype */ {
			metadata: {
				properties: {
					/**
					 * How long to wait before automatically close / hide this control.
					 */
					"autoCloseDelay": {"type": "number", "group": "Data", "defaultValue": 6000},

					/**
					 * An array of notification bar messages. Notification bar shows only first two messages.
					 */
					"messages": {"type": "string[]", "group": "Data", "defaultValue": null}
				}
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				var aMessages = oControl.getMessages() || [];

				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("notificationBar");
				oRm.writeClasses();
				oRm.write(">");

				createLine("TopLine", aMessages[0] || "");
				createLine("BottomLine", aMessages[1] || "");

				oRm.write("</div>");

				function createLine(sName, sText) {
					oRm.write("<div");
					oRm.addClass("notificationBar" + sName);
					oRm.addClass("sapUiLblNowrap");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write(sText);
					oRm.write("</div>");
				}
			}
		});

		/**
		 * Setter for property messages.
		 *
		 * @param {Array<string>} aMessages property value
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar#setMessages
		 * @function
		 * @public
		 */
		NotificationBar.prototype.setMessages = function (aMessages) {
			jQuery.sap.assert(aMessages == null || jQuery.isArray(aMessages), "aMessages must be null or an array");

			aMessages = aMessages || [];
			if (_isEqual(aMessages, this.getMessages())) {
				return this;
			}

			var oDomRef = this.getDomRef();
			//suppress rerendering if dom element exists
			this.setProperty("messages", aMessages, !!oDomRef);
			if (_iTimeoutId) {
				clearTimeout(_iTimeoutId);
				_iTimeoutId = null;
			}

			var bVisible = this.hasStyleClass("notificationBarVisible"),
				bHide = !aMessages[0] && !aMessages[1];

			if (oDomRef) {
				jQuery(oDomRef).children().each(function(iIndex) {
					jQuery(this).html(aMessages[iIndex] || "");
				});
			}
			if (bVisible === bHide) {
				this.toggleStyleClass("notificationBarVisible");
			}
			return this;
		};

		/**
		 * Update the message area controls according to the relevant operation given by user events
		 *
		 * @param {string=} sLine1 - The message which appears in the first line of the notification bar
		 * @param {string=} sLine2 - The message which appears in the second line of the notification bar
		 * @param {boolean=} bAutoClose - indication if the notification bar should be automatically closed or not
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.NotificationBar#updateMessageArea
		 * @function
		 * @public
		 */
		NotificationBar.prototype.updateMessageArea = function (sLine1, sLine2, bAutoClose) {
			this.setMessages([sLine1, sLine2]);

			if (bAutoClose && (sLine1 || sLine2)) {
				_autoClose(this);
			}
		};

		return NotificationBar;
	}
);