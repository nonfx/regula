export interface RegulaOptions {
  /** Input type: auto, tf, tf-plan, cfn, k8s, arm */
  inputType?: "auto" | "tf" | "tf-plan" | "cfn" | "k8s" | "arm";
  /** Additional rego rule files/directories to include */
  include?: string | string[];
  /** Only run these specific rule IDs */
  only?: string | string[];
  /** Exclude these specific rule IDs */
  exclude?: string | string[];
  /** Disable built-in rules (use only custom rules from include) */
  noBuiltIns?: boolean;
  /** Disable .gitignore filtering */
  noIgnore?: boolean;
  /** Terraform variable files (.tfvars) to use */
  varFiles?: string | string[];
}

export interface SourceLocation {
  path: string;
  line: number;
  column: number;
}

export interface RuleResult {
  controls: string[];
  families: string[];
  filepath: string;
  input_type: string;
  provider: string;
  resource_id: string;
  resource_type: string;
  resource_tags: Record<string, unknown>;
  rule_description: string;
  rule_id: string;
  rule_message: string;
  rule_name: string;
  rule_raw_result: boolean;
  rule_remediation_doc?: string;
  rule_result: "PASS" | "FAIL" | "WAIVED";
  rule_severity: "Unknown" | "Informational" | "Low" | "Medium" | "High" | "Critical";
  rule_summary: string;
  source_location?: SourceLocation[];
  active_waivers?: string[];
}

export interface RegulaResult {
  rule_results: RuleResult[];
  summary: {
    filepaths: string[];
    rule_results: {
      PASS: number;
      FAIL: number;
      WAIVED: number;
    };
    severities: {
      Unknown: number;
      Informational: number;
      Low: number;
      Medium: number;
      High: number;
      Critical: number;
    };
  };
}

/**
 * Run regula on the specified path(s) and return parsed JSON results.
 * @param paths - Path(s) to IaC files or directories
 * @param options - Optional configuration
 * @returns Parsed regula output with rule_results and summary
 */
export function runRegula(
  paths: string | string[],
  options?: RegulaOptions
): Promise<RegulaResult>;

/**
 * Validate IaC files and return rule results.
 * Alias for runRegula().
 * @param paths - Path(s) to IaC files or directories
 * @param options - Optional configuration
 * @returns Object with rule_results and summary
 */
export function validate(
  paths: string | string[],
  options?: RegulaOptions
): Promise<RegulaResult>;

declare const _default: {
  runRegula: typeof runRegula;
  validate: typeof validate;
};

export default _default;
