import Visual from "./visual.js"


(function() {
    this.setup();
    this.animate(0, 0);
}).bind({
    setup : function() {
        this.main = new Visual();
    },

    update : function(t, dt) {
        this.main.update(t, dt);
    },

    animate : function(oldt, nowt) {
        this.update(nowt, (nowt - oldt) * 0.001);
        requestAnimationFrame(this.animate.bind(this, nowt));
    }
})();