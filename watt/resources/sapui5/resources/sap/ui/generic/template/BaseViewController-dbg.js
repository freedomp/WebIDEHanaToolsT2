/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.generic.templates.controller.BaseViewController.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/ui/generic/template/library', 'sap/m/MessagePopover', 'sap/m/MessagePopoverItem', 'sap/ui/core/Component', 'sap/m/PlacementType', 'sap/m/MessageToast', 'sap/m/MessageBox', 'sap/ui/table/Table', 'sap/m/Table', 'sap/ui/comp/smarttable/SmartTable', 'sap/ui/model/Sorter', 'sap/ui/model/Filter', 'sap/ui/generic/template/ViewUtil', 'sap/ui/generic/template/ActionUtil', 'sap/ui/generic/template/MessageUtil', 'sap/ui/generic/app/util/ModelUtil'
], function(jQuery, Controller, library, MessagePopover, MessagePopoverItem, Component, PlacementType, MessageToast, MessageBox, Table, ResponsiveTable, SmartTable, Sorter, Filter, ViewUtil, ActionUtil, MessageUtil, ModelUtil) {
	"use strict";

	/**
	 * Constructor for a new BaseViewController.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The BaseViewController controller provides a generic API for integration with the view controller and other re-use functions required in
	 *        the controllers for smart templates. The BaseViewController is enabled for handling non-draft as well as draft documents. The provided
	 *        generic API is based on OData model entities.
	 * @extends sap.ui.core.mvc.Controller
	 * @author SAP SE
	 * @version 1.32.7
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.ui.generic.template.BaseViewController
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BaseViewController = Controller.extend("sap.ui.generic.template.BaseViewController", /** @lends sap.ui.generic.template.BaseViewController.prototype */
	{
		metadata: {
			library: "sap.ui.generic.template"
		}
	});

	BaseViewController.prototype.onInit = function(mParameters) {
		mParameters = mParameters || {};
		// function to indicate whether messages should be shown or not (message box in MessageUtil)
		this._fnShowMessages = mParameters.showMessages;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template");
		this._setCurrentOperation('', null);
	};

	/**
	 * Gets binding context of base view.
	 * 
	 * @returns {object} Context
	 * @public
	 */
	BaseViewController.prototype.getContext = function() {
		return this.getView().getBindingContext();
	};

	/**
	 * Gets component of base view.
	 * 
	 * @returns {sap.ui.core.UIComponent} Component
	 * @public
	 */
	BaseViewController.prototype.getComponent = function() {
		if (!this._oComponent) {
			this._oComponent = Component.getOwnerComponentFor(this.getView());
		}
		return this._oComponent;
	};

	/**
	 * Gets component container.
	 * 
	 * @returns {sap.ui.core.ComponentContainer} Component container
	 * @public
	 */
	BaseViewController.prototype.getComponentContainer = function() {
		return this.getComponent().getComponentContainer();
	};

	/**
	 * Gets transaction controller.
	 * 
	 * @returns {sap.ui.generic.app.transaction.TransactionController} Transaction controller
	 * @public
	 */
	BaseViewController.prototype.getTransactionController = function() {
		return this.getComponent().getAppComponent().getTransactionController();
	};

	/**
	 * Gets navigation controller.
	 * 
	 * @returns {sap.ui.generic.app.navigation.NavigationController} Navigation controller
	 * @public
	 */
	BaseViewController.prototype.getNavigationController = function() {
		return this.getComponent().getAppComponent().getNavigationController();
	};

	/**
	 * Gets draft controller.
	 * 
	 * @returns {sap.ui.generic.app.transaction.DraftController} Draft controller
	 * @public
	 */
	BaseViewController.prototype.getDraftController = function() {
		return this.getTransactionController().getDraftController();
	};

	/**
	 * Gets draft context.
	 * 
	 * @returns {sap.ui.generic.app.transaction.DraftContext} Draft context
	 * @public
	 */
	BaseViewController.prototype.getDraftContext = function() {
		return this.getTransactionController().getDraftController().getDraftContext();
	};

	/**
	 * Prepares current OData entity for editing. The entity can either be a non-draft document or draft root.
	 * 
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.editEntity = function() {
		this._setCurrentOperation(this.operations.editEntity);

		var that = this;
		return new Promise(function(resolve, reject) {
			that.getTransactionController().editEntity(that.getContext()).then(function(oResponse) {
				that.getComponentContainer().bindElement(oResponse.context.getPath());

				that.handleSuccess(oResponse);
				return resolve(oResponse.context);
			}, function(oError) {
				that.handleError(oError);
				return reject(oError);
			});
		});
	};

	/**
	 * Deletes current OData entity. The entity can either be a non-draft document or a draft document. *
	 * 
	 * @param {boolean} bDeleteDraftForActiveEntity Can be set to <code>true</code> in order to delete the draft entity, although the current
	 *        binding context belongs to the active entity
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.deleteEntity = function(bDeleteDraftForActiveEntity) {
		this._setCurrentOperation(this.operations.deleteEntity);

		var that = this;
		var oContext = this.getContext();
		var bIsActiveEntity = this.getDraftController().isActiveEntity(oContext);
		var bHasActiveEntity = this.getDraftController().hasActiveEntity(oContext);

		return new Promise(function(resolve, reject) {
			if (bIsActiveEntity && bDeleteDraftForActiveEntity) {
				// Current context is the active document. But we have to delete the draft of this active document.
				that.getDraftController().getDraftForActiveEntity(oContext).then(function(oResponse) {
					that.getTransactionController().deleteEntity(oResponse.context).then(function() {
						setTimeout(function() {
							MessageToast.show(that._oRb.getText("DRAFT_WITH_ACTIVE_DOCUMENT_DELETED"));
						}, 50);

						return resolve();
					});
				}, function(oError) {
					that.getComponentContainer().bindElement(oContext.getPath());
					that.handleError(oError);
					return reject();
				});
			} else {
				that.getTransactionController().deleteEntity(oContext).then(function() {
					var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
					var oDraftContext = that.getDraftController().getDraftContext();
					var bRoot = oDraftContext.isDraftRoot(sEntitySet);					
					var sMessageText = that._oRb.getText("OBJECT_DELETED");
					
					// replace the message only for the root.
					if (!bIsActiveEntity && bRoot) {
						sMessageText = bHasActiveEntity ? that._oRb.getText("DRAFT_WITH_ACTIVE_DOCUMENT_DELETED") : that._oRb.getText("DRAFT_WITHOUT_ACTIVE_DOCUMENT_DELETED");
					}
					setTimeout(function() {
						MessageToast.show(sMessageText);
					}, 50);
					
					return resolve();
				}, function(oError) {
					// anything to be done beside of messages handled by submit?
					that.getComponentContainer().bindElement(oContext.getPath());
					that.handleError(oError);
					return reject();
				});
			}
		});
	};

	/**
	 * Modifies current OData entity. The entity can either be a non-draft document or a draft document.
	 * 
	 * @param {string} sValue The value that has to be modified
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.modifyEntity = function(sValue) {
		this._setCurrentOperation(this.operations.modifyEntity);

		var that = this;
		return new Promise(function(resolve, reject) {
			var sEntitySet = that.getComponent().getEntitySet();
			if (!that.getDraftContext().isDraftEnabled(sEntitySet)) {
				return resolve();
			}
			
			that.getTransactionController().propertyChanged(sEntitySet, sValue, that.getComponentContainer().getElementBinding()).then(function() {
				return resolve();
			}, function(oError) {
				that.handleError(oError);
				return reject();
			});
		});
	};

	/**
	 * Saves current OData entity. The entity can either be a non-draft document or a draft document.
	 * 
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.saveEntity = function() {
		this._setCurrentOperation(this.operations.saveEntity);

		var that = this;
		return new Promise(function(resolve, reject) {
			that.getTransactionController().triggerSubmitChanges().then(function(oResponse) {
				that.handleSuccess(oResponse);
				return resolve(oResponse.context);
			}, function(oError) {
				that.handleError(oError);
				return reject(oError);
			});
		});
	};

	/**
	 * Activates a draft OData entity. Only the root entity can be activated.
	 * 
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.activateDraftEntity = function() {
		this._setCurrentOperation(this.operations.activateDraftEntity);

		var that = this;
		return new Promise(function(resolve, reject) {
			that.getDraftController().activateDraftEntity(that.getContext()).then(function(oResponse) {
				that.getComponentContainer().unbindElement();
				that.getComponentContainer().bindElement(oResponse.context.getPath());

				that.handleSuccess(oResponse);
				return resolve(oResponse);
			}, function(oError) {
				that.handleError(oError);
				return reject(oError);
			});
		});
	};

	/**
	 * Prepares a draft OData entity. The entity can either be a draft root or a draft item.
	 * 
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.prepareDraftEntity = function() {
		this._setCurrentOperation(this.operations.prepareDraftEntity);

		var that = this;
		return new Promise(function(resolve, reject) {
			that.getComponentContainer().unbindElement();
			that.getDraftController().prepareDraftEntity(that.getContext()).then(function(oResponse) {
				that.handleSuccess(oResponse);
				return resolve(oResponse);
			}, function(oError) {
				that.handleError(oError);
				return reject(oError);
			});
		});
	};

	/**
	 * Validates a draft OData entity. The entity can either be a draft root or a draft item.
	 * 
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	BaseViewController.prototype.validateDraftEntity = function() {
		this._setCurrentOperation(this.operations.validateDraftEntity);

		var that = this;
		return new Promise(function(resolve, reject) {
			that.getComponentContainer().unbindElement();
			that.getDraftController().validateDraftEntity(that.getContext()).then(function(oResponse) {
				that.handleSuccess(oResponse);
				return resolve(oResponse);
			}, function(oError) {
				that.handleError(oError);
				return reject(oError);
			});
		});
	};

	/**
	 * Sets <code>isRefreshRequired</code> to <code>true</code> in all existing components (optionally, one can exclude a component).
	 * 
	 * @param {sap.ui.generic.template.TemplateComponent} oComponentToBeIgnored Component for which no refresh required is set
	 */
	BaseViewController.prototype._setRefreshRequiredOnComponents = function(oComponentToBeIgnored) {
		var oContainers = this.getNavigationController().getViews();
		for ( var sContainer in oContainers) {
			var oComponent = oContainers[sContainer].getComponentInstance();
			if (oComponent === oComponentToBeIgnored) {
				continue;
			}
			if (oComponent.setIsRefreshRequired) {
				oComponent.setIsRefreshRequired(true);
			}
		}
	};

	BaseViewController.prototype._setCurrentOperation = function(sCurrentOperation, oParameters) {
		this._oCurrentOperation = {
			name: sCurrentOperation
		};
		if (oParameters) {
			this._oCurrentOperation.parameters = oParameters;
		}
	};

	BaseViewController.prototype._getShowMessages = function() {
		if (this._fnShowMessages) {
			return this._fnShowMessages();
		}
		return true;
	};

	BaseViewController.prototype._getErrorContext = function(mParameters) {
		mParameters = mParameters || {};
		try {
			var bIsDraftEnabled, sEntitySet;
			var oDraftContext = this.getDraftContext();
			if (oDraftContext) {
				// context is only present for details view via this.getContext()
				var oContext = mParameters.context || this.getContext();
				// context is not given when creating a new draft entity and the corresponding POST request fails
				sEntitySet = oContext ? ModelUtil.getEntitySetFromContext(oContext) : this.getComponent().getEntitySet();
				bIsDraftEnabled = oDraftContext.isDraftEnabled(sEntitySet);
			}

			return {
				entitySet: sEntitySet,
				isDraft: bIsDraftEnabled,
				lastOperation: this._oCurrentOperation,
				showMessages: this._getShowMessages()
			};
		} catch (error) {
			jQuery.sap.log.error("BaseViewController._getErrorContext threw an exception: " + error);
			return null;
		}
	};

	BaseViewController.prototype.handleError = function(oError, mParameters) {
		// if error context is not set - allow to pass values to getErrorContext via mParameters - required for actions on list as context needs to be
		// provided
		if (!mParameters || !mParameters.errorContext) {
			mParameters = {
				errorContext: this._getErrorContext(mParameters)
			};
		}

		var oMessage = new MessageUtil({
			controller: this,
			response: oError
		});
		oMessage.handleError(mParameters);
	};

	BaseViewController.prototype.handleSuccess = function(oResponse, mParameters) {
		if (!mParameters) {
			mParameters = {
				successContext: {
					showMessages: this._getShowMessages()
				}
			};
		}

		var oMessage = new MessageUtil({
			controller: this,
			response: oResponse
		});
		oMessage.handleSuccess(mParameters);
	};

	/**
	 * Calls OData function import action.
	 * 
	 * @param {string|object} sFunctionImportPath Path of the function import that is called or object containing functionImportPath, context,
	 *        sourceControl, label, and navigationProperty
	 * @param {object} oCurrentContext The context in which the action is called
	 * @param {string} sFunctionImportLabel Optional parameter for the confirmation popup text
	 * @public
	 */
	BaseViewController.prototype.callAction = function(sFunctionImportPath, oCurrentContext, sFunctionImportLabel) {
		var sNavigationProperty, oSourceControl;
		if (typeof sFunctionImportPath === "object") {
			var oPropertyBag = sFunctionImportPath;
			sFunctionImportPath = oPropertyBag.functionImportPath;
			oCurrentContext = oPropertyBag.context;
			oSourceControl = oPropertyBag.sourceControl;
			sFunctionImportLabel = oPropertyBag.label;
			sNavigationProperty = oPropertyBag.navigationProperty;
		}

		this._setCurrentOperation(this.operations.callAction, {
			functionImport: sFunctionImportPath
		});

		var that = this;

		var oAction = new ActionUtil({
			controller: this,
			context: oCurrentContext,
			successCallback: function(context) {				
				// If success context is same as action context --> do not trigger any navigation
				if (context === oCurrentContext) {
					return;
				}

				// TODO check with UX navigate to object with history entry
				// if an action returns a complex type e.g. validate oContext.getPath() returns "/undefined". Not the final solution.
				if (context && context.getPath() !== "/undefined") {

					// TODO: check with Marcell - currently in any case we navigate, what is with Calculate Action where no navigation is needed?
					if (oSourceControl) {
						that.navigateFromListItem(context, oSourceControl);
					} else {
						that.getNavigationController().navigateToContext(context, sNavigationProperty, false);
					}
				}
			}
		});
		oAction.call(sFunctionImportPath, sFunctionImportLabel);
	};

	/**
	 * Triggers navigation from a given list item.
	 * 
	 * @param {sap.ui.core.Control|object} oSelectedListItem The control that has been selected in the table or its binding context
	 * @param {object} oTable The table from which navigation was triggered; if the parameter is not provided, the oSelectedListItem has to be a
	 *        control in the table
	 * @public
	 */
	BaseViewController.prototype.navigateFromListItem = function(oSelectedListItem, oTable) {
		// binding context and path of selected item in list
		var oSelectedContext = null;
		if (oSelectedListItem.getBindingContext) {
			oSelectedContext = oSelectedListItem.getBindingContext();
		} else {
			oSelectedContext = oSelectedListItem;
			oSelectedListItem = null;
		}

		var sSelectedPath = oSelectedContext.getPath();

		var oComponent = this.getComponent();

		// binding path of component - either binding path of list (list screen e.g. /SalesOrder) or binding path of details screen (e.g.
		// /SalesOrder(123) )
		// var sPath = oComponent.getBindingContext().getPath();
		var sPath = "";
		if (oComponent.getComponentContainer().getElementBinding()) {
			sPath = oComponent.getComponentContainer().getElementBinding().getPath();
		}

		// check whether it is a navigation property binding or just a collection
		var sNavigationProperty = null;

		if (sSelectedPath.indexOf(sPath) !== 0) {
			// relative binding - table bound to navigation property e.g. Item - get binding of embedded table in details screen
			if (!oTable) {
				oTable = ViewUtil.getParentTable(oSelectedListItem);
			}
			sNavigationProperty = ViewUtil.getTableBinding(oTable).path;
		}

		this.getNavigationController().navigateToContext(oSelectedContext, sNavigationProperty, false);
	};

	/**
	 * Executes a table search for provided term.
	 * 
	 * @param {sap.ui.table.Table|sap.m.Table} oTable The table on which search operation is triggered
	 * @param {string} sQuery Term for which the search is performed
	 * @public
	 */
	BaseViewController.prototype.searchOnTable = function(oTable, sQuery) {

		if (!oTable) {
			throw new Error("No table", "BaseViewController.js");
		}

		var oBinding = ViewUtil.getTableBinding(oTable);
		var oBindingParameters = {
			path: oBinding.path,
			template: oBinding.template,
			parameters: {
				custom: {
					search: sQuery
				}
			}
		};

		if (oTable instanceof Table) {
			oTable.bindRows(oBindingParameters);
		} else if (oTable instanceof ResponsiveTable) {
			oTable.bindItems(oBindingParameters);
		} else {
			throw new TypeError("searchOnTable not valid on " + oTable ? oTable.toString() : "(null)", "BaseViewController.js");
		}
	};

	/**
	 * Adds an entry to a table.
	 * 
	 * @param {sap.ui.table.Table|sap.m.Table|sap.ui.comp.smarttable.SmartTable} oTable The table to which an entry has been added
	 */
	BaseViewController.prototype.addEntry = function(oTable) {
		   this._setCurrentOperation(this.operations.addEntry);

		   var oNavigationController = this.getNavigationController();
		   var sBindingPath = "";
		   var sTableBindingPath = "";
		   var sEntitySet = this.getComponent().getEntitySet();
		   var that = this;
		   var oEntityType, oEntitySet, oNavigationEnd, oMetaModel, oContext;

		   if (!oTable) {
		      throw new Error("Unknown Table");
		   }

		   oContext = this.getView().getBindingContext();
		   if (oContext) {
		      // Detail screen
		      sTableBindingPath = ViewUtil.getTableBinding(oTable).path;

		      // get entityset of navigation property
		      oMetaModel = this.getView().getModel().getMetaModel();
		      oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
		      oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
		      oNavigationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sTableBindingPath);
		      sEntitySet = oNavigationEnd.entitySet;

		      // create binding path
		      sTableBindingPath = '/' + sTableBindingPath;
		      sBindingPath = oContext.getPath() + sTableBindingPath;
		   } else {
		      // on list, support only one entityset mapped to the root component
		      sBindingPath = "/" + sEntitySet;
		   }


		   return new Promise(function(resolve, reject) {

		      if (that.getDraftContext().isDraftEnabled(sEntitySet)) {
		         that.getDraftController().createNewDraftEntity(sEntitySet, sBindingPath).then(function(oResponse) {
		            oContext = oResponse.context;
		            oNavigationController.navigateToContext(oContext, sTableBindingPath, false);
		            return resolve(oResponse.context);
		         }, function(oError) {
		            that.handleError(oError);
		            return reject(oError);
		         });
		      } else {
		         oContext = that.getView().getModel().createEntry(sBindingPath, {
		            batchGroupId: 'Changes',
		            changeSetId: 'Changes'
		         });

		        oNavigationController.navigateToContext(oContext, sTableBindingPath, false);

		         return resolve(oContext);
		      }
		   });
	};

	BaseViewController.prototype.showMessagePopover = function(oButton, bToggle) {
		if (!this._oMessagePopover) {
			this._oMessagePopover = new MessagePopover({
				items: {
					path: "message>/",
					template: new MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
					})
				}
			});
			oButton.addDependent(this._oMessagePopover);
		}

		if (bToggle || !this._oMessagePopover.isOpen()) {
			this._oMessagePopover.toggle(oButton);
		}
	};

	// injection of $select for smart table - only subset of fields is requested (line items) but technical fields are; required as well: semantic
	// key, technical key + IsDraft / HasTwin
	BaseViewController.prototype.getTableQueryParameters = function(sEntitySet, oExistingQueryParameters) {// #ListController
		var oMetaModel = this.getView().getModel().getMetaModel();
		var oBindingParams = oExistingQueryParameters;
		var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet, false);
		var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType, false);
		var aMandatoryFields = oEntityType.key.propertyRef;
		var i;

		if (this.getDraftContext().isDraftEnabled(sEntitySet)) {
			aMandatoryFields = aMandatoryFields.concat(this.getDraftContext().getSemanticKey(sEntitySet));
			aMandatoryFields.push({
				name: "IsActiveEntity"
			}, {
				name: "HasDraftEntity"
			}, {
				name: "HasActiveEntity"
			});
		}

		if (oBindingParams.parameters.select && oBindingParams.parameters.select.length > 0) {
			// at least one select parameter
			var aSelects = oBindingParams.parameters.select.split(',');
			for (i = 0; i < aMandatoryFields.length; i++) {
				if (jQuery.inArray(aMandatoryFields[i].name, aSelects) === -1) {
					oBindingParams.parameters.select += ',' + aMandatoryFields[i].name;
				}
			}
		}

		return oBindingParams;
	};

	BaseViewController.operations = {
		callAction: "callAction",
		addEntry: "addEntry",
		saveEntity: "saveEntity",
		deleteEntity: "deleteEntity",
		editEntity: "editEntity",
		modifyEntity: "modifyEntity",
		validateDraftEntity: "validateDraftEntity",
		prepareDraftEntity: "prepareDraftEntity",
		activateDraftEntity: "activateDraftEntity"
	};

	BaseViewController.prototype.operations = {
		callAction: BaseViewController.operations.callAction,
		addEntry: BaseViewController.operations.addEntry,
		saveEntity: BaseViewController.operations.saveEntity,
		deleteEntity: BaseViewController.operations.deleteEntity,
		editEntity: BaseViewController.operations.editEntity,
		modifyEntity: BaseViewController.operations.modifyEntity,
		validateDraftEntity: BaseViewController.operations.validateDraftEntity,
		prepareDraftEntity: BaseViewController.operations.prepareDraftEntity,
		activateDraftEntity: BaseViewController.operations.activateDraftEntity
	};

	return BaseViewController;

}, /* bExport= */true);
