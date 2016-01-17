define(
	[
		"sap/watt/lib/lodash/lodash",
		"../../utils/W5gUtils"
	],
	function (_, W5gUtils) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout");

// Private variables and methods
// Begin
		/**
		 * Site panel maximum width.
		 * The default (minimum) width of side panel is 250px (defined in css)
		 *
		 * @const
		 * @private
		 * @type {number}
		 */
		var MAX_SITE_PANEL_SIZE = 650;

		/**
		 * Validates the given <code>oLayoutInfo</code> layout info object.
		 *
		 * @param {object} oLayoutInfo layout info object to validate
		 * @return {object} Returns valid layout info.
		 *
		 * @name _validateLayoutInfo
		 * @function
		 * @private
		 */
		function _validateLayoutInfo(oLayoutInfo) {
			var oDefaultInfo = {
				left: {
					visible: true
				},
				right: {
					visible: true
				}
			};

			if (!oLayoutInfo || (typeof oLayoutInfo !== "object")) {
				return oDefaultInfo;
			}

			_validateLayoutInfoPart(oDefaultInfo, oLayoutInfo, "left");
			_validateLayoutInfoPart(oDefaultInfo, oLayoutInfo, "right");

			return oDefaultInfo;
		}

		function _validateLayoutInfoPart(oDefaultInfo, oLayoutInfo, sPart) {
			var oPart = oLayoutInfo[sPart];
			if (oPart && (typeof oPart === "object")) {
				if (oPart.visible === false) {
					oDefaultInfo[sPart].visible = false;
				}
				if (typeof oPart.width === "number") {
					oDefaultInfo[sPart].width = oPart.width;
				}
			}
		}

		/**
		 * Creates expand/collapse button for specified section
		 *
		 * @param {string} sName The section name
		 * @param {WysiwygLayout} oLayout Layout instance
		 * @param {boolean} bPressed
		 * @return {sap.ui.commons.Button} Returns created button control
		 *
		 * @name _createToggleButton
		 * @function
		 * @private
		 */
		function _createToggleButton(sName, oLayout, bPressed) {
			var sSnakeCasedName = _.snakeCase(sName),
				sClosedStyleName = "w5g" + _.capitalize(sName) + "Closed",
				sCollapseTooltip = sSnakeCasedName + "_collapse_tooltip",
				sExpandTooltip = sSnakeCasedName + "_expand_tooltip",
				sPart = sName === "leftPane" ? "left" : "right",
				sImagesFolder = W5gUtils.getCssImagesFolderPath();

			oLayout.toggleStyleClass(sClosedStyleName, !bPressed);

			return new sap.ui.commons.ToggleButton({
				/** @this {sap.ui.commons.ToggleButton} */
				press: function () {
					var sTooltip = sExpandTooltip,
						oLayoutInfo = oLayout.getLayoutInfo();

					if (oLayout.hasStyleClass(sClosedStyleName)) {
						sTooltip = sCollapseTooltip;
					}
					oLayout.toggleStyleClass(sClosedStyleName);
					this
						.bindProperty("tooltip", "i18n>" + sTooltip)
						.$().blur();

					oLayoutInfo[sPart].visible = this.getPressed();
					oLayout.fireLayoutInfoChange({
						info: oLayoutInfo
					});
				},
				pressed: bPressed,
				icon: sImagesFolder + "panel-" + sPart + ".png",
				iconHovered: sImagesFolder + "panel-" + sPart + "_on.png",
				iconSelected: sImagesFolder + "panel-" + sPart + "_on.png",
				tooltip: "{i18n>" + (bPressed ? sCollapseTooltip : sExpandTooltip) + "}",
				lite: true
			});
		}

		/**
		 * Creates undo/redo button
		 *
		 * @param {string} sName The button name
		 * @param {WysiwygLayout} oLayout Layout instance
		 * @return {sap.ui.commons.Button} Returns created button control
		 *
		 * @name _createToggleButton
		 * @function
		 * @private
		 */
		function _createUndoRedoButton(sName, oLayout) {
			var sImagesFolder = W5gUtils.getCssImagesFolderPath();

			return new sap.ui.commons.Button({
				/** @this {sap.ui.commons.Button} */
				press: function () {
					if (sName === "undo") {
						oLayout.fireUndo();
					} else {
						oLayout.fireRedo();
					}
					this.$().blur();
				},
				enabled: "{layoutModel>/" + sName + "Enabled}",
				icon: sImagesFolder + sName + ".png",
				iconHovered: sImagesFolder + sName + "_on.png",
				iconSelected: sImagesFolder + sName + "_on.png",
				tooltip: "{i18n>" + sName + "_tooltip}",
				lite: true
			}).addStyleClass("w5gUndoRedoBtn");
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new WysiwygLayout.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG layout control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout
		 */
		var WysiwygLayout = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout.prototype */ {
			metadata: {
				properties: {
					/**
					 * WYSIWYG layout info.
					 *
					 * <ul>
					 * <li>'right' of type <code>Map(string, any)</code>
					 *            Right side panel layout info
					 *            <ul>
					 *            <li>'visible' of type <code>boolean</code>
					 *            			Whether the part is visible (expanded)
					 * 			  </li>
					 *            <li>'width' of type <code>boolean</code>, optional
					 *            			The part width
					 * 			  </li>
					 *            </ul>
					 * </li>
					 * <li>'left' of type <code>Map(string, any)</code>
					 *            Left side panel layout info
					 *            <ul>
					 *            <li>'visible' of type <code>boolean</code>
					 *            			Whether the part is visible (expanded)
					 * 			  </li>
					 *            <li>'width' of type <code>boolean</code>, optional
					 *            			The part width
					 * 			  </li>
					 *            </ul>
					 * </li>
					 * </ul>
					 *
					 * All other properties will be ignored
					 */
					"layoutInfo": {"type": "object", "group": "Data", "defaultValue": null},

					/**
					 * WYSIWYG device type
					 */
					"deviceType": {
						"type": "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Device",
						"group": "Data",
						"defaultValue": "phone"
					},

					/**
					 * Whether the undo/redo buttons should be visible on the Wysiwyg toolbar
					 */
					"showUndoRedo": {"type": "boolean", "group": "Appearance", "defaultValue": true}
				},
				aggregations: {
					/**
					 * The content of this layout
					 */
					"canvas": {"type": "sap.ui.core.Control", "multiple": false},

					/**
					 * Represents the outline tree area. It is always located at the left pane
					 */
					"outline": {"type": "sap.ui.core.Control", "multiple": false},

					/**
					 * Represents the palette area. It is always located at the left pane
					 */
					"palette": {"type": "sap.ui.core.Control", "multiple": false},

					/**
					 * Represents the left pane area. It is always located at the left of this layout
					 */
					"leftPane": {"type": "sap.ui.commons.TabStrip", "multiple": false, visibility : "hidden"},

					/**
					 * Represents the right pane area. It is always located at the right of this layout
					 */
					"rightPane": {"type": "sap.ui.core.Control", "multiple": false},

					/**
					 * Represents the notification bar area. It is always located above the canvas
					 */
					"notificationBar": {"type": "sap.ui.core.Control", "multiple": false},

					/**
					 * Represents the message bar area. It is always located below the canvas
					 */
					"messageBar": {"type": "sap.ui.core.Control", "multiple": false},

					/**
					 * Hidden, for internal use only.
					 */
					"deviceTypeButton": {"type": "sap.ui.commons.SegmentedButton", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"leftPaneButton": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"rightPaneButton": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"undoButton": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"redoButton": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"leftResizeBar": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"},

					/**
					 * Hidden, for internal use only.
					 */
					"rightResizeBar": {"type": "sap.ui.core.Control", "multiple": false, "visibility": "hidden"}
				},
				events: {
					/**
					 * Event is fired when the user presses the device type button.
					 */
					deviceTypeChange: {
						parameters: {
							/**
							 * The device type.
							 */
							deviceType: {type: "string"}
						}
					},

					/**
					 * Event is fired when the user presses the device type button.
					 */
					layoutInfoChange: {
						parameters: {
							info: {type: "object"}
						}
					},

					undo: {},

					redo: {}
				}
			},
			constructor: function () {
				sap.ui.core.Control.apply(this, arguments);

				var that = this,
					sImagesFolder = W5gUtils.getCssImagesFolderPath(),
					oLayoutInfo = this.getLayoutInfo();

				this.setAggregation("leftPane", new sap.ui.commons.TabStrip({
					height: "100%",
					tabs: [
						new sap.ui.commons.Tab({
							height: "100%",
							text: "{i18n>left_pane_tab_palette}"
						}),
						new sap.ui.commons.Tab({
							height: "100%",
							text: "{i18n>left_pane_tab_outline}"
						})
					]
				}));
				this.setAggregation("leftPaneButton", _createToggleButton("leftPane", this, !!oLayoutInfo.left.visible));
				this.setAggregation("rightPaneButton", _createToggleButton("rightPane", this, !!oLayoutInfo.right.visible));
				this.setAggregation("undoButton", _createUndoRedoButton("undo", this));
				this.setAggregation("redoButton", _createUndoRedoButton("redo", this));
				this.setAggregation("deviceTypeButton", new sap.ui.commons.SegmentedButton({
					buttons: _.map(["phone", "tablet", "desktop"], function (sName) {
						return new sap.ui.commons.Button(sName, {
							lite: true,
							tooltip: "{i18n>device_" + sName + "_tooltip}",
							icon: sImagesFolder + "device-" + sName + ".png",
							iconHovered: sImagesFolder + "device-" + sName + "_on.png",
							iconSelected: sImagesFolder + "device-" + sName + "_on.png"
						});
					}),
					selectedButton: this.getDeviceType(),
					select: function (oEvent) {
						var sDeviceType = oEvent.getParameter("selectedButtonId");

						that.setProperty("deviceType", sDeviceType, true);
						that.fireDeviceTypeChange({
							deviceType: sDeviceType
						});
					}
				}));
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				var aToolbarItems = ["deviceTypeButton", "TBS", "leftPaneButton", "rightPaneButton"];

				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("wysiwygLayout");
				if (oControl.getShowUndoRedo()) {
					oRm.addClass("wysiwygLayoutHasUndoRedo");
					aToolbarItems = aToolbarItems.concat(["TBS", "undoButton", "redoButton"]);
				}
				oRm.writeClasses();
				oRm.write(">");

				openElement("top", "Wrapper");
				createContainer("messageBar");
				createWrapper("toolbar", null, aToolbarItems);
				closeElement();

				openElement("main", "Wrapper");
				createContainer("leftPane");
				createWrapper("canvas", ["notificationBar", "canvas"], ["leftResizeBar", "rightResizeBar"]);
				createContainer("rightPane");
				closeElement();

				oRm.write("</div>");

				function openElement(sName, sType) {
					oRm.write("<div");
					oRm.addClass("wysiwygLayout" + _.capitalize(sName) + sType);
					oRm.writeClasses();
					oRm.write(">");
				}

				function closeElement() {
					oRm.write("</div>");
				}

				function createContainer(sName) {
					openElement(sName, "Container");
					oRm.renderControl(oControl.getAggregation(sName));
					closeElement();
				}
				function createWrapper(sName, aContainers, aElements) {
					openElement(sName, "Wrapper");

					jQuery.each(aContainers || [], function () {
						createContainer(this);
					});

					jQuery.each(aElements || [], function () {
						if (this === "TBS") {
							createTBSeparator();
						} else {
							oRm.renderControl(oControl.getAggregation(this));
						}
					});

					closeElement();
				}

				function createTBSeparator() {
					oRm.write("<span ");
					oRm.addClass("w5gTbSeparator");
					oRm.writeClasses();
					oRm.writeAttribute("role", "separator");
					oRm.write("></span>");
				}
			}
		});

		WysiwygLayout.prototype.onAfterRendering = function() {
			var oLayoutInfo = this.getLayoutInfo();

			var $this = this.$(),
				$leftPane = $this.find(".wysiwygLayoutLeftPaneContainer"),
				$rightPane = $this.find(".wysiwygLayoutRightPaneContainer"),
				$canvas = $this.find(".wysiwygLayoutCanvasWrapper"),
				iWidth = oLayoutInfo.left.width;

			if (iWidth) {
				$leftPane.css("width", iWidth + "px");
				$canvas.css("left", iWidth + "px");
			} else {
				$leftPane.css("width", "");
				$canvas.css("left", "");
			}

			iWidth = oLayoutInfo.right.width;
			if (iWidth) {
				$rightPane.css("width", iWidth + "px");
				$canvas.css("right", iWidth + "px");
			} else {
				$rightPane.css("width", "");
				$canvas.css("right", "");
			}
		};

		/**
		 * Setter for property deviceType.
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Device} sDeviceType
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout} this to allow method chaining
		 *
		 * @override sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout#setDeviceType
		 */
		WysiwygLayout.prototype.setDeviceType = function (sDeviceType) {
			this.setProperty("deviceType", sDeviceType, true);

			var oButton = this.getAggregation("deviceTypeButton");
			if (oButton) {
				oButton.setSelectedButton(sDeviceType);
			}
			return this;
		};

		/**
		 * Setter for property layoutInfo.
		 *
		 * @param {object} oLayoutInfo
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout} this to allow method chaining
		 *
		 * @override sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout#setLayoutInfo
		 */
		WysiwygLayout.prototype.setLayoutInfo = function (oLayoutInfo) {
			oLayoutInfo = _validateLayoutInfo(oLayoutInfo);
			this.setProperty("layoutInfo", oLayoutInfo);

			return this;
		};

		/**
		 * Gets the left pane tab by its name
		 *
		 * @param {string} sTabName Tab name
		 * @return {sap.ui.commons.Tab} Returns the requested tab if exists
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout#_getLeftPaneTab
		 * @function
		 * @private
		 */
		WysiwygLayout.prototype._getLeftPaneTab = function (sTabName) {
			switch(sTabName) {
				case "palette":
					return this.getAggregation("leftPane").getTabs()[0];
				case "outline":
					return this.getAggregation("leftPane").getTabs()[1];
			}
			jQuery.sap.log.error("Wrong usage : WysiwygLayout._getLeftPaneTab(" + sTabName + ")");
			return null;
		};

		/**
		 * Sets a new object in the named 0..1 aggregation of this ManagedObject and
		 * marks this ManagedObject as changed.

		 * @param {string} sAggregationName name of an 0..1 aggregation
		 * @param {object} oObject the managed object that is set as aggregated object
		 * @param {boolean=} bSuppressInvalidate if true, this ManagedObject is not marked as changed
		 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
		 * @throws {Error}

		 * @override sap.ui.base.ManagedObject#setAggregation
		 */
		WysiwygLayout.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			switch(sAggregationName) {
				case "palette":
				case "outline":
					var oTab = this._getLeftPaneTab(sAggregationName);
					oTab.removeAllAggregation("content", true);
					oTab.addAggregation("content", oObject, bSuppressInvalidate);
					break;
				default:
					sap.ui.core.Control.prototype.setAggregation.apply(this, arguments);
					break;
			}
			return this;
		};

		/**
		 * Returns the aggregated object(s) for the named aggregation of this ManagedObject.
		 *
		 * @param {string} sAggregationName the name of the aggregation
		 * @param {sap.ui.base.ManagedObject | Array} oDefaultForCreation the object that is used in case the current aggregation is empty
		 * @return {sap.ui.base.ManagedObject} the managed object or null
		 *
		 * @override sap.ui.base.ManagedObject#getAggregation
		 */
		WysiwygLayout.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
			switch(sAggregationName) {
				case "palette":
				case "outline":
					return this._getLeftPaneTab(sAggregationName).getContent()[0] || oDefaultForCreation || null;
			}
			return sap.ui.core.Control.prototype.getAggregation.apply(this, arguments);
		};

		/**
		 * Destroys (all) the managed object(s) in the aggregation named <code>sAggregationName</code> and empties the
		 * aggregation. If the aggregation did contain any object, this ManagedObject is marked as changed.
		 *
		 * @param {string} sAggregationName the name of the aggregation
		 * @param {boolean=} bSuppressInvalidate if true, this ManagedObject is not marked as changed
		 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
		 *
		 * @override sap.ui.base.ManagedObject#destroyAggregation
		 */
		WysiwygLayout.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			switch(sAggregationName) {
				case "palette":
				case "outline":
					this._getLeftPaneTab(sAggregationName).destroyAggregation("content", bSuppressInvalidate);
					break;
				default:
					sap.ui.core.Control.prototype.destroyAggregation.apply(this, arguments);
					break;
			}
			return this;
		};

		/**
		 * Removes all content of wysiwyg layout
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout#removeAllContent
		 * @function
		 * @public
		 */
		WysiwygLayout.prototype.removeAllContent = function () {
			var aAggregations = [
				"outline", "palette", "notificationBar", "canvas", "messageBar", "properties"
			];

			var that = this;
			jQuery.each(aAggregations, function () {
				that.setAggregation(this, null);
			});
		};

		/*
		 * Event handler for keydown.
		 * Prevents propagation of command associated events caused by 'value holder' controls within
		 * sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout#onkeydown
		 * @function
		 * @protected
		 */
		WysiwygLayout.prototype.onkeydown = function (oEvent) {
			if (
				(oEvent.srcControl instanceof sap.ui.commons.TextField ||
				oEvent.srcControl instanceof sap.ui.commons.CheckBox)

				&&

				((oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.X) || //cut command
				(oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.V) ||  //paste command
				(oEvent.keyCode === jQuery.sap.KeyCodes.DELETE))				 //delete command
			) {
				oEvent.stopPropagation();
			}
		};

		//resize section
		(function() {
			WysiwygLayout.prototype.init = function () {
				this.setAggregation("leftResizeBar", new WysiwygLayout.ResizeBar());
				this.setAggregation("rightResizeBar", new WysiwygLayout.ResizeBar({
					anchor: ANCHOR.Right
				}));
				this.setLayoutInfo(); //sets default layout info
			};

			jQuery.sap.require("sap.ui.core.Popup");

			var
				/**
				 * @const
				 */
				ORIENTATION = {
					Vertical: "Vertical",
					Horizontal: "Horizontal"
				},
				ANCHOR = {
					Top: "Top",
					Left: "Left",
					Right: "Right",
					Bottom: "Bottom"
				};

			/**
			 * @this {WysiwygLayout}
			 */
			function _onResizeDone(oResizeBar, oData) {
				var $this = this.$(),
					bLeft = oResizeBar === this.getAggregation("leftResizeBar"),
					sanvas = $this.find(".wysiwygLayoutCanvasWrapper"),
					$sidePanel = $this.find(bLeft ? ".wysiwygLayoutLeftPaneContainer" : ".wysiwygLayoutRightPaneContainer"),
					iLeft = oData.left - $this.offset().left,
					oLayoutInfo = this.getLayoutInfo();

				if (!bLeft) {
					iLeft = $this.width() - iLeft - oData.width;
				}
				sanvas.css(bLeft ? "left" : "right", iLeft);
				$sidePanel.css("width", iLeft);

				oLayoutInfo[bLeft ? "left" : "right"].width = iLeft;
				this.setProperty("layoutInfo", oLayoutInfo, true);

				this.fireLayoutInfoChange({
					info: oLayoutInfo
				});
			}

			/**
			 * @this {WysiwygLayout}
			 */
			function _getResizeBounds(oResizeBar) {
				var bRTL = sap.ui.getCore().getConfiguration().getRTL(),
					$this = this.$(),
					iResizeRange = MAX_SITE_PANEL_SIZE - 250,
					iMin, iMax,
					bLeft = oResizeBar === this.getAggregation("leftResizeBar");
				if ((bLeft && !bRTL) || (!bLeft && bRTL)) {
					iMin = $this.offset().left + 250;
					iMax = iMin + iResizeRange;
				} else {
					iMax = $this.offset().left + $this.width() - 250;
					iMin = iMax - iResizeRange;
				}
				return {
					min: iMin,
					max: iMax
				};
			}

			//***********************************************
			// Inner Control "Resize Bar"
			//***********************************************
			sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.layout.WysiwygLayout.ResizeBar", {
				metadata: {
					visibility : "hidden",
					properties: {
						"orientation": {type: "string", group: "Behavior", defaultValue: ORIENTATION.Horizontal},
						"anchor": {type: "string", group: "Behavior", defaultValue: ANCHOR.Left}
					}
				},

				onmousedown: function (oEvent) {
					this._oBounds = _getResizeBounds.call(this.getParent(), this);

					var $this = this.$(),
						oOffset = $this.offset(),
						iHeight = $this.height(),
						iWidth = $this.width(),
						sClassName = this.getOrientation() === ORIENTATION.Horizontal ? "sapUiVSBGhost" : "sapUiHSBGhost",
						iZIndex = sap.ui.core.Popup.getLastZIndex() + 5;

					if (iZIndex < 20) {
						iZIndex = 20;
					}

					jQuery(document.body)
						// Fix for IE text selection while dragging
						.bind("selectstart", jQuery.proxy(this.splitterSelectStart, this))

						.append("<div id=\"" + this.getId() + "_ghost\" class=\"" + sClassName + "\" style =\" height:" + iHeight + "px; width:"
						+ iWidth + "px; left:" + oOffset.left + "px; top:" + oOffset.top + "px;z-index:" + iZIndex + "\"></div>")

						// append overlay over splitter to enable correct functionality of moving the splitter
						.append("<div id=\"" + this.getId() + "_overlay\" style =\"left: 0px;" +
						" right: 0px; bottom: 0px; top: 0px; position:fixed; z-index:" + iZIndex + "\" ></div>");

					jQuery(document)
						.bind("mouseup", jQuery.proxy(this.onGhostMouseRelease, this))
						.bind("mousemove", jQuery.proxy(this.onGhostMouseMove, this));

					$this.focus();

					// cancel the event
					oEvent.preventDefault();
					oEvent.stopPropagation();
				},

				splitterSelectStart: function(oEvent){
					oEvent.preventDefault();
					oEvent.stopPropagation();
					return false;
				},

				onGhostMouseRelease: function (oEvent) {
					var oGhost = jQuery.sap.byId(this.getId() + "_ghost"),
						oOffset = oGhost.offset();

					_onResizeDone.call(this.getParent(), this, {
						left: oOffset.left,
						top: oOffset.top,
						width: oGhost.width(),
						height: oGhost.height()
					});

					this._oBounds = null;
					oGhost.remove();
					jQuery.sap.byId(this.getId() + "_overlay").remove();

					jQuery(document.body).unbind("selectstart", this.splitterSelectStart);
					jQuery(document)
						.unbind("mouseup", this.onGhostMouseRelease)
						.unbind("mousemove", this.onGhostMouseMove);
				},

				onGhostMouseMove: function (oEvent) {
					var iMin = this._oBounds.min || 0,
						iMax = this._oBounds.max || Number.MAX_VALUE;

					if (this.getOrientation() === ORIENTATION.Horizontal) {
						if (oEvent.pageX > iMin && oEvent.pageX < iMax) {
							jQuery.sap.byId(this.getId() + "_ghost").css("left", oEvent.pageX + "px");
						}
					} else {
						if (oEvent.pageY > iMin && oEvent.pageY < iMax) {
							jQuery.sap.byId(this.getId() + "_ghost").css("top", oEvent.pageY + "px");
						}
					}
				},

				renderer: function (oRm, oControl) {
					var sAnchor = oControl.getAnchor().toLowerCase();

					oRm.write("<div");
					oRm.writeControlData(oControl);
					if (oControl.getOrientation() === ORIENTATION.Horizontal) {
						oRm.addClass("sapUiVerticalSplitterBar");
					} else {
						oRm.addClass("sapUiHorizontalSplitterBar");
					}
					oRm.addClass(sAnchor + "ResizeBar");
					oRm.addStyle("position", "absolute");
					oRm.addStyle(sAnchor, "0");
					oRm.addStyle("width", "4px");
					oRm.writeClasses();
					oRm.writeStyles();
					oRm.writeAttribute("tabIndex", "-1");
					oRm.write("></div>");
				}
			});
		})();

		return WysiwygLayout;
	}
);