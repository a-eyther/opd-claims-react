# Claude Code Development Guide - OPD Claims React Application

## Overview
This is a React-based OPD (Outpatient Department) claims processing system built for healthcare insurance claim adjudication. The application provides a comprehensive workflow for digitizing, validating, and processing medical claims with document verification capabilities.

## Technology Stack
- **Frontend**: React 18 + Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: Custom Toast System

## Development Commands
```bash
npm run dev         # Start development server (default port: 5173)
npm run build       # Build for production
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

## Application Architecture

### Core Layout Structure
The application uses a two-section layout pattern:
- **Left Section (40%)**: Document viewer with zoom controls and static information panel
- **Right Section (60%)**: Main workflow tabs and data grids

### Key Workflow Tabs
1. **Digitization**: AI-extracted data verification and bill item management
2. **Clinical Validation**: Medical review with diagnosis/symptoms validation
3. **Review**: Final approval workflow with financial summaries

### State Management Pattern
The application uses Zustand stores located in `/src/store/`:
- `useEditorStore.js`: Main editing workflow state
- `useClaimsStore.js`: Claims list and navigation state

Key state concepts:
- `billItems`: Core claim line items with financial data
- `medicineItems`: Filtered medication items for validation
- `financialTotals`: Comprehensive financial calculations
- `isDirty`: Change tracking for unsaved modifications

### Component Architecture

#### Main Pages (`/src/pages/`)
- `ClaimEditorPage.jsx`: Primary claims editing interface
- `ClaimsListPage.jsx`: Claims dashboard and navigation
- `ClaimDetailsPage.jsx`: Read-only claim viewing

#### Key Component Categories

**Layout Components (`/src/components/layout/`)**
- `MainLayout.jsx`: Application shell with navigation
- Two-section responsive layout with collapsible panels

**Editor Components (`/src/components/editor/`)**
- `DigitizationTable.jsx`: AI-extracted data verification grid
- `ClinicalValidationTable.jsx`: Medical validation grid with preauth amounts
- `ReviewTable.jsx`: Final approval grid
- Financial summary components with "Total Amount" labeling

**Verification Components (`/src/components/verification/`)**
- `DocumentSelector.jsx`: Document navigation with invoice/prescription display
- `StaticInfoPanel.jsx`: Unified accordion for claim information
- Document viewer with zoom in/out controls only

### Data Flow Patterns

#### Mock Data Integration
- Primary data source: `/src/utils/mockData.js`
- Contains comprehensive test data for claims, documents, financial records
- Structured for realistic healthcare claim scenarios

#### Financial Calculations
The application tracks multiple financial totals:
- `totalExtractedAmount`: AI-processed amounts
- `totalRequestedAmount`: Claim submission amounts
- `totalAllowedAmount`: Pre-approved amounts
- `totalApprovedAmount`: Final approved amounts
- `finalExtractedAmount`: Post-manual-edit amounts

#### Document Management
Documents are categorized as:
- `invoice`: Medical invoices with item breakdowns
- `prescription`: Medication prescriptions with dosage info

### UI/UX Patterns

#### Unified Action Bar
Bottom action bar contains:
- Navigation controls (Back/Continue)
- Query Panel toggle
- Save Draft functionality
- Submit Decision button

#### Grid Consistency
All data grids include:
- Invoice dropdown for document association
- Preauth amount columns where applicable
- Consistent status indicators (relevant/irrelevant)
- Inline editing capabilities

#### Information Notes
Section-specific contextual help:
- Digitization: AI extraction guidance
- Clinical Validation: Medical review guidelines
- Review: Final approval criteria

### Key Business Logic

#### Claim Processing Workflow
1. **Digitization**: Verify AI-extracted bill items against documents
2. **Clinical Validation**: Review medical necessity and diagnosis coding
3. **Review**: Final financial approval and decision making

#### Lock/Unlock Mechanism
- Claims progress through locked states
- System rerun capability after manual corrections
- Unified "Save & Continue" progression

#### Query System
- Template-based query generation
- Document verification queries
- Clinical review queries

## Development Guidelines

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── editor/         # Claim editing components
│   ├── layout/         # Application layout
│   ├── verification/   # Document verification
│   └── notifications/  # Toast system
├── pages/              # Route-level components
├── store/              # Zustand state stores
├── utils/              # Mock data and utilities
└── styles/             # Global CSS
```

### State Management Best Practices
- Use `isDirty` flag for change tracking
- Calculate financial totals in pure functions
- Batch state updates for performance
- Maintain separation between UI state and business logic

### Component Patterns
- Functional components with hooks
- Conditional rendering for different claim states
- Responsive design with Tailwind classes
- Consistent error handling and loading states

### Common Development Tasks

#### Adding New Bill Item Fields
1. Update mock data structure in `mockData.js`
2. Add field to grid component (DigitizationTable, etc.)
3. Update Zustand store actions for field management
4. Add validation logic if needed

#### Modifying Financial Calculations
1. Update calculation functions in `useEditorStore.js`
2. Ensure all totals are properly rounded (Math.floor * 100 / 100)
3. Update UI display components
4. Test with various claim scenarios

#### Adding New Document Types
1. Extend document structure in mock data
2. Update DocumentSelector display logic
3. Add appropriate verification checklists
4. Update document viewer if needed

### Testing Considerations
- Mock data covers diverse claim scenarios
- Component testing should focus on state transitions
- Financial calculation accuracy is critical
- Document verification workflow completeness

### Performance Notes
- Large claim datasets may require virtualization
- Financial calculations happen frequently - optimize for performance
- Document viewing can be memory intensive with large PDFs
- State updates should be batched where possible

## Common Issues and Solutions

### Development Server
- Default port is 5173
- If port conflicts occur, kill existing processes: `pkill -f "vite"`
- HMR issues: restart dev server

### State Synchronization
- Financial totals auto-calculate on bill item changes
- Use `updateFinancialTotals()` after bulk operations
- Always set `isDirty: true` for user modifications

### Component Rendering
- Document viewer requires valid document selection
- Grid components handle empty data gracefully
- Loading states prevent premature rendering

This codebase represents a production-quality healthcare claims processing system with comprehensive business logic and user experience considerations.