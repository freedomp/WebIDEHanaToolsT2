define(["sap/watt/ideplatform/plugin/gitclient/command/Constants"],
	function(Constants) {
		"use strict";
		return {
			execute: function() {
				var that = this;
				var oService = this.context.service;

				return oService.clone.doClone().then(
					function(oLocation) {
						if (oLocation) {
							//call "GET" with and get the returned repository name from object returned and set it to selected
							return oService.git.getRepositoryDetailsByLocation(oLocation).then(function(oRepositoryDetails) {
								return oService.filesystem.documentProvider.getDocument(URI('/' + oRepositoryDetails.Name).toString()).then(function(
									oFileDocument) {
									that.context.service.usagemonitoring.report("git", "fetch", Constants._ACTIVATED_FROM_COMMAND).done();
									return oService.repositorybrowser.setSelection(oFileDocument, true).thenResolve(true);
								});
							});
						}
						return false;
					}).fail(function(oError) {
					if (oError) {
						that._alertError(oError);
						return false;
					}
				});
			},

			_alertError: function(oError) {
				var oService = this.context.service;
				if (oError.detailedMessage) {
					oService.usernotification.alert(oError.name + "\n\n" + oError.detailedMessage).done();
				} else {
					oService.usernotification.alert(oError.name + "\n\n" + oError.message).done();
				}
			}
		};
	});