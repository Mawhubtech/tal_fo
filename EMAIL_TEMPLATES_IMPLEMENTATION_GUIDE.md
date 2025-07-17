# Project Email Templates & Communications System

This implementation provides a comprehensive email template and campaign management system for sourcing projects. It includes automated email communications, template management, and campaign analytics.

## Features

### 🎯 **Email Template Management**
- **Template Library**: Browse and manage reusable email templates
- **Template Categories**: Organized by type (outreach, follow-up, interview, etc.)
- **Variable System**: Dynamic content with placeholders like {{candidate_name}}
- **AI-Powered Generation**: Generate email content using AI assistance
- **Template Preview**: Live preview with variable substitution
- **Usage Analytics**: Track template performance and usage statistics

### 📧 **Email Campaign System**
- **Multi-Step Campaign Creation**: Guided campaign setup process
- **Target Audience Selection**: Choose specific candidate stages
- **Schedule Management**: Send immediately or schedule for later
- **Business Hours Respect**: Only send during specified work hours
- **Rate Limiting**: Control email sending frequency
- **Performance Tracking**: Monitor open rates, click rates, and responses

### 🤖 **Automation Engine**
- **Stage-Based Triggers**: Automatically send emails when candidates move stages
- **Follow-up Sequences**: Set up automated follow-up campaigns
- **Custom Delays**: Configure timing between automated emails
- **Smart Scheduling**: Respect business hours and workdays
- **Rule Management**: Enable/disable automation rules as needed

### 📊 **Analytics & Reporting**
- **Campaign Performance**: Track email delivery, opens, clicks, and responses
- **Template Analytics**: See which templates perform best
- **Response Tracking**: Monitor candidate engagement
- **ROI Metrics**: Measure campaign effectiveness

## Components Overview

### Main Page: `ProjectEmailTemplatesPage.tsx`
The primary component that provides a tabbed interface for:
- **Templates Tab**: Browse, create, and manage email templates
- **Campaigns Tab**: View active campaigns and their performance
- **Automation Tab**: Configure automated email rules
- **Analytics Tab**: View performance metrics and insights

### Template Components
- **EmailTemplateCard**: Display template information with actions
- **CreateEmailTemplateModal**: Create/edit templates with AI assistance
- **EmailPreviewModal**: Preview templates with variable substitution

### Campaign Components
- **EmailCampaignCard**: Display campaign status and metrics
- **CreateEmailCampaignModal**: Multi-step campaign creation wizard

### Settings Component
- **ProjectEmailSettings**: Configure email providers, automation, and preferences

## Backend Integration

### API Endpoints Used
- `GET /email-management/templates/sourcing` - Get sourcing-specific templates
- `GET /email-management/templates` - Get all accessible templates
- `POST /email-management/templates` - Create new template
- `PUT /email-management/templates/:id` - Update existing template
- `POST /email-management/templates/generate-ai-content` - AI content generation

### Email Template Structure
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'candidate_outreach' | 'follow_up' | 'interview_invite' | etc.;
  category: 'outreach' | 'interview' | 'hiring' | 'general';
  scope: 'personal' | 'team' | 'organization' | 'global';
  variables: string[];
  usageCount: number;
  isDefault: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
```

## Usage Guide

### Creating Templates
1. Navigate to a project's Email Templates page
2. Click "New Template" button
3. Fill in template details (name, type, category)
4. Write email content using variables like {{candidate_name}}
5. Use AI generation for inspiration or complete content
6. Preview template with sample data
7. Save and make available to team

### Setting Up Campaigns
1. Go to Campaigns tab
2. Click "New Campaign"
3. **Step 1**: Enter campaign name and description
4. **Step 2**: Select email template and target candidate stages
5. **Step 3**: Configure scheduling and sending limits
6. **Step 4**: Review and launch campaign

### Automation Rules
1. Navigate to Automation tab
2. Click "Add Rule" to create new automation
3. Define trigger conditions (stage changes, time delays)
4. Select email template to send
5. Set delay and frequency limits
6. Enable rule to start automation

### Template Variables
Common variables include:
- `{{candidate_name}}` - Candidate's full name
- `{{recruiter_name}}` - Recruiter's name
- `{{company_name}}` - Company name
- `{{position_title}}` - Job position title
- `{{salary_range}}` - Salary range for position
- `{{location}}` - Job location
- `{{interview_date}}` - Scheduled interview date

## Advanced Features

### AI Content Generation
- Powered by backend AI service
- Generates subject lines and email body
- Customizable with specific instructions
- Maintains professional tone and structure
- Includes proper email formatting

### Variable Management
- Auto-detection of variables in template content
- Quick-add common variables
- Custom variable creation
- Variable validation and suggestion

### Business Hours Settings
- Configure work days (Monday-Sunday)
- Set business hours (e.g., 9 AM - 5 PM)
- Timezone support
- Automatic scheduling adjustment

### Performance Tracking
- Email delivery confirmation
- Open rate tracking
- Click-through rate monitoring
- Response rate analytics
- A/B testing capabilities (future)

## File Structure
```
src/pages/sourcing/
├── ProjectEmailTemplatesPage.tsx       # Main email templates page
├── components/
│   ├── EmailTemplateCard.tsx           # Template display card
│   ├── EmailCampaignCard.tsx           # Campaign display card
│   ├── CreateEmailTemplateModal.tsx    # Template creation modal
│   ├── CreateEmailCampaignModal.tsx    # Campaign creation wizard
│   ├── EmailPreviewModal.tsx           # Template preview modal
│   └── ProjectEmailSettings.tsx        # Email settings configuration
```

## Integration Points

### With Sourcing Pipeline
- Templates automatically sync with candidate stages
- Automation triggers on stage transitions
- Prospect data fills template variables
- Campaign targeting based on pipeline status

### With User Management
- Template sharing across teams/organizations
- Permission-based access control
- User-specific template creation
- Role-based feature access

### With Analytics System
- Email event tracking
- Performance metric collection
- ROI calculation
- Reporting integration

## Future Enhancements

### Planned Features
- **A/B Testing**: Split test different templates
- **Advanced Scheduling**: Optimal send time prediction
- **Response Handling**: Automatic response categorization
- **Integration APIs**: Connect with external email services
- **Mobile Optimization**: Mobile-responsive email templates
- **Deliverability Tools**: Spam score checking and optimization

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live campaign status
- **Bulk Operations**: Mass template and campaign management
- **Template Versioning**: Track template changes over time
- **Advanced Analytics**: Machine learning insights
- **Email Testing**: Automated template testing across email clients

## Best Practices

### Template Design
- Keep subject lines under 50 characters
- Use clear, actionable language
- Include personalization variables
- Maintain consistent branding
- Test across different email clients

### Campaign Management
- Start with small test audiences
- Monitor performance closely
- Respect unsubscribe requests
- Follow email marketing regulations
- Maintain clean recipient lists

### Automation Setup
- Start with simple rules
- Monitor automation closely
- Set appropriate delays
- Respect candidate preferences
- Regular review and optimization

This system provides a complete solution for managing email communications in sourcing projects, from template creation to campaign execution and performance tracking.
