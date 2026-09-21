/**
 * introduce_web - Interactive Portfolio & Photo Editor
 */

const DEFAULT_DATA = {
  name: '장동현',
  role: '학생',
  intro: '',
  portrait: '',
  portraitCaption: '홍길동 / 개발자',
  aboutText: ``,
  tags: ['미식축구', '농구', '게임'],
  contact: {
    email: 'example@email.com',
    github: 'github.com/username',
    blog: 'myblog.com',
    phone: '010-1234-5678'
  }
};

class PortfolioManager {
  constructor() {
    this.data = this.load();
    this.initDOM();
    this.bindEvents();
    this.render();
  }

  load() {
    try {
      const stored = localStorage.getItem('introduce_web_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          contact: { ...DEFAULT_DATA.contact, ...(parsed.contact || {}) },
          aboutPhotos: parsed.aboutPhotos || DEFAULT_DATA.aboutPhotos,
          timeline: parsed.timeline || DEFAULT_DATA.timeline,
          gallery: parsed.gallery || DEFAULT_DATA.gallery,
          tags: parsed.tags || DEFAULT_DATA.tags
        };
      }
    } catch (e) {
      console.warn('Storage load error:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save() {
    try {
      localStorage.setItem('introduce_web_data', JSON.stringify(this.data));
      this.showToast('✅ 저장되었습니다!');
    } catch (e) {
      console.error('Storage save error:', e);
      this.showToast('⚠️ 저장 용량 초과. 사진 크기를 확인하세요.');
    }
  }

  initDOM() {
    // Topbar & Displays
    this.displayLogo = document.getElementById('displayLogo');
    this.displayRole = document.getElementById('displayRole');
    this.displayName = document.getElementById('displayName');
    this.displayIntro = document.getElementById('displayIntro');
    this.displayPortrait = document.getElementById('displayPortrait');
    this.portraitFallback = document.getElementById('portraitFallback');
    this.displayPortraitCaption = document.getElementById('displayPortraitCaption');
    this.displayAboutText = document.getElementById('displayAboutText');
    this.aboutPhotoGrid = document.getElementById('aboutPhotoGrid');
    this.displayTags = document.getElementById('displayTags');
    this.displayTimeline = document.getElementById('displayTimeline');
    this.displayGallery = document.getElementById('displayGallery');
    this.displayContact = document.getElementById('displayContact');
    this.displayFooterName = document.getElementById('displayFooterName');
    this.currentYear = document.getElementById('currentYear');

    // Portrait Quick Upload
    this.portraitFrame = document.getElementById('portraitFrame');
    this.portraitFileInput = document.getElementById('portraitFileInput');

    // About Photo Quick Upload
    this.btnAddAboutPhotoBtn = document.getElementById('btnAddAboutPhotoBtn');
    this.aboutPhotoInput = document.getElementById('aboutPhotoInput');

    // Editor Sidebar
    this.editor = document.getElementById('editor');
    this.btnOpenEditor = document.getElementById('btnOpenEditor');
    this.btnCloseEditor = document.getElementById('btnCloseEditor');
    this.btnSaveEditor = document.getElementById('btnSaveEditor');
    this.btnExportJson = document.getElementById('btnExportJson');
    this.btnResetData = document.getElementById('btnResetData');

    // Inputs
    this.inputName = document.getElementById('inputName');
    this.inputRole = document.getElementById('inputRole');
    this.inputIntro = document.getElementById('inputIntro');
    this.inputPortraitFile = document.getElementById('inputPortraitFile');
    this.inputPortraitUrl = document.getElementById('inputPortraitUrl');
    this.inputPortraitCaption = document.getElementById('inputPortraitCaption');
    this.inputAboutText = document.getElementById('inputAboutText');
    this.inputTags = document.getElementById('inputTags');
    this.inputEmail = document.getElementById('inputEmail');
    this.inputGithub = document.getElementById('inputGithub');
    this.inputBlog = document.getElementById('inputBlog');
    this.inputPhone = document.getElementById('inputPhone');

    // Editor Dropzones
    this.editorAboutDropzone = document.getElementById('editorAboutDropzone');
    this.editorAboutFileInput = document.getElementById('editorAboutFileInput');
    this.editorAboutGallery = document.getElementById('editorAboutGallery');

    this.editorGalleryDropzone = document.getElementById('editorGalleryDropzone');
    this.editorGalleryFileInput = document.getElementById('editorGalleryFileInput');
    this.editorGalleryList = document.getElementById('editorGalleryList');

    // Lightbox & Toast
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightboxImg');
    this.toast = document.getElementById('toast');

    if (this.currentYear) {
      this.currentYear.textContent = new Date().getFullYear();
    }
  }

  bindEvents() {
    // Open / Close Editor
    if (this.btnOpenEditor) {
      this.btnOpenEditor.addEventListener('click', () => this.openEditor());
    }
    if (this.btnCloseEditor) {
      this.btnCloseEditor.addEventListener('click', () => this.closeEditor());
    }
    if (this.editor) {
      this.editor.addEventListener('click', (e) => {
        if (e.target === this.editor) this.closeEditor();
      });
    }

    // Save & Reset in Editor
    if (this.btnSaveEditor) {
      this.btnSaveEditor.addEventListener('click', () => {
        this.syncEditorToData();
        this.render();
        this.save();
        this.closeEditor();
      });
    }

    if (this.btnResetData) {
      this.btnResetData.addEventListener('click', () => {
        if (confirm('기본 예시 데이터로 초기화하시겠습니까?')) {
          this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
          localStorage.removeItem('introduce_web_data');
          this.render();
          this.populateEditor();
          this.showToast('기본값으로 초기화되었습니다.');
        }
      });
    }

    if (this.btnExportJson) {
      this.btnExportJson.addEventListener('click', () => this.exportJson());
    }

    // Direct Portrait Upload (Click on Photo)
    if (this.portraitFrame && this.portraitFileInput) {
      this.portraitFrame.addEventListener('click', () => {
        this.portraitFileInput.value = '';
        this.portraitFileInput.click();
      });

      this.portraitFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.compressImage(file, (dataUrl) => {
            this.data.portrait = dataUrl;
            this.render();
            this.save();
            this.showToast('📷 프로필 사진이 변경되었습니다!');
          });
        }
      });
    }

    // Portrait Upload inside Editor Panel
    if (this.inputPortraitFile) {
      this.inputPortraitFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.compressImage(file, (dataUrl) => {
            this.data.portrait = dataUrl;
            if (this.inputPortraitUrl) this.inputPortraitUrl.value = '';
            this.render();
            this.save();
            this.showToast('📷 프로필 사진이 업로드되었습니다.');
          });
        }
      });
    }

    if (this.inputPortraitUrl) {
      this.inputPortraitUrl.addEventListener('change', () => {
        const val = this.inputPortraitUrl.value.trim();
        if (val) {
          this.data.portrait = val;
          this.render();
          this.save();
        }
      });
    }

    // About Photo Button Upload (Direct)
    if (this.btnAddAboutPhotoBtn && this.aboutPhotoInput) {
      this.btnAddAboutPhotoBtn.addEventListener('click', () => {
        this.aboutPhotoInput.value = '';
        this.aboutPhotoInput.click();
      });

      this.aboutPhotoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          this.handleAboutFiles(files);
        }
      });
    }

    // Editor About Photo Dropzone
    if (this.editorAboutDropzone && this.editorAboutFileInput) {
      this.editorAboutDropzone.addEventListener('click', () => {
        this.editorAboutFileInput.value = '';
        this.editorAboutFileInput.click();
      });

      this.editorAboutFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          this.handleAboutFiles(files);
        }
      });
    }

    // Editor Gallery Dropzone
    if (this.editorGalleryDropzone && this.editorGalleryFileInput) {
      this.editorGalleryDropzone.addEventListener('click', () => {
        this.editorGalleryFileInput.value = '';
        this.editorGalleryFileInput.click();
      });

      this.editorGalleryFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          this.handleGalleryFiles(files);
        }
      });
    }

    // Direct On-Page Inline Editing for Texts!
    this.makeDirectlyEditable(this.displayName, (val) => {
      this.data.name = val;
      if (this.displayLogo) this.displayLogo.textContent = val;
      if (this.displayFooterName) this.displayFooterName.textContent = val;
      this.save();
    });

    this.makeDirectlyEditable(this.displayRole, (val) => {
      this.data.role = val;
      this.save();
    });

    this.makeDirectlyEditable(this.displayIntro, (val) => {
      this.data.intro = val;
      this.save();
    });

    this.makeDirectlyEditable(this.displayPortraitCaption, (val) => {
      this.data.portraitCaption = val;
      this.save();
    });

    this.makeDirectlyEditable(this.displayAboutText, (val) => {
      this.data.aboutText = val;
      this.save();
    });

    // Lightbox Close
    if (this.lightbox) {
      this.lightbox.addEventListener('click', () => {
        this.lightbox.classList.add('hidden');
      });
    }

    // Clipboard Paste (Ctrl+V / Cmd+V) to Add Photo
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            this.compressImage(file, (dataUrl) => {
              this.data.aboutPhotos.push({
                id: 'about-' + Date.now(),
                title: '클립보드 사진',
                image: dataUrl
              });
              this.render();
              this.save();
              this.showToast('📋 클립보드 사진이 내 소개에 추가되었습니다!');
            });
            break;
          }
        }
      }
    });
  }

  // Makes an HTML element directly editable by clicking on it
  makeDirectlyEditable(el, callback) {
    if (!el) return;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('title', '클릭하여 텍스트를 바로 수정할 수 있습니다');
    el.style.outline = 'none';
    el.style.cursor = 'text';

    el.addEventListener('focus', () => {
      el.style.backgroundColor = 'rgba(0,0,0,0.04)';
      el.style.borderRadius = '3px';
    });

    el.addEventListener('blur', () => {
      el.style.backgroundColor = 'transparent';
      const text = el.innerText.trim();
      callback(text);
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && el.tagName !== 'DIV' && el.tagName !== 'P') {
        e.preventDefault();
        el.blur();
      }
    });
  }

  // Compress images to fit comfortably in localStorage
  compressImage(file, callback) {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  handleAboutFiles(files) {
    let loaded = 0;
    files.forEach(file => {
      this.compressImage(file, (dataUrl) => {
        this.data.aboutPhotos.push({
          id: 'about-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          title: file.name.replace(/\.[^/.]+$/, "") || '소개 사진',
          image: dataUrl
        });
        loaded++;
        if (loaded === files.length) {
          this.render();
          this.save();
          this.showToast(`📸 내 소개 사진 ${files.length}장이 추가되었습니다!`);
        }
      });
    });
  }

  handleGalleryFiles(files) {
    let loaded = 0;
    files.forEach(file => {
      this.compressImage(file, (dataUrl) => {
        this.data.gallery.push({
          id: 'g-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          title: file.name.replace(/\.[^/.]+$/, "") || '갤러리 사진',
          image: dataUrl
        });
        loaded++;
        if (loaded === files.length) {
          this.render();
          this.save();
          this.showToast(`📸 갤러리 사진 ${files.length}장이 추가되었습니다!`);
        }
      });
    });
  }

  render() {
    if (this.displayLogo) this.displayLogo.textContent = this.data.name;
    if (this.displayName) this.displayName.textContent = this.data.name;
    if (this.displayRole) this.displayRole.textContent = this.data.role;
    if (this.displayIntro) this.displayIntro.textContent = this.data.intro;
    if (this.displayFooterName) this.displayFooterName.textContent = this.data.name;
    if (this.displayPortraitCaption) this.displayPortraitCaption.textContent = this.data.portraitCaption;
    if (this.displayAboutText) this.displayAboutText.textContent = this.data.aboutText;

    // Portrait Image
    if (this.displayPortrait) {
      if (this.data.portrait) {
        this.displayPortrait.src = this.data.portrait;
        this.displayPortrait.removeAttribute('hidden');
        if (this.portraitFallback) this.portraitFallback.setAttribute('hidden', '');
      } else {
        this.displayPortrait.setAttribute('hidden', '');
        if (this.portraitFallback) this.portraitFallback.removeAttribute('hidden');
      }
    }

    // About Me Photos
    if (this.aboutPhotoGrid) {
      this.aboutPhotoGrid.innerHTML = '';
      if (!this.data.aboutPhotos || this.data.aboutPhotos.length === 0) {
        this.aboutPhotoGrid.innerHTML = `<div style="grid-column:1/-1; color:#888; font-size:0.9rem; padding:10px 0;">등록된 소개 사진이 없습니다. [사진 추가] 버튼을 눌러보세요!</div>`;
      } else {
        this.data.aboutPhotos.forEach((item, index) => {
          const div = document.createElement('div');
          div.className = 'about-photo-item';
          div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <button class="btn-del-photo" title="사진 삭제"><i class="fa-solid fa-xmark"></i></button>
          `;
          div.querySelector('img').addEventListener('click', () => this.openLightbox(item.image));
          div.querySelector('.btn-del-photo').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('이 사진을 삭제하시겠습니까?')) {
              this.data.aboutPhotos.splice(index, 1);
              this.render();
              this.save();
            }
          });
          this.aboutPhotoGrid.appendChild(div);
        });
      }
    }

    // Tags
    if (this.displayTags) {
      this.displayTags.innerHTML = '';
      this.data.tags.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag.startsWith('#') ? tag : '#' + tag;
        this.displayTags.appendChild(li);
      });
    }

    // Timeline
    if (this.displayTimeline) {
      this.displayTimeline.innerHTML = '';
      this.data.timeline.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="when">${item.period}</div>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        `;
        this.displayTimeline.appendChild(li);
      });
    }

    // Main Gallery
    if (this.displayGallery) {
      this.displayGallery.innerHTML = '';
      if (this.data.gallery.length === 0) {
        this.displayGallery.innerHTML = `<p class="empty-note">등록된 갤러리 사진이 없습니다.</p>`;
      } else {
        this.data.gallery.forEach(item => {
          const fig = document.createElement('figure');
          fig.innerHTML = `<img src="${item.image}" alt="${item.title}" loading="lazy" />`;
          fig.addEventListener('click', () => this.openLightbox(item.image));
          this.displayGallery.appendChild(fig);
        });
      }
    }

    // Contact Links
    if (this.displayContact) {
      this.displayContact.innerHTML = '';
      const c = this.data.contact;
      if (c.email) this.appendContactLink(`mailto:${c.email}`, `<i class="fa-solid fa-envelope"></i> ${c.email}`);
      if (c.github) this.appendContactLink(c.github.startsWith('http') ? c.github : `https://${c.github}`, `<i class="fa-brands fa-github"></i> ${c.github}`);
      if (c.blog) this.appendContactLink(c.blog.startsWith('http') ? c.blog : `https://${c.blog}`, `<i class="fa-solid fa-globe"></i> ${c.blog}`);
      if (c.phone) this.appendContactLink(`tel:${c.phone}`, `<i class="fa-solid fa-phone"></i> ${c.phone}`);
    }
  }

  appendContactLink(href, html) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.innerHTML = html;
    this.displayContact.appendChild(a);
  }

  // Open & Populate Editor Panel
  openEditor() {
    this.populateEditor();
    if (this.editor) this.editor.removeAttribute('hidden');
  }

  closeEditor() {
    if (this.editor) this.editor.setAttribute('hidden', '');
  }

  populateEditor() {
    if (this.inputName) this.inputName.value = this.data.name;
    if (this.inputRole) this.inputRole.value = this.data.role;
    if (this.inputIntro) this.inputIntro.value = this.data.intro;
    if (this.inputPortraitCaption) this.inputPortraitCaption.value = this.data.portraitCaption;
    if (this.inputPortraitUrl) this.inputPortraitUrl.value = this.data.portrait.startsWith('http') ? this.data.portrait : '';
    if (this.inputAboutText) this.inputAboutText.value = this.data.aboutText;
    if (this.inputTags) this.inputTags.value = this.data.tags.join(', ');

    if (this.inputEmail) this.inputEmail.value = this.data.contact.email || '';
    if (this.inputGithub) this.inputGithub.value = this.data.contact.github || '';
    if (this.inputBlog) this.inputBlog.value = this.data.contact.blog || '';
    if (this.inputPhone) this.inputPhone.value = this.data.contact.phone || '';

    // Render Editor About Gallery
    if (this.editorAboutGallery) {
      this.editorAboutGallery.innerHTML = '';
      this.data.aboutPhotos.forEach((item, index) => {
        const fig = document.createElement('figure');
        fig.innerHTML = `
          <img src="${item.image}" alt="" />
          <button class="remove-photo" title="삭제">&times;</button>
        `;
        fig.querySelector('.remove-photo').addEventListener('click', () => {
          this.data.aboutPhotos.splice(index, 1);
          this.populateEditor();
          this.render();
        });
        this.editorAboutGallery.appendChild(fig);
      });
    }

    // Render Editor Gallery
    if (this.editorGalleryList) {
      this.editorGalleryList.innerHTML = '';
      this.data.gallery.forEach((item, index) => {
        const fig = document.createElement('figure');
        fig.innerHTML = `
          <img src="${item.image}" alt="" />
          <button class="remove-photo" title="삭제">&times;</button>
        `;
        fig.querySelector('.remove-photo').addEventListener('click', () => {
          this.data.gallery.splice(index, 1);
          this.populateEditor();
          this.render();
        });
        this.editorGalleryList.appendChild(fig);
      });
    }
  }

  syncEditorToData() {
    if (this.inputName) this.data.name = this.inputName.value.trim();
    if (this.inputRole) this.data.role = this.inputRole.value.trim();
    if (this.inputIntro) this.data.intro = this.inputIntro.value.trim();
    if (this.inputPortraitCaption) this.data.portraitCaption = this.inputPortraitCaption.value.trim();
    if (this.inputAboutText) this.data.aboutText = this.inputAboutText.value.trim();

    if (this.inputTags) {
      this.data.tags = this.inputTags.value
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);
    }

    if (this.inputEmail) this.data.contact.email = this.inputEmail.value.trim();
    if (this.inputGithub) this.data.contact.github = this.inputGithub.value.trim();
    if (this.inputBlog) this.data.contact.blog = this.inputBlog.value.trim();
    if (this.inputPhone) this.data.contact.phone = this.inputPhone.value.trim();
  }

  openLightbox(src) {
    if (this.lightboxImg && this.lightbox) {
      this.lightboxImg.src = src;
      this.lightbox.classList.remove('hidden');
    }
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.add('hidden');
    }, 2500);
  }

  exportJson() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📁 백업 파일이 다운로드되었습니다.');
  }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
  window.portfolio = new PortfolioManager();
});
