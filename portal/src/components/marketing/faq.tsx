"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What does the API do?",
    answer:
      "It answers one question: is this photo the person you enrolled under this ID? You enroll someone from 5 photos, then check any new photo against that one record. It never searches across everyone you have enrolled, because every extra comparison is another chance to match the wrong person.",
  },
  {
    question: "What do you store about a face?",
    answer:
      "Per person, a 32-byte hash and a 1 MiB random rotation matrix (the IronMask scheme). The face embedding is computed inside our ML service, used once and discarded, and photos are never saved. Getting the embedding back from a stolen record takes about 2^91 guesses. Re-enrolling someone issues a new record that can't be linked to the old one.",
  },
  {
    question: "How accurate is it?",
    answer:
      "On LFW, a public set of web photos, 2.1% of genuine attempts were rejected and 0 of 155,000 impostor attempts were accepted (311 people, 5 enrollment photos each). That is inside the FIDO Alliance thresholds of 5% and 1 in 10,000. It is an offline benchmark, not a certification. Live selfies taken in one sitting should do better than web photos taken years apart.",
  },
  {
    question: "Why five photos to enroll?",
    answer:
      "Averaging five captures gives a steadier template. In our tests, enrolling from one photo rejected 15.9% of genuine attempts; enrolling from five rejected 2.2%. Turn your head a little between shots. If the five photos don't all look like the same person, enrollment fails and tells you which photo.",
  },
  {
    question: "Does it detect spoofing?",
    answer:
      "Not yet. There is no liveness check, so a good printed photo of an enrolled person could pass. Use it where you can see who is in front of the camera, or alongside your own checks. Liveness detection is on the roadmap.",
  },
  {
    question: "How do I delete someone's data?",
    answer:
      "DELETE /v1/subjects/{id} removes the person, their template and their consent records. Deleting your account removes every API key, person and usage record under it. Enrollment itself fails unless you send consent=true, and the consent is stored with a timestamp.",
  },
  {
    question: "What does it cost?",
    answer:
      "Nothing during the beta. Each API key is limited to 60 calls a minute, with bursts of up to 20. Calls are counted per key so paid plans can be added later, but billing isn't built yet.",
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
            What the API does today, and what it doesn&apos;t do yet.
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
