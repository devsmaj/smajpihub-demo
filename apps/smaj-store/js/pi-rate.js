(function () {
    const PI_TO_USD_RATE = 314159;
    const DETECT_PATTERN = /(\d[\d,]*(?:\.\d+)?)(\s*)([Pp]i)\b/;
    const REPLACE_PATTERN = /(\d[\d,]*(?:\.\d+)?)(\s*)([Pp]i)\b/g;

    function parsePi(value) {
        if (typeof value !== 'string') {
            value = String(value || '0');
        }
        const cleaned = value.replace(/,/g, '');
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function formatUsd(value) {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function formatPiString(piValue, decimals = 2, showUsd = true) {
        const numeric = parsePi(piValue);
        if (!Number.isFinite(numeric)) {
            return `${piValue} Pi`;
        }
        const piFormatted = numeric.toFixed(decimals);
        if (!showUsd) {
            return `${piFormatted} Pi`;
        }
        const usd = numeric * PI_TO_USD_RATE;
        return `${piFormatted} Pi (~$${formatUsd(usd)} USD)`;
    }

    function convertText(text) {
        return text.replace(REPLACE_PATTERN, (match, amount, spacing, unit) => {
            const numeric = parsePi(amount);
            if (numeric === null) {
                return match;
            }
            const usd = numeric * PI_TO_USD_RATE;
            return `${amount}${spacing}${unit} (~$${formatUsd(usd)} USD)`;
        });
    }

    function shouldConvert(text) {
        return text && text.includes('Pi') && !text.includes('(~$') && DETECT_PATTERN.test(text);
    }

    function convertNode(node) {
        if (!node || !node.textContent || !shouldConvert(node.textContent)) {
            return;
        }
        node.textContent = convertText(node.textContent);
    }

    function convertTree(root) {
        if (!root) {
            return;
        }
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.parentNode) {
                    return NodeFilter.FILTER_SKIP;
                }
                const tag = node.parentNode.tagName;
                if (!tag || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tag)) {
                    return NodeFilter.FILTER_SKIP;
                }
                return shouldConvert(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            },
        });
        let current = walker.nextNode();
        while (current) {
            convertNode(current);
            current = walker.nextNode();
        }
    }

    function initConversion() {
        if (!document.body) {
            return;
        }
        convertTree(document.body);
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData') {
                    convertNode(mutation.target);
                }
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        convertNode(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        convertTree(node);
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    document.addEventListener('DOMContentLoaded', initConversion);

    window.PI_RATE = window.PI_RATE || {};
    window.PI_RATE.rate = PI_TO_USD_RATE;
    window.PI_RATE.toUsd = function (piValue) {
        const numeric = parsePi(piValue);
        return numeric === null ? null : numeric * PI_TO_USD_RATE;
    };
    window.PI_RATE.format = formatPiString;
})();
