/*
 * RequireJS module with API:
 * <ul>
 * <li>AdtErrorDataContentHandlerXml
 * <li>public methods of AdtErrorDataContentHandlerXml
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
    [ "../util/AdtCheckUtil" ],
    function (AdtCheckUtil) {

        "use strict";

        var AdtErrorDataContentHandlerXml = new function () { // Singleton

            /**
             * Deserializes the XML representation of ADT error data.
             * <p>
             * Remark:<br>
             * ADT error data can be returned in the response from the ABAP server, see AdtRestResource.
             * </p>
             * @param {string} xml - Content to be deserialized
             * @returns {object} adtErrorData object
             */
            this.deserialize = function (xml) {

                AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtRestResource.deserialize", "xml", xml);

                var xmlDoc = jQuery.parseXML(xml);
                var xmlElem = jQuery(xmlDoc);

                var adtErrorData = {};
                adtErrorData.message = { text: xmlElem.find("message").text(), //$NON-NLS-1$
                    language: xmlElem.find("message").attr("lang") };  //$NON-NLS-1$  //$NON-NLS-2$
                adtErrorData.namespace = xmlElem.find("namespace").attr("id");  //$NON-NLS-1$  //$NON-NLS-2$
                adtErrorData.type = xmlElem.find("type").attr("id");  //$NON-NLS-1$  //$NON-NLS-2$
                adtErrorData.localizedMessage = { text: xmlElem.find("localizedMessage").text(), //$NON-NLS-1$
                    language: xmlElem.find("localizedMessage").attr("lang") }; //$NON-NLS-1$ //$NON-NLS-2$
                adtErrorData.getProperty = function (id) {
                    var entries = xmlElem.find("entry");  //$NON-NLS-1$
                    for (var i = 0; i < entries.length; i++) {
                        if (jQuery(entries[i]).attr("key") === id) {  //$NON-NLS-1$
                            return jQuery(entries[i]).text();
                        }
                    }
                };
                return adtErrorData;
            };
        };

        return AdtErrorDataContentHandlerXml; // requireJS module
    });