/*
 * Nova — floating theme customization panel
 */

import React, { type JSX } from "react";
import { Text } from "@vector-im/compound-web";
import { NOVA_FONTS, type NovaTheme, useNovaTheme } from "../../../hooks/useNovaTheme";

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}

function NovaSlider({ label, value, min, max, onChange }: SliderProps): JSX.Element {
    return (
        <div className="nova_ThemePanel_row">
            <label className="nova_ThemePanel_label">{label}</label>
            <input
                type="range"
                className="nova_ThemePanel_slider"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}

interface SelectProps<T extends string> {
    label: string;
    value: T;
    options: { label: string; value: T }[];
    onChange: (v: T) => void;
}

function NovaSelect<T extends string>({ label, value, options, onChange }: SelectProps<T>): JSX.Element {
    return (
        <div className="nova_ThemePanel_row">
            <label className="nova_ThemePanel_label">{label}</label>
            <select
                className="nova_ThemePanel_select"
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function NovaThemePanel(): JSX.Element {
    const { theme, setTheme, saving } = useNovaTheme();

    return (
        <div className="nova_ThemePanel">
            <div className="nova_ThemePanel_header">
                <Text as="span" size="lg" weight="semibold">
                    Nova Theme
                </Text>
                {saving && <span className="nova_ThemePanel_saving">Saving…</span>}
            </div>

            <div className="nova_ThemePanel_section">
                <Text as="p" size="sm" className="nova_ThemePanel_sectionLabel">Colors</Text>

                <div className="nova_ThemePanel_row">
                    <label className="nova_ThemePanel_label">Accent color</label>
                    <div className="nova_ThemePanel_colorRow">
                        <input
                            type="color"
                            className="nova_ThemePanel_colorPicker"
                            value={theme.accentColor}
                            onChange={(e) => setTheme({ accentColor: e.target.value })}
                        />
                        <input
                            type="text"
                            className="nova_ThemePanel_colorHex"
                            value={theme.accentColor}
                            maxLength={7}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setTheme({ accentColor: v });
                            }}
                        />
                    </div>
                </div>

                <NovaSlider
                    label="Background darkness"
                    value={theme.bgDarkness}
                    min={0}
                    max={100}
                    onChange={(v) => setTheme({ bgDarkness: v })}
                />

                <NovaSlider
                    label="Panel darkness"
                    value={theme.panelDarkness}
                    min={0}
                    max={100}
                    onChange={(v) => setTheme({ panelDarkness: v })}
                />
            </div>

            <div className="nova_ThemePanel_section">
                <Text as="p" size="sm" className="nova_ThemePanel_sectionLabel">Typography</Text>

                <NovaSelect
                    label="Font"
                    value={theme.fontFamily}
                    options={NOVA_FONTS.map((f) => ({ label: f.label, value: f.value }))}
                    onChange={(v) => setTheme({ fontFamily: v })}
                />

                <NovaSlider
                    label="Font size"
                    value={theme.fontSize}
                    min={13}
                    max={20}
                    onChange={(v) => setTheme({ fontSize: v })}
                />
            </div>

            <div className="nova_ThemePanel_section">
                <Text as="p" size="sm" className="nova_ThemePanel_sectionLabel">Layout</Text>

                <NovaSelect<NovaTheme["bubbleStyle"]>
                    label="Message style"
                    value={theme.bubbleStyle}
                    options={[
                        { label: "Flat (default)", value: "flat" },
                        { label: "Rounded", value: "rounded" },
                        { label: "Discord-style", value: "discord" },
                    ]}
                    onChange={(v) => setTheme({ bubbleStyle: v })}
                />

                <NovaSelect<NovaTheme["avatarShape"]>
                    label="Avatar shape"
                    value={theme.avatarShape}
                    options={[
                        { label: "Circle", value: "circle" },
                        { label: "Rounded square", value: "rounded" },
                    ]}
                    onChange={(v) => setTheme({ avatarShape: v })}
                />

                <NovaSelect<NovaTheme["density"]>
                    label="Density"
                    value={theme.density}
                    options={[
                        { label: "Comfortable", value: "comfortable" },
                        { label: "Compact", value: "compact" },
                    ]}
                    onChange={(v) => setTheme({ density: v })}
                />
            </div>

            <button
                className="nova_ThemePanel_reset"
                onClick={() =>
                    setTheme({
                        accentColor: "#ff8000",
                        bgDarkness: 50,
                        panelDarkness: 60,
                        bubbleStyle: "flat",
                        fontFamily: "Inter",
                        fontSize: 15,
                        avatarShape: "circle",
                        density: "comfortable",
                    })
                }
            >
                Reset to defaults
            </button>
        </div>
    );
}
