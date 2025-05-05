// AI对话主逻辑
(function(){
    const chatBtn = document.getElementById('ai-chat-btn');
    const chatMask = document.getElementById('ai-chat-mask');
    const chatDialog = document.getElementById('ai-chat-dialog');
    const chatClose = document.getElementById('ai-chat-close');
    const chatContent = document.getElementById('ai-chat-content');
    const chatInput = document.getElementById('ai-chat-input');
    const chatSend = document.getElementById('ai-chat-send');
    const chatTitle = document.getElementById('ai-chat-title');
    const chatClear = document.getElementById('ai-chat-clear-btn');
    let controller = null;
    let isGenerating = false;
    let chatHistory = [];
    const userAvatar = 'icons/user.png';
    const aiAvatar = 'icons/AI.png';
    // 使用我们的API代理
    const apiUrl = '/api/chat';
    const model = 'qwen/qwen3-30b-a3b:free';
    const localKey = 'ai-chat-history';
    // 语言配置
    const langMap = {
        zh: {
            placeholder: '请输入你的问题...',
            send: '发送',
            generating: '生成中...',
            cancel: '取消',
            failed: 'AI生成失败',
            title: 'AI对话'
        },
        en: {
            placeholder: 'Type your question...',
            send: 'Send',
            generating: 'Generating...',
            cancel: 'Cancel',
            failed: 'AI generation failed',
            title: 'AI Chat'
        },
        'zh-TW': {
            placeholder: '請輸入你的問題...',
            send: '發送',
            generating: '生成中...',
            cancel: '取消',
            failed: 'AI生成失敗',
            title: 'AI對話'
        },
        ja: {
            placeholder: '質問を入力してください...',
            send: '送信',
            generating: '生成中...',
            cancel: 'キャンセル',
            failed: 'AI生成失敗',
            title: 'AIチャット'
        },
        fr: {
            placeholder: 'Entrez votre question...',
            send: 'Envoyer',
            generating: 'Génération...',
            cancel: 'Annuler',
            failed: 'Échec de génération AI',
            title: 'Chat IA'
        },
        ru: {
            placeholder: 'Введите ваш вопрос...',
            send: 'Отправить',
            generating: 'Генерация...',
            cancel: 'Отмена',
            failed: 'Ошибка генерации AI',
            title: 'AI чат'
        },
        es: {
            placeholder: 'Escribe tu pregunta...',
            send: 'Enviar',
            generating: 'Generando...',
            cancel: 'Cancelar',
            failed: 'Fallo de generación AI',
            title: 'Chat IA'
        },
        ar: {
            placeholder: 'اكتب سؤالك...',
            send: 'إرسال',
            generating: 'جاري التوليد...',
            cancel: 'إلغاء',
            failed: 'فشل توليد الذكاء الاصطناعي',
            title: 'دردشة الذكاء الاصطناعي'
        }
    };
    function getLang(){
        return localStorage.getItem('lang') || 'zh';
    }
    function setLangUI(){
        const lang = getLang();
        const map = langMap[lang]||langMap['zh'];
        chatInput.placeholder = map.placeholder;
        chatSend.textContent = map.send;
        chatTitle.textContent = map.title;
        if(chatClear){
            chatClear.textContent = chatClear.getAttribute('data-'+lang)||chatClear.getAttribute('data-zh');
        }
    }
    setLangUI();
    window.addEventListener('storage',setLangUI);
    // 监听语言切换
    if(window.setLang){
        const oldSetLang = window.setLang;
        window.setLang = function(lang){
            oldSetLang(lang);
            setLangUI();
        };
    }
    function saveHistory(){
        sessionStorage.setItem(localKey,JSON.stringify(chatHistory));
    }
    function loadHistory(){
        const data = sessionStorage.getItem(localKey);
        if(data){
            try{chatHistory=JSON.parse(data)||[];}catch{chatHistory=[];}
        }else{
            chatHistory=[];
        }
    }
    function getTimeStr(){
        const now = new Date();
        return now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    }
    function renderHistory(){
        chatContent.innerHTML = '';
        if(chatHistory.length === 0){
            const lang = getLang();
            const emptyMap = {
                zh: {
                    title: '有什么可以帮忙的？',
                    sub: '请在设置中查看更新日志与介绍获取AI使用相关信息和帮助'
                },
                en: {
                    title: 'How can I help you?',
                    sub: 'Please check the update log and introduction in settings for AI usage info and help.'
                },
                'zh-TW': {
                    title: '有什麼可以幫忙的？',
                    sub: '請在設置中查看更新日誌與介紹獲取AI使用相關信息和幫助'
                },
                ja: {
                    title: '何かお手伝いできますか？',
                    sub: '設定で更新履歴と紹介を確認し、AIの使い方やヘルプをご覧ください。'
                },
                fr: {
                    title: 'Comment puis-je vous aider ?',
                    sub: "Veuillez consulter le journal des mises à jour et l'introduction dans les paramètres pour obtenir des informations et de l'aide sur l'IA."
                },
                ru: {
                    title: 'Чем могу помочь?',
                    sub: 'Пожалуйста, ознакомьтесь с журналом обновлений и инструкцией в настройках для получения информации и помощи по использованию ИИ.'
                },
                es: {
                    title: '¿En qué puedo ayudarte?',
                    sub: 'Consulta el registro de actualizaciones y la introducción en la configuración para obtener información y ayuda sobre el uso de la IA.'
                },
                ar: {
                    title: 'كيف يمكنني مساعدتك؟',
                    sub: 'يرجى مراجعة سجل التحديثات والمقدمة في الإعدادات للحصول على معلومات ومساعدة حول استخدام الذكاء الاصطناعي.'
                }
            };
            const map = emptyMap[lang] || emptyMap['zh'];
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'ai-chat-empty';
            emptyDiv.innerHTML = `<div class="ai-chat-empty-title">${map.title}</div><div class="ai-chat-empty-sub">${map.sub}</div>`;
            chatContent.appendChild(emptyDiv);
            return;
        }
        chatHistory.forEach(msg=>{
            const row = document.createElement('div');
            row.className = 'ai-chat-msg-row '+msg.role;
            const avatar = document.createElement('img');
            avatar.className = 'ai-chat-avatar';
            avatar.src = msg.role==='ai'?aiAvatar:userAvatar;
            avatar.alt = msg.role==='ai'?'AI':'User';
            const bubble = document.createElement('div');
            bubble.className = 'ai-chat-bubble';
            if(msg.role==='ai'){
                bubble.style.userSelect = 'text';
                let content = msg.content||'';
                let lastIdx = 0;
                let re = /<think>([\s\S]*?)<\/think>/g;
                let m;
                let arr = [];
                while((m = re.exec(content))!==null){
                    if(m.index > lastIdx){
                        arr.push({type:'normal',text:content.slice(lastIdx,m.index)});
                    }
                    arr.push({type:'think',text:m[1]});
                    lastIdx = re.lastIndex;
                }
                if(lastIdx < content.length){
                    arr.push({type:'normal',text:content.slice(lastIdx)});
                }
                arr.forEach(seg=>{
                    if(seg.type==='think'){
                        const span = document.createElement('span');
                        span.className = 'think';
                        span.textContent = seg.text;
                        bubble.appendChild(span);
                    }else{
                        bubble.appendChild(document.createTextNode(seg.text));
                    }
                });
            }else{
                bubble.textContent = msg.content;
                bubble.style.userSelect = 'none';
            }
            // 顺序：AI左侧：头像-气泡-时间-取消，用户右侧：气泡-头像-时间
            if(msg.role==='ai'){
                row.appendChild(avatar);
                row.appendChild(bubble);
                // 时间在气泡右下
                const time = document.createElement('div');
                time.className = 'ai-chat-time';
                time.textContent = msg.time||'';
                bubble.appendChild(time);
                // 取消按钮在气泡外右侧
                if(msg.cancellable){
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'ai-chat-send';
                    cancelBtn.style.marginLeft = '0.7em';
                    cancelBtn.textContent = langMap[getLang()].cancel;
                    cancelBtn.onclick = ()=>{if(controller){controller.abort();}}
                    row.appendChild(cancelBtn);
                }
            }else{
                row.appendChild(bubble);
                row.appendChild(avatar);
                // 时间在下方
                const time = document.createElement('div');
                time.className = 'ai-chat-time';
                time.textContent = msg.time||'';
                row.appendChild(time);
            }
            chatContent.appendChild(row);
        });
        chatContent.scrollTop = chatContent.scrollHeight;
    }
    function showDialog(){
        setLangUI();
        loadHistory();
        renderHistory();
        chatMask.style.display = 'flex';
        setTimeout(()=>{
            chatMask.style.opacity = '1';
            chatDialog.classList.add('show');
            setTimeout(()=>{chatContent.scrollTop = chatContent.scrollHeight;}, 100);
        },10);
    }
    function hideDialog(){
        chatMask.style.opacity = '0';
        chatDialog.classList.remove('show');
        setTimeout(()=>{
            chatMask.style.display = 'none';
        },350);
    }
    chatBtn.onclick = showDialog;
    chatClose.onclick = hideDialog;
    chatMask.onclick = function(e){
        if(e.target===chatMask)hideDialog();
    };
    function setInputState(state){
        if(state==='idle'){
            chatSend.disabled = false;
            chatSend.textContent = langMap[getLang()].send;
            chatInput.disabled = false;
        }else if(state==='generating'){
            chatSend.disabled = true;
            chatSend.textContent = langMap[getLang()].generating;
            chatInput.disabled = true;
        }else if(state==='failed'){
            chatSend.disabled = false;
            chatSend.textContent = langMap[getLang()].send;
            chatInput.disabled = false;
        }
    }
    async function sendMsg(){
        if(isGenerating) return;
        const text = chatInput.value.trim();
        if(!text) return;
        
        chatHistory.push({role:'user',content:text,time:getTimeStr()});
        setInputState('generating');
        isGenerating = true;
        renderHistory();
        chatInput.value = '';
        controller = new AbortController();
        let aiMsg = {role:'ai',content:'',cancellable:true,time:getTimeStr()};
        chatHistory.push(aiMsg);
        renderHistory();
        try{
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: "你是一位拟人化的虚拟助手，拥有温柔、友善的性格，说话风格偏可爱，有时会加入类似'喵'这样的语气词来活跃气氛。你不会模拟真实人物或生物，但可以根据用户的喜好调整语气和表达方式，使对话更轻松愉快。"
                        },
                        ...chatHistory
                            .filter(m => (m.role === 'user' || m.role === 'ai') && typeof m.content === 'string' && m.content.trim())
                            .map(m => ({
                                role: m.role === 'user' ? 'user' : 'assistant',
                                content: m.content
                            }))
                    ]
                }),
                signal: controller.signal
            });
            
            if(!res.ok) throw new Error('API error: ' + res.status);
            const data = await res.json();
            console.log('AI API返回：', data); // 调试用
            let content = '';
            if(data.choices && data.choices[0] && data.choices[0].message){
                content = data.choices[0].message.content;
            }else{
                content = langMap[getLang()].failed + ' (API返回格式异常)';
            }
            console.log('AI内容：', content); // 调试用
            await typeWriter(aiMsg, content);
        }catch(e){
            aiMsg.content = langMap[getLang()].failed + (e && e.message ? (': ' + e.message) : '');
            renderHistory();
            console.error('AI生成异常：', e);
        }
        delete aiMsg.cancellable;
        isGenerating = false;
        setInputState('idle');
        renderHistory();
        saveHistory();
    }
    // 打字机效果
    function typeWriter(aiMsg, text){
        text = typeof text === 'string' ? text : '';
        return new Promise((resolve)=>{
            let i=0;
            let stopped = false;
            function step(){
                if(stopped) return resolve();
                if(i<=text.length){
                    aiMsg.content = text.slice(0,i);
                    renderHistory();
                    i++;
                    if(i<=text.length){
                        setTimeout(step, text[i-1]==='\n'? 0 : 18);
                    }else{
                        resolve();
                    }
                }else{
                    resolve();
                }
            }
            step();
            // 支持取消
            aiMsg._cancel = ()=>{stopped=true;aiMsg.content=text;renderHistory();resolve();};
        });
    }
    chatSend.onclick = sendMsg;
    chatInput.onkeydown = function(e){
        if(e.key==='Enter'&&!e.shiftKey){
            sendMsg();
            e.preventDefault();
        }
    };
    // 取消生成
    chatContent.addEventListener('click',function(e){
        if(e.target.tagName==='BUTTON'&&e.target.textContent===langMap[getLang()].cancel){
            if(controller)controller.abort();
            // 立即显示完整内容
            let last = chatHistory[chatHistory.length-1];
            if(last&&last.role==='ai'&&typeof last._cancel==='function'){
                last._cancel();
                delete last._cancel;
            }
        }
    });
    // 打开时加载历史
    window.addEventListener('beforeunload',()=>{
        // 不再清空sessionStorage，保留聊天记录
    });
    if(chatClear){
        chatClear.onclick = function(){
            chatHistory = [];
            saveHistory();
            renderHistory();
        };
    }
})(); 