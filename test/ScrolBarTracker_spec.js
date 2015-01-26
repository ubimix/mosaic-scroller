var expect = require('expect.js');
var ScrollBarTracker = require('../src/ScrollBarTracker');
var _ = require('underscore');

describe('ScrollBarTracker', function() {
    var tracker;
    var position = -1;
    var delta = 0;
    beforeEach(function() {
        tracker = new ScrollBarTracker({
            length : 2000,
            threshold : 10
        });
        tracker.addChangeListener(function(ev) {
            position = ev.position;
            delta = ev.delta;
        });
    });
    it('should be properly initialized', function() {
        expect(tracker.getPosition()).to.eql(-1);
        expect(tracker.getLength()).to.eql(2000);
        expect(tracker.getDelta()).to.eql(0);
    });
    it('should update scroller position', function() {
        // Position is in the range of [threshold..length-threshold] 
        tracker.setPosition(800);
        expect(position).to.eql(800);
        expect(tracker.getPosition()).to.eql(800);

        tracker.setPosition(100);
        expect(position).to.eql(100);
        expect(tracker.getPosition()).to.eql(100);
        
        tracker.setPosition(10);
        expect(position).to.eql(10);
        expect(tracker.getPosition()).to.eql(10);

        tracker.setPosition(2000 - 10);
        expect(position).to.eql(2000 - 10);
        expect(tracker.getPosition()).to.eql(2000 - 10);
        
        // Position is less than the threshold - move to the middle
        tracker.setPosition(0);
        expect(position).to.eql(1000);
        expect(tracker.getPosition()).to.eql(1000);

        tracker.setPosition(8);
        expect(position).to.eql(1000);
        expect(tracker.getPosition()).to.eql(1000);

        tracker.setPosition(-5);
        expect(position).to.eql(1000);
        expect(tracker.getPosition()).to.eql(1000);

        // Distance from the position and the end is less than the threshold -
        // move to the middle
        tracker.setPosition(2000);
        expect(position).to.eql(1000);
        expect(tracker.getPosition()).to.eql(1000);

        tracker.setPosition(2000 - 5);
        expect(position).to.eql(1000);
        expect(tracker.getPosition()).to.eql(1000);

        tracker.setPosition(2000 + 5);
        expect(position).to.eql(1000);
        expect(tracker.getPosition()).to.eql(1000);
    });

    it('should update delta', function() {
        tracker.setPosition(0);
        expect(position).to.eql(1000);
        expect(delta).to.eql(0);
        expect(tracker.getPosition()).to.eql(1000);
        expect(tracker.getDelta()).to.eql(0);

        tracker.setPosition(1000 + 30);
        expect(delta).to.eql(30);
        expect(tracker.getDelta()).to.eql(30);

        tracker.setPosition(1000 - 30);
        expect(delta).to.eql(-60);
        expect(tracker.getDelta()).to.eql(-60);

        tracker.setPosition(1000 - 30);
        expect(delta).to.eql(0); // Last notified delta
        expect(tracker.getDelta()).to.eql(0); // Last updated delta

    });

});
