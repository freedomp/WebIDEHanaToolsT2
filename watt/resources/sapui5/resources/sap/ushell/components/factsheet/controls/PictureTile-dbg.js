/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.components.factsheet.controls.PictureTile.
jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureTile");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.CustomTile");


/**
 * Constructor for a new components/factsheet/controls/PictureTile.
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
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '32px')</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '32px')</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getTileContent tileContent} : string | sap.ushell.components.factsheet.controls.PictureViewerItem</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ushell.components.factsheet.controls.PictureTile#event:pictureDelete pictureDelete} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.CustomTile#constructor sap.m.CustomTile}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Tile control embedding an image and allowing custom sizing
 * @extends sap.m.CustomTile
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @deprecated Since version 1.22. 
 * 
 * PictureTile is used in PictureViewer control and is not meant to be consumed outside of PictureViewer usage.
 * PictureViewer was replacing the sap.m.Carousel as it wasn't supporting some versions of MS Internet Explorer.
 * Now, the sap.m.Carousel is fully functional, please use sap.m.Carousel instead. This control will not be supported anymore.
 * @name sap.ushell.components.factsheet.controls.PictureTile
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.CustomTile.extend("sap.ushell.components.factsheet.controls.PictureTile", { metadata : {

	deprecated : true,
	library : "sap.ushell",
	properties : {
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '32px'},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '32px'}
	},
	associations : {
		"tileContent" : {type : "sap.ushell.components.factsheet.controls.PictureViewerItem", multiple : false}
	},
	events : {
		"pictureDelete" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.components.factsheet.controls.PictureTile with name <code>sClassName</code> 
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
 * @name sap.ushell.components.factsheet.controls.PictureTile.extend
 * @function
 */

sap.ushell.components.factsheet.controls.PictureTile.M_EVENTS = {'pictureDelete':'pictureDelete'};


/**
 * Getter for property <code>height</code>.
 * height (in pixels) of the picture viewer control.
 *
 * Default value is <code>32px</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#getHeight
 * @function
 */

/**
 * Setter for property <code>height</code>.
 *
 * Default value is <code>32px</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#setHeight
 * @function
 */


/**
 * Getter for property <code>width</code>.
 * width (in pixels) of the picture viewer control.
 *
 * Default value is <code>32px</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#getWidth
 * @function
 */

/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>32px</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#setWidth
 * @function
 */


/**
 * Reference to one PictureViewerItem coming from the PictureViewer.
 *
 * @return {string} Id of the element which is the current target of the <code>tileContent</code> association, or null
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#getTileContent
 * @function
 */

/**
 * Reference to one PictureViewerItem coming from the PictureViewer.
 *
 * @param {string | sap.ushell.components.factsheet.controls.PictureViewerItem} vTileContent 
 *    Id of an element which becomes the new target of this <code>tileContent</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#setTileContent
 * @function
 */


	
/**
 * Fired when the user deletes a picture
 *
 * @name sap.ushell.components.factsheet.controls.PictureTile#pictureDelete
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'pictureDelete' event of this <code>sap.ushell.components.factsheet.controls.PictureTile</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.components.factsheet.controls.PictureTile</code>.<br/> itself. 
 *  
 * Fired when the user deletes a picture
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.components.factsheet.controls.PictureTile</code>.<br/> itself.
 *
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#attachPictureDelete
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'pictureDelete' event of this <code>sap.ushell.components.factsheet.controls.PictureTile</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#detachPictureDelete
 * @function
 */

/**
 * Fire event pictureDelete to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.components.factsheet.controls.PictureTile#firePictureDelete
 * @function
 */

// Start of sap/ushell/components/factsheet/controls/PictureTile.js

sap.ushell.components.factsheet.controls.PictureTile.prototype.init = function(oTileContent) {
	
	this._oDeletePictureButton = new sap.m.Button({
        icon:"sap-icon://sys-cancel",
        press: jQuery.proxy(this._deletePictureRequestHandler, this),
        type: sap.m.ButtonType.Transparent
    }).addStyleClass("sapCaUiPTDeleteButton");
	
	if (!sap.ui.Device.system.desktop) {
		 this.attachPress(this._tilePressedHandler);
		 this.attachBrowserEvent("swipe", jQuery.proxy(this._tileSwipedHandler, this));
		 this._oDeletePictureButton.addStyleClass("hide");
	}
};

    
/**
 * Reference to one PictureViewerItem coming from the PictureViewer.
 *
 * @override
 * @param {string | sap.ushell.components.factsheet.controls.PictureViewerItem} vTileContent
 *    Id of an element which becomes the new target of this <code>tileContent</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.ushell.components.factsheet.controls.PictureTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.components.factsheet.controls.PictureTile#setTileContent
 * @function
 */
sap.ushell.components.factsheet.controls.PictureTile.prototype.setTileContent = function(oTileContent) {
	this.setContent(null);
	if (oTileContent) {
        var image = oTileContent.getImage();
        
//		if (sap.ui.Device.system.desktop) {
			this.setContent(image);
//		} else {
//			this.setContent(new sap.ca.ui.ZoomableScrollContainer({
//				content : oTileContent.getImage()
//			}));
//		}
		
	} else {
		this.setContent(null);
	}
	this.setAssociation("tileContent", oTileContent);
};



/**
 * Sets the pixel size of the tile 
 * @param {int} iWidth width
 * @param {int} iHeight height
 * @private
 */ 
sap.ushell.components.factsheet.controls.PictureTile.prototype.setSize = function(iWidth,iHeight){

	this._width = iWidth;
	this._height = iHeight;
	
	var $this = this.$();
	if ($this){
		$this.css({width: iWidth + "px", height: iHeight + "px"});
		
		// adding this class later because display: inline-block is causing issue for width/height calculation
		jQuery.sap.byId(this.getId() + "-wrapper").addClass("sapCaUiPTWrapper");
	}
};


sap.ushell.components.factsheet.controls.PictureTile.prototype._tilePressedHandler = function (oEvent) {	
    this.switchVisibility();
};

sap.ushell.components.factsheet.controls.PictureTile.prototype.switchVisibility = function (bVisible) {
	var $delBtn = this._oDeletePictureButton.$();
	if (bVisible === undefined){
		$delBtn.toggleClass("hide");
	} else {
		$delBtn.toggleClass("hide", !bVisible);	
	}
	
	
};

sap.ushell.components.factsheet.controls.PictureTile.prototype._tileSwipedHandler = function (oEvent) {
    var $deleteBtn = this._oDeletePictureButton.$();
    if ($deleteBtn && !$deleteBtn.hasClass("hide")){
		$deleteBtn.addClass("hide");
    }	
};

/**
 * 
 */
sap.ushell.components.factsheet.controls.PictureTile.prototype._deletePictureRequestHandler = function () {

	this.firePictureDelete();
    
};

