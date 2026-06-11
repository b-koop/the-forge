export const DEFAULT_COMMAND_TIMEOUT_MS = 30_000;
export const FORGE_AI_STEPS = [
    "intake",
    "decompose",
    "red",
    "verifyRed",
    "green",
    "refactor",
    "finalVerify",
];
export const DEFAULT_FORGE_SKILLS = {
    intake: ["tdd", "bdd", "grill-me", "linear-cli"],
    decompose: ["bdd", "tdd", "naming"],
    red: ["tdd", "bdd", "test-name"],
    verifyRed: ["tdd", "vette"],
    green: ["tdd", "naming"],
    refactor: ["tdd", "naming", "thermo-nuclear-code-quality-review"],
    finalVerify: [
        "tdd",
        "vette",
        "thermo-nuclear-code-quality-review",
        "pr-validate",
    ],
};
export const DEFAULT_TEST_COMMANDS = ["pnpm typecheck", "pnpm test"];
const FORGE_SETTING_KEYS = new Set([
    "retries",
    "timeoutMs",
    "timeout",
    "testCommands",
    "testCommand",
    "skills",
]);
const FORGE_AI_STEP_SET = new Set(FORGE_AI_STEPS);
function cloneSkills(skills) {
    const cloned = {};
    for (const step of FORGE_AI_STEPS) {
        if (skills[step])
            cloned[step] = [...skills[step]];
    }
    return cloned;
}
function cloneSettings(settings) {
    return {
        retries: settings.retries,
        timeoutMs: settings.timeoutMs,
        testCommands: [...settings.testCommands],
        skills: cloneSkills(settings.skills),
    };
}
function createSchema(parse) {
    return {
        parse,
        safeParse(value) {
            try {
                return { success: true, data: parse(value) };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                };
            }
        },
    };
}
function assertRecord(value, label) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(`${label} must be an object.`);
    }
    return value;
}
function parseNonNegativeInteger(value, label) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative integer.`);
    }
    return value;
}
function parsePositiveInteger(value, label) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        throw new Error(`${label} must be a positive integer.`);
    }
    return value;
}
function parseNonEmptyString(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label} must be a non-empty string.`);
    }
    return value.trim();
}
function parseNonEmptyStringArray(value, label) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${label} must be a non-empty string array.`);
    }
    return value.map((item, index) => parseNonEmptyString(item, `${label}[${index}]`));
}
function parseForgeSkills(value) {
    const record = assertRecord(value, "skills");
    const parsed = {};
    for (const step of FORGE_AI_STEPS) {
        if (!(step in record))
            throw new Error(`skills.${step} is required.`);
        parsed[step] = parseNonEmptyStringArray(record[step], `skills.${step}`);
    }
    return parsed;
}
function parseForgeSettings(value) {
    const record = value === undefined ? {} : assertRecord(value, "forge settings");
    return {
        retries: "retries" in record
            ? parseNonNegativeInteger(record.retries, "retries")
            : 0,
        timeoutMs: "timeoutMs" in record
            ? parsePositiveInteger(record.timeoutMs, "timeoutMs")
            : DEFAULT_COMMAND_TIMEOUT_MS,
        testCommands: "testCommands" in record
            ? parseNonEmptyStringArray(record.testCommands, "testCommands")
            : [...DEFAULT_TEST_COMMANDS],
        skills: "skills" in record
            ? parseForgeSkills(record.skills)
            : cloneSkills(DEFAULT_FORGE_SKILLS),
    };
}
function parseForgeSettingsFile(value) {
    const record = assertRecord(value, "settings file");
    return { forge: parseForgeSettings(record.forge) };
}
export const forgeSettingsSchema = createSchema(parseForgeSettings);
export const forgeSettingsFileSchema = createSchema(parseForgeSettingsFile);
export const DEFAULT_FORGE_SETTINGS = forgeSettingsSchema.parse({});
function warning(source, path, key, problem, outcome, fix) {
    return { source, path, key, problem, outcome, fix };
}
function describeExpected(value) {
    if (Array.isArray(value))
        return "array";
    if (value === null)
        return "null";
    return typeof value;
}
function validNonEmptyStringArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === "string" && item.trim().length > 0));
}
function warnUnknownForgeKeys(value, source, warnings) {
    for (const key of Object.keys(value)) {
        if (!FORGE_SETTING_KEYS.has(key)) {
            warnings.push(warning(source, `forge.${key}`, key, "Unknown Forge setting key.", "The setting was ignored.", "Remove the key or rename it to a supported Forge setting."));
        }
    }
}
function parseRetries(value, source, parsed, warnings) {
    if (!("retries" in value))
        return;
    try {
        parsed.retries = parseNonNegativeInteger(value.retries, "retries");
    }
    catch {
        warnings.push(warning(source, "forge.retries", "retries", `Expected a non-negative integer, got ${describeExpected(value.retries)}.`, "Using the previous/default retry count.", "Set retries to 0 or a positive whole number."));
    }
}
function parseTimeoutMs(value, source, parsed, warnings) {
    if (!("timeoutMs" in value))
        return;
    try {
        parsed.timeoutMs = parsePositiveInteger(value.timeoutMs, "timeoutMs");
    }
    catch {
        warnings.push(warning(source, "forge.timeoutMs", "timeoutMs", `Expected a positive integer number of milliseconds, got ${describeExpected(value.timeoutMs)}.`, "Using the previous/default timeout.", "Set timeoutMs to a positive whole number such as 30000."));
    }
}
function parseLegacyTimeout(value, source, parsed, warnings) {
    if (!("timeout" in value))
        return;
    try {
        parsed.timeout = parsePositiveInteger(value.timeout, "timeout");
        warnings.push(warning(source, "forge.timeout", "timeout", "Legacy Forge timeout key is deprecated.", `Accepted for compatibility as timeoutMs=${parsed.timeout}.`, "Rename timeout to timeoutMs."));
    }
    catch {
        warnings.push(warning(source, "forge.timeout", "timeout", `Expected a positive integer number of milliseconds, got ${describeExpected(value.timeout)}.`, "The legacy timeout was ignored.", "Use timeoutMs with a positive whole number such as 30000."));
    }
}
function parseTestCommands(value, source, parsed, warnings) {
    if (!("testCommands" in value))
        return;
    if (validNonEmptyStringArray(value.testCommands)) {
        parsed.testCommands = [...value.testCommands];
        return;
    }
    warnings.push(warning(source, "forge.testCommands", "testCommands", `Expected a non-empty array of non-empty command strings, got ${describeExpected(value.testCommands)}.`, "Using the previous/default test commands.", 'Set testCommands to an array such as ["pnpm typecheck", "pnpm test"].'));
}
function parseLegacyTestCommand(value, source, parsed, warnings) {
    if (!("testCommand" in value))
        return;
    try {
        parsed.testCommand = parseNonEmptyString(value.testCommand, "testCommand");
        warnings.push(warning(source, "forge.testCommand", "testCommand", "Legacy Forge testCommand key is deprecated.", "Accepted for compatibility as a one-item testCommands list.", "Rename testCommand to testCommands and wrap the command in an array."));
    }
    catch {
        warnings.push(warning(source, "forge.testCommand", "testCommand", `Expected a non-empty command string, got ${describeExpected(value.testCommand)}.`, "The legacy testCommand was ignored.", "Use testCommands with a non-empty array of command strings."));
    }
}
function parseSkills(value, source, parsed, warnings) {
    if (!("skills" in value))
        return;
    const skillsValue = value.skills;
    if (typeof skillsValue !== "object" ||
        skillsValue === null ||
        Array.isArray(skillsValue)) {
        warnings.push(warning(source, "forge.skills", "skills", `Expected an object keyed by Forge AI step names, got ${describeExpected(skillsValue)}.`, "Using the previous/default skills map.", `Set skills to an object with keys such as ${FORGE_AI_STEPS.join(", ")}.`));
        return;
    }
    const validSkills = parseSkillSteps(skillsValue, source, warnings);
    if (Object.keys(validSkills).length > 0)
        parsed.skills = validSkills;
}
function parseSkillSteps(rawSkills, source, warnings) {
    const validSkills = {};
    for (const [step, skillList] of Object.entries(rawSkills)) {
        if (!FORGE_AI_STEP_SET.has(step)) {
            warnings.push(warning(source, `forge.skills.${step}`, step, "Unknown Forge skill step name.", "The skill step was ignored.", `Use one of: ${FORGE_AI_STEPS.join(", ")}.`));
            continue;
        }
        if (validNonEmptyStringArray(skillList)) {
            validSkills[step] = [...skillList];
            continue;
        }
        warnings.push(warning(source, `forge.skills.${step}`, step, `Expected a non-empty array of non-empty skill names, got ${describeExpected(skillList)}.`, "Using the previous/default skills for this step.", `Set skills.${step} to an array such as ["tdd"].`));
    }
    return validSkills;
}
function validateRawForgeSettings(value, source) {
    const warnings = [];
    const parsed = {};
    warnUnknownForgeKeys(value, source, warnings);
    parseRetries(value, source, parsed, warnings);
    parseTimeoutMs(value, source, parsed, warnings);
    parseLegacyTimeout(value, source, parsed, warnings);
    parseTestCommands(value, source, parsed, warnings);
    parseLegacyTestCommand(value, source, parsed, warnings);
    parseSkills(value, source, parsed, warnings);
    return {
        settings: parsed,
        warnings,
    };
}
export function parseRawForgeSettingsWithWarnings(value, source = "settings") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return {
            settings: undefined,
            warnings: [
                warning(source, "forge", "forge", `Expected the forge setting to be an object, got ${describeExpected(value)}.`, "Forge ignored this settings section.", "Set forge to an object containing Forge settings."),
            ],
        };
    }
    return validateRawForgeSettings(value, source);
}
export function parseRawForgeSettings(value) {
    return parseRawForgeSettingsWithWarnings(value).settings;
}
export function mergeForgeSettingsWithWarnings(base, override, source = "settings") {
    const parsed = parseRawForgeSettingsWithWarnings(override, source);
    if (!parsed.settings)
        return { settings: cloneSettings(base), warnings: parsed.warnings };
    return {
        settings: forgeSettingsSchema.parse({
            retries: parsed.settings.retries ?? base.retries,
            timeoutMs: parsed.settings.timeoutMs ?? parsed.settings.timeout ?? base.timeoutMs,
            testCommands: parsed.settings.testCommands ??
                (parsed.settings.testCommand
                    ? [parsed.settings.testCommand]
                    : base.testCommands),
            skills: {
                ...base.skills,
                ...(parsed.settings.skills ?? {}),
            },
        }),
        warnings: parsed.warnings,
    };
}
export function mergeForgeSettings(base, override) {
    return mergeForgeSettingsWithWarnings(base, override).settings;
}
export function generateForgeSettingsSample() {
    return forgeSettingsSchema.parse({});
}
export function generateForgeSettingsFileSample() {
    return forgeSettingsFileSchema.parse({
        forge: generateForgeSettingsSample(),
    });
}
//# sourceMappingURL=forge-config.js.map