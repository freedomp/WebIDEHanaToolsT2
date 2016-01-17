jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.qunit.control.SelectViewsStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.project.plugin.qunit.control.SelectViewsStepContent", {
		_oGrid: null,
		_oViewsTableGrid: null,
		_oViewsTable: null,
		_onBeforeRenderingFlag: true,
		_sComponentPath: null,
		_oViewsTableLabel: null,
		_oSelelctAllCheckBox: null,

		init: function() {
			if (!this._oGrid) {
				this._createGrid();
			}
			this.addContent(this._oGrid);
		},

		_createGrid: function() {
			var that = this;
			
			this.configureI18nResources();
			
			this._oGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			});
		},

		setFocusOnFirstItem: function() {
			// Call the focus() method for your first UI element.                               
		},

		validateStepContent: function() {
			// Return a Q-promise which is resolved if the step content
			// is currently in valid state, and is rejected if not.
		},
		
		onAfterRendering: function() {
			// Overwrite this SAPUI5 control method if you have some logic
			// to implement here
		},

		cleanStep: function() {
			this._onBeforeRenderingFlag = true;
			this._sComponentPath = "";
			if (this.getModel()) {
				if (this.getModel().getData().oQunitData) {
					this.getModel().getData().oQunitData = undefined;
				}
			}
		},
		renderer: {},

		_throwErrorHandler: function(sError) {
			this.fireValidation({
				isValid: false,
				message: sError
			});
		},

		//Handle the select/de-select all
		_registerChildren: function(oParent) {

			var that = this;
			var aItems = this._oViewsTable.getModel().getProperty("/aViews");

			var nSelectedChildren = 0;
			//get the selected children
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].selected) {
					nSelectedChildren++;
				}
			}
			//set the state according to the selected children
			if (nSelectedChildren === 0) {
				oParent.toggle("Unchecked");
			} else if (nSelectedChildren === aItems.length) {
				oParent.toggle("Checked");
			} else {
				oParent.toggle("Mixed");
			}
		},
		
		_onTristateClick: function() {
			var aItems = this._oViewsTable.getModel().getProperty("/aViews");
			var nSelectedChildren = 0;
			    //handle the the select/deselect all checkbox selection
				if (this._oSelelctAllCheckBox.getSelectionState() === "Checked") {
					for (var i = 0; i < aItems.length; i++) {
						if (aItems[i].testNotExist){
							aItems[i].selected = true;		
						}
					}
					nSelectedChildren = aItems.length;
				} else {
					for (i = 0; i < aItems.length; i++) {
						aItems[i].selected = false;
					}
					nSelectedChildren = 0;
				}
				this._oViewsTable.getModel().setProperty("/aViews", aItems);
				this._updateWizardModel();
		},

		// create the views table
		_createViewsTableContent: function() {

			//create the table
			this._oViewsTable = new sap.ui.table.Table({
				allowColumnReordering: false,
				width: "100%",
				selectionMode: sap.ui.table.SelectionMode.None
			});
			this._oViewsTable.setLayoutData(new sap.ui.layout.GridData({
				span: "L6 M6 S6",
				linebreak: true
			}));

			//create the TriStateCheckBox
			this._oSelelctAllCheckBox = new sap.ui.commons.TriStateCheckBox();
			//register to change event
			this._oSelelctAllCheckBox.attachChange(this._onTristateClick, this);
			
			// selection column
			this._oViewsTable.addColumn(new sap.ui.table.Column({
				label: this._oSelelctAllCheckBox,
				template: new sap.ui.commons.CheckBox({
					change: [this._onCheckBoxClick, this],
					enabled: "{testNotExist}"
				}).bindProperty("checked", "selected"),
				width: "50px",
				tooltip: "{i18n>tlt_SelectDeselectAll}",
				hAlign: "Center"
			}));

			// view name column
			this._oViewsTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>View_Name}"
				}),
				template: new sap.ui.commons.TextView({
					enabled: "{testNotExist}"
				}).bindProperty("text", "name"),
				width: "200px"
			}));

			// folder path column
			this._oViewsTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>Folder_Path}"
				}),
				template: new sap.ui.commons.TextView({
					text : "{fullPath}",
					tooltip: "{fullPath}",
					enabled: "{testNotExist}"
				})
			}));

			//bind the ui model to the table
			this._oViewsTable.setModel(new sap.ui.model.json.JSONModel());
			this._oViewsTable.bindRows("/aViews");

			//add the table to the grid
			this._oGrid.addContent(this._oViewsTable);
			
			var oDisabledLabel = new sap.ui.commons.Label({
				text: "{i18n>Disabled_Views_Label}",
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6",
					linebreak: true
				})
			});
			
			//add the table to the grid
			this._oGrid.addContent(oDisabledLabel);

		},

		//triggers when checkbox is selected/deselected and prepare the generation model
		_onCheckBoxClick: function() {
			this._registerChildren(this._oSelelctAllCheckBox);
			//prepare the wizard model from the ui model
			this._updateWizardModel();
		},

		//convert the ui model into the wizard model
		_updateWizardModel: function() {
		 	var that = this;
		 	var aViewList = this._oViewsTable.getModel().getProperty("/aViews");
		 	// next is not enabled until at least one selection
		 	that.fireValidation({
				isValid: false
			});
		 	for (var i = 0; i < aViewList.length; i++) {
				if (aViewList[i].selected) {
					that.fireValidation({
						isValid: true
					});
					break;
				}
			}
		 	//create the model for the generation process
			var oQunitData = {
				aViewList: aViewList
				};
			
			that.getModel().setProperty("/oQunitData", oQunitData);
			
			var aArtifcats = [];
			var sComponentPath = this.getModel().getProperty("/componentPath");
			var sTestPath = "/" + sComponentPath.split("/")[1] + "/src/test/qunit/test-files/opa/pageObjects/";
			for (var i = 0; i < aViewList.length; i++) {
				if (aViewList[i].selected){
					aArtifcats.push({
						name: sTestPath + aViewList[i].name.substring(0, aViewList[i].name.indexOf(".")) + ".js"
					});
				}
			}
			that.getModel().setProperty("/aArtifcats", aArtifcats);
		},
		
		_getViews: function() {
			var that = this;
			var selectedDocName = that.getModel().oData.selectedDocument.getEntity().getName();
			var sComponentPath = this.getModel().getProperty("/componentPath");
			var sAppPath = "/" + sComponentPath.split("/")[1]; // + "/src/main/webapp";
			var sTestPath = "/" + sAppPath.split("/")[1] + "/src/test/qunit/test-files/opa/pageObjects";
			var oDocProvider = this.getContext().service.filesystem.documentProvider;
			return Q.sap.require("sap/watt/lib/lodash/lodash").then(function(_) {
				return oDocProvider.getDocument(sAppPath).then(function(oDoc) {
					return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/SelectViewsUtil").then(function(oSelectViewsUtil) {
						return oSelectViewsUtil.getViewFiles(oDoc).then(function(aViews){
							return oDocProvider.getDocument(sTestPath).then(function(oTestDoc) {
								if (oTestDoc) {
									return oTestDoc.getCurrentMetadata(true).then(function(aTestMetadataContent) {
										// check if view has already implemented test
										for (var i = 0; i < aTestMetadataContent.length; i++) {
											var oTestMetadataView = aTestMetadataContent[i];
											for (var v = 0; v < aViews.length; v++) {
												var oView = aViews[v];
												if (oView.name.split(".")[0] === oTestMetadataView.name.split(".")[0]) {
													oView.testNotExist = false;
												}
											}
										}
										// mark as selected the selected document view 
										for (var j = 0; j < aViews.length; j++) {
											var oViewObject = aViews[j];
										    if (oViewObject.testNotExist && selectedDocName === oViewObject.name) {
										        // Select the selected view 
											    oView.selected = true;	
												// enable Next button
												that.fireValidation({
												    isValid: true
			                                    });
										    }
										}
										return aViews;
									});
								} else{
									// mark as selected the selected document view 
									_.forEach(aViews, function(oView) {
									    if (oView.testNotExist && selectedDocName === oView.name) {
									        // Select the selected view 
										    oView.selected = true;	
											// enable Next button
											that.fireValidation({
											    isValid: true
		                                    });
									    }
									});
								}
								return aViews;
							});
						});
					});
				});
			});
		},

		onBeforeRendering: function() {
			var that = this;
			//make sure that this code only execute once
			if (this._onBeforeRenderingFlag) {
				this._onBeforeRenderingFlag = false;
				this.configureI18nResources();
				return this._setQunitTargetFolderPath().then(function() {
					return that._getViews().then(function(aView){
						if (!that._oViewsTable) {
							//create the views table
							that._createViewsTableContent();
						}
					    that._oViewsTable.getModel().setProperty("/aViews", aView);
					  //set the table # of rows
						var iNumOfViews = aView.length === 0 ? 1 : aView.length;
						that._oViewsTable.setVisibleRowCount(iNumOfViews);
						that._updateWizardModel();
					});
				});
			}
		},

		_setQunitTargetFolderPath: function() {
			var that = this;
			var oContext = this.getContext();
			var oDocProvider = oContext.service.filesystem.documentProvider;
			this._sComponentPath = this.getModel().getProperty("/componentPath");
			return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
				return oQunitUtil.figureOutQunitTargetFolderPath(that._sComponentPath, oDocProvider).then(function(sQunitTargetFolderPath) {
					that.getModel().setProperty("/componentPath", sQunitTargetFolderPath);
				});
			});
		}

	});