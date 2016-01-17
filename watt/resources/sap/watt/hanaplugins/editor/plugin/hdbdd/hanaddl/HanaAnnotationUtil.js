/* migrated based on 
 * c864ad258351f815ac858ee927cfe06cc7511fe5 CDS: Adapt grammar for Annotation Definitions
 */
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    ["commonddl/commonddlNonUi","rndrt/rnd"], //dependencies
    function (commonddl,rnd) {
        var AnnotationDeclarationImpl = commonddl.AnnotationDeclarationImpl;
        var IAstFactory = commonddl.IAstFactory;

        function HanaAnnotationUtil() {
        }
        HanaAnnotationUtil.getAnnotationsAsStringList = function(statements) {
            var result = {};
            for (var stmtCount = 0;stmtCount < statements.length;stmtCount++) {
                var stmt = statements[stmtCount];
                if (stmt instanceof AnnotationDeclarationImpl) {
                    var annotDecl = stmt;
                    var annotDeclName = annotDecl.getName();
                    if (annotDecl.isArrayType()) {
                        if (result[annotDeclName] == null) {
                            result[annotDeclName] = annotDecl;
                        }
                    }else{
                        var anonymousType = annotDecl.getAnonymousType();
                        if (anonymousType != null) {
                            var allAnonymousTypes = HanaAnnotationUtil.getAllTypeNames(annotDeclName,anonymousType);
                            result = rnd.Utils.collect(result,allAnonymousTypes);
                        }else{
                            if (result[annotDeclName] == null) {
                                result[annotDeclName] = annotDecl;
                            }
                        }
                    }
                }
            }
            return result;
        };
        HanaAnnotationUtil.getAllTypeNames = function(annotDeclName,anoymousType) {
            var result = {};
            var elements = anoymousType.getElements();
            if (elements.length == 0) {
                var el = IAstFactory.eINSTANCE.createAttributeDeclaration();
                result[annotDeclName] = el;
            }
            for (var elementCount = 0;elementCount < elements.length;elementCount++) {
                var element = elements[elementCount];
                var annotName = annotDeclName + "." + element.getName();
                if (element.isArrayType()) {
                    result[annotName] = element;
                }else{
                    var elAno = element.getAnonymousType();
                    if (elAno == null || elAno.getElements().length == 0) {
                        result[annotName] = element;
                    }else{
                        result = rnd.Utils.collect(result,HanaAnnotationUtil.getAllTypeNames(annotName,elAno));
                    }
                }
            }
            return result;
        };
        HanaAnnotationUtil.getAnnotationDefault = function(elem,checkForArray) {
            if (checkForArray && elem.isArrayType()) {
                var res = HanaAnnotationUtil.getAnnotationCompletionForArray(elem);
                return res;
            }
            var def = elem.getDefault();
            if (def instanceof commonddl.LiteralExpressionImpl) {
                var defaultValue = (def).getToken();
                if (defaultValue != null && defaultValue.length > 0) {
                    return defaultValue;
                }
            }else if (def instanceof commonddl.PathExpressionImpl) {
                var defaultValue = (def).getPathString(false);
                if (defaultValue != null && defaultValue.length > 0) {
                    return defaultValue;
                }
            }
            var typeId = elem.getTypeId();
            if (typeId != null) {
                typeId = typeId.toLowerCase();
                if (rnd.Utils.stringStartsWith(typeId, "string")) {
                    return "''";
                }
            }
            return "";
        };
        HanaAnnotationUtil.getAnnotationCompletionForArray = function(elementDecl) {
            if (elementDecl == null || elementDecl.isArrayType() == false) {
                return "";
            }
            var res = new rnd.StringBuffer("[");
            var anonymousType = elementDecl.getAnonymousType();
            if (anonymousType != null) {
                res.append("{");
                var elements = anonymousType.getElements();
                for (var i = 0;i < elements.length;i++) {
                    if (i > 0) {
                        res.append(", ");
                    }
                    var elem = elements[i];
                    var name = elem.getName();
                    var def = HanaAnnotationUtil.getAnnotationDefault(elem,true);
                    res.append(name).append(": ").append(def);
                }
                res.append("}");
            }else{
                res.append(HanaAnnotationUtil.getAnnotationDefault(elementDecl,false));
            }
            res.append("]");
            return res.toString();
        };
        HanaAnnotationUtil.getAnnotationElementForPath = function(definition,annotations) {
            if (annotations == null || rnd.Utils.stringContains(definition, ".") == false) {
                return null;
            }
            var current = null;
            var tok = new rnd.StringTokenizer(definition,".");
            while (tok.hasMoreTokens()) {
                var t = tok.nextToken();
                if (current == null) {
                    current = HanaAnnotationUtil.getWithCu(annotations,t);
                }else{
                    current = HanaAnnotationUtil.get(current,t);
                }
                if (current == null) {
                    return null;
                }
            }
            return current;
        };
        HanaAnnotationUtil.get = function(current,t) {
            var at = current.getAnonymousType();
            if (at == null) {
                return null;
            }
            for (var elCount = 0;elCount < at.getElements().length;elCount++) {
                var el = at.getElements()[elCount];
                var n = el.getName();
                if (n != null && rnd.Utils.stringEqualsIgnoreCase(n, t)) {
                    return el;
                }
            }
            return null;
        };
        HanaAnnotationUtil.getWithCu = function(annotations,t) {
            for (var stmtCount = 0;stmtCount < annotations.getStatements().length;stmtCount++) {
                var stmt = annotations.getStatements()[stmtCount];
                var n = stmt.getName();
                if (n != null && rnd.Utils.stringEqualsIgnoreCase(n, t)) {
                    return stmt;
                }
            }
            return null;
        };
        return HanaAnnotationUtil;
    }
);