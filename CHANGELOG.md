# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Fixed size measurement formatting in polyp and mass templates
  - Simplified template usage to rely on size shared template for all formatting
  - Removed redundant measure helper usage
  - Ensures consistent handling of both numeric values and descriptive sizes (e.g. "small")

### Added
- Added comprehensive template processor tests covering:
  - Complex nested template references
  - Array value handling
  - Mixed type validation with direct values
  - Complex ternary expressions
  - Multiple nested conditions
  - Error handling scenarios
  - Validation of complex nested shared templates
  - Mixed type array validation

### Changed
- Cleaned up test files by removing old test implementations in favor of Vitest tests
  - Removed legacy test files and utilities that were replaced by Vitest implementation
  - All template processor tests now consolidated in src/test/unit/templateProcessor.test.ts
  - Removed test entry point from Vite config as it's no longer needed

### Added
- Added dilatation action template with shared templates for:
  - Dilator types (balloon and Savary)
  - Dilator sizes (specific ranges for each type)
  - Perforation complication details
  - Configured as standalone action with validForFindings: ["*"]
- Support for variables in shared templates
  - Shared templates can now define their own variables (e.g., unit selection)
  - Finding/action templates can pass variable values through useShared.variables
  - Added unit (mm/cm) selection to size shared template
  - Template processor updated to handle shared template variables
- Support for conditional next actions
  - Actions can now specify conditions for their next actions
  - Conditions use the same operators as finding allowed actions (equals, includes, greater, less)
  - Template loader updated to handle conditional relationships
  - Example: Retrieval action only available after successful polypectomy/biopsy
