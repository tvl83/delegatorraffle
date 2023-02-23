import axios from "axios";
require('dotenv').config();
const fs = require("fs");

// this is the Validator address we are checking for delegators
const JUNO_VALIDATOR = "junovaloper1ssptq8zljxmvm9h7g5yaxyv9khpf84793dkt3j";

// we can configure multiple API URLs so we dont hammer the same one over and over
const API_URLS = [
  'https://api.juno.kingnodes.com',
]

// this is the file where the delegators are saved
const DELEGATORS_FILE = "./data/delegators.json";

// add to this blacklist to remove addresses from the list
const blacklist:any[] = [
  "juno14gsr8wml7v28vmthx9e3qqtp0zq0eugx7fudcr",
];

// This is the divisor applied to the amount of delegated tokens to determine the number of tickets
const ENTRY_WEIGHT = 10;

async function dataGatherer() {
  // chose random API_URLS index
  let randomIndex = Math.floor(Math.random() * API_URLS.length);
  console.log(`using API_URLS[${randomIndex}]: ${API_URLS[randomIndex]}`);

  let url = `${API_URLS[randomIndex]}/cosmos/staking/v1beta1/validators/${JUNO_VALIDATOR}/delegations?pagination.limit=1000`;

  console.log(`url: ${url}`);

  let response          = await axios.get(url);
  let delegations       = response.data.delegation_responses;
  let delegators: any[] = [];

  delegations.forEach((delegation: any) => {
    delegators.push({
      address: delegation.delegation.delegator_address,
      amount : delegation.balance.amount / 1000000
    })
  })

  // remove blacklisted addresses from the list
  delegators = delegators.filter((delegator) => !blacklist.includes(delegator.address));

  let i = 0;
  for (const delegator of delegators) {
    delegator["entries"] = countEntries(delegator);
    // console.log(`${i}/${delegators.length}`);
    i++;
  }

  delegators = delegators.filter((delegator: any) => {
    return delegator.entries > 0;
  })

  fs.writeFileSync(DELEGATORS_FILE, JSON.stringify(delegators));
  return 0;
}

dataGatherer()
  .then((result) => {
    process.exit();
  });

function countEntries(delegator: any) {
  let entries = 0;
  // add to entries for every ENTRY_WEIGHT juno delegated
  entries += Math.floor(delegator.amount / ENTRY_WEIGHT);
  return entries;
}


