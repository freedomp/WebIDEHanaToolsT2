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
    Git = require('../../pageobjects/Git');
var By = webdriver.By,
    until = webdriver.until,
    promise = webdriver.promise;

describe('Selenium : Git Clone test', function() {
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
    var git;

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
        return driver.saveScreenshot("Clone_Test.png", this).then(function() {
            repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
            console.log("Delete the project "+configuration.cloneProjectName);
            return repositoryBrowser.deleteNode(configuration.cloneProjectName );
        });
    });

    it('Git Clone  test', function() {
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
        git = new Git(driver, By, until, configuration);
        var url;
        var projname=configuration.projectName;
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
            return webIDE.deleteAllProject()

        }).then(function() {
            console.log("Clone the project");
              return git.clone(configuration.repositoryURL,configuration.user,configuration.pass);
        }).then(function() {

            console.log("select "+configuration.file1+" under "+configuration.cloneProjectName);
            return repositoryBrowser.selectNode(configuration.cloneProjectName).then(function () {
                return repositoryBrowser.selectNode(configuration.cloneProjectName + "/" + configuration.file1).then(function () {
                    return git.checkCommitFile(configuration.file1);
                });
            });
        }).then(function() {

            console.log("select "+configuration.file2+" under "+configuration.cloneProjectName);
            return repositoryBrowser.selectNode(configuration.cloneProjectName).then(function () {
                return repositoryBrowser.selectNode(configuration.cloneProjectName+"/"+configuration.file2).then(function () {
                    return git.checkCommitFile(configuration.file2);
                });
            });
        }).then(function() {

            console.log("select "+configuration.file3+" under "+configuration.cloneProjectName);
                return repositoryBrowser.selectNode(configuration.cloneProjectName).then(function () {
                    return repositoryBrowser.selectNode(configuration.cloneProjectName + "/" + configuration.file3).then(function () {
                        return git.checkCommitFile(configuration.file3);
                    });
                });

        }).then(function() {
                console.log("The test is finished");

        });
    });
});