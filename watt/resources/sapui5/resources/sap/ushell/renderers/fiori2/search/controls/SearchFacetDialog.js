(function(){"use strict";jQuery.sap.require('sap.m.Dialog');jQuery.sap.require('sap.ushell.renderers.fiori2.search.FacetItem');sap.m.Dialog.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetDialog',{constructor:function(o){var t=this;t.facetListPosition=0;t.settingContainerPosition=0;t.separatorPosition=1;t.attributeListPosition=2;t.advancedPosition=3;t.sortingSelectPosition=0;t.showOnTopCheckBoxPosition=1;t.bSingleCall=false;o=jQuery.extend({},{showHeader:false,horizontalScrolling:false,verticalScrolling:false,beginButton:new sap.m.Button({text:sap.ushell.resources.i18n.getText("okDialogBtn"),press:function(e){t.onOkClick(e);t.close();t.destroy();}}),endButton:new sap.m.Button({text:sap.ushell.resources.i18n.getText("cancelDialogBtn"),press:function(e){t.close();t.destroy();}}),content:[t.createContainer()]},o);t.selectedAttribute=o.selectedAttribute?o.selectedAttribute:"";sap.m.Dialog.prototype.constructor.apply(this,[o]);this.addStyleClass('sapUiSizeCompact');this.addStyleClass('sapUshellSearchFacetDialog');},renderer:'sap.m.DialogRenderer',createContainer:function(){var t=this;t.oSplitContainer=new sap.m.SplitContainer({masterPages:t.masterPagesFactory()});t.oSplitContainer.bindAggregation("detailPages","/facetDialog",function(i,c){return t.detailPagesFactory(i,c);});t.oSplitContainer.addStyleClass('sapUshellSearchFacetDialogContainer');return t.oSplitContainer;},masterPagesFactory:function(){var t=this;var f=new sap.m.List({mode:sap.m.ListMode.SingleSelectMaster,selectionChange:function(e){t.onMasterPageSelectionChange(e);}});f.bindAggregation("items","/facetDialog",function(I,c){var l=new sap.m.StandardListItem({title:"{title}",infoState:"Success"});var F=c.oModel.getProperty(c.sPath).facetType;var a=c.oModel.getProperty(c.sPath).items;var b=0;for(var i=0;i<a.length;i++){if(a[i].selected){b++;}}if(b>0){if(F==="attribute"){l.setCounter(b);}}if(F==="search"){l.addStyleClass('sapUshellSearchFacetDialogListItemBold');}return l;});var m=new sap.m.ScrollContainer({height:'100%',horizontal:false,vertical:true,content:[f]}).addStyleClass('sapUshellSearchFacetDialogMasterContainer');m.addEventDelegate({onAfterRendering:function(e){if(t.selectedAttribute){for(var i=0;i<f.getItems().length;i++){var l=f.getItems()[i];var b=l.getBindingContext().getObject();if(t.selectedAttribute===b.dimension){f.setSelectedItem(l);}}}if(!f.getSelectedItem()){f.setSelectedItem(f.getItems()[0]);}var s=f.getSelectedItem();t.updateDetailPage(s);}});var M=[m];return M;},onMasterPageSelectionChange:function(e){var t=this;var l=e.mParameters.listItem;t.updateDetailPage(l);},detailPagesFactory:function(I,c){var t=this;var f=c.oModel.getProperty(c.sPath).facetType;var a=c.oModel.getProperty(c.sPath).items;var b=0;for(var i=0;i<a.length;i++){if(a[i].selected){b++;}}var s=new sap.m.Select({items:[new sap.ui.core.Item({text:sap.ushell.resources.i18n.getText("notSorted"),key:"notSorted"}),new sap.ui.core.Item({text:sap.ushell.resources.i18n.getText("sortByCount"),key:"sortCount"}),new sap.ui.core.Item({text:sap.ushell.resources.i18n.getText("sortByName"),key:"sortName"})],selectedKey:"notSorted",change:function(E){t.onSelectChange(E);}}).addStyleClass('sapUshellSearchFacetDialogSettingsSelect');var C=new sap.m.CheckBox({text:"Show Selected on Top",enabled:b>0?true:false,select:function(E){t.onCheckBoxSelect(E);}});var S=new sap.ui.layout.VerticalLayout({content:[s,C]}).addStyleClass('sapUshellSearchFacetDialogSettingsContainer');S.setVisible(false);var l=new sap.m.List({includeItemInSelection:true,showNoData:false,showSeparators:sap.m.ListSeparators.None,selectionChange:function(E){t.onDetailPageSelectionChange(E);}}).addStyleClass('sapUshellSearchFacetDialogDetailPageList');if(f==="attribute"){l.setMode(sap.m.ListMode.MultiSelect);}else{l.setMode(sap.m.ListMode.SingleSelectMaster);}var B={path:"items",factory:function(I,c){var j=c.oModel.getProperty(c.sPath);var k=new sap.m.StandardListItem({title:"{label}",tooltip:"{label}"+"  "+"{value}",info:"{valueLabel}",selected:j.selected});if(!t.bSingleCall&&j.selected&&!c.oModel.hasFilter(j)){c.oModel.aFilters.push(j);}return k;}};B.filters=new sap.ui.model.Filter("advanced",sap.ui.model.FilterOperator.NE,true);l.bindAggregation("items",B);var L=new sap.m.ScrollContainer({height:'67.2%',horizontal:false,vertical:true,content:[l]}).addStyleClass('sapUshellSearchFacetDialogDetailPageListContainer');var o=new sap.m.StandardListItem({});var d=new sap.m.List({items:[o],showSeparators:sap.m.ListSeparators.None}).addStyleClass('sapUshellSearchFacetDialogDetailPageSeparator');var e=c.oModel.getProperty(c.sPath).items[0].filterCondition;var D=t.getAttributeDataType(e);var A=t.advancedConditionFactory(D);var g=new sap.m.ScrollContainer({height:'32%',horizontal:false,vertical:true,content:[A]}).addStyleClass('sapUshellSearchFacetDialogDetailPageAdvancedContainer');g.data('dataType',D);t.updateAdvancedConditions(g,a,D);var p=new sap.m.Page({showHeader:true,title:sap.ushell.resources.i18n.getText("filters"),subHeader:new sap.m.Toolbar({content:[new sap.m.SearchField({placeholder:sap.ushell.resources.i18n.getText("filterPlaceholder"),liveChange:function(E){t.onSearchFieldLiveChange(E);}}),new sap.m.ToggleButton({icon:"sap-icon://sort",press:function(E){t.onSettingButtonPress(E);}})]}),content:[S,d,L,g]}).addStyleClass('sapUshellSearchFacetDialogDetailPage');if(f==="datasource"){p.destroySubHeader();}if(f==="search"){p.getSubHeader().removeContent(1);var h=c.oModel.getProperty('/searchBoxTerm');p.getSubHeader().getContent()[0].setValue(h);}return p;},advancedConditionFactory:function(t){var a=this;var A=new sap.m.CheckBox({select:function(e){a.updateCountInfo(e.getSource().getParent().getParent().getParent());}}).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionCheckBox');var i;switch(t){case'date':i=new sap.m.DateRangeSelection({width:'90%',change:function(e){a.onDateRangeSelectionChange(e);}}).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');break;case'string':i=new sap.m.Input({width:'90%',liveChange:function(e){a.onAdvancedInputChange(e);}}).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');break;case'number':var I=new sap.m.Input({width:'46.5%',liveChange:function(e){a.onAdvancedNumberInputChange(e);},type:sap.m.InputType.Number}).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');var o=new sap.m.Input({width:'46.5%',liveChange:function(e){a.onAdvancedNumberInputChange(e);},type:sap.m.InputType.Number}).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');var l=new sap.m.Label({text:'...'}).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionLabel');i=new sap.ui.layout.HorizontalLayout({allowWrapping:true,content:[I,l,o]});break;default:break;}var b=new sap.ui.layout.HorizontalLayout({allowWrapping:true,content:[A,i]}).addStyleClass('sapUshellSearchFacetDialogDetailPageCondition');return b;},onDetailPageSelectionChange:function(e){var t=this;var s=e.mParameters.listItem;var S=s.getBindingContext().sPath+"/selected";s.getBindingContext().oModel.setProperty(S,s.getSelected());var b=s.getBindingContext().getObject();if(s.getSelected()){t.getModel().addFilter(b);}else{t.getModel().removeFilter(b);}var l=e.oSource;var d=l.getParent().getParent();t.updateCountInfo(d);var o=l.getParent().getParent().getContent()[t.settingContainerPosition];var c=o.getContent()[t.showOnTopCheckBoxPosition];var a=o.getContent()[t.sortingSelectPosition];if(c.getSelected()){c.setSelected(false);a.setSelectedKey("notSorted");}if(l.getSelectedContexts().length>0){c.setEnabled(true);}else{c.setEnabled(false);}},onSearchFieldLiveChange:function(e){var t=this;var f=e.getSource().getValue();var s=t.getFacetList().getSelectedItem();t.updateDetailPage(s,f);},onSettingButtonPress:function(e){var t=this;var p=e.oSource.getPressed();var s=e.oSource.getParent().getParent().getContent()[t.settingContainerPosition];var S=e.oSource.getParent().getParent().getContent()[t.separatorPosition];var l=e.oSource.getParent().getParent().getContent()[t.attributeListPosition];if(p){s.setVisible(true);S.setShowSeparators(sap.m.ListSeparators.All);l.setHeight('54%');}else{s.setVisible(false);S.setShowSeparators(sap.m.ListSeparators.None);l.setHeight('67.2%');}},onSelectChange:function(e){var t=this;t.sortingAttributeList(e.oSource.getParent().getParent());},onCheckBoxSelect:function(e){var t=this;t.sortingAttributeList(e.oSource.getParent().getParent());},onDateRangeSelectionChange:function(e){var t=this;var d=e.getSource();var a=d.getParent();var A=a.getContent()[0];if(d.getDateValue()&&d.getSecondDateValue()){A.setSelected(true);t.insertNewAdvancedCondition(a,"date");t.updateCountInfo(a.getParent().getParent());}else{A.setSelected(false);}},onAdvancedInputChange:function(e){var t=this;var i=e.getSource();var a=i.getParent();var A=a.getContent()[0];if(i.getValue()){A.setSelected(true);t.insertNewAdvancedCondition(a,"string");t.updateCountInfo(a.getParent().getParent());}else{A.setSelected(false);}},onAdvancedNumberInputChange:function(e){var t=this;var i=e.getSource();var a=i.getParent().getParent();var A=a.getContent()[0];if(i.getParent().getContent()[0].getValue()&&i.getParent().getContent()[2].getValue()){A.setSelected(true);t.insertNewAdvancedCondition(a,"number");t.updateCountInfo(a.getParent().getParent());}else{A.setSelected(false);}},onOkClick:function(e){var t=this;var M=t.getModel();var s=t.getModel('searchModel');s.resetFilterConditions(false);var d=t.oSplitContainer.getDetailPages();for(var m=0;m<M.aFilters.length;m++){var a=M.aFilters[m];if(!a.advanced){s.addFilterCondition(a,false);}}for(var i=0;i<d.length;i++){if(d[i].getContent()[t.advancedPosition]){var A=d[i].getContent()[t.advancedPosition];var D=A.data('dataType');var o=d[i].getContent()[t.advancedPosition].getContent();var k,b,c,f,g,C,h;switch(D){case'date':for(k=0;k<o.length;k++){b=o[k];c=b.getContent()[0];var j=b.getContent()[1];if(c.getSelected()&&j.getDateValue()&&j.getSecondDateValue()){var F={"pattern":"yyyy-MM-dd HH:mm:ss.SSSSSSS"};var S={"pattern":"yyyy-MM-dd 23:59:59.9999999"};var l=sap.ui.core.format.DateFormat.getDateTimeInstance(F).format(j.getDateValue());var n=sap.ui.core.format.DateFormat.getDateTimeInstance(S).format(j.getSecondDateValue());f=s.sina.createFilterCondition({attribute:t.getFacetList().getItems()[i].getBindingContext().getObject().dimension,operator:">=",value:l});g=s.sina.createFilterCondition({attribute:t.getFacetList().getItems()[i].getBindingContext().getObject().dimension,operator:"<=",value:n});C=t.getModel().sina.createFilterConditionGroup();C.label=j.getValue();C.conditions[0]=f;C.conditions[1]=g;h=t.createAdvancedFacetItem(C,t.getFacetList().getItems()[i].getBindingContext().getObject().title);s.addFilterCondition(h,false);}}break;case'string':for(k=0;k<o.length;k++){b=o[k];c=b.getContent()[0];var p=b.getContent()[1];if(c.getSelected()&&p.getValue()){var q=s.sina.createFilterCondition({attribute:t.getFacetList().getItems()[i].getBindingContext().getObject().dimension,operator:"=",value:p.getValue()});h=t.createAdvancedFacetItem(q,t.getFacetList().getItems()[i].getBindingContext().getObject().title);s.addFilterCondition(h,false);}}break;case'number':for(k=0;k<o.length;k++){b=o[k];c=b.getContent()[0];var r=b.getContent()[1].getContent()[0];var u=b.getContent()[1].getContent()[2];var v=b.getContent()[1].getContent()[1];if(c.getSelected()&&r.getValue()&&u.getValue()){f=s.sina.createFilterCondition({attribute:t.getFacetList().getItems()[i].getBindingContext().getObject().dimension,operator:">=",value:r.getValue()});g=s.sina.createFilterCondition({attribute:t.getFacetList().getItems()[i].getBindingContext().getObject().dimension,operator:"<=",value:u.getValue()});C=t.getModel().sina.createFilterConditionGroup();C.label=r.getValue()+v.getText()+u.getValue();C.conditions[0]=f;C.conditions[1]=g;h=t.createAdvancedFacetItem(C,t.getFacetList().getItems()[i].getBindingContext().getObject().title);s.addFilterCondition(h,false);}}break;default:break;}}}s.filterChanged=true;s._searchFireQuery();},getFacetList:function(){var t=this;return t.oSplitContainer.getMasterPages()[0].getContent()[this.facetListPosition];},updateCountInfo:function(d){var t=this;var l=d.getContent()[t.attributeListPosition].getContent()[0];var c=l.getSelectedContexts();var a=l.getParent().getParent().getContent()[t.advancedPosition];var b=0;for(var i=0;i<a.getContent().length;i++){var C=a.getContent()[i];var o=C.getContent()[0];if(o.getSelected()){b++;}}var m=t.getFacetList();var M=m.getSelectedItem();if(!M){M=m.getItems()[0];}var s=M.getBindingContext().sPath;var f=M.getBindingContext().oModel.getProperty(s).facetType;if(f==="attribute"){var e=c.length+b;if(e>0){M.setCounter(e);}else{M.setCounter(null);}}},sortingAttributeList:function(d){var t=this;var s=d.getContent()[t.settingContainerPosition];var S=s.getContent()[t.sortingSelectPosition];var c=s.getContent()[t.showOnTopCheckBoxPosition];var l=d.getContent()[t.attributeListPosition].getContent()[0];var b=l.getBinding("items");var a=[];if(c.getSelected()){a.push(new sap.ui.model.Sorter("selected",true,false));}switch(S.getSelectedKey()){case"sortName":a.push(new sap.ui.model.Sorter("label",false,false));break;case"sortCount":a.push(new sap.ui.model.Sorter("value",true,false));break;default:break;}b.sort(a);},getAttributeDataType:function(c){var t=this;var d;if(c.attribute){if(t.getModel().aAttributesMetaData[c.attribute]){d=t.getModel().aAttributesMetaData[c.attribute].$$MetaData$$.dataType;}}else if(c.conditions){if(t.getModel().aAttributesMetaData[c.conditions[0].attribute]){d=t.getModel().aAttributesMetaData[c.conditions[0].attribute].$$MetaData$$.dataType;}}switch(d){case"Double":return"number";case"Timestamp":return"date";case"String":return"string";default:return"string";}},createAdvancedFacetItem:function(f,F){var a=new sap.ushell.renderers.fiori2.search.FacetItem({value:"",filterCondition:f,facetTitle:F,label:f.label?f.label:f.value,selected:true,level:0});return a;},insertNewAdvancedCondition:function(a,t){var b=this;var A=a.getParent();var i=A.indexOfAggregation("content",a);if(i===(A.getAggregation("content").length-1)){var n=b.advancedConditionFactory(t);A.addContent(n);}},updateAdvancedConditions:function(a,I,t){var b=this;var c,C,o,d;for(var i=I.length;i>0;i--){var e=I[i-1];if(e.advanced){b.getModel().aFilters.push(e);c=a.getContent();C=c[c.length-1];o=C.getContent()[0];o.setSelected(true);d=C.getContent()[1];if(t==="number"){var f=d.getContent()[0];var g=d.getContent()[2];if(e.filterCondition.conditions){for(var j=0;j<e.filterCondition.conditions.length;j++){var h=e.filterCondition.conditions[j];if(h.operator===">="){f.setValue(h.value);}if(h.operator==="<="){g.setValue(h.value);}}}}else{d.setValue(e.label);}b.insertNewAdvancedCondition(C,t);}}},applyFacetQueryFilter:function(e){var t=this;t.getModel().resetFacetQueryFilterConditions();var d=t.oSplitContainer.getDetailPages();for(var i=0;i<d.length;i++){if(i===e){continue;}var l=d[i].getContent()[t.attributeListPosition].getContent()[0];for(var j=0;j<l.getItems().length;j++){var L=l.getItems()[j];var o=L.getBindingContext().getObject();var f=o.filterCondition;if(f.attribute||f.conditions){if(L.getSelected()){if(!t.getModel().facetQuery.getFilter().hasFilterCondition(f)){t.getModel().facetQuery.addFilterCondition(f);}}}}}},updateDetailPage:function(l,f){var t=this;var m=l.getBindingContext().oModel;var b=l.getBindingContext().sPath;var i=t.getFacetList().indexOfAggregation("items",l);var d=t.oSplitContainer.getDetailPages()[i];var D=d.getContent()[t.attributeListPosition].getContent()[0];var n=d.getId();D.setBusy(true);t.oSplitContainer.toDetail(n,"show");var s=m.getProperty(b);var p={sAttribute:s.dimension,sBindingPath:b,oList:D};t.applyFacetQueryFilter(i);if(f){var a=m.sina.createFilterCondition({attribute:s.dimension,operator:"=",value:f+"*"});m.facetQuery.addFilterCondition(a);}t.bSingleCall=true;m.facetDialogSingleCall(p).done(function(){t.updateDetailPageListItemsSelected(D);});},updateDetailPageListItemsSelected:function(d){var t=this;var a=d.getParent().getParent().getContent()[t.advancedPosition];var D=a.data('dataType');for(var j=0;j<d.getItems().length;j++){var l=d.getItems()[j];var L=l.getBindingContext().getObject();if(d.getModel().hasFilter(L)){l.setSelected(true);d.getModel().changeFilterAdvaced(L,false);t.removeAdvancedCondition(a,l,D);}else{l.setSelected(false);}var s=l.getBindingContext().sPath+"/selected";l.getBindingContext().oModel.setProperty(s,l.getSelected());}t.sortingAttributeList(d.getParent().getParent());d.setBusy(false);},removeAdvancedCondition:function(a,l,t){var c=a.getContent();var C,I,b;for(var i=0;i<c.length;i++){C=c[i];I=C.getContent()[1];if(t==="string"){var v=I.getValue();var L=l.getBindingContext().getObject();if(v===L.filterCondition.value){b=i;break;}}}a.removeContent(b);}});})();
