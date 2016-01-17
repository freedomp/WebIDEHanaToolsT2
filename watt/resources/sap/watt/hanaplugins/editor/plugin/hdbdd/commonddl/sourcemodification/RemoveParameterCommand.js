define(["../../rndrt/rnd", "commonddl/sourcemodification/ReplaceParameterCommand"],
    function(rnd, ReplaceParameterCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function RemoveParameterCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        RemoveParameterCommand.prototype.removeParameter = function(/*ParameterImpl*/parameter) {
            new ReplaceParameterCommand(this.parser,this.resolver).replaceParameter(parameter,"");
        };

        return RemoveParameterCommand;
    }
);