import { Story } from '../types';

export const MOCK_STORIES: Story[] = [
  {
    id: "story-001",
    title: "Breakthrough: Quantum Supremacy Achieved in Room-Temp Semiconductors",
    category: "Quantum & Tech",
    readTime: "1 min read",
    publishedAt: "10 mins ago",
    source: "MIT Technology Review",
    originalUrl: "https://techreview.com/quantum-room-temp-breakthrough",
    summary60w: [
      "Physicists at Oxford and MIT have demonstrated quantum supremacy using a novel room-temperature semiconductor alloy.",
      "The processor completed a molecular simulation in 14 seconds that would take supercomputers 4,000 years.",
      "This breakthrough eliminates the need for expensive liquid helium cryogenic refrigeration in quantum datacenters.",
      "Commercial rollout is projected for 2028, targeting drug discovery, materials science, and cryptography."
    ],
    summaryEli5: [
      "Scientists built a super-fast quantum computer chip that doesn't need freezing cold fridges to work.",
      "It solved a massive science riddle in seconds instead of thousands of years!",
      "This means future computers might design new medicine and batteries in hours instead of decades."
    ],
    summaryDeepDive: "A landmark achievement in quantum computing has been published in Nature Physics today. Researchers from Oxford and MIT successfully ran a 128-qubit algorithm on a diamond-nitrogen semiconductor at 22°C (room temperature). Traditionally, quantum processing units require cryogenic temperatures hovering near absolute zero (-273°C) to prevent thermal decoherence. The team utilized topological surface state protection to maintain quantum coherence for over 1.2 milliseconds—more than sufficient to solve complex protein folding matrix equations. Industry analysts estimate this could reduce quantum datacenter operational overhead by 92%.",
    translations: {
      hi: {
        title: "सफलता: रूम-टेंपरेचर सेमीकंडक्टर्स में क्वांटम सर्वोच्चता हासिल की गई",
        summary60w: [
          "ऑक्सफोर्ड और एमआईटी के भौतिकविदों ने कमरे के तापमान पर चलने वाले सेमीकंडक्टर का उपयोग करके क्वांटम सर्वोच्चता का प्रदर्शन किया।",
          "प्रोसेसर ने 14 सेकंड में आणविक सिमुलेशन पूरा किया जिसे सुपरकंप्यूटर में 4,000 साल लगते।",
          "यह खोज क्वांटम डेटासेंटर में महंगी लिक्विड हीलियम कूलिंग की आवश्यकता को समाप्त करती है।",
          "2028 के लिए वाणिज्यिक लॉन्च का अनुमान है, जो दवा खोज और सामग्री विज्ञान को लक्षित करेगा।"
        ],
        summaryEli5: [
          "वैज्ञानिकों ने एक ऐसा क्वांटम कंप्यूटर बनाया है जिसे ठंडा रखने के लिए बर्फ जैसे फ्रिज की जरूरत नहीं है।",
          "इसने हजारों सालों में होने वाली गणना को कुछ ही सेकंड में हल कर दिया!"
        ],
        summaryDeepDive: "ऑक्सफोर्ड और एमआईटी के वैज्ञानिकों ने कमरे के तापमान (22°C) पर 128-क्यूबिट एल्गोरिदम सफलतापूर्वक चलाया।"
      },
      es: {
        title: "Avance: Supremacía Cuántica Lograda en Semiconductores a Temperatura Ambiente",
        summary60w: [
          "Físicos de Oxford y el MIT han demostrado la supremacía cuántica usando una aleación semiconductora a temperatura ambiente.",
          "El procesador completó una simulación molecular en 14 segundos que tomaría 4.000 años a una supercomputadora.",
          "Este avance elimina la necesidad de refrigeración criogénica costosa en centros de datos cuánticos.",
          "El despliegue comercial está previsto para 2028, orientado a la ciencia de materiales y medicamentos."
        ],
        summaryEli5: [
          "Los científicos crearon un chip cuántico súper rápido que funciona sin necesidad de congeladores helados.",
          "¡Resolvió un acertijo científico en segundos en lugar de miles de años!"
        ],
        summaryDeepDive: "Investigadores de Oxford y el MIT ejecutaron con éxito un algoritmo de 128 cúbits en un semiconductor de diamante a 22 °C."
      },
      ja: {
        title: "画期的な偉業：常温半導体で量子超越性を達成",
        summary60w: [
          "オックスフォードとMITの物理学者が、室温で動作する半導体を使用した量子超越性を実証しました。",
          "スーパーコンピューターで4,000年かかる分子シミュレーションをわずか14秒で完了しました。",
          "量子データセンターにおける高価な液体ヘリウム極低温冷却が不要になります。",
          "商用化は2028年を予定しており、創薬や材料科学への応用が期待されます。"
        ],
        summaryEli5: [
          "科学者たちは、極冷の冷却装置を必要としない超高速量子コンピューターを開発しました。",
          "何千年もかかる複雑な計算をたった14秒で解決しました！"
        ],
        summaryDeepDive: "オックスフォードとMITの研究チームは、22°Cの室温で128量子ビットのアルゴリズムを実行することに成功しました。"
      },
      de: {
        title: "Durchbruch: Quantenüberlegenheit in Raumtemperatur-Halbleitern erreicht",
        summary60w: [
          "Physiker in Oxford und am MIT haben die Quantenüberlegenheit mit einer Raumtemperatur-Halbleiterlegierung demonstriert.",
          "Der Prozessor schloss eine Molekularsimulation in 14 Sekunden ab, für die Supercomputer 4.000 Jahre bräuchten.",
          "Dieser Durchbruch eliminiert die Notwendigkeit teurer flüssiger Helium-Kühlung in Quantenrechenzentren.",
          "Die kommerzielle Einführung ist für 2028 geplant, Zielgruppen sind Medikamentenentwicklung und Materialwissenschaft."
        ],
        summaryEli5: [
          "Wissenschaftler haben einen superschnellen Quantenchip gebaut, der keine eisigen Kühlschränke braucht.",
          "Er hat ein riesiges Rätsel in Sekunden gelöst, anstatt in tausenden von Jahren!"
        ],
        summaryDeepDive: "Forscher aus Oxford und vom MIT führten erfolgreich einen 128-Qubit-Algorithmus bei 22 °C Raumtemperatur aus."
      }
    },
    biasRating: "Neutral",
    biasScore: 92,
    perspectives: [
      { perspective: "Quantum Physics Community", sentiment: "Triumphant breakthrough with peer verification." },
      { perspective: "Hardware Manufacturers", sentiment: "Cautiously optimistic on scaling semiconductor yield." },
      { perspective: "Cybersecurity Analysts", sentiment: "Urgent call to transition to post-quantum encryption." }
    ],
    smartGlossary: [
      {
        term: "quantum supremacy",
        definition: "The point where a quantum computer performs a calculation that no classical supercomputer can complete in a reasonable timeframe."
      },
      {
        term: "decoherence",
        definition: "The loss of quantum state coherence when qubits interact with external environmental thermal noise."
      },
      {
        term: "qubit",
        definition: "The basic unit of quantum information, capable of representing 0, 1, or both simultaneously via superposition."
      }
    ],
    voiceAudioText: "Breakthrough: Quantum Supremacy Achieved in Room Temperature Semiconductors. Physicists at Oxford and MIT have demonstrated quantum supremacy using a novel semiconductor alloy.",
    isBookmarked: false
  },
  {
    id: "story-002",
    title: "Fusion Energy Milestone: Tokamak Sustains Net Power Output for 72 Hours",
    category: "Energy & Climate",
    readTime: "2 min read",
    publishedAt: "45 mins ago",
    source: "Nature Energy",
    originalUrl: "https://nature.com/articles/fusion-tokamak-net-power-72h",
    summary60w: [
      "The SPARC magnet fusion reactor reached Q-factor of 11.4, generating 500MW of sustained clean energy.",
      "High-temperature superconducting (HTS) magnets contained 150-million-degree plasma without magnetic drift.",
      "Grid integration tests successfully delivered surplus power directly to 250,000 municipal homes.",
      "Clean energy consortiums hail this as the definitive end of fossil-fuel baseload dependence."
    ],
    summaryEli5: [
      "Scientists trapped a mini-sun inside a magnetic bottle for 3 whole days!",
      "It created way more clean electricity than it used, powering an entire city with zero pollution."
    ],
    summaryDeepDive: "Engineers at Commonwealth Fusion Systems and MIT have announced a continuous 72-hour sustained fusion reaction with net positive energy gain (Q > 10). Utilizing REBCO superconducting magnets running at 20 Tesla, the reactor stabilized plasma instabilities.",
    translations: {
      hi: {
        title: "फ्यूजन ऊर्जा में नया कीर्तिमान: टोकामैक ने 72 घंटे तक शुद्ध बिजली उत्पादन किया",
        summary60w: [
          "SPARC फ्यूजन रिएक्टर ने 11.4 का Q-फैक्टर हासिल किया, जिससे 500MW स्वच्छ ऊर्जा उत्पन्न हुई।",
          "उच्च तापमान सुपरकंडक्टिंग मैग्नेट ने 15 करोड़ डिग्री प्लाज्मा को नियंत्रित रखा।"
        ],
        summaryEli5: ["वैज्ञानिकों ने एक छोटे सूरज को 3 दिनों तक चुंबकीय बोतल में बंद रखा!"],
        summaryDeepDive: "MIT के इंजीनियरों ने 72 घंटे तक निरंतर फ्यूजन रिएक्शन चालू रखा।"
      }
    },
    biasRating: "Optimistic",
    biasScore: 88,
    perspectives: [
      { perspective: "Clean Energy Advocates", sentiment: "Historical turning point for global decarbonization." },
      { perspective: "Grid Utility Operators", sentiment: "Demands upgraded high-voltage DC distribution infrastructure." }
    ],
    smartGlossary: [
      {
        term: "Q-factor",
        definition: "The ratio of fusion energy produced to the energy required to heat and maintain the plasma."
      },
      {
        term: "Tokamak",
        definition: "A magnetic confinement device shaped like a torus designed to contain high-temperature fusion plasma."
      }
    ],
    voiceAudioText: "Fusion Energy Milestone: Tokamak Sustains Net Power Output for 72 Hours.",
    isBookmarked: false
  },
  {
    id: "story-003",
    title: "AI Medical Agent Discovers Broad-Spectrum Synthetic Antibiotic 'Abyssicin-X'",
    category: "Biotech & AI",
    readTime: "1 min read",
    publishedAt: "2 hours ago",
    source: "Lancet Digital Health",
    originalUrl: "https://thelancet.com/ai-antibiotic-abyssicin-discovery",
    summary60w: [
      "Autonomous generative AI model screened 42 million synthetic peptide candidates in 36 hours.",
      "The compound 'Abyssicin-X' kills multidrug-resistant superbugs including MRSA and Pseudomonas.",
      "Unlike traditional antibiotics, Abyssicin-X disrupts bacterial cell wall lipid electrostatic anchors.",
      "Pre-clinical animal trials showed 99.4% pathogen eradication with zero organ cytotoxicity."
    ],
    summaryEli5: [
      "A smart AI doctor searched millions of chemical recipes in just a day and a half.",
      "It discovered a powerful new medicine that destroys superbug bacteria!"
    ],
    summaryDeepDive: "Researchers utilizing a deep diffusion neural architecture named BioGen-Alpha identified a novel non-ribosomal peptide dubbed Abyssicin-X.",
    biasRating: "Neutral",
    biasScore: 95,
    perspectives: [
      { perspective: "Pharmacologists", sentiment: "Game-changing computational pipeline for drug discovery." }
    ],
    smartGlossary: [
      {
        term: "superbugs",
        definition: "Strains of bacteria, viruses, or fungi resistant to most antibiotics commonly used today."
      }
    ],
    voiceAudioText: "AI Medical Agent Discovers Broad-Spectrum Synthetic Antibiotic Abyssicin-X.",
    isBookmarked: false
  },
  {
    id: "story-004",
    title: "Global Accord Signed for Autonomous Asteroid Mining & Space Property Rights",
    category: "Policy & Space",
    readTime: "2 min read",
    publishedAt: "4 hours ago",
    source: "Reuters Space Brief",
    originalUrl: "https://reuters.com/world/space-asteroid-mining-accord-2026",
    summary60w: [
      "48 sovereign nations ratified the Geneva Space Commerce Accord governing extra-terrestrial resource extraction.",
      "Framework establishes 200-kilometer orbital safety zones around designated mining targets.",
      "A mandatory 12% global wealth fund royalty is levied on all harvested rare-earth metals and platinum.",
      "First robotic prospector swarm is scheduled to launch toward near-Earth asteroid Psyche-16 next autumn."
    ],
    summaryEli5: [
      "World leaders agreed on rules for mining gold and platinum from giant space rocks!"
    ],
    summaryDeepDive: "The United Nations Office for Outer Space Affairs hosted the historic treaty signing in Geneva.",
    biasRating: "Critical",
    biasScore: 76,
    perspectives: [
      { perspective: "Developing Nations", sentiment: "Demands equitable distribution of space royalty revenues." }
    ],
    smartGlossary: [
      {
        term: "Psyche-16",
        definition: "A heavy metal-rich asteroid estimated to contain quadrillions in iron and nickel."
      }
    ],
    voiceAudioText: "Global Accord Signed for Autonomous Asteroid Mining and Space Property Rights.",
    isBookmarked: false
  },
  {
    id: "story-005",
    title: "Neuromorphic Chip 'Synapse-V' Replicates Mammalian Brain Efficiency at 5W",
    category: "Hardware & AI",
    readTime: "1 min read",
    publishedAt: "5 hours ago",
    source: "IEEE Spectrum",
    originalUrl: "https://spectrum.ieee.org/neuromorphic-synapse-v-chip-5w",
    summary60w: [
      "TSMC and Stanford unveiled a 3D stacked memristive chip mimicking 10 billion biological synapses.",
      "Operating on a microscopic 5-Watt power envelope, it executes 100 trillion spiking neural operations per second.",
      "The chip eliminates the von Neumann memory bottleneck by performing compute inside analog memory cells.",
      "Enables complex real-time LLM inference directly on small battery-powered mobile devices and drones."
    ],
    summaryEli5: [
      "Engineers made a computer chip that acts just like a human brain!"
    ],
    summaryDeepDive: "The Synapse-V neuromorphic processor leverages phase-change memory crossbar arrays to process event-driven spiking signals.",
    biasRating: "Neutral",
    biasScore: 91,
    perspectives: [
      { perspective: "Computer Architects", sentiment: "Hailed as the most significant hardware paradigm shift since the transistor." }
    ],
    smartGlossary: [
      {
        term: "neuromorphic",
        definition: "Computer architecture designed to physically emulate the biological neural structure of the human brain."
      }
    ],
    voiceAudioText: "Neuromorphic Chip Synapse-V Replicates Mammalian Brain Efficiency at 5 Watts.",
    isBookmarked: false
  }
];
