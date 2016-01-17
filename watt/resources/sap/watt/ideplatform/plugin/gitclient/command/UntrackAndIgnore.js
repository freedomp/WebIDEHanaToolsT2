define(function() {
	"use strict";
	return {

		/**
		 * Calls the 'untrack and ignore' function on the git dispatcher service
		 * @returns {*}
		 */
		execute: function() {
			var oSelectionService = this.context.service.selection;
			var that = this;
			return oSelectionService.assertNotEmpty().then(
				function(aSelection) {
					if (aSelection[0] && aSelection[0].document && aSelection[0].document.getType() === "file") {
						return that.context.service.gitdispatcher.untrackAndIgnore(aSelection[0].document.getEntity());
					}
				});
		},

		/**
		 *
		 * @returns true if the selection is connected to git repository and  the Rm command is supported, and the context menu owner is the repository browser
		 */
		isAvailable : function() {
			var that = this;
			return Q.all([ this.context.service.selection.getSelection().then(function(aSelection) {
				if (aSelection && aSelection[0] && aSelection[0].document) {
					return that._isSupported(aSelection[0].document).then(function(bIsSupported){
						return that.context.service.gitclient.isAvailable(aSelection[0].document).then(function(bIsAvailable){
							return bIsAvailable && bIsSupported;
						});
					});

				}
			}), this.context.service.selection.isOwner(this.context.service.repositorybrowser) ]).spread(function(isGit, isRepositoryBrowser) {
				return isGit;
			});
		},

		/**
		 *
		 * @returns true there is a selection and the selection object is a file, and the file is connected to a  git repository
		 */
		isEnabled: function() {
			var that = this;
			var oSelectionService = this.context.service.selection;
			return oSelectionService.assertNotEmpty().then(function(aSelection) {
				return that.context.service.gitclient.isEnabled(aSelection) && aSelection[0].document && aSelection[0].document.getType() === "file";
			});
		},

		/**
		 *
		 * @param oDocument - the document this command is initiated on
		 * @returns true if the Rm command is supported in the current git implementation
		 * @private
		 */

		_isSupported : function(oDocument) {
			var oGit = oDocument.getEntity().getBackendData().git;
			if (!oGit) {
				return Q(false);
			} else {
				return this.context.service.git.isRmSupported(oGit);
			}
		}
	};
});