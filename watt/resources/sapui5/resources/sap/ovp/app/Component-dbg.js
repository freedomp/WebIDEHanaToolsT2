(function () {
    "use strict";
    /*global sap, jQuery */

    /**
     * @fileOverview Application component to display information on entities from the GWSAMPLE_BASIC
     *   OData service.
     * @version 1.32.5
     */
    jQuery.sap.declare("sap.ovp.app.Component");
    jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");

    sap.ui.core.UIComponent.extend("sap.ovp.app.Component", {
        // use inline declaration instead of component.json to save 1 round trip
        metadata: {

            properties: {
                "cardContainerFragment": {
                    "type": "string",
                    "defaultValue": "sap.ovp.app.CardContainer"
                }
            },

            version: "1.32.5",

            library: "sap.ovp.app",

            dependencies: {
                libs: [ "sap.m",
                    "sap.ui.comp",
                    "sap.uxap"
                ],
                components: []
            },
            config: {
                fullWidth: true,
                hideLightBackground: true
            }
        },

        createContent: function () {
            var ovpConfig = this.getMetadata().getManifestEntry("sap.ovp");
            var appConfig = this.getMetadata().getManifestEntry("sap.app");
            var uiConfig = this.getMetadata().getManifestEntry("sap.ui");
            var sIcon = jQuery.sap.getObject("icons.icon", undefined, uiConfig);

            var sComponentName = this.getMetadata().getComponentName();
            ovpConfig.baseUrl = jQuery.sap.getModulePath(sComponentName);
            var uiModel = new sap.ui.model.json.JSONModel(ovpConfig);

            uiModel.setProperty("/title", jQuery.sap.getObject("title", undefined, appConfig));
            uiModel.setProperty("/description", jQuery.sap.getObject("description", undefined, appConfig));
            uiModel.setProperty("/cardContainerFragment", this.getCardContainerFragment());

            if (sIcon){
                if (sIcon.charAt(0) !== '/'){
                    sIcon = ovpConfig.baseUrl + "/" + sIcon;
                }
                uiModel.setProperty("/icon", sIcon);
            }

            //convert cards object into sorted array
            var oCards = ovpConfig.cards;
            var aCards = [];
            var oCard;
            for (var cardKey in oCards){
                if (oCards.hasOwnProperty(cardKey)) {
                    oCard = oCards[cardKey];
                    oCard.id = cardKey;
                    aCards.push(oCard);
                }
            }

            aCards.sort(function(card1, card2){
                if (card1.id < card2.id){
                    return -1;
                } else if (card1.id > card2.id){
                    return 1;
                } else {
                    return 0;
                }
            });

            uiModel.setProperty("/cards", aCards);

            this.setModel(uiModel, "ui");
            this.setModel(this.getModel(ovpConfig.globalFilterModel));

            return sap.ui.view({
                height: "100%",
                preprocessors: {
                    xml: {
                        bindingContexts: {ui: uiModel.createBindingContext("/")},
                        models: {ui: uiModel}
                    }
                },
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "sap.ovp.app.Main"
            });
        }

    });
}());
