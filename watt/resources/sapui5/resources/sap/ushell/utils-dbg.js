// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview This file contains miscellaneous utility functions.
 */

(function () {
    "use strict";
    /*global dispatchEvent, document, jQuery, URI, localStorage, sap, clearTimeout, setTimeout */

    // ensure that sap.ushell exists
    jQuery.sap.declare("sap.ushell.utils");

    sap.ushell.utils = {};
    var visibilityCalcTimer;

    /**
     * Creates an <code>Error</code> object and logs the error message immediately.
     * Class representing an error that is written to the log.
     *
     * @param {string} sMessage
     *   the error message
     * @param {string} [sComponent]
     *   the error component to log
     * @class
     * @constructor
     * @since 1.15.0
     */
    sap.ushell.utils.Error = function (sMessage, sComponent) {
        this.name = "sap.ushell.utils.Error";
        this.message = sMessage;
        jQuery.sap.log.error(sMessage, null, sComponent);
    };

    sap.ushell.utils.Error.prototype = new Error();

    /**
     * Wrapper for localStorage.setItem() including exception handling
     * caused by exceeding storage quota limits
     * or exception is always thrown (safari private browsing mode)
     *
     * @param {string} sKey
     *   the key for the storage entry
     * @param {string} sValue
     *   the value for the storage entry
     * @param {boolean} [bLocalEvent=false]
     *   when true the storage event is also fired for the source window
     *
     * @since 1.21.2
     * @private
     */
    sap.ushell.utils.localStorageSetItem = function (sKey, sValue, bLocalEvent) {
        var oEvent;
        try {
            localStorage.setItem(sKey, sValue);
            if (bLocalEvent) {
                oEvent = document.createEvent("StorageEvent");
                // Events are fired only if setItem works
                // If we want to decouple this (to have eventing to the same window)
                // we have to provide a wrapper for localStorage.getItem and -removeItem() also
                oEvent.initStorageEvent("storage", false, false,
                        sKey, "", sValue, "", localStorage);
                dispatchEvent(oEvent);
            }
        } catch (e) {
            jQuery.sap.log.warning("Error calling localStorage.setItem(): " + e, null,
                "sap.ushell.utils");
        }
    };

    /**
     * given a link tag ( a ) or a window object, calculate the origin (protocol, host, port)
     * especially for cases where the .origin property is not present on the DOM Member
     * (IE11)
     * @param {object} oDomObject a location bearig object, e.g. a link-tag DOMObject or a window
     * @returns {string} a string containing protocol :// host : port (if present),
     *  e.g. "http://www.sap.com:8080" or "https://uefa.fifa.com"
     */
    sap.ushell.utils.calculateOrigin = function (oDomObject) {
        var oURI;
        if (oDomObject.origin) {
            return oDomObject.origin;
        }
        if (oDomObject.protocol && oDomObject.hostname) {
            return oDomObject.protocol + "//" + oDomObject.hostname + (oDomObject.port ? ':' + oDomObject.port : '');
        }
        if (oDomObject.href) {
            oURI = new URI(oDomObject.href);
            //beware, URI treats : not as part of the protocol
            return oURI.protocol() + "://" + oURI.hostname() + (oURI.port() ? ':' + oURI.port() : '');
        }
    };

    /**
     * Detect whether the browser can open WebGui applications natively.
     *
     * This is expected to happen from NWBC Version 6 onward.
     *
     * NWBC exposes a feature bit vector via the getNwbcFeatureBits method of
     * the private epcm object.  This is expected to be a
     * string in hex format representing 4 bits, where the least significant
     * bit represents native navigation capability. For example: "B" = 1011,
     * last bit is 1, therefore native navigation capability is enabled.
     *
     * @return {boolean}
     *     whether the browser can open SapGui applications natively
     */
    sap.ushell.utils.hasNativeNavigationCapability = function() {
        var sFeaturesHex = "0",
            oPrivateEpcm;

        // Try to get the Feature version number
        if (window.external && window.external && typeof window.external.getPrivateEpcm !== "undefined") {
            oPrivateEpcm = window.external.getPrivateEpcm();

            try {
                sFeaturesHex = oPrivateEpcm.getNwbcFeatureBits();
                jQuery.sap.log.debug("Detected epcm getNwbcFeatureBits returned feature bits: " + sFeaturesHex);
            } catch(e) {
                jQuery.sap.log.error(
                    "failed to get feature bit vector via call getNwbcFeatureBits on private epcm object",
                    e.stack,
                    "sap.ushell.utils"
                );
            }
        }

        return (parseInt(sFeaturesHex, 16) & 1) > 0;
    };

    /**
     * Determine whether the input oResolvedNavigationTarget represents a
     * WebGui application that can be navigated natively by the browser.
     *
     * @param {object} oResolvedNavigationTarget the resolution result at least properties
     *  applicationType
     * @returns {boolean}
     *      true iff the resolution result represents a response which is to be treated by the Fiori Desktop client
     * @private
     */
    sap.ushell.utils.isNativeWebGuiNavigation = function (oResolvedNavigationTarget) {
        if (this.hasNativeNavigationCapability() && oResolvedNavigationTarget && oResolvedNavigationTarget.applicationType === "TR") {
            return true;
        }
        return false;
    };

    /**
     * A mapping from arbitrary string(!) keys (including "get" or "hasOwnProperty") to
     * values of any type.
     * Creates an empty map.
     * @class
     * @since 1.15.0
     */
    sap.ushell.utils.Map = function () {
        this.entries = {};
    };

    /**
     * Associates the specified value with the specified key in this map. If the map previously
     * contained a mapping for the key, the old value is replaced by the specified value. Returns
     * the old value. Note: It might be a good idea to assert that the old value is
     * <code>undefined</code> in case you expect your keys to be unique.
     *
     * @param {string} sKey
     *   key with which the specified value is to be associated
     * @param {any} vValue
     *   value to be associated with the specified key
     * @returns {any}
     *   the old value
     * @since 1.15.0
     */
    sap.ushell.utils.Map.prototype.put = function (sKey, vValue) {
        var vOldValue = this.get(sKey);
        this.entries[sKey] = vValue;
        return vOldValue;
    };

    /**
     * Returns <tt>true</tt> if this map contains a mapping for the specified key.
     *
     * @param {string} sKey
     *   key whose presence in this map is to be tested
     * @returns {boolean}
     *   <tt>true</tt> if this map contains a mapping for the specified key
     * @since 1.15.0
     */
    sap.ushell.utils.Map.prototype.containsKey = function (sKey) {
        if (typeof sKey !== "string") {
            throw new sap.ushell.utils.Error("Not a string key: " + sKey, "sap.ushell.utils.Map");
        }
        return Object.prototype.hasOwnProperty.call(this.entries, sKey);
    };

    /**
     * Returns the value to which the specified key is mapped, or <code>undefined</code> if this map
     * contains no mapping for the key.
     * @param {string} sKey
     *   the key whose associated value is to be returned
     * @returns {any}
     *   the value to which the specified key is mapped, or <code>undefined</code> if this map
     *   contains no mapping for the key
     * @since 1.15.0
     */
    sap.ushell.utils.Map.prototype.get = function (sKey) {
        if (this.containsKey(sKey)) {
            return this.entries[sKey];
        }
        //return undefined;
    };

    /**
     * Returns an array of this map's keys. This array is a snapshot of the map; concurrent
     * modifications of the map while iterating do not influence the sequence.
     * @returns {string[]}
     *   this map's keys
     * @since 1.15.0
     */
    sap.ushell.utils.Map.prototype.keys = function () {
        return Object.keys(this.entries);
    };

    /**
     * Removes a key together with its value from the map.
     * @param {string} sKey
     *  the map's key to be removed
     * @since 1.17.1
     */
    sap.ushell.utils.Map.prototype.remove = function (sKey) {
        delete this.entries[sKey];
    };

    /**
     * Returns this map's string representation.
     *
     * @returns {string}
     *   this map's string representation
     * @since 1.15.0
     */
    sap.ushell.utils.Map.prototype.toString = function () {
        var aResult = ['sap.ushell.utils.Map('];
        aResult.push(JSON.stringify(this.entries));
        aResult.push(')');
        return aResult.join('');
    };


    /**
     * returns the Parameter value of a boolean
     * "X", "x", "true" and all case variations are true,
     * "false" and "" and all case variations are false
     *  all others and not specified return undefined
     *  @param {string} sParameterName
     *     The name of the parameter to look for, case sensitive
     *  @param {string} [sParams]
     *     specified parameter (search string), if not specified, search part of current url is used
     *  @returns {boolean} true, false or undefined
     */
    sap.ushell.utils.getParameterValueBoolean = function (sParameterName, sParams) {
        var aArr = jQuery.sap.getUriParameters(sParams).mParams && jQuery.sap.getUriParameters(sParams).mParams[sParameterName],
            aTruthy = ["true", "x"],
            aFalsy = ["false", ""],
            sValue;
        if (!aArr || aArr.length === 0) {
            return undefined;
        }
        sValue = aArr[0].toLowerCase();
        if (aTruthy.indexOf(sValue) >= 0) {
            return true;
        }
        if (aFalsy.indexOf(sValue) >= 0) {
            return false;
        }
        return undefined;
    };

    /**
     * Serves as a marker for functions that are to be exposed in QUnit tests. Calls to this
     * function are expected to be placed directly before the named function declaration (even
     * <b>after</b> the JSDoc). The function itself does nothing.
     *
     * @param {object} o
     *   the object to which this function will be attached in tests; must not be <code>this</code>
     *   (use <code>that</code> instead)
     * @param {string} [sExternalFunctionName]
     *   Optional external function name (since 1.25.0) to be used instead of the "local" function
     *   name which may have been changed e.g. by a minifier. Use this parameter in case of
     *   integration tests (and only then) which MUST be able to run against minified productive
     *   code!<p>
     *   <b>BEWARE:</b> Integration tests should rely on
     *   <code>sap.ushell.utils.testPublishAt</code> only in exceptional cases!
     * @since 1.15.0
     */
    sap.ushell.utils.testPublishAt = function (o, sExternalFunctionName) {
      // intentionally left blank
    };

    /**
     * Calls the given success handler (a)synchronously. Errors thrown in the success handler are
     * caught and the error message is reported to the error handler; if an error stack is
     * available, it is logged.
     *
     * @param {function ()} fnSuccess
     *   no-args success handler
     * @param {function (string)} [fnFailure]
     *   error handler, taking an error message; MUST NOT throw any error itself!
     * @param {boolean} [bAsync=false]
     *   whether the call shall be asynchronously
     * @since 1.28.0
     */
    sap.ushell.utils.call = function (fnSuccess, fnFailure, bAsync) {
        // Be aware of that this function is also defined as "sap.ui2.srvc.call".
        // Only difference is error logging to UI5. Please keep aligned!
        var sMessage;

        if (bAsync) {
            setTimeout(function () {
                sap.ushell.utils.call(fnSuccess, fnFailure, false);
            }, 0);
            return;
        }

        try {
            fnSuccess();
        } catch (e) {
            sMessage = e.message || e.toString();
            jQuery.sap.log.error("Call to success handler failed: " + sMessage,
                e.stack, //may be undefined: only supported in Chrome, FF; not in Safari, IE
                "sap.ushell.utils");
            if (fnFailure) {
                fnFailure(sMessage);
            }
        }
    };

    sap.ushell.utils.getIndexOfTopGroupInViewPort = function () {
        var jqTileContainers = jQuery('#dashboardGroups').find('.sapUshellTileContainer'),
            oOffset = jqTileContainers.not('.sapUshellHidden').first().offset(),
            firstContainerOffset = (oOffset && oOffset.top) || 0,
            aTileContainersTopAndBottoms = [],
            nScrollTop = 0,
            viewPortTop,
            topGroupIndex;

        if (document.getElementById('dashboard')) {
            nScrollTop = document.getElementById('dashboard').scrollTop;
        }
        // In some weird corner cases, those may not be defined -> bail out.
        if (!jqTileContainers || !oOffset) {
            return undefined;
        }
        jqTileContainers.each(function () {
            if (!jQuery(this).hasClass("sapUshellHidden")) {
                var nContainerTopPos = jQuery(this).parent().offset().top;
                aTileContainersTopAndBottoms.push([nContainerTopPos, nContainerTopPos + jQuery(this).parent().height()]);
            }
        });
        viewPortTop = nScrollTop + firstContainerOffset;
        jQuery.each(aTileContainersTopAndBottoms, function (index, currentTileContainerTopAndBottom) {
            var currentTileContainerTop = currentTileContainerTopAndBottom[0],
                currentTileContainerBottom = currentTileContainerTopAndBottom[1];

            if (currentTileContainerTop <= viewPortTop && viewPortTop <= currentTileContainerBottom) {
                topGroupIndex = index;
                return;
            }
        });
        return topGroupIndex;
    };

    /**
     * Setting Tiles visibility using the Visibility contract, according to the view-port's position.
     *
     * Serves only the last caller, with a delay of 1 sec in order to make sure that rendering is complete
     */
    sap.ushell.utils.handleTilesVisibility = function () {

        // If a previous call is still waiting  - cancel it
        clearTimeout(visibilityCalcTimer);

        // Set the new timer
        visibilityCalcTimer = setTimeout(function () {
            var start = new Date(),
                // Get the visible and non-visible Tiles
                aTiles = sap.ushell.utils.getVisibleTiles(),
                duration,
                launchPageService;

            if (aTiles && aTiles.length) {
                launchPageService = sap.ushell.Container.getService("LaunchPage");

                aTiles.forEach(function (oTile) {
                    var tileObject = sap.ushell.utils.getTileObject(oTile);
                    if (tileObject !== null) {
                        launchPageService.setTileVisible(tileObject, oTile.isDisplayedInViewPort);
                    }
                });
                jQuery.sap.log.debug("Visible Tiles: " + aTiles.filter(function (oTile) {return oTile.isDisplayedInViewPort; }).length);
                jQuery.sap.log.debug("NonVisible Tiles: " + aTiles.filter(function (oTile) {return !oTile.isDisplayedInViewPort; }).length);
            }

            duration = new Date() - start;
            jQuery.sap.log.debug("Start time is: " + start + " and duration is: " + duration);
        }, 1000);
    };

    /**
     * Setting Tiles visibility using the Visibility contract as not visible.
     *
     * The affected tiles are only the visible tiles according to the view port's position.
     *
     * This action happens immediately with no timers or timeouts.
     */
    sap.ushell.utils.setTilesNoVisibility = function () {
        // this method currently is used upon navigation (i.e. Shell.controlelr - openApp)
        // as there is logic that is running in the background such as OData count calls of the dynamic tiles
        // which are still visible at navigation (as no one had marked it otherwise).
        var aTiles = sap.ushell.utils.getVisibleTiles(),
            launchPageService;
        if ((typeof aTiles !== "undefined") && aTiles.length > 0) {
            launchPageService = sap.ushell.Container.getService("LaunchPage");

            aTiles.forEach(function (oTile) {
                launchPageService.setTileVisible(sap.ushell.utils.getTileObject(oTile), false);
            });
            jQuery.sap.log.debug("Visible Tiles: " + aTiles.filter(function (oTile) {return oTile.isDisplayedInViewPort; }).length);
            jQuery.sap.log.debug("NonVisible Tiles: " + aTiles.filter(function (oTile) {return !oTile.isDisplayedInViewPort; }).length);
        }
    };

    /**
     * Gets a hash and returns only the semanticObject-action part of it
     * @param {string} hash shell hash
     * @returns {string} Semantic Object action part of hash, false in case of a syntactically wrong hash
     */
    sap.ushell.utils.getBasicHash = function (hash) {
        // Check hash validity
        if (!sap.ushell.utils.validHash(hash)) {
            jQuery.sap.log.debug("Utils ; getBasicHash ; Got invalid hash");
            return false;
        }

        var oURLParsing = sap.ushell.Container.getService("URLParsing"),
            oShellHash = oURLParsing.parseShellHash(hash);

        return oShellHash ?  oShellHash.semanticObject + "-" + oShellHash.action : hash;
    };

    sap.ushell.utils.validHash = function (hash) {
        return (hash && hash.constructor === String && jQuery.trim(hash) != "");
    };

    sap.ushell.utils.handleTilesOpacity = function (oModel) {
        jQuery.sap.require("sap.ui.core.theming.Parameters");

        var aTilesOpacityValues,
            currentTile,
            appUsagePromise,
            sColor = sap.ui.core.theming.Parameters.get("sapUshellTileBackgroundColor"),
            rgbColor = this.hexToRgb(sColor),
            jqTiles,
            calculatedOpacity,
            RGBAformat,
            jqTile,
            sCurrentHash,
            rgbaValue,
            oContext,
            pathSegments,
            groupind,
            tileInd,
            oUserRecentsService = sap.ushell.Container.getService("UserRecents");
        //In case of custom theme where UI5 parameters are not used - tiles opacity cannot be supported
        if (rgbColor) {
            RGBAformat = "rgba(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ",{0})";
            appUsagePromise = oUserRecentsService.getAppsUsage();

            appUsagePromise.done(function (appUsage) {
                aTilesOpacityValues = appUsage.usageMap;
                jqTiles = jQuery('.sapUshellTile').not('.sapUshellTileFooter');
                var groups = oModel.getProperty("/groups");
                oModel.setProperty('/animationRendered', true);

                for (var index = 0; index < jqTiles.length; index++) {
                    jqTile = jQuery(jqTiles[index]);
                    sCurrentHash = this.getBasicHash(jqTile.find('.sapUshellTileBase').attr('data-targeturl'));
                    if (sCurrentHash) {
                        calculatedOpacity = this.convertToRealOpacity(aTilesOpacityValues[sCurrentHash], appUsage.maxUsage);
                        rgbaValue = RGBAformat.replace("{0}", calculatedOpacity);
                        currentTile = sap.ui.getCore().byId(jqTile.attr('id'));
                        oContext = currentTile.getBindingContext();
                        pathSegments = oContext.sPath.split('/');
                        groupind = pathSegments[2];
                        tileInd = pathSegments[4];
                        groups[groupind].tiles[tileInd].rgba = rgbaValue;
                    }
                }

                oModel.setProperty("/groups", groups);
            }.bind(this));
        }

    };

    sap.ushell.utils.convertToRealOpacity = function(amountOfUsage, max) {
        var aOpacityLevels = [1, 0.95, 0.9, 0.85, 0.8],
            iOpacityVariance = Math.floor(max / aOpacityLevels.length),
            iOpacityLevelIndex;

        if (!amountOfUsage) {
            return aOpacityLevels[0];
        } else if (!max){
            return aOpacityLevels[aOpacityLevels.length - 1];
        } else {
            iOpacityLevelIndex = Math.floor((max - amountOfUsage) / iOpacityVariance);
            return iOpacityLevelIndex < aOpacityLevels.length ? aOpacityLevels[iOpacityLevelIndex] : aOpacityLevels[aOpacityLevels.length - 1];
        }
    };

    sap.ushell.utils.getCurrentHiddenGroupIds = function(oModel) {
        var aGroups = oModel.getProperty('/groups'),
            aHiddenGroupsIDs = [],
            sGroupId,
            groupIndex;

        for (groupIndex in aGroups) {
            if (!aGroups[groupIndex].isGroupVisible) {
                sGroupId = aGroups[groupIndex].groupId;
                aHiddenGroupsIDs.push(sGroupId);
            }
        }
        return aHiddenGroupsIDs;
    };

    sap.ushell.utils.hexToRgb = function(hex) {
        var bIsHexIllegal = !hex || hex[0] != '#' || (hex.length  != 4 && hex.length != 7),
            result;

        //If hex consists of three-character RGB notation, convert it into six-digit form
        hex = !bIsHexIllegal && hex.length === 4 ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex;
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    /**
     * Gets the device's form factor. Based on <code>sap.ui.Device.system</code> from SAPUI5.
     * @returns {string}
     *   the device's form factor ("desktop", "tablet" or "phone")
     * @since 1.25.1
     */
    sap.ushell.utils.getFormFactor = function () {
        //Please be aware of that this function is also defined as "sap.ui2.srvc.getFormFactor". Keep aligned!
        var oSystem = sap.ui.Device.system;

        if (oSystem.desktop){
            return oSystem.SYSTEMTYPE.DESKTOP;
        } else if (oSystem.tablet) {
            return oSystem.SYSTEMTYPE.TABLET;
        } else {
            return oSystem.phone ? oSystem.SYSTEMTYPE.PHONE : undefined;
        }

    };

    /**
     * Iterate over all the Tiles and mark each one as visible or non-visible
     * according to the view-port's position.
     *
     * @returns {Array} Array of Tile objects, each one includes the flag "isDisplayedInViewPort" indicating its visibility
     */
    sap.ushell.utils.getVisibleTiles = function () {

        var nWindowHeight = document.body.clientHeight,
            oControl = sap.ui.getCore().byId("dashboardGroups"),
            oNavContainer = sap.ui.getCore().byId("navContainer"),
            groupsIndex,
            tilesIndex,
            group,
            groupTiles,
            oTile,
            tileDomRef,
            tileOffset,
            tileTop,
            tileBottom,
            shellHdrHeight = jQuery('#shell-hdr').height(),
            aTiles = [];


        if (oControl && oControl.getGroups() && oNavContainer) {
            //verify we are in the dashboard page
            var bIsInDashBoard = (oNavContainer.getCurrentPage().sId === "application-Shell-home") &&
                (oControl.getModel().getProperty("/currentViewName") === "home"),
                aGroups = oControl.getGroups();

            // Loop over all Groups
            //jQuery.each(aGroups, function(groupIndex) {
            for (groupsIndex = 0; groupsIndex < aGroups.length; groupsIndex = groupsIndex + 1) {
                group = aGroups[groupsIndex];
                groupTiles = group.getTiles();
                if (groupTiles) {
                    // Loop over all Tiles in the current Group
                    for (tilesIndex = 0; tilesIndex < groupTiles.length; tilesIndex = tilesIndex + 1) {

                        oTile = groupTiles[tilesIndex];

                        if (!bIsInDashBoard) {
                            // if current state is not dashboard ("Home") set not visible
                            oTile.isDisplayedInViewPort = false;
                        } else {
                            tileDomRef = jQuery(oTile.getDomRef());
                            tileOffset = tileDomRef.offset();

                            // On Dashboard loading - the Dashboard Groups Container is rendered once in an empty state on initialization
                            // and then again when all data is loaded and the Groups need to be rendered.
                            // This condition is for exiting the function when it is called for the 1st time
                            if (!tileOffset) {
                                return null;
                            }

                            tileTop = tileDomRef.offset().top;
                            tileBottom = tileTop + tileDomRef.height();

                            // If the Tile is located above or below the view-port
                            oTile.isDisplayedInViewPort = (tileBottom > shellHdrHeight) && (tileTop < nWindowHeight);
                        }
                        aTiles.push(oTile);
                    } // End of Tiles loop
                }
            } // End of Groups loop

        }
        return aTiles;
    };

    sap.ushell.utils.getTileObject = function (ui5TileObject) {
        var bindingContext = ui5TileObject.getBindingContext();
        return bindingContext.getObject() ? bindingContext.getObject().object : null;
    };

    sap.ushell.utils.addBottomSpace = function () {
        var jqContainer = jQuery('#dashboardGroups').find('.sapUshellTileContainer:visible'),
            lastGroup = jqContainer.last(),
            headerHeight = jQuery(".sapUshellShellHead").height(),
            lastGroupHeight = lastGroup.parent().height(),
            groupTitleMarginTop = parseInt(lastGroup.find(".sapUshellContainerTitle").css("margin-top"), 10),
            groupsContainerPaddingBottom = parseInt(jQuery('.sapUshellDashboardGroupsContainer').css("padding-bottom"), 10);

	    var nBottomSpace = jQuery(window).height() - headerHeight - lastGroupHeight - groupTitleMarginTop - groupsContainerPaddingBottom;
	    nBottomSpace = (nBottomSpace < 0) ? 0 : nBottomSpace;

	    // Add margin to the bottom of the screen in order to allow the lower TileContainer (in case it is chosen)
	    //to be shown on the top of the view-port
	    jQuery('.sapUshellDashboardGroupsContainer').css("margin-bottom", nBottomSpace + "px");
    };

    sap.ushell.utils.groupHasVisibleTiles = function (groupTiles, groupLinks) {
        var visibleTilesInGroup = false,
            tileIndex,
            tempTile,
            tiles = !groupTiles ? [] : groupTiles,
            links = !groupLinks ? [] : groupLinks;

        tiles = tiles.concat(links);

        if (tiles.length === 0) {
            return false;
        }

        for (tileIndex = 0; tileIndex < tiles.length; tileIndex = tileIndex + 1) {
            tempTile = tiles[tileIndex];
            // Check if the Tile is visible on the relevant device
            if (tempTile.isTileIntentSupported) {
                visibleTilesInGroup = true;
                break;
            }
        }
        return visibleTilesInGroup;
    };

    /**
     * #
     * @param {function} fnFunction
     *    the function
     * @param {array} aArguments
     *    the arguments
     * @param {string[]} aArgumentsNames
     *    array of the argument names for non-trivial functions with more than one argument
     * @returns {jQuery.Deferred.promise|function}
     *    a promise or a function
     */
    sap.ushell.utils.invokeUnfoldingArrayArguments = function(fnFunction, aArguments) {
        var aArgArray;
        if (!jQuery.isArray(aArguments[0])) {
            // invoke directy
            return fnFunction.apply(this, aArguments);
        } else {
            // process as array
            aArgArray = aArguments[0];

            if (aArgArray.length === 0) {
                // empty array
                return new jQuery.Deferred().resolve([]).promise();
            } else {
                var oDeferred = new jQuery.Deferred(),
                    aPromises = [],
                    aRes = [],
                    thePromise = new jQuery.Deferred().resolve();

                aArgArray.forEach(function(nThArgs, iIndex) {
                    if (!jQuery.isArray(nThArgs)) {
                        jQuery.sap.log.error("Expected Array as nTh Argument of multivalue invokation: first Argument must be array of array of arguments: single valued f(p1,p2), f(p1_2,p2_2), f(p1_3,p2_3) : multivalued : f([[p1,p2],[p1_2,p2_2],[p1_3,p2_3]]");
                        throw new Error("Expected Array as nTh Argument of multivalue invokation: first Argument must be array of array of arguments: single valued f(p1,p2), f(p1_2,p2_2), f(p1_3,p2_3) : multivalued : f([[p1,p2],[p1_2,p2_2],[p1_3,p2_3]]");
                    }
                    // nThArgs is an array of the arguments
                    var pr = fnFunction.apply(this, nThArgs),
                        pr2 = new jQuery.Deferred();

                    pr.done(function() {
                        var a = Array.prototype.slice.call(arguments);
                        aRes[iIndex] = a;
                        pr2.resolve();
                    }).fail(pr2.reject.bind(pr2));
                    aPromises.push(pr2.promise());
                    thePromise = jQuery.when(thePromise, pr2);
                });

                jQuery.when.apply(jQuery, aPromises).done(function() {
                    oDeferred.resolve(aRes);
                }).fail(function() {
                    oDeferred.reject("failure");
                });

                // invoke direclty
                return oDeferred.promise();
            }
        }
    };

    /*
     * Returns whether client side nav target resolution is enabled.
     *
     * @returns {boolean}
     *    whether client side nav target resolution is enabled.
     *
     * @private
     */
    sap.ushell.utils.isClientSideNavTargetResolutionEnabled = function () {
        var bDefaultEnabled = true,
            sLocalStorageClientSetting;

        if (jQuery.sap.storage === undefined) { // in case it's called before jQuery.sap.storage is defined (e.g., tests)
            sLocalStorageClientSetting = window.localStorage.getItem("targetresolution-client");
            sLocalStorageClientSetting = (
                 sLocalStorageClientSetting === false   ||
                 sLocalStorageClientSetting === "false" ||
                 sLocalStorageClientSetting === ""
            ) ? false : true;

        } else {
            sLocalStorageClientSetting = jQuery.sap.storage(
                jQuery.sap.getObject("jQuery.sap.storage.Type.local"),
                "targetresolution"
            ).get("client");
        }

        // Check when disabled
        if (sLocalStorageClientSetting === "" ||
            sLocalStorageClientSetting === false ||
            sap.ushell.utils.getParameterValueBoolean("sap-ushell-nav-cs") === false) {

            return false;
        }

        // Default behavior
        return bDefaultEnabled;
    };

}());
