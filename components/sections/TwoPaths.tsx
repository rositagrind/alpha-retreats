import Link from 'next/link';
import Image from 'next/image';

export default function TwoPaths() {
  return (
    <section className="section-padding bg-dark-bg">
      <div className="container-wide">
        <h2 className="heading-lg text-center mb-12">TWO PATHS. ONE STANDARD.</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          <div className="relative group overflow-hidden rounded-l-lg">
            <div className="relative h-96 lg:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80"
                alt="Men's personal retreat"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
              <span className="font-body text-burnt-orange text-xs uppercase tracking-widest font-semibold mb-3">For Individuals</span>
              <h3 className="font-heading text-4xl lg:text-5xl text-off-white mb-4">THE PERSONAL RETREAT</h3>
              <p className="text-gray-300 font-body mb-6 max-w-sm leading-relaxed">
                Join a group of like-minded men. 3–7 days. From €3,000. A shared experience that changes each man individually.
              </p>
              <Link
                href="/retreats"
                className="inline-flex items-center font-body text-sm uppercase tracking-widest text-off-white hover:text-burnt-orange transition-colors font-semibold"
              >
                Explore Retreats →
              </Link>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-r-lg">
            <div className="relative h-96 lg:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80"
                alt="Corporate team offsite"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
              <span className="font-body text-burnt-orange text-xs uppercase tracking-widest font-semibold mb-3">For Companies</span>
              <h3 className="font-heading text-4xl lg:text-5xl text-off-white mb-4">THE CORPORATE OFFSITE</h3>
              <p className="text-gray-300 font-body mb-6 max-w-sm leading-relaxed">
                Tailor-made team experiences for startups and mid-enterprise. We design. You show up. Your team leaves transformed.
              </p>
              <Link
                href="/corporate"
                className="inline-flex items-center font-body text-sm uppercase tracking-widest text-off-white hover:text-burnt-orange transition-colors font-semibold"
              >
                Enquire Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
