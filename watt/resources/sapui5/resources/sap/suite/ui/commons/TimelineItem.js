/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.TimelineItem");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.suite.ui.commons.TimelineItem",{metadata:{publicMethods:["setCustomMessage"],library:"sap.suite.ui.commons",properties:{"dateTime":{type:"any",group:"Misc",defaultValue:null},"userName":{type:"string",group:"Misc",defaultValue:null},"title":{type:"string",group:"Misc",defaultValue:null},"text":{type:"string",group:"Misc",defaultValue:null},"icon":{type:"string",group:"Misc",defaultValue:null},"filterValue":{type:"string",group:"Misc",defaultValue:null},"userNameClickable":{type:"boolean",group:"Misc",defaultValue:false},"userPicture":{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},"replyCount":{type:"int",group:"Misc",defaultValue:null},"maxCharacters":{type:"int",group:"Behavior",defaultValue:null}},aggregations:{"embeddedControl":{type:"sap.ui.core.Control",multiple:false},"replyList":{type:"sap.m.List",multiple:false},"customAction":{type:"sap.ui.core.CustomData",multiple:true,singularName:"customAction"},"suggestionItems":{type:"sap.m.StandardListItem",multiple:true,singularName:"suggestionItem"},"customReply":{type:"sap.ui.core.Control",multiple:false}},events:{"userNameClicked":{},"replyPost":{},"replyListOpen":{},"customActionClicked":{},"suggest":{},"suggestionItemSelected":{}}}});sap.suite.ui.commons.TimelineItem.M_EVENTS={'userNameClicked':'userNameClicked','replyPost':'replyPost','replyListOpen':'replyListOpen','customActionClicked':'customActionClicked','suggest':'suggest','suggestionItemSelected':'suggestionItemSelected'};jQuery.sap.require("sap.m.library");jQuery.sap.require("sap.ui.core.IconPool");jQuery.sap.require("sap.ui.core.format.DateFormat");
sap.suite.ui.commons.TimelineItem.prototype.init=function(){var t=this;this._customReply=false;this._nMaxCharactersMobile=300;this._nMaxCharactersDesktop=500;var l=sap.ui.getCore().getConfiguration().getLanguage();this.resBundle=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons",l);this._showIcons=false;this._firstTime=true;this._sTextShowMore=this.resBundle.getText("TIMELINE_TEXT_SHOW_MORE");this._sTextShowLess=this.resBundle.getText("TIMELINE_TEXT_SHOW_LESS");this._replyInfoText=new sap.m.Text({maxLines:1,width:"100%"});this._replyInfoBar=new sap.m.Toolbar({id:this.getId()+"-replyInfoBar",content:[this._replyInfoText],design:sap.m.ToolbarDesign.Info,visible:false});this._replyLink=new sap.m.Link({text:this.resBundle.getText("TIMELINE_REPLY"),tooltip:this.resBundle.getText("TIMELINE_REPLY"),press:function(e){t._openReplyDialog();}});this._replyLink.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");this._jamBar=new sap.m.Toolbar({});this._replyInputArea=new sap.m.TextArea({height:"4rem",width:"100%",liveChange:function(e){t._liveChange(e);}});this._replyPop=new sap.m.Popover({initialFocus:this._replyInputArea,title:this.resBundle.getText("TIMELINE_REPLIES"),placement:sap.m.PlacementType.Vertical,footer:new sap.m.Toolbar({content:[new sap.m.ToolbarSpacer(),new sap.m.Button({text:this.resBundle.getText("TIMELINE_REPLY"),press:function(){t._replyPost();t._replyPop.close();}})]}),afterClose:function(e){if(t._list&&t._list.getItems().length){t._replyLink.setText(t.resBundle.getText("TIMELINE_REPLY")+" ("+t._list.getItems().length+")");}},contentHeight:"15rem",contentWidth:"20rem"});this._orientation="V";};
sap.suite.ui.commons.TimelineItem.prototype._replyPost=function(){var r=this._replyInputArea.getValue();this.fireReplyPost({value:r});};
sap.suite.ui.commons.TimelineItem.prototype.setReplyList=function(r){if(r===null)return;this.setAggregation("replyList",r,true);var t=this;this.getReplyList().attachUpdateFinished(function(e){var f=t._replyInputArea.getDomRef("inner");if(f){jQuery(f.id).focus();}});};
sap.suite.ui.commons.TimelineItem.prototype._openReplyDialog=function(){if(this._customReply){this.getCustomReply().openBy(this._replyLink);this.fireReplyListOpen();return;}else{this.fireReplyListOpen();this._replyInputArea.setValue('');this._oldReplyInputArea='';this._list=this.getReplyList();if(this._list!==null){this._replyPop.addContent(this._list);}this._replyPop.addContent(this._replyInputArea);this._replyPop.openBy(this._replyLink);}};
sap.suite.ui.commons.TimelineItem.prototype._createSuggestionPopup=function(i){var t=this;this._suggestionPopup=new sap.m.Popover(i.getId()+"-suggestion_popup",{showHeader:false,placement:sap.m.PlacementType.Bottom,contentWidth:"20rem",initialFocus:i}).attachAfterClose(function(){});if(this.getParent()&&this.getParent()._overwritePopover){this.getParent()._overwritePopover(this._suggestionPopup,i);}this._suggestList=new sap.m.List(this.getId()+"-suggestlist",{showNoData:false,mode:sap.m.ListMode.SingleSelectMaster,selectionChange:function(e){var I=e.getSource().getSelectedItem();t._suggestionPopup.close();var s=t._replyInputArea.getValue();var a='';var d=I.getDescription();if(d.match(/\S+@\S+\.\S+/)){a="@"+d.split('@')[0]+" ";}else{a="@"+d+" ";}var n=t.getParent()._getNewString(s,t._inputDiff.val,a);t._replyInputArea.setValue(n);t._oldReplyInputArea=n;t.fireSuggestionItemSelected({selectedItem:I});}});this._suggestionPopup.addContent(this._suggestList);};
sap.suite.ui.commons.TimelineItem.prototype._liveChange=function(e){if(this._suggestionPopup&&this._suggestionPopup.isOpen()){this._suggestionPopup.close();}var s=e.getParameters().value;if(!this.getParent()||!this.getParent().getShowSuggestion()){this._oldReplyInputArea=s;return;}var I=e.getSource();this._inputDiff=this.getParent()._getDiffWord(s,this._oldReplyInputArea);if(this._inputDiff.val.match(/^@|\s@/g)&&this._inputDiff.val.length>1){if(this._inputDiff.op==="A"){var t=this;if(!this._suggestionPopup){this._createSuggestionPopup(I);}this.fireSuggest({suggestValue:this._inputDiff.val});this._suggestList.destroyItems();var a=this.getSuggestionItems();for(var i=0;i<a.length;i++){this._suggestList.addItem(new sap.m.StandardListItem({icon:a[i].getIcon(),title:a[i].getTitle(),description:a[i].getDescription()}));}this._suggestionPopup.openBy(I);}else if(this._inputDiff.op==="D"){var n=this.getParent()._getNewString(s,this._inputDiff.val,'');this._replyInputArea.setValue(n);}}else if(this._suggestionPopup&&this._inputDiff.val.length==0){this._suggestionPopup.close();}this._oldReplyInputArea=s;};
sap.suite.ui.commons.TimelineItem.prototype._addReplyInputArea=function(e){this._replyPop.addContent(this._replyInputArea);};
sap.suite.ui.commons.TimelineItem.prototype._formatDateValue=function(d){var D;if(d instanceof Date){D=d;}else if(typeof d==="string"){if(d.indexOf("Date")!=-1){var i=d.substring(d.indexOf("(")+1,d.indexOf(")"));D=new Date(parseInt(i));}else{return d;}}else{D=new Date(parseInt(d));}var r="";var a=0,t,T=new Date();var c=T.getFullYear();var b=T.getMonth();var e=T.getDate();var f=D.getFullYear();var g=D.getMonth();var h=D.getDate();var j=Date.UTC(c,b,e);var k=Date.UTC(f,g,h);t=j.valueOf()-k.valueOf();a=Math.floor(t/(24*60*60*1000));var l=sap.ui.core.format.DateFormat.getDateInstance({style:"short"});var m=sap.ui.core.format.DateFormat.getTimeInstance({style:"short"});if(a==0){r=this.resBundle.getText('TIMELINE_TODAY');}else if(a==1){r=this.resBundle.getText('TIMELINE_YESTERDAY');}else{r=l.format(D);}r+=" "+this.resBundle.getText('TIMELINE_AT')+" "+m.format(D);return r;};
sap.suite.ui.commons.TimelineItem.prototype._getImageControl=function(){var i=this.getIcon()?this.getIcon():"activity-items";var I=this.getId()+'-icon';var p={src:i};var c=['sapSuiteUiCommonsTimelineItemIcon'];this._oImageControl=sap.m.ImageHelper.getImageControl(I,this._oImageControl,this,p,c);return this._oImageControl;};
sap.suite.ui.commons.TimelineItem.prototype._isOfTypeTimelineItem=function(){return true;};
sap.suite.ui.commons.TimelineItem.prototype.setLayout=function(p,a){this._position=p;this._alignment=a;};
sap.suite.ui.commons.TimelineItem.prototype.setUserNameClickable=function(u){this.setProperty("userNameClickable",u,true);if(!this._userNameLink){var t=this;this._userNameLink=new sap.m.Link({text:this.getUserName(),tooltip:this.getUserName(),press:function(e){t.fireUserNameClicked();}});}};
sap.suite.ui.commons.TimelineItem.prototype.setText=function(t){this.setProperty("text",t);this._textBox=this.getText();};
sap.suite.ui.commons.TimelineItem.prototype._getCollapsedText=function(){var s=this._sFullText.substring(0,this._nMaxCollapsedLength);var n=s.lastIndexOf(" ");if(n>0){this._sShortText=s.substr(0,n);}else{this._sShortText=s;}return this._sShortText;};
sap.suite.ui.commons.TimelineItem.prototype._toggleTextExpanded=function(){var $=jQuery.sap.byId(this.getId()+"-realtext");var a=jQuery.sap.byId(this.getId()+"-threeDots");if(this._bTextExpanded){$.html(jQuery.sap.encodeHTML(this._sShortText).replace(/&#xa;/g,"<br>"));a.text(" ... ");this._oLinkExpandCollapse.setText(this._sTextShowMore);this._bTextExpanded=false;}else{$.html(jQuery.sap.encodeHTML(this._sFullText).replace(/&#xa;/g,"<br>"));a.text("  ");this._oLinkExpandCollapse.setText(this._sTextShowLess);this._bTextExpanded=true;}this.getParent()._performUiChanges(this);};
sap.suite.ui.commons.TimelineItem.prototype._getLinkExpandCollapse=function(){if(!this._oLinkExpandCollapse){jQuery.sap.require("sap.m.Link");this._oLinkExpandCollapse=new sap.m.Link({text:this._sTextShowMore,press:jQuery.proxy(function(){this._toggleTextExpanded();},this)});this._bTextExpanded=false;this._oLinkExpandCollapse.setParent(this,null,true);}return this._oLinkExpandCollapse;};
sap.suite.ui.commons.TimelineItem.prototype._checkTextIsExpandable=function(){this._nMaxCollapsedLength=this.getMaxCharacters();if(this._nMaxCollapsedLength===0){if(sap.ui.Device.system.phone){this._nMaxCollapsedLength=this._nMaxCharactersMobile;}else{this._nMaxCollapsedLength=this._nMaxCharactersDesktop;}}this._sFullText=this.getText();var t=false;if(this._sFullText.length>this._nMaxCollapsedLength){t=true;}return t;};
sap.suite.ui.commons.TimelineItem.prototype.setCustomReply=function(r){if(r){this._customReply=true;this.setAggregation("customReply",r,true);}else{this._customReply=false;}};
sap.suite.ui.commons.TimelineItem.prototype.setCustomMessage=function(m){this._replyInfoText.setText(m);if(m&&m.length>0){this._replyInfoBar.setVisible(true);}else{this._replyInfoBar.setVisible(false);}this.invalidate();};
sap.suite.ui.commons.TimelineItem.prototype.onBeforeRendering=function(){if(this.getUserNameClickable()&&(!this._userNameLink)){var t=this;this._userNameLink=new sap.m.Link({text:this.getUserName(),tooltip:this.getUserName(),press:function(e){t.fireUserNameClicked();}});}if(!this._list){this._list=this.getReplyList();};if(this.getReplyCount()>0){this._replyLink.setText(this.resBundle.getText("TIMELINE_REPLY")+" ("+this.getReplyCount()+")");}else if(this._list&&this._list.getItems().length>0){this._replyLink.setText(this.resBundle.getText("TIMELINE_REPLY")+" ("+this._list.getItems().length+")");}var t=this;var a=this.getCustomAction();if(this._firstTime&&this.getParent()&&this.getParent()._aFilterList&&this.getParent().getEnableSocial()){this._jamBar.addContent(this._replyLink);}if(this._firstTime&&a&&a.length>0){for(var i=0;i<a.length;i++){var k=a[i].getKey();var v=a[i].getValue();var b=new sap.m.Link({text:a[i].getValue(),tooltip:a[i].getValue()});b.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");b.attachPress({"value":v,"key":k},function(e,d){t.fireCustomActionClicked({"value":d.value,"key":d.key,"linkObj":this});});this._jamBar.addContent(b);}this._firstTime=false;};};
sap.suite.ui.commons.TimelineItem.prototype.onAfterRendering=function(){if(this.getParent()&&this.getParent()._performUiChanges){this.getParent()._performUiChanges(this);}};
sap.suite.ui.commons.TimelineItem.prototype._getUserPictureControl=function(){var i=this.getId()+"-img";var s="2rem";var h=s;var w=s;var p={src:this.getUserPicture(),height:h,width:w};this._oUserPictureControl=sap.m.ImageHelper.getImageControl(i,this._oUserPictureControl,this,p);this._oUserPictureControl.setDensityAware(false);return this._oUserPictureControl;};
sap.suite.ui.commons.TimelineItem.prototype._setSuggestionList=function(){this._suggestList.destroyItems();var a=this.getSuggestionItems();for(var i=0;i<a.length;i++){this._suggestList.addItem(new sap.m.StandardListItem({icon:a[i].getIcon(),title:a[i].getTitle(),description:a[i].getDescription()}));}};
sap.suite.ui.commons.TimelineItem.prototype.refreshSuggestionItems=function(r){this._suggestList.setBusy(true);this.updateAggregation("suggestionItems");};
sap.suite.ui.commons.TimelineItem.prototype.updateSuggestionItems=function(){this.updateAggregation("suggestionItems");this._setSuggestionList();this._suggestList.setBusy(false);};
sap.suite.ui.commons.TimelineItem.prototype.exit=function(){if(this._oImageControl){this._oImageControl.destroy();this._oImageControl=undefined;}if(this._userNameLink){this._userNameLink.destroy();this._userNameLink=undefined;}if(this._replyLink){this._replyLink.destroy();this._replyLink=undefined;}if(this._replyPop){this._replyPop.destroy();this._replyPop=undefined;}if(this._jamBar){this._jamBar.destroy();this._jamBar=undefined;}if(this._oUserPictureControl){this._oUserPictureControl.destroy();this._oUserPictureControl=undefined;}if(this._replyInputArea){this._replyInputArea.destroy();this._replyInputArea=undefined;}if(this._replyInfoText){this._replyInfoText.destroy();this._replyInfoText=undefined;}if(this._replyInfoBar){this._replyInfoBar.destroy();this._replyInfoBar=undefined;}};
