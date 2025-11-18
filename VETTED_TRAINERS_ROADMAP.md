# Vetted Trainers - Product Roadmap

## Overview
Vetted Trainers is an all-in-one training business management platform designed to replace Vergaro, Google Sheets, and HubSpot with a fully customizable solution.

## Vision
Replace the current reliance on multiple platforms (Vergaro, Google Sheets, HubSpot) with one powerful, customizable system tailored specifically to the training business needs.

---

## Development Timeline - 2 Month MVP

### Sprint 1: Foundation (Weeks 1-2)
- Database schema design
- User authentication & role-based access
- Client/Trainer CRUD operations
- Basic admin panel

### Sprint 2: Booking Core (Weeks 3-4)
- Booking form & logic
- Calendar interface
- Trainer schedule management
- Booking conflict validation

### Sprint 3: Payments (Weeks 5-6)
- Stripe integration
- Membership tier setup
- Billing workflow
- Payment dashboard

### Sprint 4: Launch Prep (Weeks 7-8)
- Admin reporting
- Google Sheets import
- Bug fixes
- Deployment

---

## Development Phases

### Phase 1: MVP - Replace Vergaro (Months 1-2) 🚀
**Status:** In Progress

**Key Features:**
- User authentication & role-based access (admin, trainers, clients)
- Client database with profiles, memberships, and history
- Training session booking with 5-minute increments
- Trainer schedule and availability management
- Stripe payment integration for membership billing
- Basic admin dashboard with key metrics
- Google Sheets import for existing data migration

### Phase 2: Enhanced Operations (Months 3-4) ⚡
**Status:** Planned

**Key Features:**
- Smart waitlist system with auto-notifications
- Automated payroll calculation and processing
- Advanced reporting and analytics dashboard
- Multi-location coordination and management
- Email marketing tools for client communication
- Training resources library with workout visuals

### Phase 3: Client Engagement & Growth (Months 5-6) 📈
**Status:** Planned

**Key Features:**
- Custom workout and dietary plan builder
- AI-powered plan recommendations
- Client gamification (streaks, achievements, rewards)
- Incentive program management
- Automated marketing campaigns and sequences
- Advanced email automation replacing HubSpot

### Phase 4: Scale & Innovation (Months 6+) 🌟
**Status:** Planned

**Key Features:**
- Mobile apps (iOS & Android)
- Advanced business intelligence and forecasting
- Client self-service portal
- Integration marketplace (wearables, nutrition apps)
- White-label options for franchise expansion
- API for third-party integrations

---

## Platform Features

### 1. Client Booking Management 📅
- Flexible booking with 5-minute time increments
- Multiple location support
- Real-time availability display
- Automated booking confirmations
- Calendar sync (Google, Apple)
- Recurring session scheduling

### 2. Smart Waitlist System ⏳
- Automated client notifications when spots open
- Priority queue management
- Waitlist analytics and insights
- Maximize schedule utilization
- Time-sensitive acceptance windows

### 3. Trainer Schedule Management 🗓️
- Individual trainer calendars and availability
- Multi-location schedule coordination
- Time-off and vacation management
- Session capacity tracking
- Schedule conflict detection

### 4. Membership & Billing 💳
- Automated twice-monthly billing
- 6-month & 12-month membership packages
- Session-to-session (a la carte) options
- Flexible pricing structures
- Failed payment retry logic
- Payment plan options

### 5. Payroll Management 💰
- Automated trainer paycheck calculation
- Per-session pay tracking
- Employee records and HR management
- Detailed earnings reports
- Tax document generation
- Direct deposit integration

### 6. Training Resources Library 📚
- Workout exercise library with visuals
- Video demonstrations and form guides
- Easy resource creation and management
- Categorized by muscle group, difficulty, equipment
- Search and filter capabilities

### 7. Custom Plan Builder 🎯
- AI-assisted workout plan creation
- Personalized dietary plan builder
- Smart workout suggestions based on client data
- Template library for quick plan creation
- Drag-and-drop interface
- Progressive overload automation

### 8. Client Engagement & Incentives 🏆
- Streak tracking and progress milestones
- Custom achievement badges and goals
- Trainer-assigned challenges with rewards
- Incentive programs (discounts, spa packages, etc.)
- Leaderboards and friendly competition

