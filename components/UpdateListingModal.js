import { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const dispatch = useNotification();
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0); // initial value
  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "Success",
      message: "Listing Updated",
      title: "Listing updated - please refresh (and move blocks)",
      position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith("0");
  };
  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
    },
  });

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => console.log(error),
          onSuccess: handleUpdateListingSuccess, // handlers automatically passes the tx variable which our updateListing event throws
          // it will be updated once extra blocks have been mined so that the transaction is confirmed
        });
      }}
    >
      <Input
        label="Update listing price in L1 currency (ETH)"
        name="New listing price"
        type="number"
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value);
        }}
      />
    </Modal>
  );
}
