import json
import re
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

CLOUDINARY_WINE_MAP = {
    "sula sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg",
    "sula dindori reserve shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg",
    "dindori reserve shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg",
    "sula chenin blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg",
    "vallonné malbec reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956319/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_oin8i3.jpg",
    "vallonne malbec": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956319/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_oin8i3.jpg",
    "york arros": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956322/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_q87qom.jpg",
    "arros reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956322/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_q87qom.jpg",
    "soma reserve shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "soma shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "chandon brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956316/26590246-single-glass-wine-bottle-with-blank-label-on-white-background_hdolwg.jpg",
    "grover la réserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956311/WB06ZZWC_hgi1dh.jpg",
    "la réserve red": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956311/WB06ZZWC_hgi1dh.jpg",
    "la reserve red": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956311/WB06ZZWC_hgi1dh.jpg",
    "fratelli鼓 sette": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956308/SV-VR-Reserve-Diamond-Mountain-Distrcit-Cabernet-Sauvignon-750_cuu6bk.png",
    "fratelli sette": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956308/SV-VR-Reserve-Diamond-Mountain-Distrcit-Cabernet-Sauvignon-750_cuu6bk.png",
    "krsma cabernet sauvignon": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956238/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_stwndz.jpg",
    "krsma sangiovese": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956238/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_stwndz.jpg",
    "krsma cool climate marsanne": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955708/Screenshot_2026-07-24_144653_xehv3q.png",
    "krsma sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955909/Screenshot_2026-07-24_142300_jb7ora.png",
    "krsma chardonnay": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "krsma syrah": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg",
    "charosa reserve tempranillo": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956176/pngtree-red-wine-png-image_2399218_hxj4qs.jpg",
    "charosa tempranillo reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956176/pngtree-red-wine-png-image_2399218_hxj4qs.jpg",
    "chandon rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
    "chandon rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
    "sula rasa cabernet sauvignon": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956204/wb102_wtbr_0411_q_01_do6saj.jpg",
    "rasa shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956204/wb102_wtbr_0411_q_01_do6saj.jpg",
    "rasa cabernet sauvignon": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956204/wb102_wtbr_0411_q_01_do6saj.jpg",
    "rasa zinfandel": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956176/pngtree-red-wine-png-image_2399218_hxj4qs.jpg",
    "york sparkling brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956160/COL83055_5_m1934d___b04e857d7f6a556d_pkypkh.webp",
    "soma sauvignon blanc dessert wine": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955992/Screenshot_2026-07-24_142422_un7uur.png",
    "grover zampa soirée brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955883/Screenshot_2026-07-24_142359_ba6ezc.png",
    "grover zampa soiree brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955883/Screenshot_2026-07-24_142359_ba6ezc.png",
    "fratelli gran cuvée brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955843/Screenshot_2026-07-24_142422_gvfbfc.png",
    "fratelli gran cuvee brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955843/Screenshot_2026-07-24_142422_gvfbfc.png",
    "sula late harvest chenin blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955804/Screenshot_2026-07-24_142628_x5rxjw.png",
    "vallonné vin de passerille": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955777/Screenshot_2026-07-24_143729_tdfluo.png",
    "vallonne vin de passerille": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955777/Screenshot_2026-07-24_143729_tdfluo.png",
    "grover art collection sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955909/Screenshot_2026-07-24_142300_jb7ora.png",
    "york chenin blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955708/Screenshot_2026-07-24_144653_xehv3q.png",
    "fratelli sangiovese bianco": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955685/Screenshot_2026-07-24_145056_ooa7nx.png",
    "charosa selections sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955649/Screenshot_2026-07-24_145317_digkzn.png",
    "vallonné viognier": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955728/Screenshot_2026-07-24_144407_fzdci0.png",
    "vallonne viognier": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955728/Screenshot_2026-07-24_144407_fzdci0.png",
    "sula source grenache rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955804/Screenshot_2026-07-24_142628_x5rxjw.png",
    "sula the source grenache rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955804/Screenshot_2026-07-24_142628_x5rxjw.png",
    "sula the source grenache rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955804/Screenshot_2026-07-24_142628_x5rxjw.png",
    "york zinfandel rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "york zinfandel rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "fratelli m/s rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "fratelli m/s rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
    "grover art collection rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956485/16229-87036-240815122202_hdzcje.jpg",
    "grover art collection rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956485/16229-87036-240815122202_hdzcje.jpg",
    "vallonné rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956483/10892_lqgftz.jpg",
    "vallonne rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956483/10892_lqgftz.jpg",
    "vallonne rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956483/10892_lqgftz.jpg",
    "charosa selections viognier": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956481/15777_p0381r.jpg",
    "reveilo syrah reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg",
    "cabernet sauvignon classique": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956308/SV-VR-Reserve-Diamond-Mountain-Distrcit-Cabernet-Sauvignon-750_cuu6bk.png",
    "cabernet merlot reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956311/WB06ZZWC_hgi1dh.jpg",
    "good earth basso": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956176/pngtree-red-wine-png-image_2399218_hxj4qs.jpg",
    "sdv big banyan merlot": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg",
    "renaissance cabernet sauvignon": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956204/wb102_wtbr_0411_q_01_do6saj.jpg",
    "krsma estate sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955909/Screenshot_2026-07-24_142300_jb7ora.png",
    "chandon vintage brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956316/26590246-single-glass-wine-bottle-with-blank-label-on-white-background_hdolwg.jpg",
    "chandon delice": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956160/COL83055_5_m1934d___b04e857d7f6a556d_pkypkh.webp",
}

