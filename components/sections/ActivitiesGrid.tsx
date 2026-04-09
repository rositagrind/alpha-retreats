'use client';

import { motion } from 'framer-motion';

const activities = [
  {
    icon: '🧊',
    name: 'Ice Baths',
    desc: 'Cold water immersion that rewires your nervous system and forges mental resilience.',
  },
  {
    icon: '🏔',
    name: 'Wilderness Hiking',
    desc: 'Multi-day treks through terrain that demands your full respect and presence.',
  },
  {
    icon: '🔥',
    name: 'Fire Cooking',
    desc: 'Prepare and cook everything over open flame. Real food. Real skill.',
  },
  {
    icon: '🪓',
    name: 'Axe Throwing',
    desc: 'Precision, power, and the satisfaction of something primal done well.',
  },
  {
    icon: '🏍',
    name: 'Motorcycling',
    desc: 'Road trips through mountain passes. Wind, speed, and full presence.',
  },
  {
    icon: '🪵',
    name: 'Cabin Building',
    desc: 'Use only what the forest provides. Build something that stands.',
  },
  {
    icon: '🎣',
    name: 'Fishing',
    desc: 'Patience, skill, and the ancient practice of pulling food from wild water.',
  },
  {
    icon: '🥩',
    name: 'Animal Butchery',
    desc: 'Understand where food comes from. Ethical, whole-animal preparation.',
  },
];

export default function ActivitiesGrid() {
  return (
    <section className="section-padding bg-dark-card border-t border-b border-dark-border">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="heading-lg">THE EXPERIENCES</h2>
          <p className="text-gray-400 font-body mt-3 max-w-xl mx-auto">
            Each retreat combines several of these disciplines. Every activity is chosen for a reason — to challenge, to build, to connect.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="bg-dark-bg border border-dark-border rounded-lg p-6 hover:border-burnt-orange transition-colors group"
            >
              <div className="text-3xl mb-3">{activity.icon}</div>
              <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-burnt-orange transition-colors">
                {activity.name}
              </h3>
              <p className="text-gray-500 font-body text-sm leading-relaxed">{activity.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
