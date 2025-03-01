document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const menuToggle = document.getElementById('menuToggle');
    const leftMenu = document.getElementById('leftMenu');
    const body = document.body;
    const pageWrapper = document.querySelector('.page-wrapper'); // new line

    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userJoinedElement = document.getElementById('user-joined');
    const editUserNameInput = document.getElementById('edit-user-name');
    const editUserEmailInput = document.getElementById('edit-user-email');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    const userChatList = document.getElementById('userChatList');
    const messageBox = document.getElementById('messageBox');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    let recipientId = null;
    let socket = null;

    let isDarkMode = localStorage.getItem('theme') === 'dark-mode';
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }

    // --- Scaling Function ---
    function adjustPageSize() {
        const screenWidth = window.innerWidth;
        let scale = 1;

        if (screenWidth >= 992 && screenWidth <= 1600) {
            scale = 0.9;
        } else if (screenWidth >= 700 && screenWidth <= 767) {
            scale = 0.8;
        } else if (screenWidth >= 600 && screenWidth < 700) {
            scale = 0.75;
        } else if (screenWidth <= 600) {
            scale = 0.5;
        }

         pageWrapper.style.transform = `scale(${scale})`;
       pageWrapper.style.width = `${100 / scale}%`;

    }
    // --- End Scaling Function ---

    // --- Helper Functions ---
    function toggleEditProfileForm(show) {
        editProfileForm.classList.toggle('hidden', !show);
    }

    function saveProfileChanges() {
        const newUserName = editUserNameInput.value.trim();
        const newUserEmail = editUserEmailInput.value.trim();

        if (newUserName) {
            userNameElement.textContent = newUserName;
        }
        if (newUserEmail) {
            userEmailElement.textContent = `Email: ${newUserEmail}`;
        }
        toggleEditProfileForm(false);
    }

    function connectWebSocket() {
        socket = new WebSocket(wsUrl);
        socket.onopen = function(event) {
            console.log('WebSocket connected');
        };
        socket.onclose = function(event) {
            console.log('WebSocket disconnected. Attempting to reconnect in 3 seconds...');
            setTimeout(connectWebSocket, 3000);
        };
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            displayMessage(data);
        };
        socket.onerror = function(event) {
            console.error("WebSocket error:", event);
        };
    }

    connectWebSocket();

    function displayMessage(data) {
        const messageDiv = document.createElement('p');
        messageDiv.textContent = data.message;
        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = data.timestamp ? formatDate(data.timestamp) : getCurrentTime();
        timestampSpan.classList.add('timestamp');
        messageDiv.appendChild(timestampSpan);
        if (data.is_mine) {
            messageDiv.classList.add('my-message');
        } else {
            messageDiv.classList.add('other-message');
        }
        messageBox.appendChild(messageDiv);
        messageBox.scrollTop = messageBox.scrollHeight;
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    }

    function fetchOldMessages(userId) {
        messageBox.innerHTML = '';
        fetch(`/messages/${userId}/`)
            .then(response => response.json())
            .then(data => {
                data.messages.forEach(msg => {
                    displayMessage(msg);
                });
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
    // --- End Helper Functions ---

    // --- Event Listeners ---
    document.addEventListener('DOMContentLoaded',function(){
        const menuToggle = document.getElementById('menuToggle');
        const leftMenu = document.getElementById('leftMenu');

    menuToggle.addEventListener('click', function() {
        leftMenu.classList.toggle('collapsed');
    });
    });
    userChatList.querySelectorAll('li').forEach(user => {
        user.addEventListener('click', function() {
            recipientId = this.getAttribute('data-user-id');
            fetchOldMessages(recipientId);
             userChatList.querySelectorAll('li').forEach(li => {
                li.classList.remove('active');
            });
             this.classList.add('active');
             if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({type: 'add_to_chat_group', recipient_id: recipientId}));
             }
        });
    });
    sendBtn.addEventListener('click', function() {
         const message = messageInput.value.trim();
          if (message && recipientId) {
              if(socket && socket.readyState === WebSocket.OPEN){
                  socket.send(JSON.stringify({
                      message: message,
                        recipient_id: recipientId
                  }));
                  messageInput.value = '';
               }else{
                   console.log("Websocket is not connected!");
               }
          }
    });

    document.querySelectorAll('.enroll-button').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const courseId = this.getAttribute('data-course-id');
            alert(`Enrolling in course with ID: ${courseId}`);
        });
    });

    document.querySelectorAll('.resource-item a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const resourceId = this.getAttribute('data-resource-id');
            const resourceType = this.getAttribute('data-resource-type');
            alert(`Viewing resource with ID: ${resourceId}, Type: ${resourceType}`);
        });
    });

    editProfileBtn.addEventListener('click', function() {
        toggleEditProfileForm(true);
    });
    cancelProfileBtn.addEventListener('click', function() {
        toggleEditProfileForm(false);
    });
    saveProfileBtn.addEventListener('click', function() {
        saveProfileChanges();
    });
    themeToggleBtn.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light-mode');
    });
      // --- End Event Listeners ---

      // --- Initial Setup and Data Population ---
     // Initial scaling adjustment
    adjustPageSize();
    window.addEventListener('resize', adjustPageSize);

    const courses = [
        {
            id: 1,
            title: 'Introduction to Programming',
            description: 'Learn the fundamentals of programming with hands-on exercises.',
            image: '/static/hub/course1.jpg',
            link: '#'
        },
        {
            id: 2,
            title: 'Web Development Basics',
            description: 'Dive into web development, learn HTML, CSS, and JavaScript.',
            image: '/static/hub/course2.jpg',
            link: '#'
        },
        {
            id: 3,
            title: 'Data Structures and Algorithms',
            description: 'Explore data structures and algorithms for effective problem-solving',
            image: '/static/hub/course3.jpg',
            link: '#'
        }
    ];
   const resources = [
         {
            id: 1,
            title: 'Programming Basics PDF',
            description: 'Download PDF',
           icon: 'fas fa-file-pdf',
            link: '#'
        },
        {
            id: 2,
            title: 'Web Development Article',
           description: 'Text Article',
           icon: 'fas fa-file-alt',
           link: '#'
         },
        {
            id: 3,
             title: 'Algorithms Tutorial',
             description: 'Video Tutorial',
            icon: 'fas fa-video',
           link: '#'
        }
   ];
     const announcements = [
        {
            id: 1,
           title: 'New Course Added: Advanced JavaScript',
           description: 'We\'re excited to announce our latest course on Advanced JavaScript. Enroll now!',
           date: 'October 26, 2023'
        },
        {
           id: 2,
            title: 'Upcoming Q&A Session',
            description: 'Join us for a live Q&A session with our instructor on December 15th',
            date: 'November 1, 2023'
       }
    ];
    const events = [
        {
            id: 1,
            title: 'Assignment Due',
            date: 'November 5th'
       },
        {
             id: 2,
           title: 'Quiz',
           date: 'November 10th'
         }
    ];


    function populateCourses() {
      const courseGrid = document.querySelector('.course-grid');
       courses.forEach(course => {
         const courseItem = document.createElement('div');
           courseItem.classList.add('course-item');
            courseItem.innerHTML = `
                <img src="${course.image}" alt="${course.title}">
                <h3>${course.title}</h3>
                 <p>${course.description}</p>
                 <a href="${course.link}" class="enroll-button" data-course-id="${course.id}">Enroll</a>
            `;
             courseGrid.appendChild(courseItem);
         });
    }

   function populateResources() {
        const resourceGrid = document.querySelector('.resource-grid');
        resources.forEach(resource => {
              const resourceItem = document.createElement('div');
           resourceItem.classList.add('resource-item');
             resourceItem.innerHTML = `
                <i class="${resource.icon}"></i>
                  <h3>${resource.title}</h3>
                <p>${resource.description}</p>
               <a href="${resource.link}" data-resource-id="${resource.id}" data-resource-type="${resource.icon}">View</a>
            `;
              resourceGrid.appendChild(resourceItem);
         });
     }

   function populateAnnouncements() {
       const announcementList = document.querySelector('.announcement-list');
       announcements.forEach(announcement => {
             const announcementItem = document.createElement('div');
            announcementItem.classList.add('announcement-item');
              announcementItem.innerHTML = `
                <h3>${announcement.title}</h3>
               <p>${announcement.description}</p>
              <span class="date">${announcement.date}</span>
            `;
            announcementList.appendChild(announcementItem);
        });
   }

   function populateEvents() {
      const eventList = document.querySelector('.event-list');
        events.forEach(event => {
            const eventItem = document.createElement('li');
            eventItem.innerHTML = `
               <i class="fas fa-calendar-day"></i><p>${event.title}: ${event.date}</p>
          `;
            eventList.appendChild(eventItem);
        });
    }

    populateCourses();
    populateResources();
    populateAnnouncements();
    populateEvents();
     // --- End Initial Setup and Data Population ---
});