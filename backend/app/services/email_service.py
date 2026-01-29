from fastapi import UploadFile
from typing import Optional
from datetime import datetime
from app.models.schemas import EmailInput, EmailClassificationResponse, ClassificationCategory
from app.services.ai_service import AIService
from app.utils.file_processor import FileProcessor
from app.utils.text_processor import TextProcessor


def _is_courtesy_only(content: str) -> bool:
    """Detecta emails apenas de cortesia (Feliz Natal, agradecimento etc.) sem solicitação."""
    text = content.lower().strip()
    courtesy = (
        "feliz natal" in text or "boas festas" in text or "feliz ano novo" in text
        or "apenas para desejar" in text or "passando para desejar" in text
        or "passando para agradecer" in text or "só para agradecer" in text
        or "só para desejar" in text or "apenas para agradecer" in text
        or "parabéns" in text and "aniversário" in text
        or ("votos de" in text and ("feliz" in text or "ótimo" in text or "sucesso" in text))
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
        if email_input.subject:
            content = f"Assunto: {email_input.subject}\n\n{content}"

        if _is_courtesy_only(content):
            category = ClassificationCategory.IMPRODUTIVO
            confidence = 0.95
            suggested_response = await self.ai_service.generate_response(
                original_content=content,
                category=category.value,
            )
            return EmailClassificationResponse(
                category=category,
                confidence=confidence,
                suggested_response=suggested_response,
                original_content=content,
                processed_at=datetime.now(),
            )

        processed_content = self.text_processor.preprocess(content)
        processed_content = self.text_processor.remove_stop_words(processed_content)
        classification_result = await self.ai_service.classify_text(processed_content)
        category = ClassificationCategory.PRODUTIVO if classification_result["category"] == "Produtivo" else ClassificationCategory.IMPRODUTIVO
        suggested_response = await self.ai_service.generate_response(
            original_content=content,
            category=category.value,
        )
        return EmailClassificationResponse(
            category=category,
            confidence=classification_result["confidence"],
            suggested_response=suggested_response,
            original_content=content,
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
