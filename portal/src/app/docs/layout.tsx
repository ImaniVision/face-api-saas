import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <aside className="w-full border-r bg-muted/20 md:w-64 md:min-h-screen md:shrink-0">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        Haida <span className="text-sm font-normal text-muted-foreground">Docs</span>
                    </Link>
                </div>
                <div className="p-4">
                    <div className="mb-4">
                        <h4 className="mb-2 px-2 text-sm font-semibold tracking-tight">Getting Started</h4>
                        <div className="space-y-1">
                            <Link href="/docs">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    Introduction
                                </Button>
                            </Link>
                            <Link href="/docs/authentication">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    Authentication
                                </Button>
                            </Link>
                            <Link href="/docs/errors">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    Errors
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h4 className="mb-2 px-2 text-sm font-semibold tracking-tight">API Reference</h4>
                        <div className="space-y-1">
                            <Link href="/docs/faces">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    Faces
                                </Button>
                            </Link>
                            <Link href="/docs/verification">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    Verification
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 px-2">
                        <Link href="/dashboard">
                            <Button size="sm" className="w-full">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>
            <main className="flex-1 py-8 px-6 md:px-12 md:py-12 max-w-4xl">
                {children}
            </main>
        </div>
    )
}
