define([], {

	configure: function (mConfig) {
	},

	init: function () {
	},

	setProblems: function (supplierDomain, aProblems) {
		if (!supplierDomain || supplierDomain === "") {
			if (!aProblems || aProblems.length === 0) {
				this._writeToLog("No problems domain and no problems provided", "error");
			} else {
				this._writeToLog("No problems domain provided for problems: " + aProblems.toString(), "error");
			}
		} else {
			if (!aProblems || aProblems.length === 0) {
				this._writeToLog("No problems provided for domain: " + supplierDomain);
			} else {
				this.context.event.fireProblemsUpdate({
					problems: aProblems,
					domain: supplierDomain
				}).done();
			}
		}
	},

	clearProblems: function (supplierDomain, aIDs) {
		if (!supplierDomain || supplierDomain === "") {
			this._writeToLog("No problems domain provided");
		}
		else {
			if (!aIDs) {
				aIDs = null;
			}
			this.context.event.fireProblemsDelete({
					IDs: aIDs,
					domain: supplierDomain
				}
			).done();
		}
	},

	setTitle: function (sTitle) {
		this.context.event.fireTitleUpdate({
				title: sTitle
			}
		).done();
	},

	clearTitle: function () {
		this.context.event.fireTitleDelete({
				title: null
			}
		).done();
	},

	_writeToLog: function (message, level) {
		if (level === "error") {
			this.context.service.log.error(this.context.service.problems.getProxyMetadata().getName(), message, ["system"]).done();
		} else if (level === "warn") {
			this.context.service.log.warn(this.context.service.problems.getProxyMetadata().getName(), message, ["system"]).done();
		} else {
			this.context.service.log.error(this.context.service.problems.getProxyMetadata().getName(), message, ["system"]).done();
		}
	}
});
