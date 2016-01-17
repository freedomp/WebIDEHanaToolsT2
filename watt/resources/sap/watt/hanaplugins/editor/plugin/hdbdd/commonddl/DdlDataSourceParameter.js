// based on commit
//55a1d9e93c70630ca0b6273c708f4dd30f79f21e Adopting Mass enabled API
define([], //dependencies
function() {
	function DdlDataSourceParameter() {
	}
	
	DdlDataSourceParameter.prototype.name = "";
	DdlDataSourceParameter.prototype.setName = function(name) {
		this.name = name;
	};
	DdlDataSourceParameter.prototype.getName = function() {
		return this.name;
	};
	return DdlDataSourceParameter;
});