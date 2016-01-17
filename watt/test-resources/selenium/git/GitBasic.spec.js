var driverFactory = require('../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	WebIDE = require('../pageobjects/WebIDE'),
	HcpLoginPage = require('../pageobjects/HcpLoginPage'),
	Configuration = require('./Configuration.js'),
	remote = require('selenium-webdriver/remote'),
	Utils = require('../pageobjects/Utils'),
	Git = require('../pageobjects/Git'),
	RepositoryBrowser = require('../pageobjects/RepositoryBrowser');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Git Basic Operations Test', function () {
	'use strict';
	this.timeout(Configuration.startupTimeout);
	var hcpLoginPage;
	var driver;
	var webIDE;
	var git;
	var repositoryBrowser;

	var user = Configuration.getParam(Configuration.KEYS.USER_NAME);
	var password =  Configuration.getParam(Configuration.KEYS.PASSWORD);
	var gitRepo = "https://" + user + "@git.wdf.sap.corp/infra_selenium_tests.git";
	var repositoryFolderName = "infra_selenium_tests";
	var fileToCreate = "GitTestNewFile.js";
	var untrackedStatus = "Untracked";
	var commitDescription = "Commit description";

	beforeEach(function () {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);

		//Used for login during build
		login();

		//Initialze all objects
		webIDE = new WebIDE(driver, By, until, Configuration);
		git = new Git(driver, By, until, Configuration);
		repositoryBrowser = new RepositoryBrowser(driver, By, until, Configuration);

		//open the web IDE URL
		driver.get(Configuration.url);
	});

	afterEach(function () {
		return Utils.deleteProjectFromWorkspace(driver,repositoryFolderName).thenFinally(function(){
			console.log("Folder deleted successfully");
			return driver.quit();
		}, function(){
			console.log("Could not delete folder");
		});
	});


	var login = function(){
		hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(user);
		hcpLoginPage.setPassword(password);
		hcpLoginPage.login();
	};


	it('Test clone project, commit change and push to current branch', function () {


		return webIDE.clickDevelopmentPerspective()
			.then(function () {
				console.log("Development perspective opened");
				return git.clone(gitRepo);
			}).then(function () {
				return repositoryBrowser.waitForNode(repositoryFolderName);
			}).then(function () {
				console.log("Clone completed and repository browser was updated");
				return webIDE.selectProjectInRepositoryBrowser(repositoryFolderName);
			}).then(function () {
				console.log("Project was selected");
				return git.toggleGitPane();
			}).then(function () {
				console.log("Git Pane was opened");
				return repositoryBrowser.createFile(repositoryFolderName, fileToCreate);
			}).then(function () {
				return git.waitForFileInStatusTable(fileToCreate, untrackedStatus);
			}).then(function () {
				console.log("File was created and it appears in the status table");
				return git.stageAll();
			}).then(function () {
				console.log("All files were staged");
				return git.addCommitDescription(commitDescription);
			}).then(function () {
				return git.commitChange();
			}).then(function () {
				console.log("Change was committed");
				return git.pushToCurrentBranch();
			}).then(function(){
				console.log("Change was pushed");
			});

	});


	it('Test commit amend and commit and push to remote branch', function () {

		return webIDE.clickDevelopmentPerspective()
			.then(function () {
				console.log("Development perspective opened");
				return git.clone(gitRepo);
			}).then(function () {
				return repositoryBrowser.waitForNode(repositoryFolderName);
			}).then(function () {
				console.log("Clone completed and repository browser was updated");
				return webIDE.selectProjectInRepositoryBrowser(repositoryFolderName);
			}).then(function () {
				console.log("Project was selected");
				return git.toggleGitPane();
			}).then(function () {
				console.log("Git Pane was opened");
				return repositoryBrowser.createFile(repositoryFolderName, fileToCreate);
			}).then(function () {
				return git.waitForFileInStatusTable(fileToCreate, untrackedStatus);
			}).then(function () {
				console.log("File was created and it appears in the status table");
				return git.stageAll();
			}).then(function () {
				console.log("All files were staged");
				return git.addCommitDescription(commitDescription);
			}).then(function () {
				console.log("Commit description was added");
				return git.commitChange();
			}).then(function () {
				console.log("Change was committed");
				return git.amendChange();
			}).then(function () {
				console.log("Change was amended");
				return git.commitAndPushToRemoteBranch("origin/master");
			}).then(function(){
				console.log("Change was committed and pushed");
			});

	});


	it('Test commit and push to current branch', function () {

		return webIDE.clickDevelopmentPerspective()
			.then(function () {
				console.log("Development perspective opened");
				return git.clone(gitRepo);
			}).then(function () {
				return repositoryBrowser.waitForNode(repositoryFolderName);
			}).then(function () {
				console.log("Clone completed and repository browser was updated");
				return webIDE.selectProjectInRepositoryBrowser(repositoryFolderName);
			}).then(function () {
				console.log("Project was selected");
				return git.toggleGitPane();
			}).then(function () {
				console.log("Git Pane was opened");
				return repositoryBrowser.createFile(repositoryFolderName, fileToCreate);
			}).then(function () {
				return git.waitForFileInStatusTable(fileToCreate, untrackedStatus);
			}).then(function () {
				console.log("File was created and it appears in the status table");
				return git.stageAll();
			}).then(function () {
				console.log("All files were staged");
				return git.addCommitDescription(commitDescription);
			}).then(function () {
				console.log("Commit description was added");
				return git.commitAndPushToCurrentBranch();
			}).then(function(){
				console.log("Change was committed and pushed");
			});

	});


	it('Test clone project, commit change and push to remote branch', function () {

		return webIDE.clickDevelopmentPerspective()
			.then(function () {
				console.log("Development perspective opened");
				return git.clone(gitRepo);
			}).then(function () {
				return repositoryBrowser.waitForNode(repositoryFolderName);
			}).then(function () {
				console.log("Clone completed and repository browser was updated");
				return webIDE.selectProjectInRepositoryBrowser(repositoryFolderName);
			}).then(function () {
				console.log("Project was selected");
				return git.toggleGitPane();
			}).then(function () {
				console.log("Git Pane was opened");
				return repositoryBrowser.createFile(repositoryFolderName, fileToCreate);
			}).then(function () {
				return git.waitForFileInStatusTable(fileToCreate, untrackedStatus);
			}).then(function () {
				console.log("File was created and it appears in the status table");
				return git.stageAll();
			}).then(function () {
				console.log("All files were staged");
				return git.addCommitDescription(commitDescription);
			}).then(function () {
				console.log("Commit description was added");
				return git.commitChange();
			}).then(function () {
				console.log("Change was committed");
				return git.pushToRemoteBranch("origin/master");
			}).then(function(){
				console.log("Change was pushed");
			});

	});


	it('Test create branch', function () {

		return webIDE.clickDevelopmentPerspective()
			.then(function () {
				console.log("Development perspective opened");
				return git.clone(gitRepo);
			}).then(function () {
				return repositoryBrowser.waitForNode(repositoryFolderName);
			}).then(function () {
				console.log("Clone completed and repository browser was updated");
				return webIDE.selectProjectInRepositoryBrowser(repositoryFolderName);
			}).then(function () {
				console.log("Project was selected");
				return git.toggleGitPane();
			}).then(function () {
				console.log("Git Pane was opened");
				return git.createBranch("origin/master", "master2");
			}).then(function () {
				console.log("Branch was created");
				//TBD add a check that a branch with the expected name is created
			});

	});

});