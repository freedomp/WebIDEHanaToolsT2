/*global jQuery, sap, document */
(function() {
    "use strict";

    // import modules
    // =======================================================================    
    jQuery.sap.require("sap.m.MessageBox");

    // search preferences dialog view
    // =======================================================================        
    sap.ui.jsview("sap.ushell.renderers.fiori2.search.userpref.SearchPrefsDialog", {

        createContent: function(oController) {
            var that = this;

            // switch button for sessionUserActive (switch on/off user profiling)
            var switchButton = new sap.m.Switch({
                state: {
                    path: "/sessionUserActive",
                    mode: sap.ui.model.BindingMode.TwoWay
                },
                enabled: {
                    parts: [{
                        path: '/searchPrefsActive'
                    }, {
                        path: '/personalizationPolicy'
                    }],
                    formatter: function(searchPrefsActive, personalizationPolicy) {
                        var model = that.getModel();
                        if (searchPrefsActive &&
                            personalizationPolicy !== model.personalizationPolicyEnforced &&
                            personalizationPolicy !== model.personalizationPolicyDisabled) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    mode: sap.ui.model.BindingMode.OneWay
                }
                //change: this.switchChangeHandler.bind(this)
            });

            // label for switch button
            var userProfilingLabel = new sap.m.Label({
                text: sap.ushell.resources.i18n.getText("sp.userProfilingField") + ':'
            });

            // reset button
            this.resetButton = new sap.m.Button({
                text: sap.ushell.resources.i18n.getText("sp.clearCollectedData"),
                press: this.resetHistory.bind(this),
                enabled: {
                    parts: [{
                        path: '/searchPrefsActive'
                    }, {
                        path: '/personalizationPolicy'
                    }],
                    formatter: function(searchPrefsActive, personalizationPolicy) {
                        var model = that.getModel();
                        if (searchPrefsActive &&
                            personalizationPolicy !== model.personalizationPolicyDisabled) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    mode: sap.ui.model.BindingMode.OneWay
                }
            });

            // explanation text (disclaimer)
            var explanationText = new sap.m.Text({
                text: sap.ushell.resources.i18n.getText('sp.disclaimer')
            });

            // assemble 
            var content = [userProfilingLabel, switchButton, explanationText, this.resetButton];
            return content;
        },

        resetHistory: function() {
            var that = this;
            this.getModel().resetProfile().then(function() {
                that.resetButton.setEnabled(false);
            }, function(response) {
                var errorText = sap.ushell.resources.i18n.getText('sp.resetFailed');
                if (response.statusText && response.statusText.length > 0 && response.statusText !== 'OK') {
                    errorText += '(' + response.statusText + ')';
                }
                sap.m.MessageBox.show(errorText, {
                    title: sap.ushell.resources.i18n.getText("sp.resetFailedTitle"),
                    icon: sap.m.MessageBox.Icon.ERROR,
                    actions: [sap.m.MessageBox.Action.OK]
                });
            });
        },

        switchChangeHandler: function(e) {
            // depreceated confirmation when switch off query log
            var oSwitch = e.getSource();
            if (oSwitch.getState()) {
                return;
            }
            var i18n = sap.ushell.resources.i18n;
            var disableText = i18n.getText("sp.disable");
            sap.m.MessageBox.confirm(i18n.getText('sp.disablingUserProfiling'), {
                title: sap.ushell.resources.i18n.getText("sp.disableUserProfiling"),
                icon: sap.m.MessageBox.Icon.QUESTION,
                actions: [disableText, sap.m.MessageBox.Action.CANCEL],
                onClose: function(oAction) {
                    if (oAction == sap.m.MessageBox.Action.CANCEL) {
                        oSwitch.setState(true);
                    }
                }
            });
        },

        openMessageBox: function() {
            // depreceated confirmation when reseting query log
            var that = this;
            var i18n = sap.ushell.resources.i18n;
            var clearText = i18n.getText("sp.clear");
            sap.m.MessageBox.confirm(i18n.getText('sp.profileWillBeReset'), {
                title: sap.ushell.resources.i18n.getText("sp.clearCollectedData"),
                icon: sap.m.MessageBox.Icon.QUESTION,
                actions: [clearText, sap.m.MessageBox.Action.CANCEL],
                onClose: function(oAction) {
                    if (oAction == clearText) {
                        that.getModel().resetProfile();
                    }
                }
            });
        }

    });

}());
