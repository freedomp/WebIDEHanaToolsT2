/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
        var SqlStackChange = function(oAceEditor, oData) {
            var command = {};
            command.editor = oAceEditor;
            command.isRedo = false;
            command.oData = oData;
            command.execute = function(model, events) {

                if(this.isRedo){
                    oAceEditor.redo();
                }else{
                    this.isRedo = true;
                }

                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            command.undo = function(model, events) {
                oAceEditor.undo();
                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            return command;
        };

    return SqlStackChange;
});
