/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    [
        "commonddl/astmodel/SelectListImpl",
        "commonddl/astmodel/AbstractPathEntryImpl"
    ], //dependencies
    function (
        SelectListImpl,
        AbstractPathEntryImpl
        ) {
        function NestedSelectListPathEntryImpl() {
            AbstractPathEntryImpl.call(this);
        }
        NestedSelectListPathEntryImpl.prototype = Object.create(AbstractPathEntryImpl.prototype);
        NestedSelectListPathEntryImpl.prototype.constructor = NestedSelectListPathEntryImpl;
        NestedSelectListPathEntryImpl.prototype.selectList = null;
        NestedSelectListPathEntryImpl.prototype.getSelectList = function() {
            return this.selectList;
        };
        NestedSelectListPathEntryImpl.prototype.basicSetSelectList = function(newSelectList,msgs) {
            var oldSelectList = this.selectList;
            this.selectList = newSelectList;
            this.selectList.setContainer(this);
            return msgs;
        };
        NestedSelectListPathEntryImpl.prototype.setSelectList = function(newSelectList) {
            if (newSelectList != this.selectList) {
                var msgs = null;
                if (this.selectList != null) {

                }
                if (newSelectList != null) {

                }
                msgs = this.basicSetSelectList(newSelectList,msgs);
                if (msgs != null) {
                    msgs.dispatch();
                }
            }
        };
        return NestedSelectListPathEntryImpl;
    }
);