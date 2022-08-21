// create a new table called "Active Item"
// Add items when they are listed on the marketplace
// Remove them when they are bought or canceled

Moralis.Cloud.afterSave("ItemListed", async (request) => {
  // Every event gets triggered twice, once on unconfirmed, again on confirmed
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger(); // printing logs in moralis cloud
  logger.info("Lookin g for confirmed Tx"); // this should be printed twice once on unconfirmed and other time on confirmed
  // confirmation occurs after another block has been mined!
  // In hardhat we can mine blocks manually utils/move-block backend
  if (confirmed) {
    logger.info("Found Item!");
    const ActiveItem = Moralis.Object.extend("ActiveItem"); // creates or gets the active item table

    const query = new Moralis.Query(ActiveItem);
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("seller", request.object.get("seller"));
    const alreadyListedItem = await query.first();
    if (alreadyListedItem) {
      logger.info(`Deleting already listed ${request.object.get("objectId")}`);
      await alreadyListedItem.destroy();
      logger.info(
        `Deleting ${request.object.get("tokenId")} at address ${request.object.get(
          "address"
        )} since it was canceled`
      );
    }

    const activeItem = new ActiveItem();
    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("price", request.object.get("price"));
    activeItem.set("tokenId", request.object.get("tokenId"));
    activeItem.set("seller", request.object.get("seller"));
    logger.info("Saving ...");
    await activeItem.save();
  }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Marketplace | Object: ${request.object}`);
  if (confirmed) {
    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    logger.info(`Marketplace | Object: ${query}`);
    const canceledItem = await query.first();
    logger.info(`Marketplace | CanceledItem: ${canceledItem}`);

    if (canceledItem) {
      logger.info(
        `Deleting ${request.object.get("tokenId")} at address ${request.object.get(
          "address"
        )} since it was canceled`
      );
      await canceledItem.destroy();
    } else {
      logger.info(
        `No item found with address ${request.object.get(
          "address"
        )} and tokenId: ${request.object.get("tokenId")}`
      );
    }
  }
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Marketplace | Object: ${request.object}`);
  if (confirmed) {
    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    logger.info(`Marketplace | Object: ${query}`);
    const boughtItem = await query.first();
    logger.info(`Marketplace | CanceledItem: ${boughtItem}`);

    if (boughtItem) {
      logger.info(`Deleting item... ${request.object.get("objectId")}`);
      await boughtItem.destroy();
      logger.info(
        `Deleting ${request.object.get("tokenId")} at address ${request.object.get(
          "address"
        )} since it was canceled`
      );
    } else {
      logger.info(
        `No item found with address ${request.object.get(
          "address"
        )} and tokenId: ${request.object.get("tokenId")}`
      );
    }
  }
});
