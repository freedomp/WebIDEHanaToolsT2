(function () {
    "use strict";
    /*global jQuery, sap */

    jQuery.sap.declare("sap.ovp.cards.generic.Component");
    jQuery.sap.require("sap.ui.core.UIComponent");
    jQuery.sap.require("sap.ovp.cards.AnnotationHelper");

    sap.ui.core.UIComponent.extend("sap.ovp.cards.generic.Component", {
        // use inline declaration instead of component.json to save 1 round trip
        metadata: {
            properties: {
                "contentFragment": {
                    "type": "string"
                },
                "headerExtensionFragment": {
                    "type": "string"
                },
                "contentPosition": {
                    "type": "string",
                    "defaultValue": "Middle"
                },
                "footerFragment": {
                    "type": "string"
                }
            },
            version: "1.32.5",

            library: "sap.ovp",

            includes: [],

            dependencies: {
                libs: [ "sap.m" ],
                components: []
            },
            config: {}
        },

        /**
         * Default "abstract" empty function.
         * In case there is a need to enrich the default preprocessor which provided by OVP, the extended Component should provide this function and return a preprocessor object.
         * @public
         * @returns {Object} SAPUI5 preprocessor object
         */
        getCustomPreprocessor: function () {},

        getPreprocessors : function() {
            var oComponentData = this.getComponentData(),
                oSettings = oComponentData.settings,
                oModel = oComponentData.model,
                oMetaModel,
                oEntityTypeContext,
                oEntitySetContext;

            if (oModel){
                var oMetaModel = oModel.getMetaModel();
                var oEntitySet = oMetaModel.getODataEntitySet(oSettings.entitySet);
                var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
                var oEntityContainer = oMetaModel.getODataEntityContainer();

                var setIndex = 0;
                for (; setIndex < oEntityContainer.entitySet.length; setIndex++) {
                    if (oEntityContainer.entitySet[setIndex] === oEntitySet) {
                        break;
                    }
                }

                oEntitySetContext = oMetaModel.createBindingContext(oEntityContainer.$path + "/entitySet/" + setIndex);

                oEntityTypeContext = oMetaModel.createBindingContext(oEntityType.$path);
            }

            var oCardProperties = this._getCardPropertyDefaults();

            oCardProperties = jQuery.extend(true, {metaModel: oMetaModel, entityType: oEntityType}, oCardProperties, oSettings);

            var oOvpCardPropertiesModel = new sap.ui.model.json.JSONModel(oCardProperties);

            var oDefaultPreprocessors = {
                xml: {
                    bindingContexts: {entityType: oEntityTypeContext, entitySet: oEntitySetContext},
                    models: {entityType: oMetaModel, entitySet:oMetaModel, ovpMeta: oMetaModel, ovpCardProperties: oOvpCardPropertiesModel},
                    ovpCardProperties: oOvpCardPropertiesModel,
                    _ovpCache: {}
                }
            };

            return jQuery.extend(true, {}, this.getCustomPreprocessor(), oDefaultPreprocessors);
        },

        _getCardPropertyDefaults: function(){
            var oCardProperties = {};
            var oPropsDef = this.getMetadata().getAllProperties();
            var oPropDef;
            for (var propName in oPropsDef){
                oPropDef = oPropsDef[propName];
                if (oPropDef.defaultValue){
                    oCardProperties[oPropDef.name] = oPropDef.defaultValue;
                }
            }
            return oCardProperties;
        },

        createContent: function () {
            var oComponentData = this.getComponentData && this.getComponentData();
            var oModel = oComponentData.model;
            var oPreprocessors = this.getPreprocessors();

            var oView;
            oView = sap.ui.view({
                preprocessors: oPreprocessors,
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "sap.ovp.cards.generic.Card"
            });

            oView.setModel(oModel);
            oView.setModel(oPreprocessors.xml.ovpCardProperties, "ovpCardProperties");

            return oView;
        }
    });
})();
