/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([], function() {

    var DROP_OPTION = {
        prefix: "<drop_option>",
        template: "CASCADE|RESTRICT",
        category: "sql.placeholder.option"
    };
    
    var ISOLATION_LEVEL = {
        prefix: "<isolation_level>",
        template: "ISOLATION LEVEL READ COMMITTED|ISOLATION LEVEL REPEATABLE READ|ISOLATION LEVEL SERIALIZABLE",
        category: "sql.placeholder.option"
    };
    
    var TXN_ACCESS_MODE = {
        prefix: "<transaction_access_mode>",
        template: "READ ONLY|READ WRITE",
        category: "sql.placeholder.option"
    };

    var _parseContants = function(oConstant) {
        var aReturns = [];
        var aPrefixes = oConstant.prefix.split("|");
        var aTemplates = oConstant.template.split("|");
        var sCategory = oConstant.category;
        var i = 0,
            j = 0;
        for (i = 0; i < aPrefixes.length; i++) {
            var sPrefix = aPrefixes[i];
            for (j = 0; j < aTemplates.length; j++) {
                var sTemplate = aTemplates[j];
                var oTemplate = {};
                oTemplate.prefix = sPrefix;
                oTemplate.description = sTemplate;
                oTemplate.template = sTemplate;
                oTemplate.category = sCategory;
                aReturns.push(oTemplate);
            }
        }
        return aReturns;
    };

    return {
        _aDataTypes: [],

        getPlaceholders: function() {
            if (!this._aDataTypes || this._aDataTypes.length === 0) {
                this._aDataTypes = this._aDataTypes.concat(_parseContants(DROP_OPTION)
                .concat(_parseContants(ISOLATION_LEVEL))
                .concat(_parseContants(TXN_ACCESS_MODE))
                );
            }
            return this._aDataTypes;
        }
    };
});