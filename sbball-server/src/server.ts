import cors from "cors";
import express from "express";
import sqlite3 from "sqlite3";
import { shotTendencies } from "./shotTendencies";

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

  db.run(`CREATE TABLE IF NOT EXISTS game_feed (
      id INTEGER PRIMARY KEY,
      rel_id INTEGER,
      playerName TEXT,
      desc TEXT,
      score TEXT,
      snapshotPts INTEGER,
      snapshotAst INTEGER,
      snapshotOffReb INTEGER,
      snapshotDefReb INTEGER,
      gameId INTEGER
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_feed2 (
      id INTEGER PRIMARY KEY,
      rel_id INTEGER,
      playerName TEXT,
      desc TEXT,
      score TEXT,
      snapshotPts INTEGER,
      snapshotAst INTEGER,
      snapshotOffReb INTEGER,
      snapshotDefReb INTEGER,
      gameId INTEGER
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
    const playerCount = mode == "4v4" ? 4 : team1.length;
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
              Math.round(playerAvgs.ast),
              Math.round(playerAvgs.blk),
              Math.round(playerAvgs.defReb),
              Math.round(playerAvgs.fouls),
              body[i].name,
              Math.round(playerAvgs.offReb),
              Math.round(playerAvgs.stl),
              body[i].threes,
              body[i].threesAttempted,
              Math.round(playerAvgs.tov),
              body[i].twos,
              body[i].twosAttempted,
              gameId,
            ];

            if (mode != "2v2") {
              data.push(body[i].fts);
            }
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
            player: Math.round(row.playerName),
            pts: Math.round(row.pts),
            reb: Math.round(row.offReb + row.defReb),
            ast: Math.round(row.ast),
            stl: Math.round(row.stl),
            blk: Math.round(row.blk),
            tov: Math.round(row.tov),
            twos: Math.round(row.twos),
            date: row.date,
            threes: Math.round(row.threes),
            twosAttempted: Math.round(row.twosAttempted),
            threesAttempted: Math.round(row.threesAttempted),
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

app.get("/api/getBoxScores", (req, res) => {
  const mode = req.query.mode;
  const pc = mode == "2v2" ? 2 : 4;

  if (!mode) {
    return res.send({ error: true, message: "Invalid Request" });
  }

  const playerQ = `SELECT * FROM games WHERE playerCount = ?`;

  db.all(playerQ, [pc], (_, games: any[]) => {
    if (!games || games.length === 0) {
      return res.send({ error: true, message: "No games found" });
    }

    let dataObj = [];
    let processedGames = 0;

    for (const game of games) {
      const gameId = game.id;
      const date = game.date;
      const team1 = game.team1;
      const team2 = game.team2;

      const team1Lst = team1.split(";");

      let team1Score = 0;
      let team2Score = 0;

      const gameQ = `SELECT playerName, AVG((twos * 2) + (threes * 3) ${
        mode == "4v4" ? "+ (fts * 1)" : ""
      }) AS pts, AVG(offReb + defReb) AS reb, AVG(ast) as ast, AVG(blk) as blk, AVG(stl) as stl, AVG(tov) as tov,
        ((TOTAL(twos) + TOTAL(threes)) / (TOTAL(twosAttempted) + TOTAL(threesAttempted))) as fg, AVG(twosAttempted) as tpfgA, AVG(twos) as tpfgM, AVG(threesAttempted) as ttpfgA, AVG(threes) as ttpfgM,
        (TOTAL(threes)) / (TOTAL(threesAttempted)) as tp
        FROM ${mode == "2v2" ? "stats" : "playoff_stats"}
        WHERE gameId=?
        GROUP BY playerName`;

      db.all(gameQ, [gameId], (_, performances: any[]) => {
        for (const perf of performances) {
          const playsTeam1 = team1Lst.includes(perf.playerName);

          if (playsTeam1) {
            team1Score += perf.pts;
          } else {
            team2Score += perf.pts;
          }
        }

        dataObj.push({
          gameId,
          perfs: performances,
          team1Score: team1Score,
          team2Score: team2Score,
          team1,
          team2,
          date,
        });

        processedGames++;

        if (processedGames === games.length) {
          res.send(dataObj);
        }
      });
    }
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

const generateShotDescription = (
  distance: number,
  result: string,
  range: any
) => {
  const shotActions = {
    paint: [
      "driving layup",
      "floater",
      "bank shot",
      "reverse layup",
      "put-back",
      "paint jumper",
      "push shot",
    ],
    mid: [
      "step-back jumper",
      "fadeaway",
      "pull-up jumper",
      "turnaround jumper",
      "catch-and-shoot",
      "contested jumper",
      "bank shot",
    ],
    three: [
      "deep three",
      "snipe",
      "step-back three",
      "catch-and-shoot three",
      "pull-up three",
      "corner three",
      "contested three",
    ],
  };

  const shotResults = {
    made: [],
    missed: ["Missed"],
  };

  // Determine if shot is "long-range" or use actual distance
  const distanceDescriptor =
    range === "three" ? `${distance}'` : `${distance}'`;

  // Select a random action from the corresponding range
  const randomAction =
    shotActions[range][Math.floor(Math.random() * shotActions[range].length)];

  // Select a random result
  const randomResult =
    result.toLowerCase() === "made"
      ? ""
      : shotResults.missed[
          Math.floor(Math.random() * shotResults.missed.length)
        ];

  // Return the generated shot description
  return `${
    randomResult ? randomResult + " " : ""
  }${distanceDescriptor} ${randomAction}`;
};

/* Archived */ /* DEPRECATED */
app.get("/api/exp", (req, res) => {
  /*
  This function (and sub-functions) is purely for retroactive game feed filling and will be archived once final- based on voted shot profiles it will fill the player shot feed similar to the one the Real App has.

  Shot distances are normalized to a high school court
  */

  // ARCHIVED

  return res.send({ deprecated: true });

  const calculateTwoCategoryProb = (paintW: number, midW: number) => {
    const total = paintW + midW;
    const probP = paintW / total; // Probability of paint

    const randomN = Math.random();

    // Determine category based on random number
    if (randomN < probP) {
      return "paint";
    } else {
      return "mid";
    }
  };

  const calculateShotRange = (range: [number, number], weight: number) => {
    const [min, max] = range;

    // Generate a random number with weight influence
    const randomN = Math.pow(Math.random(), 1 / (weight / 100));

    // Scale the random number to the provided range
    const result = min + (max - min) * randomN;

    return Math.round(result);
  };

  function shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // this just puts everything in a random order (not what actually happened)
  const flattenGameMap = (gameFeed: any, gameId: any) => {
    let feed = [];

    let exception1 = null;
    let exception2 = null;
    let exception3 = null;

    for (const key of Object.keys(gameFeed)) {
      for (const entry of gameFeed[key]) {
        const value = {
          ...entry,
          gameId,
        };

        // test for exceptions (below)
        if (gameId == 18) {
          if (
            !exception1 &&
            entry.player == "Arav" &&
            entry.two &&
            entry.make
          ) {
            exception1 = value;
          } else {
            feed.push(value);
          }
        } else if (gameId == 19) {
          if (
            !exception2 &&
            entry.player == "Sanay" &&
            entry.two &&
            entry.make
          ) {
            exception2 = value;
          } else {
            feed.push(value);
          }
        } else if (gameId == 20) {
          if (
            !exception3 &&
            entry.player == "Sanay" &&
            !entry.two &&
            !entry.ft &&
            entry.make
          ) {
            exception3 = value;
          } else {
            feed.push(value);
          }
        } else {
          feed.push(value);
        }
      }
    }

    feed = shuffleArray(feed);

    // add exceptions

    // Arav Game Winner (id = 18) (two)
    if (exception1) {
      exception1.desc = "14' contested floater buzzer beater";
      feed.push(exception1);
    }

    // Sanay Game Winner (id = 19) (two)
    if (exception2) {
      exception2.desc = "17' fadeaway dagger";
      feed.push(exception2);
    }

    // Sanay Series Clincher (id = 20) (three)
    if (exception3) {
      exception3.desc = "20' contested corner three";
      feed.push(exception3);
      // console.log(feed[feed.length - 1]);
    }

    return feed;
  };

  let street = false;
  const query = "SELECT * FROM stats";

  const shotTypeRanges: any = {
    paint: [1, 9],
    mid: [10, 19],
    three: [20, 25],
  };

  const shotMap: any = {
    paint: 0,
    mid: 1,
    three: 2,
  };

  db.all(query, (err, rows: any) => {
    let playerShotLogs: any = {};

    for (const row of rows) {
      const player = row.playerName;
      const playerShotProfile = shotTendencies[player];

      if (!playerShotLogs[row.gameId]) {
        playerShotLogs[row.gameId] = [];
      }
      if (!playerShotLogs[row.gameId][player]) {
        playerShotLogs[row.gameId][player] = [];
      }

      const twosAttempted = row.twosAttempted;
      const twosMade = row.twos;

      const threesAttempted = row.threesAttempted;
      const threesMade = row.threes;

      const freeThrowsMade = row.fts;

      // cannot accurately give snapshots for these (will have to use final numbers)
      let snapshotAst = Math.round(row.ast);
      let snapshotOffReb = Math.round(row.offReb);
      let snapshotDefReb = Math.round(row.defReb);

      for (let c = 0; c < twosAttempted; c++) {
        let shotType: any = calculateTwoCategoryProb(
          playerShotProfile[0],
          playerShotProfile[1]
        );

        let shotRange = shotTypeRanges[shotType];
        let shotDist = calculateShotRange(
          shotRange,
          playerShotProfile[shotMap[shotType]]
        );

        // made shot
        if (c < twosMade) {
          playerShotLogs[row.gameId][player].push({
            desc: generateShotDescription(shotDist, "Made", shotType),
            pts: 0,

            ast: false,
            defReb: false,
            offReb: false,

            make: true,
            two: true,
            player,
          });
        } else {
          playerShotLogs[row.gameId][player].push({
            desc: generateShotDescription(shotDist, "Miss", shotType),
            pts: 0,

            ast: false,
            defReb: false,
            offReb: false,

            make: false,
            two: true,
            player,
          });
        }
      }

      for (let c = 0; c < threesAttempted; c++) {
        let shotRange = shotTypeRanges.three;
        let shotDist = calculateShotRange(shotRange, playerShotProfile[2]);

        // made shot
        if (c < threesMade) {
          playerShotLogs[row.gameId][player].push({
            desc: generateShotDescription(shotDist, "Made", "three"),
            pts: 0,

            ast: false,
            defReb: false,
            offReb: false,

            make: true,
            two: false,
            player,
          });
        } else {
          playerShotLogs[row.gameId][player].push({
            desc: generateShotDescription(shotDist, "Miss", "three"),
            pts: 0,

            ast: false,
            defReb: false,
            offReb: false,

            make: false,
            two: false,
            player,
          });
        }
      }

      for (let c = 0; c < freeThrowsMade; c++) {
        playerShotLogs[row.gameId][player].push({
          desc: `Free throw made`,
          pts: 0,

          ast: false,
          defReb: false,
          offReb: false,

          make: true,
          two: false,
          ft: true,
          player,
        });
      }

      for (let c = 0; c < snapshotAst; c++) {
        playerShotLogs[row.gameId][player].push({
          desc: `${player} assisted basket`,
          pts: 0,

          ast: true,
          defReb: false,
          offReb: false,

          make: false,
          two: false,
          player,
        });
      }

      for (let c = 0; c < snapshotDefReb; c++) {
        playerShotLogs[row.gameId][player].push({
          desc: `${player} defensive rebound`,
          pts: 0,

          ast: false,
          defReb: true,
          offReb: false,

          make: false,
          two: false,
          player,
        });
      }

      for (let c = 0; c < snapshotOffReb; c++) {
        playerShotLogs[row.gameId][player].push({
          desc: `${player} offensive rebound`,
          pts: 0,

          ast: false,
          defReb: false,
          offReb: true,

          make: false,
          two: false,
          player,
        });
      }

      let shuffledPlayer = shuffleArray(playerShotLogs[row.gameId][player]);

      playerShotLogs[row.gameId][player] = shuffledPlayer;
    }

    for (const gameId of Object.keys(playerShotLogs)) {
      let query =
        "INSERT INTO game_feed2 (rel_id, playerName, desc, score, snapshotPts, snapshotAst, snapshotOffReb, snapshotDefReb, gameId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

      let log = playerShotLogs[gameId];
      let flattened = flattenGameMap(log, gameId);
      let currPts: any = {};
      let currAst: any = {};
      let currDefReb: any = {};
      let currOffReb: any = {};

      for (const name of Object.keys(log)) {
        currPts[name] = 0;
        currAst[name] = 0;
        currDefReb[name] = 0;
        currOffReb[name] = 0;
      }

      let twoAdd = street ? 1 : 2;
      let threeAdd = street ? 2 : 3;
      let rel_id = 0;

      for (const entry of flattened) {
        if (entry.ast) {
          currAst[entry.player] += 1;
        } else if (entry.defReb) {
          currDefReb[entry.player] += 1;
        } else if (entry.offReb) {
          currOffReb[entry.player] += 1;
        } else if (entry.make) {
          if (entry.two) {
            currPts[entry.player] += twoAdd;
          } else if (entry.ft) {
            currPts[entry.player] += 1;
          } else {
            currPts[entry.player] += threeAdd;
          }
        }

        entry.pts = currPts[entry.player];
        entry.ast = currAst[entry.player];
        entry.offReb = currDefReb[entry.player];
        entry.defReb = currOffReb[entry.player];
        entry.rel_id = rel_id;

        rel_id++;
      }

      // insert
      for (const entry of flattened) {
        db.all(
          query,
          [
            entry.rel_id,
            entry.player,
            entry.desc,
            "0-0",
            entry.pts,
            entry.ast,
            entry.offReb,
            entry.defReb,
            entry.gameId,
          ],
          (err, rows) => {
            console.log(err);
          }
        );
      }
    }
  });

  res.send({ yay: 1 });
});

app.get("/api/gameFeed", (req, res) => {
  const params = req.query;

  if (!params.gameId || !params.mode) {
    return res.send({ error: true, msg: "Invalid Request" });
  }

  // game_feed2 = regular season
  // game_feed = playoffs

  const query = `SELECT * FROM ${
    params.mode == "4v4" ? "game_feed" : "game_feed2"
  } WHERE gameId = ?`;
  db.all(query, [params.gameId], (err, rows) => {
    if (err) {
      res.send({ err });
    }
    res.send({ feed: rows });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://192.168.86.68:${port}/api`);
});
