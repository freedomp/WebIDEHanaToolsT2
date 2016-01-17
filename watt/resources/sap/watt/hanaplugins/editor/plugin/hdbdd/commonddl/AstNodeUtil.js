/*eslint-disable no-eq-null,eqeqeq,radix,no-multi-spaces,valid-jsdoc*/
define(
    ["commonddl/astmodel/EObjectContainmentEList","commonddl/astmodel/SourceRangeImpl","rndrt/rnd"],
    function (EObjectContainmentEList,SourceRangeImpl,rnd) {

        function AstNodeUtil() {
        }

        /**
         * returns the best matching AST node (of instance SourceRangeImpl) from the given compilationUnit which fits
         * best to the source position of the given checkResultEntry.
         *
         * This method can be used to map a syntax check error to an AST node.
         *
         * @param checkResultEntry
         * @param compilationUnit
         * @returns {SourceRangeImpl}
         */
        AstNodeUtil.getBestAstNodeForCheckResult = function (/*object with at least one attribute named uri*/checkResultEntry, /*CompilationUnitImpl*/compilationUnit) {
            if (checkResultEntry == null || checkResultEntry.uri == null || compilationUnit == null || compilationUnit.statements == null || compilationUnit.statements.length <= 0) {
                return null;
            }
            return AstNodeUtil.getBestAstNodeForUri(checkResultEntry.uri,compilationUnit);
        };

        /**
         * returns the best matching AST node (of instance SourceRangeImpl) from the given compilationUnit which fits
         * best to the given uri string.
         *
         * This method can be used to map an uri with #start fragment to an AST node.
         *
         * @param uri
         * @param compilationUnit
         * @returns {SourceRangeImpl}
         */
        AstNodeUtil.getBestAstNodeForUri = function (/*string*/ uri, /*CompilationUnitImpl*/compilationUnit) {
            var regex = /start=([^,]*),([^\&]*)/i;
            var match = regex.exec(uri);
            if (match == null || match.length < 3) {
                return null;
            }
            var line = parseInt(match[1]);
            var column = parseInt(match[2]);
            return AstNodeUtil.getBestAstNodeForLineColumn(line,column,compilationUnit);
        };

        function convertLineColumnToOffset(/*string*/source,/*number*/lineStartingWithOne,/*number*/column) {
            var currentLine = 1;
            var initColumnValue = 0;
            var currentColumn = initColumnValue;
            for (var i = 0;i < source.length;i++) {
                var ch = source[i];
                if (lineStartingWithOne === currentLine && column === currentColumn) {
                    return i;
                }
                if (ch == "\n") {
                    currentLine++;
                    currentColumn = initColumnValue;
                    continue;
                }
                currentColumn++;
            }
            return -1; // column not found - out of range
        }

        /**
         * returns the best matching AST node (of instance SourceRangeImpl) from the given compilationUnit which fits
         * best to the line, column tuple. Line starts with value 1. Column starts with value 0.
         *
         * This method can be used to map a line/column tuple to an AST node.
         *
         * @param lineStartingWithOne
         * @param column
         * @param compilationUnit
         * @returns {SourceRangeImpl}
         */
        AstNodeUtil.getBestAstNodeForLineColumn = function(/*number*/lineStartingWithOne,/*number*/column,/*CompilationUnitImpl*/compilationUnit) {
            var offset = convertLineColumnToOffset(compilationUnit.getParsedSource(),lineStartingWithOne,column);
            return AstNodeUtil.getBestAstNodeForOffset(offset,compilationUnit);
        };


        function SourceRangeContainer(range,diff) {
            this.range = range;
            this.diff = diff;
        }
        SourceRangeContainer.prototype.range = null;
        SourceRangeContainer.prototype.diff = 0;

        function hasEContents(parent) {
            if (parent.eContents) {
                return true;
            }
            return false;
        }

        function getSourceRangeContainer(range,offset) {
            var start = range.getStartOffset();
            var end = range.getEndOffset();
            if (offset >= start) {
                if ((end <= 0) || (end > 0 && offset <= end)) {
                    var result = new SourceRangeContainer(range,offset - start);
                    return result;
                }
            }
            return null;
        }

        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }

        function getBestMatchingSourceRangeContainerRecursive(parent,offset,allParents) {
            allParents.push(parent);
            var currentContainer = null;
            if (parent instanceof SourceRangeImpl) {
                currentContainer = getSourceRangeContainer(parent,offset);
                if (currentContainer == null) {
                    return null;
                }
            }
            if (hasEContents(parent)) {
                var children = parent.eContents();
                for (var childCount = 0; childCount < children.length; childCount++) {
                    var child = children[childCount];
                    if (rnd.Utils.arrayContains(allParents, child)) {
                        Console.log("incorrect behavior of EObject.eContents() detected. " + child + " found multiple times in object hierarchy traversal.");
                        continue; // ensure that we don't run into an endless by not calling getBestMatchingSourceRangeContainerRecursive on child again and again
                    }
                    var childContainer = getBestMatchingSourceRangeContainerRecursive(child,offset,allParents);
                    if (childContainer != null) {
                        if (currentContainer == null || childContainer.diff <= currentContainer.diff) {
                            currentContainer = childContainer;
                        }
                    }
                }
            }
            return currentContainer;
        }

        function getBestMatchingSourceRangeRecursive(parent,offset) {
            var container = getBestMatchingSourceRangeContainerRecursive(parent,offset,[]);
            if (container != null) {
                return container.range;
            }
            return null;
        }

        /**
         * returns the best matching AST node (of instance SourceRangeImpl) from the given compilationUnit which fits
         * best to the given offset. Offset starts with value 0.
         *
         * This method can be used to map an offset number value to an AST node.
         *
         * @param offset
         * @param compilationUnit
         * @returns {SourceRangeImpl}
         */
        AstNodeUtil.getBestAstNodeForOffset = function(/*number*/offset,/*CompilationUnit*/compilationUnit) {
            var sourceRange = getBestMatchingSourceRangeRecursive(compilationUnit,offset);
            return sourceRange;
        };

        return AstNodeUtil;
    });
