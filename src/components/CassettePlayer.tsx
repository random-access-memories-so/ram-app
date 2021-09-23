import { FC } from "react";
import '@google/model-viewer/dist/model-viewer';

const CassettePlayer: FC = () => {
    return <div>
        {/* @ts-ignore */}
        <model-viewer
            src="https://www.arweave.net/OkayUAHkIJfvXz_Nws5aQ2e0YsLxpnwtNmAF8TqfKNU?ext=glb"
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