import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

// Curated color palette for projects
const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', 
  '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4'
];

// Sample gear data templates - Expanded list for unique items
const SAMPLE_GEAR_TEMPLATES = [
  // Compressors & Dynamics
  { name: "LA-2A", brand: "Universal Audio", category: "dynamics", subcategory: "compressor", description: "Legendary tube compressor known for smooth, musical compression. Perfect for vocals and bass.", tags: ["vintage", "tube", "smooth", "classic"], soundCharacteristics: { tone: ["warm", "smooth"], qualities: ["musical", "transparent"] } },
  { name: "1176", brand: "Universal Audio", category: "dynamics", subcategory: "compressor", description: "Fast FET compressor with aggressive character. Great for drums and rock vocals.", tags: ["fet", "fast", "aggressive", "punchy"], soundCharacteristics: { tone: ["aggressive", "punchy"], qualities: ["fast", "colorful"] } },
  { name: "SSL G-Series Bus Compressor", brand: "SSL", category: "dynamics", subcategory: "compressor", description: "The legendary SSL bus compressor that defined the sound of modern rock and pop.", tags: ["ssl", "bus-comp", "glue", "modern"], soundCharacteristics: { tone: ["punchy", "aggressive"], qualities: ["tight", "cohesive"] } },
  { name: "Distressor", brand: "Empirical Labs", category: "dynamics", subcategory: "compressor", description: "Versatile digital compressor with multiple modes. Studio workhorse.", tags: ["versatile", "digital", "modern", "powerful"], soundCharacteristics: { tone: ["versatile", "clean"], qualities: ["flexible", "powerful"] } },
  { name: "DBX 160", brand: "DBX", category: "dynamics", subcategory: "compressor", description: "Classic VCA compressor. Known for its punch on drums and bass.", tags: ["vca", "drums", "bass", "vintage"], soundCharacteristics: { tone: ["punchy", "tight"], qualities: ["solid", "reliable"] } },
  
  // EQs
  { name: "Pultec EQP-1A", brand: "Pultec", category: "eq", subcategory: "equalizer", description: "Classic tube equalizer with distinctive curves. Known for adding weight and presence.", tags: ["vintage", "tube", "eq", "mastering"], soundCharacteristics: { tone: ["warm", "rich"], qualities: ["smooth", "musical"] } },
  { name: "API 550A", brand: "API", category: "eq", subcategory: "equalizer", description: "Legendary 3-band parametric EQ. Punchy and musical.", tags: ["api", "parametric", "punchy", "classic"], soundCharacteristics: { tone: ["punchy", "clear"], qualities: ["musical", "bold"] } },
  { name: "Neve 1073", brand: "Neve", category: "preamp", subcategory: "microphone-preamp", description: "Iconic British preamp and EQ. Warm, thick, and musical.", tags: ["neve", "british", "warm", "classic"], soundCharacteristics: { tone: ["warm", "thick"], qualities: ["musical", "rich"] } },
  
  // Microphones
  { name: "Neumann U87", brand: "Neumann", category: "microphone", subcategory: "large-diaphragm-condenser", description: "Industry standard large diaphragm condenser microphone. Versatile and pristine.", tags: ["condenser", "studio-standard", "versatile", "pristine"], soundCharacteristics: { tone: ["clear", "detailed"], qualities: ["accurate", "smooth"] } },
  { name: "Neumann U47", brand: "Neumann", category: "microphone", subcategory: "large-diaphragm-condenser", description: "Legendary tube microphone. The sound of classic recordings.", tags: ["tube", "vintage", "legendary", "warm"], soundCharacteristics: { tone: ["warm", "vintage"], qualities: ["rich", "smooth"] } },
  { name: "Shure SM7B", brand: "Shure", category: "microphone", subcategory: "dynamic", description: "Broadcast-quality dynamic microphone. Excellent for vocals and podcasting.", tags: ["dynamic", "broadcast", "versatile", "smooth"], soundCharacteristics: { tone: ["smooth", "balanced"], qualities: ["clear", "controlled"] } },
  { name: "Shure SM57", brand: "Shure", category: "microphone", subcategory: "dynamic", description: "The workhorse dynamic microphone. Perfect for snare, guitar cabs, and more.", tags: ["dynamic", "versatile", "durable", "classic"], soundCharacteristics: { tone: ["focused", "mid-forward"], qualities: ["reliable", "punchy"] } },
  { name: "AKG C414", brand: "AKG", category: "microphone", subcategory: "large-diaphragm-condenser", description: "Versatile condenser with multiple polar patterns. Studio standard.", tags: ["condenser", "versatile", "multi-pattern", "professional"], soundCharacteristics: { tone: ["detailed", "natural"], qualities: ["versatile", "accurate"] } },
  { name: "Royer R-121", brand: "Royer", category: "microphone", subcategory: "ribbon", description: "Modern ribbon microphone. Smooth on guitar cabs and brass.", tags: ["ribbon", "smooth", "natural", "modern"], soundCharacteristics: { tone: ["smooth", "natural"], qualities: ["detailed", "warm"] } },
  
  // Guitars
  { name: "Fender Stratocaster", brand: "Fender", category: "guitar", subcategory: "electric-guitar", description: "Iconic electric guitar with single-coil pickups. Versatile and timeless.", tags: ["single-coil", "vintage", "versatile", "classic"], soundCharacteristics: { tone: ["bright", "clear"], qualities: ["articulate", "chimey"] } },
  { name: "Gibson Les Paul", brand: "Gibson", category: "guitar", subcategory: "electric-guitar", description: "Legendary solidbody guitar with humbucker pickups. Thick, creamy tone.", tags: ["humbucker", "vintage", "rock", "thick"], soundCharacteristics: { tone: ["thick", "warm"], qualities: ["sustaining", "rich"] } },
  { name: "Fender Telecaster", brand: "Fender", category: "guitar", subcategory: "electric-guitar", description: "Original solidbody electric guitar. Bright, cutting tone.", tags: ["single-coil", "twang", "country", "classic"], soundCharacteristics: { tone: ["bright", "cutting"], qualities: ["twangy", "punchy"] } },
  { name: "Gibson SG", brand: "Gibson", category: "guitar", subcategory: "electric-guitar", description: "Lightweight solidbody with aggressive rock tone. Raw and powerful.", tags: ["humbucker", "rock", "aggressive", "lightweight"], soundCharacteristics: { tone: ["aggressive", "midrange"], qualities: ["raw", "powerful"] } },
  { name: "PRS Custom 24", brand: "PRS", category: "guitar", subcategory: "electric-guitar", description: "Modern boutique electric guitar. Versatile and refined.", tags: ["modern", "versatile", "boutique", "refined"], soundCharacteristics: { tone: ["balanced", "clear"], qualities: ["versatile", "refined"] } },
  
  // Bass
  { name: "Fender Precision Bass", brand: "Fender", category: "bass", subcategory: "electric-bass", description: "The original electric bass guitar. Deep, punchy, and defined.", tags: ["electric-bass", "vintage", "punchy", "classic"], soundCharacteristics: { tone: ["deep", "punchy"], qualities: ["defined", "solid"] } },
  { name: "Fender Jazz Bass", brand: "Fender", category: "bass", subcategory: "electric-bass", description: "Versatile bass with dual pickups. Bright and articulate.", tags: ["electric-bass", "versatile", "bright", "dual-pickup"], soundCharacteristics: { tone: ["bright", "articulate"], qualities: ["versatile", "modern"] } },
  { name: "Music Man StingRay", brand: "Music Man", category: "bass", subcategory: "electric-bass", description: "Active bass with powerful tone. Punchy and aggressive.", tags: ["active", "punchy", "modern", "powerful"], soundCharacteristics: { tone: ["punchy", "aggressive"], qualities: ["powerful", "focused"] } },
  
  // Synths & Keys
  { name: "Moog Minimoog", brand: "Moog", category: "keyboard", subcategory: "analog-synthesizer", description: "Legendary monophonic analog synthesizer. Fat, warm bass and lead sounds.", tags: ["analog", "synth", "bass", "lead"], soundCharacteristics: { tone: ["fat", "warm"], qualities: ["thick", "powerful"] } },
  { name: "Prophet-5", brand: "Sequential", category: "keyboard", subcategory: "analog-synthesizer", description: "Classic polyphonic analog synthesizer. Rich, evolving sounds.", tags: ["analog", "polyphonic", "vintage", "rich"], soundCharacteristics: { tone: ["rich", "warm"], qualities: ["evolving", "complex"] } },
  { name: "Juno-60", brand: "Roland", category: "keyboard", subcategory: "analog-synthesizer", description: "Affordable vintage analog synth with lush chorus. Great pads and strings.", tags: ["analog", "chorus", "pads", "vintage"], soundCharacteristics: { tone: ["lush", "warm"], qualities: ["smooth", "vintage"] } },
  { name: "Rhodes Mark I", brand: "Fender Rhodes", category: "keyboard", subcategory: "piano", description: "Classic electric piano. Warm, bell-like tones.", tags: ["electric-piano", "vintage", "classic", "warm"], soundCharacteristics: { tone: ["warm", "bell-like"], qualities: ["vintage", "smooth"] } },
  { name: "Hammond B3", brand: "Hammond", category: "keyboard", subcategory: "organ", description: "Legendary tonewheel organ. The sound of soul, jazz, and rock.", tags: ["organ", "vintage", "soul", "jazz"], soundCharacteristics: { tone: ["rich", "full"], qualities: ["vintage", "powerful"] } },
  
  // Amps
  { name: "Marshall JCM800", brand: "Marshall", category: "amplifier", subcategory: "guitar-head", description: "Classic British rock amplifier head. Aggressive, high-gain tones.", tags: ["british", "rock", "high-gain", "classic"], soundCharacteristics: { tone: ["aggressive", "crunchy"], qualities: ["powerful", "focused"] } },
  { name: "Fender Twin Reverb", brand: "Fender", category: "amplifier", subcategory: "combo", description: "Clean American combo amp. Pristine cleans and lush reverb.", tags: ["clean", "american", "reverb", "vintage"], soundCharacteristics: { tone: ["clean", "bright"], qualities: ["pristine", "powerful"] } },
  { name: "Vox AC30", brand: "Vox", category: "amplifier", subcategory: "combo", description: "British combo amp with chimey top end. The sound of the Beatles.", tags: ["british", "chime", "vintage", "classic"], soundCharacteristics: { tone: ["chimey", "bright"], qualities: ["jangly", "vintage"] } },
  { name: "Mesa Boogie Dual Rectifier", brand: "Mesa Boogie", category: "amplifier", subcategory: "guitar-head", description: "High-gain modern metal amplifier. Massive bottom end and sustain.", tags: ["high-gain", "metal", "modern", "heavy"], soundCharacteristics: { tone: ["heavy", "aggressive"], qualities: ["tight", "massive"] } },
  { name: "Ampeg SVT", brand: "Ampeg", category: "amplifier", subcategory: "bass-head", description: "The king of bass amplifiers. Huge, warm tube tone.", tags: ["bass", "tube", "vintage", "powerful"], soundCharacteristics: { tone: ["warm", "huge"], qualities: ["powerful", "vintage"] } },
  
  // Cabinets
  { name: "Marshall 1960A", brand: "Marshall", category: "cabinet", subcategory: "guitar-cabinet", description: "Classic 4x12 guitar cabinet. The sound of rock.", tags: ["4x12", "british", "rock", "classic"], soundCharacteristics: { tone: ["focused", "aggressive"], qualities: ["powerful", "tight"] } },
  { name: "Orange PPC412", brand: "Orange", category: "cabinet", subcategory: "guitar-cabinet", description: "British 4x12 cabinet with vintage voiced speakers. Thick and warm.", tags: ["4x12", "british", "vintage", "thick"], soundCharacteristics: { tone: ["thick", "warm"], qualities: ["vintage", "powerful"] } },
  
  // Reverbs & Delays
  { name: "Lexicon 224", brand: "Lexicon", category: "effects", subcategory: "reverb", description: "Legendary digital reverb. The sound of 80s records.", tags: ["digital", "reverb", "vintage", "lush"], soundCharacteristics: { tone: ["lush", "spacious"], qualities: ["smooth", "vintage"] } },
  { name: "EMT 140 Plate", brand: "EMT", category: "effects", subcategory: "reverb", description: "Classic plate reverb. Dense, smooth, and musical.", tags: ["plate", "vintage", "smooth", "dense"], soundCharacteristics: { tone: ["dense", "smooth"], qualities: ["musical", "rich"] } },
  { name: "Space Echo RE-201", brand: "Roland", category: "effects", subcategory: "tape-echo", description: "Iconic tape echo and reverb. Warm, analog repeats.", tags: ["tape", "echo", "vintage", "warm"], soundCharacteristics: { tone: ["warm", "vintage"], qualities: ["organic", "musical"] } },
  { name: "Eventide H3000", brand: "Eventide", category: "effects", subcategory: "reverb", description: "Professional multi-effects processor. Endless possibilities.", tags: ["digital", "multi-fx", "versatile", "modern"], soundCharacteristics: { tone: ["clean", "versatile"], qualities: ["detailed", "precise"] } },
  
  // Preamps
  { name: "API 512c", brand: "API", category: "preamp", subcategory: "microphone-preamp", description: "Classic API preamp. Punchy and clear with signature color.", tags: ["api", "punchy", "color", "classic"], soundCharacteristics: { tone: ["punchy", "clear"], qualities: ["bold", "musical"] } },
  { name: "Neve 1073", brand: "Neve", category: "preamp", subcategory: "microphone-preamp", description: "Iconic British preamp and EQ. Warm, thick, and musical.", tags: ["neve", "british", "warm", "classic"], soundCharacteristics: { tone: ["warm", "thick"], qualities: ["musical", "rich"] } },
  { name: "SSL VHD", brand: "SSL", category: "preamp", subcategory: "microphone-preamp", description: "Modern SSL preamp with variable harmonic distortion.", tags: ["ssl", "modern", "versatile", "clean"], soundCharacteristics: { tone: ["clean", "versatile"], qualities: ["transparent", "flexible"] } },
  { name: "Universal Audio 610", brand: "Universal Audio", category: "preamp", subcategory: "microphone-preamp", description: "Tube preamp with vintage warmth. Classic UA sound.", tags: ["tube", "vintage", "warm", "ua"], soundCharacteristics: { tone: ["warm", "vintage"], qualities: ["smooth", "musical"] } },
  
  // More Microphones
  { name: "Shure SM58", brand: "Shure", category: "microphone", subcategory: "dynamic", description: "World's most popular vocal microphone. Reliable and consistent.", tags: ["dynamic", "vocal", "live", "durable"], soundCharacteristics: { tone: ["present", "clear"], qualities: ["reliable", "consistent"] } },
  { name: "Sennheiser MD421", brand: "Sennheiser", category: "microphone", subcategory: "dynamic", description: "Versatile dynamic mic. Great on toms, guitar cabs, and vocals.", tags: ["dynamic", "versatile", "full-range", "classic"], soundCharacteristics: { tone: ["full", "detailed"], qualities: ["versatile", "clear"] } },
  { name: "AKG C12", brand: "AKG", category: "microphone", subcategory: "large-diaphragm-condenser", description: "Rare vintage tube condenser. Holy grail of microphones.", tags: ["tube", "vintage", "rare", "legendary"], soundCharacteristics: { tone: ["warm", "vintage"], qualities: ["smooth", "luxurious"] } },
  { name: "Coles 4038", brand: "Coles", category: "microphone", subcategory: "ribbon", description: "Classic British ribbon microphone. Smooth and natural.", tags: ["ribbon", "british", "vintage", "smooth"], soundCharacteristics: { tone: ["smooth", "natural"], qualities: ["gentle", "vintage"] } },
  
  // More Guitars
  { name: "Gretsch White Falcon", brand: "Gretsch", category: "guitar", subcategory: "electric-guitar", description: "Iconic hollowbody electric. Bright, chimey tone.", tags: ["hollowbody", "vintage", "bright", "chimey"], soundCharacteristics: { tone: ["bright", "chimey"], qualities: ["jangly", "resonant"] } },
  { name: "Rickenbacker 360", brand: "Rickenbacker", category: "guitar", subcategory: "electric-guitar", description: "Semi-hollow electric with jangly tone. The sound of the 60s.", tags: ["semi-hollow", "jangle", "60s", "chimey"], soundCharacteristics: { tone: ["jangly", "chimey"], qualities: ["bright", "distinctive"] } },
  { name: "Martin D-28", brand: "Martin", category: "guitar", subcategory: "acoustic-guitar", description: "Legendary dreadnought acoustic guitar. Powerful and balanced.", tags: ["acoustic", "dreadnought", "vintage", "powerful"], soundCharacteristics: { tone: ["balanced", "powerful"], qualities: ["rich", "resonant"] } },
  
  // Additional gear for variety
  { name: "Yamaha NS-10M", brand: "Yamaha", category: "monitoring", subcategory: "studio-monitor", description: "Industry standard nearfield monitors. The truth speakers.", tags: ["nearfield", "reference", "standard", "accurate"], soundCharacteristics: { tone: ["accurate", "revealing"], qualities: ["honest", "detailed"] } },
  { name: "Sennheiser HD 650", brand: "Sennheiser", category: "monitoring", subcategory: "headphones", description: "Reference open-back headphones. Natural and detailed.", tags: ["open-back", "reference", "detailed", "natural"], soundCharacteristics: { tone: ["natural", "balanced"], qualities: ["detailed", "smooth"] } },
  { name: "Beyerdynamic DT 770 Pro", brand: "Beyerdynamic", category: "monitoring", subcategory: "headphones", description: "Closed-back studio headphones. Detailed and powerful.", tags: ["closed-back", "studio", "detailed", "powerful"], soundCharacteristics: { tone: ["detailed", "powerful"], qualities: ["accurate", "tight"] } },
  { name: "Empirical Labs EL8X Distressor", brand: "Empirical Labs", category: "dynamics", subcategory: "compressor", description: "Stereo version of the classic Distressor. Flexible and powerful.", tags: ["stereo", "digital", "versatile", "modern"], soundCharacteristics: { tone: ["clean", "flexible"], qualities: ["powerful", "detailed"] } },
  { name: "Avalon VT-737sp", brand: "Avalon", category: "preamp", subcategory: "channel-strip", description: "High-end channel strip with Class A preamp, EQ, and compressor.", tags: ["channel-strip", "high-end", "clean", "versatile"], soundCharacteristics: { tone: ["clean", "detailed"], qualities: ["pristine", "transparent"] } },
  { name: "Manley VOXBOX", brand: "Manley", category: "preamp", subcategory: "channel-strip", description: "All-tube channel strip. Warm and musical for vocals.", tags: ["tube", "channel-strip", "vocal", "warm"], soundCharacteristics: { tone: ["warm", "tube"], qualities: ["musical", "smooth"] } },
  { name: "Focusrite Red 1", brand: "Focusrite", category: "preamp", subcategory: "microphone-preamp", description: "Classic British preamp. Clear and open.", tags: ["british", "clear", "vintage", "open"], soundCharacteristics: { tone: ["clear", "open"], qualities: ["detailed", "musical"] } },
  { name: "BAE 1073", brand: "BAE", category: "preamp", subcategory: "microphone-preamp", description: "Neve 1073 clone. Warm British tone.", tags: ["neve-style", "warm", "british", "clone"], soundCharacteristics: { tone: ["warm", "rich"], qualities: ["musical", "thick"] } },
  { name: "Shadow Hills Mastering Compressor", brand: "Shadow Hills", category: "dynamics", subcategory: "compressor", description: "High-end mastering compressor with transformer selection.", tags: ["mastering", "high-end", "flexible", "clean"], soundCharacteristics: { tone: ["clean", "powerful"], qualities: ["flexible", "musical"] } },
  { name: "Fairchild 670", brand: "Fairchild", category: "dynamics", subcategory: "compressor", description: "The holy grail of compressors. Smooth and luxurious.", tags: ["tube", "vintage", "rare", "legendary"], soundCharacteristics: { tone: ["smooth", "luxurious"], qualities: ["musical", "vintage"] } },
];

