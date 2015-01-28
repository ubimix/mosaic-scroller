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
            items : function(params) {
                console.log('* load items');
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
        console.log('componentDidMount');
        var that = this;
        that._scroller.setDelta(0);
        setTimeout(function() {
            that._updateScroller();
        }, 1);
    },
    componentWillReceiveProps : function(props) {
        console.log('componentWillReceiveProps');
        this._updatePosition = true;
    },
    componentDidUpdate : function() {
        console.log('componentDidUpdate');
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
        return this._newState();
    },
    _newState : function() {
        var result = _.extend({
            index : 0,
            length : 0,
            items : [],
        }, this.state);
        _.each(arguments, function(options) {
            result = _.extend(result, options);
        });
        return result;
    },
    _updateScroller : function() {
        console.log('_updateScroller');
        var container = this.getDOMNode();
        var scroller = this.refs.scroller.getDOMNode();
        this._tracker.setPosition(scroller.scrollTop);
        scroller.style.height = container.offsetHeight + 'px';
        var placeholderLen = this._tracker.getLength();
        var placeholder = this.refs.placeholder.getDOMNode();
        placeholder.style.height = placeholderLen + 'px';
    },
    _startItemsRendering : function(params) {
        console.log('_startItemsRendering');
        var that = this;
        params = _.extend({}, that.state, params);
        return Mosaic.P.then(function() {
            return that.props.renderItems(params);
        }).then(function(items) {
            var deferred = Mosaic.P.defer();
            that._itemsRenderingDeferred = deferred;
            that.setState(that._newState(params, {
                items : items
            }));
            return deferred.promise;
        });
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
        console.log('_finishItemsRendering');

        var container = that.getDOMNode();
        var scrollerWidth = that._getScrollerWidth();
        var scroller = that.refs.scroller.getDOMNode();
        scroller.style.height = container.offsetHeight + 'px';
        scroller.style.marginRight = '-' + scrollerWidth + 'px';

        var deferred = that._itemsRenderingDeferred;
        if (!deferred)
            return;
        delete that._itemsRenderingDeferred;

        var state = that.state;
        var items = state.items;
        var itemsElm = that.refs.items.getDOMNode();
        var children = itemsElm.childNodes;
        var block = new ScrollerBlock({
            getIndex : function() {
                return state.index;
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
        deferred.resolve(block);
    },
    render : function() {
        var that = this;
        var items = that.state.items || [];
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
                height : placeholderLen + 'px',
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
        }, items))));
    },

});
