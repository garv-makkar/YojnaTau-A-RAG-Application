"""Regression checks without loading a model or contacting a provider.

Flask, NumPy and python-dotenv are real; external ML/PDF dependencies are
replaced at the import boundary. These tests do not evaluate embedding quality.
"""
import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch

import numpy as np

DEPENDENCIES = (
    "PyPDF2", "sentence_transformers", "tqdm", "flask_cors", "groq",
    "torch", "rank_bm25", "nltk", "nltk.tokenize",
)
fakes = {name: Mock() for name in DEPENDENCIES}
fakes["tqdm"].tqdm.side_effect = lambda values, **kwargs: values
fakes["nltk.tokenize"].word_tokenize.side_effect = str.split
spec = importlib.util.spec_from_file_location(
    "yojna_backend", Path(__file__).resolve().parents[1] / "backend" / "app.py"
)
backend = importlib.util.module_from_spec(spec)
with patch.dict(sys.modules, {**fakes, spec.name: backend}):
    spec.loader.exec_module(backend)


class RetrievalTests(unittest.TestCase):
    def search(self, lexical, semantic):
        retriever = backend.HybridRetriever.__new__(backend.HybridRetriever)
        retriever.chunks = [f"chunk {i}" for i in range(len(lexical))]
        retriever.page_numbers = list(range(1, len(lexical) + 1))
        retriever.bm25 = Mock()
        retriever.bm25.get_scores.return_value = np.array(lexical, dtype=float)
        retriever.semantic_model = Mock()
        retriever.embeddings = Mock()
        scores = Mock()
        scores.squeeze.return_value.numpy.return_value = np.array(semantic)
        with patch.object(backend.torch, "matmul", return_value=scores):
            with np.errstate(divide="raise", invalid="raise"):
                results = retriever.search("unknown keyword")
        scores.squeeze.assert_called_once_with(0)
        return results

    def test_equal_bm25_scores_do_not_divide_by_zero(self):
        results = self.search([0, 0], [0.9, 0.8])
        self.assertEqual([r.page_number for r in results], [1, 2])
        self.assertAlmostEqual(results[0].score, 0.63)

    def test_single_chunk_preserves_score_dimension(self):
        results = self.search([0], [0.9])
        self.assertEqual(len(results), 1)
        self.assertAlmostEqual(results[0].score, 0.63)

    def test_weighting_and_threshold_are_preserved(self):
        results = self.search([0, 10], [0.2, 0.8])
        self.assertEqual([r.page_number for r in results], [2])
        self.assertAlmostEqual(results[0].score, 0.86)

    def test_empty_document_has_actionable_error(self):
        retriever = backend.HybridRetriever.__new__(backend.HybridRetriever)
        with self.assertRaisesRegex(ValueError, "no usable text chunks"):
            retriever.add_texts([])

    def test_pdf_pages_without_text_are_skipped(self):
        page = Mock()
        page.extract_text.return_value = None
        with patch.object(backend.PyPDF2, "PdfReader") as reader:
            reader.return_value.pages = [page]
            with patch("builtins.open", unittest.mock.mock_open(read_data=b"pdf")):
                self.assertEqual(backend.PDFProcessor().read_pdf("sample.pdf"), [])


class ApiTests(unittest.TestCase):
    def setUp(self):
        backend.chatbot = None
        self.client = backend.app.test_client()

    def tearDown(self):
        backend.chatbot = None

    def test_health_and_preflight_do_not_initialize_rag(self):
        with patch.object(backend, "RAGChatbot") as factory:
            self.assertEqual(self.client.get("/").status_code, 200)
            self.assertEqual(self.client.options("/chat").status_code, 200)
            self.assertEqual(self.client.get("/missing").status_code, 404)
        factory.assert_not_called()

    def test_initialization_uses_backend_relative_pdf_once(self):
        with patch.dict(backend.os.environ, {"PDF_PATH": "all_in_one.pdf"}):
            with patch.object(backend, "RAGChatbot") as factory:
                factory.return_value.conversation_history = [{"role": "system", "content": "rules"}]
                self.assertEqual(self.client.post("/clear_history").status_code, 200)
                self.assertEqual(self.client.post("/clear_history").status_code, 200)
                factory.assert_called_once_with(str(backend.BASE_DIR / "all_in_one.pdf"))

    def test_invalid_messages_return_400(self):
        backend.chatbot = Mock()
        for payload in ({}, {"message": " "}, {"message": 123}, [], None):
            with self.subTest(payload=payload):
                self.assertEqual(self.client.post("/chat", json=payload).status_code, 400)
        self.assertEqual(self.client.post("/chat", data="invalid", content_type="application/json").status_code, 400)
        backend.chatbot.generate_response.assert_not_called()

    def test_invalid_message_does_not_initialize_rag(self):
        with patch.object(backend, "RAGChatbot") as factory:
            self.assertEqual(self.client.post("/chat", json={"message": 123}).status_code, 400)
        factory.assert_not_called()

    def test_chat_trims_message_and_returns_history(self):
        backend.chatbot = Mock()
        backend.chatbot.conversation_history = [{"role": "assistant", "content": "answer"}]
        response = self.client.post("/chat", json={"message": " pension scheme "})
        self.assertEqual(response.status_code, 200)
        backend.chatbot.generate_response.assert_called_once_with("pension scheme")
        self.assertEqual(response.get_json()["conversation_history"], backend.chatbot.conversation_history)

    def test_reset_keeps_system_prompt(self):
        backend.chatbot = Mock()
        system = {"role": "system", "content": "rules"}
        backend.chatbot.conversation_history = [system, {"role": "user", "content": "hello"}]
        self.assertEqual(self.client.post("/clear_history").status_code, 200)
        self.assertEqual(backend.chatbot.conversation_history, [system])


if __name__ == "__main__":
    unittest.main()
