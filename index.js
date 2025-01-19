import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import request from "request";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Proxy endpoint
app.post("/proxy", async (req, res) => {
  const apiUrl =
    "https://api.langflow.astra.datastax.com/lf/b816cadf-0d1b-467a-af15-9d08e688f037/api/v1/run/2a0df184-b94a-4d75-b7ca-c9a59f87da49?stream=false";

  const token =
    "AstraCS:YOxHLaQpHCQFTZUoPedbIzIT:122e02639cd757a2a1dde5c38c70535500eb4f2ee1c35a9a0fb9e438b0627cd1"; // Replace with your actual token

  try {
    const apiResponse = await axios.post(apiUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    res.status(apiResponse.status).json(apiResponse.data); // Send back the API's response
  } catch (error) {
    console.error("Error forwarding request to the API:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Internal server error",
    });
  }
});

// Function to convert date and time into the desired format
function formatDateTime(data) {
  const [year, month, day] = data.dateOfBirth.split("-"); // Split the date of birth
  const [hour, min] = data.time.split(":"); // Split the time

  return {
    day: parseInt(day),
    month: parseInt(month),
    year: parseInt(year),
    hour: parseInt(hour),
    min: parseInt(min),
  };
}

// New API for GET /getplanets
app.post("/get-planets", async (req, res) => {
  const { name, dateOfBirth, time, gender, state, city } = req.body;

  if (!name || !dateOfBirth || !time || !gender || !state || !city) {
    return res.status(400).json({
      error: true,
      errorMessage:
        "All query parameters (name, dob, time, gender, state, city) are required.",
    });
  }

  const requestData = {
    name,
    dateOfBirth,
    time,
    gender,
    state,
    city,
  };

  const formattedData = formatDateTime(requestData);
  console.log(formattedData);

  // API URL to fetch planetary data
  const astrologyApiUrl = "https://json.astrologyapi.com/v1/planets";

  const options = {
    method: "POST",
    url: astrologyApiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic NjM2OTc1OjhmYThmZDUzNzMwYzExNTI1ZGJjMTEyOWQ2MjEyZTNlYTVmMDMwMDI=",
    },
    body: JSON.stringify({
      day: 27,
      month: 6,
      year: 2000,
      hour: 15,
      min: 30,
      lat: 25.7464,
      lon: 82.6837,
      tzone: 5.5,
    }),
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.send({ error: false, data: JSON.parse(response.body) });
  });
});

// Get kundali
app.post("/get-kundali", async (req, res) => {
  const { data } = req.body;
  console.log("alo");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Using the below planetary data, generate a comprehensive Kundali (birth chart) covering the 12 houses. Offer insights on the following aspects:

Career: Based on the position of planets in relevant houses and their signs, give insights into the person's career path, strengths, and potential challenges. Mention any favorable planetary aspects for career growth or struggles.

Relationships: Provide insights into personal relationships, including family, romantic, and social connections. Highlight any planets in the 7th house (relationships) or aspects that might influence love life, friendships, or family dynamics.

Personal Growth: Based on the positions of the planets in the houses, interpret the person's potential for self-growth and development. Address any planetary influences in the 1st house (self) or aspects that might encourage personal transformation or indicate areas for improvement.

Family and Social Connections: Analyze the planetary influences on family life, including potential challenges in home life or positive influences for social harmony. Mention planets in the 4th house (home) and aspects related to social interactions.

Kundali Overview: Offer a holistic view of the Kundali with a focus on how each planet in each house might influence the person's life journey. Ensure that the full-degree and normalized degree of each planet in relation to its house and sign are considered.

Daily and Monthly Horoscope: Provide short daily and monthly horoscope insights based on the current transiting positions of the planets. Highlight key moments for the individual’s career, relationships, health, and spiritual life during the time period.

Please make sure your interpretations are clear, concise, and grounded in the positions and movements of the planets. Provide actionable advice that the individual can apply in their daily life

Strictly avoid using tables and other unnecessary information in the response

Add Suitable emojis in all the major bullets
${JSON.stringify(data)}
`;

  console.log("prompt", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(400).json({
      error: false,
      errorMessage: error,
    });
  }
});

app.post("/get-ai-recommendations", async (req, res) => {
  const { data } = req.body;
  console.log("alo");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Based on the provided planetary data for the person’s birth chart, offer personalized recommendations as follows:

Gemstone Suggestions:

Provide personalized gemstone recommendations that align with the person's astrological placements. Mention which gemstones will enhance beneficial planetary energies and mitigate any adverse influences.
For each gemstone, explain its importance, benefits, and how it relates to the individual's unique planetary alignments (e.g., if Venus is strong, recommend a diamond, or if Saturn is malefic, suggest a blue sapphire).
Pooja (Rituals) Recommendations:

Suggest specific pooja (rituals) or prayers based on planetary positions. These rituals should focus on strengthening favorable planets or neutralizing challenging ones.
Include explanations on the importance and benefits of each recommended ritual (e.g., for Rahu or Ketu, recommend a specific pooja to mitigate their effects, or for the Moon, suggest a ritual to enhance mental peace and emotional stability).
Clarify the proper way to conduct these rituals (e.g., specific mantras, timings, and location).
Do’s and Don’ts:

Provide clear Do’s and Don’ts based on the individual’s planetary placements.
Highlight behavioral aspects that need to be avoided (e.g., avoid taking impulsive decisions during Mercury retrograde, or refrain from excess socializing if Saturn is in the 12th house).
Suggest positive actions that align with the individual’s astrological strengths (e.g., engage in intellectual activities if Mercury is strong, or focus on creativity if Venus is prominent).

Add Suitable emojis in all the major bullets

${JSON.stringify(data)}
`;

  console.log("prompt", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(400).json({
      error: false,
      errorMessage: error,
    });
  }
});

