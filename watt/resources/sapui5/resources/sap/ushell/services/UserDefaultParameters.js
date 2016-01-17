// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.services.UserDefaultParameters");var e="valueStored";var r=["value","noEdit","noStore","extendedValue","alwaysAskPlugin"];sap.ushell.services.UserDefaultParameters=function(a,c,p,C){var t=this,s=new sap.ui.base.EventProvider();this._aPlugins=[];function g(P){var v=(typeof P.getComponentData==="function"&&P.getComponentData()&&P.getComponentData().config&&P.getComponentData().config["sap-priority"])||0;if(typeof v!=="number"||isNaN(v)){return 0;}return v;}this._insertPluginOrdered=function(P,o){var f=g(o),i,h;for(i=0;(i<P.length)&&o;++i){h=g(P[i]);if(o&&(f>h)){P.splice(i,0,o);o=undefined;}}if(o){P.push(o);}return P;};this.registerPlugin=function(P){this._aPlugins=this._insertPluginOrdered(this._aPlugins,P);};function b(i,P,f,v,D){if(i>=P.length){D.resolve(v);return;}if(typeof P[i].getUserDefault!=="function"){b(i+1,P,f,v,D);return;}P[i].getUserDefault(f,v).done(function(n){if(n){b(i+1,P,f,n,D);}else{b(i+1,P,f,v,D);}}).fail(function(){jQuery.sap.log.error("invocation of getUserDefault(\""+f+"\") for plugin "+t._getComponentNameOfPlugin(P[i])+" rejected.",null,"sap.ushell.services.UserDefaultParameters");b(i+1,P,f,v,D);});return;}function d(o){return jQuery.extend(true,{},o);}this._getStoreDate=function(){return new Date().toString();};this._storeValue=function(P,v,f){if(f&&this._isInitial(v)){v=undefined;}else{v._shellData=jQuery.extend(true,{storeDate:this._getStoreDate()},v._shellData);}return sap.ushell.Container.getService("UserDefaultParameterPersistence").saveParameterValue(P,v).always(function(){var S={parameterName:P,parameterValue:d(v)};s.fireEvent(e,S);});};this._getCurrentValue=function(P){var D=new jQuery.Deferred();sap.ushell.Container.getService("UserDefaultParameterPersistence").loadParameterValue(P).done(function(v){D.resolve(v);}).fail(function(){D.resolve({value:undefined});});return D.promise();};this._isNeverSetValue=function(v){return!v||(!v._shellData&&!v.value&&!v.extendedValue);};this._isInitial=function(v){return!(v&&(v.value||v.extendedValue));};this._isStoreDistinct=function(v,V){return!r.every(function(m){return(v[m]===V[m]||jQuery.sap.equal(v[m],V[m]));});};this.getValue=function(P){var t=this,D=new jQuery.Deferred(),o=new jQuery.Deferred();this._getCurrentValue(P).done(function(v){var O;if(!v){v={};}O=d(v);if((v._shellData||!t._isInitial(v))&&!v.noStore&&!v.alwaysAskPlugin){o.resolve(v);}else{sap.ushell.Container.getUserDefaultPluginsPromise().done(function(){b(0,t._aPlugins,P,v,o);}).fail(function(){jQuery.sap.log.error("Cannot get value for "+P+". One or more plugins could not be loaded.");o.reject("Initialization of plugins failed");});}o.done(function(n){if(t._isNeverSetValue(O)||t._isStoreDistinct(O,n)){t._storeValue(P,n);}D.resolve(n);}).fail(D.reject.bind(D));});return D.promise();};this._addParameterValuesToParameters=function(P,f){var D=new jQuery.Deferred();var h=[];var t=this;f.forEach(function(i){var n=t.getValue(i);h.push(n);n.done(function(v){P[i].valueObject=v;});});jQuery.when.apply(jQuery,h).done(D.resolve.bind(D,P)).fail(D.reject.bind(D,P));return D.promise();};this._arrayToObject=function(P){var R={};P.forEach(function(f){R[f]={};});return R;};this._getComponentNameOfPlugin=function(P){if(typeof P!=="object"||typeof P.getMetadata!=="function"||!P.getMetadata()||typeof P.getMetadata().getComponentName!=="function"){return"'name of plugin could not be determined'";}return P.getMetadata().getComponentName()||"";};this._getEditorDataAndValue=function(D,P,m){var t=this;var f=[];var R=[];t._aPlugins.forEach(function(o,i){if(typeof o.getEditorMetadata==="function"){var n=new jQuery.Deferred();f.push(n);try{var h=f.length-1;o.getEditorMetadata(m).done(function(k){R[h]=k;}).always(function(){n.resolve();}).fail(function(){jQuery.sap.log.error("EditorMetadata for plugin "+t._getComponentNameOfPlugin(o)+"cannot be invoked.",null,"sap.ushell.services.UserDefaultParameters");n.resolve();});}catch(j){jQuery.sap.log.error("Error invoking getEditorMetaData on plugin: "+j+j.stack,null,"sap.ushell.services.UserDefaultParameters");n.resolve();}}});jQuery.when.apply(jQuery,f).done(function(){var h=[];var o=R.reverse().reduce(function(i,n){P.forEach(function(j){if(n[j]&&n[j].editorMetadata){i[j].editorMetadata=n[j].editorMetadata;}});return i;},m);P.forEach(function(i){if(!(o[i]&&o[i].editorMetadata)){h.push(i);}});if(h.length>0){jQuery.sap.log.error("The following parameter names have no editor metadata and thus likely no configured plugin:\n\""+h.join("\",\n\"")+"\".");}t._addParameterValuesToParameters(o,P).done(function(i){var j=jQuery.extend(true,{},i),k;k=Object.keys(j).splice(0);k.forEach(function(l){var n;if(j[l].valueObject&&j[l].valueObject.noEdit===true){delete j[l];n=h.indexOf(l);if(n>=0){h.splice(n,1);}}});if(h.length>0){jQuery.sap.log.error("The following parameter names have no editor metadata and thus likely no configured plugin:\n\""+h.join("\",\n\"")+"\".");}D.resolve(j);}).fail(D.reject.bind(D));});};this.editorGetParameters=function(){var D=new jQuery.Deferred();var t=this;sap.ushell.Container.getService("ClientSideTargetResolution").getUserDefaultParameterNames().done(function(P){var m=t._arrayToObject(P);if(m.length===0){D.resolve({});}else{sap.ushell.Container.getUserDefaultPluginsPromise().done(function(){t._getEditorDataAndValue(D,P,m);}).fail(function(){jQuery.sap.log.error("One or more plugins could not be loaded");D.reject("Initialization of plugins failed");});}});return D.promise();};this.editorSetValue=function(P,v){return this._storeValue(P,v,true);};this.attachValueStored=function(f){s.attachEvent(e,f);};this.detachValueStored=function(f){s.detachEvent(e,f);};};sap.ushell.services.UserDefaultParameters.hasNoAdapter=true;}());
