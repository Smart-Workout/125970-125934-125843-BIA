from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse  # ✅ เพิ่มบรรทัดนี้!
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import chromadb
from chromadb.utils import embedding_functions

app = FastAPI(title="RAG Exercise API (Retrieval Only)")

# โหลด ChromaDB ตอนเริ่มต้น
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("exercise_instructions")

# Mount static folder (ต้องมีโฟลเดอร์ static และไฟล์ index.html)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ChatRequest(BaseModel):
    query: str
    n_results: Optional[int] = 5
    filter_source: Optional[str] = None

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        where_filter = {}
        if request.filter_source:
            where_filter = {"source": request.filter_source}
        
        results = collection.query(
            query_texts=[request.query],
            n_results=request.n_results,
            where=where_filter if where_filter else None,
            include=["documents", "metadatas", "distances"]
        )
        
        if not results['ids'] or not results['ids'][0]:
            return {
                "query": request.query,
                "results": [],
                "message": "ไม่พบข้อมูลที่เกี่ยวข้อง"
            }
        
        response_results = []
        for doc_id, doc, meta, dist in zip(
            results['ids'][0],
            results['documents'][0],
            results['metadatas'][0],
            results['distances'][0]
        ):
            response_results.append({
                "id": doc_id,
                "source": meta.get("source", "unknown"),
                "category": meta.get("category", meta.get("body_parts", "")),
                "document": doc,
                "metadata": meta,
                "relevance_score": round(1 - dist, 4)
            })
        
        return {
            "query": request.query,
            "total_results": len(response_results),
            "results": response_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return FileResponse("static/index.html")  # ✅ ตอนนี้ใช้ได้แล้ว