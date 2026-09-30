-- API Marketplace prototype database.
--
-- This is exactly the piece missing from the Entra prototype (see the
-- sequence diagram from that conversation): Entra only ever knows oid, name
-- and email. Everything about *this product* - organisation, role, teams,
-- who owns which application - has nowhere else to live, so it lives here,
-- keyed by the developer's Entra object ID (oid). Never a password or a
-- credential in this database - those stay in Entra / Key Vault.

create table if not exists profiles (
  oid           text primary key,             -- Entra object ID (the "oid" claim)
  name          text not null,
  email         text not null,
  organisation  text,
  role          text not null default 'consumer',  -- 'consumer' | 'producer'
  created_at    timestamptz not null default now()
);

-- Teams don't exist yet in the real product ("every application is owned by
-- you directly" - see applications.js), but this is the shape they'd take
-- when they do: a team owns applications, profiles belong to teams.
create table if not exists teams (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  created_at    timestamptz not null default now()
);

create table if not exists team_members (
  team_id       uuid not null references teams(id) on delete cascade,
  oid           text not null references profiles(oid) on delete cascade,
  role_in_team  text not null default 'member',  -- 'owner' | 'member'
  added_at      timestamptz not null default now(),
  primary key (team_id, oid)
);

-- One row per real Entra app registration created via the onboarding flow.
-- client_id is the real Entra appId; the secret itself is never stored here
-- (shown once to the developer, exactly like Entra's own behaviour) -
-- matches "Postgres only ever holds descriptive data that has no security
-- value on its own" from the design doc.
create table if not exists applications (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  environment   text not null,                 -- sandbox | development | integration-test | production
  owner_oid     text not null references profiles(oid) on delete cascade,
  team_id       uuid references teams(id) on delete set null,
  client_id     text not null,                 -- real Entra appId, from Graph
  created_at    timestamptz not null default now()
);

create index if not exists applications_owner_idx on applications(owner_oid);
create index if not exists applications_team_idx on applications(team_id);

-- One application can call several APIs, and gets a SEPARATE Subscription Key
-- per API - the Client ID/Secret above is the only thing shared across all of
-- them. publisher_id identifies the (API, environment) pair itself - Azure
-- APIM's "Product" - and is expected to repeat across different applications'
-- rows whenever they subscribe to the same API in the same environment
-- (e.g. HMPPS-DPS and HMPPS-CPS both calling the Production Reference Data
-- API see the same publisher_id, but each has their own subscription_key).
create table if not exists api_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid not null references applications(id) on delete cascade,
  api_name          text not null,                 -- e.g. 'cp-crime-defendant-details'
  publisher_id      text not null,                 -- the APIM Product id for this API + environment
  subscription_key  text not null,                 -- unique to this (application, api) pair
  is_mock           boolean not null default false, -- true until a real ARM credential exists (see routes.js)
  created_at        timestamptz not null default now()
);

create index if not exists api_subscriptions_application_idx on api_subscriptions(application_id);
