/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    ["commonddl/astmodel/DdlStatementImpl", "rndrt/rnd"], //dependencies
    function (DdlStatementImpl, rnd) {
        function UsingDirectiveImpl() {
            DdlStatementImpl.call(this);
        }
        UsingDirectiveImpl.prototype = Object.create(DdlStatementImpl.prototype);
        UsingDirectiveImpl.prototype.constructor = UsingDirectiveImpl;
        UsingDirectiveImpl.ALIAS_EDEFAULT = null;
        UsingDirectiveImpl.prototype.alias = UsingDirectiveImpl.ALIAS_EDEFAULT;
        UsingDirectiveImpl.prototype.getAlias = function() {
            return this.alias;
        };
        UsingDirectiveImpl.prototype.setAlias = function(newAlias) {
            var oldAlias = this.alias;
            this.alias = newAlias;
        };
        UsingDirectiveImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(DdlStatementImpl.prototype.toString.call(this));
            result.append(" (alias: ");
            result.append(this.alias);
            result.append(')');
            return result.toString();
        };
        UsingDirectiveImpl.prototype.getPartOfNameWithNamespaceDelimeter = function(stopAtOffset) {
            var path = this.getNamePath();
            if (path != null) {
                var ind = path.getLastNamespaceComponentIndex();
                if (ind != null) {
                    var entries = path.getEntries();
                    var result = new rnd.StringBuffer();
                    for (var i = 0;i <= ind;i++) {
                        var t = entries[i].getNameToken();
                        if (stopAtOffset >= 0 && t.m_offset > stopAtOffset) {
                            break;
                        }
                        result.append(t.m_lexem);
                        if (i < ind) {
                            result.append(".");
                        }
                    }
                    result.append("::");
                    for (var i = ind + 1;i < entries.length;i++) {
                        var t = entries[i].getNameToken();
                        if (stopAtOffset >= 0 && t.m_offset > stopAtOffset) {
                            break;
                        }
                        result.append(t.m_lexem);
                        if (i < entries.length - 1) {
                            var nextId = i + 1;
                            if (nextId < entries.length) {
                                var next = entries[nextId].getNameToken();
                                if (stopAtOffset >= 0 && next.m_offset > stopAtOffset) {
                                    break;
                                }
                            }
                            result.append(".");
                        }
                    }
                    return result.toString();
                }else{
                    return this.getName();
                }
            }
            return "";
        };
        UsingDirectiveImpl.prototype.getNameWithNamespaceDelimeter = function() {
            return this.getPartOfNameWithNamespaceDelimeter(-1);
        };
        return UsingDirectiveImpl;
    }
);