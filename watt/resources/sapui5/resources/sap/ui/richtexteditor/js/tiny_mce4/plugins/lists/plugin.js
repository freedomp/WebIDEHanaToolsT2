tinymce.PluginManager.add('lists',function(a){var s=this;function b(n){return n&&(/^(OL|UL|DL)$/).test(n.nodeName);}function c(n){return n.parentNode.firstChild==n;}function d(n){return n.parentNode.lastChild==n;}function f(n){return n&&!!a.schema.getTextBlockElements()[n.nodeName];}a.on('init',function(){var g=a.dom,h=a.selection;function j(e,i){var y=g.isEmpty(e);if(i&&g.select('span[data-mce-type=bookmark]').length>0){return false;}return y;}function k(e){var i={};function y(B){var C,D,E;D=e[B?'startContainer':'endContainer'];E=e[B?'startOffset':'endOffset'];if(D.nodeType==1){C=g.create('span',{'data-mce-type':'bookmark'});if(D.hasChildNodes()){E=Math.min(E,D.childNodes.length-1);if(B){D.insertBefore(C,D.childNodes[E]);}else{g.insertAfter(C,D.childNodes[E]);}}else{D.appendChild(C);}D=C;E=0;}i[B?'startContainer':'endContainer']=D;i[B?'startOffset':'endOffset']=E;}y(true);if(!e.collapsed){y();}return i;}function m(e){function i(B){var C,D,E;function F(C){var E=C.parentNode.firstChild,G=0;while(E){if(E==C){return G;}if(E.nodeType!=1||E.getAttribute('data-mce-type')!='bookmark'){G++;}E=E.nextSibling;}return-1;}C=E=e[B?'startContainer':'endContainer'];D=e[B?'startOffset':'endOffset'];if(!C){return;}if(C.nodeType==1){D=F(C);C=C.parentNode;g.remove(E);}e[B?'startContainer':'endContainer']=C;e[B?'startOffset':'endOffset']=D;}i(true);i();var y=g.createRng();y.setStart(e.startContainer,e.startOffset);if(e.endContainer){y.setEnd(e.endContainer,e.endOffset);}h.setRng(y);}function l(e,i){var y,B,C=g.createFragment(),D;var E=a.schema.getBlockElements();if(a.settings.forced_root_block){i=i||a.settings.forced_root_block;}if(i){B=g.create(i);if(B.tagName===a.settings.forced_root_block){g.setAttribs(B,a.settings.forced_root_block_attrs);}C.appendChild(B);}if(e){while((y=e.firstChild)){var F=y.nodeName;if(!D&&(F!='SPAN'||y.getAttribute('data-mce-type')!='bookmark')){D=true;}if(E[F]){C.appendChild(y);B=null;}else{if(i){if(!B){B=g.create(i);C.appendChild(B);}B.appendChild(y);}else{C.appendChild(y);}}}}if(!a.settings.forced_root_block){C.appendChild(g.create('br'));}else{if(!D&&(!tinymce.Env.ie||tinymce.Env.ie>10)){B.appendChild(g.create('br',{'data-mce-bogus':'1'}));}}return C;}function n(){return tinymce.grep(h.getSelectedBlocks(),function(e){return/^(LI|DT|DD)$/.test(e.nodeName);});}function o(e,i,y){var B,C,D,E;function F(G){tinymce.each(D,function(E){G.parentNode.insertBefore(E,i.parentNode);});g.remove(G);}D=g.select('span[data-mce-type="bookmark"]',e);y=y||l(i);B=g.createRng();B.setStartAfter(i);B.setEndAfter(e);C=B.extractContents();for(E=C.firstChild;E;E=E.firstChild){if(E.nodeName=='LI'&&g.isEmpty(E)){g.remove(E);break;}}if(!g.isEmpty(C)){g.insertAfter(C,e);}g.insertAfter(y,e);if(j(i.parentNode)){F(i.parentNode);}g.remove(i);if(j(e)){g.remove(e);}}function p(e){var i,y;i=e.nextSibling;if(i&&b(i)&&i.nodeName==e.nodeName){while((y=i.firstChild)){e.appendChild(y);}g.remove(i);}i=e.previousSibling;if(i&&b(i)&&i.nodeName==e.nodeName){while((y=i.firstChild)){e.insertBefore(y,e.firstChild);}g.remove(i);}}function q(e){tinymce.each(tinymce.grep(g.select('ol,ul',e)),function(i){var y,B=i.parentNode;if(B.nodeName=='LI'&&B.firstChild==i){y=B.previousSibling;if(y&&y.nodeName=='LI'){y.appendChild(i);if(j(B)){g.remove(B);}}}if(b(B)){y=B.previousSibling;if(y&&y.nodeName=='LI'){y.appendChild(i);}}});}function r(e){var i=e.parentNode,y=i.parentNode,B;function C(e){if(j(e)){g.remove(e);}}if(e.nodeName=='DD'){g.rename(e,'DT');return true;}if(c(e)&&d(e)){if(y.nodeName=="LI"){g.insertAfter(e,y);C(y);g.remove(i);}else if(b(y)){g.remove(i,true);}else{y.insertBefore(l(e),i);g.remove(i);}return true;}else if(c(e)){if(y.nodeName=="LI"){g.insertAfter(e,y);e.appendChild(i);C(y);}else if(b(y)){y.insertBefore(e,i);}else{y.insertBefore(l(e),i);g.remove(e);}return true;}else if(d(e)){if(y.nodeName=="LI"){g.insertAfter(e,y);}else if(b(y)){g.insertAfter(e,i);}else{g.insertAfter(l(e),i);g.remove(e);}return true;}if(y.nodeName=='LI'){i=y;B=l(e,'LI');}else if(b(y)){B=l(e,'LI');}else{B=l(e);}o(i,e,B);q(i.parentNode);return true;}function t(e){var i,y;function B(C,D){var E;if(b(C)){while((E=e.lastChild.firstChild)){D.appendChild(E);}g.remove(C);}}if(e.nodeName=='DT'){g.rename(e,'DD');return true;}i=e.previousSibling;if(i&&b(i)){i.appendChild(e);return true;}if(i&&i.nodeName=='LI'&&b(i.lastChild)){i.lastChild.appendChild(e);B(e.lastChild,i.lastChild);return true;}i=e.nextSibling;if(i&&b(i)){i.insertBefore(e,i.firstChild);return true;}if(i&&i.nodeName=='LI'&&b(e.lastChild)){return false;}i=e.previousSibling;if(i&&i.nodeName=='LI'){y=g.create(e.parentNode.nodeName);i.appendChild(y);y.appendChild(e);B(e.lastChild,y);return true;}return false;}function u(){var e=n();if(e.length){var y=k(h.getRng(true));for(var i=0;i<e.length;i++){if(!t(e[i])&&i===0){break;}}m(y);a.nodeChanged();return true;}}function v(){var e=n();if(e.length){var B=k(h.getRng(true));var i,y,C=a.getBody();i=e.length;while(i--){var D=e[i].parentNode;while(D&&D!=C){y=e.length;while(y--){if(e[y]===D){e.splice(i,1);break;}}D=D.parentNode;}}for(i=0;i<e.length;i++){if(!r(e[i])&&i===0){break;}}m(B);a.nodeChanged();return true;}}function w(e){var i=h.getRng(true),y=k(i),B='LI';e=e.toUpperCase();if(e=='DL'){B='DT';}function C(){var D=[],E=a.getBody();function F(L){var M,N;M=i[L?'startContainer':'endContainer'];N=i[L?'startOffset':'endOffset'];if(M.nodeType==1){M=M.childNodes[Math.min(N,M.childNodes.length-1)]||M;}while(M.parentNode!=E){if(f(M)){return M;}if(/^(TD|TH)$/.test(M.parentNode.nodeName)){return M;}M=M.parentNode;}return M;}var G=F(true);var H=F();var I,J=[];for(var K=G;K;K=K.nextSibling){J.push(K);if(K==H){break;}}tinymce.each(J,function(K){if(f(K)){D.push(K);I=null;return;}if(g.isBlock(K)||K.nodeName=='BR'){if(K.nodeName=='BR'){g.remove(K);}I=null;return;}var L=K.nextSibling;if(tinymce.dom.BookmarkManager.isBookmarkNode(K)){if(f(L)||(!L&&K.parentNode==E)){I=null;return;}}if(!I){I=g.create('p');K.parentNode.insertBefore(I,K);D.push(I);}I.appendChild(K);});return D;}tinymce.each(C(),function(D){var E,F;F=D.previousSibling;if(F&&b(F)&&F.nodeName==e){E=F;D=g.rename(D,B);F.appendChild(D);}else{E=g.create(e);D.parentNode.insertBefore(E,D);E.appendChild(D);D=g.rename(D,B);}p(E);});m(y);}function x(){var e=k(h.getRng(true)),i=a.getBody();tinymce.each(n(),function(y){var B,C;if(j(y)){r(y);return;}for(B=y;B&&B!=i;B=B.parentNode){if(b(B)){C=B;}}o(C,y);});m(e);}function z(e){var i=g.getParent(h.getStart(),'OL,UL,DL');if(i){if(i.nodeName==e){x(e);}else{var y=k(h.getRng(true));p(g.rename(i,e));m(y);}}else{w(e);}}function A(e){return function(){var i=g.getParent(a.selection.getStart(),'UL,OL,DL');return i&&i.nodeName==e;};}s.backspaceDelete=function(i){function e(C,i){var F=C.startContainer,G=C.startOffset;var H,I;if(F.nodeType==3&&(i?G<F.data.length:G>0)){return F;}H=a.schema.getNonEmptyElements();I=new tinymce.dom.TreeWalker(C.startContainer);while((F=I[i?'next':'prev']())){if(F.nodeName=='LI'&&!F.hasChildNodes()){return F;}if(H[F.nodeName]){return F;}if(F.nodeType==3&&F.data.length>0){return F;}}}function y(F,G){var H,I,J=F.parentNode;if(b(G.lastChild)){I=G.lastChild;}H=G.lastChild;if(H&&H.nodeName=='BR'&&F.hasChildNodes()){g.remove(H);}if(j(G,true)){g.$(G).empty();}if(!j(F,true)){while((H=F.firstChild)){G.appendChild(H);}}if(I){G.appendChild(I);}g.remove(F);if(j(J)){g.remove(J);}}if(h.isCollapsed()){var B=g.getParent(h.getStart(),'LI');if(B){var C=h.getRng(true);var D=g.getParent(e(C,i),'LI');if(D&&D!=B){var E=k(C);if(i){y(D,B);}else{y(B,D);}m(E);return true;}else if(!D){if(!i&&x(B.parentNode.nodeName)){return true;}}}}};a.on('BeforeExecCommand',function(e){var i=e.command.toLowerCase(),y;if(i=="indent"){if(u()){y=true;}}else if(i=="outdent"){if(v()){y=true;}}if(y){a.fire('ExecCommand',{command:e.command});e.preventDefault();return true;}});a.addCommand('InsertUnorderedList',function(){z('UL');});a.addCommand('InsertOrderedList',function(){z('OL');});a.addCommand('InsertDefinitionList',function(){z('DL');});a.addQueryStateHandler('InsertUnorderedList',A('UL'));a.addQueryStateHandler('InsertOrderedList',A('OL'));a.addQueryStateHandler('InsertDefinitionList',A('DL'));a.on('keydown',function(e){if(e.keyCode!=9||tinymce.util.VK.metaKeyPressed(e)){return;}if(a.dom.getParent(a.selection.getStart(),'LI,DT,DD')){e.preventDefault();if(e.shiftKey){v();}else{u();}}});});a.addButton('indent',{icon:'indent',title:'Increase indent',cmd:'Indent',onPostRender:function(){var e=this;a.on('nodechange',function(){var g=a.selection.getSelectedBlocks();var h=false;for(var i=0,l=g.length;!h&&i<l;i++){var t=g[i].nodeName;h=(t=='LI'&&c(g[i])||t=='UL'||t=='OL'||t=='DD');}e.disabled(h);});}});a.on('keydown',function(e){if(e.keyCode==tinymce.util.VK.BACKSPACE){if(s.backspaceDelete()){e.preventDefault();}}else if(e.keyCode==tinymce.util.VK.DELETE){if(s.backspaceDelete(true)){e.preventDefault();}}});});