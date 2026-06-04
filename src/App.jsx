import { useState } from "react";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeText = async () => {
    if (!text.trim() || text.length < 100) {
      setError("Veuillez entrer au moins 100 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const shortText = text.slice(0, 1500);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Tu es un expert en detection de texte IA. Reponds UNIQUEMENT en JSON valide sans markdown ni backticks."
            },
            {
              role: "user",
              content: "Analyse ce texte de rapport de stage et reponds avec ce JSON exact: {\"score\": 75, \"verdict\": \"Probablement IA\", \"indices\": [\"indice 1\", \"indice 2\", \"indice 3\"], \"conseil\": \"conseil\"}. Score = probabilite en % que ce soit de l IA. Verdict parmi: Humain, Probablement humain, Incertain, Probablement IA, IA detectee. Texte: " + shortText
            }
          ],
          temperature: 0.1,
          max_tokens: 400,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError("Erreur API: " + data.error.message);
        return;
      }

      const raw = data.choices[0].message.content;
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l analyse. Verifiez votre cle API.");
    } finally {
      setLoading(false);
    }
  };

  const getColor = (score) => {
    if (score < 30) return "#22c55e";
    if (score < 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "Georgia, serif", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#60a5fa", marginBottom: "0.5rem" }}>
            Detecteur IA
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
            Analyse ton rapport de stage pour detecter les traces d intelligence artificielle
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#94a3b8" }}>
            Colle ton texte ici (minimum 100 caracteres) :
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Colle ici un extrait de ton rapport de stage..."
            style={{
              width: "100%", height: "200px", background: "#1e293b", color: "#f1f5f9",
              border: "1px solid #334155", borderRadius: "8px", padding: "1rem",
              fontSize: "1rem", resize: "vertical", boxSizing: "border-box"
            }}
          />
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {text.length} caracteres {text.length > 1500 && "(seuls les 1500 premiers seront analyses)"}
          </p>
        </div>

        <button
          onClick={analyzeText}
          disabled={loading}
          style={{
            width: "100%", padding: "1rem", background: loading ? "#334155" : "#3b82f6",
            color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem",
            cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", marginBottom: "2rem"
          }}
        >
          {loading ? "Analyse en cours..." : "Analyser le texte"}
        </button>

        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{
                width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 1rem",
                background: "conic-gradient(" + getColor(result.score) + " " + (result.score * 3.6) + "deg, #334155 0deg)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: getColor(result.score) }}>
                    {result.score}%
                  </span>
                </div>
              </div>
              <h2 style={{ fontSize: "1.5rem", color: getColor(result.score), margin: 0 }}>
                {result.verdict}
              </h2>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#94a3b8", marginBottom: "0.75rem" }}>Indices detectes :</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {result.indices.map((indice, i) => (
                  <li key={i} style={{ background: "#0f172a", borderRadius: "6px", padding: "0.75rem", marginBottom: "0.5rem", color: "#cbd5e1", borderLeft: "3px solid #3b82f6" }}>
                    {indice}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "#0f172a", borderRadius: "8px", padding: "1rem", borderLeft: "3px solid #22c55e" }}>
              <h3 style={{ color: "#94a3b8", marginBottom: "0.5rem" }}>Conseil :</h3>
              <p style={{ color: "#cbd5e1", margin: 0 }}>{result.conseil}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
