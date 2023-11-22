import { createElement } from "@js/utils.js"

export class LevelSelector {
    constructor(ctx) {
        this.root = null;
        this.customInput = null;
        this.gameReady = null;
        this.context = ctx;
    }

    // operations
    init(parent, levels, levelMap,levelTranslater, gameReady) {
        let self = this;
        let div = createElement('div');
        let h3 = createElement('h2');
        let ul = createElement('ul');
        let customInput = self._genCustomInput();

        h3.innerHTML = '请选择难度';
        levels.forEach(function (item) {
            let li = createElement('li');
            li.innerHTML = levelTranslater[item];
            li.addEventListener('click', function (e) {
                e.stopPropagation();
                if (item === 'custom') {
                    self.customInput.style.display = 'block';
                    return;
                }

                if (gameReady) gameReady(levelMap[item]);
            }, false);
            ul.appendChild(li);
        });
        div.classList.add('cpuzzle-level-selector');
        div.style.display = 'none';

        div.appendChild(h3);
        div.appendChild(ul);
        div.appendChild(customInput);
        parent.appendChild(div);

        self.customInput = customInput;
        self.gameReady = gameReady;
        self.root = div;
    }

    open() {
        this.root.style.display = 'block';
        this.customInput.style.display = 'none';
    }

    close() {
        this.root.style.display = 'none';
    }

    // inner functions
    _genCustomInput() {
        let self = this;
        let root = createElement('ul');
        root.classList.add('custom-input');

        let genInputItem = function (name) {
            let li = createElement('li');

            let span = createElement('span');
            span.innerHTML = name;
            li.appendChild(span);

            let input = createElement('input');
            input.setAttribute('type', 'number');
            input.setAttribute('min', 2);
            input.setAttribute('max', 10);
            input.setAttribute('value', 4);
            li.appendChild(input);

            return {
                li: li,
                input: input
            };
        }

        let row = genInputItem('行');
        let col = genInputItem('列');

        let confirm = createElement('li');
        let button = createElement('button');
        button.innerHTML = 'OK';
        button.addEventListener('click', function (e) {
            e.stopPropagation();

            if (!self.gameReady) return;
            let level = {
                row: row.input.value,
                col: col.input.value,
            };
            self.gameReady(level);
        }, false);
        confirm.appendChild(button);

        root.appendChild(row.li);
        root.appendChild(col.li);
        root.appendChild(confirm);

        return root;
    }
}; 