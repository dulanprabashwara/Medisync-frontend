"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is MediSync?",
    answer:
      "MediSync is a digital healthcare platform connecting Patients, verified Doctors, and Pharmacists in a streamlined workflow.",
  },
  {
    question: "Who can use MediSync?",
    answer:
      "Patients seeking online medical care, verified Doctors providing telehealth services, and verified Pharmacists dispensing prescriptions.",
  },
  {
    question: "How do HD Video Consultations work?",
    answer:
      "Once a booking is accepted by your Doctor, a Join Video Call button appears in your Consultation workspace at the scheduled time.",
  },
  {
    question: "How do prescriptions work?",
    answer:
      "Doctors write structured digital prescriptions during consultations, which attach directly to your consultation record.",
  },
  {
    question: "Why do I need a QR code for the pharmacy?",
    answer:
      "The QR token transfers your prescription details securely to a Pharmacist without paper, preventing forgery and double-dispensing.",
  },
  {
    question: "Can Pharmacists see my consultation chat?",
    answer:
      "No. Pharmacists only see the medication list, instructions, and patient/doctor details required for dispensing.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-xl p-6 sm:p-10 divide-y divide-slate-200/80">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-5 sm:py-6 first:pt-0 last:pb-0">
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between font-bold text-slate-900 outline-none text-base sm:text-lg hover:text-[#0b6e61] transition-colors text-left group"
              aria-expanded={isOpen}
            >
              <span>{faq.question}</span>
              <span className="ml-6 flex size-8 items-center justify-center rounded-full bg-white border border-slate-200 group-hover:border-teal-300 group-hover:bg-teal-50/50 transition-colors shrink-0">
                <ChevronRight
                  className={`size-5 text-slate-500 transition-transform duration-300 ${
                    isOpen ? "rotate-90 text-[#0b6e61]" : "group-hover:text-slate-700"
                  }`}
                />
              </span>
            </button>

            {/* Smooth height animation container */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pr-8 text-slate-600 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
