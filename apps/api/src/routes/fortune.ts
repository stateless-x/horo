import { Elysia, t } from 'elysia';
import { db } from '../lib/db';
import { generateFortuneReading } from '../lib/claude';
import { calculateBazi, calculateThaiAstrology } from '@horo/astrology';
import { birthProfiles, baziCharts, thaiAstrologyData, dailyReadings } from '@horo/db';
import { BirthProfileSchema } from '@horo/shared';
import { eq } from 'drizzle-orm';

/**
 * Fortune calculation and reading routes
 */
export const fortuneRoutes = new Elysia({ prefix: '/fortune' })

  // Generate teaser result (BEFORE auth)
  .post('/teaser', async ({ body, set }) => {
    try {
      const profile = BirthProfileSchema.parse(body);

      const birthDate = new Date(profile.birthDate);
      const birthHour = profile.birthTime?.isUnknown ? undefined : profile.birthTime?.chineseHour;

      // Calculate astrology
      const baziChart = calculateBazi(birthDate, birthHour, profile.gender);
      const thaiAstrology = calculateThaiAstrology(birthDate);

      // Generate AI reading (short teaser)
      const prompt = `You are a mystical Thai fortune teller. Based on this person's astrology:

Birth Date: ${birthDate.toISOString()}
Element: ${baziChart.element}
Day Master: ${baziChart.dayMaster}
Thai Day: ${thaiAstrology.day}

Write a 3-4 sentence teaser fortune reading in Thai. Use the respectful "เจ้า" (thou) form.
Make it feel sacred and slightly mysterious. Focus on their personality and today's fortune.
Do NOT use emojis. Be poetic but clear.`;

      const reading = await generateFortuneReading(prompt, 200);

      return {
        elementType: baziChart.element,
        personality: thaiAstrology.personality,
        todaySnippet: reading,
        luckyColor: thaiAstrology.color,
        luckyNumber: thaiAstrology.luckyNumber,
      };
    } catch (error) {
      console.error('Teaser generation error:', error);
      set.status = 500;
      return { error: 'Failed to generate teaser' };
    }
  }, {
    body: BirthProfileSchema,
  })

  // Save birth profile (AFTER auth, in onboarding)
  .post('/profile', async ({ body, cookie, set }) => {
    const sessionToken = cookie.session.value;

    if (!sessionToken) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    try {
      const profile = BirthProfileSchema.parse(body);
      const birthDate = new Date(profile.birthDate);
      const birthHour = profile.birthTime?.isUnknown ? undefined : profile.birthTime?.chineseHour;

      // Get user from session
      // TODO: Extract user from session token
      const userId = 'temp-user-id'; // Replace with actual user ID

      // Save birth profile
      const [savedProfile] = await db.insert(birthProfiles).values({
        userId,
        birthDate,
        birthHour,
        birthTimePeriod: profile.birthTime?.period,
        gender: profile.gender,
        isTimeUnknown: profile.birthTime?.isUnknown || false,
      }).returning();

      // Calculate and save Bazi chart
      const baziChart = calculateBazi(birthDate, birthHour, profile.gender);
      await db.insert(baziCharts).values({
        profileId: savedProfile.id,
        yearPillar: JSON.stringify(baziChart.yearPillar),
        monthPillar: JSON.stringify(baziChart.monthPillar),
        dayPillar: JSON.stringify(baziChart.dayPillar),
        hourPillar: baziChart.hourPillar ? JSON.stringify(baziChart.hourPillar) : null,
        dayMaster: baziChart.dayMaster,
        primaryElement: baziChart.element,
        elementStrength: JSON.stringify({}),
      });

      // Calculate and save Thai astrology
      const thaiAstro = calculateThaiAstrology(birthDate);
      await db.insert(thaiAstrologyData).values({
        profileId: savedProfile.id,
        day: thaiAstro.day,
        color: thaiAstro.color,
        planet: thaiAstro.planet,
        buddhaPosition: thaiAstro.buddhaPosition,
        personality: thaiAstro.personality,
        luckyNumber: thaiAstro.luckyNumber,
        luckyDirection: thaiAstro.luckyDirection,
      });

      return { success: true, profileId: savedProfile.id };
    } catch (error) {
      console.error('Profile save error:', error);
      set.status = 500;
      return { error: 'Failed to save profile' };
    }
  }, {
    body: BirthProfileSchema,
  })

  // Get daily reading
  .get('/daily', async ({ cookie, set }) => {
    const sessionToken = cookie.session.value;

    if (!sessionToken) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    // TODO: Get user's birth profile and generate daily reading
    set.status = 501;
    return { error: 'Not implemented yet' };
  });
