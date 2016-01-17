define([],function(){

	function _capitalize(sName) {
		return sName.charAt(0).toUpperCase() + sName.slice(1);
	}

	var rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
	var mSingular = {'children' : -3, 'ies' : 'y', 'ves' : 'f', 'oes' : -2, 'ses' : -2, 'ches' : -2, 'shes' : -2, 'xes' : -2, 's' : -1 };

	function _guessSingularName(sName) {
		return sName.replace(rPlural, function($,sPlural) {
			var vRepl = mSingular[sPlural.toLowerCase()];
			return typeof vRepl === "string" ? vRepl : sPlural.slice(0,vRepl);
		});
	}
	
	/*	Property */
	function Property(name,info) {
		this.aAccessors = {};
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
/*		this.type = info.type || 'string';
		this.group = info.group || 'Misc';
		this.defaultValue = info.defaultValue !== null ? info.defaultValue : null;
		this.deprecated = !!info.deprecated || false;
		this.visibility = 'public';
		this._iKind = Kind.PROPERTY;
*/
		this.bindable = !!info.bindable;
		var N = _capitalize(name);
		this._sMutator = 'set' + N; this.aAccessors._set = this._sMutator;
		this._sGetter = 'get' + N; this.aAccessors._get = this._sGetter;
		if ( this.bindable ) {
			this._sBind =  'bind' + N; this.aAccessors._bind = this._sBind;
			this._sUnbind = 'unbind' + N; this.aAccessors._unbind = this._sUnbind;
		} else {
			this._sBind =
			this._sUnbind = undefined;
		}
	}

	Property.prototype.getAccessors = function() {
		return Object.keys(this.aAccessors);
	};

	Property.prototype.getGetterName = function() {
		return this._sGetter;
	};

	Property.prototype.getSetterName = function() {
		return this._sMutator;
	};

	Property.prototype.getBindName = function() {
		return this._sBind;
	};

	Property.prototype.getUnbindName = function() {
		return this._sUnbind;
	};

	/*	Event */
	function Event(name, info) {
		this.aAccessors = {};
		this.name = name;
/*		this.allowPreventDefault = info.allowPreventDefault || false;
		this.deprecated = info.deprecated || false;
		this.visibility = 'public';
		this.allowPreventDefault = !!info.allowPreventDefault;
		this.enableEventBubbling = !!info.enableEventBubbling;
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = 'event:' + name;
*/
		//this._iKind = Kind.EVENT;
		var N = _capitalize(name);
		this._sMutator = 'attach' + N; this.aAccessors._attach = this._sMutator;
		this._sDetachMutator = 'detach' + N; this.aAccessors._detach = this._sDetachMutator;
		this._sTrigger = 'fire' + N; this.aAccessors._fire = this._sTrigger;		
	}
	
	Event.prototype.getAccessors = function() {
		return Object.keys(this.aAccessors);
	};

	Event.prototype.getAttachName = function() {
		return this._sMutator;
	};
	
	Event.prototype.getDetachName = function() {
		return this._sDetachMutator;
	};

	Event.prototype.getFireName = function() {
		return this._sTrigger;
	};
	
	/*	Aggregation */
	function Aggregation(name, info) {
		this.aAccessors = {};
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
/*		this.type = info.type || 'sap.ui.core.Control';
		this.altTypes = info.altTypes || undefined;
		this.deprecated = info.deprecated || false;
		this.visibility = info.visibility || 'public';
		this._doesNotRequireFactory = !!info._doesNotRequireFactory; // TODO clarify if public
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = 'aggregation:' + name;
		this._iKind = this.multiple ? Kind.MULTIPLE_AGGREGATION : Kind.SINGLE_AGGREGATION;
*/
		this.bindable = !!info.bindable;
		this.multiple = typeof info.multiple === 'boolean' ? info.multiple : true;
		this.singularName = this.multiple ? info.singularName || _guessSingularName(name) : undefined;
		var N = _capitalize(name);
		this._sGetter = 'get' + N; this.aAccessors._get = this._sGetter;
		if ( this.multiple ) {
			var N1 = _capitalize(this.singularName);
			this._sMutator = 'add' + N1; this.aAccessors._add = this._sMutator;
			this._sInsertMutator = 'insert' + N1; this.aAccessors._insert = this._sInsertMutator;
			this._sRemoveMutator = 'remove' + N1; this.aAccessors._remove = this._sRemoveMutator;
			this._sRemoveAllMutator = 'removeAll' + N; this.aAccessors._removeAll = this._sRemoveAllMutator;
			this._sIndexGetter = 'indexOf' + N1; this.aAccessors._indexOf = this._sIndexGetter;
		} else {
			this._sMutator = 'set' + N; this.aAccessors._set = this._sMutator;
			this._sInsertMutator =
			this._sRemoveMutator =
			this._sRemoveAllMutator =
			this._sIndexGetter = undefined;
		}
		this._sDestructor = 'destroy' + N;	this.aAccessors.destroy = this._sDestructor;	
		if ( this.bindable ) {
			this._sBind = 'bind' + N;	this.aAccessors.bind = this._sBind;
			this._sUnbind = 'unbind' + N;	this.aAccessors.unbind = this._sUnbind;
		} else {
			this._sBind =
			this._sUnbind = undefined;
		}	}
	
	Aggregation.prototype.getAccessors = function() {
		return Object.keys(this.aAccessors);
	};

	Aggregation.prototype.getGetterName = function() {
		return 	this._sGetter;
	};

	Aggregation.prototype.getSetterName = function() {
		return 	this._sMutator;
	};

	Aggregation.prototype.getAddName = function() {
		return 	this._sMutator;
	};

	Aggregation.prototype.getInsertName = function() {
		return 	this._sInsertMutator;
	};

	Aggregation.prototype.getRemoveName = function() {
		return 	this._sRemoveMutator;
	};

	Aggregation.prototype.getRemoveAllName = function() {
		return 	this._sRemoveAllMutator;
	};

	Aggregation.prototype.getDestroyName = function() {
		return 	this._sDestructor;
	};

	Aggregation.prototype.getIndexOfName = function() {
		return 	this._sIndexGetter;
	};

	Aggregation.prototype.getBindName = function() {
		return this._sBind;
	};

	Aggregation.prototype.getUnbindName = function() {
		return this._sUnbind;
	};

	/*	Association */
	function Association(name, info) {
		this.aAccessors = {};
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
/*		this.type = info.type || 'sap.ui.core.Control';
		this.deprecated = info.deprecated || false;
		this.visibility = 'public';
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = 'association:' + name;
		this._iKind = this.multiple ? Kind.MULTIPLE_ASSOCIATION : Kind.SINGLE_ASSOCIATION;
*/
		this.multiple = info.multiple || false;
		this.singularName = this.multiple ? info.singularName || _guessSingularName(name) : undefined;
		var N = _capitalize(name);
		this._sGetter = 'get' + N;	this.aAccessors._get = this._sGetter;
		if ( this.multiple ) {
			var N1 = _capitalize(this.singularName);
			this._sMutator = 'add' + N1;	this.aAccessors._add = this._sMutator;
			this._sRemoveMutator = 'remove' + N1;	this.aAccessors._remove = this._sRemoveMutator;
			this._sRemoveAllMutator = 'removeAll' + N1; this.aAccessors._removeAll = this._sRemoveAllMutator;
		} else {
			this._sMutator = 'set' + N; this.aAccessors._set = this._sMutator;
			this._sRemoveMutator =
			this._sRemoveAllMutator = undefined;
		}
	}

	Association.prototype.getAccessors = function() {
		return Object.keys(this.aAccessors);
	};

	Association.prototype.getGetterName = function() {
		return 	this._sGetter;
	};

	Association.prototype.getSetterName = function() {
		return 	this._sMutator;
	};

	Association.prototype.getAddName = function() {
		return 	this._sMutator;
	};

	Association.prototype.getRemoveName = function() {
		return 	this._sRemoveMutator;
	};

	Association.prototype.getRemoveAllName = function() {
		return 	this._sRemoveAllMutator;
	};

	function toSingularParam(sParamName) {
		return _guessSingularName(sParamName);
	}

	return {
		Property: Property,
		Event: Event,
		Aggregation: Aggregation,
		Association: Association,
		toSingularParam : toSingularParam
	};
});