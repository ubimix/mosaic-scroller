var _ = require('underscore');
var Mosaic = require('mosaic-commons');

module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {

    initialize : function(options) {
        this.setOptions(options);
    },
    _setAll : function(obj) {
        var updated = false;
        _.each(obj, function(value, key) {
            updated |= !this._equal(value, this.options[key]);
            this.options[key] = value;
        }, this);
        return this._notify(updated);
    },
    _set : function(key, value) {
        var updated = !this._equal(value, this.options[key]);
        this.options[key] = value;
        return this._notify(updated);
    },
    _get : function(key) {
        return this.options[key];
    },
    _equal : function(first, second) {
        return first == second;
    },
    _notify : function(updated) {
        if (updated) {
            this.fire('updated');
        }
        return updated;
    },
    setLength : function(value) {
        return this._set('len', value || 0);
    },

    getLength : function(value) {
        return this._get('len');
    },

    setPosition : function(value) {
        return this._set('pos', value || 0);
    },
    getPosition : function(value) {
        return this._get('pos');
    },
    setPositionAndLength : function(pos, len) {
        return this._setAll({
            'pos' : pos,
            'len' : len
        });
    }

});
