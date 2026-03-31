-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('CS', 'BR')),
  status TEXT DEFAULT 'Registered' CHECK (status IN ('Registered', 'Confirmed', 'Playing', 'Eliminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  in_game_name TEXT NOT NULL,
  game_uid TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table (Admin only)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL CHECK (mode IN ('CS', 'BR')),
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  room_id TEXT NOT NULL,
  room_password TEXT NOT NULL,
  map_name TEXT NOT NULL,
  status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Anonymous users can create teams and players but not read them
CREATE POLICY "Enable insert for anonymous users" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for anonymous users" ON players FOR INSERT WITH CHECK (true);

-- Authenticated admins can do full CRUD on all tables
CREATE POLICY "Enable full access for admins" ON teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for admins" ON players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable full access for admins" ON matches FOR ALL USING (auth.role() = 'authenticated');

-- Public users can view matches
CREATE POLICY "Enable read for public" ON matches FOR SELECT USING (true);
