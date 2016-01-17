var driverFactory = require('../utilities/driverFactory'),
		webdriver = require('selenium-webdriver'),
		test = require('selenium-webdriver/testing'),
		assert = require('selenium-webdriver/testing/assert'),
		ProjectWizard = require('../pageobjects/ProjectWizard'),
		extensionprojectwizard = require('../pageobjects/ExtensionProjectWizard'),
		extPane = require('../pageobjects/ExtensibilityPane'),
		Deploy = require('../pageobjects/Deploy'),
		configuration = require('./Configuration.js'),
		path = require('path'),
		Q = require('q'),
		wysiwyg = require('../pageobjects/Wysiwyg'),
		remote = require('selenium-webdriver/remote'),
		CodeEditor = require('../pageobjects/CodeEditor'),
		Toolbar = require('../pageobjects/Toolbar'),
		utils = require('../pageobjects/Utils'),
		RunConfiguration = require('../pageobjects/RunConfiguration'),
		AppRuntime = require('../pageobjects/AppRunTime'),
		RepositoryBrowser = require('../pageobjects/RepositoryBrowser'),
		Git = require('../pageobjects/Git'),
		Content = require('../pageobjects/Content'),
		PageObjectFactory = require('../common/utilities/PageObjectFactory'),
		HcpLoginPage = require('../common/pageObjects/HcpLoginPage');

var By = webdriver.By,
		until = webdriver.until,
		promise = webdriver.promise;

