define(
	function () {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath");
		jQuery.sap.require("sap.ui.unified.MenuItem");
// Private variables and methods
// Begin
		var
			/**
			 * The calculated width of SelectionPath control. Used to prevent extra rendering on resize
			 *
			 * @type {number}
			 */
			_iWidth,

			/**
			 * Menu control. Used to show the hidden path parts
			 *
			 * @type {sap.ui.unified.Menu}
			 */
			_oMenu,

			/**
			 * ResizeHandler registration ID which can be used for deregistering
			 *
			 * @type {string}
			 */
			_sResizeListenerId,

			/**
			 * The ID of the last resize timer if any
			 *
			 * @type {string}
			 */
			_sResizeTimeout,

			/**
			 * SelectionPath data model
			 *
			 * @type {sap.ui.model.json.JSONModel}
			 * @private
			 */
			_oModel = new sap.ui.model.json.JSONModel({
				path: []
			});

		/**
		 * Selection path control
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath}
		 *
		 * @name _onResize
		 * @function
		 * @private
		 */
		function _onResize() {
			_closePopup();

			var $ref = this.$(),
				bTimer = _iWidth && $ref.width() !== _iWidth;

			_iWidth = $ref.width();
			if (bTimer) { //If the width has changed, call on resize after a delay
				_sResizeTimeout = jQuery.sap.delayedCall(100, this, _onResize);
				return;
			}
			if (_sResizeTimeout) { //When the width has not changes ("stable") - stop the delayed call
				jQuery.sap.clearDelayedCall(_sResizeTimeout);
				_sResizeTimeout = null;
			}
			if (!_iWidth) {
				return;
			}

			var oRef = this.getDomRef(),
				$children = $ref.children(),
				iLen = $children.length,
				iIndex = 0;

			$children.show(); //Turns all the selection path children visible
			$children.eq(0).hide(); //Hide the link to the menu

			//Hide all menu items
			jQuery.each(this.getPath() || [], function (iInd) {
				_oModel.setProperty("/path/" + iInd + "/visible", false);
			});

			// Reorganize items when overflow happens. Hide the first visible item each time if
			// width of visible path elements is bigger than the parent container (oRef.clientWidth < oRef.scrollWidth)
			// or visible path elements occupy more than one row (oRef.clientHeight < oRef.scrollHeight).
			// Adds 1px to client width/height to avoid browser rounding inaccuracy
			while ((oRef.clientWidth + 1 < oRef.scrollWidth || oRef.clientHeight + 1 < oRef.scrollHeight) && (iLen > 1)) {
				$children.eq(0).show();

				//Mark the items that should be visible in the menu
				_oModel.setProperty("/path/" + iIndex + "/visible", true);

				//Hide the items from the selection path since they will be shown in the menu
				$children.eq(++iIndex).hide();
				iLen--;
			}
		}

		/**
		 * Closes menu (if opened)
		 *
		 * @name _closePopup
		 * @function
		 * @private
		 */
		function _closePopup() {
			_oMenu.close();
		}

		/**
		 * Handles press on navigation breadcrumb
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath}
		 * @param {object} oEvent an event object
		 *
		 * @name _fireNavigate
		 * @function
		 * @private
		 */
		function _fireNavigate(oEvent) {
			this.fireNavigate({
				pathId: oEvent.oSource.getBindingContext().getProperty("id")
			});
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new SelectionPath.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG selection path control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath
		 */
		var SelectionPath = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath.prototype */ {
			metadata: {
				properties: {
					/**
					 * An array of breadcrumbs
					 */
					"path": {"type": "object[]", "group": "Data", "defaultValue": null}
				},
				aggregations: {
					/**
					 * Hidden, for internal use only.
					 */
					"menu": {type: "sap.ui.commons.Link", multiple: false, visibility: "hidden"},

					/**
					 * The items of the selection path.
					 */
					"items": {type: "sap.ui.commons.Link", multiple: true, singularName: "link"}
				},
				events: {
					/**
					 * Event is fired when the user presses the navigation breadcrumb.
					 */
					navigate: {
						parameters: {
							/**
							 * The breadcrumb id which fired the navigate.
							 */
							pathId: {type: "string"}
						}
					}
				}
			},
			constructor: function () {
				sap.ui.core.Control.apply(this, arguments);

				var fnFireNavigate = _fireNavigate.bind(this);

				_oMenu = new sap.ui.unified.Menu({
					items: {
						path: "/path",
						template: new sap.ui.unified.MenuItem({
							text: "{name}",
							visible: "{visible}",
							select: fnFireNavigate
						})
					}
				});
				_oMenu.getPopup()
					.attachOpened(function () {
						jQuery(window).bind("resize", _closePopup);
					})
					.attachClosed(function () {
						jQuery(window).unbind("resize", _closePopup);
					});

				this.bindAggregation("items", "/path", function(sId, oContext) {
					return new sap.ui.commons.Link({
						text: oContext.getProperty("name"),
						press: fnFireNavigate
					});
				});
				this.setAggregation("menu", new sap.ui.commons.Link({
					press: function() {
						_oMenu.open(false, null, sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, this);
					}
				}));

				this.setModel(_oModel);
				_oMenu.setModel(_oModel);
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("selectionPath");
				oRm.writeClasses();
				oRm.write(">");

			oRm.write("<span");
				oRm.addClass("menu");
				oRm.writeClasses();
				oRm.writeAttribute("role", "button");
				oRm.writeAttribute("aria-haspopup", "true");
				oRm.writeAttribute("tabindex", "-1");
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("menu"));
			oRm.write("</span>");

				var aItems = oControl.getItems(),
					iLen = aItems.length;
				for (var i = 0; i < iLen - 1; i++) {
					oRm.write("<span>");
					oRm.renderControl(aItems[i]);
					oRm.write("</span>");
				}
				if (iLen) {
					oRm.writeEscaped(aItems[iLen - 1].getText());
				}

				oRm.write("</div>");
			}
		});

		/**
		 * Adjusts selection path breadcrumbs.
		 * Registers on resize event
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath#onAfterRendering
		 * @function
		 * @public
		 */
		SelectionPath.prototype.onAfterRendering = function () {
			_iWidth = 0;
			_onResize.apply(this);

			_sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(), jQuery.proxy(_onResize, this));

			// Prevents to show navigation path.
			// Usually browser shows this path in the bottom left corner if user hovers over the 'link' element with 'href' attribute.
			this.$().find("a").attr("href", null);
		};

		/**
		 * Deregisters from resize event
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath#onBeforeRendering
		 * @function
		 * @public
		 */
		SelectionPath.prototype.onBeforeRendering = function () {
			if (_sResizeListenerId) {
				sap.ui.core.ResizeHandler.deregister(_sResizeListenerId);
				_sResizeListenerId = null;
			}
		};

		/**
		 * Setter for property path.
		 *
		 * @param {Array<object>} aPath property value
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.SelectionPath#setPath
		 * @function
		 * @public
		 */
		SelectionPath.prototype.setPath = function (aPath) {
			aPath = aPath || [];
			this.setProperty("path", aPath, true);

			_oModel.setProperty("/path", aPath);
			return this;
		};

		return SelectionPath;
	}
);
