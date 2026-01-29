import httpx
from typing import Dict, Any
from app.config.settings import settings

class AIService:
    def __init__(self):
        self.api_key = settings.huggingface_api_key
        self.classification_model = "facebook/bart-large-mnli"
        self.generation_model = "mistralai/Mistral-7B-Instruct-v0.2"
        self.api_url = "https://api-inference.huggingface.co/models"

    def _get_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    async def classify_text(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            return self._fallback_classification(text)
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.api_url}/{self.classification_model}",
                    headers=self._get_headers(),
                    json={
                        "inputs": text,
                        "parameters": {
                            "candidate_labels": ["email produtivo que requer ação", "email improdutivo sem necessidade de ação"]
                        }
                    }
                )
                if response.status_code == 200:
                    result = response.json()
                    labels = result.get("labels", [])
                    scores = result.get("scores", [])
                    if labels and scores:
                        top_label = labels[0]
                        top_score = scores[0]
                        category = "Produtivo" if "produtivo" in top_label.lower() else "Improdutivo"
                        return {"category": category, "confidence": top_score}
                return self._fallback_classification(text)
        except Exception:
            return self._fallback_classification(text)

    def _fallback_classification(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        productive_keywords = [
            "solicitação", "requisição", "status", "problema", "erro", "urgente",
            "suporte", "dúvida", "ajuda", "atualização", "pendente", "prazo",
            "vencimento", "pagamento", "cobrança", "contrato", "documento",
            "relatório", "análise", "verificar", "confirmar", "aprovar"
        ]
        unproductive_keywords = [
            "feliz natal", "feliz ano novo", "parabéns", "aniversário",
            "obrigado", "agradecimento", "bom dia", "boa tarde", "boa noite",
            "felicitações", "votos", "abraços", "saudações", "happy", "merry"
        ]
        productive_count = sum(1 for kw in productive_keywords if kw in text_lower)
        unproductive_count = sum(1 for kw in unproductive_keywords if kw in text_lower)
        if productive_count > unproductive_count:
            confidence = min(0.7 + (productive_count * 0.05), 0.95)
            return {"category": "Produtivo", "confidence": confidence}
        elif unproductive_count > 0:
            confidence = min(0.7 + (unproductive_count * 0.05), 0.95)
            return {"category": "Improdutivo", "confidence": confidence}
        return {"category": "Produtivo", "confidence": 0.6}

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
                        "parameters": {
                            "max_new_tokens": 300,
                            "temperature": 0.7,
                            "return_full_text": False
                        }
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

A resposta deve:
- Ser cordial e profissional
- Confirmar o recebimento
- Indicar que a solicitação será tratada
- Ter no máximo 3 parágrafos
[/INST]"""
        else:
            return f"""<s>[INST] Você é um assistente profissional de uma empresa financeira.
Gere uma resposta curta e cordial em português para o seguinte email de cortesia:

Email: {content[:500]}

A resposta deve:
- Ser breve e educada
- Agradecer a mensagem
- Ter no máximo 2 parágrafos
[/INST]"""

    def _fallback_response(self, category: str, content: str) -> str:
        if category == "Produtivo":
            return """Prezado(a),

Agradecemos o seu contato. Recebemos sua mensagem e ela já foi encaminhada para análise da equipe responsável.

Em breve, um de nossos especialistas entrará em contato com mais informações sobre sua solicitação.

Atenciosamente,
Equipe de Atendimento"""
        else:
            return """Prezado(a),

Agradecemos sua gentil mensagem!

Desejamos igualmente tudo de bom para você e sua família.

Cordialmente,
Equipe de Atendimento"""

    def _clean_response(self, text: str) -> str:
        text = text.strip()
        unwanted_prefixes = ["Resposta:", "Email:", "Mensagem:"]
        for prefix in unwanted_prefixes:
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        return text
