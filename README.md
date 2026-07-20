# Regula (nonfx fork)

> **Note:** This is a maintained fork of [fugue/regula](https://github.com/fugue/regula), which is now archived. This fork includes security patches, dependency upgrades, and WASI/npm support.

## What's Different in This Fork

### Security Patches & Upgrades
- **OPA upgraded** from v0.45.1 to v1.12.2 (latest)
- **Go upgraded** to 1.24.11 with stdlib CVE fixes
- **AWS SDK** migrated to maintained fork
- **go-getter** upgraded from 1.6.2 to 1.7.0
- **golang.org/x/net** upgraded to fix vulnerabilities
- **google.golang.org/grpc** upgraded to 1.56.3

### WASI/WebAssembly Support
This fork can be compiled to WASI (WebAssembly System Interface), allowing it to run in Node.js 18+ without native dependencies. This is useful for:
- Serverless environments
- Browser-based tools
- Cross-platform distribution via npm

### Vendor Patches for WASI
The following vendor patches are applied during WASI builds:
- `spf13/afero` - WASI-compatible errno handling
- `sirupsen/logrus` - Terminal detection bypass for WASI
- `fsnotify/fsnotify` - No-op file watcher for WASI
- `chzyer/readline` - Terminal stubs for WASI

---

## Introduction

[Regula](https://regula.dev) is a tool that evaluates infrastructure as code files for potential AWS, Azure, Google Cloud, and Kubernetes security and compliance violations prior to deployment.

Regula supports the following file types:

- CloudFormation JSON/YAML templates
- Terraform source code
- Terraform JSON plans
- Kubernetes YAML manifests
- Azure Resource Manager (ARM) JSON templates

Regula includes a library of rules written in Rego, the policy language used by the [Open Policy Agent](https://www.openpolicyagent.org/) (OPA) project.

---

## Installation

### npm (Node.js 18+)

The easiest way to use Regula in JavaScript/TypeScript projects:

```bash
npm install regula-wasi
```

#### CLI Usage

```bash
# Run directly with npx
npx regula-wasi run ./terraform/

# Or install globally
npm install -g regula-wasi
regula run ./terraform/
```

#### Programmatic Usage

```javascript
import { runRegula, validate } from 'regula-wasi';

// Basic usage
const result = await runRegula('./terraform/');
console.log(result.summary);

// With options
const result = await runRegula('./main.tf', {
  inputType: 'tf',           // auto, tf, tf-plan, cfn, k8s, arm
  include: ['./custom-rules/'],
  only: ['FG_R00229'],       // Only run specific rules
  exclude: ['FG_R00100'],    // Exclude specific rules
  noBuiltIns: false,         // Disable built-in rules (use only custom rules)
  noIgnore: false,           // Disable .gitignore filtering
  varFiles: ['./prod.tfvars'], // Terraform variable files
});

// Check for failures
if (result.summary.rule_results.FAIL > 0) {
  console.error('Security violations found!');
  process.exit(1);
}

// Error handling with detailed error information
try {
  const result = await runRegula('./main.tf');
} catch (error) {
  // RegulaError includes stdout, stderr, exitCode, and command
  console.error('Error:', error.message);
  console.error('Stderr:', error.stderr);
  console.error('Exit code:', error.exitCode);
}
```

#### API Options

| Option | Type | Description |
|--------|------|-------------|
| `inputType` | string | Input type: `auto`, `tf`, `tf-plan`, `cfn`, `k8s`, `arm` |
| `include` | string[] | Additional rego rule files/directories to include |
| `only` | string[] | Only run these specific rule IDs |
| `exclude` | string[] | Exclude these specific rule IDs |
| `noBuiltIns` | boolean | Disable built-in rules (use only custom rules from `include`) |
| `noIgnore` | boolean | Disable .gitignore filtering |
| `varFiles` | string[] | Terraform variable files (.tfvars) to use |

#### Error Handling

When an error occurs, a `RegulaError` is thrown with the following properties:

- `message` - Error description
- `stdout` - Standard output from regula command
- `stderr` - Standard error output (includes OPA errors and warnings)
- `exitCode` - Exit code from regula process
- `command` - The command that was executed

### Prebuilt Binary

Download from [Releases](https://github.com/nonfx/regula/releases) for your platform.

### From Source

Requires Go 1.21+

```bash
# Build native binary
make binary          # outputs to ./bin/regula
make install         # installs to /usr/local/bin/regula

# Build WASI binary (requires Go 1.25+)
./build-wasi.sh      # outputs regula.wasm
```

### Docker

```bash
docker run --rm -v $(pwd):/workspace ghcr.io/nonfx/regula run /workspace
```

---

## Usage

### Basic Commands

```bash
# Scan Terraform directory
regula run ./terraform/

# Scan with specific input type
regula run --input-type tf ./main.tf

# Output as JSON
regula run --format json ./terraform/

# Include custom rules
regula run --include ./custom-rules/ ./terraform/

# Run only specific rules
regula run --only FG_R00229 ./terraform/
```

### Output Formats

- `text` (default) - Human-readable output
- `json` - JSON output for programmatic use
- `table` - Tabular output
- `sarif` - SARIF format for GitHub Code Scanning
- `junit` - JUnit XML for CI/CD integration
- `tap` - Test Anything Protocol

### Exit Codes

- `0` - No violations found
- `1` - Violations found or error occurred

---

## Available Commands

```
regula [command]

Commands:
  run               Evaluate rules against infrastructure as code
  test              Run OPA test with Regula
  repl              Start an interactive session for testing rules
  init              Create a new Regula configuration file
  show              Show debug information
  version           Print version information
  completion        Generate shell autocompletion script

Flags:
  -h, --help        Help for regula
  -v, --verbose     Verbose output
```

---

## Building

### Native Binary

```bash
# Standard build
go build -mod vendor -o bin/regula .

# Or use make
make binary
```

### WASI Binary

Requires Go 1.25+ for large binary WASM linking.

```bash
./build-wasi.sh
```

This will:
1. Vendor dependencies (`go mod vendor`)
2. Apply WASI patches from `patches/` directory
3. Build `regula.wasm` (121MB)

### Running Tests

```bash
# Go tests
make test

# npm tests (requires WASI build)
npm test              # Basic API tests
npm run test:wasi     # Parity tests vs native binary
```

---

## License

Apache 2.0 - See [LICENSE](LICENSE)

Originally created by [Fugue, Inc.](https://fugue.co)

---

## Links

- [Original Documentation](https://regula.dev) (may be outdated)
- [Original Repository](https://github.com/fugue/regula) (archived)
- [This Fork](https://github.com/nonfx/regula)
- [npm Package](https://www.npmjs.com/package/regula-wasi)
