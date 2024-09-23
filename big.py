import fitz  # PyMuPDF

# Define the RGB color for light brown
LIGHT_BROWN = (245 / 255, 222 / 255, 179 / 255)

def increase_text_size_by_30_percent(pdf_path, output_pdf_path):
    # Open the original PDF
    doc = fitz.open(pdf_path)
    
    # Iterate through each page
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        rect = page.rect  # Get the page dimensions

        # Create a rectangle over the entire page and fill it with light brown color
        page.draw_rect(rect, color=None, fill=LIGHT_BROWN, overlay=False)

        # Extract text blocks from the page
        text_instances = page.get_text("dict")['blocks']
        
        # Iterate through each text block and increase the font size by 30%
        for block in text_instances:
            if block['type'] == 0:  # Type 0 represents text blocks
                for line in block['lines']:
                    for span in line['spans']:
                        # Increase the font size by 30%
                        new_font_size = span['size'] * 1.3
                        
                        # Use a default system font like "Helvetica" to avoid the font error
                        font_name = "helv"  # Using Helvetica as the default font
                        
                        # Reinsert the text with the new size and default font
                        page.insert_text((span['bbox'][0], span['bbox'][1]),  # Original position
                                         span['text'],  # Original text content
                                         fontname=font_name,  # Default font (Helvetica)
                                         fontsize=new_font_size,  # New font size
                                         color=span['color'])  # Original color

    # Save the modified PDF
    doc.save(output_pdf_path)
    doc.close()

# Usage
input_pdf = "Machine_Learning_Refined-brown.pdf"  # Replace with the path to your PDF
output_pdf = "ebook_with_larger_text_and_background.pdf"  # Output file path

increase_text_size_by_30_percent(input_pdf, output_pdf)
