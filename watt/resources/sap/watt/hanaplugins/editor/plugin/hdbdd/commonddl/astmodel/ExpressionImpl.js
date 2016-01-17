/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    ["rndrt/rnd","commonddl/astmodel/SourceRangeImpl", "commonddl/astmodel/SelectListEntryImpl","commonddl/astmodel/NestedSelectListPathEntryImpl"], //dependencies
    function (rnd,SourceRangeImpl, SelectListEntryImpl,NestedSelectListPathEntryImpl) {
        function ExpressionImpl() {
            SourceRangeImpl.call(this);
        }
        ExpressionImpl.prototype = Object.create(SourceRangeImpl.prototype);
        ExpressionImpl.prototype.constructor = ExpressionImpl;
        ExpressionImpl.PARENT_EDEFAULT = null;
        ExpressionImpl.prototype.parent = ExpressionImpl.PARENT_EDEFAULT;
        ExpressionImpl.SHORT_DESCRIPTION_EDEFAULT = null;
        ExpressionImpl.prototype.shortDescription = ExpressionImpl.SHORT_DESCRIPTION_EDEFAULT;
        ExpressionImpl.prototype.eContainer = function() {
            var container = SourceRangeImpl.prototype.eContainer.call(this);
            if (container != null) {
                return container;
            }
            var parent = this.getParent();
            if (parent instanceof SelectListEntryImpl) {
                if (this === (parent).getExpression()) {
                    return parent;
                }
            }
            return null;
        };
        ExpressionImpl.prototype.getParent = function() {
            return this.parent;
        };
        ExpressionImpl.prototype.setParent = function(newParent) {
            var oldParent = this.parent;
            this.parent = newParent;
        };
        ExpressionImpl.prototype.getShortDescription = function() {
            if (this.shortDescription == null) {
                var start = this.getStartOffset();
                var end = this.getEndOffset();
                var cu = SourceRangeImpl.getCompilationUnit(this);
                this.shortDescription = cu.getParsedSource().substring(start,end);
            }
            return this.shortDescription;
        };
        ExpressionImpl.prototype.toString = function() {
            return SourceRangeImpl.prototype.toString.call(this);
        };
        ExpressionImpl.getFirstNonExpressionContainer = function(expr) {
            var prnt = expr;
            while ((prnt != null) && (prnt instanceof ExpressionImpl)) {
                prnt = prnt.eContainer();
            }
            return prnt;
        };
        ExpressionImpl.getPathString = function(entries,withFilters) {
            var result = new rnd.StringBuffer();
            for (var i = 0;i < entries.length;i++) {
                var entry = entries[i];
                if (i > 0) {
                    result.append(".");
                }
                var t = entry.getNameToken();
                if (t != null) {
                    result.append(t.m_lexem);
                }
                var filter = entry.getFilter();
                if (withFilters && filter != null) {
                    result.append("[");
                    result.append(filter.getShortDescription());
                    result.append("]");
                }
            }
            return result.toString();
        };
        ExpressionImpl.getEntries = function(entries) {
            for (var entryCount = 0;entryCount < entries.length;entryCount++) {
                var entry = entries[entryCount];
                if (entry instanceof NestedSelectListPathEntryImpl) {
                    throw new Error("The list of path entries contains at least one instance of INestedSelectListPathEntries. This method only works correct if all path entries are of type IPathEntry.");
                }
            }
            return entries;
        };
        return ExpressionImpl;
    }
);