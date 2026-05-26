export const FRAMEWORKS = [
  {
    id: '3cs',
    category: 'framework',
    name: "3C's",
    subtitle: 'Assessing the business situation',
    whenToUse: 'Any case where you need to understand the full competitive landscape before recommending action.',
    source: 'MBA Core Curriculum',
    color: '#3b82f6',
    components: [
      {
        label: 'Customers / Consumers',
        points: ['Demographics & psychographics', 'Shopping behaviors', 'Insights & needs', 'Macro trends', 'What drives loyalty?'],
      },
      {
        label: 'Competition',
        points: ['Market share', 'Market position', 'Strategy', 'Cost position', 'How are they winning?'],
      },
      {
        label: 'Company',
        points: ['Resources available', 'Organizational structure', 'Production system', 'Brand strengths', 'Internal capabilities'],
      },
    ],
    examplePrompts: [
      "Tide has lost 6 points of market share over 18 months. What would you do?",
      "A challenger brand entered your category and is growing fast. How do you respond?",
      "P&G's CEO wants to know why the Beauty division is underperforming. Where do you start?",
    ],
    flashCards: [
      { q: "Name the 3 components of the 3C's framework.", a: "Customers/Consumers, Competition, Company." },
      { q: "What does the 'Competition' bucket in 3C's examine?", a: "Market share, market position, strategy, cost position, and how competitors are winning — specifically what's driving their advantage." },
      { q: "Your boss says revenue is down. Which 3C's component do you analyze first, and why?", a: "Competition — check if a competitor is taking share before assuming a consumer or internal problem. Then Customers to see if demand has shifted. Company last to identify capability gaps." },
    ],
  },
  {
    id: '4cs-cpg',
    category: 'framework',
    name: "4C's (CPG)",
    subtitle: "CPG variant of 3C's — adds retail channel layer",
    whenToUse: "CPG/consumer goods cases where the retailer (Walmart, Target, etc.) is a key stakeholder separate from the end consumer.",
    source: 'MLT',
    color: '#8b5cf6',
    components: [
      { label: 'Consumer', points: ['End user needs, behaviors, purchase drivers'] },
      { label: 'Customer*', points: ['The retailer/distributor — their needs, economics, incentives'] },
      { label: 'Competitor', points: ['Direct & indirect competition, private label'] },
      { label: 'Company', points: ['Internal strengths, brand equity, capabilities'] },
      { label: 'Collaborators (optional)', points: ['Suppliers, agencies, partners'] },
      { label: 'Context (optional)', points: ['Macro trends, regulation, economic environment'] },
    ],
    examplePrompts: [
      "Walmart is threatening to delist your product unless you increase trade margins. How do you respond?",
      "Target wants an exclusive SKU for their stores. Should you do it, and on what terms?",
      "Your brand is losing shelf space at Kroger to a private label competitor. What's your plan?",
    ],
    flashCards: [
      { q: "What does the 4C's (CPG) add over the standard 3C's?", a: "A separate 'Customer' bucket for the retailer/distributor, distinct from the end Consumer. Optionally adds Collaborators and Context." },
      { q: "Why does CPG need a separate 'Customer' bucket from 'Consumer'?", a: "In CPG, the retailer (Walmart, Target) has its own economics, shelf-space incentives, and margin needs that differ entirely from what drives the end consumer. You must satisfy both stakeholders separately." },
      { q: "Name all 4 core C's in the CPG context.", a: "Consumer (end user), Customer (retailer/distributor), Competitor (brands + private label), Company (internal strengths and capabilities)." },
    ],
  },
  {
    id: '4ps',
    category: 'framework',
    name: "4P's",
    subtitle: 'Go-to-market tactics & marketing mix',
    whenToUse: "New product launches, competitive response, brand repositioning — any question about HOW to take something to market.",
    source: 'MBA Core Curriculum',
    color: '#10b981',
    components: [
      {
        label: 'Product',
        points: ['Product mix & features', 'Differentiation vs. competition', 'Profit margins', 'Substitutes', 'Packaging & usage occasions'],
      },
      {
        label: 'Price',
        points: ['Demand & elasticity', 'Customer willingness to pay', 'Fit with brand strategy', 'Competitor pricing', 'Profitability targets'],
      },
      {
        label: 'Place (Distribution)',
        points: ["Channels & retailers vs. strategy", 'Shelf placement', "JIT vs. inventory tradeoffs", "Where private label can't go"],
      },
      {
        label: 'Promotion',
        points: ['Advertising & consumer strategy', 'Trade promotion', 'Promo vehicles: social, TV, trade incentives', 'Promo price windows'],
      },
    ],
    examplePrompts: [
      "You're launching a new protein bar line. Walk me through how you'd go to market.",
      "A competitor just cut price 15%. Should you match, and what are the risks?",
      "Your brand manager wants to raise price 8% next quarter. Talk me through the decision.",
    ],
    flashCards: [
      { q: "Name the 4P's and one key question for each.", a: "Product (what differentiates it?), Price (does it match positioning?), Place (which channels align with strategy?), Promotion (how do we reach the target and communicate the benefit?)." },
      { q: "Which P is hardest to change quickly, and why?", a: "Product — it requires R&D, manufacturing retooling, and sometimes regulatory approval. Price can change overnight; Promotion can shift in weeks; Place takes months. Product takes years." },
      { q: "Tide is losing share to private label. Which P(s) do you focus on?", a: "Product (differentiation — what does Tide do that store brand can't?) and Promotion (rebuild brand equity). You cannot win on Price against private label — that's a race to the bottom." },
    ],
  },
  {
    id: 'stp',
    category: 'framework',
    name: 'STP',
    subtitle: 'Segmentation → Targeting → Positioning',
    whenToUse: 'New product launch, brand extension, or entering a new market — any time you need to define WHO you are serving and HOW to win with them.',
    source: 'MBA Core Curriculum',
    color: '#f59e0b',
    components: [
      {
        label: 'Segmentation',
        points: ['Divide market by distinct needs, behaviors, or characteristics', 'Geographic, demographic, psychographic, behavioral', 'Which segments are large enough to matter?'],
      },
      {
        label: 'Targeting',
        points: ['Evaluate each segment: size, growth, accessibility, fit', 'Select one or more segments to serve', 'Which offers the strongest opportunity at reasonable cost?'],
      },
      {
        label: 'Positioning',
        points: ['Create one clear positioning statement', 'Differentiated, Relevant, Sustainable (DRS)', 'Premium vs. value vs. lifestyle vs. performance?'],
      },
    ],
    examplePrompts: [
      "We're launching a new energy drink. Who should we target and why?",
      "Olay is losing relevance with younger buyers. How would you reposition it?",
      "Our brand has 60% household penetration but purchase frequency is falling. What do you do?",
    ],
    flashCards: [
      { q: "What do S, T, and P stand for?", a: "Segmentation (divide the market by distinct needs/behaviors), Targeting (choose which segment to serve), Positioning (define how you win with that segment)." },
      { q: "What makes a strong positioning statement? What is the DRS test?", a: "Differentiated (distinct from competitors), Relevant (matters to your target), Sustainable (defensible over time). All three must be true or the positioning will fail." },
      { q: "Walk through STP for a new energy drink targeting women over 35.", a: "Segment by wellness orientation & lifestyle (active moms, career women). Target the fastest-growing with highest unmet need. Position as 'clean energy without the crash' — functional but not aggressive." },
    ],
  },
  {
    id: 'porters5',
    category: 'framework',
    name: "Porter's Five Forces",
    subtitle: 'Industry attractiveness & competitive intensity',
    whenToUse: 'New market entry or acquisition — is this industry worth entering? How hard will it be to compete?',
    source: 'MBA Core Curriculum',
    color: '#ef4444',
    components: [
      { label: 'Threat of New Entrants', points: ['Economies of scale', 'Capital requirements', 'Brand switching costs', 'Access to channels', 'Government policy'] },
      { label: 'Supplier Power', points: ['Few suppliers vs. many', 'Differentiated inputs', 'Forward integration risk'] },
      { label: 'Buyer Power', points: ['Buyer concentration', 'Price sensitivity', 'Backward integration risk', 'Standardized products'] },
      { label: 'Threat of Substitutes', points: ['Alternative products/services', 'Price-performance tradeoff', 'Buyer switching costs'] },
      { label: 'Competitive Rivalry', points: ['Number of competitors', 'Industry growth rate', 'Product differentiation', 'Exit barriers'] },
    ],
    examplePrompts: [
      "Should P&G enter the premium skincare market? Assess the industry attractiveness.",
      "Why is the US airline industry chronically unprofitable despite high demand?",
      "A private equity firm is considering acquiring a mid-sized CPG brand. Evaluate the category.",
    ],
    flashCards: [
      { q: "Name all 5 forces in Porter's framework.", a: "Threat of New Entrants, Supplier Power, Buyer Power, Threat of Substitutes, and Competitive Rivalry." },
      { q: "When is Buyer Power HIGH? Name 3 conditions.", a: "Buyers are concentrated (few, large buyers), products are standardized (easy to switch), buyers are price-sensitive, or buyers can threaten to backward-integrate (make the product themselves)." },
      { q: "Which of the 5 Forces would be HIGHEST in the US airline industry?", a: "Buyer power (price-sensitive, easy to compare on apps) and Competitive rivalry (oligopoly, low differentiation, high fixed costs). Threat of new entrants is LOW due to massive capital barriers." },
    ],
  },
  {
    id: 'market-entry',
    category: 'framework',
    name: 'Market Entry Framework',
    subtitle: 'New product × new market decision matrix',
    whenToUse: 'Should we enter this market? Should we launch this product? Structures the decision by product and market newness.',
    source: 'MBA Core Curriculum',
    color: '#6366f1',
    components: [
      {
        label: 'New Product × New Market',
        points: ['Consumer demand?', 'Threat of new entrants & substitutes', 'Capability to produce & market', 'Financing requirements'],
      },
      {
        label: 'New Product × Existing Market',
        points: ['Incremental profits vs. costs', 'Opportunity costs', 'Consumer demand', 'Competitive response', 'Brand impact & cannibalization'],
      },
      {
        label: 'Existing Product × New Market',
        points: ['Competitive response in new market', 'Defense of existing markets', 'Incremental marketing costs', 'Market knowledge gaps', 'Channel strategy'],
      },
      {
        label: 'Existing Product × Existing Market',
        points: ['No market entry — focus on share gain or deeper penetration'],
      },
    ],
    examplePrompts: [
      "Should Tide launch a professional cleaning line for commercial customers?",
      "Unilever is considering entering the plant-based meat category. Should they?",
      "A US CPG brand wants to launch in India. Walk me through the decision.",
    ],
    flashCards: [
      { q: "Name the 4 quadrants of the Market Entry Framework.", a: "New Product × New Market, New Product × Existing Market, Existing Product × New Market, Existing Product × Existing Market." },
      { q: "Which quadrant is highest risk and why?", a: "New Product × New Market — double uncertainty. You're building unfamiliar capabilities while entering a market you don't know. Both product-market fit AND channel knowledge are unproven." },
      { q: "A cereal brand launches a protein shake line in gyms. Which quadrant is this?", a: "New Product × New Market — a new product format (protein shake) sold through a new channel (gyms) to a new buyer (fitness-focused consumers). Requires assessing capability gaps and competitive response." },
    ],
  },
  {
    id: 'profitability',
    category: 'model',
    name: 'Profitability Tree',
    subtitle: 'Diagnosing profit problems — Revenue minus Costs',
    whenToUse: 'Any time profit, revenue, or margins are declining or need to grow. Start with the equation, then drill into the driver.',
    source: 'MBA Core Curriculum',
    color: '#14b8a6',
    components: [
      {
        label: 'Profit = Revenue − Costs',
        points: ['Always start here — which side is the problem?'],
      },
      {
        label: 'Revenue = Price × Volume',
        points: ['Price: mix, discounts, elasticity, competitor pricing', 'Volume: market size, market share, growth rate, seasonality, capacity'],
      },
      {
        label: 'Variable Costs',
        points: ['COGS, SG&A, taxes, supplier costs, incentives, outsourcing'],
      },
      {
        label: 'Fixed Costs',
        points: ['Capacity utilization, breakeven volume, economies of scale, NPV of investment'],
      },
    ],
    examplePrompts: [
      "P&G's Beauty division profits fell 30% despite flat revenue. What happened?",
      "Our brand's operating margins declined 4 points over 2 years. Diagnose the problem.",
      "Revenue is up 12% but net income is down 8%. Where do you look first?",
    ],
    flashCards: [
      { q: "What is the top-level profitability equation, and what are the two sub-equations?", a: "Profit = Revenue − Costs. Revenue = Price × Volume. Costs = Variable Costs + Fixed Costs. Always identify which branch the problem lives in before drilling down." },
      { q: "Profits are down but revenue is up. Where do you look first?", a: "Costs — specifically whether variable costs (COGS, supplier costs, SG&A) or fixed costs (overhead, capacity) have increased faster than revenue growth." },
      { q: "Revenue is down. Walk through all the sub-drivers you would investigate.", a: "Price drivers: discounting, mix shift, elasticity, competitor pricing. Volume drivers: market size change, market share shift, seasonality, capacity constraints, or customer churn." },
    ],
  },
  {
    id: 'market-share',
    category: 'model',
    name: 'Market Share Matrix',
    subtitle: 'Diagnosing market share problems',
    whenToUse: 'When sales and/or market share are moving in unexpected directions — cross-reference both to diagnose root cause.',
    source: 'MBA Core Curriculum',
    color: '#f97316',
    components: [
      {
        label: 'Share UP + Sales Growing',
        points: ['Good situation — check if ad spend / promos driving it', 'Competitors exiting? Take their share — be wary of over-relying on it'],
      },
      {
        label: 'Share UP + Sales Flat',
        points: ['Category shrinking — why?', 'Consumers leaving the category', 'Competitors exiting'],
      },
      {
        label: 'Share UP + Sales Declining',
        points: ['Shrinking category with price competition', 'Consumers leaving entirely'],
      },
      {
        label: 'Share DOWN + Sales Growing',
        points: ['Category growing faster than you', "Where are consumers going?", 'Being outpaced — revisit targeting and objectives'],
      },
      {
        label: 'Share DOWN + Sales Declining',
        points: ["Worst position — consumers don't like you", 'Why are competitors winning? Outspending? Better positioning?'],
      },
    ],
    examplePrompts: [
      "Tide's volume is down 6% but market share is up 2 points. What's going on?",
      "Our sales are flat but we gained 3 points of market share. Good or bad?",
      "We're losing share but our absolute sales are growing. Should we be concerned?",
    ],
    flashCards: [
      { q: "What two variables does the Market Share Matrix cross-reference?", a: "Market share direction (up or down) and sales direction (growing, flat, or declining). Together they reveal whether you have a company problem, a category problem, or a competitive problem." },
      { q: "Share is UP but sales are flat. What's happening?", a: "The category is shrinking — you're taking share from competitors but the overall market is contracting. The real threat is the category itself, not the competitors." },
      { q: "Kodak film sales are flat but market share grew 10%. What does this tell you?", a: "Category is shrinking — the overall film market is declining (digital cameras), but Kodak is losing competitors slower than the category contracts. Share up + sales flat = shrinking category." },
    ],
  },
  {
    id: 'value-chain',
    category: 'framework',
    name: 'Value Chain Analysis',
    subtitle: 'Sources of differentiation and cost advantage',
    whenToUse: 'Identifying WHERE a company creates value and WHERE competitors can be beaten on cost or differentiation.',
    source: 'MBA Core Curriculum',
    color: '#ec4899',
    components: [
      {
        label: 'Primary Activities',
        points: ['Inbound Logistics', 'Operations', 'Outbound Logistics', 'Marketing & Sales', 'Service'],
      },
      {
        label: 'Support Activities',
        points: ['Firm Infrastructure', 'Human Resource Management', 'Technology Development', 'Procurement'],
      },
      {
        label: 'How to use it',
        points: [
          'Compare value chain to competitors — where is your differentiation?',
          'Identify drivers of uniqueness in each activity',
          'Break down each activity as % of incoming dollar',
          'Identify outsourcing or integration opportunities',
        ],
      },
    ],
    examplePrompts: [
      "Costco sells a laundry detergent 40% below Tide and still makes money. How is that possible?",
      "Amazon is entering your distribution channel. Where are you most vulnerable?",
      "Where in the supply chain can this brand cut costs without hurting the consumer experience?",
    ],
    flashCards: [
      { q: "Name the 5 primary activities in the Value Chain.", a: "Inbound Logistics, Operations, Outbound Logistics, Marketing & Sales, and Service." },
      { q: "Name the 4 support activities in the Value Chain.", a: "Firm Infrastructure, Human Resource Management, Technology Development, and Procurement." },
      { q: "Amazon's biggest value chain advantage vs. traditional retail is in which activity?", a: "Operations and Outbound Logistics — AWS-powered fulfillment, Prime delivery, and warehouse automation give unmatched speed and cost efficiency that traditional retailers cannot replicate." },
    ],
  },
  {
    id: 'breakeven',
    category: 'formula',
    name: 'Breakeven Analysis',
    subtitle: 'How many units to cover fixed costs?',
    whenToUse: 'Pricing decisions, investment decisions, new product launches — any time you need to know if/when a venture becomes profitable.',
    source: 'Crack the Case',
    color: '#84cc16',
    components: [
      {
        label: 'Breakeven (Units)',
        points: ['= Fixed Costs ÷ (Revenue per Unit − Variable Cost per Unit)', 'The denominator is the Contribution Margin per unit'],
      },
      {
        label: 'Breakeven (Sales $)',
        points: ['= Fixed Costs ÷ Contribution Margin Ratio', 'Contribution Margin = Price − Variable Costs'],
      },
      {
        label: 'Key definitions',
        points: [
          "Fixed costs: rent, equipment, salaries — don't change with volume",
          'Variable costs: COGS, materials, labor per unit',
          "Contribution margin: what's left after variable costs to cover fixed costs",
        ],
      },
    ],
    examplePrompts: [
      "We're considering launching in a new city. How many units do we need to sell to break even?",
      "A new product has $2M in fixed costs and $8 contribution margin per unit. When do we make money?",
      "Is this new product line worth launching? Walk me through the economics.",
    ],
    flashCards: [
      { q: "What is the breakeven formula in units?", a: "Breakeven Units = Fixed Costs ÷ Contribution Margin per unit. Where CM per unit = Price per unit − Variable Cost per unit." },
      { q: "What is Contribution Margin, and why does it matter?", a: "Contribution Margin = Price − Variable Cost per unit. It's what each sale 'contributes' toward covering fixed costs. The higher the CM, the fewer units you need to break even." },
      { q: "Fixed costs = $200K. Price = $50. Variable cost = $30. What's the breakeven?", a: "CM = $50 − $30 = $20 per unit. Breakeven = $200K ÷ $20 = 10,000 units." },
    ],
  },
  {
    id: 'csai',
    category: 'approach',
    name: 'CSAI Framework',
    subtitle: 'The 4 skills interviewers score you on',
    whenToUse: 'Self-assessment after every case practice. Marketing/CPG roles weight Communication highest.',
    source: 'Crack the Case / Zintervu',
    color: '#0ea5e9',
    components: [
      { label: 'Communication', points: ['Answer-first delivery', "Structured signposting ('There are 3 areas...')", 'Concise — eliminate filler', 'Logical flow, easy to follow under pressure'] },
      { label: 'Structure', points: ['MECE — no overlap, no gaps', 'Tailored to the case (not generic buckets)', 'Prioritized — most important branches first', 'Communicable in 60 seconds'] },
      { label: 'Analysis', points: ['Accurate math', 'Strong business insights', 'Articulate assumptions', 'Request clarifying data when needed'] },
      { label: 'Integration', points: ['Lead with a recommendation', 'Acknowledge risks', 'Suggest next steps', 'Connect dots across the case'] },
    ],
    examplePrompts: [
      "How would you self-assess your performance in that case?",
      "Walk me through what an interviewer is evaluating as you answer.",
      "You had a strong analysis but lost the interviewer midway. What went wrong?",
    ],
    flashCards: [
      { q: "What does CSAI stand for?", a: "Communication, Structure, Analysis, Integration — the four skills interviewers score you on in every case interview." },
      { q: "Marketing/CPG roles weight which CSAI skill highest, and why?", a: "Communication — Marketing interviewers want to see you have a 'nose for' consumer behavior, can be creative, AND can communicate a recommendation clearly and confidently." },
      { q: "What does Integration mean in a case interview context?", a: "Integration is your synthesis layer: lead with a recommendation, acknowledge risks, connect your analysis across the whole case, and suggest concrete next steps. It shows you think like a business person, not just an analyst." },
    ],
  },
  {
    id: 'block-break-ask',
    category: 'approach',
    name: 'Block, Break & Ask',
    subtitle: 'CTC structuring method for any case',
    whenToUse: 'Opening structure for any case. Use it to create your initial framework before diving into analysis.',
    source: 'Crack the Case / Zintervu',
    color: '#f59e0b',
    components: [
      { label: 'Block', points: ['Identify 2-3 MECE top-level buckets using case-specific words (not generic labels)', 'Build them into a visual structure you can walk the interviewer through in 60 seconds'] },
      { label: 'Break', points: ['Break each block into 2-3 specific sub-issues', 'Each branch should be testable — you can ask a question or gather data for it'] },
      { label: 'Ask', points: ['Prioritize which branch to explore first', 'Ask ONE clarifying question to confirm your direction', 'Signal hypothesis-driven thinking'] },
    ],
    examplePrompts: [
      "Take 90 seconds to structure your approach to: our profits are declining.",
      "You've just been given a case. Walk me through your first 60 seconds.",
      "How would you open a market entry case? Show me your structure before diving in.",
    ],
    flashCards: [
      { q: "What do the 3 steps in Block, Break & Ask mean?", a: "Block: build 2-3 MECE top-level categories. Break: drill each block into 2-3 testable sub-issues. Ask: prioritize and ask ONE clarifying question to confirm your direction." },
      { q: "What does MECE mean and why does it matter for structuring?", a: "Mutually Exclusive, Collectively Exhaustive — no overlap between buckets, no gaps in coverage. MECE keeps your structure clean and prevents double-counting or missing a key issue." },
      { q: "What makes a 'Block' good vs. generic?", a: "Good Blocks use case-specific language — not 'Revenue and Costs' but 'Shelf Placement, Price Gap, and Brand Loyalty.' Walk the interviewer through it in 60 seconds and it should feel tailored to the exact scenario." },
    ],
  },
  {
    id: 'speak',
    category: 'approach',
    name: 'SPEAK',
    subtitle: 'Market sizing framework',
    whenToUse: 'Any market sizing question — "How big is X market?" or "How many Y in Z?"',
    source: 'Crack the Case / Zintervu',
    color: '#a855f7',
    components: [
      { label: 'S — State My Assumptions', points: ["Define scope clearly", "Explain what you're including/excluding", 'Use round, defensible numbers'] },
      { label: 'P — Pick My Metrics & Approach', points: ['Top-down (population → penetration → purchase rate)', 'Bottom-up (unit level → scale up)', 'Choose the one that gives cleaner math'] },
      { label: 'E — Estimate Quickly', points: ['Work in round numbers', 'Show your math out loud', 'Keep track of zeros (K, M, B)'] },
      { label: 'A — Assess My Approach & Answer', points: ['Does the answer pass the sanity check?', 'Is it too high or too low? Why?', 'What would change your estimate?'] },
      { label: 'K — Keep Exceptions in Mind', points: ['Seasonality, geography, outliers', 'Mention 1-2 that could significantly affect the estimate', 'Shows business judgment'] },
    ],
    examplePrompts: [
      "How big is the US premium pet food market?",
      "How many diapers are sold in the US per year?",
      "Estimate the market size for ready-to-drink protein shakes.",
    ],
    flashCards: [
      { q: "What does SPEAK stand for?", a: "State assumptions, Pick approach (top-down vs. bottom-up), Estimate quickly, Assess your answer (sanity check), Keep exceptions in mind (seasonality, outliers)." },
      { q: "What's the difference between top-down and bottom-up market sizing?", a: "Top-down narrows from total population (300M → 40% drink coffee daily → 1 cup/day × $3). Bottom-up builds from the unit level up (1 Starbucks × 450 cups/day × 16K stores). Use whichever gives cleaner math." },
      { q: "How do you perform a sanity check on a market sizing answer?", a: "Compare to a known reference: US population is 330M, GDP is ~$25T, typical consumer categories are $1-50B. If you get a $5T ketchup market, you've made an error. Say the number out loud and gut-check it." },
    ],
  },
  {
    id: 'pricing-framework',
    category: 'framework',
    name: 'Pricing Framework',
    subtitle: '4 lenses for setting price',
    whenToUse: 'Any pricing question — new product launch price, should we raise price, price war response.',
    source: 'MLT',
    color: '#06b6d4',
    components: [
      { label: 'Positioning', points: ["Is the price consistent with brand & product positioning?", 'Premium, value, or parity vs. competition?', 'Price signals quality — does that matter here?'] },
      { label: 'Elasticity', points: ['How sensitive are consumers to price differences in this category?', 'High elasticity (commodity) = price matters a lot', 'Low elasticity (premium, necessity) = pricing power exists'] },
      { label: 'Value-Based Pricing', points: ["How much value does your product deliver vs. competition and substitutes?", "What is the consumer's willingness to pay?", 'Price should capture a share of the value created'] },
      { label: 'Cost-Based Pricing', points: ['What do you need to charge to hit target profit level?', 'Profit = (Price × Volume) − (Fixed + Variable Costs)', 'Useful as a floor, not a ceiling'] },
    ],
    examplePrompts: [
      "We're launching a premium shampoo at $14. Is that the right price?",
      "A competitor dropped price 20%. Should we match, and what are the risks?",
      "Our CFO wants to raise price 10% to hit margin targets. Walk through the decision.",
    ],
    flashCards: [
      { q: "Name the 4 lenses of the Pricing Framework.", a: "Positioning (does price signal the right quality level?), Elasticity (how price-sensitive is this category?), Value-Based (what's the consumer willing to pay?), Cost-Based (what's our profit floor?)." },
      { q: "Why is cost-based pricing described as a 'floor, not a ceiling'?", a: "Cost-based tells you the minimum price to be profitable, but it ignores consumer willingness to pay and competitive positioning. The ceiling is set by value-based logic — which is often much higher." },
      { q: "In a commodity market with high price elasticity, which pricing lens matters most?", a: "Cost-based — if consumers are highly price-sensitive and products are identical, you must price near cost+margin to stay competitive. The real answer is to escape the commodity trap by building differentiation." },
    ],
  },
  {
    id: 'ad-evaluation',
    category: 'framework',
    name: 'Ad Evaluation Framework',
    subtitle: 'Evaluate any ad or campaign',
    whenToUse: '"Tell me about a well/poorly marketed product" or "Evaluate this ad." Common marketing-specific case type.',
    source: 'MLT',
    color: '#f43f5e',
    components: [
      {
        label: 'Step 1: Reverse Engineer the Message',
        points: ["Who is the intended target?", 'What is the key takeaway (knowledge vs. feeling)?', "What is the ad's purpose? (Awareness / Change Perception / Call to Action)"],
      },
      {
        label: 'Step 2: Evaluate the Delivery',
        points: ["Is it clear and single-minded?", "Is it consistent with the brand's equity?", 'Does it break through the clutter?', 'Where should it be placed to succeed?'],
      },
      {
        label: 'Overall: Positioning Check',
        points: ['Is the positioning Differentiated, Relevant, and Sustainable (DRS)?', "Do all 4P's consistently support the brand's message?"],
      },
    ],
    examplePrompts: [
      "Tell me about a brand you think is brilliantly marketed and why.",
      "Evaluate this Dove Real Beauty ad. Is it effective? What would you change?",
      "A brand manager wants to run a Super Bowl spot. How do you evaluate whether it's worth it?",
    ],
    flashCards: [
      { q: "What are the 3 possible purposes of an ad?", a: "Awareness (people don't know the product exists), Change Perception (people know it but misunderstand it), Call to Action (people need to be prompted to buy now)." },
      { q: "What 3 questions define a strong ad delivery?", a: "Is it clear and single-minded? Is it consistent with the brand's equity? Does it break through the clutter where the target will see it?" },
      { q: "What is the DRS test in ad evaluation?", a: "Differentiated (distinct from competitors), Relevant (resonates with the target), Sustainable (defensible long-term). A great ad can fail if the underlying positioning doesn't pass DRS." },
    ],
  },
  {
    id: 'special-t',
    category: 'approach',
    name: 'SPECIAL-T / MVM',
    subtitle: 'Macro environment & integrated business model',
    whenToUse: 'General strategy cases, broad strategic direction questions, or when you need to assess macro forces on a business.',
    source: 'Crack the Case / Zintervu',
    color: '#64748b',
    components: [
      {
        label: 'SPECIAL-T Macro Factors',
        points: ['S — Suppliers', 'P — People / Labor', 'E — Economy', 'C — Competitors', 'I — Industry trends', 'A — Auditors / Regulation', 'L — Legislation', 'T — Technology'],
      },
      {
        label: 'MVM — Maximum Value Model (5 Zones)',
        points: [
          'Zone 1: Strategy — What is the business strategy?',
          'Zone 2: Operations — How does it make money?',
          'Zone 3: Organization — How does it spend money internally?',
          'Zone 4: Finance — What are the sources of cash?',
          'Zone 5: SPECIAL-T — Which macro factors matter most right now?',
        ],
      },
    ],
    examplePrompts: [
      "What macro forces should a legacy CPG company be most worried about in the next 5 years?",
      "Give me a full strategic assessment of a traditional brick-and-mortar retailer.",
      "What trends are reshaping the consumer goods industry right now?",
    ],
    flashCards: [
      { q: "What does SPECIAL-T stand for?", a: "Suppliers, People/Labor, Economy, Competitors, Industry trends, Auditors/Regulation, Legislation, Technology. Used to assess macro forces on a business in general strategy cases." },
      { q: "Name the 5 zones of the MVM (Maximum Value Model).", a: "Zone 1: Strategy (what's the plan?), Zone 2: Operations (how does it make money?), Zone 3: Organization (how does it spend internally?), Zone 4: Finance (sources of cash?), Zone 5: SPECIAL-T (macro forces)." },
      { q: "When would you reach for SPECIAL-T in a case, and which letter is most often the hidden driver?", a: "Broad general strategy cases or when macro forces are clearly at play. T (Technology) is most often the hidden driver — disruption reshapes competitive landscapes faster than any other macro factor." },
    ],
  },
]

export const FRAMEWORK_IDS = FRAMEWORKS.map(f => f.id)
export const getFrameworkById = (id) => FRAMEWORKS.find(f => f.id === id)
