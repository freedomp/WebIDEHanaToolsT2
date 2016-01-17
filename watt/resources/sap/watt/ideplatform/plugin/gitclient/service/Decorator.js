define({
	CONFLICT: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitConflict"
	},
	GIT: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitCommitted"
	},
	DELETED: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitDeleted"
	},
	STAGE: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitModifiedStaged"
	},
	MODIFIED: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitModified"
	},
	NEW: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitStagedInitial"
	},
	UNTRACKED: {
		text: " ",
		styleClass: "rdeRepositoryBrowserPrefixGitStagedUntracked"
	},

	decorate: function(oDocument, oEvent) {
		if (oDocument && oDocument.getEntity() && oDocument.getEntity().getBackendData() && oDocument.getEntity().getBackendData().git) {
			var oDecorators = {
				prefix: this.GIT
			};
			var that = this;
			var aPromises = [];
			var sBranchName;
			//var sCommitInfo;
			var oGit = oDocument.getEntity().getBackendData().git;

			aPromises.push(this.context.service.gitclient.getStatusForNode(oDocument).then(function(oResponse) {
				if (oResponse) {
					oDecorators.prefix = oResponse.stage ? that.STAGE : that[oResponse.status];
				}
			}));

			if (oDocument.isProject()) {
				aPromises.push(that.context.service.git.getLocalBranches(oGit)
					.then(function(oResponse) {
						return that.context.service.git.getCurrentBranchName(oResponse).then(function(sInBranchName) {
							sBranchName = sInBranchName;
						});
					})
				);

				// aPromises.push(that.context.service.git.getCommitsCount(oGit).then(function(oCount) {
				// 	var sIncoming = oCount.Incoming ? String.fromCharCode(8595) + oCount.Incoming : ""; //↑
				// 	var sOutgoing = oCount.Outgoing ? String.fromCharCode(8593) + oCount.Outgoing : ""; //↓
				// 	sCommitInfo = sOutgoing + "  " + sIncoming;
				// }));
			}
			return Q.allSettled(aPromises).then(function() {
				if (sBranchName) {
					oDecorators.suffix = [
						{
							//text: sCommitInfo && sCommitInfo !== "  " ? "[" + sBranchName + " " + sCommitInfo + "]" : "[" + sBranchName + "]",
							text: "[" + sBranchName + "]",
							styleClass: "rdeRepositoryBrowserSuffixRepo"
						}];
				}
				return oDecorators;
			});
		}
	}

});