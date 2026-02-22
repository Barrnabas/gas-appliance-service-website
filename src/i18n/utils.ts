import { translations } from './ui';

export function useTranslations() {
    return function t(key: keyof typeof translations) {
        return translations[key];
    }
}