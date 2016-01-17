/*eslint-disable max-params*/
define(["commonddl/sourcemodification/AddSelectListEntryCommand","commonddl/sourcemodification/AddAliasForSelectListEntryCommand",
    "commonddl/sourcemodification/AddAnnotationForSelectListEntryCommand","commonddl/sourcemodification/AddAnnotationForViewDefinitionCommand",
    "commonddl/sourcemodification/ModifyAnnotationForViewDefinitionCommand","commonddl/sourcemodification/AddParameterCommand",
    "commonddl/sourcemodification/ModifyAnnotationForSelectListEntryCommand","commonddl/sourcemodification/ModifyEndUserTextCommand",
    "commonddl/sourcemodification/MoveSelectListEntryCommand","commonddl/sourcemodification/RemoveAliasForSelectListEntryCommand",
    "commonddl/sourcemodification/ReplaceSelectListEntryCommand","commonddl/sourcemodification/ReplaceParameterCommand",
    "commonddl/sourcemodification/RemoveSelectListEntryCommand","commonddl/sourcemodification/RemoveParameterCommand",
    "commonddl/sourcemodification/RemoveAnnotationCommand","commonddl/sourcemodification/SetWhereClauseCommand",
    "commonddl/sourcemodification/RemoveWhereClauseCommand","commonddl/sourcemodification/AddCaseStatementCommand",
    "commonddl/sourcemodification/UpdateCaseStatementCommand"],
    function(AddSelectListEntryCommand,AddAliasForSelectListEntryCommand,AddAnnotationForSelectListEntryCommand,
             AddAnnotationForViewDefinitionCommand,ModifyAnnotationForViewDefinitionCommand,AddParameterCommand,
             ModifyAnnotationForSelectListEntryCommand,ModifyEndUserTextCommand,MoveSelectListEntryCommand,RemoveAliasForSelectListEntryCommand,
             ReplaceSelectListEntryCommand,ReplaceParameterCommand,RemoveSelectListEntryCommand,RemoveParameterCommand,
             RemoveAnnotationCommand,SetWhereClauseCommand,RemoveWhereClauseCommand,AddCaseStatementCommand,
             UpdateCaseStatementCommand) {
        function SourceModificationCommandFactory(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        SourceModificationCommandFactory.prototype.createAddSelectListEntryCommand = function() {
            return new AddSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createAddAliasForSelectListEntryCommand = function() {
            return new AddAliasForSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createAddAnnotationForSelectListEntryCommand = function() {
            return new AddAnnotationForSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createAddAnnotationForViewDefinitionCommand = function() {
            return new AddAnnotationForViewDefinitionCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createModifyAnnotationForViewDefinitionCommand = function() {
            return new ModifyAnnotationForViewDefinitionCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createAddParameterCommand = function() {
            return new AddParameterCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createModifyAnnotationForSelectListEntryCommand = function() {
            return new ModifyAnnotationForSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createModifyEndUserTextCommand = function() {
            return new ModifyEndUserTextCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createMoveSelectListEntryCommand = function() {
            return new MoveSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createRemoveAliasForSelectListEntryCommand = function() {
            return new RemoveAliasForSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createReplaceSelectListEntryCommand = function() {
            return new ReplaceSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createReplaceParameterCommand = function() {
            return new ReplaceParameterCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createRemoveSelectListEntryCommand = function() {
            return new RemoveSelectListEntryCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createRemoveParameterCommand = function() {
            return new RemoveParameterCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createRemoveAnnotationCommand = function() {
            return new RemoveAnnotationCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createSetWhereClauseCommand = function() {
            return new SetWhereClauseCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createRemoveWhereClauseCommand = function() {
            return new RemoveWhereClauseCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createAddCaseStatementCommand = function() {
            return new AddCaseStatementCommand(this.parser,this.resolver);
        };

        SourceModificationCommandFactory.prototype.createUpdateCaseStatementCommand = function() {
            return new UpdateCaseStatementCommand(this.parser,this.resolver);
        };

        return SourceModificationCommandFactory;
    });
