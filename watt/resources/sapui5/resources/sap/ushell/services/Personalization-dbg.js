// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's personalization service, which provides
 *               generic read and write access to the currently logged on user's
 *               personalization settings for the app currently executed in the
 *               shell.
 *
 * @version
 * 1.32.6
 */
(function () {
    "use strict";
    /*jslint nomen: true, bitwise: false */
    /*jshint bitwise: false */
    /*global jQuery, sap, setTimeout, clearTimeout, window */
    jQuery.sap.declare("sap.ushell.services.Personalization");
    // this file introduces
    // jQuery.sap.declare("sap.ushell.services.Personalization.WindowAdapter");
    jQuery.sap.require("sap.ushell.utils");
    jQuery.sap.require("sap.ui.core.format.DateFormat");
    // TODO conditional loading

    var sCONTAINER_PREFIX = "sap.ushell.personalization#",
        sITEM_PREFIX = "ITEM#",
        sVARIANT_PREFIX = "VARIANTSET#",
        sABAPTIMESTAMPFORMAT = "yyyyMMddHHmmss",
        sADMIN_PREFIX = "ADMIN#",
        sITEMKEY_SCOPE = "sap-ushell-container-scope",
        sITEMKEY_STORAGE = "sap-ushell-container-storageUTCTimestamp",
        sITEMKEY_EXPIRE = "sap-ushell-container-expireUTCTimestamp";
    function addContainerPrefix(sContainerKey) {
        return sCONTAINER_PREFIX + sContainerKey;
    }


    /*
     * Implementation note:
     *
     * ITEM#<itemkey>
     * VARIANTSET#<variantset>
     * sap-ushell-container-scope : {   }
     * sap-ushell-container-
     */


    // ---------------------
    // ------ Service ------
    // ---------------------
    /**
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getService("Personalization")</code>.
     * Constructs a new instance of the personalization service.
     *
     * @param {object} oAdapter
     *            the service adapter for the personalization service,
     *            as already provided by the container
     *
     * @class The Unified Shell's personalization service, which provides a
     *        personalizer object that handles all personalization operations.
     *
     * @public
     * @constructor
     * @see sap.ushell.services.Container#getService
     *
     * @since 1.15.0
     */
    sap.ushell.services.Personalization = function (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._oConfig = oConfig;
        this._sSeed = jQuery.sap.getObject("config.seed", undefined, oConfig) || "ABC";
        this._oAdapterWithBackendAdapter = new sap.ushell.services.Personalization.WindowAdapter(this, oAdapter);
        this._oAdapterWindowOnly =  new sap.ushell.services.Personalization.WindowAdapter(this, undefined);
        this._supportsGetWithoutSubsequentLoad = (oAdapter && oAdapter.supportsGetWithoutSubsequentLoad === true);
        this._oContainerMap = new sap.ushell.utils.Map();
        // map: sPrefixedContainerKey -> promise object of getPersonalizationContainer
        this._oPendingOperationsMap = new sap.ushell.utils.Map();
        // map: sContainerKey -> pending operation (deferred object, potentially extended with _sapTimeoutId, _sapFnSave)
    };

    sap.ushell.services.Personalization.prototype.SAVE_DEFERRED_DROPPED = "Deferred save dropped (OK) - Data superseeded by subsequent save";
    //constants for scope of personalization service
    sap.ushell.services.Personalization.prototype.constants = {
        keyCategory : {
            "FIXED_KEY" : "FIXED_KEY",
            "GENERATED_KEY" : "GENERATED_KEY"
        },
        writeFrequency : {
            "HIGH" : "HIGH",
            "LOW" : "LOW"
        }
    };

    /**
     * Returns a generated key
     *
     * @returns {string}
     *            40 character string consisting of A-Z and 0-9 which can be used as a generated key for personalization
     *            container. Every invocation returns a new key.
     *            NOTE: Don't use substrings of this key as random keys
     *
     * @public
     * @since 1.28.0
     */
    sap.ushell.services.Personalization.prototype.getGeneratedKey = function () {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            sDate = new Date().getTime().toString(),
            sResult = "",
            sConcatResult,
            nHash = 0,
            i;
        // assure _sSeed is longer than 40 characters
        while (this._sSeed.length < 40) {
            this._sSeed = this._sSeed + Math.random().toString().substring(2);
        }
        // use the random seed for the first 3 characters
        for (i = 0; i < 3; i = i + 1) {
            nHash = this._sSeed.charCodeAt(i) + 31 * nHash;
            nHash = nHash & nHash; // Convert to 32bit integer
            sResult = sResult + CHARS[Math.abs(nHash % 36)];
        }
        //to make sure there are at least 40 characters
        sConcatResult = Math.random().toString().substring(2) + sDate + Math.random().toString().substring(2) + sDate + "1234523413542345698772";
        for (i = 0; i < 37; i = i + 1) {
            nHash = this._sSeed.charCodeAt(i) + parseInt(sConcatResult[i], 10) + 31 * nHash;
            nHash = nHash & nHash; // Convert to 32bit integer
            sResult = sResult + CHARS[Math.abs(nHash % 36)];
        }
        return sResult.substring(0, 40);
    };

    /**
     * Returns a personalizer object which handles personalization by
     * asynchronous operations storing the personalization data immediately via
     * the connected adapter. For each operation a round trip is executed.
     *
     * Do not mix the usage of a personalizer and a personalization container
     * for one containerKey.
     *
     * @param {object} oPersId
     *            JSON object consisting of the following parts:
     *            container - Identifies the set of personalization data that is
     *            loaded/saved as one bundle from the front-end server. item - The
     *            name of the object the personalization is applied to.
     * @param {object} oScope - scope object<br/>
     *            currently the validity property of the scope object is relevant:
     *            oScope.validity : validity of the container persistence in minutes<br/>
     *            oScope.keyCategory : Type or category of key<br/>
     *            oScope.writeFrequency : Expected frequency how often users will use this container to store data inside<br/>
     *            oScope.clientStorageAllowed : Defines if storage on client side should be allowed or not<br/>
     *            E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.
     * @param {sap.ui.component} oComponent
     *           Since 1.27.0.
     *           SAPUI5 component which uses the personalizer. This allows to associate the stored
     *           data with the application.
     *
     * @returns {object}
     *            {@link sap.ushell.services.Personalizer} which provides generic read and
     *            write access to the currently logged on user's personalization
     *            settings.
     *
     * @public
     * @since 1.15.0
     */
    sap.ushell.services.Personalization.prototype.getPersonalizer = function (oPersId, oScope, oComponent) {
        return new sap.ushell.services.Personalizer(this, this._oAdapterWithBackendAdapter, oPersId, oScope, oComponent);
    };

    /**
     * Returns a transient personalizer object which handles personalization by
     * asynchronous operations storing the personalization data transiently as
     * an object property. Primary usage of the transient personalizer is a
     * personalization scenario with variants where the transient personalizer
     * is used as a buffer for table personalization data.
     *
     * @returns {object}
     *            {@link sap.ushell.services.TransientPersonalizer} which
     *            provides asynchronous read and write access to a transient personalization data storage.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.prototype.getTransientPersonalizer = function () {
        return new sap.ushell.services.TransientPersonalizer();
    };


    /**
     * Checks if given value is part of enum
     * @returns {boolean}
     * @private
     */
    function checkIfEntryExistsInEnum(entry, passedEnum) {
        var enumElement;
        for (enumElement in passedEnum) {
            if (typeof passedEnum[enumElement] !== 'function') {
                if (passedEnum.hasOwnProperty(enumElement)) {
                    if (enumElement === entry) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * construct a cleansed scope object, returning only valid recognized parameters
     * This functionality is used to cleanse user input
     * @private
     */
    sap.ushell.utils.testPublishAt(sap.ushell.services.Personalization);
    function rectifyScope(oScope) {
        var oConstants = sap.ushell.services.Personalization.prototype.constants,
            // default scope values
            oDefaultScope = {
                validity : Infinity,
                keyCategory : oConstants.keyCategory.GENERATED_KEY,
                writeFrequency: oConstants.writeFrequency.HIGH,
                clientStorageAllowed: false
            };
        if (!oScope) {
            return oDefaultScope;
        }
        oDefaultScope.validity = oScope && oScope.validity;
        if (oDefaultScope.validity === null || oDefaultScope.validity === undefined || typeof oDefaultScope.validity !== "number") {
            oDefaultScope.validity = Infinity;
        }
        if (!(typeof oDefaultScope.validity === "number" &&  ((oDefaultScope.validity >= 0 && oDefaultScope.validity < 1000) || oDefaultScope.validity === Infinity))) {
            oDefaultScope.liftime = Infinity;
        }

        oDefaultScope.keyCategory = checkIfEntryExistsInEnum(oScope.keyCategory, oConstants.keyCategory) ? oScope.keyCategory : oDefaultScope.keyCategory;
        oDefaultScope.writeFrequency = checkIfEntryExistsInEnum(oScope.writeFrequency, oConstants.writeFrequency) ? oScope.writeFrequency : oDefaultScope.writeFrequency;
        if (typeof oScope.clientStorageAllowed === 'boolean' && (oScope.clientStorageAllowed === true || oScope.clientStorageAllowed === false)) {
            oDefaultScope.clientStorageAllowed = oScope.clientStorageAllowed;
        }

        //Combination of FixKey & CrossUserRead is an illegal combination because the user who was creating the container is no longer available
        //The other users have no chance to write on that container
        //if (oDefaultScope.keyCategory === oConstants.keyCategory.FIXED_KEY && oDefaultScope.access === oConstants.access.CROSS_USER_READ) {
        //    throw new sap.ushell.utils.Error("Wrong defined scope. FixKey and CrossUserRead is an illegal combination: sap.ushell.services.Personalization");
        // }
        return oDefaultScope;
    }


    sap.ushell.utils.testPublishAt(sap.ushell.services.Personalization);
    function rectifyScopePickAdapter(sContainerKey, oScope, _oAdapterWithBackendAdapter, _oAdapterWindowOnly) {
        var sPrefixedContainerKey = "",
            bLaunchpadReload,
            oAdapterForScope;
        if (typeof sContainerKey !== "string") {
            throw new sap.ushell.utils.Error("sContainerKey is not a string: sap.ushell.services.Personalization");
        }
        if (sContainerKey.length > 40) {
            jQuery.sap.log.error("Personalization Service container key (\"" + sContainerKey + "\") should be less than 40 characters [current :" + sContainerKey.length + "]");
        }
        oScope = rectifyScope(oScope);
        sPrefixedContainerKey = addContainerPrefix(sContainerKey);
        bLaunchpadReload = window["sap-ushell-config"] && window["sap-ushell-config"].services &&
            window["sap-ushell-config"].services.ShellNavigation &&
            window["sap-ushell-config"].services.ShellNavigation.config &&
            window["sap-ushell-config"].services.ShellNavigation.config.reload;
            // default = false
        oAdapterForScope = _oAdapterWithBackendAdapter;
        if (oScope && oScope.validity === 0) {
            if (bLaunchpadReload) {
                oScope.validity = 1440; // 24h
                                        // reason: balance between risk of loosing parameters while navigation and
                                        // data amount per user
            } else {
                oAdapterForScope = _oAdapterWindowOnly;
            }
        }
        return { oAdapterForScope : oAdapterForScope,
            oScope : oScope,
            sPrefixedContainerKey : sPrefixedContainerKey
            };
    }

    /**
     * Factory method to obtain a Data Context object,
     * which is a local copy of the persistence layer data.
     * The Container data is asynchronously read on creation if present,
     * otherwise an initial object is created.
     * The Container data can then be *synchronously* modified (getItemValue, setItemValue).
     * Only on invoking  the save()/saveDeferred() method the data is transferred to the persistence.
     * This allows the application to perform multiple local modifications and
     * delay the save operation.
     *
     * Every getContainer operation returns a new local copy, containing the full data at the point of creation.
     *
     * Executing load() on the container reloads the data from the persistence, discarding local changes.
     *
     * Note that the container allows the application to
     * control the round trips to the front-end server persistence. The factory method
     * getContainer is asynchronous and loads the container via
     * the connected adapter from the front-end server. All operations (but for the
     * save operation) are executed synchronously, operating on the local data.
     * This allows the application to control the round trips to the front-end server
     * persistence.
     *
     * A container can contain a set of items, identified by a key.
     *
     * You can wrap a container in a VariantSetAdapter to read and write
     * a more complex structure (with multiple keys (variantSet,variant,item)).
     *
     * Do not mix up the usage of a personalizer and a container
     * for one containerKey.
     * Do not use a PersonalizationContainer and a Container for the same key except for migration scenarios.
     *
     * scope / validity parameter (@since 1.22.0):
     *   An unspecified (undefined validity) or infinite (Infinity) validity indicates that data is persisted in the
     *   Personalization data of the front-end server. A round trip is executed on an initial get and at least every save operation.
     *   Data is stored per user and retained indefinitely at the front-end server.
     *
     *   The validity parameter allows a designated storage validity for the created container.
     *   A 0 validity indicates the data is only persisted within the Fiori Launchpad window.
     *   No round trips to the front-end server are executed. Data is lost if the Fiori Launchpad window state is lost
     *   (e.g. by navigating to a different page, pressing F5 (reload page) or duplicating the window).
     *
     *   For versions > 1.24 it may happen that for cross-app navigation a reload of the Fiori Launchpad is triggered.
     *   In this case a storage of the personalization data in the Fiori lauchpad window would lead to data loss.
     *   To overcome this a validity 0 is automatically changed to a validity 1440 (24h; storage on the front-end server).
     *   This is only done if a relaod of the Fiori Launchpad is triggered for a cross-app navigation.
     *
     * Security: It is the responsibility of the application to not persist information relevant to auditing or security
     * using the PersonalizationService with inappropriate validity models. No mechanisms exist
     * to destroy or selectively destroy application-specific data in the front-end server persistence (especially for validity Infinity).
     *
     * For non-zero validity scopes, data will be transmitted and persisted in the front-end server system.
     *
     * For limited validity, actual deletion of data on the front-end server is subject to explicit cleanup execution of front-end server jobs
     * and not guaranteed. The data may still be persisted and retrievable. The interface only assures that expired data is no longer
     * exposed to the application code in the Fiori Launchpad.
     *
     * The ContainerKey uniquely defines the Container, validity is not part of the key (there are no separate
     * namespaces per validity).
     *
     * In general, mixing different validity models for a given container key is not supported.
     * Fast chaining of different methods may source arbitrary persistence layers.
     * The validity of the resulting object in the done function of a promise is the last get validity.
     *
     * The validity associated with the last getContainer or createEmptyContainer determines
     * the current validity of the container and the validity used during the next save operation.
     *
     * Naturally, if a delete or get with validity 0 is issued, it will *not* delete or retrieve a front-end server persistent
     * storage
     * Thus a sequence  delete( [validity 0])/wait for promise, getContainer(sKey,{ validity : Infinity}) may return a valid dataset.
     *
     * @param {string}
     *            sContainerKey - identifies the container
     *            The string length is restricted to 40 characters
     * @param {Object} oScope - scope object<br/>
     *            currently the validity property of the scope object is relevant:
     *            E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.<br/>
     *            oScope.validity : validity of the container persistence in minutes<br/>
     *              valid values include 0 ( per FLP Window), <br/>
     *                           Infinity, undefined  (front-end server persistence per user ) [Default] <br/>
     *                           nn Minutes (front-end server persistence per user, ignored if older than nn minutes)
     * @param {sap.ui.component} oComponent
     *           Since 1.27.0.
     *           SAPUI5 component which uses the container. This allows to associate the stored
     *           data with the application.
     *
     * @returns {object} Promise object whose done function returns a
     *            {@link sap.ushell.services.Personalization.ContextContainer} object
     *            as parameter. The container provides setItemValue / getItemValue methods
     *            to synchronously operate on personalization data.
     *            By wrapping it in a VariantSetAdapter, an alternate interface to maintain variants can be obtained.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.prototype.getContainer = function (sContainerKey, oScope, oComponent) {
        return this._createContainer(sContainerKey, oScope, false, oComponent);
    };

    /**
    * Factory method to obtain an empty Data Context object.
    * When data present in a prior context is not relevant
    * (e.g. when using a "uniquely" generated key and planning to
    * overwrite any colliding front-end server data).
    *
    * The call always returns an cleared container().
    *
    * Note that an existing container at the front-end server is not actually deleted or overwritten
    * unless a save operation is executed.
    *
    *
    * An initial object is returned.
    * @param {string}
    *            sContainerKey - identifies the container
     *            The string length is restricted to 40 characters
    * @param {Object} oScope - scope object
    *            currently the validity property of the scope object is relevant:
    *            E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.<br/>
    *            oScope.validity : validity of the container persistence in minutes
    *              valid values include 0 ( per FLP Window),
    *                           Infinity, undefined  ( Backend persistence per user ) [Default]
    *                           nn Minutes ( Backend persistence per user, ignored if older than nn minutes)
    * @param {sap.ui.component} oComponent
    *           Since 1.27.0.
    *           SAPUI5 component which uses the container. This allows to associate the stored
    *           data with the application.
    *
    * @returns {object} Promise object whose done function returns a
    *            {@link sap.ushell.services.Personalization.ContextContainer} object
    *            as parameter. The personalization container provides two different
    *            interfaces to synchronously operate on personalization data.
    *            In the item mode the container contains items as name value pairs for
    *            personalization data.
    *            In the variant mode the container contains variant sets which contain
    *            variants containing items.
    * @public
    * @since 1.22.0
    */
    sap.ushell.services.Personalization.prototype.createEmptyContainer = function (sContainerKey, oScope, oComponent) {
        return this._createContainer(sContainerKey, oScope, true, oComponent);
    };

    sap.ushell.services.Personalization.prototype._createContainer = function (sContainerKey, oScope, bCreateEmpty, oComponent) {
        var oDeferred = new jQuery.Deferred(),
            res,
            oLoadPromise,
            oContainer;
        res = rectifyScopePickAdapter(sContainerKey, oScope, this._oAdapterWithBackendAdapter,
            this._oAdapterWindowOnly);
        oContainer = new sap.ushell.services.Personalization.ContextContainer(this,
            res.oAdapterForScope, res.sPrefixedContainerKey, res.oScope, oComponent);
        // historically, a sequence getContainer / load was always called
        // if an adapter supports returning an initialized container without
        // requiring an subsequent load,
        // he can set the flag supportsGetWithoutSubsequentLoad and the load call will be omitted if
        // an empty container is required
        if (bCreateEmpty && this._supportsGetWithoutSubsequentLoad) {
            oLoadPromise = new jQuery.Deferred();
            oLoadPromise.resolve(oContainer);
        } else {
            oLoadPromise = oContainer.load();
        }
        // TODO force asynchronous response
        // requires unit test adaptation which relies on synchronous reponse
        //setTimeout(function () {
            // must do load and clear ...
        oLoadPromise.fail(function () {
            oDeferred.reject();
        }).done(function () {
            if (bCreateEmpty || oContainer._isExpired()) {
                oContainer.clear();
            }
            oDeferred.resolve(oContainer);
        });
        //}, 0);
        return oDeferred.promise();
    };


    /**
     * Asynchronously starts a deletion request for the given container identified by
     * sContainerKey. Can be called without having ever called getContainer with the corresponding key
     *
     * Note: After invoking this operation, the state of other Containers
     * obtained for the same key is undefined!
     * If you want to use the container after deletion, it is strongly recommended to obtain
     * a new instance of a container for the given key *after* the promise has returned.
     *
     * Note: Invoking this operation while another save or load operation is under way may result in failure.
     *
     * @param {string} sContainerKey
     *           identifies the container
     *
     * @returns {object}
     *          promise for the deletion operation
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.prototype.delContainer = function (sContainerKey, oScope) {
        // delete the bag, the adapter container & the container
        var oDeferred = {},
            oPrior,
            sPrefixedContainerKey = "",
            that = this;
        oScope = rectifyScope(oScope);
        sPrefixedContainerKey = addContainerPrefix(sContainerKey);
        oDeferred = new jQuery.Deferred();

        oPrior = that._pendingContainerOperations_cancelAddNext(sContainerKey, null);
        oPrior.always(function () {
            that.getContainer(sContainerKey, oScope)  // delays to oPrior! registers a new op!
                .fail(function () {
                    that._pendingContainerOperations_cancelAddNext(sContainerKey, oDeferred); // reinstall oPrior (!)
                    oDeferred.reject();
                })
                .done(function (oContainer) {
                    var oAdapter;
                    // install the "latest" deferred
                    that._pendingContainerOperations_cancelAddNext(sContainerKey, oDeferred); // the getContainer above executed a load --> no flush required
                    if (oScope.validity === 0) {
                        oAdapter = that._oAdapterWindowOnly;
                    } else {
                        oAdapter = that._oAdapterWithBackendAdapter;
                    }
                    oAdapter.delAdapterContainer(sPrefixedContainerKey, oScope)
                        .fail(function () {
                            oDeferred.reject();
                        })
                        .done(function () {
                            oDeferred.resolve();
                        });
                });
        });
        return oDeferred.promise();
    };


    // return old promise,
    // add oDeferred as new, if null , retain old!
    sap.ushell.services.Personalization.prototype._pendingContainerOperations_flushAddNext = function (sContainerKey, oDeferred) {
        var oPendingOpDeferred,
            fnSave;
        oPendingOpDeferred = this._oPendingOperationsMap.get(sContainerKey);
        if (!oPendingOpDeferred) {
            oPendingOpDeferred = new jQuery.Deferred();
            oPendingOpDeferred.resolve();
        }
        if (oDeferred !== null) {
            this._oPendingOperationsMap.put(sContainerKey, oDeferred);
        }
        if (!oPendingOpDeferred || oPendingOpDeferred.state() !== "pending") {
            return oPendingOpDeferred;
        }
        clearTimeout(oPendingOpDeferred._sapTimeoutId); //system function!
        oPendingOpDeferred._sapTimeoutId = undefined;
        if (typeof oPendingOpDeferred._sapFnSave === "function") {
            fnSave = oPendingOpDeferred._sapFnSave;
            oPendingOpDeferred._sapFnSave = undefined; // function can only be triggered at most one time
            fnSave();
        }
        return oPendingOpDeferred;
    };


    sap.ushell.services.Personalization.prototype._pendingContainerOperations_cancelAddNext = function (sContainerKey, oDeferred) {
        var oPendingOpDeferred;
        oPendingOpDeferred = this._oPendingOperationsMap.get(sContainerKey);
        if (!oPendingOpDeferred) {
            oPendingOpDeferred = new jQuery.Deferred();
            oPendingOpDeferred.resolve();
        }
        if (oDeferred !== null) {
            this._oPendingOperationsMap.put(sContainerKey, oDeferred);
        }
        if (!oPendingOpDeferred || oPendingOpDeferred.state() !== "pending") {
            return oPendingOpDeferred;
        }
        if (oPendingOpDeferred._sapTimeoutId) {
            clearTimeout(oPendingOpDeferred._sapTimeoutId);
            oPendingOpDeferred._sapTimeoutId = undefined;
            oPendingOpDeferred.resolve(sap.ushell.services.Personalization.prototype.SAVE_DEFERRED_DROPPED);
        }
        return oPendingOpDeferred;
    };

     /**
     * This interface is deprecated since 1.22,
     * please use getContainer / delContainer.
     *
     * Note: the underlying storage model for Objects stored with getContainer / getPersonalizationContainer
     * is identical.<br/>
     * Thus you can safely migrate your client implementation from the deprecated getContainer to
     * getPersonalizationContainer without loss of data.
     * One may even run mixed set of applications on the same container keys.
     * The sole differences are w.r.t. client side handling of the Context data within one session.
     *
     * If you want to use the variant interface, use the following pattern
     * <code>
     *  getContainer(sContainerKey).done(function(oContainer) {
     *     var variantSetAdapter = new sap.ushell.services.Personalization.VariantSetAdapter(oContainer);
     * }
     * </code>
     *
     *
     * Factory method to obtain a personalization container
     * object which is a client-local buffer for personalization data.
     * The Container data is asynchronously read on creation (if present,
     * otherwise an initial object is created).
     * The Container data can then be *synchronously* modified (read/write/delete).
     * Only on invoking  the save() method the data is persisted at the front-end server.
     * This allows the application to perform multiple local modifications and
     * delay the save operation.
     * Note that the personalization container allows the application to
     * control the round trips to the front-end server persistence. The factory method
     * getPersonalizationContainer is asynchronous and loads the container via
     * the connected adapter from the front-end server. All operations (but for the
     * save operation) are executed synchronously, operating on the local data.
     * This allows the application to control the round trips to the front-end server
     * persistence.
     *
     * A personalization container can contain items as well as variant sets.
     * Variant sets have the following structure:
     * variantSet.variant.item
     * A variant set is enclosing several variants of the same data.
     *
     * Example: An application has two types of variants.
     * Variant type 1 contains filter values for a query, which are stored in item 1 of
     * the variant, and personalization data for a table, which are stored in item 2
     * of the variant.
     * Variant type 2 contains a setting (item 3) that is independent of
     * the filtering and the table settings. It might be used for a different
     * screen than the variants of type 1.
     * In this example you would have 2 variant sets, one for each variant type.
     *
     * Do not mix up the usage of a personalizer and a personalization container
     * for one containerKey.
     *
     * @param {string}
     *            sContainerKey - identifies the container
     *
     * @returns {object} Promise object whose done function returns a
     *            {@link sap.ushell.services.PersonalizationContainer} object
     *            as parameter. The personalization container provides two different
     *            interfaces to synchronously operate on personalization data.
     *            In the item mode the container contains items as name-value pairs for
     *            personalization data.
     *            In the variant mode the container contains variant sets which contain
     *            variants containing items.
     *
     * @deprecated use getContainer()
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.prototype.getPersonalizationContainer = function (sContainerKey) {
        var sPrefixedContainerKey = "",
            oPromiseContainer = {},
            oDeferred = {};

        if (typeof sContainerKey !== "string") {
            throw new sap.ushell.utils.Error("sContainerKey is not a string: sap.ushell.services.Personalization");
        }
        sPrefixedContainerKey = addContainerPrefix(sContainerKey);
        if (this._oContainerMap.containsKey(sPrefixedContainerKey)) {
            return this._oContainerMap.get(sPrefixedContainerKey).promise();
        }
        oDeferred = new jQuery.Deferred();
        oPromiseContainer = new sap.ushell.services.PersonalizationContainer(this._oAdapterWithBackendAdapter, sPrefixedContainerKey);
        oPromiseContainer
            .done(function (oContainer) {
                oDeferred.resolve(oContainer);
            })
            .fail(function (oContainer) {
                oDeferred.reject(oContainer);
            });
        this._oContainerMap.put(sPrefixedContainerKey, oDeferred);
        return oDeferred.promise();
    };

    /**
     * @deprecated Please use getContainer / delContainer
     * Asynchronously starts a deletion request for the given container identified by
     * sContainerKey. Can be called without having ever created a personalization container.
     *
     * Note: After invoking this operation, the state of other PersonalizationContainers
     * obtained for the same key is undefined!
     * If you want to use the container after deletion, it is strongly recommended to obtain
     * a new instance of PersonalizationContainer for the given key *after* the promise has returned.
     *
     * Note: Invoking this operation while another save or load operation is under way may result in failure.
     *
     * @param {string} sContainerKey
     *           identifies the container
     *
     * @returns {object}
     *          promise for the deletion operation
     *
     * @deprecated
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.prototype.delPersonalizationContainer = function (sContainerKey) {
        // delete the bag, the adapter container & the container
        var oDeferred = {},
            sPrefixedContainerKey = "",
            that = this;

        sPrefixedContainerKey = addContainerPrefix(sContainerKey);
        oDeferred = new jQuery.Deferred();
        this.getPersonalizationContainer(sContainerKey)
            .fail(function () {
                oDeferred.reject();
            })
            .done(function (oContainer) {
                that._oAdapterWithBackendAdapter.delAdapterContainer(sPrefixedContainerKey)
                    .fail(function () {
                        oDeferred.reject();
                    })
                    .done(function () {
                        that._oContainerMap.remove(sPrefixedContainerKey);
                        oDeferred.resolve();
                    });
            });
        return oDeferred.promise();
    };

    // --------------------------
    // ------ Personalizer ------
    // --------------------------
    /**
     * To be called by the personalization service getPersonalizer method.
     *
     * @class The Unified Shell personalizer providing set get delete
     *        methods to access the persisted personalization data in direct mode.
     *
     * @public
     * @since 1.15.0
     */
    sap.ushell.services.Personalizer = function (oService, oAdapter, oPersId, oScope, oComponent) {
        this._sPersContainer = "";
        this._sPersItem = "";
        this._sPersVariant = null;
        this._oAdapter = oAdapter;
        this._oService = oService;
        this._oScope = oScope;
        this._oComponent = oComponent;

        if (!oPersId || !oPersId.container || !oPersId.item ||
                typeof oPersId.container !== "string" || typeof oPersId.item !== "string") {
            throw new sap.ushell.utils.Error("Invalid input for oPersId: sap.ushell.services.Personalization");
        }
        this._sPersContainer = oPersId.container; // prefix is added in container constructor
        this._sPersItem = oPersId.item;
    };

    sap.ushell.services.Personalizer.prototype._getContainer = function (sPersContainer) {
        if (!this._oGetContainerPromise) {
            this._oGetContainerPromise = this._oService.getContainer(sPersContainer, this._oScope, this._oComponent);
        }
        return this._oGetContainerPromise;
    };

    /**
     * Gets a personalization data value.
     *
     * @returns {object}
     *          Promise object which provides the personalization value.
     *          Promise object done function: param {object} oValue JSON
     *          object containing the personalization value. If there is no
     *          personalization data for the item, undefined is returned. Promise
     *          object fail function: param {string} sMessage Error message.
     *
     * @public
     * @since 1.15.0
     */
    sap.ushell.services.Personalizer.prototype.getPersData = function () {
        // async
        var oDeferred = {},
            that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function (oContainer) {
                oDeferred.resolve(oContainer.getItemValue(that._sPersItem));
            });

        oDeferred.fail(function () {
            jQuery.sap.log.error("Fail to get Personalization data for Personalizer container: " + that._sPersContainer);
        });
        return oDeferred.promise();
    };

    /**
     * Sets a personalization data value.
     *
     * @param {object} oValue
     *          JSON object containing the personalization value.
     * @returns {object}
     *          Promise object which returns if the saving was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise object fail function: param {string} sMessage
     *          Error message
     *
     * @public
     * @since 1.15.0
     */
    sap.ushell.services.Personalizer.prototype.setPersData = function (oValue) {
        // async
        var oDeferred = {},
            that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function (oContainer) {
                oContainer.setItemValue(that._sPersItem, oValue);
                oContainer.save()
                    .fail(function () {
                        // TODO
                        oDeferred.reject();
                    })
                    .done(function () {
                        oDeferred.resolve();
                    });
            });

        oDeferred.fail(function () {
            jQuery.sap.log.error("Fail to set Personalization data for Personalizer container: " + that._sPersContainer);
        });
        return oDeferred.promise();
    };
    /**
     * Deletes a personalization data value.
     *
     * @returns {object}
     *          Promise object which returns if the deletion was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise object fail function: param {string} sMessage
     *          Error message.
     *
     * @public
     * @since 1.15.0
     */
    sap.ushell.services.Personalizer.prototype.delPersData = function () {
        // async
        var oDeferred = {},
            that = this,
            oMessagingPromise;

        oDeferred = new jQuery.Deferred();
        this._oService.getPersonalizationContainer(this._sPersContainer)
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function (oContainer) {
                oContainer.delItem(that._sPersItem);
                oContainer.save()
                    .fail(function () {
                        // TODO
                        oDeferred.reject();
                    })
                    .done(function () {
                        oDeferred.resolve();
                    });
            });

        oMessagingPromise = oDeferred.promise();
        oMessagingPromise.fail(function () {
            jQuery.sap.log.error("Fail to delete Personalization data for Personalizer container: " + this._sPersContainer);
        });
        return oMessagingPromise;
    };

    // -----------------------------------
    // ------ TransientPersonalizer ------
    // -----------------------------------
    /**
     * To be called by the personalization service getTransientPersonalizer method.
     *
     * @class The transient personalizer shall be used
     *        in container mode for table personalization.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.TransientPersonalizer = function () {
        this._oValue = undefined;
    };

    /**
     * Gets a personalization data value.
     *
     * @returns {object}
     *          Promise object which provides the personalization
     *          value. Promise object done function: param {object} oValue JSON
     *          object containing the personalization value. If there is no
     *          personalization data for the item, undefined is returned.
     *          Promise object fail function ins never triggered.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.TransientPersonalizer.prototype.getPersData = function () {
        var oDeferred;

        oDeferred = new jQuery.Deferred();
        oDeferred.resolve(this._oValue);
        return oDeferred.promise();
    };

    /**
     * Sets a personalization data value.
     *
     * @param {object} oValue
     *          JSON object containing the personalization value.
     * @returns {object}
     *          Promise object which returns if the saving was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise fail function ins never triggered.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.TransientPersonalizer.prototype.setPersData = function (oValue) {
        var oDeferred;

        oDeferred = new jQuery.Deferred();
        this._oValue = oValue;
        oDeferred.resolve();
        return oDeferred.promise();
    };

    /**
     * Deletes a personalization data value.
     *
     * @returns {object}
     *          Promise object which returns if the deletion was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise object fail function ins never triggered.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.TransientPersonalizer.prototype.delPersData = function () {
        var oDeferred;

        oDeferred = new jQuery.Deferred();
        this._oValue = undefined;
        oDeferred.resolve();
        return oDeferred.promise();
    };

    /**
     * Synchronously sets a personalization data value.
     *
     * @param {object} oValue
     *            JSON object containing the personalization value.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.TransientPersonalizer.prototype.setValue = function (oValue) {
        this._oValue = oValue;
    };

    /**
     * Synchronously gets a personalization data value.
     *
     * @returns {object}
     *            JSON object containing the personalization value.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.TransientPersonalizer.prototype.getValue = function () {
        return this._oValue;
    };

    // -----------------------
    // ------ Container ------
    // -----------------------
    /**
     * To be called by the personalization service getPersonalizationContainer method.
     *
     * @class The personalization container is the anchor object of the unified shell
     *        personalization in container mode.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer = function (oAdapter, sContainerKey) {
        this._sContainerKey = sContainerKey;
        this._oAdapterContainer = {};
        this._aLoadedVariantSetKeys = [];
        this._aLoadedItemKeys = [];
        var oDeferred = {},
            that = this;

        this._init();
        oDeferred = new jQuery.Deferred();
        if (!this._sContainerKey || typeof this._sContainerKey !== "string") {
            throw new sap.ushell.utils.Error("Invalid container key: sap.ushell.services.Personalization");
        }
        // get adapter container & load
        this._oAdapterContainer = oAdapter.getAdapterContainer(this._sContainerKey);
        this.load()
            .fail(function () {
                oDeferred.reject();
            })
            .done(function () {
                oDeferred.resolve(that);
            });
        return oDeferred.promise();
    };

    sap.ushell.services.PersonalizationContainer.prototype._init = function () {
        // resets all member variables of the personalization container
        this._oVariantSetMap = {};
        this._oItemMap = {};
        this._aLoadedVariantSetKeys = [];
        this._aLoadedItemKeys = [];
        this._oVariantSetMap = new sap.ushell.utils.Map();
        this._oItemMap = new sap.ushell.utils.Map();
    };

    function clone(oObject) {
        if (oObject === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(JSON.stringify(oObject));
        } catch (e) {
            return undefined;
        }
    }

    function cloneToObject(oObject) {
        if (oObject === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(oObject);
        } catch (e) {
            return undefined;
        }
    }

/**
 * (Re)loads the current container data from the underlying storage asynchronously.
 * The current local data is discarded.
 *
 * Returns a promise for the load operation.
 * If another save/load/delete operation is not completed, the  operation may fail!
 * (wait for the other promise).
 *
 * Synchronous read and write operations before the load is done have undefined
 * effects.
 *
 * @returns {object}
 *          Promise object
 *
 * @public
 * @since 1.18.0
 */
    sap.ushell.services.PersonalizationContainer.prototype.load = function () {
        var oDeferred = {},
            aItemAndVaraintSetKeys = [],
            aVariantSetKeys = [],
            aItemKeys = [],
            aMigratedItemKeys = [],
            that = this;
        function migrateItemsToPrefix(aItemKeys) {
            // aItemKeys contains prefixed keys and unprefixed keys
            var aNonPrefixKeys = [],
                aPrefixKeys = [];

            aNonPrefixKeys = aItemKeys.filter(function (s) {
                return s.indexOf(sITEM_PREFIX) !== 0;
                // match at first character -> index = 0 -> false -> filter out
                // match inside the string -> index > 0 -> true -> keep
                // no match -> index = -1 -> true -> keep
            });
            if (aNonPrefixKeys.length === 0) {
                return aItemKeys;
            }
            aPrefixKeys = aItemKeys.filter(function (s) {
                return s.indexOf(sITEM_PREFIX) === 0;
                // match at first character -> index = 0 -> true -> keep
                // match inside the string -> index > 0 -> false -> filter out
                // no match -> index = -1 -> false -> filter out
            });
            aNonPrefixKeys.forEach(function (sItemKey) {
                var oItemValue = {},
                    sPrefixedItemKey = "";
                sPrefixedItemKey = sITEM_PREFIX + sItemKey;
                oItemValue = clone(that._oAdapterContainer.getItemValue(sItemKey));
                // create a new prefixed item at the container
                that._oAdapterContainer.setItemValue(sPrefixedItemKey, oItemValue);
                    // delete the non prefixed item at the container
                that._oAdapterContainer.delItem(sItemKey);
                if (jQuery.inArray(sPrefixedItemKey, aPrefixKeys) === -1) {
                    aPrefixKeys.push(sPrefixedItemKey);
                }
            });
            return aPrefixKeys;
        }

        oDeferred = new jQuery.Deferred();
        if (!this._sContainerKey) {
            throw new sap.ushell.utils.Error("Invalid container key: sap.ushell.services.Personalization");
        }
        // delete local data
        this._init();
        // get adapter container & load
        this._oAdapterContainer.load()
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function () {
                aItemAndVaraintSetKeys = that._oAdapterContainer.getItemKeys().splice(0);
                aVariantSetKeys = aItemAndVaraintSetKeys.filter(function (s) {
                    return s.indexOf(sVARIANT_PREFIX) === 0;
                    // match at first character -> index = 0 -> true -> keep
                    // match inside the string -> index > 0 -> false -> filter out
                    // no match -> index = -1 -> false -> filter out
                });
                aVariantSetKeys.forEach(function (sVariantSetKey) {
                    var oVariantSet = {};
                    oVariantSet = new sap.ushell.services.PersonalizationContainerVariantSet(sVariantSetKey, that._oAdapterContainer);
                    that._oVariantSetMap.put(sVariantSetKey, oVariantSet);
                });
                aItemKeys = aItemAndVaraintSetKeys.filter(function (s) {
                    return s.indexOf(sVARIANT_PREFIX) !== 0;
                    // match at first character -> index = 0 -> false -> filter out
                    // match inside the string -> index > 0 -> true -> keep
                    // no match -> index = -1 -> true -> keep
                });
                aMigratedItemKeys = migrateItemsToPrefix(aItemKeys);
                aMigratedItemKeys.forEach(function (sItemKey) {
                    that._oItemMap.put(sItemKey, clone(that._oAdapterContainer.getItemValue(sItemKey)));
                });
                that._aLoadedVariantSetKeys = that._oVariantSetMap.keys().splice(0);
                that._aLoadedItemKeys = that._oItemMap.keys().splice(0);
                oDeferred.resolve();
            });
        return oDeferred.promise();
    };

    // -- common interface --
    /**
     * Attempts to save the current container data at the underlying storage asynchronously.
     * The current state is serialized.
     * @returns {object}
     *             Promise object
     *
     * If another save/load/delete operation is not completed, the  operation may fail!
     * (wait for the other promise).
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.save = function () {
        // async
        var oSaveContainer,
            oInnerPromise;
        this._serializeVariantSets();
        this._serializeItems();

        oSaveContainer = new jQuery.Deferred();
        function fnSaveSuccess() {
            oSaveContainer.resolve();
        }
        function fnSaveError() {
            oSaveContainer.reject();
        }
        try {
            oInnerPromise = this._oAdapterContainer.save(); // promise
            oInnerPromise.fail(fnSaveError);
            oInnerPromise.done(fnSaveSuccess);
        } catch (e) {
            oSaveContainer.reject();
        }
        return oSaveContainer.promise();
    };

    // -- item interface --
    /**
     * Returns an array with the keys of direct items in the container.
     * @returns {array}
     *             item keys
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys().map(function (sEntry) {
            return sEntry.replace(sITEM_PREFIX, "", "");
        });
    };

    /**
     * Returns the value for a direct item from the container.
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the container does not contain a direct item with this key
     * <code>undefined</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.get(sITEM_PREFIX + sItemKey);
    };

    /**
     * Checks if a specific direct item is contained in the container.
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a direct item with the key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(sITEM_PREFIX + sItemKey);
    };

    /**
     * Sets the value of a direct item in the container.
     * In case the item is already existing its value is overwritten. In case it is not
     * existing a new item with this key and value is created.
     * @param {string} sItemKey
     *            item key
     * @param {object} sItemValue
     *            item value (JSON object)
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization");
        }
        this._oItemMap.put(sITEM_PREFIX + sItemKey, oItemValue);
    };

    /**
     * Deletes a direct item from the container.
     * In case the item does not exist, nothing happens.
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        if (this.containsItem(sItemKey)) {
            this._oItemMap.remove(sITEM_PREFIX + sItemKey);
        }
    };

    sap.ushell.services.PersonalizationContainer.prototype._serializeItems = function () {
        var aItemKeys = [],
            aDiff = [],
            that = this;

        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach(function (sItemKey) {
            that._oAdapterContainer.setItemValue(sItemKey, clone(that._oItemMap.get(sItemKey)));
        });
        aDiff = this._aLoadedItemKeys.filter(function (sItemKey) {return !(aItemKeys.indexOf(sItemKey) > -1); });
        aDiff.forEach(function (sItemKey) {
            that._oAdapterContainer.delItem(sItemKey);
        });
    };

    // -- variant interface --
    /**
     * Returns an array with the keys of the variant sets in the container.
     * @returns {array}
     *             variant set keys
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.getVariantSetKeys = function () {
        var aVariantSetKeys = [],
            aPrefixVariantSetKeys = [];

        aPrefixVariantSetKeys = this._oVariantSetMap.keys();
        aVariantSetKeys = aPrefixVariantSetKeys.map(function (sEntry) {
            return sEntry.replace(sVARIANT_PREFIX, "", "");
        });
        return aVariantSetKeys;
    };
    /**
     * Checks if a specific variant set is contained in the container.
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a variant set with the key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.containsVariantSet = function (sVariantSetKey) {
        return this._oVariantSetMap.containsKey(sVARIANT_PREFIX
                + sVariantSetKey);
    };
    /**
     * Returns the variant set object from the container.
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariantSet}.
     *            In case the container does not contain a variant set with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.getVariantSet = function (sVariantSetKey) {
        var sPrefixedVariantSetKey,
            oVariantSet = {};

        sPrefixedVariantSetKey = sVARIANT_PREFIX + sVariantSetKey;
        oVariantSet = this._oVariantSetMap.get(sPrefixedVariantSetKey);
        return oVariantSet;
    };
    /**
     * Creates a new variant set in the container.
     * In case a variant set with this key is already existing an exception is thrown.
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariantSet}
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainer.prototype.addVariantSet = function (sVariantSetKey) {
        var oEmptyValue = {},
            oVariantSet = {},
            sPrefixedVariantSetKey = "";

        if (this.containsVariantSet(sVariantSetKey)) {
            throw new sap.ushell.utils.Error("Container already contains a variant set with key '"
                            + sVariantSetKey
                            + "': sap.ushell.services.Personalization");
        }
        sPrefixedVariantSetKey = sVARIANT_PREFIX + sVariantSetKey;
        oEmptyValue = {
            currentVariant : null,
            variants : {}
        };
        this._oAdapterContainer.setItemValue(sPrefixedVariantSetKey,
                oEmptyValue);

        oVariantSet = new sap.ushell.services.PersonalizationContainerVariantSet(sPrefixedVariantSetKey, this._oAdapterContainer);
        this._oVariantSetMap.put(sPrefixedVariantSetKey, oVariantSet);
        return oVariantSet;
    };

    sap.ushell.services.PersonalizationContainer.prototype._serializeVariantSets = function () {
        var aVariantSetKeys = [],
            aDiff = [],
            that = this;

        aVariantSetKeys = this._oVariantSetMap.keys();
        aVariantSetKeys.forEach(function (sVariantSetKey) {
            var oVariantSet = {},
                oVariantSetData = {};
            oVariantSet = that._oVariantSetMap.get(sVariantSetKey);
            // variant set object was instantiated -> serialize
            oVariantSetData = oVariantSet._serialize();
            that._oAdapterContainer.setItemValue(sVariantSetKey, clone(oVariantSetData));
        });
        aDiff = this._aLoadedVariantSetKeys.filter(function (sVariantSetKey) {return !(aVariantSetKeys.indexOf(sVariantSetKey) > -1); });
        aDiff.forEach(function (sVariantSetKey) {
            that._oAdapterContainer.delItem(sVariantSetKey);
        });
    };

    /**
     * Deletes a variant set from the container.
     * In case the variant set does not exist nothing happens.
     * @param {string} sVariantSetKey
     *            variant set key
     *
     * @public
     * @since 1.18.0
     */
    // TODO check if deleting a non-existing variant set goes through
    sap.ushell.services.PersonalizationContainer.prototype.delVariantSet = function (sVariantSetKey) {
        var sPrefixedVariantSetKey = "";

        sPrefixedVariantSetKey = sVARIANT_PREFIX + sVariantSetKey;
        this._oVariantSetMap.remove(sPrefixedVariantSetKey);
        return this._oAdapterContainer.delItem(sPrefixedVariantSetKey);
    };



    // -----------------------
    // ------ Container ------
    // -----------------------
    /**
     * To be called by the personalization service getContainer method.
     *
     * @class The container is the anchor object of the unified shell
     *        personalization in container mode.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer = function (oService, oAdapter,
            sContainerKey, oScope, oComponent) {
        this._oService = oService;
        this._sContainerKey = sContainerKey;
        this._oAdapterContainer = {};
        this._oScope = oScope || rectifyScope(oScope);
        this._aLoadedKeys = [];
        this._oUnmodifiableContainer = undefined;
        var sAppName;

        if (!(oComponent instanceof sap.ui.core.UIComponent) && oComponent !== undefined) {
            throw new Error("oComponent passed must be a UI5 Component or must be undefined");
        }

        if (oComponent && oComponent.getMetadata && oComponent.getMetadata().getLibraryName) {
            sAppName = oComponent.getMetadata().getLibraryName();
        }

        this.clear();
        if (!this._sContainerKey || typeof this._sContainerKey !== "string") {
            throw new sap.ushell.utils.Error("Invalid container key: sap.ushell.services.Personalization");
        }
        this._oAdapterContainer = oAdapter.getAdapterContainer(this._sContainerKey, this._oScope,
            sAppName);
        return this;
    };

    /**
     * return the validity of this container
     * @deprecated only for testing!
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.getValidity = function () {
        return this._oScope.validity;
    };

    /**
     * clears the local copy data of this container
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.clear = function () {
        // resets all member variables of the personalization container
        this._oItemMap = {};
        this._aLoadedItemKeys = [];
        this._clear = true;
        this._oItemMap = new sap.ushell.utils.Map();
    };


    /**
    * (Re)loads the current container data from the underlying storage asynchronously.
    * The current local data is discarded.
    *
    * Returns a promise for the load operation.
    * If another save/load/delete operation is not completed, the  operation may fail!
    * (wait for the other promise).
    *
    * Synchronous read and write operations before the load is done have undefined
    * effects.
    *
    * @returns {object}
    *          Promise object
    *
    * @public
    * @since 1.22.0
    */
    sap.ushell.services.Personalization.ContextContainer.prototype.load = function () {
        var oDeferred = {},
            oPrior,
            that = this;

        oDeferred = new jQuery.Deferred();
        if (!this._sContainerKey) {
            throw new sap.ushell.utils.Error("Invalid container key: sap.ushell.services.Personalization");
        }
        // delete local data
        this.clear();
        oPrior = this._oService._pendingContainerOperations_flushAddNext(this._sContainerKey, oDeferred);
        // get adapter container & load
        oPrior.always(function () {
            that._oAdapterContainer.load().fail(function () {
                // TODO
                oDeferred.reject();
            }).done(function () {
                that._copyFromAdapter();
                if (that._isExpired()) {
                    that.clear();
                }
                oDeferred.resolve();
            });
        });
        return oDeferred.promise();
    };

    // copy data from adapter to local storage
    sap.ushell.services.Personalization.ContextContainer.prototype._copyFromAdapter = function () {
        var that = this,
            aAllKeys;
        aAllKeys = that._oAdapterContainer.getItemKeys().splice(0);
        aAllKeys.forEach(function (sItemKey) {
            that._oItemMap.put(sItemKey, JSON.stringify(that._oAdapterContainer.getItemValue(sItemKey)));
        });
        this._aLoadedItemKeys = that._oItemMap.keys().splice(0);
    };


    sap.ushell.services.Personalization.ContextContainer.prototype._isExpired = function () {
        var oFormatter,
            sTimestampExpire,
            sTimestampNow;
        if (this.getValidity() === Infinity || this.getValidity() === 0) {
            return false;
        }
        sTimestampExpire = this._getItemValueInternal(sADMIN_PREFIX, sITEMKEY_EXPIRE);
        oFormatter = sap.ui.core.format.DateFormat.getDateInstance({ pattern : sABAPTIMESTAMPFORMAT});
        sTimestampNow = oFormatter.format(this._getNow(), true);
        return sTimestampExpire && sTimestampNow > sTimestampExpire;
    };

    sap.ushell.services.Personalization.ContextContainer.prototype._getNow = function () {
        return new Date();
    };

    sap.ushell.services.Personalization.ContextContainer.prototype._copyToAdapterUpdatingValidity = function () {
        var aItemKeys = [],
            aDiff = [],
            that = this,
            oNow,
            oFormatter,
            sTimestampExpire,
            sTimestampStorage;
        if (this._clear) {
            aItemKeys = this._oAdapterContainer.getItemKeys().splice(0);
            aItemKeys.forEach(function (sItemKey) {
                that._oAdapterContainer.delItem(sItemKey);
            });
            this._clear = false;
        }
        if (this.getValidity() === Infinity || this.getValidity() === 0) {
            this._delItemInternal(sADMIN_PREFIX, sITEMKEY_SCOPE);
            this._delItemInternal(sADMIN_PREFIX, sITEMKEY_EXPIRE);
            this._delItemInternal(sADMIN_PREFIX, sITEMKEY_STORAGE);
        } else {
            oFormatter = sap.ui.core.format.DateFormat.getDateInstance({ pattern : sABAPTIMESTAMPFORMAT});
            oNow = this._getNow();
            sTimestampStorage = oFormatter.format(oNow, true); // true UTC times !
            sTimestampExpire = oFormatter.format(new Date(oNow.getTime() + this.getValidity() * 60000), /*UTC!*/ true);
            this._setItemValueInternal(sADMIN_PREFIX, sITEMKEY_SCOPE, this._oScope);
            this._setItemValueInternal(sADMIN_PREFIX, sITEMKEY_EXPIRE, sTimestampExpire);
            this._setItemValueInternal(sADMIN_PREFIX, sITEMKEY_STORAGE, sTimestampStorage);
        }
        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach(function (sItemKey) {
            that._oAdapterContainer.setItemValue(sItemKey, cloneToObject(that._oItemMap.get(sItemKey)));
        });
        aDiff = this._aLoadedItemKeys.filter(function (sItemKey) {return !(aItemKeys.indexOf(sItemKey) > -1); });
        aDiff.forEach(function (sItemKey) {
            that._oAdapterContainer.delItem(sItemKey);
        });
    };
    // -- common interface --
    /**
     * Attempts to save the current container data at the underlying storage asynchronously.
     * The current state is serialized.
     * @returns {object}
     *             Promise object
     *
     * If another save/load/delete operation is not completed, the  operation may fail!
     * (wait for the other promise).
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.save = function () {
        // async
        var oSaveDeferred,
            oPrior,
            that = this;
        this._copyToAdapterUpdatingValidity();
        oSaveDeferred = new jQuery.Deferred();
        oPrior = this._oService._pendingContainerOperations_cancelAddNext(this._sContainerKey, oSaveDeferred);
        oPrior.always(function () {
            try {
                that._oAdapterContainer.save() // promise
                    .fail(function () { oSaveDeferred.reject(); })
                    .done(function () { oSaveDeferred.resolve(); });
            } catch (e) {
                oSaveDeferred.reject();
            }
        });
        return oSaveDeferred.promise();
    };

    /**
     * Save the current container data at the underlying storage asynchronously at the earlies
     * nDelayInMilliseconds seconds before.
     * The current state is serialized.
     *
     * @returns {object}
     *             Promise object
     *
     * The operation may wait for completion of another pending operation.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.saveDeferred = function (nDelayInMilliseconds) {
        // async
        var oSaveDeferred,
            oPrior,
            that = this;


        this._copyToAdapterUpdatingValidity();
        oSaveDeferred = new jQuery.Deferred();
        oPrior = this._oService._pendingContainerOperations_cancelAddNext(this._sContainerKey, oSaveDeferred);

        function fnDelayedSave() {
            oPrior.always(function () {
                try {
                    that._oAdapterContainer.save() // promise
                        .fail(function () { oSaveDeferred.reject(); })
                        .done(function () { oSaveDeferred.resolve(); });
                } catch (e) {
                    oSaveDeferred.reject();
                }
            });
        }

        oSaveDeferred._sapFnSave = fnDelayedSave;
        oSaveDeferred._sapTimeoutId = setTimeout(fnDelayedSave, nDelayInMilliseconds);
        // we want to delay at least 200 ms,
        return oSaveDeferred.promise();
    };

    /**
     * flush all pending request;
     * The result of the promise may reflect the last pending operation in the queue
     * @returns {object} promise
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.flush = function () {
        // async
        var oSaveDeferred,
            oPrior;
        this._copyToAdapterUpdatingValidity();
        oSaveDeferred = new jQuery.Deferred();
        oPrior = this._oService._pendingContainerOperations_flushAddNext(this._sContainerKey, oSaveDeferred);
        oPrior.fail(function () { oSaveDeferred.reject(); })
              .done(function () { oSaveDeferred.resolve(); });
        return oSaveDeferred.promise();
    };

    // -- item interface --
    /**
     * Returns an array with the keys of direct items in the container.
     * @returns {array}
     *             item keys
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.getItemKeys = function () {
        // return a list of the (prefix stripped)  "Item" keys.
        var aFilteredTrueItemKeys = this._oItemMap.keys().filter(function (s) {
                return s.indexOf(sITEM_PREFIX) === 0;
                // match at first character -> index = 0 -> true -> keep
                // match inside the string -> index > 0 -> false -> filter out
                // no match -> index = -1 -> false -> filter out
            });
        return aFilteredTrueItemKeys.map(function (sEntry) {
            return sEntry.replace(sITEM_PREFIX, "", "");
        });
    };

    /**
     * Returns an array with all internal  keys of direct items in the container.
     * @returns {array}
     *             item keys
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype._getInternalKeys = function () {
        return this._oItemMap.keys().splice(0);
    };
    /**
     * Returns the value for a direct item from the container.
     * (Value semantics, new copy is returned)
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the container does not contain a direct item with this key
     * <code>undefined</code> is returned.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.getItemValue = function (sItemKey) {
        return this._getItemValueInternal(sITEM_PREFIX, sItemKey);
    };

    sap.ushell.services.Personalization.ContextContainer.prototype._getItemValueInternal = function (sPrefix, sItemKey) {
        if (typeof sItemKey !== "string" || typeof sPrefix !== "string") {
            return undefined;
        }
        return cloneToObject(this._oItemMap.get(sPrefix + sItemKey));
    };
    /**
     * Checks if a specific direct item is contained in the container.
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a direct item with the key
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(sITEM_PREFIX + sItemKey);
    };

    /**
     * Sets the value of a direct item in the container.
     * In case the item is already existing its value is overwritten. In case it is not
     * existing a new item with this key and value is created.
     * The value is serialized during set
     * @param {string} sItemKey
     *            item key
     *            The string length is restricted to 40 characters
     * @param {object} sItemValue
     *            item value (JSON object)
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._setItemValueInternal(sITEM_PREFIX, sItemKey, oItemValue);
    };



    sap.ushell.services.Personalization.ContextContainer.prototype._setItemValueInternal = function (sItemPrefix, sItemKey, oItemValue) {
        if (typeof sItemKey !== "string" || typeof sItemPrefix !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sItemKey or sItemValue is not a string: sap.ushell.services.Personalization");
        }
        if (sItemKey.length > 40) {
            jQuery.sap.log.error("Personalization Service item key/variant set name (\"" + sItemKey + "\") should be less than 40 characters [current :" + sItemKey.length + "]");
        }
        this._oItemMap.put(sItemPrefix + sItemKey, JSON.stringify(oItemValue));
    };

    /**
     * Deletes a direct item from the container.
     * In case the item does not exist, nothing happens.
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.delItem = function (sItemKey) {
        this._delItemInternal(sITEM_PREFIX, sItemKey);
    };

    sap.ushell.services.Personalization.ContextContainer.prototype._delItemInternal = function (sPrefix, sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        if (typeof sPrefix !== "string") {
            return undefined;
        }
        this._oItemMap.remove(sPrefix + sItemKey);
    };

    /**
     * return the container key as a string variable
     * @returns {string} the container key
     * @public
     * @since 1.28.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.getKey = function () {
        return this._sContainerKey.substring(sCONTAINER_PREFIX.length);
    };


    /**
     * Return an instance unmodifiable container instance. There is one instance of this wrapper
     * per container. It will permit all read accesses to the container, but block all
     * modifying accesses.
     *
     * @returns {object}
     *      unmodifiable wrapper instance
     *
     * @public
     * @since 1.28.0
     */
    sap.ushell.services.Personalization.ContextContainer.prototype.getUnmodifiableContainer = function () {
        var that = this;

        if (!this._oUnmodifiableContainer) {
            this._oUnmodifiableContainer = (function () {
                var oUnmodifiableContainer = {};

                // blocked functions
                [ "clear",
                    "delItem",
                    "flush",
                    "load",
                    "save",
                    "saveDeferred",
                    "setItemValue" ].forEach(function (sFunctionName) {
                    oUnmodifiableContainer[sFunctionName] = function (sName) {
                        throw new sap.ushell.utils.Error("Function " + sName + " can't be called on unmodifiable container",
                            "sap.ushell.services.Personalization.ContextContainer");
                    }.bind(undefined, sFunctionName);
                });

                // permitted functions
                [ "containsItem",
                    "getItemKeys",
                    "getItemValue",
                    "getUnmodifiableContainer",
                    "getValidity" ].forEach(function (sFunctionName) {
                    if (that[sFunctionName]) {
                        oUnmodifiableContainer[sFunctionName] = that[sFunctionName].bind(that);
                    }
                });

                return oUnmodifiableContainer;
            }());
        }

        return this._oUnmodifiableContainer;
    };


    /** VariantSetAdapter
    * amends ContextContainer with functionality to
    *
    * Example: An application has two types of variants.
    * Variant type 1 contains filter values for a query, which are stored in item 1 of
    * the variant, and personalization data for a table, which are stored in item 2
    * of the variant.
    * Variant type 2 contains a setting (item 3) that is independent of
    * the filtering and the table settings. It might be used for a different
    * screen than the variants of type 1.
    * In this example you would have 2 variant sets, one for each variant type.
    *
    * @class Wrapper object to expose a variant interface on a
    *        ContextContainer object obtained from the Peronalization service:
    *        <code>
    *        getContainer(...).done( function(oContainer) {
    *           that.oVariantSetContainer = new sap.ushell.services.Personalization.VariantSetAdapater(oContainer);
    *           });
    *        </code>
    *
    * @public
    * @since 1.18.0
    */
    sap.ushell.services.Personalization.VariantSetAdapter = function (oContextContainer) {
        this._oContextContainer = oContextContainer;
    };

    sap.ushell.services.Personalization.VariantSetAdapter.prototype.save = function () {
        return this._oContextContainer.save();
    };

    // -- variant interface --
    /**
     * Returns an array with the keys of the variant sets in the container.
     * @returns {array}
     *             variant set keys
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.VariantSetAdapter.prototype.getVariantSetKeys = function () {
        var aPrefixVariantSetKeys = this._oContextContainer._getInternalKeys(),
            aVariantSetKeys = [];
        aVariantSetKeys = aPrefixVariantSetKeys.map(function (sEntry) {
            return sEntry.replace(sVARIANT_PREFIX, "", "");
        });
        return aVariantSetKeys;
    };
    /**
     * Checks if a specific variant set is contained in the container.
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a variant set with the key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.VariantSetAdapter.prototype.containsVariantSet = function (sVariantSetKey) {
        return this.getVariantSetKeys().indexOf(sVariantSetKey) >= 0;
    };

    /**
     * Returns the variant set object from the container.
     * @param {string} sVariantSetKey
     *            variant set key
     *            The string length is restricted to 40 characters
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariantSet}.
     *            In case the container does not contain a variant set with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSetAdapter.prototype.getVariantSet = function (sVariantSetKey) {
        var oVariantSet = this._oContextContainer._getItemValueInternal(sVARIANT_PREFIX, sVariantSetKey);
        if (!oVariantSet) {
            return undefined;
        }
        return new sap.ushell.services.Personalization.VariantSet(sVariantSetKey, this._oContextContainer);
    };
    /**
     * Creates a new variant set in the container.
     * In case a variant set with this key is already existing an exception is thrown.
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariantSet}
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSetAdapter.prototype.addVariantSet = function (sVariantSetKey) {
        var oEmptyValue = {},
            oVariantSet = {};

        if (this.containsVariantSet(sVariantSetKey)) {
            throw new sap.ushell.utils.Error("Container already contains a variant set with key '"
                            + sVariantSetKey
                            + "': sap.ushell.services.Personalization");
        }
        oEmptyValue = {
            currentVariant : null,
            variants : {}
        };
        this._oContextContainer._setItemValueInternal(sVARIANT_PREFIX, sVariantSetKey,
                oEmptyValue);
        oVariantSet = new sap.ushell.services.Personalization.VariantSet(sVariantSetKey, this._oContextContainer);
        return oVariantSet;
    };

    /**
     * Deletes a variant set from the container.
     * In case the variant set does not exist nothing happens.
     * @param {string} sVariantSetKey
     *            variant set key
     *
     * @public
     * @since 1.22.0
     */
    // TODO check if deleting a non-existing variant set goes through
    sap.ushell.services.Personalization.VariantSetAdapter.prototype.delVariantSet = function (sVariantSetKey) {
        this._oContextContainer._delItemInternal(sVARIANT_PREFIX, sVariantSetKey);
    };


    // --- Variant Set ---
    /**
     * A VariantSet is a class representing a collection of
     * Variants (identified by a key and name)
     * and a member variable indicating the
     * "current variable"
     *
     * When manipulating the underlying data, additional constraints are enforced.
     *
     * To be called by the personalization container.
     *
     * @class The personalization variant set contains variants of personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet = function (sVariantSetKey, oContextContainer) {
        var sVariantKey,
            sVariantName,
            oVariantNameMap = new sap.ushell.utils.Map(),
            oVariantMap = new sap.ushell.utils.Map(),
            oVariantData,
            oVariant;
        this._oContextContainer = oContextContainer;
        this._sVariantSetKey = sVariantSetKey;
        this._oVariantSetData = this._oContextContainer._getItemValueInternal(sVARIANT_PREFIX, this._sVariantSetKey);

        if (!Object.prototype.hasOwnProperty.call(this._oVariantSetData, "currentVariant")) {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
            // TODO variant set name + container
        }
        if (Object.prototype.hasOwnProperty.call(this._oVariantSetData, "variants")) {
            for (sVariantKey in this._oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(this._oVariantSetData.variants, sVariantKey)) {
                    sVariantName = this._oVariantSetData.variants[sVariantKey].name;
                    oVariantData = this._oVariantSetData.variants[sVariantKey].variantData;
                    if (oVariantNameMap.containsKey(sVariantName)) {
                        throw new sap.ushell.utils.Error("Variant name already exists: sap.ushell.services.Personalization");
                        // TODO skip? log instead error
                    } else {
                        oVariantNameMap.put(sVariantName, sVariantKey);
                        oVariant = new sap.ushell.services.PersonalizationContainerVariant(sVariantKey,
                                sVariantName, oVariantData);
                        oVariantMap.put(sVariantKey, oVariant);
                    }
                }
            }
        } else {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
        }
        return this;
    };

    sap.ushell.services.Personalization.VariantSet.prototype._getVariantSet = function () {
        return this._oVariantSetData;
    };

    sap.ushell.services.Personalization.VariantSet.prototype._serialize = function () {
        this._oContextContainer._setItemValueInternal(sVARIANT_PREFIX, this._sVariantSetKey, this._oVariantSetData);
    };

    /**
     * Returns the current variant key.
     * @returns {string}
     *             current variant key. In case the current variant was never set <code>null</code> is returned.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.getCurrentVariantKey = function () {
        return this._getVariantSet().currentVariant;
    };

    /**
     * Sets the current variant key.
     * @param {string} sVariantKey
     *            There is no validity check for the variant key.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.setCurrentVariantKey = function (sVariantKey) {
        this._getVariantSet().currentVariant = sVariantKey;
        this._serialize();
    };

    /**
     * Returns an array with the keys of the variants in the variant set.
     * @returns {array}
     *             variant keys
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.getVariantKeys = function () {
        var oVariantMap = new sap.ushell.utils.Map(),
            oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantKey;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
                    oVariantMap.put(sVariantKey, "dummy");
                }
            }
        } else {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
        }
        return oVariantMap.keys();
    };

    sap.ushell.services.Personalization.VariantSet.prototype.getVariantNamesAndKeys = function () {
        var oVariantNameMap = new sap.ushell.utils.Map(),
            oVariantMap = new sap.ushell.utils.Map(),
            oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantKey,
            sVariantName;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
                    sVariantName = oVariantSetData.variants[sVariantKey].name;
                    // oVariantData = oVariantSetData.variants[sVariantKey].variantData;
                    if (oVariantNameMap.containsKey(sVariantName)) {
                        throw new sap.ushell.utils.Error("Variant name already exists: sap.ushell.services.Personalization");
                        // TODO skip? log instead error
                    } else {
                        oVariantNameMap.put(sVariantName, sVariantKey);
                    }
                    oVariantMap.put(sVariantKey, "dummy");
                }
            }
        } else {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
        }
        return oVariantNameMap.entries;
    };

    /**
     * Returns a variant object.
     * @param {string} sVariantKey
     *            variant key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariant}.
     *            In case the variant set does not contain a variant with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.getVariant = function (sVariantKey) {
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        var oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantName,
            oVariant,
            oVariantData;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
            sVariantName = oVariantSetData.variants[sVariantKey].name;
            oVariantData = oVariantSetData.variants[sVariantKey].variantData;
            oVariant = new sap.ushell.services.Personalization.Variant(this,
                                                                        sVariantKey,
                    sVariantName, oVariantData);
            return oVariant;
        }
        return undefined;
    };

    /**
     * Returns the variant key corresponding to a variant name.
     * @param {string} sVariantName
     *            variant name
     * @returns {string}
     *            variant key. In case the variant set does not contain a variant with this name
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.getVariantKeyByName = function (sVariantName) {
        if (typeof sVariantName !== "string") {
            return undefined;
        }
        var oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantKey;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
                    if (sVariantName === oVariantSetData.variants[sVariantKey].name) {
                        return sVariantKey;
                    }
                }
            }
        } else {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
        }
        return undefined;
    };

    /**
     * Checks if a specific variant is contained in the variant set.
     * @param {string} sVariantKey
     *            variant key
     * @returns {boolean}
     *            <tt>true</tt> if the variant set contains a variant with the key
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.containsVariant = function (sVariantKey) {
        var oVariantSetData = this._getVariantSet();
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        return Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey);
    };

    /**
     * Creates a new variant in the variant set.
     * In case a variant with this name is already existing an exception is thrown.
     * @param {string} sVariantSetName
     *            variant set name
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariant}
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.addVariant = function (sVariantName) {
        var aKeys = [],
            iMaxKey = 0,
            sVariantKey = "",
            oVariant = {};

        aKeys = this.getVariantKeys();
        // generate a new "unique" key not yet present in aKeys
        iMaxKey = parseInt(aKeys.sort(function (a, b) {
            return a - b;
        }).reverse()[0], 10); // get the highest key; in case of an empty
                              // variant set -> NaN
        sVariantKey = isNaN(iMaxKey) ? "0" : (iMaxKey + 1).toString();
            // tested for up to 1 mio variants
        if (aKeys.indexOf(sVariantKey) >= 0) {
            throw new sap.ushell.utils.Error("Variant key '" + sVariantKey
                    + "' already exists in variant set" + this._sVariantSetKey
                    + "': sap.ushell.services.Personalization");
        }
        if (typeof sVariantName !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization");
        }
        if (this.getVariantKeyByName(sVariantName) !== undefined) {
            throw new sap.ushell.utils.Error("Variant name '" + sVariantName
                    + "' already exists in variant set '"
                    + this._sVariantSetKey + "' (Old key: '"
                    + this.getVariantKeyByName(sVariantName) + "' New key: '"
                    + sVariantKey + "') ': sap.ushell.services.Personalization");
        }
        oVariant = new sap.ushell.services.Personalization.Variant(
            this,
            sVariantKey,
            sVariantName
        );
        this._getVariantSet(this._sVariantSetKey).variants[sVariantKey] = {
            name : sVariantName,
            variantData : {}
        };
        this._serialize();
        return oVariant;
    };



    /**
     * Deletes a variant from the variant set.
     * In case the variant does not exist nothing happens.
     * @param {string} sVariantKey
     *            variant key
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.VariantSet.prototype.delVariant = function (sVariantKey) {
        var oVariantSetData;
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        oVariantSetData = this._getVariantSet();
        if (oVariantSetData && oVariantSetData.variants) {
            delete this._oVariantSetData.variants[sVariantKey];
        }
        this._serialize();
    };

    // --- (Deprecated) Variant Set ---
    /**
     * To be called by the personalization container.
     *
     * @class The personalization variant set contains variants of personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet = function (sVariantSetKey, oAdapterContainer) {
        var oVariantSetData,
            sVariantKey,
            sVariantName,
            oVariantData,
            oVariant;

        this._sVariantSetKey = sVariantSetKey;
        this._oAdapterContainer = oAdapterContainer;
        this._oVariantNameMap = new sap.ushell.utils.Map();
        this._oVariantMap = new sap.ushell.utils.Map();
        oVariantSetData = clone(this._oAdapterContainer.getItemValue(sVariantSetKey));
        if (oVariantSetData.hasOwnProperty("currentVariant")) {
            this._sCurrentVariantKey = oVariantSetData.currentVariant;
        } else {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
            // TODO variant set name + container
        }
        if (oVariantSetData.hasOwnProperty("variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (oVariantSetData.variants.hasOwnProperty(sVariantKey)) {
                    sVariantName = oVariantSetData.variants[sVariantKey].name;
                    oVariantData = oVariantSetData.variants[sVariantKey].variantData;
                    if (this._oVariantNameMap.containsKey(sVariantName)) {
                        throw new sap.ushell.utils.Error("Variant name already exists: sap.ushell.services.Personalization");
                        // TODO skip? log instead error
                    } else {
                        this._oVariantNameMap.put(sVariantName, sVariantKey);
                        oVariant = new sap.ushell.services.PersonalizationContainerVariant(sVariantKey,
                                sVariantName, oVariantData);
                        this._oVariantMap.put(sVariantKey, oVariant);
                    }
                }
            }
        } else {
            throw new sap.ushell.utils.Error("Corrupt variant set data: sap.ushell.services.Personalization");
        }
        return this;
    };

    /**
     * Returns the current variant key.
     * @returns {string}
     *             current variant key. In case the current variant was never set <code>null</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.getCurrentVariantKey = function () {
        return this._sCurrentVariantKey;
    };

    /**
     * Sets the current variant key.
     * @param {string} sVariantKey
     *            There is no validity check for the variant key.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.setCurrentVariantKey = function (sVariantKey) {
        this._sCurrentVariantKey = sVariantKey;
    };

    /**
     * Returns an array with the keys of the variants in the variant set.
     * @returns {array}
     *             variant keys
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.getVariantKeys = function () {
        return this._oVariantMap.keys();
    };

    sap.ushell.services.PersonalizationContainerVariantSet.prototype.getVariantNamesAndKeys = function () {
        return JSON.parse(JSON.stringify(this._oVariantNameMap.entries));
    };

    /**
     * Returns a variant object.
     * @param {string} sVariantKey
     *            variant key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariant}.
     *            In case the variant set does not contain a variant with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.getVariant = function (sVariantKey) {
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        return this._oVariantMap.get(sVariantKey);
    };

    /**
     * Returns the variant key corresponding to a variant name.
     * @param {string} sVariantName
     *            variant name
     * @returns {object}
     *            variant key. In case the variant set does not contain a variant with this name
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.getVariantKeyByName = function (sVariantName) {
        if (typeof sVariantName !== "string") {
            return undefined;
        }
        return this._oVariantNameMap.get(sVariantName);
    };

    /**
     * Checks if a specific variant is contained in the variant set.
     * @param {string} sVariantKey
     *            variant key
     * @returns {boolean}
     *            <tt>true</tt> if the variant set contains a variant with the key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.containsVariant = function (sVariantKey) {
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        return this._oVariantMap.containsKey(sVariantKey);
    };

    /**
     * Creates a new variant in the variant set.
     * In case a variant with this name is already existing an exception is thrown.
     * @param {string} sVariantSetName
     *            variant set name
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariant}
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.addVariant = function (sVariantName) {
        var iMaxKey = 0,
            sVariantKey = "",
            oVariant = {};

        iMaxKey = parseInt(this._oVariantMap.keys().sort(function (a, b) {
            return a - b;
        }).reverse()[0], 10); // get the highest key; in case of an empty
                              // variant set -> NaN
        sVariantKey = isNaN(iMaxKey) ? "0" : (iMaxKey + 1).toString();
            // tested for up to 1 mio variants
        if (this._oVariantMap.containsKey(sVariantKey)) {
            throw new sap.ushell.utils.Error("Variant key '" + sVariantKey
                    + "' already exists in variant set" + this._sVariantSetKey
                    + "': sap.ushell.services.Personalization");
        }
        if (typeof sVariantName !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization");
        }
        if (this._oVariantNameMap.containsKey(sVariantName)) {
            throw new sap.ushell.utils.Error("Variant name '" + sVariantName
                    + "' already exists in variant set '"
                    + this._sVariantSetKey + "' (Old key: '"
                    + this._oVariantNameMap.get(sVariantName) + "' New key: '"
                    + sVariantKey + "') ': sap.ushell.services.Personalization");
        }
        oVariant = new sap.ushell.services.PersonalizationContainerVariant(sVariantKey, sVariantName);
        this._oVariantMap.put(sVariantKey, oVariant);
        this._oVariantNameMap.put(sVariantName, sVariantKey);
        return oVariant;
    };

    sap.ushell.services.PersonalizationContainerVariantSet.prototype._serialize = function () {
        var aVariantKeys = [],
            oVariantSetData = {},
            oVariantsData = {},
            that = this;

        oVariantSetData.currentVariant = this._sCurrentVariantKey;
        aVariantKeys = this.getVariantKeys();
        aVariantKeys.forEach(function (sVariantKey) {
            var oVariant = {};

            oVariant = that._oVariantMap.get(sVariantKey);
            oVariantsData[sVariantKey] = oVariant._serialize();
        });
        oVariantSetData.variants = oVariantsData;
        return oVariantSetData;
    };

    /**
     * Deletes a variant from the variant set.
     * In case the variant does not exist nothing happens.
     * @param {string} sVariantKey
     *            variant key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariantSet.prototype.delVariant = function (sVariantKey) {
        var oVariant = this._oVariantMap.get(sVariantKey);
        if (oVariant) {
            this._oVariantNameMap.remove(oVariant.getVariantName());
            this._oVariantMap.remove(sVariantKey);
        }
    };


    // --- Variant ---
    /**
     * To be instantiated via Personalization.VariantSet  add / get Variant only
     *
     * @class The personalization variant contains personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.Variant = function (oVariantSet, sVariantKey,
            sVariantName) {
        if (typeof sVariantKey !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantKey is not a string: sap.ushell.services.Personalization");
        }
        if (typeof sVariantName !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization");
        }
        this._oVariantSet = oVariantSet;
        this._sVariantKey = sVariantKey;
        this._sVariantName = sVariantName;
    };

    /**
     * Returns the key of this variant.
     * @returns {string}
     *             variant key.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.Variant.prototype.getVariantKey = function () {
        return this._sVariantKey;
    };

    /**
     * Returns the name of this variant.
     * @returns {string}
     *             variant name.
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.Variant.prototype.getVariantName = function () {
        return this._sVariantName;
    };

    /**
     * Sets the name of the variant.
     *
     * In case a variant with <code>sVariantName</code> is already existing in the corresponding variant set an exception is thrown.
     *
     * @param {string} sVariantName
     *          variant name
     *
     * @public
     * @since 1.24.0
     */
    sap.ushell.services.Personalization.Variant.prototype.setVariantName = function (sVariantName) {
        var oVariantSetData = this._oVariantSet._getVariantSet(),
            oVariantData;

        if (typeof sVariantName !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization");
        }
        if (this._oVariantSet.getVariantKeyByName(sVariantName) !== undefined) {
            throw new sap.ushell.utils.Error("Variant with name '" + sVariantName
                    + "' already exists in variant set '"
                    + this._oVariantSet._sVariantSetKey
                    + "': sap.ushell.services.Personalization");
        }

        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, this._sVariantKey)) {
            oVariantData = oVariantSetData.variants[this._sVariantKey];
            oVariantData.name = sVariantName;
            this._sVariantName = sVariantName;
            this._oVariantSet._serialize();
        } else {
            throw new sap.ushell.utils.Error("Variant does not longer exist");
        }
    };

    /**
     * Returns the value for an item in this variant.
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the variant does not contain an item with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.Variant.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        var vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        return Object.prototype.hasOwnProperty.call(vd, sItemKey) && clone(vd[sItemKey]);
    };

    /**
     * Sets the value for an item in this variant.
     * @param {string} sItemKey
     *            item key
     * @param {object}
     *            item value (JSON object)
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.Variant.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization");
        }
        var vd,
            variant = this._oVariantSet._getVariantSet().variants && this._oVariantSet._getVariantSet().variants[this._sVariantKey];
        if (!variant) {
            throw new sap.ushell.utils.Error("Variant does not longer exist");
        }
        if (!variant.variantData) {
            variant.variantData = {};
        }
        vd = variant.variantData;
        vd[sItemKey] = clone(oItemValue);
        this._oVariantSet._serialize();
    };

    /**
     * Checks if a specific item is contained in this variant.
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the variant contains an item with the key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.Personalization.Variant.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        var vd = this.oAccess.variantSet._getVariantSet().variants[this._sVariantKey].variantData;
        return Object.prototype.hasOwnProperty.call(vd, sItemKey);
    };

    /**
     * Returns an array with the keys of all items in this variant.
     * @returns {array}
     *            item keys
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.Variant.prototype.getItemKeys = function () {
        var vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData,
            sItemKey,
            oItemKeys = [];
        for (sItemKey in vd) {
            if (Object.prototype.hasOwnProperty.call(vd, sItemKey)) {
                oItemKeys.push(sItemKey);
            }
        }
        oItemKeys.sort();
        return oItemKeys;
    };

    /**
     * Deletes an item from this variant.
     * In case the item does not exist, nothing happens.
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @since 1.22.0
     */
    sap.ushell.services.Personalization.Variant.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        var vd = this.oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        delete vd[sItemKey];
        this.oVariantSet._serialize();
    };


    // --- Variant ---
    /**
     * To be called by the personalization variant set.
     *
     * @class The personalization variant contains personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant = function (sVariantKey,
            sVariantName, oVariantData) {
        if (typeof sVariantKey !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantKey is not a string: sap.ushell.services.Personalization");
        }
        if (typeof sVariantName !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization");
        }
        if (oVariantData && typeof oVariantData !== "object") {
            throw new sap.ushell.utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization");
        }
        this._oVariantKey = sVariantKey;
        this._oVariantName = sVariantName;
        this._oItemMap = new sap.ushell.utils.Map();
        this._oItemMap.entries = oVariantData || {}; // check if oVariantData
        // is a JSON object
    };

    /**
     * Returns the key of this variant.
     * @returns {string}
     *             variant key.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.getVariantKey = function () {
        return this._oVariantKey;
    };

    /**
     * Returns the name of this variant.
     * @returns {string}
     *             variant name.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.getVariantName = function () {
        return this._oVariantName;
    };

    /**
     * Returns the value for an item in this variant.
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the variant does not contain an item with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.get(sItemKey);
    };

    /**
     * Sets the value for an item in this variant.
     * @param {string} sItemKey
     *            item key
     * @param {object}
     *            item value (JSON object)
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new sap.ushell.utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization");
        }
        return this._oItemMap.put(sItemKey, oItemValue);
    };

    /**
     * Checks if a specific item is contained in this variant.
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the variant contains an item with the key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(sItemKey);
    };

    /**
     * Returns an array with the keys of all items in this variant.
     * @returns {array}
     *            item keys
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    /**
     * Deletes an item from this variant.
     * In case the item does not exist, nothing happens.
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @since 1.18.0
     */
    sap.ushell.services.PersonalizationContainerVariant.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.remove(sItemKey);
    };

    sap.ushell.services.PersonalizationContainerVariant.prototype._serialize = function () {
        var aItemKeys = [],
            oVariantData = {},
            oItemsData = {},
            that = this;

        oVariantData.name = this.getVariantName();
        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach(function (sItemKey) {
            oItemsData[sItemKey] = that.getItemValue(sItemKey);
        });
        oVariantData.variantData = oItemsData;
        return oVariantData;
    };


    /**
     * Container for storage with window validity, data is stored in sap.ushell.services.Personalization.WindowAdapter.prototype.data
     * @param {string} sServiceInstance
     *            ignored
     * @param {object} oBackendAdapter
     *            BackendAdapter -> may be undefined
     *
     * @private
     */
    sap.ushell.services.Personalization.WindowAdapter = function (sServiceInstance, oBackendAdapter) {
        this._oBackendAdapter = oBackendAdapter;
        if (!sap.ushell.services.Personalization.WindowAdapter.prototype.data) {
            sap.ushell.services.Personalization.WindowAdapter.prototype.data = {};
        }
    };


    sap.ushell.services.Personalization.WindowAdapter.prototype.getAdapterContainer = function (sContainerKey, oScope, sAppName) {
        var oBackendContainer = this._oBackendAdapter && this._oBackendAdapter.getAdapterContainer(sContainerKey, oScope, sAppName);
        return new sap.ushell.services.Personalization.WindowAdapterContainer(sContainerKey, oScope, oBackendContainer);
    };

    sap.ushell.services.Personalization.WindowAdapter.prototype.delAdapterContainer = function (sContainerKey, oScope) {
        var oDeferred = new jQuery.Deferred();
        delete sap.ushell.services.Personalization.WindowAdapter.prototype.data[sContainerKey];
        if (this._oBackendAdapter) {
            this._oBackendAdapter.delAdapterContainer(sContainerKey, oScope).done(function () {
                oDeferred.resolve();
            }).fail(function (sMsg) {
                oDeferred.reject(sMsg);
            });
        } else {
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };


    // --- Container for storage with window validity, data is stored in sap.ushell.services.Personalization.WindowValidityPersistence  ---
    sap.ushell.services.Personalization.WindowAdapterContainer = function (sContainerKey, oScope, oBackendContainer) {
        this._oBackendContainer = oBackendContainer;
        this._oItemMap = new sap.ushell.utils.Map();
        this._sContainerKey = sContainerKey;
    };

    function clear(oContainer) {
        var i,
            keys = oContainer.getItemKeys();
        for (i = 0; i < keys.length; i = i + 1) {
            oContainer.delItem(keys[i]);
        }
    }

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.load = function () {
        var oDeferred = new jQuery.Deferred(),
            i,
            keys,
            that = this;
        //Check if found in window object
        if (sap.ushell.services.Personalization.WindowAdapter.prototype.data[this._sContainerKey]) {
            //load data from window
            this._oItemMap.entries = clone(sap.ushell.services.Personalization.WindowAdapter.prototype.data[this._sContainerKey]);

            if (this._oBackendContainer) {
                clear(this._oBackendContainer);

                //Copy all items to the backend container
                keys = this.getItemKeys();
                for (i = 0; i < keys.length; i = i + 1) {
                    this._oBackendContainer.setItemValue(keys[i], this._oItemMap.get(keys[i]));
                }
            }
            oDeferred.resolve();
        } else {
         // attempt load data from front-end server
            if (this._oBackendContainer) {
                this._oBackendContainer.load().done(function () {
                    //copy received data from oAdapter into this._oItemMap.entries
                    keys = that._oBackendContainer.getItemKeys();
                    for (i = 0; i < keys.length; i = i + 1) {
                        that.setItemValue(keys[i], that._oBackendContainer.getItemValue(keys[i]));
                    }
                    //store immediately in the window variable so that the second load is satisfied from the window
                    sap.ushell.services.Personalization.WindowAdapter.prototype.data[that._sContainerKey] = clone(that._oItemMap.entries);
                    oDeferred.resolve();
                }).fail(function (sMsg) {
                    oDeferred.reject(sMsg);
                });
            } else {
                sap.ushell.services.Personalization.WindowAdapter.prototype.data[this._sContainerKey] = {};
                oDeferred.resolve();
            }
        }
        return oDeferred.promise();
    };

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.save = function () {
        var oDeferred = new jQuery.Deferred();
        sap.ushell.services.Personalization.WindowAdapter.prototype.data[this._sContainerKey] = clone(this._oItemMap.entries);
        if (this._oBackendContainer) {
            this._oBackendContainer.save().done(function () {
                oDeferred.resolve();
            }).fail(function (sMsg) {
                oDeferred.reject(sMsg);
            });
        } else {
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.containsItem = function (sItemKey) {
        this._oItemMap.containsKey(sItemKey);
    };

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.getItemValue = function (sItemKey) {
        return this._oItemMap.get(sItemKey);
    };

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._oItemMap.put(sItemKey, oItemValue);
        if (this._oBackendContainer) {
            this._oBackendContainer.setItemValue(sItemKey, oItemValue);
        }
    };

    sap.ushell.services.Personalization.WindowAdapterContainer.prototype.delItem = function (sItemKey) {
        this._oItemMap.remove(sItemKey);
        if (this._oBackendContainer) {
            this._oBackendContainer.delItem(sItemKey);
        }
    };

}());
