// based on commit
//3bc91dac6997781076804328e75ac66525824c2b Association Definition refactor 
define([], // dependencies
function() {
	function DdlDataSourceInformation() {
	}

	DdlDataSourceInformation.prototype.fullyQualifiedPathName = "";
	DdlDataSourceInformation.prototype.columns = [];
	DdlDataSourceInformation.prototype.associations = [];
	DdlDataSourceInformation.prototype.parameters = [];
	DdlDataSourceInformation.prototype.setFullyQualifiedPathName = function(fullyQualifiedPathName) {
		this.fullyQualifiedPathName = fullyQualifiedPathName;
	};
	DdlDataSourceInformation.prototype.getFullyQualifiedPathName = function() {
		return this.fullyQualifiedPathName;
	};
	DdlDataSourceInformation.prototype.getColumns = function() {
		return this.columns;
	};
	DdlDataSourceInformation.prototype.getAssociations = function() {
		return this.associations;
	};
	DdlDataSourceInformation.prototype.getParameters = function() {
		return this.parameters;
	};
	return DdlDataSourceInformation;
});