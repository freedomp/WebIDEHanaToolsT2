// based on commit
//55a1d9e93c70630ca0b6273c708f4dd30f79f21e Adopting Mass enabled API
define([], //dependencies
function() {
	function DdlColumnSelectListEntry() {
	}
	
	DdlColumnSelectListEntry.prototype.name = "";
	DdlColumnSelectListEntry.prototype.type = {};
	DdlColumnSelectListEntry.prototype.setName = function(name) {
		this.name = name;
	};
	DdlColumnSelectListEntry.prototype.getName = function() {
		return this.name;
	};
	DdlColumnSelectListEntry.prototype.setType = function(type) {
		this.type = type;
	};
	DdlColumnSelectListEntry.prototype.getType = function() {
		return this.type;
	};
	return DdlColumnSelectListEntry;
});