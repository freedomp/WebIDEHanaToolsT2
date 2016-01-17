(function() {
	"use strict";
	jQuery.sap.declare("sap.watt.platform.plugin.content.control.NavigationBar");
	jQuery.sap.require("sap.ui.ux3.NavigationBar");

	sap.ui.ux3.NavigationBar.extend("sap.watt.platform.plugin.content.control.NavigationBar", {
	    
	    _iTabID : 0,
	    
		metadata : {
			//TODO adjust public methods
			publicMethods : [ 'setTitle', 'createTab', 'closeTab', 'setDirtyStateTab', 'getDirtyStateTab', 'selectTab', 'setTabTitle',
					'hasTabs', 'closeAll', 'getTabById', 'getTabTitle', 'getTabTitleById', 'getTabIndexById' , 'getSelectedIndex', 'getSelectedTabId', 'closeTabs', 'getAllTabIndexes' ],

			events : {
				'tabClose' : {},
				'tabSelect' : {},
				'beforeTabClose' : {},
				'tabContextMenu' : {},
				'tabDoubleClicked' : {}
			}
		},
		M_EVENTS : {
			'tabClose' : 'tabClose',
			'tabSelect' : 'tabSelect',
			'beforeTabClose' : 'beforeTabClose',
			'tabContextMenu' : 'tabContextMenu',
			'tabDoubleClicked' : 'tabDoubleClicked'
		},
		
		init : function() {
			this.aTabs = [];
			this._iTabID = 0;
			sap.ui.ux3.NavigationBar.prototype.init.apply(this, arguments);

			//this.attachEvent("tabClick", this.onTabClick, this);
			this.attachBrowserEvent("contextmenu", this.onTabContextMenu, this);
			this.attachBrowserEvent("dblclick", this.onTabDblClick, this);
			this.attachEvent("select", this.onTabSelect, this);

//							this.oExtHeaderLayout = new sap.ui.commons.layout.AbsoluteLayout(this._createId("extHeaderLayout"));
//							this.oExtHeaderLayout.setWidth("100%");
//							this.oExtHeaderLayout.setHeight("35px");
//							this.oExtContentLayout = new sap.ui.commons.layout.AbsoluteLayout(this._createId("extContentLayout"));
//							this.oExtContentLayout.setWidth("100%");
//							this.oExtContentLayout.addDelegate({
//								onAfterRendering : function(oControl) {
//									var domRef = oControl.srcControl.getDomRef();
//									if (domRef && domRef.parentElement) {
//										if (domRef.parentElement.style.height !== "calc(100% - 35px)") {
//											domRef.parentElement.style.height = "calc(100% - 35px)";
//										}
//										if (domRef.parentElement.style.top !== "35px") {
//											domRef.parentElement.style.top = "35px";
//										}
//									}
//								}
//							});
		},

		onclick : function(e) {

			this._handleActivation(e);
			this._handleSelectionStyle(e.target);

			this._handleClick(e);
		},

		/**
		 * event handler for the aggregation navigationBar's tabClick event
		 * @param e the event object has the clicked DOM reference as parameter : "target"
		 * @event beforeTabClose fired when the close button is clicked, exports the index of the clicked tab
		 */
		_handleClick : function(e) {

			var oDom = e.target ? e.target : e.getParameter("target");

			if (oDom.className == 'sapUiTabClose' || ( e.which == 2 && oDom.className.indexOf("sapUiUx3NavBarItem") > - 1) ) {
				// the close button was clicked
				var iClosedIndex = this._getItemIndex(jQuery(oDom).parentByAttribute('id'));
				var sTabId = oDom.parentElement.id;
				if (this.getDirtyStateTab(iClosedIndex)) {
					this.fireBeforeTabClose({
						closedIndex : iClosedIndex,
						closedTabId : sTabId
					});
					return;
				}
				this.closeTab(sTabId);
			} else {
				if (oDom.tagName == "LI") {
					this.selectTab(this._getItemIndex(jQuery(oDom)[0]), true);
				}
			}
		},


		/**
		 * checks if the tabStrip has any opened tabs
		 * @returns {Boolean}
		 */
		hasTabs : function() {
			return (this.aTabs.length > 0);
		},

/**
		 * close a given tab 
		 * @param sTabId the index of the tab to be closed
		 * @event  tabClose fires event tabClose with arguments: the index of the closed tab and the selected tab's index after closing the given tab
		 */
		closeTab : function(sTabId) {

			var that = this;

			var iCloseTabIndex = this.getTabIndexById(sTabId);

			// remove the iIndex tab locally and from the navigationBar
			this.aTabs.splice(iCloseTabIndex, 1);

			//remove item does not destroy the tab, so after closing and opening the same file sapui5 would throw an duplicate id error.
			this.getItems()[iCloseTabIndex].destroy();

			// fire event tabClose with arguments: the index of the closed tab and the selected tab's index after closing the given tab
			this.fireTabClose({
				closedIndex : iCloseTabIndex,
				closedTabId : sTabId
			});

			this._oContextTab = null;

		},
		
		_invalidateSelectIndexes : function () {
		    this.iSelectedItemIndex = undefined;
			this.iSelectedItemId = undefined;
		},

		/**
		 * close a subset of tabs
		 * @param aIndexes the indexes of the tabs to be closed
		 * @param dataLoss if true data loss popup will be displayed for dirty tabs and if false the tabs will be closed directly
		 */
		closeTabs : function(aIndexes, dataLoss) {
			//ensure sorting
			//sorting as number. Otherwise issues with sorting as string and indices > 10, when deleting from the end
			var fnCompare = function(a,b) {
				//make it explicit
				var iA = parseInt(a,10);
				var iB = parseInt(b,10);

				if (isNaN(iA) || isNaN(iB)) {
					throw new Error("number expected");
				}

				var iDiff = iA - iB;
				if (iDiff === 0){
					throw new Error("duplicate index");
				}

				return iDiff;
			};
			aIndexes.sort(fnCompare);

			//close tabs by index, starting from the end
			for (var i = aIndexes.length - 1; i > -1; i--) {
				var iIndexToClose = aIndexes[i];
				var oTab = this.aTabs[iIndexToClose];
				if (dataLoss && oTab.dirty) {
					this.fireBeforeTabClose({
						closedIndex : iIndexToClose,
						closedTabId : oTab.sTabId
					});
				} else {
					this.closeTab(oTab.sTabId);
				}
			}
		},
		/**
		 * closes all tabs and then display the initial call to action
		 */
		closeAll : function(bDataLoss) {
			this._oContextTab = null;
			this.closeTabs(this.getAllTabIndexes(), bDataLoss);
		},

		/**
		 * closes all other tabs and then display the initial call to action
		 */
		closeOthers : function(oTab, bDataLoss) {
			var iFound = this._getIndexForNavigationItem(oTab);
			if (iFound > -1) {
				var aAllIndexes = this.getAllTabIndexes();
				var iPosition = aAllIndexes.indexOf(iFound.toString());
				if (iPosition > -1) {
					aAllIndexes.splice(iPosition, 1);
				}
				this.closeTabs(aAllIndexes, bDataLoss);
			}
		},

		/**
		 * select a given tab, remove previous content and display the selected content in the content Layout
		 * @param iIndex the index of the tab to be selected, index of a tab is the order in which the tab was added starting from 0
		 * 				 if iIndex == -1 remove all contents and display the initial call for action
		 * @param bTabClicked boolean indicating whether the tab was selected by clicking
		 * @event tabSelect fires this event with the selected tab's index as argument
		 * and a boolean indicating whether the tab was selected by a click from within the tabStrip or from outside by calling selectTab
		 */
		 selectTab : function(iIndex, bTabClicked) {
			if (iIndex === -1 || !this.hasTabs()) {
				// reset the selection
				this._invalidateSelectIndexes();

				// This weird event is necessary to hide the last editor div in Content.controller/toggleVisibility
				this.fireTabSelect({
					index : -1,
					TabId: -1,
					clicked : bTabClicked,
					editorClass : undefined
				});
				return;
			}

			// precondition: 0 <= index < aTabs.length
			if (iIndex >= 0 && iIndex < this.aTabs.length) {

				// Set member to last selected item
				this.iSelectedItemIndex = iIndex;
				var oTab = this.aTabs[iIndex];
				this.iSelectedItemId = oTab.sTabId;

				// Set selected NavigationBar item
				var items = this.getItems();
				var slctItem = items[iIndex];
				this.setSelectedItem(slctItem);
				
				// fire event tabSelect with argument: the selected index
				this.fireTabSelect({
					index : this.iSelectedItemIndex,
					TabId: this.iSelectedItemId,
					clicked : bTabClicked,
					editorClass : oTab.editorClass
				});

			}
		},

		/**
		 * Helper method returning the index a navigationBar's item given its NavigationItem
		 * @param NavigationItem the instance of an NavigationItem
		 * @returns {Number} the index of the item or -1 if not found
		 */
		_getIndexForNavigationItem : function(oTab) {
			var iFound = -1;
			this.getItems().forEach(function(oOb, iIndex, aTabs) {
				if (oOb == oTab) {
					iFound = iIndex;
					return;
				}
			});
			return iFound;
		},
		/**
		 * helper method returning the index a navigationBar's item given its DOM Reference
		 * @param oDom the DOM ref
		 * @returns {Number} the index of the item
		 */
		_getItemIndex : function(oDom) {
			var i;
			if (!oDom.id || oDom.id.search('-close') != -1) {
				var I = jQuery(oDom).parentByAttribute('id');
				i = I.id;
			} else {
				i = oDom.id;
			}
			for (var a = 0, t = this.getItems(); a < t.length; a++) {
				if (i == t[a].getId()) {
					return a;
				}
			}
			return -1;
		},
		/**
		 * getter for dirty state of a given tab
		 * @param iIndex  index of the tab for which we need the dirty state , index of a tab is the order in which the tab was added starting from 0
		 * @returns {Boolean} dirty state = true if the tab's title has a "*" as last character, and false otherwise
		 */
		getDirtyStateTab : function(iIndex) {
			return this.aTabs[iIndex].dirty;
		},
		/**
		 * setter for dirty state of a given tab
		 * @param iIndex index of the tab for which the dirty state should be set, index of a tab is the order in which the tab was added starting from 0
		 * @param bDirty {Boolean} dirty state, true for changed but not yet saved tab's content and false for the opposite case
		 */
		setDirtyStateTab : function(iIndex, bDirty) {
			var slctTab = this.aTabs[iIndex];
			slctTab.dirty = bDirty;

			// Style editor dirty and clean states in DOM:
			// Needed as rendering is supressed here
			if (bDirty) {
				$(this.getItems()[iIndex].getDomRef()).addClass("wattTabDirty");
			} else {
				$(this.getItems()[iIndex].getDomRef()).removeClass("wattTabDirty");
			}

			this.setTitle(iIndex, slctTab.title, slctTab.tooltip, true);
		},

		setTabIcon : function(iTabIndex, sType){
			var oNavigationItem = this.getItems()[iTabIndex];
			if(sType === "error")
			{
				oNavigationItem.setIcon("errorTabIcon");
			}
			if(sType === "warning")
			{
				oNavigationItem.setIcon("warningTabIcon");
			}
			if(!sType)
			{
				oNavigationItem.setIcon("");
			}
		},

		/**
		 * Set title and tooltip of a given Tab
		 * @param iIndex: index of the tab for which the title and tooltip will be set, index of a tab is the order in which the tab was added starting from 0
		 * @param sTitle:  title to be displayed in the tab header
		 * @param sTooltip: optional tooltip to be displayed when hovering the tab header
		 * @param bDontInvalidate: optionally suppress invalidation and animated realignment of the tabs
		 */
		setTitle : function(iIndex, sTitle, sTooltip, bDontInvalidate) {

			var oTab = this.aTabs[iIndex];
			// check whether or not the tab exists
			if (!oTab) {
				return;
			}
			oTab.title = sTitle;
			var newTitle = this._getDisplayTitle(sTitle, oTab.dirty);

			var oNavigationItem = this.getItems()[iIndex];
			oNavigationItem.data("dirtyState", oTab.dirty);

			// Direct DOM manipulation if desired and possible
			if (bDontInvalidate && oNavigationItem.getDomRef()) {
				oNavigationItem.setProperty("text", newTitle, true);
				// var a= $(("a#"+oNavigationItem.sId).replace(/[.]/g,"\\."));
				// a.text( newTitle );
				var a = oNavigationItem.getDomRef().getElementsByTagName("a")[0];
				// special handling for firefox browsers
				if (a.textContent) {
					a.textContent = newTitle;
				} else {
					a.innerText = newTitle;
				}
			} else {
				oNavigationItem.setText(newTitle);
			}

			// Set tooltip
			if (sTooltip != undefined) {
				oNavigationItem.setTooltip(sTooltip);
				oTab.tooltip = sTooltip;
			}
		},

		_getDisplayTitle : function(sTitle, hasDirtyState) {
			if (sTitle.indexOf("*") == -1 && hasDirtyState) {
				sTitle = '*' + sTitle;
			}
			if (!hasDirtyState) {
				sTitle = sTitle.replace("*", "");
			}
			return sTitle;
		},

		setSelectedItem : function(oItem) {
			sap.ui.ux3.NavigationBar.prototype.setSelectedItem.call(this, oItem);
			this._handleSelectionStyle(oItem.getDomRef());
		},

		/**
		 *
		 * Overrides method _updateSelection of standard ux3 navigation bar:
		 * Some minor coding changes and section omitted.
		 *
		 * Select tab and scroll to it.
		 * Visually adapts the NavigationBar to the new selection, using animations instead of re-rendering.
		 *
		 * @param sItemId Id of selected tab
		 * @private
		 */
		_updateSelection : function(sItemId) {
			this._menuInvalid = true;

			// update the css classes to make the selected item larger etc.
			// var $newSel = jQuery.sap.byId(sItemId); (line replaced)
			var $newSel = $(("a#" + sItemId).replace(/[.]/g, "\\."));
			$newSel.attr("tabindex", "0").attr("aria-checked", "true");
			$newSel.parent().addClass("sapUiUx3NavBarItemSel");
			$newSel.parent().parent().children().each(function() {
				//	var a = this.firstChild; (line replaced)
				var a = $(this).children("a");
				if (a) {
					a = a[0];
				} // (line added)
				if (a && (a.id != sItemId) && (a.className.indexOf("Dummy") == -1)) {
					jQuery(a).attr("tabindex", "-1");
					jQuery(a).parent().removeClass("sapUiUx3NavBarItemSel");
					jQuery(a).attr("aria-checked", "false");
				}
			});

			// let the ItemNavigation know about the new selection
			var iSelectedDomIndex = $newSel.parent().index();
			if (iSelectedDomIndex > 0) {
				iSelectedDomIndex--; // if a selected element is found, its index in the ItemNavigation is the DOM index minus the dummy element, which is the first sibling
			}
			this._oItemNavigation.setSelectedIndex(iSelectedDomIndex);

			// (Section to handle arrow omitted)
			this._scrollItemIntoView($newSel[0]); // (line added)
		},

		/**
		 * Overrides method _showOverflowMenu of standard ux3 navigation bar:
		 * Dock position of pop up changed.
		 *
		 * Shows the menu items that do not fit into the navigation bar. Or in the case of overflow being
		 * set to MenuAndButtons: All items (since we cannot know what is currently scrolled into view).
		 */
		_showOverflowMenu : function() {
			var oMenu = this._getOverflowMenu();
			var oTarget = this.$("ofl").get(0);

			oMenu.open(true, // First item highlighted. Check whether this is the correct behavior
			oTarget, sap.ui.core.Popup.Dock.EndTop, sap.ui.core.Popup.Dock.RightBottom, // (line changed)
			oTarget);
		},

		/**
		 * Attach CSS class to tab just selected and remove styling from the one selected previously.
		 * Styling is done on the <li> tab.
		 * @param oTabToBeSelected Dom reference to <li> tag representing tab to be selected now
		 */
		_handleSelectionStyle : function(oTabToBeSelected) {
			// Ensure tab has been selected
			if (!oTabToBeSelected) {
				return;
			}
			if (oTabToBeSelected.tagName != "LI") {
				return;
			}

			// Add/remove CSS class from tabs
			var oTabSelected = $(("li#" + this._sIdTabSelected).replace("/[.]/g", "\\."));
			if (oTabSelected && $(oTabToBeSelected) !== oTabSelected) {
				oTabSelected.removeClass("sapUiUx3NavBarItemSel");
			}
			$(oTabToBeSelected).addClass("sapUiUx3NavBarItemSel");
			this._sIdTabSelected = $(oTabToBeSelected).attr("id"); // Remember id of selected tab
		},

		_getOverflowMenu : function() {
			var m = this.getAggregation('overflowMenu');
			if (!m || this._menuInvalid) {
				if (m) {
					m.destroyAggregation('items', true);
				} else {
					m = new sap.ui.commons.Menu();
					m.addStyleClass("sapWattNavigationMenu");
				}
				var I = this._getCurrentItems();
				var t = this;
				var s = this.getSelectedItem();
				for (var i = 0; i < I.length; ++i) {
					var n = I[i];
					var sId = s == n.getId() ? '-selected' : '';
					var M = new sap.ui.commons.MenuItem(n.getId() + '-overflowItem' + sId, {
						text : n.getText(),
						tooltip : n.getTooltip(),
						visible : n.getVisible(),
						icon : s == n.getId() ? 'sap-icon://accept' : null,
						select : (function(n) {
							return function(e) {
								t._handleActivation({
									target : {
										id : n.getId()
									},
									preventDefault : function() {
									}
								});
							};
						})(n)
					});
					m.addAggregation('items', M, true);
				}
				this.setAggregation('overflowMenu', m, true);
				this._menuInvalid = false;
			}
			return m;
		},

		/**
		 * Adjustments appearance after rendering:
		 * Scroll selected tab into visible area and highlight its text
		 * if a new tab has been created or in case there's an overflow situation.
		 */
		onAfterRendering : function() {
			sap.ui.ux3.NavigationBar.prototype.onAfterRendering.call(this);

			var overflowButton = $("#sapUiUx3NavBarOverflowBtn");
			var isOverflowSituation = (overflowButton.css('display') === 'none') ? false : true;
			if (this._newTabCreated || isOverflowSituation) {
				this._updateSelection(this.getSelectedItem());
				this._newTabCreated = false;
			}
		},

		renderer : function(r, c) {

			if (!c.getVisible()) {
				return;
			}
			var a = r;
			var i = c.getId();

			a.addClass('sapUiUx3NavBar');
			if (c.getToplevelVariant()) {
				a.addClass('sapUiUx3NavBarToplevel');
			}
			a.write('<nav');
			a.writeControlData(c);
			a.writeClasses();
			a.write(" role='navigation'><ul id='" + i + "-list' role='menubar' class='sapUiUx3NavBarList'>");
			c._renderItems(a, c);
			a.write('</ul>');
			a.write("<a id='" + i + "-ofb' tabindex='-1' role='presentation' class='sapUiUx3NavBarBack' >");

			a.writeIcon('sap-icon://slim-arrow-left', [], {
				id : i + '-ofb'
			});
			a.write('</a>');

			a.write("<a id='" + i + "-off' tabindex='-1' role='presentation' class='sapUiUx3NavBarForward' >");
			a.writeIcon('sap-icon://slim-arrow-right', [], {
				id : i + '-off'
			});
			a.write('</a>');
			a.write("<a id='" + i + "-ofl' tabindex='-1' role='presentation' class='sapUiUx3NavBarOverflowBtn' >");
			a.writeIcon('sap-icon://menu2', [], {
				id : i + '-oflt'
			});
			a.write('</a>');
			a.write('</nav>');

		},

		_renderItems : function(r, c) {
			var I = c.getItems();
			var n = false;
			if (!I || I.length == 0) {
				I = c.getAssociatedItems();
				n = true;
			}
			var N = I.length;
			r.write("<li><a id='" + c.getId() + "-dummyItem' class='sapUiUx3NavBarDummyItem sapUiUx3NavBarItem' >&nbsp;</a></li>");
			var s = c.getSelectedItem();
			for (var i = 0; i < N; i++) {
				var a = n ? sap.ui.getCore().byId(I[i]) : I[i];
				if (a.getVisible()) {
					var b = a.getId();
					var d = b == s;

					var t = a.getTooltip_AsString();


					r.write("<li id='" + a.getId() + "' onmousedown='return false'"); // prevent drag & drop
					r.addClass("webidetabcontextMenu");
					if (d) {
						r.addClass("sapUiUx3NavBarItemSel");
					}
					if (a.data("dirtyState")) {
						r.addClass("wattTabDirty");
					}
					r.writeClasses();
					var u = a.getHref() || 'javascript:void(0);';
					r.write('>');
					r.write("<button id='" + a.getId() + "-close'  type=\"button\" tabindex= \"-1\" class=\"sapUiTabClose\" title=\"" + "Close"
							+ "\"></button>");
					r.write("<div class ="+a.getIcon()+"></div>");
					r.write('<a ');
					r.writeElementData(a);
					r.write("href='" + u + "' aria-setsize='" + N + "' aria-posinset='" + (i + 1)
							+ "' role='menuitemradio' class='sapUiUx3NavBarItem'");
					if (d) {
						r.write(" tabindex='0'");
					}
					r.write(" aria-checked='" + (d ? 'true' : 'false') + "'");
					if (t) {
						r.write(" title='" + jQuery.sap.escapeHTML(t) + "'");
					}
					r.write('>');

					r.write(jQuery.sap.escapeHTML(a.getText()));
					r.write('</a></li>');
				}
			}
			var e;
			if (c._bRtl) {
				e = 'right:' + c._iLastArrowPos;
			} else {
				e = 'left:' + c._iLastArrowPos;
			}
			r.write("<span id='" + c.getId() + "-arrow' style='" + e + 'px;');
			r.write('display:none;');
			r.write("' class='sapUiUx3NavBarArrow'></span>");
		},

		//--------------------

		/**
		 * getter for the index of the current selected tab
		 * @returns the index of the current selected tab, index of a tab is the order in which the tab was added starting from 0
		 */
		getSelectedIndex : function() {
			return this.iSelectedItemIndex;
		},

		getRightClickedTabIndex : function() {
			if (this._oContextTab) {
				for (var i = 0; i < this.aTabs.length; i++) {
					if (this.aTabs[i].sTabId == this._oContextTab.sId) {
						return i;
					}
				}
			}
		},

		getSelectedTabId : function() {
			//check if right click was triggered, then we return the tab on which the right click happened.
			if (this._oContextTab) {
				return this._oContextTab.sId;
			}
			return this.iSelectedItemId;
		},

		/**
		 * getter for the index of all tabs
		 * @returns the index of the current selected tab, index of a tab is the order in which the tab was added starting from 0
		 */
		getAllTabIndexes : function() {
			return Object.keys(this.aTabs);
		},

		/**
		 * create a new tab and add it to the tabStrip
		 * @param oTabSettings the tab data: (title, tooltip, dirtyState)
		 * @param bSelect optional parameter if true display and select the created tab if false the tab won't be displayed, default to false
		 * @returns the index of the newly created tab
		 */
		createTab : function(oTabSettings, bSelect) {

			if (oTabSettings.dirty == undefined) {
				oTabSettings.dirty = false;
			}

			// Keep track of tabs created so far
			if (!this._iNoTabsCreatedSoFar) {
				this._iNoTabsCreatedSoFar = 0;
			}

			// Determine index to create tab at
			var iNewTabIndex = this.aTabs.length;
			if (this._isAnyTabSelected()) {
				iNewTabIndex = this.iSelectedItemIndex + 1;
			}

			// Keep tab settings in aTabs array
			if (!this._isAnyTabSelected() || this.iSelectedItemIndex == this.getItems().length - 1) // last tab has been activated
			{
				this.aTabs.push(oTabSettings);
			} else {
				this.aTabs.splice(this.iSelectedItemIndex + 1, 0, oTabSettings);
			}

			// Create and initialize the underlying navigation item
			//var sId = this._createTabID(oTabSettings);

			sap.ui.ux3.NavigationItem.extend("editorTab",{
				metadata : {
					properties : {
						icon:{type:"string"}
					}
				}
			});

			var oTab = new editorTab();
            
            var sId = oTab.getId();
            
			oTabSettings["sTabId"] = sId;

			oTab.setKey("item" + (this._iNoTabsCreatedSoFar + 1));
			oTab.setText(oTabSettings.title);
			oTab.setTooltip(oTabSettings.tooltip);
			oTab.data("fullQualifiedName", oTabSettings.fullQualifiedName);

			// Put it into the items aggregation
			if (!this._isAnyTabSelected() || this.iSelectedItemIndex == this.getItems().length - 1) {
				this.addAggregation("items", oTab, true);
			} else {
				this.addAggregation("items", oTab, true);
				var items = this.getItems();
				items.splice(this.iSelectedItemIndex + 1, 0, oTab);
				items.splice(items.length - 1, 1);
				this.mAggregations["items"] = items;
			}

			this.setTitle(iNewTabIndex, oTabSettings.title, oTabSettings.tooltip);

			/*if (bSelect) {
				this.selectTab(iNewTabIndex);
			}*/

			this._newTabCreated = true;
			this._iNoTabsCreatedSoFar++;
			this.invalidate();

			return iNewTabIndex;
		},

		/**
		 *	Returns if any tab has been selected.
		 *	@returns true or false
		 */
		_isAnyTabSelected : function() {
			return (typeof this.iSelectedItemIndex === "number" && this.iSelectedItemIndex >= 0);
		},

		/*_createTabID : function(oTabSettings) {
			//Valid ids in UI5: /^([A-Za-z_][-A-Za-z0-9_.:]*)$/
			//Filenames might have additional characters, e.g. @
			//--- Replace slashes by underscores
			var sTabId_FileNamePart = oTabSettings.fullQualifiedName.replace(/\//g, "_");
			//--- Do an URI-Encoding, e.g. for @
			var sTabId_TabNamePart = encodeURIComponent(oTabSettings.editorClass + "_" + sTabId_FileNamePart);
			//--- Replace % from URI-Encoding with "E", % is not supported in ids in UI5
			sTabId_TabNamePart = sTabId_TabNamePart.replace(/%/g, "E");
			//--- build id and create tab
			var sBaseId = "tab_" + sTabId_TabNamePart;
			var sTabId = sBaseId;
			
			// when renaming files, the previous tab doesn't get a new ID, which could lead do duplicate IDs when
			// creating a file with the name of the previous (renamed) file
			var index = 2;
			while (sap.ui.getCore().byId(sTabId)){
				sTabId = sBaseId + "_" + (index++);
			}
			return sTabId;
			
			var sTabId = "tab_" + this._iTabID++;
			return sTabId;
			
		},*/

		/**
		 * returns the title of a given tab
		 * @param iIndex index of the tab
		 * @returns the title
		 */
		getTabTitle : function(iIndex) {
			var aTab = this.aTabs[iIndex];
			return aTab ? aTab.title : undefined;
		},

		getTabTitleById : function(sTabId) {
			var oTab = this.getTabById(sTabId);
			return oTab ? oTab.title : undefined;
		},

		getTabById : function(sTabId){
			var oTab = null;
			for (var i = 0 ; i < this.aTabs.length; i++ ){
				oTab = this.aTabs[i];
				if (oTab.sTabId === sTabId){
					return oTab;
				}
			}
			return null;
		},

		getTabIndexById : function(sTabId){
			var oTab = null;
			for (var i = 0 ; i < this.aTabs.length; i++ ){
				oTab = this.aTabs[i];
				if (oTab.sTabId === sTabId){
					break;
				}
			}
			return i;
		},

		getTabIdByIndex : function(iIndex){
			var oTab = this.aTabs[iIndex];
			return oTab ? oTab.sTabId : null;
		},


		/**
		 * event handler for the aggregation navigationBar's select event, this event is fired when an element from the overflow menu is selected
		 * @param e the event object contains the navigationBar's selected item as parameter : "item"
		 */
		onTabSelect : function(e) {
			var item = e.getParameter("item");
			var index = this.indexOfItem(item);
			this.selectTab(index, true);
		},

		onTabContextMenu : function(event) {
			event.preventDefault();
			var element = event.target;
			while (element && !element.attributes["id"]) {
				element = element.parentElement;
			}
			var index = this._getItemIndex(element);//webidetabcontextMenu
			if (element && element.attributes["id"] && (element.nodeName === "LI" || element.parentElement.classList.contains("webidetabcontextMenu") )) {
				var sId = element.attributes["id"].value;
				var oTab = sap.ui.getCore().byId(sId);
				this._oContextTab = oTab;
				this.fireTabContextMenu({
					mouseEvent : event,
					tab : oTab,
					index : index,
					clickedElement : element
				});
			}
		},

		onTabDblClick : function(event) {
			var clickedElement = event.target;
			var index = this._getItemIndex(clickedElement);
			while (clickedElement && !clickedElement.attributes["id"]) {
				clickedElement = clickedElement.parentElement;
			}
			if (clickedElement && clickedElement.attributes["id"]
					&& (clickedElement.nodeName === "LI" || clickedElement.parentElement.classList.contains("webidetabcontextMenu"))) {
				var oTab = sap.ui.getCore().byId(clickedElement.attributes["id"].value);

				this.fireTabDoubleClicked({
					tab : oTab,
					index : index,
					clickedElement : clickedElement
				});
			}
		}
	});
})();