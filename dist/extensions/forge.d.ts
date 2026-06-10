import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type ForgeSettings } from "../src/forge-config.js";
export declare function runForgeCommand(command: string, args: string[], cwd: string, options?: {
    timeoutMs?: number;
    retries?: number;
}): Promise<string>;
export declare function loadForgeSettings(cwd: string, options?: {
    projectTrusted?: boolean;
}): ForgeSettings;
export default function (pi: ExtensionAPI): void;
