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
  
      const prompt = `Analyze this disaster and generate relief items with quantities:
  
  ${description}
  
  Context:
  - Headline: ${headline || 'Not provided'}
  - Location: ${location || 'Not specified'}
  
  Respond with ONLY valid JSON in this exact format (no extra text, no markdown):
  {
    "severity": "medium",
    "affected_population": 1000,
    "location": "affected area",
    "cause_type": "natural_disaster",
    "urgency_level": "high",
    "recommended_items": [
      {
        "item": "Emergency Tents",
        "quantity": "100 units",
        "purpose": "Temporary shelter for displaced families",
        "priority": "high"
      },
      {
        "item": "Food Rations",
        "quantity": "500 packages",
        "purpose": "Emergency food supply",
        "priority": "critical"
      }
    ]
  }`;
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a disaster relief expert. Respond ONLY with valid JSON, no markdown formatting or extra text." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });
  
      const result = response.choices[0].message.content.trim();
      console.log('🤖 Raw AI Response:', result);
  
      let cleanedResult = result;
      if (result.startsWith('```json')) {
        cleanedResult = result.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (result.startsWith('```')) {
        cleanedResult = result.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
  
      console.log('🧹 Cleaned Response:', cleanedResult);
  
      try {
        const parsedResult = JSON.parse(cleanedResult);
        console.log('✅ Successfully parsed JSON');
        res.json({ success: true, analysis: parsedResult });
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('📝 Failed to parse:', cleanedResult);
        
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

app.listen(PORT, () => {
  console.log(`🚀 Unified server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   - Charity AI: POST /api/ai-recommendation`);
  console.log(`   - Vendor API: /api/vendor/* (role-protected)`);
  console.log(`   - Charity API: /api/charity/* (role-protected)`);
  console.log(`   - Donor API: /api/donor/* (role-protected)`);
  console.log(`🔥 Ready for Firebase integration with role-based access`);
});