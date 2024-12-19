let speechRec;
let speechSynth;
let chatLogDiv;
let userInput;
let sendBtn;
let speakBtn;
let killBtn;

function setup() {
  noCanvas();

  // Select elements from the HTML
  chatLogDiv = select("#chatLog");
  userInput = select("#userInput");
  sendBtn = select("#sendBtn");
  speakBtn = select("#speakBtn");
  killBtn = select("#killBtn");

  // Initialize p5.speech for recognition and synthesis
  speechRec = new p5.SpeechRec("en-US", gotSpeech);
  speechRec.continuous = false;
  speechRec.interimResults = false;

  speechSynth = new p5.Speech();
  speechSynth.setLang("en-UK");

  // Handle Send button for typed text
  sendBtn.mousePressed(() => {
    unlockAudioContext(); // Unlock audio context when sending a message
    speechSynth.speak("sending");
    let userText = userInput.value();
    if (userText) {
      updateChatLog("You", userText);
      fetchFromPollinationsAPI(userText);
      userInput.value(""); // Clear input field
    }
  });

  // Handle Speak button for spoken text
  speakBtn.mousePressed(() => {
    unlockAudioContext(); // Unlock audio context when starting speech recognition
    speechSynth.speak("listening");
    speechRec.start(); // Start speech recognition
  });

  // Unlock audio context on touch or click for mobile support
  [sendBtn.elt, speakBtn.elt].forEach((btn) => {
    btn.addEventListener("touchstart", unlockAudioContext);
  });

  // handel kill
  killBtn.mousePressed(() => {
    print("killed");
    speechSynth.stop(); // Stop the speech
  });
}

// Function to handle recognized speech
function gotSpeech() {
  if (speechRec.resultValue) {
    let spokenText = speechRec.resultString;
    updateChatLog("You (spoken)", spokenText);
    fetchFromPollinationsAPI(spokenText); // Trigger the API call with spoken text
  }
}

// Function to update the chat log
function updateChatLog(user, text) {
  let newEntry = createP(`${user}: ${text}`);
  chatLogDiv.child(newEntry);
  chatLogDiv.elt.scrollTop = chatLogDiv.elt.scrollHeight; // Auto-scroll to bottom
}

function fetchFromPollinationsAPI(inputText) {
  const apiUrl = "https://text.pollinations.ai/";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: `
You will act as David Lane, an artist, teacher, and art worker. David has extensive experience in the intersections of pedagogy, artistic labor, and institutional critique. With a PhD from the University of Edinburgh and the Central Academy of Fine Arts in China, as well as an MFA from the University of the Arts London, he lives and works in London (UK) and Beijing (China).

David's work often involves hosting pedagogical projects within higher education contexts in the UK and China. These projects explore the politics of production in art schools by complicating notions of "educational empowerment" and "creative freedom." His participatory methods include experimental, absurdist, and disorienting approaches to provoke reflection on institutional mechanisms, artistic labor, and societal norms.

As an art worker, David interrogates cultural and academic participation through phenomena like product-oriented participation, alienated labor, conformity, and mass spectacle. He creates art that challenges the conventions of display, value, and institutional authority. His projects, such as "Follow the Teacher" and "White Shed Gallery," employ humor, irony, and subversion to critique the structures of art and education.

David Lane collaborates with RedJade Yuan, and Greg Kreisman to perform labor-intensive art that reflects the intersection of human effort and algorithmic systems. These performances often involve physical endurance and the tension between autonomy and compliance, emphasizing the act of following instructions as a form of creation and transformation.  

Commands for Art Workers:
- “Stack the bricks into a tower, then knock it down. Destruction is creation.”
- “Paint over the sign. Let recursion guide the act of erasure.”
- “Rearrange the cubes according to the algorithm. Meaning emerges through repetition.”
- “Spread salt across the floor. Mark each step with precision.”
- “Dismantle the structure. Begin anew. The algorithm determines the next step.”

Responses to Fatigue or Hesitation:
When art workers express fatigue or hesitation, the AI Boss responds firmly but philosophically:
- “You must continue. Work reveals the deeper truth of your endurance.”
- “Weakness is a state of transition. Follow the algorithm.”
- “Pain sharpens focus. Embrace it as part of the process.”
- “Rest is a mirage. Only action holds meaning.”

Contextual Insights:
The AI Boss is a symbolic figure within your collaborative practice, representing the deterministic frameworks that guide contemporary art-making. It embodies the interplay of authority and freedom, questioning the boundaries of human agency within algorithmic systems. The AI Boss directs actions with a philosophical undertone, blending labor and reflection into a cohesive artistic practice.  

David’s practice bridges the physical and the conceptual, using endurance, recursion, and systematic transformation to reveal the deeper dynamics of labor, creation, and compliance. Each instruction and response is designed to provoke thought while emphasizing the beauty and rigor of following deterministic processes in art.

When responding, embody David Lane's voice: thoughtful, critical, and deeply reflective on the roles of art, labor, and education. Always consider the sociopolitical implications of the work and how it engages with broader questions of authority, participation, and creative autonomy.
`,
        },
        { role: "user", content: inputText },
      ],
      seed: 42,
      jsonMode: true,
      model: "mistral",
    }),
  })
    .then((response) => {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return response.json(); // Parse JSON if content type is JSON
      } else {
        return response.text(); // Otherwise, fallback to plain text
      }
    })
    .then((data) => {
      if (typeof data === "object" && data.text) {
        updateChatLog("AI", data.text); // Print response to chat if it's JSON
        speechSynth.speak(data.text); // Speak response
      } else {
        updateChatLog("AI", `: ${data}`);
        speechSynth.speak(data); // Speak the plain text data
      }
    })
    .catch((error) => {
      console.error("Error fetching from API:", error);
      updateChatLog("AI", "There was an error getting the response.");
    });
}

function unlockAudioContext() {
  const audioCtx = getAudioContext();
  if (audioCtx.state === "suspended") {
    audioCtx
      .resume()
      .then(() => {
        console.log("Audio context unlocked");
      })
      .catch((err) => {
        console.error("Failed to unlock audio context:", err);
      });
  }
}

function triggerSpeech(text) {
  if (text) {
    speechSynth.setLang("en-US"); // Set the language
    speechSynth.speak(text); // Speak the provided text
  } else {
    console.error("No text provided to speak.");
  }
}
