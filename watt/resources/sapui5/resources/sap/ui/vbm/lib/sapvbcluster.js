VBI.Clustering=
function(t){"use strict";var f={};var D={};var E=1.0/1048576.0;f.m_Clusters=[];f.m_Clustergroups=[];f.m_loadCount=0;f.m_Parser=VBI.Parser();f.m_nClustertypes=5;f.clear=function(){f.m_Clusters=[];};f.load=function(d,c){if(d.Set){f.clear();f.m_Parser.clear();f.m_loadCount++;var a,r=d.Set.Cluster;if(jQuery.type(r)=='object'){a=new VBI.Clustering.Cluster();a.load(r,c,f.m_Clusters.length);f.m_Clusters.push(a);f.UpdateAutomaticClusterGroup(a.m_groupID);}else if(jQuery.type(r)=='array'){var i=f.m_Clusters.length;for(var n=0,l=r.length;n<l;++n){a=new VBI.Clustering.Cluster();a.load(r[n],c,i++);f.m_Clusters.push(a);f.UpdateAutomaticClusterGroup(a.m_groupID);}}for(var b=0;b<f.m_Clustergroups.length;++b){f.m_Clusters.push(f.m_Clustergroups.shift());}}};f.UpdateAutomaticClusterGroup=function(g){if(g==""){return;}var i=f.m_Clusters[f.m_Clusters.length-1];var n,a,e,b;for(var c=0;c<f.m_Clustergroups.length;++c){e=f.m_Clustergroups[c];if(e.m_id==g){n=c;}}if(n!=undefined){b=f.m_Clustergroups[n];b.m_limit=Math.min(i.m_limitOnSum,b.m_limit);i.m_bPartOfGrp=true;}else{for(var d=0,l=f.m_Clusters.length-1;d<l;++d){e=f.m_Clusters[d];if((e.m_type=="grid")&&(e.m_groupID==g)){a=d;}}if(a!=undefined){var o=f.m_Clusters[a];b=new VBI.Clustering.Cluster();b.m_type="clustergroup";b.m_nType=2;b.m_id=g;b.m_dividerX=o.m_dividerX;b.m_dividerY=o.m_dividerY;b.m_limit=Math.min(i.m_limitOnSum,o.m_limitOnSum);b.initializeFunctions();f.m_Clustergroups.push(b);i.m_bPartOfGrp=o.m_bPartOfGrp=true;}}};f.PreassembleDataForVO=function(s,r,i,v,c){var n;var b=r.config.m_BaseLod;var l=f.tw*((b>=0)?(1<<b):1/(1<<-b));if((n=v.m_DataSource.GetCurrentNode(c))){var I=v.m_ID;var m=r.base[i];if(n.m_dataelements.length){v.m_DataSource.Select(0);var e=v.m_DataSource.GetIndexedElement(c,0);var a=e.GetPath();var d=e.GetKeyValue().length;m.strDataPath=a.substring(0,a.length-d);for(var g=0;g<n.m_dataelements.length;++g){var u=[l,l];v.m_DataSource.Select(g);e=v.m_DataSource.GetIndexedElement(c,g);var o=v.m_Pos.GetValueVector(c);s.m_Proj.LonLatToUCS(VBI.MathLib.DegToRad(o),u);var h=f.m_Parser.evaluate(v,i,c);if(h>=0){u.t=f.m_Clusters[h].m_nType;(m.targets[h])++;}else{u.t=-1;}u.h=v.BaseIsHot(g,c);u.hscale=v.GetHotScale(c);u.hcol=v.m_HotDeltaColor.GetValueString(c);if((u.s=v.IsSelected(c))){u.scol=v.m_SelectColor.GetValueString(c);u.simag=v.m_ImageSelected.GetValueString(c);r.m_SelectedVOs.unshift({m_vo:i,m_index:m.length,m_dataIndex:g});}if(u.im==undefined){u.im=v.m_Image.GetValueString(c);}u.ic=v.m_Icon.GetValueString(c);u.tx=v.m_Text.GetValueString(c);u.ctcol=v.m_ContentColor.GetValueString(c);u.ctoffs=v.m_ContentOffset.GetValueVector(c);u.ctfont=v.m_ContentFont.GetValueString(c);u.ctsz=v.m_ContentSize.GetValueLong(c);u.sc=v.m_Scale.GetValueVector(c);u.al=v.m_Alignment.GetValueString(c);u.m_ID=I;u.nI=g;u.b2Ignore=false;u.cI=h;u.vI=i;u.key=e.GetKeyValue();u.label=v.GetLabel(c);m.push(u);}}for(var j=m.targets.length;j--;){var k=f.m_Clusters[j].m_nType;m.targTypes[k]+=m.targets[j];r.base.targTypes[k]+=m.targets[j];}}};f.InitializeResultVector=function(m,n,l,x,y,a,b,c){f.tw=m.m_tileWidth;f.th=m.m_tileHeight;var R={};var d=f.m_Clusters.length;R.base=[];R.hotItem={};var i,j,e;for(i=0;i<n;++i){e=[];e.clusterings=[];e.m_lodOffset=1;e.m_BaseX=x;e.m_BaseY=y;R.base.push(e);e.targets=[];e.targTypes=[];e.hotItem=R.hotItem;for(j=d;j--;){e.targets.push(0);}for(j=f.m_nClustertypes;j--;){e.targTypes.push(0);}e.m_nNumIgnore=0;}R.base.targTypes=[];for(j=f.m_nClustertypes;j--;){R.base.targTypes.push(0);}R.clust=[];for(var g=0;g<d;++g){e=[];e.cI=g;e.m_lodOffset=1;e.m_BaseX=x;e.m_BaseY=y;e.hotItem=R.hotItem;e.m_nRecalcs=0;R.clust.push(e);}R.config={};var h=R.config;h.m_version=f.m_loadCount;h.bNeedsShadowLayer=false;h.m_lod=l;h.m_lodOffset=1;h.m_x=x;h.m_y=y;h.m_nx=a;h.m_ny=b;h.m_nData=c;h.m_calcMode=2;h.m_BaseX=x*f.tw;h.m_BaseY=y*f.tw;h.m_BaseLod=l;R.hotItem={};R.m_SelectedVOs=[];return R;};f.CheckNonClusteredVOs=function(R,C){if(!R.base.targTypes[1]){return;}for(var n=0;n<R.base.length;++n){var v=R.base[n];if(!v.targTypes[1]){continue;}var a,b,c=0;for(a=0,b=v.length;a<b;++a){var e=v[a];if(!e.isCl){if((e.cI!=undefined)&&(e.sq!=undefined)&&(C[e.cI])[e.sq].b2Cluster){v.m_nNumIgnore++;e.b2Ignore=true;}if(!e.b2Ignore){e.bbInd=c;c++;}}}v.m_NumVisVOs=c;}};f.FetchClusterVOData=function(s,v,c){var a=f.m_Clusters;var b=a.length;var r=[];for(var k=0;k<b;++k){r.push({});}var n=v.length;for(var i=0;i<n;++i){for(var j=0;j<b;++j){if(v[i].m_ID==a[j].m_VO){r[j].m_index=i;r[j].m_image=v[i].m_Image!=undefined?v[i].m_Image.GetValueString(c):"";r[j].m_scale=v[i].m_Scale!=undefined?v[i].m_Scale.GetValueVector(c):[1,1,1];r[j].m_hotscale=v[i].m_HotScale!=undefined?v[i].m_HotScale.GetValueVector(c):[1,1,1];r[j].m_hotcol=v[i].m_HotDeltaColor!=undefined?v[i].m_HotDeltaColor.GetValueString(c):"";r[j].m_alignment=v[i].m_Alignment!=undefined?v[i].m_Alignment.GetValueString(c):0;}}}return r;};f.FetchClusterGroupData=function(){var c=f.m_Clusters;var a=c.length;var r=[];for(var i=0;i<a;++i){var s=[];if(c[i].m_type=="clustergroup"){for(var j=0;j<a;++j){if((i!=j)&&(c[i].m_id==c[j].m_groupID)){s.push({index:j,limit:c[j].m_limit});}}}r.push(s);}return r;};f.AdaptOffsets=function(p,a,l,x,y,n,b){p.config.m_calcMode=1;var c=(l-p.config.m_BaseLod);var L=(c>=0)?(1<<c):1/(1<<-c);var e;for(var i=p.base.length-1;i>=0;--i){e=p.base[i];e.m_lodOffset=L;e.m_BaseX=x;e.m_BaseY=y;}for(var j=p.clust.length-1;j>=0;--j){e=p.clust[j];e.m_lodOffset=L;e.m_BaseX=x;e.m_BaseY=y;}p.config.m_lod=l;p.config.m_x=x;p.config.m_y=y;p.config.m_nx=n;p.config.m_ny=b;p.config.m_lodOffset=L;};f.DetermineChanges=function(o,l,x,y,n,a,b){var r={};r.bPosChanged=true;r.bDataChanged=true;r.bClusteringChanged=true;r.lodDiff=0;r.lodFactor=1;r.posDiff=[0,0];if(o!=undefined){var c=o.config;r.lodDiff=l-c.m_lod;if(r.lodDiff==0){r.lodFactor=1<<(r.lodDiff);r.posDiff=[f.tw*(x-r.lodFactor*c.m_x),f.th*(y-r.lodFactor*c.m_y)];}else if(r.lodDiff>0){r.lodFactor=1<<(r.lodDiff);r.posDiff=[f.tw*(x-r.lodFactor*c.m_x),f.th*(y-r.lodFactor*c.m_y)];}else{r.lodFactor=1/(1<<(-r.lodDiff));r.posDiff=[f.tw*(x-r.lodFactor*c.m_x),f.th*(y-r.lodFactor*c.m_y)];}if(c.m_nData==b){r.bDataChanged=false;}if(c.m_version==f.m_loadCount){r.bClusteringChanged=false;}if(!r.lodDiff&&(c.m_x==x)&&(c.m_y==y)&&(c.m_nx==n)&&(c.m_ny==a)){r.bPosChanged=false;}}r.bNothingChanged=!r.bDataChanged&&!r.bPosChanged&&!r.bClusteringChanged;return r;};f.InvalidateOutdatedClustering=function(R,c){var g=c.bDataChanges||c.bClusteringChanged;var s=g;for(var i=0;i<R.base.length;++i){var v=R.base[i];for(var j=v.clusterings.length-1;j>=0;--j){var a=v.clusterings[j];var b=true;switch(a.t){case 0:b=true;break;case 1:b=g||(c.lodDiff!=0);break;case 2:b=g;break;}if(b){v.clusterings.splice(j,1);var m=R.clust[a.i];m.m_nRecalcs++;m.splice(0,m.length);s=true;}}}return s;};f.ClearTreeClusterNode=function(n){if(n.bw){for(var i=n.bw.length;i--;){f.ClearTreeClusterNode(n.bw[i]);}for(var j=n.bw.length;j--;){n.bw[j]=undefined;}n.bw=undefined;}n.e=undefined;n.c=undefined;};f.ClearClusterFromPreData=function(c,i){if(c[i].m_TreeFatherNode!=undefined){f.ClearTreeClusterNode(c[i].m_TreeFatherNode);}c[i]=undefined;};f.ClearPreassembledData=function(s){var p=s.m_PreassembledData;var i;if(p==undefined){return;}for(i=p.clust.length;i--;){f.ClearClusterFromPreData(p.clust,i);}p.clust=undefined;for(i=p.base.length;i--;){p.base[i]=undefined;}s.m_PreassembledData=undefined;};f.getEdge=function(e,a){if(e[1]!=undefined){return e;}var b=a[e];var c=a[e+1];return[[b.c[0],b.c[1]],[c.c[0],c.c[1]]];};f.createEdgeIndex=function(e,a){var i,b=[];var c;for(i=a.length;i--;){c=f.getEdge(a[i],e);c[0].ot=c[1];c[0].i=i;c[1].ot=c[0];c[1].i=-i;var d={};d.i=i;d.c=0;d.p=c[0];c[0].li=d;b.push(d);var g={};g.p=c[1];g.i=-i;g.c=1;c[1].li=g;b.push(g);}b.sort(function(i,j){var x=i.p[0]-j.p[0];return x?x:i.p[1]-j.p[1];});for(i=0;i<b.length;i+=2){b[i].ot=i+1;b[i+1].ot=i;}return b;};f.getTreeClusterIndex=function(n){var m=n;while(m.c!=undefined){m=m.c;}return m.cI;};f.getNodeIdent=function(p,n,c){if(n.bw!=undefined){return f.getClusterIdent(p,c,n.nJ);}else{return p.base[n.vI].strDataPath+n.key;}};f.getClusterIdent=function(p,c,n){if(!p){return"";}var a=p.config;var b=p.clust[c];if(!b){return"";}return"["+a.m_version+","+a.m_nData+","+b.m_nRecalcs+","+c+","+n+"]";};f.getClusterArea=function(s,n){if(!n.bo){return undefined;}var p=s.m_PreassembledData;var x=s.m_Canvas[0].m_nCurrentX*s.m_MapManager.m_tileWidth;var y=s.m_Canvas[0].m_nCurrentY*s.m_MapManager.m_tileHeight;var a=p.config.m_lodOffset;var u=[a*n.bo[0]-x,a*n.bo[1]-y];var b=[a*n.bo[2]-x,a*n.bo[3]-y];var c=VBI.MathLib.RadToDeg(s.GetGeoFromPoint(u));var d=VBI.MathLib.RadToDeg(s.GetGeoFromPoint(b));return c[0].toString()+';'+c[1].toString()+';'+d[0].toString()+';'+d[1].toString();};f.getInfoForCluster=function(p,a,s){var b=s.m_PreassembledData;var c=b.config;var d;var e=b.clust[p[3]];var r=[];if(c.m_version==p[0]&&c.m_nData==p[1]&&e.m_nRecalcs==p[2]){var n=e[p[4]];if(a==10){var g=n.bw?n.bw.length:0;return{pos:[n[0],n[1]],bb:f.getClusterArea(s,n),image:n.im,lod:n.lod,ulod:n.c?n.c.lod:undefined,cnt:n.cnt,subs:g,type:n.isCl};}if(n.bw){switch(a){case 0:f.collectNodes(r,n,b);break;case 1:d=f.getTreeClusterIndex(n);for(var i=0;i<n.bw.length;++i){r.push(f.getNodeIdent(b,n.bw[i],d));}break;case 2:d=f.getTreeClusterIndex(n);if(n.c){r.push(f.getNodeIdent(b,n.c,d));}break;case 11:d=f.getTreeClusterIndex(n);return f.collectEdges(s,n,b.clust[d].m_edges);}}}r.sort();return r;};f.collectEdges=function(s,n,e){var a=[];if(!n.e||!n.e.length){return[];}var p=f.createEdgeIndex(e,n.e);var b=s.m_PreassembledData;var x=s.m_Canvas[0].m_nCurrentX*s.m_MapManager.m_tileWidth;var y=s.m_Canvas[0].m_nCurrentY*s.m_MapManager.m_tileHeight;var c=b.config.m_lodOffset;var d=p[0].p,g,l,h,j=n.e.length-1;a.push(VBI.MathLib.RadToDeg(s.GetGeoFromPoint([c*d[0]-x,c*d[1]-y])));for(var i=j;i--;){g=d.ot;a.push(VBI.MathLib.RadToDeg(s.GetGeoFromPoint([c*g[0]-x,c*g[1]-y])));h=g.li;l=p[h.ot];d=l.p;}return a;};f.collectNodes=function(r,n,p){if(n.bw!=undefined){for(var i=0;i<n.bw.length;++i){f.collectNodes(r,n.bw[i],p);}}else{var m=p.base[n.vI];r.push(m.strDataPath+n.key);}};f.DoClustering=function(s,l,o,y,n,a,v,c,b,F,d,e){var g=(1<<l);var x=o;while(x<0){x+=g;}while(x>g){x-=g;}var h=f.DetermineChanges(s.m_PreassembledData,l,x,y,n,a,e);var R;if(h.bNothingChanged){s.m_PreassembledData.config.m_calcMode=0;return s.m_PreassembledData;}var i;var j=f.FetchClusterVOData(s,v,c);var k=f.FetchClusterGroupData();f.m_Parser.verifyAttributes(v,c);var C=f.InitializeClusterData(s,l,x,y,n,a);if(h.bDataChanged||h.bClusteringChanged){f.ClearPreassembledData(s);R=f.InitializeResultVector(s.m_MapManager,v.length,l,x,y,n,a,e);for(i=0;i<v.length;++i){var m=v[i];if(m.IsClusterable()){f.PreassembleDataForVO(s,R,i,m,c);}}}else{R=s.m_PreassembledData;f.AdaptOffsets(R,h.posDiff,l,x,y,n,a);if(!f.InvalidateOutdatedClustering(R,h)){return R;}}for(i=0;i<f.m_Clusters.length;++i){f.m_Clusters[i].ClusterPass1(i,R,C,h);}for(i=0;i<f.m_Clusters.length;++i){f.m_Clusters[i].ClusterPass2(i,R,C,k);}for(i=0;i<f.m_Clusters.length;++i){f.m_Clusters[i].DecisionPass(s,i,R,C,j,k,h);}f.CheckNonClusteredVOs(R,C);return R;};f.InitializeClusterData=function(s,l,x,y,n,a){var C=[];var b=(1<<l);C.numTiles=b;C.completeX=b*s.m_nWidthCanvas/s.m_nTilesX;C.completeY=b*s.m_nHeightCanvas/s.m_nTilesY;C.minLOD=s.GetMinLOD();for(var c=0;c<f.m_Clusters.length;++c){var d=f.m_Clusters[c];var e=(n+2)*d.m_dividerX;var g=(a+2)*d.m_dividerY;C.push(d.InitializeClusterData(s,c,x-1,y-1,e,g));}return C;};f.VerifyCurrentSelection=function(v,R,c){for(var i=R.m_SelectedVOs.length-1;i>=0;--i){var s=R.m_SelectedVOs[i];var a=v[s.m_vo];a.m_DataSource.Select(s.m_dataIndex);if(!a.IsSelected(c)){var A=(s.cI!=undefined?R.clust[s.cI]:R.base[s.m_vo]);A[s.m_index].s=false;R.m_SelectedVOs.splice(i,1);}}};f.AddSingle2Selected=function(v,a,i,R,c){var b=a[v];if(b.IsClusterable()){var A=(i.cI!=undefined?R.clust[i.cI]:R.base[v]);var e=A[i.i];b.m_DataSource.Select(e.nI);if(b.IsSelected(c)){R.m_SelectedVOs.unshift({m_vo:v,m_index:i.i,m_dataIndex:e.nI,cI:i.cI});e.scol=b.m_SelectColor.GetValueString(c);e.simag=b.m_ImageSelected.GetValueString(c);e.s=true;}}};f.AddMultiple2Selected=function(i,v,R,c){for(var n=0;n<i.length;++n){var r=i[n];var a=v[n];if(a.IsClusterable()){for(var b=0;b<r.length;++b){f.AddSingle2Selected(n,v,a.GetInternalIndex(r[b]),R,c);}}}};VBI.Clustering.Cluster=function(){var d={};d.m_additionalProperties=[];d.clear=function(){d.m_addProperties=null;};d.load=function(a,c,i){d.m_id=a.id;d.m_type=a.type;d.m_type2=a.type2;d.m_switch=parseInt(a.typeswitch,10);d.m_bPartOfGrp=false;d.m_VO=a.VO;d.m_order=parseInt(a.order,10);d.m_dispOffsetX=parseInt(a.offsetX,10);if(isNaN(d.m_dispOffsetX)){d.m_dispOffsetX=0;}d.m_dispOffsetY=parseInt(a.offsetY,10);if(isNaN(d.m_dispOffsetY)){d.m_dispOffsetY=0;}f.m_Parser.addFormula(i,a.rule==undefined?"":a.rule);d.m_textcolor=a.textcolor;if(d.m_textcolor==undefined){d.m_textcolor="rgba(0,0,0,0.7)";}d.m_textfont=a.textfont;d.m_textfontscale=a.textfontscale;d.m_textfontsize=a.textfontsize;if(isNaN(d.m_textfontscale)){d.m_textfontscale=2.0;}d.m_textoffset=parseInt(a.textoffset,10);d.m_textoffsetY=parseInt(a.textoffsetY,10);if(isNaN(d.m_textoffset)){d.m_textoffset=0;}if(isNaN(d.m_textoffsetY)){d.m_textoffsetY=0;}d.m_spotcol=a.spotcol;d.m_spotsize=parseInt(a.spotsize,10);d.m_bordersize=a.areabordersize?parseInt(a.areabordersize,10):2;d.m_bordercol=a.areabordercol;if(d.m_type=="grid"){d.m_nType=1;d.m_distanceX=((a.distanceX==undefined)||(a.distanceX<=0))?256:a.distanceX;d.m_dividerX=Math.max(1,Math.round(256/d.m_distanceX));d.m_distanceY=((a.distanceY==undefined)||(a.distanceY<=0))?256:a.distanceY;d.m_dividerY=Math.max(1,Math.round(256/d.m_distanceY));d.m_groupID=(a.groupID==undefined?"&":a.groupID)+d.m_dividerX+"_"+d.m_dividerY;d.m_omitEmpties=(a.showEmpties!="true");d.m_fillcol=a.areafillcol;d.m_permanentArea=(a.areapermanent=="true");}if(d.m_type=="distance"){d.m_nType=3;d.m_distance=a.distance;if(d.m_distance==undefined||d.m_distance<=0){d.m_distance=128;}}if(d.m_type=="tree"){d.m_nType=4;d.m_distance=a.distance;if(d.m_distance==undefined||d.m_distance<=0){d.m_distance=16;}d.m_bordercol2=a.areabordercol2;d.m_bordercol3=a.areabordercol3;d.m_fillcol=a.areafillcol;d.m_fillcol2=a.areafillcol2;d.m_fillcol3=a.areafillcol3;d.m_animated=a.animation=="true"?"2":a.animation;d.m_permanentArea=(a.areapermanent=="true");}d.m_limit=parseInt(a.limit,10);d.m_limitOnSum=a.limitOnSum==undefined?999999:parseInt(a.limitOnSum,10);d.initializeFunctions();};d.initializeFunctions=function(){switch(d.m_type){case"grid":d.InitializeClusterData=d.InitializeGridClusterData;d.ClusterPass1=d.gridClusteringCounting;d.ClusterPass2=d.NothingToDo;d.DecisionPass=d.gridBasedDecision;d.CheckClusterData=d.CheckSingleClusterData;break;case"clustergroup":d.InitializeClusterData=d.InitializeGridClusterData;d.ClusterPass1=d.NothingToDo;d.ClusterPass2=d.gridClustergroupCounting;d.DecisionPass=d.gridBasedDecision;d.CheckClusterData=d.CheckGroupClusterData;break;case"distance":d.InitializeClusterData=d.InitializeDistClusterData;d.ClusterPass1=d.NothingToDo;d.ClusterPass2=d.NothingToDo;d.DecisionPass=d.distanceBasedDecision;d.CheckClusterData=d.NothingToDo;break;case"tree":d.InitializeClusterData=d.InitializeTreeClusterData;d.ClusterPass1=d.NothingToDo;d.ClusterPass2=d.NothingToDo;d.DecisionPass=d.treeBasedDecision;d.CheckClusterData=d.NothingToDo;break;}};d.gridClusteringCounting=function(n,R,C,c){var m=C[n];var a=R.clust[n];var x=m.nX;var y=m.nY;var b=d.m_dividerX*C.numTiles/C.completeX;var e=d.m_dividerY*C.numTiles/C.completeX;var g=C.completeX/256;var h,i,j;var k,l;var o=f.th*m.m_BaseX;var p=f.th*m.m_BaseY;var q=a.m_lodOffset;for(var r=0;r<R.base.length;++r){k=R.base[r];for(var s=0;s<k.length;++s){l=k[s];if(l.cI==n){if(l.b2Ignore){k.m_nNumIgnore--;l.b2Ignore=false;}h=Math.floor((q*l[0]-o)*b);if(h<0){h+=g;}i=Math.floor((q*l[1]-p)*e);if((h>=0)&&(h<x)&&(i>=0)&&(i<y)){j=h+x*i;l.sq=j;m[j].numInst++;m[j].bw.push(l);}}}}};d.gridClustergroupCounting=function(n,R,C,g){var m=g[n];var c=m.length;var a=C[n];for(var b=0;b<a.length;++b){var e=0;var h=a[b];h.bLimitExceeded=false;for(var i=0;i<c;++i){var j=m[i].index;var k=C[j];var l=k[b].numInst;e+=l;if(l>=m[i].limit){h.bLimitExceeded=true;}}h.numInst=e;}};d.distanceBasedDecision=function(s,n,R,C,c,g,a){if(a.lodDiff||a.bDataChanged||a.bClusteringChanged){var b=f.m_Clusters[n];var e=d.doDistClustering(n,R,b.m_distance,C.completeX);d.distFillClusterData(s,e,R,c[n],n);}};d.treeBasedDecision=function(s,n,R,C,c,g,a){if(a.bDataChanged||a.bClusteringChanged){var b=f.m_Clusters[n];var e=d.doTreeClustering(n,R,c[n],b.m_distance,C.completeX);d.treeFillClusterData(s,e,R,c[n],n,s.GetMinLOD());}};d.gridBasedDecision=function(s,n,R,C,c,g,a){R.config.bNeedsShadowLayer=d.fillClusterConfig(R.clust[n],R.config,0,false)||R.config.bNeedsShadowLayer;var b=f.m_Clusters[n];if(!b.m_bPartOfGrp){var e=C[n];var m=g[n];if(m.length){for(var i=m.length;i--;){var h=m[i].index;R.base[c[h].m_index].clusterings.push({i:h,t:0});}}else{R.base[c[n].m_index].clusterings.push({i:n,t:0});}for(var x=0;x<e.nX;++x){for(var y=0;y<e.nY;++y){var j=x+e.nX*y;b.CheckClusterData(R,C,e[j],n,j,x,y,c,m);}}}};d.NothingToDo=function(){};d.ReturnFalse=function(){return false;};d.CheckSingleClusterData=function(R,C,c,n,a,x,y,v,b){if(c.numInst>=d.m_limit){var t=C[n];f.m_Clusters[n].FillClusterData(R,t[a],x,y,t,v[n],n,1);return;}c.b2Cluster=false;return;};d.CheckGroupClusterData=function(R,C,c,n,a,x,y,v,b){var i,t,g=1;if(c.bLimitExceeded||(c.numInst>=d.m_limit)){for(i=0;i<b.length;++i){var e=b[i].index;t=C[e];g=f.m_Clusters[e].FillClusterData(R,t[a],x,y,t,v[e],e,g);}}else{c.b2Cluster=false;for(i=0;i<b.length;++i){t=C[b[i].index];t[a].b2Cluster=false;}}return;};d.InitializeGridClusterData=function(s,n,a,b,c,e){var m=[];m.cI=n;m.nX=c;m.nY=e;m.XPerTile=s.m_nWidthCanvas/(s.m_nTilesX*d.m_dividerX);m.YPerTile=s.m_nHeightCanvas/(s.m_nTilesY*d.m_dividerY);var g=0;for(var x=0;x<c;++x){for(var y=0;y<e;++y){var h={};h.numInst=0;h.bw=[];h.sq=g++;m.push(h);}}m.m_BaseX=a;m.m_BaseY=b;return m;};d.InitializeDistClusterData=function(s,n,x,y,a,b){var e={};e.numInst=0;e.type=d.m_type;e.cI=n;return e;};d.InitializeTreeClusterData=function(s,n,x,y,a,b){var e={};e.numInst=0;e.type=d.m_type;return e;};d.FillSquareEdges=function(e,b,s,x,y,a,c){var r=[];r.push([[x,y],[a,y]]);r.push([[a,y],[a,c]]);r.push([[a,c],[x,c]]);r.push([[x,c],[x,y]]);e.e=r;if(b){var g=[];var h=(a-x)/256*Math.abs(s)/2;var i=(c-y)/256*Math.abs(s)/2;g.push([[x+h,y+i],[a-h,y+i]]);g.push([[a-h,y+i],[a-h,c-i]]);g.push([[a-h,c-i],[x+h,c-i]]);g.push([[x+h,c-i],[x+h,y+i]]);e.ei=g;}};d.FillClusterData=function(R,c,x,y,m,v,n,g){var a=R.clust[n];var b=m.XPerTile;var e=m.YPerTile;var h=f.th*m.m_BaseX;var i=f.th*m.m_BaseY;if(d.m_omitEmpties&&!c.numInst){c.b2Cluster=false;return g;}c.b2Cluster=true;var j=y*e;var k=j+e;var l=x*b;var o=l+b;var p=b/2;var q=e/2;var r=[(h+l+p+d.m_dispOffsetX)/a.m_lodOffset,(i+j+q+d.m_dispOffsetY)/a.m_lodOffset,0,0];d.FillSquareEdges(r,a.config.b2Times,a.config.bSize,(h+l)/a.m_lodOffset,(i+j)/a.m_lodOffset,(h+o)/a.m_lodOffset,(i+k)/a.m_lodOffset);r.sq=c.sq;r.cI=m.cI;r.h=r.s=false;r.im=v.m_image;r.sc=v.m_scale;r.hscale=v.m_hotscale;r.hcol=v.m_hotcol;r.al=v.m_alignment;r.cnt=c.numInst;if(d.m_textfont!=undefined){r.f=d.m_textfont;r.fc=d.m_textcolor;r.fs=d.m_textfontscale;r.fz=d.m_textfontsize;r.fo=d.m_textoffset;r.foy=d.m_textoffsetY;}r.isCl=1;r.nJ=a.length;r.grI=g;r.bw=c.bw;a.push(r);return g+1;};d.doDistClustering=function(n,R,o,c){var i,j,a,b,e;var T=[];var g={};var l=R.clust[n].m_lodOffset;var h=o/l;for(i=0;i<R.base.length;++i){g=R.base[i];for(j=0;j<g.length;++j){if(g[j].cI==n){T.push(g[j]);if(g[j].b2Ignore){g.m_nNumIgnore--;g[j].b2Ignore=false;}g[j].isGrouped=false;}}}if(!T.length){return[];}T.sort(function(a,b){return a[0]-b[0];});var k=T.length-1;var G=0;var m=T[0],p=T[k];var q=m[0]-p[0]+c;if(q<=h){for(i=0;i<k;++i){a=T[i];b=T[i+1];e=b[0]-a[0];if(e>h){G=i+1;break;}}}var r=[];var s,u,x,v,w,y;var z=T.length+G;var A=T.length;for(i=G;i<z;++i){w=i%A;a=T[w];if(a.isGrouped){continue;}x=a[0];if(i>A-1){x+=c;}for(j=i+1;j<z;++j){y=j%A;b=T[y];if(b.isGrouped){continue;}v=b[0];if(j>A-1){v+=c;}if(v-x<=h){if(a.isGrouped&&r.length>0){s=r[a.nGrp].minY;u=r[a.nGrp].maxY;}else{s=a[1];u=a[1];}if(Math.abs(b[1]-s)<=h&&Math.abs(b[1]-u)<=h){if(a.isGrouped){r[a.nGrp].push(b);b.isGrouped=true;b.nGrp=a.nGrp;b.b2Ignore=true;R.base[b.vI].m_nNumIgnore++;if(b[1]<r[a.nGrp].minY){r[a.nGrp].minY=b[1];}if(b[1]>r[a.nGrp].maxY){r[a.nGrp].maxY=b[1];}if(v<r[a.nGrp].minX){r[a.nGrp].minX=v;}if(v>r[a.nGrp].maxX){r[a.nGrp].maxX=v;}if(r[a.nGrp].sumX==undefined){r[a.nGrp].sumX=v;}else{r[a.nGrp].sumX+=v;}if(r[a.nGrp].sumY==undefined){r[a.nGrp].sumY=b[1];}else{r[a.nGrp].sumY+=b[1];}}else{var B=[];B.push(a);B.push(b);r.push(B);var C=r.length-1;a.isGrouped=true;a.nGrp=C;a.b2Ignore=true;R.base[a.vI].m_nNumIgnore++;b.isGrouped=true;b.nGrp=C;b.b2Ignore=true;R.base[b.vI].m_nNumIgnore++;if(a[1]<b[1]){r[C].minY=a[1];r[C].maxY=b[1];}else{r[C].minY=b[1];r[C].maxY=a[1];}if(x<v){r[C].minX=x;r[C].maxX=v;}else{r[C].minX=v;r[C].maxX=x;}if(r[C].sumX==undefined){r[C].sumX=x+v;}else{r[C].sumX+=x+v;}if(r[C].sumY==undefined){r[C].sumY=a[1]+b[1];}else{r[C].sumY+=a[1]+b[1];}}}}else{break;}}}return r;};d.distFillClusterData=function(s,a,R,v,c){for(var i=0;i<a.length;++i){var m=a[i];var l=m.length;var x=m.sumX/l;var y=m.sumY/l;var e=[x,y,0,0];e.bo=[m.minX,m.minY,m.maxX,m.maxY];e.h=false;e.hscale=v.m_hotscale;e.hcol=v.m_hotcol;e.al=v.m_alignment;e.s=false;e.im=v.m_image;e.sc=v.m_scale;e.cnt=l;if(d.m_textfont!=undefined){e.f=d.m_textfont;e.fc=d.m_textcolor;e.fs=d.m_textfontscale;e.fz=d.m_textfontsize;e.fo=d.m_textoffset;e.foy=d.m_textoffsetY;}e.bw=m;e.isCl=3;e.nJ=R.clust[c].length;R.clust[c].push(e);e.grI=1;e.cI=c;}R.config.bNeedsShadowLayer=d.fillDistConfig(R.clust[c],R.config,R)||R.config.bNeedsShadowLayer;R.base[v.m_index].clusterings.push({i:c,t:1});return true;};d.AddEdgeChain=function(n){var r=[];var l=n[0],a,b;var c=n.length;for(var i=1;i<c;++i){a=n[i];b=Math.max(Math.abs(l[0]-a[0]),Math.abs(l[1]-a[1]));r.push({s:l[2],d:a[2],l:b,c:undefined});l=a;}return r;};d.doTreeClustering=function(n,R,v,c,e){var T=[];var g={};var i,j;for(i=0;i<R.base.length;++i){g=R.base[i];for(j=0;j<g.length;++j){if(g[j].cI==n){var h=g[j];while(h[0]<0){h[0]+=e;}while(h[0]>e){h[0]-=e;}h.lod=30;h.cnt=1;h.e=[];T.push(h);h.b2Ignore=true;g.m_nNumIgnore++;h.vo=i;}}}var a,k,b;T.sort(function(a,b){return a[0]!=b[0]?a[0]-b[0]:a[1]-b[1];});if(R.m_SelectedVOs.length){for(var l=0;l<T.length;++l){if(T[l].s){for(var m=0;m<R.m_SelectedVOs.length;m++){if(T[l].nI==R.m_SelectedVOs[m].m_dataIndex){R.m_SelectedVOs[m].m_index=l;R.m_SelectedVOs[m].cI=n;}}}}}var o=T.length-1;if(o<0){return[];}var G=0;var p=[];var q=T[0],r=T[o];var s=q[0]-r[0]+e;var u=c*e/f.tw;if(s<u){for(i=0;i<o;++i){a=T[i];b=T[i+1];k=b[0]-a[0];if(k>s){G=i+1;s=k;if(s>u){break;}}}}VBI.Trace("iGap is "+G);var w=T.length;var z=G+w;var A=-1,B;var C=[];var x,y;for(i=G;i<z;++i){if(i>=w){j=i-w;(T[j])[0]+=e;}else{j=i;}a=T[j];a.bo=[a[0],a[1],a[0],a[1]];x=a[0];y=a[1];if(A!=-1&&x===B[0]&&y===B[1]){C.push({s:A,d:j,l:0,z:1,zero:true});}else{p.push([x,y,j]);A=j;B=a;}}var F=D.triangulate(p);var H=F[0];var I=F[1];if(H.length==0){H=d.AddEdgeChain(p);}H.sort(function(a,b){var L=a.l-b.l;if(L){return L;}L=a.s-b.s;if(L){return L;}L=a.d-b.d;return L?L:b.v-a.v;});var J=C.concat(H);var K=(1<<R.config.m_BaseLod);for(j=0;j<T.length;j++){T[j].nJ=j;}d.clcnt=T.length;R.config.m_0ref=d.buildTree(T,n,J,v,c,e);R.config.m_ref=R.config.m_0ref/K;d.determineClusterPositions(T.m_TreeFatherNode);d.assembleAreaInfo(T,J,I);T.m_edges=J;return T;};d.determineClusterPositions=function(n){if(n.isCl){var x=0,y=0,b=n.bw,c;for(var i=b.length;i--;){c=d.determineClusterPositions(b[i]);x+=(c[0]*c[2]);y+=(c[1]*c[2]);}n[0]=x/n.cnt;n[1]=y/n.cnt;}return[n[0],n[1],n.cnt];};d.AddVirtuals=function(n,a,v){var m=v[a];if(m.executed==undefined){var s=m.v0,b;if(s){for(var i=0;i<m.length;++i){b=m[i];n.e.push([[s.c[0],s.c[1]],[b.c[0],b.c[1]]]);}}else{s=m[0];b=m[1];n.e.push([[s.c[0],s.c[1]],[b.c[0],b.c[1]]]);}}};d.AddEdge=function(n,e,a,v,s,b,c){if(!s||!b){n.e.push(c);}if(e.v){if(s){d.AddVirtuals(n,e.s,v);}if(b){d.AddVirtuals(n,e.d,v);}}return n.c;};d.MarkVirtuals=function(s,a,v){v[s].executed=true;v[a].executed=true;};d.assembleAreaInfo=function(n,e,v){var a,b,c,g;var l=e.length-1;for(var i=0;i<=l;++i){var s=false;a=e[i];b=i<l?e[i+1]:undefined;if(a.l&&a.s>=0&&a.d>=0){c=n[a.s];g=n[a.d];if((i<l)&&(a.s===b.s)&&(a.d===b.d)){while(c!=undefined&&s==false){if(c.lod<g.lod){g=d.AddEdge(g,a,b,v,false,true,i);}else if(c.lod>g.lod){c=d.AddEdge(c,a,b,v,true,false,i);}else if(c.nJ===g.nJ){if(a.v){c=d.AddEdge(c,a,b,v,true,true,i);g=g.c;}else{s=true;}}else{c=d.AddEdge(c,a,b,v,true,false,i);g=d.AddEdge(g,a,b,v,false,true,i);}}i++;}}if(a.v){v[a.s].executed=true;v[a.d].executed=true;}}};d.recCheck=function(n,N,e,a,b,c,g,h,v,j,l,k,m,o){var p=[];var q=[0,0];var r=b[c];var s,u,i,w;var x=d.analyzePath(p,N,e,r,h,j,l,k,m);if(x.nLod==h){return q;}var y=N[x.i];if(x.nLod==x.oLod){if(d.NodeMerge(x.nLod,b,c,N,x.i)&&c){if(c){q=d.recCheck(n,N,x.i-1,x.i-1,b,c-1,c-1,x.nLod,v,j,l,k,m,o+1);}}}else if(r.lod>x.nLod){d.Merge2NewNode(n,x.nLod,N[x.i],r,N,x.i+1,v);q[1]=1;}else{q=d.recCheck(n,b,c,g,N,x.i,a,r.lod-1,v,j,l,k,m,o+1);if(p.length>1){var z=x.i+1+q[0];var A=N[z];var B=e+q[0];d.NodeMerge(A.lod,b,c+q[1],N,z);for(i=z;i<=a+q[0];i++){w=N[i];if(i<B){w.bo=p[e+q[0]-i];}else{s=w.bo;u=r.bo;w.bo=[Math.min(s[0],u[0]),Math.min(s[1],u[1]),Math.max(s[2],u[2]),Math.max(s[3],u[3])];}w.cnt+=(r.cnt-y.cnt);}}return[q[1],q[0]];}for(i=x.i;i<=a;i++){w=N[i+q[1]];w.cnt+=r.cnt;if(i<=e){w.bo=p[e-i];}else{s=w.bo;u=r.bo;w.bo=[Math.min(s[0],u[0]),Math.min(s[1],u[1]),Math.max(s[2],u[2]),Math.max(s[3],u[3])];}}return q;};d.buildTree=function(n,c,a,v,b,g){var l=1/Math.log(2);d.dLog2=l;var h=l*Math.log(g/f.tw)+4;var p,s,j,i;var k,m,e,o,q;for(e=0;e<a.length;++e){var r=a[e];if(p&&(r.s==p.s)&&(r.d==p.d)){continue;}p=r;j=r.l;var u=Math.floor(Math.min(24,l*Math.log(b/j)+h));var N=[n[r.s]];for(i=0;N[i].c!=undefined;++i){N[i+1]=N[i].c;}k=N[i];var w=[n[r.d]];for(i=0;w[i].c!=undefined;++i){w[i+1]=w[i].c;}m=w[i];s=false;if((N.length==1)&&(w.length>1)){s=true;}else if(w.length>1){if((m.lod<k.lod)||((m.lod==k.lod)&&(m.cnt>k.cnt))){s=true;}}o=N.length-1;q=w.length-1;var x=-1000,M=0;if(k.nJ==m.nJ){do{x=k.lod;k=N[--o];m=w[--q];}while(k.nJ==m.nJ);}if(s){d.recCheck(n,w,q,q,N,o,o,x,v,u,h,b,M,0);}else{d.recCheck(n,N,o,o,w,q,q,x,v,u,h,b,M,0);}}if(n.length){var y=n[0];while(y.c!=undefined){y=y.c;}y.cI=c;n.m_TreeFatherNode=y;}return b/(2*Math.exp(-h/l));};d.Merge2NewNode=function(n,l,u,e,N,i,v){var a=u.c;var b=e.c;var c={lod:l,nJ:d.clcnt++,isCl:4,cnt:u.cnt,e:[],h:false,hscale:v.m_hotscale,hcol:v.m_hotcol,s:false,im:v.m_image,sc:v.m_scale,f:d.m_textfont,fc:d.m_textcolor,fs:d.m_textfontscale,fz:d.m_textfontsize,fo:d.m_textoffset,foy:d.m_textoffsetY,al:v.m_alignment,grI:1};c.bw=[u,e];u.c=c;e.c=c;N.splice(i,0,c);if(a!=undefined){c.c=a;d.ReplaceBWE(a.bw,u.nJ,c);}if(b!=undefined){d.RemoveBWE(b.bw,e.nJ);}n.push(c);return c;};d.NodeMerge=function(n,l,a,b,c){var r=false;var e=b[c];var g=l[a];var o=g.c;if(n<g.lod){e.bw.push(g);g.c=e;}else{var h;for(var i=g.bw.length;i--;){h=g.bw[i];h.c=e;e.bw.push(h);g.bw[i]=undefined;}g.bInvalid=true;r=true;}if(o!=undefined){d.RemoveBWE(o.bw,g.nJ);}return r;};d.ReplaceBWE=function(m,o,e){for(var i=m.length;i--;){if(m[i].nJ==o){if(e==-1){m.splice(i,1);}else{m[i]=e;}}}};d.RemoveBWE=function(m,o){for(var i=m.length;i--;){if(m[i].nJ==o){m.splice(i,1);}}};d.r=function(x){return Math.round(1000*x)/1000;};d.analyzePath=function(B,n,i,e,a,b,l,c,g){var h=n[i];var j=h.bo,k=e.bo;var m=[Math.min(j[0],k[0]),Math.min(j[1],k[1]),Math.max(j[2],k[2]),Math.max(j[3],k[3])];var o=Math.max(m[2]-m[0],m[3]-m[1]);var p=Math.floor(Math.min(24,d.dLog2*Math.log(c/o)+l));if(p<=a){return{i:i+1,nLod:a,oLod:a};}B.push(m);if((i==0)||(p<h.lod)||g){return{i:i,nLod:p,oLod:h.lod};}return d.analyzePath(B,n,i-1,e,p,b,l,c);};d.fillClusterConfig=function(m,b,a,A){var e={};e.bCol=d.m_bordercol;e.bSize=Math.abs(d.m_bordersize);if(d.m_bordersize<0){e.b2Times=true;}e.fCol=d.m_fillcol;e.permArea=d.m_permanentArea;if(d.m_bordercol2){e.bCol2=d.m_bordercol2;}if(d.m_bordercol3){e.bCol3=d.m_bordercol3;}if(d.m_fillcol2){e.fCol2=d.m_fillcol2;}if(d.m_fillcol3){e.fCol3=d.m_fillcol3;}e.sCol=d.m_spotcol;e.sSize=d.m_spotsize;e.anim=(VBI.m_bIsMobile||!A)?undefined:d.m_animated;e.animLow=Math.ceil(a);e.baseConf=b;m.config=e;return((e.bCol!=undefined)||(e.sCol&&e.sSize));};d.fillDistConfig=function(m,b,R){var e={};e.baseConf=b;m.config=e;if((d.m_spotsize!=undefined)&&(d.m_spotsize!=0)&&(d.m_spotcol!=undefined)){e.sCol=d.m_spotcol;e.sSize=d.m_spotsize;e.base=R.base;return true;}return false;};d.treeFillClusterData=function(s,a,R,v,n,m){R.clust[n]=a;R.clust[n].hotItem=R.hotItem;R.clust[n].cI=n;R.clust[n].m_lodOffset=1;R.clust[n].m_nRecalcs=0;R.base[v.m_index].clusterings.push({i:n,t:2});R.config.bNeedsShadowLayer=d.fillClusterConfig(R.clust[n],R.config,m,true)||R.config.bNeedsShadowLayer;return true;};return d;};D={supertriangle:function(v){var x=Number.POSITIVE_INFINITY,y=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY,b=Number.NEGATIVE_INFINITY,i,d,c,e,g,h;for(i=v.length;i--;){if(v[i][0]<x){x=v[i][0];}if(v[i][0]>a){a=v[i][0];}if(v[i][1]<y){y=v[i][1];}if(v[i][1]>b){b=v[i][1];}}d=a-x;c=b-y;e=Math.max(d,c);g=x+d*0.5;h=y+c*0.5;return[[g-40*e,h-e,-1],[g,h+40*e,-2],[g+40*e,h-e,-3]];},circumcircle:function(v,i,j,k){var x=v[i][0],y=v[i][1],a=v[j][0],b=v[j][1],c=v[k][0],d=v[k][1],e=Math.abs(y-b),g=Math.abs(b-d),h,l,m,n,o,p,q,r,s,u;if(e<E){n=-((c-a)/(d-b));p=(a+c)/2.0;r=(b+d)/2.0;h=(a+x)/2.0;l=n*(h-p)+r;}else if(g<E){m=-((a-x)/(b-y));o=(x+a)/2.0;q=(y+b)/2.0;h=(c+a)/2.0;l=m*(h-o)+q;}else{m=-((a-x)/(b-y));n=-((c-a)/(d-b));o=(x+a)/2.0;p=(a+c)/2.0;q=(y+b)/2.0;r=(b+d)/2.0;h=(m*o-n*p+r-q)/(m-n);l=(e>g)?m*(h-o)+q:n*(h-p)+r;}s=a-h;u=b-l;return{i:i,j:j,k:k,x:h,y:l,r:s*s+u*u};},dedup:function(e){var i,j,a,b,m,n;for(j=e.length;j;){b=e[--j];a=e[--j];for(i=j;i;){n=e[--i];m=e[--i];if((a===m&&b===n)||(a===n&&b===m)){e.splice(j,2);e.splice(i,2);break;}}}},assemble:function(o,a,v,b,n){o.length=0;var i;for(i=a.length;i--;){var d=(a[i].i>=n)+(a[i].j>=n)+(a[i].k>=n);var e=[a[i].i,a[i].j,a[i].k];e.sort();var g=b[e[0]],h=b[e[1]],j=b[e[2]];var k=Math.max(Math.abs(g[0]-h[0]),Math.abs(g[1]-h[1]));var l=Math.max(Math.abs(g[0]-j[0]),Math.abs(g[1]-j[1]));var m=Math.max(Math.abs(j[0]-h[0]),Math.abs(j[1]-h[1]));var c=[a[i].x,a[i].y];var p=(b[e[0]])[2],q=(b[e[1]])[2],r=(b[e[2]])[2];if(p>=0&&q>=0){o.push({s:p,d:q,l:k,c:c,v:d});}if(p>=0&&r>=0){o.push({s:p,d:r,l:l,c:c,v:d});}if(q>=0&&r>=0){o.push({s:q,d:r,l:m,c:c,v:d});}if(d){if(p>=0){this.addToVirtual(v,p,q,r,c,d);}if(q>=0){this.addToVirtual(v,q,p,r,c,d);}if(r>=0){this.addToVirtual(v,r,p,q,c,d);}}}return o;},triangulate:function(v,k){var n=v.length,i,j,d,s,o,e,g,h,l,m,a,b,c;if(n<1){return[];}v=v.slice(0);if(k){for(i=n;i--;){v[i]=v[i][k];}}d=new Array(n);for(i=n;i--;){d[i]=i;}d.sort(function(i,j){return v[j][0]-v[i][0];});s=this.supertriangle(v);v.push(s[0],s[1],s[2]);o=[this.circumcircle(v,n+0,n+1,n+2)];e=[];g=[];h=[];for(i=d.length;i--;g.length=0){c=d[i];for(j=o.length;j--;){l=v[c][0]-o[j].x;if(l>0.0&&l*l>o[j].r){e.push(o[j]);o.splice(j,1);continue;}m=v[c][1]-o[j].y;if(l*l+m*m-o[j].r>E){continue;}g.push(o[j].i,o[j].j,o[j].j,o[j].k,o[j].k,o[j].i);o.splice(j,1);}this.dedup(g);for(j=g.length;j;){b=g[--j];a=g[--j];o.push(this.circumcircle(v,a,b,c));}}for(i=o.length;i--;){e.push(o[i]);}o=this.assemble(o,e,h,v,n);return[o,h];},addToVirtual:function(v,a,b,d,c,n){var e={n1:b,n2:d,c:c,v:n};if(v[a]==undefined){v[a]=[];}if(b<0&&d<0){v[a].v0=e;}else{v[a].push(e);}},contains:function(e,p){if((p[0]<e[0][0]&&p[0]<e[1][0]&&p[0]<e[2][0])||(p[0]>e[0][0]&&p[0]>e[1][0]&&p[0]>e[2][0])||(p[1]<e[0][1]&&p[1]<e[1][1]&&p[1]<e[2][1])||(p[1]>e[0][1]&&p[1]>e[1][1]&&p[1]>e[2][1])){return null;}var a=e[1][0]-e[0][0],b=e[2][0]-e[0][0],c=e[1][1]-e[0][1],d=e[2][1]-e[0][1],i=a*d-b*c;if(i===0.0){return null;}var u=(d*(p[0]-e[0][0])-b*(p[1]-e[0][1]))/i,v=(a*(p[1]-e[0][1])-c*(p[0]-e[0][0]))/i;if(u<0.0||v<0.0||(u+v)>1.0){return null;}return[u,v];}};return f;}
;
