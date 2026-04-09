import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Alpha Retreats — Why We Exist',
  description:
    'Alpha Retreats was built for one reason: to give men experiences that demand everything they have. Read our manifesto and meet the team.',
  openGraph: {
    title: 'About Alpha Retreats',
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200'],
  },
};

const values = [
  {
    title: 'BROTHERHOOD',
    desc: 'Men do not grow alone. The men you stand beside in hard moments become something permanent. We engineer the conditions for real bonds — not networking, but brotherhood.',
  },
  {
    title: 'NATURE',
    desc: 'The wilderness is not a backdrop. It is the teacher. Cold water, open fire, and raw terrain reveal what is actually there when everything artificial is removed.',
  },
  {
    title: 'PRIMAL CHALLENGE',
    desc: 'Comfort is not the enemy of success — but it is often the enemy of growth. We put men in situations that require every resource they have. That is where transformation lives.',
  },
];

const team = [
  {
    name: 'Alex Harrington',
    role: 'Founder & Lead Guide',
    bio: 'Former British Army officer, mountaineer, and entrepreneur. Built Alpha Retreats after realizing the most meaningful moments of his life happened in the wilderness with other men.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    name: 'Marcus Vane',
    role: 'Head of Experience Design',
    bio: 'Wilderness survival expert and leadership coach with 15 years designing challenges for high-performance individuals. Believes every man has more in him than he knows.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Erik Solberg',
    role: 'Nordic Operations Director',
    bio: 'Born in Tromsø, raised by the Arctic. Expert guide, freediver, and wilderness chef. He has been building fires and crossing rivers for as long as he can remember.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
];

const gallery = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=600&q=80',
];

export default function AboutPage() {
  return (
    <main className="pt-20">
      {/* Manifesto Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80"
            alt="Men in the wilderness"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-wide text-center">
          <p className="font-body text-burnt-orange uppercase tracking-widest text-sm mb-6 font-semibold">
            Our Manifesto
          </p>
          <h1 className="heading-xl mb-8">WHY WE EXIST.</h1>
          <div className="max-w-3xl mx-auto text-left space-y-5">
            <p className="text-gray-200 font-body text-xl leading-relaxed">
              Something has gone wrong with modern manhood. Not dramatically wrong. Quietly wrong.
              Men who are objectively successful — who have built things, earned things, achieved
              things — walking around with a low hum of disconnection. From nature. From other men.
              From themselves.
            </p>
            <p className="text-gray-300 font-body text-lg leading-relaxed">
              Alpha Retreats exists because we believe this is fixable. Not with therapy, not with
              journaling apps, not with motivational content. With hard, real, demanding experience
              in places that do not care about your job title.
            </p>
            <p className="text-gray-300 font-body text-lg leading-relaxed">
              We take men who have earned the right to be here — curious, high-performing, willing —
              and we put them in wilderness environments with other men of the same calibre. We give
              them challenges that require their full presence. We build fires. We go cold. We build
              things with our hands. We eat what we prepare.
            </p>
            <p className="text-off-white font-body text-xl leading-relaxed font-semibold">
              By the end, you will remember what you are actually made of. And you will know a group
              of men who have seen it too.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-dark-bg">
        <div className="container-wide">
          <h2 className="heading-lg text-center mb-12">THE EXPERIENCE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="border-t-2 border-burnt-orange pt-6">
                <h3 className="font-heading text-2xl text-off-white mb-4">{v.title}</h3>
                <p className="text-gray-400 font-body leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-dark-card border-t border-dark-border">
        <div className="container-wide">
          <h2 className="heading-lg text-center mb-4">THE TEAM</h2>
          <p className="text-gray-400 font-body text-center mb-12">
            Men who have lived what they teach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-burnt-orange">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    sizes="128px"
                  />
                </div>
                <h3 className="font-heading text-2xl text-off-white">{member.name}</h3>
                <p className="text-burnt-orange font-body text-sm uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-gray-400 font-body text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding bg-dark-bg">
        <div className="container-wide">
          <h2 className="heading-lg text-center mb-12">THE WORLD WE OPERATE IN.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={src}
                  alt={`Alpha Retreats experience ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-forest-green">
        <div className="container-wide text-center">
          <h2 className="heading-lg mb-6">READY TO FIND OUT WHAT YOU&apos;RE MADE OF?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/retreats" className="btn-primary">
              Explore Retreats
            </Link>
            <Link href="/contact" className="btn-secondary">
              Talk To Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
