from typing import List, Optional
from datetime import datetime

class EmailClassificationRecord:
    def __init__(
        self,
        id: int,
        content: str,
        category: str,
        confidence: float,
        suggested_response: str,
        created_at: datetime
    ):
        self.id = id
        self.content = content
        self.category = category
        self.confidence = confidence
        self.suggested_response = suggested_response
        self.created_at = created_at

class EmailRepository:
    def __init__(self):
        self._records: List[EmailClassificationRecord] = []
        self._current_id = 0

    def save(self, record: EmailClassificationRecord) -> EmailClassificationRecord:
        self._current_id += 1
        record.id = self._current_id
        self._records.append(record)
        return record

    def find_by_id(self, record_id: int) -> Optional[EmailClassificationRecord]:
        for record in self._records:
            if record.id == record_id:
                return record
        return None

    def find_all(self) -> List[EmailClassificationRecord]:
        return self._records.copy()

    def find_by_category(self, category: str) -> List[EmailClassificationRecord]:
        return [r for r in self._records if r.category == category]

    def delete(self, record_id: int) -> bool:
        for i, record in enumerate(self._records):
            if record.id == record_id:
                self._records.pop(i)
                return True
        return False
