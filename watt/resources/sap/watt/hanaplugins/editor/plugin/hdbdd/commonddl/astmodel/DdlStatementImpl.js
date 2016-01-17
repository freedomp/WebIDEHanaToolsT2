// based on commit
// df5d88d14a69ac3ca1a4d784d3bf0f60855bd52a CDS - ProxyStatement class movement from AST Layer to Graphical Layer
define(
    ["commonddl/astmodel/NamedDeclarationImpl"], //dependencies
    function (NamedDeclarationImpl) {

        function DdlStatementImpl() {
            NamedDeclarationImpl.call(this);
        }
        DdlStatementImpl.prototype = Object.create(NamedDeclarationImpl.prototype);
        DdlStatementImpl.prototype.compilationUnit = null;
        DdlStatementImpl.QUALIFIED_PATH_EDEFAULT = null;
        DdlStatementImpl.PATH_IDENTIFIER = ".";
        DdlStatementImpl.prototype.constructor = DdlStatementImpl;

        DdlStatementImpl.prototype.getCompilationUnit = function () {
            return this.compilationUnit;
        };
        DdlStatementImpl.prototype.basicGetCompilationUnit = function () {
            return this.compilationUnit;
        };
        DdlStatementImpl.prototype.setCompilationUnit = function (newCompilationUnit) {
            var oldCompilationUnit = this.compilationUnit;
            this.compilationUnit = newCompilationUnit;
        };
        DdlStatementImpl.prototype.getQualifiedPath = function() {
            return this.getObjQualifiedPath(this);
        };
        DdlStatementImpl.prototype.getObjQualifiedPath = function (bo) {
            var parent = null;
            var EntityDeclarationImpl = require("commonddl/astmodel/EntityDeclarationImpl");
            var TypeDeclarationImpl = require("commonddl/astmodel/TypeDeclarationImpl");
            var ViewDefinitionImpl = require("commonddl/astmodel/ViewDefinitionImpl");
            var CompilationUnitImpl = require("commonddl/astmodel/CompilationUnitImpl");
            if (bo instanceof EntityDeclarationImpl) {
                parent = (bo).eContainer();
            }
            if (bo instanceof TypeDeclarationImpl) {
                parent = (bo).eContainer();
            }
            if (bo instanceof ViewDefinitionImpl) {
                parent = (bo).eContainer();
            }
            if (parent instanceof CompilationUnitImpl) {
                return null;
            }
            var qualifiedPath = null;
            /*eslint-disable no-eq-null*/
            while (parent != null) {
                if (parent instanceof CompilationUnitImpl) {
                    break;
                }
                if (parent instanceof NamedDeclarationImpl) {
                    /*eslint-disable no-eq-null*/
                    if (qualifiedPath == null) {
                        qualifiedPath = parent.getName();
                    } else {
                        qualifiedPath = parent.getName()
                                + DdlStatementImpl.PATH_IDENTIFIER
                                + qualifiedPath;
                    }
                }
                parent = parent.eContainer();
            }
            return qualifiedPath;
        };
        return DdlStatementImpl;
    }
);