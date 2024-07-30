(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const fontFetcher = "";
const _common = "";
const nightColors = "";
const structure = "";
const minimal = "";
const space_animations = "";
let protoOf = Object.getPrototypeOf;
let changedStates, derivedStates, curDeps, curNewDerives, alwaysConnectedDom = { isConnected: 1 };
let gcCycleInMs = 1e3, statesToGc, propSetterCache = {};
let objProto = protoOf(alwaysConnectedDom), funcProto = protoOf(protoOf), _undefined;
let addAndScheduleOnFirst = (set, s2, f2, waitMs) => (set ?? (setTimeout(f2, waitMs), /* @__PURE__ */ new Set())).add(s2);
let runAndCaptureDeps = (f2, deps, arg) => {
  let prevDeps = curDeps;
  curDeps = deps;
  try {
    return f2(arg);
  } catch (e2) {
    console.error(e2);
    return arg;
  } finally {
    curDeps = prevDeps;
  }
};
let keepConnected = (l2) => l2.filter((b2) => b2._dom?.isConnected);
let addStatesToGc = (d2) => statesToGc = addAndScheduleOnFirst(statesToGc, d2, () => {
  for (let s2 of statesToGc)
    s2._bindings = keepConnected(s2._bindings), s2._listeners = keepConnected(s2._listeners);
  statesToGc = _undefined;
}, gcCycleInMs);
let stateProto = {
  get val() {
    curDeps?._getters?.add(this);
    return this.rawVal;
  },
  get oldVal() {
    curDeps?._getters?.add(this);
    return this._oldVal;
  },
  set val(v2) {
    curDeps?._setters?.add(this);
    if (v2 !== this.rawVal) {
      this.rawVal = v2;
      this._bindings.length + this._listeners.length ? (derivedStates?.add(this), changedStates = addAndScheduleOnFirst(changedStates, this, updateDoms)) : this._oldVal = v2;
    }
  }
};
let state = (initVal) => ({
  __proto__: stateProto,
  rawVal: initVal,
  _oldVal: initVal,
  _bindings: [],
  _listeners: []
});
let bind = (f2, dom) => {
  let deps = { _getters: /* @__PURE__ */ new Set(), _setters: /* @__PURE__ */ new Set() }, binding = { f: f2 }, prevNewDerives = curNewDerives;
  curNewDerives = [];
  let newDom = runAndCaptureDeps(f2, deps, dom);
  newDom = (newDom ?? document).nodeType ? newDom : new Text(newDom);
  for (let d2 of deps._getters)
    deps._setters.has(d2) || (addStatesToGc(d2), d2._bindings.push(binding));
  for (let l2 of curNewDerives)
    l2._dom = newDom;
  curNewDerives = prevNewDerives;
  return binding._dom = newDom;
};
let derive = (f2, s2 = state(), dom) => {
  let deps = { _getters: /* @__PURE__ */ new Set(), _setters: /* @__PURE__ */ new Set() }, listener = { f: f2, s: s2 };
  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
  s2.val = runAndCaptureDeps(f2, deps, s2.rawVal);
  for (let d2 of deps._getters)
    deps._setters.has(d2) || (addStatesToGc(d2), d2._listeners.push(listener));
  return s2;
};
let add = (dom, ...children) => {
  for (let c2 of children.flat(Infinity)) {
    let protoOfC = protoOf(c2 ?? 0);
    let child = protoOfC === stateProto ? bind(() => c2.val) : protoOfC === funcProto ? bind(c2) : c2;
    child != _undefined && dom.append(child);
  }
  return dom;
};
let tag$1 = (ns, name, ...args) => {
  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
  let dom = ns ? document.createElementNS(ns, name) : document.createElement(name);
  for (let [k2, v2] of Object.entries(props)) {
    let getPropDescriptor = (proto) => proto ? Object.getOwnPropertyDescriptor(proto, k2) ?? getPropDescriptor(protoOf(proto)) : _undefined;
    let cacheKey = name + "," + k2;
    let propSetter = propSetterCache[cacheKey] ?? (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0);
    let setter = k2.startsWith("on") ? (v3, oldV) => {
      let event = k2.slice(2);
      dom.removeEventListener(event, oldV);
      dom.addEventListener(event, v3);
    } : propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k2);
    let protoOfV = protoOf(v2 ?? 0);
    k2.startsWith("on") || protoOfV === funcProto && (v2 = derive(v2), protoOfV = stateProto);
    protoOfV === stateProto ? bind(() => (setter(v2.val, v2._oldVal), dom)) : setter(v2);
  }
  return add(dom, ...children);
};
let handler = (ns) => ({ get: (_2, name) => tag$1.bind(_undefined, ns, name) });
let tags = new Proxy((ns) => new Proxy(tag$1, handler(ns)), handler());
let update$1 = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove();
let updateDoms = () => {
  let iter = 0, derivedStatesArray = [...changedStates].filter((s2) => s2.rawVal !== s2._oldVal);
  do {
    derivedStates = /* @__PURE__ */ new Set();
    for (let l2 of new Set(derivedStatesArray.flatMap((s2) => s2._listeners = keepConnected(s2._listeners))))
      derive(l2.f, l2.s, l2._dom), l2._dom = _undefined;
  } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length);
  let changedStatesArray = [...changedStates].filter((s2) => s2.rawVal !== s2._oldVal);
  changedStates = _undefined;
  for (let b2 of new Set(changedStatesArray.flatMap((s2) => s2._bindings = keepConnected(s2._bindings))))
    update$1(b2._dom, bind(b2.f, b2._dom)), b2._dom = _undefined;
  for (let s2 of changedStatesArray)
    s2._oldVal = s2.rawVal;
};
let hydrate = (dom, f2) => update$1(dom, bind(f2, dom));
const van = { add, tags, state, derive, hydrate };
class Session {
  constructor(data) {
    if (!data)
      return false;
    this.copy(data);
  }
  copy(data) {
    for (let [key, value] of Object.entries(data)) {
      this.temp[key] = value;
    }
  }
  temp = {
    handle: null,
    network: {
      handle: null,
      DB: {
        handle: null
      }
    },
    rootHandle: null,
    adress: "",
    seedNodeID: "",
    viewOptions: {
      globalFilter: "All"
    },
    logs: [],
    lastNodeId: null
  };
  get rootName() {
    return this.temp.rootHandle?.name || this.root?.name;
  }
  network = {
    name: null,
    DB: null
  };
  root = {
    DB: null,
    name: null,
    getNodeById: (id) => this.root.DB.exec(`SELECT * FROM nodes WHERE id='${id}'`)[0].values,
    getNodeByValue: (value) => this.root.DB.exec(`SELECT * FROM nodes WHERE value='${value}'`)[0].values
  };
  selectedNode = null;
  #clickedNode = null;
  get clickedNode() {
    return this.#clickedNode;
  }
  set clickedNode(value) {
    this.#clickedNode = value;
    this.onClickedNodeChange(value);
    return true;
  }
  onClickedNodeChange = () => {
  };
  hoveredNode = null;
  copiedNode = null;
  globalFilter = null;
  settings = {
    style: {
      fontSize: 16
    },
    autosave: true,
    autosaveInterval: 10 * 1e3,
    autosaveIntervalId: null
  };
}
const appSession = new Session();
const e = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global, t$1 = Object.keys, n$1 = Array.isArray;
function r(e2, n2) {
  return "object" != typeof n2 || t$1(n2).forEach(function(t2) {
    e2[t2] = n2[t2];
  }), e2;
}
"undefined" == typeof Promise || e.Promise || (e.Promise = Promise);
const s$1 = Object.getPrototypeOf, i = {}.hasOwnProperty;
function o(e2, t2) {
  return i.call(e2, t2);
}
function a$3(e2, n2) {
  "function" == typeof n2 && (n2 = n2(s$1(e2))), ("undefined" == typeof Reflect ? t$1 : Reflect.ownKeys)(n2).forEach((t2) => {
    l$1(e2, t2, n2[t2]);
  });
}
const u = Object.defineProperty;
function l$1(e2, t2, n2, s2) {
  u(e2, t2, r(n2 && o(n2, "get") && "function" == typeof n2.get ? { get: n2.get, set: n2.set, configurable: true } : { value: n2, configurable: true, writable: true }, s2));
}
function c(e2) {
  return { from: function(t2) {
    return e2.prototype = Object.create(t2.prototype), l$1(e2.prototype, "constructor", e2), { extend: a$3.bind(null, e2.prototype) };
  } };
}
const h = Object.getOwnPropertyDescriptor;
function d(e2, t2) {
  let n2;
  return h(e2, t2) || (n2 = s$1(e2)) && d(n2, t2);
}
const f = [].slice;
function p(e2, t2, n2) {
  return f.call(e2, t2, n2);
}
function y(e2, t2) {
  return t2(e2);
}
function m(e2) {
  if (!e2)
    throw new Error("Assertion Failed");
}
function v(t2) {
  e.setImmediate ? setImmediate(t2) : setTimeout(t2, 0);
}
function g(e2, t2) {
  return e2.reduce((e3, n2, r2) => {
    var s2 = t2(n2, r2);
    return s2 && (e3[s2[0]] = s2[1]), e3;
  }, {});
}
function b$1(e2, t2) {
  if ("string" == typeof t2 && o(e2, t2))
    return e2[t2];
  if (!t2)
    return e2;
  if ("string" != typeof t2) {
    for (var n2 = [], r2 = 0, s2 = t2.length; r2 < s2; ++r2) {
      var i2 = b$1(e2, t2[r2]);
      n2.push(i2);
    }
    return n2;
  }
  var a2 = t2.indexOf(".");
  if (-1 !== a2) {
    var u2 = e2[t2.substr(0, a2)];
    return null == u2 ? void 0 : b$1(u2, t2.substr(a2 + 1));
  }
}
function _(e2, t2, r2) {
  if (e2 && void 0 !== t2 && (!("isFrozen" in Object) || !Object.isFrozen(e2)))
    if ("string" != typeof t2 && "length" in t2) {
      m("string" != typeof r2 && "length" in r2);
      for (var s2 = 0, i2 = t2.length; s2 < i2; ++s2)
        _(e2, t2[s2], r2[s2]);
    } else {
      var a2 = t2.indexOf(".");
      if (-1 !== a2) {
        var u2 = t2.substr(0, a2), l2 = t2.substr(a2 + 1);
        if ("" === l2)
          void 0 === r2 ? n$1(e2) && !isNaN(parseInt(u2)) ? e2.splice(u2, 1) : delete e2[u2] : e2[u2] = r2;
        else {
          var c2 = e2[u2];
          c2 && o(e2, u2) || (c2 = e2[u2] = {}), _(c2, l2, r2);
        }
      } else
        void 0 === r2 ? n$1(e2) && !isNaN(parseInt(t2)) ? e2.splice(t2, 1) : delete e2[t2] : e2[t2] = r2;
    }
}
function w(e2) {
  var t2 = {};
  for (var n2 in e2)
    o(e2, n2) && (t2[n2] = e2[n2]);
  return t2;
}
const x = [].concat;
function k(e2) {
  return x.apply([], e2);
}
const E = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(k([8, 16, 32, 64].map((e2) => ["Int", "Uint", "Float"].map((t2) => t2 + e2 + "Array")))).filter((t2) => e[t2]), P = E.map((t2) => e[t2]);
g(E, (e2) => [e2, true]);
let K = null;
function O(e2) {
  K = "undefined" != typeof WeakMap && /* @__PURE__ */ new WeakMap();
  const t2 = S(e2);
  return K = null, t2;
}
function S(e2) {
  if (!e2 || "object" != typeof e2)
    return e2;
  let t2 = K && K.get(e2);
  if (t2)
    return t2;
  if (n$1(e2)) {
    t2 = [], K && K.set(e2, t2);
    for (var r2 = 0, i2 = e2.length; r2 < i2; ++r2)
      t2.push(S(e2[r2]));
  } else if (P.indexOf(e2.constructor) >= 0)
    t2 = e2;
  else {
    const n2 = s$1(e2);
    for (var a2 in t2 = n2 === Object.prototype ? {} : Object.create(n2), K && K.set(e2, t2), e2)
      o(e2, a2) && (t2[a2] = S(e2[a2]));
  }
  return t2;
}
const { toString: A } = {};
function C(e2) {
  return A.call(e2).slice(8, -1);
}
const j = "undefined" != typeof Symbol ? Symbol.iterator : "@@iterator", D = "symbol" == typeof j ? function(e2) {
  var t2;
  return null != e2 && (t2 = e2[j]) && t2.apply(e2);
} : function() {
  return null;
}, I = {};
function B(e2) {
  var t2, r2, s2, i2;
  if (1 === arguments.length) {
    if (n$1(e2))
      return e2.slice();
    if (this === I && "string" == typeof e2)
      return [e2];
    if (i2 = D(e2)) {
      for (r2 = []; !(s2 = i2.next()).done; )
        r2.push(s2.value);
      return r2;
    }
    if (null == e2)
      return [e2];
    if ("number" == typeof (t2 = e2.length)) {
      for (r2 = new Array(t2); t2--; )
        r2[t2] = e2[t2];
      return r2;
    }
    return [e2];
  }
  for (t2 = arguments.length, r2 = new Array(t2); t2--; )
    r2[t2] = arguments[t2];
  return r2;
}
const T = "undefined" != typeof Symbol ? (e2) => "AsyncFunction" === e2[Symbol.toStringTag] : () => false;
var R = "undefined" != typeof location && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function F(e2, t2) {
  R = e2, M = t2;
}
var M = () => true;
const N = !new Error("").stack;
function q() {
  if (N)
    try {
      throw q.arguments, new Error();
    } catch (e2) {
      return e2;
    }
  return new Error();
}
function $(e2, t2) {
  var n2 = e2.stack;
  return n2 ? (t2 = t2 || 0, 0 === n2.indexOf(e2.name) && (t2 += (e2.name + e2.message).split("\n").length), n2.split("\n").slice(t2).filter(M).map((e3) => "\n" + e3).join("")) : "";
}
var U = ["Unknown", "Constraint", "Data", "TransactionInactive", "ReadOnly", "Version", "NotFound", "InvalidState", "InvalidAccess", "Abort", "Timeout", "QuotaExceeded", "Syntax", "DataClone"], L = ["Modify", "Bulk", "OpenFailed", "VersionChange", "Schema", "Upgrade", "InvalidTable", "MissingAPI", "NoSuchDatabase", "InvalidArgument", "SubTransaction", "Unsupported", "Internal", "DatabaseClosed", "PrematureCommit", "ForeignAwait"].concat(U), V = { VersionChanged: "Database version changed by other database connection", DatabaseClosed: "Database has been closed", Abort: "Transaction aborted", TransactionInactive: "Transaction has already completed or failed", MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb" };
function W(e2, t2) {
  this._e = q(), this.name = e2, this.message = t2;
}
function Y(e2, t2) {
  return e2 + ". Errors: " + Object.keys(t2).map((e3) => t2[e3].toString()).filter((e3, t3, n2) => n2.indexOf(e3) === t3).join("\n");
}
function z(e2, t2, n2, r2) {
  this._e = q(), this.failures = t2, this.failedKeys = r2, this.successCount = n2, this.message = Y(e2, t2);
}
function G(e2, t2) {
  this._e = q(), this.name = "BulkError", this.failures = Object.keys(t2).map((e3) => t2[e3]), this.failuresByPos = t2, this.message = Y(e2, t2);
}
c(W).from(Error).extend({ stack: { get: function() {
  return this._stack || (this._stack = this.name + ": " + this.message + $(this._e, 2));
} }, toString: function() {
  return this.name + ": " + this.message;
} }), c(z).from(W), c(G).from(W);
var H = L.reduce((e2, t2) => (e2[t2] = t2 + "Error", e2), {});
const Q = W;
var X = L.reduce((e2, t2) => {
  var n2 = t2 + "Error";
  function r2(e3, r3) {
    this._e = q(), this.name = n2, e3 ? "string" == typeof e3 ? (this.message = `${e3}${r3 ? "\n " + r3 : ""}`, this.inner = r3 || null) : "object" == typeof e3 && (this.message = `${e3.name} ${e3.message}`, this.inner = e3) : (this.message = V[t2] || n2, this.inner = null);
  }
  return c(r2).from(Q), e2[t2] = r2, e2;
}, {});
X.Syntax = SyntaxError, X.Type = TypeError, X.Range = RangeError;
var J = U.reduce((e2, t2) => (e2[t2 + "Error"] = X[t2], e2), {});
var Z = L.reduce((e2, t2) => (-1 === ["Syntax", "Type", "Range"].indexOf(t2) && (e2[t2 + "Error"] = X[t2]), e2), {});
function ee() {
}
function te(e2) {
  return e2;
}
function ne(e2, t2) {
  return null == e2 || e2 === te ? t2 : function(n2) {
    return t2(e2(n2));
  };
}
function re(e2, t2) {
  return function() {
    e2.apply(this, arguments), t2.apply(this, arguments);
  };
}
function se(e2, t2) {
  return e2 === ee ? t2 : function() {
    var n2 = e2.apply(this, arguments);
    void 0 !== n2 && (arguments[0] = n2);
    var r2 = this.onsuccess, s2 = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var i2 = t2.apply(this, arguments);
    return r2 && (this.onsuccess = this.onsuccess ? re(r2, this.onsuccess) : r2), s2 && (this.onerror = this.onerror ? re(s2, this.onerror) : s2), void 0 !== i2 ? i2 : n2;
  };
}
function ie(e2, t2) {
  return e2 === ee ? t2 : function() {
    e2.apply(this, arguments);
    var n2 = this.onsuccess, r2 = this.onerror;
    this.onsuccess = this.onerror = null, t2.apply(this, arguments), n2 && (this.onsuccess = this.onsuccess ? re(n2, this.onsuccess) : n2), r2 && (this.onerror = this.onerror ? re(r2, this.onerror) : r2);
  };
}
function oe(e2, t2) {
  return e2 === ee ? t2 : function(n2) {
    var s2 = e2.apply(this, arguments);
    r(n2, s2);
    var i2 = this.onsuccess, o2 = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var a2 = t2.apply(this, arguments);
    return i2 && (this.onsuccess = this.onsuccess ? re(i2, this.onsuccess) : i2), o2 && (this.onerror = this.onerror ? re(o2, this.onerror) : o2), void 0 === s2 ? void 0 === a2 ? void 0 : a2 : r(s2, a2);
  };
}
function ae(e2, t2) {
  return e2 === ee ? t2 : function() {
    return false !== t2.apply(this, arguments) && e2.apply(this, arguments);
  };
}
function ue(e2, t2) {
  return e2 === ee ? t2 : function() {
    var n2 = e2.apply(this, arguments);
    if (n2 && "function" == typeof n2.then) {
      for (var r2 = this, s2 = arguments.length, i2 = new Array(s2); s2--; )
        i2[s2] = arguments[s2];
      return n2.then(function() {
        return t2.apply(r2, i2);
      });
    }
    return t2.apply(this, arguments);
  };
}
Z.ModifyError = z, Z.DexieError = W, Z.BulkError = G;
var le = {};
const ce = 100, [he, de, fe] = "undefined" == typeof Promise ? [] : (() => {
  let e2 = Promise.resolve();
  if ("undefined" == typeof crypto || !crypto.subtle)
    return [e2, s$1(e2), e2];
  const t2 = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [t2, s$1(t2), e2];
})(), pe = de && de.then, ye = he && he.constructor, me = !!fe;
var ve = false, ge = fe ? () => {
  fe.then($e);
} : e.setImmediate ? setImmediate.bind(null, $e) : e.MutationObserver ? () => {
  var e2 = document.createElement("div");
  new MutationObserver(() => {
    $e(), e2 = null;
  }).observe(e2, { attributes: true }), e2.setAttribute("i", "1");
} : () => {
  setTimeout($e, 0);
}, be = function(e2, t2) {
  Se.push([e2, t2]), we && (ge(), we = false);
}, _e = true, we = true, xe = [], ke = [], Ee = null, Pe = te, Ke = { id: "global", global: true, ref: 0, unhandleds: [], onunhandled: dt, pgp: false, env: {}, finalize: function() {
  this.unhandleds.forEach((e2) => {
    try {
      dt(e2[0], e2[1]);
    } catch (e3) {
    }
  });
} }, Oe = Ke, Se = [], Ae = 0, Ce = [];
function je(e2) {
  if ("object" != typeof this)
    throw new TypeError("Promises must be constructed via new");
  this._listeners = [], this.onuncatched = ee, this._lib = false;
  var t2 = this._PSD = Oe;
  if (R && (this._stackHolder = q(), this._prev = null, this._numPrev = 0), "function" != typeof e2) {
    if (e2 !== le)
      throw new TypeError("Not a function");
    return this._state = arguments[1], this._value = arguments[2], void (false === this._state && Te(this, this._value));
  }
  this._state = null, this._value = null, ++t2.ref, Be(this, e2);
}
const De = { get: function() {
  var e2 = Oe, t2 = Xe;
  function n2(n3, r2) {
    var s2 = !e2.global && (e2 !== Oe || t2 !== Xe);
    const i2 = s2 && !tt();
    var o2 = new je((t3, o3) => {
      Fe(this, new Ie(lt(n3, e2, s2, i2), lt(r2, e2, s2, i2), t3, o3, e2));
    });
    return R && qe(o2, this), o2;
  }
  return n2.prototype = le, n2;
}, set: function(e2) {
  l$1(this, "then", e2 && e2.prototype === le ? De : { get: function() {
    return e2;
  }, set: De.set });
} };
function Ie(e2, t2, n2, r2, s2) {
  this.onFulfilled = "function" == typeof e2 ? e2 : null, this.onRejected = "function" == typeof t2 ? t2 : null, this.resolve = n2, this.reject = r2, this.psd = s2;
}
function Be(e2, t2) {
  try {
    t2((t3) => {
      if (null === e2._state) {
        if (t3 === e2)
          throw new TypeError("A promise cannot be resolved with itself.");
        var n2 = e2._lib && Ue();
        t3 && "function" == typeof t3.then ? Be(e2, (e3, n3) => {
          t3 instanceof je ? t3._then(e3, n3) : t3.then(e3, n3);
        }) : (e2._state = true, e2._value = t3, Re(e2)), n2 && Le();
      }
    }, Te.bind(null, e2));
  } catch (t3) {
    Te(e2, t3);
  }
}
function Te(e2, t2) {
  if (ke.push(t2), null === e2._state) {
    var n2 = e2._lib && Ue();
    t2 = Pe(t2), e2._state = false, e2._value = t2, R && null !== t2 && "object" == typeof t2 && !t2._promise && function(e3, t3, n3) {
      try {
        e3.apply(null, n3);
      } catch (e4) {
        t3 && t3(e4);
      }
    }(() => {
      var n3 = d(t2, "stack");
      t2._promise = e2, l$1(t2, "stack", { get: () => ve ? n3 && (n3.get ? n3.get.apply(t2) : n3.value) : e2.stack });
    }), function(e3) {
      xe.some((t3) => t3._value === e3._value) || xe.push(e3);
    }(e2), Re(e2), n2 && Le();
  }
}
function Re(e2) {
  var t2 = e2._listeners;
  e2._listeners = [];
  for (var n2 = 0, r2 = t2.length; n2 < r2; ++n2)
    Fe(e2, t2[n2]);
  var s2 = e2._PSD;
  --s2.ref || s2.finalize(), 0 === Ae && (++Ae, be(() => {
    0 == --Ae && Ve();
  }, []));
}
function Fe(e2, t2) {
  if (null !== e2._state) {
    var n2 = e2._state ? t2.onFulfilled : t2.onRejected;
    if (null === n2)
      return (e2._state ? t2.resolve : t2.reject)(e2._value);
    ++t2.psd.ref, ++Ae, be(Me, [n2, e2, t2]);
  } else
    e2._listeners.push(t2);
}
function Me(e2, t2, n2) {
  try {
    Ee = t2;
    var r2, s2 = t2._value;
    t2._state ? r2 = e2(s2) : (ke.length && (ke = []), r2 = e2(s2), -1 === ke.indexOf(s2) && function(e3) {
      var t3 = xe.length;
      for (; t3; )
        if (xe[--t3]._value === e3._value)
          return void xe.splice(t3, 1);
    }(t2)), n2.resolve(r2);
  } catch (e3) {
    n2.reject(e3);
  } finally {
    Ee = null, 0 == --Ae && Ve(), --n2.psd.ref || n2.psd.finalize();
  }
}
function Ne(e2, t2, n2) {
  if (t2.length === n2)
    return t2;
  var r2 = "";
  if (false === e2._state) {
    var s2, i2, o2 = e2._value;
    null != o2 ? (s2 = o2.name || "Error", i2 = o2.message || o2, r2 = $(o2, 0)) : (s2 = o2, i2 = ""), t2.push(s2 + (i2 ? ": " + i2 : "") + r2);
  }
  return R && ((r2 = $(e2._stackHolder, 2)) && -1 === t2.indexOf(r2) && t2.push(r2), e2._prev && Ne(e2._prev, t2, n2)), t2;
}
function qe(e2, t2) {
  var n2 = t2 ? t2._numPrev + 1 : 0;
  n2 < 100 && (e2._prev = t2, e2._numPrev = n2);
}
function $e() {
  Ue() && Le();
}
function Ue() {
  var e2 = _e;
  return _e = false, we = false, e2;
}
function Le() {
  var e2, t2, n2;
  do {
    for (; Se.length > 0; )
      for (e2 = Se, Se = [], n2 = e2.length, t2 = 0; t2 < n2; ++t2) {
        var r2 = e2[t2];
        r2[0].apply(null, r2[1]);
      }
  } while (Se.length > 0);
  _e = true, we = true;
}
function Ve() {
  var e2 = xe;
  xe = [], e2.forEach((e3) => {
    e3._PSD.onunhandled.call(null, e3._value, e3);
  });
  for (var t2 = Ce.slice(0), n2 = t2.length; n2; )
    t2[--n2]();
}
function We(e2) {
  return new je(le, false, e2);
}
function Ye(e2, t2) {
  var n2 = Oe;
  return function() {
    var r2 = Ue(), s2 = Oe;
    try {
      return it(n2, true), e2.apply(this, arguments);
    } catch (e3) {
      t2 && t2(e3);
    } finally {
      it(s2, false), r2 && Le();
    }
  };
}
a$3(je.prototype, { then: De, _then: function(e2, t2) {
  Fe(this, new Ie(null, null, e2, t2, Oe));
}, catch: function(e2) {
  if (1 === arguments.length)
    return this.then(null, e2);
  var t2 = arguments[0], n2 = arguments[1];
  return "function" == typeof t2 ? this.then(null, (e3) => e3 instanceof t2 ? n2(e3) : We(e3)) : this.then(null, (e3) => e3 && e3.name === t2 ? n2(e3) : We(e3));
}, finally: function(e2) {
  return this.then((t2) => (e2(), t2), (t2) => (e2(), We(t2)));
}, stack: { get: function() {
  if (this._stack)
    return this._stack;
  try {
    ve = true;
    var e2 = Ne(this, [], 20).join("\nFrom previous: ");
    return null !== this._state && (this._stack = e2), e2;
  } finally {
    ve = false;
  }
} }, timeout: function(e2, t2) {
  return e2 < 1 / 0 ? new je((n2, r2) => {
    var s2 = setTimeout(() => r2(new X.Timeout(t2)), e2);
    this.then(n2, r2).finally(clearTimeout.bind(null, s2));
  }) : this;
} }), "undefined" != typeof Symbol && Symbol.toStringTag && l$1(je.prototype, Symbol.toStringTag, "Dexie.Promise"), Ke.env = ot(), a$3(je, { all: function() {
  var e2 = B.apply(null, arguments).map(nt);
  return new je(function(t2, n2) {
    0 === e2.length && t2([]);
    var r2 = e2.length;
    e2.forEach((s2, i2) => je.resolve(s2).then((n3) => {
      e2[i2] = n3, --r2 || t2(e2);
    }, n2));
  });
}, resolve: (e2) => {
  if (e2 instanceof je)
    return e2;
  if (e2 && "function" == typeof e2.then)
    return new je((t3, n2) => {
      e2.then(t3, n2);
    });
  var t2 = new je(le, true, e2);
  return qe(t2, Ee), t2;
}, reject: We, race: function() {
  var e2 = B.apply(null, arguments).map(nt);
  return new je((t2, n2) => {
    e2.map((e3) => je.resolve(e3).then(t2, n2));
  });
}, PSD: { get: () => Oe, set: (e2) => Oe = e2 }, totalEchoes: { get: () => Xe }, newPSD: Ze, usePSD: at, scheduler: { get: () => be, set: (e2) => {
  be = e2;
} }, rejectionMapper: { get: () => Pe, set: (e2) => {
  Pe = e2;
} }, follow: (e2, t2) => new je((n2, r2) => Ze((t3, n3) => {
  var r3 = Oe;
  r3.unhandleds = [], r3.onunhandled = n3, r3.finalize = re(function() {
    !function(e3) {
      function t4() {
        e3(), Ce.splice(Ce.indexOf(t4), 1);
      }
      Ce.push(t4), ++Ae, be(() => {
        0 == --Ae && Ve();
      }, []);
    }(() => {
      0 === this.unhandleds.length ? t3() : n3(this.unhandleds[0]);
    });
  }, r3.finalize), e2();
}, t2, n2, r2)) }), ye && (ye.allSettled && l$1(je, "allSettled", function() {
  const e2 = B.apply(null, arguments).map(nt);
  return new je((t2) => {
    0 === e2.length && t2([]);
    let n2 = e2.length;
    const r2 = new Array(n2);
    e2.forEach((e3, s2) => je.resolve(e3).then((e4) => r2[s2] = { status: "fulfilled", value: e4 }, (e4) => r2[s2] = { status: "rejected", reason: e4 }).then(() => --n2 || t2(r2)));
  });
}), ye.any && "undefined" != typeof AggregateError && l$1(je, "any", function() {
  const e2 = B.apply(null, arguments).map(nt);
  return new je((t2, n2) => {
    0 === e2.length && n2(new AggregateError([]));
    let r2 = e2.length;
    const s2 = new Array(r2);
    e2.forEach((e3, i2) => je.resolve(e3).then((e4) => t2(e4), (e4) => {
      s2[i2] = e4, --r2 || n2(new AggregateError(s2));
    }));
  });
}));
const ze = { awaits: 0, echoes: 0, id: 0 };
var Ge = 0, He = [], Qe = 0, Xe = 0, Je = 0;
function Ze(e2, t2, n2, s2) {
  var i2 = Oe, o2 = Object.create(i2);
  o2.parent = i2, o2.ref = 0, o2.global = false, o2.id = ++Je;
  var a2 = Ke.env;
  o2.env = me ? { Promise: je, PromiseProp: { value: je, configurable: true, writable: true }, all: je.all, race: je.race, allSettled: je.allSettled, any: je.any, resolve: je.resolve, reject: je.reject, nthen: ct(a2.nthen, o2), gthen: ct(a2.gthen, o2) } : {}, t2 && r(o2, t2), ++i2.ref, o2.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var u2 = at(o2, e2, n2, s2);
  return 0 === o2.ref && o2.finalize(), u2;
}
function et() {
  return ze.id || (ze.id = ++Ge), ++ze.awaits, ze.echoes += ce, ze.id;
}
function tt() {
  return !!ze.awaits && (0 == --ze.awaits && (ze.id = 0), ze.echoes = ze.awaits * ce, true);
}
function nt(e2) {
  return ze.echoes && e2 && e2.constructor === ye ? (et(), e2.then((e3) => (tt(), e3), (e3) => (tt(), ft(e3)))) : e2;
}
function rt(e2) {
  ++Xe, ze.echoes && 0 != --ze.echoes || (ze.echoes = ze.id = 0), He.push(Oe), it(e2, true);
}
function st() {
  var e2 = He[He.length - 1];
  He.pop(), it(e2, false);
}
function it(t2, n2) {
  var r2 = Oe;
  if ((n2 ? !ze.echoes || Qe++ && t2 === Oe : !Qe || --Qe && t2 === Oe) || ut(n2 ? rt.bind(null, t2) : st), t2 !== Oe && (Oe = t2, r2 === Ke && (Ke.env = ot()), me)) {
    var s2 = Ke.env.Promise, i2 = t2.env;
    de.then = i2.nthen, s2.prototype.then = i2.gthen, (r2.global || t2.global) && (Object.defineProperty(e, "Promise", i2.PromiseProp), s2.all = i2.all, s2.race = i2.race, s2.resolve = i2.resolve, s2.reject = i2.reject, i2.allSettled && (s2.allSettled = i2.allSettled), i2.any && (s2.any = i2.any));
  }
}
function ot() {
  var t2 = e.Promise;
  return me ? { Promise: t2, PromiseProp: Object.getOwnPropertyDescriptor(e, "Promise"), all: t2.all, race: t2.race, allSettled: t2.allSettled, any: t2.any, resolve: t2.resolve, reject: t2.reject, nthen: de.then, gthen: t2.prototype.then } : {};
}
function at(e2, t2, n2, r2, s2) {
  var i2 = Oe;
  try {
    return it(e2, true), t2(n2, r2, s2);
  } finally {
    it(i2, false);
  }
}
function ut(e2) {
  pe.call(he, e2);
}
function lt(e2, t2, n2, r2) {
  return "function" != typeof e2 ? e2 : function() {
    var s2 = Oe;
    n2 && et(), it(t2, true);
    try {
      return e2.apply(this, arguments);
    } finally {
      it(s2, false), r2 && ut(tt);
    }
  };
}
function ct(e2, t2) {
  return function(n2, r2) {
    return e2.call(this, lt(n2, t2), lt(r2, t2));
  };
}
-1 === ("" + pe).indexOf("[native code]") && (et = tt = ee);
const ht = "unhandledrejection";
function dt(t2, n2) {
  var s2;
  try {
    s2 = n2.onuncatched(t2);
  } catch (e2) {
  }
  if (false !== s2)
    try {
      var i2, o2 = { promise: n2, reason: t2 };
      if (e.document && document.createEvent ? ((i2 = document.createEvent("Event")).initEvent(ht, true, true), r(i2, o2)) : e.CustomEvent && r(i2 = new CustomEvent(ht, { detail: o2 }), o2), i2 && e.dispatchEvent && (dispatchEvent(i2), !e.PromiseRejectionEvent && e.onunhandledrejection))
        try {
          e.onunhandledrejection(i2);
        } catch (e2) {
        }
      R && i2 && !i2.defaultPrevented && console.warn(`Unhandled rejection: ${t2.stack || t2}`);
    } catch (e2) {
    }
}
var ft = je.reject;
function pt(e2, t2, n2, r2) {
  if (e2.idbdb && (e2._state.openComplete || Oe.letThrough || e2._vip)) {
    var s2 = e2._createTransaction(t2, n2, e2._dbSchema);
    try {
      s2.create(), e2._state.PR1398_maxLoop = 3;
    } catch (s3) {
      return s3.name === H.InvalidState && e2.isOpen() && --e2._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e2._close(), e2.open().then(() => pt(e2, t2, n2, r2))) : ft(s3);
    }
    return s2._promise(t2, (e3, t3) => Ze(() => (Oe.trans = s2, r2(e3, t3, s2)))).then((e3) => s2._completion.then(() => e3));
  }
  if (e2._state.openComplete)
    return ft(new X.DatabaseClosed(e2._state.dbOpenError));
  if (!e2._state.isBeingOpened) {
    if (!e2._options.autoOpen)
      return ft(new X.DatabaseClosed());
    e2.open().catch(ee);
  }
  return e2._state.dbReadyPromise.then(() => pt(e2, t2, n2, r2));
}
const yt = "3.2.7", mt = String.fromCharCode(65535), vt = -1 / 0, gt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", bt = "String expected.", _t = [], wt = "undefined" != typeof navigator && /(MSIE|Trident|Edge)/.test(navigator.userAgent), xt = wt, kt = wt, Et = (e2) => !/(dexie\.js|dexie\.min\.js)/.test(e2), Pt = "__dbnames", Kt = "readonly", Ot = "readwrite";
function St(e2, t2) {
  return e2 ? t2 ? function() {
    return e2.apply(this, arguments) && t2.apply(this, arguments);
  } : e2 : t2;
}
const At = { type: 3, lower: -1 / 0, lowerOpen: false, upper: [[]], upperOpen: false };
function Ct(e2) {
  return "string" != typeof e2 || /\./.test(e2) ? (e3) => e3 : (t2) => (void 0 === t2[e2] && e2 in t2 && delete (t2 = O(t2))[e2], t2);
}
class jt {
  _trans(e2, t2, n2) {
    const r2 = this._tx || Oe.trans, s2 = this.name;
    function i2(e3, n3, r3) {
      if (!r3.schema[s2])
        throw new X.NotFound("Table " + s2 + " not part of transaction");
      return t2(r3.idbtrans, r3);
    }
    const o2 = Ue();
    try {
      return r2 && r2.db === this.db ? r2 === Oe.trans ? r2._promise(e2, i2, n2) : Ze(() => r2._promise(e2, i2, n2), { trans: r2, transless: Oe.transless || Oe }) : pt(this.db, e2, [this.name], i2);
    } finally {
      o2 && Le();
    }
  }
  get(e2, t2) {
    return e2 && e2.constructor === Object ? this.where(e2).first(t2) : this._trans("readonly", (t3) => this.core.get({ trans: t3, key: e2 }).then((e3) => this.hook.reading.fire(e3))).then(t2);
  }
  where(e2) {
    if ("string" == typeof e2)
      return new this.db.WhereClause(this, e2);
    if (n$1(e2))
      return new this.db.WhereClause(this, `[${e2.join("+")}]`);
    const r2 = t$1(e2);
    if (1 === r2.length)
      return this.where(r2[0]).equals(e2[r2[0]]);
    const s2 = this.schema.indexes.concat(this.schema.primKey).filter((e3) => {
      if (e3.compound && r2.every((t2) => e3.keyPath.indexOf(t2) >= 0)) {
        for (let t2 = 0; t2 < r2.length; ++t2)
          if (-1 === r2.indexOf(e3.keyPath[t2]))
            return false;
        return true;
      }
      return false;
    }).sort((e3, t2) => e3.keyPath.length - t2.keyPath.length)[0];
    if (s2 && this.db._maxKey !== mt) {
      const t2 = s2.keyPath.slice(0, r2.length);
      return this.where(t2).equals(t2.map((t3) => e2[t3]));
    }
    !s2 && R && console.warn(`The query ${JSON.stringify(e2)} on ${this.name} would benefit of a compound index [${r2.join("+")}]`);
    const { idxByName: i2 } = this.schema, o2 = this.db._deps.indexedDB;
    function a2(e3, t2) {
      try {
        return 0 === o2.cmp(e3, t2);
      } catch (e4) {
        return false;
      }
    }
    const [u2, l2] = r2.reduce(([t2, r3], s3) => {
      const o3 = i2[s3], u3 = e2[s3];
      return [t2 || o3, t2 || !o3 ? St(r3, o3 && o3.multi ? (e3) => {
        const t3 = b$1(e3, s3);
        return n$1(t3) && t3.some((e4) => a2(u3, e4));
      } : (e3) => a2(u3, b$1(e3, s3))) : r3];
    }, [null, null]);
    return u2 ? this.where(u2.name).equals(e2[u2.keyPath]).filter(l2) : s2 ? this.filter(l2) : this.where(r2).equals("");
  }
  filter(e2) {
    return this.toCollection().and(e2);
  }
  count(e2) {
    return this.toCollection().count(e2);
  }
  offset(e2) {
    return this.toCollection().offset(e2);
  }
  limit(e2) {
    return this.toCollection().limit(e2);
  }
  each(e2) {
    return this.toCollection().each(e2);
  }
  toArray(e2) {
    return this.toCollection().toArray(e2);
  }
  toCollection() {
    return new this.db.Collection(new this.db.WhereClause(this));
  }
  orderBy(e2) {
    return new this.db.Collection(new this.db.WhereClause(this, n$1(e2) ? `[${e2.join("+")}]` : e2));
  }
  reverse() {
    return this.toCollection().reverse();
  }
  mapToClass(e2) {
    this.schema.mappedClass = e2;
    const t2 = (t3) => {
      if (!t3)
        return t3;
      const n2 = Object.create(e2.prototype);
      for (var r2 in t3)
        if (o(t3, r2))
          try {
            n2[r2] = t3[r2];
          } catch (e3) {
          }
      return n2;
    };
    return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = t2, this.hook("reading", t2), e2;
  }
  defineClass() {
    return this.mapToClass(function(e2) {
      r(this, e2);
    });
  }
  add(e2, t2) {
    const { auto: n2, keyPath: r2 } = this.schema.primKey;
    let s2 = e2;
    return r2 && n2 && (s2 = Ct(r2)(e2)), this._trans("readwrite", (e3) => this.core.mutate({ trans: e3, type: "add", keys: null != t2 ? [t2] : null, values: [s2] })).then((e3) => e3.numFailures ? je.reject(e3.failures[0]) : e3.lastResult).then((t3) => {
      if (r2)
        try {
          _(e2, r2, t3);
        } catch (e3) {
        }
      return t3;
    });
  }
  update(e2, r2) {
    if ("object" != typeof e2 || n$1(e2))
      return this.where(":id").equals(e2).modify(r2);
    {
      const n2 = b$1(e2, this.schema.primKey.keyPath);
      if (void 0 === n2)
        return ft(new X.InvalidArgument("Given object does not contain its primary key"));
      try {
        "function" != typeof r2 ? t$1(r2).forEach((t2) => {
          _(e2, t2, r2[t2]);
        }) : r2(e2, { value: e2, primKey: n2 });
      } catch (e3) {
      }
      return this.where(":id").equals(n2).modify(r2);
    }
  }
  put(e2, t2) {
    const { auto: n2, keyPath: r2 } = this.schema.primKey;
    let s2 = e2;
    return r2 && n2 && (s2 = Ct(r2)(e2)), this._trans("readwrite", (e3) => this.core.mutate({ trans: e3, type: "put", values: [s2], keys: null != t2 ? [t2] : null })).then((e3) => e3.numFailures ? je.reject(e3.failures[0]) : e3.lastResult).then((t3) => {
      if (r2)
        try {
          _(e2, r2, t3);
        } catch (e3) {
        }
      return t3;
    });
  }
  delete(e2) {
    return this._trans("readwrite", (t2) => this.core.mutate({ trans: t2, type: "delete", keys: [e2] })).then((e3) => e3.numFailures ? je.reject(e3.failures[0]) : void 0);
  }
  clear() {
    return this._trans("readwrite", (e2) => this.core.mutate({ trans: e2, type: "deleteRange", range: At })).then((e2) => e2.numFailures ? je.reject(e2.failures[0]) : void 0);
  }
  bulkGet(e2) {
    return this._trans("readonly", (t2) => this.core.getMany({ keys: e2, trans: t2 }).then((e3) => e3.map((e4) => this.hook.reading.fire(e4))));
  }
  bulkAdd(e2, t2, n2) {
    const r2 = Array.isArray(t2) ? t2 : void 0, s2 = (n2 = n2 || (r2 ? void 0 : t2)) ? n2.allKeys : void 0;
    return this._trans("readwrite", (t3) => {
      const { auto: n3, keyPath: i2 } = this.schema.primKey;
      if (i2 && r2)
        throw new X.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (r2 && r2.length !== e2.length)
        throw new X.InvalidArgument("Arguments objects and keys must have the same length");
      const o2 = e2.length;
      let a2 = i2 && n3 ? e2.map(Ct(i2)) : e2;
      return this.core.mutate({ trans: t3, type: "add", keys: r2, values: a2, wantResults: s2 }).then(({ numFailures: e3, results: t4, lastResult: n4, failures: r3 }) => {
        if (0 === e3)
          return s2 ? t4 : n4;
        throw new G(`${this.name}.bulkAdd(): ${e3} of ${o2} operations failed`, r3);
      });
    });
  }
  bulkPut(e2, t2, n2) {
    const r2 = Array.isArray(t2) ? t2 : void 0, s2 = (n2 = n2 || (r2 ? void 0 : t2)) ? n2.allKeys : void 0;
    return this._trans("readwrite", (t3) => {
      const { auto: n3, keyPath: i2 } = this.schema.primKey;
      if (i2 && r2)
        throw new X.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (r2 && r2.length !== e2.length)
        throw new X.InvalidArgument("Arguments objects and keys must have the same length");
      const o2 = e2.length;
      let a2 = i2 && n3 ? e2.map(Ct(i2)) : e2;
      return this.core.mutate({ trans: t3, type: "put", keys: r2, values: a2, wantResults: s2 }).then(({ numFailures: e3, results: t4, lastResult: n4, failures: r3 }) => {
        if (0 === e3)
          return s2 ? t4 : n4;
        throw new G(`${this.name}.bulkPut(): ${e3} of ${o2} operations failed`, r3);
      });
    });
  }
  bulkDelete(e2) {
    const t2 = e2.length;
    return this._trans("readwrite", (t3) => this.core.mutate({ trans: t3, type: "delete", keys: e2 })).then(({ numFailures: e3, lastResult: n2, failures: r2 }) => {
      if (0 === e3)
        return n2;
      throw new G(`${this.name}.bulkDelete(): ${e3} of ${t2} operations failed`, r2);
    });
  }
}
function Dt(e2) {
  var r2 = {}, s2 = function(t2, n2) {
    if (n2) {
      for (var s3 = arguments.length, i3 = new Array(s3 - 1); --s3; )
        i3[s3 - 1] = arguments[s3];
      return r2[t2].subscribe.apply(null, i3), e2;
    }
    if ("string" == typeof t2)
      return r2[t2];
  };
  s2.addEventType = a2;
  for (var i2 = 1, o2 = arguments.length; i2 < o2; ++i2)
    a2(arguments[i2]);
  return s2;
  function a2(e3, i3, o3) {
    if ("object" != typeof e3) {
      var u2;
      i3 || (i3 = ae), o3 || (o3 = ee);
      var l2 = { subscribers: [], fire: o3, subscribe: function(e4) {
        -1 === l2.subscribers.indexOf(e4) && (l2.subscribers.push(e4), l2.fire = i3(l2.fire, e4));
      }, unsubscribe: function(e4) {
        l2.subscribers = l2.subscribers.filter(function(t2) {
          return t2 !== e4;
        }), l2.fire = l2.subscribers.reduce(i3, o3);
      } };
      return r2[e3] = s2[e3] = l2, l2;
    }
    t$1(u2 = e3).forEach(function(e4) {
      var t2 = u2[e4];
      if (n$1(t2))
        a2(e4, u2[e4][0], u2[e4][1]);
      else {
        if ("asap" !== t2)
          throw new X.InvalidArgument("Invalid event config");
        var r3 = a2(e4, te, function() {
          for (var e5 = arguments.length, t3 = new Array(e5); e5--; )
            t3[e5] = arguments[e5];
          r3.subscribers.forEach(function(e6) {
            v(function() {
              e6.apply(null, t3);
            });
          });
        });
      }
    });
  }
}
function It(e2, t2) {
  return c(t2).from({ prototype: e2 }), t2;
}
function Bt(e2, t2) {
  return !(e2.filter || e2.algorithm || e2.or) && (t2 ? e2.justLimit : !e2.replayFilter);
}
function Tt(e2, t2) {
  e2.filter = St(e2.filter, t2);
}
function Rt(e2, t2, n2) {
  var r2 = e2.replayFilter;
  e2.replayFilter = r2 ? () => St(r2(), t2()) : t2, e2.justLimit = n2 && !r2;
}
function Ft(e2, t2) {
  if (e2.isPrimKey)
    return t2.primaryKey;
  const n2 = t2.getIndexByKeyPath(e2.index);
  if (!n2)
    throw new X.Schema("KeyPath " + e2.index + " on object store " + t2.name + " is not indexed");
  return n2;
}
function Mt(e2, t2, n2) {
  const r2 = Ft(e2, t2.schema);
  return t2.openCursor({ trans: n2, values: !e2.keysOnly, reverse: "prev" === e2.dir, unique: !!e2.unique, query: { index: r2, range: e2.range } });
}
function Nt(e2, t2, n2, r2) {
  const s2 = e2.replayFilter ? St(e2.filter, e2.replayFilter()) : e2.filter;
  if (e2.or) {
    const i2 = {}, a2 = (e3, n3, r3) => {
      if (!s2 || s2(n3, r3, (e4) => n3.stop(e4), (e4) => n3.fail(e4))) {
        var a3 = n3.primaryKey, u2 = "" + a3;
        "[object ArrayBuffer]" === u2 && (u2 = "" + new Uint8Array(a3)), o(i2, u2) || (i2[u2] = true, t2(e3, n3, r3));
      }
    };
    return Promise.all([e2.or._iterate(a2, n2), qt(Mt(e2, r2, n2), e2.algorithm, a2, !e2.keysOnly && e2.valueMapper)]);
  }
  return qt(Mt(e2, r2, n2), St(e2.algorithm, s2), t2, !e2.keysOnly && e2.valueMapper);
}
function qt(e2, t2, n2, r2) {
  var s2 = Ye(r2 ? (e3, t3, s3) => n2(r2(e3), t3, s3) : n2);
  return e2.then((e3) => {
    if (e3)
      return e3.start(() => {
        var n3 = () => e3.continue();
        t2 && !t2(e3, (e4) => n3 = e4, (t3) => {
          e3.stop(t3), n3 = ee;
        }, (t3) => {
          e3.fail(t3), n3 = ee;
        }) || s2(e3.value, e3, (e4) => n3 = e4), n3();
      });
  });
}
function $t(e2, t2) {
  try {
    const n2 = Ut(e2), r2 = Ut(t2);
    if (n2 !== r2)
      return "Array" === n2 ? 1 : "Array" === r2 ? -1 : "binary" === n2 ? 1 : "binary" === r2 ? -1 : "string" === n2 ? 1 : "string" === r2 ? -1 : "Date" === n2 ? 1 : "Date" !== r2 ? NaN : -1;
    switch (n2) {
      case "number":
      case "Date":
      case "string":
        return e2 > t2 ? 1 : e2 < t2 ? -1 : 0;
      case "binary":
        return function(e3, t3) {
          const n3 = e3.length, r3 = t3.length, s2 = n3 < r3 ? n3 : r3;
          for (let n4 = 0; n4 < s2; ++n4)
            if (e3[n4] !== t3[n4])
              return e3[n4] < t3[n4] ? -1 : 1;
          return n3 === r3 ? 0 : n3 < r3 ? -1 : 1;
        }(Lt(e2), Lt(t2));
      case "Array":
        return function(e3, t3) {
          const n3 = e3.length, r3 = t3.length, s2 = n3 < r3 ? n3 : r3;
          for (let n4 = 0; n4 < s2; ++n4) {
            const r4 = $t(e3[n4], t3[n4]);
            if (0 !== r4)
              return r4;
          }
          return n3 === r3 ? 0 : n3 < r3 ? -1 : 1;
        }(e2, t2);
    }
  } catch (e3) {
  }
  return NaN;
}
function Ut(e2) {
  const t2 = typeof e2;
  if ("object" !== t2)
    return t2;
  if (ArrayBuffer.isView(e2))
    return "binary";
  const n2 = C(e2);
  return "ArrayBuffer" === n2 ? "binary" : n2;
}
function Lt(e2) {
  return e2 instanceof Uint8Array ? e2 : ArrayBuffer.isView(e2) ? new Uint8Array(e2.buffer, e2.byteOffset, e2.byteLength) : new Uint8Array(e2);
}
class Vt {
  _read(e2, t2) {
    var n2 = this._ctx;
    return n2.error ? n2.table._trans(null, ft.bind(null, n2.error)) : n2.table._trans("readonly", e2).then(t2);
  }
  _write(e2) {
    var t2 = this._ctx;
    return t2.error ? t2.table._trans(null, ft.bind(null, t2.error)) : t2.table._trans("readwrite", e2, "locked");
  }
  _addAlgorithm(e2) {
    var t2 = this._ctx;
    t2.algorithm = St(t2.algorithm, e2);
  }
  _iterate(e2, t2) {
    return Nt(this._ctx, e2, t2, this._ctx.table.core);
  }
  clone(e2) {
    var t2 = Object.create(this.constructor.prototype), n2 = Object.create(this._ctx);
    return e2 && r(n2, e2), t2._ctx = n2, t2;
  }
  raw() {
    return this._ctx.valueMapper = null, this;
  }
  each(e2) {
    var t2 = this._ctx;
    return this._read((n2) => Nt(t2, e2, n2, t2.table.core));
  }
  count(e2) {
    return this._read((e3) => {
      const t2 = this._ctx, n2 = t2.table.core;
      if (Bt(t2, true))
        return n2.count({ trans: e3, query: { index: Ft(t2, n2.schema), range: t2.range } }).then((e4) => Math.min(e4, t2.limit));
      var r2 = 0;
      return Nt(t2, () => (++r2, false), e3, n2).then(() => r2);
    }).then(e2);
  }
  sortBy(e2, t2) {
    const n2 = e2.split(".").reverse(), r2 = n2[0], s2 = n2.length - 1;
    function i2(e3, t3) {
      return t3 ? i2(e3[n2[t3]], t3 - 1) : e3[r2];
    }
    var o2 = "next" === this._ctx.dir ? 1 : -1;
    function a2(e3, t3) {
      var n3 = i2(e3, s2), r3 = i2(t3, s2);
      return n3 < r3 ? -o2 : n3 > r3 ? o2 : 0;
    }
    return this.toArray(function(e3) {
      return e3.sort(a2);
    }).then(t2);
  }
  toArray(e2) {
    return this._read((e3) => {
      var t2 = this._ctx;
      if ("next" === t2.dir && Bt(t2, true) && t2.limit > 0) {
        const { valueMapper: n2 } = t2, r2 = Ft(t2, t2.table.core.schema);
        return t2.table.core.query({ trans: e3, limit: t2.limit, values: true, query: { index: r2, range: t2.range } }).then(({ result: e4 }) => n2 ? e4.map(n2) : e4);
      }
      {
        const n2 = [];
        return Nt(t2, (e4) => n2.push(e4), e3, t2.table.core).then(() => n2);
      }
    }, e2);
  }
  offset(e2) {
    var t2 = this._ctx;
    return e2 <= 0 || (t2.offset += e2, Bt(t2) ? Rt(t2, () => {
      var t3 = e2;
      return (e3, n2) => 0 === t3 || (1 === t3 ? (--t3, false) : (n2(() => {
        e3.advance(t3), t3 = 0;
      }), false));
    }) : Rt(t2, () => {
      var t3 = e2;
      return () => --t3 < 0;
    })), this;
  }
  limit(e2) {
    return this._ctx.limit = Math.min(this._ctx.limit, e2), Rt(this._ctx, () => {
      var t2 = e2;
      return function(e3, n2, r2) {
        return --t2 <= 0 && n2(r2), t2 >= 0;
      };
    }, true), this;
  }
  until(e2, t2) {
    return Tt(this._ctx, function(n2, r2, s2) {
      return !e2(n2.value) || (r2(s2), t2);
    }), this;
  }
  first(e2) {
    return this.limit(1).toArray(function(e3) {
      return e3[0];
    }).then(e2);
  }
  last(e2) {
    return this.reverse().first(e2);
  }
  filter(e2) {
    var t2, n2;
    return Tt(this._ctx, function(t3) {
      return e2(t3.value);
    }), t2 = this._ctx, n2 = e2, t2.isMatch = St(t2.isMatch, n2), this;
  }
  and(e2) {
    return this.filter(e2);
  }
  or(e2) {
    return new this.db.WhereClause(this._ctx.table, e2, this);
  }
  reverse() {
    return this._ctx.dir = "prev" === this._ctx.dir ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), this;
  }
  desc() {
    return this.reverse();
  }
  eachKey(e2) {
    var t2 = this._ctx;
    return t2.keysOnly = !t2.isMatch, this.each(function(t3, n2) {
      e2(n2.key, n2);
    });
  }
  eachUniqueKey(e2) {
    return this._ctx.unique = "unique", this.eachKey(e2);
  }
  eachPrimaryKey(e2) {
    var t2 = this._ctx;
    return t2.keysOnly = !t2.isMatch, this.each(function(t3, n2) {
      e2(n2.primaryKey, n2);
    });
  }
  keys(e2) {
    var t2 = this._ctx;
    t2.keysOnly = !t2.isMatch;
    var n2 = [];
    return this.each(function(e3, t3) {
      n2.push(t3.key);
    }).then(function() {
      return n2;
    }).then(e2);
  }
  primaryKeys(e2) {
    var t2 = this._ctx;
    if ("next" === t2.dir && Bt(t2, true) && t2.limit > 0)
      return this._read((e3) => {
        var n3 = Ft(t2, t2.table.core.schema);
        return t2.table.core.query({ trans: e3, values: false, limit: t2.limit, query: { index: n3, range: t2.range } });
      }).then(({ result: e3 }) => e3).then(e2);
    t2.keysOnly = !t2.isMatch;
    var n2 = [];
    return this.each(function(e3, t3) {
      n2.push(t3.primaryKey);
    }).then(function() {
      return n2;
    }).then(e2);
  }
  uniqueKeys(e2) {
    return this._ctx.unique = "unique", this.keys(e2);
  }
  firstKey(e2) {
    return this.limit(1).keys(function(e3) {
      return e3[0];
    }).then(e2);
  }
  lastKey(e2) {
    return this.reverse().firstKey(e2);
  }
  distinct() {
    var e2 = this._ctx, t2 = e2.index && e2.table.schema.idxByName[e2.index];
    if (!t2 || !t2.multi)
      return this;
    var n2 = {};
    return Tt(this._ctx, function(e3) {
      var t3 = e3.primaryKey.toString(), r2 = o(n2, t3);
      return n2[t3] = true, !r2;
    }), this;
  }
  modify(e2) {
    var n2 = this._ctx;
    return this._write((r2) => {
      var s2;
      if ("function" == typeof e2)
        s2 = e2;
      else {
        var i2 = t$1(e2), o2 = i2.length;
        s2 = function(t2) {
          for (var n3 = false, r3 = 0; r3 < o2; ++r3) {
            var s3 = i2[r3], a3 = e2[s3];
            b$1(t2, s3) !== a3 && (_(t2, s3, a3), n3 = true);
          }
          return n3;
        };
      }
      const a2 = n2.table.core, { outbound: u2, extractKey: l2 } = a2.schema.primaryKey, c2 = this.db._options.modifyChunkSize || 200, h2 = [];
      let d2 = 0;
      const f2 = [], p2 = (e3, n3) => {
        const { failures: r3, numFailures: s3 } = n3;
        d2 += e3 - s3;
        for (let e4 of t$1(r3))
          h2.push(r3[e4]);
      };
      return this.clone().primaryKeys().then((t2) => {
        const i3 = (o3) => {
          const h3 = Math.min(c2, t2.length - o3);
          return a2.getMany({ trans: r2, keys: t2.slice(o3, o3 + h3), cache: "immutable" }).then((d3) => {
            const f3 = [], y2 = [], m2 = u2 ? [] : null, v2 = [];
            for (let e3 = 0; e3 < h3; ++e3) {
              const n3 = d3[e3], r3 = { value: O(n3), primKey: t2[o3 + e3] };
              false !== s2.call(r3, r3.value, r3) && (null == r3.value ? v2.push(t2[o3 + e3]) : u2 || 0 === $t(l2(n3), l2(r3.value)) ? (y2.push(r3.value), u2 && m2.push(t2[o3 + e3])) : (v2.push(t2[o3 + e3]), f3.push(r3.value)));
            }
            const g2 = Bt(n2) && n2.limit === 1 / 0 && ("function" != typeof e2 || e2 === Wt) && { index: n2.index, range: n2.range };
            return Promise.resolve(f3.length > 0 && a2.mutate({ trans: r2, type: "add", values: f3 }).then((e3) => {
              for (let t3 in e3.failures)
                v2.splice(parseInt(t3), 1);
              p2(f3.length, e3);
            })).then(() => (y2.length > 0 || g2 && "object" == typeof e2) && a2.mutate({ trans: r2, type: "put", keys: m2, values: y2, criteria: g2, changeSpec: "function" != typeof e2 && e2 }).then((e3) => p2(y2.length, e3))).then(() => (v2.length > 0 || g2 && e2 === Wt) && a2.mutate({ trans: r2, type: "delete", keys: v2, criteria: g2 }).then((e3) => p2(v2.length, e3))).then(() => t2.length > o3 + h3 && i3(o3 + c2));
          });
        };
        return i3(0).then(() => {
          if (h2.length > 0)
            throw new z("Error modifying one or more objects", h2, d2, f2);
          return t2.length;
        });
      });
    });
  }
  delete() {
    var e2 = this._ctx, t2 = e2.range;
    return Bt(e2) && (e2.isPrimKey && !kt || 3 === t2.type) ? this._write((n2) => {
      const { primaryKey: r2 } = e2.table.core.schema, s2 = t2;
      return e2.table.core.count({ trans: n2, query: { index: r2, range: s2 } }).then((t3) => e2.table.core.mutate({ trans: n2, type: "deleteRange", range: s2 }).then(({ failures: e3, lastResult: n3, results: r3, numFailures: s3 }) => {
        if (s3)
          throw new z("Could not delete some values", Object.keys(e3).map((t4) => e3[t4]), t3 - s3);
        return t3 - s3;
      }));
    }) : this.modify(Wt);
  }
}
const Wt = (e2, t2) => t2.value = null;
function Yt(e2, t2) {
  return e2 < t2 ? -1 : e2 === t2 ? 0 : 1;
}
function zt(e2, t2) {
  return e2 > t2 ? -1 : e2 === t2 ? 0 : 1;
}
function Gt(e2, t2, n2) {
  var r2 = e2 instanceof en ? new e2.Collection(e2) : e2;
  return r2._ctx.error = n2 ? new n2(t2) : new TypeError(t2), r2;
}
function Ht(e2) {
  return new e2.Collection(e2, () => Zt("")).limit(0);
}
function Qt(e2, t2, n2, r2, s2, i2) {
  for (var o2 = Math.min(e2.length, r2.length), a2 = -1, u2 = 0; u2 < o2; ++u2) {
    var l2 = t2[u2];
    if (l2 !== r2[u2])
      return s2(e2[u2], n2[u2]) < 0 ? e2.substr(0, u2) + n2[u2] + n2.substr(u2 + 1) : s2(e2[u2], r2[u2]) < 0 ? e2.substr(0, u2) + r2[u2] + n2.substr(u2 + 1) : a2 >= 0 ? e2.substr(0, a2) + t2[a2] + n2.substr(a2 + 1) : null;
    s2(e2[u2], l2) < 0 && (a2 = u2);
  }
  return o2 < r2.length && "next" === i2 ? e2 + n2.substr(e2.length) : o2 < e2.length && "prev" === i2 ? e2.substr(0, n2.length) : a2 < 0 ? null : e2.substr(0, a2) + r2[a2] + n2.substr(a2 + 1);
}
function Xt(e2, t2, n2, r2) {
  var s2, i2, o2, a2, u2, l2, c2, h2 = n2.length;
  if (!n2.every((e3) => "string" == typeof e3))
    return Gt(e2, bt);
  function d2(e3) {
    s2 = function(e4) {
      return "next" === e4 ? (e5) => e5.toUpperCase() : (e5) => e5.toLowerCase();
    }(e3), i2 = function(e4) {
      return "next" === e4 ? (e5) => e5.toLowerCase() : (e5) => e5.toUpperCase();
    }(e3), o2 = "next" === e3 ? Yt : zt;
    var t3 = n2.map(function(e4) {
      return { lower: i2(e4), upper: s2(e4) };
    }).sort(function(e4, t4) {
      return o2(e4.lower, t4.lower);
    });
    a2 = t3.map(function(e4) {
      return e4.upper;
    }), u2 = t3.map(function(e4) {
      return e4.lower;
    }), l2 = e3, c2 = "next" === e3 ? "" : r2;
  }
  d2("next");
  var f2 = new e2.Collection(e2, () => Jt(a2[0], u2[h2 - 1] + r2));
  f2._ondirectionchange = function(e3) {
    d2(e3);
  };
  var p2 = 0;
  return f2._addAlgorithm(function(e3, n3, r3) {
    var s3 = e3.key;
    if ("string" != typeof s3)
      return false;
    var d3 = i2(s3);
    if (t2(d3, u2, p2))
      return true;
    for (var f3 = null, y2 = p2; y2 < h2; ++y2) {
      var m2 = Qt(s3, d3, a2[y2], u2[y2], o2, l2);
      null === m2 && null === f3 ? p2 = y2 + 1 : (null === f3 || o2(f3, m2) > 0) && (f3 = m2);
    }
    return n3(null !== f3 ? function() {
      e3.continue(f3 + c2);
    } : r3), false;
  }), f2;
}
function Jt(e2, t2, n2, r2) {
  return { type: 2, lower: e2, upper: t2, lowerOpen: n2, upperOpen: r2 };
}
function Zt(e2) {
  return { type: 1, lower: e2, upper: e2 };
}
class en {
  get Collection() {
    return this._ctx.table.db.Collection;
  }
  between(e2, t2, n2, r2) {
    n2 = false !== n2, r2 = true === r2;
    try {
      return this._cmp(e2, t2) > 0 || 0 === this._cmp(e2, t2) && (n2 || r2) && (!n2 || !r2) ? Ht(this) : new this.Collection(this, () => Jt(e2, t2, !n2, !r2));
    } catch (e3) {
      return Gt(this, gt);
    }
  }
  equals(e2) {
    return null == e2 ? Gt(this, gt) : new this.Collection(this, () => Zt(e2));
  }
  above(e2) {
    return null == e2 ? Gt(this, gt) : new this.Collection(this, () => Jt(e2, void 0, true));
  }
  aboveOrEqual(e2) {
    return null == e2 ? Gt(this, gt) : new this.Collection(this, () => Jt(e2, void 0, false));
  }
  below(e2) {
    return null == e2 ? Gt(this, gt) : new this.Collection(this, () => Jt(void 0, e2, false, true));
  }
  belowOrEqual(e2) {
    return null == e2 ? Gt(this, gt) : new this.Collection(this, () => Jt(void 0, e2));
  }
  startsWith(e2) {
    return "string" != typeof e2 ? Gt(this, bt) : this.between(e2, e2 + mt, true, true);
  }
  startsWithIgnoreCase(e2) {
    return "" === e2 ? this.startsWith(e2) : Xt(this, (e3, t2) => 0 === e3.indexOf(t2[0]), [e2], mt);
  }
  equalsIgnoreCase(e2) {
    return Xt(this, (e3, t2) => e3 === t2[0], [e2], "");
  }
  anyOfIgnoreCase() {
    var e2 = B.apply(I, arguments);
    return 0 === e2.length ? Ht(this) : Xt(this, (e3, t2) => -1 !== t2.indexOf(e3), e2, "");
  }
  startsWithAnyOfIgnoreCase() {
    var e2 = B.apply(I, arguments);
    return 0 === e2.length ? Ht(this) : Xt(this, (e3, t2) => t2.some((t3) => 0 === e3.indexOf(t3)), e2, mt);
  }
  anyOf() {
    const e2 = B.apply(I, arguments);
    let t2 = this._cmp;
    try {
      e2.sort(t2);
    } catch (e3) {
      return Gt(this, gt);
    }
    if (0 === e2.length)
      return Ht(this);
    const n2 = new this.Collection(this, () => Jt(e2[0], e2[e2.length - 1]));
    n2._ondirectionchange = (n3) => {
      t2 = "next" === n3 ? this._ascending : this._descending, e2.sort(t2);
    };
    let r2 = 0;
    return n2._addAlgorithm((n3, s2, i2) => {
      const o2 = n3.key;
      for (; t2(o2, e2[r2]) > 0; )
        if (++r2, r2 === e2.length)
          return s2(i2), false;
      return 0 === t2(o2, e2[r2]) || (s2(() => {
        n3.continue(e2[r2]);
      }), false);
    }), n2;
  }
  notEqual(e2) {
    return this.inAnyRange([[vt, e2], [e2, this.db._maxKey]], { includeLowers: false, includeUppers: false });
  }
  noneOf() {
    const e2 = B.apply(I, arguments);
    if (0 === e2.length)
      return new this.Collection(this);
    try {
      e2.sort(this._ascending);
    } catch (e3) {
      return Gt(this, gt);
    }
    const t2 = e2.reduce((e3, t3) => e3 ? e3.concat([[e3[e3.length - 1][1], t3]]) : [[vt, t3]], null);
    return t2.push([e2[e2.length - 1], this.db._maxKey]), this.inAnyRange(t2, { includeLowers: false, includeUppers: false });
  }
  inAnyRange(e2, t2) {
    const n2 = this._cmp, r2 = this._ascending, s2 = this._descending, i2 = this._min, o2 = this._max;
    if (0 === e2.length)
      return Ht(this);
    if (!e2.every((e3) => void 0 !== e3[0] && void 0 !== e3[1] && r2(e3[0], e3[1]) <= 0))
      return Gt(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", X.InvalidArgument);
    const a2 = !t2 || false !== t2.includeLowers, u2 = t2 && true === t2.includeUppers;
    let l2, c2 = r2;
    function h2(e3, t3) {
      return c2(e3[0], t3[0]);
    }
    try {
      l2 = e2.reduce(function(e3, t3) {
        let r3 = 0, s3 = e3.length;
        for (; r3 < s3; ++r3) {
          const s4 = e3[r3];
          if (n2(t3[0], s4[1]) < 0 && n2(t3[1], s4[0]) > 0) {
            s4[0] = i2(s4[0], t3[0]), s4[1] = o2(s4[1], t3[1]);
            break;
          }
        }
        return r3 === s3 && e3.push(t3), e3;
      }, []), l2.sort(h2);
    } catch (e3) {
      return Gt(this, gt);
    }
    let d2 = 0;
    const f2 = u2 ? (e3) => r2(e3, l2[d2][1]) > 0 : (e3) => r2(e3, l2[d2][1]) >= 0, p2 = a2 ? (e3) => s2(e3, l2[d2][0]) > 0 : (e3) => s2(e3, l2[d2][0]) >= 0;
    let y2 = f2;
    const m2 = new this.Collection(this, () => Jt(l2[0][0], l2[l2.length - 1][1], !a2, !u2));
    return m2._ondirectionchange = (e3) => {
      "next" === e3 ? (y2 = f2, c2 = r2) : (y2 = p2, c2 = s2), l2.sort(h2);
    }, m2._addAlgorithm((e3, t3, n3) => {
      for (var s3 = e3.key; y2(s3); )
        if (++d2, d2 === l2.length)
          return t3(n3), false;
      return !!function(e4) {
        return !f2(e4) && !p2(e4);
      }(s3) || (0 === this._cmp(s3, l2[d2][1]) || 0 === this._cmp(s3, l2[d2][0]) || t3(() => {
        c2 === r2 ? e3.continue(l2[d2][0]) : e3.continue(l2[d2][1]);
      }), false);
    }), m2;
  }
  startsWithAnyOf() {
    const e2 = B.apply(I, arguments);
    return e2.every((e3) => "string" == typeof e3) ? 0 === e2.length ? Ht(this) : this.inAnyRange(e2.map((e3) => [e3, e3 + mt])) : Gt(this, "startsWithAnyOf() only works with strings");
  }
}
function tn(e2) {
  return Ye(function(t2) {
    return nn(t2), e2(t2.target.error), false;
  });
}
function nn(e2) {
  e2.stopPropagation && e2.stopPropagation(), e2.preventDefault && e2.preventDefault();
}
const rn = "storagemutated", sn = "x-storagemutated-1", on = Dt(null, rn);
class an {
  _lock() {
    return m(!Oe.global), ++this._reculock, 1 !== this._reculock || Oe.global || (Oe.lockOwnerFor = this), this;
  }
  _unlock() {
    if (m(!Oe.global), 0 == --this._reculock)
      for (Oe.global || (Oe.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked(); ) {
        var e2 = this._blockedFuncs.shift();
        try {
          at(e2[1], e2[0]);
        } catch (e3) {
        }
      }
    return this;
  }
  _locked() {
    return this._reculock && Oe.lockOwnerFor !== this;
  }
  create(e2) {
    if (!this.mode)
      return this;
    const t2 = this.db.idbdb, n2 = this.db._state.dbOpenError;
    if (m(!this.idbtrans), !e2 && !t2)
      switch (n2 && n2.name) {
        case "DatabaseClosedError":
          throw new X.DatabaseClosed(n2);
        case "MissingAPIError":
          throw new X.MissingAPI(n2.message, n2);
        default:
          throw new X.OpenFailed(n2);
      }
    if (!this.active)
      throw new X.TransactionInactive();
    return m(null === this._completion._state), (e2 = this.idbtrans = e2 || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : t2.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }))).onerror = Ye((t3) => {
      nn(t3), this._reject(e2.error);
    }), e2.onabort = Ye((t3) => {
      nn(t3), this.active && this._reject(new X.Abort(e2.error)), this.active = false, this.on("abort").fire(t3);
    }), e2.oncomplete = Ye(() => {
      this.active = false, this._resolve(), "mutatedParts" in e2 && on.storagemutated.fire(e2.mutatedParts);
    }), this;
  }
  _promise(e2, t2, n2) {
    if ("readwrite" === e2 && "readwrite" !== this.mode)
      return ft(new X.ReadOnly("Transaction is readonly"));
    if (!this.active)
      return ft(new X.TransactionInactive());
    if (this._locked())
      return new je((r3, s2) => {
        this._blockedFuncs.push([() => {
          this._promise(e2, t2, n2).then(r3, s2);
        }, Oe]);
      });
    if (n2)
      return Ze(() => {
        var e3 = new je((e4, n3) => {
          this._lock();
          const r3 = t2(e4, n3, this);
          r3 && r3.then && r3.then(e4, n3);
        });
        return e3.finally(() => this._unlock()), e3._lib = true, e3;
      });
    var r2 = new je((e3, n3) => {
      var r3 = t2(e3, n3, this);
      r3 && r3.then && r3.then(e3, n3);
    });
    return r2._lib = true, r2;
  }
  _root() {
    return this.parent ? this.parent._root() : this;
  }
  waitFor(e2) {
    var t2 = this._root();
    const n2 = je.resolve(e2);
    if (t2._waitingFor)
      t2._waitingFor = t2._waitingFor.then(() => n2);
    else {
      t2._waitingFor = n2, t2._waitingQueue = [];
      var r2 = t2.idbtrans.objectStore(t2.storeNames[0]);
      !function e3() {
        for (++t2._spinCount; t2._waitingQueue.length; )
          t2._waitingQueue.shift()();
        t2._waitingFor && (r2.get(-1 / 0).onsuccess = e3);
      }();
    }
    var s2 = t2._waitingFor;
    return new je((e3, r3) => {
      n2.then((n3) => t2._waitingQueue.push(Ye(e3.bind(null, n3))), (e4) => t2._waitingQueue.push(Ye(r3.bind(null, e4)))).finally(() => {
        t2._waitingFor === s2 && (t2._waitingFor = null);
      });
    });
  }
  abort() {
    this.active && (this.active = false, this.idbtrans && this.idbtrans.abort(), this._reject(new X.Abort()));
  }
  table(e2) {
    const t2 = this._memoizedTables || (this._memoizedTables = {});
    if (o(t2, e2))
      return t2[e2];
    const n2 = this.schema[e2];
    if (!n2)
      throw new X.NotFound("Table " + e2 + " not part of transaction");
    const r2 = new this.db.Table(e2, n2, this);
    return r2.core = this.db.core.table(e2), t2[e2] = r2, r2;
  }
}
function un(e2, t2, n2, r2, s2, i2, o2) {
  return { name: e2, keyPath: t2, unique: n2, multi: r2, auto: s2, compound: i2, src: (n2 && !o2 ? "&" : "") + (r2 ? "*" : "") + (s2 ? "++" : "") + ln(t2) };
}
function ln(e2) {
  return "string" == typeof e2 ? e2 : e2 ? "[" + [].join.call(e2, "+") + "]" : "";
}
function cn(e2, t2, n2) {
  return { name: e2, primKey: t2, indexes: n2, mappedClass: null, idxByName: g(n2, (e3) => [e3.name, e3]) };
}
let hn = (e2) => {
  try {
    return e2.only([[]]), hn = () => [[]], [[]];
  } catch (e3) {
    return hn = () => mt, mt;
  }
};
function dn(e2) {
  return null == e2 ? () => {
  } : "string" == typeof e2 ? function(e3) {
    const t2 = e3.split(".");
    return 1 === t2.length ? (t3) => t3[e3] : (t3) => b$1(t3, e3);
  }(e2) : (t2) => b$1(t2, e2);
}
function fn(e2) {
  return [].slice.call(e2);
}
let pn = 0;
function yn(e2) {
  return null == e2 ? ":id" : "string" == typeof e2 ? e2 : `[${e2.join("+")}]`;
}
function mn(e2, t2, r2) {
  function s2(e3) {
    if (3 === e3.type)
      return null;
    if (4 === e3.type)
      throw new Error("Cannot convert never type to IDBKeyRange");
    const { lower: n2, upper: r3, lowerOpen: s3, upperOpen: i3 } = e3;
    return void 0 === n2 ? void 0 === r3 ? null : t2.upperBound(r3, !!i3) : void 0 === r3 ? t2.lowerBound(n2, !!s3) : t2.bound(n2, r3, !!s3, !!i3);
  }
  const { schema: i2, hasGetAll: o2 } = function(e3, t3) {
    const r3 = fn(e3.objectStoreNames);
    return { schema: { name: e3.name, tables: r3.map((e4) => t3.objectStore(e4)).map((e4) => {
      const { keyPath: t4, autoIncrement: r4 } = e4, s3 = n$1(t4), i3 = null == t4, o3 = {}, a3 = { name: e4.name, primaryKey: { name: null, isPrimaryKey: true, outbound: i3, compound: s3, keyPath: t4, autoIncrement: r4, unique: true, extractKey: dn(t4) }, indexes: fn(e4.indexNames).map((t5) => e4.index(t5)).map((e5) => {
        const { name: t5, unique: r5, multiEntry: s4, keyPath: i4 } = e5, a4 = { name: t5, compound: n$1(i4), keyPath: i4, unique: r5, multiEntry: s4, extractKey: dn(i4) };
        return o3[yn(i4)] = a4, a4;
      }), getIndexByKeyPath: (e5) => o3[yn(e5)] };
      return o3[":id"] = a3.primaryKey, null != t4 && (o3[yn(t4)] = a3.primaryKey), a3;
    }) }, hasGetAll: r3.length > 0 && "getAll" in t3.objectStore(r3[0]) && !("undefined" != typeof navigator && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) };
  }(e2, r2), a2 = i2.tables.map((e3) => function(e4) {
    const t3 = e4.name;
    return { name: t3, schema: e4, mutate: function({ trans: e5, type: n2, keys: r3, values: i3, range: o3 }) {
      return new Promise((a3, u3) => {
        a3 = Ye(a3);
        const l2 = e5.objectStore(t3), c2 = null == l2.keyPath, h2 = "put" === n2 || "add" === n2;
        if (!h2 && "delete" !== n2 && "deleteRange" !== n2)
          throw new Error("Invalid operation type: " + n2);
        const { length: d2 } = r3 || i3 || { length: 1 };
        if (r3 && i3 && r3.length !== i3.length)
          throw new Error("Given keys array must have same length as given values array.");
        if (0 === d2)
          return a3({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
        let f2;
        const p2 = [], y2 = [];
        let m2 = 0;
        const v2 = (e6) => {
          ++m2, nn(e6);
        };
        if ("deleteRange" === n2) {
          if (4 === o3.type)
            return a3({ numFailures: m2, failures: y2, results: [], lastResult: void 0 });
          3 === o3.type ? p2.push(f2 = l2.clear()) : p2.push(f2 = l2.delete(s2(o3)));
        } else {
          const [e6, t4] = h2 ? c2 ? [i3, r3] : [i3, null] : [r3, null];
          if (h2)
            for (let r4 = 0; r4 < d2; ++r4)
              p2.push(f2 = t4 && void 0 !== t4[r4] ? l2[n2](e6[r4], t4[r4]) : l2[n2](e6[r4])), f2.onerror = v2;
          else
            for (let t5 = 0; t5 < d2; ++t5)
              p2.push(f2 = l2[n2](e6[t5])), f2.onerror = v2;
        }
        const g2 = (e6) => {
          const t4 = e6.target.result;
          p2.forEach((e7, t5) => null != e7.error && (y2[t5] = e7.error)), a3({ numFailures: m2, failures: y2, results: "delete" === n2 ? r3 : p2.map((e7) => e7.result), lastResult: t4 });
        };
        f2.onerror = (e6) => {
          v2(e6), g2(e6);
        }, f2.onsuccess = g2;
      });
    }, getMany: ({ trans: e5, keys: n2 }) => new Promise((r3, s3) => {
      r3 = Ye(r3);
      const i3 = e5.objectStore(t3), o3 = n2.length, a3 = new Array(o3);
      let u3, l2 = 0, c2 = 0;
      const h2 = (e6) => {
        const t4 = e6.target;
        a3[t4._pos] = t4.result, ++c2 === l2 && r3(a3);
      }, d2 = tn(s3);
      for (let e6 = 0; e6 < o3; ++e6)
        null != n2[e6] && (u3 = i3.get(n2[e6]), u3._pos = e6, u3.onsuccess = h2, u3.onerror = d2, ++l2);
      0 === l2 && r3(a3);
    }), get: ({ trans: e5, key: n2 }) => new Promise((r3, s3) => {
      r3 = Ye(r3);
      const i3 = e5.objectStore(t3).get(n2);
      i3.onsuccess = (e6) => r3(e6.target.result), i3.onerror = tn(s3);
    }), query: function(e5) {
      return (n2) => new Promise((r3, i3) => {
        r3 = Ye(r3);
        const { trans: o3, values: a3, limit: u3, query: l2 } = n2, c2 = u3 === 1 / 0 ? void 0 : u3, { index: h2, range: d2 } = l2, f2 = o3.objectStore(t3), p2 = h2.isPrimaryKey ? f2 : f2.index(h2.name), y2 = s2(d2);
        if (0 === u3)
          return r3({ result: [] });
        if (e5) {
          const e6 = a3 ? p2.getAll(y2, c2) : p2.getAllKeys(y2, c2);
          e6.onsuccess = (e7) => r3({ result: e7.target.result }), e6.onerror = tn(i3);
        } else {
          let e6 = 0;
          const t4 = a3 || !("openKeyCursor" in p2) ? p2.openCursor(y2) : p2.openKeyCursor(y2), n3 = [];
          t4.onsuccess = (s3) => {
            const i4 = t4.result;
            return i4 ? (n3.push(a3 ? i4.value : i4.primaryKey), ++e6 === u3 ? r3({ result: n3 }) : void i4.continue()) : r3({ result: n3 });
          }, t4.onerror = tn(i3);
        }
      });
    }(o2), openCursor: function({ trans: e5, values: n2, query: r3, reverse: i3, unique: o3 }) {
      return new Promise((a3, u3) => {
        a3 = Ye(a3);
        const { index: l2, range: c2 } = r3, h2 = e5.objectStore(t3), d2 = l2.isPrimaryKey ? h2 : h2.index(l2.name), f2 = i3 ? o3 ? "prevunique" : "prev" : o3 ? "nextunique" : "next", p2 = n2 || !("openKeyCursor" in d2) ? d2.openCursor(s2(c2), f2) : d2.openKeyCursor(s2(c2), f2);
        p2.onerror = tn(u3), p2.onsuccess = Ye((t4) => {
          const n3 = p2.result;
          if (!n3)
            return void a3(null);
          n3.___id = ++pn, n3.done = false;
          const r4 = n3.continue.bind(n3);
          let s3 = n3.continuePrimaryKey;
          s3 && (s3 = s3.bind(n3));
          const i4 = n3.advance.bind(n3), o4 = () => {
            throw new Error("Cursor not stopped");
          };
          n3.trans = e5, n3.stop = n3.continue = n3.continuePrimaryKey = n3.advance = () => {
            throw new Error("Cursor not started");
          }, n3.fail = Ye(u3), n3.next = function() {
            let e6 = 1;
            return this.start(() => e6-- ? this.continue() : this.stop()).then(() => this);
          }, n3.start = (e6) => {
            const t5 = new Promise((e7, t6) => {
              e7 = Ye(e7), p2.onerror = tn(t6), n3.fail = t6, n3.stop = (t7) => {
                n3.stop = n3.continue = n3.continuePrimaryKey = n3.advance = o4, e7(t7);
              };
            }), a4 = () => {
              if (p2.result)
                try {
                  e6();
                } catch (e7) {
                  n3.fail(e7);
                }
              else
                n3.done = true, n3.start = () => {
                  throw new Error("Cursor behind last entry");
                }, n3.stop();
            };
            return p2.onsuccess = Ye((e7) => {
              p2.onsuccess = a4, a4();
            }), n3.continue = r4, n3.continuePrimaryKey = s3, n3.advance = i4, a4(), t5;
          }, a3(n3);
        }, u3);
      });
    }, count({ query: e5, trans: n2 }) {
      const { index: r3, range: i3 } = e5;
      return new Promise((e6, o3) => {
        const a3 = n2.objectStore(t3), u3 = r3.isPrimaryKey ? a3 : a3.index(r3.name), l2 = s2(i3), c2 = l2 ? u3.count(l2) : u3.count();
        c2.onsuccess = Ye((t4) => e6(t4.target.result)), c2.onerror = tn(o3);
      });
    } };
  }(e3)), u2 = {};
  return a2.forEach((e3) => u2[e3.name] = e3), { stack: "dbcore", transaction: e2.transaction.bind(e2), table(e3) {
    if (!u2[e3])
      throw new Error(`Table '${e3}' not found`);
    return u2[e3];
  }, MIN_KEY: -1 / 0, MAX_KEY: hn(t2), schema: i2 };
}
function vn({ _novip: e2 }, t2) {
  const n2 = t2.db, r2 = function(e3, t3, { IDBKeyRange: n3, indexedDB: r3 }, s2) {
    const i2 = function(e4, t4) {
      return t4.reduce((e5, { create: t5 }) => ({ ...e5, ...t5(e5) }), e4);
    }(mn(t3, n3, s2), e3.dbcore);
    return { dbcore: i2 };
  }(e2._middlewares, n2, e2._deps, t2);
  e2.core = r2.dbcore, e2.tables.forEach((t3) => {
    const n3 = t3.name;
    e2.core.schema.tables.some((e3) => e3.name === n3) && (t3.core = e2.core.table(n3), e2[n3] instanceof e2.Table && (e2[n3].core = t3.core));
  });
}
function gn({ _novip: e2 }, t2, n2, r2) {
  n2.forEach((n3) => {
    const s2 = r2[n3];
    t2.forEach((t3) => {
      const r3 = d(t3, n3);
      (!r3 || "value" in r3 && void 0 === r3.value) && (t3 === e2.Transaction.prototype || t3 instanceof e2.Transaction ? l$1(t3, n3, { get() {
        return this.table(n3);
      }, set(e3) {
        u(this, n3, { value: e3, writable: true, configurable: true, enumerable: true });
      } }) : t3[n3] = new e2.Table(n3, s2));
    });
  });
}
function bn({ _novip: e2 }, t2) {
  t2.forEach((t3) => {
    for (let n2 in t3)
      t3[n2] instanceof e2.Table && delete t3[n2];
  });
}
function _n(e2, t2) {
  return e2._cfg.version - t2._cfg.version;
}
function wn(e2, n2, r2, s2) {
  const i2 = e2._dbSchema, o2 = e2._createTransaction("readwrite", e2._storeNames, i2);
  o2.create(r2), o2._completion.catch(s2);
  const a2 = o2._reject.bind(o2), u2 = Oe.transless || Oe;
  Ze(() => {
    Oe.trans = o2, Oe.transless = u2, 0 === n2 ? (t$1(i2).forEach((e3) => {
      kn(r2, e3, i2[e3].primKey, i2[e3].indexes);
    }), vn(e2, r2), je.follow(() => e2.on.populate.fire(o2)).catch(a2)) : function({ _novip: e3 }, n3, r3, s3) {
      const i3 = [], o3 = e3._versions;
      let a3 = e3._dbSchema = Pn(e3, e3.idbdb, s3), u3 = false;
      const l2 = o3.filter((e4) => e4._cfg.version >= n3);
      function c2() {
        return i3.length ? je.resolve(i3.shift()(r3.idbtrans)).then(c2) : je.resolve();
      }
      return l2.forEach((o4) => {
        i3.push(() => {
          const i4 = a3, l3 = o4._cfg.dbschema;
          Kn(e3, i4, s3), Kn(e3, l3, s3), a3 = e3._dbSchema = l3;
          const c3 = xn(i4, l3);
          c3.add.forEach((e4) => {
            kn(s3, e4[0], e4[1].primKey, e4[1].indexes);
          }), c3.change.forEach((e4) => {
            if (e4.recreate)
              throw new X.Upgrade("Not yet support for changing primary key");
            {
              const t2 = s3.objectStore(e4.name);
              e4.add.forEach((e5) => En(t2, e5)), e4.change.forEach((e5) => {
                t2.deleteIndex(e5.name), En(t2, e5);
              }), e4.del.forEach((e5) => t2.deleteIndex(e5));
            }
          });
          const h2 = o4._cfg.contentUpgrade;
          if (h2 && o4._cfg.version > n3) {
            vn(e3, s3), r3._memoizedTables = {}, u3 = true;
            let n4 = w(l3);
            c3.del.forEach((e4) => {
              n4[e4] = i4[e4];
            }), bn(e3, [e3.Transaction.prototype]), gn(e3, [e3.Transaction.prototype], t$1(n4), n4), r3.schema = n4;
            const o5 = T(h2);
            let a4;
            o5 && et();
            const d2 = je.follow(() => {
              if (a4 = h2(r3), a4 && o5) {
                var e4 = tt.bind(null, null);
                a4.then(e4, e4);
              }
            });
            return a4 && "function" == typeof a4.then ? je.resolve(a4) : d2.then(() => a4);
          }
        }), i3.push((t2) => {
          if (!u3 || !xt) {
            !function(e4, t3) {
              [].slice.call(t3.db.objectStoreNames).forEach((n4) => null == e4[n4] && t3.db.deleteObjectStore(n4));
            }(o4._cfg.dbschema, t2);
          }
          bn(e3, [e3.Transaction.prototype]), gn(e3, [e3.Transaction.prototype], e3._storeNames, e3._dbSchema), r3.schema = e3._dbSchema;
        });
      }), c2().then(() => {
        var e4, n4;
        n4 = s3, t$1(e4 = a3).forEach((t2) => {
          n4.db.objectStoreNames.contains(t2) || kn(n4, t2, e4[t2].primKey, e4[t2].indexes);
        });
      });
    }(e2, n2, o2, r2).catch(a2);
  });
}
function xn(e2, t2) {
  const n2 = { del: [], add: [], change: [] };
  let r2;
  for (r2 in e2)
    t2[r2] || n2.del.push(r2);
  for (r2 in t2) {
    const s2 = e2[r2], i2 = t2[r2];
    if (s2) {
      const e3 = { name: r2, def: i2, recreate: false, del: [], add: [], change: [] };
      if ("" + (s2.primKey.keyPath || "") != "" + (i2.primKey.keyPath || "") || s2.primKey.auto !== i2.primKey.auto && !wt)
        e3.recreate = true, n2.change.push(e3);
      else {
        const t3 = s2.idxByName, r3 = i2.idxByName;
        let o2;
        for (o2 in t3)
          r3[o2] || e3.del.push(o2);
        for (o2 in r3) {
          const n3 = t3[o2], s3 = r3[o2];
          n3 ? n3.src !== s3.src && e3.change.push(s3) : e3.add.push(s3);
        }
        (e3.del.length > 0 || e3.add.length > 0 || e3.change.length > 0) && n2.change.push(e3);
      }
    } else
      n2.add.push([r2, i2]);
  }
  return n2;
}
function kn(e2, t2, n2, r2) {
  const s2 = e2.db.createObjectStore(t2, n2.keyPath ? { keyPath: n2.keyPath, autoIncrement: n2.auto } : { autoIncrement: n2.auto });
  return r2.forEach((e3) => En(s2, e3)), s2;
}
function En(e2, t2) {
  e2.createIndex(t2.name, t2.keyPath, { unique: t2.unique, multiEntry: t2.multi });
}
function Pn(e2, t2, n2) {
  const r2 = {};
  return p(t2.objectStoreNames, 0).forEach((e3) => {
    const t3 = n2.objectStore(e3);
    let s2 = t3.keyPath;
    const i2 = un(ln(s2), s2 || "", false, false, !!t3.autoIncrement, s2 && "string" != typeof s2, true), o2 = [];
    for (let e4 = 0; e4 < t3.indexNames.length; ++e4) {
      const n3 = t3.index(t3.indexNames[e4]);
      s2 = n3.keyPath;
      var a2 = un(n3.name, s2, !!n3.unique, !!n3.multiEntry, false, s2 && "string" != typeof s2, false);
      o2.push(a2);
    }
    r2[e3] = cn(e3, i2, o2);
  }), r2;
}
function Kn({ _novip: t2 }, n2, r2) {
  const s2 = r2.db.objectStoreNames;
  for (let e2 = 0; e2 < s2.length; ++e2) {
    const i2 = s2[e2], o2 = r2.objectStore(i2);
    t2._hasGetAll = "getAll" in o2;
    for (let e3 = 0; e3 < o2.indexNames.length; ++e3) {
      const t3 = o2.indexNames[e3], r3 = o2.index(t3).keyPath, s3 = "string" == typeof r3 ? r3 : "[" + p(r3).join("+") + "]";
      if (n2[i2]) {
        const e4 = n2[i2].idxByName[s3];
        e4 && (e4.name = t3, delete n2[i2].idxByName[s3], n2[i2].idxByName[t3] = e4);
      }
    }
  }
  "undefined" != typeof navigator && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && e.WorkerGlobalScope && e instanceof e.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (t2._hasGetAll = false);
}
class On {
  _parseStoresSpec(e2, r2) {
    t$1(e2).forEach((t2) => {
      if (null !== e2[t2]) {
        var s2 = e2[t2].split(",").map((e3, t3) => {
          const r3 = (e3 = e3.trim()).replace(/([&*]|\+\+)/g, ""), s3 = /^\[/.test(r3) ? r3.match(/^\[(.*)\]$/)[1].split("+") : r3;
          return un(r3, s3 || null, /\&/.test(e3), /\*/.test(e3), /\+\+/.test(e3), n$1(s3), 0 === t3);
        }), i2 = s2.shift();
        if (i2.multi)
          throw new X.Schema("Primary key cannot be multi-valued");
        s2.forEach((e3) => {
          if (e3.auto)
            throw new X.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!e3.keyPath)
            throw new X.Schema("Index must have a name and cannot be an empty string");
        }), r2[t2] = cn(t2, i2, s2);
      }
    });
  }
  stores(e2) {
    const n2 = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? r(this._cfg.storesSource, e2) : e2;
    const s2 = n2._versions, i2 = {};
    let o2 = {};
    return s2.forEach((e3) => {
      r(i2, e3._cfg.storesSource), o2 = e3._cfg.dbschema = {}, e3._parseStoresSpec(i2, o2);
    }), n2._dbSchema = o2, bn(n2, [n2._allTables, n2, n2.Transaction.prototype]), gn(n2, [n2._allTables, n2, n2.Transaction.prototype, this._cfg.tables], t$1(o2), o2), n2._storeNames = t$1(o2), this;
  }
  upgrade(e2) {
    return this._cfg.contentUpgrade = ue(this._cfg.contentUpgrade || ee, e2), this;
  }
}
function Sn(e2, t2) {
  let n2 = e2._dbNamesDB;
  return n2 || (n2 = e2._dbNamesDB = new Xn(Pt, { addons: [], indexedDB: e2, IDBKeyRange: t2 }), n2.version(1).stores({ dbnames: "name" })), n2.table("dbnames");
}
function An(e2) {
  return e2 && "function" == typeof e2.databases;
}
function Cn(e2) {
  return Ze(function() {
    return Oe.letThrough = true, e2();
  });
}
function jn() {
  var e2;
  return !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent) && indexedDB.databases ? new Promise(function(t2) {
    var n2 = function() {
      return indexedDB.databases().finally(t2);
    };
    e2 = setInterval(n2, 100), n2();
  }).finally(function() {
    return clearInterval(e2);
  }) : Promise.resolve();
}
function Dn(e2) {
  const n2 = e2._state, { indexedDB: r2 } = e2._deps;
  if (n2.isBeingOpened || e2.idbdb)
    return n2.dbReadyPromise.then(() => n2.dbOpenError ? ft(n2.dbOpenError) : e2);
  R && (n2.openCanceller._stackHolder = q()), n2.isBeingOpened = true, n2.dbOpenError = null, n2.openComplete = false;
  const s2 = n2.openCanceller;
  function i2() {
    if (n2.openCanceller !== s2)
      throw new X.DatabaseClosed("db.open() was cancelled");
  }
  let o2 = n2.dbReadyResolve, a2 = null, u2 = false;
  const l2 = () => new je((s3, o3) => {
    if (i2(), !r2)
      throw new X.MissingAPI();
    const l3 = e2.name, c2 = n2.autoSchema ? r2.open(l3) : r2.open(l3, Math.round(10 * e2.verno));
    if (!c2)
      throw new X.MissingAPI();
    c2.onerror = tn(o3), c2.onblocked = Ye(e2._fireOnBlocked), c2.onupgradeneeded = Ye((t2) => {
      if (a2 = c2.transaction, n2.autoSchema && !e2._options.allowEmptyDB) {
        c2.onerror = nn, a2.abort(), c2.result.close();
        const e3 = r2.deleteDatabase(l3);
        e3.onsuccess = e3.onerror = Ye(() => {
          o3(new X.NoSuchDatabase(`Database ${l3} doesnt exist`));
        });
      } else {
        a2.onerror = tn(o3);
        var s4 = t2.oldVersion > Math.pow(2, 62) ? 0 : t2.oldVersion;
        u2 = s4 < 1, e2._novip.idbdb = c2.result, wn(e2, s4 / 10, a2, o3);
      }
    }, o3), c2.onsuccess = Ye(() => {
      a2 = null;
      const r3 = e2._novip.idbdb = c2.result, i3 = p(r3.objectStoreNames);
      if (i3.length > 0)
        try {
          const s4 = r3.transaction(1 === (o4 = i3).length ? o4[0] : o4, "readonly");
          n2.autoSchema ? function({ _novip: e3 }, n3, r4) {
            e3.verno = n3.version / 10;
            const s5 = e3._dbSchema = Pn(0, n3, r4);
            e3._storeNames = p(n3.objectStoreNames, 0), gn(e3, [e3._allTables], t$1(s5), s5);
          }(e2, r3, s4) : (Kn(e2, e2._dbSchema, s4), function(e3, t2) {
            const n3 = xn(Pn(0, e3.idbdb, t2), e3._dbSchema);
            return !(n3.add.length || n3.change.some((e4) => e4.add.length || e4.change.length));
          }(e2, s4) || console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.")), vn(e2, s4);
        } catch (e3) {
        }
      var o4;
      _t.push(e2), r3.onversionchange = Ye((t2) => {
        n2.vcFired = true, e2.on("versionchange").fire(t2);
      }), r3.onclose = Ye((t2) => {
        e2.on("close").fire(t2);
      }), u2 && function({ indexedDB: e3, IDBKeyRange: t2 }, n3) {
        !An(e3) && n3 !== Pt && Sn(e3, t2).put({ name: n3 }).catch(ee);
      }(e2._deps, l3), s3();
    }, o3);
  }).catch((e3) => e3 && "UnknownError" === e3.name && n2.PR1398_maxLoop > 0 ? (n2.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), l2()) : je.reject(e3));
  return je.race([s2, ("undefined" == typeof navigator ? je.resolve() : jn()).then(l2)]).then(() => (i2(), n2.onReadyBeingFired = [], je.resolve(Cn(() => e2.on.ready.fire(e2.vip))).then(function t2() {
    if (n2.onReadyBeingFired.length > 0) {
      let r3 = n2.onReadyBeingFired.reduce(ue, ee);
      return n2.onReadyBeingFired = [], je.resolve(Cn(() => r3(e2.vip))).then(t2);
    }
  }))).finally(() => {
    n2.onReadyBeingFired = null, n2.isBeingOpened = false;
  }).then(() => e2).catch((t2) => {
    n2.dbOpenError = t2;
    try {
      a2 && a2.abort();
    } catch (e3) {
    }
    return s2 === n2.openCanceller && e2._close(), ft(t2);
  }).finally(() => {
    n2.openComplete = true, o2();
  });
}
function In(e2) {
  var t2 = (t3) => e2.next(t3), r2 = i2(t2), s2 = i2((t3) => e2.throw(t3));
  function i2(e3) {
    return (t3) => {
      var i3 = e3(t3), o2 = i3.value;
      return i3.done ? o2 : o2 && "function" == typeof o2.then ? o2.then(r2, s2) : n$1(o2) ? Promise.all(o2).then(r2, s2) : r2(o2);
    };
  }
  return i2(t2)();
}
function Bn(e2, t2, n2) {
  var r2 = arguments.length;
  if (r2 < 2)
    throw new X.InvalidArgument("Too few arguments");
  for (var s2 = new Array(r2 - 1); --r2; )
    s2[r2 - 1] = arguments[r2];
  return n2 = s2.pop(), [e2, k(s2), n2];
}
function Tn(e2, t2, n2, r2, s2) {
  return je.resolve().then(() => {
    const i2 = Oe.transless || Oe, o2 = e2._createTransaction(t2, n2, e2._dbSchema, r2), a2 = { trans: o2, transless: i2 };
    if (r2)
      o2.idbtrans = r2.idbtrans;
    else
      try {
        o2.create(), e2._state.PR1398_maxLoop = 3;
      } catch (r3) {
        return r3.name === H.InvalidState && e2.isOpen() && --e2._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e2._close(), e2.open().then(() => Tn(e2, t2, n2, null, s2))) : ft(r3);
      }
    const u2 = T(s2);
    let l2;
    u2 && et();
    const c2 = je.follow(() => {
      if (l2 = s2.call(o2, o2), l2)
        if (u2) {
          var e3 = tt.bind(null, null);
          l2.then(e3, e3);
        } else
          "function" == typeof l2.next && "function" == typeof l2.throw && (l2 = In(l2));
    }, a2);
    return (l2 && "function" == typeof l2.then ? je.resolve(l2).then((e3) => o2.active ? e3 : ft(new X.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"))) : c2.then(() => l2)).then((e3) => (r2 && o2._resolve(), o2._completion.then(() => e3))).catch((e3) => (o2._reject(e3), ft(e3)));
  });
}
function Rn(e2, t2, r2) {
  const s2 = n$1(e2) ? e2.slice() : [e2];
  for (let e3 = 0; e3 < r2; ++e3)
    s2.push(t2);
  return s2;
}
const Fn = { stack: "dbcore", name: "VirtualIndexMiddleware", level: 1, create: function(e2) {
  return { ...e2, table(t2) {
    const n2 = e2.table(t2), { schema: r2 } = n2, s2 = {}, i2 = [];
    function o2(e3, t3, n3) {
      const r3 = yn(e3), a3 = s2[r3] = s2[r3] || [], u3 = null == e3 ? 0 : "string" == typeof e3 ? 1 : e3.length, l3 = t3 > 0, c2 = { ...n3, isVirtual: l3, keyTail: t3, keyLength: u3, extractKey: dn(e3), unique: !l3 && n3.unique };
      if (a3.push(c2), c2.isPrimaryKey || i2.push(c2), u3 > 1) {
        o2(2 === u3 ? e3[0] : e3.slice(0, u3 - 1), t3 + 1, n3);
      }
      return a3.sort((e4, t4) => e4.keyTail - t4.keyTail), c2;
    }
    const a2 = o2(r2.primaryKey.keyPath, 0, r2.primaryKey);
    s2[":id"] = [a2];
    for (const e3 of r2.indexes)
      o2(e3.keyPath, 0, e3);
    function u2(t3) {
      const n3 = t3.query.index;
      return n3.isVirtual ? { ...t3, query: { index: n3, range: (r3 = t3.query.range, s3 = n3.keyTail, { type: 1 === r3.type ? 2 : r3.type, lower: Rn(r3.lower, r3.lowerOpen ? e2.MAX_KEY : e2.MIN_KEY, s3), lowerOpen: true, upper: Rn(r3.upper, r3.upperOpen ? e2.MIN_KEY : e2.MAX_KEY, s3), upperOpen: true }) } } : t3;
      var r3, s3;
    }
    const l2 = { ...n2, schema: { ...r2, primaryKey: a2, indexes: i2, getIndexByKeyPath: function(e3) {
      const t3 = s2[yn(e3)];
      return t3 && t3[0];
    } }, count: (e3) => n2.count(u2(e3)), query: (e3) => n2.query(u2(e3)), openCursor(t3) {
      const { keyTail: r3, isVirtual: s3, keyLength: i3 } = t3.query.index;
      if (!s3)
        return n2.openCursor(t3);
      return n2.openCursor(u2(t3)).then((n3) => n3 && function(n4) {
        const s4 = Object.create(n4, { continue: { value: function(s5) {
          null != s5 ? n4.continue(Rn(s5, t3.reverse ? e2.MAX_KEY : e2.MIN_KEY, r3)) : t3.unique ? n4.continue(n4.key.slice(0, i3).concat(t3.reverse ? e2.MIN_KEY : e2.MAX_KEY, r3)) : n4.continue();
        } }, continuePrimaryKey: { value(t4, s5) {
          n4.continuePrimaryKey(Rn(t4, e2.MAX_KEY, r3), s5);
        } }, primaryKey: { get: () => n4.primaryKey }, key: { get() {
          const e3 = n4.key;
          return 1 === i3 ? e3[0] : e3.slice(0, i3);
        } }, value: { get: () => n4.value } });
        return s4;
      }(n3));
    } };
    return l2;
  } };
} };
function Mn(e2, n2, r2, s2) {
  return r2 = r2 || {}, s2 = s2 || "", t$1(e2).forEach((t2) => {
    if (o(n2, t2)) {
      var i2 = e2[t2], a2 = n2[t2];
      if ("object" == typeof i2 && "object" == typeof a2 && i2 && a2) {
        const e3 = C(i2);
        e3 !== C(a2) ? r2[s2 + t2] = n2[t2] : "Object" === e3 ? Mn(i2, a2, r2, s2 + t2 + ".") : i2 !== a2 && (r2[s2 + t2] = n2[t2]);
      } else
        i2 !== a2 && (r2[s2 + t2] = n2[t2]);
    } else
      r2[s2 + t2] = void 0;
  }), t$1(n2).forEach((t2) => {
    o(e2, t2) || (r2[s2 + t2] = n2[t2]);
  }), r2;
}
const Nn = { stack: "dbcore", name: "HooksMiddleware", level: 2, create: (e2) => ({ ...e2, table(t2) {
  const n2 = e2.table(t2), { primaryKey: r2 } = n2.schema, s2 = { ...n2, mutate(e3) {
    const s3 = Oe.trans, { deleting: i2, creating: a2, updating: u2 } = s3.table(t2).hook;
    switch (e3.type) {
      case "add":
        if (a2.fire === ee)
          break;
        return s3._promise("readwrite", () => l2(e3), true);
      case "put":
        if (a2.fire === ee && u2.fire === ee)
          break;
        return s3._promise("readwrite", () => l2(e3), true);
      case "delete":
        if (i2.fire === ee)
          break;
        return s3._promise("readwrite", () => l2(e3), true);
      case "deleteRange":
        if (i2.fire === ee)
          break;
        return s3._promise("readwrite", () => function(e4) {
          return c2(e4.trans, e4.range, 1e4);
        }(e3), true);
    }
    return n2.mutate(e3);
    function l2(e4) {
      const t3 = Oe.trans, s4 = e4.keys || function(e5, t4) {
        return "delete" === t4.type ? t4.keys : t4.keys || t4.values.map(e5.extractKey);
      }(r2, e4);
      if (!s4)
        throw new Error("Keys missing");
      return "delete" !== (e4 = "add" === e4.type || "put" === e4.type ? { ...e4, keys: s4 } : { ...e4 }).type && (e4.values = [...e4.values]), e4.keys && (e4.keys = [...e4.keys]), function(e5, t4, n3) {
        return "add" === t4.type ? Promise.resolve([]) : e5.getMany({ trans: t4.trans, keys: n3, cache: "immutable" });
      }(n2, e4, s4).then((l3) => {
        const c3 = s4.map((n3, s5) => {
          const c4 = l3[s5], h2 = { onerror: null, onsuccess: null };
          if ("delete" === e4.type)
            i2.fire.call(h2, n3, c4, t3);
          else if ("add" === e4.type || void 0 === c4) {
            const i3 = a2.fire.call(h2, n3, e4.values[s5], t3);
            null == n3 && null != i3 && (n3 = i3, e4.keys[s5] = n3, r2.outbound || _(e4.values[s5], r2.keyPath, n3));
          } else {
            const r3 = Mn(c4, e4.values[s5]), i3 = u2.fire.call(h2, r3, n3, c4, t3);
            if (i3) {
              const t4 = e4.values[s5];
              Object.keys(i3).forEach((e5) => {
                o(t4, e5) ? t4[e5] = i3[e5] : _(t4, e5, i3[e5]);
              });
            }
          }
          return h2;
        });
        return n2.mutate(e4).then(({ failures: t4, results: n3, numFailures: r3, lastResult: i3 }) => {
          for (let r4 = 0; r4 < s4.length; ++r4) {
            const i4 = n3 ? n3[r4] : s4[r4], o2 = c3[r4];
            null == i4 ? o2.onerror && o2.onerror(t4[r4]) : o2.onsuccess && o2.onsuccess("put" === e4.type && l3[r4] ? e4.values[r4] : i4);
          }
          return { failures: t4, results: n3, numFailures: r3, lastResult: i3 };
        }).catch((e5) => (c3.forEach((t4) => t4.onerror && t4.onerror(e5)), Promise.reject(e5)));
      });
    }
    function c2(e4, t3, s4) {
      return n2.query({ trans: e4, values: false, query: { index: r2, range: t3 }, limit: s4 }).then(({ result: n3 }) => l2({ type: "delete", keys: n3, trans: e4 }).then((r3) => r3.numFailures > 0 ? Promise.reject(r3.failures[0]) : n3.length < s4 ? { failures: [], numFailures: 0, lastResult: void 0 } : c2(e4, { ...t3, lower: n3[n3.length - 1], lowerOpen: true }, s4)));
    }
  } };
  return s2;
} }) };
function qn(e2, t2, n2) {
  try {
    if (!t2)
      return null;
    if (t2.keys.length < e2.length)
      return null;
    const r2 = [];
    for (let s2 = 0, i2 = 0; s2 < t2.keys.length && i2 < e2.length; ++s2)
      0 === $t(t2.keys[s2], e2[i2]) && (r2.push(n2 ? O(t2.values[s2]) : t2.values[s2]), ++i2);
    return r2.length === e2.length ? r2 : null;
  } catch (e3) {
    return null;
  }
}
const $n = { stack: "dbcore", level: -1, create: (e2) => ({ table: (t2) => {
  const n2 = e2.table(t2);
  return { ...n2, getMany: (e3) => {
    if (!e3.cache)
      return n2.getMany(e3);
    const t3 = qn(e3.keys, e3.trans._cache, "clone" === e3.cache);
    return t3 ? je.resolve(t3) : n2.getMany(e3).then((t4) => (e3.trans._cache = { keys: e3.keys, values: "clone" === e3.cache ? O(t4) : t4 }, t4));
  }, mutate: (e3) => ("add" !== e3.type && (e3.trans._cache = null), n2.mutate(e3)) };
} }) };
function Un(e2) {
  return !("from" in e2);
}
const Ln = function(e2, t2) {
  if (!this) {
    const t3 = new Ln();
    return e2 && "d" in e2 && r(t3, e2), t3;
  }
  r(this, arguments.length ? { d: 1, from: e2, to: arguments.length > 1 ? t2 : e2 } : { d: 0 });
};
function Vn(e2, t2, n2) {
  const s2 = $t(t2, n2);
  if (isNaN(s2))
    return;
  if (s2 > 0)
    throw RangeError();
  if (Un(e2))
    return r(e2, { from: t2, to: n2, d: 1 });
  const i2 = e2.l, o2 = e2.r;
  if ($t(n2, e2.from) < 0)
    return i2 ? Vn(i2, t2, n2) : e2.l = { from: t2, to: n2, d: 1, l: null, r: null }, Gn(e2);
  if ($t(t2, e2.to) > 0)
    return o2 ? Vn(o2, t2, n2) : e2.r = { from: t2, to: n2, d: 1, l: null, r: null }, Gn(e2);
  $t(t2, e2.from) < 0 && (e2.from = t2, e2.l = null, e2.d = o2 ? o2.d + 1 : 1), $t(n2, e2.to) > 0 && (e2.to = n2, e2.r = null, e2.d = e2.l ? e2.l.d + 1 : 1);
  const a2 = !e2.r;
  i2 && !e2.l && Wn(e2, i2), o2 && a2 && Wn(e2, o2);
}
function Wn(e2, t2) {
  Un(t2) || function e3(t3, { from: n2, to: r2, l: s2, r: i2 }) {
    Vn(t3, n2, r2), s2 && e3(t3, s2), i2 && e3(t3, i2);
  }(e2, t2);
}
function Yn(e2, t2) {
  const n2 = zn(t2);
  let r2 = n2.next();
  if (r2.done)
    return false;
  let s2 = r2.value;
  const i2 = zn(e2);
  let o2 = i2.next(s2.from), a2 = o2.value;
  for (; !r2.done && !o2.done; ) {
    if ($t(a2.from, s2.to) <= 0 && $t(a2.to, s2.from) >= 0)
      return true;
    $t(s2.from, a2.from) < 0 ? s2 = (r2 = n2.next(a2.from)).value : a2 = (o2 = i2.next(s2.from)).value;
  }
  return false;
}
function zn(e2) {
  let t2 = Un(e2) ? null : { s: 0, n: e2 };
  return { next(e3) {
    const n2 = arguments.length > 0;
    for (; t2; )
      switch (t2.s) {
        case 0:
          if (t2.s = 1, n2)
            for (; t2.n.l && $t(e3, t2.n.from) < 0; )
              t2 = { up: t2, n: t2.n.l, s: 1 };
          else
            for (; t2.n.l; )
              t2 = { up: t2, n: t2.n.l, s: 1 };
        case 1:
          if (t2.s = 2, !n2 || $t(e3, t2.n.to) <= 0)
            return { value: t2.n, done: false };
        case 2:
          if (t2.n.r) {
            t2.s = 3, t2 = { up: t2, n: t2.n.r, s: 0 };
            continue;
          }
        case 3:
          t2 = t2.up;
      }
    return { done: true };
  } };
}
function Gn(e2) {
  var t2, n2;
  const r2 = ((null === (t2 = e2.r) || void 0 === t2 ? void 0 : t2.d) || 0) - ((null === (n2 = e2.l) || void 0 === n2 ? void 0 : n2.d) || 0), s2 = r2 > 1 ? "r" : r2 < -1 ? "l" : "";
  if (s2) {
    const t3 = "r" === s2 ? "l" : "r", n3 = { ...e2 }, r3 = e2[s2];
    e2.from = r3.from, e2.to = r3.to, e2[s2] = r3[s2], n3[s2] = r3[t3], e2[t3] = n3, n3.d = Hn(n3);
  }
  e2.d = Hn(e2);
}
function Hn({ r: e2, l: t2 }) {
  return (e2 ? t2 ? Math.max(e2.d, t2.d) : e2.d : t2 ? t2.d : 0) + 1;
}
a$3(Ln.prototype, { add(e2) {
  return Wn(this, e2), this;
}, addKey(e2) {
  return Vn(this, e2, e2), this;
}, addKeys(e2) {
  return e2.forEach((e3) => Vn(this, e3, e3)), this;
}, [j]() {
  return zn(this);
} });
const Qn = { stack: "dbcore", level: 0, create: (e2) => {
  const r2 = e2.schema.name, s2 = new Ln(e2.MIN_KEY, e2.MAX_KEY);
  return { ...e2, table: (i2) => {
    const o2 = e2.table(i2), { schema: a2 } = o2, { primaryKey: u2 } = a2, { extractKey: l2, outbound: c2 } = u2, h2 = { ...o2, mutate: (e3) => {
      const t2 = e3.trans, u3 = t2.mutatedParts || (t2.mutatedParts = {}), l3 = (e4) => {
        const t3 = `idb://${r2}/${i2}/${e4}`;
        return u3[t3] || (u3[t3] = new Ln());
      }, c3 = l3(""), h3 = l3(":dels"), { type: d3 } = e3;
      let [f3, p2] = "deleteRange" === e3.type ? [e3.range] : "delete" === e3.type ? [e3.keys] : e3.values.length < 50 ? [[], e3.values] : [];
      const y2 = e3.trans._cache;
      return o2.mutate(e3).then((e4) => {
        if (n$1(f3)) {
          "delete" !== d3 && (f3 = e4.results), c3.addKeys(f3);
          const t3 = qn(f3, y2);
          t3 || "add" === d3 || h3.addKeys(f3), (t3 || p2) && function(e5, t4, r3, s3) {
            function i3(t5) {
              const i4 = e5(t5.name || "");
              function o3(e6) {
                return null != e6 ? t5.extractKey(e6) : null;
              }
              const a3 = (e6) => t5.multiEntry && n$1(e6) ? e6.forEach((e7) => i4.addKey(e7)) : i4.addKey(e6);
              (r3 || s3).forEach((e6, t6) => {
                const n2 = r3 && o3(r3[t6]), i5 = s3 && o3(s3[t6]);
                0 !== $t(n2, i5) && (null != n2 && a3(n2), null != i5 && a3(i5));
              });
            }
            t4.indexes.forEach(i3);
          }(l3, a2, t3, p2);
        } else if (f3) {
          const e5 = { from: f3.lower, to: f3.upper };
          h3.add(e5), c3.add(e5);
        } else
          c3.add(s2), h3.add(s2), a2.indexes.forEach((e5) => l3(e5.name).add(s2));
        return e4;
      });
    } }, d2 = ({ query: { index: t2, range: n2 } }) => {
      var r3, s3;
      return [t2, new Ln(null !== (r3 = n2.lower) && void 0 !== r3 ? r3 : e2.MIN_KEY, null !== (s3 = n2.upper) && void 0 !== s3 ? s3 : e2.MAX_KEY)];
    }, f2 = { get: (e3) => [u2, new Ln(e3.key)], getMany: (e3) => [u2, new Ln().addKeys(e3.keys)], count: d2, query: d2, openCursor: d2 };
    return t$1(f2).forEach((e3) => {
      h2[e3] = function(t2) {
        const { subscr: n2 } = Oe;
        if (n2) {
          const a3 = (e4) => {
            const t3 = `idb://${r2}/${i2}/${e4}`;
            return n2[t3] || (n2[t3] = new Ln());
          }, u3 = a3(""), h3 = a3(":dels"), [d3, p2] = f2[e3](t2);
          if (a3(d3.name || "").add(p2), !d3.isPrimaryKey) {
            if ("count" !== e3) {
              const n3 = "query" === e3 && c2 && t2.values && o2.query({ ...t2, values: false });
              return o2[e3].apply(this, arguments).then((r3) => {
                if ("query" === e3) {
                  if (c2 && t2.values)
                    return n3.then(({ result: e5 }) => (u3.addKeys(e5), r3));
                  const e4 = t2.values ? r3.result.map(l2) : r3.result;
                  t2.values ? u3.addKeys(e4) : h3.addKeys(e4);
                } else if ("openCursor" === e3) {
                  const e4 = r3, n4 = t2.values;
                  return e4 && Object.create(e4, { key: { get: () => (h3.addKey(e4.primaryKey), e4.key) }, primaryKey: { get() {
                    const t3 = e4.primaryKey;
                    return h3.addKey(t3), t3;
                  } }, value: { get: () => (n4 && u3.addKey(e4.primaryKey), e4.value) } });
                }
                return r3;
              });
            }
            h3.add(s2);
          }
        }
        return o2[e3].apply(this, arguments);
      };
    }), h2;
  } };
} };
class Xn {
  constructor(e2, t2) {
    this._middlewares = {}, this.verno = 0;
    const n2 = Xn.dependencies;
    this._options = t2 = { addons: Xn.addons, autoOpen: true, indexedDB: n2.indexedDB, IDBKeyRange: n2.IDBKeyRange, ...t2 }, this._deps = { indexedDB: t2.indexedDB, IDBKeyRange: t2.IDBKeyRange };
    const { addons: r2 } = t2;
    this._dbSchema = {}, this._versions = [], this._storeNames = [], this._allTables = {}, this.idbdb = null, this._novip = this;
    const s2 = { dbOpenError: null, isBeingOpened: false, onReadyBeingFired: null, openComplete: false, dbReadyResolve: ee, dbReadyPromise: null, cancelOpen: ee, openCanceller: null, autoSchema: true, PR1398_maxLoop: 3 };
    var i2;
    s2.dbReadyPromise = new je((e3) => {
      s2.dbReadyResolve = e3;
    }), s2.openCanceller = new je((e3, t3) => {
      s2.cancelOpen = t3;
    }), this._state = s2, this.name = e2, this.on = Dt(this, "populate", "blocked", "versionchange", "close", { ready: [ue, ee] }), this.on.ready.subscribe = y(this.on.ready.subscribe, (e3) => (t3, n3) => {
      Xn.vip(() => {
        const r3 = this._state;
        if (r3.openComplete)
          r3.dbOpenError || je.resolve().then(t3), n3 && e3(t3);
        else if (r3.onReadyBeingFired)
          r3.onReadyBeingFired.push(t3), n3 && e3(t3);
        else {
          e3(t3);
          const r4 = this;
          n3 || e3(function e4() {
            r4.on.ready.unsubscribe(t3), r4.on.ready.unsubscribe(e4);
          });
        }
      });
    }), this.Collection = (i2 = this, It(Vt.prototype, function(e3, t3) {
      this.db = i2;
      let n3 = At, r3 = null;
      if (t3)
        try {
          n3 = t3();
        } catch (e4) {
          r3 = e4;
        }
      const s3 = e3._ctx, o2 = s3.table, a2 = o2.hook.reading.fire;
      this._ctx = { table: o2, index: s3.index, isPrimKey: !s3.index || o2.schema.primKey.keyPath && s3.index === o2.schema.primKey.name, range: n3, keysOnly: false, dir: "next", unique: "", algorithm: null, filter: null, replayFilter: null, justLimit: true, isMatch: null, offset: 0, limit: 1 / 0, error: r3, or: s3.or, valueMapper: a2 !== te ? a2 : null };
    })), this.Table = function(e3) {
      return It(jt.prototype, function(t3, n3, r3) {
        this.db = e3, this._tx = r3, this.name = t3, this.schema = n3, this.hook = e3._allTables[t3] ? e3._allTables[t3].hook : Dt(null, { creating: [se, ee], reading: [ne, te], updating: [oe, ee], deleting: [ie, ee] });
      });
    }(this), this.Transaction = function(e3) {
      return It(an.prototype, function(t3, n3, r3, s3, i3) {
        this.db = e3, this.mode = t3, this.storeNames = n3, this.schema = r3, this.chromeTransactionDurability = s3, this.idbtrans = null, this.on = Dt(this, "complete", "error", "abort"), this.parent = i3 || null, this.active = true, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new je((e4, t4) => {
          this._resolve = e4, this._reject = t4;
        }), this._completion.then(() => {
          this.active = false, this.on.complete.fire();
        }, (e4) => {
          var t4 = this.active;
          return this.active = false, this.on.error.fire(e4), this.parent ? this.parent._reject(e4) : t4 && this.idbtrans && this.idbtrans.abort(), ft(e4);
        });
      });
    }(this), this.Version = function(e3) {
      return It(On.prototype, function(t3) {
        this.db = e3, this._cfg = { version: t3, storesSource: null, dbschema: {}, tables: {}, contentUpgrade: null };
      });
    }(this), this.WhereClause = function(e3) {
      return It(en.prototype, function(t3, n3, r3) {
        this.db = e3, this._ctx = { table: t3, index: ":id" === n3 ? null : n3, or: r3 };
        const s3 = e3._deps.indexedDB;
        if (!s3)
          throw new X.MissingAPI();
        this._cmp = this._ascending = s3.cmp.bind(s3), this._descending = (e4, t4) => s3.cmp(t4, e4), this._max = (e4, t4) => s3.cmp(e4, t4) > 0 ? e4 : t4, this._min = (e4, t4) => s3.cmp(e4, t4) < 0 ? e4 : t4, this._IDBKeyRange = e3._deps.IDBKeyRange;
      });
    }(this), this.on("versionchange", (e3) => {
      e3.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${this.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${this.name}'. Closing db now to resume the delete request.`), this.close();
    }), this.on("blocked", (e3) => {
      !e3.newVersion || e3.newVersion < e3.oldVersion ? console.warn(`Dexie.delete('${this.name}') was blocked`) : console.warn(`Upgrade '${this.name}' blocked by other connection holding version ${e3.oldVersion / 10}`);
    }), this._maxKey = hn(t2.IDBKeyRange), this._createTransaction = (e3, t3, n3, r3) => new this.Transaction(e3, t3, n3, this._options.chromeTransactionDurability, r3), this._fireOnBlocked = (e3) => {
      this.on("blocked").fire(e3), _t.filter((e4) => e4.name === this.name && e4 !== this && !e4._state.vcFired).map((t3) => t3.on("versionchange").fire(e3));
    }, this.use(Fn), this.use(Nn), this.use(Qn), this.use($n), this.vip = Object.create(this, { _vip: { value: true } }), r2.forEach((e3) => e3(this));
  }
  version(e2) {
    if (isNaN(e2) || e2 < 0.1)
      throw new X.Type("Given version is not a positive number");
    if (e2 = Math.round(10 * e2) / 10, this.idbdb || this._state.isBeingOpened)
      throw new X.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, e2);
    const t2 = this._versions;
    var n2 = t2.filter((t3) => t3._cfg.version === e2)[0];
    return n2 || (n2 = new this.Version(e2), t2.push(n2), t2.sort(_n), n2.stores({}), this._state.autoSchema = false, n2);
  }
  _whenReady(e2) {
    return this.idbdb && (this._state.openComplete || Oe.letThrough || this._vip) ? e2() : new je((e3, t2) => {
      if (this._state.openComplete)
        return t2(new X.DatabaseClosed(this._state.dbOpenError));
      if (!this._state.isBeingOpened) {
        if (!this._options.autoOpen)
          return void t2(new X.DatabaseClosed());
        this.open().catch(ee);
      }
      this._state.dbReadyPromise.then(e3, t2);
    }).then(e2);
  }
  use({ stack: e2, create: t2, level: n2, name: r2 }) {
    r2 && this.unuse({ stack: e2, name: r2 });
    const s2 = this._middlewares[e2] || (this._middlewares[e2] = []);
    return s2.push({ stack: e2, create: t2, level: null == n2 ? 10 : n2, name: r2 }), s2.sort((e3, t3) => e3.level - t3.level), this;
  }
  unuse({ stack: e2, name: t2, create: n2 }) {
    return e2 && this._middlewares[e2] && (this._middlewares[e2] = this._middlewares[e2].filter((e3) => n2 ? e3.create !== n2 : !!t2 && e3.name !== t2)), this;
  }
  open() {
    return Dn(this);
  }
  _close() {
    const e2 = this._state, t2 = _t.indexOf(this);
    if (t2 >= 0 && _t.splice(t2, 1), this.idbdb) {
      try {
        this.idbdb.close();
      } catch (e3) {
      }
      this._novip.idbdb = null;
    }
    e2.dbReadyPromise = new je((t3) => {
      e2.dbReadyResolve = t3;
    }), e2.openCanceller = new je((t3, n2) => {
      e2.cancelOpen = n2;
    });
  }
  close() {
    this._close();
    const e2 = this._state;
    this._options.autoOpen = false, e2.dbOpenError = new X.DatabaseClosed(), e2.isBeingOpened && e2.cancelOpen(e2.dbOpenError);
  }
  delete() {
    const e2 = arguments.length > 0, t2 = this._state;
    return new je((n2, r2) => {
      const s2 = () => {
        this.close();
        var e3 = this._deps.indexedDB.deleteDatabase(this.name);
        e3.onsuccess = Ye(() => {
          !function({ indexedDB: e4, IDBKeyRange: t3 }, n3) {
            !An(e4) && n3 !== Pt && Sn(e4, t3).delete(n3).catch(ee);
          }(this._deps, this.name), n2();
        }), e3.onerror = tn(r2), e3.onblocked = this._fireOnBlocked;
      };
      if (e2)
        throw new X.InvalidArgument("Arguments not allowed in db.delete()");
      t2.isBeingOpened ? t2.dbReadyPromise.then(s2) : s2();
    });
  }
  backendDB() {
    return this.idbdb;
  }
  isOpen() {
    return null !== this.idbdb;
  }
  hasBeenClosed() {
    const e2 = this._state.dbOpenError;
    return e2 && "DatabaseClosed" === e2.name;
  }
  hasFailed() {
    return null !== this._state.dbOpenError;
  }
  dynamicallyOpened() {
    return this._state.autoSchema;
  }
  get tables() {
    return t$1(this._allTables).map((e2) => this._allTables[e2]);
  }
  transaction() {
    const e2 = Bn.apply(this, arguments);
    return this._transaction.apply(this, e2);
  }
  _transaction(e2, t2, n2) {
    let r2 = Oe.trans;
    r2 && r2.db === this && -1 === e2.indexOf("!") || (r2 = null);
    const s2 = -1 !== e2.indexOf("?");
    let i2, o2;
    e2 = e2.replace("!", "").replace("?", "");
    try {
      if (o2 = t2.map((e3) => {
        var t3 = e3 instanceof this.Table ? e3.name : e3;
        if ("string" != typeof t3)
          throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return t3;
      }), "r" == e2 || e2 === Kt)
        i2 = Kt;
      else {
        if ("rw" != e2 && e2 != Ot)
          throw new X.InvalidArgument("Invalid transaction mode: " + e2);
        i2 = Ot;
      }
      if (r2) {
        if (r2.mode === Kt && i2 === Ot) {
          if (!s2)
            throw new X.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
          r2 = null;
        }
        r2 && o2.forEach((e3) => {
          if (r2 && -1 === r2.storeNames.indexOf(e3)) {
            if (!s2)
              throw new X.SubTransaction("Table " + e3 + " not included in parent transaction.");
            r2 = null;
          }
        }), s2 && r2 && !r2.active && (r2 = null);
      }
    } catch (e3) {
      return r2 ? r2._promise(null, (t3, n3) => {
        n3(e3);
      }) : ft(e3);
    }
    const a2 = Tn.bind(null, this, i2, o2, r2, n2);
    return r2 ? r2._promise(i2, a2, "lock") : Oe.trans ? at(Oe.transless, () => this._whenReady(a2)) : this._whenReady(a2);
  }
  table(e2) {
    if (!o(this._allTables, e2))
      throw new X.InvalidTable(`Table ${e2} does not exist`);
    return this._allTables[e2];
  }
}
const Jn = "undefined" != typeof Symbol && "observable" in Symbol ? Symbol.observable : "@@observable";
class Zn {
  constructor(e2) {
    this._subscribe = e2;
  }
  subscribe(e2, t2, n2) {
    return this._subscribe(e2 && "function" != typeof e2 ? e2 : { next: e2, error: t2, complete: n2 });
  }
  [Jn]() {
    return this;
  }
}
function er(e2, n2) {
  return t$1(n2).forEach((t2) => {
    Wn(e2[t2] || (e2[t2] = new Ln()), n2[t2]);
  }), e2;
}
function tr(e2) {
  let n2, r2 = false;
  const s2 = new Zn((s3) => {
    const i2 = T(e2);
    let o2 = false, a2 = {}, u2 = {};
    const l2 = { get closed() {
      return o2;
    }, unsubscribe: () => {
      o2 = true, on.storagemutated.unsubscribe(f2);
    } };
    s3.start && s3.start(l2);
    let c2 = false, h2 = false;
    function d2() {
      return t$1(u2).some((e3) => a2[e3] && Yn(a2[e3], u2[e3]));
    }
    const f2 = (e3) => {
      er(a2, e3), d2() && p2();
    }, p2 = () => {
      if (c2 || o2)
        return;
      a2 = {};
      const t2 = {}, y2 = function(t3) {
        i2 && et();
        const n3 = () => Ze(e2, { subscr: t3, trans: null }), r3 = Oe.trans ? at(Oe.transless, n3) : n3();
        return i2 && r3.then(tt, tt), r3;
      }(t2);
      h2 || (on(rn, f2), h2 = true), c2 = true, Promise.resolve(y2).then((e3) => {
        r2 = true, n2 = e3, c2 = false, o2 || (d2() ? p2() : (a2 = {}, u2 = t2, s3.next && s3.next(e3)));
      }, (e3) => {
        c2 = false, r2 = false, s3.error && s3.error(e3), l2.unsubscribe();
      });
    };
    return p2(), l2;
  });
  return s2.hasValue = () => r2, s2.getValue = () => n2, s2;
}
let nr;
try {
  nr = { indexedDB: e.indexedDB || e.mozIndexedDB || e.webkitIndexedDB || e.msIndexedDB, IDBKeyRange: e.IDBKeyRange || e.webkitIDBKeyRange };
} catch (e2) {
  nr = { indexedDB: null, IDBKeyRange: null };
}
const rr = Xn;
function sr(e2) {
  let t2 = ir;
  try {
    ir = true, on.storagemutated.fire(e2);
  } finally {
    ir = t2;
  }
}
a$3(rr, { ...Z, delete: (e2) => new rr(e2, { addons: [] }).delete(), exists: (e2) => new rr(e2, { addons: [] }).open().then((e3) => (e3.close(), true)).catch("NoSuchDatabaseError", () => false), getDatabaseNames(e2) {
  try {
    return function({ indexedDB: e3, IDBKeyRange: t2 }) {
      return An(e3) ? Promise.resolve(e3.databases()).then((e4) => e4.map((e5) => e5.name).filter((e5) => e5 !== Pt)) : Sn(e3, t2).toCollection().primaryKeys();
    }(rr.dependencies).then(e2);
  } catch (e3) {
    return ft(new X.MissingAPI());
  }
}, defineClass: () => function(e2) {
  r(this, e2);
}, ignoreTransaction: (e2) => Oe.trans ? at(Oe.transless, e2) : e2(), vip: Cn, async: function(e2) {
  return function() {
    try {
      var t2 = In(e2.apply(this, arguments));
      return t2 && "function" == typeof t2.then ? t2 : je.resolve(t2);
    } catch (e3) {
      return ft(e3);
    }
  };
}, spawn: function(e2, t2, n2) {
  try {
    var r2 = In(e2.apply(n2, t2 || []));
    return r2 && "function" == typeof r2.then ? r2 : je.resolve(r2);
  } catch (e3) {
    return ft(e3);
  }
}, currentTransaction: { get: () => Oe.trans || null }, waitFor: function(e2, t2) {
  const n2 = je.resolve("function" == typeof e2 ? rr.ignoreTransaction(e2) : e2).timeout(t2 || 6e4);
  return Oe.trans ? Oe.trans.waitFor(n2) : n2;
}, Promise: je, debug: { get: () => R, set: (e2) => {
  F(e2, "dexie" === e2 ? () => true : Et);
} }, derive: c, extend: r, props: a$3, override: y, Events: Dt, on, liveQuery: tr, extendObservabilitySet: er, getByKeyPath: b$1, setByKeyPath: _, delByKeyPath: function(e2, t2) {
  "string" == typeof t2 ? _(e2, t2, void 0) : "length" in t2 && [].map.call(t2, function(t3) {
    _(e2, t3, void 0);
  });
}, shallowClone: w, deepClone: O, getObjectDiff: Mn, cmp: $t, asap: v, minKey: vt, addons: [], connections: _t, errnames: H, dependencies: nr, semVer: yt, version: yt.split(".").map((e2) => parseInt(e2)).reduce((e2, t2, n2) => e2 + t2 / Math.pow(10, 2 * n2)) }), rr.maxKey = hn(rr.dependencies.IDBKeyRange), "undefined" != typeof dispatchEvent && "undefined" != typeof addEventListener && (on(rn, (e2) => {
  if (!ir) {
    let t2;
    wt ? (t2 = document.createEvent("CustomEvent"), t2.initCustomEvent(sn, true, true, e2)) : t2 = new CustomEvent(sn, { detail: e2 }), ir = true, dispatchEvent(t2), ir = false;
  }
}), addEventListener(sn, ({ detail: e2 }) => {
  ir || sr(e2);
}));
let ir = false;
if ("undefined" != typeof BroadcastChannel) {
  const e2 = new BroadcastChannel(sn);
  "function" == typeof e2.unref && e2.unref(), on(rn, (t2) => {
    ir || e2.postMessage(t2);
  }), e2.onmessage = (e3) => {
    e3.data && sr(e3.data);
  };
} else if ("undefined" != typeof self && "undefined" != typeof navigator) {
  on(rn, (e3) => {
    try {
      ir || ("undefined" != typeof localStorage && localStorage.setItem(sn, JSON.stringify({ trig: Math.random(), changedParts: e3 })), "object" == typeof self.clients && [...self.clients.matchAll({ includeUncontrolled: true })].forEach((t2) => t2.postMessage({ type: sn, changedParts: e3 })));
    } catch (e4) {
    }
  }), "undefined" != typeof addEventListener && addEventListener("storage", (e3) => {
    if (e3.key === sn) {
      const t2 = JSON.parse(e3.newValue);
      t2 && sr(t2.changedParts);
    }
  });
  const e2 = self.document && navigator.serviceWorker;
  e2 && e2.addEventListener("message", function({ data: e3 }) {
    e3 && e3.type === sn && sr(e3.changedParts);
  });
}
je.rejectionMapper = function(e2, t2) {
  if (!e2 || e2 instanceof W || e2 instanceof TypeError || e2 instanceof SyntaxError || !e2.name || !J[e2.name])
    return e2;
  var n2 = new J[e2.name](t2 || e2.message, e2);
  return "stack" in e2 && l$1(n2, "stack", { get: function() {
    return this.inner.stack;
  } }), n2;
}, F(R, Et);
const BrowserDB = new Xn("Root");
BrowserDB.version(1).stores({
  sessions: `
    id,
    dateCreated,
    dateModified,
    data`,
  settings: `
    id,
    data
  `
});
class LuxonError extends Error {
}
class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}
class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}
class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}
class ConflictingSpecificationError extends LuxonError {
}
class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}
class InvalidArgumentError extends LuxonError {
}
class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}
const n = "numeric", s = "short", l = "long";
const DATE_SHORT = {
  year: n,
  month: n,
  day: n
};
const DATE_MED = {
  year: n,
  month: s,
  day: n
};
const DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s
};
const DATE_FULL = {
  year: n,
  month: l,
  day: n
};
const DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};
const TIME_SIMPLE = {
  hour: n,
  minute: n
};
const TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n
};
const TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
const TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
const TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hourCycle: "h23"
};
const TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23"
};
const TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s
};
const TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l
};
const DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n
};
const DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n
};
const DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n
};
const DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n
};
const DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n
};
const DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s
};
const DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
const DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l
};
const DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
class Zone {
  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type() {
    throw new ZoneIsAbstractError();
  }
  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name() {
    throw new ZoneIsAbstractError();
  }
  get ianaName() {
    return this.name;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal() {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, opts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  get isValid() {
    throw new ZoneIsAbstractError();
  }
}
let singleton$1 = null;
class SystemZone extends Zone {
  /**
   * Get a singleton instance of the local zone
   * @return {SystemZone}
   */
  static get instance() {
    if (singleton$1 === null) {
      singleton$1 = new SystemZone();
    }
    return singleton$1;
  }
  /** @override **/
  get type() {
    return "system";
  }
  /** @override **/
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale);
  }
  /** @override **/
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  /** @override **/
  equals(otherZone) {
    return otherZone.type === "system";
  }
  /** @override **/
  get isValid() {
    return true;
  }
}
let dtfCache = {};
function makeDTF(zone) {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      era: "short"
    });
  }
  return dtfCache[zone];
}
const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  era: 3,
  hour: 4,
  minute: 5,
  second: 6
};
function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted), [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
}
function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  const filled = [];
  for (let i2 = 0; i2 < formatted.length; i2++) {
    const { type, value } = formatted[i2];
    const pos = typeToPos[type];
    if (type === "era") {
      filled[pos] = value;
    } else if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}
let ianaZoneCache = {};
class IANAZone extends Zone {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }
    return ianaZoneCache[name];
  }
  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }
  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @deprecated This method returns false for some valid IANA names. Use isValidZone instead.
   * @return {boolean}
   */
  static isValidSpecifier(s2) {
    return this.isValidZone(s2);
  }
  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone) {
    if (!zone) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e2) {
      return false;
    }
  }
  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = IANAZone.isValidZone(name);
  }
  /** @override **/
  get type() {
    return "iana";
  }
  /** @override **/
  get name() {
    return this.zoneName;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale, this.name);
  }
  /** @override **/
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  offset(ts) {
    const date = new Date(ts);
    if (isNaN(date))
      return NaN;
    const dtf = makeDTF(this.name);
    let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
    if (adOrBc === "BC") {
      year = -Math.abs(year) + 1;
    }
    const adjustedHour = hour === 24 ? 0 : hour;
    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour: adjustedHour,
      minute,
      second,
      millisecond: 0
    });
    let asTS = +date;
    const over = asTS % 1e3;
    asTS -= over >= 0 ? over : 1e3 + over;
    return (asUTC - asTS) / (60 * 1e3);
  }
  /** @override **/
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  /** @override **/
  get isValid() {
    return this.valid;
  }
}
let intlLFCache = {};
function getCachedLF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlLFCache[key];
  if (!dtf) {
    dtf = new Intl.ListFormat(locString, opts);
    intlLFCache[key] = dtf;
  }
  return dtf;
}
let intlDTCache = {};
function getCachedDTF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
}
let intlNumCache = {};
function getCachedINF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache[key];
  if (!inf) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache[key] = inf;
  }
  return inf;
}
let intlRelCache = {};
function getCachedRTF(locString, opts = {}) {
  const { base, ...cacheKeyOpts } = opts;
  const key = JSON.stringify([locString, cacheKeyOpts]);
  let inf = intlRelCache[key];
  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache[key] = inf;
  }
  return inf;
}
let sysLocaleCache = null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else {
    sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
    return sysLocaleCache;
  }
}
let weekInfoCache = {};
function getCachedWeekInfo(locString) {
  let data = weekInfoCache[locString];
  if (!data) {
    const locale = new Intl.Locale(locString);
    data = "getWeekInfo" in locale ? locale.getWeekInfo() : locale.weekInfo;
    weekInfoCache[locString] = data;
  }
  return data;
}
function parseLocaleString(localeStr) {
  const xIndex = localeStr.indexOf("-x-");
  if (xIndex !== -1) {
    localeStr = localeStr.substring(0, xIndex);
  }
  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    let selectedStr;
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
      selectedStr = localeStr;
    } catch (e2) {
      const smaller = localeStr.substring(0, uIndex);
      options = getCachedDTF(smaller).resolvedOptions();
      selectedStr = smaller;
    }
    const { numberingSystem, calendar } = options;
    return [selectedStr, numberingSystem, calendar];
  }
}
function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (outputCalendar || numberingSystem) {
    if (!localeStr.includes("-u-")) {
      localeStr += "-u";
    }
    if (outputCalendar) {
      localeStr += `-ca-${outputCalendar}`;
    }
    if (numberingSystem) {
      localeStr += `-nu-${numberingSystem}`;
    }
    return localeStr;
  } else {
    return localeStr;
  }
}
function mapMonths(f2) {
  const ms = [];
  for (let i2 = 1; i2 <= 12; i2++) {
    const dt2 = DateTime.utc(2009, i2, 1);
    ms.push(f2(dt2));
  }
  return ms;
}
function mapWeekdays(f2) {
  const ms = [];
  for (let i2 = 1; i2 <= 7; i2++) {
    const dt2 = DateTime.utc(2016, 11, 13 + i2);
    ms.push(f2(dt2));
  }
  return ms;
}
function listStuff(loc, length, englishFn, intlFn) {
  const mode = loc.listingMode();
  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}
function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn";
  }
}
class PolyNumberFormatter {
  constructor(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;
    const { padTo, floor, ...otherOpts } = opts;
    if (!forceSimple || Object.keys(otherOpts).length > 0) {
      const intlOpts = { useGrouping: false, ...opts };
      if (opts.padTo > 0)
        intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }
  format(i2) {
    if (this.inf) {
      const fixed = this.floor ? Math.floor(i2) : i2;
      return this.inf.format(fixed);
    } else {
      const fixed = this.floor ? Math.floor(i2) : roundTo(i2, 3);
      return padStart(fixed, this.padTo);
    }
  }
}
class PolyDateFormatter {
  constructor(dt2, intl, opts) {
    this.opts = opts;
    this.originalZone = void 0;
    let z2 = void 0;
    if (this.opts.timeZone) {
      this.dt = dt2;
    } else if (dt2.zone.type === "fixed") {
      const gmtOffset = -1 * (dt2.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      if (dt2.offset !== 0 && IANAZone.create(offsetZ).valid) {
        z2 = offsetZ;
        this.dt = dt2;
      } else {
        z2 = "UTC";
        this.dt = dt2.offset === 0 ? dt2 : dt2.setZone("UTC").plus({ minutes: dt2.offset });
        this.originalZone = dt2.zone;
      }
    } else if (dt2.zone.type === "system") {
      this.dt = dt2;
    } else if (dt2.zone.type === "iana") {
      this.dt = dt2;
      z2 = dt2.zone.name;
    } else {
      z2 = "UTC";
      this.dt = dt2.setZone("UTC").plus({ minutes: dt2.offset });
      this.originalZone = dt2.zone;
    }
    const intlOpts = { ...this.opts };
    intlOpts.timeZone = intlOpts.timeZone || z2;
    this.dtf = getCachedDTF(intl, intlOpts);
  }
  format() {
    if (this.originalZone) {
      return this.formatToParts().map(({ value }) => value).join("");
    }
    return this.dtf.format(this.dt.toJSDate());
  }
  formatToParts() {
    const parts = this.dtf.formatToParts(this.dt.toJSDate());
    if (this.originalZone) {
      return parts.map((part) => {
        if (part.type === "timeZoneName") {
          const offsetName = this.originalZone.offsetName(this.dt.ts, {
            locale: this.dt.locale,
            format: this.opts.timeZoneName
          });
          return {
            ...part,
            value: offsetName
          };
        } else {
          return part;
        }
      });
    }
    return parts;
  }
  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
}
class PolyRelFormatter {
  constructor(intl, isEnglish, opts) {
    this.opts = { style: "long", ...opts };
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }
  format(count, unit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  }
  formatToParts(count, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  }
}
const fallbackWeekSettings = {
  firstDay: 1,
  minimalDays: 4,
  weekend: [6, 7]
};
class Locale {
  static fromOpts(opts) {
    return Locale.create(
      opts.locale,
      opts.numberingSystem,
      opts.outputCalendar,
      opts.weekSettings,
      opts.defaultToEN
    );
  }
  static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
    const specifiedLocale = locale || Settings$1.defaultLocale;
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings$1.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings$1.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings$1.defaultWeekSettings;
    return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }
  static resetCache() {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  }
  static fromObject({ locale, numberingSystem, outputCalendar, weekSettings } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
  }
  constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }
  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }
    return this.fastNumbersCached;
  }
  listingMode() {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }
  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        validateWeekSettings(alts.weekSettings) || this.weekSettings,
        alts.defaultToEN || false
      );
    }
  }
  redefaultToEN(alts = {}) {
    return this.clone({ ...alts, defaultToEN: true });
  }
  redefaultToSystem(alts = {}) {
    return this.clone({ ...alts, defaultToEN: false });
  }
  months(length, format = false) {
    return listStuff(this, length, months, () => {
      const intl = format ? { month: length, day: "numeric" } : { month: length }, formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths((dt2) => this.extract(dt2, intl, "month"));
      }
      return this.monthsCache[formatStr][length];
    });
  }
  weekdays(length, format = false) {
    return listStuff(this, length, weekdays, () => {
      const intl = format ? { weekday: length, year: "numeric", month: "long", day: "numeric" } : { weekday: length }, formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays(
          (dt2) => this.extract(dt2, intl, "weekday")
        );
      }
      return this.weekdaysCache[formatStr][length];
    });
  }
  meridiems() {
    return listStuff(
      this,
      void 0,
      () => meridiems,
      () => {
        if (!this.meridiemCache) {
          const intl = { hour: "numeric", hourCycle: "h12" };
          this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(
            (dt2) => this.extract(dt2, intl, "dayperiod")
          );
        }
        return this.meridiemCache;
      }
    );
  }
  eras(length) {
    return listStuff(this, length, eras, () => {
      const intl = { era: length };
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(
          (dt2) => this.extract(dt2, intl, "era")
        );
      }
      return this.eraCache[length];
    });
  }
  extract(dt2, intlOpts, field) {
    const df = this.dtFormatter(dt2, intlOpts), results = df.formatToParts(), matching = results.find((m2) => m2.type.toLowerCase() === field);
    return matching ? matching.value : null;
  }
  numberFormatter(opts = {}) {
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }
  dtFormatter(dt2, intlOpts = {}) {
    return new PolyDateFormatter(dt2, this.intl, intlOpts);
  }
  relFormatter(opts = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }
  listFormatter(opts = {}) {
    return getCachedLF(this.intl, opts);
  }
  isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
  }
  getWeekSettings() {
    if (this.weekSettings) {
      return this.weekSettings;
    } else if (!hasLocaleWeekInfo()) {
      return fallbackWeekSettings;
    } else {
      return getCachedWeekInfo(this.locale);
    }
  }
  getStartOfWeek() {
    return this.getWeekSettings().firstDay;
  }
  getMinDaysInFirstWeek() {
    return this.getWeekSettings().minimalDays;
  }
  getWeekendDays() {
    return this.getWeekSettings().weekend;
  }
  equals(other) {
    return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
  }
}
let singleton = null;
class FixedOffsetZone extends Zone {
  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance() {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }
  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(offset2) {
    return offset2 === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset2);
  }
  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  static parseSpecifier(s2) {
    if (s2) {
      const r2 = s2.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r2) {
        return new FixedOffsetZone(signedOffset(r2[1], r2[2]));
      }
    }
    return null;
  }
  constructor(offset2) {
    super();
    this.fixed = offset2;
  }
  /** @override **/
  get type() {
    return "fixed";
  }
  /** @override **/
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }
  get ianaName() {
    if (this.fixed === 0) {
      return "Etc/UTC";
    } else {
      return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
    }
  }
  /** @override **/
  offsetName() {
    return this.name;
  }
  /** @override **/
  formatOffset(ts, format) {
    return formatOffset(this.fixed, format);
  }
  /** @override **/
  get isUniversal() {
    return true;
  }
  /** @override **/
  offset() {
    return this.fixed;
  }
  /** @override **/
  equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }
  /** @override **/
  get isValid() {
    return true;
  }
}
class InvalidZone extends Zone {
  constructor(zoneName) {
    super();
    this.zoneName = zoneName;
  }
  /** @override **/
  get type() {
    return "invalid";
  }
  /** @override **/
  get name() {
    return this.zoneName;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName() {
    return null;
  }
  /** @override **/
  formatOffset() {
    return "";
  }
  /** @override **/
  offset() {
    return NaN;
  }
  /** @override **/
  equals() {
    return false;
  }
  /** @override **/
  get isValid() {
    return false;
  }
}
function normalizeZone(input2, defaultZone2) {
  if (isUndefined(input2) || input2 === null) {
    return defaultZone2;
  } else if (input2 instanceof Zone) {
    return input2;
  } else if (isString(input2)) {
    const lowered = input2.toLowerCase();
    if (lowered === "default")
      return defaultZone2;
    else if (lowered === "local" || lowered === "system")
      return SystemZone.instance;
    else if (lowered === "utc" || lowered === "gmt")
      return FixedOffsetZone.utcInstance;
    else
      return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input2);
  } else if (isNumber(input2)) {
    return FixedOffsetZone.instance(input2);
  } else if (typeof input2 === "object" && "offset" in input2 && typeof input2.offset === "function") {
    return input2;
  } else {
    return new InvalidZone(input2);
  }
}
let now = () => Date.now(), defaultZone = "system", defaultLocale = null, defaultNumberingSystem = null, defaultOutputCalendar = null, twoDigitCutoffYear = 60, throwOnInvalid, defaultWeekSettings = null;
let Settings$1 = class Settings {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return now;
  }
  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n2) {
    now = n2;
  }
  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   * Use the value "system" to reset this value to the system's time zone.
   * @type {string}
   */
  static set defaultZone(zone) {
    defaultZone = zone;
  }
  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone() {
    return normalizeZone(defaultZone, SystemZone.instance);
  }
  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultLocale() {
    return defaultLocale;
  }
  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(locale) {
    defaultLocale = locale;
  }
  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }
  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(numberingSystem) {
    defaultNumberingSystem = numberingSystem;
  }
  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }
  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(outputCalendar) {
    defaultOutputCalendar = outputCalendar;
  }
  /**
   * @typedef {Object} WeekSettings
   * @property {number} firstDay
   * @property {number} minimalDays
   * @property {number[]} weekend
   */
  /**
   * @return {WeekSettings|null}
   */
  static get defaultWeekSettings() {
    return defaultWeekSettings;
  }
  /**
   * Allows overriding the default locale week settings, i.e. the start of the week, the weekend and
   * how many days are required in the first week of a year.
   * Does not affect existing instances.
   *
   * @param {WeekSettings|null} weekSettings
   */
  static set defaultWeekSettings(weekSettings) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }
  /**
   * Get the cutoff year after which a string encoding a year as two digits is interpreted to occur in the current century.
   * @type {number}
   */
  static get twoDigitCutoffYear() {
    return twoDigitCutoffYear;
  }
  /**
   * Set the cutoff year after which a string encoding a year as two digits is interpreted to occur in the current century.
   * @type {number}
   * @example Settings.twoDigitCutoffYear = 0 // cut-off year is 0, so all 'yy' are interpreted as current century
   * @example Settings.twoDigitCutoffYear = 50 // '49' -> 1949; '50' -> 2050
   * @example Settings.twoDigitCutoffYear = 1950 // interpreted as 50
   * @example Settings.twoDigitCutoffYear = 2050 // ALSO interpreted as 50
   */
  static set twoDigitCutoffYear(cutoffYear) {
    twoDigitCutoffYear = cutoffYear % 100;
  }
  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static get throwOnInvalid() {
    return throwOnInvalid;
  }
  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static set throwOnInvalid(t2) {
    throwOnInvalid = t2;
  }
  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
  }
};
class Invalid {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }
  toMessage() {
    if (this.explanation) {
      return `${this.reason}: ${this.explanation}`;
    } else {
      return this.reason;
    }
  }
}
const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
function unitOutOfRange(unit, value) {
  return new Invalid(
    "unit out of range",
    `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`
  );
}
function dayOfWeek(year, month, day) {
  const d2 = new Date(Date.UTC(year, month - 1, day));
  if (year < 100 && year >= 0) {
    d2.setUTCFullYear(d2.getUTCFullYear() - 1900);
  }
  const js = d2.getUTCDay();
  return js === 0 ? 7 : js;
}
function computeOrdinal(year, month, day) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}
function uncomputeOrdinal(year, ordinal) {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex((i2) => i2 < ordinal), day = ordinal - table[month0];
  return { month: month0 + 1, day };
}
function isoWeekdayToLocal(isoWeekday, startOfWeek) {
  return (isoWeekday - startOfWeek + 7) % 7 + 1;
}
function gregorianToWeek(gregObj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const { year, month, day } = gregObj, ordinal = computeOrdinal(year, month, day), weekday = isoWeekdayToLocal(dayOfWeek(year, month, day), startOfWeek);
  let weekNumber = Math.floor((ordinal - weekday + 14 - minDaysInFirstWeek) / 7), weekYear;
  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek);
  } else if (weekNumber > weeksInWeekYear(year, minDaysInFirstWeek, startOfWeek)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }
  return { weekYear, weekNumber, weekday, ...timeObject(gregObj) };
}
function weekToGregorian(weekData, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const { weekYear, weekNumber, weekday } = weekData, weekdayOfJan4 = isoWeekdayToLocal(dayOfWeek(weekYear, 1, minDaysInFirstWeek), startOfWeek), yearInDays = daysInYear(weekYear);
  let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 7 + minDaysInFirstWeek, year;
  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...timeObject(weekData) };
}
function gregorianToOrdinal(gregData) {
  const { year, month, day } = gregData;
  const ordinal = computeOrdinal(year, month, day);
  return { year, ordinal, ...timeObject(gregData) };
}
function ordinalToGregorian(ordinalData) {
  const { year, ordinal } = ordinalData;
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...timeObject(ordinalData) };
}
function usesLocalWeekValues(obj, loc) {
  const hasLocaleWeekData = !isUndefined(obj.localWeekday) || !isUndefined(obj.localWeekNumber) || !isUndefined(obj.localWeekYear);
  if (hasLocaleWeekData) {
    const hasIsoWeekData = !isUndefined(obj.weekday) || !isUndefined(obj.weekNumber) || !isUndefined(obj.weekYear);
    if (hasIsoWeekData) {
      throw new ConflictingSpecificationError(
        "Cannot mix locale-based week fields with ISO-based week fields"
      );
    }
    if (!isUndefined(obj.localWeekday))
      obj.weekday = obj.localWeekday;
    if (!isUndefined(obj.localWeekNumber))
      obj.weekNumber = obj.localWeekNumber;
    if (!isUndefined(obj.localWeekYear))
      obj.weekYear = obj.localWeekYear;
    delete obj.localWeekday;
    delete obj.localWeekNumber;
    delete obj.localWeekYear;
    return {
      minDaysInFirstWeek: loc.getMinDaysInFirstWeek(),
      startOfWeek: loc.getStartOfWeek()
    };
  } else {
    return { minDaysInFirstWeek: 4, startOfWeek: 1 };
  }
}
function hasInvalidWeekData(obj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const validYear = isInteger(obj.weekYear), validWeek = integerBetween(
    obj.weekNumber,
    1,
    weeksInWeekYear(obj.weekYear, minDaysInFirstWeek, startOfWeek)
  ), validWeekday = integerBetween(obj.weekday, 1, 7);
  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.weekNumber);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else
    return false;
}
function hasInvalidOrdinalData(obj) {
  const validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else
    return false;
}
function hasInvalidGregorianData(obj) {
  const validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else
    return false;
}
function hasInvalidTimeData(obj) {
  const { hour, minute, second, millisecond } = obj;
  const validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else
    return false;
}
function isUndefined(o2) {
  return typeof o2 === "undefined";
}
function isNumber(o2) {
  return typeof o2 === "number";
}
function isInteger(o2) {
  return typeof o2 === "number" && o2 % 1 === 0;
}
function isString(o2) {
  return typeof o2 === "string";
}
function isDate(o2) {
  return Object.prototype.toString.call(o2) === "[object Date]";
}
function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e2) {
    return false;
  }
}
function hasLocaleWeekInfo() {
  try {
    return typeof Intl !== "undefined" && !!Intl.Locale && ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype);
  } catch (e2) {
    return false;
  }
}
function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}
function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return void 0;
  }
  return arr.reduce((best, next) => {
    const pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}
function pick(obj, keys) {
  return keys.reduce((a2, k2) => {
    a2[k2] = obj[k2];
    return a2;
  }, {});
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function validateWeekSettings(settings) {
  if (settings == null) {
    return null;
  } else if (typeof settings !== "object") {
    throw new InvalidArgumentError("Week settings must be an object");
  } else {
    if (!integerBetween(settings.firstDay, 1, 7) || !integerBetween(settings.minimalDays, 1, 7) || !Array.isArray(settings.weekend) || settings.weekend.some((v2) => !integerBetween(v2, 1, 7))) {
      throw new InvalidArgumentError("Invalid week settings");
    }
    return {
      firstDay: settings.firstDay,
      minimalDays: settings.minimalDays,
      weekend: Array.from(settings.weekend)
    };
  }
}
function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
}
function floorMod(x2, n2) {
  return x2 - n2 * Math.floor(x2 / n2);
}
function padStart(input2, n2 = 2) {
  const isNeg = input2 < 0;
  let padded;
  if (isNeg) {
    padded = "-" + ("" + -input2).padStart(n2, "0");
  } else {
    padded = ("" + input2).padStart(n2, "0");
  }
  return padded;
}
function parseInteger(string) {
  if (isUndefined(string) || string === null || string === "") {
    return void 0;
  } else {
    return parseInt(string, 10);
  }
}
function parseFloating(string) {
  if (isUndefined(string) || string === null || string === "") {
    return void 0;
  } else {
    return parseFloat(string);
  }
}
function parseMillis(fraction) {
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return void 0;
  } else {
    const f2 = parseFloat("0." + fraction) * 1e3;
    return Math.floor(f2);
  }
}
function roundTo(number, digits, towardZero = false) {
  const factor = 10 ** digits, rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
}
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
function daysInMonth(year, month) {
  const modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}
function objToLocalTS(obj) {
  let d2 = Date.UTC(
    obj.year,
    obj.month - 1,
    obj.day,
    obj.hour,
    obj.minute,
    obj.second,
    obj.millisecond
  );
  if (obj.year < 100 && obj.year >= 0) {
    d2 = new Date(d2);
    d2.setUTCFullYear(obj.year, obj.month - 1, obj.day);
  }
  return +d2;
}
function firstWeekOffset(year, minDaysInFirstWeek, startOfWeek) {
  const fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
  return -fwdlw + minDaysInFirstWeek - 1;
}
function weeksInWeekYear(weekYear, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
  const weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
  return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
}
function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else
    return year > Settings$1.twoDigitCutoffYear ? 1900 + year : 2e3 + year;
}
function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
  const date = new Date(ts), intlOpts = {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };
  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }
  const modified = { timeZoneName: offsetFormat, ...intlOpts };
  const parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find((m2) => m2.type.toLowerCase() === "timezonename");
  return parsed ? parsed.value : null;
}
function signedOffset(offHourStr, offMinuteStr) {
  let offHour = parseInt(offHourStr, 10);
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }
  const offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}
function asNumber(value) {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
    throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
}
function normalizeObject(obj, normalizer) {
  const normalized = {};
  for (const u2 in obj) {
    if (hasOwnProperty(obj, u2)) {
      const v2 = obj[u2];
      if (v2 === void 0 || v2 === null)
        continue;
      normalized[normalizer(u2)] = asNumber(v2);
    }
  }
  return normalized;
}
function formatOffset(offset2, format) {
  const hours = Math.trunc(Math.abs(offset2 / 60)), minutes = Math.trunc(Math.abs(offset2 % 60)), sign = offset2 >= 0 ? "+" : "-";
  switch (format) {
    case "short":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}
function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}
const monthsLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function months(length) {
  switch (length) {
    case "narrow":
      return [...monthsNarrow];
    case "short":
      return [...monthsShort];
    case "long":
      return [...monthsLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    default:
      return null;
  }
}
const weekdaysLong = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
function weekdays(length) {
  switch (length) {
    case "narrow":
      return [...weekdaysNarrow];
    case "short":
      return [...weekdaysShort];
    case "long":
      return [...weekdaysLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];
    default:
      return null;
  }
}
const meridiems = ["AM", "PM"];
const erasLong = ["Before Christ", "Anno Domini"];
const erasShort = ["BC", "AD"];
const erasNarrow = ["B", "A"];
function eras(length) {
  switch (length) {
    case "narrow":
      return [...erasNarrow];
    case "short":
      return [...erasShort];
    case "long":
      return [...erasLong];
    default:
      return null;
  }
}
function meridiemForDateTime(dt2) {
  return meridiems[dt2.hour < 12 ? 0 : 1];
}
function weekdayForDateTime(dt2, length) {
  return weekdays(length)[dt2.weekday - 1];
}
function monthForDateTime(dt2, length) {
  return months(length)[dt2.month - 1];
}
function eraForDateTime(dt2, length) {
  return eras(length)[dt2.year < 0 ? 0 : 1];
}
function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
  const units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  };
  const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;
  if (numeric === "auto" && lastable) {
    const isDay = unit === "days";
    switch (count) {
      case 1:
        return isDay ? "tomorrow" : `next ${units[unit][0]}`;
      case -1:
        return isDay ? "yesterday" : `last ${units[unit][0]}`;
      case 0:
        return isDay ? "today" : `this ${units[unit][0]}`;
    }
  }
  const isInPast = Object.is(count, -0) || count < 0, fmtValue = Math.abs(count), singular = fmtValue === 1, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
  return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
}
function stringifyTokens(splits, tokenToString) {
  let s2 = "";
  for (const token of splits) {
    if (token.literal) {
      s2 += token.val;
    } else {
      s2 += tokenToString(token.val);
    }
  }
  return s2;
}
const macroTokenToFormatOpts = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS
};
class Formatter {
  static create(locale, opts = {}) {
    return new Formatter(locale, opts);
  }
  static parseFormat(fmt) {
    let current = null, currentFull = "", bracketed = false;
    const splits = [];
    for (let i2 = 0; i2 < fmt.length; i2++) {
      const c2 = fmt.charAt(i2);
      if (c2 === "'") {
        if (currentFull.length > 0) {
          splits.push({ literal: bracketed || /^\s+$/.test(currentFull), val: currentFull });
        }
        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c2;
      } else if (c2 === current) {
        currentFull += c2;
      } else {
        if (currentFull.length > 0) {
          splits.push({ literal: /^\s+$/.test(currentFull), val: currentFull });
        }
        currentFull = c2;
        current = c2;
      }
    }
    if (currentFull.length > 0) {
      splits.push({ literal: bracketed || /^\s+$/.test(currentFull), val: currentFull });
    }
    return splits;
  }
  static macroTokenToFormatOpts(token) {
    return macroTokenToFormatOpts[token];
  }
  constructor(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }
  formatWithSystemDefault(dt2, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }
    const df = this.systemLoc.dtFormatter(dt2, { ...this.opts, ...opts });
    return df.format();
  }
  dtFormatter(dt2, opts = {}) {
    return this.loc.dtFormatter(dt2, { ...this.opts, ...opts });
  }
  formatDateTime(dt2, opts) {
    return this.dtFormatter(dt2, opts).format();
  }
  formatDateTimeParts(dt2, opts) {
    return this.dtFormatter(dt2, opts).formatToParts();
  }
  formatInterval(interval, opts) {
    const df = this.dtFormatter(interval.start, opts);
    return df.dtf.formatRange(interval.start.toJSDate(), interval.end.toJSDate());
  }
  resolvedOptions(dt2, opts) {
    return this.dtFormatter(dt2, opts).resolvedOptions();
  }
  num(n2, p2 = 0) {
    if (this.opts.forceSimple) {
      return padStart(n2, p2);
    }
    const opts = { ...this.opts };
    if (p2 > 0) {
      opts.padTo = p2;
    }
    return this.loc.numberFormatter(opts).format(n2);
  }
  formatDateTimeFromString(dt2, fmt) {
    const knownEnglish = this.loc.listingMode() === "en", useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", string = (opts, extract) => this.loc.extract(dt2, opts, extract), formatOffset2 = (opts) => {
      if (dt2.isOffsetFixed && dt2.offset === 0 && opts.allowZ) {
        return "Z";
      }
      return dt2.isValid ? dt2.zone.formatOffset(dt2.ts, opts.format) : "";
    }, meridiem = () => knownEnglish ? meridiemForDateTime(dt2) : string({ hour: "numeric", hourCycle: "h12" }, "dayperiod"), month = (length, standalone) => knownEnglish ? monthForDateTime(dt2, length) : string(standalone ? { month: length } : { month: length, day: "numeric" }, "month"), weekday = (length, standalone) => knownEnglish ? weekdayForDateTime(dt2, length) : string(
      standalone ? { weekday: length } : { weekday: length, month: "long", day: "numeric" },
      "weekday"
    ), maybeMacro = (token) => {
      const formatOpts = Formatter.macroTokenToFormatOpts(token);
      if (formatOpts) {
        return this.formatWithSystemDefault(dt2, formatOpts);
      } else {
        return token;
      }
    }, era = (length) => knownEnglish ? eraForDateTime(dt2, length) : string({ era: length }, "era"), tokenToString = (token) => {
      switch (token) {
        case "S":
          return this.num(dt2.millisecond);
        case "u":
        case "SSS":
          return this.num(dt2.millisecond, 3);
        case "s":
          return this.num(dt2.second);
        case "ss":
          return this.num(dt2.second, 2);
        case "uu":
          return this.num(Math.floor(dt2.millisecond / 10), 2);
        case "uuu":
          return this.num(Math.floor(dt2.millisecond / 100));
        case "m":
          return this.num(dt2.minute);
        case "mm":
          return this.num(dt2.minute, 2);
        case "h":
          return this.num(dt2.hour % 12 === 0 ? 12 : dt2.hour % 12);
        case "hh":
          return this.num(dt2.hour % 12 === 0 ? 12 : dt2.hour % 12, 2);
        case "H":
          return this.num(dt2.hour);
        case "HH":
          return this.num(dt2.hour, 2);
        case "Z":
          return formatOffset2({ format: "narrow", allowZ: this.opts.allowZ });
        case "ZZ":
          return formatOffset2({ format: "short", allowZ: this.opts.allowZ });
        case "ZZZ":
          return formatOffset2({ format: "techie", allowZ: this.opts.allowZ });
        case "ZZZZ":
          return dt2.zone.offsetName(dt2.ts, { format: "short", locale: this.loc.locale });
        case "ZZZZZ":
          return dt2.zone.offsetName(dt2.ts, { format: "long", locale: this.loc.locale });
        case "z":
          return dt2.zoneName;
        case "a":
          return meridiem();
        case "d":
          return useDateTimeFormatter ? string({ day: "numeric" }, "day") : this.num(dt2.day);
        case "dd":
          return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : this.num(dt2.day, 2);
        case "c":
          return this.num(dt2.weekday);
        case "ccc":
          return weekday("short", true);
        case "cccc":
          return weekday("long", true);
        case "ccccc":
          return weekday("narrow", true);
        case "E":
          return this.num(dt2.weekday);
        case "EEE":
          return weekday("short", false);
        case "EEEE":
          return weekday("long", false);
        case "EEEEE":
          return weekday("narrow", false);
        case "L":
          return useDateTimeFormatter ? string({ month: "numeric", day: "numeric" }, "month") : this.num(dt2.month);
        case "LL":
          return useDateTimeFormatter ? string({ month: "2-digit", day: "numeric" }, "month") : this.num(dt2.month, 2);
        case "LLL":
          return month("short", true);
        case "LLLL":
          return month("long", true);
        case "LLLLL":
          return month("narrow", true);
        case "M":
          return useDateTimeFormatter ? string({ month: "numeric" }, "month") : this.num(dt2.month);
        case "MM":
          return useDateTimeFormatter ? string({ month: "2-digit" }, "month") : this.num(dt2.month, 2);
        case "MMM":
          return month("short", false);
        case "MMMM":
          return month("long", false);
        case "MMMMM":
          return month("narrow", false);
        case "y":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt2.year);
        case "yy":
          return useDateTimeFormatter ? string({ year: "2-digit" }, "year") : this.num(dt2.year.toString().slice(-2), 2);
        case "yyyy":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt2.year, 4);
        case "yyyyyy":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt2.year, 6);
        case "G":
          return era("short");
        case "GG":
          return era("long");
        case "GGGGG":
          return era("narrow");
        case "kk":
          return this.num(dt2.weekYear.toString().slice(-2), 2);
        case "kkkk":
          return this.num(dt2.weekYear, 4);
        case "W":
          return this.num(dt2.weekNumber);
        case "WW":
          return this.num(dt2.weekNumber, 2);
        case "n":
          return this.num(dt2.localWeekNumber);
        case "nn":
          return this.num(dt2.localWeekNumber, 2);
        case "ii":
          return this.num(dt2.localWeekYear.toString().slice(-2), 2);
        case "iiii":
          return this.num(dt2.localWeekYear, 4);
        case "o":
          return this.num(dt2.ordinal);
        case "ooo":
          return this.num(dt2.ordinal, 3);
        case "q":
          return this.num(dt2.quarter);
        case "qq":
          return this.num(dt2.quarter, 2);
        case "X":
          return this.num(Math.floor(dt2.ts / 1e3));
        case "x":
          return this.num(dt2.ts);
        default:
          return maybeMacro(token);
      }
    };
    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  }
  formatDurationFromString(dur, fmt) {
    const tokenToField = (token) => {
      switch (token[0]) {
        case "S":
          return "millisecond";
        case "s":
          return "second";
        case "m":
          return "minute";
        case "h":
          return "hour";
        case "d":
          return "day";
        case "w":
          return "week";
        case "M":
          return "month";
        case "y":
          return "year";
        default:
          return null;
      }
    }, tokenToString = (lildur) => (token) => {
      const mapped = tokenToField(token);
      if (mapped) {
        return this.num(lildur.get(mapped), token.length);
      } else {
        return token;
      }
    }, tokens = Formatter.parseFormat(fmt), realTokens = tokens.reduce(
      (found, { literal, val }) => literal ? found : found.concat(val),
      []
    ), collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t2) => t2));
    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}
const ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
function combineRegexes(...regexes) {
  const full = regexes.reduce((f2, r2) => f2 + r2.source, "");
  return RegExp(`^${full}$`);
}
function combineExtractors(...extractors) {
  return (m2) => extractors.reduce(
    ([mergedVals, mergedZone, cursor], ex) => {
      const [val, zone, next] = ex(m2, cursor);
      return [{ ...mergedVals, ...val }, zone || mergedZone, next];
    },
    [{}, null, 1]
  ).slice(0, 2);
}
function parse(s2, ...patterns) {
  if (s2 == null) {
    return [null, null];
  }
  for (const [regex, extractor] of patterns) {
    const m2 = regex.exec(s2);
    if (m2) {
      return extractor(m2);
    }
  }
  return [null, null];
}
function simpleParse(...keys) {
  return (match2, cursor) => {
    const ret = {};
    let i2;
    for (i2 = 0; i2 < keys.length; i2++) {
      ret[keys[i2]] = parseInteger(match2[cursor + i2]);
    }
    return [ret, null, cursor + i2];
  };
}
const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
const isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
const isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
const isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
const isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`);
const isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
const isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
const isoOrdinalRegex = /(\d{4})-?(\d{3})/;
const extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
const extractISOOrdinalData = simpleParse("year", "ordinal");
const sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
const sqlTimeRegex = RegExp(
  `${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`
);
const sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);
function int(match2, pos, fallback) {
  const m2 = match2[pos];
  return isUndefined(m2) ? fallback : parseInteger(m2);
}
function extractISOYmd(match2, cursor) {
  const item = {
    year: int(match2, cursor),
    month: int(match2, cursor + 1, 1),
    day: int(match2, cursor + 2, 1)
  };
  return [item, null, cursor + 3];
}
function extractISOTime(match2, cursor) {
  const item = {
    hours: int(match2, cursor, 0),
    minutes: int(match2, cursor + 1, 0),
    seconds: int(match2, cursor + 2, 0),
    milliseconds: parseMillis(match2[cursor + 3])
  };
  return [item, null, cursor + 4];
}
function extractISOOffset(match2, cursor) {
  const local = !match2[cursor] && !match2[cursor + 1], fullOffset = signedOffset(match2[cursor + 1], match2[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
  return [{}, zone, cursor + 3];
}
function extractIANAZone(match2, cursor) {
  const zone = match2[cursor] ? IANAZone.create(match2[cursor]) : null;
  return [{}, zone, cursor + 1];
}
const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);
const isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
function extractISODuration(match2) {
  const [s2, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = match2;
  const hasNegativePrefix = s2[0] === "-";
  const negativeSeconds = secondStr && secondStr[0] === "-";
  const maybeNegate = (num, force = false) => num !== void 0 && (force || num && hasNegativePrefix) ? -num : num;
  return [
    {
      years: maybeNegate(parseFloating(yearStr)),
      months: maybeNegate(parseFloating(monthStr)),
      weeks: maybeNegate(parseFloating(weekStr)),
      days: maybeNegate(parseFloating(dayStr)),
      hours: maybeNegate(parseFloating(hourStr)),
      minutes: maybeNegate(parseFloating(minuteStr)),
      seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
      milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
    }
  ];
}
const obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  const result = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: monthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr)
  };
  if (secondStr)
    result.second = parseInteger(secondStr);
  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
  }
  return result;
}
const rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
function extractRFC2822(match2) {
  const [
    ,
    weekdayStr,
    dayStr,
    monthStr,
    yearStr,
    hourStr,
    minuteStr,
    secondStr,
    obsOffset,
    milOffset,
    offHourStr,
    offMinuteStr
  ] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  let offset2;
  if (obsOffset) {
    offset2 = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset2 = 0;
  } else {
    offset2 = signedOffset(offHourStr, offMinuteStr);
  }
  return [result, new FixedOffsetZone(offset2)];
}
function preprocessRFC2822(s2) {
  return s2.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
}
const rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/, rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/, ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
function extractRFC1123Or850(match2) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
function extractASCII(match2) {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
const isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
const extractISOYmdTimeAndOffset = combineExtractors(
  extractISOYmd,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
const extractISOWeekTimeAndOffset = combineExtractors(
  extractISOWeekData,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
const extractISOOrdinalDateAndTime = combineExtractors(
  extractISOOrdinalData,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
const extractISOTimeAndOffset = combineExtractors(
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
function parseISODate(s2) {
  return parse(
    s2,
    [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
    [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset],
    [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime],
    [isoTimeCombinedRegex, extractISOTimeAndOffset]
  );
}
function parseRFC2822Date(s2) {
  return parse(preprocessRFC2822(s2), [rfc2822, extractRFC2822]);
}
function parseHTTPDate(s2) {
  return parse(
    s2,
    [rfc1123, extractRFC1123Or850],
    [rfc850, extractRFC1123Or850],
    [ascii, extractASCII]
  );
}
function parseISODuration(s2) {
  return parse(s2, [isoDuration, extractISODuration]);
}
const extractISOTimeOnly = combineExtractors(extractISOTime);
function parseISOTimeOnly(s2) {
  return parse(s2, [isoTimeOnly, extractISOTimeOnly]);
}
const sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
const sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
const extractISOTimeOffsetAndIANAZone = combineExtractors(
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
function parseSQL(s2) {
  return parse(
    s2,
    [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
    [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]
  );
}
const INVALID$2 = "Invalid Duration";
const lowOrderMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1e3
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1e3
  },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1e3 },
  minutes: { seconds: 60, milliseconds: 60 * 1e3 },
  seconds: { milliseconds: 1e3 }
}, casualMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1e3
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1e3
  },
  ...lowOrderMatrix
}, daysInYearAccurate = 146097 / 400, daysInMonthAccurate = 146097 / 4800, accurateMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: daysInYearAccurate * 24 / 4,
    minutes: daysInYearAccurate * 24 * 60 / 4,
    seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3 / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1e3
  },
  ...lowOrderMatrix
};
const orderedUnits$1 = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds"
];
const reverseUnits = orderedUnits$1.slice(0).reverse();
function clone$1(dur, alts, clear = false) {
  const conf = {
    values: clear ? alts.values : { ...dur.values, ...alts.values || {} },
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
    matrix: alts.matrix || dur.matrix
  };
  return new Duration(conf);
}
function durationToMillis(matrix, vals) {
  let sum = vals.milliseconds ?? 0;
  for (const unit of reverseUnits.slice(1)) {
    if (vals[unit]) {
      sum += vals[unit] * matrix[unit]["milliseconds"];
    }
  }
  return sum;
}
function normalizeValues(matrix, vals) {
  const factor = durationToMillis(matrix, vals) < 0 ? -1 : 1;
  orderedUnits$1.reduceRight((previous, current) => {
    if (!isUndefined(vals[current])) {
      if (previous) {
        const previousVal = vals[previous] * factor;
        const conv = matrix[current][previous];
        const rollUp = Math.floor(previousVal / conv);
        vals[current] += rollUp * factor;
        vals[previous] -= rollUp * conv * factor;
      }
      return current;
    } else {
      return previous;
    }
  }, null);
  orderedUnits$1.reduce((previous, current) => {
    if (!isUndefined(vals[current])) {
      if (previous) {
        const fraction = vals[previous] % 1;
        vals[previous] -= fraction;
        vals[current] += fraction * matrix[previous][current];
      }
      return current;
    } else {
      return previous;
    }
  }, null);
}
function removeZeroes(vals) {
  const newVals = {};
  for (const [key, value] of Object.entries(vals)) {
    if (value !== 0) {
      newVals[key] = value;
    }
  }
  return newVals;
}
class Duration {
  /**
   * @private
   */
  constructor(config) {
    const accurate = config.conversionAccuracy === "longterm" || false;
    let matrix = accurate ? accurateMatrix : casualMatrix;
    if (config.matrix) {
      matrix = config.matrix;
    }
    this.values = config.values;
    this.loc = config.loc || Locale.create();
    this.conversionAccuracy = accurate ? "longterm" : "casual";
    this.invalid = config.invalid || null;
    this.matrix = matrix;
    this.isLuxonDuration = true;
  }
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  static fromMillis(count, opts) {
    return Duration.fromObject({ milliseconds: count }, opts);
  }
  /**
   * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {Object} [opts=[]] - options for creating this Duration
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the custom conversion system to use
   * @return {Duration}
   */
  static fromObject(obj, opts = {}) {
    if (obj == null || typeof obj !== "object") {
      throw new InvalidArgumentError(
        `Duration.fromObject: argument expected to be an object, got ${obj === null ? "null" : typeof obj}`
      );
    }
    return new Duration({
      values: normalizeObject(obj, Duration.normalizeUnit),
      loc: Locale.fromObject(opts),
      conversionAccuracy: opts.conversionAccuracy,
      matrix: opts.matrix
    });
  }
  /**
   * Create a Duration from DurationLike.
   *
   * @param {Object | number | Duration} durationLike
   * One of:
   * - object with keys like 'years' and 'hours'.
   * - number representing milliseconds
   * - Duration instance
   * @return {Duration}
   */
  static fromDurationLike(durationLike) {
    if (isNumber(durationLike)) {
      return Duration.fromMillis(durationLike);
    } else if (Duration.isDuration(durationLike)) {
      return durationLike;
    } else if (typeof durationLike === "object") {
      return Duration.fromObject(durationLike);
    } else {
      throw new InvalidArgumentError(
        `Unknown duration argument ${durationLike} of type ${typeof durationLike}`
      );
    }
  }
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the preset conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(text, opts) {
    const [parsed] = parseISODuration(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  /**
   * Create a Duration from an ISO 8601 time string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
   * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @return {Duration}
   */
  static fromISOTime(text, opts) {
    const [parsed] = parseISOTimeOnly(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings$1.throwOnInvalid) {
      throw new InvalidDurationError(invalid);
    } else {
      return new Duration({ invalid });
    }
  }
  /**
   * @private
   */
  static normalizeUnit(unit) {
    const normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[unit ? unit.toLowerCase() : unit];
    if (!normalized)
      throw new InvalidUnitError(unit);
    return normalized;
  }
  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDuration(o2) {
    return o2 && o2.isLuxonDuration || false;
  }
  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `w` for weeks
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * Tokens can be escaped by wrapping with single quotes.
   * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    const fmtOpts = {
      ...opts,
      floor: opts.round !== false && opts.floor !== false
    };
    return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID$2;
  }
  /**
   * Returns a string representation of a Duration with all units included.
   * To modify its behavior, use `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
   * @param {Object} opts - Formatting options. Accepts the same keys as the options parameter of the native `Intl.NumberFormat` constructor, as well as `listStyle`.
   * @param {string} [opts.listStyle='narrow'] - How to format the merged list. Corresponds to the `style` property of the options parameter of the native `Intl.ListFormat` constructor.
   * @example
   * ```js
   * var dur = Duration.fromObject({ days: 1, hours: 5, minutes: 6 })
   * dur.toHuman() //=> '1 day, 5 hours, 6 minutes'
   * dur.toHuman({ listStyle: "long" }) //=> '1 day, 5 hours, and 6 minutes'
   * dur.toHuman({ unitDisplay: "short" }) //=> '1 day, 5 hr, 6 min'
   * ```
   */
  toHuman(opts = {}) {
    if (!this.isValid)
      return INVALID$2;
    const l2 = orderedUnits$1.map((unit) => {
      const val = this.values[unit];
      if (isUndefined(val)) {
        return null;
      }
      return this.loc.numberFormatter({ style: "unit", unitDisplay: "long", ...opts, unit: unit.slice(0, -1) }).format(val);
    }).filter((n2) => n2);
    return this.loc.listFormatter({ type: "conjunction", style: opts.listStyle || "narrow", ...opts }).format(l2);
  }
  /**
   * Returns a JavaScript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  toObject() {
    if (!this.isValid)
      return {};
    return { ...this.values };
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  toISO() {
    if (!this.isValid)
      return null;
    let s2 = "P";
    if (this.years !== 0)
      s2 += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0)
      s2 += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0)
      s2 += this.weeks + "W";
    if (this.days !== 0)
      s2 += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0)
      s2 += "T";
    if (this.hours !== 0)
      s2 += this.hours + "H";
    if (this.minutes !== 0)
      s2 += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0)
      s2 += roundTo(this.seconds + this.milliseconds / 1e3, 3) + "S";
    if (s2 === "P")
      s2 += "T0S";
    return s2;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
   * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
   * @return {string}
   */
  toISOTime(opts = {}) {
    if (!this.isValid)
      return null;
    const millis = this.toMillis();
    if (millis < 0 || millis >= 864e5)
      return null;
    opts = {
      suppressMilliseconds: false,
      suppressSeconds: false,
      includePrefix: false,
      format: "extended",
      ...opts,
      includeOffset: false
    };
    const dateTime = DateTime.fromMillis(millis, { zone: "UTC" });
    return dateTime.toISOTime(opts);
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  toString() {
    return this.toISO();
  }
  /**
   * Returns a string representation of this Duration appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Duration { values: ${JSON.stringify(this.values)} }`;
    } else {
      return `Duration { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  toMillis() {
    if (!this.isValid)
      return NaN;
    return durationToMillis(this.matrix, this.values);
  }
  /**
   * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration), result = {};
    for (const k2 of orderedUnits$1) {
      if (hasOwnProperty(dur.values, k2) || hasOwnProperty(this.values, k2)) {
        result[k2] = dur.get(k2) + this.get(k2);
      }
    }
    return clone$1(this, { values: result }, true);
  }
  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration);
    return this.plus(dur.negate());
  }
  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hours" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  mapUnits(fn2) {
    if (!this.isValid)
      return this;
    const result = {};
    for (const k2 of Object.keys(this.values)) {
      result[k2] = asNumber(fn2(this.values[k2], k2));
    }
    return clone$1(this, { values: result }, true);
  }
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
   * @return {number}
   */
  get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }
  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values) {
    if (!this.isValid)
      return this;
    const mixed = { ...this.values, ...normalizeObject(values, Duration.normalizeUnit) };
    return clone$1(this, { values: mixed });
  }
  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  reconfigure({ locale, numberingSystem, conversionAccuracy, matrix } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem });
    const opts = { loc, matrix, conversionAccuracy };
    return clone$1(this, opts);
  }
  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }
  /**
   * Reduce this Duration to its canonical representation in its current units.
   * Assuming the overall value of the Duration is positive, this means:
   * - excessive values for lower-order units are converted to higher-order units (if possible, see first and second example)
   * - negative lower-order units are converted to higher order units (there must be such a higher order unit, otherwise
   *   the overall value would be negative, see third example)
   * - fractional values for higher-order units are converted to lower-order units (if possible, see fourth example)
   *
   * If the overall value is negative, the result of this method is equivalent to `this.negate().normalize().negate()`.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ days: 5000 }).normalize().toObject() //=> { days: 5000 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @example Duration.fromObject({ years: 2.5, days: 0, hours: 0 }).normalize().toObject() //=> { years: 2, days: 182, hours: 12 }
   * @return {Duration}
   */
  normalize() {
    if (!this.isValid)
      return this;
    const vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone$1(this, { values: vals }, true);
  }
  /**
   * Rescale units to its largest representation
   * @example Duration.fromObject({ milliseconds: 90000 }).rescale().toObject() //=> { minutes: 1, seconds: 30 }
   * @return {Duration}
   */
  rescale() {
    if (!this.isValid)
      return this;
    const vals = removeZeroes(this.normalize().shiftToAll().toObject());
    return clone$1(this, { values: vals }, true);
  }
  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (!this.isValid)
      return this;
    if (units.length === 0) {
      return this;
    }
    units = units.map((u2) => Duration.normalizeUnit(u2));
    const built = {}, accumulated = {}, vals = this.toObject();
    let lastUnit;
    for (const k2 of orderedUnits$1) {
      if (units.indexOf(k2) >= 0) {
        lastUnit = k2;
        let own = 0;
        for (const ak in accumulated) {
          own += this.matrix[ak][k2] * accumulated[ak];
          accumulated[ak] = 0;
        }
        if (isNumber(vals[k2])) {
          own += vals[k2];
        }
        const i2 = Math.trunc(own);
        built[k2] = i2;
        accumulated[k2] = (own * 1e3 - i2 * 1e3) / 1e3;
      } else if (isNumber(vals[k2])) {
        accumulated[k2] = vals[k2];
      }
    }
    for (const key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }
    normalizeValues(this.matrix, built);
    return clone$1(this, { values: built }, true);
  }
  /**
   * Shift this Duration to all available units.
   * Same as shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds")
   * @return {Duration}
   */
  shiftToAll() {
    if (!this.isValid)
      return this;
    return this.shiftTo(
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
      "milliseconds"
    );
  }
  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    if (!this.isValid)
      return this;
    const negated = {};
    for (const k2 of Object.keys(this.values)) {
      negated[k2] = this.values[k2] === 0 ? 0 : -this.values[k2];
    }
    return clone$1(this, { values: negated }, true);
  }
  /**
   * Get the years.
   * @type {number}
   */
  get years() {
    return this.isValid ? this.values.years || 0 : NaN;
  }
  /**
   * Get the quarters.
   * @type {number}
   */
  get quarters() {
    return this.isValid ? this.values.quarters || 0 : NaN;
  }
  /**
   * Get the months.
   * @type {number}
   */
  get months() {
    return this.isValid ? this.values.months || 0 : NaN;
  }
  /**
   * Get the weeks
   * @type {number}
   */
  get weeks() {
    return this.isValid ? this.values.weeks || 0 : NaN;
  }
  /**
   * Get the days.
   * @type {number}
   */
  get days() {
    return this.isValid ? this.values.days || 0 : NaN;
  }
  /**
   * Get the hours.
   * @type {number}
   */
  get hours() {
    return this.isValid ? this.values.hours || 0 : NaN;
  }
  /**
   * Get the minutes.
   * @type {number}
   */
  get minutes() {
    return this.isValid ? this.values.minutes || 0 : NaN;
  }
  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.isValid ? this.values.seconds || 0 : NaN;
  }
  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.isValid ? this.values.milliseconds || 0 : NaN;
  }
  /**
   * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
   * on invalid DateTimes or Intervals.
   * @return {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this Duration became invalid, or null if the Duration is valid
   * @return {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    if (!this.loc.equals(other.loc)) {
      return false;
    }
    function eq(v1, v2) {
      if (v1 === void 0 || v1 === 0)
        return v2 === void 0 || v2 === 0;
      return v1 === v2;
    }
    for (const u2 of orderedUnits$1) {
      if (!eq(this.values[u2], other.values[u2])) {
        return false;
      }
    }
    return true;
  }
}
const INVALID$1 = "Invalid Interval";
function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid(
      "end before start",
      `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`
    );
  } else {
    return null;
  }
}
class Interval {
  /**
   * @private
   */
  constructor(config) {
    this.s = config.start;
    this.e = config.end;
    this.invalid = config.invalid || null;
    this.isLuxonInterval = true;
  }
  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings$1.throwOnInvalid) {
      throw new InvalidIntervalError(invalid);
    } else {
      return new Interval({ invalid });
    }
  }
  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  static fromDateTimes(start, end) {
    const builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
    const validateError = validateStartEnd(builtStart, builtEnd);
    if (validateError == null) {
      return new Interval({
        start: builtStart,
        end: builtEnd
      });
    } else {
      return validateError;
    }
  }
  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static after(start, duration) {
    const dur = Duration.fromDurationLike(duration), dt2 = friendlyDateTime(start);
    return Interval.fromDateTimes(dt2, dt2.plus(dur));
  }
  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static before(end, duration) {
    const dur = Duration.fromDurationLike(duration), dt2 = friendlyDateTime(end);
    return Interval.fromDateTimes(dt2.minus(dur), dt2);
  }
  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  static fromISO(text, opts) {
    const [s2, e2] = (text || "").split("/", 2);
    if (s2 && e2) {
      let start, startIsValid;
      try {
        start = DateTime.fromISO(s2, opts);
        startIsValid = start.isValid;
      } catch (e3) {
        startIsValid = false;
      }
      let end, endIsValid;
      try {
        end = DateTime.fromISO(e2, opts);
        endIsValid = end.isValid;
      } catch (e3) {
        endIsValid = false;
      }
      if (startIsValid && endIsValid) {
        return Interval.fromDateTimes(start, end);
      }
      if (startIsValid) {
        const dur = Duration.fromISO(e2, opts);
        if (dur.isValid) {
          return Interval.after(start, dur);
        }
      } else if (endIsValid) {
        const dur = Duration.fromISO(s2, opts);
        if (dur.isValid) {
          return Interval.before(end, dur);
        }
      }
    }
    return Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
  }
  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isInterval(o2) {
    return o2 && o2.isLuxonInterval || false;
  }
  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  get start() {
    return this.isValid ? this.s : null;
  }
  /**
   * Returns the end of the Interval
   * @type {DateTime}
   */
  get end() {
    return this.isValid ? this.e : null;
  }
  /**
   * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
   * @type {boolean}
   */
  get isValid() {
    return this.invalidReason === null;
  }
  /**
   * Returns an error code if this Interval is invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  length(unit = "milliseconds") {
    return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
  }
  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; this operation will always use the locale of the start DateTime
   * @return {number}
   */
  count(unit = "milliseconds", opts) {
    if (!this.isValid)
      return NaN;
    const start = this.start.startOf(unit, opts);
    let end;
    if (opts?.useLocaleWeeks) {
      end = this.end.reconfigure({ locale: start.locale });
    } else {
      end = this.end;
    }
    end = end.startOf(unit, opts);
    return Math.floor(end.diff(start, unit).get(unit)) + (end.valueOf() !== this.end.valueOf());
  }
  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }
  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isAfter(dateTime) {
    if (!this.isValid)
      return false;
    return this.s > dateTime;
  }
  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isBefore(dateTime) {
    if (!this.isValid)
      return false;
    return this.e <= dateTime;
  }
  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  contains(dateTime) {
    if (!this.isValid)
      return false;
    return this.s <= dateTime && this.e > dateTime;
  }
  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  set({ start, end } = {}) {
    if (!this.isValid)
      return this;
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }
  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...DateTime} dateTimes - the unit of time to count.
   * @return {Array}
   */
  splitAt(...dateTimes) {
    if (!this.isValid)
      return [];
    const sorted = dateTimes.map(friendlyDateTime).filter((d2) => this.contains(d2)).sort((a2, b2) => a2.toMillis() - b2.toMillis()), results = [];
    let { s: s2 } = this, i2 = 0;
    while (s2 < this.e) {
      const added = sorted[i2] || this.e, next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s2, next));
      s2 = next;
      i2 += 1;
    }
    return results;
  }
  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {Array}
   */
  splitBy(duration) {
    const dur = Duration.fromDurationLike(duration);
    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }
    let { s: s2 } = this, idx = 1, next;
    const results = [];
    while (s2 < this.e) {
      const added = this.start.plus(dur.mapUnits((x2) => x2 * idx));
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s2, next));
      s2 = next;
      idx += 1;
    }
    return results;
  }
  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {Array}
   */
  divideEqually(numberOfParts) {
    if (!this.isValid)
      return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }
  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }
  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsStart(other) {
    if (!this.isValid)
      return false;
    return +this.e === +other.s;
  }
  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsEnd(other) {
    if (!this.isValid)
      return false;
    return +other.e === +this.s;
  }
  /**
   * Return whether this Interval engulfs the start and end of the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  engulfs(other) {
    if (!this.isValid)
      return false;
    return this.s <= other.s && this.e >= other.e;
  }
  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    return this.s.equals(other.s) && this.e.equals(other.e);
  }
  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  intersection(other) {
    if (!this.isValid)
      return this;
    const s2 = this.s > other.s ? this.s : other.s, e2 = this.e < other.e ? this.e : other.e;
    if (s2 >= e2) {
      return null;
    } else {
      return Interval.fromDateTimes(s2, e2);
    }
  }
  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  union(other) {
    if (!this.isValid)
      return this;
    const s2 = this.s < other.s ? this.s : other.s, e2 = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s2, e2);
  }
  /**
   * Merge an array of Intervals into a equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static merge(intervals) {
    const [found, final] = intervals.sort((a2, b2) => a2.s - b2.s).reduce(
      ([sofar, current], item) => {
        if (!current) {
          return [sofar, item];
        } else if (current.overlaps(item) || current.abutsStart(item)) {
          return [sofar, current.union(item)];
        } else {
          return [sofar.concat([current]), item];
        }
      },
      [[], null]
    );
    if (final) {
      found.push(final);
    }
    return found;
  }
  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static xor(intervals) {
    let start = null, currentCount = 0;
    const results = [], ends = intervals.map((i2) => [
      { time: i2.s, type: "s" },
      { time: i2.e, type: "e" }
    ]), flattened = Array.prototype.concat(...ends), arr = flattened.sort((a2, b2) => a2.time - b2.time);
    for (const i2 of arr) {
      currentCount += i2.type === "s" ? 1 : -1;
      if (currentCount === 1) {
        start = i2.time;
      } else {
        if (start && +start !== +i2.time) {
          results.push(Interval.fromDateTimes(start, i2.time));
        }
        start = null;
      }
    }
    return Interval.merge(results);
  }
  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {Array}
   */
  difference(...intervals) {
    return Interval.xor([this].concat(intervals)).map((i2) => this.intersection(i2)).filter((i2) => i2 && !i2.isEmpty());
  }
  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  toString() {
    if (!this.isValid)
      return INVALID$1;
    return `[${this.s.toISO()} – ${this.e.toISO()})`;
  }
  /**
   * Returns a string representation of this Interval appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`;
    } else {
      return `Interval { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns a localized string representing this Interval. Accepts the same options as the
   * Intl.DateTimeFormat constructor and any presets defined by Luxon, such as
   * {@link DateTime.DATE_FULL} or {@link DateTime.TIME_SIMPLE}. The exact behavior of this method
   * is browser-specific, but in general it will return an appropriate representation of the
   * Interval in the assigned locale. Defaults to the system's locale if no locale has been
   * specified.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {Object} [formatOpts=DateTime.DATE_SHORT] - Either a DateTime preset or
   * Intl.DateTimeFormat constructor options.
   * @param {Object} opts - Options to override the configuration of the start DateTime.
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(); //=> 11/7/2022 – 11/8/2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL); //=> November 7 – 8, 2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL, { locale: 'fr-FR' }); //=> 7–8 novembre 2022
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString(DateTime.TIME_SIMPLE); //=> 6:00 – 8:00 PM
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> Mon, Nov 07, 6:00 – 8:00 p
   * @return {string}
   */
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.s.loc.clone(opts), formatOpts).formatInterval(this) : INVALID$1;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISO(opts) {
    if (!this.isValid)
      return INVALID$1;
    return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
  }
  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  toISODate() {
    if (!this.isValid)
      return INVALID$1;
    return `${this.s.toISODate()}/${this.e.toISODate()}`;
  }
  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISOTime(opts) {
    if (!this.isValid)
      return INVALID$1;
    return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
  }
  /**
   * Returns a string representation of this Interval formatted according to the specified format
   * string. **You may not want this.** See {@link Interval#toLocaleString} for a more flexible
   * formatting tool.
   * @param {string} dateFormat - The format string. This string formats the start and end time.
   * See {@link DateTime#toFormat} for details.
   * @param {Object} opts - Options.
   * @param {string} [opts.separator =  ' – '] - A separator to place between the start and end
   * representations.
   * @return {string}
   */
  toFormat(dateFormat, { separator = " – " } = {}) {
    if (!this.isValid)
      return INVALID$1;
    return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
  }
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  toDuration(unit, opts) {
    if (!this.isValid) {
      return Duration.invalid(this.invalidReason);
    }
    return this.e.diff(this.s, unit, opts);
  }
  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  mapEndpoints(mapFn) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  }
}
class Info {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(zone = Settings$1.defaultZone) {
    const proto = DateTime.now().setZone(zone).set({ month: 12 });
    return !zone.isUniversal && proto.offset !== proto.set({ month: 6 }).offset;
  }
  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  static isValidIANAZone(zone) {
    return IANAZone.isValidZone(zone);
  }
  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone#isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  static normalizeZone(input2) {
    return normalizeZone(input2, Settings$1.defaultZone);
  }
  /**
   * Get the weekday on which the week starts according to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number} the start of the week, 1 for Monday through 7 for Sunday
   */
  static getStartOfWeek({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getStartOfWeek();
  }
  /**
   * Get the minimum number of days necessary in a week before it is considered part of the next year according
   * to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number}
   */
  static getMinimumDaysInFirstWeek({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getMinDaysInFirstWeek();
  }
  /**
   * Get the weekdays, which are considered the weekend according to the given locale
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number[]} an array of weekdays, 1 for Monday through 7 for Sunday
   */
  static getWeekendWeekdays({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getWeekendDays().slice();
  }
  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {Array}
   */
  static months(length = "long", { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
  }
  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link Info#months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {Array}
   */
  static monthsFormat(length = "long", { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
  }
  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {Array}
   */
  static weekdays(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
  }
  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link Info#weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @return {Array}
   */
  static weekdaysFormat(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
  }
  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {Array}
   */
  static meridiems({ locale = null } = {}) {
    return Locale.create(locale).meridiems();
  }
  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {Array}
   */
  static eras(length = "short", { locale = null } = {}) {
    return Locale.create(locale, null, "gregory").eras(length);
  }
  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `relative`: whether this environment supports relative time formatting
   * * `localeWeek`: whether this environment supports different weekdays for the start of the week based on the locale
   * @example Info.features() //=> { relative: false, localeWeek: true }
   * @return {Object}
   */
  static features() {
    return { relative: hasRelative(), localeWeek: hasLocaleWeekInfo() };
  }
}
function dayDiff(earlier, later) {
  const utcDayStart = (dt2) => dt2.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(), ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}
function highOrderDiffs(cursor, later, units) {
  const differs = [
    ["years", (a2, b2) => b2.year - a2.year],
    ["quarters", (a2, b2) => b2.quarter - a2.quarter + (b2.year - a2.year) * 4],
    ["months", (a2, b2) => b2.month - a2.month + (b2.year - a2.year) * 12],
    [
      "weeks",
      (a2, b2) => {
        const days = dayDiff(a2, b2);
        return (days - days % 7) / 7;
      }
    ],
    ["days", dayDiff]
  ];
  const results = {};
  const earlier = cursor;
  let lowestOrder, highWater;
  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;
      results[unit] = differ(cursor, later);
      highWater = earlier.plus(results);
      if (highWater > later) {
        results[unit]--;
        cursor = earlier.plus(results);
        if (cursor > later) {
          highWater = cursor;
          results[unit]--;
          cursor = earlier.plus(results);
        }
      } else {
        cursor = highWater;
      }
    }
  }
  return [cursor, results, highWater, lowestOrder];
}
function diff(earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);
  const remainingMillis = later - cursor;
  const lowerOrderUnits = units.filter(
    (u2) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u2) >= 0
  );
  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder]: 1 });
    }
    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }
  const duration = Duration.fromObject(results, opts);
  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, opts).shiftTo(...lowerOrderUnits).plus(duration);
  } else {
    return duration;
  }
}
const numberingSystems = {
  arab: "[٠-٩]",
  arabext: "[۰-۹]",
  bali: "[᭐-᭙]",
  beng: "[০-৯]",
  deva: "[०-९]",
  fullwide: "[０-９]",
  gujr: "[૦-૯]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[០-៩]",
  knda: "[೦-೯]",
  laoo: "[໐-໙]",
  limb: "[᥆-᥏]",
  mlym: "[൦-൯]",
  mong: "[᠐-᠙]",
  mymr: "[၀-၉]",
  orya: "[୦-୯]",
  tamldec: "[௦-௯]",
  telu: "[౦-౯]",
  thai: "[๐-๙]",
  tibt: "[༠-༩]",
  latn: "\\d"
};
const numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
};
const hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
function parseDigits(str) {
  let value = parseInt(str, 10);
  if (isNaN(value)) {
    value = "";
    for (let i2 = 0; i2 < str.length; i2++) {
      const code = str.charCodeAt(i2);
      if (str[i2].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i2]);
      } else {
        for (const key in numberingSystemsUTF16) {
          const [min, max] = numberingSystemsUTF16[key];
          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }
    return parseInt(value, 10);
  } else {
    return value;
  }
}
function digitRegex({ numberingSystem }, append = "") {
  return new RegExp(`${numberingSystems[numberingSystem || "latn"]}${append}`);
}
const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
function intUnit(regex, post = (i2) => i2) {
  return { regex, deser: ([s2]) => post(parseDigits(s2)) };
}
const NBSP = String.fromCharCode(160);
const spaceOrNBSP = `[ ${NBSP}]`;
const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
function fixListRegex(s2) {
  return s2.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}
function stripInsensitivities(s2) {
  return s2.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
}
function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: ([s2]) => strings.findIndex((i2) => stripInsensitivities(s2) === stripInsensitivities(i2)) + startIndex
    };
  }
}
function offset(regex, groups) {
  return { regex, deser: ([, h2, m2]) => signedOffset(h2, m2), groups };
}
function simple(regex) {
  return { regex, deser: ([s2]) => s2 };
}
function escapeToken(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function unitForToken(token, loc) {
  const one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = (t2) => ({ regex: RegExp(escapeToken(t2.val)), deser: ([s2]) => s2, literal: true }), unitate = (t2) => {
    if (token.literal) {
      return literal(t2);
    }
    switch (t2.val) {
      case "G":
        return oneOf(loc.eras("short"), 0);
      case "GG":
        return oneOf(loc.eras("long"), 0);
      case "y":
        return intUnit(oneToSix);
      case "yy":
        return intUnit(twoToFour, untruncateYear);
      case "yyyy":
        return intUnit(four);
      case "yyyyy":
        return intUnit(fourToSix);
      case "yyyyyy":
        return intUnit(six);
      case "M":
        return intUnit(oneOrTwo);
      case "MM":
        return intUnit(two);
      case "MMM":
        return oneOf(loc.months("short", true), 1);
      case "MMMM":
        return oneOf(loc.months("long", true), 1);
      case "L":
        return intUnit(oneOrTwo);
      case "LL":
        return intUnit(two);
      case "LLL":
        return oneOf(loc.months("short", false), 1);
      case "LLLL":
        return oneOf(loc.months("long", false), 1);
      case "d":
        return intUnit(oneOrTwo);
      case "dd":
        return intUnit(two);
      case "o":
        return intUnit(oneToThree);
      case "ooo":
        return intUnit(three);
      case "HH":
        return intUnit(two);
      case "H":
        return intUnit(oneOrTwo);
      case "hh":
        return intUnit(two);
      case "h":
        return intUnit(oneOrTwo);
      case "mm":
        return intUnit(two);
      case "m":
        return intUnit(oneOrTwo);
      case "q":
        return intUnit(oneOrTwo);
      case "qq":
        return intUnit(two);
      case "s":
        return intUnit(oneOrTwo);
      case "ss":
        return intUnit(two);
      case "S":
        return intUnit(oneToThree);
      case "SSS":
        return intUnit(three);
      case "u":
        return simple(oneToNine);
      case "uu":
        return simple(oneOrTwo);
      case "uuu":
        return intUnit(one);
      case "a":
        return oneOf(loc.meridiems(), 0);
      case "kkkk":
        return intUnit(four);
      case "kk":
        return intUnit(twoToFour, untruncateYear);
      case "W":
        return intUnit(oneOrTwo);
      case "WW":
        return intUnit(two);
      case "E":
      case "c":
        return intUnit(one);
      case "EEE":
        return oneOf(loc.weekdays("short", false), 1);
      case "EEEE":
        return oneOf(loc.weekdays("long", false), 1);
      case "ccc":
        return oneOf(loc.weekdays("short", true), 1);
      case "cccc":
        return oneOf(loc.weekdays("long", true), 1);
      case "Z":
      case "ZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
      case "ZZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);
      case " ":
        return simple(/[^\S\n\r]/);
      default:
        return literal(t2);
    }
  };
  const unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };
  unit.token = token;
  return unit;
}
const partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour12: {
    numeric: "h",
    "2-digit": "hh"
  },
  hour24: {
    numeric: "H",
    "2-digit": "HH"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  },
  timeZoneName: {
    long: "ZZZZZ",
    short: "ZZZ"
  }
};
function tokenForPart(part, formatOpts, resolvedOpts) {
  const { type, value } = part;
  if (type === "literal") {
    const isSpace = /^\s+$/.test(value);
    return {
      literal: !isSpace,
      val: isSpace ? " " : value
    };
  }
  const style = formatOpts[type];
  let actualType = type;
  if (type === "hour") {
    if (formatOpts.hour12 != null) {
      actualType = formatOpts.hour12 ? "hour12" : "hour24";
    } else if (formatOpts.hourCycle != null) {
      if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
        actualType = "hour12";
      } else {
        actualType = "hour24";
      }
    } else {
      actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
    }
  }
  let val = partTypeStyleToTokenVal[actualType];
  if (typeof val === "object") {
    val = val[style];
  }
  if (val) {
    return {
      literal: false,
      val
    };
  }
  return void 0;
}
function buildRegex(units) {
  const re2 = units.map((u2) => u2.regex).reduce((f2, r2) => `${f2}(${r2.source})`, "");
  return [`^${re2}$`, units];
}
function match(input2, regex, handlers) {
  const matches = input2.match(regex);
  if (matches) {
    const all = {};
    let matchIndex = 1;
    for (const i2 in handlers) {
      if (hasOwnProperty(handlers, i2)) {
        const h2 = handlers[i2], groups = h2.groups ? h2.groups + 1 : 1;
        if (!h2.literal && h2.token) {
          all[h2.token.val[0]] = h2.deser(matches.slice(matchIndex, matchIndex + groups));
        }
        matchIndex += groups;
      }
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}
function dateTimeFromMatches(matches) {
  const toField = (token) => {
    switch (token) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };
  let zone = null;
  let specificOffset;
  if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z);
  }
  if (!isUndefined(matches.Z)) {
    if (!zone) {
      zone = new FixedOffsetZone(matches.Z);
    }
    specificOffset = matches.Z;
  }
  if (!isUndefined(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }
  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }
  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }
  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }
  const vals = Object.keys(matches).reduce((r2, k2) => {
    const f2 = toField(k2);
    if (f2) {
      r2[f2] = matches[k2];
    }
    return r2;
  }, {});
  return [vals, zone, specificOffset];
}
let dummyDateTimeCache = null;
function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }
  return dummyDateTimeCache;
}
function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }
  const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
  const tokens = formatOptsToTokens(formatOpts, locale);
  if (tokens == null || tokens.includes(void 0)) {
    return token;
  }
  return tokens;
}
function expandMacroTokens(tokens, locale) {
  return Array.prototype.concat(...tokens.map((t2) => maybeExpandMacroToken(t2, locale)));
}
function explainFromTokens(locale, input2, format) {
  const tokens = expandMacroTokens(Formatter.parseFormat(format), locale), units = tokens.map((t2) => unitForToken(t2, locale)), disqualifyingUnit = units.find((t2) => t2.invalidReason);
  if (disqualifyingUnit) {
    return { input: input2, tokens, invalidReason: disqualifyingUnit.invalidReason };
  } else {
    const [regexString, handlers] = buildRegex(units), regex = RegExp(regexString, "i"), [rawMatches, matches] = match(input2, regex, handlers), [result, zone, specificOffset] = matches ? dateTimeFromMatches(matches) : [null, null, void 0];
    if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
      throw new ConflictingSpecificationError(
        "Can't include meridiem when specifying 24-hour format"
      );
    }
    return { input: input2, tokens, regex, rawMatches, matches, result, zone, specificOffset };
  }
}
function parseFromTokens(locale, input2, format) {
  const { result, zone, specificOffset, invalidReason } = explainFromTokens(locale, input2, format);
  return [result, zone, specificOffset, invalidReason];
}
function formatOptsToTokens(formatOpts, locale) {
  if (!formatOpts) {
    return null;
  }
  const formatter = Formatter.create(locale, formatOpts);
  const df = formatter.dtFormatter(getDummyDateTime());
  const parts = df.formatToParts();
  const resolvedOpts = df.resolvedOptions();
  return parts.map((p2) => tokenForPart(p2, formatOpts, resolvedOpts));
}
const INVALID = "Invalid DateTime";
const MAX_DATE = 864e13;
function unsupportedZone(zone) {
  return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
}
function possiblyCachedWeekData(dt2) {
  if (dt2.weekData === null) {
    dt2.weekData = gregorianToWeek(dt2.c);
  }
  return dt2.weekData;
}
function possiblyCachedLocalWeekData(dt2) {
  if (dt2.localWeekData === null) {
    dt2.localWeekData = gregorianToWeek(
      dt2.c,
      dt2.loc.getMinDaysInFirstWeek(),
      dt2.loc.getStartOfWeek()
    );
  }
  return dt2.localWeekData;
}
function clone(inst, alts) {
  const current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid
  };
  return new DateTime({ ...current, ...alts, old: current });
}
function fixOffset(localTS, o2, tz) {
  let utcGuess = localTS - o2 * 60 * 1e3;
  const o22 = tz.offset(utcGuess);
  if (o2 === o22) {
    return [utcGuess, o2];
  }
  utcGuess -= (o22 - o2) * 60 * 1e3;
  const o3 = tz.offset(utcGuess);
  if (o22 === o3) {
    return [utcGuess, o22];
  }
  return [localTS - Math.min(o22, o3) * 60 * 1e3, Math.max(o22, o3)];
}
function tsToObj(ts, offset2) {
  ts += offset2 * 60 * 1e3;
  const d2 = new Date(ts);
  return {
    year: d2.getUTCFullYear(),
    month: d2.getUTCMonth() + 1,
    day: d2.getUTCDate(),
    hour: d2.getUTCHours(),
    minute: d2.getUTCMinutes(),
    second: d2.getUTCSeconds(),
    millisecond: d2.getUTCMilliseconds()
  };
}
function objToTS(obj, offset2, zone) {
  return fixOffset(objToLocalTS(obj), offset2, zone);
}
function adjustTime(inst, dur) {
  const oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3, c2 = {
    ...inst.c,
    year,
    month,
    day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
  }, millisToAdd = Duration.fromObject({
    years: dur.years - Math.trunc(dur.years),
    quarters: dur.quarters - Math.trunc(dur.quarters),
    months: dur.months - Math.trunc(dur.months),
    weeks: dur.weeks - Math.trunc(dur.weeks),
    days: dur.days - Math.trunc(dur.days),
    hours: dur.hours,
    minutes: dur.minutes,
    seconds: dur.seconds,
    milliseconds: dur.milliseconds
  }).as("milliseconds"), localTS = objToLocalTS(c2);
  let [ts, o2] = fixOffset(localTS, oPre, inst.zone);
  if (millisToAdd !== 0) {
    ts += millisToAdd;
    o2 = inst.zone.offset(ts);
  }
  return { ts, o: o2 };
}
function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
  const { setZone, zone } = opts;
  if (parsed && Object.keys(parsed).length !== 0 || parsedZone) {
    const interpretationZone = parsedZone || zone, inst = DateTime.fromObject(parsed, {
      ...opts,
      zone: interpretationZone,
      specificOffset
    });
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime.invalid(
      new Invalid("unparsable", `the input "${text}" can't be parsed as ${format}`)
    );
  }
}
function toTechFormat(dt2, format, allowZ = true) {
  return dt2.isValid ? Formatter.create(Locale.create("en-US"), {
    allowZ,
    forceSimple: true
  }).formatDateTimeFromString(dt2, format) : null;
}
function toISODate(o2, extended) {
  const longFormat = o2.c.year > 9999 || o2.c.year < 0;
  let c2 = "";
  if (longFormat && o2.c.year >= 0)
    c2 += "+";
  c2 += padStart(o2.c.year, longFormat ? 6 : 4);
  if (extended) {
    c2 += "-";
    c2 += padStart(o2.c.month);
    c2 += "-";
    c2 += padStart(o2.c.day);
  } else {
    c2 += padStart(o2.c.month);
    c2 += padStart(o2.c.day);
  }
  return c2;
}
function toISOTime(o2, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone) {
  let c2 = padStart(o2.c.hour);
  if (extended) {
    c2 += ":";
    c2 += padStart(o2.c.minute);
    if (o2.c.millisecond !== 0 || o2.c.second !== 0 || !suppressSeconds) {
      c2 += ":";
    }
  } else {
    c2 += padStart(o2.c.minute);
  }
  if (o2.c.millisecond !== 0 || o2.c.second !== 0 || !suppressSeconds) {
    c2 += padStart(o2.c.second);
    if (o2.c.millisecond !== 0 || !suppressMilliseconds) {
      c2 += ".";
      c2 += padStart(o2.c.millisecond, 3);
    }
  }
  if (includeOffset) {
    if (o2.isOffsetFixed && o2.offset === 0 && !extendedZone) {
      c2 += "Z";
    } else if (o2.o < 0) {
      c2 += "-";
      c2 += padStart(Math.trunc(-o2.o / 60));
      c2 += ":";
      c2 += padStart(Math.trunc(-o2.o % 60));
    } else {
      c2 += "+";
      c2 += padStart(Math.trunc(o2.o / 60));
      c2 += ":";
      c2 += padStart(Math.trunc(o2.o % 60));
    }
  }
  if (extendedZone) {
    c2 += "[" + o2.zone.ianaName + "]";
  }
  return c2;
}
const defaultUnitValues = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, defaultWeekUnitValues = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}, defaultOrdinalUnitValues = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
const orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"], orderedWeekUnits = [
  "weekYear",
  "weekNumber",
  "weekday",
  "hour",
  "minute",
  "second",
  "millisecond"
], orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
function normalizeUnit(unit) {
  const normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[unit.toLowerCase()];
  if (!normalized)
    throw new InvalidUnitError(unit);
  return normalized;
}
function normalizeUnitWithLocalWeeks(unit) {
  switch (unit.toLowerCase()) {
    case "localweekday":
    case "localweekdays":
      return "localWeekday";
    case "localweeknumber":
    case "localweeknumbers":
      return "localWeekNumber";
    case "localweekyear":
    case "localweekyears":
      return "localWeekYear";
    default:
      return normalizeUnit(unit);
  }
}
function quickDT(obj, opts) {
  const zone = normalizeZone(opts.zone, Settings$1.defaultZone), loc = Locale.fromObject(opts), tsNow = Settings$1.now();
  let ts, o2;
  if (!isUndefined(obj.year)) {
    for (const u2 of orderedUnits) {
      if (isUndefined(obj[u2])) {
        obj[u2] = defaultUnitValues[u2];
      }
    }
    const invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
    if (invalid) {
      return DateTime.invalid(invalid);
    }
    const offsetProvis = zone.offset(tsNow);
    [ts, o2] = objToTS(obj, offsetProvis, zone);
  } else {
    ts = tsNow;
  }
  return new DateTime({ ts, zone, loc, o: o2 });
}
function diffRelative(start, end, opts) {
  const round = isUndefined(opts.round) ? true : opts.round, format = (c2, unit) => {
    c2 = roundTo(c2, round || opts.calendary ? 0 : 2, true);
    const formatter = end.loc.clone(opts).relFormatter(opts);
    return formatter.format(c2, unit);
  }, differ = (unit) => {
    if (opts.calendary) {
      if (!end.hasSame(start, unit)) {
        return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
      } else
        return 0;
    } else {
      return end.diff(start, unit).get(unit);
    }
  };
  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }
  for (const unit of opts.units) {
    const count = differ(unit);
    if (Math.abs(count) >= 1) {
      return format(count, unit);
    }
  }
  return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
}
function lastOpts(argList) {
  let opts = {}, args;
  if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
    opts = argList[argList.length - 1];
    args = Array.from(argList).slice(0, argList.length - 1);
  } else {
    args = Array.from(argList);
  }
  return [opts, args];
}
class DateTime {
  /**
   * @access private
   */
  constructor(config) {
    const zone = config.zone || Settings$1.defaultZone;
    let invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
    this.ts = isUndefined(config.ts) ? Settings$1.now() : config.ts;
    let c2 = null, o2 = null;
    if (!invalid) {
      const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
      if (unchanged) {
        [c2, o2] = [config.old.c, config.old.o];
      } else {
        const ot2 = zone.offset(this.ts);
        c2 = tsToObj(this.ts, ot2);
        invalid = Number.isNaN(c2.year) ? new Invalid("invalid input") : null;
        c2 = invalid ? null : c2;
        o2 = invalid ? null : ot2;
      }
    }
    this._zone = zone;
    this.loc = config.loc || Locale.create();
    this.invalid = invalid;
    this.weekData = null;
    this.localWeekData = null;
    this.c = c2;
    this.o = o2;
    this.isLuxonDateTime = true;
  }
  // CONSTRUCT
  /**
   * Create a DateTime for the current instant, in the system's time zone.
   *
   * Use Settings to override these default values if needed.
   * @example DateTime.now().toISO() //~> now in the ISO format
   * @return {DateTime}
   */
  static now() {
    return new DateTime({});
  }
  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month, 1-indexed
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                                  //~> now
   * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
   * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
   * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
   * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */
  static local() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }
  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @param {Object} options - configuration options for the DateTime
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @example DateTime.utc()                                              //~> now
   * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
   * @return {DateTime}
   */
  static utc() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    opts.zone = FixedOffsetZone.utcInstance;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }
  /**
   * Create a DateTime from a JavaScript Date object. Uses the default zone.
   * @param {Date} date - a JavaScript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  static fromJSDate(date, options = {}) {
    const ts = isDate(date) ? date.valueOf() : NaN;
    if (Number.isNaN(ts)) {
      return DateTime.invalid("invalid input");
    }
    const zoneToUse = normalizeZone(options.zone, Settings$1.defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }
    return new DateTime({
      ts,
      zone: zoneToUse,
      loc: Locale.fromObject(options)
    });
  }
  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromMillis(milliseconds, options = {}) {
    if (!isNumber(milliseconds)) {
      throw new InvalidArgumentError(
        `fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`
      );
    } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
      return DateTime.invalid("Timestamp out of range");
    } else {
      return new DateTime({
        ts: milliseconds,
        zone: normalizeZone(options.zone, Settings$1.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromSeconds(seconds, options = {}) {
    if (!isNumber(seconds)) {
      throw new InvalidArgumentError("fromSeconds requires a numerical input");
    } else {
      return new DateTime({
        ts: seconds * 1e3,
        zone: normalizeZone(options.zone, Settings$1.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.localWeekYear - a week year, according to the locale
   * @param {number} obj.localWeekNumber - a week number, between 1 and 52 or 53, depending on the year, according to the locale
   * @param {number} obj.localWeekday - a weekday, 1-7, where 1 is the first and 7 is the last day of the week, according to the locale
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {Object} opts - options for creating this DateTime
   * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [opts.locale='system\'s locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @example DateTime.fromObject({ localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 }, { locale: "en-US" }).toISODate() //=> '2021-12-26'
   * @return {DateTime}
   */
  static fromObject(obj, opts = {}) {
    obj = obj || {};
    const zoneToUse = normalizeZone(opts.zone, Settings$1.defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }
    const loc = Locale.fromObject(opts);
    const normalized = normalizeObject(obj, normalizeUnitWithLocalWeeks);
    const { minDaysInFirstWeek, startOfWeek } = usesLocalWeekValues(normalized, loc);
    const tsNow = Settings$1.now(), offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError(
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    const useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
    let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = gregorianToWeek(objNow, minDaysInFirstWeek, startOfWeek);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = gregorianToOrdinal(objNow);
    } else {
      units = orderedUnits;
      defaultValues = defaultUnitValues;
    }
    let foundFirst = false;
    for (const u2 of units) {
      const v2 = normalized[u2];
      if (!isUndefined(v2)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u2] = defaultValues[u2];
      } else {
        normalized[u2] = objNow[u2];
      }
    }
    const higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid = higherOrderInvalid || hasInvalidTimeData(normalized);
    if (invalid) {
      return DateTime.invalid(invalid);
    }
    const gregorian = useWeekData ? weekToGregorian(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse), inst = new DateTime({
      ts: tsFinal,
      zone: zoneToUse,
      o: offsetFinal,
      loc
    });
    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return DateTime.invalid(
        "mismatched weekday",
        `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`
      );
    }
    return inst;
  }
  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  static fromISO(text, opts = {}) {
    const [vals, parsedZone] = parseISODate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }
  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  static fromRFC2822(text, opts = {}) {
    const [vals, parsedZone] = parseRFC2822Date(text);
    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }
  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  static fromHTTP(text, opts = {}) {
    const [vals, parsedZone] = parseHTTPDate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }
  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromFormat(text, fmt, opts = {}) {
    if (isUndefined(text) || isUndefined(fmt)) {
      throw new InvalidArgumentError("fromFormat requires an input string and a format");
    }
    const { locale = null, numberingSystem = null } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    }), [vals, parsedZone, specificOffset, invalid] = parseFromTokens(localeToUse, text, fmt);
    if (invalid) {
      return DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
    }
  }
  /**
   * @deprecated use fromFormat instead
   */
  static fromString(text, fmt, opts = {}) {
    return DateTime.fromFormat(text, fmt, opts);
  }
  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  static fromSQL(text, opts = {}) {
    const [vals, parsedZone] = parseSQL(text);
    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }
  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent.
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings$1.throwOnInvalid) {
      throw new InvalidDateTimeError(invalid);
    } else {
      return new DateTime({ invalid });
    }
  }
  /**
   * Check if an object is an instance of DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDateTime(o2) {
    return o2 && o2.isLuxonDateTime || false;
  }
  /**
   * Produce the format string for a set of options
   * @param formatOpts
   * @param localeOpts
   * @returns {string}
   */
  static parseFormatForOpts(formatOpts, localeOpts = {}) {
    const tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
    return !tokenList ? null : tokenList.map((t2) => t2 ? t2.val : null).join("");
  }
  /**
   * Produce the the fully expanded format token for the locale
   * Does NOT quote characters, so quoted tokens will not round trip correctly
   * @param fmt
   * @param localeOpts
   * @returns {string}
   */
  static expandFormat(fmt, localeOpts = {}) {
    const expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
    return expanded.map((t2) => t2.val).join("");
  }
  // INFO
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  get(unit) {
    return this[unit];
  }
  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
   *
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
   *
   * @type {string}
   */
  get outputCalendar() {
    return this.isValid ? this.loc.outputCalendar : null;
  }
  /**
   * Get the time zone associated with this DateTime.
   * @type {Zone}
   */
  get zone() {
    return this._zone;
  }
  /**
   * Get the name of the time zone.
   * @type {string}
   */
  get zoneName() {
    return this.isValid ? this.zone.name : null;
  }
  /**
   * Get the year
   * @example DateTime.local(2017, 5, 25).year //=> 2017
   * @type {number}
   */
  get year() {
    return this.isValid ? this.c.year : NaN;
  }
  /**
   * Get the quarter
   * @example DateTime.local(2017, 5, 25).quarter //=> 2
   * @type {number}
   */
  get quarter() {
    return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
  }
  /**
   * Get the month (1-12).
   * @example DateTime.local(2017, 5, 25).month //=> 5
   * @type {number}
   */
  get month() {
    return this.isValid ? this.c.month : NaN;
  }
  /**
   * Get the day of the month (1-30ish).
   * @example DateTime.local(2017, 5, 25).day //=> 25
   * @type {number}
   */
  get day() {
    return this.isValid ? this.c.day : NaN;
  }
  /**
   * Get the hour of the day (0-23).
   * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
   * @type {number}
   */
  get hour() {
    return this.isValid ? this.c.hour : NaN;
  }
  /**
   * Get the minute of the hour (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
   * @type {number}
   */
  get minute() {
    return this.isValid ? this.c.minute : NaN;
  }
  /**
   * Get the second of the minute (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
   * @type {number}
   */
  get second() {
    return this.isValid ? this.c.second : NaN;
  }
  /**
   * Get the millisecond of the second (0-999).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
   * @type {number}
   */
  get millisecond() {
    return this.isValid ? this.c.millisecond : NaN;
  }
  /**
   * Get the week year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
   * @type {number}
   */
  get weekYear() {
    return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
  }
  /**
   * Get the week number of the week year (1-52ish).
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
   * @type {number}
   */
  get weekNumber() {
    return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
  }
  /**
   * Get the day of the week.
   * 1 is Monday and 7 is Sunday
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 11, 31).weekday //=> 4
   * @type {number}
   */
  get weekday() {
    return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
  }
  /**
   * Returns true if this date is on a weekend according to the locale, false otherwise
   * @returns {boolean}
   */
  get isWeekend() {
    return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
  }
  /**
   * Get the day of the week according to the locale.
   * 1 is the first day of the week and 7 is the last day of the week.
   * If the locale assigns Sunday as the first day of the week, then a date which is a Sunday will return 1,
   * @returns {number}
   */
  get localWeekday() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekday : NaN;
  }
  /**
   * Get the week number of the week year according to the locale. Different locales assign week numbers differently,
   * because the week can start on different days of the week (see localWeekday) and because a different number of days
   * is required for a week to count as the first week of a year.
   * @returns {number}
   */
  get localWeekNumber() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekNumber : NaN;
  }
  /**
   * Get the week year according to the locale. Different locales assign week numbers (and therefor week years)
   * differently, see localWeekNumber.
   * @returns {number}
   */
  get localWeekYear() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekYear : NaN;
  }
  /**
   * Get the ordinal (meaning the day of the year)
   * @example DateTime.local(2017, 5, 25).ordinal //=> 145
   * @type {number|DateTime}
   */
  get ordinal() {
    return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
  }
  /**
   * Get the human readable short month name, such as 'Oct'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
   * @type {string}
   */
  get monthShort() {
    return this.isValid ? Info.months("short", { locObj: this.loc })[this.month - 1] : null;
  }
  /**
   * Get the human readable long month name, such as 'October'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthLong //=> October
   * @type {string}
   */
  get monthLong() {
    return this.isValid ? Info.months("long", { locObj: this.loc })[this.month - 1] : null;
  }
  /**
   * Get the human readable short weekday, such as 'Mon'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
   * @type {string}
   */
  get weekdayShort() {
    return this.isValid ? Info.weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
  }
  /**
   * Get the human readable long weekday, such as 'Monday'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
   * @type {string}
   */
  get weekdayLong() {
    return this.isValid ? Info.weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
  }
  /**
   * Get the UTC offset of this DateTime in minutes
   * @example DateTime.now().offset //=> -240
   * @example DateTime.utc().offset //=> 0
   * @type {number}
   */
  get offset() {
    return this.isValid ? +this.o : NaN;
  }
  /**
   * Get the short human name for the zone's current offset, for example "EST" or "EDT".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameShort() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "short",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  /**
   * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameLong() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "long",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  /**
   * Get whether this zone's offset ever changes, as in a DST.
   * @type {boolean}
   */
  get isOffsetFixed() {
    return this.isValid ? this.zone.isUniversal : null;
  }
  /**
   * Get whether the DateTime is in a DST.
   * @type {boolean}
   */
  get isInDST() {
    if (this.isOffsetFixed) {
      return false;
    } else {
      return this.offset > this.set({ month: 1, day: 1 }).offset || this.offset > this.set({ month: 5 }).offset;
    }
  }
  /**
   * Get those DateTimes which have the same local time as this DateTime, but a different offset from UTC
   * in this DateTime's zone. During DST changes local time can be ambiguous, for example
   * `2023-10-29T02:30:00` in `Europe/Berlin` can have offset `+01:00` or `+02:00`.
   * This method will return both possible DateTimes if this DateTime's local time is ambiguous.
   * @returns {DateTime[]}
   */
  getPossibleOffsets() {
    if (!this.isValid || this.isOffsetFixed) {
      return [this];
    }
    const dayMs = 864e5;
    const minuteMs = 6e4;
    const localTS = objToLocalTS(this.c);
    const oEarlier = this.zone.offset(localTS - dayMs);
    const oLater = this.zone.offset(localTS + dayMs);
    const o1 = this.zone.offset(localTS - oEarlier * minuteMs);
    const o2 = this.zone.offset(localTS - oLater * minuteMs);
    if (o1 === o2) {
      return [this];
    }
    const ts1 = localTS - o1 * minuteMs;
    const ts2 = localTS - o2 * minuteMs;
    const c1 = tsToObj(ts1, o1);
    const c2 = tsToObj(ts2, o2);
    if (c1.hour === c2.hour && c1.minute === c2.minute && c1.second === c2.second && c1.millisecond === c2.millisecond) {
      return [clone(this, { ts: ts1 }), clone(this, { ts: ts2 })];
    }
    return [this];
  }
  /**
   * Returns true if this DateTime is in a leap year, false otherwise
   * @example DateTime.local(2016).isInLeapYear //=> true
   * @example DateTime.local(2013).isInLeapYear //=> false
   * @type {boolean}
   */
  get isInLeapYear() {
    return isLeapYear(this.year);
  }
  /**
   * Returns the number of days in this DateTime's month
   * @example DateTime.local(2016, 2).daysInMonth //=> 29
   * @example DateTime.local(2016, 3).daysInMonth //=> 31
   * @type {number}
   */
  get daysInMonth() {
    return daysInMonth(this.year, this.month);
  }
  /**
   * Returns the number of days in this DateTime's year
   * @example DateTime.local(2016).daysInYear //=> 366
   * @example DateTime.local(2013).daysInYear //=> 365
   * @type {number}
   */
  get daysInYear() {
    return this.isValid ? daysInYear(this.year) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2004).weeksInWeekYear //=> 53
   * @example DateTime.local(2013).weeksInWeekYear //=> 52
   * @type {number}
   */
  get weeksInWeekYear() {
    return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's local week year
   * @example DateTime.local(2020, 6, {locale: 'en-US'}).weeksInLocalWeekYear //=> 52
   * @example DateTime.local(2020, 6, {locale: 'de-DE'}).weeksInLocalWeekYear //=> 53
   * @type {number}
   */
  get weeksInLocalWeekYear() {
    return this.isValid ? weeksInWeekYear(
      this.localWeekYear,
      this.loc.getMinDaysInFirstWeek(),
      this.loc.getStartOfWeek()
    ) : NaN;
  }
  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  resolvedLocaleOptions(opts = {}) {
    const { locale, numberingSystem, calendar } = Formatter.create(
      this.loc.clone(opts),
      opts
    ).resolvedOptions(this);
    return { locale, numberingSystem, outputCalendar: calendar };
  }
  // TRANSFORM
  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link DateTime#setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  toUTC(offset2 = 0, opts = {}) {
    return this.setZone(FixedOffsetZone.instance(offset2), opts);
  }
  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.setZone(Settings$1.defaultZone);
  }
  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  setZone(zone, { keepLocalTime = false, keepCalendarTime = false } = {}) {
    zone = normalizeZone(zone, Settings$1.defaultZone);
    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return DateTime.invalid(unsupportedZone(zone));
    } else {
      let newTS = this.ts;
      if (keepLocalTime || keepCalendarTime) {
        const offsetGuess = zone.offset(this.ts);
        const asObj = this.toObject();
        [newTS] = objToTS(asObj, offsetGuess, zone);
      }
      return clone(this, { ts: newTS, zone });
    }
  }
  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  reconfigure({ locale, numberingSystem, outputCalendar } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem, outputCalendar });
    return clone(this, { loc });
  }
  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  setLocale(locale) {
    return this.reconfigure({ locale });
  }
  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
   *
   * This method also supports setting locale-based week units, i.e. `localWeekday`, `localWeekNumber` and `localWeekYear`.
   * They cannot be mixed with ISO-week units like `weekday`.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  set(values) {
    if (!this.isValid)
      return this;
    const normalized = normalizeObject(values, normalizeUnitWithLocalWeeks);
    const { minDaysInFirstWeek, startOfWeek } = usesLocalWeekValues(normalized, this.loc);
    const settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError(
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    let mixed;
    if (settingWeekStuff) {
      mixed = weekToGregorian(
        { ...gregorianToWeek(this.c, minDaysInFirstWeek, startOfWeek), ...normalized },
        minDaysInFirstWeek,
        startOfWeek
      );
    } else if (!isUndefined(normalized.ordinal)) {
      mixed = ordinalToGregorian({ ...gregorianToOrdinal(this.c), ...normalized });
    } else {
      mixed = { ...this.toObject(), ...normalized };
      if (isUndefined(normalized.day)) {
        mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
      }
    }
    const [ts, o2] = objToTS(mixed, this.o, this.zone);
    return clone(this, { ts, o: o2 });
  }
  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.now().plus(123) //~> in 123 milliseconds
   * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  plus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration);
    return clone(this, adjustTime(this, dur));
  }
  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link DateTime#plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
   */
  minus(duration) {
    if (!this.isValid)
      return this;
    const dur = Duration.fromDurationLike(duration).negate();
    return clone(this, adjustTime(this, dur));
  }
  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  startOf(unit, { useLocaleWeeks = false } = {}) {
    if (!this.isValid)
      return this;
    const o2 = {}, normalizedUnit = Duration.normalizeUnit(unit);
    switch (normalizedUnit) {
      case "years":
        o2.month = 1;
      case "quarters":
      case "months":
        o2.day = 1;
      case "weeks":
      case "days":
        o2.hour = 0;
      case "hours":
        o2.minute = 0;
      case "minutes":
        o2.second = 0;
      case "seconds":
        o2.millisecond = 0;
        break;
    }
    if (normalizedUnit === "weeks") {
      if (useLocaleWeeks) {
        const startOfWeek = this.loc.getStartOfWeek();
        const { weekday } = this;
        if (weekday < startOfWeek) {
          o2.weekNumber = this.weekNumber - 1;
        }
        o2.weekday = startOfWeek;
      } else {
        o2.weekday = 1;
      }
    }
    if (normalizedUnit === "quarters") {
      const q2 = Math.ceil(this.month / 3);
      o2.month = (q2 - 1) * 3 + 1;
    }
    return this.set(o2);
  }
  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  endOf(unit, opts) {
    return this.isValid ? this.plus({ [unit]: 1 }).startOf(unit, opts).minus(1) : this;
  }
  // OUTPUT
  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID;
  }
  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toLocaleString(); //=> 4/20/2017
   * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL, { locale: 'fr' }); //=> '28 août 2022'
   * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
   * @return {string}
   */
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID;
  }
  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.now().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  toLocaleParts(opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=false] - add the time zone format extension
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1983, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @return {string}
   */
  toISO({
    format = "extended",
    suppressSeconds = false,
    suppressMilliseconds = false,
    includeOffset = true,
    extendedZone = false
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    const ext = format === "extended";
    let c2 = toISODate(this, ext);
    c2 += "T";
    c2 += toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
    return c2;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @return {string}
   */
  toISODate({ format = "extended" } = {}) {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, format === "extended");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=true] - add the time zone format extension
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
   * @return {string}
   */
  toISOTime({
    suppressMilliseconds = false,
    suppressSeconds = false,
    includeOffset = true,
    includePrefix = false,
    extendedZone = false,
    format = "extended"
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    let c2 = includePrefix ? "T" : "";
    return c2 + toISOTime(
      this,
      format === "extended",
      suppressSeconds,
      suppressMilliseconds,
      includeOffset,
      extendedZone
    );
  }
  /**
   * Returns an RFC 2822-compatible string representation of this DateTime
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string}
   */
  toSQLDate() {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, true);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  toSQLTime({ includeOffset = true, includeZone = false, includeOffsetSpace = true } = {}) {
    let fmt = "HH:mm:ss.SSS";
    if (includeZone || includeOffset) {
      if (includeOffsetSpace) {
        fmt += " ";
      }
      if (includeZone) {
        fmt += "z";
      } else if (includeOffset) {
        fmt += "ZZ";
      }
    }
    return toTechFormat(this, fmt, true);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  toSQL(opts = {}) {
    if (!this.isValid) {
      return null;
    }
    return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
  }
  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  toString() {
    return this.isValid ? this.toISO() : INVALID;
  }
  /**
   * Returns a string representation of this DateTime appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`;
    } else {
      return `DateTime { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  /**
   * Returns the epoch seconds of this DateTime.
   * @return {number}
   */
  toSeconds() {
    return this.isValid ? this.ts / 1e3 : NaN;
  }
  /**
   * Returns the epoch seconds (as a whole number) of this DateTime.
   * @return {number}
   */
  toUnixInteger() {
    return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
  }
  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  toBSON() {
    return this.toJSDate();
  }
  /**
   * Returns a JavaScript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  toObject(opts = {}) {
    if (!this.isValid)
      return {};
    const base = { ...this.c };
    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }
    return base;
  }
  /**
   * Returns a JavaScript Date equivalent to this DateTime.
   * @return {Date}
   */
  toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  }
  // COMPARE
  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  diff(otherDateTime, unit = "milliseconds", opts = {}) {
    if (!this.isValid || !otherDateTime.isValid) {
      return Duration.invalid("created by diffing an invalid DateTime");
    }
    const durOpts = { locale: this.locale, numberingSystem: this.numberingSystem, ...opts };
    const units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = diff(earlier, later, units, durOpts);
    return otherIsLater ? diffed.negate() : diffed;
  }
  /**
   * Return the difference between this DateTime and right now.
   * See {@link DateTime#diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  diffNow(unit = "milliseconds", opts = {}) {
    return this.diff(DateTime.now(), unit, opts);
  }
  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval}
   */
  until(otherDateTime) {
    return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
  }
  /**
   * Return whether this DateTime is in the same unit of time as another DateTime.
   * Higher-order units must also be identical for this function to return `true`.
   * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; only the locale of this DateTime is used
   * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
   * @return {boolean}
   */
  hasSame(otherDateTime, unit, opts) {
    if (!this.isValid)
      return false;
    const inputMs = otherDateTime.valueOf();
    const adjustedToZone = this.setZone(otherDateTime.zone, { keepLocalTime: true });
    return adjustedToZone.startOf(unit, opts) <= inputMs && inputMs <= adjustedToZone.endOf(unit, opts);
  }
  /**
   * Equality check
   * Two DateTimes are equal if and only if they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  equals(other) {
    return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
  }
  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds down by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  toRelative(options = {}) {
    if (!this.isValid)
      return null;
    const base = options.base || DateTime.fromObject({}, { zone: this.zone }), padding = options.padding ? this < base ? -options.padding : options.padding : 0;
    let units = ["years", "months", "days", "hours", "minutes", "seconds"];
    let unit = options.unit;
    if (Array.isArray(options.unit)) {
      units = options.unit;
      unit = void 0;
    }
    return diffRelative(base, this.plus(padding), {
      ...options,
      numeric: "always",
      units,
      unit
    });
  }
  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  toRelativeCalendar(options = {}) {
    if (!this.isValid)
      return null;
    return diffRelative(options.base || DateTime.fromObject({}, { zone: this.zone }), this, {
      ...options,
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true
    });
  }
  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  static min(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("min requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i2) => i2.valueOf(), Math.min);
  }
  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  static max(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("max requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i2) => i2.valueOf(), Math.max);
  }
  // MISC
  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  static fromFormatExplain(text, fmt, options = {}) {
    const { locale = null, numberingSystem = null } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return explainFromTokens(localeToUse, text, fmt);
  }
  /**
   * @deprecated use fromFormatExplain instead
   */
  static fromStringExplain(text, fmt, options = {}) {
    return DateTime.fromFormatExplain(text, fmt, options);
  }
  // FORMAT PRESETS
  /**
   * {@link DateTime#toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  static get DATE_SHORT() {
    return DATE_SHORT;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED() {
    return DATE_MED;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED_WITH_WEEKDAY() {
    return DATE_MED_WITH_WEEKDAY;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983'
   * @type {Object}
   */
  static get DATE_FULL() {
    return DATE_FULL;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
   * @type {Object}
   */
  static get DATE_HUGE() {
    return DATE_HUGE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_SIMPLE() {
    return TIME_SIMPLE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SECONDS() {
    return TIME_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SHORT_OFFSET() {
    return TIME_WITH_SHORT_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_LONG_OFFSET() {
    return TIME_WITH_LONG_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_SIMPLE() {
    return TIME_24_SIMPLE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SECONDS() {
    return TIME_24_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SHORT_OFFSET() {
    return TIME_24_WITH_SHORT_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_LONG_OFFSET() {
    return TIME_24_WITH_LONG_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT() {
    return DATETIME_SHORT;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT_WITH_SECONDS() {
    return DATETIME_SHORT_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED() {
    return DATETIME_MED;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_SECONDS() {
    return DATETIME_MED_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_WEEKDAY() {
    return DATETIME_MED_WITH_WEEKDAY;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL() {
    return DATETIME_FULL;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL_WITH_SECONDS() {
    return DATETIME_FULL_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE() {
    return DATETIME_HUGE;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE_WITH_SECONDS() {
    return DATETIME_HUGE_WITH_SECONDS;
  }
}
function friendlyDateTime(dateTimeish) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime.fromObject(dateTimeish);
  } else {
    throw new InvalidArgumentError(
      `Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`
    );
  }
}
async function getAllSessions() {
  return await BrowserDB.sessions.toArray();
}
async function clearAllSessions() {
  return await BrowserDB.sessions.clear();
}
async function getSession(id) {
  return await BrowserDB.sessions.get(id);
}
async function getLastSession() {
  return await BrowserDB.sessions.get("lastUsed");
}
async function saveSession(id, session) {
  let _id = id || "lastUsed";
  let _session = session || appSession;
  return await BrowserDB.sessions.put(
    {
      id: _id,
      dateCreated: _session?.dateCreated,
      dateModified: DateTime.now().toISO(),
      data: _session.temp
    }
  );
}
const SessionManager = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clearAllSessions,
  getAllSessions,
  getLastSession,
  getSession,
  saveSession
}, Symbol.toStringTag, { value: "Module" }));
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
function getAugmentedNamespace(n2) {
  if (n2.__esModule)
    return n2;
  var f2 = n2.default;
  if (typeof f2 == "function") {
    var a2 = function a3() {
      if (this instanceof a3) {
        return Reflect.construct(f2, arguments, this.constructor);
      }
      return f2.apply(this, arguments);
    };
    a2.prototype = f2.prototype;
  } else
    a2 = {};
  Object.defineProperty(a2, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k2) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k2);
    Object.defineProperty(a2, k2, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k2];
      }
    });
  });
  return a2;
}
var sqlWasm = { exports: {} };
const __viteBrowserExternal = {};
const __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
(function(module, exports) {
  var initSqlJsPromise = void 0;
  var initSqlJs2 = function(moduleConfig) {
    if (initSqlJsPromise) {
      return initSqlJsPromise;
    }
    initSqlJsPromise = new Promise(function(resolveModule, reject) {
      var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
      var originalOnAbortFunction = Module["onAbort"];
      Module["onAbort"] = function(errorThatCausedAbort) {
        reject(new Error(errorThatCausedAbort));
        if (originalOnAbortFunction) {
          originalOnAbortFunction(errorThatCausedAbort);
        }
      };
      Module["postRun"] = Module["postRun"] || [];
      Module["postRun"].push(function() {
        resolveModule(Module);
      });
      module = void 0;
      var f2;
      f2 ||= typeof Module !== "undefined" ? Module : {};
      f2.onRuntimeInitialized = function() {
        function a2(g2, l2) {
          switch (typeof l2) {
            case "boolean":
              mc(g2, l2 ? 1 : 0);
              break;
            case "number":
              nc(g2, l2);
              break;
            case "string":
              oc(g2, l2, -1, -1);
              break;
            case "object":
              if (null === l2)
                lb(g2);
              else if (null != l2.length) {
                var n2 = aa(l2, ba);
                pc(g2, n2, l2.length, -1);
                ca(n2);
              } else
                Aa(g2, "Wrong API use : tried to return a value of an unknown type (" + l2 + ").", -1);
              break;
            default:
              lb(g2);
          }
        }
        function b2(g2, l2) {
          for (var n2 = [], t2 = 0; t2 < g2; t2 += 1) {
            var w2 = m2(l2 + 4 * t2, "i32"), z2 = qc(w2);
            if (1 === z2 || 2 === z2)
              w2 = rc(w2);
            else if (3 === z2)
              w2 = sc(w2);
            else if (4 === z2) {
              z2 = w2;
              w2 = tc(z2);
              z2 = uc(z2);
              for (var N2 = new Uint8Array(w2), L2 = 0; L2 < w2; L2 += 1)
                N2[L2] = p2[z2 + L2];
              w2 = N2;
            } else
              w2 = null;
            n2.push(w2);
          }
          return n2;
        }
        function c2(g2, l2) {
          this.La = g2;
          this.db = l2;
          this.Ja = 1;
          this.fb = [];
        }
        function d2(g2, l2) {
          this.db = l2;
          l2 = da(g2) + 1;
          this.Ya = ea(l2);
          if (null === this.Ya)
            throw Error("Unable to allocate memory for the SQL string");
          fa(g2, q2, this.Ya, l2);
          this.eb = this.Ya;
          this.Ua = this.ib = null;
        }
        function e2(g2) {
          this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
          if (null != g2) {
            var l2 = this.filename, n2 = "/", t2 = l2;
            n2 && (n2 = "string" == typeof n2 ? n2 : ha(n2), t2 = l2 ? u2(n2 + "/" + l2) : n2);
            l2 = ia(true, true);
            t2 = ja(t2, (void 0 !== l2 ? l2 : 438) & 4095 | 32768, 0);
            if (g2) {
              if ("string" == typeof g2) {
                n2 = Array(g2.length);
                for (var w2 = 0, z2 = g2.length; w2 < z2; ++w2)
                  n2[w2] = g2.charCodeAt(w2);
                g2 = n2;
              }
              ka(t2, l2 | 146);
              n2 = la(t2, 577);
              ma(n2, g2, 0, g2.length, 0);
              na(n2);
              ka(t2, l2);
            }
          }
          this.handleError(r2(this.filename, h2));
          this.db = m2(h2, "i32");
          ob(this.db);
          this.Za = {};
          this.Na = {};
        }
        var h2 = x2(4), k2 = f2.cwrap, r2 = k2("sqlite3_open", "number", ["string", "number"]), y2 = k2("sqlite3_close_v2", "number", ["number"]), v2 = k2("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), F2 = k2(
          "sqlite3_changes",
          "number",
          ["number"]
        ), H2 = k2("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), pb = k2("sqlite3_sql", "string", ["number"]), vc = k2("sqlite3_normalized_sql", "string", ["number"]), qb = k2("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), wc = k2("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = k2("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), xc = k2("sqlite3_bind_double", "number", ["number", "number", "number"]), yc = k2("sqlite3_bind_int", "number", ["number", "number", "number"]), zc = k2("sqlite3_bind_parameter_index", "number", ["number", "string"]), Ac = k2("sqlite3_step", "number", ["number"]), Bc = k2("sqlite3_errmsg", "string", ["number"]), Cc = k2("sqlite3_column_count", "number", ["number"]), Dc = k2("sqlite3_data_count", "number", ["number"]), Ec = k2("sqlite3_column_double", "number", ["number", "number"]), sb = k2("sqlite3_column_text", "string", ["number", "number"]), Fc = k2("sqlite3_column_blob", "number", ["number", "number"]), Gc = k2(
          "sqlite3_column_bytes",
          "number",
          ["number", "number"]
        ), Hc = k2("sqlite3_column_type", "number", ["number", "number"]), Ic = k2("sqlite3_column_name", "string", ["number", "number"]), Jc = k2("sqlite3_reset", "number", ["number"]), Kc = k2("sqlite3_clear_bindings", "number", ["number"]), Lc = k2("sqlite3_finalize", "number", ["number"]), tb = k2("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), qc = k2("sqlite3_value_type", "number", ["number"]), tc = k2("sqlite3_value_bytes", "number", ["number"]), sc = k2(
          "sqlite3_value_text",
          "string",
          ["number"]
        ), uc = k2("sqlite3_value_blob", "number", ["number"]), rc = k2("sqlite3_value_double", "number", ["number"]), nc = k2("sqlite3_result_double", "", ["number", "number"]), lb = k2("sqlite3_result_null", "", ["number"]), oc = k2("sqlite3_result_text", "", ["number", "string", "number", "number"]), pc = k2("sqlite3_result_blob", "", ["number", "number", "number", "number"]), mc = k2("sqlite3_result_int", "", ["number", "number"]), Aa = k2("sqlite3_result_error", "", ["number", "string", "number"]), ub = k2(
          "sqlite3_aggregate_context",
          "number",
          ["number", "number"]
        ), ob = k2("RegisterExtensionFunctions", "number", ["number"]);
        c2.prototype.bind = function(g2) {
          if (!this.La)
            throw "Statement closed";
          this.reset();
          return Array.isArray(g2) ? this.wb(g2) : null != g2 && "object" === typeof g2 ? this.xb(g2) : true;
        };
        c2.prototype.step = function() {
          if (!this.La)
            throw "Statement closed";
          this.Ja = 1;
          var g2 = Ac(this.La);
          switch (g2) {
            case 100:
              return true;
            case 101:
              return false;
            default:
              throw this.db.handleError(g2);
          }
        };
        c2.prototype.rb = function(g2) {
          null == g2 && (g2 = this.Ja, this.Ja += 1);
          return Ec(this.La, g2);
        };
        c2.prototype.Ab = function(g2) {
          null == g2 && (g2 = this.Ja, this.Ja += 1);
          g2 = sb(this.La, g2);
          if ("function" !== typeof BigInt)
            throw Error("BigInt is not supported");
          return BigInt(g2);
        };
        c2.prototype.Bb = function(g2) {
          null == g2 && (g2 = this.Ja, this.Ja += 1);
          return sb(this.La, g2);
        };
        c2.prototype.getBlob = function(g2) {
          null == g2 && (g2 = this.Ja, this.Ja += 1);
          var l2 = Gc(this.La, g2);
          g2 = Fc(this.La, g2);
          for (var n2 = new Uint8Array(l2), t2 = 0; t2 < l2; t2 += 1)
            n2[t2] = p2[g2 + t2];
          return n2;
        };
        c2.prototype.get = function(g2, l2) {
          l2 = l2 || {};
          null != g2 && this.bind(g2) && this.step();
          g2 = [];
          for (var n2 = Dc(this.La), t2 = 0; t2 < n2; t2 += 1)
            switch (Hc(this.La, t2)) {
              case 1:
                var w2 = l2.useBigInt ? this.Ab(t2) : this.rb(t2);
                g2.push(w2);
                break;
              case 2:
                g2.push(this.rb(t2));
                break;
              case 3:
                g2.push(this.Bb(t2));
                break;
              case 4:
                g2.push(this.getBlob(t2));
                break;
              default:
                g2.push(null);
            }
          return g2;
        };
        c2.prototype.getColumnNames = function() {
          for (var g2 = [], l2 = Cc(this.La), n2 = 0; n2 < l2; n2 += 1)
            g2.push(Ic(this.La, n2));
          return g2;
        };
        c2.prototype.getAsObject = function(g2, l2) {
          g2 = this.get(g2, l2);
          l2 = this.getColumnNames();
          for (var n2 = {}, t2 = 0; t2 < l2.length; t2 += 1)
            n2[l2[t2]] = g2[t2];
          return n2;
        };
        c2.prototype.getSQL = function() {
          return pb(this.La);
        };
        c2.prototype.getNormalizedSQL = function() {
          return vc(this.La);
        };
        c2.prototype.run = function(g2) {
          null != g2 && this.bind(g2);
          this.step();
          return this.reset();
        };
        c2.prototype.nb = function(g2, l2) {
          null == l2 && (l2 = this.Ja, this.Ja += 1);
          g2 = oa(g2);
          var n2 = aa(g2, ba);
          this.fb.push(n2);
          this.db.handleError(wc(this.La, l2, n2, g2.length - 1, 0));
        };
        c2.prototype.vb = function(g2, l2) {
          null == l2 && (l2 = this.Ja, this.Ja += 1);
          var n2 = aa(g2, ba);
          this.fb.push(n2);
          this.db.handleError(rb(this.La, l2, n2, g2.length, 0));
        };
        c2.prototype.mb = function(g2, l2) {
          null == l2 && (l2 = this.Ja, this.Ja += 1);
          this.db.handleError((g2 === (g2 | 0) ? yc : xc)(this.La, l2, g2));
        };
        c2.prototype.yb = function(g2) {
          null == g2 && (g2 = this.Ja, this.Ja += 1);
          rb(this.La, g2, 0, 0, 0);
        };
        c2.prototype.ob = function(g2, l2) {
          null == l2 && (l2 = this.Ja, this.Ja += 1);
          switch (typeof g2) {
            case "string":
              this.nb(g2, l2);
              return;
            case "number":
              this.mb(g2, l2);
              return;
            case "bigint":
              this.nb(g2.toString(), l2);
              return;
            case "boolean":
              this.mb(g2 + 0, l2);
              return;
            case "object":
              if (null === g2) {
                this.yb(l2);
                return;
              }
              if (null != g2.length) {
                this.vb(g2, l2);
                return;
              }
          }
          throw "Wrong API use : tried to bind a value of an unknown type (" + g2 + ").";
        };
        c2.prototype.xb = function(g2) {
          var l2 = this;
          Object.keys(g2).forEach(function(n2) {
            var t2 = zc(l2.La, n2);
            0 !== t2 && l2.ob(g2[n2], t2);
          });
          return true;
        };
        c2.prototype.wb = function(g2) {
          for (var l2 = 0; l2 < g2.length; l2 += 1)
            this.ob(g2[l2], l2 + 1);
          return true;
        };
        c2.prototype.reset = function() {
          this.freemem();
          return 0 === Kc(this.La) && 0 === Jc(this.La);
        };
        c2.prototype.freemem = function() {
          for (var g2; void 0 !== (g2 = this.fb.pop()); )
            ca(g2);
        };
        c2.prototype.free = function() {
          this.freemem();
          var g2 = 0 === Lc(this.La);
          delete this.db.Za[this.La];
          this.La = 0;
          return g2;
        };
        d2.prototype.next = function() {
          if (null === this.Ya)
            return { done: true };
          null !== this.Ua && (this.Ua.free(), this.Ua = null);
          if (!this.db.db)
            throw this.gb(), Error("Database closed");
          var g2 = pa(), l2 = x2(4);
          qa(h2);
          qa(l2);
          try {
            this.db.handleError(qb(this.db.db, this.eb, -1, h2, l2));
            this.eb = m2(l2, "i32");
            var n2 = m2(h2, "i32");
            if (0 === n2)
              return this.gb(), { done: true };
            this.Ua = new c2(n2, this.db);
            this.db.Za[n2] = this.Ua;
            return { value: this.Ua, done: false };
          } catch (t2) {
            throw this.ib = ra(this.eb), this.gb(), t2;
          } finally {
            sa(g2);
          }
        };
        d2.prototype.gb = function() {
          ca(this.Ya);
          this.Ya = null;
        };
        d2.prototype.getRemainingSQL = function() {
          return null !== this.ib ? this.ib : ra(this.eb);
        };
        "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d2.prototype[Symbol.iterator] = function() {
          return this;
        });
        e2.prototype.run = function(g2, l2) {
          if (!this.db)
            throw "Database closed";
          if (l2) {
            g2 = this.prepare(g2, l2);
            try {
              g2.step();
            } finally {
              g2.free();
            }
          } else
            this.handleError(v2(this.db, g2, 0, 0, h2));
          return this;
        };
        e2.prototype.exec = function(g2, l2, n2) {
          if (!this.db)
            throw "Database closed";
          var t2 = pa(), w2 = null;
          try {
            var z2 = ta(g2), N2 = x2(4);
            for (g2 = []; 0 !== m2(z2, "i8"); ) {
              qa(h2);
              qa(N2);
              this.handleError(qb(
                this.db,
                z2,
                -1,
                h2,
                N2
              ));
              var L2 = m2(h2, "i32");
              z2 = m2(N2, "i32");
              if (0 !== L2) {
                var K2 = null;
                w2 = new c2(L2, this);
                for (null != l2 && w2.bind(l2); w2.step(); )
                  null === K2 && (K2 = { columns: w2.getColumnNames(), values: [] }, g2.push(K2)), K2.values.push(w2.get(null, n2));
                w2.free();
              }
            }
            return g2;
          } catch (O2) {
            throw w2 && w2.free(), O2;
          } finally {
            sa(t2);
          }
        };
        e2.prototype.each = function(g2, l2, n2, t2, w2) {
          "function" === typeof l2 && (t2 = n2, n2 = l2, l2 = void 0);
          g2 = this.prepare(g2, l2);
          try {
            for (; g2.step(); )
              n2(g2.getAsObject(null, w2));
          } finally {
            g2.free();
          }
          if ("function" === typeof t2)
            return t2();
        };
        e2.prototype.prepare = function(g2, l2) {
          qa(h2);
          this.handleError(H2(this.db, g2, -1, h2, 0));
          g2 = m2(h2, "i32");
          if (0 === g2)
            throw "Nothing to prepare";
          var n2 = new c2(g2, this);
          null != l2 && n2.bind(l2);
          return this.Za[g2] = n2;
        };
        e2.prototype.iterateStatements = function(g2) {
          return new d2(g2, this);
        };
        e2.prototype["export"] = function() {
          Object.values(this.Za).forEach(function(l2) {
            l2.free();
          });
          Object.values(this.Na).forEach(ua);
          this.Na = {};
          this.handleError(y2(this.db));
          var g2 = va(this.filename);
          this.handleError(r2(this.filename, h2));
          this.db = m2(h2, "i32");
          ob(this.db);
          return g2;
        };
        e2.prototype.close = function() {
          null !== this.db && (Object.values(this.Za).forEach(function(g2) {
            g2.free();
          }), Object.values(this.Na).forEach(ua), this.Na = {}, this.handleError(y2(this.db)), wa("/" + this.filename), this.db = null);
        };
        e2.prototype.handleError = function(g2) {
          if (0 === g2)
            return null;
          g2 = Bc(this.db);
          throw Error(g2);
        };
        e2.prototype.getRowsModified = function() {
          return F2(this.db);
        };
        e2.prototype.create_function = function(g2, l2) {
          Object.prototype.hasOwnProperty.call(this.Na, g2) && (ua(this.Na[g2]), delete this.Na[g2]);
          var n2 = xa(function(t2, w2, z2) {
            w2 = b2(w2, z2);
            try {
              var N2 = l2.apply(
                null,
                w2
              );
            } catch (L2) {
              Aa(t2, L2, -1);
              return;
            }
            a2(t2, N2);
          }, "viii");
          this.Na[g2] = n2;
          this.handleError(tb(this.db, g2, l2.length, 1, 0, n2, 0, 0, 0));
          return this;
        };
        e2.prototype.create_aggregate = function(g2, l2) {
          var n2 = l2.init || function() {
            return null;
          }, t2 = l2.finalize || function(K2) {
            return K2;
          }, w2 = l2.step;
          if (!w2)
            throw "An aggregate function must have a step function in " + g2;
          var z2 = {};
          Object.hasOwnProperty.call(this.Na, g2) && (ua(this.Na[g2]), delete this.Na[g2]);
          l2 = g2 + "__finalize";
          Object.hasOwnProperty.call(this.Na, l2) && (ua(this.Na[l2]), delete this.Na[l2]);
          var N2 = xa(function(K2, O2, Ua) {
            var X2 = ub(K2, 1);
            Object.hasOwnProperty.call(z2, X2) || (z2[X2] = n2());
            O2 = b2(O2, Ua);
            O2 = [z2[X2]].concat(O2);
            try {
              z2[X2] = w2.apply(null, O2);
            } catch (Nc) {
              delete z2[X2], Aa(K2, Nc, -1);
            }
          }, "viii"), L2 = xa(function(K2) {
            var O2 = ub(K2, 1);
            try {
              var Ua = t2(z2[O2]);
            } catch (X2) {
              delete z2[O2];
              Aa(K2, X2, -1);
              return;
            }
            a2(K2, Ua);
            delete z2[O2];
          }, "vi");
          this.Na[g2] = N2;
          this.Na[l2] = L2;
          this.handleError(tb(this.db, g2, w2.length - 1, 1, 0, 0, N2, L2, 0));
          return this;
        };
        f2.Database = e2;
      };
      var ya = Object.assign({}, f2), za = "./this.program", Ba = "object" == typeof window, Ca = "function" == typeof importScripts, Da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, A2 = "", Ea, Fa, Ga;
      if (Da) {
        var fs = require$$2, Ha = require$$2;
        A2 = Ca ? Ha.dirname(A2) + "/" : __dirname + "/";
        Ea = (a2, b2) => {
          a2 = Ia(a2) ? new URL(a2) : Ha.normalize(a2);
          return fs.readFileSync(a2, b2 ? void 0 : "utf8");
        };
        Ga = (a2) => {
          a2 = Ea(a2, true);
          a2.buffer || (a2 = new Uint8Array(a2));
          return a2;
        };
        Fa = (a2, b2, c2, d2 = true) => {
          a2 = Ia(a2) ? new URL(a2) : Ha.normalize(a2);
          fs.readFile(a2, d2 ? void 0 : "utf8", (e2, h2) => {
            e2 ? c2(e2) : b2(d2 ? h2.buffer : h2);
          });
        };
        !f2.thisProgram && 1 < process.argv.length && (za = process.argv[1].replace(/\\/g, "/"));
        process.argv.slice(2);
        module.exports = f2;
        f2.inspect = () => "[Emscripten Module object]";
      } else if (Ba || Ca)
        Ca ? A2 = self.location.href : "undefined" != typeof document && document.currentScript && (A2 = document.currentScript.src), A2 = 0 !== A2.indexOf("blob:") ? A2.substr(0, A2.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", Ea = (a2) => {
          var b2 = new XMLHttpRequest();
          b2.open("GET", a2, false);
          b2.send(null);
          return b2.responseText;
        }, Ca && (Ga = (a2) => {
          var b2 = new XMLHttpRequest();
          b2.open("GET", a2, false);
          b2.responseType = "arraybuffer";
          b2.send(null);
          return new Uint8Array(b2.response);
        }), Fa = (a2, b2, c2) => {
          var d2 = new XMLHttpRequest();
          d2.open(
            "GET",
            a2,
            true
          );
          d2.responseType = "arraybuffer";
          d2.onload = () => {
            200 == d2.status || 0 == d2.status && d2.response ? b2(d2.response) : c2();
          };
          d2.onerror = c2;
          d2.send(null);
        };
      var Ja = f2.print || console.log.bind(console), B2 = f2.printErr || console.error.bind(console);
      Object.assign(f2, ya);
      ya = null;
      f2.thisProgram && (za = f2.thisProgram);
      var Ka;
      f2.wasmBinary && (Ka = f2.wasmBinary);
      "object" != typeof WebAssembly && C2("no native wasm support detected");
      var La, Ma = false, p2, q2, Na, D2, E2, Oa, Pa;
      function Qa() {
        var a2 = La.buffer;
        f2.HEAP8 = p2 = new Int8Array(a2);
        f2.HEAP16 = Na = new Int16Array(a2);
        f2.HEAPU8 = q2 = new Uint8Array(a2);
        f2.HEAPU16 = new Uint16Array(a2);
        f2.HEAP32 = D2 = new Int32Array(a2);
        f2.HEAPU32 = E2 = new Uint32Array(a2);
        f2.HEAPF32 = Oa = new Float32Array(a2);
        f2.HEAPF64 = Pa = new Float64Array(a2);
      }
      var Ra = [], Sa = [], Ta = [];
      function Va() {
        var a2 = f2.preRun.shift();
        Ra.unshift(a2);
      }
      var G2 = 0, Xa = null;
      function C2(a2) {
        f2.onAbort?.(a2);
        a2 = "Aborted(" + a2 + ")";
        B2(a2);
        Ma = true;
        throw new WebAssembly.RuntimeError(a2 + ". Build with -sASSERTIONS for more info.");
      }
      var Ya = (a2) => a2.startsWith("data:application/octet-stream;base64,"), Ia = (a2) => a2.startsWith("file://"), Za;
      Za = "sql-wasm.wasm";
      if (!Ya(Za)) {
        var $a = Za;
        Za = f2.locateFile ? f2.locateFile($a, A2) : A2 + $a;
      }
      function ab(a2) {
        if (a2 == Za && Ka)
          return new Uint8Array(Ka);
        if (Ga)
          return Ga(a2);
        throw "both async and sync fetching of the wasm failed";
      }
      function bb(a2) {
        if (!Ka && (Ba || Ca)) {
          if ("function" == typeof fetch && !Ia(a2))
            return fetch(a2, { credentials: "same-origin" }).then((b2) => {
              if (!b2.ok)
                throw "failed to load wasm binary file at '" + a2 + "'";
              return b2.arrayBuffer();
            }).catch(() => ab(a2));
          if (Fa)
            return new Promise((b2, c2) => {
              Fa(a2, (d2) => b2(new Uint8Array(d2)), c2);
            });
        }
        return Promise.resolve().then(() => ab(a2));
      }
      function cb(a2, b2, c2) {
        return bb(a2).then((d2) => WebAssembly.instantiate(d2, b2)).then((d2) => d2).then(c2, (d2) => {
          B2(`failed to asynchronously prepare wasm: ${d2}`);
          C2(d2);
        });
      }
      function db(a2, b2) {
        var c2 = Za;
        Ka || "function" != typeof WebAssembly.instantiateStreaming || Ya(c2) || Ia(c2) || Da || "function" != typeof fetch ? cb(c2, a2, b2) : fetch(c2, { credentials: "same-origin" }).then((d2) => WebAssembly.instantiateStreaming(d2, a2).then(b2, function(e2) {
          B2(`wasm streaming compile failed: ${e2}`);
          B2("falling back to ArrayBuffer instantiation");
          return cb(c2, a2, b2);
        }));
      }
      var I2, J2, eb = (a2) => {
        for (; 0 < a2.length; )
          a2.shift()(f2);
      };
      function m2(a2, b2 = "i8") {
        b2.endsWith("*") && (b2 = "*");
        switch (b2) {
          case "i1":
            return p2[a2 >> 0];
          case "i8":
            return p2[a2 >> 0];
          case "i16":
            return Na[a2 >> 1];
          case "i32":
            return D2[a2 >> 2];
          case "i64":
            C2("to do getValue(i64) use WASM_BIGINT");
          case "float":
            return Oa[a2 >> 2];
          case "double":
            return Pa[a2 >> 3];
          case "*":
            return E2[a2 >> 2];
          default:
            C2(`invalid type for getValue: ${b2}`);
        }
      }
      function qa(a2) {
        var b2 = "i32";
        b2.endsWith("*") && (b2 = "*");
        switch (b2) {
          case "i1":
            p2[a2 >> 0] = 0;
            break;
          case "i8":
            p2[a2 >> 0] = 0;
            break;
          case "i16":
            Na[a2 >> 1] = 0;
            break;
          case "i32":
            D2[a2 >> 2] = 0;
            break;
          case "i64":
            C2("to do setValue(i64) use WASM_BIGINT");
          case "float":
            Oa[a2 >> 2] = 0;
            break;
          case "double":
            Pa[a2 >> 3] = 0;
            break;
          case "*":
            E2[a2 >> 2] = 0;
            break;
          default:
            C2(`invalid type for setValue: ${b2}`);
        }
      }
      var fb = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, M2 = (a2, b2, c2) => {
        var d2 = b2 + c2;
        for (c2 = b2; a2[c2] && !(c2 >= d2); )
          ++c2;
        if (16 < c2 - b2 && a2.buffer && fb)
          return fb.decode(a2.subarray(b2, c2));
        for (d2 = ""; b2 < c2; ) {
          var e2 = a2[b2++];
          if (e2 & 128) {
            var h2 = a2[b2++] & 63;
            if (192 == (e2 & 224))
              d2 += String.fromCharCode((e2 & 31) << 6 | h2);
            else {
              var k2 = a2[b2++] & 63;
              e2 = 224 == (e2 & 240) ? (e2 & 15) << 12 | h2 << 6 | k2 : (e2 & 7) << 18 | h2 << 12 | k2 << 6 | a2[b2++] & 63;
              65536 > e2 ? d2 += String.fromCharCode(e2) : (e2 -= 65536, d2 += String.fromCharCode(55296 | e2 >> 10, 56320 | e2 & 1023));
            }
          } else
            d2 += String.fromCharCode(e2);
        }
        return d2;
      }, ra = (a2, b2) => a2 ? M2(q2, a2, b2) : "", gb = (a2, b2) => {
        for (var c2 = 0, d2 = a2.length - 1; 0 <= d2; d2--) {
          var e2 = a2[d2];
          "." === e2 ? a2.splice(d2, 1) : ".." === e2 ? (a2.splice(d2, 1), c2++) : c2 && (a2.splice(d2, 1), c2--);
        }
        if (b2)
          for (; c2; c2--)
            a2.unshift("..");
        return a2;
      }, u2 = (a2) => {
        var b2 = "/" === a2.charAt(0), c2 = "/" === a2.substr(-1);
        (a2 = gb(a2.split("/").filter((d2) => !!d2), !b2).join("/")) || b2 || (a2 = ".");
        a2 && c2 && (a2 += "/");
        return (b2 ? "/" : "") + a2;
      }, hb = (a2) => {
        var b2 = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a2).slice(1);
        a2 = b2[0];
        b2 = b2[1];
        if (!a2 && !b2)
          return ".";
        b2 &&= b2.substr(0, b2.length - 1);
        return a2 + b2;
      }, ib = (a2) => {
        if ("/" === a2)
          return "/";
        a2 = u2(a2);
        a2 = a2.replace(/\/$/, "");
        var b2 = a2.lastIndexOf("/");
        return -1 === b2 ? a2 : a2.substr(b2 + 1);
      }, jb = () => {
        if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues)
          return (c2) => crypto.getRandomValues(c2);
        if (Da)
          try {
            var a2 = require$$2;
            if (a2.randomFillSync)
              return (c2) => a2.randomFillSync(c2);
            var b2 = a2.randomBytes;
            return (c2) => (c2.set(b2(c2.byteLength)), c2);
          } catch (c2) {
          }
        C2("initRandomDevice");
      }, kb = (a2) => (kb = jb())(a2);
      function mb() {
        for (var a2 = "", b2 = false, c2 = arguments.length - 1; -1 <= c2 && !b2; c2--) {
          b2 = 0 <= c2 ? arguments[c2] : "/";
          if ("string" != typeof b2)
            throw new TypeError("Arguments to path.resolve must be strings");
          if (!b2)
            return "";
          a2 = b2 + "/" + a2;
          b2 = "/" === b2.charAt(0);
        }
        a2 = gb(a2.split("/").filter((d2) => !!d2), !b2).join("/");
        return (b2 ? "/" : "") + a2 || ".";
      }
      var nb = [], da = (a2) => {
        for (var b2 = 0, c2 = 0; c2 < a2.length; ++c2) {
          var d2 = a2.charCodeAt(c2);
          127 >= d2 ? b2++ : 2047 >= d2 ? b2 += 2 : 55296 <= d2 && 57343 >= d2 ? (b2 += 4, ++c2) : b2 += 3;
        }
        return b2;
      }, fa = (a2, b2, c2, d2) => {
        if (!(0 < d2))
          return 0;
        var e2 = c2;
        d2 = c2 + d2 - 1;
        for (var h2 = 0; h2 < a2.length; ++h2) {
          var k2 = a2.charCodeAt(h2);
          if (55296 <= k2 && 57343 >= k2) {
            var r2 = a2.charCodeAt(++h2);
            k2 = 65536 + ((k2 & 1023) << 10) | r2 & 1023;
          }
          if (127 >= k2) {
            if (c2 >= d2)
              break;
            b2[c2++] = k2;
          } else {
            if (2047 >= k2) {
              if (c2 + 1 >= d2)
                break;
              b2[c2++] = 192 | k2 >> 6;
            } else {
              if (65535 >= k2) {
                if (c2 + 2 >= d2)
                  break;
                b2[c2++] = 224 | k2 >> 12;
              } else {
                if (c2 + 3 >= d2)
                  break;
                b2[c2++] = 240 | k2 >> 18;
                b2[c2++] = 128 | k2 >> 12 & 63;
              }
              b2[c2++] = 128 | k2 >> 6 & 63;
            }
            b2[c2++] = 128 | k2 & 63;
          }
        }
        b2[c2] = 0;
        return c2 - e2;
      };
      function oa(a2, b2) {
        var c2 = Array(da(a2) + 1);
        a2 = fa(a2, c2, 0, c2.length);
        b2 && (c2.length = a2);
        return c2;
      }
      var vb = [];
      function wb(a2, b2) {
        vb[a2] = { input: [], output: [], Xa: b2 };
        xb(a2, yb);
      }
      var yb = { open(a2) {
        var b2 = vb[a2.node.rdev];
        if (!b2)
          throw new P2(43);
        a2.tty = b2;
        a2.seekable = false;
      }, close(a2) {
        a2.tty.Xa.fsync(a2.tty);
      }, fsync(a2) {
        a2.tty.Xa.fsync(a2.tty);
      }, read(a2, b2, c2, d2) {
        if (!a2.tty || !a2.tty.Xa.sb)
          throw new P2(60);
        for (var e2 = 0, h2 = 0; h2 < d2; h2++) {
          try {
            var k2 = a2.tty.Xa.sb(a2.tty);
          } catch (r2) {
            throw new P2(29);
          }
          if (void 0 === k2 && 0 === e2)
            throw new P2(6);
          if (null === k2 || void 0 === k2)
            break;
          e2++;
          b2[c2 + h2] = k2;
        }
        e2 && (a2.node.timestamp = Date.now());
        return e2;
      }, write(a2, b2, c2, d2) {
        if (!a2.tty || !a2.tty.Xa.jb)
          throw new P2(60);
        try {
          for (var e2 = 0; e2 < d2; e2++)
            a2.tty.Xa.jb(a2.tty, b2[c2 + e2]);
        } catch (h2) {
          throw new P2(29);
        }
        d2 && (a2.node.timestamp = Date.now());
        return e2;
      } }, zb = { sb() {
        a: {
          if (!nb.length) {
            var a2 = null;
            if (Da) {
              var b2 = Buffer.alloc(256), c2 = 0, d2 = process.stdin.fd;
              try {
                c2 = fs.readSync(d2, b2);
              } catch (e2) {
                if (e2.toString().includes("EOF"))
                  c2 = 0;
                else
                  throw e2;
              }
              0 < c2 ? a2 = b2.slice(0, c2).toString("utf-8") : a2 = null;
            } else
              "undefined" != typeof window && "function" == typeof window.prompt ? (a2 = window.prompt("Input: "), null !== a2 && (a2 += "\n")) : "function" == typeof readline && (a2 = readline(), null !== a2 && (a2 += "\n"));
            if (!a2) {
              a2 = null;
              break a;
            }
            nb = oa(a2, true);
          }
          a2 = nb.shift();
        }
        return a2;
      }, jb(a2, b2) {
        null === b2 || 10 === b2 ? (Ja(M2(a2.output, 0)), a2.output = []) : 0 != b2 && a2.output.push(b2);
      }, fsync(a2) {
        a2.output && 0 < a2.output.length && (Ja(M2(a2.output, 0)), a2.output = []);
      }, Mb() {
        return { Ib: 25856, Kb: 5, Hb: 191, Jb: 35387, Gb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      }, Nb() {
        return 0;
      }, Ob() {
        return [24, 80];
      } }, Ab = { jb(a2, b2) {
        null === b2 || 10 === b2 ? (B2(M2(a2.output, 0)), a2.output = []) : 0 != b2 && a2.output.push(b2);
      }, fsync(a2) {
        a2.output && 0 < a2.output.length && (B2(M2(a2.output, 0)), a2.output = []);
      } };
      function Bb(a2, b2) {
        var c2 = a2.Ia ? a2.Ia.length : 0;
        c2 >= b2 || (b2 = Math.max(b2, c2 * (1048576 > c2 ? 2 : 1.125) >>> 0), 0 != c2 && (b2 = Math.max(b2, 256)), c2 = a2.Ia, a2.Ia = new Uint8Array(b2), 0 < a2.Ma && a2.Ia.set(c2.subarray(0, a2.Ma), 0));
      }
      var Q2 = {
        Qa: null,
        Ra() {
          return Q2.createNode(null, "/", 16895, 0);
        },
        createNode(a2, b2, c2, d2) {
          if (24576 === (c2 & 61440) || 4096 === (c2 & 61440))
            throw new P2(63);
          Q2.Qa || (Q2.Qa = { dir: { node: { Pa: Q2.Ga.Pa, Oa: Q2.Ga.Oa, lookup: Q2.Ga.lookup, ab: Q2.Ga.ab, rename: Q2.Ga.rename, unlink: Q2.Ga.unlink, rmdir: Q2.Ga.rmdir, readdir: Q2.Ga.readdir, symlink: Q2.Ga.symlink }, stream: { Ta: Q2.Ha.Ta } }, file: { node: { Pa: Q2.Ga.Pa, Oa: Q2.Ga.Oa }, stream: { Ta: Q2.Ha.Ta, read: Q2.Ha.read, write: Q2.Ha.write, lb: Q2.Ha.lb, bb: Q2.Ha.bb, cb: Q2.Ha.cb } }, link: {
            node: { Pa: Q2.Ga.Pa, Oa: Q2.Ga.Oa, readlink: Q2.Ga.readlink },
            stream: {}
          }, pb: { node: { Pa: Q2.Ga.Pa, Oa: Q2.Ga.Oa }, stream: Cb } });
          c2 = Db(a2, b2, c2, d2);
          R2(c2.mode) ? (c2.Ga = Q2.Qa.dir.node, c2.Ha = Q2.Qa.dir.stream, c2.Ia = {}) : 32768 === (c2.mode & 61440) ? (c2.Ga = Q2.Qa.file.node, c2.Ha = Q2.Qa.file.stream, c2.Ma = 0, c2.Ia = null) : 40960 === (c2.mode & 61440) ? (c2.Ga = Q2.Qa.link.node, c2.Ha = Q2.Qa.link.stream) : 8192 === (c2.mode & 61440) && (c2.Ga = Q2.Qa.pb.node, c2.Ha = Q2.Qa.pb.stream);
          c2.timestamp = Date.now();
          a2 && (a2.Ia[b2] = c2, a2.timestamp = c2.timestamp);
          return c2;
        },
        Lb(a2) {
          return a2.Ia ? a2.Ia.subarray ? a2.Ia.subarray(0, a2.Ma) : new Uint8Array(a2.Ia) : new Uint8Array(0);
        },
        Ga: { Pa(a2) {
          var b2 = {};
          b2.dev = 8192 === (a2.mode & 61440) ? a2.id : 1;
          b2.ino = a2.id;
          b2.mode = a2.mode;
          b2.nlink = 1;
          b2.uid = 0;
          b2.gid = 0;
          b2.rdev = a2.rdev;
          R2(a2.mode) ? b2.size = 4096 : 32768 === (a2.mode & 61440) ? b2.size = a2.Ma : 40960 === (a2.mode & 61440) ? b2.size = a2.link.length : b2.size = 0;
          b2.atime = new Date(a2.timestamp);
          b2.mtime = new Date(a2.timestamp);
          b2.ctime = new Date(a2.timestamp);
          b2.zb = 4096;
          b2.blocks = Math.ceil(b2.size / b2.zb);
          return b2;
        }, Oa(a2, b2) {
          void 0 !== b2.mode && (a2.mode = b2.mode);
          void 0 !== b2.timestamp && (a2.timestamp = b2.timestamp);
          if (void 0 !== b2.size && (b2 = b2.size, a2.Ma != b2))
            if (0 == b2)
              a2.Ia = null, a2.Ma = 0;
            else {
              var c2 = a2.Ia;
              a2.Ia = new Uint8Array(b2);
              c2 && a2.Ia.set(c2.subarray(0, Math.min(b2, a2.Ma)));
              a2.Ma = b2;
            }
        }, lookup() {
          throw Eb[44];
        }, ab(a2, b2, c2, d2) {
          return Q2.createNode(a2, b2, c2, d2);
        }, rename(a2, b2, c2) {
          if (R2(a2.mode)) {
            try {
              var d2 = Fb(b2, c2);
            } catch (h2) {
            }
            if (d2)
              for (var e2 in d2.Ia)
                throw new P2(55);
          }
          delete a2.parent.Ia[a2.name];
          a2.parent.timestamp = Date.now();
          a2.name = c2;
          b2.Ia[c2] = a2;
          b2.timestamp = a2.parent.timestamp;
          a2.parent = b2;
        }, unlink(a2, b2) {
          delete a2.Ia[b2];
          a2.timestamp = Date.now();
        }, rmdir(a2, b2) {
          var c2 = Fb(a2, b2), d2;
          for (d2 in c2.Ia)
            throw new P2(55);
          delete a2.Ia[b2];
          a2.timestamp = Date.now();
        }, readdir(a2) {
          var b2 = [".", ".."], c2;
          for (c2 of Object.keys(a2.Ia))
            b2.push(c2);
          return b2;
        }, symlink(a2, b2, c2) {
          a2 = Q2.createNode(a2, b2, 41471, 0);
          a2.link = c2;
          return a2;
        }, readlink(a2) {
          if (40960 !== (a2.mode & 61440))
            throw new P2(28);
          return a2.link;
        } },
        Ha: {
          read(a2, b2, c2, d2, e2) {
            var h2 = a2.node.Ia;
            if (e2 >= a2.node.Ma)
              return 0;
            a2 = Math.min(a2.node.Ma - e2, d2);
            if (8 < a2 && h2.subarray)
              b2.set(h2.subarray(e2, e2 + a2), c2);
            else
              for (d2 = 0; d2 < a2; d2++)
                b2[c2 + d2] = h2[e2 + d2];
            return a2;
          },
          write(a2, b2, c2, d2, e2, h2) {
            b2.buffer === p2.buffer && (h2 = false);
            if (!d2)
              return 0;
            a2 = a2.node;
            a2.timestamp = Date.now();
            if (b2.subarray && (!a2.Ia || a2.Ia.subarray)) {
              if (h2)
                return a2.Ia = b2.subarray(c2, c2 + d2), a2.Ma = d2;
              if (0 === a2.Ma && 0 === e2)
                return a2.Ia = b2.slice(c2, c2 + d2), a2.Ma = d2;
              if (e2 + d2 <= a2.Ma)
                return a2.Ia.set(b2.subarray(c2, c2 + d2), e2), d2;
            }
            Bb(a2, e2 + d2);
            if (a2.Ia.subarray && b2.subarray)
              a2.Ia.set(b2.subarray(c2, c2 + d2), e2);
            else
              for (h2 = 0; h2 < d2; h2++)
                a2.Ia[e2 + h2] = b2[c2 + h2];
            a2.Ma = Math.max(a2.Ma, e2 + d2);
            return d2;
          },
          Ta(a2, b2, c2) {
            1 === c2 ? b2 += a2.position : 2 === c2 && 32768 === (a2.node.mode & 61440) && (b2 += a2.node.Ma);
            if (0 > b2)
              throw new P2(28);
            return b2;
          },
          lb(a2, b2, c2) {
            Bb(a2.node, b2 + c2);
            a2.node.Ma = Math.max(a2.node.Ma, b2 + c2);
          },
          bb(a2, b2, c2, d2, e2) {
            if (32768 !== (a2.node.mode & 61440))
              throw new P2(43);
            a2 = a2.node.Ia;
            if (e2 & 2 || a2.buffer !== p2.buffer) {
              if (0 < c2 || c2 + b2 < a2.length)
                a2.subarray ? a2 = a2.subarray(c2, c2 + b2) : a2 = Array.prototype.slice.call(a2, c2, c2 + b2);
              c2 = true;
              b2 = 65536 * Math.ceil(b2 / 65536);
              (e2 = Gb(65536, b2)) ? (q2.fill(0, e2, e2 + b2), b2 = e2) : b2 = 0;
              if (!b2)
                throw new P2(48);
              p2.set(a2, b2);
            } else
              c2 = false, b2 = a2.byteOffset;
            return { Db: b2, ub: c2 };
          },
          cb(a2, b2, c2, d2) {
            Q2.Ha.write(a2, b2, 0, d2, c2, false);
            return 0;
          }
        }
      }, ia = (a2, b2) => {
        var c2 = 0;
        a2 && (c2 |= 365);
        b2 && (c2 |= 146);
        return c2;
      }, Hb = null, Ib = {}, Jb = [], Kb = 1, S2 = null, Lb = true, P2 = null, Eb = {};
      function T2(a2, b2 = {}) {
        a2 = mb(a2);
        if (!a2)
          return { path: "", node: null };
        b2 = Object.assign({ qb: true, kb: 0 }, b2);
        if (8 < b2.kb)
          throw new P2(32);
        a2 = a2.split("/").filter((k2) => !!k2);
        for (var c2 = Hb, d2 = "/", e2 = 0; e2 < a2.length; e2++) {
          var h2 = e2 === a2.length - 1;
          if (h2 && b2.parent)
            break;
          c2 = Fb(c2, a2[e2]);
          d2 = u2(d2 + "/" + a2[e2]);
          c2.Va && (!h2 || h2 && b2.qb) && (c2 = c2.Va.root);
          if (!h2 || b2.Sa) {
            for (h2 = 0; 40960 === (c2.mode & 61440); )
              if (c2 = Mb(d2), d2 = mb(hb(d2), c2), c2 = T2(d2, { kb: b2.kb + 1 }).node, 40 < h2++)
                throw new P2(32);
          }
        }
        return { path: d2, node: c2 };
      }
      function ha(a2) {
        for (var b2; ; ) {
          if (a2 === a2.parent)
            return a2 = a2.Ra.tb, b2 ? "/" !== a2[a2.length - 1] ? `${a2}/${b2}` : a2 + b2 : a2;
          b2 = b2 ? `${a2.name}/${b2}` : a2.name;
          a2 = a2.parent;
        }
      }
      function Nb(a2, b2) {
        for (var c2 = 0, d2 = 0; d2 < b2.length; d2++)
          c2 = (c2 << 5) - c2 + b2.charCodeAt(d2) | 0;
        return (a2 + c2 >>> 0) % S2.length;
      }
      function Ob(a2) {
        var b2 = Nb(a2.parent.id, a2.name);
        if (S2[b2] === a2)
          S2[b2] = a2.Wa;
        else
          for (b2 = S2[b2]; b2; ) {
            if (b2.Wa === a2) {
              b2.Wa = a2.Wa;
              break;
            }
            b2 = b2.Wa;
          }
      }
      function Fb(a2, b2) {
        var c2;
        if (c2 = (c2 = Pb(a2, "x")) ? c2 : a2.Ga.lookup ? 0 : 2)
          throw new P2(c2, a2);
        for (c2 = S2[Nb(a2.id, b2)]; c2; c2 = c2.Wa) {
          var d2 = c2.name;
          if (c2.parent.id === a2.id && d2 === b2)
            return c2;
        }
        return a2.Ga.lookup(a2, b2);
      }
      function Db(a2, b2, c2, d2) {
        a2 = new Qb(a2, b2, c2, d2);
        b2 = Nb(a2.parent.id, a2.name);
        a2.Wa = S2[b2];
        return S2[b2] = a2;
      }
      function R2(a2) {
        return 16384 === (a2 & 61440);
      }
      function Rb(a2) {
        var b2 = ["r", "w", "rw"][a2 & 3];
        a2 & 512 && (b2 += "w");
        return b2;
      }
      function Pb(a2, b2) {
        if (Lb)
          return 0;
        if (!b2.includes("r") || a2.mode & 292) {
          if (b2.includes("w") && !(a2.mode & 146) || b2.includes("x") && !(a2.mode & 73))
            return 2;
        } else
          return 2;
        return 0;
      }
      function Sb(a2, b2) {
        try {
          return Fb(a2, b2), 20;
        } catch (c2) {
        }
        return Pb(a2, "wx");
      }
      function Tb(a2, b2, c2) {
        try {
          var d2 = Fb(a2, b2);
        } catch (e2) {
          return e2.Ka;
        }
        if (a2 = Pb(a2, "wx"))
          return a2;
        if (c2) {
          if (!R2(d2.mode))
            return 54;
          if (d2 === d2.parent || "/" === ha(d2))
            return 10;
        } else if (R2(d2.mode))
          return 31;
        return 0;
      }
      function Ub() {
        for (var a2 = 0; 4096 >= a2; a2++)
          if (!Jb[a2])
            return a2;
        throw new P2(33);
      }
      function U2(a2) {
        a2 = Jb[a2];
        if (!a2)
          throw new P2(8);
        return a2;
      }
      function Vb(a2, b2 = -1) {
        Wb || (Wb = function() {
          this.$a = {};
        }, Wb.prototype = {}, Object.defineProperties(Wb.prototype, { object: { get() {
          return this.node;
        }, set(c2) {
          this.node = c2;
        } }, flags: { get() {
          return this.$a.flags;
        }, set(c2) {
          this.$a.flags = c2;
        } }, position: { get() {
          return this.$a.position;
        }, set(c2) {
          this.$a.position = c2;
        } } }));
        a2 = Object.assign(new Wb(), a2);
        -1 == b2 && (b2 = Ub());
        a2.fd = b2;
        return Jb[b2] = a2;
      }
      var Cb = { open(a2) {
        a2.Ha = Ib[a2.node.rdev].Ha;
        a2.Ha.open?.(a2);
      }, Ta() {
        throw new P2(70);
      } };
      function xb(a2, b2) {
        Ib[a2] = { Ha: b2 };
      }
      function Xb(a2, b2) {
        var c2 = "/" === b2, d2 = !b2;
        if (c2 && Hb)
          throw new P2(10);
        if (!c2 && !d2) {
          var e2 = T2(b2, { qb: false });
          b2 = e2.path;
          e2 = e2.node;
          if (e2.Va)
            throw new P2(10);
          if (!R2(e2.mode))
            throw new P2(54);
        }
        b2 = { type: a2, Pb: {}, tb: b2, Cb: [] };
        a2 = a2.Ra(b2);
        a2.Ra = b2;
        b2.root = a2;
        c2 ? Hb = a2 : e2 && (e2.Va = b2, e2.Ra && e2.Ra.Cb.push(b2));
      }
      function ja(a2, b2, c2) {
        var d2 = T2(a2, { parent: true }).node;
        a2 = ib(a2);
        if (!a2 || "." === a2 || ".." === a2)
          throw new P2(28);
        var e2 = Sb(d2, a2);
        if (e2)
          throw new P2(e2);
        if (!d2.Ga.ab)
          throw new P2(63);
        return d2.Ga.ab(d2, a2, b2, c2);
      }
      function V2(a2, b2) {
        return ja(a2, (void 0 !== b2 ? b2 : 511) & 1023 | 16384, 0);
      }
      function Yb(a2, b2, c2) {
        "undefined" == typeof c2 && (c2 = b2, b2 = 438);
        ja(a2, b2 | 8192, c2);
      }
      function Zb(a2, b2) {
        if (!mb(a2))
          throw new P2(44);
        var c2 = T2(b2, { parent: true }).node;
        if (!c2)
          throw new P2(44);
        b2 = ib(b2);
        var d2 = Sb(c2, b2);
        if (d2)
          throw new P2(d2);
        if (!c2.Ga.symlink)
          throw new P2(63);
        c2.Ga.symlink(c2, b2, a2);
      }
      function $b(a2) {
        var b2 = T2(a2, { parent: true }).node;
        a2 = ib(a2);
        var c2 = Fb(b2, a2), d2 = Tb(b2, a2, true);
        if (d2)
          throw new P2(d2);
        if (!b2.Ga.rmdir)
          throw new P2(63);
        if (c2.Va)
          throw new P2(10);
        b2.Ga.rmdir(b2, a2);
        Ob(c2);
      }
      function wa(a2) {
        var b2 = T2(a2, { parent: true }).node;
        if (!b2)
          throw new P2(44);
        a2 = ib(a2);
        var c2 = Fb(b2, a2), d2 = Tb(b2, a2, false);
        if (d2)
          throw new P2(d2);
        if (!b2.Ga.unlink)
          throw new P2(63);
        if (c2.Va)
          throw new P2(10);
        b2.Ga.unlink(b2, a2);
        Ob(c2);
      }
      function Mb(a2) {
        a2 = T2(a2).node;
        if (!a2)
          throw new P2(44);
        if (!a2.Ga.readlink)
          throw new P2(28);
        return mb(ha(a2.parent), a2.Ga.readlink(a2));
      }
      function ac(a2, b2) {
        a2 = T2(a2, { Sa: !b2 }).node;
        if (!a2)
          throw new P2(44);
        if (!a2.Ga.Pa)
          throw new P2(63);
        return a2.Ga.Pa(a2);
      }
      function bc(a2) {
        return ac(a2, true);
      }
      function ka(a2, b2) {
        a2 = "string" == typeof a2 ? T2(a2, { Sa: true }).node : a2;
        if (!a2.Ga.Oa)
          throw new P2(63);
        a2.Ga.Oa(a2, { mode: b2 & 4095 | a2.mode & -4096, timestamp: Date.now() });
      }
      function cc(a2, b2) {
        if (0 > b2)
          throw new P2(28);
        a2 = "string" == typeof a2 ? T2(a2, { Sa: true }).node : a2;
        if (!a2.Ga.Oa)
          throw new P2(63);
        if (R2(a2.mode))
          throw new P2(31);
        if (32768 !== (a2.mode & 61440))
          throw new P2(28);
        var c2 = Pb(a2, "w");
        if (c2)
          throw new P2(c2);
        a2.Ga.Oa(a2, { size: b2, timestamp: Date.now() });
      }
      function la(a2, b2, c2) {
        if ("" === a2)
          throw new P2(44);
        if ("string" == typeof b2) {
          var d2 = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b2];
          if ("undefined" == typeof d2)
            throw Error(`Unknown file open mode: ${b2}`);
          b2 = d2;
        }
        c2 = b2 & 64 ? ("undefined" == typeof c2 ? 438 : c2) & 4095 | 32768 : 0;
        if ("object" == typeof a2)
          var e2 = a2;
        else {
          a2 = u2(a2);
          try {
            e2 = T2(a2, { Sa: !(b2 & 131072) }).node;
          } catch (h2) {
          }
        }
        d2 = false;
        if (b2 & 64)
          if (e2) {
            if (b2 & 128)
              throw new P2(20);
          } else
            e2 = ja(a2, c2, 0), d2 = true;
        if (!e2)
          throw new P2(44);
        8192 === (e2.mode & 61440) && (b2 &= -513);
        if (b2 & 65536 && !R2(e2.mode))
          throw new P2(54);
        if (!d2 && (c2 = e2 ? 40960 === (e2.mode & 61440) ? 32 : R2(e2.mode) && ("r" !== Rb(b2) || b2 & 512) ? 31 : Pb(e2, Rb(b2)) : 44))
          throw new P2(c2);
        b2 & 512 && !d2 && cc(e2, 0);
        b2 &= -131713;
        e2 = Vb({ node: e2, path: ha(e2), flags: b2, seekable: true, position: 0, Ha: e2.Ha, Fb: [], error: false });
        e2.Ha.open && e2.Ha.open(e2);
        !f2.logReadFiles || b2 & 1 || (dc ||= {}, a2 in dc || (dc[a2] = 1));
        return e2;
      }
      function na(a2) {
        if (null === a2.fd)
          throw new P2(8);
        a2.hb && (a2.hb = null);
        try {
          a2.Ha.close && a2.Ha.close(a2);
        } catch (b2) {
          throw b2;
        } finally {
          Jb[a2.fd] = null;
        }
        a2.fd = null;
      }
      function ec(a2, b2, c2) {
        if (null === a2.fd)
          throw new P2(8);
        if (!a2.seekable || !a2.Ha.Ta)
          throw new P2(70);
        if (0 != c2 && 1 != c2 && 2 != c2)
          throw new P2(28);
        a2.position = a2.Ha.Ta(a2, b2, c2);
        a2.Fb = [];
      }
      function fc(a2, b2, c2, d2, e2) {
        if (0 > d2 || 0 > e2)
          throw new P2(28);
        if (null === a2.fd)
          throw new P2(8);
        if (1 === (a2.flags & 2097155))
          throw new P2(8);
        if (R2(a2.node.mode))
          throw new P2(31);
        if (!a2.Ha.read)
          throw new P2(28);
        var h2 = "undefined" != typeof e2;
        if (!h2)
          e2 = a2.position;
        else if (!a2.seekable)
          throw new P2(70);
        b2 = a2.Ha.read(a2, b2, c2, d2, e2);
        h2 || (a2.position += b2);
        return b2;
      }
      function ma(a2, b2, c2, d2, e2) {
        if (0 > d2 || 0 > e2)
          throw new P2(28);
        if (null === a2.fd)
          throw new P2(8);
        if (0 === (a2.flags & 2097155))
          throw new P2(8);
        if (R2(a2.node.mode))
          throw new P2(31);
        if (!a2.Ha.write)
          throw new P2(28);
        a2.seekable && a2.flags & 1024 && ec(a2, 0, 2);
        var h2 = "undefined" != typeof e2;
        if (!h2)
          e2 = a2.position;
        else if (!a2.seekable)
          throw new P2(70);
        b2 = a2.Ha.write(a2, b2, c2, d2, e2, void 0);
        h2 || (a2.position += b2);
        return b2;
      }
      function va(a2) {
        var c2;
        var d2 = la(a2, d2 || 0);
        a2 = ac(a2).size;
        var e2 = new Uint8Array(a2);
        fc(d2, e2, 0, a2, 0);
        c2 = e2;
        na(d2);
        return c2;
      }
      function gc() {
        P2 || (P2 = function(a2, b2) {
          this.name = "ErrnoError";
          this.node = b2;
          this.Eb = function(c2) {
            this.Ka = c2;
          };
          this.Eb(a2);
          this.message = "FS error";
        }, P2.prototype = Error(), P2.prototype.constructor = P2, [44].forEach((a2) => {
          Eb[a2] = new P2(a2);
          Eb[a2].stack = "<generic error, no stack>";
        }));
      }
      var hc;
      function ic(a2, b2, c2) {
        a2 = u2("/dev/" + a2);
        var d2 = ia(!!b2, !!c2);
        jc ||= 64;
        var e2 = jc++ << 8 | 0;
        xb(e2, { open(h2) {
          h2.seekable = false;
        }, close() {
          c2?.buffer?.length && c2(10);
        }, read(h2, k2, r2, y2) {
          for (var v2 = 0, F2 = 0; F2 < y2; F2++) {
            try {
              var H2 = b2();
            } catch (pb) {
              throw new P2(29);
            }
            if (void 0 === H2 && 0 === v2)
              throw new P2(6);
            if (null === H2 || void 0 === H2)
              break;
            v2++;
            k2[r2 + F2] = H2;
          }
          v2 && (h2.node.timestamp = Date.now());
          return v2;
        }, write(h2, k2, r2, y2) {
          for (var v2 = 0; v2 < y2; v2++)
            try {
              c2(k2[r2 + v2]);
            } catch (F2) {
              throw new P2(29);
            }
          y2 && (h2.node.timestamp = Date.now());
          return v2;
        } });
        Yb(a2, d2, e2);
      }
      var jc, W2 = {}, Wb, dc;
      function kc(a2, b2, c2) {
        if ("/" === b2.charAt(0))
          return b2;
        a2 = -100 === a2 ? "/" : U2(a2).path;
        if (0 == b2.length) {
          if (!c2)
            throw new P2(44);
          return a2;
        }
        return u2(a2 + "/" + b2);
      }
      function lc(a2, b2, c2) {
        try {
          var d2 = a2(b2);
        } catch (h2) {
          if (h2 && h2.node && u2(b2) !== u2(ha(h2.node)))
            return -54;
          throw h2;
        }
        D2[c2 >> 2] = d2.dev;
        D2[c2 + 4 >> 2] = d2.mode;
        E2[c2 + 8 >> 2] = d2.nlink;
        D2[c2 + 12 >> 2] = d2.uid;
        D2[c2 + 16 >> 2] = d2.gid;
        D2[c2 + 20 >> 2] = d2.rdev;
        J2 = [d2.size >>> 0, (I2 = d2.size, 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
        D2[c2 + 24 >> 2] = J2[0];
        D2[c2 + 28 >> 2] = J2[1];
        D2[c2 + 32 >> 2] = 4096;
        D2[c2 + 36 >> 2] = d2.blocks;
        a2 = d2.atime.getTime();
        b2 = d2.mtime.getTime();
        var e2 = d2.ctime.getTime();
        J2 = [Math.floor(a2 / 1e3) >>> 0, (I2 = Math.floor(a2 / 1e3), 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
        D2[c2 + 40 >> 2] = J2[0];
        D2[c2 + 44 >> 2] = J2[1];
        E2[c2 + 48 >> 2] = a2 % 1e3 * 1e3;
        J2 = [Math.floor(b2 / 1e3) >>> 0, (I2 = Math.floor(b2 / 1e3), 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
        D2[c2 + 56 >> 2] = J2[0];
        D2[c2 + 60 >> 2] = J2[1];
        E2[c2 + 64 >> 2] = b2 % 1e3 * 1e3;
        J2 = [Math.floor(e2 / 1e3) >>> 0, (I2 = Math.floor(e2 / 1e3), 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
        D2[c2 + 72 >> 2] = J2[0];
        D2[c2 + 76 >> 2] = J2[1];
        E2[c2 + 80 >> 2] = e2 % 1e3 * 1e3;
        J2 = [d2.ino >>> 0, (I2 = d2.ino, 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
        D2[c2 + 88 >> 2] = J2[0];
        D2[c2 + 92 >> 2] = J2[1];
        return 0;
      }
      var Mc = void 0;
      function Oc() {
        var a2 = D2[+Mc >> 2];
        Mc += 4;
        return a2;
      }
      var Pc = (a2, b2) => b2 + 2097152 >>> 0 < 4194305 - !!a2 ? (a2 >>> 0) + 4294967296 * b2 : NaN, Qc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Rc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Sc = (a2) => {
        var b2 = da(a2) + 1, c2 = ea(b2);
        c2 && fa(a2, q2, c2, b2);
        return c2;
      }, Tc = {}, Vc = () => {
        if (!Uc) {
          var a2 = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: za || "./this.program" }, b2;
          for (b2 in Tc)
            void 0 === Tc[b2] ? delete a2[b2] : a2[b2] = Tc[b2];
          var c2 = [];
          for (b2 in a2)
            c2.push(`${b2}=${a2[b2]}`);
          Uc = c2;
        }
        return Uc;
      }, Uc, ta = (a2) => {
        var b2 = da(a2) + 1, c2 = x2(b2);
        fa(a2, q2, c2, b2);
        return c2;
      }, Wc = (a2, b2, c2, d2) => {
        var e2 = { string: (v2) => {
          var F2 = 0;
          null !== v2 && void 0 !== v2 && 0 !== v2 && (F2 = ta(v2));
          return F2;
        }, array: (v2) => {
          var F2 = x2(v2.length);
          p2.set(v2, F2);
          return F2;
        } };
        a2 = f2["_" + a2];
        var h2 = [], k2 = 0;
        if (d2)
          for (var r2 = 0; r2 < d2.length; r2++) {
            var y2 = e2[c2[r2]];
            y2 ? (0 === k2 && (k2 = pa()), h2[r2] = y2(d2[r2])) : h2[r2] = d2[r2];
          }
        c2 = a2.apply(null, h2);
        return c2 = function(v2) {
          0 !== k2 && sa(k2);
          return "string" === b2 ? v2 ? M2(q2, v2) : "" : "boolean" === b2 ? !!v2 : v2;
        }(c2);
      }, ba = 0, aa = (a2, b2) => {
        b2 = 1 == b2 ? x2(a2.length) : ea(a2.length);
        a2.subarray || a2.slice || (a2 = new Uint8Array(a2));
        q2.set(a2, b2);
        return b2;
      }, Xc, Yc = [], Y2, ua = (a2) => {
        Xc.delete(Y2.get(a2));
        Y2.set(a2, null);
        Yc.push(a2);
      }, xa = (a2, b2) => {
        if (!Xc) {
          Xc = /* @__PURE__ */ new WeakMap();
          var c2 = Y2.length;
          if (Xc)
            for (var d2 = 0; d2 < 0 + c2; d2++) {
              var e2 = Y2.get(d2);
              e2 && Xc.set(e2, d2);
            }
        }
        if (c2 = Xc.get(a2) || 0)
          return c2;
        if (Yc.length)
          c2 = Yc.pop();
        else {
          try {
            Y2.grow(1);
          } catch (r2) {
            if (!(r2 instanceof RangeError))
              throw r2;
            throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
          }
          c2 = Y2.length - 1;
        }
        try {
          Y2.set(c2, a2);
        } catch (r2) {
          if (!(r2 instanceof TypeError))
            throw r2;
          if ("function" == typeof WebAssembly.Function) {
            d2 = WebAssembly.Function;
            e2 = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
            for (var h2 = { parameters: [], results: "v" == b2[0] ? [] : [e2[b2[0]]] }, k2 = 1; k2 < b2.length; ++k2)
              h2.parameters.push(e2[b2[k2]]);
            b2 = new d2(h2, a2);
          } else {
            d2 = [1];
            e2 = b2.slice(0, 1);
            b2 = b2.slice(1);
            h2 = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
            d2.push(96);
            k2 = b2.length;
            128 > k2 ? d2.push(k2) : d2.push(k2 % 128 | 128, k2 >> 7);
            for (k2 = 0; k2 < b2.length; ++k2)
              d2.push(h2[b2[k2]]);
            "v" == e2 ? d2.push(0) : d2.push(1, h2[e2]);
            b2 = [0, 97, 115, 109, 1, 0, 0, 0, 1];
            e2 = d2.length;
            128 > e2 ? b2.push(e2) : b2.push(e2 % 128 | 128, e2 >> 7);
            b2.push.apply(b2, d2);
            b2.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
            b2 = new WebAssembly.Module(new Uint8Array(b2));
            b2 = new WebAssembly.Instance(b2, { e: { f: a2 } }).exports.f;
          }
          Y2.set(c2, b2);
        }
        Xc.set(a2, c2);
        return c2;
      };
      function Qb(a2, b2, c2, d2) {
        a2 ||= this;
        this.parent = a2;
        this.Ra = a2.Ra;
        this.Va = null;
        this.id = Kb++;
        this.name = b2;
        this.mode = c2;
        this.Ga = {};
        this.Ha = {};
        this.rdev = d2;
      }
      Object.defineProperties(Qb.prototype, { read: { get: function() {
        return 365 === (this.mode & 365);
      }, set: function(a2) {
        a2 ? this.mode |= 365 : this.mode &= -366;
      } }, write: { get: function() {
        return 146 === (this.mode & 146);
      }, set: function(a2) {
        a2 ? this.mode |= 146 : this.mode &= -147;
      } } });
      gc();
      S2 = Array(4096);
      Xb(Q2, "/");
      V2("/tmp");
      V2("/home");
      V2("/home/web_user");
      (function() {
        V2("/dev");
        xb(259, { read: () => 0, write: (d2, e2, h2, k2) => k2 });
        Yb("/dev/null", 259);
        wb(1280, zb);
        wb(1536, Ab);
        Yb("/dev/tty", 1280);
        Yb("/dev/tty1", 1536);
        var a2 = new Uint8Array(1024), b2 = 0, c2 = () => {
          0 === b2 && (b2 = kb(a2).byteLength);
          return a2[--b2];
        };
        ic("random", c2);
        ic("urandom", c2);
        V2("/dev/shm");
        V2("/dev/shm/tmp");
      })();
      (function() {
        V2("/proc");
        var a2 = V2("/proc/self");
        V2("/proc/self/fd");
        Xb({ Ra() {
          var b2 = Db(a2, "fd", 16895, 73);
          b2.Ga = { lookup(c2, d2) {
            var e2 = U2(+d2);
            c2 = { parent: null, Ra: { tb: "fake" }, Ga: { readlink: () => e2.path } };
            return c2.parent = c2;
          } };
          return b2;
        } }, "/proc/self/fd");
      })();
      var $c = {
        a: (a2, b2, c2, d2) => {
          C2(`Assertion failed: ${a2 ? M2(q2, a2) : ""}, at: ` + [b2 ? b2 ? M2(q2, b2) : "" : "unknown filename", c2, d2 ? d2 ? M2(q2, d2) : "" : "unknown function"]);
        },
        h: function(a2, b2) {
          try {
            return a2 = a2 ? M2(q2, a2) : "", ka(a2, b2), 0;
          } catch (c2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== c2.name)
              throw c2;
            return -c2.Ka;
          }
        },
        H: function(a2, b2, c2) {
          try {
            b2 = b2 ? M2(q2, b2) : "";
            b2 = kc(a2, b2);
            if (c2 & -8)
              return -28;
            var d2 = T2(b2, { Sa: true }).node;
            if (!d2)
              return -44;
            a2 = "";
            c2 & 4 && (a2 += "r");
            c2 & 2 && (a2 += "w");
            c2 & 1 && (a2 += "x");
            return a2 && Pb(d2, a2) ? -2 : 0;
          } catch (e2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== e2.name)
              throw e2;
            return -e2.Ka;
          }
        },
        i: function(a2, b2) {
          try {
            var c2 = U2(a2);
            ka(c2.node, b2);
            return 0;
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return -d2.Ka;
          }
        },
        g: function(a2) {
          try {
            var b2 = U2(a2).node;
            var c2 = "string" == typeof b2 ? T2(b2, { Sa: true }).node : b2;
            if (!c2.Ga.Oa)
              throw new P2(63);
            c2.Ga.Oa(c2, { timestamp: Date.now() });
            return 0;
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return -d2.Ka;
          }
        },
        b: function(a2, b2, c2) {
          Mc = c2;
          try {
            var d2 = U2(a2);
            switch (b2) {
              case 0:
                var e2 = Oc();
                if (0 > e2)
                  return -28;
                for (; Jb[e2]; )
                  e2++;
                return Vb(d2, e2).fd;
              case 1:
              case 2:
                return 0;
              case 3:
                return d2.flags;
              case 4:
                return e2 = Oc(), d2.flags |= e2, 0;
              case 5:
                return e2 = Oc(), Na[e2 + 0 >> 1] = 2, 0;
              case 6:
              case 7:
                return 0;
              case 16:
              case 8:
                return -28;
              case 9:
                return D2[Zc() >> 2] = 28, -1;
              default:
                return -28;
            }
          } catch (h2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== h2.name)
              throw h2;
            return -h2.Ka;
          }
        },
        f: function(a2, b2) {
          try {
            var c2 = U2(a2);
            return lc(ac, c2.path, b2);
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return -d2.Ka;
          }
        },
        n: function(a2, b2, c2) {
          b2 = Pc(b2, c2);
          try {
            if (isNaN(b2))
              return 61;
            var d2 = U2(a2);
            if (0 === (d2.flags & 2097155))
              throw new P2(28);
            cc(d2.node, b2);
            return 0;
          } catch (e2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== e2.name)
              throw e2;
            return -e2.Ka;
          }
        },
        C: function(a2, b2) {
          try {
            if (0 === b2)
              return -28;
            var c2 = da("/") + 1;
            if (b2 < c2)
              return -68;
            fa("/", q2, a2, b2);
            return c2;
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return -d2.Ka;
          }
        },
        F: function(a2, b2) {
          try {
            return a2 = a2 ? M2(q2, a2) : "", lc(bc, a2, b2);
          } catch (c2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== c2.name)
              throw c2;
            return -c2.Ka;
          }
        },
        z: function(a2, b2, c2) {
          try {
            return b2 = b2 ? M2(q2, b2) : "", b2 = kc(a2, b2), b2 = u2(b2), "/" === b2[b2.length - 1] && (b2 = b2.substr(
              0,
              b2.length - 1
            )), V2(b2, c2), 0;
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return -d2.Ka;
          }
        },
        E: function(a2, b2, c2, d2) {
          try {
            b2 = b2 ? M2(q2, b2) : "";
            var e2 = d2 & 256;
            b2 = kc(a2, b2, d2 & 4096);
            return lc(e2 ? bc : ac, b2, c2);
          } catch (h2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== h2.name)
              throw h2;
            return -h2.Ka;
          }
        },
        y: function(a2, b2, c2, d2) {
          Mc = d2;
          try {
            b2 = b2 ? M2(q2, b2) : "";
            b2 = kc(a2, b2);
            var e2 = d2 ? Oc() : 0;
            return la(b2, c2, e2).fd;
          } catch (h2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== h2.name)
              throw h2;
            return -h2.Ka;
          }
        },
        w: function(a2, b2, c2, d2) {
          try {
            b2 = b2 ? M2(q2, b2) : "";
            b2 = kc(a2, b2);
            if (0 >= d2)
              return -28;
            var e2 = Mb(b2), h2 = Math.min(d2, da(e2)), k2 = p2[c2 + h2];
            fa(e2, q2, c2, d2 + 1);
            p2[c2 + h2] = k2;
            return h2;
          } catch (r2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== r2.name)
              throw r2;
            return -r2.Ka;
          }
        },
        v: function(a2) {
          try {
            return a2 = a2 ? M2(q2, a2) : "", $b(a2), 0;
          } catch (b2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== b2.name)
              throw b2;
            return -b2.Ka;
          }
        },
        G: function(a2, b2) {
          try {
            return a2 = a2 ? M2(q2, a2) : "", lc(ac, a2, b2);
          } catch (c2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== c2.name)
              throw c2;
            return -c2.Ka;
          }
        },
        r: function(a2, b2, c2) {
          try {
            return b2 = b2 ? M2(q2, b2) : "", b2 = kc(a2, b2), 0 === c2 ? wa(b2) : 512 === c2 ? $b(b2) : C2("Invalid flags passed to unlinkat"), 0;
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return -d2.Ka;
          }
        },
        q: function(a2, b2, c2) {
          try {
            b2 = b2 ? M2(q2, b2) : "";
            b2 = kc(a2, b2, true);
            if (c2) {
              var d2 = E2[c2 >> 2] + 4294967296 * D2[c2 + 4 >> 2], e2 = D2[c2 + 8 >> 2];
              h2 = 1e3 * d2 + e2 / 1e6;
              c2 += 16;
              d2 = E2[c2 >> 2] + 4294967296 * D2[c2 + 4 >> 2];
              e2 = D2[c2 + 8 >> 2];
              k2 = 1e3 * d2 + e2 / 1e6;
            } else
              var h2 = Date.now(), k2 = h2;
            a2 = h2;
            var r2 = T2(b2, { Sa: true }).node;
            r2.Ga.Oa(r2, { timestamp: Math.max(a2, k2) });
            return 0;
          } catch (y2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== y2.name)
              throw y2;
            return -y2.Ka;
          }
        },
        l: function(a2, b2, c2) {
          a2 = new Date(1e3 * Pc(a2, b2));
          D2[c2 >> 2] = a2.getSeconds();
          D2[c2 + 4 >> 2] = a2.getMinutes();
          D2[c2 + 8 >> 2] = a2.getHours();
          D2[c2 + 12 >> 2] = a2.getDate();
          D2[c2 + 16 >> 2] = a2.getMonth();
          D2[c2 + 20 >> 2] = a2.getFullYear() - 1900;
          D2[c2 + 24 >> 2] = a2.getDay();
          b2 = a2.getFullYear();
          D2[c2 + 28 >> 2] = (0 !== b2 % 4 || 0 === b2 % 100 && 0 !== b2 % 400 ? Rc : Qc)[a2.getMonth()] + a2.getDate() - 1 | 0;
          D2[c2 + 36 >> 2] = -(60 * a2.getTimezoneOffset());
          b2 = new Date(a2.getFullYear(), 6, 1).getTimezoneOffset();
          var d2 = new Date(a2.getFullYear(), 0, 1).getTimezoneOffset();
          D2[c2 + 32 >> 2] = (b2 != d2 && a2.getTimezoneOffset() == Math.min(d2, b2)) | 0;
        },
        j: function(a2, b2, c2, d2, e2, h2, k2, r2) {
          e2 = Pc(e2, h2);
          try {
            if (isNaN(e2))
              return 61;
            var y2 = U2(d2);
            if (0 !== (b2 & 2) && 0 === (c2 & 2) && 2 !== (y2.flags & 2097155))
              throw new P2(2);
            if (1 === (y2.flags & 2097155))
              throw new P2(2);
            if (!y2.Ha.bb)
              throw new P2(43);
            var v2 = y2.Ha.bb(y2, a2, e2, b2, c2);
            var F2 = v2.Db;
            D2[k2 >> 2] = v2.ub;
            E2[r2 >> 2] = F2;
            return 0;
          } catch (H2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== H2.name)
              throw H2;
            return -H2.Ka;
          }
        },
        k: function(a2, b2, c2, d2, e2, h2, k2) {
          h2 = Pc(h2, k2);
          try {
            if (isNaN(h2))
              return 61;
            var r2 = U2(e2);
            if (c2 & 2) {
              if (32768 !== (r2.node.mode & 61440))
                throw new P2(43);
              if (!(d2 & 2)) {
                var y2 = q2.slice(a2, a2 + b2);
                r2.Ha.cb && r2.Ha.cb(r2, y2, h2, b2, d2);
              }
            }
          } catch (v2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== v2.name)
              throw v2;
            return -v2.Ka;
          }
        },
        s: (a2, b2, c2) => {
          function d2(y2) {
            return (y2 = y2.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? y2[1] : "GMT";
          }
          var e2 = (/* @__PURE__ */ new Date()).getFullYear(), h2 = new Date(e2, 0, 1), k2 = new Date(e2, 6, 1);
          e2 = h2.getTimezoneOffset();
          var r2 = k2.getTimezoneOffset();
          E2[a2 >> 2] = 60 * Math.max(e2, r2);
          D2[b2 >> 2] = Number(e2 != r2);
          a2 = d2(h2);
          b2 = d2(k2);
          a2 = Sc(a2);
          b2 = Sc(b2);
          r2 < e2 ? (E2[c2 >> 2] = a2, E2[c2 + 4 >> 2] = b2) : (E2[c2 >> 2] = b2, E2[c2 + 4 >> 2] = a2);
        },
        d: () => Date.now(),
        t: () => 2147483648,
        c: () => performance.now(),
        o: (a2) => {
          var b2 = q2.length;
          a2 >>>= 0;
          if (2147483648 < a2)
            return false;
          for (var c2 = 1; 4 >= c2; c2 *= 2) {
            var d2 = b2 * (1 + 0.2 / c2);
            d2 = Math.min(d2, a2 + 100663296);
            var e2 = Math;
            d2 = Math.max(a2, d2);
            a: {
              e2 = (e2.min.call(e2, 2147483648, d2 + (65536 - d2 % 65536) % 65536) - La.buffer.byteLength + 65535) / 65536;
              try {
                La.grow(e2);
                Qa();
                var h2 = 1;
                break a;
              } catch (k2) {
              }
              h2 = void 0;
            }
            if (h2)
              return true;
          }
          return false;
        },
        A: (a2, b2) => {
          var c2 = 0;
          Vc().forEach((d2, e2) => {
            var h2 = b2 + c2;
            e2 = E2[a2 + 4 * e2 >> 2] = h2;
            for (h2 = 0; h2 < d2.length; ++h2)
              p2[e2++ >> 0] = d2.charCodeAt(h2);
            p2[e2 >> 0] = 0;
            c2 += d2.length + 1;
          });
          return 0;
        },
        B: (a2, b2) => {
          var c2 = Vc();
          E2[a2 >> 2] = c2.length;
          var d2 = 0;
          c2.forEach((e2) => d2 += e2.length + 1);
          E2[b2 >> 2] = d2;
          return 0;
        },
        e: function(a2) {
          try {
            var b2 = U2(a2);
            na(b2);
            return 0;
          } catch (c2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== c2.name)
              throw c2;
            return c2.Ka;
          }
        },
        p: function(a2, b2) {
          try {
            var c2 = U2(a2);
            p2[b2 >> 0] = c2.tty ? 2 : R2(c2.mode) ? 3 : 40960 === (c2.mode & 61440) ? 7 : 4;
            Na[b2 + 2 >> 1] = 0;
            J2 = [0, (I2 = 0, 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
            D2[b2 + 8 >> 2] = J2[0];
            D2[b2 + 12 >> 2] = J2[1];
            J2 = [0, (I2 = 0, 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
            D2[b2 + 16 >> 2] = J2[0];
            D2[b2 + 20 >> 2] = J2[1];
            return 0;
          } catch (d2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== d2.name)
              throw d2;
            return d2.Ka;
          }
        },
        x: function(a2, b2, c2, d2) {
          try {
            a: {
              var e2 = U2(a2);
              a2 = b2;
              for (var h2, k2 = b2 = 0; k2 < c2; k2++) {
                var r2 = E2[a2 >> 2], y2 = E2[a2 + 4 >> 2];
                a2 += 8;
                var v2 = fc(e2, p2, r2, y2, h2);
                if (0 > v2) {
                  var F2 = -1;
                  break a;
                }
                b2 += v2;
                if (v2 < y2)
                  break;
                "undefined" !== typeof h2 && (h2 += v2);
              }
              F2 = b2;
            }
            E2[d2 >> 2] = F2;
            return 0;
          } catch (H2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== H2.name)
              throw H2;
            return H2.Ka;
          }
        },
        m: function(a2, b2, c2, d2, e2) {
          b2 = Pc(b2, c2);
          try {
            if (isNaN(b2))
              return 61;
            var h2 = U2(a2);
            ec(h2, b2, d2);
            J2 = [h2.position >>> 0, (I2 = h2.position, 1 <= +Math.abs(I2) ? 0 < I2 ? +Math.floor(I2 / 4294967296) >>> 0 : ~~+Math.ceil((I2 - +(~~I2 >>> 0)) / 4294967296) >>> 0 : 0)];
            D2[e2 >> 2] = J2[0];
            D2[e2 + 4 >> 2] = J2[1];
            h2.hb && 0 === b2 && 0 === d2 && (h2.hb = null);
            return 0;
          } catch (k2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== k2.name)
              throw k2;
            return k2.Ka;
          }
        },
        D: function(a2) {
          try {
            var b2 = U2(a2);
            return b2.Ha?.fsync ? b2.Ha.fsync(b2) : 0;
          } catch (c2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== c2.name)
              throw c2;
            return c2.Ka;
          }
        },
        u: function(a2, b2, c2, d2) {
          try {
            a: {
              var e2 = U2(a2);
              a2 = b2;
              for (var h2, k2 = b2 = 0; k2 < c2; k2++) {
                var r2 = E2[a2 >> 2], y2 = E2[a2 + 4 >> 2];
                a2 += 8;
                var v2 = ma(e2, p2, r2, y2, h2);
                if (0 > v2) {
                  var F2 = -1;
                  break a;
                }
                b2 += v2;
                "undefined" !== typeof h2 && (h2 += v2);
              }
              F2 = b2;
            }
            E2[d2 >> 2] = F2;
            return 0;
          } catch (H2) {
            if ("undefined" == typeof W2 || "ErrnoError" !== H2.name)
              throw H2;
            return H2.Ka;
          }
        }
      }, Z2 = function() {
        function a2(c2) {
          Z2 = c2.exports;
          La = Z2.I;
          Qa();
          Y2 = Z2.Aa;
          Sa.unshift(Z2.J);
          G2--;
          f2.monitorRunDependencies?.(G2);
          0 == G2 && (Xa && (c2 = Xa, Xa = null, c2()));
          return Z2;
        }
        var b2 = { a: $c };
        G2++;
        f2.monitorRunDependencies?.(G2);
        if (f2.instantiateWasm)
          try {
            return f2.instantiateWasm(b2, a2);
          } catch (c2) {
            return B2(`Module.instantiateWasm callback failed with error: ${c2}`), false;
          }
        db(b2, function(c2) {
          a2(c2.instance);
        });
        return {};
      }();
      f2._sqlite3_free = (a2) => (f2._sqlite3_free = Z2.K)(a2);
      f2._sqlite3_value_text = (a2) => (f2._sqlite3_value_text = Z2.L)(a2);
      var Zc = () => (Zc = Z2.M)();
      f2._sqlite3_prepare_v2 = (a2, b2, c2, d2, e2) => (f2._sqlite3_prepare_v2 = Z2.N)(a2, b2, c2, d2, e2);
      f2._sqlite3_step = (a2) => (f2._sqlite3_step = Z2.O)(a2);
      f2._sqlite3_reset = (a2) => (f2._sqlite3_reset = Z2.P)(a2);
      f2._sqlite3_exec = (a2, b2, c2, d2, e2) => (f2._sqlite3_exec = Z2.Q)(a2, b2, c2, d2, e2);
      f2._sqlite3_finalize = (a2) => (f2._sqlite3_finalize = Z2.R)(a2);
      f2._sqlite3_column_name = (a2, b2) => (f2._sqlite3_column_name = Z2.S)(a2, b2);
      f2._sqlite3_column_text = (a2, b2) => (f2._sqlite3_column_text = Z2.T)(a2, b2);
      f2._sqlite3_column_type = (a2, b2) => (f2._sqlite3_column_type = Z2.U)(a2, b2);
      f2._sqlite3_errmsg = (a2) => (f2._sqlite3_errmsg = Z2.V)(a2);
      f2._sqlite3_clear_bindings = (a2) => (f2._sqlite3_clear_bindings = Z2.W)(a2);
      f2._sqlite3_value_blob = (a2) => (f2._sqlite3_value_blob = Z2.X)(a2);
      f2._sqlite3_value_bytes = (a2) => (f2._sqlite3_value_bytes = Z2.Y)(a2);
      f2._sqlite3_value_double = (a2) => (f2._sqlite3_value_double = Z2.Z)(a2);
      f2._sqlite3_value_int = (a2) => (f2._sqlite3_value_int = Z2._)(a2);
      f2._sqlite3_value_type = (a2) => (f2._sqlite3_value_type = Z2.$)(a2);
      f2._sqlite3_result_blob = (a2, b2, c2, d2) => (f2._sqlite3_result_blob = Z2.aa)(a2, b2, c2, d2);
      f2._sqlite3_result_double = (a2, b2) => (f2._sqlite3_result_double = Z2.ba)(a2, b2);
      f2._sqlite3_result_error = (a2, b2, c2) => (f2._sqlite3_result_error = Z2.ca)(a2, b2, c2);
      f2._sqlite3_result_int = (a2, b2) => (f2._sqlite3_result_int = Z2.da)(a2, b2);
      f2._sqlite3_result_int64 = (a2, b2, c2) => (f2._sqlite3_result_int64 = Z2.ea)(a2, b2, c2);
      f2._sqlite3_result_null = (a2) => (f2._sqlite3_result_null = Z2.fa)(a2);
      f2._sqlite3_result_text = (a2, b2, c2, d2) => (f2._sqlite3_result_text = Z2.ga)(a2, b2, c2, d2);
      f2._sqlite3_aggregate_context = (a2, b2) => (f2._sqlite3_aggregate_context = Z2.ha)(a2, b2);
      f2._sqlite3_column_count = (a2) => (f2._sqlite3_column_count = Z2.ia)(a2);
      f2._sqlite3_data_count = (a2) => (f2._sqlite3_data_count = Z2.ja)(a2);
      f2._sqlite3_column_blob = (a2, b2) => (f2._sqlite3_column_blob = Z2.ka)(a2, b2);
      f2._sqlite3_column_bytes = (a2, b2) => (f2._sqlite3_column_bytes = Z2.la)(a2, b2);
      f2._sqlite3_column_double = (a2, b2) => (f2._sqlite3_column_double = Z2.ma)(a2, b2);
      f2._sqlite3_bind_blob = (a2, b2, c2, d2, e2) => (f2._sqlite3_bind_blob = Z2.na)(a2, b2, c2, d2, e2);
      f2._sqlite3_bind_double = (a2, b2, c2) => (f2._sqlite3_bind_double = Z2.oa)(a2, b2, c2);
      f2._sqlite3_bind_int = (a2, b2, c2) => (f2._sqlite3_bind_int = Z2.pa)(a2, b2, c2);
      f2._sqlite3_bind_text = (a2, b2, c2, d2, e2) => (f2._sqlite3_bind_text = Z2.qa)(a2, b2, c2, d2, e2);
      f2._sqlite3_bind_parameter_index = (a2, b2) => (f2._sqlite3_bind_parameter_index = Z2.ra)(a2, b2);
      f2._sqlite3_sql = (a2) => (f2._sqlite3_sql = Z2.sa)(a2);
      f2._sqlite3_normalized_sql = (a2) => (f2._sqlite3_normalized_sql = Z2.ta)(a2);
      f2._sqlite3_changes = (a2) => (f2._sqlite3_changes = Z2.ua)(a2);
      f2._sqlite3_close_v2 = (a2) => (f2._sqlite3_close_v2 = Z2.va)(a2);
      f2._sqlite3_create_function_v2 = (a2, b2, c2, d2, e2, h2, k2, r2, y2) => (f2._sqlite3_create_function_v2 = Z2.wa)(a2, b2, c2, d2, e2, h2, k2, r2, y2);
      f2._sqlite3_open = (a2, b2) => (f2._sqlite3_open = Z2.xa)(a2, b2);
      var ea = f2._malloc = (a2) => (ea = f2._malloc = Z2.ya)(a2), ca = f2._free = (a2) => (ca = f2._free = Z2.za)(a2);
      f2._RegisterExtensionFunctions = (a2) => (f2._RegisterExtensionFunctions = Z2.Ba)(a2);
      var Gb = (a2, b2) => (Gb = Z2.Ca)(a2, b2), pa = () => (pa = Z2.Da)(), sa = (a2) => (sa = Z2.Ea)(a2), x2 = (a2) => (x2 = Z2.Fa)(a2);
      f2.stackAlloc = x2;
      f2.stackSave = pa;
      f2.stackRestore = sa;
      f2.cwrap = (a2, b2, c2, d2) => {
        var e2 = !c2 || c2.every((h2) => "number" === h2 || "boolean" === h2);
        return "string" !== b2 && e2 && !d2 ? f2["_" + a2] : function() {
          return Wc(a2, b2, c2, arguments);
        };
      };
      f2.addFunction = xa;
      f2.removeFunction = ua;
      f2.UTF8ToString = ra;
      f2.ALLOC_NORMAL = ba;
      f2.allocate = aa;
      f2.allocateUTF8OnStack = ta;
      var ad;
      Xa = function bd() {
        ad || cd();
        ad || (Xa = bd);
      };
      function cd() {
        function a2() {
          if (!ad && (ad = true, f2.calledRun = true, !Ma)) {
            f2.noFSInit || hc || (hc = true, gc(), f2.stdin = f2.stdin, f2.stdout = f2.stdout, f2.stderr = f2.stderr, f2.stdin ? ic("stdin", f2.stdin) : Zb("/dev/tty", "/dev/stdin"), f2.stdout ? ic("stdout", null, f2.stdout) : Zb("/dev/tty", "/dev/stdout"), f2.stderr ? ic("stderr", null, f2.stderr) : Zb("/dev/tty1", "/dev/stderr"), la("/dev/stdin", 0), la("/dev/stdout", 1), la("/dev/stderr", 1));
            Lb = false;
            eb(Sa);
            if (f2.onRuntimeInitialized)
              f2.onRuntimeInitialized();
            if (f2.postRun)
              for ("function" == typeof f2.postRun && (f2.postRun = [f2.postRun]); f2.postRun.length; ) {
                var b2 = f2.postRun.shift();
                Ta.unshift(b2);
              }
            eb(Ta);
          }
        }
        if (!(0 < G2)) {
          if (f2.preRun)
            for ("function" == typeof f2.preRun && (f2.preRun = [f2.preRun]); f2.preRun.length; )
              Va();
          eb(Ra);
          0 < G2 || (f2.setStatus ? (f2.setStatus("Running..."), setTimeout(function() {
            setTimeout(function() {
              f2.setStatus("");
            }, 1);
            a2();
          }, 1)) : a2());
        }
      }
      if (f2.preInit)
        for ("function" == typeof f2.preInit && (f2.preInit = [f2.preInit]); 0 < f2.preInit.length; )
          f2.preInit.pop()();
      cd();
      return Module;
    });
    return initSqlJsPromise;
  };
  {
    module.exports = initSqlJs2;
    module.exports.default = initSqlJs2;
  }
})(sqlWasm);
var sqlWasmExports = sqlWasm.exports;
const initSqlJs = /* @__PURE__ */ getDefaultExportFromCjs(sqlWasmExports);
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i2 = 0; i2 < 256; ++i2) {
  byteToHex.push((i2 + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset2 = 0) {
  return byteToHex[arr[offset2 + 0]] + byteToHex[arr[offset2 + 1]] + byteToHex[arr[offset2 + 2]] + byteToHex[arr[offset2 + 3]] + "-" + byteToHex[arr[offset2 + 4]] + byteToHex[arr[offset2 + 5]] + "-" + byteToHex[arr[offset2 + 6]] + byteToHex[arr[offset2 + 7]] + "-" + byteToHex[arr[offset2 + 8]] + byteToHex[arr[offset2 + 9]] + "-" + byteToHex[arr[offset2 + 10]] + byteToHex[arr[offset2 + 11]] + byteToHex[arr[offset2 + 12]] + byteToHex[arr[offset2 + 13]] + byteToHex[arr[offset2 + 14]] + byteToHex[arr[offset2 + 15]];
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = {
  randomUUID
};
function v4(options, buf, offset2) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset2 = offset2 || 0;
    for (let i2 = 0; i2 < 16; ++i2) {
      buf[offset2 + i2] = rnds[i2];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
async function createFile(parentDirHandle, name, extension) {
  const fileName = `${name}.${extension}`;
  try {
    const fileHandle = await parentDirHandle.getFileHandle(fileName, { create: true });
    return fileHandle;
  } catch (err) {
    return new Error(`Cannot create a file(${fileName}) in ${parentDirHandle}`, err);
  }
}
async function writeToFile(fileHandle, toWrite) {
  try {
    const writable = await fileHandle.createWritable();
    await writable.write(toWrite);
    await writable.close();
    return true;
  } catch (err) {
    return new Error(`Cannot write to a file(${fileHandle}) in the local filesystem`, err);
  }
}
async function listAllFilesAndDirs(dirHandle) {
  const files = [];
  for await (let [name, handle] of dirHandle) {
    const { kind } = handle;
    if (handle.kind === "directory") {
      files.push({
        name,
        handle,
        kind,
        children: await listAllFilesAndDirs(handle)
      });
    } else {
      files.push({ name, handle, kind });
    }
  }
  return files;
}
async function downloadFile(name, blob) {
  const url = window.URL.createObjectURL(blob);
  const a2 = document.createElement("a");
  a2.href = url;
  a2.download = name;
  a2.click();
}
async function copyFile(sourceHandle, destinationHandle) {
  let sourceFile = await sourceHandle.getFile();
  let writableStream = destinationHandle.createWritable();
  await sourceFile.stream().pipeTo(writableStream);
  return destinationHandle;
}
const SQL = await initSqlJs(
  //{locateFile: file => `https://sql.js.org/dist/${file}`}
  //{locateFile: file => `sqlite/${file}`}
  { locateFile: (file) => `${file}` }
  //for dist
);
async function create(name) {
  const DB = new SQL.Database();
  DB.run(`
    CREATE TABLE nodes (
        id CHAR(32),
        value TEXT NOT NULL,
        links TEXT
    );
    `);
  DB.run(`
    INSERT INTO nodes VALUES (
        '${v4().replaceAll("-", "")}',
        '${`@${name}`}',
        '${JSON.stringify([])}'
    );`);
  console.log(DB.exec("SELECT * FROM nodes"));
  return DB;
}
async function load(input2) {
  let blob;
  if (input2 instanceof Blob) {
    blob = input2;
  } else if (input2 instanceof FileSystemFileHandle) {
    await input2.requestPermission();
    let file = await input2.getFile();
    blob = new Blob([file], { type: file.type });
  }
  let dbArrayBuffer = await blob.arrayBuffer();
  let DB = new SQL.Database(new Uint8Array(dbArrayBuffer));
  return DB;
}
async function update() {
  const data = appSession.root.DB.export();
  const blob = new Blob([data], { type: "application/octet-stream" });
  return await writeToFile(appSession.temp.rootHandle, blob);
}
const { div: div$4, span: span$1, button: button$2, textarea: textarea$2, input: input$2, a: a$2 } = van.tags;
class Logger {
  expanded = false;
  excludeFilter = null;
  get logs() {
    return appSession.temp.logs;
  }
  maxLogs = 100;
  log(content, type) {
    console.log(content);
    if (appSession.temp.logs.length > this.maxLogs) {
      appSession.temp.logs = appSession.temp.logs.slice(-this.maxLogs);
    }
    appSession.temp.logs.push({ content, type });
    this.render();
  }
  createLogView(data) {
    let { content, type } = data;
    return div$4(
      { class: type ? `log ${type}` : "log", innerHTML: content }
    );
  }
  showLastone() {
    let data = appSession.temp.logs[appSession.temp.logs.length - 1];
    if (!data)
      return;
    this.DOM.querySelector("#logs").append(this.createLogView(data));
  }
  showAll() {
    let logViews = [];
    for (let i2 = 0; i2 < 100; i2++) {
      let data = appSession.temp.logs[i2];
      if (!data)
        break;
      if (data?.type?.split(" ")?.includes(this.excludeFilter))
        break;
      logViews.push(this.createLogView(data));
    }
    this.DOM.querySelector("#logs").append(...logViews);
    this.DOM.querySelector("#logs").scroll(0, this.DOM.querySelector("#logs").scrollHeight);
  }
  render() {
    this.DOM.querySelector("#logs").innerHTML = "";
    if (this.expanded) {
      this.showAll();
      this.DOM.classList.add("expanded");
    } else {
      this.showLastone();
      this.DOM.classList.remove("expanded");
    }
  }
  clear() {
    appSession.temp.logs = [];
    this.render();
  }
  onclick() {
    this.expanded = !this.expanded;
    this.render();
  }
  DOM = div$4(
    { id: "LogsView" },
    div$4(
      { id: "logs" }
    ),
    div$4(
      { class: "options" },
      button$2({
        class: "expand",
        onclick: () => this.onclick()
      }, "<>"),
      button$2({
        onclick: () => this.clear()
      }, "Clear"),
      button$2({
        onclick: () => {
          if (this.excludeFilter === "unhandled") {
            this.excludeFilter = null;
          } else {
            this.excludeFilter = "unhandled";
          }
          this.render();
        }
      }, "Show Unhandled Errors")
    )
  );
}
const Logger$1 = new Logger();
function escape(string) {
  try {
    return string.replaceAll(`'`, `%27`);
  } catch {
    return string;
  }
}
function unescape(string) {
  try {
    return string.replaceAll(`%27`, `'`);
  } catch {
    return string;
  }
}
class NodeData {
  constructor(id, value, links) {
    this.id = id || v4().replaceAll("-", "");
    this.value = unescape(value) || "";
    this.links = typeof links === "string" ? JSON.parse(unescape(links)) : [];
    this.metadata = {
      createdDatetime: null,
      modifiedDatetime: null,
      author: null,
      editors: []
    };
  }
}
function simpleQuery(input2) {
  let startLetter = input2[0];
  let mid = input2.slice(1);
  let conditionMatches = {
    "@": `value='@${mid}'`,
    "#": `id='${mid}'`
  };
  return appSession.root.DB.exec(
    `SELECT * FROM nodes WHERE ${conditionMatches[startLetter] || `value='${input2}'`}`
  )[0]?.values;
}
async function parseQuery(input2) {
  try {
    let querySegments = input2.split("/");
    let context = simpleQuery(querySegments[0])[0];
    let contextLinks = new NodeData(...context).links;
    let lastSegmentMatch = context;
    let lastSegmentLinks = contextLinks;
    if (querySegments.length === 1)
      return [context];
    for (let i2 = 1; i2 < querySegments.length; i2++) {
      let targetQuerySegment = querySegments[i2];
      lastSegmentLinks.forEach((link) => {
        let linkId = link[1];
        let linkData = simpleQuery("#" + linkId)[0];
        let linkValue = unescape(linkData[1]);
        if (targetQuerySegment === linkValue) {
          lastSegmentLinks = JSON.parse(unescape(linkData[2]));
          lastSegmentMatch = linkData;
        }
      });
      console.log(lastSegmentMatch);
      if (!lastSegmentMatch) {
        return false;
      } else {
        if (i2 === querySegments.length - 1) {
          break;
        }
      }
    }
    return [lastSegmentMatch];
  } catch (err) {
    Logger$1.log(`failed to parse query: ${input2}. details: ${err}`, "error");
    return void 0;
  }
}
class NodeModel extends NodeData {
  constructor(...data) {
    super(...data);
  }
  get context() {
    let originLink = this.links.find((link) => link[0].split("/")[1] === "context");
    if (originLink)
      return originLink[1];
    else
      return null;
  }
  get isAuthname() {
    return this.value[0] === "@";
  }
  get authNameConflict() {
    try {
      if (appSession.root.DB.exec(`SELECT * FROM nodes WHERE value='${this.value}' AND NOT id='${this.id}'`)[0]?.values.length > 0)
        return true;
      else
        return false;
    } catch {
      return false;
    }
  }
  getAdress() {
    let originPath = this?.originNode?.path();
    if (originPath)
      return [...originPath, this.value];
    else
      return [this.value];
  }
  getAdressString() {
    return this.getAdress().join("/");
  }
  createRecord() {
    if (this.isAuthname && this.authNameConflict) {
      return false;
    }
    return appSession.root.DB.exec(`INSERT INTO nodes VALUES (${["id", "value", "links"].map((s2) => `'${typeof this[s2] === "string" ? this[s2] : JSON.stringify(this[s2])}'`).join(", ")})`);
  }
  readRecord() {
    return appSession.root.DB.exec(
      `SELECT * FROM nodes WHERE id='${this.id}';`
    );
  }
  updateRecord() {
    if (this.isAuthname && this.authNameConflict) {
      return false;
    }
    console.log(`UPDATE nodes SET ${["value", "links"].map((s2) => {
      return `${s2}='${typeof this[s2] === "string" ? escape(this[s2]) : escape(JSON.stringify(this[s2]))}'`;
    }).join(", ")} WHERE id='${this.id}';`);
    return appSession.root.DB.exec(
      `UPDATE nodes SET ${["value", "links"].map((s2) => {
        return `${s2}='${typeof this[s2] === "string" ? escape(this[s2]) : escape(JSON.stringify(this[s2]))}'`;
      }).join(", ")} WHERE id='${this.id}';`
    );
  }
  forget(id) {
    let aliveLinks = this.links.filter((l2) => l2[1] != id);
    this.links = aliveLinks;
    return this.updateRecord();
  }
  get readableLinks() {
    return this.links.map((l2) => {
      return {
        tie: l2[0],
        id: l2[1],
        value: appSession.root.DB.exec(
          `SELECT value FROM nodes WHERE id='${l2[1]}'`
        )[0]?.values?.at(0)?.at(0) || "unknown"
      };
    });
  }
  deleteRecord() {
    try {
      for (let link of this.links) {
        let oppID = link[1];
        let oppData = appSession.root.DB.exec(
          `SELECT * FROM nodes WHERE id='${oppID}'`
        )[0].values[0];
        let model = new NodeModel(...oppData);
        model.forget(this.id);
        console.log(oppID, oppData, model);
      }
      return appSession.root.DB.exec(`DELETE FROM nodes WHERE id='${this.id}'`);
    } catch (err) {
      Logger$1.log(err, "error");
    }
  }
  refreshData() {
    let newData = this.readRecord()[0];
    let newValues = newData.values[0];
    for (let i2 = 0; i2 < newData.columns.length; i2++) {
      let prop = newData.columns[i2];
      if (prop === "id")
        ;
      else if (prop === "links") {
        this[prop] = JSON.parse(newValues[i2]);
      } else {
        this[prop] = newValues[i2];
      }
    }
    return this;
  }
  addLink(tie, nodeID2, index) {
    if (index) {
      this.links.splice(index, 1, [tie, nodeID2]);
    } else {
      this.links.push([tie, nodeID2]);
    }
    this.updateRecord();
  }
  linkTo(tie, nodeID2) {
    let mirrorTie = structuredClone(tie.split("/")).reverse().join("/");
    let newNodeModel = new NodeModel(nodeID2, null, []);
    newNodeModel.refreshData();
    this.addLink(tie, newNodeModel.id);
    newNodeModel.addLink(mirrorTie, this.id);
  }
  createLinkedNode(tie, value) {
    let newNodeModel = new NodeModel(null, value, []);
    newNodeModel.createRecord();
    this.addLink(tie, newNodeModel.id);
    let mirrorTie = structuredClone(tie.split("/")).reverse().join("/");
    newNodeModel.addLink(mirrorTie, this.id);
    return newNodeModel;
  }
  deleteLink(tie, nodeID2) {
    let prevThisLink = this.links.find(([t2, n2]) => t2 === tie && n2 === this.id);
    this.links.splice(this.links.indexOf(prevThisLink), 1);
    this.updateRecord();
    let mirrorTie = structuredClone(tie.split("/")).reverse().join("/");
    let newNodeModel = new NodeModel(nodeID2, null, []);
    newNodeModel.refreshData();
    let prevMirroredLink = newNodeModel.links.find(([t2, n2]) => t2 === mirrorTie && n2 === this.id);
    newNodeModel.links.splice(newNodeModel.links.indexOf(prevMirroredLink), 1);
    newNodeModel.updateRecord();
  }
  changeTie(prevTie, newTie, oppID) {
    let prevTieMirrored = structuredClone(prevTie.split("/")).reverse().join("/");
    let newTieMirrored = structuredClone(newTie.split("/")).reverse().join("/");
    let prevThisLink = this.links.find(([t2, n2]) => t2 === prevTie && n2 === oppID);
    this.links.splice(this.links.indexOf(prevThisLink), 1, [newTie, oppID]);
    this.updateRecord();
    let oppModel = new NodeModel(oppID, null, []);
    oppModel.refreshData();
    debugger;
    let prevMirroredLink = oppModel.links.find(([t2, n2]) => t2 === prevTieMirrored && n2 === this.id);
    oppModel.links.splice(oppModel.links.indexOf(prevMirroredLink), 1, [newTieMirrored, this.id]);
    oppModel.updateRecord();
  }
}
const { div: div$3, a: a$1, b, dialog, br } = van.tags;
const aboutDOM = dialog(
  { id: "AboutRoot" },
  div$3({ class: "title" }, "Root 木"),
  div$3(b("You are the context.")),
  div$3({ innerHTML: `<b>Root</b> allows you to create and navigate a private network of data easily.
        you can view and save data which originates from a <b>root</b>, which can be <b>you</b>.
        Be a center of what you store. You are the context.
        for more details, visit <a href="https://github.com/alanuv7v/Root" target="blank">the github repo</a>.` })
);
const tagsToUse = "div button input dialog".split(" ");
const tag = {};
tagsToUse.forEach((t2) => {
  tag[t2] = (id, props, ...children) => van.tags[t2]({ id, ...props }, children);
});
const { div: div$2, button: button$1, input: input$1 } = tag;
const DOM = div$2(
  "App",
  {
    style: "font-size: 16px;"
  },
  div$2(
    "Header",
    { class: "" },
    div$2(
      "QuickActions",
      {},
      button$1("ShowAbout", {
        tooltip: "About"
      }, "木"),
      aboutDOM,
      button$1("History", {
        tooltip: "History"
      }, "↹"),
      button$1("GoBack", {
        tooltip: "Go Back"
      }, "◁"),
      button$1("GoForth", {
        tooltip: "Go Forth"
      }, "▷"),
      button$1("Debugger", {
        tooltip: "Debugger",
        onclick: () => {
          let t2 = van.tags.textarea();
          refs$1("Editor").append(t2);
          t2.addEventListener("change", (event) => {
            let res = JSON.stringify(new Function(`return ${event.target.value}`)(), null, 2);
            Logger$1.log(res);
          });
        }
      }, "<>"),
      //button("RegrowTree", {}, "⟳"),
      input$1("GoTo", {
        onchange: (event) => {
          Navigate.show_node_(event.target.value);
        },
        tooltip: "Go to"
      }),
      input$1("Filter", {
        tooltip: "Filter",
        type: "text",
        placeholder: "filter",
        value: "*",
        onchange: (event) => {
          appSession.globalFilter = event.target.value;
        }
      })
    ),
    div$2(
      "Commands",
      {},
      div$2("Logs")
    )
  ),
  div$2(
    "Main",
    {},
    div$2(
      "View",
      { class: "" },
      div$2(
        "Editor",
        { oncontextmenu: (event) => {
          event.preventDefault();
          event.stopPropagation();
          return false;
        } },
        div$2("Nodes"),
        div$2("", { class: "overlay" })
      )
    )
  ),
  div$2(
    "Footer",
    { class: "" },
    div$2("States"),
    Logger$1.DOM,
    input$1("CommandPalette")
  )
);
const refs = (id) => {
  return DOM.querySelector("#" + id);
};
const refs$1 = refs;
const { textarea: textarea$1, div: div$1 } = van.tags;
function autoResizedTextarea(props) {
  let inputTextarea = textarea$1({
    placeholder: " ",
    spellcheck: false,
    ...props
  });
  inputTextarea.classList.add("input");
  let visibleTextarea = textarea$1({
    class: "visible",
    placeholder: " ",
    spellcheck: false,
    ...props
  });
  visibleTextarea.classList.add("visible");
  let res = div$1(
    { class: "autoResize" },
    inputTextarea,
    visibleTextarea
  );
  res.onAutoResize = null;
  res.autoResize = () => {
    if (res.onAutoResize)
      res.onAutoResize();
    inputTextarea.style.height = "0px";
    inputTextarea.style.height = inputTextarea.scrollHeight + "px";
    visibleTextarea.style.height = inputTextarea.style.height;
    visibleTextarea.value = inputTextarea.value;
  };
  inputTextarea.addEventListener("input", res.autoResize, false);
  inputTextarea.style.transition = "none";
  //!!!!!!
  res.style.position = "relative";
  res.style.height = "fit-content";
  inputTextarea.style.position = "absolute";
  visibleTextarea.style.position = "relative";
  inputTextarea.style.color = "rgba(0,0,0,0)";
  visibleTextarea.style.pointerEvents = "none";
  visibleTextarea.style.backgroundColor = "transparent";
  inputTextarea.style.overflow = "hidden";
  visibleTextarea.style.overflow = "hidden";
  visibleTextarea.style.transition = "none";
  inputTextarea.style.caretColor = "var(--light)";
  return res;
}
class Tie {
  constructor(string, from, to) {
    if (string) {
      let s2 = string.split("/");
      this.from = s2[0];
      this.to = s2[1];
    } else {
      this.from = from;
      this.to = to;
    }
  }
  get toString() {
    return this.from + "/" + this.to;
  }
  get toArray() {
    return [this.from, this.to];
  }
  get mirror() {
    return structuredClone(this.toArray).reverse().join("/");
  }
}
const { div, span, button, textarea, input, a } = van.tags;
class NodeView extends NodeModel {
  constructor(...data) {
    super(...data);
  }
  onDomMount = () => {
    this.updateStyle();
    Array.from(this.DOM.querySelectorAll(".autoResize"))?.forEach((d2) => d2.autoResize());
  };
  selected = false;
  opened = false;
  filter = null;
  openedFrom = null;
  //NodeView that opened this node
  tie = "";
  linkedNodeViews = [];
  deleteReady = false;
  get isReference() {
    return this.value.startsWith(">");
  }
  get referenceQuery() {
    return this.value.slice(1);
  }
  get siblings() {
    return this.openedFrom.linkedNodeViews;
  }
  get siblingsIndex() {
    for (let i2 = 0; i2 < this.siblings.length; i2++) {
      let s2 = this.siblings[i2];
      if (this.id === s2.id) {
        break;
      }
    }
  }
  get linkIndex() {
    let res;
    for (let i2 = 0; i2 < this.openedFrom.links.length; i2++) {
      let l2 = this.openedFrom.links[i2];
      if (this.tie === l2[0] && this.id === l2[1]) {
        res = i2;
        break;
      }
    }
    return res;
  }
  actionsDOM = div(
    { class: "actions" },
    button({
      class: "linksOpener",
      onclick: () => this.toggleOpen(),
      innerText: this.links.filter((link) => link[0].split("/")[1] != "_origin").length,
      tooltip: "toggle show links"
    }),
    button(
      { onclick: () => {
        this.deselect();
      }, tooltip: "deselect node" },
      "*"
      /* "hide options */
    ),
    button({ onclick: () => {
      this.findNewOrigin();
    }, tooltip: "set new origin" }, "$"),
    button(
      { onclick: async () => {
        this.showAuthContext(0);
      }, tooltip: "find full context" },
      "^^"
      /* "show authName origin" */
    ),
    button(
      { onclick: async () => {
        this.showContext();
      }, tooltip: "find context" },
      "^"
      /* "show origin" */
    ),
    button(
      { onclick: () => {
        let newNode = this.createBranch();
        this.open();
        this.linkedNodeViews.find((v2) => v2.id === newNode.id)?.select();
      }, tooltip: "create new branch" },
      "+"
      /* "new branch" */
    ),
    /* button({onclick: () => {
        hearCommand((queryString) => {
            try {
                let targetNodeId = parseQuery(queryString)[0].id
                this.linkTo(this.tie, targetNodeId)
                this.open()
            } catch (err) {
                Logger.log(`failed to link "${queryString}"`, "error")
            }
        })
    }, tooltip: "create new link"}, "~"), */
    //replaced by creating a link with value=">(queryString)"
    button(
      {
        onclick: (e2) => {
          console.log(this);
          if (this.deleteReady) {
            this.delete();
          } else {
            e2.target.innerText = "confirm to delete!";
            this.deleteReady = true;
          }
        },
        onblur: (e2) => {
          if (this.deleteReady)
            e2.target.value = "delete";
        },
        tooltip: "delete node"
      },
      "X"
      /* "delete" */
    ),
    //button("save metadata"),
    button(
      { onclick: () => {
        if (this.opened)
          this.close();
        else
          this.open();
      }, tooltip: "open/close" },
      "<>"
      /* "open/close" */
    ),
    button(
      { onclick: () => {
        refs$1("CommandPalette").focus();
        refs$1("CommandPalette").placeholder = "filter...";
        let onArgumentsSubmit = async (event) => {
          let actionResult = this.filter = event.target.value;
          console.log(actionResult);
          refs$1("CommandPalette").placeholder = "";
          refs$1("CommandPalette").removeEventListener("blur", onArgumentsSubmit);
          this.close();
          this.open();
        };
        refs$1("CommandPalette").addEventListener("blur", onArgumentsSubmit);
      }, tooltip: "filter links" },
      "()"
      /* "filter" */
    ),
    button(
      { onclick: () => {
        Navigate.show_node_(`#${this.id}`);
      }, tooltip: "plant this node" },
      "."
      /* "plant" */
    ),
    button({
      onmousedown: () => {
        this.openTreeLoopCancelTrigger = false;
        this.openTreeLoop(20, 5, () => this.openTreeLoopCancelTrigger);
      },
      onmouseup: () => {
        this.openTreeLoopCancelTrigger = true;
      }
    }, "{")
  );
  delete() {
    this.DOM.remove();
    this.deleteRecord();
    this.openedFrom.refreshData();
    this.openedFrom.updateStyle();
    this.openedFrom.open();
    try {
      let prevSiblingsIndex = this.siblingsIndex;
      this.openedFrom.linkedNodeViews.at(prevSiblingsIndex - 1).select();
    } catch {
      this.openedFrom?.select();
    }
  }
  linksDOM = div({ class: "links" });
  DOM = div(
    {
      class: "node",
      onmouseenter: (event) => this.#onHover(event),
      oncontextmenu: (event) => event.preventDefault()
    },
    div({ class: "overlay" }),
    div(
      { class: "main" },
      input({
        class: "tieInput",
        placeholder: "from/to",
        onclick: (event) => {
          if (["planted", "/:reference"].includes(this.tie)) {
            event.target.disabled = true;
          } else {
            event.target.disabled = false;
          }
          event.target.value = event.target.value.split(" ----- ").join("/");
        },
        onblur: (event) => {
          event.target.value = event.target.value.split("/").join(" ----- ");
        },
        onchange: (event) => {
          let prevTie = structuredClone(this.tie);
          this.tie = event.target.value;
          prevTie.split("/");
          this.changeTie(new Tie(prevTie).mirror, new Tie(this.tie).mirror, this.openedFrom.id);
          event.target.value = event.target.value.split("/").join(" ----- ");
          this.showTieDefault();
        }
      }),
      div(
        { class: "valueWrap" },
        div({ class: "selectionIndicator" }),
        autoResizedTextarea({
          class: "value",
          value: this.value,
          onclick: (event) => this.#onclick(event),
          onauxclick: (event) => this.#onauxclick(event),
          onchange: (event) => {
            this.#onvaluechange(event);
          },
          onfocus: () => this.select(),
          onkeydown: (event) => this.#onkeydown(event),
          onselect: (event) => this.#onselect(event),
          onfocus: (e2) => {
            e2.preventDefault();
            e2.target.focus({ preventScroll: true });
          }
        })
      ),
      div(
        { class: "options" },
        this.actionsDOM
      )
    ),
    this.linksDOM
  );
  async open(replacers = [], options = {}) {
    const defaultOptions = {
      softAppear: false
    };
    options = { ...defaultOptions, ...options };
    if (this.opened)
      this.close();
    if (this.isReference) {
      this.linkedNodeViews = parseQuery(this.referenceQuery);
    } else if (!this.links || this.links.length < 1) {
      return;
    }
    this.DOM.querySelector(".links").innerHTML = "";
    if (this.isReference) {
      console.log(await parseQuery(this.referenceQuery));
      this.linkedNodeViews = (await parseQuery(this.referenceQuery)).map((data) => {
        let view = new NodeView(...data);
        view.openedFrom = this;
        view.tie = "/:reference";
        return view;
      });
    } else {
      this.linkedNodeViews = this.links.map((link) => {
        let tie = link[0];
        let res = appSession.root.getNodeById(link[1]);
        if (tie && res)
          return { tie, data: res[0] };
      }).filter((link) => link).filter((link) => link.data[0] != this.openedFrom?.id).filter((link) => link.data[0] != this.context).filter((link) => {
        let tie = link.tie;
        link.data[1];
        return tie === appSession.globalFilter || tie === this.filter || !this.filter;
      }).map(({ tie, data }) => {
        return {
          tie,
          view: replacers?.find((r2) => r2.id === data[0]) || new NodeView(...data)
        };
      }).map(({ tie, view }) => {
        if (tie === "_origin/_value")
          view.originView = this;
        view.openedFrom = this;
        view.tie = tie;
        return view;
      });
    }
    this.linkedNodeViews.forEach((view) => {
      if (options.softAppear) {
        view.DOM.classList.add("appear");
      }
      this.DOM.querySelector(".links").append(view.DOM);
      view.onDomMount();
    });
    this.opened = true;
    this.updateStyle();
    return this.linkedNodeViews;
  }
  close() {
    this.DOM.querySelector(".links").innerHTML = "";
    this.opened = false;
  }
  select() {
    console.log(this);
    if (appSession.selectedNode) {
      appSession.selectedNode.deselect();
    }
    this.DOM.classList.add("selected");
    this.selected = true;
    appSession.selectedNode = this;
    appSession.temp.lastNodeId = this.id;
    this.DOM.querySelector("textarea.value.input").focus();
    this.showOptions();
    this.showTie();
  }
  deselect() {
    this.DOM.classList.remove("selected");
    appSession.selectedNode = null;
    this.selected = false;
    this.hideOptions();
    this.showTieDefault();
  }
  plant() {
    refs$1("Nodes").innerHTML = "";
    refs$1("Nodes").append(this.DOM);
    this.tie = "planted";
    this.onDomMount();
  }
  toggleOpen() {
    if (!this.opened) {
      this.open();
    } else {
      this.close();
    }
  }
  async showContext() {
    if (!this.context)
      return false;
    let res = await parseQuery(`#${this.context}`);
    let contextView = new NodeView(...res[0]);
    contextView.plant();
    contextView.open([this]);
    contextView.select();
    return contextView;
  }
  async showAuthContext(i2) {
    if (i2 >= 10) {
      return false;
    }
    let lastOrigin = await this.showContext();
    if (lastOrigin && !lastOrigin.isAuthname) {
      i2++;
      lastOrigin.showAuthContext(i2);
    } else {
      return lastOrigin;
    }
  }
  moveLinkIndex(toAdd) {
    if (toAdd === 0)
      return false;
    let toSwapWith = this.siblings[this.siblingsIndex + toAdd];
    console.log(toSwapWith.value);
    let targetIndex = toSwapWith?.linkIndex;
    if (!targetIndex || targetIndex < -1 || targetIndex > this.openedFrom.links.length)
      return false;
    this.openedFrom.links.splice(this.linkIndex, 1);
    this.openedFrom.links.splice(targetIndex, 0, [this.tie, this.id]);
    console.log(this.openedFrom.links);
    this.openedFrom.updateRecord();
  }
  moveUp() {
    let res = this.moveLinkIndex(-1);
    let prevSiblingsIndex = this.siblingsIndex;
    this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex, 1);
    this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex - 1, 0, this);
    this.DOM.parentNode.insertBefore(this.DOM, this.DOM.previousSibling);
    this.select();
    return res;
  }
  moveDown() {
    let res = this.moveLinkIndex(1);
    let prevSiblingsIndex = this.siblingsIndex;
    this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex, 1);
    this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex + 1, 0, this);
    if (this.DOM.nextSibling.nextSibling) {
      this.DOM.parentNode.insertBefore(this.DOM, this.DOM.nextSibling.nextSibling);
    } else {
      this.DOM.parentNode.insertBefore(this.DOM, null);
    }
    this.select();
    return res;
  }
  findNewOrigin() {
    this.DOM.classList.add("finding-new-origin");
    appSession.onClickedNodeChange = (nodeView) => {
      this.reOrigin(nodeView.id, nodeView);
    };
    this.select();
  }
  reOrigin(newOriginId, newOriginView) {
    if (this.id === newOriginId)
      return false;
    let newModel = new NodeModel(newOriginId);
    newModel.refreshData();
    newModel.addLink(this.tie, this.id);
    this.openedFrom.links.splice(this.linkIndex, 1);
    this.openedFrom.updateRecord();
    this.openedFrom.linkedNodeViews.splice(this.siblingsIndex, 1);
    this.openedFrom.open();
    if (!newOriginView)
      return;
    newOriginView.refreshData();
    newOriginView.open();
    appSession.onClickedNodeChange = () => {
    };
    this.DOM.classList.remove("finding-new-origin");
    this.select();
  }
  createBranch(value) {
    if (this.isReference)
      return false;
    return this.createLinkedNode("context/", value || "");
  }
  showTie() {
    this.DOM.querySelector(".tieInput").style.display = "inline-block";
  }
  showTieDefault() {
    this.DOM.querySelector(".tieInput").style.display = this.tie === "context/" ? "none" : "inline-block";
  }
  updateStyle() {
    try {
      this.showTieDefault();
      this.DOM.querySelector(".tieInput").value = this.tie.split("/").join(" ----- ");
      if (this.isAuthname) {
        this.DOM.classList.add("authName");
      } else {
        this.DOM.classList.remove("authName");
      }
      if (this.isReference) {
        this.DOM.classList.add("reference");
      } else {
        this.DOM.classList.remove("reference");
      }
      this.DOM.querySelector(".linksOpener").innerText = this.links.filter((link) => link[0].split("/")[1] != "context").length;
    } catch (err) {
      console.error(err);
    }
  }
  #onclick() {
    this.toggleOptionsDisplay();
    if (!this.selected) {
      this.select();
    }
    appSession.clickedNode = this;
  }
  optionSleep = false;
  optionShown = false;
  toggleOptionsDisplay() {
    if (this.optionShown) {
      this.hideOptions();
    } else {
      this.showOptions();
    }
  }
  showOptions() {
    this.DOM.classList.add("option-shown");
    this.optionShown = true;
  }
  hideOptions() {
    this.DOM.classList.remove("option-shown");
    this.optionShown = false;
  }
  #onauxclick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleOptionsDisplay();
  }
  #onvaluechange(event) {
    this.value = event.target.value;
    if (this.isAuthname && this.authNameConflict) {
      console.log(this.DOM, event.target);
      this.DOM.classList.add("error");
      event.target.value += "  // this authentic name conflicts pre-existing nodedata record!";
      return false;
    }
    this.DOM.classList.remove("error");
    this.updateRecord();
    this.updateStyle();
  }
  #onHover(event) {
    appSession.hoveredNode = this;
  }
  #onkeydown(event) {
    if (event.key === "Enter" && event.altKey) {
      event.preventDefault();
      try {
        this.openedFrom.createBranch();
        this.openedFrom.open();
        this.openedFrom.linkedNodeViews.slice(-1)[0]?.select();
      } catch {
      }
    } else if (event.key === "ArrowUp" && event.altKey && event.shiftKey) {
      this.moveUp();
    } else if (event.key === "ArrowDown" && event.altKey && event.shiftKey) {
      this.moveDown();
    } else if (event.key === "ArrowRight" && event.altKey && event.shiftKey) {
      let newNode = this.createBranch();
      this.open();
      this.linkedNodeViews.find((v2) => v2.id === newNode.id)?.select();
    } else if (event.key === "Backspace" && event.target.value.length <= 0) {
      this.delete();
      event.preventDefault();
    } else if (event.key === "ArrowUp" && event.altKey) {
      this.siblings[this.siblingsIndex - 1]?.select();
    } else if (event.key === "ArrowDown" && event.altKey) {
      this.siblings[this.siblingsIndex + 1]?.select();
    } else if (event.key === "ArrowLeft" && event.altKey && event.ctrlKey) {
      event.preventDefault();
      if (!this.openedFrom) {
        this.showContext();
      }
      this.openedFrom?.select();
    } else if (event.key === "ArrowRight" && event.altKey && event.ctrlKey) {
      event.preventDefault();
      if (!this.opened)
        this.open();
      this.linkedNodeViews[0]?.select();
    } else if (event.key.startsWith("Arrow") && event.target.selectionStart === event.target.selectionEnd) {
      let pos = event.target.selectionStart;
      let lines = event.target.value.split("\n");
      let lastLineStart = lines.slice(0, -1).reduce((acc, l2) => acc + l2.length, 0) + Math.max(lines.length - 1, 0) * "\n".length;
      let atTheTopLine = pos <= lines[0].length;
      let atTheBottomLine = pos >= lastLineStart;
      console.log(pos, lines, lastLineStart, atTheTopLine, atTheBottomLine);
      if (event.key === "ArrowUp" && atTheTopLine) {
        this?.siblings[this.siblingsIndex - 1]?.select();
      } else if (event.key === "ArrowDown" && atTheBottomLine) {
        this?.siblings[this.siblingsIndex + 1]?.select();
      }
    }
  }
  #onselect(event) {
  }
  openTreeLoopCancelTrigger = false;
  async openTreeLoop(maxOpenCount = 20, maxDepths = 5, isCanceled, options) {
    const defualtOptions = {
      siblingOpenDelay: 1e3,
      depthOpenDelay: 1e3
    };
    options = { ...defualtOptions, ...options };
    if (!this.opened)
      await this.open(null, { softAppear: true });
    let lastDepth = this.linkedNodeViews;
    let depthCount = 0;
    let openCount = 0;
    async function openDepthLoop() {
      async function openViews(views) {
        function timeout(ms) {
          return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
        }
        for await (let view of views) {
          if (isCanceled())
            break;
          await timeout(view.open(null, { softAppear: true }));
          await timeout(options.depthOpenDelay);
          console.log(view.value);
        }
        return views;
      }
      if (isCanceled())
        return;
      if (!lastDepth || lastDepth.length <= 0) {
        return;
      }
      await openViews(lastDepth);
      let depthDown = lastDepth.map((v2) => v2.linkedNodeViews).flat();
      openCount += lastDepth.length;
      depthCount++;
      if (depthCount > maxDepths || openCount > maxOpenCount) {
        return;
      } else {
        lastDepth = depthDown;
        openDepthLoop();
      }
      console.log({ lastDepth, depthCount, maxDepths, openCount, maxOpenCount });
    }
    await openDepthLoop();
  }
  removeView() {
    this.openedFrom.linkedNodeViews.splice(this.siblingsIndex, 1);
    this.DOM.remove();
  }
  lateFilter() {
    let noViews = [];
    this.linkedNodeViews.forEach((view) => {
      let okay = [this.filter, appSession.globalFilter].includes(new Tie(view.tie).mirror);
      if (!okay) {
        noViews.push(view);
      }
    });
    noViews.forEach(
      (view) => view.removeView()
    );
  }
  treeLateFilter(maxViews = 50) {
    let viewCount = 0;
    function loop(view) {
      view.lateFilter();
      for (const linkedView of view.linkedNodeViews) {
        if (viewCount > maxViews)
          break;
        viewCount++;
        loop(linkedView);
      }
    }
    loop(this);
  }
}
async function init() {
  appSession.browserDB = BrowserDB;
  let defaultSettings = appSession.settings;
  try {
    appSession.settings = { ...defaultSettings, ...JSON.parse((await BrowserDB.settings.get("lastUsed")).data) };
  } catch {
  }
  Visual.set_size();
  let lastSession = await getLastSession();
  console.log("lastSession: ", lastSession);
  if (lastSession?.data) {
    appSession.copy(lastSession.data);
    console.log("Loaded last session data.");
    await initRootDB(lastSession.data.rootHandle);
    try {
      await Navigate.show_node_("#" + appSession.temp.lastNodeId);
    } catch (err) {
      try {
        let rootName = appSession.rootName;
        Navigate.show_node_(`@${rootName}`);
      } catch {
        Navigate.show_node_(`@root`);
      }
    }
  } else {
    console.log("Could not copy last session data. The last session data is corrupted or does not exist.");
    await saveSession();
    console.log("Created new app session with empty data.");
  }
  Sessions.autosave_on();
}
async function initRootDB(rootHandle) {
  console.log("initializing root DB...");
  try {
    if (!await rootHandle?.queryPermission() === "granted") {
      await rootHandle?.requestPermission();
    }
    appSession.root.name = rootHandle.name, appSession.root.DB = await load(rootHandle);
    console.log("initialized root DB.");
    return appSession.root.DB;
  } catch (err) {
    Logger$1.log(`failed to initialise root DB. error: 
${err}`, "error");
  }
}
async function initNetwork(networkDirHandle) {
  if (networkDirHandle) {
    if (!await networkDirHandle?.queryPermission() === "granted") {
      await networkDirHandle?.requestPermission();
    }
    appSession.temp.network.handle = networkDirHandle;
    appSession.temp.network.DB.handle = (await listAllFilesAndDirs(networkDirHandle)).find((item) => {
      return item.name === "database";
    }).handle;
    appSession.network.name = networkDirHandle.name || "new network";
    appSession.network.DB = await load(
      await appSession.temp.network.DB.handle.getFile()
    );
  }
  try {
    Navigate.show_node_(`@${appSession.network.name}`);
  } catch {
    Navigate.show_node_(`@origin`);
  }
  return appSession.network;
}
const Fix = {
  init,
  init_root_DB: initRootDB
};
const Sessions = {
  autosave_on() {
    if (appSession.settings.autosaveInterval < 10 * 1e3)
      return false;
    appSession.settings.autosave = true;
    appSession.settings.autosaveIntervalId = setTimeout(async () => {
      await Sessions.save_session_();
    }, appSession.settings.autosaveInterval);
    return appSession.settings.autosaveIntervalId;
  },
  autosave_off() {
    appSession.settings.autosave = false;
    clearInterval(appSession.settings.autosaveIntervalId);
  },
  set_autosave_interval(value) {
    appSession.settings.autosaveInterval = Math.max(10 * 1e3, value);
    Sessions.autosaveOff();
    Sessions.autosaveOn();
  },
  async get_all_sessions() {
    return await getAllSessions();
  },
  async save_session_(id) {
    let res = await saveSession(id || "lastUsed");
    Logger$1.log("session saved", "success");
    return res;
  },
  async load_session_(id) {
    return await (void 0)(id || "lastUsed");
  },
  async clear_session() {
    return await clearAllSessions();
  }
};
const Root = {
  async create_root_(name) {
    let _name = name || "root";
    let localDB = await create(_name);
    const data = localDB.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    downloadFile(name || "root", blob);
  },
  async access_root() {
    return await appSession.temp.rootHandle.requestPermission();
  },
  async open_network() {
    if (window.showDirectoryPicker) {
      let networkDirhandle = await window.showDirectoryPicker();
      await initNetwork(networkDirhandle);
      saveSession();
    } else {
      this.open_network_DB();
    }
    return appSession.network;
  },
  async open_network_DB() {
    let i2 = document.createElement("input");
    i2.type = "file";
    i2.multiple = false;
    i2.click();
    await new Promise((resolve, reject) => {
      async function onchange(event) {
        let blob = event.target.files[0];
        appSession.network.name = blob.name || "unknown network", appSession.network.DB = await load(blob);
        resolve();
      }
      i2.addEventListener("change", onchange);
    });
    initNetwork(null);
    saveSession();
    return appSession.network;
  },
  async open_root() {
    if (window.showOpenFilePicker) {
      let rootHandle = (await window.showOpenFilePicker({ multiple: false }))[0];
      if (!await rootHandle?.queryPermission() === "granted") {
        await rootHandle?.requestPermission();
      }
      appSession.temp.rootHandle = rootHandle;
      appSession.root.name = rootHandle.name || "root", appSession.root.DB = await load(rootHandle);
    } else {
      await Root.open_root_oldway();
    }
    initRootDB(appSession.rootHandle);
    return appSession.root;
  },
  async update_root() {
    Logger$1.log("saving root, DO NOT LEAVE!");
    let res = await update();
    Logger$1.log("root saved!", "success");
    return res;
  },
  async download_root() {
    const data = await appSession.root.DB.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    return await downloadFile(appSession.root.name, blob);
  },
  async open_root_oldway() {
    let i2 = document.createElement("input");
    i2.type = "file";
    i2.multiple = false;
    i2.click();
    await new Promise((resolve, reject) => {
      async function onchange(event) {
        let rootBlob = event.target.files[0];
        appSession.temp.rootHandle = null;
        appSession.root.name = rootBlob.name || "root", appSession.root.DB = await load(rootBlob);
        resolve();
      }
      i2.addEventListener("change", onchange);
    });
    console.log(`Opened root: ${appSession.root.name}`);
    try {
      let rootName = appSession.root.name;
      Navigate.show_node_(`@${rootName}`);
    } catch {
      Navigate.show_node_(`@root`);
    }
    saveSession();
    return appSession.root;
  },
  backup: {
    async create_backup() {
      let version = DateTime.now().setZone("system");
      let backupFile = createFile(
        appSession.temp.networkDirHandle,
        appSession.root.name + version,
        "backup"
      );
      return await copyFile(appSession.temp.rootHandle, backupFile);
    }
  }
};
const Edit = {
  copy_node: () => {
    appSession.copiedNode = appSession.selectedNode;
    return appSession.copiedNode;
  },
  paste_node: () => {
    appSession.copiedNode.changeParent(appSession.selectedNode);
    return appSession.selectedNode;
  },
  add_linked_node: (key, value) => {
    appSession.selectedNode.addChild(key, value);
    return appSession.selectedNode;
  },
  delete_node: () => {
    return appSession.selectedNode.delete();
  },
  change_order: (change) => {
    appSession.selectedNode.changeOrder(change);
    return appSession.selectedNode;
  },
  link: (queryString) => {
    new Query(queryString);
    return appSession.selectedNode.linkTo(tieID, endIndex, nodeID);
  }
};
const Prune = {
  toggle_open: () => {
    if (appSession.selectedNode.opened) {
      appSession.selectedNode.close();
    } else {
      appSession.selectedNode.open();
    }
    return appSession.selectedNode;
  },
  global_filter: (key) => {
  }
};
const Navigate = {
  //search는 openTree와 동일해서 제외.
  async show_node_(queryString) {
    Logger$1.log(`showing ${queryString}`);
    let res = await parseQuery(queryString);
    console.log("parseQuery res: ", res);
    let nodeView = new NodeView(...res[0]);
    nodeView.plant();
    saveSession();
    return res;
  },
  history: {
    past_adress: () => {
    },
    next_adress: () => {
    }
  }
};
let global$1 = () => document.querySelector("#App");
const Visual = {
  set_size() {
    global$1().style.fontSize = appSession.settings.style.fontSize + "px";
  },
  size_up() {
    appSession.settings.style.fontSize++;
    Visual.set_size();
  },
  size_down() {
    appSession.settings.style.fontSize--;
    Visual.set_size();
  }
};
const Settings2 = {
  async save() {
    return await BrowserDB.settings.put(
      {
        id: "lastUsed",
        data: JSON.stringify(appSession.settings)
      }
    );
  },
  async clear() {
    return await BrowserDB.settings.clear();
  },
  async clear_indexedDB() {
    return await indexedDB.deleteDatabase("Root");
  }
};
const userActions = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Edit,
  Fix,
  Navigate,
  Prune,
  Root,
  Sessions,
  Settings: Settings2,
  Visual
}, Symbol.toStringTag, { value: "Module" }));
function hearCommand(action) {
  refs$1("CommandPalette").focus();
  refs$1("CommandPalette").placeholder = "arguments...";
  let onArgumentsSubmit = async (event) => {
    let actionResult = await action(event.target.value);
    Logger$1.log(`action result: ${actionResult}`);
    refs$1("CommandPalette").placeholder = "";
    refs$1("CommandPalette").removeEventListener("blur", onArgumentsSubmit);
  };
  refs$1("CommandPalette").addEventListener("blur", onArgumentsSubmit);
}
const t = van.tags;
class CommandTree {
  constructor(data, isDefault = true) {
    this.data = data;
    refs$1("Logs").innerHTML = "";
    if (!isDefault) {
      let backToDefault = new CommandButton("...", () => {
        refs$1("Logs").innerHTML = "";
        new CommandTree({ ...userActions });
      });
      refs$1("Logs").append(backToDefault.DOM);
    }
    for (let [key, value] of Object.entries(data)) {
      let seed = new CommandButton(key, value);
      refs$1("Logs").append(seed.DOM);
    }
  }
}
class CommandButton {
  constructor(name, value) {
    this.name = name;
    this.value = value;
    this.backToDefault = this.name === "...";
    let button2 = this.DOM.querySelector("button");
    button2.innerText = this.name.replaceAll("_", " ");
    if (typeof value === "object" && value && this.showChildrenCount) {
      let childrenCount = Object.keys(value).length;
      button2.innerText += `[${childrenCount}] `;
    } else if (this.backToDefault) {
      console.log(this.name);
    } else if (typeof value === "function") {
      button2.classList.add("function");
    }
  }
  showChildrenCount = false;
  opened = false;
  get requireParams() {
    return typeof this.value === "function" && this.name.slice(-1) === "_";
  }
  async tryCatch(name, func) {
    try {
      let actionResult = await this.value();
      Logger$1.log(`action result: ${actionResult}`);
    } catch (err) {
      Logger$1.log(`failed to execute ${name}. error: ${err.stack}`);
    }
  }
  onclick = async () => {
    if (this.backToDefault) {
      this.value();
    } else if (typeof this.value === "function") {
      Logger$1.log(`executing: ${() => {
        this.tryCatch(this.name, this.value);
      }}()`);
      if (this.requireParams) {
        hearCommand(this.value);
      } else {
        this.tryCatch(this.name, this.value);
      }
    } else {
      let childrenDOM = this.DOM.querySelector(".children");
      if (this.opened) {
        childrenDOM.innerHTML = "";
        this.opened = false;
      } else {
        for (let [key, value] of Object.entries(this.value)) {
          let child = new CommandButton(key, value);
          childrenDOM.append(child.DOM);
          this.opened = true;
        }
      }
    }
  };
  DOM = t.div(
    { class: "Command" },
    t.button({
      onclick: this.onclick
    }),
    t.div({ class: "children", style: "margin-left: 2em;" })
  );
}
function errorCatcher() {
  window.onunhandledrejection = (event) => {
    Logger$1.log(`${event.reason.stack}`, "error unhandled");
    console.log(event);
  };
  window.onerror = function(message, source, lineNumber, colno, error) {
    Logger$1.log(`${error.stack}`, "error unhandled");
    console.log(message, source, lineNumber, colno, error);
  };
  window.addEventListener("error", function(errorEvent) {
    Logger$1.log(`${errorEvent.error.stack}`, "error unhandled");
    return false;
  });
}
if ("serviceworker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
window._debug = {
  DOM,
  userActions,
  appSession,
  BrowserDB,
  SessionManager,
  Logger: Logger$1
};
const App = DOM;
const theme = "minimal";
DOM.classList.add(`theme-${theme}`);
van.add(document.body, App);
let actionsOrder = "Root Edit Navigate Prune Visual Sessions Settings Fix".split(" ");
let userActionsSorted = Object.keys(userActions).sort((k2, kk) => {
  return actionsOrder.indexOf(k2) - actionsOrder.indexOf(kk);
}).map((key) => {
  return [key, userActions[key]];
}).reduce((acc, cur) => {
  acc[cur[0]] = cur[1];
  return acc;
}, {});
new CommandTree(userActionsSorted);
errorCatcher();
Logger$1.log("Hi, user.");
init();
document.addEventListener("wheel", (event) => {
  if (!event.altKey)
    return false;
  let targetNodeView = (
    /* appSession.hoveredNode ||  */
    appSession.selectedNode
  );
  if (!targetNodeView)
    return false;
  let navigateSiblings = !event.shiftKey;
  event.preventDefault();
  try {
    if (navigateSiblings) {
      console.log(targetNodeView, targetNodeView.openedFrom);
      let siblings = targetNodeView.openedFrom.linkedNodeViews;
      let thisIndex = siblings.indexOf(targetNodeView);
      if (event.deltaY > 0) {
        siblings[thisIndex + 1].select();
      } else {
        siblings[thisIndex - 1].select();
      }
      return true;
    }
    if (event.deltaY > 0) {
      if (targetNodeView.opened) {
        targetNodeView.linkedNodeViews.at(0).select();
      } else {
        targetNodeView.open();
        targetNodeView.linkedNodeViews.at(0).select();
      }
    } else {
      if (targetNodeView.openedFrom) {
        targetNodeView.openedFrom.select();
      } else {
        targetNodeView.showContext();
      }
    }
  } catch (err) {
  }
}, { passive: false });
document.addEventListener("keydown", (event) => {
  if (!event.key)
    return;
  let key = event.key.toLowerCase();
  if (key === "s" && event.altKey) {
    event.preventDefault();
    Root.update_root();
    Sessions.save_session_();
  }
});
refs$1("ShowAbout").addEventListener("click", () => {
  refs$1("AboutRoot").showModal();
});
refs$1("AboutRoot").addEventListener("click", (event) => {
  if (event.target.nodeName === "DIALOG") {
    event.target.close();
  }
});
