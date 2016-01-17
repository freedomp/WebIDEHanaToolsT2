define(
	[
		"sap/watt/common/plugin/platform/service/ui/AbstractPart"
	],
	function (AbstractPart) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * The dialog id
			 *
			 * @const
			 * @type {string}
			 * @private
			 */
			DIALOG_ID = "dialogProgressLoading",

			/**
			 * The default loading text
			 *
			 * @type {string}
			 * @private
			 */
			_sDefaultMessage = "",

			/**
			 * The current progress message
			 *
			 * @type {string}
			 * @private
			 */
			_sCurrentMessage = "";
// End
// Private variables and methods

		/**
		 * DialogProgress service
		 * @extends sap.watt.common.service.ui.Part
		 */
		var DialogProgress = AbstractPart.extend("sap.watt.platform.plugin.progress.service.DialogProgress", {
// Service Methods
// Begin
			/**
			 * Sets service configuration
			 *
			 * @param {object} mConfig configuration object
			 *
			 * @name configure
			 * @function
			 * @public
			 */
			configure: function (mConfig) {
				this._aStyles = mConfig.styles;
			},

			/**
			 * Initializes the service
			 *
			 * @name init
			 * @function
			 * @public
			 */
			init: function () {
				_sCurrentMessage = _sDefaultMessage = this.context.i18n.getText("wait_message");
			},

			/**
			 * Shows the progress dialog with the given text.
			 *
			 * @param {string|boolean=} sMessage display message.
			 * @param {boolean=} bOnlyOverlay whether to show only overlay layer.
			 * This parameter will be ignored if <code>sMessage</code> is boolean
			 *
			 * @name show
			 * @function
			 * @public
			 */
			show: function (sMessage, bOnlyOverlay) {
				if (typeof sMessage === "boolean") {
					bOnlyOverlay = sMessage;
					sMessage = null;
				}
				_sCurrentMessage = sMessage || _sDefaultMessage;

				var that = this;
				return this.context.service.resource.includeStyles(this._aStyles).then(function () {
					if (that._isLoaded()) {
						jQuery("body").addClass("screenBlocker");

						if (!bOnlyOverlay) {
							that._getDialog(0).show();
						}
					}
				});
			},

			/**
			 * Updates the progress dialog using the given value and text
			 *
			 * @param {number=} iValue progress value
			 * @param {string=} sMessage display message
			 * @return {Q}
			 *
			 * @name setProgress
			 * @function
			 * @public
			 */
			setProgress: function (iValue, sMessage) {
				if (this._isLoaded() && jQuery("body").hasClass("screenBlocker")) {
					if (sMessage) {
						_sCurrentMessage = sMessage;
					}
					this._getDialog(iValue || 0);
				}
			},

			/**
			 * Hides the progress dialog
			 *
			 * @name hide
			 * @function
			 * @public
			 */
			hide: function () {
				jQuery("#" + DIALOG_ID).remove();
				jQuery("body").removeClass("screenBlocker");
			},
// End
// Service Methods

// Private Methods
// Begin
			/**
			 * Gets the dialog root element as jQuery object.
			 * Updates progress value.
			 *
			 * @param {number=} iValue progress value
			 * @returns {JQuery} Returns the dialog root DOM node wrapped as jQuery object
			 *
			 * @name _getDialog
			 * @function
			 * @private
			 */
			_getDialog: function (iValue) {
				var oDialog = jQuery("#" + DIALOG_ID);
				if (!oDialog.length) {
					oDialog = jQuery("<div/>")
						.attr("id", DIALOG_ID)
						.addClass("sapUiDlg")
						.appendTo("body");
					jQuery("<div/>")
						.appendTo(oDialog);
					jQuery("<progress/>")
						.attr("max", "100")
						.attr("value", "0")
						.appendTo(oDialog);
				}

				iValue = iValue || 0;
				oDialog.find("div")
					.text(_sCurrentMessage);
				oDialog.find("progress")
					.attr("value", iValue)
					.html(iValue);
				return oDialog;
			},

			/**
			 * Checks if WEB IDE has been loaded
			 *
			 * @return {boolean} Returns true if WEB IDE has been loaded
			 *
			 * @name _isLoaded
			 * @function
			 * @private
			 */
			_isLoaded: function () {
				var oLoading = jQuery("#loading");
				return oLoading.length === 0 || oLoading.css("display") === "none";
			},

			/**
			 * Returns the progress dialog id
			 *
			 * @return {string} progress dialog id
			 *
			 * @name _getDialogId
			 * @function
			 * @private
			 */
			_getDialogId: function () {
				return DIALOG_ID;
			}
// End
// Private Methods
		});

		return DialogProgress;
	}
)
;