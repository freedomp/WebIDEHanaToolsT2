define(function() {

	"use strict";

	function SortColumnDesCommand() {
		return this; // return this object reference
	}

	// Define the class methods.
	SortColumnDesCommand.prototype = {};

	SortColumnDesCommand.prototype.isAvailable = function(oDelegate) {
		return true;
	};

	SortColumnDesCommand.prototype.isEnabled = function(oDelegate) {
		return true;
	};

	SortColumnDesCommand.prototype.execute = function(oObject) {
		oObject.column.getParent().sort(oObject.column, sap.ui.table.SortOrder.Descending, false);
	};

	return SortColumnDesCommand;
});
