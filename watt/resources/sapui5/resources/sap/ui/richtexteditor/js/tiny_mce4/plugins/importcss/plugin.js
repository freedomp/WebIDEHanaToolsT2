tinymce.PluginManager.add('importcss',function(a){var s=this,b=tinymce.each;function c(f){if(typeof f=="string"){return function(v){return v.indexOf(f)!==-1;};}else if(f instanceof RegExp){return function(v){return f.test(v);};}return f;}function g(f,h){var i=[],j={};function k(l,m){var n=l.href,r;if(!n||!h(n,m)){return;}b(l.imports,function(l){k(l,true);});try{r=l.cssRules||l.rules;}catch(e){}b(r,function(o){if(o.styleSheet){k(o.styleSheet,true);}else if(o.selectorText){b(o.selectorText.split(','),function(p){i.push(tinymce.trim(p));});}});}b(a.contentCSS,function(u){j[u]=true;});if(!h){h=function(l,m){return m||j[l];};}try{b(f.styleSheets,function(l){k(l);});}catch(e){}return i;}function d(e){var f;var h=/^(?:([a-z0-9\-_]+))?(\.[a-z0-9_\-\.]+)$/i.exec(e);if(!h){return;}var i=h[1];var j=h[2].substr(1).split('.').join(' ');var k=tinymce.makeMap('a,img');if(h[1]){f={title:e};if(a.schema.getTextBlockElements()[i]){f.block=i;}else if(a.schema.getBlockElements()[i]||k[i.toLowerCase()]){f.selector=i;}else{f.inline=i;}}else if(h[2]){f={inline:'span',title:e.substr(1),classes:j};}if(a.settings.importcss_merge_classes!==false){f.classes=j;}else{f.attributes={"class":j};}return f;}a.on('renderFormatsMenu',function(e){var f=a.settings,h={};var j=f.importcss_selector_converter||d;var k=c(f.importcss_selector_filter),l=e.control;if(!a.settings.importcss_append){l.items().remove();}var m=[];tinymce.each(f.importcss_groups,function(i){i=tinymce.extend({},i);i.filter=c(i.filter);m.push(i);});b(g(e.doc||a.getDoc(),c(f.importcss_file_filter)),function(n){if(n.indexOf('.mce-')===-1){if(!h[n]&&(!k||k(n))){var o=j.call(s,n),p;if(o){var q=o.name||tinymce.DOM.uniqueId();if(m){for(var i=0;i<m.length;i++){if(!m[i].filter||m[i].filter(n)){if(!m[i].item){m[i].item={text:m[i].title,menu:[]};}p=m[i].item.menu;break;}}}a.formatter.register(q,o);var r=tinymce.extend({},l.settings.itemDefaults,{text:o.title,format:q});if(p){p.push(r);}else{l.add(r);}}h[n]=true;}}});b(m,function(i){l.add(i.item);});e.control.renderNew();});s.convertSelectorToFormat=d;});