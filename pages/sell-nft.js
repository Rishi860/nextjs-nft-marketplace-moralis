import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Form, useNotification } from "web3uikit";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../constants/networkMapping.json";

export default function Home() {
  const dispatch = useNotification();
  const { chainId } = useMoralis(); // this gives us that in our hex form
  const chainString = chainId ? parseInt(chainId).toString() : "31337";

  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];

  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data) {
    // form auto passes that data object
    console.log("Approving...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
      onError: (error) => console.log(error),
    });
  }

  async function handleApproveSuccess(nftAddress, tokenId, price) {
    console.log("Ok! now time to list!");
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: handleListSuccess,
      onError: (error) => console.log(error),
    });
  }

  async function handleListSuccess(tx) {
    await tx.wait(1);
    dispatch({
      type: "Success",
      title: "NFT Listed!",
      message: "NFT Listed!",
      position: "topR",
    });
  }

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "50%",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price",
          },
        ]}
        title="Sell your NFT!"
        id="Main form"
      />
    </div>
  );
}
