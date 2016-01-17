/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/modelbase"], function() {
    "use strict";
    var constants = {
        QUALIFIER_NAME_SEPARATOR_CAT_DT: "::",
        QUALIFIER_NAME_SEPARATOR_CAT_RT: ".",
        QUALIFIER_NAME_SPLITTER_CAT_RT : "\"\.",
        NAME_SUFFIX_SEPARATOR: ".",
        QUOTE: "\"",
        PATTERN_FQN_CAT_RT: "^\".+\"\\..*$",
        PATTERN_FQN_CAT_DT: "^[^\"].*::.*(\\.[a-zA-Z0-9]+)?$",
        PATTERN_FQN_CAT_DT_WITH_SUFFIX: "^[^\"].*::.*(\\.[a-zA-Z0-9]+)$"
    };

    function FullQualifiedName() {
        this.nameQualifier;
        this.name;
        this.suffix;
        this.fqNameNoSuffix;
        this.create = function(nameQualifier, name, suffix, isCatalogRTType) {
            if (nameQualifier === null || name === null) {
                throw new InvalidInputException();
            }

            var fqName = new FullQualifiedName();
            fqName.nameQualifier = nameQualifier;
            fqName.name = name;
            fqName.suffix = suffix;
            fqName.setFullQualifiedNameRTType(isCatalogRTType);
            return fqName;
        },

        this.setFullQualifiedNameRTType = function(isCatalogRTType) {
            var fqName = "";
            if (isCatalogRTType) {
                fqName = fqName + constants.QUOTE;
                fqName = fqName + this.nameQualifier;
                fqName = fqName + constants.QUOTE;
                fqName = fqName + constants.QUALIFIER_NAME_SEPARATOR_CAT_RT;
                fqName = fqName + this.name;
            } else {
                fqName = fqName + this.nameQualifier;
                fqName = fqName + constants.QUALIFIER_NAME_SEPARATOR_CAT_DT;
                fqName = fqName + this.name;
            }
            this.fqNameNoSuffix = fqName;
        },

        this.createForCatalogObject = function(schemaName, catalogObjectName) {
            return this.create(schemaName, catalogObjectName, null, true);
        },

        this.createForRepositoryObject = function(packageName, objectName, suffix) {
            return this.create(packageName, objectName, suffix, false);
        },

        this.createByFqName = function(fullQualifiedName) {
            var fqName = new FullQualifiedName();
            fqName.setFullQualifiedName(fullQualifiedName);
            return fqName;
        },

        this.createByResourceURI = function(resourceURI) {
            //var fqName = new FullQualifiedName();
            var splitted = resourceURI.split("/");
            var fqName = this.createForRepositoryObject(splitted[1], splitted[3], splitted[2].substring(0, splitted[2].length - 1));
            //fqName.setFullQualifiedName(fullQualifiedName);
            return fqName;
        },

        this.getNameQualifier = function() {
            return this.nameQualifier;
        },

        this.getName = function() {
            return this.name;
        },


        this.getSuffix = function() {
            return this.suffix;
        },


        this.isCatalogRTType = function() {
            return this.fqNameNoSuffix.substring(0, 1) === constants.QUOTE;
        },


        this.getFullQualifiedName = function(withSuffix) {
            if (withSuffix !== null && withSuffix !== undefined && withSuffix && this.suffix !== null && this.suffix !== undefined) {
                var fqNameWithSuffix = this.fqNameNoSuffix;
                fqNameWithSuffix = fqNameWithSuffix + constants.NAME_SUFFIX_SEPARATOR;
                fqNameWithSuffix = fqNameWithSuffix + this.suffix;
                return fqNameWithSuffix;
            } else {
                return this.fqNameNoSuffix;
            }
        },

        this.getResourceUri = function() {
            var resourceUri = "/";
            resourceUri = resourceUri + this.nameQualifier;
            resourceUri = resourceUri + "/";
            resourceUri = resourceUri + this.suffix + "s";
            resourceUri = resourceUri + "/";
            resourceUri = resourceUri + this.name;
            return resourceUri;
        },

        this.setFullQualifiedName = function(fqName) {
            var isCatDt = fqName.match(constants.PATTERN_FQN_CAT_DT);
            var isCatDtWithSuffix = fqName.match(constants.PATTERN_FQN_CAT_DT_WITH_SUFFIX);
            var isCatRt = fqName.match(constants.PATTERN_FQN_CAT_RT);

            if (fqName === null || (!isCatDt && !isCatDtWithSuffix && !isCatRt)) {
                throw new InvalidInputException("FQ Name in wrong format");
                // throw new modelbase.UnsupportedOperationException("FQ Name in wrong format");
            }

            // check if it is CAT DT with suffix
            var qualifierNameSeparator = null;
            if (isCatDtWithSuffix) {
                var suffixStartIdx = fqName.lastIndexOf(constants.NAME_SUFFIX_SEPARATOR);
                this.fqNameNoSuffix = fqName.substring(0, suffixStartIdx);
                this.suffix = fqName.substring(suffixStartIdx + 1);
                qualifierNameSeparator = constants.QUALIFIER_NAME_SEPARATOR_CAT_DT;
            } else {
                this.fqNameNoSuffix = fqName;
                qualifierNameSeparator = isCatDt ? constants.QUALIFIER_NAME_SEPARATOR_CAT_DT : constants.QUALIFIER_NAME_SPLITTER_CAT_RT; 
            }

            // Split and get qualifier/name
            var fragments = this.fqNameNoSuffix.split(qualifierNameSeparator);
            if (fragments !== null) {
                if (fragments.length === 3) {
    				// NameQualifer for catalog objects are in quotes; we have to take that out
    				if (isCatRt) {
    					this.databaseName = fragments[0].substring(1);
    					this.nameQualifier = fragments[1].substring(1);
    				} else {
    					this.databaseName = fragments[1];
    					this.nameQualifier = fragments[0].replace(constants.QUOTE,""); //$NON-NLS-1$
    				}
    				this.name = fragments[2];
    			} else {
    			    if (fragments.length >= 1) {
                    // NameQualifer for catalog objects are in quotes; we have to take that out
                    if (isCatRt) {
                        this.nameQualifier = fragments[0].replace(constants.QUOTE, "").replace(constants.QUOTE, ""); 
                    } else {
                        this.nameQualifier = fragments[0];
                    }
                    } else {
                        this.nameQualifier = ""; //$NON-NLS-1$
                    }
                    if (fragments.length === 2) {
                        this.name = fragments[1];
                    } else {
                        this.name = ""; //$NON-NLS-1$
                    }
    			}
            } else {
                throw new InvalidInputException("FQ Name in wrong format");
                // throw new modelbase.UnsupportedOperationException("FQ Name in wrong format");
            }
        };
    }

    return new FullQualifiedName();

});
