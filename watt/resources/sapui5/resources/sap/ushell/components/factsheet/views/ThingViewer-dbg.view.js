(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.require("sap.ushell.components.factsheet.tools.ODataUrlTemplating");
    sap.ui.jsview("sap.ushell.components.factsheet.views.ThingViewer", {

        getControllerName : function () {
            return "sap.ushell.components.factsheet.views.ThingViewer";
        },
        createContent : function (oController) {
            var sEntityUrl, sAnnotationUrl, sEntityUrlTemplate, oTI, oViewData;
            oViewData = this.getViewData();

            jQuery.sap.require("sap.ushell.components.factsheet.factory.ThingInspector");

            // Sample Hash UI2_DEMO_PRODUCT-DisplayFactSheet~6bpO?ProductID=HT-1000
            sEntityUrl = oViewData.entity || oViewData.service;// Old Parameter Name was Service
            if (!sEntityUrl) {
                sEntityUrlTemplate = oViewData.entityTemplateURI || oViewData.template;
                
                if (sEntityUrlTemplate) {
                    // Parameters may be arrays 
                    if (typeof sEntityUrlTemplate !== "string") {
                        sEntityUrlTemplate = sEntityUrlTemplate[0];
                    }
                    //regEx = /{[A-Za-z0-9_]*}/g;
                    //Depending on the basis version it is possible, that the value of sEntityUrlTemplate is double encoded.
                    //Therefor the following decoding was implemented as a workaround.
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%25/g, "%");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%28/g, "(");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%29/g, ")");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%27/g, "'");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%3D/g, "=");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%7B/g, "{");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%7D/g, "}");

                    sEntityUrl = sap.ushell.components.factsheet.tools.ODataUrlTemplating.resolve(sEntityUrlTemplate, oViewData);
                  }

            }
            sAnnotationUrl = oViewData.annotationURI || oViewData.annotation;

            if (typeof sEntityUrl !== "string") {
                sEntityUrl = sEntityUrl[0];
            }
            if (typeof sAnnotationUrl !== "string") {
                sAnnotationUrl = sAnnotationUrl[0];
            }
            
            if (oViewData["sap-system"] && oViewData["sap-system"][0] && (oViewData["sap-system"][0].substr(0,4) === "sid(")) {
                sEntityUrl = sEntityUrl.substr(0, sEntityUrl.lastIndexOf("/")) + ";o=" + sEntityUrl.substr(sEntityUrl.lastIndexOf("/"));
                sEntityUrl = sap.ushell.Container.getService("URLParsing").addSystemToServiceUrl(sEntityUrl);
            }

            oTI = sap.ushell.components.factsheet.factory.ThingInspector(sEntityUrl, sAnnotationUrl);

            //Add min-height
            oTI.addStyleClass("ThingInspector");
            return oTI;
        }
    });
}());