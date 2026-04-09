create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now()
);
alter table profiles enable row level security;

create table retreats (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  location text not null,
  country text not null,
  duration_days int not null,
  start_date date,
  end_date date,
  max_capacity int not null default 12,
  spots_remaining int not null default 12,
  price_euros int not null,
  deposit_euros int not null default 500,
  status text not null default 'draft' check (status in ('draft','coming_soon','available','sold_out','completed')),
  featured boolean not null default false,
  activity_tags text[] default '{}',
  itinerary jsonb default '[]',
  included text[] default '{}',
  not_included text[] default '{}',
  images text[] default '{}',
  hero_image text,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table retreats enable row level security;

create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  first_name text,
  source text,
  created_at timestamptz default now(),
  constraint waitlist_email_unique unique (email)
);
alter table waitlist enable row level security;

create table bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  retreat_id uuid references retreats(id),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  spots int not null default 1,
  total_euros int not null,
  deposit_euros int not null,
  status text not null default 'pending' check (status in ('pending','deposit_paid','fully_paid','cancelled','refunded')),
  stripe_session_id text unique,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table bookings enable row level security;

create table corporate_enquiries (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  team_size int,
  preferred_dates text,
  goals text,
  status text not null default 'new' check (status in ('new','in_progress','proposal_sent','closed')),
  notes text,
  created_at timestamptz default now()
);
alter table corporate_enquiries enable row level security;

create table contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean default false,
  notes text,
  created_at timestamptz default now()
);
alter table contact_messages enable row level security;

create policy "Public can view non-draft retreats" on retreats for select using (status != 'draft');
create policy "Public can join waitlist" on waitlist for insert with check (true);
create policy "Public can submit corporate enquiry" on corporate_enquiries for insert with check (true);
create policy "Public can submit contact message" on contact_messages for insert with check (true);
create policy "Users can view own bookings" on bookings for select using (auth.uid() = user_id);
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

insert into storage.buckets (id, name, public) values ('retreat-images', 'retreat-images', true);
create policy "Public can view retreat images" on storage.objects for select using (bucket_id = 'retreat-images');
create policy "Service role can manage retreat images" on storage.objects for all using (auth.role() = 'service_role');
create policy "Authenticated users can upload retreat images" on storage.objects for insert to authenticated with check (bucket_id = 'retreat-images');
create policy "Authenticated users can delete retreat images" on storage.objects for delete to authenticated using (bucket_id = 'retreat-images');

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger retreats_updated_at before update on retreats for each row execute function update_updated_at();
create trigger bookings_updated_at before update on bookings for each row execute function update_updated_at();

