// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.adapters.local.NavTargetResolutionAdapter");jQuery.sap.require("sap.ui.thirdparty.datajs");sap.ushell.adapters.local.NavTargetResolutionAdapter=function(u,p,a){var A=jQuery.sap.getObject("config.applications",0,a);this.resolveHashFragment=function(h){var d=new jQuery.Deferred(),i,r,R,P;if(h&&h.charAt(0)!=="#"){throw new sap.ushell.utils.Error("Hash fragment expected","sap.ushell.renderers.minimal.Shell");}h=h.substring(1);if(!h&&!A[h]){d.resolve(undefined);}else{jQuery.sap.log.info("Hash Fragment: "+h);i=h.indexOf("?");if(i>=0){P=h.slice(i+1);h=h.slice(0,i);}r=A[h];if(r){R={additionalInformation:r.additionalInformation,applicationType:r.applicationType,url:r.url,text:r.text,fullWidth:r.fullWidth};if(P){R.url+=(R.url.indexOf("?")<0)?"?":"&";R.url+=P;}if(r.navigationMode!==undefined){R.navigationMode=r.navigationMode;}d.resolve(R);}else{d.reject("Could not resolve link '"+h+"'");}}return d.promise();};this.getSemanticObjectLinks=function(s){var I,r=[],i=0,d=new jQuery.Deferred();if(!s){setTimeout(function(){d.resolve([]);},0);}else{jQuery.sap.log.info("getSemanticObjectLinks: "+s);for(I in A){if(A.hasOwnProperty(I)&&I.substring(0,I.indexOf('-'))===s){r[i]=A[I];r[i].id=I;r[i].text=r[i].text||r[i].description||"no text";r[i].intent="#"+I;i+=1;}}if(r){setTimeout(function(){d.resolve(r);},0);}else{setTimeout(function(){d.reject("Could not get links for  '"+s+"'");},0);}}return d.promise();};this.isIntentSupported=function(I){var d=new jQuery.Deferred(),s={},D=[],t=this;function b(i,S){s[i]={supported:S};}I.forEach(function(c,i){var o=new jQuery.Deferred();D.push(o.promise());t.resolveHashFragment(c).fail(function(e){b(c,false);o.resolve();}).done(function(e){b(c,true);o.resolve();});});if(I.length>0){jQuery.when.apply(jQuery,D).always(function(){d.resolve(s);});}else{d.resolve(s);}return d.promise();};};}());
