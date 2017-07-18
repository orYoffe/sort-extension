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
var unwantedTags = ['style', 'script', 'meta', 'link', 'body', 'head', 'path', 'clipPath', 'svg'];
var secondChildren = document.body.querySelectorAll('*:nth-child(2)');
var optionsHTMLString = '<option value="">Sort!</option>' +
'<option value="reverse">Reverse</option>' +
'<option value="numbers">Numbers</option>';
var timeRegex = /\d+:\d+/g;
var numberRegex = /\d+/g;

function convertToArray(arr) {
  return Array.prototype.slice.call(arr);
}

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
  var children = convertToArray(listParent.childNodes);
  children.forEach(child => listParent.removeChild(child));
  children.reverse().forEach(child => listParent.appendChild(child));
}

function sortByNumbers(a, b) {
  var biggestNumberA = a.outerHTML && a.outerHTML.match(numberRegex);
  if (biggestNumberA && biggestNumberA.length) {
    biggestNumberA = biggestNumberA.sort(function(c, d) { return d - c;})[0];
  }
  var biggestNumberB = b.outerHTML && b.outerHTML.match(numberRegex);
  if (biggestNumberB && biggestNumberB.length) {
    biggestNumberB = biggestNumberB.sort(function(c, d) { return d - c;})[0];
  }
  return biggestNumberB - biggestNumberA;
}

function numbersSort(listParent) {
  if (listParent.dataset[SORTING_ALGO] !== NUMBERS) listParent.setAttribute(SORTING_ALGO_ATTR, NUMBERS);
  var children = convertToArray(listParent.childNodes);
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

function walk(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}

function matchNumbers(str) {
  return {
    hasTime: timeRegex.test(str),
    hasNumbers: numberRegex.test(str)
  };
}

function createSelect(parent, selectOptions) {
  var selectHandler = onSelect(parent);
  var hoverHandler = onHover(parent);
  var position = window.getComputedStyle(parent).position;
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
  if (selectOptions) {
    // TODO add optionsHTMLString options
  }
  select.innerHTML = optionsHTMLString;

  parent.insertBefore(select, parent.firstChild);
  parentsWithKids.push(parent);
}

function findSortableItems(item) {
  if (unwantedTags.indexOf(item.tagName.toLowerCase()) !== -1) {
    return;
  }
  var parent = item.parentElement;
  var siblingsSelector = parent.tagName.toLowerCase().trim();
  if (parent.id) siblingsSelector += '#' + parent.id;
  if (parent.name) siblingsSelector += '[name*="' + parent.name + '"]';
  if (parent.className && parent.className.length) {
    siblingsSelector += '[class*="' + parent.className.trim() + '"]';
  }
  siblingsSelector += ':not([type="hidden"]):not(.hidden) > ';
  siblingsSelector += item.tagName.toLowerCase();
  if (item.id) siblingsSelector += '#' + item.id;
  if (item.className.length) {
    var selectorParent = siblingsSelector.slice().trim();
    item.className.trim().split(' ').forEach(function(className, index) {
      if (index === 0) {
        siblingsSelector += '[class*="' + className + '"]';
      } else {
        siblingsSelector += ':not([type="hidden"]):not(.hidden), ' + selectorParent + '[class*="' + className + '"]';
      }
    });
  }
  siblingsSelector += ':not([type="hidden"]):not(.hidden)';

  var nodeList = parent.parentElement.querySelectorAll(siblingsSelector);
  var selectOptions;
  if (nodeList && nodeList.length > 1 && parentsWithKids.indexOf(parent) === -1) {
    if (item.hasChildNodes() && item.className && typeof item.className.indexOf === 'function' && item.className.indexOf('yt-shelf-grid-item yt-uix-shelfslider-item') > -1) {
      debugger
      walk(item, function (node) {
        if (node.tagName && node.tagName.length) {
          // split by new lines
          var texts = node.innerText && node.innerText.match(/[^\r\n]+/g);
          if (texts && texts.length > 0) {
              var results = texts.map(matchNumbers);
              results.forEach(function(i) {
                if (i.hasNumbers && i.hasTime) {
                  // TODO parse text next to time
                  selectOptions.hasTime = true;
                } else if (i.hasNumbers) {
                  // TODO parse text next to number
                  selectOptions.hasTime = true;
                }
              });
              console.log('results', results);

          }
        }
      });
    }
    createSelect(parent, selectOptions);
  }
}

function resolveDisplayOverflow() {
  var $selectList = document.querySelectorAll('.' + selectClass);
  $selectList = convertToArray($selectList);
  var positions = [];
  $selectList.forEach(function(select) {
    var rect = select.getBoundingClientRect();
    var top = parseInt(rect.top, 10);
    var left = parseInt(rect.left, 10);
    var position = left + ' ' + top;
    if (positions.indexOf(position) > -1) {
      while (positions.indexOf(position) > -1) {
        top += 40;
        position = left + ' ' + top;
      }
      positions.push(position);
      select.style.marginTop = top + 'px';
    } else {
      positions.push(position);
    }
  });
}


createCss();

secondChildren.forEach(findSortableItems);
resolveDisplayOverflow();
