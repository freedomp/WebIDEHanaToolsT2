/*eslint-disable no-eq-null,eqeqeq,camelcase*/
define(
    [], //dependencies
    function () {
        function AbstractDdlCodeCompletionProposal(name,type) {
            this.name = name;
            this.type = type;
        }
        AbstractDdlCodeCompletionProposal.prototype = Object.create(null);

        AbstractDdlCodeCompletionProposal.prototype.name = "";
        AbstractDdlCodeCompletionProposal.prototype.type = null;

        AbstractDdlCodeCompletionProposal.prototype.getName = function() {
            return this.name;
        };
        AbstractDdlCodeCompletionProposal.prototype.setName = function(name) {
            this.name = name;
        };
        AbstractDdlCodeCompletionProposal.prototype.getType = function() {
            return this.type;
        };
        AbstractDdlCodeCompletionProposal.prototype.setType = function(type) {
            this.type = type;
        };
        AbstractDdlCodeCompletionProposal.prototype.hashCode = function() {
            var prime = 31;
            var result = 1;
            result = prime * result + ((this.name == null) ? 0 : this.name.hashCode());
            result = prime * result + ((this.type == null) ? 0 : this.type.hashCode());
            return result;
        };
        AbstractDdlCodeCompletionProposal.prototype.equals = function(obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
//            if (this.getClass() != obj.getClass()) {
//                return false;
//            }
            var other = obj;
            if (this.name == null) {
                if (other.name != null) {
                    return false;
                }
            }else if (!(this.name === other.name)) {
                return false;
            }
            if (this.type != other.type) {
                return false;
            }
            return true;
        };
    return AbstractDdlCodeCompletionProposal;

    }
);