create table roadmaps (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  github_data jsonb,
  roadmap jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table rate_limits (
  id uuid default gen_random_uuid() primary key,
  ip text not null,
  count integer default 1,
  date date default current_date,
  unique(ip, date)
);
