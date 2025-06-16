export interface ClarificationState {
  destination?: string | null;
  travelerType?: string | null;
  budget?: string | null;
  interests?: string[];
  inputHistory: string[];
  isPlanReady: boolean;
}

export async function clarify(input: string, state: ClarificationState) {
  try {
    const res = await fetch("http://localhost:3001/api/clarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, state }),
    });
    if (!res.ok) {
      let errorMsg = "Clarify API error";
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message || "Network or server error");
    }
    throw new Error("Unknown error");
  }
}
