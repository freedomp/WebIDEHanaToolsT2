var path = require('path');

var webdriver = require('selenium-webdriver'),
	test = require('selenium-webdriver/testing'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	projectwizard = require('../../pageobjects/ProjectWizard'),
	configuration = require('./Configuration.js'),
	utils = require('../../pageobjects/Utils');

var By = webdriver.By,
	until = webdriver.until;


var mapping = {
	system : "dewdflhanaui5_for_testing",
	service : "GWSAMPLE_BASIC [Gateway Sample Service - Basic]",
	metadataFile : "metadata.xml",
	mdWithNoAnnotationFile : "mdWithNoAnnotation.xml",
	annotationFile : "annotations.xml"
};


describe('Test Annotation Step In Smart Template', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;

	test.before(function () {
		var caps = webdriver.Capabilities.chrome();
		driver = new webdriver.Builder().withCapabilities(caps).build();
		webIDE = new webide(driver, By, until, configuration);
	});

	test.after(function () {
		driver.quit();
	});

	//test.it(
	//	'Load env',
	//	function (done) {
	//		return webIDE.loadAndOpenDevelopmentPerspective().then(
	//			function(){
	//				done();
	//			}
	//		);
	//	}
	//);


	//test.it(
	//	'Import project zip for testing of adding annotation from workspace',
	//	function (done) {
	//		webIDE.importZip(path.resolve(__dirname, 'zip/test.zip')).then(function(){
	//			done();
	//		});
	//	}
	//);

	test.it('Add annotation from file system', function (done) {
		var projectWizard = new projectwizard(driver, By, until, configuration);
		return webIDE.loadAndOpenWelcomePerspective().then(function() {
			return projectWizard.openFromWelcomePerspective();
		}).then(function(){
				return projectWizard.selectTemplate(configuration.templateName);
			}).then(function(){
				projectWizard.next();
			}).then(function(){
				return projectWizard.enterProjectName(configuration.projectName);
			}).then(function(){
				return projectWizard.next();
			}).then(function(){
			//return projectWizard.selectServiceFromFileSystem(path.resolve(__dirname, mapping.mdWithNoAnnotationFile));
			return projectWizard.selectServiceFromCatalog(mapping.system, mapping.service);
			}).then(function(){
				return projectWizard.next();
			}).then(function(){
				return projectWizard.selectAnnotationFromFileSystem(path.resolve(__dirname, mapping.annotationFile));
			}) .then(function(){
				assert(true).isTrue();
				done();
			});
		});


	test.it('Add annotation from service', function (done) {
		var projectWizard = new projectwizard(driver, By, until, configuration);
		return projectWizard.selectAnnotationFromService().then(function(){
				assert(true).isTrue();
				done();
			});
		});

	test.it('Add annotation from annotation URL', function (done) {
		var projectWizard = new projectwizard(driver, By, until, configuration);
		return projectWizard.selectAnnotationFromURL().then(function(){
			assert(true).isTrue();
			done();
		});
	});
});
