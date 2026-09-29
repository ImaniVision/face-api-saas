export default function DocsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Introduction</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Learn how to integrate Haida&apos;s facial recognition API into your application.
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                    Haida provides a powerful, scalable API for face detection, verification, and identification.
                    Our platform is built for developers who need enterprise-grade reliability and security.
                </p>

                <h3>Base URL</h3>
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <code>https://api.haida.com/v1</code>
                </pre>

                <h3>Authentication</h3>
                <p>
                    Authenticate your API requests by including your secret API key in the <code>Authorization</code> header.
                </p>
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <code>Authorization: Bearer sk_live_...</code>
                </pre>
                <p>
                    You can manage your API keys in the <a href="/dashboard/api-keys" className="text-primary underline">Developer Dashboard</a>.
                </p>
            </div>
        </div>
    )
}
