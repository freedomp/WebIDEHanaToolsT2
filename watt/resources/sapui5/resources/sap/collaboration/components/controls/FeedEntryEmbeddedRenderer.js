/**
 * ! @copyright@
 */
sap.ui.define([],function(){var F={};F.render=function(r,f){r.write("<div");r.writeControlData(f);r.write(">");if(f._shouldTextBeRendered()){var i=f.getId();var t=f._sTextWithPlaceholders;r.write("<div id='"+i+"-text' class='sapUiTinyMarginBottom sapCollaborationEmbeddedText'>");this._renderText(r,f,t);r.write("</div>");}if(f._shouldContentBeRendered()){r.renderControl(f._oTimelineItemContent);}r.write("</div>");};F._renderText=function(r,f,t){var T=f._splitByPlaceholders(t);for(var i=0;i<T.length;i++){var a=/@@.\{\d+\}/;if(a.test(T[i])){r.renderControl(f._mAtMentionsLinks[T[i]]);}else{r.writeEscaped(T[i],true);}}};return F;},true);
