/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.components.factsheet.controls.PictureViewer.
jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureViewer");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.TileContainer");


/**
 * Constructor for a new components/factsheet/controls/PictureViewer.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getTileScaling tileScaling} : float (default: 0.95)</li>
 * <li>{@link #getRemovable removable} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getItems items} <strong>(default aggregation)</strong> : sap.ushell.components.factsheet.controls.PictureViewerItem[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ushell.components.factsheet.controls.PictureViewer#event:pictureDeleted pictureDeleted} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.TileContainer#constructor sap.m.TileContainer}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Picture viewer control relying on the TileContainer control
 * @extends sap.m.TileContainer
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @deprecated Since version 1.22. 
 * PictureViewer was replacing the Carousel as it wasn't supporting some versions of MS Internet Explorer.
 * Now, the sap.m.Carousel is fully functional, please use sap.m.Carousel instead.
 * This control will not be supported anymore.
 * @name sap.ushell.components.factsheet.controls.PictureViewer
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.TileContainer.extend("sap.ushell.components.factsheet.controls.PictureViewer", { metadata : {

	deprecated : true,
	library : "sap.ushell",
	properties : {
		"tileScaling" : {type : "float", group : "Misc", defaultValue : 0.95},
		"removable" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	defaultAggregation : "items",
	aggregations : {
		"items" : {type : "sap.ushell.components.factsheet.controls.PictureViewerItem", multiple : true, singularName : "item"}
	},
	events : {
		"pictureDeleted" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.components.factsheet.controls.PictureViewer with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ushell.components.factsheet.controls.PictureViewer.extend
 * @function
 */

sap.ushell.components.factsheet.controls.PictureViewer.M_EVENTS = {'pictureDeleted':'pictureDeleted'};


/**
 * Getter for property <code>tileScaling</code>.
 * Percentage of the space occupied by the image in the picture viewer control. Please note that if the factor is too close to 1, the navigation arrows usually displayed in desktop mode will not be available
 *
 * Default value is <code>0.95</code>
 *
 * @return {float} the value of property <code>tileScaling</code>
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#getTileScaling
 * @function
 */

/**
 * Setter for property <code>tileScaling</code>.
 *
 * Default value is <code>0.95</code> 
 *
 * @param {float} fTileScaling  new value for property <code>tileScaling</code>
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#setTileScaling
 * @function
 */


/**
 * Getter for property <code>removable</code>.
 * Defines whether or not you can remove a picture
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>removable</code>
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#getRemovable
 * @function
 */

/**
 * Setter for property <code>removable</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bRemovable  new value for property <code>removable</code>
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#setRemovable
 * @function
 */


/**
 * Getter for aggregation <code>items</code>.<br/>
 * Aggregation of PictureViewerItem that contains either a picture URI or the actual Image control.
 * 
 * <strong>Note</strong>: this is the default aggregation for components/factsheet/controls/PictureViewer.
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem[]}
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#getItems
 * @function
 */


/**
 * Inserts a item into the aggregation named <code>items</code>.
 *
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
 *          oItem the item to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the item should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the item is inserted at 
 *             the last position        
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#insertItem
 * @function
 */

/**
 * Adds some item <code>oItem</code> 
 * to the aggregation named <code>items</code>.
 *
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
 *            oItem the item to add; if empty, nothing is inserted
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#addItem
 * @function
 */

/**
 * Removes an item from the aggregation named <code>items</code>.
 *
 * @param {int | string | sap.ushell.components.factsheet.controls.PictureViewerItem} vItem the item to remove or its index or id
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem} the removed item or null
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#removeItem
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>items</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ushell.components.factsheet.controls.PictureViewerItem[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#removeAllItems
 * @function
 */

/**
 * Checks for the provided <code>sap.ushell.components.factsheet.controls.PictureViewerItem</code> in the aggregation named <code>items</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
 *            oItem the item whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#indexOfItem
 * @function
 */
	

/**
 * Destroys all the items in the aggregation 
 * named <code>items</code>.
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#destroyItems
 * @function
 */


/**
 * Thrown when user delete an image
 *
 * @name sap.ushell.components.factsheet.controls.PictureViewer#pictureDeleted
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'pictureDeleted' event of this <code>sap.ushell.components.factsheet.controls.PictureViewer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.components.factsheet.controls.PictureViewer</code>.<br/> itself. 
 *  
 * Thrown when user delete an image
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.components.factsheet.controls.PictureViewer</code>.<br/> itself.
 *
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#attachPictureDeleted
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'pictureDeleted' event of this <code>sap.ushell.components.factsheet.controls.PictureViewer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#detachPictureDeleted
 * @function
 */

