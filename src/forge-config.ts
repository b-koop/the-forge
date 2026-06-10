import { z } from "zod";

export const DEFAULT_COMMAND_TIMEOUT_MS = 30_000;

export const FORGE_AI_STEPS = [
	"intake",
	"decompose",
	"red",
	"verifyRed",
	"green",
	"refactor",
	"finalVerify",
] as const;

export type ForgeAiStep = (typeof FORGE_AI_STEPS)[number];

export const DEFAULT_FORGE_SKILLS: Record<ForgeAiStep, string[]> = {
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

const nonEmptyStringSchema = z.string().trim().min(1);
const testCommandsSchema = z.array(nonEmptyStringSchema).min(1);
const forgeAiStepSchema = z.enum(FORGE_AI_STEPS);
const forgeSkillsSchema = z.record(
	forgeAiStepSchema,
	z.array(nonEmptyStringSchema).min(1),
);
const forgeSkillListSchema = z.array(nonEmptyStringSchema).min(1);
const rawForgeSkillsSchema = z.partialRecord(
	forgeAiStepSchema,
	forgeSkillListSchema,
);

export const forgeSettingsSchema = z.object({
	retries: z.number().int().min(0).default(0),
	timeoutMs: z.number().int().positive().default(DEFAULT_COMMAND_TIMEOUT_MS),
	testCommands: testCommandsSchema.default(DEFAULT_TEST_COMMANDS),
	skills: forgeSkillsSchema.default(DEFAULT_FORGE_SKILLS),
});

export const forgeSettingsFileSchema = z.object({
	forge: forgeSettingsSchema,
});

function optionalValid<T extends z.ZodType>(schema: T) {
	return z.preprocess((value) => {
		const result = schema.safeParse(value);
		return result.success ? result.data : undefined;
	}, schema.optional());
}

function optionalValidForgeSkills() {
	return z.preprocess((value) => {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			return undefined;
		}
		const rawSkills = value as Record<string, unknown>;
		const validSkills: Partial<Record<ForgeAiStep, string[]>> = {};
		for (const step of FORGE_AI_STEPS) {
			const result = forgeSkillListSchema.safeParse(rawSkills[step]);
			if (result.success) validSkills[step] = result.data;
		}
		return Object.keys(validSkills).length > 0 ? validSkills : undefined;
	}, rawForgeSkillsSchema.optional());
}

const tolerantNonNegativeInteger = optionalValid(z.number().int().min(0));
const tolerantPositiveInteger = optionalValid(z.number().int().positive());

export const rawForgeSettingsSchema = z.looseObject({
	retries: tolerantNonNegativeInteger,
	timeoutMs: tolerantPositiveInteger,
	timeout: tolerantPositiveInteger,
	testCommands: optionalValid(testCommandsSchema),
	testCommand: optionalValid(nonEmptyStringSchema),
	skills: optionalValidForgeSkills(),
});

export type ForgeSettings = z.infer<typeof forgeSettingsSchema>;
export type RawForgeSettings = z.infer<typeof rawForgeSettingsSchema>;

export const DEFAULT_FORGE_SETTINGS: ForgeSettings = forgeSettingsSchema.parse(
	{},
);

export function parseRawForgeSettings(
	value: unknown,
): RawForgeSettings | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return undefined;
	}
	return rawForgeSettingsSchema.parse(value);
}

export function mergeForgeSettings(
	base: ForgeSettings,
	override: unknown,
): ForgeSettings {
	const parsed = parseRawForgeSettings(override);
	if (!parsed) return base;
	return forgeSettingsSchema.parse({
		retries: parsed.retries ?? base.retries,
		timeoutMs: parsed.timeoutMs ?? parsed.timeout ?? base.timeoutMs,
		testCommands:
			parsed.testCommands ??
			(parsed.testCommand ? [parsed.testCommand] : base.testCommands),
		skills: {
			...base.skills,
			...(parsed.skills ?? {}),
		},
	});
}

export function generateForgeSettingsSample(): ForgeSettings {
	return forgeSettingsSchema.parse({});
}

export function generateForgeSettingsFileSample(): z.infer<
	typeof forgeSettingsFileSchema
> {
	return forgeSettingsFileSchema.parse({
		forge: generateForgeSettingsSample(),
	});
}
