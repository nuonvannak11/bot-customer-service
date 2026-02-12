export const DEFAULT_ASSET_CONFIG = {
    allowScan: false,
    upTime: 0,
    config: {
        blockedExtensions: [],
        blacklistedDomains: [],
        badWords: [],
        spam: {
            rateLimit: 0,
            duplicateSensitivity: 0,
            newUserRestriction: 0,
        },
        rulesCount: 0,
        blockAllLinksFromNoneAdmin: false,
        blockAllExstationFromNoneAdmin: false,
        blockBadWordsEnabled: false,
    },
    threatsBlocked: 0,
    safeFiles: 0,
};

export const ConfigQueuesExecutFile = {
    SCAN_BYTES: 4100,
    TIMEOUT_MS: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    QUEUE: { concurrency: 1, interval: 500, intervalCap: 2 }
};