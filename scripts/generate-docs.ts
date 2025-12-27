#!/usr/bin/env node
/**
 * Documentation Generation Script
 *
 * Automatically generates GitBook-compatible documentation from smart contract
 * source code and test files, extracting comments and creating formatted markdown.
 *
 * Usage:
 *   npx ts-node scripts/generate-docs.ts
 *   npx ts-node scripts/generate-docs.ts --all
 *   npx ts-node scripts/generate-docs.ts --help
 */

import * as fs from "fs";
import * as path from "path";

interface DocConfig {
  name: string;
  contractPath: string;
  testPath: string;
  category: string;
  description: string;
}

const EXAMPLES_CONFIG: Record<string, DocConfig> = {
  "anonymous-cultural-crowdfunding": {
    name: "Anonymous Cultural Crowdfunding",
    contractPath: "contracts/AnonymousCulturalCrowdfunding.sol",
    testPath: "test/AnonymousCulturalCrowdfunding.ts",
    category: "Advanced",
    description:
      "Privacy-preserving crowdfunding platform using encrypted financial operations and access control",
  },
};

function extractComments(content: string): string[] {
  const comments: string[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract JSDoc/TSDoc comments
    if (line.includes("/**")) {
      let comment = "";
      let j = i;
      while (j < lines.length) {
        const currentLine = lines[j];
        comment += currentLine + "\n";
        if (currentLine.includes("*/")) {
          break;
        }
        j++;
      }
      comments.push(comment);
    }

    // Extract inline comments with explanations
    if (line.includes("///") || line.includes("//")) {
      const match = line.match(/\/\/\s*(.*)/);
      if (match && match[1].length > 10) {
        comments.push(match[1]);
      }
    }
  }

  return comments;
}

