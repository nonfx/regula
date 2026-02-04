import { runRegula } from "../index.js";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturesDir = join(__dirname, "fixtures");
const cliPath = join(__dirname, "..", "cli.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      console.log(`✓ ${name}`);
      passed++;
    })
    .catch((err) => {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${err.message}`);
      failed++;
    });
}

async function runCli(args) {
  return new Promise((resolve, reject) => {
    execFile("node", [cliPath, ...args], { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr, exitCode: error?.code || 0 });
    });
  });
}

// Tests
async function runTests() {
  console.log("Running regula WASI tests...\n");

  // Test 1: CLI --help works
  await test("CLI --help returns usage info", async () => {
    const { stdout } = await runCli(["--help"]);
    assert(stdout.includes("regula"), "Should contain 'regula'");
    assert(stdout.includes("Available Commands"), "Should show available commands");
  });

  // Test 2: CLI version works
  await test("CLI version command works", async () => {
    const { stdout } = await runCli(["version"]);
    assert(stdout.includes("OPA") || stdout.includes("version"), "Should contain version info");
  });

  // Test 3: Run on valid terraform file
  await test("Run on valid terraform file returns results", async () => {
    const result = await runRegula(join(fixturesDir, "valid.tf"));
    assert(result.rule_results, "Should have rule_results");
    assert(result.summary, "Should have summary");
  });

  // Test 4: Run on insecure terraform file finds issues
  await test("Run on insecure terraform file finds violations", async () => {
    const result = await runRegula(join(fixturesDir, "insecure.tf"));
    assert(result.rule_results, "Should have rule_results");
    assert(result.summary, "Should have summary");
    // Should find some failures for the insecure config
    const failures = result.rule_results.filter((r) => r.rule_result === "FAIL");
    assert(failures.length > 0, "Should find security violations");
  });

  // Test 5: Programmatic API with options
  await test("Programmatic API accepts options", async () => {
    const result = await runRegula(join(fixturesDir, "valid.tf"), {
      inputType: "tf",
    });
    assert(result.rule_results, "Should have rule_results");
  });

  // Test 6: Run on directory
  await test("Run on directory works", async () => {
    const result = await runRegula(fixturesDir);
    assert(result.rule_results, "Should have rule_results");
    assert(result.summary, "Should have summary");
  });

  // Summary
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
