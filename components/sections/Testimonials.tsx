'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      "I've done Tough Mudder, I've done meditation retreats, I've done high-altitude trekking. Nothing came close to Alpha Retreats. Five days in Norway that I will never forget. The ice baths broke me open. The brotherhood kept me there.",
    name: 'James Whitmore',
    title: 'Founder & CEO, Whitmore Capital',
    location: 'London, UK',
  },
  {
    quote:
      "I was skeptical. I'm not a 'retreat guy'. But my business partner dragged me to Fire & Steel and I'm grateful every day. Three days in the Highlands. No phone, no email, no decisions. Just hard work, good men, and fire. I came back to my family a better man.",
    name: 'Marcus Delgado',
    title: 'Managing Director, Delgado Partners',
    location: 'Madrid, Spain',
  },
  {
    quote:
      "Iron Brotherhood was the hardest thing I've done voluntarily. Building a shelter, butchering an animal, plunging into a glacial river at dawn. But the conversations around that fire at night — those were worth ten years of therapy. I mean that.",
    name: 'Thomas Eriksson',
    title: 'VP Engineering, TechScale Nordic',
    location: 'Stockholm, Sweden',
  },
  {
    quote:
      "We sent our senior leadership team to a corporate Alpha Retreats offsite. What came back was a different team. Harder, closer, more honest with each other. The ROI on that week was unlike anything we've put money into.",
    name: 'David Liang',
    title: 'CEO, NorthStar Ventures',
    location: 'Singapore',
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-dark-card border-t border-dark-border">
      <div className="container-wide">
        <h2 className="heading-lg text-center mb-4">WHAT THEY SAY.</h2>
        <p className="text-gray-400 font-body text-center mb-12">
          From the men who have been through it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-dark-bg border border-dark-border rounded-lg p-8"
            >
              <div className="text-burnt-orange text-3xl font-heading mb-4">&ldquo;</div>
              <p className="text-gray-300 font-body leading-relaxed mb-6 italic">{t.quote}</p>
              <div>
                <p className="text-off-white font-body font-semibold">{t.name}</p>
                <p className="text-gray-500 font-body text-sm">{t.title}</p>
                <p className="text-gray-600 font-body text-xs mt-1">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
