# Automation Scripts

This directory contains automation scripts for generating standalone examples and documentation for the Anonymous Cultural Crowdfunding project.

## Scripts Overview

### generate-docs.ts

Automatically generates GitBook-compatible documentation from smart contract source code and test files.

**Features:**
- Extracts comments from contracts and tests
- Generates formatted markdown documentation
- Creates SUMMARY.md index for GitBook
- Organizes by categories

**Usage:**
```bash
# Generate all documentation
npx ts-node scripts/generate-docs.ts

# Generate all with explicit flag
npx ts-node scripts/generate-docs.ts --all

# Show help
npx ts-node scripts/generate-docs.ts --help
```

**Output:**
```
docs/
├── SUMMARY.md
└── anonymous-cultural-crowdfunding.md
```

### create-example.ts

Generates standalone FHEVM example repositories that can be cloned and used independently.

**Features:**
- Copies contract and test files
- Sets up complete Hardhat project structure
- Generates custom README with setup instructions
- Includes deployment scripts and tasks
- Creates ready-to-run examples

**Usage:**
```bash
# Create a standalone example
npx ts-node scripts/create-example.ts anonymous-cultural-crowdfunding ./output

# List available examples
npx ts-node scripts/create-example.ts --list

# Show help
npx ts-node scripts/create-example.ts --help
```

**Output Structure:**
```
output/
├── contracts/
├── test/
├── deploy/
├── tasks/
├── scripts/
├── docs/
├── hardhat.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── .gitignore
```

## Script Configuration

### Adding New Examples

To add a new example to the automation system:

1. **Add to EXAMPLES_CONFIG** in `generate-docs.ts`:
```typescript
const EXAMPLES_CONFIG: Record<string, DocConfig> = {
  "your-example": {
    name: "Your Example Name",
    contractPath: "contracts/YourContract.sol",
    testPath: "test/YourContract.ts",
    category: "Category",
    description: "Your description",
  },
};
```

2. **Add to EXAMPLES_MAP** in `create-example.ts`:
```typescript
const EXAMPLES_MAP: Record<string, ExampleTemplate> = {
  "your-example": {
    name: "Your Example Name",
    description: "Your description",
    contracts: ["YourContract.sol"],
    tests: ["YourContract.ts"],
    tags: ["tag1", "tag2"],
  },
};
```

3. **Run the automation**:
```bash
npx ts-node scripts/generate-docs.ts
npx ts-node scripts/create-example.ts your-example ./test-output
```

## Development Workflow

### Testing Documentation Generation

```bash
# Generate docs
npm run generate-docs

# Review output
cat docs/SUMMARY.md
cat docs/anonymous-cultural-crowdfunding.md
```

### Testing Example Creation

```bash
# Create example in test directory
npx ts-node scripts/create-example.ts anonymous-cultural-crowdfunding ./test-output

# Navigate and test
cd ./test-output
npm install
npm run compile
npm run test
```

### Cleanup

```bash
# Remove test output
rm -rf ./test-output

# Clean generated docs
rm -rf ./docs
```

## Best Practices

### Documentation Generation

1. **Use JSDoc Comments** - Add detailed comments to contracts and tests
2. **Mark Examples** - Use ✅ and ❌ to indicate correct/incorrect patterns
3. **Include Explanations** - Explain why something works or doesn't work
4. **Update Configuration** - Keep EXAMPLES_CONFIG in sync with files

### Example Creation

1. **Test Examples** - Always test generated examples before distribution
2. **Update Dependencies** - Ensure package.json has latest versions
3. **Include README** - Generated README should be comprehensive
4. **Add Tasks** - Include useful Hardhat tasks for the example

## Maintenance

### When FHEVM Library Updates

1. Update `@fhevm/solidity` version in package.json
2. Regenerate all examples to test compatibility
3. Update documentation if breaking changes occur
4. Run full test suite on generated examples

```bash
# Update and test workflow
npm install @fhevm/solidity@latest
npm run compile
npm run test
npm run generate-docs
npx ts-node scripts/create-example.ts anonymous-cultural-crowdfunding ./test
cd test && npm install && npm test
```

### Bulk Operations

```bash
# Regenerate all documentation
npm run generate-docs

# Test all examples
for example in anonymous-cultural-crowdfunding; do
  npx ts-node scripts/create-example.ts $example ./test-output/$example
  cd ./test-output/$example
  npm install && npm run compile && npm run test
  cd ../..
done
```

## Troubleshooting

### Documentation Not Generating

- Check that contract and test files exist at specified paths
- Verify EXAMPLES_CONFIG has correct file paths
- Ensure docs directory has write permissions

### Example Creation Fails

- Verify source files exist in contracts/ and test/
- Check that output directory is writable
- Ensure all referenced files in EXAMPLES_MAP exist

### Generated Example Won't Compile

- Check that package.json has correct dependencies
- Verify hardhat.config.ts matches template requirements
- Ensure all import paths are correct in copied files

## Script Dependencies

These scripts require:

- Node.js >= 20
- TypeScript >= 5.8
- ts-node for execution
- File system access for reading/writing

Install development dependencies:
```bash
npm install --save-dev @types/node ts-node typescript
```

## Contributing

When adding new automation scripts:

1. Follow existing script patterns
2. Add comprehensive error handling
3. Include --help flag with usage instructions
4. Update this README with script documentation
5. Test on Windows, macOS, and Linux

---

**Documentation Scripts for FHEVM Examples by Zama**
