/*
 * Nova — sidebar theme button
 */

import React, { type JSX } from "react";
import classNames from "classnames";
import { Tooltip } from "@vector-im/compound-web";
import { ThemeIcon } from "@vector-im/compound-design-tokens/assets/web/icons";

import ContextMenu, { alwaysAboveRightOf, ChevronFace, useContextMenu } from "../../structures/ContextMenu";
import { NovaThemePanel } from "./NovaThemePanel";

interface Props {
    isPanelCollapsed: boolean;
}

const NovaThemeButton: React.FC<Props> = ({ isPanelCollapsed }) => {
    const [menuDisplayed, handle, openMenu, closeMenu] = useContextMenu<HTMLButtonElement>();

    let contextMenu: JSX.Element | undefined;
    if (menuDisplayed && handle.current) {
        contextMenu = (
            <ContextMenu
                {...alwaysAboveRightOf(handle.current.getBoundingClientRect(), ChevronFace.None, 16)}
                wrapperClassName="nova_ThemeButton_menuWrapper"
                onFinished={closeMenu}
                managed={false}
                focusLock={true}
            >
                <NovaThemePanel />
            </ContextMenu>
        );
    }

    let button = (
        <button
            aria-label="Nova Theme"
            className={classNames("nova_ThemeButton", { expanded: !isPanelCollapsed })}
            onClick={openMenu}
            ref={handle}
        >
            <ThemeIcon width="20" height="20" />
            {!isPanelCollapsed && <span className="nova_ThemeButton_label">Theme</span>}
        </button>
    );

    if (isPanelCollapsed) {
        button = (
            <Tooltip label="Nova Theme" placement="right">
                {button}
            </Tooltip>
        );
    }

    return (
        <>
            {button}
            {contextMenu}
        </>
    );
};

export default NovaThemeButton;
