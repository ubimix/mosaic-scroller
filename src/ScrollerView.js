var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var ScrollBarTracker = require('./ScrollBarTracker');
var ScrollerBlock = require('./ScrollerBlock');
var Scroller = require('./Scroller');

var ResizeMixin = {
    addResizeListener : function(listener) {
        if (window.attachEvent) {
            window.attachEvent('onresize', listener);
        } else if (window.addEventListener) {
            window.addEventListener('resize', listener, true);
        }
    },
    removeResizeListener : function(listener) {
        if (window.detachEvent) {
            window.detachEvent('onresize', listener);
        } else if (window.removeEventListener) {
            window.removeEventListener('resize', listener, true);
        }
    }

};

module.exports = React.createClass({
    mixins : [ ResizeMixin ],

    componentWillMount : function() {
        var that = this;
        that._renderParams = {
            index : 0,
            length : 0,
            items : []
        };
        this._updatePosition = true;
        that.addResizeListener(that._onResize);
        that._tracker = new ScrollBarTracker();
        that._scroller = new Scroller(_.extend({
            itemLen : 10,
            blockSize : 10,
            scrollerLen : function() {
                if (!that.isMounted())
                    return 10;
                var container = that.getDOMNode();
                var scrollerLen = container.offsetHeight;
                return scrollerLen;
            },
        }, that.props, {
            itemsNumber : function() {
                return that.props.getItemsNumber();
            },
            loadItems : function(params) {
                return that._startItemsRendering(params);
            }
        }));
        that._scroller.addChangeListener(function() {
            if (!that.isMounted())
                return;
            var itemsElm = that.refs.items.getDOMNode();
            var blockShift = that._scroller.getBlockShift();
            itemsElm.style.marginTop = blockShift + 'px';
        });
        that._tracker.addChangeListener(function(ev) {
            if (!that.isMounted())
                return;
            var scrollerElm = that.refs.scroller.getDOMNode();
            if (ev.position != scrollerElm.scrollTop) {
                scrollerElm.scrollTop = ev.position;
            }
            var itemsElm = that.refs.items.getDOMNode();
            itemsElm.style.top = ev.position + 'px';
            that._scroller.setDelta(-ev.delta);
        }, that);
    },
    componentWillUnmount : function() {
        this.removeResizeListener(this._onResize);
    },
    componentDidMount : function() {
        var that = this;
        that._scroller.setDelta(0);
        setTimeout(function() {
            that._updateScroller();
        }, 1);
    },
    componentWillReceiveProps : function(props) {
        this._updatePosition = true;
    },
    componentDidUpdate : function() {
        if (this._updatePosition) {
            this._updatePosition = false;
            this._scroller.focusItem(this.props.index || 0);
        }
        this._finishItemsRendering();
    },
    _onResize : function() {
        this._updateScroller();
        this._scroller.setDelta(0);
    },
    _onScroll : function() {
        this._updateScroller();
    },
    getInitialState : function() {
        return {};
    },
    _updateScroller : function() {
        var container = this.getDOMNode();
        var scroller = this.refs.scroller.getDOMNode();
        this._tracker.setPosition(scroller.scrollTop);
        scroller.style.height = container.offsetHeight + 'px';
        var placeholderLen = this._tracker.getLength();
        var placeholder = this.refs.placeholder.getDOMNode();
        placeholder.style.height = placeholderLen + 'px';
    },
    _startItemsRendering : function(params) {
        var that = this;
        that._renderParams = _.extend(that._renderParams, params);
        return Mosaic.P.then(function() {
            return that.props.renderItems(that._renderParams);
        }).then(function(items) {
            that._renderParams.items = items;
            if (!that._deferredRendering) {
                that._deferredRendering = Mosaic.P.defer();
                that._deferredRendering.promise.then(function() {
                    delete that._deferredRendering;
                })
                that._updateState();
            }
            return that._deferredRendering.promise;
        });
    },
    _updateState : function() {
        this.setState({});
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
    _finishItemsRendering : function() {
        var that = this;

        var container = that.getDOMNode();
        var scrollerWidth = that._getScrollerWidth();
        var scroller = that.refs.scroller.getDOMNode();
        scroller.style.height = container.offsetHeight + 'px';
        scroller.style.marginRight = '-' + scrollerWidth + 'px';

        if (!that._deferredRendering)
            return;

        var itemsElm = that.refs.items.getDOMNode();
        var children = itemsElm.childNodes;
        var block = new ScrollerBlock({
            getIndex : function() {
                return that._renderParams.index;
            },
            getSize : function() {
                return children.length;
            },
            getItemLength : function(index) {
                var len = children.length;
                if (index < 0 || index >= len)
                    return 0;
                var elm = children[index];
                return elm.offsetHeight;
            }
        });
        that._deferredRendering.resolve(block);
        that._updateScrollbarPosition();

    },
    _updateScrollbarPosition : function() {
        var that = this;
        var itemsNumber = that._scroller.getItemsNumber();
        var index = that._scroller.getFirstItemIndex();
        var progress = itemsNumber ? (index / itemsNumber) : 0;
        var scrollbar = that.refs.scrollbar.getDOMNode();
        var slider = that.refs.slider.getDOMNode();
        var sliderHeight = slider.offsetHeight;
        var scrollbarHeight = scrollbar.offsetHeight;
        var position = Math.round((scrollbarHeight - sliderHeight) * progress);
        slider.style.top = position + 'px';
    },
    render : function() {
        var that = this;
        var items = that._renderParams.items;
        var style = _.extend({}, that.props.style, {
            overflow : 'hidden'
        });
        var placeholderLen = that._tracker.getLength();
        return React.DOM.div({
            id : that.props.id,
            className : that.props.className,
            style : style,
            onScroll : that._onScroll
        }, React.DOM.div({
            key : 'wrapper',
            className : 'wrapper',
            style : {
                position : 'absolute',
                top : 0,
                bottom : 0,
                left : 0,
                right : 0,
                margin : 0,
                padding : 0
            }
        }, React.DOM.div({
            key : 'scroller',
            ref : 'scroller',
            style : {
                overflowY : 'scroll',
                overflowX : 'hidden',
                position : 'relative',
                margin : 0,
                padding : 0
            }
        }, React.DOM.div({
            key : 'placeholder',
            ref : 'placeholder',
            style : {
                position : 'relative',
                height : placeholderLen + 'px',
                overflow : 'hidden',
                paddingRight : '3px',
                margin : 0,
                padding : 0
            }
        }, React.DOM.div({
            ref : 'items',
            style : {
                position : 'absolute',
                left : '0px',
                right : '0px',
                top : '0px',
                bottom : 'auto',
                margin : 0,
                padding : 0
            }
        }, items))), React.DOM.div({
            key : 'scrollbar',
            ref : 'scrollbar',
            className : 'scrollbar',
            style : {
                position : 'absolute',
                top : 0,
                bottom : 0,
                right : 0,
                margin : 0,
                padding : 0,
                maxWidth : '10px'
            }
        }, React.DOM.div({
            key : 'slider',
            ref : 'slider',
            className : 'slider',
            style : {
                position : 'absolute',
                top : 0,
                bottom : 0,
                right : 0,
                margin : '3px',
                padding : 0,
                minHeight : '10px',
                minWidth : '3px'
            }
        }))));
    },

});
