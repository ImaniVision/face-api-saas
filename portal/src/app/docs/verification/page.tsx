import { Badge } from "@/components/ui/badge"

export default function VerificationDocsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Verification</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Verify if two faces belong to the same person.
                </p>
            </div>

            <div className="space-y-8">
                {/* Endpoint: Verify Faces */}
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-blue-500 hover:bg-blue-600">POST</Badge>
                        <h2 className="text-xl font-mono font-semibold">/v1/verify</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Compare two face IDs or two image URLs to determine similarity.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Parameters</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">source_id</code>
                                    <span className="text-muted-foreground">string (optional)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">The ID of the registered face.</li>

                                <li className="flex gap-2 mt-2">
                                    <code className="font-mono font-bold">target_url</code>
                                    <span className="text-muted-foreground">string (required)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">URL of the image to verify against.</li>
                            </ul>
                        </div>

                        <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto h-fit">
                            <div className="text-muted-foreground mb-2">{`// Request`}</div>
                            <pre>{`{
  "source_id": "face_123",
  "target_url": "https://example.com/selfie.jpg"
}`}</pre>
                            <div className="text-muted-foreground mb-2 mt-4">{`// Response`}</div>
                            <pre>{`{
  "match": true,
  "confidence": 0.98
}`}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
