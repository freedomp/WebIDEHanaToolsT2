define(
	function() {
		"use strict";

		var WizardUtils = {
            
            /**
			 * Returns if a folder's content is considered empty or not for project generation.
			 * 	If non empty folder - Allow the exceptions of empty git repository folders and empty project folders:
			 * 		a. Folder with 1 child: ".git" folder or ".project.json" file or "sap-ui-cachebuster-info.json"
			 *		b. Folder with 2 children: ".git" folder, and 1 files from the followings: "README.md",".project.json","sap-ui-cachebuster-info.json",".gitignore"
			 *		c. Folder with 3 children: ".git" folder, and 2 files from the followings: "README.md",".project.json","sap-ui-cachebuster-info.json",".gitignore"
			 *		d. Folder with 4 children: ".git" folder, and 3 files from the followings: "README.md",".project.json","sap-ui-cachebuster-info.json",".gitignore"
			 *		e. Folder with 5 children: ".git" folder, and all the followings: "README.md",".project.json","sap-ui-cachebuster-info.json",".gitignore"
			 * @param {sap.watt.common.plugin.document.Document[]} aFolderContent the content of a folder
			 * @return {bool} Binding info if any
			 *
			 * @name WizardUtils.isFolderEmpty
			 * @function
			 * @public
			 */
			isFolderEmpty: function(aFolderContent) {
				var bValidFolder = false;
				if ((!aFolderContent) || aFolderContent.length === 0) {
					// the selection is an empty folder
					bValidFolder = true;
				} else if (aFolderContent.length <= 5) {

					// Create a map of the content, from file title to file type
					var mContentTypes = {};
					for (var i = 0; i < aFolderContent.length; i++) {
						mContentTypes[aFolderContent[i].getTitle()] = aFolderContent[i].getType();
					}

					if (aFolderContent.length === 1) {
						if ((mContentTypes[".git"] && mContentTypes[".git"] === "folder") ||
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") ||
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file")) {
							bValidFolder = true;
						} else {
							bValidFolder = false;
						}
					} else if (aFolderContent.length === 2) {
						if ((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							((mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") ||
								(mContentTypes["README.md"] && mContentTypes["README.md"] === "file") || 
								(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file") ||
								(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file"))) {
							bValidFolder = true;
						} else {
							bValidFolder = false;
						}
					} else if (aFolderContent.length === 3) {
						if (((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file")) ||
							
							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file")) ||
							
							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file")) ||
							
							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file")) ||
							
							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file")) ||
							
							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file"))) {
							bValidFolder = true;
						} else {
							bValidFolder = false;
						}
					} else if (aFolderContent.length === 4) {
						if (((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file")) ||
							
							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file")) ||

							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file")) ||

							((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file"))) {
							bValidFolder = true;
						} else {
							bValidFolder = false;
						}
					} else if (aFolderContent.length === 5) {
						if ((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
							(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
							(mContentTypes["README.md"] && mContentTypes["README.md"] === "file") &&
							(mContentTypes[".gitignore"] && mContentTypes[".gitignore"] === "file") &&
							(mContentTypes["sap-ui-cachebuster-info.json"] && mContentTypes["sap-ui-cachebuster-info.json"] === "file")) {
							bValidFolder = true;
						} else {
							bValidFolder = false;
						}
					}
				}
				return bValidFolder;
			}
		};

		return WizardUtils;
	});