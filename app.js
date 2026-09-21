/**
 * My Portfolio Studio - Interactive Profile & Photo Management
 */

// Default initial state
const DEFAULT_DATA = {
  theme: 'light',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  texts: {
    heroTag: '✨ 안녕하세요! 웹을 좋아하는 개발자 / 크리에이터입니다.',
    heroName: '홍길동',
    heroTitle: 'Frontend Developer & Designer',
    heroIntro: '새로운 도전을 즐기며, 직관적이고 아름다운 사용자 경험을 만들어가는 것을 좋아합니다. 문제를 해결하는 과정에서 큰 즐거움을 느낍니다.',
    emailText: 'example@email.com',
    githubText: 'github.com/username',
    blogText: 'myblog.com',
    phoneText: '010-1234-5678',
    infoBirth: '2000. 01. 01 (20대)',
    infoLocation: '대한민국 서울',
    infoEdu: '컴퓨터공학과 재학 / 졸업',
    infoHobby: '사진 촬영, 여행, 카페 탐방, 코딩',
    infoMotto: '"어제보다 오늘 한 걸음 더 성장하자"',
    footerMsg: '방문해 주셔서 감사합니다! 언제든 편하게 연락 주세요 💌',
    footerAuthor: '홍길동'
  },
  aboutPhotos: [
    {
      id: 'about-1',
      title: '나의 일상 & 취미',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'about-2',
      title: '여행지에서',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    }
  ],
  skills: [
    { name: 'HTML5 & CSS3 / SCSS', level: 90 },
    { name: 'JavaScript / TypeScript', level: 85 },
    { name: 'React & Next.js', level: 80 },
    { name: 'UI / UX Design (Figma)', level: 75 },
    { name: 'Git & GitHub', level: 85 }
  ],
  gallery: [
    {
      id: 'gallery-1',
      title: '개인 웹 프로젝트',
      desc: '반응형 디자인과 모던 UI를 적용한 포트폴리오 웹사이트 제작',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      tags: ['Project', 'Web', 'React']
    },
    {
      id: 'gallery-2',
      title: '제주도 여행 스냅',
      desc: '에메랄드빛 바다와 노을을 담은 일상 여행 기록',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      tags: ['Travel', 'Photo', 'Daily']
    },
    {
      id: 'gallery-3',
      title: '작업 데스크 셋업',
      desc: '생산성을 높여주는 미니멀한 듀얼 모니터 데스크 환경',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
      tags: ['Workspace', 'Setup']
    }
  ],
  timeline: [
    {
      id: 'time-1',
      title: '멋쟁이사자처럼 프론트엔드 부트캠프',
      period: '2023.03 - 2023.09',
      role: '프론트엔드 수료 및 팀 프로젝트 우수상',
      desc: '웹 기초부터 컴포넌트 아키텍처, 실무 협업 프로젝트를 완수했습니다.'
    },
    {
      id: 'time-2',
      title: 'IT 스타트업 인턴십',
      period: '2023.10 - 2024.02',
      role: '웹 프론트엔드 개발 인턴',
      desc: '고객 관리 대시보드 UI 구현 및 웹 성능 최적화 작업을 담당했습니다.'
    }
  ]
};

class PortfolioApp {
  constructor() {
    this.data = this.loadData();
    this.isEditMode = false;
    this.urlTargetCallback = null;

    this.initDOM();
    this.bindEvents();
    this.render();
  }

