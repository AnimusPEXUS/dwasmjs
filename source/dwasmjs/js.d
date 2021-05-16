
alias value_id = size_t;

extern (C)
{

    // print callback
    value_id object_new();

    void value_free(value_id id);

    void send_string_test(string);

    int dwasmjsclass_value_get_type();

}

void send_string_test2(string s) {
    send_string_test
}

class ValueDispatcher {
    private uint[value_id] registry;
}

auto valueDispatcher = ValueDispatcher();

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
