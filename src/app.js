import * as THREE from "three";

const $ = (selector) => document.querySelector(selector);

const appShell = $("#appShell");
const canvas = $("#universeCanvas");
const nodeLayer = $("#nodeLayer");
const connectionsSvg = $("#connections");
const core = $("#core");
const panel = $("#glassPanel");
const panelContent = $("#panelContent");
const panelBackdrop = $("#panelBackdrop");
const panelClose = $("#panelClose");
const intro = $("#intro");
const skipIntro = $("#skipIntro");
const audioToggle = $("#audioToggle");
const siteSong = $("#siteSong");
const moodToggle = $("#moodToggle");
const resetView = $("#resetView");
const contactBeam = $("#contactBeam");
const musicDock = $("#musicDock");
const musicFrame = $("#musicFrame");
const musicClose = $("#musicClose");

const linktreeUrl = "https://linktr.ee/Hey_sumant";
const songFallbackUrl = "https://open.spotify.com/search/Prateek%20Kuhad%20Co2";
const officialSongEmbedUrl = "https://www.youtube-nocookie.com/embed/U2SVCCENLjE?autoplay=1&playsinline=1&rel=0&modestbranding=1";
const useEmbeddedSongPlayer = new URLSearchParams(window.location.search).has("embed") || window.location.hostname.endsWith("github.io");
const contactDestination = {
  // Add one destination when you want real contact submissions.
  email: "",
  whatsapp: "",
};

let universeNodes = [];

const socialLinks = [
  {
    name: "Instagram",
    handle: "sumant.ok",
    href: "https://www.instagram.com/sumant.ok?igsh=MWkzYzI2bXlsN3N5NQ==",
    icon: "instagram",
    accent: "#ffb7ce",
  },
  {
    name: "Snapchat",
    handle: "xrp017",
    href: "https://www.snapchat.com/add/xrp017?share_id=nO520l5gav4&locale=en-IN",
    icon: "ghost",
    accent: "#ffdda7",
  },
  {
    name: "Telegram",
    handle: "sumant17",
    href: "http://t.me/sumant17",
    icon: "send",
    accent: "#7ed9ff",
  },
  {
    name: "YouTube",
    handle: "intro short",
    href: "https://youtube.com/shorts/6gI_ktNdOv8?si=5VruH6GTkcooY-yq",
    icon: "youtube",
    accent: "#ff8fae",
  },
  {
    name: "Spotify",
    handle: "Humdum",
    href: "https://open.spotify.com/playlist/5OEBDw8OQ3mVEo7PCnJdJd?si=omwKPrb0RRauWQiiN2IX9Q&pt=4531264694ddc24c50cfacef9e5273da",
    icon: "music-2",
    accent: "#86ffe3",
  },
  {
    name: "GitHub",
    handle: "sumant-work",
    href: "https://github.com/sumant-work",
    icon: "github",
    accent: "#dce8f1",
  },
  {
    name: "LinkedIn",
    handle: "add link",
    href: linktreeUrl,
    icon: "linkedin",
    accent: "#9be7ff",
  },
  {
    name: "Linktree",
    handle: "Hey_sumant",
    href: linktreeUrl,
    icon: "tree-pine",
    accent: "#b2ffd9",
  },
];

const socialNodePositions = [
  { desktop: [20, 30], mobile: [19, 28] },
  { desktop: [36, 20], mobile: [50, 17] },
  { desktop: [64, 20], mobile: [81, 28] },
  { desktop: [80, 30], mobile: [84, 43] },
  { desktop: [83, 55], mobile: [82, 58] },
  { desktop: [65, 73], mobile: [50, 68] },
  { desktop: [35, 73], mobile: [18, 58] },
  { desktop: [17, 55], mobile: [16, 43] },
];

universeNodes = [
  ...socialLinks.map((link, index) => ({
    ...link,
    id: `social-${index}`,
    title: link.name,
    kind: "social",
    desktop: socialNodePositions[index].desktop,
    mobile: socialNodePositions[index].mobile,
  })),
  {
    id: "contact",
    title: "Contact Portal",
    handle: "send signal",
    icon: "send",
    accent: "#9be7ff",
    kind: "contact",
    desktop: [50, 84],
    mobile: [50, 79],
  },
];

