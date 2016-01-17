// based on commit
//55ea59383636e4da55cb7bb8fbed6bb48b049245 AST nodes for table functions
define([ "commonddl/astmodel/AbstractAnnotationImpl", "commonddl/astmodel/AnnotatedImpl", "commonddl/astmodel/ReturnStructureImpl", "rndrt/rnd" ], // dependencies
function(AbstractAnnotationImpl, AnnotatedImpl, ReturnStructureImpl,rnd) {
	var Token = rnd.Token;
	var Utils = rnd.Utils;
	var StringBuffer = rnd.StringBuffer;
	function ReturnStructureNameImpl() {
		ReturnStructureImpl.call(this);
	}
	ReturnStructureNameImpl.prototype = Object.create(ReturnStructureImpl.prototype);
	ReturnStructureNameImpl.prototype.annotationList = null;
	ReturnStructureNameImpl.NAME_EDEFAULT = null;
	ReturnStructureNameImpl.prototype.name = ReturnStructureNameImpl.NAME_EDEFAULT;
	ReturnStructureNameImpl.prototype.constructor = ReturnStructureNameImpl;
	ReturnStructureNameImpl.prototype.getAnnotationList = function() {
		/*eslint-disable no-eq-null*/
		if (this.annotationList == null) {
			this.annotationList = [];
		}
		return this.annotationList;
	};
	ReturnStructureNameImpl.prototype.getName = function() {
		return this.name;
	};
	ReturnStructureNameImpl.prototype.setName = function(newName) {
		var oldName = this.name;
		this.name = newName;
	};
	ReturnStructureNameImpl.prototype.toString = function() {
		var result = new StringBuffer(ReturnStructureImpl.prototype.toString.call(this));
		result.append(" (name: ");
		result.append(this.name);
		result.append(")");
		return result.toString();
	};
	return ReturnStructureNameImpl;
});