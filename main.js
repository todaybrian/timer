function msToTime(ms) {
    var z = n => n >= 100 ? n : ('0' + n).slice(-2);
    var d = Math.floor((ms /= 100) % 10);
    var s = Math.floor((ms /= 10) % 60);
    var m = Math.floor((ms /= 60) % 60);
    var h = Math.floor(ms / 60);
    return `${z(h)}:${z(m)}:${z(s)}.${d}`;
}

class Timer {
    constructor() {
        this.startTime = 0;
        this.timeElapsed = 0;
        this.paused = true;
        this.editing = false;
        this.editingPos = 0;
        this.digits = 0;
    }
    toggle() {
        if (this.editing) return;

        if (this.paused)
            this.startTime = Date.now() - this.timeElapsed;
        else
            this.timeElapsed = Date.now() - this.startTime;

        this.paused = !this.paused;
    }
    reset() {
        this.setTime(0);
        if (!this.paused)
            this.toggle();
    }
    getTime() {
        if (this.paused)
            return this.timeElapsed;

        return Date.now() - this.startTime;
    }
    addTime(ms) {
        this.startTime -= ms;
        this.timeElapsed += ms;
    }
    setTime(ms) {
        this.startTime = Date.now() - ms;
        this.timeElapsed = ms;
    }
    toggleEditing() {
        if (!this.paused) this.toggle();
        this.editingPos = 0;
        this.editing = !this.editing;
        this.digits = Math.max(this.getDigitsAmount(), 7);
    }
    setEditingPosR(idx) {
        if (!this.editing) return;
        this.editingPos = this.digits - idx;
    }
    advanceEditingPos(d) {
        if (!this.editing) return;
        this.editingPos = (this.editingPos + d + this.digits) % this.digits;
    }
    changeEditPosDigit(digit) {
        if (!this.editing) return;
        this.changeDigit(this.editingPos+1, digit);
        this.advanceEditingPos(1);
    }
    changeDigit(idx, digit) {
        var steps = [100, 10, 10, 6, 10, 6, 10],
            amt = Math.max(this.getDigitsAmount(), 7) - idx,
            p = 1;

        for (var i = 0; i <= amt; ++i)
            p *= steps[Math.min(i, steps.length-1)];

        this.addTime((digit - this.getDigit(idx)) * p);
    }
    getDigit(idx) {
        var steps = [100, 10, 10, 6, 10, 6, 10],
            amt = Math.max(this.getDigitsAmount(), 7) - idx,
            t = this.getTime();

        for (var i = 0; i <= amt; ++i)
            t /= steps[Math.min(i, steps.length-1)];

        return Math.floor(t % steps[Math.min(idx, steps.length-1)]);
    }
    getDigitsAmount() {
        var steps = [100, 10, 10, 6, 10, 6, 10],
            t = this.getTime(),
            cnt = 0;

        while ((t /= steps[Math.min(cnt, steps.length-1)]) >= 1)
            ++cnt;

        return cnt;
    }
}

var timerElem = document.getElementById("timer"),
    timer = new Timer();

function copyTime() {
    var c = document.getElementById("clipboard");
    c.value = msToTime(timer.getTime());
    c.select();
    document.execCommand("copy");
}

const CONTROLS = {
    'r': () => timer.reset(),
    ' ': () => timer.toggle(),
    'y': () => copyTime(),
    'e': () => timer.toggleEditing(),
    'j': () => timer.advanceEditingPos(-1),
    'l': () => timer.advanceEditingPos(1),
    'ArrowLeft': () => timer.advanceEditingPos(-1),
    'ArrowRight': () => timer.advanceEditingPos(1),
    '0': () => timer.changeEditPosDigit(0),
    '1': () => timer.changeEditPosDigit(1),
    '2': () => timer.changeEditPosDigit(2),
    '3': () => timer.changeEditPosDigit(3),
    '4': () => timer.changeEditPosDigit(4),
    '5': () => timer.changeEditPosDigit(5),
    '6': () => timer.changeEditPosDigit(6),
    '7': () => timer.changeEditPosDigit(7),
    '8': () => timer.changeEditPosDigit(8),
    '9': () => timer.changeEditPosDigit(9),
    'h': () => timer.setEditingPosR(7),
    'm': () => timer.setEditingPosR(5),
    's': () => timer.setEditingPosR(3),
    'd': () => timer.setEditingPosR(1)
};

var keys = {};

document.addEventListener("keydown", e => {
    if (keys[e.keyCode]) return;
    keys[e.keyCode] = true;
    console.log(e.key);
    if (CONTROLS.hasOwnProperty(e.key)) {
        CONTROLS[e.key]();
    }
});

document.addEventListener("keyup", e => {
    keys[e.keyCode] = false;
});

setInterval(() => {
    var t = msToTime(timer.getTime());
    if (timer.editing) {
        var idx = timer.editingPos + Math.floor((timer.editingPos+7-timer.digits)/2);
        console.log(idx);
        timerElem.innerHTML = t.slice(0, idx) + '<span class="highlighted">' + t[idx] + '</span>' + t.slice(idx+1);
    } else {
        timerElem.innerHTML = t;
    }
    document.title = t.slice(0, -2);
}, 20);
