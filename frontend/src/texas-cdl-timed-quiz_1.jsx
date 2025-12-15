import React, { useState, useEffect, useCallback } from 'react';

// Questions sourced from uploaded handbook files and Texas Commercial Rules research
const questionBank = {
  "Texas Commercial Rules": [
    {
      question: "In Texas, the “Texas Commercial Rules” (Special Requirements) apply to:",
      options: [
        "Only out-of-state commercial drivers passing through Texas",
        "Only hazardous materials drivers",
        "All drivers of commercial motor vehicles operated on Texas highways",
        "Only school bus drivers"
      ],
      correct: 2,
      explanation: "The Special Requirements section applies to all commercial motor vehicles (CMVs) operating on Texas highways, not just certain endorsements."
    },
    {
      question: "In Texas, you must carry the current registration papers for your commercial vehicle:",
      options: [
        "Only when driving outside city limits",
        "Only if your vehicle is over 26,000 pounds GVWR",
        "Any time the vehicle is operated on a public road",
        "Only when hauling passengers"
      ],
      correct: 2,
      explanation: "Texas commercial rules require that registration papers be carried in the vehicle whenever it is operated on public roads."
    },
    {
      question: "A Texas commercial vehicle must stop at an open weigh station:",
      options: [
        "Only if hauling hazardous materials",
        "Only if over 10,000 pounds GVWR",
        "Whenever directed by signs or law enforcement",
        "Only if the driver is not on a tight schedule"
      ],
      correct: 2,
      explanation: "Texas law requires CMVs to enter and stop at open weigh stations when directed by signs or officials, regardless of load or schedule."
    },
    {
      question: "When must a Texas CMV have a current annual inspection certificate (sticker) displayed?",
      options: [
        "Only if the vehicle is driven outside of Texas",
        "Only if the vehicle is used for hire",
        "Whenever the vehicle is operated on a Texas highway",
        "Only when pulled over by law enforcement"
      ],
      correct: 2,
      explanation: "Texas commercial vehicles operated on state highways must have a current inspection and display proof as required."
    },
    {
      question: "In Texas, the maximum legal speed for a heavy truck or bus:",
      options: [
        "Is always 55 mph statewide",
        "May be lower than the posted car speed limit in some areas",
        "Is always the same as the passenger car limit",
        "Can be chosen by the driver based on conditions"
      ],
      correct: 1,
      explanation: "Some Texas highways have separate, lower speed limits for trucks and buses; CMV drivers must obey all special truck speed limits."
    },
    {
      question: "When must a Texas CMV driver stop at a railroad crossing, even if no train is visible?",
      options: [
        "Only when carrying passengers",
        "Only when carrying explosives or certain hazardous materials",
        "Only when required by a stop sign at the tracks",
        "Never, unless a train is approaching"
      ],
      correct: 1,
      explanation: "Rules require certain CMVs, such as those carrying specified hazardous materials, to stop at all railroad crossings."
    },
    {
      question: "The term “combination vehicle” under Texas commercial rules generally refers to:",
      options: [
        "Any vehicle with more than two axles",
        "A power unit (truck or tractor) towing one or more trailers",
        "Any pickup truck with a camper shell",
        "Only double- and triple-trailer rigs"
      ],
      correct: 1,
      explanation: "A combination vehicle consists of a power unit pulling one or more trailers or semitrailers."
    },
    {
      question: "Under Texas commercial rules, a vehicle that is NOT required to stop at a railroad crossing is:",
      options: [
        "A vehicle carrying chlorine gas",
        "A school bus with students on board",
        "A truck hauling general freight with no placards",
        "A vehicle carrying flammable liquids in bulk"
      ],
      correct: 2,
      explanation: "General freight vehicles with no placarded hazardous materials are usually not required to stop at all crossings, unless otherwise posted."
    },
    {
      question: "In Texas, a CMV must NOT be driven when its load:",
      options: [
        "Extends more than one foot beyond the rear",
        "Obscures the driver’s view to the front or sides",
        "Contains any loose material",
        "Weighs more than 5,000 pounds"
      ],
      correct: 1,
      explanation: "Commercial rules prohibit loads that block the driver’s safe view to the front or sides or interfere with control of the vehicle."
    },
    {
      question: "When must a Texas CMV display red flags or lights on a projecting load?",
      options: [
        "Whenever any cargo extends past the rear bumper",
        "Only at night if the load extends four feet or more beyond the rear",
        "When the load extends more than four feet beyond the rear or more than two feet beyond the sides",
        "Only when hauling pipe or poles"
      ],
      correct: 2,
      explanation: "Special requirements require visible warning flags in daylight and lights at night when cargo projects beyond specified distances."
    },
    {
      question: "Texas rules require mud flaps or splash guards on most commercial vehicles to:",
      options: [
        "Improve fuel economy",
        "Keep the vehicle cleaner",
        "Reduce spray and protect other road users from debris",
        "Support the rear bumper"
      ],
      correct: 2,
      explanation: "Splash guards are required to help control mud, water, and debris thrown by the tires."
    },
    {
      question: "A CMV that is “out of service” under Texas or federal rules:",
      options: [
        "May be driven to the next delivery point if close by",
        "Must not be driven until the defect is corrected",
        "May operate only during daylight hours",
        "Can operate only without cargo"
      ],
      correct: 1,
      explanation: "A vehicle placed out of service for safety defects cannot be driven again until repairs are completed."
    },
    {
      question: "Which of the following is TRUE about seat belt use under Texas commercial rules?",
      options: [
        "Only required on interstate highways",
        "Only required when carrying passengers",
        "Required for the driver whenever the vehicle is in motion",
        "Optional for experienced drivers"
      ],
      correct: 2,
      explanation: "CMV drivers must use seat belts whenever the vehicle is in motion, regardless of road type or load."
    },
    {
      question: "Texas commercial rules require that reflective triangles or flares be carried on most CMVs so that:",
      options: [
        "The vehicle can be legally parked overnight",
        "They can be used to mark a stopped vehicle on the roadway or shoulder",
        "The driver can signal for help in a city",
        "They can be used as wheel chocks"
      ],
      correct: 1,
      explanation: "Warning devices are required emergency equipment for marking a stopped or disabled commercial vehicle."
    },
    {
      question: "When must a Texas CMV driver use headlights, even in the daytime?",
      options: [
        "When visibility is less than 1,000 feet",
        "Whenever using windshield wipers",
        "Only in construction zones",
        "Only at dawn and dusk"
      ],
      correct: 0,
      explanation: "Texas law requires headlights when visibility is seriously reduced due to weather or conditions."
    },
    {
      question: "Under Texas rules, who is responsible for making sure a commercial vehicle is not overloaded and is properly secured?",
      options: [
        "Only the shipper",
        "Only the company safety officer",
        "The driver and, in many cases, the motor carrier",
        "Only the dock personnel"
      ],
      correct: 2,
      explanation: "The driver shares responsibility with the carrier to ensure the vehicle is within legal weight limits and the load is properly secured."
    },
    {
      question: "A Texas CMV must NOT be operated on a highway if:",
      options: [
        "It has more than five axles",
        "Any tire has exposed fabric or cord",
        "It has a diesel engine",
        "The fuel tank is more than half full"
      ],
      correct: 1,
      explanation: "Tires with exposed fabric or cord are unsafe and violate inspection and safety requirements."
    },
    {
      question: "In Texas, when a CMV is required to display hazardous materials placards, the placards must be:",
      options: [
        "Placed only on the rear of the vehicle",
        "Placed on the right side and rear only",
        "Placed on all four sides of the vehicle",
        "Optional if carrying less than a full load"
      ],
      correct: 2,
      explanation: "Hazardous materials placards must be visible on all four sides of the vehicle when required."
    },
    {
      question: "Texas commercial rules require that brakes on a CMV:",
      options: [
        "Be used only on hills",
        "Be able to stop and hold the vehicle safely on any grade it is operated",
        "Be adjusted only by a mechanic",
        "Be inspected only once a year"
      ],
      correct: 1,
      explanation: "Brakes must safely control and hold the vehicle on the grades on which it is operated."
    },
    {
      question: "Which statement about Texas commercial vehicle lighting is TRUE?",
      options: [
        "Clearance lamps are required on most wide or long CMVs",
        "Only one red tail lamp is required on any CMV",
        "CMVs do not need reflectors if they have working lights",
        "Marker lights are only required on trucks over 80,000 pounds GVWR"
      ],
      correct: 0,
      explanation: "Many CMVs must have clearance and marker lamps and reflectors to indicate their size at night or in low visibility."
    },
    {
      question: "Under Texas commercial rules, a CMV must NOT be operated when the load is:",
      options: [
        "Properly covered and secured",
        "Leaking, spilling, or blowing off the vehicle",
        "Evenly distributed over the axles",
        "Within legal weight and size limits"
      ],
      correct: 1,
      explanation: "It is illegal and unsafe to operate a CMV if the load is dropping, leaking, sifting, or blowing from the vehicle."
    },
    {
      question: "A Texas CMV driver who is involved in a collision on a public highway must:",
      options: [
        "Move the vehicle immediately, even if unsafe",
        "Only exchange insurance information",
        "Stop, render aid if possible, and report the crash as required by law",
        "Continue to the next exit and call from there"
      ],
      correct: 2,
      explanation: "Texas law requires drivers involved in crashes to stop, give aid when possible, and make any required reports."
    }
  ],

  "General Knowledge": [
    {
      question: "Whenever you stop for a break during your trip, you should:",
      options: ["Check tires, cargo, lights, and brakes", "Sleep for at least 30 minutes", "Call your dispatcher", "Only check fuel level"],
      correct: 0,
      explanation: "During rest stops, you should perform a walk-around inspection checking tires, cargo securement, lights, and brakes to ensure continued safe operation."
    },
    {
      question: "High beams should be:",
      options: ["Used only in cities", "Dimmed when within 500 feet of oncoming traffic", "Used at all times on the highway", "Never used on commercial vehicles"],
      correct: 1,
      explanation: "High beams should be dimmed when within 500 feet of oncoming vehicles to avoid blinding other drivers."
    },
    {
      question: "Which of the following is a key steering component?",
      options: ["Transmission", "Tie rod", "Drive shaft", "Differential"],
      correct: 1,
      explanation: "The tie rod is a key steering component that connects the steering gear to the wheels."
    },
    {
      question: "What is the average reaction distance?",
      options: ["25 feet", "60 feet at 55 mph", "100 feet", "150 feet"],
      correct: 1,
      explanation: "At 55 mph, the average reaction distance is approximately 60 feet - the distance traveled while your brain processes what you see."
    },
    {
      question: "The most common cause of serious vehicle skids is:",
      options: ["Worn tires", "Driving too fast for conditions", "Bad brakes", "Overloaded vehicle"],
      correct: 1,
      explanation: "Driving too fast for conditions is the most common cause of serious skids. Always adjust speed for road and weather conditions."
    },
    {
      question: "The distance that you should look ahead of your vehicle while driving amounts to about _____ at highway speed.",
      options: ["5 seconds", "12-15 seconds", "30 seconds", "1 minute"],
      correct: 1,
      explanation: "At highway speeds, you should look ahead 12-15 seconds, which equals about a quarter mile. This gives you time to identify hazards."
    },
    {
      question: "If you are convicted for driving under the influence while driving a commercial vehicle, and this is your first offense, you will most likely get:",
      options: ["A warning", "A one-year disqualification of your CDL", "A permanent ban", "A 30-day suspension"],
      correct: 1,
      explanation: "A first DUI offense in a commercial vehicle results in a one-year CDL disqualification, or three years if hauling hazmat."
    },
    {
      question: "Front end header boards:",
      options: ["Are required on all trucks", "Protect the driver from shifting cargo", "Are only decorative", "Must be removed when empty"],
      correct: 1,
      explanation: "Front end header boards (headache racks) protect the driver from cargo shifting forward during sudden stops or collisions."
    },
    {
      question: "The new BAC (blood alcohol concentration) limit for commercial drivers to be considered intoxicated when driving a commercial vehicle is:",
      options: ["0.08%", "0.04%", "0.02%", "0.00%"],
      correct: 1,
      explanation: "Commercial drivers are considered intoxicated at 0.04% BAC - half the limit for regular drivers (0.08%)."
    },
    {
      question: "Your vehicle is in a traffic emergency and may collide with another vehicle if you do not act. Which of these is a good rule to remember?",
      options: ["Heavy vehicles can always stop faster", "You can almost always turn to miss an obstacle quicker than you can stop", "Hitting something is always better than going off the road", "Lock the brakes and hold"],
      correct: 1,
      explanation: "You can usually steer to avoid an obstacle faster than you can stop, especially at highway speeds. Steering requires less distance than stopping."
    },
    {
      question: "What should you do when your vehicle hydroplanes?",
      options: ["Accelerate to get through it", "Release the accelerator and push in the clutch", "Brake hard", "Turn sharply"],
      correct: 1,
      explanation: "When hydroplaning, release the accelerator and push in the clutch. Do not brake. Let the vehicle slow down and regain traction."
    },
    {
      question: "You are traveling down a long, steep hill. Your brakes get so hot that they fail. What should you do?",
      options: ["Pump the brakes rapidly", "Look for an escape ramp or other escape route", "Shift into neutral", "Turn off the engine"],
      correct: 1,
      explanation: "If brakes fail on a downgrade, look for an escape ramp. These are designed to stop runaway vehicles safely."
    },
    {
      question: "You should stop driving:",
      options: ["Only when you reach your destination", "Whenever you become sleepy", "Only at designated rest stops", "Every hour regardless"],
      correct: 1,
      explanation: "You should stop driving whenever you feel sleepy. Fatigue impairs judgment and reaction time as much as alcohol."
    },
    {
      question: "There are three types of vehicle inspections, which one is one of them?",
      options: ["Monthly inspection", "Pre-trip inspection", "Quarterly inspection", "Annual inspection only"],
      correct: 1,
      explanation: "The three types are: pre-trip (before driving), en-route (during trip), and post-trip (after trip) inspections."
    },
    {
      question: "Inspect your cargo after you have driven:",
      options: ["500 miles", "Within the first 50 miles, then every 150 miles or 3 hours", "Only at destination", "Once per day"],
      correct: 1,
      explanation: "Check cargo within the first 50 miles, then every 150 miles or every 3 hours of driving, whichever comes first."
    },
    {
      question: "Which of these can cause a fire?",
      options: ["Under-inflated tires", "Over-inflated tires", "New tires", "Retreaded tires only"],
      correct: 0,
      explanation: "Under-inflated tires can overheat and catch fire due to excessive flexing and friction."
    },
    {
      question: "You are checking your brakes and suspension system for a pre-trip inspection. Which of these statements is true?",
      options: ["Brake shoes should have oil on them", "Brake linings should not be worn thin", "Spring hangers can be cracked", "Missing brake drums are acceptable"],
      correct: 1,
      explanation: "Brake linings must not be worn dangerously thin. Thin linings reduce braking effectiveness significantly."
    },
    {
      question: "What is the proper way to hold the steering wheel?",
      options: ["At the 12 o'clock position", "At opposite sides of the wheel", "At the bottom of the wheel", "With one hand only"],
      correct: 1,
      explanation: "Hold the steering wheel at opposite sides (9 and 3 o'clock or 10 and 2 o'clock) for maximum control."
    },
    {
      question: "How do you correct a rear wheel acceleration skid?",
      options: ["Brake hard", "Stop accelerating and turn into the skid", "Accelerate more", "Turn away from the skid"],
      correct: 1,
      explanation: "For a rear wheel skid, stop accelerating and steer in the direction you want to go (turn into the skid)."
    },
    {
      question: "Which of these is a good rule to follow when using a fire extinguisher?",
      options: ["Stand upwind and aim at the base of the fire", "Stand downwind and aim at the flames", "Empty the entire extinguisher immediately", "Stand as close as possible"],
      correct: 0,
      explanation: "Stand upwind so smoke and chemicals blow away from you, and aim at the base of the fire where the fuel is."
    },
    {
      question: "Where or when should you test the stopping action of your service brakes?",
      options: ["On a steep downgrade", "When traveling at highway speed", "Right after the vehicle starts moving", "Only at a brake shop"],
      correct: 2,
      explanation: "Test brakes right after starting to move. Drive slowly and apply brakes to check for pulling or delayed stopping."
    },
    {
      question: "When should you wear seat belts?",
      options: ["Only on highways", "Only when driving at high speeds", "Always when driving", "Only when carrying passengers"],
      correct: 2,
      explanation: "Federal regulations require commercial drivers to wear seat belts at all times when driving."
    },
    {
      question: "What would you use to put out a gasoline fire?",
      options: ["Water", "B:C type extinguisher", "A fire blanket only", "Sand only"],
      correct: 1,
      explanation: "Use a B:C rated fire extinguisher for gasoline and other flammable liquid fires. Never use water on a fuel fire."
    },
    {
      question: "When driving a commercial vehicle with a height over 13 feet you should:",
      options: ["Drive faster to reduce wind resistance", "Know the heights of bridges and overpasses on your route", "Only drive at night", "Remove the mirrors"],
      correct: 1,
      explanation: "You must know overhead clearances on your route. Striking bridges or overpasses can cause serious damage and injuries."
    },
    {
      question: "You must inspect your cargo:",
      options: ["Only before starting", "Before starting and periodically during the trip", "Only at the destination", "Once a week"],
      correct: 1,
      explanation: "Cargo must be inspected before starting, within 50 miles, and every 150 miles or 3 hours thereafter."
    },
    {
      question: "Stab braking:",
      options: ["Should be used on vehicles with ABS", "Involves locking the brakes then releasing when wheels lock", "Is the same as controlled braking", "Should never be used"],
      correct: 1,
      explanation: "Stab braking involves applying brakes fully until wheels lock, releasing to let them roll, then applying again. Don't use on ABS vehicles."
    },
    {
      question: "If you are being tailgated, you should:",
      options: ["Speed up", "Increase your following distance from the vehicle ahead", "Brake suddenly to warn them", "Ignore them"],
      correct: 1,
      explanation: "Increase your following distance to give yourself more time to stop gradually, reducing the chance the tailgater will hit you."
    },
    {
      question: "If you are confronted by an aggressive driver, what should you do?",
      options: ["Challenge them back", "Avoid eye contact and do not react", "Stop your vehicle immediately", "Speed up to get away"],
      correct: 1,
      explanation: "Avoid eye contact, don't react to gestures, and stay calm. Do not engage with aggressive drivers."
    },
    {
      question: "What is a common cause of tire fires?",
      options: ["Cold weather", "Under-inflated or flat tires run too long", "Over-inflated tires", "New tires"],
      correct: 1,
      explanation: "Under-inflated or flat tires generate excessive heat from friction and can catch fire if driven on too long."
    },
    {
      question: "Do empty trucks have the best braking?",
      options: ["Yes, always", "No, empty trucks require more stopping distance on slippery roads", "Yes, on wet roads", "Only at high speeds"],
      correct: 1,
      explanation: "Empty trucks can have worse braking on slippery roads because they have less traction due to reduced weight on the drive wheels."
    },
    {
      question: "How far ahead should you look while driving?",
      options: ["As far as your headlights shine", "12-15 seconds", "5 seconds", "30 seconds"],
      correct: 1,
      explanation: "Look 12-15 seconds ahead - about a quarter mile at highway speeds - to identify hazards early."
    },
    {
      question: "Total stopping distance equals:",
      options: ["Braking distance only", "Perception distance + reaction distance + braking distance", "Reaction distance + braking distance", "Speed times 2"],
      correct: 1,
      explanation: "Total stopping distance = perception distance + reaction distance + braking distance. All three factors combine."
    },
    {
      question: "Convex (curved) mirrors:",
      options: ["Show objects larger than they are", "Show a wider area but make objects appear smaller and farther away", "Are not allowed on commercial vehicles", "Only work at night"],
      correct: 1,
      explanation: "Convex mirrors provide a wider field of view but make objects appear smaller and farther than they actually are."
    },
    {
      question: "How many red reflective triangles should you carry?",
      options: ["1", "2", "3", "4"],
      correct: 2,
      explanation: "You must carry at least 3 red reflective triangles for emergency use when stopped on the roadway."
    },
    {
      question: "A major cause of fatal crashes is:",
      options: ["Vehicle defects", "Weather conditions", "Driver fatigue", "Road construction"],
      correct: 2,
      explanation: "Driver fatigue is a major cause of fatal crashes. Never drive when tired - pull over and rest."
    },
    {
      question: "Truck escape ramps:",
      options: ["Are designed for cars only", "Are designed to slow runaway vehicles safely without injury", "Should never be used", "Are only in mountainous areas"],
      correct: 1,
      explanation: "Escape ramps are designed to stop runaway vehicles safely using loose gravel or an uphill grade."
    },
    {
      question: "What effects can wet brakes cause?",
      options: ["Improved stopping", "Grabbing, uneven braking, or no braking at all", "No effect", "Only affect disc brakes"],
      correct: 1,
      explanation: "Wet brakes can cause weak braking, uneven braking, or grabbing. Dry them by applying light pressure while driving slowly."
    },
    {
      question: "The distance that you should scan ahead in a congested area is about:",
      options: ["1 block or 12-15 seconds", "5 seconds", "30 seconds", "1 mile"],
      correct: 0,
      explanation: "In congested urban areas, scan at least one block or 12-15 seconds ahead to identify hazards."
    },
    {
      question: "The minimum tire tread depth for front tires is:",
      options: ["2/32 inch", "4/32 inch", "6/32 inch", "8/32 inch"],
      correct: 1,
      explanation: "Front (steering) tires must have at least 4/32 inch tread depth. Other tires need 2/32 inch minimum."
    },
    {
      question: "An antilock braking system (ABS) will:",
      options: ["Always decrease stopping distance", "Help maintain steering control during hard braking", "Replace regular brakes", "Work without regular brakes"],
      correct: 1,
      explanation: "ABS helps you maintain steering control during hard braking by preventing wheel lockup. It doesn't necessarily reduce stopping distance."
    },
    {
      question: "Which of the following statements about retarders is correct?",
      options: ["They should be turned on at all times", "When your drive wheels have poor traction, turn off the retarder", "They only work on wet roads", "They replace service brakes"],
      correct: 1,
      explanation: "Turn off retarders when traction is poor (wet, icy roads) to prevent drive wheel skids."
    },
    {
      question: "What is hydroplaning?",
      options: ["When brakes get wet", "When tires lose contact with the road and ride on a layer of water", "When the engine overheats", "When cargo shifts"],
      correct: 1,
      explanation: "Hydroplaning occurs when tires ride on a layer of water and lose contact with the road surface, causing loss of control."
    },
    {
      question: "Cargo should have at least one tie down for each:",
      options: ["5 feet of cargo", "10 feet of cargo or fraction thereof", "15 feet of cargo", "20 feet of cargo"],
      correct: 1,
      explanation: "Use at least one tie down for every 10 feet of cargo, with a minimum of two tie downs regardless of length."
    },
    {
      question: "A key principle in balancing cargo weight is to keep the load:",
      options: ["To the rear of the trailer", "To the front of the trailer", "Balanced and as low as possible", "As high as possible"],
      correct: 2,
      explanation: "Keep cargo weight balanced side-to-side and as low as possible to maintain a stable center of gravity."
    },
    {
      question: "The parking brake should be tested while the vehicle is:",
      options: ["Moving at highway speed", "Parked and secured", "Stopped", "In neutral and rolling"],
      correct: 2,
      explanation: "Test the parking brake by setting it and gently trying to pull forward in a low gear to ensure it holds."
    },
    {
      question: "Medical certificates must be renewed every:",
      options: ["6 months", "1 year", "2 years", "5 years"],
      correct: 2,
      explanation: "Medical certificates for CDL holders must be renewed every 2 years, or more frequently if required by your medical condition."
    },
    {
      question: "Which of these statements about overhead clearance is true?",
      options: ["The weight of cargo changes clearance height", "Posted heights are always accurate", "You should assume heights are accurate", "You don't need to check heights if you've used the route before"],
      correct: 0,
      explanation: "Cargo weight affects vehicle height due to suspension compression. Repaving also changes clearance. Always verify clearance."
    },
    {
      question: "Why should you use a helper when backing?",
      options: ["It's required by law", "Because you cannot see everything behind you", "Helpers are faster", "Only in parking lots"],
      correct: 1,
      explanation: "Use a helper because you have large blind spots when backing. The helper can see areas you cannot."
    },
    {
      question: "What is the definition of a hazard?",
      options: ["A traffic light", "Any road condition or road user that is a possible danger", "A stop sign", "A railroad crossing"],
      correct: 1,
      explanation: "A hazard is any road condition or road user (driver, bicyclist, pedestrian) that presents a possible danger."
    }
  ],
  
  "Air Brakes": [
    {
      question: "Oil and water usually collect in compressed air tanks. If you do not have an automatic tank drain, when should you drain the air tanks?",
      options: ["Once a week", "At the end of each day of driving", "Once a month", "Only when warning light comes on"],
      correct: 1,
      explanation: "Drain air tanks at the end of each day to remove moisture and oil. Water in air lines can freeze and cause brake failure."
    },
    {
      question: "The brake system that applies and releases the brakes when the driver uses the brake pedal is the:",
      options: ["Parking brake system", "Service brake system", "Emergency brake system", "Spring brake system"],
      correct: 1,
      explanation: "The service brake system is used for normal braking when you press the brake pedal."
    },
    {
      question: "To make an emergency stop with air brakes, using the stab braking method, you should:",
      options: ["Pump the brakes rapidly", "Apply brakes hard until wheels lock, release until they roll, repeat", "Hold brakes steadily", "Use parking brake only"],
      correct: 1,
      explanation: "Stab braking involves applying brakes fully until wheels lock, releasing to allow rolling, then applying again. Don't use on ABS."
    },
    {
      question: "If your vehicle has an alcohol evaporator, it is there to:",
      options: ["Improve fuel economy", "Reduce ice in air brake valves and lines", "Cool the brakes", "Clean the air tanks"],
      correct: 1,
      explanation: "Alcohol evaporators put alcohol into the air system to help prevent ice from forming in air brake valves in cold weather."
    },
    {
      question: "The braking power of the spring brakes:",
      options: ["Is not affected by brake adjustment", "Depends on the brake adjustment", "Only works when moving", "Is always the same"],
      correct: 1,
      explanation: "Spring brake effectiveness depends on proper brake adjustment. Poorly adjusted brakes won't hold as well."
    },
    {
      question: "If your vehicle has a properly functioning dual air brake system and minimum-sized air tanks, the air pressure should build from 85 to 100 psi within ____ seconds.",
      options: ["30", "45", "60", "90"],
      correct: 1,
      explanation: "Air pressure should build from 85 to 100 psi within 45 seconds with the engine at a fast idle."
    },
    {
      question: "The air compressor will stop pumping air into the air tanks at ____ psi.",
      options: ["100", "125", "150", "175"],
      correct: 1,
      explanation: "The governor cuts out the compressor at approximately 125 psi (range 120-145 psi depending on manufacturer)."
    },
    {
      question: "Excessive heat caused by overuse of the service brakes can cause:",
      options: ["Brake fade", "Increased braking power", "Better stopping", "Improved control"],
      correct: 0,
      explanation: "Excessive brake heat causes brake fade - reduced braking power due to chemical changes in the linings and drum expansion."
    },
    {
      question: "A typical air brake system is fully charged at:",
      options: ["60 psi", "90 psi", "100-125 psi", "150 psi"],
      correct: 2,
      explanation: "A typical air brake system operates between 100-125 psi, with the governor cutting out around 125 psi."
    },
    {
      question: "During normal driving, spring brakes are usually held back by:",
      options: ["A mechanical lever", "Hydraulic fluid", "Air pressure", "The brake pedal"],
      correct: 2,
      explanation: "Air pressure holds the spring brakes back during normal driving. When air pressure drops too low, springs apply the brakes."
    },
    {
      question: "Air brakes use _________ to make the brakes work.",
      options: ["Hydraulic fluid", "Compressed air", "Electricity", "Engine vacuum"],
      correct: 1,
      explanation: "Air brakes use compressed air to push brake pads against drums or rotors to slow the vehicle."
    },
    {
      question: "The air compressor governor controls:",
      options: ["Brake pressure to the wheels", "When the compressor pumps air into the tanks", "The parking brake", "Engine speed"],
      correct: 1,
      explanation: "The governor controls the compressor's cut-in (about 100 psi) and cut-out (about 125 psi) pressures."
    },
    {
      question: "The driver must be able to see a warning before air pressure in the service air tanks falls below:",
      options: ["40 psi", "50 psi", "60 psi", "80 psi"],
      correct: 2,
      explanation: "The low air pressure warning must activate before pressure drops below 60 psi in either air tank."
    },
    {
      question: "The most common type of foundation brakes found on heavy vehicles is the:",
      options: ["Disc brake", "S-cam drum brake", "Wedge brake", "Hydraulic brake"],
      correct: 1,
      explanation: "S-cam drum brakes are the most common type of foundation brake on heavy commercial vehicles."
    },
    {
      question: "When driving down a long steep hill you should:",
      options: ["Use only the parking brake", "Use a low gear and proper braking technique", "Coast in neutral", "Use high gear and heavy braking"],
      correct: 1,
      explanation: "Use a low gear and apply brakes just enough to feel a definite slowdown, then release. Repeat as needed."
    },
    {
      question: "Spring brakes are:",
      options: ["Applied by air pressure", "Held back by air pressure and apply when air is released", "Only used for parking", "Not affected by air pressure"],
      correct: 1,
      explanation: "Spring brakes use powerful springs held back by air. When air pressure drops (20-45 psi), the springs apply the brakes."
    },
    {
      question: "Under ideal conditions, the average driver of a truck or bus equipped with air brakes and traveling at 55 mph would require what stopping distance?",
      options: ["100 feet", "200 feet", "Over 300 feet", "500 feet"],
      correct: 2,
      explanation: "At 55 mph, total stopping distance for air brakes is over 300 feet (perception + reaction + brake lag + braking distance)."
    },
    {
      question: "If your vehicle has an alcohol evaporator, every day during cold weather you should:",
      options: ["Disconnect it", "Check and fill the alcohol level", "Turn it off", "Ignore it"],
      correct: 1,
      explanation: "Check and fill the alcohol level daily in cold weather to ensure it can prevent ice in the air system."
    },
    {
      question: "Slack adjusters should not have more than _____ of play.",
      options: ["1/2 inch", "1 inch", "2 inches", "3 inches"],
      correct: 1,
      explanation: "Slack adjuster free play should be about 1 inch or less. More indicates brakes need adjustment."
    },
    {
      question: "Vehicles with air brakes must have:",
      options: ["ABS only", "A low air pressure warning signal", "Hydraulic backup", "Manual brake adjustment only"],
      correct: 1,
      explanation: "All vehicles with air brakes must have a low air pressure warning signal (light and buzzer) that activates below 60 psi."
    },
    {
      question: "Air loss in a straight truck or bus should not be more than _____ with the engine off and the brakes applied.",
      options: ["1 psi per minute", "3 psi per minute", "5 psi per minute", "10 psi per minute"],
      correct: 1,
      explanation: "With brakes applied, air loss should not exceed 3 psi per minute for single vehicles (4 psi for combinations)."
    },
    {
      question: "A straight truck or bus air brake system should not leak at a rate of more than ____ psi per minute with the engine off and the brakes released.",
      options: ["1 psi", "2 psi", "3 psi", "4 psi"],
      correct: 1,
      explanation: "With brakes released, air loss should not exceed 2 psi per minute for single vehicles (3 psi for combinations)."
    },
    {
      question: "Air braking takes more time than hydraulic braking because air brakes:",
      options: ["Have larger drums", "Use bigger shoes", "Have brake lag (time for air to flow through lines)", "Are always wet"],
      correct: 2,
      explanation: "Brake lag - the time for air to flow through the lines - adds about half a second to stopping time versus hydraulic brakes."
    },
    {
      question: "The safety release valve will blow at _____ psi?",
      options: ["100", "125", "150", "200"],
      correct: 2,
      explanation: "The safety valve protects the tank from overpressure by releasing air if pressure exceeds about 150 psi."
    },
    {
      question: "What are spring brakes?",
      options: ["Brakes powered by coil springs that apply when air pressure drops", "Extra strong service brakes", "Hydraulic backup brakes", "Manual emergency brakes"],
      correct: 0,
      explanation: "Spring brakes use powerful springs held back by air pressure. They apply automatically when air pressure drops to 20-45 psi."
    }
  ],
  
  "Passenger": [
    {
      question: "You must stop your bus between:",
      options: ["5 and 10 feet from railroad tracks", "15 and 50 feet from railroad tracks", "50 and 100 feet from railroad tracks", "100 and 200 feet from railroad tracks"],
      correct: 1,
      explanation: "Buses must stop between 15 and 50 feet from the nearest rail at railroad crossings."
    },
    {
      question: "You need to evacuate your bus in an emergency. Passengers should be directed to a safe place no less than _____ feet from the bus.",
      options: ["50", "100", "200", "500"],
      correct: 1,
      explanation: "In an emergency evacuation, move passengers at least 100 feet away from the bus for safety."
    },
    {
      question: "Your bus is disabled. The bus, with riders aboard, may be towed or pushed to a safe place only:",
      options: ["At any time", "If the distance to safety is less than a quarter mile", "If getting off would be unsafe", "Never with passengers aboard"],
      correct: 2,
      explanation: "A disabled bus with passengers may only be towed or pushed to safety if disembarking passengers would be more dangerous."
    },
    {
      question: "If you have riders aboard, you must never fuel your bus:",
      options: ["At a truck stop", "In an enclosed building with riders aboard", "During the day", "At a gas station"],
      correct: 1,
      explanation: "Never fuel a bus with passengers aboard in an enclosed building due to fire and fume hazards."
    },
    {
      question: "Carry-on baggage cannot be stored:",
      options: ["Under seats", "In overhead bins", "In a doorway or aisle", "In the luggage compartment"],
      correct: 2,
      explanation: "Baggage must never block the aisle or emergency exits. Store it in approved locations only."
    },
    {
      question: "Buses may have recapped or re-grooved tires:",
      options: ["On any axle", "Only on drive axles", "Never", "Only on the front axle"],
      correct: 1,
      explanation: "Recapped or re-grooved tires may only be used on drive axles of buses, never on front steering axles."
    },
    {
      question: "The standee line is:",
      options: ["Where passengers stand to exit", "A two-inch line on the floor showing where passengers cannot stand forward of", "The line for boarding", "Where wheelchair passengers sit"],
      correct: 1,
      explanation: "The standee line shows the area forward of which passengers are not allowed to stand while the bus is in motion."
    },
    {
      question: "At the end of each shift you should:",
      options: ["Just park and leave", "Complete a post-trip inspection and written report", "Only check fuel", "Lock the bus only"],
      correct: 1,
      explanation: "Complete a thorough post-trip inspection and fill out a written vehicle condition report at the end of each shift."
    },
    {
      question: "Bus accidents often happen:",
      options: ["On highways", "At bus stops during loading and unloading", "At night only", "In parking lots"],
      correct: 1,
      explanation: "Many bus accidents occur at bus stops during passenger loading and unloading. Extra caution is needed at these times."
    },
    {
      question: "When stopping for railroad tracks, you must stop no closer than how many feet before the nearest track?",
      options: ["5 feet", "10 feet", "15 feet", "25 feet"],
      correct: 2,
      explanation: "Stop no closer than 15 feet from the nearest rail. This provides a safety margin and good visibility."
    },
    {
      question: "At drawbridges with no signal you must stop at least:",
      options: ["25 feet before the draw", "50 feet before the draw", "100 feet before the draw", "You don't have to stop"],
      correct: 1,
      explanation: "At drawbridges with no signal, stop at least 50 feet before the draw of the bridge."
    },
    {
      question: "A bus may carry baggage or freight only if it is secured so that:",
      options: ["It looks neat", "Riders are protected and it doesn't restrict movement or emergency exit access", "The driver can see it", "It's under 100 pounds"],
      correct: 1,
      explanation: "Baggage and freight must be secured to protect passengers and must not block aisles or emergency exits."
    },
    {
      question: "Prohibited practices on the bus include:",
      options: ["Talking to passengers", "Fueling with passengers aboard in an enclosed area", "Using the radio", "Opening windows"],
      correct: 1,
      explanation: "Never fuel a bus with passengers aboard in an enclosed building due to fire and toxic fume hazards."
    },
    {
      question: "You may sometimes haul small arms ammunition, emergency shipments of drugs, or hospital supplies on a bus. The total weight of all such hazardous materials must not be greater than _____ pounds.",
      options: ["100", "250", "500", "1000"],
      correct: 2,
      explanation: "Limited quantities of certain hazardous materials (ammunition, drugs, hospital supplies) may be carried if total weight is 500 lbs or less."
    },
    {
      question: "How are buses to handle most railroad grade crossings?",
      options: ["Slow down but don't stop", "Stop, look, listen, then proceed when safe", "Cross quickly without stopping", "Only stop if a train is visible"],
      correct: 1,
      explanation: "Buses must stop at all railroad crossings (unless exempt), look and listen for trains, then proceed when safe."
    },
    {
      question: "If a passenger is drunk or disruptive, you may:",
      options: ["Put them off anywhere", "Refuse to let them board or discharge them at the next scheduled stop", "Call police while driving", "Ignore them"],
      correct: 1,
      explanation: "You may refuse boarding or discharge disruptive passengers at the next scheduled stop, ensuring their safety."
    },
    {
      question: "Which of the following types of cargo can never be carried on a bus with riders?",
      options: ["Luggage", "Class 6 poison or tear gas", "Food", "Medical supplies"],
      correct: 1,
      explanation: "Division 2.3 poison gas, liquid Class 6 poison, tear gas, and irritating materials can never be carried with passengers."
    },
    {
      question: "Which of the following must be closed while the bus is in motion?",
      options: ["Only the front door", "All windows", "All doors and emergency exits", "Only the rear door"],
      correct: 2,
      explanation: "All doors and emergency exits must be closed while the bus is moving to prevent passengers from falling out."
    },
    {
      question: "If your bus leans toward the outside on a banked curve, you are:",
      options: ["At the right speed", "Going too slow", "Driving too fast", "Driving correctly"],
      correct: 2,
      explanation: "If the bus leans outward on a curve, you're going too fast for the curve. Slow down before the curve."
    },
    {
      question: "While crossing railroad tracks, you should _________ if your bus has a manual transmission.",
      options: ["Shift to a higher gear", "Not change gears while any part of the vehicle is on the tracks", "Shift to neutral", "Use the clutch to control speed"],
      correct: 1,
      explanation: "Never change gears while crossing tracks. Shifting could cause you to stall on the tracks."
    }
  ],
  
  "School Bus": [
    {
      question: "What do the red flashing lights on an eight-light system bus signify to other drivers?",
      options: ["The bus is about to stop", "The bus is stopped and loading/unloading - traffic must stop", "The bus is turning", "The bus is disabled"],
      correct: 1,
      explanation: "Red flashing lights and the stop arm mean the bus is stopped for loading/unloading and all traffic must stop."
    },
    {
      question: "How far prior to a bus pick up location must the amber warning lights be turned on?",
      options: ["100 feet", "200 feet", "At least 300 feet (varies by state)", "500 feet"],
      correct: 2,
      explanation: "Activate amber warning lights at least 300 feet before the stop (may vary by state law) to alert traffic."
    },
    {
      question: "The left and right danger zones extend up to _______ from the left and right sides of the school bus.",
      options: ["5 feet", "10 feet", "15 feet", "20 feet"],
      correct: 1,
      explanation: "The danger zones extend approximately 10 feet from both sides of the bus where students are at greatest risk."
    },
    {
      question: "The blind spot behind the bus may extend up to ________, depending on the length and width of the bus.",
      options: ["50 feet", "200 feet", "400 feet", "100 feet"],
      correct: 2,
      explanation: "The blind spot behind a school bus can extend up to 400 feet depending on bus size. Never back up if avoidable."
    },
    {
      question: "When can you put a misbehaving student off the bus?",
      options: ["Anywhere safe", "Only at their home or school", "At any bus stop", "Never - you cannot remove students"],
      correct: 1,
      explanation: "Never put a student off the bus except at school or their designated stop. Leaving them elsewhere is dangerous."
    },
    {
      question: "Why is it so critical for you to understand the loading and unloading procedures?",
      options: ["To save time", "Because more students are killed while loading/unloading than riding the bus", "To follow schedules", "For driver convenience"],
      correct: 1,
      explanation: "More students are killed getting on or off school buses than riding inside. Loading/unloading is the most dangerous time."
    },
    {
      question: "An active railroad crossing is:",
      options: ["One with no signals", "One with signals, gates, or other traffic control devices", "An abandoned crossing", "A private crossing"],
      correct: 1,
      explanation: "Active crossings have traffic control devices like flashing lights, bells, or gates to warn of approaching trains."
    },
    {
      question: "The front danger zone extends up to ________ from the front bumper of the school bus.",
      options: ["5 feet", "10 feet", "12 feet", "15 feet"],
      correct: 2,
      explanation: "The front danger zone extends about 12 feet from the front bumper. Children in this area may not be visible."
    },
    {
      question: "Which mirrors let you view the front danger zone?",
      options: ["Flat mirrors", "Convex mirrors", "Crossover mirrors", "Interior mirror"],
      correct: 2,
      explanation: "Crossover mirrors are mounted at the front corners and show the danger zone directly in front of the bus."
    },
    {
      question: "You MUST evacuate everyone from your school bus if:",
      options: ["It's raining", "There is a fire or danger of fire", "A student is sick", "You're running late"],
      correct: 1,
      explanation: "Evacuate when there's fire, danger of fire, the bus is in an unsafe position, or remaining would be more dangerous."
    },
    {
      question: "If a railroad crossing signal is malfunctioning, you should:",
      options: ["Cross quickly", "Stop, contact your dispatcher, and do not cross until you get further instructions", "Ignore it and cross normally", "Wait for a train"],
      correct: 1,
      explanation: "If signals malfunction, stop and contact your dispatcher. Do not cross until you receive specific instructions."
    },
    {
      question: "At a railroad crossing, you must stop at the stop line. If there is no stop line, you must stop:",
      options: ["5-10 feet from the tracks", "15-50 feet from the nearest rail", "50-100 feet from the tracks", "On the tracks"],
      correct: 1,
      explanation: "Stop between 15 and 50 feet from the nearest rail for safety and visibility."
    },
    {
      question: "When loading or unloading students, you should check your mirrors:",
      options: ["Once before starting", "Only when pulling away", "Continuously before, during, and after", "Only if you hear noise"],
      correct: 2,
      explanation: "Check all mirrors continuously throughout loading/unloading to monitor student locations and approaching hazards."
    },
    {
      question: "When is the most dangerous time during a bus ride?",
      options: ["On the highway", "During loading and unloading", "At night", "In bad weather"],
      correct: 1,
      explanation: "Loading and unloading is the most dangerous time because students are in the danger zone near traffic."
    },
    {
      question: "While you're loading students, if you cannot account for a student, what should you do?",
      options: ["Drive away", "Secure the bus, take the key, and search around and under the bus", "Honk the horn", "Ask other students"],
      correct: 1,
      explanation: "If you can't account for a student, secure the bus, take your key, and physically check around and under the bus."
    },
    {
      question: "In an emergency, you MUST evacuate everyone from your school bus:",
      options: ["Only during drills", "If there is a fire hazard, unsafe position, or imminent danger of collision", "At every stop", "Only when told by radio"],
      correct: 1,
      explanation: "Evacuate when there's fire, danger of fire, unsafe position (like on train tracks), or other imminent danger."
    },
    {
      question: "Students who must cross in front of the bus after exiting should:",
      options: ["Run quickly across", "Walk at least 10 feet in front of the bus and wait for driver's signal", "Cross behind the bus", "Not wait for any signal"],
      correct: 1,
      explanation: "Students must walk at least 10 feet in front of the bus where the driver can see them and wait for the signal to cross."
    },
    {
      question: "What is the 'golden rule' for school buses when approaching and crossing railroad tracks?",
      options: ["Go fast", "Stop, look, listen, and don't proceed until safe", "Only stop if lights are flashing", "Honk your horn"],
      correct: 1,
      explanation: "Always stop, look both directions, listen for trains, and never proceed until you're absolutely certain it's safe."
    },
    {
      question: "In addition to spare electrical fuses (if equipped), three red reflective triangles, and a working fire extinguisher, emergency equipment for a school bus includes:",
      options: ["A toolbox", "First aid kit and body fluid cleanup kit", "Extra fuel", "A cell phone charger"],
      correct: 1,
      explanation: "Required emergency equipment includes fuses, triangles, fire extinguisher, first aid kit, and body fluid cleanup kit."
    },
    {
      question: "What do Anti-Lock Brakes (ABS) do?",
      options: ["Stop you faster", "Help maintain steering control during hard braking", "Apply brakes automatically", "Replace regular brakes"],
      correct: 1,
      explanation: "ABS prevents wheel lockup during hard braking, helping you maintain steering control. It doesn't necessarily stop you faster."
    }
  ]
};

