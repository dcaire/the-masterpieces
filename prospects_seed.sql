-- Prospects CRM — table + verified Houston-area target-market seed.
-- Run in the Supabase SQL editor. Idempotent: the seed only loads when the
-- prospects table is empty, so re-running won't create duplicates.
--
-- All contacts below were gathered from organizations' own public pages or
-- reputable directories (with a source URL per row). Where a name or email was
-- NOT publicly verifiable it is left blank on purpose — confirm by phone before
-- emailing. A few rows are flagged in their notes as "verify"/"unconfirmed".

create table if not exists public.prospects (
  id              bigint generated always as identity primary key,
  organization    text not null,
  org_type        text not null default 'Service & Social Club',
  city            text,
  organizer_name  text,
  organizer_role  text,
  manager_name    text,
  email           text,
  phone           text,
  website         text,
  fit_score       integer not null default 3,
  status          text not null default 'prospect',
  source          text,
  notes           text,
  last_contacted  date,
  next_action     date,
  created_at      timestamptz not null default now()
);

alter table public.prospects enable row level security;
drop policy if exists app_full_access on public.prospects;
create policy app_full_access on public.prospects for all to anon, authenticated using (true) with check (true);

insert into public.prospects (organization, org_type, city, organizer_name, organizer_role, manager_name, email, phone, website, source, fit_score, notes, status)
select organization, org_type, city, organizer_name, organizer_role, manager_name, email, phone, website, source, fit_score, notes, 'prospect'
from (values
 ('Seven Acres Jewish Senior Care Services','Senior Living','Houston','Jill Newman','Director of Life Enrichment & Volunteer Services','','jnewman@sevenacres.org','713-778-5782','https://www.sevenacres.org/','https://www.sevenacres.org/contact-us/',5,'Named life-enrichment director with direct email; books musical performances; daytime programming.'),
 ('The Hallmark','Senior Living','Houston','','','','info@houstonretirement.org','713-622-6633','https://thehallmark.org/','https://houstonseniorlivingguide.com/facility/the-hallmark/',4,'Galleria-area independent/assisted/memory care; general info email listed.'),
 ('Holly Hall Retirement Community','Senior Living','Houston','','','','','713-799-9031','https://www.hollyhall.org/','https://www.hollyhall.org/contact-us/',4,'Faith-based CCRC with daily activities incl. musical performances. No public email — call for activities contact.'),
 ('Brookdale Galleria','Senior Living','Houston','','','','','832-645-1688','https://www.brookdale.com/en/communities/brookdale-galleria.html','https://www.brookdale.com/en/communities/brookdale-galleria.html',4,'IL/AL/SNF on one campus; active entertainment calendar. No public email — call.'),
 ('The Buckingham','Senior Living','Houston','','','','communication@buckinghamhouston.com','713-979-3100','https://buckinghamhouston.com/','https://buckinghamhouston.com/contact/',4,'Luxury CCRC; general/media email (booking/sales line 713-660-6552).'),
 ('Eagle''s Trace','Senior Living','Houston','','','','','281-496-7676','https://www.ericksonseniorliving.com/eagles-trace','https://www.ericksonseniorliving.com/eagles-trace',4,'Erickson CCRC, West Houston, robust activities. No public email — call.'),
 ('The Village at the Woodlands Waterway','Senior Living','The Woodlands','','','','','281-292-4600','https://villageatthewoodlandswaterway.com/','https://villageatthewoodlandswaterway.com/contact/',4,'IL/AL/memory care; full event calendar. No public email — call.'),
 ('The Village at Sugar Land','Senior Living','Sugar Land','','','','info@villageatsugarland.com','281-729-8800','https://villageatsugarland.com/','https://villageatsugarland.com/',5,'AL/memory care; general info email; emphasizes resident engagement.'),
 ('Atria Sugar Land','Senior Living','Sugar Land','','','','sales-252@atriaseniorliving.com','281-494-4200','https://www.atriaseniorliving.com/retirement-communities/atria-sugar-land-sugar-land-tx/','https://www.atriaseniorliving.com/retirement-communities/atria-sugar-land-sugar-land-tx/',4,'IL/AL with 200+ monthly Engage Life events; sales email listed.'),
 ('Carriage Inn Katy','Senior Living','Katy','','','','','281-371-6380','https://www.cardinalbay.org/senior-living/tx/katy/carriage-inn-katy/','https://www.cardinalbay.org/senior-living/tx/katy/carriage-inn-katy/contact-us',4,'IL/AL/memory care (Cardinal Bay); vibrant activity program. No public email — call.'),
 ('Landon Ridge Sugar Land','Senior Living','Sugar Land','','','','','832-990-0837','https://www.sugarlandassistedliving.com/','https://www.sugarlandassistedliving.com/',4,'AL/memory care (Sagora). Verify office email by phone before emailing.'),
 ('Rotary Club of Houston','Service & Social Club','Houston','Joel Levine','President','','administrator@rotaryhouston.org','713-973-9936','https://www.rotaryhouston.org/','https://www.rotaryhouston.org/sitepage/contact-us',5,'Weekly Thursday luncheons at Tony''s with a featured program slot.'),
 ('Rotary Club of Sugar Land','Service & Social Club','Sugar Land','Josh Griffin','President','Dean Clark','','','https://www.sugarlandrotary.org/','https://rotaryd5890.org/clubinfo/sugar-land/',5,'Weekly Wed 11:45 luncheon at Sweetwater CC; programs every meeting. Officer email gated — use site form.'),
 ('Rotary Club of West U','Service & Social Club','Houston','Stephen Smith','President','','info@westurotary.org','713-664-5566','https://www.westurotary.org/','https://www.westurotary.org/',5,'Meets first 3 Thursdays monthly with outside presenters.'),
 ('Rotary Club of Memorial - Spring Branch','Service & Social Club','Houston','Genevieve Rowland','President','','info@msbrotary.org','','https://msbrotary.org/','https://rotaryd5890.org/clubinfo/memorial-spring-branch',5,'Meets 1st & 3rd Friday noon, Guadalajara Hacienda; speakers program.'),
 ('Downtown Rotary Club of Houston','Service & Social Club','Houston','Michael Wynne','President','','','713-621-7200','https://www.downtownrotaryhouston.org/','https://www.downtownrotaryhouston.org/contact-downtown-rotary',4,'Monthly luncheons at The Ballroom at Bayou Place. No public email — call.'),
 ('Kiwanis Club of Houston','Service & Social Club','Houston','','','','info@kiwanishouston.org','','https://kiwanishouston.org/','https://kiwanishouston.org/contact',5,'Hosts 2-3 luncheons each month; serving Houston since 1919.'),
 ('Kiwanis Club of Greater North Houston','Service & Social Club','Houston','','','','Petershome1@comcast.net','','https://kiwanisgnh.com/','https://kiwanisgnh.com/contact-us/',4,'Community service club since 1939; regular meetings.'),
 ('Houston Cy-Fair Lions Club','Service & Social Club','Houston','Allen Brinkley','President','Melinda Brinkley','info@houstoncy-fairlions.org','713-677-3790','https://houstoncy-fairlions.org/','https://houstoncy-fairlions.org/officers/',4,'Meets 2nd & 4th Tue evenings; open to programs.'),
 ('Tomball Lions Club','Service & Social Club','Tomball','Joe Sykora Jr.','President','Al Gerhardt','info@tomballlionsclub.org','713-410-6542','https://tomballlionsclub.org/','https://tomballlionsclub.org/sitepage/contacts/',5,'Meets 2nd & 4th Friday noon; active Speakers program.'),
 ('The Woman''s Club of Houston','Service & Social Club','Houston','','','','','','http://www.thewomansclubofhouston.org/','http://www.thewomansclubofhouston.org/join.html',4,'Historic women''s club (1893) at 5444 Westheimer; contact via website form.'),
 ('Houston Heights Woman''s Club','Service & Social Club','Houston','','','','','','https://www.houstonheightswomansclub.com/','https://www.houstonheightswomansclub.com/',4,'One of Houston''s oldest social clubs (1900); programs & luncheons at 1846 Harvard St.'),
 ('Newcomers and Neighbors of Greater Houston','Service & Social Club','Houston','','','','','','https://www.nngh.org/','https://www.nngh.org/',5,'Monthly luncheon (3rd Wed) featuring a program/speaker. Contact via site form.'),
 ('Lake Houston Ladies Club','Service & Social Club','Kingwood','Betty Perry','Membership Contact','','','832-633-2991','https://www.lakehoustonladiesclub.com/','https://www.lakehoustonladiesclub.com/default.php',4,'Social club with regular luncheons in the Lake Houston/Kingwood area.'),
 ('Sagemont Church','Church / Faith','Houston','','','','','281-481-8770','https://www.sagemontchurch.org','https://www.sagemontchurch.org/contact',5,'Dedicated 55+ senior-adults ministry; seasonal events. No public email — call.'),
 ('Memorial Drive Presbyterian Church','Church / Faith','Houston','Tracy Curtis-Stidam','Worship & Music contact','','webmaster@mdpc.org','713-782-1710','https://www.mdpc.org','https://www.mdpc.org/seniors/',5,'Active Venturers senior-adult program (Sept-May) plus music ministry.'),
 ('Champion Forest Baptist Church','Church / Faith','Houston','','','','','281-440-3800','https://www.championforest.org','https://www.championforest.org/about/staff/',5,'Hosts annual Christmas Spectacular; large adult & worship ministries. No public email — call.'),
 ('Houston''s First Baptist Church','Church / Faith','Houston','','','','','713-681-8000','https://www.houstonsfirst.org','https://www.houstonsfirst.org/about/contact-us',5,'Adults 65+ (Adult 3) senior ministry; multi-campus. No public email — call.'),
 ('South Main Baptist Church','Church / Faith','Houston','','','','info@southmain.org','','https://southmain.org','https://southmain.org/contact',4,'Downtown-area church with worship and adult ministries.'),
 ('First Methodist Houston','Church / Faith','Houston','','','','','832-668-1800','https://www.fmhouston.com','https://www.fmhouston.com/contact-us/',4,'Downtown church with senior and music ministries. No public email — call.'),
 ('St. Theresa Catholic Church','Church / Faith','Houston','','','','','713-869-3783','https://sttheresa.cc','https://sttheresa.cc/seniors',4,'JOY senior group meets monthly for luncheons. No public email — call.'),
 ('Sugar Creek Baptist Church','Church / Faith','Sugar Land','Clif Cummings','Senior Adults Pastor','','','281-242-2858','https://sugarcreek.net','https://sugarcreek.net/contact',5,'Dedicated Senior Adults Pastor; active women''s ministry (women@sugarcreek.net).'),
 ('Sugar Land Baptist Church','Church / Faith','Sugar Land','Louis Claussen','Associate Pastor of Worship & Arts','','','281-980-4431','https://sugarlandbaptist.org','https://sugarlandbaptist.org/',4,'Senior-adult Faithful Followers; dedicated worship/arts pastor.'),
 ('Bethel Church of Houston','Church / Faith','Houston','','','','','713-782-8948','https://bethelofhouston.com','https://bethelofhouston.com/ministries/adults/groups/',4,'Monthly senior-adult gatherings with hymns, lunch, fellowship. No public email — call.'),
 ('Grace Church Houston','Church / Faith','Houston','','','','','','https://mygrace.com','https://mygrace.com/ministries/senior-adults',3,'Senior Adults 55+ ministry meets weekly. Contact via site.'),
 ('Kingsland Baptist Church','Church / Faith','Katy','','','','','281-492-0785','https://kingsland.org','https://kingsland.org/contact-us/',4,'Large Katy-area church with a senior adults ministry. No public email — call.'),
 ('Northgate Country Club','Club / Venue','Houston','Virginia Johnson','Director of Catering & Private Events','','events@northgatecountryclub.com','281-444-5302','https://northgatecountryclub.com','https://northgatecountryclub.com/web/pages/plan-an-event',5,'300-seat banquet room with dance floor for member galas and seasonal events.'),
 ('Sweetwater Country Club','Club / Venue','Sugar Land','Michelle Crain','Tournament & Catering Director','','mcrain@sweetwatercc.com','281-980-4100','https://www.swcclub.com','https://www.swcclub.com/contact',5,'Dedicated events team; direct director email listed.'),
 ('The Petroleum Club of Houston','Club / Venue','Houston','Shawn Rushing','Director of Catering','','','713-659-1431','https://www.pcoh.com','https://www.pcoh.com',5,'Premier downtown club; ten event rooms. Catering email unconfirmed — try srushing@pcoh.com or call.'),
 ('The Briar Club','Club / Venue','Houston','Linda Benson','Director of Membership','','info@thebriarclub.com','713-622-3667','https://www.thebriarclub.com','https://www.thebriarclub.com/contact-us',5,'Family social club; 350-seat ballroom; holiday gatherings.'),
 ('The Houston Club','Club / Venue','Houston','Priscilla Ibanez','Event Sales Director','','','713-225-3257','https://www.invitedclubs.com/clubs/the-houston-club','https://www.invitedclubs.com/clubs/the-houston-club/contact-us',5,'Historic downtown social club; luncheons and galas. Inquiry via site form.'),
 ('The Woodlands Country Club','Club / Venue','The Woodlands','Annemarie Apligian','Private Events Director','','','281-863-1449','https://www.invitedclubs.com/clubs/the-woodlands-country-club','https://www.invitedclubs.com/clubs/the-woodlands-country-club/host-an-event',5,'Receptions up to 350 with in-house catering. Inquiry via site form.'),
 ('Lakeside Country Club','Club / Venue','Houston','Megan Montalbano','Manager, Catering & Events','','','281-497-2222','https://www.lakesidecc.com','https://www.lakesidecc.com/contact',4,'Custom-catered member events. No public email — call.'),
 ('BraeBurn Country Club','Club / Venue','Houston','Tricia Thomas','Director of Catering','','','713-774-2586','https://www.braeburncc.com','https://www.braeburncc.com/Banquets-Catering/Meetings-Special-Events.aspx',4,'300-seat ballroom; civic luncheons and holiday events. No public email — call.'),
 ('Royal Oaks Country Club','Club / Venue','Houston','','','','','281-899-3200','https://www.royaloakscc.com','https://www.royaloakscc.com/Weddings_Events/Special_Events',4,'Multiple private rooms; seasonal celebrations. No public email — call.'),
 ('Bay Oaks Country Club','Club / Venue','Houston','Ashley Williams','Private Events Director','','','281-488-7888','https://www.invitedclubs.com/clubs/bay-oaks-country-club','https://www.invitedclubs.com/clubs/bay-oaks-country-club/host-an-event',4,'Charity galas, member dinners, family events. Inquiry via site form.'),
 ('Sugar Creek Country Club','Club / Venue','Sugar Land','','','','','281-494-9131','https://www.thesugarcreek.com','https://www.thesugarcreek.com/contact-us',4,'Events team handles holiday parties and galas (20-400). No public email — call.'),
 ('Walden on Lake Houston Country Club','Club / Venue','Humble','','','','info@waldencc.com','832-445-2100','https://www.waldencc.com','https://www.waldencc.com/contact',3,'Private club; events specialist for parties up to 200.')
) as v(organization, org_type, city, organizer_name, organizer_role, manager_name, email, phone, website, source, fit_score, notes)
where not exists (select 1 from public.prospects);
