/*
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','./BaseController','sap/m/library'],function(q,B,l){"use strict";var S=B.extend("sap.ui.comp.personalization.SortController",{constructor:function(i,s){B.apply(this,arguments);this.setType(sap.m.P13nPanelType.sort);},metadata:{events:{afterSortModelDataChange:{}}}});S.prototype.setTable=function(t){B.prototype.setTable.apply(this,arguments);if(t instanceof sap.ui.table.Table){t.detachSort(this._onSort,this);t.attachSort(this._onSort,this);}};S.prototype.getTitleText=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("PERSODIALOG_TAB_SORT");};S.prototype._getTable2Json=function(){var j=this.createPersistentStructure();var t=this.getTable();sap.ui.comp.personalization.Util.createSort2Json(t,j.sort.sortItems,this.getIgnoreColumnKeys());return j;};S.prototype.syncTable2TransientModel=function(){var t=this.getTable();var i=[];if(t){if(t instanceof sap.ui.table.Table){t.getColumns().forEach(function(c){if(sap.ui.comp.personalization.Util.isColumnIgnored(c,this.getIgnoreColumnKeys())){return;}if(sap.ui.comp.personalization.Util.isSortable(c)){i.push({columnKey:sap.ui.comp.personalization.Util.getColumnKey(c),text:c.getLabel().getText(),tooltip:(c.getTooltip()instanceof sap.ui.core.TooltipBase)?c.getTooltip().getTooltip_Text():c.getTooltip_Text()});}},this);}if(t instanceof sap.m.Table){t.getColumns().forEach(function(c){if(sap.ui.comp.personalization.Util.isColumnIgnored(c,this.getIgnoreColumnKeys())){return;}if(sap.ui.comp.personalization.Util.isSortable(c)){i.push({columnKey:sap.ui.comp.personalization.Util.getColumnKey(c),text:c.getHeader().getText(),tooltip:(c.getHeader().getTooltip()instanceof sap.ui.core.TooltipBase)?c.getHeader().getTooltip().getTooltip_Text():c.getHeader().getTooltip_Text()});}},this);}}sap.ui.comp.personalization.Util.sortItemsByText(i);i.splice(0,0,{key:null,text:sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_SELECTION_NONE")});var I=this.getModel().getData().transientData.sort.items;if(q(i).not(I).length!==0||q(I).not(i).length!==0){this.getModel().getData().transientData.sort.items=i;}};S.prototype._onSort=function(e){e.preventDefault();var a=e.mParameters.columnAdded;var t=this.getTable();if(typeof t==="string"){t=sap.ui.getCore().byId(t);}this.fireBeforePotentialTableChange();if(!a){t.getColumns().forEach(function(c,b){if(c.setSorted){c.setSorted(false);}},this);}var c=e.mParameters.column;if(c&&c.setSorted){c.setSorted(true);c.setSortOrder(e.mParameters.sortOrder);}var s=this.getModel().getData().persistentData.sort;if(!a){s.sortItems=[];}var i=sap.ui.comp.personalization.Util.getIndexByKey(s.sortItems,sap.ui.comp.personalization.Util.getColumnKey(c));if(i>-1){s.sortItems.splice(i,1);}s.sortItems.push({columnKey:sap.ui.comp.personalization.Util.getColumnKey(c),operation:e.mParameters.sortOrder});this.fireAfterPotentialTableChange();this.fireAfterSortModelDataChange();};S.prototype._hasTableSortableColumns=function(){var t=this.getTable();if(!t){return false;}var h=false;t.getColumns().some(function(c){if(sap.ui.comp.personalization.Util.isSortable(c)){h=true;return true;}});return h;};S.prototype.getPanel=function(){sap.ui.getCore().loadLibrary("sap.m");q.sap.require("sap/m/P13nSortPanel");q.sap.require("sap/m/P13nItem");q.sap.require("sap/m/P13nSortItem");if(!this._hasTableSortableColumns()){return null;}var t=this;var p=new sap.m.P13nSortPanel({type:sap.m.P13nPanelType.sort,title:this.getTitleText(),containerQuery:true,items:{path:"/transientData/sort/items",template:new sap.m.P13nItem({columnKey:"{columnKey}",text:"{text}",tooltip:"{tooltip}",maxLength:"{maxlength}",type:"{type}"})},sortItems:{path:"/persistentData/sort/sortItems",template:new sap.m.P13nSortItem({columnKey:"{columnKey}",operation:"{operation}"})},beforeNavigationTo:t.setModelFunction(t.getModel())});p.attachAddSortItem(function(e){var d=this.getModel().getData();var a=e.getParameters();var s={columnKey:a.sortItemData.getColumnKey(),operation:a.sortItemData.getOperation()};if(a.index>-1){d.persistentData.sort.sortItems.splice(a.index,0,s);}else{d.persistentData.sort.sortItems.push(s);}this.getModel().setData(d,true);},this);p.attachRemoveSortItem(function(e){var a=e.getParameters();var d=this.getModel().getData();if(a.index>-1){d.persistentData.sort.sortItems.splice(a.index,1);this.getModel().setData(d,true);}},this);return p;};S.prototype.syncJsonModel2Table=function(j){var t=this.getTable();var c=t.getColumns();var C=q.extend(true,[],c);this.fireBeforePotentialTableChange();if(t instanceof sap.ui.table.Table){j.sort.sortItems.forEach(function(s){var o=sap.ui.comp.personalization.Util.getColumn(s.columnKey,c);if(!o){return;}if(!o.getSorted()){o.setSorted(true);}if(o.getSortOrder()!==s.operation){o.setSortOrder(s.operation);}C.splice(C.indexOf(o),1);});C.forEach(function(o){if(o&&o.getSorted()){o.setSorted(false);}});}this.fireAfterPotentialTableChange();};S.prototype.getChangeType=function(p,P){if(!P||!P.sort||!P.sort.sortItems){return sap.ui.comp.personalization.ChangeType.Unchanged;}var i=JSON.stringify(p.sort.sortItems)!==JSON.stringify(P.sort.sortItems);return i?sap.ui.comp.personalization.ChangeType.ModelChanged:sap.ui.comp.personalization.ChangeType.Unchanged;};S.prototype.getChangeData=function(p,P){if(!p||!p.sort||!p.sort.sortItems){return{sort:{sortItems:[]}};}if(!P||!P.sort||!P.sort.sortItems){return{sort:sap.ui.comp.personalization.Util.copy(p.sort)};}if(JSON.stringify(p.sort.sortItems)!==JSON.stringify(P.sort.sortItems)){return{sort:sap.ui.comp.personalization.Util.copy(p.sort)};}return null;};S.prototype.getUnionData=function(p,P){if(!P||!P.sort||!P.sort.sortItems){return{sort:sap.ui.comp.personalization.Util.copy(p.sort)};}return{sort:sap.ui.comp.personalization.Util.copy(P.sort)};};S.prototype.exit=function(){B.prototype.exit.apply(this,arguments);var t=this.getTable();if(t&&t instanceof sap.ui.table.Table){t.detachSort(this._onSort,this);}};return S;},true);
