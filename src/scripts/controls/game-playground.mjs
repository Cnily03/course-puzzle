import { createElement, str, random, setDomData, getDomData, partEqual, getElemOffset } from "@js/utils.js"

export class GamePlayground {
    constructor(ctx) {
        this.root = null;
        this.playground = null;
        this.pause = null;
        this.loading = null;
        this.panel = null;
        this.size = {
            w: 0,
            h: 0
        };
        this.gameEnd = null;
        this.imgUrl = null;
        this.difficulty = {
            row: 0,
            col: 0,
        };
        this.draggableElems = [];
        this.draggingIndex = -1;
        this.overIndex = -1;
        this.totalSteps = 0;
        this.completeSteps = 0;
        this.gameFinished = null;
        // below only for touch events
        this.playgroundOffset = null;
        this.pieceSize = null;
        this.context = ctx;
    }

    // operations
    init(parent, size, panel, gameEnd) {
        let self = this;
        self.size = size;
        self.gameEnd = gameEnd;

        // initialize
        let root = createElement('div');
        let pause = createElement('div');
        let loading = createElement('div');
        let playground = createElement('div');

        playground.classList.add('playground');
        pause.classList.add('pause');
        root.classList.add('cpuzzle-game-playground');
        root.style.display = 'none';

        root.appendChild(playground);
        root.appendChild(pause);
        root.appendChild(loading);
        parent.appendChild(root);
        panel.init(root, {
            play: function () {
                pause.style.display = 'none';
            },
            pause: function () {
                pause.style.opacity = '.5';
                pause.style.display = 'block';
            },
            close: function () {
                let msg = '游戏尚未结束，是否继续退出？';
                if (self.totalSteps > self.completeSteps) {
                    if (!self.context.confirm(msg)) {
                        return;
                    }
                }
                self.gameEnd();
                // hide
                self.root.style.display = 'none';
                self.panel.close();
                // clean
                self.playground.innerHTML = '';
                self.draggableElems = [];
                self.draggingIndex = -1;
                self.overIndex = -1;
                pause.style.display = 'none';
            },
        });

        self.root = root;
        self.playground = playground;
        self.pause = pause;
        self.loading = loading;
        self.panel = panel;
    }

    serve(imgUrl, difficulty) {
        let self = this;

        self.imgUrl = imgUrl;
        self.difficulty = difficulty;
        self.totalSteps = difficulty.row * difficulty.col;
        self.completeSteps = 0;

        let img = new Image();
        img.onload = function () {
            self.loading.classList.remove('loading');

            let imgSize = {
                w: img.width,
                h: img.height,
            };
            let scaleSize = self._genImgPieces(imgSize);
            let panelLeft = (self.size.w - scaleSize.w) / 2 - self.panel.WIDTH;
            let locate = { left: panelLeft };
            let step = {
                total: self.totalSteps,
                complete: self.completeSteps,
            };
            self.panel.open(locate, step);

            self.gameFinished = function () {
                self.difficulty = {
                    row: 1,
                    col: 1,
                };
                self._genImgPieces(imgSize);
                self.pause.style.opacity = '0';
                self.pause.style.display = 'block';

                // clean dragging states
                self.draggingIndex = -1;
                self.overIndex = -1;
            };
        };
        img.src = imgUrl;

        self.loading.classList.add('loading');
        self.root.style.display = 'block';
    }

    // inner functions
    _genImgPieces(imgSize) {
        let self = this;
        let maxW = self.size.w;
        let maxH = self.size.h;
        let imgW = imgSize.w;
        let imgH = imgSize.h;
        let row = self.difficulty.row;
        let col = self.difficulty.col;
        let scaledSize = self._computeImgDisplaySize(imgW, imgH, maxW, maxH);
        let panelWidth = self.panel.WIDTH;
        let panelGap = (maxW - scaledSize.w) / 2;
        if (panelGap < panelWidth) {
            maxW -= (panelWidth - panelGap) * 2;
            scaledSize = self._computeImgDisplaySize(imgW, imgH, maxW, maxH);
        }

        let sw = scaledSize.w;
        let sh = scaledSize.h;
        let pw = sw / col; // piece size
        let ph = sh / row;

        // create wrappers & pieces
        let wrappers = [];
        let pieces = [];
        let position = null;
        let i, j;
        for (i = 0; i < row; i++) {
            for (j = 0; j < col; j++) {
                position = {
                    row: i,
                    col: j,
                };
                pieces.push(self._genPiece(position, sw, sh, pw, ph));
                wrappers.push(self._genWrapper(position));
            }
        }

        // set draggable elements
        self.draggableElems = wrappers;

        // change playground looks
        let playground = self.playground;
        let fragment = self._messPieces(wrappers, pieces);
        playground.style.width = sw + 'px';
        playground.style.height = sh + 'px';
        playground.innerHTML = '';
        playground.appendChild(fragment);

        return scaledSize;
    }