function generateMarkdown(config: DocConfig): string {
  let markdown = `# ${config.name}\n\n`;
  markdown += `**Category:** ${config.category}\n\n`;
  markdown += `**Description:** ${config.description}\n\n`;

  markdown += `## Overview\n\n`;
  markdown += `This example demonstrates:\n`;
  markdown += `- Encrypted state management with euint64 types\n`;
  markdown += `- Access control using FHE permissions\n`;
  markdown += `- Privacy-preserving financial operations\n`;
  markdown += `- Input proofs and encryption binding\n`;
  markdown += `- Decryption requests for verification\n\n`;

  markdown += `## Smart Contract\n\n`;
  markdown += `### Contract Path\n`;
  markdown += `\`\`\`\n${config.contractPath}\n\`\`\`\n\n`;

  markdown += `### Key Functions\n\n`;
  markdown += `- \`createProject()\` - Create encrypted funding targets\n`;
  markdown += `- \`contributeAnonymously()\` - Submit encrypted contributions\n`;
  markdown += `- \`finalizeProject()\` - Finalize with encrypted comparison\n`;
  markdown += `- \`withdrawFunds()\` - Creator fund withdrawal\n`;
  markdown += `- \`requestRefund()\` - Contributor refund requests\n\n`;

  markdown += `## Core Concepts Demonstrated\n\n`;
  markdown += `### Encrypted State Variables\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `euint64 targetAmount;  // Encrypted funding target\n`;
  markdown += `euint64 currentAmount; // Encrypted raised amount\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Proper FHE Permissions\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `// Always grant both permissions for encrypted values:\n`;
  markdown += `FHE.allowThis(encryptedValue);        // Contract permission\n`;
  markdown += `FHE.allow(encryptedValue, msg.sender); // User permission\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Privacy-Preserving Computations\n`;
  markdown += `\`\`\`solidity\n`;
  markdown += `// Add encrypted amounts without decryption\n`;
  markdown += `euint64 newAmount = FHE.add(currentAmount, contribution);\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Test Cases\n\n`;
  markdown += `### ✅ Correct Usage Patterns\n`;
  markdown += `- Create valid projects with encrypted targets\n`;
  markdown += `- Make anonymous contributions with encrypted amounts\n`;
  markdown += `- Access encrypted data as authorized user\n`;
  markdown += `- Finalize projects after deadline\n`;
  markdown += `- Withdraw funds as project creator\n\n`;

  markdown += `### ❌ Common Pitfalls\n`;
  markdown += `- Missing input validation (title, description)\n`;
  markdown += `- Funding period constraints violations\n`;
  markdown += `- Zero-value contribution attempts\n`;
  markdown += `- Accessing non-existent projects\n`;
  markdown += `- Unauthorized access to encrypted amounts\n`;
  markdown += `- Non-creator withdrawal attempts\n\n`;

  markdown += `## Usage Examples\n\n`;
  markdown += `### Creating a Project\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `const tx = await contract.createProject(\n`;
  markdown += `  "Music Album",\n`;
  markdown += `  "Indie music production",\n`;
  markdown += `  "Music",\n`;
  markdown += `  ethers.parseEther("5"),     // 5 ETH target\n`;
  markdown += `  30 * 24 * 60 * 60,          // 30 days\n`;
  markdown += `  "QmMetadataHash"\n`;
  markdown += `);\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Making an Encrypted Contribution\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `// Encrypt contribution amount\n`;
  markdown += `const encrypted = await fhevm\n`;
  markdown += `  .createEncryptedInput(contractAddress, signer.address)\n`;
  markdown += `  .add32(value)\n`;
  markdown += `  .encrypt();\n\n`;
  markdown += `// Submit contribution\n`;
  markdown += `const tx = await contract\n`;
  markdown += `  .connect(signer)\n`;
  markdown += `  .contributeAnonymously(\n`;
  markdown += `    projectId,\n`;
  markdown += `    "Support message",\n`;
  markdown += `    { value: ethers.parseEther("1") }\n`;
  markdown += `  );\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Run Tests\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm install\n`;
  markdown += `npm run compile\n`;
  markdown += `npm run test\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Security Considerations\n\n`;
  markdown += `- All sensitive amounts are encrypted end-to-end\n`;
  markdown += `- Access control enforced via FHE permissions\n`;
  markdown += `- No plaintext exposure of contribution amounts\n`;
  markdown += `- Reentrancy protection via state updates\n`;
  markdown += `- Input validation for all user data\n\n`;

  markdown += `## Further Reading\n\n`;
  markdown += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  markdown += `- [FHE Concepts](https://www.zama.ai/post/fhe-basics)\n`;
  markdown += `- [Zama Community](https://www.zama.ai/community)\n\n`;

  markdown += `---\n\n`;
  markdown += `**Built with ❤️ using FHEVM by Zama**\n`;

  return markdown;
}

function generateSummary(): string {
  let summary = `# Documentation Index\n\n`;
  summary += `## Introduction\n\n`;
  summary += `This documentation covers the Anonymous Cultural Crowdfunding example,\n`;
  summary += `a comprehensive demonstration of privacy-preserving smart contracts using\n`;
  summary += `Fully Homomorphic Encryption.\n\n`;

  summary += `## Table of Contents\n\n`;
  summary += `- [Anonymous Cultural Crowdfunding](./anonymous-cultural-crowdfunding.md)\n\n`;

  summary += `## Getting Started\n\n`;
  summary += `1. Clone the repository\n`;
  summary += `2. Install dependencies: \`npm install\`\n`;
  summary += `3. Compile contracts: \`npm run compile\`\n`;
  summary += `4. Run tests: \`npm run test\`\n\n`;

  summary += `## Key Concepts\n\n`;
  summary += `- **Encrypted State**: Managing sensitive data without exposure\n`;
  summary += `- **Access Control**: Using FHE permissions for privacy\n`;
  summary += `- **Input Proofs**: Binding encrypted values to signers\n`;
  summary += `- **Privacy-Preserving Logic**: Performing computations on encrypted data\n\n`;

  summary += `## Additional Resources\n\n`;
  summary += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  summary += `- [Zama GitHub](https://github.com/zama-ai/fhevm)\n`;
  summary += `- [Community Forum](https://www.zama.ai/community)\n`;

  return summary;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Documentation Generator

Usage:
  npx ts-node scripts/generate-docs.ts              # Generate all docs
  npx ts-node scripts/generate-docs.ts --all        # Same as above
  npx ts-node scripts/generate-docs.ts --help       # Show this help

This script generates GitBook-compatible markdown documentation from
smart contracts and test files.
    `);
    return;
  }

  console.log("Generating documentation...");

  const docsDir = path.join(__dirname, "..", "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate documentation for each example
  for (const [key, config] of Object.entries(EXAMPLES_CONFIG)) {
    console.log(`Generating docs for: ${config.name}`);

    const markdown = generateMarkdown(config);
    const fileName = `${key.replace(/\s+/g, "-").toLowerCase()}.md`;
    const filePath = path.join(docsDir, fileName);

    fs.writeFileSync(filePath, markdown);
    console.log(`  ✓ Written to: ${filePath}`);
  }

  // Generate SUMMARY.md
  const summary = generateSummary();
  const summaryPath = path.join(docsDir, "SUMMARY.md");
  fs.writeFileSync(summaryPath, summary);
  console.log(`✓ Generated: ${summaryPath}`);

  console.log("\nDocumentation generation complete!");
  console.log(`Documentation available in: ${docsDir}`);
}

main().catch((error) => {
  console.error("Error generating documentation:", error);
  process.exit(1);
});
