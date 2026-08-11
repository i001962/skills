import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dirname, "..");
const skill = readFileSync(resolve(skillDir, "SKILL.md"), "utf8");
const catalog = JSON.parse(readFileSync(resolve(skillDir, "catalog.json"), "utf8"));
const dataModeling = readFileSync(resolve(skillDir, "references", "data-modeling.md"), "utf8");

const failures = [];
const requireText = (text, label) => {
  if (!skill.includes(text)) failures.push(`SKILL.md must include ${label}`);
};

if (!skill.startsWith("---\nname: gundb\n")) failures.push("SKILL.md must have gundb frontmatter");
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatter) failures.push("SKILL.md frontmatter must be closed");
if (frontmatter && !/^name: gundb\ndescription: .+$/m.test(frontmatter[1])) {
  failures.push("SKILL.md frontmatter must contain only a name and non-empty description");
}
if (catalog.schemaVersion !== 1) failures.push("catalog schemaVersion must be 1");
if (catalog.slug !== "gundb") failures.push("catalog slug must be gundb");
if (catalog.install?.type !== "bankr") failures.push("catalog install type must be bankr");
if (catalog.install?.repoPath !== "gundb") failures.push("catalog repoPath must be gundb");
if (catalog.logo !== "logo.svg") failures.push("catalog must reference logo.svg");
if (catalog.install?.command !== "install the gundb skill from https://github.com/BankrBot/skills/tree/main/gundb") {
  failures.push("catalog must use the BankrBot install command");
}

requireText("references/data-modeling.md", "data-modeling routing");
requireText("references/security.md", "security routing");
requireText("references/runtime.md", "runtime routing");
requireText("https://gun.eco/docs/", "official GunDB documentation link");
requireText("never put passwords, private key pairs", "secret-handling guardrail");
if (!dataModeling.includes("eventually consistent")) failures.push("data-modeling reference must include consistency guardrail");
requireText("two independent clients", "production replication validation");
requireText("## Usage examples", "usage examples");

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("GunDB skill smoke tests passed.");
}
