var _ = require('underscore');
var Mosaic = require('mosaic-commons');

module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {
    initialize : function(options) {
        this.setOptions(options);
        this._scrollPosition = 0;
        this._scrollLength = 0;
        this._placeholderLength = 0;
    },

    getPlaceholderLength : function() {
        return this._placeholderLength;
    },

    getScrollLength : function() {
        return this._scrollLength;
    },

    setScrollLength : function(len) {
        this._scrollLength = len || 1;
    },

    getScrollPosition : function() {
        return this._scrollPosition;
    },

    updateScrollPosition : function(scrollPos) {
        var that = this;
        return that._handle(function(len) {
            var fullScrollerLen = that._getFullScrollerLen(len);
            var progress = scrollPos / fullScrollerLen;
            progress = Math.max(0.0, Math.min(1.0, progress));
            return that._updateScrollPosition(len, progress, -1);
        });
    },

    scrollToItem : function(index) {
        var that = this;
        return that._handle(function(len) {
            index = index || 0;
            var progress = len ? index / len : 0;
            progress = Math.max(0.0, Math.min(1.0, progress));
            return that._updateScrollPosition(len, progress, index);
        });
    },

    _updateScrollPosition : function(len, progress, focused) {
        var that = this;
        var listProgress = 0;
        var listIndex = 0;
        var fullScrollerLen = that._getFullScrollerLen(len);
        var scrollPos = Math.round(fullScrollerLen * progress);
        var scrollLen = that.getScrollLength();
        return Mosaic.P.then(function() {
            that._placeholderLength = fullScrollerLen + scrollLen;
            that._scrollPosition = scrollPos;

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
            return that.options.renderItems({
                index : listIndex,
                length : listSize,
                focused : focused
            });
        }).then(function(info) {
            var listLength = info.length;
            var size = info.size;
            var itemsPosition = 0;
            if (listIndex == 0 && size >= len && listLength < scrollLen) {
                that._placeholderLength = scrollLen;
                that._scrollPosition = 0;
            } else {
                var listShift = info.shift;
                if (listShift === undefined || listShift < 0) {
                    listShift = listProgress * listLength;
                }
                itemsPosition = Math.round(scrollPos - listShift);
            }
            return that.options.updateItemsPosition({
                index : listIndex,
                position : itemsPosition
            });
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
        if (!that._handling) {
            that._handling = Mosaic.P.then(function() {
                var len = that.options.getItemsNumber;
                if (_.isFunction(len)) {
                    len = len();
                }
                return len;
            }).then(action).then(function(result) {
                delete that._handling;
                return result;
            }, function(err) {
                delete that._handling;
                throw err;
            });
        }
        return that._handling;
    },

});
