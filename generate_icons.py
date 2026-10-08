import os
from PIL import Image, ImageDraw

base_path = r"C:\Proyectos\personal\klab"
icon_src_path = os.path.join(base_path, "playstore_icon_512.png")
res_path = os.path.join(base_path, "android", "app", "src", "main", "res")

src_img = Image.open(icon_src_path).convert("RGBA")

# Mipmap dimensions
mipmap_configs = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432),
}

# Generate mipmap icons
for folder, (icon_sz, fg_sz) in mipmap_configs.items():
    target_dir = os.path.join(res_path, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    # 1. ic_launcher.png (Square / standard with rounded corners)
    ic_launcher = src_img.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    ic_launcher.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
    
    # 2. ic_launcher_round.png (Circular mask)
    mask = Image.new("L", (icon_sz, icon_sz), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, icon_sz, icon_sz), fill=255)
    
    round_img = Image.new("RGBA", (icon_sz, icon_sz), (0, 0, 0, 0))
    round_img.paste(ic_launcher, (0, 0))
    round_img.putalpha(mask)
    round_img.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
    
    # 3. ic_launcher_foreground.png (Adaptive icon foreground: centered 72dp icon inside 108dp canvas)
    fg_canvas = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
    # Icon placed at center ~66% of canvas
    sub_icon_sz = int(fg_sz * 0.70)
    sub_icon = src_img.resize((sub_icon_sz, sub_icon_sz), Image.Resampling.LANCZOS)
    offset = (fg_sz - sub_icon_sz) // 2
    fg_canvas.paste(sub_icon, (offset, offset), sub_icon)
    fg_canvas.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")
    print(f"Generated icons for {folder}")

# Splash screen dimensions
splash_configs = {
    "drawable": (480, 800),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
}

bg_color = (11, 14, 20, 255) # #0B0E14 dark theme

for folder, (w, h) in splash_configs.items():
    target_dir = os.path.join(res_path, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    splash_img = Image.new("RGBA", (w, h), bg_color)
    # Icon width roughly 30% of splash width, max 380px
    icon_w = min(int(w * 0.35), 380)
    icon_h = icon_w
    resized_icon = src_img.resize((icon_w, icon_h), Image.Resampling.LANCZOS)
    
    pos_x = (w - icon_w) // 2
    pos_y = (h - icon_h) // 2 - int(h * 0.04) # slightly above center
    splash_img.paste(resized_icon, (pos_x, pos_y), resized_icon)
    splash_img.save(os.path.join(target_dir, "splash.png"), "PNG")
    print(f"Generated splash for {folder}")

print("All Android icons and splash assets generated successfully!")
