// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.services.LaunchPage");sap.ushell.services.LaunchPage=function(a,c){var t=this,T=[];this._getAdapter=function(){return a;};this.getGroups=function(){var p=a.getGroups();p.fail(function(){jQuery.sap.log.error("getGroups failed");});return p;};this.getDefaultGroup=function(){var p=a.getDefaultGroup();p.fail(function(){jQuery.sap.log.error("getDefaultGroup failed");});return p;};this.getGroupTitle=function(g){return a.getGroupTitle(g);};this.getGroupId=function(g){return a.getGroupId(g);};this.getGroupTiles=function(g){return a.getGroupTiles(g);};this.getLinkTiles=function(g){return a.getLinkTiles(g);};this.addGroupAt=function(s,i){var p,b=i;if(a.addGroupAt){p=a.addGroupAt(s,i);p.fail(function(){jQuery.sap.log.error("addGroup "+s+" failed");});}else{var d=new jQuery.Deferred();p=a.addGroup(s);p.done(function(n,g){var m=this.moveGroup(n,b),e=n;m.done(function(){d.resolve(e);});m.fail(function(){d.reject();});}.bind(this));p.fail(function(){jQuery.sap.log.error("addGroup "+s+" failed");d.reject();});return d.promise();}return p;};this.addGroup=function(s){var p=a.addGroup(s);p.fail(function(){jQuery.sap.log.error("addGroup "+s+" failed");});return p;};this.removeGroup=function(g,i){var p=a.removeGroup(g,i);p.fail(function(){jQuery.sap.log.error("Fail to removeGroup "+t.getGroupTitle(g));});return p;};this.resetGroup=function(g,i){var p=a.resetGroup(g,i);p.fail(function(){jQuery.sap.log.error("Fail to resetGroup "+t.getGroupTitle(g));});return p;};this.isGroupRemovable=function(g){return a.isGroupRemovable(g);};this.isGroupLocked=function(g){if(typeof a.isGroupLocked==="function"){return a.isGroupLocked(g);}return false;};this.moveGroup=function(g,n){var p=a.moveGroup(g,n);p.fail(function(){jQuery.sap.log.error("Fail to moveGroup "+t.getGroupTitle(g));});return p;};this.setGroupTitle=function(g,s){var p=a.setGroupTitle(g,s);p.fail(function(){jQuery.sap.log.error("Fail to set Group title: "+t.getGroupTitle(g));});return p;};this.hideGroups=function(h){var d=jQuery.Deferred();if(typeof a.hideGroups!=="function"){d.reject('hideGroups() is not implemented in the Adapter.');}else{a.hideGroups(h).done(function(){d.resolve();}).fail(function(m){jQuery.sap.log.error("Fail to store groups visibility."+m);d.reject();});}return d.promise();};this.isGroupVisible=function(g){if(typeof a.isGroupVisible==="function"){return a.isGroupVisible(g);}return true;};this.addTile=function(C,g){var p=a.addTile(C,g);p.fail(function(){jQuery.sap.log.error("Fail to add Tile: "+t.getCatalogTileId(C));});return p;};this.removeTile=function(g,o,i){var p=a.removeTile(g,o,i);p.fail(function(){jQuery.sap.log.error("Fail to remove Tile: "+t.getTileId(o));});return p;};this.moveTile=function(o,s,i,S,b){var p=a.moveTile(o,s,i,S,b);p.fail(function(){jQuery.sap.log.error("Fail to move Tile: "+t.getTileId(o));});return p;};this.getTileId=function(o){return a.getTileId(o);};this.getTileTitle=function(o){return a.getTileTitle(o);};this.getTileType=function(o){if(a.getTileType){return a.getTileType(o);}return'tile';};this.getTileView=function(o){var d=a.getTileView(o);if(!jQuery.isFunction(d.promise)){d=jQuery.Deferred().resolve(d).promise();}return d;};this.getTileSize=function(o){return a.getTileSize(o);};this.getTileTarget=function(o){return a.getTileTarget(o);};this.getTileDebugInfo=function(o){if(typeof a.getTileDebugInfo==="function"){return a.getTileDebugInfo(o);}return undefined;};this.isTileIntentSupported=function(o){if(typeof a.isTileIntentSupported==="function"){return a.isTileIntentSupported(o);}return true;};this.refreshTile=function(o){a.refreshTile(o);};this.setTileVisible=function(o,n){return a.setTileVisible(o,n);};this.registerTileActionsProvider=function(p){if(typeof p!=='function'){throw new Error("Tile actions Provider is not a function");}T.push(p);};this.getTileActions=function(o){var b=[];var A;if(typeof a.getTileActions==='function'){A=a.getTileActions(o);if(A&&A.length&&A.length>0){b.push.apply(b,A);}}for(var i=0;i<T.length;i++){A=T[i](o);if(A&&A.length&&A.length>0){b.push.apply(b,A);}}return b;};this.getCatalogs=function(){return a.getCatalogs();};this.isCatalogsValid=function(){return a.isCatalogsValid();};this.getCatalogData=function(C){if(typeof a.getCatalogData!=="function"){jQuery.sap.log.warning("getCatalogData not implemented in adapter",null,"sap.ushell.services.LaunchPage");return{id:this.getCatalogId(C)};}return a.getCatalogData(C);};this.getCatalogError=function(C){return a.getCatalogError(C);};this.getCatalogId=function(C){return a.getCatalogId(C);};this.getCatalogTitle=function(C){return a.getCatalogTitle(C);};this.getCatalogTiles=function(C){var p=a.getCatalogTiles(C);p.fail(function(){jQuery.sap.log.error("Fail to get Tiles of Catalog: "+t.getCatalogTitle(C));});return p;};this.getCatalogTileId=function(o){return a.getCatalogTileId(o);};this.getCatalogTileTitle=function(C){return a.getCatalogTileTitle(C);};this.getCatalogTileSize=function(C){return a.getCatalogTileSize(C);};this.getCatalogTileView=function(C){return a.getCatalogTileView(C);};this.getCatalogTileTargetURL=function(C){return a.getCatalogTileTargetURL(C);};this.getCatalogTileTags=function(C){if(typeof a.getCatalogTileTags==="function"){return a.getCatalogTileTags(C);}return[];};this.getCatalogTileKeywords=function(C){return a.getCatalogTileKeywords(C);};this.getCatalogTilePreviewTitle=function(C){return a.getCatalogTilePreviewTitle(C);};this.getCatalogTilePreviewIcon=function(C){return a.getCatalogTilePreviewIcon(C);};this.addBookmark=function(p,g){var P,d,m;if(!p.title){jQuery.sap.log.error("Add Bookmark - Missing title");throw new Error("Title missing in bookmark configuration");}if(!p.url){jQuery.sap.log.error("Add Bookmark - Missing URL");throw new Error("URL missing in bookmark configuration");}if(g&&this.isGroupLocked(g)){d=new jQuery.Deferred();P=d.promise();m='Tile cannot be added, target group ('+this.getGroupTitle(g)+')is locked!';d.reject(m);jQuery.sap.log.error(m);}else{P=a.addBookmark(p,g);P.fail(function(){jQuery.sap.log.error("Fail to add bookmark for URL: "+p.url+" and Title: "+p.title);});}return P;};this.countBookmarks=function(u){if(!u||typeof u!=="string"){jQuery.sap.log.error("Fail to count bookmarks. No valid URL");throw new Error("Missing URL");}var p=a.countBookmarks(u);p.fail(function(){jQuery.sap.log.error("Fail to count bookmarks");});return p;};this.deleteBookmarks=function(u){if(!u||typeof u!=="string"){throw new Error("Missing URL");}var p=a.deleteBookmarks(u);p.fail(function(){jQuery.sap.log.error("Fail to delete bookmark for: "+u);});return p;};this.updateBookmarks=function(u,p){if(!u||typeof u!=="string"){jQuery.sap.log.error("Fail to update bookmark. No valid URL");throw new Error("Missing URL");}if(!p||typeof p!=="object"){jQuery.sap.log.error("Fail to update bookmark. No valid parameters, URL is: "+u);throw new Error("Missing parameters");}var P=a.updateBookmarks(u,p);P.fail(function(){jQuery.sap.log.error("Fail to update bookmark for: "+u);});return P;};this.onCatalogTileAdded=function(s){return a.onCatalogTileAdded(s);};};}());
