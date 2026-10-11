/* Loaded by protect.js after the page is unlocked, when DOMContentLoaded has already fired. */
function initStorybook() {
    document.querySelectorAll('.storybook-block').forEach(function (block) {
        var items  = block.querySelectorAll('.sb-item');
        var panels = block.querySelectorAll('.sb-panel');
        items.forEach(function (item, i) {
            item.addEventListener('click', function () {
                items.forEach(function (it) { it.classList.remove('sb-active'); });
                panels.forEach(function (p)  { p.classList.remove('sb-active');  });
                item.classList.add('sb-active');
                if (panels[i]) panels[i].classList.add('sb-active');
            });
        });
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStorybook);
else initStorybook();
