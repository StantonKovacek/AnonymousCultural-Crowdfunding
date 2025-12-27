#!/usr/bin/env node
/**
 * Create Category Project Script
 *
 * Generates Hardhat projects containing multiple related FHEVM examples
 * from a single category (e.g., basic, access-control, advanced).
 *
 * Perfect for learning multiple concepts in a cohesive way.
 *
 * Usage:
 *   npx ts-node scripts/create-fhevm-category.ts basic ./output
 *   npx ts-node scripts/create-fhevm-category.ts --list
 *   npx ts-node scripts/create-fhevm-category.ts --help
 */

import * as fs from "fs";
import * as path from "path";

interface CategoryConfig {
  name: string;
  description: string;
  contracts: string[];
  tests: string[];
  tags: string[];
}

const CATEGORIES: Record<string, CategoryConfig> = {
  basic: {
    name: "Basic FHE Examples",
    description: "Fundamental FHE operations and encryption patterns",
    contracts: [
      "EncryptSingleValue.sol",
      "EncryptMultipleValues.sol",
    ],
    tests: [
      "EncryptSingleValue.ts",
      "EncryptMultipleValues.ts",
    ],
    tags: ["encryption", "basic", "beginner"],
  },
  "access-control": {
    name: "Access Control Examples",
    description: "Privacy-preserving access control and permission patterns",
    contracts: [
      "AccessControl.sol",
    ],
    tests: [
      "AccessControl.ts",
    ],
    tags: ["access-control", "permissions", "intermediate"],
  },
  "anti-patterns": {
    name: "Anti-Patterns & Mistakes",
    description: "Common mistakes to avoid when using FHEVM",
    contracts: [
      "AntiPatterns.sol",
    ],
    tests: [],
    tags: ["anti-patterns", "security", "education"],
  },
  advanced: {
    name: "Advanced FHE Applications",
    description: "Production-ready FHEVM applications",
    contracts: [
      "AnonymousCulturalCrowdfunding.sol",
    ],
    tests: [
      "AnonymousCulturalCrowdfunding.ts",
    ],
    tags: ["advanced", "production", "applications"],
  },
};

function listCategories() {
  console.log("Available Categories:\n");
  for (const [key, config] of Object.entries(CATEGORIES)) {
    console.log(`  ${key}`);
    console.log(`    ${config.description}`);
    console.log(`    Examples: ${config.contracts.length}`);
    console.log(`    Tags: ${config.tags.join(", ")}\n`);
  }
}

