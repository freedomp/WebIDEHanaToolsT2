// based on commit
//e3f9c257a2b706a485b86bfe8f9254a02bb4cc92 DDL: improve EMF model for table-function
/*eslint-disable max-params,max-len*/
define([ "commonddl/astmodel/AbstractAnnotationImpl", "commonddl/astmodel/AnnotatedImpl", "commonddl/astmodel/DdlStatementImpl", "commonddl/astmodel/EObjectContainmentEList", "commonddl/astmodel/ParameterImpl",
		"commonddl/astmodel/ReturnStructureImpl", "rndrt/rnd" ], // dependencies
function(AbstractAnnotationImpl, AnnotatedImpl, DdlStatementImpl, EObjectContainmentEList, ParameterImpl, ReturnStructureImpl, rnd) {
	var Utils = rnd.Utils;
	function TableFunctionImpl() {
		DdlStatementImpl.call(this);
	}
	TableFunctionImpl.prototype = Object.create(DdlStatementImpl.prototype);
	TableFunctionImpl.prototype.annotationList = null;
	TableFunctionImpl.prototype.importingParameters = null;
	TableFunctionImpl.prototype.implementedBy = null;
	TableFunctionImpl.prototype.returnStructure = null;
	TableFunctionImpl.prototype.constructor = TableFunctionImpl;
	TableFunctionImpl.prototype.getAnnotationList = function() {
		/*eslint-disable no-eq-null*/
		if (this.annotationList == null) {
			this.annotationList = [];
		}
		return this.annotationList;
	};
	TableFunctionImpl.prototype.getImportingParameters = function() {
		/*eslint-disable no-eq-null*/
		if (this.importingParameters == null) {
			this.importingParameters = new EObjectContainmentEList(this);
		}
		return this.importingParameters;
	};
	TableFunctionImpl.prototype.getImplementedBy = function() {
		return this.implementedBy;
	};
	TableFunctionImpl.prototype.basicSetImplementedBy = function(newImplementedBy, msgs) {
		var oldImplementedBy = this.implementedBy;
		this.implementedBy = newImplementedBy;
		return msgs;
	};
	TableFunctionImpl.prototype.setImplementedBy = function(newImplementedBy) {
		if (newImplementedBy !== this.implementedBy) {
			this.basicSetImplementedBy(newImplementedBy);
		}
	};
	TableFunctionImpl.prototype.getImplementation = function() {
		var node = this.getImplementedBy();
		/*eslint-disable no-eq-null*/
		if (node != null) {
			return node.getMethod();
		}
		return null;
	};
	TableFunctionImpl.prototype.basicSetImplementation = function(newImplementation, msgs) {
		throw new Error();
	};
	TableFunctionImpl.prototype.setImplementation = function(newImplementation) {
		var node = this.getImplementedBy();
		/*eslint-disable no-eq-null*/
		if (node == null) {
			var IAstFactory = require("commonddl/astmodel/IAstFactory");
			node = IAstFactory.eINSTANCE.createImplementedBy();
			this.setImplementedBy(node);
		}
		node.setMethod(newImplementation);
	};
	TableFunctionImpl.prototype.getReturnStructure = function() {
		return this.returnStructure;
	};
	TableFunctionImpl.prototype.basicGetReturnStructure = function() {
		return this.returnStructure;
	};
	TableFunctionImpl.prototype.setReturnStructure = function(newReturnStructure) {
		var oldReturnStructure = this.returnStructure;
		this.returnStructure = newReturnStructure;
	};
	return TableFunctionImpl;
	}
);