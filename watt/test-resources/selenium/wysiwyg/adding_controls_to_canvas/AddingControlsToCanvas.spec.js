/**
 * Created by I300494 on 09/07/2015.
 */
'use strict';

var path = require('path');
var Q = require('q');//TODO I think we shouldn't use Q here instead we should use the web-driver implementation of promises
var $ = require('jquery');
var chai = require("chai");
var expect = chai.expect;

var webdriver = require('selenium-webdriver'),
	test = require('selenium-webdriver/testing'),
	webide = require('../../pageobjects/WebIDE'),
	wysiwyg = require('../../pageobjects/Wysiwyg'),
	utils = require('../../pageobjects/Utils'),
	configuration = require('../Configuration.js');

var By = webdriver.By,
	until = webdriver.until;

var mappings = {
	ui5ControlFromPalette : {type: 'js', script: 'return locatePaletteControlByName("$1")'},
	emptyViewDropArea : {type: 'css', path: '.dummyScroller'}
};

/**
 * Locates a control in the palette of the W5G. Should be used to drag a control
 * @param sControlName The control name exactly as it appears in the palette
 */
function locatePaletteControlByName(sControlName) {
	var oControl = $(".sapWysiwygPaletteItem").find("label:contains('"+ sControlName + "')");
	expect.lenghtOf(oControl, 1, "Should locate only one control with the given name in the palette");
	return oControl;
}

describe.skip('WYSIWYG Adding controls to canvas', function () {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var w5g;

	test.it(
		'Adding controls to canvas',
		function (done) {
			var oPromise = Q();
			for(var i = 0; i < 1; i++) {
				oPromise = oPromise.then(function() {
					//Initializations
					var caps = webdriver.Capabilities.chrome();
					driver = new webdriver.Builder().withCapabilities(caps).build();
					webIDE = new webide(driver, By, until, configuration);
					w5g = new wysiwyg(driver, By, until, configuration);
				}).then(function() {
					return webIDE.loadAndOpenDevelopmentPerspective();
				}).then(function() {
					return webIDE.importZip(path.resolve(__dirname, '../zip/sanity.zip'));
				}).then(function() {
					return w5g.openLayoutEditorForFile("sanity/view" , "Empty.view.xml");
				}).then(function() {
					//We must search for the control first so it appears in the UI and we can drag and drop it
					return w5g.searchForControlInPalette("Tile Container");
				})
				//	.then(function() {
				//	var oControlLocator = utils.toLocator(mappings.ui5ControlFromPalette, ["Tile Container"]);
				//	var dropAreaLocator = utils.toLocator(mappings.emptyViewDropArea);
				//	var oControlElement = driver.findElement(oControlLocator);
				//	var oDropAreaElement = driver.findElement(dropAreaLocator);
				//	return driver.dragAndDrop(oControlElement, oDropAreaElement).perform();
				//})
					.then(function() {
					return webIDE.deleteProjectByName("sanity");
				}).then(function() {
					return driver.quit();
				});
			}
			oPromise.then(function() {
				done();
			});
		}
	);

});
