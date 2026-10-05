const ERRORS: [string, string][] = [
    ["400", "Something in the request is wrong: not exactly 5 enrollment photos, the same photo sent twice, a photo with no face or several faces, a photo that doesn't look like the others, or consent missing. The message says which."],
    ["401", "Missing, malformed or revoked API key."],
    ["404", "Nobody is enrolled under this ID."],
    ["409", "This person was enrolled before protected templates existed. Enroll them again with 5 photos."],
    ["413", "A photo is larger than 5 MB."],
    ["415", "A photo isn't JPEG, PNG or WebP. We check the file contents, not its name."],
    ["429", "Rate limit reached. Wait for the number of seconds in Retry-After."],
    ["502", "The face service is down or returned something unexpected. Safe to retry."],
    ["503", "The rate limiter is unavailable, so requests are refused rather than let through unmetered. Safe to retry."],
]

export default function ErrorsDocsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Errors &amp; limits</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Every error is JSON with a <code>message</code> you can show or log.
                </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left p-4 w-20">Status</th>
                            <th className="text-left p-4">Meaning</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ERRORS.map(([status, meaning]) => (
                            <tr key={status} className="border-t">
                                <td className="p-4 font-mono font-semibold">{status}</td>
                                <td className="p-4 text-muted-foreground">{meaning}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <h3>Rate limits</h3>
                <p>
                    Each API key can make 20 calls in a burst, refilled at 1 per second (60 a minute). Responses
                    carry <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code> and{" "}
                    <code>X-RateLimit-Reset</code>, and a 429 also carries <code>Retry-After</code>. Every call
                    that passes authentication and the rate limit is counted on your usage page, including
                    ones that fail later (a 400 for a bad photo still counts).
                </p>
            </div>
        </div>
    )
}
