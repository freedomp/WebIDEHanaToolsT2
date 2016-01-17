define("tinymce/tableplugin/TableGrid",["tinymce/util/Tools","tinymce/Env","tinymce/tableplugin/Utils"],function(T,E,U){var e=T.each,g=U.getSpanVal;return function(a,t){var b,d,s,f,h,j=a.selection,k=j.dom;function l(){var c=0;b=[];d=0;e(['thead','tbody','tfoot'],function(i){var r=k.select('> '+i+' tr',t);e(r,function(P,y){y+=c;e(k.select('> td, > th',P),function(Q,x){var R,S,V,W;if(b[y]){while(b[y][x]){x++;}}V=g(Q,'rowspan');W=g(Q,'colspan');for(S=y;S<y+V;S++){if(!b[S]){b[S]=[];}for(R=x;R<x+W;R++){b[S][R]={part:i,real:S==y&&R==x,elm:Q,rowspan:V,colspan:W};}}d=Math.max(d,x+1);});});c+=r.length;});}function m(c,i){c=c.cloneNode(i);c.removeAttribute('id');return c;}function n(x,y){var r;r=b[y];if(r){return r[x];}}function o(c,i,r){if(c){r=parseInt(r,10);if(r===1){c.removeAttribute(i,1);}else{c.setAttribute(i,r,1);}}}function p(c){return c&&(k.hasClass(c.elm,'mce-item-selected')||c==h);}function q(){var r=[];e(t.rows,function(c){e(c.cells,function(i){if(k.hasClass(i,'mce-item-selected')||(h&&i==h.elm)){r.push(c);return false;}});});return r;}function u(){var r=k.createRng();r.setStartAfter(t);r.setEndAfter(t);j.setRng(r);k.remove(t);}function v(c){var i,r={};if(a.settings.table_clone_elements!==false){r=T.makeMap((a.settings.table_clone_elements||'strong em b i span font h1 h2 h3 h4 h5 h6 p div').toUpperCase(),/[ ,]/);}T.walk(c,function(x){var y;if(x.nodeType==3){e(k.getParents(x.parentNode,null,c).reverse(),function(x){if(!r[x.nodeName]){return;}x=m(x,false);if(!i){i=y=x;}else if(y){y.appendChild(x);}y=x;});if(y){y.innerHTML=E.ie?'&nbsp;':'<br data-mce-bogus="1" />';}return false;}},'childNodes');c=m(c,false);o(c,'rowSpan',1);o(c,'colSpan',1);if(i){c.appendChild(i);}else{U.paddCell(c);}return c;}function w(){var r=k.createRng(),c;e(k.select('tr',t),function(i){if(i.cells.length===0){k.remove(i);}});if(k.select('tr',t).length===0){r.setStartBefore(t);r.setEndBefore(t);j.setRng(r);k.remove(t);return;}e(k.select('thead,tbody,tfoot',t),function(i){if(i.rows.length===0){k.remove(i);}});l();if(s){c=b[Math.min(b.length-1,s.y)];if(c){j.select(c[Math.min(c.length-1,s.x)].elm,true);j.collapse(true);}}}function z(x,y,i,P){var Q,R,r,c,S;Q=b[y][x].elm.parentNode;for(r=1;r<=i;r++){Q=k.getNext(Q,'tr');if(Q){for(R=x;R>=0;R--){S=b[y+r][R].elm;if(S.parentNode==Q){for(c=1;c<=P;c++){k.insertAfter(v(S),S);}break;}}if(R==-1){for(c=1;c<=P;c++){Q.insertBefore(v(Q.cells[0]),Q.cells[0]);}}}}}function A(){e(b,function(r,y){e(r,function(c,x){var P,Q,i;if(p(c)){c=c.elm;P=g(c,'colspan');Q=g(c,'rowspan');if(P>1||Q>1){o(c,'rowSpan',1);o(c,'colSpan',1);for(i=0;i<P-1;i++){k.insertAfter(v(c),c);}z(x,y,Q-1,P);}}});});}function B(c,i,r){var P,Q,R,S,V,x,y,W,X,Y,Z;if(c){P=K(c);Q=P.x;R=P.y;S=Q+(i-1);V=R+(r-1);}else{s=f=null;e(b,function($,y){e($,function(c,x){if(p(c)){if(!s){s={x:x,y:y};}f={x:x,y:y};}});});if(s){Q=s.x;R=s.y;S=f.x;V=f.y;}}W=n(Q,R);X=n(S,V);if(W&&X&&W.part==X.part){A();l();W=n(Q,R).elm;o(W,'colSpan',(S-Q)+1);o(W,'rowSpan',(V-R)+1);for(y=R;y<=V;y++){for(x=Q;x<=S;x++){if(!b[y]||!b[y][x]){continue;}c=b[y][x].elm;if(c!=W){Y=T.grep(c.childNodes);e(Y,function($){W.appendChild($);});if(Y.length){Y=T.grep(W.childNodes);Z=0;e(Y,function($){if($.nodeName=='BR'&&k.getAttrib($,'data-mce-bogus')&&Z++<Y.length-1){W.removeChild($);}});}k.remove(c);}}}w();}}function C(c){var i,r,P,x,Q,R,S,V,W;e(b,function(X,y){e(X,function(r){if(p(r)){r=r.elm;Q=r.parentNode;R=m(Q,false);i=y;if(c){return false;}}});if(c){return!i;}});if(i===undefined){return;}for(x=0;x<b[0].length;x++){if(!b[i][x]){continue;}r=b[i][x].elm;if(r!=P){if(!c){W=g(r,'rowspan');if(W>1){o(r,'rowSpan',W+1);continue;}}else{if(i>0&&b[i-1][x]){V=b[i-1][x].elm;W=g(V,'rowSpan');if(W>1){o(V,'rowSpan',W+1);continue;}}}S=v(r);o(S,'colSpan',r.colSpan);R.appendChild(S);P=r;}}if(R.hasChildNodes()){if(!c){k.insertAfter(R,Q);}else{Q.parentNode.insertBefore(R,Q);}}}function D(c){var i,r;e(b,function(y){e(y,function(P,x){if(p(P)){i=x;if(c){return false;}}});if(c){return!i;}});e(b,function(x,y){var P,Q,R;if(!x[i]){return;}P=x[i].elm;if(P!=r){R=g(P,'colspan');Q=g(P,'rowspan');if(R==1){if(!c){k.insertAfter(v(P),P);z(i,y,Q-1,R);}else{P.parentNode.insertBefore(v(P),P);z(i,y,Q-1,R);}}else{o(P,'colSpan',P.colSpan+1);}r=P;}});}function F(){var c=[];e(b,function(r){e(r,function(i,x){if(p(i)&&T.inArray(c,x)===-1){e(b,function(r){var i=r[x].elm,y;y=g(i,'colSpan');if(y>1){o(i,'colSpan',y-1);}else{k.remove(i);}});c.push(x);}});});w();}function G(){var r;function c(i){var x,y;e(i.cells,function(P){var Q=g(P,'rowSpan');if(Q>1){o(P,'rowSpan',Q-1);x=K(P);z(x.x,x.y,1,1);}});x=K(i.cells[0]);e(b[x.y],function(P){var Q;P=P.elm;if(P!=y){Q=g(P,'rowSpan');if(Q<=1){k.remove(P);}else{o(P,'rowSpan',Q-1);}y=P;}});}r=q();e(r.reverse(),function(i){c(i);});w();}function H(){var r=q();k.remove(r);w();return r;}function I(){var r=q();e(r,function(c,i){r[i]=m(c,true);});return r;}function J(r,c){var x=q(),y=x[c?0:x.length-1],P=y.cells.length;if(!r){return;}e(b,function(i){var Q;P=0;e(i,function(R){if(R.real){P+=R.colspan;}if(R.elm.parentNode==y){Q=1;}});if(Q){return false;}});if(!c){r.reverse();}e(r,function(Q){var i,R=Q.cells.length,S;for(i=0;i<R;i++){S=Q.cells[i];o(S,'colSpan',1);o(S,'rowSpan',1);}for(i=R;i<P;i++){Q.appendChild(v(Q.cells[R-1]));}for(i=P;i<R;i++){k.remove(Q.cells[i]);}if(c){y.parentNode.insertBefore(Q,y);}else{k.insertAfter(Q,y);}});k.removeClass(k.select('td.mce-item-selected,th.mce-item-selected'),'mce-item-selected');}function K(c){var i;e(b,function(r,y){e(r,function(P,x){if(P.elm==c){i={x:x,y:y};return false;}});return!i;});return i;}function L(c){s=K(c);}function M(){var c,i;c=i=0;e(b,function(r,y){e(r,function(P,x){var Q,R;if(p(P)){P=b[y][x];if(x>c){c=x;}if(y>i){i=y;}if(P.real){Q=P.colspan-1;R=P.rowspan-1;if(Q){if(x+Q>c){c=x+Q;}}if(R){if(y+R>i){i=y+R;}}}}});});return{x:c,y:i};}function N(c){var i,r,P,Q,R,S,V,W,x,y;f=K(c);if(s&&f){i=Math.min(s.x,f.x);r=Math.min(s.y,f.y);P=Math.max(s.x,f.x);Q=Math.max(s.y,f.y);R=P;S=Q;for(y=r;y<=S;y++){c=b[y][i];if(!c.real){if(i-(c.colspan-1)<i){i-=c.colspan-1;}}}for(x=i;x<=R;x++){c=b[r][x];if(!c.real){if(r-(c.rowspan-1)<r){r-=c.rowspan-1;}}}for(y=r;y<=Q;y++){for(x=i;x<=P;x++){c=b[y][x];if(c.real){V=c.colspan-1;W=c.rowspan-1;if(V){if(x+V>R){R=x+V;}}if(W){if(y+W>S){S=y+W;}}}}}k.removeClass(k.select('td.mce-item-selected,th.mce-item-selected'),'mce-item-selected');for(y=r;y<=S;y++){for(x=i;x<=R;x++){if(b[y][x]){k.addClass(b[y][x].elm,'mce-item-selected');}}}}}function O(c,i){var r,x,y;r=K(c);x=r.y*d+r.x;do{x+=i;y=n(x%d,Math.floor(x/d));if(!y){break;}if(y.elm!=c){j.select(y.elm,true);if(k.isEmpty(y.elm)){j.collapse(true);}return true;}}while(y.elm==c);return false;}t=t||k.getParent(j.getStart(true),'table');l();h=k.getParent(j.getStart(true),'th,td');if(h){s=K(h);f=M();h=n(s.x,s.y);}T.extend(this,{deleteTable:u,split:A,merge:B,insertRow:C,insertCol:D,deleteCols:F,deleteRows:G,cutRows:H,copyRows:I,pasteRows:J,getPos:K,setStartCell:L,setEndCell:N,moveRelIdx:O,refresh:l});};});