import vibe.vibe;

void main()
{
    auto fsettings = new HTTPFileServerSettings;
    fsettings.serverPathPrefix = "/static";

    auto router = new URLRouter;
    router.get("/static/*", serveStaticFiles("_wasm/", fsettings));

    auto settings = new HTTPServerSettings;
    settings.port = 8080;
    settings.tlsContext = createTLSContext(TLSContextKind.server);
    settings.tlsContext.useCertificateChainFile("./cert/cert.pem");
    settings.tlsContext.usePrivateKeyFile("./cert/key.pem");

    listenHTTP(settings, router);

    runApplication();
}
