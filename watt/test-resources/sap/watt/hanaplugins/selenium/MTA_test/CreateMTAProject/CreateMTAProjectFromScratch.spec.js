var driverFactory = require('../../utilities/driverFactory'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	webide = require('../../pageobjects/WebIDE'),
	ProjectWizard = require('../../pageobjects/ProjectWizard'),
	configuration = require('./Configuration.js'),
	TestConfiguration = require("../../utilities/TestConfiguration"),
	remote = require('selenium-webdriver/remote'),
	HanaLoginPage = require('../../pageobjects/HanaLoginPage'),
	utils = require('../../pageobjects/Utils'),
	RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
	Content = require('../../pageobjects/Content'),
	CodeEditor = require('../../pageobjects/CodeEditor'),
	runconfiguration = require('../../pageobjects/RunConfiguration'),
	AppRuntime = require('../../pageobjects/AppRunTime'),
	path = require('path'),
    deep = require('deep-diff').diff

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

describe('Selenium : Create project from scratch test', function() {
	'use strict';
	this.timeout(configuration.startupTimeout);

	var driver;
	var webIDE;
	var projectWizard;
	var repositoryBrowser;
	var version;
	var content;
	var codeEditor;
	var runConfiguration;
	var appRuntime;

	var mappings = {
		projectFolder : {type : "css" , path : "li[title='$1'][aria-level='2']"},
		projectVersion : {type : 'css' , path : 'input[title="Application Version"]'},
		buildSuccessTitle : {type : 'xpath' , path : "//*[contains(text(),'Build of MTATest1 completed')]"},
		appHeaderTitle : {type: 'css' , path :'h1[title="Address Book"]'},
		projectInTree : {type : 'xpath' , path :'//span[@class ="sapUiTreeNodeContent"][text()="$1"]'}


	};

	beforeEach(function() {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector);
	});

	afterEach(function() {
		console.log("After each test");
			return driver.saveScreenshot("Create_project_from_scratch.png", this).then(function() {
		
			repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
			return repositoryBrowser.deleteNode(configuration.projectName);
		});
	});

	it('Create project from scratch', function() {
		driver.get(TestConfiguration.getParam(TestConfiguration.KEYS.HOST));

		var hanaLoginPage = new HanaLoginPage(driver);
		hanaLoginPage.setUserName(TestConfiguration.getParam(TestConfiguration.KEYS.USER_NAME));
		hanaLoginPage.setPassword(TestConfiguration.getParam(TestConfiguration.KEYS.PASSWORD));
		hanaLoginPage.login();

		webIDE = new webide(driver, By, until, configuration);
		projectWizard = new ProjectWizard(driver, By, until, configuration);
		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		codeEditor = new CodeEditor(driver, By, until, configuration);
		runConfiguration = new runconfiguration(driver, By, until, configuration);
		appRuntime = new AppRuntime(driver, By, until, configuration);


		var data1;
		var emptyyaml;
		var emptyyamlobj;
		var dbyaml;
		var jsyaml;
		var webyaml;
		var that =this;
		var parsyaml = require('js-yaml');
		console.log("Select Local ");
		return driver.myWaitAndClick(utils.toLocator(mappings.projectInTree ,[configuration.localName]), configuration.defaultTimeout).then(function() {
			console.log("Delete All Project");
			return webIDE.deleteAllProject();
		}).then(function() {
			console.log("open project wizard");
			return webIDE.createMtaProjectFromTemplate(configuration.projectName).then(function () {
				console.log("read file " + configuration.projectName + "/mta.yaml");
				return repositoryBrowser.openFile(configuration.projectName + "/" + configuration.mtaYaml).then(function () {
					return codeEditor.getText().then(function (yamlData) {
						that.emptyyaml = yamlData;
					});
				});
			});
		}).then (function(){
		console.log("Close the TAB mta.yaml");
		return webIDE.closeTab(configuration.mtaYaml);
		}).then (function(){
			console.log("select "+configuration.projectName+" project");
			return repositoryBrowser.selectNode(configuration.projectName);
		}).then(function(){
			console.log("add hdb module");
			return webIDE.createModuleFromTemplate(configuration.hdbModuleType,configuration.hdbModuleName)
			.then(function(){

				console.log("read file "+ configuration.projectName + "/mta.yaml" );
				return repositoryBrowser.openFile(configuration.projectName +"/"+configuration.mtaYaml).then(function () {
					return codeEditor.getText().then(function (yamlData) {
						that.dbyaml = yamlData;
					});
				});
			}).then(function() {
				console.log("Check that db module is added to yaml file" );

					var emptyYamlobj = parsyaml.load(that.emptyyaml );
					var dbyamlobj=parsyaml.load(that.dbyaml );
				    var diff = deep.diff(emptyYamlobj, dbyamlobj);
				   assert(utils.checkModuleName('N', diff, configuration.hdbModuleName, 'hdb')).isTrue();
					assert(utils.checkModuleresource('N', diff, 'hdi-container', 'com.sap.xs.hdi-container')).isTrue();

			}).then (function(){
				console.log("Close the TAB mta.yaml");
				return webIDE.closeTab(configuration.mtaYaml);
			}).then(function(){
				console.log("Check console exist");
				return webIDE.checkOpenConsole();
			}).then (function(){
				console.log("select folder src in project "+configuration.hdbModuleName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.hdbModuleName+"/src");
			}).then(function(){
				return createSetFileAndSave(configuration.hdbFile,configuration.projectName +"/"+configuration.hdbModuleName+"/src/"+configuration.hdbFile,'Files/db/'+configuration.hdbFile );
			}).then (function(){
				console.log("edit  file "+configuration.hdinamespace);
				var filePath = path.resolve(__dirname, 'Files/db/'+configuration.hdinamespace);
				return repositoryBrowser.readFile(filePath).then(function(data){
					return repositoryBrowser.openFile(configuration.projectName +"/"+configuration.hdbModuleName+"/src/"+configuration.hdinamespace).then(function () {
						return codeEditor.replacefileinEditor(data);
					});
				});

			}).then (function(){
				console.log("Close the TAB "+ configuration.hdinamespace);
				return webIDE.closeTab(configuration.hdinamespace);
			}).then (function(){
				console.log("edit  file "+configuration.hdiconfig);
				var filePath = path.resolve(__dirname, 'Files/db/'+configuration.hdiconfig);
				return repositoryBrowser.readFile(filePath).then(function(data){
					return repositoryBrowser.openFile(configuration.projectName +"/"+configuration.hdbModuleName+"/src/"+configuration.hdiconfig).then(function () {
						return codeEditor.replacefileinEditor(data);
					});
				});

			}).then (function(){
				console.log("Close the TAB "+ configuration.hdiconfig);
				return webIDE.closeTab(configuration.hdiconfig);
			}).then (function(){

				console.log("select project " +configuration.hdbModuleName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.hdbModuleName);

			}).then (function(){
				console.log("select project");
				return repositoryBrowser.selectNode(configuration.projectName);
			}).then(function(){
				console.log("add NodeJS module");
					return webIDE.createModuleFromTemplate(configuration.jsModuleType,configuration.nodejsModulName).then(function() {

						console.log("read file " + configuration.projectName + "/mta.yaml");
						return repositoryBrowser.openFile(configuration.projectName + "/" + configuration.mtaYaml).then(function () {
							return codeEditor.getText().then(function (yamlData) {
								that.jsyaml = yamlData;
							});
						});
					});
			}).then(function() {
				console.log("Check that js module is added to yaml file" );

				var dbyamlobj=parsyaml.load(that.dbyaml );
				var jsYamlobj = parsyaml.load(that.jsyaml );
				var diff = deep.diff(dbyamlobj, jsYamlobj);
				assert(utils.checkModuleName('A', diff, configuration.nodejsModulName, 'nodejs')).isTrue();

			}).then (function(){
				console.log("Close the TAB mta.yaml");
				return webIDE.closeTab(configuration.mtaYaml);
			}).then (function(){
				console.log("select project " +configuration.nodejsModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName);
			}).then(function(){
				console.log("Create folder : routes under js ");
				return webIDE.createNewFolder("routes");
			}).then (function(){
				console.log("select module " +configuration.nodejsModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName);
			}).then (function(){
				console.log("select folder routes under module " +configuration.nodejsModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){
				return	createSetFileAndSave(configuration.addresbook,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.addresbook,'Files/js/routes/'+configuration.addresbook );
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){

					return createSetFileAndSave(configuration.addresbookManager,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.addresbookManager,'Files/js/routes/'+configuration.addresbookManager);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){
				return createSetFileAndSave(configuration.index,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.index,'Files/js/routes/'+configuration.index);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){
				return createSetFileAndSave(configuration.testdata,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.testdata,'Files/js/routes/'+configuration.testdata);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){

				return createSetFileAndSave(configuration.testdataCreator,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.testdataCreator,'Files/js/routes/'+configuration.testdataCreator);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){

				return createSetFileAndSave(configuration.testdataDestructor,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.testdataDestructor,'Files/js/routes/'+configuration.testdataDestructor);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){

				return createSetFileAndSave(configuration.userinfo,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.userinfo,'Files/js/routes/'+configuration.userinfo);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/routes");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/routes");
			}).then(function(){

				return createSetFileAndSave(configuration.userinfoQuery,configuration.projectName +"/"+configuration.nodejsModulName+"/routes/"+configuration.userinfoQuery,'Files/js/routes/'+configuration.userinfoQuery);
			}).then (function(){
				console.log("select  module "+configuration.nodejsModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName);
			}).then(function(){
				console.log("Create folder : spec under js ");
				return webIDE.createNewFolder("spec");
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/spec");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/spec");
			}).then(function(){

				return createSetFileAndSave(configuration.testDataSpec,configuration.projectName +"/"+configuration.nodejsModulName+"/spec/"+configuration.testDataSpec,'Files/js/spec/'+configuration.testDataSpec);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/spec");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/spec");
			}).then(function(){

				return createSetFileAndSave(configuration.userinfoSpec,configuration.projectName +"/"+configuration.nodejsModulName+"/spec/"+configuration.userinfoSpec,'Files/js/spec/'+configuration.userinfoSpec);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/spec");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/spec");
			}).then(function(){
				console.log("Create folder : support under spec ");
				return webIDE.createNewFolder("support");
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/spec/support");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName+"/spec/support");
			}).then(function(){

				return createSetFileAndSave(configuration.jasmine,configuration.projectName +"/"+configuration.nodejsModulName+"/spec/support/"+configuration.jasmine,'Files/js/spec/support/'+configuration.jasmine);
			}).then (function(){
				console.log("select  module "+configuration.nodejsModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName);
			}).then(function(){

				return createSetFileAndSave(configuration.helloworld,configuration.projectName +"/"+configuration.nodejsModulName+"/"+configuration.helloworld,'Files/js/'+configuration.helloworld);
			}).then (function(){
				console.log("select  module "+configuration.nodejsModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName);
			}).then(function(){

				return createSetFileAndSave(configuration.sapuicachebusterinfo,configuration.projectName +"/"+configuration.nodejsModulName+"/"+configuration.sapuicachebusterinfo,'Files/js/'+configuration.sapuicachebusterinfo);
			}).then (function(){
				return replaceAndCloseFile(configuration.packageJson,configuration.projectName +"/"+configuration.nodejsModulName+"/"+configuration.packageJson,'Files/js/'+configuration.packageJson);
			}).then (function(){
				console.log("select project "+configuration.projectName);
				return repositoryBrowser.selectNode(configuration.projectName);
			}).then(function(){
					console.log("add NodeJS module");
					return webIDE.goThroughMenubarItemsAndSelect(["File", "New", "HTML5 Module"]);
			}).then(function(){
					console.log("enterModuleName");
					return projectWizard.enterProjectName(configuration.ui5ModulName);
			}).then(function(){
					console.log("next");
					return projectWizard.next();
			}).then(function(){
					console.log("finish");
					return projectWizard.finishAndWait();
			}).then(function(){

				console.log("read file "+ configuration.projectName + "/mta.yaml" );
				return repositoryBrowser.openFile(configuration.projectName +"/"+configuration.mtaYaml).then(function () {
					return codeEditor.getText().then(function (yamlData) {
						that.webyaml = yamlData;
					});
				});
			}).then(function() {
				console.log("Check that web module is added to yaml file" );

				var jsyamlobj=parsyaml.load(that.jsyaml );
				var webYamlobj = parsyaml.load(that.webyaml );
				var diff = deep.diff(jsyamlobj, webYamlobj);
				assert(utils.checkModuleName('A', diff, configuration.ui5ModulName, 'html5')).isTrue();

			}).then (function(){
				console.log("Close the TAB mta.yaml");
				return webIDE.closeTab(configuration.mtaYaml);
			}).then (function(){
				console.log("select folder resources in module "+configuration.ui5ModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName+"/resources");
			}).then(function(){
				console.log("Create folder : jds under folder "+configuration.ui5ModulName+"/resources" );
				return webIDE.createNewFolder("jds");
			}).then (function(){
				console.log("select folder jds under folder "+configuration.ui5ModulName+"/resources");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName+"/resources/jds");
			}).then(function(){

				return createSetFileAndSave(configuration.treeController,configuration.projectName +"/"+configuration.ui5ModulName+"/resources/jds/"+configuration.treeController,'Files/'+configuration.ui5ModulName+'/jds/'+configuration.treeController);
			}).then (function(){
				console.log("select folder jds under "+configuration.ui5ModulName+"/resources");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName+"/resources/jds");
			}).then(function(){

				return createSetFileAndSave(configuration.treeView,configuration.projectName +"/"+configuration.ui5ModulName+"/resources/jds/"+configuration.treeView,'Files/'+configuration.ui5ModulName+'/jds/'+configuration.treeView);
			}).then (function(){
				console.log("select folder resources under "+configuration.ui5ModulName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName+"/resources");
			}).then(function(){
				console.log("Create folder : user under folder"+configuration.ui5ModulName+"/resources");
				return webIDE.createNewFolder("user");
			}).then (function(){
				console.log("select folder routes in module "+configuration.ui5ModulName+"/resources/user");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName+"/resources/user");
			}).then(function(){

				return createSetFileAndSave(configuration.infoController,configuration.projectName +"/"+configuration.ui5ModulName+"/resources/user/"+configuration.infoController,'Files/'+configuration.ui5ModulName+'/user/'+configuration.infoController);
			}).then (function(){
				console.log("select folder routes in module "+configuration.nodejsModulName+"/resources/user");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName+"/resources/user");
			}).then(function(){

				return createSetFileAndSave(configuration.infoView,configuration.projectName +"/"+configuration.ui5ModulName+"/resources/user/"+configuration.infoView,'Files/'+configuration.ui5ModulName+'/user/'+configuration.infoView);
			}).then (function(){
				return replaceAndCloseFile(configuration.webIndex,configuration.projectName +"/"+configuration.ui5ModulName+"/resources/"+configuration.webIndex,'Files/'+configuration.ui5ModulName+'/'+configuration.webIndex);
			}).then (function(){
				return replaceAndCloseFile(configuration.webPackage,configuration.projectName +"/"+configuration.ui5ModulName+"/"+configuration.webPackage,'Files/'+configuration.ui5ModulName+'/'+configuration.webPackage);
			}).then (function(){
				return replaceAndCloseFile(configuration.xsapp,configuration.projectName +"/"+configuration.ui5ModulName+"/"+configuration.xsapp,'Files/'+configuration.ui5ModulName+'/'+configuration.xsapp);
			}).then (function(){
				return replaceAndCloseFile(configuration.webCodenvyProject,configuration.projectName +"/"+configuration.ui5ModulName+"/.di/"+configuration.webCodenvyProject,'Files/'+configuration.ui5ModulName+'/.di/'+configuration.webCodenvyProject);
			}).then (function(){
				return replaceAndCloseFile(configuration.mtaYaml,configuration.projectName +"/"+configuration.mtaYaml,'Files/yaml/'+configuration.mtaYaml);
			}).then(function(){
				console.log("Check console exist");
				return webIDE.checkOpenConsole();
			}).then (function(){

				console.log("select project " +configuration.hdbModuleName);
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.hdbModuleName);
			}).then(function() {
						console.log("build hdb module");
						return webIDE.goThroughMenubarItemsAndSelect(["Build", "Build"])
			}).then(function(){
						console.log("wait for build success");
					return webIDE.checkBuildStatus(configuration.projectName);
			}).then(function(){
				console.log("Open Run Console");
				return webIDE.goThroughMenubarItemsAndSelect(["View", "Run Console"]);
			}).then(function(){
				console.log("Select project js");
				return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.nodejsModulName);
			}).then(function(){
				console.log("Run Configuration of js");
				return webIDE.runNewConfiguration(configuration.projectName,configuration.nodejsModulName);
			}).then(function() {
				// return runConfiguration.selectNodeJsApplicationConfiguration();
			}).then(function(){
				return runConfiguration.NewRunConfiguration();
			}).then(function(){
				return runConfiguration.enterApplicationPath("/" + configuration.projectName + "/"+configuration.nodejsModulName+"/"+configuration.helloworld);
			}).then(function(){
				return runConfiguration.clickOnConfigurationNameLabel();
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
			//	console.log("Select web module");
			//	return repositoryBrowser.selectNode(configuration.projectName+"/"+configuration.ui5ModulName);
			}).then(function() {
			//	console.log("Run web application");
			//	return webIDE.runSelectedAppAsWebApplication();
			}).then(function(){
			//			 console.log("Switch to preview window");
			//			 return runConfiguration.switchToWindow(false);
			 }).then(function() {
			//	var appHeader = utils.toLocator(mappings.appHeaderTitle);

			}).then(function(){
		//	  console.log("Get app header");
		//	   return appRuntime.getAppHeaderTitle();
			}).then(function(sHeader){
			//     console.log("Check header text");
			//     return assert(sHeader).equalTo(configuration.appHeaderTitle, "Application header should be " + configuration.appHeaderTitle);
			 }).then(function(){
			//     console.log("Click on Crate Data in runtime");
			//      return appRuntime.clickOnCreateDataButton();
			   }).then(function(){
			  //     console.log("Get app data - check if data exist");
			   //    return appRuntime.isDataCellExist("My Book");

			  }).then(function() {
		//	     console.log("Switch back to Web IDE");
			//      return runConfiguration.switchToWindow(true);
			 }).then(function() {
				console.log("The test is finished");

		 });

			assert(false).isTrue();
		});

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

	};

});
