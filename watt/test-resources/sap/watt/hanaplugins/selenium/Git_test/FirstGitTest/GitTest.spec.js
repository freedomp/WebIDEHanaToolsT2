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

describe('Selenium : First Git test', function() {
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
            return repositoryBrowser.deleteNode(configuration.cloneProjectName ).then(function() {
                return repositoryBrowser.deleteNode(configuration.cloneProjectName1 );
            });
        });
    });

    it('First Git test', function() {
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
            driver.sleep(2 * 1000);
            console.log("Clone the project");
              return git.clone(configuration.repositoryURL,configuration.user,configuration.pass);
        }).then(function() {

            console.log("select Clone Project "+configuration.cloneProjectName);
            return repositoryBrowser.selectNode(configuration.cloneProjectName).then(function () {
                console.log("select "+configuration.file1+" under "+configuration.cloneProjectName);
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
            console.log("Selecting workspace root element");
            return webIDE.selectRepositoryTreeRoot();
        }).then(function() {
            console.log("Clone the project");
            return git.clone(configuration.repositoryURL,configuration.user,configuration.pass);
        }).then(function() {

            console.log("select "+configuration.file1+" under "+configuration.cloneProjectName1);
            return repositoryBrowser.selectNode(configuration.cloneProjectName1).then(function () {
                return repositoryBrowser.selectNode(configuration.cloneProjectName1 + "/" + configuration.file1).then(function () {
                    return git.checkCommitFile(configuration.file1);
                });
            });
        }).then(function() {

            console.log("select "+configuration.file2+" under "+configuration.cloneProjectName1);
            return repositoryBrowser.selectNode(configuration.cloneProjectName1).then(function () {
                return repositoryBrowser.selectNode(configuration.cloneProjectName1+"/"+configuration.file2).then(function () {
                    return git.checkCommitFile(configuration.file2);
                });
            });
        }).then(function() {

            console.log("select "+configuration.file3+" under "+configuration.cloneProjectName1);
            return repositoryBrowser.selectNode(configuration.cloneProjectName1).then(function () {
                return repositoryBrowser.selectNode(configuration.cloneProjectName1 + "/" + configuration.file3).then(function () {
                    return git.checkCommitFile(configuration.file3);
                });
            });

        }).then (function(){
            console.log("select first clone project "+configuration.cloneProjectName);
            return repositoryBrowser.selectNode(configuration.cloneProjectName);
        }).then(function(){

            return createSetFileAndSave(configuration.testfile,configuration.cloneProjectName+"/"+configuration.testfile,'Files/'+configuration.testfile);
        }).then(function(){
            console.log("Check if git Panel open or close");
            return git.checkOpenGitPanel();
        }).then (function(){
            console.log("select first clone project "+configuration.cloneProjectName);
            return repositoryBrowser.selectNode(configuration.cloneProjectName+"/"+configuration.testfile );
        }).then(function(){
            console.log("Add Commit Description ");
            return git.addCommitDescription("Test text");
        }).then(function(){
            console.log("Add file to stage ");
            return git.stageFile(configuration.testfile);
        }).then(function(){
            console.log("Press on Commit button  ");
            return git.commitChange();
        }).then(function(){
  //          console.log("Press on Push button  ");
   //         return git.pushChange("origin/master","admin","admin");
        }).then (function(){
            return repositoryBrowser.selectNode(configuration.cloneProjectName1+"/"+configuration.file1).then(function () {
                return replaceAndCloseFile(configuration.file1, configuration.cloneProjectName + "/" + configuration.file1, 'Files/' + configuration.file1);
            });
        }).then(function(){
            console.log("Add Commit Description ");
            return git.addCommitDescription("Add text to file");
        }).then(function(){
            console.log("Add "+configuration.file1+" to stage ");
            return git.stageFile(configuration.file1);
        }).then(function(){
            console.log("Press on Commit button  ");
            return git.commitChange();
        }).then(function(){
            console.log("Delete the "+configuration.file2 + " under Clone project "+configuration.cloneProjectName);
            return repositoryBrowser.deleteNode(configuration.cloneProjectName+"/"+configuration.file2 );
        }).then(function(){
            console.log("Add Commit Description ");
            return git.addCommitDescription("Delete file");
        }).then(function(){
            console.log("Add file to stage ");
            return git.stageFile(configuration.file2);
        }).then(function(){
            console.log("Press on Commit button  ");
            return git.commitChange();
        }).then(function() {
                console.log("The test is finished");

        });

        //openGitPane
    });
    var createSetFileAndSave = function(fileName,url1,url2) {
        console.log("Create new file " + url1);
        return webIDE.createNewFile(fileName).then(function () {
            console.log("Set text to file " + url1);
            var filePath = path.resolve(__dirname, url2);
            return repositoryBrowser.readFile(filePath).then(function (data) {
                return webIDE.selectTab("/" + url1).then(function () {
                    return codeEditor.setText(data).then(function () {
                        console.log("save file " + url1);
                        return webIDE.clickOnSave().then(function(){
                            console.log("Close the TAB "+ fileName);
                            return webIDE.closeTab(fileName).then(function(){});
                        });
                    });
                });
            });


        });
    };
    var replaceAndCloseFile = function(fileName,url1,url2) {
        console.log("edit  file "+fileName);
        var filePath = path.resolve(__dirname, url2);
        return repositoryBrowser.readFile(filePath).then(function(data){
            return repositoryBrowser.openFile(url1).then(function () {
                return codeEditor.replacefileinEditor(data).then(function () {
                    console.log("Close the TAB "+ fileName);
                    return webIDE.closeTab(fileName).then(function(){});
                });
            });
        });

    }
});