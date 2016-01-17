/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    ["rndrt/rnd", "commonddl/astmodel/EObjectImpl","commonddl/astmodel/AbstractPathEntryImpl"], //dependencies
    function (rnd, EObjectImpl,AbstractPathEntryImpl) {
        function PathEntryImpl() {
            AbstractPathEntryImpl.call(this);
        }
        PathEntryImpl.prototype = Object.create(AbstractPathEntryImpl.prototype);
        PathEntryImpl.prototype.constructor = PathEntryImpl;
        PathEntryImpl.NAME_TOKEN_EDEFAULT = null;
        PathEntryImpl.prototype.nameToken = PathEntryImpl.NAME_TOKEN_EDEFAULT;
        PathEntryImpl.prototype.filter = null;
        PathEntryImpl.prototype.parameterBindings = null;
        PathEntryImpl.prototype.cardinalityRestriction = null;
        PathEntryImpl.prototype.getNameToken = function() {
            return this.nameToken;
        };
        PathEntryImpl.prototype.setNameToken = function(newNameToken) {
            var oldNameToken = this.nameToken;
            this.nameToken = newNameToken;
        };
        PathEntryImpl.prototype.getFilter = function() {
            return this.filter;
        };
        PathEntryImpl.prototype.basicSetFilter = function(newFilter,msgs) {
            var oldFilter = this.filter;
            this.filter = newFilter;
            this.filter.setContainer(this);
            return msgs;
        };
        PathEntryImpl.prototype.setFilter = function(newFilter) {
            if (newFilter != this.filter) {
                var msgs = null;
                if (this.filter != null) {

                }
                if (newFilter != null) {

                }
                msgs = this.basicSetFilter(newFilter,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        PathEntryImpl.prototype.getParameterBindings = function() {
            return this.parameterBindings;
        };
        PathEntryImpl.prototype.basicSetParameterBindings = function(newParameterBindings,msgs) {
            var oldParameterBindings = this.parameterBindings;
            this.parameterBindings = newParameterBindings;
            this.parameterBindings.setContainer(this);
            return msgs;
        };
        PathEntryImpl.prototype.setParameterBindings = function(newParameterBindings) {
            if (newParameterBindings != this.parameterBindings) {
                var msgs = null;
                if (this.parameterBindings != null) {

                }
                if (newParameterBindings != null) {

                }
                msgs = this.basicSetParameterBindings(newParameterBindings,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        PathEntryImpl.prototype.getCardinalityRestriction = function() {
            return this.cardinalityRestriction;
        };
        PathEntryImpl.prototype.basicSetCardinalityRestriction = function(newCardinalityRestriction,msgs) {
            var oldCardinalityRestriction = this.cardinalityRestriction;
            this.cardinalityRestriction = newCardinalityRestriction;
            this.cardinalityRestriction.setContainer(this);
            return msgs;
        };
        PathEntryImpl.prototype.setCardinalityRestriction = function(newCardinalityRestriction) {
            if (newCardinalityRestriction != this.cardinalityRestriction) {
                var msgs = null;
                if (this.cardinalityRestriction != null) {

                }
                if (newCardinalityRestriction != null) {

                }
                msgs = this.basicSetCardinalityRestriction(newCardinalityRestriction,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        PathEntryImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(AbstractPathEntryImpl.prototype.toString.call(this));
            result.append(" (nameToken: ");
            result.append(this.nameToken);
            result.append(')');
            return result.toString();
        };
        return PathEntryImpl;
    }
);