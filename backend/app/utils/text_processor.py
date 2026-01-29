import re
from typing import List

class TextProcessor:
    def __init__(self):
        self.stop_words_pt = {
            'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo',
            'as', 'até', 'com', 'como', 'da', 'das', 'de', 'dela', 'delas', 'dele',
            'deles', 'depois', 'do', 'dos', 'e', 'ela', 'elas', 'ele', 'eles', 'em',
            'entre', 'era', 'eram', 'essa', 'essas', 'esse', 'esses', 'esta', 'estas',
            'este', 'estes', 'eu', 'foi', 'foram', 'há', 'isso', 'isto', 'já', 'lhe',
            'lhes', 'lo', 'mas', 'me', 'mesmo', 'meu', 'meus', 'minha', 'minhas',
            'muito', 'na', 'nas', 'não', 'nem', 'no', 'nos', 'nós', 'nossa', 'nossas',
            'nosso', 'nossos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela', 'pelas',
            'pelo', 'pelos', 'por', 'qual', 'quando', 'que', 'quem', 'são', 'se', 'sem',
            'seu', 'seus', 'só', 'sua', 'suas', 'também', 'te', 'tem', 'tinha', 'tu',
            'tua', 'tuas', 'teu', 'teus', 'um', 'uma', 'umas', 'uns', 'você', 'vocês', 'vos'
        }

    def preprocess(self, text: str) -> str:
        text = self._clean_text(text)
        text = self._normalize_whitespace(text)
        return text

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'http[s]?://\S+', '', text)
        text = re.sub(r'\S+@\S+', '[EMAIL]', text)
        text = re.sub(r'[-=_]{3,}', '', text)
        return text

    def _normalize_whitespace(self, text: str) -> str:
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        text = '\n'.join(line.strip() for line in text.split('\n'))
        return text.strip()

    def remove_stop_words(self, text: str) -> str:
        words = text.lower().split()
        filtered_words = [word for word in words if word not in self.stop_words_pt]
        return ' '.join(filtered_words)

    def tokenize(self, text: str) -> List[str]:
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        return [word for word in text.split() if len(word) > 2]
