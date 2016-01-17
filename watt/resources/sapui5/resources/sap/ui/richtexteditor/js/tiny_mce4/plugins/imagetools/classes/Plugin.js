define("tinymce/imagetoolsplugin/Plugin",["tinymce/PluginManager","tinymce/Env","tinymce/util/Promise","tinymce/util/URI","tinymce/util/Tools","tinymce/imagetoolsplugin/ImageTools","tinymce/imagetoolsplugin/Conversions","tinymce/imagetoolsplugin/Dialog"],function(P,E,a,U,T,I,C,D){P.add('imagetools',function(b){var c=0,i,l;if(!E.fileApi){return;}function g(e){var B,F;function G(H){return H.indexOf('px')==H.length-2;}B=e.style.width;F=e.style.height;if(B||F){if(G(B)&&G(F)){return{w:parseInt(B,10),h:parseInt(F,10)};}return null;}B=b.$(e).attr('width');F=b.$(e).attr('height');if(B&&F){return{w:parseInt(B,10),h:parseInt(F,10)};}return null;}function s(e,B){var F,G;if(B){F=e.style.width;G=e.style.height;if(F||G){b.$(e).css({width:B.w,height:B.h}).removeAttr('data-mce-style');}F=e.width;G=e.height;if(F||G){b.$(e).attr({width:B.w,height:B.h});}}}function d(e){return{w:e.naturalWidth,h:e.naturalHeight};}function f(){return b.selection.getNode();}function h(){return'imagetools'+c++;}function j(e){var B=e.src;return B.indexOf('data:')===0||B.indexOf('blob:')===0||new U(B).host===b.documentBaseURI.host;}function k(e){return T.inArray(b.settings.imagetools_cors_hosts,new U(e.src).host)!==-1;}function r(e){return new a(function(B){var F=new XMLHttpRequest();F.onload=function(){B(this.response);};F.open('GET',e,true);F.responseType='blob';F.send();});}function m(e){var B=e.src;if(k(e)){return r(e.src);}if(!j(e)){B=b.settings.imagetools_proxy;B+=(B.indexOf('?')===-1?'?':'&')+'url='+encodeURIComponent(e.src);e=new Image();e.src=B;}return C.imageToBlob(e);}function n(){var e;e=b.editorUpload.blobCache.getByUri(f().src);if(e){return e;}return m(f()).then(function(B){return C.blobToBase64(B).then(function(F){var G=b.editorUpload.blobCache;var e=G.create(h(),B,F);G.add(e);return e;});});}function o(){i=setTimeout(function(){b.editorUpload.uploadImagesAuto();},30000);}function p(){clearTimeout(i);}function u(e,B){return C.blobToDataUri(e).then(function(F){var G,H,J,K,L;L=f();G=h();J=b.editorUpload.blobCache;H=U.parseDataUri(F).data;K=J.create(G,e,H);J.add(K);b.undoManager.transact(function(){function M(){b.$(L).off('load',M);b.nodeChanged();if(B){b.editorUpload.uploadImagesAuto();}else{p();o();}}b.$(L).on('load',M);b.$(L).attr({src:K.blobUri()}).removeAttr('data-mce-src');});return K;});}function q(e){return function(){return b._scanForImages().then(n).then(e).then(u);};}function t(e){return function(){return q(function(B){var F=g(f());if(F){s(f(),{w:F.h,h:F.w});}return I.rotate(B.blob(),e);})();};}function v(e){return function(){return q(function(B){return I.flip(B.blob(),e);})();};}function w(){var e=f(),B=d(e);if(e){m(e).then(D.edit).then(function(F){return new a(function(G){C.blobToImage(F).then(function(H){var J=d(H);if(B.w!=J.w||B.h!=J.h){if(g(e)){s(e,J);}}URL.revokeObjectURL(H.src);G(F);});});}).then(function(F){u(F,true);},function(){});}}function x(){b.addButton('rotateleft',{title:'Rotate counterclockwise',onclick:t(-90)});b.addButton('rotateright',{title:'Rotate clockwise',onclick:t(90)});b.addButton('flipv',{title:'Flip vertically',onclick:v('v')});b.addButton('fliph',{title:'Flip horizontally',onclick:v('h')});b.addButton('editimage',{title:'Edit image',onclick:w});b.addButton('imageoptions',{title:'Image options',icon:'options',cmd:'mceImage'});}function y(){b.on('NodeChange',function(e){if(l&&l.src!=e.element.src){p();b.editorUpload.uploadImagesAuto();l=undefined;}if(z(e.element)){l=e.element;}});}function z(e){var B=b.dom.is(e,'img:not([data-mce-object],[data-mce-placeholder])');return B&&(j(e)||k(e)||b.settings.imagetools_proxy);}function A(){var e=b.settings.imagetools_toolbar;if(!e){e='rotateleft rotateright | flipv fliph | crop editimage imageoptions';}b.addContextToolbar(z,e);}x();A();y();b.addCommand('mceEditImage',w);});});
