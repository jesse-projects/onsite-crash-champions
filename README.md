# OnSite Checklist System

Production-quality checklist management system for service tracking across multiple locations.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 16
- **Deployment:** Docker + Docker Compose + Traefik
- **Domain:** onsite.jesseprojects.com

## Project Structure

```
onsite-app/
├── backend/              # Node.js API server
│   ├── server.js        # Main API routes
│   ├── package.json
│   └── Dockerfile
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/       # Login, Checklist, Dashboard
│   │   ├── components/  # Header, shared components
│   │   ├── context/     # Theme context
│   │   ├── utils/       # API client
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── database/            # PostgreSQL schemas
│   ├── schema.sql       # Database structure
│   └── seed.sql         # Sample data
├── docker-compose.yml   # Container orchestration
└── .env                 # Environment variables
```

## Features

### Subcontractor Checklist Form (Public)
- Mobile-first responsive design
- Evergreen links (permanent URLs per location)
- Dynamic IVR loading based on active dates
- Photo upload with preview (minimum 3 required)
- Checklist validation before submission
- IVR expiration warnings
- Dark mode support

### Account Manager Dashboard (Protected)
- JWT authentication
- Real-time service statistics
- Service list with filtering/search
- Service detail modal with photos
- Status color-coding (completed/pending/overdue)
- Multi-account manager support

## Deployment

### Prerequisites

1. VPS with Docker and Docker Compose installed
2. Traefik reverse proxy running
3. DNS record: `onsite.jesseprojects.com` → VPS IP

### Steps

1. Copy project to VPS:
   ```bash
   scp -r onsite-app root@31.220.57.14:/opt/onsite
   ```

2. SSH into VPS and navigate to project:
   ```bash
   ssh root@31.220.57.14
   cd /opt/onsite
   ```

3. Start services:
   ```bash
   docker-compose up -d
   ```

4. Check logs:
   ```bash
   docker-compose logs -f
   ```

5. Access application:
   - Public checklist: `https://onsite.jesseprojects.com/checklist/CC-01005-ALAMEDA`
   - Dashboard login: `https://onsite.jesseprojects.com/login`

## Demo Credentials

**Account Manager Login:**
- Email: `jackie@onsitegroup.com`
- Password: `demo`

**Sample Checklist URLs:**
- `https://onsite.jesseprojects.com/checklist/CC-01005-ALAMEDA`
- `https://onsite.jesseprojects.com/checklist/CC-02015-SAN-JOSE`

## Database Schema

### Tables
- `checklists` - Multi-tenant checklist types
- `account_managers` - Account manager users
- `subcontractors` - Service providers
- `locations` - Service locations
- `ivrs` - ServiceChannel IVR tickets
- `services` - Service instances
- `checklist_submissions` - Completed checklists
- `photos` - Uploaded photos
- `billing_staging` - Billing export

### Human-Readable IDs
- LocationID: `CC-01005-ALAMEDA`
- ServiceID: `CC-01005-ALAMEDA_SUB-ACME-001_00001`
- IVRID: `IVR-CC-202602-CC-01005-ALAMEDA`

## API Endpoints

### Public (No Auth)
- `GET /api/checklist/:locationId` - Load checklist
- `POST /api/checklist/:locationId/submit` - Submit checklist

### Protected (Requires JWT)
- `POST /api/login` - Account manager login
- `GET /api/dashboard` - Dashboard data
- `GET /api/services/:serviceId` - Service details
- `GET /api/locations` - List locations

## Environment Variables

See `.env.example` for configuration template.

Required:
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (min 32 characters)

Optional (future):
- `SMTP_*` - Email configuration for notifications

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Maintenance

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart
```

### Database Backup
```bash
docker exec onsite-postgres pg_dump -U onsite onsite > backup.sql
```

### Update Application
```bash
git pull  # if using git
docker-compose down
docker-compose build
docker-compose up -d
```

## Architecture Notes

- **Evergreen Links:** Subcontractors use permanent URLs; IVR is dynamically loaded based on dates
- **Just-in-Time Service Creation:** New service records created when checklist is accessed
- **Multi-Tenant:** Designed to support multiple checklist types (Crash Champions is first)
- **Mobile-First:** Optimized for field workers on phones
- **Dark Mode:** System-wide theme support with localStorage persistence

## Demo for Monday (2026/01/20)

**Goals:**
- ✓ Working checklist submission with photos
- ✓ Account manager login and dashboard
- ✓ Service status tracking
- ✓ Mobile-responsive design
- ✓ Dark mode toggle
- ✓ Human-readable IDs

**Deferred (Post-Demo):**
- ServiceChannel email integration
- Azure Blob Storage for photos
- Billing WOMS API integration
- Advanced reporting
- Checklist management admin UI
