define(["sap.watt.ideplatform.orion.validationsDistributor/adopters/problemsView/data/validationStoreManager"], function (validationStoreManager) {

	return {
		_isProblemsViewVisible: false,

		analyse: function () {
			return this.getValidationStoreManager().analyse(this.context);
		},

		onProblemsViewVisibilityChanged: function (oEvent) {
			if (oEvent.params.visible === true) {
				this.setProblemsViewVisibility(true);
				return this.onDocumentSelected();
			}
			else {
				this.setProblemsViewVisibility(false);
			}
		},

		onDocumentSelected: function (oEvent) {
			if (this.getProblemsViewVisibility()) {
				var that = this;
				var oContext = this.context;
				return that._getSelectedDocument()
					.then(function (oSelectedProject) {
						if (oSelectedProject) {
							return that.getValidationStoreManager().setSelectedProject(oSelectedProject)
								.then(function (bSelectionChanged) {
									if (bSelectionChanged) {
										return that.getValidationStoreManager()._hasFiles(oSelectedProject)
											.then(function (sResult) {
												if (sResult) {
													return that.getValidationStoreManager().select(oContext);
												}
												else {
													return that.getValidationStoreManager()._fireIssuesUpdate([], {}, oContext);
												}
											});
									}
								});
						}
					});
			}
		},

		onClientValidationChanged: function (oEvent) {
			if (this.getProblemsViewVisibility()) {
				var oContext = this.context;
				var oProjectToUpdate = oEvent.params.validationsResults[0];
				return this.getValidationStoreManager().updateSingleFileValidation(oContext, oProjectToUpdate);
			}
		},

		onDocumentDeleted: function (oEvent) {
			if (this.getProblemsViewVisibility()) {
				var oDoc;
				if (oEvent && oEvent.params && oEvent.params.document) {
					oDoc = oEvent.params.document;
				} else {
					return Q();
				}
				var oContext = this.context;
				var type = oDoc.getEntity().getType();
				if (type === "file") {
					var that = this;
					var sDocFullPath = oDoc.getEntity().getFullPath();
					var oResult = {
						"root": {},
						"issues": []
					};
					return oContext.service.basevalidator.getIssuesWrappedForProblems(oResult, sDocFullPath).then(function (aWrappedIssues) {
						var oEvent = {params: {validationsResults: aWrappedIssues}};
						return that.onClientValidationChanged(oEvent);
					});
				}
				// folder
				else {
					return this.getValidationStoreManager().handleFolderDelete(oContext, oDoc);
				}
			}
		},

		_getSelectedDocument: function () {
			var that = this;
			return that.context.service.repositorybrowser.getSelection().then(function (aSelection) {
				if (aSelection && aSelection.length > 0) {
					var oSelectedDocument = aSelection[0].document;
					if (oSelectedDocument) {
						return oSelectedDocument.getProject().then(function (oProject) {
							return oProject;
						});
					}
					return Q(null);
				}
				return Q(null);
			});
		},

		getValidationStoreManager: function () {
			return validationStoreManager;
		}
		,

		getProblemsViewVisibility: function () {
			return this._isProblemsViewVisible;
		}
		,

		setProblemsViewVisibility: function (bVisible) {
			this._isProblemsViewVisible = bVisible;
		}
	}
		;
})
;