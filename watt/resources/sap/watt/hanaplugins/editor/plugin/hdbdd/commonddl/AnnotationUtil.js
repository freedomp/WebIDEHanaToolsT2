/*eslint-disable no-eq-null,eqeqeq,camelcase,quotes,max-params,complexity*/
// based on commit
//80d6b02d0b4ff2e02162862ee996fb745578d4a6 DDL Scope - Annotation highlighting - corrections
define(
    [
	"commonddl/astmodel/AbstractAnnotationImpl",
	"commonddl/astmodel/AbstractAnnotationValueImpl",
	"commonddl/astmodel/AnnotatedImpl",
	"commonddl/astmodel/AnnotationArrayValueImpl",
	"commonddl/astmodel/AnnotationDeclarationImpl",
	"commonddl/astmodel/AnnotationValueImpl",
	"commonddl/astmodel/AnonymousTypeDeclarationImpl",
	"commonddl/astmodel/IAstFactory",
	"commonddl/astmodel/AttributeDeclarationImpl",
	"commonddl/astmodel/CompilationUnitImpl",
	"commonddl/astmodel/DdlStatementImpl",
	"commonddl/astmodel/ElementDeclarationImpl",
	"commonddl/astmodel/EnumerationDeclarationImpl",
	"commonddl/astmodel/EnumerationValueImpl",
	"commonddl/astmodel/ExpressionImpl",
	"commonddl/astmodel/LiteralExpressionImpl",
	"commonddl/astmodel/PathExpressionImpl",
	"rndrt/rnd"
	], //dependencies
    function (
	AbstractAnnotationImpl,
	AbstractAnnotationValueImpl,
	AnnotatedImpl,
	AnnotationArrayValueImpl,
	AnnotationDeclarationImpl,
	AnnotationValueImpl,
	AnonymousTypeDeclarationImpl,
	IAstFactory,
	AttributeDeclarationImpl,
	CompilationUnitImpl,
	DdlStatementImpl,
	ElementDeclarationImpl,
	EnumerationDeclarationImpl,
	EnumerationValueImpl,
	ExpressionImpl,
	LiteralExpressionImpl,
	PathExpressionImpl,
	rnd
	) {
var Token = rnd.Token;
        var Utils = rnd.Utils;
        var StringBuffer = rnd.StringBuffer;
        function AnnotationUtil() {
        }
            function AnnotationDefsResult() {
                this.annotationDefs = [];
                this.enumValuesByAnnotDef = {};
            }
        AnnotationUtil.SCOPE_ANNOTATION_NAME = "Scope";
        AnnotationUtil.getAnnotationsAsStringList1 = function(annotationCu) {
            var result = {};
            if (annotationCu != null) {
                var statements = annotationCu.getStatements();
                result = AnnotationUtil.getAnnotationsAsStringList1(statements);
            }
            return result;
        };
        AnnotationDefsResult.prototype.annotationDefs = null;
        AnnotationDefsResult.prototype.enumValuesByAnnotDef = null;

        AnnotationUtil.getAnnotationDefsAndEnumValues = function(annotationCu,caseInsensitiveAndAllInLowerCase) {
            var result = new AnnotationDefsResult();
            if (annotationCu != null) {
                var statements = annotationCu.getStatements();
                result = AnnotationUtil.getAnnotationDefsAndEnumValuesWithStmts(statements,caseInsensitiveAndAllInLowerCase);
            }
            return result;
        };
        AnnotationUtil.getAnnotationDefsAndEnumValuesWithStmts = function(statements,caseInsensitiveAndAllInLowerCase) {
            var result = new AnnotationDefsResult();
            for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                var stmt = statements[stmtCount];
                if (stmt instanceof AnnotationDeclarationImpl) {
                    var annotDecl = stmt;
                    var annotDeclName = AnnotationUtil.getInPreferredCase(annotDecl.getName(), caseInsensitiveAndAllInLowerCase);
                    result.annotationDefs.push(annotDeclName);
                    result.enumValuesByAnnotDef[annotDeclName] = AnnotationUtil.getEnumValues(annotDecl.getEnumerationDeclaration(),caseInsensitiveAndAllInLowerCase);
                    var anonymousType = annotDecl.getAnonymousType();
                    if (anonymousType != null) {
                        var allAnonymousTypes = AnnotationUtil.getAllTypeNamesAsSet(annotDeclName, anonymousType, caseInsensitiveAndAllInLowerCase);
                        result.annotationDefs = result.annotationDefs.concat(allAnonymousTypes.annotationDefs);
                        result.enumValuesByAnnotDef = Utils.collect(result.enumValuesByAnnotDef, allAnonymousTypes.enumValuesByAnnotDef);
                    }
                }
            }
            return result;
        };
        AnnotationUtil.getInPreferredCase = function(name, caseInsensitiveAndAllInLowerCase) {
            if (name != null && caseInsensitiveAndAllInLowerCase) {
                name = name.toLowerCase();
            }
            return name;
        };
        AnnotationUtil.getEnumValues = function(ed, caseInsensitiveAndAllInLowerCase) {
            var result = [];
            if (ed != null) {
                var values = ed.getValues();
                for (var vCount = 0; vCount < values.length; vCount++) {
                    var v = values[vCount];
                    var symbol = v.getSymbol();
                    if (symbol != null) {
                        result.push(AnnotationUtil.getInPreferredCase("#" + symbol.m_lexem, caseInsensitiveAndAllInLowerCase));
                    }
                }
            }
            return result;
        };
        AnnotationUtil.getAnnotationsAsStringList1 = function(statements) {
            var result = {};
            for (var stmtCount = 0;stmtCount < statements.length;stmtCount++) {
                var stmt = statements[stmtCount];
                if (stmt instanceof AnnotationDeclarationImpl) {
                    var annotDecl = stmt;
                    var annotDeclName = annotDecl.getName();
                    var anonymousType = annotDecl.getAnonymousType();
                    if (anonymousType != null) {
                        var allAnonymousTypes = AnnotationUtil.getAllTypeNames(annotDeclName,anonymousType);
                        result = rnd.Utils.collect(result,allAnonymousTypes);
                    }else{
                        if (result[annotDeclName] == false) {
                            result[annotDeclName] = annotDecl;
                        }
                    }
                }
            }
            return result;
        };
        AnnotationUtil.getAllTypeNames = function(annotDeclName,anoymousType) {
            var result = {};
            var elements = anoymousType.getElements();
            if (elements.length == 0) {
                var el = IAstFactory.eINSTANCE.createAttributeDeclaration();
                result[annotDeclName] = el;
            }
            for (var elementCount = 0;elementCount < elements.length;elementCount++) {
                var element = elements[elementCount];
                var annotName = annotDeclName + "." + element.getName();
                var elAno = element.getAnonymousType();
                if (elAno == null || elAno.getElements().length == 0) {
                    result[annotName] = element;
                }else{
                    result = Utils.collect(result,AnnotationUtil.getAllTypeNames(annotName,elAno));
                }
            }
            return result;
        };
        AnnotationUtil.getAllTypeNamesAsSet = function(annotDeclName,anoymousType,caseInsensitiveAndAllInLowerCase) {
            var result = new AnnotationDefsResult();
            var elements = anoymousType.getElements();
            if (elements.length == 0) {
                result.annotationDefs.push(annotDeclName);
            }
            for (var elementCount = 0;elementCount < elements.length;elementCount++) {
                var element = elements[elementCount];
                var annotName = AnnotationUtil.getInPreferredCase(annotDeclName + "." + element.getName(),caseInsensitiveAndAllInLowerCase);
                var elAno = element.getAnonymousType();
                result.annotationDefs.push(annotName);
                result.enumValuesByAnnotDef[annotName] = AnnotationUtil.getEnumValues(element.getEnumerationDeclaration(),caseInsensitiveAndAllInLowerCase);
                if (elAno != null && elAno.getElements().length > 0) {
                    var n = AnnotationUtil.getAllTypeNamesAsSet(annotName,elAno,caseInsensitiveAndAllInLowerCase);
                    result.annotationDefs = result.annotationDefs.concat(n.annotationDefs);
                    result.enumValuesByAnnotDef = Utils.collect(result.enumValuesByAnnotDef,n.enumValuesByAnnotDef);
                }
            }
            return result;
        };
        AnnotationUtil.getScopeValueForAnnotation = function(elementDeclaration) {
            var scopeValues = [];
            var annotList = elementDeclaration.getAnnotationList();
            var current = elementDeclaration;
            while (scopeValues.length == 0) {
                annotList = current.getAnnotationList();
                if (annotList != null && annotList.length > 0) {
                    for (var elementCount = 0;elementCount < annotList.length;elementCount++) {
                        var element = annotList[elementCount];
                        var annot = element;
                        var nameTokenPath = annot.getNameTokenPath();
                        if (nameTokenPath != null && nameTokenPath.length == 1) {
                            if (AnnotationUtil.SCOPE_ANNOTATION_NAME === nameTokenPath[0].m_lexem) {
                                var value = annot.getValue();
                                if (value instanceof AnnotationValueImpl) {
                                    scopeValues.push((value).getValueToken().m_lexem);
                                    break;
                                }else if (value instanceof AnnotationArrayValueImpl) {
                                    var vs = (value).getValues();
                                    for (var vaCount = 0;vaCount < vs.length;vaCount++) {
                                        var va = vs[vaCount];
                                        if (va instanceof AnnotationValueImpl) {
                                            scopeValues.push((va).getValueToken().m_lexem);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (scopeValues.length > 0) {
                    break;
                }
                if (!(current.eContainer() instanceof AnnotatedImpl)) {
                    break;
                }
                current = current.eContainer();
                if (current == null) {
                    break;
                }
            }
            if (annotList == null || annotList.length == 0 || scopeValues.length == 0) {
                return null;
            }
            return scopeValues;
        };
        AnnotationUtil.hasScope1 = function(elementDeclaration) {
            var annotList = null;
            var current = elementDeclaration;
            while (current != null) {
                annotList = current.getAnnotationList();
                if (annotList != null && annotList.length > 0) {
                    for (var elementCount = 0;elementCount < annotList.length;elementCount++) {
                        var element = annotList[elementCount];
                        var annot = element;
                        if (AnnotationUtil.hasScope1(annot)) {
                            return true;
                        }
                    }
                }
                if (!(current.eContainer() instanceof AnnotatedImpl)) {
                    break;
                }
                current = current.eContainer();
                if (current == null) {
                    break;
                }
            }
            return false;
        };
        AnnotationUtil.hasScope1 = function(annot) {
            var nameTokenPath = annot.getNameTokenPath();
            if (nameTokenPath != null && nameTokenPath.length == 1) {
                if (AnnotationUtil.SCOPE_ANNOTATION_NAME === nameTokenPath[0].m_lexem) {
                    return true;
                }
            }
            return false;
        };
        AnnotationUtil.getAnnotationsAsString = function(statements) {
            var result = {};
            for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                var stmt = statements[stmtCount];
                if (stmt instanceof AnnotationDeclarationImpl) {
                    var annotDecl = stmt;
                    var annotDeclName = annotDecl.getName();
                    var anonymousType = annotDecl.getAnonymousType();
                    if (anonymousType != null) {
                        var allAnonymousTypes = AnnotationUtil.getAllNames(annotDeclName, anonymousType);
                        result = Utils.collect(result, allAnonymousTypes);
                    } else {
                    	if (result[annotDeclName] == null) {
                            result[annotDeclName] = annotDecl;
                        }
                    }
                }
            }
            return result;
        };
        AnnotationUtil.getAllNames = function(annotDeclName, anoymousType) {
            var result = {};
            var elements = anoymousType.getElements();
            if (elements.length == 0) {
                var el = IAstFactory.eINSTANCE.createAttributeDeclaration();
                result[annotDeclName] = el;
            }
            for (var elementCount = 0; elementCount < elements.length; elementCount++) {
                var element = elements[elementCount];
                var annotName = annotDeclName + "." + element.getName();
                var elAno = element.getAnonymousType();
                if (elAno == null || elAno.getElements().length == 0) {
                    result[annotName] = element;
                } else {
                    result = Utils.collect(result, AnnotationUtil.getAllNames(annotName, elAno));
                }
            }
            return result;
        };
        AnnotationUtil.getStringIgnoringComments = function(origString) {
            if (rnd.Utils.stringContains(origString, "/*") == false) {
                return origString;
            }
            var result = new StringBuffer();
            var charAt;
            var charAtPreview = ' ';
            var insertChar = true;
            for (var i = 0; i < origString.length; i++) {
                charAt = origString.charAt(i);
                if (charAtPreview == '/' && charAt == '*') {
                    insertChar = false;
                }
                if (charAtPreview == '*' && charAt == '/') {
                    insertChar = true;
                    continue;
                }
                if (charAt == '/' || charAt == '*' || charAt == '\\') {
                    charAtPreview = charAt;
                    continue;
                }
                if (insertChar == true) {
                    result.append(origString.charAt(i));
                }
                charAtPreview = charAt;
            }
            return result.toString();
        };
		AnnotationUtil.getAnnotationDefaultValue = function(elementDecl) {
			var defaultValue = null;
			var def = elementDecl.getDefault();
			if (def == null) {
				return defaultValue;
			}
			if (def instanceof LiteralExpressionImpl) {
				defaultValue = (def).getToken();
			} else if (def instanceof PathExpressionImpl) {
				defaultValue = (def).getPathString(false);
			}
			return defaultValue;
		};
        AnnotationUtil.getAnnotationDefaultValue1 = function(elementDecl) {
            return AnnotationUtil.getAnnotationDefaultValue(elementDecl);
        };
        AnnotationUtil.getAnnotationValueByDefault = function(elementDecl) {
			var typeId = elementDecl.getTypeId();
			if (typeId == null || typeId.length <= 0) {
				return "";
			}
			if (rnd.Utils.stringEqualsIgnoreCase("boolean", typeId)) {
				return "";
			} else if (rnd.Utils.stringStartsWith("string", typeId.toLowerCase()) || rnd.Utils.stringEqualsIgnoreCase("elementRef", typeId)) {
				var enumDeclaration = elementDecl.getEnumerationDeclaration();
				if (enumDeclaration != null) {
					return "";
				}
				return "''";
			} else if (rnd.Utils.stringEqualsIgnoreCase("number", typeId) || rnd.Utils.stringEqualsIgnoreCase("integer", typeId)) {
				return "";
			} else {
				var enumDeclaration1 = elementDecl.getEnumerationDeclaration();
				if (enumDeclaration1 != null) {
					return "";
				}
			}
			return "''";
		};
		AnnotationUtil.getScopeAnnotation = function(annotationList) {
			for (var annotCount = 0; annotCount < annotationList.length; annotCount++) {
				var annot = annotationList[annotCount];
				var ap = annot.getNameTokenPath();
				if (ap != null && ap.length == 1) {
					var name = ap[0].m_lexem;
					if (rnd.Utils.stringEqualsIgnoreCase("Scope", name)) {
						return annot;
					}
				}
			}
			return null;
		};
		AnnotationUtil.getAnnotationScopeList = function(value) {
			var annotationScopeList = [];
			if (value instanceof AnnotationArrayValueImpl) {
				for (var vCount = 0; vCount < (value).getValues().length; vCount++) {
					var v = (value).getValues()[vCount];
					var list = AnnotationUtil.getAnnotationScopeList(v);
					if (!(rnd.Utils.arrayContainsAll(annotationScopeList, list))) {
						annotationScopeList = annotationScopeList.concat(list);
					}
				}
				return annotationScopeList;
			} else if (value instanceof AnnotationValueImpl) {
				var vt = (value).getValueToken();
				if (vt != null) {
					var annotScopeList = [];
					annotScopeList.push(vt.m_lexem);
					return annotScopeList;
				}
			} else {
				throw new Error();
			}
			return null;
		};
        AnnotationUtil.getAnnotationDefaultValue2 = function(elem,checkForArray) {
            if (checkForArray && elem.isArrayType()) {
                var res = AnnotationUtil.getAnnotationCompletionForArray(elem);
                return res;
            }
            var defaultValue = AnnotationUtil.getAnnotationDefaultValue1(elem);
            if (defaultValue != null && defaultValue.length > 0) {
                return defaultValue;
            }
            return AnnotationUtil.getAnnotationValueByDefault(elem);
        };
        AnnotationUtil.getAnnotationCompletionForArray = function(elementDecl) {
            if (elementDecl == null || elementDecl.isArrayType() == false) {
                return "";
            }
            var res = new StringBuffer(" [ ");
            var anonymousType = elementDecl.getAnonymousType();
            if (anonymousType != null) {
                res.append(" { ");
                var elements = anonymousType.getElements();
                for (var i = 0;i < elements.length;i++) {
                    if (i > 0) {
                        res.append(", ");
                    }
                    var elem = elements[i];
                    var name = elem.getName();
                    var def = AnnotationUtil.getAnnotationDefaultValue2(elem, true);
                    res.append(name).append(": ").append(def);
                }
                res.append(" } ");
            }else{
                res.append(AnnotationUtil.getAnnotationDefaultValue2(elementDecl,false));
            }
            res.append(" ] ");
            return res.toString();
        };
        return AnnotationUtil;
    }
);