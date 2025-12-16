# ShareWay - Quick Start Guide

Get ShareWay running with production database in 10 minutes!

## 1. Clone & Install (2 minutes)

```bash
git clone https://github.com/yourusername/shareway.git
cd shareway
npm install
```

## 2. Setup Supabase Database (5 minutes)

### A. Create Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up (GitHub or Email)

### B. Create Project
1. Click "New Project"
2. Name: `ShareWay`
3. Password: Create strong password
4. Region: Choose nearest (India: Mumbai)
5. Click "Create new project"
6. Wait 2 minutes for setup

### C. Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open `supabase/schema.sql` from this repo
4. Copy **entire file** contents
5. Paste into SQL Editor
6. Click **"Run"** (wait 30 seconds)

### D. Get API Keys
1. Go to **Settings** → **API**
2. Copy two values:
   - **Project URL** 
   - **anon public** key

## 3. Configure Environment (1 minute)

Create `.env` file in project root:

```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
EOF
```

**Replace with your actual values!**

## 4. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 5. Test It! (1 minute)

1. Click "Get Started"
2. Select "Passenger" or "Driver"
3. Fill registration form
4. Submit

**Check Supabase Dashboard:**
- Go to **Table Editor** → **profiles**
- See your new user!
- Check **rewards** table → 1000 bonus points!

---

## That's It!

Your app is running with:
- ✅ Secure PostgreSQL database
- ✅ Real-time data persistence
- ✅ Automatic backups
- ✅ Production-ready security

---

## Next Steps

### For Testing
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### For Deployment

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

**Remember to add environment variables in deployment settings!**

---

## Need Help?

- **Database Setup**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Migration Guide**: See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Supabase Docs**: https://supabase.com/docs

---

## Troubleshooting

### "Failed to connect to Supabase"
- Check `.env` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Restart dev server: `npm run dev`

### "RLS policy error"
- Make sure you ran the entire `schema.sql` script
- Check Supabase dashboard → Authentication → Policies

### "Signup not working"
- Check browser console for errors
- Verify Supabase project is active (not paused)
- Check table editor to see if data is being created

### "Cannot find module @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

---

**Happy Carpooling!** 🚗💚

