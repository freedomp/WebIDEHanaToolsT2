/* based on commit 
 * ed4089fb1e5d8b06a17fb28cceb49c7fe1d0f29c CDS: Add Parameter Bindings into AST model
 */
/*eslint-disable quotes*/
define(
    ["require", "commonddl/astmodel/SourceRangeImpl", "rndrt/rnd"
    ], //dependencies
    function (require, SourceRangeImpl, rnd) {
        var Utils = rnd.Utils;

        function DataSourceImpl() {
            SourceRangeImpl.call(this);
        }
        DataSourceImpl.prototype = Object.create(SourceRangeImpl.prototype);
        DataSourceImpl.NAME_EDEFAULT = null;
        DataSourceImpl.prototype.namePathExpression = null;
        DataSourceImpl.ALIAS_EDEFAULT = null;
        DataSourceImpl.ALIAS_TOKEN_EDEFAULT = null;
        DataSourceImpl.prototype.aliasToken = DataSourceImpl.ALIAS_TOKEN_EDEFAULT;
        DataSourceImpl.PRIMARY_EDEFAULT = false;
        DataSourceImpl.CACHED_DATA_SOURCE_TYPE_EDEFAULT = null;
        DataSourceImpl.prototype.constructor = DataSourceImpl;
        DataSourceImpl.prototype.getName = function () {
            var pe = this.getNamePathExpression();
            /*eslint-disable no-eq-null*/
            if (pe != null) {
                return pe.getPathString(false);
            }
            return null;
        };
        DataSourceImpl.prototype.getNamePathExpression = function () {
            return this.namePathExpression;
        };
        DataSourceImpl.prototype.basicSetNamePathExpression = function (newNamePathExpression, msgs) {
            var oldNamePathExpression = this.namePathExpression;
            this.namePathExpression = newNamePathExpression;
            this.namePathExpression.parent = this;
            return msgs;
        };
        DataSourceImpl.prototype.setNamePathExpression = function (newNamePathExpression) {
            if (newNamePathExpression !== this.namePathExpression) {
                this.basicSetNamePathExpression(newNamePathExpression);
            }
        };
        DataSourceImpl.prototype.getAlias = function () {
            var at = this.getAliasToken();
            /*eslint-disable no-eq-null*/
            if (at != null) {
                return at.m_lexem;
            }
            return null;
        };
        DataSourceImpl.prototype.getAliasToken = function () {
            return this.aliasToken;
        };
        DataSourceImpl.prototype.setAliasToken = function (newAliasToken) {
            var oldAliasToken = this.aliasToken;
            this.aliasToken = newAliasToken;
        };
        DataSourceImpl.prototype.getParentJoin = function () {
            var JoinDataSourceImpl = require("commonddl/astmodel/JoinDataSourceImpl");
            if (this instanceof JoinDataSourceImpl) {
                return null;
            }
            var parent = this.eContainer();
            if (parent instanceof JoinDataSourceImpl) {
                return parent;
            }
            return null;
        };
        DataSourceImpl.prototype.basicGetParentJoin = function () {
            return this.getParentJoin();
        };
        DataSourceImpl.prototype.isPrimary = function () {
            return true;
        };
        DataSourceImpl.removeQuotes = function(name) {
            /*eslint-disable no-eq-null*/
            if (name == null) {
                return null;
            }
            var result = new rnd.StringBuffer(name);
            var inQuote = false;
            for (var i = name.length - 1; i >= 0; i--) {
                var c = name.charAt(i);
                if (c === '"') {
                    var prev = i > 0 ? name.charAt(i - 1) : ' ';
                    var next = i >= name.length - 1 ? '.' : name
                            .charAt(i + 1);
                    if (inQuote === false && next === ':') {
                        var nextNext = i + 2 >= name.length ? ':' : name
                                .charAt(i + 2);
                        if (nextNext === ':') {
                            inQuote = true;
                            result.replace(i, i + 1, "");
                        }
                    } else if (inQuote === false && next === '.') {
                        inQuote = true;
                        result.replace(i, i + 1, "");
                    } else if (inQuote === false && next !== '.' && i === 0) {
                        result.replace(i, i + 1, "");
                    } else if (inQuote && prev === '"') {
                        result.replace(i, i + 1, "");
                        i--;
                    } else if (inQuote && prev !== '"') {
                        inQuote = false;
                        result.replace(i, i + 1, "");
                    }
                }
            }
            return result.toString();
        };
        DataSourceImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer();
            /*eslint-disable no-eq-null*/
            if (this.namePathExpression != null) {
                result.append(" (nameToken: ");
                result.append(this.getName());
            }
            /*eslint-disable no-eq-null*/
            if (this.aliasToken != null) {
                result.append(", aliasToken: ");
                result.append(this.aliasToken.m_lexem);
            }
            result.append(")");
            return result.toString();
        };
        return DataSourceImpl;
    }
);