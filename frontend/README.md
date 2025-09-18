
# Frontend - Speech-to-Text App 🎤✨

## 📖 Descrizione Generale

La cartella `frontend` contiene l'interfaccia utente dell'applicazione Speech-to-Text, sviluppata con **Next.js 15.4.5** e **React 19.1.0**. Il frontend offre un'esperienza moderna, intuitiva e responsiva per la trascrizione automatica e la **valutazione avanzata** delle performance dei modelli ASR.

## 🚀 Funzionalità Principali

### Core Features
- **Autenticazione**: Supporto per login tramite provider OAuth (Google, GitHub), gestione sicura delle sessioni utente e protezione delle rotte sensibili
- **Registrazione e upload audio**: Componenti dedicati per la registrazione audio direttamente dal browser e per l'upload di file audio locali
- **Chat di trascrizione**: Interfaccia conversazionale che consente agli utenti di inviare audio e ricevere trascrizioni, con visualizzazione cronologica dei messaggi
- **Gestione trascrizioni**: Salvataggio, visualizzazione e recupero delle trascrizioni associate a ciascun utente

### 📊 Sistema di Valutazione Avanzato
- **Dashboard Valutazioni**: Interfaccia completa per visualizzare e analizzare le performance dei modelli
- **Metriche WER/CER**: Calcolo e visualizzazione di Word Error Rate e Character Error Rate
- **Confronto Modelli**: Comparazione side-by-side tra trascrizioni dei modelli e ground truth
- **Visualizzazioni Interattive**: Grafici avanzati con Recharts per analisi delle performance
- **Cronologia Valutazioni**: Tracking completo delle valutazioni effettuate nel tempo

### UI/UX Features  
- **Sidebar e navigazione**: Layout dinamico con sidebar per la navigazione tra le diverse sezioni
- **UI avanzata**: Componenti personalizzati basati su Radix UI (Dialog, Chart, Table, Card, etc.)
- **Tema chiaro/scuro**: Sistema di theming completo con supporto per modalità light e dark
- **Responsive Design**: Interfaccia ottimizzata per desktop, tablet e mobile

## 🏗️ Architettura delle API Interne

Il frontend implementa un sistema di API interne robusto tramite Next.js App Router:

### Core APIs
- **`/api/auth/*`**: Gestione autenticazione e sessioni utente
- **`/api/chats/*`**: CRUD operazioni per chat e messaggi di trascrizione  
- **`/api/transcribe/*`**: Endpoint per elaborazione trascrizioni audio
- **`/api/wav2vec2/*`**: Integrazione specifica con modelli Wav2Vec2
- **`/api/whisper/*`**: Integrazione specifica con modelli Whisper

### 🔬 APIs di Valutazione
- **`/api/evaluations/*`**: Gestione completa del sistema di valutazione
  - `GET /api/evaluations` - Recupero cronologia valutazioni
  - `POST /api/evaluations` - Creazione nuove valutazioni
  - `DELETE /api/evaluations/[id]` - Eliminazione valutazioni
- **Backend Integration**: Comunicazione diretta con FastAPI per metriche WER/CER

### Vantaggi Architetturali
- **Sicurezza**: Logica di business e validazione lato server
- **Performance**: Caching automatico e ottimizzazioni Next.js
- **Scalabilità**: Separazione concerns e modularità API
- **Type Safety**: TypeScript end-to-end con validazione schema

## 📈 Sistema di Valutazione - Dettaglio Tecnico

### Componenti Chiave

#### 1. **Dashboard Valutazioni** (`/app/transcribe/evaluate/page.tsx`)
```typescript
// Main evaluation page con status checking e navigation
const EvaluatePage = () => {
  const { data: evaluations } = useEvaluations();
  return (
    <div className="space-y-6">
      <BackendStatusChecker />
      <EvaluateModelsPage />
      <EvaluationDashboard evaluations={evaluations} />
    </div>
  );
};
```

#### 2. **Comparison Dialog** (`components/evaluate/transcription-comparison-dialog.tsx`)
- **Side-by-side Comparison**: Visualizzazione affiancata trascrizione modello vs ground truth
- **Metrics Display**: WER, CER, tempo elaborazione in cards dedicate
- **Audio Download**: Possibilità di scaricare l'audio originale per verifica
- **Scrollable Layout**: Interfaccia ottimizzata per testi lunghi

#### 3. **Charts & Visualizations** (`components/evaluate/evaluation-chart.tsx`)
```typescript
// Grafici multipli con Recharts
const chartTypes = {
  line: <LineChart />,      // Trend temporali WER/CER
  bar: <BarChart />,        // Confronto tra modelli
  pie: <PieChart />,        // Distribuzione performance
  area: <AreaChart />       // Analisi cumulative
};
```

