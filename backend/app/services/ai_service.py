import httpx
import asyncio
from typing import Dict, Any, Optional
from app.config.settings import settings
from app.utils.classification_helpers import (
    parse_api_result,
    has_question,
    is_clear_greeting,
    is_unproductive_label,
    PRODUCTIVE_KEYWORDS,
    UNPRODUCTIVE_KEYWORDS,
    fallback_has_question,
    fallback_is_clear_greeting,
)


class AIService:
    def __init__(self):
        self.api_key = settings.huggingface_api_key
        self.classification_model = settings.classification_model
        self.generation_model = "mistralai/Mistral-7B-Instruct-v0.2"
        self.api_url = "https://router.huggingface.co/hf-inference/models"

    def _get_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    def _request_payload(self, text: str) -> Dict:
        return {
            "inputs": text,
            "parameters": {
                "candidate_labels": [
                    "requer ação ou resposta: pergunta, solicitação, pedido de informação ou documento",
                    "apenas cortesia: cumprimentos, agradecimento sem solicitação"
                ]
            }
        }

    def _interpret_result(self, labels: list, scores: list, text: str) -> Optional[Dict[str, Any]]:
        if not labels or not scores:
            return None
        top_label = labels[0].lower()
        top_score = float(scores[0])
        text_lower = text.lower()
        if has_question(text_lower) and not is_clear_greeting(text_lower):
            return {"category": "Produtivo", "confidence": max(top_score, 0.85)}
        category = "Improdutivo" if is_unproductive_label(top_label) else "Produtivo"
        return {"category": category, "confidence": top_score}

    async def classify_text(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            return self._fallback_classification(text)
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                url = f"{self.api_url}/{self.classification_model}"
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json=self._request_payload(text)
                )
                if response.status_code == 200:
                    labels, scores = parse_api_result(response.json())
                    out = self._interpret_result(labels, scores, text)
                    if out:
                        return out
                elif response.status_code == 503:
                    await asyncio.sleep(5)
                    response = await client.post(url, headers=self._get_headers(), json=self._request_payload(text))
                    if response.status_code == 200:
                        labels, scores = parse_api_result(response.json())
                        out = self._interpret_result(labels, scores, text)
                        if out:
                            return out
                return self._fallback_classification(text)
        except Exception:
            return self._fallback_classification(text)

    def _fallback_classification(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        productive_count = sum(1 for kw in PRODUCTIVE_KEYWORDS if kw in text_lower)
        unproductive_count = sum(1 for kw in UNPRODUCTIVE_KEYWORDS if kw in text_lower)
        if fallback_has_question(text_lower) and not fallback_is_clear_greeting(text_lower):
            return {"category": "Produtivo", "confidence": min(0.85 + (productive_count * 0.05), 0.95)}
        if productive_count > 0:
            if unproductive_count > 0 and unproductive_count >= productive_count:
                return {"category": "Improdutivo", "confidence": min(0.7 + (unproductive_count * 0.05), 0.95)}
            return {"category": "Produtivo", "confidence": min(0.75 + (productive_count * 0.05), 0.95)}
        if unproductive_count > 0:
            return {"category": "Improdutivo", "confidence": min(0.7 + (unproductive_count * 0.05), 0.95)}
        return {"category": "Produtivo", "confidence": 0.65}

    async def generate_response(self, original_content: str, category: str) -> str:
        if not self.api_key:
            return self._fallback_response(category, original_content)
        try:
            prompt = self._build_response_prompt(original_content, category)
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.api_url}/{self.generation_model}",
                    headers=self._get_headers(),
                    json={
                        "inputs": prompt,
                        "parameters": {"max_new_tokens": 300, "temperature": 0.7, "return_full_text": False}
                    }
                )
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        generated_text = result[0].get("generated_text", "")
                        return self._clean_response(generated_text)
                return self._fallback_response(category, original_content)
        except Exception:
            return self._fallback_response(category, original_content)

    def _build_response_prompt(self, content: str, category: str) -> str:
        if category == "Produtivo":
            return f"""<s>[INST] Você é um assistente profissional de uma empresa financeira.
Gere uma resposta formal e profissional em português para o seguinte email que requer ação:
Email: {content[:500]}
A resposta deve: Ser cordial e profissional, confirmar o recebimento, indicar que a solicitação será tratada, ter no máximo 3 parágrafos.
[/INST]"""
        return f"""<s>[INST] Você é um assistente profissional de uma empresa financeira.
Gere uma resposta curta e cordial em português para o seguinte email de cortesia:
Email: {content[:500]}
A resposta deve: Ser breve e educada, agradecer a mensagem, ter no máximo 2 parágrafos.
[/INST]"""

    def _fallback_response(self, category: str, content: str) -> str:
        if category == "Produtivo":
            return """Prezado(a),
Agradecemos o seu contato. Recebemos sua mensagem e ela já foi encaminhada para análise da equipe responsável.
Em breve, um de nossos especialistas entrará em contato com mais informações sobre sua solicitação.
Atenciosamente,
Equipe de Atendimento"""
        return """Prezado(a),
Agradecemos sua gentil mensagem!
Desejamos igualmente tudo de bom para você e sua família.
Cordialmente,
Equipe de Atendimento"""

    def _clean_response(self, text: str) -> str:
        text = text.strip()
        for prefix in ["Resposta:", "Email:", "Mensagem:"]:
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        return text
