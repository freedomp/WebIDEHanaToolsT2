tinymce.PluginManager.add('image',function(a){function g(u,d){var i=document.createElement('img');function e(w,h){if(i.parentNode){i.parentNode.removeChild(i);}d({width:w,height:h});}i.onload=function(){e(Math.max(i.width,i.clientWidth),Math.max(i.height,i.clientHeight));};i.onerror=function(){e();};var f=i.style;f.visibility='hidden';f.position='fixed';f.bottom=f.left=0;f.width=f.height='auto';document.body.appendChild(i);i.src=u;}function b(i,d,e){function f(v,o){o=o||[];tinymce.each(v,function(h){var m={text:h.text||h.title};if(h.menu){m.menu=f(h.menu);}else{m.value=h.value;d(m);}o.push(m);});return o;}return f(i,e||[]);}function c(d){return function(){var i=a.settings.image_list;if(typeof i=="string"){tinymce.util.XHR.send({url:i,success:function(t){d(tinymce.util.JSON.parse(t));}});}else if(typeof i=="function"){i(d);}else{d(i);}};}function s(i){var w,d={},f=a.dom,h=a.selection.getNode();var j,k,l,m,n=a.settings.image_dimensions!==false;function r(){var e,y,z,A;e=w.find('#width')[0];y=w.find('#height')[0];if(!e||!y){return;}z=e.value();A=y.value();if(w.find('#constrain')[0].checked()&&j&&k&&z&&A){if(j!=z){A=Math.round((z/j)*A);if(!isNaN(A)){y.value(A);}}else{z=Math.round((A/k)*z);if(!isNaN(z)){e.value(z);}}}j=z;k=A;}function o(){function e(h){function y(){h.onload=h.onerror=null;if(a.selection){a.selection.select(h);a.nodeChanged();}}h.onload=function(){if(!d.width&&!d.height&&n){f.setAttribs(h,{width:h.clientWidth,height:h.clientHeight});}y();};h.onerror=y;}v();r();d=tinymce.extend(d,w.toJSON());if(!d.alt){d.alt='';}if(!d.title){d.title='';}if(d.width===''){d.width=null;}if(d.height===''){d.height=null;}if(!d.style){d.style=null;}d={src:d.src,alt:d.alt,title:d.title,width:d.width,height:d.height,style:d.style,"class":d["class"]};a.undoManager.transact(function(){if(!d.src){if(h){f.remove(h);a.focus();a.nodeChanged();}return;}if(d.title===""){d.title=null;}if(!h){d.id='__mcenew';a.focus();a.selection.setContent(f.createHTML('img',d));h=f.get('__mcenew');f.setAttrib(h,'id',null);}else{f.setAttribs(h,d);a.editorUpload.uploadImagesAuto();}e(h);});}function p(e){if(e){e=e.replace(/px$/,'');}return e;}function q(e){var y,z,A,B=e.meta||{};if(l){l.value(a.convertURL(this.value(),'src'));}tinymce.each(B,function(C,D){w.find('#'+D).value(C);});if(!B.width&&!B.height){y=a.convertURL(this.value(),'src');z=a.settings.image_prepend_url;A=new RegExp('^(?:[a-z]+:)?//','i');if(z&&!A.test(y)&&y.substring(0,z.length)!==z){y=z+y;}this.value(y);g(a.documentBaseURI.toAbsolute(this.value()),function(d){if(d.width&&d.height&&n){j=d.width;k=d.height;w.find('#width').value(j);w.find('#height').value(k);}});}}j=f.getAttrib(h,'width');k=f.getAttrib(h,'height');if(h.nodeName=='IMG'&&!h.getAttribute('data-mce-object')&&!h.getAttribute('data-mce-placeholder')){d={src:f.getAttrib(h,'src'),alt:f.getAttrib(h,'alt'),title:f.getAttrib(h,'title'),"class":f.getAttrib(h,'class'),width:j,height:k};}else{h=null;}if(i){l={type:'listbox',label:'Image list',values:b(i,function(e){e.value=a.convertURL(e.value||e.url,'src');},[{text:'None',value:''}]),value:d.src&&a.convertURL(d.src,'src'),onselect:function(e){var y=w.find('#alt');if(!y.value()||(e.lastControl&&y.value()==e.lastControl.text())){y.value(e.control.text());}w.find('#src').value(e.control.value()).fire('change');},onPostRender:function(){l=this;}};}if(a.settings.image_class_list){m={name:'class',type:'listbox',label:'Class',values:b(a.settings.image_class_list,function(e){if(e.value){e.textStyle=function(){return a.formatter.getCssText({inline:'img',classes:[e.value]});};}})};}var t=[{name:'src',type:'filepicker',filetype:'image',label:'Source',autofocus:true,onchange:q},l];if(a.settings.image_description!==false){t.push({name:'alt',type:'textbox',label:'Image description'});}if(a.settings.image_title){t.push({name:'title',type:'textbox',label:'Image Title'});}if(n){t.push({type:'container',label:'Dimensions',layout:'flex',direction:'row',align:'center',spacing:5,items:[{name:'width',type:'textbox',maxLength:5,size:3,onchange:r,ariaLabel:'Width'},{type:'label',text:'x'},{name:'height',type:'textbox',maxLength:5,size:3,onchange:r,ariaLabel:'Height'},{name:'constrain',type:'checkbox',checked:true,text:'Constrain proportions'}]});}t.push(m);function u(e){if(e.margin){var y=e.margin.split(" ");switch(y.length){case 1:e['margin-top']=e['margin-top']||y[0];e['margin-right']=e['margin-right']||y[0];e['margin-bottom']=e['margin-bottom']||y[0];e['margin-left']=e['margin-left']||y[0];break;case 2:e['margin-top']=e['margin-top']||y[0];e['margin-right']=e['margin-right']||y[1];e['margin-bottom']=e['margin-bottom']||y[0];e['margin-left']=e['margin-left']||y[1];break;case 3:e['margin-top']=e['margin-top']||y[0];e['margin-right']=e['margin-right']||y[1];e['margin-bottom']=e['margin-bottom']||y[2];e['margin-left']=e['margin-left']||y[1];break;case 4:e['margin-top']=e['margin-top']||y[0];e['margin-right']=e['margin-right']||y[1];e['margin-bottom']=e['margin-bottom']||y[2];e['margin-left']=e['margin-left']||y[3];}delete e.margin;}return e;}function v(){function e(z){if(z.length>0&&/^[0-9]+$/.test(z)){z+='px';}return z;}if(!a.settings.image_advtab){return;}var d=w.toJSON(),y=f.parseStyle(d.style);y=u(y);if(d.vspace){y['margin-top']=y['margin-bottom']=e(d.vspace);}if(d.hspace){y['margin-left']=y['margin-right']=e(d.hspace);}if(d.border){y['border-width']=e(d.border);}w.find('#style').value(f.serializeStyle(f.parseStyle(f.serializeStyle(y))));}function x(){if(!a.settings.image_advtab){return;}var d=w.toJSON(),e=f.parseStyle(d.style);w.find('#vspace').value("");w.find('#hspace').value("");e=u(e);if((e['margin-top']&&e['margin-bottom'])||(e['margin-right']&&e['margin-left'])){if(e['margin-top']===e['margin-bottom']){w.find('#vspace').value(p(e['margin-top']));}else{w.find('#vspace').value('');}if(e['margin-right']===e['margin-left']){w.find('#hspace').value(p(e['margin-right']));}else{w.find('#hspace').value('');}}if(e['border-width']){w.find('#border').value(p(e['border-width']));}w.find('#style').value(f.serializeStyle(f.parseStyle(f.serializeStyle(e))));}if(a.settings.image_advtab){if(h){if(h.style.marginLeft&&h.style.marginRight&&h.style.marginLeft===h.style.marginRight){d.hspace=p(h.style.marginLeft);}if(h.style.marginTop&&h.style.marginBottom&&h.style.marginTop===h.style.marginBottom){d.vspace=p(h.style.marginTop);}if(h.style.borderWidth){d.border=p(h.style.borderWidth);}d.style=a.dom.serializeStyle(a.dom.parseStyle(a.dom.getAttrib(h,'style')));}w=a.windowManager.open({title:'Insert/edit image',data:d,bodyType:'tabpanel',body:[{title:'General',type:'form',items:t},{title:'Advanced',type:'form',pack:'start',items:[{label:'Style',name:'style',type:'textbox',onchange:x},{type:'form',layout:'grid',packV:'start',columns:2,padding:0,alignH:['left','right'],defaults:{type:'textbox',maxWidth:50,onchange:v},items:[{label:'Vertical space',name:'vspace'},{label:'Horizontal space',name:'hspace'},{label:'Border',name:'border'}]}]}],onSubmit:o});}else{w=a.windowManager.open({title:'Insert/edit image',data:d,body:t,onSubmit:o});}}a.addButton('image',{icon:'image',tooltip:'Insert/edit image',onclick:c(s),stateSelector:'img:not([data-mce-object],[data-mce-placeholder])'});a.addMenuItem('image',{icon:'image',text:'Insert/edit image',onclick:c(s),context:'insert',prependToContext:true});a.addCommand('mceImage',c(s));});