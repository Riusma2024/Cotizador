/**
 * Generates a unique ID securely if possible, otherwise using a fallback.
 * This is necessary because crypto.randomUUID() is only available in secure contexts (HTTPS/localhost).
 */
export const generateId = (): string => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    // Fallback for non-secure contexts (http://[IP]:port)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
