var driverFactory = require('../../utilities/driverFactory'),
    webdriver = require('selenium-webdriver'),
    assert = require('selenium-webdriver/testing/assert'),
    webide = require('../../pageobjects/WebIDE'),
    configuration = require('./Configuration.js'),
    TestConfiguration = require("../../utilities/TestConfiguration"),
    path = require('path'),
    remote = require('selenium-webdriver/remote'),
    HanaLoginPage = require('../../pageobjects/HanaLoginPage'),
    utils = require('../../pageobjects/Utils'),
    RepositoryBrowser = require('../../pageobjects/RepositoryBrowser');
var By = webdriver.By,
    until = webdriver.until,
    promise = webdriver.promise;

describe('Selenium : Copy/Move Modules test', function() {
    'use strict';
    this.timeout(configuration.startupTimeout);

    var driver;
    var webIDE;
    var repositoryBrowser;

    var mappings = {
        projectTypes :{type : 'xpath' , path :'//div[contains(@class ,"sapUiVltCell")]/button[.="Project Types"]'},
        dbModule: {type: 'css' , path : 'span[title="HDB Module"]'},
        ui5Module: {type: 'css' , path : 'span[title="HTML5 Module"]'},
        mtaProject: {type: 'css' , path : 'span[title="Multi Target Application"]'}
    };

    beforeEach(function() {
        driver = driverFactory.createDriver();
        driver.setFileDetector(new remote.FileDetector);
    });

    afterEach(function() {
        console.log("After each test");
        repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
        console.log("Take a screenshot");
        return driver.saveScreenshot("Copy_move_modules_test.png", this).then(function() {
            return repositoryBrowser.deleteNode(configuration.projectName).then(function () {
                console.log("Delete the Project "+configuration.projectName);
                repositoryBrowser.deleteNode(configuration.targetProjectName);
            });
        });
    });
    it('Copy/Move Modules test', function() {
        console.log("Start the test");
        driver.get(TestConfiguration.getParam(TestConfiguration.KEYS.HOST));

        var hanaLoginPage = new HanaLoginPage(driver);
        console.log("Log In");
        hanaLoginPage.setUserName(TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
        hanaLoginPage.setPassword(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
        hanaLoginPage.login();

        webIDE = new webide(driver, By, until, configuration);
        repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
        var url;
        var that =this;
        console.log("Check the error message");
        return webIDE.checkErrorMessage().then(function() {
            console.log("Check the error message");
            return webIDE.checkErrorMessage();
        }).then(function() {
            console.log("Selecting workspace root element");
            return webIDE.selectRepositoryTreeRoot();
        }).then(function() {
        console.log("Delete All Project");
        return webIDE.deleteAllProject();

        }).then(function() {
            console.log("create new mta project from template");
            return webIDE.createMtaProjectFromTemplate(configuration.targetProjectName);
        }).then(function(){
            console.log("Import project " + configuration.projectName);
            return webIDE.selectRepositoryTreeRoot();
        }).then(function(){
            return webIDE.importZip(path.resolve(__dirname, 'zip/takt7demo.zip'),configuration.projectName);
        }).then(function(){
            console.log("Select db module");
            return repositoryBrowser.selectNode(configuration.projectName+"/db", null);

        }).then(function(oElement){
            return driver.rightClick(oElement);
        }).then(function(){
            console.log("Context Menue Copy");
            return webIDE.selectFromContextMenu("Copy");
        }).then(function(){
            console.log("Select target project");
            return webIDE.getRepositoryTreeFileElement(configuration.targetProjectName, null);
        }).then(function(oElement){
            return driver.rightClick(oElement);
        }).then(function(){
            console.log("Context Menue Paste");
            return webIDE.selectFromContextMenu("Paste");
        }).then(function(){
            console.log("Select target project");
            return webIDE.getRepositoryTreeFileElement(configuration.targetProjectName, null);
        }).then(function(){
            console.log("Open Project Settings->Project type of copied db module");
            return webIDE.projectTypeForModule(configuration.targetProjectName+"/db");
        }).then(function(){
            console.log("Check the project type of the copied db module is: MTA");//since it is a folder - it takes the parent projet's type
            return driver.wait(until.elementLocated(utils.toLocator(mappings.mtaProject)),configuration.defaultTimeout);
        }).then(function(){
            console.log("Select db module in target project");
            return repositoryBrowser.selectNode(configuration.targetProjectName+"/db", null);
        }).then(function() {
            console.log("Check console exist");
            return webIDE.checkOpenConsole();
        }).then(function () {
            console.log("Convert the db  folder to module");
            return webIDE.convertTo(configuration.targetProjectName + "/"+configuration.hdbModuleName, "HDB Module");
        }).then(function(){
            console.log("Check convert status");
            return webIDE.checkConvertStatus(configuration.hdbModuleName);
        }).then(function(){
            console.log("Open Project Settings->Project type of copied db module");
            return webIDE.projectTypeForModule(configuration.targetProjectName+"/db");
        }).then(function(){
            console.log("Check the project type of the copied db module is: HDB Module");//now type should be HDB Module
            return driver.wait(until.elementLocated(utils.toLocator(mappings.dbModule)),configuration.defaultTimeout);
        }).then(function(){
            console.log("Select web module");
            return repositoryBrowser.selectNode(configuration.projectName+"/web", null);

        }).then(function(oElement){
            return driver.rightClick(oElement);
        }).then(function(){
            console.log("Context Menue Cut");
            return webIDE.selectFromContextMenu("Cut");
        }).then(function(){
            console.log("Select target project");
            return repositoryBrowser.selectNode(configuration.targetProjectName, null);

        }).then(function(oElement){
            return driver.rightClick(oElement);
        }).then(function(){
            console.log("Context Menue Paste");
            return webIDE.selectFromContextMenu("Paste");
        }).then(function(){
                console.log("Select target project");
                return repositoryBrowser.selectNode(configuration.targetProjectName, null);

        }).then(function(){
            console.log("Open Project Settings->Project type of copied web module");
            return webIDE.projectTypeForModule(configuration.targetProjectName+"/web");
        }).then(function(){
            console.log("Check the project type of copied web module is: MTA");//since it is a folder - it takes the parent projet's type
            return driver.wait(until.elementLocated(utils.toLocator(mappings.mtaProject)),configuration.defaultTimeout);
        }).then(function(){
            console.log("Select web module in target project");
            return repositoryBrowser.selectNode(configuration.targetProjectName+"/web", null);
        }).then(function(){
            console.log("Check console exist");
            return webIDE.checkOpenConsole();
        }).then(function () {
            console.log("Convert the db  folder to module");
            return webIDE.convertTo(configuration.targetProjectName + "/"+configuration.ui5ModulName, "HTML5 Module");
        }).then(function(){
            console.log("Check convert status");
            return webIDE.checkConvertStatus(configuration.ui5ModulName);
        }).then(function(){
            console.log("Select target project");
            return repositoryBrowser.selectNode(configuration.targetProjectName, null);

        }).then(function(){
            console.log("Open Project Settings->Project type of copied web module");
            return webIDE.projectTypeForModule(configuration.targetProjectName+"/web");
        }).then(function(){
            console.log("Check the project type of the copied web module is: HTML5 Module");//now type should be HTML5 Module
            return driver.wait(until.elementLocated(utils.toLocator(mappings.ui5Module)),configuration.defaultTimeout);
        }).then(function() {
            console.log("The test is finished");

        }); //TODO add test for rename module and then trying to convert - should not allow in menue(disabled)!!!
    });
});