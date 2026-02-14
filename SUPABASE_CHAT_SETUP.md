# Supabase Real-time Chat Setup

## 📋 Prerequisites

1. Supabase project set up
2. Tables created in Supabase database

## 🗄️ Database Setup

### Step 1: Create Tables in Supabase

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Create chat-table
CREATE TABLE IF NOT EXISTS "chat-table" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message-table
CREATE TABLE IF NOT EXISTS "message-table" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  "roomId" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("roomId") REFERENCES "chat-table"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_roomId ON "message-table"("roomId");
CREATE INDEX IF NOT EXISTS idx_message_created_at ON "message-table"(created_at);
```

### Step 2: Enable Realtime on message-table

1. Go to Supabase Dashboard → Database → Replication
2. Find `message-table` in the list
3. Toggle ON the replication for `message-table`
4. This enables real-time updates for new messages

### Step 3: Set up Row Level Security (RLS)

Run these SQL commands in SQL Editor:

```sql
-- Enable RLS on chat-table
ALTER TABLE "chat-table" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read chat rooms
CREATE POLICY "Allow public read on chat-table"
ON "chat-table" FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert chat rooms
CREATE POLICY "Allow authenticated insert on chat-table"
ON "chat-table" FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS on message-table
ALTER TABLE "message-table" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages
CREATE POLICY "Allow public read on message-table"
ON "message-table" FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Allow public insert on message-table"
ON "message-table" FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

### Step 4: Insert Sample Chat Rooms

```sql
-- Insert some sample chat rooms
INSERT INTO "chat-table" (name) VALUES
  ('General Discussion'),
  ('Tech Talk'),
  ('Random Chat'),
  ('Help & Support');
```

## ✅ Verification

1. **Check tables exist:**
   - Go to Database → Tables
   - You should see `chat-table` and `message-table`

2. **Check Realtime is enabled:**
   - Go to Database → Replication
   - `message-table` should show as enabled

3. **Test the chat:**
   - Visit `/chat` page
   - You should see the chat rooms
   - Click "Chat" on any room
   - Send a message and it should appear in real-time!

## 🚀 Features

- ✅ Real-time chat using Supabase Realtime
- ✅ Room-based chat (each card has its own room)
- ✅ Protected route (only authenticated users)
- ✅ Popup chat interface
- ✅ Message history
- ✅ Auto-scroll to latest message

## 📝 Notes

- Messages are stored in Supabase database
- Real-time updates use Supabase Realtime subscriptions
- Each room is isolated (messages filtered by roomId)
- Chat popup can be closed and reopened

