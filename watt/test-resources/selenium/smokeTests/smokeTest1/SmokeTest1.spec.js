var driverFactory = require('../../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	ProjectWizard = require('../../pageobjects/ProjectWizard'),
	Deploy = require('../../pageobjects/Deploy'),
	configuration = require('./Configuration.js'),
	path = require('path'),
	remote = require('selenium-webdriver/remote'),
	HcpLoginPage = require('../../pageobjects/HcpLoginPage'),
	CodeEditor = require('../../pageobjects/CodeEditor'),
	Toolbar = require('../../pageobjects/Toolbar'),
	utils = require('../../pageobjects/Utils'),
	RunConfiguration = require('../../pageobjects/RunConfiguration'),
	AppRuntime = require('../../pageobjects/AppRunTime'),
	RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
	Git = require('../../pageobjects/Git'),
	Content = require('../../pageobjects/Content');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Smoke_Test', function() {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var hcpLoginPage;
	var driver;
	var webIDE;
	var projectWizard;
	var deploy;
	var codeEditor;
	var toolbar;
	var repositoryBrowser;
	var runConfiguration;
	var appRuntime;
	var git;
	var content;

	var mappings = {
		projectFolder : {type : "css" , path : "li[title='$1'][aria-level='2']"}
	};

	beforeEach(function() {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
	});

	afterEach(function() {
		return utils.deleteProjectFromWorkspace(driver, configuration.projectName).thenFinally(function() {
			return driver.sleep(5000).then(function () {
				return driver.quit();
			});
		});
	});

	it('Create project', function() {
		var that = this;
		driver.get(configuration.getParam(configuration.KEYS.HOST));

		hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		webIDE = new webide(driver, By, until, configuration);
		projectWizard = new ProjectWizard(driver, By, until, configuration);
		deploy = new Deploy(driver, By, until, configuration);
		codeEditor = new CodeEditor(driver, By, until, configuration);
		toolbar = new Toolbar(driver, By, until, configuration);
		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		runConfiguration = new RunConfiguration(driver, By, until, configuration);
		appRuntime = new AppRuntime(driver, By, until, configuration);
		content = new Content(driver, By, until, configuration);
		git = new Git(driver, By, until, configuration);

		console.log("click welcome perspective");
		return webIDE.clickWelcomePerspective().then(function() {
			console.log("open project wizard");
			return projectWizard.openFromWelcomePerspective();
		}).then(function(){
			console.log("select template category");
			return projectWizard.selectTemplateCategory(configuration.templateCategory);
		}).then(function(){
			console.log("selectTemplate");
			return projectWizard.selectTemplate(configuration.templateName);
		}).then(function(){
			console.log("next");
			return projectWizard.next();
		}).then(function(){
			console.log("enterProjectName");
			return projectWizard.enterProjectName(configuration.projectName);
		}).then(function(){
			console.log("next");
			return projectWizard.next();
		}).then(function(){
			var sPath = path.resolve(__dirname, 'rmtsampleflight_metadata.xml');
			console.log("metadata path: " + sPath);
			console.log("selectServiceFromFileSystem");
			return projectWizard.selectServiceFromFileSystem(sPath);
		}).then(function(){
			console.log("next");
			return projectWizard.next();
		}).then(function(){
			console.log("enterTemplateCustomizationText - title");
			return projectWizard.enterTemplateCustomizationText(configuration.appHeaderTitle, 0, "Title");
		}).then(function(){
			console.log("enterTemplateCustomizationText - namespace");
			return projectWizard.enterTemplateCustomizationText("abc", 0, "Namespace");
		}).then(function(){
			console.log("enterTemplateCustomizationText - object collection");
			return projectWizard.enterTemplateCustomizationText("FlightCollection", 2, "Object Collection");
		}).then(function(){
			console.log("enterTemplateCustomizationText - object collection id");
			return projectWizard.enterTemplateCustomizationText("carrid", 2, "Object Collection ID");
		}).then(function(){
			console.log("enterTemplateCustomizationText - object title");
			return projectWizard.enterTemplateCustomizationText("connid", 2, "Object Title");
		}).then(function(){
			console.log("next");
			return projectWizard.next();
		}).then(function(){
			console.log("finish");
			return projectWizard.finishAndWait();
		}).then(function(){
			console.log("Select testFLPService.html");
			return repositoryBrowser.selectNode(configuration.projectName + "/webapp/test/testFLPService.html");
		}).then(function(){
			console.log("Run");
			return toolbar.pressButton("Run (Alt+F5)");
		}).then(function(){
			console.log("Switch to preview window");
			return runConfiguration.switchToWindow(false);
		}).then(function(){
			console.log("Check app header text");
			return appRuntime.waitForAppHeaderText("FlightCollection");
		}).then(function(){
			console.log("Switch back to Web IDE");
			return runConfiguration.switchToWindow(true);
		}).then(function(){
			console.log("open file");
			return repositoryBrowser.openFile(configuration.projectName + "/webapp/Component.js");
		}).then(function(){
			console.log("insert text");
			return codeEditor.insertText("sap.ui.");
		}).then(function(){
			console.log("wait for tab to be dirty");
			return content.waitUntilTabIsDirty(configuration.projectName + "/webapp/Component.js");
		}).then(function(){
			console.log("trigger auto complete");
			return codeEditor.triggerAutoCompletePopup();
		}).then(function(){
			console.log("choose auto complete proposal");
			return codeEditor.chooseAutoCompleteProposal("getCore() : sap.ui.core.Core");
		}).then(function(){
			console.log("save file");
			return toolbar.pressButton("Save (Ctrl+S)");
		}).then(function(){
			console.log("wait for tab to be undirty");
			return content.waitUntilTabIsNotDirty(configuration.projectName + "/webapp/Component.js");
		}).then(function(){
			console.log("deploy to HCP");
			return deploy.deployToHCP(configuration.projectName);
		}).then(function() {
			console.log("**********Start Git commit test**********");
			console.log("Open index.html file in code editor");
			return repositoryBrowser.openFile(configuration.projectName + "/webapp/test.html");
		}).then(function() {
			console.log("Edit file");
			return codeEditor.insertText("BlahBlah");
		}).then(function() {
			console.log("wait for tab to be dirty");
			return content.waitUntilTabIsDirty(configuration.projectName + "/webapp/test.html");
		}).	then(function() {
			console.log("Saving file...");
			return toolbar.pressButton("Save (Ctrl+S)");
		}).then(function() {
			console.log("wait for tab to be undirty");
			return content.waitUntilTabIsNotDirty(configuration.projectName + "/webapp/test.html");
		}).	then(function() {
			console.log("Opening Git pane");
			return git.toggleGitPane();
		}).then(function() {
			console.log("Staging all changes");
			return git.stageAll();
		}).then(function() {
			console.log("Adding commit description");
			return git.addCommitDescription("This is a test commit");
		}).then(function() {
			console.log("Pressing commit button");
			return git.commitChange();
		}).then(function() {
			console.log("Closing Git pane");
			return git.toggleGitPane();
		}).then(function() {
			assert(true).isTrue();
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("Smoke_Test.png", that).thenFinally(function(){
				return assert(false).isTrue();
			});
		});
	});
});