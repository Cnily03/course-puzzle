export const createElement = document.createElement.bind(document);
export function str() {
    return [].slice.call(arguments, 0).join('');
}

// get one number form [start, end)
export function random(start, end) {
    let range = end - start - 1;
    return Math.round(Math.random() * range) + start;
}

export function setDomData(node, key, value) {
    let attrKey = 'data-' + key;
    let attrVal = JSON.stringify(value);
    node.setAttribute(attrKey, attrVal);
}

export function getDomData(node, key) {
    let attrKey = 'data-' + key;
    let val = node.getAttribute(attrKey);
    return JSON.parse(val);
}

export function partEqual(keys, objA, objB) {
    let i, key;
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        if (objA[key] !== objB[key]) return false;
    }
    return true;
}

export function padStart(str, targetLen, padStr) {
    str = str + '';
    let len = str.length;
    targetLen = parseInt(targetLen);
    if (len >= targetLen) return str;

    padStr = typeof padStr === 'number' ? padStr : (padStr || ' ');
    let rest = targetLen - len;
    let pad = padStr + '';
    while (pad.length < rest) {
        pad += padStr;
    }
    return pad.slice(0, rest) + str;
}

export function getElemOffset(el) {
    el = el.getBoundingClientRect();
    return {
        left: el.left + window.scrollX,
        top: el.top + window.scrollY
    }
}

export function getElemSize(el) {
    el = el.getBoundingClientRect();
    return {
        width: el.width,
        height: el.height
    }
}