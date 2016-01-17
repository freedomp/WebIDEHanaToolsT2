// based on commit
// 13549d549289c4f3db4ca9c6c51ad0a81341c8df introduce onToken in AssociationDeclaration and JoinDataSource
define(
    ["commonddl/astmodel/DdlStatementImpl", "commonddl/astmodel/EObjectContainmentEList", "commonddl/astmodel/ViewSelectImpl", "commonddl/astmodel/ViewSelectSetImpl", "rndrt/rnd"], //dependencies
    function (DdlStatementImpl, EObjectContainmentEList, ViewSelectImpl, ViewSelectSetImpl, rnd) {
        function ViewDefinitionImpl() {
            DdlStatementImpl.call(this);
        }
        ViewDefinitionImpl.prototype = Object.create(DdlStatementImpl.prototype);
        ViewDefinitionImpl.prototype.annotationList = null;
        ViewDefinitionImpl.prototype.select = null;
        ViewDefinitionImpl.prototype.selectSet = null;
        ViewDefinitionImpl.prototype.names = null;
        ViewDefinitionImpl.prototype.selects = null;
        ViewDefinitionImpl.SINGLE_SELECT_EDEFAULT = false;
        ViewDefinitionImpl.prototype.singleSelect = ViewDefinitionImpl.SINGLE_SELECT_EDEFAULT;
        ViewDefinitionImpl.prototype.parameters = null;
        ViewDefinitionImpl.prototype.constructor = ViewDefinitionImpl;
        ViewDefinitionImpl.prototype.getAnnotationList = function () {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        ViewDefinitionImpl.prototype.getSelect = function () {
            return this.select;
        };
        ViewDefinitionImpl.prototype.basicSetSelect = function (newSelect, msgs) {
            var oldSelect = this.select;
            this.select = newSelect;
            if (this.select !== null) {
                this.select.setContainer(this);
            }
            return msgs;
        };
        ViewDefinitionImpl.prototype.setSelect = function (newSelect) {
            if (newSelect !== this.select) {
                this.basicSetSelect(newSelect);
            }
        };
        ViewDefinitionImpl.prototype.getSelectSet = function () {
            return this.selectSet;
        };
        ViewDefinitionImpl.prototype.basicSetSelectSet = function (newSelectSet, msgs) {
            var oldSelectSet = this.selectSet;
            this.selectSet = newSelectSet;
            this.selectSet.setContainer(this);
            return msgs;
        };
        ViewDefinitionImpl.prototype.setSelectSet = function (newSelectSet) {
            if (newSelectSet !== this.selectSet) {
                this.basicSetSelectSet(newSelectSet);
            }
        };
        ViewDefinitionImpl.prototype.getSelects = function () {
            /*eslint-disable no-eq-null*/
            if (this.selects == null) {
                this.selects = [];
                var select = this.getSelectSet();
                /*eslint-disable no-eq-null*/
                if (select == null) {
                    select = this.getSelect();
                }
                this.selects = this.selects.concat(this.getNestedSelects(select));
            }
            return this.selects;
        };
        ViewDefinitionImpl.prototype.getNestedSelects = function (selectParam) {
            var result = [];
            if (selectParam instanceof ViewSelectImpl) {
                var viewSelect = selectParam;
                result.push(viewSelect);
                var union = viewSelect.getUnion();
                /*eslint-disable no-eq-null*/
                while (union != null) {
                    result.push(union);
                    union = union.getUnion();
                }
            } else if (selectParam instanceof ViewSelectSetImpl) {
                var localSelectSet = selectParam;
                var left = localSelectSet.getLeft();
                result = result.concat(this.getNestedSelects(left));
                var right = localSelectSet.getRight();
                result = result.concat(this.getNestedSelects(right));
            }
            return result;
        };
        ViewDefinitionImpl.prototype.isSingleSelect = function () {
            var allSelects = this.getSelects();
            return (allSelects.length <= 1);
        };
        ViewDefinitionImpl.prototype.getParameters = function () {
            /*eslint-disable no-eq-null*/
            if (this.parameters == null) {
                this.parameters = new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        ViewDefinitionImpl.prototype.getNames = function () {
            return this.names;
        };
        ViewDefinitionImpl.prototype.basicGetNames = function () {
            return this.names;
        };
        ViewDefinitionImpl.prototype.setNames = function (newNames) {
            var oldNames = this.names;
            this.names = newNames;
        };
        ViewDefinitionImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(DdlStatementImpl.prototype.toString.call(this));
            result.append(" (singleSelect: ");
            result.append(this.singleSelect);
            result.append(")");
            return result.toString();
        };
        return ViewDefinitionImpl;
    }
);