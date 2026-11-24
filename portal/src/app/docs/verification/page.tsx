import { Badge } from "@/components/ui/badge"

export default function VerificationDocsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Verification</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Is this photo the person enrolled under this ID?
                </p>
            </div>

            <div className="space-y-8">
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-blue-500 hover:bg-blue-600">POST</Badge>
                        <h2 className="text-xl font-mono font-semibold">/v1/subjects/{"{externalId}"}/verify</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Compares one photo with the one person enrolled as <code>externalId</code>. There is no
                        similarity score: a protected template can only answer match or no match.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Multipart fields</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">image</code>
                                    <span className="text-muted-foreground">file (required)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">
                                    JPEG, PNG or WebP, at most 5 MB, exactly one face.
                                </li>
                            </ul>
                            <h3 className="font-semibold mb-2 mt-6">Status codes</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><code>200</code> the comparison ran; read <code>match</code></li>
                                <li><code>400</code> no face, or more than one face, in the photo</li>
                                <li><code>404</code> nobody is enrolled under this ID</li>
                                <li>
                                    <code>409</code> enrolled before protected templates existed; enroll them
                                    again with 5 photos
                                </li>
                            </ul>
                        </div>

                        <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto h-fit">
                            <div className="text-muted-foreground mb-2">{`// Request`}</div>
                            <pre>{`curl -X POST \\
  http://localhost:3000/v1/subjects/customer-42/verify \\
  -H "x-api-key: $KEY" \\
  -F "image=@new.jpg"`}</pre>
                            <div className="text-muted-foreground mb-2 mt-4">{`// Response 200`}</div>
                            <pre>{`{
  "match": true
}`}</pre>
                        </div>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h3>How often it is wrong</h3>
                    <p>
                        On LFW, a public set of web photos (311 people, 5 enrollment photos each), 2.1% of genuine
                        attempts got <code>false</code> and 0 of 155,000 impostor attempts got <code>true</code>.
                        Selfies taken in one sitting should do better than web photos taken years apart, but we
                        haven&apos;t measured that yet. If someone is rejected, ask for another photo in better
                        light before treating it as a different person.
                    </p>
                    <p>
                        There is no liveness check yet: a good printed photo of the enrolled person could get{" "}
                        <code>true</code>.
                    </p>
                </div>
            </div>
        </div>
    )
}
