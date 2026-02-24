import { describe, it, expect } from "bun:test";
import { useTranslations } from "./utils";
import { translations } from "./ui";

describe("useTranslations", () => {
    it("should return a function", () => {
        const t = useTranslations();
        expect(typeof t).toBe("function");
    });

    it("should return the correct translation for known keys", () => {
        const t = useTranslations();

        // Test a few specific keys from ui.ts
        expect(t("nav.home")).toBe(translations["nav.home"]);
        expect(t("site.title")).toBe(translations["site.title"]);
        expect(t("hero.badge")).toBe(translations["hero.badge"]);
    });

    it("should return the correct translation for all defined keys", () => {
        const t = useTranslations();

        for (const key in translations) {
            const translationKey = key as keyof typeof translations;
            expect(t(translationKey)).toBe(translations[translationKey]);
        }
    });

    it("should return undefined for non-existent keys", () => {
        const t = useTranslations();

        // @ts-ignore - testing runtime behavior for invalid keys
        expect(t("non.existent.key")).toBeUndefined();
    });
});
