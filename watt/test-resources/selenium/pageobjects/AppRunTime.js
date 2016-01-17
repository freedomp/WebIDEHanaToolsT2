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
		appHeaderText : {type : "xpath" , path : '//div[@class="sapMMessagePage"]//div[@role="heading"]//span[.="$1"]'},
		appHeaderTextShort : {type : "xpath" , path : '//div[@role="heading"]//span[.="$1"]'}
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

		waitForAppHeaderText : function(sText) {
			var appHeader = utils.toLocator(mappings.appHeaderTextShort, [sText]);
			return driver.wait(until.elementLocated(appHeader), configuration.startupTimeout);
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
		}
	};

};