-- Seed placeholder retreats
insert into retreats (name, slug, tagline, description, location, country, duration_days, max_capacity, spots_remaining, price_euros, deposit_euros, status, featured, activity_tags, itinerary, included, not_included, images, hero_image, meta_title, meta_description) values
(
  'The Wilderness Reset',
  'the-wilderness-reset',
  'Five days of raw nature, cold water, and brotherhood in the Arctic Circle.',
  '<p>The Wilderness Reset is not a holiday. It is a deliberate return to what makes a man. Five days in Tromsø, Norway — where the Arctic light stretches on forever and the cold demands your full presence.</p><p>You will wake before dawn, plunge into ice-cold water, hike through ancient forests, build fires from scratch, and eat what you cook. No phones. No meetings. No noise. Just men, nature, and the quiet power that comes from doing hard things together.</p><p>This retreat is for the man who has built something — a business, a family, a life — but has lost the thread back to himself. We are not therapists. We are guides back to the primal.</p>',
  'Tromsø',
  'Norway',
  5,
  12,
  12,
  3500,
  500,
  'coming_soon',
  true,
  ARRAY['Ice Baths','Wilderness Hiking','Fire Cooking','Axe Throwing','Fishing'],
  '[{"day":1,"title":"Arrival & The Plunge","description":"Arrive in Tromsø. Meet your brothers. Before sunset, your first ice bath in the Arctic fjord. Dinner cooked over open fire. No speeches. Just presence."},{"day":2,"title":"The Deep Forest","description":"Dawn hike through boreal forest. Navigation by map and instinct. Midday axe throwing competition. Evening: learn to fillet and cook fresh Arctic char over open coals."},{"day":3,"title":"The Forge","description":"Full day wilderness survival workshop. Build a shelter. Start fire without a lighter. Ice bath at dusk. Communal feast — meat you prepared yourselves."},{"day":4,"title":"Brotherhood & Reflection","description":"Group fishing on the fjord at dawn. Afternoon free for rest, journaling, or solo hiking. Evening fire ceremony — each man speaks one truth."},{"day":5,"title":"Return","description":"Final ice bath at sunrise. Breakfast together. Depart with a different relationship to yourself and the men around you."}]'::jsonb,
  ARRAY['All accommodation in a remote wilderness lodge','All meals cooked over fire or prepared communally','Expert wilderness guides','Ice bath equipment and safety supervision','Axe throwing session','Fishing equipment and guide','Airport transfers from Tromsø airport','Welcome kit: journal, fire starter, Alpha Retreats thermal'],
  ARRAY['Flights to Tromsø','Alcoholic beverages','Personal equipment (hiking boots, cold-weather gear)','Travel insurance (mandatory)'],
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200','https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200'],
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600',
  'The Wilderness Reset — 5-Day Arctic Men''s Retreat in Tromsø, Norway | Alpha Retreats',
  'Five days of ice baths, wilderness hiking, fire cooking, and brotherhood in the Arctic Circle. A men''s retreat unlike anything else. From €3,500.'
),
(
  'Fire & Steel',
  'fire-and-steel',
  'Three intense days in the Scottish Highlands. Iron will, wild land, real men.',
  '<p>Fire & Steel is our most intense short-format retreat. Three days in the Scottish Highlands — relentless, raw, and transformative.</p><p>You will chop wood, throw axes, ride motorcycles through mountain passes, and cook over open fire every night. The Highlands do not care who you are in the boardroom. Out here, only your actions define you.</p><p>Designed for men who want maximum impact in minimum time. Come on a Friday. Leave on a Sunday. Leave different.</p>',
  'Scottish Highlands',
  'United Kingdom',
  3,
  10,
  10,
  3000,
  500,
  'coming_soon',
  false,
  ARRAY['Axe Throwing','Motorcycling','Fire Cooking','Chopping Wood','Wilderness Hiking'],
  '[{"day":1,"title":"Into the Wild","description":"Arrive at our Highland base. Gear up. Afternoon motorcycle ride through Glen Coe. Return at dusk for fire cooking session — learn to prepare game over open flame."},{"day":2,"title":"The Steel Day","description":"Dawn: wood chopping competition. Morning: axe throwing. Afternoon: guided Highland hike to a remote loch. Evening: communal fire feast under the stars."},{"day":3,"title":"The Road Home","description":"Final morning motorcycle ride at sunrise. Breakfast over fire. Each man takes home one thing he built — and one thing he left behind."}]'::jsonb,
  ARRAY['Two nights in a private Highland lodge','All fire-cooked meals included','Motorcycle hire and guided riding (license required)','Axe throwing session with professional coach','Expert Highland guides','Welcome kit and Alpha Retreats journal'],
  ARRAY['Flights to Inverness','Personal motorcycle gear (helmets available on site)','Motorcycle license (required for riding)','Travel insurance','Alcoholic beverages'],
  ARRAY['https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200','https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=1200'],
  'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1600',
  'Fire & Steel — 3-Day Men''s Retreat in the Scottish Highlands | Alpha Retreats',
  'Three intense days of motorcycling, axe throwing, fire cooking, and wilderness hiking in the Scottish Highlands. From €3,000.'
),
(
  'Iron Brotherhood',
  'iron-brotherhood',
  'Seven days. Canadian Rockies. The most complete men''s retreat on the planet.',
  '<p>Iron Brotherhood is the flagship Alpha Retreats experience. Seven days in the Canadian Rockies — the kind of landscape that makes small problems feel small and big men feel alive.</p><p>This is not a retreat. This is an expedition. You will test your physical limits in the gym at altitude, push through wilderness terrain that demands everything you have, learn to butcher and prepare your own meat, fish pristine mountain rivers, and build a real shelter from the forest floor up.</p><p>By day seven, you will have earned your place at this fire. And you will know every man around it.</p>',
  'Banff',
  'Canada',
  7,
  14,
  14,
  5500,
  500,
  'coming_soon',
  true,
  ARRAY['Gym Training','Wilderness Hiking','Animal Butchery','Fishing','Cabin Building','Ice Baths','Fire Cooking','Axe Throwing'],
  '[{"day":1,"title":"Base Camp","description":"Arrive in Banff. Orientation and gear check. Introductory hike to establish the group. Ice bath in the Bow River. Fire-cooked welcome dinner."},{"day":2,"title":"The Iron Session","description":"Morning: high-altitude gym training — strength and conditioning designed for the mountains. Afternoon: technical wilderness navigation. Evening: axe throwing and fire stories."},{"day":3,"title":"Into the Rockies","description":"Full-day wilderness hike to a remote alpine camp. No trails — navigation by compass and terrain reading. Camp overnight under the stars."},{"day":4,"title":"The Butcher''s Day","description":"Learn ethical hunting and full animal butchery with a Canadian wilderness guide. Prepare and cook the entire animal over fire. Nothing wasted. Everything honoured."},{"day":5,"title":"The River","description":"Dawn fishing on a pristine mountain river. Learn fly fishing from scratch or refine your technique. Cook your catch for lunch. Afternoon: solo time in the wild."},{"day":6,"title":"Build","description":"Full day cabin and shelter building using only what the forest provides. Work in teams. Sleep in what you built. Night fire ceremony."},{"day":7,"title":"Brotherhood","description":"Final morning ice bath and gym session. Group breakfast. Each man receives his Alpha Retreats iron coin — a mark of what he has done. Depart changed."}]'::jsonb,
  ARRAY['Seven nights accommodation (lodge + wilderness camp nights)','All meals prepared communally or by guides','High-altitude gym access and personal programming','Full wilderness guide team','Animal butchery workshop','Fly fishing guide and equipment','Cabin building materials and instruction','Ice bath sessions with cold exposure coaching','All in-retreat transport','Welcome kit: Alpha Retreats pack, journal, iron coin'],
  ARRAY['International flights to Calgary','Travel insurance (mandatory)','Personal hiking and camping gear','Alcoholic beverages','Visa fees if applicable'],
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200','https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=1200','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'],
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600',
  'Iron Brotherhood — 7-Day Men''s Expedition in the Canadian Rockies | Alpha Retreats',
  'The complete men''s retreat experience. Seven days of gym training, wilderness hiking, animal butchery, fishing, and cabin building in the Canadian Rockies. From €5,500.'
),
(
  'The Primal Journey',
  'the-primal-journey',
  'Seven days at the end of the world. Patagonia will break you open.',
  '<p>The Primal Journey takes you to the furthest corner of the civilised world — Patagonia, Argentina. Seven days in a landscape so extreme, so elemental, that it strips away everything that is not essential.</p><p>Wind. Stone. Ice. Fire. These are your companions here. You will hike routes that demand full respect. You will fish glacial rivers. You will cook over fires that take real skill to build in this wind. You will chop wood in conditions that remind you what strength actually is.</p><p>This retreat is for the man who has done everything, seen everything, and still hungers for something more. Patagonia is your answer.</p>',
  'El Chaltén',
  'Argentina',
  7,
  10,
  10,
  5000,
  500,
  'coming_soon',
  false,
  ARRAY['Wilderness Hiking','Fishing','Fire Cooking','Chopping Wood','Ice Baths','Axe Throwing'],
  '[{"day":1,"title":"The Edge of the World","description":"Arrive in El Chaltén — the trekking capital of Argentina. Meet your guides. Evening orientation over fire-cooked Patagonian lamb."},{"day":2,"title":"Fitz Roy","description":"Full-day hike toward the iconic Fitz Roy massif. Demanding terrain, spectacular reward. Ice bath in glacial meltwater at altitude."},{"day":3,"title":"The Gaucho Day","description":"Learn from a local gaucho: horsemanship, rope work, and the art of asado — the full Argentine fire cooking tradition. A full day of primal skill."},{"day":4,"title":"The River","description":"Fly fishing on the pristine Río de las Vueltas. The fish are wild. So is the landscape. Cook what you catch."},{"day":5,"title":"Wind & Steel","description":"Chopping wood in Patagonian wind is a lesson in patience and power. Morning: axe work and wood splitting competition. Afternoon: solo wilderness time."},{"day":6,"title":"The Ice","description":"Hike to a glacial lake. Full ice immersion. Then back to base for the final communal feast — every man cooks a dish."},{"day":7,"title":"Brotherhood & Departure","description":"Dawn ceremony at a viewpoint above El Chaltén. Breakfast together. Return to the world — quieter, stronger, and more yourself."}]'::jsonb,
  ARRAY['Seven nights in boutique wilderness lodge','All meals (including traditional asado nights)','Expert Patagonian wilderness guides','Fly fishing guide and equipment','Gaucho horsemanship and asado day','Ice bath sessions','Axe throwing and chopping sessions','All in-retreat transport from El Chaltén','Welcome kit and Alpha Retreats journal'],
  ARRAY['International flights to El Calafate or Buenos Aires','Travel insurance (mandatory)','Personal trekking gear','Alcoholic beverages','Argentina visa if applicable'],
  ARRAY['https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200','https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200'],
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600',
  'The Primal Journey — 7-Day Men''s Retreat in Patagonia, Argentina | Alpha Retreats',
  'Seven days in Patagonia. Wilderness hiking, glacial ice baths, fly fishing, and fire cooking at the edge of the world. From €5,000.'
);
