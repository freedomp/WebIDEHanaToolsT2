// based on commit
// 13549d549289c4f3db4ca9c6c51ad0a81341c8df introduce onToken in AssociationDeclaration and JoinDataSource
define(
    [
        "rndrt/rnd","commonddl/astmodel/ExpressionImpl"
    ], // dependencies
    function(rnd,ExpressionImpl) {
        function AtomicExpressionImpl() {
            ExpressionImpl.call(this);
        }
        AtomicExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        AtomicExpressionImpl.TABLE_NAME_EDEFAULT = null;
        AtomicExpressionImpl.TABLE_NAME_TOKEN_EDEFAULT = null;
        AtomicExpressionImpl.prototype.tableNameToken = AtomicExpressionImpl.TABLE_NAME_TOKEN_EDEFAULT;
        AtomicExpressionImpl.IDENTIFIER_EDEFAULT = null;
        AtomicExpressionImpl.IDENTIFIER_TOKEN_EDEFAULT = null;
        AtomicExpressionImpl.prototype.identifierToken = AtomicExpressionImpl.IDENTIFIER_TOKEN_EDEFAULT;
        AtomicExpressionImpl.prototype.ddlStmt = null;
        AtomicExpressionImpl.prototype.constructor = AtomicExpressionImpl;
        AtomicExpressionImpl.prototype.getTableName = function() {
            var nt = this.getTableNameToken();
            /*eslint-disable no-eq-null*/
            if (nt != null) {
                return nt.m_lexem;
            }
            return null;
        };
        AtomicExpressionImpl.prototype.getTableNameToken = function() {
            return this.tableNameToken;
        };
        AtomicExpressionImpl.prototype.setTableNameToken = function(newTableNameToken) {
            var oldTableNameToken = this.tableNameToken;
            this.tableNameToken = newTableNameToken;
        };
        AtomicExpressionImpl.prototype.getIdentifier = function() {
            var it = this.getIdentifierToken();
            /*eslint-disable no-eq-null*/
            if (it != null) {
                return it.m_lexem;
            }
            return null;
        };
        AtomicExpressionImpl.prototype.getIdentifierToken = function() {
            return this.identifierToken;
        };
        AtomicExpressionImpl.prototype.setIdentifierToken = function(newIdentifierToken) {
            var oldIdentifierToken = this.identifierToken;
            this.identifierToken = newIdentifierToken;
        };
        AtomicExpressionImpl.prototype.getDdlStmt = function() {
            return this.ddlStmt;
        };
        AtomicExpressionImpl.prototype.basicGetDdlStmt = function() {
            return this.ddlStmt;
        };
        AtomicExpressionImpl.prototype.setDdlStmt = function(newDdlStmt) {
            var oldDdlStmt = this.ddlStmt;
            this.ddlStmt = newDdlStmt;
        };
        AtomicExpressionImpl.prototype.toString = function() {
            var t = this.getTableNameToken();
            var i = this.getIdentifierToken();
            /*eslint-disable no-eq-null*/
            if (t == null && i == null) {
                return ExpressionImpl.prototype.toString.call(this);
            }
            var result = new rnd.StringBuffer();
            /*eslint-disable no-eq-null*/
            if (t != null) {
                result.append(t.m_lexem);
            }
            /*eslint-disable no-eq-null*/
            if (i != null) {
                result.append(".").append(i.m_lexem);
            }
            return result.toString();
        };
        AtomicExpressionImpl.prototype.getShortDescription = function() {
            /*eslint-disable no-eq-null*/
            if (this.shortDescription == null) {
                var t = this.getTableNameToken();
                var i = this.getIdentifierToken();
                var result = new rnd.StringBuffer();
                /*eslint-disable no-eq-null*/
                if (t != null) {
                    result.append(t.m_lexem);
                    result.append(".");
                }
                /*eslint-disable no-eq-null*/
                if (i != null) {
                    result.append(i.m_lexem);
                }
                this.shortDescription = result.toString();
            }
            return ExpressionImpl.prototype.getShortDescription.call(this);
        };
        return AtomicExpressionImpl;
    });