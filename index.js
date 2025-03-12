import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;
const api_url = "https://pokeapi.co/api/v2/pokemon/";

// Global variable for the score
var score = 0;
var high_score = 0;
var pokemon_id;
var pokemon_image;
var pokemon_name;
var isCorrect;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function checkHighScore(isCorrect) {
  if (score >= high_score) {
    high_score = score;
  }
  if (!isCorrect) {
    score = 0;
  }
}

// Randomize Pokemon and store the id, image, and name of the pokemon
async function randomizePokemon() {
  var isNull = true;
  const response = await axios.get(api_url);
  const counter = response.data.count;
  while (isNull) {
    pokemon_id = Math.floor(Math.random() * counter) + 1;
    if (pokemon_id > 1025) {
      pokemon_id = pokemon_id - 1025 + 10000;
    }
    const pokemon = await axios.get(api_url + pokemon_id);

    pokemon_image =
      pokemon.data.sprites.other["official-artwork"].front_default;
    if (pokemon_image != null) {
      isNull = false;
    }
    pokemon_name = pokemon.data.species.name.replace(/-/g, " ");
  }
}

// Main Menu
app.get("/", async (req, res) => {
  await randomizePokemon();
  res.render("index.ejs", {
    id: pokemon_id,
    image: pokemon_image,
    high_score: high_score,
  });
});

// Start the game
app.get("/game", async (req, res) => {
  isCorrect = null;
  try {
    await randomizePokemon();
    res.render("game.ejs", {
      id: pokemon_id,
      image: pokemon_image,
      name: pokemon_name,
      isCorrect: isCorrect,
      score: score,
      high_score: high_score,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).send("An error occurred while fetching Pokémon data.");
  }
});

// Logic after submit the answer
app.post("/answer_guess", (req, res) => {
  isCorrect = null;
  var response_name = req.body.name;
  var guess_name = response_name.toLowerCase();
  if (pokemon_name == guess_name) {
    isCorrect = true;
    score += 1;
    checkHighScore(isCorrect);
    res.render("game.ejs", {
      id: pokemon_id,
      image: pokemon_image,
      name: pokemon_name,
      isCorrect: isCorrect,
      score: score,
      high_score: high_score,
    });
  } else {
    isCorrect = false;
    res.render("game.ejs", {
      id: pokemon_id,
      image: pokemon_image,
      name: pokemon_name,
      isCorrect: isCorrect,
      score: score,
      high_score: high_score,
    });
    checkHighScore(isCorrect);
  }
});

app.listen(port, () => {
  console.log(`Server is listening in port ${port}`);
});

export default (req, res) => {
  app(req, res);
};
