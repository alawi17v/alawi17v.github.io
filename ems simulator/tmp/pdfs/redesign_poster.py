from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


OUT = "/Users/alawi/Local Projects/EMS Simulator/output/pdf/lost-dog-poster-redesigned.pdf"
PHOTO = "/Users/alawi/Local Projects/EMS Simulator/tmp/pdfs/extract-2-I1.jpg"
QR = "/Users/alawi/Local Projects/EMS Simulator/tmp/pdfs/extract-1-I2.png"
LOGO = "/Users/alawi/Local Projects/EMS Simulator/tmp/pdfs/extract-0-I3.png"

RED = (1.0, 0.118, 0.145)
BLACK = (0, 0, 0)
GRAY = (0.38, 0.38, 0.38)
WHITE = (1, 1, 1)


def color(c, fill=True):
    (canvas.Canvas.setFillColorRGB if fill else canvas.Canvas.setStrokeColorRGB)(pdf, *c)


def text(x, y, value, size, font="Helvetica", fill=BLACK):
    color(fill)
    pdf.setFont(font, size)
    pdf.drawString(x, y, value)


def label_value(x, y, label, lines):
    text(x, y, label, 10.5, "Helvetica-Bold")
    cursor = y - 17
    for line in lines:
        text(x, cursor, line, 10.5)
        cursor -= 15


pdf = canvas.Canvas(OUT, pagesize=A4)
w, h = A4

# Strong, simple alert header using only the poster's existing red and white.
color(RED)
pdf.roundRect(34, h - 106, w - 68, 72, 12, fill=1, stroke=0)
text(57, h - 84, "Lost Dog!", 38, "Helvetica-Bold", WHITE)

# Main content uses a consistent two-column grid.
photo_x, photo_y, photo_w, photo_h = 34, 250, 336, 470
pdf.drawImage(ImageReader(PHOTO), photo_x, photo_y, photo_w, photo_h,
              preserveAspectRatio=False, mask="auto")

info_x = 394
text(info_x, 684, "Capri", 27, "Helvetica-Bold")
color(RED, fill=False)
pdf.setLineWidth(2.5)
pdf.line(info_x, 672, w - 34, 672)

label_value(info_x, 642, "Description", ["Small brown and gold", "chihuahua / not chipped"])
label_value(info_x, 567, "Last Seen Location", ["Ward Ave/ Graham/ Ozan", "Memphis, TN 38108"])
label_value(info_x, 480, "Date Lost", ["7/17/26"])
label_value(info_x, 422, "Sex", ["Female"])

# Contact panel retains the red outline and all original contact/QR content.
panel_x, panel_y, panel_w, panel_h = 34, 92, w - 68, 128
color(WHITE)
pdf.roundRect(panel_x, panel_y, panel_w, panel_h, 12, fill=1, stroke=0)
color(RED, fill=False)
pdf.setLineWidth(5)
pdf.roundRect(panel_x, panel_y, panel_w, panel_h, 12, fill=0, stroke=1)

text(55, 172, "(901) 728-0020", 19, "Helvetica-Bold")
text(55, 136, "73151283@pawboost-mail.com", 15.5, "Helvetica-Bold")

qr_size = 92
qr_x, qr_y = w - 34 - 16 - qr_size, 109
pdf.drawImage(ImageReader(QR), qr_x, qr_y, qr_size, qr_size, mask="auto")
right_edge = qr_x - 14
color(RED)
pdf.setFont("Helvetica-Bold", 12.5)
pdf.drawRightString(right_edge, 169, "SCAN TO")
pdf.drawRightString(right_edge, 151, "CONTACT")
color(BLACK)
pdf.setFont("Helvetica-Bold", 10)
pdf.drawRightString(right_edge, 125, "VIEW & SHARE")

# Existing footer branding and call-to-action.
pdf.drawImage(ImageReader(LOGO), 39, 39, 170, 40.5, preserveAspectRatio=True, mask="auto")
color(BLACK)
pdf.setFont("Helvetica-Bold", 14)
pdf.drawRightString(w - 34, 51, "Post your pet at pawboost.com")

pdf.showPage()
pdf.save()
