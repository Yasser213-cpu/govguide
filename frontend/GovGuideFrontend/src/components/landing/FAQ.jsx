import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../landing/ui/Accordion";
const faqs = [
  {
    q: "What is GovGuide?",
    a: "GovGuide is an AI-powered platform that helps citizens discover, understand, and access Egyptian government services from one modern interface \u2014 eliminating the complexity of traditional government websites.",
  },
  {
    q: "Is the AI assistant free?",
    a: "Yes, the AI assistant is fully included in all plans including the free tier. You can get instant guidance on any service, at any time, without paying anything.",
  },
  {
    q: "Can I book appointments online?",
    a: "Yes. You can book appointments directly with government service providers through GovGuide, bypassing traditional phone queues and in-person visits entirely.",
  },
  {
    q: "How secure is my data?",
    a: "We use bank-level AES-256 encryption and comply with Egyptian data protection regulations. Your information is never shared with third parties without your explicit consent.",
  },
  {
    q: "What services are available?",
    a: "We currently cover 500+ services including passport renewal, national ID cards, business registration, birth certificates, marriage certificates, driving licenses, tax clearance, and more.",
  },
  {
    q: "Is GovGuide available in Arabic?",
    a: "Yes. The platform fully supports both Arabic and English with native RTL layout for Arabic users, ensuring an equally excellent experience in both languages.",
  },
];
export default function FAQ() {
  return (
    <section className="py-28 bg-[var(--background-primary)]" id="faq">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
            >
              Frequently asked questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[var(--text-secondary)]"
            >
              Everything you need to know about GovGuide.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:border-[var(--primary)]/30 transition-colors duration-200 px-0"
                >
                  <AccordionTrigger className="text-left font-semibold text-base hover:text-[var(--primary)] transition-colors px-6 py-4 hover:no-underline data-[state=open]:text-[var(--primary)]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[var(--text-secondary)] leading-relaxed text-sm px-6 pb-5 pt-0">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
