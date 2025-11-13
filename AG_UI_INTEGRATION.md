# AG-UI Protocol Integration for Docapture

This document outlines the complete integration of the AG-UI (Agent User Interaction) protocol into the Docapture document processing platform.

## Overview

The AG-UI protocol provides a standardized way to communicate between frontend applications and AI agents, enabling real-time processing updates, event streaming, and enhanced user experiences.

## Architecture

### Backend Agents (`docextract-api/agents/`)

#### AbstractAgent
Base class that all agents extend, providing:
- Event emission and handling
- Progress tracking
- Error management
- Run lifecycle management

#### DocumentFieldExtractorAgent
- Extracts structured data from documents
- Supports template matching with confidence scoring
- Handles multiple document formats (PDF, images, Word docs)
- Provides real-time progress updates

#### DocumentSummarizerAgent
- Creates intelligent document summaries
- Supports multiple output formats (HTML, Markdown, Text)
- Custom summarization prompts
- Progress tracking for long documents

#### RFPCreatorAgent
- Generates Request for Proposal documents
- Custom section support
- Multiple output formats (Word, HTML, Text)
- Template-based generation

#### HttpAgent
- Handles HTTP requests and routes to appropriate agents
- CORS support
- Authentication validation
- Event streaming setup

### Frontend Integration (`docapture-ui/`)

#### AGUIClient (`lib/agui-client.ts`)
- Protocol-compliant client for frontend-backend communication
- Event streaming support
- Automatic reconnection handling
- Type-safe API methods

#### React Hooks (`hooks/useAGUI.ts`)
- `useAGUI`: Generic hook for any agent
- `useDocumentFieldExtractor`: Specialized for field extraction
- `useDocumentSummarizer`: Specialized for document summarization
- `useRFPCreator`: Specialized for RFP creation

#### Enhanced Components
- **DocumentCopilot**: Complete demo with real-time updates
- **ServiceCard**: Visual indicators for AG-UI services
- **Progress tracking**: Real-time progress bars and status updates

## Key Features

### Real-Time Updates
- Server-sent events (SSE) for live progress updates
- Event streaming with automatic reconnection
- Progress bars with percentage and status messages

### Event System
- `run_started`: Agent execution begins
- `progress`: Progress updates with percentage and message
- `content_chunk`: Streaming content delivery
- `run_finished`: Successful completion with results
- `run_error`: Error handling with detailed messages

### Enhanced User Experience
- Visual indicators for AG-UI enabled services
- Real-time progress tracking
- Event logs for debugging and transparency
- Error handling with user-friendly messages

## API Endpoints

### AG-UI Routes
- `POST /agui/field-extractor` - Document field extraction
- `POST /agui/document-summarizer` - Document summarization
- `POST /agui/rfp-creator` - RFP document creation
- `GET /agui-sse?runId={id}` - Server-sent events stream

### Authentication
All AG-UI endpoints require API key authentication:
```
Authorization: Bearer {api_key}
```

## Usage Examples

### Frontend - Field Extraction
```typescript
import { useDocumentFieldExtractor } from '@/hooks/useAGUI';

const MyComponent = () => {
  const { extractFields, isLoading, progress, result, error } = useDocumentFieldExtractor({
    onProgress: (progress, message) => {
      console.log(`${progress}% - ${message}`);
    },
    onComplete: (result) => {
      console.log('Extraction completed:', result);
    }
  });

  const handleExtract = async (file: File) => {
    await extractFields(file, {
      prompt: "Extract all key information",
      requiredFields: ["title", "date", "amount"]
    });
  };

  return (
    <div>
      {isLoading && <Progress value={progress} />}
      {error && <Alert>{error}</Alert>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};
```

