define(
    ["commonddl/astmodel/SourceRangeImpl","commonddl/astmodel/EObjectContainmentEList","rndrt/rnd"], //dependencies
    function (SourceRangeImpl,EObjectContainmentEList,rnd) {
        function AnnotationNameValuePairImpl() {
            SourceRangeImpl.call(this);
        }
        AnnotationNameValuePairImpl.prototype = Object.create(SourceRangeImpl.prototype);
        AnnotationNameValuePairImpl.prototype.nameTokenPath = null;
        AnnotationNameValuePairImpl.prototype.value = null;
        AnnotationNameValuePairImpl.prototype.constructor = AnnotationNameValuePairImpl;
        AnnotationNameValuePairImpl.prototype.getNameTokenPath = function() {
            /*eslint-disable no-eq-null*/
            if (this.nameTokenPath == null) {
                this.nameTokenPath = new EObjectContainmentEList(this);
            }
            return this.nameTokenPath;
        };
        AnnotationNameValuePairImpl.prototype.getValue = function() {
            return this.value;
        };
        AnnotationNameValuePairImpl.prototype.basicSetValue = function(newValue,msgs) {
            var oldValue = this.value;
            this.value = newValue;
            this.value.setContainer(this);
            return msgs;
        };
        AnnotationNameValuePairImpl.prototype.setValue = function(newValue) {
            if (newValue !== this.value) {
                this.basicSetValue(newValue);
            }
        };
        AnnotationNameValuePairImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (nameTokenPath: ");
            result.append(this.nameTokenPath);
            result.append(")");
            return result.toString();
        };
        return AnnotationNameValuePairImpl;
    }
);