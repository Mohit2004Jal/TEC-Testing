/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/JavaScript/graphs_maps/graph.js":
/*!*********************************************!*\
  !*** ./src/JavaScript/graphs_maps/graph.js ***!
  \*********************************************/
/***/ ((module) => {

/* global Chart, ChartStreaming, ChartZoom*/
Chart.register(ChartStreaming, ChartZoom, 'chartjs-adapter-luxon');
var visibleData = [];
// const dataCache = [];

// Factor to multiply data with
var local_factor = 1;
//Chart instance and its styling
var chart;
var graph_color = 'black';
var canvas = document.querySelector('canvas');
function generate_grid(color, lineWidth) {
  return {
    display: true,
    color: color,
    lineWidth: lineWidth
  };
}
function generate_labels(text, font_size, font_weight, color) {
  return {
    display: true,
    text: text,
    font: {
      size: font_size,
      weight: font_weight
    },
    color: color
  };
}

//Main functions
//Function to create a graph
function create_graph(selectedTanker) {
  // Destroy the previous chart if it exists
  if (chart) {
    chart.destroy();
  }
  var data = {
    datasets: [{
      label: selectedTanker,
      data: visibleData,
      borderColor: graph_color,
      lineTension: 0.1,
      borderWidth: 1
    }]
  };
  var options = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: generate_grid(graph_color, 1),
        title: generate_labels('Time', 14, 'bold', graph_color),
        type: 'realtime',
        time: {
          parser: 'luxon'
        },
        realtime: {
          ttl: 60000 * 60 * 24 * 365 * 100
        }
      },
      y: {
        grid: generate_grid(graph_color, 1),
        title: generate_labels('Fuel', 14, 'bold', graph_color)
      }
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          }
        },
        pan: {
          enabled: true,
          onPanComplete: function onPanComplete() {}
        }
      }
    }
  };
  var config = {
    type: 'line',
    data: data,
    options: options
  };
  chart = new Chart(canvas, config);
}
//Function to update Graph
function update_graph(fuel) {
  chart.data.datasets[0].data.push({
    x: new Date(),
    y: fuel * local_factor
  });
  chart.update();
}
function update_graph_data(values) {
  var _values$;
  // Clear previous data
  while (visibleData.length > 0) {
    visibleData.pop();
  }
  local_factor = ((_values$ = values[0]) === null || _values$ === void 0 ? void 0 : _values$.factor) || 1;
  values.forEach(function (row) {
    return visibleData.unshift({
      x: new Date(row.timestamp).getTime(),
      y: row.fuel_level * local_factor
    });
  });
}
module.exports = {
  create_graph: create_graph,
  update_graph: update_graph,
  update_graph_data: update_graph_data
};

/***/ }),

/***/ "./src/JavaScript/graphs_maps/map.js":
/*!*******************************************!*\
  !*** ./src/JavaScript/graphs_maps/map.js ***!
  \*******************************************/
/***/ ((module) => {

/* global L */

// Marker storage
var markers = {};
// Map instance
var map;

// Initialize the map only once with tanker location
function create_map(tanker_location) {
  if (!map) {
    map = L.map("map").setView([0, 0], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap"
    }).addTo(map);
  }
  update_map(tanker_location);
}

// Update the map location and marker position
function update_map(_ref) {
  var latitude = _ref.latitude,
    longitude = _ref.longitude,
    number_plate = _ref.number_plate;
  map.setView([latitude, longitude], 16);
  if (markers[number_plate]) {
    markers[number_plate].setLatLng([latitude, longitude]);
  } else {
    markers[number_plate] = L.marker([latitude, longitude]).addTo(map);
  }
}
module.exports = {
  update_map: update_map,
  create_map: create_map
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************************************!*\
  !*** ./src/JavaScript/graphs_maps/main.js ***!
  \********************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var select_Button = document.getElementById("select");
var select_Tanker = document.getElementById("tankers");
var selectedTanker = "";
var _require = __webpack_require__(/*! ./graph.js */ "./src/JavaScript/graphs_maps/graph.js"),
  create_graph = _require.create_graph,
  update_graph_data = _require.update_graph_data,
  update_graph = _require.update_graph;
var _require2 = __webpack_require__(/*! ./map.js */ "./src/JavaScript/graphs_maps/map.js"),
  update_map = _require2.update_map,
  create_map = _require2.create_map;

/* global io */
var socket = io.connect();

// Sending a POST request to server to get data
function initializeTankerSelection() {
  select_Button.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var response, values;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          selectedTanker = select_Tanker.value;
          if (!(selectedTanker === "none")) {
            _context.next = 4;
            break;
          }
          alert("Please select a tanker.");
          return _context.abrupt("return");
        case 4:
          _context.prev = 4;
          _context.next = 7;
          return fetch('/api/graph/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tanker: selectedTanker
            })
          });
        case 7:
          response = _context.sent;
          if (!response.ok) {
            _context.next = 18;
            break;
          }
          _context.next = 11;
          return response.json();
        case 11:
          values = _context.sent;
          document.querySelectorAll('.widget').forEach(function (widget) {
            widget.classList.remove('hidden');
          });
          create_map(values[0]);
          update_graph_data(values);
          create_graph(selectedTanker);
          _context.next = 19;
          break;
        case 18:
          console.error("Error fetching graph data:", response.status);
        case 19:
          _context.next = 24;
          break;
        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](4);
          console.error("Error during API call:", _context.t0);
        case 24:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 21]]);
  })));
}

// Socket listener for "Widget-Update" event
socket.on("Widget-Update", function (_ref2) {
  var fuel = _ref2.fuel,
    numberPlate = _ref2.numberPlate,
    longitude = _ref2.longitude,
    latitude = _ref2.latitude;
  if (numberPlate == selectedTanker) {
    update_graph(fuel);
    update_map({
      latitude: latitude,
      longitude: longitude,
      numberPlate: numberPlate
    });
  }
});
initializeTankerSelection();
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map