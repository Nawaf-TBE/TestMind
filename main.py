from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
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
    agent_api_url: str

# POST endpoint for generating and running tests
@app.post("/generate-and-run-tests")
async def generate_and_run_tests(input_data: RequirementsInput):
    """
    Generate test suite based on user requirements using OpenAI GPT-4o and run the tests.
    """
    temp_file_path = "temp_test_suite.py"
    
    try:
        # System prompt for GPT-4o
        system_prompt = """You are an expert QA engineer. Your task is to convert natural language requirements into a Python test suite using PyTest. The tests will be run in an environment where an AGENT_API_URL environment variable is set. You must import 'os' and 'requests'. Your test functions should read this environment variable to get the target API endpoint and use the 'requests' library to interact with it. Each function name must start with 'test_'.

Generate complete, runnable test code that follows these guidelines:
- Always import 'os' and 'requests' libraries at the top
- Read AGENT_API_URL from environment variable: agent_url = os.getenv('AGENT_API_URL', 'http://localhost:8001')
- Use requests.post() to make HTTP calls to the agent API
- Create test functions that validate the agent's API responses
- Use clear, descriptive test function names
- Include docstrings for each test function
- Add assertions that validate the expected behavior
- Structure the code properly with appropriate comments
- Make realistic API calls based on the requirements provided

Return only the Python test code without any additional explanation or markdown formatting."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Convert these requirements into a PyTest test suite that tests an API at the URL provided in AGENT_API_URL environment variable:\n\n{input_data.requirements}"}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Extract the generated code from the response
        generated_code = response.choices[0].message.content.strip()
        
        # Save the generated code to a temporary file
        with open(temp_file_path, 'w') as f:
            f.write(generated_code)
        
        # Prepare environment variables for the test run
        test_env = os.environ.copy()
        test_env["AGENT_API_URL"] = input_data.agent_api_url
        
        # Run pytest on the temporary file
        result = subprocess.run(
            ["pytest", temp_file_path, "-v"],
            capture_output=True,
            text=True,
            env=test_env
        )
        
        # Capture the test results
        test_results = result.stdout
        if result.stderr:
            test_results += f"\n\nErrors:\n{result.stderr}"
        
        return {
            "test_suite_code": generated_code,
            "test_results": test_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating or running test suite: {str(e)}")
    
    finally:
        # Clean up: delete the temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors

# Root endpoint for health check
@app.get("/")
async def root():
    return {"message": "TestMind API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 