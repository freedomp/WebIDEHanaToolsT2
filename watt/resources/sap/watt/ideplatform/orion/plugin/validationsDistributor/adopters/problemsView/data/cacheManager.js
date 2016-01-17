define([], function () {

	var ValidationCacheManager = function () {
		this.oProjectCollection = {};
	};

	ValidationCacheManager.prototype.addProjects = function (aProjects) {
		for (var i = 0; i < aProjects.length; i++) {
			var oProject = aProjects[i];
			var sProjectName = oProject.projectName;
			this.oProjectCollection[sProjectName] = {};
			this.oProjectCollection[sProjectName].projectData = {'issues': oProject.projectData.issues};
		}
	};

	ValidationCacheManager.prototype.getProjects = function (aProjectsNames) {
		var aReturnProjects = [];
		for (var i = 0; i < aProjectsNames.length; i++) {
			var sProjectName = aProjectsNames[i];
			if (this._isProjectExists(sProjectName)) {
				aReturnProjects.push({
					projectName: sProjectName,
					projectData: this.oProjectCollection[sProjectName].projectData
				});
			}
		}
		return aReturnProjects;
	};

	ValidationCacheManager.prototype.deleteProjects = function (aProjectsNames) {
		for (var i = 0; i < aProjectsNames.length; i++) {
			var sProjectName = aProjectsNames[i];
			if (this._isProjectExists(sProjectName)) {
				this.oProjectCollection = _.omit(this.oProjectCollection, sProjectName);
			}
		}
	};

	ValidationCacheManager.prototype.deleteProjectSubFolder = function (sProjectName, sCriteria) {
		if (this._isProjectExists(sProjectName)) {
			var oProjectIssues = this.oProjectCollection[sProjectName].projectData.issues;
			oProjectIssues = _.omit(oProjectIssues, function (value, key) {
				return _.startsWith(key, sCriteria);
			});
			this.oProjectCollection[sProjectName].projectData.issues = oProjectIssues;
		}
	};

	ValidationCacheManager.prototype.deleteAllProjects = function () {
		this.oProjectCollection = {};
	};

	ValidationCacheManager.prototype.doProjectsExists = function (aProjectsNames) {
		var aResults = [];
		for (var i = 0; i < aProjectsNames.length; i++) {
			var sProjectName = aProjectsNames[i];
			aResults.push({projectName: sProjectName, isProjectExists: this._isProjectExists(sProjectName)});
		}
		return aResults;
	};

	ValidationCacheManager.prototype.updateIssuesForSingleFile = function (sProjectName, sFilePath, aIssues) {
		if (!this.oProjectCollection[sProjectName]) {
			// for supporting new folder & file scenario
			var oProject = {projectName: sProjectName, projectData: {issues: {}}};
			this.addProjects([oProject]);
		}
		this.oProjectCollection[sProjectName].projectData.issues[sFilePath] = {}; // for new file
		this.oProjectCollection[sProjectName].projectData.issues[sFilePath].issues = aIssues;
	};

	ValidationCacheManager.prototype._isProjectExists = function (sProjectName) {
		return _.has(this.oProjectCollection, sProjectName);
	};

	return ValidationCacheManager;
});
