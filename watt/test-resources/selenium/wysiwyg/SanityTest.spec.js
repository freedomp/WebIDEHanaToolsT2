'use strict';

var path = require('path');

var webdriver = require('selenium-webdriver'),
	test = require('selenium-webdriver/testing'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../pageobjects/WebIDE'),
	wysiwyg = require('../pageobjects/Wysiwyg'),
	utils = require('../pageobjects/Utils'),
	driverFactory = require('../utilities/driverFactory'),
	configuration = require('./Configuration.js'),
	HcpLoginPage = require('../pageobjects/HcpLoginPage'),
	remote = require('selenium-webdriver/remote');

var By = webdriver.By,
	until = webdriver.until;

var mappings = {
	sanityDetailViewIconTabFilter1form :  {type : 'id' , path :'__xmlview0--iconTabFilter1form--Form'},
	sanityProjectProjectJson :  {type : 'css' , path :'.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder[title="sanity"]  ~ ul .wattTreeFile[title=".project.json"]'},
	detailViewTabInEditor : {type: 'css', path: 'a[title="/sanity/view/Detail.view.xml"]'}
};

/**
 * Sanity test for Layout Editor
 * Opens a simple ui5 xml view file with both code editor and layout editor
 */
describe('WYSIWYG Sanity test', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var w5g;

	before(function (done) {

		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
		webIDE = new webide(driver, By, until, configuration);
		w5g = new wysiwyg(driver, By, until, configuration);

		driver.get(configuration.getParam(configuration.KEYS.HOST));

		//for now comment this line when working locally and sso is in action..
		var hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		return webIDE.clickDevelopmentPerspective().then(
			function(){
				webIDE.importZip(path.resolve(__dirname, 'zip/sanity.zip') , true).then(function(){
					return driver.myWait(utils.toLocator(mappings.sanityProjectProjectJson, configuration.defaultTimeout)).then(function(){
						done();
					});
				});
			}
		);
	});

	after(function (done) {
		//Delete the imported project
		return driver.switchTo().defaultContent().then(function(){
			return webIDE.deleteProjectByName("sanity").then(function() {
				return driver.quit();
			}).then(function() {
				done();
			});
		});
	});

	it(
		'Open detail.xml in the code editor',
		function (done) {
			webIDE.openRepositoryTreeFile("sanity/view" , "Detail.view.xml").then(function() {
				//We have to wait until the file opens in order to progress since we do not the file to open after we
				//selected something else and remove the selection from where we expect it.
				return driver.myWait(utils.toLocator(mappings.detailViewTabInEditor, configuration.defaultTimeout));
			}).then(function(){
				done();
			});
		}
	);

	it(
		'Open detail.xml in the layout editor',
		function (done) {
			w5g.openLayoutEditorForFile("sanity/view" , "Detail.view.xml").then(
				function(){
					return driver.switchTo().frame("__iframe0").then(function(){
						//ensure that the w5g was opened by waiting to inner element to be rendered
						return driver.myWait(utils.toLocator(mappings.sanityDetailViewIconTabFilter1form, configuration.defaultTimeout)).then(function(){
							done();
						});
					});

				}
			);
		}
	);
});
