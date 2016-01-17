var utils = require('./Utils'),
    _ = require('lodash'),
    webdriver = require('selenium-webdriver'),
    promise = webdriver.promise,
    RepositoryBrowser = require('../pageobjects/RepositoryBrowser'),
    ProjectWizard = require('../pageobjects/ProjectWizard'),
    Q = require('q');

module.exports = function (driver, By, until, configuration) {
    'use strict';
    var repositoryBrowser;
    var projectWizard;
    var mappings = {
        welcomePerspectiveButton: {type: 'css', path: 'button[id$="applicationLeftSidebar-tools.welcome"]'},
        welcomePerspectiveButtonDisabled: {type: 'css', path: 'button[id*="welcome"][aria-disabled="true"]'},
        developmentPerspectiveButton: {type: 'css', path: 'button[id*="development"][aria-disabled="false"]'},
        developmentPerspectiveButtonDisabled: {type: 'css', path: 'button[id*="development"][aria-disabled="true"]'},
        menubarItemRootElement: {type: 'xpath', path: '//div[@id="menubar"]//span[text()="$1"]'},
        menubarItemSubElement: {type: 'xpath', path: '//div/*/li[@role="menuitem"]/div[text()="$1"]'},
        menubarItemSubElementContains: {type: 'xpath', path: '//div/*/li[@role="menuitem"]/div[contains(text(),"$1")]'},
        errorMessageDialog : {type: 'xpath', path: '//span[@id="MSG_ERROR--msg"][contains(text(),"projectPath")]'},
        errorOkButton : {type: 'xpath', path: '//button[@id="MSG_ERROR--btn-OK"][contains(text(),"OK")]'},
        importDialogFileInput: {type: 'css', path: '.sapUiDlg .sapUiDlgCont input[type="file"]'},
        confirmMessageOverWritten: {type:'xpath', path:'//span[@id="MSG_CONFIRM--msg"][contains(@title,"Files with the same name will be overwritten")]'},
        overWrittenOkButton : {type: 'xpath', path: '//button[@id="MSG_CONFIRM--btn-OK"][contains(text(),"OK")]'},
        importDialogImportToInput: {
            type: 'xpath',
            path: '//div[label/text()="Import to"]/following-sibling::div/input'
        },
        importDialogImportToInput1: {type: 'xpath', path: '//input[contains(@class ,"sapUiTf")][@title="$1"]'},
        importDialogOKButton: {
            type: 'xpath',
            path: '//div[@role="dialog"]/*/div[@class="sapUiDlgBtns"]/button[text()="OK"]'
        },
        rootRepositoryNode: {
            type: 'css',
            path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]'
        },
        progressBarStart: {type: 'css', path: '#ideProgressBar.animate'},
        progressBarStop: {type: 'css', path: '#ideProgressBar:not(.animate)'},
        /**
         * can be any folder in the repository browser. Be careful if you have more than one folder with the same name in
         * different places of the hierarchy
         */
        childRepositoryFolderNode: {type: 'css', path: ' ~ ul .wattTreeFolder[title="$1"]'},
        /**
         * maps only to folders that are projects i.e. in the first level of the hierarchy
         */
        projectInRepositoryBrowserNode: {
            type: 'css',
            path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder[title="$1"][aria-level="2"]'
        },
        /**
         * maps only to folders that are projects and that are selected i.e. in the first level of the hierarchy and have
         * the class .sapUiTreeNodeSelected
         */
        projectInRepositoryBrowserNodeSelected: {
            type: 'css',
            path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder.sapUiTreeNodeSelected[title="$1"][aria-level="2"]'
        },

        /**
         * Locator for a selected project in the repository browser. It takes the project name as a parameter.
         * Locates only folders in the first level of the heirarchy.
         */
        projectInTree: {type: 'xpath', path: '//span[@class ="sapUiTreeNodeContent"][text()="$1"]'},
        projects: {type: 'xpath', path: '//li[contains(@class ,"wattTreeFolder")and @aria-level="2"]'},
        projectSelectedInRepositoryBrowserNode: {
            type: 'css',
            path: '.sapWattRepositoryBrowser .sapUiTreeList .sapUiTreeNode[title="Local"]  ~ ul .wattTreeFolder[title="$1"][aria-level="2"][aria-selected="true"]'
        },
        childRepositoryFileNode: {type: 'css', path: ' ~ ul .wattTreeFile[title="$1"]'},
        contextMenuRootElement: {
            type: 'xpath',
            path: '//div[contains(@class ,"sapWattContextMenu")]/*/li[div/text()="$1"]'
        },
        contextMenuSubItem: {type: 'xpath', path: '//div[contains(@class ,"WattMainMenuSub")]/*/li[div/text()="$1"]'},
        /**
         * Assuming there is only one .project.json file in the workspace
         */
        projectJsonFile: {type: 'css', path: 'li[title=".project.json"].sapUiTreeNode.wattTreeFile'},
        /**
         * Selector for an *INFO* message logged to the Web-IDE console (won't catch an error message)
         * The parameter is any string contained in the logged string
         * MUST call openWebIDEConsole before usage in order to trigger writing the console output to the HTML
         */
        consoleInfoOutputContains: {type: 'xpath', path: '//div[@class="info selectable" and contains(.,"$1")]'},
        elementWithTitle: {type: 'xpath', path: '//li[contains(@title, "$1")]'},
        folderNameTextBox: {type: 'css', path: 'input[id$="CreateFolderDialog_InputFolderName"]'},
        createFolderDialogOKButton: {type: 'css', path: 'button[id$="CreateFolderDialog_CreateButton"]'},
        createFolderDialogOKButton_d: {
            type: 'css',
            path: 'button[id$="CreateFolderDialog_CreateButton"][aria-disabled=true]'
        },
        fileNameTextBox: {type: 'css', path: 'input[id$="CreateFileDialog_InputFileName"]'},
        createFileDialogOKButton: {type: 'css', path: 'button[id$="CreateFileDialog_CreateButton"]'},
        createFileDialogOKButton_d: {
            type: 'css',
            path: 'button[id$="CreateFileDialog_CreateButton"][aria-disabled=true]'
        },
        projectTypes: {type: 'xpath', path: '//div[contains(@class ,"sapUiVltCell")]/button[.="Project Types"]'},
        runConfigurations: {
            type: 'xpath',
            path: '//div[contains(@class ,"sapUiVltCell")]/button[.="Run Configurations"]'
        },
        console: {type: 'css', path: 'div[id$="Console"]'},
        runConsol: {type: 'xpath', path: '//span[contains(@class ,"runConsoleTitle")and contains(text(),"Run")]'},
        buildStatus: {type: 'xpath', path: '//div[@class="info selectable" and contains(text(),"$1")]'},
        convertStatus: {type: 'xpath', path: '//div[@class="info selectable" and contains(text(),"$1")]'},
        tabCloseButton: {type: 'css', path: "button[class='sapUiTabClose'][title='Close']"},
        tab: {type: 'css', path: "a[class='sapUiUx3NavBarItem'][title='$1']"},
        tab1: {type: 'xpath', path: '//a[contains(@class ,"sapUiUx3NavBarItem")][text()="$1"]'},
        saveButton: {type: 'css', path: "button[title='Save (Ctrl+S)']"},

        /**
         * Selector for the progress bar of the loading of Web-IDE. It is valid when the progress bar value is 101 which
         * means that Web-IDE has already loaded and the progress bar disappeared.
         */
        webIdeProgressBarFullyLoaded: {type: 'xpath', path: '//progress[@max=100 and @value=101]'}
    };

    utils.decorateDriver(driver, until);

    var _loadAndSelectPerspective = function (url, perspectiveButtonLocator) {
        driver.get(url);
        return driver.myWaitAndClick(perspectiveButtonLocator, configuration.startupTimeout);
    };

    /**
     * Goes through the repository browser, clicks on the last element in the path (whether a file or a folder) and
     * returns that element.
     * Notice that this method will work even if there are multiple files with the same name in your repository
     * browser since the files are searched in the exact place that exists in the path
     * @param {array} aPathTitles - Array of strings. Each string contains a part of the path of the item that should
     *                                be selected and returned.
     * @private
     */
    function _goThroughRepositoryTreeAndGetElement(aPathTitles) {
        if (!aPathTitles.length) {
            return Q(null);
        }

        function _buildLocatorForFileOrFolderByPath(aPathTitles) {
            if (!aPathTitles.length) {
                return "";
            }

            var locator = '//ul[@class="sapUiTreeList"]';
            _.forEach(_.dropRight(aPathTitles), function (sPathTitle) {
                locator += '/ul[../li/span="' + sPathTitle + '"]';
            });
            locator += '/li[@title="' + aPathTitles[aPathTitles.length - 1] + '"]';

            return locator;
        }

        var oPromise = Q();

        _.forEach(aPathTitles, function (sPathTitle, index) {
            var element;
            oPromise = oPromise.then(function () {
                var aCurrentPath = _.slice(aPathTitles, 0, index + 1);
                var sCurrentLocator = utils.toLocator({
                    type: 'xpath',
                    path: _buildLocatorForFileOrFolderByPath(aCurrentPath)
                });
                driver.wait(until.elementLocated(sCurrentLocator, configuration.defaultTimeout));
                element = driver.findElement(sCurrentLocator);
                element.click();
                return element.sendKeys(webdriver.Key.ARROW_RIGHT).then(function () {
                    //In order to return the last element in the path
                    return element;
                });
            });
        });

        return oPromise;
    }

    var _goThroughRepositoryTree = function (aNodeTitles, sFileTitle) {
        if (!aNodeTitles.length) return;

        var sRootNodeLocator = utils.toLocator(mappings.rootRepositoryNode);

        var callbacks = [];
        var sLocatorPath = mappings.rootRepositoryNode.path;

        _.each(aNodeTitles.reverse(), function (sTitle) {

            var oCallbackFn;

            if (callbacks.length) {
                oCallbackFn = callbacks[callbacks.length - 1];
            }

            var oFileCallbackFn;
            if (sFileTitle) {
                oFileCallbackFn = function () {
                    var item = utils.toLocator(mappings.childRepositoryFileNode, [sFileTitle]);
                    item.value = sLocatorPath + item.value;
                    return driver.myWaitAndClick(item, configuration.startupTimeout).thenCatch(function (oError) {
                        return driver.myWaitAndClick(item, configuration.startupTimeout);
                    });
                };
            }

            var newCallback = function () {
                var item;
                if (!oCallbackFn && oFileCallbackFn) {
                    oCallbackFn = oFileCallbackFn;
                }

                item = utils.toLocator(mappings.childRepositoryFolderNode, [sTitle]);
                item.value = sLocatorPath + item.value;
                sLocatorPath = item.value;

                if (oCallbackFn) {
                    return driver.myWaitAndClick(item, configuration.defaultTimeout).then(
                        function () {
                            return driver.findElement(item).sendKeys(webdriver.Key.ARROW_RIGHT).then(oCallbackFn);
                        }
                    );

                } else {
                    return driver.myWait(item, configuration.defaultTimeout);
                }
            };

            callbacks.push(newCallback);

        });

        return callbacks.length ? driver.myWaitAndClick(sRootNodeLocator, configuration.defaultTimeout).then(callbacks[callbacks.length - 1]) : driver.myWaitAndClick(sRootNodeLocator, configuration.defaultTimeout).done();
    };

    var _goThroughContextMenuAndSelect = function (aTitles, index2) {
        if (!aTitles.length) {
            return;
        }
        var rev = [];
        if (aTitles.length > 1) {
            rev = aTitles.splice(1).reverse();
        } else {
            rev = aTitles;
        }
        var rootItemTitle = aTitles[0];
        var rootItemTitleLocator = utils.toLocator(mappings.contextMenuRootElement, [rootItemTitle]);

        var callbacks = [];

        _.each(rev, function (sTitle) {

            var oCallbackFn;

            if (callbacks.length) {
                oCallbackFn = callbacks[callbacks.length - 1];
            }

            var newCallback = function () {
                var item = utils.toLocator(mappings.contextMenuSubItem, [sTitle]);

                if (index2 > 1) {
                    if (oCallbackFn) {
                        return driver.myWaitAndClick(item, configuration.defaultTimeout).then(oCallbackFn);
                    } else {
                        return driver.myWaitAndClick(item, configuration.defaultTimeout);
                    }
                }
            };

            callbacks.push(newCallback);

        });

        return callbacks.length ? driver.myWaitAndClick(rootItemTitleLocator, configuration.startupTimeout).then(callbacks[callbacks.length - 1]) : driver.myWaitAndClick(rootItemTitleLocator, configuration.startupTimeout).done();
    };


    var _goThroughMenubarItemsAndSelect = function (aMenuBarTitles, bUseContains) {
        if (!aMenuBarTitles.length) {
            return promise.fulfilled(null);
        }
        var menuBarSubItemSelector = mappings.menubarItemSubElement;
        if (bUseContains) {
            menuBarSubItemSelector = mappings.menubarItemSubElementContains;
        }

        var oPromise = promise.fulfilled().then(function () {
            var rootMenuItemTitle = aMenuBarTitles[0];
            console.log("Click on the main menu item: " + rootMenuItemTitle);
            var menuElementLocator = utils.toLocator(mappings.menubarItemRootElement, [rootMenuItemTitle]);
            return driver.myWaitAndClick(menuElementLocator, configuration.defaultTimeout).thenCatch(function (oError) {
                return driver.myWaitAndClick(menuElementLocator, configuration.defaultTimeout).thenCatch(function (oError) {
                    return driver.myWaitAndClick(menuElementLocator, configuration.defaultTimeout);
                });
            });
        });

        _.forEach(_.drop(aMenuBarTitles, 1), function (sTitle) {
            oPromise = oPromise.then(function () {
                console.log("Click on the sub menu item: " + sTitle);
                var subElementLocator = utils.toLocator(menuBarSubItemSelector, [sTitle]);
                return driver.myWait(subElementLocator, configuration.defaultTimeout).then(function () {
                    return driver.findElement(subElementLocator,configuration.defaultTimeout).then(function () {
                        return driver.myWaitAndClick(subElementLocator, configuration.defaultTimeout).thenCatch(function (oError) {
                            return driver.myWaitAndClick(subElementLocator, configuration.defaultTimeout).thenCatch(function (oError) {
                                return driver.myWaitAndClick(subElementLocator, configuration.defaultTimeout);
                        });
                    });
                    });
                });
            });
        });

        return oPromise;
    };

    return {
        /**
         * Return the mappings so they can be used in different parts of the tests
         */
        mappings: mappings,

        clickWelcomePerspective: function (timeout) {
            var waitTimeout = timeout ? timeout : configuration.startupTimeout;
            var welcomeButton = utils.toLocator(mappings.welcomePerspectiveButton);
            return driver.wait(until.elementLocated(welcomeButton), waitTimeout).then(function () {
                var welcomeButtonDisabled = utils.toLocator(mappings.welcomePerspectiveButtonDisabled);
                return driver.isElementPresent(welcomeButtonDisabled);
            }).then(function (isPresent) {
                if (isPresent) {
                    return promise.fulfilled();
                }
                else {
                    return driver.myWaitAndClick(welcomeButton, waitTimeout);
                }
            });
        },

        clickDevelopmentPerspective: function (timeout) {
            var waitTimeout = timeout ? timeout : configuration.startupTimeout;
            var developmentButton = utils.toLocator(mappings.developmentPerspectiveButton);
            return driver.wait(until.elementLocated(developmentButton), waitTimeout).then(function () {
                var developmentButtonDisabled = utils.toLocator(mappings.developmentPerspectiveButtonDisabled);
                return driver.isElementPresent(developmentButtonDisabled);
            }).then(function (isPresent) {
                if (isPresent) {
                    console.log("if");
                    return promise.fulfilled();
                }
                else {
                    console.log("else");
                    return driver.myWaitAndClick(developmentButton, waitTimeout);
                }
            });
        },
        checkOpenConsole: function () {
            return driver.findElement(utils.toLocator(mappings.console)).then(function () {
                console.log('Check if RunCosole exists');
                return driver.findElement(utils.toLocator(mappings.runConsol)).then(function () {
                    console.log('Add Console');
                    return _goThroughMenubarItemsAndSelect(["View", "Console"])
                }, function (err) {
                    console.log('Console is exist');
                    return;
                });
            }, function (err) {
                console.log('Console not found');
                console.log('Add Console');
                return _goThroughMenubarItemsAndSelect(["View", "Console"]);

            });
        },
        checkErrorMessage: function (){
            return driver.myWait(utils.toLocator(mappings.errorMessageDialog), configuration.defaultTimeout).then(function () {
                driver.sleep(3 * 1000);
                return driver.findElement(utils.toLocator(mappings.errorOkButton),configuration.defaultTimeout).then(function () {
                    console.log('Error message is exist');
                    return driver.myWaitAndClick(utils.toLocator(mappings.errorOkButton), configuration.defaultTimeout).thenCatch(function (oError) {
                            return driver.myWaitAndClick(utils.toLocator(mappings.errorOkButton), configuration.defaultTimeout);
                        });
                    });

            }, function (err) {
                console.log('Error message not exist');
                return;
            });
        },
        checkOverWrittenMessage: function (){
            return driver.myWait(utils.toLocator(mappings.confirmMessageOverWritten), 1000).then(function () {
               // driver.sleep(2 * 1000);
                return driver.findElement(utils.toLocator(mappings.overWrittenOkButton),configuration.defaultTimeout).then(function () {
                    console.log('Overwriten message is exist');
                    return driver.myWaitAndClick(utils.toLocator(mappings.overWrittenOkButton), configuration.defaultTimeout).thenCatch(function (oError) {
                        return driver.myWaitAndClick(utils.toLocator(mappings.overWrittenOkButton), configuration.defaultTimeout);
                    });
                });

            }, function (err) {
                console.log('Overwriten message not exist');
                return;
            });
        },
        checkExistProject: function (projectName) {
            var that = this;
            repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
            return driver.myWait(utils.toLocator(mappings.projectInTree, ["Local"]), configuration.defaultTimeout).then(function () {
                return driver.myWaitAndClick(utils.toLocator(mappings.projectInTree, [projectName]), 1000).then(function () {
                    console.log('Project ' + projectName + " exist");
                    return that.deleteProjectByName(projectName);
                }, function (err) {
                    console.log('Project ' + projectName + " not exist");
                    return;
                });
            });
        },
        checkBuildStatus: function (sTitle) {
            return driver.myWait(utils.toLocator(mappings.buildStatus, ["Build of /" + sTitle + "/" + "db completed"]), configuration.defaultTimeout).then(function () {
                console.log('Build successfully complited');
            });
        },
        checkConvertStatus: function (sTitle) {
            return driver.myWait(utils.toLocator(mappings.convertStatus, ["Conversion of folder " + sTitle + " completed successfully."]), configuration.defaultTimeout).then(function () {
                console.log('Conversion successfully complited');
            });
        },
        navigateToDevelopmentPerspectiveViaView: function () {
            return _goThroughMenubarItemsAndSelect(["Tools", "Development"]);
        },

        navigateToWelcomePerspectiveViaView: function () {
            return _goThroughMenubarItemsAndSelect(["Tools", "Welcome"]);
        },

        loadAndOpenWelcomePerspective: function () {
            var welcomeButton = utils.toLocator(mappings.welcomePerspectiveButton);
            return _loadAndSelectPerspective(configuration.url, welcomeButton);
        },
        loadAndOpenDevelopmentPerspective: function () {
            var developmentButton = utils.toLocator(mappings.developmentPerspectiveButton);
            return _loadAndSelectPerspective(configuration.url, developmentButton);
        },

        createMtaProjectFromTemplate: function (sProjectName) {
            projectWizard = new ProjectWizard(driver, By, until, configuration);
            return this.checkExistProject(sProjectName).then(function () {
                return _goThroughMenubarItemsAndSelect(["File", "New", "Project from Template"], true).then(function () {
                    console.log("selectTemplate");
                    return projectWizard.selectTemplate(configuration.templateName);
                }).then(function () {
                    console.log("next");
                    return projectWizard.next();
                }).then(function () {
                    console.log("enterProjectName");
                    return projectWizard.enterProjectName(sProjectName);
                }).then(function () {
                    console.log("next");
                    return projectWizard.next();
                }).then(function () {
                    console.log("next");
                    return projectWizard.next();
                }).then(function () {
                    console.log("finish");
                    return projectWizard.finishAndWait();
                });
            });
        },
        createModuleFromTemplate: function (sModuleType, sModuleName) {
            projectWizard = new ProjectWizard(driver, By, until, configuration);
            return _goThroughMenubarItemsAndSelect(["File", "New", sModuleType]).then(function () {
                console.log("enterModuleName");
                //driver.sleep(1 * 1000);
                return projectWizard.enterProjectName(sModuleName);
            }).then(function () {
                console.log("next");
                return projectWizard.next();
            }).then(function () {
                console.log("next");
                return projectWizard.next();
            }).then(function () {
                console.log("finish");
                return projectWizard.finishAndWait();
            })
        },
        importZip: function (sZipPath, importProjName) {
            var that = this;
            return _goThroughMenubarItemsAndSelect(["File", "Import", "From File System"]).then(function () {
                return driver.myWaitAndSendKeys(sZipPath, utils.toLocator(mappings.importDialogFileInput), configuration.startupTimeout).then(function () {
                    return driver.sleep(1 * 1000).then(function () {
                        return driver.myWaitAndSendKeys(webdriver.Key.chord(webdriver.Key.CONTROL, "a"), utils.toLocator(mappings.importDialogImportToInput), configuration.defaultTimeout).then(function () {
                            return driver.myWaitAndSendKeys(webdriver.Key.DELETE, utils.toLocator(mappings.importDialogImportToInput)).then(function () {
                                console.log("Import Project folder name " + importProjName);
                                return driver.myWaitAndSendKeys(importProjName, utils.toLocator(mappings.importDialogImportToInput), configuration.startupTimeout).then(function () {
                                    return driver.sleep(1 * 1000).then(function () {
                                        return driver.myWaitAndClick(utils.toLocator(mappings.importDialogOKButton), configuration.defaultTimeout).then(function () {
                                            that.checkOverWrittenMessage().then(function () {
                                                return that.waitForProgressBar();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });

                });
            });
        },

        /**
         * Clicks on a hierarchy of menus from the menu bar
         * @param aMenuItems array of strings with the exact names in the ui of the menus
         */
        goThroughMenubarItemsAndSelect: _goThroughMenubarItemsAndSelect,

        /**
         * Goes through the repository browser, clicks on the last element in the path (whether a file or a folder) and
         * returns that element.
         * Notice that this method will work even if there are multiple files with the same name in your repository
         * browser since the files are searched in the exact place that exists in the path
         * @param {string} sPath - The path to the file or folder that should be clicked and returned. The separator is
         *                           a "/". There is no need to put one in the beginning.
         *                           The path must start with "Local/"
         */
        goThroughRepositoryTreeAndGetElement: function (sPath) {
            if (!_.startsWith(sPath, "Local/")) {
                throw new Error("The path to the runnable file must start from the Local folder.");
            }
            var aPath = sPath.split("/").filter(function (sVal) {
                return sVal !== "";
            });
            return _goThroughRepositoryTreeAndGetElement(aPath);
        },

        runSelectedAppAsWebApplication: function () {
            return _goThroughMenubarItemsAndSelect(["Run", "Run as", "Web Application"]);
        },
        runSelectedAppAsNodeJSApplication: function () {
            return _goThroughMenubarItemsAndSelect(["Run", "Run as", "Node.js Application"]);
        },
        runSelectedWithMockData: function () {
            return _goThroughMenubarItemsAndSelect(["Run", "Run with Mock Data"]);
        },
        /**
         * Opens the console of Web-IDE in case it was closed.
         * P.S. if all you need is to check what is printed in the console then call this function anyway even
         * if the console was open and the call closed it the log will still appear in the HTML and can be
         * located with: mappings.consoleInfoOutputContains
         */
        openWebIDEConsole: function () {
            return _goThroughMenubarItemsAndSelect(["View", "Console"], true);
        },

        createNewFolder: function (folderName) {
            return _goThroughMenubarItemsAndSelect(["File", "New", "Folder"]).then(function () {
                driver.wait(until.elementLocated(utils.toLocator(mappings.createFolderDialogOKButton_d)), configuration.defaultTimeout);
                return driver.findElement(utils.toLocator(mappings.createFolderDialogOKButton_d)).then(function () {
                    var folderNameTextbox = utils.toLocator(mappings.folderNameTextBox);
                    driver.wait(until.elementLocated(folderNameTextbox), configuration.defaultTimeout);
                    return driver.findElement(folderNameTextbox).sendKeys(folderName).then(function () {

                        var okButton = utils.toLocator(mappings.createFolderDialogOKButton);

                        return driver.myWaitAndClick(okButton, configuration.defaultTimeout);
                    });
                });
            });
        },
        createNewFile: function (fileName) {
            return _goThroughMenubarItemsAndSelect(["File", "New", "File"], true).then(function () {
                driver.wait(until.elementLocated(utils.toLocator(mappings.createFileDialogOKButton_d)), configuration.defaultTimeout);
                return driver.findElement(utils.toLocator(mappings.createFileDialogOKButton_d)).then(function () {
                    var fileNameTextBox = utils.toLocator(mappings.fileNameTextBox);
                    driver.wait(until.elementLocated(fileNameTextBox), configuration.defaultTimeout);
                    return driver.findElement(fileNameTextBox).sendKeys(fileName).then(function () {
                        var okButton = utils.toLocator(mappings.createFileDialogOKButton);
                        return driver.myWaitAndClick(okButton, configuration.defaultTimeout);
                    });
                });
            });

        },

        /**
         * Clear Web-IDE console
         */
        clearWebIDEConsole: function () {
            return _goThroughMenubarItemsAndSelect(["View", "Clear Console"]);
        },

        /**
         * Clicks on a project in the repository browser to select it.
         * @param {string} sProjectName - The project name
         */
        selectProjectInRepositoryBrowser: function (sProjectName) {
            var projectElement = utils.toLocator(mappings.projectInRepositoryBrowserNode, [sProjectName]);
            return driver.myWaitAndClick(projectElement, configuration.defaultTimeout);
        },

        deleteProjectByName: function (sProjectName) {
            return this.selectProjectInRepositoryBrowser(sProjectName).then(function () {
                //the repository browser may recenter if the previous selection was deep in the tree of the folders.
                //it seems that the delete key press gets lost while this recentering is happening
                return driver.sleep(utils.seconds(2));
            }).then(function () {
                console.log("select project " + sProjectName + " will be delete");
                return new webdriver.ActionSequence(driver).sendKeys(webdriver.Key.DELETE).perform();
            }).then(function () {
                return driver.myWaitAndClick(By.css("#MSG_CONFIRM--btn-OK"), configuration.defaultTimeout);
            }).then(function () {
                //for some reason the deletion doesn't happen if we don't wait here a little!
                return driver.sleep(utils.seconds(2));
            });
        },

        deleteAllProject: function () {
            var that =this;

            repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
            var projectElement = utils.toLocator(mappings.projects);
            var aPromises = [];
            return driver.findElements(projectElement).then(function (aListPromises) {
                return Q.all(aListPromises).then(function(aListItems) {
                    var chain = aListItems.reduce(function (previous, item){
                        return previous.then(function(previousValue) {
                            return that.deleteLastProject(projectElement);
                        })
                    }, Q.resolve(true));
                    return chain.then(function(lastResult) {
                        //
                    });
                });
            });
        },

        deleteLastProject: function(projectElement) {
            var that =this;
            return driver.findElements(projectElement).then(function (aListPromises) {
                return Q.all(aListPromises).then(function(aListItems) {
                    return that.deleteOneProject(aListItems[aListItems.length - 1]);
                });
            });
        },


        deleteOneProject: function (item) {

            return item.getAttribute("title").then(function(title) {
                console.log("delete project " + title);
                return repositoryBrowser.deleteNode(title).then(function(){
                    console.log("after delete project " + title);
                });
            });
        },

        //TODO add documentation
        runApplicationWithMockData: function (sPath, sFileName) {
            var that = this;
            return this.getRepositoryTreeFileElement(sPath, sFileName).then(function (oFileElement) {
                return driver.rightClick(oFileElement);
            }).then(function () {
                return that.selectFromContextMenu("Run/Run with Mock Data");
            });
        },//TODO add documentation
        runNewConfiguration: function (sPath, sFileName) {
            var that = this;
            return this.getRepositoryTreeFileElement(sPath, sFileName).then(function (oFileElement) {
                return driver.rightClick(oFileElement);
            }).then(function () {
                return that.selectFromContextMenu("Run/Run Configuration ...");
            });
        },
        convertTo: function (sPath, convertTo) {
            var that = this;
            return this.getRepositoryTreeFileElement(sPath, null).then(function (oFileElement) {
                return driver.rightClick(oFileElement).thenCatch(function (oError) {
                    return driver.rightClick(oFileElement);
                });
            }).then(function () {
                return that.selectFromContextMenu("Convert to /" + convertTo);
            });
        },
        projectType: function (sProjectName) {
            var that = this;
            return this.selectProjectInRepositoryBrowser(sProjectName).then(function (sNodeLocator) {
                return driver.rightClick(sNodeLocator);
            }).thenCatch(function (oError) {
                return that.selectProjectInRepositoryBrowser(sProjectName).then(function (sNodeLocator) {
                    return driver.rightClick(sNodeLocator);
                });
            }).then(function () {
                return that.selectFromContextMenu("Project Settings").then(function () {
                    return driver.myWaitAndClick(utils.toLocator(mappings.projectTypes), configuration.defaultTimeout).thenCatch(function (oError) {
                        return driver.myWaitAndClick(utils.toLocator(mappings.projectTypes), configuration.defaultTimeout);
                    });
                });
            });
        },
        projectTypeForModule: function (sModuleName) {
            repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
            var that = this;
            console.log("The model is " + sModuleName);
            return repositoryBrowser.selectNode(sModuleName, null).then(function (sNodeLocator) {
                console.log("Press right click");
                return driver.rightClick(sNodeLocator);

            }).then(function () {
                console.log("Open the project settings -> project type");
                return that.selectFromContextMenu("Project Settings").then(function () {
                    return driver.myWaitAndClick(utils.toLocator(mappings.projectTypes), configuration.defaultTimeout).thenCatch(function (oError) {
                        return driver.myWaitAndClick(utils.toLocator(mappings.projectTypes), configuration.defaultTimeout);
                    });
                });
            });
        },
        runConfiguration: function (sPath, sFileName) {
            repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
            var that = this;
            return repositoryBrowser.selectNode(configuration.projectName + "/js").then(function (oFileElement) {
                return driver.rightClick(oFileElement);
            }).then(function () {

                return that.selectFromContextMenu("Run/Run Configurations ...").then(function () {

                })
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
         *                                         is the index.html or the localIndex.html
         *                                         The path must start from the "Local" folder
         * @returns {promise}
         */
        runApplicationAsWebApplicationWithPathToRunnable: function (sPathToRunnableFile) {
            var that = this;
            return this.goThroughRepositoryTreeAndGetElement(sPathToRunnableFile).then(function () {
                return that.goThroughMenubarItemsAndSelect(["Run", "Run as", "Web Application  "]);
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
         *                                         is the Component.js
         *                                         The path must start from the "Local" folder
         * @returns {promise}
         */
        runAsSAPFioriComponentOnSandbox: function (sPathToRunnableFile) {
            var that = this;
            return this.goThroughRepositoryTreeAndGetElement(sPathToRunnableFile).then(function () {
                return that.goThroughMenubarItemsAndSelect(["Run", "Run as", "SAP Fiori Component on Sandbox"]);
            });
        },

        openRepositoryTreeFile: function (sPath, sFileName) {
            var aPath = sPath.split("/").filter(function (sVal) {
                return sVal !== "";
            });
            return _goThroughRepositoryTree(aPath, sFileName).then(function (oFileElement) {
                //return driver.rightClick(oFileElement);
                return driver.doubleClick(oFileElement);
            });
        },
        clickOnSave: function (sPath, sFileName) {
            var saveButton = utils.toLocator(mappings.saveButton);
            return driver.myWaitAndClick(saveButton, configuration.defaultTimeout).thenCatch(function (oError) {
                return driver.myWaitAndClick(saveButton, configuration.defaultTimeout);
            });
        },
        /**
         * Selects a file in the repository browser
         *
         * @param {string} sFilePath - path to the file that should be run. Path parts should be separated by a "/"
         *                               and the path should start with the project name without a "/" in the beginning.
         */
        selectRepositoryTreeFile: function (sFilePath) {
            var aPath = sFilePath.split("/").filter(function (sVal) {
                return sVal !== "";
            });
            return _goThroughRepositoryTree(_.dropRight(aPath), aPath[aPath.length - 1]);
        },

        selectRepositoryTreeRoot: function () {
            var item = utils.toLocator(mappings.rootRepositoryNode);
            return driver.myWaitAndClick(item, configuration.startupTimeout);
        },

        getRepositoryTreeFileElement: function (sPath, sFileName) {
            var aPath = sPath.split("/").filter(function (sVal) {
                return sVal !== ""
            });
            return _goThroughRepositoryTree(aPath, sFileName);
        },

        runApplicationAsWebApplication: function (sPath) {
            var that = this;
            return this.getRepositoryTreeFileElement(sPath, null).then(function (oFileElement) {
                return driver.rightClick(oFileElement).then(function () {
                    return that.selectFromContextMenu("Run/Run as/Web Application  ");
                });
            });
        },

        getFileLocator: function (sFileName) {
            var FileLocator = utils.toLocator(mappings.elementWithTitle, sFileName);
            return FileLocator;
        },

        runAsWebApplication: function (sPath, sFileName) {
            var that = this;
            return this.getRepositoryTreeFileElement(sPath, sFileName).then(function (oFileElement) {
                return driver.rightClick(oFileElement);
            }).then(function () {
                return that.selectFromContextMenu("Run/Run as/Web Application");
            });
        },

        /**
         * //TODO unify the API of these helper methods!!
         * @param {string} sPath - slash separated string.
         */
        selectFromContextMenu: function (sPath) {
            var aPath = sPath.split("/").filter(function (sVal) {
                    return sVal !== "";
                }
            );
            return _goThroughContextMenuAndSelect(aPath, aPath.length);
        },
        closeTab: function (tabName) {
            var projectElement = utils.toLocator(mappings.tabCloseButton);
            var tab = utils.toLocator(mappings.tab1, [tabName]);
            return driver.wait(until.elementLocated(tab), configuration.defaultTimeout).then(function () {
                return driver.myWaitAndClick(projectElement, configuration.defaultTimeout).thenCatch(function (oError) {
                    driver.myWaitAndClick(projectElement, configuration.defaultTimeout)
                });
            });
        },
        selectTab: function (tabName) {
            var projectElement = utils.toLocator(mappings.tab, [tabName]);
            return driver.myWaitAndClick(projectElement, configuration.defaultTimeout);
        },


        isDevelopmentButtonDisplayed: function () {
            var developmentButton = utils.toLocator(mappings.developmentPerspectiveButton);
            return driver.wait(until.elementLocated(developmentButton), configuration.defaultTimeout).then(function (oElement) {
                return oElement.isDisplayed();
            });
        },

        waitForProgressBar: function () {
            return driver.wait(until.elementLocated(utils.toLocator(mappings.progressBarStart)), configuration.defaultTimeout).then(function () {
                return driver.wait(until.elementLocated(utils.toLocator(mappings.progressBarStop)), configuration.defaultTimeout);
            });
        }
    };
};
