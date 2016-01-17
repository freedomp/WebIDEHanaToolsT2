define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart" ], function(AbstractPart) {
	"use strict";
	var OutlinePane = AbstractPart.extend("sap.watt.ideplatform.plugin.outlinepane.service.OutlinePane", {

		_oEditor : null,
		_oOutlineService : null,
		_mOutlines : [],

		init : function() {
		},

		configure : function(mConfig) {
			var that = this;

			this._mOutlines = mConfig.outlines;
			this._aStyles = mConfig.styles;

			jQuery.each(this._mOutlines, function(i, oOutline) {
				var oOutlineService = oOutline.service;
				oOutlineService.attachEvent('visibilityChanged', that._onVisibilityChanged, that);
			});
		},

		_getView : function() {
			if (!this._oView) {
				this._oView = sap.ui.view({
					viewName : "sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane",
					type : sap.ui.core.mvc.ViewType.XML
				});
				this._getController().init(this.context);
			}
			return this._oView;
		},

		_getController : function() {
			if (!this._oController) {
				this._oController = this._getView().getController();
			}
			return this._oController;
		},


		getContent : function() {
			var that = this;
			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				return that._getView();
			});
		},

		/** react on visibility changed from configured outlines
		*/
		_onVisibilityChanged : function(oEvent) {
			var that = this;
			var oOutline = oEvent.source.context.self;
			if (oEvent.params.visible) {
				return oOutline.getContent()
					.then(function(oOutlineView) {
					 	return that._getController().placeOutlineView(oOutlineView);
					});
			} else {
				if (this._oOutlineService === oOutline) {
					if (this._oEditor) {
						this._oEditor.detachEvent("closed", that._onEditorClose, that);
						this._oEditor = null;
						this._oDoc = null;
					}
					this._oOutlineService = null;
					return this._getController().removeOutlineView();
				}
			}
		},

		/** searches for selected document in given selection
		*/
		_getSelectedDocument : function(aSelection) {
			var oDoc = null;
			$(aSelection).map(function(sel) {
				if (sel && sel.document) {
					oDoc = sel.document;
					return false;
				}
			});
			return oDoc;
		},


		/** reacts on selection changed to editor, activates providers, that can handle current event
		*/
		onSelectionChanged : function(oEvent) {
			var that = this,
				oOwner = oEvent.params.owner,
				oOwnerDoc = this._getSelectedDocument(oEvent.params.selection),
				aPromises = [];
			if (that._oEditor === oOwner && that._oDoc === oOwnerDoc) {
				return Q();
			}
			if (oOwner.instanceOf("sap.watt.common.service.editor.Editor")) {
				return oOwner.getState().then(function(sState) {

					// if editor is loading or busy, ignore (autoloading/very fast loading bulletproof)
					if (sState) {
						return Q();
					}

					jQuery.each(that._mOutlines, function(i, oOutline) {
						if (oOwner.instanceOf(oOutline.editor)) {
							var oOutlineService = oOutline.service;
							aPromises.push(oOutlineService.canHandle(oEvent)
								.then(function(bCanHandle) {
									if (bCanHandle) {
										if (that._oEditor) {
											that._oEditor.detachEvent("closed", that._onEditorClose, that);
										}
										that._oEditor = oOwner;
										that._oDoc = oOwnerDoc;
										oOwner.attachEvent("closed", that._onEditorClose, that);
										that._oOutlineService = oOutlineService;
										return oOutlineService.setVisible(true).then(function() {
											return oOutlineService.onSelectionChanged(oEvent);
										});
									} else {
										if (that._oOutlineService) {
											return that._oOutlineService.setVisible(false);
										}
									}
								}
							));
						} else {
							if (that._oOutlineService && oOutline.service === that._oOutlineService) {
								aPromises.push(
									that._oOutlineService.setVisible(false)
								);
							}
						}
					});
					return Q.all(aPromises);
				});
			} else {
				return Q();
			}
		},

		/** current editor is closed
		*/
		_onEditorClose : function(oEvent) {
			var that = this;
			// TODO : it's a HACK and we need to remove it, when we will have
			// the separate instances of w5g editors
			return this.context.service.content.getCurrentEditor().then(function(oEditor) {
				if (oEditor !== that._oEditor) {
					return that._oOutlineService.setVisible(false);
				}
			});
		}
	});

	return OutlinePane;
});