### Backend - Custom Agent
```typescript
import { AbstractAgent, AgentEvent } from './AbstractAgent';

export class MyCustomAgent extends AbstractAgent {
  private eventHandler?: (event: AgentEvent) => void;

  constructor(eventHandler?: (event: AgentEvent) => void) {
    super();
    this.eventHandler = eventHandler;
  }

  protected async emitEvent(event: AgentEvent): Promise<void> {
    if (this.eventHandler) {
      this.eventHandler(event);
    }
  }

  async execute(input: any): Promise<any> {
    try {
      await this.emitRunStarted();
      await this.emitProgress(25, 'Processing input...');
      
      // Your processing logic here
      const result = await this.processData(input);
      
      await this.emitProgress(100, 'Completed successfully');
      await this.emitRunFinished(result);
      
      return result;
    } catch (error) {
      await this.emitRunError(error.message);
      throw error;
    }
  }
}
```

## Configuration

### Environment Variables
```bash
# Backend
GROQ_API_KEY=your_groq_api_key
API_KEY=your_api_key_for_authentication
MONGODB_URI=your_mongodb_connection_string

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=your_api_key
```

### Service Configuration
Services are automatically detected as AG-UI enabled if:
- Service ID matches: `field-extractor`, `document-summarizer`, `rfp-creator`
- Endpoint contains `/agui/` path
- Service metadata includes AG-UI flags

## Benefits

### For Developers
- **Standardized Protocol**: Consistent API across all agents
- **Type Safety**: Full TypeScript support with proper types
- **Event-Driven**: Real-time updates and progress tracking
- **Error Handling**: Comprehensive error management
- **Extensibility**: Easy to add new agents and capabilities

### For Users
- **Real-Time Feedback**: Live progress updates during processing
- **Better UX**: Visual indicators and status messages
- **Transparency**: Event logs show exactly what's happening
- **Reliability**: Automatic error handling and recovery

### For Business
- **Scalability**: Protocol supports multiple concurrent agents
- **Monitoring**: Event system enables comprehensive monitoring
- **Integration**: Easy to integrate with external systems
- **Future-Proof**: Protocol-based architecture supports evolution

## Migration Guide

### From Legacy API to AG-UI

1. **Update Service Calls**:
   ```typescript
   // Old
   const response = await apiService.processMultipleDocuments(serviceId, files, format);
   
   // New
   const response = await aguiClient.executeAgent(agentType, input, onEvent);
   ```

2. **Add Progress Tracking**:
   ```typescript
   const { executeAgent, isLoading, progress, result } = useAGUI({
     onProgress: (progress, message) => {
       // Update UI with progress
     }
   });
   ```

3. **Handle Events**:
   ```typescript
   const handleEvent = (event: AGUIEvent) => {
     switch (event.type) {
       case 'run_started':
         // Show loading state
         break;
       case 'progress':
         // Update progress bar
         break;
       case 'run_finished':
         // Show results
         break;
     }
   };
   ```

## Testing

### Backend Testing
```bash
# Test individual agents
bun test agents/

# Test AG-UI routes
bun test routes/agui.test.ts

# Integration tests
bun test integration/
```

### Frontend Testing
```bash
# Test AG-UI hooks
npm test hooks/useAGUI.test.tsx

# Test components
npm test components/document-copilot.test.tsx
```

## Monitoring and Debugging

### Event Logging
All events are logged with timestamps and run IDs for easy debugging:
```
[FieldExtractorAgent] Event: { type: 'run_started', runId: 'run_123', timestamp: 1234567890 }
[FieldExtractorAgent] Event: { type: 'progress', runId: 'run_123', data: { progress: 50, message: 'Processing...' } }
```

### Performance Metrics
- Processing time tracking
- Event emission frequency
- Error rates and types
- User interaction patterns

## Future Enhancements

1. **WebSocket Support**: Real-time bidirectional communication
2. **Agent Orchestration**: Multi-agent workflows
3. **Caching Layer**: Intelligent result caching
4. **Analytics Dashboard**: Real-time monitoring and metrics
5. **Custom Agents**: User-defined agent creation
6. **Batch Processing**: Multiple document processing
7. **Agent Marketplace**: Third-party agent integration

## Support

For questions or issues with the AG-UI integration:
- Check the event logs for detailed error information
- Review the agent execution flow in the browser dev tools
- Verify API key authentication and endpoint availability
- Test with the DocumentCopilot demo component

The AG-UI protocol integration provides a robust foundation for scalable, real-time document processing with enhanced user experiences and developer productivity.
