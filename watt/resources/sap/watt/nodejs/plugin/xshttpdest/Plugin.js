define(function() {
	"use strict";

    return {
        initialize: function() {
            this.context.service.aceeditor.setModuleUrl('ace/mode/xshttpdest',jQuery.sap.getModulePath("sap.hana.ide.editor.editors.xshttpdest") + "/mode/mode-xshttpdest.js").done();
        }
    };
});