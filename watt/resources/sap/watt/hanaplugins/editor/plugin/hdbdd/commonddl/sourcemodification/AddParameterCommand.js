/*eslint-disable valid-jsdoc*/
define(["rndrt/rnd", "commonddl/sourcemodification/AddToListCommand"],
    function(rnd, AddToListCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function AddParameterCommand(parser, resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        AddParameterCommand.prototype.invoke = function(listContainer,source,entryString) {
            var offset = listContainer.getStartOffset();
            var viewNameToken = listContainer.getNameToken();
            var off = viewNameToken.m_offset + viewNameToken.m_lexem.length;
            var result = rnd.Utils.stringInsertAt(source, off, "\r\nwith parameters " + entryString + "\r\n");
            return result;
        };

        /**
         * @returns {ParameterImpl} the created parameter 
         */
        AddParameterCommand.prototype.addParameter = function(/*ViewDefinitionImp*/viewDefinitionImp,
                                                              /*String*/parameterString,
                                                              /*int optional*/insertPosition
                                                              ) {
            var params = viewDefinitionImp.getParameters();
            AddToListCommand.add(this.parser,this.resolver,viewDefinitionImp,params,insertPosition,parameterString,this);
            if (insertPosition === undefined) {
                insertPosition = 0;
            }
            var newParams = viewDefinitionImp.getParameters();
            if (insertPosition >= newParams.length) {
                insertPosition = newParams.length - 1;
            }
            return newParams[insertPosition];
        };

        return AddParameterCommand;
    }
);