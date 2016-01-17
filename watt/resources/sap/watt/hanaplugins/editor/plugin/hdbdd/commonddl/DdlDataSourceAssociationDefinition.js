// based on commit
//3bc91dac6997781076804328e75ac66525824c2b Association Definition refactor 
define([], // dependencies
	function() {
		function DdlDataSourceAssociationDefinition() {
		}
		DdlDataSourceAssociationDefinition.prototype.name = "";
		DdlDataSourceAssociationDefinition.prototype.associationTargetEntityName = "";
		DdlDataSourceAssociationDefinition.prototype.setName = function(name) {
			this.name = name;
		};
		DdlDataSourceAssociationDefinition.prototype.setAssociationTargetEntityName = function(associationTargetEntityName) {
			this.associationTargetEntityName = associationTargetEntityName;
		};
		DdlDataSourceAssociationDefinition.prototype.getName = function() {
			return this.name;
		};
		DdlDataSourceAssociationDefinition.prototype.getAssociationTargetEntityName = function() {
			return this.associationTargetEntityName;
		};
		return DdlDataSourceAssociationDefinition;
	}
);