function createCategory(categoryName: string, outputPath: string) {
  const config = CATEGORIES[categoryName];

  if (!config) {
    console.error(`Error: Category '${categoryName}' not found`);
    listCategories();
    process.exit(1);
  }

  console.log(`Creating category project: ${config.name}`);
  console.log(`Output path: ${outputPath}\n`);

  // Create directory structure
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

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
  for (const contract of config.contracts) {
    const sourcePath = path.join(
      __dirname,
      "..",
      "contracts",
      "examples",
      categoryName,
      contract,
    );

    // Try different locations
    const alternativeSource = path.join(
      __dirname,
      "..",
      "contracts",
      contract,
    );

    let copySource = sourcePath;
    if (!fs.existsSync(sourcePath) && fs.existsSync(alternativeSource)) {
      copySource = alternativeSource;
    }

    if (fs.existsSync(copySource)) {
      const destPath = path.join(outputPath, "contracts", contract);
      fs.copyFileSync(copySource, destPath);
      console.log(`  ✓ ${contract}`);
    } else {
      console.log(`  ⚠ ${contract} (not found)`);
    }
  }

  // Copy test files
  if (config.tests.length > 0) {
    console.log("\nCopying test files:");
    for (const test of config.tests) {
      const sourcePath = path.join(
        __dirname,
        "..",
        "test",
        "examples",
        categoryName,
        test,
      );

      // Try different locations
      const alternativeSource = path.join(
        __dirname,
        "..",
        "test",
        test,
      );

      let copySource = sourcePath;
      if (!fs.existsSync(sourcePath) && fs.existsSync(alternativeSource)) {
        copySource = alternativeSource;
      }

      if (fs.existsSync(copySource)) {
        const destPath = path.join(outputPath, "test", test);
        fs.copyFileSync(copySource, destPath);
        console.log(`  ✓ ${test}`);
      } else {
        console.log(`  ⚠ ${test} (not found)`);
      }
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
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✓ ${taskFile}`);
      }
    }
  }

  // Copy deployment script
  console.log("\nCopying deployment script:");
  const deploySource = path.join(__dirname, "..", "deploy", "deploy.ts");
  if (fs.existsSync(deploySource)) {
    fs.copyFileSync(deploySource, path.join(outputPath, "deploy", "deploy.ts"));
    console.log("  ✓ deploy.ts");
  }

  // Create category-specific README
  const readmeContent = `# ${config.name}

${config.description}

## Overview

This project contains ${config.contracts.length} example(s) focusing on:
${config.tags.map((tag) => `- ${tag}`).join("\n")}

## Examples Included

${config.contracts
  .map((contract, index) => {
    const testFile = config.tests[index];
    return `### ${contract.replace(".sol", "")}
- **Contract**: \`contracts/${contract}\`
- **Tests**: \`test/${testFile || "Not included"}\``;
  })
  .join("\n\n")}

## Quick Start

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Compile Contracts
\`\`\`bash
npm run compile
\`\`\`

### Run Tests
\`\`\`bash
npm run test
\`\`\`

### View Test Coverage
\`\`\`bash
npm run coverage
\`\`\`

## Learning Path

1. **Review Contracts** - Study the smart contract implementations
2. **Read Tests** - Tests demonstrate correct usage patterns
3. **Understand Comments** - Look for ✅ and ❌ markers
4. **Run Tests** - Execute and observe behavior
5. **Modify** - Try changing the code and rerunning tests

## Key Concepts

${config.tags
  .map((tag) => `- **${tag.charAt(0).toUpperCase() + tag.slice(1)}**`)
  .join("\n")}

## Available Commands

\`\`\`bash
# Compilation
npm run compile              # Compile all contracts
npm run clean               # Clean artifacts

# Testing
npm run test                # Run all tests
npm run test:sepolia        # Run tests on Sepolia
npm run coverage            # Generate coverage report

# Code Quality
npm run lint                # Lint code
npm run prettier:check      # Check formatting
npm run prettier:write      # Format code

# Deployment
npm run deploy:localhost    # Deploy locally
npm run deploy:sepolia      # Deploy to Sepolia

# Other
npm run chain               # Start local blockchain
npm run accounts            # Show accounts
\`\`\`

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org)
- [Zama Community](https://www.zama.ai/community)

## Support

- 💬 [Discord](https://discord.com/invite/zama)
- 📚 [Community Forum](https://www.zama.ai/community)
- 🐛 [GitHub Issues](https://github.com/zama-ai/fhevm)

---

**Built with ❤️ using FHEVM by Zama**
`;

  const readmePath = path.join(outputPath, "README.md");
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`\n✓ Created: README.md`);

  // Create category-specific documentation
  const docContent = `# ${config.name}

## Category Description

${config.description}

## Included Examples

${config.contracts
  .map((contract) => `- ${contract.replace(".sol", "")}`)
  .join("\n")}

## Learning Objectives

By studying this category, you will learn:

${config.tags
  .slice(0, 3)
  .map((tag) => `- ${tag}`)
  .join("\n")}

## Setup Instructions

1. Install dependencies: \`npm install\`
2. Compile contracts: \`npm run compile\`
3. Run tests: \`npm run test\`

## Next Steps

After completing this category:
- Review other categories
- Study the main Anonymous Cultural Crowdfunding example
- Review anti-patterns to understand what NOT to do

---

Generated for category: ${categoryName}
`;

  const docPath = path.join(outputPath, "docs", "README.md");
  fs.writeFileSync(docPath, docContent);
  console.log(`✓ Created: docs/README.md`);

  console.log(`\n✅ Category project created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${outputPath}`);
  console.log(`  npm install`);
  console.log(`  npm run compile`);
  console.log(`  npm run test`);
}

function showHelp() {
  console.log(`
Create Category Project

Create a Hardhat project containing multiple related FHEVM examples.

Usage:
  npx ts-node scripts/create-fhevm-category.ts <category> <output-path>
  npx ts-node scripts/create-fhevm-category.ts --list
  npx ts-node scripts/create-fhevm-category.ts --help

Examples:
  npx ts-node scripts/create-fhevm-category.ts basic ./my-project
  npx ts-node scripts/create-fhevm-category.ts access-control ./access-control-examples
  npx ts-node scripts/create-fhevm-category.ts advanced ./advanced-examples

Available Categories:
  - basic
  - access-control
  - anti-patterns
  - advanced

This script creates a complete Hardhat development environment
with all examples, tests, and documentation for a category.
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    showHelp();
    return;
  }

  if (args.includes("--list")) {
    listCategories();
    return;
  }

  if (args.length < 2) {
    console.error("Error: Missing arguments");
    showHelp();
    process.exit(1);
  }

  const [categoryName, outputPath] = args;
  createCategory(categoryName, outputPath);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
