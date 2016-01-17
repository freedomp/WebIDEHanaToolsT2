(function(){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler');var d={getAncestorByClass:function(e,c){while(e){if(e.classList.contains(c)){return e;}e=e.parentElement;}return false;}};var T=function(){this.init.apply(this,arguments);};T.prototype={init:function(t,e){this.tilesContainer=t;this.tilesContainerElement=t.getDomRef();this.element=e;},getIndexInTilesContainer:function(){return Array.prototype.indexOf.call(this.tilesContainerElement.children,this.element);},next:function(){if((this.getIndexInTilesContainer()+1)%this.tilesContainer.getTilesPerRow()===0){return null;}if(this.element.nextElementSibling){return new T(this.tilesContainer,this.element.nextElementSibling);}return null;},previous:function(){if((this.getIndexInTilesContainer())%this.tilesContainer.getTilesPerRow()===0){return null;}if(this.element.previousElementSibling){return new T(this.tilesContainer,this.element.previousElementSibling);}return null;},upper:function(){var i=this.getIndexInTilesContainer()-this.tilesContainer.getTilesPerRow();if(i<0){return null;}return new T(this.tilesContainer,this.tilesContainerElement.children.item(i));},lower:function(){var i=this.getIndexInTilesContainer()+this.tilesContainer.getTilesPerRow();if(i>=this.tilesContainerElement.children.length){return null;}return new T(this.tilesContainer,this.tilesContainerElement.children.item(i));},focus:function(){if(this.element.classList.contains('sapUshellSearchShowMoreTile')){this.element.focus();}else{this.element.focus();}}};var K=sap.ushell.renderers.fiori2.search.controls.SearchTilesContainerKeyHandler=function(){this.init.apply(this,arguments);};K.prototype={init:function(t){this.tilesContainer=t;},getFocusedObject:function(e){var t=d.getAncestorByClass(e,'sapUshellSearchTileWrapper');if(!t){return null;}return new T(this.tilesContainer,t);},onsapdown:function(e){this.navigate('lower',e);},onsapup:function(e){this.navigate('upper',e);},onsapleft:function(e){this.navigate('previous',e);},onsapright:function(e){this.navigate('next',e);},onsapenter:function(e){var c=e.target;if(!c){return;}if(c.classList.contains('sapUshellSearchShowMoreTile')){var b=c.children.item(0);var a=sap.ui.getCore().byId(b.getAttribute('id'));a.firePress();return;}var r=window.$(e.target).find(".sapUshellTileBase, .sapUiCockpitReportTile");if(r.length>0){var t=sap.ui.getCore().byId(window.$(r[0]).attr('id'));if(t&&t.firePress){t.firePress();}}},navigate:function(m,e){e.stopPropagation();e.preventDefault();var o=this.getFocusedObject(e.target);if(!o){return;}var n=o[m].apply(o,[]);if(!n){return;}n.focus();}};})();
