import cors from "cors";
import express from "express";
import sqlite3 from "sqlite3";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("mydatabase.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = today.getFullYear();

  const currentDate = mm + "/" + dd + "/" + yyyy;

  return currentDate;
};

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      playerName TEXT,
      jersey INTEGER,
      position TEXT,
      secPosition TEXT,
      height TEXT,
      nickname TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY,
      ast INTEGER,
      blk INTEGER,
      defReb INTEGER,
      fouls INTEGER,
      playerName TEXT,
      offReb INTEGER,
      stl INTEGER,
      threes INTEGER,
      threesAttempted INTEGER,
      tov INTEGER,
      twos INTEGER,
      twosAttempted INTEGER,
      gameId INTEGER
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS playoff_stats (
      id INTEGER PRIMARY KEY,
      ast INTEGER,
      blk INTEGER,
      defReb INTEGER,
      fouls INTEGER,
      playerName TEXT,
      offReb INTEGER,
      stl INTEGER,
      threes INTEGER,
      threesAttempted INTEGER,
      tov INTEGER,
      twos INTEGER,
      twosAttempted INTEGER,
      gameId INTEGER
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY,
      team1 TEXT,
      team2 TEXT,
      playerCount INTEGER,
      winner INTEGER,
      date TEXT
    )`);
});

app.get("/", (_, res) => {
  return res.send("Reached SBBall Server");
});

app.post("/api/createPlayer", (req, res) => {
  const body = req.body;

  try {
    const data = [
      body.name,
      body.jersey,
      body.position,
      body.secPosition,
      body.height,
      body.nickname,
    ];

    const insertQuery = `
      INSERT INTO players (playerName, jersey, position, secPosition, height, nickname)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(insertQuery, data, function (err) {
      if (err) {
        console.log(err);
        return res.send({ error: "Invalid Request" });
      } else {
        return res.send({ success: true });
      }
    });
  } catch (e) {
    return res.send({ error: e.toString() });
  }
});

app.get("/api/getPlayers", (_, res) => {
  const selectQuery = `
  SELECT * FROM players
`;

  // Execute the query
  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      return res.send({ error: err });
    }

    return res.send({ data: rows });
  });
});

app.get("/api/deletePlayer", (req, res) => {
  if (!req.query.id) {
    return;
  }

  const selectQuery = `DELETE FROM players WHERE id = ?`;

  // Execute the query
  db.run(selectQuery, [req.query.id], (err) => {
    if (err) {
      return res.send({ error: err });
    }

    return res.send({ success: true });
  });
});

app.post("/api/editPlayer", (req, res) => {
  const body = req.body;

  try {
    const data = [
      body.name,
      body.jersey,
      body.position,
      body.secPosition,
      body.height,
      body.nickname,
      body.id,
    ];

    const updateQuery = `
      UPDATE players SET 
        playerName = ?,
        jersey = ?,
        position = ?,
        secPosition = ?,
        height = ?,
        nickname = ?
      WHERE id = ?
    `;

    db.run(updateQuery, data, function (err) {
      if (err) {
        console.log(err);
        return res.send({ error: "Invalid Request" });
      } else {
        return res.send({ success: true });
      }
    });
  } catch (e) {
    return res.send({ error: e.toString() });
  }
});

app.post("/api/endGame", (req, res) => {
  const body = req.body.players;

  try {
    let team1 = [];
    let team2 = [];
    // add stats
    for (let i = 0; i < body.length; i++) {
      if (body[i].team == 1) {
        team1.push(body[i].name);
      }
      if (body[i].team == 2) {
        team2.push(body[i].name);
      }
    }

    // add matchup data
    const team1Str = team1.join(";");
    const team2Str = team2.join(";");
    const playerCount = team1.length;
    const winner = req.body.winner;
    const date = getTodayDate();

    const data = [team1Str, team2Str, playerCount, winner, date];

    const insertQuery =
      "INSERT INTO games (team1, team2, playerCount, winner, date) VALUES (?, ?, ?, ?, ?)";

    try {
      db.run(insertQuery, data);
    } catch (e) {
      return res.send({ error: e });
    }

    const idQuery = "SELECT id FROM games";

    try {
      db.all(idQuery, [], (_, rows: any) => {
        let allIds: number[] = [];

        for (const row of rows) {
          allIds.push(row.id);
        }

        let gameId = Math.max(...allIds);

        // add gameIds
        for (let i = 0; i < body.length; i++) {
          if (body[i].team == 1) {
            team1.push(body[i].name);
          }
          if (body[i].team == 2) {
            team2.push(body[i].name);
          }

          const data = [
            body[i].ast,
            body[i].blk,
            body[i].defReb,
            body[i].fouls,
            body[i].name,
            body[i].offReb,
            body[i].stl,
            body[i].threes,
            body[i].threesAttempted,
            body[i].tov,
            body[i].twos,
            body[i].twosAttempted,
            gameId,
          ];

          const mode = req.body.mode;

          const insertQuery = `
          INSERT INTO ${
            mode == "2v2" ? "stats" : "playoff_stats"
          } (ast, blk, defReb, fouls, playerName, offReb, stl, threes, threesAttempted, tov, twos, twosAttempted, gameId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(insertQuery, data);
        }
      });
    } catch (e) {
      return res.send({ error: e });
    }

    return res.send({ success: true });
  } catch (e) {
    return res.send({ error: e });
  }
});

app.get("/api/getPlayerAverages", (req, res) => {
  const mode = req.query.mode;
  const pc = mode == "2v2" ? 2 : 4;

  const query = `SELECT playerName, AVG((twos * 2) + (threes * 3)) AS pts, AVG(offReb + defReb) AS reb, AVG(ast) as ast, AVG(blk) as blk, AVG(stl) as stl, AVG(tov) as tov,
   ((TOTAL(twos) + TOTAL(threes)) / (TOTAL(twosAttempted) + TOTAL(threesAttempted))) as fg, AVG(twosAttempted) as tpfgA, AVG(twos) as tpfgM, AVG(threesAttempted) as ttpfgA, AVG(threes) as ttpfgM, 
   (TOTAL(threes)) / (TOTAL(threesAttempted)) as tp FROM ${
     mode == "2v2" ? "stats" : "playoff_stats"
   } INNER JOIN games 
   ON gameId=games.id WHERE playerCount = ? GROUP BY playerName;`;

  db.all(query, [pc], (err, rows: any) => {
    if (err) {
      res.send({ error: err });
    } else {
      let dataObj = [];

      console.log(rows);

      for (const row of rows) {
        console.log(row);
        dataObj.push({
          player: row.playerName,
          pts: row.pts,
          reb: row.reb,
          ast: row.ast,
          stl: row.stl,
          blk: row.blk,
          tov: row.tov,
          fg: row.fg * 100,
          tp: row.tp ? row.tp * 100 : 0,
          tpfgA: row.tpfgA,
          tpfgM: row.tpfgM,
          ttpfgA: row.tpfgM,
          ttpfgM: row.ttpfgM,
          fgA: row.ttpfgA + row.tpfgA,
          fgM: row.ttpfgM + row.tpfgM,
        });
      }

      return res.send({ data: dataObj });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://192.168.86.68:${port}/api`);
});
