var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');

module.exports = React.createClass({
    componentWillMount : function() {
        this._resetFields(this.props);
    },
    componentDidMount : function() {
        this._updatePositions();
        this._checkItemList();
    },
    componentWillReceiveProps : function(props) {
        this._resetFields(props);
    },
    componentDidUpdate : function() {
        this._updatePositions();
        this._checkItemList();
    },
    _resetFields : function(props) {
        this.items = [];
        var blockSize = this._getBlockSize();
        var index = props.index || 0;
        this._firstIndex = Math.max(0, Math.floor(index / blockSize))
                * blockSize;
        this._itemShiftIndex = index % blockSize;
        this._itemShift = 0;
    },
    _onScroll : function() {
        this._updatePositions();
        this._checkItemList();
    },
    _getScrollerWidth : function() {
        if (this._scrollerWidth === undefined) {
            var scroller = this.refs.scroller.getDOMNode();
            var placeholder = this.refs.placeholder.getDOMNode();
            scroller.style.overflowY = 'scroller';
            var first = scroller.clientWidth;
            var second = scroller.offsetWidth;
            this._scrollerWidth = (second - first) || 0;
        }
        return this._scrollerWidth;
    },
    _updatePositions : function() {
        var that = this;
        var container = that.getDOMNode();
        var scrollHeight = container.offsetHeight;
        var scrollerWidth = that._getScrollerWidth();

        var scroller = that.refs.scroller.getDOMNode();
        var placeholder = that.refs.placeholder.getDOMNode();

        // Update scroller parameters - its size and the size of the
        // content (size of the placeholder).
        var scrollPos = scroller.scrollTop;
        var initialScrollPos = scrollPos;
        scroller.style.height = scrollHeight + 'px';
        scroller.style.marginRight = '-' + scrollerWidth + 'px';
        // placeholder.style.marginRight = scrollerWidth + 'px';

        var prevScrollPos = that._scrollPos || 0;

        var reload = that._itemShift === undefined;

        // Update placeholder length and scroller position
        var placeholderLength = that._getPlaceholderLength();
        if (scrollPos == 0 || //
        scrollPos == placeholderLength - scrollHeight) {
            reload = true;
            scrollPos = placeholderLength / 2;
            scroller.scrollTop = scrollPos;
        }
        placeholder.style.height = placeholderLength + 'px';
        that._scrollPos = scrollPos;

        // Update block position
        var position = that._blockPosition || 0;
        position += scrollPos - prevScrollPos;
        that._blockPosition = position;

        // Update content shift in the block
        if (reload) {
            that._itemShift = 0;
        } else {
            that._itemShift -= initialScrollPos - prevScrollPos;
        }

        // Take into account the length of items loaded before
        // the first visible element
        var items = that._getItems();
        var itemShiftIndex = that._itemShiftIndex || 0;
        var firstIndex = that._firstIndex || 0;
        var n = Math
                .max(0, Math.min(itemShiftIndex - firstIndex, items.length));
        var itemsElm = that.refs.items.getDOMNode();
        var children = itemsElm.childNodes;
        n = Math.min(n, children.length);
        var firstVisibleIdx;
        var fullLen = 0;
        for (var i = 0; i < n; i++) {
            var elm = children[i];
            var len = that._getElementLength(elm);
            that._itemShiftIndex--;
            that._itemShift -= len;
            if (firstVisibleIdx === undefined && fullLen >= -that._itemShift) {
                firstVisibleIdx = firstIndex + i;
            }
            fullLen += len;
        }
        for (; i < Math.min(children.length, items.length); i++) {
            var elm = children[i];
            var len = that._getElementLength(elm);
            if (firstVisibleIdx === undefined && fullLen >= -that._itemShift) {
                firstVisibleIdx = firstIndex + i;
            }
            fullLen += len;
        }
        if (firstIndex === 0) {
            that._itemShift = Math.min(0, that._itemShift);
        }

        if (firstIndex + items.length === that._totalItemsNumber) {
            var blockShift = scrollHeight - fullLen;
            blockShift = Math.min(0, blockShift);
            that._itemShift = Math.max(blockShift, that._itemShift);
        }
//        console.log('firstVisibleIdx=' + firstVisibleIdx, 'that._itemShift='
//                + that._itemShift, 'that._itemShiftIndex='
//                + that._itemShiftIndex);

        // ------------------------------------------

        // Change styles of the element containing the block
        var itemsElm = this.refs.items.getDOMNode();
        itemsElm.style.top = this._blockPosition + 'px';
        itemsElm.style.marginTop = this._itemShift + 'px';

        // Update the slider
        var scrollBar = this.refs.scrollbar.getDOMNode();
        if (that._totalItemsNumber) {
            var sliderElm = this.refs.slider.getDOMNode();
            var progress = 1.0 * firstVisibleIdx / that._totalItemsNumber;
            var sliderHeight = sliderElm.offsetHeight;
            var progressPx = Math.round((scrollHeight - sliderHeight)
                    * progress);
            sliderElm.style.top = progressPx + 'px';
            scrollBar.style.display = 'block';
        } else {
            scrollBar.style.display = 'none';
        }
    },

    _checkItemList : function() {
        var that = this;
        var scrollerElm = that.refs.scroller.getDOMNode();
        var scrollerLen = that._getElementLength(scrollerElm);
        var items = that._getItems();

        var firstIndex = that._firstIndex || 0;
        var lastIndex = firstIndex + items.length;
        var itemsLength = 0;
        var shift = that._itemShift;
        var itemsElm = that.refs.items.getDOMNode();
        var children = itemsElm.childNodes;
        var childPos = 0;
        var childNumber = Math.min(children.length, items.length)
        for (var i = 0; i < childNumber; i++) {
            var child = children[i];
            var len = that._getElementLength(child);
            childPos += len;
            if (that._itemShift + childPos <= 0) {
                firstIndex++;
                shift = that._itemShift + childPos;
            }
            if (that._itemShift + childPos > scrollerLen) {
                lastIndex--;
            }
        }

        var firstVisibleIndex = firstIndex;
        var itemLen = that._getAverageItemLength();
        firstIndex -= Math.max(0, Math.ceil(shift / itemLen));
        lastIndex += Math.max(0, Math.ceil((scrollerLen - itemsLength - shift)
                / itemLen));

        that._itemShiftIndex = firstVisibleIndex;
        that._itemShift = shift;

        console.log('firstIndex=' + firstIndex, 'lastIndex=' + lastIndex);
        that._reloadItems(firstIndex, lastIndex).then(function(updated) {
            if (updated) {
                that.setState({});
            }
        });
    },
    _reloadItems : function(firstIndex, lastIndex) {
        var that = this;
        var blockSize = that._getBlockSize();
        firstIndex = Math.max(0, Math.floor(firstIndex / blockSize))
                * blockSize;
        lastIndex = Math.max(0, Math.ceil(lastIndex / blockSize)) * blockSize;
        if (that._totalItemsNumber !== undefined) {
            lastIndex = Math.min(lastIndex, that._totalItemsNumber);
        }
        var items = that._getItems();
        if (that._firstIndex != firstIndex || //
        firstIndex + items.length != lastIndex) {
            return Mosaic.P.then(function() {
                return that.props.getItemsNumber();
            }).then(function(num) {
                that._totalItemsNumber = num;
                num = Math.min(num, lastIndex) - firstIndex;
                return that.props.renderItems({
                    index : firstIndex,
                    length : num
                });
            }).then(function(items) {
                that._firstIndex = firstIndex;
                that._items = items;
                return true;
            });
        } else {
            return Mosaic.P.then(function() {
                return false;
            });
        }
    },
    _getPlaceholderLength : function() {
        return 1000000;
    },
    _getItems : function() {
        return this._items || [];
    },
    _getAverageItemLength : function() {
        return this.props.itemLen || 10;
    },
    _getBlockSize : function() {
        return this.props.blockSize || 10;
    },
    render : function() {
        var that = this;
        var items = that._getItems();
        var style = _.extend({}, that.props.style, {
            overflow : 'hidden'
        });
        return React.DOM.div({
            id : that.props.id,
            className : that.props.className,
            style : style,
            onScroll : that._onScroll
        }, React.DOM.div({
            ref : 'scroller',
            style : {
                overflowY : 'scroll',
                overflowX : 'hidden',
                position : 'relative'
            }
        }, React.DOM.div({
            ref : 'placeholder',
            style : {
                position : 'relative',
                height : '0px',
                overflow : 'hidden',
                paddingRight : '3px'
            }
        }, React.DOM.div({
            ref : 'items',
            style : {
                position : 'absolute',
                left : '0px',
                right : '0px',
                top : '0px',
                bottom : 'auto'
            }
        }, items))), React.DOM.div({
            ref : 'scrollbar',
            className : 'scrollbar',
            style : {
                position : 'absolute',
                top : '0px',
                right : '0px',
                bottom : '0px',
                left : 'auto',
                minWidth : '3px',
                backgroundColor : 'rgba(196,196,196,0.5)',
            }
        }, React.DOM.div({
            ref : 'slider',
            className : 'slider',
            style : {
                position : 'absolute',
                right : '0px',
                left : '0px',
                minHeight : '3px',
                backgroundColor : 'gray',
            }
        })));
    },
    _getElementLength : function(elm) {
        return elm.offsetHeight;
    },

});
