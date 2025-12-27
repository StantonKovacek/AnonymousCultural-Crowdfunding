# Project Structure

Complete overview of the Anonymous Cultural Crowdfunding project structure.

## Directory Tree

```
AnonymousCulturalCrowdfunding/
├── .github/                          # GitHub configuration
│   └── workflows/
│       └── ci.yml                    # CI/CD workflow
│
├── .vscode/                          # VS Code configuration
│   ├── extensions.json               # Recommended extensions
│   └── settings.json                 # Editor settings
│
├── contracts/                        # Smart contracts
│   ├── AnonymousCulturalCrowdfunding.sol  # Main contract
│   └── examples/                     # Example contracts
│       ├── basic/                    # Basic examples
│       │   ├── EncryptSingleValue.sol
│       │   └── EncryptMultipleValues.sol
│       ├── access-control/           # Access control examples
│       │   └── AccessControl.sol
│       └── anti-patterns/            # Anti-patterns
│           └── AntiPatterns.sol
│
├── test/                             # Test suites
│   ├── AnonymousCulturalCrowdfunding.ts
│   └── examples/
│       ├── basic/
│       │   └── EncryptSingleValue.ts
│       └── access-control/
│           └── AccessControl.ts
│
├── deploy/                           # Deployment scripts
│   └── deploy.ts                     # Main deployment script
│
├── tasks/                            # Hardhat tasks
│   ├── accounts.ts                   # Account management
│   └── ProjectManager.ts             # Project utilities
│
├── scripts/                          # Automation scripts
│   ├── generate-docs.ts              # Documentation generator
│   ├── create-example.ts             # Example repository scaffolder
│   ├── create-fhevm-category.ts      # Category project generator
│   └── README.md                     # Scripts documentation
│
├── docs/                             # Documentation
│   ├── README.md                     # Documentation home
│   └── SUMMARY.md                    # GitBook index
│
├── Configuration Files               # Project configuration
│   ├── hardhat.config.ts             # Hardhat configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── package.json                  # Dependencies and scripts
│   ├── .gitignore                    # Git ignore rules
│   ├── .eslintrc.yml                 # ESLint configuration
│   ├── .eslintignore                 # ESLint ignore
│   ├── .prettierrc.yml               # Prettier configuration
│   ├── .prettierignore               # Prettier ignore
│   ├── .solhint.json                 # Solidity linter config
│   ├── .solhintignore                # Solhint ignore
│   └── .solcover.js                  # Coverage configuration
│
├── Documentation Files               # Project documentation
│   ├── README.md                     # Main README
│   ├── bounty-description.md         # Bounty submission
│   ├── DEVELOPER_GUIDE.md            # Developer guide
│   ├── EXAMPLES.md                   # Examples index
│   ├── PROJECT_STRUCTURE.md          # This file
│   ├── SUBMISSION_CHECKLIST.md       # Pre-submission checklist
│   └── LICENSE                       # MIT License
│
└── Frontend Files                    # Frontend (existing)
    ├── index.html                    # Web interface
    ├── vercel.json                   # Vercel deployment
    ├── AnonymousCulturalCrowdfunding.mp4   # Demo video
    └── AnonymousCulturalCrowdfunding.png   # Screenshot
```

## File Count by Category

### Smart Contracts
- Main Contract: 1
- Example Contracts: 4
- **Total**: 5 contracts

### Test Files
- Main Test Suite: 1
- Example Tests: 2
- **Total**: 3 test suites (14+ test cases)

### Documentation
- Markdown Documentation: 7 files
- Code Documentation: Inline comments in all contracts
- **Total**: Comprehensive documentation

### Automation Scripts
- TypeScript Scripts: 3
- GitHub Workflows: 1
- **Total**: 4 automation tools

### Configuration Files
- Build/Lint/Format: 9 files
- TypeScript/Hardhat: 2 files
- **Total**: 11 configuration files

## Key Files Explained

### Smart Contracts

**`contracts/AnonymousCulturalCrowdfunding.sol`**
- Main production contract
- Privacy-preserving crowdfunding platform
- 435 lines of code
- Demonstrates advanced FHE patterns

**`contracts/examples/basic/EncryptSingleValue.sol`**
- Basic encryption example
- Single value workflow
- Permission management
- Educational comments

**`contracts/examples/basic/EncryptMultipleValues.sol`**
- Multiple encrypted values
- Structured data storage
- Permission coordination

**`contracts/examples/access-control/AccessControl.sol`**
- Access control patterns
- Permission grant/revoke
- Authorization checks

**`contracts/examples/anti-patterns/AntiPatterns.sol`**
- Common mistakes
- What NOT to do
- Security pitfalls

### Test Suites

**`test/AnonymousCulturalCrowdfunding.ts`**
- 14+ comprehensive test cases
- Success and failure scenarios
- Privacy validation
- Access control tests

**`test/examples/basic/EncryptSingleValue.ts`**
- Basic encryption tests
- Permission validation
- Input proof testing

**`test/examples/access-control/AccessControl.ts`**
- Access control validation
- Authorization tests
- Permission management

