import { expect, test } from "vitest";

import { wplClassify } from "@/classify";
import {
    Classification,
    WPL_CLASSIFICATIONS
} from "@/classify/types/Classification";

test("wplClassify returns expected default classes", () => {
    expect(wplClassify(0.005)).toBe("best");
    expect(wplClassify(0.02)).toBe("excellent");
    expect(wplClassify(0.12)).toBe("mistake");
});

test("wplClassify never returns excluded fallback class", () => {
    expect(
        wplClassify(0.75, { exclude: new Set<Classification>(["blunder"]) })
    ).toBe("mistake");
});

test("wplClassify throws when all WPL classes are excluded", () => {
    expect(() => wplClassify(0.1, {
        exclude: new Set<Classification>(WPL_CLASSIFICATIONS)
    })).toThrow("cannot exclude all WPL classifications");
});

test("wplClassify keeps fixed class priority with custom thresholds", () => {
    expect(wplClassify(0.12, {
        wplThresholds: {
            okay: 0.3,
            inaccuracy: 0.1,
            mistake: 0.2
        }
    })).toBe("okay");
});
