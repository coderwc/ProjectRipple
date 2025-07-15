const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

MONGODB_URI="mongodb://localhost:27017/ripple-charity"
// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ripple-charity', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['charity', 'donor', 'vendor'], required: true },
  phone: String,
  location: String,
  socials: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  charityId: { type: String, required: true },
  charityName: { type: String, required: true },
  headline: { type: String, required: true },
  storyDescription: { type: String, required: true },
  deadline: String,
  items: [{
    id: Number,
    name: String,
    category: String,
    quantity: Number
  }],
  imageUrl: String,
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  donationsReceived: { type: Number, default: 0 },
  donorCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DonationSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  amount: { type: Number, default: 0 },
  items: [{
    name: String,
    quantity: Number,
    category: String
  }],
  message: String,
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Donation = mongoose.model('Donation', DonationSchema);

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Charity Relief AI Backend is running!',
    endpoints: [
      'GET /api/test', 
      'POST /api/ai-recommendation',
      'POST /api/users',
      'GET /api/posts',
      'POST /api/posts',
      'GET /api/posts/charity/:charityId',
      'POST /api/donations'
    ]
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint accessed');
  res.json({ message: 'Backend server is running!' });
});

// User registration/login endpoints
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, type, phone, location, socials } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      name,
      type,
      phone,
      location,
      socials,
      verified: type === 'donor' // Auto-verify donors
    });

    await user.save();
    console.log('✅ User registered:', email);
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User logged in:', email);
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        verified: user.verified,
        location: user.location
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Posts endpoints
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { charityId, charityName, headline, storyDescription, deadline, items } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = new Post({
      charityId,
      charityName,
      headline,
      storyDescription,
      deadline,
      items: JSON.parse(items || '[]'),
      imageUrl
    });

    await post.save();
    console.log('✅ Post created:', headline);
    
    res.json({ success: true, post });
  } catch (error) {
    console.error('❌ Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Handle base64 image posts (for your existing frontend)
app.post('/api/posts/base64', async (req, res) => {
  try {
    const { charityId, charityName, headline, storyDescription, deadline, items, imageBase64 } = req.body;
    
    let imageUrl = null;
    if (imageBase64) {
      // Convert base64 to file and save
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
      const fs = require('fs');
      
      // Ensure uploads directory exists
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
      }
      
      fs.writeFileSync(`uploads/${filename}`, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const post = new Post({
      charityId,
      charityName,
      headline,
      storyDescription,
      deadline,
      items: items || [],
      imageUrl
    });

    await post.save();
    console.log('✅ Post created with base64 image:', headline);
    
    res.json({ success: true, post });
  } catch (error) {
    console.error('❌ Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const { charityId, status = 'active' } = req.query;
    
    let query = { status };
    if (charityId) {
      query.charityId = charityId;
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('❌ Posts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/charity/:charityId', async (req, res) => {
  try {
    const { charityId } = req.params;
    
    const posts = await Post.find({ charityId }).sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('❌ Charity posts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch charity posts' });
  }
});

// Donation endpoints
app.post('/api/donations', async (req, res) => {
  try {
    const { postId, donorId, donorName, amount, items, message } = req.body;
    
    const donation = new Donation({
      postId,
      donorId,
      donorName,
      amount,
      items,
      message
    });

    await donation.save();

    // Update post statistics
    await Post.findByIdAndUpdate(postId, {
      $inc: { 
        donationsReceived: amount || 0,
        donorCount: 1 
      }
    });

    console.log('✅ Donation recorded for post:', postId);
    
    res.json({ success: true, donation });
  } catch (error) {
    console.error('❌ Donation error:', error);
    res.status(500).json({ error: 'Failed to record donation' });
  }
});

app.get('/api/donations/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const donations = await Donation.find({ postId }).sort({ createdAt: -1 });
    
    res.json({ success: true, donations });
  } catch (error) {
    console.error('❌ Donations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// AI recommendation endpoint (your existing one)
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints: Authentication, Posts, Donations, AI recommendations`);
});