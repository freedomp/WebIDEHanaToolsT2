// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, setTimeout, clearTimeout, $ */
    /*jslint plusplus: true, nomen: true */
    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");

    sap.ui.controller("sap.ushell.components.flp.launchpad.dashboard.DashboardContent", {

        onInit : function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            this.handleDashboardScroll = this._handleDashboardScroll.bind(this);

            oEventBus.subscribe('launchpad', 'actionModeInactive', this._handleExitActionMode, this);
            oEventBus.subscribe('launchpad', 'actionModeActive', this._enableGroupsUIActions, this.oView);
            oEventBus.subscribe("launchpad", "appClosed", this._resizeHandler, this);
            oEventBus.subscribe("launchpad", "appOpened", this._appOpenedHandler, this);

            this.sViewId = "#" + this.oView.getId();
            //On Android 4.x, and Safari mobile in Chrome and Safari browsers sometimes we can see bug with screen rendering
            //so _webkitMobileRenderFix function meant to fix it after  `contentRefresh` event.
            if (sap.ui.Device.browser.mobile) {
                oEventBus.subscribe("launchpad", "contentRefresh", this._webkitMobileRenderFix, this);
            }
            this.isDesktop = (sap.ui.Device.system.desktop && (navigator.userAgent.toLowerCase().indexOf('tablet') < 0));
        },

        onExit: function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("launchpad", "contentRefresh", this._webkitMobileRenderFix, this);
            oEventBus.unsubscribe("launchpad", "appClosed", this._resizeHandler, this);
            oEventBus.unsubscribe("launchpad", "appOpened", this._appOpenedHandler, this);
        },

        onAfterRendering : function () {
            var oEventBus = sap.ui.getCore().getEventBus(),
                oView = this.getView(),
                oDomRef = oView.getDomRef(),
                oScrollableElement = oDomRef.getElementsByTagName('section'),
                timer;

            oScrollableElement[0].removeEventListener('scroll', this.handleDashboardScroll);
            oScrollableElement[0].addEventListener('scroll', this.handleDashboardScroll);

            //Bind launchpad event handlers
            oEventBus.unsubscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.subscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.unsubscribe("launchpad", "scrollToFirstVisibleGroup", this._scrollToFirstVisibleGroup, this);
            oEventBus.subscribe("launchpad", "scrollToFirstVisibleGroup", this._scrollToFirstVisibleGroup, this);

            sap.ui.Device.orientation.attachHandler(function () {
                var jqTileContainers = jQuery('#dashboardGroups').find('.sapUshellTileContainer:visible');
                if (jqTileContainers.length) {
                    var oModel = this.getView().getModel(),
                        topViewPortGroupIndex = oModel.getProperty('/topGroupInViewPortIndex'),
                        oGroup,
                        bIsInEditTitle;
                    if (jqTileContainers.get(topViewPortGroupIndex)) {
                        oGroup = sap.ui.getCore().byId(jqTileContainers.get(topViewPortGroupIndex).id);
                        bIsInEditTitle = oModel.getProperty('/editTitle');
                        this._publishAsync("launchpad", "scrollToGroup", {group: oGroup, isInEditTitle: bIsInEditTitle});
                    }
                }
            }, this);

            jQuery(window).bind("resize", function () {
                clearTimeout(timer);
                timer = setTimeout(this._resizeHandler.bind(this), 300);
            }.bind(this));

            if (this.getView().getModel().getProperty("/personalization") && !sap.ushell.components.flp.ActionMode) {
                jQuery.sap.require("sap.ushell.components.flp.ActionMode");
                sap.ushell.components.flp.ActionMode.init(this.getView().getModel());
            }
            this._updateTopGroupInModel();
        },

        dashboardTilePress : function () {
            sap.ui.getCore().getEventBus().publish("launchpad", "dashboardTileClick");
        },

        _updateTopGroupInModel : function () {
            var oModel = this.getView().getModel(),
                topViewPortGroupIndex = this._getIndexOfTopGroupInViewPort();

            oModel.setProperty('/topGroupInViewPortIndex', topViewPortGroupIndex);
        },

        _getIndexOfTopGroupInViewPort : function () {
            var oView = this.getView(),
                oDomRef = oView.getDomRef(),
                oScrollableElement = oDomRef.getElementsByTagName('section'),
                jqTileContainers = $(oScrollableElement).find('.sapUshellTileContainer'),
                oOffset = jqTileContainers.not('.sapUshellHidden').first().offset(),
                firstContainerOffset = (oOffset && oOffset.top) || 0,
                aTileContainersTopAndBottoms = [],
                nScrollTop = oScrollableElement[0].scrollTop,
                viewPortTop,
                topGroupIndex = 0;

            // In some weird corner cases, those may not be defined -> bail out.
            if (!jqTileContainers || !oOffset) {
                return topGroupIndex;
            }

            jqTileContainers.each(function () {
                if (!jQuery(this).hasClass("sapUshellHidden")) {
                    var nContainerTopPos = jQuery(this).parent().offset().top;
                    aTileContainersTopAndBottoms.push([nContainerTopPos, nContainerTopPos + jQuery(this).parent().height() + jQuery(this).parent()[0].offsetTop]);
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
        },

        _handleDashboardScroll : function () {
            this._updateTopGroupInModel();
            sap.ushell.utils.handleTilesVisibility();
            sap.ui.getCore().getEventBus().publish("launchpad", "dashboardScroll");
        },

        _handleClick : function () {
            //Enable text selection in other scenarios than drag-and-drop
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }

        },

        _handleActionModeStartDrag : function (evt, ui) {
            this.uiActions.disable();
            var groupContainerClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone"),
                groupContainerCloneTitle = groupContainerClone.find(".sapUshellContainerTitle"),
                titleHeight = groupContainerCloneTitle.height(),
                titleWidth = groupContainerCloneTitle.width();

            if (!sap.ui.Device.system.phone) {
                groupContainerClone.find(".sapUshellTileContainerEditMode").offset({
                    top: this.uiEditModeActions.getMove().y - titleHeight,
                    left: this.uiEditModeActions.getMove().x - (titleWidth / 2)
                });
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerHidden");
            } else {
                jQuery(".sapUshellTilesContainer-sortable").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");
            }
            jQuery(".sapUshellTileContainerAfterContent").addClass("sapUshellTileContainerHidden");

            jQuery(ui).find(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");

            this.getModel().setProperty('/isInDrag', true);
            jQuery(ui).attr('startPos', jQuery(ui).index());

            jQuery.sap.log.info('startPos - ' + jQuery(ui).index());
            setTimeout(function () {
                sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
            }, 0);

            //scroll to group
            var groupsTop = jQuery("#dashboardGroups").offset().top,
                groupPlaceholder = jQuery(".sapUshellDashboardGroupsContainerItem-placeholder").offset().top,
                groupClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone").offset().top,
                scrollY = groupPlaceholder - groupsTop - groupClone;
            jQuery('.sapUshellDashboardView section').animate({scrollTop : scrollY}, 0);

        },

        _handleActionModeUIStart : function (evt, ui) {
            jQuery(ui).find(".sapUshellTileContainerContent").css("outline-color", "transparent");
            jQuery('body').addClass("sapUshellDisableUserSelect");
        },

        _handleActionModeDrop : function (evt, ui) {
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }

            var oBus = sap.ui.getCore().getEventBus(),
                jQueryObj = jQuery(ui),
                firstChildId = jQuery(jQueryObj.children()[0]).attr("id"),
                oGroup = sap.ui.getCore().byId(firstChildId),
                oDashboardGroups = sap.ui.getCore().byId("dashboardGroups"),
                oData = {group : oGroup, groupChanged : false, focus : false},
                nNewIndex = jQueryObj.index();

            jQueryObj.startPos = window.parseInt(jQueryObj.attr('startPos'), 10);
            oDashboardGroups.removeAggregation('groups', oGroup, true);
            oDashboardGroups.insertAggregation('groups', oGroup, nNewIndex, true);

            this.oController._handleActionModeGroupMove(evt, {item : jQueryObj});
            jQueryObj.removeAttr('startPos');
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStop");

            // avoid tile to be clicked after group was dropped
            setTimeout(function () {
                jQuery(".sapUshellContainerHeaderActions").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerAfterContent").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTilesContainer-sortable").removeClass("sapUshellTileContainerRemoveContent");
            }, 0);

            window.setTimeout(jQuery.proxy(oBus.publish, oBus, "launchpad", "scrollToGroup", oData), 1);
            this.uiActions.enable();
        },

        _handleActionModeGroupMove : function (evt, ui) {
            var fromIndex = ui.item.startPos,
                toIndex = ui.item.index(),
                oModel = this.getView().getModel();

            if (toIndex !== -1) {
                this._publishAsync("launchpad", "moveGroup", {
                    fromIndex  : fromIndex,
                    toIndex    : toIndex
                });
                setTimeout(function () {
                    oModel.setProperty('/isInDrag', false);
                }, 100);
            }
        },

        //Delete or Reset a given group according to the removable state.
        _handleGroupDeletion: function (oGroupBindingCtx) {
            jQuery.sap.require('sap.m.MessageBox');
            var oEventBus = sap.ui.getCore().getEventBus(),
                oGroup = oGroupBindingCtx.getObject(),
                bIsGroupRemovable = oGroup.removable,
                sGroupTitle = oGroup.title,
                sGroupId = oGroup.groupId,
                oResourceBundle = sap.ushell.resources.i18n,
                oMessageSrvc = sap.ushell.Container.getService("Message"),
                mActions = sap.m.MessageBox.Action,
                mCurrentAction = (bIsGroupRemovable ? mActions.DELETE : oResourceBundle.getText('ResetGroupBtn'));

            oMessageSrvc.confirm(oResourceBundle.getText(bIsGroupRemovable ? 'delete_group_msg' : 'reset_group_msg', sGroupTitle), function (oAction) {
                if (oAction === mCurrentAction) {
                    oEventBus.publish("launchpad", bIsGroupRemovable ? 'deleteGroup' : 'resetGroup', {
                        groupId: sGroupId
                    });
                }
            }, oResourceBundle.getText(bIsGroupRemovable ? 'delete_group' : 'reset_group'), [mCurrentAction, mActions.CANCEL]);
        },

        _enableGroupsUIActions: function () {
            if (this.uiEditModeActions) {
                this.uiEditModeActions.enable();
            }


        },

        _handleExitActionMode: function (ctx) {
            this.oView.uiEditModeActions.disable();
        },

        //force browser to repaint Body, by setting it `display` property to 'none' and to 'block' again
        _forceBrowserRerenderElement: function (element) {
            var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            if (animationFrame) {
                animationFrame(function () {
                    var display = element.style.display;
                    element.style.display = 'none';
                    element.offsetHeight;
                    element.style.display = display;
                });
            } else {
                jQuery.sap.log.info('unsupported browser for animation frame');
            }
        },

        //function fixes Android 4.x Chrome, and Safari bug with poor rendering
        _webkitMobileRenderFix: function () {
            //force Chrome to repaint Body, by setting it `display` property to 'none' and to 'block' again
            if (sap.ui.Device.browser.chrome || sap.ui.Device.os.android) {
                // this includes almost all browsers and devices
                // if this is the IOS6 (as the previous fix causes double flickering
                // and this one only one flickering)
                this._forceBrowserRerenderElement(document.body);
            }
        },

        _resizeHandler : function () {
            this._addBottomSpace();
            sap.ushell.utils.handleTilesVisibility();

            //Layout calculation is relevant only when the dashboard is presented
            var oNavContainerFlp = this.getView().getParent(),
                oCurrentViewName = oNavContainerFlp && oNavContainerFlp.getCurrentPage().getViewName(),
                bInDahsboard = oCurrentViewName == this.getView().getViewName();

            if (sap.ushell.Layout && bInDahsboard) {
                sap.ushell.Layout.reRenderGroupsLayout(null, true);
            }
        },

        _appOpenedHandler : function (sChannelId, sEventId, oData) {
            // checking if application component opened is not the FLP App Component (e.g. navigation to an app, not 'Home')
            // call to set all tiles visibility off (so no tile calls will run in the background)
            var oParentComponent = this.getOwnerComponent(), sParentName = oParentComponent.getMetadata().getComponentName();
            if (oData.additionalInformation.indexOf(sParentName) === -1) {
                sap.ushell.utils.setTilesNoVisibility();// setting no visibility on all visible tiles
            }
        },

        _addBottomSpace : function () {
            sap.ushell.utils.addBottomSpace();
        },

        _scrollToFirstVisibleGroup : function (sChannelId, sEventId, oData) {
            var sGroupId,
                fromTop = 0,
                that = this;

            if (oData.group) {
                sGroupId = oData.group.getGroupId();
            } else {
                // in case of scroll after deletion, the oData contains only the groupId.
                sGroupId = oData.groupId;
            }

            if (oData.fromTop) {
                fromTop = oData.fromTop - 50;
            }

            jQuery.each(this.oView.oDashboardGroupsBox.getGroups(), function (nIndex, oGroup) {
                if (oGroup.getGroupId() === sGroupId) {
                    var iY;

                    iY =  -1 * (document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(oGroup.sId).getBoundingClientRect().top;
                    jQuery('.sapUshellDashboardView section').animate({scrollTop : iY - fromTop}, 0, that.fHandleScrollEnd);

                    //on press event we need to set the group in focus
                    if (oData.group && oData.focus) {
                        jQuery.sap.byId(oGroup.sId).focus();
                    }

                    return false;
                }
            });
            sap.ushell.utils.addBottomSpace();
        },

        _scrollToGroup : function (sChannelId, sEventId, oData) {
            var sGroupId,
                that = this,
                oModel = this.getView().getModel();

            if (oData.group) {
                sGroupId = oData.group.getGroupId();
            } else {
                // in case of scroll after deletion, the oData contains only the groupId.
                sGroupId = oData.groupId;
            }

            // The model flag /scrollingToGroup indicates a scroll-to-group action currently occurs,
            oModel.setProperty("/scrollingToGroup", true);
            jQuery.each(this.oView.oDashboardGroupsBox.getGroups(), function (nIndex, oGroup) {
                if (oGroup.getGroupId() === sGroupId) {
                    var iY;
                    setTimeout(function () {
                        iY =  -1 * (document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(oGroup.sId).getBoundingClientRect().top;
                        jQuery('.sapUshellDashboardView section').animate({scrollTop : iY}, 500, that.fHandleScrollEnd);
                        if (oData.isInEditTitle) {
                            oGroup.setEditMode(true);
                        }
                    }, 300);

                    //on press event we need to set the group in focus
                    if (oData.group && oData.focus) {
                        jQuery.sap.byId(oGroup.sId).focus();
                    //    jQuery.sap.byId(oGroup.sId).addClass('sapUshellSelected');
                    }
                    //fix bottom space, if this a deletion scenario the 'oData.groupId' will return true
                    if (oData.groupId || oData.groupChanged) {
                        that._addBottomSpace();
                    }

                    jQuery('#groupList li')
                        .removeClass('sapUshellSelected')
                        .eq(nIndex).addClass('sapUshellSelected');

                    // Recalculate tiles visibility
                    sap.ushell.utils.handleTilesVisibility();

                    return false;
                }
            });
        },

        fHandleScrollEnd : function () {

            //Notify groupList
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("grouplist", "ScrollAnimationEnd");
        },

        /**
         *
         * @param event
         * @param ui : tile DOM Reference
         * @private
         */
        _handleDrop : function (event, ui) {
            //remove the disable-user-select class from body in case of desktop
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }
            var tileMoveInfo = sap.ushell.Layout.getLayoutEngine().layoutEndCallback(),
                oEventBus = sap.ui.getCore().getEventBus(),
                noRefreshSrc,
                noRefreshDst;

            if (!tileMoveInfo.tileMovedFlag) {
                return; //tile was not moved
            }
            noRefreshSrc = true;
            noRefreshDst = true; //Default - suppress re-rendering after drop
            //if src and destination groups differ - refresh src and dest groups
            //else if a tile has moved & dropped in a different position in the same group - only dest should refresh (dest == src)
            //if a tile was picked and dropped - but never moved - the previous if would have returned
            if ((tileMoveInfo.srcGroup !== tileMoveInfo.dstGroup)) {
                noRefreshSrc = noRefreshDst = false;
            } else if (tileMoveInfo.tile !== tileMoveInfo.dstGroup.getTiles()[tileMoveInfo.dstTileIndex]) {
                noRefreshDst = false;
            }
            tileMoveInfo.srcGroup.removeAggregation('tiles', tileMoveInfo.tile, noRefreshSrc);
            tileMoveInfo.dstGroup.insertAggregation('tiles', tileMoveInfo.tile, tileMoveInfo.dstTileIndex, noRefreshDst);

            oEventBus.publish("launchpad", "moveTile", {
                sTileId: tileMoveInfo.tile.getUuid(),
                toGroupId:  tileMoveInfo.dstGroup.getGroupId(),
                toIndex: tileMoveInfo.dstTileIndex
            });

            oEventBus.publish("launchpad", "sortableStop");
        },

        _publishAsync : function (sChannelId, sEventId, oData) {
            var oBus = sap.ui.getCore().getEventBus();
            window.setTimeout(jQuery.proxy(oBus.publish, oBus, sChannelId, sEventId, oData), 1);
        }
    });
}());
