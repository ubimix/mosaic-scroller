var _ = require('underscore');
var React = require('react');
var Scroller = require('./Scroller');

module.exports = React.createClass({
    getInitialState : function() {
        this.manager = new Scroller(this.props);
        this.manager.on('updated', this._onUpdate, this);
        return this._newState();
    },
    componentDidMount : function(nextProps) {
        this._updateScrollPos();
    },
    componentDidUpdate : function(nextProps) {
        this._updateScrollPos();
    },
    render : function() {
        var scroll = this.manager.scroll;
        var list = this.manager.list;
        var scrollPos = scroll.getPosition();
        var scrollLen = scroll.getLength();
        var listPos = list.getPosition();
        var listLen = list.getLength();

        var items = this._renderItems();
        var placeholder = this.manager.placeholder;
        var style = _.extend({}, this.props.style, {
            overflowY : 'auto',
            overflowX : 'hidden'
        });
        return React.DOM.div({
            id : this.props.id,
            className : this.props.className,
            style : style,
            onScroll : this._onScroll
        }, React.DOM.div({
            style : {
                position : 'relative',
                height : placeholder.getLength() + 'px'
            }
        }, React.DOM.div({
            style : {
                position : 'absolute',
                height : list.getLength() + 'px',
                top : list.getPosition() + 'px',
                left : '0px',
                right : '0px',
                bottom : 'auto'
            }
        }, items)));
    },
    _onUpdate : function() {
        this.setState(this._newState());
    },
    _newState : function(options) {
        return _.extend({}, this.state, options);
    },
    _renderItems : function() {
        var list = this.manager.list;
        var items = list.getItems();
        return this.props.renderItems({
            items : items,
            index : list.getStartIndex(),
            position : list.getPosition(),
            length : list.getLength()
        });
    },
    /** This handler is called when the scroller changes its position. */
    _onScroll : function(event) {
        var container = this.getDOMNode();
        var scrollPos = container.scrollTop;
        var height = container.offsetHeight;
        this.manager.setScroll(scrollPos, height);
    },
    _updateScrollPos : function() {
        var container = this.getDOMNode();
        var height = container.offsetHeight;
        var index = this.props.index || 0;
        this.manager.focusItem(index, height);
    },

});
