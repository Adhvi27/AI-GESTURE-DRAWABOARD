/*
  # Create board_sessions table

  ## Summary
  Stores saved whiteboard sessions from AirBoard. Each session captures metadata
  and a snapshot of the drawing at time of save.

  ## New Tables
  - `board_sessions`
    - `id` (uuid, primary key)
    - `room_code` (text) — short code identifying the classroom room
    - `name` (text) — user-friendly label for the saved session
    - `snapshot_url` (text) — base64 data URL of the canvas snapshot
    - `stroke_count` (int) — number of strokes at time of save
    - `created_at` (timestamptz) — when the session was saved

  ## Security
  - RLS enabled
  - Public read/insert/delete allowed (this is a demo board without auth)
    but still uses proper RLS policies scoped per operation
*/

CREATE TABLE IF NOT EXISTS board_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  snapshot_url text NOT NULL DEFAULT '',
  stroke_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE board_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view board sessions"
  ON board_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert board sessions"
  ON board_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete board sessions"
  ON board_sessions
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS board_sessions_created_at_idx ON board_sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS board_sessions_room_code_idx ON board_sessions (room_code);