#### 4. **Results Table** (`components/evaluate/evaluation-table.tsx`)
- **Data Grid Completo**: Sorting, filtering, pagination
- **Action Buttons**: View details, comparison, delete operations  
- **Status Indicators**: Success/error states con colori semantici
- **Responsive**: Adattamento automatico a schermi piccoli

### Hooks Personalizzati

#### Data Management
```typescript
// useEvaluations - Gestione stato valutazioni
const useEvaluations = () => {
  return useQuery({
    queryKey: ['evaluations'],
    queryFn: () => fetch('/api/evaluations').then(res => res.json())
  });
};

// useMetrics - Calcolo metriche real-time  
const useMetrics = (reference: string, hypothesis: string) => {
  return useMemo(() => ({
    wer: calculateWER(reference, hypothesis),
    cer: calculateCER(reference, hypothesis)
  }), [reference, hypothesis]);
};
```

#### Backend Integration
```typescript
// useStartTranscription - Orchestrazione trascrizione + valutazione
const useStartTranscription = () => {
  return useMutation({
    mutationFn: async ({ audio, model, referenceText }) => {
      const response = await fetch(`/api/${model}/transcribe-with-metrics`, {
        method: 'POST',
        body: formData
      });
      return response.json();
    }
  });
};
```

## 🛠️ Stack Tecnologico

### Core Framework
- **Next.js 15.4.5**: App Router, Server Components, API Routes
- **React 19.1.0**: Latest features con Concurrent Mode
- **TypeScript**: Type safety completa su tutto il codebase

### UI & Styling  
- **Tailwind CSS**: Utility-first styling con design system
- **Radix UI**: Componenti accessibili e altamente personalizzabili
- **Lucide React**: Icon library moderna e consistente
- **next-themes**: Theme switching automatico con persistenza

### Data & State Management
- **TanStack Query**: Server state management con caching intelligente
- **Prisma**: ORM type-safe per database operations
- **Recharts**: Libreria charting basata su D3 per visualizzazioni avanzate

### Development Tools
- **ESLint**: Linting configurato per Next.js e TypeScript
- **Prettier**: Code formatting automatico
- **Husky**: Git hooks per quality assurance

## 📁 Struttura Componenti

```
components/
├── audio/                    # Audio recording & upload
│   ├── audio-recorder.tsx   # WebRTC recording component
│   └── audio-upload.tsx     # File upload with validation
├── auth/                    # Authentication flows  
│   ├── login-form.tsx      # Combined OAuth + credentials
│   ├── github-sign-in.tsx  # GitHub OAuth integration
│   └── google-sign-in.tsx  # Google OAuth integration
├── chat/                    # Conversation interface
│   ├── chat-page.tsx       # Main chat container
│   ├── chat-view.tsx       # Message display logic
│   └── transcription-message.tsx # Individual message component
├── evaluate/                # 🆕 Evaluation system components
│   ├── backend-status-checker.tsx    # Health monitoring
│   ├── evaluate-models-page.tsx      # Model testing interface  
│   ├── evaluation-chart.tsx          # Multiple chart types
│   ├── evaluation-dashboard.tsx      # Main dashboard
│   ├── evaluation-results.tsx        # Results summary
│   ├── evaluation-table.tsx          # Data table with actions
│   └── transcription-comparison-dialog.tsx # Side-by-side comparison
├── ui/                      # Base UI components (Radix-based)
└── layout/                  # App layout components
```

## 🔄 Flussi Applicativi

### Flusso Trascrizione Tradizionale
1. **Input**: Utente registra/carica audio via `AudioRecorder` o `AudioUpload`
2. **Processing**: File inviato a `/api/transcribe` → FastAPI backend
3. **Response**: Trascrizione salvata nel database e mostrata in chat
4. **Persistence**: Cronologia accessibile tramite sidebar

### 🆕 Flusso Valutazione Avanzato
1. **Setup**: Utente accede a `/transcribe/evaluate`
2. **Model Selection**: Scelta tra Wav2Vec2 (facebook/jonatas) e Whisper (tiny→large)
3. **Input Preparation**: Upload audio + inserimento reference text (ground truth)
4. **Batch Processing**: 
   ```typescript
   // Elaborazione parallela multipli modelli
   const evaluations = await Promise.all([
     evaluateModel('wav2vec2-facebook', audio, reference),
     evaluateModel('wav2vec2-jonatas', audio, reference), 
     evaluateModel('whisper-base', audio, reference)
   ]);
   ```
