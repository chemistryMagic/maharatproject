// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const loadingScreen = document.getElementById("loading-screen")
    const mainContent = document.getElementById("main-content")
    const downloadBtn = document.getElementById("download-btn")
    const addNoteBtn = document.getElementById("add-note-btn")
    const noteModal = document.getElementById("note-modal")
    const closeBtn = document.querySelector(".close-btn")
    const noteForm = document.getElementById("note-form")
    const notesContainer = document.getElementById("notes-container")
    const themeSwitch = document.getElementById("theme-switch")
    const noteTextarea = document.getElementById("note-text")
    const charCount = document.getElementById("char-count")
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
    const navMenu = document.querySelector(".nav-menu")
    const navLinks = document.querySelectorAll(".nav-menu a")
    const header = document.querySelector(".header")
  
    // API endpoints
    const API_URL = "/api"
  
    // Sample notes colors
    const noteColors = [
      { bg: "#ffadad", text: "#800000" },
      { bg: "#ffd6a5", text: "#805b00" },
      { bg: "#fdffb6", text: "#807b00" },
      { bg: "#caffbf", text: "#008000" },
      { bg: "#9bf6ff", text: "#006380" },
      { bg: "#a0c4ff", text: "#004080" },
      { bg: "#bdb2ff", text: "#3a0080" },
      { bg: "#ffc6ff", text: "#800080" },
    ]
  
    // Initialize animations
    function initAnimations() {
      // Reveal animations on scroll
      const revealElements = document.querySelectorAll(".reveal-text, .reveal-item")
  
      const revealOnScroll = () => {
        revealElements.forEach((element) => {
          const elementTop = element.getBoundingClientRect().top
          const windowHeight = window.innerHeight
  
          if (elementTop < windowHeight - 100) {
            element.classList.add("active")
          }
        })
      }
  
      // Initial check
      revealOnScroll()
  
      // Add scroll event listener
      window.addEventListener("scroll", revealOnScroll)
    }
  
    // Theme toggle functionality
    function initThemeToggle() {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme === "dark") {
        document.body.classList.add("dark-mode")
        themeSwitch.checked = true
      }
  
      // Theme switch event listener
      themeSwitch.addEventListener("change", function () {
        if (this.checked) {
          document.body.classList.add("dark-mode")
          localStorage.setItem("theme", "dark")
        } else {
          document.body.classList.remove("dark-mode")
          localStorage.setItem("theme", "light")
        }
      })
    }
  
    // Mobile menu functionality
    function initMobileMenu() {
      mobileMenuBtn.addEventListener("click", function () {
        this.classList.toggle("active")
        navMenu.classList.toggle("active")
      })
  
      // Close mobile menu when clicking a link
      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          mobileMenuBtn.classList.remove("active")
          navMenu.classList.remove("active")
        })
      })
    }
  
    // Header scroll effect
    function initHeaderScroll() {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
          header.classList.add("scrolled")
        } else {
          header.classList.remove("scrolled")
        }
      })
    }
  
    // Active navigation link
    function initActiveNavLink() {
      const sections = document.querySelectorAll("section")
  
      window.addEventListener("scroll", () => {
        let current = ""
  
        sections.forEach((section) => {
          const sectionTop = section.offsetTop
          const sectionHeight = section.clientHeight
  
          if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute("id")
          }
        })
  
        navLinks.forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active")
          }
        })
      })
    }
  
    // Character counter for textarea
    function initCharCounter() {
      noteTextarea.addEventListener("input", function () {
        const currentLength = this.value.length
        charCount.textContent = currentLength
  
        // Change color when approaching limit
        if (currentLength > 1400) {
          charCount.style.color = "#ff6b6b"
        } else {
          charCount.style.color = ""
        }
      })
    }
  
    // Simulate loading time
    setTimeout(() => {
      loadingScreen.style.opacity = "0"
      setTimeout(() => {
        loadingScreen.style.display = "none"
        mainContent.style.opacity = "1"
  
        // Initialize animations after content is visible
        initAnimations()
      }, 500)
    }, 2500)
  
    // Fetch notes from server
    async function fetchNotes() {
      try {
        const response = await fetch(`${API_URL}/notes`)
        if (!response.ok) {
          throw new Error("Failed to fetch notes")
        }
        const data = await response.json()
        return data.notes
      } catch (error) {
        console.error("Error fetching notes:", error)
        showMessage("Error loading notes. Please try again later.", "error")
        return []
      }
    }
  
    // Save note to server
    async function saveNote(note) {
      try {
        const response = await fetch(`${API_URL}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(note),
        })
  
        if (!response.ok) {
          throw new Error("Failed to save note")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error saving note:", error)
        showMessage("Error saving note. Please try again later.", "error")
        return null
      }
    }
  
    // Render notes in the container
    function renderNotes(notes) {
      notesContainer.innerHTML = ""
  
      if (!notes || notes.length === 0) {
        const emptyMessage = document.createElement("div")
        emptyMessage.className = "empty-notes"
        emptyMessage.textContent = "لا يوجد ملاحظات."
        notesContainer.appendChild(emptyMessage)
        return
      }
  
      notes.forEach((note) => {
        const noteElement = document.createElement("div")
        noteElement.className = "note"
  
        // Use saved color or default
        const color = note.color || noteColors[0]
  
        // Random rotation between -5 and 5 degrees
        const rotation = Math.random() * 10 - 5
  
        noteElement.style.setProperty("--rotation", `${rotation}deg`)
        noteElement.style.backgroundColor = color.bg
        noteElement.style.color = color.text
  
        const authorElement = document.createElement("div")
        authorElement.className = "note-author"
        authorElement.textContent = note.name
  
        const textElement = document.createElement("div")
        textElement.className = "note-text"
        textElement.textContent = note.text
  
        noteElement.appendChild(authorElement)
        noteElement.appendChild(textElement)
        notesContainer.appendChild(noteElement)
      })
    }
  
    // Show message (error or success)
    function showMessage(message, type) {
      const messageElement = document.createElement("div")
      messageElement.className = `message ${type}`
      messageElement.textContent = message
  
      // If inside modal, add to modal
      if (noteModal.style.display === "flex") {
        const form = document.getElementById("note-form")
        form.parentNode.insertBefore(messageElement, form)
      } else {
        // Otherwise add to notes container
        notesContainer.innerHTML = ""
        notesContainer.appendChild(messageElement)
      }
  
      // Remove message after 5 seconds
      setTimeout(() => {
        messageElement.remove()
      }, 5000)
    }
  
    // Load notes
    async function loadNotes() {
      const notes = await fetchNotes()
      renderNotes(notes)
    }
  
    // Open modal
    addNoteBtn.addEventListener("click", () => {
      noteModal.style.display = "flex"
      setTimeout(() => {
        noteModal.classList.add("show")
      }, 10)
    })
  
    // Close modal
    closeBtn.addEventListener("click", () => {
      noteModal.classList.remove("show")
      setTimeout(() => {
        noteModal.style.display = "none"
      }, 300)
    })
  
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === noteModal) {
        noteModal.classList.remove("show")
        setTimeout(() => {
          noteModal.style.display = "none"
        }, 300)
      }
    })
  
    // Handle form submission
    noteForm.addEventListener("submit", async (event) => {
      event.preventDefault()
  
      const name = document.getElementById("name").value.trim()
      const text = document.getElementById("note-text").value.trim()
  
      if (name && text) {
        // Get random color
        const colorIndex = Math.floor(Math.random() * noteColors.length)
        const color = noteColors[colorIndex]
  
        // Create new note
        const newNote = {
          name: name,
          text: text,
          date: new Date().toISOString(),
          color: color,
        }
  
        // Save note to server
        const result = await saveNote(newNote)
  
        if (result && result.success) {
          // Reload notes
          await loadNotes()
  
          // Reset form and close modal
          noteForm.reset()
          charCount.textContent = "0"
  
          noteModal.classList.remove("show")
          setTimeout(() => {
            noteModal.style.display = "none"
          }, 300)
  
          showMessage("Note added successfully!", "success")
        }
      }
    })
  
    // Handle download button click
    downloadBtn.addEventListener("click", async () => {
        const link = document.createElement("a")
        link.href = "./project_file.pdf"
        link.download = "project_file.pdf"
        document.body.appendChild(link)
        link.click()
  
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)
    })
  
    // Initialize
    initThemeToggle()
    initMobileMenu()
    initHeaderScroll()
    initActiveNavLink()
    initCharCounter()
    loadNotes()
  })
  
