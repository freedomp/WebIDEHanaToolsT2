(function(e){"use strict";var h="",b;var m={},a=[],c=0;var s=document.getElementsByTagName('script');for(var i=0;i<s.length;i++){var d=s[i].src;if(d.indexOf('/plugin.dev.js')!=-1){b=d.substring(0,d.lastIndexOf('/'));}}function r(n,o){var p,q=[];for(var i=0;i<n.length;++i){p=m[n[i]]||f(n[i]);if(!p){throw'module definition dependecy not found: '+n[i];}q.push(p);}o.apply(null,q);}function f(n){if(e.privateModules&&n in e.privateModules){return;}var t=e;var o=n.split(/[.\/]/);for(var p=0;p<o.length;++p){if(!t[o[p]]){return;}t=t[o[p]];}return t;}function g(n){var t=e;var o=n.split(/[.\/]/);for(var p=0;p<o.length-1;++p){if(t[o[p]]===undefined){t[o[p]]={};}t=t[o[p]];}t[o[o.length-1]]=m[n];}function j(n,o,p){var q,i;if(typeof n!=='string'){throw'invalid module definition, module id must be defined and be a string';}if(o===undefined){throw'invalid module definition, dependencies must be specified';}if(p===undefined){throw'invalid module definition, definition function must be specified';}r(o,function(){m[n]=p.apply(null,arguments);});if(--c===0){for(i=0;i<a.length;i++){g(a[i]);}}if(e.AMDLC_TESTS){q=e.privateModules||{};for(n in m){q[n]=m[n];}for(i=0;i<a.length;i++){delete q[a[i]];}e.privateModules=q;}}function k(n){a=n;}function w(){document.write(h);}function l(p){h+='<script type="text/javascript" src="'+b+'/'+p+'"></script>\n';c++;}e.define=j;e.require=r;k(["tinymce/pasteplugin/Utils"]);l('classes/Utils.js');l('classes/Clipboard.js');l('classes/WordFilter.js');l('classes/Quirks.js');l('classes/Plugin.js');w();})(this);
