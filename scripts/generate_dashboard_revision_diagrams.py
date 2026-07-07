from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "Proposal-diagram"
WIREFRAME_DIR = OUTPUT_DIR / "wireframe"

BG = "#f6f8fb"
SURFACE = "#ffffff"
INK = "#172033"
MUTED = "#607086"
BORDER = "#d9e2ec"
BLUE = "#176b87"
BLUE_LIGHT = "#e8f4f7"
TEAL = "#2a9d8f"
TEAL_LIGHT = "#d7f3ea"
AMBER = "#b7791f"
AMBER_LIGHT = "#fff7ed"
CORAL = "#e76f51"
PURPLE = "#6d5bd0"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT_XS = font(20)
FONT_SM = font(24)
FONT_MD = font(30)
FONT_LG = font(38, bold=True)
FONT_XL = font(46, bold=True)
FONT_BOLD = font(28, bold=True)
FONT_SMALL_BOLD = font(22, bold=True)


def rounded(draw: ImageDraw.ImageDraw, box, fill, outline=BORDER, radius=16, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw: ImageDraw.ImageDraw, xy, value, fill=INK, fnt=FONT_SM, anchor=None):
    draw.text(xy, value, fill=fill, font=fnt, anchor=anchor)


def wrapped_text(draw: ImageDraw.ImageDraw, xy, value, max_chars, fill=MUTED, fnt=FONT_SM, leading=7):
    x, y = xy
    for line in wrap(value, max_chars):
        draw.text((x, y), line, fill=fill, font=fnt)
        y += fnt.size + leading
    return y


def header(draw: ImageDraw.ImageDraw, title: str, subtitle: str):
    draw.rectangle((0, 0, 1920, 96), fill=SURFACE, outline=BORDER)
    draw.ellipse((30, 28, 70, 68), outline=BLUE, width=3)
    text(draw, (50, 48), "SW", BLUE, FONT_SMALL_BOLD, anchor="mm")
    text(draw, (88, 22), "Smart Workout", INK, FONT_LG)
    text(draw, (88, 60), subtitle, MUTED, FONT_SM)
    rounded(draw, (1540, 26, 1705, 70), "#f4f1eb", outline="#d8d2c5", radius=22)
    draw.ellipse((1554, 36, 1582, 64), outline=PURPLE, width=3)
    text(draw, (1594, 42), "User profile", MUTED, FONT_SM)
    rounded(draw, (1722, 26, 1888, 70), BLUE_LIGHT, outline="#1f70b8", radius=22, width=3)
    text(draw, (1805, 42), "Run analysis", "#0f4f85", FONT_SMALL_BOLD, anchor="ma")
    page_title_font = FONT_LG if len(title) > 52 else FONT_XL
    text(draw, (356, 112), title, INK, page_title_font)


def sidebar(draw: ImageDraw.ImageDraw, active_index: int):
    draw.rectangle((0, 96, 320, 1080), fill=SURFACE, outline=BORDER)
    text(draw, (30, 132), "DASHBOARD VIEWS", "#405166", FONT_SMALL_BOLD)
    items = [
        "1 Overview",
        "2 Subscription Dashboards",
        "3 Lifestyle Profiles",
        "4 Profile Input",
        "5 Prediction + Plan",
        "6 Model Insight",
        "7 AI Chat Assistant",
    ]
    y = 178
    for index, item in enumerate(items, start=1):
        if index == active_index:
            rounded(draw, (16, y - 8, 306, y + 44), BLUE_LIGHT, outline="#1f70b8", radius=10, width=3)
            draw.rectangle((16, y - 8, 22, y + 44), fill="#1f70b8")
            text(draw, (36, y + 6), item, "#0f4f85", FONT_SMALL_BOLD)
        else:
            text(draw, (36, y + 6), item, MUTED, FONT_SM)
        y += 66
    text(draw, (30, 690), "ANALYTICS LAYER", "#405166", FONT_SMALL_BOLD)
    legend = [("Descriptive", PURPLE), ("Predictive", AMBER), ("Prescriptive", TEAL)]
    y = 735
    for label, color in legend:
        rounded(draw, (30, y, 52, y + 22), "#ffffff", outline=color, radius=5, width=2)
        text(draw, (62, y - 3), label, MUTED, FONT_SM)
        y += 38


def card(draw, box, title, value, detail, accent=BLUE):
    rounded(draw, box, SURFACE, radius=14)
    x1, y1, x2, _ = box
    text(draw, (x1 + 22, y1 + 20), title, MUTED, FONT_SM)
    text(draw, (x1 + 22, y1 + 52), value, INK, FONT_LG)
    text(draw, (x1 + 22, y1 + 92), detail, accent, FONT_XS)


