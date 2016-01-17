(function(){var J=tinymce.util.JSONRequest,a=tinymce.each,D=tinymce.DOM;tinymce.create('tinymce.plugins.SpellcheckerPlugin',{getInfo:function(){return{longname:'Spellchecker',author:'Moxiecode Systems AB',authorurl:'http://tinymce.moxiecode.com',infourl:'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/spellchecker',version:tinymce.majorVersion+"."+tinymce.minorVersion};},init:function(b,u){var t=this,c;t.url=u;t.editor=b;t.rpcUrl=b.getParam("spellchecker_rpc_url","{backend}");if(t.rpcUrl=='{backend}'){if(tinymce.isIE)return;t.hasSupport=true;b.onContextMenu.addToTop(function(b,e){if(t.active)return false;});}b.addCommand('mceSpellCheck',function(){if(t.rpcUrl=='{backend}'){t.editor.getBody().spellcheck=t.active=!t.active;return;}if(!t.active){b.setProgressState(1);t._sendRPC('checkWords',[t.selectedLang,t._getWords()],function(r){if(r.length>0){t.active=1;t._markWords(r);b.setProgressState(0);b.nodeChanged();}else{b.setProgressState(0);if(b.getParam('spellchecker_report_no_misspellings',true))b.windowManager.alert('spellchecker.no_mpell');}});}else t._done();});if(b.settings.content_css!==false)b.contentCSS.push(u+'/css/content.css');b.onClick.add(t._showMenu,t);b.onContextMenu.add(t._showMenu,t);b.onBeforeGetContent.add(function(){if(t.active)t._removeWords();});b.onNodeChange.add(function(b,c){c.setActive('spellchecker',t.active);});b.onSetContent.add(function(){t._done();});b.onBeforeGetContent.add(function(){t._done();});b.onBeforeExecCommand.add(function(b,d){if(d=='mceFullScreen')t._done();});t.languages={};a(b.getParam('spellchecker_languages','+English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr,German=de,Italian=it,Polish=pl,Portuguese=pt,Spanish=es,Swedish=sv','hash'),function(v,k){if(k.indexOf('+')===0){k=k.substring(1);t.selectedLang=v;}t.languages[k]=v;});},createControl:function(n,b){var t=this,c,e=t.editor;if(n=='spellchecker'){if(t.rpcUrl=='{backend}'){if(t.hasSupport)c=b.createButton(n,{title:'spellchecker.desc',cmd:'mceSpellCheck',scope:t});return c;}c=b.createSplitButton(n,{title:'spellchecker.desc',cmd:'mceSpellCheck',scope:t});c.onRenderMenu.add(function(c,m){m.add({title:'spellchecker.langs','class':'mceMenuItemTitle'}).setDisabled(1);t.menuItems={};a(t.languages,function(v,k){var o={icon:1},d;o.onclick=function(){if(v==t.selectedLang){return;}t._updateMenu(d);t.selectedLang=v;};o.title=k;d=m.add(o);d.setSelected(v==t.selectedLang);t.menuItems[v]=d;if(v==t.selectedLang)t.selectedItem=d;});});return c;}},setLanguage:function(l){var t=this;if(l==t.selectedLang){return;}if(tinymce.grep(t.languages,function(v){return v===l;}).length===0){throw"Unknown language: "+l;}t.selectedLang=l;if(t.menuItems){t._updateMenu(t.menuItems[l]);}if(t.active){t._done();}},_updateMenu:function(m){m.setSelected(1);this.selectedItem.setSelected(0);this.selectedItem=m;},_walk:function(n,f){var d=this.editor.getDoc(),w;if(d.createTreeWalker){w=d.createTreeWalker(n,NodeFilter.SHOW_TEXT,null,false);while((n=w.nextNode())!=null)f.call(this,n);}else tinymce.walk(n,f,'childNodes');},_getSeparators:function(){var r='',i,s=this.editor.getParam('spellchecker_word_separator_chars','\\s!"#$%&()*+,-./:;<=>?@[\]^_{|}����������������\u201d\u201c');for(i=0;i<s.length;i++)r+='\\'+s.charAt(i);return r;},_getWords:function(){var e=this.editor,w=[],t='',l={},r=[];this._walk(e.getBody(),function(n){if(n.nodeType==3)t+=n.nodeValue+' ';});if(e.getParam('spellchecker_word_pattern')){r=t.match('('+e.getParam('spellchecker_word_pattern')+')','gi');}else{t=t.replace(new RegExp('([0-9]|['+this._getSeparators()+'])','g'),' ');t=tinymce.trim(t.replace(/(\s+)/g,' '));r=t.split(' ');}a(r,function(v){if(!l[v]){w.push(v);l[v]=1;}});return w;},_removeWords:function(w){var e=this.editor,d=e.dom,s=e.selection,r=s.getRng(true);a(d.select('span').reverse(),function(n){if(n&&(d.hasClass(n,'mceItemHiddenSpellWord')||d.hasClass(n,'mceItemHidden'))){if(!w||d.decode(n.innerHTML)==w)d.remove(n,1);}});s.setRng(r);},_markWords:function(b){var e=this.editor,d=e.dom,c=e.getDoc(),s=e.selection,r=s.getRng(true),f=[],w=b.join('|'),g=this._getSeparators(),h=new RegExp('(^|['+g+'])('+w+')(?=['+g+']|$)','g');this._walk(e.getBody(),function(n){if(n.nodeType==3){f.push(n);}});a(f,function(n){var i,j,t,p,v=n.nodeValue;h.lastIndex=0;if(h.test(v)){v=d.encode(v);j=d.create('span',{'class':'mceItemHidden'});if(tinymce.isIE){v=v.replace(h,'$1<mcespell>$2</mcespell>');while((p=v.indexOf('<mcespell>'))!=-1){t=v.substring(0,p);if(t.length){i=c.createTextNode(d.decode(t));j.appendChild(i);}v=v.substring(p+10);p=v.indexOf('</mcespell>');t=v.substring(0,p);v=v.substring(p+11);j.appendChild(d.create('span',{'class':'mceItemHiddenSpellWord'},t));}if(v.length){i=c.createTextNode(d.decode(v));j.appendChild(i);}}else{j.innerHTML=v.replace(h,'$1<span class="mceItemHiddenSpellWord">$2</span>');}d.replace(j,n);}});s.setRng(r);},_showMenu:function(b,e){var t=this,b=t.editor,m=t._menu,p,d=b.dom,c=d.getViewPort(b.getWin()),w=e.target;e=0;if(!m){m=b.controlManager.createDropMenu('spellcheckermenu',{'class':'mceNoIcons'});t._menu=m;}if(d.hasClass(w,'mceItemHiddenSpellWord')){m.removeAll();m.add({title:'spellchecker.wait','class':'mceMenuItemTitle'}).setDisabled(1);t._sendRPC('getSuggestions',[t.selectedLang,d.decode(w.innerHTML)],function(r){var i;m.removeAll();if(r.length>0){m.add({title:'spellchecker.sug','class':'mceMenuItemTitle'}).setDisabled(1);a(r,function(v){m.add({title:v,onclick:function(){d.replace(b.getDoc().createTextNode(v),w);t._checkDone();}});});m.addSeparator();}else m.add({title:'spellchecker.no_sug','class':'mceMenuItemTitle'}).setDisabled(1);if(b.getParam('show_ignore_words',true)){i=t.editor.getParam("spellchecker_enable_ignore_rpc",'');m.add({title:'spellchecker.ignore_word',onclick:function(){var f=w.innerHTML;d.remove(w,1);t._checkDone();if(i){b.setProgressState(1);t._sendRPC('ignoreWord',[t.selectedLang,f],function(r){b.setProgressState(0);});}}});m.add({title:'spellchecker.ignore_words',onclick:function(){var f=w.innerHTML;t._removeWords(d.decode(f));t._checkDone();if(i){b.setProgressState(1);t._sendRPC('ignoreWords',[t.selectedLang,f],function(r){b.setProgressState(0);});}}});}if(t.editor.getParam("spellchecker_enable_learn_rpc")){m.add({title:'spellchecker.learn_word',onclick:function(){var f=w.innerHTML;d.remove(w,1);t._checkDone();b.setProgressState(1);t._sendRPC('learnWord',[t.selectedLang,f],function(r){b.setProgressState(0);});}});}m.update();});p=D.getPos(b.getContentAreaContainer());m.settings.offset_x=p.x;m.settings.offset_y=p.y;b.selection.select(w);p=d.getPos(w);m.showMenu(p.x,p.y+w.offsetHeight-c.y);return tinymce.dom.Event.cancel(e);}else m.hideMenu();},_checkDone:function(){var t=this,e=t.editor,d=e.dom,o;a(d.select('span'),function(n){if(n&&d.hasClass(n,'mceItemHiddenSpellWord')){o=true;return false;}});if(!o)t._done();},_done:function(){var t=this,l=t.active;if(t.active){t.active=0;t._removeWords();if(t._menu)t._menu.hideMenu();if(l)t.editor.nodeChanged();}},_sendRPC:function(m,p,c){var t=this;J.sendRPC({url:t.rpcUrl,method:m,params:p,success:c,error:function(e,x){t.editor.setProgressState(0);t.editor.windowManager.alert(e.errstr||('Error response: '+x.responseText));}});}});tinymce.PluginManager.add('spellchecker',tinymce.plugins.SpellcheckerPlugin);})();