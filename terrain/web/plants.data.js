/* Field guide data — loaded by <script src> so it works from file:// (no fetch/CORS).
   Pure JSON inside; edit/extend and bump dataVersion. Schema in FIELD_GUIDE_DATA.schema. */
window.FIELD_GUIDE_DATA = {
 "dataVersion": "1.0.0",
 "updated": "2026-11-21",
 "region": "Western Oregon & Washington lowlands and Cascade foothills",
 "schema": {
  "species": {
   "id": "unique slug",
   "name": "common name",
   "aliases": "[alternate names for search]",
   "latin": "scientific name",
   "family": "",
   "category": "toxic | invasive | native | other",
   "elevation": "{minFt,maxFt,note}",
   "habitat": "",
   "toxicity": "toxicity notes (string)",
   "idFeatures": "[]",
   "lookalikes": "[species ids]",
   "status": "legal/listing status",
   "calendar": "[{type: bloom|fruit|seed|removal|alert|fieldwork, months:[1-12]}]",
   "management": "optional {methods[],timing,waterways}",
   "confidence": "documented | inferred | uncertain",
   "sources": "[source ids]",
   "svgKey": "optional key into the silhouette library",
   "flags": "[fact-check claim ids]",
   "note": "optional"
  }
 },
 "categories": {
  "toxic": {
   "label": "Toxic",
   "color": "#9b3b33"
  },
  "invasive": {
   "label": "Invasive",
   "color": "#a8765c"
  },
  "native": {
   "label": "Native",
   "color": "#9aa4ad"
  },
  "other": {
   "label": "Lookalike / other",
   "color": "#8b8f7a"
  }
 },
 "species": [
  {
   "id": "poison-hemlock",
   "name": "Poison hemlock",
   "aliases": [
    "Conium",
    "hemlock"
   ],
   "latin": "Conium maculatum",
   "family": "Apiaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; lowland to mid-elevation disturbed ground across the PNW."
   },
   "habitat": "Roadsides, ditches, fence lines, stream banks, field edges, disturbed and moist ground. Biennial: ferny rosette in year one, 3–10 ft flowering stalk in year two.",
   "toxicity": "All parts toxic to people, pets and livestock: piperidine alkaloids (coniine, γ-coniceine and relatives). Toxin acts on nicotinic acetylcholine receptors — early stimulation, then a depolarizing neuromuscular block that can stop breathing. No antidote; treatment is supportive (airway and ventilation). Dried/dead stems remain toxic for up to about 3 years. Do not burn, chip into mulch, or use hollow stems as whistles or straws. Wear gloves; some people get skin irritation.",
   "idFeatures": [
    "Smooth, hairless stem with purple/maroon blotches or streaks",
    "Musty, 'mousy' smell when leaves are crushed",
    "Finely divided, glossy, fern-like leaves",
    "Flat-topped white umbels with no dark central floret",
    "Only small inconspicuous bracts — no large forked bracts under the umbel",
    "Blooms late spring to early summer (often May–July), earlier than Queen Anne's lace"
   ],
   "lookalikes": [
    "queen-annes-lace",
    "water-hemlock",
    "cow-parsnip"
   ],
   "status": "Oregon State Weed Board noxious weed, List B.",
   "calendar": [
    {
     "type": "alert",
     "months": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12
     ]
    },
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    },
    {
     "type": "seed",
     "months": [
      7,
      8,
      9
     ]
    },
    {
     "type": "removal",
     "months": [
      2,
      3,
      4,
      5
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "osu-em9911",
    "umn-hemlock",
    "oda-list",
    "nwcb-hemlock"
   ],
   "svgKey": "umbel-hemlock",
   "flags": [
    "c-hemlock-bloom",
    "c-hemlock-bracts",
    "c-dead-canes",
    "c-coniine-recovery"
   ],
   "management": {
    "methods": [
     "Dig rosettes and young plants with gloves, taking the taproot, in late winter–spring before stalks bolt.",
     "Cut flowering stalks before seed set if digging is not possible; bag seed heads.",
     "Bag and landfill plant material; never compost, chip, burn or feed it to animals.",
     "Re-check the same spots for several years (seed bank)."
    ],
    "timing": "Feb–May for rosettes; before seed in summer.",
    "waterways": "Near streams use mechanical removal; any herbicide near water must be labeled for aquatic use — consult your SWCD."
   }
  },
  {
   "id": "water-hemlock",
   "name": "Western water hemlock",
   "aliases": [
    "Cicuta",
    "cowbane"
   ],
   "latin": "Cicuta douglasii",
   "family": "Apiaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 8000,
    "note": "Approximate; wet sites from sea level to montane."
   },
   "habitat": "Wet ground: stream and pond margins, marshes, wet ditches and pastures. Native.",
   "toxicity": "Considered among the most toxic plants in North America. Cicutoxin (a C17 polyacetylene) is a GABA-A antagonist that causes violent seizures, often within 15–60 minutes; deaths have followed a single bite of root. Highest concentration in the tuberous, chambered root base, especially in spring.",
   "idFeatures": [
    "Chambered (hollow cross-walls) swollen stem base and root when split lengthwise",
    "Leaf veins tend to run to the notches between teeth rather than the tips",
    "Umbels white, somewhat rounded",
    "Stems smooth, may be purple-striped (no blotches as in poison hemlock)"
   ],
   "lookalikes": [
    "poison-hemlock",
    "cow-parsnip",
    "queen-annes-lace"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      3,
      4,
      5,
      6,
      7,
      8
     ]
    },
    {
     "type": "bloom",
     "months": [
      6,
      7,
      8
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "osu-em9911"
   ],
   "svgKey": "umbel-water",
   "note": "Added for safety: not in the original brief, but it shares wet ground with poison hemlock and is more acutely dangerous.",
   "flags": []
  },
  {
   "id": "datura",
   "name": "Jimsonweed / datura",
   "aliases": [
    "thorn apple",
    "jimson weed",
    "Datura stramonium"
   ],
   "latin": "Datura stramonium (and other Datura spp.)",
   "family": "Solanaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 4000,
    "note": "Approximate; uncommon west of the Cascades — garden escapes, compost, disturbed soil."
   },
   "habitat": "Disturbed soil, barnyards, gardens, compost piles; more common east of the Cascades.",
   "toxicity": "Tropane alkaloids (atropine, scopolamine, hyoscyamine) cause anticholinergic poisoning: dilated pupils, blurred vision, dry hot flushed skin, fast heart rate, urinary retention, agitation and hours-to-days of delirium with hallucinations. Seeds are especially dangerous; potency varies wildly between plants. Hospital care may include physostigmine under specialist guidance.",
   "idFeatures": [
    "Large white to violet trumpet flowers (2–4 in)",
    "Spiny walnut-sized seed capsule splitting into four",
    "Coarse, unevenly toothed leaves with a rank smell"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      7,
      8,
      9,
      10
     ]
    },
    {
     "type": "bloom",
     "months": [
      7,
      8,
      9
     ]
    },
    {
     "type": "seed",
     "months": [
      8,
      9,
      10
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "ncpc-general"
   ],
   "svgKey": "trumpet",
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "foxglove",
   "name": "Foxglove",
   "aliases": [
    "Digitalis"
   ],
   "latin": "Digitalis purpurea",
   "family": "Plantaginaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; very common in western Oregon/Washington clearings and logged ground."
   },
   "habitat": "Clear-cuts, forest edges, road cuts, gardens. Naturalized biennial (non-native).",
   "toxicity": "Cardiac glycosides (digitoxin and related) — nausea, vomiting, slow or irregular heartbeat, high potassium, visual color changes (yellow-green halos). Potentially fatal. Hospitals can give digoxin-specific antibody fragments (Fab). Year-one rosettes have been mistaken for comfrey or borage leaves.",
   "idFeatures": [
    "Tall one-sided spike of purple, pink or white tubular bells with spotted throats",
    "Soft, downy, gray-green lance-shaped leaves in a basal rosette",
    "Year one: rosette only"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      3,
      4,
      5,
      6,
      7
     ]
    },
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "ncpc-general"
   ],
   "svgKey": "spike",
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "rhododendron",
   "name": "Rhododendrons & azaleas",
   "aliases": [
    "Pacific rhododendron",
    "azalea",
    "grayanotoxin",
    "mad honey"
   ],
   "latin": "Rhododendron spp. (incl. native R. macrophyllum)",
   "family": "Ericaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 4000,
    "note": "Approximate; native Pacific rhododendron in conifer understory; many garden species."
   },
   "habitat": "Conifer forest understory (native), gardens and landscaping.",
   "toxicity": "Grayanotoxins hold sodium channels open: drooling, vomiting, dizziness, low blood pressure, slow heart rate. Human cases mostly come from 'mad honey' made from rhododendron nectar; livestock and pets are poisoned by chewing leaves. Usually survivable with supportive care, but can be severe.",
   "idFeatures": [
    "Leathery evergreen leaves clustered at branch tips",
    "Large trusses of pink, purple or white flowers in spring"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      4,
      5,
      6
     ]
    },
    {
     "type": "bloom",
     "months": [
      4,
      5,
      6
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "ncpc-general"
   ],
   "svgKey": "truss",
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "death-camas",
   "name": "Death camas",
   "aliases": [
    "meadow death camas",
    "Zigadenus",
    "Toxicoscordion"
   ],
   "latin": "Toxicoscordion venenosum (formerly Zigadenus venenosus)",
   "family": "Melanthiaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 7000,
    "note": "Approximate; meadows and grassy slopes."
   },
   "habitat": "Moist to dry meadows and rocky slopes, often growing among edible blue camas.",
   "toxicity": "Steroidal alkaloids (zygacine and relatives): vomiting, low blood pressure, slow heart, weakness; can be fatal. Bulbs look like blue camas bulbs, which is the classic confusion — they cannot be told apart reliably once flowers are gone.",
   "idFeatures": [
    "Cream-white star flowers in a compact raceme",
    "Grass-like V-shaped leaves",
    "Onion-like bulb without onion smell"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      3,
      4,
      5,
      6
     ]
    },
    {
     "type": "bloom",
     "months": [
      4,
      5,
      6
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "ncpc-general"
   ],
   "svgKey": "lily",
   "note": "Same family (Melanthiaceae) as false hellebore (Veratrum); both formerly placed in Liliaceae.",
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "fly-agaric",
   "name": "Fly agaric",
   "aliases": [
    "Amanita muscaria",
    "fly amanita"
   ],
   "latin": "Amanita muscaria (PNW: var. flavivolvata)",
   "family": "Amanitaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 6000,
    "note": "Approximate."
   },
   "habitat": "Mycorrhizal with conifers (including Douglas fir) and birch; lawns near those trees. Mostly autumn in western OR/WA.",
   "toxicity": "Ibotenic acid and muscimol (GABA-acting): confusion, agitation, hallucinations, alternating with drowsiness or coma; vomiting in some. Onset usually within 30 min–2 h; most cases resolve within 24 h, but intubation and rare deaths are reported.",
   "idFeatures": [
    "Red to orange-red cap with white to yellowish warts (warts can wash off)",
    "White gills, white spore print",
    "Ring on stem; bulbous base with concentric rings of volval remnants"
   ],
   "lookalikes": [
    "western-panther"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      9,
      10,
      11,
      12
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "moss2019",
    "meisel2022"
   ],
   "svgKey": "amanita-red",
   "flags": [
    "c-fly-agaric-df"
   ]
  },
  {
   "id": "western-panther",
   "name": "Western panther amanita",
   "aliases": [
    "panther cap",
    "Amanita pantherinoides",
    "Amanita pantherina"
   ],
   "latin": "Amanita pantherinoides (western N. American panther group)",
   "family": "Amanitaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 6000,
    "note": "Approximate."
   },
   "habitat": "Conifer and mixed forest; spring and autumn fruitings reported in the PNW.",
   "toxicity": "Same toxins as fly agaric but usually a higher muscimol share — more sedation/coma. In an Oregon Poison Center series (2002–2016; 10 panther vs 23 fly-agaric cases) panther ingestions had more GI symptoms (80% vs 35%), CNS depression (70% vs 35%) and CNS excitation (70% vs 35%). Small series; treat as indicative.",
   "idFeatures": [
    "Brown to tan cap with white warts",
    "White gills, white spore print",
    "Collar-like 'gutter' rim on the bulb at the stem base"
   ],
   "lookalikes": [
    "fly-agaric"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      4,
      5,
      6,
      9,
      10,
      11
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "moss2019",
    "vendramin2014"
   ],
   "svgKey": "amanita-brown",
   "flags": [
    "c-panther-pct"
   ]
  },
  {
   "id": "smiths-amanita",
   "name": "Smith's amanita",
   "aliases": [
    "Amanita smithiana",
    "fake matsutake"
   ],
   "latin": "Amanita smithiana",
   "family": "Amanitaceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate."
   },
   "habitat": "Conifer and mixed forest in the PNW, fruiting in autumn — the same season and habitat as matsutake.",
   "toxicity": "Causes delayed acute kidney injury (allenic norleucine and related compounds suspected). GI symptoms typically start within about 2–12 h; in a Pacific Northwest case series, kidney failure presented 4–6 days after eating; dialysis is often required. Mistaken for matsutake (Tricholoma murrillianum).",
   "idFeatures": [
    "White, shaggy-scaly mushroom with a rooting stem base",
    "Lacks matsutake's spicy 'cinnamon-sock' smell and firm sheathing veil",
    "Fragile white ring/veil remnants"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      9,
      10,
      11
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "warden1998",
    "mykoweb"
   ],
   "svgKey": "amanita-white",
   "flags": [
    "c-smithiana"
   ],
   "lookalikes": []
  },
  {
   "id": "galerina",
   "name": "Deadly galerina",
   "aliases": [
    "Galerina marginata",
    "autumn skullcap",
    "funeral bell"
   ],
   "latin": "Galerina marginata",
   "family": "Hymenogastraceae",
   "category": "toxic",
   "elevation": {
    "minFt": 0,
    "maxFt": 7000,
    "note": "Approximate."
   },
   "habitat": "On rotting conifer and hardwood logs, stumps and buried wood, including wood chips. Fruits in cool wet seasons (autumn, also spring).",
   "toxicity": "Contains amatoxins (same as death cap). Classic three phases: symptom-free delay, then severe vomiting and watery diarrhea typically 6–24 h after eating, a misleading lull, then liver (and kidney) failure over roughly days 2–4. Life-threatening; may need transplant. Confused with Psilocybe species and with edible wood-loving mushrooms (honey mushrooms, Kuehneromyces).",
   "idFeatures": [
    "Small brown cap, hygrophanous (fades as it dries)",
    "Rusty-brown spore print",
    "Thin ring or ring zone on stem",
    "Grows on wood, often in clusters"
   ],
   "calendar": [
    {
     "type": "alert",
     "months": [
      3,
      4,
      5,
      9,
      10,
      11,
      12
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "mykoweb",
    "ncpc-general"
   ],
   "svgKey": "galerina",
   "flags": [
    "c-galerina"
   ],
   "lookalikes": []
  },
  {
   "id": "queen-annes-lace",
   "name": "Queen Anne's lace",
   "aliases": [
    "wild carrot",
    "Daucus"
   ],
   "latin": "Daucus carota",
   "family": "Apiaceae",
   "category": "other",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; fields, roadsides."
   },
   "habitat": "Fields, roadsides, dry disturbed ground. Non-native, very common.",
   "toxicity": "Low toxicity but listed here because it is the most common poison-hemlock confusion. Handling can cause skin sensitivity in some people. Do not use this guide to separate them for eating.",
   "idFeatures": [
    "Hairy stem, green with no purple blotches",
    "Carrot smell when root/leaves crushed",
    "Often a single dark purple floret at the umbel center (not always present)",
    "Conspicuous 3-forked/pinnate bracts under the umbel",
    "Umbel curls into a 'bird's nest' as it seeds",
    "Blooms summer into fall (June–September), later than poison hemlock"
   ],
   "lookalikes": [
    "poison-hemlock"
   ],
   "calendar": [
    {
     "type": "bloom",
     "months": [
      6,
      7,
      8,
      9
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "osu-em9911",
    "umn-hemlock"
   ],
   "svgKey": "umbel-qal",
   "flags": []
  },
  {
   "id": "cow-parsnip",
   "name": "Cow parsnip",
   "aliases": [
    "Heracleum maximum"
   ],
   "latin": "Heracleum maximum",
   "family": "Apiaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 9000,
    "note": "Approximate; moist openings and streambanks."
   },
   "habitat": "Moist meadows, stream banks, forest openings. Native.",
   "toxicity": "Sap contains furanocoumarins: skin contact plus sunlight can cause blistering burns (phytophotodermatitis). Large size invites confusion with non-native giant hogweed (worse) and with poison/water hemlock at the seedling stage.",
   "idFeatures": [
    "Very large maple-like, three-parted hairy leaves",
    "Broad flat white umbels up to 1 ft across",
    "Hairy, hollow stems"
   ],
   "lookalikes": [
    "poison-hemlock",
    "water-hemlock"
   ],
   "calendar": [
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "osu-em9911"
   ],
   "svgKey": "umbel-big",
   "flags": []
  },
  {
   "id": "douglas-fir",
   "name": "Douglas fir",
   "latin": "Pseudotsuga menziesii",
   "family": "Pinaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Dominant conifer of western OR/WA lowland and foothill forests.",
   "toxicity": "Not a significant poisoning concern. Fly agaric often fruits under it in autumn.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      4,
      5
     ]
    },
    {
     "type": "seed",
     "months": [
      9,
      10
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "conifer",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "western-redcedar",
   "name": "Western red cedar",
   "latin": "Thuja plicata",
   "family": "Cupressaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Moist, shaded slopes and stream bottoms.",
   "toxicity": "Wood dust is a recognized occupational asthma cause (plicatic acid) — relevant when milling or sanding. Foliage oil contains thujone.",
   "calendar": [
    {
     "type": "seed",
     "months": [
      9,
      10
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "cedar",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "sword-fern",
   "name": "Western sword fern",
   "latin": "Polystichum munitum",
   "family": "Dryopteridaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Forest understory; good indicator of moist, intact soils.",
   "toxicity": "Not a significant poisoning concern.",
   "calendar": [],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "fern",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "salal",
   "name": "Salal",
   "latin": "Gaultheria shallon",
   "family": "Ericaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Conifer understory, dense evergreen shrub layer.",
   "toxicity": "Not a significant poisoning concern.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    },
    {
     "type": "fruit",
     "months": [
      8,
      9
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "shrub",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "oregon-grape",
   "name": "Oregon grape",
   "latin": "Berberis (Mahonia) aquifolium / B. nervosa",
   "family": "Berberidaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Forest understory (low/dull) and open edges (tall).",
   "toxicity": "Roots and bark contain berberine; not a significant casual-contact concern. Holly-like leaves are sometimes confused with English holly seedlings.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      3,
      4,
      5
     ]
    },
    {
     "type": "fruit",
     "months": [
      7,
      8,
      9
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "shrub",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "thimbleberry",
   "name": "Thimbleberry",
   "latin": "Rubus parviflorus",
   "family": "Rosaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Openings, edges, road cuts; thornless.",
   "toxicity": "Not a significant poisoning concern. Thornless, broad maple-like leaves separate it from invasive brambles.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    },
    {
     "type": "fruit",
     "months": [
      7,
      8
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "shrub",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "trailing-blackberry",
   "name": "Trailing blackberry (native)",
   "latin": "Rubus ursinus",
   "family": "Rosaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Open woods and clearings; thin trailing stems.",
   "toxicity": "Not a significant poisoning concern. Protect it when clearing Himalayan blackberry.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      4,
      5,
      6
     ]
    },
    {
     "type": "fruit",
     "months": [
      6,
      7
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "bramble",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "indian-plum",
   "name": "Indian plum",
   "latin": "Oemleria cerasiformis",
   "family": "Rosaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Moist woods and edges; first native shrub to leaf out and flower (Feb–Mar).",
   "toxicity": "Not a significant poisoning concern.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      2,
      3
     ]
    },
    {
     "type": "fruit",
     "months": [
      5,
      6
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "shrub",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "red-elderberry",
   "name": "Red elderberry",
   "latin": "Sambucus racemosa",
   "family": "Adoxaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Moist edges, clearings, stream banks.",
   "toxicity": "Stems, leaves, roots and unripe/raw fruit contain cyanogenic glycosides and can cause vomiting.",
   "calendar": [
    {
     "type": "bloom",
     "months": [
      4,
      5
     ]
    },
    {
     "type": "fruit",
     "months": [
      6,
      7,
      8
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "shrub",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "pacific-yew",
   "name": "Pacific yew",
   "latin": "Taxus brevifolia",
   "family": "Taxaceae",
   "category": "native",
   "elevation": {
    "minFt": 0,
    "maxFt": 5000,
    "note": "Approximate; common in western OR/WA lowlands and foothills."
   },
   "habitat": "Shaded understory, often near streams.",
   "toxicity": "Needles, bark and seeds contain taxine alkaloids — cardiotoxic; deadly to livestock and dogs. (Source of paclitaxel.)",
   "calendar": [],
   "confidence": "documented",
   "sources": [
    "usda-plants"
   ],
   "svgKey": "conifer",
   "aliases": [],
   "lookalikes": [],
   "flags": [],
   "idFeatures": []
  },
  {
   "id": "himalayan-blackberry",
   "name": "Himalayan blackberry",
   "aliases": [
    "Armenian blackberry",
    "Rubus armeniacus",
    "Rubus discolor",
    "Rubus procerus"
   ],
   "latin": "Rubus armeniacus",
   "family": "Rosaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 3500,
    "note": "Approximate; lowlands and foothills, sunny disturbed ground."
   },
   "habitat": "Open and edge habitat, riparian zones, fence lines, clearings.",
   "toxicity": "Not toxic; hazard is thorny canes (eye and skin injuries). Thickets can hide poison hemlock.",
   "idFeatures": [
    "Thick, angled canes with large hooked prickles, arching then rooting at tips",
    "Usually five leaflets on first-year canes, whitish underneath",
    "'Armenian blackberry' is the same species — the official name is Rubus armeniacus",
    "Distinguish from native trailing blackberry (thin trailing stems, 3 leaflets, whitish bloom) and cutleaf blackberry (deeply incised leaflets)"
   ],
   "lookalikes": [
    "trailing-blackberry"
   ],
   "status": "Oregon State Weed Board noxious weed, List B.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      11,
      12,
      1,
      2
     ]
    },
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    },
    {
     "type": "fruit",
     "months": [
      7,
      8,
      9
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list",
    "wsu-blackberry"
   ],
   "svgKey": "bramble",
   "flags": [
    "c-armenian"
   ],
   "management": {
    "methods": [
     "Perimeter first: hold the advancing edge and protect high-value natives before attacking the core.",
     "Late winter (before bird nesting): cut canes to 6–12 in with loppers/brush cutter; gloves, eye protection.",
     "Dig out root crowns (the woody knob) — cutting alone just resprouts.",
     "Re-cut or pull resprouts several times per year for 2–3 years.",
     "Replant natives quickly and mulch; shade suppresses regrowth."
    ],
    "timing": "Cut Nov–Feb; dig crowns when soil is moist (fall–spring); follow-up spring–summer.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   }
  },
  {
   "id": "english-ivy",
   "name": "English ivy",
   "aliases": [
    "Atlantic ivy",
    "Hedera"
   ],
   "latin": "Hedera helix / H. hibernica",
   "family": "Araliaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 3000,
    "note": "Approximate; forests near development."
   },
   "habitat": "Forest floor carpets and tree climbing; spreads from yards into woods.",
   "toxicity": "Leaves and berries contain saponins (GI upset if eaten); sap can cause contact dermatitis.",
   "idFeatures": [
    "Evergreen 3–5-lobed leaves on juvenile vines; unlobed leaves on mature flowering stems",
    "Climbs by aerial rootlets",
    "Black berries in late winter from mature (adult) growth"
   ],
   "status": "Oregon State Weed Board noxious weed, List B (English and Atlantic ivy).",
   "calendar": [
    {
     "type": "removal",
     "months": [
      10,
      11,
      12,
      1,
      2,
      3,
      4
     ]
    },
    {
     "type": "bloom",
     "months": [
      9,
      10
     ]
    },
    {
     "type": "fruit",
     "months": [
      12,
      1,
      2,
      3
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list",
    "noivy"
   ],
   "svgKey": "ivy",
   "management": {
    "methods": [
     "Trees first ('survival ring'): cut every vine around the trunk at shoulder height and at ground level.",
     "Clear a 6-ft-radius ivy-free ring around each tree (the 'lifesaver'); leave cut upper vines to die in place.",
     "Then clear ground ivy by the 'log roll': cut a line across the mat and roll it downhill; work from the cleared edge outward.",
     "Bag fruiting stems; pile the rest on tarps/off soil so it can't re-root.",
     "Revisit 2–3 times per year."
    ],
    "timing": "Any time; easiest when soil is moist (Oct–Apr). Cut fruiting vines before berries ripen.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "scotch-broom",
   "name": "Scotch broom",
   "aliases": [
    "Cytisus",
    "broom"
   ],
   "latin": "Cytisus scoparius",
   "family": "Fabaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 4000,
    "note": "Approximate; sunny, dry disturbed ground."
   },
   "habitat": "Clear-cuts, road edges, pastures, powerline corridors.",
   "toxicity": "Contains quinolizidine alkaloids (sparteine); mildly toxic to livestock. Highly flammable stands.",
   "idFeatures": [
    "Green, angled, nearly leafless stems",
    "Bright yellow pea flowers in spring",
    "Black pods that snap open in summer"
   ],
   "status": "Oregon State Weed Board noxious weed, List B.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      7,
      8,
      9,
      10,
      11,
      12,
      1,
      2,
      3,
      4
     ]
    },
    {
     "type": "bloom",
     "months": [
      4,
      5,
      6
     ]
    },
    {
     "type": "seed",
     "months": [
      7,
      8
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list"
   ],
   "svgKey": "broom",
   "management": {
    "methods": [
     "Pull seedlings and small plants when soil is moist.",
     "Cut larger plants at or just below ground level during summer drought (less resprouting).",
     "Minimize soil disturbance — it wakes the long-lived seed bank.",
     "Monitor for many years; seed bank can persist for decades."
    ],
    "timing": "Pull Oct–Apr; cut large plants Jul–Sep.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "english-holly",
   "name": "English holly",
   "aliases": [
    "Ilex"
   ],
   "latin": "Ilex aquifolium",
   "family": "Aquifoliaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 2500,
    "note": "Approximate; shaded forest."
   },
   "habitat": "Shade-tolerant; spreads into conifer forest via bird-dispersed berries.",
   "toxicity": "Berries cause vomiting and diarrhea if eaten (saponins); concern mainly for children and pets.",
   "idFeatures": [
    "Glossy, spiny evergreen leaves",
    "Red berries on female plants in winter",
    "Seedlings look like Oregon grape — check for a single leaf (holly) vs compound leaves (Oregon grape)"
   ],
   "status": "Not on the Oregon state noxious weed list; treated as invasive by regional land managers.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      10,
      11,
      12,
      1,
      2,
      3
     ]
    },
    {
     "type": "fruit",
     "months": [
      11,
      12,
      1,
      2
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list"
   ],
   "svgKey": "holly",
   "management": {
    "methods": [
     "Pull seedlings and dig small plants with the root.",
     "Larger trees resprout when cut; cut stumps need follow-up or professional treatment.",
     "Remove berry-bearing females first to cut seed supply."
    ],
    "timing": "Oct–Mar.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "knotweed",
   "name": "Knotweeds",
   "aliases": [
    "Japanese knotweed",
    "giant knotweed",
    "Bohemian knotweed",
    "Fallopia",
    "Reynoutria",
    "Polygonum"
   ],
   "latin": "Reynoutria (Fallopia) japonica, R. sachalinensis, R. × bohemica",
   "family": "Polygonaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 3000,
    "note": "Approximate; especially along rivers and roads."
   },
   "habitat": "Stream banks, gravel bars, roadsides, old homesites.",
   "toxicity": "Not a significant poisoning concern.",
   "idFeatures": [
    "Hollow, bamboo-like jointed stems, often red-speckled",
    "Broad heart- or spade-shaped leaves in a zigzag",
    "Sprays of tiny cream flowers late summer"
   ],
   "status": "Oregon State Weed Board noxious weeds, List B.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      8,
      9,
      10
     ]
    },
    {
     "type": "bloom",
     "months": [
      8,
      9
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list",
    "kc-knotweed"
   ],
   "svgKey": "knotweed",
   "flags": [
    "c-knotweed"
   ],
   "management": {
    "methods": [
     "Do not dig, mow or chip casually — tiny rhizome or stem fragments regrow and travel downstream.",
     "Rhizomes are commonly cited to spread ~7 m (≈23 ft) sideways and ~3 m deep.",
     "Late-season (after flowering) treatment by a licensed applicator is the usual effective control.",
     "Report riverside patches to your SWCD or the Oregon Invasive Species Hotline."
    ],
    "timing": "Aug–Oct.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": []
  },
  {
   "id": "clematis-vitalba",
   "name": "Old man's beard",
   "aliases": [
    "Clematis vitalba",
    "traveler's joy"
   ],
   "latin": "Clematis vitalba",
   "family": "Ranunculaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 2500,
    "note": "Approximate."
   },
   "habitat": "Forest edges, riparian areas, hedgerows; smothers trees.",
   "toxicity": "Sap contains protoanemonin — skin irritation and blistering; toxic if eaten.",
   "idFeatures": [
    "Woody climbing vine with opposite, compound leaves (usually 5 leaflets)",
    "Creamy fragrant flowers in summer",
    "Fluffy white seed plumes persisting through winter"
   ],
   "status": "Oregon State Weed Board noxious weed, List B.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      10,
      11,
      12,
      1,
      2,
      3
     ]
    },
    {
     "type": "bloom",
     "months": [
      7,
      8,
      9
     ]
    },
    {
     "type": "seed",
     "months": [
      10,
      11,
      12,
      1
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list"
   ],
   "svgKey": "vine",
   "management": {
    "methods": [
     "Cut every vine at ground level and again at shoulder height (like ivy); leave the upper vine to die.",
     "Dig out root crowns of cut stems.",
     "Pull seedlings; wear gloves (skin irritant)."
    ],
    "timing": "Oct–Mar.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": [],
   "flags": []
  },
  {
   "id": "reed-canarygrass",
   "name": "Reed canarygrass",
   "aliases": [
    "Phalaris",
    "ribbongrass"
   ],
   "latin": "Phalaris arundinacea",
   "family": "Poaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 4000,
    "note": "Approximate; wet ground."
   },
   "habitat": "Wetlands, ditches, stream banks; forms dense mats that block native recruitment.",
   "toxicity": "Contains variable indole alkaloids (notably gramine and hordenine; some strains contain tryptamines). Gramine-rich forage can harm livestock. Not a plant to experiment with.",
   "idFeatures": [
    "3–6 ft tall grass with wide flat leaves held at an angle",
    "Papery ligule; dense panicle that opens then closes",
    "Spreads by thick rhizomes into solid stands"
   ],
   "status": "Only the ornamental ribbongrass (var. picta) is Oregon-listed (List B, T); wild-type reed canarygrass is not on the state list. Washington: Class C.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      5,
      6,
      11,
      12,
      1,
      2
     ]
    },
    {
     "type": "bloom",
     "months": [
      5,
      6,
      7
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list",
    "oda-ribbongrass",
    "nnrg-weeds"
   ],
   "svgKey": "grass",
   "flags": [
    "c-rcg-list",
    "c-rcg-alk"
   ],
   "management": {
    "methods": [
     "Mow or cut repeatedly before seed (May–June), then cover or shade.",
     "Shade is the long-term fix: plant dense willow and red-osier dogwood live stakes in the dormant season.",
     "Tarping/smothering for one or more seasons on small patches.",
     "Expect multi-year effort."
    ],
    "timing": "Cut May–Jun; plant live stakes Nov–Feb.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": []
  },
  {
   "id": "garlic-mustard",
   "name": "Garlic mustard",
   "aliases": [
    "Alliaria petiolata",
    "Alliaria"
   ],
   "latin": "Alliaria petiolata",
   "family": "Brassicaceae",
   "category": "invasive",
   "elevation": {
    "minFt": 0,
    "maxFt": 3000,
    "note": "Approximate; shaded forest edges and floodplains."
   },
   "habitat": "Shaded forest floor, trails, floodplain woods; invades undisturbed forest understory.",
   "toxicity": "Not a significant poisoning concern to people. Chemically aggressive toward soil fungi — see deep dive.",
   "idFeatures": [
    "Biennial: year-one kidney-shaped scalloped rosette; year-two 1–3 ft stalk",
    "Garlic smell when leaves are crushed",
    "Small white four-petaled flowers in spring",
    "Thin upright seed pods (siliques)"
   ],
   "status": "Oregon State Weed Board noxious weed, List B with T (priority) designation.",
   "calendar": [
    {
     "type": "removal",
     "months": [
      3,
      4,
      5
     ]
    },
    {
     "type": "bloom",
     "months": [
      4,
      5,
      6
     ]
    },
    {
     "type": "seed",
     "months": [
      6,
      7,
      8
     ]
    },
    {
     "type": "fieldwork",
     "months": [
      11,
      12,
      1,
      2,
      3
     ]
    }
   ],
   "confidence": "documented",
   "sources": [
    "oda-list",
    "stinson2006",
    "callaway2008",
    "vaicekonyte2012",
    "anthony2019"
   ],
   "svgKey": "mustard",
   "flags": [
    "c-stinson-europe",
    "c-aitc",
    "c-seedbank",
    "c-45day"
   ],
   "management": {
    "methods": [
     "Perimeter first: clear outlying and trail-side patches before the main infestation.",
     "Hand-pull before seed set, getting the root crown; easiest in moist soil.",
     "Bag flowering or seeding plants — cut stems can still ripen seed. Landfill, don't compost.",
     "Return several times a season; monitor at least 5 years (seed bank).",
     "Clean boots and gear; seeds travel on mud along trails."
    ],
    "timing": "Pull Mar–May; scout rosettes Nov–Mar.",
    "waterways": "Near streams, ponds and wet ground: mechanical removal first. Any herbicide within riparian areas must be labeled for aquatic use and may require a licensed applicator — talk to your Soil & Water Conservation District first."
   },
   "lookalikes": []
  }
 ],
 "comparisons": [
  {
   "id": "hemlock-vs-qal",
   "title": "Poison hemlock vs Queen Anne's lace",
   "danger": "poison-hemlock",
   "safe": "queen-annes-lace",
   "rule": "If any one feature points to hemlock, treat the plant as hemlock. Leave both alone.",
   "features": [
    {
     "n": 1,
     "feature": "Stem surface",
     "danger": "Smooth and hairless",
     "safe": "Hairy, bristly to the touch"
    },
    {
     "n": 2,
     "feature": "Stem color",
     "danger": "Purple/maroon blotches or streaks",
     "safe": "Plain green"
    },
    {
     "n": 3,
     "feature": "Crushed-leaf smell",
     "danger": "Musty, 'mousy' (do not sniff repeatedly; wash hands)",
     "safe": "Carrot-like"
    },
    {
     "n": 4,
     "feature": "Umbel center",
     "danger": "No dark central floret",
     "safe": "Often a single dark purple floret (not always)"
    },
    {
     "n": 5,
     "feature": "Bracts under umbel",
     "danger": "Small, inconspicuous",
     "safe": "Large, conspicuous 3-forked bracts"
    },
    {
     "n": 6,
     "feature": "Bloom time (W. Oregon)",
     "danger": "Earlier: late spring–early summer",
     "safe": "Later: summer into fall"
    },
    {
     "n": 7,
     "feature": "Size",
     "danger": "Often 3–10 ft, many-branched",
     "safe": "Usually 1–4 ft"
    }
   ],
   "sources": [
    "osu-em9911",
    "umn-hemlock"
   ],
   "confidence": "documented"
  },
  {
   "id": "panther-vs-flyagaric",
   "title": "Western panther vs fly agaric",
   "danger": "western-panther",
   "safe": "fly-agaric",
   "rule": "Both are toxic; this comparison is about recognizing amanitas, not choosing one.",
   "features": [
    {
     "n": 1,
     "feature": "Cap color",
     "danger": "Brown/tan with white warts",
     "safe": "Red-orange with white/yellow warts"
    },
    {
     "n": 2,
     "feature": "Stem base",
     "danger": "Bulb with a collar-like rolled rim",
     "safe": "Bulb with concentric rings of scales"
    },
    {
     "n": 3,
     "feature": "Typical syndrome",
     "danger": "More sedation/coma, more GI symptoms",
     "safe": "More confusion/agitation"
    }
   ],
   "sources": [
    "moss2019",
    "vendramin2014"
   ],
   "confidence": "documented"
  },
  {
   "id": "smithiana-vs-matsutake",
   "title": "Smith's amanita vs matsutake",
   "danger": "smiths-amanita",
   "safe": null,
   "safeLabel": "Matsutake (Tricholoma murrillianum)",
   "rule": "Kidney failure can appear days after eating — any white autumn mushroom collected as 'matsutake' needs expert confirmation.",
   "features": [
    {
     "n": 1,
     "feature": "Smell",
     "danger": "Mild/indistinct",
     "safe": "Strong spicy 'cinnamon-sock'"
    },
    {
     "n": 2,
     "feature": "Flesh",
     "danger": "Softer, fragile",
     "safe": "Very firm, dense"
    },
    {
     "n": 3,
     "feature": "Stem base",
     "danger": "Rooting, scaly, amanita-type remnants",
     "safe": "Tapered, sheathed by a cottony veil"
    }
   ],
   "sources": [
    "warden1998",
    "mykoweb"
   ],
   "confidence": "documented"
  },
  {
   "id": "galerina-vs-psilocybe",
   "title": "Deadly galerina vs Psilocybe and wood-lovers",
   "danger": "galerina",
   "safe": null,
   "safeLabel": "Psilocybe spp. / honey mushrooms",
   "rule": "Small brown mushrooms on wood cannot be safely sorted by sight. Galerina contains the same toxins as the death cap.",
   "features": [
    {
     "n": 1,
     "feature": "Spore print",
     "danger": "Rusty brown",
     "safe": "Psilocybe: purple-brown to purple-black"
    },
    {
     "n": 2,
     "feature": "Substrate",
     "danger": "Wood, stumps, buried wood, chips",
     "safe": "Overlaps — not a separator"
    },
    {
     "n": 3,
     "feature": "Bruising",
     "danger": "No blue bruising",
     "safe": "Psilocybe often bruises blue — unreliable alone"
    }
   ],
   "sources": [
    "mykoweb"
   ],
   "confidence": "documented"
  }
 ],
 "protocols": {
  "coniine": {
   "title": "Poison hemlock (coniine) poisoning — what to expect",
   "confidence": "documented",
   "symptoms": [
    "Early (often within 15–60 min): burning mouth, salivation, nausea/vomiting, tremor, dilated pupils, fast heart rate",
    "Then: muscle weakness progressing to ascending paralysis; slow heart rate",
    "Breathing muscle paralysis — the main cause of death",
    "Muscle breakdown (rhabdomyolysis) and kidney injury can follow",
    "Mind often stays clear while the body weakens"
   ],
   "mechanism": "Coniine and related alkaloids act on nicotinic acetylcholine receptors: initial stimulation followed by a depolarizing neuromuscular block (similar in effect to succinylcholine).",
   "noAntidote": "There is no antidote. Survival depends on early airway support and mechanical ventilation until the toxin clears; with good support, recovery commonly occurs within days (mild cases may clear in roughly 1–2 days).",
   "now": [
    "Call 911 for any breathing trouble, weakness, seizure or collapse",
    "Call Oregon Poison Center 1-800-222-1222 for any suspected ingestion, even without symptoms",
    "Do not induce vomiting",
    "Bring a sample of the plant in a sealed bag (use gloves) or clear photos",
    "Note the time of ingestion and amount"
   ],
   "hospital": [
    "Airway assessment; early intubation and mechanical ventilation if weakness progresses",
    "Activated charcoal only if early and the airway is protected (clinician decision)",
    "Benzodiazepines for seizures; cardiac monitoring",
    "Labs: CK, kidney function, electrolytes; IV fluids for rhabdomyolysis",
    "Observation until neuromuscular function has fully returned"
   ],
   "sources": [
    "osu-em9911",
    "ncpc-general"
   ]
  }
 },
 "deepDives": [
  {
   "id": "garlic-mustard-dive",
   "speciesId": "garlic-mustard",
   "title": "Garlic mustard: how it poisons the soil",
   "sections": [
    {
     "h": "Stinson et al. 2006 (PLoS Biology)",
     "p": "Kristina Stinson (Harvard Forest) with colleagues from the University of Guelph, University of Montana, Purdue and UFZ Germany showed that soil with a history of garlic mustard nearly eliminated arbuscular mycorrhizal fungi (AMF) colonization of sugar maple, red maple and white ash seedlings and slowed their growth — an indirect effect through the fungal partners rather than direct poisoning of the trees. Trees of mature forest, being more AMF-dependent, were hit hardest.",
     "src": [
      "stinson2006"
     ],
     "conf": "documented"
    },
    {
     "h": "Chemistry: glucosinolates, sinigrin, isothiocyanates, flavonoids",
     "p": "Like other mustards, garlic mustard stores glucosinolates — mainly sinigrin. When tissue is damaged, myrosinase converts sinigrin to allyl isothiocyanate (AITC), a volatile antimicrobial; Vaughn & Berhow (1999) isolated isothiocyanates from its tissues. However, the antifungal activity identified in Callaway et al. (2008) came from flavonoid fractions (e.g. alliarinoside, isovitexin glycoside). How long AITC persists in field soil, and how much it contributes, is not settled.",
     "src": [
      "vaughn1999",
      "callaway2008"
     ],
     "conf": "uncertain"
    },
    {
     "h": "Novel weapons hypothesis",
     "p": "Callaway & Ridenour (2004) proposed that some invaders win because their chemicals are new to the organisms of the invaded range. Callaway et al. (2008) tested garlic mustard directly: it strongly suppressed AMF viability and infectivity in North American soils but had no significant effect on AMF from European soils where it is native, and North American mycorrhizal plants suffered while European congeners were weakly affected.",
     "src": [
      "callaway2004",
      "callaway2008"
     ],
     "conf": "documented"
    },
    {
     "h": "Seed bank",
     "p": "Seeds can stay viable for years — commonly cited as 5+ and up to about 10 years — so plan on at least five years of follow-up pulling at any site that went to seed.",
     "src": [
      "oda-list"
     ],
     "conf": "inferred"
    },
    {
     "h": "Deer facilitation",
     "p": "In 10 eastern hemlock forests (NJ/PA), garlic mustard increased significantly more in deer-accessible plots than in paired exclosures; deer browse natives and spare garlic mustard (Eschtruth & Battles 2009). PNW deer and elk may play a similar role — inferred, not studied here.",
     "src": [
      "eschtruth2009"
     ],
     "conf": "documented"
    },
    {
     "h": "West Virginia white butterfly",
     "p": "The rare eastern butterfly Pieris virginiensis lays more eggs on garlic mustard than on its native host, but caterpillars fed garlic mustard die within days and never pupate (Davis & Cipollini 2014); follow-up work points to alliarinoside as the main larval toxin. The species does not occur in the PNW — this is an illustration of 'ecological trap' effects.",
     "src": [
      "davis2014",
      "davis2015"
     ],
     "conf": "documented"
    },
    {
     "h": "What recovers after removal — and what doesn't",
     "p": "In one New York study, insect-killing (entomopathogenic) soil fungi recovered to levels matching never-invaded soil within 45 days of removal (Vaicekonyte & Keesing 2012). But at eight forests, overall soil fungal community composition still resembled invaded soil after 3 years of annual pulling (Anthony et al. 2019). Fast partial recovery; slow full recovery.",
     "src": [
      "vaicekonyte2012",
      "anthony2019"
     ],
     "conf": "documented"
    }
   ],
   "charts": [
    "gm-fungi",
    "gm-longterm"
   ]
  }
 ],
 "charts": {
  "gm-fungi": {
   "title": "Entomopathogenic soil fungi after garlic mustard removal",
   "xLabel": "days after removal",
   "yLabel": "relative abundance (never-invaded soil = 1.0)",
   "xMax": 60,
   "xTicks": 6,
   "yMax": 1.2,
   "series": [
    {
     "name": "Illustrative recovery shape (not measured values)",
     "dash": true,
     "points": [
      [
       0,
       0.45
      ],
      [
       10,
       0.6
      ],
      [
       20,
       0.78
      ],
      [
       30,
       0.9
      ],
      [
       45,
       1.05
      ],
      [
       60,
       1.08
      ]
     ]
    },
    {
     "name": "Never-invaded reference",
     "dash": true,
     "ref": true,
     "points": [
      [
       0,
       1
      ],
      [
       60,
       1
      ]
     ]
    }
   ],
   "markers": [
    {
     "x": 45,
     "y": 1.05,
     "label": "Documented: at day 45, at or above never-invaded levels (Vaicekonyte & Keesing 2012)"
    }
   ],
   "note": "Only the day-45 outcome is from the study (one NY site, summer 2010). The starting level and curve shape are illustrative."
  },
  "gm-longterm": {
   "title": "Multi-year outlook after starting annual pulling",
   "xLabel": "years of annual removal",
   "yLabel": "relative level (illustrative)",
   "xMax": 8,
   "xTicks": 8,
   "yMax": 1.2,
   "series": [
    {
     "name": "Seed bank remaining (illustrative)",
     "dash": true,
     "points": [
      [
       0,
       1
      ],
      [
       1,
       0.7
      ],
      [
       2,
       0.48
      ],
      [
       3,
       0.32
      ],
      [
       4,
       0.2
      ],
      [
       5,
       0.12
      ],
      [
       6,
       0.07
      ],
      [
       8,
       0.03
      ]
     ]
    },
    {
     "name": "Soil fungal community similarity to uninvaded (illustrative)",
     "dash": true,
     "points": [
      [
       0,
       0.2
      ],
      [
       1,
       0.22
      ],
      [
       3,
       0.27
      ],
      [
       5,
       0.4
      ],
      [
       8,
       0.6
      ]
     ]
    }
   ],
   "markers": [
    {
     "x": 3,
     "y": 0.27,
     "label": "Documented: composition still resembled invaded plots at year 3 (Anthony et al. 2019)"
    },
    {
     "x": 5,
     "y": 0.12,
     "label": "Plan ≥5 years of follow-up (seed viability commonly cited 5–10 yrs)"
    }
   ],
   "note": "Curves are illustrative shapes, not data. Labeled markers summarize documented findings."
  }
 },
 "events": [
  {
   "id": "ev-planting",
   "title": "Bare-root native planting window",
   "type": "fieldwork",
   "months": [
    11,
    12,
    1,
    2,
    3
   ],
   "text": "Dormant-season planting of natives and live stakes (willow, red-osier dogwood) to shade out cleared ground.",
   "confidence": "inferred"
  },
  {
   "id": "ev-nesting",
   "title": "Bird nesting season — avoid heavy brush clearing",
   "type": "alert",
   "months": [
    3,
    4,
    5,
    6,
    7,
    8
   ],
   "text": "Schedule big blackberry/brush cuts outside spring–summer nesting; spot-work only.",
   "confidence": "inferred"
  },
  {
   "id": "ev-mushroom",
   "title": "Peak wild-mushroom season",
   "type": "alert",
   "months": [
    9,
    10,
    11
   ],
   "text": "Amanita and Galerina fruit with the fall rains. Keep children and dogs from eating yard mushrooms.",
   "confidence": "documented"
  },
  {
   "id": "ev-rosette",
   "title": "Rosette season",
   "type": "fieldwork",
   "months": [
    11,
    12,
    1,
    2,
    3
   ],
   "text": "Poison hemlock and garlic mustard rosettes stand out against dormant vegetation — good time to map patches.",
   "confidence": "inferred"
  },
  {
   "id": "ev-mapping",
   "title": "Map invasives before leaf-out",
   "type": "fieldwork",
   "months": [
    2,
    3
   ],
   "text": "Walk the boundary and flag patches; perimeter-first planning.",
   "confidence": "inferred"
  }
 ],
 "claims": [
  {
   "id": "c-hemlock-bloom",
   "claim": "Poison hemlock: 'mid-summer bloom vs early summer' (Queen Anne's lace).",
   "verdict": "corrected",
   "finding": "Order is reversed in common sources: poison hemlock blooms earlier (late spring–early summer); Queen Anne's lace blooms later (summer–fall). Overlap occurs.",
   "sources": [
    "osu-em9911",
    "umn-hemlock"
   ]
  },
  {
   "id": "c-hemlock-bracts",
   "claim": "Poison hemlock has 'no leafy bracts'.",
   "verdict": "nuanced",
   "finding": "Hemlock has small, inconspicuous bracts; the useful contrast is Queen Anne's lace's large 3-forked bracts.",
   "sources": [
    "osu-em9911"
   ]
  },
  {
   "id": "c-dead-canes",
   "claim": "Dead hemlock canes stay toxic up to 3 years.",
   "verdict": "supported",
   "finding": "Extension sources state dried/dead stems can remain toxic for up to three years.",
   "sources": [
    "umn-hemlock",
    "osu-em9911"
   ]
  },
  {
   "id": "c-coniine-recovery",
   "claim": "Coniine: no antidote, ventilator support, mild cases clear in 24–48 h.",
   "verdict": "nuanced",
   "finding": "No antidote and ventilatory support are well supported. Recovery time varies with dose; 24–48 h for mild cases is plausible but not a firm rule — complications (rhabdomyolysis, kidney injury) can prolong illness.",
   "sources": [
    "osu-em9911",
    "ncpc-general"
   ]
  },
  {
   "id": "c-panther-pct",
   "claim": "Western panther: 80% stomach symptoms vs 35% for fly agaric; more potent/unpredictable.",
   "verdict": "supported",
   "finding": "Matches Moss & Hendrickson 2019 (Oregon Poison Center, 2002–2016): GI symptoms 80% vs 35%, but from only 10 panther and 23 fly agaric cases. A Slovenian series (Vendramin & Brvar 2014) found panther more often caused coma, fly agaric more confusion/agitation.",
   "sources": [
    "moss2019",
    "vendramin2014"
   ]
  },
  {
   "id": "c-fly-agaric-df",
   "claim": "Fly agaric in Douglas fir understory.",
   "verdict": "supported",
   "finding": "Mycorrhizal with conifers including Douglas fir and with birch; common in PNW autumn.",
   "sources": [
    "mykoweb"
   ]
  },
  {
   "id": "c-smithiana",
   "claim": "Smith's amanita: kidney destruction at 4–6 days; confused with matsutake.",
   "verdict": "supported",
   "finding": "In a PNW case series kidney failure presented 4–6 days after ingestion; GI symptoms come earlier (hours). Matsutake confusion is the classic scenario.",
   "sources": [
    "warden1998"
   ]
  },
  {
   "id": "c-galerina",
   "claim": "Galerina marginata: 6–24 h delayed liver failure.",
   "verdict": "corrected",
   "finding": "6–24 h is the typical delay before GI symptoms. Liver failure develops later, roughly days 2–4, often after a deceptive improvement.",
   "sources": [
    "mykoweb",
    "ncpc-general"
   ]
  },
  {
   "id": "c-armenian",
   "claim": "'Armenian blackberry distinction' from Himalayan blackberry.",
   "verdict": "corrected",
   "finding": "They are the same plant: Rubus armeniacus is the accepted name for Himalayan blackberry (ODA lists it as 'Armenian (Himalayan) blackberry'). The meaningful distinctions are from native trailing blackberry and cutleaf blackberry.",
   "sources": [
    "oda-list"
   ]
  },
  {
   "id": "c-knotweed",
   "claim": "Knotweed has 20-ft roots.",
   "verdict": "nuanced",
   "finding": "Commonly cited figures are rhizomes ~7 m (≈23 ft) laterally and ~3 m (≈10 ft) deep; 'about 20 ft' is in the right range for lateral spread.",
   "sources": [
    "kc-knotweed"
   ]
  },
  {
   "id": "c-rcg-list",
   "claim": "Reed canarygrass is B-listed noxious in Oregon.",
   "verdict": "corrected",
   "finding": "Only the ornamental variety ribbongrass (Phalaris arundinacea var. picta) is Oregon List B and T. Wild-type reed canarygrass is not on the state list, though it is a major regional invasive (Washington Class C).",
   "sources": [
    "oda-list",
    "oda-ribbongrass",
    "nnrg-weeds"
   ]
  },
  {
   "id": "c-rcg-alk",
   "claim": "Reed canarygrass DMT/5-MeO-DMT content.",
   "verdict": "nuanced",
   "finding": "Alkaloid content is highly variable by strain and conditions; gramine and hordenine are commonly dominant, tryptamines occur in some strains. Presented only as a toxicity note.",
   "sources": [
    "nnrg-weeds"
   ]
  },
  {
   "id": "c-stinson-europe",
   "claim": "Stinson 2006 showed European vs North American mycorrhizal response.",
   "verdict": "corrected",
   "finding": "Stinson et al. 2006 named the home-range comparison as an open question. The Europe vs North America contrast was shown by Callaway et al. 2008 (Ecology 89:1043–1055).",
   "sources": [
    "stinson2006",
    "callaway2008"
   ]
  },
  {
   "id": "c-aitc",
   "claim": "Sinigrin → allyl isothiocyanate (AITC) in soil is the mechanism.",
   "verdict": "flagged",
   "finding": "Sinigrin and isothiocyanates are documented in the plant, but the antifungal activity identified by Callaway et al. 2008 was in flavonoid fractions. AITC's role in field soil is uncertain.",
   "sources": [
    "vaughn1999",
    "callaway2008"
   ]
  },
  {
   "id": "c-seedbank",
   "claim": "Garlic mustard seeds viable 5+ years.",
   "verdict": "supported",
   "finding": "Commonly cited as 5+ and up to ~10 years in management literature; exact longevity varies by site.",
   "sources": [
    "oda-list"
   ]
  },
  {
   "id": "c-45day",
   "claim": "Entomopathogenic fungi recover 45 days after removal.",
   "verdict": "supported",
   "finding": "Vaicekonyte & Keesing 2012 (one New York site). Broader fungal community composition had not recovered after 3 years in Anthony et al. 2019.",
   "sources": [
    "vaicekonyte2012",
    "anthony2019"
   ]
  },
  {
   "id": "c-deer",
   "claim": "Deer facilitate garlic mustard.",
   "verdict": "supported",
   "finding": "Eschtruth & Battles 2009 (NJ/PA exclosures).",
   "sources": [
    "eschtruth2009"
   ]
  },
  {
   "id": "c-wvwhite",
   "claim": "Garlic mustard poisons West Virginia white caterpillars.",
   "verdict": "supported",
   "finding": "Davis & Cipollini 2014; alliarinoside implicated (2015). Eastern species, not in the PNW.",
   "sources": [
    "davis2014",
    "davis2015"
   ]
  }
 ],
 "sources": [
  {
   "id": "osu-em9911",
   "title": "OSU Extension EM 9911: Poison hemlock and western water hemlock — deadly plants that may be growing in your pasture",
   "url": "https://extension.oregonstate.edu/catalog/em-9911-poison-hemlock-western-waterhemlock-deadly-plants-may-be-growing-your-pasture"
  },
  {
   "id": "umn-hemlock",
   "title": "University of Minnesota Extension: Poison hemlock",
   "url": "https://extension.umn.edu/natural-resources/forestry-and-wildlife/invasive-species/poison-hemlock"
  },
  {
   "id": "nwcb-hemlock",
   "title": "King County / WA Noxious Weed Control Board: Poison-hemlock alert (PDF)",
   "url": "https://www.nwcb.wa.gov/images/weeds/Poison-Hemlock_factsheet_King.pdf"
  },
  {
   "id": "oda-list",
   "title": "Oregon Dept. of Agriculture: Noxious weed policy and classification (2026 draft list)",
   "url": "https://www.oregon.gov/oda/Documents/Publications/Weeds/NoxiousWeedPolicyClassification.pdf"
  },
  {
   "id": "oda-ribbongrass",
   "title": "ODA weed profile: Ribbongrass (Phalaris arundinacea var. picta)",
   "url": "https://www.oregon.gov/oda/Documents/Publications/Weeds/RibbongrassProfile.pdf"
  },
  {
   "id": "nnrg-weeds",
   "title": "Northwest Natural Resource Group: Controlling and identifying invasive woodland plants",
   "url": "https://www.nnrg.org/noxious-weeds-in-woodlands/"
  },
  {
   "id": "wsu-blackberry",
   "title": "ODA weed profiles (Armenian/Himalayan blackberry)",
   "url": "https://www.oregon.gov/oda/weeds/oregon-noxious-weeds/pages/default.aspx"
  },
  {
   "id": "noivy",
   "title": "Portland Parks & Recreation: The Ivy Files / No Ivy League removal methods",
   "url": "https://www.portland.gov/parks/nature/ivy-files"
  },
  {
   "id": "kc-knotweed",
   "title": "King County Noxious Weeds: Knotweeds",
   "url": "https://kingcounty.gov/en/dept/dnrp/nature-recreation/environment-ecology-conservation/noxious-weeds"
  },
  {
   "id": "stinson2006",
   "title": "Stinson KA et al. 2006. Invasive plant suppresses the growth of native tree seedlings by disrupting belowground mutualisms. PLoS Biol 4(5): e140",
   "url": "https://doi.org/10.1371/journal.pbio.0040140"
  },
  {
   "id": "callaway2008",
   "title": "Callaway RM et al. 2008. Novel weapons: invasive plant suppresses fungal mutualists in America but not in its native Europe. Ecology 89:1043–1055",
   "url": "https://doi.org/10.1890/07-0370.1"
  },
  {
   "id": "callaway2004",
   "title": "Callaway RM & Ridenour WM. 2004. Novel weapons: invasive success and the evolution of increased competitive ability. Front Ecol Environ 2:436–443",
   "url": "https://doi.org/10.1890/1540-9295(2004)002[0436:NWISAT]2.0.CO;2"
  },
  {
   "id": "vaughn1999",
   "title": "Vaughn SF & Berhow MA. 1999. Allelochemicals isolated from tissues of the invasive weed garlic mustard. J Chem Ecol 25:2495–2504",
   "url": ""
  },
  {
   "id": "vaicekonyte2012",
   "title": "Vaicekonyte R & Keesing F. 2012. Effects of garlic mustard removal on the abundance of entomopathogenic fungi. Invasive Plant Sci Manag 5:323–329",
   "url": "https://doi.org/10.1614/IPSM-D-12-00006.1"
  },
  {
   "id": "anthony2019",
   "title": "Anthony MA, Stinson KA et al. 2019. Fungal communities do not recover after removing invasive Alliaria petiolata. Biological Invasions",
   "url": "https://scholars.unh.edu/faculty_pubs/1721/"
  },
  {
   "id": "eschtruth2009",
   "title": "Eschtruth AK & Battles JJ. 2009. Acceleration of exotic plant invasion in a forested ecosystem by a generalist herbivore. Conserv Biol 23:388–399",
   "url": "https://doi.org/10.1111/j.1523-1739.2008.01122.x"
  },
  {
   "id": "davis2014",
   "title": "Davis SL & Cipollini D. 2014. Do mothers always know best? Oviposition mistakes and larval failure of Pieris virginiensis on Alliaria petiolata. Biol Invasions 16:1941–1950",
   "url": "https://doi.org/10.1007/s10530-013-0637-2"
  },
  {
   "id": "davis2015",
   "title": "Davis SL et al. 2015. How does garlic mustard lure and kill the West Virginia white butterfly? J Chem Ecol",
   "url": "https://pubmed.ncbi.nlm.nih.gov/26399433/"
  },
  {
   "id": "moss2019",
   "title": "Moss MJ & Hendrickson RG. 2019. Toxicity of muscimol and ibotenic acid containing mushrooms reported to a regional poison control center 2002–2016. Clin Toxicol 57:99–103",
   "url": "https://pubmed.ncbi.nlm.nih.gov/30073844/"
  },
  {
   "id": "vendramin2014",
   "title": "Vendramin A & Brvar M. 2014. Amanita muscaria and Amanita pantherina poisoning: two syndromes. Toxicon 90:269–272",
   "url": "https://pubmed.ncbi.nlm.nih.gov/25173077/"
  },
  {
   "id": "meisel2022",
   "title": "Meisel EM et al. 2022. Two cases of severe Amanita muscaria poisoning including a fatality. Wilderness Environ Med",
   "url": "https://journals.sagepub.com/doi/full/10.1016/j.wem.2022.06.002"
  },
  {
   "id": "warden1998",
   "title": "Warden CR & Benjamin DR. 1998. Acute renal failure associated with suspected Amanita smithiana ingestions: a case series. Acad Emerg Med",
   "url": "https://pubmed.ncbi.nlm.nih.gov/9715243/"
  },
  {
   "id": "mykoweb",
   "title": "MykoWeb: Toxic Fungi of Western North America",
   "url": "https://www.mykoweb.com/TFWNA/"
  },
  {
   "id": "ncpc-general",
   "title": "Oregon Poison Center (OHSU) — call 1-800-222-1222",
   "url": "https://www.ohsu.edu/oregon-poison-center"
  },
  {
   "id": "usda-plants",
   "title": "USDA PLANTS Database",
   "url": "https://plants.usda.gov/"
  }
 ]
};
