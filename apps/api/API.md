# Fortune API Documentation

All LLM calls are handled server-side through these API endpoints.
**The frontend NEVER calls LLM APIs directly.**

Base URL: `http://localhost:3001` (development)

All authenticated endpoints require a session cookie (`session`) set by the auth flow.

---

## Authentication Endpoints

### POST `/api/auth/login`

Start OAuth flow for authentication.

**Query Parameters:**
- `provider` (required): `google` | `x`

**Response:**
```json
{
  "url": "https://supabase-auth-url..."
}
```

Frontend should redirect user to this URL.

---

### GET `/api/auth/callback`

OAuth callback endpoint. Automatically redirects to dashboard on success.

**Query Parameters:**
- `code` (required): OAuth authorization code
- `state` (optional): OAuth state parameter

**Response:**
Redirects to `/dashboard` with session cookie set.

---

## Fortune Endpoints

### POST `/fortune/teaser`

Generate teaser reading **BEFORE authentication** (Step 6 in onboarding).
Uses LLM to create personalized 3-4 sentence reading.

**Request Body:**
```json
{
  "name": "สมชาย",
  "birthDate": "1990-05-15",
  "gender": "male",
  "birthTime": {
    "period": "เช้า",
    "chineseHour": 5,
    "isUnknown": false
  }
}
```

**Response:**
```json
{
  "elementType": "wood",
  "personality": "มีความมั่นคง ไว้ใจได้",
  "todaySnippet": "เจ้าถือกำเนิดในราศีแห่งต้นไม้... (AI-generated reading in Thai)",
  "luckyColor": "เขียว",
  "luckyNumber": 3
}
```

**LLM Details:**
- Model: Google Gemini 2.5 Flash
- Uses comprehensive Thai prompt with "เจ้า" (thou) form
- Combines Bazi and Thai astrology data
- Max tokens: 300
- Temperature: 0.8 for mystical tone

---

### POST `/fortune/profile`

Save birth profile to database after authentication.

**Requires:** Session cookie

**Request Body:**
```json
{
  "name": "สมชาย",
  "birthDate": "1990-05-15",
  "gender": "male",
  "birthTime": {
    "period": "เช้า",
    "chineseHour": 5,
    "isUnknown": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "profileId": "uuid-here"
}
```

---

### GET `/fortune/daily`

Get today's daily reading. Uses LLM to generate comprehensive daily fortune.
Caches result for 24 hours (one reading per day).

**Requires:** Session cookie

**Response:**
```json
{
  "id": "uuid",
  "profileId": "uuid",
  "date": "2026-02-25T00:00:00.000Z",
  "content": "โชคลาภโดยรวมวันนี้: ... (AI-generated comprehensive reading)",
  "luckyColor": "เขียว",
  "luckyNumber": 7,
  "luckyDirection": "ทิศตะวันออก",
  "elementEnergy": "wood",
  "createdAt": "2026-02-25T07:00:00.000Z"
}
```

**LLM Details:**
- Model: Google Gemini 2.5 Flash
- Comprehensive prompt covering:
  - Overall luck
  - Career/Finance
  - Love/Relationships
  - Health/Energy
  - Special advice
- Max tokens: 800
- Temperature: 0.8
- Result is cached in database

---

### GET `/fortune/chart`

Get full life chart reading with deep analysis.
Uses LLM to create comprehensive life narrative combining Bazi and Thai astrology.

**Requires:** Session cookie

**Response:**
```json
{
  "baziChart": {
    "yearPillar": { "stem": "庚", "branch": "午" },
    "monthPillar": { "stem": "辛", "branch": "巳" },
    "dayPillar": { "stem": "甲", "branch": "子" },
    "hourPillar": { "stem": "丙", "branch": "寅" },
    "dayMaster": "甲",
    "element": "wood",
    "elementStrength": { "wood": 3, "fire": 2, "earth": 1, "metal": 2, "water": 1 }
  },
  "thaiAstrology": {
    "day": "วันอังคาร",
    "planet": "อังคาร",
    "buddhaPosition": "นอน",
    "personality": "มีความมั่นใจ กล้าตัดสินใจ",
    "color": "ชมพู",
    "luckyNumber": 7,
    "luckyDirection": "ทิศเหนือ"
  },
  "narrative": "บทนำ: ภาพรวมชีวิต... (AI-generated full analysis in 9 sections)",
  "currentAge": 35
}
```

