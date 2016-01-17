/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/table/Table", "sap/m/Table", "sap/ui/comp/smarttable/SmartTable"], function(Object, Table, ResponsiveTable, SmartTable) {
	"use strict";

	var ViewUtil = Object.extend("sap.ui.generic.template.ViewUtil",{
        metadata : {
            properties : {}
        }
	});
	
	/**
	 * Returns a parental table of the given element or null
	 * 
	 * @param {sap.ui.core.Element} oSourceControl The element where to start searching for a parental table
	 * @returns {sap.ui.table.Table|sap.m.Table|sap.ui.comp.smarttable.SmartTable} The parent table or null
	 * @public
	 */
	ViewUtil.getParentTable = function(oSourceControl){
		var oCurrentControl = oSourceControl;
		while (oCurrentControl) {
				if (oCurrentControl instanceof ResponsiveTable || oCurrentControl instanceof Table || oCurrentControl instanceof SmartTable) {
					return oCurrentControl;
				}
				
				if (oCurrentControl.getParent){
					oCurrentControl = oCurrentControl.getParent();
				} else {
					return null;
				} 

			}		
		return null;
	};
	
	/**
	 * Returns the binding of the given table
	 * 
	 * @param {sap.ui.table.Table|sap.m.Table|sap.ui.comp.smarttable.SmartTable} oTable The table which's binding is to returned
	 * @returns {object} The found binding or null
	 * @public
	 */
	ViewUtil.getTableBinding = function(oTable) {
		if (oTable instanceof SmartTable) {
			oTable = oTable.getTable(); // get SmartTable's inner table first
		}
		
		if (oTable instanceof Table) {
			return oTable.getBindingInfo("rows");
		} else if (oTable instanceof ResponsiveTable) {
			return oTable.getBindingInfo("items");
		}
		
		return null;
	};
	
	return ViewUtil;

}, /* bExport= */ true);