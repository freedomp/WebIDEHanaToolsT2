/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([],
    function() {
        "use strict";

        var BrowserPersistence = function(sKeyExpanedNodesList) {
            this._sKeyExpanedNodesList = sKeyExpanedNodesList + ".KEY_EXPANED_NODES_LIST";
        };

        BrowserPersistence.prototype = {
            _sKeyExpanedNodesList : null,
            //==================================
            // Expanded and Collapsed state
            //==================================
            getNodesExpanded: function() {
                // this._log4debug();
                return this._get(this._sKeyExpanedNodesList) || {};
            },
            
            _log4debug: function () {
                var oNodesExpanded = this._get(this._sKeyExpanedNodesList);
                if(oNodesExpanded){
                    console.log("");
                    console.log("*==================================================*");
                    console.log("*                  Expanded list                   *");
                    console.log("*==================================================*");
                    for (var prop in oNodesExpanded) {
                        console.log(prop + ": " + oNodesExpanded[prop]);
                    }
                }
            },

            setNodeExpanded: function(sTag) {
                var oNodesExpanded = this.getNodesExpanded();
                var sParentPath = sTag;

                while (sParentPath && sParentPath.length > 0) {
                    oNodesExpanded[sParentPath] = true;
                    sParentPath = sParentPath.substring(0, sParentPath.lastIndexOf("/"));
                }
                this._set(this._sKeyExpanedNodesList, oNodesExpanded);
            },

            setNodeCollapsed: function(sTag) {
                var oNodesExpanded = this.getNodesExpanded();
                oNodesExpanded[sTag] = false;
                this._set(this._sKeyExpanedNodesList, oNodesExpanded);
            },

            cleanNodeExpandedList: function() {
                var oNodesExpanded = this.getNodesExpanded();
                var sPath, sDelPath = "";
                var aPaths = [];
                for (sPath in oNodesExpanded) {
                    if (oNodesExpanded.hasOwnProperty(sPath)) {
                        aPaths.push(sPath);
                    }
                }
                aPaths.sort(this._sort);
                for (var i = 0; i < aPaths.length; i++) {
                    sPath = aPaths[i];
                    if (!oNodesExpanded[sPath]) {
                        sDelPath = sPath;
                    }
                    if(sDelPath.length > 0 && sPath.indexOf(sDelPath) === 0){
                        if(oNodesExpanded[sPath] !== undefined){
                            delete oNodesExpanded[sPath];
                        }
                    } else {
                        sDelPath = "";
                    }
                }
                this._set(this._sKeyExpanedNodesList, oNodesExpanded);
            },
            
            //=================================
            // Cookie
            //=================================
            _set: function(sName, sValue) {
                // var value = JSON.stringify(sValue);
                // $.cookie(sCookieName, value, {
                //     expires: 1
                // });
                sValue = JSON.stringify(sValue);
                localStorage.setItem(sName, sValue); 
            },

            _get: function(sName) {
                // var sCheckedCookieName = "";
                // if(typeof sCookieName !== "string"){
                //   return null;
                // }
                // else{
                //     sCheckedCookieName = sCookieName;
                // }
                // var s = $.cookie(sCheckedCookieName);
                var s = localStorage.getItem(sName);
                try {
                    return (typeof s === "string") ? JSON.parse(s) : null;
                } catch (e) {
                    return null;
                } 
                try {
                    return (typeof s === "string") ? JSON.parse(s) : null;
                } catch (e) {
                    return null;
                }
            },
            
            _sort: function(A, B) {
                if (A < B) {
                    return -1;
                }
                if (A > B) {
                    return 1;
                }
                return 0;
            },
            
            reset: function () {
                this._set(this._sKeyExpanedNodesList, null);
            }

        };
        
        return BrowserPersistence;
    });