### 9. Admin Portal & Team Management ⚙️
- Full-service business management dashboard
- Role-based access control (admin, trainer, client)
- Team member management and permissions
- Comprehensive analytics and reporting
- Revenue and retention tracking
- Trainer performance metrics

### 10. Email Marketing System 📧
- Easy-to-use email blast tool within admin portal
- Campaign builder with templates
- Segmented client lists for targeted campaigns
- Email analytics and engagement tracking
- Automated email sequences
- A/B testing capabilities

---

## Cost Analysis

### Vetted Trainers Platform Costs (Monthly)
- Hosting (Vercel Pro): $50
- Database (Neon Launch): $19
- Email Service (SendGrid/Resend): $15
- Payment Processing (Stripe): 2.9% + $0.30 per transaction

**Example at $15K/month, 200 sessions:**
- Total Monthly Cost: ~$579

### Current Stack Costs (Monthly)
- Vergaro Platform: $150
- HubSpot: $45
- Transaction Fees: 3.5% of revenue
- Manual Process Costs: Hidden

**Example at $15K/month:**
- Total Monthly Cost: ~$720

### Potential Savings
- Monthly: ~$140+
- Annual: ~$1,680+
- 5-Year: ~$8,400+
- Plus significant time savings from automation

---

## Success Criteria - MVP

Can you replace Vergaro's core functions?
- ✅ Book training sessions
- ✅ Manage client memberships
- ✅ Track trainer schedules
- ✅ Process payments
- ✅ View business dashboard
- ✅ Import existing data

---

## Technology Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Shadcn/UI Components

### Backend
- Next.js API Routes
- Prisma ORM
- Neon PostgreSQL Database

### Services & Integrations
- Stack Auth (Authentication)
- Stripe (Payments)
- SendGrid/Resend (Email)
- Vercel (Hosting)

### Development Tools
- Claude AI (Development Assistant)
- Git/GitHub (Version Control)
- Vercel Preview Deployments

---

## Migration Strategy

### Phase 1: Preparation
1. Export all data from Vergaro
2. Clean and organize Google Sheets data
3. Map data structure to new schema
4. Set up staging environment

### Phase 2: Parallel Running
1. Import historical data
2. Run both systems simultaneously
3. Test all workflows
4. Train staff on new platform

### Phase 3: Full Migration
1. Final data sync
2. Switch all operations to Vetted Trainers
3. Monitor for issues
4. Provide ongoing support

### Key Considerations
- High member loyalty base - must preserve relationships
- Zero data loss tolerance
- Minimal disruption to operations
- Staff training and onboarding

---

## Post-MVP Roadmap

### Month 3
- Smart waitlist system
- Automated payroll
- Enhanced reporting

### Months 4-5
- Email marketing tools
- Plan builder widget
- Resources library

### Months 6+
- Client gamification
- Advanced analytics
- Mobile apps
- White-label options

---

## Development Approach

### With Claude-Assisted Development
- **Speed**: 2-3x faster than traditional development
- **Code Quality**: Consistent patterns and best practices
- **Learning**: Junior dev gains experience rapidly
- **Cost**: ~60-70% lower than traditional agency

### Daily Development Process
1. 4-6 hours focused coding with Claude
2. Ship something every day
3. Weekly deployment to staging
4. Bi-weekly production releases

### Leveraging Existing Patterns
- Reuse gear-catalogue components
- Copy authentication patterns
- Adapt admin dashboard structure
- Utilize proven database schemas

---

## Risk Mitigation

### Technical Risks
- **Payment Integration**: Start simple, iterate
- **Data Migration**: Extensive testing in staging
- **Performance**: Monitor and optimize early

### Business Risks
- **User Adoption**: Gradual rollout with training
- **Data Security**: Follow best practices, regular audits
- **Platform Downtime**: Redundancy and monitoring

### Mitigation Strategies
- Start with MVP, iterate based on feedback
- Parallel running during transition
- Comprehensive testing before go-live
- Regular backups and disaster recovery plan

---

## Long-Term Vision

### Year 1
- Replace Vergaro completely
- Achieve feature parity + enhancements
- Onboard all trainers and clients
- Establish feedback loop

### Year 2
- Mobile apps launch
- Advanced features (AI, gamification)
- Expand to multiple locations
- Consider white-label opportunities

### Year 3+
- Platform for other training businesses
- Franchise/licensing model
- Integration marketplace
- Industry leadership position

---

*Last Updated: November 2025*
*Document Version: 1.0*

