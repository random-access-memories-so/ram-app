import { FC } from "react";
import { useParams } from "react-router-dom";

const ARViewer: FC = () => {
    const { base64modelUri } = useParams<{base64modelUri: string}>();
    //@ts-ignore
    return <model-viewer
        src={atob(base64modelUri)}
        auto-rotate
        rotation-per-second="30deg"
        ar ar-modes="scene-viewer webxr"
        style={{minHeight: 400}}
    />
}

export default ARViewer;