define(function() {
  "use strict";

  return {
    execute: function(breakpoint) {
      return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
        if (controller) {
          controller._openDefaultEditor(breakpoint.filePath, breakpoint.lineNumber);
        }
      }).done();
    },

    isEnabled: function() {
      return true;
    },

    isAvailable: function(breakpointDelegate) {
      return !!breakpointDelegate.defaultValue;
    }
  };
});
