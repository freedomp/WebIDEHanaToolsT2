/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright
		2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/Metadata','sap/m/IconTabBar','sap/ui/core/CustomData','sap/m/IconTabFilter'],function(q,M,I,C,a){"use strict";var b=M.createClass("sap.uxap._helpers.ITB",{constructor:function(o){this._oObjectPageLayout=o;}});b.prototype.getObjectPageLayout=function(){return this._oObjectPageLayout;};b.prototype._updateIconTabBar=function(){if(!this.getObjectPageLayout().isFirstRendering()&&this.getObjectPageLayout().getUseIconTabBar()){this._buildIconTabBar();}};b.prototype._buildIconTabBar=function(){var i,s,S=this.getObjectPageLayout().getSections()||[],o=this._getIconTabBar(),c=this.getObjectPageLayout().isFirstRendering();o.removeAllItems();if(S.length<=1){return;}S.forEach(function(d){if(c&&(!d.getVisible()||!d._getInternalVisible())){return;}i=new a({text:d.getTitle()});if(!s){s=i.getId();o.setSelectedKey(s);}i.addCustomData(new C({key:'selectedSection',value:d}));o.addItem(i);if(this.getObjectPageLayout()._oSectionInfo[d.getId()]){this.getObjectPageLayout()._oSectionInfo[d.getId()].filterId=i.getId();}},this);};b.prototype._getIconTabBar=function(){var i=this.getObjectPageLayout().getAggregation("_iconTabBar");if(!i){i=new I(this.getObjectPageLayout().getId()+"-iconTabBar",{expandable:false,applyContentPadding:false});i.attachSelect(this._onIconTabFilterSelect,this);this.getObjectPageLayout().setAggregation("_iconTabBar",i);}return i;};b.prototype._onIconTabFilterSelect=function(e){var s=e.getParameter('item').data('selectedSection'),S=0;if(this._oSelectedSection&&this._oSelectedSection!==s){this._renderSection(s);this._oSelectedSection=s;if(this.getObjectPageLayout()._bStickyAnchorBar){this.getObjectPageLayout().scrollToSection(s.sId,S);}}};b.prototype._setFacetInitialVisibility=function(){var s=this.getObjectPageLayout().getSections(),i=this.getObjectPageLayout().isFirstRendering(),o=this._getIconTabBar(),c=null;this._oSelectedSection=null;s.forEach(function(S){if(i&&(!S.getVisible()||!S._getInternalVisible())){return;}if(!this._oSelectedSection){this._oSelectedSection=S;S.setProperty('visible',true,false);}else{if(this._oSelectedSection!==S){S.setProperty('visible',false,false);}}if(!c){c=o.getItems()[0];o.setSelectedKey(c.getId());}},this);};b.prototype._renderSection=function(s){var r=sap.ui.getCore().createRenderManager();var $=this.getObjectPageLayout()._getContainerElement();if(s&&$){s.setProperty('visible',true,true);r.renderControl(s);r.flush($);}r.destroy();};b._enrichPrototypeWithITBMutators=function(c){c.prototype.addSection=function(s){var r=this.addAggregation("sections",s);this._oITBHelper._updateIconTabBar();return r;};c.prototype.insertSection=function(s,i){var r=this.insertAggregation("sections",s,i);this._oITBHelper._updateIconTabBar();return r;};c.prototype.removeSection=function(s){var r=this.removeAggregation("sections",s);this._oITBHelper._updateIconTabBar();return r;};c.prototype.removeAllSections=function(){var r=this.removeAllAggregation("sections");this._oITBHelper._updateIconTabBar();return r;};c.prototype.destroySections=function(){var r=this.destroyAggregation("sections");this._oITBHelper._updateIconTabBar();return r;};};return b;},false);