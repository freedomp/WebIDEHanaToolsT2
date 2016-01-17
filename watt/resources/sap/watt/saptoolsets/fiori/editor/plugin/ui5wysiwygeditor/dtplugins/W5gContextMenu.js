sap.ui.define(
	[
		"sap/ui/dt/Plugin"
	],
	function (Plugin) {
		"use strict";

		/**
		 * Constructor for a new W5gContextMenu.
		 *
		 * @param {string} [sId] id for the new object, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new object
		 *
		 * @class
		 * The W5gContextMenu enables context menu functionality in the layout editor
		 * @extends sap.ui.dt.Plugin
		 *
		 */
		var W5gContextMenu = Plugin.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gContextMenu",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gContextMenu.prototype */ {
				metadata: {
					library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins",
					properties: {
						context: {type: "object"},
						contextMenuConfig: {type: "object"}
					}
				}
			});

		/*
		 * @private
		 */
		W5gContextMenu.prototype.init = function () {
			Plugin.prototype.init.apply(this, arguments);

			var that = this;
			this._mEventDelegate = {
				/**
				 * Handler for right click events on the canvas.
				 * Opens a context menu with relevant commands.
				 *
				 * @param oEvent - 'contextmenu' browser event
				 * @private
				 */
				oncontextmenu: function (oEvent) {
					var oOverlay = this, oElement;
					while (oOverlay.getParentElementOverlay() && !oOverlay.getSelected()) {
						oOverlay = oOverlay.getParentElementOverlay();
					}

					if (oOverlay.getSelected()) {
						oElement = oOverlay.getElementInstance();
					} else if (this.getSelectable()) {
						oElement = this.getElementInstance();
					}

					if (oElement) {
						var oContextMenuConfig = that.getContextMenuConfig(),
							oContextMenuGroup = oContextMenuConfig.group,
							oIframePosition = oContextMenuConfig.getIFramePosition();
						that.getContext().service.ui5wysiwygeditor.selectUI5Control(oElement).then(function () {
							that.getContext().service.contextMenu.open(oContextMenuGroup, oEvent.pageX + oIframePosition.left, oEvent.pageY + oIframePosition.top);
						}).done();
					}

					oEvent.preventDefault();
					oEvent.stopPropagation();
				},

				onclick: function () {
					that.getContext().service.contextMenu.close().done();
				}
			};
		};

		/*
		 * @override
		 */
		W5gContextMenu.prototype.registerOverlay = function (oOverlay) {
			oOverlay.addEventDelegate(this._mEventDelegate, oOverlay);
		};


		/**
		 * @override
		 */
		W5gContextMenu.prototype.deregisterOverlay = function (oOverlay) {
			oOverlay.removeEventDelegate(this._mEventDelegate, oOverlay);
		};

		return W5gContextMenu;
	},
	/* bExport= */ true
);
