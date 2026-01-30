from fastapi import UploadFile
from typing import Optional
from datetime import datetime
from app.models.schemas import EmailInput, EmailClassificationResponse, ClassificationCategory
from app.services.ai_service import AIService
from app.utils.file_processor import FileProcessor
from app.utils.text_processor import TextProcessor

def _is_courtesy_only(content: str) -> bool:
    text = content.lower().strip()
    has_direct_question = "?" in text
    present_future_markers = [
        "poderiam", "podem", "gostaria", "gostaríamos", "preciso", "precisamos",
        "quero", "queria", "queria saber", "quero saber", "preciso saber",
        "informar", "informe", "informem", "quando poderiam", "quando podem",
        "como faço", "como fazer", "qual o", "quais os", "quanto tempo",
        "onde posso", "por que", "porque preciso", "enviar o", "enviar os",
        "encaminhar o", "encaminhar os", "fornecer", "disponibilizar"
    ]
    has_new_question = any(pattern in text for pattern in [
        "tenho dúvida", "tenho uma dúvida", "minha dúvida", "uma dúvida sobre",
        "dúvida sobre", "dúvida a respeito", "tenho pergunta", "minha pergunta",
        "uma pergunta sobre", "pergunta sobre"
    ])
    past_references = any(pattern in text for pattern in [
        "as dúvidas", "aquelas dúvidas", "suas dúvidas", "minhas dúvidas",
        "resolveram as dúvidas", "ajudaram com as dúvidas", "tiraram as dúvidas",
        "ajudaram com aquelas dúvidas", "me ajudaram com", "ajudaram muito com",
        "as perguntas", "aquelas perguntas", "suas perguntas", "responderam as perguntas"
    ])
    financial_terms_in_context = any(pattern in text for pattern in [
        "informar sobre rentabilidade", "qual a rentabilidade", "rentabilidade de",
        "informar sobre liquidez", "qual a liquidez", "liquidez do",
        "quero fazer aporte", "gostaria de aporte", "informar sobre aporte",
        "informar sobre fundo", "qual fundo", "informação sobre fundo",
        "diversificar carteira", "como diversificar"
    ])
    if has_direct_question or any(marker in text for marker in present_future_markers):
        return False
    if has_new_question and not past_references:
        return False
    if financial_terms_in_context:
        return False
    courtesy = (
        "feliz natal" in text or "boas festas" in text or "feliz ano novo" in text
        or "apenas para desejar" in text or "passando para desejar" in text
        or "passando para agradecer" in text or "só para agradecer" in text
        or "só para desejar" in text or "apenas para agradecer" in text
        or ("parabéns" in text and "aniversário" in text)
        or ("votos de" in text and ("feliz" in text or "ótimo" in text or "sucesso" in text))
        or "que seja um ano" in text
        or ("que" in text and "seja" in text and "ano" in text and "sucesso" in text)
        or ("ano de" in text and "sucesso" in text and not financial_terms_in_context)
        or ("desejar" in text and ("feliz" in text or "boas" in text or "sucesso" in text))
        or ("foram excelentes" in text and "ajudaram" in text and not has_new_question)
    )
    if not courtesy:
        return False
    action = (
        "solicito" in text or "solicitamos" in text or "preciso que" in text
        or "precisamos que" in text or "gostaria de" in text or "gostaríamos de" in text
        or "quando poderiam" in text or "podem enviar" in text or "por favor envie" in text
        or "por favor enviar" in text or "urgente" in text or "confirmar" in text
        or "preciso receber" in text or "precisamos receber" in text
        or "dúvida sobre" in text or "pergunta sobre" in text or "como faço" in text
        or "qual o prazo" in text or "qual a data" in text or "enviar o" in text
        or "enviar os" in text or "encaminhar o" in text or "encaminhar os" in text
    )
    
    return not action


class EmailService:
    def __init__(self):
        self.ai_service = AIService()
        self.file_processor = FileProcessor()
        self.text_processor = TextProcessor()

    async def classify_email(self, email_input: EmailInput) -> EmailClassificationResponse:
        content = email_input.content or ""
        subject = email_input.subject or ""
        full_content = f"Assunto: {subject}\n\n{content}" if subject else content
        subject_lower = subject.lower()
        has_productive_subject = any(keyword in subject_lower for keyword in [
            "dúvida", "pergunta", "solicitação", "pedido", "informação",
            "informações", "consulta", "questionamento"
        ])
        if has_productive_subject:
            category = ClassificationCategory.PRODUTIVO
            confidence = 0.90
            suggested_response = await self.ai_service.generate_response(
                original_content=full_content,
                category=category.value,
            )
            return EmailClassificationResponse(
                category=category,
                confidence=confidence,
                suggested_response=suggested_response,
                original_content=full_content,
                processed_at=datetime.now(),
            )
        is_courtesy = _is_courtesy_only(full_content)
        if is_courtesy:
            category = ClassificationCategory.IMPRODUTIVO
            confidence = 0.95
            suggested_response = await self.ai_service.generate_response(
                original_content=full_content,
                category=category.value,
            )
            return EmailClassificationResponse(
                category=category,
                confidence=confidence,
                suggested_response=suggested_response,
                original_content=full_content,
                processed_at=datetime.now(),
            )
        processed_content = self.text_processor.preprocess(full_content)
        classification_result = await self.ai_service.classify_text(processed_content)
        category = ClassificationCategory.PRODUTIVO if classification_result["category"] == "Produtivo" else ClassificationCategory.IMPRODUTIVO
        suggested_response = await self.ai_service.generate_response(
            original_content=full_content,
            category=category.value,
        )
        return EmailClassificationResponse(
            category=category,
            confidence=classification_result["confidence"],
            suggested_response=suggested_response,
            original_content=full_content,
            processed_at=datetime.now(),
        )

    async def classify_email_from_file(
        self,
        file: UploadFile,
        subject: Optional[str] = None
    ) -> EmailClassificationResponse:
        content = await self.file_processor.extract_content(file)
        email_input = EmailInput(content=content, subject=subject)
        return await self.classify_email(email_input)
