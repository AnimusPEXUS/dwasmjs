
let debug = true;

function debug_log(txt) {
    if (debug) {
        console.log("dwasmjs test index debug msg:", txt);
    }
}

debug_log("loading dwasmjs..");

var dwjs = new DWasmJSEnvironment();

debug_log("instantiating..");

WebAssembly.instantiateStreaming(
    fetch("dwasmjstestjs.wasm"),
    dwjs.importObject,
).then(
    (result) => {
        dwjs.useResult(result);
    }
).catch(
    (err) => {
        debug_log(err)
    }
);
