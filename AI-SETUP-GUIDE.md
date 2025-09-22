# 🤖 AI Features Setup Guide

## Quick Setup

To enable the AI features in your SEO optimization app, you need to add your OpenAI API key to the environment variables.

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### Step 2: Add API Key to Environment Variables

Create or update your `.env.local` file in the root directory of your project:

```bash
# Add these lines to your .env.local file
OPENAI_API_KEY=sk-your-actual-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Note**: You need both variables because:
- `OPENAI_API_KEY`: Used for server-side API calls
- `NEXT_PUBLIC_OPENAI_API_KEY`: Used for client-side components

### Step 3: Restart Your Development Server

```bash
npm run dev
```

## Environment Variables Reference

Your `.env.local` file should contain:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## Testing AI Features

Once you've added the API key:

1. Go to your app's AI Dashboard (`/ai`)
2. Click "Generate AI Insights"
3. The AI features should now work properly

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is missing"

**Solution**: Make sure you've added the API key to your `.env.local` file and restarted the development server.

**Note**: The app now handles missing API keys gracefully - you'll see a setup guide instead of an error.

### Error: "Insufficient quota" or "Invalid API key"

**Solution**: 
- Check that your API key is correct
- Ensure you have credits in your OpenAI account
- Verify the API key has the necessary permissions

### AI Features Not Working

**Solution**:
1. Check the browser console for error messages
2. Verify the API key is correctly set
3. Restart the development server
4. Check your OpenAI account usage and billing

## Cost Considerations

The AI features use OpenAI's GPT-4 API, which has usage costs:

- **Content Generation**: ~$0.01-0.03 per request
- **Keyword Research**: ~$0.02-0.05 per request
- **SEO Insights**: ~$0.05-0.10 per request

**Estimated monthly cost for 1000 AI requests: $20-50**

## Production Deployment

For production deployment:

1. Add the `OPENAI_API_KEY` to your hosting platform's environment variables
2. Never commit the API key to version control
3. Consider implementing rate limiting for AI features
4. Monitor API usage and costs

## Security Notes

- Keep your API key secure and never share it publicly
- Use environment variables, not hardcoded keys
- Consider implementing user authentication for AI features
- Monitor API usage to prevent abuse

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your OpenAI account status
3. Test with a simple API request
4. Check the OpenAI API status page

---

**Ready to use AI features! 🚀**
