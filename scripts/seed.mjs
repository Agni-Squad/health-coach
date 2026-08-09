import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding database...");

  // 1. Create User
  const { data: user, error: userError } = await supabase
    .from('User')
    .insert([{
      name: "Test User",
      phone: "+1234567890",
      email: "testuser@example.com",
      passwordHash: "dummyhash",
      dateOfBirth: new Date("1990-01-01").toISOString(),
      gender: "Male",
      heightCm: 180,
      currentWeightKg: 80,
      targetWeightKg: 75,
      lifestyle: "moderately active"
    }])
    .select()
    .single();

  if (userError && userError.code !== '23505') {
    console.error("Error creating user:", userError);
  }

  // Fetch the user to get ID if it already existed
  const { data: existingUser } = await supabase.from('User').select('id').eq('email', 'testuser@example.com').single();
  const userId = existingUser.id;

  console.log("User seeded:", userId);

  // 2. Create Goal
  const { error: goalError } = await supabase.from('Goal').insert([{
    userId,
    goalType: 'Weight Loss',
    targetWeightKg: 75,
    targetDate: new Date("2026-12-31").toISOString(),
    bmr: 1800,
    dailyCalorieTarget: 2200,
    proteinTargetGrams: 150,
    waterTargetMl: 3000,
    stepTarget: 10000,
    weeklyWeightChangeKg: -0.5
  }]);
  if (goalError) console.error("Error creating goal:", goalError);

  // 3. Create Logs
  const { error: weightError } = await supabase.from('WeightLog').insert([{ userId, weightKg: 80 }]);
  if (weightError) console.error("Error creating weight log:", weightError);

  const { error: stepError } = await supabase.from('StepLog').insert([{ userId, steps: 8500 }]);
  if (stepError) console.error("Error creating step log:", stepError);

  const { error: waterError } = await supabase.from('WaterLog').insert([{ userId, quantityMl: 500 }]);
  if (waterError) console.error("Error creating water log:", waterError);

  const { error: exerciseError } = await supabase.from('ExerciseLog').insert([{ userId, exerciseType: 'Running', durationMin: 30, caloriesBurned: 300 }]);
  if (exerciseError) console.error("Error creating exercise log:", exerciseError);

  const { error: sleepError } = await supabase.from('SleepLog').insert([{ userId, hours: 7.5, sleepScore: 85 }]);
  if (sleepError) console.error("Error creating sleep log:", sleepError);

  // 4. Create Meal Log
  const { data: meal, error: mealError } = await supabase.from('MealLog').insert([{
    userId,
    mealType: 'Breakfast',
    mealTime: new Date().toISOString(),
    calories: 400,
    protein: 20,
    carbs: 40,
    fat: 15
  }]).select().single();

  if (mealError) {
    console.error("Error creating meal log:", mealError);
  } else {
    // Meal Items
    const { error: itemsError } = await supabase.from('MealItem').insert([
      { mealId: meal.id, name: 'Oatmeal', portion: '1 bowl', calories: 250, protein: 10, carbs: 30, fat: 5 },
      { mealId: meal.id, name: 'Eggs', portion: '2 large', calories: 150, protein: 10, carbs: 10, fat: 10 }
    ]);
    if (itemsError) console.error("Error creating meal items:", itemsError);

    // Meal Image
    const { error: imgError } = await supabase.from('MealImage').insert([{
      mealId: meal.id, imageUrl: 'https://example.com/breakfast.jpg', aiDetectedFood: 'Oatmeal, Eggs'
    }]);
    if (imgError) console.error("Error creating meal image:", imgError);

    // Voice Transcript
    const { error: voiceError } = await supabase.from('VoiceTranscript').insert([{
      mealId: meal.id, transcript: 'I ate a bowl of oatmeal and two eggs', aiFoodSummary: 'Oatmeal, Eggs'
    }]);
    if (voiceError) console.error("Error creating voice transcript:", voiceError);
  }

  // 5. Create AI Recommendation
  const { error: aiError } = await supabase.from('AIRecommendation').insert([{
    userId, adviceText: 'Great start to the day! Try to drink more water.', categories: 'Diet, Activity'
  }]);
  if (aiError) console.error("Error creating AI recommendation:", aiError);

  console.log("Database seeded successfully!");
}

seed();
