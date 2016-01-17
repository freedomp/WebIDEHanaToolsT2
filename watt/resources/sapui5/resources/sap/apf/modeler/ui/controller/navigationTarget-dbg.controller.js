/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");
/**
* @class category
* @memberOf sap.apf.modeler.ui.controller
* @name category
* @description controller for view.category
*/
sap.ui.controller("sap.apf.modeler.ui.controller.navigationTarget", {
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#onInit
	* @description Called on initialization of the view.
	* 			Sets the static texts for all controls in UI.
	* 			Adds style classes to all UI controls.
	* 			Prepares dependencies.
	*  			Sets dynamic text for input controls
	* */
	onInit : function() {
		this.getView().addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this.oViewData = this.getView().getViewData();
		this.oConfigurationHandler = this.oViewData.oConfigurationHandler;
		this.oConfigurationEditor = this.oViewData.oConfigurationEditor;
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		this.getText = this.oViewData.getText;
		this.params = this.oViewData.oParams;
		this.createMessageObject = this.oViewData.createMessageObject;
		this.putMessage = this.oViewData.putMessage;
		this.updateTitleAndBreadCrumb = this.oViewData.updateTitleAndBreadCrumb;
		this.getAllAvailableSemanticObjects = this.oViewData.getAllAvailableSemanticObjects;
		this.getSemanticActions = this.oViewData.getSemanticActions;
		this.setNavigationTargetName = this.oViewData.setNavigationTargetName;
		var self = this;
		if (!this.oConfigurationEditor) {
			this.oConfigurationHandler.loadConfiguration(this.params.arguments.configId, function(configurationEditor) {
				self.oConfigurationEditor = configurationEditor;
			});
		}
		this._setDisplayText();
		this._prepareNavTargetTypeModel();
		//Set Mandatory Fields
		var mandatoryFields = [];
		mandatoryFields.push(this.byId("idSemanticObjectField"));
		mandatoryFields.push(this.byId("idActionField"));
		mandatoryFields.push(this.byId("idContextMapEntitySelect"));
		mandatoryFields.push(this.byId("idMappedPropertiesCombo"));
		this._setMandatoryFields(mandatoryFields);
		//API Callback return an array of semantic objects of with each object having an id and text
		this.getAllAvailableSemanticObjects(function(semanticObjects, messageObject) {
			if (messageObject === undefined) {
				self._populateSemanticObjectModel(semanticObjects);
				self.setDetailData();
				if (self.oNavTarget && (self.oNavTarget.getFilterMappingService() === undefined || self.oNavTarget.getFilterMappingService() === "")) { // if the filter mapping field is not available
					self._removeMandatoryFromContextMap(); //initially context mapping fields should not be mandatory 
				}
			} else {
				var oMessageObject = self.createMessageObject({
					code : "11504"
				});
				oMessageObject.setPrevious(messageObject);
				self.putMessage(oMessageObject);
			}
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_populateSemanticObjectModel
	* @description Prepares the model for semantic object field and sets it
	* @param {Array} Array of semantic objects from getAllAvailableSemanticObjects API
	* */
	_populateSemanticObjectModel : function(aAllSemObj) {
		var aAllSemanticObjectsModel;
		var aAllSemanticObjects = [];
		aAllSemObj.forEach(function(oSemanticObject) {
			var oSemOb = {};
			oSemOb.semanticObjectKey = oSemanticObject.id;
			oSemOb.semanticObjectName = oSemanticObject.id;
			aAllSemanticObjects.push(oSemOb);
		});
		var oSemObjData = {
			aAllSemanticObjects : aAllSemanticObjects
		};
		aAllSemanticObjectsModel = new sap.ui.model.json.JSONModel();
		aAllSemanticObjectsModel.setSizeLimit(500);
		aAllSemanticObjectsModel.setData(oSemObjData);
		this.byId("idSemanticObjectField").setModel(aAllSemanticObjectsModel);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_setDisplayText
	* @description Sets static texts in UI
	* */
	_setDisplayText : function() {
		this.byId("idNavigationTargetHeaderLabel").setTitle(this.getText("basicData"));
		this.byId("idSemanticObjectLabel").setText(this.getText("semanticObject"));
		this.byId("idSemanticObjectLabel").setRequired(true);
		this.byId("idActionLabel").setText(this.getText("action"));
		this.byId("idActionLabel").setRequired(true);
		this.byId("idDescriptionLabel").setText(this.getText("navigationTargetTitle"));
		this.byId("idNavigationTargetTypeHeaderLabel").setTitle(this.getText("navigationTargetType"));
		this.byId("idNavigationTargetTypeLabel").setText(this.getText("assignmentType"));
		this.byId("idAssignedStepsLabel").setText(this.getText("assignedSteps"));
		this.byId("idContextMapping").setTitle(this.getText("contextMapping"));
		this.byId("idContextMapSourceLabel").setText(this.getText("source"));
		this.byId("idContextMapEntityLabel").setText(this.getText("entity"));
		this.byId("idMappedPropertiesLabel").setText(this.getText("mappedProperties"));
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_prepareNavTargetTypeModel
	* @description Prepares and sets the model for navigation target types
	* */
	_prepareNavTargetTypeModel : function() {
		var aNavTargetTypeData = [ {
			typeKey : this.getText("globalNavTargets"),
			typeName : this.getText("globalNavTargets")
		}, {
			typeKey : this.getText("stepSpecific"),
			typeName : this.getText("stepSpecific")
		} ];
		var oNavTargetTypeModel = new sap.ui.model.json.JSONModel();
		var oNavTargetTypeData = {
			navTargetType : aNavTargetTypeData
		};
		oNavTargetTypeModel.setData(oNavTargetTypeData);
		this.byId("idNavigationTargetTypeField").setModel(oNavTargetTypeModel);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_prepareAssignStepModel
	* @description Prepares and sets the model for assign steps
	* */
	_prepareAssignStepModel : function() {
		var aAssignedStepData = [];
		var oAssignStepModel = new sap.ui.model.json.JSONModel();
		var aSteps = this.oConfigurationEditor.getSteps();//Get all steps in the configuration
		for( var i = 0; i < aSteps.length; i++) {
			var oStepDetails = {};
			oStepDetails.stepKey = aSteps[i].getId();
			oStepDetails.stepName = this.oTextPool.get(aSteps[i].getTitleId()).TextElementDescription;
			aAssignedStepData.push(oStepDetails);
		}
		var oAssignedStepData = {
			allSteps : aAssignedStepData
		};
		oAssignStepModel.setData(oAssignedStepData);
		this.byId("idAssignedStepsCombo").setModel(oAssignStepModel);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#setDetailData
	* @description Sets dynamic texts for controls
	* */
	setDetailData : function() {
		var aSemanticObjects = this.byId("idSemanticObjectField").getModel().getData().aAllSemanticObjects;
		if (this.params && this.params.arguments && this.params.arguments.navTargetId) {
			this.oNavTarget = this.oConfigurationEditor.getNavigationTarget(this.params.arguments.navTargetId);
		}
		if (this.oNavTarget) {
			var sSemanticObjectKey;
			var sSemanticObject = this.oNavTarget.getSemanticObject();
			//Loop through semantic objects model to find if the existing navigation target's semantic object is present in the model
			for( var index = 0; index < aSemanticObjects.length; index++) {
				if (sSemanticObject === aSemanticObjects[index].semanticObjectKey) {
					sSemanticObjectKey = true;//If semantic object present in list, set as true
					break;
				}
			}
			this.byId("idSemanticObjectField").setValue(sSemanticObject);
			var semanticObjectInfo = {
				changeSemanticObject : false,
				semanticObjectInList : sSemanticObjectKey ? true : false
			//If semantic object part of the list then set true; else if semantic object is through user input set false
			};
			this._populateActions(sSemanticObject, semanticObjectInfo);
			var navTargetType = this.oNavTarget.isStepSpecific() ? this.getText("stepSpecific") : this.getText("globalNavTargets");
			if (navTargetType === this.getText("stepSpecific")) {
				this.byId("idAssignedStepsLabel").setVisible(true);
				this.byId("idAssignedStepsCombo").setVisible(true);
				this._prepareAssignStepModel();
				var aAssignedStepIds = this.oConfigurationEditor.getStepsAssignedToNavigationTarget(this.oNavTarget.getId());//Get all assigned steps to the navigation target and set them as selected
				this.byId("idAssignedStepsCombo").setSelectedKeys(aAssignedStepIds);
			}
			this.byId("idNavigationTargetTypeField").setSelectedKey(navTargetType);
			//Setting the value for data source for context mapping of a navigation target
			if (this.oNavTarget.getFilterMappingService && this.oNavTarget.getFilterMappingService() !== undefined && this.oNavTarget.getFilterMappingService().length !== 0) {
				this.byId("idContextMapSourceSelect").setValue(this.oNavTarget.getFilterMappingService());
				var sSource = this.oNavTarget.getFilterMappingService();
				var aAllEntitySets = [];
				var aAllEntitySetsForControll = [];
				aAllEntitySets = this.oConfigurationEditor.getAllEntitySetsOfService(sSource); // list of all the entities in the selected service root
				aAllEntitySets.forEach(function(entiset) {
					var oEntitySet = {};
					oEntitySet.entityKey = entiset;
					oEntitySet.entityName = entiset;
					aAllEntitySetsForControll.push(oEntitySet); // form the entity set for the control in set of name, key pair
				});
				var oDataForEntitySets = {
					Entity : aAllEntitySetsForControll
				};
				var oModelForEntitySet = new sap.ui.model.json.JSONModel();
				oModelForEntitySet.setSizeLimit(500);
				oModelForEntitySet.setData(oDataForEntitySets);
				this.byId("idContextMapEntitySelect").setModel(oModelForEntitySet);
				this._addMandatoryToContextMap(); // if the service is available , context mapping fields are mandatory
			} else {// if the service was not saved then reset the context mapping fields
				this._removeMandatoryFromContextMap(); // removes the mandatory tag 
				this._resetContextMappingFields();//resets the values from the context mapping properties and clears the selected keys in control
			}
			//Setting the value for entity sets for context mapping of a navigation target
			if (this.oNavTarget.getFilterMappingEntitySet && this.oNavTarget.getFilterMappingEntitySet() !== undefined && this.oNavTarget.getFilterMappingEntitySet().length !== 0) {
				this.byId("idContextMapEntitySelect").setSelectedKey(this.oNavTarget.getFilterMappingEntitySet());
				var sFilterMapServiceRoot = this.oNavTarget.getFilterMappingService(); // context mapping service
				var sFilterMapEntity = this.oNavTarget.getFilterMappingEntitySet(); // context mapping entity set
				var aFilterMapProperties = [], aPropertiesForFilterMapControl = [];
				if (sFilterMapServiceRoot && sFilterMapServiceRoot !== null && sFilterMapServiceRoot !== "") {
					aFilterMapProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sFilterMapServiceRoot, sFilterMapEntity); //list of all the properties for a given source and enity set
					aFilterMapProperties.forEach(function(property) {
						var oProp = {};
						oProp.propertyKey = property;
						oProp.propertyName = property;
						aPropertiesForFilterMapControl.push(oProp); // form the entity set for the control in set of name, key pair
					});
					var oDataForFilterMapProperties = {
						Properties : aPropertiesForFilterMapControl
					};
					var oModelForFilterMapSelProp = new sap.ui.model.json.JSONModel();
					oModelForFilterMapSelProp.setSizeLimit(500);
					oModelForFilterMapSelProp.setData(oDataForFilterMapProperties);
					this.byId("idMappedPropertiesCombo").setModel(oModelForFilterMapSelProp);
				}
			}
			//Setting the value for mapped property for context mapping of a navigation target
			if (this.oNavTarget.getFilterMappingTargetProperties && this.oNavTarget.getFilterMappingTargetProperties() !== undefined && this.oNavTarget.getFilterMappingTargetProperties().length !== 0) {
				this.byId("idMappedPropertiesCombo").setSelectedKeys(this.oNavTarget.getFilterMappingTargetProperties());
			}
		} else {
			var navigationTargetId = this.oConfigurationEditor.createNavigationTarget();
			this.oNavTarget = this.oConfigurationEditor.getNavigationTarget(navigationTargetId);
			//Adds the empty string key to the semantic object model in case of a new navigation target
			aSemanticObjects.splice(0, 0, {
				semanticObjectKey : "",
				semanticObjectName : ""
			});
			var oSemObjData = {
				aAllSemanticObjects : aSemanticObjects
			};
			this.byId("idSemanticObjectField").getModel().setData(oSemObjData);
			this.byId("idSemanticObjectField").setSelectedKey("");
			var oModelAction = new sap.ui.model.json.JSONModel();
			var oData = {
				aActions : [ {
					id : "",
					text : ""
				} ]
			};
			oModelAction.setData(oData);
			this.byId("idActionField").setModel(oModelAction);
			this.byId("idActionField").setSelectedKey("");
			var oActionInfo = {
				id : navigationTargetId,
				icon : "sap-icon://BusinessSuiteInAppSymbols/icon-where-used"
			};
			this.oViewData.updateSelectedNode(oActionInfo);
			this.oNavTarget.setGlobal();//Set the navigation target to global by default
			this.byId("idNavigationTargetTypeField").setSelectedKey(this.getText("globalNavTargets"));
		}
		this._addAutoCompleteFeatureOnInputs();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#handleChangeSemanticObjectValue
	* @description Handler for change event on Semantic Object drop down
	* */
	handleChangeSemanticObjectValue : function(oEvent) {
		var aSemanticObjects = this.byId("idSemanticObjectField").getModel().getData().aAllSemanticObjects;
		if (aSemanticObjects[0].semanticObjectKey === "") {
			aSemanticObjects.splice(0, 1);//Removes the empty string key from the semantic object model after a semantic object is set
			var oSemObjData = {
				aAllSemanticObjects : aSemanticObjects
			};
			this.byId("idSemanticObjectField").getModel().setData(oSemObjData);
		}
		var sSemanticObject = oEvent.getParameter("value");
		var sSemanticObjectKey = this.byId("idSemanticObjectField").getSelectedKey();
		var semanticObjectInfo = {
			changeSemanticObject : true,
			semanticObjectInList : sSemanticObject === sSemanticObjectKey ? true : false
		};
		if (sSemanticObject !== "" && sSemanticObject !== null) {
			this.oConfigurationEditor.setIsUnsaved();
			this.oNavTarget.setSemanticObject(sSemanticObject);
			this._populateActions(sSemanticObject, semanticObjectInfo);
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_getActionText
	* @description Matches the selected Navigation target action with the model to find the description of the action
	* @returns {String} The description of the selected action is returned 
	* */
	_getActionText : function() {
		var sTitle;
		var aSemanticActions = this.byId("idActionField").getModel().getData().aActions;
		for( var i = 0; i < aSemanticActions.length; i++) {
			if (aSemanticActions[i].id === this.oNavTarget.getAction()) {
				sTitle = aSemanticActions[i].text;
				break;
			}
		}
		return sTitle;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#handleChangeofAction
	* @description Handler for change event on Actions drop down
	* */
	handleChangeofAction : function(oEvent) {
		var sTitle;
		var sAction = oEvent.getParameter("value");
		if (sAction !== "" && sAction !== null) {
			this.oNavTarget.setAction(sAction);
			sTitle = this._getActionText();
		}
		this.oConfigurationEditor.setIsUnsaved();
		if (sTitle === undefined) {//Handle user input of action
			sTitle = this.oNavTarget.getSemanticObject();//If action does not have description(user input case) use the semantic object for title and description
		}
		var oActionInfo = {
			name : sTitle,
			icon : this.oNavTarget.isGlobal() ? "sap-icon://BusinessSuiteInAppSymbols/icon-where-used" : "sap-icon://pushpin-off"
		};
		this.byId("idDescription").setValue(sTitle);
		var navTargetData = {
                key : this.oNavTarget.getId(),
                value : sTitle
            };
		this.setNavigationTargetName(navTargetData);//Set the updated description of the navigation target to the table		
		this.oViewData.updateSelectedNode(oActionInfo);
		sTitle = this.getText("navigationTarget") + ": " + sTitle;
		this.updateTitleAndBreadCrumb(sTitle);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_updateDescriptionAndTitle
	* @param {Object} - {boolean} whether semantic object is part of the list of semantic objects or user input
	* 				  - {boolean} whether change triggered from handleChangeSemanticObjectValue or onInit of navigation target
	* 		 {String} - Title and bread crumb; Also set on description
	* @description Sets the title, bread crumb, description and updates tree node
	* */
	_updateDescriptionAndTitle : function(semanticObjectInfo, sTitle) {
		if (semanticObjectInfo.changeSemanticObject) { //If change is triggered from handleChangeSemanticObjectValue
			if (sTitle === undefined) {//Handle user input of semantic object and action
				sTitle = this.oNavTarget.getSemanticObject();//If action does not have description(user input case) use the semantic object for title and description
			}
			var oActionInfo = {
				name : sTitle,
				icon : this.oNavTarget.isGlobal() ? "sap-icon://BusinessSuiteInAppSymbols/icon-where-used" : "sap-icon://pushpin-off"
			};
			this.byId("idDescription").setValue(sTitle);
			this.oViewData.updateSelectedNode(oActionInfo);
			var navTargetData = {
                    key : this.oNavTarget.getId(),
                    value : sTitle
                };
            this.setNavigationTargetName(navTargetData);//Set the updated description of the navigation target to the table			
            sTitle = this.getText("navigationTarget") + ": " + sTitle;
			this.updateTitleAndBreadCrumb(sTitle);
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#_populateActions
	* @description Accepts a semantic object and populates the action drop down with the list of actions for the semantic object.
	* Also accepts a boolean changeSemanticObject to differentiate between the call from change of semantic object or at initial load for an existing navigation target.
	* If boolean is true, call is from handleChangeSemanticObjectValue
	* If boolean is false, the call is from on initial load so only certain details like description is updated.
	* Accepts boolean semanticObjectInList to check if the semantic object is part of the semantic object list or an user input. If the boolean is true it is part of the semantic object list else it is an user input
	* The title, bread crumb, tree node and description are updated with the description of the action if semantic object is part of the list else updated with the semantic object
	* @param {String} Semantic object; 
	* 		 {Object} - {boolean} whether semantic object is part of the list of semantic objects or user input
	* 				  - {boolean} whether change triggered from handleChangeSemanticObjectValue or onInit of navigation target
	* */
	_populateActions : function(semanticObject, semanticObjectInfo) {
		var self = this;
		var sTitle;
		if (semanticObjectInfo && semanticObjectInfo.semanticObjectInList) {//Semantic object present in the list of semantic objects
			var oPromise = this.getSemanticActions(semanticObject);//Promise based call to get the list of actions for the given semantic object
			oPromise.then(function(aSemanticActions) {//Once promise is done populate action model
				var oActionsData = {
					aActions : aSemanticActions.semanticActions
				};
				var oActionModel = new sap.ui.model.json.JSONModel();
				oActionModel.setData(oActionsData);
				self.byId("idActionField").setModel(oActionModel);
				if (self.oNavTarget.getAction() && semanticObjectInfo && semanticObjectInfo.changeSemanticObject === false) {//If change is triggered from on load of existing navigation target
					self.byId("idActionField").setValue(self.oNavTarget.getAction());
					var sText = self._getActionText() ? self._getActionText() : self.oNavTarget.getSemanticObject(); //If action is from list of actions, get action's description; If action is from user input use semantic object as description
					self.byId("idDescription").setValue(sText);
				} else if (oActionModel.getData().aActions.length > 0) {//If change is triggered from handleChangeSemanticObjectValue
					self.byId("idActionField").setSelectedKey(oActionModel.getData().aActions[0].id);//Set the first action on the list as selected by default
					self.oNavTarget.setAction(oActionModel.getData().aActions[0].id);
					sTitle = oActionModel.getData().aActions[0].text;
				}
				self._updateDescriptionAndTitle(semanticObjectInfo, sTitle);
			}, function(messageObject) {//If promise fails display a message
				var oMessageObject = self.createMessageObject({
					code : "11505"
				});
				oMessageObject.setPrevious(messageObject);
				self.putMessage(oMessageObject);
			});
		} else {//If the semantic object is an user input
			var oModelAction = new sap.ui.model.json.JSONModel();
			var oData = {
				aActions : []
			};
			oModelAction.setData(oData);//Set the action model as empty for user input of semantic object
			this.byId("idActionField").setModel(oModelAction);
			if (this.oNavTarget.getAction() && semanticObjectInfo && semanticObjectInfo.changeSemanticObject === false) { //If change is triggered from on load of existing navigation target and an action is available
				this.byId("idActionField").setValue(this.oNavTarget.getAction());
				var sText = self.oNavTarget.getSemanticObject();
				self.byId("idDescription").setValue(sText);//For user input semantic objects, set description as semantic object
			} else {
				this.byId("idActionField").setValue("");//If change is triggered from handleChangeSemanticObjectValue and action is not available
			}
			this._updateDescriptionAndTitle(semanticObjectInfo, sTitle);//For user input semantic objects, set title, bread crumb and description as semantic object
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#handleChangeOfNavigationTargetType
	* @description Handler for change event on Navigation target type select
	* */
	handleChangeOfNavigationTargetType : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var oNavTargetIconInfo = {};
		var navTargetType = this.byId("idNavigationTargetTypeField").getSelectedKey();
		if (navTargetType === this.getText("stepSpecific")) {
			//Set the step specific label and control to visible
			this.byId("idAssignedStepsLabel").setVisible(true);
			this.byId("idAssignedStepsCombo").setVisible(true);
			this._prepareAssignStepModel();
			this.oNavTarget.setStepSpecific();
			oNavTargetIconInfo.name = this.byId("idDescription").getValue();
			oNavTargetIconInfo.icon = "sap-icon://pushpin-off";
		} else {
			//Hide the step specific label and control
			this.byId("idAssignedStepsLabel").setVisible(false);
			this.byId("idAssignedStepsCombo").setVisible(false);
			this.byId("idAssignedStepsCombo").setSelectedKeys([]);//Clear the selected keys
			this.oNavTarget.setGlobal();
			//Remove the steps assigned to the navigation target
			var assignedSteps = this.oConfigurationEditor.getStepsAssignedToNavigationTarget(this.oNavTarget.getId());
			for( var index = 0; index < assignedSteps.length; index++) {
				var oStep = this.oConfigurationEditor.getStep(assignedSteps[index]);
				oStep.removeNavigationTarget(this.oNavTarget.getId());
			}
			oNavTargetIconInfo.name = this.byId("idDescription").getValue();
			oNavTargetIconInfo.icon = "sap-icon://BusinessSuiteInAppSymbols/icon-where-used";
		}
		this.oViewData.updateSelectedNode(oNavTargetIconInfo);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.navigationTarget#handleChangeForAssignedSteps
	* @description Handler for change event on Assigned Steps
	* */
	handleChangeForAssignedSteps : function() {
		var self = this;
		this.oConfigurationEditor.setIsUnsaved();
		var assignedSteps = this.byId("idAssignedStepsCombo").getSelectedKeys();
		var previousAssignedSteps = this.oConfigurationEditor.getStepsAssignedToNavigationTarget(this.oNavTarget.getId());
		previousAssignedSteps.forEach(function(sStepId) { //Remove the navigation target from all the old steps it was assigned to and are unselected now
			if (assignedSteps.indexOf(sStepId) === -1) {
				var oStep = self.oConfigurationEditor.getStep(sStepId);
				oStep.removeNavigationTarget(self.oNavTarget.getId());
			}
		});
		assignedSteps.forEach(function(sStepId) {
			if (previousAssignedSteps.indexOf(sStepId) === -1) { //Add the navigation target to the steps it was assigned to
				var oStep = self.oConfigurationEditor.getStep(sStepId);
				oStep.addNavigationTarget(self.oNavTarget.getId());
			}
		});
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget# handleChangeForService
	 * @description handler for the "service" property of the context mapping based on the event
	 * sets the value for context mapping service
	 * Also , retrieves all the entities from the given source for context mapping. 
	 * Checks if all the properties (entity, properties etc ) are valid for a given service and empties these properties if the service is invalid.
	 * */
	handleChangeForService : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var aAllEntitySets, aAllEntitySetsForControl = [], aSelectPropertiesForControl = [];
		var sSource = this.byId("idContextMapSourceSelect").getValue().trim();
		var bServiceRegistered = this.oConfigurationEditor.registerService(sSource); // check if the service is registered, if not registers the service
		if (bServiceRegistered) { // for valid service , get the entity sets and properties 
			this._addMandatoryToContextMap();
			aAllEntitySets = this.oConfigurationEditor.getAllEntitySetsOfService(sSource); // list of all the entities for a given service
			if (aAllEntitySets.length > 0) {
				aAllEntitySets.forEach(function(entitySet) {
					var oEntitySet = {};
					oEntitySet.entityKey = entitySet;
					oEntitySet.entityName = entitySet;
					aAllEntitySetsForControl.push(oEntitySet); // form the entity set for the control in set of name, key pair
				});
			}
			var oEntitySetData = {
				Entity : aAllEntitySetsForControl
			};
			var oEntitySetModel = new sap.ui.model.json.JSONModel();
			oEntitySetModel.setSizeLimit(500);
			oEntitySetModel.setData(oEntitySetData);
			this.byId("idContextMapEntitySelect").setModel(oEntitySetModel);
			if (aAllEntitySets.length >= 1) { //set default entity set
				var aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sSource, aAllEntitySets[0]); // if entity is not saved, select the first entity set and fetch the properties
				this.oNavTarget.setFilterMappingEntitySet(aAllEntitySets[0]);
				this.byId("idContextMapEntitySelect").setSelectedKey(aAllEntitySets[0]);
				aProperties.forEach(function(property) { // properties from the selected entity set (either saved one or the first one in the list)
					var oProp = {};
					oProp.propertyKey = property;
					oProp.propertyName = property;
					aSelectPropertiesForControl.push(oProp);// form the properties  for the control in set of name, key pair
				});
			}
			var oSelectPropertiesData = {
				Properties : aSelectPropertiesForControl
			};
			var oSelectPropertiesModel = new sap.ui.model.json.JSONModel();
			oSelectPropertiesModel.setSizeLimit(500);
			oSelectPropertiesModel.setData(oSelectPropertiesData);
			this.byId("idMappedPropertiesCombo").setModel(oSelectPropertiesModel);
			this._validateAndSetDataForContextMapping(); // validate if all the mandatory fields for context mapping is filled, if yes ; set it on navigation target
		} else { // for invalid service , reset the entity sets and properties , empty the controls
			this._resetContextMappingFields(); //reset the context mapping fields , i.e. clear entity sets and mapped properties
			this._removeMandatoryFromContextMap();
		}
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget# handleChangeForEntity
	 * @description handler for the "entity" property of the context mapping based on the event
	 * sets the value for context mapping entity
	 * Reads all the properties for the given source and entity and updates the mapped properties based on entity.
	 * */
	handleChangeForEntity : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var aPropertiesForControl = [];
		var sEntity = this.byId("idContextMapEntitySelect").getSelectedKey();
		var sService = this.byId("idContextMapSourceSelect").getValue().trim();
		var aProperties = this.oConfigurationEditor.getAllPropertiesOfEntitySet(sService, sEntity); // list of properties for a given source and entity set
		aProperties.forEach(function(property) {
			var oProp = {};
			oProp.propertyKey = property;
			oProp.propertyName = property;
			aPropertiesForControl.push(oProp); // form the properties  for the control in set of name, key pair
		});
		var oSelectPropertiesData = {
			Properties : aPropertiesForControl
		};
		var oSelectPropertyModel = new sap.ui.model.json.JSONModel();
		oSelectPropertyModel.setSizeLimit(500);
		oSelectPropertyModel.setData(oSelectPropertiesData);
		this.byId("idMappedPropertiesCombo").setModel(oSelectPropertyModel);
		var aMappedProperties = this.oNavTarget.getFilterMappingTargetProperties();
		var aCommonPropertiesInEntity = [];
		aProperties.forEach(function(propertyFromEntity) {
			aMappedProperties.forEach(function(previousMappedProperty) {
				if (previousMappedProperty === propertyFromEntity) {
					aCommonPropertiesInEntity.push(previousMappedProperty); // get all the common properties in the current and previous entity
				}
			});
		});
		this.byId("idMappedPropertiesCombo").setSelectedKeys(aCommonPropertiesInEntity); // select the common properties in case of entity change
		this._validateAndSetDataForContextMapping();// validate if all the mandatory fields for context mapping is filled, if yes ; set it on navigation target
	},
	/**
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget# handleChangeForMappedProperties
	 * @description handler for the "mapped properties" of the context mapping based on the event
	 * sets the value for context mapping, mapped properties 
	 * */
	handleChangeForMappedProperties : function() {
		this.oConfigurationEditor.setIsUnsaved();
		var aSelectProperty = this.byId("idMappedPropertiesCombo").getSelectedKeys();
		if (aSelectProperty.length !== 0) { // at least one property is selceted
			this._validateAndSetDataForContextMapping();// validate if all the mandatory fields for context mapping is filled, if yes ; set it on navigation target
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget#_getMandatoryFields
	 * @param {Object} oEvent - Event instance of the form field 
	 * @description getter for mandatory fields
	 * */
	_getMandatoryFields : function() {
		return this.mandatoryFields;
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget#_setMandatoryFields
	 * @param {Array} fields - Array of form fields
	 * @description Set mandatory fields on the instance level  
	 * */
	_setMandatoryFields : function(fields) {
		this.mandatoryFields = this.mandatoryFields || [];
		for( var i = 0; i < fields.length; i++) {
			fields[i].isMandatory = true;
			this.mandatoryFields.push(fields[i]);
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget#_setValidationState
	 * @param {Object} oEvent - Event instance of the form field 
	 * @description Set validation state of sub view
	 * */
	_setValidationState : function() {
		var mandatoryFields = this._getMandatoryFields();
		if (mandatoryFields.length !== 0) {
			for( var i = 0; i < mandatoryFields.length; i++) {
				if (mandatoryFields[i].isMandatory === true) {
					if (typeof mandatoryFields[i].getSelectedKeys === "function") {
						this.isValidState = (mandatoryFields[i].getSelectedKeys().length >= 1) ? true : false;
					} else if (typeof mandatoryFields[i].getValue === "function") {
						this.isValidState = (mandatoryFields[i].getValue().trim() !== "") ? true : false;
					} else {
						this.isValidState = (mandatoryFields[i].getSelectedKey() !== "" && mandatoryFields[i].getSelectedKey() !== undefined) ? true : false;
					}
					if (this.isValidState === false) {
						break;
					}
				}
			}
		}
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget#getValidationState
	 * @description Getter for getting the current validation state of sub view
	 * */
	getValidationState : function() {
		this._setValidationState(); //Set the validation state of view
		var isValidState = (this.isValidState !== undefined) ? this.isValidState : true;
		return isValidState;
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget#_validateAndSetDataForContextMapping
	 * @param {navigationTarget}  - navigation target object 
	 * @description checks if the context mapping of the navigation target has all mandatory fields( i.e. entitySet, service, mapped properties)  
	 * and sets the values on the navigation target object
	 * */
	_validateAndSetDataForContextMapping : function() {
		var self = this;
		var sSource = this.byId("idContextMapSourceSelect").getValue().trim();
		var aSelectedEntity = this.byId("idContextMapEntitySelect").getSelectedKey();
		var aMappedProperty = this.byId("idMappedPropertiesCombo").getSelectedKeys();
		if ((sSource !== "" || sSource !== undefined) && (aSelectedEntity !== "" || aSelectedEntity !== undefined) && (aMappedProperty.length !== 0)) {
			this.oNavTarget.setFilterMappingService(sSource); // set the context mapping service
			this.oNavTarget.setFilterMappingEntitySet(aSelectedEntity);// set the context mapping entity set
			var aOldFilterMapSelProp = this.oNavTarget.getFilterMappingTargetProperties();
			aOldFilterMapSelProp.forEach(function(property) {
				self.oNavTarget.removeFilterMappingTargetProperty(property); // remove the old properties 
			});
			aMappedProperty.forEach(function(property) {
				self.oNavTarget.addFilterMappingTargetProperty(property); // add the selected properties 
			});
		}
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.navigationTarget# _addMandatoryToContextMap
	 * @description add the mandatory tags to all the fields in the context mapping if the service is valid
	 * */
	_addMandatoryToContextMap : function() {
		this.byId("idContextMapEntitySelect").isMandatory = true; // make the entity set and mapped property mandatory
		this.byId("idMappedPropertiesCombo").isMandatory = true;
		this.byId("idContextMapEntityLabel").setRequired(true);
		this.byId("idMappedPropertiesLabel").setRequired(true);
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.navigationTarget# _removeMandatoryFromContextMap
	 * @description removes the mandatory tags to all the fields in the context mapping if the service is invalid
	 * */
	_removeMandatoryFromContextMap : function() {
		this.byId("idContextMapEntitySelect").isMandatory = false; // set the manadatory tag to false for entity and mapped properties
		this.byId("idMappedPropertiesCombo").isMandatory = false;
		this.byId("idContextMapEntityLabel").setRequired(false);
		this.byId("idMappedPropertiesLabel").setRequired(false);
	},
	/**
	 * @function
	 * @private 
	 * @name sap.apf.modeler.ui.controller.navigationTarget# _resetContextMappingFields
	 * Resets all the values for the filter mapping properties (service, entitySet, mapped properties)
	 * and clears all the data and selected values from the controls
	 * */
	_resetContextMappingFields : function() {
		var self = this;
		this.oNavTarget.setFilterMappingService("");
		this.oNavTarget.setFilterMappingEntitySet(undefined);
		var aOldFilterMapSelectProperty = this.oNavTarget.getFilterMappingTargetProperties();
		aOldFilterMapSelectProperty.forEach(function(property) {
			self.oNavTarget.removeFilterMappingTargetProperty(property);
		});
		//set an empty model to the controls on the UI
		var oEmptyModelForControlOnReset = new sap.ui.model.json.JSONModel();
		var oEmptyDateSetForControlOnReset = {
			NoData : []
		};
		oEmptyModelForControlOnReset.setData(oEmptyDateSetForControlOnReset);
		this.byId("idContextMapSourceSelect").setValue("");
		this.byId("idContextMapEntitySelect").setModel(oEmptyModelForControlOnReset);
		this.byId("idContextMapEntitySelect").setSelectedKey();
		this.byId("idMappedPropertiesCombo").setModel(oEmptyModelForControlOnReset);
		var aSelectedKeys = this.byId("idMappedPropertiesCombo").getSelectedKeys();
		this.byId("idMappedPropertiesCombo").removeSelectedKeys(aSelectedKeys);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.navigationTarget#_addAutoCompleteFeatureOnInputs
	 * @description Adds 'Auto Complete Feature' to the input fields in the view
	 * using sap.apf.modeler.ui.utils.TextPoolHelper.
	 * */
	_addAutoCompleteFeatureOnInputs : function() {
		if (this.oConfigurationHandler) {
			var oTextPoolHelper = new sap.apf.modeler.ui.utils.TextPoolHelper(this.oTextPool);
			//autocomplete for source
			var oDependenciesForService = {
				oConfigurationEditor : this.oConfigurationEditor,
				type : "service"
			};
			var oSource = this.byId("idContextMapSourceSelect");
			oTextPoolHelper.setAutoCompleteOn(oSource, oDependenciesForService);
		}
	}
});