    _messPieces(wrappers, pieces) {
        let self = this;
        let fragment = document.createDocumentFragment();

        wrappers.forEach(function (w) {
            let i = random(0, pieces.length);
            let p = pieces[i];
            pieces.splice(i, 1); // remove it

            // make sure it position not equal
            let wp = getDomData(w, 'position');
            let pp = getDomData(p, 'position');
            if (partEqual(['row', 'col'], wp, pp)) {
                if (pieces.length > 0) {
                    // this one can not equal any more
                    i = random(0, pieces.length);
                    pieces.push(p);
                    p = pieces[i];
                    pieces.splice(i, 1);
                } else {
                    self.completeSteps++;
                }
            }

            w.appendChild(p);
            fragment.appendChild(w);
        });

        return fragment;
    }

    _computeImgDisplaySize(imgW, imgH, maxW, maxH) {
        let tanS = imgH / imgW;
        let tanD = maxH / maxW;
        let w, h;
        if (tanS > tanD) {
            h = imgH > maxH ? maxH : imgH;
            w = h / tanS;
        } else {
            w = imgW > maxW ? maxW : imgW;
            h = w * tanS;
        }
        return {
            w: w,
            h: h,
        };
    }

    _genWrapper(position) {
        let self = this;
        let handler = this.handler;
        let div = createElement('div');

        div.classList.add('piece-wrapper');
        div.setAttribute('draggable', 'true');
        setDomData(div, 'position', position);
        self._handleDragDropEvent(div); // for mouse device
        self._handleTouchEvent(div); // for touch device
        return div;
    }

    _handleDragDropEvent(wrapper) {
        let self = this;

        let handleDragStart = function (e) {
            self.draggingIndex = self.draggableElems.indexOf(this);

            this.style.opacity = '.9';
            this.style.transform = 'scale(.8, .8)';

            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData('text/html', this.innerHTML);
        };
        let handleDragOver = function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        };
        let handleDragEnter = function (e) {
            let draggingElem = self.draggableElems[self.draggingIndex];
            if (draggingElem !== this) {
                this.classList.add('drag-over');
                self.overIndex = self.draggableElems.indexOf(this);
            }
        };
        let handleDragLeave = function (e) {
            this.classList.remove('drag-over');
        };
        let handleDrop = function (e) {
            e.preventDefault();
            e.stopPropagation();

            let draggingElem = self.draggableElems[self.draggingIndex];
            if (draggingElem !== this) {
                draggingElem.innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');
                self._judgeProgress(draggingElem, this);
            }
        };
        let handleDragEnd = function (e) {
            if (self.overIndex > -1) {
                let lastOverElem = self.draggableElems[self.overIndex];
                lastOverElem.classList.remove('drag-over');
                self.overIndex = -1;
            }

            if (self.draggingIndex > -1) {
                let draggingElem = self.draggableElems[self.draggingIndex];
                draggingElem.style.opacity = '1';
                draggingElem.style.transform = 'none';
                self.draggingIndex = -1;
            }
        };

