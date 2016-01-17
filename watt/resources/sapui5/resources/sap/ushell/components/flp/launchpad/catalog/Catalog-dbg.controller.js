// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, $, sap, window */
    /*jslint nomen: true */

    sap.ui.controller("sap.ushell.components.flp.launchpad.catalog.Catalog", {
        oPopover: null,
        onInit: function () {
            sap.ui.getCore().getEventBus().subscribe("showCatalogEvent", this.onShow, this);
            sap.ui.getCore().byId("catalogSelect").addEventDelegate({
                onBeforeRendering : this.onBeforeSelectRendering
            }, this);
            var oRouter = this.getView().parentComponent.getRouter();
            oRouter.attachRoutePatternMatched(this.onShow.bind(this));
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("showCatalogEvent", this.onShow);
            /*this.getView().aDanglingControls.forEach(function (oControl) {
                oControl.destroy();
            });*/
        },

        onBeforeRendering: function () {
            //Invoking loading of all catalogs here instead of 'onBeforeShow' as it improves the perceived performance.
            //Fix of incident#:1570469901
            sap.ui.getCore().getEventBus().publish("showCatalog");
            //set initial focus
            setTimeout(function () {
                jQuery('#catalogSelect').focus();
            }, 0);
        },

        onAfterRendering: function () {
            // disable swipe gestures -> never show master in Portait mode
            var oModel = this.getView().getModel(),
                aCurrentCatalogs = oModel.getProperty('/catalogs'),
                that = this;
            //check if the catalogs were already loaded, if so, we don't need the loading message
            if (!aCurrentCatalogs.length) {

                //add the loading message right after the catalog is rendered
                oModel.setProperty('/catalogs', [{
                    title: sap.ushell.resources.i18n.getText('catalogsLoading'),
                    "static": true,
                    tiles: [],
                    numIntentSupportedTiles : -1//only in order to present this option in the Catalog.view (dropdown menu)since there is a filter there on this property
                }]);
                oModel.setProperty('/catalogsNoDataText', sap.ushell.resources.i18n.getText('loadingTiles'));

            } else if (aCurrentCatalogs[0].title != sap.ushell.resources.i18n.getText('catalogsLoading')) {
                oModel.setProperty('/catalogsNoDataText', sap.ushell.resources.i18n.getText('noFilteredItems'));
            }

            if (!this.PagingManager) {
                this.lastCatalogId = 0;
                jQuery.sap.require("sap.ushell.components.flp.launchpad.PagingManager");
                this.PagingManager = new sap.ushell.components.flp.launchpad.PagingManager('catalogPaging', {
                    elementClassName: 'sapUshellTile',
                    containerHeight: window.innerHeight,
                    containerWidth: window.innerWidth
                });
            }

            //just the first time
            if (this.PagingManager.currentPageIndex === 0) {
                that.allocateNextPage();
            }

            jQuery("#catalogTilesPage-cont").scroll(function () {
                var oPage = sap.ui.getCore().byId('catalogTilesPage'),
                    scroll = oPage.getScrollDelegate(),
                    currentPos = scroll.getScrollTop(),
                    max = scroll.getMaxScrollTop();

                if (max - currentPos <= 30 + that.PagingManager.getTileHeight()) {
                    that.allocateNextPage();
                }
            });
            jQuery(window).resize(function () {
                var windowWidth = $(window).width(),
                    windowHeight = $(window).height();

                that.PagingManager.setContainerSize(windowWidth, windowHeight);
                that.resetPageFilter();
                that.applyTileFilters();
            });
        },

        onShow: function (oEvent) {
            //if the user goes to the catalog directly (not via the dashboard)
            //we must close the loading dialog
            var hashTag,
                oModel = this.getView().getModel(),
                aCatalogTiles = oModel.getProperty("/catalogTiles") || [],
                sDataParam = oEvent.getParameter('arguments').filters,
                oDataParam = sDataParam ? JSON.parse(sDataParam) : sDataParam,
                sPath = (oDataParam && decodeURIComponent(oDataParam.targetGroup)) || "",
                i;
            $.extend(this.getView().getViewData(), oEvent);
            if (this.PagingManager) {
                this.resetPageFilter();
            }

            this.categoryFilter = (oDataParam && oDataParam.catalogSelector && oDataParam.catalogSelector) || null;
            this.searchFilter = (oDataParam && oDataParam.tileFilter && oDataParam.tileFilter) || null;
            hashTag = (oDataParam && oDataParam.tagFilter && oDataParam.tagFilter) || "";

            sPath = sPath === 'undefined' ? undefined : sPath;
            this._updateModelWithGroupContext(sPath);

            if (hashTag) {
                try {
                    this.tagFilter = JSON.parse(hashTag);
                } catch (e) {
                    this.tagFilter = [];
                }
            } else {
                this.tagFilter = [];
            }
            if (this.tagFilter) {
                oModel.setProperty("/selectedTags", this.tagFilter);
            }
            oModel.setProperty("/showCatalogHeaders", true);
            oModel.setProperty("/catalogSearchFilter", this.searchFilter);

            for (i = 0; i < aCatalogTiles.length; i = i + 1) {
                aCatalogTiles[i].active = false;
            }

            if (this.categoryFilter || this.searchFilter) {
                // selected category does not work with data binding
                // we need to rerender it manually and then set the selection
                // see function onBeforeSelectRendering
                sap.ui.getCore().byId("catalogSelect").rerender();
            } else {
                //display all
                sap.ui.getCore().byId("catalogSelect").setSelectedItemId("");
            }

            this.oRenderingFilter = new sap.ui.model.Filter('', 'EQ', 'a');
            this.oRenderingFilter.fnTest = function (val) {
                if (val.catalogIndex <= this.lastCatalogId) {
                    return true;
                }

                if (this.allocateTiles > 0) {
                    this.lastCatalogId = val.catalogIndex;
                    this.allocateTiles--;
                    return true;
                }

                return false;
            }.bind(this);

            if (this.PagingManager) {
                this.applyTileFilters();
            }
        },
        resetPageFilter : function () {
            this.lastCatalogId = 0;
            this.allocateTiles = this.PagingManager.getNumberOfAllocatedElements();
        },
        allocateNextPage : function () {
            if (!this.allocateTiles || this.allocateTiles === 0) {
                //calculate the number of tiles in the page.
                this.PagingManager.moveToNextPage();
                this.allocateTiles = this.PagingManager._calcElementsPerPage();
                this.applyTileFilters();
            }
        },

        onBeforeSelectRendering : function () {
            var oSelect = sap.ui.getCore().byId("catalogSelect"),
                aItems = jQuery.grep(oSelect.getItems(), jQuery.proxy(function (oItem) {
                    return oItem.getBindingContext().getObject().title === this.categoryFilter;
                }, this));

            if (!aItems.length) {
                aItems.push(oSelect.getItemAt(0));
            }

            if (aItems[0] && oSelect.getSelectedItemId() !== aItems[0].getId()) {
                window.setTimeout($.proxy(oSelect.setSelectedItem, oSelect, aItems[0].getId()), 500);
            }
        },

        setTagsFilter : function (aFilter) {
            var oParameterObject = {
                catalogSelector : this.categoryFilter,
                tileFilter : this.searchFilter,
                tagFilter : aFilter,
                targetGroup : encodeURIComponent(this.getGroupContext())
            };
            this.getView().parentComponent.getRouter().navTo('catalog', {filters: JSON.stringify(oParameterObject)}, true);
        },

        setCategoryFilter : function (aFilter) {
            var oParameterObject = {
                catalogSelector : aFilter,
                tileFilter : this.searchFilter,
                tagFilter: JSON.stringify(this.tagFilter),
                targetGroup : encodeURIComponent(this.getGroupContext())
            };
            this.getView().parentComponent.getRouter().navTo('catalog', {filters : JSON.stringify(oParameterObject)}, true);
        },

        setSearchFilter : function (aFilter) {
            var oParameterObject = {
                catalogSelector : this.categoryFilter,
                tileFilter : aFilter,
                tagFilter: JSON.stringify(this.tagFilter),
                targetGroup : encodeURIComponent(this.getGroupContext())
            };
            this.getView().parentComponent.getRouter().navTo('catalog', {'filters' : JSON.stringify(oParameterObject)});
        },

       /**
        * Returns the group context path string as kept in the model
        *
        * @returns {string} Group context
        */
        getGroupContext :  function () {
            var oModel = this.getView().getModel(),
                sGroupContext = oModel.getProperty("/groupContext/path");

            return sGroupContext ? sGroupContext : "";
        },

        applyTileFilters : function () {
            var aFilters = [],
                otagFilter,
                oSearchFilter,
                oCategoryFilter,
                sCatalogTitle;
            if (this.tagFilter) {
                otagFilter = new sap.ui.model.Filter('tags', 'EQ', 'v');
                otagFilter.fnTest = function (oTags) {
                    var ind, filterByTag;
                    if (this.tagFilter.length === 0) {
                        return true;
                    }

                    for (ind = 0; ind < this.tagFilter.length; ind++) {
                        filterByTag = this.tagFilter[ind];
                        if (oTags.indexOf(filterByTag) === -1) {
                            return false;
                        }
                    }
                    return true;
                }.bind(this);

                aFilters.push(otagFilter);
            }

            if (this.searchFilter) {
                oSearchFilter = new sap.ui.model.Filter($.map(this.searchFilter.split(/[\s,]+/), function (v) {
                    return (v && new sap.ui.model.Filter("keywords", sap.ui.model.FilterOperator.Contains, v)) ||
                        (v && new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, v)) || undefined;
                }), true);
                aFilters.push(oSearchFilter);
            }
            if (this.categoryFilter) {
                sCatalogTitle = this.categoryFilter;

                // Filtering the catalog tiles  according to catalog title (and not catalog ID)  
                oCategoryFilter = new sap.ui.model.Filter("catalog", sap.ui.model.FilterOperator.EQ, sCatalogTitle);
                aFilters.push(oCategoryFilter);
            }
            //Anyway we would like to filter out tiles which are not supported on current device
            aFilters.push(new sap.ui.model.Filter("isTileIntentSupported", sap.ui.model.FilterOperator.EQ, true));

            //Adding the page filter.
            if (this.oRenderingFilter) {
                aFilters.push(this.oRenderingFilter);
            }

            sap.ui.getCore().byId("catalogTiles").getBinding("tiles").filter(aFilters);
        },

        onLiveFilter : function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            if (sQuery) {
                this.setSearchFilter(sQuery);
            } else {
                this.setSearchFilter();
            }
        },

        onTagsFilter : function (oEvent) {
            var selectedItem = oEvent.getParameters("selectedItem").changedItem,
                selected = oEvent.getParameter("selected"),
                selectedTagsList = [],
                selectedTag = selectedItem.getText();

            if (this.tagFilter) {
                selectedTagsList = this.tagFilter;
            }

            if (selected) {
                selectedTagsList.push(selectedTag);
            } else {
                selectedTagsList = selectedTagsList.filter(function (entry) {
                    return entry !== selectedTag;
                });
            }
            this.setTagsFilter(selectedTagsList.length > 0 ? JSON.stringify(selectedTagsList) : "");
        },

        onCategoryFilter : function (oEvent) {
            var oSource = oEvent.getParameter("selectedItem"),
                oSourceContext = oSource.getBindingContext(),
                oModel = oSourceContext.getModel();
            if (oModel.getProperty("static", oSourceContext)) { // show all categories
                oModel.setProperty("/showCatalogHeaders", true);
                this.setCategoryFilter();
                this.selectedCategory = undefined;
            } else { // filter to category
                oModel.setProperty("/showCatalogHeaders", false);
                this.setCategoryFilter(oSource.getBindingContext().getObject().title);
                this.selectedCategory = oSource.getId();
            }
        },

        onTileAfterRendering : function (oEvent) {
            var footItem = oEvent.getSource().getFootItems()[0];
            if (footItem !== undefined) {
                footItem.addStyleClass("sapUshellCatalogPlusIcon");
            }
        },

        catalogTilePress : function (oController) {
            sap.ui.getCore().getEventBus().publish("launchpad", "catalogTileClick");
        },

        /**
         * Event handler triggered if tile should be added to the default group.
         *
         * @param {sap.ui.base.Event} oEvent
         *     the event object. It is expected that the binding context of the event source points to the tile to add.
         */
        onTileFooterClick : function (oEvent) {
            var oSource = oEvent.getSource(),
                oSourceContext = oSource.getBindingContext(),
                that = this,
                oModel = this.getView().getModel(),
                oOkBtn,
                oCancelBtn,
                placement,
                clickedObject = oEvent.oSource,
                clickedObjectDomRef = clickedObject.getDomRef(),
                oPopoverData = this.createPopoverData(oEvent),
                oPopoverModel = new sap.ui.model.json.JSONModel(oPopoverData.userGroupList),
                iPopoverDataSectionHeight = 192,
                sGroupModelPath = oModel.getProperty("/groupContext/path"),
                oList,
                oPopoverContainer,
                oNewGroupParts;

            // Check if the catalog was opened in the context of a group, according to the groupContext ("/groupContext/path") in the model
            if (sGroupModelPath) {
                this._handleTileFooterClickInGroupContext(oSourceContext, sGroupModelPath);

            // If the catalog wasn't opened in the context of a group - the action of clicking a catalog tile should open the groups popover
            } else {
                oList = this._createPopoverGroupList(oPopoverData);

                oPopoverContainer = this._setPopoverContainer(iPopoverDataSectionHeight);
                oNewGroupParts = this._createNewGroupUiElements(oPopoverContainer, iPopoverDataSectionHeight);

                oPopoverContainer.addContent(oNewGroupParts.newGroupItemList);
                oPopoverContainer.addContent(oList);

                if (document.body.clientHeight - clickedObjectDomRef.getBoundingClientRect().bottom >= 310) {
                    placement = "Bottom";
                } else {
                    placement = "Auto";
                }

                this.oPopover = new sap.m.ResponsivePopover({
                    id : "groupsPopover",
                    placement : placement,
                    content : [oPopoverContainer],
                    enableScrolling : true,
                    title: sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"),
                    contentWidth: '20rem',
                    afterClose: function () {
                        oNewGroupParts.newGroupItemList.destroy();
                        oNewGroupParts.newGroupNameInput.destroy();
                        oOkBtn.destroy();
                        oCancelBtn.destroy();
                        oPopoverContainer.destroy();
                        that.oPopover.destroy();
                        that.oPopover = null;
                    }
                });

                if (!sap.ui.Device.system.phone) {
                    this.oPopover.setContentHeight(iPopoverDataSectionHeight + "px");
                } else {
                    this.oPopover.setContentHeight("100%");
                }

                oOkBtn = this._createOkButton(oSourceContext, oPopoverModel, oPopoverData, that, that.oPopover, oNewGroupParts.newGroupNameInput);
                oCancelBtn = this._createCancelButton(that.oPopover);

                this.oPopover.setBeginButton(oOkBtn);
                this.oPopover.setEndButton(oCancelBtn);
                this.oPopover.setInitialFocus('newGroupItem');
                this.oPopover.openBy(clickedObject);
            }
        },

        _getCatalogTileIndexInModel : function (oSourceContext) {
            var tilePath = oSourceContext.sPath,
                tilePathPartsArray = tilePath.split("/"),
                tileIndex = tilePathPartsArray[tilePathPartsArray.length - 1];

            return tileIndex;
        },

        _handleTileFooterClickInGroupContext : function (oSourceContext, sGroupModelPath) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                oModel = this.getView().getModel(),
                catalogTile = this.getCatalogTileDataFromModel(oSourceContext),
                aAssociatedGroups = catalogTile.tileData.associatedGroups,
                oGroupModel = oModel.getProperty(sGroupModelPath), // Get the model of the group according to the group's model path (e.g. "groups/4") 
                sGroupId = oLaunchPageService.getGroupId(oGroupModel.object),
                iCatalogTileInGroup = $.inArray(sGroupId, aAssociatedGroups),
                tileIndex = this._getCatalogTileIndexInModel(oSourceContext),
                oGroupContext,
                oAddTilePromise,
                oRemoveTilePromise,
                sTileCataogId,
                groupIndex,
                that = this;

            if (catalogTile.isBeingProcessed) {
                return;
            }
            oModel.setProperty('/catalogTiles/' + tileIndex + '/isBeingProcessed', true);
            // Check if this catalog tile already exist in the relevant group 
            if (iCatalogTileInGroup == -1) {
                oGroupContext = new sap.ui.model.Context(oSourceContext.getModel(), sGroupModelPath);
                oAddTilePromise = this._addTile(oSourceContext, oGroupContext);

                // Function createTile of Dashboard manager always calls defferred.resolve, 
                // and the success/failure indicator is the returned data.status
                oAddTilePromise.done(function (data) {
                    if (data.status == 1) {
                        that._groupContextOperationSucceeded(oSourceContext, catalogTile, oGroupModel, true);
                    } else {
                        that._groupContextOperationFailed(catalogTile, oGroupModel, true);
                    }
                });
                oAddTilePromise.always(function () {
                    oModel.setProperty('/catalogTiles/' + tileIndex + '/isBeingProcessed', false);
                });

            } else {
                sTileCataogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id;
                groupIndex = sGroupModelPath.split('/')[2];
                oRemoveTilePromise = this._removeTile(sTileCataogId, groupIndex);

                // Function deleteCatalogTileFromGroup of Dashboard manager always calls defferred.resolve, 
                // and the success/failure indicator is the returned data.status
                oRemoveTilePromise.done(function (data) {
                    if (data.status == 1) {
                        that._groupContextOperationSucceeded(oSourceContext, catalogTile, oGroupModel, false);
                    } else {
                        that._groupContextOperationFailed(catalogTile, oGroupModel, false);
                    }
                });
                oRemoveTilePromise.always(function () {
                    oModel.setProperty('/catalogTiles/' + tileIndex + '/isBeingProcessed', false);
                });
            }
        },

        _createPopoverGroupList : function (oPopoverData) {
            var aUserGroupsFilters = [],
                oPopoverModel,
                oList = new sap.m.List({
                    mode : sap.m.ListMode.MultiSelect,
                    includeItemInSelection: true
                }),
                oListItemTemplate = new sap.m.DisplayListItem({
                    label : "{title}",
                    selected : "{selected}",
                    tooltip: "{title}",
                    type: sap.m.ListType.Active
                }),
                that = this;

            oList.addEventDelegate({
                onsapup: function (oEvent) {
                    try {
                        oEvent.preventDefault();

                        if (that.getView().getModel().getProperty("/groups/length")) {
                            var jqNewGroupItem,
                                currentFocusGroup = jQuery(":focus");
                            if (currentFocusGroup.index() == 0) {   //first group in the list
                                jqNewGroupItem = jQuery("#newGroupItem");
                                jqNewGroupItem.focus();
                                oEvent._bIsStopHandlers = true;
                            }
                        }
                    } catch (e) {
                    }
                }
            });

            // In case the list item (representing a group) is clicked by the user - change the checkbox's state
            oList.attachItemPress(function (oEvent) {
                var clickedListItem = oEvent.getParameter('listItem'),
                    srcControl = oEvent.getParameter('srcControl'),
                    bSelected;

                if (srcControl.getMetadata().getName() === 'sap.m.CheckBox') {
                    bSelected = clickedListItem.isSelected();
                    srcControl.setSelected(!bSelected);
                    clickedListItem.setSelected(!bSelected);
                }
            });

            aUserGroupsFilters.push(new sap.ui.model.Filter("isGroupLocked", sap.ui.model.FilterOperator.EQ, false));
            if (this.getView().getModel().getProperty('/enableHideGroups')) {
                aUserGroupsFilters.push(new sap.ui.model.Filter("isGroupVisible", sap.ui.model.FilterOperator.EQ, true));
            }
            oList.bindItems("/", oListItemTemplate, null, aUserGroupsFilters);
            oPopoverModel = new sap.ui.model.json.JSONModel(oPopoverData.userGroupList);
            oList.setModel(oPopoverModel);

            return oList;
        },

        _setPopoverContainer : function (popoverDataSectionHeight) {
            var popoverContainerId = "popoverContainer",
                popoverContainer = new sap.m.ScrollContainer({
                    id: popoverContainerId,
                    horizontal : false,
                    vertical : true
                });

            if (!sap.ui.Device.system.phone) {
                popoverContainer.setHeight((popoverDataSectionHeight - 2) + "px");
            } else {
                popoverContainer.setHeight("100%");
            }

            return popoverContainer;
        },

        _createNewGroupUiElements : function (oPopoverContainer, iPopoverDataSectionHeight) {
            var oModel = this.getView().getModel(),
                oNewGroupNameInput,
                oBackButton,
                oNewGroupLabel,
                oHeadBar,
                oNewGroupItem,
                oNewGroupItemList,
                that = this;

            oNewGroupNameInput = new sap.m.Input({
                id : "newGroupNameInput",
                type : "Text",
                placeholder : sap.ushell.resources.i18n.getText("new_group_name")
            });

            // new group panel - back button
            oBackButton = new sap.m.Button({
                icon: sap.ui.core.IconPool.getIconURI("nav-back"),
                press : function (oEvent) {
                    that.oPopover.removeAllContent();

                    if (!sap.ui.Device.system.phone) {
                        that.oPopover.setContentHeight(iPopoverDataSectionHeight + "px");
                    } else {
                        that.oPopover.setContentHeight("100%");
                    }

                    that.oPopover.setVerticalScrolling(true);
                    that.oPopover.addContent(oPopoverContainer);
                    that.oPopover.setTitle(sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"));
                    that.oPopover.setCustomHeader();

                    oNewGroupNameInput.enabled = false;
                    oNewGroupNameInput.setValue('');
                },
                tooltip : sap.ushell.resources.i18n.getText("newGroupGoBackBtn_tooltip")
            });
            oBackButton.addStyleClass("sapUshellCatalogNewGroupBackButton");

            // new group panel's label
            oNewGroupLabel = new sap.m.Label({
                text : sap.ushell.resources.i18n.getText("newGroup_popoverTitle")
            });

            // new group panel's header
            oHeadBar = new sap.m.Bar({
                contentLeft : [oBackButton],
                contentMiddle : [oNewGroupLabel]
            });

            // popover container Item - "New Group"
            oNewGroupItem = new sap.m.StandardListItem({
                id : "newGroupItem",
                title : sap.ushell.resources.i18n.getText("newGroup_listItemText"),
                type : "Navigation",
                press : function () {
                    that._navigateToCreateNewGroupPanel(that.oPopover, oNewGroupNameInput, oHeadBar);
                }
            });

            oNewGroupItemList = new sap.m.List({});

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oNewGroupItem.addStyleClass('help-id-newGroupItem');// xRay help ID
            }
            oNewGroupItemList.addItem(oNewGroupItem);
            oNewGroupItemList.addEventDelegate({
                onsapdown: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        if (that.getView().getModel().getProperty("/groups/length")) {
                            var jqFirstGroupListItem = jQuery("#popoverContainer .sapMListModeMultiSelect li").first();
                            jqFirstGroupListItem.focus();
                        }
                    } catch (e) {
                    }
                },
                onsaptabnext: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        var jqOkButton = jQuery("#okButton");
                        jqOkButton.focus();
                    } catch (e) {
                    }
                }
            });

            return {
                newGroupItemList : oNewGroupItemList,
                newGroupNameInput : oNewGroupNameInput
            };
        },

        _createOkButton : function (oSourceContext, oPopoverModel, popoverData, oGeneralScope, oPopover, oNewGroupNameInput, oHeadBar) {
            var oOkBtn = new sap.m.Button({
                id : "okButton",
                press : function (oEvent) {

                    oEvent.preventDefault();
                    oEvent._bIsStopHandlers = true;
                    /*eslint-disable consistent-this*/
                    var oUserSelection,
                        tileCatalogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id,
                        sGroupNameFromInput = oNewGroupNameInput.getValue().trim(),
                        aPromises = [],
                        oPressHandlerScope = this;
                    /*eslint-enable consistent-this*/
                    // Analyze user selection
                    oUserSelection = oGeneralScope._handlePopoverGroupsSelection(oPopoverModel, tileCatalogId, oSourceContext, popoverData, aPromises, oGeneralScope);

                    // In case the user chose to create a new group and opened the new group creation panel
                    if (oNewGroupNameInput.enabled) {
                        oUserSelection = oGeneralScope._handleNewGroupCreationPanel(oGeneralScope, oSourceContext, sGroupNameFromInput, aPromises, oUserSelection);
                    }

                    // After the promise objects of all the actions (i.e. add/remove tile from group) were gathered into an array - 
                    // they should be processed
                    jQuery.when.apply(jQuery, aPromises).then(
                        function () {
                            oGeneralScope._handlePopoverGroupsActionPromises(oGeneralScope, oPressHandlerScope, oSourceContext, popoverData, oUserSelection, arguments);
                        }
                    );

                    oPopover.close();

                }.bind(oPopoverModel),
                text : sap.ushell.resources.i18n.getText("okBtn")
            });

            oOkBtn.addEventDelegate({
                onsaptabprevious: function(oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        var jqNewGroupItem = jQuery("#newGroupItem");
                        if (!jqNewGroupItem.length) {
                            jqNewGroupItem = jQuery("#newGroupNameInput input");
                        }
                        jqNewGroupItem.focus();
                    } catch (e) {
                    }
                }
            });

            return oOkBtn;
        },

        _createCancelButton : function (oPopover) {
            return new sap.m.Button({
                id : "cancelButton",
                press : function (oEvent) {
                    oEvent.preventDefault();
                    oEvent._bIsStopHandlers = true;
                    oPopover.close();
                },
                text : sap.ushell.resources.i18n.getText("cancelBtn")
            });
        },

        _handlePopoverGroupsSelection : function (oPopoverModel, tileCataogId, oSourceContext, popoverData, promises, oGeneralScope) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                groupsIdTitleMap = {},
                oGroupContext,
                tempGroup,
                realGroupID,
                index,
                oUserSelection = {
                    selectedGroupsIDsArray : [],
                    numberOfAddedGroups : 0,
                    numberOfRemovedGroups : 0,
                    firstAddedGroupTitle : "",
                    firstRemovedGroupTitle : ""
                };

            for (index = 0; index < popoverData.userGroupList.length; index = index + 1) {
                tempGroup = oPopoverModel.oData[index];
                realGroupID = oLaunchPageService.getGroupId(tempGroup.object);
                // Add the real group Id and title to the map
                //  in order to support the detailed message that follows the user group selection
                groupsIdTitleMap[realGroupID] = tempGroup.title;

                if (tempGroup.selected) {
                    oUserSelection.selectedGroupsIDsArray.push(realGroupID);
                    oGroupContext = new sap.ui.model.Context(oSourceContext.getModel(), "/groups/" + index);
                    if (!oPopoverModel.oData[index].initiallySelected) {
                        promises.push(oGeneralScope._addTile(oSourceContext, oGroupContext));
                        oPopoverModel.oData[index].initiallySelected = true;
                        oUserSelection.numberOfAddedGroups = oUserSelection.numberOfAddedGroups + 1;
                        if (oUserSelection.numberOfAddedGroups == 1) {
                            oUserSelection.firstAddedGroupTitle = tempGroup.title;
                        }
                    }
                } else if ((!tempGroup.selected) && (oPopoverModel.oData[index].initiallySelected)) {
                    promises.push(oGeneralScope._removeTile(tileCataogId, index));
                    oPopoverModel.oData[index].initiallySelected = false;
                    oUserSelection.numberOfRemovedGroups = oUserSelection.numberOfRemovedGroups + 1;
                    if (oUserSelection.numberOfRemovedGroups == 1) {
                        oUserSelection.firstRemovedGroupTitle = tempGroup.title;
                    }
                }
            }
            return oUserSelection;
        },

        _handlePopoverGroupsActionPromises : function (oGeneralScope, oPressHandlerScope, oSourceContext, popoverData, oUserSelection, aPromiseArguments) {

            if (!(oUserSelection.numberOfAddedGroups == 0 && oUserSelection.numberOfRemovedGroups == 0)) {
                var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                    isOperationFailed = false,
                    isNewGroupAdded = false,
                    aErrorIndexes = [],
                    index,
                    sDetailedMessage;

                for (index = 0; index < aPromiseArguments.length && (!isOperationFailed || !isNewGroupAdded); index++) {
                    // check if tile was added to the new group successfully
                    if (aPromiseArguments[index].action == "addTileToNewGroup" && aPromiseArguments[index].status == 1) {
                        var tempGroup = oPressHandlerScope.oData[oPressHandlerScope.oData.length - 1],
                            realGroupID = oLaunchPageService.getGroupId(tempGroup.object);
                        oUserSelection.selectedGroupsIDsArray.push(realGroupID);
                        isNewGroupAdded = true;
                    }
                    // Check if the operation failed
                    //  The Data (i.e. aPromiseArguments[index]) for each operation includes:
                    //   - group: The relevant group object
                    //   - status: A boolean value stating if the operation succeeded of failed
                    //   - action: A String with the value 'add' or 'remove' or 'createNewGroup'
                    if (!aPromiseArguments[index].status) {
                        isOperationFailed = true;
                        aErrorIndexes.push(aPromiseArguments[index]);
                    }
                }
                if (isOperationFailed) {
                    var oErrorMessageObj = oGeneralScope.prepareErrorMessage(aErrorIndexes, popoverData.tileTitle),
                        dashboardMgr = sap.ushell.components.flp.launchpad.DashboardManager();

                    dashboardMgr.resetGroupsOnFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);

                } else {
                    // Update the model with the changes
                    oSourceContext.getModel().setProperty("/catalogTiles/" + popoverData.tileIndex + "/associatedGroups", oUserSelection.selectedGroupsIDsArray);

                    // Get the detailed message
                    sDetailedMessage = oGeneralScope.prepareDetailedMessage(popoverData.tileTitle, oUserSelection.numberOfAddedGroups, oUserSelection.numberOfRemovedGroups, oUserSelection.firstAddedGroupTitle, oUserSelection.firstRemovedGroupTitle);

                    sap.m.MessageToast.show( sDetailedMessage, {
                        duration: 3000,// default
                        width: "15em",
                        my: "center bottom",
                        at: "center bottom",
                        of: window,
                        offset: "0 -50",
                        collision: "fit fit"
                    });
                }
            }
        },

        /**
         * Handles success of add/remove tile action in group context.
         * Updates the model and shows an appropriate message to the user.
         *  
         * @param {object} oSourceContext
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array 
         * @param {object} oGroupModel - The model of the relevant group  
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         */
        _groupContextOperationSucceeded : function (oSourceContext, oCatalogTileModel, oGroupModel, bTileAdded) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                sGroupId = oLaunchPageService.getGroupId(oGroupModel.object),
                aAssociatedGroups = oCatalogTileModel.tileData.associatedGroups,
                detailedMessage,
                i;

            // Check if this is an "add tile to group" action
            if (bTileAdded) {
                // Update the associatedGroups array of the catalog tile
                aAssociatedGroups.push(sGroupId);

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty("/catalogTiles/" + oCatalogTileModel.tileIndex + "/associatedGroups", aAssociatedGroups);

                detailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 1, 0, oGroupModel.title, "");

            } else {
                // If this is a "remove tile from group" action

                // Update the associatedGroups array of the catalog tile
                for (i in aAssociatedGroups) {
                    if (aAssociatedGroups[i] == sGroupId) {
                        aAssociatedGroups.splice(i, 1);
                        break;
                    }
                }

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty("/catalogTiles/" + oCatalogTileModel.tileIndex + "/associatedGroups", aAssociatedGroups);
                detailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 0, 1, "", oGroupModel.title);
            }

            sap.m.MessageToast.show(detailedMessage, {
                duration: 3000,// default
                width: "15em",
                my: "center bottom",
                at: "center bottom",
                of: window,
                offset: "0 -50",
                collision: "fit fit"
            });
        },

        /**
         * Handles failure of add/remove tile action in group context.
         * Shows an appropriate message to the user and reloads the groups.
         *
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array
         * @param {object} oGroupModel - The model of the relevant group
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         */
        _groupContextOperationFailed : function (oCatalogTileModel, oGroupModel, bTileAdded) {
            var dashboardMgr = sap.ushell.components.flp.launchpad.getDashboardManager(),
                oErrorMessage;

            if (bTileAdded) {
                oErrorMessage = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title]});
            } else {
                oErrorMessage = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title]});
            }

            dashboardMgr.resetGroupsOnFailure(oErrorMessage.messageId, oErrorMessage.parameters);
        },

        _handleNewGroupCreationPanel : function (oGeneralScope, oSourceContext, sGroupNameFromInput, aPromises, oUserSelection) {
            var sNewGroupName,
                sEmptyGroupName = sap.ushell.resources.i18n.getText("new_group_name");

            if (sGroupNameFromInput.length > 0) {
                sNewGroupName = sGroupNameFromInput;
            } else {
                sNewGroupName = sEmptyGroupName;
            }

            aPromises.push(oGeneralScope._createGroupAndSaveTile(oSourceContext, sNewGroupName));
            oUserSelection.numberOfAddedGroups++;
            oUserSelection.firstAddedGroupTitle = sNewGroupName;

            return oUserSelection;
        },

        _navigateToCreateNewGroupPanel : function (oPopover, oNewGroupNameInput, oHeadBar) {

            oPopover.removeAllContent();
            oPopover.addContent(oNewGroupNameInput.addStyleClass("sapUshellCatalogNewGroupInput"));
            oPopover.setCustomHeader(oHeadBar);
            oPopover.setContentHeight("");
            oNewGroupNameInput.setValueState(sap.ui.core.ValueState.None);
            oNewGroupNameInput.setPlaceholder(sap.ushell.resources.i18n.getText("new_group_name"));
            oNewGroupNameInput.enabled = true;
            setTimeout(function () {
                oNewGroupNameInput.focus();
            }, 0);
        },

        prepareErrorMessage : function (aErroneousActions, sTileTitle) {
            var oGroup,
                sAction,
                sFirstErroneousAddGroup,
                sFirstErroneousRemoveGroup,
                iNumberOfFailAddActions = 0,
                iNumberOfFailDeleteActions = 0,
                bCreateNewGroupFailed = false,
                message;

            for (var index in aErroneousActions) {

                // Get the data of the error (i.e. action name and group object)

                oGroup = aErroneousActions[index].group;
                sAction = aErroneousActions[index].action;

                if (sAction == 'add') {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions == 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else if (sAction == 'remove') {
                    iNumberOfFailDeleteActions++;
                    if (iNumberOfFailDeleteActions == 1) {
                        sFirstErroneousRemoveGroup = oGroup.title;
                    }
                } else if (sAction == 'addTileToNewGroup') {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions == 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else {
                    bCreateNewGroupFailed = true;
                }
            }
            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length == 1) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_create_new_group"});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_some_actions"});
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length == 1) {
                if (iNumberOfFailAddActions) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_group", parameters: [sTileTitle, sFirstErroneousAddGroup]});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_group", parameters: [sTileTitle, sFirstErroneousRemoveGroup]});
                }
                // 	Many errors (iErrorCount > 1) - it can be several remove actions, or several add actions, or a mix of both
            } else {
                if (iNumberOfFailDeleteActions == 0) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_several_groups", parameters: [sTileTitle]});
                } else if (iNumberOfFailAddActions == 0) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_several_groups", parameters: [sTileTitle]});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_some_actions"});
                }
            }
            return message;
        },

        prepareDetailedMessage : function (tileTitle, numberOfAddedGroups, numberOfRemovedGroups, firstAddedGroupTitle, firstRemovedGroupTitle) {
            var message;

            if (numberOfAddedGroups == 0) {
                if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups == 1) {
                if (numberOfRemovedGroups == 0) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]);
                } else if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups > 1) {
                if (numberOfRemovedGroups == 0) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups]);
                } else if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups, numberOfRemovedGroups]);
                }
            }
            return message;
        },

        /**
         * Returns an object that contains:
         *  - An array of user groups, each one contains a "selected" property
         *  - An array ID's of the groups that contain the relevant Tile
         *
         * @param {sap.ui.base.Event} oEvent
         */
        createPopoverData : function (oEvent) {
            var oSource = oEvent.getSource(),
                oSourceContext = oSource.getBindingContext(),
                srvc = sap.ushell.Container.getService("LaunchPage"),
                index,
                model,
                path,
                tileTitle,
                realGroupID,

            // The popover basically contains an entry for each user group
                userGroupList = oSourceContext.getModel().getProperty("/groups"),

            // the relevant Catalog Tile form the model: e.g. /catalogTiles/5
                catalogTile = this.getCatalogTileDataFromModel(oSourceContext),

            // e.g. /catalogTiles/5/associatedGroups
                tileGroups = catalogTile.tileData.associatedGroups,

            // g.e. 5
                tileIndex = catalogTile.tileIndex;

            // In order to decide which groups (in the popover) will be initially selected:
            for (index = 0; index < userGroupList.length; index = index + 1) {

                // Get the group's real ID
                realGroupID = srvc.getGroupId(userGroupList[index].object);

                // Check if the group (i.e. real group ID) exists in the array of groups that contain the relevant Tile
                // if so - the check box that re[resents this group should be initially selected
                userGroupList[index].selected = !($.inArray(realGroupID, tileGroups) == -1);

                // In order to know if the group was selected before user action
                userGroupList[index].initiallySelected = userGroupList[index].selected;
            }
            path = oSourceContext.getPath(0);
            model = oSourceContext.getModel();
            tileTitle = model.getProperty(path).title;

            return {userGroupList : userGroupList, catalogTile : catalogTile, tileTitle : tileTitle, tileIndex : tileIndex};
        },

        /**
         * Returns the part of the model that contains the IDs of the groups that contain the relevant Tile
         *
         * @param {} oSourceContext
         *     model context
         */
        getCatalogTileDataFromModel : function (oSourceContext) {
            var tileIndex = this._getCatalogTileIndexInModel(oSourceContext),
                oModel = oSourceContext.getModel(),
                oTileData = oModel.getProperty("/catalogTiles/" + tileIndex);

            // Return an object containing the Tile in the CatalogTiles Array (in the model) ,its index and whether it's in the middle of add/removal proccess.
            return {
                tileData: oTileData,
                tileIndex: tileIndex,
                isBeingProcessed: oTileData.isBeingProcessed ? true : false
            };
        },

        /**
         * Event handler triggered if tile should be added to a specified group.
         *
         * @param {sap.ui.base.Event} oEvent
         *     the event object. It is expected that the binding context of the event source points to the group. Also,
         *     the event must contain a "control" parameter whose binding context points to the tile.
         */
        onAddTile : function (oEvent) {
            var oSourceContext = oEvent.getParameter("control").getBindingContext();
            if (!oSourceContext.getProperty("active")) {
                this._addTile(oSourceContext, oEvent.getSource().getBindingContext());
            }
        },

        onNavButtonPress : function (oEvent) {
            this.getView().parentComponent.getRouter().navTo('home');
        },

        /**
         * Update the groupContext part of the model with the path and ID of the context group, if exists
         *
         * @param {string} sPath - the path in the model of the context group, or empty string if no context exists
         */
        _updateModelWithGroupContext : function (sPath) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                oModel  = this.getView().getModel(),
                oGroupModel,
                oGroupContext = {
                    path : sPath,
                    id : "",
                    title : ""
                };

            // If sPath is defined and is different than empty string - set the group context id.
            // The recursive call is needed in order to wait until groups data is inserted to the model
            if (sPath && sPath !== "") {
                var timeoutGetGroupDataFromModel = function () {
                    var aModelGroups = oModel.getProperty("/groups");
                    if (aModelGroups.length) {
                        oGroupModel = oModel.getProperty(sPath);
                        oGroupContext.id = oLaunchPageService.getGroupId(oGroupModel.object);
                        oGroupContext.title = oGroupModel.title || oLaunchPageService.getGroupTitle(oGroupModel.object);
                        return;
                    }
                    setTimeout(timeoutGetGroupDataFromModel, 100);
                };
                timeoutGetGroupDataFromModel();
            }
            oModel.setProperty("/groupContext", oGroupContext);
        },
        
        /**
         * Send request to add a tile to a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext
         *     the catalog tile to add
         * @param {sap.ui.model.Context} oGroupContext
         *     the group where the tile should be added
         * @private
         */
        _addTile : function (oTileContext, oGroupContext) {
            var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager(),
                deferred = jQuery.Deferred(),
                promise = oDashboardManager.createTile({
                    catalogTileContext : oTileContext,
                    groupContext: oGroupContext
                });

            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        /**
         * Send request to delete a tile from a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param tileCatalogId
         *     the id of the tile
         * @param index
         *     the index of the group in the model
         * @private
         */
        _removeTile : function (tileCatalogId, index) {
            var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager(),
                deferred = jQuery.Deferred(),
                promise = oDashboardManager.deleteCatalogTileFromGroup({
                    tileId : tileCatalogId,
                    groupIndex : index
                });

            // The function deleteCatalogTileFromGroup always results in deferred.resolve
            // and the actual result of the action (success/failure) is contained in the data object
            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        /**
         * Send request to create a new group and add a tile to this group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext
         *     the catalog tile to add
         * @param newGroupName
         *     the name of the new group where the tile should be added
         * @private
         */
        _createGroupAndSaveTile : function (oTileContext, newGroupName) {
            var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager(),
                deferred = jQuery.Deferred(),
                promise = oDashboardManager.createGroupAndSaveTile({
                    catalogTileContext : oTileContext,
                    newGroupName: newGroupName
                });

            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        }
    });
}());
