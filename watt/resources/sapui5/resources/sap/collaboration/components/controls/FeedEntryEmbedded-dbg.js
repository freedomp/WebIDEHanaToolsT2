/*
* ! @copyright@
*/
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/collaboration/components/utils/LanguageBundle', 'sap/collaboration/components/controls/PlaceholderUtility', 'sap/collaboration/components/utils/MediaTypeToSAPIcon'],
	function(jQuery, Control, LanguageBundle, PlaceholderUtility, MediaTypeToSAPIcon) {
	"use strict";
	
	/**
	 * Constructor for a new Feed Entry Embedded Control. 
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * 
	 * @extends sap.ui.core.Control
	 * The Feed Entry Embedded Control is to be used in a sap.suite.ui.commons.TimelineItem.
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.FeedEntryEmbedded
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	var FeedEntryEmbedded = Control.extend("sap.collaboration.components.controls.FeedEntryEmbedded", /** @lends sap.collaboration.components.controls.FeedEntryEmbedded.prototype */ { metadata : {
		interfaces : [],
  		library : "sap.m",
  		properties : {
  			"feedEntry":{type:"object", group:"data"}
  		},
		events : {
			"atMentionClick" : {
				parameters : {
					link: {type : "object"},
				}
			}
		},
		aggregations:{	
		}
	}});
	
	/**
	*  Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.init = function(){
		this._nMaxCollapsedLength = 200;
		this._oLangBundle = new LanguageBundle();
				
		this._oTimelineItemContent; // control for the Content (sap.m.VBox)
		jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.collaboration.components.resources.css.EmbeddedControl", ".css"));
	};

	/**
	* Function is called before the rendering of the control is started. [borrowed from sap.ui.core.Control]
	* @overwrite
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.onBeforeRendering = function(){
	};
	/**
	* Function is called after the rendering of the control is started. [borrowed from sap.ui.core.Control]
	* @overwrite
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.onAfterRendering = function(){
		// render the links in the text
		var $textDiv = jQuery('#'+this.getId()+'-text');
		var innerHTML = $textDiv.html();
		if (innerHTML != undefined) {
			$textDiv.html(this._renderLinks(innerHTML));
		}
	};
	/**
	* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
	* @overwrite
	* @protected
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.exit = function(){
		this._destroyAtMentionLinks();
		
		if( this._oTimelineItemContent ){
			this._oTimelineItemContent.destroy();
		}
	};
	
	/**
	* Setter for the feedEntry property
	* @protected
	* @param {object} feedEntry 
	* @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	*/
	FeedEntryEmbedded.prototype.setFeedEntry = function(feedEntry) {
		this.setProperty("feedEntry", feedEntry);
		
		// save the text and text with placeholder
		this._sText = feedEntry.Text;
		this._sTextWithPlaceholders = feedEntry.TextWithPlaceholders;
		
		// resolve the atMentions and create the link controls 
		this._destroyAtMentionLinks();
		this._mAtMentionsLinks = {};
		var aAtMentions = PlaceholderUtility.getAtMentionsValues(this._sText, this._sTextWithPlaceholders);
		for (var i=0; i<aAtMentions.length; i++) {
			this._mAtMentionsLinks[aAtMentions[i].placeholder] = this._createAtMentionLink(aAtMentions[i], feedEntry);
		}
		
		this._oTimelineItemContent = this._createTimelineItemContent();
		return this;
	};
		
	/**
	 * Returns if the Text Display should be rendered
	 *
	 * @private
	 * @returns {boolean} 
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._shouldTextBeRendered = function() {
		// do not create text control for the following cases:
		// - feed text is empty
		// - feed entry is consolidated 
		// - feed entry is a Poll
		// - feed entry is a Question
		// - feed entry is an Idea
		// - feed entry is an Event
		// - feed entry is a Task
		// - feed entry is a Blog
		var oFeedEntry = this.getFeedEntry();
		if ( oFeedEntry.Text == undefined ||
			 oFeedEntry.Text == "" ||
			 oFeedEntry.ConsolidatedCount > 1 ||	
			((!jQuery.isEmptyObject(oFeedEntry.TargetObjectReference)) &&
				(oFeedEntry.TargetObjectReference.Type == "Task" ||
				oFeedEntry.TargetObjectReference.Type == "ForumItem" ||
				oFeedEntry.TargetObjectReference.Type == "Event" ||
				oFeedEntry.TargetObjectReference.FullPath == "ContentItem/BlogEntry" ||
				oFeedEntry.TargetObjectReference.FullPath == "ContentItem/Page" ||
				oFeedEntry.TargetObjectReference.FullPath == "ContentItem/Poll")
			)
		) {
			return false;
		}
		else {
			return true;
		}
	};
	
	/**
	 * Returns if the Text Display should be rendered
	 *
	 * @private
	 * @returns {boolean} 
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._shouldContentBeRendered = function() {
		return (this._oTimelineItemContent.getItems().length > 0); 
	};
	
	/**
	 * Returns array of text split by placeholders
	 * 
	 * @private
	 * @returns {array} array of strings
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._splitByPlaceholders = function(textWithPlaceholders) {
		return PlaceholderUtility.splitByPlaceholders(textWithPlaceholders);
	};
	
	/**************************
	 * Text Display methods
	 **************************/
	/**
	 * Replaces fully defined urls in the text with anchor tags
	 *
	 * @private
	 * @returns {string} returns text with url anchors
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._renderLinks = function(text) {
		var rLinkPattern = /(^|[\s\n]|<br\/?>|>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
		
		return text.replace(rLinkPattern, "$1<a href='$2' target='_blank'>$2</a>");
	};
	/**
	 * Create and return the link control for AtMention
	 * 
	 * @private
	 * @param mPlaceholder - placeholder and its value
	 * @param oFeedEntry - feed entry
	 * @returns {sap.m.Link} SAPUI5 link control
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._createAtMentionLink = function(mPlaceholder, oFeedEntry) {
		var sFullName = mPlaceholder.value.slice(1); // remove the @ at the beginning
		var iPlaceholderIndex = mPlaceholder.placeholder.replace(/[@a-z{}]/g,"");
		
		var oModel = new sap.ui.model.json.JSONModel({
			feedId: oFeedEntry.Id,
			placeholderIndex: iPlaceholderIndex,
			placeholderValue: mPlaceholder.value
		});
		
		var oLink = new sap.m.Link({
			id: "at_mention_link-" + this.getId() + "-" + iPlaceholderIndex,
			text: "{/placeholderValue}",
			press: [function(oControlEvent){
				this.fireAtMentionClick({ link: oControlEvent.getSource()}); // fire the atMentionClick event with the link control
			},this]
		}).addStyleClass("sapCollaborationAtMentionLink");
		
		oLink.setModel(oModel);
		return oLink;
	};
	/**
	 * Destroy the atMention links
	 * 
	 * @private
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._destroyAtMentionLinks = function() {
		if (this._mAtMentionsLinks) {
			for (var placeholder in this._mAtMentionsLinks) {
				if (this._mAtMentionsLinks.hasOwnProperty(placeholder)) {
					this._mAtMentionsLinks[placeholder].destroy();
				}
			}
			this._mAtMentionsLinks = undefined;
		}
	}
	
	/**************************
	 * Content methods
	 **************************/
	/**
	 * Create the control for the Content 
	 * 
	 * @private
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._createTimelineItemContent = function(){
		var oTimelineItemContent = new sap.m.VBox(this.getId() + "-content", {}).addStyleClass("sapUiTinyMarginTopBottom");
		
		// get the data
		var oFeedEntry =  this.getFeedEntry();
		
		// feed entry content
		if( (!jQuery.isEmptyObject(oFeedEntry.TargetObjectReference) 
				&& oFeedEntry.TargetObjectReference.Type !== undefined 
				&& oFeedEntry.TargetObjectReference.Type !== "FeedEntry") ||
			oFeedEntry.ConsolidatedCount > 1 ){
			
			oTimelineItemContent.addItem(this._createFeedEntryContent(oFeedEntry));
		}
		return oTimelineItemContent;
	};

	/**
	 * Create the control for a feed entry with a target object reference. 
	 * 
	 * @private
	 * @param oFeedEntry
	 * @returns {sap.m.HBox} 
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._createFeedEntryContent = function(oFeedEntry){
		
		var sIconSrc = "";
		var sLinkText = "";
		var sLinkHref = "";
		
		if( oFeedEntry.ConsolidatedCount > 1 ) {
			sIconSrc = "sap-icon://documents";
			sLinkText = this._oLangBundle.getText("TE_CONSOLIDATED_FEED_TEXT");
			sLinkHref = oFeedEntry.WebURL;
		}
		else {
			switch (oFeedEntry.TargetObjectReference.Type){
			case "ContentItem":
				if(oFeedEntry.TargetObjectReference.ContentType){
					sIconSrc = MediaTypeToSAPIcon.getSAPIconForMediaType(oFeedEntry.TargetObjectReference.ContentType);
					sLinkText = PlaceholderUtility.getContentItemName(oFeedEntry.Action, oFeedEntry.ActionWithPlaceholders);	
				}
				else{
					switch (oFeedEntry.TargetObjectReference.FullPath){	
					case "ContentItem/Poll":
						sIconSrc = "sap-icon://horizontal-bar-chart";
						break;
					case "ContentItem/Page":
						sIconSrc = "sap-icon://e-learning";
						break;
					case "ContentItem/BlogEntry":
						sIconSrc = "sap-icon://request";
						break;
					default:
						sIconSrc = "";
						break;
					}
					sLinkText = oFeedEntry.TargetObjectReference.Title;
				}
				break;
			case "ForumItem":
				sIconSrc = this._getForumItemIconSrc(oFeedEntry.TargetObjectReference);
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			case "Task":
				sIconSrc = "sap-icon://task";
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			case "Event":
				sIconSrc = "sap-icon://calendar";
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			default:
				sIconSrc = "sap-icon://action";
				sLinkText = oFeedEntry.TargetObjectReference.Title;
				break;
			}
			sLinkHref = oFeedEntry.TargetObjectReference.WebURL;
		}
		// icon
		var ICON_SIZE = "2.5em";
		var oIcon = new sap.ui.core.Icon({
			src: sIconSrc,
			size: ICON_SIZE
		}).addStyleClass("sapUiTinyMarginBeginEnd");
		// link
		var oLink = new sap.m.Link({
			text: sLinkText, 
			target: "_blank",
			href: sLinkHref,
			tooltip: sLinkText,
			wrapping: true,
			width: "95%"
		});
		
		var oHBox = new sap.m.HBox({});
		oHBox.addItem(oIcon);
		var oVBox = new sap.m.VBox({
			width:"100%"
		}).addStyleClass("sapUiTinyMarginBeginEnd"); // Vbox in case we want to add text under the link
		oVBox.addItem(oLink);
		oHBox.addItem(oVBox);
		
		return oHBox;
	};
	/**
	 * Get the icon source for a Forum Item.  
	 * 
	 * @private
	 * @param oForumItem
	 * @returns {String}
	 * @memberOf sap.collaboration.components.controls.FeedEntryEmbedded
	 */
	FeedEntryEmbedded.prototype._getForumItemIconSrc = function(oForumItem){
		
		var sFullPath = oForumItem.FullPath;
		
		switch (sFullPath){
		case "ForumItem/Inquiry":
		case "ForumItem/Question":
			return "sap-icon://question-mark";
		case "ForumItem/Idea":
			return "sap-icon://lightbulb";
		case "ForumItem/Discussion":
			return "sap-icon://discussion";
		default:
			return "";
		}
	};
	
	
	return FeedEntryEmbedded;
}, /* bExport= */ true);