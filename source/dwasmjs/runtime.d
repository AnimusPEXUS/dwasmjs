module dwasmjs.runtime;

version (WebAssembly)
{
    extern (C)
    {
        nothrow @nogc @trusted void __assert(const(char)* exp, const(char)* file, uint line)
        {
            // TODO: todo
        }
    }
    // void __assert_fail(const(char)* exp, const(char)* file, uint line, const(char)* func);
    // void __assert_perror_fail(int errnum, const(char)* file, uint line, const(char)* func);

    alias long time_t;
}
