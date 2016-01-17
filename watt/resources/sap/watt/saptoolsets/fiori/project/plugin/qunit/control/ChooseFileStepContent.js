jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.qunit.control.ChooseFileStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.project.plugin.qunit.control.ChooseFileStepContent", {
		// Define the SAPUI5 control's metadata
		metadata: {

		},
		_oGrid: null,
		_oRepositoryBrowserGrid: null,
		_oMethodsTableGrid: null,
		_oMethodsTable: null,
		_onBeforeRenderingFlag: true,
		_sComponentPath: null,
		_oMethodsTableLabel: null,
		_sJSFileExtension: "js",
		_oSelelctAllCheckBox: null,
		_oRepositoryBrowserControl: null,

		init: function() {

			if (!this._oGrid) {
				this._oGrid = new sap.ui.layout.Grid({
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});
			}

			this.addContent(this._oGrid);

		},
		setFocusOnFirstItem: function() {
			// Call the focus() method for your first UI element.                               
		},
		validateStepContent: function() {
			// Return a Q-promise which is resolved if the step content
			// is currently in valid state, and is rejected if not.
		},
		cleanStep: function() {
			// 1. Clean properties that were added to
			//    this.getModel().getData().
			// 2. Clean the control's private members.
			// 3. Destroy the UI controls created by this control
			//    that are not currently displayed.
			//    Currently displayed content is destroyed by the wizard
			//    before this step is displayed again.
			this._onBeforeRenderingFlag = true;
			this._sComponentPath = "";
			if (this._oRepositoryBrowserControl) {
				this._oRepositoryBrowserControl.getContent()[0].detachSelect(this.onRepositorySelectFile, this);
			}
			if (this.getModel()) {
				if (this.getModel().getData().oQunitData) {
					this.getModel().getData().oQunitData = undefined;
				}
				if (this.getModel().getData().fileName) {
					this.getModel().getData().fileName = undefined;
				}
				if (this.getModel().getData().filePath) {
					this.getModel().getData().filePath = undefined;
				}
				if (this.getModel().getData().testSuiteHtmlFileName) {
					this.getModel().getData().testSuiteHtmlFileName = undefined;
				}
				if (this.getModel().getData().testSuiteJSFileName) {
					this.getModel().getData().testSuiteJSFileName = undefined;
				}
				if (this.getModel().getData().testJSFileName) {
					this.getModel().getData().testJSFileName = undefined;
				}
			}
		},
		renderer: {},

		// Overwrite this SAPUI5 control method if you have some logic
		// to implement here
		onAfterRendering: function() {

		},

		//Show the Repository Browser only js files
		showRepositoryBrowserSelect: function() {

			var that = this;
			var oContext = this.getContext();
			//create the Repository Browser with js files only
			return oContext.service.repositoryBrowserFactory.create(null, {
				filters: [that._sJSFileExtension]
			}).then(function(repositoryBrowserInstance) {
				//Set the selected file to be the origin file
				return repositoryBrowserInstance.setSelection(that.getModel().oData.selectedDocument, true).then(function() {
				   return repositoryBrowserInstance.getContent().then(function(oRepositoryBrowserControl) {
    					if (oRepositoryBrowserControl) {
    						that._oRepositoryBrowserControl = oRepositoryBrowserControl;
    						oRepositoryBrowserControl.setHeight("400px");
    						oRepositoryBrowserControl.setWidth("100%");
    						oRepositoryBrowserControl.setLayoutData(new sap.ui.layout.GridData({
    							span: "L12 M12 S12"
    						}));
    					}
    					//Handle select
    					if (oRepositoryBrowserControl && oRepositoryBrowserControl.getContent().length > 0) {
    						oRepositoryBrowserControl.getContent()[0].attachSelect(that.onRepositorySelectFile, that);
    					}
    					return oRepositoryBrowserControl;
				    }); 
				});
	    	}).fail(
				function() {
					return that._throwErrorHandler(that.getContext().i18n.getText("i18n",
						"error_repository_browser"));
			});
		},

		//triggers when a file is selected
		onRepositorySelectFile: function(oEvent) {

			if ((!oEvent || !oEvent.getParameter)) {
				return;
			}
			var oSelectedNode = oEvent.getParameter("node");
			if (!oSelectedNode) {
				return;
			}

			var that = this;
			
			var oSelectedDocument = oSelectedNode.oDocument;
			//check file selection only js file and only from the selected project
			this._checkValidFileSelction(oSelectedDocument).then(function(bValidFile) {
				if (bValidFile) {
					var sFileName = oSelectedDocument.getTitle();
					// prepare the file name for generation 
					return that._setFileNamesForGeneration(sFileName.replace(".js", "")).then(function() {
						//get the data form the esprima parser
						return that._getFileData(oSelectedDocument).then(function() {
							//make the table visable
							that._oMethodsTable.setVisible(true);
							that._oMethodsTableLabel.setVisible(true);
							//handle the select/deselect all
							that._registerChildren(that._oSelelctAllCheckBox);
							// set model fields
							that.getModel().setProperty("/fileName", sFileName.replace(".js", ""));
							var sFilePath = oSelectedDocument._mEntity._sParentPath;
							return that.getModel().setProperty("/filePath", sFilePath);
						});
					});
				} else {
					if (that._oMethodsTable) {
						//make the table invisable
						that._oMethodsTable.setVisible(true);
						that._oMethodsTableLabel.setVisible(true);
						//clear the methods table
						that._oMethodsTable.getModel().setProperty("/aFunctionsList", null);
					}
					return that._oMethodsTable;
				}
			}).done();
		},

		//check if a valid file: a js file in the selected project
		_checkValidFileSelction: function(oSelectedDocument) {

			var that = this;
			var sErrorMessage;
			//get the selected file project
			return oSelectedDocument.getProject().then(function(oSelectedProject) {
				var bValid = false;
				//check if a file
				if (oSelectedDocument.getType() === "file") {
					var sFileName = oSelectedDocument.getTitle();
					//check if js file
					if (sFileName && that._isFileNameValid(sFileName)) {
						var sSelectedProjectTitle = oSelectedProject.getTitle();
						var aComponentPath = that._sComponentPath.split("/");
						//check if in the selected project
						if (sSelectedProjectTitle === aComponentPath[1]) {
							bValid = true;
						} else {
							sErrorMessage = that.getContext().i18n.getText("i18n", "errmsg_Select_File", [aComponentPath[1]]);
						}

					}
				}
				if (bValid) {
					that.fireValidation({
						isValid: true
					});
				} else {
					that._throwErrorHandler(sErrorMessage);
				}
				return bValid;
			});
		},

		_throwErrorHandler: function(sError) {
			this.fireValidation({
				isValid: false,
				message: sError
			});
		},

		//Handle the select/deselect all
		_registerChildren: function(oParent) {

			var that = this;
			var aItems = this._oMethodsTable.getModel().getProperty("/aFunctionsList");

			var nSelectedChildren = 0;
			//get the selected children
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].selected) {
					nSelectedChildren++;
				}
			}
			//set the state acourding to the selected children
			if (nSelectedChildren === 0) {
				oParent.toggle("Unchecked");
			} else if (nSelectedChildren === aItems.length) {
				oParent.toggle("Checked");
			} else {
				oParent.toggle("Mixed");
			}
			//handle the the select/deselect all checkbox selection
			oParent.attachChange(function() {
				var i = 0;
				if (this.getSelectionState() === "Checked") {
					for (i = 0; i < aItems.length; i++) {
						aItems[i].selected = true;

					}
					nSelectedChildren = aItems.length;
				} else {
					for (i = 0; i < aItems.length; i++) {
						aItems[i].selected = false;
					}
					nSelectedChildren = 0;
				}
				that._oMethodsTable.getModel().setProperty("/aFunctionsList", aItems);
				that._updateWizardModel();
			});

		},

		//get selected file data from the Esprima Parser
		_getFileData: function(oSelectedDocument) {
			var that = this;
			var oContext = this.getContext();
			var oEsprimaParser = oContext.service.esprimaParser;
			//get the selected document(file) content
			return oSelectedDocument.getContent().then(function(sDocContent) {
				return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/ChooseFileUtil").then(function(oChooseFileUtil) {
					return oChooseFileUtil.getFileData(sDocContent, oEsprimaParser).then(function(aFuncList) {
						//set the function table model
						that._oMethodsTable.getModel().setProperty("/aFunctionsList", aFuncList);
						//set the table # of rows
						var iNumOfFunctions = aFuncList.length === 0 ? 1 : aFuncList.length;
						that._oMethodsTable.setVisibleRowCount(iNumOfFunctions);
					});
				});
			});
		},

		// create the function table
		_createFileContent: function() {

			//create the table
			this._oMethodsTable = new sap.ui.table.Table({
				allowColumnReordering: false,
				width: "100%",
				selectionMode: sap.ui.table.SelectionMode.None,
				noData: "{i18n>NoDataText}"
			});
			this._oMethodsTable.setLayoutData(new sap.ui.layout.GridData({
				span: "L6 M8 S12"

			}));

			//create the TriStateCheckBox
			this._oSelelctAllCheckBox = new sap.ui.commons.TriStateCheckBox({});
			//the select column
			this._oMethodsTable.addColumn(new sap.ui.table.Column({
				label: this._oSelelctAllCheckBox,
				template: new sap.ui.commons.CheckBox({
					change: [this._onCheckBoxClick, this]
				}).bindProperty("checked", "selected"),
				width: "50px",
				tooltip: "{i18n>tlt_SelectDeselectAll}",
				hAlign: "Center"
			}));

			// the objects name column
			this._oMethodsTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>Object_Name}",
					design: "Bold"
				}),
				template: new sap.ui.commons.Label().bindProperty("text", "objectName"),
				tooltip: "{i18n>tlt_Object_Name}",
				width: "200px"
			}));

			// the functions name column
			this._oMethodsTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>Function_Name}",
					design: "Bold"
				}),
				template: new sap.ui.commons.Label().bindProperty("text", "functionName"),
				tooltip: "{i18n>tlt_Function_Name}",
				width: "200px"
			}));

			//bind the ui model to the table
			var oModel = new sap.ui.model.json.JSONModel();
			this._oMethodsTable.setModel(oModel);
			this._oMethodsTable.bindRows("/aFunctionsList");

			//add the table to the grid
			//this._oGrid.addContent(this._oMethodsTable);
			this._oMethodsTableGrid.addContent(this._oMethodsTable);

		},

		//triggers when checkbox is selected/deselected and prepare the generation model
		_onCheckBoxClick: function() {

			//set the TriStateCheckBox checkbox 
			this._registerChildren(this._oSelelctAllCheckBox);
			//prepare the wizard model from the ui model
			this._updateWizardModel();
		},

		//convert the ui model into the wizard model
		_updateWizardModel: function() {
			var that = this;
			var aTableFuncList = this._oMethodsTable.getModel().getProperty("/aFunctionsList");
			Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/ChooseFileUtil").then(function(oChooseFileUtil) {
				var oQunitData = oChooseFileUtil.updateWizardModel(aTableFuncList);
				that.getModel().setProperty("/oQunitData", oQunitData);
			}).done();
		},

		_checkInput: function(sInput, regx) {
			var regex = new RegExp(regx);
			return regex.test(sInput);
		},

		/**
		 *This method checks whether the file name is correct
		 * valid file name *.js
		 * @param sFileName
		 */
		_isFileNameValid: function(sFileName) {
			return this._checkInput(sFileName, "([a-zA-Z]:(\\w+)*\\[a-zA-Z0_9]+)?\.(js)$");
		},

		onBeforeRendering: function() {
			//make sure that this code only execute once
			if (this._onBeforeRenderingFlag) {
				this.configureI18nResources();
				this._onBeforeRenderingFlag = false;
				this._addLayoutGrids();
				this._addHeaders();
				var that = this;
				this._sComponentPath = this.getModel().getProperty("/componentPath");
				this._setQunitTargetFolderPath().then(function() {
					//show the Repository Browser
					return that.showRepositoryBrowserSelect().then(function(repositoryBrowserControl) {
						if (repositoryBrowserControl) {
						    if (!that._oMethodsTable) {
							    //create the function table
							    that._createFileContent();
							    //make the table visable
							    that._oMethodsTable.setVisible(true);
							    that._oMethodsTableLabel.setVisible(true);
						    }
							
							return that._oRepositoryBrowserGrid.addContent(repositoryBrowserControl);
						}
					});
				}).done();
			}
		},

		_addHeaders: function() {

			//Labels headers for each grid
			var oRepositoryBrowserLabel = new sap.ui.commons.Label({
				text: "{i18n>lbl_Repository_Browser}",
				textAligh: "Left",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("qunitHeaderLabel");

			this._oMethodsTableLabel = new sap.ui.commons.Label({
				text: "{i18n>lbl_Function_Table}",
				textAligh: "Left",
				visible: false,
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("qunitHeaderLabel");
			this._oRepositoryBrowserGrid.addContent(oRepositoryBrowserLabel);
			this._oMethodsTableGrid.addContent(this._oMethodsTableLabel);
		},

		_addLayoutGrids: function() {
			this._oRepositoryBrowserGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M4 S4"
				})
			}).addStyleClass("qunitRepositoryBrowser");

			this._oMethodsTableGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M8 S8"
				})
			});

			this._oGrid.addContent(this._oRepositoryBrowserGrid);
			this._oGrid.addContent(this._oMethodsTableGrid);
		},

		_setQunitTargetFolderPath: function() {
			var that = this;
			var oContext = this.getContext();
			var oDocProvider = oContext.service.filesystem.documentProvider;
			return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
				return oQunitUtil.figureOutQunitTargetFolderPath(that._sComponentPath, oDocProvider).then(function(sQunitTargetFolderPath) {
					that.getModel().setProperty("/componentPath", sQunitTargetFolderPath);
				});
			});
		},

		_setFileNamesForGeneration : function(sSelectedFileName) {
		var that = this;
		var oContext = this.getContext();
		var oDocProvider = oContext.service.filesystem.documentProvider;
		var sComponentPath = that.getModel().getProperty("/componentPath");
		// check for test.js file existence
		var sFolderPath = sComponentPath + "/test/qunit/test-files";
		var sProposedFileName = sSelectedFileName + "Test";
		return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
			return oQunitUtil.getFileName(sFolderPath, sProposedFileName, ".js", oDocProvider).then(function(newFileName) {
				that.getModel().setProperty("/testJSFileName", "test/qunit/test-files/" + newFileName + ".js");
				// check for test.suite.html file existence
				sFolderPath = sComponentPath + "/test/qunit";
				sProposedFileName = sSelectedFileName + ".testsuite.qunit";
				return oQunitUtil.getFileName(sFolderPath, sProposedFileName, ".html", oDocProvider).then(function(newFileName) {
					that.getModel().setProperty("/testSuiteHtmlFileName", "test/qunit/" + newFileName + ".html");
					// check for test.suite.js file existence
					return oQunitUtil.getFileName(sFolderPath, sProposedFileName, ".js", oDocProvider).then(function(newFileName) {
						that.getModel().setProperty("/testSuiteJSFileName", "test/qunit/" + newFileName + ".js");
						var aArtifacts = that._getArtifacts();
						return that.getModel().setProperty("/aArtifcats", aArtifacts);

					});
				});
			});
		});
	},

	_getArtifacts : function() {
		var sComponentPath = this.getModel().getProperty("/componentPath");
		var aArtifacts = [];
		var testJSFileName = this.getModel().getProperty("/testJSFileName");
		aArtifacts.push({
			name : sComponentPath + "/" + testJSFileName
		});
		var testSuiteHtmlFileName = this.getModel().getProperty("/testSuiteHtmlFileName");
		aArtifacts.push({
			name : sComponentPath + "/" + testSuiteHtmlFileName
		});
		var testSuiteJSFileName = this.getModel().getProperty("/testSuiteJSFileName");
		aArtifacts.push({
			name : sComponentPath + "/" + testSuiteJSFileName
		});
		return aArtifacts;
	}


	});