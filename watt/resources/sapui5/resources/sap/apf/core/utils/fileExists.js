/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.core.utils.fileExists');jQuery.sap.require('sap.apf.core.utils.checkForTimeout');
sap.apf.core.utils.fileExists=function(u){'use strict';var f=false;jQuery.ajax({url:u,type:"HEAD",success:function(d,s,j){var m=sap.apf.core.utils.checkForTimeout(j);f=!m;},error:function(){f=false;},async:false});return f;};
