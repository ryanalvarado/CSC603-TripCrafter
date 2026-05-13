"""
Retrieval-Augmented Generation (RAG) service.

Embeds destination knowledge documents into a FAISS vector index
and retrieves the most relevant chunks for a given travel query.

Author: Ryan Alvarado
"""

from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

EMBED_MODEL = "all-MiniLM-L6-v2"
DATA_DIR = Path(__file__).parent / "data" / "destinations"


class RAGService:
    def __init__(self):
        self.model = SentenceTransformer(EMBED_MODEL)
        self.chunks: list[dict] = []
        self.index: faiss.IndexFlatIP | None = None
        self._build_index()

    def _build_index(self):
        for filepath in sorted(DATA_DIR.glob("*.md")):
            text = filepath.read_text()
            for paragraph in text.split("\n\n"):
                paragraph = paragraph.strip()
                if len(paragraph) > 50:
                    self.chunks.append(
                        {"text": paragraph, "source": filepath.stem}
                    )

        if not self.chunks:
            return

        texts = [c["text"] for c in self.chunks]
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings.astype("float32"))

    def retrieve(self, query: str, top_k: int = 5) -> str:
        if not self.index:
            return ""

        q_vec = self.model.encode([query], normalize_embeddings=True).astype(
            "float32"
        )
        _, indices = self.index.search(q_vec, top_k)
        results = [
            self.chunks[i]["text"]
            for i in indices[0]
            if 0 <= i < len(self.chunks)
        ]
        return "\n\n".join(results)
