/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

(function() {

    if (typeof window.sap !== "object" && typeof window.sap !== "function") {
        window.sap = {};
    }

    if (typeof window.sap.hana !== "object") {
        window.sap.hana = {};
    }

    if (typeof window.sap.hana.cst !== "object") {
        window.sap.hana.cst = {};
    }

    if (typeof window.sap.hana.cst.common !== "object") {
        window.sap.hana.cst.common = {};
    }

    sap.hana.cst.common.sqlcodecompletion = {
        DEBUG_ENABLED: sap.watt.getEnv("debugMode"),
        COMMON_IMAGES_PATH: "/sap/hana/cst/common/images/"
    };
}());