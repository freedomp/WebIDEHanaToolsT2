define(
	[
		"sap/watt/lib/lodash/lodash",
		"sap/watt/common/plugin/platform/service/ui/AbstractPart",
		"../view/OutlineTree.controller"
	],
	function (_, AbstractPart) {
		"use strict";

		var W5GOutline = AbstractPart.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.W5GOutline", {

			/** @type{sap.ui.core.mvc.View} */
			_oView: null,
			/** @type{sap.ui.core.mvc.Controller} */
			_oController: null,
			/** @type{sap.watt.common.plugin.platform.service.ui.AbstractEditor} */
			_oEditor: null,
			/** @type{Q.sap.Queue} */
			_oQueue: null,
			_oContextMenuGroup: null,

			init: function () {
				this._oQueue = new Q.sap.Queue();
			},

			configure: function (mConfig) {
				var that = this;
				that._aStyles = mConfig.styles;
				if (mConfig.contextMenu) {
					return that.getContext().service.commandGroup.getGroup(mConfig.contextMenu).then(function (oGroup) {
						that._oContextMenuGroup = oGroup;
					});
				}
			},

			getContext: function () {
				return this.context.service.w5gOutline.context;
			},

			getContent: function () {
				var that = this;
				if (this._oView) {
					return this._oView;
				}
				this._oView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTree",
					type: sap.ui.core.mvc.ViewType.XML
				});
				this._oController = this._oView.getController();
				this._oController.attachEvent('highlightNodeInCanvas', this._highlightNodeInCanvas, this);
				this._oController.attachEvent('downplayNodeInCanvas', this._downplayNodeInCanvas, this);
				return this._oController.init(this.getContext(), this._oContextMenuGroup).then(function () {
					return AbstractPart.prototype.getContent.apply(that, arguments);
				}).then(function () {
					return that._oView;
				});
			},


			/**
			 * Check if outline service is responsible and can work with current selection event
			 *
			 * @param {{params: {selection: object} }} oEvent
			 * @return {boolean}
			 */
			canHandle: function (oEvent) {
				var that = this;
				var oOwner = oEvent.params.owner;
				if (that.context.self === oOwner) {
					// don't react on self fired events
					return false;
				}
				if (oOwner.instanceOf("sap.watt.common.service.selection.UI5ControlProvider")) {
					return true;
				}
			},

			/**
			 * Reacts on selection change
			 *
			 * @param {{params: {selection: object} }} oEvent
			 * @return {Q}
			 */
			onViewElementSelected: function (oEvent) {
				var oSelection = _.get(oEvent, "params.selection[0]");
				if (oSelection) {
					this._oController.selectNodeFromSelection(oSelection.control, oSelection.aggregation);
				}
				return this._oController.updateToolbarModel();
			},

			/**
			 * View has changed handler, should rebuild outline
			 *
			 * @param {{params: {editor: sap.watt.common.plugin.platform.service.ui.AbstractEditor} }} oEvent
			 * @return {Q}
			 */
			onViewHasChanged: function (oEvent) {
				var that = this;
				that._oEditor = oEvent.params.editor;
				return that._oQueue.next(function () {
					return Q.all([
						that._oEditor.getRoot(),
						that._oEditor.getTitle(),
						that._oEditor.getScope(),
						that._oEditor.getSelection()
					]);
				}).spread(function (/** sap.ui.core.mvc.View */ oView, /** string */ sTitle, /** Window */ oScope, aSelection) {
					that._oDocument = that._getSelectedDocument(aSelection);
					return that._oController.initOutline(that._oDocument.getKeyString(), sTitle, oView, oScope, that._oEditor);
				});
			},

			_getSelectedDocument: function (aSelection) {
				return _.get(aSelection, "[0].document");
			},

			/**
			 * Highlights node with given ID in w5g canvas
			 */
			_highlightNodeInCanvas: function (oEvent) {
				if (this._oEditor) {
					var sId = oEvent.getParameter('sId');
					this._oEditor.highlightUI5Control(sId).done();
				}
			},

			/**
			 * Downplays node with given ID in w5g canvas
			 */
			_downplayNodeInCanvas: function (oEvent) {
				if (this._oEditor) {
					var sId = oEvent.getParameter('sId');
					this._oEditor.downplayUI5Control(sId).done();
				}
			},

			/**
			 * Selection changed event params
			 *
			 * @return {Array<{document: object, control, sap.ui.core.Control, aggregation: string}>}
			 */
			getSelection: function () {
				return this._oEditor.getSelection();
			}
		});

		return W5GOutline;
	}
);