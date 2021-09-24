import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Dialog, DialogActions, DialogContent, DialogProps, IconButton, Tooltip, Typography } from "@material-ui/core";
import { Skeleton } from '@material-ui/lab';
import { FC, useEffect, useMemo, useState } from "react";
import { IMetadataExtension, Metadata } from "../tools/metadata";
import '@google/model-viewer/dist/model-viewer';
import QRCode from "qrcode.react";
import { Close, PlayArrow, MobileScreenShare, Send } from "@material-ui/icons";
import { useModal } from "mui-modal-provider";
import { isRAM } from "../tools/ram";

export interface NFTProps {
    metadata: Metadata;
    openCassettePicker: () => void;
};

const ModelViewer: FC<{src: string}> = (props: {src: string}) => {
    //@ts-ignore
    return <model-viewer
        src={props.src}
        auto-rotate
        rotation-per-second="30deg"
        camera-controls
        style={{height: "25vh", width: "100%"}}
    />
};

type QrCodeDaliogProps = DialogProps & {
    modelUri: string
};

const QrCodeDialog: FC<QrCodeDaliogProps> = ({modelUri, ...props}) => {
    const [open, setOpen] = useState(true);

    return <Dialog open={open} onClose={() => setOpen(false)}>
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
    </Dialog>;
};

const NFT: FC<NFTProps> = (props: NFTProps) => {
    const { metadata, openCassettePicker } = props;
    const [metadataExtension, setMetadataExtension] = useState<IMetadataExtension>()
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
                        style={{width: "auto", height: "25vh", margin: "auto"}}
                        src={metadataExtension?.image}
                    />
                    : <Skeleton variant="rect" style={{height: "30vh"}} />
                }
                <div>
                    <Typography variant="h5">
                        {metadata.data.name}
                    </Typography>
                    <Typography>
                        {metadataExtension?.description}
                    </Typography>
                    <Box m={1}>
                        {metadataExtension?.attributes?.map((attribute) =>
                            <Box m={1} display="inline-block">
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
                    </Box>
                </div>
            </CardContent>
            <CardActions>
                {modelUri &&
                    <>
                        <Tooltip title="View on mobile">
                            <IconButton
                                onClick={() => showModal(QrCodeDialog, {modelUri})}
                            >
                                <MobileScreenShare />
                            </IconButton>
                        </Tooltip>
                        {/* <Tooltip title="Send NFT">
                            <IconButton>
                                <Send />
                            </IconButton>
                        </Tooltip> */}
                        {(isRAM(metadata) && metadata.data.name.startsWith("Model"))
                            && <Button
                                variant="outlined"
                                endIcon={<PlayArrow />}
                                onClick={openCassettePicker}
                            >
                                Play mixtape
                            </Button>
                        }
                    </>
                }
            </CardActions>
        </Card>
    );
};

export default NFT;