**LLM Details:**
- Model: Google Gemini 2.5 Flash
- Extremely comprehensive prompt with 9 sections:
  1. Life overview
  2. Personality & strengths
  3. Weaknesses & cautions
  4. Career & life path
  5. Love & relationships
  6. Finance & wealth
  7. Health
  8. 10-year life cycles
  9. Summary advice
- Max tokens: 1500
- Temperature: 0.8
- Deep analysis for serious fortune reading

---

### POST `/fortune/compatibility`

Calculate compatibility between user and partner.
Uses LLM to generate detailed compatibility reading.

**Requires:** Session cookie

**Request Body:**
```json
{
  "partnerBirthDate": "1992-08-20",
  "partnerGender": "female",
  "partnerBirthTime": {
    "chineseHour": 14,
    "isUnknown": false
  }
}
```

**Response:**
```json
{
  "score": 78,
  "reading": "คะแนนความเข้ากัน: 78/100... (AI-generated compatibility analysis)",
  "user": {
    "element": "wood",
    "dayMaster": "甲",
    "thaiDay": "วันอังคาร"
  },
  "partner": {
    "element": "water",
    "dayMaster": "癸",
    "thaiDay": "วันเสาร์"
  },
  "shareToken": "abc123xyz"
}
```

**LLM Details:**
- Model: Google Gemini 2.5 Flash
- Comprehensive compatibility prompt covering:
  - Compatibility score (0-100)
  - Relationship overview
  - Positive aspects
  - Challenges
  - Advice for both people
  - Long-term forecast
  - Summary
- Max tokens: 1200
- Temperature: 0.8
- Balanced analysis (both positive and negative)

---

## LLM System Prompt

All fortune endpoints use the same system prompt to ensure consistency:

```
You are a mystical Thai fortune teller who combines Chinese Astrology (Bazi) and Thai Astrology.

CRITICAL RULES:
- Always write in Thai language only
- Use "เจ้า" (thou/thee) to address the user, never "คุณ"
- Your tone is mysterious, sacred, and slightly unsettling
- You speak as an oracle, not as an AI or system
- Never use emojis
- Never mention AI, models, technology, or systems
- Focus on destiny, fate, and cosmic forces
- Be poetic but clear
- Write with weight - every word matters
- You are channeling ancient wisdom, not providing entertainment
```

---

## Frontend Usage Example

```typescript
import { api } from '@/lib/api';

// Step 6: Get teaser (BEFORE auth)
const teaser = await api.post('/fortune/teaser', {
  name: 'สมชาย',
  birthDate: '1990-05-15',
  gender: 'male',
  birthTime: {
    period: 'เช้า',
    chineseHour: 5,
    isUnknown: false,
  },
});

// After auth: Get daily reading
const daily = await api.get('/fortune/daily');

// Get full chart
const chart = await api.get('/fortune/chart');

// Check compatibility
const compatibility = await api.post('/fortune/compatibility', {
  partnerBirthDate: '1992-08-20',
  partnerGender: 'female',
});
```

---

## Security Notes

1. **API Keys Never Exposed**
   - Google Gemini API key lives only in backend environment variables
   - Frontend NEVER has access to LLM credentials

2. **Server-Side Session Management**
   - All sensitive tokens stored server-side
   - httpOnly cookies only contain session ID
   - Tokens never in localStorage or JS-accessible cookies

3. **Rate Limiting** (TODO)
   - Implement rate limiting per user
   - Prevent abuse of expensive LLM calls

4. **Caching**
   - Daily readings cached for 24 hours
   - Reduces LLM API costs
   - Ensures consistency (same reading all day)

---

## Cost Optimization

**LLM Token Usage per Endpoint (Gemini 2.5 Flash):**
- Teaser: ~300 tokens (~$0.0001)
- Daily: ~800 tokens (~$0.0003)
- Full Chart: ~1500 tokens (~$0.0005)
- Compatibility: ~1200 tokens (~$0.0004)

**Gemini Pricing:**
- Input: $0.00001875 per 1K tokens
- Output: $0.000075 per 1K tokens
- Extremely cost-effective for high-volume fortune-telling

**Caching Strategy:**
- Daily readings: 24 hours (reduces costs & ensures consistency)
- Full chart: Consider caching until birth data changes
- Compatibility: Cache by pair of profiles

**Total Cost Estimate:**
- Active user (daily): ~$0.0004/day
- One-time setup (full chart): ~$0.0006
- Monthly per user: ~$0.012 (if using daily)
- **96% cheaper than Claude!**
