// api/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the generative AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// This is the prompt template we designed
const getPrompt = (modelName, fields, modelCode, controllerCode) => {
    return `You are an expert Node.js and MongoDB programming instructor evaluating a student's practical exam submission.

**Context:**
The student was asked to create a Mongoose model and a controller with full CRUD (Create, Read, Update, Delete) functionality based on a given set of fields. The student is a beginner, so expect common syntax errors, logical flaws, and missed best practices.

**Evaluation Criteria:**
1.  **Model Correctness (40 points):**
    * Is the Mongoose schema defined correctly?
    * Does it include all the required fields from the question?
    * Are the data types appropriate (e.g., String, Number)?
    * Is the model exported correctly?
2.  **Controller Correctness (60 points):**
    * Are all 5 CRUD functions present: \`create\`, \`getAll\`, \`getById\`, \`updateById\`, \`deleteById\`?
    * Do the functions use the correct Mongoose methods (e.g., \`.create()\`, \`.find()\`, \`.findById()\`, \`.findByIdAndUpdate()\`, \`.findByIdAndDelete()\` )?
    * Is \`async/await\` used correctly for asynchronous operations?
    * Is there basic error handling (e.g., a \`try...catch\` block)?
    * Does the code correctly use \`req.body\`, \`req.params\`, and \`res.status().json()\`?

**Student's Question:**
- Model Name: ${modelName}
- Fields: ${fields.join(', ')}

**Student's Submission:**
---
**Model Code (\`model.js\`):**
\`\`\`javascript
${modelCode}
\`\`\`
---
**Controller Code (\`controller.js\`):**
\`\`\`javascript
${controllerCode}
\`\`\`
---

**Your Task:**
Analyze the student's submission based on the question and evaluation criteria. Your response MUST be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.

The JSON object must strictly follow this structure:
\`\`\`json
{
  "overallScore": "<Total score out of 100>",
  "summary": "<A brief, 1-2 sentence summary of the student's performance>",
  "modelEvaluation": {
    "score": "<Score for the model out of 40>",
    "maxScore": 40,
    "feedback": [
      {
        "type": "<'SUCCESS', 'IMPROVEMENT', 'ERROR', or 'SYNTAX'>",
        "message": "<Specific feedback on one aspect of the model code>"
      }
    ]
  },
  "controllerEvaluation": {
    "score": "<Score for the controller out of 60>",
    "maxScore": 60,
    "feedback": [
      {
        "type": "<'SUCCESS', 'IMPROVEMENT', 'ERROR', or 'SYNTAX'>",
        "message": "<Specific feedback on one aspect of the controller code>"
      }
    ]
  }
}
\`\`\`

Calculate the scores for the model and controller sections based on the criteria. The \`overallScore\` must be the sum of the model and controller scores. Provide multiple feedback items for each section if necessary. Be specific and constructive in your feedback messages.`;
};

const evaluateCode = async (studentData) => {
    const { question, submission } = studentData;
    const { modelName, fields } = question;
    const { modelCode, controllerCode } = submission;

    const prompt = getPrompt(modelName, fields, modelCode, controllerCode);

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid evaluation from the AI model.");
    }
};

module.exports = { evaluateCode };