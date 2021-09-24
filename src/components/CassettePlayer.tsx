import { FC, useEffect, useMemo, useState } from "react";
import '@google/model-viewer/dist/model-viewer';
import { IMetadataExtension, Metadata } from "../tools/metadata";

type CassettePlayerProps = {
    mixtape: Metadata
};

const CassettePlayer: FC<CassettePlayerProps> = ({mixtape}) => {
    // TODO: Abstract to share with NFT component
    const [metadataExtension, setMetadataExtension] = useState<IMetadataExtension>()
    useEffect(() => {
        async function fetchMetadataExtension() {
            const newMetadataExtension = await (await fetch(mixtape.data.uri))
                .json() as IMetadataExtension;
            setMetadataExtension(newMetadataExtension);
        }
        fetchMetadataExtension();
    }, [mixtape]);

    const modelUri = useMemo(() => {
        const file = metadataExtension?.properties.files?.find(file => (typeof file !== 'string' && file.type === 'glb'));
        return typeof file !== 'string' && file?.uri;
    }, [metadataExtension]);
    
    return <div>
        {/* @ts-ignore */}
        <model-viewer
            src={modelUri}
            auto-rotate
            rotation-per-second="30deg"
            style={{minHeight: "40vh", width: "100%", margin: "auto"}}
        />
            <div>
                <div className="video-wrapper">
                    <iframe
                        title="player"
                        src="https://audius.co/embed/playlist/DNKyZ?flavor=card"
                        allow="encrypted-media"
                        style={{border: "none"}}
                    />
                </div>
            </div>
    </div>;
};

export default CassettePlayer;