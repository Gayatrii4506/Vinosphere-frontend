const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

// 1. Add import
if (!content.includes('import * as db from "@/lib/supabaseQueries"')) {
  content = content.replace(
    'import { wineries as mockWineries } from "@/lib/mock-data/wineries";',
    'import { wineries as mockWineries } from "@/lib/mock-data/wineries";\nimport * as db from "@/lib/supabaseQueries";'
  );
}

// 2. Modify handleOnboardingSubmit
const handleOnboardingStr = 'const handleOnboardingSubmit = () => {';
if (content.includes(handleOnboardingStr) && !content.includes('await db.addWinery')) {
  content = content.replace(
    'const handleOnboardingSubmit = () => {',
    'const handleOnboardingSubmit = async () => {'
  );
  content = content.replace(
    'const nextWineryId = "w-" + Date.now();',
    `let nextWineryId = "w-" + Date.now();
    try {
      const dbWinery = await db.addWinery({
        name: regForm.wineryName,
        slug: regForm.wineryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: regForm.story,
        logo: regForm.logo,
        coverImage: regForm.coverImage
      });
      if (dbWinery && dbWinery.id) {
        nextWineryId = dbWinery.id;
      }
    } catch (err) {
      console.error("Failed to add winery to Supabase", err);
    }
`
  );
}

// 3. Modify handleWineAdd
if (content.includes('const handleWineAdd = (e: React.FormEvent) => {') && !content.includes('await db.addWine')) {
  content = content.replace(
    'const handleWineAdd = (e: React.FormEvent) => {',
    'const handleWineAdd = async (e: React.FormEvent) => {'
  );
  content = content.replace(
    'const addedWine = {',
    `try {
      const dbWine = await db.addWine({
        winery_id: currentWinery.id,
        name: newWine.name || "Estate Selection Shiraz",
        type: newWine.category || "Red",
        vintage: newWine.vintage || "2024",
        description: newWine.description || "Artisanal hand-crafted selection.",
        alcoholContent: newWine.alcoholContent,
        price: parsedPrice,
        image: newWine.image
      });
      console.log("Saved wine to Supabase:", dbWine);
    } catch(err) {
      console.error("Error saving to Supabase:", err);
    }
    const addedWine = {`
  );
}

// 4. Modify handleEventCreate
if (content.includes('const handleEventCreate = (e: React.FormEvent) => {') && !content.includes('await db.addEvent')) {
  content = content.replace(
    'const handleEventCreate = (e: React.FormEvent) => {',
    'const handleEventCreate = async (e: React.FormEvent) => {'
  );
  content = content.replace(
    'const addedEvent = {',
    `try {
      await db.addEvent({
        winery_id: currentWinery.id,
        name: newEvent.name || "Amphitheatre Uncorked",
        description: newEvent.description || "A tasting event under the stars.",
        date: newEvent.date || "2026-08-20",
        time: newEvent.time,
        capacity: capacityNum,
        ticketPrice: priceNum
      });
    } catch (err) { console.error("Error saving event to Supabase:", err); }
    const addedEvent = {`
  );
}

// 5. Modify handleExperienceCreate
if (content.includes('const handleExperienceCreate = (e: React.FormEvent) => {') && !content.includes('await db.addExperience')) {
  content = content.replace(
    'const handleExperienceCreate = (e: React.FormEvent) => {',
    'const handleExperienceCreate = async (e: React.FormEvent) => {'
  );
  content = content.replace(
    'const addedExp = {',
    `try {
      await db.addExperience({
        winery_id: currentWinery.id,
        name: newExperience.name || "Gourmet Tasting Tour",
        description: newExperience.description || "",
        duration: newExperience.duration,
        capacity: parseInt(newExperience.capacity) || 15,
        price: priceNum
      });
    } catch (err) { console.error("Error saving experience to Supabase:", err); }
    const addedExp = {`
  );
}

fs.writeFileSync(pagePath, content, 'utf-8');
console.log('Successfully patched page.tsx!');
