export declare const DEFAULT_COMMAND_TIMEOUT_MS = 30000;
export declare const FORGE_AI_STEPS: readonly ["intake", "decompose", "red", "verifyRed", "green", "refactor", "finalVerify"];
export type ForgeAiStep = (typeof FORGE_AI_STEPS)[number];
export declare const DEFAULT_FORGE_SKILLS: Record<ForgeAiStep, string[]>;
export declare const DEFAULT_TEST_COMMANDS: string[];
export type ForgeSettings = {
    retries: number;
    timeoutMs: number;
    testCommands: string[];
    skills: Record<ForgeAiStep, string[]>;
};
export type RawForgeSettings = {
    retries?: number;
    timeoutMs?: number;
    timeout?: number;
    testCommands?: string[];
    testCommand?: string;
    skills?: Partial<Record<ForgeAiStep, string[]>>;
};
export type ForgeSettingsFile = {
    forge: ForgeSettings;
};
export type ForgeSettingsWarning = {
    source: string;
    path: string;
    key: string;
    problem: string;
    outcome: string;
    fix: string;
};
export type RawForgeSettingsParseResult = {
    settings: RawForgeSettings | undefined;
    warnings: ForgeSettingsWarning[];
};
type ParseResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: Error;
};
type SchemaLike<T> = {
    parse(value: unknown): T;
    safeParse(value: unknown): ParseResult<T>;
};
export declare const forgeSettingsSchema: SchemaLike<ForgeSettings>;
export declare const forgeSettingsFileSchema: SchemaLike<ForgeSettingsFile>;
export declare const DEFAULT_FORGE_SETTINGS: ForgeSettings;
export declare function parseRawForgeSettingsWithWarnings(value: unknown, source?: string): RawForgeSettingsParseResult;
export declare function parseRawForgeSettings(value: unknown): RawForgeSettings | undefined;
export declare function mergeForgeSettingsWithWarnings(base: ForgeSettings, override: unknown, source?: string): {
    settings: ForgeSettings;
    warnings: ForgeSettingsWarning[];
};
export declare function mergeForgeSettings(base: ForgeSettings, override: unknown): ForgeSettings;
export declare function generateForgeSettingsSample(): ForgeSettings;
export declare function generateForgeSettingsFileSample(): ForgeSettingsFile;
export {};
