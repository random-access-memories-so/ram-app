import { Box, Grid, Typography } from "@material-ui/core";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import NFT from "../components/NFT";
import { decodeMetadata, getMetadataAddress, Metadata } from "../tools/metadata";
import { isRAM } from "../tools/ram";

// An ui amount of exactly one and 0 decimal makes it a good candidate to be a NFT
const getPotentialNFTs = async (connection: Connection, ownerAddress: PublicKey): Promise<PublicKey[]> => {
    const parsedTokenAccounts = (await connection.getParsedTokenAccountsByOwner(
        ownerAddress,
        {programId: TOKEN_PROGRAM_ID}
    )).value;
    console.log(parsedTokenAccounts);

    return parsedTokenAccounts
        .map(({account}) => {
            const info = account.data.parsed.info;
            if(info.tokenAmount.uiAmount === 1 && info.tokenAmount.decimals === 0) {
                return new PublicKey(info.mint as string);
            }
            return;
        })
        .filter(Boolean) as PublicKey[];
}

const getMetadatas = async (connection: Connection, mints: PublicKey[]): Promise<Metadata[]> => {
    const metadataAddresses = await Promise.all(
        mints.map(mint => getMetadataAddress(mint))
    );
    const metadataAccountInfos = await connection.getMultipleAccountsInfo(metadataAddresses);
    const metadatas: Metadata[] = [];
    for (const metadataAccountInfo of metadataAccountInfos) {
        if(metadataAccountInfo) {
            metadatas.push(decodeMetadata(metadataAccountInfo.data));
        }
    }
    return metadatas;
};

// RAM creator first, Model XY first in lexicographical order then whatever is left
const sortMetadatas = (metadatas: Metadata[]): Metadata[] => {
    const blockjams: Metadata[] = [];
    const otherRAM: Metadata[] = [];
    const other: Metadata[] = [];
    for (const metadata of metadatas) {
        if (isRAM(metadata)) {
            if (metadata.data.name.startsWith('BJ')) {
                blockjams.push(metadata);
            } else {
                otherRAM.push(metadata);
            }
        } else {
            other.push(metadata);
        }
    }
    blockjams.sort((a, b) => a.data.name.localeCompare(b.data.name));
    otherRAM.sort((a, b) => a.data.name.localeCompare(b.data.name));
    return [
        ...blockjams,
        ...otherRAM,
        ...other
    ];
};

const Home: FC = () => {
    const {connection} = useConnection();
    const {connected, publicKey} = useWallet();

    const [NFTs, setNFTs] = useState<Metadata[]>();

    useEffect(() => {
        if (!connected || !publicKey) return;
        getPotentialNFTs(connection, publicKey)
            .then(potentialNFTs => getMetadatas(connection, potentialNFTs))
            .then(sortMetadatas)
            .then(setNFTs);
    }, [connection, connected, publicKey])

    return (
        <Box m={2}>
            {connected
                ? (
                    <Grid
                        container
                        //style={{flexGrow: 1}}
                        justifyContent="center"
                        alignItems="stretch"
                        direction="row"
                        spacing={3}
                    >
                        {NFTs?.map(nft => 
                            <Grid item xs={6} lg={4} xl={3}>
                                <NFT metadata={nft} />
                            </Grid>
                        )}
                    </Grid>
                )
                : (
                    <Typography>
                        Connect wallet
                    </Typography>
                )
            }
        </Box>
    );
}

export default Home;