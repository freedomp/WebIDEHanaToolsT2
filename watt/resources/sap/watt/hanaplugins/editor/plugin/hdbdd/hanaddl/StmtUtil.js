// based on commit
//837aa20ead94b79d5179479c07c4f78ad1aee82a CDS: Fix syntax (re-)coloring for USING statements
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    ["require", "rndrt/rnd","commonddl/commonddlNonUi"], //dependencies
    function (require, rnd,commonddl,VersionsFactory) {
        var SourceRangeImpl = commonddl.SourceRangeImpl;
        var ViewDefinitionImpl = commonddl.ViewDefinitionImpl;
        var DdlStatementImpl = commonddl.DdlStatementImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var ElementDeclarationImpl = commonddl.ElementDeclarationImpl;
        var SelectImpl = commonddl.SelectImpl;
        var ViewSelectImpl = commonddl.ViewSelectImpl;
        var ViewSelectSetImpl = commonddl.ViewSelectSetImpl;
        var OrderByEntryImpl = commonddl.OrderByEntryImpl;
        var RuleDeclarationImpl = commonddl.RuleDeclarationImpl;
        var RoleDeclarationImpl = commonddl.RoleDeclarationImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var JoinDataSourceImpl = commonddl.JoinDataSourceImpl;
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }
        function StmtUtil() {
        }
        StmtUtil.possibleStartStatementTokensInLowerV1 = [
			"context", "entity", "type", "view", "define", "namespace", "using"];
        StmtUtil.possibleStartStatementTokensInLowerV2 = [
			"context", "entity", "type", "view", "define", "namespace", "const", "using"];
        StmtUtil.possibleStartStatementTokensInLowerV3 = [
			"context", "entity", "type", "view", "define", "namespace", "const", "annotation", "using", "accesspolicy", "aspect", "role"];
        StmtUtil.possibleStartStatementTokensInLowerV4 = [
			"context", "entity", "type", "view", "define", "namespace", "const", "annotation", "using", "accesspolicy", "aspect", "role"];
        StmtUtil.possibleStartStatementTokensInLowerV5 = [
			"context", "entity", "type", "view", "define", "namespace", "const", "annotation", "using", "accesspolicy", "aspect", "role"];
        StmtUtil.isPossibleStartStatementToken = function(parser,token) {
            if (token != null) {
                var version = parser.getByteCodeVersion();
                return StmtUtil.isPossibleStartStatementTokenWithVersion(version,token);
            }
            return false;
        };
        StmtUtil.isPossibleStartStatementTokenWithVersion = function(version,token) {
            var p = token.m_lexem.toLowerCase();
            var VersionsFactory1 = require("hanaddl/VersionsFactory");
            if (VersionsFactory1.version1 === version) {
                if (rnd.Utils.arrayContains(StmtUtil.possibleStartStatementTokensInLowerV1, p)) {
                    return true;
                }
            }else if (VersionsFactory1.version2 === version) {
                if (rnd.Utils.arrayContains(StmtUtil.possibleStartStatementTokensInLowerV2, p)) {
                    return true;
                }
            }else if (VersionsFactory1.version3 === version) {
                if (rnd.Utils.arrayContains(StmtUtil.possibleStartStatementTokensInLowerV3, p)) {
                    return true;
                }
            }else if (VersionsFactory1.version4 === version) {
                if (rnd.Utils.arrayContains(StmtUtil.possibleStartStatementTokensInLowerV4, p)) {
                    return true;
                }
            }else if (VersionsFactory1.version5 === version) {
                if (rnd.Utils.arrayContains(StmtUtil.possibleStartStatementTokensInLowerV5, p)) {
                    return true;
                }
            }else{
                if (rnd.Utils.arrayContains(StmtUtil.possibleStartStatementTokensInLowerV5, p)) {
                    return true;
                }
            }
            return false;
        };
        function SourceRangeContainer(range,diff) {
            this.range = range;
            this.diff = diff;
        }
        SourceRangeContainer.prototype.range = null;
        SourceRangeContainer.prototype.diff = 0;

        StmtUtil.getBestMatchingSourceRangeRecursive = function(parent,offset) {
            var container = StmtUtil.getBestMatchingSourceRangeContainerRecursive(parent,offset,[]);
            if (container != null) {
                return container.range;
            }
            return null;
        };
        StmtUtil.getBestMatchingSourceRangeContainerRecursive = function(parent,offset,allParents) {
            allParents.push(parent);
            var currentContainer = null;
            if (parent instanceof SourceRangeImpl) {
                currentContainer = StmtUtil.getSourceRangeContainer(parent,offset);
                if (currentContainer == null) {
                    return null;
                }
            }
            if (StmtUtil.hasEContents(parent)) {
                var children = parent.eContents();
                for (var childCount = 0; childCount < children.length; childCount++) {
                    var child = children[childCount];
                    if (rnd.Utils.arrayContains(allParents, child)) {
                        Console.log("incorrect behavior of EObject.eContents() detected. " + child + " found multiple times in object hierarchy traversal.");
                        continue; // ensure that we don't run into an endless by not calling getBestMatchingSourceRangeContainerRecursive on child again and again
                    }
                    var childContainer = StmtUtil.getBestMatchingSourceRangeContainerRecursive(child,offset,allParents);
                    if (childContainer != null) {
                        if (currentContainer == null || childContainer.diff <= currentContainer.diff) {
                            currentContainer = childContainer;
                        }
                    }
                }
            }
            return currentContainer;
        };
        StmtUtil.hasEContents = function(parent) {

            if (parent.eContents) {
                return true;
            }
            return false;

        };
        StmtUtil.getSourceRangeContainer = function(range,offset) {
            var start = range.getStartOffset();
            var end = range.getEndOffset();
            if (offset >= start) {
                if ((end <= 0) || (end > 0 && offset <= end)) {
                    var result = new SourceRangeContainer(range,offset - start);
                    return result;
                }
            }
            return null;
        };
        StmtUtil.getParentOfTypeOrderByEntry = function(child) {
            while (child != null) {
                if (child instanceof OrderByEntryImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeDdlStatement = function(child) {
            while (child != null) {
                if (child instanceof DdlStatementImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeElementDeclaration = function(child) {
            while (child != null) {
                if (child instanceof ElementDeclarationImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeContextDeclaration = function(child) {
            while (child != null) {
                if (child instanceof ContextDeclarationImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeRoleDeclaration = function(child) {
            while (child != null) {
                if (child instanceof RoleDeclarationImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeViewDefinition = function(child) {
            while (child != null) {
                if (child instanceof ViewDefinitionImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeSelect = function(child) {
            while (child != null) {
                if (child instanceof SelectImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeViewSelect = function(child) {
            while (child != null) {
                if (child instanceof ViewSelectImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeRule = function(child) {
            while (child != null) {
                if (child instanceof RuleDeclarationImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeEntity = function(child) {
            while (child != null) {
                if (child instanceof EntityDeclarationImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getParentOfTypeJoinDataSource = function(child) {
            while (child != null) {
                if (child instanceof JoinDataSourceImpl) {
                    return child;
                }
                child = child.eContainer();
            }
            return null;
        };
        StmtUtil.getAllViewSelects = function(select) {
            var result = [];
            if (select instanceof ViewSelectImpl) {
                var viewSelect = select;
                result.push(viewSelect);
            }else if (select instanceof ViewSelectSetImpl) {
                var viewSelectSet = select;
                result = result.concat(StmtUtil.getAllViewSelects(viewSelectSet.getLeft()));
                result = result.concat(StmtUtil.getAllViewSelects(viewSelectSet.getRight()));
            }
            return result;
        };
        StmtUtil.getFirstLeftViewSelect = function(selectSet) {
            if (selectSet == null) {
                return null;
            }
            var left = selectSet.getLeft();
            if (left instanceof ViewSelectImpl) {
                return left;
            }else if (left instanceof ViewSelectSetImpl) {
                return StmtUtil.getFirstLeftViewSelect(left);
            }
            return null;
        };
        return StmtUtil;
    }
);