from fastapi import UploadFile
import io
try:
    from PyPDF2 import PdfReader
except ImportError:
    try:
        from pypdf2 import PdfReader
    except ImportError:
        PdfReader = None

class FileProcessor:
    async def extract_content(self, file: UploadFile) -> str:
        content = await file.read()
        filename = file.filename or ""
        if filename.endswith('.txt'):
            return self._process_txt(content)
        elif filename.endswith('.pdf'):
            return self._process_pdf(content)
        else:
            try:
                return content.decode('utf-8')
            except UnicodeDecodeError:
                return self._process_pdf(content)

    def _process_txt(self, content: bytes) -> str:
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        for encoding in encodings:
            try:
                return content.decode(encoding)
            except UnicodeDecodeError:
                continue
        return content.decode('utf-8', errors='ignore')

    def _process_pdf(self, content: bytes) -> str:
        if PdfReader is None:
            raise ValueError("PyPDF2 não está instalado. Instale com: pip install PyPDF2")
        try:
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            text_content = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
            return "\n".join(text_content)
        except Exception as e:
            raise ValueError(f"Erro ao processar PDF: {str(e)}")
