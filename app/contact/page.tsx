import type { Metadata } from 'next';
import ContactForm from '@/components/sections/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Alpha Retreats',
  description:
    'Get in touch with Alpha Retreats. Questions about our retreats, corporate offsites, or anything else — we respond within 24 hours.',
};

export default function ContactPage() {
  return (
    <main className="pt-20">
      <section className="section-padding bg-dark-bg">
        <div className="container-wide">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h1 className="heading-xl mb-6">GET IN TOUCH.</h1>
              <p className="text-gray-400 font-body text-lg leading-relaxed mb-10">
                Questions about a specific retreat? Want to understand the corporate process? Just want to know if this is for you? We respond to every message within 24 hours.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="font-heading text-lg text-off-white">EMAIL</p>
                  <a href="mailto:hello@alpha-retreats.com" className="text-burnt-orange font-body hover:text-orange-400 transition-colors">
                    hello@alpha-retreats.com
                  </a>
                </div>
                <div>
                  <p className="font-heading text-lg text-off-white">FOLLOW US</p>
                  <div className="flex gap-4 mt-2">
                    {['Instagram', 'LinkedIn', 'YouTube'].map((s) => (
                      <a key={s} href="#" className="text-gray-400 hover:text-burnt-orange font-body text-sm transition-colors">
                        {s}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-heading text-lg text-off-white">RESPONSE TIME</p>
                  <p className="text-gray-400 font-body text-sm">Within 24 hours on business days.</p>
                </div>
              </div>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
