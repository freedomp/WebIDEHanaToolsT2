/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    ["commonddl/astmodel/IAstFactory",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/EObjectImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "rndrt/rnd",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/AssociationDeclarationImpl",
        "commonddl/astmodel/PathEntryImpl"
    ], //dependencies
    function (IAstFactory, ExpressionImpl, EObjectContainmentEList, ViewSelectImpl, EObjectImpl, JoinDataSourceImpl, rnd, DataSourceImpl, AssociationDeclarationImpl, PathEntryImpl) {
        var Utils = rnd.Utils;

        function PathExpressionImpl() {
            ExpressionImpl.call(this);
        }

        PathExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        PathExpressionImpl.prototype.constructor = PathExpressionImpl;
        PathExpressionImpl.prototype.pathEntries = null;
        PathExpressionImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT = null;
        PathExpressionImpl.prototype.lastNamespaceComponentIndex = PathExpressionImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT;
        PathExpressionImpl.TABLE_NAME_EDEFAULT = null;
        PathExpressionImpl.IDENTIFIER_EDEFAULT = null;
        PathExpressionImpl.TABLE_NAME_TOKEN_EDEFAULT = null;
        PathExpressionImpl.IDENTIFIER_TOKEN_EDEFAULT = null;
        PathExpressionImpl.prototype.getPathEntries = function () {
            if (this.pathEntries == null) {
                this.pathEntries = new EObjectContainmentEList(this);
            }
            return this.pathEntries;
        };
        PathExpressionImpl.prototype.getLastNamespaceComponentIndex = function () {
            return this.lastNamespaceComponentIndex;
        };
        PathExpressionImpl.prototype.setLastNamespaceComponentIndex = function (newLastNamespaceComponentIndex) {
            var oldLastNamespaceComponentIndex = this.lastNamespaceComponentIndex;
            this.lastNamespaceComponentIndex = newLastNamespaceComponentIndex;
        };
        PathExpressionImpl.prototype.getTableName = function () {
            var tableNameToken = this.getTableNameToken();
            if (tableNameToken != null) {
                return tableNameToken.m_lexem;
            } else {
                return null;
            }
        };
        PathExpressionImpl.prototype.getIdentifier = function () {
            var identifierToken = this.getIdentifierToken();
            if (identifierToken != null) {
                return identifierToken.m_lexem;
            } else {
                return null;
            }
        };
        PathExpressionImpl.prototype.getTableNameToken = function () {
            var entries = this.getPathEntries();
            if (entries.length == 1 || Utils.arrayIsEmpty(entries)) {
                return null;
            }
            if (entries.length == 2) {
                var secondEntry = entries[0];
                if (secondEntry instanceof PathEntryImpl) {
                    var entry = secondEntry;
                    return entry.getNameToken();
                }
            }
            return null;
        };
        PathExpressionImpl.prototype.getIdentifierToken = function () {
            var entries = this.getPathEntries();
            var idEntry = null;
            if (entries.length == 1) {
                idEntry = entries[0];
            } else if (entries.length == 2) {
                idEntry = entries[1];
            } else if (Utils.arrayIsEmpty(entries)) {
                return null;
            }
            if (idEntry != null) {
                if (idEntry instanceof PathEntryImpl) {
                    var entry = idEntry;
                    return entry.getNameToken();
                }
            }
            return null;
        };
        PathExpressionImpl.prototype.toString = function () {
            return this.getPathString(true);
        };
        PathExpressionImpl.prototype.getPathString = function (withFilters) {
            return ExpressionImpl.getPathString(this.getEntries(), withFilters);
        };
        PathExpressionImpl.prototype.getEntries = function () {
            return ExpressionImpl.getEntries(this.getPathEntries());
        };
        return PathExpressionImpl;
    }
);