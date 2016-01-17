/*
* ! @copyright@
*/

jQuery.sap.declare("sap.collaboration.components.controls.ReplyPopover");
jQuery.sap.require("sap.collaboration.components.controls.SuggestionUtility");
jQuery.sap.require("sap.collaboration.components.utils.LanguageBundle");
jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.collaboration.components.resources.css.SocialProfile", ".css"));
jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.collaboration.components.resources.css.ReplyPopover", ".css"));

sap.ui.core.Control.extend("sap.collaboration.components.controls.ReplyPopover",
/** @lends sap.collaboration.components.controls.ReplyPopover */ { metadata : {
	/**
	 * Constructor for the ReplyPopover
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * 
	 * @class ReplyPopover
	 * This class is responsible for creating the ReplyPopover
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.29.0-SNAPSHOT
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.ReplyPopover
	 * @memberOf sap.collaboration.components.controls.ReplyPopover
	 */
		library : "sap.collaboration",
		properties : {
			notifyAllEnabled : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		events : {
			
			/**
			 * This event is fired after the "Post" button is pressed.
			 */
			postReplyPress : {
				parameters : {
					
					/**
					 * This parameter contains the value entered by the user after the "Post" button is pressed.
					 */
					value : {type : "string"} 
				}
			},
			
			/**
			 * This event is fired after the "Show more replies" link is pressed.
			 */
			moreRepliesPress : {},
			
			/**
			 * This event is fired after the ReplyPopover is closed.
			 */
			afterClose : {},
			
			/**
			 * This event is fired after the "suggestions" are triggered.
			 */
			suggest : {
				parameters : {
					/**
					 * This parameter contains the value entered by the user after the suggestions are triggered.
					 */
						value : { type : "string" }
				}
			},
			
			/**
			 * This event is fired after the "suggestions" are closed.
			 */
			afterSuggestionClose : {}
		}
	},
});

/**
* Initialization on the ReplyPopover
* @protected
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.init =  function(){
	// Util Classes
	this._oLangBundle = new sap.collaboration.components.utils.LanguageBundle();
	this._oLogger = jQuery.sap.log.getLogger("sap.collaboration.components.controls.ReplyPopover");
	this._oSuggestionUtil = sap.collaboration.components.controls.SuggestionUtility;
	
	// Initialize Id
	this._sId = this.getId();
	
	// Initialize Model
	this._oJSONModelData = [];
	this._oJSONModel = new sap.ui.model.json.JSONModel(this._oJSONModelData);
	
	// Initialize variables
	this._oControlToReceiveFocus;
	
	// Initialize Controls
	this._oSocialProfileView;
	this._oReplyApp;
	this._oReplyPage;
	this._oReplyTextArea;
	this._oReplyList;
	this._oReplyButton;
	this._oReplyHeaderBar;
	this._oReplyPopover = this._oReplyPopover || this._createReplyPopover();
	
	// Suggestions
	this._sTextAreaOldValue = "";
	this._sTextAreaCurrentValue = "";
	this._aAtMentionBuffer = []; // Buffer to save the @mention(s)
	this._oSuggestionList;
	this._oSuggestionPopover = this._oSuggestionPopover || this._createSuggestionPopover();
	this._oSuggestionModel;
	this._aSuggestionModelData;
};

/**
* Clean up before control is destroyed
* @protected
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.exit = function(){
	if(this._oReplyPopover){
		this._oReplyPopover.destroy();
	}
	if(this._oSuggestionPopover){
		this._oSuggestionPopover.destroy();
	}
};

/**************************************************************************************
 * Public methods
 **************************************************************************************/
/**
* Post new reply
* @public
* @param {object} oReplyData - the data for the reply to be added
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.addReply = function(oReplyData){
	// checks whether oReplyData is empty before adding it
	if(!jQuery.isEmptyObject(oReplyData)){
		this._oJSONModelData.push(oReplyData);
		this._oJSONModel.setData(this._oJSONModelData, true);
	}
	else {
		this._oReplyTextArea.focus(); // this is required or the popover will close
	}
};

/**
* Add Replies
* @public
* @param {object} oRepliesData - the data for the replies to be added
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.addReplies = function(oRepliesData){
	// checks whether oRepliesData has 'data' and the length is not 0 before adding it
	if(oRepliesData.data && oRepliesData.data.length !== 0){	
		var iReplyListLength = this._oReplyList.getItems().length;
		var iRepliesDataLength = oRepliesData.data.length;
		
		this._oJSONModelData = oRepliesData.data.concat(this._oJSONModelData);
		this._oJSONModel.setData(this._oJSONModelData, true);
		
		// if the reply list length before setting the data is not 0, it implies that the list already had replies 
		// and the 'Show More' link was pressed. We then set the focus to the last item in the list before the 'Show More' link was pressed
		if(iReplyListLength !== 0){
			this._oControlToReceiveFocus = this._oReplyList.getItems()[iRepliesDataLength];
		}
		
		// hide/show the 'Show more replies' link
		if(oRepliesData.more){
			this._oShowMoreBar.setVisible(true);
		}
		else {
			this._oShowMoreBar.setVisible(false);
		}
	}
};

/**
* Open the ReplyPopover
* @public
* @param {object} oOpeningControl - the control that will open the ReplyPopover
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.openBy = function(oOpeningControl){
	this._oReplyPopover.openBy(oOpeningControl);
};

/**
* Define the delay, after which the busy indicator will show up
* @public
* @param {int} iDelay - The delay in ms
* @returns {sap.collaboration.components.controls.ReplyPopover} this method allows for chaining
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.setBusyIndicatorDelay = function(iDelay){
	this._oReplyPage.setBusyIndicatorDelay(iDelay);
	return this;
};

/**
* Set the controls busy state
* @public
* @param {boolean} bBusy - Set the controls busy state
* @returns {sap.collaboration.components.controls.ReplyPopover} this method allows for chaining
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.setBusy = function(bBusy){
	this._oReplyPage.setBusy(bBusy);
	return this;
};

/**
* Property setter for the notifyAllEnabled
* @public
* @param {boolean} bNotifyAllEnabled
* @return {sap.collaboration.components.controls.ReplyPopover} this - to allow method chaining
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.setNotifyAllEnabled = function(bNotifyAllEnabled){
	var sLangBundleText;
	bNotifyAllEnabled ? sLangBundleText = "ST_NO_SUGGESTIONS" : sLangBundleText = "ST_ADD_POST_NO_SUGGESTIONS";
	this._oSuggestionList.setProperty("noDataText",  this._oLangBundle.getText(sLangBundleText, ["@@notify"]));
	
	this.setProperty("notifyAllEnabled", bNotifyAllEnabled);
	
	return this;
};

/**
* Getter for the text area
* @public
* @return {sap.ui.core.Control} - the ReplyPopover text area
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.getTextArea = function(){
	return this._oReplyTextArea;
};


/**************************************************************************************
 * Private methods
 **************************************************************************************/
/**
* Adds a List to the Popover content
* @private
* @returns {sap.m.List}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._addList = function(){
	var that = this;
	
	var oReplyListTemplate = new sap.m.FeedListItem({
		text: "{Text}",
		icon: "{Creator/ThumbnailImage}",
		sender: "{Creator/FullName}",
		timestamp: "{CreatedAt}",
		iconActive: false,
		senderPress: function(oEvent){
			var oReplyObject = oEvent.getSource().getBindingContext().getObject();
			var sMemberEmail = oReplyObject.Creator.Email;
			that._oSocialProfileView.getViewData().memberId = sMemberEmail;
			that._oSocialProfileView.rerender();
			that._oReplyApp.to(that._oSocialProfilePage);
		}
	}).addStyleClass("replyFeedListItem");
	
	if(!this._oReplyList){
		this._oReplyList = new sap.m.List(this._sId + "_replyList", {
			width: "25rem",
			items: [],
			noDataText: this._oLangBundle.getText("ST_REPLY_LIST_AREA"),
			showNoData: true,
			showSeparators: sap.m.ListSeparators.None,
			updateFinished: function(oEvent){
				var iListLength = that._oReplyList.getItems().length;
				// We need to set the focus to the last Reply to have the scrollbar scroll to the bottom of the list
				if(iListLength !== 0 && that._oControlToReceiveFocus === that._oReplyTextArea){
					that._oReplyList.getItems()[iListLength - 1].focus();
				}
				
				if(that._oReplyList.getItems().length === 0){
					that._oReplyTextArea.addStyleClass("replyTextAreaToBottom");
					that._oSuggestionPopover.setOffsetX(0);
				}
				else {
					/*
					 * We need to check if the height of the reply list is larger than the height of the reply page content. 
					 * If so, then we remove the css class which sticks the text area on top of the footer bar.
					 * If we don't remove this css class, then the text area will also remain in the same spot and 
					 * not move down as the replies grow
					 */ 
					// height of the reply list (grows as you add replies)
					var iReplyPopoverListHeight = jQuery(that._oReplyList.getDomRef()).height();
					// height of the ReplyPopover content, in this case it's everything inside the popover (header, content, text area, footer)
					var iReplyPopoverContentHeight =  jQuery(that._oReplyPopover.getDomRef("cont")).height();
					// height of the header containing the title "Replies"
					var iReplyPopoverHeaderHeight = jQuery(that._oReplyPage.getCustomHeader().getDomRef()).height();
					// height of the text area where you enter your reply
					var iReplyTextAreaHeight = parseInt(that._oReplyTextArea.getHeight());
					// height of the footer containing the 'Post' button
					var iReplyPopoverFooterHeight = jQuery(that._oReplyPage.getFooter().getDomRef()).height();
					if(iReplyPopoverListHeight > (iReplyPopoverContentHeight - iReplyPopoverHeaderHeight - iReplyTextAreaHeight - iReplyPopoverFooterHeight)){
						that._oReplyTextArea.removeStyleClass("replyTextAreaToBottom");
						that._oSuggestionPopover.setOffsetX(9); // we need to offset the suggestions popover to account for the vertical scrollbar that will now appear
					}
					else {
						that._oReplyTextArea.addStyleClass("replyTextAreaToBottom");
						that._oSuggestionPopover.setOffsetX(0);
					}
				}
				that._oControlToReceiveFocus.focus();
			}
		});
	}
	this._oReplyList.setModel(this._oJSONModel);
	this._oReplyList.bindItems({
		path: "/",
		template: oReplyListTemplate
	});
	
	return this._oReplyList;
},

