/*
 * Nova — Discord-style floating profile card
 */

import React, { useCallback, useContext, useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { type RoomMember, type User } from "matrix-js-sdk/src/matrix";

import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { mediaFromMxc } from "../../../customisations/Media";
import { useNovaProfileForUser } from "../../../hooks/useNovaProfile";
import MemberAvatar from "../avatars/MemberAvatar";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { Action } from "../../../dispatcher/actions";

interface NovaProfileCardProps {
    member: RoomMember | User;
    position: { x: number; y: number };
    onClose: () => void;
}

const CARD_WIDTH = 300;
const CARD_HEIGHT = 360;
const MARGIN = 12;

function clampPosition(x: number, y: number): { x: number; y: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
        x: Math.min(Math.max(x, MARGIN), vw - CARD_WIDTH - MARGIN),
        y: Math.min(Math.max(y, MARGIN), vh - CARD_HEIGHT - MARGIN),
    };
}

const NovaProfileCard: React.FC<NovaProfileCardProps> = ({ member, position, onClose }): JSX.Element => {
    const cli = useContext(MatrixClientContext);
    const cardRef = useRef<HTMLDivElement>(null);
    const { bio, bannerMxc } = useNovaProfileForUser(cli, member.userId);

    const displayName =
        (member as RoomMember).rawDisplayName ?? (member as User).displayName ?? member.userId;
    const bannerUrl = bannerMxc ? (mediaFromMxc(bannerMxc).srcHttp ?? null) : null;
    const pos = clampPosition(position.x + 8, position.y - 80);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent): void => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const onViewProfile = useCallback(() => {
        onClose();
        defaultDispatcher.dispatch({
            action: Action.ViewUser,
            member,
        });
    }, [member, onClose]);

    return createPortal(
        <div
            ref={cardRef}
            className="nova_ProfileCard"
            style={{ left: pos.x, top: pos.y }}
            role="dialog"
            aria-label={`${displayName}'s profile`}
        >
            {/* Banner */}
            <div className="nova_ProfileCard_banner">
                {bannerUrl ? (
                    <img src={bannerUrl} alt="" className="nova_ProfileCard_banner_img" />
                ) : (
                    <div className="nova_ProfileCard_banner_placeholder" />
                )}
            </div>

            {/* Avatar */}
            <div className="nova_ProfileCard_avatar">
                <MemberAvatar
                    member={member as RoomMember}
                    size="72px"
                    resizeMethod="scale"
                    fallbackUserId={member.userId}
                    noThumb
                />
            </div>

            {/* Body */}
            <div className="nova_ProfileCard_body">
                <div className="nova_ProfileCard_displayName">{displayName}</div>
                <div className="nova_ProfileCard_userId">{member.userId}</div>
                {bio && <div className="nova_ProfileCard_bio">{bio}</div>}

                <div className="nova_ProfileCard_actions">
                    <button className="nova_ProfileCard_msgBtn" onClick={onViewProfile}>
                        View Profile
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

interface NovaProfileCardManagerState {
    member: RoomMember | User | null;
    position: { x: number; y: number } | null;
}

/**
 * Mount this once in LoggedInView. It listens for Action.ViewUser with
 * cardPosition and shows the floating card.
 */
export const NovaProfileCardManager: React.FC = (): JSX.Element | null => {
    const [state, setState] = useState<NovaProfileCardManagerState>({ member: null, position: null });

    useEffect(() => {
        const unsub = defaultDispatcher.register((payload) => {
            if (payload.action === Action.ViewUser && payload.cardPosition && payload.member) {
                setState({ member: payload.member, position: payload.cardPosition });
            }
        });
        return () => defaultDispatcher.unregister(unsub);
    }, []);

    const onClose = useCallback(() => setState({ member: null, position: null }), []);

    if (!state.member || !state.position) return null;

    return <NovaProfileCard member={state.member} position={state.position} onClose={onClose} />;
};
