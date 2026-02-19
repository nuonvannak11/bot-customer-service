let lastTimestamp = 0n;
let sequence = 0n;
const EPOCH = 1704067200000n;
export function nextId(): string {
    let timestamp = BigInt(Date.now());
    if (timestamp === lastTimestamp) {
        sequence = (sequence + 1n) & 0xfffn;
        if (sequence === 0n) {
            while (BigInt(Date.now()) <= timestamp) { }
            timestamp = BigInt(Date.now());
        }
    } else {
        sequence = 0n;
    }
    lastTimestamp = timestamp;
    const snowflake = ((timestamp - EPOCH) << 22n) | sequence;
    return snowflake.toString();
}