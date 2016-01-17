/**
 * Creates and displays a simple message toast notification message with the given text, and optionally other options.
 *
 * The only mandatory parameter is <code>sMessage</code>.
 *
 * @param {string} sMessage The message to be displayed.
 * @param {object} [mOptions] Optionally other options.
 * @param {int} [mOptions.duration=3000] Time in milliseconds before the close animation starts. Needs to be a finite positive nonzero integer.
 * @param {sap.ui.core.CSSSize} [mOptions.width='15em'] The width of the message toast, this value can be provided in %, em, px and all possible CSS measures.
 * @param {sap.ui.core.Popup.Dock} [mOptions.my='center_bottom'] Specifies which point of the message toast should be aligned.
 * @param {sap.ui.core.Popup.Dock} [mOptions.at='center_bottom'] Specifies the point of the reference element to which the message toast should be aligned.
 * @param {sap.ui.core.Control|Element|jQuery|Window|undefined} [mOptions.of=window] Specifies the reference element to which the message toast should be aligned, by default it is aligned to the browser visual viewport.
 * @param {string} [mOptions.offset='0_0'] The offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the message toast 10 pixels to the right).
 * @param {string} [mOptions.collision='fit_fit'] Specifies how the position of the message toast should be adjusted in case it overflows the screen in some direction. Possible values “fit”, “flip”, “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none".
 * @param {function} [mOptions.onClose=null] Function to be called when the message toast closes.
 * @param {boolean} [mOptions.autoClose=true] Specify whether the message toast should close as soon as the end user touches the screen.
 * @param {string} [mOptions.animationTimingFunction='ease'] Describes how the close animation will progress. Possible values "ease", "linear", "ease-in", "ease-out", "ease-in-out". This feature is not supported in android and ie9 browsers.
 * @param {int} [mOptions.animationDuration=1000] Time in milliseconds that the close animation takes to complete. Needs to be a finite positive integer. For not animation set to 0. This feature is not supported in android and ie9 browsers.
 *
 * @type void
 * @public
 * @name sap.m.MessageToast.show
 * @function
 */