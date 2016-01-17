define([], function() {
	"use strict";
	return {

		_mSnippets: {},

		configure : function(mConfig) {
			var that = this;
			mConfig.snippets.forEach(function(mEntry) {
				that._mSnippets[mEntry.fileExtension] = {
					snippets : mEntry.snippets
				};
			});
		},

		getAllSnippets : function(sFileExtension) {
			var oSnippets = this._mSnippets[sFileExtension];
			var that = this;
			if (oSnippets) {
				return this._loadTemplatesFromFiles(oSnippets).then(function() {
					return oSnippets.snippets;
				}).fail(function(oError) {
					that.context.service.log.error("Snippet", oError.message, ["user"]).done();
					return null;
				});
			}
		},

		_loadTemplatesFromFiles: function(oEntry) {
			var aPromises = [];
			if (!oEntry.snippetLoadingDefer) {
				oEntry.snippets.forEach(function(oSnippet) {
					var sPath = require.toUrl(oSnippet.filePath);
					aPromises.push(Q.sap.ajax(sPath));
				});
				oEntry.snippetLoadingDefer = Q.all(aPromises).then(function(aContent) {
					for (var i = 0; i < aContent.length; i++) {
						oEntry.snippets[i].content = aContent[i][0];
					}
				});
			}
			return oEntry.snippetLoadingDefer;
		}
	};
});