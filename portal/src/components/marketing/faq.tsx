"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What types of applications can use FaceAuth?",
    answer:
      "FaceAuth is designed for any application requiring identity verification — fintech onboarding, healthcare patient ID, access control, e-commerce fraud prevention, and more. Our API works with web, mobile, and IoT applications.",
  },
  {
    question: "How do you ensure data privacy and security?",
    answer:
      "All biometric data is processed in-memory and never persisted to disk. We use end-to-end encryption for all API calls, and our infrastructure is SOC 2 Type II certified. Face vectors are one-way — they cannot be reverse-engineered back into images.",
  },
  {
    question: "Can FaceAuth detect spoofing attempts?",
    answer:
      "Yes. Our passive liveness detection analyzes texture, depth cues, and micro-movements to distinguish real faces from photos, screens, or masks — all without requiring the user to perform any actions.",
  },
  {
    question: "What is the accuracy of face verification?",
    answer:
      "FaceAuth achieves 99.7% accuracy on standard benchmarks (LFW, FERET). Our false acceptance rate (FAR) is below 0.001% and false rejection rate (FRR) is below 0.5%, tunable via confidence thresholds.",
  },
  {
    question: "How fast is the API response time?",
    answer:
      "Average verification latency is under 200ms for 1:1 matching. Our infrastructure auto-scales to handle burst traffic, maintaining consistent sub-second response times even at 100K+ requests per minute.",
  },
  {
    question: "Do you offer SDKs for different platforms?",
    answer:
      "We provide official SDKs for Python, Node.js, Go, and a REST API for any language. Mobile SDKs for React Native, Flutter, iOS (Swift), and Android (Kotlin) are available for on-device capture.",
  },
];

export function FAQ() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground mb-2">FAQs</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Advice and answers from our engineering team.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-border/40"
            >
              <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
