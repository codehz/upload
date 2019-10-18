var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Waitable {
    constructor(promise) {
        this.waitlist = [];
        promise.then(v => {
            this.value = v;
            this.waitlist.forEach(([fn]) => fn(v));
            this.waitlist = null;
        }).catch(e => {
            this.failed = e;
            this.waitlist.forEach(([, fn]) => fn(e));
        });
    }
    wait() {
        if (this.value != undefined)
            return Promise.resolve(this.value);
        if (this.failed != undefined)
            return Promise.reject(this.failed);
        return new Promise((...arg) => this.waitlist.push(arg));
    }
}
const csscache = new Map();
function css(url) {
    const ret = document.createElement("style");
    if (!csscache.has(url)) {
        csscache.set(url, new Waitable((() => __awaiter(this, void 0, void 0, function* () { return (yield fetch(url)).text(); }))()));
    }
    const e = csscache.get(url);
    e.wait().then(value => ret.appendChild(document.createTextNode(value))).catch(console.error);
    return ret;
}
class FileChooser extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(css("./file-chooser.css"));
        const input = shadow.appendChild(document.createElement("input"));
        input.id = "control";
        input.type = "file";
        input.multiple = true;
        input.onchange = () => {
            if (input.files.length == 0) {
                this.dispatchEvent(new CustomEvent("file-clear", { bubbles: true }));
            }
            else {
                for (const item of Array.from(input.files)) {
                    this.dispatchEvent(new CustomEvent("file-selected", { detail: item, bubbles: true }));
                }
                input.value = '';
            }
        };
    }
}
customElements.define("file-chooser", FileChooser);
class CustomButton extends HTMLElement {
    constructor(text, action) {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(css("./custom-button.css"));
        const textEl = shadow.appendChild(document.createElement("span"));
        textEl.innerText = text;
        this.addEventListener("click", action);
    }
}
customElements.define("custom-button", CustomButton);
class UploadProgress extends HTMLElement {
    constructor() {
        super();
        this.finished = false;
        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(css("./upload-progress.css"));
        this.containerEl = shadow.appendChild(document.createElement("div"));
        this.containerEl.id = "container";
        this.titleEl = this.containerEl.appendChild(document.createElement("a"));
        this.titleEl.id = "title";
        this.errEl = shadow.appendChild(document.createElement("span"));
        this.errEl.id = "error";
        this.addEventListener("click", () => {
            if (!this.finished) {
                this.dispatchEvent(new CustomEvent("cancel"));
            }
        });
    }
    set progress(value) {
        this.style.setProperty("--progress", (value * 100) + "%");
    }
    set error(value) {
        this.setAttribute("error", value);
    }
    get error() {
        return this.getAttribute("error");
    }
    link(target) {
        this.titleEl.href = target;
    }
    done(op) {
        this.finished = true;
        if (op) {
            this.setAttribute("done", "");
        }
    }
    add(el) {
        this.containerEl.appendChild(el);
    }
    attributeChangedCallback(name, old, cur) {
        switch (name) {
            case "title":
                this.titleEl.innerText = cur;
                break;
            case "error":
                this.errEl.innerText = cur;
                break;
        }
    }
    static get observedAttributes() {
        return ["title", "error"];
    }
}
customElements.define("upload-progress", UploadProgress);
