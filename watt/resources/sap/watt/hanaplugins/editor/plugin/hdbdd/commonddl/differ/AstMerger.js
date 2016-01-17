/*eslint-disable no-eq-null,eqeqeq,no-multi-spaces,complexity,valid-jsdoc*/
define(["rndrt/rnd","commonddl/astmodel/CompilationUnitImpl","commonddl/astmodel/EObjectContainmentEList",
        "commonddl/astmodel/SelectListEntryImpl","commonddl/astmodel/AbstractAnnotationImpl"],
    function(rnd,CompilationUnitImpl,EObjectContainmentEList,SelectListEntryImpl,AbstractAnnotationImpl) {

        function AstMerger() {
        }

        /**
         * merges two given CompilationUnits. Source is taken as base and will be returned as the merged object.
         * @param source {CompilationUnitImpl}
         * @param target {CompilationUnitImpl}
         * @returns {CompilationUnitImpl}
         */
        AstMerger.merge = function(/*CompilationUnitImpl*/source,/*CompilationUnitImpl*/target) {
            if (!(source instanceof CompilationUnitImpl) || !(target instanceof CompilationUnitImpl) ) {
                throw new Error("source/target must be instance of CompilationUnitImpl");
            }

            AstMerger.allVisitedObjects = [];
            AstMerger.mergeObjectInternal(source,target);
            return source;
        };

        AstMerger.mergeObjectInternal = function(source,target) {
            // loop over source properties - remove from target if source is found}
            if (rnd.Utils.arrayContains(AstMerger.allVisitedObjects,source)) {
                return;
            }
            AstMerger.allVisitedObjects.push(source);
             try {
                var propNames = Object.keys(source);
                var targetPropNames = Object.keys(target);
            }catch(e) {
                //debugger;
            }
            for (var i = 0;i < propNames.length;i++) {
                var propName = propNames[i];
                rnd.Utils.arrayRemove(targetPropNames,propName);
                var s = source[propName];
                var t = target[propName];
                var sto = typeof (s);
                //not needed
                //if (sto==="function")
                //    continue;
                if (s != null && t != null) {
                    if (this.isSameClassInternal(s,t) == true) {
                        if (propName === "container" || propName === "compilationUnit" || propName === "parent" || propName === "targetDataSource") { //container ref -> simply keep it
                            continue;
                        }else if (propName === "tokenList") {
                            source[propName] = target[propName];
                            target[propName].$visited = true;
                            continue;
                        }else if (AstMerger.isListInternal(s)) {
                            AstMerger.mergeArrayInternal(s,t,source);
                        }else{
                            //console.log(propName); //for debugging purposes
                            if (sto === "number" || sto === "string" || s instanceof rnd.Token) {
                                source[propName] = target[propName];
                                target[propName].$visited = true;
                                continue;
                            }
                            AstMerger.mergeObjectInternal(s,t);
                        }
                    }else{ // not same instance
                        if (propName === "container") {
                            continue;
                        }
                        AstMerger.copyObject(source,target,propName);
                        target[propName].$visited = true;
                    }
                }else if (s != null && t == null) {
                    // target does not exist -> remove source
                    delete source[propName];
                }
            }

            // second loop: add the missing ones from target
            if (targetPropNames.length > 0) {
                // add missing targetPropNames
                for (var i3 = 0;i3 < targetPropNames.length;i3++) {
                    var targetPropName = targetPropNames[i3];
                    if (target[targetPropName] == null) {
                        continue;
                    }
                    if (target[targetPropName].$visited && target[targetPropName].$visited === true) {
                        continue;
                    }
                    AstMerger.copyObject(source,target,targetPropNames[i3]);
                }
            }
        };

        AstMerger.copyObject = function (source,target,propName) {

            if (source instanceof CompilationUnitImpl && AstMerger.isListInternal(target[propName])) {
                // adapt container reference of all childNodes
                for (var i = 0;i < target[propName].length;i++) {
                    if (target[propName][i].container && target[propName][i].container instanceof CompilationUnitImpl) {
                        target[propName][i].container = source;
                    }
                }
            }

            source[propName] = target[propName];
            if (source[propName].container != null) {
                source[propName].container = source;
            }
            if (source[propName].parent != null) {
                source[propName].parent = source;
            }
        };

        AstMerger.isListInternal = function(o) {
            if (Array.isArray(o) === true) {
                return true;
            }
            if (o instanceof EObjectContainmentEList) {
                return true;
            }
            return false;
        };

        AstMerger.mergeArrayInternal = function(source,target,sourceParent) {
            if (rnd.Utils.arrayContains(AstMerger.allVisitedObjects,source)) {
                return;
            }
            AstMerger.allVisitedObjects.push(source);
            // delete $visited in target entries
            for (var i = 0;i < target.length;i++) {
               delete target[i].$visited;
            }
            if (sourceParent instanceof SelectListEntryImpl && source.length > 0 && source[0] instanceof AbstractAnnotationImpl) {
                // annotations under SelectListEntryImpl are stored as references and not as containment objects; reset them always
                for (var i5 = source.length - 1; i5 >= 0; i5--) {
                    rnd.Utils.arrayRemove(source,i5);
                }
            }
            for (var i3 = 0;i3 < source.length;i3++) {
                if (target[i3] == null) { // target does not exist, we have to remove the source side
                    source[i3] = null;
                    continue;
                }
                if (typeof (source[i3]) === "number" || source[i3] instanceof rnd.Token) {
                    source[i3] = target[i3];
                    target[i3].$visited = true;
                    continue;
                }
                this.mergeObjectInternal(source[i3],target[i3]);
                target[i3].$visited = true;
            }

            for (var i2 = 0;i2 < target.length;i2++) {
                if (target[i2].$visited && target[i2].$visited === true) {continue;}
                // adapt references of target
                var newTarget = target[i2];
                if (newTarget.container) {
                    newTarget.container = sourceParent;
                }
                if (newTarget.parent) {
                    newTarget.parent = sourceParent;
                }
                source.push(newTarget);
            }

            AstMerger.removeNullFromListInternal(source);
        };

        AstMerger.removeNullFromListInternal = function(list) {
            for (var i = list.length - 1;i >= 0;i--) {
                if (list[i] === null) {
                    rnd.Utils.arrayRemove(list,i);
                }
            }
        };

        AstMerger.isSameClassInternal = function(source,target) {
            /*eslint-disable no-proto*/
            if (source.__proto__ !== undefined) {
                return source.__proto__ === target.__proto__;
            }
            return source.constructor.prototype === target.constructor.prototype;
        };

        return AstMerger;
    }
);