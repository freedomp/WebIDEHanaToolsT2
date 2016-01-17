/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.require('sap.apf.ui.utils.facetFilterListHandler');
jQuery.sap.require('sap.apf.ui.utils.facetFilterListConverter');
/**
* @class facetFilter
* @memberOf sap.apf.ui.reuse.controller
* @name facetFilter
* @description controller facetFilter view
*/
(function() {
	'use strict';
	/* Selections are cached on init and during change for each list in order to compare whether change occurred
	 * Example : aCachedSelectedKeys = {
	 * 				"__list0" : ["20100101"],
	 * 				"__list1" : ["4000", "5000"]
	 * 			 }
	 */
	var aCachedSelectedKeys = {};
	/* Declaration of facet filter list handler which will be associated with each facet filter list
	 * Example : aFacetFilterListHandlers = {
	 * 				"__list0" : sap.apf.ui.utils.facetFilterListHandler,
	 * 				"__list1" : sap.apf.ui.utils.facetFilterListHandler
	 * 			 }
	 */
	var aFacetFilterListHandlers = {};
	// Boolean to check if facet filter list selections changed
	var bSelectionChanged;
	//Facet filter list converter is used to modify the values in the form understandable by the control
	var oFacetFilterListConverter = new sap.apf.ui.utils.FacetFilterListConverter();
	/**
	 * @private
	 * @function
	 * @name sap.apf.ui.reuse.controller.facetFilter#_updateSelectedFFListValues
	 * @param oController - passed context (this)
	 * @description Updates selected filter values for all facet filter list controls on reset/new
	 * */
	function _updateSelectedFFListValues(oController) {
		var sFacetFilterListId;
		var aFacetFilterListControls = oController.getView().byId("idAPFFacetFilter").getLists();
		//After reset/new, for each facet filter list, fetch the selected values then update on the control
		aFacetFilterListControls.forEach(function(oFacetFilterListControl) {
			sFacetFilterListId = oFacetFilterListControl.getId();
			//Bind function accepts the context as the first parameter and the other parameters are passed as parameters to the function it is bound to
			aFacetFilterListHandlers[sFacetFilterListId].getSelectedFFValues().then(_updateSelectedFilterFor.bind(null, oFacetFilterListControl));
		});
	}
	/**
	 * @private
	 * @function
	 * @name sap.apf.ui.reuse.controller.facetFilter#_populateAndSelectFFListValuesFor
	 * @param oFacetFilterListControl : facet filter list control [Passed from bind function] Example : sap.m.FacetFilterList,
	 * 	      {array} aFilterValues : Filter values for the facet filter list control [Resolved from promise]
	 * 				  Example : [ {
									"key" : "20000101",
									"text" : "1/1/2000",
									"selected" : false
								}, {
									"key" : "20000201",
									"text" : "2/1/2000",
									"selected" : false
								} ]
	 * @description Sets the data in the model for the filter control
	 * It also gets the selected values for the filter control and sets them
	 * */
	function _populateAndSelectFFListValuesFor(oFacetFilterListControl, aFilterValues) {
		var sFacetFilterListId = oFacetFilterListControl.getId();
		var oFacetFilterListModel = oFacetFilterListControl.getModel();
		//Modify the  size limit of the model based on the length of the data so that all values are shown in the facet filter list.
		oFacetFilterListModel.setSizeLimit(aFilterValues.length);
		/* 
		 * Workaround FIX for incident 1580037010 - sap.m.FacetFilterList(To date list) on search selects all items bound to it
		 * Set growing threshold for only single select lists
		 */
		if (!oFacetFilterListControl.getMultiSelect()) {
			oFacetFilterListControl.setGrowingThreshold(aFilterValues.length);
		}
		//Updates the facet filter list with the values
		oFacetFilterListModel.setData(aFilterValues);
		oFacetFilterListModel.updateBindings();
		//After populating values for the list, fetch the selected values then update on the control
		//Bind function accepts the context as the first parameter and the other parameters are passed as parameters to the function it is bound to
		aFacetFilterListHandlers[sFacetFilterListId].getSelectedFFValues().then(_updateSelectedFilterFor.bind(null, oFacetFilterListControl));
	}
	/**
	 * @private
	 * @function
	 * @name sap.apf.ui.reuse.controller.facetFilter#_removeFFListOnError
	 * @param oFacetFilterListControl : facet filter list control [Passed from bind function] Example : sap.m.FacetFilterList
	 * @description Gets the facet filter control if get values failed
	 * It removes the filter from the UI
	 * */
	function _removeFFListOnError(oFacetFilterListControl) {
		var oController = this;
		oController.getView().byId("idAPFFacetFilter").removeList(oFacetFilterListControl);
	}
	/**
	 * @private
	 * @function
	 * @name sap.apf.ui.reuse.controller.facetFilter#_updateSelectedValuesForFFList
	 * @param {Array} Facet filter list data
	 * 		  Example : [ {
							"key" : "20000101",
							"text" : "1/1/2000",
							"selected" : false
						}, {
							"key" : "20000201",
							"text" : "2/1/2000",
							"selected" : false
						} ],
	 * 		  {Array} Selected filter value keys Example : [ "20000201" ]
	 * @description Updates the facet filter list items with the selections
	 * @returns {Array} of facet filter list data with updated selections
	 * 			 Example : [ {
							"key" : "20000101",
							"text" : "1/1/2000",
							"selected" : false
						}, {
							"key" : "20000201",
							"text" : "2/1/2000",
							"selected" : true
						} ]
	 * */
	function _updateSelectedValuesForFFList(aFacetFilterListData, oFFSelectedValues) {
		var index;
		//First we make the selected value of all items as false
		aFacetFilterListData.forEach(function(oFacetFilterListData) {
			oFacetFilterListData.selected = false;
		});
		//Now we update only the items to be selected. This is not done if all values are to be selected.
		if (aFacetFilterListData.length !== oFFSelectedValues.length) {
			oFFSelectedValues.forEach(function(oFFSelectedValue) {
				for(index = 0; index < aFacetFilterListData.length; index++) {
					if (oFFSelectedValue === aFacetFilterListData[index].key) {
						aFacetFilterListData[index].selected = true;
						break;
					}
				}
			});
		}
		return aFacetFilterListData;
	}
	/**
	 * @private
	 * @function
	 * @name sap.apf.ui.reuse.controller.facetFilter#_updateSelectedFilterFor
	 * @param oFacetFilterListControl : facet filter list control [Passed from bind function] Example : sap.m.FacetFilterList,
	 * 		  {Array} aSelectedFilterValues : Selected filter values/keys for the facet filter list control [Resolved from promise] Example : [ "20000201" ]
	 * @description Sets the data in the model for the filter control
	 * */
	function _updateSelectedFilterFor(oFacetFilterListControl, aSelectedFilterValues) {
		var sFacetFilterListId = oFacetFilterListControl.getId();
		var oFacetFilterListModel = oFacetFilterListControl.getModel();
		var aFacetFilterListDataSet = oFacetFilterListModel.getData();
		/*
		 * Caching the selected values for later updates( to compare and check whether changes were made)
		 */
		aCachedSelectedKeys[sFacetFilterListId] = aSelectedFilterValues;
		//Updates the facet filter list data with the selected values
		aFacetFilterListDataSet = _updateSelectedValuesForFFList(aFacetFilterListDataSet, aSelectedFilterValues);
		oFacetFilterListModel.setData(aFacetFilterListDataSet);
		oFacetFilterListModel.updateBindings();
	}
	sap.ui.controller("sap.apf.ui.reuse.controller.facetFilter", {
		/**
		 * @public
		 * @function
		 * @name sap.apf.ui.reuse.controller.facetFilter#onInit
		 * @description Called on initialization of the view
		 * Instantiates all facet filter list handlers
		 * Populates and selects the filter values
		 * */
		onInit : function() {
			var oController = this, sFacetFilterListId;
			bSelectionChanged = false;
			var oViewData = oController.getView().getViewData();
			/*
			 * Creation of a facetFilterListHandler for each facet filter list
			 * Key of each facetFilterListhandler is the ID of the facet filter list control
			 */
			oViewData.aConfiguredFilters.forEach(function(oConfiguredFilter, nIndex) {
				sFacetFilterListId = oController.getView().byId("idAPFFacetFilter").getLists()[nIndex].getId();
				aFacetFilterListHandlers[sFacetFilterListId] = new sap.apf.ui.utils.FacetFilterListHandler(oViewData.oCoreApi, oViewData.oUiApi, oConfiguredFilter, oFacetFilterListConverter);
			});
			oController.populateAndSelectFFListValues();
		},
		/**
		 * @public
		 * @function
		 * @name sap.apf.ui.reuse.controller.facetFilter#populateAndSelectFFListValues
		 * @description Fetches filter values for all facet filter list controls. Later fetches the selected values for the control and updates
		 * */
		populateAndSelectFFListValues : function() {
			var oController = this, sFacetFilterListId;
			var aFacetFilterListControls = oController.getView().byId("idAPFFacetFilter").getLists();
			aFacetFilterListControls.forEach(function(oFacetFilterListControl) {
				sFacetFilterListId = oFacetFilterListControl.getId();
				/*
				 * For each facet filter list, fetch the values then populate the values on the control
				 * If fetch of values failed remove the facet filter list from UI
				 */
				//Bind function accepts the context as the first parameter and the other parameters are passed as parameters to the function it is bound to
				aFacetFilterListHandlers[sFacetFilterListId].getFacetFilterListData().then(_populateAndSelectFFListValuesFor.bind(null, oFacetFilterListControl), _removeFFListOnError.bind(oController, oFacetFilterListControl));
			});
		},
		/**
		 * @public
		 * @function
		 * @name sap.apf.ui.reuse.controller.facetFilter#onListClose
		 * @param {oEvent} List Close Event
		 * @description Sets the selected values on the filter and calls the selection changed event
		 * */
		onListClose : function(oEvent) {
			var oController = this;
			var oClosedListControl = oEvent.getSource();
			var bIsAllSelected = oEvent.getParameter('allSelected');
			var aSelectedKeys = [], aSelectedItems, sClosedListId, aCachedSelections, sSortedSelectedKeys, sSortedCachedSelections, bFilterChanged;
			//Fetch all item keys from the control if 'All' was selected
			if (bIsAllSelected) {
				aSelectedItems = oClosedListControl.getItems();
				if (!jQuery.isEmptyObject(aSelectedItems)) {
					aSelectedKeys = aSelectedItems.map(function(oData) {
						return oData.getKey();
					});
				}
			} else {//Fetch only the selected item keys from the control
				aSelectedItems = oClosedListControl.getSelectedItems();
				aSelectedKeys = aSelectedItems.map(function(oItem) {
					return oItem.getKey();
				});
			}
			//Compare current selections with cache.
			sClosedListId = oClosedListControl.getId();
			aCachedSelections = aCachedSelectedKeys[sClosedListId];
			if (aSelectedKeys.length !== 0 && aCachedSelections !== undefined) {
				sSortedSelectedKeys = JSON.stringify(aSelectedKeys.sort());
				sSortedCachedSelections = JSON.stringify(aCachedSelections.sort());
				bFilterChanged = (sSortedSelectedKeys === sSortedCachedSelections);
				//After comparison of cached and current selections, if filters changed update the cached keys and set the selected keys on the filter
				if (!bFilterChanged) {
					aCachedSelectedKeys[sClosedListId] = aSelectedKeys;
					//Boolean is set to true since there was a change in selections of facet filter list
					bSelectionChanged = true;
					aFacetFilterListHandlers[sClosedListId].setSelectedFFValues(aSelectedKeys);
					//Trigger selection changed to update path
					oController.getView().getViewData().oUiApi.selectionChanged(true);
				}
			}
		},
		/**
		 * @public
		 * @function
		 * @name sap.apf.ui.reuse.controller.facetFilter#onResetPress
		 * @description Reset the initial filter for all the facet filter list controls and triggers update of selected values on control
		 * */
		onResetPress : function() {
			// this to the current function is the controller object passed from the view
			var oController = this;
			//Check to see if there is any change in initial state of facet filter
			if (bSelectionChanged) {
				oController.getView().getViewData().oStartFilterHandler.resetVisibleStartFilters();
				//Calling _updateSelectedFFListValues with the controller context
				_updateSelectedFFListValues(oController);
				//Trigger selection changed to update path
				oController.getView().getViewData().oUiApi.selectionChanged(true);
				//Boolean is reset after facet filter lists are reset to initial state
				bSelectionChanged = false;
			}
		}
	});
}());