/**
* Adds a Text Area to the Popover content
* @private
* @returns {sap.ui.Core.Control}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._addTextArea = function(){
	this._oReplyTextArea = new sap.m.TextArea(this._sId + "_replyTextArea", {
		height: "80px",
		width: "100%",
		placeholder: this._oLangBundle.getText("ST_REPLY_TEXT_AREA"),
		liveChange: [function (oEvent) {
			this._sTextAreaCurrentValue = oEvent.getParameter("value");
			// if the user selected all of the text and deleted everything we clear the buffer, otherwise execute the _triggerSuggestions method
			if(this._sTextAreaCurrentValue.trim() === ""){
				this._aAtMentionBuffer = [];
				this.closeSuggestionPopover();
			}
			else {
				 this._triggerSuggestions(this._sTextAreaCurrentValue, this._sTextAreaOldValue);
			}
			this._sTextAreaOldValue = this._sTextAreaCurrentValue;
			this._enableDisablePostButton(this._sTextAreaCurrentValue);
		}, this]
	}).addStyleClass("replyTextAreaToBottom").addStyleClass("replyTextArea");
	this._oControlToReceiveFocus = this._oReplyTextArea;
	
	return this._oReplyTextArea;
};

/**
* Adds the Social Profile
* @private
* @returns {sap.ui.View}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._addSocialProfile = function(){
	this._oSocialProfileView = 	new sap.ui.view(this._sId + "_profileView", {
		viewData : {
			langBundle : this._oLangBundle, 
			popoverPrefix : this._sId
		},
		type: sap.ui.core.mvc.ViewType.JS, 
		viewName: "sap.collaboration.components.socialprofile.SocialProfile"
	});
	
	return this._oSocialProfileView;
},

/**
* Enables/Disables the 'Post' button
* @private
* @param {string} sValue
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._enableDisablePostButton = function(sValue){
	sValue.trim() !== "" ? this._oReplyButton.setEnabled(true) : this._oReplyButton.setEnabled(false);
};

/**
* Adds a Button to the Popover
* @private
* @returns {sap.m.App}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._addApp = function(){
	var that = this;
	
	if(this._oReplyApp){
		return this._oReplyApp;
	}
	/**************************
	 * Create the Reply Page
	 **************************/
	this._oReplyButton = new sap.m.Button(this._sId + "_replyButton", {
		text: this._oLangBundle.getText("ST_REPLY_POST"),
		enabled: false,
		press: this._postReply.bind(that)
	});
	this._oShowMoreLink = new sap.m.Link(this._sId + "_replyLink", {
		text:  this._oLangBundle.getText("ST_SHOW_MORE_REPLIES"),
		press: this._showMoreReplies.bind(that)
	});
	this._oShowMoreBar = new sap.m.Bar(this._sId + "_replyBar", {
		contentMiddle: [this._oShowMoreLink],
		visible: false
	}).addStyleClass("showMoreReplies");
	
	this._oReplyPage =  new sap.m.Page(this._sId + "_replyPage", {
		showHeader: true,
		showSubHeader: false,
		showFooter: true,
		customHeader: new sap.m.Bar({
			contentMiddle: [new sap.m.Label({ text : this._oLangBundle.getText("ST_REPLY_TITLE")})]
		}),
		footer: new sap.m.Bar({
			contentRight: [this._createMentionButton(), this._oReplyButton]
		}),
		content: [this._oShowMoreBar, this._addList(), this._addTextArea()]
	});
	
	/**************************
	 * Create the Profile Page
	 **************************/ 
	this._oSocialProfileButton = new sap.m.Button(this._sId + "_profileButton", {
		text: this._oLangBundle.getText("SP_OPEN_JAM_BUTTON"),
		press: function() {
			window.open(that._oSocialProfileView.getController().getProfileURL(), "_blank");
		}
	});
	this._oSocialProfilePage = new sap.m.Page(this._sId + "_profilePage", {
		title: this._oLangBundle.getText("SP_TITLE"),
		showNavButton: true,
		showHeader: true,
		showSubHeader: false,
		showFooter: true,
		navButtonPress: function(oEvent){
			that._oReplyApp.back();
		},
		footer: new sap.m.Bar({
			contentRight: [this._oSocialProfileButton]
		}),
		content: [this._addSocialProfile()]
	});
	
	/**************************
	 * Add pages to App
	 **************************/ 
	this._oReplyApp = new sap.m.App(this._sId + "_replyApp", {
		backgroundColor: "#ffffff",
		pages: [this._oReplyPage, this._oSocialProfilePage]
	});
	
	return this._oReplyApp;
};

