const STORAGE_KEY = "ning-intro-site";

const defaultContent = {
  name: "닝",
  shortName: "닝",
  role: "Software Engineer",
  tagline: "코드를 만들고, 문제를 풀고, 내가 만든 것을 소개하는 공간입니다.",
  about:
    "여기에 나를 소개하는 글을 적어보세요.\n어떤 일을 하는지, 무엇을 좋아하는지, 앞으로 하고 싶은 일을 자유롭게 쓰면 됩니다.",
  tags: "개발, 디자인, 음악",
  photoCaption: "프로필 사진을 올려보세요",
  profileImage: "",
  contactNote: "편하게 연락 주세요.",
  email: "",
  github: "",
  otherLabel: "",
  otherUrl: "",
  experience: [
    {
      when: "2024 — 지금",
      title: "하는 일 / 회사 / 학교",
      detail: "어떤 일을 했는지 한두 문장으로 적어보세요.",
    },
  ],
  projects: [
    {
      title: "프로젝트 이름",
      detail: "무엇을 만들었는지, 어떤 기술이 들어갔는지 적어보세요.",
      link: "",
    },
  ],
  gallery: [],
};

let content = loadContent();

const editor = document.getElementById("editor");
const form = document.getElementById("editor-form");
const experienceFields = document.getElementById("experience-fields");
const projectFields = document.getElementById("project-fields");
const editorGallery = document.getElementById("editor-gallery");

document.getElementById("open-editor").addEventListener("click", () => {
  fillForm();
  editor.hidden = false;
});

document.getElementById("close-editor").addEventListener("click", () => {
  editor.hidden = true;
});

editor.addEventListener("click", (event) => {
  if (event.target === editor) editor.hidden = true;
});

document.getElementById("add-experience").addEventListener("click", () => {
  content.experience.push({ when: "", title: "", detail: "" });
  renderRepeatFields();
});

document.getElementById("add-project").addEventListener("click", () => {
  content.projects.push({ title: "", detail: "", link: "" });
  renderRepeatFields();
});

document.getElementById("profile-upload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  content.profileImage = await fileToDataUrl(file);
  event.target.value = "";
});

document.getElementById("clear-profile").addEventListener("click", () => {
  content.profileImage = "";
});

document.getElementById("gallery-upload").addEventListener("change", async (event) => {
  const files = [...event.target.files];
  const images = await Promise.all(files.map(fileToDataUrl));
  content.gallery = [...content.gallery, ...images];
  renderEditorGallery();
  event.target.value = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  saveFromForm();
  persist();
  render();
  editor.hidden = true;
});

document.getElementById("export-json").addEventListener("click", () => {
  saveFromForm();
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "intro-content.json";
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById("import-json").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const parsed = JSON.parse(await file.text());
  content = { ...defaultContent, ...parsed };
  persist();
  fillForm();
  render();
  event.target.value = "";
});

document.getElementById("reset-content").addEventListener("click", () => {
  if (!confirm("작성한 내용과 사진을 모두 처음 상태로 되돌릴까요?")) return;
  content = structuredClone(defaultContent);
  persist();
  fillForm();
  render();
});

render();

function loadContent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(defaultContent);
    return { ...defaultContent, ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultContent);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function render() {
  document.title = `${content.name} · 자기소개`;
  document.querySelectorAll("[data-field]").forEach((node) => {
    node.textContent = content[node.dataset.field] || "";
  });

  const image = document.getElementById("profile-image");
  const fallback = document.getElementById("profile-fallback");
  if (content.profileImage) {
    image.src = content.profileImage;
    image.hidden = false;
    fallback.hidden = true;
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    fallback.hidden = false;
    fallback.textContent = (content.shortName || content.name || "ME").slice(0, 6);
  }

  const tags = document.getElementById("tags");
  tags.innerHTML = splitTags(content.tags)
    .map((tag) => `<li>${escapeHtml(tag)}</li>`)
    .join("");

  document.getElementById("timeline").innerHTML = content.experience
    .filter((item) => item.title || item.detail || item.when)
    .map(
      (item) => `
        <li>
          <div class="when">${escapeHtml(item.when)}</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.detail)}</p>
        </li>`
    )
    .join("");

  document.getElementById("projects-list").innerHTML = content.projects
    .filter((item) => item.title || item.detail)
    .map((item) => {
      const title = item.link
        ? `<a href="${escapeAttr(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>`
        : escapeHtml(item.title);
      return `<article class="card"><h3>${title}</h3><p>${escapeHtml(item.detail)}</p></article>`;
    })
    .join("");

  const gallery = document.getElementById("gallery");
  const empty = document.getElementById("gallery-empty");
  gallery.innerHTML = content.gallery
    .map((src) => `<figure><img src="${src}" alt="갤러리 사진" /></figure>`)
    .join("");
  empty.hidden = content.gallery.length > 0;

  const links = [];
  if (content.email) {
    links.push(`<a href="mailto:${escapeAttr(content.email)}">${escapeHtml(content.email)}</a>`);
  }
  if (content.github) {
    links.push(`<a href="${escapeAttr(content.github)}" target="_blank" rel="noreferrer">GitHub</a>`);
  }
  if (content.otherUrl) {
    links.push(
      `<a href="${escapeAttr(content.otherUrl)}" target="_blank" rel="noreferrer">${escapeHtml(
        content.otherLabel || content.otherUrl
      )}</a>`
    );
  }
  document.getElementById("contact-links").innerHTML = links.join("");
}

