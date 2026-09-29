"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ScanFace,
  ShieldCheck,
  BarChart3,
  Code2,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  UserCheck,
  Eye,
  Lock,
  Smartphone,
  LineChart,
  Activity,
  Clock,
  Terminal,
  FileCode2,
  Boxes,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "verification",
    label: "Verification",
    icon: ScanFace,
    title: "Enhanced Face Verification",
    description:
      "Simplify identity verification with our high-accuracy facial matching engine, enabling instant onboarding and secure authentication workflows.",
    features: [
      {
        icon: Fingerprint,
        title: "1:1 Face Matching",
        description:
          "Compare a live photo against a reference image with 99.7% accuracy. Our engine handles variations in lighting, angles, and accessories.",
        bullets: [
          "Sub-200ms response time",
          "Configurable confidence thresholds",
          "Multi-face detection in single frame",
        ],
      },
      {
        icon: UserCheck,
        title: "Document Verification",
        description:
          "Match a selfie against an ID document photo — passport, driver's license, or national ID. Supports 190+ countries.",
      },
      {
        icon: Eye,
        title: "Secure Enrollment",
        description:
          "Register face vectors with encrypted storage. Vectors are one-way — they cannot be reverse-engineered back to the original photo.",
        bullets: [
          "End-to-end encryption",
          "GDPR-compliant data handling",
          "Automatic vector expiration policies",
        ],
      },
    ],
  },
  {
    id: "liveness",
    label: "Liveness",
    icon: ShieldCheck,
    title: "Anti-Spoofing & Liveness Detection",
    description:
      "Protect against presentation attacks with passive and active liveness detection, keeping your verification pipeline secure.",
    features: [
      {
        icon: Lock,
        title: "Passive Liveness",
        description:
          "Detect spoofing from a single image — no user action required. Analyzes texture, moiré patterns, and depth cues.",
      },
      {
        icon: Smartphone,
        title: "Active Liveness",
        description:
          "Challenge-response flows that prompt users to blink, turn, or smile. Provides the highest level of assurance against sophisticated attacks.",
      },
      {
        icon: ShieldCheck,
        title: "Deepfake Detection",
        description:
          "Our models detect AI-generated face swaps and synthetic media with 99.2% accuracy across all major generation methods.",
        bullets: [
          "Real-time detection under 300ms",
          "Covers GANs, diffusion models, and face-swap apps",
          "Continuous model updates against new attack vectors",
        ],
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    title: "Real-Time Analytics & Monitoring",
    description:
      "Gain actionable insights into your verification flows with real-time dashboards, alerting, and detailed audit logs.",
    features: [
      {
        icon: LineChart,
        title: "Live Dashboard",
        description:
          "Monitor verification volume, success rates, and latency in real-time. Customizable date ranges and breakdowns by endpoint.",
      },
      {
        icon: Activity,
        title: "Anomaly Detection",
        description:
          "Automatic alerts when verification patterns deviate from baselines — detect fraud rings, bot attacks, or system issues instantly.",
      },
      {
        icon: Clock,
        title: "Audit Logs",
        description:
          "Complete audit trail for every verification event. Filter by user, result, timestamp, and risk score for compliance reporting.",
        bullets: [
          "90-day retention on Pro, unlimited on Enterprise",
          "Export to CSV, JSON, or integrate via webhook",
          "SOC 2 and GDPR audit-ready formats",
        ],
      },
    ],
  },
  {
    id: "developer",
    label: "Developer Tools",
    icon: Code2,
    title: "Developer-First SDKs & APIs",
    description:
      "Integrate face verification in minutes with our well-documented REST API and native SDKs for every major platform.",
    features: [
      {
        icon: Terminal,
        title: "REST API",
        description:
          "Clean, RESTful endpoints with predictable resource URLs, JSON request/response bodies, and standard HTTP status codes.",
      },
      {
        icon: FileCode2,
        title: "Native SDKs",
        description:
          "Official libraries for Python, Node.js, Go, Ruby, and Java. Mobile SDKs for React Native, Flutter, Swift, and Kotlin.",
        bullets: [
          "Type-safe interfaces with auto-completion",
          "Built-in retry logic and error handling",
          "Semantic versioning with changelog",
        ],
      },
      {
        icon: Webhook,
        title: "Webhooks & Events",
        description:
          "Subscribe to verification events in real-time. Configure webhook endpoints for verification.completed, verification.failed, and more.",
      },
    ],
  },
];

export function FeatureTabs() {
  const [activeTab, setActiveTab] = useState("verification");
  const activeCategory = categories.find((c) => c.id === activeTab)!;

  return (
    <section id="features" className="py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium transition-all ${
                activeTab === cat.id ?
                  "bg-primary text-primary-foreground shadow-lg scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <cat.icon className="h-5 w-5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
            {activeCategory.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {activeCategory.description}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {activeCategory.features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group rounded-3xl border border-border/40 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-foreground/10 hover:shadow-2xl ${
                index === 0 ? "md:row-span-2" : ""
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/50 mb-6 group-hover:bg-foreground group-hover:border-foreground transition-colors">
                <feature.icon className="h-7 w-7 text-foreground group-hover:text-background transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>
              {feature.bullets && (
                <ul className="space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-3 text-base text-muted-foreground"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-foreground/80 mt-0.5" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get started
            </Button>
          </Link>
          <Link href="#features">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-8 text-base gap-1 text-muted-foreground hover:text-foreground"
            >
              See more
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
