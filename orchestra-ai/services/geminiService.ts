import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, CashflowPoint, Alert } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generate a daily executive briefing based on current metrics and alerts.
 */
export const generateExecutiveSummary = async (
  balance: number, 
  monthlyBurn: number, 
  runway: number, 
  alerts: Alert[]
): Promise<string> => {
  if (!apiKey) {
    return "Based on current trends, your cashflow remains stable with 14 months of runway. Note: 2 high-priority alerts require attention regarding vendor payments.";
  }

  const prompt = `
    You are an expert CFO AI Assistant for a startup called "Orchestra".
    
    Current Financial Snapshot:
    - Current Balance: $${balance.toLocaleString()}
    - Monthly Burn Rate: ~$${monthlyBurn.toLocaleString()}
    - Estimated Runway: ${runway.toFixed(1)} months
    - Active Alerts: ${JSON.stringify(alerts)}
    
    Task:
    Write a 2-3 sentence proactive executive summary. 
    - Focus on the most critical risk or opportunity.
    - Be concise, professional, and actionable.
    - Do not use markdown formatting, just plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.4
      }
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Executive Summary Error:", error);
    return "Unable to generate AI insights at this moment.";
  }
}

/**
 * Generate a professional Investor/Banker Update Report
 */
export const generateInvestorReport = async (
  metrics: { balance: number; monthlyBurn: number; runway: number },
  cashflowData: CashflowPoint[]
): Promise<string> => {
  if (!apiKey) {
    return `Subject: October Investor Update - Strong Growth, Stable Runway\n\nHi everyone,\n\nWe are pleased to report that our cash position remains strong at $${metrics.balance.toLocaleString()}. Our monthly burn rate is currently $${metrics.monthlyBurn.toLocaleString()}, giving us a healthy ${metrics.runway.toFixed(1)} months of runway.\n\nKey Highlights:\n- Revenue increased by 15% MoM.\n- Optimization of infrastructure costs is underway.\n\nAs always, thank you for your support.\n\nBest,\nAlex Finance`;
  }

  const prompt = `
    Write a professional Investor Update email for a startup.
    
    Metrics:
    - Cash on Hand: $${metrics.balance.toLocaleString()}
    - Monthly Burn: $${metrics.monthlyBurn.toLocaleString()}
    - Runway: ${metrics.runway.toFixed(1)} months
    - Recent Trend: ${JSON.stringify(cashflowData.slice(-3))}
    
    Tone: Professional, transparent, and confident.
    Structure: Subject Line, Executive Summary, Key Metrics, Lowlights/Risks, and Closing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Report generation failed.";
  } catch (error) {
    return "Error generating report.";
  }
};

/**
 * Generate specific strategic actions based on transaction history
 */
export const generateStrategicActions = async (transactions: Transaction[]): Promise<{action: string, impact: string, type: 'saving' | 'risk' | 'growth'}[]> => {
  if (!apiKey) {
    return [
      { action: "Renegotiate AWS Enterprise Contract", impact: "Potential $2,400/mo saving", type: "saving" },
      { action: "Investigate 'Unknown Vendor' payments", impact: "Risk mitigation", type: "risk" },
      { action: "Move idle cash to Yield Account", impact: "+4.5% APY Interest", type: "growth" }
    ];
  }

  const prompt = `
    Analyze these transactions and suggest 3 specific strategic actions to improve cashflow.
    Transactions: ${JSON.stringify(transactions.slice(0, 15))}
    
    Return JSON array with objects containing: 'action', 'impact', and 'type' (saving, risk, or growth).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              impact: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['saving', 'risk', 'growth'] }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * AI Analysis for Transactions: Categorization and Anomaly Detection
 */
export const analyzeTransactionsAI = async (transactions: Partial<Transaction>[]): Promise<any[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, returning mock analysis");
    return transactions.map(t => ({
      ...t,
      category: 'Uncategorized (No API)',
      riskScore: 10,
      isAnomaly: false
    }));
  }

  const prompt = `
    Analyze the following financial transactions. 
    1. Assign a standardized category (e.g., Software, Payroll, Marketing, Sales, Office, Travel).
    2. Detect if the transaction is an anomaly (high risk) based on description or amount (assume > $10k is unusual for unknown vendors).
    3. Provide a risk score (0-100) and a short reason.
    
    Transactions: ${JSON.stringify(transactions)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              riskScore: { type: Type.NUMBER },
              riskReason: { type: Type.STRING },
              isAnomaly: { type: Type.BOOLEAN }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
};

/**
 * AI Forecasting: Predictive Cashflow based on Scenarios
 */
export const generateForecastAI = async (
  history: CashflowPoint[], 
  scenarioDescription: string
): Promise<{ explanation: string, data: CashflowPoint[] }> => {
  if (!apiKey) {
    return {
      explanation: "API Key missing. Using static demo data.",
      data: history // Fallback
    };
  }

  const prompt = `
    You are a financial CFO AI.
    Historical Cashflow Data (last 3 months): ${JSON.stringify(history.slice(-3))}
    
    User Scenario to Simulate: "${scenarioDescription}"
    
    Task:
    1. Project the cashflow for the NEXT 3 months based on the history and the user's "what-if" scenario.
    2. Provide a short strategic explanation of the impact.
    3. Return the data for the next 3 months in the exact JSON format as the input history.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            data: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  income: { type: Type.NUMBER },
                  expenses: { type: Type.NUMBER },
                  balance: { type: Type.NUMBER },
                  projected: { type: Type.BOOLEAN }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Forecast Error:", error);
    return { explanation: "Failed to generate forecast.", data: [] };
  }
};

/**
 * Conversational Finance Agent
 */
export const chatWithFinanceAgent = async (
  message: string,
  context: { 
    balance: number; 
    burn: number; 
    runway: number; 
    recentTransactions: Transaction[] 
  }
): Promise<string> => {
  if (!apiKey) {
    return "I can see you're asking about: " + message + ". Since I'm in demo mode (no API key), I can tell you that your current balance is $" + context.balance.toLocaleString() + ".";
  }

  // Safely handle recent transactions
  const transactions = context.recentTransactions || [];
  // Filter to last 5 transactions to keep context light
  const recentTx = transactions.slice(0, 5).map(t => `${t.date}: ${t.description} ($${t.amount})`);

  const prompt = `
    You are the "Orchestra CFO Agent". You are helpful, concise, and financially savvy.
    
    User Context:
    - Cash Balance: $${context.balance.toLocaleString()}
    - Monthly Burn: $${context.burn.toLocaleString()}
    - Runway: ${context.runway.toFixed(1)} months
    - Recent Transactions: ${JSON.stringify(recentTx)}

    User Question: "${message}"

    Answer the user's question based on their data. 
    If they ask about "runway", explain what it means for their specific number.
    If they ask about spending, refer to the burn rate or recent transactions.
    Keep answers under 50 words unless detailed analysis is requested.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "I'm having trouble accessing the financial data right now.";
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return "I'm sorry, I encountered an error processing your request.";
  }
};