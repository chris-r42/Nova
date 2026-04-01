/*
 * Nova — per-user theme engine
 * Saves/loads theme settings from Matrix account data and injects CSS into the page.
 */

import { useCallback, useEffect, useState } from "react";
import { MatrixClientPeg } from "../MatrixClientPeg";

export const NOVA_THEME_EVENT = "com.nova.user.theme";
export const NOVA_STYLE_ID = "nova-user-theme";

export interface NovaTheme {
    accentColor: string;
    bgDarkness: number;       // 0–100, 0 = #1a1a1e, 100 = #000000
    panelDarkness: number;    // 0–100
    bubbleStyle: "flat" | "rounded" | "discord";
    fontFamily: string;
    fontSize: number;         // 14–20
    avatarShape: "circle" | "rounded";
    density: "comfortable" | "compact";
}

export const NOVA_THEME_DEFAULTS: NovaTheme = {
    accentColor: "#ff8000",
    bgDarkness: 50,
    panelDarkness: 60,
    bubbleStyle: "flat",
    fontFamily: "Inter",
    fontSize: 15,
    avatarShape: "circle",
    density: "comfortable",
};

export const NOVA_FONTS: { label: string; value: string; url?: string }[] = [
    { label: "Inter (Default)", value: "Inter" },
    { label: "Roboto", value: "Roboto", url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap" },
    { label: "DM Sans", value: "DM Sans", url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" },
    { label: "Nunito", value: "Nunito", url: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600&display=swap" },
    { label: "Space Grotesk", value: "Space Grotesk", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap" },
    { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans", url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" },
    { label: "JetBrains Mono", value: "JetBrains Mono", url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" },
];

function lerp(a: number, b: number, t: number): number {
    return Math.round(a + (b - a) * (t / 100));
}

function hexFromRgb(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function buildOrangeScale(hex: string): Record<string, string> {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Build a 14-stop scale from near-black to the accent color and beyond
    const scale: [number, number][] = [
        [5, 0], [8, 3], [11, 7], [15, 12], [20, 18],
        [27, 26], [34, 33], [40, 42], [50, 55], [62, 70],
        [70, 80], [80, 90], [90, 95], [95, 98],
    ];

    const result: Record<string, string> = {};
    scale.forEach(([rt, gt], i) => {
        const rr = lerp(0, r, rt);
        const gg = lerp(0, g, gt);
        const bb = lerp(0, b, Math.max(0, gt - 20));
        result[`--cpd-color-green-${(i + 1) * 100}`] = hexFromRgb(rr, gg, bb);
    });
    return result;
}

function bgFromDarkness(darkness: number): string {
    // 0 = #1a1a1e (dark gray), 100 = #000000 (pure black)
    const v = lerp(26, 0, darkness);
    return hexFromRgb(v, v, Math.round(v * 1.05));
}

function panelFromDarkness(darkness: number): string {
    const v = lerp(22, 8, darkness);
    return hexFromRgb(v, v, Math.round(v * 1.08));
}

function loadGoogleFont(font: NovaTheme["fontFamily"]): void {
    const entry = NOVA_FONTS.find((f) => f.value === font);
    if (!entry?.url) return;
    const id = `nova-font-${font.replace(/\s/g, "-")}`;
    if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = entry.url;
        document.head.appendChild(link);
    }
}

export function buildThemeCSS(theme: NovaTheme): string {
    const scale = buildOrangeScale(theme.accentColor);
    const bg = bgFromDarkness(theme.bgDarkness);
    const panel = panelFromDarkness(theme.panelDarkness);
    const font = `"${theme.fontFamily}", "Inter", ui-sans-serif, system-ui, sans-serif`;
    const fontSize = `${theme.fontSize}px`;

    const scaleVars = Object.entries(scale)
        .map(([k, v]) => `${k}: ${v};`)
        .join("\n        ");

    const bubbleRadius =
        theme.bubbleStyle === "discord" ? "8px" :
        theme.bubbleStyle === "rounded" ? "16px" : "4px";

    const avatarRadius = theme.avatarShape === "rounded" ? "25%" : "50%";

    const rowHeight = theme.density === "compact" ? "32px" : "44px";

    return `
:root, .cpd-theme-dark.cpd-theme-dark {
    ${scaleVars}
    --cpd-color-bg-canvas-default: ${bg};
    --nova-panel-bg: ${panel};
    --nova-font-family: ${font};
    --nova-font-size: ${fontSize};
    --nova-bubble-radius: ${bubbleRadius};
    --nova-avatar-radius: ${avatarRadius};
    --nova-row-height: ${rowHeight};
}

body {
    font-family: var(--nova-font-family) !important;
    font-size: var(--nova-font-size) !important;
}

.mx_SpacePanel,
.mx_LeftPanel,
.mx_RoomView_body {
    background-color: var(--nova-panel-bg) !important;
}

.mx_EventTile_content .mx_EventTile_body {
    border-radius: var(--nova-bubble-radius);
}

.mx_BaseAvatar img,
.mx_BaseAvatar .mx_BaseAvatar_image {
    border-radius: var(--nova-avatar-radius) !important;
}

.mx_RoomTile {
    min-height: var(--nova-row-height);
}
    `.trim();
}

export function injectThemeCSS(theme: NovaTheme): void {
    loadGoogleFont(theme.fontFamily);
    let style = document.getElementById(NOVA_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement("style");
        style.id = NOVA_STYLE_ID;
        document.head.appendChild(style);
    }
    style.textContent = buildThemeCSS(theme);
}

export function useNovaTheme(): {
    theme: NovaTheme;
    setTheme: (partial: Partial<NovaTheme>) => void;
    saving: boolean;
} {
    const [theme, setThemeState] = useState<NovaTheme>(NOVA_THEME_DEFAULTS);
    const [saving, setSaving] = useState(false);

    // Load from account data on mount
    useEffect(() => {
        const cli = MatrixClientPeg.get();
        if (!cli) return;
        const event = cli.getAccountData(NOVA_THEME_EVENT as any);
        if (event) {
            const saved = event.getContent<Partial<NovaTheme>>();
            const merged = { ...NOVA_THEME_DEFAULTS, ...saved };
            setThemeState(merged);
            injectThemeCSS(merged);
        } else {
            injectThemeCSS(NOVA_THEME_DEFAULTS);
        }
    }, []);

    const setTheme = useCallback((partial: Partial<NovaTheme>) => {
        setThemeState((prev) => {
            const next = { ...prev, ...partial };
            injectThemeCSS(next);

            // Save to account data (debounced via setTimeout)
            setSaving(true);
            const cli = MatrixClientPeg.get();
            if (cli) {
                cli.setAccountData(NOVA_THEME_EVENT as any, next)
                    .catch(console.error)
                    .finally(() => setSaving(false));
            }

            return next;
        });
    }, []);

    return { theme, setTheme, saving };
}
