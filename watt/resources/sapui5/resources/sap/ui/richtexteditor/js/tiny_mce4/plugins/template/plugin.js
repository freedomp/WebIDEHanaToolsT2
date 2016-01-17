tinymce.PluginManager.add('template',function(a){var b=tinymce.each;function d(c){return function(){var t=a.settings.templates;if(typeof t=="string"){tinymce.util.XHR.send({url:t,success:function(e){c(tinymce.util.JSON.parse(e));}});}else{c(t);}};}function s(t){var w,v=[],c;if(!t||t.length===0){a.windowManager.alert('No templates defined');return;}tinymce.each(t,function(e){v.push({selected:!v.length,text:e.title,value:{url:e.url,content:e.content,description:e.description}});});function o(e){var i=e.control.value();function j(k){if(k.indexOf('<html>')==-1){var l='';tinymce.each(a.contentCSS,function(u){l+='<link type="text/css" rel="stylesheet" href="'+a.documentBaseURI.toAbsolute(u)+'">';});k=('<!DOCTYPE html>'+'<html>'+'<head>'+l+'</head>'+'<body>'+k+'</body>'+'</html>');}k=f(k,'template_preview_replace_values');var m=w.find('iframe')[0].getEl().contentWindow.document;m.open();m.write(k);m.close();}if(i.url){tinymce.util.XHR.send({url:i.url,success:function(k){c=k;j(c);}});}else{c=i.content;j(c);}w.find('#description')[0].text(e.control.value().description);}w=a.windowManager.open({title:'Insert template',layout:'flex',direction:'column',align:'stretch',padding:15,spacing:10,items:[{type:'form',flex:0,padding:0,items:[{type:'container',label:'Templates',items:{type:'listbox',label:'Templates',name:'template',values:v,onselect:o}}]},{type:'label',name:'description',label:'Description',text:'\u00a0'},{type:'iframe',flex:1,border:1}],onsubmit:function(){h(false,c);},width:a.getParam('template_popup_width',600),height:a.getParam('template_popup_height',500)});w.find('listbox')[0].fire('select');}function g(c,e){var j="Sun Mon Tue Wed Thu Fri Sat Sun".split(' ');var k="Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(' ');var m="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(' ');var l="January February March April May June July August September October November December".split(' ');function n(v,o){v=""+v;if(v.length<o){for(var i=0;i<(o-v.length);i++){v="0"+v;}}return v;}e=e||new Date();c=c.replace("%D","%m/%d/%Y");c=c.replace("%r","%I:%M:%S %p");c=c.replace("%Y",""+e.getFullYear());c=c.replace("%y",""+e.getYear());c=c.replace("%m",n(e.getMonth()+1,2));c=c.replace("%d",n(e.getDate(),2));c=c.replace("%H",""+n(e.getHours(),2));c=c.replace("%M",""+n(e.getMinutes(),2));c=c.replace("%S",""+n(e.getSeconds(),2));c=c.replace("%I",""+((e.getHours()+11)%12+1));c=c.replace("%p",""+(e.getHours()<12?"AM":"PM"));c=c.replace("%B",""+a.translate(l[e.getMonth()]));c=c.replace("%b",""+a.translate(m[e.getMonth()]));c=c.replace("%A",""+a.translate(k[e.getDay()]));c=c.replace("%a",""+a.translate(j[e.getDay()]));c=c.replace("%%","%");return c;}function r(e){var c=a.dom,i=a.getParam('template_replace_values');b(c.select('*',e),function(e){b(i,function(v,k){if(c.hasClass(e,k)){if(typeof i[k]=='function'){i[k](e);}}});});}function f(c,t){b(a.getParam(t),function(v,k){if(typeof v=='function'){v=v(k);}c=c.replace(new RegExp('\\{\\$'+k+'\\}','g'),v);});return c;}function h(u,e){var i,n,j=a.dom,k=a.selection.getContent();e=f(e,'template_replace_values');i=j.create('div',null,e);n=j.select('.mceTmpl',i);if(n&&n.length>0){i=j.create('div',null);i.appendChild(n[0].cloneNode(true));}function l(n,c){return new RegExp('\\b'+c+'\\b','g').test(n.className);}b(j.select('*',i),function(n){if(l(n,a.getParam('template_cdate_classes','cdate').replace(/\s+/g,'|'))){n.innerHTML=g(a.getParam("template_cdate_format",a.getLang("template.cdate_format")));}if(l(n,a.getParam('template_mdate_classes','mdate').replace(/\s+/g,'|'))){n.innerHTML=g(a.getParam("template_mdate_format",a.getLang("template.mdate_format")));}if(l(n,a.getParam('template_selected_content_classes','selcontent').replace(/\s+/g,'|'))){n.innerHTML=k;}});r(i);a.execCommand('mceInsertContent',false,i.innerHTML);a.addVisual();}a.addCommand('mceInsertTemplate',h);a.addButton('template',{title:'Insert template',onclick:d(s)});a.addMenuItem('template',{text:'Insert template',onclick:d(s),context:'insert'});a.on('PreProcess',function(o){var c=a.dom;b(c.select('div',o.node),function(e){if(c.hasClass(e,'mceTmpl')){b(c.select('*',e),function(e){if(c.hasClass(e,a.getParam('template_mdate_classes','mdate').replace(/\s+/g,'|'))){e.innerHTML=g(a.getParam("template_mdate_format",a.getLang("template.mdate_format")));}});r(e);}});});});
