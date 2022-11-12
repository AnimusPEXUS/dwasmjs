import dwasmjs;

extern (C) void _start()
{
}

extern (C) void run()
{
    auto jsv = newJSValue();
    jsv.log();
    jsv.setString("cool string");
    auto s = jsv.getString();
    jsv.log();

    jsv.setBoolean(true);
    jsv.log();

}
