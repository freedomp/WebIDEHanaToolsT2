// based on commit
// c5f01a93f99b856161949a256120c2a63b4e50ae Remove duplicated code
define(
    ["commonddl/astmodel/AnnotationNameValuePairImpl","commonddl/astmodel/AbstractAnnotationValueImpl",
        "commonddl/astmodel/AnnotationValueImpl","commonddl/astmodel/AnnotationRecordValueImpl", "rndrt/rnd"], //dependencies
    function (AnnotationNameValuePairImpl,AbstractAnnotationValueImpl,AnnotationValueImpl,AnnotationRecordValueImpl, rnd) {
        var Utils = rnd.Utils;
        
        function AbstractAnnotationImpl() {
            AnnotationNameValuePairImpl.call(this);
        }
        AbstractAnnotationImpl.prototype = Object.create(AnnotationNameValuePairImpl.prototype);
        AbstractAnnotationImpl.prototype.constructor = AbstractAnnotationImpl;
        AbstractAnnotationImpl.prototype.getValueTokenForPath = function(path) {
            var namePath = this.getPathForTokens(this.getNameTokenPath());
            var value = this.getValue();
            return this.getValueForPathWithValue(path,namePath,value);
        };
		AbstractAnnotationImpl.prototype.getKeyTokenForPath = function(path) {
			var namePath = this.getPathForTokens(this.getNameTokenPath());
			return this.getKeyTokenForPathWithValue(path, namePath, this);
		};
		AbstractAnnotationImpl.prototype.getKeyTokenForPathWithValue = function(path, namePath, annot) {
            /*eslint-disable no-eq-null*/
			if (namePath == null || path == null) {
				return null;
			}
			if (rnd.Utils.stringEqualsIgnoreCase(namePath, path)) {
				var nameTokens = annot.getNameTokenPath();
				if (nameTokens.length > 0) {
					var last = nameTokens[nameTokens.length - 1];
					return last;
				}
			} else if (rnd.Utils.stringStartsWith(path.toUpperCase(), namePath.toUpperCase())) {
				var value = annot.getValue();
				if (value instanceof AnnotationRecordValueImpl) {
					var record = value;
					path = path.substring(namePath.length);
					path = path.substring(1);
					return this.getKeyTokenForPathRecordValue(record, path);
				}
			}
			return null;
		};
        AbstractAnnotationImpl.prototype.getValueForPath = function(path) {
            if (this.getValueTokenForPath(path) == null) {
                return null;
            }
            var lexem = this.getValueTokenForPath(path).m_lexem;
            if (Utils.stringStartsWith(lexem, "'") && Utils.stringEndsWith(lexem, "'")) {
                lexem = lexem.substring(1,lexem.length - 1);
            }
            return lexem;
        };
        AbstractAnnotationImpl.prototype.getValueForPathWithValue = function(path,namePath,valueParam) {
            if (Utils.stringEqualsIgnoreCase(namePath, path)) {
                if (valueParam instanceof AnnotationValueImpl) {
                    var simpleValue = valueParam;
                    return simpleValue.getValueToken();
                }
            }else if (Utils.stringStartsWith(path.toUpperCase(), namePath.toUpperCase())) {
                if (valueParam instanceof AnnotationRecordValueImpl) {
                    var record = valueParam;
                    path = path.substring(namePath.length);
                    path = path.substring(1);
                    return this.getValueForPathRecordValue(record,path);
                }
            }
            return null;
        };
        AbstractAnnotationImpl.prototype.getPathForTokens = function(tokens) {
            var namePath = null;
            for (var tokenCount = 0; tokenCount < tokens.length; tokenCount++) {
                var token = tokens[tokenCount];
                if (namePath == null) {
                    namePath = token.m_lexem;
                }else{
                    namePath = namePath + token.m_lexem;
                }
            }
            return namePath;
        };
        AbstractAnnotationImpl.prototype.getValueForPathRecordValue = function(recordValue,path) {
            var components = recordValue.getComponents();
            for (var nameValuePairCount = 0; nameValuePairCount < components.length; nameValuePairCount++) {
                var nameValuePair = components[nameValuePairCount];
                var namePath = this.getPathForTokens(nameValuePair.getNameTokenPath());
                var value = nameValuePair.getValue();
                var token = this.getValueForPathWithValue(path,namePath,value);
                if (token != null) {
                    return token;
                }
            }
            return null;
        };
		AbstractAnnotationImpl.prototype.getKeyTokenForPathRecordValue = function(recordValue, path) {
			var components = recordValue.getComponents();
			for (var nameValuePairCount = 0; nameValuePairCount < components.length; nameValuePairCount++) {
				var nameValuePair = components[nameValuePairCount];
				var namePath = this.getPathForTokens(nameValuePair.getNameTokenPath());
				var token = this.getKeyTokenForPathWithValue(path, namePath, nameValuePair);
				if (token != null) {
					return token;
				}
			}
			return null;
		};
        return AbstractAnnotationImpl;
    }
);