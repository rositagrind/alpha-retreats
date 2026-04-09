import type { Metadata } from 'next';
import Image from 'next/image';
import CorporateForm from '@/components/sections/CorporateForm';

export const metadata: Metadata = {
  title: 'Corporate Team Retreats — Forge Your Team in the Wild',
  description:
    'Tailor-made corporate offsites and team building for startups and mid-enterprise. Alpha Retreats designs a custom adventure package for your team.',
  openGraph: {
    title: 'Corporate Team Retreats | Alpha Retreats',
    images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200'],
  },
};

const valueProps = [
  {
    icon: '🤝',
    title: 'Real Trust, Built Hard',
    desc: 'Trust built under pressure is the only kind that holds. Your team will face genuine challenges together — not trust-fall exercises.',
  },
  {
    icon: '🧠',
    title: 'Leadership Under Pressure',
    desc: 'Wilderness conditions reveal true leadership. Who steps up? Who goes quiet? Who carries others? You will know your team at a different level.',
  },
  {
    icon: '⚡',
    title: 'Performance Reset',
    desc: 'Remove your team from screens, meetings, and distractions. Return them to something primal. Watch what happens to their energy.',
  },
  {
    icon: '🗺',
    title: 'Custom-Designed Experience',
    desc: 'No two corporate retreats are the same. We design everything around your team size, goals, fitness levels, and budget.',
  },
  {
    icon: '🌍',
    title: 'Global Locations',
    desc: 'Scottish Highlands. Norwegian Arctic. Canadian Rockies. Patagonia. We operate where the landscape demands respect.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Enquire',
    desc: 'Tell us about your team, your goals, and your timeline. We will respond within 24 hours.',
  },
  {
    step: '02',
    title: 'We Design Your Retreat',
    desc: 'Our team builds a fully custom programme — location, activities, logistics, food, accommodation. All of it. You review and approve.',
  },
  {
    step: '03',
    title: 'You Show Up',
    desc: 'That is it. We handle everything else. Your only job is to be present and bring your team.',
  },
];

export default function CorporatePage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
            alt="Corporate team in the wild"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 container-wide text-center">
          <p className="font-body text-burnt-orange uppercase tracking-widest text-sm mb-6 font-semibold">
            For Companies
          </p>
          <h1 className="heading-xl mb-6">FORGE YOUR TEAM<br />IN THE WILD.</h1>
          <p className="text-gray-300 font-body text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Tailor-made corporate offsites and team building for startups and mid-enterprise companies who refuse to settle for a golf day.
          </p>
          <a href="#enquiry" className="btn-primary inline-flex">
            Enquire Now
          </a>
        </div>
      </section>

      {/* Value Props */}
      <section className="section-padding bg-dark-bg">
        <div className="container-wide">
          <h2 className="heading-lg text-center mb-12">WHY ALPHA RETREATS FOR YOUR TEAM?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valueProps.map((v) => (
              <div key={v.title} className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-heading text-xl text-off-white mb-3">{v.title}</h3>
                <p className="text-gray-400 font-body text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-dark-card border-t border-dark-border">
        <div className="container-wide">
          <h2 className="heading-lg text-center mb-12">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <div key={step.step} className="text-center relative">
                <div className="font-heading text-7xl text-dark-border mb-4">{step.step}</div>
                <h3 className="font-heading text-2xl text-off-white mb-4">{step.title}</h3>
                <p className="text-gray-400 font-body leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 w-8 h-px bg-burnt-orange/40 translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote section */}
      <section className="section-padding bg-forest-green">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <div className="text-burnt-orange text-5xl font-heading mb-6">&ldquo;</div>
          <p className="text-off-white font-body text-2xl leading-relaxed mb-8 italic">
            We sent our senior leadership team to a corporate Alpha Retreats offsite. What came back was a different team. Harder, closer, more honest with each other.
          </p>
          <p className="text-gray-400 font-body">David Liang — CEO, NorthStar Ventures, Singapore</p>
        </div>
      </section>

      {/* Form */}
      <section id="enquiry" className="section-padding bg-dark-bg">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <h2 className="heading-lg mb-4">ENQUIRE NOW</h2>
            <p className="text-gray-400 font-body mb-8">
              Fill in the form below. We will get back to you within 24 hours with an initial response and questions to help us design your perfect retreat.
            </p>
            <CorporateForm />
          </div>
        </div>
      </section>
    </main>
  );
}