CLOUDINARY_STYLE_FALLBACKS = {
    "red": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg",
    "white": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg",
    "rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
    "rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
    "sparkling": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956316/26590246-single-glass-wine-bottle-with-blank-label-on-white-background_hdolwg.jpg",
    "dessert": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955992/Screenshot_2026-07-24_142422_un7uur.png",
    "fortified": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956322/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_q87qom.jpg",
}

DEFAULT_CLOUDINARY_WINE = "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg"

def get_wine_cloudinary_image(wine_name: str, wine_type: str = "", variety: str = "") -> str:
    name_clean = str(wine_name).lower().strip()
    
    if name_clean in CLOUDINARY_WINE_MAP:
        return CLOUDINARY_WINE_MAP[name_clean]
    
    for key, url in CLOUDINARY_WINE_MAP.items():
        if key in name_clean or name_clean in key:
            return url

    var_clean = str(variety).lower().strip()
    for key, url in CLOUDINARY_WINE_MAP.items():
        if var_clean and var_clean in key:
            return url
            
    type_clean = str(wine_type).lower().strip()
    if type_clean in CLOUDINARY_STYLE_FALLBACKS:
        return CLOUDINARY_STYLE_FALLBACKS[type_clean]
        
    return DEFAULT_CLOUDINARY_WINE

def update_csv(file_path: Path):
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    df = pd.read_csv(file_path)
    print(f"Updating {file_path.name} with {len(df)} rows...")
    
    urls = []
    for idx, row in df.iterrows():
        name = str(row.get("Wine_Name", ""))
        wtype = str(row.get("Wine_Type", ""))
        variety = str(row.get("Variety", ""))
        img_url = get_wine_cloudinary_image(name, wtype, variety)
        urls.append(img_url)
        
    df["image_url"] = urls
    df.to_csv(file_path, index=False)
    print(f"Successfully updated {file_path.name} with Cloudinary images.")

def update_wines_js(file_path: Path):
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    content = file_path.read_text(encoding="utf-8")
    
    # Replace wineImg lines with Cloudinary image
    def replacer(match):
        full_block = match.group(0)
        name_match = re.search(r'name:\s*["\']([^"\']+)["\']', full_block)
        type_match = re.search(r'type:\s*["\']([^"\']+)["\']', full_block)
        grape_match = re.search(r'grape:\s*["\']([^"\']+)["\']', full_block)
        
        name = name_match.group(1) if name_match else ""
        wtype = type_match.group(1) if type_match else ""
        grape = grape_match.group(1) if grape_match else ""
        
        c_url = get_wine_cloudinary_image(name, wtype, grape)
        return re.sub(r'wineImg:\s*["\'][^"\']+["\']', f'wineImg: "{c_url}"', full_block)

    # Match each wine object block
    new_content = re.sub(r'\{[^{}]*name:[^{}]*wineImg:[^{}]*\}', replacer, content)
    file_path.write_text(new_content, encoding="utf-8")
    print(f"Successfully updated {file_path.name} with Cloudinary images.")

def main():
    update_csv(BASE_DIR / "processed_data" / "wine_clean.csv")
    update_csv(BASE_DIR / "datasets" / "wine_dataset.csv")
    update_wines_js(ROOT_DIR / "constants" / "food-pairing" / "wines.ts")
    update_wines_js(BASE_DIR / "food_pairing_frontend" / "src" / "data" / "wines.js")

if __name__ == "__main__":
    main()
