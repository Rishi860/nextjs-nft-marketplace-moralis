1. Home Page
  1. Show recenlty listed NFTs
    1. If you own the NFT, you can update the listing
    2. If not, you can buy the listing.
2. Sell Page:
  1. You can list your NFT on the markeplace.

MORALIS: How do we tell it to listen to our events?

1. Connect it to our blockchain
2. Which contract, which events, and what to do when it hears

3. Notes
  - Off chain services can access the events in a contract. So if want some data from the chain we can just listen to the event being called.
  - Proffesional:
    - We will inedx the events off-chain and then read from our databases.
    - Setup a server to listen for those events to be fired, and we will add them to a database to query. 

  - FRP
    - One Way
      1. Use "frp_0.44.0_windows_amd64.zip" this file. Permission will be denied to download override it in windows security.
      2. Do copy paste in frpc.ini from the moralis admin panel.
      3. Paste moralisApiSecret, moralisSubdomain, moralisApiKey in .env file
      4. Run this command to give permission to execute: "chmod u+x frpc.exe".
      5. Run the file using this command: ./frpc.exe -c frpc.ini

    - Second Way
      1. Use moralis-admin-cli: yarn add global moralis-admin-cli
      2. This also need env modifications- Paste moralisApiSecret, moralisSubdomain, moralisApiKey in .env file
      3. Scripts modfication in package.json ""moralis:sync": "moralis-admin-cli connect-local-devchain --chain hardhat --moralisSubdomain moralisSubdomain --frpcPath ./frp/frpc.exe""
      4. Run yarn moralis:sync