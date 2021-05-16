(() => {

    const utf8encoder = new TextEncoder('utf-8');
    const utf8decoder = new TextDecoder('utf-8');

    const memGetInt32 = (addr) => {
        this.memory
    }

    const memGetString = (addr, len) => {
        var buffer = new Uint8Array(this.memory.buffer, ptr, len);
        var msg = utf8decoder.decode(buffer);
        return msg;
    }


    global.DWasmJSCode = class {
        constructor(filename) {

            this._js_value_storage = new Map();
            this._id_by_value = new Map();
            this._released_id_pool = = new Set();

            this._predefined_values = [
                undefined,
                null,
                false,
                true,
                NaN,
                infinity,
                globalThis,
                this,
            ];

            this._js_value_storage_id_counter = this._predefined_values.size;

            for (let i = 0; i != this._predefined_values.size; i++) {
                this._js_value_storage[i] = this._predefined_values[i];
                this._id_by_value[this._predefined_values[i]] = i;
            }

            const newValueId = (v) => {
                if (this._released_id_pool.size != 0) {
                    ret = this._released_id_pool[0];
                    delete this._released_id_pool[0];
                    return ret;
                } else {
                    ret = this._js_value_storage_id_counter;
                    this._js_value_storage_id_counter++;
                    return ret;
                }
            }

            const storeJSValue = (v) => {
                value_id = newValueId(v);
                this._js_value_storage[value_id] = v;
                return value_id;
            };

            const releaseJSValue = (value_id) => {
                if (value_id < this._predefined_values.size) {
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

            this.importObject = {
                'dwasmjsclass_reflect_apply': (sp) => {
                    sp >>>= 0;
                },
                'dwasmjsclass_reflect_construct': (sp) => {
                    sp >>>= 0;
                },
                'dwasmjsclass_reflect_deleteProperty': (sp) => {
                    sp >>>= 0;
                },
                'dwasmjsclass_reflect_has': (sp) => {
                    sp >>>= 0;
                },
                'dwasmjsclass_reflect_get': (sp) => {
                    sp >>>= 0;
                },
                'dwasmjsclass_reflect_set': (sp) => {
                    sp >>>= 0;
                },

                'dwasmjsclass_value_get_type': (sp) => {
                    sp >>>= 0;
                    return 123;
                },
            };

            WebAssembly.instantiateStreaming(
                fetch(filename),
                this.importObject,
            ).then(
                (result) => {
                    this.instance = result.instance;
                    this.memory = new DataView(this.instance.exports.mem.buffer);
                }
            );

        }
    }

})();
