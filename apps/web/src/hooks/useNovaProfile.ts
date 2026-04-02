/*
 * Nova — hook for reading and writing bio + banner via Matrix extended profiles
 */

import { useEffect, useState, useCallback, useContext } from "react";
import { type MatrixClient } from "matrix-js-sdk/src/matrix";
import { logger } from "matrix-js-sdk/src/logger";

import MatrixClientContext from "../contexts/MatrixClientContext";

export const NOVA_BIO_KEY = "com.nova.bio";
export const NOVA_BANNER_KEY = "com.nova.banner";

export interface NovaProfile {
    bio: string | null;
    bannerMxc: string | null;
}

/**
 * Read another user's Nova profile (bio + banner). Read-only.
 */
export function useNovaProfileForUser(cli: MatrixClient, userId: string): NovaProfile {
    const [bio, setBio] = useState<string | null>(null);
    const [bannerMxc, setBannerMxc] = useState<string | null>(null);
    const [supported, setSupported] = useState<boolean | undefined>();

    useEffect(() => {
        if (supported !== undefined) return;
        cli.doesServerSupportExtendedProfiles()
            .then(setSupported)
            .catch(() => setSupported(false));
    }, [cli, supported]);

    useEffect(() => {
        if (supported !== true) return;
        (async () => {
            try {
                const profile = await cli.getExtendedProfile(userId);
                setBio(typeof profile[NOVA_BIO_KEY] === "string" ? profile[NOVA_BIO_KEY] : null);
                setBannerMxc(typeof profile[NOVA_BANNER_KEY] === "string" ? profile[NOVA_BANNER_KEY] : null);
            } catch (e) {
                logger.warn(`[Nova] Failed to fetch extended profile for ${userId}`, e);
            }
        })();
    }, [supported, userId, cli]);

    return { bio, bannerMxc };
}

/**
 * Read and write the current user's own Nova profile (bio + banner).
 */
export function useOwnNovaProfile(): {
    bio: string | null;
    bannerMxc: string | null;
    supported: boolean;
    saveBio: (bio: string) => Promise<void>;
    saveBanner: (mxc: string) => Promise<void>;
    removeBanner: () => Promise<void>;
} {
    const cli = useContext(MatrixClientContext);
    const [bio, setBio] = useState<string | null>(null);
    const [bannerMxc, setBannerMxc] = useState<string | null>(null);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        cli.doesServerSupportExtendedProfiles()
            .then((s) => {
                setSupported(s);
                if (!s) return;
                return cli.getExtendedProfile(cli.getSafeUserId());
            })
            .then((profile) => {
                if (!profile) return;
                setBio(typeof profile[NOVA_BIO_KEY] === "string" ? profile[NOVA_BIO_KEY] : null);
                setBannerMxc(typeof profile[NOVA_BANNER_KEY] === "string" ? profile[NOVA_BANNER_KEY] : null);
            })
            .catch((e) => logger.warn("[Nova] Failed to load own extended profile", e));
    }, [cli]);

    const saveBio = useCallback(
        async (value: string) => {
            await cli.setExtendedProfileProperty(NOVA_BIO_KEY as any, value);
            setBio(value);
        },
        [cli],
    );

    const saveBanner = useCallback(
        async (mxc: string) => {
            await cli.setExtendedProfileProperty(NOVA_BANNER_KEY as any, mxc);
            setBannerMxc(mxc);
        },
        [cli],
    );

    const removeBanner = useCallback(async () => {
        await cli.deleteExtendedProfileProperty(NOVA_BANNER_KEY as any);
        setBannerMxc(null);
    }, [cli]);

    return { bio, bannerMxc, supported, saveBio, saveBanner, removeBanner };
}
