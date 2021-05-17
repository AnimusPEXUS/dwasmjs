
alias value_id = size_t;

extern (C)
{

    int dwasmjsclass_value_get_type();

    void dwasmjsclass_console_log(immutable(char)* str, size_t len);
}

/* extern{
    _D6object6Object8toStringMFZAya
} */


void consoleLog(string txt)
{
    dwasmjsclass_console_log(txt.ptr, txt.length);
}


class Value {

    private value_id id;
    private bool value_have_to_be_released = false;


    this() {
    }

    this(value_id id) {
        this.id = id;
    }

    ~this() {
        if (value_have_to_be_released)
        {

        }
    }
}
