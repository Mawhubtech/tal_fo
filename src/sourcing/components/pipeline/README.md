# Sourcing Pipeline Components

This directory contains specialized pipeline view components for the sourcing module.

## Components

### SourcingKanbanView
- **Purpose**: Displays sourcing prospects in a kanban-style board view
- **Features**: 
  - Drag & drop functionality for moving prospects between stages
  - Optimistic updates with error handling
  - Mobile-responsive layout
  - Dual rating display with half-star support (candidate + prospect ratings)

### SourcingListView  
- **Purpose**: Displays sourcing prospects in a table/list view
- **Features**:
  - Sortable columns
  - Inline stage editing
  - Dual rating display with half-star support (candidate + prospect ratings)
  - Actions for removing prospects
  - Responsive table design

### DraggableSourcingCandidateCard
- **Purpose**: Displays individual candidate cards within the kanban view
- **Features**:
  - Dual rating system (candidate rating in yellow, prospect rating in purple)
  - Half-star support for decimal ratings
  - Drag & drop functionality
  - Contact information display
  - Skills/tags display

### SourcingDraggableStageColumn
- **Purpose**: Stage columns for the kanban view
- **Features**:
  - Drop zone for candidate cards
  - Uses sourcing-specific candidate cards
  - Stage-specific styling and counts

## Key Differences from Recruitment Pipeline Components

1. **Dual Rating Display**: 
   - **Candidate Rating**: Yellow stars showing overall candidate rating from database
   - **Prospect Rating**: Purple stars showing pipeline-specific rating
   - Both support half-star display for decimal values
2. **Terminology**: Uses "Prospect" instead of "Candidate" in headers and labels
3. **Source Display**: Enhanced source display with colored badges
4. **Rating System**: Implements half-star support for decimal prospect ratings
5. **Context**: Focused on sourcing/outreach workflow rather than job application workflow

## Rating System

The sourcing pipeline implements a dual rating system:

- **Candidate Rating (Yellow Stars)**: Overall rating of the candidate from the database
- **Prospect Rating (Purple Stars)**: Pipeline-specific rating for this sourcing effort

Both ratings support half-star display (e.g., 3.5 stars) and are visually distinct by color.

## Usage

```tsx
import { SourcingKanbanView, SourcingListView } from '../components/pipeline';

// Kanban view
<SourcingKanbanView
  candidates={sourcingCandidates}
  pipeline={activePipeline}
  onCandidateClick={handleCandidateClick}
  onCandidateStageChange={handleCandidateStageChange}
  onCandidateRemove={handleCandidateRemove}
/>

// List view
<SourcingListView
  candidates={sourcingCandidates}
  pipeline={activePipeline}
  onCandidateClick={handleCandidateClick}
  onCandidateStageChange={handleCandidateStageChange}
  onCandidateRemove={handleCandidateRemove}
/>
```

## Data Interface

Both components expect `SourcingCandidate` objects with the following structure:

```tsx
interface SourcingCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  stage: string;           // Current pipeline stage
  score: number;           // Prospect rating (supports decimals)
  lastUpdated: string;
  tags: string[];          // Skills, source, etc.
  source: string;          // Sourcing origin
  appliedDate: string;     // Date added to pipeline
}
```
