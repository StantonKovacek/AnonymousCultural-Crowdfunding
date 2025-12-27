#!/usr/bin/env node
/**
 * Create Example Repository Script
 *
 * Generates standalone FHEVM example repositories that can be cloned and
 * used independently. Each generated repository includes:
 * - Base Hardhat template configuration
 * - Smart contract files
 * - Test files
 * - Deployment scripts
 * - Documentation
 * - README with setup instructions
 *
 * Usage:
 *   npx ts-node scripts/create-example.ts anonymous-cultural-crowdfunding ./output
 *   npx ts-node scripts/create-example.ts --list
 *   npx ts-node scripts/create-example.ts --help
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ExampleTemplate {
  name: string;
  description: string;
  contracts: string[];
  tests: string[];
  tags: string[];
}

const EXAMPLES_MAP: Record<string, ExampleTemplate> = {
  "anonymous-cultural-crowdfunding": {
    name: "Anonymous Cultural Crowdfunding",
    description:
      "Privacy-preserving crowdfunding platform using encrypted financial operations",
    contracts: ["AnonymousCulturalCrowdfunding.sol"],
    tests: ["AnonymousCulturalCrowdfunding.ts"],
    tags: ["privacy", "crowdfunding", "access-control", "encrypted-finance"],
  },
};

function listExamples() {
  console.log("Available Examples:\n");
  for (const [key, template] of Object.entries(EXAMPLES_MAP)) {
    console.log(`  ${key}`);
    console.log(`    ${template.description}`);
    console.log(`    Tags: ${template.tags.join(", ")}\n`);
  }
}

function createExample(exampleName: string, outputPath: string) {
  const template = EXAMPLES_MAP[exampleName];

  if (!template) {
    console.error(`Error: Example '${exampleName}' not found`);
    listExamples();
    process.exit(1);
  }

  console.log(`Creating example: ${template.name}`);
  console.log(`Output path: ${outputPath}\n`);

  // Create output directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Create directory structure
  const dirs = [
    "contracts",
    "test",
    "deploy",
    "tasks",
    "scripts",
    "docs",
  ];

  for (const dir of dirs) {
    const dirPath = path.join(outputPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dir}/`);
    }
  }

  // Copy contract files
  console.log("\nCopying contract files:");
  for (const contract of template.contracts) {
    const sourcePath = path.join(
      __dirname,
      "..",
      "contracts",
      contract,
    );
    const destPath = path.join(outputPath, "contracts", contract);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ ${contract}`);
    }
  }

  // Copy test files
  console.log("\nCopying test files:");
  for (const test of template.tests) {
    const sourcePath = path.join(__dirname, "..", "test", test);
    const destPath = path.join(outputPath, "test", test);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ ${test}`);
    }
  }

  // Copy configuration files
  console.log("\nCopying configuration files:");
  const configFiles = [
    "hardhat.config.ts",
    "tsconfig.json",
    "package.json",
    ".gitignore",
  ];

  for (const file of configFiles) {
    const sourcePath = path.join(__dirname, "..", file);
    const destPath = path.join(outputPath, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ ${file}`);
    }
  }

  // Copy tasks
  console.log("\nCopying task files:");
  const tasksDir = path.join(__dirname, "..", "tasks");
  if (fs.existsSync(tasksDir)) {
    const taskFiles = fs.readdirSync(tasksDir);
    for (const taskFile of taskFiles) {
      const sourcePath = path.join(tasksDir, taskFile);
      const destPath = path.join(outputPath, "tasks", taskFile);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ ${taskFile}`);
    }
  }

  // Copy deployment script
  console.log("\nCopying deployment script:");
  const deploySource = path.join(__dirname, "..", "deploy", "deploy.ts");
  if (fs.existsSync(deploySource)) {
    fs.copyFileSync(deploySource, path.join(outputPath, "deploy", "deploy.ts"));
    console.log("  ✓ deploy.ts");
  }

  // Create README for standalone repository
  const readmeContent = `# ${template.name}

${template.description}

## Quick Start

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Compile Smart Contracts

\`\`\`bash
npm run compile
\`\`\`

### Run Tests

\`\`\`bash
npm run test
\`\`\`

## Features

- Privacy-preserving smart contracts using FHEVM
- Comprehensive test suite
- Hardhat development environment
- TypeScript support
- Automated deployment scripts

## Available Commands

\`\`\`bash
# Compilation
npm run compile        # Compile smart contracts
npm run clean          # Clean artifacts

# Testing
npm run test           # Run test suite
npm run test:sepolia   # Run tests on Sepolia testnet
npm run coverage       # Generate coverage report

# Code Quality
npm run lint           # Run linter
npm run prettier:check # Check code formatting
npm run prettier:write # Format code

# Deployment
npm run deploy:localhost  # Deploy to local network
npm run deploy:sepolia    # Deploy to Sepolia testnet
npm run verify:sepolia    # Verify on Etherscan

# Utility
npm run chain          # Start local blockchain
npm run accounts       # Display available accounts
npm run generate-docs  # Generate documentation
\`\`\`

## Network Configuration

Configure your deployment network in \`hardhat.config.ts\`:

- **hardhat**: Local hardhat network (default)
- **localhost**: Local blockchain running on port 8545
- **sepolia**: Sepolia testnet

## Environment Variables

Create a \`.env\` file with your settings:

\`\`\`
MNEMONIC="your seed phrase here"
INFURA_API_KEY="your infura key"
ETHERSCAN_API_KEY="your etherscan api key"
\`\`\`

## Smart Contract Architecture

### Core Contracts

- **${template.contracts.join(", ")}** - Main contract implementation

### Key Features

${template.tags.map((tag) => `- ${tag}`).join("\n")}

## Testing Strategy

The test suite covers:

- ✅ Correct usage patterns
- ❌ Common pitfalls and validation
- Edge cases and error conditions
- Privacy and access control scenarios
- Full transaction workflows

## Deployment

### Local Deployment

\`\`\`bash
# Terminal 1: Start blockchain
npm run chain

# Terminal 2: Deploy
npm run deploy:localhost
\`\`\`

### Sepolia Deployment

\`\`\`bash
npm run deploy:sepolia
npm run verify:sepolia
\`\`\`

## Development Workflow

1. **Write Code** - Edit contracts in \`contracts/\`
2. **Compile** - Run \`npm run compile\`
3. **Test** - Run \`npm run test\`
4. **Verify** - Check coverage with \`npm run coverage\`
5. **Deploy** - Deploy to network with \`npm run deploy:<network>\`

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Zama Community](https://www.zama.ai/community)

## Troubleshooting

### Compilation Issues

\`\`\`bash
npm run clean
npm run compile
\`\`\`

### Test Failures

Ensure you're running tests against the FHEVM mock:

\`\`\`bash
npm run test  # Uses hardhat network by default
\`\`\`

## Support

For issues and questions:
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community Forum](https://www.zama.ai/community)
- [GitHub Issues](https://github.com/zama-ai/fhevm)

## License

MIT - See LICENSE file for details

---

**Built with ❤️ using FHEVM by Zama**
`;

  const readmePath = path.join(outputPath, "README.md");
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`\n✓ Created: README.md`);

  console.log(`\n✅ Example repository created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${outputPath}`);
  console.log(`  npm install`);
  console.log(`  npm run compile`);
  console.log(`  npm run test`);
}

function showHelp() {
  console.log(`
Create Example Repository

Usage:
  npx ts-node scripts/create-example.ts <example-name> <output-path>
  npx ts-node scripts/create-example.ts --list
  npx ts-node scripts/create-example.ts --help

Examples:
  npx ts-node scripts/create-example.ts anonymous-cultural-crowdfunding ./my-example
  npx ts-node scripts/create-example.ts --list

This script generates standalone repositories for FHEVM examples
that can be used independently for learning and development.
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    showHelp();
    return;
  }

  if (args.includes("--list")) {
    listExamples();
    return;
  }

  if (args.length < 2) {
    console.error("Error: Missing arguments");
    showHelp();
    process.exit(1);
  }

  const [exampleName, outputPath] = args;
  createExample(exampleName, outputPath);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