app.post("/get-spiritual-content", async (req, res) => {
  const { data } = req.body;
  console.log("alo");
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Using the provided planetary data, offer tailored spiritual content that aligns with the person's horoscope insights. The content should focus on:

Meditation Suggestions:

Recommend specific meditation practices based on the individual's planetary positions. Focus on meditations that correspond to the person’s spiritual needs or areas of emotional and mental growth.
For example, if the Moon’s position suggests emotional turbulence, recommend calming meditation practices, or if Mars is strong, suggest dynamic, energizing meditations.
Include tips for better focus or relaxation based on the planetary influences.
Workout Suggestions:

Offer workout suggestions that complement the person’s astrological strengths and weaknesses. For example, if the person has strong fire elements (like a prominent Mars), suggest more intense, physically demanding workouts to channel their energy effectively.
For those with strong Earth or Water elements, offer gentle exercises like yoga or tai chi, which are designed to balance energies and maintain peace.
Sleep Content:

Suggest sleep routines tailored to the person’s needs based on planetary influences. For instance, if the person’s Sun or Moon placement affects their sleep cycle, offer advice on the best times to sleep or the ideal environment for rest.
Provide tips on how to enhance sleep quality using astrological remedies, such as sleeping with specific gemstones or keeping the room aligned with favorable planetary energies.

Add Suitable emojis in all the major bullets
${JSON.stringify(data)}
`;

  console.log("prompt", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(400).json({
      error: false,
      errorMessage: error,
    });
  }
});

app.post("/chat-ai", async (req, res) => {
  const { data } = req.body;
  console.log("Chat input received:", data);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyAgGyKAs-nJPqgczd7fOt067M1xubA6ozY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Chat-specific prompt
  const prompt = `
You are an advanced conversational AI specializing in astrology, gemstones, rituals, and personalized guidance. Respond to user queries in a conversational and insightful manner.

Input: "${data}"

Consider the following while crafting your response:
- Be concise yet detailed enough to provide actionable advice.
- Use emojis sparingly but meaningfully to make the response engaging (e.g., 💎 for gemstones, 🕉️ for rituals, or 🌟 for astrological tips).
- Maintain a friendly and professional tone.

Output a response that matches the user’s query, ensuring accuracy and depth in the explanation.
The response should be short and crisp also try to text like a human, don't use markdown, maximum 3-4 lines is enough if not needed more.
`;

  console.log("Chat prompt:", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log("Chat response:", result.response.text());

    return res.status(200).json({
      error: false,
      data: result.response.text(),
    });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return res.status(400).json({
      error: true,
      errorMessage:
        error.message || "An error occurred while processing the chat input.",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
