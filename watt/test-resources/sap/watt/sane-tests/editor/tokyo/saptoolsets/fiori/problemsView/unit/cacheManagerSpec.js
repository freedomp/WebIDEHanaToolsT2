define(["sap/watt/ideplatform/orion/plugin/validationsDistributor/adopters/problemsView/data/cacheManager"], function (cacheManager) {

	var _cache = new cacheManager();

	describe("cacheManagerSpec test", function () {

		beforeEach(function () {
			_cache.deleteAllProjects();
		});

		it("test for adding a project to cache ", function () {
			var currentProjectName = "project1";
			var projectToAdd = {projectName: currentProjectName, projectData: {issues: []}};
			_cache.addProjects([projectToAdd]);
			var projects = _cache.doProjectsExists([currentProjectName]);
			var isProjectExists = projects[0].isProjectExists;
			expect(isProjectExists).to.be.true;
		});

		it("test for adding a project that already exists to cache ", function () {
			var currentProjectName1 = "project1";
			var projectToAdd = {projectName: currentProjectName1, projectData: {issues: []}};
			_cache.addProjects([projectToAdd]);
			var projects = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects[0].isProjectExists;
			expect(isProjectExists1).to.be.true;

			var currentProjectName2 = "project1";
			var projectToAdd2 = {projectName: currentProjectName2, projectData: {issues: [{"test": "t1"}]}};
			_cache.addProjects([projectToAdd2]);
			var projects = _cache.doProjectsExists([currentProjectName2]);
			var isProjectExists2 = projects[0].isProjectExists;
			expect(isProjectExists2).to.be.true;
		});

		it("test for getting projects from cache ", function () {
			var projectToAdd1 = {projectName: "project1", projectData: {issues: [{"test": "t1"}]}};
			var projectToAdd2 = {projectName: "project2", projectData: {issues: [{"test": "t2"}]}};
			_cache.addProjects([projectToAdd1, projectToAdd2]);
			var currentProjects = _cache.getProjects(["project1", "project2"]);
			expect(currentProjects[0].projectName).to.eql("project1");
			expect(currentProjects[1].projectName).to.eql("project2");
		});

		it("test for delete a project from the data structure", function () {
			var currentProjectName = "project";
			var projectToAdd = {projectName: currentProjectName, projectData: {issues: []}};
			_cache.addProjects([projectToAdd]);
			var projects = _cache.doProjectsExists([currentProjectName]);
			var isProjectExists = projects[0].isProjectExists;
			expect(isProjectExists).to.be.true;

			_cache.deleteProjects([currentProjectName]);
			var projects1 = _cache.doProjectsExists([currentProjectName]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.false;
		});

		it("test projects add to the data structure", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: []}};

			var currentProjectName2 = "project2";
			var projectToAdd2 = {projectName: currentProjectName2, projectData: {issues: []}};

			var currentProjectName3 = "project3";
			var projectToAdd3 = {projectName: currentProjectName3, projectData: {issues: []}};

			_cache.addProjects([projectToAdd1, projectToAdd2, projectToAdd3]);
			var projects = _cache.doProjectsExists([currentProjectName1, currentProjectName2, currentProjectName3]);
			expect(projects[0].isProjectExists && projects[1].isProjectExists && projects[2].isProjectExists).to.be.true;
		});

		it("test projects delete in the data structure", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: []}};
			_cache.addProjects([projectToAdd1]);
			var projects1 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.true;

			var currentProjectName2 = "project2";
			var projectToAdd2 = {projectName: currentProjectName2, projectData: {issues: []}};
			_cache.addProjects([projectToAdd2]);
			var projects2 = _cache.doProjectsExists([currentProjectName2]);
			var isProjectExists2 = projects2[0].isProjectExists;
			expect(isProjectExists2).to.be.true;

			var currentProjectName3 = "project3";
			var projectToAdd3 = {projectName: currentProjectName3, projectData: {issues: []}};
			_cache.addProjects([projectToAdd3]);
			var projects3 = _cache.doProjectsExists([currentProjectName3]);
			var isProjectExists3 = projects3[0].isProjectExists;
			expect(isProjectExists3).to.be.true;

			_cache.deleteProjects([currentProjectName1, currentProjectName2, currentProjectName3]);
			var projects = _cache.doProjectsExists([currentProjectName1, currentProjectName2, currentProjectName3]);
			expect(projects[0].isProjectExists && projects[1].isProjectExists && projects[2].isProjectExists).to.be.false;
		});


		it("check if projects are existes in the data structure", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: []}};
			_cache.addProjects([projectToAdd1]);

			var currentProjectName2 = "project2";
			var projectToAdd2 = {projectName: currentProjectName2, projectData: {issues: []}};
			_cache.addProjects([projectToAdd2]);

			var currentProjectName3 = "project3";
			var projectToAdd3 = {projectName: currentProjectName3, projectData: {issues: []}};
			_cache.addProjects([projectToAdd3]);

			var projectsToCheck = [currentProjectName1, currentProjectName2, currentProjectName3];
			var resulteFromeCacheManager = _cache.doProjectsExists(projectsToCheck);
			var booleanResulte = _.every(resulteFromeCacheManager, "isProjectExists", true);

			expect(booleanResulte).to.be.true;
		});

		it("test delete unexisting project", function () {
			var currentProjectName1 = "project1";
			var projects1 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.false;
			_cache.deleteProjects([currentProjectName1]);
			var projects2 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists2 = projects2[0].isProjectExists;
			expect(isProjectExists2).to.be.false;
		});

		it("test delete unexisting projects", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: []}};
			_cache.addProjects([projectToAdd1]);
			var projects1 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.true;

			var currentProjectName2 = "project2";
			var currentProjectName3 = "project3";

			_cache.deleteProjects([currentProjectName1, currentProjectName2, currentProjectName3]);
			var projects = _cache.doProjectsExists([currentProjectName1, currentProjectName2, currentProjectName3]);
			expect(projects[0].isProjectExists && projects[1].isProjectExists && projects[2].isProjectExists).to.be.false;
		});

		it("test for update file 2 times", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: []}};
			_cache.addProjects([projectToAdd1]);
			var projects1 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.true;
			var sFilePath = "project1/newFile";
			var aIssues = [];
			_cache.updateIssuesForSingleFile(currentProjectName1, sFilePath, aIssues);
			var retuenProject1 = _cache.getProjects([currentProjectName1]);
			//var indexOfFileInArrayIssues1=_.findIndex(retuenProject1[0].projectData.issues, {'filePath' : sFilePath});

			var arr = [];
			expect(retuenProject1[0].projectData.issues[sFilePath].issues).to.eql(arr);
			_cache.updateIssuesForSingleFile(currentProjectName1, sFilePath, aIssues);
			var retuenProject2 = _cache.getProjects([currentProjectName1]);
			var indexOfFileInArrayIssues2 = _.findIndex(retuenProject2[0].projectData.issues, {'filePath': sFilePath});
			expect(retuenProject2[0].projectData.issues[sFilePath].issues).to.eql(arr);
		});

		it("checking update one project's file from two projects", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: {}}};
			_cache.addProjects([projectToAdd1]);
			var projects1 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.true;
			var currentProjectName2 = "project2";
			var projectToAdd2 = {projectName: currentProjectName2, projectData: {issues: {}}};
			_cache.addProjects([projectToAdd2]);
			var projects2 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists2 = projects2[0].isProjectExists;
			expect(isProjectExists2).to.be.true;

			var sFilePath1 = "project1/newFile";
			var aIssues = [];
			_cache.updateIssuesForSingleFile(currentProjectName1, sFilePath1, aIssues);
			var retuenProject1 = _cache.getProjects([currentProjectName1]);
			var arr = [];
			expect(retuenProject1[0].projectData.issues[sFilePath1].issues).to.eql(arr);

			var retuenProject2 = _cache.getProjects([currentProjectName2]);
			expect(_.includes(retuenProject2[0].projectData.issues, sFilePath1)).to.be.false;
		});

		it("checking for unexisting project after add another project", function () {
			var currentProjectName1 = "project1";
			var projectToAdd1 = {projectName: currentProjectName1, projectData: {issues: []}};
			_cache.addProjects([projectToAdd1]);
			var projects1 = _cache.doProjectsExists([currentProjectName1]);
			var isProjectExists1 = projects1[0].isProjectExists;
			expect(isProjectExists1).to.be.true;
			var currentProjectName2 = "project2";
			var projects2 = _cache.doProjectsExists([currentProjectName2]);
			var isProjectExists2 = projects2[0].isProjectExists;
			expect(isProjectExists2).to.be.false;

		});

		it("checking result for deleting subfolders from project content", function () {
			var projName = "P";
			var projData = {issues: {}};
			projData.issues["\\P\\a.js"] = {};
			projData.issues["\\P\\b.js"] = {};
			projData.issues["\\P\\A\\c.js"] = {};
			projData.issues["\\P\\A\\d.js"] = {};
			projData.issues["\\P\\B\\C\\e.js"] = {};
			projData.issues["\\P\\B\\C\\f.js"] = {};
			var projectToAdd = {projectName: projName, projectData: projData};
			_cache.addProjects([projectToAdd]);
			var projectExists = _cache.doProjectsExists([projName]);
			var isProjectExists = projectExists[0].isProjectExists;
			expect(isProjectExists).to.be.true;

			// Delete sub folder A
			var criteria = "\\P\\A";
			_cache.deleteProjectSubFolder(projName, criteria);
			// Get the new data from cache
			var newData = _cache.getProjects([projName]);
			var newProjectIssues = newData[0].projectData.issues;
			expect(newProjectIssues["\\P\\A\\c.js"]).to.not.exist;
			expect(newProjectIssues["\\P\\A\\c.js"]).to.not.exist;
			expect(newProjectIssues["\\P\\a.js"]).to.exist;
			expect(newProjectIssues["\\P\\b.js"]).to.exist;
			expect(newProjectIssues["\\P\\B\\C\\e.js"]).to.exist;
			expect(newProjectIssues["\\P\\B\\C\\f.js"]).to.exist;

			// Delete sub folder B
			criteria = "\\P\\B";
			_cache.deleteProjectSubFolder(projName, criteria);
			// Get the new data from cache
			newData = _cache.getProjects([projName]);
			newProjectIssues = newData[0].projectData.issues;
			expect(newProjectIssues["\\P\\a.js"]).to.exist;
			expect(newProjectIssues["\\P\\b.js"]).to.exist;
			expect(newProjectIssues["\\P\\B\\C\\e.js"]).to.not.exist;
			expect(newProjectIssues["\\P\\B\\C\\f.js"]).to.not.exist;
		});
	});
});
