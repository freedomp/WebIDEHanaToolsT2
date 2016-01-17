define(
    ["require", "rndrt/rnd", "commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (require, rnd, EObjectContainmentEList) {
        var Utils = rnd.Utils;

        function EObjectImpl() {

        }

        EObjectImpl.prototype.setContainer = function (parent) {
            this.container = parent;
        };

        EObjectImpl.prototype.eContents = function () {
            //returns all its children
            var CompilationUnitImpl = require("commonddl/astmodel/CompilationUnitImpl");
            var AssociationDeclarationImpl = require("commonddl/astmodel/AssociationDeclarationImpl");
            var result = [];
            for (var key in this) {
                if (key === "parent" || key === "container") {
                    continue;
                }
                var child = this[key];
                if (child instanceof CompilationUnitImpl) {
                    continue;
                }
                if (this instanceof AssociationDeclarationImpl && key === "targetDataSource") {
                    continue;
                }
                if (child instanceof EObjectImpl) {
                    if (child.container) {
                        if (child.container !== this) {
                            continue; //parent/container is not this -> don't return is as eContents
                        }
                    }
                    result.push(child);
                } else if (child instanceof EObjectContainmentEList) {
                    for (var i = 0; i < child.length; i++) {
                        result.push(child[i]);
                    }
                }
            }
            return result;
        };

        EObjectImpl.prototype.eAllContents = function () {
            var result = [];
            this.internalGetAllContents(result, this);
            return result;
        };

        EObjectImpl.prototype.internalGetAllContents = function (result, obj) {
            /*eslint-disable no-eq-null*/
            if (obj == null || !obj.eContents || Utils.arrayContains(result, obj)) {
                return;  //don't run into an endless loop
            }
            result.push(obj);
            var children = obj.eContents();
            for (var i = 0; i < children.length; i++) {
                this.internalGetAllContents(result, children[i]);
            }
        };

        EObjectImpl.prototype.eContainer = function () {
            if (this.container === undefined) {
                if (this.getParent) {
                    return this.getParent();
                }
            }
            return this.container;
        };

        return EObjectImpl;
    }
);