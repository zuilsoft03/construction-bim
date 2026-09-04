// ../node_modules/pdfjs-dist/build/pdf.min.mjs
var t = { d: (e2, i2) => {
  for (var s2 in i2) t.o(i2, s2) && !t.o(e2, s2) && Object.defineProperty(e2, s2, { enumerable: true, get: i2[s2] });
}, o: (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2) };
var __webpack_exports__ = globalThis.pdfjsLib = {};
t.d(__webpack_exports__, { AbortException: () => AbortException, AnnotationEditorLayer: () => AnnotationEditorLayer, AnnotationEditorParamsType: () => m, AnnotationEditorType: () => g, AnnotationEditorUIManager: () => AnnotationEditorUIManager, AnnotationLayer: () => AnnotationLayer, AnnotationMode: () => p, ColorPicker: () => ColorPicker, DOMSVGFactory: () => DOMSVGFactory, DrawLayer: () => DrawLayer, FeatureTest: () => util_FeatureTest, GlobalWorkerOptions: () => GlobalWorkerOptions, ImageKind: () => _, InvalidPDFException: () => InvalidPDFException, MissingPDFException: () => MissingPDFException, OPS: () => X, OutputScale: () => OutputScale, PDFDataRangeTransport: () => PDFDataRangeTransport, PDFDateString: () => PDFDateString, PDFWorker: () => PDFWorker, PasswordResponses: () => K, PermissionFlag: () => f, PixelsPerInch: () => PixelsPerInch, RenderingCancelledException: () => RenderingCancelledException, TextLayer: () => TextLayer, TouchManager: () => TouchManager, UnexpectedResponseException: () => UnexpectedResponseException, Util: () => Util, VerbosityLevel: () => q, XfaLayer: () => XfaLayer, build: () => Nt, createValidAbsoluteUrl: () => createValidAbsoluteUrl, fetchData: () => fetchData, getDocument: () => getDocument, getFilenameFromUrl: () => getFilenameFromUrl, getPdfFilenameFromUrl: () => getPdfFilenameFromUrl, getXfaPageViewport: () => getXfaPageViewport, isDataScheme: () => isDataScheme, isPdfFile: () => isPdfFile, noContextMenu: () => noContextMenu, normalizeUnicode: () => normalizeUnicode, setLayerDimensions: () => setLayerDimensions, shadow: () => shadow, stopEvent: () => stopEvent, version: () => Ot });
var e = !("object" != typeof process || process + "" != "[object process]" || process.versions.nw || process.versions.electron && process.type && "browser" !== process.type);
var i = [1, 0, 0, 1, 0, 0];
var s = [1e-3, 0, 0, 1e-3, 0, 0];
var n = 1.35;
var a = 1;
var r = 2;
var o = 4;
var l = 16;
var h = 32;
var d = 64;
var c = 128;
var u = 256;
var p = { DISABLE: 0, ENABLE: 1, ENABLE_FORMS: 2, ENABLE_STORAGE: 3 };
var g = { DISABLE: -1, NONE: 0, FREETEXT: 3, HIGHLIGHT: 9, STAMP: 13, INK: 15 };
var m = { RESIZE: 1, CREATE: 2, FREETEXT_SIZE: 11, FREETEXT_COLOR: 12, FREETEXT_OPACITY: 13, INK_COLOR: 21, INK_THICKNESS: 22, INK_OPACITY: 23, HIGHLIGHT_COLOR: 31, HIGHLIGHT_DEFAULT_COLOR: 32, HIGHLIGHT_THICKNESS: 33, HIGHLIGHT_FREE: 34, HIGHLIGHT_SHOW_ALL: 35, DRAW_STEP: 41 };
var f = { PRINT: 4, MODIFY_CONTENTS: 8, COPY: 16, MODIFY_ANNOTATIONS: 32, FILL_INTERACTIVE_FORMS: 256, COPY_FOR_ACCESSIBILITY: 512, ASSEMBLE: 1024, PRINT_HIGH_QUALITY: 2048 };
var b = 0;
var A = 1;
var w = 2;
var v = 3;
var y = 3;
var x = 4;
var _ = { GRAYSCALE_1BPP: 1, RGB_24BPP: 2, RGBA_32BPP: 3 };
var E = 1;
var S = 2;
var C = 3;
var T = 4;
var M = 5;
var P = 6;
var D = 7;
var k = 8;
var R = 9;
var I = 10;
var F = 11;
var L = 12;
var O = 13;
var N = 14;
var B = 15;
var H = 16;
var z = 17;
var U = 20;
var G = 1;
var $ = 2;
var V = 3;
var j = 4;
var W = 5;
var q = { ERRORS: 0, WARNINGS: 1, INFOS: 5 };
var X = { dependency: 1, setLineWidth: 2, setLineCap: 3, setLineJoin: 4, setMiterLimit: 5, setDash: 6, setRenderingIntent: 7, setFlatness: 8, setGState: 9, save: 10, restore: 11, transform: 12, moveTo: 13, lineTo: 14, curveTo: 15, curveTo2: 16, curveTo3: 17, closePath: 18, rectangle: 19, stroke: 20, closeStroke: 21, fill: 22, eoFill: 23, fillStroke: 24, eoFillStroke: 25, closeFillStroke: 26, closeEOFillStroke: 27, endPath: 28, clip: 29, eoClip: 30, beginText: 31, endText: 32, setCharSpacing: 33, setWordSpacing: 34, setHScale: 35, setLeading: 36, setFont: 37, setTextRenderingMode: 38, setTextRise: 39, moveText: 40, setLeadingMoveText: 41, setTextMatrix: 42, nextLine: 43, showText: 44, showSpacedText: 45, nextLineShowText: 46, nextLineSetSpacingShowText: 47, setCharWidth: 48, setCharWidthAndBounds: 49, setStrokeColorSpace: 50, setFillColorSpace: 51, setStrokeColor: 52, setStrokeColorN: 53, setFillColor: 54, setFillColorN: 55, setStrokeGray: 56, setFillGray: 57, setStrokeRGBColor: 58, setFillRGBColor: 59, setStrokeCMYKColor: 60, setFillCMYKColor: 61, shadingFill: 62, beginInlineImage: 63, beginImageData: 64, endInlineImage: 65, paintXObject: 66, markPoint: 67, markPointProps: 68, beginMarkedContent: 69, beginMarkedContentProps: 70, endMarkedContent: 71, beginCompat: 72, endCompat: 73, paintFormXObjectBegin: 74, paintFormXObjectEnd: 75, beginGroup: 76, endGroup: 77, beginAnnotation: 80, endAnnotation: 81, paintImageMaskXObject: 83, paintImageMaskXObjectGroup: 84, paintImageXObject: 85, paintInlineImageXObject: 86, paintInlineImageXObjectGroup: 87, paintImageXObjectRepeat: 88, paintImageMaskXObjectRepeat: 89, paintSolidColorImageMask: 90, constructPath: 91, setStrokeTransparent: 92, setFillTransparent: 93 };
var K = { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 };
var Y = q.WARNINGS;
function setVerbosityLevel(t2) {
  Number.isInteger(t2) && (Y = t2);
}
function getVerbosityLevel() {
  return Y;
}
function info(t2) {
  Y >= q.INFOS && console.log(`Info: ${t2}`);
}
function warn(t2) {
  Y >= q.WARNINGS && console.log(`Warning: ${t2}`);
}
function unreachable(t2) {
  throw new Error(t2);
}
function assert(t2, e2) {
  t2 || unreachable(e2);
}
function createValidAbsoluteUrl(t2, e2 = null, i2 = null) {
  if (!t2) return null;
  try {
    if (i2 && "string" == typeof t2) {
      if (i2.addDefaultProtocol && t2.startsWith("www.")) {
        const e3 = t2.match(/\./g);
        e3?.length >= 2 && (t2 = `http://${t2}`);
      }
      if (i2.tryConvertEncoding) try {
        t2 = (function stringToUTF8String(t3) {
          return decodeURIComponent(escape(t3));
        })(t2);
      } catch {
      }
    }
    const s2 = e2 ? new URL(t2, e2) : new URL(t2);
    if ((function _isValidProtocol(t3) {
      switch (t3?.protocol) {
        case "http:":
        case "https:":
        case "ftp:":
        case "mailto:":
        case "tel:":
          return true;
        default:
          return false;
      }
    })(s2)) return s2;
  } catch {
  }
  return null;
}
function shadow(t2, e2, i2, s2 = false) {
  Object.defineProperty(t2, e2, { value: i2, enumerable: !s2, configurable: true, writable: false });
  return i2;
}
var Q = (function BaseExceptionClosure() {
  function BaseException(t2, e2) {
    this.message = t2;
    this.name = e2;
  }
  BaseException.prototype = new Error();
  BaseException.constructor = BaseException;
  return BaseException;
})();
var PasswordException = class extends Q {
  constructor(t2, e2) {
    super(t2, "PasswordException");
    this.code = e2;
  }
};
var UnknownErrorException = class extends Q {
  constructor(t2, e2) {
    super(t2, "UnknownErrorException");
    this.details = e2;
  }
};
var InvalidPDFException = class extends Q {
  constructor(t2) {
    super(t2, "InvalidPDFException");
  }
};
var MissingPDFException = class extends Q {
  constructor(t2) {
    super(t2, "MissingPDFException");
  }
};
var UnexpectedResponseException = class extends Q {
  constructor(t2, e2) {
    super(t2, "UnexpectedResponseException");
    this.status = e2;
  }
};
var FormatError = class extends Q {
  constructor(t2) {
    super(t2, "FormatError");
  }
};
var AbortException = class extends Q {
  constructor(t2) {
    super(t2, "AbortException");
  }
};
function bytesToString(t2) {
  "object" == typeof t2 && void 0 !== t2?.length || unreachable("Invalid argument for bytesToString");
  const e2 = t2.length, i2 = 8192;
  if (e2 < i2) return String.fromCharCode.apply(null, t2);
  const s2 = [];
  for (let n2 = 0; n2 < e2; n2 += i2) {
    const a2 = Math.min(n2 + i2, e2), r2 = t2.subarray(n2, a2);
    s2.push(String.fromCharCode.apply(null, r2));
  }
  return s2.join("");
}
function stringToBytes(t2) {
  "string" != typeof t2 && unreachable("Invalid argument for stringToBytes");
  const e2 = t2.length, i2 = new Uint8Array(e2);
  for (let s2 = 0; s2 < e2; ++s2) i2[s2] = 255 & t2.charCodeAt(s2);
  return i2;
}
function objectFromMap(t2) {
  const e2 = /* @__PURE__ */ Object.create(null);
  for (const [i2, s2] of t2) e2[i2] = s2;
  return e2;
}
var util_FeatureTest = class {
  static get isLittleEndian() {
    return shadow(this, "isLittleEndian", (function isLittleEndian() {
      const t2 = new Uint8Array(4);
      t2[0] = 1;
      return 1 === new Uint32Array(t2.buffer, 0, 1)[0];
    })());
  }
  static get isEvalSupported() {
    return shadow(this, "isEvalSupported", (function isEvalSupported() {
      try {
        new Function("");
        return true;
      } catch {
        return false;
      }
    })());
  }
  static get isOffscreenCanvasSupported() {
    return shadow(this, "isOffscreenCanvasSupported", "undefined" != typeof OffscreenCanvas);
  }
  static get isImageDecoderSupported() {
    return shadow(this, "isImageDecoderSupported", "undefined" != typeof ImageDecoder);
  }
  static get platform() {
    return "undefined" != typeof navigator && "string" == typeof navigator?.platform ? shadow(this, "platform", { isMac: navigator.platform.includes("Mac"), isWindows: navigator.platform.includes("Win"), isFirefox: "string" == typeof navigator?.userAgent && navigator.userAgent.includes("Firefox") }) : shadow(this, "platform", { isMac: false, isWindows: false, isFirefox: false });
  }
  static get isCSSRoundSupported() {
    return shadow(this, "isCSSRoundSupported", globalThis.CSS?.supports?.("width: round(1.5px, 1px)"));
  }
};
var J = Array.from(Array(256).keys(), ((t2) => t2.toString(16).padStart(2, "0")));
var Util = class {
  static makeHexColor(t2, e2, i2) {
    return `#${J[t2]}${J[e2]}${J[i2]}`;
  }
  static scaleMinMax(t2, e2) {
    let i2;
    if (t2[0]) {
      if (t2[0] < 0) {
        i2 = e2[0];
        e2[0] = e2[2];
        e2[2] = i2;
      }
      e2[0] *= t2[0];
      e2[2] *= t2[0];
      if (t2[3] < 0) {
        i2 = e2[1];
        e2[1] = e2[3];
        e2[3] = i2;
      }
      e2[1] *= t2[3];
      e2[3] *= t2[3];
    } else {
      i2 = e2[0];
      e2[0] = e2[1];
      e2[1] = i2;
      i2 = e2[2];
      e2[2] = e2[3];
      e2[3] = i2;
      if (t2[1] < 0) {
        i2 = e2[1];
        e2[1] = e2[3];
        e2[3] = i2;
      }
      e2[1] *= t2[1];
      e2[3] *= t2[1];
      if (t2[2] < 0) {
        i2 = e2[0];
        e2[0] = e2[2];
        e2[2] = i2;
      }
      e2[0] *= t2[2];
      e2[2] *= t2[2];
    }
    e2[0] += t2[4];
    e2[1] += t2[5];
    e2[2] += t2[4];
    e2[3] += t2[5];
  }
  static transform(t2, e2) {
    return [t2[0] * e2[0] + t2[2] * e2[1], t2[1] * e2[0] + t2[3] * e2[1], t2[0] * e2[2] + t2[2] * e2[3], t2[1] * e2[2] + t2[3] * e2[3], t2[0] * e2[4] + t2[2] * e2[5] + t2[4], t2[1] * e2[4] + t2[3] * e2[5] + t2[5]];
  }
  static applyTransform(t2, e2) {
    return [t2[0] * e2[0] + t2[1] * e2[2] + e2[4], t2[0] * e2[1] + t2[1] * e2[3] + e2[5]];
  }
  static applyInverseTransform(t2, e2) {
    const i2 = e2[0] * e2[3] - e2[1] * e2[2];
    return [(t2[0] * e2[3] - t2[1] * e2[2] + e2[2] * e2[5] - e2[4] * e2[3]) / i2, (-t2[0] * e2[1] + t2[1] * e2[0] + e2[4] * e2[1] - e2[5] * e2[0]) / i2];
  }
  static getAxialAlignedBoundingBox(t2, e2) {
    const i2 = this.applyTransform(t2, e2), s2 = this.applyTransform(t2.slice(2, 4), e2), n2 = this.applyTransform([t2[0], t2[3]], e2), a2 = this.applyTransform([t2[2], t2[1]], e2);
    return [Math.min(i2[0], s2[0], n2[0], a2[0]), Math.min(i2[1], s2[1], n2[1], a2[1]), Math.max(i2[0], s2[0], n2[0], a2[0]), Math.max(i2[1], s2[1], n2[1], a2[1])];
  }
  static inverseTransform(t2) {
    const e2 = t2[0] * t2[3] - t2[1] * t2[2];
    return [t2[3] / e2, -t2[1] / e2, -t2[2] / e2, t2[0] / e2, (t2[2] * t2[5] - t2[4] * t2[3]) / e2, (t2[4] * t2[1] - t2[5] * t2[0]) / e2];
  }
  static singularValueDecompose2dScale(t2) {
    const e2 = [t2[0], t2[2], t2[1], t2[3]], i2 = t2[0] * e2[0] + t2[1] * e2[2], s2 = t2[0] * e2[1] + t2[1] * e2[3], n2 = t2[2] * e2[0] + t2[3] * e2[2], a2 = t2[2] * e2[1] + t2[3] * e2[3], r2 = (i2 + a2) / 2, o2 = Math.sqrt((i2 + a2) ** 2 - 4 * (i2 * a2 - n2 * s2)) / 2, l2 = r2 + o2 || 1, h2 = r2 - o2 || 1;
    return [Math.sqrt(l2), Math.sqrt(h2)];
  }
  static normalizeRect(t2) {
    const e2 = t2.slice(0);
    if (t2[0] > t2[2]) {
      e2[0] = t2[2];
      e2[2] = t2[0];
    }
    if (t2[1] > t2[3]) {
      e2[1] = t2[3];
      e2[3] = t2[1];
    }
    return e2;
  }
  static intersect(t2, e2) {
    const i2 = Math.max(Math.min(t2[0], t2[2]), Math.min(e2[0], e2[2])), s2 = Math.min(Math.max(t2[0], t2[2]), Math.max(e2[0], e2[2]));
    if (i2 > s2) return null;
    const n2 = Math.max(Math.min(t2[1], t2[3]), Math.min(e2[1], e2[3])), a2 = Math.min(Math.max(t2[1], t2[3]), Math.max(e2[1], e2[3]));
    return n2 > a2 ? null : [i2, n2, s2, a2];
  }
  static #t(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2) {
    if (l2 <= 0 || l2 >= 1) return;
    const d2 = 1 - l2, c2 = l2 * l2, u2 = c2 * l2, p2 = d2 * (d2 * (d2 * t2 + 3 * l2 * e2) + 3 * c2 * i2) + u2 * s2, g2 = d2 * (d2 * (d2 * n2 + 3 * l2 * a2) + 3 * c2 * r2) + u2 * o2;
    h2[0] = Math.min(h2[0], p2);
    h2[1] = Math.min(h2[1], g2);
    h2[2] = Math.max(h2[2], p2);
    h2[3] = Math.max(h2[3], g2);
  }
  static #e(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2, d2, c2) {
    if (Math.abs(l2) < 1e-12) {
      Math.abs(h2) >= 1e-12 && this.#t(t2, e2, i2, s2, n2, a2, r2, o2, -d2 / h2, c2);
      return;
    }
    const u2 = h2 ** 2 - 4 * d2 * l2;
    if (u2 < 0) return;
    const p2 = Math.sqrt(u2), g2 = 2 * l2;
    this.#t(t2, e2, i2, s2, n2, a2, r2, o2, (-h2 + p2) / g2, c2);
    this.#t(t2, e2, i2, s2, n2, a2, r2, o2, (-h2 - p2) / g2, c2);
  }
  static bezierBoundingBox(t2, e2, i2, s2, n2, a2, r2, o2, l2) {
    if (l2) {
      l2[0] = Math.min(l2[0], t2, r2);
      l2[1] = Math.min(l2[1], e2, o2);
      l2[2] = Math.max(l2[2], t2, r2);
      l2[3] = Math.max(l2[3], e2, o2);
    } else l2 = [Math.min(t2, r2), Math.min(e2, o2), Math.max(t2, r2), Math.max(e2, o2)];
    this.#e(t2, i2, n2, r2, e2, s2, a2, o2, 3 * (3 * (i2 - n2) - t2 + r2), 6 * (t2 - 2 * i2 + n2), 3 * (i2 - t2), l2);
    this.#e(t2, i2, n2, r2, e2, s2, a2, o2, 3 * (3 * (s2 - a2) - e2 + o2), 6 * (e2 - 2 * s2 + a2), 3 * (s2 - e2), l2);
    return l2;
  }
};
var Z = null;
var tt = null;
function normalizeUnicode(t2) {
  if (!Z) {
    Z = /([\u00a0\u00b5\u037e\u0eb3\u2000-\u200a\u202f\u2126\ufb00-\ufb04\ufb06\ufb20-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufba1\ufba4-\ufba9\ufbae-\ufbb1\ufbd3-\ufbdc\ufbde-\ufbe7\ufbea-\ufbf8\ufbfc-\ufbfd\ufc00-\ufc5d\ufc64-\ufcf1\ufcf5-\ufd3d\ufd88\ufdf4\ufdfa-\ufdfb\ufe71\ufe77\ufe79\ufe7b\ufe7d]+)|(\ufb05+)/gu;
    tt = /* @__PURE__ */ new Map([["\uFB05", "\u017Ft"]]);
  }
  return t2.replaceAll(Z, ((t3, e2, i2) => e2 ? e2.normalize("NFKC") : tt.get(i2)));
}
var et = "pdfjs_internal_id_";
"function" != typeof Promise.try && (Promise.try = function(t2, ...e2) {
  return new Promise(((i2) => {
    i2(t2(...e2));
  }));
});
var it = "http://www.w3.org/2000/svg";
var PixelsPerInch = class {
  static CSS = 96;
  static PDF = 72;
  static PDF_TO_CSS_UNITS = this.CSS / this.PDF;
};
async function fetchData(t2, e2 = "text") {
  if (isValidFetchUrl(t2, document.baseURI)) {
    const i2 = await fetch(t2);
    if (!i2.ok) throw new Error(i2.statusText);
    switch (e2) {
      case "arraybuffer":
        return i2.arrayBuffer();
      case "blob":
        return i2.blob();
      case "json":
        return i2.json();
    }
    return i2.text();
  }
  return new Promise(((i2, s2) => {
    const n2 = new XMLHttpRequest();
    n2.open("GET", t2, true);
    n2.responseType = e2;
    n2.onreadystatechange = () => {
      if (n2.readyState === XMLHttpRequest.DONE) if (200 !== n2.status && 0 !== n2.status) s2(new Error(n2.statusText));
      else {
        switch (e2) {
          case "arraybuffer":
          case "blob":
          case "json":
            i2(n2.response);
            return;
        }
        i2(n2.responseText);
      }
    };
    n2.send(null);
  }));
}
var PageViewport = class _PageViewport {
  constructor({ viewBox: t2, userUnit: e2, scale: i2, rotation: s2, offsetX: n2 = 0, offsetY: a2 = 0, dontFlip: r2 = false }) {
    this.viewBox = t2;
    this.userUnit = e2;
    this.scale = i2;
    this.rotation = s2;
    this.offsetX = n2;
    this.offsetY = a2;
    i2 *= e2;
    const o2 = (t2[2] + t2[0]) / 2, l2 = (t2[3] + t2[1]) / 2;
    let h2, d2, c2, u2, p2, g2, m2, f2;
    (s2 %= 360) < 0 && (s2 += 360);
    switch (s2) {
      case 180:
        h2 = -1;
        d2 = 0;
        c2 = 0;
        u2 = 1;
        break;
      case 90:
        h2 = 0;
        d2 = 1;
        c2 = 1;
        u2 = 0;
        break;
      case 270:
        h2 = 0;
        d2 = -1;
        c2 = -1;
        u2 = 0;
        break;
      case 0:
        h2 = 1;
        d2 = 0;
        c2 = 0;
        u2 = -1;
        break;
      default:
        throw new Error("PageViewport: Invalid rotation, must be a multiple of 90 degrees.");
    }
    if (r2) {
      c2 = -c2;
      u2 = -u2;
    }
    if (0 === h2) {
      p2 = Math.abs(l2 - t2[1]) * i2 + n2;
      g2 = Math.abs(o2 - t2[0]) * i2 + a2;
      m2 = (t2[3] - t2[1]) * i2;
      f2 = (t2[2] - t2[0]) * i2;
    } else {
      p2 = Math.abs(o2 - t2[0]) * i2 + n2;
      g2 = Math.abs(l2 - t2[1]) * i2 + a2;
      m2 = (t2[2] - t2[0]) * i2;
      f2 = (t2[3] - t2[1]) * i2;
    }
    this.transform = [h2 * i2, d2 * i2, c2 * i2, u2 * i2, p2 - h2 * i2 * o2 - c2 * i2 * l2, g2 - d2 * i2 * o2 - u2 * i2 * l2];
    this.width = m2;
    this.height = f2;
  }
  get rawDims() {
    const { userUnit: t2, viewBox: e2 } = this, i2 = e2.map(((e3) => e3 * t2));
    return shadow(this, "rawDims", { pageWidth: i2[2] - i2[0], pageHeight: i2[3] - i2[1], pageX: i2[0], pageY: i2[1] });
  }
  clone({ scale: t2 = this.scale, rotation: e2 = this.rotation, offsetX: i2 = this.offsetX, offsetY: s2 = this.offsetY, dontFlip: n2 = false } = {}) {
    return new _PageViewport({ viewBox: this.viewBox.slice(), userUnit: this.userUnit, scale: t2, rotation: e2, offsetX: i2, offsetY: s2, dontFlip: n2 });
  }
  convertToViewportPoint(t2, e2) {
    return Util.applyTransform([t2, e2], this.transform);
  }
  convertToViewportRectangle(t2) {
    const e2 = Util.applyTransform([t2[0], t2[1]], this.transform), i2 = Util.applyTransform([t2[2], t2[3]], this.transform);
    return [e2[0], e2[1], i2[0], i2[1]];
  }
  convertToPdfPoint(t2, e2) {
    return Util.applyInverseTransform([t2, e2], this.transform);
  }
};
var RenderingCancelledException = class extends Q {
  constructor(t2, e2 = 0) {
    super(t2, "RenderingCancelledException");
    this.extraDelay = e2;
  }
};
function isDataScheme(t2) {
  const e2 = t2.length;
  let i2 = 0;
  for (; i2 < e2 && "" === t2[i2].trim(); ) i2++;
  return "data:" === t2.substring(i2, i2 + 5).toLowerCase();
}
function isPdfFile(t2) {
  return "string" == typeof t2 && /\.pdf$/i.test(t2);
}
function getFilenameFromUrl(t2) {
  [t2] = t2.split(/[#?]/, 1);
  return t2.substring(t2.lastIndexOf("/") + 1);
}
function getPdfFilenameFromUrl(t2, e2 = "document.pdf") {
  if ("string" != typeof t2) return e2;
  if (isDataScheme(t2)) {
    warn('getPdfFilenameFromUrl: ignore "data:"-URL for performance reasons.');
    return e2;
  }
  const i2 = /[^/?#=]+\.pdf\b(?!.*\.pdf\b)/i, s2 = /^(?:(?:[^:]+:)?\/\/[^/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/.exec(t2);
  let n2 = i2.exec(s2[1]) || i2.exec(s2[2]) || i2.exec(s2[3]);
  if (n2) {
    n2 = n2[0];
    if (n2.includes("%")) try {
      n2 = i2.exec(decodeURIComponent(n2))[0];
    } catch {
    }
  }
  return n2 || e2;
}
var StatTimer = class {
  started = /* @__PURE__ */ Object.create(null);
  times = [];
  time(t2) {
    t2 in this.started && warn(`Timer is already running for ${t2}`);
    this.started[t2] = Date.now();
  }
  timeEnd(t2) {
    t2 in this.started || warn(`Timer has not been started for ${t2}`);
    this.times.push({ name: t2, start: this.started[t2], end: Date.now() });
    delete this.started[t2];
  }
  toString() {
    const t2 = [];
    let e2 = 0;
    for (const { name: t3 } of this.times) e2 = Math.max(t3.length, e2);
    for (const { name: i2, start: s2, end: n2 } of this.times) t2.push(`${i2.padEnd(e2)} ${n2 - s2}ms
`);
    return t2.join("");
  }
};
function isValidFetchUrl(t2, e2) {
  try {
    const { protocol: i2 } = e2 ? new URL(t2, e2) : new URL(t2);
    return "http:" === i2 || "https:" === i2;
  } catch {
    return false;
  }
}
function noContextMenu(t2) {
  t2.preventDefault();
}
function stopEvent(t2) {
  t2.preventDefault();
  t2.stopPropagation();
}
var PDFDateString = class {
  static #i;
  static toDateObject(t2) {
    if (!t2 || "string" != typeof t2) return null;
    this.#i ||= new RegExp("^D:(\\d{4})(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?([Z|+|-])?(\\d{2})?'?(\\d{2})?'?");
    const e2 = this.#i.exec(t2);
    if (!e2) return null;
    const i2 = parseInt(e2[1], 10);
    let s2 = parseInt(e2[2], 10);
    s2 = s2 >= 1 && s2 <= 12 ? s2 - 1 : 0;
    let n2 = parseInt(e2[3], 10);
    n2 = n2 >= 1 && n2 <= 31 ? n2 : 1;
    let a2 = parseInt(e2[4], 10);
    a2 = a2 >= 0 && a2 <= 23 ? a2 : 0;
    let r2 = parseInt(e2[5], 10);
    r2 = r2 >= 0 && r2 <= 59 ? r2 : 0;
    let o2 = parseInt(e2[6], 10);
    o2 = o2 >= 0 && o2 <= 59 ? o2 : 0;
    const l2 = e2[7] || "Z";
    let h2 = parseInt(e2[8], 10);
    h2 = h2 >= 0 && h2 <= 23 ? h2 : 0;
    let d2 = parseInt(e2[9], 10) || 0;
    d2 = d2 >= 0 && d2 <= 59 ? d2 : 0;
    if ("-" === l2) {
      a2 += h2;
      r2 += d2;
    } else if ("+" === l2) {
      a2 -= h2;
      r2 -= d2;
    }
    return new Date(Date.UTC(i2, s2, n2, a2, r2, o2));
  }
};
function getXfaPageViewport(t2, { scale: e2 = 1, rotation: i2 = 0 }) {
  const { width: s2, height: n2 } = t2.attributes.style, a2 = [0, 0, parseInt(s2), parseInt(n2)];
  return new PageViewport({ viewBox: a2, userUnit: 1, scale: e2, rotation: i2 });
}
function getRGB(t2) {
  if (t2.startsWith("#")) {
    const e2 = parseInt(t2.slice(1), 16);
    return [(16711680 & e2) >> 16, (65280 & e2) >> 8, 255 & e2];
  }
  if (t2.startsWith("rgb(")) return t2.slice(4, -1).split(",").map(((t3) => parseInt(t3)));
  if (t2.startsWith("rgba(")) return t2.slice(5, -1).split(",").map(((t3) => parseInt(t3))).slice(0, 3);
  warn(`Not a valid color format: "${t2}"`);
  return [0, 0, 0];
}
function getCurrentTransform(t2) {
  const { a: e2, b: i2, c: s2, d: n2, e: a2, f: r2 } = t2.getTransform();
  return [e2, i2, s2, n2, a2, r2];
}
function getCurrentTransformInverse(t2) {
  const { a: e2, b: i2, c: s2, d: n2, e: a2, f: r2 } = t2.getTransform().invertSelf();
  return [e2, i2, s2, n2, a2, r2];
}
function setLayerDimensions(t2, e2, i2 = false, s2 = true) {
  if (e2 instanceof PageViewport) {
    const { pageWidth: s3, pageHeight: n2 } = e2.rawDims, { style: a2 } = t2, r2 = util_FeatureTest.isCSSRoundSupported, o2 = `var(--scale-factor) * ${s3}px`, l2 = `var(--scale-factor) * ${n2}px`, h2 = r2 ? `round(down, ${o2}, var(--scale-round-x, 1px))` : `calc(${o2})`, d2 = r2 ? `round(down, ${l2}, var(--scale-round-y, 1px))` : `calc(${l2})`;
    if (i2 && e2.rotation % 180 != 0) {
      a2.width = d2;
      a2.height = h2;
    } else {
      a2.width = h2;
      a2.height = d2;
    }
  }
  s2 && t2.setAttribute("data-main-rotation", e2.rotation);
}
var OutputScale = class {
  constructor() {
    const t2 = window.devicePixelRatio || 1;
    this.sx = t2;
    this.sy = t2;
  }
  get scaled() {
    return 1 !== this.sx || 1 !== this.sy;
  }
  get symmetric() {
    return this.sx === this.sy;
  }
};
var EditorToolbar = class _EditorToolbar {
  #s = null;
  #n = null;
  #a;
  #r = null;
  #o = null;
  static #l = null;
  constructor(t2) {
    this.#a = t2;
    _EditorToolbar.#l ||= Object.freeze({ freetext: "pdfjs-editor-remove-freetext-button", highlight: "pdfjs-editor-remove-highlight-button", ink: "pdfjs-editor-remove-ink-button", stamp: "pdfjs-editor-remove-stamp-button" });
  }
  render() {
    const t2 = this.#s = document.createElement("div");
    t2.classList.add("editToolbar", "hidden");
    t2.setAttribute("role", "toolbar");
    const e2 = this.#a._uiManager._signal;
    t2.addEventListener("contextmenu", noContextMenu, { signal: e2 });
    t2.addEventListener("pointerdown", _EditorToolbar.#h, { signal: e2 });
    const i2 = this.#r = document.createElement("div");
    i2.className = "buttons";
    t2.append(i2);
    const s2 = this.#a.toolbarPosition;
    if (s2) {
      const { style: e3 } = t2, i3 = "ltr" === this.#a._uiManager.direction ? 1 - s2[0] : s2[0];
      e3.insetInlineEnd = 100 * i3 + "%";
      e3.top = `calc(${100 * s2[1]}% + var(--editor-toolbar-vert-offset))`;
    }
    this.#d();
    return t2;
  }
  get div() {
    return this.#s;
  }
  static #h(t2) {
    t2.stopPropagation();
  }
  #c(t2) {
    this.#a._focusEventsAllowed = false;
    stopEvent(t2);
  }
  #u(t2) {
    this.#a._focusEventsAllowed = true;
    stopEvent(t2);
  }
  #p(t2) {
    const e2 = this.#a._uiManager._signal;
    t2.addEventListener("focusin", this.#c.bind(this), { capture: true, signal: e2 });
    t2.addEventListener("focusout", this.#u.bind(this), { capture: true, signal: e2 });
    t2.addEventListener("contextmenu", noContextMenu, { signal: e2 });
  }
  hide() {
    this.#s.classList.add("hidden");
    this.#n?.hideDropdown();
  }
  show() {
    this.#s.classList.remove("hidden");
    this.#o?.shown();
  }
  #d() {
    const { editorType: t2, _uiManager: e2 } = this.#a, i2 = document.createElement("button");
    i2.className = "delete";
    i2.tabIndex = 0;
    i2.setAttribute("data-l10n-id", _EditorToolbar.#l[t2]);
    this.#p(i2);
    i2.addEventListener("click", ((t3) => {
      e2.delete();
    }), { signal: e2._signal });
    this.#r.append(i2);
  }
  get #g() {
    const t2 = document.createElement("div");
    t2.className = "divider";
    return t2;
  }
  async addAltText(t2) {
    const e2 = await t2.render();
    this.#p(e2);
    this.#r.prepend(e2, this.#g);
    this.#o = t2;
  }
  addColorPicker(t2) {
    this.#n = t2;
    const e2 = t2.renderButton();
    this.#p(e2);
    this.#r.prepend(e2, this.#g);
  }
  remove() {
    this.#s.remove();
    this.#n?.destroy();
    this.#n = null;
  }
};
var HighlightToolbar = class {
  #r = null;
  #s = null;
  #m;
  constructor(t2) {
    this.#m = t2;
  }
  #f() {
    const t2 = this.#s = document.createElement("div");
    t2.className = "editToolbar";
    t2.setAttribute("role", "toolbar");
    t2.addEventListener("contextmenu", noContextMenu, { signal: this.#m._signal });
    const e2 = this.#r = document.createElement("div");
    e2.className = "buttons";
    t2.append(e2);
    this.#b();
    return t2;
  }
  #A(t2, e2) {
    let i2 = 0, s2 = 0;
    for (const n2 of t2) {
      const t3 = n2.y + n2.height;
      if (t3 < i2) continue;
      const a2 = n2.x + (e2 ? n2.width : 0);
      if (t3 > i2) {
        s2 = a2;
        i2 = t3;
      } else e2 ? a2 > s2 && (s2 = a2) : a2 < s2 && (s2 = a2);
    }
    return [e2 ? 1 - s2 : s2, i2];
  }
  show(t2, e2, i2) {
    const [s2, n2] = this.#A(e2, i2), { style: a2 } = this.#s ||= this.#f();
    t2.append(this.#s);
    a2.insetInlineEnd = 100 * s2 + "%";
    a2.top = `calc(${100 * n2}% + var(--editor-toolbar-vert-offset))`;
  }
  hide() {
    this.#s.remove();
  }
  #b() {
    const t2 = document.createElement("button");
    t2.className = "highlightButton";
    t2.tabIndex = 0;
    t2.setAttribute("data-l10n-id", "pdfjs-highlight-floating-button1");
    const e2 = document.createElement("span");
    t2.append(e2);
    e2.className = "visuallyHidden";
    e2.setAttribute("data-l10n-id", "pdfjs-highlight-floating-button-label");
    const i2 = this.#m._signal;
    t2.addEventListener("contextmenu", noContextMenu, { signal: i2 });
    t2.addEventListener("click", (() => {
      this.#m.highlightSelection("floating_button");
    }), { signal: i2 });
    this.#r.append(t2);
  }
};
function bindEvents(t2, e2, i2) {
  for (const s2 of i2) e2.addEventListener(s2, t2[s2].bind(t2));
}
var IdManager = class {
  #w = 0;
  get id() {
    return "pdfjs_internal_editor_" + this.#w++;
  }
};
var ImageManager = class _ImageManager {
  #v = (function getUuid() {
    if ("function" == typeof crypto.randomUUID) return crypto.randomUUID();
    const t2 = new Uint8Array(32);
    crypto.getRandomValues(t2);
    return bytesToString(t2);
  })();
  #w = 0;
  #y = null;
  static get _isSVGFittingCanvas() {
    const t2 = new OffscreenCanvas(1, 3).getContext("2d", { willReadFrequently: true }), e2 = new Image();
    e2.src = 'data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1 1" width="1" height="1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" style="fill:red;"/></svg>';
    return shadow(this, "_isSVGFittingCanvas", e2.decode().then((() => {
      t2.drawImage(e2, 0, 0, 1, 1, 0, 0, 1, 3);
      return 0 === new Uint32Array(t2.getImageData(0, 0, 1, 1).data.buffer)[0];
    })));
  }
  async #x(t2, e2) {
    this.#y ||= /* @__PURE__ */ new Map();
    let i2 = this.#y.get(t2);
    if (null === i2) return null;
    if (i2?.bitmap) {
      i2.refCounter += 1;
      return i2;
    }
    try {
      i2 ||= { bitmap: null, id: `image_${this.#v}_${this.#w++}`, refCounter: 0, isSvg: false };
      let t3;
      if ("string" == typeof e2) {
        i2.url = e2;
        t3 = await fetchData(e2, "blob");
      } else e2 instanceof File ? t3 = i2.file = e2 : e2 instanceof Blob && (t3 = e2);
      if ("image/svg+xml" === t3.type) {
        const e3 = _ImageManager._isSVGFittingCanvas, s2 = new FileReader(), n2 = new Image(), a2 = new Promise(((t4, a3) => {
          n2.onload = () => {
            i2.bitmap = n2;
            i2.isSvg = true;
            t4();
          };
          s2.onload = async () => {
            const t5 = i2.svgUrl = s2.result;
            n2.src = await e3 ? `${t5}#svgView(preserveAspectRatio(none))` : t5;
          };
          n2.onerror = s2.onerror = a3;
        }));
        s2.readAsDataURL(t3);
        await a2;
      } else i2.bitmap = await createImageBitmap(t3);
      i2.refCounter = 1;
    } catch (t3) {
      warn(t3);
      i2 = null;
    }
    this.#y.set(t2, i2);
    i2 && this.#y.set(i2.id, i2);
    return i2;
  }
  async getFromFile(t2) {
    const { lastModified: e2, name: i2, size: s2, type: n2 } = t2;
    return this.#x(`${e2}_${i2}_${s2}_${n2}`, t2);
  }
  async getFromUrl(t2) {
    return this.#x(t2, t2);
  }
  async getFromBlob(t2, e2) {
    const i2 = await e2;
    return this.#x(t2, i2);
  }
  async getFromId(t2) {
    this.#y ||= /* @__PURE__ */ new Map();
    const e2 = this.#y.get(t2);
    if (!e2) return null;
    if (e2.bitmap) {
      e2.refCounter += 1;
      return e2;
    }
    if (e2.file) return this.getFromFile(e2.file);
    if (e2.blobPromise) {
      const { blobPromise: t3 } = e2;
      delete e2.blobPromise;
      return this.getFromBlob(e2.id, t3);
    }
    return this.getFromUrl(e2.url);
  }
  getFromCanvas(t2, e2) {
    this.#y ||= /* @__PURE__ */ new Map();
    let i2 = this.#y.get(t2);
    if (i2?.bitmap) {
      i2.refCounter += 1;
      return i2;
    }
    const s2 = new OffscreenCanvas(e2.width, e2.height);
    s2.getContext("2d").drawImage(e2, 0, 0);
    i2 = { bitmap: s2.transferToImageBitmap(), id: `image_${this.#v}_${this.#w++}`, refCounter: 1, isSvg: false };
    this.#y.set(t2, i2);
    this.#y.set(i2.id, i2);
    return i2;
  }
  getSvgUrl(t2) {
    const e2 = this.#y.get(t2);
    return e2?.isSvg ? e2.svgUrl : null;
  }
  deleteId(t2) {
    this.#y ||= /* @__PURE__ */ new Map();
    const e2 = this.#y.get(t2);
    if (!e2) return;
    e2.refCounter -= 1;
    if (0 !== e2.refCounter) return;
    const { bitmap: i2 } = e2;
    if (!e2.url && !e2.file) {
      const t3 = new OffscreenCanvas(i2.width, i2.height);
      t3.getContext("bitmaprenderer").transferFromImageBitmap(i2);
      e2.blobPromise = t3.convertToBlob();
    }
    i2.close?.();
    e2.bitmap = null;
  }
  isValidId(t2) {
    return t2.startsWith(`image_${this.#v}_`);
  }
};
var CommandManager = class {
  #_ = [];
  #E = false;
  #S;
  #C = -1;
  constructor(t2 = 128) {
    this.#S = t2;
  }
  add({ cmd: t2, undo: e2, post: i2, mustExec: s2, type: n2 = NaN, overwriteIfSameType: a2 = false, keepUndo: r2 = false }) {
    s2 && t2();
    if (this.#E) return;
    const o2 = { cmd: t2, undo: e2, post: i2, type: n2 };
    if (-1 === this.#C) {
      this.#_.length > 0 && (this.#_.length = 0);
      this.#C = 0;
      this.#_.push(o2);
      return;
    }
    if (a2 && this.#_[this.#C].type === n2) {
      r2 && (o2.undo = this.#_[this.#C].undo);
      this.#_[this.#C] = o2;
      return;
    }
    const l2 = this.#C + 1;
    if (l2 === this.#S) this.#_.splice(0, 1);
    else {
      this.#C = l2;
      l2 < this.#_.length && this.#_.splice(l2);
    }
    this.#_.push(o2);
  }
  undo() {
    if (-1 === this.#C) return;
    this.#E = true;
    const { undo: t2, post: e2 } = this.#_[this.#C];
    t2();
    e2?.();
    this.#E = false;
    this.#C -= 1;
  }
  redo() {
    if (this.#C < this.#_.length - 1) {
      this.#C += 1;
      this.#E = true;
      const { cmd: t2, post: e2 } = this.#_[this.#C];
      t2();
      e2?.();
      this.#E = false;
    }
  }
  hasSomethingToUndo() {
    return -1 !== this.#C;
  }
  hasSomethingToRedo() {
    return this.#C < this.#_.length - 1;
  }
  cleanType(t2) {
    if (-1 !== this.#C) {
      for (let e2 = this.#C; e2 >= 0; e2--) if (this.#_[e2].type !== t2) {
        this.#_.splice(e2 + 1, this.#C - e2);
        this.#C = e2;
        return;
      }
      this.#_.length = 0;
      this.#C = -1;
    }
  }
  destroy() {
    this.#_ = null;
  }
};
var KeyboardManager = class {
  constructor(t2) {
    this.buffer = [];
    this.callbacks = /* @__PURE__ */ new Map();
    this.allKeys = /* @__PURE__ */ new Set();
    const { isMac: e2 } = util_FeatureTest.platform;
    for (const [i2, s2, n2 = {}] of t2) for (const t3 of i2) {
      const i3 = t3.startsWith("mac+");
      if (e2 && i3) {
        this.callbacks.set(t3.slice(4), { callback: s2, options: n2 });
        this.allKeys.add(t3.split("+").at(-1));
      } else if (!e2 && !i3) {
        this.callbacks.set(t3, { callback: s2, options: n2 });
        this.allKeys.add(t3.split("+").at(-1));
      }
    }
  }
  #T(t2) {
    t2.altKey && this.buffer.push("alt");
    t2.ctrlKey && this.buffer.push("ctrl");
    t2.metaKey && this.buffer.push("meta");
    t2.shiftKey && this.buffer.push("shift");
    this.buffer.push(t2.key);
    const e2 = this.buffer.join("+");
    this.buffer.length = 0;
    return e2;
  }
  exec(t2, e2) {
    if (!this.allKeys.has(e2.key)) return;
    const i2 = this.callbacks.get(this.#T(e2));
    if (!i2) return;
    const { callback: s2, options: { bubbles: n2 = false, args: a2 = [], checker: r2 = null } } = i2;
    if (!r2 || r2(t2, e2)) {
      s2.bind(t2, ...a2, e2)();
      n2 || stopEvent(e2);
    }
  }
};
var ColorManager = class _ColorManager {
  static _colorsMapping = /* @__PURE__ */ new Map([["CanvasText", [0, 0, 0]], ["Canvas", [255, 255, 255]]]);
  get _colors() {
    const t2 = /* @__PURE__ */ new Map([["CanvasText", null], ["Canvas", null]]);
    !(function getColorValues(t3) {
      const e2 = document.createElement("span");
      e2.style.visibility = "hidden";
      document.body.append(e2);
      for (const i2 of t3.keys()) {
        e2.style.color = i2;
        const s2 = window.getComputedStyle(e2).color;
        t3.set(i2, getRGB(s2));
      }
      e2.remove();
    })(t2);
    return shadow(this, "_colors", t2);
  }
  convert(t2) {
    const e2 = getRGB(t2);
    if (!window.matchMedia("(forced-colors: active)").matches) return e2;
    for (const [t3, i2] of this._colors) if (i2.every(((t4, i3) => t4 === e2[i3]))) return _ColorManager._colorsMapping.get(t3);
    return e2;
  }
  getHexCode(t2) {
    const e2 = this._colors.get(t2);
    return e2 ? Util.makeHexColor(...e2) : t2;
  }
};
var AnnotationEditorUIManager = class _AnnotationEditorUIManager {
  #M = new AbortController();
  #P = null;
  #D = /* @__PURE__ */ new Map();
  #k = /* @__PURE__ */ new Map();
  #R = null;
  #I = null;
  #F = null;
  #L = new CommandManager();
  #O = null;
  #N = null;
  #B = 0;
  #H = /* @__PURE__ */ new Set();
  #z = null;
  #U = null;
  #G = /* @__PURE__ */ new Set();
  _editorUndoBar = null;
  #$ = false;
  #V = false;
  #j = false;
  #W = null;
  #q = null;
  #X = null;
  #K = null;
  #Y = false;
  #Q = null;
  #J = new IdManager();
  #Z = false;
  #tt = false;
  #et = null;
  #it = null;
  #st = null;
  #nt = null;
  #at = g.NONE;
  #rt = /* @__PURE__ */ new Set();
  #ot = null;
  #lt = null;
  #ht = null;
  #dt = { isEditing: false, isEmpty: true, hasSomethingToUndo: false, hasSomethingToRedo: false, hasSelectedEditor: false, hasSelectedText: false };
  #ct = [0, 0];
  #ut = null;
  #pt = null;
  #gt = null;
  #mt = null;
  static TRANSLATE_SMALL = 1;
  static TRANSLATE_BIG = 10;
  static get _keyboardManager() {
    const t2 = _AnnotationEditorUIManager.prototype, arrowChecker = (t3) => t3.#pt.contains(document.activeElement) && "BUTTON" !== document.activeElement.tagName && t3.hasSomethingToControl(), textInputChecker = (t3, { target: e3 }) => {
      if (e3 instanceof HTMLInputElement) {
        const { type: t4 } = e3;
        return "text" !== t4 && "number" !== t4;
      }
      return true;
    }, e2 = this.TRANSLATE_SMALL, i2 = this.TRANSLATE_BIG;
    return shadow(this, "_keyboardManager", new KeyboardManager([[["ctrl+a", "mac+meta+a"], t2.selectAll, { checker: textInputChecker }], [["ctrl+z", "mac+meta+z"], t2.undo, { checker: textInputChecker }], [["ctrl+y", "ctrl+shift+z", "mac+meta+shift+z", "ctrl+shift+Z", "mac+meta+shift+Z"], t2.redo, { checker: textInputChecker }], [["Backspace", "alt+Backspace", "ctrl+Backspace", "shift+Backspace", "mac+Backspace", "mac+alt+Backspace", "mac+ctrl+Backspace", "Delete", "ctrl+Delete", "shift+Delete", "mac+Delete"], t2.delete, { checker: textInputChecker }], [["Enter", "mac+Enter"], t2.addNewEditorFromKeyboard, { checker: (t3, { target: e3 }) => !(e3 instanceof HTMLButtonElement) && t3.#pt.contains(e3) && !t3.isEnterHandled }], [[" ", "mac+ "], t2.addNewEditorFromKeyboard, { checker: (t3, { target: e3 }) => !(e3 instanceof HTMLButtonElement) && t3.#pt.contains(document.activeElement) }], [["Escape", "mac+Escape"], t2.unselectAll], [["ArrowLeft", "mac+ArrowLeft"], t2.translateSelectedEditors, { args: [-e2, 0], checker: arrowChecker }], [["ctrl+ArrowLeft", "mac+shift+ArrowLeft"], t2.translateSelectedEditors, { args: [-i2, 0], checker: arrowChecker }], [["ArrowRight", "mac+ArrowRight"], t2.translateSelectedEditors, { args: [e2, 0], checker: arrowChecker }], [["ctrl+ArrowRight", "mac+shift+ArrowRight"], t2.translateSelectedEditors, { args: [i2, 0], checker: arrowChecker }], [["ArrowUp", "mac+ArrowUp"], t2.translateSelectedEditors, { args: [0, -e2], checker: arrowChecker }], [["ctrl+ArrowUp", "mac+shift+ArrowUp"], t2.translateSelectedEditors, { args: [0, -i2], checker: arrowChecker }], [["ArrowDown", "mac+ArrowDown"], t2.translateSelectedEditors, { args: [0, e2], checker: arrowChecker }], [["ctrl+ArrowDown", "mac+shift+ArrowDown"], t2.translateSelectedEditors, { args: [0, i2], checker: arrowChecker }]]));
  }
  constructor(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2, d2, c2, u2) {
    const p2 = this._signal = this.#M.signal;
    this.#pt = t2;
    this.#gt = e2;
    this.#R = i2;
    this._eventBus = s2;
    s2._on("editingaction", this.onEditingAction.bind(this), { signal: p2 });
    s2._on("pagechanging", this.onPageChanging.bind(this), { signal: p2 });
    s2._on("scalechanging", this.onScaleChanging.bind(this), { signal: p2 });
    s2._on("rotationchanging", this.onRotationChanging.bind(this), { signal: p2 });
    s2._on("setpreference", this.onSetPreference.bind(this), { signal: p2 });
    s2._on("switchannotationeditorparams", ((t3) => this.updateParams(t3.type, t3.value)), { signal: p2 });
    this.#ft();
    this.#bt();
    this.#At();
    this.#I = n2.annotationStorage;
    this.#W = n2.filterFactory;
    this.#lt = a2;
    this.#K = r2 || null;
    this.#$ = o2;
    this.#V = l2;
    this.#j = h2;
    this.#nt = d2 || null;
    this.viewParameters = { realScale: PixelsPerInch.PDF_TO_CSS_UNITS, rotation: 0 };
    this.isShiftKeyDown = false;
    this._editorUndoBar = c2 || null;
    this._supportsPinchToZoom = false !== u2;
  }
  destroy() {
    this.#mt?.resolve();
    this.#mt = null;
    this.#M?.abort();
    this.#M = null;
    this._signal = null;
    for (const t2 of this.#k.values()) t2.destroy();
    this.#k.clear();
    this.#D.clear();
    this.#G.clear();
    this.#P = null;
    this.#rt.clear();
    this.#L.destroy();
    this.#R?.destroy();
    this.#Q?.hide();
    this.#Q = null;
    if (this.#q) {
      clearTimeout(this.#q);
      this.#q = null;
    }
    if (this.#ut) {
      clearTimeout(this.#ut);
      this.#ut = null;
    }
    this._editorUndoBar?.destroy();
  }
  combinedSignal(t2) {
    return AbortSignal.any([this._signal, t2.signal]);
  }
  get mlManager() {
    return this.#nt;
  }
  get useNewAltTextFlow() {
    return this.#V;
  }
  get useNewAltTextWhenAddingImage() {
    return this.#j;
  }
  get hcmFilter() {
    return shadow(this, "hcmFilter", this.#lt ? this.#W.addHCMFilter(this.#lt.foreground, this.#lt.background) : "none");
  }
  get direction() {
    return shadow(this, "direction", getComputedStyle(this.#pt).direction);
  }
  get highlightColors() {
    return shadow(this, "highlightColors", this.#K ? new Map(this.#K.split(",").map(((t2) => t2.split("=").map(((t3) => t3.trim()))))) : null);
  }
  get highlightColorNames() {
    return shadow(this, "highlightColorNames", this.highlightColors ? new Map(Array.from(this.highlightColors, ((t2) => t2.reverse()))) : null);
  }
  setCurrentDrawingSession(t2) {
    if (t2) {
      this.unselectAll();
      this.disableUserSelect(true);
    } else this.disableUserSelect(false);
    this.#N = t2;
  }
  setMainHighlightColorPicker(t2) {
    this.#st = t2;
  }
  editAltText(t2, e2 = false) {
    this.#R?.editAltText(this, t2, e2);
  }
  switchToMode(t2, e2) {
    this._eventBus.on("annotationeditormodechanged", e2, { once: true, signal: this._signal });
    this._eventBus.dispatch("showannotationeditorui", { source: this, mode: t2 });
  }
  setPreference(t2, e2) {
    this._eventBus.dispatch("setpreference", { source: this, name: t2, value: e2 });
  }
  onSetPreference({ name: t2, value: e2 }) {
    if ("enableNewAltTextWhenAddingImage" === t2) this.#j = e2;
  }
  onPageChanging({ pageNumber: t2 }) {
    this.#B = t2 - 1;
  }
  focusMainContainer() {
    this.#pt.focus();
  }
  findParent(t2, e2) {
    for (const i2 of this.#k.values()) {
      const { x: s2, y: n2, width: a2, height: r2 } = i2.div.getBoundingClientRect();
      if (t2 >= s2 && t2 <= s2 + a2 && e2 >= n2 && e2 <= n2 + r2) return i2;
    }
    return null;
  }
  disableUserSelect(t2 = false) {
    this.#gt.classList.toggle("noUserSelect", t2);
  }
  addShouldRescale(t2) {
    this.#G.add(t2);
  }
  removeShouldRescale(t2) {
    this.#G.delete(t2);
  }
  onScaleChanging({ scale: t2 }) {
    this.commitOrRemove();
    this.viewParameters.realScale = t2 * PixelsPerInch.PDF_TO_CSS_UNITS;
    for (const t3 of this.#G) t3.onScaleChanging();
    this.#N?.onScaleChanging();
  }
  onRotationChanging({ pagesRotation: t2 }) {
    this.commitOrRemove();
    this.viewParameters.rotation = t2;
  }
  #wt({ anchorNode: t2 }) {
    return t2.nodeType === Node.TEXT_NODE ? t2.parentElement : t2;
  }
  #vt(t2) {
    const { currentLayer: e2 } = this;
    if (e2.hasTextLayer(t2)) return e2;
    for (const e3 of this.#k.values()) if (e3.hasTextLayer(t2)) return e3;
    return null;
  }
  highlightSelection(t2 = "") {
    const e2 = document.getSelection();
    if (!e2 || e2.isCollapsed) return;
    const { anchorNode: i2, anchorOffset: s2, focusNode: n2, focusOffset: a2 } = e2, r2 = e2.toString(), o2 = this.#wt(e2).closest(".textLayer"), l2 = this.getSelectionBoxes(o2);
    if (!l2) return;
    e2.empty();
    const h2 = this.#vt(o2), d2 = this.#at === g.NONE, callback = () => {
      h2?.createAndAddNewEditor({ x: 0, y: 0 }, false, { methodOfCreation: t2, boxes: l2, anchorNode: i2, anchorOffset: s2, focusNode: n2, focusOffset: a2, text: r2 });
      d2 && this.showAllEditors("highlight", true, true);
    };
    d2 ? this.switchToMode(g.HIGHLIGHT, callback) : callback();
  }
  #yt() {
    const t2 = document.getSelection();
    if (!t2 || t2.isCollapsed) return;
    const e2 = this.#wt(t2).closest(".textLayer"), i2 = this.getSelectionBoxes(e2);
    if (i2) {
      this.#Q ||= new HighlightToolbar(this);
      this.#Q.show(e2, i2, "ltr" === this.direction);
    }
  }
  addToAnnotationStorage(t2) {
    t2.isEmpty() || !this.#I || this.#I.has(t2.id) || this.#I.setValue(t2.id, t2);
  }
  #xt() {
    const t2 = document.getSelection();
    if (!t2 || t2.isCollapsed) {
      if (this.#ot) {
        this.#Q?.hide();
        this.#ot = null;
        this.#_t({ hasSelectedText: false });
      }
      return;
    }
    const { anchorNode: e2 } = t2;
    if (e2 === this.#ot) return;
    const i2 = this.#wt(t2).closest(".textLayer");
    if (i2) {
      this.#Q?.hide();
      this.#ot = e2;
      this.#_t({ hasSelectedText: true });
      if (this.#at === g.HIGHLIGHT || this.#at === g.NONE) {
        this.#at === g.HIGHLIGHT && this.showAllEditors("highlight", true, true);
        this.#Y = this.isShiftKeyDown;
        if (!this.isShiftKeyDown) {
          const t3 = this.#at === g.HIGHLIGHT ? this.#vt(i2) : null;
          t3?.toggleDrawing();
          const e3 = new AbortController(), s2 = this.combinedSignal(e3), pointerup = (i3) => {
            if ("pointerup" !== i3.type || 0 === i3.button) {
              e3.abort();
              t3?.toggleDrawing(true);
              "pointerup" === i3.type && this.#Et("main_toolbar");
            }
          };
          window.addEventListener("pointerup", pointerup, { signal: s2 });
          window.addEventListener("blur", pointerup, { signal: s2 });
        }
      }
    } else if (this.#ot) {
      this.#Q?.hide();
      this.#ot = null;
      this.#_t({ hasSelectedText: false });
    }
  }
  #Et(t2 = "") {
    this.#at === g.HIGHLIGHT ? this.highlightSelection(t2) : this.#$ && this.#yt();
  }
  #ft() {
    document.addEventListener("selectionchange", this.#xt.bind(this), { signal: this._signal });
  }
  #St() {
    if (this.#X) return;
    this.#X = new AbortController();
    const t2 = this.combinedSignal(this.#X);
    window.addEventListener("focus", this.focus.bind(this), { signal: t2 });
    window.addEventListener("blur", this.blur.bind(this), { signal: t2 });
  }
  #Ct() {
    this.#X?.abort();
    this.#X = null;
  }
  blur() {
    this.isShiftKeyDown = false;
    if (this.#Y) {
      this.#Y = false;
      this.#Et("main_toolbar");
    }
    if (!this.hasSelection) return;
    const { activeElement: t2 } = document;
    for (const e2 of this.#rt) if (e2.div.contains(t2)) {
      this.#it = [e2, t2];
      e2._focusEventsAllowed = false;
      break;
    }
  }
  focus() {
    if (!this.#it) return;
    const [t2, e2] = this.#it;
    this.#it = null;
    e2.addEventListener("focusin", (() => {
      t2._focusEventsAllowed = true;
    }), { once: true, signal: this._signal });
    e2.focus();
  }
  #At() {
    if (this.#et) return;
    this.#et = new AbortController();
    const t2 = this.combinedSignal(this.#et);
    window.addEventListener("keydown", this.keydown.bind(this), { signal: t2 });
    window.addEventListener("keyup", this.keyup.bind(this), { signal: t2 });
  }
  #Tt() {
    this.#et?.abort();
    this.#et = null;
  }
  #Mt() {
    if (this.#O) return;
    this.#O = new AbortController();
    const t2 = this.combinedSignal(this.#O);
    document.addEventListener("copy", this.copy.bind(this), { signal: t2 });
    document.addEventListener("cut", this.cut.bind(this), { signal: t2 });
    document.addEventListener("paste", this.paste.bind(this), { signal: t2 });
  }
  #Pt() {
    this.#O?.abort();
    this.#O = null;
  }
  #bt() {
    const t2 = this._signal;
    document.addEventListener("dragover", this.dragOver.bind(this), { signal: t2 });
    document.addEventListener("drop", this.drop.bind(this), { signal: t2 });
  }
  addEditListeners() {
    this.#At();
    this.#Mt();
  }
  removeEditListeners() {
    this.#Tt();
    this.#Pt();
  }
  dragOver(t2) {
    for (const { type: e2 } of t2.dataTransfer.items) for (const i2 of this.#U) if (i2.isHandlingMimeForPasting(e2)) {
      t2.dataTransfer.dropEffect = "copy";
      t2.preventDefault();
      return;
    }
  }
  drop(t2) {
    for (const e2 of t2.dataTransfer.items) for (const i2 of this.#U) if (i2.isHandlingMimeForPasting(e2.type)) {
      i2.paste(e2, this.currentLayer);
      t2.preventDefault();
      return;
    }
  }
  copy(t2) {
    t2.preventDefault();
    this.#P?.commitOrRemove();
    if (!this.hasSelection) return;
    const e2 = [];
    for (const t3 of this.#rt) {
      const i2 = t3.serialize(true);
      i2 && e2.push(i2);
    }
    0 !== e2.length && t2.clipboardData.setData("application/pdfjs", JSON.stringify(e2));
  }
  cut(t2) {
    this.copy(t2);
    this.delete();
  }
  async paste(t2) {
    t2.preventDefault();
    const { clipboardData: e2 } = t2;
    for (const t3 of e2.items) for (const e3 of this.#U) if (e3.isHandlingMimeForPasting(t3.type)) {
      e3.paste(t3, this.currentLayer);
      return;
    }
    let i2 = e2.getData("application/pdfjs");
    if (!i2) return;
    try {
      i2 = JSON.parse(i2);
    } catch (t3) {
      warn(`paste: "${t3.message}".`);
      return;
    }
    if (!Array.isArray(i2)) return;
    this.unselectAll();
    const s2 = this.currentLayer;
    try {
      const t3 = [];
      for (const e3 of i2) {
        const i3 = await s2.deserialize(e3);
        if (!i3) return;
        t3.push(i3);
      }
      const cmd = () => {
        for (const e3 of t3) this.#Dt(e3);
        this.#kt(t3);
      }, undo = () => {
        for (const e3 of t3) e3.remove();
      };
      this.addCommands({ cmd, undo, mustExec: true });
    } catch (t3) {
      warn(`paste: "${t3.message}".`);
    }
  }
  keydown(t2) {
    this.isShiftKeyDown || "Shift" !== t2.key || (this.isShiftKeyDown = true);
    this.#at === g.NONE || this.isEditorHandlingKeyboard || _AnnotationEditorUIManager._keyboardManager.exec(this, t2);
  }
  keyup(t2) {
    if (this.isShiftKeyDown && "Shift" === t2.key) {
      this.isShiftKeyDown = false;
      if (this.#Y) {
        this.#Y = false;
        this.#Et("main_toolbar");
      }
    }
  }
  onEditingAction({ name: t2 }) {
    switch (t2) {
      case "undo":
      case "redo":
      case "delete":
      case "selectAll":
        this[t2]();
        break;
      case "highlightSelection":
        this.highlightSelection("context_menu");
    }
  }
  #_t(t2) {
    if (Object.entries(t2).some((([t3, e2]) => this.#dt[t3] !== e2))) {
      this._eventBus.dispatch("annotationeditorstateschanged", { source: this, details: Object.assign(this.#dt, t2) });
      this.#at === g.HIGHLIGHT && false === t2.hasSelectedEditor && this.#Rt([[m.HIGHLIGHT_FREE, true]]);
    }
  }
  #Rt(t2) {
    this._eventBus.dispatch("annotationeditorparamschanged", { source: this, details: t2 });
  }
  setEditingState(t2) {
    if (t2) {
      this.#St();
      this.#Mt();
      this.#_t({ isEditing: this.#at !== g.NONE, isEmpty: this.#It(), hasSomethingToUndo: this.#L.hasSomethingToUndo(), hasSomethingToRedo: this.#L.hasSomethingToRedo(), hasSelectedEditor: false });
    } else {
      this.#Ct();
      this.#Pt();
      this.#_t({ isEditing: false });
      this.disableUserSelect(false);
    }
  }
  registerEditorTypes(t2) {
    if (!this.#U) {
      this.#U = t2;
      for (const t3 of this.#U) this.#Rt(t3.defaultPropertiesToUpdate);
    }
  }
  getId() {
    return this.#J.id;
  }
  get currentLayer() {
    return this.#k.get(this.#B);
  }
  getLayer(t2) {
    return this.#k.get(t2);
  }
  get currentPageIndex() {
    return this.#B;
  }
  addLayer(t2) {
    this.#k.set(t2.pageIndex, t2);
    this.#Z ? t2.enable() : t2.disable();
  }
  removeLayer(t2) {
    this.#k.delete(t2.pageIndex);
  }
  async updateMode(t2, e2 = null, i2 = false) {
    if (this.#at !== t2) {
      if (this.#mt) {
        await this.#mt.promise;
        if (!this.#mt) return;
      }
      this.#mt = Promise.withResolvers();
      this.#at = t2;
      if (t2 !== g.NONE) {
        this.setEditingState(true);
        await this.#Ft();
        this.unselectAll();
        for (const e3 of this.#k.values()) e3.updateMode(t2);
        if (e2) {
          for (const t3 of this.#D.values()) if (t3.annotationElementId === e2) {
            this.setSelected(t3);
            t3.enterInEditMode();
          } else t3.unselect();
          this.#mt.resolve();
        } else {
          i2 && this.addNewEditorFromKeyboard();
          this.#mt.resolve();
        }
      } else {
        this.setEditingState(false);
        this.#Lt();
        this._editorUndoBar?.hide();
        this.#mt.resolve();
      }
    }
  }
  addNewEditorFromKeyboard() {
    this.currentLayer.canCreateNewEmptyEditor() && this.currentLayer.addNewEditor();
  }
  updateToolbar(t2) {
    t2 !== this.#at && this._eventBus.dispatch("switchannotationeditormode", { source: this, mode: t2 });
  }
  updateParams(t2, e2) {
    if (this.#U) {
      switch (t2) {
        case m.CREATE:
          this.currentLayer.addNewEditor();
          return;
        case m.HIGHLIGHT_DEFAULT_COLOR:
          this.#st?.updateColor(e2);
          break;
        case m.HIGHLIGHT_SHOW_ALL:
          this._eventBus.dispatch("reporttelemetry", { source: this, details: { type: "editing", data: { type: "highlight", action: "toggle_visibility" } } });
          (this.#ht ||= /* @__PURE__ */ new Map()).set(t2, e2);
          this.showAllEditors("highlight", e2);
      }
      for (const i2 of this.#rt) i2.updateParams(t2, e2);
      for (const i2 of this.#U) i2.updateDefaultParams(t2, e2);
    }
  }
  showAllEditors(t2, e2, i2 = false) {
    for (const i3 of this.#D.values()) i3.editorType === t2 && i3.show(e2);
    (this.#ht?.get(m.HIGHLIGHT_SHOW_ALL) ?? true) !== e2 && this.#Rt([[m.HIGHLIGHT_SHOW_ALL, e2]]);
  }
  enableWaiting(t2 = false) {
    if (this.#tt !== t2) {
      this.#tt = t2;
      for (const e2 of this.#k.values()) {
        t2 ? e2.disableClick() : e2.enableClick();
        e2.div.classList.toggle("waiting", t2);
      }
    }
  }
  async #Ft() {
    if (!this.#Z) {
      this.#Z = true;
      const t2 = [];
      for (const e2 of this.#k.values()) t2.push(e2.enable());
      await Promise.all(t2);
      for (const t3 of this.#D.values()) t3.enable();
    }
  }
  #Lt() {
    this.unselectAll();
    if (this.#Z) {
      this.#Z = false;
      for (const t2 of this.#k.values()) t2.disable();
      for (const t2 of this.#D.values()) t2.disable();
    }
  }
  getEditors(t2) {
    const e2 = [];
    for (const i2 of this.#D.values()) i2.pageIndex === t2 && e2.push(i2);
    return e2;
  }
  getEditor(t2) {
    return this.#D.get(t2);
  }
  addEditor(t2) {
    this.#D.set(t2.id, t2);
  }
  removeEditor(t2) {
    if (t2.div.contains(document.activeElement)) {
      this.#q && clearTimeout(this.#q);
      this.#q = setTimeout((() => {
        this.focusMainContainer();
        this.#q = null;
      }), 0);
    }
    this.#D.delete(t2.id);
    this.unselect(t2);
    t2.annotationElementId && this.#H.has(t2.annotationElementId) || this.#I?.remove(t2.id);
  }
  addDeletedAnnotationElement(t2) {
    this.#H.add(t2.annotationElementId);
    this.addChangedExistingAnnotation(t2);
    t2.deleted = true;
  }
  isDeletedAnnotationElement(t2) {
    return this.#H.has(t2);
  }
  removeDeletedAnnotationElement(t2) {
    this.#H.delete(t2.annotationElementId);
    this.removeChangedExistingAnnotation(t2);
    t2.deleted = false;
  }
  #Dt(t2) {
    const e2 = this.#k.get(t2.pageIndex);
    if (e2) e2.addOrRebuild(t2);
    else {
      this.addEditor(t2);
      this.addToAnnotationStorage(t2);
    }
  }
  setActiveEditor(t2) {
    if (this.#P !== t2) {
      this.#P = t2;
      t2 && this.#Rt(t2.propertiesToUpdate);
    }
  }
  get #Ot() {
    let t2 = null;
    for (t2 of this.#rt) ;
    return t2;
  }
  updateUI(t2) {
    this.#Ot === t2 && this.#Rt(t2.propertiesToUpdate);
  }
  updateUIForDefaultProperties(t2) {
    this.#Rt(t2.defaultPropertiesToUpdate);
  }
  toggleSelected(t2) {
    if (this.#rt.has(t2)) {
      this.#rt.delete(t2);
      t2.unselect();
      this.#_t({ hasSelectedEditor: this.hasSelection });
    } else {
      this.#rt.add(t2);
      t2.select();
      this.#Rt(t2.propertiesToUpdate);
      this.#_t({ hasSelectedEditor: true });
    }
  }
  setSelected(t2) {
    this.#N?.commitOrRemove();
    for (const e2 of this.#rt) e2 !== t2 && e2.unselect();
    this.#rt.clear();
    this.#rt.add(t2);
    t2.select();
    this.#Rt(t2.propertiesToUpdate);
    this.#_t({ hasSelectedEditor: true });
  }
  isSelected(t2) {
    return this.#rt.has(t2);
  }
  get firstSelectedEditor() {
    return this.#rt.values().next().value;
  }
  unselect(t2) {
    t2.unselect();
    this.#rt.delete(t2);
    this.#_t({ hasSelectedEditor: this.hasSelection });
  }
  get hasSelection() {
    return 0 !== this.#rt.size;
  }
  get isEnterHandled() {
    return 1 === this.#rt.size && this.firstSelectedEditor.isEnterHandled;
  }
  undo() {
    this.#L.undo();
    this.#_t({ hasSomethingToUndo: this.#L.hasSomethingToUndo(), hasSomethingToRedo: true, isEmpty: this.#It() });
    this._editorUndoBar?.hide();
  }
  redo() {
    this.#L.redo();
    this.#_t({ hasSomethingToUndo: true, hasSomethingToRedo: this.#L.hasSomethingToRedo(), isEmpty: this.#It() });
  }
  addCommands(t2) {
    this.#L.add(t2);
    this.#_t({ hasSomethingToUndo: true, hasSomethingToRedo: false, isEmpty: this.#It() });
  }
  cleanUndoStack(t2) {
    this.#L.cleanType(t2);
  }
  #It() {
    if (0 === this.#D.size) return true;
    if (1 === this.#D.size) for (const t2 of this.#D.values()) return t2.isEmpty();
    return false;
  }
  delete() {
    this.commitOrRemove();
    const t2 = this.currentLayer?.endDrawingSession(true);
    if (!this.hasSelection && !t2) return;
    const e2 = t2 ? [t2] : [...this.#rt], undo = () => {
      for (const t3 of e2) this.#Dt(t3);
    };
    this.addCommands({ cmd: () => {
      this._editorUndoBar?.show(undo, 1 === e2.length ? e2[0].editorType : e2.length);
      for (const t3 of e2) t3.remove();
    }, undo, mustExec: true });
  }
  commitOrRemove() {
    this.#P?.commitOrRemove();
  }
  hasSomethingToControl() {
    return this.#P || this.hasSelection;
  }
  #kt(t2) {
    for (const t3 of this.#rt) t3.unselect();
    this.#rt.clear();
    for (const e2 of t2) if (!e2.isEmpty()) {
      this.#rt.add(e2);
      e2.select();
    }
    this.#_t({ hasSelectedEditor: this.hasSelection });
  }
  selectAll() {
    for (const t2 of this.#rt) t2.commit();
    this.#kt(this.#D.values());
  }
  unselectAll() {
    if (this.#P) {
      this.#P.commitOrRemove();
      if (this.#at !== g.NONE) return;
    }
    if (!this.#N?.commitOrRemove() && this.hasSelection) {
      for (const t2 of this.#rt) t2.unselect();
      this.#rt.clear();
      this.#_t({ hasSelectedEditor: false });
    }
  }
  translateSelectedEditors(t2, e2, i2 = false) {
    i2 || this.commitOrRemove();
    if (!this.hasSelection) return;
    this.#ct[0] += t2;
    this.#ct[1] += e2;
    const [s2, n2] = this.#ct, a2 = [...this.#rt];
    this.#ut && clearTimeout(this.#ut);
    this.#ut = setTimeout((() => {
      this.#ut = null;
      this.#ct[0] = this.#ct[1] = 0;
      this.addCommands({ cmd: () => {
        for (const t3 of a2) this.#D.has(t3.id) && t3.translateInPage(s2, n2);
      }, undo: () => {
        for (const t3 of a2) this.#D.has(t3.id) && t3.translateInPage(-s2, -n2);
      }, mustExec: false });
    }), 1e3);
    for (const i3 of a2) i3.translateInPage(t2, e2);
  }
  setUpDragSession() {
    if (this.hasSelection) {
      this.disableUserSelect(true);
      this.#z = /* @__PURE__ */ new Map();
      for (const t2 of this.#rt) this.#z.set(t2, { savedX: t2.x, savedY: t2.y, savedPageIndex: t2.pageIndex, newX: 0, newY: 0, newPageIndex: -1 });
    }
  }
  endDragSession() {
    if (!this.#z) return false;
    this.disableUserSelect(false);
    const t2 = this.#z;
    this.#z = null;
    let e2 = false;
    for (const [{ x: i2, y: s2, pageIndex: n2 }, a2] of t2) {
      a2.newX = i2;
      a2.newY = s2;
      a2.newPageIndex = n2;
      e2 ||= i2 !== a2.savedX || s2 !== a2.savedY || n2 !== a2.savedPageIndex;
    }
    if (!e2) return false;
    const move = (t3, e3, i2, s2) => {
      if (this.#D.has(t3.id)) {
        const n2 = this.#k.get(s2);
        if (n2) t3._setParentAndPosition(n2, e3, i2);
        else {
          t3.pageIndex = s2;
          t3.x = e3;
          t3.y = i2;
        }
      }
    };
    this.addCommands({ cmd: () => {
      for (const [e3, { newX: i2, newY: s2, newPageIndex: n2 }] of t2) move(e3, i2, s2, n2);
    }, undo: () => {
      for (const [e3, { savedX: i2, savedY: s2, savedPageIndex: n2 }] of t2) move(e3, i2, s2, n2);
    }, mustExec: true });
    return true;
  }
  dragSelectedEditors(t2, e2) {
    if (this.#z) for (const i2 of this.#z.keys()) i2.drag(t2, e2);
  }
  rebuild(t2) {
    if (null === t2.parent) {
      const e2 = this.getLayer(t2.pageIndex);
      if (e2) {
        e2.changeParent(t2);
        e2.addOrRebuild(t2);
      } else {
        this.addEditor(t2);
        this.addToAnnotationStorage(t2);
        t2.rebuild();
      }
    } else t2.parent.addOrRebuild(t2);
  }
  get isEditorHandlingKeyboard() {
    return this.getActive()?.shouldGetKeyboardEvents() || 1 === this.#rt.size && this.firstSelectedEditor.shouldGetKeyboardEvents();
  }
  isActive(t2) {
    return this.#P === t2;
  }
  getActive() {
    return this.#P;
  }
  getMode() {
    return this.#at;
  }
  get imageManager() {
    return shadow(this, "imageManager", new ImageManager());
  }
  getSelectionBoxes(t2) {
    if (!t2) return null;
    const e2 = document.getSelection();
    for (let i3 = 0, s3 = e2.rangeCount; i3 < s3; i3++) if (!t2.contains(e2.getRangeAt(i3).commonAncestorContainer)) return null;
    const { x: i2, y: s2, width: n2, height: a2 } = t2.getBoundingClientRect();
    let r2;
    switch (t2.getAttribute("data-main-rotation")) {
      case "90":
        r2 = (t3, e3, r3, o3) => ({ x: (e3 - s2) / a2, y: 1 - (t3 + r3 - i2) / n2, width: o3 / a2, height: r3 / n2 });
        break;
      case "180":
        r2 = (t3, e3, r3, o3) => ({ x: 1 - (t3 + r3 - i2) / n2, y: 1 - (e3 + o3 - s2) / a2, width: r3 / n2, height: o3 / a2 });
        break;
      case "270":
        r2 = (t3, e3, r3, o3) => ({ x: 1 - (e3 + o3 - s2) / a2, y: (t3 - i2) / n2, width: o3 / a2, height: r3 / n2 });
        break;
      default:
        r2 = (t3, e3, r3, o3) => ({ x: (t3 - i2) / n2, y: (e3 - s2) / a2, width: r3 / n2, height: o3 / a2 });
    }
    const o2 = [];
    for (let t3 = 0, i3 = e2.rangeCount; t3 < i3; t3++) {
      const i4 = e2.getRangeAt(t3);
      if (!i4.collapsed) for (const { x: t4, y: e3, width: s3, height: n3 } of i4.getClientRects()) 0 !== s3 && 0 !== n3 && o2.push(r2(t4, e3, s3, n3));
    }
    return 0 === o2.length ? null : o2;
  }
  addChangedExistingAnnotation({ annotationElementId: t2, id: e2 }) {
    (this.#F ||= /* @__PURE__ */ new Map()).set(t2, e2);
  }
  removeChangedExistingAnnotation({ annotationElementId: t2 }) {
    this.#F?.delete(t2);
  }
  renderAnnotationElement(t2) {
    const e2 = this.#F?.get(t2.data.id);
    if (!e2) return;
    const i2 = this.#I.getRawValue(e2);
    i2 && (this.#at !== g.NONE || i2.hasBeenModified) && i2.renderAnnotationElement(t2);
  }
};
var AltText = class _AltText {
  #o = null;
  #Nt = false;
  #Bt = null;
  #Ht = null;
  #zt = null;
  #Ut = null;
  #Gt = false;
  #$t = null;
  #a = null;
  #Vt = null;
  #jt = null;
  #Wt = false;
  static #qt = null;
  static _l10n = null;
  constructor(t2) {
    this.#a = t2;
    this.#Wt = t2._uiManager.useNewAltTextFlow;
    _AltText.#qt ||= Object.freeze({ added: "pdfjs-editor-new-alt-text-added-button", "added-label": "pdfjs-editor-new-alt-text-added-button-label", missing: "pdfjs-editor-new-alt-text-missing-button", "missing-label": "pdfjs-editor-new-alt-text-missing-button-label", review: "pdfjs-editor-new-alt-text-to-review-button", "review-label": "pdfjs-editor-new-alt-text-to-review-button-label" });
  }
  static initialize(t2) {
    _AltText._l10n ??= t2;
  }
  async render() {
    const t2 = this.#Bt = document.createElement("button");
    t2.className = "altText";
    t2.tabIndex = "0";
    const e2 = this.#Ht = document.createElement("span");
    t2.append(e2);
    if (this.#Wt) {
      t2.classList.add("new");
      t2.setAttribute("data-l10n-id", _AltText.#qt.missing);
      e2.setAttribute("data-l10n-id", _AltText.#qt["missing-label"]);
    } else {
      t2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-button");
      e2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-button-label");
    }
    const i2 = this.#a._uiManager._signal;
    t2.addEventListener("contextmenu", noContextMenu, { signal: i2 });
    t2.addEventListener("pointerdown", ((t3) => t3.stopPropagation()), { signal: i2 });
    const onClick = (t3) => {
      t3.preventDefault();
      this.#a._uiManager.editAltText(this.#a);
      this.#Wt && this.#a._reportTelemetry({ action: "pdfjs.image.alt_text.image_status_label_clicked", data: { label: this.#Xt } });
    };
    t2.addEventListener("click", onClick, { capture: true, signal: i2 });
    t2.addEventListener("keydown", ((e3) => {
      if (e3.target === t2 && "Enter" === e3.key) {
        this.#Gt = true;
        onClick(e3);
      }
    }), { signal: i2 });
    await this.#Kt();
    return t2;
  }
  get #Xt() {
    return (this.#o ? "added" : null === this.#o && this.guessedText && "review") || "missing";
  }
  finish() {
    if (this.#Bt) {
      this.#Bt.focus({ focusVisible: this.#Gt });
      this.#Gt = false;
    }
  }
  isEmpty() {
    return this.#Wt ? null === this.#o : !this.#o && !this.#Nt;
  }
  hasData() {
    return this.#Wt ? null !== this.#o || !!this.#Vt : this.isEmpty();
  }
  get guessedText() {
    return this.#Vt;
  }
  async setGuessedText(t2) {
    if (null === this.#o) {
      this.#Vt = t2;
      this.#jt = await _AltText._l10n.get("pdfjs-editor-new-alt-text-generated-alt-text-with-disclaimer", { generatedAltText: t2 });
      this.#Kt();
    }
  }
  toggleAltTextBadge(t2 = false) {
    if (this.#Wt && !this.#o) {
      if (!this.#$t) {
        const t3 = this.#$t = document.createElement("div");
        t3.className = "noAltTextBadge";
        this.#a.div.append(t3);
      }
      this.#$t.classList.toggle("hidden", !t2);
    } else {
      this.#$t?.remove();
      this.#$t = null;
    }
  }
  serialize(t2) {
    let e2 = this.#o;
    t2 || this.#Vt !== e2 || (e2 = this.#jt);
    return { altText: e2, decorative: this.#Nt, guessedText: this.#Vt, textWithDisclaimer: this.#jt };
  }
  get data() {
    return { altText: this.#o, decorative: this.#Nt };
  }
  set data({ altText: t2, decorative: e2, guessedText: i2, textWithDisclaimer: s2, cancel: n2 = false }) {
    if (i2) {
      this.#Vt = i2;
      this.#jt = s2;
    }
    if (this.#o !== t2 || this.#Nt !== e2) {
      if (!n2) {
        this.#o = t2;
        this.#Nt = e2;
      }
      this.#Kt();
    }
  }
  toggle(t2 = false) {
    if (this.#Bt) {
      if (!t2 && this.#Ut) {
        clearTimeout(this.#Ut);
        this.#Ut = null;
      }
      this.#Bt.disabled = !t2;
    }
  }
  shown() {
    this.#a._reportTelemetry({ action: "pdfjs.image.alt_text.image_status_label_displayed", data: { label: this.#Xt } });
  }
  destroy() {
    this.#Bt?.remove();
    this.#Bt = null;
    this.#Ht = null;
    this.#zt = null;
    this.#$t?.remove();
    this.#$t = null;
  }
  async #Kt() {
    const t2 = this.#Bt;
    if (!t2) return;
    if (this.#Wt) {
      t2.classList.toggle("done", !!this.#o);
      t2.setAttribute("data-l10n-id", _AltText.#qt[this.#Xt]);
      this.#Ht?.setAttribute("data-l10n-id", _AltText.#qt[`${this.#Xt}-label`]);
      if (!this.#o) {
        this.#zt?.remove();
        return;
      }
    } else {
      if (!this.#o && !this.#Nt) {
        t2.classList.remove("done");
        this.#zt?.remove();
        return;
      }
      t2.classList.add("done");
      t2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-edit-button");
    }
    let e2 = this.#zt;
    if (!e2) {
      this.#zt = e2 = document.createElement("span");
      e2.className = "tooltip";
      e2.setAttribute("role", "tooltip");
      e2.id = `alt-text-tooltip-${this.#a.id}`;
      const i3 = 100, s2 = this.#a._uiManager._signal;
      s2.addEventListener("abort", (() => {
        clearTimeout(this.#Ut);
        this.#Ut = null;
      }), { once: true });
      t2.addEventListener("mouseenter", (() => {
        this.#Ut = setTimeout((() => {
          this.#Ut = null;
          this.#zt.classList.add("show");
          this.#a._reportTelemetry({ action: "alt_text_tooltip" });
        }), i3);
      }), { signal: s2 });
      t2.addEventListener("mouseleave", (() => {
        if (this.#Ut) {
          clearTimeout(this.#Ut);
          this.#Ut = null;
        }
        this.#zt?.classList.remove("show");
      }), { signal: s2 });
    }
    if (this.#Nt) e2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-decorative-tooltip");
    else {
      e2.removeAttribute("data-l10n-id");
      e2.textContent = this.#o;
    }
    e2.parentNode || t2.append(e2);
    const i2 = this.#a.getImageForAltText();
    i2?.setAttribute("aria-describedby", e2.id);
  }
};
var TouchManager = class _TouchManager {
  #pt;
  #Yt = false;
  #Qt = null;
  #Jt;
  #Zt;
  #te;
  #ee;
  #ie;
  #se = null;
  #ne;
  #ae = null;
  constructor({ container: t2, isPinchingDisabled: e2 = null, isPinchingStopped: i2 = null, onPinchStart: s2 = null, onPinching: n2 = null, onPinchEnd: a2 = null, signal: r2 }) {
    this.#pt = t2;
    this.#Qt = i2;
    this.#Jt = e2;
    this.#Zt = s2;
    this.#te = n2;
    this.#ee = a2;
    this.#ne = new AbortController();
    this.#ie = AbortSignal.any([r2, this.#ne.signal]);
    t2.addEventListener("touchstart", this.#re.bind(this), { passive: false, signal: this.#ie });
  }
  get MIN_TOUCH_DISTANCE_TO_PINCH() {
    return shadow(this, "MIN_TOUCH_DISTANCE_TO_PINCH", 35 / (window.devicePixelRatio || 1));
  }
  #re(t2) {
    if (this.#Jt?.() || t2.touches.length < 2) return;
    if (!this.#ae) {
      this.#ae = new AbortController();
      const t3 = AbortSignal.any([this.#ie, this.#ae.signal]), e3 = this.#pt, i3 = { signal: t3, passive: false };
      e3.addEventListener("touchmove", this.#oe.bind(this), i3);
      e3.addEventListener("touchend", this.#le.bind(this), i3);
      e3.addEventListener("touchcancel", this.#le.bind(this), i3);
      this.#Zt?.();
    }
    stopEvent(t2);
    if (2 !== t2.touches.length || this.#Qt?.()) {
      this.#se = null;
      return;
    }
    let [e2, i2] = t2.touches;
    e2.identifier > i2.identifier && ([e2, i2] = [i2, e2]);
    this.#se = { touch0X: e2.screenX, touch0Y: e2.screenY, touch1X: i2.screenX, touch1Y: i2.screenY };
  }
  #oe(t2) {
    if (!this.#se || 2 !== t2.touches.length) return;
    let [e2, i2] = t2.touches;
    e2.identifier > i2.identifier && ([e2, i2] = [i2, e2]);
    const { screenX: s2, screenY: n2 } = e2, { screenX: a2, screenY: r2 } = i2, o2 = this.#se, { touch0X: l2, touch0Y: h2, touch1X: d2, touch1Y: c2 } = o2, u2 = d2 - l2, p2 = c2 - h2, g2 = a2 - s2, m2 = r2 - n2, f2 = Math.hypot(g2, m2) || 1, b2 = Math.hypot(u2, p2) || 1;
    if (!this.#Yt && Math.abs(b2 - f2) <= _TouchManager.MIN_TOUCH_DISTANCE_TO_PINCH) return;
    o2.touch0X = s2;
    o2.touch0Y = n2;
    o2.touch1X = a2;
    o2.touch1Y = r2;
    t2.preventDefault();
    if (!this.#Yt) {
      this.#Yt = true;
      return;
    }
    const A2 = [(s2 + a2) / 2, (n2 + r2) / 2];
    this.#te?.(A2, b2, f2);
  }
  #le(t2) {
    this.#ae.abort();
    this.#ae = null;
    this.#ee?.();
    if (this.#se) {
      t2.preventDefault();
      this.#se = null;
      this.#Yt = false;
    }
  }
  destroy() {
    this.#ne?.abort();
    this.#ne = null;
  }
};
var AnnotationEditor = class _AnnotationEditor {
  #he = null;
  #de = null;
  #o = null;
  #ce = false;
  #ue = null;
  #pe = "";
  #ge = false;
  #me = null;
  #fe = null;
  #be = null;
  #Ae = null;
  #we = "";
  #ve = false;
  #ye = null;
  #xe = false;
  #_e = false;
  #Ee = false;
  #Se = null;
  #Ce = 0;
  #Te = 0;
  #Me = null;
  #Pe = null;
  _editToolbar = null;
  _initialOptions = /* @__PURE__ */ Object.create(null);
  _initialData = null;
  _isVisible = true;
  _uiManager = null;
  _focusEventsAllowed = true;
  static _l10n = null;
  static _l10nResizer = null;
  #De = false;
  #ke = _AnnotationEditor._zIndex++;
  static _borderLineWidth = -1;
  static _colorManager = new ColorManager();
  static _zIndex = 1;
  static _telemetryTimeout = 1e3;
  static get _resizerKeyboardManager() {
    const t2 = _AnnotationEditor.prototype._resizeWithKeyboard, e2 = AnnotationEditorUIManager.TRANSLATE_SMALL, i2 = AnnotationEditorUIManager.TRANSLATE_BIG;
    return shadow(this, "_resizerKeyboardManager", new KeyboardManager([[["ArrowLeft", "mac+ArrowLeft"], t2, { args: [-e2, 0] }], [["ctrl+ArrowLeft", "mac+shift+ArrowLeft"], t2, { args: [-i2, 0] }], [["ArrowRight", "mac+ArrowRight"], t2, { args: [e2, 0] }], [["ctrl+ArrowRight", "mac+shift+ArrowRight"], t2, { args: [i2, 0] }], [["ArrowUp", "mac+ArrowUp"], t2, { args: [0, -e2] }], [["ctrl+ArrowUp", "mac+shift+ArrowUp"], t2, { args: [0, -i2] }], [["ArrowDown", "mac+ArrowDown"], t2, { args: [0, e2] }], [["ctrl+ArrowDown", "mac+shift+ArrowDown"], t2, { args: [0, i2] }], [["Escape", "mac+Escape"], _AnnotationEditor.prototype._stopResizingWithKeyboard]]));
  }
  constructor(t2) {
    this.parent = t2.parent;
    this.id = t2.id;
    this.width = this.height = null;
    this.pageIndex = t2.parent.pageIndex;
    this.name = t2.name;
    this.div = null;
    this._uiManager = t2.uiManager;
    this.annotationElementId = null;
    this._willKeepAspectRatio = false;
    this._initialOptions.isCentered = t2.isCentered;
    this._structTreeParentId = null;
    const { rotation: e2, rawDims: { pageWidth: i2, pageHeight: s2, pageX: n2, pageY: a2 } } = this.parent.viewport;
    this.rotation = e2;
    this.pageRotation = (360 + e2 - this._uiManager.viewParameters.rotation) % 360;
    this.pageDimensions = [i2, s2];
    this.pageTranslation = [n2, a2];
    const [r2, o2] = this.parentDimensions;
    this.x = t2.x / r2;
    this.y = t2.y / o2;
    this.isAttachedToDOM = false;
    this.deleted = false;
  }
  get editorType() {
    return Object.getPrototypeOf(this).constructor._type;
  }
  static get isDrawer() {
    return false;
  }
  static get _defaultLineColor() {
    return shadow(this, "_defaultLineColor", this._colorManager.getHexCode("CanvasText"));
  }
  static deleteAnnotationElement(t2) {
    const e2 = new FakeEditor({ id: t2.parent.getNextId(), parent: t2.parent, uiManager: t2._uiManager });
    e2.annotationElementId = t2.annotationElementId;
    e2.deleted = true;
    e2._uiManager.addToAnnotationStorage(e2);
  }
  static initialize(t2, e2) {
    _AnnotationEditor._l10n ??= t2;
    _AnnotationEditor._l10nResizer ||= Object.freeze({ topLeft: "pdfjs-editor-resizer-top-left", topMiddle: "pdfjs-editor-resizer-top-middle", topRight: "pdfjs-editor-resizer-top-right", middleRight: "pdfjs-editor-resizer-middle-right", bottomRight: "pdfjs-editor-resizer-bottom-right", bottomMiddle: "pdfjs-editor-resizer-bottom-middle", bottomLeft: "pdfjs-editor-resizer-bottom-left", middleLeft: "pdfjs-editor-resizer-middle-left" });
    if (-1 !== _AnnotationEditor._borderLineWidth) return;
    const i2 = getComputedStyle(document.documentElement);
    _AnnotationEditor._borderLineWidth = parseFloat(i2.getPropertyValue("--outline-width")) || 0;
  }
  static updateDefaultParams(t2, e2) {
  }
  static get defaultPropertiesToUpdate() {
    return [];
  }
  static isHandlingMimeForPasting(t2) {
    return false;
  }
  static paste(t2, e2) {
    unreachable("Not implemented");
  }
  get propertiesToUpdate() {
    return [];
  }
  get _isDraggable() {
    return this.#De;
  }
  set _isDraggable(t2) {
    this.#De = t2;
    this.div?.classList.toggle("draggable", t2);
  }
  get isEnterHandled() {
    return true;
  }
  center() {
    const [t2, e2] = this.pageDimensions;
    switch (this.parentRotation) {
      case 90:
        this.x -= this.height * e2 / (2 * t2);
        this.y += this.width * t2 / (2 * e2);
        break;
      case 180:
        this.x += this.width / 2;
        this.y += this.height / 2;
        break;
      case 270:
        this.x += this.height * e2 / (2 * t2);
        this.y -= this.width * t2 / (2 * e2);
        break;
      default:
        this.x -= this.width / 2;
        this.y -= this.height / 2;
    }
    this.fixAndSetPosition();
  }
  addCommands(t2) {
    this._uiManager.addCommands(t2);
  }
  get currentLayer() {
    return this._uiManager.currentLayer;
  }
  setInBackground() {
    this.div.style.zIndex = 0;
  }
  setInForeground() {
    this.div.style.zIndex = this.#ke;
  }
  setParent(t2) {
    if (null !== t2) {
      this.pageIndex = t2.pageIndex;
      this.pageDimensions = t2.pageDimensions;
    } else this.#Re();
    this.parent = t2;
  }
  focusin(t2) {
    this._focusEventsAllowed && (this.#ve ? this.#ve = false : this.parent.setSelected(this));
  }
  focusout(t2) {
    if (!this._focusEventsAllowed) return;
    if (!this.isAttachedToDOM) return;
    const e2 = t2.relatedTarget;
    if (!e2?.closest(`#${this.id}`)) {
      t2.preventDefault();
      this.parent?.isMultipleSelection || this.commitOrRemove();
    }
  }
  commitOrRemove() {
    this.isEmpty() ? this.remove() : this.commit();
  }
  commit() {
    this.addToAnnotationStorage();
  }
  addToAnnotationStorage() {
    this._uiManager.addToAnnotationStorage(this);
  }
  setAt(t2, e2, i2, s2) {
    const [n2, a2] = this.parentDimensions;
    [i2, s2] = this.screenToPageTranslation(i2, s2);
    this.x = (t2 + i2) / n2;
    this.y = (e2 + s2) / a2;
    this.fixAndSetPosition();
  }
  #Ie([t2, e2], i2, s2) {
    [i2, s2] = this.screenToPageTranslation(i2, s2);
    this.x += i2 / t2;
    this.y += s2 / e2;
    this._onTranslating(this.x, this.y);
    this.fixAndSetPosition();
  }
  translate(t2, e2) {
    this.#Ie(this.parentDimensions, t2, e2);
  }
  translateInPage(t2, e2) {
    this.#ye ||= [this.x, this.y, this.width, this.height];
    this.#Ie(this.pageDimensions, t2, e2);
    this.div.scrollIntoView({ block: "nearest" });
  }
  drag(t2, e2) {
    this.#ye ||= [this.x, this.y, this.width, this.height];
    const { div: i2, parentDimensions: [s2, n2] } = this;
    this.x += t2 / s2;
    this.y += e2 / n2;
    if (this.parent && (this.x < 0 || this.x > 1 || this.y < 0 || this.y > 1)) {
      const { x: t3, y: e3 } = this.div.getBoundingClientRect();
      if (this.parent.findNewParent(this, t3, e3)) {
        this.x -= Math.floor(this.x);
        this.y -= Math.floor(this.y);
      }
    }
    let { x: a2, y: r2 } = this;
    const [o2, l2] = this.getBaseTranslation();
    a2 += o2;
    r2 += l2;
    const { style: h2 } = i2;
    h2.left = `${(100 * a2).toFixed(2)}%`;
    h2.top = `${(100 * r2).toFixed(2)}%`;
    this._onTranslating(a2, r2);
    i2.scrollIntoView({ block: "nearest" });
  }
  _onTranslating(t2, e2) {
  }
  _onTranslated(t2, e2) {
  }
  get _hasBeenMoved() {
    return !!this.#ye && (this.#ye[0] !== this.x || this.#ye[1] !== this.y);
  }
  get _hasBeenResized() {
    return !!this.#ye && (this.#ye[2] !== this.width || this.#ye[3] !== this.height);
  }
  getBaseTranslation() {
    const [t2, e2] = this.parentDimensions, { _borderLineWidth: i2 } = _AnnotationEditor, s2 = i2 / t2, n2 = i2 / e2;
    switch (this.rotation) {
      case 90:
        return [-s2, n2];
      case 180:
        return [s2, n2];
      case 270:
        return [s2, -n2];
      default:
        return [-s2, -n2];
    }
  }
  get _mustFixPosition() {
    return true;
  }
  fixAndSetPosition(t2 = this.rotation) {
    const { div: { style: e2 }, pageDimensions: [i2, s2] } = this;
    let { x: n2, y: a2, width: r2, height: o2 } = this;
    r2 *= i2;
    o2 *= s2;
    n2 *= i2;
    a2 *= s2;
    if (this._mustFixPosition) switch (t2) {
      case 0:
        n2 = Math.max(0, Math.min(i2 - r2, n2));
        a2 = Math.max(0, Math.min(s2 - o2, a2));
        break;
      case 90:
        n2 = Math.max(0, Math.min(i2 - o2, n2));
        a2 = Math.min(s2, Math.max(r2, a2));
        break;
      case 180:
        n2 = Math.min(i2, Math.max(r2, n2));
        a2 = Math.min(s2, Math.max(o2, a2));
        break;
      case 270:
        n2 = Math.min(i2, Math.max(o2, n2));
        a2 = Math.max(0, Math.min(s2 - r2, a2));
    }
    this.x = n2 /= i2;
    this.y = a2 /= s2;
    const [l2, h2] = this.getBaseTranslation();
    n2 += l2;
    a2 += h2;
    e2.left = `${(100 * n2).toFixed(2)}%`;
    e2.top = `${(100 * a2).toFixed(2)}%`;
    this.moveInDOM();
  }
  static #Fe(t2, e2, i2) {
    switch (i2) {
      case 90:
        return [e2, -t2];
      case 180:
        return [-t2, -e2];
      case 270:
        return [-e2, t2];
      default:
        return [t2, e2];
    }
  }
  screenToPageTranslation(t2, e2) {
    return _AnnotationEditor.#Fe(t2, e2, this.parentRotation);
  }
  pageTranslationToScreen(t2, e2) {
    return _AnnotationEditor.#Fe(t2, e2, 360 - this.parentRotation);
  }
  #Le(t2) {
    switch (t2) {
      case 90: {
        const [t3, e2] = this.pageDimensions;
        return [0, -t3 / e2, e2 / t3, 0];
      }
      case 180:
        return [-1, 0, 0, -1];
      case 270: {
        const [t3, e2] = this.pageDimensions;
        return [0, t3 / e2, -e2 / t3, 0];
      }
      default:
        return [1, 0, 0, 1];
    }
  }
  get parentScale() {
    return this._uiManager.viewParameters.realScale;
  }
  get parentRotation() {
    return (this._uiManager.viewParameters.rotation + this.pageRotation) % 360;
  }
  get parentDimensions() {
    const { parentScale: t2, pageDimensions: [e2, i2] } = this;
    return [e2 * t2, i2 * t2];
  }
  setDims(t2, e2) {
    const [i2, s2] = this.parentDimensions, { style: n2 } = this.div;
    n2.width = `${(100 * t2 / i2).toFixed(2)}%`;
    this.#ge || (n2.height = `${(100 * e2 / s2).toFixed(2)}%`);
  }
  fixDims() {
    const { style: t2 } = this.div, { height: e2, width: i2 } = t2, s2 = i2.endsWith("%"), n2 = !this.#ge && e2.endsWith("%");
    if (s2 && n2) return;
    const [a2, r2] = this.parentDimensions;
    s2 || (t2.width = `${(100 * parseFloat(i2) / a2).toFixed(2)}%`);
    this.#ge || n2 || (t2.height = `${(100 * parseFloat(e2) / r2).toFixed(2)}%`);
  }
  getInitialTranslation() {
    return [0, 0];
  }
  #Oe() {
    if (this.#me) return;
    this.#me = document.createElement("div");
    this.#me.classList.add("resizers");
    const t2 = this._willKeepAspectRatio ? ["topLeft", "topRight", "bottomRight", "bottomLeft"] : ["topLeft", "topMiddle", "topRight", "middleRight", "bottomRight", "bottomMiddle", "bottomLeft", "middleLeft"], e2 = this._uiManager._signal;
    for (const i2 of t2) {
      const t3 = document.createElement("div");
      this.#me.append(t3);
      t3.classList.add("resizer", i2);
      t3.setAttribute("data-resizer-name", i2);
      t3.addEventListener("pointerdown", this.#Ne.bind(this, i2), { signal: e2 });
      t3.addEventListener("contextmenu", noContextMenu, { signal: e2 });
      t3.tabIndex = -1;
    }
    this.div.prepend(this.#me);
  }
  #Ne(t2, e2) {
    e2.preventDefault();
    const { isMac: i2 } = util_FeatureTest.platform;
    if (0 !== e2.button || e2.ctrlKey && i2) return;
    this.#o?.toggle(false);
    const s2 = this._isDraggable;
    this._isDraggable = false;
    this.#fe = [e2.screenX, e2.screenY];
    const n2 = new AbortController(), a2 = this._uiManager.combinedSignal(n2);
    this.parent.togglePointerEvents(false);
    window.addEventListener("pointermove", this.#Be.bind(this, t2), { passive: true, capture: true, signal: a2 });
    window.addEventListener("touchmove", stopEvent, { passive: false, signal: a2 });
    window.addEventListener("contextmenu", noContextMenu, { signal: a2 });
    this.#be = { savedX: this.x, savedY: this.y, savedWidth: this.width, savedHeight: this.height };
    const r2 = this.parent.div.style.cursor, o2 = this.div.style.cursor;
    this.div.style.cursor = this.parent.div.style.cursor = window.getComputedStyle(e2.target).cursor;
    const pointerUpCallback = () => {
      n2.abort();
      this.parent.togglePointerEvents(true);
      this.#o?.toggle(true);
      this._isDraggable = s2;
      this.parent.div.style.cursor = r2;
      this.div.style.cursor = o2;
      this.#He();
    };
    window.addEventListener("pointerup", pointerUpCallback, { signal: a2 });
    window.addEventListener("blur", pointerUpCallback, { signal: a2 });
  }
  #ze(t2, e2, i2, s2) {
    this.width = i2;
    this.height = s2;
    this.x = t2;
    this.y = e2;
    const [n2, a2] = this.parentDimensions;
    this.setDims(n2 * i2, a2 * s2);
    this.fixAndSetPosition();
    this._onResized();
  }
  _onResized() {
  }
  #He() {
    if (!this.#be) return;
    const { savedX: t2, savedY: e2, savedWidth: i2, savedHeight: s2 } = this.#be;
    this.#be = null;
    const n2 = this.x, a2 = this.y, r2 = this.width, o2 = this.height;
    n2 === t2 && a2 === e2 && r2 === i2 && o2 === s2 || this.addCommands({ cmd: this.#ze.bind(this, n2, a2, r2, o2), undo: this.#ze.bind(this, t2, e2, i2, s2), mustExec: true });
  }
  static _round(t2) {
    return Math.round(1e4 * t2) / 1e4;
  }
  #Be(t2, e2) {
    const [i2, s2] = this.parentDimensions, n2 = this.x, a2 = this.y, r2 = this.width, o2 = this.height, l2 = _AnnotationEditor.MIN_SIZE / i2, h2 = _AnnotationEditor.MIN_SIZE / s2, d2 = this.#Le(this.rotation), transf = (t3, e3) => [d2[0] * t3 + d2[2] * e3, d2[1] * t3 + d2[3] * e3], c2 = this.#Le(360 - this.rotation);
    let u2, p2, g2 = false, m2 = false;
    switch (t2) {
      case "topLeft":
        g2 = true;
        u2 = (t3, e3) => [0, 0];
        p2 = (t3, e3) => [t3, e3];
        break;
      case "topMiddle":
        u2 = (t3, e3) => [t3 / 2, 0];
        p2 = (t3, e3) => [t3 / 2, e3];
        break;
      case "topRight":
        g2 = true;
        u2 = (t3, e3) => [t3, 0];
        p2 = (t3, e3) => [0, e3];
        break;
      case "middleRight":
        m2 = true;
        u2 = (t3, e3) => [t3, e3 / 2];
        p2 = (t3, e3) => [0, e3 / 2];
        break;
      case "bottomRight":
        g2 = true;
        u2 = (t3, e3) => [t3, e3];
        p2 = (t3, e3) => [0, 0];
        break;
      case "bottomMiddle":
        u2 = (t3, e3) => [t3 / 2, e3];
        p2 = (t3, e3) => [t3 / 2, 0];
        break;
      case "bottomLeft":
        g2 = true;
        u2 = (t3, e3) => [0, e3];
        p2 = (t3, e3) => [t3, 0];
        break;
      case "middleLeft":
        m2 = true;
        u2 = (t3, e3) => [0, e3 / 2];
        p2 = (t3, e3) => [t3, e3 / 2];
    }
    const f2 = u2(r2, o2), b2 = p2(r2, o2);
    let A2 = transf(...b2);
    const w2 = _AnnotationEditor._round(n2 + A2[0]), v2 = _AnnotationEditor._round(a2 + A2[1]);
    let y2, x2, _2 = 1, E2 = 1;
    if (e2.fromKeyboard) ({ deltaX: y2, deltaY: x2 } = e2);
    else {
      const { screenX: t3, screenY: i3 } = e2, [s3, n3] = this.#fe;
      [y2, x2] = this.screenToPageTranslation(t3 - s3, i3 - n3);
      this.#fe[0] = t3;
      this.#fe[1] = i3;
    }
    [y2, x2] = (S2 = y2 / i2, C2 = x2 / s2, [c2[0] * S2 + c2[2] * C2, c2[1] * S2 + c2[3] * C2]);
    var S2, C2;
    if (g2) {
      const t3 = Math.hypot(r2, o2);
      _2 = E2 = Math.max(Math.min(Math.hypot(b2[0] - f2[0] - y2, b2[1] - f2[1] - x2) / t3, 1 / r2, 1 / o2), l2 / r2, h2 / o2);
    } else m2 ? _2 = Math.max(l2, Math.min(1, Math.abs(b2[0] - f2[0] - y2))) / r2 : E2 = Math.max(h2, Math.min(1, Math.abs(b2[1] - f2[1] - x2))) / o2;
    const T2 = _AnnotationEditor._round(r2 * _2), M2 = _AnnotationEditor._round(o2 * E2);
    A2 = transf(...p2(T2, M2));
    const P2 = w2 - A2[0], D2 = v2 - A2[1];
    this.#ye ||= [this.x, this.y, this.width, this.height];
    this.width = T2;
    this.height = M2;
    this.x = P2;
    this.y = D2;
    this.setDims(i2 * T2, s2 * M2);
    this.fixAndSetPosition();
    this._onResizing();
  }
  _onResizing() {
  }
  altTextFinish() {
    this.#o?.finish();
  }
  async addEditToolbar() {
    if (this._editToolbar || this.#_e) return this._editToolbar;
    this._editToolbar = new EditorToolbar(this);
    this.div.append(this._editToolbar.render());
    this.#o && await this._editToolbar.addAltText(this.#o);
    return this._editToolbar;
  }
  removeEditToolbar() {
    if (this._editToolbar) {
      this._editToolbar.remove();
      this._editToolbar = null;
      this.#o?.destroy();
    }
  }
  addContainer(t2) {
    const e2 = this._editToolbar?.div;
    e2 ? e2.before(t2) : this.div.append(t2);
  }
  getClientDimensions() {
    return this.div.getBoundingClientRect();
  }
  async addAltTextButton() {
    if (!this.#o) {
      AltText.initialize(_AnnotationEditor._l10n);
      this.#o = new AltText(this);
      if (this.#he) {
        this.#o.data = this.#he;
        this.#he = null;
      }
      await this.addEditToolbar();
    }
  }
  get altTextData() {
    return this.#o?.data;
  }
  set altTextData(t2) {
    this.#o && (this.#o.data = t2);
  }
  get guessedAltText() {
    return this.#o?.guessedText;
  }
  async setGuessedAltText(t2) {
    await this.#o?.setGuessedText(t2);
  }
  serializeAltText(t2) {
    return this.#o?.serialize(t2);
  }
  hasAltText() {
    return !!this.#o && !this.#o.isEmpty();
  }
  hasAltTextData() {
    return this.#o?.hasData() ?? false;
  }
  render() {
    this.div = document.createElement("div");
    this.div.setAttribute("data-editor-rotation", (360 - this.rotation) % 360);
    this.div.className = this.name;
    this.div.setAttribute("id", this.id);
    this.div.tabIndex = this.#ce ? -1 : 0;
    this._isVisible || this.div.classList.add("hidden");
    this.setInForeground();
    this.#Ue();
    const [t2, e2] = this.parentDimensions;
    if (this.parentRotation % 180 != 0) {
      this.div.style.maxWidth = `${(100 * e2 / t2).toFixed(2)}%`;
      this.div.style.maxHeight = `${(100 * t2 / e2).toFixed(2)}%`;
    }
    const [i2, s2] = this.getInitialTranslation();
    this.translate(i2, s2);
    bindEvents(this, this.div, ["pointerdown"]);
    this.isResizable && this._uiManager._supportsPinchToZoom && (this.#Pe ||= new TouchManager({ container: this.div, isPinchingDisabled: () => !this.isSelected, onPinchStart: this.#Ge.bind(this), onPinching: this.#$e.bind(this), onPinchEnd: this.#Ve.bind(this), signal: this._uiManager._signal }));
    this._uiManager._editorUndoBar?.hide();
    return this.div;
  }
  #Ge() {
    this.#be = { savedX: this.x, savedY: this.y, savedWidth: this.width, savedHeight: this.height };
    this.#o?.toggle(false);
    this.parent.togglePointerEvents(false);
  }
  #$e(t2, e2, i2) {
    let s2 = i2 / e2 * 0.7 + 1 - 0.7;
    if (1 === s2) return;
    const n2 = this.#Le(this.rotation), transf = (t3, e3) => [n2[0] * t3 + n2[2] * e3, n2[1] * t3 + n2[3] * e3], [a2, r2] = this.parentDimensions, o2 = this.x, l2 = this.y, h2 = this.width, d2 = this.height, c2 = _AnnotationEditor.MIN_SIZE / a2, u2 = _AnnotationEditor.MIN_SIZE / r2;
    s2 = Math.max(Math.min(s2, 1 / h2, 1 / d2), c2 / h2, u2 / d2);
    const p2 = _AnnotationEditor._round(h2 * s2), g2 = _AnnotationEditor._round(d2 * s2);
    if (p2 === h2 && g2 === d2) return;
    this.#ye ||= [o2, l2, h2, d2];
    const m2 = transf(h2 / 2, d2 / 2), f2 = _AnnotationEditor._round(o2 + m2[0]), b2 = _AnnotationEditor._round(l2 + m2[1]), A2 = transf(p2 / 2, g2 / 2);
    this.x = f2 - A2[0];
    this.y = b2 - A2[1];
    this.width = p2;
    this.height = g2;
    this.setDims(a2 * p2, r2 * g2);
    this.fixAndSetPosition();
    this._onResizing();
  }
  #Ve() {
    this.#o?.toggle(true);
    this.parent.togglePointerEvents(true);
    this.#He();
  }
  pointerdown(t2) {
    const { isMac: e2 } = util_FeatureTest.platform;
    if (0 !== t2.button || t2.ctrlKey && e2) t2.preventDefault();
    else {
      this.#ve = true;
      this._isDraggable ? this.#je(t2) : this.#We(t2);
    }
  }
  get isSelected() {
    return this._uiManager.isSelected(this);
  }
  #We(t2) {
    const { isMac: e2 } = util_FeatureTest.platform;
    t2.ctrlKey && !e2 || t2.shiftKey || t2.metaKey && e2 ? this.parent.toggleSelected(this) : this.parent.setSelected(this);
  }
  #je(t2) {
    const { isSelected: e2 } = this;
    this._uiManager.setUpDragSession();
    let i2 = false;
    const s2 = new AbortController(), n2 = this._uiManager.combinedSignal(s2), a2 = { capture: true, passive: false, signal: n2 }, cancelDrag = (t3) => {
      s2.abort();
      this.#ue = null;
      this.#ve = false;
      this._uiManager.endDragSession() || this.#We(t3);
      i2 && this._onStopDragging();
    };
    if (e2) {
      this.#Ce = t2.clientX;
      this.#Te = t2.clientY;
      this.#ue = t2.pointerId;
      this.#pe = t2.pointerType;
      window.addEventListener("pointermove", ((t3) => {
        if (!i2) {
          i2 = true;
          this._onStartDragging();
        }
        const { clientX: e3, clientY: s3, pointerId: n3 } = t3;
        if (n3 !== this.#ue) {
          stopEvent(t3);
          return;
        }
        const [a3, r2] = this.screenToPageTranslation(e3 - this.#Ce, s3 - this.#Te);
        this.#Ce = e3;
        this.#Te = s3;
        this._uiManager.dragSelectedEditors(a3, r2);
      }), a2);
      window.addEventListener("touchmove", stopEvent, a2);
      window.addEventListener("pointerdown", ((t3) => {
        t3.pointerType === this.#pe && (this.#Pe || t3.isPrimary) && cancelDrag(t3);
        stopEvent(t3);
      }), a2);
    }
    const pointerUpCallback = (t3) => {
      this.#ue && this.#ue !== t3.pointerId ? stopEvent(t3) : cancelDrag(t3);
    };
    window.addEventListener("pointerup", pointerUpCallback, { signal: n2 });
    window.addEventListener("blur", pointerUpCallback, { signal: n2 });
  }
  _onStartDragging() {
  }
  _onStopDragging() {
  }
  moveInDOM() {
    this.#Se && clearTimeout(this.#Se);
    this.#Se = setTimeout((() => {
      this.#Se = null;
      this.parent?.moveEditorInDOM(this);
    }), 0);
  }
  _setParentAndPosition(t2, e2, i2) {
    t2.changeParent(this);
    this.x = e2;
    this.y = i2;
    this.fixAndSetPosition();
    this._onTranslated();
  }
  getRect(t2, e2, i2 = this.rotation) {
    const s2 = this.parentScale, [n2, a2] = this.pageDimensions, [r2, o2] = this.pageTranslation, l2 = t2 / s2, h2 = e2 / s2, d2 = this.x * n2, c2 = this.y * a2, u2 = this.width * n2, p2 = this.height * a2;
    switch (i2) {
      case 0:
        return [d2 + l2 + r2, a2 - c2 - h2 - p2 + o2, d2 + l2 + u2 + r2, a2 - c2 - h2 + o2];
      case 90:
        return [d2 + h2 + r2, a2 - c2 + l2 + o2, d2 + h2 + p2 + r2, a2 - c2 + l2 + u2 + o2];
      case 180:
        return [d2 - l2 - u2 + r2, a2 - c2 + h2 + o2, d2 - l2 + r2, a2 - c2 + h2 + p2 + o2];
      case 270:
        return [d2 - h2 - p2 + r2, a2 - c2 - l2 - u2 + o2, d2 - h2 + r2, a2 - c2 - l2 + o2];
      default:
        throw new Error("Invalid rotation");
    }
  }
  getRectInCurrentCoords(t2, e2) {
    const [i2, s2, n2, a2] = t2, r2 = n2 - i2, o2 = a2 - s2;
    switch (this.rotation) {
      case 0:
        return [i2, e2 - a2, r2, o2];
      case 90:
        return [i2, e2 - s2, o2, r2];
      case 180:
        return [n2, e2 - s2, r2, o2];
      case 270:
        return [n2, e2 - a2, o2, r2];
      default:
        throw new Error("Invalid rotation");
    }
  }
  onceAdded(t2) {
  }
  isEmpty() {
    return false;
  }
  enableEditMode() {
    this.#_e = true;
  }
  disableEditMode() {
    this.#_e = false;
  }
  isInEditMode() {
    return this.#_e;
  }
  shouldGetKeyboardEvents() {
    return this.#Ee;
  }
  needsToBeRebuilt() {
    return this.div && !this.isAttachedToDOM;
  }
  get isOnScreen() {
    const { top: t2, left: e2, bottom: i2, right: s2 } = this.getClientDimensions(), { innerHeight: n2, innerWidth: a2 } = window;
    return e2 < a2 && s2 > 0 && t2 < n2 && i2 > 0;
  }
  #Ue() {
    if (this.#Ae || !this.div) return;
    this.#Ae = new AbortController();
    const t2 = this._uiManager.combinedSignal(this.#Ae);
    this.div.addEventListener("focusin", this.focusin.bind(this), { signal: t2 });
    this.div.addEventListener("focusout", this.focusout.bind(this), { signal: t2 });
  }
  rebuild() {
    this.#Ue();
  }
  rotate(t2) {
  }
  resize() {
  }
  serializeDeleted() {
    return { id: this.annotationElementId, deleted: true, pageIndex: this.pageIndex, popupRef: this._initialData?.popupRef || "" };
  }
  serialize(t2 = false, e2 = null) {
    unreachable("An editor must be serializable");
  }
  static async deserialize(t2, e2, i2) {
    const s2 = new this.prototype.constructor({ parent: e2, id: e2.getNextId(), uiManager: i2 });
    s2.rotation = t2.rotation;
    s2.#he = t2.accessibilityData;
    const [n2, a2] = s2.pageDimensions, [r2, o2, l2, h2] = s2.getRectInCurrentCoords(t2.rect, a2);
    s2.x = r2 / n2;
    s2.y = o2 / a2;
    s2.width = l2 / n2;
    s2.height = h2 / a2;
    return s2;
  }
  get hasBeenModified() {
    return !!this.annotationElementId && (this.deleted || null !== this.serialize());
  }
  remove() {
    this.#Ae?.abort();
    this.#Ae = null;
    this.isEmpty() || this.commit();
    this.parent ? this.parent.remove(this) : this._uiManager.removeEditor(this);
    if (this.#Se) {
      clearTimeout(this.#Se);
      this.#Se = null;
    }
    this.#Re();
    this.removeEditToolbar();
    if (this.#Me) {
      for (const t2 of this.#Me.values()) clearTimeout(t2);
      this.#Me = null;
    }
    this.parent = null;
    this.#Pe?.destroy();
    this.#Pe = null;
  }
  get isResizable() {
    return false;
  }
  makeResizable() {
    if (this.isResizable) {
      this.#Oe();
      this.#me.classList.remove("hidden");
      bindEvents(this, this.div, ["keydown"]);
    }
  }
  get toolbarPosition() {
    return null;
  }
  keydown(t2) {
    if (!this.isResizable || t2.target !== this.div || "Enter" !== t2.key) return;
    this._uiManager.setSelected(this);
    this.#be = { savedX: this.x, savedY: this.y, savedWidth: this.width, savedHeight: this.height };
    const e2 = this.#me.children;
    if (!this.#de) {
      this.#de = Array.from(e2);
      const t3 = this.#qe.bind(this), i3 = this.#Xe.bind(this), s3 = this._uiManager._signal;
      for (const e3 of this.#de) {
        const n3 = e3.getAttribute("data-resizer-name");
        e3.setAttribute("role", "spinbutton");
        e3.addEventListener("keydown", t3, { signal: s3 });
        e3.addEventListener("blur", i3, { signal: s3 });
        e3.addEventListener("focus", this.#Ke.bind(this, n3), { signal: s3 });
        e3.setAttribute("data-l10n-id", _AnnotationEditor._l10nResizer[n3]);
      }
    }
    const i2 = this.#de[0];
    let s2 = 0;
    for (const t3 of e2) {
      if (t3 === i2) break;
      s2++;
    }
    const n2 = (360 - this.rotation + this.parentRotation) % 360 / 90 * (this.#de.length / 4);
    if (n2 !== s2) {
      if (n2 < s2) for (let t4 = 0; t4 < s2 - n2; t4++) this.#me.append(this.#me.firstChild);
      else if (n2 > s2) for (let t4 = 0; t4 < n2 - s2; t4++) this.#me.firstChild.before(this.#me.lastChild);
      let t3 = 0;
      for (const i3 of e2) {
        const e3 = this.#de[t3++].getAttribute("data-resizer-name");
        i3.setAttribute("data-l10n-id", _AnnotationEditor._l10nResizer[e3]);
      }
    }
    this.#Ye(0);
    this.#Ee = true;
    this.#me.firstChild.focus({ focusVisible: true });
    t2.preventDefault();
    t2.stopImmediatePropagation();
  }
  #qe(t2) {
    _AnnotationEditor._resizerKeyboardManager.exec(this, t2);
  }
  #Xe(t2) {
    this.#Ee && t2.relatedTarget?.parentNode !== this.#me && this.#Re();
  }
  #Ke(t2) {
    this.#we = this.#Ee ? t2 : "";
  }
  #Ye(t2) {
    if (this.#de) for (const e2 of this.#de) e2.tabIndex = t2;
  }
  _resizeWithKeyboard(t2, e2) {
    this.#Ee && this.#Be(this.#we, { deltaX: t2, deltaY: e2, fromKeyboard: true });
  }
  #Re() {
    this.#Ee = false;
    this.#Ye(-1);
    this.#He();
  }
  _stopResizingWithKeyboard() {
    this.#Re();
    this.div.focus();
  }
  select() {
    this.makeResizable();
    this.div?.classList.add("selectedEditor");
    if (this._editToolbar) {
      this._editToolbar?.show();
      this.#o?.toggleAltTextBadge(false);
    } else this.addEditToolbar().then((() => {
      this.div?.classList.contains("selectedEditor") && this._editToolbar?.show();
    }));
  }
  unselect() {
    this.#me?.classList.add("hidden");
    this.div?.classList.remove("selectedEditor");
    this.div?.contains(document.activeElement) && this._uiManager.currentLayer.div.focus({ preventScroll: true });
    this._editToolbar?.hide();
    this.#o?.toggleAltTextBadge(true);
  }
  updateParams(t2, e2) {
  }
  disableEditing() {
  }
  enableEditing() {
  }
  enterInEditMode() {
  }
  getImageForAltText() {
    return null;
  }
  get contentDiv() {
    return this.div;
  }
  get isEditing() {
    return this.#xe;
  }
  set isEditing(t2) {
    this.#xe = t2;
    if (this.parent) if (t2) {
      this.parent.setSelected(this);
      this.parent.setActiveEditor(this);
    } else this.parent.setActiveEditor(null);
  }
  setAspectRatio(t2, e2) {
    this.#ge = true;
    const i2 = t2 / e2, { style: s2 } = this.div;
    s2.aspectRatio = i2;
    s2.height = "auto";
  }
  static get MIN_SIZE() {
    return 16;
  }
  static canCreateNewEmptyEditor() {
    return true;
  }
  get telemetryInitialData() {
    return { action: "added" };
  }
  get telemetryFinalData() {
    return null;
  }
  _reportTelemetry(t2, e2 = false) {
    if (e2) {
      this.#Me ||= /* @__PURE__ */ new Map();
      const { action: e3 } = t2;
      let i2 = this.#Me.get(e3);
      i2 && clearTimeout(i2);
      i2 = setTimeout((() => {
        this._reportTelemetry(t2);
        this.#Me.delete(e3);
        0 === this.#Me.size && (this.#Me = null);
      }), _AnnotationEditor._telemetryTimeout);
      this.#Me.set(e3, i2);
    } else {
      t2.type ||= this.editorType;
      this._uiManager._eventBus.dispatch("reporttelemetry", { source: this, details: { type: "editing", data: t2 } });
    }
  }
  show(t2 = this._isVisible) {
    this.div.classList.toggle("hidden", !t2);
    this._isVisible = t2;
  }
  enable() {
    this.div && (this.div.tabIndex = 0);
    this.#ce = false;
  }
  disable() {
    this.div && (this.div.tabIndex = -1);
    this.#ce = true;
  }
  renderAnnotationElement(t2) {
    let e2 = t2.container.querySelector(".annotationContent");
    if (e2) {
      if ("CANVAS" === e2.nodeName) {
        const t3 = e2;
        e2 = document.createElement("div");
        e2.classList.add("annotationContent", this.editorType);
        t3.before(e2);
      }
    } else {
      e2 = document.createElement("div");
      e2.classList.add("annotationContent", this.editorType);
      t2.container.prepend(e2);
    }
    return e2;
  }
  resetAnnotationElement(t2) {
    const { firstChild: e2 } = t2.container;
    "DIV" === e2?.nodeName && e2.classList.contains("annotationContent") && e2.remove();
  }
};
var FakeEditor = class extends AnnotationEditor {
  constructor(t2) {
    super(t2);
    this.annotationElementId = t2.annotationElementId;
    this.deleted = true;
  }
  serialize() {
    return this.serializeDeleted();
  }
};
var st = 3285377520;
var nt = 4294901760;
var at = 65535;
var MurmurHash3_64 = class {
  constructor(t2) {
    this.h1 = t2 ? 4294967295 & t2 : st;
    this.h2 = t2 ? 4294967295 & t2 : st;
  }
  update(t2) {
    let e2, i2;
    if ("string" == typeof t2) {
      e2 = new Uint8Array(2 * t2.length);
      i2 = 0;
      for (let s3 = 0, n3 = t2.length; s3 < n3; s3++) {
        const n4 = t2.charCodeAt(s3);
        if (n4 <= 255) e2[i2++] = n4;
        else {
          e2[i2++] = n4 >>> 8;
          e2[i2++] = 255 & n4;
        }
      }
    } else {
      if (!ArrayBuffer.isView(t2)) throw new Error("Invalid data format, must be a string or TypedArray.");
      e2 = t2.slice();
      i2 = e2.byteLength;
    }
    const s2 = i2 >> 2, n2 = i2 - 4 * s2, a2 = new Uint32Array(e2.buffer, 0, s2);
    let r2 = 0, o2 = 0, l2 = this.h1, h2 = this.h2;
    const d2 = 3432918353, c2 = 461845907, u2 = 11601, p2 = 13715;
    for (let t3 = 0; t3 < s2; t3++) if (1 & t3) {
      r2 = a2[t3];
      r2 = r2 * d2 & nt | r2 * u2 & at;
      r2 = r2 << 15 | r2 >>> 17;
      r2 = r2 * c2 & nt | r2 * p2 & at;
      l2 ^= r2;
      l2 = l2 << 13 | l2 >>> 19;
      l2 = 5 * l2 + 3864292196;
    } else {
      o2 = a2[t3];
      o2 = o2 * d2 & nt | o2 * u2 & at;
      o2 = o2 << 15 | o2 >>> 17;
      o2 = o2 * c2 & nt | o2 * p2 & at;
      h2 ^= o2;
      h2 = h2 << 13 | h2 >>> 19;
      h2 = 5 * h2 + 3864292196;
    }
    r2 = 0;
    switch (n2) {
      case 3:
        r2 ^= e2[4 * s2 + 2] << 16;
      case 2:
        r2 ^= e2[4 * s2 + 1] << 8;
      case 1:
        r2 ^= e2[4 * s2];
        r2 = r2 * d2 & nt | r2 * u2 & at;
        r2 = r2 << 15 | r2 >>> 17;
        r2 = r2 * c2 & nt | r2 * p2 & at;
        1 & s2 ? l2 ^= r2 : h2 ^= r2;
    }
    this.h1 = l2;
    this.h2 = h2;
  }
  hexdigest() {
    let t2 = this.h1, e2 = this.h2;
    t2 ^= e2 >>> 1;
    t2 = 3981806797 * t2 & nt | 36045 * t2 & at;
    e2 = 4283543511 * e2 & nt | (2950163797 * (e2 << 16 | t2 >>> 16) & nt) >>> 16;
    t2 ^= e2 >>> 1;
    t2 = 444984403 * t2 & nt | 60499 * t2 & at;
    e2 = 3301882366 * e2 & nt | (3120437893 * (e2 << 16 | t2 >>> 16) & nt) >>> 16;
    t2 ^= e2 >>> 1;
    return (t2 >>> 0).toString(16).padStart(8, "0") + (e2 >>> 0).toString(16).padStart(8, "0");
  }
};
var rt = Object.freeze({ map: null, hash: "", transfer: void 0 });
var AnnotationStorage = class {
  #Qe = false;
  #Je = null;
  #Ze = /* @__PURE__ */ new Map();
  constructor() {
    this.onSetModified = null;
    this.onResetModified = null;
    this.onAnnotationEditor = null;
  }
  getValue(t2, e2) {
    const i2 = this.#Ze.get(t2);
    return void 0 === i2 ? e2 : Object.assign(e2, i2);
  }
  getRawValue(t2) {
    return this.#Ze.get(t2);
  }
  remove(t2) {
    this.#Ze.delete(t2);
    0 === this.#Ze.size && this.resetModified();
    if ("function" == typeof this.onAnnotationEditor) {
      for (const t3 of this.#Ze.values()) if (t3 instanceof AnnotationEditor) return;
      this.onAnnotationEditor(null);
    }
  }
  setValue(t2, e2) {
    const i2 = this.#Ze.get(t2);
    let s2 = false;
    if (void 0 !== i2) {
      for (const [t3, n2] of Object.entries(e2)) if (i2[t3] !== n2) {
        s2 = true;
        i2[t3] = n2;
      }
    } else {
      s2 = true;
      this.#Ze.set(t2, e2);
    }
    s2 && this.#ti();
    e2 instanceof AnnotationEditor && "function" == typeof this.onAnnotationEditor && this.onAnnotationEditor(e2.constructor._type);
  }
  has(t2) {
    return this.#Ze.has(t2);
  }
  getAll() {
    return this.#Ze.size > 0 ? objectFromMap(this.#Ze) : null;
  }
  setAll(t2) {
    for (const [e2, i2] of Object.entries(t2)) this.setValue(e2, i2);
  }
  get size() {
    return this.#Ze.size;
  }
  #ti() {
    if (!this.#Qe) {
      this.#Qe = true;
      "function" == typeof this.onSetModified && this.onSetModified();
    }
  }
  resetModified() {
    if (this.#Qe) {
      this.#Qe = false;
      "function" == typeof this.onResetModified && this.onResetModified();
    }
  }
  get print() {
    return new PrintAnnotationStorage(this);
  }
  get serializable() {
    if (0 === this.#Ze.size) return rt;
    const t2 = /* @__PURE__ */ new Map(), e2 = new MurmurHash3_64(), i2 = [], s2 = /* @__PURE__ */ Object.create(null);
    let n2 = false;
    for (const [i3, a2] of this.#Ze) {
      const r2 = a2 instanceof AnnotationEditor ? a2.serialize(false, s2) : a2;
      if (r2) {
        t2.set(i3, r2);
        e2.update(`${i3}:${JSON.stringify(r2)}`);
        n2 ||= !!r2.bitmap;
      }
    }
    if (n2) for (const e3 of t2.values()) e3.bitmap && i2.push(e3.bitmap);
    return t2.size > 0 ? { map: t2, hash: e2.hexdigest(), transfer: i2 } : rt;
  }
  get editorStats() {
    let t2 = null;
    const e2 = /* @__PURE__ */ new Map();
    for (const i2 of this.#Ze.values()) {
      if (!(i2 instanceof AnnotationEditor)) continue;
      const s2 = i2.telemetryFinalData;
      if (!s2) continue;
      const { type: n2 } = s2;
      e2.has(n2) || e2.set(n2, Object.getPrototypeOf(i2).constructor);
      t2 ||= /* @__PURE__ */ Object.create(null);
      const a2 = t2[n2] ||= /* @__PURE__ */ new Map();
      for (const [t3, e3] of Object.entries(s2)) {
        if ("type" === t3) continue;
        let i3 = a2.get(t3);
        if (!i3) {
          i3 = /* @__PURE__ */ new Map();
          a2.set(t3, i3);
        }
        const s3 = i3.get(e3) ?? 0;
        i3.set(e3, s3 + 1);
      }
    }
    for (const [i2, s2] of e2) t2[i2] = s2.computeTelemetryFinalData(t2[i2]);
    return t2;
  }
  resetModifiedIds() {
    this.#Je = null;
  }
  get modifiedIds() {
    if (this.#Je) return this.#Je;
    const t2 = [];
    for (const e2 of this.#Ze.values()) e2 instanceof AnnotationEditor && e2.annotationElementId && e2.serialize() && t2.push(e2.annotationElementId);
    return this.#Je = { ids: new Set(t2), hash: t2.join(",") };
  }
};
var PrintAnnotationStorage = class extends AnnotationStorage {
  #ei;
  constructor(t2) {
    super();
    const { map: e2, hash: i2, transfer: s2 } = t2.serializable, n2 = structuredClone(e2, s2 ? { transfer: s2 } : null);
    this.#ei = { map: n2, hash: i2, transfer: s2 };
  }
  get print() {
    unreachable("Should not call PrintAnnotationStorage.print");
  }
  get serializable() {
    return this.#ei;
  }
  get modifiedIds() {
    return shadow(this, "modifiedIds", { ids: /* @__PURE__ */ new Set(), hash: "" });
  }
};
var FontLoader = class {
  #ii = /* @__PURE__ */ new Set();
  constructor({ ownerDocument: t2 = globalThis.document, styleElement: e2 = null }) {
    this._document = t2;
    this.nativeFontFaces = /* @__PURE__ */ new Set();
    this.styleElement = null;
    this.loadingRequests = [];
    this.loadTestFontId = 0;
  }
  addNativeFontFace(t2) {
    this.nativeFontFaces.add(t2);
    this._document.fonts.add(t2);
  }
  removeNativeFontFace(t2) {
    this.nativeFontFaces.delete(t2);
    this._document.fonts.delete(t2);
  }
  insertRule(t2) {
    if (!this.styleElement) {
      this.styleElement = this._document.createElement("style");
      this._document.documentElement.getElementsByTagName("head")[0].append(this.styleElement);
    }
    const e2 = this.styleElement.sheet;
    e2.insertRule(t2, e2.cssRules.length);
  }
  clear() {
    for (const t2 of this.nativeFontFaces) this._document.fonts.delete(t2);
    this.nativeFontFaces.clear();
    this.#ii.clear();
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
  async loadSystemFont({ systemFontInfo: t2, _inspectFont: e2 }) {
    if (t2 && !this.#ii.has(t2.loadedName)) {
      assert(!this.disableFontFace, "loadSystemFont shouldn't be called when `disableFontFace` is set.");
      if (this.isFontLoadingAPISupported) {
        const { loadedName: i2, src: s2, style: n2 } = t2, a2 = new FontFace(i2, s2, n2);
        this.addNativeFontFace(a2);
        try {
          await a2.load();
          this.#ii.add(i2);
          e2?.(t2);
        } catch {
          warn(`Cannot load system font: ${t2.baseFontName}, installing it could help to improve PDF rendering.`);
          this.removeNativeFontFace(a2);
        }
      } else unreachable("Not implemented: loadSystemFont without the Font Loading API.");
    }
  }
  async bind(t2) {
    if (t2.attached || t2.missingFile && !t2.systemFontInfo) return;
    t2.attached = true;
    if (t2.systemFontInfo) {
      await this.loadSystemFont(t2);
      return;
    }
    if (this.isFontLoadingAPISupported) {
      const e3 = t2.createNativeFontFace();
      if (e3) {
        this.addNativeFontFace(e3);
        try {
          await e3.loaded;
        } catch (i2) {
          warn(`Failed to load font '${e3.family}': '${i2}'.`);
          t2.disableFontFace = true;
          throw i2;
        }
      }
      return;
    }
    const e2 = t2.createFontFaceRule();
    if (e2) {
      this.insertRule(e2);
      if (this.isSyncFontLoadingSupported) return;
      await new Promise(((e3) => {
        const i2 = this._queueLoadingCallback(e3);
        this._prepareFontLoadEvent(t2, i2);
      }));
    }
  }
  get isFontLoadingAPISupported() {
    return shadow(this, "isFontLoadingAPISupported", !!this._document?.fonts);
  }
  get isSyncFontLoadingSupported() {
    let t2 = false;
    (e || "undefined" != typeof navigator && "string" == typeof navigator?.userAgent && /Mozilla\/5.0.*?rv:\d+.*? Gecko/.test(navigator.userAgent)) && (t2 = true);
    return shadow(this, "isSyncFontLoadingSupported", t2);
  }
  _queueLoadingCallback(t2) {
    const { loadingRequests: e2 } = this, i2 = { done: false, complete: function completeRequest() {
      assert(!i2.done, "completeRequest() cannot be called twice.");
      i2.done = true;
      for (; e2.length > 0 && e2[0].done; ) {
        const t3 = e2.shift();
        setTimeout(t3.callback, 0);
      }
    }, callback: t2 };
    e2.push(i2);
    return i2;
  }
  get _loadTestFont() {
    return shadow(this, "_loadTestFont", atob("T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQAABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwAAAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbmFtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAAAADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAAMQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAAAAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAAAAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQAAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMAAQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAAEAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgcA/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQAAAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAgABAAAAAAAAAAAD6AAAAAAAAA=="));
  }
  _prepareFontLoadEvent(t2, e2) {
    function int32(t3, e3) {
      return t3.charCodeAt(e3) << 24 | t3.charCodeAt(e3 + 1) << 16 | t3.charCodeAt(e3 + 2) << 8 | 255 & t3.charCodeAt(e3 + 3);
    }
    function spliceString(t3, e3, i3, s3) {
      return t3.substring(0, e3) + s3 + t3.substring(e3 + i3);
    }
    let i2, s2;
    const n2 = this._document.createElement("canvas");
    n2.width = 1;
    n2.height = 1;
    const a2 = n2.getContext("2d");
    let r2 = 0;
    const o2 = `lt${Date.now()}${this.loadTestFontId++}`;
    let l2 = this._loadTestFont;
    l2 = spliceString(l2, 976, o2.length, o2);
    const h2 = 1482184792;
    let d2 = int32(l2, 16);
    for (i2 = 0, s2 = o2.length - 3; i2 < s2; i2 += 4) d2 = d2 - h2 + int32(o2, i2) | 0;
    i2 < o2.length && (d2 = d2 - h2 + int32(o2 + "XXX", i2) | 0);
    l2 = spliceString(l2, 16, 4, (function string32(t3) {
      return String.fromCharCode(t3 >> 24 & 255, t3 >> 16 & 255, t3 >> 8 & 255, 255 & t3);
    })(d2));
    const c2 = `@font-face {font-family:"${o2}";src:${`url(data:font/opentype;base64,${btoa(l2)});`}}`;
    this.insertRule(c2);
    const u2 = this._document.createElement("div");
    u2.style.visibility = "hidden";
    u2.style.width = u2.style.height = "10px";
    u2.style.position = "absolute";
    u2.style.top = u2.style.left = "0px";
    for (const e3 of [t2.loadedName, o2]) {
      const t3 = this._document.createElement("span");
      t3.textContent = "Hi";
      t3.style.fontFamily = e3;
      u2.append(t3);
    }
    this._document.body.append(u2);
    !(function isFontReady(t3, e3) {
      if (++r2 > 30) {
        warn("Load test font never loaded.");
        e3();
        return;
      }
      a2.font = "30px " + t3;
      a2.fillText(".", 0, 20);
      a2.getImageData(0, 0, 1, 1).data[3] > 0 ? e3() : setTimeout(isFontReady.bind(null, t3, e3));
    })(o2, (() => {
      u2.remove();
      e2.complete();
    }));
  }
};
var FontFaceObject = class {
  constructor(t2, { disableFontFace: e2 = false, fontExtraProperties: i2 = false, inspectFont: s2 = null }) {
    this.compiledGlyphs = /* @__PURE__ */ Object.create(null);
    for (const e3 in t2) this[e3] = t2[e3];
    this.disableFontFace = true === e2;
    this.fontExtraProperties = true === i2;
    this._inspectFont = s2;
  }
  createNativeFontFace() {
    if (!this.data || this.disableFontFace) return null;
    let t2;
    if (this.cssFontInfo) {
      const e2 = { weight: this.cssFontInfo.fontWeight };
      this.cssFontInfo.italicAngle && (e2.style = `oblique ${this.cssFontInfo.italicAngle}deg`);
      t2 = new FontFace(this.cssFontInfo.fontFamily, this.data, e2);
    } else t2 = new FontFace(this.loadedName, this.data, {});
    this._inspectFont?.(this);
    return t2;
  }
  createFontFaceRule() {
    if (!this.data || this.disableFontFace) return null;
    const t2 = `url(data:${this.mimetype};base64,${(function toBase64Util(t3) {
      return Uint8Array.prototype.toBase64 ? t3.toBase64() : btoa(bytesToString(t3));
    })(this.data)});`;
    let e2;
    if (this.cssFontInfo) {
      let i2 = `font-weight: ${this.cssFontInfo.fontWeight};`;
      this.cssFontInfo.italicAngle && (i2 += `font-style: oblique ${this.cssFontInfo.italicAngle}deg;`);
      e2 = `@font-face {font-family:"${this.cssFontInfo.fontFamily}";${i2}src:${t2}}`;
    } else e2 = `@font-face {font-family:"${this.loadedName}";src:${t2}}`;
    this._inspectFont?.(this, t2);
    return e2;
  }
  getPathGenerator(t2, e2) {
    if (void 0 !== this.compiledGlyphs[e2]) return this.compiledGlyphs[e2];
    const i2 = this.loadedName + "_path_" + e2;
    let s2;
    try {
      s2 = t2.get(i2);
    } catch (t3) {
      warn(`getPathGenerator - ignoring character: "${t3}".`);
    }
    const n2 = new Path2D(s2 || "");
    this.fontExtraProperties || t2.delete(i2);
    return this.compiledGlyphs[e2] = n2;
  }
};
var ot = 1;
var lt = 2;
var ht = 1;
var dt = 2;
var ct = 3;
var ut = 4;
var pt = 5;
var gt = 6;
var mt = 7;
var ft = 8;
function onFn() {
}
function wrapReason(t2) {
  if (t2 instanceof AbortException || t2 instanceof InvalidPDFException || t2 instanceof MissingPDFException || t2 instanceof PasswordException || t2 instanceof UnexpectedResponseException || t2 instanceof UnknownErrorException) return t2;
  t2 instanceof Error || "object" == typeof t2 && null !== t2 || unreachable('wrapReason: Expected "reason" to be a (possibly cloned) Error.');
  switch (t2.name) {
    case "AbortException":
      return new AbortException(t2.message);
    case "InvalidPDFException":
      return new InvalidPDFException(t2.message);
    case "MissingPDFException":
      return new MissingPDFException(t2.message);
    case "PasswordException":
      return new PasswordException(t2.message, t2.code);
    case "UnexpectedResponseException":
      return new UnexpectedResponseException(t2.message, t2.status);
    case "UnknownErrorException":
      return new UnknownErrorException(t2.message, t2.details);
  }
  return new UnknownErrorException(t2.message, t2.toString());
}
var MessageHandler = class {
  #si = new AbortController();
  constructor(t2, e2, i2) {
    this.sourceName = t2;
    this.targetName = e2;
    this.comObj = i2;
    this.callbackId = 1;
    this.streamId = 1;
    this.streamSinks = /* @__PURE__ */ Object.create(null);
    this.streamControllers = /* @__PURE__ */ Object.create(null);
    this.callbackCapabilities = /* @__PURE__ */ Object.create(null);
    this.actionHandler = /* @__PURE__ */ Object.create(null);
    i2.addEventListener("message", this.#ni.bind(this), { signal: this.#si.signal });
  }
  #ni({ data: t2 }) {
    if (t2.targetName !== this.sourceName) return;
    if (t2.stream) {
      this.#ai(t2);
      return;
    }
    if (t2.callback) {
      const e3 = t2.callbackId, i2 = this.callbackCapabilities[e3];
      if (!i2) throw new Error(`Cannot resolve callback ${e3}`);
      delete this.callbackCapabilities[e3];
      if (t2.callback === ot) i2.resolve(t2.data);
      else {
        if (t2.callback !== lt) throw new Error("Unexpected callback case");
        i2.reject(wrapReason(t2.reason));
      }
      return;
    }
    const e2 = this.actionHandler[t2.action];
    if (!e2) throw new Error(`Unknown action from worker: ${t2.action}`);
    if (t2.callbackId) {
      const i2 = this.sourceName, s2 = t2.sourceName, n2 = this.comObj;
      Promise.try(e2, t2.data).then((function(e3) {
        n2.postMessage({ sourceName: i2, targetName: s2, callback: ot, callbackId: t2.callbackId, data: e3 });
      }), (function(e3) {
        n2.postMessage({ sourceName: i2, targetName: s2, callback: lt, callbackId: t2.callbackId, reason: wrapReason(e3) });
      }));
    } else t2.streamId ? this.#ri(t2) : e2(t2.data);
  }
  on(t2, e2) {
    const i2 = this.actionHandler;
    if (i2[t2]) throw new Error(`There is already an actionName called "${t2}"`);
    i2[t2] = e2;
  }
  send(t2, e2, i2) {
    this.comObj.postMessage({ sourceName: this.sourceName, targetName: this.targetName, action: t2, data: e2 }, i2);
  }
  sendWithPromise(t2, e2, i2) {
    const s2 = this.callbackId++, n2 = Promise.withResolvers();
    this.callbackCapabilities[s2] = n2;
    try {
      this.comObj.postMessage({ sourceName: this.sourceName, targetName: this.targetName, action: t2, callbackId: s2, data: e2 }, i2);
    } catch (t3) {
      n2.reject(t3);
    }
    return n2.promise;
  }
  sendWithStream(t2, e2, i2, s2) {
    const n2 = this.streamId++, a2 = this.sourceName, r2 = this.targetName, o2 = this.comObj;
    return new ReadableStream({ start: (i3) => {
      const l2 = Promise.withResolvers();
      this.streamControllers[n2] = { controller: i3, startCall: l2, pullCall: null, cancelCall: null, isClosed: false };
      o2.postMessage({ sourceName: a2, targetName: r2, action: t2, streamId: n2, data: e2, desiredSize: i3.desiredSize }, s2);
      return l2.promise;
    }, pull: (t3) => {
      const e3 = Promise.withResolvers();
      this.streamControllers[n2].pullCall = e3;
      o2.postMessage({ sourceName: a2, targetName: r2, stream: gt, streamId: n2, desiredSize: t3.desiredSize });
      return e3.promise;
    }, cancel: (t3) => {
      assert(t3 instanceof Error, "cancel must have a valid reason");
      const e3 = Promise.withResolvers();
      this.streamControllers[n2].cancelCall = e3;
      this.streamControllers[n2].isClosed = true;
      o2.postMessage({ sourceName: a2, targetName: r2, stream: ht, streamId: n2, reason: wrapReason(t3) });
      return e3.promise;
    } }, i2);
  }
  #ri(t2) {
    const e2 = t2.streamId, i2 = this.sourceName, s2 = t2.sourceName, n2 = this.comObj, a2 = this, r2 = this.actionHandler[t2.action], o2 = { enqueue(t3, a3 = 1, r3) {
      if (this.isCancelled) return;
      const o3 = this.desiredSize;
      this.desiredSize -= a3;
      if (o3 > 0 && this.desiredSize <= 0) {
        this.sinkCapability = Promise.withResolvers();
        this.ready = this.sinkCapability.promise;
      }
      n2.postMessage({ sourceName: i2, targetName: s2, stream: ut, streamId: e2, chunk: t3 }, r3);
    }, close() {
      if (!this.isCancelled) {
        this.isCancelled = true;
        n2.postMessage({ sourceName: i2, targetName: s2, stream: ct, streamId: e2 });
        delete a2.streamSinks[e2];
      }
    }, error(t3) {
      assert(t3 instanceof Error, "error must have a valid reason");
      if (!this.isCancelled) {
        this.isCancelled = true;
        n2.postMessage({ sourceName: i2, targetName: s2, stream: pt, streamId: e2, reason: wrapReason(t3) });
      }
    }, sinkCapability: Promise.withResolvers(), onPull: null, onCancel: null, isCancelled: false, desiredSize: t2.desiredSize, ready: null };
    o2.sinkCapability.resolve();
    o2.ready = o2.sinkCapability.promise;
    this.streamSinks[e2] = o2;
    Promise.try(r2, t2.data, o2).then((function() {
      n2.postMessage({ sourceName: i2, targetName: s2, stream: ft, streamId: e2, success: true });
    }), (function(t3) {
      n2.postMessage({ sourceName: i2, targetName: s2, stream: ft, streamId: e2, reason: wrapReason(t3) });
    }));
  }
  #ai(t2) {
    const e2 = t2.streamId, i2 = this.sourceName, s2 = t2.sourceName, n2 = this.comObj, a2 = this.streamControllers[e2], r2 = this.streamSinks[e2];
    switch (t2.stream) {
      case ft:
        t2.success ? a2.startCall.resolve() : a2.startCall.reject(wrapReason(t2.reason));
        break;
      case mt:
        t2.success ? a2.pullCall.resolve() : a2.pullCall.reject(wrapReason(t2.reason));
        break;
      case gt:
        if (!r2) {
          n2.postMessage({ sourceName: i2, targetName: s2, stream: mt, streamId: e2, success: true });
          break;
        }
        r2.desiredSize <= 0 && t2.desiredSize > 0 && r2.sinkCapability.resolve();
        r2.desiredSize = t2.desiredSize;
        Promise.try(r2.onPull || onFn).then((function() {
          n2.postMessage({ sourceName: i2, targetName: s2, stream: mt, streamId: e2, success: true });
        }), (function(t3) {
          n2.postMessage({ sourceName: i2, targetName: s2, stream: mt, streamId: e2, reason: wrapReason(t3) });
        }));
        break;
      case ut:
        assert(a2, "enqueue should have stream controller");
        if (a2.isClosed) break;
        a2.controller.enqueue(t2.chunk);
        break;
      case ct:
        assert(a2, "close should have stream controller");
        if (a2.isClosed) break;
        a2.isClosed = true;
        a2.controller.close();
        this.#oi(a2, e2);
        break;
      case pt:
        assert(a2, "error should have stream controller");
        a2.controller.error(wrapReason(t2.reason));
        this.#oi(a2, e2);
        break;
      case dt:
        t2.success ? a2.cancelCall.resolve() : a2.cancelCall.reject(wrapReason(t2.reason));
        this.#oi(a2, e2);
        break;
      case ht:
        if (!r2) break;
        const o2 = wrapReason(t2.reason);
        Promise.try(r2.onCancel || onFn, o2).then((function() {
          n2.postMessage({ sourceName: i2, targetName: s2, stream: dt, streamId: e2, success: true });
        }), (function(t3) {
          n2.postMessage({ sourceName: i2, targetName: s2, stream: dt, streamId: e2, reason: wrapReason(t3) });
        }));
        r2.sinkCapability.reject(o2);
        r2.isCancelled = true;
        delete this.streamSinks[e2];
        break;
      default:
        throw new Error("Unexpected stream case");
    }
  }
  async #oi(t2, e2) {
    await Promise.allSettled([t2.startCall?.promise, t2.pullCall?.promise, t2.cancelCall?.promise]);
    delete this.streamControllers[e2];
  }
  destroy() {
    this.#si?.abort();
    this.#si = null;
  }
};
var BaseCanvasFactory = class {
  #li = false;
  constructor({ enableHWA: t2 = false }) {
    this.#li = t2;
  }
  create(t2, e2) {
    if (t2 <= 0 || e2 <= 0) throw new Error("Invalid canvas size");
    const i2 = this._createCanvas(t2, e2);
    return { canvas: i2, context: i2.getContext("2d", { willReadFrequently: !this.#li }) };
  }
  reset(t2, e2, i2) {
    if (!t2.canvas) throw new Error("Canvas is not specified");
    if (e2 <= 0 || i2 <= 0) throw new Error("Invalid canvas size");
    t2.canvas.width = e2;
    t2.canvas.height = i2;
  }
  destroy(t2) {
    if (!t2.canvas) throw new Error("Canvas is not specified");
    t2.canvas.width = 0;
    t2.canvas.height = 0;
    t2.canvas = null;
    t2.context = null;
  }
  _createCanvas(t2, e2) {
    unreachable("Abstract method `_createCanvas` called.");
  }
};
var BaseCMapReaderFactory = class {
  constructor({ baseUrl: t2 = null, isCompressed: e2 = true }) {
    this.baseUrl = t2;
    this.isCompressed = e2;
  }
  async fetch({ name: t2 }) {
    if (!this.baseUrl) throw new Error("Ensure that the `cMapUrl` and `cMapPacked` API parameters are provided.");
    if (!t2) throw new Error("CMap name must be specified.");
    const e2 = this.baseUrl + t2 + (this.isCompressed ? ".bcmap" : "");
    return this._fetch(e2).then(((t3) => ({ cMapData: t3, isCompressed: this.isCompressed }))).catch(((t3) => {
      throw new Error(`Unable to load ${this.isCompressed ? "binary " : ""}CMap at: ${e2}`);
    }));
  }
  async _fetch(t2) {
    unreachable("Abstract method `_fetch` called.");
  }
};
var DOMCMapReaderFactory = class extends BaseCMapReaderFactory {
  async _fetch(t2) {
    const e2 = await fetchData(t2, this.isCompressed ? "arraybuffer" : "text");
    return e2 instanceof ArrayBuffer ? new Uint8Array(e2) : stringToBytes(e2);
  }
};
var BaseFilterFactory = class {
  addFilter(t2) {
    return "none";
  }
  addHCMFilter(t2, e2) {
    return "none";
  }
  addAlphaFilter(t2) {
    return "none";
  }
  addLuminosityFilter(t2) {
    return "none";
  }
  addHighlightHCMFilter(t2, e2, i2, s2, n2) {
    return "none";
  }
  destroy(t2 = false) {
  }
};
var BaseStandardFontDataFactory = class {
  constructor({ baseUrl: t2 = null }) {
    this.baseUrl = t2;
  }
  async fetch({ filename: t2 }) {
    if (!this.baseUrl) throw new Error("Ensure that the `standardFontDataUrl` API parameter is provided.");
    if (!t2) throw new Error("Font filename must be specified.");
    const e2 = `${this.baseUrl}${t2}`;
    return this._fetch(e2).catch(((t3) => {
      throw new Error(`Unable to load font data at: ${e2}`);
    }));
  }
  async _fetch(t2) {
    unreachable("Abstract method `_fetch` called.");
  }
};
var DOMStandardFontDataFactory = class extends BaseStandardFontDataFactory {
  async _fetch(t2) {
    const e2 = await fetchData(t2, "arraybuffer");
    return new Uint8Array(e2);
  }
};
e && warn("Please use the `legacy` build in Node.js environments.");
async function node_utils_fetchData(t2) {
  const e2 = process.getBuiltinModule("fs"), i2 = await e2.promises.readFile(t2);
  return new Uint8Array(i2);
}
var bt = "Fill";
var At = "Stroke";
var wt = "Shading";
function applyBoundingBox(t2, e2) {
  if (!e2) return;
  const i2 = e2[2] - e2[0], s2 = e2[3] - e2[1], n2 = new Path2D();
  n2.rect(e2[0], e2[1], i2, s2);
  t2.clip(n2);
}
var BaseShadingPattern = class {
  getPattern() {
    unreachable("Abstract method `getPattern` called.");
  }
};
var RadialAxialShadingPattern = class extends BaseShadingPattern {
  constructor(t2) {
    super();
    this._type = t2[1];
    this._bbox = t2[2];
    this._colorStops = t2[3];
    this._p0 = t2[4];
    this._p1 = t2[5];
    this._r0 = t2[6];
    this._r1 = t2[7];
    this.matrix = null;
  }
  _createGradient(t2) {
    let e2;
    "axial" === this._type ? e2 = t2.createLinearGradient(this._p0[0], this._p0[1], this._p1[0], this._p1[1]) : "radial" === this._type && (e2 = t2.createRadialGradient(this._p0[0], this._p0[1], this._r0, this._p1[0], this._p1[1], this._r1));
    for (const t3 of this._colorStops) e2.addColorStop(t3[0], t3[1]);
    return e2;
  }
  getPattern(t2, e2, i2, s2) {
    let n2;
    if (s2 === At || s2 === bt) {
      const a2 = e2.current.getClippedPathBoundingBox(s2, getCurrentTransform(t2)) || [0, 0, 0, 0], r2 = Math.ceil(a2[2] - a2[0]) || 1, o2 = Math.ceil(a2[3] - a2[1]) || 1, l2 = e2.cachedCanvases.getCanvas("pattern", r2, o2), h2 = l2.context;
      h2.clearRect(0, 0, h2.canvas.width, h2.canvas.height);
      h2.beginPath();
      h2.rect(0, 0, h2.canvas.width, h2.canvas.height);
      h2.translate(-a2[0], -a2[1]);
      i2 = Util.transform(i2, [1, 0, 0, 1, a2[0], a2[1]]);
      h2.transform(...e2.baseTransform);
      this.matrix && h2.transform(...this.matrix);
      applyBoundingBox(h2, this._bbox);
      h2.fillStyle = this._createGradient(h2);
      h2.fill();
      n2 = t2.createPattern(l2.canvas, "no-repeat");
      const d2 = new DOMMatrix(i2);
      n2.setTransform(d2);
    } else {
      applyBoundingBox(t2, this._bbox);
      n2 = this._createGradient(t2);
    }
    return n2;
  }
};
function drawTriangle(t2, e2, i2, s2, n2, a2, r2, o2) {
  const l2 = e2.coords, h2 = e2.colors, d2 = t2.data, c2 = 4 * t2.width;
  let u2;
  if (l2[i2 + 1] > l2[s2 + 1]) {
    u2 = i2;
    i2 = s2;
    s2 = u2;
    u2 = a2;
    a2 = r2;
    r2 = u2;
  }
  if (l2[s2 + 1] > l2[n2 + 1]) {
    u2 = s2;
    s2 = n2;
    n2 = u2;
    u2 = r2;
    r2 = o2;
    o2 = u2;
  }
  if (l2[i2 + 1] > l2[s2 + 1]) {
    u2 = i2;
    i2 = s2;
    s2 = u2;
    u2 = a2;
    a2 = r2;
    r2 = u2;
  }
  const p2 = (l2[i2] + e2.offsetX) * e2.scaleX, g2 = (l2[i2 + 1] + e2.offsetY) * e2.scaleY, m2 = (l2[s2] + e2.offsetX) * e2.scaleX, f2 = (l2[s2 + 1] + e2.offsetY) * e2.scaleY, b2 = (l2[n2] + e2.offsetX) * e2.scaleX, A2 = (l2[n2 + 1] + e2.offsetY) * e2.scaleY;
  if (g2 >= A2) return;
  const w2 = h2[a2], v2 = h2[a2 + 1], y2 = h2[a2 + 2], x2 = h2[r2], _2 = h2[r2 + 1], E2 = h2[r2 + 2], S2 = h2[o2], C2 = h2[o2 + 1], T2 = h2[o2 + 2], M2 = Math.round(g2), P2 = Math.round(A2);
  let D2, k2, R2, I2, F2, L2, O2, N2;
  for (let t3 = M2; t3 <= P2; t3++) {
    if (t3 < f2) {
      const e4 = t3 < g2 ? 0 : (g2 - t3) / (g2 - f2);
      D2 = p2 - (p2 - m2) * e4;
      k2 = w2 - (w2 - x2) * e4;
      R2 = v2 - (v2 - _2) * e4;
      I2 = y2 - (y2 - E2) * e4;
    } else {
      let e4;
      e4 = t3 > A2 ? 1 : f2 === A2 ? 0 : (f2 - t3) / (f2 - A2);
      D2 = m2 - (m2 - b2) * e4;
      k2 = x2 - (x2 - S2) * e4;
      R2 = _2 - (_2 - C2) * e4;
      I2 = E2 - (E2 - T2) * e4;
    }
    let e3;
    e3 = t3 < g2 ? 0 : t3 > A2 ? 1 : (g2 - t3) / (g2 - A2);
    F2 = p2 - (p2 - b2) * e3;
    L2 = w2 - (w2 - S2) * e3;
    O2 = v2 - (v2 - C2) * e3;
    N2 = y2 - (y2 - T2) * e3;
    const i3 = Math.round(Math.min(D2, F2)), s3 = Math.round(Math.max(D2, F2));
    let n3 = c2 * t3 + 4 * i3;
    for (let t4 = i3; t4 <= s3; t4++) {
      e3 = (D2 - t4) / (D2 - F2);
      e3 < 0 ? e3 = 0 : e3 > 1 && (e3 = 1);
      d2[n3++] = k2 - (k2 - L2) * e3 | 0;
      d2[n3++] = R2 - (R2 - O2) * e3 | 0;
      d2[n3++] = I2 - (I2 - N2) * e3 | 0;
      d2[n3++] = 255;
    }
  }
}
function drawFigure(t2, e2, i2) {
  const s2 = e2.coords, n2 = e2.colors;
  let a2, r2;
  switch (e2.type) {
    case "lattice":
      const o2 = e2.verticesPerRow, l2 = Math.floor(s2.length / o2) - 1, h2 = o2 - 1;
      for (a2 = 0; a2 < l2; a2++) {
        let e3 = a2 * o2;
        for (let a3 = 0; a3 < h2; a3++, e3++) {
          drawTriangle(t2, i2, s2[e3], s2[e3 + 1], s2[e3 + o2], n2[e3], n2[e3 + 1], n2[e3 + o2]);
          drawTriangle(t2, i2, s2[e3 + o2 + 1], s2[e3 + 1], s2[e3 + o2], n2[e3 + o2 + 1], n2[e3 + 1], n2[e3 + o2]);
        }
      }
      break;
    case "triangles":
      for (a2 = 0, r2 = s2.length; a2 < r2; a2 += 3) drawTriangle(t2, i2, s2[a2], s2[a2 + 1], s2[a2 + 2], n2[a2], n2[a2 + 1], n2[a2 + 2]);
      break;
    default:
      throw new Error("illegal figure");
  }
}
var MeshShadingPattern = class extends BaseShadingPattern {
  constructor(t2) {
    super();
    this._coords = t2[2];
    this._colors = t2[3];
    this._figures = t2[4];
    this._bounds = t2[5];
    this._bbox = t2[7];
    this._background = t2[8];
    this.matrix = null;
  }
  _createMeshCanvas(t2, e2, i2) {
    const s2 = Math.floor(this._bounds[0]), n2 = Math.floor(this._bounds[1]), a2 = Math.ceil(this._bounds[2]) - s2, r2 = Math.ceil(this._bounds[3]) - n2, o2 = Math.min(Math.ceil(Math.abs(a2 * t2[0] * 1.1)), 3e3), l2 = Math.min(Math.ceil(Math.abs(r2 * t2[1] * 1.1)), 3e3), h2 = a2 / o2, d2 = r2 / l2, c2 = { coords: this._coords, colors: this._colors, offsetX: -s2, offsetY: -n2, scaleX: 1 / h2, scaleY: 1 / d2 }, u2 = o2 + 4, p2 = l2 + 4, g2 = i2.getCanvas("mesh", u2, p2), m2 = g2.context, f2 = m2.createImageData(o2, l2);
    if (e2) {
      const t3 = f2.data;
      for (let i3 = 0, s3 = t3.length; i3 < s3; i3 += 4) {
        t3[i3] = e2[0];
        t3[i3 + 1] = e2[1];
        t3[i3 + 2] = e2[2];
        t3[i3 + 3] = 255;
      }
    }
    for (const t3 of this._figures) drawFigure(f2, t3, c2);
    m2.putImageData(f2, 2, 2);
    return { canvas: g2.canvas, offsetX: s2 - 2 * h2, offsetY: n2 - 2 * d2, scaleX: h2, scaleY: d2 };
  }
  getPattern(t2, e2, i2, s2) {
    applyBoundingBox(t2, this._bbox);
    let n2;
    if (s2 === wt) n2 = Util.singularValueDecompose2dScale(getCurrentTransform(t2));
    else {
      n2 = Util.singularValueDecompose2dScale(e2.baseTransform);
      if (this.matrix) {
        const t3 = Util.singularValueDecompose2dScale(this.matrix);
        n2 = [n2[0] * t3[0], n2[1] * t3[1]];
      }
    }
    const a2 = this._createMeshCanvas(n2, s2 === wt ? null : this._background, e2.cachedCanvases);
    if (s2 !== wt) {
      t2.setTransform(...e2.baseTransform);
      this.matrix && t2.transform(...this.matrix);
    }
    t2.translate(a2.offsetX, a2.offsetY);
    t2.scale(a2.scaleX, a2.scaleY);
    return t2.createPattern(a2.canvas, "no-repeat");
  }
};
var DummyShadingPattern = class extends BaseShadingPattern {
  getPattern() {
    return "hotpink";
  }
};
var vt = 1;
var yt = 2;
var TilingPattern = class _TilingPattern {
  static MAX_PATTERN_SIZE = 3e3;
  constructor(t2, e2, i2, s2, n2) {
    this.operatorList = t2[2];
    this.matrix = t2[3];
    this.bbox = t2[4];
    this.xstep = t2[5];
    this.ystep = t2[6];
    this.paintType = t2[7];
    this.tilingType = t2[8];
    this.color = e2;
    this.ctx = i2;
    this.canvasGraphicsFactory = s2;
    this.baseTransform = n2;
  }
  createPatternCanvas(t2) {
    const { bbox: e2, operatorList: i2, paintType: s2, tilingType: n2, color: a2, canvasGraphicsFactory: r2 } = this;
    let { xstep: o2, ystep: l2 } = this;
    o2 = Math.abs(o2);
    l2 = Math.abs(l2);
    info("TilingType: " + n2);
    const h2 = e2[0], d2 = e2[1], c2 = e2[2], u2 = e2[3], p2 = c2 - h2, g2 = u2 - d2, m2 = Util.singularValueDecompose2dScale(this.matrix), f2 = Util.singularValueDecompose2dScale(this.baseTransform), b2 = m2[0] * f2[0], A2 = m2[1] * f2[1];
    let w2 = p2, v2 = g2, y2 = false, x2 = false;
    const _2 = Math.ceil(o2 * b2), E2 = Math.ceil(l2 * A2);
    _2 >= Math.ceil(p2 * b2) ? w2 = o2 : y2 = true;
    E2 >= Math.ceil(g2 * A2) ? v2 = l2 : x2 = true;
    const S2 = this.getSizeAndScale(w2, this.ctx.canvas.width, b2), C2 = this.getSizeAndScale(v2, this.ctx.canvas.height, A2), T2 = t2.cachedCanvases.getCanvas("pattern", S2.size, C2.size), M2 = T2.context, P2 = r2.createCanvasGraphics(M2);
    P2.groupLevel = t2.groupLevel;
    this.setFillAndStrokeStyleToContext(P2, s2, a2);
    M2.translate(-S2.scale * h2, -C2.scale * d2);
    P2.transform(S2.scale, 0, 0, C2.scale, 0, 0);
    M2.save();
    this.clipBbox(P2, h2, d2, c2, u2);
    P2.baseTransform = getCurrentTransform(P2.ctx);
    P2.executeOperatorList(i2);
    P2.endDrawing();
    M2.restore();
    if (y2 || x2) {
      const e3 = T2.canvas;
      y2 && (w2 = o2);
      x2 && (v2 = l2);
      const i3 = this.getSizeAndScale(w2, this.ctx.canvas.width, b2), s3 = this.getSizeAndScale(v2, this.ctx.canvas.height, A2), n3 = i3.size, a3 = s3.size, r3 = t2.cachedCanvases.getCanvas("pattern-workaround", n3, a3), c3 = r3.context, u3 = y2 ? Math.floor(p2 / o2) : 0, m3 = x2 ? Math.floor(g2 / l2) : 0;
      for (let t3 = 0; t3 <= u3; t3++) for (let i4 = 0; i4 <= m3; i4++) c3.drawImage(e3, n3 * t3, a3 * i4, n3, a3, 0, 0, n3, a3);
      return { canvas: r3.canvas, scaleX: i3.scale, scaleY: s3.scale, offsetX: h2, offsetY: d2 };
    }
    return { canvas: T2.canvas, scaleX: S2.scale, scaleY: C2.scale, offsetX: h2, offsetY: d2 };
  }
  getSizeAndScale(t2, e2, i2) {
    const s2 = Math.max(_TilingPattern.MAX_PATTERN_SIZE, e2);
    let n2 = Math.ceil(t2 * i2);
    n2 >= s2 ? n2 = s2 : i2 = n2 / t2;
    return { scale: i2, size: n2 };
  }
  clipBbox(t2, e2, i2, s2, n2) {
    const a2 = s2 - e2, r2 = n2 - i2;
    t2.ctx.rect(e2, i2, a2, r2);
    t2.current.updateRectMinMax(getCurrentTransform(t2.ctx), [e2, i2, s2, n2]);
    t2.clip();
    t2.endPath();
  }
  setFillAndStrokeStyleToContext(t2, e2, i2) {
    const s2 = t2.ctx, n2 = t2.current;
    switch (e2) {
      case vt:
        const t3 = this.ctx;
        s2.fillStyle = t3.fillStyle;
        s2.strokeStyle = t3.strokeStyle;
        n2.fillColor = t3.fillStyle;
        n2.strokeColor = t3.strokeStyle;
        break;
      case yt:
        const a2 = Util.makeHexColor(i2[0], i2[1], i2[2]);
        s2.fillStyle = a2;
        s2.strokeStyle = a2;
        n2.fillColor = a2;
        n2.strokeColor = a2;
        break;
      default:
        throw new FormatError(`Unsupported paint type: ${e2}`);
    }
  }
  getPattern(t2, e2, i2, s2) {
    let n2 = i2;
    if (s2 !== wt) {
      n2 = Util.transform(n2, e2.baseTransform);
      this.matrix && (n2 = Util.transform(n2, this.matrix));
    }
    const a2 = this.createPatternCanvas(e2);
    let r2 = new DOMMatrix(n2);
    r2 = r2.translate(a2.offsetX, a2.offsetY);
    r2 = r2.scale(1 / a2.scaleX, 1 / a2.scaleY);
    const o2 = t2.createPattern(a2.canvas, "repeat");
    o2.setTransform(r2);
    return o2;
  }
};
function convertBlackAndWhiteToRGBA({ src: t2, srcPos: e2 = 0, dest: i2, width: s2, height: n2, nonBlackColor: a2 = 4294967295, inverseDecode: r2 = false }) {
  const o2 = util_FeatureTest.isLittleEndian ? 4278190080 : 255, [l2, h2] = r2 ? [a2, o2] : [o2, a2], d2 = s2 >> 3, c2 = 7 & s2, u2 = t2.length;
  i2 = new Uint32Array(i2.buffer);
  let p2 = 0;
  for (let s3 = 0; s3 < n2; s3++) {
    for (const s5 = e2 + d2; e2 < s5; e2++) {
      const s6 = e2 < u2 ? t2[e2] : 255;
      i2[p2++] = 128 & s6 ? h2 : l2;
      i2[p2++] = 64 & s6 ? h2 : l2;
      i2[p2++] = 32 & s6 ? h2 : l2;
      i2[p2++] = 16 & s6 ? h2 : l2;
      i2[p2++] = 8 & s6 ? h2 : l2;
      i2[p2++] = 4 & s6 ? h2 : l2;
      i2[p2++] = 2 & s6 ? h2 : l2;
      i2[p2++] = 1 & s6 ? h2 : l2;
    }
    if (0 === c2) continue;
    const s4 = e2 < u2 ? t2[e2++] : 255;
    for (let t3 = 0; t3 < c2; t3++) i2[p2++] = s4 & 1 << 7 - t3 ? h2 : l2;
  }
  return { srcPos: e2, destPos: p2 };
}
var xt = 16;
var CachedCanvases = class {
  constructor(t2) {
    this.canvasFactory = t2;
    this.cache = /* @__PURE__ */ Object.create(null);
  }
  getCanvas(t2, e2, i2) {
    let s2;
    if (void 0 !== this.cache[t2]) {
      s2 = this.cache[t2];
      this.canvasFactory.reset(s2, e2, i2);
    } else {
      s2 = this.canvasFactory.create(e2, i2);
      this.cache[t2] = s2;
    }
    return s2;
  }
  delete(t2) {
    delete this.cache[t2];
  }
  clear() {
    for (const t2 in this.cache) {
      const e2 = this.cache[t2];
      this.canvasFactory.destroy(e2);
      delete this.cache[t2];
    }
  }
};
function drawImageAtIntegerCoords(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2) {
  const [d2, c2, u2, p2, g2, m2] = getCurrentTransform(t2);
  if (0 === c2 && 0 === u2) {
    const f2 = r2 * d2 + g2, b2 = Math.round(f2), A2 = o2 * p2 + m2, w2 = Math.round(A2), v2 = (r2 + l2) * d2 + g2, y2 = Math.abs(Math.round(v2) - b2) || 1, x2 = (o2 + h2) * p2 + m2, _2 = Math.abs(Math.round(x2) - w2) || 1;
    t2.setTransform(Math.sign(d2), 0, 0, Math.sign(p2), b2, w2);
    t2.drawImage(e2, i2, s2, n2, a2, 0, 0, y2, _2);
    t2.setTransform(d2, c2, u2, p2, g2, m2);
    return [y2, _2];
  }
  if (0 === d2 && 0 === p2) {
    const f2 = o2 * u2 + g2, b2 = Math.round(f2), A2 = r2 * c2 + m2, w2 = Math.round(A2), v2 = (o2 + h2) * u2 + g2, y2 = Math.abs(Math.round(v2) - b2) || 1, x2 = (r2 + l2) * c2 + m2, _2 = Math.abs(Math.round(x2) - w2) || 1;
    t2.setTransform(0, Math.sign(c2), Math.sign(u2), 0, b2, w2);
    t2.drawImage(e2, i2, s2, n2, a2, 0, 0, _2, y2);
    t2.setTransform(d2, c2, u2, p2, g2, m2);
    return [_2, y2];
  }
  t2.drawImage(e2, i2, s2, n2, a2, r2, o2, l2, h2);
  return [Math.hypot(d2, c2) * l2, Math.hypot(u2, p2) * h2];
}
var CanvasExtraState = class {
  constructor(t2, e2) {
    this.alphaIsShape = false;
    this.fontSize = 0;
    this.fontSizeScale = 1;
    this.textMatrix = i;
    this.textMatrixScale = 1;
    this.fontMatrix = s;
    this.leading = 0;
    this.x = 0;
    this.y = 0;
    this.lineX = 0;
    this.lineY = 0;
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRenderingMode = b;
    this.textRise = 0;
    this.fillColor = "#000000";
    this.strokeColor = "#000000";
    this.patternFill = false;
    this.patternStroke = false;
    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.activeSMask = null;
    this.transferMaps = "none";
    this.startNewPathAndClipBox([0, 0, t2, e2]);
  }
  clone() {
    const t2 = Object.create(this);
    t2.clipBox = this.clipBox.slice();
    return t2;
  }
  setCurrentPoint(t2, e2) {
    this.x = t2;
    this.y = e2;
  }
  updatePathMinMax(t2, e2, i2) {
    [e2, i2] = Util.applyTransform([e2, i2], t2);
    this.minX = Math.min(this.minX, e2);
    this.minY = Math.min(this.minY, i2);
    this.maxX = Math.max(this.maxX, e2);
    this.maxY = Math.max(this.maxY, i2);
  }
  updateRectMinMax(t2, e2) {
    const i2 = Util.applyTransform(e2, t2), s2 = Util.applyTransform(e2.slice(2), t2), n2 = Util.applyTransform([e2[0], e2[3]], t2), a2 = Util.applyTransform([e2[2], e2[1]], t2);
    this.minX = Math.min(this.minX, i2[0], s2[0], n2[0], a2[0]);
    this.minY = Math.min(this.minY, i2[1], s2[1], n2[1], a2[1]);
    this.maxX = Math.max(this.maxX, i2[0], s2[0], n2[0], a2[0]);
    this.maxY = Math.max(this.maxY, i2[1], s2[1], n2[1], a2[1]);
  }
  updateScalingPathMinMax(t2, e2) {
    Util.scaleMinMax(t2, e2);
    this.minX = Math.min(this.minX, e2[0]);
    this.minY = Math.min(this.minY, e2[1]);
    this.maxX = Math.max(this.maxX, e2[2]);
    this.maxY = Math.max(this.maxY, e2[3]);
  }
  updateCurvePathMinMax(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2) {
    const d2 = Util.bezierBoundingBox(e2, i2, s2, n2, a2, r2, o2, l2, h2);
    h2 || this.updateRectMinMax(t2, d2);
  }
  getPathBoundingBox(t2 = bt, e2 = null) {
    const i2 = [this.minX, this.minY, this.maxX, this.maxY];
    if (t2 === At) {
      e2 || unreachable("Stroke bounding box must include transform.");
      const t3 = Util.singularValueDecompose2dScale(e2), s2 = t3[0] * this.lineWidth / 2, n2 = t3[1] * this.lineWidth / 2;
      i2[0] -= s2;
      i2[1] -= n2;
      i2[2] += s2;
      i2[3] += n2;
    }
    return i2;
  }
  updateClipFromPath() {
    const t2 = Util.intersect(this.clipBox, this.getPathBoundingBox());
    this.startNewPathAndClipBox(t2 || [0, 0, 0, 0]);
  }
  isEmptyClip() {
    return this.minX === 1 / 0;
  }
  startNewPathAndClipBox(t2) {
    this.clipBox = t2;
    this.minX = 1 / 0;
    this.minY = 1 / 0;
    this.maxX = 0;
    this.maxY = 0;
  }
  getClippedPathBoundingBox(t2 = bt, e2 = null) {
    return Util.intersect(this.clipBox, this.getPathBoundingBox(t2, e2));
  }
};
function putBinaryImageData(t2, e2) {
  if (e2 instanceof ImageData) {
    t2.putImageData(e2, 0, 0);
    return;
  }
  const i2 = e2.height, s2 = e2.width, n2 = i2 % xt, a2 = (i2 - n2) / xt, r2 = 0 === n2 ? a2 : a2 + 1, o2 = t2.createImageData(s2, xt);
  let l2, h2 = 0;
  const d2 = e2.data, c2 = o2.data;
  let u2, p2, g2, m2;
  if (e2.kind === _.GRAYSCALE_1BPP) {
    const e3 = d2.byteLength, i3 = new Uint32Array(c2.buffer, 0, c2.byteLength >> 2), m3 = i3.length, f2 = s2 + 7 >> 3, b2 = 4294967295, A2 = util_FeatureTest.isLittleEndian ? 4278190080 : 255;
    for (u2 = 0; u2 < r2; u2++) {
      g2 = u2 < a2 ? xt : n2;
      l2 = 0;
      for (p2 = 0; p2 < g2; p2++) {
        const t3 = e3 - h2;
        let n3 = 0;
        const a3 = t3 > f2 ? s2 : 8 * t3 - 7, r3 = -8 & a3;
        let o3 = 0, c3 = 0;
        for (; n3 < r3; n3 += 8) {
          c3 = d2[h2++];
          i3[l2++] = 128 & c3 ? b2 : A2;
          i3[l2++] = 64 & c3 ? b2 : A2;
          i3[l2++] = 32 & c3 ? b2 : A2;
          i3[l2++] = 16 & c3 ? b2 : A2;
          i3[l2++] = 8 & c3 ? b2 : A2;
          i3[l2++] = 4 & c3 ? b2 : A2;
          i3[l2++] = 2 & c3 ? b2 : A2;
          i3[l2++] = 1 & c3 ? b2 : A2;
        }
        for (; n3 < a3; n3++) {
          if (0 === o3) {
            c3 = d2[h2++];
            o3 = 128;
          }
          i3[l2++] = c3 & o3 ? b2 : A2;
          o3 >>= 1;
        }
      }
      for (; l2 < m3; ) i3[l2++] = 0;
      t2.putImageData(o2, 0, u2 * xt);
    }
  } else if (e2.kind === _.RGBA_32BPP) {
    p2 = 0;
    m2 = s2 * xt * 4;
    for (u2 = 0; u2 < a2; u2++) {
      c2.set(d2.subarray(h2, h2 + m2));
      h2 += m2;
      t2.putImageData(o2, 0, p2);
      p2 += xt;
    }
    if (u2 < r2) {
      m2 = s2 * n2 * 4;
      c2.set(d2.subarray(h2, h2 + m2));
      t2.putImageData(o2, 0, p2);
    }
  } else {
    if (e2.kind !== _.RGB_24BPP) throw new Error(`bad image kind: ${e2.kind}`);
    g2 = xt;
    m2 = s2 * g2;
    for (u2 = 0; u2 < r2; u2++) {
      if (u2 >= a2) {
        g2 = n2;
        m2 = s2 * g2;
      }
      l2 = 0;
      for (p2 = m2; p2--; ) {
        c2[l2++] = d2[h2++];
        c2[l2++] = d2[h2++];
        c2[l2++] = d2[h2++];
        c2[l2++] = 255;
      }
      t2.putImageData(o2, 0, u2 * xt);
    }
  }
}
function putBinaryImageMask(t2, e2) {
  if (e2.bitmap) {
    t2.drawImage(e2.bitmap, 0, 0);
    return;
  }
  const i2 = e2.height, s2 = e2.width, n2 = i2 % xt, a2 = (i2 - n2) / xt, r2 = 0 === n2 ? a2 : a2 + 1, o2 = t2.createImageData(s2, xt);
  let l2 = 0;
  const h2 = e2.data, d2 = o2.data;
  for (let e3 = 0; e3 < r2; e3++) {
    const i3 = e3 < a2 ? xt : n2;
    ({ srcPos: l2 } = convertBlackAndWhiteToRGBA({ src: h2, srcPos: l2, dest: d2, width: s2, height: i3, nonBlackColor: 0 }));
    t2.putImageData(o2, 0, e3 * xt);
  }
}
function copyCtxState(t2, e2) {
  const i2 = ["strokeStyle", "fillStyle", "fillRule", "globalAlpha", "lineWidth", "lineCap", "lineJoin", "miterLimit", "globalCompositeOperation", "font", "filter"];
  for (const s2 of i2) void 0 !== t2[s2] && (e2[s2] = t2[s2]);
  if (void 0 !== t2.setLineDash) {
    e2.setLineDash(t2.getLineDash());
    e2.lineDashOffset = t2.lineDashOffset;
  }
}
function resetCtxToDefault(t2) {
  t2.strokeStyle = t2.fillStyle = "#000000";
  t2.fillRule = "nonzero";
  t2.globalAlpha = 1;
  t2.lineWidth = 1;
  t2.lineCap = "butt";
  t2.lineJoin = "miter";
  t2.miterLimit = 10;
  t2.globalCompositeOperation = "source-over";
  t2.font = "10px sans-serif";
  if (void 0 !== t2.setLineDash) {
    t2.setLineDash([]);
    t2.lineDashOffset = 0;
  }
  if (!e) {
    const { filter: e2 } = t2;
    "none" !== e2 && "" !== e2 && (t2.filter = "none");
  }
}
function getImageSmoothingEnabled(t2, e2) {
  if (e2) return true;
  const i2 = Util.singularValueDecompose2dScale(t2);
  i2[0] = Math.fround(i2[0]);
  i2[1] = Math.fround(i2[1]);
  const s2 = Math.fround((globalThis.devicePixelRatio || 1) * PixelsPerInch.PDF_TO_CSS_UNITS);
  return i2[0] <= s2 && i2[1] <= s2;
}
var _t = ["butt", "round", "square"];
var Et = ["miter", "round", "bevel"];
var St = {};
var Ct = {};
var CanvasGraphics = class _CanvasGraphics {
  constructor(t2, e2, i2, s2, n2, { optionalContentConfig: a2, markedContentStack: r2 = null }, o2, l2) {
    this.ctx = t2;
    this.current = new CanvasExtraState(this.ctx.canvas.width, this.ctx.canvas.height);
    this.stateStack = [];
    this.pendingClip = null;
    this.pendingEOFill = false;
    this.res = null;
    this.xobjs = null;
    this.commonObjs = e2;
    this.objs = i2;
    this.canvasFactory = s2;
    this.filterFactory = n2;
    this.groupStack = [];
    this.processingType3 = null;
    this.baseTransform = null;
    this.baseTransformStack = [];
    this.groupLevel = 0;
    this.smaskStack = [];
    this.smaskCounter = 0;
    this.tempSMask = null;
    this.suspendedCtx = null;
    this.contentVisible = true;
    this.markedContentStack = r2 || [];
    this.optionalContentConfig = a2;
    this.cachedCanvases = new CachedCanvases(this.canvasFactory);
    this.cachedPatterns = /* @__PURE__ */ new Map();
    this.annotationCanvasMap = o2;
    this.viewportScale = 1;
    this.outputScaleX = 1;
    this.outputScaleY = 1;
    this.pageColors = l2;
    this._cachedScaleForStroking = [-1, 0];
    this._cachedGetSinglePixelWidth = null;
    this._cachedBitmapsMap = /* @__PURE__ */ new Map();
  }
  getObject(t2, e2 = null) {
    return "string" == typeof t2 ? t2.startsWith("g_") ? this.commonObjs.get(t2) : this.objs.get(t2) : e2;
  }
  beginDrawing({ transform: t2, viewport: e2, transparency: i2 = false, background: s2 = null }) {
    const n2 = this.ctx.canvas.width, a2 = this.ctx.canvas.height, r2 = this.ctx.fillStyle;
    this.ctx.fillStyle = s2 || "#ffffff";
    this.ctx.fillRect(0, 0, n2, a2);
    this.ctx.fillStyle = r2;
    if (i2) {
      const t3 = this.cachedCanvases.getCanvas("transparent", n2, a2);
      this.compositeCtx = this.ctx;
      this.transparentCanvas = t3.canvas;
      this.ctx = t3.context;
      this.ctx.save();
      this.ctx.transform(...getCurrentTransform(this.compositeCtx));
    }
    this.ctx.save();
    resetCtxToDefault(this.ctx);
    if (t2) {
      this.ctx.transform(...t2);
      this.outputScaleX = t2[0];
      this.outputScaleY = t2[0];
    }
    this.ctx.transform(...e2.transform);
    this.viewportScale = e2.scale;
    this.baseTransform = getCurrentTransform(this.ctx);
  }
  executeOperatorList(t2, e2, i2, s2) {
    const n2 = t2.argsArray, a2 = t2.fnArray;
    let r2 = e2 || 0;
    const o2 = n2.length;
    if (o2 === r2) return r2;
    const l2 = o2 - r2 > 10 && "function" == typeof i2, h2 = l2 ? Date.now() + 15 : 0;
    let d2 = 0;
    const c2 = this.commonObjs, u2 = this.objs;
    let p2;
    for (; ; ) {
      if (void 0 !== s2 && r2 === s2.nextBreakPoint) {
        s2.breakIt(r2, i2);
        return r2;
      }
      p2 = a2[r2];
      if (p2 !== X.dependency) this[p2].apply(this, n2[r2]);
      else for (const t3 of n2[r2]) {
        const e3 = t3.startsWith("g_") ? c2 : u2;
        if (!e3.has(t3)) {
          e3.get(t3, i2);
          return r2;
        }
      }
      r2++;
      if (r2 === o2) return r2;
      if (l2 && ++d2 > 10) {
        if (Date.now() > h2) {
          i2();
          return r2;
        }
        d2 = 0;
      }
    }
  }
  #hi() {
    for (; this.stateStack.length || this.inSMaskMode; ) this.restore();
    this.current.activeSMask = null;
    this.ctx.restore();
    if (this.transparentCanvas) {
      this.ctx = this.compositeCtx;
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.drawImage(this.transparentCanvas, 0, 0);
      this.ctx.restore();
      this.transparentCanvas = null;
    }
  }
  endDrawing() {
    this.#hi();
    this.cachedCanvases.clear();
    this.cachedPatterns.clear();
    for (const t2 of this._cachedBitmapsMap.values()) {
      for (const e2 of t2.values()) "undefined" != typeof HTMLCanvasElement && e2 instanceof HTMLCanvasElement && (e2.width = e2.height = 0);
      t2.clear();
    }
    this._cachedBitmapsMap.clear();
    this.#di();
  }
  #di() {
    if (this.pageColors) {
      const t2 = this.filterFactory.addHCMFilter(this.pageColors.foreground, this.pageColors.background);
      if ("none" !== t2) {
        const e2 = this.ctx.filter;
        this.ctx.filter = t2;
        this.ctx.drawImage(this.ctx.canvas, 0, 0);
        this.ctx.filter = e2;
      }
    }
  }
  _scaleImage(t2, e2) {
    const i2 = t2.width ?? t2.displayWidth, s2 = t2.height ?? t2.displayHeight;
    let n2, a2, r2 = Math.max(Math.hypot(e2[0], e2[1]), 1), o2 = Math.max(Math.hypot(e2[2], e2[3]), 1), l2 = i2, h2 = s2, d2 = "prescale1";
    for (; r2 > 2 && l2 > 1 || o2 > 2 && h2 > 1; ) {
      let e3 = l2, i3 = h2;
      if (r2 > 2 && l2 > 1) {
        e3 = l2 >= 16384 ? Math.floor(l2 / 2) - 1 || 1 : Math.ceil(l2 / 2);
        r2 /= l2 / e3;
      }
      if (o2 > 2 && h2 > 1) {
        i3 = h2 >= 16384 ? Math.floor(h2 / 2) - 1 || 1 : Math.ceil(h2) / 2;
        o2 /= h2 / i3;
      }
      n2 = this.cachedCanvases.getCanvas(d2, e3, i3);
      a2 = n2.context;
      a2.clearRect(0, 0, e3, i3);
      a2.drawImage(t2, 0, 0, l2, h2, 0, 0, e3, i3);
      t2 = n2.canvas;
      l2 = e3;
      h2 = i3;
      d2 = "prescale1" === d2 ? "prescale2" : "prescale1";
    }
    return { img: t2, paintWidth: l2, paintHeight: h2 };
  }
  _createMaskCanvas(t2) {
    const e2 = this.ctx, { width: i2, height: s2 } = t2, n2 = this.current.fillColor, a2 = this.current.patternFill, r2 = getCurrentTransform(e2);
    let o2, l2, h2, d2;
    if ((t2.bitmap || t2.data) && t2.count > 1) {
      const e3 = t2.bitmap || t2.data.buffer;
      l2 = JSON.stringify(a2 ? r2 : [r2.slice(0, 4), n2]);
      o2 = this._cachedBitmapsMap.get(e3);
      if (!o2) {
        o2 = /* @__PURE__ */ new Map();
        this._cachedBitmapsMap.set(e3, o2);
      }
      const i3 = o2.get(l2);
      if (i3 && !a2) {
        return { canvas: i3, offsetX: Math.round(Math.min(r2[0], r2[2]) + r2[4]), offsetY: Math.round(Math.min(r2[1], r2[3]) + r2[5]) };
      }
      h2 = i3;
    }
    if (!h2) {
      d2 = this.cachedCanvases.getCanvas("maskCanvas", i2, s2);
      putBinaryImageMask(d2.context, t2);
    }
    let c2 = Util.transform(r2, [1 / i2, 0, 0, -1 / s2, 0, 0]);
    c2 = Util.transform(c2, [1, 0, 0, 1, 0, -s2]);
    const [u2, p2, g2, m2] = Util.getAxialAlignedBoundingBox([0, 0, i2, s2], c2), f2 = Math.round(g2 - u2) || 1, b2 = Math.round(m2 - p2) || 1, A2 = this.cachedCanvases.getCanvas("fillCanvas", f2, b2), w2 = A2.context, v2 = u2, y2 = p2;
    w2.translate(-v2, -y2);
    w2.transform(...c2);
    if (!h2) {
      h2 = this._scaleImage(d2.canvas, getCurrentTransformInverse(w2));
      h2 = h2.img;
      o2 && a2 && o2.set(l2, h2);
    }
    w2.imageSmoothingEnabled = getImageSmoothingEnabled(getCurrentTransform(w2), t2.interpolate);
    drawImageAtIntegerCoords(w2, h2, 0, 0, h2.width, h2.height, 0, 0, i2, s2);
    w2.globalCompositeOperation = "source-in";
    const x2 = Util.transform(getCurrentTransformInverse(w2), [1, 0, 0, 1, -v2, -y2]);
    w2.fillStyle = a2 ? n2.getPattern(e2, this, x2, bt) : n2;
    w2.fillRect(0, 0, i2, s2);
    if (o2 && !a2) {
      this.cachedCanvases.delete("fillCanvas");
      o2.set(l2, A2.canvas);
    }
    return { canvas: A2.canvas, offsetX: Math.round(v2), offsetY: Math.round(y2) };
  }
  setLineWidth(t2) {
    t2 !== this.current.lineWidth && (this._cachedScaleForStroking[0] = -1);
    this.current.lineWidth = t2;
    this.ctx.lineWidth = t2;
  }
  setLineCap(t2) {
    this.ctx.lineCap = _t[t2];
  }
  setLineJoin(t2) {
    this.ctx.lineJoin = Et[t2];
  }
  setMiterLimit(t2) {
    this.ctx.miterLimit = t2;
  }
  setDash(t2, e2) {
    const i2 = this.ctx;
    if (void 0 !== i2.setLineDash) {
      i2.setLineDash(t2);
      i2.lineDashOffset = e2;
    }
  }
  setRenderingIntent(t2) {
  }
  setFlatness(t2) {
  }
  setGState(t2) {
    for (const [e2, i2] of t2) switch (e2) {
      case "LW":
        this.setLineWidth(i2);
        break;
      case "LC":
        this.setLineCap(i2);
        break;
      case "LJ":
        this.setLineJoin(i2);
        break;
      case "ML":
        this.setMiterLimit(i2);
        break;
      case "D":
        this.setDash(i2[0], i2[1]);
        break;
      case "RI":
        this.setRenderingIntent(i2);
        break;
      case "FL":
        this.setFlatness(i2);
        break;
      case "Font":
        this.setFont(i2[0], i2[1]);
        break;
      case "CA":
        this.current.strokeAlpha = i2;
        break;
      case "ca":
        this.current.fillAlpha = i2;
        this.ctx.globalAlpha = i2;
        break;
      case "BM":
        this.ctx.globalCompositeOperation = i2;
        break;
      case "SMask":
        this.current.activeSMask = i2 ? this.tempSMask : null;
        this.tempSMask = null;
        this.checkSMaskState();
        break;
      case "TR":
        this.ctx.filter = this.current.transferMaps = this.filterFactory.addFilter(i2);
    }
  }
  get inSMaskMode() {
    return !!this.suspendedCtx;
  }
  checkSMaskState() {
    const t2 = this.inSMaskMode;
    this.current.activeSMask && !t2 ? this.beginSMaskMode() : !this.current.activeSMask && t2 && this.endSMaskMode();
  }
  beginSMaskMode() {
    if (this.inSMaskMode) throw new Error("beginSMaskMode called while already in smask mode");
    const t2 = this.ctx.canvas.width, e2 = this.ctx.canvas.height, i2 = "smaskGroupAt" + this.groupLevel, s2 = this.cachedCanvases.getCanvas(i2, t2, e2);
    this.suspendedCtx = this.ctx;
    this.ctx = s2.context;
    const n2 = this.ctx;
    n2.setTransform(...getCurrentTransform(this.suspendedCtx));
    copyCtxState(this.suspendedCtx, n2);
    !(function mirrorContextOperations(t3, e3) {
      if (t3._removeMirroring) throw new Error("Context is already forwarding operations.");
      t3.__originalSave = t3.save;
      t3.__originalRestore = t3.restore;
      t3.__originalRotate = t3.rotate;
      t3.__originalScale = t3.scale;
      t3.__originalTranslate = t3.translate;
      t3.__originalTransform = t3.transform;
      t3.__originalSetTransform = t3.setTransform;
      t3.__originalResetTransform = t3.resetTransform;
      t3.__originalClip = t3.clip;
      t3.__originalMoveTo = t3.moveTo;
      t3.__originalLineTo = t3.lineTo;
      t3.__originalBezierCurveTo = t3.bezierCurveTo;
      t3.__originalRect = t3.rect;
      t3.__originalClosePath = t3.closePath;
      t3.__originalBeginPath = t3.beginPath;
      t3._removeMirroring = () => {
        t3.save = t3.__originalSave;
        t3.restore = t3.__originalRestore;
        t3.rotate = t3.__originalRotate;
        t3.scale = t3.__originalScale;
        t3.translate = t3.__originalTranslate;
        t3.transform = t3.__originalTransform;
        t3.setTransform = t3.__originalSetTransform;
        t3.resetTransform = t3.__originalResetTransform;
        t3.clip = t3.__originalClip;
        t3.moveTo = t3.__originalMoveTo;
        t3.lineTo = t3.__originalLineTo;
        t3.bezierCurveTo = t3.__originalBezierCurveTo;
        t3.rect = t3.__originalRect;
        t3.closePath = t3.__originalClosePath;
        t3.beginPath = t3.__originalBeginPath;
        delete t3._removeMirroring;
      };
      t3.save = function ctxSave() {
        e3.save();
        this.__originalSave();
      };
      t3.restore = function ctxRestore() {
        e3.restore();
        this.__originalRestore();
      };
      t3.translate = function ctxTranslate(t4, i3) {
        e3.translate(t4, i3);
        this.__originalTranslate(t4, i3);
      };
      t3.scale = function ctxScale(t4, i3) {
        e3.scale(t4, i3);
        this.__originalScale(t4, i3);
      };
      t3.transform = function ctxTransform(t4, i3, s3, n3, a2, r2) {
        e3.transform(t4, i3, s3, n3, a2, r2);
        this.__originalTransform(t4, i3, s3, n3, a2, r2);
      };
      t3.setTransform = function ctxSetTransform(t4, i3, s3, n3, a2, r2) {
        e3.setTransform(t4, i3, s3, n3, a2, r2);
        this.__originalSetTransform(t4, i3, s3, n3, a2, r2);
      };
      t3.resetTransform = function ctxResetTransform() {
        e3.resetTransform();
        this.__originalResetTransform();
      };
      t3.rotate = function ctxRotate(t4) {
        e3.rotate(t4);
        this.__originalRotate(t4);
      };
      t3.clip = function ctxRotate(t4) {
        e3.clip(t4);
        this.__originalClip(t4);
      };
      t3.moveTo = function(t4, i3) {
        e3.moveTo(t4, i3);
        this.__originalMoveTo(t4, i3);
      };
      t3.lineTo = function(t4, i3) {
        e3.lineTo(t4, i3);
        this.__originalLineTo(t4, i3);
      };
      t3.bezierCurveTo = function(t4, i3, s3, n3, a2, r2) {
        e3.bezierCurveTo(t4, i3, s3, n3, a2, r2);
        this.__originalBezierCurveTo(t4, i3, s3, n3, a2, r2);
      };
      t3.rect = function(t4, i3, s3, n3) {
        e3.rect(t4, i3, s3, n3);
        this.__originalRect(t4, i3, s3, n3);
      };
      t3.closePath = function() {
        e3.closePath();
        this.__originalClosePath();
      };
      t3.beginPath = function() {
        e3.beginPath();
        this.__originalBeginPath();
      };
    })(n2, this.suspendedCtx);
    this.setGState([["BM", "source-over"], ["ca", 1], ["CA", 1]]);
  }
  endSMaskMode() {
    if (!this.inSMaskMode) throw new Error("endSMaskMode called while not in smask mode");
    this.ctx._removeMirroring();
    copyCtxState(this.ctx, this.suspendedCtx);
    this.ctx = this.suspendedCtx;
    this.suspendedCtx = null;
  }
  compose(t2) {
    if (!this.current.activeSMask) return;
    if (t2) {
      t2[0] = Math.floor(t2[0]);
      t2[1] = Math.floor(t2[1]);
      t2[2] = Math.ceil(t2[2]);
      t2[3] = Math.ceil(t2[3]);
    } else t2 = [0, 0, this.ctx.canvas.width, this.ctx.canvas.height];
    const e2 = this.current.activeSMask, i2 = this.suspendedCtx;
    this.composeSMask(i2, e2, this.ctx, t2);
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  }
  composeSMask(t2, e2, i2, s2) {
    const n2 = s2[0], a2 = s2[1], r2 = s2[2] - n2, o2 = s2[3] - a2;
    if (0 !== r2 && 0 !== o2) {
      this.genericComposeSMask(e2.context, i2, r2, o2, e2.subtype, e2.backdrop, e2.transferMap, n2, a2, e2.offsetX, e2.offsetY);
      t2.save();
      t2.globalAlpha = 1;
      t2.globalCompositeOperation = "source-over";
      t2.setTransform(1, 0, 0, 1, 0, 0);
      t2.drawImage(i2.canvas, 0, 0);
      t2.restore();
    }
  }
  genericComposeSMask(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2, d2) {
    let c2 = t2.canvas, u2 = o2 - h2, p2 = l2 - d2;
    if (a2) {
      const e3 = Util.makeHexColor(...a2);
      if (u2 < 0 || p2 < 0 || u2 + i2 > c2.width || p2 + s2 > c2.height) {
        const t3 = this.cachedCanvases.getCanvas("maskExtension", i2, s2), n3 = t3.context;
        n3.drawImage(c2, -u2, -p2);
        n3.globalCompositeOperation = "destination-atop";
        n3.fillStyle = e3;
        n3.fillRect(0, 0, i2, s2);
        n3.globalCompositeOperation = "source-over";
        c2 = t3.canvas;
        u2 = p2 = 0;
      } else {
        t2.save();
        t2.globalAlpha = 1;
        t2.setTransform(1, 0, 0, 1, 0, 0);
        const n3 = new Path2D();
        n3.rect(u2, p2, i2, s2);
        t2.clip(n3);
        t2.globalCompositeOperation = "destination-atop";
        t2.fillStyle = e3;
        t2.fillRect(u2, p2, i2, s2);
        t2.restore();
      }
    }
    e2.save();
    e2.globalAlpha = 1;
    e2.setTransform(1, 0, 0, 1, 0, 0);
    "Alpha" === n2 && r2 ? e2.filter = this.filterFactory.addAlphaFilter(r2) : "Luminosity" === n2 && (e2.filter = this.filterFactory.addLuminosityFilter(r2));
    const g2 = new Path2D();
    g2.rect(o2, l2, i2, s2);
    e2.clip(g2);
    e2.globalCompositeOperation = "destination-in";
    e2.drawImage(c2, u2, p2, i2, s2, o2, l2, i2, s2);
    e2.restore();
  }
  save() {
    if (this.inSMaskMode) {
      copyCtxState(this.ctx, this.suspendedCtx);
      this.suspendedCtx.save();
    } else this.ctx.save();
    const t2 = this.current;
    this.stateStack.push(t2);
    this.current = t2.clone();
  }
  restore() {
    0 === this.stateStack.length && this.inSMaskMode && this.endSMaskMode();
    if (0 !== this.stateStack.length) {
      this.current = this.stateStack.pop();
      if (this.inSMaskMode) {
        this.suspendedCtx.restore();
        copyCtxState(this.suspendedCtx, this.ctx);
      } else this.ctx.restore();
      this.checkSMaskState();
      this.pendingClip = null;
      this._cachedScaleForStroking[0] = -1;
      this._cachedGetSinglePixelWidth = null;
    }
  }
  transform(t2, e2, i2, s2, n2, a2) {
    this.ctx.transform(t2, e2, i2, s2, n2, a2);
    this._cachedScaleForStroking[0] = -1;
    this._cachedGetSinglePixelWidth = null;
  }
  constructPath(t2, e2, i2) {
    const s2 = this.ctx, n2 = this.current;
    let a2, r2, o2 = n2.x, l2 = n2.y;
    const h2 = getCurrentTransform(s2), d2 = 0 === h2[0] && 0 === h2[3] || 0 === h2[1] && 0 === h2[2], c2 = d2 ? i2.slice(0) : null;
    for (let i3 = 0, u2 = 0, p2 = t2.length; i3 < p2; i3++) switch (0 | t2[i3]) {
      case X.rectangle:
        o2 = e2[u2++];
        l2 = e2[u2++];
        const t3 = e2[u2++], i4 = e2[u2++], p3 = o2 + t3, g2 = l2 + i4;
        s2.moveTo(o2, l2);
        if (0 === t3 || 0 === i4) s2.lineTo(p3, g2);
        else {
          s2.lineTo(p3, l2);
          s2.lineTo(p3, g2);
          s2.lineTo(o2, g2);
        }
        d2 || n2.updateRectMinMax(h2, [o2, l2, p3, g2]);
        s2.closePath();
        break;
      case X.moveTo:
        o2 = e2[u2++];
        l2 = e2[u2++];
        s2.moveTo(o2, l2);
        d2 || n2.updatePathMinMax(h2, o2, l2);
        break;
      case X.lineTo:
        o2 = e2[u2++];
        l2 = e2[u2++];
        s2.lineTo(o2, l2);
        d2 || n2.updatePathMinMax(h2, o2, l2);
        break;
      case X.curveTo:
        a2 = o2;
        r2 = l2;
        o2 = e2[u2 + 4];
        l2 = e2[u2 + 5];
        s2.bezierCurveTo(e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3], o2, l2);
        n2.updateCurvePathMinMax(h2, a2, r2, e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3], o2, l2, c2);
        u2 += 6;
        break;
      case X.curveTo2:
        a2 = o2;
        r2 = l2;
        s2.bezierCurveTo(o2, l2, e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3]);
        n2.updateCurvePathMinMax(h2, a2, r2, o2, l2, e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3], c2);
        o2 = e2[u2 + 2];
        l2 = e2[u2 + 3];
        u2 += 4;
        break;
      case X.curveTo3:
        a2 = o2;
        r2 = l2;
        o2 = e2[u2 + 2];
        l2 = e2[u2 + 3];
        s2.bezierCurveTo(e2[u2], e2[u2 + 1], o2, l2, o2, l2);
        n2.updateCurvePathMinMax(h2, a2, r2, e2[u2], e2[u2 + 1], o2, l2, o2, l2, c2);
        u2 += 4;
        break;
      case X.closePath:
        s2.closePath();
    }
    d2 && n2.updateScalingPathMinMax(h2, c2);
    n2.setCurrentPoint(o2, l2);
  }
  closePath() {
    this.ctx.closePath();
  }
  stroke(t2 = true) {
    const e2 = this.ctx, i2 = this.current.strokeColor;
    e2.globalAlpha = this.current.strokeAlpha;
    if (this.contentVisible) if ("object" == typeof i2 && i2?.getPattern) {
      e2.save();
      e2.strokeStyle = i2.getPattern(e2, this, getCurrentTransformInverse(e2), At);
      this.rescaleAndStroke(false);
      e2.restore();
    } else this.rescaleAndStroke(true);
    t2 && this.consumePath(this.current.getClippedPathBoundingBox());
    e2.globalAlpha = this.current.fillAlpha;
  }
  closeStroke() {
    this.closePath();
    this.stroke();
  }
  fill(t2 = true) {
    const e2 = this.ctx, i2 = this.current.fillColor;
    let s2 = false;
    if (this.current.patternFill) {
      e2.save();
      e2.fillStyle = i2.getPattern(e2, this, getCurrentTransformInverse(e2), bt);
      s2 = true;
    }
    const n2 = this.current.getClippedPathBoundingBox();
    if (this.contentVisible && null !== n2) if (this.pendingEOFill) {
      e2.fill("evenodd");
      this.pendingEOFill = false;
    } else e2.fill();
    s2 && e2.restore();
    t2 && this.consumePath(n2);
  }
  eoFill() {
    this.pendingEOFill = true;
    this.fill();
  }
  fillStroke() {
    this.fill(false);
    this.stroke(false);
    this.consumePath();
  }
  eoFillStroke() {
    this.pendingEOFill = true;
    this.fillStroke();
  }
  closeFillStroke() {
    this.closePath();
    this.fillStroke();
  }
  closeEOFillStroke() {
    this.pendingEOFill = true;
    this.closePath();
    this.fillStroke();
  }
  endPath() {
    this.consumePath();
  }
  clip() {
    this.pendingClip = St;
  }
  eoClip() {
    this.pendingClip = Ct;
  }
  beginText() {
    this.current.textMatrix = i;
    this.current.textMatrixScale = 1;
    this.current.x = this.current.lineX = 0;
    this.current.y = this.current.lineY = 0;
  }
  endText() {
    const t2 = this.pendingTextPaths, e2 = this.ctx;
    if (void 0 === t2) {
      e2.beginPath();
      return;
    }
    const i2 = new Path2D(), s2 = e2.getTransform().invertSelf();
    for (const { transform: e3, x: n2, y: a2, fontSize: r2, path: o2 } of t2) i2.addPath(o2, new DOMMatrix(e3).preMultiplySelf(s2).translate(n2, a2).scale(r2, -r2));
    e2.clip(i2);
    e2.beginPath();
    delete this.pendingTextPaths;
  }
  setCharSpacing(t2) {
    this.current.charSpacing = t2;
  }
  setWordSpacing(t2) {
    this.current.wordSpacing = t2;
  }
  setHScale(t2) {
    this.current.textHScale = t2 / 100;
  }
  setLeading(t2) {
    this.current.leading = -t2;
  }
  setFont(t2, e2) {
    const i2 = this.commonObjs.get(t2), n2 = this.current;
    if (!i2) throw new Error(`Can't find font for ${t2}`);
    n2.fontMatrix = i2.fontMatrix || s;
    0 !== n2.fontMatrix[0] && 0 !== n2.fontMatrix[3] || warn("Invalid font matrix for font " + t2);
    if (e2 < 0) {
      e2 = -e2;
      n2.fontDirection = -1;
    } else n2.fontDirection = 1;
    this.current.font = i2;
    this.current.fontSize = e2;
    if (i2.isType3Font) return;
    const a2 = i2.loadedName || "sans-serif", r2 = i2.systemFontInfo?.css || `"${a2}", ${i2.fallbackName}`;
    let o2 = "normal";
    i2.black ? o2 = "900" : i2.bold && (o2 = "bold");
    const l2 = i2.italic ? "italic" : "normal";
    let h2 = e2;
    e2 < 16 ? h2 = 16 : e2 > 100 && (h2 = 100);
    this.current.fontSizeScale = e2 / h2;
    this.ctx.font = `${l2} ${o2} ${h2}px ${r2}`;
  }
  setTextRenderingMode(t2) {
    this.current.textRenderingMode = t2;
  }
  setTextRise(t2) {
    this.current.textRise = t2;
  }
  moveText(t2, e2) {
    this.current.x = this.current.lineX += t2;
    this.current.y = this.current.lineY += e2;
  }
  setLeadingMoveText(t2, e2) {
    this.setLeading(-e2);
    this.moveText(t2, e2);
  }
  setTextMatrix(t2, e2, i2, s2, n2, a2) {
    this.current.textMatrix = [t2, e2, i2, s2, n2, a2];
    this.current.textMatrixScale = Math.hypot(t2, e2);
    this.current.x = this.current.lineX = 0;
    this.current.y = this.current.lineY = 0;
  }
  nextLine() {
    this.moveText(0, this.current.leading);
  }
  #ci(t2, e2, i2) {
    const s2 = new Path2D();
    s2.addPath(t2, new DOMMatrix(i2).invertSelf().multiplySelf(e2));
    return s2;
  }
  paintChar(t2, e2, i2, s2, n2) {
    const a2 = this.ctx, r2 = this.current, o2 = r2.font, l2 = r2.textRenderingMode, h2 = r2.fontSize / r2.fontSizeScale, d2 = l2 & y, c2 = !!(l2 & x), u2 = r2.patternFill && !o2.missingFile, p2 = r2.patternStroke && !o2.missingFile;
    let g2;
    (o2.disableFontFace || c2 || u2 || p2) && (g2 = o2.getPathGenerator(this.commonObjs, t2));
    if (o2.disableFontFace || u2 || p2) {
      a2.save();
      a2.translate(e2, i2);
      a2.scale(h2, -h2);
      if (d2 === b || d2 === w) if (s2) {
        const t3 = a2.getTransform();
        a2.setTransform(...s2);
        a2.fill(this.#ci(g2, t3, s2));
      } else a2.fill(g2);
      if (d2 === A || d2 === w) if (n2) {
        const t3 = a2.getTransform();
        a2.setTransform(...n2);
        a2.stroke(this.#ci(g2, t3, n2));
      } else {
        a2.lineWidth /= h2;
        a2.stroke(g2);
      }
      a2.restore();
    } else {
      d2 !== b && d2 !== w || a2.fillText(t2, e2, i2);
      d2 !== A && d2 !== w || a2.strokeText(t2, e2, i2);
    }
    if (c2) {
      (this.pendingTextPaths ||= []).push({ transform: getCurrentTransform(a2), x: e2, y: i2, fontSize: h2, path: g2 });
    }
  }
  get isFontSubpixelAAEnabled() {
    const { context: t2 } = this.cachedCanvases.getCanvas("isFontSubpixelAAEnabled", 10, 10);
    t2.scale(1.5, 1);
    t2.fillText("I", 0, 10);
    const e2 = t2.getImageData(0, 0, 10, 10).data;
    let i2 = false;
    for (let t3 = 3; t3 < e2.length; t3 += 4) if (e2[t3] > 0 && e2[t3] < 255) {
      i2 = true;
      break;
    }
    return shadow(this, "isFontSubpixelAAEnabled", i2);
  }
  showText(t2) {
    const e2 = this.current, i2 = e2.font;
    if (i2.isType3Font) return this.showType3Text(t2);
    const s2 = e2.fontSize;
    if (0 === s2) return;
    const n2 = this.ctx, a2 = e2.fontSizeScale, r2 = e2.charSpacing, o2 = e2.wordSpacing, l2 = e2.fontDirection, h2 = e2.textHScale * l2, d2 = t2.length, c2 = i2.vertical, u2 = c2 ? 1 : -1, p2 = i2.defaultVMetrics, g2 = s2 * e2.fontMatrix[0], m2 = e2.textRenderingMode === b && !i2.disableFontFace && !e2.patternFill;
    n2.save();
    n2.transform(...e2.textMatrix);
    n2.translate(e2.x, e2.y + e2.textRise);
    l2 > 0 ? n2.scale(h2, -1) : n2.scale(h2, 1);
    let f2, v2;
    if (e2.patternFill) {
      n2.save();
      const t3 = e2.fillColor.getPattern(n2, this, getCurrentTransformInverse(n2), bt);
      f2 = getCurrentTransform(n2);
      n2.restore();
      n2.fillStyle = t3;
    }
    if (e2.patternStroke) {
      n2.save();
      const t3 = e2.strokeColor.getPattern(n2, this, getCurrentTransformInverse(n2), At);
      v2 = getCurrentTransform(n2);
      n2.restore();
      n2.strokeStyle = t3;
    }
    let x2 = e2.lineWidth;
    const _2 = e2.textMatrixScale;
    if (0 === _2 || 0 === x2) {
      const t3 = e2.textRenderingMode & y;
      t3 !== A && t3 !== w || (x2 = this.getSinglePixelWidth());
    } else x2 /= _2;
    if (1 !== a2) {
      n2.scale(a2, a2);
      x2 /= a2;
    }
    n2.lineWidth = x2;
    if (i2.isInvalidPDFjsFont) {
      const i3 = [];
      let s3 = 0;
      for (const e3 of t2) {
        i3.push(e3.unicode);
        s3 += e3.width;
      }
      n2.fillText(i3.join(""), 0, 0);
      e2.x += s3 * g2 * h2;
      n2.restore();
      this.compose();
      return;
    }
    let E2, S2 = 0;
    for (E2 = 0; E2 < d2; ++E2) {
      const e3 = t2[E2];
      if ("number" == typeof e3) {
        S2 += u2 * e3 * s2 / 1e3;
        continue;
      }
      let h3 = false;
      const d3 = (e3.isSpace ? o2 : 0) + r2, b2 = e3.fontChar, A2 = e3.accent;
      let w2, y2, x3 = e3.width;
      if (c2) {
        const t3 = e3.vmetric || p2, i3 = -(e3.vmetric ? t3[1] : 0.5 * x3) * g2, s3 = t3[2] * g2;
        x3 = t3 ? -t3[0] : x3;
        w2 = i3 / a2;
        y2 = (S2 + s3) / a2;
      } else {
        w2 = S2 / a2;
        y2 = 0;
      }
      if (i2.remeasure && x3 > 0) {
        const t3 = 1e3 * n2.measureText(b2).width / s2 * a2;
        if (x3 < t3 && this.isFontSubpixelAAEnabled) {
          const e4 = x3 / t3;
          h3 = true;
          n2.save();
          n2.scale(e4, 1);
          w2 /= e4;
        } else x3 !== t3 && (w2 += (x3 - t3) / 2e3 * s2 / a2);
      }
      if (this.contentVisible && (e3.isInFont || i2.missingFile)) if (m2 && !A2) n2.fillText(b2, w2, y2);
      else {
        this.paintChar(b2, w2, y2, f2, v2);
        if (A2) {
          const t3 = w2 + s2 * A2.offset.x / a2, e4 = y2 - s2 * A2.offset.y / a2;
          this.paintChar(A2.fontChar, t3, e4, f2, v2);
        }
      }
      S2 += c2 ? x3 * g2 - d3 * l2 : x3 * g2 + d3 * l2;
      h3 && n2.restore();
    }
    c2 ? e2.y -= S2 : e2.x += S2 * h2;
    n2.restore();
    this.compose();
  }
  showType3Text(t2) {
    const e2 = this.ctx, i2 = this.current, n2 = i2.font, a2 = i2.fontSize, r2 = i2.fontDirection, o2 = n2.vertical ? 1 : -1, l2 = i2.charSpacing, h2 = i2.wordSpacing, d2 = i2.textHScale * r2, c2 = i2.fontMatrix || s, u2 = t2.length;
    let p2, g2, m2, f2;
    if (!(i2.textRenderingMode === v) && 0 !== a2) {
      this._cachedScaleForStroking[0] = -1;
      this._cachedGetSinglePixelWidth = null;
      e2.save();
      e2.transform(...i2.textMatrix);
      e2.translate(i2.x, i2.y);
      e2.scale(d2, r2);
      for (p2 = 0; p2 < u2; ++p2) {
        g2 = t2[p2];
        if ("number" == typeof g2) {
          f2 = o2 * g2 * a2 / 1e3;
          this.ctx.translate(f2, 0);
          i2.x += f2 * d2;
          continue;
        }
        const s2 = (g2.isSpace ? h2 : 0) + l2, r3 = n2.charProcOperatorList[g2.operatorListId];
        if (!r3) {
          warn(`Type3 character "${g2.operatorListId}" is not available.`);
          continue;
        }
        if (this.contentVisible) {
          this.processingType3 = g2;
          this.save();
          e2.scale(a2, a2);
          e2.transform(...c2);
          this.executeOperatorList(r3);
          this.restore();
        }
        m2 = Util.applyTransform([g2.width, 0], c2)[0] * a2 + s2;
        e2.translate(m2, 0);
        i2.x += m2 * d2;
      }
      e2.restore();
      this.processingType3 = null;
    }
  }
  setCharWidth(t2, e2) {
  }
  setCharWidthAndBounds(t2, e2, i2, s2, n2, a2) {
    this.ctx.rect(i2, s2, n2 - i2, a2 - s2);
    this.ctx.clip();
    this.endPath();
  }
  getColorN_Pattern(t2) {
    let e2;
    if ("TilingPattern" === t2[0]) {
      const i2 = t2[1], s2 = this.baseTransform || getCurrentTransform(this.ctx), n2 = { createCanvasGraphics: (t3) => new _CanvasGraphics(t3, this.commonObjs, this.objs, this.canvasFactory, this.filterFactory, { optionalContentConfig: this.optionalContentConfig, markedContentStack: this.markedContentStack }) };
      e2 = new TilingPattern(t2, i2, this.ctx, n2, s2);
    } else e2 = this._getPattern(t2[1], t2[2]);
    return e2;
  }
  setStrokeColorN() {
    this.current.strokeColor = this.getColorN_Pattern(arguments);
    this.current.patternStroke = true;
  }
  setFillColorN() {
    this.current.fillColor = this.getColorN_Pattern(arguments);
    this.current.patternFill = true;
  }
  setStrokeRGBColor(t2, e2, i2) {
    this.ctx.strokeStyle = this.current.strokeColor = Util.makeHexColor(t2, e2, i2);
    this.current.patternStroke = false;
  }
  setStrokeTransparent() {
    this.ctx.strokeStyle = this.current.strokeColor = "transparent";
    this.current.patternStroke = false;
  }
  setFillRGBColor(t2, e2, i2) {
    this.ctx.fillStyle = this.current.fillColor = Util.makeHexColor(t2, e2, i2);
    this.current.patternFill = false;
  }
  setFillTransparent() {
    this.ctx.fillStyle = this.current.fillColor = "transparent";
    this.current.patternFill = false;
  }
  _getPattern(t2, e2 = null) {
    let i2;
    if (this.cachedPatterns.has(t2)) i2 = this.cachedPatterns.get(t2);
    else {
      i2 = (function getShadingPattern(t3) {
        switch (t3[0]) {
          case "RadialAxial":
            return new RadialAxialShadingPattern(t3);
          case "Mesh":
            return new MeshShadingPattern(t3);
          case "Dummy":
            return new DummyShadingPattern();
        }
        throw new Error(`Unknown IR type: ${t3[0]}`);
      })(this.getObject(t2));
      this.cachedPatterns.set(t2, i2);
    }
    e2 && (i2.matrix = e2);
    return i2;
  }
  shadingFill(t2) {
    if (!this.contentVisible) return;
    const e2 = this.ctx;
    this.save();
    const i2 = this._getPattern(t2);
    e2.fillStyle = i2.getPattern(e2, this, getCurrentTransformInverse(e2), wt);
    const s2 = getCurrentTransformInverse(e2);
    if (s2) {
      const { width: t3, height: i3 } = e2.canvas, [n2, a2, r2, o2] = Util.getAxialAlignedBoundingBox([0, 0, t3, i3], s2);
      this.ctx.fillRect(n2, a2, r2 - n2, o2 - a2);
    } else this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
    this.compose(this.current.getClippedPathBoundingBox());
    this.restore();
  }
  beginInlineImage() {
    unreachable("Should not call beginInlineImage");
  }
  beginImageData() {
    unreachable("Should not call beginImageData");
  }
  paintFormXObjectBegin(t2, e2) {
    if (this.contentVisible) {
      this.save();
      this.baseTransformStack.push(this.baseTransform);
      t2 && this.transform(...t2);
      this.baseTransform = getCurrentTransform(this.ctx);
      if (e2) {
        const t3 = e2[2] - e2[0], i2 = e2[3] - e2[1];
        this.ctx.rect(e2[0], e2[1], t3, i2);
        this.current.updateRectMinMax(getCurrentTransform(this.ctx), e2);
        this.clip();
        this.endPath();
      }
    }
  }
  paintFormXObjectEnd() {
    if (this.contentVisible) {
      this.restore();
      this.baseTransform = this.baseTransformStack.pop();
    }
  }
  beginGroup(t2) {
    if (!this.contentVisible) return;
    this.save();
    if (this.inSMaskMode) {
      this.endSMaskMode();
      this.current.activeSMask = null;
    }
    const e2 = this.ctx;
    t2.isolated || info("TODO: Support non-isolated groups.");
    t2.knockout && warn("Knockout groups not supported.");
    const i2 = getCurrentTransform(e2);
    t2.matrix && e2.transform(...t2.matrix);
    if (!t2.bbox) throw new Error("Bounding box is required.");
    let s2 = Util.getAxialAlignedBoundingBox(t2.bbox, getCurrentTransform(e2));
    const n2 = [0, 0, e2.canvas.width, e2.canvas.height];
    s2 = Util.intersect(s2, n2) || [0, 0, 0, 0];
    const a2 = Math.floor(s2[0]), r2 = Math.floor(s2[1]), o2 = Math.max(Math.ceil(s2[2]) - a2, 1), l2 = Math.max(Math.ceil(s2[3]) - r2, 1);
    this.current.startNewPathAndClipBox([0, 0, o2, l2]);
    let h2 = "groupAt" + this.groupLevel;
    t2.smask && (h2 += "_smask_" + this.smaskCounter++ % 2);
    const d2 = this.cachedCanvases.getCanvas(h2, o2, l2), c2 = d2.context;
    c2.translate(-a2, -r2);
    c2.transform(...i2);
    if (t2.smask) this.smaskStack.push({ canvas: d2.canvas, context: c2, offsetX: a2, offsetY: r2, subtype: t2.smask.subtype, backdrop: t2.smask.backdrop, transferMap: t2.smask.transferMap || null, startTransformInverse: null });
    else {
      e2.setTransform(1, 0, 0, 1, 0, 0);
      e2.translate(a2, r2);
      e2.save();
    }
    copyCtxState(e2, c2);
    this.ctx = c2;
    this.setGState([["BM", "source-over"], ["ca", 1], ["CA", 1]]);
    this.groupStack.push(e2);
    this.groupLevel++;
  }
  endGroup(t2) {
    if (!this.contentVisible) return;
    this.groupLevel--;
    const e2 = this.ctx, i2 = this.groupStack.pop();
    this.ctx = i2;
    this.ctx.imageSmoothingEnabled = false;
    if (t2.smask) {
      this.tempSMask = this.smaskStack.pop();
      this.restore();
    } else {
      this.ctx.restore();
      const t3 = getCurrentTransform(this.ctx);
      this.restore();
      this.ctx.save();
      this.ctx.setTransform(...t3);
      const i3 = Util.getAxialAlignedBoundingBox([0, 0, e2.canvas.width, e2.canvas.height], t3);
      this.ctx.drawImage(e2.canvas, 0, 0);
      this.ctx.restore();
      this.compose(i3);
    }
  }
  beginAnnotation(t2, e2, i2, s2, n2) {
    this.#hi();
    resetCtxToDefault(this.ctx);
    this.ctx.save();
    this.save();
    this.baseTransform && this.ctx.setTransform(...this.baseTransform);
    if (e2) {
      const s3 = e2[2] - e2[0], a2 = e2[3] - e2[1];
      if (n2 && this.annotationCanvasMap) {
        (i2 = i2.slice())[4] -= e2[0];
        i2[5] -= e2[1];
        (e2 = e2.slice())[0] = e2[1] = 0;
        e2[2] = s3;
        e2[3] = a2;
        const [n3, r2] = Util.singularValueDecompose2dScale(getCurrentTransform(this.ctx)), { viewportScale: o2 } = this, l2 = Math.ceil(s3 * this.outputScaleX * o2), h2 = Math.ceil(a2 * this.outputScaleY * o2);
        this.annotationCanvas = this.canvasFactory.create(l2, h2);
        const { canvas: d2, context: c2 } = this.annotationCanvas;
        this.annotationCanvasMap.set(t2, d2);
        this.annotationCanvas.savedCtx = this.ctx;
        this.ctx = c2;
        this.ctx.save();
        this.ctx.setTransform(n3, 0, 0, -r2, 0, a2 * r2);
        resetCtxToDefault(this.ctx);
      } else {
        resetCtxToDefault(this.ctx);
        this.endPath();
        this.ctx.rect(e2[0], e2[1], s3, a2);
        this.ctx.clip();
        this.ctx.beginPath();
      }
    }
    this.current = new CanvasExtraState(this.ctx.canvas.width, this.ctx.canvas.height);
    this.transform(...i2);
    this.transform(...s2);
  }
  endAnnotation() {
    if (this.annotationCanvas) {
      this.ctx.restore();
      this.#di();
      this.ctx = this.annotationCanvas.savedCtx;
      delete this.annotationCanvas.savedCtx;
      delete this.annotationCanvas;
    }
  }
  paintImageMaskXObject(t2) {
    if (!this.contentVisible) return;
    const e2 = t2.count;
    (t2 = this.getObject(t2.data, t2)).count = e2;
    const i2 = this.ctx, s2 = this.processingType3;
    if (s2) {
      void 0 === s2.compiled && (s2.compiled = (function compileType3Glyph(t3) {
        const { width: e3, height: i3 } = t3;
        if (e3 > 1e3 || i3 > 1e3) return null;
        const s3 = new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]), n3 = e3 + 1;
        let a3, r2, o2, l2 = new Uint8Array(n3 * (i3 + 1));
        const h2 = e3 + 7 & -8;
        let d2 = new Uint8Array(h2 * i3), c2 = 0;
        for (const e4 of t3.data) {
          let t4 = 128;
          for (; t4 > 0; ) {
            d2[c2++] = e4 & t4 ? 0 : 255;
            t4 >>= 1;
          }
        }
        let u2 = 0;
        c2 = 0;
        if (0 !== d2[c2]) {
          l2[0] = 1;
          ++u2;
        }
        for (r2 = 1; r2 < e3; r2++) {
          if (d2[c2] !== d2[c2 + 1]) {
            l2[r2] = d2[c2] ? 2 : 1;
            ++u2;
          }
          c2++;
        }
        if (0 !== d2[c2]) {
          l2[r2] = 2;
          ++u2;
        }
        for (a3 = 1; a3 < i3; a3++) {
          c2 = a3 * h2;
          o2 = a3 * n3;
          if (d2[c2 - h2] !== d2[c2]) {
            l2[o2] = d2[c2] ? 1 : 8;
            ++u2;
          }
          let t4 = (d2[c2] ? 4 : 0) + (d2[c2 - h2] ? 8 : 0);
          for (r2 = 1; r2 < e3; r2++) {
            t4 = (t4 >> 2) + (d2[c2 + 1] ? 4 : 0) + (d2[c2 - h2 + 1] ? 8 : 0);
            if (s3[t4]) {
              l2[o2 + r2] = s3[t4];
              ++u2;
            }
            c2++;
          }
          if (d2[c2 - h2] !== d2[c2]) {
            l2[o2 + r2] = d2[c2] ? 2 : 4;
            ++u2;
          }
          if (u2 > 1e3) return null;
        }
        c2 = h2 * (i3 - 1);
        o2 = a3 * n3;
        if (0 !== d2[c2]) {
          l2[o2] = 8;
          ++u2;
        }
        for (r2 = 1; r2 < e3; r2++) {
          if (d2[c2] !== d2[c2 + 1]) {
            l2[o2 + r2] = d2[c2] ? 4 : 8;
            ++u2;
          }
          c2++;
        }
        if (0 !== d2[c2]) {
          l2[o2 + r2] = 4;
          ++u2;
        }
        if (u2 > 1e3) return null;
        const p2 = new Int32Array([0, n3, -1, 0, -n3, 0, 0, 0, 1]), g2 = new Path2D();
        for (a3 = 0; u2 && a3 <= i3; a3++) {
          let t4 = a3 * n3;
          const i4 = t4 + e3;
          for (; t4 < i4 && !l2[t4]; ) t4++;
          if (t4 === i4) continue;
          g2.moveTo(t4 % n3, a3);
          const s4 = t4;
          let r3 = l2[t4];
          do {
            const e4 = p2[r3];
            do {
              t4 += e4;
            } while (!l2[t4]);
            const i5 = l2[t4];
            if (5 !== i5 && 10 !== i5) {
              r3 = i5;
              l2[t4] = 0;
            } else {
              r3 = i5 & 51 * r3 >> 4;
              l2[t4] &= r3 >> 2 | r3 << 2;
            }
            g2.lineTo(t4 % n3, t4 / n3 | 0);
            l2[t4] || --u2;
          } while (s4 !== t4);
          --a3;
        }
        d2 = null;
        l2 = null;
        return function(t4) {
          t4.save();
          t4.scale(1 / e3, -1 / i3);
          t4.translate(0, -i3);
          t4.fill(g2);
          t4.beginPath();
          t4.restore();
        };
      })(t2));
      if (s2.compiled) {
        s2.compiled(i2);
        return;
      }
    }
    const n2 = this._createMaskCanvas(t2), a2 = n2.canvas;
    i2.save();
    i2.setTransform(1, 0, 0, 1, 0, 0);
    i2.drawImage(a2, n2.offsetX, n2.offsetY);
    i2.restore();
    this.compose();
  }
  paintImageMaskXObjectRepeat(t2, e2, i2 = 0, s2 = 0, n2, a2) {
    if (!this.contentVisible) return;
    t2 = this.getObject(t2.data, t2);
    const r2 = this.ctx;
    r2.save();
    const o2 = getCurrentTransform(r2);
    r2.transform(e2, i2, s2, n2, 0, 0);
    const l2 = this._createMaskCanvas(t2);
    r2.setTransform(1, 0, 0, 1, l2.offsetX - o2[4], l2.offsetY - o2[5]);
    for (let t3 = 0, h2 = a2.length; t3 < h2; t3 += 2) {
      const h3 = Util.transform(o2, [e2, i2, s2, n2, a2[t3], a2[t3 + 1]]), [d2, c2] = Util.applyTransform([0, 0], h3);
      r2.drawImage(l2.canvas, d2, c2);
    }
    r2.restore();
    this.compose();
  }
  paintImageMaskXObjectGroup(t2) {
    if (!this.contentVisible) return;
    const e2 = this.ctx, i2 = this.current.fillColor, s2 = this.current.patternFill;
    for (const n2 of t2) {
      const { data: t3, width: a2, height: r2, transform: o2 } = n2, l2 = this.cachedCanvases.getCanvas("maskCanvas", a2, r2), h2 = l2.context;
      h2.save();
      putBinaryImageMask(h2, this.getObject(t3, n2));
      h2.globalCompositeOperation = "source-in";
      h2.fillStyle = s2 ? i2.getPattern(h2, this, getCurrentTransformInverse(e2), bt) : i2;
      h2.fillRect(0, 0, a2, r2);
      h2.restore();
      e2.save();
      e2.transform(...o2);
      e2.scale(1, -1);
      drawImageAtIntegerCoords(e2, l2.canvas, 0, 0, a2, r2, 0, -1, 1, 1);
      e2.restore();
    }
    this.compose();
  }
  paintImageXObject(t2) {
    if (!this.contentVisible) return;
    const e2 = this.getObject(t2);
    e2 ? this.paintInlineImageXObject(e2) : warn("Dependent image isn't ready yet");
  }
  paintImageXObjectRepeat(t2, e2, i2, s2) {
    if (!this.contentVisible) return;
    const n2 = this.getObject(t2);
    if (!n2) {
      warn("Dependent image isn't ready yet");
      return;
    }
    const a2 = n2.width, r2 = n2.height, o2 = [];
    for (let t3 = 0, n3 = s2.length; t3 < n3; t3 += 2) o2.push({ transform: [e2, 0, 0, i2, s2[t3], s2[t3 + 1]], x: 0, y: 0, w: a2, h: r2 });
    this.paintInlineImageXObjectGroup(n2, o2);
  }
  applyTransferMapsToCanvas(t2) {
    if ("none" !== this.current.transferMaps) {
      t2.filter = this.current.transferMaps;
      t2.drawImage(t2.canvas, 0, 0);
      t2.filter = "none";
    }
    return t2.canvas;
  }
  applyTransferMapsToBitmap(t2) {
    if ("none" === this.current.transferMaps) return t2.bitmap;
    const { bitmap: e2, width: i2, height: s2 } = t2, n2 = this.cachedCanvases.getCanvas("inlineImage", i2, s2), a2 = n2.context;
    a2.filter = this.current.transferMaps;
    a2.drawImage(e2, 0, 0);
    a2.filter = "none";
    return n2.canvas;
  }
  paintInlineImageXObject(t2) {
    if (!this.contentVisible) return;
    const i2 = t2.width, s2 = t2.height, n2 = this.ctx;
    this.save();
    if (!e) {
      const { filter: t3 } = n2;
      "none" !== t3 && "" !== t3 && (n2.filter = "none");
    }
    n2.scale(1 / i2, -1 / s2);
    let a2;
    if (t2.bitmap) a2 = this.applyTransferMapsToBitmap(t2);
    else if ("function" == typeof HTMLElement && t2 instanceof HTMLElement || !t2.data) a2 = t2;
    else {
      const e2 = this.cachedCanvases.getCanvas("inlineImage", i2, s2).context;
      putBinaryImageData(e2, t2);
      a2 = this.applyTransferMapsToCanvas(e2);
    }
    const r2 = this._scaleImage(a2, getCurrentTransformInverse(n2));
    n2.imageSmoothingEnabled = getImageSmoothingEnabled(getCurrentTransform(n2), t2.interpolate);
    drawImageAtIntegerCoords(n2, r2.img, 0, 0, r2.paintWidth, r2.paintHeight, 0, -s2, i2, s2);
    this.compose();
    this.restore();
  }
  paintInlineImageXObjectGroup(t2, e2) {
    if (!this.contentVisible) return;
    const i2 = this.ctx;
    let s2;
    if (t2.bitmap) s2 = t2.bitmap;
    else {
      const e3 = t2.width, i3 = t2.height, n2 = this.cachedCanvases.getCanvas("inlineImage", e3, i3).context;
      putBinaryImageData(n2, t2);
      s2 = this.applyTransferMapsToCanvas(n2);
    }
    for (const t3 of e2) {
      i2.save();
      i2.transform(...t3.transform);
      i2.scale(1, -1);
      drawImageAtIntegerCoords(i2, s2, t3.x, t3.y, t3.w, t3.h, 0, -1, 1, 1);
      i2.restore();
    }
    this.compose();
  }
  paintSolidColorImageMask() {
    if (this.contentVisible) {
      this.ctx.fillRect(0, 0, 1, 1);
      this.compose();
    }
  }
  markPoint(t2) {
  }
  markPointProps(t2, e2) {
  }
  beginMarkedContent(t2) {
    this.markedContentStack.push({ visible: true });
  }
  beginMarkedContentProps(t2, e2) {
    "OC" === t2 ? this.markedContentStack.push({ visible: this.optionalContentConfig.isVisible(e2) }) : this.markedContentStack.push({ visible: true });
    this.contentVisible = this.isContentVisible();
  }
  endMarkedContent() {
    this.markedContentStack.pop();
    this.contentVisible = this.isContentVisible();
  }
  beginCompat() {
  }
  endCompat() {
  }
  consumePath(t2) {
    const e2 = this.current.isEmptyClip();
    this.pendingClip && this.current.updateClipFromPath();
    this.pendingClip || this.compose(t2);
    const i2 = this.ctx;
    if (this.pendingClip) {
      e2 || (this.pendingClip === Ct ? i2.clip("evenodd") : i2.clip());
      this.pendingClip = null;
    }
    this.current.startNewPathAndClipBox(this.current.clipBox);
    i2.beginPath();
  }
  getSinglePixelWidth() {
    if (!this._cachedGetSinglePixelWidth) {
      const t2 = getCurrentTransform(this.ctx);
      if (0 === t2[1] && 0 === t2[2]) this._cachedGetSinglePixelWidth = 1 / Math.min(Math.abs(t2[0]), Math.abs(t2[3]));
      else {
        const e2 = Math.abs(t2[0] * t2[3] - t2[2] * t2[1]), i2 = Math.hypot(t2[0], t2[2]), s2 = Math.hypot(t2[1], t2[3]);
        this._cachedGetSinglePixelWidth = Math.max(i2, s2) / e2;
      }
    }
    return this._cachedGetSinglePixelWidth;
  }
  getScaleForStroking() {
    if (-1 === this._cachedScaleForStroking[0]) {
      const { lineWidth: t2 } = this.current, { a: e2, b: i2, c: s2, d: n2 } = this.ctx.getTransform();
      let a2, r2;
      if (0 === i2 && 0 === s2) {
        const i3 = Math.abs(e2), s3 = Math.abs(n2);
        if (i3 === s3) if (0 === t2) a2 = r2 = 1 / i3;
        else {
          const e3 = i3 * t2;
          a2 = r2 = e3 < 1 ? 1 / e3 : 1;
        }
        else if (0 === t2) {
          a2 = 1 / i3;
          r2 = 1 / s3;
        } else {
          const e3 = i3 * t2, n3 = s3 * t2;
          a2 = e3 < 1 ? 1 / e3 : 1;
          r2 = n3 < 1 ? 1 / n3 : 1;
        }
      } else {
        const o2 = Math.abs(e2 * n2 - i2 * s2), l2 = Math.hypot(e2, i2), h2 = Math.hypot(s2, n2);
        if (0 === t2) {
          a2 = h2 / o2;
          r2 = l2 / o2;
        } else {
          const e3 = t2 * o2;
          a2 = h2 > e3 ? h2 / e3 : 1;
          r2 = l2 > e3 ? l2 / e3 : 1;
        }
      }
      this._cachedScaleForStroking[0] = a2;
      this._cachedScaleForStroking[1] = r2;
    }
    return this._cachedScaleForStroking;
  }
  rescaleAndStroke(t2) {
    const { ctx: e2 } = this, { lineWidth: i2 } = this.current, [s2, n2] = this.getScaleForStroking();
    e2.lineWidth = i2 || 1;
    if (1 === s2 && 1 === n2) {
      e2.stroke();
      return;
    }
    const a2 = e2.getLineDash();
    t2 && e2.save();
    e2.scale(s2, n2);
    if (a2.length > 0) {
      const t3 = Math.max(s2, n2);
      e2.setLineDash(a2.map(((e3) => e3 / t3)));
      e2.lineDashOffset /= t3;
    }
    e2.stroke();
    t2 && e2.restore();
  }
  isContentVisible() {
    for (let t2 = this.markedContentStack.length - 1; t2 >= 0; t2--) if (!this.markedContentStack[t2].visible) return false;
    return true;
  }
};
for (const t2 in X) void 0 !== CanvasGraphics.prototype[t2] && (CanvasGraphics.prototype[X[t2]] = CanvasGraphics.prototype[t2]);
var GlobalWorkerOptions = class {
  static #ui = null;
  static #pi = "";
  static get workerPort() {
    return this.#ui;
  }
  static set workerPort(t2) {
    if (!("undefined" != typeof Worker && t2 instanceof Worker) && null !== t2) throw new Error("Invalid `workerPort` type.");
    this.#ui = t2;
  }
  static get workerSrc() {
    return this.#pi;
  }
  static set workerSrc(t2) {
    if ("string" != typeof t2) throw new Error("Invalid `workerSrc` type.");
    this.#pi = t2;
  }
};
var Metadata = class {
  #gi;
  #mi;
  constructor({ parsedData: t2, rawData: e2 }) {
    this.#gi = t2;
    this.#mi = e2;
  }
  getRaw() {
    return this.#mi;
  }
  get(t2) {
    return this.#gi.get(t2) ?? null;
  }
  getAll() {
    return objectFromMap(this.#gi);
  }
  has(t2) {
    return this.#gi.has(t2);
  }
};
var Tt = /* @__PURE__ */ Symbol("INTERNAL");
var OptionalContentGroup = class {
  #fi = false;
  #bi = false;
  #Ai = false;
  #wi = true;
  constructor(t2, { name: e2, intent: i2, usage: s2, rbGroups: n2 }) {
    this.#fi = !!(t2 & r);
    this.#bi = !!(t2 & o);
    this.name = e2;
    this.intent = i2;
    this.usage = s2;
    this.rbGroups = n2;
  }
  get visible() {
    if (this.#Ai) return this.#wi;
    if (!this.#wi) return false;
    const { print: t2, view: e2 } = this.usage;
    return this.#fi ? "OFF" !== e2?.viewState : !this.#bi || "OFF" !== t2?.printState;
  }
  _setVisible(t2, e2, i2 = false) {
    t2 !== Tt && unreachable("Internal method `_setVisible` called.");
    this.#Ai = i2;
    this.#wi = e2;
  }
};
var OptionalContentConfig = class {
  #vi = null;
  #yi = /* @__PURE__ */ new Map();
  #xi = null;
  #_i = null;
  constructor(t2, e2 = r) {
    this.renderingIntent = e2;
    this.name = null;
    this.creator = null;
    if (null !== t2) {
      this.name = t2.name;
      this.creator = t2.creator;
      this.#_i = t2.order;
      for (const i2 of t2.groups) this.#yi.set(i2.id, new OptionalContentGroup(e2, i2));
      if ("OFF" === t2.baseState) for (const t3 of this.#yi.values()) t3._setVisible(Tt, false);
      for (const e3 of t2.on) this.#yi.get(e3)._setVisible(Tt, true);
      for (const e3 of t2.off) this.#yi.get(e3)._setVisible(Tt, false);
      this.#xi = this.getHash();
    }
  }
  #Ei(t2) {
    const e2 = t2.length;
    if (e2 < 2) return true;
    const i2 = t2[0];
    for (let s2 = 1; s2 < e2; s2++) {
      const e3 = t2[s2];
      let n2;
      if (Array.isArray(e3)) n2 = this.#Ei(e3);
      else {
        if (!this.#yi.has(e3)) {
          warn(`Optional content group not found: ${e3}`);
          return true;
        }
        n2 = this.#yi.get(e3).visible;
      }
      switch (i2) {
        case "And":
          if (!n2) return false;
          break;
        case "Or":
          if (n2) return true;
          break;
        case "Not":
          return !n2;
        default:
          return true;
      }
    }
    return "And" === i2;
  }
  isVisible(t2) {
    if (0 === this.#yi.size) return true;
    if (!t2) {
      info("Optional content group not defined.");
      return true;
    }
    if ("OCG" === t2.type) {
      if (!this.#yi.has(t2.id)) {
        warn(`Optional content group not found: ${t2.id}`);
        return true;
      }
      return this.#yi.get(t2.id).visible;
    }
    if ("OCMD" === t2.type) {
      if (t2.expression) return this.#Ei(t2.expression);
      if (!t2.policy || "AnyOn" === t2.policy) {
        for (const e2 of t2.ids) {
          if (!this.#yi.has(e2)) {
            warn(`Optional content group not found: ${e2}`);
            return true;
          }
          if (this.#yi.get(e2).visible) return true;
        }
        return false;
      }
      if ("AllOn" === t2.policy) {
        for (const e2 of t2.ids) {
          if (!this.#yi.has(e2)) {
            warn(`Optional content group not found: ${e2}`);
            return true;
          }
          if (!this.#yi.get(e2).visible) return false;
        }
        return true;
      }
      if ("AnyOff" === t2.policy) {
        for (const e2 of t2.ids) {
          if (!this.#yi.has(e2)) {
            warn(`Optional content group not found: ${e2}`);
            return true;
          }
          if (!this.#yi.get(e2).visible) return true;
        }
        return false;
      }
      if ("AllOff" === t2.policy) {
        for (const e2 of t2.ids) {
          if (!this.#yi.has(e2)) {
            warn(`Optional content group not found: ${e2}`);
            return true;
          }
          if (this.#yi.get(e2).visible) return false;
        }
        return true;
      }
      warn(`Unknown optional content policy ${t2.policy}.`);
      return true;
    }
    warn(`Unknown group type ${t2.type}.`);
    return true;
  }
  setVisibility(t2, e2 = true, i2 = true) {
    const s2 = this.#yi.get(t2);
    if (s2) {
      if (i2 && e2 && s2.rbGroups.length) for (const e3 of s2.rbGroups) for (const i3 of e3) i3 !== t2 && this.#yi.get(i3)?._setVisible(Tt, false, true);
      s2._setVisible(Tt, !!e2, true);
      this.#vi = null;
    } else warn(`Optional content group not found: ${t2}`);
  }
  setOCGState({ state: t2, preserveRB: e2 }) {
    let i2;
    for (const s2 of t2) {
      switch (s2) {
        case "ON":
        case "OFF":
        case "Toggle":
          i2 = s2;
          continue;
      }
      const t3 = this.#yi.get(s2);
      if (t3) switch (i2) {
        case "ON":
          this.setVisibility(s2, true, e2);
          break;
        case "OFF":
          this.setVisibility(s2, false, e2);
          break;
        case "Toggle":
          this.setVisibility(s2, !t3.visible, e2);
      }
    }
    this.#vi = null;
  }
  get hasInitialVisibility() {
    return null === this.#xi || this.getHash() === this.#xi;
  }
  getOrder() {
    return this.#yi.size ? this.#_i ? this.#_i.slice() : [...this.#yi.keys()] : null;
  }
  getGroups() {
    return this.#yi.size > 0 ? objectFromMap(this.#yi) : null;
  }
  getGroup(t2) {
    return this.#yi.get(t2) || null;
  }
  getHash() {
    if (null !== this.#vi) return this.#vi;
    const t2 = new MurmurHash3_64();
    for (const [e2, i2] of this.#yi) t2.update(`${e2}:${i2.visible}`);
    return this.#vi = t2.hexdigest();
  }
};
var PDFDataTransportStream = class {
  constructor(t2, { disableRange: e2 = false, disableStream: i2 = false }) {
    assert(t2, 'PDFDataTransportStream - missing required "pdfDataRangeTransport" argument.');
    const { length: s2, initialData: n2, progressiveDone: a2, contentDispositionFilename: r2 } = t2;
    this._queuedChunks = [];
    this._progressiveDone = a2;
    this._contentDispositionFilename = r2;
    if (n2?.length > 0) {
      const t3 = n2 instanceof Uint8Array && n2.byteLength === n2.buffer.byteLength ? n2.buffer : new Uint8Array(n2).buffer;
      this._queuedChunks.push(t3);
    }
    this._pdfDataRangeTransport = t2;
    this._isStreamingSupported = !i2;
    this._isRangeSupported = !e2;
    this._contentLength = s2;
    this._fullRequestReader = null;
    this._rangeReaders = [];
    t2.addRangeListener(((t3, e3) => {
      this._onReceiveData({ begin: t3, chunk: e3 });
    }));
    t2.addProgressListener(((t3, e3) => {
      this._onProgress({ loaded: t3, total: e3 });
    }));
    t2.addProgressiveReadListener(((t3) => {
      this._onReceiveData({ chunk: t3 });
    }));
    t2.addProgressiveDoneListener((() => {
      this._onProgressiveDone();
    }));
    t2.transportReady();
  }
  _onReceiveData({ begin: t2, chunk: e2 }) {
    const i2 = e2 instanceof Uint8Array && e2.byteLength === e2.buffer.byteLength ? e2.buffer : new Uint8Array(e2).buffer;
    if (void 0 === t2) this._fullRequestReader ? this._fullRequestReader._enqueue(i2) : this._queuedChunks.push(i2);
    else {
      assert(this._rangeReaders.some((function(e3) {
        if (e3._begin !== t2) return false;
        e3._enqueue(i2);
        return true;
      })), "_onReceiveData - no `PDFDataTransportStreamRangeReader` instance found.");
    }
  }
  get _progressiveDataLength() {
    return this._fullRequestReader?._loaded ?? 0;
  }
  _onProgress(t2) {
    void 0 === t2.total ? this._rangeReaders[0]?.onProgress?.({ loaded: t2.loaded }) : this._fullRequestReader?.onProgress?.({ loaded: t2.loaded, total: t2.total });
  }
  _onProgressiveDone() {
    this._fullRequestReader?.progressiveDone();
    this._progressiveDone = true;
  }
  _removeRangeReader(t2) {
    const e2 = this._rangeReaders.indexOf(t2);
    e2 >= 0 && this._rangeReaders.splice(e2, 1);
  }
  getFullReader() {
    assert(!this._fullRequestReader, "PDFDataTransportStream.getFullReader can only be called once.");
    const t2 = this._queuedChunks;
    this._queuedChunks = null;
    return new PDFDataTransportStreamReader(this, t2, this._progressiveDone, this._contentDispositionFilename);
  }
  getRangeReader(t2, e2) {
    if (e2 <= this._progressiveDataLength) return null;
    const i2 = new PDFDataTransportStreamRangeReader(this, t2, e2);
    this._pdfDataRangeTransport.requestDataRange(t2, e2);
    this._rangeReaders.push(i2);
    return i2;
  }
  cancelAllRequests(t2) {
    this._fullRequestReader?.cancel(t2);
    for (const e2 of this._rangeReaders.slice(0)) e2.cancel(t2);
    this._pdfDataRangeTransport.abort();
  }
};
var PDFDataTransportStreamReader = class {
  constructor(t2, e2, i2 = false, s2 = null) {
    this._stream = t2;
    this._done = i2 || false;
    this._filename = isPdfFile(s2) ? s2 : null;
    this._queuedChunks = e2 || [];
    this._loaded = 0;
    for (const t3 of this._queuedChunks) this._loaded += t3.byteLength;
    this._requests = [];
    this._headersReady = Promise.resolve();
    t2._fullRequestReader = this;
    this.onProgress = null;
  }
  _enqueue(t2) {
    if (!this._done) {
      if (this._requests.length > 0) {
        this._requests.shift().resolve({ value: t2, done: false });
      } else this._queuedChunks.push(t2);
      this._loaded += t2.byteLength;
    }
  }
  get headersReady() {
    return this._headersReady;
  }
  get filename() {
    return this._filename;
  }
  get isRangeSupported() {
    return this._stream._isRangeSupported;
  }
  get isStreamingSupported() {
    return this._stream._isStreamingSupported;
  }
  get contentLength() {
    return this._stream._contentLength;
  }
  async read() {
    if (this._queuedChunks.length > 0) {
      return { value: this._queuedChunks.shift(), done: false };
    }
    if (this._done) return { value: void 0, done: true };
    const t2 = Promise.withResolvers();
    this._requests.push(t2);
    return t2.promise;
  }
  cancel(t2) {
    this._done = true;
    for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
    this._requests.length = 0;
  }
  progressiveDone() {
    this._done || (this._done = true);
  }
};
var PDFDataTransportStreamRangeReader = class {
  constructor(t2, e2, i2) {
    this._stream = t2;
    this._begin = e2;
    this._end = i2;
    this._queuedChunk = null;
    this._requests = [];
    this._done = false;
    this.onProgress = null;
  }
  _enqueue(t2) {
    if (!this._done) {
      if (0 === this._requests.length) this._queuedChunk = t2;
      else {
        this._requests.shift().resolve({ value: t2, done: false });
        for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
        this._requests.length = 0;
      }
      this._done = true;
      this._stream._removeRangeReader(this);
    }
  }
  get isStreamingSupported() {
    return false;
  }
  async read() {
    if (this._queuedChunk) {
      const t3 = this._queuedChunk;
      this._queuedChunk = null;
      return { value: t3, done: false };
    }
    if (this._done) return { value: void 0, done: true };
    const t2 = Promise.withResolvers();
    this._requests.push(t2);
    return t2.promise;
  }
  cancel(t2) {
    this._done = true;
    for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
    this._requests.length = 0;
    this._stream._removeRangeReader(this);
  }
};
function createHeaders(t2, e2) {
  const i2 = new Headers();
  if (!t2 || !e2 || "object" != typeof e2) return i2;
  for (const t3 in e2) {
    const s2 = e2[t3];
    void 0 !== s2 && i2.append(t3, s2);
  }
  return i2;
}
function getResponseOrigin(t2) {
  try {
    return new URL(t2).origin;
  } catch {
  }
  return null;
}
function validateRangeRequestCapabilities({ responseHeaders: t2, isHttp: e2, rangeChunkSize: i2, disableRange: s2 }) {
  const n2 = { allowRangeRequests: false, suggestedLength: void 0 }, a2 = parseInt(t2.get("Content-Length"), 10);
  if (!Number.isInteger(a2)) return n2;
  n2.suggestedLength = a2;
  if (a2 <= 2 * i2) return n2;
  if (s2 || !e2) return n2;
  if ("bytes" !== t2.get("Accept-Ranges")) return n2;
  if ("identity" !== (t2.get("Content-Encoding") || "identity")) return n2;
  n2.allowRangeRequests = true;
  return n2;
}
function extractFilenameFromHeader(t2) {
  const e2 = t2.get("Content-Disposition");
  if (e2) {
    let t3 = (function getFilenameFromContentDispositionHeader(t4) {
      let e3 = true, i2 = toParamRegExp("filename\\*", "i").exec(t4);
      if (i2) {
        i2 = i2[1];
        let t5 = rfc2616unquote(i2);
        t5 = unescape(t5);
        t5 = rfc5987decode(t5);
        t5 = rfc2047decode(t5);
        return fixupEncoding(t5);
      }
      i2 = (function rfc2231getparam(t5) {
        const e4 = [];
        let i3;
        const s2 = toParamRegExp("filename\\*((?!0\\d)\\d+)(\\*?)", "ig");
        for (; null !== (i3 = s2.exec(t5)); ) {
          let [, t6, s3, n3] = i3;
          t6 = parseInt(t6, 10);
          if (t6 in e4) {
            if (0 === t6) break;
          } else e4[t6] = [s3, n3];
        }
        const n2 = [];
        for (let t6 = 0; t6 < e4.length && t6 in e4; ++t6) {
          let [i4, s3] = e4[t6];
          s3 = rfc2616unquote(s3);
          if (i4) {
            s3 = unescape(s3);
            0 === t6 && (s3 = rfc5987decode(s3));
          }
          n2.push(s3);
        }
        return n2.join("");
      })(t4);
      if (i2) return fixupEncoding(rfc2047decode(i2));
      i2 = toParamRegExp("filename", "i").exec(t4);
      if (i2) {
        i2 = i2[1];
        let t5 = rfc2616unquote(i2);
        t5 = rfc2047decode(t5);
        return fixupEncoding(t5);
      }
      function toParamRegExp(t5, e4) {
        return new RegExp("(?:^|;)\\s*" + t5 + '\\s*=\\s*([^";\\s][^;\\s]*|"(?:[^"\\\\]|\\\\"?)+"?)', e4);
      }
      function textdecode(t5, i3) {
        if (t5) {
          if (!/^[\x00-\xFF]+$/.test(i3)) return i3;
          try {
            const s2 = new TextDecoder(t5, { fatal: true }), n2 = stringToBytes(i3);
            i3 = s2.decode(n2);
            e3 = false;
          } catch {
          }
        }
        return i3;
      }
      function fixupEncoding(t5) {
        if (e3 && /[\x80-\xff]/.test(t5)) {
          t5 = textdecode("utf-8", t5);
          e3 && (t5 = textdecode("iso-8859-1", t5));
        }
        return t5;
      }
      function rfc2616unquote(t5) {
        if (t5.startsWith('"')) {
          const e4 = t5.slice(1).split('\\"');
          for (let t6 = 0; t6 < e4.length; ++t6) {
            const i3 = e4[t6].indexOf('"');
            if (-1 !== i3) {
              e4[t6] = e4[t6].slice(0, i3);
              e4.length = t6 + 1;
            }
            e4[t6] = e4[t6].replaceAll(/\\(.)/g, "$1");
          }
          t5 = e4.join('"');
        }
        return t5;
      }
      function rfc5987decode(t5) {
        const e4 = t5.indexOf("'");
        return -1 === e4 ? t5 : textdecode(t5.slice(0, e4), t5.slice(e4 + 1).replace(/^[^']*'/, ""));
      }
      function rfc2047decode(t5) {
        return !t5.startsWith("=?") || /[\x00-\x19\x80-\xff]/.test(t5) ? t5 : t5.replaceAll(/=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g, (function(t6, e4, i3, s2) {
          if ("q" === i3 || "Q" === i3) return textdecode(e4, s2 = (s2 = s2.replaceAll("_", " ")).replaceAll(/=([0-9a-fA-F]{2})/g, (function(t7, e5) {
            return String.fromCharCode(parseInt(e5, 16));
          })));
          try {
            s2 = atob(s2);
          } catch {
          }
          return textdecode(e4, s2);
        }));
      }
      return "";
    })(e2);
    if (t3.includes("%")) try {
      t3 = decodeURIComponent(t3);
    } catch {
    }
    if (isPdfFile(t3)) return t3;
  }
  return null;
}
function createResponseStatusError(t2, e2) {
  return 404 === t2 || 0 === t2 && e2.startsWith("file:") ? new MissingPDFException('Missing PDF "' + e2 + '".') : new UnexpectedResponseException(`Unexpected server response (${t2}) while retrieving PDF "${e2}".`, t2);
}
function validateResponseStatus(t2) {
  return 200 === t2 || 206 === t2;
}
function createFetchOptions(t2, e2, i2) {
  return { method: "GET", headers: t2, signal: i2.signal, mode: "cors", credentials: e2 ? "include" : "same-origin", redirect: "follow" };
}
function getArrayBuffer(t2) {
  if (t2 instanceof Uint8Array) return t2.buffer;
  if (t2 instanceof ArrayBuffer) return t2;
  warn(`getArrayBuffer - unexpected data format: ${t2}`);
  return new Uint8Array(t2).buffer;
}
var PDFFetchStream = class {
  _responseOrigin = null;
  constructor(t2) {
    this.source = t2;
    this.isHttp = /^https?:/i.test(t2.url);
    this.headers = createHeaders(this.isHttp, t2.httpHeaders);
    this._fullRequestReader = null;
    this._rangeRequestReaders = [];
  }
  get _progressiveDataLength() {
    return this._fullRequestReader?._loaded ?? 0;
  }
  getFullReader() {
    assert(!this._fullRequestReader, "PDFFetchStream.getFullReader can only be called once.");
    this._fullRequestReader = new PDFFetchStreamReader(this);
    return this._fullRequestReader;
  }
  getRangeReader(t2, e2) {
    if (e2 <= this._progressiveDataLength) return null;
    const i2 = new PDFFetchStreamRangeReader(this, t2, e2);
    this._rangeRequestReaders.push(i2);
    return i2;
  }
  cancelAllRequests(t2) {
    this._fullRequestReader?.cancel(t2);
    for (const e2 of this._rangeRequestReaders.slice(0)) e2.cancel(t2);
  }
};
var PDFFetchStreamReader = class {
  constructor(t2) {
    this._stream = t2;
    this._reader = null;
    this._loaded = 0;
    this._filename = null;
    const e2 = t2.source;
    this._withCredentials = e2.withCredentials || false;
    this._contentLength = e2.length;
    this._headersCapability = Promise.withResolvers();
    this._disableRange = e2.disableRange || false;
    this._rangeChunkSize = e2.rangeChunkSize;
    this._rangeChunkSize || this._disableRange || (this._disableRange = true);
    this._abortController = new AbortController();
    this._isStreamingSupported = !e2.disableStream;
    this._isRangeSupported = !e2.disableRange;
    const i2 = new Headers(t2.headers), s2 = e2.url;
    fetch(s2, createFetchOptions(i2, this._withCredentials, this._abortController)).then(((e3) => {
      t2._responseOrigin = getResponseOrigin(e3.url);
      if (!validateResponseStatus(e3.status)) throw createResponseStatusError(e3.status, s2);
      this._reader = e3.body.getReader();
      this._headersCapability.resolve();
      const i3 = e3.headers, { allowRangeRequests: n2, suggestedLength: a2 } = validateRangeRequestCapabilities({ responseHeaders: i3, isHttp: t2.isHttp, rangeChunkSize: this._rangeChunkSize, disableRange: this._disableRange });
      this._isRangeSupported = n2;
      this._contentLength = a2 || this._contentLength;
      this._filename = extractFilenameFromHeader(i3);
      !this._isStreamingSupported && this._isRangeSupported && this.cancel(new AbortException("Streaming is disabled."));
    })).catch(this._headersCapability.reject);
    this.onProgress = null;
  }
  get headersReady() {
    return this._headersCapability.promise;
  }
  get filename() {
    return this._filename;
  }
  get contentLength() {
    return this._contentLength;
  }
  get isRangeSupported() {
    return this._isRangeSupported;
  }
  get isStreamingSupported() {
    return this._isStreamingSupported;
  }
  async read() {
    await this._headersCapability.promise;
    const { value: t2, done: e2 } = await this._reader.read();
    if (e2) return { value: t2, done: e2 };
    this._loaded += t2.byteLength;
    this.onProgress?.({ loaded: this._loaded, total: this._contentLength });
    return { value: getArrayBuffer(t2), done: false };
  }
  cancel(t2) {
    this._reader?.cancel(t2);
    this._abortController.abort();
  }
};
var PDFFetchStreamRangeReader = class {
  constructor(t2, e2, i2) {
    this._stream = t2;
    this._reader = null;
    this._loaded = 0;
    const s2 = t2.source;
    this._withCredentials = s2.withCredentials || false;
    this._readCapability = Promise.withResolvers();
    this._isStreamingSupported = !s2.disableStream;
    this._abortController = new AbortController();
    const n2 = new Headers(t2.headers);
    n2.append("Range", `bytes=${e2}-${i2 - 1}`);
    const a2 = s2.url;
    fetch(a2, createFetchOptions(n2, this._withCredentials, this._abortController)).then(((e3) => {
      const i3 = getResponseOrigin(e3.url);
      if (i3 !== t2._responseOrigin) throw new Error(`Expected range response-origin "${i3}" to match "${t2._responseOrigin}".`);
      if (!validateResponseStatus(e3.status)) throw createResponseStatusError(e3.status, a2);
      this._readCapability.resolve();
      this._reader = e3.body.getReader();
    })).catch(this._readCapability.reject);
    this.onProgress = null;
  }
  get isStreamingSupported() {
    return this._isStreamingSupported;
  }
  async read() {
    await this._readCapability.promise;
    const { value: t2, done: e2 } = await this._reader.read();
    if (e2) return { value: t2, done: e2 };
    this._loaded += t2.byteLength;
    this.onProgress?.({ loaded: this._loaded });
    return { value: getArrayBuffer(t2), done: false };
  }
  cancel(t2) {
    this._reader?.cancel(t2);
    this._abortController.abort();
  }
};
var NetworkManager = class {
  _responseOrigin = null;
  constructor({ url: t2, httpHeaders: e2, withCredentials: i2 }) {
    this.url = t2;
    this.isHttp = /^https?:/i.test(t2);
    this.headers = createHeaders(this.isHttp, e2);
    this.withCredentials = i2 || false;
    this.currXhrId = 0;
    this.pendingRequests = /* @__PURE__ */ Object.create(null);
  }
  request(t2) {
    const e2 = new XMLHttpRequest(), i2 = this.currXhrId++, s2 = this.pendingRequests[i2] = { xhr: e2 };
    e2.open("GET", this.url);
    e2.withCredentials = this.withCredentials;
    for (const [t3, i3] of this.headers) e2.setRequestHeader(t3, i3);
    if (this.isHttp && "begin" in t2 && "end" in t2) {
      e2.setRequestHeader("Range", `bytes=${t2.begin}-${t2.end - 1}`);
      s2.expectedStatus = 206;
    } else s2.expectedStatus = 200;
    e2.responseType = "arraybuffer";
    assert(t2.onError, "Expected `onError` callback to be provided.");
    e2.onerror = () => {
      t2.onError(e2.status);
    };
    e2.onreadystatechange = this.onStateChange.bind(this, i2);
    e2.onprogress = this.onProgress.bind(this, i2);
    s2.onHeadersReceived = t2.onHeadersReceived;
    s2.onDone = t2.onDone;
    s2.onError = t2.onError;
    s2.onProgress = t2.onProgress;
    e2.send(null);
    return i2;
  }
  onProgress(t2, e2) {
    const i2 = this.pendingRequests[t2];
    i2 && i2.onProgress?.(e2);
  }
  onStateChange(t2, e2) {
    const i2 = this.pendingRequests[t2];
    if (!i2) return;
    const s2 = i2.xhr;
    if (s2.readyState >= 2 && i2.onHeadersReceived) {
      i2.onHeadersReceived();
      delete i2.onHeadersReceived;
    }
    if (4 !== s2.readyState) return;
    if (!(t2 in this.pendingRequests)) return;
    delete this.pendingRequests[t2];
    if (0 === s2.status && this.isHttp) {
      i2.onError(s2.status);
      return;
    }
    const n2 = s2.status || 200;
    if (!(200 === n2 && 206 === i2.expectedStatus) && n2 !== i2.expectedStatus) {
      i2.onError(s2.status);
      return;
    }
    const a2 = (function network_getArrayBuffer(t3) {
      const e3 = t3.response;
      return "string" != typeof e3 ? e3 : stringToBytes(e3).buffer;
    })(s2);
    if (206 === n2) {
      const t3 = s2.getResponseHeader("Content-Range"), e3 = /bytes (\d+)-(\d+)\/(\d+)/.exec(t3);
      if (e3) i2.onDone({ begin: parseInt(e3[1], 10), chunk: a2 });
      else {
        warn('Missing or invalid "Content-Range" header.');
        i2.onError(0);
      }
    } else a2 ? i2.onDone({ begin: 0, chunk: a2 }) : i2.onError(s2.status);
  }
  getRequestXhr(t2) {
    return this.pendingRequests[t2].xhr;
  }
  isPendingRequest(t2) {
    return t2 in this.pendingRequests;
  }
  abortRequest(t2) {
    const e2 = this.pendingRequests[t2].xhr;
    delete this.pendingRequests[t2];
    e2.abort();
  }
};
var PDFNetworkStream = class {
  constructor(t2) {
    this._source = t2;
    this._manager = new NetworkManager(t2);
    this._rangeChunkSize = t2.rangeChunkSize;
    this._fullRequestReader = null;
    this._rangeRequestReaders = [];
  }
  _onRangeRequestReaderClosed(t2) {
    const e2 = this._rangeRequestReaders.indexOf(t2);
    e2 >= 0 && this._rangeRequestReaders.splice(e2, 1);
  }
  getFullReader() {
    assert(!this._fullRequestReader, "PDFNetworkStream.getFullReader can only be called once.");
    this._fullRequestReader = new PDFNetworkStreamFullRequestReader(this._manager, this._source);
    return this._fullRequestReader;
  }
  getRangeReader(t2, e2) {
    const i2 = new PDFNetworkStreamRangeRequestReader(this._manager, t2, e2);
    i2.onClosed = this._onRangeRequestReaderClosed.bind(this);
    this._rangeRequestReaders.push(i2);
    return i2;
  }
  cancelAllRequests(t2) {
    this._fullRequestReader?.cancel(t2);
    for (const e2 of this._rangeRequestReaders.slice(0)) e2.cancel(t2);
  }
};
var PDFNetworkStreamFullRequestReader = class {
  constructor(t2, e2) {
    this._manager = t2;
    this._url = e2.url;
    this._fullRequestId = t2.request({ onHeadersReceived: this._onHeadersReceived.bind(this), onDone: this._onDone.bind(this), onError: this._onError.bind(this), onProgress: this._onProgress.bind(this) });
    this._headersCapability = Promise.withResolvers();
    this._disableRange = e2.disableRange || false;
    this._contentLength = e2.length;
    this._rangeChunkSize = e2.rangeChunkSize;
    this._rangeChunkSize || this._disableRange || (this._disableRange = true);
    this._isStreamingSupported = false;
    this._isRangeSupported = false;
    this._cachedChunks = [];
    this._requests = [];
    this._done = false;
    this._storedError = void 0;
    this._filename = null;
    this.onProgress = null;
  }
  _onHeadersReceived() {
    const t2 = this._fullRequestId, e2 = this._manager.getRequestXhr(t2);
    this._manager._responseOrigin = getResponseOrigin(e2.responseURL);
    const i2 = e2.getAllResponseHeaders(), s2 = new Headers(i2 ? i2.trimStart().replace(/[^\S ]+$/, "").split(/[\r\n]+/).map(((t3) => {
      const [e3, ...i3] = t3.split(": ");
      return [e3, i3.join(": ")];
    })) : []), { allowRangeRequests: n2, suggestedLength: a2 } = validateRangeRequestCapabilities({ responseHeaders: s2, isHttp: this._manager.isHttp, rangeChunkSize: this._rangeChunkSize, disableRange: this._disableRange });
    n2 && (this._isRangeSupported = true);
    this._contentLength = a2 || this._contentLength;
    this._filename = extractFilenameFromHeader(s2);
    this._isRangeSupported && this._manager.abortRequest(t2);
    this._headersCapability.resolve();
  }
  _onDone(t2) {
    if (t2) if (this._requests.length > 0) {
      this._requests.shift().resolve({ value: t2.chunk, done: false });
    } else this._cachedChunks.push(t2.chunk);
    this._done = true;
    if (!(this._cachedChunks.length > 0)) {
      for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
      this._requests.length = 0;
    }
  }
  _onError(t2) {
    this._storedError = createResponseStatusError(t2, this._url);
    this._headersCapability.reject(this._storedError);
    for (const t3 of this._requests) t3.reject(this._storedError);
    this._requests.length = 0;
    this._cachedChunks.length = 0;
  }
  _onProgress(t2) {
    this.onProgress?.({ loaded: t2.loaded, total: t2.lengthComputable ? t2.total : this._contentLength });
  }
  get filename() {
    return this._filename;
  }
  get isRangeSupported() {
    return this._isRangeSupported;
  }
  get isStreamingSupported() {
    return this._isStreamingSupported;
  }
  get contentLength() {
    return this._contentLength;
  }
  get headersReady() {
    return this._headersCapability.promise;
  }
  async read() {
    await this._headersCapability.promise;
    if (this._storedError) throw this._storedError;
    if (this._cachedChunks.length > 0) {
      return { value: this._cachedChunks.shift(), done: false };
    }
    if (this._done) return { value: void 0, done: true };
    const t2 = Promise.withResolvers();
    this._requests.push(t2);
    return t2.promise;
  }
  cancel(t2) {
    this._done = true;
    this._headersCapability.reject(t2);
    for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
    this._requests.length = 0;
    this._manager.isPendingRequest(this._fullRequestId) && this._manager.abortRequest(this._fullRequestId);
    this._fullRequestReader = null;
  }
};
var PDFNetworkStreamRangeRequestReader = class {
  constructor(t2, e2, i2) {
    this._manager = t2;
    this._url = t2.url;
    this._requestId = t2.request({ begin: e2, end: i2, onHeadersReceived: this._onHeadersReceived.bind(this), onDone: this._onDone.bind(this), onError: this._onError.bind(this), onProgress: this._onProgress.bind(this) });
    this._requests = [];
    this._queuedChunk = null;
    this._done = false;
    this._storedError = void 0;
    this.onProgress = null;
    this.onClosed = null;
  }
  _onHeadersReceived() {
    const t2 = getResponseOrigin(this._manager.getRequestXhr(this._requestId)?.responseURL);
    if (t2 !== this._manager._responseOrigin) {
      this._storedError = new Error(`Expected range response-origin "${t2}" to match "${this._manager._responseOrigin}".`);
      this._onError(0);
    }
  }
  _close() {
    this.onClosed?.(this);
  }
  _onDone(t2) {
    const e2 = t2.chunk;
    if (this._requests.length > 0) {
      this._requests.shift().resolve({ value: e2, done: false });
    } else this._queuedChunk = e2;
    this._done = true;
    for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
    this._requests.length = 0;
    this._close();
  }
  _onError(t2) {
    this._storedError ??= createResponseStatusError(t2, this._url);
    for (const t3 of this._requests) t3.reject(this._storedError);
    this._requests.length = 0;
    this._queuedChunk = null;
  }
  _onProgress(t2) {
    this.isStreamingSupported || this.onProgress?.({ loaded: t2.loaded });
  }
  get isStreamingSupported() {
    return false;
  }
  async read() {
    if (this._storedError) throw this._storedError;
    if (null !== this._queuedChunk) {
      const t3 = this._queuedChunk;
      this._queuedChunk = null;
      return { value: t3, done: false };
    }
    if (this._done) return { value: void 0, done: true };
    const t2 = Promise.withResolvers();
    this._requests.push(t2);
    return t2.promise;
  }
  cancel(t2) {
    this._done = true;
    for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
    this._requests.length = 0;
    this._manager.isPendingRequest(this._requestId) && this._manager.abortRequest(this._requestId);
    this._close();
  }
};
var Mt = /^[a-z][a-z0-9\-+.]+:/i;
var PDFNodeStream = class {
  constructor(t2) {
    this.source = t2;
    this.url = (function parseUrlOrPath(t3) {
      if (Mt.test(t3)) return new URL(t3);
      const e2 = process.getBuiltinModule("url");
      return new URL(e2.pathToFileURL(t3));
    })(t2.url);
    assert("file:" === this.url.protocol, "PDFNodeStream only supports file:// URLs.");
    this._fullRequestReader = null;
    this._rangeRequestReaders = [];
  }
  get _progressiveDataLength() {
    return this._fullRequestReader?._loaded ?? 0;
  }
  getFullReader() {
    assert(!this._fullRequestReader, "PDFNodeStream.getFullReader can only be called once.");
    this._fullRequestReader = new PDFNodeStreamFsFullReader(this);
    return this._fullRequestReader;
  }
  getRangeReader(t2, e2) {
    if (e2 <= this._progressiveDataLength) return null;
    const i2 = new PDFNodeStreamFsRangeReader(this, t2, e2);
    this._rangeRequestReaders.push(i2);
    return i2;
  }
  cancelAllRequests(t2) {
    this._fullRequestReader?.cancel(t2);
    for (const e2 of this._rangeRequestReaders.slice(0)) e2.cancel(t2);
  }
};
var PDFNodeStreamFsFullReader = class {
  constructor(t2) {
    this._url = t2.url;
    this._done = false;
    this._storedError = null;
    this.onProgress = null;
    const e2 = t2.source;
    this._contentLength = e2.length;
    this._loaded = 0;
    this._filename = null;
    this._disableRange = e2.disableRange || false;
    this._rangeChunkSize = e2.rangeChunkSize;
    this._rangeChunkSize || this._disableRange || (this._disableRange = true);
    this._isStreamingSupported = !e2.disableStream;
    this._isRangeSupported = !e2.disableRange;
    this._readableStream = null;
    this._readCapability = Promise.withResolvers();
    this._headersCapability = Promise.withResolvers();
    const i2 = process.getBuiltinModule("fs");
    i2.promises.lstat(this._url).then(((t3) => {
      this._contentLength = t3.size;
      this._setReadableStream(i2.createReadStream(this._url));
      this._headersCapability.resolve();
    }), ((t3) => {
      "ENOENT" === t3.code && (t3 = new MissingPDFException(`Missing PDF "${this._url}".`));
      this._storedError = t3;
      this._headersCapability.reject(t3);
    }));
  }
  get headersReady() {
    return this._headersCapability.promise;
  }
  get filename() {
    return this._filename;
  }
  get contentLength() {
    return this._contentLength;
  }
  get isRangeSupported() {
    return this._isRangeSupported;
  }
  get isStreamingSupported() {
    return this._isStreamingSupported;
  }
  async read() {
    await this._readCapability.promise;
    if (this._done) return { value: void 0, done: true };
    if (this._storedError) throw this._storedError;
    const t2 = this._readableStream.read();
    if (null === t2) {
      this._readCapability = Promise.withResolvers();
      return this.read();
    }
    this._loaded += t2.length;
    this.onProgress?.({ loaded: this._loaded, total: this._contentLength });
    return { value: new Uint8Array(t2).buffer, done: false };
  }
  cancel(t2) {
    this._readableStream ? this._readableStream.destroy(t2) : this._error(t2);
  }
  _error(t2) {
    this._storedError = t2;
    this._readCapability.resolve();
  }
  _setReadableStream(t2) {
    this._readableStream = t2;
    t2.on("readable", (() => {
      this._readCapability.resolve();
    }));
    t2.on("end", (() => {
      t2.destroy();
      this._done = true;
      this._readCapability.resolve();
    }));
    t2.on("error", ((t3) => {
      this._error(t3);
    }));
    !this._isStreamingSupported && this._isRangeSupported && this._error(new AbortException("streaming is disabled"));
    this._storedError && this._readableStream.destroy(this._storedError);
  }
};
var PDFNodeStreamFsRangeReader = class {
  constructor(t2, e2, i2) {
    this._url = t2.url;
    this._done = false;
    this._storedError = null;
    this.onProgress = null;
    this._loaded = 0;
    this._readableStream = null;
    this._readCapability = Promise.withResolvers();
    const s2 = t2.source;
    this._isStreamingSupported = !s2.disableStream;
    const n2 = process.getBuiltinModule("fs");
    this._setReadableStream(n2.createReadStream(this._url, { start: e2, end: i2 - 1 }));
  }
  get isStreamingSupported() {
    return this._isStreamingSupported;
  }
  async read() {
    await this._readCapability.promise;
    if (this._done) return { value: void 0, done: true };
    if (this._storedError) throw this._storedError;
    const t2 = this._readableStream.read();
    if (null === t2) {
      this._readCapability = Promise.withResolvers();
      return this.read();
    }
    this._loaded += t2.length;
    this.onProgress?.({ loaded: this._loaded });
    return { value: new Uint8Array(t2).buffer, done: false };
  }
  cancel(t2) {
    this._readableStream ? this._readableStream.destroy(t2) : this._error(t2);
  }
  _error(t2) {
    this._storedError = t2;
    this._readCapability.resolve();
  }
  _setReadableStream(t2) {
    this._readableStream = t2;
    t2.on("readable", (() => {
      this._readCapability.resolve();
    }));
    t2.on("end", (() => {
      t2.destroy();
      this._done = true;
      this._readCapability.resolve();
    }));
    t2.on("error", ((t3) => {
      this._error(t3);
    }));
    this._storedError && this._readableStream.destroy(this._storedError);
  }
};
var Pt = 30;
var TextLayer = class _TextLayer {
  #Si = Promise.withResolvers();
  #pt = null;
  #Ci = false;
  #Ti = !!globalThis.FontInspector?.enabled;
  #Mi = null;
  #Pi = null;
  #Di = 0;
  #ki = 0;
  #Ri = null;
  #Ii = null;
  #Fi = 0;
  #Li = 0;
  #Oi = /* @__PURE__ */ Object.create(null);
  #Ni = [];
  #Bi = null;
  #Hi = [];
  #zi = /* @__PURE__ */ new WeakMap();
  #Ui = null;
  static #Gi = /* @__PURE__ */ new Map();
  static #$i = /* @__PURE__ */ new Map();
  static #Vi = /* @__PURE__ */ new WeakMap();
  static #ji = null;
  static #Wi = /* @__PURE__ */ new Set();
  constructor({ textContentSource: t2, container: e2, viewport: i2 }) {
    if (t2 instanceof ReadableStream) this.#Bi = t2;
    else {
      if ("object" != typeof t2) throw new Error('No "textContentSource" parameter specified.');
      this.#Bi = new ReadableStream({ start(e3) {
        e3.enqueue(t2);
        e3.close();
      } });
    }
    this.#pt = this.#Ii = e2;
    this.#Li = i2.scale * (globalThis.devicePixelRatio || 1);
    this.#Fi = i2.rotation;
    this.#Pi = { div: null, properties: null, ctx: null };
    const { pageWidth: s2, pageHeight: n2, pageX: a2, pageY: r2 } = i2.rawDims;
    this.#Ui = [1, 0, 0, -1, -a2, r2 + n2];
    this.#ki = s2;
    this.#Di = n2;
    _TextLayer.#qi();
    setLayerDimensions(e2, i2);
    this.#Si.promise.finally((() => {
      _TextLayer.#Wi.delete(this);
      this.#Pi = null;
      this.#Oi = null;
    })).catch((() => {
    }));
  }
  static get fontFamilyMap() {
    const { isWindows: t2, isFirefox: e2 } = util_FeatureTest.platform;
    return shadow(this, "fontFamilyMap", /* @__PURE__ */ new Map([["sans-serif", (t2 && e2 ? "Calibri, " : "") + "sans-serif"], ["monospace", (t2 && e2 ? "Lucida Console, " : "") + "monospace"]]));
  }
  render() {
    const pump = () => {
      this.#Ri.read().then((({ value: t2, done: e2 }) => {
        if (e2) this.#Si.resolve();
        else {
          this.#Mi ??= t2.lang;
          Object.assign(this.#Oi, t2.styles);
          this.#Xi(t2.items);
          pump();
        }
      }), this.#Si.reject);
    };
    this.#Ri = this.#Bi.getReader();
    _TextLayer.#Wi.add(this);
    pump();
    return this.#Si.promise;
  }
  update({ viewport: t2, onBefore: e2 = null }) {
    const i2 = t2.scale * (globalThis.devicePixelRatio || 1), s2 = t2.rotation;
    if (s2 !== this.#Fi) {
      e2?.();
      this.#Fi = s2;
      setLayerDimensions(this.#Ii, { rotation: s2 });
    }
    if (i2 !== this.#Li) {
      e2?.();
      this.#Li = i2;
      const t3 = { div: null, properties: null, ctx: _TextLayer.#Ki(this.#Mi) };
      for (const e3 of this.#Hi) {
        t3.properties = this.#zi.get(e3);
        t3.div = e3;
        this.#Yi(t3);
      }
    }
  }
  cancel() {
    const t2 = new AbortException("TextLayer task cancelled.");
    this.#Ri?.cancel(t2).catch((() => {
    }));
    this.#Ri = null;
    this.#Si.reject(t2);
  }
  get textDivs() {
    return this.#Hi;
  }
  get textContentItemsStr() {
    return this.#Ni;
  }
  #Xi(t2) {
    if (this.#Ci) return;
    this.#Pi.ctx ??= _TextLayer.#Ki(this.#Mi);
    const e2 = this.#Hi, i2 = this.#Ni;
    for (const s2 of t2) {
      if (e2.length > 1e5) {
        warn("Ignoring additional textDivs for performance reasons.");
        this.#Ci = true;
        return;
      }
      if (void 0 !== s2.str) {
        i2.push(s2.str);
        this.#Qi(s2);
      } else if ("beginMarkedContentProps" === s2.type || "beginMarkedContent" === s2.type) {
        const t3 = this.#pt;
        this.#pt = document.createElement("span");
        this.#pt.classList.add("markedContent");
        null !== s2.id && this.#pt.setAttribute("id", `${s2.id}`);
        t3.append(this.#pt);
      } else "endMarkedContent" === s2.type && (this.#pt = this.#pt.parentNode);
    }
  }
  #Qi(t2) {
    const e2 = document.createElement("span"), i2 = { angle: 0, canvasWidth: 0, hasText: "" !== t2.str, hasEOL: t2.hasEOL, fontSize: 0 };
    this.#Hi.push(e2);
    const s2 = Util.transform(this.#Ui, t2.transform);
    let n2 = Math.atan2(s2[1], s2[0]);
    const a2 = this.#Oi[t2.fontName];
    a2.vertical && (n2 += Math.PI / 2);
    let r2 = this.#Ti && a2.fontSubstitution || a2.fontFamily;
    r2 = _TextLayer.fontFamilyMap.get(r2) || r2;
    const o2 = Math.hypot(s2[2], s2[3]), l2 = o2 * _TextLayer.#Ji(r2, this.#Mi);
    let h2, d2;
    if (0 === n2) {
      h2 = s2[4];
      d2 = s2[5] - l2;
    } else {
      h2 = s2[4] + l2 * Math.sin(n2);
      d2 = s2[5] - l2 * Math.cos(n2);
    }
    const c2 = "calc(var(--scale-factor)*", u2 = e2.style;
    if (this.#pt === this.#Ii) {
      u2.left = `${(100 * h2 / this.#ki).toFixed(2)}%`;
      u2.top = `${(100 * d2 / this.#Di).toFixed(2)}%`;
    } else {
      u2.left = `${c2}${h2.toFixed(2)}px)`;
      u2.top = `${c2}${d2.toFixed(2)}px)`;
    }
    u2.fontSize = `${c2}${(_TextLayer.#ji * o2).toFixed(2)}px)`;
    u2.fontFamily = r2;
    i2.fontSize = o2;
    e2.setAttribute("role", "presentation");
    e2.textContent = t2.str;
    e2.dir = t2.dir;
    this.#Ti && (e2.dataset.fontName = a2.fontSubstitutionLoadedName || t2.fontName);
    0 !== n2 && (i2.angle = n2 * (180 / Math.PI));
    let p2 = false;
    if (t2.str.length > 1) p2 = true;
    else if (" " !== t2.str && t2.transform[0] !== t2.transform[3]) {
      const e3 = Math.abs(t2.transform[0]), i3 = Math.abs(t2.transform[3]);
      e3 !== i3 && Math.max(e3, i3) / Math.min(e3, i3) > 1.5 && (p2 = true);
    }
    p2 && (i2.canvasWidth = a2.vertical ? t2.height : t2.width);
    this.#zi.set(e2, i2);
    this.#Pi.div = e2;
    this.#Pi.properties = i2;
    this.#Yi(this.#Pi);
    i2.hasText && this.#pt.append(e2);
    if (i2.hasEOL) {
      const t3 = document.createElement("br");
      t3.setAttribute("role", "presentation");
      this.#pt.append(t3);
    }
  }
  #Yi(t2) {
    const { div: e2, properties: i2, ctx: s2 } = t2, { style: n2 } = e2;
    let a2 = "";
    _TextLayer.#ji > 1 && (a2 = `scale(${1 / _TextLayer.#ji})`);
    if (0 !== i2.canvasWidth && i2.hasText) {
      const { fontFamily: t3 } = n2, { canvasWidth: r2, fontSize: o2 } = i2;
      _TextLayer.#Zi(s2, o2 * this.#Li, t3);
      const { width: l2 } = s2.measureText(e2.textContent);
      l2 > 0 && (a2 = `scaleX(${r2 * this.#Li / l2}) ${a2}`);
    }
    0 !== i2.angle && (a2 = `rotate(${i2.angle}deg) ${a2}`);
    a2.length > 0 && (n2.transform = a2);
  }
  static cleanup() {
    if (!(this.#Wi.size > 0)) {
      this.#Gi.clear();
      for (const { canvas: t2 } of this.#$i.values()) t2.remove();
      this.#$i.clear();
    }
  }
  static #Ki(t2 = null) {
    let e2 = this.#$i.get(t2 ||= "");
    if (!e2) {
      const i2 = document.createElement("canvas");
      i2.className = "hiddenCanvasElement";
      i2.lang = t2;
      document.body.append(i2);
      e2 = i2.getContext("2d", { alpha: false, willReadFrequently: true });
      this.#$i.set(t2, e2);
      this.#Vi.set(e2, { size: 0, family: "" });
    }
    return e2;
  }
  static #Zi(t2, e2, i2) {
    const s2 = this.#Vi.get(t2);
    if (e2 !== s2.size || i2 !== s2.family) {
      t2.font = `${e2}px ${i2}`;
      s2.size = e2;
      s2.family = i2;
    }
  }
  static #qi() {
    if (null !== this.#ji) return;
    const t2 = document.createElement("div");
    t2.style.opacity = 0;
    t2.style.lineHeight = 1;
    t2.style.fontSize = "1px";
    t2.style.position = "absolute";
    t2.textContent = "X";
    document.body.append(t2);
    this.#ji = t2.getBoundingClientRect().height;
    t2.remove();
  }
  static #Ji(t2, e2) {
    const i2 = this.#Gi.get(t2);
    if (i2) return i2;
    const s2 = this.#Ki(e2);
    s2.canvas.width = s2.canvas.height = Pt;
    this.#Zi(s2, Pt, t2);
    const n2 = s2.measureText("");
    let a2 = n2.fontBoundingBoxAscent, r2 = Math.abs(n2.fontBoundingBoxDescent);
    if (a2) {
      const e3 = a2 / (a2 + r2);
      this.#Gi.set(t2, e3);
      s2.canvas.width = s2.canvas.height = 0;
      return e3;
    }
    s2.strokeStyle = "red";
    s2.clearRect(0, 0, Pt, Pt);
    s2.strokeText("g", 0, 0);
    let o2 = s2.getImageData(0, 0, Pt, Pt).data;
    r2 = 0;
    for (let t3 = o2.length - 1 - 3; t3 >= 0; t3 -= 4) if (o2[t3] > 0) {
      r2 = Math.ceil(t3 / 4 / Pt);
      break;
    }
    s2.clearRect(0, 0, Pt, Pt);
    s2.strokeText("A", 0, Pt);
    o2 = s2.getImageData(0, 0, Pt, Pt).data;
    a2 = 0;
    for (let t3 = 0, e3 = o2.length; t3 < e3; t3 += 4) if (o2[t3] > 0) {
      a2 = Pt - Math.floor(t3 / 4 / Pt);
      break;
    }
    s2.canvas.width = s2.canvas.height = 0;
    const l2 = a2 ? a2 / (a2 + r2) : 0.8;
    this.#Gi.set(t2, l2);
    return l2;
  }
};
var XfaText = class _XfaText {
  static textContent(t2) {
    const e2 = [], i2 = { items: e2, styles: /* @__PURE__ */ Object.create(null) };
    !(function walk(t3) {
      if (!t3) return;
      let i3 = null;
      const s2 = t3.name;
      if ("#text" === s2) i3 = t3.value;
      else {
        if (!_XfaText.shouldBuildText(s2)) return;
        t3?.attributes?.textContent ? i3 = t3.attributes.textContent : t3.value && (i3 = t3.value);
      }
      null !== i3 && e2.push({ str: i3 });
      if (t3.children) for (const e3 of t3.children) walk(e3);
    })(t2);
    return i2;
  }
  static shouldBuildText(t2) {
    return !("textarea" === t2 || "input" === t2 || "option" === t2 || "select" === t2);
  }
};
var Dt = 65536;
var kt = e ? class NodeCanvasFactory extends BaseCanvasFactory {
  _createCanvas(t2, e2) {
    return process.getBuiltinModule("module").createRequire(import.meta.url)("@napi-rs/canvas").createCanvas(t2, e2);
  }
} : class DOMCanvasFactory extends BaseCanvasFactory {
  constructor({ ownerDocument: t2 = globalThis.document, enableHWA: e2 = false }) {
    super({ enableHWA: e2 });
    this._document = t2;
  }
  _createCanvas(t2, e2) {
    const i2 = this._document.createElement("canvas");
    i2.width = t2;
    i2.height = e2;
    return i2;
  }
};
var Rt = e ? class NodeCMapReaderFactory extends BaseCMapReaderFactory {
  async _fetch(t2) {
    return node_utils_fetchData(t2);
  }
} : DOMCMapReaderFactory;
var It = e ? class NodeFilterFactory extends BaseFilterFactory {
} : class DOMFilterFactory extends BaseFilterFactory {
  #ts;
  #es;
  #is;
  #ss;
  #ns;
  #as;
  #w = 0;
  constructor({ docId: t2, ownerDocument: e2 = globalThis.document }) {
    super();
    this.#ss = t2;
    this.#ns = e2;
  }
  get #y() {
    return this.#es ||= /* @__PURE__ */ new Map();
  }
  get #rs() {
    return this.#as ||= /* @__PURE__ */ new Map();
  }
  get #os() {
    if (!this.#is) {
      const t2 = this.#ns.createElement("div"), { style: e2 } = t2;
      e2.visibility = "hidden";
      e2.contain = "strict";
      e2.width = e2.height = 0;
      e2.position = "absolute";
      e2.top = e2.left = 0;
      e2.zIndex = -1;
      const i2 = this.#ns.createElementNS(it, "svg");
      i2.setAttribute("width", 0);
      i2.setAttribute("height", 0);
      this.#is = this.#ns.createElementNS(it, "defs");
      t2.append(i2);
      i2.append(this.#is);
      this.#ns.body.append(t2);
    }
    return this.#is;
  }
  #ls(t2) {
    if (1 === t2.length) {
      const e3 = t2[0], i3 = new Array(256);
      for (let t3 = 0; t3 < 256; t3++) i3[t3] = e3[t3] / 255;
      const s3 = i3.join(",");
      return [s3, s3, s3];
    }
    const [e2, i2, s2] = t2, n2 = new Array(256), a2 = new Array(256), r2 = new Array(256);
    for (let t3 = 0; t3 < 256; t3++) {
      n2[t3] = e2[t3] / 255;
      a2[t3] = i2[t3] / 255;
      r2[t3] = s2[t3] / 255;
    }
    return [n2.join(","), a2.join(","), r2.join(",")];
  }
  #hs(t2) {
    if (void 0 === this.#ts) {
      this.#ts = "";
      const t3 = this.#ns.URL;
      t3 !== this.#ns.baseURI && (isDataScheme(t3) ? warn('#createUrl: ignore "data:"-URL for performance reasons.') : this.#ts = t3.split("#", 1)[0]);
    }
    return `url(${this.#ts}#${t2})`;
  }
  addFilter(t2) {
    if (!t2) return "none";
    let e2 = this.#y.get(t2);
    if (e2) return e2;
    const [i2, s2, n2] = this.#ls(t2), a2 = 1 === t2.length ? i2 : `${i2}${s2}${n2}`;
    e2 = this.#y.get(a2);
    if (e2) {
      this.#y.set(t2, e2);
      return e2;
    }
    const r2 = `g_${this.#ss}_transfer_map_${this.#w++}`, o2 = this.#hs(r2);
    this.#y.set(t2, o2);
    this.#y.set(a2, o2);
    const l2 = this.#ds(r2);
    this.#cs(i2, s2, n2, l2);
    return o2;
  }
  addHCMFilter(t2, e2) {
    const i2 = `${t2}-${e2}`, s2 = "base";
    let n2 = this.#rs.get(s2);
    if (n2?.key === i2) return n2.url;
    if (n2) {
      n2.filter?.remove();
      n2.key = i2;
      n2.url = "none";
      n2.filter = null;
    } else {
      n2 = { key: i2, url: "none", filter: null };
      this.#rs.set(s2, n2);
    }
    if (!t2 || !e2) return n2.url;
    const a2 = this.#us(t2);
    t2 = Util.makeHexColor(...a2);
    const r2 = this.#us(e2);
    e2 = Util.makeHexColor(...r2);
    this.#os.style.color = "";
    if ("#000000" === t2 && "#ffffff" === e2 || t2 === e2) return n2.url;
    const o2 = new Array(256);
    for (let t3 = 0; t3 <= 255; t3++) {
      const e3 = t3 / 255;
      o2[t3] = e3 <= 0.03928 ? e3 / 12.92 : ((e3 + 0.055) / 1.055) ** 2.4;
    }
    const l2 = o2.join(","), h2 = `g_${this.#ss}_hcm_filter`, d2 = n2.filter = this.#ds(h2);
    this.#cs(l2, l2, l2, d2);
    this.#ps(d2);
    const getSteps = (t3, e3) => {
      const i3 = a2[t3] / 255, s3 = r2[t3] / 255, n3 = new Array(e3 + 1);
      for (let t4 = 0; t4 <= e3; t4++) n3[t4] = i3 + t4 / e3 * (s3 - i3);
      return n3.join(",");
    };
    this.#cs(getSteps(0, 5), getSteps(1, 5), getSteps(2, 5), d2);
    n2.url = this.#hs(h2);
    return n2.url;
  }
  addAlphaFilter(t2) {
    let e2 = this.#y.get(t2);
    if (e2) return e2;
    const [i2] = this.#ls([t2]), s2 = `alpha_${i2}`;
    e2 = this.#y.get(s2);
    if (e2) {
      this.#y.set(t2, e2);
      return e2;
    }
    const n2 = `g_${this.#ss}_alpha_map_${this.#w++}`, a2 = this.#hs(n2);
    this.#y.set(t2, a2);
    this.#y.set(s2, a2);
    const r2 = this.#ds(n2);
    this.#gs(i2, r2);
    return a2;
  }
  addLuminosityFilter(t2) {
    let e2, i2, s2 = this.#y.get(t2 || "luminosity");
    if (s2) return s2;
    if (t2) {
      [e2] = this.#ls([t2]);
      i2 = `luminosity_${e2}`;
    } else i2 = "luminosity";
    s2 = this.#y.get(i2);
    if (s2) {
      this.#y.set(t2, s2);
      return s2;
    }
    const n2 = `g_${this.#ss}_luminosity_map_${this.#w++}`, a2 = this.#hs(n2);
    this.#y.set(t2, a2);
    this.#y.set(i2, a2);
    const r2 = this.#ds(n2);
    this.#ms(r2);
    t2 && this.#gs(e2, r2);
    return a2;
  }
  addHighlightHCMFilter(t2, e2, i2, s2, n2) {
    const a2 = `${e2}-${i2}-${s2}-${n2}`;
    let r2 = this.#rs.get(t2);
    if (r2?.key === a2) return r2.url;
    if (r2) {
      r2.filter?.remove();
      r2.key = a2;
      r2.url = "none";
      r2.filter = null;
    } else {
      r2 = { key: a2, url: "none", filter: null };
      this.#rs.set(t2, r2);
    }
    if (!e2 || !i2) return r2.url;
    const [o2, l2] = [e2, i2].map(this.#us.bind(this));
    let h2 = Math.round(0.2126 * o2[0] + 0.7152 * o2[1] + 0.0722 * o2[2]), d2 = Math.round(0.2126 * l2[0] + 0.7152 * l2[1] + 0.0722 * l2[2]), [c2, u2] = [s2, n2].map(this.#us.bind(this));
    d2 < h2 && ([h2, d2, c2, u2] = [d2, h2, u2, c2]);
    this.#os.style.color = "";
    const getSteps = (t3, e3, i3) => {
      const s3 = new Array(256), n3 = (d2 - h2) / i3, a3 = t3 / 255, r3 = (e3 - t3) / (255 * i3);
      let o3 = 0;
      for (let t4 = 0; t4 <= i3; t4++) {
        const e4 = Math.round(h2 + t4 * n3), i4 = a3 + t4 * r3;
        for (let t5 = o3; t5 <= e4; t5++) s3[t5] = i4;
        o3 = e4 + 1;
      }
      for (let t4 = o3; t4 < 256; t4++) s3[t4] = s3[o3 - 1];
      return s3.join(",");
    }, p2 = `g_${this.#ss}_hcm_${t2}_filter`, g2 = r2.filter = this.#ds(p2);
    this.#ps(g2);
    this.#cs(getSteps(c2[0], u2[0], 5), getSteps(c2[1], u2[1], 5), getSteps(c2[2], u2[2], 5), g2);
    r2.url = this.#hs(p2);
    return r2.url;
  }
  destroy(t2 = false) {
    if (!t2 || !this.#as?.size) {
      this.#is?.parentNode.parentNode.remove();
      this.#is = null;
      this.#es?.clear();
      this.#es = null;
      this.#as?.clear();
      this.#as = null;
      this.#w = 0;
    }
  }
  #ms(t2) {
    const e2 = this.#ns.createElementNS(it, "feColorMatrix");
    e2.setAttribute("type", "matrix");
    e2.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0.59 0.11 0 0");
    t2.append(e2);
  }
  #ps(t2) {
    const e2 = this.#ns.createElementNS(it, "feColorMatrix");
    e2.setAttribute("type", "matrix");
    e2.setAttribute("values", "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0");
    t2.append(e2);
  }
  #ds(t2) {
    const e2 = this.#ns.createElementNS(it, "filter");
    e2.setAttribute("color-interpolation-filters", "sRGB");
    e2.setAttribute("id", t2);
    this.#os.append(e2);
    return e2;
  }
  #fs(t2, e2, i2) {
    const s2 = this.#ns.createElementNS(it, e2);
    s2.setAttribute("type", "discrete");
    s2.setAttribute("tableValues", i2);
    t2.append(s2);
  }
  #cs(t2, e2, i2, s2) {
    const n2 = this.#ns.createElementNS(it, "feComponentTransfer");
    s2.append(n2);
    this.#fs(n2, "feFuncR", t2);
    this.#fs(n2, "feFuncG", e2);
    this.#fs(n2, "feFuncB", i2);
  }
  #gs(t2, e2) {
    const i2 = this.#ns.createElementNS(it, "feComponentTransfer");
    e2.append(i2);
    this.#fs(i2, "feFuncA", t2);
  }
  #us(t2) {
    this.#os.style.color = t2;
    return getRGB(getComputedStyle(this.#os).getPropertyValue("color"));
  }
};
var Ft = e ? class NodeStandardFontDataFactory extends BaseStandardFontDataFactory {
  async _fetch(t2) {
    return node_utils_fetchData(t2);
  }
} : DOMStandardFontDataFactory;
function getDocument(t2 = {}) {
  "string" == typeof t2 || t2 instanceof URL ? t2 = { url: t2 } : (t2 instanceof ArrayBuffer || ArrayBuffer.isView(t2)) && (t2 = { data: t2 });
  const i2 = new PDFDocumentLoadingTask(), { docId: s2 } = i2, n2 = t2.url ? (function getUrlProp(t3) {
    if (t3 instanceof URL) return t3.href;
    try {
      return new URL(t3, window.location).href;
    } catch {
      if (e && "string" == typeof t3) return t3;
    }
    throw new Error("Invalid PDF url data: either string or URL-object is expected in the url property.");
  })(t2.url) : null, a2 = t2.data ? (function getDataProp(t3) {
    if (e && "undefined" != typeof Buffer && t3 instanceof Buffer) throw new Error("Please provide binary data as `Uint8Array`, rather than `Buffer`.");
    if (t3 instanceof Uint8Array && t3.byteLength === t3.buffer.byteLength) return t3;
    if ("string" == typeof t3) return stringToBytes(t3);
    if (t3 instanceof ArrayBuffer || ArrayBuffer.isView(t3) || "object" == typeof t3 && !isNaN(t3?.length)) return new Uint8Array(t3);
    throw new Error("Invalid PDF binary data: either TypedArray, string, or array-like object is expected in the data property.");
  })(t2.data) : null, r2 = t2.httpHeaders || null, o2 = true === t2.withCredentials, l2 = t2.password ?? null, h2 = t2.range instanceof PDFDataRangeTransport ? t2.range : null, d2 = Number.isInteger(t2.rangeChunkSize) && t2.rangeChunkSize > 0 ? t2.rangeChunkSize : Dt;
  let c2 = t2.worker instanceof PDFWorker ? t2.worker : null;
  const u2 = t2.verbosity, p2 = "string" != typeof t2.docBaseUrl || isDataScheme(t2.docBaseUrl) ? null : t2.docBaseUrl, g2 = "string" == typeof t2.cMapUrl ? t2.cMapUrl : null, m2 = false !== t2.cMapPacked, f2 = t2.CMapReaderFactory || Rt, b2 = "string" == typeof t2.standardFontDataUrl ? t2.standardFontDataUrl : null, A2 = t2.StandardFontDataFactory || Ft, w2 = true !== t2.stopAtErrors, v2 = Number.isInteger(t2.maxImageSize) && t2.maxImageSize > -1 ? t2.maxImageSize : -1, y2 = false !== t2.isEvalSupported, x2 = "boolean" == typeof t2.isOffscreenCanvasSupported ? t2.isOffscreenCanvasSupported : !e, _2 = "boolean" == typeof t2.isImageDecoderSupported ? t2.isImageDecoderSupported : !e && (util_FeatureTest.platform.isFirefox || !globalThis.chrome), E2 = Number.isInteger(t2.canvasMaxAreaInBytes) ? t2.canvasMaxAreaInBytes : -1, S2 = "boolean" == typeof t2.disableFontFace ? t2.disableFontFace : e, C2 = true === t2.fontExtraProperties, T2 = true === t2.enableXfa, M2 = t2.ownerDocument || globalThis.document, P2 = true === t2.disableRange, D2 = true === t2.disableStream, k2 = true === t2.disableAutoFetch, R2 = true === t2.pdfBug, I2 = t2.CanvasFactory || kt, F2 = t2.FilterFactory || It, L2 = true === t2.enableHWA, O2 = h2 ? h2.length : t2.length ?? NaN, N2 = "boolean" == typeof t2.useSystemFonts ? t2.useSystemFonts : !e && !S2, B2 = "boolean" == typeof t2.useWorkerFetch ? t2.useWorkerFetch : f2 === DOMCMapReaderFactory && A2 === DOMStandardFontDataFactory && g2 && b2 && isValidFetchUrl(g2, document.baseURI) && isValidFetchUrl(b2, document.baseURI);
  setVerbosityLevel(u2);
  const H2 = { canvasFactory: new I2({ ownerDocument: M2, enableHWA: L2 }), filterFactory: new F2({ docId: s2, ownerDocument: M2 }), cMapReaderFactory: B2 ? null : new f2({ baseUrl: g2, isCompressed: m2 }), standardFontDataFactory: B2 ? null : new A2({ baseUrl: b2 }) };
  if (!c2) {
    const t3 = { verbosity: u2, port: GlobalWorkerOptions.workerPort };
    c2 = t3.port ? PDFWorker.fromPort(t3) : new PDFWorker(t3);
    i2._worker = c2;
  }
  const z2 = { docId: s2, apiVersion: "4.10.38", data: a2, password: l2, disableAutoFetch: k2, rangeChunkSize: d2, length: O2, docBaseUrl: p2, enableXfa: T2, evaluatorOptions: { maxImageSize: v2, disableFontFace: S2, ignoreErrors: w2, isEvalSupported: y2, isOffscreenCanvasSupported: x2, isImageDecoderSupported: _2, canvasMaxAreaInBytes: E2, fontExtraProperties: C2, useSystemFonts: N2, cMapUrl: B2 ? g2 : null, standardFontDataUrl: B2 ? b2 : null } }, U2 = { disableFontFace: S2, fontExtraProperties: C2, ownerDocument: M2, pdfBug: R2, styleElement: null, loadingParams: { disableAutoFetch: k2, enableXfa: T2 } };
  c2.promise.then((function() {
    if (i2.destroyed) throw new Error("Loading aborted");
    if (c2.destroyed) throw new Error("Worker was destroyed");
    const t3 = c2.messageHandler.sendWithPromise("GetDocRequest", z2, a2 ? [a2.buffer] : null);
    let l3;
    if (h2) l3 = new PDFDataTransportStream(h2, { disableRange: P2, disableStream: D2 });
    else if (!a2) {
      if (!n2) throw new Error("getDocument - no `url` parameter provided.");
      let t4;
      if (e) if (isValidFetchUrl(n2)) {
        if ("undefined" == typeof fetch || "undefined" == typeof Response || !("body" in Response.prototype)) throw new Error("getDocument - the Fetch API was disabled in Node.js, see `--no-experimental-fetch`.");
        t4 = PDFFetchStream;
      } else t4 = PDFNodeStream;
      else t4 = isValidFetchUrl(n2) ? PDFFetchStream : PDFNetworkStream;
      l3 = new t4({ url: n2, length: O2, httpHeaders: r2, withCredentials: o2, rangeChunkSize: d2, disableRange: P2, disableStream: D2 });
    }
    return t3.then(((t4) => {
      if (i2.destroyed) throw new Error("Loading aborted");
      if (c2.destroyed) throw new Error("Worker was destroyed");
      const e2 = new MessageHandler(s2, t4, c2.port), n3 = new WorkerTransport(e2, i2, l3, U2, H2);
      i2._transport = n3;
      e2.send("Ready", null);
    }));
  })).catch(i2._capability.reject);
  return i2;
}
function isRefProxy(t2) {
  return "object" == typeof t2 && Number.isInteger(t2?.num) && t2.num >= 0 && Number.isInteger(t2?.gen) && t2.gen >= 0;
}
var PDFDocumentLoadingTask = class _PDFDocumentLoadingTask {
  static #ss = 0;
  constructor() {
    this._capability = Promise.withResolvers();
    this._transport = null;
    this._worker = null;
    this.docId = "d" + _PDFDocumentLoadingTask.#ss++;
    this.destroyed = false;
    this.onPassword = null;
    this.onProgress = null;
  }
  get promise() {
    return this._capability.promise;
  }
  async destroy() {
    this.destroyed = true;
    try {
      this._worker?.port && (this._worker._pendingDestroy = true);
      await this._transport?.destroy();
    } catch (t2) {
      this._worker?.port && delete this._worker._pendingDestroy;
      throw t2;
    }
    this._transport = null;
    this._worker?.destroy();
    this._worker = null;
  }
};
var PDFDataRangeTransport = class {
  constructor(t2, e2, i2 = false, s2 = null) {
    this.length = t2;
    this.initialData = e2;
    this.progressiveDone = i2;
    this.contentDispositionFilename = s2;
    this._rangeListeners = [];
    this._progressListeners = [];
    this._progressiveReadListeners = [];
    this._progressiveDoneListeners = [];
    this._readyCapability = Promise.withResolvers();
  }
  addRangeListener(t2) {
    this._rangeListeners.push(t2);
  }
  addProgressListener(t2) {
    this._progressListeners.push(t2);
  }
  addProgressiveReadListener(t2) {
    this._progressiveReadListeners.push(t2);
  }
  addProgressiveDoneListener(t2) {
    this._progressiveDoneListeners.push(t2);
  }
  onDataRange(t2, e2) {
    for (const i2 of this._rangeListeners) i2(t2, e2);
  }
  onDataProgress(t2, e2) {
    this._readyCapability.promise.then((() => {
      for (const i2 of this._progressListeners) i2(t2, e2);
    }));
  }
  onDataProgressiveRead(t2) {
    this._readyCapability.promise.then((() => {
      for (const e2 of this._progressiveReadListeners) e2(t2);
    }));
  }
  onDataProgressiveDone() {
    this._readyCapability.promise.then((() => {
      for (const t2 of this._progressiveDoneListeners) t2();
    }));
  }
  transportReady() {
    this._readyCapability.resolve();
  }
  requestDataRange(t2, e2) {
    unreachable("Abstract method PDFDataRangeTransport.requestDataRange");
  }
  abort() {
  }
};
var PDFDocumentProxy = class {
  constructor(t2, e2) {
    this._pdfInfo = t2;
    this._transport = e2;
  }
  get annotationStorage() {
    return this._transport.annotationStorage;
  }
  get canvasFactory() {
    return this._transport.canvasFactory;
  }
  get filterFactory() {
    return this._transport.filterFactory;
  }
  get numPages() {
    return this._pdfInfo.numPages;
  }
  get fingerprints() {
    return this._pdfInfo.fingerprints;
  }
  get isPureXfa() {
    return shadow(this, "isPureXfa", !!this._transport._htmlForXfa);
  }
  get allXfaHtml() {
    return this._transport._htmlForXfa;
  }
  getPage(t2) {
    return this._transport.getPage(t2);
  }
  getPageIndex(t2) {
    return this._transport.getPageIndex(t2);
  }
  getDestinations() {
    return this._transport.getDestinations();
  }
  getDestination(t2) {
    return this._transport.getDestination(t2);
  }
  getPageLabels() {
    return this._transport.getPageLabels();
  }
  getPageLayout() {
    return this._transport.getPageLayout();
  }
  getPageMode() {
    return this._transport.getPageMode();
  }
  getViewerPreferences() {
    return this._transport.getViewerPreferences();
  }
  getOpenAction() {
    return this._transport.getOpenAction();
  }
  getAttachments() {
    return this._transport.getAttachments();
  }
  getJSActions() {
    return this._transport.getDocJSActions();
  }
  getOutline() {
    return this._transport.getOutline();
  }
  getOptionalContentConfig({ intent: t2 = "display" } = {}) {
    const { renderingIntent: e2 } = this._transport.getRenderingIntent(t2);
    return this._transport.getOptionalContentConfig(e2);
  }
  getPermissions() {
    return this._transport.getPermissions();
  }
  getMetadata() {
    return this._transport.getMetadata();
  }
  getMarkInfo() {
    return this._transport.getMarkInfo();
  }
  getData() {
    return this._transport.getData();
  }
  saveDocument() {
    return this._transport.saveDocument();
  }
  getDownloadInfo() {
    return this._transport.downloadInfoCapability.promise;
  }
  cleanup(t2 = false) {
    return this._transport.startCleanup(t2 || this.isPureXfa);
  }
  destroy() {
    return this.loadingTask.destroy();
  }
  cachedPageNumber(t2) {
    return this._transport.cachedPageNumber(t2);
  }
  get loadingParams() {
    return this._transport.loadingParams;
  }
  get loadingTask() {
    return this._transport.loadingTask;
  }
  getFieldObjects() {
    return this._transport.getFieldObjects();
  }
  hasJSActions() {
    return this._transport.hasJSActions();
  }
  getCalculationOrderIds() {
    return this._transport.getCalculationOrderIds();
  }
};
var PDFPageProxy = class {
  #bs = null;
  #As = false;
  constructor(t2, e2, i2, s2 = false) {
    this._pageIndex = t2;
    this._pageInfo = e2;
    this._transport = i2;
    this._stats = s2 ? new StatTimer() : null;
    this._pdfBug = s2;
    this.commonObjs = i2.commonObjs;
    this.objs = new PDFObjects();
    this._maybeCleanupAfterRender = false;
    this._intentStates = /* @__PURE__ */ new Map();
    this.destroyed = false;
  }
  get pageNumber() {
    return this._pageIndex + 1;
  }
  get rotate() {
    return this._pageInfo.rotate;
  }
  get ref() {
    return this._pageInfo.ref;
  }
  get userUnit() {
    return this._pageInfo.userUnit;
  }
  get view() {
    return this._pageInfo.view;
  }
  getViewport({ scale: t2, rotation: e2 = this.rotate, offsetX: i2 = 0, offsetY: s2 = 0, dontFlip: n2 = false } = {}) {
    return new PageViewport({ viewBox: this.view, userUnit: this.userUnit, scale: t2, rotation: e2, offsetX: i2, offsetY: s2, dontFlip: n2 });
  }
  getAnnotations({ intent: t2 = "display" } = {}) {
    const { renderingIntent: e2 } = this._transport.getRenderingIntent(t2);
    return this._transport.getAnnotations(this._pageIndex, e2);
  }
  getJSActions() {
    return this._transport.getPageJSActions(this._pageIndex);
  }
  get filterFactory() {
    return this._transport.filterFactory;
  }
  get isPureXfa() {
    return shadow(this, "isPureXfa", !!this._transport._htmlForXfa);
  }
  async getXfa() {
    return this._transport._htmlForXfa?.children[this._pageIndex] || null;
  }
  render({ canvasContext: t2, viewport: e2, intent: i2 = "display", annotationMode: s2 = p.ENABLE, transform: n2 = null, background: a2 = null, optionalContentConfigPromise: r2 = null, annotationCanvasMap: l2 = null, pageColors: h2 = null, printAnnotationStorage: d2 = null, isEditing: c2 = false }) {
    this._stats?.time("Overall");
    const u2 = this._transport.getRenderingIntent(i2, s2, d2, c2), { renderingIntent: g2, cacheKey: m2 } = u2;
    this.#As = false;
    this.#ws();
    r2 ||= this._transport.getOptionalContentConfig(g2);
    let f2 = this._intentStates.get(m2);
    if (!f2) {
      f2 = /* @__PURE__ */ Object.create(null);
      this._intentStates.set(m2, f2);
    }
    if (f2.streamReaderCancelTimeout) {
      clearTimeout(f2.streamReaderCancelTimeout);
      f2.streamReaderCancelTimeout = null;
    }
    const b2 = !!(g2 & o);
    if (!f2.displayReadyCapability) {
      f2.displayReadyCapability = Promise.withResolvers();
      f2.operatorList = { fnArray: [], argsArray: [], lastChunk: false, separateAnnots: null };
      this._stats?.time("Page Request");
      this._pumpOperatorList(u2);
    }
    const complete = (t3) => {
      f2.renderTasks.delete(A2);
      (this._maybeCleanupAfterRender || b2) && (this.#As = true);
      this.#vs(!b2);
      if (t3) {
        A2.capability.reject(t3);
        this._abortOperatorList({ intentState: f2, reason: t3 instanceof Error ? t3 : new Error(t3) });
      } else A2.capability.resolve();
      if (this._stats) {
        this._stats.timeEnd("Rendering");
        this._stats.timeEnd("Overall");
        globalThis.Stats?.enabled && globalThis.Stats.add(this.pageNumber, this._stats);
      }
    }, A2 = new InternalRenderTask({ callback: complete, params: { canvasContext: t2, viewport: e2, transform: n2, background: a2 }, objs: this.objs, commonObjs: this.commonObjs, annotationCanvasMap: l2, operatorList: f2.operatorList, pageIndex: this._pageIndex, canvasFactory: this._transport.canvasFactory, filterFactory: this._transport.filterFactory, useRequestAnimationFrame: !b2, pdfBug: this._pdfBug, pageColors: h2 });
    (f2.renderTasks ||= /* @__PURE__ */ new Set()).add(A2);
    const w2 = A2.task;
    Promise.all([f2.displayReadyCapability.promise, r2]).then((([t3, e3]) => {
      if (this.destroyed) complete();
      else {
        this._stats?.time("Rendering");
        if (!(e3.renderingIntent & g2)) throw new Error("Must use the same `intent`-argument when calling the `PDFPageProxy.render` and `PDFDocumentProxy.getOptionalContentConfig` methods.");
        A2.initializeGraphics({ transparency: t3, optionalContentConfig: e3 });
        A2.operatorListChanged();
      }
    })).catch(complete);
    return w2;
  }
  getOperatorList({ intent: t2 = "display", annotationMode: e2 = p.ENABLE, printAnnotationStorage: i2 = null, isEditing: s2 = false } = {}) {
    const n2 = this._transport.getRenderingIntent(t2, e2, i2, s2, true);
    let a2, r2 = this._intentStates.get(n2.cacheKey);
    if (!r2) {
      r2 = /* @__PURE__ */ Object.create(null);
      this._intentStates.set(n2.cacheKey, r2);
    }
    if (!r2.opListReadCapability) {
      a2 = /* @__PURE__ */ Object.create(null);
      a2.operatorListChanged = function operatorListChanged() {
        if (r2.operatorList.lastChunk) {
          r2.opListReadCapability.resolve(r2.operatorList);
          r2.renderTasks.delete(a2);
        }
      };
      r2.opListReadCapability = Promise.withResolvers();
      (r2.renderTasks ||= /* @__PURE__ */ new Set()).add(a2);
      r2.operatorList = { fnArray: [], argsArray: [], lastChunk: false, separateAnnots: null };
      this._stats?.time("Page Request");
      this._pumpOperatorList(n2);
    }
    return r2.opListReadCapability.promise;
  }
  streamTextContent({ includeMarkedContent: t2 = false, disableNormalization: e2 = false } = {}) {
    return this._transport.messageHandler.sendWithStream("GetTextContent", { pageIndex: this._pageIndex, includeMarkedContent: true === t2, disableNormalization: true === e2 }, { highWaterMark: 100, size: (t3) => t3.items.length });
  }
  getTextContent(t2 = {}) {
    if (this._transport._htmlForXfa) return this.getXfa().then(((t3) => XfaText.textContent(t3)));
    const e2 = this.streamTextContent(t2);
    return new Promise((function(t3, i2) {
      const s2 = e2.getReader(), n2 = { items: [], styles: /* @__PURE__ */ Object.create(null), lang: null };
      !(function pump() {
        s2.read().then((function({ value: e3, done: i3 }) {
          if (i3) t3(n2);
          else {
            n2.lang ??= e3.lang;
            Object.assign(n2.styles, e3.styles);
            n2.items.push(...e3.items);
            pump();
          }
        }), i2);
      })();
    }));
  }
  getStructTree() {
    return this._transport.getStructTree(this._pageIndex);
  }
  _destroy() {
    this.destroyed = true;
    const t2 = [];
    for (const e2 of this._intentStates.values()) {
      this._abortOperatorList({ intentState: e2, reason: new Error("Page was destroyed."), force: true });
      if (!e2.opListReadCapability) for (const i2 of e2.renderTasks) {
        t2.push(i2.completed);
        i2.cancel();
      }
    }
    this.objs.clear();
    this.#As = false;
    this.#ws();
    return Promise.all(t2);
  }
  cleanup(t2 = false) {
    this.#As = true;
    const e2 = this.#vs(false);
    t2 && e2 && (this._stats &&= new StatTimer());
    return e2;
  }
  #vs(t2 = false) {
    this.#ws();
    if (!this.#As || this.destroyed) return false;
    if (t2) {
      this.#bs = setTimeout((() => {
        this.#bs = null;
        this.#vs(false);
      }), 5e3);
      return false;
    }
    for (const { renderTasks: t3, operatorList: e2 } of this._intentStates.values()) if (t3.size > 0 || !e2.lastChunk) return false;
    this._intentStates.clear();
    this.objs.clear();
    this.#As = false;
    return true;
  }
  #ws() {
    if (this.#bs) {
      clearTimeout(this.#bs);
      this.#bs = null;
    }
  }
  _startRenderPage(t2, e2) {
    const i2 = this._intentStates.get(e2);
    if (i2) {
      this._stats?.timeEnd("Page Request");
      i2.displayReadyCapability?.resolve(t2);
    }
  }
  _renderPageChunk(t2, e2) {
    for (let i2 = 0, s2 = t2.length; i2 < s2; i2++) {
      e2.operatorList.fnArray.push(t2.fnArray[i2]);
      e2.operatorList.argsArray.push(t2.argsArray[i2]);
    }
    e2.operatorList.lastChunk = t2.lastChunk;
    e2.operatorList.separateAnnots = t2.separateAnnots;
    for (const t3 of e2.renderTasks) t3.operatorListChanged();
    t2.lastChunk && this.#vs(true);
  }
  _pumpOperatorList({ renderingIntent: t2, cacheKey: e2, annotationStorageSerializable: i2, modifiedIds: s2 }) {
    const { map: n2, transfer: a2 } = i2, r2 = this._transport.messageHandler.sendWithStream("GetOperatorList", { pageIndex: this._pageIndex, intent: t2, cacheKey: e2, annotationStorage: n2, modifiedIds: s2 }, a2).getReader(), o2 = this._intentStates.get(e2);
    o2.streamReader = r2;
    const pump = () => {
      r2.read().then((({ value: t3, done: e3 }) => {
        if (e3) o2.streamReader = null;
        else if (!this._transport.destroyed) {
          this._renderPageChunk(t3, o2);
          pump();
        }
      }), ((t3) => {
        o2.streamReader = null;
        if (!this._transport.destroyed) {
          if (o2.operatorList) {
            o2.operatorList.lastChunk = true;
            for (const t4 of o2.renderTasks) t4.operatorListChanged();
            this.#vs(true);
          }
          if (o2.displayReadyCapability) o2.displayReadyCapability.reject(t3);
          else {
            if (!o2.opListReadCapability) throw t3;
            o2.opListReadCapability.reject(t3);
          }
        }
      }));
    };
    pump();
  }
  _abortOperatorList({ intentState: t2, reason: e2, force: i2 = false }) {
    if (t2.streamReader) {
      if (t2.streamReaderCancelTimeout) {
        clearTimeout(t2.streamReaderCancelTimeout);
        t2.streamReaderCancelTimeout = null;
      }
      if (!i2) {
        if (t2.renderTasks.size > 0) return;
        if (e2 instanceof RenderingCancelledException) {
          let i3 = 100;
          e2.extraDelay > 0 && e2.extraDelay < 1e3 && (i3 += e2.extraDelay);
          t2.streamReaderCancelTimeout = setTimeout((() => {
            t2.streamReaderCancelTimeout = null;
            this._abortOperatorList({ intentState: t2, reason: e2, force: true });
          }), i3);
          return;
        }
      }
      t2.streamReader.cancel(new AbortException(e2.message)).catch((() => {
      }));
      t2.streamReader = null;
      if (!this._transport.destroyed) {
        for (const [e3, i3] of this._intentStates) if (i3 === t2) {
          this._intentStates.delete(e3);
          break;
        }
        this.cleanup();
      }
    }
  }
  get stats() {
    return this._stats;
  }
};
var LoopbackPort = class {
  #ys = /* @__PURE__ */ new Map();
  #xs = Promise.resolve();
  postMessage(t2, e2) {
    const i2 = { data: structuredClone(t2, e2 ? { transfer: e2 } : null) };
    this.#xs.then((() => {
      for (const [t3] of this.#ys) t3.call(this, i2);
    }));
  }
  addEventListener(t2, e2, i2 = null) {
    let s2 = null;
    if (i2?.signal instanceof AbortSignal) {
      const { signal: n2 } = i2;
      if (n2.aborted) {
        warn("LoopbackPort - cannot use an `aborted` signal.");
        return;
      }
      const onAbort = () => this.removeEventListener(t2, e2);
      s2 = () => n2.removeEventListener("abort", onAbort);
      n2.addEventListener("abort", onAbort);
    }
    this.#ys.set(e2, s2);
  }
  removeEventListener(t2, e2) {
    const i2 = this.#ys.get(e2);
    i2?.();
    this.#ys.delete(e2);
  }
  terminate() {
    for (const [, t2] of this.#ys) t2?.();
    this.#ys.clear();
  }
};
var PDFWorker = class _PDFWorker {
  static #_s = 0;
  static #Es = false;
  static #Ss;
  static {
    if (e) {
      this.#Es = true;
      GlobalWorkerOptions.workerSrc ||= "./pdf.worker.mjs";
    }
    this._isSameOrigin = (t2, e2) => {
      let i2;
      try {
        i2 = new URL(t2);
        if (!i2.origin || "null" === i2.origin) return false;
      } catch {
        return false;
      }
      const s2 = new URL(e2, i2);
      return i2.origin === s2.origin;
    };
    this._createCDNWrapper = (t2) => {
      const e2 = `await import("${t2}");`;
      return URL.createObjectURL(new Blob([e2], { type: "text/javascript" }));
    };
  }
  constructor({ name: t2 = null, port: e2 = null, verbosity: i2 = getVerbosityLevel() } = {}) {
    this.name = t2;
    this.destroyed = false;
    this.verbosity = i2;
    this._readyCapability = Promise.withResolvers();
    this._port = null;
    this._webWorker = null;
    this._messageHandler = null;
    if (e2) {
      if (_PDFWorker.#Ss?.has(e2)) throw new Error("Cannot use more than one PDFWorker per port.");
      (_PDFWorker.#Ss ||= /* @__PURE__ */ new WeakMap()).set(e2, this);
      this._initializeFromPort(e2);
    } else this._initialize();
  }
  get promise() {
    return this._readyCapability.promise;
  }
  #Cs() {
    this._readyCapability.resolve();
    this._messageHandler.send("configure", { verbosity: this.verbosity });
  }
  get port() {
    return this._port;
  }
  get messageHandler() {
    return this._messageHandler;
  }
  _initializeFromPort(t2) {
    this._port = t2;
    this._messageHandler = new MessageHandler("main", "worker", t2);
    this._messageHandler.on("ready", (function() {
    }));
    this.#Cs();
  }
  _initialize() {
    if (_PDFWorker.#Es || _PDFWorker.#Ts) {
      this._setupFakeWorker();
      return;
    }
    let { workerSrc: t2 } = _PDFWorker;
    try {
      _PDFWorker._isSameOrigin(window.location.href, t2) || (t2 = _PDFWorker._createCDNWrapper(new URL(t2, window.location).href));
      const e2 = new Worker(t2, { type: "module" }), i2 = new MessageHandler("main", "worker", e2), terminateEarly = () => {
        s2.abort();
        i2.destroy();
        e2.terminate();
        this.destroyed ? this._readyCapability.reject(new Error("Worker was destroyed")) : this._setupFakeWorker();
      }, s2 = new AbortController();
      e2.addEventListener("error", (() => {
        this._webWorker || terminateEarly();
      }), { signal: s2.signal });
      i2.on("test", ((t3) => {
        s2.abort();
        if (!this.destroyed && t3) {
          this._messageHandler = i2;
          this._port = e2;
          this._webWorker = e2;
          this.#Cs();
        } else terminateEarly();
      }));
      i2.on("ready", ((t3) => {
        s2.abort();
        if (this.destroyed) terminateEarly();
        else try {
          sendTest();
        } catch {
          this._setupFakeWorker();
        }
      }));
      const sendTest = () => {
        const t3 = new Uint8Array();
        i2.send("test", t3, [t3.buffer]);
      };
      sendTest();
      return;
    } catch {
      info("The worker has been disabled.");
    }
    this._setupFakeWorker();
  }
  _setupFakeWorker() {
    if (!_PDFWorker.#Es) {
      warn("Setting up fake worker.");
      _PDFWorker.#Es = true;
    }
    _PDFWorker._setupFakeWorkerGlobal.then(((t2) => {
      if (this.destroyed) {
        this._readyCapability.reject(new Error("Worker was destroyed"));
        return;
      }
      const e2 = new LoopbackPort();
      this._port = e2;
      const i2 = "fake" + _PDFWorker.#_s++, s2 = new MessageHandler(i2 + "_worker", i2, e2);
      t2.setup(s2, e2);
      this._messageHandler = new MessageHandler(i2, i2 + "_worker", e2);
      this.#Cs();
    })).catch(((t2) => {
      this._readyCapability.reject(new Error(`Setting up fake worker failed: "${t2.message}".`));
    }));
  }
  destroy() {
    this.destroyed = true;
    this._webWorker?.terminate();
    this._webWorker = null;
    _PDFWorker.#Ss?.delete(this._port);
    this._port = null;
    this._messageHandler?.destroy();
    this._messageHandler = null;
  }
  static fromPort(t2) {
    if (!t2?.port) throw new Error("PDFWorker.fromPort - invalid method signature.");
    const e2 = this.#Ss?.get(t2.port);
    if (e2) {
      if (e2._pendingDestroy) throw new Error("PDFWorker.fromPort - the worker is being destroyed.\nPlease remember to await `PDFDocumentLoadingTask.destroy()`-calls.");
      return e2;
    }
    return new _PDFWorker(t2);
  }
  static get workerSrc() {
    if (GlobalWorkerOptions.workerSrc) return GlobalWorkerOptions.workerSrc;
    throw new Error('No "GlobalWorkerOptions.workerSrc" specified.');
  }
  static get #Ts() {
    try {
      return globalThis.pdfjsWorker?.WorkerMessageHandler || null;
    } catch {
      return null;
    }
  }
  static get _setupFakeWorkerGlobal() {
    return shadow(this, "_setupFakeWorkerGlobal", (async () => {
      if (this.#Ts) return this.#Ts;
      return (await import(this.workerSrc)).WorkerMessageHandler;
    })());
  }
};
var WorkerTransport = class {
  #Ms = /* @__PURE__ */ new Map();
  #Ps = /* @__PURE__ */ new Map();
  #Ds = /* @__PURE__ */ new Map();
  #ks = /* @__PURE__ */ new Map();
  #Rs = null;
  constructor(t2, e2, i2, s2, n2) {
    this.messageHandler = t2;
    this.loadingTask = e2;
    this.commonObjs = new PDFObjects();
    this.fontLoader = new FontLoader({ ownerDocument: s2.ownerDocument, styleElement: s2.styleElement });
    this.loadingParams = s2.loadingParams;
    this._params = s2;
    this.canvasFactory = n2.canvasFactory;
    this.filterFactory = n2.filterFactory;
    this.cMapReaderFactory = n2.cMapReaderFactory;
    this.standardFontDataFactory = n2.standardFontDataFactory;
    this.destroyed = false;
    this.destroyCapability = null;
    this._networkStream = i2;
    this._fullReader = null;
    this._lastProgress = null;
    this.downloadInfoCapability = Promise.withResolvers();
    this.setupMessageHandler();
  }
  #Is(t2, e2 = null) {
    const i2 = this.#Ms.get(t2);
    if (i2) return i2;
    const s2 = this.messageHandler.sendWithPromise(t2, e2);
    this.#Ms.set(t2, s2);
    return s2;
  }
  get annotationStorage() {
    return shadow(this, "annotationStorage", new AnnotationStorage());
  }
  getRenderingIntent(t2, e2 = p.ENABLE, i2 = null, s2 = false, n2 = false) {
    let g2 = r, m2 = rt;
    switch (t2) {
      case "any":
        g2 = a;
        break;
      case "display":
        break;
      case "print":
        g2 = o;
        break;
      default:
        warn(`getRenderingIntent - invalid intent: ${t2}`);
    }
    const f2 = g2 & o && i2 instanceof PrintAnnotationStorage ? i2 : this.annotationStorage;
    switch (e2) {
      case p.DISABLE:
        g2 += d;
        break;
      case p.ENABLE:
        break;
      case p.ENABLE_FORMS:
        g2 += l;
        break;
      case p.ENABLE_STORAGE:
        g2 += h;
        m2 = f2.serializable;
        break;
      default:
        warn(`getRenderingIntent - invalid annotationMode: ${e2}`);
    }
    s2 && (g2 += c);
    n2 && (g2 += u);
    const { ids: b2, hash: A2 } = f2.modifiedIds;
    return { renderingIntent: g2, cacheKey: [g2, m2.hash, A2].join("_"), annotationStorageSerializable: m2, modifiedIds: b2 };
  }
  destroy() {
    if (this.destroyCapability) return this.destroyCapability.promise;
    this.destroyed = true;
    this.destroyCapability = Promise.withResolvers();
    this.#Rs?.reject(new Error("Worker was destroyed during onPassword callback"));
    const t2 = [];
    for (const e3 of this.#Ps.values()) t2.push(e3._destroy());
    this.#Ps.clear();
    this.#Ds.clear();
    this.#ks.clear();
    this.hasOwnProperty("annotationStorage") && this.annotationStorage.resetModified();
    const e2 = this.messageHandler.sendWithPromise("Terminate", null);
    t2.push(e2);
    Promise.all(t2).then((() => {
      this.commonObjs.clear();
      this.fontLoader.clear();
      this.#Ms.clear();
      this.filterFactory.destroy();
      TextLayer.cleanup();
      this._networkStream?.cancelAllRequests(new AbortException("Worker was terminated."));
      this.messageHandler?.destroy();
      this.messageHandler = null;
      this.destroyCapability.resolve();
    }), this.destroyCapability.reject);
    return this.destroyCapability.promise;
  }
  setupMessageHandler() {
    const { messageHandler: t2, loadingTask: e2 } = this;
    t2.on("GetReader", ((t3, e3) => {
      assert(this._networkStream, "GetReader - no `IPDFStream` instance available.");
      this._fullReader = this._networkStream.getFullReader();
      this._fullReader.onProgress = (t4) => {
        this._lastProgress = { loaded: t4.loaded, total: t4.total };
      };
      e3.onPull = () => {
        this._fullReader.read().then((function({ value: t4, done: i2 }) {
          if (i2) e3.close();
          else {
            assert(t4 instanceof ArrayBuffer, "GetReader - expected an ArrayBuffer.");
            e3.enqueue(new Uint8Array(t4), 1, [t4]);
          }
        })).catch(((t4) => {
          e3.error(t4);
        }));
      };
      e3.onCancel = (t4) => {
        this._fullReader.cancel(t4);
        e3.ready.catch(((t5) => {
          if (!this.destroyed) throw t5;
        }));
      };
    }));
    t2.on("ReaderHeadersReady", (async (t3) => {
      await this._fullReader.headersReady;
      const { isStreamingSupported: i2, isRangeSupported: s2, contentLength: n2 } = this._fullReader;
      if (!i2 || !s2) {
        this._lastProgress && e2.onProgress?.(this._lastProgress);
        this._fullReader.onProgress = (t4) => {
          e2.onProgress?.({ loaded: t4.loaded, total: t4.total });
        };
      }
      return { isStreamingSupported: i2, isRangeSupported: s2, contentLength: n2 };
    }));
    t2.on("GetRangeReader", ((t3, e3) => {
      assert(this._networkStream, "GetRangeReader - no `IPDFStream` instance available.");
      const i2 = this._networkStream.getRangeReader(t3.begin, t3.end);
      if (i2) {
        e3.onPull = () => {
          i2.read().then((function({ value: t4, done: i3 }) {
            if (i3) e3.close();
            else {
              assert(t4 instanceof ArrayBuffer, "GetRangeReader - expected an ArrayBuffer.");
              e3.enqueue(new Uint8Array(t4), 1, [t4]);
            }
          })).catch(((t4) => {
            e3.error(t4);
          }));
        };
        e3.onCancel = (t4) => {
          i2.cancel(t4);
          e3.ready.catch(((t5) => {
            if (!this.destroyed) throw t5;
          }));
        };
      } else e3.close();
    }));
    t2.on("GetDoc", (({ pdfInfo: t3 }) => {
      this._numPages = t3.numPages;
      this._htmlForXfa = t3.htmlForXfa;
      delete t3.htmlForXfa;
      e2._capability.resolve(new PDFDocumentProxy(t3, this));
    }));
    t2.on("DocException", ((t3) => {
      e2._capability.reject(wrapReason(t3));
    }));
    t2.on("PasswordRequest", ((t3) => {
      this.#Rs = Promise.withResolvers();
      try {
        if (!e2.onPassword) throw wrapReason(t3);
        const updatePassword = (t4) => {
          t4 instanceof Error ? this.#Rs.reject(t4) : this.#Rs.resolve({ password: t4 });
        };
        e2.onPassword(updatePassword, t3.code);
      } catch (t4) {
        this.#Rs.reject(t4);
      }
      return this.#Rs.promise;
    }));
    t2.on("DataLoaded", ((t3) => {
      e2.onProgress?.({ loaded: t3.length, total: t3.length });
      this.downloadInfoCapability.resolve(t3);
    }));
    t2.on("StartRenderPage", ((t3) => {
      if (this.destroyed) return;
      this.#Ps.get(t3.pageIndex)._startRenderPage(t3.transparency, t3.cacheKey);
    }));
    t2.on("commonobj", (([e3, i2, s2]) => {
      if (this.destroyed) return null;
      if (this.commonObjs.has(e3)) return null;
      switch (i2) {
        case "Font":
          const { disableFontFace: n2, fontExtraProperties: a2, pdfBug: r2 } = this._params;
          if ("error" in s2) {
            const t3 = s2.error;
            warn(`Error during font loading: ${t3}`);
            this.commonObjs.resolve(e3, t3);
            break;
          }
          const o2 = r2 && globalThis.FontInspector?.enabled ? (t3, e4) => globalThis.FontInspector.fontAdded(t3, e4) : null, l2 = new FontFaceObject(s2, { disableFontFace: n2, fontExtraProperties: a2, inspectFont: o2 });
          this.fontLoader.bind(l2).catch((() => t2.sendWithPromise("FontFallback", { id: e3 }))).finally((() => {
            !a2 && l2.data && (l2.data = null);
            this.commonObjs.resolve(e3, l2);
          }));
          break;
        case "CopyLocalImage":
          const { imageRef: h2 } = s2;
          assert(h2, "The imageRef must be defined.");
          for (const t3 of this.#Ps.values()) for (const [, i3] of t3.objs) if (i3?.ref === h2) {
            if (!i3.dataLen) return null;
            this.commonObjs.resolve(e3, structuredClone(i3));
            return i3.dataLen;
          }
          break;
        case "FontPath":
        case "Image":
        case "Pattern":
          this.commonObjs.resolve(e3, s2);
          break;
        default:
          throw new Error(`Got unknown common object type ${i2}`);
      }
      return null;
    }));
    t2.on("obj", (([t3, e3, i2, s2]) => {
      if (this.destroyed) return;
      const n2 = this.#Ps.get(e3);
      if (!n2.objs.has(t3)) if (0 !== n2._intentStates.size) switch (i2) {
        case "Image":
          n2.objs.resolve(t3, s2);
          s2?.dataLen > 1e7 && (n2._maybeCleanupAfterRender = true);
          break;
        case "Pattern":
          n2.objs.resolve(t3, s2);
          break;
        default:
          throw new Error(`Got unknown object type ${i2}`);
      }
      else s2?.bitmap?.close();
    }));
    t2.on("DocProgress", ((t3) => {
      this.destroyed || e2.onProgress?.({ loaded: t3.loaded, total: t3.total });
    }));
    t2.on("FetchBuiltInCMap", (async (t3) => {
      if (this.destroyed) throw new Error("Worker was destroyed.");
      if (!this.cMapReaderFactory) throw new Error("CMapReaderFactory not initialized, see the `useWorkerFetch` parameter.");
      return this.cMapReaderFactory.fetch(t3);
    }));
    t2.on("FetchStandardFontData", (async (t3) => {
      if (this.destroyed) throw new Error("Worker was destroyed.");
      if (!this.standardFontDataFactory) throw new Error("StandardFontDataFactory not initialized, see the `useWorkerFetch` parameter.");
      return this.standardFontDataFactory.fetch(t3);
    }));
  }
  getData() {
    return this.messageHandler.sendWithPromise("GetData", null);
  }
  saveDocument() {
    this.annotationStorage.size <= 0 && warn("saveDocument called while `annotationStorage` is empty, please use the getData-method instead.");
    const { map: t2, transfer: e2 } = this.annotationStorage.serializable;
    return this.messageHandler.sendWithPromise("SaveDocument", { isPureXfa: !!this._htmlForXfa, numPages: this._numPages, annotationStorage: t2, filename: this._fullReader?.filename ?? null }, e2).finally((() => {
      this.annotationStorage.resetModified();
    }));
  }
  getPage(t2) {
    if (!Number.isInteger(t2) || t2 <= 0 || t2 > this._numPages) return Promise.reject(new Error("Invalid page request."));
    const e2 = t2 - 1, i2 = this.#Ds.get(e2);
    if (i2) return i2;
    const s2 = this.messageHandler.sendWithPromise("GetPage", { pageIndex: e2 }).then(((i3) => {
      if (this.destroyed) throw new Error("Transport destroyed");
      i3.refStr && this.#ks.set(i3.refStr, t2);
      const s3 = new PDFPageProxy(e2, i3, this, this._params.pdfBug);
      this.#Ps.set(e2, s3);
      return s3;
    }));
    this.#Ds.set(e2, s2);
    return s2;
  }
  getPageIndex(t2) {
    return isRefProxy(t2) ? this.messageHandler.sendWithPromise("GetPageIndex", { num: t2.num, gen: t2.gen }) : Promise.reject(new Error("Invalid pageIndex request."));
  }
  getAnnotations(t2, e2) {
    return this.messageHandler.sendWithPromise("GetAnnotations", { pageIndex: t2, intent: e2 });
  }
  getFieldObjects() {
    return this.#Is("GetFieldObjects");
  }
  hasJSActions() {
    return this.#Is("HasJSActions");
  }
  getCalculationOrderIds() {
    return this.messageHandler.sendWithPromise("GetCalculationOrderIds", null);
  }
  getDestinations() {
    return this.messageHandler.sendWithPromise("GetDestinations", null);
  }
  getDestination(t2) {
    return "string" != typeof t2 ? Promise.reject(new Error("Invalid destination request.")) : this.messageHandler.sendWithPromise("GetDestination", { id: t2 });
  }
  getPageLabels() {
    return this.messageHandler.sendWithPromise("GetPageLabels", null);
  }
  getPageLayout() {
    return this.messageHandler.sendWithPromise("GetPageLayout", null);
  }
  getPageMode() {
    return this.messageHandler.sendWithPromise("GetPageMode", null);
  }
  getViewerPreferences() {
    return this.messageHandler.sendWithPromise("GetViewerPreferences", null);
  }
  getOpenAction() {
    return this.messageHandler.sendWithPromise("GetOpenAction", null);
  }
  getAttachments() {
    return this.messageHandler.sendWithPromise("GetAttachments", null);
  }
  getDocJSActions() {
    return this.#Is("GetDocJSActions");
  }
  getPageJSActions(t2) {
    return this.messageHandler.sendWithPromise("GetPageJSActions", { pageIndex: t2 });
  }
  getStructTree(t2) {
    return this.messageHandler.sendWithPromise("GetStructTree", { pageIndex: t2 });
  }
  getOutline() {
    return this.messageHandler.sendWithPromise("GetOutline", null);
  }
  getOptionalContentConfig(t2) {
    return this.#Is("GetOptionalContentConfig").then(((e2) => new OptionalContentConfig(e2, t2)));
  }
  getPermissions() {
    return this.messageHandler.sendWithPromise("GetPermissions", null);
  }
  getMetadata() {
    const t2 = "GetMetadata", e2 = this.#Ms.get(t2);
    if (e2) return e2;
    const i2 = this.messageHandler.sendWithPromise(t2, null).then(((t3) => ({ info: t3[0], metadata: t3[1] ? new Metadata(t3[1]) : null, contentDispositionFilename: this._fullReader?.filename ?? null, contentLength: this._fullReader?.contentLength ?? null })));
    this.#Ms.set(t2, i2);
    return i2;
  }
  getMarkInfo() {
    return this.messageHandler.sendWithPromise("GetMarkInfo", null);
  }
  async startCleanup(t2 = false) {
    if (!this.destroyed) {
      await this.messageHandler.sendWithPromise("Cleanup", null);
      for (const t3 of this.#Ps.values()) {
        if (!t3.cleanup()) throw new Error(`startCleanup: Page ${t3.pageNumber} is currently rendering.`);
      }
      this.commonObjs.clear();
      t2 || this.fontLoader.clear();
      this.#Ms.clear();
      this.filterFactory.destroy(true);
      TextLayer.cleanup();
    }
  }
  cachedPageNumber(t2) {
    if (!isRefProxy(t2)) return null;
    const e2 = 0 === t2.gen ? `${t2.num}R` : `${t2.num}R${t2.gen}`;
    return this.#ks.get(e2) ?? null;
  }
};
var Lt = /* @__PURE__ */ Symbol("INITIAL_DATA");
var PDFObjects = class {
  #Fs = /* @__PURE__ */ Object.create(null);
  #Ls(t2) {
    return this.#Fs[t2] ||= { ...Promise.withResolvers(), data: Lt };
  }
  get(t2, e2 = null) {
    if (e2) {
      const i3 = this.#Ls(t2);
      i3.promise.then((() => e2(i3.data)));
      return null;
    }
    const i2 = this.#Fs[t2];
    if (!i2 || i2.data === Lt) throw new Error(`Requesting object that isn't resolved yet ${t2}.`);
    return i2.data;
  }
  has(t2) {
    const e2 = this.#Fs[t2];
    return !!e2 && e2.data !== Lt;
  }
  delete(t2) {
    const e2 = this.#Fs[t2];
    if (!e2 || e2.data === Lt) return false;
    delete this.#Fs[t2];
    return true;
  }
  resolve(t2, e2 = null) {
    const i2 = this.#Ls(t2);
    i2.data = e2;
    i2.resolve();
  }
  clear() {
    for (const t2 in this.#Fs) {
      const { data: e2 } = this.#Fs[t2];
      e2?.bitmap?.close();
    }
    this.#Fs = /* @__PURE__ */ Object.create(null);
  }
  *[Symbol.iterator]() {
    for (const t2 in this.#Fs) {
      const { data: e2 } = this.#Fs[t2];
      e2 !== Lt && (yield [t2, e2]);
    }
  }
};
var RenderTask = class {
  #Os = null;
  constructor(t2) {
    this.#Os = t2;
    this.onContinue = null;
  }
  get promise() {
    return this.#Os.capability.promise;
  }
  cancel(t2 = 0) {
    this.#Os.cancel(null, t2);
  }
  get separateAnnots() {
    const { separateAnnots: t2 } = this.#Os.operatorList;
    if (!t2) return false;
    const { annotationCanvasMap: e2 } = this.#Os;
    return t2.form || t2.canvas && e2?.size > 0;
  }
};
var InternalRenderTask = class _InternalRenderTask {
  #Ns = null;
  static #Bs = /* @__PURE__ */ new WeakSet();
  constructor({ callback: t2, params: e2, objs: i2, commonObjs: s2, annotationCanvasMap: n2, operatorList: a2, pageIndex: r2, canvasFactory: o2, filterFactory: l2, useRequestAnimationFrame: h2 = false, pdfBug: d2 = false, pageColors: c2 = null }) {
    this.callback = t2;
    this.params = e2;
    this.objs = i2;
    this.commonObjs = s2;
    this.annotationCanvasMap = n2;
    this.operatorListIdx = null;
    this.operatorList = a2;
    this._pageIndex = r2;
    this.canvasFactory = o2;
    this.filterFactory = l2;
    this._pdfBug = d2;
    this.pageColors = c2;
    this.running = false;
    this.graphicsReadyCallback = null;
    this.graphicsReady = false;
    this._useRequestAnimationFrame = true === h2 && "undefined" != typeof window;
    this.cancelled = false;
    this.capability = Promise.withResolvers();
    this.task = new RenderTask(this);
    this._cancelBound = this.cancel.bind(this);
    this._continueBound = this._continue.bind(this);
    this._scheduleNextBound = this._scheduleNext.bind(this);
    this._nextBound = this._next.bind(this);
    this._canvas = e2.canvasContext.canvas;
  }
  get completed() {
    return this.capability.promise.catch((function() {
    }));
  }
  initializeGraphics({ transparency: t2 = false, optionalContentConfig: e2 }) {
    if (this.cancelled) return;
    if (this._canvas) {
      if (_InternalRenderTask.#Bs.has(this._canvas)) throw new Error("Cannot use the same canvas during multiple render() operations. Use different canvas or ensure previous operations were cancelled or completed.");
      _InternalRenderTask.#Bs.add(this._canvas);
    }
    if (this._pdfBug && globalThis.StepperManager?.enabled) {
      this.stepper = globalThis.StepperManager.create(this._pageIndex);
      this.stepper.init(this.operatorList);
      this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
    }
    const { canvasContext: i2, viewport: s2, transform: n2, background: a2 } = this.params;
    this.gfx = new CanvasGraphics(i2, this.commonObjs, this.objs, this.canvasFactory, this.filterFactory, { optionalContentConfig: e2 }, this.annotationCanvasMap, this.pageColors);
    this.gfx.beginDrawing({ transform: n2, viewport: s2, transparency: t2, background: a2 });
    this.operatorListIdx = 0;
    this.graphicsReady = true;
    this.graphicsReadyCallback?.();
  }
  cancel(t2 = null, e2 = 0) {
    this.running = false;
    this.cancelled = true;
    this.gfx?.endDrawing();
    if (this.#Ns) {
      window.cancelAnimationFrame(this.#Ns);
      this.#Ns = null;
    }
    _InternalRenderTask.#Bs.delete(this._canvas);
    this.callback(t2 || new RenderingCancelledException(`Rendering cancelled, page ${this._pageIndex + 1}`, e2));
  }
  operatorListChanged() {
    if (this.graphicsReady) {
      this.stepper?.updateOperatorList(this.operatorList);
      this.running || this._continue();
    } else this.graphicsReadyCallback ||= this._continueBound;
  }
  _continue() {
    this.running = true;
    this.cancelled || (this.task.onContinue ? this.task.onContinue(this._scheduleNextBound) : this._scheduleNext());
  }
  _scheduleNext() {
    this._useRequestAnimationFrame ? this.#Ns = window.requestAnimationFrame((() => {
      this.#Ns = null;
      this._nextBound().catch(this._cancelBound);
    })) : Promise.resolve().then(this._nextBound).catch(this._cancelBound);
  }
  async _next() {
    if (!this.cancelled) {
      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList, this.operatorListIdx, this._continueBound, this.stepper);
      if (this.operatorListIdx === this.operatorList.argsArray.length) {
        this.running = false;
        if (this.operatorList.lastChunk) {
          this.gfx.endDrawing();
          _InternalRenderTask.#Bs.delete(this._canvas);
          this.callback();
        }
      }
    }
  }
};
var Ot = "4.10.38";
var Nt = "f9bea397f";
function makeColorComp(t2) {
  return Math.floor(255 * Math.max(0, Math.min(1, t2))).toString(16).padStart(2, "0");
}
function scaleAndClamp(t2) {
  return Math.max(0, Math.min(255, 255 * t2));
}
var ColorConverters = class {
  static CMYK_G([t2, e2, i2, s2]) {
    return ["G", 1 - Math.min(1, 0.3 * t2 + 0.59 * i2 + 0.11 * e2 + s2)];
  }
  static G_CMYK([t2]) {
    return ["CMYK", 0, 0, 0, 1 - t2];
  }
  static G_RGB([t2]) {
    return ["RGB", t2, t2, t2];
  }
  static G_rgb([t2]) {
    return [t2 = scaleAndClamp(t2), t2, t2];
  }
  static G_HTML([t2]) {
    const e2 = makeColorComp(t2);
    return `#${e2}${e2}${e2}`;
  }
  static RGB_G([t2, e2, i2]) {
    return ["G", 0.3 * t2 + 0.59 * e2 + 0.11 * i2];
  }
  static RGB_rgb(t2) {
    return t2.map(scaleAndClamp);
  }
  static RGB_HTML(t2) {
    return `#${t2.map(makeColorComp).join("")}`;
  }
  static T_HTML() {
    return "#00000000";
  }
  static T_rgb() {
    return [null];
  }
  static CMYK_RGB([t2, e2, i2, s2]) {
    return ["RGB", 1 - Math.min(1, t2 + s2), 1 - Math.min(1, i2 + s2), 1 - Math.min(1, e2 + s2)];
  }
  static CMYK_rgb([t2, e2, i2, s2]) {
    return [scaleAndClamp(1 - Math.min(1, t2 + s2)), scaleAndClamp(1 - Math.min(1, i2 + s2)), scaleAndClamp(1 - Math.min(1, e2 + s2))];
  }
  static CMYK_HTML(t2) {
    const e2 = this.CMYK_RGB(t2).slice(1);
    return this.RGB_HTML(e2);
  }
  static RGB_CMYK([t2, e2, i2]) {
    const s2 = 1 - t2, n2 = 1 - e2, a2 = 1 - i2;
    return ["CMYK", s2, n2, a2, Math.min(s2, n2, a2)];
  }
};
var BaseSVGFactory = class {
  create(t2, e2, i2 = false) {
    if (t2 <= 0 || e2 <= 0) throw new Error("Invalid SVG dimensions");
    const s2 = this._createSVG("svg:svg");
    s2.setAttribute("version", "1.1");
    if (!i2) {
      s2.setAttribute("width", `${t2}px`);
      s2.setAttribute("height", `${e2}px`);
    }
    s2.setAttribute("preserveAspectRatio", "none");
    s2.setAttribute("viewBox", `0 0 ${t2} ${e2}`);
    return s2;
  }
  createElement(t2) {
    if ("string" != typeof t2) throw new Error("Invalid SVG element type");
    return this._createSVG(t2);
  }
  _createSVG(t2) {
    unreachable("Abstract method `_createSVG` called.");
  }
};
var DOMSVGFactory = class extends BaseSVGFactory {
  _createSVG(t2) {
    return document.createElementNS(it, t2);
  }
};
var XfaLayer = class {
  static setupStorage(t2, e2, i2, s2, n2) {
    const a2 = s2.getValue(e2, { value: null });
    switch (i2.name) {
      case "textarea":
        null !== a2.value && (t2.textContent = a2.value);
        if ("print" === n2) break;
        t2.addEventListener("input", ((t3) => {
          s2.setValue(e2, { value: t3.target.value });
        }));
        break;
      case "input":
        if ("radio" === i2.attributes.type || "checkbox" === i2.attributes.type) {
          a2.value === i2.attributes.xfaOn ? t2.setAttribute("checked", true) : a2.value === i2.attributes.xfaOff && t2.removeAttribute("checked");
          if ("print" === n2) break;
          t2.addEventListener("change", ((t3) => {
            s2.setValue(e2, { value: t3.target.checked ? t3.target.getAttribute("xfaOn") : t3.target.getAttribute("xfaOff") });
          }));
        } else {
          null !== a2.value && t2.setAttribute("value", a2.value);
          if ("print" === n2) break;
          t2.addEventListener("input", ((t3) => {
            s2.setValue(e2, { value: t3.target.value });
          }));
        }
        break;
      case "select":
        if (null !== a2.value) {
          t2.setAttribute("value", a2.value);
          for (const t3 of i2.children) t3.attributes.value === a2.value ? t3.attributes.selected = true : t3.attributes.hasOwnProperty("selected") && delete t3.attributes.selected;
        }
        t2.addEventListener("input", ((t3) => {
          const i3 = t3.target.options, n3 = -1 === i3.selectedIndex ? "" : i3[i3.selectedIndex].value;
          s2.setValue(e2, { value: n3 });
        }));
    }
  }
  static setAttributes({ html: t2, element: e2, storage: i2 = null, intent: s2, linkService: n2 }) {
    const { attributes: a2 } = e2, r2 = t2 instanceof HTMLAnchorElement;
    "radio" === a2.type && (a2.name = `${a2.name}-${s2}`);
    for (const [e3, i3] of Object.entries(a2)) if (null != i3) switch (e3) {
      case "class":
        i3.length && t2.setAttribute(e3, i3.join(" "));
        break;
      case "dataId":
        break;
      case "id":
        t2.setAttribute("data-element-id", i3);
        break;
      case "style":
        Object.assign(t2.style, i3);
        break;
      case "textContent":
        t2.textContent = i3;
        break;
      default:
        (!r2 || "href" !== e3 && "newWindow" !== e3) && t2.setAttribute(e3, i3);
    }
    r2 && n2.addLinkAttributes(t2, a2.href, a2.newWindow);
    i2 && a2.dataId && this.setupStorage(t2, a2.dataId, e2, i2);
  }
  static render(t2) {
    const e2 = t2.annotationStorage, i2 = t2.linkService, s2 = t2.xfaHtml, n2 = t2.intent || "display", a2 = document.createElement(s2.name);
    s2.attributes && this.setAttributes({ html: a2, element: s2, intent: n2, linkService: i2 });
    const r2 = "richText" !== n2, o2 = t2.div;
    o2.append(a2);
    if (t2.viewport) {
      const e3 = `matrix(${t2.viewport.transform.join(",")})`;
      o2.style.transform = e3;
    }
    r2 && o2.setAttribute("class", "xfaLayer xfaFont");
    const l2 = [];
    if (0 === s2.children.length) {
      if (s2.value) {
        const t3 = document.createTextNode(s2.value);
        a2.append(t3);
        r2 && XfaText.shouldBuildText(s2.name) && l2.push(t3);
      }
      return { textDivs: l2 };
    }
    const h2 = [[s2, -1, a2]];
    for (; h2.length > 0; ) {
      const [t3, s3, a3] = h2.at(-1);
      if (s3 + 1 === t3.children.length) {
        h2.pop();
        continue;
      }
      const o3 = t3.children[++h2.at(-1)[1]];
      if (null === o3) continue;
      const { name: d2 } = o3;
      if ("#text" === d2) {
        const t4 = document.createTextNode(o3.value);
        l2.push(t4);
        a3.append(t4);
        continue;
      }
      const c2 = o3?.attributes?.xmlns ? document.createElementNS(o3.attributes.xmlns, d2) : document.createElement(d2);
      a3.append(c2);
      o3.attributes && this.setAttributes({ html: c2, element: o3, storage: e2, intent: n2, linkService: i2 });
      if (o3.children?.length > 0) h2.push([o3, -1, c2]);
      else if (o3.value) {
        const t4 = document.createTextNode(o3.value);
        r2 && XfaText.shouldBuildText(d2) && l2.push(t4);
        c2.append(t4);
      }
    }
    for (const t3 of o2.querySelectorAll(".xfaNonInteractive input, .xfaNonInteractive textarea")) t3.setAttribute("readOnly", true);
    return { textDivs: l2 };
  }
  static update(t2) {
    const e2 = `matrix(${t2.viewport.transform.join(",")})`;
    t2.div.style.transform = e2;
    t2.div.hidden = false;
  }
};
var Bt = 1e3;
var Ht = /* @__PURE__ */ new WeakSet();
function getRectDims(t2) {
  return { width: t2[2] - t2[0], height: t2[3] - t2[1] };
}
var AnnotationElementFactory = class {
  static create(t2) {
    switch (t2.data.annotationType) {
      case S:
        return new LinkAnnotationElement(t2);
      case E:
        return new TextAnnotationElement(t2);
      case U:
        switch (t2.data.fieldType) {
          case "Tx":
            return new TextWidgetAnnotationElement(t2);
          case "Btn":
            return t2.data.radioButton ? new RadioButtonWidgetAnnotationElement(t2) : t2.data.checkBox ? new CheckboxWidgetAnnotationElement(t2) : new PushButtonWidgetAnnotationElement(t2);
          case "Ch":
            return new ChoiceWidgetAnnotationElement(t2);
          case "Sig":
            return new SignatureWidgetAnnotationElement(t2);
        }
        return new WidgetAnnotationElement(t2);
      case H:
        return new PopupAnnotationElement(t2);
      case C:
        return new FreeTextAnnotationElement(t2);
      case T:
        return new LineAnnotationElement(t2);
      case M:
        return new SquareAnnotationElement(t2);
      case P:
        return new CircleAnnotationElement(t2);
      case k:
        return new PolylineAnnotationElement(t2);
      case N:
        return new CaretAnnotationElement(t2);
      case B:
        return new InkAnnotationElement(t2);
      case D:
        return new PolygonAnnotationElement(t2);
      case R:
        return new HighlightAnnotationElement(t2);
      case I:
        return new UnderlineAnnotationElement(t2);
      case F:
        return new SquigglyAnnotationElement(t2);
      case L:
        return new StrikeOutAnnotationElement(t2);
      case O:
        return new StampAnnotationElement(t2);
      case z:
        return new FileAttachmentAnnotationElement(t2);
      default:
        return new AnnotationElement(t2);
    }
  }
};
var AnnotationElement = class _AnnotationElement {
  #Hs = null;
  #zs = false;
  #Us = null;
  constructor(t2, { isRenderable: e2 = false, ignoreBorder: i2 = false, createQuadrilaterals: s2 = false } = {}) {
    this.isRenderable = e2;
    this.data = t2.data;
    this.layer = t2.layer;
    this.linkService = t2.linkService;
    this.downloadManager = t2.downloadManager;
    this.imageResourcesPath = t2.imageResourcesPath;
    this.renderForms = t2.renderForms;
    this.svgFactory = t2.svgFactory;
    this.annotationStorage = t2.annotationStorage;
    this.enableScripting = t2.enableScripting;
    this.hasJSActions = t2.hasJSActions;
    this._fieldObjects = t2.fieldObjects;
    this.parent = t2.parent;
    e2 && (this.container = this._createContainer(i2));
    s2 && this._createQuadrilaterals();
  }
  static _hasPopupData({ titleObj: t2, contentsObj: e2, richText: i2 }) {
    return !!(t2?.str || e2?.str || i2?.str);
  }
  get _isEditable() {
    return this.data.isEditable;
  }
  get hasPopupData() {
    return _AnnotationElement._hasPopupData(this.data);
  }
  updateEdited(t2) {
    if (!this.container) return;
    this.#Hs ||= { rect: this.data.rect.slice(0) };
    const { rect: e2 } = t2;
    e2 && this.#Gs(e2);
    this.#Us?.popup.updateEdited(t2);
  }
  resetEdited() {
    if (this.#Hs) {
      this.#Gs(this.#Hs.rect);
      this.#Us?.popup.resetEdited();
      this.#Hs = null;
    }
  }
  #Gs(t2) {
    const { container: { style: e2 }, data: { rect: i2, rotation: s2 }, parent: { viewport: { rawDims: { pageWidth: n2, pageHeight: a2, pageX: r2, pageY: o2 } } } } = this;
    i2?.splice(0, 4, ...t2);
    const { width: l2, height: h2 } = getRectDims(t2);
    e2.left = 100 * (t2[0] - r2) / n2 + "%";
    e2.top = 100 * (a2 - t2[3] + o2) / a2 + "%";
    if (0 === s2) {
      e2.width = 100 * l2 / n2 + "%";
      e2.height = 100 * h2 / a2 + "%";
    } else this.setRotation(s2);
  }
  _createContainer(t2) {
    const { data: e2, parent: { page: i2, viewport: s2 } } = this, n2 = document.createElement("section");
    n2.setAttribute("data-annotation-id", e2.id);
    this instanceof WidgetAnnotationElement || (n2.tabIndex = Bt);
    const { style: a2 } = n2;
    a2.zIndex = this.parent.zIndex++;
    e2.alternativeText && (n2.title = e2.alternativeText);
    e2.noRotate && n2.classList.add("norotate");
    if (!e2.rect || this instanceof PopupAnnotationElement) {
      const { rotation: t3 } = e2;
      e2.hasOwnCanvas || 0 === t3 || this.setRotation(t3, n2);
      return n2;
    }
    const { width: r2, height: o2 } = getRectDims(e2.rect);
    if (!t2 && e2.borderStyle.width > 0) {
      a2.borderWidth = `${e2.borderStyle.width}px`;
      const t3 = e2.borderStyle.horizontalCornerRadius, i3 = e2.borderStyle.verticalCornerRadius;
      if (t3 > 0 || i3 > 0) {
        const e3 = `calc(${t3}px * var(--scale-factor)) / calc(${i3}px * var(--scale-factor))`;
        a2.borderRadius = e3;
      } else if (this instanceof RadioButtonWidgetAnnotationElement) {
        const t4 = `calc(${r2}px * var(--scale-factor)) / calc(${o2}px * var(--scale-factor))`;
        a2.borderRadius = t4;
      }
      switch (e2.borderStyle.style) {
        case G:
          a2.borderStyle = "solid";
          break;
        case $:
          a2.borderStyle = "dashed";
          break;
        case V:
          warn("Unimplemented border style: beveled");
          break;
        case j:
          warn("Unimplemented border style: inset");
          break;
        case W:
          a2.borderBottomStyle = "solid";
      }
      const s3 = e2.borderColor || null;
      if (s3) {
        this.#zs = true;
        a2.borderColor = Util.makeHexColor(0 | s3[0], 0 | s3[1], 0 | s3[2]);
      } else a2.borderWidth = 0;
    }
    const l2 = Util.normalizeRect([e2.rect[0], i2.view[3] - e2.rect[1] + i2.view[1], e2.rect[2], i2.view[3] - e2.rect[3] + i2.view[1]]), { pageWidth: h2, pageHeight: d2, pageX: c2, pageY: u2 } = s2.rawDims;
    a2.left = 100 * (l2[0] - c2) / h2 + "%";
    a2.top = 100 * (l2[1] - u2) / d2 + "%";
    const { rotation: p2 } = e2;
    if (e2.hasOwnCanvas || 0 === p2) {
      a2.width = 100 * r2 / h2 + "%";
      a2.height = 100 * o2 / d2 + "%";
    } else this.setRotation(p2, n2);
    return n2;
  }
  setRotation(t2, e2 = this.container) {
    if (!this.data.rect) return;
    const { pageWidth: i2, pageHeight: s2 } = this.parent.viewport.rawDims, { width: n2, height: a2 } = getRectDims(this.data.rect);
    let r2, o2;
    if (t2 % 180 == 0) {
      r2 = 100 * n2 / i2;
      o2 = 100 * a2 / s2;
    } else {
      r2 = 100 * a2 / i2;
      o2 = 100 * n2 / s2;
    }
    e2.style.width = `${r2}%`;
    e2.style.height = `${o2}%`;
    e2.setAttribute("data-main-rotation", (360 - t2) % 360);
  }
  get _commonActions() {
    const setColor = (t2, e2, i2) => {
      const s2 = i2.detail[t2], n2 = s2[0], a2 = s2.slice(1);
      i2.target.style[e2] = ColorConverters[`${n2}_HTML`](a2);
      this.annotationStorage.setValue(this.data.id, { [e2]: ColorConverters[`${n2}_rgb`](a2) });
    };
    return shadow(this, "_commonActions", { display: (t2) => {
      const { display: e2 } = t2.detail, i2 = e2 % 2 == 1;
      this.container.style.visibility = i2 ? "hidden" : "visible";
      this.annotationStorage.setValue(this.data.id, { noView: i2, noPrint: 1 === e2 || 2 === e2 });
    }, print: (t2) => {
      this.annotationStorage.setValue(this.data.id, { noPrint: !t2.detail.print });
    }, hidden: (t2) => {
      const { hidden: e2 } = t2.detail;
      this.container.style.visibility = e2 ? "hidden" : "visible";
      this.annotationStorage.setValue(this.data.id, { noPrint: e2, noView: e2 });
    }, focus: (t2) => {
      setTimeout((() => t2.target.focus({ preventScroll: false })), 0);
    }, userName: (t2) => {
      t2.target.title = t2.detail.userName;
    }, readonly: (t2) => {
      t2.target.disabled = t2.detail.readonly;
    }, required: (t2) => {
      this._setRequired(t2.target, t2.detail.required);
    }, bgColor: (t2) => {
      setColor("bgColor", "backgroundColor", t2);
    }, fillColor: (t2) => {
      setColor("fillColor", "backgroundColor", t2);
    }, fgColor: (t2) => {
      setColor("fgColor", "color", t2);
    }, textColor: (t2) => {
      setColor("textColor", "color", t2);
    }, borderColor: (t2) => {
      setColor("borderColor", "borderColor", t2);
    }, strokeColor: (t2) => {
      setColor("strokeColor", "borderColor", t2);
    }, rotation: (t2) => {
      const e2 = t2.detail.rotation;
      this.setRotation(e2);
      this.annotationStorage.setValue(this.data.id, { rotation: e2 });
    } });
  }
  _dispatchEventFromSandbox(t2, e2) {
    const i2 = this._commonActions;
    for (const s2 of Object.keys(e2.detail)) {
      const n2 = t2[s2] || i2[s2];
      n2?.(e2);
    }
  }
  _setDefaultPropertiesFromJS(t2) {
    if (!this.enableScripting) return;
    const e2 = this.annotationStorage.getRawValue(this.data.id);
    if (!e2) return;
    const i2 = this._commonActions;
    for (const [s2, n2] of Object.entries(e2)) {
      const a2 = i2[s2];
      if (a2) {
        a2({ detail: { [s2]: n2 }, target: t2 });
        delete e2[s2];
      }
    }
  }
  _createQuadrilaterals() {
    if (!this.container) return;
    const { quadPoints: t2 } = this.data;
    if (!t2) return;
    const [e2, i2, s2, n2] = this.data.rect.map(((t3) => Math.fround(t3)));
    if (8 === t2.length) {
      const [a3, r3, o3, l3] = t2.subarray(2, 6);
      if (s2 === a3 && n2 === r3 && e2 === o3 && i2 === l3) return;
    }
    const { style: a2 } = this.container;
    let r2;
    if (this.#zs) {
      const { borderColor: t3, borderWidth: e3 } = a2;
      a2.borderWidth = 0;
      r2 = ["url('data:image/svg+xml;utf8,", '<svg xmlns="http://www.w3.org/2000/svg"', ' preserveAspectRatio="none" viewBox="0 0 1 1">', `<g fill="transparent" stroke="${t3}" stroke-width="${e3}">`];
      this.container.classList.add("hasBorder");
    }
    const o2 = s2 - e2, l2 = n2 - i2, { svgFactory: h2 } = this, d2 = h2.createElement("svg");
    d2.classList.add("quadrilateralsContainer");
    d2.setAttribute("width", 0);
    d2.setAttribute("height", 0);
    const c2 = h2.createElement("defs");
    d2.append(c2);
    const u2 = h2.createElement("clipPath"), p2 = `clippath_${this.data.id}`;
    u2.setAttribute("id", p2);
    u2.setAttribute("clipPathUnits", "objectBoundingBox");
    c2.append(u2);
    for (let i3 = 2, s3 = t2.length; i3 < s3; i3 += 8) {
      const s4 = t2[i3], a3 = t2[i3 + 1], d3 = t2[i3 + 2], c3 = t2[i3 + 3], p3 = h2.createElement("rect"), g2 = (d3 - e2) / o2, m2 = (n2 - a3) / l2, f2 = (s4 - d3) / o2, b2 = (a3 - c3) / l2;
      p3.setAttribute("x", g2);
      p3.setAttribute("y", m2);
      p3.setAttribute("width", f2);
      p3.setAttribute("height", b2);
      u2.append(p3);
      r2?.push(`<rect vector-effect="non-scaling-stroke" x="${g2}" y="${m2}" width="${f2}" height="${b2}"/>`);
    }
    if (this.#zs) {
      r2.push("</g></svg>')");
      a2.backgroundImage = r2.join("");
    }
    this.container.append(d2);
    this.container.style.clipPath = `url(#${p2})`;
  }
  _createPopup() {
    const { data: t2 } = this, e2 = this.#Us = new PopupAnnotationElement({ data: { color: t2.color, titleObj: t2.titleObj, modificationDate: t2.modificationDate, contentsObj: t2.contentsObj, richText: t2.richText, parentRect: t2.rect, borderStyle: 0, id: `popup_${t2.id}`, rotation: t2.rotation }, parent: this.parent, elements: [this] });
    this.parent.div.append(e2.render());
  }
  render() {
    unreachable("Abstract method `AnnotationElement.render` called");
  }
  _getElementsByName(t2, e2 = null) {
    const i2 = [];
    if (this._fieldObjects) {
      const s2 = this._fieldObjects[t2];
      if (s2) for (const { page: t3, id: n2, exportValues: a2 } of s2) {
        if (-1 === t3) continue;
        if (n2 === e2) continue;
        const s3 = "string" == typeof a2 ? a2 : null, r2 = document.querySelector(`[data-element-id="${n2}"]`);
        !r2 || Ht.has(r2) ? i2.push({ id: n2, exportValue: s3, domElement: r2 }) : warn(`_getElementsByName - element not allowed: ${n2}`);
      }
      return i2;
    }
    for (const s2 of document.getElementsByName(t2)) {
      const { exportValue: t3 } = s2, n2 = s2.getAttribute("data-element-id");
      n2 !== e2 && (Ht.has(s2) && i2.push({ id: n2, exportValue: t3, domElement: s2 }));
    }
    return i2;
  }
  show() {
    this.container && (this.container.hidden = false);
    this.popup?.maybeShow();
  }
  hide() {
    this.container && (this.container.hidden = true);
    this.popup?.forceHide();
  }
  getElementsToTriggerPopup() {
    return this.container;
  }
  addHighlightArea() {
    const t2 = this.getElementsToTriggerPopup();
    if (Array.isArray(t2)) for (const e2 of t2) e2.classList.add("highlightArea");
    else t2.classList.add("highlightArea");
  }
  _editOnDoubleClick() {
    if (!this._isEditable) return;
    const { annotationEditorType: t2, data: { id: e2 } } = this;
    this.container.addEventListener("dblclick", (() => {
      this.linkService.eventBus?.dispatch("switchannotationeditormode", { source: this, mode: t2, editId: e2 });
    }));
  }
};
var LinkAnnotationElement = class extends AnnotationElement {
  constructor(t2, e2 = null) {
    super(t2, { isRenderable: true, ignoreBorder: !!e2?.ignoreBorder, createQuadrilaterals: true });
    this.isTooltipOnly = t2.data.isTooltipOnly;
  }
  render() {
    const { data: t2, linkService: e2 } = this, i2 = document.createElement("a");
    i2.setAttribute("data-element-id", t2.id);
    let s2 = false;
    if (t2.url) {
      e2.addLinkAttributes(i2, t2.url, t2.newWindow);
      s2 = true;
    } else if (t2.action) {
      this._bindNamedAction(i2, t2.action);
      s2 = true;
    } else if (t2.attachment) {
      this.#$s(i2, t2.attachment, t2.attachmentDest);
      s2 = true;
    } else if (t2.setOCGState) {
      this.#Vs(i2, t2.setOCGState);
      s2 = true;
    } else if (t2.dest) {
      this._bindLink(i2, t2.dest);
      s2 = true;
    } else {
      if (t2.actions && (t2.actions.Action || t2.actions["Mouse Up"] || t2.actions["Mouse Down"]) && this.enableScripting && this.hasJSActions) {
        this._bindJSAction(i2, t2);
        s2 = true;
      }
      if (t2.resetForm) {
        this._bindResetFormAction(i2, t2.resetForm);
        s2 = true;
      } else if (this.isTooltipOnly && !s2) {
        this._bindLink(i2, "");
        s2 = true;
      }
    }
    this.container.classList.add("linkAnnotation");
    s2 && this.container.append(i2);
    return this.container;
  }
  #js() {
    this.container.setAttribute("data-internal-link", "");
  }
  _bindLink(t2, e2) {
    t2.href = this.linkService.getDestinationHash(e2);
    t2.onclick = () => {
      e2 && this.linkService.goToDestination(e2);
      return false;
    };
    (e2 || "" === e2) && this.#js();
  }
  _bindNamedAction(t2, e2) {
    t2.href = this.linkService.getAnchorUrl("");
    t2.onclick = () => {
      this.linkService.executeNamedAction(e2);
      return false;
    };
    this.#js();
  }
  #$s(t2, e2, i2 = null) {
    t2.href = this.linkService.getAnchorUrl("");
    e2.description && (t2.title = e2.description);
    t2.onclick = () => {
      this.downloadManager?.openOrDownloadData(e2.content, e2.filename, i2);
      return false;
    };
    this.#js();
  }
  #Vs(t2, e2) {
    t2.href = this.linkService.getAnchorUrl("");
    t2.onclick = () => {
      this.linkService.executeSetOCGState(e2);
      return false;
    };
    this.#js();
  }
  _bindJSAction(t2, e2) {
    t2.href = this.linkService.getAnchorUrl("");
    const i2 = /* @__PURE__ */ new Map([["Action", "onclick"], ["Mouse Up", "onmouseup"], ["Mouse Down", "onmousedown"]]);
    for (const s2 of Object.keys(e2.actions)) {
      const n2 = i2.get(s2);
      n2 && (t2[n2] = () => {
        this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2.id, name: s2 } });
        return false;
      });
    }
    t2.onclick || (t2.onclick = () => false);
    this.#js();
  }
  _bindResetFormAction(t2, e2) {
    const i2 = t2.onclick;
    i2 || (t2.href = this.linkService.getAnchorUrl(""));
    this.#js();
    if (this._fieldObjects) t2.onclick = () => {
      i2?.();
      const { fields: t3, refs: s2, include: n2 } = e2, a2 = [];
      if (0 !== t3.length || 0 !== s2.length) {
        const e3 = new Set(s2);
        for (const i3 of t3) {
          const t4 = this._fieldObjects[i3] || [];
          for (const { id: i4 } of t4) e3.add(i4);
        }
        for (const t4 of Object.values(this._fieldObjects)) for (const i3 of t4) e3.has(i3.id) === n2 && a2.push(i3);
      } else for (const t4 of Object.values(this._fieldObjects)) a2.push(...t4);
      const r2 = this.annotationStorage, o2 = [];
      for (const t4 of a2) {
        const { id: e3 } = t4;
        o2.push(e3);
        switch (t4.type) {
          case "text": {
            const i4 = t4.defaultValue || "";
            r2.setValue(e3, { value: i4 });
            break;
          }
          case "checkbox":
          case "radiobutton": {
            const i4 = t4.defaultValue === t4.exportValues;
            r2.setValue(e3, { value: i4 });
            break;
          }
          case "combobox":
          case "listbox": {
            const i4 = t4.defaultValue || "";
            r2.setValue(e3, { value: i4 });
            break;
          }
          default:
            continue;
        }
        const i3 = document.querySelector(`[data-element-id="${e3}"]`);
        i3 && (Ht.has(i3) ? i3.dispatchEvent(new Event("resetform")) : warn(`_bindResetFormAction - element not allowed: ${e3}`));
      }
      this.enableScripting && this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: "app", ids: o2, name: "ResetForm" } });
      return false;
    };
    else {
      warn('_bindResetFormAction - "resetForm" action not supported, ensure that the `fieldObjects` parameter is provided.');
      i2 || (t2.onclick = () => false);
    }
  }
};
var TextAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true });
  }
  render() {
    this.container.classList.add("textAnnotation");
    const t2 = document.createElement("img");
    t2.src = this.imageResourcesPath + "annotation-" + this.data.name.toLowerCase() + ".svg";
    t2.setAttribute("data-l10n-id", "pdfjs-text-annotation-type");
    t2.setAttribute("data-l10n-args", JSON.stringify({ type: this.data.name }));
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this.container.append(t2);
    return this.container;
  }
};
var WidgetAnnotationElement = class extends AnnotationElement {
  render() {
    return this.container;
  }
  showElementAndHideCanvas(t2) {
    if (this.data.hasOwnCanvas) {
      "CANVAS" === t2.previousSibling?.nodeName && (t2.previousSibling.hidden = true);
      t2.hidden = false;
    }
  }
  _getKeyModifier(t2) {
    return util_FeatureTest.platform.isMac ? t2.metaKey : t2.ctrlKey;
  }
  _setEventListener(t2, e2, i2, s2, n2) {
    i2.includes("mouse") ? t2.addEventListener(i2, ((t3) => {
      this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: this.data.id, name: s2, value: n2(t3), shift: t3.shiftKey, modifier: this._getKeyModifier(t3) } });
    })) : t2.addEventListener(i2, ((t3) => {
      if ("blur" === i2) {
        if (!e2.focused || !t3.relatedTarget) return;
        e2.focused = false;
      } else if ("focus" === i2) {
        if (e2.focused) return;
        e2.focused = true;
      }
      n2 && this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: this.data.id, name: s2, value: n2(t3) } });
    }));
  }
  _setEventListeners(t2, e2, i2, s2) {
    for (const [n2, a2] of i2) if ("Action" === a2 || this.data.actions?.[a2]) {
      "Focus" !== a2 && "Blur" !== a2 || (e2 ||= { focused: false });
      this._setEventListener(t2, e2, n2, a2, s2);
      "Focus" !== a2 || this.data.actions?.Blur ? "Blur" !== a2 || this.data.actions?.Focus || this._setEventListener(t2, e2, "focus", "Focus", null) : this._setEventListener(t2, e2, "blur", "Blur", null);
    }
  }
  _setBackgroundColor(t2) {
    const e2 = this.data.backgroundColor || null;
    t2.style.backgroundColor = null === e2 ? "transparent" : Util.makeHexColor(e2[0], e2[1], e2[2]);
  }
  _setTextStyle(t2) {
    const e2 = ["left", "center", "right"], { fontColor: i2 } = this.data.defaultAppearanceData, s2 = this.data.defaultAppearanceData.fontSize || 9, a2 = t2.style;
    let r2;
    const roundToOneDecimal = (t3) => Math.round(10 * t3) / 10;
    if (this.data.multiLine) {
      const t3 = Math.abs(this.data.rect[3] - this.data.rect[1] - 2), e3 = t3 / (Math.round(t3 / (n * s2)) || 1);
      r2 = Math.min(s2, roundToOneDecimal(e3 / n));
    } else {
      const t3 = Math.abs(this.data.rect[3] - this.data.rect[1] - 2);
      r2 = Math.min(s2, roundToOneDecimal(t3 / n));
    }
    a2.fontSize = `calc(${r2}px * var(--scale-factor))`;
    a2.color = Util.makeHexColor(i2[0], i2[1], i2[2]);
    null !== this.data.textAlignment && (a2.textAlign = e2[this.data.textAlignment]);
  }
  _setRequired(t2, e2) {
    e2 ? t2.setAttribute("required", true) : t2.removeAttribute("required");
    t2.setAttribute("aria-required", e2);
  }
};
var TextWidgetAnnotationElement = class extends WidgetAnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: t2.renderForms || t2.data.hasOwnCanvas || !t2.data.hasAppearance && !!t2.data.fieldValue });
  }
  setPropertyOnSiblings(t2, e2, i2, s2) {
    const n2 = this.annotationStorage;
    for (const a2 of this._getElementsByName(t2.name, t2.id)) {
      a2.domElement && (a2.domElement[e2] = i2);
      n2.setValue(a2.id, { [s2]: i2 });
    }
  }
  render() {
    const t2 = this.annotationStorage, e2 = this.data.id;
    this.container.classList.add("textWidgetAnnotation");
    let i2 = null;
    if (this.renderForms) {
      const s2 = t2.getValue(e2, { value: this.data.fieldValue });
      let n2 = s2.value || "";
      const a2 = t2.getValue(e2, { charLimit: this.data.maxLen }).charLimit;
      a2 && n2.length > a2 && (n2 = n2.slice(0, a2));
      let r2 = s2.formattedValue || this.data.textContent?.join("\n") || null;
      r2 && this.data.comb && (r2 = r2.replaceAll(/\s+/g, ""));
      const o2 = { userValue: n2, formattedValue: r2, lastCommittedValue: null, commitKey: 1, focused: false };
      if (this.data.multiLine) {
        i2 = document.createElement("textarea");
        i2.textContent = r2 ?? n2;
        this.data.doNotScroll && (i2.style.overflowY = "hidden");
      } else {
        i2 = document.createElement("input");
        i2.type = "text";
        i2.setAttribute("value", r2 ?? n2);
        this.data.doNotScroll && (i2.style.overflowX = "hidden");
      }
      this.data.hasOwnCanvas && (i2.hidden = true);
      Ht.add(i2);
      i2.setAttribute("data-element-id", e2);
      i2.disabled = this.data.readOnly;
      i2.name = this.data.fieldName;
      i2.tabIndex = Bt;
      this._setRequired(i2, this.data.required);
      a2 && (i2.maxLength = a2);
      i2.addEventListener("input", ((s3) => {
        t2.setValue(e2, { value: s3.target.value });
        this.setPropertyOnSiblings(i2, "value", s3.target.value, "value");
        o2.formattedValue = null;
      }));
      i2.addEventListener("resetform", ((t3) => {
        const e3 = this.data.defaultFieldValue ?? "";
        i2.value = o2.userValue = e3;
        o2.formattedValue = null;
      }));
      let blurListener = (t3) => {
        const { formattedValue: e3 } = o2;
        null != e3 && (t3.target.value = e3);
        t3.target.scrollLeft = 0;
      };
      if (this.enableScripting && this.hasJSActions) {
        i2.addEventListener("focus", ((t3) => {
          if (o2.focused) return;
          const { target: e3 } = t3;
          o2.userValue && (e3.value = o2.userValue);
          o2.lastCommittedValue = e3.value;
          o2.commitKey = 1;
          this.data.actions?.Focus || (o2.focused = true);
        }));
        i2.addEventListener("updatefromsandbox", ((i3) => {
          this.showElementAndHideCanvas(i3.target);
          const s4 = { value(i4) {
            o2.userValue = i4.detail.value ?? "";
            t2.setValue(e2, { value: o2.userValue.toString() });
            i4.target.value = o2.userValue;
          }, formattedValue(i4) {
            const { formattedValue: s5 } = i4.detail;
            o2.formattedValue = s5;
            null != s5 && i4.target !== document.activeElement && (i4.target.value = s5);
            t2.setValue(e2, { formattedValue: s5 });
          }, selRange(t3) {
            t3.target.setSelectionRange(...t3.detail.selRange);
          }, charLimit: (i4) => {
            const { charLimit: s5 } = i4.detail, { target: n3 } = i4;
            if (0 === s5) {
              n3.removeAttribute("maxLength");
              return;
            }
            n3.setAttribute("maxLength", s5);
            let a3 = o2.userValue;
            if (a3 && !(a3.length <= s5)) {
              a3 = a3.slice(0, s5);
              n3.value = o2.userValue = a3;
              t2.setValue(e2, { value: a3 });
              this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: a3, willCommit: true, commitKey: 1, selStart: n3.selectionStart, selEnd: n3.selectionEnd } });
            }
          } };
          this._dispatchEventFromSandbox(s4, i3);
        }));
        i2.addEventListener("keydown", ((t3) => {
          o2.commitKey = 1;
          let i3 = -1;
          "Escape" === t3.key ? i3 = 0 : "Enter" !== t3.key || this.data.multiLine ? "Tab" === t3.key && (o2.commitKey = 3) : i3 = 2;
          if (-1 === i3) return;
          const { value: s4 } = t3.target;
          if (o2.lastCommittedValue !== s4) {
            o2.lastCommittedValue = s4;
            o2.userValue = s4;
            this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: s4, willCommit: true, commitKey: i3, selStart: t3.target.selectionStart, selEnd: t3.target.selectionEnd } });
          }
        }));
        const s3 = blurListener;
        blurListener = null;
        i2.addEventListener("blur", ((t3) => {
          if (!o2.focused || !t3.relatedTarget) return;
          this.data.actions?.Blur || (o2.focused = false);
          const { value: i3 } = t3.target;
          o2.userValue = i3;
          o2.lastCommittedValue !== i3 && this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: i3, willCommit: true, commitKey: o2.commitKey, selStart: t3.target.selectionStart, selEnd: t3.target.selectionEnd } });
          s3(t3);
        }));
        this.data.actions?.Keystroke && i2.addEventListener("beforeinput", ((t3) => {
          o2.lastCommittedValue = null;
          const { data: i3, target: s4 } = t3, { value: n3, selectionStart: a3, selectionEnd: r3 } = s4;
          let l2 = a3, h2 = r3;
          switch (t3.inputType) {
            case "deleteWordBackward": {
              const t4 = n3.substring(0, a3).match(/\w*[^\w]*$/);
              t4 && (l2 -= t4[0].length);
              break;
            }
            case "deleteWordForward": {
              const t4 = n3.substring(a3).match(/^[^\w]*\w*/);
              t4 && (h2 += t4[0].length);
              break;
            }
            case "deleteContentBackward":
              a3 === r3 && (l2 -= 1);
              break;
            case "deleteContentForward":
              a3 === r3 && (h2 += 1);
          }
          t3.preventDefault();
          this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: n3, change: i3 || "", willCommit: false, selStart: l2, selEnd: h2 } });
        }));
        this._setEventListeners(i2, o2, [["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], ((t3) => t3.target.value));
      }
      blurListener && i2.addEventListener("blur", blurListener);
      if (this.data.comb) {
        const t3 = (this.data.rect[2] - this.data.rect[0]) / a2;
        i2.classList.add("comb");
        i2.style.letterSpacing = `calc(${t3}px * var(--scale-factor) - 1ch)`;
      }
    } else {
      i2 = document.createElement("div");
      i2.textContent = this.data.fieldValue;
      i2.style.verticalAlign = "middle";
      i2.style.display = "table-cell";
      this.data.hasOwnCanvas && (i2.hidden = true);
    }
    this._setTextStyle(i2);
    this._setBackgroundColor(i2);
    this._setDefaultPropertiesFromJS(i2);
    this.container.append(i2);
    return this.container;
  }
};
var SignatureWidgetAnnotationElement = class extends WidgetAnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: !!t2.data.hasOwnCanvas });
  }
};
var CheckboxWidgetAnnotationElement = class extends WidgetAnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: t2.renderForms });
  }
  render() {
    const t2 = this.annotationStorage, e2 = this.data, i2 = e2.id;
    let s2 = t2.getValue(i2, { value: e2.exportValue === e2.fieldValue }).value;
    if ("string" == typeof s2) {
      s2 = "Off" !== s2;
      t2.setValue(i2, { value: s2 });
    }
    this.container.classList.add("buttonWidgetAnnotation", "checkBox");
    const n2 = document.createElement("input");
    Ht.add(n2);
    n2.setAttribute("data-element-id", i2);
    n2.disabled = e2.readOnly;
    this._setRequired(n2, this.data.required);
    n2.type = "checkbox";
    n2.name = e2.fieldName;
    s2 && n2.setAttribute("checked", true);
    n2.setAttribute("exportValue", e2.exportValue);
    n2.tabIndex = Bt;
    n2.addEventListener("change", ((s3) => {
      const { name: n3, checked: a2 } = s3.target;
      for (const s4 of this._getElementsByName(n3, i2)) {
        const i3 = a2 && s4.exportValue === e2.exportValue;
        s4.domElement && (s4.domElement.checked = i3);
        t2.setValue(s4.id, { value: i3 });
      }
      t2.setValue(i2, { value: a2 });
    }));
    n2.addEventListener("resetform", ((t3) => {
      const i3 = e2.defaultFieldValue || "Off";
      t3.target.checked = i3 === e2.exportValue;
    }));
    if (this.enableScripting && this.hasJSActions) {
      n2.addEventListener("updatefromsandbox", ((e3) => {
        const s3 = { value(e4) {
          e4.target.checked = "Off" !== e4.detail.value;
          t2.setValue(i2, { value: e4.target.checked });
        } };
        this._dispatchEventFromSandbox(s3, e3);
      }));
      this._setEventListeners(n2, null, [["change", "Validate"], ["change", "Action"], ["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], ((t3) => t3.target.checked));
    }
    this._setBackgroundColor(n2);
    this._setDefaultPropertiesFromJS(n2);
    this.container.append(n2);
    return this.container;
  }
};
var RadioButtonWidgetAnnotationElement = class extends WidgetAnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: t2.renderForms });
  }
  render() {
    this.container.classList.add("buttonWidgetAnnotation", "radioButton");
    const t2 = this.annotationStorage, e2 = this.data, i2 = e2.id;
    let s2 = t2.getValue(i2, { value: e2.fieldValue === e2.buttonValue }).value;
    if ("string" == typeof s2) {
      s2 = s2 !== e2.buttonValue;
      t2.setValue(i2, { value: s2 });
    }
    if (s2) for (const s3 of this._getElementsByName(e2.fieldName, i2)) t2.setValue(s3.id, { value: false });
    const n2 = document.createElement("input");
    Ht.add(n2);
    n2.setAttribute("data-element-id", i2);
    n2.disabled = e2.readOnly;
    this._setRequired(n2, this.data.required);
    n2.type = "radio";
    n2.name = e2.fieldName;
    s2 && n2.setAttribute("checked", true);
    n2.tabIndex = Bt;
    n2.addEventListener("change", ((e3) => {
      const { name: s3, checked: n3 } = e3.target;
      for (const e4 of this._getElementsByName(s3, i2)) t2.setValue(e4.id, { value: false });
      t2.setValue(i2, { value: n3 });
    }));
    n2.addEventListener("resetform", ((t3) => {
      const i3 = e2.defaultFieldValue;
      t3.target.checked = null != i3 && i3 === e2.buttonValue;
    }));
    if (this.enableScripting && this.hasJSActions) {
      const s3 = e2.buttonValue;
      n2.addEventListener("updatefromsandbox", ((e3) => {
        const n3 = { value: (e4) => {
          const n4 = s3 === e4.detail.value;
          for (const s4 of this._getElementsByName(e4.target.name)) {
            const e5 = n4 && s4.id === i2;
            s4.domElement && (s4.domElement.checked = e5);
            t2.setValue(s4.id, { value: e5 });
          }
        } };
        this._dispatchEventFromSandbox(n3, e3);
      }));
      this._setEventListeners(n2, null, [["change", "Validate"], ["change", "Action"], ["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], ((t3) => t3.target.checked));
    }
    this._setBackgroundColor(n2);
    this._setDefaultPropertiesFromJS(n2);
    this.container.append(n2);
    return this.container;
  }
};
var PushButtonWidgetAnnotationElement = class extends LinkAnnotationElement {
  constructor(t2) {
    super(t2, { ignoreBorder: t2.data.hasAppearance });
  }
  render() {
    const t2 = super.render();
    t2.classList.add("buttonWidgetAnnotation", "pushButton");
    const e2 = t2.lastChild;
    if (this.enableScripting && this.hasJSActions && e2) {
      this._setDefaultPropertiesFromJS(e2);
      e2.addEventListener("updatefromsandbox", ((t3) => {
        this._dispatchEventFromSandbox({}, t3);
      }));
    }
    return t2;
  }
};
var ChoiceWidgetAnnotationElement = class extends WidgetAnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: t2.renderForms });
  }
  render() {
    this.container.classList.add("choiceWidgetAnnotation");
    const t2 = this.annotationStorage, e2 = this.data.id, i2 = t2.getValue(e2, { value: this.data.fieldValue }), s2 = document.createElement("select");
    Ht.add(s2);
    s2.setAttribute("data-element-id", e2);
    s2.disabled = this.data.readOnly;
    this._setRequired(s2, this.data.required);
    s2.name = this.data.fieldName;
    s2.tabIndex = Bt;
    let n2 = this.data.combo && this.data.options.length > 0;
    if (!this.data.combo) {
      s2.size = this.data.options.length;
      this.data.multiSelect && (s2.multiple = true);
    }
    s2.addEventListener("resetform", ((t3) => {
      const e3 = this.data.defaultFieldValue;
      for (const t4 of s2.options) t4.selected = t4.value === e3;
    }));
    for (const t3 of this.data.options) {
      const e3 = document.createElement("option");
      e3.textContent = t3.displayValue;
      e3.value = t3.exportValue;
      if (i2.value.includes(t3.exportValue)) {
        e3.setAttribute("selected", true);
        n2 = false;
      }
      s2.append(e3);
    }
    let a2 = null;
    if (n2) {
      const t3 = document.createElement("option");
      t3.value = " ";
      t3.setAttribute("hidden", true);
      t3.setAttribute("selected", true);
      s2.prepend(t3);
      a2 = () => {
        t3.remove();
        s2.removeEventListener("input", a2);
        a2 = null;
      };
      s2.addEventListener("input", a2);
    }
    const getValue = (t3) => {
      const e3 = t3 ? "value" : "textContent", { options: i3, multiple: n3 } = s2;
      return n3 ? Array.prototype.filter.call(i3, ((t4) => t4.selected)).map(((t4) => t4[e3])) : -1 === i3.selectedIndex ? null : i3[i3.selectedIndex][e3];
    };
    let r2 = getValue(false);
    const getItems = (t3) => {
      const e3 = t3.target.options;
      return Array.prototype.map.call(e3, ((t4) => ({ displayValue: t4.textContent, exportValue: t4.value })));
    };
    if (this.enableScripting && this.hasJSActions) {
      s2.addEventListener("updatefromsandbox", ((i3) => {
        const n3 = { value(i4) {
          a2?.();
          const n4 = i4.detail.value, o2 = new Set(Array.isArray(n4) ? n4 : [n4]);
          for (const t3 of s2.options) t3.selected = o2.has(t3.value);
          t2.setValue(e2, { value: getValue(true) });
          r2 = getValue(false);
        }, multipleSelection(t3) {
          s2.multiple = true;
        }, remove(i4) {
          const n4 = s2.options, a3 = i4.detail.remove;
          n4[a3].selected = false;
          s2.remove(a3);
          if (n4.length > 0) {
            -1 === Array.prototype.findIndex.call(n4, ((t3) => t3.selected)) && (n4[0].selected = true);
          }
          t2.setValue(e2, { value: getValue(true), items: getItems(i4) });
          r2 = getValue(false);
        }, clear(i4) {
          for (; 0 !== s2.length; ) s2.remove(0);
          t2.setValue(e2, { value: null, items: [] });
          r2 = getValue(false);
        }, insert(i4) {
          const { index: n4, displayValue: a3, exportValue: o2 } = i4.detail.insert, l2 = s2.children[n4], h2 = document.createElement("option");
          h2.textContent = a3;
          h2.value = o2;
          l2 ? l2.before(h2) : s2.append(h2);
          t2.setValue(e2, { value: getValue(true), items: getItems(i4) });
          r2 = getValue(false);
        }, items(i4) {
          const { items: n4 } = i4.detail;
          for (; 0 !== s2.length; ) s2.remove(0);
          for (const t3 of n4) {
            const { displayValue: e3, exportValue: i5 } = t3, n5 = document.createElement("option");
            n5.textContent = e3;
            n5.value = i5;
            s2.append(n5);
          }
          s2.options.length > 0 && (s2.options[0].selected = true);
          t2.setValue(e2, { value: getValue(true), items: getItems(i4) });
          r2 = getValue(false);
        }, indices(i4) {
          const s3 = new Set(i4.detail.indices);
          for (const t3 of i4.target.options) t3.selected = s3.has(t3.index);
          t2.setValue(e2, { value: getValue(true) });
          r2 = getValue(false);
        }, editable(t3) {
          t3.target.disabled = !t3.detail.editable;
        } };
        this._dispatchEventFromSandbox(n3, i3);
      }));
      s2.addEventListener("input", ((i3) => {
        const s3 = getValue(true), n3 = getValue(false);
        t2.setValue(e2, { value: s3 });
        i3.preventDefault();
        this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: r2, change: n3, changeEx: s3, willCommit: false, commitKey: 1, keyDown: false } });
      }));
      this._setEventListeners(s2, null, [["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"], ["input", "Action"], ["input", "Validate"]], ((t3) => t3.target.value));
    } else s2.addEventListener("input", (function(i3) {
      t2.setValue(e2, { value: getValue(true) });
    }));
    this.data.combo && this._setTextStyle(s2);
    this._setBackgroundColor(s2);
    this._setDefaultPropertiesFromJS(s2);
    this.container.append(s2);
    return this.container;
  }
};
var PopupAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    const { data: e2, elements: i2 } = t2;
    super(t2, { isRenderable: AnnotationElement._hasPopupData(e2) });
    this.elements = i2;
    this.popup = null;
  }
  render() {
    this.container.classList.add("popupAnnotation");
    const t2 = this.popup = new PopupElement({ container: this.container, color: this.data.color, titleObj: this.data.titleObj, modificationDate: this.data.modificationDate, contentsObj: this.data.contentsObj, richText: this.data.richText, rect: this.data.rect, parentRect: this.data.parentRect || null, parent: this.parent, elements: this.elements, open: this.data.open }), e2 = [];
    for (const i2 of this.elements) {
      i2.popup = t2;
      i2.container.ariaHasPopup = "dialog";
      e2.push(i2.data.id);
      i2.addHighlightArea();
    }
    this.container.setAttribute("aria-controls", e2.map(((t3) => `${et}${t3}`)).join(","));
    return this.container;
  }
};
var PopupElement = class {
  #Ws = this.#qs.bind(this);
  #Xs = this.#Ks.bind(this);
  #Ys = this.#Qs.bind(this);
  #Js = this.#Zs.bind(this);
  #tn = null;
  #pt = null;
  #en = null;
  #in = null;
  #sn = null;
  #nn = null;
  #an = null;
  #rn = false;
  #on = null;
  #C = null;
  #ln = null;
  #hn = null;
  #dn = null;
  #Hs = null;
  #cn = false;
  constructor({ container: t2, color: e2, elements: i2, titleObj: s2, modificationDate: n2, contentsObj: a2, richText: r2, parent: o2, rect: l2, parentRect: h2, open: d2 }) {
    this.#pt = t2;
    this.#dn = s2;
    this.#en = a2;
    this.#hn = r2;
    this.#nn = o2;
    this.#tn = e2;
    this.#ln = l2;
    this.#an = h2;
    this.#sn = i2;
    this.#in = PDFDateString.toDateObject(n2);
    this.trigger = i2.flatMap(((t3) => t3.getElementsToTriggerPopup()));
    for (const t3 of this.trigger) {
      t3.addEventListener("click", this.#Js);
      t3.addEventListener("mouseenter", this.#Ys);
      t3.addEventListener("mouseleave", this.#Xs);
      t3.classList.add("popupTriggerArea");
    }
    for (const t3 of i2) t3.container?.addEventListener("keydown", this.#Ws);
    this.#pt.hidden = true;
    d2 && this.#Zs();
  }
  render() {
    if (this.#on) return;
    const t2 = this.#on = document.createElement("div");
    t2.className = "popup";
    if (this.#tn) {
      const e3 = t2.style.outlineColor = Util.makeHexColor(...this.#tn);
      if (CSS.supports("background-color", "color-mix(in srgb, red 30%, white)")) t2.style.backgroundColor = `color-mix(in srgb, ${e3} 30%, white)`;
      else {
        const e4 = 0.7;
        t2.style.backgroundColor = Util.makeHexColor(...this.#tn.map(((t3) => Math.floor(e4 * (255 - t3) + t3))));
      }
    }
    const e2 = document.createElement("span");
    e2.className = "header";
    const i2 = document.createElement("h1");
    e2.append(i2);
    ({ dir: i2.dir, str: i2.textContent } = this.#dn);
    t2.append(e2);
    if (this.#in) {
      const t3 = document.createElement("span");
      t3.classList.add("popupDate");
      t3.setAttribute("data-l10n-id", "pdfjs-annotation-date-time-string");
      t3.setAttribute("data-l10n-args", JSON.stringify({ dateObj: this.#in.valueOf() }));
      e2.append(t3);
    }
    const s2 = this.#un;
    if (s2) {
      XfaLayer.render({ xfaHtml: s2, intent: "richText", div: t2 });
      t2.lastChild.classList.add("richText", "popupContent");
    } else {
      const e3 = this._formatContents(this.#en);
      t2.append(e3);
    }
    this.#pt.append(t2);
  }
  get #un() {
    const t2 = this.#hn, e2 = this.#en;
    return !t2?.str || e2?.str && e2.str !== t2.str ? null : this.#hn.html || null;
  }
  get #pn() {
    return this.#un?.attributes?.style?.fontSize || 0;
  }
  get #gn() {
    return this.#un?.attributes?.style?.color || null;
  }
  #mn(t2) {
    const e2 = [], i2 = { str: t2, html: { name: "div", attributes: { dir: "auto" }, children: [{ name: "p", children: e2 }] } }, s2 = { style: { color: this.#gn, fontSize: this.#pn ? `calc(${this.#pn}px * var(--scale-factor))` : "" } };
    for (const i3 of t2.split("\n")) e2.push({ name: "span", value: i3, attributes: s2 });
    return i2;
  }
  _formatContents({ str: t2, dir: e2 }) {
    const i2 = document.createElement("p");
    i2.classList.add("popupContent");
    i2.dir = e2;
    const s2 = t2.split(/(?:\r\n?|\n)/);
    for (let t3 = 0, e3 = s2.length; t3 < e3; ++t3) {
      const n2 = s2[t3];
      i2.append(document.createTextNode(n2));
      t3 < e3 - 1 && i2.append(document.createElement("br"));
    }
    return i2;
  }
  #qs(t2) {
    t2.altKey || t2.shiftKey || t2.ctrlKey || t2.metaKey || ("Enter" === t2.key || "Escape" === t2.key && this.#rn) && this.#Zs();
  }
  updateEdited({ rect: t2, popupContent: e2 }) {
    this.#Hs ||= { contentsObj: this.#en, richText: this.#hn };
    t2 && (this.#C = null);
    if (e2) {
      this.#hn = this.#mn(e2);
      this.#en = null;
    }
    this.#on?.remove();
    this.#on = null;
  }
  resetEdited() {
    if (this.#Hs) {
      ({ contentsObj: this.#en, richText: this.#hn } = this.#Hs);
      this.#Hs = null;
      this.#on?.remove();
      this.#on = null;
      this.#C = null;
    }
  }
  #fn() {
    if (null !== this.#C) return;
    const { page: { view: t2 }, viewport: { rawDims: { pageWidth: e2, pageHeight: i2, pageX: s2, pageY: n2 } } } = this.#nn;
    let a2 = !!this.#an, r2 = a2 ? this.#an : this.#ln;
    for (const t3 of this.#sn) if (!r2 || null !== Util.intersect(t3.data.rect, r2)) {
      r2 = t3.data.rect;
      a2 = true;
      break;
    }
    const o2 = Util.normalizeRect([r2[0], t2[3] - r2[1] + t2[1], r2[2], t2[3] - r2[3] + t2[1]]), l2 = a2 ? r2[2] - r2[0] + 5 : 0, h2 = o2[0] + l2, d2 = o2[1];
    this.#C = [100 * (h2 - s2) / e2, 100 * (d2 - n2) / i2];
    const { style: c2 } = this.#pt;
    c2.left = `${this.#C[0]}%`;
    c2.top = `${this.#C[1]}%`;
  }
  #Zs() {
    this.#rn = !this.#rn;
    if (this.#rn) {
      this.#Qs();
      this.#pt.addEventListener("click", this.#Js);
      this.#pt.addEventListener("keydown", this.#Ws);
    } else {
      this.#Ks();
      this.#pt.removeEventListener("click", this.#Js);
      this.#pt.removeEventListener("keydown", this.#Ws);
    }
  }
  #Qs() {
    this.#on || this.render();
    if (this.isVisible) this.#rn && this.#pt.classList.add("focused");
    else {
      this.#fn();
      this.#pt.hidden = false;
      this.#pt.style.zIndex = parseInt(this.#pt.style.zIndex) + 1e3;
    }
  }
  #Ks() {
    this.#pt.classList.remove("focused");
    if (!this.#rn && this.isVisible) {
      this.#pt.hidden = true;
      this.#pt.style.zIndex = parseInt(this.#pt.style.zIndex) - 1e3;
    }
  }
  forceHide() {
    this.#cn = this.isVisible;
    this.#cn && (this.#pt.hidden = true);
  }
  maybeShow() {
    if (this.#cn) {
      this.#on || this.#Qs();
      this.#cn = false;
      this.#pt.hidden = false;
    }
  }
  get isVisible() {
    return false === this.#pt.hidden;
  }
};
var FreeTextAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
    this.textContent = t2.data.textContent;
    this.textPosition = t2.data.textPosition;
    this.annotationEditorType = g.FREETEXT;
  }
  render() {
    this.container.classList.add("freeTextAnnotation");
    if (this.textContent) {
      const t2 = document.createElement("div");
      t2.classList.add("annotationTextContent");
      t2.setAttribute("role", "comment");
      for (const e2 of this.textContent) {
        const i2 = document.createElement("span");
        i2.textContent = e2;
        t2.append(i2);
      }
      this.container.append(t2);
    }
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this._editOnDoubleClick();
    return this.container;
  }
};
var LineAnnotationElement = class extends AnnotationElement {
  #bn = null;
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
  }
  render() {
    this.container.classList.add("lineAnnotation");
    const t2 = this.data, { width: e2, height: i2 } = getRectDims(t2.rect), s2 = this.svgFactory.create(e2, i2, true), n2 = this.#bn = this.svgFactory.createElement("svg:line");
    n2.setAttribute("x1", t2.rect[2] - t2.lineCoordinates[0]);
    n2.setAttribute("y1", t2.rect[3] - t2.lineCoordinates[1]);
    n2.setAttribute("x2", t2.rect[2] - t2.lineCoordinates[2]);
    n2.setAttribute("y2", t2.rect[3] - t2.lineCoordinates[3]);
    n2.setAttribute("stroke-width", t2.borderStyle.width || 1);
    n2.setAttribute("stroke", "transparent");
    n2.setAttribute("fill", "transparent");
    s2.append(n2);
    this.container.append(s2);
    !t2.popupRef && this.hasPopupData && this._createPopup();
    return this.container;
  }
  getElementsToTriggerPopup() {
    return this.#bn;
  }
  addHighlightArea() {
    this.container.classList.add("highlightArea");
  }
};
var SquareAnnotationElement = class extends AnnotationElement {
  #An = null;
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
  }
  render() {
    this.container.classList.add("squareAnnotation");
    const t2 = this.data, { width: e2, height: i2 } = getRectDims(t2.rect), s2 = this.svgFactory.create(e2, i2, true), n2 = t2.borderStyle.width, a2 = this.#An = this.svgFactory.createElement("svg:rect");
    a2.setAttribute("x", n2 / 2);
    a2.setAttribute("y", n2 / 2);
    a2.setAttribute("width", e2 - n2);
    a2.setAttribute("height", i2 - n2);
    a2.setAttribute("stroke-width", n2 || 1);
    a2.setAttribute("stroke", "transparent");
    a2.setAttribute("fill", "transparent");
    s2.append(a2);
    this.container.append(s2);
    !t2.popupRef && this.hasPopupData && this._createPopup();
    return this.container;
  }
  getElementsToTriggerPopup() {
    return this.#An;
  }
  addHighlightArea() {
    this.container.classList.add("highlightArea");
  }
};
var CircleAnnotationElement = class extends AnnotationElement {
  #wn = null;
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
  }
  render() {
    this.container.classList.add("circleAnnotation");
    const t2 = this.data, { width: e2, height: i2 } = getRectDims(t2.rect), s2 = this.svgFactory.create(e2, i2, true), n2 = t2.borderStyle.width, a2 = this.#wn = this.svgFactory.createElement("svg:ellipse");
    a2.setAttribute("cx", e2 / 2);
    a2.setAttribute("cy", i2 / 2);
    a2.setAttribute("rx", e2 / 2 - n2 / 2);
    a2.setAttribute("ry", i2 / 2 - n2 / 2);
    a2.setAttribute("stroke-width", n2 || 1);
    a2.setAttribute("stroke", "transparent");
    a2.setAttribute("fill", "transparent");
    s2.append(a2);
    this.container.append(s2);
    !t2.popupRef && this.hasPopupData && this._createPopup();
    return this.container;
  }
  getElementsToTriggerPopup() {
    return this.#wn;
  }
  addHighlightArea() {
    this.container.classList.add("highlightArea");
  }
};
var PolylineAnnotationElement = class extends AnnotationElement {
  #vn = null;
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
    this.containerClassName = "polylineAnnotation";
    this.svgElementName = "svg:polyline";
  }
  render() {
    this.container.classList.add(this.containerClassName);
    const { data: { rect: t2, vertices: e2, borderStyle: i2, popupRef: s2 } } = this;
    if (!e2) return this.container;
    const { width: n2, height: a2 } = getRectDims(t2), r2 = this.svgFactory.create(n2, a2, true);
    let o2 = [];
    for (let i3 = 0, s3 = e2.length; i3 < s3; i3 += 2) {
      const s4 = e2[i3] - t2[0], n3 = t2[3] - e2[i3 + 1];
      o2.push(`${s4},${n3}`);
    }
    o2 = o2.join(" ");
    const l2 = this.#vn = this.svgFactory.createElement(this.svgElementName);
    l2.setAttribute("points", o2);
    l2.setAttribute("stroke-width", i2.width || 1);
    l2.setAttribute("stroke", "transparent");
    l2.setAttribute("fill", "transparent");
    r2.append(l2);
    this.container.append(r2);
    !s2 && this.hasPopupData && this._createPopup();
    return this.container;
  }
  getElementsToTriggerPopup() {
    return this.#vn;
  }
  addHighlightArea() {
    this.container.classList.add("highlightArea");
  }
};
var PolygonAnnotationElement = class extends PolylineAnnotationElement {
  constructor(t2) {
    super(t2);
    this.containerClassName = "polygonAnnotation";
    this.svgElementName = "svg:polygon";
  }
};
var CaretAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
  }
  render() {
    this.container.classList.add("caretAnnotation");
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    return this.container;
  }
};
var InkAnnotationElement = class extends AnnotationElement {
  #yn = null;
  #xn = [];
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
    this.containerClassName = "inkAnnotation";
    this.svgElementName = "svg:polyline";
    this.annotationEditorType = "InkHighlight" === this.data.it ? g.HIGHLIGHT : g.INK;
  }
  #_n(t2, e2) {
    switch (t2) {
      case 90:
        return { transform: `rotate(90) translate(${-e2[0]},${e2[1]}) scale(1,-1)`, width: e2[3] - e2[1], height: e2[2] - e2[0] };
      case 180:
        return { transform: `rotate(180) translate(${-e2[2]},${e2[1]}) scale(1,-1)`, width: e2[2] - e2[0], height: e2[3] - e2[1] };
      case 270:
        return { transform: `rotate(270) translate(${-e2[2]},${e2[3]}) scale(1,-1)`, width: e2[3] - e2[1], height: e2[2] - e2[0] };
      default:
        return { transform: `translate(${-e2[0]},${e2[3]}) scale(1,-1)`, width: e2[2] - e2[0], height: e2[3] - e2[1] };
    }
  }
  render() {
    this.container.classList.add(this.containerClassName);
    const { data: { rect: t2, rotation: e2, inkLists: i2, borderStyle: s2, popupRef: n2 } } = this, { transform: a2, width: r2, height: o2 } = this.#_n(e2, t2), l2 = this.svgFactory.create(r2, o2, true), h2 = this.#yn = this.svgFactory.createElement("svg:g");
    l2.append(h2);
    h2.setAttribute("stroke-width", s2.width || 1);
    h2.setAttribute("stroke-linecap", "round");
    h2.setAttribute("stroke-linejoin", "round");
    h2.setAttribute("stroke-miterlimit", 10);
    h2.setAttribute("stroke", "transparent");
    h2.setAttribute("fill", "transparent");
    h2.setAttribute("transform", a2);
    for (let t3 = 0, e3 = i2.length; t3 < e3; t3++) {
      const e4 = this.svgFactory.createElement(this.svgElementName);
      this.#xn.push(e4);
      e4.setAttribute("points", i2[t3].join(","));
      h2.append(e4);
    }
    !n2 && this.hasPopupData && this._createPopup();
    this.container.append(l2);
    this._editOnDoubleClick();
    return this.container;
  }
  updateEdited(t2) {
    super.updateEdited(t2);
    const { thickness: e2, points: i2, rect: s2 } = t2, n2 = this.#yn;
    e2 >= 0 && n2.setAttribute("stroke-width", e2 || 1);
    if (i2) for (let t3 = 0, e3 = this.#xn.length; t3 < e3; t3++) this.#xn[t3].setAttribute("points", i2[t3].join(","));
    if (s2) {
      const { transform: t3, width: e3, height: i3 } = this.#_n(this.data.rotation, s2);
      n2.parentElement.setAttribute("viewBox", `0 0 ${e3} ${i3}`);
      n2.setAttribute("transform", t3);
    }
  }
  getElementsToTriggerPopup() {
    return this.#xn;
  }
  addHighlightArea() {
    this.container.classList.add("highlightArea");
  }
};
var HighlightAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
    this.annotationEditorType = g.HIGHLIGHT;
  }
  render() {
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this.container.classList.add("highlightAnnotation");
    this._editOnDoubleClick();
    return this.container;
  }
};
var UnderlineAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
  }
  render() {
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this.container.classList.add("underlineAnnotation");
    return this.container;
  }
};
var SquigglyAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
  }
  render() {
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this.container.classList.add("squigglyAnnotation");
    return this.container;
  }
};
var StrikeOutAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
  }
  render() {
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this.container.classList.add("strikeoutAnnotation");
    return this.container;
  }
};
var StampAnnotationElement = class extends AnnotationElement {
  constructor(t2) {
    super(t2, { isRenderable: true, ignoreBorder: true });
    this.annotationEditorType = g.STAMP;
  }
  render() {
    this.container.classList.add("stampAnnotation");
    this.container.setAttribute("role", "img");
    !this.data.popupRef && this.hasPopupData && this._createPopup();
    this._editOnDoubleClick();
    return this.container;
  }
};
var FileAttachmentAnnotationElement = class extends AnnotationElement {
  #En = null;
  constructor(t2) {
    super(t2, { isRenderable: true });
    const { file: e2 } = this.data;
    this.filename = e2.filename;
    this.content = e2.content;
    this.linkService.eventBus?.dispatch("fileattachmentannotation", { source: this, ...e2 });
  }
  render() {
    this.container.classList.add("fileAttachmentAnnotation");
    const { container: t2, data: e2 } = this;
    let i2;
    if (e2.hasAppearance || 0 === e2.fillAlpha) i2 = document.createElement("div");
    else {
      i2 = document.createElement("img");
      i2.src = `${this.imageResourcesPath}annotation-${/paperclip/i.test(e2.name) ? "paperclip" : "pushpin"}.svg`;
      e2.fillAlpha && e2.fillAlpha < 1 && (i2.style = `filter: opacity(${Math.round(100 * e2.fillAlpha)}%);`);
    }
    i2.addEventListener("dblclick", this.#Sn.bind(this));
    this.#En = i2;
    const { isMac: s2 } = util_FeatureTest.platform;
    t2.addEventListener("keydown", ((t3) => {
      "Enter" === t3.key && (s2 ? t3.metaKey : t3.ctrlKey) && this.#Sn();
    }));
    !e2.popupRef && this.hasPopupData ? this._createPopup() : i2.classList.add("popupTriggerArea");
    t2.append(i2);
    return t2;
  }
  getElementsToTriggerPopup() {
    return this.#En;
  }
  addHighlightArea() {
    this.container.classList.add("highlightArea");
  }
  #Sn() {
    this.downloadManager?.openOrDownloadData(this.content, this.filename);
  }
};
var AnnotationLayer = class {
  #Cn = null;
  #Tn = null;
  #Mn = /* @__PURE__ */ new Map();
  #Pn = null;
  constructor({ div: t2, accessibilityManager: e2, annotationCanvasMap: i2, annotationEditorUIManager: s2, page: n2, viewport: a2, structTreeLayer: r2 }) {
    this.div = t2;
    this.#Cn = e2;
    this.#Tn = i2;
    this.#Pn = r2 || null;
    this.page = n2;
    this.viewport = a2;
    this.zIndex = 0;
    this._annotationEditorUIManager = s2;
  }
  hasEditableAnnotations() {
    return this.#Mn.size > 0;
  }
  async #Dn(t2, e2) {
    const i2 = t2.firstChild || t2, s2 = i2.id = `${et}${e2}`, n2 = await this.#Pn?.getAriaAttributes(s2);
    if (n2) for (const [t3, e3] of n2) i2.setAttribute(t3, e3);
    this.div.append(t2);
    this.#Cn?.moveElementInDOM(this.div, t2, i2, false);
  }
  async render(t2) {
    const { annotations: e2 } = t2, i2 = this.div;
    setLayerDimensions(i2, this.viewport);
    const s2 = /* @__PURE__ */ new Map(), n2 = { data: null, layer: i2, linkService: t2.linkService, downloadManager: t2.downloadManager, imageResourcesPath: t2.imageResourcesPath || "", renderForms: false !== t2.renderForms, svgFactory: new DOMSVGFactory(), annotationStorage: t2.annotationStorage || new AnnotationStorage(), enableScripting: true === t2.enableScripting, hasJSActions: t2.hasJSActions, fieldObjects: t2.fieldObjects, parent: this, elements: null };
    for (const t3 of e2) {
      if (t3.noHTML) continue;
      const e3 = t3.annotationType === H;
      if (e3) {
        const e4 = s2.get(t3.id);
        if (!e4) continue;
        n2.elements = e4;
      } else {
        const { width: e4, height: i4 } = getRectDims(t3.rect);
        if (e4 <= 0 || i4 <= 0) continue;
      }
      n2.data = t3;
      const i3 = AnnotationElementFactory.create(n2);
      if (!i3.isRenderable) continue;
      if (!e3 && t3.popupRef) {
        const e4 = s2.get(t3.popupRef);
        e4 ? e4.push(i3) : s2.set(t3.popupRef, [i3]);
      }
      const a2 = i3.render();
      t3.hidden && (a2.style.visibility = "hidden");
      await this.#Dn(a2, t3.id);
      if (i3._isEditable) {
        this.#Mn.set(i3.data.id, i3);
        this._annotationEditorUIManager?.renderAnnotationElement(i3);
      }
    }
    this.#kn();
  }
  update({ viewport: t2 }) {
    const e2 = this.div;
    this.viewport = t2;
    setLayerDimensions(e2, { rotation: t2.rotation });
    this.#kn();
    e2.hidden = false;
  }
  #kn() {
    if (!this.#Tn) return;
    const t2 = this.div;
    for (const [e2, i2] of this.#Tn) {
      const s2 = t2.querySelector(`[data-annotation-id="${e2}"]`);
      if (!s2) continue;
      i2.className = "annotationContent";
      const { firstChild: n2 } = s2;
      n2 ? "CANVAS" === n2.nodeName ? n2.replaceWith(i2) : n2.classList.contains("annotationContent") ? n2.after(i2) : n2.before(i2) : s2.append(i2);
    }
    this.#Tn.clear();
  }
  getEditableAnnotations() {
    return Array.from(this.#Mn.values());
  }
  getEditableAnnotation(t2) {
    return this.#Mn.get(t2);
  }
};
var zt = /\r\n?|\n/g;
var FreeTextEditor = class _FreeTextEditor extends AnnotationEditor {
  #tn;
  #Rn = "";
  #In = `${this.id}-editor`;
  #Fn = null;
  #pn;
  static _freeTextDefaultContent = "";
  static _internalPadding = 0;
  static _defaultColor = null;
  static _defaultFontSize = 10;
  static get _keyboardManager() {
    const t2 = _FreeTextEditor.prototype, arrowChecker = (t3) => t3.isEmpty(), e2 = AnnotationEditorUIManager.TRANSLATE_SMALL, i2 = AnnotationEditorUIManager.TRANSLATE_BIG;
    return shadow(this, "_keyboardManager", new KeyboardManager([[["ctrl+s", "mac+meta+s", "ctrl+p", "mac+meta+p"], t2.commitOrRemove, { bubbles: true }], [["ctrl+Enter", "mac+meta+Enter", "Escape", "mac+Escape"], t2.commitOrRemove], [["ArrowLeft", "mac+ArrowLeft"], t2._translateEmpty, { args: [-e2, 0], checker: arrowChecker }], [["ctrl+ArrowLeft", "mac+shift+ArrowLeft"], t2._translateEmpty, { args: [-i2, 0], checker: arrowChecker }], [["ArrowRight", "mac+ArrowRight"], t2._translateEmpty, { args: [e2, 0], checker: arrowChecker }], [["ctrl+ArrowRight", "mac+shift+ArrowRight"], t2._translateEmpty, { args: [i2, 0], checker: arrowChecker }], [["ArrowUp", "mac+ArrowUp"], t2._translateEmpty, { args: [0, -e2], checker: arrowChecker }], [["ctrl+ArrowUp", "mac+shift+ArrowUp"], t2._translateEmpty, { args: [0, -i2], checker: arrowChecker }], [["ArrowDown", "mac+ArrowDown"], t2._translateEmpty, { args: [0, e2], checker: arrowChecker }], [["ctrl+ArrowDown", "mac+shift+ArrowDown"], t2._translateEmpty, { args: [0, i2], checker: arrowChecker }]]));
  }
  static _type = "freetext";
  static _editorType = g.FREETEXT;
  constructor(t2) {
    super({ ...t2, name: "freeTextEditor" });
    this.#tn = t2.color || _FreeTextEditor._defaultColor || AnnotationEditor._defaultLineColor;
    this.#pn = t2.fontSize || _FreeTextEditor._defaultFontSize;
  }
  static initialize(t2, e2) {
    AnnotationEditor.initialize(t2, e2);
    const i2 = getComputedStyle(document.documentElement);
    this._internalPadding = parseFloat(i2.getPropertyValue("--freetext-padding"));
  }
  static updateDefaultParams(t2, e2) {
    switch (t2) {
      case m.FREETEXT_SIZE:
        _FreeTextEditor._defaultFontSize = e2;
        break;
      case m.FREETEXT_COLOR:
        _FreeTextEditor._defaultColor = e2;
    }
  }
  updateParams(t2, e2) {
    switch (t2) {
      case m.FREETEXT_SIZE:
        this.#Ln(e2);
        break;
      case m.FREETEXT_COLOR:
        this.#On(e2);
    }
  }
  static get defaultPropertiesToUpdate() {
    return [[m.FREETEXT_SIZE, _FreeTextEditor._defaultFontSize], [m.FREETEXT_COLOR, _FreeTextEditor._defaultColor || AnnotationEditor._defaultLineColor]];
  }
  get propertiesToUpdate() {
    return [[m.FREETEXT_SIZE, this.#pn], [m.FREETEXT_COLOR, this.#tn]];
  }
  #Ln(t2) {
    const setFontsize = (t3) => {
      this.editorDiv.style.fontSize = `calc(${t3}px * var(--scale-factor))`;
      this.translate(0, -(t3 - this.#pn) * this.parentScale);
      this.#pn = t3;
      this.#Nn();
    }, e2 = this.#pn;
    this.addCommands({ cmd: setFontsize.bind(this, t2), undo: setFontsize.bind(this, e2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.FREETEXT_SIZE, overwriteIfSameType: true, keepUndo: true });
  }
  #On(t2) {
    const setColor = (t3) => {
      this.#tn = this.editorDiv.style.color = t3;
    }, e2 = this.#tn;
    this.addCommands({ cmd: setColor.bind(this, t2), undo: setColor.bind(this, e2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.FREETEXT_COLOR, overwriteIfSameType: true, keepUndo: true });
  }
  _translateEmpty(t2, e2) {
    this._uiManager.translateSelectedEditors(t2, e2, true);
  }
  getInitialTranslation() {
    const t2 = this.parentScale;
    return [-_FreeTextEditor._internalPadding * t2, -(_FreeTextEditor._internalPadding + this.#pn) * t2];
  }
  rebuild() {
    if (this.parent) {
      super.rebuild();
      null !== this.div && (this.isAttachedToDOM || this.parent.add(this));
    }
  }
  enableEditMode() {
    if (this.isInEditMode()) return;
    this.parent.setEditingState(false);
    this.parent.updateToolbar(g.FREETEXT);
    super.enableEditMode();
    this.overlayDiv.classList.remove("enabled");
    this.editorDiv.contentEditable = true;
    this._isDraggable = false;
    this.div.removeAttribute("aria-activedescendant");
    this.#Fn = new AbortController();
    const t2 = this._uiManager.combinedSignal(this.#Fn);
    this.editorDiv.addEventListener("keydown", this.editorDivKeydown.bind(this), { signal: t2 });
    this.editorDiv.addEventListener("focus", this.editorDivFocus.bind(this), { signal: t2 });
    this.editorDiv.addEventListener("blur", this.editorDivBlur.bind(this), { signal: t2 });
    this.editorDiv.addEventListener("input", this.editorDivInput.bind(this), { signal: t2 });
    this.editorDiv.addEventListener("paste", this.editorDivPaste.bind(this), { signal: t2 });
  }
  disableEditMode() {
    if (this.isInEditMode()) {
      this.parent.setEditingState(true);
      super.disableEditMode();
      this.overlayDiv.classList.add("enabled");
      this.editorDiv.contentEditable = false;
      this.div.setAttribute("aria-activedescendant", this.#In);
      this._isDraggable = true;
      this.#Fn?.abort();
      this.#Fn = null;
      this.div.focus({ preventScroll: true });
      this.isEditing = false;
      this.parent.div.classList.add("freetextEditing");
    }
  }
  focusin(t2) {
    if (this._focusEventsAllowed) {
      super.focusin(t2);
      t2.target !== this.editorDiv && this.editorDiv.focus();
    }
  }
  onceAdded(t2) {
    if (!this.width) {
      this.enableEditMode();
      t2 && this.editorDiv.focus();
      this._initialOptions?.isCentered && this.center();
      this._initialOptions = null;
    }
  }
  isEmpty() {
    return !this.editorDiv || "" === this.editorDiv.innerText.trim();
  }
  remove() {
    this.isEditing = false;
    if (this.parent) {
      this.parent.setEditingState(true);
      this.parent.div.classList.add("freetextEditing");
    }
    super.remove();
  }
  #Bn() {
    const t2 = [];
    this.editorDiv.normalize();
    let e2 = null;
    for (const i2 of this.editorDiv.childNodes) if (e2?.nodeType !== Node.TEXT_NODE || "BR" !== i2.nodeName) {
      t2.push(_FreeTextEditor.#Hn(i2));
      e2 = i2;
    }
    return t2.join("\n");
  }
  #Nn() {
    const [t2, e2] = this.parentDimensions;
    let i2;
    if (this.isAttachedToDOM) i2 = this.div.getBoundingClientRect();
    else {
      const { currentLayer: t3, div: e3 } = this, s2 = e3.style.display, n2 = e3.classList.contains("hidden");
      e3.classList.remove("hidden");
      e3.style.display = "hidden";
      t3.div.append(this.div);
      i2 = e3.getBoundingClientRect();
      e3.remove();
      e3.style.display = s2;
      e3.classList.toggle("hidden", n2);
    }
    if (this.rotation % 180 == this.parentRotation % 180) {
      this.width = i2.width / t2;
      this.height = i2.height / e2;
    } else {
      this.width = i2.height / t2;
      this.height = i2.width / e2;
    }
    this.fixAndSetPosition();
  }
  commit() {
    if (!this.isInEditMode()) return;
    super.commit();
    this.disableEditMode();
    const t2 = this.#Rn, e2 = this.#Rn = this.#Bn().trimEnd();
    if (t2 === e2) return;
    const setText = (t3) => {
      this.#Rn = t3;
      if (t3) {
        this.#zn();
        this._uiManager.rebuild(this);
        this.#Nn();
      } else this.remove();
    };
    this.addCommands({ cmd: () => {
      setText(e2);
    }, undo: () => {
      setText(t2);
    }, mustExec: false });
    this.#Nn();
  }
  shouldGetKeyboardEvents() {
    return this.isInEditMode();
  }
  enterInEditMode() {
    this.enableEditMode();
    this.editorDiv.focus();
  }
  dblclick(t2) {
    this.enterInEditMode();
  }
  keydown(t2) {
    if (t2.target === this.div && "Enter" === t2.key) {
      this.enterInEditMode();
      t2.preventDefault();
    }
  }
  editorDivKeydown(t2) {
    _FreeTextEditor._keyboardManager.exec(this, t2);
  }
  editorDivFocus(t2) {
    this.isEditing = true;
  }
  editorDivBlur(t2) {
    this.isEditing = false;
  }
  editorDivInput(t2) {
    this.parent.div.classList.toggle("freetextEditing", this.isEmpty());
  }
  disableEditing() {
    this.editorDiv.setAttribute("role", "comment");
    this.editorDiv.removeAttribute("aria-multiline");
  }
  enableEditing() {
    this.editorDiv.setAttribute("role", "textbox");
    this.editorDiv.setAttribute("aria-multiline", true);
  }
  render() {
    if (this.div) return this.div;
    let t2, e2;
    if (this.width) {
      t2 = this.x;
      e2 = this.y;
    }
    super.render();
    this.editorDiv = document.createElement("div");
    this.editorDiv.className = "internal";
    this.editorDiv.setAttribute("id", this.#In);
    this.editorDiv.setAttribute("data-l10n-id", "pdfjs-free-text2");
    this.editorDiv.setAttribute("data-l10n-attrs", "default-content");
    this.enableEditing();
    this.editorDiv.contentEditable = true;
    const { style: i2 } = this.editorDiv;
    i2.fontSize = `calc(${this.#pn}px * var(--scale-factor))`;
    i2.color = this.#tn;
    this.div.append(this.editorDiv);
    this.overlayDiv = document.createElement("div");
    this.overlayDiv.classList.add("overlay", "enabled");
    this.div.append(this.overlayDiv);
    bindEvents(this, this.div, ["dblclick", "keydown"]);
    if (this.width) {
      const [i3, s2] = this.parentDimensions;
      if (this.annotationElementId) {
        const { position: n2 } = this._initialData;
        let [a2, r2] = this.getInitialTranslation();
        [a2, r2] = this.pageTranslationToScreen(a2, r2);
        const [o2, l2] = this.pageDimensions, [h2, d2] = this.pageTranslation;
        let c2, u2;
        switch (this.rotation) {
          case 0:
            c2 = t2 + (n2[0] - h2) / o2;
            u2 = e2 + this.height - (n2[1] - d2) / l2;
            break;
          case 90:
            c2 = t2 + (n2[0] - h2) / o2;
            u2 = e2 - (n2[1] - d2) / l2;
            [a2, r2] = [r2, -a2];
            break;
          case 180:
            c2 = t2 - this.width + (n2[0] - h2) / o2;
            u2 = e2 - (n2[1] - d2) / l2;
            [a2, r2] = [-a2, -r2];
            break;
          case 270:
            c2 = t2 + (n2[0] - h2 - this.height * l2) / o2;
            u2 = e2 + (n2[1] - d2 - this.width * o2) / l2;
            [a2, r2] = [-r2, a2];
        }
        this.setAt(c2 * i3, u2 * s2, a2, r2);
      } else this.setAt(t2 * i3, e2 * s2, this.width * i3, this.height * s2);
      this.#zn();
      this._isDraggable = true;
      this.editorDiv.contentEditable = false;
    } else {
      this._isDraggable = false;
      this.editorDiv.contentEditable = true;
    }
    return this.div;
  }
  static #Hn(t2) {
    return (t2.nodeType === Node.TEXT_NODE ? t2.nodeValue : t2.innerText).replaceAll(zt, "");
  }
  editorDivPaste(t2) {
    const e2 = t2.clipboardData || window.clipboardData, { types: i2 } = e2;
    if (1 === i2.length && "text/plain" === i2[0]) return;
    t2.preventDefault();
    const s2 = _FreeTextEditor.#Un(e2.getData("text") || "").replaceAll(zt, "\n");
    if (!s2) return;
    const n2 = window.getSelection();
    if (!n2.rangeCount) return;
    this.editorDiv.normalize();
    n2.deleteFromDocument();
    const a2 = n2.getRangeAt(0);
    if (!s2.includes("\n")) {
      a2.insertNode(document.createTextNode(s2));
      this.editorDiv.normalize();
      n2.collapseToStart();
      return;
    }
    const { startContainer: r2, startOffset: o2 } = a2, l2 = [], h2 = [];
    if (r2.nodeType === Node.TEXT_NODE) {
      const t3 = r2.parentElement;
      h2.push(r2.nodeValue.slice(o2).replaceAll(zt, ""));
      if (t3 !== this.editorDiv) {
        let e3 = l2;
        for (const i3 of this.editorDiv.childNodes) i3 !== t3 ? e3.push(_FreeTextEditor.#Hn(i3)) : e3 = h2;
      }
      l2.push(r2.nodeValue.slice(0, o2).replaceAll(zt, ""));
    } else if (r2 === this.editorDiv) {
      let t3 = l2, e3 = 0;
      for (const i3 of this.editorDiv.childNodes) {
        e3++ === o2 && (t3 = h2);
        t3.push(_FreeTextEditor.#Hn(i3));
      }
    }
    this.#Rn = `${l2.join("\n")}${s2}${h2.join("\n")}`;
    this.#zn();
    const d2 = new Range();
    let c2 = l2.reduce(((t3, e3) => t3 + e3.length), 0);
    for (const { firstChild: t3 } of this.editorDiv.childNodes) if (t3.nodeType === Node.TEXT_NODE) {
      const e3 = t3.nodeValue.length;
      if (c2 <= e3) {
        d2.setStart(t3, c2);
        d2.setEnd(t3, c2);
        break;
      }
      c2 -= e3;
    }
    n2.removeAllRanges();
    n2.addRange(d2);
  }
  #zn() {
    this.editorDiv.replaceChildren();
    if (this.#Rn) for (const t2 of this.#Rn.split("\n")) {
      const e2 = document.createElement("div");
      e2.append(t2 ? document.createTextNode(t2) : document.createElement("br"));
      this.editorDiv.append(e2);
    }
  }
  #Gn() {
    return this.#Rn.replaceAll("\xA0", " ");
  }
  static #Un(t2) {
    return t2.replaceAll(" ", "\xA0");
  }
  get contentDiv() {
    return this.editorDiv;
  }
  static async deserialize(t2, e2, i2) {
    let s2 = null;
    if (t2 instanceof FreeTextAnnotationElement) {
      const { data: { defaultAppearanceData: { fontSize: e3, fontColor: i3 }, rect: n3, rotation: a2, id: r2, popupRef: o2 }, textContent: l2, textPosition: h2, parent: { page: { pageNumber: d2 } } } = t2;
      if (!l2 || 0 === l2.length) return null;
      s2 = t2 = { annotationType: g.FREETEXT, color: Array.from(i3), fontSize: e3, value: l2.join("\n"), position: h2, pageIndex: d2 - 1, rect: n3.slice(0), rotation: a2, id: r2, deleted: false, popupRef: o2 };
    }
    const n2 = await super.deserialize(t2, e2, i2);
    n2.#pn = t2.fontSize;
    n2.#tn = Util.makeHexColor(...t2.color);
    n2.#Rn = _FreeTextEditor.#Un(t2.value);
    n2.annotationElementId = t2.id || null;
    n2._initialData = s2;
    return n2;
  }
  serialize(t2 = false) {
    if (this.isEmpty()) return null;
    if (this.deleted) return this.serializeDeleted();
    const e2 = _FreeTextEditor._internalPadding * this.parentScale, i2 = this.getRect(e2, e2), s2 = AnnotationEditor._colorManager.convert(this.isAttachedToDOM ? getComputedStyle(this.editorDiv).color : this.#tn), n2 = { annotationType: g.FREETEXT, color: s2, fontSize: this.#pn, value: this.#Gn(), pageIndex: this.pageIndex, rect: i2, rotation: this.rotation, structTreeParentId: this._structTreeParentId };
    if (t2) return n2;
    if (this.annotationElementId && !this.#$n(n2)) return null;
    n2.id = this.annotationElementId;
    return n2;
  }
  #$n(t2) {
    const { value: e2, fontSize: i2, color: s2, pageIndex: n2 } = this._initialData;
    return this._hasBeenMoved || t2.value !== e2 || t2.fontSize !== i2 || t2.color.some(((t3, e3) => t3 !== s2[e3])) || t2.pageIndex !== n2;
  }
  renderAnnotationElement(t2) {
    const e2 = super.renderAnnotationElement(t2);
    if (this.deleted) return e2;
    const { style: i2 } = e2;
    i2.fontSize = `calc(${this.#pn}px * var(--scale-factor))`;
    i2.color = this.#tn;
    e2.replaceChildren();
    for (const t3 of this.#Rn.split("\n")) {
      const i3 = document.createElement("div");
      i3.append(t3 ? document.createTextNode(t3) : document.createElement("br"));
      e2.append(i3);
    }
    const s2 = _FreeTextEditor._internalPadding * this.parentScale;
    t2.updateEdited({ rect: this.getRect(s2, s2), popupContent: this.#Rn });
    return e2;
  }
  resetAnnotationElement(t2) {
    super.resetAnnotationElement(t2);
    t2.resetEdited();
  }
};
var Outline = class {
  static PRECISION = 1e-4;
  toSVGPath() {
    unreachable("Abstract method `toSVGPath` must be implemented.");
  }
  get box() {
    unreachable("Abstract getter `box` must be implemented.");
  }
  serialize(t2, e2) {
    unreachable("Abstract method `serialize` must be implemented.");
  }
  static _rescale(t2, e2, i2, s2, n2, a2) {
    a2 ||= new Float32Array(t2.length);
    for (let r2 = 0, o2 = t2.length; r2 < o2; r2 += 2) {
      a2[r2] = e2 + t2[r2] * s2;
      a2[r2 + 1] = i2 + t2[r2 + 1] * n2;
    }
    return a2;
  }
  static _rescaleAndSwap(t2, e2, i2, s2, n2, a2) {
    a2 ||= new Float32Array(t2.length);
    for (let r2 = 0, o2 = t2.length; r2 < o2; r2 += 2) {
      a2[r2] = e2 + t2[r2 + 1] * s2;
      a2[r2 + 1] = i2 + t2[r2] * n2;
    }
    return a2;
  }
  static _translate(t2, e2, i2, s2) {
    s2 ||= new Float32Array(t2.length);
    for (let n2 = 0, a2 = t2.length; n2 < a2; n2 += 2) {
      s2[n2] = e2 + t2[n2];
      s2[n2 + 1] = i2 + t2[n2 + 1];
    }
    return s2;
  }
  static svgRound(t2) {
    return Math.round(1e4 * t2);
  }
  static _normalizePoint(t2, e2, i2, s2, n2) {
    switch (n2) {
      case 90:
        return [1 - e2 / i2, t2 / s2];
      case 180:
        return [1 - t2 / i2, 1 - e2 / s2];
      case 270:
        return [e2 / i2, 1 - t2 / s2];
      default:
        return [t2 / i2, e2 / s2];
    }
  }
  static _normalizePagePoint(t2, e2, i2) {
    switch (i2) {
      case 90:
        return [1 - e2, t2];
      case 180:
        return [1 - t2, 1 - e2];
      case 270:
        return [e2, 1 - t2];
      default:
        return [t2, e2];
    }
  }
  static createBezierPoints(t2, e2, i2, s2, n2, a2) {
    return [(t2 + 5 * i2) / 6, (e2 + 5 * s2) / 6, (5 * i2 + n2) / 6, (5 * s2 + a2) / 6, (i2 + n2) / 2, (s2 + a2) / 2];
  }
};
var FreeDrawOutliner = class _FreeDrawOutliner {
  #Vn;
  #jn = [];
  #Wn;
  #qn;
  #Xn = [];
  #Kn = new Float32Array(18);
  #Yn;
  #Qn;
  #Jn;
  #Zn;
  #ta;
  #ea;
  #ia = [];
  static #sa = 8;
  static #na = 2;
  static #aa = _FreeDrawOutliner.#sa + _FreeDrawOutliner.#na;
  constructor({ x: t2, y: e2 }, i2, s2, n2, a2, r2 = 0) {
    this.#Vn = i2;
    this.#ea = n2 * s2;
    this.#qn = a2;
    this.#Kn.set([NaN, NaN, NaN, NaN, t2, e2], 6);
    this.#Wn = r2;
    this.#Zn = _FreeDrawOutliner.#sa * s2;
    this.#Jn = _FreeDrawOutliner.#aa * s2;
    this.#ta = s2;
    this.#ia.push(t2, e2);
  }
  isEmpty() {
    return isNaN(this.#Kn[8]);
  }
  #ra() {
    const t2 = this.#Kn.subarray(4, 6), e2 = this.#Kn.subarray(16, 18), [i2, s2, n2, a2] = this.#Vn;
    return [(this.#Yn + (t2[0] - e2[0]) / 2 - i2) / n2, (this.#Qn + (t2[1] - e2[1]) / 2 - s2) / a2, (this.#Yn + (e2[0] - t2[0]) / 2 - i2) / n2, (this.#Qn + (e2[1] - t2[1]) / 2 - s2) / a2];
  }
  add({ x: t2, y: e2 }) {
    this.#Yn = t2;
    this.#Qn = e2;
    const [i2, s2, n2, a2] = this.#Vn;
    let [r2, o2, l2, h2] = this.#Kn.subarray(8, 12);
    const d2 = t2 - l2, c2 = e2 - h2, u2 = Math.hypot(d2, c2);
    if (u2 < this.#Jn) return false;
    const p2 = u2 - this.#Zn, g2 = p2 / u2, m2 = g2 * d2, f2 = g2 * c2;
    let b2 = r2, A2 = o2;
    r2 = l2;
    o2 = h2;
    l2 += m2;
    h2 += f2;
    this.#ia?.push(t2, e2);
    const w2 = m2 / p2, v2 = -f2 / p2 * this.#ea, y2 = w2 * this.#ea;
    this.#Kn.set(this.#Kn.subarray(2, 8), 0);
    this.#Kn.set([l2 + v2, h2 + y2], 4);
    this.#Kn.set(this.#Kn.subarray(14, 18), 12);
    this.#Kn.set([l2 - v2, h2 - y2], 16);
    if (isNaN(this.#Kn[6])) {
      if (0 === this.#Xn.length) {
        this.#Kn.set([r2 + v2, o2 + y2], 2);
        this.#Xn.push(NaN, NaN, NaN, NaN, (r2 + v2 - i2) / n2, (o2 + y2 - s2) / a2);
        this.#Kn.set([r2 - v2, o2 - y2], 14);
        this.#jn.push(NaN, NaN, NaN, NaN, (r2 - v2 - i2) / n2, (o2 - y2 - s2) / a2);
      }
      this.#Kn.set([b2, A2, r2, o2, l2, h2], 6);
      return !this.isEmpty();
    }
    this.#Kn.set([b2, A2, r2, o2, l2, h2], 6);
    if (Math.abs(Math.atan2(A2 - o2, b2 - r2) - Math.atan2(f2, m2)) < Math.PI / 2) {
      [r2, o2, l2, h2] = this.#Kn.subarray(2, 6);
      this.#Xn.push(NaN, NaN, NaN, NaN, ((r2 + l2) / 2 - i2) / n2, ((o2 + h2) / 2 - s2) / a2);
      [r2, o2, b2, A2] = this.#Kn.subarray(14, 18);
      this.#jn.push(NaN, NaN, NaN, NaN, ((b2 + r2) / 2 - i2) / n2, ((A2 + o2) / 2 - s2) / a2);
      return true;
    }
    [b2, A2, r2, o2, l2, h2] = this.#Kn.subarray(0, 6);
    this.#Xn.push(((b2 + 5 * r2) / 6 - i2) / n2, ((A2 + 5 * o2) / 6 - s2) / a2, ((5 * r2 + l2) / 6 - i2) / n2, ((5 * o2 + h2) / 6 - s2) / a2, ((r2 + l2) / 2 - i2) / n2, ((o2 + h2) / 2 - s2) / a2);
    [l2, h2, r2, o2, b2, A2] = this.#Kn.subarray(12, 18);
    this.#jn.push(((b2 + 5 * r2) / 6 - i2) / n2, ((A2 + 5 * o2) / 6 - s2) / a2, ((5 * r2 + l2) / 6 - i2) / n2, ((5 * o2 + h2) / 6 - s2) / a2, ((r2 + l2) / 2 - i2) / n2, ((o2 + h2) / 2 - s2) / a2);
    return true;
  }
  toSVGPath() {
    if (this.isEmpty()) return "";
    const t2 = this.#Xn, e2 = this.#jn;
    if (isNaN(this.#Kn[6]) && !this.isEmpty()) return this.#oa();
    const i2 = [];
    i2.push(`M${t2[4]} ${t2[5]}`);
    for (let e3 = 6; e3 < t2.length; e3 += 6) isNaN(t2[e3]) ? i2.push(`L${t2[e3 + 4]} ${t2[e3 + 5]}`) : i2.push(`C${t2[e3]} ${t2[e3 + 1]} ${t2[e3 + 2]} ${t2[e3 + 3]} ${t2[e3 + 4]} ${t2[e3 + 5]}`);
    this.#la(i2);
    for (let t3 = e2.length - 6; t3 >= 6; t3 -= 6) isNaN(e2[t3]) ? i2.push(`L${e2[t3 + 4]} ${e2[t3 + 5]}`) : i2.push(`C${e2[t3]} ${e2[t3 + 1]} ${e2[t3 + 2]} ${e2[t3 + 3]} ${e2[t3 + 4]} ${e2[t3 + 5]}`);
    this.#ha(i2);
    return i2.join(" ");
  }
  #oa() {
    const [t2, e2, i2, s2] = this.#Vn, [n2, a2, r2, o2] = this.#ra();
    return `M${(this.#Kn[2] - t2) / i2} ${(this.#Kn[3] - e2) / s2} L${(this.#Kn[4] - t2) / i2} ${(this.#Kn[5] - e2) / s2} L${n2} ${a2} L${r2} ${o2} L${(this.#Kn[16] - t2) / i2} ${(this.#Kn[17] - e2) / s2} L${(this.#Kn[14] - t2) / i2} ${(this.#Kn[15] - e2) / s2} Z`;
  }
  #ha(t2) {
    const e2 = this.#jn;
    t2.push(`L${e2[4]} ${e2[5]} Z`);
  }
  #la(t2) {
    const [e2, i2, s2, n2] = this.#Vn, a2 = this.#Kn.subarray(4, 6), r2 = this.#Kn.subarray(16, 18), [o2, l2, h2, d2] = this.#ra();
    t2.push(`L${(a2[0] - e2) / s2} ${(a2[1] - i2) / n2} L${o2} ${l2} L${h2} ${d2} L${(r2[0] - e2) / s2} ${(r2[1] - i2) / n2}`);
  }
  newFreeDrawOutline(t2, e2, i2, s2, n2, a2) {
    return new FreeDrawOutline(t2, e2, i2, s2, n2, a2);
  }
  getOutlines() {
    const t2 = this.#Xn, e2 = this.#jn, i2 = this.#Kn, [s2, n2, a2, r2] = this.#Vn, o2 = new Float32Array((this.#ia?.length ?? 0) + 2);
    for (let t3 = 0, e3 = o2.length - 2; t3 < e3; t3 += 2) {
      o2[t3] = (this.#ia[t3] - s2) / a2;
      o2[t3 + 1] = (this.#ia[t3 + 1] - n2) / r2;
    }
    o2[o2.length - 2] = (this.#Yn - s2) / a2;
    o2[o2.length - 1] = (this.#Qn - n2) / r2;
    if (isNaN(i2[6]) && !this.isEmpty()) return this.#da(o2);
    const l2 = new Float32Array(this.#Xn.length + 24 + this.#jn.length);
    let h2 = t2.length;
    for (let e3 = 0; e3 < h2; e3 += 2) if (isNaN(t2[e3])) l2[e3] = l2[e3 + 1] = NaN;
    else {
      l2[e3] = t2[e3];
      l2[e3 + 1] = t2[e3 + 1];
    }
    h2 = this.#ca(l2, h2);
    for (let t3 = e2.length - 6; t3 >= 6; t3 -= 6) for (let i3 = 0; i3 < 6; i3 += 2) if (isNaN(e2[t3 + i3])) {
      l2[h2] = l2[h2 + 1] = NaN;
      h2 += 2;
    } else {
      l2[h2] = e2[t3 + i3];
      l2[h2 + 1] = e2[t3 + i3 + 1];
      h2 += 2;
    }
    this.#ua(l2, h2);
    return this.newFreeDrawOutline(l2, o2, this.#Vn, this.#ta, this.#Wn, this.#qn);
  }
  #da(t2) {
    const e2 = this.#Kn, [i2, s2, n2, a2] = this.#Vn, [r2, o2, l2, h2] = this.#ra(), d2 = new Float32Array(36);
    d2.set([NaN, NaN, NaN, NaN, (e2[2] - i2) / n2, (e2[3] - s2) / a2, NaN, NaN, NaN, NaN, (e2[4] - i2) / n2, (e2[5] - s2) / a2, NaN, NaN, NaN, NaN, r2, o2, NaN, NaN, NaN, NaN, l2, h2, NaN, NaN, NaN, NaN, (e2[16] - i2) / n2, (e2[17] - s2) / a2, NaN, NaN, NaN, NaN, (e2[14] - i2) / n2, (e2[15] - s2) / a2], 0);
    return this.newFreeDrawOutline(d2, t2, this.#Vn, this.#ta, this.#Wn, this.#qn);
  }
  #ua(t2, e2) {
    const i2 = this.#jn;
    t2.set([NaN, NaN, NaN, NaN, i2[4], i2[5]], e2);
    return e2 + 6;
  }
  #ca(t2, e2) {
    const i2 = this.#Kn.subarray(4, 6), s2 = this.#Kn.subarray(16, 18), [n2, a2, r2, o2] = this.#Vn, [l2, h2, d2, c2] = this.#ra();
    t2.set([NaN, NaN, NaN, NaN, (i2[0] - n2) / r2, (i2[1] - a2) / o2, NaN, NaN, NaN, NaN, l2, h2, NaN, NaN, NaN, NaN, d2, c2, NaN, NaN, NaN, NaN, (s2[0] - n2) / r2, (s2[1] - a2) / o2], e2);
    return e2 + 24;
  }
};
var FreeDrawOutline = class extends Outline {
  #Vn;
  #pa = new Float32Array(4);
  #Wn;
  #qn;
  #ia;
  #ta;
  #ga;
  constructor(t2, e2, i2, s2, n2, a2) {
    super();
    this.#ga = t2;
    this.#ia = e2;
    this.#Vn = i2;
    this.#ta = s2;
    this.#Wn = n2;
    this.#qn = a2;
    this.lastPoint = [NaN, NaN];
    this.#ma(a2);
    const [r2, o2, l2, h2] = this.#pa;
    for (let e3 = 0, i3 = t2.length; e3 < i3; e3 += 2) {
      t2[e3] = (t2[e3] - r2) / l2;
      t2[e3 + 1] = (t2[e3 + 1] - o2) / h2;
    }
    for (let t3 = 0, i3 = e2.length; t3 < i3; t3 += 2) {
      e2[t3] = (e2[t3] - r2) / l2;
      e2[t3 + 1] = (e2[t3 + 1] - o2) / h2;
    }
  }
  toSVGPath() {
    const t2 = [`M${this.#ga[4]} ${this.#ga[5]}`];
    for (let e2 = 6, i2 = this.#ga.length; e2 < i2; e2 += 6) isNaN(this.#ga[e2]) ? t2.push(`L${this.#ga[e2 + 4]} ${this.#ga[e2 + 5]}`) : t2.push(`C${this.#ga[e2]} ${this.#ga[e2 + 1]} ${this.#ga[e2 + 2]} ${this.#ga[e2 + 3]} ${this.#ga[e2 + 4]} ${this.#ga[e2 + 5]}`);
    t2.push("Z");
    return t2.join(" ");
  }
  serialize([t2, e2, i2, s2], n2) {
    const a2 = i2 - t2, r2 = s2 - e2;
    let o2, l2;
    switch (n2) {
      case 0:
        o2 = Outline._rescale(this.#ga, t2, s2, a2, -r2);
        l2 = Outline._rescale(this.#ia, t2, s2, a2, -r2);
        break;
      case 90:
        o2 = Outline._rescaleAndSwap(this.#ga, t2, e2, a2, r2);
        l2 = Outline._rescaleAndSwap(this.#ia, t2, e2, a2, r2);
        break;
      case 180:
        o2 = Outline._rescale(this.#ga, i2, e2, -a2, r2);
        l2 = Outline._rescale(this.#ia, i2, e2, -a2, r2);
        break;
      case 270:
        o2 = Outline._rescaleAndSwap(this.#ga, i2, s2, -a2, -r2);
        l2 = Outline._rescaleAndSwap(this.#ia, i2, s2, -a2, -r2);
    }
    return { outline: Array.from(o2), points: [Array.from(l2)] };
  }
  #ma(t2) {
    const e2 = this.#ga;
    let i2 = e2[4], s2 = e2[5], n2 = i2, a2 = s2, r2 = i2, o2 = s2, l2 = i2, h2 = s2;
    const d2 = t2 ? Math.max : Math.min;
    for (let t3 = 6, c3 = e2.length; t3 < c3; t3 += 6) {
      if (isNaN(e2[t3])) {
        n2 = Math.min(n2, e2[t3 + 4]);
        a2 = Math.min(a2, e2[t3 + 5]);
        r2 = Math.max(r2, e2[t3 + 4]);
        o2 = Math.max(o2, e2[t3 + 5]);
        if (h2 < e2[t3 + 5]) {
          l2 = e2[t3 + 4];
          h2 = e2[t3 + 5];
        } else h2 === e2[t3 + 5] && (l2 = d2(l2, e2[t3 + 4]));
      } else {
        const c4 = Util.bezierBoundingBox(i2, s2, ...e2.slice(t3, t3 + 6));
        n2 = Math.min(n2, c4[0]);
        a2 = Math.min(a2, c4[1]);
        r2 = Math.max(r2, c4[2]);
        o2 = Math.max(o2, c4[3]);
        if (h2 < c4[3]) {
          l2 = c4[2];
          h2 = c4[3];
        } else h2 === c4[3] && (l2 = d2(l2, c4[2]));
      }
      i2 = e2[t3 + 4];
      s2 = e2[t3 + 5];
    }
    const c2 = this.#pa;
    c2[0] = n2 - this.#Wn;
    c2[1] = a2 - this.#Wn;
    c2[2] = r2 - n2 + 2 * this.#Wn;
    c2[3] = o2 - a2 + 2 * this.#Wn;
    this.lastPoint = [l2, h2];
  }
  get box() {
    return this.#pa;
  }
  newOutliner(t2, e2, i2, s2, n2, a2 = 0) {
    return new FreeDrawOutliner(t2, e2, i2, s2, n2, a2);
  }
  getNewOutline(t2, e2) {
    const [i2, s2, n2, a2] = this.#pa, [r2, o2, l2, h2] = this.#Vn, d2 = n2 * l2, c2 = a2 * h2, u2 = i2 * l2 + r2, p2 = s2 * h2 + o2, g2 = this.newOutliner({ x: this.#ia[0] * d2 + u2, y: this.#ia[1] * c2 + p2 }, this.#Vn, this.#ta, t2, this.#qn, e2 ?? this.#Wn);
    for (let t3 = 2; t3 < this.#ia.length; t3 += 2) g2.add({ x: this.#ia[t3] * d2 + u2, y: this.#ia[t3 + 1] * c2 + p2 });
    return g2.getOutlines();
  }
};
var HighlightOutliner = class {
  #Vn;
  #fa;
  #ba = [];
  #Aa = [];
  constructor(t2, e2 = 0, i2 = 0, s2 = true) {
    let n2 = 1 / 0, a2 = -1 / 0, r2 = 1 / 0, o2 = -1 / 0;
    const l2 = 10 ** -4;
    for (const { x: i3, y: s3, width: h3, height: d3 } of t2) {
      const t3 = Math.floor((i3 - e2) / l2) * l2, c3 = Math.ceil((i3 + h3 + e2) / l2) * l2, u3 = Math.floor((s3 - e2) / l2) * l2, p3 = Math.ceil((s3 + d3 + e2) / l2) * l2, g3 = [t3, u3, p3, true], m2 = [c3, u3, p3, false];
      this.#ba.push(g3, m2);
      n2 = Math.min(n2, t3);
      a2 = Math.max(a2, c3);
      r2 = Math.min(r2, u3);
      o2 = Math.max(o2, p3);
    }
    const h2 = a2 - n2 + 2 * i2, d2 = o2 - r2 + 2 * i2, c2 = n2 - i2, u2 = r2 - i2, p2 = this.#ba.at(s2 ? -1 : -2), g2 = [p2[0], p2[2]];
    for (const t3 of this.#ba) {
      const [e3, i3, s3] = t3;
      t3[0] = (e3 - c2) / h2;
      t3[1] = (i3 - u2) / d2;
      t3[2] = (s3 - u2) / d2;
    }
    this.#Vn = new Float32Array([c2, u2, h2, d2]);
    this.#fa = g2;
  }
  getOutlines() {
    this.#ba.sort(((t3, e2) => t3[0] - e2[0] || t3[1] - e2[1] || t3[2] - e2[2]));
    const t2 = [];
    for (const e2 of this.#ba) if (e2[3]) {
      t2.push(...this.#wa(e2));
      this.#va(e2);
    } else {
      this.#ya(e2);
      t2.push(...this.#wa(e2));
    }
    return this.#xa(t2);
  }
  #xa(t2) {
    const e2 = [], i2 = /* @__PURE__ */ new Set();
    for (const i3 of t2) {
      const [t3, s3, n3] = i3;
      e2.push([t3, s3, i3], [t3, n3, i3]);
    }
    e2.sort(((t3, e3) => t3[1] - e3[1] || t3[0] - e3[0]));
    for (let t3 = 0, s3 = e2.length; t3 < s3; t3 += 2) {
      const s4 = e2[t3][2], n3 = e2[t3 + 1][2];
      s4.push(n3);
      n3.push(s4);
      i2.add(s4);
      i2.add(n3);
    }
    const s2 = [];
    let n2;
    for (; i2.size > 0; ) {
      const t3 = i2.values().next().value;
      let [e3, a2, r2, o2, l2] = t3;
      i2.delete(t3);
      let h2 = e3, d2 = a2;
      n2 = [e3, r2];
      s2.push(n2);
      for (; ; ) {
        let t4;
        if (i2.has(o2)) t4 = o2;
        else {
          if (!i2.has(l2)) break;
          t4 = l2;
        }
        i2.delete(t4);
        [e3, a2, r2, o2, l2] = t4;
        if (h2 !== e3) {
          n2.push(h2, d2, e3, d2 === a2 ? a2 : r2);
          h2 = e3;
        }
        d2 = d2 === a2 ? r2 : a2;
      }
      n2.push(h2, d2);
    }
    return new HighlightOutline(s2, this.#Vn, this.#fa);
  }
  #_a(t2) {
    const e2 = this.#Aa;
    let i2 = 0, s2 = e2.length - 1;
    for (; i2 <= s2; ) {
      const n2 = i2 + s2 >> 1, a2 = e2[n2][0];
      if (a2 === t2) return n2;
      a2 < t2 ? i2 = n2 + 1 : s2 = n2 - 1;
    }
    return s2 + 1;
  }
  #va([, t2, e2]) {
    const i2 = this.#_a(t2);
    this.#Aa.splice(i2, 0, [t2, e2]);
  }
  #ya([, t2, e2]) {
    const i2 = this.#_a(t2);
    for (let s2 = i2; s2 < this.#Aa.length; s2++) {
      const [i3, n2] = this.#Aa[s2];
      if (i3 !== t2) break;
      if (i3 === t2 && n2 === e2) {
        this.#Aa.splice(s2, 1);
        return;
      }
    }
    for (let s2 = i2 - 1; s2 >= 0; s2--) {
      const [i3, n2] = this.#Aa[s2];
      if (i3 !== t2) break;
      if (i3 === t2 && n2 === e2) {
        this.#Aa.splice(s2, 1);
        return;
      }
    }
  }
  #wa(t2) {
    const [e2, i2, s2] = t2, n2 = [[e2, i2, s2]], a2 = this.#_a(s2);
    for (let t3 = 0; t3 < a2; t3++) {
      const [i3, s3] = this.#Aa[t3];
      for (let t4 = 0, a3 = n2.length; t4 < a3; t4++) {
        const [, r2, o2] = n2[t4];
        if (!(s3 <= r2 || o2 <= i3)) if (r2 >= i3) if (o2 > s3) n2[t4][1] = s3;
        else {
          if (1 === a3) return [];
          n2.splice(t4, 1);
          t4--;
          a3--;
        }
        else {
          n2[t4][2] = i3;
          o2 > s3 && n2.push([e2, s3, o2]);
        }
      }
    }
    return n2;
  }
};
var HighlightOutline = class extends Outline {
  #Vn;
  #Ea;
  constructor(t2, e2, i2) {
    super();
    this.#Ea = t2;
    this.#Vn = e2;
    this.lastPoint = i2;
  }
  toSVGPath() {
    const t2 = [];
    for (const e2 of this.#Ea) {
      let [i2, s2] = e2;
      t2.push(`M${i2} ${s2}`);
      for (let n2 = 2; n2 < e2.length; n2 += 2) {
        const a2 = e2[n2], r2 = e2[n2 + 1];
        if (a2 === i2) {
          t2.push(`V${r2}`);
          s2 = r2;
        } else if (r2 === s2) {
          t2.push(`H${a2}`);
          i2 = a2;
        }
      }
      t2.push("Z");
    }
    return t2.join(" ");
  }
  serialize([t2, e2, i2, s2], n2) {
    const a2 = [], r2 = i2 - t2, o2 = s2 - e2;
    for (const e3 of this.#Ea) {
      const i3 = new Array(e3.length);
      for (let n3 = 0; n3 < e3.length; n3 += 2) {
        i3[n3] = t2 + e3[n3] * r2;
        i3[n3 + 1] = s2 - e3[n3 + 1] * o2;
      }
      a2.push(i3);
    }
    return a2;
  }
  get box() {
    return this.#Vn;
  }
  get classNamesForOutlining() {
    return ["highlightOutline"];
  }
};
var FreeHighlightOutliner = class extends FreeDrawOutliner {
  newFreeDrawOutline(t2, e2, i2, s2, n2, a2) {
    return new FreeHighlightOutline(t2, e2, i2, s2, n2, a2);
  }
};
var FreeHighlightOutline = class extends FreeDrawOutline {
  newOutliner(t2, e2, i2, s2, n2, a2 = 0) {
    return new FreeHighlightOutliner(t2, e2, i2, s2, n2, a2);
  }
};
var ColorPicker = class _ColorPicker {
  #Sa = null;
  #Ca = null;
  #Ta;
  #Ma = null;
  #Pa = false;
  #Da = false;
  #a = null;
  #ka;
  #Ra = null;
  #m = null;
  #Ia;
  static #Fa = null;
  static get _keyboardManager() {
    return shadow(this, "_keyboardManager", new KeyboardManager([[["Escape", "mac+Escape"], _ColorPicker.prototype._hideDropdownFromKeyboard], [[" ", "mac+ "], _ColorPicker.prototype._colorSelectFromKeyboard], [["ArrowDown", "ArrowRight", "mac+ArrowDown", "mac+ArrowRight"], _ColorPicker.prototype._moveToNext], [["ArrowUp", "ArrowLeft", "mac+ArrowUp", "mac+ArrowLeft"], _ColorPicker.prototype._moveToPrevious], [["Home", "mac+Home"], _ColorPicker.prototype._moveToBeginning], [["End", "mac+End"], _ColorPicker.prototype._moveToEnd]]));
  }
  constructor({ editor: t2 = null, uiManager: e2 = null }) {
    if (t2) {
      this.#Da = false;
      this.#Ia = m.HIGHLIGHT_COLOR;
      this.#a = t2;
    } else {
      this.#Da = true;
      this.#Ia = m.HIGHLIGHT_DEFAULT_COLOR;
    }
    this.#m = t2?._uiManager || e2;
    this.#ka = this.#m._eventBus;
    this.#Ta = t2?.color || this.#m?.highlightColors.values().next().value || "#FFFF98";
    _ColorPicker.#Fa ||= Object.freeze({ blue: "pdfjs-editor-colorpicker-blue", green: "pdfjs-editor-colorpicker-green", pink: "pdfjs-editor-colorpicker-pink", red: "pdfjs-editor-colorpicker-red", yellow: "pdfjs-editor-colorpicker-yellow" });
  }
  renderButton() {
    const t2 = this.#Sa = document.createElement("button");
    t2.className = "colorPicker";
    t2.tabIndex = "0";
    t2.setAttribute("data-l10n-id", "pdfjs-editor-colorpicker-button");
    t2.setAttribute("aria-haspopup", true);
    const e2 = this.#m._signal;
    t2.addEventListener("click", this.#La.bind(this), { signal: e2 });
    t2.addEventListener("keydown", this.#qs.bind(this), { signal: e2 });
    const i2 = this.#Ca = document.createElement("span");
    i2.className = "swatch";
    i2.setAttribute("aria-hidden", true);
    i2.style.backgroundColor = this.#Ta;
    t2.append(i2);
    return t2;
  }
  renderMainDropdown() {
    const t2 = this.#Ma = this.#Oa();
    t2.setAttribute("aria-orientation", "horizontal");
    t2.setAttribute("aria-labelledby", "highlightColorPickerLabel");
    return t2;
  }
  #Oa() {
    const t2 = document.createElement("div"), e2 = this.#m._signal;
    t2.addEventListener("contextmenu", noContextMenu, { signal: e2 });
    t2.className = "dropdown";
    t2.role = "listbox";
    t2.setAttribute("aria-multiselectable", false);
    t2.setAttribute("aria-orientation", "vertical");
    t2.setAttribute("data-l10n-id", "pdfjs-editor-colorpicker-dropdown");
    for (const [i2, s2] of this.#m.highlightColors) {
      const n2 = document.createElement("button");
      n2.tabIndex = "0";
      n2.role = "option";
      n2.setAttribute("data-color", s2);
      n2.title = i2;
      n2.setAttribute("data-l10n-id", _ColorPicker.#Fa[i2]);
      const a2 = document.createElement("span");
      n2.append(a2);
      a2.className = "swatch";
      a2.style.backgroundColor = s2;
      n2.setAttribute("aria-selected", s2 === this.#Ta);
      n2.addEventListener("click", this.#Na.bind(this, s2), { signal: e2 });
      t2.append(n2);
    }
    t2.addEventListener("keydown", this.#qs.bind(this), { signal: e2 });
    return t2;
  }
  #Na(t2, e2) {
    e2.stopPropagation();
    this.#ka.dispatch("switchannotationeditorparams", { source: this, type: this.#Ia, value: t2 });
  }
  _colorSelectFromKeyboard(t2) {
    if (t2.target === this.#Sa) {
      this.#La(t2);
      return;
    }
    const e2 = t2.target.getAttribute("data-color");
    e2 && this.#Na(e2, t2);
  }
  _moveToNext(t2) {
    this.#Ba ? t2.target !== this.#Sa ? t2.target.nextSibling?.focus() : this.#Ma.firstChild?.focus() : this.#La(t2);
  }
  _moveToPrevious(t2) {
    if (t2.target !== this.#Ma?.firstChild && t2.target !== this.#Sa) {
      this.#Ba || this.#La(t2);
      t2.target.previousSibling?.focus();
    } else this.#Ba && this._hideDropdownFromKeyboard();
  }
  _moveToBeginning(t2) {
    this.#Ba ? this.#Ma.firstChild?.focus() : this.#La(t2);
  }
  _moveToEnd(t2) {
    this.#Ba ? this.#Ma.lastChild?.focus() : this.#La(t2);
  }
  #qs(t2) {
    _ColorPicker._keyboardManager.exec(this, t2);
  }
  #La(t2) {
    if (this.#Ba) {
      this.hideDropdown();
      return;
    }
    this.#Pa = 0 === t2.detail;
    if (!this.#Ra) {
      this.#Ra = new AbortController();
      window.addEventListener("pointerdown", this.#h.bind(this), { signal: this.#m.combinedSignal(this.#Ra) });
    }
    if (this.#Ma) {
      this.#Ma.classList.remove("hidden");
      return;
    }
    const e2 = this.#Ma = this.#Oa();
    this.#Sa.append(e2);
  }
  #h(t2) {
    this.#Ma?.contains(t2.target) || this.hideDropdown();
  }
  hideDropdown() {
    this.#Ma?.classList.add("hidden");
    this.#Ra?.abort();
    this.#Ra = null;
  }
  get #Ba() {
    return this.#Ma && !this.#Ma.classList.contains("hidden");
  }
  _hideDropdownFromKeyboard() {
    if (!this.#Da) if (this.#Ba) {
      this.hideDropdown();
      this.#Sa.focus({ preventScroll: true, focusVisible: this.#Pa });
    } else this.#a?.unselect();
  }
  updateColor(t2) {
    this.#Ca && (this.#Ca.style.backgroundColor = t2);
    if (!this.#Ma) return;
    const e2 = this.#m.highlightColors.values();
    for (const i2 of this.#Ma.children) i2.setAttribute("aria-selected", e2.next().value === t2);
  }
  destroy() {
    this.#Sa?.remove();
    this.#Sa = null;
    this.#Ca = null;
    this.#Ma?.remove();
    this.#Ma = null;
  }
};
var HighlightEditor = class _HighlightEditor extends AnnotationEditor {
  #Ha = null;
  #za = 0;
  #Ua;
  #Ga = null;
  #n = null;
  #$a = null;
  #Va = null;
  #ja = 0;
  #Wa = null;
  #qa = null;
  #w = null;
  #Xa = false;
  #fa = null;
  #Ka;
  #Ya = null;
  #Qa = "";
  #ea;
  #Ja = "";
  static _defaultColor = null;
  static _defaultOpacity = 1;
  static _defaultThickness = 12;
  static _type = "highlight";
  static _editorType = g.HIGHLIGHT;
  static _freeHighlightId = -1;
  static _freeHighlight = null;
  static _freeHighlightClipId = "";
  static get _keyboardManager() {
    const t2 = _HighlightEditor.prototype;
    return shadow(this, "_keyboardManager", new KeyboardManager([[["ArrowLeft", "mac+ArrowLeft"], t2._moveCaret, { args: [0] }], [["ArrowRight", "mac+ArrowRight"], t2._moveCaret, { args: [1] }], [["ArrowUp", "mac+ArrowUp"], t2._moveCaret, { args: [2] }], [["ArrowDown", "mac+ArrowDown"], t2._moveCaret, { args: [3] }]]));
  }
  constructor(t2) {
    super({ ...t2, name: "highlightEditor" });
    this.color = t2.color || _HighlightEditor._defaultColor;
    this.#ea = t2.thickness || _HighlightEditor._defaultThickness;
    this.#Ka = t2.opacity || _HighlightEditor._defaultOpacity;
    this.#Ua = t2.boxes || null;
    this.#Ja = t2.methodOfCreation || "";
    this.#Qa = t2.text || "";
    this._isDraggable = false;
    if (t2.highlightId > -1) {
      this.#Xa = true;
      this.#Za(t2);
      this.#tr();
    } else if (this.#Ua) {
      this.#Ha = t2.anchorNode;
      this.#za = t2.anchorOffset;
      this.#Va = t2.focusNode;
      this.#ja = t2.focusOffset;
      this.#er();
      this.#tr();
      this.rotate(this.rotation);
    }
  }
  get telemetryInitialData() {
    return { action: "added", type: this.#Xa ? "free_highlight" : "highlight", color: this._uiManager.highlightColorNames.get(this.color), thickness: this.#ea, methodOfCreation: this.#Ja };
  }
  get telemetryFinalData() {
    return { type: "highlight", color: this._uiManager.highlightColorNames.get(this.color) };
  }
  static computeTelemetryFinalData(t2) {
    return { numberOfColors: t2.get("color").size };
  }
  #er() {
    const t2 = new HighlightOutliner(this.#Ua, 1e-3);
    this.#qa = t2.getOutlines();
    [this.x, this.y, this.width, this.height] = this.#qa.box;
    const e2 = new HighlightOutliner(this.#Ua, 25e-4, 1e-3, "ltr" === this._uiManager.direction);
    this.#$a = e2.getOutlines();
    const { lastPoint: i2 } = this.#$a;
    this.#fa = [(i2[0] - this.x) / this.width, (i2[1] - this.y) / this.height];
  }
  #Za({ highlightOutlines: t2, highlightId: e2, clipPathId: i2 }) {
    this.#qa = t2;
    this.#$a = t2.getNewOutline(this.#ea / 2 + 1.5, 25e-4);
    if (e2 >= 0) {
      this.#w = e2;
      this.#Ga = i2;
      this.parent.drawLayer.finalizeDraw(e2, { bbox: t2.box, path: { d: t2.toSVGPath() } });
      this.#Ya = this.parent.drawLayer.drawOutline({ rootClass: { highlightOutline: true, free: true }, bbox: this.#$a.box, path: { d: this.#$a.toSVGPath() } }, true);
    } else if (this.parent) {
      const e3 = this.parent.viewport.rotation;
      this.parent.drawLayer.updateProperties(this.#w, { bbox: _HighlightEditor.#ir(this.#qa.box, (e3 - this.rotation + 360) % 360), path: { d: t2.toSVGPath() } });
      this.parent.drawLayer.updateProperties(this.#Ya, { bbox: _HighlightEditor.#ir(this.#$a.box, e3), path: { d: this.#$a.toSVGPath() } });
    }
    const [s2, n2, a2, r2] = t2.box;
    switch (this.rotation) {
      case 0:
        this.x = s2;
        this.y = n2;
        this.width = a2;
        this.height = r2;
        break;
      case 90: {
        const [t3, e3] = this.parentDimensions;
        this.x = n2;
        this.y = 1 - s2;
        this.width = a2 * e3 / t3;
        this.height = r2 * t3 / e3;
        break;
      }
      case 180:
        this.x = 1 - s2;
        this.y = 1 - n2;
        this.width = a2;
        this.height = r2;
        break;
      case 270: {
        const [t3, e3] = this.parentDimensions;
        this.x = 1 - n2;
        this.y = s2;
        this.width = a2 * e3 / t3;
        this.height = r2 * t3 / e3;
        break;
      }
    }
    const { lastPoint: o2 } = this.#$a;
    this.#fa = [(o2[0] - s2) / a2, (o2[1] - n2) / r2];
  }
  static initialize(t2, e2) {
    AnnotationEditor.initialize(t2, e2);
    _HighlightEditor._defaultColor ||= e2.highlightColors?.values().next().value || "#fff066";
  }
  static updateDefaultParams(t2, e2) {
    switch (t2) {
      case m.HIGHLIGHT_DEFAULT_COLOR:
        _HighlightEditor._defaultColor = e2;
        break;
      case m.HIGHLIGHT_THICKNESS:
        _HighlightEditor._defaultThickness = e2;
    }
  }
  translateInPage(t2, e2) {
  }
  get toolbarPosition() {
    return this.#fa;
  }
  updateParams(t2, e2) {
    switch (t2) {
      case m.HIGHLIGHT_COLOR:
        this.#On(e2);
        break;
      case m.HIGHLIGHT_THICKNESS:
        this.#sr(e2);
    }
  }
  static get defaultPropertiesToUpdate() {
    return [[m.HIGHLIGHT_DEFAULT_COLOR, _HighlightEditor._defaultColor], [m.HIGHLIGHT_THICKNESS, _HighlightEditor._defaultThickness]];
  }
  get propertiesToUpdate() {
    return [[m.HIGHLIGHT_COLOR, this.color || _HighlightEditor._defaultColor], [m.HIGHLIGHT_THICKNESS, this.#ea || _HighlightEditor._defaultThickness], [m.HIGHLIGHT_FREE, this.#Xa]];
  }
  #On(t2) {
    const setColorAndOpacity = (t3, e3) => {
      this.color = t3;
      this.#Ka = e3;
      this.parent?.drawLayer.updateProperties(this.#w, { root: { fill: t3, "fill-opacity": e3 } });
      this.#n?.updateColor(t3);
    }, e2 = this.color, i2 = this.#Ka;
    this.addCommands({ cmd: setColorAndOpacity.bind(this, t2, _HighlightEditor._defaultOpacity), undo: setColorAndOpacity.bind(this, e2, i2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.HIGHLIGHT_COLOR, overwriteIfSameType: true, keepUndo: true });
    this._reportTelemetry({ action: "color_changed", color: this._uiManager.highlightColorNames.get(t2) }, true);
  }
  #sr(t2) {
    const e2 = this.#ea, setThickness = (t3) => {
      this.#ea = t3;
      this.#nr(t3);
    };
    this.addCommands({ cmd: setThickness.bind(this, t2), undo: setThickness.bind(this, e2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.INK_THICKNESS, overwriteIfSameType: true, keepUndo: true });
    this._reportTelemetry({ action: "thickness_changed", thickness: t2 }, true);
  }
  async addEditToolbar() {
    const t2 = await super.addEditToolbar();
    if (!t2) return null;
    if (this._uiManager.highlightColors) {
      this.#n = new ColorPicker({ editor: this });
      t2.addColorPicker(this.#n);
    }
    return t2;
  }
  disableEditing() {
    super.disableEditing();
    this.div.classList.toggle("disabled", true);
  }
  enableEditing() {
    super.enableEditing();
    this.div.classList.toggle("disabled", false);
  }
  fixAndSetPosition() {
    return super.fixAndSetPosition(this.#ar());
  }
  getBaseTranslation() {
    return [0, 0];
  }
  getRect(t2, e2) {
    return super.getRect(t2, e2, this.#ar());
  }
  onceAdded(t2) {
    this.annotationElementId || this.parent.addUndoableEditor(this);
    t2 && this.div.focus();
  }
  remove() {
    this.#rr();
    this._reportTelemetry({ action: "deleted" });
    super.remove();
  }
  rebuild() {
    if (this.parent) {
      super.rebuild();
      if (null !== this.div) {
        this.#tr();
        this.isAttachedToDOM || this.parent.add(this);
      }
    }
  }
  setParent(t2) {
    let e2 = false;
    if (this.parent && !t2) this.#rr();
    else if (t2) {
      this.#tr(t2);
      e2 = !this.parent && this.div?.classList.contains("selectedEditor");
    }
    super.setParent(t2);
    this.show(this._isVisible);
    e2 && this.select();
  }
  #nr(t2) {
    if (!this.#Xa) return;
    this.#Za({ highlightOutlines: this.#qa.getNewOutline(t2 / 2) });
    this.fixAndSetPosition();
    const [e2, i2] = this.parentDimensions;
    this.setDims(this.width * e2, this.height * i2);
  }
  #rr() {
    if (null !== this.#w && this.parent) {
      this.parent.drawLayer.remove(this.#w);
      this.#w = null;
      this.parent.drawLayer.remove(this.#Ya);
      this.#Ya = null;
    }
  }
  #tr(t2 = this.parent) {
    if (null === this.#w) {
      ({ id: this.#w, clipPathId: this.#Ga } = t2.drawLayer.draw({ bbox: this.#qa.box, root: { viewBox: "0 0 1 1", fill: this.color, "fill-opacity": this.#Ka }, rootClass: { highlight: true, free: this.#Xa }, path: { d: this.#qa.toSVGPath() } }, false, true));
      this.#Ya = t2.drawLayer.drawOutline({ rootClass: { highlightOutline: true, free: this.#Xa }, bbox: this.#$a.box, path: { d: this.#$a.toSVGPath() } }, this.#Xa);
      this.#Wa && (this.#Wa.style.clipPath = this.#Ga);
    }
  }
  static #ir([t2, e2, i2, s2], n2) {
    switch (n2) {
      case 90:
        return [1 - e2 - s2, t2, s2, i2];
      case 180:
        return [1 - t2 - i2, 1 - e2 - s2, i2, s2];
      case 270:
        return [e2, 1 - t2 - i2, s2, i2];
    }
    return [t2, e2, i2, s2];
  }
  rotate(t2) {
    const { drawLayer: e2 } = this.parent;
    let i2;
    if (this.#Xa) {
      t2 = (t2 - this.rotation + 360) % 360;
      i2 = _HighlightEditor.#ir(this.#qa.box, t2);
    } else i2 = _HighlightEditor.#ir([this.x, this.y, this.width, this.height], t2);
    e2.updateProperties(this.#w, { bbox: i2, root: { "data-main-rotation": t2 } });
    e2.updateProperties(this.#Ya, { bbox: _HighlightEditor.#ir(this.#$a.box, t2), root: { "data-main-rotation": t2 } });
  }
  render() {
    if (this.div) return this.div;
    const t2 = super.render();
    if (this.#Qa) {
      t2.setAttribute("aria-label", this.#Qa);
      t2.setAttribute("role", "mark");
    }
    this.#Xa ? t2.classList.add("free") : this.div.addEventListener("keydown", this.#or.bind(this), { signal: this._uiManager._signal });
    const e2 = this.#Wa = document.createElement("div");
    t2.append(e2);
    e2.setAttribute("aria-hidden", "true");
    e2.className = "internal";
    e2.style.clipPath = this.#Ga;
    const [i2, s2] = this.parentDimensions;
    this.setDims(this.width * i2, this.height * s2);
    bindEvents(this, this.#Wa, ["pointerover", "pointerleave"]);
    this.enableEditing();
    return t2;
  }
  pointerover() {
    this.isSelected || this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { hovered: true } });
  }
  pointerleave() {
    this.isSelected || this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { hovered: false } });
  }
  #or(t2) {
    _HighlightEditor._keyboardManager.exec(this, t2);
  }
  _moveCaret(t2) {
    this.parent.unselect(this);
    switch (t2) {
      case 0:
      case 2:
        this.#lr(true);
        break;
      case 1:
      case 3:
        this.#lr(false);
    }
  }
  #lr(t2) {
    if (!this.#Ha) return;
    const e2 = window.getSelection();
    t2 ? e2.setPosition(this.#Ha, this.#za) : e2.setPosition(this.#Va, this.#ja);
  }
  select() {
    super.select();
    this.#Ya && this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { hovered: false, selected: true } });
  }
  unselect() {
    super.unselect();
    if (this.#Ya) {
      this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { selected: false } });
      this.#Xa || this.#lr(false);
    }
  }
  get _mustFixPosition() {
    return !this.#Xa;
  }
  show(t2 = this._isVisible) {
    super.show(t2);
    if (this.parent) {
      this.parent.drawLayer.updateProperties(this.#w, { rootClass: { hidden: !t2 } });
      this.parent.drawLayer.updateProperties(this.#Ya, { rootClass: { hidden: !t2 } });
    }
  }
  #ar() {
    return this.#Xa ? this.rotation : 0;
  }
  #hr() {
    if (this.#Xa) return null;
    const [t2, e2] = this.pageDimensions, [i2, s2] = this.pageTranslation, n2 = this.#Ua, a2 = new Float32Array(8 * n2.length);
    let r2 = 0;
    for (const { x: o2, y: l2, width: h2, height: d2 } of n2) {
      const n3 = o2 * t2 + i2, c2 = (1 - l2) * e2 + s2;
      a2[r2] = a2[r2 + 4] = n3;
      a2[r2 + 1] = a2[r2 + 3] = c2;
      a2[r2 + 2] = a2[r2 + 6] = n3 + h2 * t2;
      a2[r2 + 5] = a2[r2 + 7] = c2 - d2 * e2;
      r2 += 8;
    }
    return a2;
  }
  #dr(t2) {
    return this.#qa.serialize(t2, this.#ar());
  }
  static startHighlighting(t2, e2, { target: i2, x: s2, y: n2 }) {
    const { x: a2, y: r2, width: o2, height: l2 } = i2.getBoundingClientRect(), h2 = new AbortController(), d2 = t2.combinedSignal(h2), pointerUpCallback = (e3) => {
      h2.abort();
      this.#cr(t2, e3);
    };
    window.addEventListener("blur", pointerUpCallback, { signal: d2 });
    window.addEventListener("pointerup", pointerUpCallback, { signal: d2 });
    window.addEventListener("pointerdown", stopEvent, { capture: true, passive: false, signal: d2 });
    window.addEventListener("contextmenu", noContextMenu, { signal: d2 });
    i2.addEventListener("pointermove", this.#ur.bind(this, t2), { signal: d2 });
    this._freeHighlight = new FreeHighlightOutliner({ x: s2, y: n2 }, [a2, r2, o2, l2], t2.scale, this._defaultThickness / 2, e2, 1e-3);
    ({ id: this._freeHighlightId, clipPathId: this._freeHighlightClipId } = t2.drawLayer.draw({ bbox: [0, 0, 1, 1], root: { viewBox: "0 0 1 1", fill: this._defaultColor, "fill-opacity": this._defaultOpacity }, rootClass: { highlight: true, free: true }, path: { d: this._freeHighlight.toSVGPath() } }, true, true));
  }
  static #ur(t2, e2) {
    this._freeHighlight.add(e2) && t2.drawLayer.updateProperties(this._freeHighlightId, { path: { d: this._freeHighlight.toSVGPath() } });
  }
  static #cr(t2, e2) {
    this._freeHighlight.isEmpty() ? t2.drawLayer.remove(this._freeHighlightId) : t2.createAndAddNewEditor(e2, false, { highlightId: this._freeHighlightId, highlightOutlines: this._freeHighlight.getOutlines(), clipPathId: this._freeHighlightClipId, methodOfCreation: "main_toolbar" });
    this._freeHighlightId = -1;
    this._freeHighlight = null;
    this._freeHighlightClipId = "";
  }
  static async deserialize(t2, e2, i2) {
    let s2 = null;
    if (t2 instanceof HighlightAnnotationElement) {
      const { data: { quadPoints: e3, rect: i3, rotation: n3, id: a3, color: r3, opacity: o3, popupRef: l3 }, parent: { page: { pageNumber: h3 } } } = t2;
      s2 = t2 = { annotationType: g.HIGHLIGHT, color: Array.from(r3), opacity: o3, quadPoints: e3, boxes: null, pageIndex: h3 - 1, rect: i3.slice(0), rotation: n3, id: a3, deleted: false, popupRef: l3 };
    } else if (t2 instanceof InkAnnotationElement) {
      const { data: { inkLists: e3, rect: i3, rotation: n3, id: a3, color: r3, borderStyle: { rawWidth: o3 }, popupRef: l3 }, parent: { page: { pageNumber: h3 } } } = t2;
      s2 = t2 = { annotationType: g.HIGHLIGHT, color: Array.from(r3), thickness: o3, inkLists: e3, boxes: null, pageIndex: h3 - 1, rect: i3.slice(0), rotation: n3, id: a3, deleted: false, popupRef: l3 };
    }
    const { color: n2, quadPoints: a2, inkLists: r2, opacity: o2 } = t2, l2 = await super.deserialize(t2, e2, i2);
    l2.color = Util.makeHexColor(...n2);
    l2.#Ka = o2 || 1;
    r2 && (l2.#ea = t2.thickness);
    l2.annotationElementId = t2.id || null;
    l2._initialData = s2;
    const [h2, d2] = l2.pageDimensions, [c2, u2] = l2.pageTranslation;
    if (a2) {
      const t3 = l2.#Ua = [];
      for (let e3 = 0; e3 < a2.length; e3 += 8) t3.push({ x: (a2[e3] - c2) / h2, y: 1 - (a2[e3 + 1] - u2) / d2, width: (a2[e3 + 2] - a2[e3]) / h2, height: (a2[e3 + 1] - a2[e3 + 5]) / d2 });
      l2.#er();
      l2.#tr();
      l2.rotate(l2.rotation);
    } else if (r2) {
      l2.#Xa = true;
      const t3 = r2[0], i3 = { x: t3[0] - c2, y: d2 - (t3[1] - u2) }, s3 = new FreeHighlightOutliner(i3, [0, 0, h2, d2], 1, l2.#ea / 2, true, 1e-3);
      for (let e3 = 0, n4 = t3.length; e3 < n4; e3 += 2) {
        i3.x = t3[e3] - c2;
        i3.y = d2 - (t3[e3 + 1] - u2);
        s3.add(i3);
      }
      const { id: n3, clipPathId: a3 } = e2.drawLayer.draw({ bbox: [0, 0, 1, 1], root: { viewBox: "0 0 1 1", fill: l2.color, "fill-opacity": l2._defaultOpacity }, rootClass: { highlight: true, free: true }, path: { d: s3.toSVGPath() } }, true, true);
      l2.#Za({ highlightOutlines: s3.getOutlines(), highlightId: n3, clipPathId: a3 });
      l2.#tr();
    }
    return l2;
  }
  serialize(t2 = false) {
    if (this.isEmpty() || t2) return null;
    if (this.deleted) return this.serializeDeleted();
    const e2 = this.getRect(0, 0), i2 = AnnotationEditor._colorManager.convert(this.color), s2 = { annotationType: g.HIGHLIGHT, color: i2, opacity: this.#Ka, thickness: this.#ea, quadPoints: this.#hr(), outlines: this.#dr(e2), pageIndex: this.pageIndex, rect: e2, rotation: this.#ar(), structTreeParentId: this._structTreeParentId };
    if (this.annotationElementId && !this.#$n(s2)) return null;
    s2.id = this.annotationElementId;
    return s2;
  }
  #$n(t2) {
    const { color: e2 } = this._initialData;
    return t2.color.some(((t3, i2) => t3 !== e2[i2]));
  }
  renderAnnotationElement(t2) {
    t2.updateEdited({ rect: this.getRect(0, 0) });
    return null;
  }
  static canCreateNewEmptyEditor() {
    return false;
  }
};
var DrawingOptions = class {
  #pr = /* @__PURE__ */ Object.create(null);
  updateProperty(t2, e2) {
    this[t2] = e2;
    this.updateSVGProperty(t2, e2);
  }
  updateProperties(t2) {
    if (t2) for (const [e2, i2] of Object.entries(t2)) this.updateProperty(e2, i2);
  }
  updateSVGProperty(t2, e2) {
    this.#pr[t2] = e2;
  }
  toSVGProperties() {
    const t2 = this.#pr;
    this.#pr = /* @__PURE__ */ Object.create(null);
    return { root: t2 };
  }
  reset() {
    this.#pr = /* @__PURE__ */ Object.create(null);
  }
  updateAll(t2 = this) {
    this.updateProperties(t2);
  }
  clone() {
    unreachable("Not implemented");
  }
};
var DrawingEditor = class _DrawingEditor extends AnnotationEditor {
  #gr = null;
  #mr;
  _drawId = null;
  static _currentDrawId = -1;
  static _currentParent = null;
  static #fr = null;
  static #br = null;
  static #Ar = null;
  static #wr = NaN;
  static #vr = null;
  static #yr = null;
  static #xr = NaN;
  static _INNER_MARGIN = 3;
  constructor(t2) {
    super(t2);
    this.#mr = t2.mustBeCommitted || false;
    if (t2.drawOutlines) {
      this.#_r(t2);
      this.#tr();
    }
  }
  #_r({ drawOutlines: t2, drawId: e2, drawingOptions: i2 }) {
    this.#gr = t2;
    this._drawingOptions ||= i2;
    if (e2 >= 0) {
      this._drawId = e2;
      this.parent.drawLayer.finalizeDraw(e2, t2.defaultProperties);
    } else this._drawId = this.#Er(t2, this.parent);
    this.#Sr(t2.box);
  }
  #Er(t2, e2) {
    const { id: i2 } = e2.drawLayer.draw(_DrawingEditor._mergeSVGProperties(this._drawingOptions.toSVGProperties(), t2.defaultSVGProperties), false, false);
    return i2;
  }
  static _mergeSVGProperties(t2, e2) {
    const i2 = new Set(Object.keys(t2));
    for (const [s2, n2] of Object.entries(e2)) i2.has(s2) ? Object.assign(t2[s2], n2) : t2[s2] = n2;
    return t2;
  }
  static getDefaultDrawingOptions(t2) {
    unreachable("Not implemented");
  }
  static get typesMap() {
    unreachable("Not implemented");
  }
  static get isDrawer() {
    return true;
  }
  static get supportMultipleDrawings() {
    return false;
  }
  static updateDefaultParams(t2, e2) {
    const i2 = this.typesMap.get(t2);
    i2 && this._defaultDrawingOptions.updateProperty(i2, e2);
    if (this._currentParent) {
      _DrawingEditor.#fr.updateProperty(i2, e2);
      this._currentParent.drawLayer.updateProperties(this._currentDrawId, this._defaultDrawingOptions.toSVGProperties());
    }
  }
  updateParams(t2, e2) {
    const i2 = this.constructor.typesMap.get(t2);
    i2 && this._updateProperty(t2, i2, e2);
  }
  static get defaultPropertiesToUpdate() {
    const t2 = [], e2 = this._defaultDrawingOptions;
    for (const [i2, s2] of this.typesMap) t2.push([i2, e2[s2]]);
    return t2;
  }
  get propertiesToUpdate() {
    const t2 = [], { _drawingOptions: e2 } = this;
    for (const [i2, s2] of this.constructor.typesMap) t2.push([i2, e2[s2]]);
    return t2;
  }
  _updateProperty(t2, e2, i2) {
    const s2 = this._drawingOptions, n2 = s2[e2], setter = (t3) => {
      s2.updateProperty(e2, t3);
      const i3 = this.#gr.updateProperty(e2, t3);
      i3 && this.#Sr(i3);
      this.parent?.drawLayer.updateProperties(this._drawId, s2.toSVGProperties());
    };
    this.addCommands({ cmd: setter.bind(this, i2), undo: setter.bind(this, n2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: t2, overwriteIfSameType: true, keepUndo: true });
  }
  _onResizing() {
    this.parent?.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties(this.#gr.getPathResizingSVGProperties(this.#Cr()), { bbox: this.#Tr() }));
  }
  _onResized() {
    this.parent?.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties(this.#gr.getPathResizedSVGProperties(this.#Cr()), { bbox: this.#Tr() }));
  }
  _onTranslating(t2, e2) {
    this.parent?.drawLayer.updateProperties(this._drawId, { bbox: this.#Tr(t2, e2) });
  }
  _onTranslated() {
    this.parent?.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties(this.#gr.getPathTranslatedSVGProperties(this.#Cr(), this.parentDimensions), { bbox: this.#Tr() }));
  }
  _onStartDragging() {
    this.parent?.drawLayer.updateProperties(this._drawId, { rootClass: { moving: true } });
  }
  _onStopDragging() {
    this.parent?.drawLayer.updateProperties(this._drawId, { rootClass: { moving: false } });
  }
  commit() {
    super.commit();
    this.disableEditMode();
    this.disableEditing();
  }
  disableEditing() {
    super.disableEditing();
    this.div.classList.toggle("disabled", true);
  }
  enableEditing() {
    super.enableEditing();
    this.div.classList.toggle("disabled", false);
  }
  getBaseTranslation() {
    return [0, 0];
  }
  get isResizable() {
    return true;
  }
  onceAdded(t2) {
    this.annotationElementId || this.parent.addUndoableEditor(this);
    this._isDraggable = true;
    if (this.#mr) {
      this.#mr = false;
      this.commit();
      this.parent.setSelected(this);
      t2 && this.isOnScreen && this.div.focus();
    }
  }
  remove() {
    this.#rr();
    super.remove();
  }
  rebuild() {
    if (this.parent) {
      super.rebuild();
      if (null !== this.div) {
        this.#tr();
        this.#Sr(this.#gr.box);
        this.isAttachedToDOM || this.parent.add(this);
      }
    }
  }
  setParent(t2) {
    let e2 = false;
    if (this.parent && !t2) {
      this._uiManager.removeShouldRescale(this);
      this.#rr();
    } else if (t2) {
      this._uiManager.addShouldRescale(this);
      this.#tr(t2);
      e2 = !this.parent && this.div?.classList.contains("selectedEditor");
    }
    super.setParent(t2);
    e2 && this.select();
  }
  #rr() {
    if (null !== this._drawId && this.parent) {
      this.parent.drawLayer.remove(this._drawId);
      this._drawId = null;
      this._drawingOptions.reset();
    }
  }
  #tr(t2 = this.parent) {
    if (null === this._drawId || this.parent !== t2) if (null === this._drawId) {
      this._drawingOptions.updateAll();
      this._drawId = this.#Er(this.#gr, t2);
    } else this.parent.drawLayer.updateParent(this._drawId, t2.drawLayer);
  }
  #Mr([t2, e2, i2, s2]) {
    const { parentDimensions: [n2, a2], rotation: r2 } = this;
    switch (r2) {
      case 90:
        return [e2, 1 - t2, i2 * (a2 / n2), s2 * (n2 / a2)];
      case 180:
        return [1 - t2, 1 - e2, i2, s2];
      case 270:
        return [1 - e2, t2, i2 * (a2 / n2), s2 * (n2 / a2)];
      default:
        return [t2, e2, i2, s2];
    }
  }
  #Cr() {
    const { x: t2, y: e2, width: i2, height: s2, parentDimensions: [n2, a2], rotation: r2 } = this;
    switch (r2) {
      case 90:
        return [1 - e2, t2, i2 * (n2 / a2), s2 * (a2 / n2)];
      case 180:
        return [1 - t2, 1 - e2, i2, s2];
      case 270:
        return [e2, 1 - t2, i2 * (n2 / a2), s2 * (a2 / n2)];
      default:
        return [t2, e2, i2, s2];
    }
  }
  #Sr(t2) {
    [this.x, this.y, this.width, this.height] = this.#Mr(t2);
    if (this.div) {
      this.fixAndSetPosition();
      const [t3, e2] = this.parentDimensions;
      this.setDims(this.width * t3, this.height * e2);
    }
    this._onResized();
  }
  #Tr() {
    const { x: t2, y: e2, width: i2, height: s2, rotation: n2, parentRotation: a2, parentDimensions: [r2, o2] } = this;
    switch ((4 * n2 + a2) / 90) {
      case 1:
        return [1 - e2 - s2, t2, s2, i2];
      case 2:
        return [1 - t2 - i2, 1 - e2 - s2, i2, s2];
      case 3:
        return [e2, 1 - t2 - i2, s2, i2];
      case 4:
        return [t2, e2 - i2 * (r2 / o2), s2 * (o2 / r2), i2 * (r2 / o2)];
      case 5:
        return [1 - e2, t2, i2 * (r2 / o2), s2 * (o2 / r2)];
      case 6:
        return [1 - t2 - s2 * (o2 / r2), 1 - e2, s2 * (o2 / r2), i2 * (r2 / o2)];
      case 7:
        return [e2 - i2 * (r2 / o2), 1 - t2 - s2 * (o2 / r2), i2 * (r2 / o2), s2 * (o2 / r2)];
      case 8:
        return [t2 - i2, e2 - s2, i2, s2];
      case 9:
        return [1 - e2, t2 - i2, s2, i2];
      case 10:
        return [1 - t2, 1 - e2, i2, s2];
      case 11:
        return [e2 - s2, 1 - t2, s2, i2];
      case 12:
        return [t2 - s2 * (o2 / r2), e2, s2 * (o2 / r2), i2 * (r2 / o2)];
      case 13:
        return [1 - e2 - i2 * (r2 / o2), t2 - s2 * (o2 / r2), i2 * (r2 / o2), s2 * (o2 / r2)];
      case 14:
        return [1 - t2, 1 - e2 - i2 * (r2 / o2), s2 * (o2 / r2), i2 * (r2 / o2)];
      case 15:
        return [e2, 1 - t2, i2 * (r2 / o2), s2 * (o2 / r2)];
      default:
        return [t2, e2, i2, s2];
    }
  }
  rotate() {
    this.parent && this.parent.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties({ bbox: this.#Tr() }, this.#gr.updateRotation((this.parentRotation - this.rotation + 360) % 360)));
  }
  onScaleChanging() {
    this.parent && this.#Sr(this.#gr.updateParentDimensions(this.parentDimensions, this.parent.scale));
  }
  static onScaleChangingWhenDrawing() {
  }
  render() {
    if (this.div) return this.div;
    const t2 = super.render();
    t2.classList.add("draw");
    const e2 = document.createElement("div");
    t2.append(e2);
    e2.setAttribute("aria-hidden", "true");
    e2.className = "internal";
    const [i2, s2] = this.parentDimensions;
    this.setDims(this.width * i2, this.height * s2);
    this._uiManager.addShouldRescale(this);
    this.disableEditing();
    return t2;
  }
  static createDrawerInstance(t2, e2, i2, s2, n2) {
    unreachable("Not implemented");
  }
  static startDrawing(t2, e2, i2, s2) {
    const { target: n2, offsetX: a2, offsetY: r2, pointerId: o2, pointerType: l2 } = s2;
    if (_DrawingEditor.#vr && _DrawingEditor.#vr !== l2) return;
    const { viewport: { rotation: h2 } } = t2, { width: d2, height: c2 } = n2.getBoundingClientRect(), u2 = _DrawingEditor.#br = new AbortController(), p2 = t2.combinedSignal(u2);
    _DrawingEditor.#wr ||= o2;
    _DrawingEditor.#vr ??= l2;
    window.addEventListener("pointerup", ((t3) => {
      _DrawingEditor.#wr === t3.pointerId ? this._endDraw(t3) : _DrawingEditor.#yr?.delete(t3.pointerId);
    }), { signal: p2 });
    window.addEventListener("pointercancel", ((t3) => {
      _DrawingEditor.#wr === t3.pointerId ? this._currentParent.endDrawingSession() : _DrawingEditor.#yr?.delete(t3.pointerId);
    }), { signal: p2 });
    window.addEventListener("pointerdown", ((t3) => {
      if (_DrawingEditor.#vr === t3.pointerType) {
        (_DrawingEditor.#yr ||= /* @__PURE__ */ new Set()).add(t3.pointerId);
        if (_DrawingEditor.#fr.isCancellable()) {
          _DrawingEditor.#fr.removeLastElement();
          _DrawingEditor.#fr.isEmpty() ? this._currentParent.endDrawingSession(true) : this._endDraw(null);
        }
      }
    }), { capture: true, passive: false, signal: p2 });
    window.addEventListener("contextmenu", noContextMenu, { signal: p2 });
    n2.addEventListener("pointermove", this._drawMove.bind(this), { signal: p2 });
    n2.addEventListener("touchmove", ((t3) => {
      t3.timeStamp === _DrawingEditor.#xr && stopEvent(t3);
    }), { signal: p2 });
    t2.toggleDrawing();
    e2._editorUndoBar?.hide();
    if (_DrawingEditor.#fr) t2.drawLayer.updateProperties(this._currentDrawId, _DrawingEditor.#fr.startNew(a2, r2, d2, c2, h2));
    else {
      e2.updateUIForDefaultProperties(this);
      _DrawingEditor.#fr = this.createDrawerInstance(a2, r2, d2, c2, h2);
      _DrawingEditor.#Ar = this.getDefaultDrawingOptions();
      this._currentParent = t2;
      ({ id: this._currentDrawId } = t2.drawLayer.draw(this._mergeSVGProperties(_DrawingEditor.#Ar.toSVGProperties(), _DrawingEditor.#fr.defaultSVGProperties), true, false));
    }
  }
  static _drawMove(t2) {
    _DrawingEditor.#xr = -1;
    if (!_DrawingEditor.#fr) return;
    const { offsetX: e2, offsetY: i2, pointerId: s2 } = t2;
    if (_DrawingEditor.#wr === s2) if (_DrawingEditor.#yr?.size >= 1) this._endDraw(t2);
    else {
      this._currentParent.drawLayer.updateProperties(this._currentDrawId, _DrawingEditor.#fr.add(e2, i2));
      _DrawingEditor.#xr = t2.timeStamp;
      stopEvent(t2);
    }
  }
  static _cleanup(t2) {
    if (t2) {
      this._currentDrawId = -1;
      this._currentParent = null;
      _DrawingEditor.#fr = null;
      _DrawingEditor.#Ar = null;
      _DrawingEditor.#vr = null;
      _DrawingEditor.#xr = NaN;
    }
    if (_DrawingEditor.#br) {
      _DrawingEditor.#br.abort();
      _DrawingEditor.#br = null;
      _DrawingEditor.#wr = NaN;
      _DrawingEditor.#yr = null;
    }
  }
  static _endDraw(t2) {
    const e2 = this._currentParent;
    if (e2) {
      e2.toggleDrawing(true);
      this._cleanup(false);
      t2 && e2.drawLayer.updateProperties(this._currentDrawId, _DrawingEditor.#fr.end(t2.offsetX, t2.offsetY));
      if (this.supportMultipleDrawings) {
        const t3 = _DrawingEditor.#fr, i2 = this._currentDrawId, s2 = t3.getLastElement();
        e2.addCommands({ cmd: () => {
          e2.drawLayer.updateProperties(i2, t3.setLastElement(s2));
        }, undo: () => {
          e2.drawLayer.updateProperties(i2, t3.removeLastElement());
        }, mustExec: false, type: m.DRAW_STEP });
      } else this.endDrawing(false);
    }
  }
  static endDrawing(t2) {
    const e2 = this._currentParent;
    if (!e2) return null;
    e2.toggleDrawing(true);
    e2.cleanUndoStack(m.DRAW_STEP);
    if (!_DrawingEditor.#fr.isEmpty()) {
      const { pageDimensions: [i2, s2], scale: n2 } = e2, a2 = e2.createAndAddNewEditor({ offsetX: 0, offsetY: 0 }, false, { drawId: this._currentDrawId, drawOutlines: _DrawingEditor.#fr.getOutlines(i2 * n2, s2 * n2, n2, this._INNER_MARGIN), drawingOptions: _DrawingEditor.#Ar, mustBeCommitted: !t2 });
      this._cleanup(true);
      return a2;
    }
    e2.drawLayer.remove(this._currentDrawId);
    this._cleanup(true);
    return null;
  }
  createDrawingOptions(t2) {
  }
  static deserializeDraw(t2, e2, i2, s2, n2, a2) {
    unreachable("Not implemented");
  }
  static async deserialize(t2, e2, i2) {
    const { rawDims: { pageWidth: s2, pageHeight: n2, pageX: a2, pageY: r2 } } = e2.viewport, o2 = this.deserializeDraw(a2, r2, s2, n2, this._INNER_MARGIN, t2), l2 = await super.deserialize(t2, e2, i2);
    l2.createDrawingOptions(t2);
    l2.#_r({ drawOutlines: o2 });
    l2.#tr();
    l2.onScaleChanging();
    l2.rotate();
    return l2;
  }
  serializeDraw(t2) {
    const [e2, i2] = this.pageTranslation, [s2, n2] = this.pageDimensions;
    return this.#gr.serialize([e2, i2, s2, n2], t2);
  }
  renderAnnotationElement(t2) {
    t2.updateEdited({ rect: this.getRect(0, 0) });
    return null;
  }
  static canCreateNewEmptyEditor() {
    return false;
  }
};
var InkDrawOutliner = class {
  #Kn = new Float64Array(6);
  #bn;
  #Pr;
  #Fi;
  #ea;
  #ia;
  #Dr = "";
  #kr = 0;
  #Ea = new InkDrawOutline();
  #Rr;
  #Ir;
  constructor(t2, e2, i2, s2, n2, a2) {
    this.#Rr = i2;
    this.#Ir = s2;
    this.#Fi = n2;
    this.#ea = a2;
    [t2, e2] = this.#Fr(t2, e2);
    const r2 = this.#bn = [NaN, NaN, NaN, NaN, t2, e2];
    this.#ia = [t2, e2];
    this.#Pr = [{ line: r2, points: this.#ia }];
    this.#Kn.set(r2, 0);
  }
  updateProperty(t2, e2) {
    "stroke-width" === t2 && (this.#ea = e2);
  }
  #Fr(t2, e2) {
    return Outline._normalizePoint(t2, e2, this.#Rr, this.#Ir, this.#Fi);
  }
  isEmpty() {
    return !this.#Pr || 0 === this.#Pr.length;
  }
  isCancellable() {
    return this.#ia.length <= 10;
  }
  add(t2, e2) {
    [t2, e2] = this.#Fr(t2, e2);
    const [i2, s2, n2, a2] = this.#Kn.subarray(2, 6), r2 = t2 - n2, o2 = e2 - a2;
    if (Math.hypot(this.#Rr * r2, this.#Ir * o2) <= 2) return null;
    this.#ia.push(t2, e2);
    if (isNaN(i2)) {
      this.#Kn.set([n2, a2, t2, e2], 2);
      this.#bn.push(NaN, NaN, NaN, NaN, t2, e2);
      return { path: { d: this.toSVGPath() } };
    }
    isNaN(this.#Kn[0]) && this.#bn.splice(6, 6);
    this.#Kn.set([i2, s2, n2, a2, t2, e2], 0);
    this.#bn.push(...Outline.createBezierPoints(i2, s2, n2, a2, t2, e2));
    return { path: { d: this.toSVGPath() } };
  }
  end(t2, e2) {
    const i2 = this.add(t2, e2);
    return i2 || (2 === this.#ia.length ? { path: { d: this.toSVGPath() } } : null);
  }
  startNew(t2, e2, i2, s2, n2) {
    this.#Rr = i2;
    this.#Ir = s2;
    this.#Fi = n2;
    [t2, e2] = this.#Fr(t2, e2);
    const a2 = this.#bn = [NaN, NaN, NaN, NaN, t2, e2];
    this.#ia = [t2, e2];
    const r2 = this.#Pr.at(-1);
    if (r2) {
      r2.line = new Float32Array(r2.line);
      r2.points = new Float32Array(r2.points);
    }
    this.#Pr.push({ line: a2, points: this.#ia });
    this.#Kn.set(a2, 0);
    this.#kr = 0;
    this.toSVGPath();
    return null;
  }
  getLastElement() {
    return this.#Pr.at(-1);
  }
  setLastElement(t2) {
    if (!this.#Pr) return this.#Ea.setLastElement(t2);
    this.#Pr.push(t2);
    this.#bn = t2.line;
    this.#ia = t2.points;
    this.#kr = 0;
    return { path: { d: this.toSVGPath() } };
  }
  removeLastElement() {
    if (!this.#Pr) return this.#Ea.removeLastElement();
    this.#Pr.pop();
    this.#Dr = "";
    for (let t2 = 0, e2 = this.#Pr.length; t2 < e2; t2++) {
      const { line: e3, points: i2 } = this.#Pr[t2];
      this.#bn = e3;
      this.#ia = i2;
      this.#kr = 0;
      this.toSVGPath();
    }
    return { path: { d: this.#Dr } };
  }
  toSVGPath() {
    const t2 = Outline.svgRound(this.#bn[4]), e2 = Outline.svgRound(this.#bn[5]);
    if (2 === this.#ia.length) {
      this.#Dr = `${this.#Dr} M ${t2} ${e2} Z`;
      return this.#Dr;
    }
    if (this.#ia.length <= 6) {
      const i3 = this.#Dr.lastIndexOf("M");
      this.#Dr = `${this.#Dr.slice(0, i3)} M ${t2} ${e2}`;
      this.#kr = 6;
    }
    if (4 === this.#ia.length) {
      const t3 = Outline.svgRound(this.#bn[10]), e3 = Outline.svgRound(this.#bn[11]);
      this.#Dr = `${this.#Dr} L ${t3} ${e3}`;
      this.#kr = 12;
      return this.#Dr;
    }
    const i2 = [];
    if (0 === this.#kr) {
      i2.push(`M ${t2} ${e2}`);
      this.#kr = 6;
    }
    for (let t3 = this.#kr, e3 = this.#bn.length; t3 < e3; t3 += 6) {
      const [e4, s2, n2, a2, r2, o2] = this.#bn.slice(t3, t3 + 6).map(Outline.svgRound);
      i2.push(`C${e4} ${s2} ${n2} ${a2} ${r2} ${o2}`);
    }
    this.#Dr += i2.join(" ");
    this.#kr = this.#bn.length;
    return this.#Dr;
  }
  getOutlines(t2, e2, i2, s2) {
    const n2 = this.#Pr.at(-1);
    n2.line = new Float32Array(n2.line);
    n2.points = new Float32Array(n2.points);
    this.#Ea.build(this.#Pr, t2, e2, i2, this.#Fi, this.#ea, s2);
    this.#Kn = null;
    this.#bn = null;
    this.#Pr = null;
    this.#Dr = null;
    return this.#Ea;
  }
  get defaultSVGProperties() {
    return { root: { viewBox: "0 0 10000 10000" }, rootClass: { draw: true }, bbox: [0, 0, 1, 1] };
  }
};
var InkDrawOutline = class _InkDrawOutline extends Outline {
  #pa;
  #Lr = 0;
  #Wn;
  #Pr;
  #Rr;
  #Ir;
  #Or;
  #Fi;
  #ea;
  build(t2, e2, i2, s2, n2, a2, r2) {
    this.#Rr = e2;
    this.#Ir = i2;
    this.#Or = s2;
    this.#Fi = n2;
    this.#ea = a2;
    this.#Wn = r2 ?? 0;
    this.#Pr = t2;
    this.#Nr();
  }
  setLastElement(t2) {
    this.#Pr.push(t2);
    return { path: { d: this.toSVGPath() } };
  }
  removeLastElement() {
    this.#Pr.pop();
    return { path: { d: this.toSVGPath() } };
  }
  toSVGPath() {
    const t2 = [];
    for (const { line: e2 } of this.#Pr) {
      t2.push(`M${Outline.svgRound(e2[4])} ${Outline.svgRound(e2[5])}`);
      if (6 !== e2.length) if (12 !== e2.length) for (let i2 = 6, s2 = e2.length; i2 < s2; i2 += 6) {
        const [s3, n2, a2, r2, o2, l2] = e2.subarray(i2, i2 + 6).map(Outline.svgRound);
        t2.push(`C${s3} ${n2} ${a2} ${r2} ${o2} ${l2}`);
      }
      else t2.push(`L${Outline.svgRound(e2[10])} ${Outline.svgRound(e2[11])}`);
      else t2.push("Z");
    }
    return t2.join("");
  }
  serialize([t2, e2, i2, s2], n2) {
    const a2 = [], r2 = [], [o2, l2, h2, d2] = this.#Br();
    let c2, u2, p2, g2, m2, f2, b2, A2, w2;
    switch (this.#Fi) {
      case 0:
        w2 = Outline._rescale;
        c2 = t2;
        u2 = e2 + s2;
        p2 = i2;
        g2 = -s2;
        m2 = t2 + o2 * i2;
        f2 = e2 + (1 - l2 - d2) * s2;
        b2 = t2 + (o2 + h2) * i2;
        A2 = e2 + (1 - l2) * s2;
        break;
      case 90:
        w2 = Outline._rescaleAndSwap;
        c2 = t2;
        u2 = e2;
        p2 = i2;
        g2 = s2;
        m2 = t2 + l2 * i2;
        f2 = e2 + o2 * s2;
        b2 = t2 + (l2 + d2) * i2;
        A2 = e2 + (o2 + h2) * s2;
        break;
      case 180:
        w2 = Outline._rescale;
        c2 = t2 + i2;
        u2 = e2;
        p2 = -i2;
        g2 = s2;
        m2 = t2 + (1 - o2 - h2) * i2;
        f2 = e2 + l2 * s2;
        b2 = t2 + (1 - o2) * i2;
        A2 = e2 + (l2 + d2) * s2;
        break;
      case 270:
        w2 = Outline._rescaleAndSwap;
        c2 = t2 + i2;
        u2 = e2 + s2;
        p2 = -i2;
        g2 = -s2;
        m2 = t2 + (1 - l2 - d2) * i2;
        f2 = e2 + (1 - o2 - h2) * s2;
        b2 = t2 + (1 - l2) * i2;
        A2 = e2 + (1 - o2) * s2;
    }
    for (const { line: t3, points: e3 } of this.#Pr) {
      a2.push(w2(t3, c2, u2, p2, g2, n2 ? new Array(t3.length) : null));
      r2.push(w2(e3, c2, u2, p2, g2, n2 ? new Array(e3.length) : null));
    }
    return { lines: a2, points: r2, rect: [m2, f2, b2, A2] };
  }
  static deserialize(t2, e2, i2, s2, n2, { paths: { lines: a2, points: r2 }, rotation: o2, thickness: l2 }) {
    const h2 = [];
    let d2, c2, u2, p2, g2;
    switch (o2) {
      case 0:
        g2 = Outline._rescale;
        d2 = -t2 / i2;
        c2 = e2 / s2 + 1;
        u2 = 1 / i2;
        p2 = -1 / s2;
        break;
      case 90:
        g2 = Outline._rescaleAndSwap;
        d2 = -e2 / s2;
        c2 = -t2 / i2;
        u2 = 1 / s2;
        p2 = 1 / i2;
        break;
      case 180:
        g2 = Outline._rescale;
        d2 = t2 / i2 + 1;
        c2 = -e2 / s2;
        u2 = -1 / i2;
        p2 = 1 / s2;
        break;
      case 270:
        g2 = Outline._rescaleAndSwap;
        d2 = e2 / s2 + 1;
        c2 = t2 / i2 + 1;
        u2 = -1 / s2;
        p2 = -1 / i2;
    }
    if (!a2) {
      a2 = [];
      for (const t3 of r2) {
        const e3 = t3.length;
        if (2 === e3) {
          a2.push(new Float32Array([NaN, NaN, NaN, NaN, t3[0], t3[1]]));
          continue;
        }
        if (4 === e3) {
          a2.push(new Float32Array([NaN, NaN, NaN, NaN, t3[0], t3[1], NaN, NaN, NaN, NaN, t3[2], t3[3]]));
          continue;
        }
        const i3 = new Float32Array(3 * (e3 - 2));
        a2.push(i3);
        let [s3, n3, r3, o3] = t3.subarray(0, 4);
        i3.set([NaN, NaN, NaN, NaN, s3, n3], 0);
        for (let a3 = 4; a3 < e3; a3 += 2) {
          const e4 = t3[a3], l3 = t3[a3 + 1];
          i3.set(Outline.createBezierPoints(s3, n3, r3, o3, e4, l3), 3 * (a3 - 2));
          [s3, n3, r3, o3] = [r3, o3, e4, l3];
        }
      }
    }
    for (let t3 = 0, e3 = a2.length; t3 < e3; t3++) h2.push({ line: g2(a2[t3].map(((t4) => t4 ?? NaN)), d2, c2, u2, p2), points: g2(r2[t3].map(((t4) => t4 ?? NaN)), d2, c2, u2, p2) });
    const m2 = new _InkDrawOutline();
    m2.build(h2, i2, s2, 1, o2, l2, n2);
    return m2;
  }
  #Hr(t2 = this.#ea) {
    const e2 = this.#Wn + t2 / 2 * this.#Or;
    return this.#Fi % 180 == 0 ? [e2 / this.#Rr, e2 / this.#Ir] : [e2 / this.#Ir, e2 / this.#Rr];
  }
  #Br() {
    const [t2, e2, i2, s2] = this.#pa, [n2, a2] = this.#Hr(0);
    return [t2 + n2, e2 + a2, i2 - 2 * n2, s2 - 2 * a2];
  }
  #Nr() {
    const t2 = this.#pa = new Float32Array([1 / 0, 1 / 0, -1 / 0, -1 / 0]);
    for (const { line: e3 } of this.#Pr) {
      if (e3.length <= 12) {
        for (let i4 = 4, s3 = e3.length; i4 < s3; i4 += 6) {
          const [s4, n2] = e3.subarray(i4, i4 + 2);
          t2[0] = Math.min(t2[0], s4);
          t2[1] = Math.min(t2[1], n2);
          t2[2] = Math.max(t2[2], s4);
          t2[3] = Math.max(t2[3], n2);
        }
        continue;
      }
      let i3 = e3[4], s2 = e3[5];
      for (let n2 = 6, a2 = e3.length; n2 < a2; n2 += 6) {
        const [a3, r2, o2, l2, h2, d2] = e3.subarray(n2, n2 + 6);
        Util.bezierBoundingBox(i3, s2, a3, r2, o2, l2, h2, d2, t2);
        i3 = h2;
        s2 = d2;
      }
    }
    const [e2, i2] = this.#Hr();
    t2[0] = Math.min(1, Math.max(0, t2[0] - e2));
    t2[1] = Math.min(1, Math.max(0, t2[1] - i2));
    t2[2] = Math.min(1, Math.max(0, t2[2] + e2));
    t2[3] = Math.min(1, Math.max(0, t2[3] + i2));
    t2[2] -= t2[0];
    t2[3] -= t2[1];
  }
  get box() {
    return this.#pa;
  }
  updateProperty(t2, e2) {
    return "stroke-width" === t2 ? this.#sr(e2) : null;
  }
  #sr(t2) {
    const [e2, i2] = this.#Hr();
    this.#ea = t2;
    const [s2, n2] = this.#Hr(), [a2, r2] = [s2 - e2, n2 - i2], o2 = this.#pa;
    o2[0] -= a2;
    o2[1] -= r2;
    o2[2] += 2 * a2;
    o2[3] += 2 * r2;
    return o2;
  }
  updateParentDimensions([t2, e2], i2) {
    const [s2, n2] = this.#Hr();
    this.#Rr = t2;
    this.#Ir = e2;
    this.#Or = i2;
    const [a2, r2] = this.#Hr(), o2 = a2 - s2, l2 = r2 - n2, h2 = this.#pa;
    h2[0] -= o2;
    h2[1] -= l2;
    h2[2] += 2 * o2;
    h2[3] += 2 * l2;
    return h2;
  }
  updateRotation(t2) {
    this.#Lr = t2;
    return { path: { transform: this.rotationTransform } };
  }
  get viewBox() {
    return this.#pa.map(Outline.svgRound).join(" ");
  }
  get defaultProperties() {
    const [t2, e2] = this.#pa;
    return { root: { viewBox: this.viewBox }, path: { "transform-origin": `${Outline.svgRound(t2)} ${Outline.svgRound(e2)}` } };
  }
  get rotationTransform() {
    const [, , t2, e2] = this.#pa;
    let i2 = 0, s2 = 0, n2 = 0, a2 = 0, r2 = 0, o2 = 0;
    switch (this.#Lr) {
      case 90:
        s2 = e2 / t2;
        n2 = -t2 / e2;
        r2 = t2;
        break;
      case 180:
        i2 = -1;
        a2 = -1;
        r2 = t2;
        o2 = e2;
        break;
      case 270:
        s2 = -e2 / t2;
        n2 = t2 / e2;
        o2 = e2;
        break;
      default:
        return "";
    }
    return `matrix(${i2} ${s2} ${n2} ${a2} ${Outline.svgRound(r2)} ${Outline.svgRound(o2)})`;
  }
  getPathResizingSVGProperties([t2, e2, i2, s2]) {
    const [n2, a2] = this.#Hr(), [r2, o2, l2, h2] = this.#pa;
    if (Math.abs(l2 - n2) <= Outline.PRECISION || Math.abs(h2 - a2) <= Outline.PRECISION) {
      const n3 = t2 + i2 / 2 - (r2 + l2 / 2), a3 = e2 + s2 / 2 - (o2 + h2 / 2);
      return { path: { "transform-origin": `${Outline.svgRound(t2)} ${Outline.svgRound(e2)}`, transform: `${this.rotationTransform} translate(${n3} ${a3})` } };
    }
    const d2 = (i2 - 2 * n2) / (l2 - 2 * n2), c2 = (s2 - 2 * a2) / (h2 - 2 * a2), u2 = l2 / i2, p2 = h2 / s2;
    return { path: { "transform-origin": `${Outline.svgRound(r2)} ${Outline.svgRound(o2)}`, transform: `${this.rotationTransform} scale(${u2} ${p2}) translate(${Outline.svgRound(n2)} ${Outline.svgRound(a2)}) scale(${d2} ${c2}) translate(${Outline.svgRound(-n2)} ${Outline.svgRound(-a2)})` } };
  }
  getPathResizedSVGProperties([t2, e2, i2, s2]) {
    const [n2, a2] = this.#Hr(), r2 = this.#pa, [o2, l2, h2, d2] = r2;
    r2[0] = t2;
    r2[1] = e2;
    r2[2] = i2;
    r2[3] = s2;
    if (Math.abs(h2 - n2) <= Outline.PRECISION || Math.abs(d2 - a2) <= Outline.PRECISION) {
      const n3 = t2 + i2 / 2 - (o2 + h2 / 2), a3 = e2 + s2 / 2 - (l2 + d2 / 2);
      for (const { line: t3, points: e3 } of this.#Pr) {
        Outline._translate(t3, n3, a3, t3);
        Outline._translate(e3, n3, a3, e3);
      }
      return { root: { viewBox: this.viewBox }, path: { "transform-origin": `${Outline.svgRound(t2)} ${Outline.svgRound(e2)}`, transform: this.rotationTransform || null, d: this.toSVGPath() } };
    }
    const c2 = (i2 - 2 * n2) / (h2 - 2 * n2), u2 = (s2 - 2 * a2) / (d2 - 2 * a2), p2 = -c2 * (o2 + n2) + t2 + n2, g2 = -u2 * (l2 + a2) + e2 + a2;
    if (1 !== c2 || 1 !== u2 || 0 !== p2 || 0 !== g2) for (const { line: t3, points: e3 } of this.#Pr) {
      Outline._rescale(t3, p2, g2, c2, u2, t3);
      Outline._rescale(e3, p2, g2, c2, u2, e3);
    }
    return { root: { viewBox: this.viewBox }, path: { "transform-origin": `${Outline.svgRound(t2)} ${Outline.svgRound(e2)}`, transform: this.rotationTransform || null, d: this.toSVGPath() } };
  }
  getPathTranslatedSVGProperties([t2, e2], i2) {
    const [s2, n2] = i2, a2 = this.#pa, r2 = t2 - a2[0], o2 = e2 - a2[1];
    if (this.#Rr === s2 && this.#Ir === n2) for (const { line: t3, points: e3 } of this.#Pr) {
      Outline._translate(t3, r2, o2, t3);
      Outline._translate(e3, r2, o2, e3);
    }
    else {
      const t3 = this.#Rr / s2, e3 = this.#Ir / n2;
      this.#Rr = s2;
      this.#Ir = n2;
      for (const { line: i3, points: s3 } of this.#Pr) {
        Outline._rescale(i3, r2, o2, t3, e3, i3);
        Outline._rescale(s3, r2, o2, t3, e3, s3);
      }
      a2[2] *= t3;
      a2[3] *= e3;
    }
    a2[0] = t2;
    a2[1] = e2;
    return { root: { viewBox: this.viewBox }, path: { d: this.toSVGPath(), "transform-origin": `${Outline.svgRound(t2)} ${Outline.svgRound(e2)}` } };
  }
  get defaultSVGProperties() {
    const t2 = this.#pa;
    return { root: { viewBox: this.viewBox }, rootClass: { draw: true }, path: { d: this.toSVGPath(), "transform-origin": `${Outline.svgRound(t2[0])} ${Outline.svgRound(t2[1])}`, transform: this.rotationTransform || null }, bbox: t2 };
  }
};
var InkDrawingOptions = class _InkDrawingOptions extends DrawingOptions {
  #zr;
  constructor(t2) {
    super();
    this.#zr = t2;
    super.updateProperties({ fill: "none", stroke: AnnotationEditor._defaultLineColor, "stroke-opacity": 1, "stroke-width": 1, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-miterlimit": 10 });
  }
  updateSVGProperty(t2, e2) {
    if ("stroke-width" === t2) {
      e2 ??= this["stroke-width"];
      e2 *= this.#zr.realScale;
    }
    super.updateSVGProperty(t2, e2);
  }
  clone() {
    const t2 = new _InkDrawingOptions(this.#zr);
    t2.updateAll(this);
    return t2;
  }
};
var InkEditor = class _InkEditor extends DrawingEditor {
  static _type = "ink";
  static _editorType = g.INK;
  static _defaultDrawingOptions = null;
  constructor(t2) {
    super({ ...t2, name: "inkEditor" });
    this._willKeepAspectRatio = true;
  }
  static initialize(t2, e2) {
    AnnotationEditor.initialize(t2, e2);
    this._defaultDrawingOptions = new InkDrawingOptions(e2.viewParameters);
  }
  static getDefaultDrawingOptions(t2) {
    const e2 = this._defaultDrawingOptions.clone();
    e2.updateProperties(t2);
    return e2;
  }
  static get supportMultipleDrawings() {
    return true;
  }
  static get typesMap() {
    return shadow(this, "typesMap", /* @__PURE__ */ new Map([[m.INK_THICKNESS, "stroke-width"], [m.INK_COLOR, "stroke"], [m.INK_OPACITY, "stroke-opacity"]]));
  }
  static createDrawerInstance(t2, e2, i2, s2, n2) {
    return new InkDrawOutliner(t2, e2, i2, s2, n2, this._defaultDrawingOptions["stroke-width"]);
  }
  static deserializeDraw(t2, e2, i2, s2, n2, a2) {
    return InkDrawOutline.deserialize(t2, e2, i2, s2, n2, a2);
  }
  static async deserialize(t2, e2, i2) {
    let s2 = null;
    if (t2 instanceof InkAnnotationElement) {
      const { data: { inkLists: e3, rect: i3, rotation: n3, id: a2, color: r2, opacity: o2, borderStyle: { rawWidth: l2 }, popupRef: h2 }, parent: { page: { pageNumber: d2 } } } = t2;
      s2 = t2 = { annotationType: g.INK, color: Array.from(r2), thickness: l2, opacity: o2, paths: { points: e3 }, boxes: null, pageIndex: d2 - 1, rect: i3.slice(0), rotation: n3, id: a2, deleted: false, popupRef: h2 };
    }
    const n2 = await super.deserialize(t2, e2, i2);
    n2.annotationElementId = t2.id || null;
    n2._initialData = s2;
    return n2;
  }
  onScaleChanging() {
    if (!this.parent) return;
    super.onScaleChanging();
    const { _drawId: t2, _drawingOptions: e2, parent: i2 } = this;
    e2.updateSVGProperty("stroke-width");
    i2.drawLayer.updateProperties(t2, e2.toSVGProperties());
  }
  static onScaleChangingWhenDrawing() {
    const t2 = this._currentParent;
    if (t2) {
      super.onScaleChangingWhenDrawing();
      this._defaultDrawingOptions.updateSVGProperty("stroke-width");
      t2.drawLayer.updateProperties(this._currentDrawId, this._defaultDrawingOptions.toSVGProperties());
    }
  }
  createDrawingOptions({ color: t2, thickness: e2, opacity: i2 }) {
    this._drawingOptions = _InkEditor.getDefaultDrawingOptions({ stroke: Util.makeHexColor(...t2), "stroke-width": e2, "stroke-opacity": i2 });
  }
  serialize(t2 = false) {
    if (this.isEmpty()) return null;
    if (this.deleted) return this.serializeDeleted();
    const { lines: e2, points: i2, rect: s2 } = this.serializeDraw(t2), { _drawingOptions: { stroke: n2, "stroke-opacity": a2, "stroke-width": r2 } } = this, o2 = { annotationType: g.INK, color: AnnotationEditor._colorManager.convert(n2), opacity: a2, thickness: r2, paths: { lines: e2, points: i2 }, pageIndex: this.pageIndex, rect: s2, rotation: this.rotation, structTreeParentId: this._structTreeParentId };
    if (t2) return o2;
    if (this.annotationElementId && !this.#$n(o2)) return null;
    o2.id = this.annotationElementId;
    return o2;
  }
  #$n(t2) {
    const { color: e2, thickness: i2, opacity: s2, pageIndex: n2 } = this._initialData;
    return this._hasBeenMoved || this._hasBeenResized || t2.color.some(((t3, i3) => t3 !== e2[i3])) || t2.thickness !== i2 || t2.opacity !== s2 || t2.pageIndex !== n2;
  }
  renderAnnotationElement(t2) {
    const { points: e2, rect: i2 } = this.serializeDraw(false);
    t2.updateEdited({ rect: i2, thickness: this._drawingOptions["stroke-width"], points: e2 });
    return null;
  }
};
var StampEditor = class _StampEditor extends AnnotationEditor {
  #Ur = null;
  #Gr = null;
  #$r = null;
  #Vr = null;
  #jr = null;
  #Wr = "";
  #qr = null;
  #Xr = null;
  #Kr = false;
  #Yr = false;
  static _type = "stamp";
  static _editorType = g.STAMP;
  constructor(t2) {
    super({ ...t2, name: "stampEditor" });
    this.#Vr = t2.bitmapUrl;
    this.#jr = t2.bitmapFile;
  }
  static initialize(t2, e2) {
    AnnotationEditor.initialize(t2, e2);
  }
  static get supportedTypes() {
    return shadow(this, "supportedTypes", ["apng", "avif", "bmp", "gif", "jpeg", "png", "svg+xml", "webp", "x-icon"].map(((t2) => `image/${t2}`)));
  }
  static get supportedTypesStr() {
    return shadow(this, "supportedTypesStr", this.supportedTypes.join(","));
  }
  static isHandlingMimeForPasting(t2) {
    return this.supportedTypes.includes(t2);
  }
  static paste(t2, e2) {
    e2.pasteEditor(g.STAMP, { bitmapFile: t2.getAsFile() });
  }
  altTextFinish() {
    this._uiManager.useNewAltTextFlow && (this.div.hidden = false);
    super.altTextFinish();
  }
  get telemetryFinalData() {
    return { type: "stamp", hasAltText: !!this.altTextData?.altText };
  }
  static computeTelemetryFinalData(t2) {
    const e2 = t2.get("hasAltText");
    return { hasAltText: e2.get(true) ?? 0, hasNoAltText: e2.get(false) ?? 0 };
  }
  #Qr(t2, e2 = false) {
    if (t2) {
      this.#Ur = t2.bitmap;
      if (!e2) {
        this.#Gr = t2.id;
        this.#Kr = t2.isSvg;
      }
      t2.file && (this.#Wr = t2.file.name);
      this.#Jr();
    } else this.remove();
  }
  #Zr() {
    this.#$r = null;
    this._uiManager.enableWaiting(false);
    if (this.#qr) if (this._uiManager.useNewAltTextWhenAddingImage && this._uiManager.useNewAltTextFlow && this.#Ur) {
      this._editToolbar.hide();
      this._uiManager.editAltText(this, true);
    } else {
      if (!this._uiManager.useNewAltTextWhenAddingImage && this._uiManager.useNewAltTextFlow && this.#Ur) {
        this._reportTelemetry({ action: "pdfjs.image.image_added", data: { alt_text_modal: false, alt_text_type: "empty" } });
        try {
          this.mlGuessAltText();
        } catch {
        }
      }
      this.div.focus();
    }
  }
  async mlGuessAltText(t2 = null, e2 = true) {
    if (this.hasAltTextData()) return null;
    const { mlManager: i2 } = this._uiManager;
    if (!i2) throw new Error("No ML.");
    if (!await i2.isEnabledFor("altText")) throw new Error("ML isn't enabled for alt text.");
    const { data: s2, width: n2, height: a2 } = t2 || this.copyCanvas(null, null, true).imageData, r2 = await i2.guess({ name: "altText", request: { data: s2, width: n2, height: a2, channels: s2.length / (n2 * a2) } });
    if (!r2) throw new Error("No response from the AI service.");
    if (r2.error) throw new Error("Error from the AI service.");
    if (r2.cancel) return null;
    if (!r2.output) throw new Error("No valid response from the AI service.");
    const o2 = r2.output;
    await this.setGuessedAltText(o2);
    e2 && !this.hasAltTextData() && (this.altTextData = { alt: o2, decorative: false });
    return o2;
  }
  #to() {
    if (this.#Gr) {
      this._uiManager.enableWaiting(true);
      this._uiManager.imageManager.getFromId(this.#Gr).then(((t3) => this.#Qr(t3, true))).finally((() => this.#Zr()));
      return;
    }
    if (this.#Vr) {
      const t3 = this.#Vr;
      this.#Vr = null;
      this._uiManager.enableWaiting(true);
      this.#$r = this._uiManager.imageManager.getFromUrl(t3).then(((t4) => this.#Qr(t4))).finally((() => this.#Zr()));
      return;
    }
    if (this.#jr) {
      const t3 = this.#jr;
      this.#jr = null;
      this._uiManager.enableWaiting(true);
      this.#$r = this._uiManager.imageManager.getFromFile(t3).then(((t4) => this.#Qr(t4))).finally((() => this.#Zr()));
      return;
    }
    const t2 = document.createElement("input");
    t2.type = "file";
    t2.accept = _StampEditor.supportedTypesStr;
    const e2 = this._uiManager._signal;
    this.#$r = new Promise(((i2) => {
      t2.addEventListener("change", (async () => {
        if (t2.files && 0 !== t2.files.length) {
          this._uiManager.enableWaiting(true);
          const e3 = await this._uiManager.imageManager.getFromFile(t2.files[0]);
          this._reportTelemetry({ action: "pdfjs.image.image_selected", data: { alt_text_modal: this._uiManager.useNewAltTextFlow } });
          this.#Qr(e3);
        } else this.remove();
        i2();
      }), { signal: e2 });
      t2.addEventListener("cancel", (() => {
        this.remove();
        i2();
      }), { signal: e2 });
    })).finally((() => this.#Zr()));
    t2.click();
  }
  remove() {
    if (this.#Gr) {
      this.#Ur = null;
      this._uiManager.imageManager.deleteId(this.#Gr);
      this.#qr?.remove();
      this.#qr = null;
      if (this.#Xr) {
        clearTimeout(this.#Xr);
        this.#Xr = null;
      }
    }
    super.remove();
  }
  rebuild() {
    if (this.parent) {
      super.rebuild();
      if (null !== this.div) {
        this.#Gr && null === this.#qr && this.#to();
        this.isAttachedToDOM || this.parent.add(this);
      }
    } else this.#Gr && this.#to();
  }
  onceAdded(t2) {
    this._isDraggable = true;
    t2 && this.div.focus();
  }
  isEmpty() {
    return !(this.#$r || this.#Ur || this.#Vr || this.#jr || this.#Gr);
  }
  get isResizable() {
    return true;
  }
  render() {
    if (this.div) return this.div;
    let t2, e2;
    if (this.width) {
      t2 = this.x;
      e2 = this.y;
    }
    super.render();
    this.div.hidden = true;
    this.div.setAttribute("role", "figure");
    this.addAltTextButton();
    this.#Ur ? this.#Jr() : this.#to();
    if (this.width && !this.annotationElementId) {
      const [i2, s2] = this.parentDimensions;
      this.setAt(t2 * i2, e2 * s2, this.width * i2, this.height * s2);
    }
    this._uiManager.addShouldRescale(this);
    return this.div;
  }
  _onResized() {
    this.onScaleChanging();
  }
  onScaleChanging() {
    if (!this.parent) return;
    null !== this.#Xr && clearTimeout(this.#Xr);
    this.#Xr = setTimeout((() => {
      this.#Xr = null;
      this.#eo();
    }), 200);
  }
  #Jr() {
    const { div: t2 } = this;
    let { width: e2, height: i2 } = this.#Ur;
    const [s2, n2] = this.pageDimensions, a2 = 0.75;
    if (this.width) {
      e2 = this.width * s2;
      i2 = this.height * n2;
    } else if (e2 > a2 * s2 || i2 > a2 * n2) {
      const t3 = Math.min(a2 * s2 / e2, a2 * n2 / i2);
      e2 *= t3;
      i2 *= t3;
    }
    const [r2, o2] = this.parentDimensions;
    this.setDims(e2 * r2 / s2, i2 * o2 / n2);
    this._uiManager.enableWaiting(false);
    const l2 = this.#qr = document.createElement("canvas");
    l2.setAttribute("role", "img");
    this.addContainer(l2);
    this.width = e2 / s2;
    this.height = i2 / n2;
    this._initialOptions?.isCentered ? this.center() : this.fixAndSetPosition();
    this._initialOptions = null;
    this._uiManager.useNewAltTextWhenAddingImage && this._uiManager.useNewAltTextFlow && !this.annotationElementId || (t2.hidden = false);
    this.#eo();
    if (!this.#Yr) {
      this.parent.addUndoableEditor(this);
      this.#Yr = true;
    }
    this._reportTelemetry({ action: "inserted_image" });
    this.#Wr && l2.setAttribute("aria-label", this.#Wr);
  }
  copyCanvas(t2, e2, i2 = false) {
    t2 || (t2 = 224);
    const { width: s2, height: n2 } = this.#Ur, a2 = new OutputScale();
    let r2 = this.#Ur, o2 = s2, l2 = n2, h2 = null;
    if (e2) {
      if (s2 > e2 || n2 > e2) {
        const t4 = Math.min(e2 / s2, e2 / n2);
        o2 = Math.floor(s2 * t4);
        l2 = Math.floor(n2 * t4);
      }
      h2 = document.createElement("canvas");
      const t3 = h2.width = Math.ceil(o2 * a2.sx), i3 = h2.height = Math.ceil(l2 * a2.sy);
      this.#Kr || (r2 = this.#io(t3, i3));
      const d3 = h2.getContext("2d");
      d3.filter = this._uiManager.hcmFilter;
      let c2 = "white", u2 = "#cfcfd8";
      if ("none" !== this._uiManager.hcmFilter) u2 = "black";
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        c2 = "#8f8f9d";
        u2 = "#42414d";
      }
      const p2 = 15, g2 = p2 * a2.sx, m2 = p2 * a2.sy, f2 = new OffscreenCanvas(2 * g2, 2 * m2), b2 = f2.getContext("2d");
      b2.fillStyle = c2;
      b2.fillRect(0, 0, 2 * g2, 2 * m2);
      b2.fillStyle = u2;
      b2.fillRect(0, 0, g2, m2);
      b2.fillRect(g2, m2, g2, m2);
      d3.fillStyle = d3.createPattern(f2, "repeat");
      d3.fillRect(0, 0, t3, i3);
      d3.drawImage(r2, 0, 0, r2.width, r2.height, 0, 0, t3, i3);
    }
    let d2 = null;
    if (i2) {
      let e3, i3;
      if (a2.symmetric && r2.width < t2 && r2.height < t2) {
        e3 = r2.width;
        i3 = r2.height;
      } else {
        r2 = this.#Ur;
        if (s2 > t2 || n2 > t2) {
          const a3 = Math.min(t2 / s2, t2 / n2);
          e3 = Math.floor(s2 * a3);
          i3 = Math.floor(n2 * a3);
          this.#Kr || (r2 = this.#io(e3, i3));
        }
      }
      const o3 = new OffscreenCanvas(e3, i3).getContext("2d", { willReadFrequently: true });
      o3.drawImage(r2, 0, 0, r2.width, r2.height, 0, 0, e3, i3);
      d2 = { width: e3, height: i3, data: o3.getImageData(0, 0, e3, i3).data };
    }
    return { canvas: h2, width: o2, height: l2, imageData: d2 };
  }
  #io(t2, e2) {
    const { width: i2, height: s2 } = this.#Ur;
    let n2 = i2, a2 = s2, r2 = this.#Ur;
    for (; n2 > 2 * t2 || a2 > 2 * e2; ) {
      const i3 = n2, s3 = a2;
      n2 > 2 * t2 && (n2 = n2 >= 16384 ? Math.floor(n2 / 2) - 1 : Math.ceil(n2 / 2));
      a2 > 2 * e2 && (a2 = a2 >= 16384 ? Math.floor(a2 / 2) - 1 : Math.ceil(a2 / 2));
      const o2 = new OffscreenCanvas(n2, a2);
      o2.getContext("2d").drawImage(r2, 0, 0, i3, s3, 0, 0, n2, a2);
      r2 = o2.transferToImageBitmap();
    }
    return r2;
  }
  #eo() {
    const [t2, e2] = this.parentDimensions, { width: i2, height: s2 } = this, n2 = new OutputScale(), a2 = Math.ceil(i2 * t2 * n2.sx), r2 = Math.ceil(s2 * e2 * n2.sy), o2 = this.#qr;
    if (!o2 || o2.width === a2 && o2.height === r2) return;
    o2.width = a2;
    o2.height = r2;
    const l2 = this.#Kr ? this.#Ur : this.#io(a2, r2), h2 = o2.getContext("2d");
    h2.filter = this._uiManager.hcmFilter;
    h2.drawImage(l2, 0, 0, l2.width, l2.height, 0, 0, a2, r2);
  }
  getImageForAltText() {
    return this.#qr;
  }
  #so(t2) {
    if (t2) {
      if (this.#Kr) {
        const t4 = this._uiManager.imageManager.getSvgUrl(this.#Gr);
        if (t4) return t4;
      }
      const t3 = document.createElement("canvas");
      ({ width: t3.width, height: t3.height } = this.#Ur);
      t3.getContext("2d").drawImage(this.#Ur, 0, 0);
      return t3.toDataURL();
    }
    if (this.#Kr) {
      const [t3, e2] = this.pageDimensions, i2 = Math.round(this.width * t3 * PixelsPerInch.PDF_TO_CSS_UNITS), s2 = Math.round(this.height * e2 * PixelsPerInch.PDF_TO_CSS_UNITS), n2 = new OffscreenCanvas(i2, s2);
      n2.getContext("2d").drawImage(this.#Ur, 0, 0, this.#Ur.width, this.#Ur.height, 0, 0, i2, s2);
      return n2.transferToImageBitmap();
    }
    return structuredClone(this.#Ur);
  }
  static async deserialize(t2, e2, i2) {
    let s2 = null;
    if (t2 instanceof StampAnnotationElement) {
      const { data: { rect: n3, rotation: a3, id: r3, structParent: o3, popupRef: l3 }, container: h3, parent: { page: { pageNumber: d3 } } } = t2, c3 = h3.querySelector("canvas"), u3 = i2.imageManager.getFromCanvas(h3.id, c3);
      c3.remove();
      const p2 = (await e2._structTree.getAriaAttributes(`${et}${r3}`))?.get("aria-label") || "";
      s2 = t2 = { annotationType: g.STAMP, bitmapId: u3.id, bitmap: u3.bitmap, pageIndex: d3 - 1, rect: n3.slice(0), rotation: a3, id: r3, deleted: false, accessibilityData: { decorative: false, altText: p2 }, isSvg: false, structParent: o3, popupRef: l3 };
    }
    const n2 = await super.deserialize(t2, e2, i2), { rect: a2, bitmap: r2, bitmapUrl: o2, bitmapId: l2, isSvg: h2, accessibilityData: d2 } = t2;
    if (l2 && i2.imageManager.isValidId(l2)) {
      n2.#Gr = l2;
      r2 && (n2.#Ur = r2);
    } else n2.#Vr = o2;
    n2.#Kr = h2;
    const [c2, u2] = n2.pageDimensions;
    n2.width = (a2[2] - a2[0]) / c2;
    n2.height = (a2[3] - a2[1]) / u2;
    n2.annotationElementId = t2.id || null;
    d2 && (n2.altTextData = d2);
    n2._initialData = s2;
    n2.#Yr = !!s2;
    return n2;
  }
  serialize(t2 = false, e2 = null) {
    if (this.isEmpty()) return null;
    if (this.deleted) return this.serializeDeleted();
    const i2 = { annotationType: g.STAMP, bitmapId: this.#Gr, pageIndex: this.pageIndex, rect: this.getRect(0, 0), rotation: this.rotation, isSvg: this.#Kr, structTreeParentId: this._structTreeParentId };
    if (t2) {
      i2.bitmapUrl = this.#so(true);
      i2.accessibilityData = this.serializeAltText(true);
      return i2;
    }
    const { decorative: s2, altText: n2 } = this.serializeAltText(false);
    !s2 && n2 && (i2.accessibilityData = { type: "Figure", alt: n2 });
    if (this.annotationElementId) {
      const t3 = this.#$n(i2);
      if (t3.isSame) return null;
      t3.isSameAltText ? delete i2.accessibilityData : i2.accessibilityData.structParent = this._initialData.structParent ?? -1;
    }
    i2.id = this.annotationElementId;
    if (null === e2) return i2;
    e2.stamps ||= /* @__PURE__ */ new Map();
    const a2 = this.#Kr ? (i2.rect[2] - i2.rect[0]) * (i2.rect[3] - i2.rect[1]) : null;
    if (e2.stamps.has(this.#Gr)) {
      if (this.#Kr) {
        const t3 = e2.stamps.get(this.#Gr);
        if (a2 > t3.area) {
          t3.area = a2;
          t3.serialized.bitmap.close();
          t3.serialized.bitmap = this.#so(false);
        }
      }
    } else {
      e2.stamps.set(this.#Gr, { area: a2, serialized: i2 });
      i2.bitmap = this.#so(false);
    }
    return i2;
  }
  #$n(t2) {
    const { pageIndex: e2, accessibilityData: { altText: i2 } } = this._initialData, s2 = t2.pageIndex === e2, n2 = (t2.accessibilityData?.alt || "") === i2;
    return { isSame: !this._hasBeenMoved && !this._hasBeenResized && s2 && n2, isSameAltText: n2 };
  }
  renderAnnotationElement(t2) {
    t2.updateEdited({ rect: this.getRect(0, 0) });
    return null;
  }
};
var AnnotationEditorLayer = class _AnnotationEditorLayer {
  #Cn;
  #no = false;
  #ao = null;
  #ro = null;
  #oo = null;
  #lo = /* @__PURE__ */ new Map();
  #ho = false;
  #do = false;
  #co = false;
  #uo = null;
  #po = null;
  #go = null;
  #mo = null;
  #m;
  static _initialized = false;
  static #U = new Map([FreeTextEditor, InkEditor, StampEditor, HighlightEditor].map(((t2) => [t2._editorType, t2])));
  constructor({ uiManager: t2, pageIndex: e2, div: i2, structTreeLayer: s2, accessibilityManager: n2, annotationLayer: a2, drawLayer: r2, textLayer: o2, viewport: l2, l10n: h2 }) {
    const d2 = [..._AnnotationEditorLayer.#U.values()];
    if (!_AnnotationEditorLayer._initialized) {
      _AnnotationEditorLayer._initialized = true;
      for (const e3 of d2) e3.initialize(h2, t2);
    }
    t2.registerEditorTypes(d2);
    this.#m = t2;
    this.pageIndex = e2;
    this.div = i2;
    this.#Cn = n2;
    this.#ao = a2;
    this.viewport = l2;
    this.#go = o2;
    this.drawLayer = r2;
    this._structTree = s2;
    this.#m.addLayer(this);
  }
  get isEmpty() {
    return 0 === this.#lo.size;
  }
  get isInvisible() {
    return this.isEmpty && this.#m.getMode() === g.NONE;
  }
  updateToolbar(t2) {
    this.#m.updateToolbar(t2);
  }
  updateMode(t2 = this.#m.getMode()) {
    this.#fo();
    switch (t2) {
      case g.NONE:
        this.disableTextSelection();
        this.togglePointerEvents(false);
        this.toggleAnnotationLayerPointerEvents(true);
        this.disableClick();
        return;
      case g.INK:
        this.disableTextSelection();
        this.togglePointerEvents(true);
        this.enableClick();
        break;
      case g.HIGHLIGHT:
        this.enableTextSelection();
        this.togglePointerEvents(false);
        this.disableClick();
        break;
      default:
        this.disableTextSelection();
        this.togglePointerEvents(true);
        this.enableClick();
    }
    this.toggleAnnotationLayerPointerEvents(false);
    const { classList: e2 } = this.div;
    for (const i2 of _AnnotationEditorLayer.#U.values()) e2.toggle(`${i2._type}Editing`, t2 === i2._editorType);
    this.div.hidden = false;
  }
  hasTextLayer(t2) {
    return t2 === this.#go?.div;
  }
  setEditingState(t2) {
    this.#m.setEditingState(t2);
  }
  addCommands(t2) {
    this.#m.addCommands(t2);
  }
  cleanUndoStack(t2) {
    this.#m.cleanUndoStack(t2);
  }
  toggleDrawing(t2 = false) {
    this.div.classList.toggle("drawing", !t2);
  }
  togglePointerEvents(t2 = false) {
    this.div.classList.toggle("disabled", !t2);
  }
  toggleAnnotationLayerPointerEvents(t2 = false) {
    this.#ao?.div.classList.toggle("disabled", !t2);
  }
  async enable() {
    this.#co = true;
    this.div.tabIndex = 0;
    this.togglePointerEvents(true);
    const t2 = /* @__PURE__ */ new Set();
    for (const e3 of this.#lo.values()) {
      e3.enableEditing();
      e3.show(true);
      if (e3.annotationElementId) {
        this.#m.removeChangedExistingAnnotation(e3);
        t2.add(e3.annotationElementId);
      }
    }
    if (!this.#ao) {
      this.#co = false;
      return;
    }
    const e2 = this.#ao.getEditableAnnotations();
    for (const i2 of e2) {
      i2.hide();
      if (this.#m.isDeletedAnnotationElement(i2.data.id)) continue;
      if (t2.has(i2.data.id)) continue;
      const e3 = await this.deserialize(i2);
      if (e3) {
        this.addOrRebuild(e3);
        e3.enableEditing();
      }
    }
    this.#co = false;
  }
  disable() {
    this.#do = true;
    this.div.tabIndex = -1;
    this.togglePointerEvents(false);
    const t2 = /* @__PURE__ */ new Map(), e2 = /* @__PURE__ */ new Map();
    for (const i3 of this.#lo.values()) {
      i3.disableEditing();
      if (i3.annotationElementId) if (null === i3.serialize()) {
        e2.set(i3.annotationElementId, i3);
        this.getEditableAnnotation(i3.annotationElementId)?.show();
        i3.remove();
      } else t2.set(i3.annotationElementId, i3);
    }
    if (this.#ao) {
      const i3 = this.#ao.getEditableAnnotations();
      for (const s2 of i3) {
        const { id: i4 } = s2.data;
        if (this.#m.isDeletedAnnotationElement(i4)) continue;
        let n2 = e2.get(i4);
        if (n2) {
          n2.resetAnnotationElement(s2);
          n2.show(false);
          s2.show();
        } else {
          n2 = t2.get(i4);
          if (n2) {
            this.#m.addChangedExistingAnnotation(n2);
            n2.renderAnnotationElement(s2) && n2.show(false);
          }
          s2.show();
        }
      }
    }
    this.#fo();
    this.isEmpty && (this.div.hidden = true);
    const { classList: i2 } = this.div;
    for (const t3 of _AnnotationEditorLayer.#U.values()) i2.remove(`${t3._type}Editing`);
    this.disableTextSelection();
    this.toggleAnnotationLayerPointerEvents(true);
    this.#do = false;
  }
  getEditableAnnotation(t2) {
    return this.#ao?.getEditableAnnotation(t2) || null;
  }
  setActiveEditor(t2) {
    this.#m.getActive() !== t2 && this.#m.setActiveEditor(t2);
  }
  enableTextSelection() {
    this.div.tabIndex = -1;
    if (this.#go?.div && !this.#mo) {
      this.#mo = new AbortController();
      const t2 = this.#m.combinedSignal(this.#mo);
      this.#go.div.addEventListener("pointerdown", this.#bo.bind(this), { signal: t2 });
      this.#go.div.classList.add("highlighting");
    }
  }
  disableTextSelection() {
    this.div.tabIndex = 0;
    if (this.#go?.div && this.#mo) {
      this.#mo.abort();
      this.#mo = null;
      this.#go.div.classList.remove("highlighting");
    }
  }
  #bo(t2) {
    this.#m.unselectAll();
    const { target: e2 } = t2;
    if (e2 === this.#go.div || ("img" === e2.getAttribute("role") || e2.classList.contains("endOfContent")) && this.#go.div.contains(e2)) {
      const { isMac: e3 } = util_FeatureTest.platform;
      if (0 !== t2.button || t2.ctrlKey && e3) return;
      this.#m.showAllEditors("highlight", true, true);
      this.#go.div.classList.add("free");
      this.toggleDrawing();
      HighlightEditor.startHighlighting(this, "ltr" === this.#m.direction, { target: this.#go.div, x: t2.x, y: t2.y });
      this.#go.div.addEventListener("pointerup", (() => {
        this.#go.div.classList.remove("free");
        this.toggleDrawing(true);
      }), { once: true, signal: this.#m._signal });
      t2.preventDefault();
    }
  }
  enableClick() {
    if (this.#ro) return;
    this.#ro = new AbortController();
    const t2 = this.#m.combinedSignal(this.#ro);
    this.div.addEventListener("pointerdown", this.pointerdown.bind(this), { signal: t2 });
    const e2 = this.pointerup.bind(this);
    this.div.addEventListener("pointerup", e2, { signal: t2 });
    this.div.addEventListener("pointercancel", e2, { signal: t2 });
  }
  disableClick() {
    this.#ro?.abort();
    this.#ro = null;
  }
  attach(t2) {
    this.#lo.set(t2.id, t2);
    const { annotationElementId: e2 } = t2;
    e2 && this.#m.isDeletedAnnotationElement(e2) && this.#m.removeDeletedAnnotationElement(t2);
  }
  detach(t2) {
    this.#lo.delete(t2.id);
    this.#Cn?.removePointerInTextLayer(t2.contentDiv);
    !this.#do && t2.annotationElementId && this.#m.addDeletedAnnotationElement(t2);
  }
  remove(t2) {
    this.detach(t2);
    this.#m.removeEditor(t2);
    t2.div.remove();
    t2.isAttachedToDOM = false;
  }
  changeParent(t2) {
    if (t2.parent !== this) {
      if (t2.parent && t2.annotationElementId) {
        this.#m.addDeletedAnnotationElement(t2.annotationElementId);
        AnnotationEditor.deleteAnnotationElement(t2);
        t2.annotationElementId = null;
      }
      this.attach(t2);
      t2.parent?.detach(t2);
      t2.setParent(this);
      if (t2.div && t2.isAttachedToDOM) {
        t2.div.remove();
        this.div.append(t2.div);
      }
    }
  }
  add(t2) {
    if (t2.parent !== this || !t2.isAttachedToDOM) {
      this.changeParent(t2);
      this.#m.addEditor(t2);
      this.attach(t2);
      if (!t2.isAttachedToDOM) {
        const e2 = t2.render();
        this.div.append(e2);
        t2.isAttachedToDOM = true;
      }
      t2.fixAndSetPosition();
      t2.onceAdded(!this.#co);
      this.#m.addToAnnotationStorage(t2);
      t2._reportTelemetry(t2.telemetryInitialData);
    }
  }
  moveEditorInDOM(t2) {
    if (!t2.isAttachedToDOM) return;
    const { activeElement: e2 } = document;
    if (t2.div.contains(e2) && !this.#oo) {
      t2._focusEventsAllowed = false;
      this.#oo = setTimeout((() => {
        this.#oo = null;
        if (t2.div.contains(document.activeElement)) t2._focusEventsAllowed = true;
        else {
          t2.div.addEventListener("focusin", (() => {
            t2._focusEventsAllowed = true;
          }), { once: true, signal: this.#m._signal });
          e2.focus();
        }
      }), 0);
    }
    t2._structTreeParentId = this.#Cn?.moveElementInDOM(this.div, t2.div, t2.contentDiv, true);
  }
  addOrRebuild(t2) {
    if (t2.needsToBeRebuilt()) {
      t2.parent ||= this;
      t2.rebuild();
      t2.show();
    } else this.add(t2);
  }
  addUndoableEditor(t2) {
    this.addCommands({ cmd: () => t2._uiManager.rebuild(t2), undo: () => {
      t2.remove();
    }, mustExec: false });
  }
  getNextId() {
    return this.#m.getId();
  }
  get #Ao() {
    return _AnnotationEditorLayer.#U.get(this.#m.getMode());
  }
  combinedSignal(t2) {
    return this.#m.combinedSignal(t2);
  }
  #wo(t2) {
    const e2 = this.#Ao;
    return e2 ? new e2.prototype.constructor(t2) : null;
  }
  canCreateNewEmptyEditor() {
    return this.#Ao?.canCreateNewEmptyEditor();
  }
  pasteEditor(t2, e2) {
    this.#m.updateToolbar(t2);
    this.#m.updateMode(t2);
    const { offsetX: i2, offsetY: s2 } = this.#vo(), n2 = this.getNextId(), a2 = this.#wo({ parent: this, id: n2, x: i2, y: s2, uiManager: this.#m, isCentered: true, ...e2 });
    a2 && this.add(a2);
  }
  async deserialize(t2) {
    return await _AnnotationEditorLayer.#U.get(t2.annotationType ?? t2.annotationEditorType)?.deserialize(t2, this, this.#m) || null;
  }
  createAndAddNewEditor(t2, e2, i2 = {}) {
    const s2 = this.getNextId(), n2 = this.#wo({ parent: this, id: s2, x: t2.offsetX, y: t2.offsetY, uiManager: this.#m, isCentered: e2, ...i2 });
    n2 && this.add(n2);
    return n2;
  }
  #vo() {
    const { x: t2, y: e2, width: i2, height: s2 } = this.div.getBoundingClientRect(), n2 = Math.max(0, t2), a2 = Math.max(0, e2), r2 = (n2 + Math.min(window.innerWidth, t2 + i2)) / 2 - t2, o2 = (a2 + Math.min(window.innerHeight, e2 + s2)) / 2 - e2, [l2, h2] = this.viewport.rotation % 180 == 0 ? [r2, o2] : [o2, r2];
    return { offsetX: l2, offsetY: h2 };
  }
  addNewEditor() {
    this.createAndAddNewEditor(this.#vo(), true);
  }
  setSelected(t2) {
    this.#m.setSelected(t2);
  }
  toggleSelected(t2) {
    this.#m.toggleSelected(t2);
  }
  unselect(t2) {
    this.#m.unselect(t2);
  }
  pointerup(t2) {
    const { isMac: e2 } = util_FeatureTest.platform;
    if (!(0 !== t2.button || t2.ctrlKey && e2) && t2.target === this.div && this.#ho) {
      this.#ho = false;
      this.#Ao?.isDrawer && this.#Ao.supportMultipleDrawings || (this.#no ? this.#m.getMode() !== g.STAMP ? this.createAndAddNewEditor(t2, false) : this.#m.unselectAll() : this.#no = true);
    }
  }
  pointerdown(t2) {
    this.#m.getMode() === g.HIGHLIGHT && this.enableTextSelection();
    if (this.#ho) {
      this.#ho = false;
      return;
    }
    const { isMac: e2 } = util_FeatureTest.platform;
    if (0 !== t2.button || t2.ctrlKey && e2) return;
    if (t2.target !== this.div) return;
    this.#ho = true;
    if (this.#Ao?.isDrawer) {
      this.startDrawingSession(t2);
      return;
    }
    const i2 = this.#m.getActive();
    this.#no = !i2 || i2.isEmpty();
  }
  startDrawingSession(t2) {
    this.div.focus();
    if (this.#uo) {
      this.#Ao.startDrawing(this, this.#m, false, t2);
      return;
    }
    this.#m.setCurrentDrawingSession(this);
    this.#uo = new AbortController();
    const e2 = this.#m.combinedSignal(this.#uo);
    this.div.addEventListener("blur", (({ relatedTarget: t3 }) => {
      if (t3 && !this.div.contains(t3)) {
        this.#po = null;
        this.commitOrRemove();
      }
    }), { signal: e2 });
    this.#Ao.startDrawing(this, this.#m, false, t2);
  }
  pause(t2) {
    if (t2) {
      const { activeElement: t3 } = document;
      this.div.contains(t3) && (this.#po = t3);
    } else this.#po && setTimeout((() => {
      this.#po?.focus();
      this.#po = null;
    }), 0);
  }
  endDrawingSession(t2 = false) {
    if (!this.#uo) return null;
    this.#m.setCurrentDrawingSession(null);
    this.#uo.abort();
    this.#uo = null;
    this.#po = null;
    return this.#Ao.endDrawing(t2);
  }
  findNewParent(t2, e2, i2) {
    const s2 = this.#m.findParent(e2, i2);
    if (null === s2 || s2 === this) return false;
    s2.changeParent(t2);
    return true;
  }
  commitOrRemove() {
    if (this.#uo) {
      this.endDrawingSession();
      return true;
    }
    return false;
  }
  onScaleChanging() {
    this.#uo && this.#Ao.onScaleChangingWhenDrawing(this);
  }
  destroy() {
    this.commitOrRemove();
    if (this.#m.getActive()?.parent === this) {
      this.#m.commitOrRemove();
      this.#m.setActiveEditor(null);
    }
    if (this.#oo) {
      clearTimeout(this.#oo);
      this.#oo = null;
    }
    for (const t2 of this.#lo.values()) {
      this.#Cn?.removePointerInTextLayer(t2.contentDiv);
      t2.setParent(null);
      t2.isAttachedToDOM = false;
      t2.div.remove();
    }
    this.div = null;
    this.#lo.clear();
    this.#m.removeLayer(this);
  }
  #fo() {
    for (const t2 of this.#lo.values()) t2.isEmpty() && t2.remove();
  }
  render({ viewport: t2 }) {
    this.viewport = t2;
    setLayerDimensions(this.div, t2);
    for (const t3 of this.#m.getEditors(this.pageIndex)) {
      this.add(t3);
      t3.rebuild();
    }
    this.updateMode();
  }
  update({ viewport: t2 }) {
    this.#m.commitOrRemove();
    this.#fo();
    const e2 = this.viewport.rotation, i2 = t2.rotation;
    this.viewport = t2;
    setLayerDimensions(this.div, { rotation: i2 });
    if (e2 !== i2) for (const t3 of this.#lo.values()) t3.rotate(i2);
  }
  get pageDimensions() {
    const { pageWidth: t2, pageHeight: e2 } = this.viewport.rawDims;
    return [t2, e2];
  }
  get scale() {
    return this.#m.viewParameters.realScale;
  }
};
var DrawLayer = class _DrawLayer {
  #nn = null;
  #w = 0;
  #yo = /* @__PURE__ */ new Map();
  #xo = /* @__PURE__ */ new Map();
  constructor({ pageIndex: t2 }) {
    this.pageIndex = t2;
  }
  setParent(t2) {
    if (this.#nn) {
      if (this.#nn !== t2) {
        if (this.#yo.size > 0) for (const e2 of this.#yo.values()) {
          e2.remove();
          t2.append(e2);
        }
        this.#nn = t2;
      }
    } else this.#nn = t2;
  }
  static get _svgFactory() {
    return shadow(this, "_svgFactory", new DOMSVGFactory());
  }
  static #_o(t2, [e2, i2, s2, n2]) {
    const { style: a2 } = t2;
    a2.top = 100 * i2 + "%";
    a2.left = 100 * e2 + "%";
    a2.width = 100 * s2 + "%";
    a2.height = 100 * n2 + "%";
  }
  #Eo() {
    const t2 = _DrawLayer._svgFactory.create(1, 1, true);
    this.#nn.append(t2);
    t2.setAttribute("aria-hidden", true);
    return t2;
  }
  #So(t2, e2) {
    const i2 = _DrawLayer._svgFactory.createElement("clipPath");
    t2.append(i2);
    const s2 = `clip_${e2}`;
    i2.setAttribute("id", s2);
    i2.setAttribute("clipPathUnits", "objectBoundingBox");
    const n2 = _DrawLayer._svgFactory.createElement("use");
    i2.append(n2);
    n2.setAttribute("href", `#${e2}`);
    n2.classList.add("clip");
    return s2;
  }
  #Co(t2, e2) {
    for (const [i2, s2] of Object.entries(e2)) null === s2 ? t2.removeAttribute(i2) : t2.setAttribute(i2, s2);
  }
  draw(t2, e2 = false, i2 = false) {
    const s2 = this.#w++, n2 = this.#Eo(), a2 = _DrawLayer._svgFactory.createElement("defs");
    n2.append(a2);
    const r2 = _DrawLayer._svgFactory.createElement("path");
    a2.append(r2);
    const o2 = `path_p${this.pageIndex}_${s2}`;
    r2.setAttribute("id", o2);
    r2.setAttribute("vector-effect", "non-scaling-stroke");
    e2 && this.#xo.set(s2, r2);
    const l2 = i2 ? this.#So(a2, o2) : null, h2 = _DrawLayer._svgFactory.createElement("use");
    n2.append(h2);
    h2.setAttribute("href", `#${o2}`);
    this.updateProperties(n2, t2);
    this.#yo.set(s2, n2);
    return { id: s2, clipPathId: `url(#${l2})` };
  }
  drawOutline(t2, e2) {
    const i2 = this.#w++, s2 = this.#Eo(), n2 = _DrawLayer._svgFactory.createElement("defs");
    s2.append(n2);
    const a2 = _DrawLayer._svgFactory.createElement("path");
    n2.append(a2);
    const r2 = `path_p${this.pageIndex}_${i2}`;
    a2.setAttribute("id", r2);
    a2.setAttribute("vector-effect", "non-scaling-stroke");
    let o2;
    if (e2) {
      const t3 = _DrawLayer._svgFactory.createElement("mask");
      n2.append(t3);
      o2 = `mask_p${this.pageIndex}_${i2}`;
      t3.setAttribute("id", o2);
      t3.setAttribute("maskUnits", "objectBoundingBox");
      const e3 = _DrawLayer._svgFactory.createElement("rect");
      t3.append(e3);
      e3.setAttribute("width", "1");
      e3.setAttribute("height", "1");
      e3.setAttribute("fill", "white");
      const s3 = _DrawLayer._svgFactory.createElement("use");
      t3.append(s3);
      s3.setAttribute("href", `#${r2}`);
      s3.setAttribute("stroke", "none");
      s3.setAttribute("fill", "black");
      s3.setAttribute("fill-rule", "nonzero");
      s3.classList.add("mask");
    }
    const l2 = _DrawLayer._svgFactory.createElement("use");
    s2.append(l2);
    l2.setAttribute("href", `#${r2}`);
    o2 && l2.setAttribute("mask", `url(#${o2})`);
    const h2 = l2.cloneNode();
    s2.append(h2);
    l2.classList.add("mainOutline");
    h2.classList.add("secondaryOutline");
    this.updateProperties(s2, t2);
    this.#yo.set(i2, s2);
    return i2;
  }
  finalizeDraw(t2, e2) {
    this.#xo.delete(t2);
    this.updateProperties(t2, e2);
  }
  updateProperties(t2, e2) {
    if (!e2) return;
    const { root: i2, bbox: s2, rootClass: n2, path: a2 } = e2, r2 = "number" == typeof t2 ? this.#yo.get(t2) : t2;
    if (r2) {
      i2 && this.#Co(r2, i2);
      s2 && _DrawLayer.#_o(r2, s2);
      if (n2) {
        const { classList: t3 } = r2;
        for (const [e3, i3] of Object.entries(n2)) t3.toggle(e3, i3);
      }
      if (a2) {
        const t3 = r2.firstChild.firstChild;
        this.#Co(t3, a2);
      }
    }
  }
  updateParent(t2, e2) {
    if (e2 === this) return;
    const i2 = this.#yo.get(t2);
    if (i2) {
      e2.#nn.append(i2);
      this.#yo.delete(t2);
      e2.#yo.set(t2, i2);
    }
  }
  remove(t2) {
    this.#xo.delete(t2);
    if (null !== this.#nn) {
      this.#yo.get(t2).remove();
      this.#yo.delete(t2);
    }
  }
  destroy() {
    this.#nn = null;
    for (const t2 of this.#yo.values()) t2.remove();
    this.#yo.clear();
    this.#xo.clear();
  }
};
globalThis.pdfjsTestingUtils = { HighlightOutliner };
var Ut = __webpack_exports__.AbortException;
var Gt = __webpack_exports__.AnnotationEditorLayer;
var $t = __webpack_exports__.AnnotationEditorParamsType;
var Vt = __webpack_exports__.AnnotationEditorType;
var jt = __webpack_exports__.AnnotationEditorUIManager;
var Wt = __webpack_exports__.AnnotationLayer;
var qt = __webpack_exports__.AnnotationMode;
var Xt = __webpack_exports__.ColorPicker;
var Kt = __webpack_exports__.DOMSVGFactory;
var Yt = __webpack_exports__.DrawLayer;
var Qt = __webpack_exports__.FeatureTest;
var Jt = __webpack_exports__.GlobalWorkerOptions;
var Zt = __webpack_exports__.ImageKind;
var te = __webpack_exports__.InvalidPDFException;
var ee = __webpack_exports__.MissingPDFException;
var ie = __webpack_exports__.OPS;
var se = __webpack_exports__.OutputScale;
var ne = __webpack_exports__.PDFDataRangeTransport;
var ae = __webpack_exports__.PDFDateString;
var re = __webpack_exports__.PDFWorker;
var oe = __webpack_exports__.PasswordResponses;
var le = __webpack_exports__.PermissionFlag;
var he = __webpack_exports__.PixelsPerInch;
var de = __webpack_exports__.RenderingCancelledException;
var ce = __webpack_exports__.TextLayer;
var ue = __webpack_exports__.TouchManager;
var pe = __webpack_exports__.UnexpectedResponseException;
var ge = __webpack_exports__.Util;
var me = __webpack_exports__.VerbosityLevel;
var fe = __webpack_exports__.XfaLayer;
var be = __webpack_exports__.build;
var Ae = __webpack_exports__.createValidAbsoluteUrl;
var we = __webpack_exports__.fetchData;
var ve = __webpack_exports__.getDocument;
var ye = __webpack_exports__.getFilenameFromUrl;
var xe = __webpack_exports__.getPdfFilenameFromUrl;
var _e = __webpack_exports__.getXfaPageViewport;
var Ee = __webpack_exports__.isDataScheme;
var Se = __webpack_exports__.isPdfFile;
var Ce = __webpack_exports__.noContextMenu;
var Te = __webpack_exports__.normalizeUnicode;
var Me = __webpack_exports__.setLayerDimensions;
var Pe = __webpack_exports__.shadow;
var De = __webpack_exports__.stopEvent;
var ke = __webpack_exports__.version;

// ../pdf_takeoff_app.js
Jt.workerSrc = "/assets/construction_bim/js/pdfjs/pdf.worker.min.mjs";
var API = {
  save_measurement: "construction_bim.bim.api.save_measurement",
  list_measurements: "construction_bim.bim.api.list_measurements",
  delete_measurement: "construction_bim.bim.api.delete_measurement"
};
var els = {
  canvasWrap: document.getElementById("pdf-canvas-wrap"),
  canvas: document.getElementById("pdf-canvas"),
  ctx: document.getElementById("pdf-canvas").getContext("2d"),
  doclist: document.getElementById("pdf-doclist"),
  fileInput: document.getElementById("pdf-file-input"),
  openBtn: document.getElementById("pdf-open"),
  status: document.getElementById("pdf-status"),
  pgLabel: document.getElementById("pg-label"),
  zLabel: document.getElementById("z-label"),
  scalePreset: document.getElementById("scale-preset"),
  scaleCalibrate: document.getElementById("scale-calibrate"),
  scaleKnown: document.getElementById("scale-known"),
  scaleKnownMm: document.getElementById("scale-known-mm"),
  scaleKnownOk: document.getElementById("scale-known-ok"),
  calibHint: document.getElementById("calib-hint"),
  scaleDisplay: document.getElementById("scale-display"),
  measureList: document.getElementById("measure-list"),
  measCount: document.getElementById("meas-count")
};
var state = {
  pdf: null,
  page: null,
  pageNo: 1,
  numPages: 1,
  viewport: null,
  zoom: 1,
  // scale: pixelsPerMeter at base render resolution (zoom=1)
  pixelsPerMeter: 0,
  unitLabel: "m",
  docName: null,
  // File doc name
  docUrl: null,
  measurements: [],
  // {id, type, points(pdf units), ...}
  draft: [],
  // in-progress measurement points (pdf units)
  tool: "dist",
  calibrationDraft: null,
  // {pdfUnits:[{x,y},{x,y}]}
  redrawPending: false
};
var PDF_DPI = 96;
var RENDER_SCALE = PDF_DPI / 72;
async function loadDocuments() {
  try {
    const res = await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "File",
        filters: [["file_name", "like", "%.pdf"], ["is_folder", "=", 0]],
        fields: ["name", "file_name", "file_url"],
        limit_page_length: 50,
        order_by: "creation desc"
      }
    });
    const docs = res.message || [];
    els.doclist.innerHTML = "";
    if (!docs.length) {
      els.doclist.innerHTML = '<div class="empty-hint" style="color:var(--text-muted,#8d99a6);font-size:12px">No PDFs in File library</div>';
      return;
    }
    docs.forEach((d2) => {
      const el = document.createElement("div");
      el.className = "pdf-doc-item";
      el.innerHTML = `<span>${d2.file_name}</span>`;
      el.onclick = () => openPdf(d2.file_url, d2.name, d2.file_name);
      els.doclist.appendChild(el);
    });
  } catch (e2) {
  }
}
async function openPdf(url, name, fname) {
  els.status.textContent = "Loading " + (fname || url) + "\u2026";
  try {
    const abs = url.startsWith("/") ? url : "/" + url;
    const pdf = await ve(abs).promise;
    state.pdf = pdf;
    state.numPages = pdf.numPages;
    state.pageNo = 1;
    state.docName = name;
    state.docUrl = url;
    state.measurements = [];
    state.draft = [];
    state.pixelsPerMeter = 0;
    state.zoom = 1;
    document.querySelectorAll(".pdf-doc-item").forEach((el) => el.classList.toggle("active", el.textContent.includes(fname || "")));
    await renderPage();
    await loadMeasurements();
    els.status.textContent = `${fname} \u2014 ${pdf.numPages} pages. Calibrate scale to measure.`;
  } catch (e2) {
    els.status.textContent = "Failed to load PDF: " + (e2.message || e2);
  }
}
async function renderPage() {
  if (!state.pdf) return;
  const page = await state.pdf.getPage(state.pageNo);
  state.page = page;
  state.viewport = page.getViewport({ scale: RENDER_SCALE });
  const px = Math.floor(state.viewport.width * state.zoom);
  const py = Math.floor(state.viewport.height * state.zoom);
  els.canvas.width = px;
  els.canvas.height = py;
  els.canvas.style.width = px + "px";
  els.canvas.style.height = py + "px";
  els.ctx.setTransform(state.zoom, 0, 0, state.zoom, 0, 0);
  els.ctx.fillStyle = "#fff";
  els.ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
  const renderTask = page.render({
    canvasContext: els.ctx,
    viewport: state.viewport,
    transform: [state.zoom, 0, 0, state.zoom, 0, 0]
  });
  await renderTask.promise;
  els.pgLabel.textContent = `${state.pageNo} / ${state.numPages}`;
  els.zLabel.textContent = Math.round(state.zoom * 100) + "%";
  drawMarks(els.ctx);
}
function redrawMarks() {
  if (!state.page) return;
  renderPage();
}
function drawMarks(ctx) {
  if (!state.page) return;
  const vp = state.viewport;
  const toPx = (p2) => ({ x: p2.x * state.zoom, y: p2.y * state.zoom });
  if (state.calibrationDraft && state.calibrationDraft.pdfUnits.length === 2) {
    const [a2, b2] = state.calibrationDraft.pdfUnits.map(toPx);
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  state.measurements.forEach((m2) => {
    const pts = (m2.points || []).map(toPx);
    ctx.strokeStyle = m2.type === "highlight" ? "rgba(255,209,102,.45)" : "#e74c3c";
    ctx.fillStyle = m2.type === "highlight" ? "rgba(255,209,102,.35)" : "rgba(231,76,60,.25)";
    ctx.lineWidth = m2.type === "highlight" ? 18 : 1.6;
    if (m2.type === "distance" && pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
      drawTick(ctx, pts[0]);
      drawTick(ctx, pts[1]);
      if (m2.real_value) drawLabel(ctx, pts[1], m2.real_value + " " + m2.unit);
    } else if (m2.type === "rect" && pts.length === 2) {
      const w2 = pts[1].x - pts[0].x, h2 = pts[1].y - pts[0].y;
      ctx.fillRect(pts[0].x, pts[0].y, w2, h2);
      ctx.strokeRect(pts[0].x, pts[0].y, w2, h2);
      if (m2.real_value) drawLabel(ctx, { x: pts[0].x, y: pts[0].y - 6 }, m2.real_value + " " + m2.unit);
    } else if (pts.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i2 = 1; i2 < pts.length; i2++) ctx.lineTo(pts[i2].x, pts[i2].y);
      if (m2.type === "area" || m2.type === "highlight") ctx.closePath();
      ctx.stroke();
      if (m2.type === "area" && m2.real_value) drawLabel(ctx, pts[0], m2.real_value + " " + m2.unit);
      if (m2.type === "polyline" && m2.real_value) drawLabel(ctx, pts[pts.length - 1], m2.real_value + " " + m2.unit);
    } else if (m2.type === "count" && pts.length) {
      drawLabel(ctx, pts[0], String(m2.real_value || pts.length));
    }
  });
  const draftPts = state.draft.map(toPx);
  if (draftPts.length) {
    ctx.strokeStyle = "#2490ef";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(draftPts[0].x, draftPts[0].y);
    for (let i2 = 1; i2 < draftPts.length; i2++) ctx.lineTo(draftPts[i2].x, draftPts[i2].y);
    ctx.stroke();
    ctx.setLineDash([]);
    draftPts.forEach((p2) => drawTick(ctx, p2));
  }
}
function drawTick(ctx, p2) {
  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 3.5, 0, Math.PI * 2);
  ctx.fill();
}
function drawLabel(ctx, p2, text) {
  ctx.font = "12px sans-serif";
  const w2 = ctx.measureText(text).width + 8;
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fillRect(p2.x + 6, p2.y - 16, w2, 16);
  ctx.fillStyle = "#c0392b";
  ctx.fillText(text, p2.x + 10, p2.y - 4);
}
function pointerToPdfUnits(ev) {
  const rect = els.canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - rect.left) / state.zoom,
    y: (ev.clientY - rect.top) / state.zoom
  };
}
function setTool(tool) {
  state.tool = tool;
  state.draft = [];
  ["dist", "poly", "area", "count", "rect", "highlight"].forEach((t2) => document.getElementById("tool-" + t2).classList.toggle("active", t2 === tool));
}
["dist", "poly", "area", "count", "rect", "highlight"].forEach((t2) => document.getElementById("tool-" + t2).onclick = () => setTool(t2));
els.canvas.addEventListener("click", async (ev) => {
  if (!state.page) return;
  const p2 = pointerToPdfUnits(ev);
  if (state.calibrationDraft) {
    state.calibrationDraft.pdfUnits.push(p2);
    if (state.calibrationDraft.pdfUnits.length === 2) {
      state.lastCalibrationLine = [...state.calibrationDraft.pdfUnits];
      state.calibrationDraft = null;
      els.scaleKnown.style.display = "flex";
      els.calibHint.textContent = "Enter the real length of the drawn line in mm, then press OK.";
      redrawMarks();
    } else {
      redrawMarks();
    }
    return;
  }
  if (state.tool === "count") {
    const m2 = { id: null, type: "count", points: [p2], real_value: 1, unit: "pcs" };
    state.measurements.push(m2);
    state.draft = [];
    redrawMarks();
    saveMeasurement(m2);
    return;
  }
  if (state.tool === "dist" || state.tool === "rect") {
    state.draft.push(p2);
    if (state.draft.length === 2) {
      const m2 = { id: null, type: state.tool, points: [...state.draft], real_value: 0, unit: "m" };
      state.draft = [];
      finalizeMeasurement(m2);
      state.measurements.push(m2);
      redrawMarks();
      saveMeasurement(m2);
    } else {
      redrawMarks();
    }
    return;
  }
  if (state.tool === "poly" || state.tool === "area" || state.tool === "highlight") {
    state.draft.push(p2);
    if (ev.detail >= 2) {
      const m2 = { id: null, type: state.tool, points: [...state.draft], real_value: 0, unit: state.tool === "area" || state.tool === "highlight" ? "m\xB2" : "m" };
      state.draft = [];
      finalizeMeasurement(m2);
      state.measurements.push(m2);
      redrawMarks();
      saveMeasurement(m2);
    } else {
      redrawMarks();
    }
  }
});
function finalizeMeasurement(m2) {
  const ppm = state.pixelsPerMeter;
  if (!ppm) {
    m2.real_value = 0;
    return;
  }
  const pts = m2.points;
  const distPx = (a2, b2) => Math.hypot(b2.x - a2.x, b2.y - a2.y);
  const pxToM = (px) => px / ppm;
  if (m2.type === "distance") {
    m2.real_value = pxToM(distPx(pts[0], pts[1]));
  } else if (m2.type === "rect") {
    const w2 = Math.abs(pts[1].x - pts[0].x), h2 = Math.abs(pts[1].y - pts[0].y);
    m2.real_value = pxToM(w2) * pxToM(h2);
    m2.unit = "m\xB2";
  } else if (m2.type === "polyline") {
    let total = 0;
    for (let i2 = 1; i2 < pts.length; i2++) total += distPx(pts[i2 - 1], pts[i2]);
    m2.real_value = pxToM(total);
  } else if (m2.type === "area" || m2.type === "highlight") {
    let area = 0;
    for (let i2 = 0; i2 < pts.length; i2++) {
      const j2 = (i2 + 1) % pts.length;
      area += pts[i2].x * pts[j2].y - pts[j2].x * pts[i2].y;
    }
    m2.real_value = Math.abs(area) / 2 / (ppm * ppm);
    m2.unit = "m\xB2";
  }
  m2.real_value = Math.round(m2.real_value * 1e3) / 1e3;
}
els.scalePreset.onchange = () => {
  const ratio = parseFloat(els.scalePreset.value);
  if (!ratio || !state.viewport) return;
  state.pixelsPerMeter = RENDER_SCALE * 72 * (1 / ratio) * 1e3 / 1e3;
  state.pixelsPerMeter = 72 * (1e3 / ratio) / 25.4 * RENDER_SCALE;
  state.unitLabel = "m";
  els.scaleDisplay.textContent = `Scale 1:${ratio} \u2014 ${state.pixelsPerMeter.toFixed(1)} px/m (at 100%)`;
  els.calibHint.textContent = "Scale set from preset. Draw measurements.";
  els.scaleKnown.style.display = "none";
  state.measurements.forEach((m2) => finalizeMeasurement(m2));
  redrawMarks();
  renderMeasurementList();
};
els.scaleCalibrate.onclick = () => {
  state.calibrationDraft = { pdfUnits: [] };
  els.calibHint.textContent = "Click two points on the drawing that are a KNOWN distance apart.";
  els.scaleKnown.style.display = "none";
};
els.scaleKnownOk.onclick = () => {
  const mm = parseFloat(els.scaleKnownMm.value);
  if (!mm || !state.calibrationDraft) return;
  const pts = state.lastCalibrationLine;
  if (!pts || pts.length < 2) return;
  const px = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  state.pixelsPerMeter = px / (mm / 1e3);
  state.unitLabel = "m";
  els.scaleDisplay.textContent = `Calibrated: ${state.pixelsPerMeter.toFixed(1)} px/m \u2014 1px = ${(mm / px * 1e3).toFixed(2)} mm`;
  els.calibHint.textContent = "Calibration set. Draw measurements.";
  els.scaleKnown.style.display = "none";
  state.calibrationDraft = null;
  state.measurements.forEach((m2) => finalizeMeasurement(m2));
  redrawMarks();
  renderMeasurementList();
};
var lastCalibrationLine = null;
state.lastCalibrationLine = lastCalibrationLine;
document.getElementById("z-in").onclick = () => {
  state.zoom = Math.min(4, state.zoom * 1.2);
  renderPage();
};
document.getElementById("z-out").onclick = () => {
  state.zoom = Math.max(0.2, state.zoom / 1.2);
  renderPage();
};
document.getElementById("pg-prev").onclick = async () => {
  if (state.pageNo > 1) {
    state.pageNo--;
    await renderPage();
  }
};
document.getElementById("pg-next").onclick = async () => {
  if (state.pageNo < state.numPages) {
    state.pageNo++;
    await renderPage();
  }
};
async function saveMeasurement(m2) {
  if (!state.docName) return;
  try {
    const res = await frappe.call({
      method: API.save_measurement,
      args: {
        pdf_file: state.docName,
        page_no: state.pageNo,
        measurement_type: m2.type,
        points: JSON.stringify(m2.points),
        scale: JSON.stringify({ pixelsPerMeter: state.pixelsPerMeter, unitLabel: state.unitLabel }),
        real_value: m2.real_value,
        unit: m2.unit
      }
    });
    m2.id = res.message.name;
    renderMeasurementList();
  } catch (e2) {
    els.status.textContent = "Save failed: " + (e2._server_messages ? JSON.parse(e2._server_messages)[0] : e2.message);
  }
}
async function loadMeasurements() {
  if (!state.docName) return;
  const res = await frappe.call({ method: API.list_measurements, args: { pdf_file: state.docName } });
  state.measurements = (res.message || []).filter((m2) => m2.page_no === state.pageNo).map((m2) => ({
    id: m2.name,
    type: m2.measurement_type,
    points: JSON.parse(m2.points || "[]"),
    real_value: m2.real_value,
    unit: m2.unit
  }));
  renderMeasurementList();
  redrawMarks();
}
function renderMeasurementList() {
  els.measCount.textContent = state.measurements.length ? `(${state.measurements.length})` : "";
  if (!state.measurements.length) {
    els.measureList.innerHTML = '<div class="empty-hint" style="color:var(--text-muted,#8d99a6);font-size:12px">No measurements yet</div>';
    return;
  }
  els.measureList.innerHTML = state.measurements.map((m2) => `
    <div class="meas-item">
      <span>${m2.type} \u2014 ${m2.real_value ? m2.real_value + " " + m2.unit : "uncalibrated"}</span>
      <button class="del" data-id="${m2.id || ""}">\u2715</button>
    </div>`).join("");
  els.measureList.querySelectorAll(".del").forEach((b2) => b2.onclick = async () => {
    const id = b2.dataset.id;
    if (id) await frappe.call({ method: API.delete_measurement, args: { measurement: id } });
    state.measurements = state.measurements.filter((m2) => (m2.id || "") !== id);
    renderMeasurementList();
    redrawMarks();
  });
}
document.getElementById("meas-undo").onclick = () => {
  if (state.draft.length) {
    state.draft.pop();
    redrawMarks();
  }
};
document.getElementById("meas-clear").onclick = () => {
  state.measurements = [];
  state.draft = [];
  renderMeasurementList();
  redrawMarks();
};
els.openBtn.onclick = () => els.fileInput.click();
els.fileInput.onchange = async () => {
  const file = els.fileInput.files[0];
  if (!file) return;
  try {
    const res = await frappe.call({
      method: "upload_file",
      args: { is_private: 0, doctype: "File", docname: "new" },
      files: [file]
    });
    const f2 = res.message;
    loadDocuments();
    await openPdf(f2.file_url, f2.name, f2.file_name);
  } catch (e2) {
    els.status.textContent = "Upload failed: " + (e2._server_messages ? JSON.parse(e2._server_messages)[0] : e2.message);
  } finally {
    els.fileInput.value = "";
  }
};
var takeoffUrlParams = new URLSearchParams(window.location.search);
var takeoffFileParam = takeoffUrlParams.get("file");
loadDocuments().then(() => {
  if (takeoffFileParam) {
    const fname = decodeURIComponent(takeoffFileParam.split("/").pop());
    openPdf(takeoffFileParam, "PARAM_PDF", fname);
  }
});
