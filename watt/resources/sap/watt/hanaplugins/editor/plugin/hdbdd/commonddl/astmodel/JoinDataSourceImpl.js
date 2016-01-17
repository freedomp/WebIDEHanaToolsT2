// based on commit
// 13549d549289c4f3db4ca9c6c51ad0a81341c8df introduce onToken in AssociationDeclaration and JoinDataSource
define(
    ["commonddl/astmodel/DataSourceImpl", "commonddl/astmodel/JoinEnum", "commonddl/astmodel/EObjectContainmentEList", "require", "rndrt/rnd"], //dependencies
    function (DataSourceImpl, JoinEnum, EObjectContainmentEList, require, rnd) {
        var Utils = rnd.Utils;

        function JoinDataSourceImpl() {
            DataSourceImpl.call(this);
        }

        JoinDataSourceImpl.prototype = Object.create(DataSourceImpl.prototype);
        JoinDataSourceImpl.JOIN_ENUM_EDEFAULT = JoinEnum.LEFT;
        JoinDataSourceImpl.prototype.joinEnum = JoinDataSourceImpl.JOIN_ENUM_EDEFAULT;
        JoinDataSourceImpl.prototype.left = null;
        JoinDataSourceImpl.prototype.right = null;
        JoinDataSourceImpl.prototype.onExpression = null;
        JoinDataSourceImpl.ON_TOKEN_EDEFAULT = null;
        JoinDataSourceImpl.prototype.onToken = JoinDataSourceImpl.ON_TOKEN_EDEFAULT;
        JoinDataSourceImpl.prototype.constructor = JoinDataSourceImpl;
        JoinDataSourceImpl.prototype.getJoinEnum = function () {
            return this.joinEnum;
        };
        JoinDataSourceImpl.prototype.setJoinEnum = function (newJoinEnum) {
            var oldJoinEnum = this.joinEnum;
            /*eslint-disable no-eq-null*/
            this.joinEnum = newJoinEnum == null ? JoinDataSourceImpl.JOIN_ENUM_EDEFAULT : newJoinEnum;
        };
        JoinDataSourceImpl.prototype.getLeft = function () {
            return this.left;
        };
        JoinDataSourceImpl.prototype.basicSetLeft = function (newLeft, msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        JoinDataSourceImpl.prototype.setLeft = function (newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        JoinDataSourceImpl.prototype.getRight = function () {
            return this.right;
        };
        JoinDataSourceImpl.prototype.basicSetRight = function (newRight, msgs) {
            var oldRight = this.right;
            this.right = newRight;
            this.right.setContainer(this);
            return msgs;
        };
        JoinDataSourceImpl.prototype.setRight = function (newRight) {
            if (newRight !== this.right) {
                this.basicSetRight(newRight);
            }
        };
        JoinDataSourceImpl.prototype.getOn = function () {
            return this.getOnExpression();
        };
        JoinDataSourceImpl.prototype.setOn = function (newOn) {
            this.setOnExpression(newOn);
        };
        JoinDataSourceImpl.prototype.getOnExpression = function () {
            return this.onExpression;
        };
        JoinDataSourceImpl.prototype.basicSetOnExpression = function (newOnExpression, msgs) {
            var oldOnExpression = this.onExpression;
            this.onExpression = newOnExpression;
            this.onExpression.setContainer(this);
            return msgs;
        };
        JoinDataSourceImpl.prototype.setOnExpression = function (newOnExpression) {
            var oldOn = this.onExpression;
            this.onExpression = newOnExpression;
            /*eslint-disable no-eq-null*/
            if (newOnExpression != null) {
                newOnExpression.setParent(this);
            }
        };
        JoinDataSourceImpl.prototype.getOnToken = function () {
            return this.onToken;
        };
        JoinDataSourceImpl.prototype.setOnToken = function (newOnToken) {
            var oldOnToken = this.onToken;
            this.onToken = newOnToken;
        };
        JoinDataSourceImpl.prototype.isPrimary = function () {
            return false;
        };
        JoinDataSourceImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer();
            result.append(" (joinEnum: ");
            result.append(this.joinEnum);
            result.append(")");
            result.append(" (left: ");
            result.append(this.left.toString());
            result.append(")");
            result.append(" (right: ");
            result.append(this.right.toString());
            result.append(")");
            return result.toString();
        };
        return JoinDataSourceImpl;
    }
);