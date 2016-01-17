(function() {
    "use strict";

    // import modules
    // =======================================================================    
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.userpref.SearchPrefsModel');
    var SearchPrefsModel = sap.ushell.renderers.fiori2.search.userpref.SearchPrefsModel;


    // search preferences administration functions
    // =======================================================================    
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.userpref.SearchPrefs');
    var module = sap.ushell.renderers.fiori2.search.userpref.SearchPrefs = {};
    jQuery.extend(module, {

        model: new SearchPrefsModel(),

        getEntry: function() {

            var that = this;

            return {

                title: sap.ushell.resources.i18n.getText('sp.userProfiling'),
                editable: true,
                isSearchPrefsActive: that.model.isSearchPrefsActive.bind(that.model),

                // determines status to be shown in list of all user prefs
                value: function() {
                    that.model.reset(); // force data reload
                    return that.model.asyncInit().then(function() {
                        return that.model.getProperty('/sessionUserActive') ?
                            sap.ushell.resources.i18n.getText('sp.on') :
                            sap.ushell.resources.i18n.getText('sp.off');
                    });
                },

                // save prefs
                onSave: function() {
                    return that.model.savePreferences();
                },

                // cancel dialog
                onCancel: function() {},

                // assemble dialog
                content: function() {
                    return that.model.asyncInit().then(function() {
                        var userProfilingView = sap.ui.view({
                            id: 'searchPrefsView',
                            type: sap.ui.core.mvc.ViewType.JS,
                            viewName: 'sap.ushell.renderers.fiori2.search.userpref.SearchPrefsDialog'
                        });
                        userProfilingView.setModel(that.model);
                        return userProfilingView;
                    });
                }

            };
        }

    });

})();
