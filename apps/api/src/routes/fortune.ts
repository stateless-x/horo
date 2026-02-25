import { Elysia, t } from 'elysia';
import { db } from '../lib/db';
import { generateFortuneReading } from '../lib/gemini';
import { calculateBazi, calculateThaiAstrology, calculateCompatibility } from '@horo/astrology';
import { birthProfiles, baziCharts, thaiAstrologyData, dailyReadings, compatibility } from '@horo/db';
import { BirthProfileSchema, type BaziChart } from '@horo/shared';
import { eq, and } from 'drizzle-orm';
import {
  buildTeaserPrompt,
  buildDailyReadingPrompt,
  buildFullChartPrompt,
  buildCompatibilityPrompt,
  SYSTEM_PROMPT
} from '../lib/prompts';

/**
 * Fortune calculation and reading routes
 * All LLM calls are handled server-side for security and consistency
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

      // Generate AI reading using comprehensive prompt
      const prompt = buildTeaserPrompt(
        profile.name || 'ผู้มาเยือน',
        birthDate,
        baziChart,
        thaiAstrology
      );

      const reading = await generateFortuneReading(prompt, 300);

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

  // Get daily reading (requires auth)
  .get('/daily', async ({ cookie, set, query }) => {
    const sessionToken = cookie.session.value;

    if (!sessionToken) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    try {
      // TODO: Extract user ID from session token
      const userId = 'temp-user-id'; // Replace with actual session validation

      // Get user's birth profile
      const [profile] = await db
        .select()
        .from(birthProfiles)
        .where(eq(birthProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        set.status = 404;
        return { error: 'Birth profile not found' };
      }

      // Check if we already have today's reading
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      const [existingReading] = await db
        .select()
        .from(dailyReadings)
        .where(
          and(
            eq(dailyReadings.profileId, profile.id),
            eq(dailyReadings.date, todayStr)
          )
        )
        .limit(1);

      if (existingReading) {
        return existingReading;
      }

      // Generate new daily reading
      const baziChart = calculateBazi(
        profile.birthDate,
        profile.birthHour || undefined,
        profile.gender as 'male' | 'female'
      );
      const thaiAstrology = calculateThaiAstrology(profile.birthDate);

      const prompt = buildDailyReadingPrompt(
        'ผู้ใช้', // TODO: Get actual name from users table
        profile.birthDate,
        new Date(),
        baziChart,
        thaiAstrology
      );

      const content = await generateFortuneReading(prompt, 800);

      // Save to database
      const [newReading] = await db
        .insert(dailyReadings)
        .values({
          profileId: profile.id,
          date: todayStr, // Use YYYY-MM-DD string format
          content,
          luckyColor: thaiAstrology.color,
          luckyNumber: thaiAstrology.luckyNumber,
          luckyDirection: thaiAstrology.luckyDirection,
          elementEnergy: baziChart.element,
        })
        .returning();

      return newReading;
    } catch (error) {
      console.error('Daily reading error:', error);
      set.status = 500;
      return { error: 'Failed to generate daily reading' };
    }
  })

  // Get full chart reading (requires auth)
  .get('/chart', async ({ cookie, set }) => {
    const sessionToken = cookie.session.value;

    if (!sessionToken) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    try {
      // TODO: Extract user ID from session token
      const userId = 'temp-user-id';

      // Get user's birth profile
      const [profile] = await db
        .select()
        .from(birthProfiles)
        .where(eq(birthProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        set.status = 404;
        return { error: 'Birth profile not found' };
      }

      // Get or calculate Bazi chart
      let [baziChartRecord] = await db
        .select()
        .from(baziCharts)
        .where(eq(baziCharts.profileId, profile.id))
        .limit(1);

      if (!baziChartRecord) {
        // Calculate and save
        const baziChart = calculateBazi(
          profile.birthDate,
          profile.birthHour || undefined,
          profile.gender as 'male' | 'female'
        );

        [baziChartRecord] = await db
          .insert(baziCharts)
          .values({
            profileId: profile.id,
            yearPillar: JSON.stringify(baziChart.yearPillar),
            monthPillar: JSON.stringify(baziChart.monthPillar),
            dayPillar: JSON.stringify(baziChart.dayPillar),
            hourPillar: baziChart.hourPillar ? JSON.stringify(baziChart.hourPillar) : null,
            dayMaster: baziChart.dayMaster,
            primaryElement: baziChart.element,
            elementStrength: JSON.stringify({}),
          })
          .returning();
      }

      // Parse chart data
      const baziChart: BaziChart = {
        yearPillar: JSON.parse(baziChartRecord.yearPillar),
        monthPillar: JSON.parse(baziChartRecord.monthPillar),
        dayPillar: JSON.parse(baziChartRecord.dayPillar),
        hourPillar: baziChartRecord.hourPillar ? JSON.parse(baziChartRecord.hourPillar) : undefined,
        dayMaster: baziChartRecord.dayMaster as any,
        element: baziChartRecord.primaryElement as any,
      };

      // Get Thai astrology
      const thaiAstrology = calculateThaiAstrology(profile.birthDate);

      // Calculate current age
      const now = new Date();
      const birthDate = new Date(profile.birthDate);
      const currentAge = now.getFullYear() - birthDate.getFullYear();

      // Generate comprehensive reading with LLM
      const prompt = buildFullChartPrompt(
        'ผู้ใช้', // TODO: Get actual name
        profile.birthDate,
        baziChart,
        thaiAstrology,
        currentAge
      );

      const narrative = await generateFortuneReading(prompt, 1500);

      return {
        baziChart,
        thaiAstrology,
        narrative,
        currentAge,
      };
    } catch (error) {
      console.error('Chart reading error:', error);
      set.status = 500;
      return { error: 'Failed to generate chart reading' };
    }
  })

  // Calculate compatibility between two people
  .post('/compatibility', async ({ body, cookie, set }) => {
    const sessionToken = cookie.session.value;

    if (!sessionToken) {
      set.status = 401;
      return { error: 'Not authenticated' };
    }

    try {
      const { partnerBirthDate, partnerGender, partnerBirthTime } = body as {
        partnerBirthDate: string;
        partnerGender: 'male' | 'female';
        partnerBirthTime?: {
          chineseHour?: number;
          isUnknown?: boolean;
        };
      };

      // TODO: Get current user's profile
      const userId = 'temp-user-id';
      const [userProfile] = await db
        .select()
        .from(birthProfiles)
        .where(eq(birthProfiles.userId, userId))
        .limit(1);

      if (!userProfile) {
        set.status = 404;
        return { error: 'User profile not found' };
      }

      // Calculate charts for both people
      const userBaziChart = calculateBazi(
        userProfile.birthDate,
        userProfile.birthHour || undefined,
        userProfile.gender as 'male' | 'female'
      );
      const userThaiAstrology = calculateThaiAstrology(userProfile.birthDate);

      const partnerBirthDateObj = new Date(partnerBirthDate);
      const partnerBirthHour = partnerBirthTime?.isUnknown ? undefined : partnerBirthTime?.chineseHour;

      const partnerBaziChart = calculateBazi(
        partnerBirthDateObj,
        partnerBirthHour,
        partnerGender as 'male' | 'female'
      );
      const partnerThaiAstrology = calculateThaiAstrology(partnerBirthDateObj);

      // Calculate compatibility score
      const compatibilityScore = calculateCompatibility(userBaziChart, partnerBaziChart);

      // Generate LLM reading
      const prompt = buildCompatibilityPrompt(
        {
          name: 'เจ้า',
          birthDate: userProfile.birthDate,
          baziChart: userBaziChart,
          thaiAstrology: userThaiAstrology,
        },
        {
          name: 'คู่ของเจ้า',
          birthDate: partnerBirthDateObj,
          baziChart: partnerBaziChart,
          thaiAstrology: partnerThaiAstrology,
        }
      );

      const reading = await generateFortuneReading(prompt, 1200);

      // Generate unique share token
      const shareToken = Math.random().toString(36).substring(2, 15);

      // TODO: Create a temporary profile for partner or handle differently
      // For now, return the result without saving to DB if partner has no profile
      return {
        score: compatibilityScore,
        reading,
        user: {
          element: userBaziChart.element,
          dayMaster: userBaziChart.dayMaster,
          thaiDay: userThaiAstrology.day,
        },
        partner: {
          element: partnerBaziChart.element,
          dayMaster: partnerBaziChart.dayMaster,
          thaiDay: partnerThaiAstrology.day,
        },
        shareToken,
      };
    } catch (error) {
      console.error('Compatibility error:', error);
      set.status = 500;
      return { error: 'Failed to calculate compatibility' };
    }
  }, {
    body: t.Object({
      partnerBirthDate: t.String(),
      partnerGender: t.Union([t.Literal('male'), t.Literal('female')]),
      partnerBirthTime: t.Optional(t.Object({
        chineseHour: t.Optional(t.Number()),
        isUnknown: t.Optional(t.Boolean()),
      })),
    }),
  });
