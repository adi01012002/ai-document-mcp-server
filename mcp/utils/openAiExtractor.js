
// import OpenAI from "openai";
// import dotenv from "dotenv";
// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// /**
//  * Detect document type using OpenAI (Aadhaar, PAN, Bank Statement, Salary Slip, etc.)
//  */
// async function detectDocumentType(text) {
//   const prompt = `Analyze the following document text and classify it as one of these types: aadhaar, pan, bank_account_details, salary_slip, loan_application, or unknown.\n\nDocument text:\n"""${text}"""\n\nRespond with only the document_type keyword.`;

//   const completion = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       { role: "system", content: "You are a document classification assistant." },
//       { role: "user", content: prompt },
//     ],
//     temperature: 0.0,
//     max_tokens: 10,
//   });

//   const type = completion.choices[0].message.content.trim().toLowerCase();
//   return type;
// }

// /**
//  * Create dynamic prompts based on document type
//  */
// function getExtractionPrompt(documentType, text) {
//   switch (documentType) {
//     case "aadhaar":
//       return `Extract the following fields from this Aadhaar card text: full_name, dob, father_name, gender, aadhaar_number, address, document_type (aadhaar, loan_application, or general). Return a JSON object. Text: """${text}"""`;

//     case "pan":
//       return `Extract these PAN card fields: full_name, father_name, dob, pan_number, document_type (aadhaar, loan_application, or general). Return a JSON object. Text: """${text}"""`;

//     case "bank_account_details":
//       return `Extract fields from bank statement: account_holder_name, account_number, IFSC_Code, bank_name, balance, statement_period, document_type,address_of_bank (aadhaar, loan_application, or general). Return JSON. Text: """${text}"""`;

//     case "salary_slip":
//       return `Extract from salary slip: employee_name, employer_name, salary_amount, month, year, designation, document_type (aadhaar, loan_application, or general). Return JSON. Text: """${text}"""`;

//     case "loan_application":
//       return `Extract: applicant_name, dob, address, loan_amount, loan_type, employment_type, document_type (aadhaar, loan_application, or general). Return JSON. Text: """${text}"""`;

//     default:
//       return `Try to extract general fields like full_name, dob, address, id_number if available. Return JSON. Text: """${text}"""`;
//   }
// }

// /**
//  * Extract structured data based on document type
//  */
// export async function extractUserDetails(text) {
//   try {
//     // Step 1: Detect type of document
//     const documentType = await detectDocumentType(text);

//     // Step 2: Create prompt based on detected type
//     const prompt = getExtractionPrompt(documentType, text);

//     // Step 3: Send to OpenAI to extract info
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful assistant that extracts structured data from documents.",
//         },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.0,
//       max_tokens: 512,
//     });

//     const responseText = completion.choices[0].message.content;
//     let extracted;
//     // console.log("OpenAI response:", responseText);


//     try {
//       extracted = JSON.parse(responseText);
//     } catch (e) {
//       const match = responseText.match(/\{[\s\S]*\}/);
//       if (match) {
//         extracted = JSON.parse(match[0]);
//       } else {
//         throw new Error("OpenAI response could not be parsed as JSON");
//       }
//     }

//     // Final structured result
//     return {
//       document_type: documentType,
//       extracted_fields: extracted,
//     };

//   } catch (error) {
//     console.error("❌ OpenAI extraction error:", error.message);
//     throw new Error("Document parsing failed");
//   }
// }




import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

// Initialize Gemini client
const aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = aiClient.getGenerativeModel({
  model: "gemini-2.0-flash", // or gemini-1.5-flash
});

/**
 * Detect document type using Gemini
 */
async function detectDocumentType(text) {
  const prompt = `Analyze the following document text and classify it as one of these types: aadhaar, pan, bank_account_details, salary_slip, loan_application, or unknown.\n\nDocument text:\n"""${text}"""\n\nRespond with only the document_type keyword.`;

  const result = await aiModel.generateContent(prompt);
  const type = result.response.text().trim().toLowerCase();
  return type;
}

/**
 * Create dynamic prompts based on document type
 */
function getExtractionPrompt(documentType, text) {
  switch (documentType) {
    case "aadhaar":
      return `Extract the following fields from this Aadhaar card text: full_name, dob, father_name, gender, aadhaar_number, address, document_type (aadhaar, loan_application, or general). Return a JSON object. Text: """${text}"""`;

    case "pan":
      return `Extract these PAN card fields: full_name, father_name, dob, pan_number, document_type (aadhaar, loan_application, or general). Return a JSON object. Text: """${text}"""`;

    case "bank_account_details":
      return `Extract fields from bank statement: account_holder_name, account_number, IFSC_Code, bank_name, balance, statement_period, document_type,address_of_bank (aadhaar, loan_application, or general). Return JSON. Text: """${text}"""`;

    case "salary_slip":
      return `Extract from salary slip: employee_name, employer_name, salary_amount, month, year, designation, document_type (aadhaar, loan_application, or general). Return JSON. Text: """${text}"""`;

    case "loan_application":
      return `Extract: applicant_name, dob, address, loan_amount, loan_type, employment_type, document_type (aadhaar, loan_application, or general). Return JSON. Text: """${text}"""`;

    default:
      return `Try to extract general fields like full_name, dob, address, id_number if available. Return JSON. Text: """${text}"""`;
  }
}

/**
 * Extract structured data
 */
export async function extractUserDetails(text) {
  try {
    // Step 1: Detect type of document
    const documentType = await detectDocumentType(text);

    // Step 2: Create prompt based on detected type
    const prompt = getExtractionPrompt(documentType, text);

    // Step 3: Extract info using Gemini
    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text();

    let extracted;
    try {
      extracted = JSON.parse(responseText);
    } catch (e) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        extracted = JSON.parse(match[0]);
      } else {
        throw new Error("Gemini response could not be parsed as JSON");
      }
    }

    return {
      document_type: documentType,
      extracted_fields: extracted,
    };

  } catch (error) {
    console.error("❌ Gemini extraction error:", error.message);
    throw new Error("Document parsing failed");
  }
}
