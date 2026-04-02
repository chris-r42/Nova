/*
 * Nova — Game Clips embedded panel
 */

import React, { type JSX, useMemo } from "react";
import { MatrixClientPeg } from "../../MatrixClientPeg";

const BYPASS_TOKEN = "a74d46396813ceaebba4112307cec6af";
const BASE_URL = "https://clipvault-one.vercel.app/";

export default function GameClipsPanel(): JSX.Element {
    const src = useMemo(() => {
        const userId = MatrixClientPeg.safeGet()?.getUserId() ?? "";
        // Extract localpart from @username:server
        const username = userId.startsWith("@") ? userId.slice(1).split(":")[0] : userId;
        return `${BASE_URL}?t=${BYPASS_TOKEN}&u=${encodeURIComponent(username)}`;
    }, []);

    return (
        <div className="nova_GameClipsPanel">
            <iframe
                src={src}
                className="nova_GameClipsPanel_iframe"
                title="Game Clips"
                allow="autoplay; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
        </div>
    );
}
