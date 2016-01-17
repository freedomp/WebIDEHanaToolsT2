// based on commit
//55ea59383636e4da55cb7bb8fbed6bb48b049245 AST nodes for table functions
define([ "commonddl/astmodel/EObjectContainmentEList", "commonddl/astmodel/ParameterImpl", "commonddl/astmodel/ReturnStructureImpl","rndrt/rnd" ], // dependencies
function(EObjectContainmentEList, ParameterImpl, ReturnStructureImpl, rnd) {
	var Utils = rnd.Utils;
	function ReturnStructureListImpl() {
		ReturnStructureImpl.call(this);
	}
	ReturnStructureListImpl.prototype = Object.create(ReturnStructureImpl.prototype);
	ReturnStructureListImpl.prototype.entries = null;
	ReturnStructureListImpl.prototype.constructor = ReturnStructureListImpl;
	ReturnStructureListImpl.prototype.getEntries = function() {
		/*eslint-disable no-eq-null*/
		if (this.entries == null) {
			this.entries = new EObjectContainmentEList(this);
		}
		return this.entries;
	};
	return ReturnStructureListImpl;
});