export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "docapture Pro",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://docapture.com",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  authApiBaseUrl: process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || "http://localhost:5000",
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "9bRgWiCIzXStqWs7azssmqEQ", // Add API key
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@docapture.com",
  maxUploadSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '10'), // MB
  defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME || 'system') as "light" | "dark" | "system",
  supportedFileTypes: [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png", ".tiff", ".txt"],
  supportedOutputFormats: ["excel", "csv", "table", "text"],
  trial: {
    // This specific maxDocuments is for the 'trial' planId.
    // Other plan limits are defined in the 'plans' object below.
    maxDocuments: 5,
    message: "You have processed {count} of {max} trial documents. Contact our sales team to continue processing.",
  },

  plans: {
    trial: { name: "Trial", limit: 5, priceId: "trial_plan_id_stripe_etc" }, // priceId is example for future billing
    basic: { name: "Basic", limit: 100, priceId: "basic_plan_id_stripe_etc" },
    pro: { name: "Pro", limit: 500, priceId: "pro_plan_id_stripe_etc" },
    enterprise: { name: "Enterprise", limit: -1, priceId: "enterprise_plan_id_stripe_etc" }, // -1 for unlimited
  } as Record<string, { name: string; limit: number; priceId: string }>, // Type assertion for safety

  corporateEmail: {
    blockedDomains: [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "icloud.com",
      "mail.com",
      "protonmail.com",
      "yandex.com",
      "zoho.com",
      "live.com",
      "msn.com",
      "rediffmail.com",
      "fastmail.com",
    ],
    message: "Please use your corporate email address. Personal email domains are not allowed.",
  },
  // Company branding
  company: {
    name: "CognitBotz Solutions",
    website: "https://cognitbotz.com",
    tagline: "Your AI Automation Partner",
    description: "An Intelligent Process Automation Company",
    email: "hello@cognitbotz.com",
    phone: "+91 9346575094",
    address: {
      street: "Serenity Square, Mind Space",
      city: "Hitech City",
      state: "Telangana",
      zip: "500081",
      country: "India",
    },
    industries: ["Healthcare", "Finance", "Manufacturing", "Insurance", "Banking", "Logistics"],
  },
   // Brand colors - Updated with #fbbf24 as primary
   colors: {
    primary: "#fbbf24", // Yellow/gold as primary
    secondary: "#1e293b", // Dark blue as secondary
    accent: "#0ea5e9", // Light blue accent
  },
}