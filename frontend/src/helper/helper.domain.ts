export function getDomainInfo(input: string): {
    original: string;
    normalized: string | null;
    isValid: boolean;
    isIDN: boolean;
    punycode: string | null;
    tld: string | null;
    sld: string | null;
    subdomain: string | null;
    rootDomain: string | null;
    parts: string[];
} {
    const normalized = extractDomain(input);
    const isValid = normalized ? isValidDomain(normalized) : false;

    if (!normalized || !isValid) {
        return {
            original: input,
            normalized,
            isValid: false,
            isIDN: false,
            punycode: null,
            tld: null,
            sld: null,
            subdomain: null,
            rootDomain: null,
            parts: [],
        };
    }

    const parts = normalized.split('.');
    const isIDN = /[^\x00-\x7F]/.test(normalized);
    const punycode = isIDN ? toASCII(normalized) : null;

    const tld = parts.length > 0 ? parts[parts.length - 1] : null;
    const sld = parts.length > 1 ? parts[parts.length - 2] : null;
    const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : null;
    const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : normalized;

    return {
        original: input,
        normalized,
        isValid,
        isIDN,
        punycode,
        tld,
        sld,
        subdomain,
        rootDomain,
        parts,
    };
}

export function matchesDomainPattern(domain: string, pattern: string): boolean {
    const normalizedDomain = normalizeDomain(domain);
    const normalizedPattern = extractDomain(pattern);

    if (!normalizedDomain || !normalizedPattern) return false;

    const regexPattern = normalizedPattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '[a-zA-Z0-9-]+');

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(normalizedDomain);
}


export function isValidDomain(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    const domain = extractDomain(input);
    if (!domain) return false;
    if (!domain.includes('.')) return false;

    const ascii = toASCII(domain);
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    const idnRegex = /^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,63}$/u;

    return domainRegex.test(ascii) || idnRegex.test(domain);
}

export function extractDomain(input: string): string | null {
    if (!input || typeof input !== 'string') return null;

    let cleaned = input.trim();

    try {
        const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(cleaned);
        const urlStr = hasProtocol ? cleaned : `http://${cleaned}`;
        const url = new URL(urlStr);
        
        cleaned = url.hostname;
    } catch {
        cleaned = cleaned.replace(/^[\w]+:\/\//, '');
        cleaned = cleaned.split('/')[0];
        cleaned = cleaned.split('?')[0];
        cleaned = cleaned.split('#')[0];
        
        if (cleaned.includes(':')) {
             cleaned = cleaned.split(':')[0];
        }
    }
    cleaned = cleaned.replace(/^www\./i, '');
    cleaned = cleaned.replace(/\.+$/, '');
    cleaned = cleaned.replace(/^\.+/, '');
    cleaned = cleaned.toLowerCase();

    return cleaned || null;
}

function toASCII(domain: string): string {
    try {
        return new URL(`http://${domain}`).hostname;
    } catch {
        return domain;
    }
}

export function normalizeDomain(input: string): string | null {
    const domain = extractDomain(input);
    if (!domain) return null;
    return isValidDomain(domain) ? domain : null;
}

export function validateDomains(inputs?: string[]): {
    valid: string[];
    invalid: string[];
    duplicates: string[];
    idn: string[];
} {
    const valid: string[] = [];
    const invalid: string[] = [];
    const idn: string[] = [];
    const duplicates: string[] = [];
    const seen = new Set<string>();

    if (!inputs || !Array.isArray(inputs)) return { valid, invalid, duplicates, idn };

    for (const input of inputs) {
        const domain = extractDomain(input);

        if (!domain) {
            invalid.push(input);
            continue;
        }

        if (!isValidDomain(domain)) {
            invalid.push(domain);
            continue;
        }

        const normalizedForCheck = toASCII(domain);
        if (seen.has(normalizedForCheck)) {
            duplicates.push(domain);
            continue;
        }

        seen.add(normalizedForCheck);
        valid.push(domain);

        if (/[^\x00-\x7F]/.test(domain)) {
            idn.push(domain);
        }
    }
    return { valid, invalid, duplicates, idn };
}



