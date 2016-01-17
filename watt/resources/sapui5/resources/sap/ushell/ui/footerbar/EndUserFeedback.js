/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
jQuery.sap.declare("sap.ushell.ui.footerbar.EndUserFeedback");jQuery.sap.require("sap.ushell.library");jQuery.sap.require("sap.m.Button");sap.m.Button.extend("sap.ushell.ui.footerbar.EndUserFeedback",{metadata:{library:"sap.ushell",properties:{"showAnonymous":{type:"boolean",group:"Misc",defaultValue:true},"showLegalAgreement":{type:"boolean",group:"Misc",defaultValue:true},"showCustomUIContent":{type:"boolean",group:"Misc",defaultValue:true},"feedbackDialogTitle":{type:"string",group:"Misc",defaultValue:null},"textAreaPlaceholder":{type:"string",group:"Misc",defaultValue:null}},aggregations:{"customUIContent":{type:"sap.ui.core.Control",multiple:true,singularName:"customUIContent"}}}});(function(){"use strict";jQuery.sap.declare("sap.ushell.ui.footerbar.EndUserFeedback");jQuery.sap.require("sap.ushell.resources");jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");sap.ushell.ui.footerbar.EndUserFeedback.prototype.init=function(){jQuery.sap.require("sap.ushell.services.Container");var u=sap.ushell.Container.getUser(),f=sap.ushell.utils.getFormFactor();this.oUserDetails={userId:u.getId(),eMail:u.getEmail()};this.translationBundle=sap.ushell.resources.i18n;this.oEndUserFeedbackService=sap.ushell.Container.getService("EndUserFeedback");this.appConfiguration=sap.ushell.services.AppConfiguration;this.oEndUserFeedbackModel=new sap.ui.model.json.JSONModel();this.oEndUserFeedbackModel.setData({feedbackViewTitle:this.translationBundle.getText("userFeedback_title"),legalAgreementViewTitle:this.translationBundle.getText("userFeedbackLegal_title"),textAreaPlaceholderText:this.translationBundle.getText("feedbackPlaceHolderHeader"),presentationStates:{showAnonymous:this.getShowLegalAgreement(),showLegalAgreement:this.getShowLegalAgreement(),showCustomUIContent:this.getShowCustomUIContent()},clientContext:{userDetails:jQuery.extend(true,{},this.oUserDetails),navigationData:{formFactor:f,applicationInformation:{},navigationHash:null}},isAnonymous:true,applicationIconPath:'',leftButton:{feedbackView:this.translationBundle.getText("sendBtn"),legalAgreementView:this.translationBundle.getText("approveBtn")},rightButton:{feedbackView:this.translationBundle.getText("cancelBtn"),legalAgreementView:this.translationBundle.getText("declineBtn")},states:{isLegalAgreementChecked:false,isRatingSelected:false,isInFeedbackView:true},technicalLink:{state:0,title:[this.translationBundle.getText("technicalDataLink"),this.translationBundle.getText("technicalDataLinkHide")]},textArea:{inputText:''},contextText:'',ratingButtons:[{text:sap.ushell.resources.i18n.getText("ratingExcellentText"),color:'sapUshellRatingLabelFeedbackPositiveText',iconSymbol:'sap-icon://BusinessSuiteInAppSymbols/icon-face-very-happy',id:'rateBtn1',index:1},{text:sap.ushell.resources.i18n.getText("ratingGoodText"),color:'sapUshellRatingLabelFeedbackPositiveText',iconSymbol:'sap-icon://BusinessSuiteInAppSymbols/icon-face-happy',id:'rateBtn2',index:2},{text:sap.ushell.resources.i18n.getText("ratingAverageText"),color:'sapUshellRatingLabelFeedbackNeutralText',iconSymbol:'sap-icon://BusinessSuiteInAppSymbols/icon-face-neutral',id:'rateBtn3',index:3},{text:sap.ushell.resources.i18n.getText("ratingPoorText"),color:'sapUshellRatingLabelFeedbackCriticalText',iconSymbol:'sap-icon://BusinessSuiteInAppSymbols/icon-face-bad',id:'rateBtn4',index:4},{text:sap.ushell.resources.i18n.getText("ratingVeyPoorText"),color:'sapUshellRatingLabelFeedbackNegativeText',iconSymbol:'sap-icon://BusinessSuiteInAppSymbols/icon-face-very-bad',id:'rateBtn5',index:5}],selectedRating:{text:'',color:'',index:0}});this.setIcon('sap-icon://marketing-campaign');this.setWidth('100%');this.setText(sap.ushell.resources.i18n.getText("endUserFeedbackBtn"));this.setTooltip(sap.ushell.resources.i18n.getText("endUserFeedbackBtn_tooltip"));this.attachPress(this.ShowEndUserFeedbackDialog);this.setEnabled();};sap.ushell.ui.footerbar.EndUserFeedback.prototype.ShowEndUserFeedbackDialog=function(){this.updateModelContext();if(this.oDialog){this.updateTechnicalInfo();this.oDialog.open();return;}jQuery.sap.require("sap.ui.layout.form.SimpleForm");jQuery.sap.require("sap.ui.layout.HorizontalLayout");jQuery.sap.require("sap.ui.layout.VerticalLayout");jQuery.sap.require("sap.m.TextArea");jQuery.sap.require("sap.m.Link");jQuery.sap.require("sap.m.Label");jQuery.sap.require("sap.m.Text");jQuery.sap.require("sap.m.Dialog");jQuery.sap.require("sap.m.Button");jQuery.sap.require("sap.m.Image");var m=jQuery.sap.getModulePath("sap.ushell"),d=m+'/themes/base/img/launchpadDefaultIcon.jpg',i=this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/formFactor')==='desktop';this.oLegalAgreementInfoLayout=null;this.oBackButton=new sap.m.Button('endUserFeedbackBackBtn',{visible:{path:"/states/isInFeedbackView",formatter:function(I){return!I;}},icon:sap.ui.core.IconPool.getIconURI("nav-back"),press:function(){this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView',true);}.bind(this),tooltip:sap.ushell.resources.i18n.getText("feedbackGoBackBtn_tooltip")});this.oPopoverTitle=new sap.m.Text("PopoverTitle",{text:{parts:[{path:'/states/isInFeedbackView'},{path:'/feedbackViewTitle'}],formatter:function(I){return this.oEndUserFeedbackModel.getProperty(I?"/feedbackViewTitle":"/legalAgreementViewTitle");}.bind(this)}});this.oHeadBar=new sap.m.Bar({contentLeft:[this.oBackButton],contentMiddle:[this.oPopoverTitle]});this.oLogoImg=new sap.m.Image('sapFeedbackLogo',{src:d,width:'4.5rem',height:'4.5rem',visible:{path:'/applicationIconPath',formatter:function(b){return!b;}}});this.oAppIcon=new sap.ui.core.Icon('sapFeedbackAppIcon',{src:'{/applicationIconPath}',width:'4.5rem',height:'4.5rem',visible:{path:'/applicationIconPath',formatter:function(b){return!!b;}}}).addStyleClass("sapUshellFeedbackAppIcon");this.oContextName=new sap.m.Text('contextName',{text:'{/contextText}'});this.oContextLayout=new sap.ui.layout.HorizontalLayout('contextLayout',{content:[this.oLogoImg,this.oAppIcon,this.oContextName]});this.oRatingLabel=new sap.m.Label('ratingLabel',{required:true,text:sap.ushell.resources.i18n.getText("ratingLabelText")});this.oRatingSelectionText=new sap.m.Text('ratingSelectionText',{text:{path:'/selectedRating',formatter:function(s){if(this.lastSelectedColor){this.removeStyleClass(this.lastSelectedColor);}if(s.color){this.addStyleClass(s.color);}this.lastSelectedColor=s.color;return s.text;}}});this.oRatingButtonTemplate=new sap.m.Button({icon:'{iconSymbol}',height:'100%',width:'20%'});this.oRatingButtons=new sap.m.SegmentedButton('ratingButtons',{width:"98%",selectedButton:'noDefalut',buttons:{path:"/ratingButtons",template:this.oRatingButtonTemplate},select:function(e){var I=e.mParameters.id,p=sap.ui.getCore().byId(I).getBindingContext().getPath(),b=this.oEndUserFeedbackModel.getProperty(p);this.oEndUserFeedbackModel.setProperty('/selectedRating',{text:b.text,color:b.color,index:b.index});this.oEndUserFeedbackModel.setProperty('/states/isRatingSelected',true);}.bind(this)});this.oRatingButtons.addAriaLabelledBy("ratingLabel");if(i){this.oRatingIndicationLayout=new sap.ui.layout.HorizontalLayout('ratingIndicationLayout',{content:[this.oRatingLabel,this.oRatingSelectionText]});}else{this.oRatingIndicationLayout=new sap.ui.layout.VerticalLayout('ratingIndicationLayoutMob',{content:[this.oRatingLabel,this.oRatingSelectionText]});}this.oRatingLayout=new sap.ui.layout.VerticalLayout('ratingLayout',{width:"100%",content:[this.oRatingIndicationLayout,this.oRatingButtons]});this.oAnonymousCheckbox=new sap.m.CheckBox('anonymousCheckbox',{name:'anonymousCheckbox',visible:'{/presentationStates/showAnonymous}',text:sap.ushell.resources.i18n.getText("feedbackSendAnonymousText"),selected:'{/isAnonymous}',select:function(e){var c=e.getParameter("selected");this._handleAnonymousSelection(c);}.bind(this)});var a=(!this.oEndUserFeedbackModel.getProperty("/presentationStates/showAnonymous")||this.oEndUserFeedbackModel.getProperty("/isAnonymous"));this._handleAnonymousSelection(a);this.oLegalAgrementCheckbox=new sap.m.CheckBox('legalAgreement',{name:'legalAgreement',visible:'{/presentationStates/showLegalAgreement}',selected:'{/states/isLegalAgreementChecked}',text:this.translationBundle.getText("agreementAcceptanceText")});this.oLegalAgreeementLink=new sap.m.Link('legalAgreementLink',{text:this.translationBundle.getText("legalAgreementLinkText"),visible:'{/presentationStates/showLegalAgreement}',press:function(){var p=this.oEndUserFeedbackService.getLegalText();p.done(this._showLegalAgreementInfo.bind(this));}.bind(this)});this.aCustomUIContent=jQuery.extend([],this.getCustomUIContent());this.oCustomUILayout=new sap.ui.layout.VerticalLayout('customUILayout',{visible:{path:'/presentationStates/showCustomUIContent',formatter:function(s){return(s&&this.aCustomUIContent.length)?true:false;}.bind(this)},content:this.getCustomUIContent(),width:"100%"});this.oLegalLayout=new sap.ui.layout.VerticalLayout('legalLayout',{content:[this.oAnonymousCheckbox,this.oLegalAgrementCheckbox,this.oLegalAgreeementLink]});this.oTechnicalDataLink=new sap.m.Link('technicalDataLink',{text:{path:'/technicalLink/state',formatter:function(s){return this.getModel().getProperty('/technicalLink/title/'+s);}},press:function(){var _=this.oEndUserFeedbackModel.getProperty("/technicalLink/state");this.oEndUserFeedbackModel.setProperty('/technicalLink/state',Math.abs(_-1));}.bind(this)});this.oTechnicalDataLayout=new sap.ui.layout.HorizontalLayout('technicalDataLayout',{content:[this.oTechnicalDataLink]});this.leftButton=new sap.m.Button("EndUserFeedbackLeftBtn",{text:{path:"/states/isInFeedbackView",formatter:function(I){return this.getModel().getProperty('/leftButton/'+(I?'feedbackView':'legalAgreementView'));}},enabled:{parts:[{path:'/states/isInFeedbackView'},{path:'/states/isLegalAgreementChecked'},{path:'/states/isRatingSelected'},{path:'/presentationStates/showLegalAgreement'}],formatter:function(I,b,c,s){return!I||(c&&(b||!s));}},press:function(){var I=this.oEndUserFeedbackModel.getProperty("/states/isInFeedbackView");if(I){var f={feedbackText:this.oEndUserFeedbackModel.getProperty('/textArea/inputText'),ratings:[{questionId:"Q10",value:this.oEndUserFeedbackModel.getProperty('/selectedRating/index')}],clientContext:this.oEndUserFeedbackModel.getProperty('/clientContext'),isAnonymous:this.oEndUserFeedbackModel.getProperty('/isAnonymous')},p=this.oEndUserFeedbackService.sendFeedback(f);p.done(function(){sap.ushell.Container.getService("Message").info(this.translationBundle.getText('feedbackSendToastTxt'));}.bind(this));p.fail(function(){sap.ushell.Container.getService("Message").error(this.translationBundle.getText('feedbackFailedToastTxt'));}.bind(this));this.oDialog.close();}else{this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView',true);this.oEndUserFeedbackModel.setProperty('/states/isLegalAgreementChecked',true);}}.bind(this)});this.rightButton=new sap.m.Button("EndUserFeedbackRightBtn",{text:{path:"/states/isInFeedbackView",formatter:function(I){return this.getModel().getProperty('/rightButton/'+(I?'feedbackView':'legalAgreementView'));}},press:function(){var I=this.oEndUserFeedbackModel.getProperty("/states/isInFeedbackView");if(I){this.oDialog.close();}else{this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView',true);this.oEndUserFeedbackModel.setProperty('/states/isLegalAgreementChecked',false);}}.bind(this)});this.oTextArea=new sap.m.TextArea("feedbackTextArea",{rows:6,value:'{/textArea/inputText}',placeholder:'{/textAreaPlaceholderText}'});this.oTextArea.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({key:"aria-label",value:this.oEndUserFeedbackModel.getProperty('/textAreaPlaceholderText'),writeToDom:true}));this.oDialog=new sap.m.Dialog({id:"UserFeedbackDialog",contentWidth:"25rem",leftButton:this.leftButton,rightButton:this.rightButton,stretchOnPhone:true,initialFocus:"textArea",afterOpen:function(){jQuery("#textArea").on("focusout",function(){window.scrollTo(0,0);});}}).addStyleClass("sapUshellEndUserFeedbackDialog");this.oDialog.setModel(this.oEndUserFeedbackModel);this.oDialog.setCustomHeader(this.oHeadBar);this.oDialog.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({key:"aria-label",value:this.translationBundle.getText("endUserFeedbackAreaLabel"),writeToDom:true}));this.oTechnicalInfoBoxLayout=this._createTechnicalDataContent();this.oFeedbackLayout=new sap.ui.layout.VerticalLayout('feedbackLayout',{visible:'{/states/isInFeedbackView}',content:[this.oContextLayout,this.oRatingLayout,this.oTextArea,this.oTechnicalDataLayout,this.oTechnicalInfoBoxLayout,this.oLegalLayout,this.oCustomUILayout]}).addStyleClass("sapUshellFeedbackLayout");this.oMainLayout=new sap.ui.layout.VerticalLayout("mainLayout",{editable:false,content:[this.oFeedbackLayout]});this.oDialog.addContent(this.oMainLayout);this.oDialog.open();};sap.ushell.ui.footerbar.EndUserFeedback.prototype._handleAnonymousSelection=function(c){var a=this.translationBundle.getText('feedbackAnonymousTechFld');this.oEndUserFeedbackModel.setProperty('/isAnonymous',c);this.oEndUserFeedbackModel.setProperty('/clientContext/userDetails/eMail',c?a:this.oUserDetails.eMail);this.oEndUserFeedbackModel.setProperty('/clientContext/userDetails/userId',c?a:this.oUserDetails.userId);};sap.ushell.ui.footerbar.EndUserFeedback.prototype._createTechnicalDataContent=function(){this.oTechnicalInfoBox=new sap.ui.layout.form.SimpleForm('feedbackTechnicalInfoBox',{layout:sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout,content:this.getTechnicalInfoContent()});if(sap.ui.Device.os.ios&&sap.ui.Device.system.phone){this.oTechnicalInfoBox.addStyleClass("sapUshellContactSupportFixWidth");}var o=this.oTechnicalInfoBox.onAfterRendering;this.oTechnicalInfoBox.onAfterRendering=function(){o.apply(this,arguments);var n=jQuery(this.getDomRef());n.attr("tabIndex",0);jQuery.sap.delayedCall(700,n,function(){this.focus();});};return new sap.ui.layout.HorizontalLayout('technicalInfoBoxLayout',{visible:{path:'/technicalLink/state',formatter:function(s){return s===1;}},content:[this.oTechnicalInfoBox]});};sap.ushell.ui.footerbar.EndUserFeedback.prototype._createLegalAgreementLayout=function(l){this.oLegalText=new sap.m.TextArea('legalText',{cols:50,rows:22});this.oLegalText.setValue([l]);this.oLegalText.setEditable(false);var o=this.oLegalText.onAfterRendering;this.oLegalText.onAfterRendering=function(){if(o){o.apply(this,arguments);}var j=jQuery(this.getDomRef());j.find("textarea").attr("tabindex","0");};this.oLegalAgreementInfoLayout=new sap.ui.layout.VerticalLayout('legalAgreementInfoLayout',{visible:{path:"/states/isInFeedbackView",formatter:function(i){return!i;}},content:[this.oLegalText]});this.oMainLayout.addContent(this.oLegalAgreementInfoLayout);};sap.ushell.ui.footerbar.EndUserFeedback.prototype._showLegalAgreementInfo=function(l){this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView',false);if(!this.oLegalAgreementInfoLayout){this._createLegalAgreementLayout(l);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.addCustomUIContent=function(c){var i=c&&c.getMetadata&&c.getMetadata().getStereotype&&c.getMetadata().getStereotype()==='control';if(i){if(this.getShowCustomUIContent()){this.oEndUserFeedbackModel.setProperty('/presentationStates/showCustomUIContent',true);}this.addAggregation('customUIContent',c);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.setShowAnonymous=function(v){if(typeof v==='boolean'){this.oEndUserFeedbackModel.setProperty('/presentationStates/showAnonymous',v);this.setProperty('showAnonymous',v,true);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.setShowLegalAgreement=function(v){if(typeof v==='boolean'){this.oEndUserFeedbackModel.setProperty('/presentationStates/showLegalAgreement',v);this.setProperty('showLegalAgreement',v,true);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.setShowCustomUIContent=function(v){if(typeof v==='boolean'){this.oEndUserFeedbackModel.setProperty('/presentationStates/showCustomUIContent',v);this.setProperty('showCustomUIContent',v,true);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.setFeedbackDialogTitle=function(v){if(typeof v==='string'){this.oEndUserFeedbackModel.setProperty('/feedbackViewTitle',v);this.setProperty('feedbackDialogTitle',v,true);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.setTextAreaPlaceholder=function(v){if(typeof v==='string'){this.oEndUserFeedbackModel.setProperty('/textAreaPlaceholderText',v);this.setProperty('textAreaPlaceholder',v,true);}};sap.ushell.ui.footerbar.EndUserFeedback.prototype.updateModelContext=function(){var u=sap.ushell.Container.getService("URLParsing"),h,p,i,c,s,U;h=u.getShellHash(window.location);p=u.parseShellHash(h);i=(p!==undefined)?p.semanticObject+"-"+p.action:"";c=this.getModel().getProperty("/currentState/stateName");if(c==="home"||c==="catalog"){s=this.translationBundle.getText(c+'_title');}this.currentApp=this.appConfiguration.getCurrentAppliction();this.bHasAppName=(this.currentApp&&this.appConfiguration.getMetadata(this.currentApp)&&this.appConfiguration.getMetadata(this.currentApp).title);this.sAppIconPath=(this.currentApp&&this.appConfiguration.getMetadata(this.currentApp)&&this.appConfiguration.getMetadata(this.currentApp).icon);this.oEndUserFeedbackModel.setProperty('/contextText',this.bHasAppName?this.appConfiguration.getMetadata(this.currentApp).title:this.translationBundle.getText('feedbackHeaderText'));U=null;if(this.currentApp&&this.currentApp.url){U=this.currentApp.url.split('?')[0];}else if(c){U=this.translationBundle.getText("flp_page_name");}this.oEndUserFeedbackModel.setProperty('/clientContext/navigationData/applicationInformation',{url:U,additionalInformation:(this.currentApp&&this.currentApp.additionalInformation)?this.currentApp.additionalInformation:null,applicationType:(this.currentApp&&this.currentApp.applicationType)?this.currentApp.applicationType:null});this.oEndUserFeedbackModel.setProperty('/clientContext/navigationData/navigationHash',s?s:i);this.oEndUserFeedbackModel.setProperty('/selectedRating',{text:'',color:'',index:0});this.oEndUserFeedbackModel.setProperty('/states/isRatingSelected',false);this.oEndUserFeedbackModel.setProperty('/states/isLegalAgreementChecked',false);this.oEndUserFeedbackModel.setProperty('/technicalLink/state',0);this.oEndUserFeedbackModel.setProperty('/textArea/inputText','');this.oEndUserFeedbackModel.setProperty('/applicationIconPath',this.sAppIconPath);this._handleAnonymousSelection(true);};sap.ushell.ui.footerbar.EndUserFeedback.prototype.updateTechnicalInfo=function(){this.oTechnicalInfoBox.destroyContent();this.oTechnicalInfoBox.removeAllContent();var t=this.getTechnicalInfoContent(),c;for(c in t){this.oTechnicalInfoBox.addContent(t[c]);}this.oRatingButtons.setSelectedButton('noDefalut');};sap.ushell.ui.footerbar.EndUserFeedback.prototype.getTechnicalInfoContent=function(){var f=[],F=this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/formFactor'),u=this.oEndUserFeedbackModel.getProperty('/clientContext/userDetails/userId'),e=this.oEndUserFeedbackModel.getProperty('/clientContext/userDetails/eMail'),a=this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/applicationInformation/url'),A=this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/applicationInformation/applicationType'),s=this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/applicationInformation/additionalInformation'),n=this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/navigationHash'),c=this.getModel().getProperty("/currentState/stateName"),d=(c==="home"||c==="catalog")?false:true;f.push(new sap.m.Text({text:this.translationBundle.getText("loginDetails")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));f.push(u?new sap.m.Label({text:this.translationBundle.getText("userFld")}):null);f.push(u?new sap.m.Text('technicalInfoUserIdTxt',{text:'{/clientContext/userDetails/userId}'}):null);f.push(e?new sap.m.Label({text:this.translationBundle.getText("eMailFld")}):null);f.push(e?new sap.m.Text({text:'{/clientContext/userDetails/eMail}'}):null);f.push(F?new sap.m.Label({text:this.translationBundle.getText('formFactorFld')}):null);f.push(F?new sap.m.Text({text:'{/clientContext/navigationData/formFactor}'}):null);f.push(new sap.m.Text({text:''}));f.push(new sap.m.Text({text:this.translationBundle.getText(this.currentApp?'applicationInformationFld':'feedbackHeaderText')}).addStyleClass('sapUshellEndUserFeedbackHeaderInfoText').addStyleClass("sapUshellEndUserFeedbackInfoTextSpacing"));f.push(a&&d?new sap.m.Label({text:this.translationBundle.getText("urlFld")}):null);f.push(a&&d?new sap.m.Text({text:'{/clientContext/navigationData/applicationInformation/url}'}):null);f.push(A?new sap.m.Label({text:this.translationBundle.getText("applicationTypeFld")}):null);f.push(A?new sap.m.Text({text:'{/clientContext/navigationData/applicationInformation/applicationType}'}):null);f.push(s?new sap.m.Label({text:this.translationBundle.getText("additionalInfoFld")}):null);f.push(s?new sap.m.Text({text:'{/clientContext/navigationData/applicationInformation/additionalInformation}'}):null);f.push(n&&d?new sap.m.Label({text:this.translationBundle.getText("hashFld")}):null);f.push(n&&d?new sap.m.Text({text:'{/clientContext/navigationData/navigationHash}'}):null);return f.filter(Boolean);};sap.ushell.ui.footerbar.EndUserFeedback.prototype.setEnabled=function(e){if(!sap.ushell.Container){if(this.getEnabled()){jQuery.sap.log.warning("Disabling 'End User Feedback' button: unified shell container not initialized",null,"sap.ushell.ui.footerbar.EndUserFeedback");}e=false;}sap.m.Button.prototype.setEnabled.call(this,e);};}());
