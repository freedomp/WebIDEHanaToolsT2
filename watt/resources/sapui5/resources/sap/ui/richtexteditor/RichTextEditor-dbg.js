/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/*global Promise */

// Provides control sap.ui.richtexteditor.RichTextEditor.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/ResizeHandler', './library'],
	function(jQuery, Control, ResizeHandler, library) {
	"use strict";


	
	/**
	 * Constructor for a new RichTextEditor.
	 *
	 * The RichTextEditor uses a third party component, which might in some cases not be
	 * completely compatible with the way UI5's (re-)rendering mechanism works. If you keep hidden
	 * instances of the control (instances which are not visible in the DOM), you might run into
	 * problems with some browser versions. In this case please make sure you destroy the
	 * RichTextEditor instance instead of hiding it and create a new one when you show it again.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The RichTextEditor-Control is used to enter formatted text.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @disclaimer Since version 1.6.0. 
	 * The RichTextEditor of SAPUI5 contains a third party component TinyMCE provided by Moxiecode Systems AB. The SAP license agreement covers the development of applications with RichTextEditor of SAPUI5 (as of May 2014).
	 * @alias sap.ui.richtexteditor.RichTextEditor
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RichTextEditor = Control.extend("sap.ui.richtexteditor.RichTextEditor", /** @lends sap.ui.richtexteditor.RichTextEditor.prototype */ { metadata : {
	
		library : "sap.ui.richtexteditor",
		properties : {
	
			/**
			 * An HTML string representing the editor content. Because this is HTML, the value cannot be generically escaped to prevent cross-site scripting, so the application is responsible for doing so.
			 */
			value : {type : "string", group : "Data", defaultValue : ''},
	
			/**
			 * The text direction
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
	
			/**
			 * Width of RichTextEditor control in CSS units.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * Height of RichTextEditor control in CSS units.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * The editor implementation to use.
			 * Valid values are the ones found under sap.ui.richtexteditor.EditorType and any other editor identifier that may be introduced by other groups (hence this is not an enumeration).
			 * Any attempts to set this property after the first rendering will not have any effect.
			 */
			editorType : {type : "string", group : "Misc", defaultValue : 'TinyMCE'},
	
			/**
			 * Relative or absolute URL where the editor is available. Must be on the same server.
			 * Any attempts to set this property after the first rendering will not have any effect.
			 * @deprecated Since version 1.25.0. 
			 * The editorLocation is set implicitly when choosing the editorType.
			 */
			editorLocation : {type : "string", group : "Misc", defaultValue : 'js/tiny_mce/tiny_mce_src.js', deprecated: true},
	
			/**
			 * Whether the editor content can be modified by the user. When set to "false" there might not be any editor toolbar.
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Whether the toolbar button group containing commands like Bold, Italic, Underline and Strikethrough is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupFontStyle : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Whether the toolbar button group containing text alignment commands is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupTextAlign : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Whether the toolbar button group containing commands like Bullets and Indentation is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupStructure : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Whether the toolbar button group containing commands like Font, Font Size and Colors is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupFont : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Whether the toolbar button group containing commands like Cut, Copy and Paste is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupClipboard : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Whether the toolbar button group containing commands like Insert Image and Insert Smiley is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupInsert : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Whether the toolbar button group containing commands like Create Link and Remove Link is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupLink : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Whether the toolbar button group containing commands like Undo and Redo is available. Changing this after the initial rendering will result in some visible redrawing.
			 */
			showGroupUndo : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Whether the text in the editor is wrapped. This does not affect the editor's value, only the representation in the control.
			 */
			wrapping : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Whether a value is required.
			 */
			required : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Whether to run the HTML sanitizer once the value (HTML markup) is applied or not. To configure allowed URLs please use the whitelist API via jQuery.sap.addUrlWhitelist
			 */
			sanitizeValue : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * An array of plugin configuration objects with the obligatory property "name".
			 * Each object has to contain a property "name" which then contains the plugin name/ID.
			 */
			plugins : {type : "object[]", group : "Behavior", defaultValue : []},
	
			/**
			 * Whether or not to use the legacy theme for the toolbar buttons. If this is set to false, the default theme for the editor will be used (which might change slightly with every update). The legacy theme has the disadvantage that not all functionality has its own icon, so using non default buttons might lead to invisible buttons with the legacy theme - use the default editor theme in this case.
			 */
			useLegacyTheme : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * An array of button configurations. These configurations contain the names of buttons as array in the property "buttons" and the name of the group in "name", they can also contain the "row" where the buttons should be placed, a "priority" and whether the buttons are "visible". See method addButtonGroup() for more details on the structure of the objects in this array.
			 */
			buttonGroups : {type : "object[]", group : "Behavior", defaultValue : []}
		},
		events : {
	
			/**
			 * Event is fired when the text in the field has changed AND the focus leaves the editor or when the Enter key is pressed.
			 */
			change : {
				parameters : {
	
					/**
					 * The new control value.
					 */
					newValue : {type : "string"}
				}
			}, 
	
			/**
			 * Fired when the used editor is loaded and ready (its HTML is also created).
			 */
			ready : {}, 
	
			/**
			 * This event is fired right before the TinyMCE instance is created and can be used to change the settings object that will be given to TinyMCE. The parameter "configuration" is the javascript oject that will be given to TinyMCE upon first instantiation. The configuration parameter contains a map that can be changed in the case of TinyMCE.
			 */
			beforeEditorInit : {}
		}
	}});
	
	
	
	
	/*global tinymce */ // Tells JSLint/SAPUI5 validation we need access to this global variable
	/* eslint-disable strict (Will be adressed when moving to AMD syntax) */
	
	/*
	 * The following code is editor-independent
	 */
	// Counter for creating internal ids
	RichTextEditor._lastId = 0;
	
	
	// Editor type entries for backwards compatibility
	RichTextEditor.EDITORTYPE_TINYMCE = sap.ui.richtexteditor.EditorType.TinyMCE;
	RichTextEditor.EDITORTYPE_TINYMCE4 = sap.ui.richtexteditor.EditorType.TinyMCE4;
	
	RichTextEditor.EDITORLOCATION_TINYMCE = "js/tiny_mce/tiny_mce.js";
	RichTextEditor.EDITORLOCATION_TINYMCE4 = "js/tiny_mce4/tinymce.min.js";
	
	if (sap.ui.getCore().getConfiguration().getDebug()) {
		RichTextEditor.EDITORLOCATION_TINYMCE = "js/tiny_mce/tiny_mce_src.js";
		RichTextEditor.EDITORLOCATION_TINYMCE4 = "js/tiny_mce4/tinymce.js";
	}
	
	
	RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE4 = {
		"en": true, // Default
		"ar": true,
		"ar_SA": true,
		"hy": true,
		"az": true,
		"eu": true,
		"be": true,
		"bn_BD": true,
		"bs": true,
		"bg_BG": true,
		"ca": true,
		"zh_CN": true,
		"zh_TW": true,
		"hr": true,
		"cs": true,
		"da": true,
		"dv": true,
		"nl": true,
		"en_CA": true,
		"en_GB": true,
		"et": true,
		"fo": true,
		"fi": true,
		"fr_FR": true,
		"gd": true,
		"gl": true,
		"ka_GE": true,
		"de": true,
		"de_AT": true,
		"el": true,
		"he_IL": true,
		"hi_IN": true,
		"hu_HU": true,
		"is_IS": true,
		"id": true,
		"it": true,
		"ja": true,
		"kk": true,
		"km_KH": true,
		"ko_KR": true,
		"ku": true,
		"ku_IQ": true,
		"lv": true,
		"lt": true,
		"lb": true,
		"ml": true,
		"ml_IN": true,
		"mn_MN": true,
		"nb_NO": true,
		"fa": true,
		"fa_IR": true,
		"pl": true,
		"pt_BR": true,
		"pt_PT": true,
		"ro": true,
		"ru": true,
		"ru@petr1708": true,
		"sr": true,
		"si_LK": true,
		"sk": true,
		"sl_SI": true,
		"es": true,
		"es_MX": true,
		"sv_SE": true,
		"tg": true,
		"ta": true,
		"ta_IN": true,
		"tt": true,
		"th_TH": true,
		"tr_TR": true,
		"ug": true,
		"uk": true,
		"uk_UA": true,
		"vi": true,
		"vi_VN": true,
		"cy": true
	};

	RichTextEditor.SUPPORTED_LANGUAGES_DEFAULT_REGIONS = {
		"zh": "CN",
		"fr": "FR",
		"bn": "BD",
		"bg": "BG",
		"ka": "GE",
		"he": "IL",
		"hi": "IN",
		"hu": "HU",
		"is": "IS",
		"km": "KH",
		"ko": "KR",
		"ku": "IQ",
		"mn": "MN",
		"nb": "NO",
		"pt": "PT",
		"si": "SI",
		"sv": "SE",
		"th": "TH",
		"tr": "TR"
	};

	/**
	 * Initialization
	 * @private
	 */
	RichTextEditor.prototype.init = function() {
		this._bEditorCreated = false;
		this._sTimerId = null;
		
		this.setButtonGroups([{
			name     : "font-style",
			visible  : true,
			row      : 0,
			priority : 10,
			buttons  : [
				"bold", "italic", "underline", "strikethrough"
			]
		}, {
			// Text Align group
			name     : "text-align",
			visible  : true,
			row      : 0,
			priority : 20,
			buttons  : [
				"justifyleft", "justifycenter", "justifyright", "justifyfull"
			]
		}, {
			name     : "font",
			visible  : false,
			row      : 0,
			priority : 30,
			buttons  : [
				"fontselect", "fontsizeselect", "forecolor", "backcolor"
			]
		}, {
			name     : "clipboard",
			visible  : true,
			row      : 1,
			priority : 10,
			buttons  : [
				"cut", "copy", "paste"
			]
		}, {
			name     : "structure",
			visible  : true,
			row      : 1,
			priority : 20,
			buttons  : [
				"bullist", "numlist", "outdent", "indent"
			]
		}, {
			name     : "e-mail",
			visible  : false,
			row      : 1,
			priority : 30,
			buttons  : []
		}, {
			name     : "undo",
			visible  : false,
			row      : 1,
			priority : 40,
			buttons  : [
				"undo", "redo"
			]
		}, {
			name     : "insert",
			visible  : false,
			row      : 1,
			priority : 50,
			buttons  : [
				"image", "emotions"
			]
		}, {
			name     : "link",
			visible  : false,
			row      : 1,
			priority : 60,
			buttons  : [
				"link", "unlink"
			]
		}]);
		
		this.setPlugins([{
			name : "emotions"
		}, {
			name : "directionality"
		}, {
			name : "inlinepopups"
		}, {
			name : "tabfocus"
		}]);

		this._textAreaId = this.getId() + "-textarea";
		this._iframeId = this._textAreaId + "_ifr";

		// This always calls initTinyMCE since init is called before the editorType can be set
		this._callEditorSpecific("init");
	};
	
	RichTextEditor.prototype.onBeforeRendering = function() {
		this._callEditorSpecific("onBeforeRendering");
	};
	
	RichTextEditor.prototype.onAfterRendering = function() {
		this._callEditorSpecific("onAfterRendering");
	};
	
	/**
	 * After configuration has changed, this method can be used to trigger a complete re-rendering
	 * that also re-initializes the editor instance from scratch. Caution: this is expensive, performance-wise!
	 * @private
	 */
	RichTextEditor.prototype.reinitialize = function() {
		jQuery.sap.clearDelayedCall(this._reinitDelay);
		this._reinitDelay = jQuery.sap.delayedCall(0, this, function() {
			this._callEditorSpecific("reinitialize");
		});
	};
	

	/**
	 * Returns the current editor's instance.
	 * CAUTION: using the native editor introduces a dependency to that editor and breaks the wrapping character of the RichTextEditor control, so it should only be done in justified cases.
	 *
	 * @returns {object} The native editor object (here: The TinyMCE editor instance)
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	RichTextEditor.prototype.getNativeApi = function() {
		return this._callEditorSpecific("getNativeApi");
	};
	
	RichTextEditor.prototype.exit = function() {
		jQuery.sap.clearDelayedCall(this._reinitDelay);
		this._callEditorSpecific("exit");
	};
	
	RichTextEditor.prototype.setValue = function(sValue) {
		
		if ( this.getSanitizeValue() ) {
			jQuery.sap.log.trace("sanitizing HTML content for " + this);
			// images are using the URL whitelist support
			sValue = jQuery.sap._sanitizeHTML(sValue);
		}
		
		if (sValue === this.getValue()){
			return this;
		}
		
		this.setProperty("value", sValue, true);
		sValue = this.getProperty("value");
		var methodName = "setValue" + this.getEditorType();
		if (this[methodName] && typeof this[methodName] === "function") {
			this[methodName].call(this, sValue);
		} else {
			this.reinitialize();
		}
		return this;
	};
	
	RichTextEditor.prototype._callEditorSpecific = function(sPrefix) {
		var methodName = sPrefix + this.getEditorType();
		if (this[methodName] && typeof this[methodName] === "function") {
			return this[methodName].call(this);
		}
	};
	
	// the following setters will work after initial rendering, but can cause a complete re-initialization
	
	RichTextEditor.prototype.setEditable = function(bEditable) {
		this.setProperty("editable", bEditable, true);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setWrapping = function(bWrapping) {
		this.setProperty("wrapping", bWrapping, true);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setRequired = function(bRequired) {
		this.setProperty("required", bRequired, true);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupFontStyle = function(bShowGroupFontStyle) {
		this.setProperty("showGroupFontStyle", bShowGroupFontStyle, true);
		this.setButtonGroupVisibility("font-style", bShowGroupFontStyle);
		this.reinitialize();
		return this;
	};
	
	
	RichTextEditor.prototype.setShowGroupTextAlign = function(bShowGroupTextAlign) {
		this.setProperty("showGroupTextAlign", bShowGroupTextAlign, true);
		this.setButtonGroupVisibility("text-align", bShowGroupTextAlign);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupStructure = function(bShowGroupStructure) {
		this.setProperty("showGroupStructure", bShowGroupStructure, true);
		this.setButtonGroupVisibility("structure", bShowGroupStructure);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupFont = function(bShowGroupFont) {
		this.setProperty("showGroupFont", bShowGroupFont, true);
		this.setButtonGroupVisibility("font", bShowGroupFont);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupClipboard = function(bShowGroupClipboard) {
		this.setProperty("showGroupClipboard", bShowGroupClipboard, true);
		this.setButtonGroupVisibility("clipboard", bShowGroupClipboard);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupInsert = function(bShowGroupInsert) {
		this.setProperty("showGroupInsert", bShowGroupInsert, true);
		this.setButtonGroupVisibility("insert", bShowGroupInsert);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupLink = function(bShowGroupLink) {
		this.setProperty("showGroupLink", bShowGroupLink, true);
		this.setButtonGroupVisibility("link", bShowGroupLink);
		this.reinitialize();
		return this;
	};
	
	RichTextEditor.prototype.setShowGroupUndo = function(bShowGroupUndo) {
		this.setProperty("showGroupUndo", bShowGroupUndo, true);
		this.setButtonGroupVisibility("undo", bShowGroupUndo);
		this.reinitialize();
		return this;
	};
	
	
	/**
	 * Allows to add plugins (that must already be installed on the server) to the
	 * RichtextEditor.
	 * 
	 * @param {map|string} [mPlugin] A map with the property name containing the plugin IDs/name or an object with the property "name".
	 * @public
	 * @returns {object} Control instance (for method chaining)
	 */
	RichTextEditor.prototype.addPlugin = function(mPlugin) {
		if (typeof mPlugin === "string") {
			mPlugin = {
				name : mPlugin
			};
		}
		var aPlugins = this.getProperty("plugins");
		aPlugins.push(mPlugin);
		this.setProperty("plugins", aPlugins);
		this.reinitialize();
		return this;
	};
	
	/**
	 * Removes the plugin with the given name/ID from the list of plugins to load
	 * 
	 * @param {string} [sPluginName] The name/id of the plugin to remove
	 * @returns {object} Control instance (for method chaining)
	 */
	RichTextEditor.prototype.removePlugin = function(sPluginName) {
		var aPlugins = this.getProperty("plugins").slice(0);
		for (var i = 0; i < aPlugins.length; ++i) {
			if (aPlugins[i].name === sPluginName) {
				aPlugins.splice(i, 1);
				--i;
			}
		}
		this.setProperty("plugins", aPlugins);
		
		this.reinitialize();
		return this;
	};
	
	
	/**
	 * Allows to opt out of the legacy theme that is applied to keep the old button look. In case
	 * butons are used that are not in the legacy theme, this can be disabled in order to show
	 * the button correctly.
	 * 
	 * @param {boolean} [bUseLegacyTheme] Whether to use the legacy button theme
	 * @public
	 * @returns {object} Control instance (for method chaining)
	 */
	RichTextEditor.prototype.setUseLegacyTheme = function(bUseLegacyTheme) {
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			jQuery(oDomRef).toggleClass("sapUiRTELegacyTheme", bUseLegacyTheme);
		}
		
		return this.setProperty("useLegacyTheme", bUseLegacyTheme, true);
	};
	
	
	/**
	 * Adds a button group to the editor.
	 * 
	 * @param {map|string} [mGroup] Name/ID of a single button or map containing the group information
	 * @param {string[]}   [mGroup.buttons] Array of name/IDs of the buttons in the group
	 * @param {string}     [mGroup.name] Name/ID of the group.
	 * @param {boolean}    [mGroup.visible=true] (optional) The priority of the button group. Lower priorities are added first.
	 * @param {int}        [mGroup.row=0] (optional) Row number in which the button should be
	 * @param {int}        [mGroup.priority=10] (optional) The priority of the button group. Lower priorities are added first.
	 * @public
	 * @returns {object} Control instance (for method chaining)
	 */
	RichTextEditor.prototype.addButtonGroup = function(mGroup) {
		if (typeof mGroup === "string") {
			mGroup = {
				name : this._createId("buttonGroup"),
				buttons : [ mGroup ]
			};
		}
		
		if (mGroup.visible === undefined) {
			mGroup.visible = true;
		}
		if (mGroup.priority === undefined) {
			mGroup.priority = 10;
		}
		if (mGroup.row === undefined) {
			mGroup.row = 0;
		}
		
		var aButtonGroups = this.getButtonGroups();
		aButtonGroups.push(mGroup);
		this.setButtonGroups(aButtonGroups);
		
		return this;
	};
	
	RichTextEditor.prototype.removeButtonGroup = function(sGroupName) {
		var aGroups = this.getProperty("buttonGroups").slice(0);
		for (var i = 0; i < aGroups.length; ++i) {
			if (aGroups[i].name === sGroupName) {
				aGroups.splice(i, 1);
				--i;
			}
		}
		this.setProperty("buttonGroups", aGroups);
		
		this.reinitialize();
		return this;
	};
	
	/**
	 * Make the button group with the given name (in)visible (if used before initialization of the editor)
	 * 
	 * @param {string} [sGroupName] Name of the group of buttons to be chenged
	 * @param {bool}   [bVisible=false] Whether or not this group should be visible
	 * @private
	 * @returns {object} Control instance (for method chaining)
	 */
	RichTextEditor.prototype.setButtonGroupVisibility = function(sGroupName, bVisible) {
		var aButtonGroups = this.getButtonGroups();
		for (var i = 0, iLen = aButtonGroups.length; i < iLen; ++i) {
			if (aButtonGroups[i].name === sGroupName) {
				aButtonGroups[i].visible = bVisible;
			}
		}
		
		return this;
	};
	
	/**
	 * Internal method to create unique (to the RTE) IDs
	 * 
	 * @param {string} [sPrefix] The string prepended to the unique ID
	 * @returns {string} A unique ID for the editor
	 *
	 * @private
	 */
	RichTextEditor.prototype._createId = function(sPrefix) {
		if (sPrefix === undefined) {
			sPrefix = "_rte";
		}
		
		return sPrefix + (RichTextEditor._lastId++);
	};
	
	// the following functions shall not work after the first rendering
	/**
	 * Switches the editor type and sets the default settings for the editor.
	 * All plugins and button groups should be set after this has been invoked
	 *
	 * @param {string} [sEditorType] Which editor type to be used (currently only TinyMCE 3 and 4)
	 * @returns {object} Control instance (for method chaining)
	 * @public
	 */
	RichTextEditor.prototype.setEditorType = function(sEditorType) {
		if (!this._bEditorCreated) { // only supported before first rendering!
			this._callEditorSpecific("unload");
			
			this.setProperty("editorType", sEditorType);
			
			switch (sEditorType) {
				case sap.ui.richtexteditor.EditorType.TinyMCE:
					this.setEditorLocation(RichTextEditor.EDITORLOCATION_TINYMCE);
					// The plugin "emotions" has been replaced by "emoticons" in v4 mind the "c"
					this.removePlugin("emoticons");
					this.addPlugin("emotions");
					this.addPlugin("inlinepopups");
					this.removeButtonGroup("text-align");
					this.removePlugin("image");
					this.removePlugin("link");
					this.removePlugin("textcolor");
					this.removePlugin("colorpicker");
					this.removePlugin("textpattern");
					this.addButtonGroup({
						// Text Align group
						name     : "text-align",
						visible  : true,
						row      : 0,
						priority : 20,
						buttons  : [
							"justifyleft", "justifycenter", "justifyright", "justifyfull"
						]
					});
					this.removeButtonGroup("insert");
					this.addButtonGroup({
						name     : "insert",
						visible  : false,
						row      : 1,
						priority : 50,
						buttons  : [
							"image", "emotions"
						]
					});
					break;
	
				case sap.ui.richtexteditor.EditorType.TinyMCE4:
					this.setEditorLocation(RichTextEditor.EDITORLOCATION_TINYMCE4);
					// The plugin "emotions" has been replaced by "emoticons" in v 4 mind the "c"
					this.removePlugin("emotions");
					this.addPlugin("emoticons");
					// All popups are now "inline"
					this.removePlugin("inlinepopups");
					this.removeButtonGroup("text-align");
					// TinyMCE4 handles images in plugin
					this.addPlugin("image");
					this.addPlugin("link");
					this.addPlugin("textcolor");
					this.addPlugin("colorpicker");
					this.addPlugin("textpattern");
					this.addButtonGroup({
						// Text Align group
						name     : "text-align",
						visible  : true,
						row      : 0,
						priority : 20,
						buttons  : [
							"alignleft", "aligncenter", "alignright", "alignjustify"
						]
					});
					this.removeButtonGroup("insert");
					this.addButtonGroup({
						name     : "insert",
						visible  : false,
						row      : 1,
						priority : 50,
						buttons  : [
							"image", "emoticons"
						]
					});
					break;
					
					default:
						jQuery.sap.log.error("editorType property set to an unknown editor type");
			}
			
			this._callEditorSpecific("init");
		} else {
			jQuery.sap.log.error(
				"editorType property cannot be set after the RichtextEditor has been rendered"
			);
		}
		
		return this;
	};
	
	RichTextEditor.prototype.setEditorLocation = function(sEditorLocation) {
		if (!this._bEditorCreated) { // only supported before first rendering!
			this.setProperty("editorLocation", sEditorLocation);
		} else {
			jQuery.sap.log.error(
				"editorLocation property cannot be set after the RichtextEditor has been rendered"
			);
		}
		return this;
	};
	
	
	/**
	 * Fires the ready event, but only once per instance. Subsequent calls to this method are ignored
	 *
	 * @private
	 */
	RichTextEditor.prototype.fireReadyOnce = function() {
		if (!this._readyFired) {
			this._readyFired = true;
			return this.fireReady.apply(this, arguments);
		}
		return;
	};
	
	/************************************************************************
	 * What now follows is Editor-dependent code
	 * 
	 * For other editors create suitable versions of these methods 
	 * and attach them to sap.ui.richtexteditor.RichTextEditor.prototype
	 ************************************************************************/
	
	/////////////////////////// Begin editor section "TinyMCE" (All versions) //////////////////////////
	
	/**
	 * Creates the ButtonRow strings for TinyMCE
	 * 
	 * @param {string} [sButtonSeparator] Separator that is used to separate button entries
	 * @param {string} [sGroupSeparator]  Separator that is used to separate groups of button entries
	 * @returns {string[]} An array of strings with TinyMCE specific button format
	 * @private
	 */
	RichTextEditor.prototype._createButtonRowsTinyMCE = function(sButtonSeparator, sGroupSeparator) {
		sButtonSeparator = sButtonSeparator === undefined ? "," : sButtonSeparator;
		sGroupSeparator  = sGroupSeparator  === undefined ? "|" : sGroupSeparator;
		
		var aButtonGroups = this.getButtonGroups();
		var sGroupSep = sButtonSeparator + sGroupSeparator + sButtonSeparator;
		
		var i, iLen, mGroup;
		
		// Order Groups by priority
		var aOrderedGroups = {};
		for (i = 0, iLen = aButtonGroups.length; i < iLen; ++i) {
			mGroup = aButtonGroups[i];
			if (!aOrderedGroups[mGroup.priority]) {
				aOrderedGroups[mGroup.priority] = [];
			}
			if (mGroup.priority === undefined) {
				mGroup.priority = Number.MAX_VALUE;
			}
			
			aOrderedGroups[mGroup.priority].push(mGroup);
		}
		
		// Add Groups in order to the four button rows
		var aButtonRows = [];
		for (var key in aOrderedGroups) {
			for (i = 0, iLen = aOrderedGroups[key].length; i < iLen; ++i) {
				mGroup = aOrderedGroups[key][i];
				var iRow = mGroup.row || 0;
				
				if (!mGroup.visible || !mGroup.buttons || mGroup.buttons.length === 0) {
					// Do not add empty or invisible groups
					continue;
				}
				
				if (!aButtonRows[iRow]) {
					aButtonRows[iRow] = "";
				}
				aButtonRows[iRow] += mGroup.buttons.join(sButtonSeparator) + sGroupSep;
			}
		}
		
		for (i = 0; i < aButtonRows.length; ++i) {
			if (aButtonRows[i] === null) {
				continue;
			} else if (!aButtonRows[i]) {
				aButtonRows.splice(i, 1);
				aButtonRows.push(null);
				continue;
			}
			
			// Remove trailing group separators
			if (aButtonRows[i].substr(-3) === sGroupSep) {
				aButtonRows[i] = aButtonRows[i].substr(0, aButtonRows[i].length - sGroupSep.length);
			}
			if (aButtonRows[i].substr(-1) === sButtonSeparator) {
				aButtonRows[i] = aButtonRows[i].substr(0, aButtonRows[i].length - sButtonSeparator.length);
			}
			// In case the row is empty, remove it
			if (aButtonRows[i].length === 0) {
				aButtonRows.splice(i, 1);
				aButtonRows.push(null);
			}
		}
	
		return aButtonRows;
	};
	
	/**
	 * Creates the ButtonRow strings for TinyMCE
	 * 
	 * @private
	 * @returns {string} Plugin string specificly formatted for TinyMCE
	 */
	RichTextEditor.prototype._createPluginsListTinyMCE = function() {
		var aPlugins = this.getPlugins();
		var aPluginNames = [];
		for (var i = 0, iLen = aPlugins.length; i < iLen; ++i) {
			aPluginNames.push(aPlugins[i].name);
		}
		return aPluginNames.join(",");
	};
	
	
	
	/**
	 * Checks whether TinyMCE has rendered its HTML
	 * 
	 * @private
	 * @returns {bool} Whether TinyMCE is rendered inside the page
	 */
	RichTextEditor.prototype.tinyMCEReady = function() {
		var iframe = jQuery.sap.domById(this._iframeId);
		return !!iframe;
	};
	
	
	/**
	 * TinyMCE-specific value setter that avoids re-rendering
	 * 
	 * @param {string} [sValue] The content for the editor
	 * @returns {void}
	 */
	RichTextEditor.prototype.setValueTinyMCE = function(sValue) {
		if (this._bEditorCreated) { 
			jQuery.sap.byId(this._textAreaId).text(sValue);
			this.setContentTinyMCE();
		} else {
			this.setProperty("value", sValue, true);
			if (this.getDomRef()) {
				jQuery.sap.byId(this._textAreaId).val(sValue);
			}
		}
	};
	
	/**
	 * Event handler being called when the text in the editor has changed
	 * 
	 * @param {tinymce.Editor} [oCurrentInst] The current editor instance (tinymce native API)
	 * @returns {void}
	 * @private
	 */
	RichTextEditor.prototype.onTinyMCEChange = function(oCurrentInst) {
		var oldVal = this.getValue(),
			newVal = oCurrentInst.getContent();
		
		if ((oldVal !== newVal) && !this.bExiting) {
			this.setProperty("value", newVal, true); // suppress rerendering
			this.fireChange({oldValue:oldVal,newValue:newVal});
		}
	};
	
	/**
	 * Called on every keydown
	 * 
	 * @param {jQuery.Event} [oEvent] The keyboard event
	 * @returns {void}
	 * @private
	 */
	RichTextEditor.prototype._tinyMCEKeyboardHandler = function(oEvent) {
		var newIndex;
		var key = oEvent['keyCode'];
		switch (key){
		case jQuery.sap.KeyCodes.TAB: /* 9 */
			if (!this.$focusables.index(jQuery(oEvent.target)) === 0) { // if not on very first element
				var index = this.$focusables.size() - 1; // this element moves the focus into the iframe
				this.$focusables.get(index).focus();
			}
			break;
			
		case jQuery.sap.KeyCodes.ARROW_LEFT:
		case jQuery.sap.KeyCodes.ARROW_UP:
			newIndex = this.$focusables.index(jQuery(oEvent.target)) - 1;
			if (newIndex === 0) { 
				newIndex = this.$focusables.size() - 2;
			}
			this.$focusables.get(newIndex).focus();
			break;
			
		case jQuery.sap.KeyCodes.ARROW_RIGHT:
		case jQuery.sap.KeyCodes.ARROW_DOWN:
			newIndex = this.$focusables.index(jQuery(oEvent.target)) + 1;
			if (newIndex === this.$focusables.size() - 1) {
				newIndex = 1;
			}
			this.$focusables.get(newIndex).focus();
			break;
	
		default:
			// Do not react to other keys
			break;
		}
	};
	
	
	/**
	 * Map languages that are incorrectly assigned or fallback if languages do not work
	 * TODO: Change this when more languages are supported by TinyMCE
	 * 
	 * @returns {string} The language to be used for TinyMCE
	 */
	RichTextEditor.prototype._getLanguageTinyMCE = function() {
		var oLocale = new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLanguage());
		var sLanguage = oLocale.getLanguage();
		var sRegion = oLocale.getRegion();
		
		var mLangFallback = {
			"zh" : "zh-" + (sRegion ? sRegion.toLowerCase() : "cn"),
			"sh" : "sr",
			"hi" : "en" // Hindi is not supported by tinyMCE - fallback to en to show something at least
		};
		sLanguage = mLangFallback[sLanguage] ? mLangFallback[sLanguage] : sLanguage;
		
		return sLanguage;
	};
	//////////////////////////// End editor section "TinyMCE" (All versions) ///////////////////////////
	
	
	
	
	////////////////////////////////// Begin editor section "TinyMCE" //////////////////////////////////
	
	
	/**
	 * Static initialization for usage of TinyMCE
	 * @private
	 */
	RichTextEditor.initTinyMCEStatic = function() {
		RichTextEditor.TinyMCE = {};
		RichTextEditor.TinyMCEInitialized = true;
	};
	
	RichTextEditor.prototype.initTinyMCE = function() {
		sap.ui.getCore().getEventBus().subscribe("sap.ui","__preserveContent", this._tinyMCEPreserveHandler, this);
		sap.ui.getCore().getEventBus().subscribe("sap.ui","__beforePopupClose", this._tinyMCEPreserveHandler, this);
	};
	
	
	/**
	 * Saves the current control data and detaches the editor instance from the DOM element
	 * @private
	 */
	RichTextEditor.prototype.onBeforeRenderingTinyMCE = function() {
		if (window.tinymce) {
			try {
				window.tinymce.execCommand('mceRemoveControl', false, this._textAreaId);
			} catch (ex) {
				// Ignore because editor might not even exist at this time
			}
		}
	};
	
	
	/**
	 * Restores the data and re-attaches the editor instance to the DOM element
	 * @private
	 */
	RichTextEditor.prototype.onAfterRenderingTinyMCE = function() {
		if (!this._bEditorCreated) {
			// first rendering: instantiate the editor
			this.initTinyMCEAfterFirstRendering();
		} else {
			// subsequent re-rendering: 
			// the saved content is restored
			this.setContentTinyMCE();
	
			// re-connect the editor instance to the DOM element 
			if (window.tinymce) {
				window.tinymce.execCommand('mceAddControl', false, this._textAreaId);
			}
	
			this.initWhenTinyMCEReady();
		}
	};
	
	
	/**
	 * Initializes the TinyMCE instance
	 * @private
	 */
	RichTextEditor.prototype.initTinyMCEAfterFirstRendering = function() {
		// make sure static initialization has happened
		if (!RichTextEditor.TinyMCEInitialized) {
			RichTextEditor.initTinyMCEStatic();
		}
		
		// wait until the script is ready, don't start multiple timers for multiple calls
		if (this.sTimerId) {
			jQuery.sap.clearDelayedCall(this.sTimerId);
			this.sTimerId = null;
		}
		if (!window.tinymce) {
			this.sTimerId = jQuery.sap.delayedCall(10, this, this.initTinyMCEAfterFirstRendering); // "10" to avoid busy waiting
			return;
		}
		this._bEditorCreated = true; // do this as soon as we enter the init code with no chance of return
		
		var aButtonRows  = this._createButtonRowsTinyMCE();
		var sPluginsList = this._createPluginsListTinyMCE();
	
		/*eslint-disable camelcase */
		var oConfig = {
			mode : "exact",
			// The following line only covers the editor content, not the UI in general
			directionality : (sap.ui.getCore().getConfiguration().getRTL() ? "rtl" : "ltr"),
			elements : this._textAreaId,
			theme : "advanced",
			language: this._getLanguageTinyMCE(),
			browser_spellcheck: true,
			convert_urls: false,
			plugins : sPluginsList, /* autosave causes problems with missing selection, maybe after rerendering */
			// Theme options
			theme_advanced_buttons1 : aButtonRows[0],
			theme_advanced_buttons2 : aButtonRows[1],
			theme_advanced_buttons3 : aButtonRows[2],
			theme_advanced_buttons4 : aButtonRows[3],
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "none",
			readonly : (this.getEditable() ? 0 : 1),
			nowrap : !this.getWrapping(),
			onchange_callback : function(oCurrentInst) { 
				var sId = oCurrentInst.editorId.substr(0,oCurrentInst.editorId.lastIndexOf("-"));
				var oRTE = sap.ui.getCore().byId(sId);
				if (oRTE) {
					oRTE.onTinyMCEChange(oCurrentInst);
				} else {
					jQuery.sap.log.error("RichtTextEditor change called for unknown instance: " + sId);
				}
			}
		};
		/*eslint-enable camelcase */
		
		this.fireBeforeEditorInit({ configuration : oConfig });
		
		tinymce.init(oConfig);
	
		this.setContentTinyMCE();
		this.initWhenTinyMCEReady();
	};
	
	RichTextEditor.prototype._tinyMCEPreserveHandler = function(sChannelId, sEventId, oData) {
		if ((this.getDomRef() && window.tinymce && jQuery(oData.domNode).find(jQuery.sap.byId(this._textAreaId)).length > 0) || (jQuery.sap.byId(this._textAreaId).length === 0)) {
			var oEditor = this.getNativeApi();
			if (oEditor && oEditor.getContainer()) {
	
				var that = this;
				var fnRemoveControl = function() {
					try {
						/*eslint-disable camelcase */
						window.tinymce.execCommand('mceRemoveControl', false, that._textAreaId, { skip_focus: true });
						/*eslint-enable camelcase */
					} catch (ex) {
						// Ignored. If unloading fails this might lead to multiple instances of TinyMCE 
						// being created, but there is nothing we can do as it depends on the third-
						// party tinymce code. This may happen in certain scenarios in IE < 11 or 
						// Firefox when TinyMCE tries to access properties of the inner iframe's
						// document.
					}
				};
	
				try {
					this.setProperty("value", oEditor.getContent(), true); // required because rerendering newly creates the textarea, where tinymce stored the data
				} catch (ex) {
					// If the application manually hides or removes the editor DOM, FF might fail with 
					// an exception when we try to access the editor content. If this happens the 
					// changes since the last setValue invokaction might be lost.
					jQuery.sap.log.warning("TinyMCE was hidden before value could be read, changes might be lost.");
				}
	
				var oPopupControl = jQuery(oData.domNode).control(0);
				if (oPopupControl && oPopupControl.attachClosed) {
					// In case we can hook into the closed event, remove control only after the content
					// has been hidden
					oPopupControl.attachClosed(fnRemoveControl);
				} else {
					// Remove control directly
					fnRemoveControl();
				}
			}
		}
	};
	
	
	/**
	 * Contains initialization code that only can be run once the TinyMCE editor is fully created (=has rendered its HTML)
	 * @private
	 */
	RichTextEditor.prototype.initWhenTinyMCEReady = function() {
		// try later if editor not yet rendered, don't start multiple timers for multiple calls
		if (this.sTimerId) {
			jQuery.sap.clearDelayedCall(this.sTimerId);
			this.sTimerId = null;
		}
		if (!this.tinyMCEReady()) {
			this.sTimerId = jQuery.sap.delayedCall(10, this, "initWhenTinyMCEReady");
			return;
		}
	
		var inst = this.getNativeApiTinyMCE();
		var $IFrame = jQuery.sap.byId(this._iframeId);
		var $Body = jQuery(inst.getBody());
		var bTriggered;
		
		if (this.getTooltip() && this.getTooltip().length > 0) {
			var sTooltip = jQuery.sap.encodeHTML(this.getTooltip_Text());
			inst.getBody().title = sTooltip;
			$IFrame.attr("title", sTooltip);
		} else {
			// TinyMCE3 creates wrong aria title (containing multiple ACC-help texts)
			var sTitle = 
				inst.getLang("aria.rich_text_area") + " - " + inst.getLang('advanced.help_shortcut');
			$IFrame.attr("title", sTitle);
		}
	
		
		// Make 100% height work in Firefox and IE
		if (sap.ui.Device.browser.firefox) {
			$IFrame.parent().height("100%");
		} 
		if (sap.ui.Device.browser.internet_explorer) {
			$IFrame.height($IFrame.parent().height());
			var oDomRef = this.getDomRef();
			var fnResizeCallback = function() {
				$IFrame.height($IFrame.parent().height());
			};
			if (oDomRef.attachEvent) {
				oDomRef.attachEvent("resize", fnResizeCallback);
			} else if (oDomRef.addEventListener) {
				oDomRef.addEventListener("resize", fnResizeCallback);
			}
		}
		
		// Focus handling of RTE
		var tableId = this._textAreaId + "_tbl";
		var $Editor = jQuery.sap.byId(tableId);
		this.$focusables = $Editor.find(":sapFocusable");
		$Editor.bind('keydown', jQuery.proxy(this, "_tinyMCEKeyboardHandler"));
		
		// set certain tooltips that are not configurable  TODO: must be made translatable
		jQuery.sap.byId(this.getId() + "-textarea_fontselect").attr("title", "Font");
		jQuery.sap.byId(this.getId() + "-textarea_fontsizeselect").attr("title", "Font Size");
		
		// Mae sure focus event is triggered, when body inside the iframe is focused
		$Body.bind('focus', function() {
			if (!bTriggered) {
				bTriggered = true;
				if (sap.ui.Device.browser.internet_explorer) {
					$IFrame.trigger('activate');
				} else {
					$IFrame.trigger('focus');
				}
				$Body.focus();
				bTriggered = false;
			}
		});
		
		this._registerWithPopupTinyMCE();
	
		window.tinymce.execCommand('mceFocus', false, this._textAreaId);
		
		this.fireReady();
	};
	
	
	/**
	 * After configuration has changed, this method can be used to trigger a complete re-rendering
	 * that also re-initializes the editor instance from scratch. Caution: this is expensive, performance-wise!
	 * @private
	 */
	RichTextEditor.prototype.reinitializeTinyMCE = function() {
		if (this._bEditorCreated) {
			this._bEditorCreated = false; // need to re-initialize
			this.rerender();
			
			this.setContentTinyMCE();
		}
	};
	
	RichTextEditor.prototype.unloadTinyMCE = function() {
		if (window.tinymce) {
			try {
				window.tinymce.execCommand('mceRemoveControl', false, this._textAreaId); // also includes "remove" and "destroy"
			} catch (ex) {
				// Ignored. If unloading fails this might lead to a memory leak, but there is nothing
				// we can do as it depends on the third-party tinymce code. This may happen in certain
				// scenarios in IE < 11 or Firefox when TinyMCE tries to access properties of the inner
				// iframe's document.
			}
		}
		sap.ui.getCore().getEventBus().unsubscribe("sap.ui","__preserveContent", this._tinyMCEPreserveHandler);
		sap.ui.getCore().getEventBus().unsubscribe("sap.ui","__beforePopupClose", this._tinyMCEPreserveHandler);
	};
	
	RichTextEditor.prototype.exitTinyMCE = function() {
		this.bExiting = true;
		this.unloadTinyMCE();
	};
	
	RichTextEditor.prototype.getNativeApiTinyMCE = function() {
		var oEditor = null;
		if (window.tinymce && this._textAreaId) {
			oEditor = window.tinymce.getInstanceById(this._textAreaId);
		}
		return oEditor;
	};
	
	RichTextEditor.prototype.setContentTinyMCE = function() {
		var inst = this.getNativeApiTinyMCE(),
			value;
		
		if (inst && inst.getContainer()) {
			value = this.getValue();
			if (value != null) {
				inst.setContent(value);
				
				// if running in readonly mode, update link targets to _blank
				if (!this.getEditable()) {
					jQuery.each(inst.getDoc().getElementsByTagName("a"), function(i, oAnchor) {
						oAnchor.target = "_blank";
					});
				}
			}
		}
	};
	
	
	/**
	 * Publish addFocusableContent event to make the editor iframe and internal iframes of TinyMCE known 
	 * to the popup (if contained in one) for focus handling. Needs to be done asynchronously, as the
	 * data-sap-ui-popup property is set in the onAfterRendering of the popup which occurs after the
	 * onAfterRendering of its content. For more info see sap.ui.core.Popup documentation
	 * 
	 * @private
	 */
	RichTextEditor.prototype._registerWithPopupTinyMCE = function() {
		var oEditor = this.getNativeApi();
		var oBus = oBus = sap.ui.getCore().getEventBus();
		var $Pop = this.$().closest("[data-sap-ui-popup]");
	
		setTimeout(function() {
			if ($Pop.length === 1) {
				var sEventId = "sap.ui.core.Popup.addFocusableContent-" + $Pop.attr("data-sap-ui-popup");
				var oObject = { id: this._iframeId };
				oBus.publish("sap.ui", sEventId, oObject);
	
				oEditor.windowManager.onOpen.add(function(oTiny, oFrame, oPopup){
					if (oPopup) {
						oObject = { id: oPopup.mce_window_id + "_ifr" };
						oBus.publish("sap.ui", sEventId, oObject);
					}
				});
			}
		}, 0);
	};
	
	/////////////////////////////////// End editor section "TinyMCE" ///////////////////////////////////
	
	
	////////////////////////////////// Begin editor section "TinyMCE4" /////////////////////////////////
	
	
	/**
	 * Called when the editor type is set to TinyMCE4
	 * 
	 * @private
	 */
	RichTextEditor.prototype.initTinyMCE4 = function() {
		sap.ui.getCore().getEventBus().subscribe("sap.ui","__preserveContent", this._tinyMCEPreserveHandler, this);
		sap.ui.getCore().getEventBus().subscribe("sap.ui","__beforePopupClose", this._tinyMCEPreserveHandler, this);
		this._initWhenLoadedTinyMCE4();
	};
	
	/**
	 * Called when the editor type is set from TinyMCE4 to something else or the control is destroyed
	 * 
	 * @private
	 */
	RichTextEditor.prototype.exitTinyMCE4 = function() {
		this.unloadTinyMCE4();
		var oEditor = this.getNativeApiTinyMCE4();
		if (oEditor) {
			oEditor.destroy();
		}
	};
	
	
	/**
	 * Called when the editor is unloaded (for example when the editor type is changed)
	 * 
	 * @private
	 */
	RichTextEditor.prototype.unloadTinyMCE4 = function() {
		this._bUnloading = true;
		var oEditor = this.getNativeApiTinyMCE4();
		if (oEditor) {
			oEditor.remove();
		}
		sap.ui.getCore().getEventBus().unsubscribe("sap.ui","__preserveContent", this._tinyMCEPreserveHandler);
		sap.ui.getCore().getEventBus().unsubscribe("sap.ui","__beforePopupClose", this._tinyMCEPreserveHandler);
		ResizeHandler.deregister(this._resizeHandlerId);
		this._resizeHandlerId = null;
	};
	
	
	/**
	 * @private
	 */
	RichTextEditor.prototype.onBeforeRenderingTinyMCE4 = function() {
		// Nothing to do...
	};
	
	
	/**
	 * @private
	 */
	RichTextEditor.prototype.onAfterRenderingTinyMCE4 = function() {
		this._lastRestHeight = 0;
		this.reinitializeTinyMCE4();
	};
	
	
	/**
	 * TinyMCE4 specific reinitialize method
	 * The TinyMCE instance is destroyed and recreated with new configuration values.
	 * 
	 * @private
	 */
	RichTextEditor.prototype.reinitializeTinyMCE4 = function() {
		this._tinyMce4Initialized().then(function() {
			var oEditor = this.getNativeApiTinyMCE4();
			if (oEditor) {
				var oEditorIFrame = document.querySelector("#" + this._iframeId);
				if (oEditorIFrame) {
					/*eslint-disable camelcase */
					window.tinymce.execCommand('mceRemoveControl', false, this._textAreaId, { skip_focus: true }); // also includes "remove" and "destroy"		
					/*eslint-enable camelcase */
				}
				
				oEditor.destroy();
			}
			this._initWhenLoadedTinyMCE4();
		}.bind(this));
	};
	
	
	/**
	 * TinyMCE4 specific getNativeApi method
	 * Returns the editor instance for this control instance if available
	 * 
	 * @private
	 * @returns {object} The TinyMCE4 editor instance
	 */
	RichTextEditor.prototype.getNativeApiTinyMCE4 = function() {
		if (window.tinymce) {
			return window.tinymce.EditorManager.get(this._textAreaId);
		}
		return null;
	};
	
	
	/**
	 * TinyMCE4 specific setValue method
	 * Loads the content set in the controls property into the TinyMCE editor instance and does
	 * the necessary post processing
	 * 
	 * @param {string} [sValue] Content, already sanitized if sanitizer is activated
	 * @private
	 */
	RichTextEditor.prototype.setValueTinyMCE4 = function(sValue) {
		this._tinyMce4Initialized().then(function() {
			var oEditor = this.getNativeApiTinyMCE4();
			if (oEditor) {
				oEditor.setContent(sValue);
		
				// if running in readonly mode, update link targets to _blank
				if (!this.getEditable()) {
					jQuery.each(oEditor.getDoc().getElementsByTagName("a"), function(i, oAnchor) {
						oAnchor.target = "_blank";
					});
				}
			}
		}.bind(this));
	};

	RichTextEditor.prototype._tinyMce4Loaded = function() {
		if (!this._promisetinyMce4Loaded) {
			this._promisetinyMce4Loaded = new Promise(function(resolve, reject) {
				// TODO: This promise never rejects - maybe add a timout value after which it rejects if not loaded?
				var fnCheckLoaded = function() {
					if (this._bUnloading) {
						// This only happens when the control instance is destroyed in the meantime...
						return;
					}
					if (window.tinymce && this.getDomRef("textarea")) {
						resolve();
					} else {
						setTimeout(fnCheckLoaded, 150);
					}
				}.bind(this);
				
				fnCheckLoaded();
			}.bind(this));
		}
		return this._promisetinyMce4Loaded;
	};
	
	RichTextEditor.prototype._tinyMce4Initialized = function() {
		// Returns a new promise in case the editor has been removed/hidden in the meantime
		return new Promise(function(resolve, reject) {
			// TODO: This promise never rejects - maybe add a timout value after which it rejects if not initialized?
			this._tinyMce4Loaded().then(function() {
				var fnCheckInitialized = function() {
					if (this._bUnloading) {
						// This only happens when the control instance is destroyed in the meantime...
						return;
					}
					var oEditor = this.getNativeApiTinyMCE4();
					var oEditorIFrame = document.querySelector("#" + this._iframeId);
					var oIFrameDocument;
					if (oEditorIFrame) {
						oIFrameDocument = oEditorIFrame.contentDocument || oEditorIFrame.contentWindow.document;
					}
					
					var bInitialized = 
						// Initially this._tinyMCE4Initialized is set to undefined, during initialization it is set to
						// false, but on rerendering while tinymce is inactive the value is false, meaning that we 
						// cannot wait for tinymce to initialize since it does not know we rerendered
						this._tinyMCE4Initialized === true ||
						// Check for existence of TinyMCE editor object
						oEditor && oEditor.getContainer() &&
						// Check for existence and loading status of TinyMCE editor iFrame
						oIFrameDocument && (
							oIFrameDocument.readyState === "complete" || oIFrameDocument.readyState === "interactive"
						);
					
					
					if (bInitialized) {
						resolve();
					} else {
						setTimeout(fnCheckInitialized, 150);
					}
				}.bind(this);
				fnCheckInitialized();
			}.bind(this));
		}.bind(this));
	};
	
	/**
	 * Initializes the TinyMCE instance after the TinyMCE script has been included and loaded
	 * 
	 * @private
	 */
	RichTextEditor.prototype._initWhenLoadedTinyMCE4 = function() {
		if (!this._boundResizeEditorTinyMCE4) {
			this._boundResizeEditorTinyMCE4 = this._resizeEditorTinyMCE4.bind(this);
		}
		
		this._tinyMce4Loaded().then(function() {
			this._tinyMCE4Initialized = false;
			this._createConfigTinyMCE4();
			window.tinymce.init(this._configTinyMCE4);

			this._tinyMce4Initialized().then(function() {
				var oEditor = this.getNativeApiTinyMCE4();
				if (!oEditor) {
					// TODO: This happens when the control is onloading or invalidating in between - should this be cause for alarm in other cases?
					return;
				}

				this._tinyMCE4Initialized = true;
				this.oEditor = oEditor;
				this.setValueTinyMCE4(this.getValue());
				this._onAfterReadyTinyMCE4(oEditor);

				oEditor.on("change", function(oEvent) {
					this.onTinyMCEChange(oEditor); // Works for TinyMCE 3 and 4
				}.bind(this));

				// Handle resized correctly. 
				if (!this._resizeHandlerId) {
					this._resizeHandlerId = ResizeHandler.register(this, this._boundResizeEditorTinyMCE4);
				}

				// This is an evil hack since TinyMCE only supports settings this in the language files for 
				// non-english locales
				// Let's try to avoid using it until someone important screams at us...
				// if (sap.ui.getCore().getConfiguration().getLanguage() === "en") {
				// 	// Set certain tooltips that are not configurable
				// 	var fnFontSelect = oEditor.buttons.fontselect;
				// 	oEditor.buttons.fontselect = function() {
				// 		var oButton = fnFontSelect.apply(this, arguments);
				// 		oButton.tooltip = "Font";
				// 		return oButton;
				// 	}
				// 	var fnSizeSelect = oEditor.buttons.fontsizeselect;
				// 	oEditor.buttons.fontsizeselect = function() {
				// 		var oButton = fnSizeSelect.apply(this, arguments);
				// 		oButton.tooltip = "Font Size";
				// 		return oButton;
				// 	}
				// }
			}.bind(this));
		}.bind(this));
	};
	
	
	/**
	 * Map languages that are incorrectly assigned or fallback if languages do not work
	 * TODO: Change this when more languages are supported by TinyMCE
	 * 
	 * @returns {string} The language to be used for TinyMCE
	 */
	RichTextEditor.prototype._getLanguageTinyMCE4 = function() {
		var oLocale = new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLanguage());
		var sLanguage = oLocale.getLanguage();
		var sRegion = oLocale.getRegion();

		// Special cases for language selection:

		// Language has different code in our systems
		if (sLanguage === "sh") {
			sLanguage = "sr";
		}
		if (sLanguage === "iw") {
			sLanguage = "he";
		}
		
		if (!sRegion) {
			sRegion = RichTextEditor.SUPPORTED_LANGUAGES_DEFAULT_REGIONS[sLanguage];
		}
		
		var sLangStr = sRegion ? sLanguage + "_" + sRegion.toUpperCase() : sLanguage;
		
		// If there is no language for that region defined, try without region
		if (!RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE4[sLangStr]) {
			sLangStr = sLanguage;
		}
		// If there is still no language defined, fallback to english
		if (!RichTextEditor.SUPPORTED_LANGUAGES_TINYMCE4[sLangStr]) {
			sLangStr = "en";
		}
		
		return sLangStr;
	};

	/**
	 * Resizes the inner TinyMCE DOM to fit into the controls DOM element
	 *
	 * @returns {void}
	 * @private
	 */
	RichTextEditor.prototype._resizeEditorTinyMCE4 = function() {
		// Resize so the full editor takes the correct height
		if (this._bUnloading) {
			// This only happens when the control instance is destroyed in the meantime...
			return;
		}
		
		var oEditorContentDom = this.oEditor.getContentAreaContainer();
		var iFullHeight       = this.$().height();
		var iContainerHeight  = jQuery(this.oEditor.getContainer()).height();
		var iContentHeight    = jQuery(oEditorContentDom).height();
		var iRestHeight       = iFullHeight - (iContainerHeight - iContentHeight);
		
		// There is a border of 1 px around the editor, which screws up the size determination when used the combination
		// of a 100%-sized editor and an auto-sized dialog. In this case the border leads to end endless loop of resize
		// events that lead to an ever growing dialog.
		// So only trigger a resize if the size difference is actually noticable. In case the difference is 0, the resize
		// call is needed because TinyMCE does not always actually resize when the resizeTo method is called.
		// There should be a better solution to this problem...
		var iDifference = Math.abs(this._lastRestHeight - iRestHeight);
		if (iDifference == 0 || iDifference > 5) {
			this.oEditor.theme.resizeTo(undefined, iRestHeight);
		}

		this._lastRestHeight = iRestHeight;
	};

	/**
	 * Sets up the TinyMCE instance after it has been loaded, initialized and shown on the 
	 * page.
	 * 
	 * @param {object} [oEditor] The current TinyMCE4 editor instance
	 * @private
	 */
	RichTextEditor.prototype._onAfterReadyTinyMCE4 = function(oEditor) {
		if (this._bUnloading) {
			// This only happens when the control instance is destroyed in the meantime...
			return;
		}
		
		this._resizeEditorTinyMCE4();
		
		// Focus handling
		var $Editor = jQuery(oEditor.getContainer());
		$Editor.bind('keydown', jQuery.proxy(this, this._tinyMCEKeyboardHandler));
		
		// Make sure focus event is triggered, when body inside the iframe is focused
		var $EditorIFrame = jQuery.sap.byId(this._iframeId);
		var $Body = jQuery(oEditor.getBody());
		var bTriggered = false;
		$Body.bind('focus', function() {
			if (!bTriggered) {
				bTriggered = true;
				if (sap.ui.Device.browser.internet_explorer) {
					$EditorIFrame.trigger('activate');
				} else {
					$EditorIFrame.trigger('focus');
				}
				$Body.focus();
				bTriggered = false;
			}
		});
		
		if (this.getTooltip() && this.getTooltip().length > 0) {
			var sTooltip = this.getTooltip_Text();
			oEditor.getBody().setAttribute("title", sTooltip);
			$EditorIFrame.attr("title", sTooltip);
		}
		this._registerWithPopupTinyMCE4();
		
		this.fireReadyOnce();
	};
	
	
	/**
	 * Creates the configuration object which is used to initialize the tinymce editor instance
	 * 
	 * @private
	 * @returns {bool} Whether the configuration changed since last time
	 */
	RichTextEditor.prototype._createConfigTinyMCE4 = function() {
		// Create new instance of TinyMCE4
		var aButtonRows  = this._createButtonRowsTinyMCE(" ", "|");
		if (aButtonRows.length === 0) {
			aButtonRows = false;
		}
		
		var sPluginsList = this._createPluginsListTinyMCE();
	
		/*eslint-disable camelcase */
		var oConfig = {
			// The following line only covers the editor content, not the UI in general
			directionality:     (sap.ui.getCore().getConfiguration().getRTL() ? "rtl" : "ltr"),
			// Fixes the tooltip-problem by expanding the html inside the iframe to full height
			content_css:        sap.ui.resource('sap.ui.richtexteditor', "themes/base/content/TinyMCE4Content.css"),
			selector:           "#" + this._textAreaId,
			theme:              "modern",
			menubar:            false,
			language:           this._getLanguageTinyMCE4(),
			browser_spellcheck: true,
			convert_urls:       false,
			plugins:            sPluginsList,
			toolbar_items_size: 'small',
			toolbar:            aButtonRows,
			statusbar:          false,
			image_advtab:       true,
			readonly:           (this.getEditable() ? 0 : 1),
			nowrap:             !this.getWrapping()
		};
		/*eslint-enable camelcase */
		
		// Only change return true and fire hook if the config changed (includes changes from the previous hook, of course)
		if (jQuery.sap.equal(this._configTinyMCE4, oConfig, 2, true)) {
			return false;
		} else {
			this._configTinyMCE4 = oConfig;
			
			// Hook to allow apps to modify the editor configuration directly before first creation
			this.fireBeforeEditorInit({ configuration : this._configTinyMCE4 });
			
			return true;
		}
	};
	
	
	/**
	 * Publish addFocusableContent event to make the editor iframe and internal iframes of TinyMCE known 
	 * to the popup (if contained in one) for focus handling. Needs to be done asynchronously, as the
	 * data-sap-ui-popup property is set in the onAfterRendering of the popup which occurs after the
	 * onAfterRendering of its content. For more info see sap.ui.core.Popup documentation
	 * 
	 * @private
	 */
	RichTextEditor.prototype._registerWithPopupTinyMCE4 = function() {
		var oBus = oBus = sap.ui.getCore().getEventBus();
		var $Pop = this.$().closest("[data-sap-ui-popup]");
	
		setTimeout(function() {
			if ($Pop.length === 1) {
				var sEventId = "sap.ui.core.Popup.addFocusableContent-" + $Pop.attr("data-sap-ui-popup");
				var oObject = { id: this._iframeId };
				oBus.publish("sap.ui", sEventId, oObject);
			}
		}, 0);
	};
	
	
	////////////////////////////////// End editor section "TinyMCE4" /////////////////////////////////
	

	return RichTextEditor;

}, /* bExport= */ true);
