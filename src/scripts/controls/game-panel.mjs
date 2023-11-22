import { createElement, str, padStart } from "@js/utils.js"

export class Timer {
    constructor(ctx) {
        this.el = null;
        this.time = 0; // second
        this.timerId = null;
        this.state = ''; // play/pause
        this.context = ctx;
    }

    init(timerEl) {
        this.el = timerEl;
        this.time = 0;
    }

    play() {
        let self = this;
        let m = Math.floor(self.time / 60);
        let s = self.time % 60;
        self.el.innerHTML = str(padStart(m, 2, 0), ':', padStart(s, 2, 0));
        self.state = 'play';

        self.timerId = setTimeout(function () {
            if (self.state === 'pause') return;

            self.time++;
            self.play();
        }, 1000);
    }

    pause() {
        this.state = 'pause';
        if (this.timerId) clearTimeout(this.timerId);
    }
}

export class GamePanel {

    constructor(ctx) {
        // const
        this.WIDTH = 50;
        this.ITEMS_CNT = 4;// time/step/play&pause/close

        // inner attrs
        this.handler = {
            play: null,
            pause: null,
            close: null,
        }
        this.root = null;
        this.items = [];
        this.state = ''; // play/pause/done
        this.timer = new Timer();
    }

    // operations
    init(parent, handler) {
        let self = this;
        let cnt = self.ITEMS_CNT;
        let panelWidth = self.WIDTH; //px
        let panelHeight = cnt * panelWidth; // px

        let panel = createElement('ul');
        panel.classList.add('cpuzzle-game-panel');
        panel.style.display = 'none';
        panel.style.width = panelWidth + 'px';
        panel.style.height = panelHeight + 'px';

        let items = [], li, i;
        for (i = 0; i < cnt; i++) {
            li = createElement('li');
            li.style.height = panelWidth + 'px';
            panel.appendChild(li);
            items.push(li);
        }

        let playPauseEl = items[2];
        self.state = 'play';
        self._setIcon(playPauseEl, 'pause');
        playPauseEl.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.state === 'done') {
                return;
            }
            else if (self.state === 'play') {
                self.state = 'pause';
                self.timer.pause();
                self._setIcon(playPauseEl, 'play');
                if (self.handler && self.handler.pause) {
                    self.handler.pause();
                }
            } else {
                self.state = 'play';
                self.timer.play();
                self._setIcon(playPauseEl, 'pause');
                if (self.handler && self.handler.play) {
                    self.handler.play();
                }
            }
        }, false);

        let closeEl = items[3];
        self._setIcon(closeEl, 'close');
        closeEl.addEventListener('click', function (e) {
            e.stopPropagation();
            if (self.handler && self.handler.close) {
                self.handler.close();
            }
        }, false);

        self.root = panel;
        self.items = items;
        self.handler = handler;
        parent.appendChild(panel);
    }

    open(locate, step) {
        this.timer.init(this.items[0]);
        this.timer.play();
        this.updateSteps(step);
        this.state = 'play';
        this._setIcon(this.items[2], 'pause');

        this.root.style.left = locate.left + 'px';
        this.root.style.display = 'block';
    }

    close() {
        this.root.style.display = 'none';
        this.timer.pause();
    }

    done() {
        this.timer.pause();
        this.state = 'done';

        let playPauseEl = this.items[2];
        this._setIcon(playPauseEl, 'play');
        playPauseEl.style.cursor = 'not-allowed';

        // image cursor: pointer
        setTimeout(() => {
            window.alert(`恭喜你完成拼图，用时 ${this.timer.time} 秒`);
        }, 100);
    }

    updateSteps(step) {
        let stepEl = this.items[1];
        stepEl.innerHTML = str(step.complete, '/', step.total);
    }

    // inner functions
    _setIcon(el, icon) {
        el.setAttribute('title', icon);
        el.style.backgroundImage = str('url(icon/', icon, '.svg)');
        el.style.backgroundSize = '70%';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.cursor = 'pointer';
    }
}