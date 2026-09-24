'use client';

import { motion } from 'framer-motion';

const activities = [
  {
    icon: '💪',
    name: 'Strength & Longevity',
    desc: 'A strength, mobility and longevity training program guided by a coach at every session.',
  },
  {
    icon: '🧊',
    name: 'Ice Baths',
    desc: 'Cold water immersion using the Wim Hof Method to rewire your nervous system and build mental resilience.',
  },
  {
    icon: '🧖',
    name: 'Sauna',
    desc: 'Traditional heat therapy to recover the body, clear the mind, and slow down.',
  },
  {
    icon: '🪵',
    name: 'Carpentry & Woodwork',
    desc: 'Learn the basics of carpentry and cut your own piece of wood into an object you take home.',
  },
  {
    icon: '🏕',
    name: 'Wilderness Survival',
    desc: 'Hike through the wild, learn the fauna and flora around you, and build your own shelter from what the land provides.',
  },
  {
    icon: '🥩',
    name: 'Fire Cooking',
    desc: 'Learn how to cut and cook meat over open fire, guided by a Michelin starred chef.',
  },
];

export default function ActivitiesGrid() {
  return (
    <section className="section-padding bg-dark-card border-t border-b border-dark-border">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="heading-lg">THE EXPERIENCES</h2>
          <p className="text-gray-400 font-body mt-3 max-w-xl mx-auto">
            Each retreat combines several of these disciplines, chosen to challenge you, build you, and connect you to something real.
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
