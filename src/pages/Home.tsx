import { Box, Button, Grid, Typography } from "@material-ui/core";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWalletDialog } from "@solana/wallet-adapter-material-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useModal } from "mui-modal-provider";
import { FC, useEffect, useMemo, useState } from "react";
import CassettePicker from "../components/CassettePicker";
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

type OrganizedMetadatas = {
    blockjams: Metadata[],
    otherRAM: Metadata[],
    other: Metadata[]
};

// RAM creator first, Model XY first in lexicographical order then whatever is left
const sortAndSplitMetadatas = (metadatas: Metadata[]): OrganizedMetadatas => {
    const blockjams: Metadata[] = [];
    const otherRAM: Metadata[] = [];
    const other: Metadata[] = [];
    for (const metadata of metadatas) {
        if (isRAM(metadata)) {
            if (metadata.data.name.startsWith('Model')) {
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
    return {
        blockjams,
        otherRAM,
        other
    };
};

const Home: FC = () => {
    const { connection } = useConnection();
    const { connected, publicKey } = useWallet();
    const { setOpen } = useWalletDialog();
    const { showModal } = useModal();

    const [organizedMetadatas, setOrganizedMetadatas] = useState<OrganizedMetadatas>();

    useEffect(() => {
        setOrganizedMetadatas(undefined);
        if (!connected || !publicKey) return;
        getPotentialNFTs(connection, publicKey)
            .then(potentialNFTs => getMetadatas(connection, potentialNFTs))
            .then(sortAndSplitMetadatas)
            .then(setOrganizedMetadatas);
    }, [connection, connected, publicKey])

    const NFTs = useMemo(() => {
        if (!organizedMetadatas) return;
        return [
            ...organizedMetadatas.blockjams,
            ...organizedMetadatas.otherRAM,
            ...organizedMetadatas.other
        ];
    }, [organizedMetadatas]);

    const mixtapes = useMemo(() => {
        if (!organizedMetadatas) return [];
        return organizedMetadatas.otherRAM
            .filter((metadata) => metadata.data.name.toLowerCase().includes('mixtape'));
    }, [organizedMetadatas]);

    return (
        <Box m={2}>
            <Grid
                container
                justifyContent="center"
                alignItems="stretch"
                direction="row"
                spacing={3}
            >
                {connected
                    ? NFTs?.map(nft => 
                        <Grid item xs={6} lg={4} xl={3}>
                            <NFT
                                metadata={nft}
                                openCassettePicker={() =>
                                    showModal(CassettePicker, { mixtapes })
                                }
                            />
                        </Grid>
                    )
                    : (
                        <Grid item style={{height: "80vh"}}>
                            <Box
                                height="100%"
                                display="flex"
                                justifyContent="center"
                                flexDirection="column"
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpen(true)}
                                >
                                    Connect wallet to play
                                </Button>
                            </Box>
                        </Grid>
                    )
                }
            </Grid>
        </Box>
    );
}

export default Home;
