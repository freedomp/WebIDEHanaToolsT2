define(["STF", "sap/watt/ideplatform/plugin/generationwizard/utils/WizardUtils"] , function(STF, WizardUtils) {

	"use strict";

	var suiteName = "WizardUtils_Unit";

	describe(suiteName, function () {

		function ContentItem(sTitle, sType){
			this._title = sTitle;
			this._type = sType;
		}
		ContentItem.prototype.getTitle = function() {
			return this._title;
		};

		ContentItem.prototype.getType = function() {
			return this._type;
		};

		it("Empty folder with any file", function () {
			var result = WizardUtils.isFolderEmpty([]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .project.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".project.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with sap-ui-cachebuster-info.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem("sap-ui-cachebuster-info.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with README.md", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem("README.md","file")]);
			assert.ok(!result, "folder is not empty");
		});

		it("Empty folder with .gitignore", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".gitignore","file")]);
			assert.ok(!result, "folder is not empty");
		});


		it("Empty folder with .git and README.md", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with README and README.md", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem("README.md","file"), new ContentItem("README.md","file")]);
			assert.ok(!result, "folder is not empty");
		});

		it("Empty folder with .git and .project.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".project.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and sap-ui-cachebuster-info.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("sap-ui-cachebuster-info.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and .gitignore", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".gitignore","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with README and .gitignore", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem("README.md","file"), new ContentItem(".gitignore","file")]);
			assert.ok(!result, "folder is not empty");
		});


		it("Empty folder with .git and .project.json and README.md", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".project.json","file"), new ContentItem("README.md","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and .project.json and file.js", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".project.json","file"), new ContentItem("file.js","file")]);
			assert.ok(!result, "folder is not empty");
		});

		it("Empty folder with .git and .project.json and sap-ui-cachebuster-info.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".project.json","file"), new ContentItem("sap-ui-cachebuster-info.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and README.md and sap-ui-cachebuster-info.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem("sap-ui-cachebuster-info.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and README.md and .gitignore", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem(".gitignore","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and .project.json and .gitignore", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".project.json","file"), new ContentItem(".gitignore","file")]);
			assert.ok(result, "folder is empty");
		});


		it("Empty folder with .git and README.md and sap-ui-cachebuster-info.json and .project.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem("sap-ui-cachebuster-info.json","file"), new ContentItem(".project.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and .gitignore and sap-ui-cachebuster-info.json and .project.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem(".gitignore","file"), new ContentItem("sap-ui-cachebuster-info.json","file"), new ContentItem(".project.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and README.md and .gitignore and .project.json", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem(".gitignore","file"), new ContentItem(".project.json","file")]);
			assert.ok(result, "folder is empty");
		});

		it("Empty folder with .git and README.md and sap-ui-cachebuster-info.json and .project.json x 2", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem("sap-ui-cachebuster-info.json","file"), new ContentItem(".project.json","file"),  new ContentItem(".project.json","file")]);
			assert.ok(!result, "folder is not empty");
		});

		it("Empty folder with .git and README.md and sap-ui-cachebuster-info.json x 2", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem("sap-ui-cachebuster-info.json","file"), new ContentItem("sap-ui-cachebuster-info.json")]);
			assert.ok(!result, "folder is not empty");
		});
		
		
		it("Empty folder with .git and README.md and sap-ui-cachebuster-info.json and .project.json and .gitignore", function () {
			var result = WizardUtils.isFolderEmpty([new ContentItem(".git","folder"), new ContentItem("README.md","file"), new ContentItem("sap-ui-cachebuster-info.json","file"), new ContentItem(".project.json","file"), new ContentItem(".gitignore","file")]);
			assert.ok(result, "folder is empty");
		});


	});
});