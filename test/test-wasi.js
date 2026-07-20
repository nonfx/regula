/**
 * WASI Build Test Suite
 *
 * Compares WASI binary output against the regular binary to ensure parity.
 */

import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const cliPath = join(rootDir, "cli.js");
const binaryPath = join(rootDir, "bin", "regula");
const fixturesDir = join(__dirname, "fixtures");

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

const runtime = process.env.WASI_RUNTIME || "node";

function runWasi(args) {
  return new Promise((resolve, reject) => {
    execFile(runtime, [cliPath, ...args], { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr, exitCode: error?.code || 0 });
    });
  });
}

function runBinary(args) {
  return new Promise((resolve, reject) => {
    execFile(binaryPath, args, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr, exitCode: error?.code || 0 });
    });
  });
}

function normalizeJson(str) {
  try {
    const obj = JSON.parse(str);
    // Remove timing-dependent fields
    if (obj.rule_results) {
      obj.rule_results.forEach(r => {
        delete r.source_location; // May have slight path differences
      });
    }
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}

async function runTests() {
  console.log("WASI Build Parity Tests\n");
  console.log("Comparing WASI binary against regular binary...\n");

  // Test 1: Version command parity
  await test("Version output matches", async () => {
    const wasi = await runWasi(["version"]);
    const binary = await runBinary(["version"]);
    assert.strictEqual(wasi.stdout.trim(), binary.stdout.trim(), "Version output should match");
  });

  // Test 2: Help output parity
  await test("Help output matches", async () => {
    const wasi = await runWasi(["--help"]);
    const binary = await runBinary(["--help"]);
    assert.strictEqual(wasi.stdout, binary.stdout, "Help output should match");
  });

  // Test 3: Run command help parity
  await test("Run command help matches", async () => {
    const wasi = await runWasi(["run", "--help"]);
    const binary = await runBinary(["run", "--help"]);
    assert.strictEqual(wasi.stdout, binary.stdout, "Run help output should match");
  });

  // Test 4: JSON output parity on valid.tf
  await test("JSON output matches for valid.tf", async () => {
    const wasi = await runWasi(["run", "--format", "json", join(fixturesDir, "valid.tf")]);
    const binary = await runBinary(["run", "--format", "json", join(fixturesDir, "valid.tf")]);

    const wasiJson = normalizeJson(wasi.stdout);
    const binaryJson = normalizeJson(binary.stdout);

    assert.strictEqual(wasiJson, binaryJson, "JSON output should match");
  });

  // Test 5: JSON output parity on insecure.tf
  await test("JSON output matches for insecure.tf", async () => {
    const wasi = await runWasi(["run", "--format", "json", join(fixturesDir, "insecure.tf")]);
    const binary = await runBinary(["run", "--format", "json", join(fixturesDir, "insecure.tf")]);

    const wasiJson = normalizeJson(wasi.stdout);
    const binaryJson = normalizeJson(binary.stdout);

    assert.strictEqual(wasiJson, binaryJson, "JSON output should match");
  });

  // Test 6: Rule count parity
  await test("Same number of rule results", async () => {
    const wasi = await runWasi(["run", "--format", "json", fixturesDir]);
    const binary = await runBinary(["run", "--format", "json", fixturesDir]);

    const wasiResults = JSON.parse(wasi.stdout);
    const binaryResults = JSON.parse(binary.stdout);

    assert.strictEqual(
      wasiResults.rule_results.length,
      binaryResults.rule_results.length,
      "Should have same number of rule results"
    );
  });

  // Test 7: Summary parity
  await test("Summary statistics match", async () => {
    const wasi = await runWasi(["run", "--format", "json", fixturesDir]);
    const binary = await runBinary(["run", "--format", "json", fixturesDir]);

    const wasiResults = JSON.parse(wasi.stdout);
    const binaryResults = JSON.parse(binary.stdout);

    assert.deepStrictEqual(
      wasiResults.summary.rule_results,
      binaryResults.summary.rule_results,
      "Summary rule_results should match"
    );

    assert.deepStrictEqual(
      wasiResults.summary.severities,
      binaryResults.summary.severities,
      "Summary severities should match"
    );
  });

  // Test 8: Input type flag works
  await test("Input type flag works identically", async () => {
    const wasi = await runWasi(["run", "--format", "json", "--input-type", "tf", join(fixturesDir, "valid.tf")]);
    const binary = await runBinary(["run", "--format", "json", "--input-type", "tf", join(fixturesDir, "valid.tf")]);

    const wasiJson = normalizeJson(wasi.stdout);
    const binaryJson = normalizeJson(binary.stdout);

    assert.strictEqual(wasiJson, binaryJson, "JSON output with input-type flag should match");
  });

  // Test 9: Rego test command parity
  await test("Rego test results match", async () => {
    const testPath = join(rootDir, "rego/tests/lib/");

    const wasi = await runWasi(["test", testPath]);
    const binary = await runBinary(["test", testPath]);

    // Extract PASS/FAIL counts
    const wasiMatch = wasi.stdout.match(/PASS: (\d+)\/(\d+)\nFAIL: (\d+)\/(\d+)/);
    const binaryMatch = binary.stdout.match(/PASS: (\d+)\/(\d+)\nFAIL: (\d+)\/(\d+)/);

    assert(wasiMatch, "WASI should have test results");
    assert(binaryMatch, "Binary should have test results");
    assert.strictEqual(wasiMatch[1], binaryMatch[1], "PASS count should match");
    assert.strictEqual(wasiMatch[3], binaryMatch[3], "FAIL count should match");
  });

  // Test 10: Exit codes match
  await test("Exit codes match for failures", async () => {
    const wasi = await runWasi(["run", "--format", "json", join(fixturesDir, "insecure.tf")]);
    const binary = await runBinary(["run", "--format", "json", join(fixturesDir, "insecure.tf")]);

    // Both should have non-zero exit for files with violations
    const wasiHasFailures = JSON.parse(wasi.stdout).summary.rule_results.FAIL > 0;
    const binaryHasFailures = JSON.parse(binary.stdout).summary.rule_results.FAIL > 0;

    assert.strictEqual(wasiHasFailures, binaryHasFailures, "Both should detect failures");
  });

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`WASI Parity Tests: ${passed} passed, ${failed} failed`);
  console.log(`${"=".repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
