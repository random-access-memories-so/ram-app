import { PublicKey } from "@solana/web3.js";
import { Metadata } from "./metadata";

const RAM_CREATOR = new PublicKey(process.env.REACT_APP_RAM_CREATOR as string);

export const isRAM = (metadata: Metadata): boolean => {
    return (metadata.data.creators
        && metadata.data.creators.length > 0
        && metadata.data.creators[0].address === RAM_CREATOR.toBase58())
        ?? false;
};