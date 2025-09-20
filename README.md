# OceanEye - Ocean Safety & Emergency Management Platform

A modern, multi-page React 18 web application designed for coastal community safety and emergency management. OceanEye provides specialized dashboards for citizens, officials, and analysts with real-time monitoring, emergency response coordination, and comprehensive analytics.

## 🌊 Features

### Core Functionality
- **Multi-language Support**: English, Hindi, and Tamil with instant language switching
- **Role-based Access Control**: Separate dashboards for Citizens, Officials, and Analysts
- **Real-time Notifications**: Emergency alerts and system updates
- **Interactive Maps**: Leaflet integration with custom markers and overlays
- **Data Visualization**: Recharts integration with ocean-themed charts
- **Responsive Design**: Mobile-first approach with glassmorphism UI

### Citizen Features
- Safety alerts with color-coded severity levels
- Nearby shelter finder with real-time capacity
- Weather brief with interactive charts
- Incident reporting with photo upload
- Evacuation route planning
- Emergency contact directory

### Official Features
- Incident moderation and approval workflow
- Resource management and allocation
- Task assignment and team coordination
- Push zone alerts for targeted notifications
- Real-time incident mapping
- System status monitoring

### Analyst Features
- Trend analysis and predictive analytics
- Risk assessment and forecasting
- Advanced filtering and data export
- Performance metrics and insights
- Report generation (PDF/CSV)
- Confidence level indicators

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM with code splitting
- **Styling**: TailwindCSS with custom ocean theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Maps**: Leaflet with React-Leaflet
- **Internationalization**: react-i18next
- **Notifications**: react-toastify
- **Build Tool**: Vite
- **Package Manager**: npm

## 🎨 Design System

### Color Palette
- **Primary Navy**: #003366
- **Ocean Blue**: #1E90FF
- **Steel Blue**: #4682B4
- **Deep Teal**: #0E6D7A
- **Seafoam**: #9EDCE5
- **Foam White**: #F5FAFC
- **Danger Red**: #E53935
- **Safe Green**: #2E7D32
- **Warning Amber**: #F59E0B

### Typography
- **Primary Font**: Inter
- **Secondary Font**: Poppins
- **Fallback**: ui-sans-serif, system-ui

### UI Components
- Glassmorphism cards with backdrop blur
- Ocean-inspired gradients and wave patterns
- Custom button variants with hover effects
- Status badges with semantic colors
- Modal dialogs with smooth animations
- Interactive maps with custom markers

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oceaneye
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── app/
│   ├── routes.tsx          # Main routing configuration
│   └── guards/
│       └── RoleGuard.tsx   # Role-based access control
├── providers/
│   ├── I18nProvider.tsx    # Internationalization provider
│   ├── ThemeProvider.tsx   # Theme management
│   └── NotificationProvider.tsx # Notification system
├── components/
│   ├── Navbar.tsx          # Main navigation
│   ├── Footer.tsx          # Footer component
│   ├── Card.tsx            # Reusable card component
│   ├── Button.tsx          # Button variants
│   ├── Badge.tsx           # Status badges
│   ├── Modal.tsx           # Modal dialogs
│   ├── WaveBackground.tsx  # Animated wave backgrounds
│   ├── AlertsTicker.tsx    # Scrolling alerts
│   ├── MapView.tsx         # Interactive maps
│   └── Chart.tsx           # Data visualization
├── pages/
│   ├── Landing/            # Landing page
│   ├── Auth/               # Authentication pages
│   ├── Dashboard/          # Role-specific dashboards
│   │   ├── Citizen/        # Citizen dashboard
│   │   ├── Official/       # Official dashboard
│   │   └── Analyst/        # Analyst dashboard
│   └── Info/               # Information pages
├── i18n/
│   ├── index.ts            # i18n configuration
│   └── locales/            # Translation files
│       ├── en/             # English translations
│       ├── hi/             # Hindi translations
│       └── ta/             # Tamil translations
├── utils/
│   ├── roles.ts            # Role management
│   ├── notifications.ts    # Notification utilities
│   ├── map.ts              # Map utilities
│   └── charts.ts           # Chart utilities
├── mock/
│   └── data/               # Mock data files
└── styles/
    └── globals.css         # Global styles and Tailwind imports
