const fs = require("fs");

const args = require('yargs').argv;

// this is the file where the delegators are saved
const DELEGATORS_FILE = "./data/delegators.json";

const PICKS = args['winners'] || 1;

async function drawingPicker() {
  let delegators = JSON.parse(fs.readFileSync(DELEGATORS_FILE, "utf8"));

  let entries = 0;

  delegators.forEach((delegator: any) => {
    entries += delegator.entries;
  });
  for (let i = 0; i < PICKS; i++) {
    pickWinner(entries, delegators);
  }
  console.log(`total entries: ${entries}`);
  return 0;
}

function pickWinner(entries: number, delegators: any[]) {
  let random = Math.floor(Math.random() * entries);
  let winner = delegators[0];
  let i      = 0;
  while (random > 0) {
    random -= delegators[i].entries;
    winner = delegators[i];
    i++;
  }
  console.log(`winner: ${winner.address} with ${winner.entries} entries (${((winner.entries / entries) * 100).toFixed(2)}% chance)`);
}

drawingPicker()
  .then(() => {
    process.exit(0);
  });
