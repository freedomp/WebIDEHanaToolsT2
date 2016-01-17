/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
/*eslint-disable space-infix-ops,max-params*/
define(["rndrt/rnd", "commonddl/sourcemodification/AddToListCommand","commonddl/sourcemodification/AddSelectListEntryCommand"],
    function(rnd, AddToListCommand,AddSelectListEntryCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function AddCaseStatementCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        AddCaseStatementCommand.createEntryString = function(caseExpression,whenExpressions,thenExpressions,elseExpression,aliasName) {
            var result = "case ";
            if (caseExpression != null && caseExpression.length > 0) {
                result += caseExpression+" ";
            }
            result+="\r\n";
            for (var i = 0;i<whenExpressions.length;i++) {
                result += "when " + whenExpressions[i] + " then " + thenExpressions[i] + "\r\n";
            }
            if (elseExpression != null && elseExpression.length > 0) {
                result += "else " + elseExpression + "\r\n";
            }
            result += "end";
            if (aliasName != null) {
                result += " as " + aliasName;
            }
            return result;
        };

        /**
         * adds a case statement to the viewSelect list as select list entry and returns the created AST node SelectListEntryImpl
         * @param {ViewSelectImpl} viewSelect
         * @param {string or null} caseExpression (if value is set, a simple case expression is created; if value is not set, a searched case expression is created)
         * @param {string array - can be null} whenExpressions - list of multiple when expression
         * @param {string array - can be null} thenExpressions - list of multiple then expression (index of thenExpression points to index of whenExpression)
         * @param {string or null} elseExpression - can be null
         * @param {string} aliasName - alias name must be always set
         * @param {int or null} insertPosition - optional - if not set, case statement will be added at end of select list
         * @returns {SelectListEntryImpl}
         */
        AddCaseStatementCommand.prototype.addCaseStatement = function(/*ViewSelectImpl*/viewSelect,
                                                                       /*string or null*/caseExpression,
                                                                        /*string array*/whenExpressions,
                                                                        /*string array*/thenExpressions,
                                                                        /*string or null*/elseExpression,
                                                                        /*string*/aliasName,
                                                                        /*int optional*/insertPosition) {
            if (whenExpressions == null || whenExpressions.length === 0 || thenExpressions == null || thenExpressions.length === 0) {
                if (caseExpression == null || caseExpression.length === 0) {
                    caseExpression = "dummy";
                }
                whenExpressions = [ "dummy" ];
                thenExpressions = [ "dummy" ];
            }
            if (Array.isArray(whenExpressions) === false || Array.isArray(thenExpressions) === false || whenExpressions.length !== thenExpressions.length) {
                throw new Error("invalid input");
            }
            var selectListEntryString = AddCaseStatementCommand.createEntryString(caseExpression,whenExpressions,thenExpressions,elseExpression,aliasName);

            var selectList = viewSelect.getSelectList();
            var entries = null;
            if (selectList != null) {
                entries = selectList.getEntries();
                if (insertPosition === undefined) {
                    insertPosition = entries.length;
                }
                AddToListCommand.add(this.parser,this.resolver,selectList,entries,insertPosition,selectListEntryString,null);
                var returnIndex = insertPosition;
                if (insertPosition >= entries.length) {
                    returnIndex = entries.length - 1;
                }
                return entries[returnIndex];
            }else{
                return new AddSelectListEntryCommand(this.parser,this.resolver).addSelectListEntry(viewSelect,selectListEntryString,insertPosition);
            }
        };

        return AddCaseStatementCommand;
    }
);