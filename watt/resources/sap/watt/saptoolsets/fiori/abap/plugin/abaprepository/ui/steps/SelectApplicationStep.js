jQuery.sap.declare("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectApplicationStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var selectApplicationStep = function() {

	var appNamePlaceholder = "{i18n>SelectApplicationStep_AppNamePlaceholder}";
	var that = null;
	var selectedApplication = null;
	var selectedApplicationDescription = null;
	var lastStepRemoved = false;
	var stepIndex = null;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard opens.
	 */
	var _init = function() {

		that = this;

		// Application Name label
		var applicationLabel = new sap.ui.commons.Label({
			required : true,
			text : "{i18n>SelectApplicationStep_ApplicationName}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M5 S12"
			})
		});

		// Application Name text field
		this.applicationNameTextField = new sap.ui.commons.TextField({
			value : "{/name}", // bind this property to "name" in the model
			width : "100%",
			placeholder : appNamePlaceholder,
			editable : false,
			layoutData : new sap.ui.layout.GridData({
				span : "L7 M8 S12"
			})
		});

		// application name Grid
		var appNameContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ applicationLabel, this.applicationNameTextField ]
		});

		this.addContent(appNameContent);


		this.oSearch = sap.ui.getCore().byId("SelectApplocationStep_SearchField");
		if (this.oSearch) {
			this.oSearch.destroy();
		}

		// Create the SearchField
		this.oSearch = new sap.ui.commons.SearchField("SelectApplocationStep_SearchField", {
			enableListSuggest : false,
			enableFilterMode : true,
			enableClear : true,
			enabled : true,
			tooltip : "{i18n>SelectApplicationStep_Search}",
			width : "100%",
			startSuggestion : 0,
			suggest : function(oEvent) {
				updateTable(that.oTable, oEvent.getParameter("value"));
			},
			layoutData : new sap.ui.layout.GridData({
				indent : "L3 M3 S3",
				span : "L7 M8 S12"
			})
		}).addStyleClass("buttons SearchField");


		this.oTable = sap.ui.getCore().byId("SelectApplocationStep_Table");
		if (this.oTable) {
			this.oTable.destroy();
		}

		// Create the Table of applications
		this.oTable = new sap.ui.table.Table("SelectApplocationStep_Table", {
			visibleRowCount : 10,
			firstVisibleRow : 1,
			selectionMode : sap.ui.table.SelectionMode.Single,
			navigationMode : sap.ui.table.NavigationMode.Scrollbar,
			extension : [ this.oSearch ],
			layoutData : new sap.ui.layout.GridData({
				indent : "L3 M3 S3",
				span : "L7 M8 S12"
			}),
			noData : "{i18n>SelectApplicationStep_NoData}"
		});

		// Define the columns and the control templates to be used
		this.oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Name",
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "title"),
			sortProperty : "title"
		}));

		this.oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Description",
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "summary"),
			sortProperty : "summary"
		}));

		var searchTableContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ this.oSearch ]
		});

		var applicationsTableContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ this.oTable ]
		});

		this.addContent(searchTableContent);
		this.addContent(applicationsTableContent);
	};

	// update the table while search
	var updateTable = function(oTable, sPrefix) {
		var filteredApplications = filterApplications(sPrefix); //Find the filtered applications according to the sPrefix
		var filteredTableModel = new sap.ui.model.json.JSONModel();
		filteredTableModel.setData({
			modelData : filteredApplications
		});
		oTable.setModel(filteredTableModel);
		oTable.bindRows("/modelData");
		var selectedRowIndex = oTable.getSelectedIndex();
		if (selectedRowIndex !== -1) {
			oTable.removeSelectionInterval(0, selectedRowIndex); // remove last selected row
		}
		if (sPrefix === "") { //SearchField was cleared -> remove the finish step.
			that.oWizard.removeFinishStep();
		}
	};

	// filter applications according to the sPrefix
	var filterApplications = function(sPrefix) {
		var aResult = [];
		for ( var i = 0; i < that.applications.length; i++) {
			var applicationTitle = that.applications[i].title.toLowerCase();
			if (that.applications[i].summary === "") {
				if (!sPrefix || sPrefix.length === 0 || applicationTitle.indexOf(sPrefix.toLowerCase()) !== -1) {
					aResult.push(that.applications[i]);
				}
			} else {
				var applicationDescription = that.applications[i].summary.toLowerCase();
				if (!sPrefix || (sPrefix.length === 0) || (applicationTitle.indexOf(sPrefix.toLowerCase()) !== -1)
						|| (applicationDescription.indexOf(sPrefix.toLowerCase()) !== -1)) {
					aResult.push(that.applications[i]);
				}
			}
		}

		return aResult;
	};

	var removeNextStep = function() {
		lastStepRemoved = true;

		that.oWizard.removeSteps(stepIndex + 1);
		that.oWizard._steps[stepIndex].setNextStepIndex(undefined);
	};

	var handleTransportsResponse = function(transportsResponse) {
        return that.oContext.service.transport.analyseTransportsResponse(transportsResponse).then(function(res){
                // if status is "S" then data will hold the transports arrays.
                // if status is "E" then data will hold the error message .
                // if status is "LOCKED" then data will hold the locking transport.
                // if status is "NOT_ASSAIGNED" then data will be empty.
                // if status is "LOCAL_PACKAGE" then data will hold the package.

                if(res.status === that.getConst().TRANSPORT_STATUS_E){ //Error
                    removeNextStep();
                    if(res.data.message === ""){
                        return undefined;
                    }
        			return Q.reject(res.data.message);
                }

                if (res.status === that.getConst().TRANSPORT_STATUS_LOCKED) { // LOCKED
                    that.oWizard.getModel().setProperty("/selectedPackage",res.data.package);
        			that.oWizard.getModel().transport = res.data.transport;
        			removeNextStep();
        			return that.oContext.i18n.getText("i18n", "DeployWizard_locked", [res.data.transport]);
                }

                //LOCAL_PACKAGE
                 if (res.status === that.getConst().TRANSPORT_STATUS_LOCAL_PACKAGE) {  //LOCAL_PACKAGE
                    removeNextStep();
        			var msg = that.getContext().i18n.getText("i18n", "CreateApplicationStep_notTrasportable",[res.data.package]);
        			return msg;
                 }

                if (res.status === that.getConst().TRANSPORT_STATUS_NOT_ASSAIGNED) { // NOT_ASSAIGNED
                    //this app has no transport assigned and the package is not local (i.e. not $TMP) -> alow transport selection
                    if (lastStepRemoved === true) {
        				that.oWizard.removeFinishStep();
        				that.oWizard.addTransportStep();
        				lastStepRemoved = false;
        			}
                    return undefined;
                }

        		if (res.status === that.getConst().TRANSPORT_STATUS_S) { // Success
        		    if (lastStepRemoved === true) {
        				that.oWizard.removeFinishStep();
        				that.oWizard.addTransportStep();
        				lastStepRemoved = false;
        			}

        			that.oWizard.getModel().userTransports = res.data.transports; // save the transports in the model
        			return undefined;
        		}
        });
	};

	var getErrorMessage = function(response) {
	    //response.responseText
	    var responseText = response.responseText;
	    if(responseText === undefined){
	         return response;
	    }
	    var xmlUtil = that.getXmlUtil();
	    var responseXml = xmlUtil.stringToXml(responseText);
	    var messageTag = xmlUtil.getChildByTagName(responseXml.childNodes[0], "message");
		return messageTag.textContent;
    };


	var getApplicationInfo = function(oSelectedApplication, oDestination) {
	    //fetch transport and package for application
		return that.oContext.service.transport.getApplicationInfo(oSelectedApplication, oDestination).then(function(AppInfo) {
		    that.oWizard.getModel().transport = AppInfo.transportValue;
		   	that.oWizard.getModel().setProperty("/selectedPackage",AppInfo.packageValue);
		   	// send the transportchecks request, in order to find out if the selected package is local or not
    		// in order to know if to show the transports step or not
    		// get the existing transports objects of the user
			return that.oContext.service.transport.getTransports(AppInfo.packageValue, oSelectedApplication, oDestination).then(
    				function(transportsResponse) {
    					return handleTransportsResponse(transportsResponse);
    				}).catch(function(response) {
    				    // extract the error from the backend
    				    var error = getErrorMessage(response);
    				    // add the error from the backend to the user-friendly error
    				    return Q.reject(error);
    	        	});
    	    });
	};


	// populate the applications in the table
	var populateApplications = function(applications) {

		var tableModel = new sap.ui.model.json.JSONModel();
		tableModel.setData({
			modelData : applications
		});
		that.oTable.setModel(tableModel);
		that.oTable.bindRows("/modelData");

		// Initially sort the table
		that.oTable.sort(that.oTable.getColumns()[0]);
		that.oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

		that.oTable.attachRowSelectionChange(function(oEvent) {

			if (oEvent.getParameter("rowContext") !== null) { // check if a row was selected,
				var currentRowContext = oEvent.getParameter("rowContext");
				var selectedRowIndex = oEvent.getParameter("rowIndex");

                //the listener is trigered 2 times [ on deselection and on selection ] hence need to ceck the getSelectedIndex() that returns -1 on deselection.
                if (that.oTable.getSelectedIndex() === -1 ){
                    that.oTable.setSelectedIndex(selectedRowIndex);
                    return; //on deselection do nothing
                }
				selectedApplication = currentRowContext.getProperty("title");
				selectedApplicationDescription = currentRowContext.getProperty("summary");

				// update the selected application in the text field
				that.applicationNameTextField.setValue(selectedApplication);
				// update the selected application name in the model
				that.oWizard.getModel().getData().name = selectedApplication;
				that.oWizard.getModel().getData().appDescription = selectedApplicationDescription;

				if (that.oWizard.getModel().discoveryStatus.transportchecks) {
					getApplicationInfo(selectedApplication, that.oWizard.getModel().destination).then(function(res) {
    					    if (res) {
    					        // enable the Next button with info
    					        that.fireValidation({
                					isValid : true,
                					message : res,
                					severity : "info"
                				});
    					    } else {
    					       // enable the Next button
    					        that.fireValidation({
    					        message : that.getContext().i18n.getText("i18n", "SelectApplicationStep_Click_Next"),
            					isValid : true,
            					severity : "info"
            				});
					    }
				    }).catch(function(error){
				        //disable the next button
				        that.fireValidation({
    						isValid : false,
    						message : error,
    						severity : "error"
    					});
				    });
				} else {
				    removeNextStep();
					that.fireValidation({
						isValid : true,
						message : that.getContext().i18n.getText("i18n", "SelectApplicationStep_NoteSummaryMsg"),
						severity : "info"
					});
				}
			}
		});
	};

	var _checkIfAppExist = function(){
		var exist = false;
		var model = that.getWizardControl().getModel();
		var i = 0;
		while(that.oTable.getContextByIndex(i) !== undefined){
			var context = that.oTable.getContextByIndex(i);
			var appName = context.getProperty("title");
			if (appName.toLowerCase() === model.name.toLowerCase()) {
				exist = true;
			}
			i = i + 1;
		}
		return exist;
	
	};
	
	var _onAfterRendering = function() {
		if (!that.oContext) {
			//save context
			that.oContext = this.getContext();
			//save wizard
			that.oWizard = that.getWizardControl();

			// get the wizard model and run the applications promise
			var model = that.oWizard.getModel();
			// save the applications
			that.applications = model.applications;

			// populate the applications in the table
			populateApplications(model.applications);
			
			stepIndex = that.oWizard.currentVisibleStep;

			if(model.jsonDestination){ // need persistence. use didn't change the system
				var exist = _checkIfAppExist();
				if(exist){ // app exist
					that.oSearch.setValue(model.name); //TODO check if need to display at search file also
					that.oSearch.fireSuggest({
						"value" : model.name
					});
					that.oTable.setSelectedIndex(0);
				}
			}
			
			
		}
		else {
			stepIndex = that.oWizard.currentVisibleStep;
		}
	};

	var _cleanStep = function() {
		if (that.oWizard) {
			var oDataModel = that.oWizard.getModel().getData();
			oDataModel.name = "";
		}

		lastStepRemoved = false;
	};

	return {
		metadata : {
			properties : {
				"wizardControl" : "object",
				"xmlUtil" : "object",
				"const" : "object"
			}
		},
		init : _init,
		cleanStep : _cleanStep,
		onAfterRendering : _onAfterRendering,
		renderer : {}
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectApplicationStep",
		selectApplicationStep);