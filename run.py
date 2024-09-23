import fitz  # PyMuPDF

# Define the RGB color for light brown
LIGHT_BROWN = (245 / 255, 222 / 255, 179 / 255)

def change_background_color(pdf_path, output_pdf_path):
    # Open the original PDF
    doc = fitz.open(pdf_path)
    
    # Iterate through each page
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        rect = page.rect  # Get the page dimensions

        # Create a rectangle over the entire page and fill it with light brown color
        page.draw_rect(rect, color=None, fill=LIGHT_BROWN, overlay=False)

    # Save the modified PDF
    doc.save(output_pdf_path)
    doc.close()


# Usage
input_pdf = "Machine_Learning_Refined.pdf"  # Replace with the path to your PDF
output_pdf = "ebook_with_light_brown_background.pdf"  # Output file path

change_background_color(input_pdf, output_pdf)
