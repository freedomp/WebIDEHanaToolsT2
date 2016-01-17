/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/SearchField"], function(SearchField) {

    var SearchFieldPlaceholder = SearchField.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.SearchFieldPlaceholder", {

        metadata: {
            properties: {
                "placeholder": "string"
            }
        },

        renderer: {
            renderInnerAttributes: function(oRm, oSearchField) {
                oRm.writeAttributeEscaped('placeholder', oSearchField.getPlaceholder());
                oRm.addStyle('background-color', '#fff'); // this change could also be done with plain CSS!!   
            }
        }
    });

    //return SearchFieldPlaceholder;
});
