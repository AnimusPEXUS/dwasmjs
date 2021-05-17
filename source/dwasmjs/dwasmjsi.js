console.log("dwasmjsi.js start");
(() => {

    const debug = true
    const debug_log = (txt) => {
        if (debug) {
            console.log(txt);
        }
    }

    const utf8encoder = new TextEncoder('utf-8');
    const utf8decoder = new TextDecoder('utf-8');

    // const memGetInt32 = (addr) => {
    //     this.memory
    // }


    globalThis.DWasmJSEnvironment = class {
        constructor() {
            debug_log("constructor called");

            this._js_value_storage = new Map();
            this._id_by_value = new Map();
            this._released_id_pool = new Set();

            debug_log("lists created");

            this._predefined_values = [
                undefined,
                null,
                false,
                true,
                NaN,
                // infinity,
                globalThis,
                // this,
            ];

            debug_log("predefined values inserted");

            this._js_value_storage_id_counter = this._predefined_values.length;

            for (let i = 0; i != this._predefined_values.length; i++) {
                debug_log(i);
                this._js_value_storage[i] = this._predefined_values[i];
                this._id_by_value[this._predefined_values[i]] = i;
            }

            debug_log("populated _js_value_storage and _id_by_value");

            const newValueId = (v) => {
                var ret;
                debug_log("new value_id requested");
                if (this._released_id_pool.length != 0) {
                    debug_log("  reusing released");
                    ret = this._released_id_pool[0];
                    delete this._released_id_pool[0];
                } else {
                    debug_log("  allocating new");
                    ret = this._js_value_storage_id_counter;
                    this._js_value_storage_id_counter++;
                }
                return ret;
            }

            const storeJSValue = (v) => {
                debug_log("storing value");
                value_id = newValueId(v);
                this._js_value_storage[value_id] = v;
                debug_log(" stored as " + string(v));
                return value_id;
            };

            const releaseJSValue = (value_id) => {
                debug_log("releasing value " + string(value_id));
                if (value_id < this._predefined_values.length) {
                    throw new Exception("value_id value is too low");
                }
                try {
                    if (!this._js_value_storage.has(value_id)) {
                        return;
                    }
                    delete this._js_value_storage[value_id];
                } finally {
                    this._released_id_pool.add(value_id);
                }
            }

            const getJSValue = (value_id) => {
                return this._js_value_storage[value_id];
            }

            const memGetString = (addr, len) => {
                var buffer = new Uint8Array(
                    this.instance.exports.memory.buffer,
                    addr,
                    len
                );
                var msg = utf8decoder.decode(buffer);
                return msg;
            }

            this.importObject = {
                'env': {
                    'dwasmjsclass_console_log': (addr, length) => {
                        console.log(memGetString(addr, length))
                        return;
                    },
                },
                // 'dwasmjsclass_reflect_apply': (sp) => {
                //     sp >>>= 0;
                // },
                // 'dwasmjsclass_reflect_construct': (sp) => {
                //     sp >>>= 0;
                // },
                // 'dwasmjsclass_reflect_deleteProperty': (sp) => {
                //     sp >>>= 0;
                // },
                // 'dwasmjsclass_reflect_has': (sp) => {
                //     sp >>>= 0;
                // },
                // 'dwasmjsclass_reflect_get': (sp) => {
                //     sp >>>= 0;
                // },
                // 'dwasmjsclass_reflect_set': (sp) => {
                //     sp >>>= 0;
                // },
                //
                // 'dwasmjsclass_value_get_type': (sp) => {
                //     sp >>>= 0;
                //     return 123;
                // },

                // 'dwasmjsclass_console_log2': (addr, length) => {
                //     console.log(memGetString(addr, length))
                //     return;
                // },
            };

            debug_log("importObject populated");
        }

        setResult(result) {
            this.module = result.module;
            this.instance = result.instance;
            // this.memory = new DataView(this.instance.exports.memory.buffer);
        }

        async useResult(result) {
            debug_log("setResult");
            this.setResult(result);
            debug_log("run")
            const {
                exports
            } = result.instance;
            exports.run();
        }
    }
    console.log("globalThis.DWasmJSCode defined now");
})();
console.log("dwasmjsi.js end");
