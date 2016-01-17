// based on commit
//55ea59383636e4da55cb7bb8fbed6bb48b049245 AST nodes for table functions
define(
    [
        "commonddl/astmodel/AbstractAnnotationImpl",
        "commonddl/astmodel/AnnotatedImpl",
        "commonddl/astmodel/NamedDeclarationImpl",
        "rndrt/rnd"
    ], //dependencies
    function (AbstractAnnotationImpl,
              AnnotatedImpl,
              NamedDeclarationImpl,
              rnd) {
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        var StringBuffer = rnd.StringBuffer;
        function ParameterImpl() {
            NamedDeclarationImpl.call(this);
        }
        ParameterImpl.prototype = Object.create(NamedDeclarationImpl.prototype);
        ParameterImpl.prototype.annotationList = null;
        ParameterImpl.TYPE_NAMESPACE_EDEFAULT = null;
        ParameterImpl.prototype.typeNamespace = ParameterImpl.TYPE_NAMESPACE_EDEFAULT;
        ParameterImpl.TYPE_NAME_EDEFAULT = null;
        ParameterImpl.prototype.typeName = ParameterImpl.TYPE_NAME_EDEFAULT;
        ParameterImpl.LENGTH_EDEFAULT = null;
        ParameterImpl.prototype.length = ParameterImpl.LENGTH_EDEFAULT;
        ParameterImpl.DECIMALS_EDEFAULT = null;
        ParameterImpl.prototype.decimals = ParameterImpl.DECIMALS_EDEFAULT;
        ParameterImpl.prototype.constructor = ParameterImpl;
        ParameterImpl.prototype.getAnnotationList = function () {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        ParameterImpl.prototype.getTypeNamespace = function () {
            return this.typeNamespace;
        };
        ParameterImpl.prototype.setTypeNamespace = function (newTypeNamespace) {
            var oldTypeNamespace = this.typeNamespace;
            this.typeNamespace = newTypeNamespace;
        };
        ParameterImpl.prototype.getTypeName = function () {
            return this.typeName;
        };
        ParameterImpl.prototype.setTypeName = function (newTypeName) {
            var oldTypeName = this.typeName;
            this.typeName = newTypeName;
        };
        ParameterImpl.prototype.getLength = function () {
            return this.length;
        };
        ParameterImpl.prototype.setLength = function (newLength) {
            var oldLength = this.length;
            this.length = newLength;
        };
        ParameterImpl.prototype.getDecimals = function () {
            return this.decimals;
        };
        ParameterImpl.prototype.setDecimals = function (newDecimals) {
            var oldDecimals = this.decimals;
            this.decimals = newDecimals;
        };
        ParameterImpl.prototype.toString = function () {
            var result = new StringBuffer(NamedDeclarationImpl.prototype.toString.call(this));
            result.append(" (typeNamespace: ");
            result.append(this.typeNamespace);
            result.append(", typeName: ");
            result.append(this.typeName);
            result.append(", length: ");
            result.append(this.length);
            result.append(", decimals: ");
            result.append(this.decimals);
            result.append(")");
            return result.toString();
        };
        return ParameterImpl;
    }
);