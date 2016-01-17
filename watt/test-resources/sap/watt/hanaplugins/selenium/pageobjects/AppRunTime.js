var utils = require('./Utils');


	module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {

		searchField : {type : 'css' , path :  'header input[type="search"]'},
		searchFieldBtn : {type : 'id' , path : '__xmlview1--searchField-search'},
		listBox : {type : 'css' , path :  'section ul[role="listbox"]'},
		listItems : {type : 'css' , path :  'section ul[role="listbox"] li'},
		detailsForms : {type : 'css' , path :  'section div[role="form"]'},
		labels : {type : 'css' , path :  'section label[role="label"]'},
		appHeaderText : {type : "xpath" , path : "//div[@role='heading']/span"},
		appHeaderTitle : {type: 'css' , path :'h1[title="Address Book"]'},
		createDataButton : {type : 'xpath' , path :'//div[contains(@class ,"sapUiTbInner")]/button[.="Create Data"]'},
		cellData : {type : 'xpath' , path :'//div[contains(@class ,"sapUiTableCell")]/span[contains(text(),"$1")]'},
		loginUser : {type : 'css' , path : 'input[name="username"]'},
		password : {type : 'css' , path : 'input[name="password"]'},
		signIn : {type : 'css' , path : 'input[name="submit"]'}

	};

	utils.decorateDriver(driver, until);

	return {

		searchForItem : function(searchText){
			var searchField = utils.toLocator(mappings.searchField);
			return driver.wait(until.elementLocated(searchField), configuration.defaultTimeout).then(function(){
				return driver.findElement(searchField).sendKeys(searchText).then(function(){
					return driver.myWaitAndClick(utils.toLocator(mappings.searchFieldBtn),configuration.startupTimeout);
				});
			});
		},

		selectListItemFromMasterList : function(itemIndex){

			var listItems = utils.toLocator(mappings.listItems);

			return driver.wait(until.elementLocated(listItems), configuration.defaultTimeout).then(function() {
				return driver.findElements(listItems).then(function(aListItems){
					if (aListItems.length > itemIndex) {
						return driver.doubleClick(aListItems[itemIndex]);
					}
				});
			});
		},
		logIn :function (userName,pass){
			var loginUser = utils.toLocator(mappings.loginUser);
			var password =  utils.toLocator(mappings.password);
			//this.timeout(configuration.startupTimeout);
			return driver.wait(until.elementLocated(loginUser), configuration.startupTimeout).then(function(){
					return driver.findElement(loginUser).sendKeys(userName).then(function() {
						return driver.findElement(password).sendKeys(pass).then(function() {
							var okButton = utils.toLocator(mappings.signIn)
							return driver.myWaitAndClick(okButton, configuration.defaultTimeout);
						});
					});
		});
		},

		switchToAnotherWindow : function(){
			return driver.getWindowHandle().then(function(oCurrentWindow) {
				driver.sleep(2000);
				return driver.getAllWindowHandles().then(function (aHandles) {
					aHandles.forEach(function (oHandle) {
						if (oHandle !== oCurrentWindow) {
							return  driver.switchTo().window(oHandle);
						}
					});
				});
			});
		},

		switchToiFrame : function() {
			var iFrame =   utils.toLocator({type : 'css' , path :"#display"});
			return driver.wait(until.elementLocated(iFrame), configuration.startupTimeout).then(function(){
				return driver.switchTo().frame("display");
			});
		},

		getAppHeaderText : function() {
			var appHeader = utils.toLocator(mappings.appHeaderText);
			return driver.wait(until.elementLocated(appHeader), configuration.startupTimeout).then(function(oElement){
				return oElement.getText();
			});
		},
		getAppHeaderTitle : function() {
			return driver.sleep(7 * 1000).then(function () {
				var appHeader = utils.toLocator(mappings.appHeaderTitle);
				return driver.wait(until.elementLocated(appHeader), configuration.startupTimeout).then(function (oElement) {
					return oElement.getText();
				});
			});
		},

		isLabelExists : function(label){

			var sPath = "//*[label/text()='" + label + "']";
			var element = {type : 'xpath' , path : sPath};

			var labelElement = utils.toLocator(element);
			return driver.wait(until.elementLocated(labelElement), configuration.defaultTimeout).then(function() {
				return driver.findElement(labelElement);
			});
		},
		isSpanTextExists : function(text){

			var sPath = "//span[.='" + text + "']";
			var element = {type: 'xpath', path :sPath};
			var labelElement = utils.toLocator(element);
			return driver.wait(until.elementLocated(labelElement), configuration.defaultTimeout).then(function(isPresent) {
				return driver.findElement(labelElement);
			});
		},
		isInnerTextExists : function(text){
			return driver.sleep(2 * 1000).then(function () {
				var sPath = "//pre[.='" + text + "']";
				var element = {type: 'xpath', path: sPath};
				var labelElement = utils.toLocator(element);
				return driver.wait(until.elementLocated(labelElement), configuration.defaultTimeout).then(function (isPresent) {
					return driver.findElement(labelElement);
				});
			});
		},
		clickOnCreateDataButton:function(){
			var item = utils.toLocator(mappings.createDataButton );
			return driver.myWaitAndClick(item,configuration.defaultTimeout)

		},
		currentURL : function(){
			return driver.getCurrentUrl().then(function(url){
				return url;
			});
		},
		isDataCellExist : function(sTitle) {
			return driver.sleep(7 * 1000).then(function (){
			var data = utils.toLocator(mappings.cellData, [sTitle])
						return driver.findElement(data);
			});

		}
	};

};

