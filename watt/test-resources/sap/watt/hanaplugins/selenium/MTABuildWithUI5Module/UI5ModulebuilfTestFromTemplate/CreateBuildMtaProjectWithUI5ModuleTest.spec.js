var driverFactory = require('../../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	ProjectWizard = require('../../pageobjects/ProjectWizard'),
	configuration = require('./Configuration.js'),
	TestConfiguration = require("../../utilities/TestConfiguration"),
	path = require('path'),
	remote = require('selenium-webdriver/remote'),
	HanaLoginPage = require('../../pageobjects/HanaLoginPage'),
	utils = require('../../pageobjects/Utils'),
	RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
	Content = require('../../pageobjects/Content');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Smoke Test', function() {
	'use strict';
	this.timeout(configuration.startupTimeout);

	var driver;
	var webIDE;
	var projectWizard;
	var repositoryBrowser;
	var version;
	var content;

	var mappings = {
		projectFolder : {type : "css" , path : "li[title='$1'][aria-level='2']"},
		projectVersion : {type : 'css' , path : 'input[title="Application Version"]'},
		buildSuccessTitle : {type : 'xpath' , path : "//*[contains(text(),'Build of MTATest1 completed')]"}

	};

	beforeEach(function() {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
	});

	afterEach(function() {
		var that = this;
		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		return repositoryBrowser.deleteNode(configuration.projectName ).then(function() {
			return driver.saveScreenshot("CreateBuildMTAProject.png", that);
			//return repositoryBrowser.deleteNode("mta_archives/"+configuration.projectName ).then(function() {
	//			return driver.quit();

		//	});
	});
	});

	it('Create project', function() {
		driver.get(TestConfiguration.getParam(TestConfiguration.KEYS.HOST));

		var hanaLoginPage = new HanaLoginPage(driver);
		hanaLoginPage.setUserName(TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
		hanaLoginPage.setPassword(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
		hanaLoginPage.login();

		webIDE = new webide(driver, By, until, configuration);
		projectWizard = new ProjectWizard(driver, By, until, configuration);
		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);

		console.log("open project wizard");

			return webIDE.goThroughMenubarItemsAndSelect(["File", "New", "Project from Template"], true).then(function() {
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
			console.log("next");
				return driver.wait(until.elementLocated(utils.toLocator(mappings.projectVersion)),configuration.defaultTimeout).then(function(oElement) {
					return oElement.getAttribute("value").then(function(a){
						version = a;
						return projectWizard.next();
					});
				});

		}).then(function(){
			console.log("finish");
			return projectWizard.finishAndWait();
		}).then(function(){
			console.log("open project wizard");
			return webIDE.goThroughMenubarItemsAndSelect(["File", "New", "SAPUI5 Module for SAP HANA"]).then(function(){
			console.log("enterModuleName");
			return projectWizard.enterProjectName(configuration.moduleName);
		}).then(function(){
			console.log("next");
			return projectWizard.next();
		}).then(function(){
			console.log("finish");
			return projectWizard.finishAndWait();
		}).then(function() {
				console.log("build ui5 module");
				return webIDE.goThroughMenubarItemsAndSelect(["Build", "Build"])
			}).then (function(){
				console.log("select project");
				return repositoryBrowser.selectNode(configuration.projectName);
			}).then(function(){
				console.log("build MTA project");
		//		return webIDE.goThroughMenubarItemsAndSelect(["Build", "Build"]);
			}).then(function(){
				console.log("wait for build success");
			//	return driver.wait(until.elementLocated(utils.toLocator(mappings.buildSuccessTitle)),configuration.defaultTimeout);
			}).then(function(){
				console.log("Open mta_archives");
			//	return repositoryBrowser.openFile("mta_archives/"+configuration.projectName + "/"+configuration.projectName+"_"+version+".mtar");
			})
			assert(false).isTrue();
		});

	});
});