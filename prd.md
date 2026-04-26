uilt for small logistics operators in Lagos — and for anyone who wants to start a
dispatch business from scratch.
01
The Problem
Small logistics operators in Lagos — guys running 2 to 10 bikes — manage everything in their head or on
WhatsApp. They have no system. They have no visibility. They have no way to give their clients a tracking
link.
Pain Point Current Reality Cost
Job assignment WhatsApp messages, phone calls Jobs get missed or duplicated
Rider tracking None — call the rider and hope Operators fly blind all day
Client updates Manual calls when remembered Clients lose trust, churn
Revenue tracking Mental notes or paper No idea which jobs made money
Starting fresh No system, no playbook High failure rate for new operators
02
The Solution
Fleeto is the operating system for small logistics businesses. It gives operators a simple dashboard to run
their fleet, gives riders a mobile job list, and gives end customers a real-time tracking link — all without
needing technical knowledge to set up or run.
Fleeto also serves a second type of user: the aspiring logistics entrepreneur who wants to start a dispatch
business — fulfilling orders for e-commerce brands, marketplaces, or import businesses that need
last-mile delivery across Nigeria. Fleeto gives them the infrastructure to launch without building from
scratch.
The Operator The Entrepreneur
Already running a small fleet. Has clients, has
riders, has daily jobs. Needs a system to stop
managing everything on WhatsApp.
Wants to start a logistics business. Needs to
onboard riders, take jobs from brands and
platforms, and look professional from day one.
2–10 riders · Daily delivery jobs · Lagos-based 0–5 riders to start · B2B fulfilment · Growth-focused
03
MVP Scope
The MVP focuses on three things that make an operator say 'I need this.' Everything else is post-launch.
01 02 03
Job Assignment Rider Tracking Customer Notification
Create and assign delivery
jobs to riders in seconds.
See where your riders are in
real time on a live map.
Customer gets a WhatsApp
link to track their package.
04
Feature Breakdown
Core MVP Features
Operator Dashboard MVP
A clean web dashboard where the operator sees all active jobs, rider status, and delivery
progress in one view. Create a job in under 30 seconds — pickup address, drop-off
address, parcel description, assign to a rider. No training needed.
Rider Mobile App MVP
A lightweight mobile-first interface for riders. Shows their assigned jobs in order, pickup
and drop-off details, and lets them mark jobs as picked up, in transit, or delivered. Works
on any Android phone. Minimal data usage.
Real-time Rider Location MVP
Operator sees rider locations on a live map. No guessing, no calling. Location updates
every 30 seconds using the rider's phone GPS. Visible only while a job is active.
WhatsApp Tracking Link MVP
When a job is created, Fleeto automatically generates a tracking link and sends it to the
end customer via WhatsApp. Customer sees a live map of the rider's current location and
estimated arrival. No app download required for the customer.
Fleet & Rider Management MVP
Operator adds riders to their fleet, assigns them a role, and manages their profile. Rider
gets an invite link to download the app and join the fleet. Simple onboarding — no
back-and-forth.
Business Onboarding (Entrepreneur Mode) MVP
A dedicated onboarding flow for entrepreneurs starting a new logistics business. Guides
them through fleet setup, pricing configuration, and connecting their first client or platform.
Feels like a launchpad, not a blank dashboard.
Post-MVP — Out of Scope for v1
Revenue & Earnings
Tracking
Per-job revenue, rider pay summaries, weekly earnings reports.
Invoice Generation Auto-generate invoices for business clients at end of month.
Client Portal Business clients get a read-only portal to create jobs and track their deliveries.
Multi-city Expansion Support for operators running cross-city or inter-state logistics.
Ratings & Reviews End customers rate riders after delivery.
Bulk Job Import CSV upload for e-commerce brands sending 50+ deliveries at once.
Cold Chain / Perishables Specialised job types for food and pharmaceutical delivery.
05
Core User Flows
0
1
Operator creates and assigns a job
1 Operator logs into dashboard
2 Taps 'New Job'
3 Enters pickup address, drop-off address, parcel description
4 Selects an available rider from their fleet
5 Enters customer phone number (optional — for WhatsApp notification)
6 Confirms — job is created and pushed to rider's app
7 Customer receives a WhatsApp tracking link automatically
0
2
Rider receives and completes a job
1 Rider opens the app — sees new job at top of list
2 Views pickup details and navigates to sender
3 Marks job as 'Picked up'
4 Navigates to drop-off address
5 Marks job as 'Delivered' — optionally takes a photo
6 Job status updates on operator dashboard in real time
7 Customer's tracking link shows 'Delivered'
0
3
Entrepreneur starts a new logistics business
1 Entrepreneur signs up and selects 'Start a logistics business'
2 Names their business and sets their service area
3 Adds first rider(s) via invite link
4 Configures delivery pricing (flat rate or per-zone)
5 Connects first client or business via a shareable job link
6 First job is created — fleet is live
06
Technical Architecture
Fleeto is built as a mobile-first web platform with a FastAPI backend. All rider-facing interfaces are
optimised for low-end Android on limited data.
Layer Technology Rationale
Backend API FastAPI (Python) Fast, async, clean — perfect for real-time job and location updates
Database PostgreSQL Relational — jobs, riders, fleets, and clients have clear relationships
Real-time WebSockets via FastAPI Rider location pushes to operator dashboard without polling
Mapping Google Maps / Mapbox Location display, route drawing, address autocomplete
WhatsApp WhatsApp Business API Automated tracking link delivery to end customers
Auth JWT + refresh tokens Separate token flows for operators and riders
Rider App React PWA (mobile web) No app store — riders access via browser, works offline partially
Operator Dashboard React web app Full desktop and tablet support for operators managing their fleet
Hosting Railway / Render Simple deployment, low ops overhead for solo dev
07
Monetisation
Fleeto charges a monthly subscription per operator — flat fee, no per-job commissions. Simple for the
operator to understand, predictable revenue for Fleeto.
Plan Price / month Fleet size Includes
Starter Free Up to 2 riders Job assignment, basic tracking, WhatsApp notifications
Growth N5,000 Up to 10 riders Everything in Starter + live map, job history, client links
Business N15,000 Unlimited Everything in Growth + analytics, bulk jobs, priority support
The Starter tier is free intentionally — removes all friction for the first operator to try Fleeto. Upgrade happens naturally
when they add a third rider or need the map.
08
Go-to-Market
Start in one neighbourhood. Get it working well for five operators. Let word of mouth do the first expansion.
Week 1–2 Find 3 small logistics operators in Lagos willing to try a free tool. Ikeja, Yaba, or
Surulere are good starting zones.
Week 3–4 Onboard them manually. Sit with them. Watch where they struggle. Fix the product in
real time.
Month 2 First paying customer. Even one operator on the Growth plan at N5,000 validates the
model.
Month 3 Five paying operators. Begin targeting entrepreneurs wanting to start dispatch
businesses — different acquisition channel, same product.
Month 4+ Target e-commerce brands (Instagram vendors, Temu fulfilment, Jumia last-mile) who
need an operator to plug into their logistics.
09
