# SBBall 🏀

**A Comprehensive Basketball Statistics & Game Management System**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/sanaynesargi/SBBall)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📖 Overview

SBBall is an advanced basketball statistics tracking and game management platform designed for casual pickup games and competitive play. Whether you're playing 2v2 or 4v4, SBBall provides real-time stat tracking, performance ratings, player profiles, and comprehensive analytics to elevate your basketball experience from casual games to data-driven competition.

### Key Features

- **🎮 Live Game Tracking**: Real-time stat recording for 2v2 and 4v4 basketball games
- **📊 Comprehensive Stats**: Track points, rebounds, assists, steals, blocks, turnovers, and shooting percentages
- **🏆 Performance Ratings**: Advanced rating system that weighs different stats based on game mode (regular season vs playoffs)
- **👥 Player Profiles**: Detailed player cards with position, jersey number, height, nickname, and career statistics
- **📈 Shot Tendencies**: Track and visualize shooting patterns (2-pointers, 3-pointers, free throws)
- **🎯 Award System**: Track and display player achievements and awards
- **📱 Responsive UI**: Clean, mobile-friendly interface built with Next.js and Chakra UI
- **🔄 Game Feed**: Real-time play-by-play feed with score snapshots

---

## 🏗️ Architecture

SBBall follows a client-server architecture with SQLite database:

```
SBBall/
├── sbball-server/            # Backend API (Express.js + SQLite)
│   ├── src/
│   │   ├── server.ts          # Main API server with game & player endpoints
│   │   ├── performanceRating.ts # Rating calculation algorithms
│   │   └── shotTendencies.ts   # Player shooting pattern data
│   ├── dist/                  # Compiled JavaScript
│   └── package.json
│
└── sbball-ui/                # Frontend (Next.js + Chakra UI)
    ├── src/app/              # Next.js 14 app directory
    │   ├── page.tsx          # Live game tracker
    │   ├── main/             # Home dashboard
    │   ├── create/           # Create new game
    │   ├── gameView/         # View game history
    │   ├── playerInfo/       # Player profile pages
    │   └── admin/            # Admin panel
    ├── components/           # Reusable React components
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **SQLite3**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sanaynesargi/SBBall.git
   cd SBBall
   ```

2. **Install server dependencies:**
   ```bash
   cd sbball-server
   npm install
   ```

3. **Install UI dependencies:**
   ```bash
   cd ../sbball-ui
   npm install
   ```

### Running the Application

#### Start the Backend Server

```bash
cd sbball-server
npm start
```
The server runs on **port 8080** with nodemon for hot-reloading.

#### Start the Frontend

