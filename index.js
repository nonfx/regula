import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run regula on the specified path(s)
 * @param {string|string[]} paths - Path(s) to IaC files or directories
 * @param {Object} options - Optional configuration
 * @param {string} options.inputType - Input type: auto, tf, tf-plan, cfn, k8s, arm
 * @param {string} options.format - Output format: json, text, table, sarif, junit, tap
 * @param {string[]} options.include - Additional rego files to include
 * @param {string[]} options.only - Only run specific rules
 * @param {string[]} options.exclude - Exclude specific rules
 * @returns {Promise<Object>} - Regula output
 */
export async function runRegula(paths, options = {}) {
  const pathArray = Array.isArray(paths) ? paths : [paths];

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
 * Validate IaC files and return rule results
 * @param {string|string[]} paths - Path(s) to IaC files or directories
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Object with rule_results and summary
 */
export async function validate(paths, options = {}) {
  return runRegula(paths, options);
}

export default { runRegula, validate };