  // Load from localStorage with defaults fallback
  loadData() {
    try {
      const stored = localStorage.getItem('my_portfolio_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          texts: { ...DEFAULT_DATA.texts, ...(parsed.texts || {}) },
          aboutPhotos: parsed.aboutPhotos || DEFAULT_DATA.aboutPhotos,
          skills: parsed.skills || DEFAULT_DATA.skills,
          gallery: parsed.gallery || DEFAULT_DATA.gallery,
          timeline: parsed.timeline || DEFAULT_DATA.timeline
        };
      }
    } catch (e) {
      console.warn('Failed to load from storage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  // Save to localStorage
  saveData() {
    this.collectDOMData();
    try {
      localStorage.setItem('my_portfolio_data', JSON.stringify(this.data));
      this.showToast('✅ 변경사항이 안전하게 저장되었습니다!');
    } catch (e) {
      console.error('Storage quota exceeded or error:', e);
      this.showToast('⚠️ 브라우저 저장소 용량이 초과되었습니다. 이미지 크기를 줄여보세요.');
    }
  }

  initDOM() {
    // Toolbar Buttons
    this.btnEditMode = document.getElementById('btnEditMode');
    this.btnSave = document.getElementById('btnSave');
    this.btnTheme = document.getElementById('btnTheme');
    this.btnMore = document.getElementById('btnMore');
    this.moreMenu = document.getElementById('moreMenu');
    this.editBanner = document.getElementById('editBanner');

    // Profile photo elements
    this.profileContainer = document.getElementById('profileContainer');
    this.profileImage = document.getElementById('profileImage');
    this.profileFileInput = document.getElementById('profileFileInput');
    this.btnProfileFile = document.getElementById('btnProfileFile');
    this.btnProfileUrl = document.getElementById('btnProfileUrl');
    this.btnProfileDelete = document.getElementById('btnProfileDelete');

    // About Me Photos Elements
    this.btnAddAboutPhoto = document.getElementById('btnAddAboutPhoto');
    this.aboutPhotoDropzone = document.getElementById('aboutPhotoDropzone');
    this.aboutPhotoFileInput = document.getElementById('aboutPhotoFileInput');
    this.aboutPhotosGrid = document.getElementById('aboutPhotosGrid');

    // Main Gallery Elements
    this.galleryGrid = document.getElementById('galleryGrid');
    this.galleryDropZone = document.getElementById('galleryDropZone');
    this.galleryFileInput = document.getElementById('galleryFileInput');
    this.btnAddPhoto = document.getElementById('btnAddPhoto');

    // Skills & Timeline
    this.skillsList = document.getElementById('skillsList');
    this.btnAddSkill = document.getElementById('btnAddSkill');
    this.timelineList = document.getElementById('timelineList');
    this.btnAddTimeline = document.getElementById('btnAddTimeline');

    // URL Modal
    this.urlModal = document.getElementById('urlModal');
    this.urlInput = document.getElementById('urlInput');
    this.urlPreview = document.getElementById('urlPreview');
    this.urlPreviewImg = document.getElementById('urlPreviewImg');
    this.btnConfirmUrlModal = document.getElementById('btnConfirmUrlModal');
    this.btnCancelUrlModal = document.getElementById('btnCancelUrlModal');
    this.btnCloseUrlModal = document.getElementById('btnCloseUrlModal');

    // Lightbox Modal
    this.lightboxModal = document.getElementById('lightboxModal');
    this.lightboxImg = document.getElementById('lightboxImg');
    this.lightboxCaption = document.getElementById('lightboxCaption');
    this.btnCloseLightbox = document.getElementById('btnCloseLightbox');

    // Dropdown Actions
    this.btnExportJson = document.getElementById('btnExportJson');
    this.importJsonInput = document.getElementById('importJsonInput');
    this.btnPrint = document.getElementById('btnPrint');
    this.btnReset = document.getElementById('btnReset');

    // Toast
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toastMessage');

    // Year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  bindEvents() {
    // Toolbar actions
    this.btnEditMode.addEventListener('click', () => this.toggleEditMode());
    this.btnSave.addEventListener('click', () => this.saveData());
    this.btnTheme.addEventListener('click', () => this.toggleTheme());

    this.btnMore.addEventListener('click', (e) => {
      e.stopPropagation();
      this.moreMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      this.moreMenu.classList.remove('show');
    });

    this.btnReset.addEventListener('click', () => this.resetData());
    this.btnExportJson.addEventListener('click', () => this.exportJson());
    this.importJsonInput.addEventListener('change', (e) => this.importJson(e));
    this.btnPrint.addEventListener('click', () => window.print());

    // ==========================================
    // 1. Profile Image Events
    // ==========================================
    const triggerProfileUpload = () => {
      this.profileFileInput.value = '';
      this.profileFileInput.click();
    };

    this.profileContainer.addEventListener('click', triggerProfileUpload);
    this.btnProfileFile.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerProfileUpload();
    });

    this.profileFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.processImageFile(file, (dataUrl) => {
          this.data.profileImage = dataUrl;
          this.profileImage.src = dataUrl;
          this.showToast('📷 프로필 사진이 성공적으로 변경되었습니다!');
          this.saveData();
        });
      }
    });

    // Profile Drag and drop
    ['dragenter', 'dragover'].forEach(name => {
      this.profileContainer.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.profileContainer.style.borderColor = 'var(--primary)';
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      this.profileContainer.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.profileContainer.style.borderColor = '';
      });
    });

    this.profileContainer.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processImageFile(file, (dataUrl) => {
          this.data.profileImage = dataUrl;
          this.profileImage.src = dataUrl;
          this.showToast('📷 프로필 사진이 업데이트되었습니다!');
          this.saveData();
        });
      }
    });

    this.btnProfileUrl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openUrlModal('프로필 사진 URL 입력', (url) => {
        this.data.profileImage = url;
        this.profileImage.src = url;
        this.showToast('📷 프로필 사진이 URL로 변경되었습니다!');
        this.saveData();
      });
    });

    this.btnProfileDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('프로필 사진을 기본 이미지로 초기화할까요?')) {
        this.data.profileImage = DEFAULT_DATA.profileImage;
        this.profileImage.src = this.data.profileImage;
        this.showToast('프로필 사진이 초기화되었습니다.');
        this.saveData();
      }
    });

    // ==========================================
    // 2. About Me Section Photos (내 소개 사진)
    // ==========================================
    const triggerAboutPhotoUpload = () => {
      this.aboutPhotoFileInput.value = '';
      this.aboutPhotoFileInput.click();
    };

    this.btnAddAboutPhoto.addEventListener('click', triggerAboutPhotoUpload);
    this.aboutPhotoDropzone.addEventListener('click', triggerAboutPhotoUpload);

    this.aboutPhotoFileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        this.handleAboutPhotosUpload(files);
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      this.aboutPhotoDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.aboutPhotoDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      this.aboutPhotoDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.aboutPhotoDropzone.classList.remove('dragover');
      });
    });

    this.aboutPhotoDropzone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        this.handleAboutPhotosUpload(files);
      }
    });

    // ==========================================
    // 3. Main Gallery Photos
    // ==========================================
    const triggerGalleryUpload = () => {
      this.galleryFileInput.value = '';
      this.galleryFileInput.click();
    };

    this.btnAddPhoto.addEventListener('click', triggerGalleryUpload);
    this.galleryDropZone.addEventListener('click', triggerGalleryUpload);

    this.galleryFileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        this.handleMultipleGalleryUpload(files);
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      this.galleryDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.galleryDropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      this.galleryDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.galleryDropZone.classList.remove('dragover');
      });
    });

    this.galleryDropZone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        this.handleMultipleGalleryUpload(files);
      }
    });

    // ==========================================
    // 4. Clipboard Paste Support (Ctrl+V / Cmd+V)
    // ==========================================
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            this.processImageFile(file, (dataUrl) => {
              const newItem = {
                id: 'about-' + Date.now(),
                title: '클립보드 사진',
                image: dataUrl
              };
              this.data.aboutPhotos.push(newItem);
              this.renderAboutPhotos();
              this.showToast('📋 클립보드 사진이 내 소개에 추가되었습니다!');
              this.saveData();
            });
            break;
          }
        }
      }
    });

    // Add Skill & Timeline
    this.btnAddSkill.addEventListener('click', () => this.addSkillItem());
    this.btnAddTimeline.addEventListener('click', () => this.addTimelineItem());

    // Modal controls
    this.btnCloseUrlModal.addEventListener('click', () => this.closeUrlModal());
    this.btnCancelUrlModal.addEventListener('click', () => this.closeUrlModal());
    this.urlModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeUrlModal());

    this.btnConfirmUrlModal.addEventListener('click', () => {
      const url = this.urlInput.value.trim();
      if (url && this.urlTargetCallback) {
        this.urlTargetCallback(url);
        this.closeUrlModal();
      } else {
        alert('올바른 이미지 URL을 입력해주세요.');
      }
    });

    this.urlInput.addEventListener('input', () => {
      const val = this.urlInput.value.trim();
      if (val) {
        this.urlPreviewImg.src = val;
        this.urlPreviewImg.classList.remove('hidden');
      } else {
        this.urlPreviewImg.classList.add('hidden');
      }
    });

    // Lightbox Controls
    this.btnCloseLightbox.addEventListener('click', () => this.closeLightbox());
    this.lightboxModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeLightbox());
  }

  // Client-side Smart Image Compression & Resizing
  processImageFile(file, callback) {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Target maximum dimension
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

        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(format, 0.85);
        callback(compressedDataUrl);
      };
      img.onerror = () => {
        alert('이미지를 불러오는 중 문제가 발생했습니다.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  handleAboutPhotosUpload(files) {
    let loadedCount = 0;
    files.forEach(file => {
      this.processImageFile(file, (dataUrl) => {
        const newItem = {
          id: 'about-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          title: file.name.replace(/\.[^/.]+$/, "") || '소개 사진',
          image: dataUrl
        };
        this.data.aboutPhotos.push(newItem);
        loadedCount++;
        if (loadedCount === files.length) {
          this.renderAboutPhotos();
          this.showToast(`📸 내 소개에 ${files.length}장의 사진이 추가되었습니다!`);
          this.saveData();
        }
      });
    });
  }

  handleMultipleGalleryUpload(files) {
    let loadedCount = 0;
    files.forEach(file => {
      this.processImageFile(file, (dataUrl) => {
        const newItem = {
          id: 'gallery-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          title: file.name.replace(/\.[^/.]+$/, "") || '새로운 사진',
          desc: '사진에 대한 설명을 여기에 적어보세요.',
          image: dataUrl,
          tags: ['Photo']
        };
        this.data.gallery.unshift(newItem);
        loadedCount++;
        if (loadedCount === files.length) {
          this.renderGallery();
          this.showToast(`📸 갤러리에 ${files.length}장의 사진이 추가되었습니다!`);
          this.saveData();
        }
      });
    });
  }

  // ==========================================
  // Render Functions
  // ==========================================
  render() {
    // Theme
    if (this.data.theme === 'dark') {
      document.body.classList.add('theme-dark');
      this.btnTheme.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      document.body.classList.remove('theme-dark');
      this.btnTheme.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    // Profile Image
    this.profileImage.src = this.data.profileImage || DEFAULT_DATA.profileImage;

    // Text fields
    document.querySelectorAll('.editable[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      if (key && this.data.texts[key] !== undefined) {
        el.textContent = this.data.texts[key];
      }
    });

    // Links update
    const chipEmail = document.getElementById('chipEmail');
    if (chipEmail && this.data.texts.emailText) chipEmail.href = `mailto:${this.data.texts.emailText}`;

    const chipPhone = document.getElementById('chipPhone');
    if (chipPhone && this.data.texts.phoneText) chipPhone.href = `tel:${this.data.texts.phoneText}`;

    const chipGithub = document.getElementById('chipGithub');
    if (chipGithub && this.data.texts.githubText) {
      let g = this.data.texts.githubText;
      if (!g.startsWith('http')) g = 'https://' + g;
      chipGithub.href = g;
    }

    const chipBlog = document.getElementById('chipBlog');
    if (chipBlog && this.data.texts.blogText) {
      let b = this.data.texts.blogText;
      if (!b.startsWith('http')) b = 'https://' + b;
      chipBlog.href = b;
    }

    this.renderAboutPhotos();
    this.renderSkills();
    this.renderGallery();
    this.renderTimeline();
    this.updateEditModeAttributes();
  }

  renderAboutPhotos() {
    this.aboutPhotosGrid.innerHTML = '';
    if (!this.data.aboutPhotos || this.data.aboutPhotos.length === 0) {
      this.aboutPhotosGrid.innerHTML = `<div style="grid-column: 1/-1; font-size:0.85rem; color:var(--text-muted); text-align:center; padding:12px;">등록된 소개 사진이 없습니다. 상단 버튼이나 영역을 눌러 사진을 추가해보세요!</div>`;
      return;
    }

    this.data.aboutPhotos.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'about-photo-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <span class="about-photo-caption">${item.title}</span>
        <button class="about-photo-delete" title="사진 삭제"><i class="fa-solid fa-xmark"></i></button>
      `;

      // Click to view in Lightbox
      card.querySelector('img').addEventListener('click', () => {
        this.openLightbox(item.image, item.title);
      });

      // Delete
      card.querySelector('.about-photo-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('이 소개 사진을 삭제하시겠습니까?')) {
          this.data.aboutPhotos.splice(index, 1);
          this.renderAboutPhotos();
          this.showToast('소개 사진이 삭제되었습니다.');
          this.saveData();
        }
      });

      this.aboutPhotosGrid.appendChild(card);
    });
  }

  renderSkills() {
    this.skillsList.innerHTML = '';
    this.data.skills.forEach((skill, index) => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      item.innerHTML = `
        <div class="skill-header">
          <span class="skill-name editable" contenteditable="${this.isEditMode}">${skill.name}</span>
          <span class="skill-pct editable" contenteditable="${this.isEditMode}">${skill.level}%</span>
        </div>
        <div class="skill-bar-wrapper">
          <div class="skill-bar-progress" style="width: ${skill.level}%;"></div>
        </div>
        <button class="skill-delete-btn" title="스킬 삭제"><i class="fa-solid fa-xmark"></i></button>
      `;

      // Change level
      const pctEl = item.querySelector('.skill-pct');
      const barEl = item.querySelector('.skill-bar-progress');
      pctEl.addEventListener('blur', () => {
        let val = parseInt(pctEl.textContent) || 0;
        val = Math.max(0, Math.min(100, val));
        pctEl.textContent = `${val}%`;
        barEl.style.width = `${val}%`;
        this.data.skills[index].level = val;
      });

      const nameEl = item.querySelector('.skill-name');
      nameEl.addEventListener('blur', () => {
        this.data.skills[index].name = nameEl.textContent.trim();
      });

      // Delete
      item.querySelector('.skill-delete-btn').addEventListener('click', () => {
        this.data.skills.splice(index, 1);
        this.renderSkills();
        this.saveData();
      });

      this.skillsList.appendChild(item);
    });
  }

  renderGallery() {
    this.galleryGrid.innerHTML = '';
    this.data.gallery.forEach((card, index) => {
      const el = document.createElement('div');
      el.className = 'gallery-card';
      el.innerHTML = `
        <div class="gallery-card-img-wrapper">
          <img src="${card.image}" alt="${card.title}" loading="lazy" />
          <div class="gallery-card-actions">
            <button class="gallery-action-btn btn-change-img" title="사진 파일 변경">
              <i class="fa-solid fa-camera"></i>
            </button>
            <button class="gallery-action-btn btn-change-url" title="사진 URL 변경">
              <i class="fa-solid fa-link"></i>
            </button>
            <button class="gallery-action-btn btn-delete" title="카드 삭제">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
          <input type="file" accept="image/*" class="file-input-hidden card-file-input" />
        </div>
        <div class="gallery-card-body">
          <h3 class="gallery-card-title editable" contenteditable="${this.isEditMode}">${card.title}</h3>
          <p class="gallery-card-desc editable" contenteditable="${this.isEditMode}">${card.desc}</p>
          <div class="gallery-card-tags">
            ${card.tags.map(t => `<span class="gallery-tag editable" contenteditable="${this.isEditMode}">${t}</span>`).join('')}
          </div>
        </div>
      `;

      // Photo Click -> Lightbox (when clicking the image directly)
      el.querySelector('.gallery-card-img-wrapper img').addEventListener('click', () => {
        this.openLightbox(card.image, card.title + ' - ' + card.desc);
      });

      // Photo Replace File
      const fileInput = el.querySelector('.card-file-input');
      const btnChangeImg = el.querySelector('.btn-change-img');
      btnChangeImg.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.processImageFile(file, (dataUrl) => {
            this.data.gallery[index].image = dataUrl;
            el.querySelector('img').src = dataUrl;
            this.showToast('📸 사진이 성공적으로 변경되었습니다!');
            this.saveData();
          });
        }
      });

      // Photo Replace URL
      const btnChangeUrl = el.querySelector('.btn-change-url');
      btnChangeUrl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openUrlModal('카드 사진 URL 입력', (url) => {
          this.data.gallery[index].image = url;
          el.querySelector('img').src = url;
          this.showToast('📸 사진 URL이 적용되었습니다!');
          this.saveData();
        });
      });

      // Card Delete
      el.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('이 사진 카드를 삭제할까요?')) {
          this.data.gallery.splice(index, 1);
          this.renderGallery();
          this.showToast('사진 카드가 삭제되었습니다.');
          this.saveData();
        }
      });

      // Live Text Edits
      const titleEl = el.querySelector('.gallery-card-title');
      titleEl.addEventListener('blur', () => {
        this.data.gallery[index].title = titleEl.textContent.trim();
      });

      const descEl = el.querySelector('.gallery-card-desc');
      descEl.addEventListener('blur', () => {
        this.data.gallery[index].desc = descEl.textContent.trim();
      });

      this.galleryGrid.appendChild(el);
    });
  }

  renderTimeline() {
    this.timelineList.innerHTML = '';
    this.data.timeline.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'timeline-item';
      el.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-header">
          <h3 class="timeline-title editable" contenteditable="${this.isEditMode}">
            ${item.title}
            <button class="timeline-delete-btn" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
          </h3>
          <span class="timeline-period editable" contenteditable="${this.isEditMode}">${item.period}</span>
        </div>
        <div class="timeline-role editable" contenteditable="${this.isEditMode}">${item.role}</div>
        <div class="timeline-desc editable" contenteditable="${this.isEditMode}">${item.desc}</div>
      `;

      // Live edits
      const titleEl = el.querySelector('.timeline-title');
      const periodEl = el.querySelector('.timeline-period');
      const roleEl = el.querySelector('.timeline-role');
      const descEl = el.querySelector('.timeline-desc');

      periodEl.addEventListener('blur', () => {
        this.data.timeline[index].period = periodEl.textContent.trim();
      });
      roleEl.addEventListener('blur', () => {
        this.data.timeline[index].role = roleEl.textContent.trim();
      });
      descEl.addEventListener('blur', () => {
        this.data.timeline[index].desc = descEl.textContent.trim();
      });

      el.querySelector('.timeline-delete-btn').addEventListener('click', () => {
        this.data.timeline.splice(index, 1);
        this.renderTimeline();
        this.saveData();
      });

      this.timelineList.appendChild(el);
    });
  }

  // ==========================================
  // Actions & Helpers
  // ==========================================
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    document.body.classList.toggle('body-edit-mode', this.isEditMode);

    if (this.isEditMode) {
      this.btnEditMode.classList.remove('btn-primary');
      this.btnEditMode.classList.add('btn-secondary');
      this.btnEditMode.innerHTML = '<i class="fa-solid fa-check"></i> <span class="btn-text">편집 완료</span>';
      this.editBanner.classList.remove('hidden');
      this.showToast('✏️ 편집 모드가 켜졌습니다. 텍스트를 클릭해 직접 수정하세요!');
    } else {
      this.btnEditMode.classList.add('btn-primary');
      this.btnEditMode.classList.remove('btn-secondary');
      this.btnEditMode.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> <span class="btn-text">편집 모드 켜기</span>';
      this.editBanner.classList.add('hidden');
      this.saveData();
    }

    this.updateEditModeAttributes();
  }

  updateEditModeAttributes() {
    document.querySelectorAll('.editable').forEach(el => {
      el.setAttribute('contenteditable', this.isEditMode ? 'true' : 'false');
    });
  }

  toggleTheme() {
    this.data.theme = this.data.theme === 'dark' ? 'light' : 'dark';
    this.render();
    this.saveData();
  }

  collectDOMData() {
    document.querySelectorAll('.editable[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      this.data.texts[key] = el.textContent.trim();
    });
  }

  addSkillItem() {
    this.data.skills.push({ name: '새로운 보유 기술', level: 80 });
    this.renderSkills();
    this.showToast('새로운 기술 항목이 추가되었습니다.');
    this.saveData();
  }

  addTimelineItem() {
    this.data.timeline.push({
      id: 'time-' + Date.now(),
      title: '새로운 활동 / 프로젝트명',
      period: '2024.01 - 2024.12',
      role: '담당 역할 또는 직무',
      desc: '진행한 업무 내용과 배운 점을 자세히 적어보세요.'
    });
    this.renderTimeline();
    this.showToast('새로운 이력 항목이 추가되었습니다.');
    this.saveData();
  }

  // URL Modal
  openUrlModal(title, callback) {
    document.getElementById('urlModalTitle').textContent = title;
    this.urlInput.value = '';
    this.urlPreviewImg.src = '';
    this.urlPreviewImg.classList.add('hidden');
    this.urlTargetCallback = callback;
    this.urlModal.classList.remove('hidden');
    setTimeout(() => this.urlInput.focus(), 50);
  }

  closeUrlModal() {
    this.urlModal.classList.add('hidden');
    this.urlTargetCallback = null;
  }

  // Lightbox
  openLightbox(src, caption) {
    this.lightboxImg.src = src;
    this.lightboxCaption.textContent = caption || '';
    this.lightboxModal.classList.remove('hidden');
  }

  closeLightbox() {
    this.lightboxModal.classList.add('hidden');
  }

  // Toast
  showToast(msg) {
    this.toastMessage.textContent = msg;
    this.toast.classList.remove('hidden');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.add('hidden');
    }, 2800);
  }

  // Backup & Restore
  exportJson() {
    this.collectDOMData();
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📁 데이터가 JSON 파일로 다운로드되었습니다.');
  }

  importJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.texts && json.skills) {
          this.data = { ...DEFAULT_DATA, ...json };
          this.render();
          this.saveData();
          this.showToast('🎉 데이터를 성공적으로 불러왔습니다!');
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파일을 읽는 중 오류가 발생했습니다: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  resetData() {
    if (confirm('모든 내용을 기본 예시 템플릿으로 되돌리시겠습니까? 작성한 내용이 삭제됩니다.')) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      localStorage.removeItem('my_portfolio_data');
      this.render();
      this.showToast('기본 예시로 초기화되었습니다.');
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PortfolioApp();
});