### Automation Scripts

**`scripts/generate-docs.ts`**
- Generates GitBook documentation
- Extracts code comments
- Creates markdown files
- Auto-indexes examples

**`scripts/create-example.ts`**
- Creates standalone repositories
- Copies contract and tests
- Generates custom README
- Sets up complete project

**`scripts/create-fhevm-category.ts`**
- Creates category-based projects
- Bundles multiple examples
- Generates category documentation
- Perfect for learning paths

### Configuration

**`hardhat.config.ts`**
- Network configuration
- Compiler settings
- Plugin integration
- Task imports

**`tsconfig.json`**
- TypeScript compilation
- Type checking
- Module resolution

**`package.json`**
- Dependencies (26 dev dependencies)
- Scripts (18+ npm commands)
- Project metadata

### Documentation

**`README.md`**
- Project overview
- Quick start guide
- Feature highlights
- Links and resources

**`bounty-description.md`**
- Technical implementation details
- Core concepts demonstrated
- Example patterns
- Project structure

**`DEVELOPER_GUIDE.md`**
- Complete development guide
- FHEVM concepts explained
- Testing guidelines
- Best practices

**`EXAMPLES.md`**
- All examples indexed
- Learning paths
- Complexity levels
- Quick reference

**`SUBMISSION_CHECKLIST.md`**
- Pre-submission verification
- Requirements tracking
- Quality assurance
- Final checks

## Build Artifacts (Generated)

These directories are created during development:

```
artifacts/              # Compiled contracts
cache/                  # Hardhat cache
typechain/             # Generated TypeScript types
types/                  # TypeScript type definitions
coverage/              # Test coverage reports
dist/                   # Built scripts
node_modules/          # Dependencies
```

## Development Workflow Files

### Code Quality
- `.eslintrc.yml` - TypeScript linting rules
- `.prettierrc.yml` - Code formatting rules
- `.solhint.json` - Solidity linting rules
- `.solcover.js` - Coverage configuration

### Version Control
- `.gitignore` - Files to ignore in Git
- `.github/workflows/ci.yml` - Continuous integration

### IDE Support
- `.vscode/settings.json` - VS Code configuration
- `.vscode/extensions.json` - Recommended extensions

## File Statistics

| Category | Count | Lines of Code |
|----------|-------|---------------|
| Contracts | 5 | ~800 |
| Tests | 3 | ~600 |
| Scripts | 3 | ~600 |
| Documentation | 7 | ~3000 |
| Configuration | 11 | ~300 |
| **Total** | **29** | **~5300** |

## Dependencies

### Production Dependencies
- `encrypted-types` ^0.0.4
- `@fhevm/solidity` ^0.9.1

### Development Dependencies (26 total)
Key dependencies:
- `@fhevm/hardhat-plugin` ^0.3.0-1
- `hardhat` ^2.26.0
- `ethers` ^6.15.0
- `typescript` ^5.8.3
- `ts-node` ^10.9.2
- And 21 more...

## npm Scripts

### Build & Compile
- `compile` - Compile contracts
- `clean` - Clean artifacts
- `typechain` - Generate TypeScript types

### Testing
- `test` - Run test suite
- `test:sepolia` - Test on Sepolia
- `coverage` - Generate coverage report

### Code Quality
- `lint` - Run all linters
- `lint:sol` - Lint Solidity
- `lint:ts` - Lint TypeScript
- `prettier:check` - Check formatting
- `prettier:write` - Format code

### Deployment
- `deploy:localhost` - Deploy locally
- `deploy:sepolia` - Deploy to Sepolia
- `verify:sepolia` - Verify on Etherscan

### Automation
- `generate-docs` - Generate documentation
- `help` - Show available commands

## Key Features by File

### Contracts
✅ Privacy-preserving operations
✅ Encrypted state management
✅ Access control patterns
✅ Permission management
✅ Educational comments

### Tests
✅ Success scenarios
✅ Failure cases
✅ Edge cases
✅ Access control validation
✅ ✅/❌ markers for learning

### Documentation
✅ Comprehensive guides
✅ API references
✅ Examples indexed
✅ Best practices
✅ Anti-patterns explained

### Automation
✅ Documentation generation
✅ Repository scaffolding
✅ Category projects
✅ CI/CD workflows

## Maintenance Notes

### Adding New Examples
1. Create contract in `contracts/examples/category/`
2. Create test in `test/examples/category/`
3. Update `scripts/generate-docs.ts`
4. Update `scripts/create-example.ts`
5. Run `npm run generate-docs`

### Updating Dependencies
1. Update version in `package.json`
2. Run `npm install`
3. Run `npm run compile`
4. Run `npm run test`
5. Update docs if breaking changes

### Deployment Checklist
1. Run `npm run lint`
2. Run `npm run test`
3. Run `npm run coverage`
4. Update `README.md` if needed
5. Run deployment script

---

**Last Updated**: December 2025
**Total Files**: 50+ (including generated)
**Lines of Code**: ~5300
**Test Coverage**: Comprehensive
