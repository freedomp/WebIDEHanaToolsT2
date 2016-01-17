var utils = require('./Utils'),
    _ = require('lodash'),
    promise = require('selenium-webdriver').promise;

module.exports = function (driver, By, until, configuration) {
    var mappings = {
        addNewConfigurationButton: {
            type: 'css',
            path: "button[type='button'][title='Add configuration'][aria-disabled=false]"
        },
        webApplicationConfiguration: {type: 'css', path: 'li[title="Web Application"][role="option"]'},
        urlComponentsTab: {type: 'css', path: 'li[title="URL Components"][role="tab"]'},
        advancedSettingsTab: {type: 'css', path: 'li[title="Advanced Settings"][role="tab"]'},
        generalTab: {type: 'css', path: 'li[title="General"][role="tab"]'},
        saveAndRunButton: {type: 'css', path: 'button[id="runbtn_dialog"]'},
        unitTestConfiguration: {type: 'css', path: 'li[title="Unit Test"][role="option"]'},
        fioriSandboxConfiguration: {type: 'css', path: 'li[title="SAP Fiori Component on Sandbox"][role="option"]'},
        componentOnLaunchpadConfiguration: {
            type: 'css',
            path: 'li[title="Component on Launchpad (Embedded Mode)"][role="option"]'
        }
    };

    var _clickAButton = function (mapping) {
        var toLocator = utils.toLocator(mapping);
        return driver.myWaitAndClick(toLocator, configuration.defaultTimeout);
    };

    return {
        newRunConfiguration: function () {
            _clickAButton(mappings.addNewConfigurationButton);
        },

        chooseWebApplication: function () {
            _clickAButton(mappings.webApplicationConfiguration);
        },

        clickURLComponentsTab: function () {
            _clickAButton(mappings.urlComponentsTab);
        },

        clickAdvancedSettingsTab: function () {
            _clickAButton(mappings.advancedSettingsTab);
        },

        clickGeneralTab: function () {
            _clickAButton(mappings.generalTab);
        },

        clickRun: function () {
            _clickAButton(mappings.saveAndRunButton);
        },

        chooseUnitTest: function () {
            _clickAButton(mappings.unitTestConfiguration);
        },

        chooseFioriSandbox: function () {
            _clickAButton(mappings.fioriSandboxConfiguration);
        },

        chooseEmbedded: function () {
            _clickAButton(mappings.componentOnLaunchpadConfiguration);
        }

    };

};