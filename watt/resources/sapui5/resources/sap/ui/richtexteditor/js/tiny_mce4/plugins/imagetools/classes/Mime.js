define("tinymce/imagetoolsplugin/Mime",[],function(){function g(u){var a=document.createElement('a');a.href=u;return a.pathname;}function b(u){var p=g(u).split('.'),e=p[p.length-1],m={'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png'};if(e){e=e.toLowerCase();}return m[e];}return{guessMimeType:b};});
