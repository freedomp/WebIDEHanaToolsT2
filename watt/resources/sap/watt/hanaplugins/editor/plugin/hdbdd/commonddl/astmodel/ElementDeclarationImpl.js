/* base on commit
 * 49683abaa8f3892cce0c444f268c430996e638a0 Enhance AST to Support References to Constants in Annotation Values
 */
/*eslint-disable max-statements*/
define(
    ["rndrt/rnd", "commonddl/astmodel/NamedDeclarationImpl"], //dependencies
    function (rnd, NamedDeclarationImpl) {
        function ElementDeclarationImpl() {
            NamedDeclarationImpl.call(this);
        }
        ElementDeclarationImpl.prototype = Object.create(NamedDeclarationImpl.prototype);
        ElementDeclarationImpl.prototype.annotationList = null;
        ElementDeclarationImpl.KEY_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.keyToken = ElementDeclarationImpl.KEY_TOKEN_EDEFAULT;
        ElementDeclarationImpl.NULLABLE_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.nullableToken = ElementDeclarationImpl.NULLABLE_TOKEN_EDEFAULT;
        ElementDeclarationImpl.ELEMENT_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.elementToken = ElementDeclarationImpl.ELEMENT_TOKEN_EDEFAULT;
        ElementDeclarationImpl.TYPE_ID_EDEFAULT = null;
        ElementDeclarationImpl.prototype.typeIdPath = null;
        ElementDeclarationImpl.NOT_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.notToken = ElementDeclarationImpl.NOT_TOKEN_EDEFAULT;
        ElementDeclarationImpl.prototype.default_ = null;
        ElementDeclarationImpl.prototype.enumerationDeclaration = null;
        ElementDeclarationImpl.prototype.anonymousType = null;
        ElementDeclarationImpl.prototype.typeOfPath = null;
        ElementDeclarationImpl.CARDINALITY_START_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.cardinalityStartToken = ElementDeclarationImpl.CARDINALITY_START_TOKEN_EDEFAULT;
        ElementDeclarationImpl.CARDINALITY_END_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.cardinalityEndToken = ElementDeclarationImpl.CARDINALITY_END_TOKEN_EDEFAULT;
        ElementDeclarationImpl.CARDINALITY_MIN_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.cardinalityMinToken = ElementDeclarationImpl.CARDINALITY_MIN_TOKEN_EDEFAULT;
        ElementDeclarationImpl.CARDINALITY_MAX_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.cardinalityMaxToken = ElementDeclarationImpl.CARDINALITY_MAX_TOKEN_EDEFAULT;
        ElementDeclarationImpl.ARRAY_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.arrayToken = ElementDeclarationImpl.ARRAY_TOKEN_EDEFAULT;
        ElementDeclarationImpl.ARRAY_OF_TOKEN_EDEFAULT = null;
        ElementDeclarationImpl.prototype.arrayOfToken = ElementDeclarationImpl.ARRAY_OF_TOKEN_EDEFAULT;
        ElementDeclarationImpl.prototype.constructor = ElementDeclarationImpl;
        ElementDeclarationImpl.prototype.getAnnotationList = function () {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        ElementDeclarationImpl.prototype.isKey = function () {
            /*eslint-disable no-eq-null*/
            return this.getKeyToken() != null;
        };
        ElementDeclarationImpl.prototype.getKeyToken = function () {
            return this.keyToken;
        };
        ElementDeclarationImpl.prototype.setKeyToken = function (newKeyToken) {
            var oldKeyToken = this.keyToken;
            this.keyToken = newKeyToken;
        };
        ElementDeclarationImpl.prototype.getNullableToken = function () {
            return this.nullableToken;
        };
        ElementDeclarationImpl.prototype.setNullableToken = function (newNullableToken) {
            var oldNullableToken = this.nullableToken;
            this.nullableToken = newNullableToken;
        };
        ElementDeclarationImpl.prototype.isElement = function () {
            /*eslint-disable no-eq-null*/
            return this.getElementToken() != null;
        };
        ElementDeclarationImpl.prototype.getElementToken = function () {
            return this.elementToken;
        };
        ElementDeclarationImpl.prototype.setElementToken = function (newElementToken) {
            var oldElementToken = this.elementToken;
            this.elementToken = newElementToken;
        };
        ElementDeclarationImpl.prototype.getTypeId = function () {
            var path = this.getTypeIdPath();
            /*eslint-disable no-eq-null*/
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                var str = path.getPathString(false);
                return str;
            } else {
                return "";
            }
        };
        ElementDeclarationImpl.prototype.getTypeIdPath = function () {
            return this.typeIdPath;
        };
        ElementDeclarationImpl.prototype.basicSetTypeIdPath = function (newTypeIdPath, msgs) {
            var oldTypeIdPath = this.typeIdPath;
            this.typeIdPath = newTypeIdPath;
            this.typeIdPath.parent = this;
            return msgs;
        };
        ElementDeclarationImpl.prototype.setTypeIdPath = function (newTypeIdPath) {
            if (newTypeIdPath !== this.typeIdPath) {
                this.basicSetTypeIdPath(newTypeIdPath);
            }
        };
        ElementDeclarationImpl.prototype.getNotToken = function () {
            return this.notToken;
        };
        ElementDeclarationImpl.prototype.setNotToken = function (newNotToken) {
            var oldNotToken = this.notToken;
            this.notToken = newNotToken;
        };
        ElementDeclarationImpl.prototype.getDefault = function () {
            return this.default_;
        };
        ElementDeclarationImpl.prototype.basicSetDefault = function (newDefault, msgs) {
            var oldDefault = this.default_;
            this.default_ = newDefault;
            this.default_.setContainer(this);
            return msgs;
        };
        ElementDeclarationImpl.prototype.setDefault = function (newDefault) {
            if (newDefault !== this.default_) {
                this.basicSetDefault(newDefault);
            }
        };
        ElementDeclarationImpl.prototype.getEnumerationDeclaration = function () {
            return this.enumerationDeclaration;
        };
        ElementDeclarationImpl.prototype.basicSetEnumerationDeclaration = function (newEnumerationDeclaration, msgs) {
            var oldEnumerationDeclaration = this.enumerationDeclaration;
            this.enumerationDeclaration = newEnumerationDeclaration;
            this.enumerationDeclaration.setContainer(this);
            return msgs;
        };
        ElementDeclarationImpl.prototype.setEnumerationDeclaration = function (newEnumerationDeclaration) {
            if (newEnumerationDeclaration !== this.enumerationDeclaration) {
                this.basicSetEnumerationDeclaration(newEnumerationDeclaration);
            }
        };
        ElementDeclarationImpl.prototype.getAnonymousType = function () {
            return this.anonymousType;
        };
        ElementDeclarationImpl.prototype.basicSetAnonymousType = function (newAnonymousType, msgs) {
            var oldAnonymousType = this.anonymousType;
            this.anonymousType = newAnonymousType;
            this.anonymousType.setContainer(this);
            return msgs;
        };
        ElementDeclarationImpl.prototype.setAnonymousType = function (newAnonymousType) {
            if (newAnonymousType !== this.anonymousType) {
                this.basicSetAnonymousType(newAnonymousType);
            }
        };
        ElementDeclarationImpl.prototype.getTypeOfPath = function () {
            return this.typeOfPath;
        };
        ElementDeclarationImpl.prototype.basicSetTypeOfPath = function (newTypeOfPath, msgs) {
            var oldTypeOfPath = this.typeOfPath;
            this.typeOfPath = newTypeOfPath;
            this.typeOfPath.parent = this;
            return msgs;
        };
        ElementDeclarationImpl.prototype.setTypeOfPath = function (newTypeOfPath) {
            if (newTypeOfPath !== this.typeOfPath) {
                this.basicSetTypeOfPath(newTypeOfPath);
            }
        };
        ElementDeclarationImpl.prototype.getCardinalityStartToken = function () {
            return this.cardinalityStartToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityStartToken = function (newCardinalityStartToken) {
            var oldCardinalityStartToken = this.cardinalityStartToken;
            this.cardinalityStartToken = newCardinalityStartToken;
        };
        ElementDeclarationImpl.prototype.getCardinalityEndToken = function () {
            return this.cardinalityEndToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityEndToken = function (newCardinalityEndToken) {
            var oldCardinalityEndToken = this.cardinalityEndToken;
            this.cardinalityEndToken = newCardinalityEndToken;
        };
        ElementDeclarationImpl.prototype.getCardinalityMinToken = function () {
            return this.cardinalityMinToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityMinToken = function (newCardinalityMinToken) {
            var oldCardinalityMinToken = this.cardinalityMinToken;
            this.cardinalityMinToken = newCardinalityMinToken;
        };
        ElementDeclarationImpl.prototype.getCardinalityMaxToken = function () {
            return this.cardinalityMaxToken;
        };
        ElementDeclarationImpl.prototype.setCardinalityMaxToken = function (newCardinalityMaxToken) {
            var oldCardinalityMaxToken = this.cardinalityMaxToken;
            this.cardinalityMaxToken = newCardinalityMaxToken;
        };
        ElementDeclarationImpl.prototype.getArrayToken = function () {
            return this.arrayToken;
        };
        ElementDeclarationImpl.prototype.setArrayToken = function (newArrayToken) {
            var oldArrayToken = this.arrayToken;
            this.arrayToken = newArrayToken;
        };
        ElementDeclarationImpl.prototype.getArrayOfToken = function () {
            return this.arrayOfToken;
        };
        ElementDeclarationImpl.prototype.setArrayOfToken = function (newArrayOfToken) {
            var oldArrayOfToken = this.arrayOfToken;
            this.arrayOfToken = newArrayOfToken;
        };
        ElementDeclarationImpl.prototype.isArrayType = function () {
            /*eslint-disable no-eq-null*/
            if (this.getArrayToken() != null || this.getCardinalityStartToken() != null) {
                return true;
            }
            return false;
        };
        ElementDeclarationImpl.prototype.getAnoymousType = function () {
            return this.getAnonymousType();
        };
        ElementDeclarationImpl.prototype.setAnoymousType = function (newAnoymousType) {
            this.setAnonymousType(newAnoymousType);
        };
        ElementDeclarationImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(NamedDeclarationImpl.prototype.toString.call(this));
            result.append(" (keyToken: ");
            result.append(this.keyToken);
            result.append(", nullableToken: ");
            result.append(this.nullableToken);
            result.append(", elementToken: ");
            result.append(this.elementToken);
            result.append(", notToken: ");
            result.append(this.notToken);
            result.append(", cardinalityStartToken: ");
            result.append(this.cardinalityStartToken);
            result.append(", cardinalityEndToken: ");
            result.append(this.cardinalityEndToken);
            result.append(", cardinalityMinToken: ");
            result.append(this.cardinalityMinToken);
            result.append(", cardinalityMaxToken: ");
            result.append(this.cardinalityMaxToken);
            result.append(", arrayToken: ");
            result.append(this.arrayToken);
            result.append(", arrayOfToken: ");
            result.append(this.arrayOfToken);
            result.append(")");
            return result.toString();
        };
        return ElementDeclarationImpl;
    }
);