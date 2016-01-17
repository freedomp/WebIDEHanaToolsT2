// based on commit
//8612efbf08d36b0ba2e1ba128ecb1c30c9868714 remove eIsProxy() call for javascript consumption
define(
    ["rndrt/rnd", "commonddl/astmodel/DdlStatementImpl", "commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (rnd, DdlStatementImpl, EObjectContainmentEList) {
        function ViewExtendImpl() {
            DdlStatementImpl.call(this);
        }
        ViewExtendImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ViewExtendImpl.prototype.annotationList = null;
        ViewExtendImpl.prototype.associations = null;
        ViewExtendImpl.prototype.selectList = null;
        ViewExtendImpl.EXTENDED_VIEW_NAME_EDEFAULT = null;
        ViewExtendImpl.EXTENDED_VIEW_NAME_TOKEN_EDEFAULT = null;
        ViewExtendImpl.prototype.extendedViewNameToken = ViewExtendImpl.EXTENDED_VIEW_NAME_TOKEN_EDEFAULT;
        ViewExtendImpl.prototype.constructor = ViewExtendImpl;
        ViewExtendImpl.prototype.getAnnotationList = function () {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        ViewExtendImpl.prototype.getSelectList = function () {
            return this.selectList;
        };
        ViewExtendImpl.prototype.basicSetSelectList = function (newSelectList, msgs) {
            var oldSelectList = this.selectList;
            this.selectList = newSelectList;
            this.selectList.setContainer(this);
            return msgs;
        };
        ViewExtendImpl.prototype.setSelectList = function (newSelectList) {
            if (newSelectList !== this.selectList) {
                this.basicSetSelectList(newSelectList);
            }
        };
        ViewExtendImpl.prototype.getExtendedViewName = function () {
            throw new Error();
        };
        ViewExtendImpl.prototype.getExtendedViewNameToken = function () {
            return this.extendedViewNameToken;
        };
        ViewExtendImpl.prototype.setExtendedViewNameToken = function (newExtendedViewNameToken) {
            var oldExtendedViewNameToken = this.extendedViewNameToken;
            this.extendedViewNameToken = newExtendedViewNameToken;
        };
        ViewExtendImpl.prototype.getAssociations = function () {
            /*eslint-disable no-eq-null*/
            if (this.associations == null) {
                this.associations = new EObjectContainmentEList(this);
            }
            return this.associations;
        };
        ViewExtendImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(DdlStatementImpl.prototype.toString.call(this));
            result.append(" (extendedViewNameToken: ");
            result.append(this.extendedViewNameToken);
            result.append(")");
            return result.toString();
        };
        return ViewExtendImpl;
    }
);