/**************************************************************************************
 * Event Handlers
 **************************************************************************************/
/**
* Post new reply
* @private
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._postReply = function(){
	var sValueWithEmailAlias = this._oSuggestionUtil.convertTextWithFullNamesToEmailAliases(this._oReplyTextArea.getValue(), this._aAtMentionBuffer);
	this.firePostReplyPress({value: sValueWithEmailAlias});
	
	// clear the current text area value, old text area value and buffer
	this._oReplyTextArea.setValue("");
	this._sTextAreaOldValue = "";
	this._aAtMentionBuffer = [];
	
	this._oReplyButton.setEnabled(false);
	this._oControlToReceiveFocus = this._oReplyTextArea;
};

/**
* Show more replies
* @private
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._showMoreReplies = function(){
	this.fireMoreRepliesPress();
};

/**
* After popover closes
* @private
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._afterClose = function(){
	this.fireAfterClose();
};

/**************************************************************************************
 * Suggestions
 **************************************************************************************/
/**
* Sets the data to the Suggestion List and open the Suggestion Popover
* @public
* @param {array} aSuggestionData - the suggestions data to be set
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.setSuggestionData = function(aSuggestionData){
	this._aSuggestionModelData = aSuggestionData;
	if(aSuggestionData.length !== 0 && aSuggestionData[aSuggestionData.length - 1].fullName !== "@@notify" && this.getNotifyAllEnabled()){
		this._aSuggestionModelData.push({fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"});
	}
	this._oSuggestionModel.setData(this._aSuggestionModelData);
	this._oSuggestionPopover.openBy(this._oReplyTextArea);
};

/**
* Closes the Suggestion popover if opened
* @public
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype.closeSuggestionPopover = function() {
	if(this._oSuggestionPopover.isOpen() === true){
		this._oSuggestionPopover.close();
	}
	this.fireAfterSuggestionClose();
};

/**
* Creates a Responsive Popover for the Replies 
* @private
* @returns {sap.m.ResponsivePopover}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._createReplyPopover = function(){
	var oReplyPopover = new sap.m.ResponsivePopover(this._sId + "_replyPop", {
		showHeader: false,
		placement: sap.m.PlacementType.Vertical,
		contentWidth: "25rem",
		contentHeight: "455px",
		content: this._addApp(),
		afterClose: [function(){
			this._oReplyApp.backToTop();
			this._oReplyList.destroyItems();
			this._oJSONModelData = [];
			this._oJSONModel.setData(this._oJSONModelData);
			this._oShowMoreBar.setVisible(false);
			this._oControlToReceiveFocus = this._oReplyTextArea;
			this._afterClose();
		},this]
	});
	oReplyPopover.setInitialFocus(this._oReplyTextArea);
	
	return oReplyPopover;
};

/**
* Creates a Responsive Popover for the suggestion list
* @private
* @returns {sap.ui.core.Control}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._createSuggestionPopover = function(){
	var oSuggestionPopover = new sap.m.ResponsivePopover(this._sId + "_suggestionPop", {
		showHeader: false,
		contentWidth: "25rem",
		placement: sap.m.PlacementType.Bottom,
		offsetY: -20,
		content: [this._addSuggestionList()]
	}).addStyleClass("suggestionPopover");
	oSuggestionPopover.setInitialFocus(this._oReplyTextArea);
	
	return oSuggestionPopover;
};

/**
* Adds a list to the content of the Suggestion Popover
* @private
* @returns {sap.m.List}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._addSuggestionList = function(){
	var oSuggestionTemplate = new sap.m.StandardListItem({
		icon: "{userImage}",
		title: "{fullName}",
		description: "{email}",	
	});
	
	this._aSuggestionModelData = [];
	this._oSuggestionModel = new sap.ui.model.json.JSONModel(this._aSuggestionModelData);
	
	this._oSuggestionList = new sap.m.List(this._sId + "_suggestionList", {
		mode: sap.m.ListMode.SingleSelectMaster,
		noDataText: this._oLangBundle.getText("ST_ADD_POST_NO_SUGGESTIONS"),
		rememberSelections: false,
		showSeparators: sap.m.ListSeparators.None,
		selectionChange: [function(oEventData) {
			var sFullname = oEventData.getParameter("listItem").getProperty("title");
			var sEmail = oEventData.getParameter("listItem").getProperty("description");
			
			this._sTextAreaCurrentValue = this._oSuggestionUtil.getTextAreaValueAfterSuggestionSelected(sFullname, sEmail, this._mCurrentAtMention, this._aAtMentionBuffer, this._sTextAreaCurrentValue, sFullname === "@@notify");
			this._oReplyTextArea.setValue(this._sTextAreaCurrentValue);	
			this._sTextAreaOldValue = this._sTextAreaCurrentValue;
			this.closeSuggestionPopover();
			this._oReplyTextArea.selectText(this._mCurrentAtMention.endIndex + 2, this._mCurrentAtMention.endIndex + 2); //+2 to include the space at the end
		}, this]
	}).setModel(this._oSuggestionModel);
	
	this._oSuggestionList.bindItems("/", oSuggestionTemplate);
	
	return this._oSuggestionList;
};

/**
* Adds the 'mention' button to the Responsive Popover
* @private
* @returns {sap.m.Button}
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._createMentionButton = function(){
	var oMentionButton = new sap.m.Button(this._sId + "_mentionButton", {
		text: "@",
		tooltip: this._oLangBundle.getText("ST_MENTION_TOOLTIP"),
		press: [function(){
			var iCursorPositionInTextArea = this._oReplyTextArea.getDomRef("inner").selectionStart; // property "selectionStart" not available in IE8 or lower
			var aMentionButtonPressed = this._oSuggestionUtil.atMentionsButtonPressed(this._oReplyTextArea.getValue(), iCursorPositionInTextArea);
			this._oReplyTextArea.setValue(aMentionButtonPressed[0]);
			this._oReplyTextArea.focus();
			this._oReplyTextArea.selectText(aMentionButtonPressed[1], aMentionButtonPressed[1]);
			this._oReplyTextArea.fireLiveChange({value : this._oReplyTextArea.getValue()});
		}, this]

	});
	
	return oMentionButton;
};

/**
* Logic for when to fire the suggestions
* @private
* @param {string} sTextAreaCurrentValue
* @param {string} sTextAreaOldValue
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._triggerSuggestions = function(sTextAreaCurrentValue, sTextAreaOldValue){
	// gets the change that happened on the text of the text area 
	var oTextAreaChange = this._oSuggestionUtil.getChangesInTextArea(sTextAreaCurrentValue,sTextAreaOldValue);
	
	if(oTextAreaChange.operation === "addChar"){
		this._handleAddedCharacters(oTextAreaChange, sTextAreaCurrentValue);
	}
	else if (oTextAreaChange.operation === "deleteChar"){
		this._handleDeletedCharacters(oTextAreaChange, sTextAreaCurrentValue, this._aAtMentionBuffer);
	}
};


/**
* Logic when the user adds character(s)
* @private
* @param {object} oTextAreaChange
* @param {string} sTextAreaCurrentValue
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._handleAddedCharacters = function(oTextAreaChange, sTextAreaCurrentValue) {
	var iTextAreaChangeIndex = oTextAreaChange.changeIndex; // the index in the string where the change starts to happen
	var sTextAreaChangeChars = oTextAreaChange.charactersChanged; 	// the chars added by the change that happened on the text are, in case of delete it will be undefined
	var iAtBufferLength = this._aAtMentionBuffer.length; // buffer length
	var bIsNotifyAllEnabled = this.getNotifyAllEnabled();
	
	/* 
	 * IF the char(s) added:
	 * i - bIsNotifyAllEnabled is true AND
	 * ii - has a '@' in the beginning AND
	 * iii - has another '@' before it AND
	 * iv - the character before it has a space OR return carriage OR or undefined
	 * 
	 * then it implies that the '@@notify' should be triggered
	 */ 
	if (bIsNotifyAllEnabled && sTextAreaChangeChars[0] === "@" && sTextAreaCurrentValue[iTextAreaChangeIndex - 1] === "@" && 
		(sTextAreaCurrentValue[iTextAreaChangeIndex - 2] === " " || sTextAreaCurrentValue[iTextAreaChangeIndex - 2] === "\n" || sTextAreaCurrentValue[iTextAreaChangeIndex - 2] === undefined)) {
		
		this.setSuggestionData([{fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"}]);
		
		// update indices in the buffer
		for (var i = 0; i < iAtBufferLength; i++) {
			if(this._aAtMentionBuffer[i].startIndex === iTextAreaChangeIndex - 1){
				this._aAtMentionBuffer[i].endIndex += sTextAreaChangeChars.length;
			}
			else if(iTextAreaChangeIndex < this._aAtMentionBuffer[i].startIndex){
				this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[i], sTextAreaChangeChars.length);
			}
		}
	}
	/* 
	 * ELSE IF the char(s) added:
	 * i- has a '@' in the beginning OR
	 * ii- has a '@' in the beginning with a space before it (' @')
	 * 
	 * then it implies the suggestions should be triggered
	 */ 
	else if (sTextAreaChangeChars[0] === "@" || (sTextAreaChangeChars[0] === " " && sTextAreaChangeChars[1] === "@")) {
		if (sTextAreaChangeChars[1] === "@") {
			iTextAreaChangeIndex += 1; // need to increase the iTextChangeIndex by 1 to accommodate for the space since we want the start index to be where the '@' is
		}

		var iCurrentAtMentionArrayIndex = this._oSuggestionUtil.addToAtMentionBuffer(this._aAtMentionBuffer, iTextAreaChangeIndex, sTextAreaChangeChars);
		this._mCurrentAtMention = this._aAtMentionBuffer[iCurrentAtMentionArrayIndex];
		// if the text entered was an '@' char with a space after it (i.e. pressing the '@mentions' button), then -1 the end index in the buffer
		if (sTextAreaChangeChars === "@ ") {
			this._mCurrentAtMention.endIndex -= 1;
		}
		
		// only fire the suggestions if the character before the '@' is a space, undefined or a return carriage
		var sCharBeforeAtMentionChar = sTextAreaCurrentValue[this._mCurrentAtMention.startIndex - 1];
		if (sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n') {
			this.fireSuggest({value: sTextAreaCurrentValue.substring(iTextAreaChangeIndex + 1, iTextAreaChangeIndex + sTextAreaChangeChars.length)});
		}
		else {
			this.closeSuggestionPopover();
		}
	}
	/*
	 * ELSE the char(s) added do not have a '@' in the beginning
	 * 
	 * then it implies that the '@@notify' or suggestions or nothing should be triggered
	 */ 
	else { 
		for (var i = iAtBufferLength - 1; i >= 0; i--) {
			if (iTextAreaChangeIndex > this._aAtMentionBuffer[i].startIndex) {
				var sStringAfterAtMention = this._oSuggestionUtil.getStringAfterAtMention(iTextAreaChangeIndex + sTextAreaChangeChars.length - 1, sTextAreaCurrentValue, this._aAtMentionBuffer[i]);
				var sStringBeforeAtMention = this._oSuggestionUtil.getStringBeforeAtMention(this._aAtMentionBuffer[i], sTextAreaCurrentValue, iTextAreaChangeIndex);
				var sQueryString = sStringBeforeAtMention + sTextAreaChangeChars + sStringAfterAtMention;
				var oRegExp = new RegExp("^" + sQueryString);
				// case #1: the char(s) added are part of a "@@notify"
				if (bIsNotifyAllEnabled && oRegExp.test("@notify")) {
					this._aAtMentionBuffer[i].endIndex = this._aAtMentionBuffer[i].endIndex + sTextAreaChangeChars.length;
					this._mCurrentAtMention = this._aAtMentionBuffer[i];
					this.setSuggestionData([{fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"}]);
				}
				// case #2: the char(s) from the @mention start index to the char(s) added (sQueryString) have no space or one space
				else if (!sQueryString.match(/ /g) || (sQueryString.match(/ /g) && sQueryString.match(/ /g).length === 1)) {
					// if the char(s) were added to a @mention that was selected from the suggestions list (atMentioned === true) -
					// this would invalidate the @mention, therefore we remove the '@' char, replace it with a " " and remove the @mention from the buffer
					if ((this._aAtMentionBuffer[i].atMentioned === true || this._aAtMentionBuffer[i].notifyAll === true) && iTextAreaChangeIndex <= this._aAtMentionBuffer[i].endIndex) {
						var iAtMentionStartIndex = this._aAtMentionBuffer[i].startIndex;
						var sTextWithoutAtChar = sTextAreaCurrentValue.slice(0, iAtMentionStartIndex) + " " + sTextAreaCurrentValue.slice(iAtMentionStartIndex + 1, sTextAreaCurrentValue.length);
						
						this._oReplyTextArea.setValue(sTextWithoutAtChar);
						this._sTextAreaCurrentValue = sTextWithoutAtChar;
						this._aAtMentionBuffer.splice(i, 1);
						this._oReplyTextArea.selectText(iTextAreaChangeIndex + 1, iTextAreaChangeIndex + 1);
						this.closeSuggestionPopover();
					}
					// else check that there is no return carriage or '@' in the sQueryString and fire the suggestions
					else if (sQueryString.search("\n") === -1 && sQueryString.search("@") === -1) {
						this._aAtMentionBuffer[i].endIndex = this._aAtMentionBuffer[i].startIndex + sQueryString.length;
						this._mCurrentAtMention = this._aAtMentionBuffer[i];
						
						var sCharBeforeAtMentionChar = sTextAreaCurrentValue[this._mCurrentAtMention.startIndex - 1];
						// only fire the suggestions if the character before the '@' is a space, undefined or a return carriage
						if(sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n'){
							this.fireSuggest({value: sQueryString}); // fire suggestions
						}
					}
					else {
						this.closeSuggestionPopover();
					}
				}
				// case #3: the char(s) added have nothing to do with any @mentions (e.g. user entered a char, space or return carriage) then close any open suggestions
				else {
					this.closeSuggestionPopover();
				}
				break;
			}
			// update indices of @mentions in the buffer
			this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[i], sTextAreaChangeChars.length);
			
			if (i === 0) { // check if last iteration of for loop, then close suggestions in case it was previously opened
				this.closeSuggestionPopover();
			}
		}
	}
};

/**
* Logic when the user deletes character(s)
* @private
* @param {object} oTextAreaChange
* @param {string} sTextAreaCurrentValue
* @memberOf sap.collaboration.components.controls.ReplyPopover
*/
sap.collaboration.components.controls.ReplyPopover.prototype._handleDeletedCharacters = function(oTextAreaChange, sTextAreaCurrentValue) {
	var iTextAreaChangeIndex = oTextAreaChange.changeIndex; // the index in the string where the change starts to happen
	var sTextAreaChangeChars = oTextAreaChange.charactersChanged;
	var iCharsDifference; // the difference in char(s) between the old and new text area value

	// IF the deleted char(s) is part of a @mention in the buffer
	var iAtMentionIndexInBuffer = this._oSuggestionUtil.isDeletedCharPartOfAtMentioned(this._aAtMentionBuffer, iTextAreaChangeIndex);
	if(iAtMentionIndexInBuffer !== undefined){
		// case #1: deleted char(s) is part of a selected @mention (atMentioned === true)
		if(this._aAtMentionBuffer[iAtMentionIndexInBuffer].atMentioned === true || this._aAtMentionBuffer[iAtMentionIndexInBuffer].notifyAll ===  true){
			this.closeSuggestionPopover();
			// get the value of the text after deletion of the whole @mention string
			this._sTextAreaCurrentValue = this._sTextAreaCurrentValue.substr(0, this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex) + 
																				this._sTextAreaCurrentValue.substr(this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex -
																				oTextAreaChange.numberOfCharsChanged + 1);
			this._oReplyTextArea.setValue(this._sTextAreaCurrentValue);
			this._oReplyTextArea.selectText(this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex, this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex);
			this._sTextAreaOldValue = this._sTextAreaCurrentValue;
			
			iCharsDifference = 1 + this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex - this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex; // +1 for the @
			this._aAtMentionBuffer.splice(iAtMentionIndexInBuffer, 1); // remove the @mention from the buffer
		}
		// case #2: deleted char(s) is not part of a selected @mention (atMentioned === false)
		else {
			iCharsDifference = oTextAreaChange.numberOfCharsChanged;
			var sCharBeforeAtMentionChar = sTextAreaCurrentValue[this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex - 1];
			// the deleted char(s) contains an '@' AND the char before is not an "@", remove the @mention from the buffer
			if(sTextAreaChangeChars.search("@") !== -1 && sTextAreaCurrentValue[oTextAreaChange.changeIndex - 1] !== "@"){
				this.closeSuggestionPopover();
				this._aAtMentionBuffer.splice(iAtMentionIndexInBuffer, 1);
			}
			// update the current @mention end index in the buffer and fire the suggest from the start to end index
			else if(sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n'){
				this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex -= iCharsDifference;
				// +1 to the start index to not include the '@' char and +1 to the end index to account for the last char
				var sValue = sTextAreaCurrentValue.substring(this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex + 1, this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex + 1);
				var oRegExp = new RegExp("^" + sValue);
				if(sValue !== "" && oRegExp.test("@notify")){
					this.setSuggestionData([{fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"}]);
				}
				else {
					this.fireSuggest({value : sValue});
				}
			}
		}
	}
	// update the rest of the indices in the buffer if the start index is greater than the change index
	iAtMentionIndexInBuffer = iAtMentionIndexInBuffer || 0;
	iCharsDifference = iCharsDifference || oTextAreaChange.numberOfCharsChanged;
	for(var j = iAtMentionIndexInBuffer; j < this._aAtMentionBuffer.length; j++){
		if(iTextAreaChangeIndex < this._aAtMentionBuffer[j].startIndex){
			this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[j], - iCharsDifference);
		}
	}
};