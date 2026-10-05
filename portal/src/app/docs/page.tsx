const QUICKSTART = `KEY=sk_live_...

# Enroll customer-42 from 5 different photos. consent=true is required.
curl -X PUT http://localhost:3000/v1/subjects/customer-42 \\
  -H "x-api-key: $KEY" -F "consent=true" \\
  -F "images=@1.jpg" -F "images=@2.jpg" -F "images=@3.jpg" \\
  -F "images=@4.jpg" -F "images=@5.jpg"

# Is this new photo customer-42?  ->  {"match": true}
curl -X POST http://localhost:3000/v1/subjects/customer-42/verify \\
  -H "x-api-key: $KEY" -F "image=@new.jpg"

# Delete customer-42, their template and their consent records
curl -X DELETE http://localhost:3000/v1/subjects/customer-42 -H "x-api-key: $KEY"`

export default function DocsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Introduction</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Check whether a photo shows the person you enrolled under an ID.
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                    The API does 1:1 verification. You enroll a person from 5 photos under your own ID for
                    them, such as <code>customer-42</code>. Later you send one new photo for that ID and get
                    back <code>{`{"match": true}`}</code> or <code>{`{"match": false}`}</code>. It never
                    searches across everyone you have enrolled.
                </p>
                <p>
                    For each person we store a SHA-256 hash and a random 512x512 rotation. Photos and face
                    embeddings are never stored, and no stored record can be turned back into a face. See{" "}
                    <a href="/docs/enrollment" className="text-primary underline">Enrollment</a> for details.
                </p>

                <h3>Base URL</h3>
                <p>
                    Your gateway&apos;s address. When you run the stack locally it is:
                </p>
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <code>http://localhost:3000</code>
                </pre>

                <h3>Authentication</h3>
                <p>
                    Send your secret API key in the <code>x-api-key</code> header, or as{" "}
                    <code>Authorization: Bearer</code>. Create and revoke keys on the{" "}
                    <a href="/dashboard/api-keys" className="text-primary underline">API Keys</a> page.
                    You need a verified email address before you can create one. Keep keys on your server:
                    anyone holding a key can enroll, verify and delete people on your account.
                </p>
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <code>x-api-key: sk_live_...</code>
                </pre>

                <h3>Quickstart</h3>
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>{QUICKSTART}</code>
                </pre>

                <h3>Before you rely on it</h3>
                <p>
                    There is no liveness check yet, so a good printed photo of an enrolled person could pass.
                    Use it where you can see who is in front of the camera, or alongside your own checks.
                </p>
            </div>
        </div>
    )
}
