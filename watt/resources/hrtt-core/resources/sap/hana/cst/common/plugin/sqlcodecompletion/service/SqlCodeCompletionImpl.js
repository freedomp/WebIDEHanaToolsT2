/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(
    ["../content/ContentAssist",
        "../Constant"
    ],

    function(ContentAssist) {

        "use strict";

        return {

            _mContentAssists: {},

            _sCurrentSchema: null,

            _sCurrentService: null,

            configure: function(mConfig) {},

            init: function() {},

            onAfterSetSelection: function(oEvent) {
                var that = this;
                var aSelection = oEvent.params.selection;
                if (oEvent.params.owner.instanceOf("sap.hana.cst.common.sqlcodecompletion.interface.SqlSchemaProvider")) {
                    return oEvent.params.owner.getCurrentSqlSchema().then(function(schema) {
                        that._sCurrentSchema = schema;
                    });
                } else {
                    var oItem = aSelection[0];
                    if (oItem && oItem.document) {
                        var oEntity = oItem.document.getEntity();
                        if (oEntity && oEntity.getCurrentSchema) {
                            this._sCurrentSchema = oEntity.getCurrentSchema();
                            this._sCurrentService = oEntity.getServiceName();
                        } 
                    }
                }
            },

            getWordSuggestions: function(oContentStatus) {
                try {
                    oContentStatus.prefix = oContentStatus.prefix || "";
                    var oContentAssist = new ContentAssist(this.context, this._sCurrentSchema, this._sCurrentService);

                    return oContentAssist.computeProposals(oContentStatus);

                } catch (e) {
                    console.debug(e);
                }
            },

            setCurrentService: function (serviceName){  
               this._sCurrentService = serviceName; 
            }
        };

    });