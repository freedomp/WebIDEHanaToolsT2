define({

	execute : function() {
		var that = this;
		return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
			var oSelection = aSelection[0];
			if (oSelection.document && oSelection.document.getEntity) {
				that.context.service.usagemonitoring.report("mockDataEditor", "opened").done();
				return that.context.service.mockdata.open(aSelection[0].document);
			}
		});
	},

	isAvailable : function() {
		var sName, sType;
		return Q.all([ this.context.service.selection.assertNotEmpty().then(function(aSelection) {
			var oSelection = aSelection[0];
			if (oSelection.document && oSelection.document.getEntity) {
				sName = oSelection.document.getEntity().getName();
				sType = oSelection.document.getEntity().getType();
				if (!/.*\.view.xml$/.test(sName) && !/.*\.fragment.xml$/.test(sName)) {
					if (sType === "file" && /.*\.(xml|edmx)$/.test(sName)) {
						return oSelection.document.getContent().then(function(sContent) {
							return sContent.indexOf('<edmx:Edmx') > -1;
						});
					}
				}
			}
			return false;
		}), this.context.service.selection.isOwner(this.context.service.repositorybrowser) ]).spread(function(bXml, bRepositoryBrowser) {
			return bXml && bRepositoryBrowser;
		});
	}
});