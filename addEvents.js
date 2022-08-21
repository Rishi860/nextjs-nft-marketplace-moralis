/** This script is to programmiticaly create a sync between our contract and moralis to listen to the events
 *  We Need the parameters stated in Moralis UI which will come from the backend so created a deploy frontend script
 *  which will update the constans file in here.
 *  We also need extra params which can be read from docs moralis connecting with nodejs
 */

const Moralis = require("moralis/node");
require("dotenv").config();

const contractAddresses = require("./constants/networkMapping.json");

let chainId = process.env.chainId || 31337;
let moralisChainId = chainId == "31337" ? "1337" : chainId;

const contractAddress = contractAddresses[chainId]["NftMarketplace"][0];

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_APP_ID;
const masterKey = process.env.masterKey;

async function main() {
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log(`Working with contract address: ${contractAddress}`);

  // Now we are starting to listen to the events following the docs moralis node js
  let itemListedOptions = {
    // moralis understands a local chain is 1337
    chainId: moralisChainId,
    address: contractAddress,
    sync_historical: true, // this will make moralis to listen to past events which were emitted when it wasnt there
    topic: "ItemListed(address, address, uint256, uint256)", // this needs event name with the datatypes
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemListed",
      type: "event",
    },
    tableName: "ItemListed",
  };

  let itemBoughtOptions = {
    // moralis understands a local chain is 1337
    chainId: moralisChainId,
    address: contractAddress,
    sync_historical: true, // this will make moralis to listen to past events which were emitted when it wasnt there
    topic: "ItemBought(address, address, uint256, uint256)", // this needs event name with the datatypes
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "buyer",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemBought",
      type: "event",
    },
    tableName: "ItemBought",
  };

  let itemCanceledOptions = {
    // moralis understands a local chain is 1337
    chainId: moralisChainId,
    address: contractAddress,
    sync_historical: true, // this will make moralis to listen to past events which were emitted when it wasnt there
    topic: "ItemCanceled(address, address, uint256)", // this needs event name with the datatypes
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ItemCanceled",
      type: "event",
    },
    tableName: "ItemCanceled",
  };

  const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
    useMasterKey: true,
  });
  const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
    useMasterKey: true,
  });
  const canceledResponse = await Moralis.Cloud.run("watchContractEvent", itemCanceledOptions, {
    useMasterKey: true,
  });
  if(listedResponse.success && boughtResponse.success && canceledResponse.success){
    console.log("Success! Database updated with watching events")
  } else {
    console.log("Something went wrong...");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