function fillForm() {
  const fields = [
    "name",
    "shortName",
    "role",
    "tagline",
    "about",
    "tags",
    "photoCaption",
    "contactNote",
    "email",
    "github",
    "otherLabel",
    "otherUrl",
  ];
  fields.forEach((name) => {
    form.elements[name].value = content[name] || "";
  });
  renderRepeatFields();
  renderEditorGallery();
}

function saveFromForm() {
  const data = new FormData(form);
  [
    "name",
    "shortName",
    "role",
    "tagline",
    "about",
    "tags",
    "photoCaption",
    "contactNote",
    "email",
    "github",
    "otherLabel",
    "otherUrl",
  ].forEach((name) => {
    content[name] = String(data.get(name) || "").trim();
  });

  content.experience = [...experienceFields.querySelectorAll(".repeat-item")].map((item) => ({
    when: item.querySelector('[name="when"]').value.trim(),
    title: item.querySelector('[name="title"]').value.trim(),
    detail: item.querySelector('[name="detail"]').value.trim(),
  }));

  content.projects = [...projectFields.querySelectorAll(".repeat-item")].map((item) => ({
    title: item.querySelector('[name="title"]').value.trim(),
    detail: item.querySelector('[name="detail"]').value.trim(),
    link: item.querySelector('[name="link"]').value.trim(),
  }));
}

function renderRepeatFields() {
  experienceFields.innerHTML = content.experience
    .map(
      (item, index) => `
        <div class="repeat-item" data-index="${index}">
          <label>기간 <input name="when" value="${escapeAttr(item.when)}" /></label>
          <label>제목 <input name="title" value="${escapeAttr(item.title)}" /></label>
          <label>내용 <textarea name="detail" rows="3">${escapeHtml(item.detail)}</textarea></label>
          <button type="button" class="remove-item" data-kind="experience" data-index="${index}">삭제</button>
        </div>`
    )
    .join("");

  projectFields.innerHTML = content.projects
    .map(
      (item, index) => `
        <div class="repeat-item" data-index="${index}">
          <label>이름 <input name="title" value="${escapeAttr(item.title)}" /></label>
          <label>설명 <textarea name="detail" rows="3">${escapeHtml(item.detail)}</textarea></label>
          <label>링크 <input name="link" value="${escapeAttr(item.link)}" /></label>
          <button type="button" class="remove-item" data-kind="project" data-index="${index}">삭제</button>
        </div>`
    )
    .join("");

  [...document.querySelectorAll(".remove-item")].forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      if (button.dataset.kind === "experience") content.experience.splice(index, 1);
      if (button.dataset.kind === "project") content.projects.splice(index, 1);
      renderRepeatFields();
    });
  });
}

function renderEditorGallery() {
  editorGallery.innerHTML = content.gallery
    .map(
      (src, index) => `
        <figure>
          <img src="${src}" alt="올린 사진" />
          <button type="button" class="remove-photo" data-index="${index}" aria-label="사진 삭제">✕</button>
        </figure>`
    )
    .join("");

  [...editorGallery.querySelectorAll(".remove-photo")].forEach((button) => {
    button.addEventListener("click", () => {
      content.gallery.splice(Number(button.dataset.index), 1);
      renderEditorGallery();
    });
  });
}

function splitTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
