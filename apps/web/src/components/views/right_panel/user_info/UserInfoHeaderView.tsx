/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX } from "react";
import { type User, type RoomMember } from "matrix-js-sdk/src/matrix";

import { useUserfoHeaderViewModel } from "../../../viewmodels/right_panel/user_info/UserInfoHeaderViewModel";
import MemberAvatar from "../../avatars/MemberAvatar";
import { type Member, type IDevice } from "../UserInfo";
import PresenceLabel from "../../rooms/PresenceLabel";
import CopyableText from "../../elements/CopyableText";
import { UserInfoHeaderVerificationView } from "./UserInfoHeaderVerificationView";
import { mediaFromMxc } from "../../../../customisations/Media";

export interface UserInfoHeaderViewProps {
    member: Member;
    roomId?: string;
    devices: IDevice[];
    hideVerificationSection: boolean;
}

export const UserInfoHeaderView: React.FC<UserInfoHeaderViewProps> = ({
    member,
    devices,
    roomId,
    hideVerificationSection,
}): JSX.Element => {
    const vm = useUserfoHeaderViewModel({ member, roomId });
    const avatarUrl = (member as User).avatarUrl;
    const displayName = (member as RoomMember).rawDisplayName ?? member.userId;
    const bannerHttpUrl = vm.novaBannerMxc ? (mediaFromMxc(vm.novaBannerMxc).srcHttp ?? null) : null;

    return (
        <div className="nova_UserInfo_header">
            {/* Banner */}
            <div className="nova_UserInfo_bannerArea">
                {bannerHttpUrl ? (
                    <img src={bannerHttpUrl} alt="" className="nova_UserInfo_bannerImg" />
                ) : (
                    <div className="nova_UserInfo_bannerPlaceholder" />
                )}
            </div>

            {/* Avatar row */}
            <div className="nova_UserInfo_avatarRow">
                <div className="nova_UserInfo_avatarWrap" onClick={vm.onMemberAvatarClick}>
                    <MemberAvatar
                        key={member.userId}
                        member={member as RoomMember}
                        size="80px"
                        resizeMethod="scale"
                        fallbackUserId={member.userId}
                        urls={avatarUrl ? [avatarUrl] : undefined}
                        noThumb
                    />
                </div>
            </div>

            {/* Name + identity */}
            <div className="nova_UserInfo_identity">
                <div className="nova_UserInfo_displayName">{displayName}</div>
                <div className="nova_UserInfo_mxid">
                    <CopyableText getTextToCopy={() => vm.userIdentifier ?? member.userId} border={false}>
                        {vm.userIdentifier ?? member.userId}
                    </CopyableText>
                </div>
                {vm.showPresence && (
                    <PresenceLabel
                        activeAgo={vm.precenseInfo.lastActiveAgo}
                        currentlyActive={vm.precenseInfo.currentlyActive}
                        presenceState={vm.precenseInfo.state}
                        className="nova_UserInfo_presence"
                        coloured
                    />
                )}
                {vm.timezoneInfo && (
                    <div className="nova_UserInfo_timezone" title={vm.timezoneInfo.timezone}>
                        🕐 {vm.timezoneInfo.friendly}
                    </div>
                )}
            </div>

            {/* Bio section */}
            {vm.novaBio && (
                <div className="nova_UserInfo_section">
                    <div className="nova_UserInfo_sectionLabel">About Me</div>
                    <div className="nova_UserInfo_bio">{vm.novaBio}</div>
                </div>
            )}

            {/* Verification */}
            {!hideVerificationSection && (
                <div className="nova_UserInfo_section">
                    <UserInfoHeaderVerificationView member={member} devices={devices} />
                </div>
            )}
        </div>
    );
};
