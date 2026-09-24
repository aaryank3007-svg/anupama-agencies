import os
import io
import csv
from datetime import datetime, date
from werkzeug.utils import secure_filename
from flask import Response

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file_storage, target_folder, prefix="upload"):
    """
    Saves an uploaded file to the specified target directory within static/uploads.
    Returns relative web path (e.g., 'uploads/workers/filename.jpg') or empty string.
    """
    if not file_storage or file_storage.filename == '':
        return ''
    
    if not allowed_file(file_storage.filename):
        return ''
    
    os.makedirs(target_folder, exist_ok=True)
    original_ext = file_storage.filename.rsplit('.', 1)[1].lower()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    safe_name = f"{prefix}_{timestamp}.{original_ext}"
    full_path = os.path.join(target_folder, safe_name)
    file_storage.save(full_path)
    
    # Return relative path from 'static/'
    subfolder = os.path.basename(target_folder)
    return f"uploads/{subfolder}/{safe_name}"

def format_inr(amount):
    """
    Format a number in Indian Rupee format (e.g., ₹ 1,23,450.00 or ₹ 500.00).
    """
    if amount is None:
        return "₹0.00"
    try:
        val = float(amount)
        is_negative = val < 0
        val = abs(val)
        
        parts = f"{val:.2f}".split('.')
        whole = parts[0]
        decimal = parts[1]
        
        if len(whole) <= 3:
            res = whole
        else:
            last3 = whole[-3:]
            rest = whole[:-3]
            chunks = []
            while len(rest) > 2:
                chunks.insert(0, rest[-2:])
                rest = rest[:-2]
            if rest:
                chunks.insert(0, rest)
            chunks.append(last3)
            res = ",".join(chunks)
        
        prefix = "-₹" if is_negative else "₹"
        return f"{prefix}{res}.{decimal}"
    except (ValueError, TypeError):
        return "₹0.00"

def export_csv_response(filename, headers, rows):
    """
    Generates a downloadable CSV Response compatible with Microsoft Excel (UTF-8 BOM).
    """
    output = io.StringIO()
    # Write UTF-8 BOM so Excel opens with proper encoding
    output.write('\ufeff')
    writer = csv.writer(output, lineterminator='\r\n')
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    
    csv_data = output.getvalue()
    output.close()
    
    response = Response(csv_data, mimetype='text/csv; charset=utf-8')
    response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