let activeNodeId = null;
let sceneState;
let audioEnabled = false;
let audioPointerHandled = false;
let localSongAvailable = true;
let embeddedSongActive = false;

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "aria-hidden": "true",
        focusable: "false",
      },
    });
    return;
  }

  const fallbackIcons = {
    "fast-forward": ">>",
    github: "GH",
    ghost: "SC",
    instagram: "IG",
    linkedin: "in",
    moon: "◐",
    "music-2": "♪",
    pause: "||",
    play: ">",
    "rotate-ccw": "↺",
    rocket: "^",
    send: ">",
    "tree-pine": "LT",
    x: "x",
    youtube: "YT",
  };

  document.querySelectorAll("i[data-lucide]").forEach((icon) => {
    icon.classList.add("icon-fallback");
    icon.textContent = fallbackIcons[icon.dataset.lucide] || "*";
  });
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function renderNodes() {
  nodeLayer.innerHTML = universeNodes
    .map((node) => {
      const [x, y] = isMobileLayout() ? node.mobile : node.desktop;
      const sharedAttrs = `
          class="universe-node universe-node--${node.kind}"
          data-node="${node.id}"
          style="--x:${x}%; --y:${y}%; --accent:${node.accent};"
          aria-label="${node.kind === "social" ? `Open ${node.title}` : `Open ${node.title}`}"
          title="${node.title}"
      `;

      if (node.kind === "social") {
        return `
          <a
            ${sharedAttrs}
            href="${node.href}"
            target="_blank"
            rel="noreferrer"
          >
            <span class="universe-node__inner">
              <i data-lucide="${node.icon}"></i>
              <span>${node.title}</span>
              <small>${node.handle}</small>
            </span>
          </a>
        `;
      }

      return `
        <button
          ${sharedAttrs}
          type="button"
        >
          <span class="universe-node__inner">
            <i data-lucide="${node.icon}"></i>
            <span>${node.title}</span>
            <small>${node.handle}</small>
          </span>
        </button>
      `;
    })
    .join("");

  nodeLayer.querySelectorAll(".universe-node").forEach((nodeElement) => {
    nodeElement.addEventListener("mouseenter", () => setConnectionFocus(nodeElement.dataset.node));
    nodeElement.addEventListener("mouseleave", () => setConnectionFocus(activeNodeId));
    nodeElement.addEventListener("focus", () => setConnectionFocus(nodeElement.dataset.node));
    nodeElement.addEventListener("blur", () => setConnectionFocus(activeNodeId));
    if (nodeElement.tagName === "BUTTON") {
      nodeElement.addEventListener("click", () => openPanel(nodeElement.dataset.node));
    }
  });

  refreshIcons();
  requestAnimationFrame(drawConnections);
}

function drawConnections() {
  const stageRect = $(".universe-stage").getBoundingClientRect();
  const coreRect = core.getBoundingClientRect();
  const coreX = coreRect.left + coreRect.width / 2 - stageRect.left;
  const coreY = coreRect.top + coreRect.height / 2 - stageRect.top;

  connectionsSvg.innerHTML = "";

  nodeLayer.querySelectorAll(".universe-node").forEach((node) => {
    const rect = node.getBoundingClientRect();
    const nodeX = rect.left + rect.width / 2 - stageRect.left;
    const nodeY = rect.top + rect.height / 2 - stageRect.top;
    const midX = (coreX + nodeX) / 2;
    const midY = (coreY + nodeY) / 2;
    const curve = nodeX < coreX ? -42 : 42;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.dataset.node = node.dataset.node;
    path.setAttribute(
      "d",
      `M ${coreX} ${coreY} C ${midX + curve} ${coreY}, ${midX - curve} ${nodeY}, ${nodeX} ${nodeY}`,
    );
    path.setAttribute("class", `connection-path${node.dataset.node === activeNodeId ? " is-active" : ""}`);
    connectionsSvg.appendChild(path);
  });
}

