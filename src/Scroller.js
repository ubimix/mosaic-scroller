var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var Range = require('./Range');
var ItemsList = require('./ItemsList');

module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {
    initialize : function(options) {
        this.setOptions(options);
        this.list = new ItemsList(options);
        this.scroll = new Range(options);
        this.placeholder = new Range(options);
    },

    getLength : function() {
        return this.placeholder.getLength();
    },

    setScroll : function(scrollPos, scrollLen) {
        var that = this;
        return that._handle(function(len) {
            var fullScrollerLen = that._getFullScrollerLen(len);
            var progress = scrollPos / fullScrollerLen;
            progress = Math.max(0.0, Math.min(1.0, progress));
            return that._updateScrollPosition(len, progress, scrollLen);
        });
    },

    focusItem : function(index, scrollLen) {
        var that = this;
        return that._handle(function(len) {
            index = index || 0;
            var progress = len ? index / len : 0;
            progress = Math.max(0.0, Math.min(1.0, progress));
            return that._updateScrollPosition(len, progress, scrollLen);
        });
    },

    _updateScrollPosition : function(len, progress, scrollLen) {
        var that = this;
        var listProgress = 0;
        var listIndex = 0;
        var fullScrollerLen = that._getFullScrollerLen(len);
        var scrollPos = Math.round(fullScrollerLen * progress);
        return Mosaic.P.then(function() {
            that.placeholder.setLength(fullScrollerLen + scrollLen);
            that.scroll.setPositionAndLength(scrollPos, scrollLen);

            var itemId = Math.floor(progress * len);
            itemId = Math.max(0, Math.min(len - 1, itemId));

            var blockSize = that._getBlockSize(len);
            var startIdx = Math.floor(itemId / blockSize) * blockSize;

            var itemLen = that._getAverageItemLength();
            var endIdx = Math.ceil((itemId + scrollLen / itemLen) / //
            blockSize) * blockSize;

            listIndex = startIdx;
            var listSize = endIdx - startIdx;
            listProgress = (progress * len - startIdx) / listSize;
            return that._loadItems(listIndex, listSize);
        }).then(function(items) {
            var listLength = 0;
            _.each(items, function(item) {
                listLength += item.getLength();
            });
            var updated;
            if (listIndex == 0 && items.length >= len && //
            listLength < scrollLen) {
                that.placeholder.setLength(scrollLen);
                that.scroll.setPositionAndLength(0, scrollLen);
                updated = that.list.setItems(0, 0, items);
            } else {
                var listShift = listProgress * listLength;
                var listPos = Math.round(scrollPos - listShift);
                updated = that.list.setItems(listPos, listIndex, items);
            }
            if (updated) {
                that.fire('updated');
            }
        });
    },

    _getFullScrollerLen : function(len) {
        var size = 0;
        if (len > 0) {
            var n = Math.ceil(Math.log(len) / Math.log(10));
            var itemLen = this._getAverageItemLength();
            size = itemLen * Math.pow(10, n);
        }
        return size;
    },

    /**
     * Returns a block size - a minimal number of items to load at once.
     */
    _getBlockSize : function(len) {
        return this.options.blockSize || 5;
    },

    /**
     * Returns an average item length. This length is used to estimate the
     * number of items to load.
     */
    _getAverageItemLength : function() {
        return this._itemLen || this.options.itemLen || 10;
    },

    /**
     * Sets a new average item length. This length is used to estimate the
     * number of items to load.
     */
    _setAverageItemLength : function(len) {
        this._itemLen = len || 10;
    },

    _handle : function(action) {
        var that = this;
        return Mosaic.P.then(function() {
            if (that._handling) {
                return;
            }
            that._handling = true;
            return that._load('__loadlength', function() {
                var len = that.options.getItemsNumber;
                if (_.isFunction(len)) {
                    len = len();
                }
                return len;
            }).then(action).then(function(result) {
                that._handling = false;
                return result;
            }, function(err) {
                that._handling = false;
                throw err;
            });
        });
    },

    /**
     * Loads items using the "load" method specified in the class options and
     * returns a promise with results.
     */
    _loadItems : function(idx, len) {
        return this._load('__loadItems', function() {
            return this.options.loadItems({
                index : idx,
                length : len
            });
        });
    },

    _load : function(key, action) {
        var that = this;
        if (that[key]) {
            that[key].reject('Interrupted');
        }
        var deferred = that[key] = Mosaic.P.defer();
        Mosaic.P.then(function() {
            return action.apply(that);
        }).then(deferred.resolve, deferred.reject);
        return deferred.promise.then(function(result) {
            delete that[key];
            return result;
        }, function(err) {
            delete that[key];
            throw err;
        });
    },

});
