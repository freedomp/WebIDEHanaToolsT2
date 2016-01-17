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
NewRunConfigurations = require('../../pageobjects/NewRunConfigurations');

var By = webdriver.By,
    until = webdriver.until,
    promise = webdriver.promise;

describe("General Flow", function () {
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
    var newRunConfigurations;
    var watingForLoadingOfTabs = 1000;

    var mappings = {
        projectFolder: {type: "css", path: "li[title='$1'][aria-level='2']"}
    };

    beforeEach(function () {
        driver = driverFactory.createDriver();
        driver.setFileDetector(new remote.FileDetector);
    });


    afterEach(function () {
        return utils.deleteProjectFromWorkspace(driver, configuration.projectName).thenFinally(function () {
            return driver.sleep(5000).then(function () {
                return driver.quit();
            });
        });
    });

    it('General flow 1', function () {
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
        newRunConfigurations = new NewRunConfigurations(driver, By, until, configuration);

        console.log("click welcome perspective");
        return webIDE.clickWelcomePerspective().then(function () {
            console.log("open project wizard");
            return projectWizard.openFromWelcomePerspective();
        }).then(function () {
            console.log("select template category");
            return projectWizard.selectTemplateCategory(configuration.templateCategory);
        }).then(function () {
            console.log("selectTemplate");
            return projectWizard.selectTemplate(configuration.templateName);
        }).then(function () {
            console.log("next");
            return projectWizard.next();
        }).then(function () {
            console.log("enterProjectName");
            return projectWizard.enterProjectName(configuration.projectName);
        }).then(function () {
            console.log("next");
            return projectWizard.next();
        }).then(function () {
            console.log("next");
            return projectWizard.next();
        }).then(function () {
            console.log("finish");
            return projectWizard.finishAndWait();
        }).then(function () {
            console.log("Select index.html");
            return repositoryBrowser.selectNode(configuration.projectName + "/webapp/index.html");
        }).then(function () {
            console.log("Pressing run button (from upper menu) ans then run configurations");
            return webIDE.goThroughMenubarItemsAndSelect(["Run", "Run Configurations ..."]);
        }).then(function () {
            console.log("Pressing the + sign for new run configuration form");
            return newRunConfigurations.newRunConfiguration();
        }).then(function(){
            console.log("Choose Web Application");
            return newRunConfigurations.chooseWebApplication();
        }).then(function(){
            console.log("Click the URL Components tab");
            return newRunConfigurations.clickURLComponentsTab();
        }).then(function(){
            console.log("Click the Advanced Settings tab");
            return newRunConfigurations.clickAdvancedSettingsTab();
        }).then(function(){
            console.log("Click the general tab");
            return newRunConfigurations.clickGeneralTab();
        }).then(function(){
            console.log("Click the save and run button");
            return newRunConfigurations.clickRun();
        }).then(function(){
            console.log("Switch to preview window");
            return runConfiguration.switchToWindow(false);
        }).then(function(){
            console.log("Letting the page load");
            return appRuntime.waitForAppHeaderText("Title");
        }).then(function(){
            console.log("Switch to development window");
            return runConfiguration.switchToWindow(true);
        }).then(function () {
            console.log("Select index.html");
            return repositoryBrowser.selectNode(configuration.projectName + "/webapp/index.html");
        }).then(function () {
            console.log("Pressing run button (from upper menu) ans then run configurations");
            return webIDE.goThroughMenubarItemsAndSelect(["Run", "Run Configurations ..."]);
        }).then(function () {
            console.log("Pressing the + sign for new run configuration form");
            return newRunConfigurations.newRunConfiguration();
        }).then(function(){
            console.log("Choose unit test configuration");
            return newRunConfigurations.chooseUnitTest();
        }).then(function(){
            driver.sleep(watingForLoadingOfTabs);
            console.log("Click the general tab");
            return newRunConfigurations.clickAdvancedSettingsTab();
        }).then(function () {
            console.log("Pressing the + sign for new run configuration form");
            return newRunConfigurations.newRunConfiguration();
        }).then(function(){
            console.log("Choose firoi sandbox configuration");
            return newRunConfigurations.chooseFioriSandbox();
        }).then(function(){
            driver.sleep(watingForLoadingOfTabs);
            console.log("Click the URL Components tab");
            return newRunConfigurations.clickURLComponentsTab();
        }).then(function(){
            console.log("Click the Advanced Settings tab");
            return newRunConfigurations.clickAdvancedSettingsTab();
        }).then(function(){
            console.log("Click the general tab");
            return newRunConfigurations.clickGeneralTab();
        }).then(function () {
            console.log("Pressing the + sign for new run configuration form");
            return newRunConfigurations.newRunConfiguration();
        }).then(function(){
            console.log("Choose embedded mode configuration");
            return newRunConfigurations.chooseEmbedded();
        }).then(function(){
            driver.sleep(watingForLoadingOfTabs);
            console.log("Click the URL Components tab");
            return newRunConfigurations.clickURLComponentsTab();
        }).then(function(){
            console.log("Click the Advanced Settings tab");
            return newRunConfigurations.clickAdvancedSettingsTab();
        }).then(function(){
            console.log("Click the general tab");
            return newRunConfigurations.clickGeneralTab();
        }).then(function () {
            assert(true).isTrue();
        }).thenCatch(function (oError) {
            console.log(oError);
            console.log("Save screenshot");
            return driver.saveScreenshot("General_flow.png", that).thenFinally(function () {
                return assert(false).isTrue();
            });
        });
    });

});