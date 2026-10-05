import { Badge } from "@/components/ui/badge"

const RULES: [string, string][] = [
    ["amount_over_limit", "amount is 100000 or more (1,000.00 in minor units)"],
    ["new_payee", "no earlier approved payment from this person to this payee"],
    ["new_device", "no earlier approved payment from this person on this device ID"],
]

export default function PaymentsDocsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Risk-checked payments</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Ask for a face only when a payment looks risky.
                </p>
            </div>

            <div className="space-y-8">
                <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-blue-500 hover:bg-blue-600">POST</Badge>
                        <h2 className="text-xl font-mono font-semibold break-all">
                            /v1/subjects/{"{externalId}"}/transactions
                        </h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        A mock payment API with a rules engine in front of it. Send the payment without a
                        photo first. If no rule fires it is approved straight away. If a rule fires you get{" "}
                        <code>face_required</code> and the reasons; send the same payment again with a selfie
                        and it is approved only if the selfie matches the enrolled person. The selfie is checked
                        in the same request as the payment, so a match can&apos;t be reused for a different one.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Multipart fields</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">amount</code>
                                    <span className="text-muted-foreground">integer, minor units (required)</span>
                                </li>
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">payee</code>
                                    <span className="text-muted-foreground">your ID for the payee (required)</span>
                                </li>
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">device_id</code>
                                    <span className="text-muted-foreground">your ID for the device (required)</span>
                                </li>
                                <li className="flex gap-2">
                                    <code className="font-mono font-bold">image</code>
                                    <span className="text-muted-foreground">selfie, only after <code>face_required</code></span>
                                </li>
                            </ul>
                            <h3 className="font-semibold mb-2 mt-6">Response <code>status</code></h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><code>approved</code> recorded; <code>faceVerified</code> says whether a face was checked</li>
                                <li><code>face_required</code> nothing recorded; resend with <code>image</code></li>
                                <li><code>declined</code> the selfie did not match; nothing recorded</li>
                            </ul>
                            <h3 className="font-semibold mb-2 mt-6">Rules</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {RULES.map(([reason, when]) => (
                                    <li key={reason}><code>{reason}</code> {when}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto h-fit">
                            <div className="text-muted-foreground mb-2">{`// Request`}</div>
                            <pre>{`curl -X POST \\
  http://localhost:3000/v1/subjects/customer-42/transactions \\
  -H "x-api-key: $KEY" \\
  -F "amount=150000" \\
  -F "payee=acct-889" \\
  -F "device_id=phone-1"`}</pre>
                            <div className="text-muted-foreground mb-2 mt-4">{`// Response 200`}</div>
                            <pre>{`{
  "status": "face_required",
  "reasons": ["amount_over_limit"]
}`}</pre>
                        </div>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h3>What is stored</h3>
                    <p>
                        Approved payments only: the amount, whether a face was checked, and SHA-256 hashes of
                        the payee and device IDs. The history is what makes a payee or device &quot;known&quot;, and it
                        is deleted with the person. A person&apos;s first payment always asks for a face.
                    </p>
                    <p>
                        This is a demonstration of risk-based step-up, not a payment processor: no money moves,
                        and the limit and rules are fixed.
                    </p>
                </div>
            </div>
        </div>
    )
}
