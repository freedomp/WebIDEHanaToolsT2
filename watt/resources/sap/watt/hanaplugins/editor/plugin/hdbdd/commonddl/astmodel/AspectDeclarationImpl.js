define(
        [ "commonddl/astmodel/DdlStatementImpl"

        ], // dependencies
        function(DdlStatementImpl) {
            function AspectDeclarationImpl() {
                DdlStatementImpl.call(this);
            }
            AspectDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
            AspectDeclarationImpl.prototype.select = null;
            AspectDeclarationImpl.prototype.selectSet = null;
            AspectDeclarationImpl.prototype.annotationList = null;
            AspectDeclarationImpl.prototype.constructor = AspectDeclarationImpl;

            AspectDeclarationImpl.prototype.getSelect = function() {
                return this.select;
            };
            AspectDeclarationImpl.prototype.basicSetSelect = function(newSelect, msgs) {
                var oldSelect = this.select;
                this.select = newSelect;
                this.select.setContainer(this);
                return msgs;
            };
            AspectDeclarationImpl.prototype.setSelect = function(newSelect) {
                if (newSelect !== this.select) {
                    this.basicSetSelect(newSelect);
                }
            };
            AspectDeclarationImpl.prototype.getSelectSet = function() {
                return this.selectSet;
            };
            AspectDeclarationImpl.prototype.basicSetSelectSet = function(
                    newSelectSet, msgs) {
                var oldSelectSet = this.selectSet;
                this.selectSet = newSelectSet;
                this.selectSet.setContainer(this);
                return msgs;
            };
            AspectDeclarationImpl.prototype.setSelectSet = function(newSelectSet) {
                if (newSelectSet !== this.selectSet) {
                    this.basicSetSelectSet(newSelectSet);
                }
            };
            AspectDeclarationImpl.prototype.getAnnotationList = function() {
                /*eslint-disable no-eq-null*/
                if (this.annotationList == null) {
                    this.annotationList = [];
                }
                return this.annotationList;
            };
            return AspectDeclarationImpl;
        });