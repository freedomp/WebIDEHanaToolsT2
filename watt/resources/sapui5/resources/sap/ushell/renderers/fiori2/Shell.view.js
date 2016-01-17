// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ushell.renderers.fiori2.Navigation");jQuery.sap.require("sap.ushell.ui.shell.Shell");jQuery.sap.require("sap.ushell.UserActivityLog");sap.ui.jsview("sap.ushell.renderers.fiori2.Shell",{createContent:function(c){var t=this;var v=this.getViewData()||{},C=v.config||{},s=(C.appState==="embedded")?true:false,S=(C.appState==="headerless")?true:false,f=function(i,g){return sap.ui.getCore().byId(g.getObject());},l=new sap.ushell.ui.launchpad.LoadingDialog({id:"loadingDialog",title:null,text:"",showCancelButton:false}),o=new sap.ushell.ui.shell.ShellHeadItem({id:"configBtn",tooltip:"{i18n>showGrpsBtn_tooltip}",icon:sap.ui.core.IconPool.getIconURI("menu2"),selected:{path:"/currentState/showPane"},press:[c.togglePane,c]}),h=new sap.ushell.ui.shell.ShellHeadItem({id:"homeBtn",tooltip:"{i18n>homeBtn_tooltip}",icon:sap.ui.core.IconPool.getIconURI("home"),target:C.rootIntent?"#"+C.rootIntent:"#"});h.addEventDelegate({onsapskipback:function(E){if(sap.ushell.renderers.fiori2.AccessKeysHandler.getAppKeysHandler()){E.preventDefault();sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell=false;}},onsapskipforward:function(E){if(sap.ushell.renderers.fiori2.AccessKeysHandler.getAppKeysHandler()){E.preventDefault();sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell=false;}}});o.addEventDelegate({onsapskipforward:function(E){if(sap.ushell.renderers.fiori2.AccessKeysHandler.getAppKeysHandler()){E.preventDefault();sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell=false;}},onfocusin:function(){sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell=true;sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusPassedToExternalHandlerFirstTime=true;}});var a;if(s){new sap.ushell.ui.shell.ShellHeadItem({id:"standardActionsBtn",tooltip:"{i18n>headerActionsTooltip}",icon:sap.ui.core.IconPool.getIconURI("account"),press:[c.pressActionBtn,c]});}else if(!S){a=new sap.ushell.ui.shell.ShellHeadUserItem({id:"actionsBtn",username:sap.ushell.Container.getUser().getFullName(),tooltip:"{i18n>headerActionsTooltip}",ariaLabel:sap.ushell.Container.getUser().getFullName(),image:sap.ui.core.IconPool.getIconURI("account"),press:[c.pressActionBtn,c]});a.addEventDelegate({onsaptabnext:function(E){if(sap.ushell.renderers.fiori2.AccessKeysHandler.getAppKeysHandler()){E.preventDefault();sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell=false;}},onsapskipforward:function(E){if(sap.ushell.renderers.fiori2.AccessKeysHandler.getAppKeysHandler()){E.preventDefault();sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell=false;}}});}var n=this.initNavContainer(c);var u=new sap.ushell.ui.shell.Shell({id:"shell",showPane:{path:"/currentState/showPane"},headItems:{path:"/currentState/headItems",factory:f},headEndItems:{path:"/currentState/headEndItems",factory:f},toolAreaItems:{path:"/currentState/toolAreaItems",factory:f},toolAreaVisible:{path:"/currentState/toolAreaVisible"},floatingActions:{path:"/currentState/floatingActions",factory:f},user:a,paneContent:{path:"/currentState/paneContent",factory:f},headerHiding:{path:"/currentState/headerHiding"},headerVisible:{path:"/currentState/headerVisible"},title:{path:"/title"},content:n,subHeaders:{path:"/currentState/subHeaders",factory:f}});u._setStrongBackground(true);this.setOUnifiedShell(u);var b=u.getHeader();if(b){var d=b.onAfterRendering;b.onAfterRendering=function(){if(d){d.apply(this,arguments);}if(this.getModel().getProperty("/enableHelp")){jQuery('#actionsBtn').addClass('help-id-actionsBtn');jQuery('#configBtn').addClass('help-id-configBtn');jQuery('#homeBtn').addClass('help-id-homeBtn');}};}this.oShellPage=this.pageFactory("shellPage",u,true);if(s){u.setIcon(sap.ui.resource('sap.ui.core','themes/base/img/1x1.gif'));}else{this.initShellBarLogo(u);}this.setDisplayBlock(true);this.aDanglingControls=[sap.ui.getCore().byId('navContainer'),this.oShellPage,h,l,o];u.updateAggregation=this.updateShellAggregation;var e=(C.enableSearch!==false);if(e){t.oShellSearchBtn=new sap.ushell.ui.shell.ShellHeadItem({id:"sf",tooltip:"{i18n>searchbox_tooltip}",icon:sap.ui.core.IconPool.getIconURI("search"),visible:{path:"/searchAvailable"},showSeparator:false,press:function(g){jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');t.searchShellHelper=sap.ushell.renderers.fiori2.search.SearchShellHelper;if(sap.ui.getCore().byId('searchFieldInShell')===undefined){t.searchShellHelper.init(false);t.searchShellHelper.oSearchButton.addEventDelegate({onAfterRendering:function(E){t.searchShellHelper.openSearchFieldGroup(true);}},t.searchShellHelper.oSearchButton);}else{t.searchShellHelper.resetModel();t.searchShellHelper.openSearchFieldGroup(true);}}});if(C.openSearchAsDefault){jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');t.searchShellHelper=sap.ushell.renderers.fiori2.search.SearchShellHelper;if(sap.ui.getCore().byId('searchFieldInShell')===undefined){t.searchShellHelper.init(false);t.searchShellHelper.oSearchButton.addEventDelegate({onAfterRendering:function(E){t.searchShellHelper.openSearchFieldGroup(false);}},t.searchShellHelper.oSearchButton);}}t.oShellSearchBtn.addEventDelegate({onsapskipforward:function(E){E.preventDefault();sap.ushell.renderers.lean.AccessKeysHandler.bFocusOnShell=false;}});t.aDanglingControls.push(t.oShellSearchBtn);}this.logonIFrameReference=null;return new sap.m.App({pages:this.oShellPage});},getOUnifiedShell:function(){return this.oUnifiedShell;},setOUnifiedShell:function(u){this.oUnifiedShell=u;},loadUserImage:function(){var i=sap.ushell.Container.getUser().getImage();if(i){jQuery.ajax({url:i,headers:{'Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0'},success:function(){var a=sap.ui.getCore().byId('actionsBtn');if(a){a.setImage(i);}},error:function(){jQuery.sap.log.error("Could not load user image from: "+i,"","sap.ushell.renderers.fiori2.Shell.view");}});}},_getIconURI:function(i){var r=null;if(i){var m=/url[\s]*\('?"?([^\'")]*)'?"?\)/.exec(i);if(m){r=m[1];}}return r;},initShellBarLogo:function(u){jQuery.sap.require("sap.ui.core.theming.Parameters");var i=sap.ui.core.theming.Parameters.get("sapUiGlobalLogo");if(i){i=this._getIconURI(i);if(!i){u.setIcon(sap.ui.resource("sap.ui.core","mimes/logo/sap_50x26.png"));}}var t=this;sap.ui.getCore().attachThemeChanged(function(){if(u.bIsDestroyed){return;}var n=sap.ui.core.theming.Parameters.get("sapUiGlobalLogo");if(n){n=t._getIconURI(n);if(n){u.setIcon(n);}else{u.setIcon(sap.ui.resource("sap.ui.core","mimes/logo/sap_50x26.png"));}}else{u.setIcon(sap.ui.resource("sap.ui.core","mimes/logo/sap_50x26.png"));}});},initNavContainer:function(c){var n=new sap.m.NavContainer({id:"navContainer",afterNavigate:jQuery.proxy(c.onAfterNavigate,c)});n.addCustomTransition("slideBack",sap.m.NavContainer.transitions.slide.back,sap.m.NavContainer.transitions.slide.back);return n;},updateShellAggregation:function(n){var b=this.mBindingInfos[n],a=this.getMetadata().getJSONKeys()[n],c;jQuery.each(this[a._sGetter](),jQuery.proxy(function(i,v){this[a._sRemoveMutator](v);},this));jQuery.each(b.binding.getContexts(),jQuery.proxy(function(i,v){c=b.factory(this.getId()+"-"+i,v)?b.factory(this.getId()+"-"+i,v).setBindingContext(v,b.model):"";this[a._sMutator](c);},this));},disableBouncing:function(p){p.onBeforeRendering=function(){sap.m.Page.prototype.onBeforeRendering.apply(p);var s=this._oScroller,o=s.onAfterRendering;s.onAfterRendering=function(){o.apply(s);if(s._scroller){s._scroller.options.bounce=false;}};};return p;},getControllerName:function(){return"sap.ushell.renderers.fiori2.Shell";},pageFactory:function(i,c,d){var p=new sap.m.Page({id:i,showHeader:false,content:c,enableScrolling:!!sap.ui.Device.system.desktop}),e=["onAfterHide","onAfterShow","onBeforeFirstShow","onBeforeHide","onBeforeShow"],D={};jQuery.each(e,function(I,E){D[E]=jQuery.proxy(function(a){jQuery.each(this.getContent(),function(I,c){c._handleEvent(a);});},p);});p.addEventDelegate(D);if(d&&sap.ui.Device.system.desktop){this.disableBouncing(p);}return p;},createIFrameDialog:function(){var d=null,l=this.logonIFrameReference,c;var _=function(){if(l){l.remove();}return jQuery('<iframe id="SAMLDialogFrame" src="" frameborder="0"></iframe>');};var a=function(){d.addStyleClass('sapUshellSamlDialogHidden');jQuery('#sap-ui-blocklayer-popup').addClass('sapUshellSamlDialogHidden');};this.destroyIFrameDialog();var b=new sap.m.Button({text:sap.ushell.resources.i18n.getText("samlCloseBtn"),press:function(){sap.ushell.Container.cancelLogon();}});var h=new sap.ui.core.HTML("SAMLDialogFrame");this.logonIFrameReference=_();h.setContent(this.logonIFrameReference.prop('outerHTML'));d=new sap.m.Dialog({id:"SAMLDialog",title:sap.ushell.resources.i18n.getText("samlDialogTitle"),contentWidth:"50%",contentHeight:"50%",rightButton:b});c=sap.ushell.Container.getService("SupportTicket").isEnabled();if(c){jQuery.sap.require("sap.ushell.ui.footerbar.ContactSupportButton");var C=new sap.ushell.ui.footerbar.ContactSupportButton();C.setWidth('150px');C.setIcon('');d.setLeftButton(C);}d.addContent(h);d.open();a();this.logonIFrameReference=jQuery('#SAMLDialogFrame');return this.logonIFrameReference[0];},destroyIFrameDialog:function(){var d=sap.ui.getCore().byId('SAMLDialog');if(d){d.destroy();}this.logonIFrameReference=null;},showIFrameDialog:function(){var d=sap.ui.getCore().byId('SAMLDialog');if(d){d.removeStyleClass('sapUshellSamlDialogHidden');jQuery('#sap-ui-blocklayer-popup').removeClass('sapUshellSamlDialogHidden');}}});}());