describe('RTC Scenario', function () {
	'use strict';
	this.timeout(configuration.startupTimeout);
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
	var actions;
	var w5g;
	var aPropertiesToChange;
	var extensionProjectWizard;
	var extensibilityPane;
	var pageObjectFactory;

	var mappings = {
		projectFolder: {type: "css", path: "li[title='$1'][aria-level='2']"},
		closeErrorButton: {type: "id", path: "__mbox-btn-1"},
		elementWithTitle: {type: 'xpath', path: '//li[contains(@title, "$1")]'},
		afterExtensionDialogButton: {type: 'xpath', path: '//div[@role="dialog"]//button[text()="$1"]'},
		sanityDetailViewHeader: {type: 'id', path: '__xmlview0--detailHeader'},
		pageInsideViewInOutline: {
			type: 'xpath',
			path: "//ul[@class='sapUiTreeList']/li[@tag='__xmlview0']/following-sibling::ul/li/span"
		},
		paletteItem: {type: 'xpath', path: "//div/label[text()='$1']/.."},
		rootViewInCanvas: {type: 'xpath', path: "//div[@id='content']/div[@id='__xmlview0']"}
	};

	before(function () {
		console.log("before RTCScenario\n");
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
		actions = new webdriver.ActionSequence(driver);

		driver.get(configuration.getParam(configuration.KEYS.HOST));
		projectWizard = new ProjectWizard(driver, By, until, configuration);
		deploy = new Deploy(driver, By, until, configuration);
		codeEditor = new CodeEditor(driver, By, until, configuration);
		toolbar = new Toolbar(driver, By, until, configuration);
		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		runConfiguration = new RunConfiguration(driver, By, until, configuration);
		appRuntime = new AppRuntime(driver, By, until, configuration);
		content = new Content(driver, By, until, configuration);
		git = new Git(driver, By, until, configuration);
		w5g = new wysiwyg(driver, By, until, configuration);

		extensionProjectWizard = new extensionprojectwizard(driver, By, until, configuration);
		extensibilityPane = new extPane(driver, By, until, configuration);

		//Maximize the window
		driver.manage().window().maximize();

		pageObjectFactory =  new PageObjectFactory(driver, By, until, configuration);
		var hcpLoginPage = new HcpLoginPage(driver, By, until, configuration, pageObjectFactory);
		return hcpLoginPage.doWaitAndLoginOrGoToWebIDE(configuration.getParam(configuration.KEYS.USER_NAME),configuration.getParam(configuration.KEYS.PASSWORD)).then(function(oWebIDE){
			webIDE = oWebIDE;
			return webdriver.promise.fulfilled();
		});

		console.log("click welcome perspective\n");
	});


	after(function () {
		console.log("afetr RTCScenario\n");
		return driver.switchTo().defaultContent().then(function () {
			return utils.deleteProjectFromWorkspace(driver, configuration.projectName).then(function () {
				return utils.deleteProjectFromWorkspace(driver, configuration.projectName + "Extension").then(function () {
					return driver.sleep(5000).then(function () {
						return driver.quit();
					});
				});
			});
		});
	});


	it('Running RTC Scenario', function () {
		var that = this;

		return webIDE.clickWelcomePerspectiveButtonAndGoToWelcomePerspectivePage().then(function(welcomePerspectivePage){
			return welcomePerspectivePage.clickOnNewProjectFromTemplateButtonAndGoToTemplateSelectionPage();
		}).then(function(templateSelectionWizardPage){
			return templateSelectionWizardPage.selectTemplateAndGoToBasicInfoWizardPage(configuration.templateCategory, configuration.templateName, configuration.templateVersion);
		}).then(function(basicInfoWizardPage){
			return basicInfoWizardPage.enterBasicInfoTextFields([configuration.projectName]).then(function(){
				return basicInfoWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/DataConnectionWizardPage");
		}).then(function(dataConnectionWizardPage){
			return dataConnectionWizardPage.selectServiceFromFileSystem(path.resolve(__dirname, 'RTCmetadata.xml')).then(function(){
				return dataConnectionWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/TemplateCustomizationWizardPage");
		}).then(function(templateCustomizationWizardPage){
			console.log("enterTemplateCustomizationText - namespace");
			return templateCustomizationWizardPage.enterTemplateCustomizationText("abc", 0, "Project Namespace").then(function(){
				console.log("enterTemplateCustomizationText - title");
				return templateCustomizationWizardPage.enterTemplateCustomizationText("Employees", 1, "Master section title");
			}).then(function () {
				console.log("enterTemplateCustomizationText - odata collection");
				return templateCustomizationWizardPage.enterTemplateCustomizationText("Employees", 1, "Addressable OData collection");
			}).then(function () {
				console.log("enterTemplateCustomizationText - object title");
				return templateCustomizationWizardPage.enterTemplateCustomizationText("EmployeeID", 1, "Title attribute from the OData collection");
			}).then(function () {
				console.log("enterTemplateCustomizationText - Numeric Attribute");
				return templateCustomizationWizardPage.enterTemplateCustomizationText("BirthDate", 1, "Numeric attribute from the OData collection"); //It is completed automatically from previous step
			}).then(function () {
				console.log("enterTemplateCustomizationText - Title Detail section");
				return templateCustomizationWizardPage.enterTemplateCustomizationText("Employee Details", 2, "Detail section title");
			}).then(function(){
				return templateCustomizationWizardPage.clickNextButton();
			});
		}).then(function(){
			return pageObjectFactory.createPageObjectInstance("/wizard/FinishWizardPage");
		}).then(function(finishWizardPage){
			return finishWizardPage.clickFinishButtonAndGoToDevelopmentPerspectivePage();
		}).then(function () {
			console.log("Extending project: " + configuration.projectName);
			return extensionProjectWizard.extendProjectFromWorkspace(configuration.projectName);
		}).then(function () {
			console.log("Open extensibility pane");
			return extensibilityPane.openExtPane();
		}).then(function () {
			console.log("Wait for application to load");
			return extensibilityPane.waitForAppToLoad();
		}).then(function () {
			return extensibilityPane.replaceWithEmptyView("Detail", "Refresh");
		}).then(function () {
			console.log("Open custom view with Layout Editor");
			return extensibilityPane.openWithLayoutEditor("Detail");
		}).then(function () {
			console.log("Change Data set from drop down to Employees");
			return w5g.changeDataSetForViewInDropDown("DetailCustom.view.xml", "Employees");
		}).then(function () {
			console.log("Set title Employee to the page");
			return w5g.changePropertyOfControl("DetailCustom.view.xml/sap.m.Page", "Title", "Employee", false);
		}).then(function () {
			console.log("Add new IconTabBar control to the page");
			return w5g.addControlFromOutline("DetailCustom.view.xml/sap.m.Page/content", "sap.m.IconTabBar");
		}).then(function () {
			console.log("change Element ID property of Icon Tab Bar");
			return w5g.changePropertyOfControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar", "Element ID", "newElementID", false);
		}).then(function () {
			console.log("Remove first tab (orders)");
			return w5g.deleteControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter(1)");
		}).then(function () {
			console.log("Remove second tab (Open)");
			return w5g.deleteControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter(1)");
		}).then(function () {
			aPropertiesToChange = [
				{propertyName: "Text", newValue: "Address", bBind: false},
				{propertyName: "Count", newValue: "", bBind: false},
				{propertyName: "Icon", newValue: "addresses", bBind: false}
			];
			return w5g.changePropertiesForControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter", aPropertiesToChange);
		}).then(function () {
			return w5g.addControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter/content", "sap.ui.layout.form.SimpleForm");
		}).then(function () {
			return w5g.deleteControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter/content/sap.ui.layout.form.SimpleForm/content/sap.ui.core.Title");
		}).then(function () {
			return w5g.deleteControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter/content/sap.ui.layout.form.SimpleForm/content/sap.m.Label(2)");
		}).then(function () {
			return w5g.deleteControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter/content/sap.ui.layout.form.SimpleForm/content/sap.m.Input(3)");
		}).then(function () {
			return w5g.changePropertyOfControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter/content/sap.ui.layout.form.SimpleForm/content/sap.m.Label", "Text", "Address", false);
		}).then(function () {
			return w5g.changePropertyOfControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter/content/sap.ui.layout.form.SimpleForm/content/sap.m.Input", "Value", "Address", true);
		}).then(function () {
			console.log("Add new IconTabFilter control to the IconTabBar");
			return w5g.addControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items", "sap.m.IconTabFilter");
		}).then(function () {
			aPropertiesToChange = [
				{propertyName: "Text", newValue: "Phone Numbers", bBind: false},
				{propertyName: "Icon", newValue: "iphone", bBind: false},
			];
			return w5g.changePropertiesForControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter(2)", aPropertiesToChange);
		}).then(function () {
			console.log("Add new Text control to IconTabFilter");
			return w5g.addControlFromOutline("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter(2)/content", "sap.m.Text");
		}).then(function () {
			console.log("Bind text property in sap.m.Text control to HomePhone");
			return w5g.changePropertyOfControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.IconTabBar/items/sap.m.IconTabFilter(2)/content/sap.m.Text", "Text", "HomePhone", true);
		}).then(function () {
			return w5g.addControlFromOutline("DetailCustom.view.xml/sap.m.Page/content", "sap.m.ObjectHeader");
		}).then(function () {
			aPropertiesToChange = [
				//{propertyName: "Title", newValue: "FirstName", bBind: true},
				//{propertyName: "Intro", newValue: "Title", bBind: true},
				{propertyName: "Number", newValue: "EmployeeID", bBind: true},
				{propertyName: "Number Unit", newValue: "", bBind: false}
			];
			return w5g.changePropertiesForControl("DetailCustom.view.xml/sap.m.Page/content/sap.m.ObjectHeader", aPropertiesToChange);
		}).then(function() {
			console.log("Selecting index.html from repository browser tree");
			return webIDE.selectRepositoryTreeFile(configuration.projectName + "Extension/webapp/index.html");
		}).then(function() {
			console.log("Running with Mock data");
			return webIDE.runSelectedWithMockData();
		}).then(function(){
			console.log("Switch to preview window");
			return runConfiguration.switchToWindow(false);
		}).then(function(){
			console.log("Get app header");
			return appRuntime.waitForAppHeaderText("Employees");
		}).then(function(){
			console.log("Switch back to Web IDE");
			return runConfiguration.switchToWindow(true);
		});
	});
});


