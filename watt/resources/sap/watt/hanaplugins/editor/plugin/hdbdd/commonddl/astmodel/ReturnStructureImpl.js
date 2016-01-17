// based on commit
//55ea59383636e4da55cb7bb8fbed6bb48b049245 AST nodes for table functions
define([ "commonddl/astmodel/SourceRangeImpl"

], // dependencies
function(SourceRangeImpl) {
	function ReturnStructureImpl() {
		SourceRangeImpl.call(this);
	}
	ReturnStructureImpl.prototype = Object.create(SourceRangeImpl.prototype);
	ReturnStructureImpl.prototype.constructor = ReturnStructureImpl;
	return ReturnStructureImpl;
});