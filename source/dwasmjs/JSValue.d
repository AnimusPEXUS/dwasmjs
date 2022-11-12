module dwasmjs.JSValue;

import std.format;

// ESN - means Environment Special Name
// const DWASMJS_ESN_PREFIX = "d_wasmjs_environment";
// const DWASMJS_ESN_ValueMgr_PREFIX = DWASMJS_ESN_PREFIX ~ "_ValueMgr";

extern (C)
{
    int d_wasmjs_environment_ValueMgr_createNew();
    // string d_wasmjs_environment_ValueMgr_storeNewValue();
    bool d_wasmjs_environment_ValueMgr_have(int id);

    bool d_wasmjs_environment_ValueMgr_getBoolean(int id);
    void d_wasmjs_environment_ValueMgr_setBoolean(int id, bool v);

    string d_wasmjs_environment_ValueMgr_getString(int id);
    void d_wasmjs_environment_ValueMgr_setString(int id, string v);

    long d_wasmjs_environment_ValueMgr_getInteger(int id);
    void d_wasmjs_environment_ValueMgr_setInteger(int id, long v);

    double d_wasmjs_environment_ValueMgr_getFloat(int id);
    void d_wasmjs_environment_ValueMgr_setFloat(int id, double v);

    void d_wasmjs_environment_ValueMgr_del(int id);
    string d_wasmjs_environment_ValueMgr_getType(int id);

    bool d_wasmjs_environment_ValueMgr_isUndefined(int id);
    void d_wasmjs_environment_ValueMgr_setUndefined(int id);
    bool d_wasmjs_environment_ValueMgr_isNull(int id);
    void d_wasmjs_environment_ValueMgr_setNull(int id);
    bool d_wasmjs_environment_ValueMgr_isNaN(int id);
    void d_wasmjs_environment_ValueMgr_setNaN(int id);
    bool d_wasmjs_environment_ValueMgr_isInfinity(int id);
    void d_wasmjs_environment_ValueMgr_setInfinity(int id);

    bool d_wasmjs_environment_ValueMgr_isString(int id);
    int d_wasmjs_environment_ValueMgr_convertStringUTF8ByteArray(int id);
    int d_wasmjs_environment_ValueMgr_getByteArrayLength(int id);

    void d_wasmjs_environment_ValueMgr_setStringFromMemBytes(int id, int s_ptr, int s_len);
    void d_wasmjs_environment_ValueMgr_getStringToMemBytes(int id, int s_ptr, int s_len);

    void d_wasmjs_environment_ValueMgr_log(int id);

    void d_wasmjs_environment_console_log(immutable(char)* str, size_t len);
}

void console_log(string txt)
{
    d_wasmjs_environment_console_log(txt.ptr, txt.length);
}

struct JSValue
{
    int id;

    ~this()
    {
        d_wasmjs_environment_ValueMgr_del(id);
    }

    void log()
    {
        d_wasmjs_environment_ValueMgr_log(id);
    }

    bool getBoolean()
    {
        bool ret = d_wasmjs_environment_ValueMgr_getBoolean(id);
        return ret;
    }

    void setBoolean(bool val)
    {
        d_wasmjs_environment_ValueMgr_setBoolean(id, val);
    }

    JSValue convertStringUTF8ByteArray()
    {
        auto r = d_wasmjs_environment_ValueMgr_convertStringUTF8ByteArray(id);
        auto ret = JSValue(r);
        return ret;
    }

    int getByteArrayLength()
    {
        auto ret = d_wasmjs_environment_ValueMgr_getByteArrayLength(id);
        return ret;
    }

    bool isString()
    {
        return d_wasmjs_environment_ValueMgr_isString(id);
    }

    string getString()
    {
        if (!isString())
            return "";
        auto new_jv = convertStringUTF8ByteArray();
        auto new_jv_len = new_jv.getByteArrayLength();

        string ret;

        ret.length = new_jv_len;

        d_wasmjs_environment_ValueMgr_getStringToMemBytes(id, cast(int) ret.ptr, ret.length);
        return ret;
    }

    void setString(string val)
    {
        d_wasmjs_environment_ValueMgr_setStringFromMemBytes(id, cast(int) val.ptr, val.length);
    }
}

JSValue newJSValue()
{
    int id = d_wasmjs_environment_ValueMgr_createNew();
    auto ret = JSValue();
    ret.id = id;
    return ret;
}
