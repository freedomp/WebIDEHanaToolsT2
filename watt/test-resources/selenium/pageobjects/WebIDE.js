
var utils = require('./Utils'),
		_ = require('lodash'),
		webdriver = require('selenium-webdriver'),
		promise = webdriver.promise,
		Q = require('q');

module.exports = function (driver, By, until, configuration) {
	'use strict';
	var mappings = {
		welcomePerspectiveButton :  {type : 'css' , path :'button[id$="applicationLeftSidebar-tools.welcome"]'},
		welcomePerspectiveButtonDisabled :  {type : 'css' , path :'button[id*="welcome"][aria-disabled="true"]'},
		developmentPerspectiveButton :  {type : 'css' , path :'button[id*="development"][aria-disabled="false"]'},
		developmentPerspectiveButtonDisabled :  {type : 'css' , path :'button[id*="development"][aria-disabled="true"]'},
		userpreferencePerspectiveButton :  {type : 'css' , path :'button[id*="userpreference"][aria-disabled="false"]'},
		userpreferencePerspectiveButtonDisabled :  {type : 'css' , path :'button[id*="userpreference"][aria-disabled="true"]'},
		menubarItemRootElement : {type : 'xpath' , path : '//div[@id="menubar"]//span[text()="$1"]'},
		menubarItemSubElement : {type : 'xpath' , path : '//div/*/li[@role="menuitem"]/div[text()="$1"]'},
		menubarItemSubElementContains : {type : 'xpath' , path : '//div/*/li[@role="menuitem"]/div[contains(text(),"$1")]'},
		importDialogFileInput : {type : 'css' , path : '.sapUiDlg .sapUiDlgCont input[type="file"]'},
		importDialogImportToInput : {type: 'xpath' , path : '//div[label/text()="Import to"]/following-sibling::div/input'},
		importDialogOKButton : {type : 'xpath' , path : '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="OK"]'},
		importOverrideConfirmButton : {type: 'id' , path: 'MSG_CONFIRM--btn-OK'},
		rootRepositoryNode : {type: 'css' , path : '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]'},
		progressBarStart : {type: 'css' , path : '#ideProgressBar.animate'},
		progressBarStop : {type: 'css' , path : '#ideProgressBar:not(.animate)'},
		/**
		 * can be any folder in the repository browser. Be careful if you have more than one folder with the same name in
		 * different places of the hierarchy
		 */
		childRepositoryFolderNode : {type: 'css' , path : ' ~ ul .wattTreeFolder[title="$1"]'},
		/**
		 * maps only to folders that are projects i.e. in the first level of the hierarchy
		 */
		projectInRepositoryBrowserNode : {type: 'css', path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder[title="$1"][aria-level="2"]'},
		/**
		 * maps only to folders that are projects and that are selected i.e. in the first level of the hierarchy and have
		 * the class .sapUiTreeNodeSelected
		 */
		projectInRepositoryBrowserNodeSelected : {type: 'css', path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder.sapUiTreeNodeSelected[title="$1"][aria-level="2"]'},

		/**
		 * Locator for a selected project in the repository browser. It takes the project name as a parameter.
		 * Locates only folders in the first level of the heirarchy.
		 */
		projectSelectedInRepositoryBrowserNode : {type: 'css', path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder[title="$1"][aria-level="2"][aria-selected="true"]'},
		childRepositoryFileNode : {type: 'css' , path : ' ~ ul .wattTreeFile[title="$1"]'},
		contextMenuRootElement : {type : 'xpath' , path : '//div[contains(@class ,"sapWattContextMenu")]/*/li[div/text()="$1"]'},
		contextMenuSubItem : {type : 'xpath' , path : '//div[contains(@class ,"WattMainMenuSub")]/*/li[div/text()="$1"]'},
		/**
		 * Assuming there is only one .project.json file in the workspace
		 */
		projectJsonFile : {type: 'css' , path : 'li[title=".project.json"].sapUiTreeNode.wattTreeFile'},
		/**
		 * Selector for an *INFO* message logged to the Web-IDE console (won't catch an error message)
		 * The parameter is any string contained in the logged string
		 * MUST call openWebIDEConsole before usage in order to trigger writing the console output to the HTML
		 */
		consoleInfoOutputContains : {type : 'xpath' , path : '//div[@class="info selectable" and contains(.,"$1")]'},
		elementWithTitle: {type: 'xpath', path: '//li[contains(@title, "$1")]'},
		/**
		 * Selector for the progress bar of the loading of Web-IDE. It is valid when the progress bar value is 101 which
		 * means that Web-IDE has already loaded and the progress bar disappeared.
		 */
		webIdeProgressBarFullyLoaded: {type: 'xpath', path: '//progress[@max=100 and @value=101]'}
	};

	utils.decorateDriver(driver, until);

	var _loadAndSelectPerspective = function(url, perspectiveButtonLocator){
		driver.get(url);
		return driver.myWaitAndClick(perspectiveButtonLocator,configuration.startupTimeout);
	};

	/**
	 * Goes through the repository browser, clicks on the last element in the path (whether a file or a folder) and
	 * returns that element.
	 * Notice that this method will work even if there are multiple files with the same name in your repository
	 * browser since the files are searched in the exact place that exists in the path
	 * @param {array} aPathTitles - Array of strings. Each string contains a part of the path of the item that should
	 * 								be selected and returned.
	 * @private
	 */
	function _goThroughRepositoryTreeAndGetElement(aPathTitles) {
		if (!aPathTitles.length) {
			return Q(null);
		}

		function _buildLocatorForFileOrFolderByPath(aPathTitles) {
			if(!aPathTitles.length) {
				return "";
			}

			var locator = '//ul[@class="sapUiTreeList"]';
			_.forEach(_.dropRight(aPathTitles), function(sPathTitle) {
				locator += '/ul[../li/span="' + sPathTitle + '"]';
			});
			locator += '/li[@title="' + aPathTitles[aPathTitles.length - 1] + '"]';

			return locator;
		}

		var oPromise = Q();

		_.forEach(aPathTitles, function(sPathTitle, index) {
			var element;
			oPromise = oPromise.then(function() {
				var aCurrentPath = _.slice(aPathTitles, 0, index + 1);
				var sCurrentLocator = utils.toLocator({type : 'xpath' , path :_buildLocatorForFileOrFolderByPath(aCurrentPath)});
				driver.wait(until.elementLocated(sCurrentLocator, configuration.defaultTimeout));
				element = driver.findElement(sCurrentLocator);
				element.click();
				return element.sendKeys(webdriver.Key.ARROW_RIGHT).then(function() {
					//In order to return the last element in the path
					return element;
				});
			});
		});

		return oPromise;
	}

	var _goThroughRepositoryTree = function(aNodeTitles , sFileTitle) {
		if(!aNodeTitles.length) return;

		var sRootNodeLocator = utils.toLocator(mappings.rootRepositoryNode);

		var callbacks = [];
		var sLocatorPath = mappings.rootRepositoryNode.path;

		_.each(aNodeTitles.reverse() , function(sTitle){

			var oCallbackFn;

			if(callbacks.length) {
				oCallbackFn = callbacks[callbacks.length - 1];
			}

			var oFileCallbackFn;
			if(sFileTitle) {
				oFileCallbackFn = function() {
					var item = utils.toLocator(mappings.childRepositoryFileNode , [ sFileTitle ]);
					item.value = sLocatorPath + item.value;
					return driver.myWaitAndClick(item,configuration.startupTimeout);
				};
			}

			var newCallback = function() {
				var item;
				if(!oCallbackFn && oFileCallbackFn) {
					oCallbackFn = oFileCallbackFn;
				}

				item = utils.toLocator(mappings.childRepositoryFolderNode , [ sTitle ]);
				item.value = sLocatorPath + item.value;
				sLocatorPath = item.value;

				if(oCallbackFn) {
					return driver.myWaitAndClick(item,configuration.defaultTimeout).then(
							function(){
								return driver.findElement(item).sendKeys(webdriver.Key.ARROW_RIGHT).then(oCallbackFn);
							}
					);

				} else {
					return driver.myWait(item,configuration.defaultTimeout);
				}
			};

			callbacks.push(newCallback);

		});

		return callbacks.length ? driver.myWaitAndClick(sRootNodeLocator , configuration.defaultTimeout).then(callbacks[callbacks.length - 1]) : driver.myWaitAndClick(sRootNodeLocator , configuration.defaultTimeout).done();
	};

	var _goThroughContextMenuAndSelect = function(aTitles) {
		if(!aTitles.length) return;

		var rootItemTitle = aTitles[0];
		var rootItemTitleLocator = utils.toLocator(mappings.contextMenuRootElement , [ rootItemTitle ]);

		var callbacks = [];

		_.each(aTitles.splice(1).reverse() , function(sTitle){

			var oCallbackFn;

			if(callbacks.length) {
				oCallbackFn = callbacks[callbacks.length - 1];
			}

			var newCallback = function() {
				var item = utils.toLocator(mappings.contextMenuSubItem , [ sTitle ]);
				if(oCallbackFn) {
					return driver.myWaitAndClick(item,configuration.defaultTimeout).then(oCallbackFn);
				} else {
					return driver.myWaitAndClick(item,configuration.defaultTimeout);
				}
			};

			callbacks.push(newCallback);

		});

		return callbacks.length ? driver.myWaitAndClick(rootItemTitleLocator,configuration.startupTimeout).then(callbacks[callbacks.length - 1]) : driver.myWaitAndClick(rootItemTitleLocator,configuration.startupTimeout).done();
	};


	var _goThroughMenubarItemsAndSelect = function(aMenuBarTitles, bUseContains) {
		if (!aMenuBarTitles.length) {
			return promise.fulfilled(null);
		}
		var menuBarSubItemSelector = mappings.menubarItemSubElement;
		if (bUseContains) {
			menuBarSubItemSelector = mappings.menubarItemSubElementContains;
		}

		var oPromise = promise.fulfilled().then(function() {
			driver.sleep(1*1000);
			var rootMenuItemTitle = aMenuBarTitles[0];
			console.log("click on the main menu item: " + rootMenuItemTitle);
			var menuElementLocator = utils.toLocator(mappings.menubarItemRootElement , [ rootMenuItemTitle ]);
			return driver.myWaitAndClick(menuElementLocator, configuration.defaultTimeout);
		});

		_.forEach(_.drop(aMenuBarTitles, 1), function(sTitle) {
			oPromise = oPromise.then(function() {
				console.log("click on the sub menu item: " + sTitle);
				var subElementLocator = utils.toLocator(menuBarSubItemSelector , [ sTitle ]);
				return driver.myWaitAndClick(subElementLocator, configuration.defaultTimeout);
			});
		});

		return oPromise;
	};

	return {
		/**
		 * Return the mappings so they can be used in different parts of the tests
		 */
		mappings: mappings,

		clickWelcomePerspective : function(timeout) {
			var waitTimeout = timeout ? timeout : configuration.startupTimeout;
			var welcomeButton = utils.toLocator(mappings.welcomePerspectiveButton);
			return driver.wait(until.elementLocated(welcomeButton), waitTimeout).then(function(){
				var welcomeButtonDisabled = utils.toLocator(mappings.welcomePerspectiveButtonDisabled);
				return driver.isElementPresent(welcomeButtonDisabled);
			}).then(function(isPresent){
				if (isPresent) {
					return promise.fulfilled();
				}
				else {
					return driver.myWaitAndClick(welcomeButton,waitTimeout);
				}
			});
		},

		clickDevelopmentPerspective : function(timeout) {
			var waitTimeout = timeout ? timeout : configuration.startupTimeout;
			var developmentButton = utils.toLocator(mappings.developmentPerspectiveButton);
			return driver.wait(until.elementLocated(developmentButton), waitTimeout).then(function(){
				var developmentButtonDisabled = utils.toLocator(mappings.developmentPerspectiveButtonDisabled);
				return driver.isElementPresent(developmentButtonDisabled);
			}).then(function(isPresent){
				if (isPresent) {
					console.log("if");
					return promise.fulfilled();
				}
				else {
					console.log("else");
					return driver.myWaitAndClick(developmentButton,waitTimeout);
				}
			});
		},

		clickUserpreferencePerspective : function(timeout) {
			var waitTimeout = timeout ? timeout : configuration.startupTimeout;
			var developmentButton = utils.toLocator(mappings.userpreferencePerspectiveButton);
			return driver.wait(until.elementLocated(developmentButton), waitTimeout).then(function(){
				var developmentButtonDisabled = utils.toLocator(mappings.userpreferencePerspectiveButtonDisabled);
				return driver.isElementPresent(developmentButtonDisabled);
			}).then(function(isPresent){
				if (isPresent) {
					console.log("if");
					return promise.fulfilled();
				}
				else {
					console.log("else");
					return driver.myWaitAndClick(developmentButton,waitTimeout);
				}
			});
		},

		navigateToDevelopmentPerspectiveViaView : function() {
			return _goThroughMenubarItemsAndSelect(["Tools" , "Development"]);
		},

		navigateToWelcomePerspectiveViaView : function() {
			return _goThroughMenubarItemsAndSelect(["Tools" , "Welcome"]);
		},

		loadAndOpenWelcomePerspective : function() {
			var welcomeButton = utils.toLocator(mappings.welcomePerspectiveButton);
			return _loadAndSelectPerspective(configuration.url, welcomeButton);
		},
		loadAndOpenDevelopmentPerspective : function() {
			var developmentButton = utils.toLocator(mappings.developmentPerspectiveButton);
			return _loadAndSelectPerspective(configuration.url, developmentButton);
		},

		// Note: in order for this importZip to succeed in jenkins, add a call to driver.setFileDetector(new remote.FileDetector())
		/**
		 * Import project from zip file onto the webide worksapce
		 * @param {string} sZipPath path to the zip file
		 * @param {boolean} bOverride override if project is already exists
		 * @returns {webdriver.Promise}
		 */
		importZip : function(sZipPath , bOverride) {
			var that = this;
			console.log("Before going through import menu");
			return _goThroughMenubarItemsAndSelect(["File" , "Import" , "From File System"]).then(function(){
				console.log("Before sending path to import dialog");
				return driver.myWaitAndSendKeys(sZipPath, utils.toLocator(mappings.importDialogFileInput) , configuration.startupTimeout).then(function() {
					console.log("Before OK in import dialog");
					return driver.myWaitAndClick(utils.toLocator(mappings.importDialogOKButton) , configuration.defaultTimeout).then(function() {
						//override if already exists
						return driver.myWaitAndClick(utils.toLocator(mappings.importOverrideConfirmButton), 1000).then(
								function() {
									if(!bOverride) {
										var sMsg = "Project " + sZipPath +  " already exists - no override";
										console.log(sMsg);
										throw(new Error(sMsg));
									}
									console.log("Project overriden: Before progress bar of import");
									return that.waitForProgressBar();
								},
								function() {
									console.log("Project created: Before progress bar of import");
									return that.waitForProgressBar().thenCatch(
											function(){
												console.log("progress bar not found - probably ended while waiting for the confirmation dialog");
												return;
											}
									);
								}
						);
					});
				});
			});
		},

		/**
		 * Clicks on a hierarchy of menus from the menu bar
		 * @param aMenuItems array of strings with the exact names in the ui of the menus
		 */
		goThroughMenubarItemsAndSelect : _goThroughMenubarItemsAndSelect,

		/**
		 * Goes through the repository browser, clicks on the last element in the path (whether a file or a folder) and
		 * returns that element.
		 * Notice that this method will work even if there are multiple files with the same name in your repository
		 * browser since the files are searched in the exact place that exists in the path
		 * @param {string} sPath - The path to the file or folder that should be clicked and returned. The separator is
		 * 						   a "/". There is no need to put one in the beginning.
		 * 						   The path must start with "Local/"
		 */
		goThroughRepositoryTreeAndGetElement : function(sPath) {
			if(!_.startsWith(sPath, "Local/")) {
				throw new Error("The path to the runnable file must start from the Local folder.");
			}
			var aPath = sPath.split("/").filter(function(sVal){return sVal !== ""; });
			return _goThroughRepositoryTreeAndGetElement(aPath);
		},

		runSelectedAppAsWebApplication : function() {
			return _goThroughMenubarItemsAndSelect(["Run" , "Run as" , "Web Application"]);
		},

		runSelectedWithMockData : function() {
			return _goThroughMenubarItemsAndSelect(["Run" , "Run with Mock Data"]);
		},
		/**
		 * Opens the console of Web-IDE in case it was closed.
		 * P.S. if all you need is to check what is printed in the console then call this function anyway even
		 * if the console was open and the call closed it the log will still appear in the HTML and can be
		 * located with: mappings.consoleInfoOutputContains
		 */
		openWebIDEConsole : function() {
			return _goThroughMenubarItemsAndSelect(["View" , "Console" ], true);
		},
		/*
		 * Close the console of Web-IDE in case it was opened.
		 * */
		closeWebIDEConsole : function() {
			return _goThroughMenubarItemsAndSelect(["View" , "Console" ], true);
		},

		/**
		 * Clear Web-IDE console
		 */
		clearWebIDEConsole : function() {
			return _goThroughMenubarItemsAndSelect(["View" , "Clear Console" ]);
		},

		/**
		 * Reset to Default (perspective)
		 */
		resetToDefault : function() {
			return _goThroughMenubarItemsAndSelect(["View" , "Reset to Default" ]);
		},

		/*
		 * maximize tab
		 * */
		maximizeActiveView : function() {
			return _goThroughMenubarItemsAndSelect(["View" , "Maximize Active View" ], true);
		},

		/*
		 * minimize tab
		 * */
		resetActiveView : function() {
			return _goThroughMenubarItemsAndSelect(["View" , "Reset Active View" ], true);
		},

		/**
		 * Clicks on a project in the repository browser to select it.
		 * @param {string} sProjectName - The project name
		 */
		selectProjectInRepositoryBrowser : function(sProjectName) {
			var projectElement = utils.toLocator(mappings.projectInRepositoryBrowserNode, [sProjectName]);
			return driver.myWaitAndClick(projectElement, configuration.defaultTimeout);
		},

		deleteProjectByName : function(sProjectName) {
			console.log("deleteProjectByName: start");
			return this.selectProjectInRepositoryBrowser(sProjectName).then(function() {
				//the repository browser may recenter if the previous selection was deep in the tree of the folders.
				//it seems that the delete key press gets lost while this recentering is happening
				return driver.sleep(2*1000);
			}).then(function(){
				return new webdriver.ActionSequence(driver).sendKeys(webdriver.Key.DELETE).perform();
			}).then(function() {
				return driver.myWaitAndClick(By.css("#MSG_CONFIRM--btn-OK"),configuration.defaultTimeout);
			}).then(function() {
				//for some reason the deletion doesn't happen if we don't wait here a little!
				return driver.sleep(2*1000);
			});
		},

		//TODO add documentation
		runApplicationWithMockData : function(sPath , sFileName){
			var that = this;
			return this.getRepositoryTreeFileElement(sPath ,sFileName).then(function(oFileElement){
				return driver.rightClick(oFileElement);
			}).then(function(){
				return that.selectFromContextMenu("Run/Run with Mock Data");
			});
		},//TODO add documentation
		runNewConfiguration : function(sPath , sFileName){
			var that = this;
			return this.getRepositoryTreeFileElement(sPath ,sFileName).then(function(oFileElement){
				return driver.rightClick(oFileElement);
			}).then(function(){
				return that.selectFromContextMenu("Run/New Configuration ...");
			});
		},

		runAsWebApplication : function(sPath , sFileName){
			var that = this;
			return this.getRepositoryTreeFileElement(sPath ,sFileName).then(function(oFileElement){
				return driver.rightClick(oFileElement);
			}).then(function(){
				return that.selectFromContextMenu("Run/Run as/Web Application");
			});
		},

		/**
		 * Goes through the repository browser according to the path supplied and then from the menu bar click:
		 * Run -> Run as -> Web Application
		 * This method will should even if there are multiple files with the same name in different palces in the
		 * repository browser.
		 * This method assumes that the popup of choosing the html to run will not appear since we ran the application
		 * through the runnable file (index.html for example)
		 * @param {string} sPathToRunnableFile - Slash separated path to the file that should be run. Usually this file
		 * 										 is the index.html or the localIndex.html
		 * 										 The path must start from the "Local" folder
		 * @returns {promise}
		 */
		runApplicationAsWebApplicationWithPathToRunnable : function(sPathToRunnableFile){
			var that = this;
			return this.goThroughRepositoryTreeAndGetElement(sPathToRunnableFile).then(function() {
				return that.goThroughMenubarItemsAndSelect(["Run" , "Run as" , "Web Application"]);
			});
		},

		/**
		 * Goes through the repository browser according to the path supplied and then rights click on the file ->
		 * run as -> SAP Fiori Component on Sandbox.
		 * This method will should even if there are multiple files with the same name in different palces in the
		 * repository browser.
		 * This method assumes that the popup of choosing the html/js to run will not appear since we ran the application
		 * through the runnable file (Component.js for example)
		 * @param {string} sPathToRunnableFile - Slash separated path to the file that should be run. Usually this file
		 * 										 is the Component.js
		 * 										 The path must start from the "Local" folder
		 * @returns {promise}
		 */
		runAsSAPFioriComponentOnSandbox : function(sPathToRunnableFile){
			var that = this;
			return this.goThroughRepositoryTreeAndGetElement(sPathToRunnableFile).then(function() {
				return that.goThroughMenubarItemsAndSelect(["Run" , "Run as" , "SAP Fiori Component on Sandbox"]);
			});
		},

		openRepositoryTreeFile : function(sPath , sFileName) {
			var aPath = sPath.split("/").filter(function(sVal){return sVal !== ""; });
			return _goThroughRepositoryTree(aPath ,sFileName).then(function(oFileElement){
				//return driver.rightClick(oFileElement);
				return driver.doubleClick(oFileElement);
			});
		},

		/**
		 * Selects a file in the repository browser
		 *
		 * @param {string} sFilePath - path to the file that should be run. Path parts should be separated by a "/"
		 * 				   			   and the path should start with the project name without a "/" in the beginning.
		 */
		selectRepositoryTreeFile : function(sFilePath) {
			var aPath = sFilePath.split("/").filter(function(sVal){return sVal !== ""; });
			return _goThroughRepositoryTree(_.dropRight(aPath) ,aPath[aPath.length - 1]);
		},

		getRepositoryTreeFileElement : function(sPath , sFileName) {
			var aPath = sPath.split("/").filter(function(sVal){return sVal !== ""});
			return _goThroughRepositoryTree(aPath ,sFileName);
		},

		runApplicationAsWebApplication : function(sPath){
			var that = this;
			return this.getRepositoryTreeFileElement(sPath ,null).then(function(oFileElement){
				return driver.rightClick(oFileElement).then(function(){
					return that.selectFromContextMenu("Run/Run as/Web Application  ");
				});
			});
		},

		getFileLocator : function(sFileName) {
			var FileLocator = utils.toLocator(mappings.elementWithTitle, sFileName);
			return FileLocator;
		},

		/**
		 * //TODO unify the API of these helper methods!!
		 * @param {string} sPath - slash separated string.
		 */
		selectFromContextMenu : function(sPath) {
			var aPath = sPath.split("/").filter(function(sVal){
						return sVal !== "";
					}
			);
			return _goThroughContextMenuAndSelect(aPath);
		},

		isDevelopmentButtonDisplayed : function() {
			var developmentButton = utils.toLocator(mappings.developmentPerspectiveButton);
			return driver.wait(until.elementLocated(developmentButton), configuration.defaultTimeout).then(function(oElement) {
				return oElement.isDisplayed();
			});
		},

		waitForProgressBar : function () {
			return driver.wait(until.elementLocated(utils.toLocator(mappings.progressBarStart)), configuration.defaultTimeout).then(function() {
				return driver.wait(until.elementLocated(utils.toLocator(mappings.progressBarStop)), configuration.defaultTimeout * 4);
			});
		}
	};
};
