import { GearItem } from '@/lib/types';

export const mockGearData: GearItem[] = [
  {
    id: "comp-001",
    name: "1176LN Compressor/Limiter",
    brand: "Universal Audio",
    category: "dynamics",
    subcategory: "compressor",
    description: "Legendary FET compressor known for its fast attack time and ability to add punch and presence. The 1176 is one of the most recorded compressors in history, heard on countless hit records.",
    soundCharacteristics: {
      tone: ["punchy", "aggressive", "present"],
      qualities: ["fast", "colorful", "exciting"]
    },
    parameters: [
      { name: "Input", type: "knob", range: "Variable input gain" },
      { name: "Output", type: "knob", range: "Variable output level" },
      { name: "Attack", type: "knob", range: "20µs to 800µs (7 positions)" },
      { name: "Release", type: "knob", range: "50ms to 1.1s (7 positions)" },
      { name: "Ratio", type: "button", range: "4:1, 8:1, 12:1, 20:1, All Buttons (British Mode)" }
    ],
    tags: ["vintage-style", "FET", "studio-standard", "aggressive", "fast-attack", "vocal", "drums"],
    specifications: {
      type: "FET",
      format: "rackmount",
      channels: "mono"
    },
    status: "available",
    usage: [
      {
        songTitle: "Electric Dreams",
        artist: "Studio Session",
        timestamp: "02:15-03:45",
        context: "Lead vocal compression with 4:1 ratio for controlled energy"
      },
      {
        songTitle: "Midnight Runner",
        artist: "Studio Session",
        timestamp: "01:00-04:30",
        context: "Parallel drum compression for punch"
      }
    ],
    media: {
      photos: ["/media/gear/ua-1176ln-front.jpg", "/media/gear/ua-1176ln-rear.jpg"],
      demoAudio: "/media/demos/1176-vocal-demo.wav",
      demoVideo: "https://youtube.com/watch?v=example1176",
      manualPdf: "/media/manuals/ua-1176ln-manual.pdf"
    },
    connections: {
      pairedWith: ["preamp-neve-1073", "eq-pultec"]
    },
    notes: "Rev D circuit. Serviced in 2024. Excellent condition.",
    dateAdded: "2020-03-15",
    lastUsed: "2025-10-28"
  },
  {
    id: "guitar-001",
    name: "Stratocaster",
    brand: "Fender",
    category: "guitar",
    subcategory: "electric-guitar",
    description: "1979 Fender Stratocaster loaded with Duncan Antiquity II pickups. Classic Strat tone with vintage warmth and clarity. The Antiquity IIs provide authentic vintage PAF-style tone with improved clarity.",
    soundCharacteristics: {
      tone: ["bright", "clear", "chimey"],
      qualities: ["articulate", "versatile", "glassy"]
    },
    parameters: [
      { name: "Pickup Selector", type: "switch", range: "5-way (bridge, bridge+middle, middle, middle+neck, neck)" },
      { name: "Volume", type: "knob", range: "0-10" },
      { name: "Tone (Neck)", type: "knob", range: "0-10" },
      { name: "Tone (Middle)", type: "knob", range: "0-10" }
    ],
    tags: ["vintage", "1979", "strat", "humbucker", "duncan", "versatile"],
    specifications: {
      year: 1979,
      condition: "excellent",
      modifications: ["Duncan Antiquity II pickups"],
      finish: "original",
      body: "alder",
      neck: "maple",
      scale: "25.5 inch"
    },
    status: "available",
    usage: [
      {
        songTitle: "Sunset Boulevard",
        artist: "The Session Players",
        timestamp: "00:00-03:45",
        context: "Clean rhythm guitar through Twin Reverb, position 4 (neck+middle)"
      },
      {
        songTitle: "Electric Avenue",
        artist: "Rock Session",
        timestamp: "01:30-02:45",
        context: "Bridge pickup lead tone through Marshall JMP"
      }
    ],
    media: {
      photos: ["/media/gear/strat-1979-full.jpg", "/media/gear/strat-1979-headstock.jpg"],
      demoAudio: "/media/demos/strat-clean-demo.wav",
      demoVideo: "https://youtube.com/watch?v=examplestrat79"
    },
    connections: {
      pairedWith: ["amp-twin-reverb", "amp-marshall-jmp", "pedal-tubescreamer"]
    },
    notes: "Original hardshell case included. Set up with 10-46 strings.",
    dateAdded: "2018-06-20",
    lastUsed: "2025-10-29"
  },
  {
    id: "amp-001",
    name: "VH4",
    brand: "Diezel",
    category: "amplifier",
    subcategory: "guitar-head",
    description: "German-made 100W four-channel tube amplifier head known for its massive low-end, crystal-clear highs, and brutal high-gain tones. Used by metal and rock artists worldwide.",
    soundCharacteristics: {
      tone: ["tight", "articulate", "heavy"],
      qualities: ["crushing", "modern", "precise", "massive"]
    },
    parameters: [
      { name: "Channel", type: "switch", range: "1 (clean), 2 (crunch), 3 (mega), 4 (ultra)" },
      { name: "Gain", type: "knob", range: "0-10 per channel" },
      { name: "Master Volume", type: "knob", range: "0-10 per channel" },
      { name: "EQ (Bass/Mid/Treble/Presence)", type: "knob", range: "0-10 per channel" },
      { name: "Deep", type: "switch", range: "on/off per channel" }
    ],
    tags: ["high-gain", "metal", "modern", "german", "tube", "100-watt", "four-channel"],
    specifications: {
      power: "100W",
      tubes: "6L6",
      channels: 4,
      "effects-loop": true
    },
    status: "available",
    usage: [
      {
        songTitle: "Iron Mountain",
        artist: "Metal Project",
        timestamp: "00:30-04:00",
        context: "Channel 3 for rhythm guitars, channel 4 for leads"
      }
    ],
    media: {
      photos: ["/media/gear/diezel-vh4-front.jpg"],
      demoAudio: "/media/demos/vh4-high-gain.wav",
      demoVideo: "https://youtube.com/watch?v=examplevh4"
    },
    connections: {
      pairedWith: ["cab-diezel-412", "guitar-lespaul-custom"]
    },
    notes: "Retubed in 2024. Includes MIDI footswitch.",
    dateAdded: "2019-11-10",
    lastUsed: "2025-10-25"
  },
  {
    id: "synth-001",
    name: "Voyager",
    brand: "Moog",
    category: "keyboard",
    subcategory: "analog-synthesizer",
    description: "Anniversary Edition Moog Voyager. Legendary monophonic analog synthesizer with touch surface controls, producing the classic fat Moog bass and lead sounds. This special edition features premium wood panels.",
    soundCharacteristics: {
      tone: ["fat", "warm", "rich"],
      qualities: ["analog", "powerful", "expressive", "thick"]
    },
    parameters: [
      { name: "Oscillators", type: "knob", range: "3 oscillators with waveform selection" },
      { name: "Filter Cutoff", type: "knob", range: "20Hz - 20kHz" },
      { name: "Filter Resonance", type: "knob", range: "0-10" },
      { name: "ADSR Envelope", type: "knob", range: "Attack/Decay/Sustain/Release controls" },
      { name: "LFO", type: "knob", range: "Rate and amount controls" },
      { name: "Mod Wheel", type: "wheel", range: "Assignable modulation" },
      { name: "Pitch Wheel", type: "wheel", range: "+/- 2 semitones (adjustable)" }
    ],
    tags: ["analog", "monophonic", "moog", "bass", "lead", "anniversary-edition", "boutique"],
    specifications: {
      voices: "monophonic",
      keyboard: "44 keys",
      edition: "Anniversary Edition",
      oscillators: 3,
      filter: "Moog ladder filter"
    },
    status: "available",
    usage: [
      {
        songTitle: "Cosmic Journey",
        artist: "Synth Wave",
        timestamp: "01:00-05:30",
        context: "Bassline and lead sequences throughout"
      },
      {
        songTitle: "Analog Dreams",
        artist: "Electronic Project",
        timestamp: "02:00-03:15",
        context: "Thick bass foundation"
      }
    ],
    media: {
      photos: ["/media/gear/moog-voyager-ae.jpg", "/media/gear/moog-voyager-panel.jpg"],
      demoAudio: "/media/demos/voyager-bass-lead.wav",
      demoVideo: "https://youtube.com/watch?v=examplevoyager"
    },
    connections: {
      pairedWith: ["preamp-la610", "comp-tubetech-cl1b"]
    },
    notes: "Anniversary Edition with wooden side panels. Includes original case and manuals.",
    dateAdded: "2017-04-12",
    lastUsed: "2025-10-27"
  },
  {
    id: "mic-001",
    name: "U47",
    brand: "Telefunken",
    category: "microphone",
    subcategory: "large-diaphragm-condenser",
    description: "Legendary large-diaphragm tube condenser microphone. The U47 is one of the most sought-after vocal microphones in history, known for its warm, smooth, and detailed sound.",
    soundCharacteristics: {
      tone: ["warm", "smooth", "rich"],
      qualities: ["detailed", "vintage", "three-dimensional", "silky"]
    },
    parameters: [
      { name: "Polar Pattern", type: "switch", range: "Cardioid / Omnidirectional" },
      { name: "Pad", type: "switch", range: "-10dB on/off" }
    ],
    tags: ["tube", "vintage-style", "vocal", "premium", "cardioid", "omni", "telefunken"],
    specifications: {
      type: "tube condenser",
      pattern: "cardioid/omni switchable",
      impedance: "200 ohms",
      connector: "XLR",
      tube: "VF14M"
    },
    status: "available",
    usage: [
      {
        songTitle: "Velvet Voice",
        artist: "Jazz Session",
        timestamp: "00:00-04:30",
        context: "Lead vocal, cardioid pattern, through Neve 1073"
      },
      {
        songTitle: "Acoustic Sunrise",
        artist: "Folk Project",
        timestamp: "01:15-03:45",
        context: "Acoustic guitar, omni pattern for room sound"
      }
    ],
    media: {
      photos: ["/media/gear/telefunken-u47.jpg"],
      demoAudio: "/media/demos/u47-vocal-acoustic.wav",
      demoVideo: "https://youtube.com/watch?v=exampleu47"
    },
    connections: {
      pairedWith: ["preamp-neve-1073", "preamp-chandler-mini", "comp-cl1b"]
    },
    notes: "Includes power supply, shock mount, and road case. Serviced annually.",
    dateAdded: "2016-08-05",
    lastUsed: "2025-10-29"
  },
  {
    id: "comp-002",
    name: "EL-8X Distressor",
    brand: "Empirical Labs",
    category: "dynamics",
    subcategory: "compressor",
    description: "Distressor with British Mode modifications. Extremely versatile compressor/limiter capable of subtle level control to extreme distortion. The British Mod adds harmonics and color inspired by vintage British consoles.",
    soundCharacteristics: {
      tone: ["versatile", "colored", "aggressive"],
      qualities: ["punchy", "gritty", "controllable", "characterful"]
    },
    parameters: [
      { name: "Input", type: "knob", range: "Variable gain" },
      { name: "Output", type: "knob", range: "Variable attenuation" },
      { name: "Ratio", type: "switch", range: "1:1 to 20:1, Nuke, and combinations" },
      { name: "Attack", type: "knob", range: "10 positions" },
      { name: "Release", type: "knob", range: "10 positions" },
      { name: "Distortion", type: "switch", range: "Dist 2, Dist 3, British Mode" }
    ],
    tags: ["versatile", "aggressive", "british-mod", "color", "studio-standard", "drums", "bass"],
    specifications: {
      type: "VCA",
      format: "rackmount",
      channels: "mono",
      modifications: ["British Mode"]
    },
    status: "available",
    usage: [
      {
        songTitle: "Heavy Hitter",
        artist: "Rock Band",
        timestamp: "00:00-04:00",
        context: "Snare drum with British Mode for punch and grit"
      },
      {
        songTitle: "Bass Nation",
        artist: "Hip Hop Session",
        timestamp: "01:00-03:30",
        context: "Bass guitar compression with Dist 2 mode"
      }
    ],
    media: {
      photos: ["/media/gear/distressor-british.jpg"],
      demoAudio: "/media/demos/distressor-drum-bass.wav",
      demoVideo: "https://youtube.com/watch?v=exampledistressor"
    },
    connections: {
      pairedWith: []
    },
    notes: "One of two Distressors with British Mod. Calibrated 2024.",
    dateAdded: "2019-02-20",
    lastUsed: "2025-10-28"
  },
  {
    id: "echo-001",
    name: "Echoplex EP-4",
    brand: "Maestro",
    category: "effects",
    subcategory: "tape-echo",
    description: "Vintage Maestro Echoplex EP-4 tape echo unit. Creates warm, organic delay with natural tape saturation and modulation. The EP-4 is prized for its musical degradation and warm repeats.",
    soundCharacteristics: {
      tone: ["warm", "organic", "degraded"],
      qualities: ["vintage", "musical", "saturated", "wobbly"]
    },
    parameters: [
      { name: "Echo Volume", type: "knob", range: "0-10" },
      { name: "Sustain/Repeat", type: "knob", range: "0-10" },
      { name: "Delay Time", type: "slider", range: "~40ms to 600ms (tape speed)" },
      { name: "Sound on Sound", type: "button", range: "on/off" }
    ],
    tags: ["vintage", "tape", "analog", "echo", "delay", "warm", "classic"],
    specifications: {
      type: "tape echo",
      format: "standalone unit",
      era: "vintage",
      "tape-width": "1/4 inch"
    },
    status: "available",
    usage: [
      {
        songTitle: "Desert Highway",
        artist: "Americana Band",
        timestamp: "02:00-04:30",
        context: "Lead guitar slapback and ambient trails"
      }
    ],
    media: {
      photos: ["/media/gear/maestro-ep4.jpg"],
      demoAudio: "/media/demos/ep4-guitar-demo.wav",
      demoVideo: "https://youtube.com/watch?v=exampleep4"
    },
    connections: {
      pairedWith: ["guitar-strat-79", "amp-fender-twin"]
    },
    notes: "Original vintage unit. Recently serviced with new tape loop and motor maintenance.",
    dateAdded: "2018-09-15",
    lastUsed: "2025-10-26"
  },
  {
    id: "preamp-001",
    name: "1073",
    brand: "Neve",
    category: "preamp",
    subcategory: "microphone-preamp",
    description: "Vintage Neve 1073 preamp/EQ module. One of the most iconic preamps ever made, known for its thick, warm sound and musical three-band EQ. The Class A design adds richness and character to any source.",
    soundCharacteristics: {
      tone: ["warm", "thick", "colored"],
      qualities: ["vintage", "musical", "classic", "rich"]
    },
    parameters: [
      { name: "Gain", type: "knob", range: "30-80dB" },
      { name: "High Frequency", type: "knob", range: "12kHz, 10kHz, 8kHz, 6kHz (switchable frequencies)" },
      { name: "Mid Frequency", type: "knob", range: "0.36kHz to 7.2kHz (11 positions)" },
      { name: "Low Frequency", type: "switch", range: "35Hz, 60Hz, 110Hz, 220Hz" },
      { name: "EQ Boost/Cut", type: "knob", range: "+/-16dB per band" },
      { name: "Phantom Power", type: "switch", range: "on/off" },
      { name: "Phase Reverse", type: "switch", range: "on/off" }
    ],
    tags: ["vintage", "neve", "1073", "classic", "eq", "transformer", "class-a"],
    specifications: {
      type: "Class A",
      format: "500-series / module",
      era: "vintage",
      transformer: "Marinair"
    },
    status: "available",
    usage: [
      {
        songTitle: "Velvet Voice",
        artist: "Jazz Session",
        timestamp: "00:00-04:30",
        context: "Vocal chain with Telefunken U47, gentle high shelf at 10kHz"
      },
      {
        songTitle: "Kick It",
        artist: "Pop Session",
        timestamp: "00:00-03:30",
        context: "Kick drum with low end boost at 60Hz"
      }
    ],
    media: {
      photos: ["/media/gear/neve-1073-vintage.jpg"],
      demoAudio: "/media/demos/1073-vocal-drum.wav",
      demoVideo: "https://youtube.com/watch?v=example1073"
    },
    connections: {
      pairedWith: ["mic-u47", "mic-u87", "comp-1176"]
    },
    notes: "Original vintage unit from 1970s console. Fully serviced and recapped. One of the studio's crown jewels.",
    dateAdded: "2015-03-10",
    lastUsed: "2025-10-29"
  },
  {
    id: "cab-001",
    name: "1962 4x12 Cabinet",
    brand: "Marshall",
    category: "cabinet",
    subcategory: "guitar-cabinet",
    description: "Vintage Marshall 1962 4x12 cabinet loaded with original Celestion Greenback speakers ('Blackbacks'). These vintage speakers are renowned for warm mids, smooth highs, and that classic British rock tone.",
    soundCharacteristics: {
      tone: ["warm", "mid-focused", "classic"],
      qualities: ["british", "vintage", "smooth", "iconic"]
    },
    parameters: [
      { name: "Input Impedance", type: "jack", range: "16 ohms (mono), 8 ohms (stereo)" }
    ],
    tags: ["vintage", "marshall", "greenback", "blackback", "4x12", "british", "classic-rock"],
    specifications: {
      speakers: "4x12 inch Celestion Greenbacks (original)",
      impedance: "16 ohms",
      era: "vintage",
      configuration: "straight front"
    },
    status: "available",
    usage: [
      {
        songTitle: "Electric Avenue",
        artist: "Rock Session",
        timestamp: "00:00-04:00",
        context: "Paired with Marshall JMP for classic rock rhythm and lead tones"
      },
      {
        songTitle: "British Invasion",
        artist: "Classic Rock Band",
        timestamp: "01:00-03:30",
        context: "Les Paul through Marshall Superlead for vintage crunch"
      }
    ],
    media: {
      photos: ["/media/gear/marshall-1962-vintage.jpg", "/media/gear/marshall-blackbacks.jpg"],
      demoAudio: "/media/demos/marshall-cab-greenback.wav",
      demoVideo: "https://youtube.com/watch?v=examplemarshallcab"
    },
    connections: {
      pairedWith: ["amp-marshall-jmp", "amp-marshall-superlead", "guitar-lespaul"]
    },
    notes: "Original Celestion 'Blackback' Greenbacks. Cabinet in excellent condition with original tolex.",
    dateAdded: "2017-07-22",
    lastUsed: "2025-10-28"
  },
  {
    id: "bass-001",
    name: "SVT",
    brand: "Ampeg",
    category: "amplifier",
    subcategory: "bass-head",
    description: "Vintage Ampeg SVT 'blueline' bass amplifier head. 300 watts of all-tube power producing the definitive rock bass tone. This early model features the coveted blue line faceplate.",
    soundCharacteristics: {
      tone: ["thick", "powerful", "round"],
      qualities: ["warm", "vintage", "massive", "punchy"]
    },
    parameters: [
      { name: "Volume", type: "knob", range: "0-10" },
      { name: "Bass", type: "knob", range: "0-10" },
      { name: "Mid", type: "knob", range: "0-10" },
      { name: "Treble", type: "knob", range: "0-10" },
      { name: "Ultra Hi/Lo", type: "switch", range: "High/Low frequency boost" }
    ],
    tags: ["vintage", "blueline", "tube", "300-watt", "bass", "ampeg", "classic"],
    specifications: {
      power: "300W",
      tubes: "6550 power tubes",
      era: "vintage",
      variant: "blueline"
    },
    status: "available",
    usage: [
      {
        songTitle: "Low End Theory",
        artist: "Rock Band",
        timestamp: "00:00-05:00",
        context: "Jazz Bass through vintage SVT for massive foundational tone"
      },
      {
        songTitle: "Groove Machine",
        artist: "Funk Project",
        timestamp: "02:00-04:00",
        context: "Aggressive fingerstyle bass with Ultra Hi engaged"
      }
    ],
    media: {
      photos: ["/media/gear/ampeg-svt-blueline.jpg"],
      demoAudio: "/media/demos/svt-bass-demo.wav",
      demoVideo: "https://youtube.com/watch?v=examplesvt"
    },
    connections: {
      pairedWith: ["bass-jazz", "cab-ampeg-810-vintage"]
    },
    notes: "Original vintage blueline model. Retubed 2023. Bias checked regularly. Includes road case.",
    dateAdded: "2016-11-18",
    lastUsed: "2025-10-27"
  }
];
