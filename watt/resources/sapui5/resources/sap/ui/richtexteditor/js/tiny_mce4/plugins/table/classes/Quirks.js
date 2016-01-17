define("tinymce/tableplugin/Quirks",["tinymce/util/VK","tinymce/Env","tinymce/util/Tools","tinymce/tableplugin/Utils"],function(V,E,T,U){var a=T.each,g=U.getSpanVal;return function(b){function m(){function k(e){var l=e.keyCode;function o(c,i){var n=c?'previousSibling':'nextSibling';var r=b.dom.getParent(i,'tr');var F=r[n];if(F){A(b,i,F,c);e.preventDefault();return true;}var G=b.dom.getParent(r,'table');var H=r.parentNode;var I=H.nodeName.toLowerCase();if(I==='tbody'||I===(c?'tfoot':'thead')){var J=p(c,G,H,'tbody');if(J!==null){return s(c,J,i);}}return t(c,r,n,G);}function p(c,i,n,r){var F=b.dom.select('>'+r,i);var G=F.indexOf(n);if(c&&G===0||!c&&G===F.length-1){return q(c,i);}else if(G===-1){var H=n.tagName.toLowerCase()==='thead'?0:F.length-1;return F[H];}return F[G+(c?-1:1)];}function q(c,i){var n=c?'thead':'tfoot';var r=b.dom.select('>'+n,i);return r.length!==0?r[0]:null;}function s(c,i,n){var r=u(i,c);if(r){A(b,n,r,c);}e.preventDefault();return true;}function t(c,i,n,r){var F=r[n];if(F){v(F);return true;}var G=b.dom.getParent(r,'td,th');if(G){return o(c,G,e);}var H=u(i,!c);v(H);e.preventDefault();return false;}function u(c,i){var n=c&&c[i?'lastChild':'firstChild'];return n&&n.nodeName==='BR'?b.dom.getParent(n,'td,th'):n;}function v(n){b.selection.setCursorLocation(n,0);}function w(){return l==V.UP||l==V.DOWN;}function x(b){var n=b.selection.getNode();var c=b.dom.getParent(n,'tr');return c!==null;}function y(i){var n=0;var c=i;while(c.previousSibling){c=c.previousSibling;n=n+g(c,"colspan");}return n;}function z(n,y){var c=0,r=0;a(n.children,function(F,i){c=c+g(F,"colspan");r=i;if(c>y){return false;}});return r;}function A(c,n,r,i){var F=y(b.dom.getParent(n,'td,th'));var G=z(r,F);var H=r.childNodes[G];var I=u(H,i);v(I||H);}function B(D){var n=b.selection.getNode();var c=b.dom.getParent(n,'td,th');var i=b.dom.getParent(D,'td,th');return c&&c!==i&&C(c,i);}function C(n,N){return b.dom.getParent(n,'TABLE')===b.dom.getParent(N,'TABLE');}if(w()&&x(b)){var D=b.selection.getNode();setTimeout(function(){if(B(D)){o(!e.shiftKey&&l===V.UP,D,e);}},0);}}b.on('KeyDown',function(e){k(e);});}function f(){function i(r,p){var c=p.ownerDocument,e=c.createRange(),k;e.setStartBefore(p);e.setEnd(r.endContainer,r.endOffset);k=c.createElement('body');k.appendChild(e.cloneContents());return k.innerHTML.replace(/<(br|img|object|embed|input|textarea)[^>]*>/gi,'-').replace(/<[^>]+>/g,'').length===0;}b.on('KeyDown',function(e){var r,t,c=b.dom;if(e.keyCode==37||e.keyCode==38){r=b.selection.getRng();t=c.getParent(r.startContainer,'table');if(t&&b.getBody().firstChild==t){if(i(r,t)){r=c.createRng();r.setStartBefore(t);r.setEndBefore(t);b.selection.setRng(r);e.preventDefault();}}}});}function d(){b.on('KeyDown SetContent VisualAid',function(){var l;for(l=b.getBody().lastChild;l;l=l.previousSibling){if(l.nodeType==3){if(l.nodeValue.length>0){break;}}else if(l.nodeType==1&&(l.tagName=='BR'||!l.getAttribute('data-mce-bogus'))){break;}}if(l&&l.nodeName=='TABLE'){if(b.settings.forced_root_block){b.dom.add(b.getBody(),b.settings.forced_root_block,b.settings.forced_root_block_attrs,E.ie&&E.ie<11?'&nbsp;':'<br data-mce-bogus="1" />');}else{b.dom.add(b.getBody(),'br',{'data-mce-bogus':'1'});}}});b.on('PreProcess',function(o){var l=o.node.lastChild;if(l&&(l.nodeName=="BR"||(l.childNodes.length==1&&(l.firstChild.nodeName=='BR'||l.firstChild.nodeValue=='\u00a0')))&&l.previousSibling&&l.previousSibling.nodeName=="TABLE"){b.dom.remove(l);}});}function h(){function t(e,r,n,i){var k=3,l=e.dom.getParent(r.startContainer,'TABLE');var o,p,q;if(l){o=l.parentNode;}p=r.startContainer.nodeType==k&&r.startOffset===0&&r.endOffset===0&&i&&(n.nodeName=="TR"||n==o);q=(n.nodeName=="TD"||n.nodeName=="TH")&&!i;return p||q;}function c(){var r=b.selection.getRng();var n=b.selection.getNode();var e=b.dom.getParent(r.startContainer,'TD,TH');if(!t(b,r,n,e)){return;}if(!e){e=n;}var i=e.lastChild;while(i.lastChild){i=i.lastChild;}if(i.nodeType==3){r.setEnd(i,i.data.length);b.selection.setRng(r);}}b.on('KeyDown',function(){c();});b.on('MouseDown',function(e){if(e.button!=2){c();}});}function j(){function p(e){b.selection.select(e,true);b.selection.collapse(true);}function c(e){b.$(e).empty();U.paddCell(e);}b.on('keydown',function(e){if((e.keyCode==V.DELETE||e.keyCode==V.BACKSPACE)&&!e.isDefaultPrevented()){var t,i,s,k;t=b.dom.getParent(b.selection.getStart(),'table');if(t){i=b.dom.select('td,th',t);s=T.grep(i,function(k){return b.dom.hasClass(k,'mce-item-selected');});if(s.length===0){k=b.dom.getParent(b.selection.getStart(),'td,th');if(b.selection.isCollapsed()&&k&&b.dom.isEmpty(k)){e.preventDefault();c(k);p(k);}return;}e.preventDefault();if(i.length==s.length){b.execCommand('mceTableDelete');}else{T.each(s,c);p(s[0]);}}}});}j();if(E.webkit){m();h();}if(E.gecko){f();d();}if(E.ie>10){f();d();}};});