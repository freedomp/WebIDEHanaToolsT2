// based on commit
// df5d88d14a69ac3ca1a4d784d3bf0f60855bd52a CDS - ProxyStatement class movement from AST Layer to Graphical Layer
define(
    ["rndrt/rnd", "commonddl/astmodel/EObjectImpl", "require"], //dependencies
    function (rnd, EObjectImpl, require) {

        var StringBuffer = rnd.StringBuffer;
        function DataSourceAssociationImpl() {
            EObjectImpl.call(this);
        }
        DataSourceAssociationImpl.prototype = Object.create(EObjectImpl.prototype);
        DataSourceAssociationImpl.NAME_EDEFAULT = null;
        DataSourceAssociationImpl.prototype.name = DataSourceAssociationImpl.NAME_EDEFAULT;
        DataSourceAssociationImpl.CARDINALITIES_EDEFAULT = null;
        DataSourceAssociationImpl.prototype.cardinalities = DataSourceAssociationImpl.CARDINALITIES_EDEFAULT;
        DataSourceAssociationImpl.TARGET_NAME_EDEFAULT = null;
        DataSourceAssociationImpl.prototype.targetName = DataSourceAssociationImpl.TARGET_NAME_EDEFAULT;

        DataSourceAssociationImpl.prototype.constructor = DataSourceAssociationImpl;
        DataSourceAssociationImpl.prototype.getName = function () {
            return this.name;
        };
        DataSourceAssociationImpl.prototype.setName = function (newName) {
            var oldName = this.name;
            this.name = newName;
        };
        DataSourceAssociationImpl.prototype.getCardinalities = function () {
            return this.cardinalities;
        };
        DataSourceAssociationImpl.prototype.setCardinalities = function (newCardinalities) {
            var oldCardinalities = this.cardinalities;
            this.cardinalities = newCardinalities;
        };
        DataSourceAssociationImpl.prototype.getTargetName = function () {
            return this.targetName;
        };
        DataSourceAssociationImpl.prototype.setTargetName = function (newTargetName) {
            var oldTargetName = this.targetName;
            this.targetName = newTargetName;
        };
        DataSourceAssociationImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (name: ");
            result.append(this.name);
            result.append(", cardinalities: ");
            result.append(this.cardinalities);
            result.append(", targetName: ");
            result.append(this.targetName);
            result.append(")");
            return result.toString();
        };
        return DataSourceAssociationImpl;
    }
);