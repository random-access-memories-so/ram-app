import { Box, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import { Close, PlayArrow } from "@material-ui/icons";
import { useModal } from "mui-modal-provider";
import { FC, useState } from "react";
import { Metadata } from "../tools/metadata";
import CassettePlayer from "./CassettePlayer";

type CassettePlayerDialogProps = DialogProps & {
    mixtape: Metadata
};

const CassettePlayerDialog: FC<CassettePlayerDialogProps> = ({mixtape, ...props}) => {
    const [open, setOpen] = useState(true);

    return <Dialog fullScreen={true} {...props} open={open}>
        <DialogActions>
            <IconButton onClick={() => setOpen(false)}>
                <Close />
            </IconButton>
        </DialogActions>
        <CassettePlayer mixtape={mixtape} />
    </Dialog>;
};

type CassettePickerProps = DialogProps & {
    mixtapes: Metadata[]
};

const CassettePicker: FC<CassettePickerProps> = ({mixtapes, ...props}) => {
    const [open, setOpen] = useState(true);
    const { showModal } = useModal();
    
    return <Dialog {...props} open={open} onClose={() => setOpen(false)} fullWidth={true}>
        <DialogActions>
            <IconButton onClick={() => setOpen(false)}>
                <Close />
            </IconButton>
        </DialogActions>
        <DialogTitle>
            Pick a mixtape
        </DialogTitle>
        <Box m={1}>
            <DialogContent>
                {mixtapes.length > 0
                    ? <List>
                        {mixtapes.map((mixtape) =>
                            <ListItem
                                button
                                onClick={() => {
                                    showModal(CassettePlayerDialog, { mixtape });
                                }}
                            >
                                <ListItemIcon>
                                    <PlayArrow />
                                </ListItemIcon>
                                <ListItemText primary={mixtape.data.name} />
                            </ListItem>
                        )}
                    </List>
                    : <Typography>
                        You don't have any mixtape :(
                    </Typography>
                }
            </DialogContent>
        </Box>
    </Dialog>
};

export default CassettePicker;