// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The SupportTicket service.
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.services.SupportTicket");

    /**
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getService("SupportTicket")</code>.
     * Constructs a new instance of the support ticket service.
     *
     * @param {object}
     *            oAdapter the service adapter for the support ticket service,
     *            as already provided by the container
     * @param {object}
     *            oContainerInterface the interface provided by the container
     * @param {string}
     *            sParameters the runtime configuration specified in the
     *            <code>sap.ushell.Container.getService()</code> call (not
     *            evaluated yet)
     * @param {object}
     *            oServiceConfiguration the service configuration defined in the
     *            bootstrap configuration; the boolean property
     *            <code>enabled</code> controls the service enablement
     *
     * This service is disabled by default. It can be enabled explicitly in the
     * bootstrap configuration of the start page:
     * <pre>
     * window[&quot;sap-ushell-config&quot;] = {
     *     services: {
     *         SupportTicket: {
     *             config: {
     *                 enabled: true
     *             }
     *         }
     *     }
     * }
     *
     * Platform implementations can also enable it dynamically by modification of the
     * bootstrap configuration during boot time.
     *
     * @class The Unified Shell's Support Ticket service
     *
     * @public
     * @constructor
     * @see sap.ushell.services.Container#getService
     *
     * @since 1.19.1
     *
     */
    sap.ushell.services.SupportTicket = function (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        var oServiceConfig = (oServiceConfiguration && oServiceConfiguration.config) || {};

        /**
         * Creates a Support Ticket. Forwards the given data (JSON object) to the associated adapter.
         *
         * @param {JSON} oSupportTicketData JSON object containing the input fields required for the support ticket.
         * @returns {object} promise
         * @public
         * @since 1.20.0
         */
        this.createTicket = function (oSupportTicketData) {
            return oAdapter.createTicket(oSupportTicketData);
        };

        /**
         * Checks if the service is enabled.
         * <p>
         * The service enablement depends on the configuration in the back-end system and the bootstrap configuration.
         *
         * @return {boolean} <code>true</code> if the service is enabled; <code>false</code> otherwise
         *
         * @public
         * @since 1.20.0
         */
        this.isEnabled = function () {
            return oServiceConfig.enabled === true;
        };
    };
}());
