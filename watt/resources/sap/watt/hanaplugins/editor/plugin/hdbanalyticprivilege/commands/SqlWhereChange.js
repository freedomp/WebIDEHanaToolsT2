/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
        var SqlWhereChange = function(oAceEditor, oData) {
            var command = {};
            command.editor = oAceEditor;
            command.isRedo = false;
            command.oData = oData;
            command.execute = function(model, events) {
                

                if(this.isRedo){
                    console.log("SqlWhereChange.redo");
                    console.log(this);
                    oAceEditor.redo();
                }else{
                    this.isRedo = true;
                    console.log("SqlWhereChange.execute");
                    console.log(this);
                }

                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            command.undo = function(model, events) {
                console.log("SqlWhereChange.undo");
                oAceEditor.undo();
                console.log(this); 
                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            return command;
        };

    return SqlWhereChange;
});
