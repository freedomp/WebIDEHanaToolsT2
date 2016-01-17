define(function() {

	"use strict";

	function SortColumnAscCommand() {
		return this; // return this object reference
	}

	// Define the class methods.
	SortColumnAscCommand.prototype = {};

	SortColumnAscCommand.prototype.isAvailable = function(oDelegate) {
		return true;
	};

	SortColumnAscCommand.prototype.isEnabled = function(oDelegate) {
		return true;
	};

	SortColumnAscCommand.prototype.execute = function(oObject) {
		oObject.column.getParent().sort(oObject.column, sap.ui.table.SortOrder.Ascending, false);
	};

	return SortColumnAscCommand;
});
