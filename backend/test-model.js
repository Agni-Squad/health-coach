const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AQ.Ab8RN6IYlV9y7kpww_1hbsQEHKoP0ycxeP3issVvYx5SjA3dQw');
(async () => {
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro', 'gemini-pro-vision'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent('hello');
      console.log(m, 'WORKS');
    } catch(e) {
      console.log(m, 'FAILED:', e.message);
    }
  }
})();
