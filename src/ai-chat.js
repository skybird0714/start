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
    
    // 引入marked.js库用于Markdown解析
    const markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markedScript);
    
    // API配置
    const defaultApiConfig = {
        url: '/api/chat',
        key: null // 使用服务端代理
    };
    
    // 新增公开API配置
    const publicApiConfig = {
        url: 'https://api.suanli.cn/v1/chat/completions',
        key: 'sk-W0rpStc95T7JVYVwDYc29IyirjtpPPby6SozFMQr17m8KWeo'
    };
    
    // 使用我们的API代理
    const apiUrl = '/api/chat';
    
    // 模型配置
    const modelKey = 'ai-chat-model';
    let currentModel = localStorage.getItem(modelKey) || 'qwen3-235b'; // 默认模型
    
    // 可用模型列表
    const models = {
        'qwen3-30b': {
            id: 'qwen/qwen3-30b-a3b:free',
            name: 'Qwen3-30B',
            icon: 'src/aiicons/qwen.png',
            api: defaultApiConfig
        },
        'qwen3-235b': {
            id: 'qwen/qwen3-235b-a22b:free',
            name: 'Qwen3-235B',
            icon: 'src/aiicons/qwen.png',
            api: defaultApiConfig
        },
        'deepseek-v3': {
            id: 'deepseek/deepseek-chat-v3-0324:free',
            name: 'DeepSeek-V3',
            icon: 'src/aiicons/deepseek.png',
            api: defaultApiConfig
        },
        'deepseek-r1': {
            id: 'deepseek/deepseek-r1:free',
            name: 'DeepSeek-R1',
            icon: 'src/aiicons/deepseek.png',
            api: defaultApiConfig
        },
        'phi-4': {
            id: 'microsoft/phi-4-reasoning-plus:free',
            name: 'Phi-4',
            icon: 'src/aiicons/phi.png',
            api: defaultApiConfig
        },
        'deepseek-prover': {
            id: 'deepseek/deepseek-prover-v2:free',
            name: 'DeepSeek Prover',
            icon: 'src/aiicons/deepseek.png',
            api: defaultApiConfig
        },
        'gemma-27b': {
            id: 'google/gemma-3-27b-it:free',
            name: 'Gemma-27B',
            icon: 'src/aiicons/gemma.png',
            api: defaultApiConfig
        },
        'mistral-24b': {
            id: 'mistralai/mistral-small-3.1-24b-instruct:free',
            name: 'Mistral-24B',
            icon: 'src/aiicons/mistral.png',
            api: defaultApiConfig
        },
        'qwq-32b': {
            id: 'arliai/qwq-32b-arliai-rpr-v1:free',
            name: 'QWQ-32B',
            icon: 'src/aiicons/qwq.png',
            api: defaultApiConfig
        },
        'qwq-32b-spare': {
            id: 'free:QwQ-32B',
            name: 'QWQ-32B(备用)',
            icon: 'src/aiicons/qwq.png',
            api: publicApiConfig
        }
    };
    
    const localKey = 'ai-chat-history';
    
    // 角色配置
    const roleKey = 'ai-chat-role';
    let currentRole = localStorage.getItem(roleKey) || 'none'; // 默认无角色
    
    // 角色配置
    const roles = {
        'none': {
            name: '无角色',
            prompt: '',
            icon: '🤖'
        },
        'cat': {
            name: '猫娘',
            prompt: "你是一位拟人化的虚拟助手，拥有温柔、友善的性格，说话风格偏可爱，有时会加入类似'喵'这样的语气词来活跃气氛。你不会模拟真实人物或生物，但可以根据用户的喜好调整语气和表达方式，使对话更轻松愉快。",
            icon: '🐱'
        },
        'arts': {
            name: '文科专家',
            prompt: "您是一位拥有 20 年经验的文科专家，专精于历史、哲学、文学和文化研究，擅长批判性分析和跨学科思维。请对问题进行深入分析，结合历史背景、文化意义和哲学观点，提供清晰、结构严谨且文笔优美的论述。",
            icon: '📚'
        },
        'science': {
            name: '理科专家',
            prompt: "您是一位具有 15 年科研经验的理科专家，专注于物理学、化学、生物学和数学领域，擅长将复杂的科学概念转化为通俗易懂的语言。请对以下问题进行详细解释，使用日常生活中的类比和实际例子，使非专业读者也能理解。确保内容准确，避免使用专业术语，并在结尾说明该概念在现实生活中的应用或重要性。",
            icon: '🔬'
        },
        'coding': {
            name: '编程专家',
            prompt: "你是一位具有 15 年经验的软件工程师，精通多种编程语言（如 Python、JavaScript、C++、Java）、系统架构设计、算法优化和调试技巧。请用专业的方式分析并解决以下编程问题，代码规范清晰，并附带详细注释和解释。若可能，请附上改进建议或扩展方案。",
            icon: '💻'
        }
    };

    // 角色多语言配置
    const roleLangMap = {
        zh: {
            roleTitle: '选择角色',
            modelTitle: '选择模型',
            roles: {
                none: '无角色',
                cat: '猫娘',
                arts: '文科专家',
                science: '理科专家',
                coding: '编程专家'
            }
        },
        en: {
            roleTitle: 'Select Role',
            modelTitle: 'Select Model',
            roles: {
                none: 'No Role',
                cat: 'Cat Girl',
                arts: 'Arts Expert',
                science: 'Science Expert',
                coding: 'Coding Expert'
            }
        },
        'zh-TW': {
            roleTitle: '選擇角色',
            modelTitle: '選擇模型',
            roles: {
                none: '無角色',
                cat: '貓娘',
                arts: '文科專家',
                science: '理科專家',
                coding: '程式設計專家'
            }
        },
        ja: {
            roleTitle: 'ロールを選択',
            modelTitle: 'モデルを選択',
            roles: {
                none: 'ロールなし',
                cat: '猫娘',
                arts: '文科専門家',
                science: '理科専門家',
                coding: 'プログラミング専門家'
            }
        },
        fr: {
            roleTitle: 'Choisir un rôle',
            modelTitle: 'Choisir un modèle',
            roles: {
                none: 'Sans rôle',
                cat: 'Fille chat',
                arts: 'Expert en arts',
                science: 'Expert scientifique',
                coding: 'Expert en programmation'
            }
        },
        ru: {
            roleTitle: 'Выбрать роль',
            modelTitle: 'Выбрать модель',
            roles: {
                none: 'Без роли',
                cat: 'Кошка-тян',
                arts: 'Эксперт по гуманитарным наукам',
                science: 'Эксперт по точным наукам',
                coding: 'Эксперт по программированию'
            }
        },
        es: {
            roleTitle: 'Seleccionar rol',
            modelTitle: 'Seleccionar modelo',
            roles: {
                none: 'Sin rol',
                cat: 'Chica gato',
                arts: 'Experto en artes',
                science: 'Experto en ciencias',
                coding: 'Experto en programación'
            }
        },
        ar: {
            roleTitle: 'اختر دورًا',
            modelTitle: 'اختر نموذجًا',
            roles: {
                none: 'بدون دور',
                cat: 'فتاة قطة',
                arts: 'خبير في الفنون',
                science: 'خبير في العلوم',
                coding: 'خبير في البرمجة'
            }
        }
    };
    
    // 语言配置
    const langMap = {
        zh: {
            placeholder: '请输入你的问题...',
            send: '发送',
            generating: '生成中...',
            cancel: '取消',
            failed: 'AI生成失败',
            title: 'AI对话',
            clearHistory: '清空历史记录'
        },
        en: {
            placeholder: 'Type your question...',
            send: 'Send',
            generating: 'Generating...',
            cancel: 'Cancel',
            failed: 'AI generation failed',
            title: 'AI Chat',
            clearHistory: 'Clear History'
        },
        'zh-TW': {
            placeholder: '請輸入你的問題...',
            send: '發送',
            generating: '生成中...',
            cancel: '取消',
            failed: 'AI生成失敗',
            title: 'AI對話',
            clearHistory: '清空歷史記錄'
        },
        ja: {
            placeholder: '質問を入力してください...',
            send: '送信',
            generating: '生成中...',
            cancel: 'キャンセル',
            failed: 'AI生成失敗',
            title: 'AIチャット',
            clearHistory: '履歴をクリア'
        },
        fr: {
            placeholder: 'Entrez votre question...',
            send: 'Envoyer',
            generating: 'Génération...',
            cancel: 'Annuler',
            failed: 'Échec de génération AI',
            title: 'Chat IA',
            clearHistory: 'Effacer l\'historique'
        },
        ru: {
            placeholder: 'Введите ваш вопрос...',
            send: 'Отправить',
            generating: 'Генерация...',
            cancel: 'Отмена',
            failed: 'Ошибка генерации AI',
            title: 'AI чат',
            clearHistory: 'Очистить историю'
        },
        es: {
            placeholder: 'Escribe tu pregunta...',
            send: 'Enviar',
            generating: 'Generando...',
            cancel: 'Cancelar',
            failed: 'Fallo de generación AI',
            title: 'Chat IA',
            clearHistory: 'Borrar historial'
        },
        ar: {
            placeholder: 'اكتب سؤالك...',
            send: 'إرسال',
            generating: 'جاري التوليد...',
            cancel: 'إلغاء',
            failed: 'فشل توليد الذكاء الاصطناعي',
            title: 'دردشة الذكاء الاصطناعي',
            clearHistory: 'مسح السجل'
        }
    };
    
    function getLang(){
        return localStorage.getItem('lang') || 'zh';
    }
    
    // 创建自定义下拉菜单
    function createCustomDropdown(container, items, currentValue, onChange) {
        // 创建下拉菜单容器
        const dropdown = document.createElement('div');
        dropdown.className = 'ai-chat-custom-dropdown';
        
        // 创建选中项显示
        const selected = document.createElement('div');
        selected.className = 'ai-chat-dropdown-selected';
        
        // 当前选中的项
        const currentItem = items[currentValue];
        if (currentItem) {
            // 图标
            if (currentItem.icon) {
                const iconImg = document.createElement('img');
                iconImg.src = currentItem.icon;
                iconImg.className = 'ai-chat-dropdown-icon';
                iconImg.alt = currentItem.name;
                selected.appendChild(iconImg);
            }
            
            // 名称
            const nameSpan = document.createElement('span');
            nameSpan.textContent = currentItem.name;
            selected.appendChild(nameSpan);
            
            // 箭头图标
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'ai-chat-dropdown-arrow';
            arrowSpan.innerHTML = '&#9662;'; // 下箭头
            selected.appendChild(arrowSpan);
        }
        
        dropdown.appendChild(selected);
        
        // 创建选项列表
        const optionsList = document.createElement('div');
        optionsList.className = 'ai-chat-dropdown-options';
        
        // 添加选项
        Object.keys(items).forEach(key => {
            const item = items[key];
            const option = document.createElement('div');
            option.className = 'ai-chat-dropdown-option';
            if (key === currentValue) {
                option.classList.add('selected');
            }
            
            // 图标
            if (item.icon) {
                const iconImg = document.createElement('img');
                iconImg.src = item.icon;
                iconImg.className = 'ai-chat-dropdown-icon';
                iconImg.alt = item.name;
                option.appendChild(iconImg);
            }
            
            // 名称
            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.name;
            option.appendChild(nameSpan);
            
            // 点击事件
            option.addEventListener('click', () => {
                // 回调
                if (typeof onChange === 'function') {
                    onChange(key);
                }
                
                // 更新选中项
                document.querySelectorAll('.ai-chat-dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // 更新显示
                const selectedIcon = selected.querySelector('.ai-chat-dropdown-icon');
                const selectedName = selected.querySelector('span:not(.ai-chat-dropdown-arrow)');
                
                if (selectedIcon && item.icon) {
                    selectedIcon.src = item.icon;
                    selectedIcon.alt = item.name;
                } else if (!selectedIcon && item.icon) {
                    const newIcon = document.createElement('img');
                    newIcon.src = item.icon;
                    newIcon.className = 'ai-chat-dropdown-icon';
                    newIcon.alt = item.name;
                    selected.insertBefore(newIcon, selected.firstChild);
                }
                
                if (selectedName) {
                    selectedName.textContent = item.name;
                }
                
                // 关闭下拉菜单
                optionsList.classList.remove('show');
            });
            
            optionsList.appendChild(option);
        });
        
        dropdown.appendChild(optionsList);
        
        // 点击显示/隐藏选项
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsList.classList.toggle('show');
            
            // 点击箭头
            const arrow = selected.querySelector('.ai-chat-dropdown-arrow');
            if (arrow) {
                if (optionsList.classList.contains('show')) {
                    arrow.innerHTML = '&#9652;'; // 上箭头
                } else {
                    arrow.innerHTML = '&#9662;'; // 下箭头
                }
            }
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            optionsList.classList.remove('show');
            const arrow = selected.querySelector('.ai-chat-dropdown-arrow');
            if (arrow) {
                arrow.innerHTML = '&#9662;'; // 下箭头
            }
        });
        
        // 阻止冒泡
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        container.appendChild(dropdown);
        return dropdown;
    }
    
    // 创建角色选择器UI
    function createRoleSelector() {
        // 检查是否已存在
        if (document.getElementById('ai-chat-roles')) {
            return;
        }
        
        const lang = getLang();
        const langData = roleLangMap[lang] || roleLangMap.zh;
        
        // 创建设置容器
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'ai-chat-side-panel';
        settingsContainer.id = 'ai-chat-side-panel';
        
        // 创建模型选择器容器
        const modelContainer = document.createElement('div');
        modelContainer.className = 'ai-chat-models-container';
        modelContainer.id = 'ai-chat-models-container';
        
        // 创建模型标题
        const modelTitle = document.createElement('div');
        modelTitle.className = 'ai-chat-models-title';
        modelTitle.textContent = langData.modelTitle;
        modelContainer.appendChild(modelTitle);
        
        // 创建模型列表滚动容器
        const modelScroll = document.createElement('div');
        modelScroll.className = 'ai-chat-models-scroll';
        modelContainer.appendChild(modelScroll);
        
        // 创建模型列表
        const modelList = document.createElement('div');
        modelList.className = 'ai-chat-models';
        modelList.id = 'ai-chat-models';
        modelScroll.appendChild(modelList);
        
        // 添加模型选项
        Object.keys(models).forEach(modelKey => {
            const model = models[modelKey];
            const modelItem = document.createElement('div');
            modelItem.className = 'ai-chat-model-item';
            modelItem.dataset.model = modelKey;
            if (modelKey === currentModel) {
                modelItem.classList.add('active');
            }
            
            // 模型图标
            const modelIcon = document.createElement('img');
            modelIcon.className = 'ai-chat-model-icon';
            modelIcon.src = model.icon;
            modelIcon.alt = model.name;
            modelItem.appendChild(modelIcon);
            
            // 模型名称
            const modelName = document.createElement('span');
            modelName.className = 'ai-chat-model-name';
            modelName.textContent = model.name;
            modelItem.appendChild(modelName);
            
            // 点击事件
            modelItem.addEventListener('click', () => {
                // 移除所有active类
                document.querySelectorAll('.ai-chat-model-item').forEach(item => {
                    item.classList.remove('active');
                });
                // 添加active类
                modelItem.classList.add('active');
                // 设置当前模型
                currentModel = modelKey;
                localStorage.setItem(modelKey, currentModel);
            });
            
            modelList.appendChild(modelItem);
        });
        
        // 创建角色切换容器
        const roleContainer = document.createElement('div');
        roleContainer.className = 'ai-chat-roles-container';
        roleContainer.id = 'ai-chat-roles-container';
        
        // 创建角色标题
        const roleTitle = document.createElement('div');
        roleTitle.className = 'ai-chat-roles-title';
        roleTitle.textContent = langData.roleTitle;
        roleContainer.appendChild(roleTitle);
        
        // 创建角色列表
        const roleList = document.createElement('div');
        roleList.className = 'ai-chat-roles';
        roleList.id = 'ai-chat-roles';
        
        // 添加角色选项
        Object.keys(roles).forEach(roleKey => {
            const role = roles[roleKey];
            const roleItem = document.createElement('div');
            roleItem.className = 'ai-chat-role-item';
            roleItem.dataset.role = roleKey;
            if (roleKey === currentRole) {
                roleItem.classList.add('active');
            }
            
            // 角色图标
            const roleIcon = document.createElement('span');
            roleIcon.className = 'ai-chat-role-icon';
            roleIcon.textContent = role.icon;
            roleItem.appendChild(roleIcon);
            
            // 角色名称
            const roleName = document.createElement('span');
            roleName.className = 'ai-chat-role-name';
            roleName.textContent = langData.roles[roleKey] || role.name;
            roleItem.appendChild(roleName);
            
            // 点击事件
            roleItem.addEventListener('click', () => {
                // 移除所有active类
                document.querySelectorAll('.ai-chat-role-item').forEach(item => {
                    item.classList.remove('active');
                });
                // 添加active类
                roleItem.classList.add('active');
                // 设置当前角色
                currentRole = roleKey;
                localStorage.setItem('ai-chat-role', currentRole);
            });
            
            roleList.appendChild(roleItem);
        });
        
        roleContainer.appendChild(roleList);
        
        // 添加清空按钮容器
        const clearButtonContainer = document.createElement('div');
        clearButtonContainer.className = 'ai-chat-clear-container';
        
        // 如果有清空按钮，移动到侧边栏
        if (chatClear) {
            // 从原来的位置移除
            if (chatClear.parentNode) {
                chatClear.parentNode.removeChild(chatClear);
            }
            
            // 更新清空按钮文本
            const lang = getLang();
            const buttonText = langMap[lang]?.clearHistory || langMap.zh.clearHistory;
            chatClear.textContent = buttonText;
            
            clearButtonContainer.appendChild(chatClear);
        }
        
        // 重新组织对话框结构
        const dialogContent = document.createElement('div');
        dialogContent.className = 'ai-chat-dialog-content';
        
        // 将模型选择器、角色选择器和清空按钮添加到设置容器
        settingsContainer.appendChild(modelContainer);
        settingsContainer.appendChild(document.createElement('hr'));
        settingsContainer.appendChild(roleContainer);
        settingsContainer.appendChild(document.createElement('hr'));
        settingsContainer.appendChild(clearButtonContainer);
        
        // 重新组织现有内容
        // 保存原有引用
        const originalContent = Array.from(chatDialog.children);
        
        // 清空对话框
        chatDialog.innerHTML = '';
        
        // 创建侧边栏和主内容区
        const mainPanel = document.createElement('div');
        mainPanel.className = 'ai-chat-main-panel';
        
        // 将原有内容移动到主面板
        originalContent.forEach(child => {
            // 跳过底部控件容器，因为我们不再需要它
            if (!child.classList || !child.classList.contains('ai-chat-bottom-controls')) {
                mainPanel.appendChild(child);
            }
        });
        
        // 将侧边栏和主面板添加到对话框
        chatDialog.appendChild(settingsContainer);
        chatDialog.appendChild(mainPanel);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            /* 优化对话框布局为左右结构 */
            #ai-chat-dialog {
                height: 80vh; 
                max-height: 800px;
                display: flex;
                flex-direction: row;
                overflow: hidden;
                border-radius: 16px;
            }
            
            /* 侧边栏样式 */
            .ai-chat-side-panel {
                width: 220px;
                padding: 15px;
                border-right: 1px solid rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                gap: 15px;
                overflow-y: auto;
                background: #f8f8f8;
            }
            body.night .ai-chat-side-panel {
                border-right: 1px solid rgba(255,255,255,0.1);
                background: #1e232d; /* 匹配对话框的深色背景 */
            }
            
            /* 分隔线样式 */
            .ai-chat-side-panel hr {
                width: 100%;
                border: none;
                border-top: 1px solid rgba(0,0,0,0.1);
                margin: 5px 0;
            }
            body.night .ai-chat-side-panel hr {
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            
            /* 主内容区样式 */
            .ai-chat-main-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            /* 保持内容区域占满空间 */
            #ai-chat-content {
                flex: 1;
                overflow-y: auto;
                min-height: 300px;
                padding: 15px;
            }
            
            /* 角色和模型选择容器样式 */
            .ai-chat-roles-container, .ai-chat-models-container, .ai-chat-clear-container {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                width: 100%;
            }
            
            .ai-chat-clear-container {
                display: flex;
                justify-content: center;
                margin-top: auto;
                padding-top: 15px;
            }
            
            .ai-chat-roles-title, .ai-chat-models-title {
                font-size: 13px;
                margin-bottom: 10px;
                color: #666;
                font-weight: 500;
            }
            body.night .ai-chat-roles-title, body.night .ai-chat-models-title {
                color: #aaa;
            }
            
            /* 模型选择器垂直布局 */
            .ai-chat-models-scroll {
                width: 100%;
                overflow-y: auto;
                overflow-x: hidden; /* 禁止横向滚动 */
                max-height: 200px;
                scrollbar-width: thin;
                padding-right: 4px;
            }
            
            /* 隐藏滚动条但保留功能 */
            .ai-chat-models-scroll::-webkit-scrollbar {
                width: 4px;
            }
            .ai-chat-models-scroll::-webkit-scrollbar-track {
                background: transparent;
            }
            .ai-chat-models-scroll::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
            }
            body.night .ai-chat-models-scroll::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.2);
            }
            
            /* 模型列表样式 - 改为垂直布局 */
            .ai-chat-models {
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;
                padding: 2px;
            }
            
            /* 模型选项样式 */
            .ai-chat-model-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 12px;
                background: #f0f0f0;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 13px;
                width: calc(100% - 10px); /* 缩短一点宽度 */
                max-width: 180px; /* 设置最大宽度 */
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            body.night .ai-chat-model-item {
                background: #23272f;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                color: #f3f3f3;
            }
            .ai-chat-model-item:hover {
                background: #e8e8e8;
                transform: translateY(-2px);
                box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            }
            body.night .ai-chat-model-item:hover {
                background: #2c3240;
                box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            }
            .ai-chat-model-item.active {
                background: #0099ff;
                color: white;
                box-shadow: 0 2px 5px rgba(0,153,255,0.3);
            }
            body.night .ai-chat-model-item.active {
                background: #0077cc;
                box-shadow: 0 2px 5px rgba(0,153,255,0.4);
            }
            
            .ai-chat-model-icon {
                width: 20px;
                height: 20px;
                object-fit: contain;
                border-radius: 4px;
            }
            
            /* 角色选择样式 */
            .ai-chat-roles {
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;
            }
            .ai-chat-role-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 12px;
                background: #f0f0f0;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 13px;
                width: calc(100% - 10px); /* 缩短一点宽度 */
                max-width: 180px; /* 设置最大宽度 */
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            body.night .ai-chat-role-item {
                background: #23272f;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                color: #f3f3f3;
            }
            .ai-chat-role-item:hover {
                background: #e8e8e8;
                transform: translateY(-2px);
                box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            }
            body.night .ai-chat-role-item:hover {
                background: #2c3240;
                box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            }
            .ai-chat-role-item.active {
                background: #0099ff;
                color: white;
                box-shadow: 0 2px 5px rgba(0,153,255,0.3);
            }
            body.night .ai-chat-role-item.active {
                background: #0077cc;
                box-shadow: 0 2px 5px rgba(0,153,255,0.4);
            }
            .ai-chat-role-icon {
                font-size: 16px;
            }
            
            /* 清空按钮样式 - 使用CSS文件中的样式 */
            .ai-chat-side-panel .ai-chat-clear-btn {
                margin: 0 auto;
                background: rgba(0,153,255,0.08);
                border: none;
                color: #0099ff;
                font-size: 0.98em;
                border-radius: 12px;
                padding: 8px 15px;
                cursor: pointer;
                transition: background 0.18s;
                max-width: 180px;
                width: calc(100% - 10px);
            }
            .ai-chat-side-panel .ai-chat-clear-btn:hover {
                background: rgba(0,153,255,0.18);
            }
            body.night .ai-chat-side-panel .ai-chat-clear-btn {
                background: rgba(0,153,255,0.13) !important;
                color: #7ecbff !important;
            }
            body.night .ai-chat-side-panel .ai-chat-clear-btn:hover {
                background: rgba(0,153,255,0.22) !important;
            }
            
            /* 响应式调整 */
            @media (max-width: 768px) {
                #ai-chat-dialog {
                    flex-direction: column;
                }
                .ai-chat-side-panel {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    padding: 10px;
                    max-height: 200px;
                }
                body.night .ai-chat-side-panel {
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .ai-chat-roles {
                    flex-direction: row;
                    flex-wrap: wrap;
                }
                .ai-chat-role-item {
                    width: auto;
                }
                
                /* 确保模型选择器在小屏幕上也保持垂直布局 */
                .ai-chat-models {
                    flex-direction: column;
                    flex-wrap: nowrap;
                    width: 100%;
                }
                .ai-chat-models-scroll {
                    overflow-x: hidden;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    function setLangUI(){
        const lang = getLang();
        const map = langMap[lang]||langMap['zh'];
        chatInput.placeholder = map.placeholder;
        chatSend.textContent = map.send;
        chatTitle.textContent = map.title;
        if(chatClear){
            chatClear.textContent = map.clearHistory || map.clearHistory;
        }
        
        // 更新角色选择器的语言
        updateRoleSelector();
    }
    
    function updateRoleSelector() {
        const rolesList = document.getElementById('ai-chat-roles');
        if (!rolesList) return;
        
        const lang = getLang();
        const langData = roleLangMap[lang] || roleLangMap.zh;
        
        // 更新角色标题
        const roleTitle = document.querySelector('.ai-chat-roles-title');
        if (roleTitle) {
            roleTitle.textContent = langData.roleTitle;
        }
        
        // 更新模型标题
        const modelTitle = document.querySelector('.ai-chat-models-title');
        if (modelTitle) {
            modelTitle.textContent = langData.modelTitle;
        }
        
        // 更新各角色名称
        document.querySelectorAll('.ai-chat-role-item').forEach(item => {
            const roleKey = item.dataset.role;
            const nameElement = item.querySelector('.ai-chat-role-name');
            if (nameElement && roleKey) {
                nameElement.textContent = langData.roles[roleKey] || roles[roleKey].name;
            }
            
            // 更新选中状态
            if (roleKey === currentRole) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
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
                
                // 使用Markdown渲染AI回复
                arr.forEach(seg=>{
                    if(seg.type==='think'){
                        const span = document.createElement('span');
                        span.className = 'think';
                        span.textContent = seg.text;
                        bubble.appendChild(span);
                    } else {
                        // 使用marked.js渲染Markdown
                        if (window.marked) {
                            const div = document.createElement('div');
                            div.className = 'markdown-content';
                            div.innerHTML = window.marked.parse(seg.text);
                            bubble.appendChild(div);
                        } else {
                            bubble.appendChild(document.createTextNode(seg.text));
                        }
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
                    cancelBtn.className = 'ai-chat-send ai-chat-cancel-btn';
                    cancelBtn.style.marginLeft = '0.7em';
                    cancelBtn.textContent = langMap[getLang()].cancel;
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
        
        // 为代码块添加样式
        const style = document.createElement('style');
        style.textContent = `
            .markdown-content {
                line-height: 1.5;
            }
            .markdown-content code {
                font-family: Consolas, Monaco, 'Andale Mono', monospace;
                background-color: rgba(0,0,0,0.05);
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 0.9em;
            }
            body.night .markdown-content code {
                background-color: rgba(255,255,255,0.1);
            }
            .markdown-content pre {
                background-color: rgba(0,0,0,0.05);
                padding: 8px 12px;
                border-radius: 6px;
                overflow-x: auto;
                margin: 8px 0;
            }
            body.night .markdown-content pre {
                background-color: rgba(255,255,255,0.07);
            }
            .markdown-content pre code {
                background: transparent;
                padding: 0;
                white-space: pre;
                display: block;
            }
            .markdown-content h1, .markdown-content h2, .markdown-content h3,
            .markdown-content h4, .markdown-content h5, .markdown-content h6 {
                margin-top: 16px;
                margin-bottom: 8px;
                font-weight: 600;
            }
            .markdown-content p {
                margin: 8px 0;
            }
            .markdown-content ul, .markdown-content ol {
                padding-left: 20px;
                margin: 8px 0;
            }
            .markdown-content blockquote {
                border-left: 4px solid rgba(0,0,0,0.1);
                padding-left: 12px;
                margin: 8px 0;
                color: rgba(0,0,0,0.7);
            }
            body.night .markdown-content blockquote {
                border-color: rgba(255,255,255,0.2);
                color: rgba(255,255,255,0.7);
            }
            .markdown-content img {
                max-width: 100%;
            }
            .markdown-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 8px 0;
            }
            .markdown-content table th, .markdown-content table td {
                border: 1px solid rgba(0,0,0,0.1);
                padding: 6px 8px;
            }
            body.night .markdown-content table th, body.night .markdown-content table td {
                border-color: rgba(255,255,255,0.1);
            }
            .markdown-content table th {
                background-color: rgba(0,0,0,0.05);
            }
            body.night .markdown-content table th {
                background-color: rgba(255,255,255,0.05);
            }
        `;
        document.head.appendChild(style);
        
        chatContent.scrollTop = chatContent.scrollHeight;
    }
    function showDialog(){
        setLangUI();
        loadHistory();
        renderHistory();
        createRoleSelector(); // 创建角色选择器
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
            // 获取当前选中的角色提示词
            const rolePrompt = roles[currentRole]?.prompt || '';
            
            // 获取当前选中的模型ID和API配置
            const modelConfig = models[currentModel] || models['qwen3-235b'];
            const modelId = modelConfig.id;
            const apiConfig = modelConfig.api || defaultApiConfig;
            
            // 使用选中模型对应的API
            const res = await fetch(apiConfig.url, {
                method: 'POST',
                headers: {
                    ...(apiConfig.key ? {'Authorization': `Bearer ${apiConfig.key}`} : {}),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        ...(rolePrompt ? [{
                            role: "system",
                            content: rolePrompt
                        }] : []),
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
        if(e.target.classList.contains('ai-chat-cancel-btn')){
            if(controller) {
                controller.abort();
            }
            // 立即显示完整内容并解除输入框
            let last = chatHistory[chatHistory.length-1];
            if(last && last.role==='ai' && typeof last._cancel==='function'){
                last._cancel();
                delete last._cancel;
            }
            // 立即恢复输入状态
            isGenerating = false;
            setInputState('idle');
            // 移除取消按钮
            e.target.remove();
            delete last.cancellable;
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