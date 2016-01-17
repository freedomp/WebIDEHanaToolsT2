var driverFactory = require('../../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	FileDialogBox = require('../../pageobjects/FileDialogBox'),
	configuration = require('./Configuration.js'),
	TestConfiguration = require("../../utilities/TestConfiguration"),
	remote = require('selenium-webdriver/remote'),
	HanaLoginPage = require('../../pageobjects/HanaLoginPage'),
	RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
	path = require('path');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Selenium: Copy/Cut Paste with rename operations on files/folders test', function() {
	'use strict';
	this.timeout(configuration.startupTimeout);

	var driver;
	var webIDE;
	var repositoryBrowser;
        var fileDialogBox;

    beforeEach(function () {
        driver = driverFactory.createDriver();
        driver.setFileDetector(new remote.FileDetector);
    });

    afterEach(function () {
        var that = this;
        repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
        return repositoryBrowser.deleteNode(configuration.projectName).then(function () {
            return driver.saveScreenshot("Copy_Cut_Paste.png", that);
        });
    });

	it('Copy/Cut Paste with rename operations on files/folders', function() {
		driver.get(TestConfiguration.getParam(TestConfiguration.KEYS.HOST));

		var hanaLoginPage = new HanaLoginPage(driver);
		hanaLoginPage.setUserName(TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
		hanaLoginPage.setPassword(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
		hanaLoginPage.login();

		webIDE = new webide(driver, By, until, configuration);
		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		fileDialogBox = new FileDialogBox(driver, By, until, configuration);
                
                var importedProjectPath = configuration.importedProjectZipPath;
                var projectRoot = configuration.projectName;
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
            console.log("importing project zip file");
                return webIDE.importZip(path.resolve(__dirname, importedProjectPath),configuration.projectName);
        }).then(function(){
                    console.log("coping " + projectRoot + '/js/hello-world.js' + " to " + projectRoot + '/js');
                    doCopyPasteWithDefaultRename(projectRoot + '/js/hello-world.js', projectRoot + '/js');
                }).then(function(){
                    console.log("moving " + projectRoot + '/js/CopyOfhello-world.js' + " to " + projectRoot + '/js');
                    doCutPasteWithDefaultRename(projectRoot + '/js/CopyOfhello-world.js', projectRoot + '/js');
                }).then(function(){
                    console.log("coping " + projectRoot + '/web/web' + " to " + projectRoot + '/web');
                    doCopyPasteWithDefaultRename(projectRoot + '/web/web', projectRoot + '/web');
                }).then(function(){
                    console.log("moving " + projectRoot + '/web/CopyOfweb' + " to " + projectRoot + '/web');
                    doCutPasteWithDefaultRename(projectRoot + '/web/CopyOfweb', projectRoot + '/web');
                });
	});
        
        // helper function to copy sFrom to sTo location
        function doCopyPasteWithDefaultRename(sFrom, sTo){
            return _doCopyOrCutAndPasteConfirmNewName(sFrom, sTo, 'Copy');
        }
        
        // helper function to cut sFrom to sTo location
        function doCutPasteWithDefaultRename(sFrom, sTo){
            return _doCopyOrCutAndPasteConfirmNewName(sFrom, sTo, 'Cut');
        }
        
        function _doCopyOrCutAndPasteConfirmNewName(sFrom, sTo, sAction) {
        var src = sFrom.split('/').pop();
        console.log("select file " + src);
        return repositoryBrowser.selectNode(sFrom).then(function () {
            console.log(sAction + " file " + src);
            return webIDE.goThroughMenubarItemsAndSelect(["Edit", sAction]);
        }).then(function () {
            console.log("select module " + 'js');
            return repositoryBrowser.selectNode(sTo);
        }).then(function () {
            console.log("Pasting file " + 'CopyOf' + src);
            return webIDE.goThroughMenubarItemsAndSelect(["Edit", "Paste"]);
        }).then(function () {
            return fileDialogBox.clickOkButton();
        });
    }
});