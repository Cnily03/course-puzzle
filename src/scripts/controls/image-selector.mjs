import { createElement } from "@js/utils.js"

export class ImageSelector {
    constructor(ctx) {
        this.root = null;
        this.catchImg = null;
        this.context = ctx;
    }

    // operations
    init(parent, catchImg) {
        let self = this;

        let div = createElement('div');
        let span = createElement('span');

        span.innerHTML = '点击或拖动图片到此处';
        div.classList.add('cpuzzle-img-selector');
        div.style.display = 'none';

        // events
        let handleDragOver = function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        };
        let handleDrop = function (e) {
            e.stopPropagation();
            e.preventDefault();

            let catchImg = self.catchImg;
            let files = e.dataTransfer.files;
            if (files.length > 0 && catchImg) {
                let url = self.context.URL.createObjectURL(files[0]);
                catchImg(url);
            }
        };
        let handleClick = function (e) {
            e.stopPropagation();
            e.preventDefault();

            let input = e.currentTarget.querySelector('input');
            input.click();
        };
        div.addEventListener('dragover', handleDragOver, false);
        div.addEventListener('drop', handleDrop, false);
        div.addEventListener('click', handleClick, false);

        div.appendChild(span);
        parent.appendChild(div);

        self.catchImg = catchImg;
        self.root = div;
    }
    open() {
        let self = this;

        // create new input
        let input = createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.style.display = 'none';

        // events
        let handleChange = function (e) {
            e.stopPropagation();
            e.preventDefault();

            let catchImg = self.catchImg;
            let files = e.target.files;
            if (files.length > 0 && catchImg) {
                let url = self.context.URL.createObjectURL(files[0]);
                catchImg(url);
            }
        }
        let handleClick = function (e) {
            e.stopPropagation();
        };
        input.addEventListener('change', handleChange, false);
        input.addEventListener('click', handleClick, false); // avoid dead loop with parent click

        // replace old input or add new input,
        // do this to avoid input change not trigger
        // when user choose same file
        let el = self.root;
        let oldInput = el.querySelector('input');
        if (oldInput) el.replaceChild(input, oldInput);
        else el.appendChild(input);

        // show imgSelector
        el.style.display = 'block';
    }
    close() {
        // hide imgSelector
        this.root.style.display = 'none';
    }
};