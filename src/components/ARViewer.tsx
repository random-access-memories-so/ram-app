import { FC, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

const ARViewer: FC = () => {
    const { base64modelUri } = useParams<{base64modelUri: string}>();
    const modelViewerRef = useRef(null);

    useEffect(() => {
        function update() {
        if (modelViewerRef.current) {
            (modelViewerRef.current as any).scale = '0.01 0.01 0.01';
            (modelViewerRef.current as any).updateFraming();
        }
        }
        setInterval(update, 5000);
    });

    const modelUri = useMemo(() => atob(base64modelUri), [base64modelUri]);

    //@ts-ignore
    return <model-viewer
        ref={modelViewerRef}
        src={modelUri}
        auto-rotate
        camera-controls
        rotation-per-second="30deg"
        ar ar-modes="webxr quick-look"
        style={{minHeight: 400}}
        xr-environment
    />
}

export default ARViewer;