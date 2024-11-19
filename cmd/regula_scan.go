package cmd

import (
	"context"

	"github.com/nonfx/regula/pkg/loader"
	"github.com/nonfx/regula/pkg/rego"
	"github.com/nonfx/regula/pkg/reporter"
)

var iacPath = []string{"/Users/chandrashekhar/source-code/src/github.com/nonfx/tf-regula-test/module-test/iac"}
var pacPath = []string{"/Users/chandrashekhar/source-code/src/github.com/nonfx/stance/foundation/data/rules/aws"}

func RunRegulaScan(args []string) error {
	// CLI-arg-only options
	noConfig := true

	// Config-file specific options
	var rootDir string
	var configPath string

	// Inputs
	inputs := iacPath
	includes := pacPath

	// Enum types

	inputTypes := []loader.InputType{loader.Tf}
	format := reporter.JSON

	config := &runConfig{
		configPath: configPath,
		format:     format,
		includes:   includes,
		inputs:     inputs,
		inputTypes: inputTypes,
		noBuiltIns: true,
		noConfig:   noConfig,
		rootDir:    rootDir,
	}
	if err := config.Validate(); err != nil {
		return err
	}

	// Interpret configuration
	configLoader, err := config.ConfigurationLoader()
	if err != nil {
		return err
	}
	providers, err := config.Providers()
	if err != nil {
		return err
	}
	resultProcessor := config.ResultProcessor()

	// Execution
	ctx := context.Background()
	loadedConfigs, err := configLoader()
	if err != nil {
		return err
	}
	result, err := rego.RunRules(ctx, &rego.RunRulesOptions{
		Providers: providers,
		Input:     loadedConfigs.RegulaInput(),
		Query:     config.RunRulesQuery(),
	})
	if err != nil {
		return err
	}
	if err := resultProcessor(ctx, loadedConfigs, result); err != nil {
		return err
	}
	return nil
}
