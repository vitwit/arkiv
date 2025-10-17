"use client";

import { useState } from "react";

type FAQItem = {
    question: string;
    answer: string;
};

type FAQProps = {
    items: FAQItem[];
};

export default function FAQ({ items }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="border rounded-lg">
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex justify-between items-center px-4 py-3 text-left font-medium"
                        >
                            <span className="text-white-500">{item.question}</span>
                            <span className="ml-2">
                                {openIndex === index ? "−" : "+"}
                            </span>
                        </button>
                        {openIndex === index && (
                            <div className="px-4 pb-3 text-white-700">
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
