# Vetted Trainers - Business Requirements

## Overview
Vetted Trainers is a custom training business management platform designed to replace the current reliance on Vergaro, Google Sheets, and HubSpot. The platform will provide a fully customizable, all-in-one solution tailored to the specific needs of the training business.

## Current Platform Stack (To Be Replaced)
- **Vergaro**: Primary business management platform
- **Google Sheets**: Database for price per session, client visits, trainer sessions, paychecks, emails
- **HubSpot**: Email marketing and business transaction emails

## Core Requirements

### 1. Database Management
- **Google Sheets Import**: Tool to transfer existing database from Google Sheets
  - Client information
  - Price per session tracking
  - Client visit history
  - Trainer individual sessions
  - Paycheck records
  - Email lists
- **Data Migration from Vergaro**: Seamless transition from current platform
- **Client Database**: Comprehensive client profile management
  - Contact information
  - Membership details
  - Session history
  - Payment records

### 2. Membership Management
- **Billing Automation**: Automatic billing twice per month
- **Membership Tiers**:
  - 1-year memberships
  - 6-month memberships
  - Session-to-session (pay-as-you-go)
- **Customizable Pricing**: Flexible pricing structures per client/membership type

### 3. Training Session Management
- **Booking System**: Schedule and manage training sessions
- **Session Types**:
  - 1-on-1 training
  - Group sessions
  - Virtual training
- **Trainer Scheduling**: Manage trainer availability and calendar
- **Client Visit Tracking**: Monitor attendance and session completion
- **Customization**: Tailored to specific business workflows (not generic like Vergaro)

### 4. Admin Management
- **Trainer Management**:
  - Profile and credentials
  - Schedule and availability
  - Performance tracking
  - Individual session logs
- **Payroll System**:
  - Automated paycheck calculation
  - Track trainer earnings per session
  - Employee details and HR information
  - Payment history and reporting
- **Business Dashboard**:
  - Revenue analytics
  - Client retention metrics
  - Trainer performance overview
  - Financial reporting

### 5. Email System
- **Replace HubSpot**: Full email automation within the platform
- **Marketing Automation**:
  - Automated campaign sequences
  - Client engagement emails
  - Promotional campaigns
- **Transactional Emails**:
  - Booking confirmations
  - Payment receipts
  - Session reminders
  - Membership renewals
- **Email Templates**: Customizable templates for various business needs
- **Analytics**: Track email engagement and effectiveness

### 6. Migration Strategy
- **Key Concern**: High base of member loyalty - must preserve client relationships
- **Testing Environment**: 
  - Staging environment to test migration before going live
  - Parallel running capability during transition period
- **Data Integrity**: Ensure all historical data is accurately transferred
- **User Training**: Support for staff to learn new system
- **Troubleshooting**: Built-in support and issue resolution during migration

## Success Criteria
1. **Zero Data Loss**: All existing client, trainer, and financial data successfully migrated
2. **Platform Consolidation**: Eliminate need for Vergaro, separate Google Sheets, and HubSpot
3. **Customization**: System adapts to business workflows, not vice versa
4. **Client Retention**: Smooth transition that maintains all existing client relationships
5. **Automation**: Reduce manual data entry and administrative overhead
6. **Scalability**: Platform can grow with the business

## Development Phases

### Phase 1: Migration & Database Foundation (Q1 2026)
- Google Sheets import functionality
- Vergaro data migration tools
- Core database setup
- User authentication and roles
- Testing environment

### Phase 2: Session & Membership Management (Q2 2026)
- Booking and scheduling system
- Membership tier configuration
- Automated twice-monthly billing
- Session tracking and history
- Trainer schedule management

### Phase 3: Admin & Payroll System (Q3 2026)
- Paycheck calculation and processing
- Price per session tracking
- Employee management
- Financial reporting and analytics
- Admin dashboard

### Phase 4: Email Automation & Marketing (Q4 2026)
- Integrated email system
- Marketing campaign automation
- Transactional email templates
- Communication workflows
- Analytics and tracking

## Technical Considerations
- **Data Security**: Secure handling of client and financial information
- **Payment Processing**: Integration with payment gateways for membership billing
- **Scalability**: Architecture that supports business growth
- **Mobile Responsive**: Accessible on all devices
- **Backup & Recovery**: Regular backups and disaster recovery plan
- **Compliance**: GDPR/privacy compliance for client data

## Future Enhancements (Post-Launch)
- Mobile apps (iOS/Android)
- AI-powered insights and recommendations
- Advanced analytics and business intelligence
- Integration with other fitness tools/wearables
- Client self-service portal
- Advanced reporting and custom reports

