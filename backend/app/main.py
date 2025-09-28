from fastapi import FastAPI

app = FastAPI(title="LocalRead")

@app.get("/")
def read_root():
    return {"message": "Ebook Library API is working!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
