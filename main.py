from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import OpenAI

# Initialize FastAPI app
app = FastAPI(title="TestMind API", description="API for generating test suites", version="1.0.0")

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
    Generate test suite based on user requirements using OpenAI GPT-4o.
    """
    try:
        # System prompt for GPT-4o
        system_prompt = """You are an expert QA engineer specializing in AI agent testing. Your task is to convert a list of natural language requirements into a structured test suite in Python using PyTest. For each requirement, generate one or more PyTest functions. Each function name must start with 'test_'. Use clear function names and add a comment explaining which requirement the test covers.

Generate complete, runnable test code that follows these guidelines:
- Import necessary modules (pytest, any mocking libraries if needed)
- Use clear, descriptive test function names
- Include docstrings for each test function
- Add assertions that validate the expected behavior
- Structure the code properly with appropriate comments

Return only the Python test code without any additional explanation or markdown formatting."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Convert these requirements into a PyTest test suite:\n\n{input_data.requirements}"}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Extract the generated code from the response
        generated_code = response.choices[0].message.content.strip()
        
        return {
            "test_suite_code": generated_code
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating test suite: {str(e)}")

# Root endpoint for health check
@app.get("/")
async def root():
    return {"message": "TestMind API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 