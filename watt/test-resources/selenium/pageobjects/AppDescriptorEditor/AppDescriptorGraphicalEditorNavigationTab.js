var utils = require('../Utils');

module.exports = function (driver, By, until, configuration) {
	'use strict';


    function _xpathEndsWith(sAttributeName, sEndsWith) {
        return '\"' + sEndsWith + '\"=substring(@' + sAttributeName + ', string-length(@' + sAttributeName + ')-string-length(\"' + sEndsWith + '\")+1)';
    }

    var mappings = {
        //Inbound Table
        inboundIntentTableAddButton : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTable") + ']//button[span[@aria-label="Add"]]'},
        inboundIntentTableRemoveButton : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTable") + ']//button[span[@aria-label="less"]]'},
        inboundIntentTableFirstRow: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTable") + ']//tbody//tr[1]'},
        inboundIntentTableSecondRow: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTable") + ']//tbody//tr[2]'},
        inboundIntentTableSemanticObjectTextField: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTable") + ']//tbody//tr[1]//td[1]//input'},
        inboundIntentTableActionTextField: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTable") + ']//tbody//tr[1]//td[2]//input'},
        //Inbound Tile
        inboundTileDetailsTitleTextField : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "tileDetails") + ']//input[' + _xpathEndsWith("aria-labelledby", "intentTitle") + ']'},
        inboundTileDetailsSubtitleTextField : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "tileDetails") + ']//label[.="Subtitle"]/../following-sibling::div[1]//input'},
        inboundTileDetailsTilePreviewControl : {type: 'xpath', path: ''},
        inboundTileDetailsDataSourceTextField : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "tileDetails") + ']//label[.="Data Source"]/../following-sibling::div[1]//input'},
        inboundTileDetailsPathTextField : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "tileDetails") + ']//label[.="Path"]/../following-sibling::div[1]//input'},
        inboundTileDetailsRefreshIntervalTextField : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "tileDetails") + ']//label[.="Refresh Interval"]/../following-sibling::div[1]//input'},
        //Inbound Parameters
        inboundParametersTableAddButton : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//button[span[@aria-label="Add"]]'},
        inboundParametersTableRemoveButton : {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//button[span[@aria-label="less"]]'},
        inboundParametersTableFirstRow: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[1]'},
        inboundParametersTableSecondRow: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[2]'},
        inboundParametersTableValueTextField: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[1]//td[2]//input'},
        //Value format combo
        inboundParametersTableValueFormatComboBox: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[1]//td[3]//input'},
        inboundParametersTableValueFormatComboBoxList: {type: 'css', path: '#sap-ui-static ul[role="listbox"]'},
        inboundParametersTableValueFormatComboBoxListFirstItem: {type: 'css', path: '#sap-ui-static ul[role="listbox"] li:first-child'},
        //Required
        //inboundParametersTableRequiredChekcBox: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[1]//td[4]//input'},
        inboundParametersTableFilterValueTextField: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[1]//td[5]//input'},
        //Filter Format
        inboundParametersTableFilterFormatComboBox: {type: 'xpath', path: '//div[' + _xpathEndsWith("id", "appDescriptorIntentTableParams") + ']//tbody//tr[1]//td[6]//input'},
        inboundParametersTableFilterFormatComboBoxList: {type: 'css', path: '#sap-ui-static ul[role="listbox"]'},
        inboundParametersTableFilterFormatComboBoxListFirstItem: {type: 'css', path: '#sap-ui-static ul[role="listbox"] li:first-child'}                   
    };

	utils.decorateDriver(driver, until);


	return {

		waitUntilTabIsDirty : function(sFilePath) {
			var sTabLocator = utils.toLocator(mappings.dirtyTab, [sFilePath]);
			return driver.myWait(sTabLocator);
		},

		waitUntilTabIsNotDirty : function(sFilePath) {
			var sTabLocator = utils.toLocator(mappings.undirtyTab, [sFilePath]);
			return driver.myWait(sTabLocator);
		}
	};

};