define({
	_oDocument: null,
	_extservice: null,

	setServiceData: function(oDocument, extService) {
		this._oDocument = oDocument;
		this._extservice = extService;
	},

	getDocument: function() {
		return this._oDocument;
	},

	setOption: function(e, state) {
		var mode = ["withoutWorkspace", "withWorkspace"];
		var src = e.getSource();
		var model = src.getModel();
		model.setProperty("/workspace", mode[state]);
	},

	onGetLibsVersionsClick: function(oEvent) {
		var that = this;
		var src = oEvent.getSource();
		//var parent = src.getParent();
		//parent.setBusy(true);
		var oModel = src.getModel();
		return this.getLibVersions(oModel).then(function(result) {
			oModel.setProperty("/appsVersion", result);
			//parent.setBusy(false);
			//move scroller down
			that._scrollToBottom();
		});
	},

	_scrollToBottom: function() {
		setTimeout(function() {
			//get dom element that owns the scroller
			var myDiv = $(".sapUiHSplitterSecondPane");
			var myheight = myDiv.height(); 
			if (myDiv) {
				myDiv.scrollTop(myheight);
			}
		}, 100);
	},

	onLibVersionChange: function(oEvent) {
		var oDropDown = oEvent.getSource();
		var oModel = oDropDown.getModel();
		oModel.setProperty(oDropDown.getBindingContext().getPath() + "/libraryVersion", oDropDown.getSelectedKey());
	},

	onResourceMappingChange: function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var isChecked = oControl.getChecked();
		that.setOption(oEvent, isChecked === false ? 0 : 1);
	},

	getLibVersions: function(oModel) {
		var that = this;
		var result = [];
		var bWithWorkspace = false;

		//runner didnt configure service for gettng Libs
		if (!this._extservice) {
			return Q(result);
		}

		return that.context.service.neoapp.getAppllications(that._oDocument).then(function(oNeoappApps) {
			//check neoap json
			if (oNeoappApps.length > 0) {
				if (oModel !== undefined) {
					var oWorkspace = oModel.getProperty("/workspace/");
					if (oWorkspace === "withWorkspace") {
						bWithWorkspace = true;
					}
				}
				return that._extservice.getLibsFromHCPandWorkspace(bWithWorkspace).then(function(oLibs) {
					var oLibHcpResult = oLibs.hcp;
					var oLibWsResult = oLibs.ws;
					for (var index in oNeoappApps) {
						var findWsResult = _.find(oLibWsResult, {
							externalName: oNeoappApps[index].name
						});
						var findHcpResult = _.find(oLibHcpResult, {
							externalName: oNeoappApps[index].name
						});
						if (findHcpResult !== undefined && findWsResult === undefined) {
							var oLibVersions = [{
								version: "Active",
								details: "Active"
							}];
							var activeVersion;
							var neoappVersion;
							for (var versionIndex in findHcpResult.versions) {
								if (findHcpResult.versions[versionIndex].version !== undefined) {
									var details = findHcpResult.versions[versionIndex].version;
									if (findHcpResult.versions[versionIndex].isActive) {
										activeVersion = findHcpResult.versions[versionIndex].version;
									}
									if (oNeoappApps[index].version === findHcpResult.versions[versionIndex].version) {
										neoappVersion = findHcpResult.versions[versionIndex].version;
									}
									oLibVersions.push({
										version: findHcpResult.versions[versionIndex].version,
										details: details
									});
								}
							}
							var currentLibVersion = oNeoappApps[index].version === undefined ? "Active" : oNeoappApps[index].version;
							result.push({
								libraryName: oNeoappApps[index].name,
								versions: oLibVersions,
								activeVersion: activeVersion,
								neoappVersion: neoappVersion,
								libraryVersion: currentLibVersion,
								detailVersion: currentLibVersion
							});
						} else {
							result.push({
								libraryName: oNeoappApps[index].name,
								versions: [{
									version: "Workspace",
									details: "Version from Workspace"
								}]
							});
						}
					}

					if (oModel !== undefined) {
						var oAppsVersion = oModel.getProperty("/appsVersion/");
						if (oAppsVersion !== undefined) {
							for (var indexAppVersion = 0; indexAppVersion < oAppsVersion.length; indexAppVersion++) {
								if (oAppsVersion[indexAppVersion].libraryVersion !== undefined) {
									var oCurrentResult = _.find(result, {
										libraryName: oAppsVersion[indexAppVersion].libraryName
									});
									if (oCurrentResult !== undefined && oCurrentResult.libraryVersion !== undefined) {
										oAppsVersion[indexAppVersion].libraryVersion = oCurrentResult.libraryVersion;
									}
								}
							}
						}
					}
					return result;
				});
			}
			return result;
		}).fail(function() {

			return result; //Error handling?
		});

	}

});