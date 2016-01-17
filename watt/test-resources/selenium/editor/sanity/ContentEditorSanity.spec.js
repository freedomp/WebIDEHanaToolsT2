'use strict';

var driverFactory = require('../../utilities/driverFactory'),
	test = require('selenium-webdriver/testing'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	remote = require('selenium-webdriver/remote'),
	WebIDE = require('../../pageobjects/WebIDE'),
	configuration = require('../Configuration.js'),
	HcpLoginPage = require('../../pageobjects/HcpLoginPage'),
	RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
	CodeEditor = require('../../pageobjects/CodeEditor'),
	Content = require('../../pageobjects/Content'),
	Toolbar = require('../../pageobjects/Toolbar'),
	utils = require('../../pageobjects/Utils'),
	path = require('path');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

var s1jsFileText = "var x = 1;\r\n" + "var y = 2;\r\n" + "x = y;";
var s2jsFileText = "var x = 3;\r\n" + "var y = 4;\r\n" + "x = y;\r\n\r\n" + "function testAdd( x, y) {\r\n\t" + "x = 1;\r\n\t" +
	"return x + y;\r\n" + "}\r\n\r\n" + "function testMultiply( x, y) {\r\n" + "\tx = 1;\r\n\t" + "return x * y;\r\n" + "}";
var s2jsFileTextWithComment = "var x = 3;\r\n" + "var y = 4;\r\n" + "x = y;\r\n\r\n" + "function testAdd( x, y) {\r\n\t" + "x = 1;\r\n\t" +
	"return x + y;\r\n" + "}\r\n\r\n" + "function testMultiply( x, y) {\r\n" + "\tx = 1;\r\n\t" + "return x * y;\r\n" + "// }";
describe('Editor_Content_Sanity_Test', function() {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var hcpLoginPage;
	var codeEditor;
	var repositoryBrowser;
	var content;
	var toolbar;

	beforeEach(function() {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector());
		webIDE = new WebIDE(driver, By, until, configuration);

		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		codeEditor = new CodeEditor(driver, By, until, configuration);
		content = new Content(driver, By, until, configuration);
		toolbar = new Toolbar(driver, By, until, configuration);
	});

	afterEach(function() {
		return utils.deleteProjectFromWorkspace(driver, "EditorSanity").thenFinally(function() {
			return driver.sleep(5000).then(function() {
				return driver.quit();
			});
		});
	});

	it('open files', function() {
		var that = this;
		var sFileData;
		driver.get(configuration.url);

		//TODO uncomment before submit
		hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		console.log("click on Development Perspective");
		return webIDE.clickDevelopmentPerspective().then(function() {
			console.log("before import");
			var sPath = path.resolve(__dirname, 'zip/EditorSanity.zip');
			console.log("zip file path: " + sPath);
			return webIDE.importZip(sPath);
		}).then(function() {
//******Open files in new tabs ******************************************************************************
			//Open all the files one after the other
			console.log("open 2.js");
			return repositoryBrowser.openFile("EditorSanity/2.js");
		}).then(function() {
			console.log("open 3.js");
			return repositoryBrowser.openFile("EditorSanity/3.js");
		}).then(function() {
			console.log("open 4.xml");
			return repositoryBrowser.openFile("EditorSanity/4.xml");
		}).then(function() {
			console.log("open 5.json");
			return repositoryBrowser.openFile("EditorSanity/5.json");
		}).then(function() {
			console.log("open 1.js");
			return repositoryBrowser.openFile("EditorSanity/1.js");
		}).then(function(){
//******Check the text in the file update the texts check dirty, save and check un-dirty *************************
			//Do validation in the last file opened
			console.log("file 1.js opened");
			return codeEditor.getText();
		}).then(function(sFirstFileData) {
			console.log("validate file 1.js text: " +sFirstFileData);
			assert(sFirstFileData === s1jsFileText).isTrue();
			return;
		}).then(function(){
			//Update the file with new data
			return codeEditor.clearText();
		}).then(function(){
			console.log("update file 1.js");
			return codeEditor.insertText("this is file 1.js");
		}).then(function(){
			console.log("Tab is dirty");
			return content.waitUntilTabIsDirty("EditorSanity/1.js");
		}).then(function(){
			console.log("Press save");
			return toolbar.pressButton("Save (Ctrl+S)");
		}).then(function(){
			console.log("Save success");
			console.log("Check that Tab 1.js is no longer dirty");
			return content.waitUntilTabIsNotDirty("EditorSanity/1.js");
		}).then(function() {
//******Press another tab and press go to last edited file
			console.log("Tab 2.js (first tab) is to be selected");
			return content.clickOnEditorTab("0");
		}).then(function() {
			//Open file and validate content
			console.log("file 2.js opened");
			return codeEditor.getText();
		}).then(function(s2jsFileData) {
			console.log("***validate file 2.js text: \n" + s2jsFileData);
			sFileData = s2jsFileData;
			return assert(s2jsFileData === s2jsFileText).isTrue();
		}).then(function() {
			//press navigate to last edited open file
			return toolbar.pressButton("Last Edit Location (Ctrl+Shift+9)");
		}).then(function(){
			//Do validation in the last file edited
			console.log("file 1.js is in focus");
			return codeEditor.getText();
		}).then(function(sEditedFileData) {
			console.log("validate file 1.js text: " +sEditedFileData);
			return assert("this is file 1.js" === sEditedFileData).isTrue();
		}).then(function() {
//******Close tab **************************************************************
			//Close the current tab
			console.log("close the 1.js file");
			return content.clickOnEditorTabClose("4");
		}).then(function() {
			//get text of the previous tab that now is in focus
			console.log("get focus file in focus after close data: 2.js");
			return codeEditor.getText();
		}).then(function(sCurrFileData){
			//validate current tab is the previous tab
			console.log("validate data (2.js) is correct: " + sCurrFileData);
			return assert(s2jsFileText === sCurrFileData).isTrue();
//******context menu test******************************************************************
		}).then(function(){
			console.log("open the context menu at the current cursor position");
			return codeEditor.openContextMenu();
		}).then(function(){
			console.log("add comment line at the current line");
			return codeEditor.chooseMenuItemInContextMenu("editor", "linecomment");
		}).then(function(){
			console.log("read 2.js file text");
			return codeEditor.getText(true);
		}).then(function(sFileDataWithRemark){
			//validate current tab is the previous tab
			console.log("validate data (2.js) with commented code is correct: " + sFileDataWithRemark);
			return assert(s2jsFileTextWithComment === sFileDataWithRemark).isTrue();
		}).then(function(){
			console.log("open the context menu at the current cursor position");
			return codeEditor.openContextMenu();
		}).then(function(){
			console.log("remove commented line at the current line");
			return codeEditor.chooseMenuItemInContextMenu("editor", "linecomment");
		}).then(function(){
			console.log("read 2.js file text");
			return codeEditor.getText(true);
		}).then(function(sFileDataWithRemovedRemark){
			//validate current tab is the previous tab
			console.log("validate data (2.js) with no commented is correct: " + sFileDataWithRemovedRemark);
			return assert(s2jsFileText === sFileDataWithRemovedRemark).isTrue();
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("open_appdescriptor.png", that).thenFinally(function(){
				return assert(false).isTrue();
			});
		});
	});
});