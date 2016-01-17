/*eslint-disable max-params*/
define(
    [
        "rndrt/rnd", "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/SelectListEntryType", "commonddl/astmodel/SelectListImpl", "commonddl/astmodel/ViewSelectImpl", "commonddl/astmodel/ViewDefinitionImpl", "require"
    ], //dependencies
    function (rnd, SourceRangeImpl, SelectListEntryType, SelectListImpl, ViewSelectImpl, ViewDefinitionImpl, require) {
        function SelectListEntryImpl() {
            SourceRangeImpl.call(this);
        }
        SelectListEntryImpl.prototype = Object.create(SourceRangeImpl.prototype);
        SelectListEntryImpl.prototype.annotationList = null;
        SelectListEntryImpl.ALIAS_EDEFAULT = null;
        SelectListEntryImpl.ALIAS_TOKEN_EDEFAULT = null;
        SelectListEntryImpl.prototype.aliasToken = SelectListEntryImpl.ALIAS_TOKEN_EDEFAULT;
        SelectListEntryImpl.prototype.expression = null;
        SelectListEntryImpl.KEY_TOKEN_EDEFAULT = null;
        SelectListEntryImpl.prototype.keyToken = SelectListEntryImpl.KEY_TOKEN_EDEFAULT;
        SelectListEntryImpl.TYPE_EDEFAULT = SelectListEntryType.UNKOWN;
        SelectListEntryImpl.prototype.type = SelectListEntryImpl.TYPE_EDEFAULT;
        SelectListEntryImpl.PUBLIC_NAME_EDEFAULT = null;
        SelectListEntryImpl.prototype.constructor = SelectListEntryImpl;

        SelectListEntryImpl.prototype.getAnnotationList = function () {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        SelectListEntryImpl.prototype.getAlias = function () {
            var at = this.getAliasToken();
            /*eslint-disable no-eq-null*/
            if (at != null) {
                return at.m_lexem;
            }
            return null;
        };
        SelectListEntryImpl.prototype.getAliasToken = function () {
            return this.aliasToken;
        };
        SelectListEntryImpl.prototype.setAliasToken = function (newAliasToken) {
            var oldAliasToken = this.aliasToken;
            this.aliasToken = newAliasToken;
        };
        SelectListEntryImpl.prototype.getExpression = function () {
            return this.expression;
        };
        SelectListEntryImpl.prototype.basicSetExpression = function (newExpression, msgs) {
            var oldExpression = this.expression;
            this.expression = newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        SelectListEntryImpl.prototype.setExpression = function (newExpression) {
            var oldExpression = this.expression;
            this.expression = newExpression;
            this.expression.setParent(this);
        };
        SelectListEntryImpl.prototype.getKeyToken = function () {
            return this.keyToken;
        };
        SelectListEntryImpl.prototype.setKeyToken = function (newKeyToken) {
            var oldKeyToken = this.keyToken;
            this.keyToken = newKeyToken;
        };
        SelectListEntryImpl.prototype.getType = function () {
            return this.type;
        };
        SelectListEntryImpl.prototype.setType = function (newType) {
            var oldType = this.type;
            /*eslint-disable no-eq-null*/
            this.type = newType == null ? SelectListEntryImpl.TYPE_EDEFAULT : newType;
        };
        SelectListEntryImpl.prototype.getPublicName = function () {
            var prnt = this.eContainer();
            if (prnt instanceof SelectListImpl) {
                var prnt2 = prnt.eContainer();
                if (prnt2 instanceof ViewSelectImpl) {
                    var prnt3 = prnt2.eContainer();
                    /*eslint-disable no-eq-null*/
                    while ((prnt3 != null) && !(prnt3 instanceof ViewDefinitionImpl)) {
                        prnt3 = prnt3.eContainer();
                    }
                    if (prnt3 instanceof ViewDefinitionImpl) {
                        var names = (prnt3).getNames();
                        /*eslint-disable no-eq-null*/
                        if (names != null) {
                            var list = names.getViewColumnNames();
                            /*eslint-disable no-eq-null*/
                            if (list != null) {
                                var entries = (prnt).getEntries();
                                var index = entries.indexOf(this);
                                if (list.length >= index + 1) {
                                    var coln = list[index];
                                    /*eslint-disable no-eq-null*/
                                    if (coln != null) {
                                        return coln.getName();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var alias = this.getAlias();
            /*eslint-disable no-eq-null*/
            if ((alias != null) && alias.length > 0) {
                return alias;
            }
            var expr = this.getExpression();
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
            if (expr instanceof PathExpressionImpl) {
                return (expr).getPathString(false);
            }
            return this.getExpression().getShortDescription();
        };
        SelectListEntryImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer();
            result.append(" (aliasToken: ");
            result.append(this.aliasToken);
            result.append(")");
            result.append(" (expression: ");
            result.append(this.getExpression());
            result.append(")");
            return result.toString();
        };
        return SelectListEntryImpl;
    }
);