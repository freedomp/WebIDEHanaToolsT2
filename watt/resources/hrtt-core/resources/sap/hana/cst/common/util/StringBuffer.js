/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([], //dependencies
    function () {

        function StringBuffer(string) {
            /**
             * @type {Array}
             */
            this.buffer = [];
            if (string!=null) {
                this.buffer.push(string);
            }
        }

        StringBuffer.prototype.substringLength = function(start,length) {
            var str = this.toString();
            var res = str.substring(start,start+length);
            return res;
        };

        StringBuffer.prototype.append = function(string) {
            this.buffer.push(string);
            return this;
        };
        
        StringBuffer.prototype.remove = function(num) {
            var l = this.toString();
            var result = l.slice(0, -num);
            this.buffer=[];
            this.append(result);
        };

        StringBuffer.prototype.toString = function() {
            var result = this.buffer.join("");
            return result;
        };

        StringBuffer.prototype.insert=function(idx,string) {
            this.buffer.splice(idx,0,string);
        };

        StringBuffer.prototype.length=function() {
            var len = this.toString().length;
            return len;
        };

        StringBuffer.prototype.replace=function(start,end,str) {
            var l = this.toString();
            var result = l.substring(0,start) + str + l.substring(end);
            this.buffer=[];
            this.append(result);
        };

        return StringBuffer;
    });