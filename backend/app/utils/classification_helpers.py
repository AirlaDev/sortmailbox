from typing import List, Tuple, Any

QUESTION_MARKERS = [
    "?", "como", "quando", "onde", "por que", "porque", "qual", "quais",
    "quanto", "poderiam", "podem", "preciso", "quero", "queria",
    "informar", "informação", "dúvida", "pergunta", "status",
    "como anda", "como está", "como vai", "o que"
]
GREETING_PHRASES = [
    "feliz natal", "feliz ano novo", "boas festas", "próspero ano novo",
    "gostaria de desejar", "aproveitar para desejar", "aproveitar este momento para desejar"
]
PRODUCTIVE_KEYWORDS = [
    "solicitação", "requisição", "status", "problema", "erro", "urgente",
    "suporte", "dúvida", "ajuda", "atualização", "pendente", "prazo",
    "vencimento", "pagamento", "cobrança", "contrato", "documento",
    "relatório", "análise", "verificar", "confirmar", "aprovar",
    "poderiam", "podem", "informar", "informação", "informações",
    "gostaria", "gostaríamos", "preciso", "precisamos", "quero",
    "queria", "queria saber", "quando", "como", "qual", "quais",
    "quanto", "quanto tempo", "onde", "por que", "porque",
    "enviar", "enviar o", "enviar os", "encaminhar", "fornecer",
    "disponibilizar", "disponível", "rentabilidade", "liquidez",
    "aporte", "investimento", "fundo", "carteira", "diversificar",
    "pergunta", "perguntas", "questionamento", "consulta",
    "protocolo", "ticket", "chamado", "pedido", "solicitar"
]
UNPRODUCTIVE_KEYWORDS = [
    "feliz natal", "boas festas", "feliz ano novo", "próspero ano novo",
    "parabéns", "aniversário", "obrigado", "agradecimento", "agradeço",
    "bom dia", "boa tarde", "boa noite", "felicitações", "votos",
    "abraços", "saudações", "happy", "merry", "apenas para desejar",
    "passando para desejar", "passando para agradecer", "só para agradecer",
    "só para desejar", "apenas para agradecer", "gostaria de desejar",
    "aproveitar para desejar", "sem mais", "até logo", "tchau"
]
FALLBACK_QUESTION_MARKERS = [
    "?", "poderiam", "podem", "preciso", "quero", "queria",
    "informar", "informação", "dúvida", "pergunta", "como",
    "quando", "onde", "qual", "quais", "quanto", "como anda",
    "como está", "como vai", "o que", "status", "atualização", "andamento"
]


def parse_api_result(result: Any) -> Tuple[List[str], List[float]]:
    labels: List[str] = []
    scores: List[float] = []
    if isinstance(result, dict):
        labels = result.get("labels", [])
        scores = [float(s) for s in result.get("scores", [])]
    elif isinstance(result, list) and len(result) > 0:
        for item in result:
            if isinstance(item, dict):
                labels.append(item.get("label", ""))
                scores.append(float(item.get("score", 0.0)))
    return labels, scores


def has_question(text_lower: str) -> bool:
    if any(m in text_lower for m in QUESTION_MARKERS):
        return True
    if "gostaria" in text_lower and "desejar" not in text_lower and "agradecer" not in text_lower:
        return True
    return False


def is_clear_greeting(text_lower: str) -> bool:
    return any(p in text_lower for p in GREETING_PHRASES)


def is_unproductive_label(top_label: str) -> bool:
    tl = top_label.lower()
    return (
        "cortesia" in tl or "apenas" in tl or ("sem" in tl and "solicitação" in tl)
    )


def fallback_has_question(text_lower: str) -> bool:
    if any(m in text_lower for m in FALLBACK_QUESTION_MARKERS):
        return True
    if "gostaria" in text_lower and "desejar" not in text_lower and "agradecer" not in text_lower:
        return True
    return False


def fallback_is_clear_greeting(text_lower: str) -> bool:
    return any(p in text_lower for p in GREETING_PHRASES)
