// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's AppState service provides
 *               read and write access to a cross user storage driven by a
 *               generated key.
 *               This is *not* an application facing service, but for Shell
 *               Internal usage.
 *               This service should be accessed by the application
 *               via the CrossApplicationNavigation service.
 *
 * @version
 * 1.32.6
 */
(function () {
    "use strict";
    /*jslint nomen: true, bitwise: false */
    /*jshint bitwise: false */
    /*global jQuery, sap, setTimeout, clearTimeout, window */
    jQuery.sap.declare("sap.ushell.services.AppState");
    jQuery.sap.require("sap.ushell.utils");
    jQuery.sap.require("sap.ushell.services.Container");

    // Determines the allowed number of saved application states in the JavaScript window object
    var Sequentializer,
        save,
        WINDOW_APPSTATE_CAPACITY = 50;


    /**
     * The Unified Shell's AppState service
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getService("AppState")</code>.
     * Constructs a new instance of the AppState service.
     *
     * @param {object} oAdapter
     *   The service adapter for the AppState service,
     *   as already provided by the container
     * @param {object} oContainerInterface interface
     * @param {string} sParameter Service instantiation
     * @param {object} oConfig service configuration (not in use)
     *
     *
     * @private
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getService
     *
     * @since 1.28.0
     */
    sap.ushell.services.AppState = function (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._oConfig = oConfig;
        this._sSessionKey = "";
        this._oAdapter = new sap.ushell.services.AppState.SequentializingAdapter(oAdapter);
        this._oAdapter = new sap.ushell.services.AppState.WindowAdapter(this, this._oAdapter);
    };

    /**
     * Method to obtain a session key
     *
     * @returns {string} session key
     *
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.prototype._getSessionKey = function () {
        if (!this._sSessionKey) {
            this._sSessionKey = this._getGeneratedKey();
        }
        return this._sSessionKey;
    };

    /**
     * Factory method to obtain an AppState object
     *
     * @param {string} sKey
     *            Identifies the container
     *            The string length is restricted to 40 characters
     * @returns {object} Promise object whose done function returns an unmodifiable
     *            {@link sap.ushell.services.AppState.AppState} object
     *            as parameter. The object's getData method
     *            can be used to retrieve the data synchronously.
     * @private Usage by other shell services (CrossApplicationNavigation) only!
     * @since 1.28.0
     */
    sap.ushell.services.AppState.prototype.getAppState = function (sKey) {
        var oDeferred = new jQuery.Deferred(),
            that = this,
            oAppState;
        this._loadAppState(sKey).done(function (sKey, sData) {
            oAppState = new sap.ushell.services.AppState.AppState(that, sKey, false, sData);
            oDeferred.resolve(oAppState);
        }).fail(function (sMsg) {
            oAppState = new sap.ushell.services.AppState.AppState(that, sKey);
            oDeferred.resolve(oAppState);
        });
        return oDeferred.promise();
    };

    /**
     * Method to obtain a generated key
     *
     * All AppState containers start with the prefix AS
     * @returns {string} generated key
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.prototype._getGeneratedKey = function () {
        var s = sap.ushell.Container.getService("Personalization").getGeneratedKey();
        s = ("AS" + s).substring(0, 40);
        return s;
    };

    /**
    * Factory method to obtain an empty data context object.
    * When data is present in a prior context, this is not relevant
    * (e.g. when using a "uniquely" generated key and planning to
    * overwrite any colliding front-end server data).
    *
    * The call always returns a cleared container.
    *
    * Note that an existing container at the front-end server is not actually deleted or overwritten
    * unless a save operation is executed.
    *
    * @param {object} oComponent
    *   A SAP UI5 Component, mandatory.
    *   An initial object is returned.
    * @returns {object} promise
    *   The promise's done function returns a
    *   {@link sap.ushell.services.AppState.AppState} object
    *   as parameter. The returned AppState object is mutable.
    * @private Only ushell internal usage
    * @since 1.28.0
    */
    sap.ushell.services.AppState.prototype.createEmptyAppState = function (oComponent) {
        var sKey = this._getGeneratedKey(),
            oAppState,
            sAppName = "",
            sACHComponent = "";
        if (oComponent) {
            if (!(oComponent instanceof sap.ui.core.UIComponent)) {
                throw new Error("oComponent passed must be a UI5 Component");
            }
            if (oComponent.getMetadata && oComponent.getMetadata() && typeof oComponent.getMetadata().getName === "function") {
                sAppName = oComponent.getMetadata().getName() || "";
            }
            if (!sAppName && oComponent.getMetadata && oComponent.getMetadata().getLibraryName) {
                sAppName = oComponent.getMetadata().getLibraryName();
            }
            if (oComponent.getMetadata && oComponent.getMetadata() &&
                typeof oComponent.getMetadata().getManifest === "function" &&
                typeof oComponent.getMetadata().getManifest() === "object" &&
                typeof oComponent.getMetadata().getManifest()["sap.app"] === "object") {
                sACHComponent = oComponent.getMetadata().getManifest()["sap.app"].ach || "";
            }
        }
        oAppState = new sap.ushell.services.AppState.AppState(this, sKey, true, undefined, sAppName, sACHComponent);
        return oAppState;
    };

    /**
     * Factory method to obtain an empty data context object which is unmodifiable.
     * This is used if no valid key is present.
     * A new generated key is constructed.
     *
     * @param {object} oComponent
     *   A SAP UI5 Component, mandatory.
     *   An initial object is returned.
     * @returns {object} An unmodifiable container
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.prototype.createEmptyUnmodifiableAppState = function (oComponent) {
        var sKey = this._getGeneratedKey(),
            oAppState;
        oAppState = new sap.ushell.services.AppState.AppState(this, sKey, false);
        return oAppState;
    };


    save = function () {
        var oDeferred = new jQuery.Deferred();
        this._oServiceInstance._saveAppState(this._sKey, this._sData, this._sAppName, this._sACHComponent).done(function () {
            oDeferred.resolve();
        }).fail(function (sMsg) {
            oDeferred.reject(sMsg);
        });
        return oDeferred.promise();
    };
    /**
     * Container for an application state
     * @param {object} oServiceInstance
     *   Ignored
     * @param {string} sKey
     *   Application state key
     * @param {boolean} bModifiable
     *   Distinguishes whether an application state is modifiable or not
     * @param {string} sData
     *   Application state data
     * @param {string} sAppName the frontend component name
     * @param {string} sACHComponent the application component (e.g. CA-UI2-INT-FE)
     *
     * @private
     */
    sap.ushell.services.AppState.AppState = function (oServiceInstance, sKey, bModifiable, sData, sAppName, sACHComponent) {
        this._oServiceInstance = oServiceInstance;
        this._sKey = sKey;
        this._sData = sData;
        this._sAppName = sAppName;
        this._sACHComponent = sACHComponent;

        if (bModifiable) {
            this.setData = function (oData) {
                try {
                    this._sData = JSON.stringify(oData);
                } catch (e) {
                    jQuery.sap.log.error("Data can not be serialized", "sap.ushell.services.AppState.AppState");
                    this._sData = undefined;
                }
            };
            this.save = save.bind(this);
        }
    };

    /**
     * Method to get the data of an application state
     *
     * @returns {object} Application state data
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.AppState.prototype.getData = function () {
        var o;
        if (this._sData === undefined || this._sData === "") {
            return undefined;
        }
        try {
            o = JSON.parse(this._sData);
        } catch (ex) {
            jQuery.sap.log.error("Could not parse [" + this._sData + "]" + ex);
        }
        return o;
    };

    /**
     * Method to get the application state key
     *
     * @returns {string} Application state key
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.AppState.prototype.getKey = function () {
        return this._sKey;
    };

    /**
     * Method to save an application state
     * @param {string} sKey
     *   Application state key
     * @param {string} sData
     *   Application state data
     * @param {string} sAppName
     *   Application name
     * @param {string} sComponent ui 5 component name
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.prototype._saveAppState = function (sKey, sData, sAppName, sComponent) {
        var sSessionKey = this._getSessionKey();
        return this._oAdapter.saveAppState(sKey, sSessionKey, sData, sAppName, sComponent);
    };

    /**
     * Method to load an application state
     * @param {string} sKey
     *            Application State key
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.prototype._loadAppState = function (sKey) {
        return this._oAdapter.loadAppState(sKey);
    };

    /**
     * Creates a limited buffer of iCapacity entries
     *
     * LimitedBuffer A collection implemented as a circular array
     * for storing key, value tuples.
     *
     * Values are added at the "end" of the circular buffer,
     * overwriting present values.
     * Lookup by key is done in reverse order.
     * @param {integer} iCapacity The capacity
     * @constructor
     * @class
     * @since 1.28.0
     * @private
     */
    function LimitedBuffer(iCapacity) {
        this.index = -1;
        this.capacity = iCapacity;
        this.array = [];
    }

    /**
     * Method to clear the buffer, only for testing!
     *
     * @private
     * @since 1.28.0
     */
    LimitedBuffer.prototype._clear = function () {
        this.array = [];
        this.index = -1;
    };

    /**
     * Method to add a specific key, value pair to the LimitedBuffer
     *
     * @param {string} sKey the key
     * @param {string} sValue the value
     *
     * @private
     * @since 1.28.0
     */
    LimitedBuffer.prototype.addAsHead = function (sKey, sValue) {
        this.index = (this.index + 1) % this.capacity;
        this.array[this.index] = { key : sKey, value : sValue};
    };

    /**
     * Method to get the value by a specific key.
     *
     * Lookup is in reverse order of creation
     *
     * @param {string} sKey
     *  Key of the specific node
     * @returns {object}  { key, value }
     * if found, otherwise undefined
     * @private
     * @since 1.28.0
     */
    LimitedBuffer.prototype.getByKey = function (sKey) {
        var i,
            effectiveIdx;
        // we search backward from index.
        // As we add a new application state as a new head element,
        // it's to be assumed that we find the required application state rather
        // in the beginning of the LinkedList
        for (i = 0; i <= this.capacity - 1; i = i + 1) {
            effectiveIdx = (this.capacity + this.index  - i) % this.capacity;
            if (this.array[effectiveIdx] && this.array[effectiveIdx].key === sKey) {
                return this.array[effectiveIdx];
            }
        }
        return undefined;
    };

    /**
     * Adapter which is responsible for the storing the application state
     * in the JavaScript window object.
     * The data is stored in sap.ushell.services.AppState.WindowAdapter.prototype.data
     *
     * @param {string} oServiceInstance
     *            Current service instance
     * @param {object} oBackendAdapter
     *            BackendAdapter -> may be undefined
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.WindowAdapter = function (oServiceInstance, oBackendAdapter) {
        this._oServiceInstance = oServiceInstance;
        this._oBackendAdapter = oBackendAdapter;
        // prepare window storage
        if (!sap.ushell.services.AppState.WindowAdapter.prototype.data) {
            sap.ushell.services.AppState.WindowAdapter.prototype.data = new LimitedBuffer(WINDOW_APPSTATE_CAPACITY);
        }
    };

    /**
     * Method to save an application state in the window object.
     * If a backend adapter is defined, the application state
     * will be also saved in the backend system.
     *
     * @param {string} sKey
     *   Application state key
     * @param {string} sSessionKey
     *   Current session key
     * @param {string} sData
     *   Application state data
     * @param {string} sAppname
     *   Application name
     * @param {string} sComponent
     *   UI5 component name
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.WindowAdapter.prototype.saveAppState = function (sKey, sSessionKey, sData, sAppname, sComponent) {
        this.sComponent = sComponent;
        var oDeferred = new jQuery.Deferred();
        // save application state in the window object (key and data)
        sap.ushell.services.AppState.WindowAdapter.prototype.data.addAsHead(sKey, sData);
        // save application state via backend adapter if available
        if (this._oBackendAdapter) {
            return this._oBackendAdapter.saveAppState(sKey, sSessionKey, sData, sAppname, sComponent);
        }
        oDeferred.resolve();
        return oDeferred.promise();
    };

    /**
     * Method to load an application state from the window object.
     * If the respective application state is not found there,
     * it will be loaded from the backend system.
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.WindowAdapter.prototype.loadAppState = function (sKey) {
        var oDeferred = new jQuery.Deferred(),
            appStateFromWindow = sap.ushell.services.AppState.WindowAdapter.prototype.data.getByKey(sKey);
        if (appStateFromWindow) {
            setTimeout(function () {
                oDeferred.resolve(sKey, appStateFromWindow.value);
            }, 0);
            return oDeferred.promise();
        }
        // load application state via backend adapter if available
        if (this._oBackendAdapter) {
            return this._oBackendAdapter.loadAppState(sKey);
        }
        oDeferred.reject("AppState.js loadAppState: Application State could not be loaded");
        return oDeferred.promise();
    };

    /**
     * The Sequentializer assures requests are executed in sequence,
     * subsequent requests issued with addToQueue are only executed if
     * all prior statements have been executed
     * @private
     */
    Sequentializer = function () {
        this.oLastPromise = new jQuery.Deferred();
        this.oLastPromise.resolve();
    };


    /**
     * Given a function object without parameters which must return a promise, add it to the
     * execution queue,
     * functions will be invoked sequentially, only after a prior function promise is
     * done or failed, the next function will be invoked.
     *
     * (note you may use obj.function.bind(obj, arg1, ...,  argN) to obtain a parameterless function)
     *
     * @param {function} fFn function to add to queue
     * @return {object} next promise
     * @private
     */
    Sequentializer.prototype.addToQueue = function (fFn) {
        // given  a function object which returns a promise
        // assure queue this function
        var oNextPromise = new jQuery.Deferred();
        this.oLastPromise.always(function () {
            var res = fFn();
            res.done(function () {
                oNextPromise.resolve.apply(oNextPromise, arguments);
            }).fail(function () {
                oNextPromise.reject.apply(oNextPromise, arguments);
            });
        });
        this.oLastPromise = oNextPromise;
        return oNextPromise.promise();
    };

    /**
     * Method to get a sequentializer object
     * (For testing only)
     * @returns {object} Sequentializer
     * @private
     */
    sap.ushell.services.AppState._getSequentializer = function () {
        return new Sequentializer();
    };

    /**
     * Adapter which is responsible for serializing access to the underlying adapter methods
     *
     * @param {object} oUnderlyingAdapter underlying adapter
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.SequentializingAdapter = function (oUnderlyingAdapter) {
        this._oSequentializer = new Sequentializer();
        this._oUnderlyingAdapter = oUnderlyingAdapter;
    };

    /**
     * Method to save an application state (sequentialized)
     * delegating to the underlying adapter, but using a sequentialized implementation
     *
     * @param {string} sKey
     *   Application state key
     * @param {string} sSessionKey
     *   Current session key
     * @param {string} sData
     *   Application state data
     * @param {string} sAppname
     *   Application name
     * @param {string} sComponent
     *   UI5 component name
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.SequentializingAdapter.prototype.saveAppState = function (sKey, sSessionKey, sData, sAppname, sComponent) {
        var fn;
        fn = this._oUnderlyingAdapter.saveAppState.bind(this._oUnderlyingAdapter, sKey, sSessionKey, sData, sAppname, sComponent);
        return this._oSequentializer.addToQueue(fn);
    };

    /**
     * Method to load an application state
     * delegating directly to the underlying adapter
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {object} promise
     *   Resolve handler has args (key, value)
     * @private
     * @since 1.28.0
     */
    sap.ushell.services.AppState.SequentializingAdapter.prototype.loadAppState = function (sKey) {
        return this._oUnderlyingAdapter.loadAppState(sKey);
    };
}());
