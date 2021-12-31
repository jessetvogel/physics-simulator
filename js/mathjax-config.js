window.MathJax = {
    startup: {
        typeset: false,
        pageReady: () => {
            MathJax.typesetPromise(document.querySelectorAll('.mathjax-process'));
        }
    },
    options: {
        renderActions: {
            addMenu: []
        }
    },
    tex: {
        inlineMath: [
            ['$', '$'],
        ],
        macros: {
            id: '\\text{id}',
            Hom: '\\text{Hom}',
            ZZ: '\\mathbb{Z}',
            QQ: '\\mathbb{Q}',
            CC: '\\mathbb{C}',
            RR: '\\mathbb{R}',
            FF: '\\mathbb{F}',
            NN: '\\mathbb{N}',
            PP: '\\mathbb{P}',
            AA: '\\mathbb{A}',
            textup: ['\\text{#1}', 1],
            im: '\\operatorname{im}',
            coker: '\\operatorname{coker}',
            bdot: '\\bullet',
            Spec: '\\operatorname{Spec}',
            Proj: '\\operatorname{Proj}',
        }
    },
    ignoreHtmlClass: 'edit-mode'
};
//# sourceMappingURL=mathjax-config.js.map