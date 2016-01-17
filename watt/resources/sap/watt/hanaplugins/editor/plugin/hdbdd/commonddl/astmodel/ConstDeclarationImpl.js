define(
    ["commonddl/astmodel/ComponentDeclarationImpl"], //dependencies
    function (ComponentDeclarationImpl) {
        function ConstDeclarationImpl() {
            ComponentDeclarationImpl.call(this);
        }
        ConstDeclarationImpl.prototype = Object.create(ComponentDeclarationImpl.prototype);
        ConstDeclarationImpl.prototype.annotationList = null;
        ConstDeclarationImpl.prototype.value = null;
        ConstDeclarationImpl.prototype.constructor = ConstDeclarationImpl;
        ConstDeclarationImpl.prototype.getAnnotationList = function() {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        ConstDeclarationImpl.prototype.getValue = function() {
            return this.value;
        };
        ConstDeclarationImpl.prototype.basicSetValue = function(newValue,msgs) {
            var oldValue = this.value;
            this.value = newValue;
            this.value.setContainer(this);
            return msgs;
        };
        ConstDeclarationImpl.prototype.setValue = function(newValue) {
            if (newValue !== this.value) {
                this.basicSetValue(newValue);
            }
        };
        return ConstDeclarationImpl;
    }
);