# SEO Optimize

A comprehensive SEO optimization tool built with Next.js, featuring website auditing capabilities powered by Google PageSpeed Insights API.

<!-- Updated for PSI API integration -->

## Features

- **User Authentication**: Secure signup/signin with Supabase
- **Site Management**: Add and manage multiple websites
- **Site Auditing**: Comprehensive website analysis including:
  - Page title and meta description extraction
  - H1 tag analysis (including nested HTML elements)
  - Broken link detection
  - Mobile performance scoring
  - Performance, SEO, Accessibility, and Best Practices scores
- **Audit History**: Complete audit history with timestamps and detailed results
- **Real-time Results**: Interactive dashboard with detailed audit reports

## Audit History

The application automatically saves all audit results to the database, creating a complete history for each site:

- **Automatic Storage**: Every audit (successful or failed) is saved with timestamp
- **Site Association**: Audits are linked to specific sites when run from the dashboard
- **Historical View**: View all past audits with scores and detailed results
- **Data Persistence**: Audit history is preserved even if sites are deleted
- **User Isolation**: Each user only sees their own audit history

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Auditing**: Google Lighthouse CI, Puppeteer

## Database Setup

This application uses Supabase for authentication and data storage. Make sure you have:

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Set up your `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Database Schema**: Run the SQL commands in `database-schema.sql` in your Supabase SQL editor

The database includes:
- User authentication (handled by Supabase Auth)
- Sites table with user isolation (Row Level Security)
- Audits table for storing complete audit history
- Proper policies to ensure users only see their own data

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Site Auditing

The application includes a powerful site auditing feature that analyzes websites using Google Lighthouse CI:

1. **Dashboard**: Add websites to your dashboard
2. **Quick Audit**: Click "Run Audit" on any site card for instant results
3. **Full Report**: Click "Full Report" for detailed analysis with tabs for:
   - Overview: Performance scores and overall metrics
   - SEO Data: Title, meta description, H1 tags, and broken links
   - Performance: Detailed performance insights

### Audit Metrics Collected

- **Title**: Page title extraction
- **Meta Description**: Meta description content
- **H1 Tags**: All H1 headings on the page
- **Broken Links**: Internal broken links detection
- **Mobile Score**: Mobile performance score
- **Performance Score**: Overall performance rating
- **SEO Score**: SEO optimization rating
- **Accessibility Score**: Web accessibility rating
- **Best Practices Score**: Web best practices rating

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