// All tests are untimed; timeLimit is null for each
const testConfig = {
  "Texas Commercial Rules": { timeLimit: null, questionCount: 22, passingScore: 80 },
  "General Knowledge": { timeLimit: null, questionCount: 50, passingScore: 80 },
  "Air Brakes": { timeLimit: null, questionCount: 25, passingScore: 80 },
  "Passenger": { timeLimit: null, questionCount: 20, passingScore: 80 },
  "School Bus": { timeLimit: null, questionCount: 20, passingScore: 80 }
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const CDLTimedQuiz = () => {
  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [testResults, setTestResults] = useState({});

  const startTest = useCallback((testName) => {
    const config = testConfig[testName];
    const allQuestions = questionBank[testName];
    const selectedQuestions = shuffleArray(allQuestions).slice(0, config.questionCount);
    
    setCurrentTest(testName);
    setQuestions(selectedQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setTimeRemaining(config.timeLimit ?? 0);
    setTestComplete(false);
    setShowReview(false);
  }, []);

  const finishTest = useCallback(() => {
    const correct = Object.entries(answers).filter(
      ([idx, ans]) => questions[parseInt(idx)]?.correct === ans
    ).length;
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= testConfig[currentTest].passingScore;

    setTestResults({ correct, total, percentage, passed });
    setTestComplete(true);
  }, [answers, questions, currentTest]);

  useEffect(() => {
    // Untimed tests: no countdown needed
  }, [timeRemaining, currentTest, testComplete, finishTest]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (index) => {
    // Lock in the first answer for each question so incorrect answers are recorded immediately
    if (answers[currentQuestion] !== undefined) return;
    setSelectedAnswer(index);
    setAnswers((prev) => ({ ...prev, [currentQuestion]: index }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1] ?? null);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
    }
  };

  const goToQuestion = (idx) => {
    setCurrentQuestion(idx);
    setSelectedAnswer(answers[idx] ?? null);
  };

  const resetQuiz = () => {
    setCurrentTest(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setTimeRemaining(0);
    setTestComplete(false);
    setShowReview(false);
    setTestResults({});
  };

  // Test Selection Screen
  if (!currentTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
              Texas CDL Practice Tests
            </h1>
            <p className="text-slate-400 text-lg">Class B CLP • Commercial Rules • Passenger • School Bus • Air Brakes</p>
            <p className="text-slate-500 mt-2">Select a test to begin • 80% required to pass</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(testConfig).map(([testName, config]) => {
              const colors = {
                "Texas Commercial Rules": { bg: "from-cyan-500 to-sky-500", border: "border-cyan-400", icon: "⚖️" },
                "General Knowledge": { bg: "from-emerald-600 to-teal-600", border: "border-emerald-500", icon: "📚" },
                "Air Brakes": { bg: "from-blue-600 to-indigo-600", border: "border-blue-500", icon: "🔧" },
                "Passenger": { bg: "from-purple-600 to-pink-600", border: "border-purple-500", icon: "🚌" },
                "School Bus": { bg: "from-amber-600 to-orange-600", border: "border-amber-500", icon: "🎒" }
              }[testName];

              return (
                <button
                  key={testName}
                  onClick={() => startTest(testName)}
                  className={`p-6 rounded-2xl border-2 ${colors.border} bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 text-left group hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{colors.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{testName}</h2>
                      <p className="text-slate-400 text-sm">{config.questionCount} Questions</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {config.timeLimit ? (
                        <>
                          <span className="text-slate-500">⏱</span>
                          <span className="text-slate-400">{config.timeLimit / 60} minutes</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Untimed</span>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.bg} text-white text-sm font-semibold`}>
                      Start Test →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-12 bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">📋 Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
              <div>
                <p className="mb-2"><strong className="text-slate-300">General Knowledge:</strong> Required for all CDL applicants. Covers safe driving, cargo, vehicle inspection, and regulations.</p>
                <p><strong className="text-slate-300">Air Brakes:</strong> Required to remove the "L" restriction. Covers air brake components, inspection, and safe operation.</p>
              </div>
              <div>
                <p className="mb-2"><strong className="text-slate-300">Passenger:</strong> Required for P endorsement. Covers passenger safety, loading procedures, and emergency situations.</p>
                <p><strong className="text-slate-300">School Bus:</strong> Required for S endorsement. Covers student safety, loading zones, and special procedures.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (testComplete) {
    const { correct, total, percentage, passed } = testResults;

    if (showReview) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 font-sans">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Review: {currentTest}</h2>
              <button
                onClick={() => setShowReview(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Back to Results
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {questions.map((q, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.correct;
                const wasAnswered = userAnswer !== undefined;

                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl border-2 ${
                      isCorrect ? 'border-emerald-600 bg-emerald-900/20' :
                      wasAnswered ? 'border-rose-600 bg-rose-900/20' :
                      'border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        isCorrect ? 'bg-emerald-500/30 text-emerald-300' :
                        wasAnswered ? 'bg-rose-500/30 text-rose-300' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        Q{idx + 1}
                      </span>
                      <p className="text-white font-medium">{q.question}</p>
                    </div>

                    <div className="space-y-2 ml-8">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg ${
                            optIdx === q.correct ? 'bg-emerald-800/50 text-emerald-200 border border-emerald-600' :
                            optIdx === userAnswer && optIdx !== q.correct ? 'bg-rose-800/50 text-rose-200 border border-rose-600' :
                            'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                          {opt}
                          {optIdx === q.correct && <span className="ml-2 text-emerald-400">✓ Correct</span>}
                          {optIdx === userAnswer && optIdx !== q.correct && <span className="ml-2 text-rose-400">✗ Your answer</span>}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 ml-8 p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-300 text-sm"><strong>Explanation:</strong> {q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 font-sans flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className={`rounded-3xl border-2 ${passed ? 'border-emerald-500 bg-emerald-950/30' : 'border-rose-500 bg-rose-950/30'} p-8 shadow-2xl`}>
            <div className="text-center mb-8">
              <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold mb-4 ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {passed ? '🎉 PASSED!' : '📚 KEEP STUDYING'}
              </div>
              <h2 className="text-3xl font-black text-white mb-2">{currentTest} Test Complete</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-4xl font-black text-white">{percentage}%</div>
                <div className="text-slate-400 text-sm">Score</div>
              </div>
              <div className="bg-emerald-900/30 rounded-xl p-4 text-center">
                <div className="text-4xl font-black text-emerald-400">{correct}</div>
                <div className="text-emerald-300 text-sm">Correct</div>
              </div>
              <div className="bg-rose-900/30 rounded-xl p-4 text-center">
                <div className="text-4xl font-black text-rose-400">{total - correct}</div>
                <div className="text-rose-300 text-sm">Incorrect</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowReview(true)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all"
              >
                Review Answers
              </button>
              <button
                onClick={() => startTest(currentTest)}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-all"
              >
                Retake This Test
              </button>
              <button
                onClick={resetQuiz}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-lg transition-all"
              >
                ← Back to Test Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Test Screen
  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  const testColors = {
    "Texas Commercial Rules": { accent: "cyan", gradient: "from-cyan-500 to-sky-500" },
    "General Knowledge": { accent: "emerald", gradient: "from-emerald-600 to-teal-600" },
    "Air Brakes": { accent: "blue", gradient: "from-blue-600 to-indigo-600" },
    "Passenger": { accent: "purple", gradient: "from-purple-600 to-pink-600" },
    "School Bus": { accent: "amber", gradient: "from-amber-600 to-orange-600" }
  }[currentTest];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{currentTest}</h1>
            <p className="text-slate-400 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          
          <div className="px-4 py-2 rounded-xl font-mono text-sm font-semibold bg-slate-800 text-slate-300">
            Untimed Practice
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{answeredCount} of {questions.length} answered</span>
            <span>{Math.round((answeredCount / questions.length) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${testColors.gradient} transition-all duration-300`}
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mb-6 p-4 bg-slate-800/30 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                  idx === currentQuestion
                    ? `bg-gradient-to-r ${testColors.gradient} text-white`
                    : answers[idx] !== undefined
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-600'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 leading-relaxed">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedAnswer === index
                    ? `border-${testColors.accent}-500 bg-${testColors.accent}-900/30 text-white`
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                }`}
              >
                <span className="font-bold mr-3 opacity-60">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-600">
              <p className="font-semibold text-sm mb-2">
                {selectedAnswer === currentQ.correct ? (
                  <span className="text-emerald-400">Correct ✓</span>
                ) : (
                  <span className="text-rose-400">
                    Incorrect ✗&nbsp;
                    <span className="text-slate-300">
                      (Correct answer: {String.fromCharCode(65 + currentQ.correct)}. {currentQ.options[currentQ.correct]})
                    </span>
                  </span>
                )}
              </p>
              <p className="text-slate-300 text-sm">
                <strong className="text-slate-200">Explanation:</strong> {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
              currentQuestion === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            ← Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={finishTest}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r ${testColors.gradient} hover:opacity-90 text-white`}
            >
              Finish Test ✓
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all bg-gradient-to-r ${testColors.gradient} hover:opacity-90 text-white`}
            >
              Next →
            </button>
          )}
        </div>

        {/* Status Bar */}
        <div className="mt-6 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-emerald-400">{answeredCount} Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
            <span className="text-slate-400">{questions.length - answeredCount} Remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CDLTimedQuiz;
