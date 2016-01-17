jQuery.sap.declare("cus.sd.sofulfil.monitor.model.IN02_Model");
jQuery.sap.require("cus.sd.sofulfil.monitor.model.DataProvider");

cus.sd.sofulfil.monitor.model.IN02_Model = {

	XS_SERVICE : cus.sd.sofulfil.monitor.model.DataProvider.XS_SERVICE,
	LORD_SERVICE : cus.sd.sofulfil.monitor.model.DataProvider.LORD_SERVICE,
	oDataProvider : cus.sd.sofulfil.monitor.model.DataProvider,

	batchOperations : new Array(),
	displayErrorMessage : function(oError) {
		var sErrorMessage = cus.sd.sofulfil.monitor.utils.TextUtil.getText("MSG_ODataCommunicationError");
		sap.ca.ui.message.showMessageBox({
			type : sap.ca.ui.message.Type.ERROR,
			message : sErrorMessage,
			details : oError.response.body
		});

		oController.onNoteCreationFailure(oError);
	},
	getDataInBatchOperation : function(fnSuccess, fnError) {
		if (!fnSuccess) {
			fnSuccess = function() {
				sap.m.MessageToast.show(that.i18nBundle.getText("Batch data fetched properly working"));
			};
		}
		if (!fnError) {
			fnError = jQuery.proxy(this.displayErrorMessage, this);
		}
		return cus.sd.sofulfil.monitor.model.DataProvider.getDataBatch(
				cus.sd.sofulfil.monitor.model.DataProvider.XS_SERVICE, this.batchOperations, fnSuccess, fnError);
	},
	addServiceCallToBatchOperations : function(entitySet, filter, select, getSingleData) {
		var batchOperation = new cus.sd.sofulfil.monitor.model.BatchReadOperation(entitySet, getSingleData, filter, select,
				"");
		this.batchOperations[this.batchOperations.length] = batchOperation;
	},
	getBatchOperationByServiceAlias : function(entitySet) {
		for ( var i = 0; i < this.batchOperations.length; i++) {
			var batchOperation = this.batchOperations[i];
			if (entitySet == batchOperation.entitySet) {
				return batchOperation;
			}
		}
		return "";
	},
	clearBatch : function() {
		this.batchOperations.length = 0;
	},
	/**
	 * Return all functionality related to querying data and batching requests
	 * 
	 * @param salesOrderId
	 * @param issueType
	 * @param deliveryDocumentId
	 * @returns {}
	 */
	Queries : function(salesOrderId, issueType, deliveryDocumentId) {
		var that = this;

		var filter = {};
		(function() {
			var filterTxt = "";
			var andInitial = function() {
				if (filterTxt) {
					filterTxt += " and ";
				}
			};
			this.andSalesOrder = function() {
				andInitial();
				filterTxt += that.oDataProvider.getFilter(salesOrderId);
				return filter;
			};
			this.andDeliveryDocument = function() {
				andInitial();
				filterTxt += "DeliveryDocument eq '" + deliveryDocumentId + "'";
				return filter;
			};
			this.andIssueType = function() {
				andInitial();
				filterTxt += "Issue eq 'IN02'";
				return filter;

			};
			this.andOutboundDelivery = function() {
				andInitial();
				filterTxt += "OutboundDelivery eq '" + deliveryDocumentId + "'";
				return filter;
			};
			this.reset = function() {
				filterTxt = "";
				return filter;
			};
			this.toString = function() {
				return filterTxt;
			};
			return this;
		}).call(filter);
		var addToBatch = function(oQuery, singleEntry) {
			that.addServiceCallToBatchOperations(oQuery.entity, oQuery.filter, oQuery.select, singleEntry);
		};
		return {
			salesOrder : {
				entity : "SalesOrderQuery",
				select : "PurchaseOrderByCustomer,SoldToParty,SoldToPartyName,BillToParty,BillToPartyName,PayerParty,PayerPartyName,"
						 + "TotalNetAmount_E,TransactionCurrency",
				filter : filter.reset().andSalesOrder().toString(),
				batchit : function() {
					addToBatch(this, true);
				}
			},
			deliveryDocument : {
				entity : "DeliveryDocumentQuery",
				select : "OverallSDProcessStatusDesc,ActualGoodsMovementDate_E,BillingDocumentDate_E,ActualDeliveryAmount_E,TransactionCurrency",
				filter : filter.reset().andOutboundDelivery().toString(),
				batchit : function() {
					addToBatch(this, true);
				}
			},
			fulfillmentIssue : {
				entity : "SalesOrderFulfillmentIssueQuery",
				select : "DueDays,TotalNetAmount_E",
				filter : filter.reset().andSalesOrder().andDeliveryDocument().andIssueType().toString(),//that.oDataProvider.getIssueTypeFilter(salesOrderId, issueType) + " and DeliveryDocument eq '" + deliveryDocumentId +"'",
				batchit: function(){
					addToBatch( this, true);
				}
			},
			contacts : {
				entity : "SalesOrderFulfillmentContactQuery",
				select : "FirstName,LastName,EmailAddress,SoldToPartyName,ContactIsInternal,ContactIsExternal,ContactPersonFunctionName,PhoneNumber,PhoneNumberExtension,MobilePhoneNumber",
				filter : filter.reset().andSalesOrder().andDeliveryDocument().andIssueType().toString(),
				batchit : function() {
					// addToBatch( this, false);
					var batchOperation = new cus.sd.sofulfil.monitor.model.BatchReadOperation(this.entity, false, undefined,
							undefined, undefined, [{
								property : 'P_Issue',
								value : 'IN02'
							}, {
								property : 'P_SalesOrder',
								value : salesOrderId
							}, {
								property : 'P_DeliveryDocument',
								value : deliveryDocumentId
							}]);
					that.batchOperations[that.batchOperations.length] = batchOperation;
				}
			},
			batchAll : function() {
				this.salesOrder.batchit();
				this.deliveryDocument.batchit();
				// this.fulfillmentIssue.batchit();
				// this.contacts.batchit();
			}
		};

	},
	/**
	 * called to load of a sales order issue.
	 * 
	 * @param salesOrder
	 * @param issueType
	 * @param deliveryDocument
	 * @param additionalObjectInfo
	 *          optional
	 * @returns
	 */
	loadData : function(salesOrder, issueType, deliveryDocument, fnSuccess, fnError, additionalObjectInfo) {

		var that = this;

		// Model to hold combined data from two services
		var megaModel = new sap.ui.model.json.JSONModel();

		if (!salesOrder || !issueType || !deliveryDocument) {
			jQuery.sap.log.error("Missing parameters to fetch the issue detail for Overdue Billing scenario");
			return null;
		}

		var queries = this.Queries(salesOrder, issueType, deliveryDocument);

		
			this.clearBatch();

			// Try to get the DueDays from shared SOIS model (if already loaded)
			if (additionalObjectInfo !== undefined && additionalObjectInfo.soisModel !== null) {
				queries.fulfillmentIssue.entity = null;
				queries.fulfillmentIssue.result = additionalObjectInfo.soisModel;
			} else {
				queries.fulfillmentIssue.batchit();
			}
			queries.batchAll();

			fnSuccess = (function(original) {
				function extend() {
					// Retrieve result from services
					queries.salesOrder.result = that.getBatchOperationByServiceAlias(queries.salesOrder.entity).result;
					if (queries.fulfillmentIssue.entity !== null) {
						queries.fulfillmentIssue.result = that.getBatchOperationByServiceAlias(queries.fulfillmentIssue.entity).result;
					}
					queries.deliveryDocument.result = that.getBatchOperationByServiceAlias(queries.deliveryDocument.entity).result;
					// queries.contacts.result = that.getBatchOperationByServiceAlias(queries.contacts.entity).result;
					// Error checking
					if (!queries.salesOrder.result || !queries.fulfillmentIssue.result || !queries.deliveryDocument.result) {
						jQuery.sap.log.error("Failled in fetching the result for Overdue Billing scenario");
						that.clearBatch();
						original(null);
						return;
					};
					// SalesOrder and DeliveryDocument from navigation
					megaModel.setProperty("/SalesOrder", salesOrder);
					megaModel.setProperty("/DeliveryDocument", deliveryDocument);

					// Define issue details used on header
					megaModel.setProperty("/IssueDetailDescription", cus.sd.sofulfil.monitor.utils.TextUtil.getResourceBundle()
							.getText("IN02_NoInvoiceCreated"));
					megaModel.setProperty("/IssueState", sap.ui.core.ValueState.Error);

					// Add properties of salesOrderQuery service to model
					megaModel.setProperty("/PurchaseOrderByCustomer", queries.salesOrder.result.oData.PurchaseOrderByCustomer);
					megaModel.setProperty("/SoldToParty", queries.salesOrder.result.oData.SoldToParty);
					megaModel.setProperty("/SoldToPartyName", queries.salesOrder.result.oData.SoldToPartyName);
					megaModel.setProperty("/BillToParty", queries.salesOrder.result.oData.BillToParty);
					megaModel.setProperty("/BillToPartyName", queries.salesOrder.result.oData.BillToPartyName);
					megaModel.setProperty("/PayerParty", queries.salesOrder.result.oData.PayerParty);
					megaModel.setProperty("/PayerPartyName", queries.salesOrder.result.oData.PayerPartyName);
					megaModel.setProperty("/TotalNetAmount_E", queries.salesOrder.result.oData.TotalNetAmount_E);

					// Add properties of salesOrderFulfillmentIssueQuery service to model
					megaModel.setProperty("/DueDays", queries.fulfillmentIssue.result.oData.DueDays);

					// Add properties of deliveryDocumentQuery service to model
					megaModel.setProperty("/OverallSDProcessStatusDesc",
							queries.deliveryDocument.result.oData.OverallSDProcessStatusDesc);
					megaModel.setProperty("/ActualGoodsMovementDate",
							queries.deliveryDocument.result.oData.ActualGoodsMovementDate_E);
					megaModel.setProperty("/BillingDocumentDate", queries.deliveryDocument.result.oData.BillingDocumentDate_E);
					megaModel.setProperty("/ActualDeliveryAmount", queries.deliveryDocument.result.oData.ActualDeliveryAmount_E);
					megaModel.setProperty("/TransactionCurrency", queries.deliveryDocument.result.oData.TransactionCurrency);

					that.clearBatch();
					var response = {
						issue : megaModel
					/*
					 * contacts :(function(){ contactsModel.setData(queries.contacts.result.oData); return contactsModel; })()
					 */
					};
					original(response);
				}
				return extend;
			})(fnSuccess);

			fnError = (function(original) {
				function extend() {
					jQuery.sap.log.error("Failled in fetching the result for Overdue Billing scenario");
					that.clearBatch();
					original();
				}
				return extend;
			})(fnError);

			// Execute requests in batch
			this.getDataInBatchOperation(fnSuccess, fnError);
	},
	loadContacts : function(salesOrder, issueType, deliveryDocument, fnSuccess, fnError) {
		var that = this;

		var queries = this.Queries(salesOrder, issueType, deliveryDocument);
		this.clearBatch();
		queries.contacts.batchit();

		fnSuccess = (function(original) {
			function extend() {
				queries.contacts.result = that.getBatchOperationByServiceAlias(queries.contacts.entity).result;
				that.clearBatch();
				var model = new sap.ui.model.json.JSONModel();
				model.setData(queries.contacts.result.oData);
				original(model);
			}
			return extend;
		})(fnSuccess);

		fnError = jQuery.proxy(this.displayErrorMessage, this);

		this.getDataInBatchOperation(fnSuccess, fnError);

	}

};