5. **Metrics Calculation**: Backend calcola WER/CER usando libreria `jiwer`
6. **Results Visualization**: 
   - Dashboard con overview metriche
   - Grafici temporali e comparativi
   - Tabella dettagliata con azioni
7. **Deep Analysis**: Dialog di confronto per analisi granulare

### Backend Status Monitoring
```typescript
// Real-time health checking
const checkBackendHealth = async () => {
  const health = await fetch('/api/health');
  return {
    status: health.ok ? 'online' : 'offline',
    models: health.data?.models || {},
    latency: performance.now() - startTime
  };
};
```

## 🔒 Sicurezza e Validazione

### Input Validation
```typescript
// Schema validation con Zod
const transcriptionSchema = z.object({
  audio: z.instanceof(File).refine(file => 
    ['audio/wav', 'audio/mp3', 'audio/m4a'].includes(file.type)
  ),
  referenceText: z.string().min(1).max(10000),
  model: z.enum(['wav2vec2', 'whisper'])
});
```

### Authentication Guards  
```typescript
// Route protection middleware
export const requireAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    return handler(req, res);
  };
};
```

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Tailwind responsive classes */
.evaluation-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}

.comparison-dialog {
  @apply w-full max-w-7xl mx-auto;
  @apply h-[80vh] max-h-[800px];
}
```

### Mobile Optimizations
- **Touch-friendly**: Buttons e interactive areas sized per touch
- **Swipe Navigation**: Gesture support per navigazione veloce  
- **Condensed Tables**: Auto-hiding columns su schermi piccoli
- **Bottom Sheets**: Dialog che si adattano a mobile layout

## 🚀 Performance & Ottimizzazioni

### Code Splitting
```typescript
// Dynamic imports per componenti pesanti
const EvaluationChart = dynamic(() => import('./evaluation-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Client-side only per charts
});
```

### Data Caching
```typescript
// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
});
```

### Image & Asset Optimization
- **Next.js Image**: Automatic optimization e lazy loading
- **SVG Icons**: Vector graphics per sharp display
- **Bundle Analysis**: Webpack bundle analyzer per size monitoring

## 🧪 Testing Strategy

### Component Testing (Recommended)
```typescript
// Jest + React Testing Library setup
describe('TranscriptionComparisonDialog', () => {
  it('should display WER and CER metrics', () => {
    render(<TranscriptionComparisonDialog {...mockProps} />);
    expect(screen.getByText('WER: 15.2%')).toBeInTheDocument();
    expect(screen.getByText('CER: 8.7%')).toBeInTheDocument();
  });
});
```

### E2E Testing (Suggested)
```typescript
// Playwright/Cypress testing flows
test('complete evaluation workflow', async ({ page }) => {
  await page.goto('/transcribe/evaluate');
  await page.click('[data-testid="upload-audio"]');
  await page.fill('[data-testid="reference-text"]', 'hello world');
  await page.click('[data-testid="start-evaluation"]');
  await expect(page.locator('.evaluation-results')).toBeVisible();
});
```

## 🔧 Configurazione e Setup

### Environment Variables
```env
# .env.local
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
DATABASE_URL="file:./dev.db"
BACKEND_API_URL=http://localhost:8000
```

### Development Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build
```

## 🔮 Roadmap e Miglioramenti Futuri

### Short-term Enhancements
- [ ] **Real-time Evaluation**: WebSocket per progress updates durante elaborazione
- [ ] **Batch Evaluation**: Upload multipli file per test automatizzati
- [ ] **Export Results**: CSV/PDF export per risultati valutazioni
- [ ] **Model Comparison**: Side-by-side comparison tra diversi modelli

### Long-term Vision  
- [ ] **Advanced Analytics**: Machine learning per pattern recognition
- [ ] **Team Collaboration**: Sharing e collaboration su evaluation sets
- [ ] **Custom Models**: Support per modelli custom tramite Hugging Face
- [ ] **API Documentation**: Interactive API docs con OpenAPI

## 🤝 Contribuire

### Development Guidelines
1. **TypeScript First**: Tutti i nuovi componenti devono essere tipizzati
2. **Component Composition**: Preferire composition over inheritance
3. **Accessibility**: Seguire WCAG guidelines per tutti i componenti UI
4. **Performance**: Analizzare bundle size per ogni nuovo feature

### Code Style
- **Naming**: PascalCase per componenti, camelCase per functions/variables
- **File Structure**: Un componente per file, colocazione di types correlati
- **Imports**: Absolute imports con @ alias, grouped e sorted

---

Il frontend rappresenta una **soluzione completa e moderna** per la trascrizione audio e valutazione ASR, combinando un'interfaccia utente intuitiva con funzionalità di analisi avanzate, architettura scalabile e performance ottimizzate. 🎯
