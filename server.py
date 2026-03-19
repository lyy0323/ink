import os
from pathlib import Path

if not os.environ.get("DYLD_FALLBACK_LIBRARY_PATH"):
    os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = "/opt/homebrew/lib"

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, Response

app = FastAPI()

BASE_DIR = Path(__file__).parent


@app.post("/api/print")
async def print_pdf(request: Request):
    from weasyprint import HTML

    body = await request.json()
    pages_html = body.get("html", "")
    title = body.get("title", "诗集")

    page_css = """
        @page { size: 148mm 210mm; margin: 0; }

        :root {
            --paper-w: 148mm;
            --paper-h: 210mm;
            --margin-base: 20mm;
            --margin-extra: 15mm;
            --ink-color: #333;
            --red-seal: #b33939;
        }

        body {
            margin: 0;
            padding: 0;
            color: #1c1917;
            font-family: "Noto Serif SC", "FangSong", serif;
        }

        .page {
            width: 148mm;
            height: 210mm;
            background-color: #fffdf9;
            position: relative;
            overflow: hidden;
            writing-mode: horizontal-tb;
            font-size: 14pt;
            line-height: 1.8;
            text-align: justify;
            box-sizing: border-box;
            page-break-after: always;
        }

        .page::before { display: none; }

        .book-spread { display: block; }
        .book-spread::after { display: none; }

        .page.left-page {
            padding: 20mm 20mm 25mm 35mm;
        }

        .page.right-page {
            padding: 20mm 35mm 25mm 20mm;
        }

        .poem-title-box {
            position: absolute;
            top: 20mm;
            height: auto;
            max-height: 80%;
            display: block;
            writing-mode: horizontal-tb;
            z-index: 10;
        }

        .page.left-page .poem-title-box {
            left: 6mm;
            text-align: center;
            width: 23mm;
        }

        .page.right-page .poem-title-box {
            right: 6mm;
            text-align: center;
            width: 23mm;
        }

        .poem-title, .poem-date {
            writing-mode: vertical-rl;
            white-space: nowrap;
            display: inline-block;
        }

        .poem-title {
            font-family: 'Ma Shan Zheng', cursive;
            font-size: 18pt;
            color: #000;
            margin: 5mm 0;
        }

        .poem-date {
            font-family: "Noto Serif SC", serif;
            font-size: 9pt;
            color: #888;
            letter-spacing: 0.1em;
        }

        .content-body {
            height: 100%;
            display: block;
            position: relative;
            z-index: 5;
        }

        .poem-pre {
            font-size: 9pt;
            color: #666;
            margin-bottom: 1em;
            border-left: 2px solid #ddd;
            padding-left: 0.5em;
        }

        .poem-text {
            font-size: 14pt;
            line-height: 1.6;
            white-space: pre-wrap;
        }

        .poem-text.tight {
            white-space: pre-wrap;
            text-indent: 2em;
            text-align: justify;
        }

        .poem-foot {
            position: absolute;
            bottom: 8mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #ddd;
            padding-top: 4px;
            font-size: 8pt;
            color: #999;
            text-align: center;
            z-index: 5;
        }

        .cover-title, h1 {
            font-family: 'Ma Shan Zheng', cursive;
        }

        img[style*="opacity:0.3"] {
            opacity: 0.3;
        }

        .font-serif { font-family: "Noto Serif SC", serif; }
        .text-4xl { font-size: 36pt; }
        .text-xl { font-size: 18pt; }
        .text-gray-600 { color: #4b5563; }
        .mb-4 { margin-bottom: 16px; }
        .z-10 { z-index: 10; }
    """

    html_doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<link href="https://fonts.loli.net/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;500;700&display=swap" rel="stylesheet">
<style>{page_css}</style>
</head>
<body>
{pages_html}
</body>
</html>"""

    pdf = HTML(
        string=html_doc,
        base_url=str(BASE_DIR),
    ).write_pdf()

    from urllib.parse import quote
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; filename*=UTF-8''{quote(title + '.pdf')}"
        },
    )


@app.get("/{path:path}")
async def static_files(path: str):
    if not path or path == "/":
        return FileResponse(BASE_DIR / "index.html")
    file = BASE_DIR / path
    if file.is_file() and BASE_DIR in file.resolve().parents:
        return FileResponse(file)
    return FileResponse(BASE_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
