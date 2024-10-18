var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/imports.ts
import { default as default2 } from "gi://Astal?version=0.1";
import { default as default3 } from "gi://GObject?version=2.0";
import { default as default4 } from "gi://Gio?version=2.0";
import { default as default5 } from "gi://Gtk?version=3.0";
import { default as default6 } from "gi://Gdk?version=3.0";
import { default as default7 } from "gi://GLib?version=2.0";

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/process.ts
function subprocess(argsOrCmd, onOut = print, onErr = printerr) {
  const args = Array.isArray(argsOrCmd) || typeof argsOrCmd === "string";
  const { cmd, err, out } = {
    cmd: args ? argsOrCmd : argsOrCmd.cmd,
    err: args ? onErr : argsOrCmd.err || onErr,
    out: args ? onOut : argsOrCmd.out || onOut
  };
  const proc = Array.isArray(cmd) ? default2.Process.subprocessv(cmd) : default2.Process.subprocess(cmd);
  proc.connect("stdout", (_, stdout) => out(stdout));
  proc.connect("stderr", (_, stderr) => err(stderr));
  return proc;
}
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(cmd)) {
      default2.Process.exec_asyncv(cmd, (_, res) => {
        try {
          resolve(default2.Process.exec_asyncv_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    } else {
      default2.Process.exec_async(cmd, (_, res) => {
        try {
          resolve(default2.Process.exec_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/time.ts
function interval(interval2, callback) {
  return default2.Time.interval(interval2, () => void callback?.());
}

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/binding.ts
var snakeify = (str) => str.replace(/([a-z])([A-Z])/g, "$1_$2").replaceAll("-", "_").toLowerCase();
var kebabify = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replaceAll("_", "-").toLowerCase();
var Binding = class _Binding {
  transformFn = (v) => v;
  #emitter;
  #prop;
  static bind(emitter, prop) {
    return new _Binding(emitter, prop);
  }
  constructor(emitter, prop) {
    this.#emitter = emitter;
    this.#prop = prop && kebabify(prop);
  }
  toString() {
    return `Binding<${this.#emitter}${this.#prop ? `, "${this.#prop}"` : ""}>`;
  }
  as(fn) {
    const bind2 = new _Binding(this.#emitter, this.#prop);
    bind2.transformFn = (v) => fn(this.transformFn(v));
    return bind2;
  }
  get() {
    if (typeof this.#emitter.get === "function")
      return this.transformFn(this.#emitter.get());
    if (typeof this.#prop === "string") {
      const getter = `get_${snakeify(this.#prop)}`;
      if (typeof this.#emitter[getter] === "function")
        return this.transformFn(this.#emitter[getter]());
      return this.transformFn(this.#emitter[this.#prop]);
    }
    throw Error("can not get value of binding");
  }
  subscribe(callback) {
    if (typeof this.#emitter.subscribe === "function") {
      return this.#emitter.subscribe(() => {
        callback(this.get());
      });
    } else if (typeof this.#emitter.connect === "function") {
      const signal = `notify::${this.#prop}`;
      const id = this.#emitter.connect(signal, () => {
        callback(this.get());
      });
      return () => {
        this.#emitter.disconnect(id);
      };
    }
    throw Error(`${this.#emitter} is not bindable`);
  }
};
var { bind } = Binding;

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/variable.ts
var VariableWrapper = class extends Function {
  variable;
  errHandler = console.error;
  _value;
  _poll;
  _watch;
  pollInterval = 1e3;
  pollExec;
  pollTransform;
  pollFn;
  watchTransform;
  watchExec;
  constructor(init) {
    super();
    this._value = init;
    this.variable = new default2.VariableBase();
    this.variable.connect("dropped", () => {
      this.stopWatch();
      this.stopPoll();
    });
    this.variable.connect("error", (_, err) => this.errHandler?.(err));
    return new Proxy(this, {
      apply: (target, _, args) => target._call(args[0])
    });
  }
  _call(transform) {
    const b = Binding.bind(this);
    return transform ? b.as(transform) : b;
  }
  toString() {
    return String(`Variable<${this.get()}>`);
  }
  get() {
    return this._value;
  }
  set(value) {
    if (value !== this._value) {
      this._value = value;
      this.variable.emit("changed");
    }
  }
  startPoll() {
    if (this._poll)
      return;
    if (this.pollFn) {
      this._poll = interval(this.pollInterval, () => {
        const v = this.pollFn(this.get());
        if (v instanceof Promise) {
          v.then((v2) => this.set(v2)).catch((err) => this.variable.emit("error", err));
        } else {
          this.set(v);
        }
      });
    } else if (this.pollExec) {
      this._poll = interval(this.pollInterval, () => {
        execAsync(this.pollExec).then((v) => this.set(this.pollTransform(v, this.get()))).catch((err) => this.variable.emit("error", err));
      });
    }
  }
  startWatch() {
    if (this._watch)
      return;
    this._watch = subprocess({
      cmd: this.watchExec,
      out: (out) => this.set(this.watchTransform(out, this.get())),
      err: (err) => this.variable.emit("error", err)
    });
  }
  stopPoll() {
    this._poll?.cancel();
    delete this._poll;
  }
  stopWatch() {
    this._watch?.kill();
    delete this._watch;
  }
  isPolling() {
    return !!this._poll;
  }
  isWatching() {
    return !!this._watch;
  }
  drop() {
    this.variable.emit("dropped");
  }
  onDropped(callback) {
    this.variable.connect("dropped", callback);
    return this;
  }
  onError(callback) {
    delete this.errHandler;
    this.variable.connect("error", (_, err) => callback(err));
    return this;
  }
  subscribe(callback) {
    const id = this.variable.connect("changed", () => {
      callback(this.get());
    });
    return () => this.variable.disconnect(id);
  }
  poll(interval2, exec, transform = (out) => out) {
    this.stopPoll();
    this.pollInterval = interval2;
    this.pollTransform = transform;
    if (typeof exec === "function") {
      this.pollFn = exec;
      delete this.pollExec;
    } else {
      this.pollExec = exec;
      delete this.pollFn;
    }
    this.startPoll();
    return this;
  }
  watch(exec, transform = (out) => out) {
    this.stopWatch();
    this.watchExec = exec;
    this.watchTransform = transform;
    this.startWatch();
    return this;
  }
  observe(objs, sigOrFn, callback) {
    const f = typeof sigOrFn === "function" ? sigOrFn : callback ?? (() => this.get());
    const set = (obj, ...args) => this.set(f(obj, ...args));
    if (Array.isArray(objs)) {
      for (const obj of objs) {
        const [o, s] = obj;
        const id = o.connect(s, set);
        this.onDropped(() => o.disconnect(id));
      }
    } else {
      if (typeof sigOrFn === "string") {
        const id = objs.connect(sigOrFn, set);
        this.onDropped(() => objs.disconnect(id));
      }
    }
    return this;
  }
  static derive(deps, fn = (...args) => args) {
    const update = () => fn(...deps.map((d) => d.get()));
    const derived = new Variable(update());
    const unsubs = deps.map((dep) => dep.subscribe(() => derived.set(update())));
    derived.onDropped(() => unsubs.map((unsub) => unsub()));
    return derived;
  }
};
var Variable = new Proxy(VariableWrapper, {
  apply: (_t, _a, args) => new VariableWrapper(args[0])
});
var variable_default = Variable;

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/astalify.ts
function mergeBindings(array) {
  function getValues(...args) {
    let i = 0;
    return array.map(
      (value) => value instanceof Binding ? args[i++] : value
    );
  }
  const bindings = array.filter((i) => i instanceof Binding);
  if (bindings.length === 0)
    return array;
  if (bindings.length === 1)
    return bindings[0].as(getValues);
  return variable_default.derive(bindings, getValues)();
}
function setProp(obj, prop, value) {
  try {
    const setter = `set_${snakeify(prop)}`;
    if (typeof obj[setter] === "function")
      return obj[setter](value);
    return obj[prop] = value;
  } catch (error) {
    console.error(`could not set property "${prop}" on ${obj}:`, error);
  }
}
function astalify(cls) {
  class Widget extends cls {
    get css() {
      return default2.widget_get_css(this);
    }
    set css(css) {
      default2.widget_set_css(this, css);
    }
    get_css() {
      return this.css;
    }
    set_css(css) {
      this.css = css;
    }
    get className() {
      return default2.widget_get_class_names(this).join(" ");
    }
    set className(className) {
      default2.widget_set_class_names(this, className.split(/\s+/));
    }
    get_class_name() {
      return this.className;
    }
    set_class_name(className) {
      this.className = className;
    }
    get cursor() {
      return default2.widget_get_cursor(this);
    }
    set cursor(cursor) {
      default2.widget_set_cursor(this, cursor);
    }
    get_cursor() {
      return this.cursor;
    }
    set_cursor(cursor) {
      this.cursor = cursor;
    }
    get clickThrough() {
      return default2.widget_get_click_through(this);
    }
    set clickThrough(clickThrough) {
      default2.widget_set_click_through(this, clickThrough);
    }
    get_click_through() {
      return this.clickThrough;
    }
    set_click_through(clickThrough) {
      this.clickThrough = clickThrough;
    }
    get noImplicitDestroy() {
      return this.__no_implicit_destroy;
    }
    set noImplicitDestroy(value) {
      this.__no_implicit_destroy = value;
    }
    _setChildren(children) {
      children = children.flat(Infinity).map((ch) => ch instanceof default5.Widget ? ch : new default5.Label({ visible: true, label: String(ch) }));
      if (this instanceof default5.Bin) {
        const ch = this.get_child();
        if (ch)
          this.remove(ch);
        if (ch && !children.includes(ch) && !this.noImplicitDestroy)
          ch?.destroy();
      } else if (this instanceof default5.Container) {
        for (const ch of this.get_children()) {
          this.remove(ch);
          if (!children.includes(ch) && !this.noImplicitDestroy)
            ch?.destroy();
        }
      }
      if (this instanceof default2.Box) {
        this.set_children(children);
      } else if (this instanceof default2.Stack) {
        this.set_children(children);
      } else if (this instanceof default2.CenterBox) {
        this.startWidget = children[0];
        this.centerWidget = children[1];
        this.endWidget = children[2];
      } else if (this instanceof default2.Overlay) {
        const [child, ...overlays] = children;
        this.set_child(child);
        this.set_overlays(overlays);
      } else if (this instanceof default5.Container) {
        for (const ch of children)
          this.add(ch);
      }
    }
    toggleClassName(cn, cond = true) {
      default2.widget_toggle_class_name(this, cn, cond);
    }
    hook(object, signalOrCallback, callback) {
      if (typeof object.connect === "function" && callback) {
        const id = object.connect(signalOrCallback, (_, ...args) => {
          callback(this, ...args);
        });
        this.connect("destroy", () => {
          object.disconnect(id);
        });
      } else if (typeof object.subscribe === "function" && typeof signalOrCallback === "function") {
        const unsub = object.subscribe((...args) => {
          signalOrCallback(this, ...args);
        });
        this.connect("destroy", unsub);
      }
      return this;
    }
    constructor(...params) {
      super();
      const [config] = params;
      const { setup, child, children = [], ...props } = config;
      props.visible ??= true;
      if (child)
        children.unshift(child);
      const bindings = Object.keys(props).reduce((acc, prop) => {
        if (props[prop] instanceof Binding) {
          const binding = props[prop];
          delete props[prop];
          return [...acc, [prop, binding]];
        }
        return acc;
      }, []);
      const onHandlers = Object.keys(props).reduce((acc, key) => {
        if (key.startsWith("on")) {
          const sig = kebabify(key).split("-").slice(1).join("-");
          const handler = props[key];
          delete props[key];
          return [...acc, [sig, handler]];
        }
        return acc;
      }, []);
      const mergedChildren = mergeBindings(children.flat(Infinity));
      if (mergedChildren instanceof Binding) {
        this._setChildren(mergedChildren.get());
        this.connect("destroy", mergedChildren.subscribe((v) => {
          this._setChildren(v);
        }));
      } else {
        if (mergedChildren.length > 0) {
          this._setChildren(mergedChildren);
        }
      }
      for (const [signal, callback] of onHandlers) {
        if (typeof callback === "function") {
          this.connect(signal, callback);
        } else {
          this.connect(signal, () => execAsync(callback).then(print).catch(console.error));
        }
      }
      for (const [prop, binding] of bindings) {
        if (prop === "child" || prop === "children") {
          this.connect("destroy", binding.subscribe((v) => {
            this._setChildren(v);
          }));
        }
        this.connect("destroy", binding.subscribe((v) => {
          setProp(this, prop, v);
        }));
        setProp(this, prop, binding.get());
      }
      Object.assign(this, props);
      setup?.(this);
    }
  }
  default3.registerClass({
    GTypeName: `Astal_${cls.name}`,
    Properties: {
      "class-name": default3.ParamSpec.string(
        "class-name",
        "",
        "",
        default3.ParamFlags.READWRITE,
        ""
      ),
      "css": default3.ParamSpec.string(
        "css",
        "",
        "",
        default3.ParamFlags.READWRITE,
        ""
      ),
      "cursor": default3.ParamSpec.string(
        "cursor",
        "",
        "",
        default3.ParamFlags.READWRITE,
        "default"
      ),
      "click-through": default3.ParamSpec.boolean(
        "click-through",
        "",
        "",
        default3.ParamFlags.READWRITE,
        false
      ),
      "no-implicit-destroy": default3.ParamSpec.boolean(
        "no-implicit-destroy",
        "",
        "",
        default3.ParamFlags.READWRITE,
        false
      )
    }
  }, Widget);
  return Widget;
}

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/widgets.ts
Object.defineProperty(default2.Box.prototype, "children", {
  get() {
    return this.get_children();
  },
  set(v) {
    this.set_children(v);
  }
});
var Box = class extends astalify(default2.Box) {
  static {
    default3.registerClass({ GTypeName: "Box" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
};
var Button = class extends astalify(default2.Button) {
  static {
    default3.registerClass({ GTypeName: "Button" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var CenterBox = class extends astalify(default2.CenterBox) {
  static {
    default3.registerClass({ GTypeName: "CenterBox" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
};
var CircularProgress = class extends astalify(default2.CircularProgress) {
  static {
    default3.registerClass({ GTypeName: "CircularProgress" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var DrawingArea = class extends astalify(default5.DrawingArea) {
  static {
    default3.registerClass({ GTypeName: "DrawingArea" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Entry = class extends astalify(default5.Entry) {
  static {
    default3.registerClass({ GTypeName: "Entry" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var EventBox = class extends astalify(default2.EventBox) {
  static {
    default3.registerClass({ GTypeName: "EventBox" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var Icon = class extends astalify(default2.Icon) {
  static {
    default3.registerClass({ GTypeName: "Icon" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Label = class extends astalify(default2.Label) {
  static {
    default3.registerClass({ GTypeName: "Label" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var LevelBar = class extends astalify(default2.LevelBar) {
  static {
    default3.registerClass({ GTypeName: "LevelBar" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Overlay = class extends astalify(default2.Overlay) {
  static {
    default3.registerClass({ GTypeName: "Overlay" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
};
var Revealer = class extends astalify(default5.Revealer) {
  static {
    default3.registerClass({ GTypeName: "Revealer" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var Scrollable = class extends astalify(default2.Scrollable) {
  static {
    default3.registerClass({ GTypeName: "Scrollable" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var Slider = class extends astalify(default2.Slider) {
  static {
    default3.registerClass({ GTypeName: "Slider" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Stack = class extends astalify(default2.Stack) {
  static {
    default3.registerClass({ GTypeName: "Stack" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
};
var Switch = class extends astalify(default5.Switch) {
  static {
    default3.registerClass({ GTypeName: "Switch" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Window = class extends astalify(default2.Window) {
  static {
    default3.registerClass({ GTypeName: "Window" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/application.ts
import { setConsoleLogDomain } from "console";
import { exit, programArgs } from "system";
var application_default = new class AstalJS extends default2.Application {
  static {
    default3.registerClass(this);
  }
  eval(body) {
    return new Promise((res, rej) => {
      try {
        const fn = Function(`return (async function() {
                    ${body.includes(";") ? body : `return ${body};`}
                })`);
        fn()().then(res).catch(rej);
      } catch (error) {
        rej(error);
      }
    });
  }
  requestHandler;
  vfunc_request(msg, conn) {
    if (typeof this.requestHandler === "function") {
      this.requestHandler(msg, (response) => {
        default2.write_sock(
          conn,
          String(response),
          (_, res) => default2.write_sock_finish(res)
        );
      });
    } else {
      super.vfunc_request(msg, conn);
    }
  }
  apply_css(style, reset = false) {
    super.apply_css(style, reset);
  }
  quit(code) {
    super.quit();
    exit(code ?? 0);
  }
  start({ requestHandler, css, hold, main, client, icons, ...cfg } = {}) {
    client ??= () => {
      print(`Astal instance "${this.instanceName}" already running`);
      exit(1);
    };
    Object.assign(this, cfg);
    setConsoleLogDomain(this.instanceName);
    this.requestHandler = requestHandler;
    this.connect("activate", () => {
      const path = import.meta.url.split("/").slice(3);
      const file = path.at(-1).replace(".js", ".css");
      const css2 = `/${path.slice(0, -1).join("/")}/${file}`;
      if (file.endsWith(".css") && default7.file_test(css2, default7.FileTest.EXISTS))
        this.apply_css(css2, false);
      main?.(...programArgs);
    });
    if (!this.acquire_socket())
      return client((msg) => default2.Application.send_message(this.instanceName, msg), ...programArgs);
    if (css)
      this.apply_css(css, false);
    if (icons)
      this.add_icons(icons);
    hold ??= true;
    if (hold)
      this.hold();
    this.runAsync([]);
  }
}();

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/index.ts
default5.init(null);

// inline:/home/max/Personal/astalconfig/style.css
var style_default = "window.Bar {\n    background: transparent;\n    color: @theme_fg_color;\n    font-weight: bold;\n}\n\nwindow.Bar>centerbox {\n    background: @theme_bg_color;\n    border-radius: 10px;\n    margin: 8px;\n}\n\nwindow.Bar button {\n    border-radius: 8px;\n    margin: 2px;\n}\n";

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/gobject.ts
import GObject from "gi://GObject";
var gobject_default = GObject;
var meta = Symbol("meta");
var { ParamSpec, ParamFlags } = GObject;
var kebabify2 = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replaceAll("_", "-").toLowerCase();
function register(options = {}) {
  return function(cls) {
    GObject.registerClass({
      Signals: { ...cls[meta]?.Signals },
      Properties: { ...cls[meta]?.Properties },
      ...options
    }, cls);
  };
}
function property(declaration = Object) {
  return function(target, prop, desc) {
    target.constructor[meta] ??= {};
    target.constructor[meta].Properties ??= {};
    const name = kebabify2(prop);
    if (!desc) {
      let value = defaultValue(declaration);
      Object.defineProperty(target, prop, {
        get() {
          return value;
        },
        set(v) {
          if (v !== value) {
            value = v;
            this.notify(name);
          }
        }
      });
      Object.defineProperty(target, `set_${name.replace("-", "_")}`, {
        value: function(v) {
          this[prop] = v;
        }
      });
      Object.defineProperty(target, `get_${name.replace("-", "_")}`, {
        value: function() {
          return this[prop];
        }
      });
      target.constructor[meta].Properties[kebabify2(prop)] = pspec(name, ParamFlags.READWRITE, declaration);
    } else {
      let flags = 0;
      if (desc.get) flags |= ParamFlags.READABLE;
      if (desc.set) flags |= ParamFlags.WRITABLE;
      target.constructor[meta].Properties[kebabify2(prop)] = pspec(name, flags, declaration);
    }
  };
}
function pspec(name, flags, declaration) {
  if (declaration instanceof ParamSpec)
    return declaration;
  switch (declaration) {
    case String:
      return ParamSpec.string(name, "", "", flags, "");
    case Number:
      return ParamSpec.double(name, "", "", flags, -Number.MAX_VALUE, Number.MAX_VALUE, 0);
    case Boolean:
      return ParamSpec.boolean(name, "", "", flags, false);
    case Object:
      return ParamSpec.jsobject(name, "", "", flags);
    default:
      return ParamSpec.object(name, "", "", flags, declaration.$gtype);
  }
}
function defaultValue(declaration) {
  if (declaration instanceof ParamSpec)
    return declaration.get_default_value();
  switch (declaration) {
    case String:
      return "default-string";
    case Number:
      return 0;
    case Boolean:
      return false;
    case Object:
    default:
      return null;
  }
}

// service/niri.ts
import GLib from "gi://GLib?version=2.0";
import Gio3 from "gi://Gio?version=2.0";
var _state;
var Niri = class extends gobject_default.Object {
  constructor() {
    super();
    __privateAdd(this, _state);
    __privateSet(this, _state, {
      workspaces: /* @__PURE__ */ new Map(),
      windows: /* @__PURE__ */ new Map()
    });
    this.listenEventStream();
  }
  get workspacesWithWindows() {
    const wsmap = {};
    for (const win of __privateGet(this, _state).windows.values()) {
      const ws = __privateGet(this, _state).workspaces.get(win.workspace_id);
      if (!ws) {
        continue;
      }
      const output = ws.output;
      if (!(output in wsmap)) {
        wsmap[output] = { output, workspaces: {} };
      }
      if (!(win.workspace_id in wsmap[output].workspaces)) {
        wsmap[output].workspaces[win.workspace_id] = { ...ws, windows: [] };
      }
      wsmap[output].workspaces[win.workspace_id].windows.push(win);
    }
    return wsmap;
  }
  newConnection() {
    const path = GLib.getenv("NIRI_SOCKET");
    const client = new Gio3.SocketClient().connect(new Gio3.UnixSocketAddress({ path }), null);
    return client;
  }
  listenEventStream() {
    const client = this.newConnection();
    client.get_output_stream().write(JSON.stringify("EventStream") + "\n", null);
    const inputstream = new Gio3.DataInputStream({
      closeBaseStream: true,
      baseStream: client.get_input_stream()
    });
    this.readLineSocket(inputstream, (stream, result) => {
      if (!stream) {
        console.error("not stream");
        return;
      }
      const line = stream.read_line_finish(result)[0] ?? new Uint8Array([]);
      const text = new TextDecoder().decode(line);
      console.log(text);
      const message = JSON.parse(text);
      this.reconcileState(message);
    });
  }
  readLineSocket(inputstream, callback) {
    inputstream.read_line_async(0, null, (stream, result) => {
      callback(stream, result);
      if (!stream) {
        return;
      }
      this.readLineSocket(stream, callback);
    });
  }
  reconcileState(message) {
    if ("WorkspacesChanged" in message) {
      this.reconcileWorkspacesChanged(message.WorkspacesChanged.workspaces);
    }
    if ("WorkspaceActivated" in message) {
      this.reconcileWorkspaceActivated(message.WorkspaceActivated);
    }
    if ("WorkspaceActiveWindowChanged" in message) {
      this.reconcileWorkspaceActiveWindowChanged(message.WorkspaceActiveWindowChanged);
    }
    if ("WindowsChanged" in message) {
      this.reconcileWindowsChanged(message.WindowsChanged.windows);
    }
    if ("WindowOpenedOrChanged" in message) {
      this.reconcileWindowOpenedOrChanged(message.WindowOpenedOrChanged.window);
    }
    if ("WindowClosed" in message) {
      this.reconcileWindowClosed(message.WindowClosed);
    }
    if ("WindowFocusChanged" in message) {
      this.reconcileWindowFocusChanged(message.WindowFocusChanged);
    }
    this.notify("workspacesWithWindows");
  }
  reconcileWorkspacesChanged(workspaces) {
    __privateGet(this, _state)["workspaces"] = new Map(workspaces.map((ws) => [ws.idx, {
      id: ws.id,
      idx: ws.idx,
      name: ws.name,
      output: ws.output,
      active_window_id: ws.active_window_id,
      is_focused: ws.is_focused,
      is_active: ws.is_active
    }]));
  }
  reconcileWorkspaceActivated(workspaceActivated) {
    const id = workspaceActivated.id;
    const focused = workspaceActivated.focused;
    const workspace = __privateGet(this, _state).workspaces.get(id);
    if (!workspace) {
      console.warn(`Workspace ID ${id} not found in state`);
      return;
    }
    const output = workspace.output;
    __privateGet(this, _state).workspaces = new Map(Array.from(__privateGet(this, _state).workspaces, ([key, ws]) => {
      if (ws.output == output) {
        return [key, { ...ws, is_active: focused && id === ws.id }];
      }
      return [key, ws];
    }));
  }
  reconcileWorkspaceActiveWindowChanged(workspaceActiveWindowChanged) {
    const id = workspaceActiveWindowChanged.workspace_id;
    const active_window_id = workspaceActiveWindowChanged.active_window_id;
    const workspace = __privateGet(this, _state).workspaces.get(id);
    if (!workspace) {
      console.warn(`Workspace ID ${id} not found in state`);
      return;
    }
    workspace.active_window_id = active_window_id;
  }
  reconcileWindowsChanged(windows) {
    __privateGet(this, _state).windows = new Map(windows.map((w) => [w.id, {
      id: w.id,
      title: w.title,
      app_id: w.app_id,
      workspace_id: w.workspace_id,
      is_focused: w.is_focused
    }]));
  }
  reconcileWindowOpenedOrChanged(window) {
    if (!__privateGet(this, _state).windows.has(window.id)) {
      __privateGet(this, _state).windows.set(window.id, window);
    }
    if (window.is_focused) {
      __privateGet(this, _state).windows.forEach((window2, key) => {
        if (key != window2.id) {
          window2.is_focused = false;
        }
      });
    }
  }
  reconcileWindowClosed(windowClosed) {
    __privateGet(this, _state).windows.delete(windowClosed.id);
  }
  reconcileWindowFocusChanged(windowFocusChanged) {
    const window = __privateGet(this, _state).windows.get(windowFocusChanged.id);
    if (!window) {
      console.warn(`Cannot find window with ID ${windowFocusChanged.id} in the state`);
      return;
    }
    __privateGet(this, _state).windows.forEach((win, key) => {
      win.is_focused = key === windowFocusChanged.id;
    });
  }
};
_state = new WeakMap();
__decorateClass([
  property(Object)
], Niri.prototype, "workspacesWithWindows", 1);
Niri = __decorateClass([
  register({ GTypeName: "Niri" })
], Niri);

// ../../../../nix/store/v8sihz39sz6dd5q50f5ag13yljzfl22z-astal-0.1.0/share/astal/gjs/src/jsx/jsx-runtime.ts
function isArrowFunction(func) {
  return !Object.hasOwn(func, "prototype");
}
function jsx(ctor, { children, ...props }) {
  children ??= [];
  if (!Array.isArray(children))
    children = [children];
  children = children.filter(Boolean);
  if (children.length === 1)
    props.child = children[0];
  else if (children.length > 1)
    props.children = children;
  if (typeof ctor === "string") {
    return new ctors[ctor](props);
  }
  if (isArrowFunction(ctor))
    return ctor(props);
  return new ctor(props);
}
var ctors = {
  box: Box,
  button: Button,
  centerbox: CenterBox,
  circularprogress: CircularProgress,
  drawingarea: DrawingArea,
  entry: Entry,
  eventbox: EventBox,
  // TODO: fixed
  // TODO: flowbox
  icon: Icon,
  label: Label,
  levelbar: LevelBar,
  // TODO: listbox
  overlay: Overlay,
  revealer: Revealer,
  scrollable: Scrollable,
  slider: Slider,
  stack: Stack,
  switch: Switch,
  window: Window
};
var jsxs = jsx;

// widget/Bar.tsx
var niri = new Niri();
var time = Variable("").poll(1e3, "date");
function Bar(monitor) {
  return /* @__PURE__ */ jsx(
    "window",
    {
      className: "Bar",
      monitor,
      exclusivity: default2.Exclusivity.EXCLUSIVE,
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.LEFT | default2.WindowAnchor.RIGHT,
      application: application_default,
      children: /* @__PURE__ */ jsxs("centerbox", { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClicked: "echo hello",
            halign: default5.Align.CENTER,
            children: bind(niri, "workspacesWithWindows").as((ws) => Object.entries(ws).flatMap(([o, owswin]) => owswin).map((owswin) => /* @__PURE__ */ jsx("box", { children: Object.entries(owswin.workspaces).map(([_, ws2]) => /* @__PURE__ */ jsxs("button", { children: [
              "WS ",
              ws2.idx,
              " (",
              ws2.windows.length,
              ")"
            ] })) })))
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => print("hello"),
            halign: default5.Align.CENTER,
            children: /* @__PURE__ */ jsx("label", { label: time() })
          }
        )
      ] })
    }
  );
}

// app.ts
application_default.start({
  css: style_default,
  main() {
    Bar(0);
  }
});
