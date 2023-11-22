import "@css/index.scss"

import { ImageSelector } from "./controls/image-selector.mjs"
import { LevelSelector } from "./controls/level-selector.mjs"
import { GamePanel } from "./controls/game-panel.mjs"
import { GamePlayground } from './controls/game-playground.mjs'

const imgSel = new ImageSelector(window);
const levelSel = new LevelSelector(window);
const gamePanel = new GamePanel(window);
const playground = new GamePlayground(window);

export class CPuzzle {
    constructor(el, width, height) {
        // initalize
        el.innerHTML = '';
        if (!width) width = el.clientHeight;
        if (!height) height = el.clientHeight;
        el.classList.add('cpuzzle');
        el.style.width = width + 'px';
        el.style.height = height + 'px';

        let levels = ['simple', 'middle', 'hard', 'custom'];
        let levelTranslater = {
            simple: '简单',
            middle: '中等',
            hard: '困难',
            custom: '自定义',
        };
        let levelMap = {
            simple: {
                row: 3,
                col: 3,
            },
            middle: {
                row: 5,
                col: 5,
            },
            hard: {
                row: 7,
                col: 7,
            }
        };
        let imgUrl = null;
        let size = {
            w: width,
            h: height
        };

        imgSel.init(el, function (imgSrc) {
            imgSel.close();
            levelSel.open();
            imgUrl = imgSrc;
        });
        levelSel.init(el, levels, levelMap, levelTranslater, function (level) {
            levelSel.close();
            playground.serve(imgUrl, level);
        });
        playground.init(el, size, gamePanel, function () {
            imgSel.open();
        });

        imgSel.open();
    }
}

window.CPuzzle = CPuzzle;