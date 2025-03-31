// ThinkFunBox 채팅 위젯
(function() {
    // 스타일 정의
    const style = document.createElement('style');
    style.textContent = `
      .thinkfunbox {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 450px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 5px 30px rgba(0,0,0,0.15);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        background: white;
        z-index: 9999;
      }
      .thinkfunbox-minimized {
        height: 60px;
        width: 200px;
      }
      .thinkfunbox-header {
        background: linear-gradient(135deg, #6366F1, #8B5CF6);
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
      }
      .thinkfunbox-title {
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .thinkfunbox-logo {
        display: inline-block;
        width: 24px;
        height: 24px;
        background: white;
        border-radius: 6px;
        text-align: center;
        line-height: 24px;
        font-weight: bold;
        color: #8B5CF6;
      }
      .thinkfunbox-controls span {
        cursor: pointer;
        padding: 0 5px;
      }
      .thinkfunbox-body {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background: #f8f9fa;
      }
      .thinkfunbox-message {
        margin-bottom: 15px;
        max-width: 80%;
        animation: fadeIn 0.3s;
      }
      .thinkfunbox-message-self {
        margin-left: auto;
      }
      .thinkfunbox-message-content {
        padding: 10px 12px;
        border-radius: 15px;
        position: relative;
        word-break: break-word;
      }
      .thinkfunbox-message-self .thinkfunbox-message-content {
        background: #6366F1;
        color: white;
        border-bottom-right-radius: 4px;
      }
      .thinkfunbox-message-other .thinkfunbox-message-content {
        background: white;
        border: 1px solid #e1e5ea;
        border-bottom-left-radius: 4px;
      }
      .thinkfunbox-message-meta {
        font-size: 0.7rem;
        margin-top: 5px;
        color: #6c757d;
      }
      .thinkfunbox-message-self .thinkfunbox-message-meta {
        text-align: right;
      }
      .thinkfunbox-input-container {
        padding: 15px;
        border-top: 1px solid #e1e5ea;
        display: flex;
        align-items: center;
        background: white;
      }
      .thinkfunbox-input {
        flex: 1;
        border: 1px solid #e1e5ea;
        border-radius: 20px;
        padding: 8px 15px;
        outline: none;
        transition: border 0.3s;
      }
      .thinkfunbox-input:focus {
        border-color: #8B5CF6;
      }
      .thinkfunbox-emoji-button {
        background: none;
        border: none;
        font-size: 20px;
        margin: 0 8px;
        cursor: pointer;
        line-height: 1;
      }
      .thinkfunbox-send-button {
        background: #6366F1;
        color: white;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-left: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
      }
      .thinkfunbox-send-button:hover {
        background: #4F46E5;
      }
      .thinkfunbox-emoji-picker {
        position: absolute;
        bottom: 75px;
        right: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        width: 250px;
        height: 200px;
        padding: 10px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        overflow-y: auto;
        z-index: 10000;
      }
      .thinkfunbox-emoji {
        font-size: 18px;
        text-align: center;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .thinkfunbox-emoji:hover {
        background: #f1f3f5;
      }
      .thinkfunbox-message-system {
        text-align: center;
        margin: 10px 0;
        font-size: 0.8rem;
        color: #6c757d;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .thinkfunbox-animation {
        animation: popIn 0.5s ease;
      }
      @keyframes popIn {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      .thinkfunbox-typing {
        font-size: 0.8rem;
        color: #6c757d;
        margin-bottom: 15px;
        font-style: italic;
      }
      .thinkfunbox-typing::after {
        content: "...";
        display: inline-block;
        animation: ellipsis 1s infinite;
      }
      @keyframes ellipsis {
        0% { width: 0px; }
        25% { width: 3px; }
        50% { width: 6px; }
        75% { width: 9px; }
        100% { width: 12px; }
      }
    `;
    document.head.appendChild(style);
  
    // Firebase 스크립트 로딩
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  
    async function initThinkFunBox(config) {
      try {
        // Firebase 스크립트 로드
        await loadScript('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.6.0/firebase-database-compat.js');
        
        // 사용자 정보 설정
        const username = config.username || `Guest${Math.floor(Math.random() * 1000)}`;
        const roomId = config.roomId || 'general';
        
        // Firebase 초기화
        const firebaseConfig = {
          apiKey: "AIzaSyArP7ujttZzcIaQaARxtpGq9UUHytjjeII",
          authDomain: "thinkfunbox.firebaseapp.com",
          projectId: "thinkfunbox",
          databaseURL: "https://thinkfunbox-default-rtdb.firebaseio.com", // 여기에 당신의 데이터베이스 URL을 넣으세요
          storageBucket: "thinkfunbox.firebasestorage.app",
          messagingSenderId: "702169899157",
          appId: "1:702169899157:web:e48df307d56c909e8cbb9c",
          measurementId: "G-P61HGCT0YL"
        };
        
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        
        // 채팅 위젯 DOM 생성
        const widget = document.createElement('div');
        widget.className = 'thinkfunbox';
        
        widget.innerHTML = `
          <div class="thinkfunbox-header">
            <div class="thinkfunbox-title">
              <span class="thinkfunbox-logo">T</span>
              ThinkFunBox
            </div>
            <div class="thinkfunbox-controls">
              <span class="thinkfunbox-minimize">_</span>
              <span class="thinkfunbox-close">×</span>
            </div>
          </div>
          <div class="thinkfunbox-body"></div>
          <div class="thinkfunbox-input-container">
            <button class="thinkfunbox-emoji-button">😊</button>
            <input type="text" class="thinkfunbox-input" placeholder="메시지를 입력하세요...">
            <button class="thinkfunbox-send-button">➤</button>
          </div>
        `;
        
        document.body.appendChild(widget);
        
        // 이모지 피커 생성
        const emojiPicker = document.createElement('div');
        emojiPicker.className = 'thinkfunbox-emoji-picker';
        emojiPicker.style.display = 'none';
        
        const emojis = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
                       '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', 
                       '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', 
                       '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', 
                       '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', 
                       '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', 
                       '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡'];
        
        emojis.forEach(emoji => {
          const emojiElement = document.createElement('div');
          emojiElement.className = 'thinkfunbox-emoji';
          emojiElement.textContent = emoji;
          emojiPicker.appendChild(emojiElement);
        });
        
        document.body.appendChild(emojiPicker);
        
        // 요소 참조
        const messageBody = widget.querySelector('.thinkfunbox-body');
        const messageInput = widget.querySelector('.thinkfunbox-input');
        const sendButton = widget.querySelector('.thinkfunbox-send-button');
        const emojiButton = widget.querySelector('.thinkfunbox-emoji-button');
        const minimizeButton = widget.querySelector('.thinkfunbox-minimize');
        const closeButton = widget.querySelector('.thinkfunbox-close');
        const header = widget.querySelector('.thinkfunbox-header');
        
        // 채팅 기능 구현
        function sendMessage() {
          const text = messageInput.value.trim();
          if (!text) return;
          
          // 메시지 객체 생성
          const message = {
            text,
            sender: username,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          };
          
          // Firebase에 메시지 저장
          db.ref(`messages/${roomId}`).push(message);
          
          // 입력창 비우기
          messageInput.value = '';
          
          // 이모지 피커 숨기기
          emojiPicker.style.display = 'none';
          
          // 전송 사운드
          playSound('send');
        }
        
        // 이벤트 리스너
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') sendMessage();
        });
        
        emojiButton.addEventListener('click', () => {
          emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none';
          
          // 이모지 피커 위치 조정
          const rect = emojiButton.getBoundingClientRect();
          emojiPicker.style.bottom = `${window.innerHeight - rect.top + 10}px`;
          emojiPicker.style.right = `${window.innerWidth - rect.right + 30}px`;
        });
        
        document.querySelectorAll('.thinkfunbox-emoji').forEach(emoji => {
          emoji.addEventListener('click', () => {
            messageInput.value += emoji.textContent;
            messageInput.focus();
            emojiPicker.style.display = 'none';
          });
        });
        
        minimizeButton.addEventListener('click', (e) => {
          e.stopPropagation();
          widget.classList.toggle('thinkfunbox-minimized');
        });
        
        closeButton.addEventListener('click', (e) => {
          e.stopPropagation();
          widget.style.display = 'none';
        });
        
        header.addEventListener('click', () => {
          if (widget.classList.contains('thinkfunbox-minimized')) {
            widget.classList.remove('thinkfunbox-minimized');
          }
        });
        
        // 외부 클릭 시 이모지 피커 닫기
        document.addEventListener('click', (e) => {
          if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
            emojiPicker.style.display = 'none';
          }
        });
        
        // Firebase에서 메시지 가져오기
        db.ref(`messages/${roomId}`).limitToLast(30).on('child_added', snapshot => {
          const messageData = snapshot.val();
          displayMessage(messageData);
        });
        
        // 입장 메시지 표시
        const systemMessage = {
          text: `${username} 님이 채팅방에 참여했습니다.`,
          type: 'system',
          timestamp: Date.now()
        };
        
        displaySystemMessage(systemMessage);
        
        // 사용자 입장 기록
        db.ref(`users/${roomId}`).push({
          username,
          joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // 메시지 표시 함수
        function displayMessage(messageData) {
          const messageElement = document.createElement('div');
          messageElement.className = `thinkfunbox-message thinkfunbox-message-${messageData.sender === username ? 'self' : 'other'}`;
          
          const time = new Date(messageData.timestamp);
          const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
          
          messageElement.innerHTML = `
            <div class="thinkfunbox-message-content">${addEmoji(messageData.text)}</div>
            <div class="thinkfunbox-message-meta">
              ${messageData.sender === username ? '' : `${messageData.sender}, `}${timeStr}
            </div>
          `;
          
          messageBody.appendChild(messageElement);
          scrollToBottom();
          
          // 메시지 도착 효과
          messageElement.classList.add('thinkfunbox-animation');
          
          // 소리 재생 (자신이 보낸 메시지가 아닐 때만)
          if (messageData.sender !== username) {
            playSound('receive');
          }
        }
        
        // 시스템 메시지 표시 함수
        function displaySystemMessage(messageData) {
          const messageElement = document.createElement('div');
          messageElement.className = 'thinkfunbox-message-system';
          messageElement.textContent = messageData.text;
          
          messageBody.appendChild(messageElement);
          scrollToBottom();
        }
        
        // 특수 키워드에 이모티콘 추가
        function addEmoji(text) {
          // 이모지 키워드 매핑
          const emojiMap = {
            ':)': '😊',
            ':(': '😢',
            ':D': '😃',
            ':P': '😛',
            '<3': '❤️',
            ':heart:': '❤️',
            ':thumbsup:': '👍',
            ':coffee:': '☕',
            ':fire:': '🔥',
            ':star:': '⭐'
          };
          
          // 정규식으로 이모지 키워드 변환
          let result = text;
          for (const [keyword, emoji] of Object.entries(emojiMap)) {
            result = result.replace(new RegExp(keyword, 'g'), emoji);
          }
          
          return result;
        }
        
        // 스크롤 함수
        function scrollToBottom() {
          messageBody.scrollTop = messageBody.scrollHeight;
        }
        
        // 효과음
        function playSound(type) {
          if (!config.sound) return;
          
          const sounds = {
            receive: 'https://freesound.org/data/previews/348/348420_5121236-lq.mp3',
            send: 'https://freesound.org/data/previews/256/256113_3263906-lq.mp3'
          };
          
          try {
            const audio = new Audio(sounds[type]);
            audio.volume = 0.5;
            audio.play();
          } catch (e) {
            console.error('Sound playback failed', e);
          }
        }
        
        // 채팅 위젯 초기 효과
        setTimeout(() => {
          widget.classList.add('thinkfunbox-animation');
        }, 100);
      } catch (error) {
        console.error('ThinkFunBox initialization error:', error);
      }
    }
    
    // 전역 노출
    window.ThinkFunBox = {
      init: initThinkFunBox
    };
  })();