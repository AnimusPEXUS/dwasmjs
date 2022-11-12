(() => {

    // ESN - means Environment Special Name
    const DWASMJS_ESN_PREFIX = "d_wasmjs_environment";
    const DWASMJS_ESN_ValueMgr_PREFIX = DWASMJS_ESN_PREFIX + "_ValueMgr";

    const debug = true

    // TODO: make 32 or 64 dependable on system bitness
    const c2pow32 = 2 ** 15;

    function debug_log(txt) {
        if (debug) {
            console.log("dwasmjs debug msg:", txt);
        }
    }

    debug_log("dwasmjs debug messaging is ON");
    debug_log("setting up environment");

    const utf8encoder = new TextEncoder('utf-8');
    const utf8decoder = new TextDecoder('utf-8');

    function memGetBytes(mem_buff, addr, len) {
        if (!(mem_buff instanceof ArrayBuffer)) {
            throw "mem_buff invalid type";
        }
        let buffer = new Uint8Array(mem_buff, addr, len);
        return buffer;
    }

    function memSetBytes(buffer_with_value_to_write, mem_buff, addr, len) {
        if (!(mem_buff instanceof ArrayBuffer)) {
            throw "mem_buff invalid type";
        }
        if (!(buffer_with_value_to_write instanceof Uint8Array)) {
            throw "buffer_with_value_to_write invalid type";
        }
        let target_buffer = new Uint8Array(mem_buff, addr, len);
        target_buffer.set(buffer_with_value_to_write);
        return;
    }


    class ValueMgrItem {
        constructor(value) {
            this.value = value;
            this.uniqueId = 0;
        }
    }

    class ValueMgr {
        constructor() {
            this.value_storage = {};
        }

        uniqueIdGenerate() {
            let ret = 0;
            do {
                // TODO: this way of random number finding maybe not have 
                //       enough resolution. better resolution required.
                //       MDN says Math.random have resolution up to 2**53,
                //       so maybe it's already ok
                ret = Math.floor(c2pow32 * Math.random());
            } while (ret in this.value_storage);
            return ret;
        }

        createNew() {
            return this.storeNew(undefined);
        }

        storeNew(value) {
            let uniqueId = this.uniqueIdGenerate();
            let res = new ValueMgrItem(value);

            res.uniqueId = uniqueId;

            this.value_storage[uniqueId] = res;

            return uniqueId;
        }

        log(id) {
            let x = this.getItem(id);
            if (x === undefined) {
                console.log(id, "undefined");
                return;
            }
            console.log(id, "===", x.value);
        }

        have(id) {
            return id in this.value_storage;
        }

        get(id) {
            if (!this.have(id)) {
                return undefined;
            }
            return this.value_storage[id].value;
        }

        getItem(id) {
            if (!this.have(id)) {
                return undefined;
            }
            return this.value_storage[id];
        }

        set(id, v) {
            if (!this.have(id)) {
                throw "id not found";
            }
            this.value_storage[id].value = v;
        }

        del(id) {
            console.log("deleting", id);
            delete this.value_storage[id];
        }

        getType(id) {
            let x = this.getItem(id);
            if (x != undefined) {
                return typeof (x.value)
            }
            return undefined;
        }

        isUndefined(id) {
            let x = this.getItem(id);
            return x === undefined ? false : x.value === undefined;
        }

        setUndefined(id) {
            this.set(id, undefined);
        }

        isNull(id) {
            let x = this.getItem(id);
            return x === undefined ? false : x.value === null;
        }

        setNull(id) {
            this.set(id, null);
        }

        isNaN(id) {
            let x = this.getItem(id);
            return x === undefined ? false : x.value === NaN;
        }

        setNaN(id) {
            this.set(id, NaN);
        }

        isInfinity(id) {
            let x = this.getItem(id);
            return x === undefined ? false : x.value === Infinity;
        }

        setInfinity(id) {
            this.set(id, Infinity);
        }

        isString(id) {
            let x = this.getItem(id);
            if (x === undefined) {
                return false;
            }

            return (typeof (x.value) === "string" || x.value instanceof String)
        }

        // TODO: is this have to be here?
        getStringLength(id) {
            let x = this.getItem(id);
            if (x === undefined) {
                return undefined;
            }

            if (typeof (x.value) === "string" || x.value instanceof String) {
                return x.value.length;
            }

            return null;
        }

        convertStringUTF8ByteArray(id) {
            let x = this.getItem(id);
            if (x === undefined) {
                return undefined;
            }

            let s = this.getStringAsString(id);

            var res = new TextEncoder("utf-8").encode(s);
            let ret_id = this.storeNew(res);
            return ret_id;
        }

        // this alvays return value of type 'string' if Value have type 'string' or
        // Value instance of String.
        // this function is not to be exported to wasm
        getStringAsString(id) {
            let x = this.getItem(id);
            if (x === undefined) {
                return undefined;
            }

            let res = "";

            if (typeof (x.value) === "string") {
                res = x.value;
            }

            if (x.value instanceof String) {
                res = x.value.toString();
            }
            return res;
        }

        getByteArrayLength(id) {
            let x = this.getItem(id);
            if (x === undefined) {
                return undefined;
            }
            if (!(x.value instanceof Uint8Array)) {
                return null;
            }
            return x.value.length;
        }

        setStringFromMemBytes(id, mem, addr, len) {
            let b = memGetBytes(mem, addr, len);
            let bs = utf8decoder.decode(b);
            this.set(id, bs);
        }

        getStringToMemBytes(id, mem, addr, len) {
            let x = this.getItem(id);
            if (x === undefined) {
                throw "id undefined";
            }

            let s = getStringAsString(id);
            let b = utf8encoder.encode(s);

            memSetBytes(b, mem, addr, len);
        }

    }

    debug_log("installing global DWasmJSEnvironment class");
    globalThis.DWasmJSEnvironment = class {
        constructor() {

            debug_log("new global DWasmJSEnvironment being constructed");

            this.value_mgr = new ValueMgr();

            this.importObject = {}
            this.importObject["env"] = {}

            this.importObject["env"][DWASMJS_ESN_PREFIX + '_console_log'] =
                (txt, txtl) => {
                    console.log(
                        "console_log out:",
                        memGetBytes(
                            this.instance.exports.memory.buffer,
                            txt, txtl
                        )
                    );
                };



            // ########## ValueMgr usage ##########

            // this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'printValues'] =
            //     this.value_mgr.printValues;


            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'createNew'] =
                () => {
                    return this.value_mgr.createNew();
                };

            // NOTE: storeNew, probably, is not for import to wasm
            // this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX +'_'+ 'storeNew'] =
            //     value_mgr.storeNew;

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'have'] =
                (id) => {
                    return this.value_mgr.have(id)
                };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'log'] =
                (id) => { this.value_mgr.log(id); };


            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'get'] =
                (id) => {
                    return this.value_mgr.get(id)
                };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'set'] =
                (id, v) => {
                    return this.value_mgr.set(id, v)
                };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'del'] =
                (id) => {
                    return this.value_mgr.del(id)
                };

            ["Boolean", "String", "Integer", "Float"].forEach(element => {
                this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'get' + element] =
                    (id) => { return this.value_mgr.get(id); };

                this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'set' + element] =
                    (id, v) => { this.value_mgr.gstValue(id, v); };
            });

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'getType'] =
                this.value_mgr.getType;

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'isUndefined'] =
                (id) => { return this.value_mgr.isUndefined(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'isNull'] =
                (id) => { return this.value_mgr.isNull(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'isNaN'] =
                (id) => { return this.value_mgr.isNaN(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'isInfinity'] =
                (id) => { return this.value_mgr.isInfinity(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'setUndefined'] =
                (id) => { this.value_mgr.setUndefined(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'setNull'] =
                (id) => { this.value_mgr.setNull(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'setNaN'] =
                (id) => { this.value_mgr.setNaN(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'setInfinity'] =
                (id) => { this.value_mgr.setInfinity(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'isString'] =
                (id) => { return this.value_mgr.isString(id); };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'convertStringUTF8ByteArray'] =
                (id) => {
                    return this.value_mgr.convertStringUTF8ByteArray(id);
                };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'getByteArrayLength'] =
                (id) => {
                    return this.value_mgr.getByteArrayLength(id);
                };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'setStringFromMemBytes'] =
                (id, addr, len) => {
                    this.value_mgr.setStringFromMemBytes(
                        id,
                        this.instance.exports.memory.buffer,
                        addr, len
                    );
                };

            this.importObject["env"][DWASMJS_ESN_ValueMgr_PREFIX + '_' + 'getStringToMemBytes'] =
                (id, addr, len) => {
                    this.value_mgr.getStringToMemBytes(
                        id,
                        this.instance.exports.memory.buffer,
                        addr, len
                    );
                };

        }

        setResult(result) {
            this.module = result.module;
            this.instance = result.instance;
            // this.memory = new DataView(
            //     this.instance.exports.memory.buffer
            // );
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
    debug_log("global DWasmJSEnvironment installed ok");
    debug_log("ready!");
})();
console.log("dwasmjs loaded");