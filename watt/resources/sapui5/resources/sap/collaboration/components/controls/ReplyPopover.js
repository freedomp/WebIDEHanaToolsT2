/*
* ! @copyright@
*/
jQuery.sap.declare("sap.collaboration.components.controls.ReplyPopover");jQuery.sap.require("sap.collaboration.components.controls.SuggestionUtility");jQuery.sap.require("sap.collaboration.components.utils.LanguageBundle");jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.collaboration.components.resources.css.SocialProfile",".css"));jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("sap.collaboration.components.resources.css.ReplyPopover",".css"));sap.ui.core.Control.extend("sap.collaboration.components.controls.ReplyPopover",{metadata:{library:"sap.collaboration",properties:{notifyAllEnabled:{type:"boolean",group:"Behavior",defaultValue:true}},events:{postReplyPress:{parameters:{value:{type:"string"}}},moreRepliesPress:{},afterClose:{},suggest:{parameters:{value:{type:"string"}}},afterSuggestionClose:{}}},});
sap.collaboration.components.controls.ReplyPopover.prototype.init=function(){this._oLangBundle=new sap.collaboration.components.utils.LanguageBundle();this._oLogger=jQuery.sap.log.getLogger("sap.collaboration.components.controls.ReplyPopover");this._oSuggestionUtil=sap.collaboration.components.controls.SuggestionUtility;this._sId=this.getId();this._oJSONModelData=[];this._oJSONModel=new sap.ui.model.json.JSONModel(this._oJSONModelData);this._oControlToReceiveFocus;this._oSocialProfileView;this._oReplyApp;this._oReplyPage;this._oReplyTextArea;this._oReplyList;this._oReplyButton;this._oReplyHeaderBar;this._oReplyPopover=this._oReplyPopover||this._createReplyPopover();this._sTextAreaOldValue="";this._sTextAreaCurrentValue="";this._aAtMentionBuffer=[];this._oSuggestionList;this._oSuggestionPopover=this._oSuggestionPopover||this._createSuggestionPopover();this._oSuggestionModel;this._aSuggestionModelData;};
sap.collaboration.components.controls.ReplyPopover.prototype.exit=function(){if(this._oReplyPopover){this._oReplyPopover.destroy();}if(this._oSuggestionPopover){this._oSuggestionPopover.destroy();}};
sap.collaboration.components.controls.ReplyPopover.prototype.addReply=function(r){if(!jQuery.isEmptyObject(r)){this._oJSONModelData.push(r);this._oJSONModel.setData(this._oJSONModelData,true);}else{this._oReplyTextArea.focus();}};
sap.collaboration.components.controls.ReplyPopover.prototype.addReplies=function(r){if(r.data&&r.data.length!==0){var R=this._oReplyList.getItems().length;var i=r.data.length;this._oJSONModelData=r.data.concat(this._oJSONModelData);this._oJSONModel.setData(this._oJSONModelData,true);if(R!==0){this._oControlToReceiveFocus=this._oReplyList.getItems()[i];}if(r.more){this._oShowMoreBar.setVisible(true);}else{this._oShowMoreBar.setVisible(false);}}};
sap.collaboration.components.controls.ReplyPopover.prototype.openBy=function(o){this._oReplyPopover.openBy(o);};
sap.collaboration.components.controls.ReplyPopover.prototype.setBusyIndicatorDelay=function(d){this._oReplyPage.setBusyIndicatorDelay(d);return this;};
sap.collaboration.components.controls.ReplyPopover.prototype.setBusy=function(b){this._oReplyPage.setBusy(b);return this;};
sap.collaboration.components.controls.ReplyPopover.prototype.setNotifyAllEnabled=function(n){var l;n?l="ST_NO_SUGGESTIONS":l="ST_ADD_POST_NO_SUGGESTIONS";this._oSuggestionList.setProperty("noDataText",this._oLangBundle.getText(l,["@@notify"]));this.setProperty("notifyAllEnabled",n);return this;};
sap.collaboration.components.controls.ReplyPopover.prototype.getTextArea=function(){return this._oReplyTextArea;};
sap.collaboration.components.controls.ReplyPopover.prototype._addList=function(){var t=this;var r=new sap.m.FeedListItem({text:"{Text}",icon:"{Creator/ThumbnailImage}",sender:"{Creator/FullName}",timestamp:"{CreatedAt}",iconActive:false,senderPress:function(e){var R=e.getSource().getBindingContext().getObject();var m=R.Creator.Email;t._oSocialProfileView.getViewData().memberId=m;t._oSocialProfileView.rerender();t._oReplyApp.to(t._oSocialProfilePage);}}).addStyleClass("replyFeedListItem");if(!this._oReplyList){this._oReplyList=new sap.m.List(this._sId+"_replyList",{width:"25rem",items:[],noDataText:this._oLangBundle.getText("ST_REPLY_LIST_AREA"),showNoData:true,showSeparators:sap.m.ListSeparators.None,updateFinished:function(e){var l=t._oReplyList.getItems().length;if(l!==0&&t._oControlToReceiveFocus===t._oReplyTextArea){t._oReplyList.getItems()[l-1].focus();}if(t._oReplyList.getItems().length===0){t._oReplyTextArea.addStyleClass("replyTextAreaToBottom");t._oSuggestionPopover.setOffsetX(0);}else{var R=jQuery(t._oReplyList.getDomRef()).height();var i=jQuery(t._oReplyPopover.getDomRef("cont")).height();var a=jQuery(t._oReplyPage.getCustomHeader().getDomRef()).height();var b=parseInt(t._oReplyTextArea.getHeight());var c=jQuery(t._oReplyPage.getFooter().getDomRef()).height();if(R>(i-a-b-c)){t._oReplyTextArea.removeStyleClass("replyTextAreaToBottom");t._oSuggestionPopover.setOffsetX(9);}else{t._oReplyTextArea.addStyleClass("replyTextAreaToBottom");t._oSuggestionPopover.setOffsetX(0);}}t._oControlToReceiveFocus.focus();}});}this._oReplyList.setModel(this._oJSONModel);this._oReplyList.bindItems({path:"/",template:r});return this._oReplyList;},sap.collaboration.components.controls.ReplyPopover.prototype._addTextArea=function(){this._oReplyTextArea=new sap.m.TextArea(this._sId+"_replyTextArea",{height:"80px",width:"100%",placeholder:this._oLangBundle.getText("ST_REPLY_TEXT_AREA"),liveChange:[function(e){this._sTextAreaCurrentValue=e.getParameter("value");if(this._sTextAreaCurrentValue.trim()===""){this._aAtMentionBuffer=[];this.closeSuggestionPopover();}else{this._triggerSuggestions(this._sTextAreaCurrentValue,this._sTextAreaOldValue);}this._sTextAreaOldValue=this._sTextAreaCurrentValue;this._enableDisablePostButton(this._sTextAreaCurrentValue);},this]}).addStyleClass("replyTextAreaToBottom").addStyleClass("replyTextArea");this._oControlToReceiveFocus=this._oReplyTextArea;return this._oReplyTextArea;};sap.collaboration.components.controls.ReplyPopover.prototype._addSocialProfile=function(){this._oSocialProfileView=new sap.ui.view(this._sId+"_profileView",{viewData:{langBundle:this._oLangBundle,popoverPrefix:this._sId},type:sap.ui.core.mvc.ViewType.JS,viewName:"sap.collaboration.components.socialprofile.SocialProfile"});return this._oSocialProfileView;},sap.collaboration.components.controls.ReplyPopover.prototype._enableDisablePostButton=function(v){v.trim()!==""?this._oReplyButton.setEnabled(true):this._oReplyButton.setEnabled(false);};
sap.collaboration.components.controls.ReplyPopover.prototype._addApp=function(){var t=this;if(this._oReplyApp){return this._oReplyApp;}this._oReplyButton=new sap.m.Button(this._sId+"_replyButton",{text:this._oLangBundle.getText("ST_REPLY_POST"),enabled:false,press:this._postReply.bind(t)});this._oShowMoreLink=new sap.m.Link(this._sId+"_replyLink",{text:this._oLangBundle.getText("ST_SHOW_MORE_REPLIES"),press:this._showMoreReplies.bind(t)});this._oShowMoreBar=new sap.m.Bar(this._sId+"_replyBar",{contentMiddle:[this._oShowMoreLink],visible:false}).addStyleClass("showMoreReplies");this._oReplyPage=new sap.m.Page(this._sId+"_replyPage",{showHeader:true,showSubHeader:false,showFooter:true,customHeader:new sap.m.Bar({contentMiddle:[new sap.m.Label({text:this._oLangBundle.getText("ST_REPLY_TITLE")})]}),footer:new sap.m.Bar({contentRight:[this._createMentionButton(),this._oReplyButton]}),content:[this._oShowMoreBar,this._addList(),this._addTextArea()]});this._oSocialProfileButton=new sap.m.Button(this._sId+"_profileButton",{text:this._oLangBundle.getText("SP_OPEN_JAM_BUTTON"),press:function(){window.open(t._oSocialProfileView.getController().getProfileURL(),"_blank");}});this._oSocialProfilePage=new sap.m.Page(this._sId+"_profilePage",{title:this._oLangBundle.getText("SP_TITLE"),showNavButton:true,showHeader:true,showSubHeader:false,showFooter:true,navButtonPress:function(e){t._oReplyApp.back();},footer:new sap.m.Bar({contentRight:[this._oSocialProfileButton]}),content:[this._addSocialProfile()]});this._oReplyApp=new sap.m.App(this._sId+"_replyApp",{backgroundColor:"#ffffff",pages:[this._oReplyPage,this._oSocialProfilePage]});return this._oReplyApp;};
sap.collaboration.components.controls.ReplyPopover.prototype._postReply=function(){var v=this._oSuggestionUtil.convertTextWithFullNamesToEmailAliases(this._oReplyTextArea.getValue(),this._aAtMentionBuffer);this.firePostReplyPress({value:v});this._oReplyTextArea.setValue("");this._sTextAreaOldValue="";this._aAtMentionBuffer=[];this._oReplyButton.setEnabled(false);this._oControlToReceiveFocus=this._oReplyTextArea;};
sap.collaboration.components.controls.ReplyPopover.prototype._showMoreReplies=function(){this.fireMoreRepliesPress();};
sap.collaboration.components.controls.ReplyPopover.prototype._afterClose=function(){this.fireAfterClose();};
sap.collaboration.components.controls.ReplyPopover.prototype.setSuggestionData=function(s){this._aSuggestionModelData=s;if(s.length!==0&&s[s.length-1].fullName!=="@@notify"&&this.getNotifyAllEnabled()){this._aSuggestionModelData.push({fullName:"@@notify",email:this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"),userImage:"sap-icon://world"});}this._oSuggestionModel.setData(this._aSuggestionModelData);this._oSuggestionPopover.openBy(this._oReplyTextArea);};
sap.collaboration.components.controls.ReplyPopover.prototype.closeSuggestionPopover=function(){if(this._oSuggestionPopover.isOpen()===true){this._oSuggestionPopover.close();}this.fireAfterSuggestionClose();};
sap.collaboration.components.controls.ReplyPopover.prototype._createReplyPopover=function(){var r=new sap.m.ResponsivePopover(this._sId+"_replyPop",{showHeader:false,placement:sap.m.PlacementType.Vertical,contentWidth:"25rem",contentHeight:"455px",content:this._addApp(),afterClose:[function(){this._oReplyApp.backToTop();this._oReplyList.destroyItems();this._oJSONModelData=[];this._oJSONModel.setData(this._oJSONModelData);this._oShowMoreBar.setVisible(false);this._oControlToReceiveFocus=this._oReplyTextArea;this._afterClose();},this]});r.setInitialFocus(this._oReplyTextArea);return r;};
sap.collaboration.components.controls.ReplyPopover.prototype._createSuggestionPopover=function(){var s=new sap.m.ResponsivePopover(this._sId+"_suggestionPop",{showHeader:false,contentWidth:"25rem",placement:sap.m.PlacementType.Bottom,offsetY:-20,content:[this._addSuggestionList()]}).addStyleClass("suggestionPopover");s.setInitialFocus(this._oReplyTextArea);return s;};
sap.collaboration.components.controls.ReplyPopover.prototype._addSuggestionList=function(){var s=new sap.m.StandardListItem({icon:"{userImage}",title:"{fullName}",description:"{email}",});this._aSuggestionModelData=[];this._oSuggestionModel=new sap.ui.model.json.JSONModel(this._aSuggestionModelData);this._oSuggestionList=new sap.m.List(this._sId+"_suggestionList",{mode:sap.m.ListMode.SingleSelectMaster,noDataText:this._oLangBundle.getText("ST_ADD_POST_NO_SUGGESTIONS"),rememberSelections:false,showSeparators:sap.m.ListSeparators.None,selectionChange:[function(e){var f=e.getParameter("listItem").getProperty("title");var E=e.getParameter("listItem").getProperty("description");this._sTextAreaCurrentValue=this._oSuggestionUtil.getTextAreaValueAfterSuggestionSelected(f,E,this._mCurrentAtMention,this._aAtMentionBuffer,this._sTextAreaCurrentValue,f==="@@notify");this._oReplyTextArea.setValue(this._sTextAreaCurrentValue);this._sTextAreaOldValue=this._sTextAreaCurrentValue;this.closeSuggestionPopover();this._oReplyTextArea.selectText(this._mCurrentAtMention.endIndex+2,this._mCurrentAtMention.endIndex+2);},this]}).setModel(this._oSuggestionModel);this._oSuggestionList.bindItems("/",s);return this._oSuggestionList;};
sap.collaboration.components.controls.ReplyPopover.prototype._createMentionButton=function(){var m=new sap.m.Button(this._sId+"_mentionButton",{text:"@",tooltip:this._oLangBundle.getText("ST_MENTION_TOOLTIP"),press:[function(){var c=this._oReplyTextArea.getDomRef("inner").selectionStart;var M=this._oSuggestionUtil.atMentionsButtonPressed(this._oReplyTextArea.getValue(),c);this._oReplyTextArea.setValue(M[0]);this._oReplyTextArea.focus();this._oReplyTextArea.selectText(M[1],M[1]);this._oReplyTextArea.fireLiveChange({value:this._oReplyTextArea.getValue()});},this]});return m;};
sap.collaboration.components.controls.ReplyPopover.prototype._triggerSuggestions=function(t,T){var o=this._oSuggestionUtil.getChangesInTextArea(t,T);if(o.operation==="addChar"){this._handleAddedCharacters(o,t);}else if(o.operation==="deleteChar"){this._handleDeletedCharacters(o,t,this._aAtMentionBuffer);}};
sap.collaboration.components.controls.ReplyPopover.prototype._handleAddedCharacters=function(t,T){var a=t.changeIndex;var s=t.charactersChanged;var A=this._aAtMentionBuffer.length;var I=this.getNotifyAllEnabled();if(I&&s[0]==="@"&&T[a-1]==="@"&&(T[a-2]===" "||T[a-2]==="\n"||T[a-2]===undefined)){this.setSuggestionData([{fullName:"@@notify",email:this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"),userImage:"sap-icon://world"}]);for(var i=0;i<A;i++){if(this._aAtMentionBuffer[i].startIndex===a-1){this._aAtMentionBuffer[i].endIndex+=s.length;}else if(a<this._aAtMentionBuffer[i].startIndex){this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[i],s.length);}}}else if(s[0]==="@"||(s[0]===" "&&s[1]==="@")){if(s[1]==="@"){a+=1;}var c=this._oSuggestionUtil.addToAtMentionBuffer(this._aAtMentionBuffer,a,s);this._mCurrentAtMention=this._aAtMentionBuffer[c];if(s==="@ "){this._mCurrentAtMention.endIndex-=1;}var C=T[this._mCurrentAtMention.startIndex-1];if(C===" "||C===undefined||C==='\n'){this.fireSuggest({value:T.substring(a+1,a+s.length)});}else{this.closeSuggestionPopover();}}else{for(var i=A-1;i>=0;i--){if(a>this._aAtMentionBuffer[i].startIndex){var S=this._oSuggestionUtil.getStringAfterAtMention(a+s.length-1,T,this._aAtMentionBuffer[i]);var b=this._oSuggestionUtil.getStringBeforeAtMention(this._aAtMentionBuffer[i],T,a);var q=b+s+S;var r=new RegExp("^"+q);if(I&&r.test("@notify")){this._aAtMentionBuffer[i].endIndex=this._aAtMentionBuffer[i].endIndex+s.length;this._mCurrentAtMention=this._aAtMentionBuffer[i];this.setSuggestionData([{fullName:"@@notify",email:this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"),userImage:"sap-icon://world"}]);}else if(!q.match(/ /g)||(q.match(/ /g)&&q.match(/ /g).length===1)){if((this._aAtMentionBuffer[i].atMentioned===true||this._aAtMentionBuffer[i].notifyAll===true)&&a<=this._aAtMentionBuffer[i].endIndex){var d=this._aAtMentionBuffer[i].startIndex;var e=T.slice(0,d)+" "+T.slice(d+1,T.length);this._oReplyTextArea.setValue(e);this._sTextAreaCurrentValue=e;this._aAtMentionBuffer.splice(i,1);this._oReplyTextArea.selectText(a+1,a+1);this.closeSuggestionPopover();}else if(q.search("\n")===-1&&q.search("@")===-1){this._aAtMentionBuffer[i].endIndex=this._aAtMentionBuffer[i].startIndex+q.length;this._mCurrentAtMention=this._aAtMentionBuffer[i];var C=T[this._mCurrentAtMention.startIndex-1];if(C===" "||C===undefined||C==='\n'){this.fireSuggest({value:q});}}else{this.closeSuggestionPopover();}}else{this.closeSuggestionPopover();}break;}this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[i],s.length);if(i===0){this.closeSuggestionPopover();}}}};
sap.collaboration.components.controls.ReplyPopover.prototype._handleDeletedCharacters=function(t,T){var i=t.changeIndex;var s=t.charactersChanged;var c;var a=this._oSuggestionUtil.isDeletedCharPartOfAtMentioned(this._aAtMentionBuffer,i);if(a!==undefined){if(this._aAtMentionBuffer[a].atMentioned===true||this._aAtMentionBuffer[a].notifyAll===true){this.closeSuggestionPopover();this._sTextAreaCurrentValue=this._sTextAreaCurrentValue.substr(0,this._aAtMentionBuffer[a].startIndex)+this._sTextAreaCurrentValue.substr(this._aAtMentionBuffer[a].endIndex-t.numberOfCharsChanged+1);this._oReplyTextArea.setValue(this._sTextAreaCurrentValue);this._oReplyTextArea.selectText(this._aAtMentionBuffer[a].startIndex,this._aAtMentionBuffer[a].startIndex);this._sTextAreaOldValue=this._sTextAreaCurrentValue;c=1+this._aAtMentionBuffer[a].endIndex-this._aAtMentionBuffer[a].startIndex;this._aAtMentionBuffer.splice(a,1);}else{c=t.numberOfCharsChanged;var C=T[this._aAtMentionBuffer[a].startIndex-1];if(s.search("@")!==-1&&T[t.changeIndex-1]!=="@"){this.closeSuggestionPopover();this._aAtMentionBuffer.splice(a,1);}else if(C===" "||C===undefined||C==='\n'){this._aAtMentionBuffer[a].endIndex-=c;var v=T.substring(this._aAtMentionBuffer[a].startIndex+1,this._aAtMentionBuffer[a].endIndex+1);var r=new RegExp("^"+v);if(v!==""&&r.test("@notify")){this.setSuggestionData([{fullName:"@@notify",email:this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"),userImage:"sap-icon://world"}]);}else{this.fireSuggest({value:v});}}}}a=a||0;c=c||t.numberOfCharsChanged;for(var j=a;j<this._aAtMentionBuffer.length;j++){if(i<this._aAtMentionBuffer[j].startIndex){this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[j],-c);}}};