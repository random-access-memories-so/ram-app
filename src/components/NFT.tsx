import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Dialog, DialogActions, DialogContent, DialogProps, IconButton, Tooltip, Typography } from "@material-ui/core";
import { Skeleton } from '@material-ui/lab';
import { FC, useEffect, useMemo, useState } from "react";
import { IMetadataExtension, Metadata } from "../tools/metadata";
import '@google/model-viewer/dist/model-viewer';
import QRCode from "qrcode.react";
import { Close, PlayArrow, MobileScreenShare, Send } from "@material-ui/icons";
import CassettePlayer from "./CassettePlayer";
import { useModal } from "mui-modal-provider";

export interface NFTProps {
    metadata: Metadata;
}

const ModelViewer: FC<{src: string}> = (props: {src: string}) => {
    //@ts-ignore
    return <model-viewer
        src={props.src}
        auto-rotate
        rotation-per-second="30deg"
        style={{height: "30vh", width: "100%"}}
    />
};

type CassettePlayerDialogProps = DialogProps;

const CassettePlayerDialog: FC<CassettePlayerDialogProps> = ({...props}) => {
    const [open, setOpen] = useState(true);

    return <Dialog fullScreen={true} {...props} open={open}>
        <DialogActions>
            <IconButton onClick={() => setOpen(false)}>
                <Close />
            </IconButton>
        </DialogActions>
        <CassettePlayer />
    </Dialog>;
};

const NFT: FC<NFTProps> = (props: NFTProps) => {
    const {metadata} = props;
    const [metadataExtension, setMetadataExtension] = useState<IMetadataExtension>()
    const [open, setOpen] = useState(false);

    const { showModal } = useModal();

    useEffect(() => {
        async function fetchMetadataExtension() {
            const newMetadataExtension = await (await fetch(metadata.data.uri))
                .json() as IMetadataExtension;
            setMetadataExtension(newMetadataExtension);
        }
        fetchMetadataExtension();
    }, [metadata]);

    const modelUri = useMemo(() => {
        const file = metadataExtension?.properties.files?.find(file => (typeof file !== 'string' && file.type === 'glb'));
        return typeof file !== 'string' && file?.uri;
    }, [metadataExtension]);

    return (
        <Card
            variant="outlined"
            style={{height: "100%", display: "flex", justifyContent: "flex-between", flexDirection: "column"}}
        >
            <CardContent style={{flexGrow: 1}}>
                {modelUri
                    ? <ModelViewer src={modelUri} />
                    : metadataExtension
                    ? <CardMedia
                        component="img"
                        style={{width: "auto", height: "30vh", margin: "auto"}}
                        src={metadataExtension?.image}
                    />
                    : <Skeleton height="100%" />
                }
                <div>
                    <Typography variant="h5">
                        {metadata.data.name}
                    </Typography>
                    <Typography>
                        {metadataExtension?.description}
                    </Typography>
                    <>
                        {metadataExtension?.attributes?.map((attribute) =>
                            <Box m={1} display="inline">
                                <Chip
                                    component="div"
                                    style={{height: "100%"}}
                                    label={(
                                        <Box m={1}>
                                            <Typography>
                                                {attribute.trait_type}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {attribute.value}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>
                        )}
                    </>
                </div>
                {/* {JSON.stringify(metadata.data.creators)} */}
            </CardContent>
            <CardActions>
                {modelUri &&
                    <>
                        <Tooltip title="View on mobile">
                            <IconButton
                                onClick={() => setOpen(true)}
                            >
                                <MobileScreenShare />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Send NFT">
                            <IconButton>
                                <Send />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            endIcon={<PlayArrow />}
                            onClick={() => showModal(CassettePlayerDialog)}
                        >
                            Play mixtape
                        </Button>
                        <Dialog open={open} onClose={() => setOpen(false)}>
                            <DialogActions>
                                <IconButton onClick={() => setOpen(false)}>
                                    <Close />
                                </IconButton>
                            </DialogActions>
                            <Box m={4}>
                                <QRCode
                                    value={`${window.location.href}ar/${btoa(modelUri)}`}
                                    size={512}
                                    renderAs="canvas"
                                />
                            </Box>
                            <DialogContent>
                                <Typography>
                                    Scan with mobile to view your NFT in AR
                                </Typography>
                            </DialogContent>
                        </Dialog>
                    </>
                }
            </CardActions>
        </Card>
    );
};

export default NFT;