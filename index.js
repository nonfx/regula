import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run regula on the specified path(s) and return parsed JSON results.
 * @param {string|string[]} paths - Path(s) to IaC files or directories
 * @param {Object} options - Optional configuration
 * @param {string} options.inputType - Input type: auto, tf, tf-plan, cfn, k8s, arm
 * @param {string[]} options.include - Additional rego files to include
 * @param {string[]} options.only - Only run specific rules
 * @param {string[]} options.exclude - Exclude specific rules
 * @param {boolean} options.noBuiltIns - Disable built-in rules (use only custom rules from include)
 * @param {boolean} options.noIgnore - Disable .gitignore filtering
 * @param {string[]} options.varFiles - Terraform variable files to use
 * @returns {Promise<Object>} - Parsed regula output with rule_results and summary
 */
export async function runRegula(paths, options = {}) {
  const pathArray = Array.isArray(paths) ? paths : [paths];

  // Always use JSON format for programmatic parsing
  const args = ["run", "--format", "json"];

  if (options.inputType) {
    args.push("--input-type", options.inputType);
  }

  if (options.include) {
    const includes = Array.isArray(options.include) ? options.include : [options.include];
    for (const inc of includes) {
      args.push("--include", inc);
    }
  }

  if (options.only) {
    const onlyRules = Array.isArray(options.only) ? options.only : [options.only];
    for (const rule of onlyRules) {
      args.push("--only", rule);
    }
  }

  if (options.exclude) {
    const excludeRules = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
    for (const rule of excludeRules) {
      args.push("--exclude", rule);
    }
  }

  if (options.noBuiltIns) {
    args.push("--no-built-ins");
  }

  if (options.noIgnore) {
    args.push("--no-ignore");
  }

  if (options.varFiles) {
    const varFiles = Array.isArray(options.varFiles) ? options.varFiles : [options.varFiles];
    for (const varFile of varFiles) {
      args.push("--var-file", varFile);
    }
  }

  args.push(...pathArray);

  return new Promise((resolve, reject) => {
    const cliPath = join(__dirname, "cli.js");

    execFile("node", [cliPath, ...args], { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (stderr) {
        console.error(stderr);
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        if (error) {
          reject(new Error(`Regula failed: ${error.message}\nOutput: ${stdout}`));
        } else {
          reject(new Error(`Failed to parse regula output: ${stdout}`));
        }
      }
    });
  });
}

/**
 * Validate IaC files and return rule results.
 * Alias for runRegula().
 * @param {string|string[]} paths - Path(s) to IaC files or directories
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Object with rule_results and summary
 */
export async function validate(paths, options = {}) {
  return runRegula(paths, options);
}

export default { runRegula, validate };