/**
 * Fire event pictureDeleted to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.components.factsheet.controls.PictureViewer#firePictureDeleted
 * @function
 */

// Start of sap/ushell/components/factsheet/controls/PictureViewer.js
jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureViewer");
jQuery.sap.require("sap.ui.core.ResizeHandler");
jQuery.sap.require("sap.m.TileContainer");

sap.ushell.components.factsheet.controls.PictureViewer.prototype.init = function () {

    sap.m.TileContainer.prototype.init.apply(this);
    this.setEditable(false);

    if (sap.ui.getCore().isMobile()) {
        jQuery(window).bind("tap", jQuery.proxy(this._reset, this));
        var oStaticArea = sap.ui.getCore().getStaticAreaRef();
        this.$blocker = jQuery("<div class='sapCaPVBly sapUiBLy'></div>").css("visibility", "hidden");
        jQuery(oStaticArea).append(this.$blocker);
    }
    if (!sap.ui.getCore().isMobile()) {
        jQuery(window).bind("resize", jQuery.proxy(this._resize, this));
    }

    this.addStyleClass("sapCaPW");
    
    // onBeforeRendering() is not called the first time
    this.addStyleClass("sapCaPWRendering");


};

/**
 * Handles the resize event for the tile container.
 * This is called whenever the orientation of browser size changes.
 * @private
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype._resize = function() {
    if (this._oDragSession) {
        return;
    }

    setTimeout(jQuery.proxy(function() {
        this._applyDimension();
        this._update(false);
        delete this._iInitialResizeTimeout;
    },this),
        this._iInitialResizeTimeout);

    this._iInitialResizeTimeout = 0; //now we do not need to wait
};

sap.ushell.components.factsheet.controls.PictureViewer.prototype.exit = function () {

    this.$blocker.remove();

    if (!sap.ui.getCore().isMobile()) {
        jQuery(window).unbind("resize", jQuery.proxy(this._resize, this));
    }

    sap.m.TileContainer.prototype.exit.apply(this);

	if (!sap.ui.Device.system.desktop){
		jQuery(window).unbind("tap", jQuery.proxy(this._reset, this));	
	}
};

/**
 * Set the percentage of the space occupied by the image in the picture viewer control.
 * Please note that if the factor is too close to 1, the navigation arrows usually displayed in desktop mode will not be available
 * @override
 * @public
 * @param fTileScale
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.setTileScaling = function (fTileScale) {
    if (fTileScale < 0 || fTileScale > 1) {
        fTileScale = 0.75;
        jQuery.sap.log.error("Tile Scaling should be a float value between 0 and 1 and not " + fTileScale
            + ". Setting it to 0.75 by default.");
    }
    this.setProperty('tileScaling', fTileScale);
};

/**
 * Adds some item <code>oItem</code>
 * to the aggregation named <code>items</code>.
 *
 * @override
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
    *            oItem the item to add; if empty, nothing is inserted
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#addItem
 * @function
 *
 * @deprecated Use aggregation "tiles"
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.addItem = function (oItem) {
    this.insertItem(oItem, this.getItems().length);
};

/**
 * Inserts a item into the aggregation named <code>items</code>.
 * When adding a new item to the aggregation, a sap.ca.ui.PictureTile is actually created
 * with its own ID and added to the internal TileContainer.
 *
 * @override
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
    *          oItem the item to insert; if empty, nothing is inserted
 * @param {int}
    *             iIndex the <code>0</code>-based index the item should be inserted at; for
 *             a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
 *             greater than the current size of the aggregation, the item is inserted at
 *             the last position
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#insertItem
 * @function
 *
 * @deprecated Use aggregation "tiles"
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.insertItem = function (oItem, iIndex) {

    var tileToAdd = new sap.ushell.components.factsheet.controls.PictureTile({
        tileContent:oItem
    });
    tileToAdd.attachPictureDelete(jQuery.proxy(this._deletePictureRequestHandler, this));

    this.insertTile(tileToAdd, iIndex);
    this.insertAggregation("items", oItem, iIndex);

    return this;
};



sap.ushell.components.factsheet.controls.PictureViewer.prototype.insertTile = function (oTile, iIndex) {

	oTile.attachPictureDelete(jQuery.proxy(this._deletePictureRequestHandler, this));
	sap.m.TileContainer.prototype.insertTile.apply(this, arguments);
};


sap.ushell.components.factsheet.controls.PictureViewer.prototype.deleteTile = function (oTile) {
	sap.m.TileContainer.prototype.deleteTile.apply(this, arguments);
	
	oTile.destroy();
};


/**
 * Removes the picture at index <code>iIndex</code> from the <code>items</code> aggregation.
 *
 * @override
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
    *          iIndex the index of the picture to delete; if empty, the current picture is deleted
 * @param {int}
    *             iIndex the <code>0</code>-based index of the picture collection to delete;
 *             if <code>iIndex</code> is out of range or empty, the current image will be deleted.
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#deletePicture
 * @function
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.deletePicture = function (iIndex) {

    var pictureTileIndexToDelete, pictureTileToDelete, numberOfPictures;
    numberOfPictures = this.getTiles().length;

    if (typeof iIndex != "number" || iIndex < 0 || iIndex >= numberOfPictures) {
        pictureTileIndexToDelete = this.getPageFirstTileIndex();
    } else {
        pictureTileIndexToDelete = iIndex;
    }

    if (pictureTileIndexToDelete > -1) {
        pictureTileToDelete = this.getTiles()[pictureTileIndexToDelete];
        pictureTileToDelete.detachPictureDelete(jQuery.proxy(this._deletePictureRequestHandler, this));
        this.deleteTile(pictureTileToDelete);
        this.removeAggregation("items", pictureTileIndexToDelete, true);
    } else {
        jQuery.sap.log.warning("Cannot find and delete a picture at index : " + iIndex);
    }

    return this;
};

/**
 * Select the picture at index <code>iIndex</code> from the <code>items</code> aggregation.
 *
 * @override
 * @param {sap.ushell.components.factsheet.controls.PictureViewerItem}
    *          iIndex the index of the picture to select; if empty, the first picture is selected
 * @param {int}
    *             iIndex the <code>0</code>-based index of the aggregation to select; for
 *             a negative value of <code>iIndex</code>, the picture at position 0 is selected; for a value
 *             greater than the current size of the aggregation, the selected picture at the last position is selected
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#selectPicture
 * @function
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.selectPicture = function (iIndex) {

    var numberOfPictures = this.getTiles().length;

    if (typeof iIndex != "number") {
        iIndex = 0;
    } else if (iIndex < 0) {
        iIndex = 0;
    } else if (iIndex >= numberOfPictures) {
        iIndex = numberOfPictures - 1;
    }

    if (this._bRendered) {
        this.addStyleClass("sapCaPWRendering");
    }
    this._selectedIndex = iIndex;
    
    
    return this;
};
sap.ushell.components.factsheet.controls.PictureViewer.prototype.setSelectedIndex = function (iIndex) {
	this.selectPicture(iIndex);
};

/**
 * Gets the current picture index.
 *
 * @override
 * @return {sap.ushell.components.factsheet.controls.PictureViewer} the current picture index
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureViewer#getCurrentPictureIndex
 * @function
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.getCurrentPictureIndex = function () {
    return this.getPageFirstTileIndex();
};

/**
 * Gets the image index from the TileContainer and fires an event
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype._deletePictureRequestHandler = function (oEvent) {

	var pictureTileIndexToDelete = this.indexOfTile(oEvent.getSource());
	
	this.deleteTile(oEvent.getSource());
	
	this.firePictureDeleted({
        index:pictureTileIndexToDelete
    });
	
	
};



/**
 * Get rid of potential visible "delete" button 
 * 
 * Only used on mobile devices
 * 
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype._reset = function (oEvent) {
	var i = this.getCurrentPictureIndex();
	
	var aTiles = this.getTiles();
	if (i > -1 && aTiles && aTiles.length > i){
		var oTile = aTiles[i];
		if (oTile){
			
			var $target = jQuery(oEvent.target);
			var $this = this.$();
			if ($this.length > 0 && $target.length > 0){
				
				
				var $parent = $target.closest(this.$());
				
				if ($parent.length === 0){ // the "tap" was outside the PictureViewer
					oTile.switchVisibility(false);
				}
				
			}
		}
		
	}
};

/**
 * Specify whether or not you can delete a picture.
 * If FALSE the delete button will never be visible. Default value is TRUE
 * @override
 * @public
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.setRemovable = function (bValue) {
	
	this.setProperty("removable",bValue,true);	
	this.toggleStyleClass("sapCaPWEditable",bValue);
	
};

sap.ushell.components.factsheet.controls.PictureViewer.prototype.setEditable = function(bValue){
	// set Editable to false no matter what
	sap.m.TileContainer.prototype.setEditable.call(this, false);	
};


/**
 * Returns the dimension (width and height) of a tile
 * @returns {object} width and height of a tile
 * @private
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype._getTileDimension = function() {

    if (!this._bRendered){
        return;
    }


    var $scroller = jQuery.sap.byId(this.getId() + "-scrl");
    var oTileDim = {
        width  : $scroller.width(),
        height : $scroller.height()
    };
    return oTileDim;
};


sap.ushell.components.factsheet.controls.PictureViewer.prototype.onBeforeRendering = function() {

    this.addStyleClass("sapCaPWRendering");
    
};

/**
 * Handles the internal event onAfterRendering
 * @private
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.onAfterRendering = function() {
	
	var that = this;
	this._bRendered = true;
	//init resizing
	//this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef().parentElement,  jQuery.proxy(this._resize, this));
    

	//init the dimensions to the container scoll area 
	this._applyDimension();
	this.$().toggleClass("sapCaPWEditable",this.getRemovable() === true);
	this._sInitialResizeTimeoutId = setTimeout(function() {			
			that.addStyleClass("sapCaPWRendering");
			that._applyPageStartIndex(that._selectedIndex);
			
			that._update(false);
			
		}, this._iInitialResizeTimeout);
	
	//Set initial focus
	if (sap.ui.Device.system.desktop) {
		var oFocusTile = this.getTiles()[0],
			iTimeout = this._iInitialResizeTimeout;
		if (!!oFocusTile) {
			
			setTimeout(jQuery.proxy(function() {
				this._findTile(oFocusTile.$()).focus();
			},this),iTimeout); 
		}
	}
	
};


/**
 * @override
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype._update = function(bAnimated) {
	
	sap.m.TileContainer.prototype._update.apply(this, arguments);
	
	this.removeStyleClass("sapCaPWRendering");
	if (sap.ui.getCore().isMobile()){
		var that = this;
		var thatBlocker = this.$blocker;
		setTimeout(jQuery.proxy(function() {
			thatBlocker.fadeOut(200, function(){that.css("visibility", "hidden").css("z-index", 0);});	
		},this),250); 
		
	}
	
};


/**
 * Applies the containers dimensions
 * @private
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype._applyDimension = function() {
    var oDim = this._getContainerDimension(),
        sId = this.getId(),
        $this = this.$(),
        oThisPos,
        iOffset = 10,
        iTopOffset = 60,
        $Content = jQuery.sap.byId( sId + "-cnt"),
        contentPos,
        contentOuterHeight,
        pagerHeight = jQuery.sap.byId( sId + "-pager").outerHeight();

    jQuery.sap.byId( sId + "-scrl").css({
        width : oDim.outerwidth + "px",
        height : (oDim.outerheight - pagerHeight) + "px"
    });

    $Content.css({
        height : (oDim.outerheight - pagerHeight) + "px",
        visibility : "visible"
    });

    $this.css("visibility","visible");
    oThisPos = $this.position();

    contentPos  = $Content.position();
    contentOuterHeight = $Content.outerHeight();

    if (jQuery.device.is.phone) {
        iOffset = 2;        
    } else if (sap.ui.Device.system.desktop) {
        iOffset = 0;        
    }

    jQuery.sap.byId( sId + "-blind").css({
        top : (contentPos.top + iOffset) + "px",
        left : (contentPos.left + iOffset) + "px",
        width : ($Content.outerWidth() - iOffset) + "px",
        height : (contentOuterHeight - iOffset) + "px"
    });

    jQuery.sap.byId( sId + "-rightedge").css({
        top : (oThisPos.top + iOffset + iTopOffset) + "px",
        right : iOffset + "px",
        height : (contentOuterHeight - iOffset - iTopOffset) + "px"
    });

    jQuery.sap.byId( sId + "-leftedge").css({
        top : (oThisPos.top + iOffset + iTopOffset) + "px",
        left : (oThisPos.left + iOffset) + "px",
        height : (contentOuterHeight - iOffset - iTopOffset) + "px"
    });
};


/**
 *
 * Adding overlay to hide blinking while switching orientation
 *
 * @private
 */
sap.ushell.components.factsheet.controls.PictureViewer.prototype.showBlockerLayer = function(callback) {

	// get higher z-index
	if (sap.ui.getCore().isMobile()){
		var zindex = 20;
		jQuery(sap.ui.getCore().getStaticAreaRef()).children().each(function(index, value){
			var z = parseInt(jQuery(value).css("z-index"), 10);
			if (!isNaN(z)){
				zindex = Math.max(zindex, z);	
			}		
		});	
		jQuery.sap.log.debug("blocker layer z-index calculated : " + zindex + 1);
	    this.$blocker.css("z-index", zindex + 1).css("visibility", "visible").fadeIn(200, function(){
            if (callback) {
                callback.call();
            }});
	} else {
		if (callback) {
            callback.call();
        }
	}
	

};