```bash
cd sbball-ui
npm run dev
```
The UI runs on **port 3000** (http://localhost:3000).

#### Production Build

```bash
cd sbball-ui
npm run build
npm start
```

---

## 💾 Database Schema

SBBall uses SQLite with the following schema:

### Core Tables

**`players`** - Player roster information
```sql
- id: INTEGER PRIMARY KEY
- playerName: TEXT
- jersey: INTEGER
- position: TEXT (PG, SG, SF, PF, C)
- secPosition: TEXT (Secondary position)
- height: TEXT
- nickname: TEXT
```

**`games`** - Game records
```sql
- id: INTEGER PRIMARY KEY
- team1: TEXT (Comma-separated player names)
- team2: TEXT (Comma-separated player names)
- playerCount: INTEGER (2 for 2v2, 4 for 4v4)
- winner: INTEGER (1 or 2)
- date: TEXT (MM/DD/YYYY)
```

**`stats`** - Regular season game statistics (2v2)
```sql
- id: INTEGER PRIMARY KEY
- playerName: TEXT
- twos: INTEGER
- twosAttempted: INTEGER
- threes: INTEGER
- threesAttempted: INTEGER
- offReb: INTEGER (Offensive rebounds)
- defReb: INTEGER (Defensive rebounds)
- ast: INTEGER (Assists)
- blk: INTEGER (Blocks)
- stl: INTEGER (Steals)
- tov: INTEGER (Turnovers)
- fouls: INTEGER
- rating: FLOAT (Performance rating)
- gameId: INTEGER (Foreign key to games)
```

**`playoff_stats`** - Playoff game statistics (4v4)
```sql
- id: INTEGER PRIMARY KEY
- playerName: TEXT
- twos: INTEGER
- twosAttempted: INTEGER
- threes: INTEGER
- threesAttempted: INTEGER
- fts: INTEGER (Free throws made)
- offReb: INTEGER
- defReb: INTEGER
- ast: INTEGER
- blk: INTEGER
- stl: INTEGER
- tov: INTEGER
- fouls: INTEGER
- rating: FLOAT
- gameId: INTEGER
```

**`game_feed` / `game_feed2`** - Play-by-play action log
```sql
- id: INTEGER PRIMARY KEY
- rel_id: INTEGER (Action sequence number)
- playerName: TEXT
- desc: TEXT (Action description)
- score: TEXT (Current score)
- snapshotPts: INTEGER
- snapshotAst: INTEGER
- snapshotOffReb: INTEGER
- snapshotDefReb: INTEGER
- snapshotBlk: INTEGER
- snapshotStl: INTEGER
- gameId: INTEGER
```

**`awards`** - Player accolades
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (Award name)
- winnerName: TEXT
- timesWon: INTEGER
```

---

## 📊 Performance Rating System

SBBall uses different rating formulas for regular season (2v2) vs playoff (4v4) games:

### Regular Season Rating (2v2)

**Base Weights:**
- Points: 0.1 per point
- Offensive Rebounds: 0.2 per rebound
- Defensive Rebounds: 0.15 per rebound
- Assists: 0.3 per assist
- Steals: 0.5 per steal
- Blocks: 0.5 per block
- Three-Pointers Made: 0.3 per make

**Efficiency Metrics:**
- Turnovers: -0.1 penalty per turnover
- Field Goal %: 1.7× multiplier
- Three-Point %: 1.0× multiplier

**Bonuses:**
- Double-Double (10+ pts & 10+ reb): +2.0
- Triple-Double (10+ pts, reb, ast): +4.0
- 20+ points: +0.5
- 30+ points: +1.0 (cumulative)
- 40+ points: +2.0 (cumulative)
- 50+ points: +4.0 (cumulative)
- 20+ rebounds: +2.0
- 30+ rebounds: +6.0 (cumulative)
- 5+ assists: +0.5
- 10+ assists: +2.0 (cumulative)
- 5+ threes: +0.5
- 10+ threes: +2.5 (cumulative)

### Playoff Rating (4v4)

Uses same base weights and bonuses but **excludes** efficiency metrics (no turnover penalty or shooting percentage bonuses) to emphasize raw production.

---

## 🎯 Game Modes

### 2v2 Mode (Regular Season)
- 2 players per team
- No free throws tracked
- Efficiency-based rating system
- Faster-paced games

### 4v4 Mode (Playoff)
- 4 players per team
- Free throws tracked
- Production-based rating system
- More structured gameplay

---

## 🎨 UI Pages

### Main Pages

1. **Home (`/`)** - Live game tracker
   - Add players to teams
   - Record stats in real-time
   - Track score and fouls
   - Submit game when complete

2. **Dashboard (`/main`)** - Central hub
   - View recent games
   - Access player profiles
   - Check leaderboards
   - Quick navigation

3. **Create Game (`/create`)** - Setup new game
   - Select game mode (2v2 or 4v4)
   - Choose players
   - Set teams
   - Initialize game

4. **Game History (`/gameView`)** - Past games
   - View completed games
   - Filter by date or players
   - Review statistics
   - Play-by-play feed

5. **Player Profiles (`/playerInfo`)** - Individual stats
   - Career statistics
   - Per-game averages
   - Shot chart tendencies
   - Awards and achievements

6. **Admin Panel (`/admin`)** - Management tools
   - Create/edit players
   - Manage awards
   - Database maintenance
   - System settings

---

## 🛠️ Technology Stack

### Backend
- **Express.js** - RESTful API framework
- **SQLite3** - Lightweight embedded database
- **TypeScript** - Type-safe server code
- **Nodemon** - Development hot-reloading
- **CORS** - Cross-origin resource sharing
- **Assemble** - Build tool

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI component library
- **Chakra UI** - Component library and design system
- **TypeScript** - Type-safe client code
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **Chakra UI Bottom Navigation** - Mobile navigation

---

## 🔌 API Reference

The backend exposes REST endpoints for game and player management:

### Player Management
- `POST /api/createPlayer` - Create new player profile
- `GET /api/getPlayers` - Retrieve all players
- `GET /api/getPlayer/:name` - Get specific player details
- `PUT /api/updatePlayer` - Update player information
- `GET /api/getPlayerAverages/:mode/:name` - Get player's average stats

### Game Management
- `POST /api/createGame` - Initialize new game
- `POST /api/submitGame` - Submit completed game with stats
- `GET /api/getGames` - Retrieve all games
- `GET /api/getGame/:id` - Get specific game details
- `GET /api/getGamesByPlayer/:name` - Get player's game history

### Statistics
- `GET /api/getLeaderboard/:mode` - Get stat leaders
- `GET /api/getTopPerformers/:mode` - Highest-rated performances
- `GET /api/getShotTendencies/:name` - Player shooting patterns
- `GET /api/getPlayerComparison/:name1/:name2` - Compare two players

### Awards
- `GET /api/getAwards` - List all awards
- `POST /api/createAward` - Create new award
- `PUT /api/updateAward` - Update award winner

### Game Feed
- `POST /api/addGameFeedEntry` - Add play-by-play entry
- `GET /api/getGameFeed/:gameId` - Get game's action feed

---

## 📝 Usage Examples

### Creating a Player

```typescript
POST /api/createPlayer
{
  "name": "John Doe",
  "jersey": 23,
  "position": "SF",
  "secPosition": "SG",
  "height": "6'6\"",
  "nickname": "JD"
}
```

### Recording a Game

1. Navigate to home page (`/`)
2. Select game mode (2v2 or 4v4)
3. Add players to Team 1 and Team 2
4. Click "Start Game"
5. Record stats by clicking buttons:
   - 2PT/3PT for made shots
   - Miss buttons for attempts
   - Reb, Ast, Stl, Blk for other stats
   - Foul for personal fouls
6. Track live score at top
7. Click "End Game" to submit

### Viewing Player Stats

1. Navigate to main dashboard
2. Click on player name
3. View:
   - Career averages
   - Recent games
   - Shot tendencies
   - Performance ratings
   - Awards won

---

## 🧮 Statistical Calculations

### Points Calculation
- 2-pointer made: 2 points
- 3-pointer made: 3 points
- Free throw made: 1 point (4v4 only)

### Shooting Percentages
- FG% = (2PM + 3PM) / (2PA + 3PA)
- 3P% = 3PM / 3PA
- FT% = FTM / FTA (4v4 only)

### Performance Rating
See [Performance Rating System](#📊-performance-rating-system) section above.

### Shot Tendencies
Calculated as percentage distribution:
- 2-pointer tendency: % of shots taken as 2-pointers
- 3-pointer tendency: % of shots taken as 3-pointers  
- Free throw tendency: % of points from free throws

---

## 🎮 Live Game Tracker Features

### Real-Time Stat Entry
- Quick-tap buttons for all stats
- Undo/redo functionality
- Live score updates
- Foul tracking with visual indicators

### Score Tracking
- Team scores displayed prominently
- Possession indicator
- Quarter/time tracking (optional)

### Player Cards
- Compact view showing current stats
- Color-coded by team
- Expandable for detailed view
- Quick stat modification

---

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```
PORT=8080
DB_PATH=./mydatabase.db
```

**UI (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Port Configuration

- Server: Port 8080 (configurable in `server.ts`)
- UI Dev: Port 3000 (default Next.js port)
- UI Prod: Port 3000 (configurable in start script)

---

## 📈 Data Flow

```
Live Game Input → React State Management
    ↓
Stat Calculations (Client-side)
    ↓
HTTP Request (Axios)
    ↓
Backend API (Express)
    ↓
Performance Rating Calculation
    ↓
Database Operations (SQLite)
    ↓
JSON Response
    ↓
Frontend Update (Chakra UI)
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain existing code style
- Test rating calculations thoroughly
- Ensure responsive mobile design
- Add comments for complex stat logic

---

## 📜 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Author

**Sanay Nesargi**

- GitHub: [@sanaynesargi](https://github.com/sanaynesargi)
- Project Link: [https://github.com/sanaynesargi/SBBall](https://github.com/sanaynesargi/SBBall)

---

## 🙏 Acknowledgments

- Inspired by pickup basketball games
- Built for players who love hoops and data
- Rating system designed to reward all-around play

---

## 🐛 Known Issues & Future Enhancements

### Planned Features
- **Mobile app** version (React Native)
- **Live multiplayer** scoring from multiple devices
- **Video highlights** integration
- **Shot charts** with court visualization
- **Advanced analytics**: +/-, PER, usage rate
- **Team statistics** and rankings
- **Season/league** management
- **Export to CSV/PDF**
- **Social features**: share games, comment
- **Bracket generation** for tournaments

### Current Limitations
- Local database only (no cloud sync)
- Manual stat entry required
- Limited to 2v2 and 4v4 formats
- No shot location tracking

---

## 🎯 Stat Tracking Guide

### What to Track

**Scoring:**
- 2-pointers made/attempted
- 3-pointers made/attempted
- Free throws made (4v4 only)

**Rebounding:**
- Offensive rebounds (own team's miss)
- Defensive rebounds (opponent's miss)

**Playmaking:**
- Assists (direct pass leading to score)

**Defense:**
- Steals (deflection/interception)
- Blocks (shot rejection)

**Mistakes:**
- Turnovers (lost possession)
- Personal fouls

### Tracking Tips

1. **Designate a scorekeeper** - One person focuses on tracking
2. **Call it out** - Players announce stats verbally
3. **Use confirmations** - "That's assist for John!"
4. **Track immediately** - Don't wait until end of game
5. **Be honest** - Stat padding ruins the fun

---

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review the codebase comments

---

## 🎉 Version History

**v0.1.0** (Current)
- Initial release
- Live game tracking for 2v2 and 4v4
- Performance rating system
- Player profiles and statistics
- Game history and feeds

---

## 🏀 Game Rules Compatibility

SBBall is designed to work with standard pickup basketball rules:

### 2v2 Games
- First to 21 (or time limit)
- 1s and 2s or 2s and 3s scoring
- Make-it-take-it or alternating possession
- No free throws typically

### 4v4 Games
- Traditional scoring (2s, 3s, FTs)
- Running clock or quarters
- Standard basketball rules
- Free throws on fouls

---

**Made with ❤️ for basketball enthusiasts everywhere**
