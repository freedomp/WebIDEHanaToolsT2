var driverFactory = require('../../utilities/driverFactory'),
    webdriver = require('selenium-webdriver'),
    assert = require('selenium-webdriver/testing/assert'),
    webide = require('../../pageobjects/WebIDE'),
    ProjectWizard = require('../../pageobjects/ProjectWizard'),
    runconfiguration = require('../../pageobjects/RunConfiguration'),
    configuration = require('./Configuration.js'),
    TestConfiguration = require("../../utilities/TestConfiguration"),
    path = require('path'),
    CodeEditor = require('../../pageobjects/CodeEditor'),
    remote = require('selenium-webdriver/remote'),
    HanaLoginPage = require('../../pageobjects/HanaLoginPage'),
    utils = require('../../pageobjects/Utils'),
    RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
    Content = require('../../pageobjects/Content'),
    AppRuntime = require('../../pageobjects/AppRunTime');
var By = webdriver.By,
    until = webdriver.until,
    promise = webdriver.promise;

describe('Selenium : Takt 11 demo test', function() {
    'use strict';
    this.timeout(configuration.startupTimeout);

    var driver;
    var webIDE;
    var projectWizard;
    var repositoryBrowser;
    var version;
    var content;
    var runConfiguration;
    var appRuntime;
    var codeEditor;

    var mappings = {
        projectFolder : {type : "css" , path : "li[title='$1'][aria-level='2']"},
        projectVersion : {type : 'css' , path : 'input[title="Application Version"]'},
        buildSuccessTitle : {type : 'xpath' , path : "//*[contains(text(),'Finished indexing. 35 files found')]"},
        mtaProject: {type: 'css' , path : 'span[title="Multi Target Application"]'},
        projectInTree : {type : 'xpath' , path :'//span[@class ="sapUiTreeNodeContent"][text()="$1"]'}

    };

    beforeEach(function() {
        driver = driverFactory.createDriver();
        driver.setFileDetector(new remote.FileDetector);
    });

    afterEach(function() {
        console.log("After each test");
        console.log("Take a screenshot");
        return driver.saveScreenshot("Smoke_Test.png", this).then(function() {
            repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
            console.log("Delete the project "+configuration.projectName);
            return repositoryBrowser.deleteNode(configuration.projectName );
        });
    });

    it('Takt 11 demo test', function() {
        console.log("Start the test");
        driver.get(TestConfiguration.getParam(TestConfiguration.KEYS.HOST));

        var hanaLoginPage = new HanaLoginPage(driver);
        console.log("Log In");
        hanaLoginPage.setUserName(TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
        hanaLoginPage.setPassword(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
        console.log("Username for LogIn is  : "+TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
        console.log("Password for LogIn is : " +TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
        hanaLoginPage.login();

        webIDE = new webide(driver, By, until, configuration);
        projectWizard = new ProjectWizard(driver, By, until, configuration);
        repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
        runConfiguration = new runconfiguration(driver, By, until, configuration);
        appRuntime = new AppRuntime(driver, By, until, configuration);
        codeEditor = new CodeEditor(driver, By, until, configuration);
        var url;
        var projname=configuration.projectName;
        var that =this;
        console.log("Check the error message");
        return webIDE.checkErrorMessage().then(function() {
            console.log("Check the error message");
            return webIDE.checkErrorMessage();
        }).then(function() {
            console.log("refresh browser ");
            return driver.navigate().refresh();

        }).then(function() {
            console.log("Check the error message");
            return webIDE.checkErrorMessage();

        }).then(function() {
            console.log("Check the error message");
            return webIDE.checkErrorMessage();

        }).then(function() {
        console.log("Select Local ");
            return driver.myWaitAndClick(utils.toLocator(mappings.projectInTree ,[configuration.localName]), configuration.defaultTimeout);
        }).then(function() {
          //  console.log("Delete All Project");
           // return webIDE.deleteAllProject()

        }).then(function(){
              console.log("Import project " + configuration.projectName);
              return webIDE.importZip(path.resolve(__dirname, 'zip/takt11demo.zip'),projname);
        }).then(function() {

            console.log("select project "+configuration.projectName);
            return repositoryBrowser.selectNode(configuration.projectName);
        }).then(function(){
            console.log("Open the project type dialog  ");
           return webIDE.projectType(configuration.projectName);
        }).then(function(){
            console.log("Check the project type of MTA project");
            return driver.wait(until.elementLocated(utils.toLocator(mappings.mtaProject)),configuration.defaultTimeout);
        }).then(function(){
        console.log("Check console exist");
        return webIDE.checkOpenConsole();
        }).then(function(){
            console.log("Select db module");
            return repositoryBrowser.selectNode(configuration.projectName+"/db");
        }).then(function(){
            console.log("Build db module");
            return webIDE.goThroughMenubarItemsAndSelect(["Build", "Build"]);
        }).then(function(){
            console.log("Check build status");
            return webIDE.checkBuildStatus(configuration.projectName);
        }).then(function(){
            console.log("Select project js");
            return repositoryBrowser.selectNode(configuration.projectName+"/js");
        }).then(function(){
            console.log("Run Configuration of js");
            return webIDE.runConfiguration(configuration.projectName,"js");
        }).then(function(){
            return runConfiguration.NewRunConfiguration();
        }).then(function(){
            return runConfiguration.enterApplicationPath("/" + configuration.projectName + "/js/"+configuration.jsApplication);
        }).then(function() {
            console.log("Click Run now");
            return runConfiguration.RunNow();
        }).then(function(){
            console.log("Switch to preview window");
            return runConfiguration.switchToWindow(false);
        }).then(function(){
            console.log("Check inner text in preview window");
            return appRuntime.isInnerTextExists('Unauthorized');
        }).then(function(){
            console.log("Copy the URL");

            that.url=appRuntime.currentURL();
            return that.url;
        }).then(function(){
            console.log("Switch back to Web IDE");
            return runConfiguration.switchToWindow(true);
        }).then(function(){
            console.log("Open file "+ configuration.projectName + "/mta.yaml" );
            return repositoryBrowser.openFile(configuration.projectName + "/mta.yaml");
        }).then(function(){
            console.log("Select web module");
            return repositoryBrowser.selectNode(configuration.projectName+"/web");
        }).then(function(){
            console.log("Run web application");
            return webIDE.runSelectedAppAsWebApplication();
        })
            .then(function(){
            console.log("Switch to preview window");
            return runConfiguration.switchToWindow(false);
              }).then(function(){
            console.log("Get app header");
            return appRuntime.getAppHeaderTitle();
        }).then(function(sHeader){
            console.log("Check header text");
            return assert(sHeader).equalTo(configuration.appHeaderTitle, "Application header should be " + configuration.appHeaderTitle);
        }).then(function(){
            console.log("Click on Crate Data i runtime");
            return appRuntime.clickOnCreateDataButton();
        }).then(function(){
            console.log("Get app data");
            return appRuntime.isDataCellExist("My Book");

        }).then(function() {
            console.log("Switch back to Web IDE");
            return runConfiguration.switchToWindow(true);
        }).then(function() {
                console.log("The test is finished");

        });
    });
});