function setConnectionFocus(id) {
  connectionsSvg.querySelectorAll(".connection-path").forEach((path) => {
    path.classList.toggle("is-active", Boolean(id) && path.dataset.node === id);
  });
}

function openPanel(id) {
  if (!panelTemplates[id]) return;
  activeNodeId = id;
  setConnectionFocus(id);
  nodeLayer.querySelectorAll(".universe-node").forEach((nodeElement) => {
    nodeElement.classList.toggle("is-active", nodeElement.dataset.node === id);
  });

  panelContent.innerHTML = panelTemplates[id]();
  panel.setAttribute("aria-hidden", "false");
  panel.classList.add("is-open");
  panelBackdrop.classList.add("is-open");
  refreshIcons();
  bindPanelInteractions(id);
  moveCameraToNode(id);

  const gsap = window.gsap;
  if (gsap) {
    gsap.fromTo(
      panelContent.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.045, ease: "power3.out" },
    );
  }
}

function closePanel() {
  activeNodeId = null;
  panel.classList.remove("is-open");
  panelBackdrop.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  nodeLayer.querySelectorAll(".universe-node").forEach((button) => button.classList.remove("is-active"));
  setConnectionFocus(null);
  resetCamera();
}

function moveCameraToNode(id) {
  const node = universeNodes.find((item) => item.id === id);
  if (!node || !sceneState) return;
  const [x, y] = isMobileLayout() ? node.mobile : node.desktop;
  sceneState.cameraTarget.x = (x - 50) / 34;
  sceneState.cameraTarget.y = -(y - 50) / 32;
  sceneState.cameraTarget.z = id === "contact" ? 5.18 : 5.45;
}

function resetCamera() {
  if (!sceneState) return;
  sceneState.cameraTarget.x = 0;
  sceneState.cameraTarget.y = 0;
  sceneState.cameraTarget.z = 6.4;
}

const panelTemplates = {
  contact: () => `
    <p class="panel-kicker">Contact Portal</p>
    <h2>Send a signal to the core.</h2>
    <p class="panel-lede">Drop your number and message here. The portal is ready to forward it through WhatsApp or email once your destination is set.</p>
    <form class="contact-form" id="contactForm">
      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" placeholder="Your name" required />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" />
      </div>
      <div class="field">
        <label for="phone">Phone</label>
        <input id="phone" name="phone" type="tel" placeholder="+91..." required />
      </div>
      <div class="field">
        <label for="subject">Signal</label>
        <input id="subject" name="subject" type="text" placeholder="Collab, hello, or idea" />
      </div>
      <div class="field field--wide">
        <label for="message">Message</label>
        <textarea id="message" name="message" placeholder="Write your message" required></textarea>
      </div>
      <div class="field field--wide">
        <button class="send-button" type="submit">
          <i data-lucide="send"></i>
          <span>Transmit</span>
        </button>
        <p class="portal-note" id="portalNote"></p>
      </div>
    </form>
  `,
};

