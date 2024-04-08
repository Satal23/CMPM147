// project.js - purpose and description here
// Author: 
// Date:

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file


function main() {
  const fillers = {
    adventurer: ["Cyberpunk", "Neon", "TechBot", "Starfarer", "Cosmic Voyager", "Spacer", "Synthwave", "Nebula Walker", "Galactic Nomad", "Quantum Sleuth", "Interstellar Agent", "Exo-Explorer", "SkyNet", "Orbital Guardian", "Binary"],
    pre: ["Virtu", "Cryo", "Cyber", "Neo", "Astro", "Quantum"],
    post: ["grid", "link", "net", "-on-the-go", "space", "stream", "tron", "sphere", "beam"],
    people: ["cybernetic", "enhanced", "integrated", "wired", "neural", "augmented", "enhanced", "solar", "stellar", "lunar", "intergalactic"],
    item: ["cyber-blade", "laser rifle", "data drive", "plasma shield", "nano-suit", "gravity boots", "quantum gloves", "neural implant", "energy sword", "pulse cannon"],
    num: ["two", "three", "eleven", "so many", "too many", "an overwhelming amount of", "barely any", "an unspecified amount of", "a critical mass of"],
    looty: ["glowing", "high-tech", "stellar", "rare", "exotic", "photon-infused", "holographic", "enchanted", "crystalized", "quantum-entangled"],
    loots: ["credits", "data shards", "energy cells", "artifacts", "tech fragments", "star maps", "alien relics", "quantum particles", "nucleonic isotopes"],
    baddies: ["cyber-zombies", "sentient AI", "space pirates", "nanobot swarms", "interstellar hackers", "neural parasites", "rogue drones", "cosmic anomalies", "viral entities"],
    message: ["transmit", "broadcast", "communique", "send", "signal", "hail", "message", "alert", "transmission", "echo", "ping"],
    location: ["the cyberverse", "the neon galaxy", "the quantum realm", "the stellar expanse", "the celestial sphere", "the warp zone", "the interstellar nexus", "the cybernetic network", "the cosmic frontier"],
    mission: ["rescue operation", "stealth mission", "reconnaissance mission", "infiltration mission", "data retrieval mission", "sabotage mission", "escort mission", "defense mission", "survival mission"],
    reward: ["galactic renown", "cybernetic upgrades", "starship upgrades", "quantum enhancements", "stellar credits", "ancient knowledge", "rare artifacts", "cosmic blessings", "interstellar fame"],
  };
  
  const template = `$adventurer, receive my $message!
  
  I have just returned from $pre$post where the $people inhabitants are in dire need. Their habitat has been infiltrated by $baddies. You must embark immediately, equipped with my $item, and assist them.
  
  Legend has it that the savior will be rewarded with $num $looty $loots. Surely this entices one of your caliber!
  
  Your mission, should you choose to accept it, is a $mission in $location. The stakes are high, but the rewards are great - you may earn $reward and everlasting glory!
  
  `;
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    box.innerText = story;
  }
  
  /* global clicker */
  clicker.onclick = generate;
  
  generate();
  
  
}

main();