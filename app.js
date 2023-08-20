const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(
    booksArray.map(function (booksArr) {
      return {
        playerId: booksArr["player_id"],
        playerName: booksArr["player_name"],
        jerseyNumber: booksArr["jersey_number"],
        role: booksArr["role"],
      };
    })
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const getBooksQuery = `
    INSERT INTO
       cricket_team (player_name, jersey_number, role)
    VALUES
        ("${playerName}",${jerseyNumber},"${role}")`;
  const booksArray = await db.run(getBooksQuery);
  response.send("Player Added to Team");
});

app.get("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const getBooksQuery = `
    SELECT * 
    FROM cricket_team 
    WHERE player_id=${player_id};`;
  const booksArray = await db.get(getBooksQuery);
  response.send({
    playerId: booksArray["player_id"],
    playerName: booksArray["player_name"],
    jerseyNumber: booksArray["jersey_number"],
    role: booksArray["role"],
  });
});

app.put("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, Role } = playerDetails;
  const getBooksQuery = `
   UPDATE
    cricket_team
   SET

    player_name= "${playerName}",
    jersey_number= ${jerseyNumber},
    role= "${Role}"
   WHERE
    player_id=${player_id};`;
  const booksArray = await db.run(getBooksQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const getBooksQuery = `
    DELETE FROM  
    cricket_team 
    WHERE player_id=${player_id};`;
  await db.run(getBooksQuery);
  response.send("Player Removed");
});

module.exports = app;
