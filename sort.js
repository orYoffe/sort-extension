//TODO create resizer functionality

var parentsWithKids = [];
var SORTING_ALGO_ATTR = 'data-sorting-algo';
var SORTING_ALGO = 'sorting-algo';
var REVERSE = 'reverse';
var NUMBERS = 'numbers';
var parentClass = 'parentListSelectAlgos';
var selectClass = 'ListSelectSortAlgos';
var isSorting = false;
var acceptablePositions = ['fixed', 'absolute', 'relative'];
var unwantedTags = ['style', 'script', 'meta', 'link', 'body', 'head'];
var secondChildren = document.body.querySelectorAll('*:nth-child(2)');
var optionsHTMLString = '<option value="">Sort!</option>' +
'<option value="reverse">Reverse</option>' +
'<option value="numbers">Numbers</option>';

function setSorting() { isSorting = true; }

function setNotSorting(height) {
  window.scroll(0, document.body.scrollTop - 1);
  isSorting = false;
}

function createCss() {
  var css = '.' + parentClass + '{border: 2px solid rgba(50, 150, 255); width: initial; }  .' + selectClass + '{border: 1px solid #fff; width: 10px; transition: width .25s; position: absolute; top: 5px; right: 5px; z-index: 9999999; padding: 6px 8px; font-size: 16px; color: #000; background-color: #3af; }  .' + selectClass + ':hover{width: 100px; } .sort-hover-parent, .sort-hover-parent > * { box-shadow: 3px 12px 9px #E2EF67; }';

  var style = document.createElement('style');
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  document.getElementsByTagName('head')[0].appendChild(style);
}

function reverseSort(listParent) {
  if (listParent.dataset[SORTING_ALGO] !== REVERSE) listParent.setAttribute(SORTING_ALGO_ATTR, REVERSE);
  var children = Array.prototype.slice.call(listParent.childNodes);
  children.forEach(child => listParent.removeChild(child));
  children.reverse().forEach(child => listParent.appendChild(child));
}

function sortByNumbers(a, b) {
  var biggestNumberA = a.outerHTML && a.outerHTML.match(/\d+/g);
  if (biggestNumberA && biggestNumberA.length) {
    biggestNumberA = biggestNumberA.sort(function(c, d) { return d - c;})[0];
  }
  var biggestNumberB = b.outerHTML && b.outerHTML.match(/\d+/g);
  if (biggestNumberB && biggestNumberB.length) {
    biggestNumberB = biggestNumberB.sort(function(c, d) { return d - c;})[0];
  }
  return biggestNumberB - biggestNumberA;
}

function numbersSort(listParent) {
  if (listParent.dataset[SORTING_ALGO] !== NUMBERS) listParent.setAttribute(SORTING_ALGO_ATTR, NUMBERS);
  var children = Array.prototype.slice.call(listParent.childNodes);
  children.forEach(child => listParent.removeChild(child));
  children.sort(sortByNumbers).forEach(child => listParent.appendChild(child));
}

function onSelect(listParent) {
  return function(e) {
    if (isSorting) {
      if (e) e.preventDefault();
      return;
    }
    if (e) e.stopPropagation();
    var sortAlgo = e && e.target.selectedOptions && e.target.selectedOptions[0].value || listParent.dataset[SORTING_ALGO];
    if (sortAlgo) {
      setSorting();
      switch (sortAlgo.toLowerCase()) {
        case REVERSE:
        e.preventDefault();
        reverseSort(listParent);
        case NUMBERS:
        numbersSort(listParent);
        break;
      }
      setTimeout(setNotSorting, 200);
      window.scroll(0, document.body.scrollTop + 1);
    }
  }
}
function onHover(listParent) {
  return function(e) {
    if (e.type.toLowerCase() === 'mouseover') {
      listParent.classList.add('sort-hover-parent');
    } else {
      listParent.classList.remove('sort-hover-parent');
    }
  }
}

function createSelect(parent) {
  var selectHandler = onSelect(parent);
  var hoverHandler = onHover(parent);
  var position = window.getComputedStyle(parent).position;
  // TODO change styles to be css
  if (acceptablePositions.indexOf(position) === -1) {
    parent.style.position = 'relative';
  }
  parent.classList.add(parentClass);
  parent.onchange = selectHandler;

  var select = document.createElement('select');
  select.classList.add(selectClass);
  select.onchange = selectHandler;
  select.onselect = selectHandler;
  select.onmouseover = hoverHandler;
  select.onmouseleave = hoverHandler;
  select.innerHTML = optionsHTMLString;

  parent.insertBefore(select, parent.firstChild);
  parentsWithKids.push(parent);
}

function walkChildrenitem(item) {
  if (unwantedTags.indexOf(item.tagName.toLowerCase()) !== -1) {
    return;
  }
  var parent = item.parentElement;
  var siblingsSelector = parent.tagName.toLowerCase().trim();
  if (parent.id) siblingsSelector += '#' + parent.id;
  if (parent.className) siblingsSelector += '[class*="' + parent.className + '"]';
  siblingsSelector += ' > ';
  siblingsSelector += item.tagName.toLowerCase();
  if (item.className.length) {
    var selectorStart = siblingsSelector.slice().trim();
    item.className.trim().split(' ').forEach(function(className, index) {
      if (index === 0) {
        siblingsSelector = '[class*="' + className + '"]';
      } else {
        siblingsSelector += ', ' + selectorStart + '[class*="' + className + '"]';
      }
    });
  }

  var nodeList = parent.parentElement.querySelectorAll(siblingsSelector);
  if (nodeList && nodeList.length > 2 && parentsWithKids.indexOf(parent) === -1) {
    //TODO create more algos and pass to create select

    createSelect(parent);
  }
}


createCss();

secondChildren.forEach(walkChildrenitem);
