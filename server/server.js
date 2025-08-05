require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Import routes
const vendorRoutes = require('./routes/vendorRoutes');
const charityRoutes = require('./routes/charityRoutes');
const donorRoutes = require('./routes/donorRoutes');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json());

// Mount role-based routes
app.use('/api/vendor', vendorRoutes);
app.use('/api/charity', charityRoutes);
app.use('/api/donor', donorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Unified Charity Relief & Vendor Backend is running!',
    endpoints: [
      'GET /api/test', 
      'POST /api/ai-recommendation',
      'POST /api/vendor/init',
      'GET /api/vendor/profile',
      'GET /api/vendor/listings',
      'POST /api/vendor/listings',
      'PUT /api/vendor/listings/:id',
      'DELETE /api/vendor/listings/:id',
      'GET /api/charity/profile',
      'PUT /api/charity/profile',
      'GET /api/donor/profile',
      'PUT /api/donor/profile'
    ]
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint accessed');
  res.json({ message: 'Backend server is running!' });
});

// AI recommendation endpoint
app.post('/api/ai-recommendation', async (req, res) => {
    try {
      const { description, headline, location } = req.body;
      console.log('📡 AI request received');
      
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
  
      const prompt = `Analyze this situation and generate appropriate relief items:

Description: ${description}
Headline: ${headline || 'Not provided'}
Location: ${location || 'Not specified'}

Based on the description, determine what type of cause this is and what items are needed:

- If it's about natural disasters (floods, earthquakes, etc.): suggest emergency supplies like tents, water, food, medical kits
- If it's about education: suggest school supplies, books, computers, uniforms, furniture
- If it's about medical needs: suggest medicines, medical equipment, hospital supplies
- If it's about poverty: suggest food packages, clothing, household items
- If it's about community development: suggest infrastructure materials, tools, equipment

Return ONLY this JSON format with no extra text, no explanation, no markdown:
{
  "severity": "low/medium/high",
  "affected_population": number,
  "location": "location from input",
  "cause_type": "education/medical/natural_disaster/poverty/community_development/humanitarian",
  "urgency_level": "low/medium/high/critical",
  "recommended_items": [
    {
      "item": "specific item name",
      "quantity": "number with unit",
      "purpose": "why this item is needed",
      "priority": "low/medium/high/critical"
    }
  ]
}`;
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a relief and humanitarian aid expert. You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Do not use markdown code blocks. Do not provide explanations. Just return the raw JSON object." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });
  
      const result = response.choices[0].message.content.trim();
      console.log('🤖 Raw AI Response:', result);
      console.log('🔍 Response length:', result.length);
      console.log('🔍 First 100 chars:', result.substring(0, 100));
  
      let cleanedResult = result;
      
      // Remove markdown code blocks
      if (result.startsWith('```json')) {
        cleanedResult = result.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (result.startsWith('```')) {
        cleanedResult = result.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Remove any leading/trailing text that isn't JSON
      const jsonStart = cleanedResult.indexOf('{');
      const jsonEnd = cleanedResult.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResult = cleanedResult.substring(jsonStart, jsonEnd + 1);
      }
  
      console.log('🧹 Cleaned Response:', cleanedResult);
      console.log('🔍 Cleaned length:', cleanedResult.length);
  
      try {
        const parsedResult = JSON.parse(cleanedResult);
        console.log('✅ Successfully parsed JSON');
        res.json({ success: true, analysis: parsedResult });
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.log('📝 Failed to parse:', cleanedResult);
        console.log('🔍 Error at position:', parseError.message.match(/position (\d+)/)?.[1] || 'unknown');
        
        // Try to find the exact problematic character
        if (cleanedResult.length > 0) {
          console.log('🔍 First 200 chars of failed JSON:', cleanedResult.substring(0, 200));
          console.log('🔍 Last 200 chars of failed JSON:', cleanedResult.substring(Math.max(0, cleanedResult.length - 200)));
        }
        
        res.json({
          success: true,
          analysis: {
            severity: "medium",
            affected_population: 1000,
            location: "Analysis area",
            cause_type: "emergency",
            urgency_level: "medium",
            recommended_items: [
              {
                item: "Emergency Supplies",
                quantity: "500 units",
                purpose: "Basic relief items",
                priority: "high"
              },
              {
                item: "Food Packages",
                quantity: "300 units",
                purpose: "Nutritional support",
                priority: "critical"
              }
            ]
          },
          note: "Used fallback data due to parsing error"
        });
      }
  
    } catch (error) {
      console.error('AI Error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Get public charity profile endpoint
app.get('/api/charity/public/:charityId', (req, res) => {
  try {
    const { charityId } = req.params;
    console.log('📡 Charity profile request for ID:', charityId);
    
    // Mock charity profile data - replace with actual database lookup
    const mockCharityProfile = {
      id: charityId,
      name: "Hope Foundation",
      tagline: "Bringing hope to communities in need",
      location: "San Francisco, CA",
      phone: "+1 (555) 123-4567",
      website: "www.hopefoundation.org",
      aboutUs: "Hope Foundation has been dedicated to providing emergency relief and long-term support to communities affected by natural disasters and poverty. Our mission is to restore hope and rebuild lives through compassionate action and sustainable solutions.",
      focusAreas: ["Disaster Relief", "Education", "Healthcare", "Community Development"],
      impactStats: {
        familiesHelped: 15000,
        communitiesReached: 45,
        yearsActive: 12
      }
    };
    
    console.log('✅ Returning charity profile');
    res.json(mockCharityProfile);
  } catch (error) {
    console.error('❌ Error fetching charity profile:', error);
    res.status(500).json({ error: 'Failed to fetch charity profile' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Unified server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   - Charity AI: POST /api/ai-recommendation`);
  console.log(`   - Charity Profile: GET /api/charity/public/:charityId`);
  console.log(`   - Vendor API: /api/vendor/* (role-protected)`);
  console.log(`   - Charity API: /api/charity/* (role-protected)`);
  console.log(`   - Donor API: /api/donor/* (role-protected)`);
  console.log(`🔥 Ready for Firebase integration with role-based access`);
});