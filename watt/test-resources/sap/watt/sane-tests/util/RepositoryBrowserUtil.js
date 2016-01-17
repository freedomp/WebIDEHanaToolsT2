define(['STF'], function(STF) {

	"use strict";

	/**
	 * Checks if the given project exists in the workspace and if so, deletes it.
	 *
	 * @param {string} sSuiteName - Suite name
	 * @param {string} sProjectName - The project name that you wish to delete if exists
	 */
	var _deleteProjectIfExists = function(sSuiteName, sProjectName) {

		var oFilesystemDocumentProviderService = STF.getService(sSuiteName, "filesystem.documentProvider");

		// get root
		return oFilesystemDocumentProviderService.getRoot().then(function(oRoot) {
			// get root content
			return oRoot.getFolderContent().then(function(mContent) {
				// go over the content and search for an existing project with the same name
				for (var index in mContent) {
					if (mContent[index].getEntity().getName() === sProjectName) {
						// if found, delete the existing project with the same name
						return mContent[index]["delete"]();
					}
				}
			});
		});
	};

	/**
	 * Create a new folder under the root of the workspace.
	 *
	 * @param {string} sSuiteName - Suite name
	 * @param {string} sFolderName - The folder name that you wish to create
	 *
	 * @return {object} the created folder
	 */
	var _createFolderInRoot = function(sSuiteName, sFolderName) {

		var oFilesystemDocumentProviderService = STF.getService(sSuiteName, "filesystem.documentProvider");

		// get root
		return oFilesystemDocumentProviderService.getRoot().then(function(oRoot) {
			// create the folder under the root
			return oRoot.createFolder(sFolderName).then(function(oCreatedFolder) {
				// return the created folder
				return oCreatedFolder;
			});
		});
	};

	/**
	 * Imports a zip file into the given folder. Uses FakeFileDAO implementation.
	 *
	 * @param {object} oInnerWindow - the inner iframe window
	 * @param {object} oFolder - The target folder
	 * @param {string} sZipUrl - the url to the zip file in the filesystem
	 *
	 * @return {object} the created folder
	 */
	var _importZip = function(oInnerWindow, oFolder, sZipUrl) {

		// get the zip from the file system
		var sURL = require.toUrl(sZipUrl);

		return oInnerWindow.Q.sap.ajax(sURL, {
			responseType: "arraybuffer"
		}).then(function(oZip) {
			// import the zip using FakeFileDAO implementation
			return oFolder.importZip(oZip[0]);
		});
	};

	/**
	 * Imports a zip file into the given folder. Uses FakeFileDAO implementation.
	 * Preparations: delete the given folder (if exist), then create it.
	 *
	 * @param {string} sSuiteName - Suite name
	 * @param {string} sProjectName - The folder name that you wish to create
	 * @param {object} oInnerWindow - the inner iframe window
	 * @param {string} sZipUrl - the url to the zip file in the filesystem
	 *
	 * @return {object} the created folder
	 */
	var _importZipIntoCleanFolder = function(sSuiteName, sProjectName, oInnerWindow, sZipUrl) {
		var that = this;
		return that.deleteProjectIfExists(sSuiteName, sProjectName).then(function () {
			return that.createFolderInRoot(sSuiteName, sProjectName).then(function (oCreatedFolder) {
				return that.importZip(oInnerWindow, oCreatedFolder, sZipUrl).then(function() {
					return oCreatedFolder;
				});
			});
		});
	};

	return {
		importZipIntoCleanFolder: _importZipIntoCleanFolder,
		deleteProjectIfExists: _deleteProjectIfExists,
		createFolderInRoot: _createFolderInRoot,
		importZip: _importZip
	};
});
