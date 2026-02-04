#!/usr/bin/env node

import { WASI } from "wasi";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

// Note: preopens "/" is required because regula needs to read IaC files from
// any path the user specifies (including absolute paths like /home/user/terraform/).
// This is expected behavior for a CLI tool that processes user-specified file paths.
const wasi = new WASI({
  version: "preview1",
  args: ["regula", ...args],
  env: process.env,
  preopens: { "/": "/" },
  returnOnExit: true,
});

try {
  const wasmPath = join(__dirname, "regula.wasm");
  const wasm = await readFile(wasmPath);
  const { instance } = await WebAssembly.instantiate(wasm, wasi.getImportObject());
  wasi.start(instance);
} catch (err) {
  if (err.code === "ERR_WASI_EXITED") {
    process.exit(err.exitCode);
  }
  console.error("Error:", err.message);
  process.exit(1);
}
