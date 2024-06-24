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

function calculateImpressiveIndex(stats: any, weights: any, avg: any) {
  let impressiveIndex: any = {};
  for (let stat in stats) {
    if (weights.hasOwnProperty(stat)) {
      let normalizedValue = stats[stat] / avg[stat]; // Normalize the stat value
      impressiveIndex[stat] = normalizedValue * weights[stat]; // Apply weight
    }
  }
  return impressiveIndex;
}

function getTopStats(stats: any, impressiveIndex: any) {
  // Remove 'pts' from the impressive index
  delete impressiveIndex["pts"];

  // Convert the impressiveIndex object to an array of [stat, value] pairs and sort by the impressive index value
  let sortedStats = Object.entries(impressiveIndex).sort(
    (a: any, b: any) => b[1] - a[1]
  );

  // Create an object with the top 2 impressive stats
  let topStats: any = {};
  if (sortedStats.length > 0) {
    topStats[sortedStats[0][0]] = stats[sortedStats[0][0]];
  }
  if (sortedStats.length > 1) {
    topStats[sortedStats[1][0]] = stats[sortedStats[1][0]];
  }

  return topStats;
}

const getPlayerAverages = (
  mode: string,
  playerName: string
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const pc = mode == "2v2" ? 2 : 4;

    const query = `SELECT playerName, AVG(twos) as twos, AVG(threes) as threes, ${
      mode == "2v2" ? "" : "AVG(fts) as fts,"
    } AVG(offReb) AS offReb, AVG(defReb) as defReb, AVG(ast) as ast, AVG(blk) as blk, AVG(stl) as stl, AVG(tov) as tov,
      AVG(twosAttempted) as twosAttempted, AVG(threesAttempted) as threesAttempted, AVG(fouls) as fouls
     FROM ${mode == "2v2" ? "stats" : "playoff_stats"} INNER JOIN games 
    ON gameId=games.id WHERE playerCount = ? GROUP BY playerName;`;

    db.all(query, [pc], (err, rows: any) => {
      if (err) {
        reject(err);
      } else {
        for (const row of rows) {
          if (row.playerName != playerName) {
            continue;
          }

          let playerData = row;

          resolve([playerData]);
        }
      }
    });
  });
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

  db.run(`CREATE TABLE IF NOT EXISTS awards (
      id INTEGER PRIMARY KEY,
      name TEXT,
      winnerName TEXT,
      timesWon INTEGER
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
      fts INTEGER,
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
  const averageFill = req.body.averageFill;
  const mode = req.body.mode;

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
      db.all(idQuery, [], async (_, rows: any) => {
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

          let data: any = [];

          if (!averageFill) {
            data = [
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

            if (mode != "2v2") {
              data.push(body[i].fts);
            }
          } else {
            const avgs = await getPlayerAverages(mode, body[i].name);

            if (!avgs) {
              return res.send({ error: true, message: "player doesn't exist" });
            }

            const playerAvgs = avgs[0];

            // get average stats by player
            data = [
              playerAvgs.ast,
              playerAvgs.blk,
              playerAvgs.defReb,
              playerAvgs.fouls,
              body[i].name,
              playerAvgs.offReb,
              playerAvgs.stl,
              body[i].threes,
              body[i].threesAttempted,
              playerAvgs.tov,
              body[i].twos,
              body[i].twosAttempted,
              gameId,
            ];

            if (mode != "2v2") {
              data.push(playerAvgs.fts);
            }

            console.log(data);
          }

          const insertQuery = `
          INSERT INTO ${
            mode == "2v2" ? "stats" : "playoff_stats"
          } (ast, blk, defReb, fouls, playerName, offReb, stl, threes, threesAttempted, tov, twos, twosAttempted, gameId ${
            mode == "2v2" ? "" : ",fts"
          })
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  const query = `SELECT playerName, AVG((twos * 2) + (threes * 3) ${
    mode == "4v4" ? "+ (fts * 1)" : ""
  }) AS pts, AVG(offReb + defReb) AS reb, AVG(ast) as ast, AVG(blk) as blk, AVG(stl) as stl, AVG(tov) as tov,
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

      for (const row of rows) {
        let obj = {
          player: row.playerName,
          pts: row.pts,
          reb: row.reb,
          ast: row.ast,
          stl: row.stl,
          blk: row.blk,
          tov: row.tov,
          fg: row.fg * 100,
          tp: row.ttpfgA > 0 ? (row.ttpfgM / row.ttpfgA) * 100 : 0,
          tpfgA: row.tpfgA,
          tpfgM: row.tpfgM,
          ttpfgA: row.ttpfgA,
          ttpfgM: row.ttpfgM,
          fgA: row.ttpfgA + row.tpfgA,
          fgM: row.ttpfgM + row.tpfgM,
        };

        dataObj.push(obj);
      }

      return res.send({ data: dataObj });
    }
  });
});

app.get("/api/getPlayerGameLog", (req, res) => {
  const mode = req.query.mode;
  const playerName = req.query.playerName;
  const pc = mode == "2v2" ? 2 : 4;

  if (!playerName || !mode) {
    return res.send({ error: true, message: "Invalid Request" });
  }

  const queryAvg = `SELECT playerName, AVG((twos * 2) + (threes * 3) ${
    mode == "4v4" ? "+ (fts * 1)" : ""
  }) AS pts, AVG(offReb + defReb) AS reb, AVG(ast) as ast, AVG(blk) as blk, AVG(stl) as stl, AVG(tov) as tov,
   ((TOTAL(twos) + TOTAL(threes)) / (TOTAL(twosAttempted) + TOTAL(threesAttempted))) as fg, AVG(twosAttempted) as tpfgA, AVG(twos) as tpfgM, AVG(threesAttempted) as ttpfgA, AVG(threes) as ttpfgM, 
   (TOTAL(threes)) / (TOTAL(threesAttempted)) as tp FROM ${
     mode == "2v2" ? "stats" : "playoff_stats"
   } INNER JOIN games
   ON gameId=games.id WHERE playerCount = ? AND playerName = ? GROUP BY playerName;`;

  db.all(queryAvg, [pc, playerName], (_, rows: any) => {
    const row = rows[0];

    if (!row) {
      return res.send({ data: [] });
    }

    let avg = {
      player: row.playerName,
      pts: row.pts,
      reb: row.reb,
      ast: row.ast,
      stl: row.stl,
      blk: row.blk,
      tov: row.tov,
      fg: 75,
    };

    const weights = {
      pts: 1.0,
      reb: 0.6,
      ast: 1.5,
      stl: 1.8,
      blk: 1.8,
      tov: -0.5, // Negative weight for turnovers since lower is better
      fg: 0.9,
    };

    const query = `SELECT playerName, (twos * 2) + (threes * 3) ${
      mode == "4v4" ? "+ (fts * 1)" : ""
    } AS pts, offReb, defReb, ast, blk, stl, tov,
    twosAttempted, twos, threesAttempted, threes, date 
    FROM ${mode == "2v2" ? "stats" : "playoff_stats"} INNER JOIN games 
   ON gameId=games.id WHERE playerCount = ? AND playerName = ?;`;

    db.all(query, [pc, playerName], (err, rows: any) => {
      if (err) {
        res.send({ error: err });
      } else {
        let dataObj = [];
        let dataFull: any = [];

        if (rows.length == 0) {
          return res.send({ data: [], dataFull: [] });
        }

        for (const row of rows) {
          let obj = {
            player: row.playerName,
            pts: row.pts,
            reb: row.offReb + row.defReb,
            ast: row.ast,
            stl: row.stl,
            blk: row.blk,
            tov: row.tov,
            twos: row.twos,
            date: row.date,
            threes: row.threes,
            twosAttempted: row.twosAttempted,
            threesAttempted: row.threesAttempted,
            fg: (
              ((row.twos + row.threes) /
                (row.twosAttempted + row.threesAttempted)) *
              100
            ).toFixed(2),
          };

          let impressiveIndex = calculateImpressiveIndex(obj, weights, avg);
          let topStats = getTopStats(obj, impressiveIndex);
          let finalStats = { pts: obj.pts, ...topStats };

          dataObj.push({ ...finalStats, date: obj.date });
          dataFull.push(obj);
        }

        return res.send({
          data: dataObj.reverse(),
          dataFull: dataFull.reverse(),
        });
      }
    });
  });
});

app.post("/api/addAwards", (req, res) => {
  const body = req.body;

  try {
    const data = body.awardData;

    for (const award of data) {
      const playerName = award[0];
      const awardName = award[1];

      const checkQuery = `
        SELECT * FROM awards WHERE name = ? AND winnerName = ?
      `;

      db.all(checkQuery, [awardName, playerName], function (err, rows: any) {
        if (err) {
          console.log(err);
          return res.send({ error: "Invalid Request" });
        }

        let prev = rows.length > 0;
        let timesWon = prev ? rows[0].timesWon + 1 : 1;

        if (!prev) {
          const insertQuery = `
            INSERT INTO awards (name, winnerName, timesWon)
            VALUES (?, ?, ?)
          `;
          db.run(
            insertQuery,
            [awardName, playerName, timesWon],
            function (err) {
              if (err) {
                return res.send({ error: "Invalid Request" });
              } else {
                return res.send({ success: true });
              }
            }
          );
        } else {
          const insertQuery = `
            UPDATE awards SET timesWon = timesWon + 1 WHERE name = ? AND winnerName = ?
          `;

          db.run(insertQuery, [awardName, playerName], function (err) {
            if (err) {
              console.log(err);
              return res.send({ error: "Invalid Request" });
            } else {
              return res.send({ success: true });
            }
          });
        }
      });
    }
  } catch (e) {
    return res.send({ error: e.toString() });
  }
});

app.get("/api/getAwards", (req, res) => {
  const player = req.query.player;

  if (!player) {
    return res.send({ error: true, message: "Invalid Request" });
  }

  const query = `SELECT * FROM awards WHERE winnerName = ?`;

  db.all(query, [player], (err, rows: any) => {
    if (err) {
      return res.send({ error: err.toString() });
    }

    let beautified = [];

    for (const row of rows) {
      beautified.push([row.name, row.winnerName, row.timesWon]);
    }

    res.send({ awards: beautified });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://192.168.86.68:${port}/api`);
});
