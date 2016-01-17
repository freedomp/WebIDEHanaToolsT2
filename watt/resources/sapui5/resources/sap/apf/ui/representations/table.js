/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require('sap.apf.ui.utils.formatter');jQuery.sap.declare("sap.apf.ui.representations.table");
sap.apf.ui.representations.table=function(a,p){var s=this;this.parameter=p;this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION;this.fields=p.dimensions.concat(p.measures);this.columns={name:[],value:[],width:[]};jQuery.sap.require({modName:"sap.ui.thirdparty.d3"});this.aDataResponse=[];this.alternateRepresentation=p.defaultListConfigurationTypeID;this.filter=a.createFilter();var b=0;var t=100;var c;var d;var f=false;var g=0;var h=0;var r=[];this.printMode=false;this.oModel=new sap.ui.model.json.JSONModel();this.oModel.setSizeLimit(10000);this.isAlternateRepresentation=p.isAlternateRepresentation;this.getParameter=function(){return this.parameter;};this.setData=function(D,m){if(h===0){if(f){D.map(function(o){s.aDataResponse.push(o);});h++;}else{b=0;s.aDataResponse=[];D.map(function(o){s.aDataResponse.push(o);});}}r=D;this.metadata=m;f=false;this.formatter=new sap.apf.ui.utils.formatter({getEventCallback:a.getEventCallback.bind(a),getTextNotHtmlEncoded:a.getTextNotHtmlEncoded},m,D);};this.getAlternateRepresentation=function(){return this.alternateRepresentation;};this.getMetaData=function(){return this.metadata;};this.getData=function(){return this.aDataResponse;};this.getRequestOptions=function(){if(!f){t=100;b=0;h=0;}var e={paging:{top:t,skip:b,inlineCount:true}};var o;if(c!==undefined){o=[{property:c,descending:d}];e.orderby=o;}else{if(this.getParameter().orderby&&this.getParameter().orderby.length){var O=this.getParameter().orderby.map(function(i){return{property:i.property,descending:!i.ascending};});e.orderby=O;}}return e;};this.createDataset=function(){if(s.getData().length!==0){for(var i=0;i<s.fields.length;i++){s.columns.value[i]=s.fields[i].fieldName;var n="";var u="";if(s.getMetaData()!==undefined&&s.getMetaData().getPropertyMetadata(s.fields[i].fieldName).unit!==undefined){var U=s.getMetaData().getPropertyMetadata(s.fields[i].fieldName).unit;u=s.getData()[0][U];n=s.fields[i].fieldDesc===undefined||!a.getTextNotHtmlEncoded(s.fields[i].fieldDesc).length?s.getMetaData().getPropertyMetadata(s.fields[i].fieldName).label+" ("+u+")":a.getTextNotHtmlEncoded(s.fields[i].fieldDesc)+" ("+u+")";s.columns.name[i]=n;}else{s.columns.name[i]=this.fields[i].fieldDesc===undefined||!a.getTextNotHtmlEncoded(s.fields[i].fieldDesc).length?s.getMetaData().getPropertyMetadata(s.fields[i].fieldName).label:a.getTextNotHtmlEncoded(s.fields[i].fieldDesc);}if(s.parameter.width!==undefined){s.columns.width[i]=s.parameter.width[s.columns.value[i]];}}}};this.drawSelection=function(e){var R=s.getFilter().getInternalFilter().getProperties()[0],F=s.getFilter().getInternalFilter().getFilterTermsForProperty(R),i=F.map(function(j){return j.getValue();}),l=this.getItems(),S=l.filter(function(j){var k=j.getBindingContext().getProperty(R);return i.indexOf(k)!==-1;});S.forEach(function(j){j.addStyleClass('sapMLIBSelected');});};this.getMainContent=function(S,e,w){s.createDataset();var m;if(!S){m=a.createMessageObject({code:"6002",aParameters:["title",a.getTextNotHtmlEncoded("step")]});a.putMessage(m);}if(this.fields.length===0){m=a.createMessageObject({code:"6002",aParameters:["dimensions",S]});a.putMessage(m);}if(!this.aDataResponse||this.aDataResponse.length===0){m=a.createMessageObject({code:"6000",aParameters:[S]});a.putMessage(m);}var j=e||600;j=j+"px";var k=w||1000;k=k+"px";s.title=S;var o=s.aDataResponse;s.oModel.setData({tableData:o});var l=[];var i;var C=function(F){return function(G){if(s.metadata===undefined){return G;}else{var H=s.formatter.getFormattedValue(s.columns.value[F],G);if(H!==undefined){return H;}else{return G;}}};};for(i=0;i<s.columns.name.length;i++){s.cellValues=new sap.m.Text().bindText(s.columns.value[i],C(i),sap.ui.model.BindingMode.OneWay);l.push(s.cellValues);}var n=[];var q=[];var W;var u;var v;for(i=0;i<s.columns.name.length;i++){W=false;if(s.columns.width!==undefined&&s.columns.width instanceof Array&&s.columns.width.length!==0){W=true;}u=d3.scale.linear().domain([0,8]).range([0,72]);v=W?s.columns.width[i]:(u(s.columns.name[i].length))+"px";s.columnName=new sap.m.Column({width:v,header:new sap.m.Text({text:s.columns.name[i]})});n.push(s.columnName);s.columnName1=new sap.m.Column({width:v});q.push(s.columnName1);}var T=new sap.m.Table({headerText:s.title,showNoData:false,columns:n}).addStyleClass("tableWithHeaders");this.oTableWithoutHeaders=new sap.m.Table({columns:q,items:{path:"/tableData",template:new sap.m.ColumnListItem({cells:l})}});T.setModel(s.oModel);this.oTableWithoutHeaders.setModel(s.oModel);this.oTableWithoutHeaders.attachUpdateFinished(this.drawSelection.bind(this.oTableWithoutHeaders));var x=function(F){var G=F.getParameters();s.oTableWithoutHeaders.setBusy(true);h=0;c=G.sortItem.getKey();d=G.sortDescending;t=100;b=0;var y=[];if(G.sortItem){if(s.isAlternateRepresentation){var z=s.oTableWithoutHeaders.getBinding("items");y.push(new sap.ui.model.Sorter(c,d));z.sort(y);s.oTableWithoutHeaders.setBusy(false);return;}a.updatePath(function(H,J){if(H===a.getActiveStep()){s.oModel.setData({tableData:s.aDataResponse});s.oTableWithoutHeaders.rerender();s.oTableWithoutHeaders.setBusy(false);}});}};this.viewSettingsDialog=new sap.m.ViewSettingsDialog({confirm:x});for(i=0;i<T.getColumns().length;i++){var I=new sap.m.ViewSettingsItem({text:s.columns.name[i],key:s.columns.value[i]});this.viewSettingsDialog.addSortItem(I);}if(c===undefined&&d===undefined){if(this.getParameter().orderby&&this.getParameter().orderby.length){for(i=0;i<this.viewSettingsDialog.getSortItems().length;i++){if(this.getParameter().orderby[0].property===this.viewSettingsDialog.getSortItems()[i].getKey()){this.viewSettingsDialog.setSelectedSortItem(this.viewSettingsDialog.getSortItems()[i]);this.viewSettingsDialog.setSortDescending(!this.getParameter().orderby[0].ascending);}}}else{this.viewSettingsDialog.setSelectedSortItem(this.viewSettingsDialog.getSortItems()[0]);this.viewSettingsDialog.setSortDescending(false);}}else{for(i=0;i<this.viewSettingsDialog.getSortItems().length;i++){if(c===this.viewSettingsDialog.getSortItems()[i].getKey()){this.viewSettingsDialog.setSelectedSortItem(this.viewSettingsDialog.getSortItems()[i]);}}this.viewSettingsDialog.setSortDescending(d);var y=[];if(this.isAlternateRepresentation){var z=s.oTableWithoutHeaders.getBinding("items");y.push(new sap.ui.model.Sorter(c,d));z.sort(y);}}if(s.metadata!==undefined){for(i=0;i<s.columns.name.length;i++){var M=s.metadata.getPropertyMetadata(s.columns.value[i]);if(M.unit){var A=s.oTableWithoutHeaders.getColumns()[i];A.setHAlign(sap.ui.core.TextAlign.Right);}}}var B=new sap.m.ScrollContainer({content:s.oTableWithoutHeaders,height:"480px",horizontal:false,vertical:true}).addStyleClass("tableWithoutHeaders");var D=new sap.m.Link({text:"More"}).addStyleClass("loadMoreLink");var E=new sap.m.ScrollContainer({content:[T,B],width:k,horizontal:true,vertical:false}).addStyleClass("scrollContainer");s.oModel.setSizeLimit(10000);T.addEventDelegate({onAfterRendering:function(){jQuery(".scrollContainer > div:first-child").css({"display":"table","width":"inherit"});var F;if(s.offsetTop===undefined){s.offsetTop=jQuery(".tableWithoutHeaders").offset().top;}if(jQuery(".tableWithoutHeaders").offset().top!==s.offsetTop){F=((window.innerHeight-jQuery('.tableWithoutHeaders').offset().top))+"px";}else{F=((window.innerHeight-jQuery('.tableWithoutHeaders').offset().top)-(jQuery(".applicationFooter").height())-20)+"px";}document.querySelector('.tableWithoutHeaders').style.cssText+="height : "+F;var L=sap.ui.getCore().getRenderManager().getHTML(D);sap.ui.Device.orientation.attachHandler(function(){E.rerender();});var G=a.getActiveStep();if(G.getSelectedRepresentation().bIsAlternateView===undefined||G.getSelectedRepresentation().bIsAlternateView===false){if(sap.ui.Device.browser.mobile){if(r.length>0){jQuery(jQuery(".tableWithoutHeaders > div:first-child")).append(L);}D.attachPress(function(){if(!jQuery(".openToggleImage").length&&(r.length>0)){if(g===0){H();h=0;g++;jQuery(".loadMoreLink").remove();jQuery(jQuery(".tableWithoutHeaders > div:first-child")).append(L);}}else{jQuery(".loadMoreLink").remove();}});}else{jQuery('.tableWithoutHeaders').on("scroll",function(){var s=jQuery(this);var J=s.prop("scrollTop");var K=s.prop("scrollHeight");var N=s.prop("offsetHeight");var O=K-N-5;if((O<=J)&&!jQuery(".openToggleImage").length&&(r.length>0)){if(g===0){H();h=0;g++;}}});}}var H=function(){s.oTableWithoutHeaders.setBusy(true);sap.ui.getCore().applyChanges();var J=s.oModel.getData();b+=o.length;t=10;f=true;a.updatePath(function(K,N){if(K===a.getActiveStep()){s.oModel.setData(J);s.oTableWithoutHeaders.rerender();s.oTableWithoutHeaders.setBusy(false);g=0;}});};}});return new sap.ui.layout.VerticalLayout({content:[E]});};this.getThumbnailContent=function(){if(this.aDataResponse!==undefined&&this.aDataResponse.length!==0){var i=new sap.ui.core.Icon({src:"sap-icon://table-chart",size:"70px"}).addStyleClass('thumbnailTableImage');return i;}else{var n=new sap.m.Text({text:a.getTextNotHtmlEncoded("noDataText")}).addStyleClass('noDataText');return new sap.ui.layout.VerticalLayout({content:n});}};this.serialize=function(){return{oFilter:this.getFilter().serialize()};};this.deserialize=function(S){var e=a.createFilter();this.setFilter(e.deserialize(S.oFilter));};this.getFilterMethodType=function(){return sap.apf.core.constants.filterMethodTypes.filter;};this.getSelectionCount=function(){var R=s.getFilter().getInternalFilter().getProperties()[0],F=s.getFilter().getInternalFilter().getFilterTermsForProperty(R);return F.length;};this.getFilter=function(){return this.filter;};this.setFilter=function(F){this.filter=F;};this.adoptSelection=function(S){if(S&&S.getFilter){this.setFilter(S.getFilter());}};this.removeAllSelection=function(){this.setFilter(a.createFilter());a.selectionChanged();s.oTableWithoutHeaders.getItems().forEach(function(i){i.removeStyleClass('sapMLIBSelected');});};this.getPrintContent=function(S){this.createDataset();var o=this.aDataResponse;this.oModel.setData({tableData:o});var i;var e=[];for(i=0;i<s.columns.name.length;i++){s.columnName=new sap.m.Column({width:"75px",header:new sap.m.Label({text:s.columns.name[i]})});e.push(s.columnName);}var j=[];var C=function(l){return function(n){if(s.metadata===undefined){return n;}else{var m=s.metadata.getPropertyMetadata(s.columns.value[l]);if(m.dataType.type==="Edm.DateTime"){if(n===null){return"-";}var q=new Date(parseInt(n.slice(6,n.length-2),10));q=q.toLocaleDateString();if(q==="Invalid Date"){return"-";}return q;}if(m.unit){if(n===null){return"-";}var u=s.metadata.getPropertyMetadata(m.unit);if(u.semantics==="currency-code"){var v=s.aDataResponse[0][m.scale];n=parseFloat(n,10).toFixed(v).toString();var w=n.split(".");var x=parseFloat(w[0]).toLocaleString();var y=0.1;y=y.toLocaleString();if(x.split(y.substring(1,2)).length>1){x=x.split(y.substring(1,2))[0];}x=x.concat(y.substring(1,2),w[1]);return x;}}else{return n;}}};};for(i=0;i<s.columns.name.length;i++){s.cellValues=new sap.m.Text().bindText(s.columns.value[i],C(i),sap.ui.model.BindingMode.OneWay);j.push(s.cellValues);}var T=new sap.m.Table({headerText:S,headerDesign:sap.m.ListHeaderDesign.Standard,columns:e,items:{path:"/tableData",template:new sap.m.ColumnListItem({cells:j})}}).addStyleClass("printTable");if(s.metadata!==undefined){for(i=0;i<s.columns.name.length;i++){var m=s.metadata.getPropertyMetadata(s.columns.value[i]);if(m.unit){var k=T.getColumns()[i];k.setHAlign(sap.ui.core.TextAlign.Right);}}}T.setModel(s.oModel);T.attachUpdateFinished(this.drawSelection.bind(T));return new sap.ui.layout.VerticalLayout({content:[T]});};};