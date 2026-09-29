import { Badge } from "@/components/ui/badge"

export default function FacesDocsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Faces</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Detect and analyze faces in images.
                </p>
            </div>

            <div className="space-y-8">
                {/* Endpoint: Detect Faces */}
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-blue-500 hover:bg-blue-600">POST</Badge>
                        <h2 className="text-xl font-mono font-semibold">/v1/faces/detect</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Detects faces in an image URL or binary data. Returns bounding boxes and facial attributes.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Parameters</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">url</code>
                                    <span className="text-muted-foreground">string (required)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">The URL of the image to process.</li>

                                <li className="flex gap-2 mt-2">
                                    <code className="font-mono font-bold">attributes</code>
                                    <span className="text-muted-foreground">array</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">List of attributes to return (e.g., &apos;emotion&apos;, &apos;age&apos;).</li>
                            </ul>
                        </div>

                        <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto h-fit">
                            <div className="text-muted-foreground mb-2">{`// Request`}</div>
                            <pre>{`{
  "url": "https://example.com/photo.jpg",
  "attributes": ["emotion"]
}`}</pre>
                        </div>
                    </div>
                </div>

                {/* Endpoint: Register Face */}
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
                        <h2 className="text-xl font-mono font-semibold">/v1/faces</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Register a face for future verification or search.
                    </p>
                    {/* ... similar structure ... */}
                    <div className="bg-muted p-4 rounded-lg text-sm font-mono">
                        <p className="text-muted-foreground italic">Example hidden for brevity.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
