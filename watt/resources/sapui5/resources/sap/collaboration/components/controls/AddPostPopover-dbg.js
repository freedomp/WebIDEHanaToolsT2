/*
* ! @copyright@
*/

jQuery.sap.declare("sap.collaboration.components.controls.AddPostPopover");
jQuery.sap.require("sap.collaboration.components.controls.SuggestionUtility");
jQuery.sap.require("sap.collaboration.components.utils.CommonUtil");
jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.collaboration.components.resources.css.AddPostPopover", ".css"));

sap.ui.core.Control.extend("sap.collaboration.components.controls.AddPostPopover",
/** @lends sap.collaboration.components.controls.AddPostPopover */ { metadata : {
	/**
	 * Constructor for the AddPostPopover
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * 
	 * @class AddPostPopover
	 * This class is responsible for creating the AddPostPopover
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.29.0-SNAPSHOT
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.AddPostPopover
	 * @memberOf sap.collaboration.components.controls.AddPostPopover
	 */
		library : "sap.collaboration",
		properties : {
			notifyAllEnabled : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		events : {
			
			/**
			 * This event is fired after the "Post" button is pressed.
			 */
			postPress : {
					parameters : {
						/**
						 * This parameter contains the value entered by the user after the "Post" button is pressed.
						 */
						value : { type : "string" } 
					}
			},
			
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
	}
});

/**************************************************************************************
 * Protected methods
 **************************************************************************************/
/**
* Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
* @protected
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype.init = function(){
	// Util classes
	this._oCommonUtil = new sap.collaboration.components.utils.CommonUtil();
	this._oLangBundle = this._oCommonUtil.getLanguageBundle();
	this._oSuggestionUtil = sap.collaboration.components.controls.SuggestionUtility;
	// Control ID
	this._sId = this.getId();
	
	// Suggestions
	this._sTextAreaOldValue = "";
	this._sTextAreaCurrentValue = "";
	this._aAtMentionBuffer = []; // Buffer to save the @mention(s)
	
	// Initialization of controls
	this._oAddPostPopover = this._oAddPostPopover || this._createAddPostPopover();
	this._oSuggestionList;
	this._oSuggestionPopover = this._oSuggestionPopover || this._createSuggestionPopover();
	this._oSuggestionModel;
	this._aSuggestionModelData;
};

/**
* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
* @protected
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype.exit = function(){
	this._oAddPostPopover.destroy();
	this._oSuggestionPopover.destroy();
};

/**************************************************************************************
 * Public methods
 **************************************************************************************/
/**
* Open the AddPostPopover
* @public
* @param {object} oOpeningControl - the control that will open the AddPostPopover
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype.openBy =  function(oOpeningControl){
	this._oAddPostPopover.openBy(oOpeningControl);
};

/**
* Sets the data to the Suggestion List and open the Suggestion Popover
* @public
* @param {array} aSuggestionData - the suggestions data to be set
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype.setSuggestionData = function(aSuggestionData){
	this._aSuggestionModelData = aSuggestionData;
	if(aSuggestionData.length !== 0 && aSuggestionData[aSuggestionData.length - 1].fullName !== "@@notify" && this.getNotifyAllEnabled()){
		this._aSuggestionModelData.push({fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"});
	}
	this._oSuggestionModel.setData(this._aSuggestionModelData);
	this._oSuggestionPopover.openBy(this._oAddPostTextArea);
};

/**
* Closes the Suggestion popover if opened
* @public
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype.closeSuggestionPopover = function() {
	if(this._oSuggestionPopover.isOpen() === true){
		this._oSuggestionPopover.close();
	}
	this.fireAfterSuggestionClose();
};

/**
* Property setter for the notifyAllEnabled
* @public
* @param {boolean} bNotifyAllEnabled
* @return {sap.collaboration.components.controls.AddPostPopover} this - to allow method chaining
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype.setNotifyAllEnabled = function(bNotifyAllEnabled){
	var sLangBundleText;
	bNotifyAllEnabled ? sLangBundleText = "ST_NO_SUGGESTIONS" : sLangBundleText = "ST_ADD_POST_NO_SUGGESTIONS";
	this._oSuggestionList.setProperty("noDataText",  this._oLangBundle.getText(sLangBundleText, ["@@notify"]));
	
	this.setProperty("notifyAllEnabled", bNotifyAllEnabled);
	
	return this;
};

/**************************************************************************************
 * Private methods
 **************************************************************************************/
/**
* Creates the Responsive Popover
* @private
* @returns {sap.m.ResponsivePopover}
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._createAddPostPopover = function(){
	var oAddPostPopover  =  new sap.m.ResponsivePopover(this._sId + "_addPostPopover",{
		title: this._oLangBundle.getText("ST_ADD_POST_TITLE"),
		contentWidth:"25rem",
		contentHeight:"10rem",
		placement: sap.m.PlacementType.Auto,
		content: [this._createTextArea()],
		beginButton: this._createMentionButton(),
		endButton: this._createPostButton()
	});
	oAddPostPopover.setInitialFocus(this._oAddPostTextArea);
	
	return oAddPostPopover;
};

/**
* Adds a Text Area to the content of the Responsive Popover
* @private
* @returns {sap.ui.core.Control}
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._createTextArea = function(){
	this._oAddPostTextArea = new sap.m.TextArea(this._sId + "_addPostTextArea", {
		height: "10rem",
		width: "100%",
		placeholder: this._oLangBundle.getText("ST_ADD_POST_TEXT_AREA"),
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
	}).addStyleClass("addPostTextArea");
	
	return this._oAddPostTextArea;
};

/**
* Adds the Post button to the Responsive Popover
* @private
* @returns {sap.m.Button}
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._createPostButton = function(){
	var that = this;

	this._oAddPostButton = new sap.m.Button(this._sId + "_addPostButton", {
		text : this._oLangBundle.getText("ST_ADD_POST_BUTTON"),
		enabled: false,
		press: function() {
			that._oAddPostPopover.close();
			that._oAddPostButton.setEnabled(false);
			
			var sValueWithEmailAlias = that._oSuggestionUtil.convertTextWithFullNamesToEmailAliases(that._oAddPostTextArea.getValue(), that._aAtMentionBuffer);
			that.firePostPress({value: sValueWithEmailAlias});
			
			// clear the current text area value, old text area value and buffer
			that._oAddPostTextArea.setValue("");
			that._sTextAreaOldValue = "";
			that._aAtMentionBuffer = [];
		}
	});
	
	return this._oAddPostButton;
};

/**
* Adds the 'mention' button to the Responsive Popover
* @private
* @returns {sap.m.Button}
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._createMentionButton = function(){
	var oMentionButton = new sap.m.Button(this._sId + "_mentionButton", {
		text: "@",
		tooltip: this._oLangBundle.getText("ST_MENTION_TOOLTIP"),
		press: [function(){
			var iCursorPositionInTextArea = this._oAddPostTextArea.getDomRef("inner").selectionStart; // property "selectionStart" not available in IE8 or lower
			var aMentionButtonPressed = this._oSuggestionUtil.atMentionsButtonPressed(this._oAddPostTextArea.getValue(), iCursorPositionInTextArea);
			this._oAddPostTextArea.setValue(aMentionButtonPressed[0]);
			this._oAddPostTextArea.focus();
			this._oAddPostTextArea.selectText(aMentionButtonPressed[1], aMentionButtonPressed[1]);
			this._oAddPostTextArea.fireLiveChange({value : this._oAddPostTextArea.getValue()});
		}, this]
	});
	
	return oMentionButton;
};

/**
* Creates a Responsive Popover for the suggestion list
* @private
* @returns {sap.ui.core.Control}
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._createSuggestionPopover = function(){
	var oSuggestionPopover = new sap.m.ResponsivePopover(this._sId + "_sugestionPop", {
		showHeader: false,
		contentWidth: "25rem",
		placement: sap.m.PlacementType.Bottom,
		offsetY: -20,
		content: [this._addSuggestionList()]
	}).addStyleClass("suggestionPopover");
	oSuggestionPopover.setInitialFocus(this._oAddPostTextArea);
	
	return oSuggestionPopover;
};

/**
* Adds a list to the content of the Suggestion Popover
* @private
* @returns {sap.m.List}
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._addSuggestionList = function(){
	var oSuggestionTemplate = new sap.m.StandardListItem({
		icon: "{userImage}",
		title: "{fullName}",
		description: "{email}",	
	});
	
	this._aSuggestionModelData = [];
	this._oSuggestionModel = new sap.ui.model.json.JSONModel(this._aSuggestionModelData);
	
	this._oSuggestionList = new sap.m.List(this._sId + "_sugestionList", {
		mode: sap.m.ListMode.SingleSelectMaster,
		rememberSelections: false,
		showSeparators: sap.m.ListSeparators.None,
		selectionChange: [function(oEventData) {
			var sFullname = oEventData.getParameter("listItem").getProperty("title");
			var sEmail = oEventData.getParameter("listItem").getProperty("description");

			this._sTextAreaCurrentValue = this._oSuggestionUtil.getTextAreaValueAfterSuggestionSelected(sFullname, sEmail, this._mCurrentAtMention, this._aAtMentionBuffer, this._sTextAreaCurrentValue, sFullname === "@@notify");
			this._oAddPostTextArea.setValue(this._sTextAreaCurrentValue);	
			this._sTextAreaOldValue = this._sTextAreaCurrentValue;
			this.closeSuggestionPopover();
			this._oAddPostTextArea.selectText(this._mCurrentAtMention.endIndex + 2, this._mCurrentAtMention.endIndex + 2); //+2 to include the space at the end
		}, this]
			
	}).setModel(this._oSuggestionModel);
	
	this._oSuggestionList.bindItems("/", oSuggestionTemplate);
	
	return this._oSuggestionList;
};

/**
* Enables/Disables the 'Post' button
* @private
* @param {string} sValue
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._enableDisablePostButton = function(sValue){
	sValue.trim() !== "" ? this._oAddPostButton.setEnabled(true) : this._oAddPostButton.setEnabled(false);
};

/**
* Logic for when to fire the suggestions
* @private
* @param {string} sTextAreaCurrentValue
* @param {string} sTextAreaOldValue
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._triggerSuggestions = function(sTextAreaCurrentValue, sTextAreaOldValue){
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
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._handleAddedCharacters = function(oTextAreaChange, sTextAreaCurrentValue) {
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
						
						this._oAddPostTextArea.setValue(sTextWithoutAtChar);
						this._sTextAreaCurrentValue = sTextWithoutAtChar;
						this._aAtMentionBuffer.splice(i, 1);
						this._oAddPostTextArea.selectText(iTextAreaChangeIndex + 1, iTextAreaChangeIndex + 1);
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
* @memberOf sap.collaboration.components.controls.AddPostPopover
*/
sap.collaboration.components.controls.AddPostPopover.prototype._handleDeletedCharacters = function (oTextAreaChange, sTextAreaCurrentValue) {
	var iTextAreaChangeIndex = oTextAreaChange.changeIndex; // the index in the string where the change starts to happen
	var sTextAreaChangeChars = oTextAreaChange.charactersChanged;
	var iCharsDifference; // the difference in char(s) between the old and new text area value

	// IF the deleted char(s) is part of a @mention in the buffer
	var iAtMentionIndexInBuffer = this._oSuggestionUtil.isDeletedCharPartOfAtMentioned(this._aAtMentionBuffer, iTextAreaChangeIndex);
	if (iAtMentionIndexInBuffer !== undefined) {
		// case #1: deleted char(s) is part of a selected @mention (atMentioned === true)
		if (this._aAtMentionBuffer[iAtMentionIndexInBuffer].atMentioned === true || this._aAtMentionBuffer[iAtMentionIndexInBuffer].notifyAll ===  true) {
			this.closeSuggestionPopover();
			// get the value of the text after deletion of the whole @mention string
			this._sTextAreaCurrentValue = this._sTextAreaCurrentValue.substr(0, this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex) + 
																				this._sTextAreaCurrentValue.substr(this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex -
																				oTextAreaChange.numberOfCharsChanged + 1);
			this._oAddPostTextArea.setValue(this._sTextAreaCurrentValue);
			this._oAddPostTextArea.selectText(this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex, this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex);
			this._sTextAreaOldValue = this._sTextAreaCurrentValue;
			
			iCharsDifference = 1 + this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex - this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex; // +1 for the @
			this._aAtMentionBuffer.splice(iAtMentionIndexInBuffer, 1); // remove the @mention from the buffer
		}
		// case #2: deleted char(s) is not part of a selected @mention (atMentioned === false)
		else {
			iCharsDifference = oTextAreaChange.numberOfCharsChanged;
			var sCharBeforeAtMentionChar = sTextAreaCurrentValue[this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex - 1];
			// the deleted char(s) contains an '@' AND the char before is not an "@", remove the @mention from the buffer
			if (sTextAreaChangeChars.search("@") !== -1 && sTextAreaCurrentValue[oTextAreaChange.changeIndex - 1] !== "@") {
				this.closeSuggestionPopover();
				this._aAtMentionBuffer.splice(iAtMentionIndexInBuffer, 1);
			}
			// update the current @mention end index in the buffer and fire the suggest from the start to end index if the character before the "@" is a space, return carriage or undefined
			else if (sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n') {
				this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex -= iCharsDifference;
				// +1 to the start index to not include the '@' char and +1 to the end index to account for the last char
				var sValue = sTextAreaCurrentValue.substring(this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex + 1, this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex + 1);
				var oRegExp = new RegExp("^" + sValue);
				if (sValue !== "" && oRegExp.test("@notify")) {
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
	for (var j = iAtMentionIndexInBuffer; j < this._aAtMentionBuffer.length; j++) {
		if (iTextAreaChangeIndex < this._aAtMentionBuffer[j].startIndex) {
			this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[j], - iCharsDifference);
		}
	}
};