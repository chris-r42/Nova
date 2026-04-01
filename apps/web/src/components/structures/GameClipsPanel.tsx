/*
 * Nova — Game Clips embedded panel
 */

import React, { type JSX } from "react";

const CLIPS_URL = "https://clipvault-one.vercel.app/?t=a74d46396813ceaebba4112307cec6af";

export default function GameClipsPanel(): JSX.Element {
    return (
        <div className="nova_GameClipsPanel">
            <iframe
                src={CLIPS_URL}
                className="nova_GameClipsPanel_iframe"
                title="Game Clips"
                allow="autoplay; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
        </div>
    );
}
