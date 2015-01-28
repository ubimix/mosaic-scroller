var _ = require('underscore');
var Mosaic = require('mosaic-commons');

module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {

    initialize : function(options) {
        this.setOptions(options);
        this._position = -1;
        this._delta = 0;
    },

    getLength : function() {
        return this.options.length || 100000;
    },

    getPosition : function() {
        return this._position;
    },

    getDelta : function() {
        return this._delta;
    },

    setPosition : function(position) {
        var prevPosition = this._position || 0;
        this._position = position || 0;
        var length = this.getLength();
        var threshold = this.getThreshold();
        var delta = 0;
        if (this._position < threshold || //
        this._position > length - threshold) {
            this._position = length / 2;
        } else {
            delta = this._position - prevPosition;
        }
        this._delta = delta;
        this.emit('update', {
            prevPosition : prevPosition,
            position : this._position,
            delta : delta
        });
    },

    getThreshold : function() {
        if (!this.options.threshold) {
            var length = this.getLength();
            this.options.threshold = Math.max(length / 4, 50);
        }
        return this.options.threshold;
    },

    addChangeListener : function(listener, context) {
        this.on('update', listener, context);
    },

    removeChangeListener : function(listener, context) {
        this.off('update', listener, context);
    }

});
