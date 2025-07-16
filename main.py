from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI(title="TestMind API", description="API for generating test suites", version="1.0.0")

# Set up CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for this MVP
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic model for requirements input
class RequirementsInput(BaseModel):
    requirements: str

# POST endpoint for generating tests
@app.post("/generate-tests")
async def generate_tests(input_data: RequirementsInput):
    """
    Generate test suite based on user requirements.
    For now, returns a mock response.
    """
    return {
        "test_suite_code": "# Mock test suite will be generated here."
    }

# Root endpoint for health check
@app.get("/")
async def root():
    return {"message": "TestMind API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 