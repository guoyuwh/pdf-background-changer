# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import io

app = FastAPI()

# Enable CORS for your Next.js app
origins = [
    "http://localhost:3000",  # Adjust this to match your Next.js app's origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from your Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LIGHT_BROWN = (245 / 255, 222 / 255, 179 / 255)


@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    try:
        # Read the uploaded file into memory
        file_contents = await file.read()
        pdf_in_memory = io.BytesIO(file_contents)
        
        # Open the PDF with PyMuPDF
        doc = fitz.open(stream=pdf_in_memory, filetype="pdf")
    
        # Iterate through each page
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            rect = page.rect  # Get the page dimensions

            # Create a rectangle over the entire page and fill it with light brown color
            page.draw_rect(rect, color=None, fill=LIGHT_BROWN, overlay=False)
        
        # Save the modified PDF to a bytes buffer
        output_pdf = io.BytesIO()
        doc.save(output_pdf)
        doc.close()
        output_pdf.seek(0)
        
        # Return the processed PDF
        return StreamingResponse(
            output_pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=processed_{file.filename}"
            },
        )
    except Exception as e:
        return {"error": str(e)}
