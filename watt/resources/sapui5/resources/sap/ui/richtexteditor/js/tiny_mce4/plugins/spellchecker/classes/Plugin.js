define("tinymce/spellcheckerplugin/Plugin",["tinymce/spellcheckerplugin/DomTextMatcher","tinymce/PluginManager","tinymce/util/Tools","tinymce/ui/Menu","tinymce/dom/DOMUtils","tinymce/util/XHR","tinymce/util/URI","tinymce/util/JSON"],function(D,P,T,M,a,X,U,J){P.add('spellchecker',function(b,u){var l,s=this,c,d,f,g=b.settings;var h;function j(){if(!s.textMatcher){s.textMatcher=new D(b.getBody(),b);}return s.textMatcher;}function k(e,i){var F=[];T.each(i,function(G){F.push({selectable:true,text:G.name,data:G.value});});return F;}var m=g.spellchecker_languages||'English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr_FR,'+'German=de,Italian=it,Polish=pl,Portuguese=pt_BR,'+'Spanish=es,Swedish=sv';l=k('Language',T.map(m.split(','),function(e){e=e.split('=');return{name:e[0],value:e[1]};}));function n(e){for(var i in e){return false;}return true;}function o(i,F){var G=[],H=c[i];T.each(H,function(e){G.push({text:e,onclick:function(){b.insertContent(b.dom.encode(e));b.dom.remove(F);v();}});});G.push({text:'-'});if(h){G.push({text:'Add to Dictionary',onclick:function(){w(i,F);}});}G.push.apply(G,[{text:'Ignore',onclick:function(){x(i,F);}},{text:'Ignore all',onclick:function(){x(i,F,true);}}]);f=new M({items:G,context:'contextmenu',onautohide:function(e){if(e.target.className.indexOf('spellchecker')!=-1){e.preventDefault();}},onhide:function(){f.remove();f=null;}});f.renderTo(document.body);var I=a.DOM.getPos(b.getContentAreaContainer());var K=b.dom.getPos(F[0]);var L=b.dom.getRoot();if(L.nodeName=='BODY'){K.x-=L.ownerDocument.documentElement.scrollLeft||L.scrollLeft;K.y-=L.ownerDocument.documentElement.scrollTop||L.scrollTop;}else{K.x-=L.scrollLeft;K.y-=L.scrollTop;}I.x+=K.x;I.y+=K.y;f.moveTo(I.x,I.y+F[0].offsetHeight);}function p(){return b.getParam('spellchecker_wordchar_pattern')||new RegExp("[^"+"\\s!\"#$%&()*+,-./:;<=>?@[\\]^_{|}`"+"\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb"+"\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e\u00a0\u2002\u2003\u2009"+"]+","g");}function q(e,i,F,G){var H={method:e},I='';if(e=="spellcheck"){H.text=i;H.lang=g.spellchecker_language;}if(e=="addToDictionary"){H.word=i;}T.each(H,function(K,L){if(I){I+='&';}I+=L+'='+encodeURIComponent(K);});X.send({url:new U(u).toAbsolute(g.spellchecker_rpc_url),type:"post",content_type:'application/x-www-form-urlencoded',data:I,success:function(K){K=J.parse(K);if(!K){G("Sever response wasn't proper JSON.");}else if(K.error){G(K.error);}else{F(K);}},error:function(K,L){G("Spellchecker request error: "+L.status);}});}function r(e,i,F,G){var H=g.spellchecker_callback||q;H.call(s,e,i,F,G);}function t(){y();if(d){return;}function e(i){b.windowManager.alert(i);b.setProgressState(false);y();}b.setProgressState(true);r("spellcheck",j().text,C,e);b.focus();}function v(){if(!b.dom.select('span.mce-spellchecker-word').length){y();}}function w(e,i){b.setProgressState(true);r("addToDictionary",e,function(){b.setProgressState(false);b.dom.remove(i,true);v();},function(F){b.windowManager.alert(F);b.setProgressState(false);});}function x(e,i,F){b.selection.collapse();if(F){T.each(b.dom.select('span.mce-spellchecker-word'),function(G){if(G.getAttribute('data-mce-word')==e){b.dom.remove(G,true);}});}else{b.dom.remove(i,true);}v();}function y(){j().reset();s.textMatcher=null;if(d){d=false;b.fire('SpellcheckEnd');}}function z(e){var i=e.getAttribute('data-mce-index');if(typeof i=="number"){return""+i;}return i;}function A(e){var F,G=[];F=T.toArray(b.getBody().getElementsByTagName('span'));if(F.length){for(var i=0;i<F.length;i++){var H=z(F[i]);if(H===null||!H.length){continue;}if(H===e.toString()){G.push(F[i]);}}}return G;}b.on('click',function(e){var i=e.target;if(i.className=="mce-spellchecker-word"){e.preventDefault();var F=A(z(i));if(F.length>0){var G=b.dom.createRng();G.setStartBefore(F[0]);G.setEndAfter(F[F.length-1]);b.selection.setRng(G);o(i.getAttribute('data-mce-word'),F);}}});b.addMenuItem('spellchecker',{text:'Spellcheck',context:'tools',onclick:t,selectable:true,onPostRender:function(){var s=this;s.active(d);b.on('SpellcheckStart SpellcheckEnd',function(){s.active(d);});}});function B(e){var i=g.spellchecker_language;e.control.items().each(function(F){F.active(F.settings.data===i);});}function C(e){var i;if(e.words){h=!!e.dictionary;i=e.words;}else{i=e;}b.setProgressState(false);if(n(i)){b.windowManager.alert('No misspellings found');d=false;return;}c=i;j().find(p()).filter(function(F){return!!i[F.text];}).wrap(function(F){return b.dom.create('span',{"class":'mce-spellchecker-word',"data-mce-bogus":1,"data-mce-word":F.text});});d=true;b.fire('SpellcheckStart');}var E={tooltip:'Spellcheck',onclick:t,onPostRender:function(){var s=this;b.on('SpellcheckStart SpellcheckEnd',function(){s.active(d);});}};if(l.length>1){E.type='splitbutton';E.menu=l;E.onshow=B;E.onselect=function(e){g.spellchecker_language=e.control.settings.data;};}b.addButton('spellchecker',E);b.addCommand('mceSpellCheck',t);b.on('remove',function(){if(f){f.remove();f=null;}});b.on('change',v);this.getTextMatcher=j;this.getWordCharPattern=p;this.markErrors=C;this.getLanguage=function(){return g.spellchecker_language;};g.spellchecker_language=g.spellchecker_language||g.language||'en';});});
