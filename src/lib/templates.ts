// Built-in service templates with guides and OAuth support

export interface TemplateField {
  label: string;
  fieldType: 'TEXT' | 'SECRET' | 'URL';
  required: boolean;
  placeholder?: string;
  hint?: string;
  validationPattern?: string;
}

export interface TemplateGuideStep {
  text: string;
  textHe?: string;
  imageUrl?: string;
}

export interface ServiceTemplate {
  slug: string;
  name: string;
  nameHe: string;
  icon: string;
  category: string;
  authMethod: 'OAUTH' | 'MANUAL' | 'BOTH';
  oauthProvider?: string;
  oauthScopes?: string;
  fields: TemplateField[];
  guide: {
    en: TemplateGuideStep[];
    he: TemplateGuideStep[];
  };
}

export const BUILT_IN_TEMPLATES: ServiceTemplate[] = [
  {
    slug: 'facebook',
    name: 'Facebook',
    nameHe: 'פייסבוק',
    icon: 'facebook',
    category: 'social',
    authMethod: 'BOTH',
    oauthProvider: 'facebook',
    oauthScopes: 'pages_manage_posts,pages_read_engagement,pages_show_list',
    fields: [
      {
        label: 'App ID',
        fieldType: 'TEXT',
        required: true,
        placeholder: '123456789012345',
        hint: 'A 15-16 digit number',
        validationPattern: '^\\d{15,16}$',
      },
      {
        label: 'App Secret',
        fieldType: 'SECRET',
        required: true,
        placeholder: 'abc123def456...',
        hint: 'A 32-character hex string',
        validationPattern: '^[a-f0-9]{32}$',
      },
      {
        label: 'Page Access Token',
        fieldType: 'SECRET',
        required: false,
        hint: 'Long token starting with EAA...',
        validationPattern: '^EAA',
      },
    ],
    guide: {
      en: [
        { text: 'Go to developers.facebook.com and log in' },
        { text: 'Click "My Apps" in the top right' },
        { text: 'Select your app (or create one)' },
        { text: 'Go to Settings → Basic' },
        { text: 'Copy the App ID and App Secret' },
      ],
      he: [
        { text: 'היכנסו ל-developers.facebook.com והתחברו' },
        { text: 'לחצו על "My Apps" בפינה הימנית העליונה' },
        { text: 'בחרו את האפליקציה שלכם (או צרו חדשה)' },
        { text: 'לכו ל-Settings → Basic' },
        { text: 'העתיקו את ה-App ID וה-App Secret' },
      ],
    },
  },
  {
    slug: 'google',
    name: 'Google',
    nameHe: 'גוגל',
    icon: 'chrome',
    category: 'analytics',
    authMethod: 'BOTH',
    oauthProvider: 'google',
    oauthScopes: 'https://www.googleapis.com/auth/analytics.readonly',
    fields: [
      {
        label: 'Client ID',
        fieldType: 'TEXT',
        required: true,
        placeholder: '123456789.apps.googleusercontent.com',
        hint: 'Ends with .apps.googleusercontent.com',
      },
      {
        label: 'Client Secret',
        fieldType: 'SECRET',
        required: true,
        placeholder: 'GOCSPX-...',
        hint: 'Starts with GOCSPX-',
      },
    ],
    guide: {
      en: [
        { text: 'Go to console.cloud.google.com' },
        { text: 'Select your project' },
        { text: 'Go to APIs & Services → Credentials' },
        { text: 'Click on your OAuth 2.0 Client ID' },
        { text: 'Copy the Client ID and Client Secret' },
      ],
      he: [
        { text: 'היכנסו ל-console.cloud.google.com' },
        { text: 'בחרו את הפרויקט שלכם' },
        { text: 'לכו ל-APIs & Services → Credentials' },
        { text: 'לחצו על ה-OAuth 2.0 Client ID' },
        { text: 'העתיקו את ה-Client ID וה-Client Secret' },
      ],
    },
  },
  {
    slug: 'instagram',
    name: 'Instagram',
    nameHe: 'אינסטגרם',
    icon: 'instagram',
    category: 'social',
    authMethod: 'OAUTH',
    oauthProvider: 'facebook',
    oauthScopes: 'instagram_basic,instagram_content_publish,pages_show_list',
    fields: [],
    guide: { en: [], he: [] },
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    nameHe: 'סטרייפ',
    icon: 'credit-card',
    category: 'payments',
    authMethod: 'MANUAL',
    fields: [
      {
        label: 'Publishable Key',
        fieldType: 'TEXT',
        required: true,
        placeholder: 'pk_live_...',
        hint: 'Starts with pk_live_ or pk_test_',
        validationPattern: '^pk_(live|test)_',
      },
      {
        label: 'Secret Key',
        fieldType: 'SECRET',
        required: true,
        placeholder: 'sk_live_...',
        hint: 'Starts with sk_live_ or sk_test_',
        validationPattern: '^sk_(live|test)_',
      },
      {
        label: 'Webhook Secret',
        fieldType: 'SECRET',
        required: false,
        placeholder: 'whsec_...',
        hint: 'Starts with whsec_',
        validationPattern: '^whsec_',
      },
    ],
    guide: {
      en: [
        { text: 'Go to dashboard.stripe.com and log in' },
        { text: 'Click "Developers" in the top menu' },
        { text: 'Go to "API keys"' },
        { text: 'Copy the Publishable key and Secret key' },
        { text: 'For webhooks: go to Developers → Webhooks' },
      ],
      he: [
        { text: 'היכנסו ל-dashboard.stripe.com והתחברו' },
        { text: 'לחצו על "Developers" בתפריט העליון' },
        { text: 'לכו ל-"API keys"' },
        { text: 'העתיקו את ה-Publishable key וה-Secret key' },
        { text: 'לוובהוקס: לכו ל-Developers → Webhooks' },
      ],
    },
  },
  {
    slug: 'sendgrid',
    name: 'SendGrid',
    nameHe: 'סנדגריד',
    icon: 'mail',
    category: 'email',
    authMethod: 'MANUAL',
    fields: [
      {
        label: 'API Key',
        fieldType: 'SECRET',
        required: true,
        placeholder: 'SG....',
        hint: 'Starts with SG.',
        validationPattern: '^SG\\.',
      },
    ],
    guide: {
      en: [
        { text: 'Go to app.sendgrid.com and log in' },
        { text: 'Go to Settings → API Keys' },
        { text: 'Click "Create API Key"' },
        { text: 'Give it a name and select permissions' },
        { text: 'Copy the key (you can only see it once!)' },
      ],
      he: [
        { text: 'היכנסו ל-app.sendgrid.com והתחברו' },
        { text: 'לכו ל-Settings → API Keys' },
        { text: 'לחצו על "Create API Key"' },
        { text: 'תנו שם ובחרו הרשאות' },
        { text: 'העתיקו את המפתח (ניתן לראות אותו רק פעם אחת!)' },
      ],
    },
  },
  {
    slug: 'cloudflare',
    name: 'Cloudflare',
    nameHe: 'קלאודפלר',
    icon: 'cloud',
    category: 'hosting',
    authMethod: 'MANUAL',
    fields: [
      {
        label: 'API Token',
        fieldType: 'SECRET',
        required: true,
        hint: 'A long string of letters and numbers',
      },
      {
        label: 'Zone ID',
        fieldType: 'TEXT',
        required: false,
        placeholder: '023e105f4ecef8ad...',
        hint: 'Found on your domain overview page',
        validationPattern: '^[a-f0-9]{32}$',
      },
    ],
    guide: {
      en: [
        { text: 'Go to dash.cloudflare.com and log in' },
        { text: 'Click your profile icon → "My Profile"' },
        { text: 'Go to "API Tokens" tab' },
        { text: 'Click "Create Token" or copy an existing one' },
        { text: 'For Zone ID: go to your domain → Overview → right sidebar' },
      ],
      he: [
        { text: 'היכנסו ל-dash.cloudflare.com והתחברו' },
        { text: 'לחצו על אייקון הפרופיל → "My Profile"' },
        { text: 'לכו ללשונית "API Tokens"' },
        { text: 'לחצו "Create Token" או העתיקו קיים' },
        { text: 'ל-Zone ID: לכו לדומיין → Overview → סרגל צדדי ימני' },
      ],
    },
  },
  {
    slug: 'tiktok',
    name: 'TikTok Business',
    nameHe: 'טיקטוק עסקי',
    icon: 'music',
    category: 'social',
    authMethod: 'MANUAL',
    fields: [
      {
        label: 'App ID',
        fieldType: 'TEXT',
        required: true,
      },
      {
        label: 'App Secret',
        fieldType: 'SECRET',
        required: true,
      },
    ],
    guide: {
      en: [
        { text: 'Go to developers.tiktok.com' },
        { text: 'Click "My Apps"' },
        { text: 'Select your app' },
        { text: 'Find the App ID and App Secret on the app page' },
      ],
      he: [
        { text: 'היכנסו ל-developers.tiktok.com' },
        { text: 'לחצו על "My Apps"' },
        { text: 'בחרו את האפליקציה' },
        { text: 'מצאו את ה-App ID וה-App Secret בדף האפליקציה' },
      ],
    },
  },
  {
    slug: 'mailchimp',
    name: 'Mailchimp',
    nameHe: 'מיילצ\'ימפ',
    icon: 'mail',
    category: 'email',
    authMethod: 'MANUAL',
    fields: [
      {
        label: 'API Key',
        fieldType: 'SECRET',
        required: true,
        hint: 'Ends with -usX (e.g., -us21)',
        validationPattern: '-us\\d+$',
      },
    ],
    guide: {
      en: [
        { text: 'Log in to Mailchimp' },
        { text: 'Click your profile icon → Account & billing' },
        { text: 'Go to Extras → API keys' },
        { text: 'Click "Create A Key"' },
        { text: 'Copy the generated key' },
      ],
      he: [
        { text: 'היכנסו למיילצ\'ימפ' },
        { text: 'לחצו על אייקון הפרופיל → Account & billing' },
        { text: 'לכו ל-Extras → API keys' },
        { text: 'לחצו "Create A Key"' },
        { text: 'העתיקו את המפתח שנוצר' },
      ],
    },
  },
];
