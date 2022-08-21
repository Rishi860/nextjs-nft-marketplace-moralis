import { useEffect, useState, useSyncExternalStore } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncatStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const seprator = "...";
  const sepratorLength = seprator.length;
  const charToShow = strLen - sepratorLength;
  const frontChars = Math.ceil(charToShow / 2);
  const backChars = Math.floor(charToShow / 2);
  return (
    fullStr.substring(0, frontChars) + seprator + fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    const tokenURI = await getTokenURI();
    console.log(`The token URI is ${tokenURI}`);
    // we are going to cheat a little in here
    if (tokenURI) {
      // IPFS Gateway: A sever that will return IPFS files from a "normal" URL.
      const requestUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await (await fetch(requestUrl)).json();
      const imageURI = tokenURIResponse.image;
      // const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImageURI(imageURI);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
    // get the token URI
    // using the image tag from the tokenURI, get the image
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser ? "you" : truncatStr(seller || "", 15);

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => console.log(error),
          onSuccess: handleBuyItemSuccess,
        });
  };

  const handleBuyItemSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "Success",
      title: "Item Bought",
      message: "Item Bought",
      position: "topR",
    });
  };

  return (
    <div>
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
            />
            <Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">Owned by {formattedSellerAddress}</div>
                  <Image loader={() => imageURI} src={imageURI} height="200" width="200" />
                  <div className="font-bold">{ethers.utils.formatUnits(price, "ether")} ETH</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
