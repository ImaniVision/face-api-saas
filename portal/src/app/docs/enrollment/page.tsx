import { Badge } from "@/components/ui/badge"

export default function EnrollmentDocsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Enrollment</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Enroll a person from 5 photos, or delete them.
                </p>
            </div>

            <div className="space-y-8">
                {/* Endpoint: Enroll */}
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-amber-500 hover:bg-amber-600">PUT</Badge>
                        <h2 className="text-xl font-mono font-semibold">/v1/subjects/{"{externalId}"}</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Enrolls the person you call <code>externalId</code>, or re-enrolls them. Re-enrolling
                        replaces their template with a new one that can&apos;t be linked to the old one.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Multipart fields</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">images</code>
                                    <span className="text-muted-foreground">file, exactly 5 (required)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">
                                    Repeat the field 5 times. Each photo: JPEG, PNG or WebP, at most 5 MB, exactly
                                    one face. Send 5 different captures; turning the head a little between them
                                    helps. Copies of one photo are rejected.
                                </li>

                                <li className="flex gap-2 mt-2">
                                    <code className="font-mono font-bold">consent</code>
                                    <span className="text-muted-foreground">&quot;true&quot; (required)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">
                                    Confirms the person agreed to enrollment. Stored with a timestamp.
                                </li>

                                <li className="flex gap-2 mt-2">
                                    <code className="font-mono font-bold">consent_reference</code>
                                    <span className="text-muted-foreground">string (optional)</span>
                                </li>
                                <li className="text-muted-foreground text-xs ml-8">
                                    Your own pointer to the consent record, up to 256 characters.
                                </li>
                            </ul>
                            <p className="text-sm text-muted-foreground mt-4">
                                <code>externalId</code>: 1 to 128 of <code>A-Z a-z 0-9 _ . @ : -</code>.
                            </p>
                        </div>

                        <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto h-fit">
                            <div className="text-muted-foreground mb-2">{`// Response 200`}</div>
                            <pre>{`{
  "externalId": "customer-42",
  "consentId": "3f2c…",
  "consentGrantedAt": "2026-10-03T14:07:12.000Z"
}`}</pre>
                            <div className="text-muted-foreground mb-2 mt-4">{`// Response 400`}</div>
                            <pre>{`{
  "message": "Photo 3 does not look like
    the same person as the others"
}`}</pre>
                        </div>
                    </div>
                </div>

                {/* Endpoint: Delete */}
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
                        <h2 className="text-xl font-mono font-semibold">/v1/subjects/{"{externalId}"}</h2>
                    </div>
                    <p className="text-muted-foreground">
                        Deletes the person, their template and their consent records. Returns 204, or 404 if
                        there is no such person.
                    </p>
                </div>

                {/* What is stored */}
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h3>What is stored</h3>
                    <p>
                        The 5 photos are turned into face embeddings inside our ML service. Every photo must look
                        like the same person as the average of the 5; if one doesn&apos;t, enrollment fails and
                        names it. The average is then protected with IronMask: we pick a secret random code,
                        build a random 512x512 rotation that maps the face onto it, and keep only the
                        rotation (257 KiB, stored at 8-bit precision) and a SHA-256 hash of the code (32 bytes). The photos and embeddings are
                        discarded.
                    </p>
                    <p>
                        Getting the face embedding back from a stolen record means guessing the code, about 2^91
                        tries. On the LFW benchmark this setup rejected 2.1% of genuine attempts and accepted
                        none of 155,000 impostor attempts.
                    </p>
                </div>
            </div>
        </div>
    )
}