```

## 🔐 Authentication & Roles

### Demo Credentials
- **Email**: Any valid email format
- **Password**: Any password (6+ characters)
- **Role**: Select from Citizen, Official, or Analyst

### Role Permissions

#### Citizen
- View safety alerts and weather data
- Find nearby shelters and evacuation routes
- Report incidents with photo upload
- Access emergency contacts

#### Official
- Moderate and approve incident reports
- Manage resource allocation
- Assign tasks to response teams
- Send targeted zone alerts
- Monitor system status

#### Analyst
- Analyze trends and patterns
- Generate predictive insights
- Export reports in multiple formats
- Filter data by region, severity, and timeline
- Access advanced analytics

## 🌐 Internationalization

The application supports three languages:
- **English (en)**: Default language
- **Hindi (hi)**: हिन्दी
- **Tamil (ta)**: தமிழ்

Language preferences are automatically detected and stored in localStorage.

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large touch targets and gestures
- **Progressive Enhancement**: Works without JavaScript

## ♿ Accessibility

- **WCAG AA Compliance**: High contrast ratios and focus indicators
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Clear focus states and logical tab order

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Signup with new account
- [ ] Role-based redirects
- [ ] Logout functionality

#### Navigation
- [ ] Language switching
- [ ] Mobile menu
- [ ] Role-based navigation
- [ ] Breadcrumb navigation

#### Dashboards
- [ ] Citizen dashboard features
- [ ] Official dashboard features
- [ ] Analyst dashboard features
- [ ] Data visualization
- [ ] Interactive maps

#### Responsiveness
- [ ] Mobile layout (320px+)
- [ ] Tablet layout (768px+)
- [ ] Desktop layout (1024px+)
- [ ] Touch interactions

#### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Focus indicators

## 🚀 Deployment

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=OceanEye
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.oceaneye.com
```

### Build Configuration
The application is configured for production builds with:
- Code splitting and lazy loading
- Tree shaking for smaller bundles
- Source maps for debugging
- Optimized assets

### Deployment Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **AWS S3**: Cloud storage with CloudFront
- **GitHub Pages**: Free hosting for open source

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for map data
- **Leaflet** for interactive maps
- **Recharts** for data visualization
- **TailwindCSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Community** for excellent documentation

## 📞 Support