// Sample project templates
const SAMPLE_PROJECTS = [
  { name: "Indie Rock EP", clientName: "The Velvet Waves", description: "Four-track EP recording for up-and-coming indie rock band", status: "PLANNING" },
  { name: "Jazz Album Session", clientName: "Marcus Johnson Quartet", description: "Full album recording with live tracking", status: "CONFIRMED" },
  { name: "Singer-Songwriter Demo", clientName: "Emma Chen", description: "Acoustic demo recording session", status: "IN_SESSION" },
];

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count existing items
    const existingGearCount = await prisma.gear.count();
    const existingProjectCount = await prisma.project.count();

    const results = {
      gearAdded: 0,
      projectsAdded: 0,
      gearAssignmentsAdded: 0,
    };

    // Add projects if needed (target: 3)
    const projectsToAdd = Math.max(0, 3 - existingProjectCount);
    const createdProjects = [];
    
    for (let i = 0; i < projectsToAdd; i++) {
      const template = SAMPLE_PROJECTS[i % SAMPLE_PROJECTS.length];
      const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
      
      const project = await prisma.project.create({
        data: {
          name: `${template.name} ${i + 1}`,
          clientName: template.clientName,
          description: template.description,
          status: template.status as any,
          primaryColor: randomColor,
        },
      });
      
      createdProjects.push(project);
      results.projectsAdded++;
    }

    // Add gear if needed (target: 50)
    const gearToAdd = Math.max(0, 50 - existingGearCount);
    const createdGear = [];
    
    // Use templates only once, don't repeat
    const templatesToUse = SAMPLE_GEAR_TEMPLATES.slice(0, Math.min(gearToAdd, SAMPLE_GEAR_TEMPLATES.length));
    
    for (let i = 0; i < templatesToUse.length; i++) {
      const template = templatesToUse[i];
      const timestamp = Date.now() + i;
      
      const gear = await prisma.gear.create({
        data: {
          id: `${template.brand.toLowerCase().replace(/\s+/g, '-')}-${template.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`,
          name: template.name,
          brand: template.brand,
          category: template.category,
          subcategory: template.subcategory,
          description: template.description,
          soundCharacteristics: template.soundCharacteristics,
          tags: template.tags,
          dateAdded: new Date(),
          lastUsed: new Date(),
        },
      });
      
      createdGear.push(gear);
      results.gearAdded++;
    }

    // Assign some gear to projects
    const allProjects = await prisma.project.findMany({
      where: { status: { in: ['PLANNING', 'CONFIRMED', 'IN_SESSION'] } },
      take: 3,
    });

    const allGear = await prisma.gear.findMany({ take: 20 });

    if (allProjects.length > 0 && allGear.length > 0) {
      // Assign gear to projects (some projects get gear, one stays empty)
      for (let i = 0; i < Math.min(allProjects.length - 1, 2); i++) {
        const project = allProjects[i];
        const numGearToAssign = Math.floor(Math.random() * 5) + 3; // 3-7 items

        for (let j = 0; j < numGearToAssign && j < allGear.length; j++) {
          const gearItem = allGear[j];
          
          try {
            await prisma.projectGear.create({
              data: {
                projectId: project.id,
                gearId: gearItem.id,
              },
            });
            results.gearAssignmentsAdded++;
          } catch (error) {
            // Skip if already exists (unique constraint)
            continue;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully`,
      results,
      summary: {
        totalGear: existingGearCount + results.gearAdded,
        totalProjects: existingProjectCount + results.projectsAdded,
        gearAssignments: results.gearAssignmentsAdded,
      }
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

