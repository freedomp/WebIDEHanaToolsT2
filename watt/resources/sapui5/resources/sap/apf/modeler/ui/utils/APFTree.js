/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.declare('sap.apf.modeler.ui.utils.APFTree');jQuery.sap.require("sap.apf.ui.utils.constants");sap.ui.getCore().loadLibrary("sap.ui.commons");sap.ui.commons.Tree.extend("sap.apf.modeler.ui.utils.APFTree",{metadata:{events:{},properties:{translationFunction:{},defaultRepresentationType:{}}},renderer:function(c,r){sap.ui.commons.TreeRenderer.render(c,r);},setTranslationFunction:function(t){this.fnTranslationFunction=t;},setDefaultRepresentationType:function(d){this.defaultRepresentationType=d;},getAPFTreeNodeContext:function(n){if(n){var N=n?n.getBindingContext():undefined;var o=N.getObject()?N.getObject().type:undefined;var O;if(N.getObject()&&N.getObject().id){O=N.getObject().id;}else if(N.getObject()&&N.getObject().AnalyticalConfiguration){O=N.getObject().AnalyticalConfiguration;}return{oNode:n,nodeContext:N.sPath,nodeObjectType:o,nodeTitle:n.getText(),nodeAPFId:O};}return null;},getParentNodeContext:function(s){var m=this.getModel();if(s!==null){var c=s.nodeContext.split('/')[2];var a=m.getData().aConfigDetails[c]?m.getData().aConfigDetails[c].AnalyticalConfiguration:undefined;var r,S;var b=s.nodeContext.split('/')[6];var f=s.nodeContext.split('/')[6];var n=s.nodeContext.split('/')[6];var d=s.nodeContext.split('/')[8];var o={};if(s!==null){switch(s.nodeObjectType){case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.FACETFILTER:o.facetFilterId=m.getData().aConfigDetails[c].configData[0].filters[f].id;o.configurationId=a;o.configurationName=m.getData().aConfigDetails[c].name;o.facetFilterName=m.getData().aConfigDetails[c].configData[0].filters[f].name;break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CATEGORY:o.categoryId=m.getData().aConfigDetails[c].configData[1].categories[b].id;o.configurationId=a;o.configurationName=m.getData().aConfigDetails[c].name;o.categoryName=m.getData().aConfigDetails[c].configData[1].categories[b].name;break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.STEP:S=s.oNode;o.configurationId=a;o.categoryId=m.getData().aConfigDetails[c].configData[1].categories[b].id;o.stepId=m.getData().aConfigDetails[c].configData[1].categories[b].steps[d].id;o.configurationName=m.getData().aConfigDetails[c].name;o.categoryName=m.getData().aConfigDetails[c].configData[1].categories[b].name;o.stepName=m.getData().aConfigDetails[c].configData[1].categories[b].steps[d].name;break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.REPRESENTATION:r=s.oNode;o.configurationId=a;o.categoryId=m.getData().aConfigDetails[c].configData[1].categories[b].id;o.stepId=m.getData().aConfigDetails[c].configData[1].categories[b].steps[d].id;o.representationId=r.getBindingContext().getObject().id;o.configurationName=m.getData().aConfigDetails[c].name;o.categoryName=m.getData().aConfigDetails[c].configData[1].categories[b].name;o.stepName=m.getData().aConfigDetails[c].configData[1].categories[b].steps[d].name;o.representationName=r.getBindingContext().getObject().name;break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CONFIGURATION:o.configurationId=s.oNode.getBindingContext().getObject().AnalyticalConfiguration;o.configurationName=s.oNode.getBindingContext().getObject().name;break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.NAVIGATIONTARGET:o.navTargetId=m.getData().aConfigDetails[c].configData[2].navTargets[n].id;o.configurationId=a;o.configurationName=m.getData().aConfigDetails[c].name;o.navTargetName=m.getData().aConfigDetails[c].configData[2].navTargets[n].name;break;default:break;}}return o;}},isConfigurationSwitched:function(p,c){var i=false;var P=this.getParentNodeContext(this.getAPFTreeNodeContext(p));var C=this.getParentNodeContext(this.getAPFTreeNodeContext(c));if(P&&!jQuery.isEmptyObject(P)&&(P.configurationId!==C.configurationId)){i=true;}return i;},removeSelectionOnTree:function(s){var S=this.getSelection();if(s){s.getBindingContext().getObject().isSelected=false;s.setIsSelected(false);}else if(S){S.getBindingContext().getObject().isSelected=false;S.setIsSelected(false);}this.getModel().updateBindings();},setSelectionOnTree:function(b){this.selectedNode=this.getNodeByContext(b);var s=this.getSelection();if(s!==this.selectedNode){if(s&&s.getBindingContext().getObject()){s.getBindingContext().getObject().isSelected=false;s.setIsSelected(false);}this.selectedNode.setIsSelected(true);}},_scrollTreeToNewNode:function(n){if(n&&n.$().length!==0){jQuery(n.$())[0].scrollIntoView();}},setSelectedNode:function(n){this.setSelection(this.getNodeByContext(n.getBindingContext().sPath));this._scrollTreeToNewNode(n);},_getObjectNodesArray:function(o,c,a,s){var O;switch(o){case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CONFIGURATION:O=this.getNodes();break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.FACETFILTER:O=this.getNodes()[c].getNodes()[0].getNodes();break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CATEGORY:O=this.getNodes()[c].getNodes()[1].getNodes();break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.STEP:O=this.getNodes()[c].getNodes()[1].getNodes()[a].getNodes();break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.REPRESENTATION:O=this.getNodes()[c].getNodes()[1].getNodes()[a].getNodes()[s].getNodes();break;case sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.NAVIGATIONTARGET:O=this.getNodes()[c].getNodes()[2].getNodes();break;default:break;}return O;},addNodeInTree:function(o,p){var m=this.getModel();var M;var s=this.getAPFTreeNodeContext(this.getSelection());var c=s?s.nodeContext.split('/')[2]:undefined;var a=s?s.nodeContext.split('/')[6]:undefined;var b=s?s.nodeContext.split('/')[8]:undefined;M=["_add",o].join("");this[M](c,a,b,p);var O=this._getObjectNodesArray(o,c,a,b);var n=O[O.length-1];if(o!==sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CONFIGURATION){if(n.getParent()){n.getParent().setExpanded(true);}}this.setSelectedNode(n);},_addconfiguration:function(){var s=this;this.configNewIndex=this.configNewIndex||1;var m=this.getModel();var i;i="I"+this.configNewIndex;this.configNewIndex++;var a=[],f=[],c=[],n=[];a.push({filters:f,name:s.fnTranslationFunction("facetFilters"),isSelected:false,expanded:false,selectable:false});a.push({categories:c,name:s.fnTranslationFunction("categories"),isSelected:false,expanded:false,selectable:false});a.push({navTargets:n,name:s.fnTranslationFunction("navigationTargets"),isSelected:false,expanded:false,selectable:false});var C={};C.configData=a;var b=this.fnTranslationFunction("newConfiguration");var d={name:"< "+b+" >",type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CONFIGURATION,AnalyticalConfiguration:"newConfig"+i,configData:a,bIsLoaded:true,isSelected:false,expanded:false,selectable:true};m.getData().aConfigDetails.push(d);m.updateBindings();},_addfacetFilter:function(c){var m=this.getModel();var n=this.fnTranslationFunction("newFacetFilter");var i=m.getData().aConfigDetails[c].configData[0].filters.length;var a={name:"< "+n+" >",type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.FACETFILTER,id:"newFilter"+i,isSelected:false,selectable:true};m.getData().aConfigDetails[c].expanded=true;m.getData().aConfigDetails[c].configData[0].expanded=true;m.getData().aConfigDetails[c].configData[0].filters.push(a);m.updateBindings();},_addnavigationTarget:function(c){var m=this.getModel();var n=this.fnTranslationFunction("newNavigationTarget");var i=m.getData().aConfigDetails[c].configData[2].navTargets.length;var a={name:"< "+n+" >",type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.NAVIGATIONTARGET,id:"newNavTarget"+i,isSelected:false,selectable:true};m.getData().aConfigDetails[c].expanded=true;m.getData().aConfigDetails[c].configData[2].expanded=true;m.getData().aConfigDetails[c].configData[2].navTargets.push(a);m.updateBindings();},_addcategory:function(c){var m=this.getModel();var n=this.fnTranslationFunction("newCategory");var i=m.getData().aConfigDetails[c].configData[1].categories.length;var a={name:"< "+n+" >",type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CATEGORY,id:"newCategory"+i,isSelected:false,expanded:false,selectable:true};m.getData().aConfigDetails[c].expanded=true;m.getData().aConfigDetails[c].configData[1].expanded=true;m.getData().aConfigDetails[c].configData[1].categories.push(a);m.updateBindings();},_addstep:function(c,a,s,p){var m=this.getModel();var n;if(m.getData().aConfigDetails[c].configData[1].categories[a].steps===undefined){m.getData().aConfigDetails[c].configData[1].categories[a].steps=[];}if(!p){var b=m.getData().aConfigDetails[c].configData[1].categories[a].steps.length;var d=this.fnTranslationFunction("newStep");n={name:"< "+d+" >",type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.STEP,id:"newStep"+b,isSelected:false,expanded:false,selectable:true};m.getData().aConfigDetails[c].expanded=true;m.getData().aConfigDetails[c].configData[1].expanded=true;m.getData().aConfigDetails[c].configData[1].categories[a].expanded=true;m.getData().aConfigDetails[c].configData[1].categories[a].steps.push(n);}else{var e,i,j;for(i=0;i<p.noOfSteps;i++){e={name:p.aExistingStepsToBeAdded[i].step.name,type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.STEP,id:p.aExistingStepsToBeAdded[i].step.id,isSelected:false,expanded:false,selectable:true};m.getData().aConfigDetails[c].configData[1].categories[a].steps.push(e);if(p.aExistingStepsToBeAdded[i].noOfReps!==0){s=m.getData().aConfigDetails[c].configData[1].categories[a].steps.length-1;for(j=0;j<p.aExistingStepsToBeAdded[i].noOfReps;j++){var r={id:p.aExistingStepsToBeAdded[i].representations[j].id,name:p.aExistingStepsToBeAdded[i].representations[j].name,icon:p.aExistingStepsToBeAdded[i].representations[j].icon};this._addrepresentation(c,a,s,r);}}}}m.updateBindings();},_addrepresentation:function(c,a,s,p){var m=this.getModel();var b=this;var d;if(p===undefined){var e=this.getAPFTreeNodeContext(this.getSelection());if(e.nodeObjectType===sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.REPRESENTATION){d=this.getParentNodeContext(e,m).stepId;}else if(e.nodeObjectType===sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.STEP){d=e.nodeAPFId;}var S=[];m.getData().aConfigDetails[c].configData[1].categories.forEach(function(f,g){if(m.getData().aConfigDetails[c].configData[1].categories[g].steps){m.getData().aConfigDetails[c].configData[1].categories[g].steps.forEach(function(h,i){var j={};if(h.id===d){j.stepIndex=i;j.categoryIndex=g;S.push(j);}});}});S.forEach(function(f){if(m.getData().aConfigDetails[c].configData[1].categories[f.categoryIndex].steps[f.stepIndex].representations===undefined){m.getData().aConfigDetails[c].configData[1].categories[f.categoryIndex].steps[f.stepIndex].representations=[];}var i=m.getData().aConfigDetails[c].configData[1].categories[f.categoryIndex].steps[f.stepIndex].representations.length;var n={name:b.fnTranslationFunction(b.defaultRepresentationType),type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.REPRESENTATION,id:"newRepresentation"+i,isSelected:false,selectable:true};m.getData().aConfigDetails[c].expanded=true;m.getData().aConfigDetails[c].configData[1].expanded=true;m.getData().aConfigDetails[c].configData[1].categories[f.categoryIndex].expanded=true;m.getData().aConfigDetails[c].configData[1].categories[f.categoryIndex].steps[f.stepIndex].expanded=true;m.getData().aConfigDetails[c].configData[1].categories[f.categoryIndex].steps[f.stepIndex].representations.push(n);});}else{if(m.getData().aConfigDetails[c].configData[1].categories[a].steps[s].representations===undefined){m.getData().aConfigDetails[c].configData[1].categories[a].steps[s].representations=[];}var r={name:p.name,type:sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.REPRESENTATION,id:p.id,isSelected:false,selectable:true,icon:p.icon};m.getData().aConfigDetails[c].configData[1].categories[a].steps[s].representations.push(r);}m.updateBindings();}});