def pill(draw, box, label, active=False, color=BLUE):
    fill = BLUE_LIGHT if active else SURFACE
    outline = color if active else "#9aa7b2"
    rounded(draw, box, fill, outline=outline, radius=20, width=3 if active else 2)
    text(draw, ((box[0] + box[2]) // 2, box[1] + 10), label, color if active else MUTED, FONT_SMALL_BOLD, anchor="ma")


def simple_bar_chart(draw, box, labels, values, color=TEAL):
    x1, y1, x2, y2 = box
    max_value = max(values) if values else 1
    bar_gap = 18
    bar_width = max(28, int((x2 - x1 - bar_gap * (len(values) - 1)) / max(len(values), 1)))
    x = x1
    for label, value in zip(labels, values, strict=False):
        height = int((value / max_value) * (y2 - y1 - 34))
        rounded(draw, (x, y2 - height - 28, x + bar_width, y2 - 28), color, outline=color, radius=6, width=1)
        text(draw, (x + bar_width // 2, y2 - 22), label, MUTED, FONT_XS, anchor="ma")
        x += bar_width + bar_gap


def simple_line_chart(draw, box, values, color=BLUE):
    x1, y1, x2, y2 = box
    max_value = max(values)
    min_value = min(values)
    span = max(max_value - min_value, 1)
    points = []
    for index, value in enumerate(values):
        x = x1 + int(index * (x2 - x1) / (len(values) - 1))
        y = y2 - int((value - min_value) / span * (y2 - y1))
        points.append((x, y))
    draw.line(points, fill=color, width=4)
    for point in points:
        draw.ellipse((point[0] - 5, point[1] - 5, point[0] + 5, point[1] + 5), fill=color)


def arrow(draw, start, end, color="#718096"):
    draw.line((start, end), fill=color, width=4)
    x2, y2 = end
    draw.polygon([(x2, y2), (x2 - 15, y2 - 8), (x2 - 15, y2 + 8)], fill=color)


def draw_subscription_split():
    image = Image.new("RGB", (1920, 1080), BG)
    draw = ImageDraw.Draw(image)
    header(draw, "Subscription Dashboards - separated by plan tier", "RAG-Assisted Decision Support & BI System for Personalized Weight Training")
    sidebar(draw, active_index=2)
    text(draw, (356, 154), "The page is filtered by subscription tier. Basic users and Advanced users are no longer mixed in one dashboard.", MUTED, FONT_SM)

    pill(draw, (356, 198, 625, 246), "Basic Users: Basic + Student", active=True, color=BLUE)
    pill(draw, (642, 198, 858, 246), "Advanced Users: Pro", active=False, color=TEAL)

    card(draw, (356, 280, 720, 402), "Basic-tier members", "3,313", "66.3% of members", BLUE)
    card(draw, (744, 280, 1108, 402), "Sample sessions", "6,650", "Filtered Basic + Student visits", TEAL)
    card(draw, (1132, 280, 1496, 402), "Estimated MRR", "$49,377", "Basic + Student revenue", AMBER)
    card(draw, (1520, 280, 1884, 402), "Avg check-ins", "2.0", "Per member in sample", CORAL)

    rounded(draw, (356, 438, 1110, 740), SURFACE, radius=14)
    draw.rectangle((356, 438, 1110, 446), fill=PURPLE)
    text(draw, (380, 470), "2.1 Basic-tier check-ins by month", INK, FONT_BOLD)
    text(draw, (380, 506), "Filtered to Basic + Student subscriptions", MUTED, FONT_SM)
    simple_line_chart(draw, (392, 560, 1068, 690), [54, 58, 72, 60, 63, 70, 55, 68, 74, 62], BLUE)
    text(draw, (380, 704), "src: gymdb_fact_sessions_sample + gymdb_dim_users_cleaned", MUTED, FONT_XS)

    rounded(draw, (1132, 438, 1884, 740), SURFACE, radius=14)
    draw.rectangle((1132, 438, 1884, 446), fill=TEAL)
    text(draw, (1156, 470), "2.2 Plan breakdown inside selected tier", INK, FONT_BOLD)
    rows = [("Basic", "1,628", "$19.99", "$32,544"), ("Student", "1,685", "$9.99", "$16,833")]
    y = 530
    for row in rows:
        rounded(draw, (1160, y, 1852, y + 58), "#fbfdff", radius=8)
        x = 1184
        for item in row:
            text(draw, (x, y + 15), item, INK if x == 1184 else MUTED, FONT_SM)
            x += 175
        y += 74
    text(draw, (1156, 704), "Rule: Basic dashboard = plans with limited/basic access", MUTED, FONT_XS)

    rounded(draw, (356, 772, 1110, 1010), SURFACE, radius=14)
    draw.rectangle((356, 772, 1110, 780), fill=TEAL)
    text(draw, (380, 806), "2.3 Workout mix for selected tier", INK, FONT_BOLD)
    simple_bar_chart(draw, (400, 860, 1064, 982), ["Cardio", "Yoga", "Weights", "Pilates", "HIIT"], [88, 74, 95, 69, 81], TEAL)

    rounded(draw, (1132, 772, 1884, 1010), SURFACE, radius=14)
    draw.rectangle((1132, 772, 1884, 780), fill=AMBER)
    text(draw, (1156, 806), "2.4 Tier-specific location utilization", INK, FONT_BOLD)
    loc_rows = [("Chicago", "Budget", "674"), ("Los Angeles", "Budget", "651"), ("Houston", "Premium", "644")]
    y = 856
    for location, gym_type, sessions in loc_rows:
        text(draw, (1160, y), location, INK, FONT_SM)
        text(draw, (1400, y), gym_type, MUTED, FONT_SM)
        text(draw, (1690, y), f"{sessions} sessions", BLUE, FONT_SM)
        y += 46

    WIREFRAME_DIR.mkdir(parents=True, exist_ok=True)
    image.save(WIREFRAME_DIR / "dashboard_wireframe_page2_subscription_split_v2.png")


def draw_mapping_wireframe():
    image = Image.new("RGB", (1920, 1080), BG)
    draw = ImageDraw.Draw(image)
    header(draw, "Prediction + Plan - intensity and readiness mapping", "RAG-Assisted Decision Support & BI System for Personalized Weight Training")
    sidebar(draw, active_index=5)
    text(draw, (356, 154), "The dashboard now shows score math and the exact action used to adjust exercise recommendations.", MUTED, FONT_SM)

    rounded(draw, (356, 198, 730, 634), SURFACE, radius=14, outline="#c9a269", width=2)
    draw.rectangle((356, 198, 730, 206), fill=AMBER)
    text(draw, (380, 232), "5.1 User input", INK, FONT_BOLD)
    fields = ["Age / height / weight", "Sleep hours", "Stress level", "Blood pressure", "Resting heart rate", "Goal + target body part", "Available equipment", "Sessions per week"]
    y = 288
    for field in fields:
        rounded(draw, (382, y, 704, y + 36), "#f4f1eb", outline="#d8d2c5", radius=8, width=1)
        text(draw, (398, y + 6), field, MUTED, FONT_XS)
        y += 44

    rounded(draw, (760, 198, 1218, 444), SURFACE, radius=14, outline="#c9a269", width=2)
    draw.rectangle((760, 198, 1218, 206), fill=AMBER)
    text(draw, (784, 232), "5.2 Intensity model", INK, FONT_BOLD)
    text(draw, (784, 288), "Predicted class", MUTED, FONT_SM)
    text(draw, (784, 318), "MEDIUM", AMBER, FONT_XL)
    text(draw, (784, 374), "Proxy score: 65 / 100", INK, FONT_BOLD)
    simple_bar_chart(draw, (1030, 260, 1184, 410), ["Low", "Mid", "High"], [18, 63, 19], AMBER)

    rounded(draw, (1248, 198, 1884, 444), SURFACE, radius=14, outline=TEAL, width=2)
    draw.rectangle((1248, 198, 1884, 206), fill=TEAL)
    text(draw, (1272, 232), "5.3 Readiness score", INK, FONT_BOLD)
    text(draw, (1272, 282), "Start at 100. Deduct recovery and safety risk.", MUTED, FONT_SM)
    rows = [("Sleep", "0"), ("Stress", "-8"), ("Blood pressure", "0"), ("Resting HR", "0"), ("BMI", "0")]
    for index, (label, impact) in enumerate(rows):
        x = 1272 if index < 3 else 1540
        y = 326 + (index if index < 3 else index - 3) * 26
        text(draw, (x, y), label, INK, FONT_XS)
        text(draw, (x + 220, y), impact, CORAL if impact.startswith("-") else TEAL, FONT_XS)
    text(draw, (1272, 404), "Readiness: 92 / 100 - HIGH", TEAL, FONT_SMALL_BOLD)

    rounded(draw, (760, 480, 1884, 696), SURFACE, radius=14, outline=BLUE, width=3)
    draw.rectangle((760, 480, 1884, 488), fill=BLUE)
    text(draw, (784, 518), "5.4 Decision mapping shown on dashboard", INK, FONT_BOLD)
    text(draw, (784, 566), "Final score = 60% readiness + 40% intensity. Readiness can cap unsafe volume.", MUTED, FONT_SM)
    mapping_cards = [
        ("Readiness", "92 x 0.60"),
        ("Intensity", "65 x 0.40"),
        ("Final score", "81 / 100"),
        ("Action", "Progressive"),
        ("Cap", "Not applied"),
    ]
    x = 784
    for label, value in mapping_cards:
        rounded(draw, (x, 606, x + 200, 670), "#fbfdff", radius=8)
        text(draw, (x + 14, 618), label, MUTED, FONT_XS)
        text(draw, (x + 14, 642), value, BLUE if label != "Action" else TEAL, FONT_SMALL_BOLD)
        x += 214

    arrow(draw, (730, 416), (760, 416), AMBER)
    arrow(draw, (1218, 324), (1248, 324), TEAL)
    arrow(draw, (1440, 444), (1440, 480), BLUE)

    rounded(draw, (356, 730, 1884, 1012), SURFACE, radius=14, outline=TEAL, width=3)
    draw.rectangle((356, 730, 1884, 738), fill=TEAL)
    text(draw, (380, 770), "5.5 Recommendation output", INK, FONT_BOLD)
    text(draw, (380, 818), "Primary action: use standard progression for the selected goal and focus area.", TEAL, FONT_BOLD)
    outputs = [
        ("Exercises per session", "4"),
        ("Sets x reps", "3 x 6-8"),
        ("Rest", "110s"),
        ("Safety note", "Reduce if form drops"),
        ("RAG rationale", "Scaling snippets"),
    ]
    x = 390
    for label, value in outputs:
        rounded(draw, (x, 880, x + 280, 970), "#fbfdff", radius=10)
        text(draw, (x + 18, 902), label, MUTED, FONT_XS)
        text(draw, (x + 18, 934), value, INK, FONT_SMALL_BOLD)
        x += 296

    WIREFRAME_DIR.mkdir(parents=True, exist_ok=True)
    image.save(WIREFRAME_DIR / "dashboard_wireframe_page5_mapping_v2.png")


def draw_simple_flow_diagram():
    image = Image.new("RGB", (1800, 980), BG)
    draw = ImageDraw.Draw(image)
    text(draw, (70, 48), "Smart Workout revised dashboard logic", INK, FONT_XL)
    text(draw, (70, 100), "Easy explanation diagram for professor feedback: score mapping plus subscription separation.", MUTED, FONT_SM)

    boxes = [
        ((70, 170, 410, 330), "User input", "Body, sleep, stress, BP, HR, goal, equipment"),
        ((520, 170, 860, 330), "Readiness score", "100 minus recovery and safety deductions"),
        ((970, 170, 1310, 330), "Intensity prediction", "ML class: Low / Medium / High"),
        ((1390, 170, 1730, 330), "Decision mapping", "60% readiness + 40% intensity, readiness cap"),
        ((1390, 430, 1730, 590), "Plan recommendation", "Exercises, sets, reps, rest, safety notes"),
        ((70, 680, 520, 840), "Basic dashboard", "Basic + Student subscriptions"),
        ((650, 680, 1100, 840), "Advanced dashboard", "Pro subscription"),
        ((1230, 680, 1730, 840), "BI comparison", "Separate tier metrics with no mixed-user view"),
    ]
    colors = [AMBER, TEAL, AMBER, BLUE, TEAL, BLUE, TEAL, PURPLE]
    for (box, title, detail), color in zip(boxes, colors, strict=False):
        rounded(draw, box, SURFACE, outline=color, radius=18, width=3)
        draw.rectangle((box[0], box[1], box[2], box[1] + 9), fill=color)
        text(draw, (box[0] + 24, box[1] + 38), title, INK, FONT_BOLD)
        wrapped_text(draw, (box[0] + 24, box[1] + 82), detail, 34, MUTED, FONT_SM)

    arrow(draw, (410, 250), (520, 250), BLUE)
    arrow(draw, (860, 250), (970, 250), BLUE)
    arrow(draw, (1310, 250), (1390, 250), BLUE)
    arrow(draw, (1560, 330), (1560, 430), TEAL)
    arrow(draw, (300, 600), (300, 680), BLUE)
    arrow(draw, (875, 600), (875, 680), TEAL)
    arrow(draw, (1100, 760), (1230, 760), PURPLE)
    text(draw, (70, 500), "Subscription split uses plan rules:", INK, FONT_BOLD)
    text(draw, (70, 544), "Basic users = Basic + Student. Advanced users = Pro.", MUTED, FONT_SM)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT_DIR / "smart_workout_decision_mapping_diagram.png")


def main():
    draw_subscription_split()
    draw_mapping_wireframe()
    draw_simple_flow_diagram()


if __name__ == "__main__":
    main()