For support and questions:
- **Email**: support@oceaneye.com
- **Documentation**: [docs.oceaneye.com](https://docs.oceaneye.com)
- **Issues**: [GitHub Issues](https://github.com/oceaneye/issues)

---

## About INCOIS

The Indian National Centre for Ocean Information Services (INCOIS), operating under the administrative control of the Ministry of Earth Sciences, provides ocean information and advisory services to support disaster risk reduction and ensure maritime safety for coastal stakeholders. Its early warning services cover hazards such as tsunamis, storm surges, high waves, swell surges, and coastal currents, enabling authorities and communities to make informed decisions during ocean-related emergencies.

## Background

India’s vast coastline is vulnerable to a range of ocean hazards such as tsunamis, storm surges, high waves, coastal currents, and abnormal sea behaviour. While agencies like INCOIS provide early warnings based on satellite data, sensors, and numerical models; real-time field reporting from citizens and local communities are often unavailable or delayed. Additionally, valuable insights from public discussions on social media during hazard events remain untapped, yet can be critical for understanding ground realities, public awareness, and the spread of information.

## Detailed Description

There is a need for a unified platform that enables citizens, coastal residents, volunteers, and disaster managers to report observations during hazardous ocean events (e.g., unusual tides, flooding, coastal damage, tsunami, swell surges, high waves, etc.) and to monitor public communication trends via social media.

This platform should:
• Allow citizens to submit geotagged reports, photos, or videos of observed ocean hazards via a mobile/web app.
• Support role-based access for citizens, officials, and analysts.
• Aggregate and visualize real-time crowdsourced data on a dynamic dashboard.
• Visualize all crowdsourced reports and social media indicators on an interactive map, with hotspots dynamically generated based on report density, keyword frequency, or verified incidents.
• Integrate social media feeds (e.g., Twitter, public Facebook posts, YouTube comments) and apply Text Classification/Natural Language Processing to extract hazard-related discussions and trends.
• Help emergency response agencies understand the scale, urgency, and sentiment of hazard events.
• Provide filters by location, event type, date, and source, enabling better situational awareness and faster validation of warning models.

## Expected Solution

An integrated software platform (mobile + web) with:
• User registration and reporting interface with media upload.
• Map-based dashboard showing live crowd reports and social media activity.
• Dynamic hotspot generation based on report volume or verified threat indicators.
• Backend database and API for data management and integration with early warning systems.
• NLP engine for detecting relevant hazard-related posts, keywords, and engagement metrics.
• Multilingual support for regional accessibility.
• Offline data collection capabilities (sync later), useful for remote coastal areas.

## 🧱 System Architecture (Proposed)

- Frontend (this repo): React + TypeScript, map visualizations (Leaflet), charts (Recharts), i18n, role-based dashboards.
- Mobile App (roadmap): React Native/Expo or PWA with background location capture and offline queue.
- Backend/API (roadmap): REST/GraphQL service for reports, moderation, analytics, and integrations.
- Data Ingestion (roadmap): Connectors for social media APIs and official feeds (including INCOIS feeds where available) + scheduler.
- Stream/NLP (roadmap): Workers for text classification, keyword extraction, language detection, sentiment; queue + datastore.
- Storage (roadmap): Time-series DB for metrics, object storage for media, relational DB for entities.

## 🧪 Data Model (Current + Proposed)

Current report schema (frontend, persisted in localStorage for demo):
- id (string)
- type (string) — ocean hazard type selected by the user
- description (string)
- location (string) — user-entered text or lat,lng
- lat, lng (number | optional)
- photoDataUrl (string | optional)
- status: pending | approved | rejected
- priority: low | medium | high | critical (officials can set for approved reports)
- reporterId (string)
- reporterName (string | optional)
- timestamp (ISO string)

Proposed API entities (roadmap): Users, Reports, Incidents, Alerts, Sources (social/citizen/official), NLP Findings, Hotspots, Media.

## 🗺️ Hotspot Generation (Planned Methods)
- Spatial grid/hexbin density (count-based) with thresholding and color scales.
- Kernel Density Estimation (KDE) for smoother spatial intensity maps.
- Weighted overlays combining report recency, verification, and social signal strength.
- Time-windowed aggregation (e.g., last 1h/6h/24h) and animation for temporal evolution.

## 🧠 Social Media & NLP (Roadmap)
- Source ingestion: Twitter/X (search/stream), public Facebook posts, YouTube comments.
- Multilingual processing: language detection, translation (where allowed), tokenization.
- Text classification: hazard detection for tsunamis, storm surges, high waves, swell surges, coastal currents, and abnormal sea behaviour.
- Topic/keyphrase extraction, geotag heuristics from text, entity linking (places, agencies).
- Sentiment/urgency scoring and credibility signals for triage.

## 🔌 Integrations
- Early Warning: Align with INCOIS advisories and other official feeds; display advisories alongside crowdsourced observations.
- Map Layers: Tide/storm layers, inundation models (where available), shelters/resources.
- Notifications: Role-aware push/email/SMS (via provider) for critical updates.

## 🔒 Privacy, Security, and Ethics
- PII minimization, opt-in geolocation, media redaction where needed.
- Rate limits, abuse/misinformation reporting, and moderation workflows.
- Data retention policies and consent; regional data residency considerations.
- Accessibility and inclusivity by default (multi-language, low-bandwidth modes).

## 📱 Offline & Remote-First (Roadmap)
- Local queue for reports with media; sync when connectivity resumes.
- Low-bandwidth imagery and map tiles; background retry and conflict resolution.

## 🧭 Current Implementation Highlights (This Repo)
- Role-based dashboards for Citizens, Officials, Analysts.
- Citizen: Ocean-only incident types (Tsunamis, Storm Surges, High Waves, Swell Surges, Coastal Currents, Others), media upload, and “Use Current Location”.
- Official: Moderation workflow, dedicated Approved Reports section, per-report Priority setting, instant approval notifications.
- Analyst: Analytics and charts (extensible to risk indicators).
- Live Feeds: Tsunami.gov and NWS alert integrations (extensible to INCOIS and social sources).
- Location-based NGO directory with “Use My Location” filtering.

## 🗺️ Suggested API (Roadmap)
- POST /reports, GET /reports, PATCH /reports/:id (status/priority), GET /hotspots
- GET /feeds/social, GET /feeds/official, GET /nlp/trends
- Auth: /auth/login, /auth/signup, /auth/refresh

## 🛣️ Roadmap (What’s Left to Align Fully with the Problem)
- Social media ingestion and multilingual NLP pipeline (topics, sentiment, geotagging).
- Backend services + database for durable storage and integrations.
- Hotspot generation service (grid/KDE) with map overlays and time windows.
- Mobile app or PWA offline-first mode with background geotagging and queued uploads.
- INCOIS feed integration and co-visualization with crowdsourced data; alert-to-observation linking.
- Verification tooling for officials (claiming/merging duplicates, provenance, credibility signals).
- External export + API for research/agency collaboration, plus audit logs.

---

Built with ❤️ for coastal communities worldwide 🌊