function getContactPayload(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const name = data.name?.trim() || "Visitor";
  const phone = data.phone?.trim() || "-";
  const email = data.email?.trim() || "-";
  const signal = data.subject?.trim() || "New contact";
  const message = data.message?.trim() || "-";
  const text = [
    "New contact from Sumant's Space",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Signal: ${signal}`,
    `Message: ${message}`,
  ].join("\n");

  return {
    subject: `New contact from ${name}`,
    text,
  };
}

function sendContactSignal(form) {
  const payload = getContactPayload(form);
  const whatsappNumber = contactDestination.whatsapp.replace(/[^\d]/g, "");

  if (whatsappNumber) {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(payload.text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    return {
      sent: true,
      note: "WhatsApp draft opened. Send it to complete the signal.",
    };
  }

  if (contactDestination.email) {
    const mailUrl = `mailto:${contactDestination.email}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.text)}`;
    window.location.href = mailUrl;
    return {
      sent: true,
      note: "Email draft opened. Send it to complete the signal.",
    };
  }

  navigator.clipboard?.writeText(payload.text).catch(() => {});
  return {
    sent: false,
    note: "Destination not set yet. Message copied locally.",
  };
}

function bindPanelInteractions(id) {
  if (id !== "contact") return;
  const form = $("#contactForm");
  const note = $("#portalNote");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = sendContactSignal(form);
    animateContactBeam(event.submitter || form);
    note.textContent = result.note;
    if (result.sent) {
      form.reset();
    }
  });
}

function animateContactBeam(source) {
  const gsap = window.gsap;
  const sourceRect = source.getBoundingClientRect();
  const coreRect = core.getBoundingClientRect();
  const start = {
    x: sourceRect.left + sourceRect.width / 2,
    y: sourceRect.top + sourceRect.height / 2,
  };
  const end = {
    x: coreRect.left + coreRect.width / 2,
    y: coreRect.top + coreRect.height / 2,
  };

  Object.assign(contactBeam.style, {
    left: `${start.x - 8}px`,
    top: `${start.y - 8}px`,
  });

  if (!gsap) {
    contactBeam.style.opacity = "0";
    return;
  }

  gsap.killTweensOf(contactBeam);
  gsap.fromTo(
    contactBeam,
    { opacity: 1, scale: 0.7, x: 0, y: 0 },
    {
      opacity: 0,
      scale: 1.6,
      x: end.x - start.x,
      y: end.y - start.y,
      duration: 0.95,
      ease: "power2.inOut",
    },
  );
}

function initThree() {
  const compactScene = window.matchMedia("(max-width: 760px)").matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !compactScene,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactScene ? 1.35 : 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060d, 0.035);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 6.4);

  const starField = createStarField(
    compactScene ? 640 : 1000,
    compactScene ? 34 : 42,
    [0xdce8f1, 0x7ed9ff, 0xffb7ce, 0xffdda7],
  );
  scene.add(starField);

  const nebula = createNebulaCloud(compactScene ? 220 : 360);
  scene.add(nebula);

  const coreGroup = new THREE.Group();
  const torusMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x7ed9ff, transparent: true, opacity: 0.17 }),
    new THREE.MeshBasicMaterial({ color: 0xffb7ce, transparent: true, opacity: 0.12 }),
    new THREE.MeshBasicMaterial({ color: 0x86ffe3, transparent: true, opacity: 0.11 }),
  ];

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.008, 10, 150), torusMaterials[0]);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.008, 10, 150), torusMaterials[1]);
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.006, 10, 150), torusMaterials[2]);
  ringB.rotation.x = Math.PI / 2.6;
  ringC.rotation.y = Math.PI / 2.9;
  coreGroup.add(ringA, ringB, ringC);
  scene.add(coreGroup);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 36, 20),
    new THREE.MeshBasicMaterial({ color: 0xf2f4f7, transparent: true, opacity: 0.74 }),
  );
  moon.position.set(-3.25, 1.8, -3.3);
  scene.add(moon);

  const planets = universeNodes.map((node, index) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(node.accent),
      transparent: true,
      opacity: 0.56,
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (index % 4) * 0.014, 24, 16), material);
    planet.userData = {
      radius: 2.35 + (index % 5) * 0.24,
      speed: 0.16 + index * 0.018,
      offset: index * 0.78,
      y: -0.44 + (index % 5) * 0.16,
    };
    scene.add(planet);
    return planet;
  });

  sceneState = {
    renderer,
    scene,
    camera,
    coreGroup,
    starField,
    nebula,
    moon,
    planets,
    cameraTarget: { x: 0, y: 0, z: 6.4 },
    pointer: { x: 0, y: 0 },
  };

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize);
  animateThree();
}

function createStarField(count, spread, palette) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const radius = 5 + Math.random() * spread;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) - 10;

    color.setHex(palette[Math.floor(Math.random() * palette.length)]);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.035,
      transparent: true,
      opacity: 0.82,
      vertexColors: true,
      depthWrite: false,
    }),
  );
}

function createNebulaCloud(count = 360) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [0x7ed9ff, 0xffb7ce, 0x86ffe3, 0xc9b7ff];
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * 5.8;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.44 + (Math.random() - 0.5) * 1.6;
    positions[i * 3 + 2] = -5.8 - Math.random() * 7.2;
    color.setHex(palette[Math.floor(Math.random() * palette.length)]);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.13,
      transparent: true,
      opacity: 0.28,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function animateThree() {
  requestAnimationFrame(animateThree);
  if (!sceneState) return;

  const time = performance.now() * 0.001;
  const { camera, renderer, scene, coreGroup, starField, nebula, moon, planets, cameraTarget, pointer } = sceneState;

  camera.position.x += (cameraTarget.x + pointer.x * 0.18 - camera.position.x) * 0.035;
  camera.position.y += (cameraTarget.y + pointer.y * 0.16 - camera.position.y) * 0.035;
  camera.position.z += (cameraTarget.z - camera.position.z) * 0.035;
  camera.lookAt(0, 0, -0.3);

  starField.rotation.y = time * 0.012;
  starField.rotation.x = Math.sin(time * 0.16) * 0.02;
  nebula.rotation.z = time * 0.018;
  nebula.rotation.y = Math.sin(time * 0.1) * 0.08;

  coreGroup.rotation.z = time * 0.18;
  coreGroup.rotation.x = Math.sin(time * 0.5) * 0.08;
  coreGroup.children[1].rotation.z = -time * 0.28;
  coreGroup.children[2].rotation.y = time * 0.22;

  moon.position.y = 1.8 + Math.sin(time * 0.7) * 0.08;
  moon.material.opacity = 0.66 + Math.sin(time * 1.3) * 0.07;

  planets.forEach((planet) => {
    const { radius, speed, offset, y } = planet.userData;
    planet.position.x = Math.cos(time * speed + offset) * radius;
    planet.position.z = Math.sin(time * speed + offset) * 1.4 - 2.6;
    planet.position.y = y + Math.sin(time * speed * 1.7 + offset) * 0.2;
    planet.rotation.y += 0.01;
  });

  renderer.render(scene, camera);
}

function initPointerParallax() {
  window.addEventListener("pointermove", (event) => {
    if (!sceneState) return;
    sceneState.pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    sceneState.pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  });
}

function setAudioIcon() {
  audioToggle.innerHTML = `<i data-lucide="${audioEnabled ? "pause" : "play"}"></i>`;
  const inactiveLabel = "Play song";
  audioToggle.setAttribute("aria-label", audioEnabled ? "Pause song" : inactiveLabel);
  audioToggle.setAttribute("title", audioEnabled ? "Pause song" : inactiveLabel);
  audioToggle.classList.toggle("is-active", audioEnabled);
  appShell.classList.toggle("is-audio-playing", audioEnabled);
  refreshIcons();
}

function openSongFallback() {
  window.open(songFallbackUrl, "_blank", "noopener,noreferrer");
}

function openEmbeddedSong() {
  if (!musicDock || !musicFrame) {
    openSongFallback();
    return;
  }

  musicFrame.src = officialSongEmbedUrl;
  musicDock.classList.add("is-open");
  musicDock.setAttribute("aria-hidden", "false");
  embeddedSongActive = true;
  audioEnabled = true;
  setAudioIcon();
}

function closeEmbeddedSong() {
  if (musicDock) {
    musicDock.classList.remove("is-open");
    musicDock.setAttribute("aria-hidden", "true");
  }
  if (musicFrame) {
    musicFrame.src = "about:blank";
  }
  embeddedSongActive = false;
  audioEnabled = false;
  setAudioIcon();
}

async function verifyLocalSong() {
  if (useEmbeddedSongPlayer) {
    localSongAvailable = false;
    setAudioIcon();
    return;
  }

  if (!siteSong?.src) {
    localSongAvailable = false;
    setAudioIcon();
    return;
  }

  try {
    const response = await fetch(siteSong.src, { method: "HEAD", cache: "no-store" });
    localSongAvailable = response.ok;
  } catch {
    localSongAvailable = false;
  }
  setAudioIcon();
}

async function playSong() {
  if (!siteSong) return false;
  if (useEmbeddedSongPlayer || !localSongAvailable) {
    openEmbeddedSong();
    return true;
  }

  siteSong.volume = 0.62;
  try {
    await siteSong.play();
    audioEnabled = true;
    setAudioIcon();
    return true;
  } catch (error) {
    if (siteSong.error || error?.name === "NotSupportedError") {
      localSongAvailable = false;
      openSongFallback();
    }
    audioEnabled = false;
    setAudioIcon();
    return false;
  }
}

function pauseSong() {
  if (embeddedSongActive) {
    closeEmbeddedSong();
    return;
  }
  if (!siteSong) return;
  siteSong.pause();
  audioEnabled = false;
  setAudioIcon();
}

function toggleAudio() {
  if (audioEnabled) {
    pauseSong();
  } else {
    playSong();
  }
}

function initSongControls() {
  if (!siteSong) return;
  siteSong.volume = 0.62;
  siteSong.addEventListener("play", () => {
    audioEnabled = true;
    setAudioIcon();
  });
  siteSong.addEventListener("pause", () => {
    audioEnabled = false;
    setAudioIcon();
  });
  siteSong.addEventListener("error", () => {
    localSongAvailable = false;
    audioEnabled = false;
    setAudioIcon();
  });
  verifyLocalSong();
  setAudioIcon();
}

function toggleMood() {
  const dawn = appShell.dataset.mood !== "dawn";
  appShell.dataset.mood = dawn ? "dawn" : "night";
  moodToggle.innerHTML = `<i data-lucide="${dawn ? "sun" : "moon"}"></i>`;
  refreshIcons();
}

function hideIntro() {
  if (intro.classList.contains("is-hidden")) return;
  const gsap = window.gsap;
  if (gsap) {
    gsap.to(intro, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      onComplete: () => intro.classList.add("is-hidden"),
    });
  } else {
    intro.classList.add("is-hidden");
  }
}

function initIntroMotion() {
  const gsap = window.gsap;
  if (gsap) {
    gsap.fromTo(".intro__mark", { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" });
    gsap.fromTo(".intro__eyebrow, .intro h1", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.32, ease: "power3.out" });
    gsap.fromTo(".universe-node", { opacity: 0 }, { opacity: 1, duration: 0.55, stagger: 0.045, delay: 1.35, ease: "power3.out" });
    gsap.fromTo(".avatar-shell", { opacity: 0 }, { opacity: 1, duration: 0.75, delay: 0.9, ease: "power3.out" });
  }
  window.setTimeout(hideIntro, 2800);
}

function initEvents() {
  skipIntro.addEventListener("click", hideIntro);
  panelClose.addEventListener("click", closePanel);
  panelBackdrop.addEventListener("click", closePanel);
  musicClose.addEventListener("click", closeEmbeddedSong);
  audioToggle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    audioPointerHandled = true;
    toggleAudio();
    window.setTimeout(() => {
      audioPointerHandled = false;
    }, 350);
  });
  audioToggle.addEventListener("click", () => {
    if (audioPointerHandled) return;
    toggleAudio();
  });
  moodToggle.addEventListener("click", toggleMood);
  resetView.addEventListener("click", () => {
    closePanel();
    resetCamera();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
      hideIntro();
    }
  });

  window.addEventListener("resize", () => {
    renderNodes();
    if (activeNodeId) moveCameraToNode(activeNodeId);
  });
}

function boot() {
  appShell.dataset.mood = "night";
  renderNodes();
  initEvents();
  initSongControls();
  refreshIcons();
  initIntroMotion();
  requestAnimationFrame(() => {
    initThree();
    initPointerParallax();
    requestAnimationFrame(drawConnections);
  });
}

boot();
