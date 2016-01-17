define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"], function(AbstractPart) {
	"use strict";

	var GitLog = AbstractPart.extend("sap.watt.ideplatform.plugin.gitclient.service.GitLog", {

		_oGitLogView: undefined,
		_oSelectedDocument: undefined,

		_DEFAULT_LOG_LOCATION: "from_pane",

		configure: function() {
			return AbstractPart.prototype.configure.apply(this, arguments);
		},

		init: function() {
			//return Q.sap.require("sap.watt.ideplatform.gitclient/lib/gitgraph");
		},

		getFocusElement: function() {
			return this.getContent();
		},

		getContent: function() {
			var that = this;
			if (!this._oGitLogView) {
				this._oGitLogView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitLog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				return that._oGitLogView;
			});
		},

		getLogHistory: function(oDocument) {
			var that = this;
			this._oSelectedDocument = oDocument;
			//Clear pane
			that._oGitLogView.getController().clearPane();
			//git repository
			oDocument.getProject().then(
				function(oProjectDocument) {
					if (that._oGitLogView && oProjectDocument.getEntity()) {
						return that._oGitLogView.getController().updateGitLogPane(oDocument.getEntity(),
							oProjectDocument.getEntity().getName());
					}
				}).done();
		},

		onAfterSetSelection: function(oEvent) {
			var that = this;
			if (oEvent.params.selection && oEvent.params.selection.length > 0) {
				if (this._analyzeValidGitLog(oEvent.params.selection)) {
					if (oEvent.params.selection[0] && oEvent.params.selection[0].document) {
						this.context.service.repositorybrowser.getStateLinkWithEditor().then(function(oResult) {
							if (oEvent.params.owner === that.context.service.repositorybrowser ||
								(oEvent.params.owner.getProxyMetadata().getName() === 'aceeditor' && oResult)) {
								that.doUpdate(oEvent.params.selection[0].document);
							}
						}).done();
					}
				} else if (that._oGitLogView) {
					that._oGitLogView.getController().clearPane();
				}
			}
		},

		onDocumentDeleted: function(oEvent) {
			if (oEvent && oEvent.params && oEvent.params.document) {
				var oDocument = oEvent.params.document;
				if (this._oSelectedDocument === oDocument && this._oGitLogView) {
					this._oSelectedDocument = null;
					this._oGitLogView.getController().clearPane();
				}
			}

		},

		doUpdate: function(oDocument) {
			//Update the document always (either from the previous doc or new one)
			oDocument = oDocument || this._oSelectedDocument;
			//The document can be null in case of calling by Open command
			if (!(oDocument && oDocument.getEntity && oDocument.getEntity().getBackendData())) {
				return;
			}
			var bVisible = this.isVisible();

			//If not git repository clean the log
			if (!oDocument.getEntity().getBackendData().git) {
				this._oSelectedDocument = null;
				if (bVisible && this._oGitLogView) {
					this._oGitLogView.getController().clearPane();
				}
				return;
			}

			//save the document and update the pane of it is opened (visible)
			this._oSelectedDocument = oDocument;
			var oEntity = this._oSelectedDocument.getEntity();
			if (bVisible && this._oGitLogView) {
				this._oGitLogView.getController().updateGitLogPane(oEntity, oEntity.getName());
			}
		},

		setVisible: function(bVisible, sVisibleFrom) {
			var that = this;
			sVisibleFrom = !sVisibleFrom ? that._DEFAULT_LOG_LOCATION : sVisibleFrom;
			return AbstractPart.prototype.setVisible.apply(this, arguments).then(function() {
				if (bVisible) {
					that.context.service.usagemonitoring.report("gitlog", "pane_open", sVisibleFrom).done();
					that.doUpdate();
				}
				return Q();
			});
		},

		_analyzeValidGitLog: function(aSelection) {
			if (aSelection.length === 1 && aSelection[0] && aSelection[0].document && aSelection[0].document.getEntity() && aSelection[0].document
				.getEntity().getBackendData() && aSelection[0].document.getEntity().getBackendData().git) {
				return true;

			} else {
				return false;
			}
		},

		isEnabled: function(aSelection) {
			var bRes = this._analyzeValidGitLog(aSelection);
			return bRes;
		}

	});

	return GitLog;

});