        wrapper.addEventListener('dragstart', handleDragStart, false);
        wrapper.addEventListener('dragover', handleDragOver, false);
        wrapper.addEventListener('dragenter', handleDragEnter, false);
        wrapper.addEventListener('dragleave', handleDragLeave, false);
        wrapper.addEventListener('drop', handleDrop, false);
        wrapper.addEventListener('dragend', handleDragEnd, false);
    }

    _handleTouchEvent(wrapper) {
        let self = this;

        let handleTouchStart = function (e) {
            this.style.opacity = '0.4';
            this.style.transform = 'scale(.8, .8)';

            self.draggingIndex = self.draggableElems.indexOf(this);
            self.overIndex = self.draggingIndex;

            if (!self.playgroundOffset) self.playgroundOffset = getElemOffset(this.parentNode);
            if (!self.pieceSize) self.pieceSize = getElemSize(this);
        };
        let handleTouchMove = function (e) {
            e.preventDefault();

            let touch = e.touches[0];
            let x = touch.pageX - self.playgroundOffset.left;
            let y = touch.pageY - self.playgroundOffset.top;
            let row = Math.floor(y / self.pieceSize.height);
            let col = Math.floor(x / self.pieceSize.width);
            let rowCnt = self.difficulty.row;
            let total = rowCnt * self.difficulty.col;
            let newOverIndex = row * rowCnt + col;
            if (newOverIndex >= total || newOverIndex < 0) newOverIndex = -1;

            if (newOverIndex != self.overIndex) {

                // drag enter
                if (newOverIndex > -1 && newOverIndex != self.draggingIndex) {
                    self.draggableElems[newOverIndex].classList.add('drag-over');
                }

                // drag leave
                if (self.overIndex > -1 && self.overIndex != self.draggingIndex) {
                    self.draggableElems[self.overIndex].classList.remove('drag-over');
                }

                self.overIndex = newOverIndex;
            }
        };
        let handleTouchEnd = function (e) {
            let dragElem = self.draggableElems[self.draggingIndex];
            dragElem.style.opacity = '1';
            dragElem.style.transform = 'none';

            // drop
            if (self.overIndex > -1 && self.overIndex != self.draggingIndex) {
                let target = self.draggableElems[self.overIndex];
                let tmp = dragElem.innerHTML;
                dragElem.innerHTML = target.innerHTML;
                target.innerHTML = tmp;
                target.classList.remove('drag-over');
                // update progress
                self._judgeProgress(dragElem, target);
            }
        };

        wrapper.addEventListener('touchstart', handleTouchStart, false);
        wrapper.addEventListener('touchmove', handleTouchMove, false);
        wrapper.addEventListener('touchend', handleTouchEnd, false);
    }

    _genPiece(position, sw, sh, pw, ph) {
        let sx = pw * position.col;
        let sy = ph * position.row;
        let div = createElement('div');
        div.classList.add('piece');
        div.style.width = str(pw, 'px');
        div.style.height = str(ph, 'px');
        div.style.backgroundImage = str('url(', this.imgUrl, ')');
        div.style.backgroundSize = str(sw, 'px ', sh, 'px');
        div.style.backgroundPosition = str('-', sx, 'px ', '-', sy, 'px');
        div.style.backgroundRepeat = 'no-repeat';
        setDomData(div, 'position', position);
        return div;
    }

    _judgeProgress(wa, wb) {
        let pa = wa.firstChild;
        let pb = wb.firstChild;
        let wap = getDomData(wa, 'position');
        let wbp = getDomData(wb, 'position');
        let pap = getDomData(pa, 'position');
        let pbp = getDomData(pb, 'position');

        let keys = ['row', 'col'];
        let aBefore = partEqual(keys, wap, pbp);
        let aAfter = partEqual(keys, wap, pap);
        let bBefore = partEqual(keys, wbp, pap);
        let bAfter = partEqual(keys, wbp, pbp);

        let change;
        let total = 0;
        if (aBefore !== aAfter) {
            change = aBefore ? -1 : 1;
            total += change;
        }
        if (bBefore !== bAfter) {
            change = bBefore ? -1 : 1;
            total += change;
        }
        if (0 !== total) {
            this.completeSteps += total;
            this._gameForward();
        }
    }

    _gameForward() {
        let self = this;
        let step = {
            total: self.totalSteps,
            complete: self.completeSteps,
        };
        self.panel.updateSteps(step);
        if (self.totalSteps === self.completeSteps) {
            self.gameFinished();
            self.panel.done();
        }
    }
};