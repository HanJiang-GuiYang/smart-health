/* ===================================
   智养未来 Smart Health - Main JavaScript
   =================================== */

// ===================================
// Initialize Libraries
// ===================================

// AOS Animation (optimized: shorter duration, GPU-friendly easing)
AOS.init({
    duration: 500,
    easing: 'ease-out',
    once: true,
    offset: 80,
    disable: function() {
        return window.innerWidth < 768;
    }
});

// Particles removed for performance

// ===================================
// Navigation
// ===================================

const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect (throttled with rAF)
let scrollScheduled = false;
window.addEventListener('scroll', () => {
    if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            updateActiveNav();
            scrollScheduled = false;
        });
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Update active navigation based on scroll position (cached, early exit)
const navSections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollPos = window.scrollY + 100;
    
    for (const section of navSections) {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        
        if (scrollPos >= top && scrollPos < top + height) {
            const id = section.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
            break;
        }
    }
}

// ===================================
// Hero Stats Counter Animation
// ===================================

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    update();
}

// Trigger counter animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(document.getElementById('statStudents'), 12580);
            animateCounter(document.getElementById('statSchools'), 368);
            animateCounter(document.getElementById('statRecords'), 89420);
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

heroObserver.observe(document.querySelector('.hero'));

// ===================================
// Health Check Module
// ===================================

const healthData = {
    sleep: 8,
    water: 8,
    exercise: 60,
    diet: 3,
    mood: 3
};

// Sleep slider
const sleepSlider = document.getElementById('sleepHours');
const sleepValue = document.getElementById('sleepValue');
sleepSlider.addEventListener('input', (e) => {
    healthData.sleep = parseFloat(e.target.value);
    sleepValue.textContent = healthData.sleep;
    updateHealthScore();
    updateSleepStatus();
});

function updateSleepStatus() {
    const status = document.querySelector('#health-check .health-card:nth-child(1) .card-status');
    const indicator = status.querySelector('.status-indicator');
    const text = status.querySelector('.status-text');
    
    if (healthData.sleep >= 7 && healthData.sleep <= 9) {
        indicator.className = 'status-indicator good';
        text.textContent = '睡眠充足';
    } else if (healthData.sleep >= 6 && healthData.sleep < 7) {
        indicator.className = 'status-indicator medium';
        text.textContent = '睡眠略不足';
    } else {
        indicator.className = 'status-indicator poor';
        text.textContent = '睡眠不足';
    }
}

// Water slider
const waterSlider = document.getElementById('waterCups');
const waterValue = document.getElementById('waterValue');
waterSlider.addEventListener('input', (e) => {
    healthData.water = parseInt(e.target.value);
    waterValue.textContent = healthData.water;
    updateHealthScore();
    updateWaterStatus();
});

function updateWaterStatus() {
    const status = document.querySelector('#health-check .health-card:nth-child(2) .card-status');
    const indicator = status.querySelector('.status-indicator');
    const text = status.querySelector('.status-text');
    
    if (healthData.water >= 8) {
        indicator.className = 'status-indicator good';
        text.textContent = '饮水达标';
    } else if (healthData.water >= 5) {
        indicator.className = 'status-indicator medium';
        text.textContent = '饮水偏少';
    } else {
        indicator.className = 'status-indicator poor';
        text.textContent = '饮水不足';
    }
}

// Exercise slider
const exerciseSlider = document.getElementById('exerciseMinutes');
const exerciseValue = document.getElementById('exerciseValue');
exerciseSlider.addEventListener('input', (e) => {
    healthData.exercise = parseInt(e.target.value);
    exerciseValue.textContent = healthData.exercise;
    updateHealthScore();
    updateExerciseStatus();
});

function updateExerciseStatus() {
    const status = document.querySelector('#health-check .health-card:nth-child(3) .card-status');
    const indicator = status.querySelector('.status-indicator');
    const text = status.querySelector('.status-text');
    
    if (healthData.exercise >= 60) {
        indicator.className = 'status-indicator good';
        text.textContent = '运动达标';
    } else if (healthData.exercise >= 30) {
        indicator.className = 'status-indicator medium';
        text.textContent = '运动偏少';
    } else {
        indicator.className = 'status-indicator poor';
        text.textContent = '运动不足';
    }
}

// Diet select
const dietSelect = document.getElementById('dietScore');
dietSelect.addEventListener('change', (e) => {
    healthData.diet = parseInt(e.target.value);
    updateHealthScore();
    updateDietStatus();
});

function updateDietStatus() {
    const status = document.querySelector('#health-check .health-card:nth-child(4) .card-status');
    const indicator = status.querySelector('.status-indicator');
    const text = status.querySelector('.status-text');
    
    const dietLabels = {
        5: { indicator: 'good', text: '饮食非常均衡' },
        4: { indicator: 'good', text: '饮食较均衡' },
        3: { indicator: 'medium', text: '饮食一般' },
        2: { indicator: 'poor', text: '饮食不太均衡' },
        1: { indicator: 'poor', text: '饮食较差' }
    };
    
    const config = dietLabels[healthData.diet];
    indicator.className = `status-indicator ${config.indicator}`;
    text.textContent = config.text;
}

// Mood selector
const moodBtns = document.querySelectorAll('.mood-btn');
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        healthData.mood = parseInt(btn.dataset.mood);
        updateHealthScore();
        updateMoodStatus();
    });
});

function updateMoodStatus() {
    const status = document.querySelector('#health-check .health-card:nth-child(5) .card-status');
    const indicator = status.querySelector('.status-indicator');
    const text = status.querySelector('.status-text');
    
    const moodLabels = {
        5: { indicator: 'good', text: '心情极佳' },
        4: { indicator: 'good', text: '心情愉快' },
        3: { indicator: 'medium', text: '心情平和' },
        2: { indicator: 'poor', text: '心情低落' },
        1: { indicator: 'poor', text: '心情很差' }
    };
    
    const config = moodLabels[healthData.mood];
    indicator.className = `status-indicator ${config.indicator}`;
    text.textContent = config.text;
}

// Calculate health score
function updateHealthScore() {
    let score = 0;
    
    // Sleep (0-25 points)
    if (healthData.sleep >= 7 && healthData.sleep <= 9) score += 25;
    else if (healthData.sleep >= 6 && healthData.sleep < 7) score += 15;
    else score += 5;
    
    // Water (0-25 points)
    if (healthData.water >= 8) score += 25;
    else if (healthData.water >= 5) score += 15;
    else score += 5;
    
    // Exercise (0-25 points)
    if (healthData.exercise >= 60) score += 25;
    else if (healthData.exercise >= 30) score += 15;
    else score += 5;
    
    // Diet (0-15 points)
    score += (healthData.diet / 5) * 15;
    
    // Mood (0-10 points)
    score += (healthData.mood / 5) * 10;
    
    score = Math.round(score);
    
    // Update display
    document.getElementById('healthScore').textContent = score;
    
    // Update progress circle
    const progress = document.getElementById('scoreProgress');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    progress.style.strokeDashoffset = offset;
}

// Save health data
document.getElementById('saveHealthBtn').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    const healthRecord = {
        date: today,
        ...healthData,
        score: document.getElementById('healthScore').textContent
    };
    
    // Save to localStorage
    let records = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0) {
        records[existingIndex] = healthRecord;
    } else {
        records.push(healthRecord);
    }
    
    localStorage.setItem('healthRecords', JSON.stringify(records));
    
    // Show success message
    showNotification('健康记录已保存！', 'success');
    
    // Trigger trend chart update
    window.dispatchEvent(new CustomEvent('healthRecordSaved'));
    
    // Report is now on-demand via DeepSeek API
});

// Initialize health score on load
updateHealthScore();

// ===================================
// TCM Constitution Analysis Module
// ===================================

const tcmQuestions = [
    { id: 1, text: '您是否容易感到疲劳？' },
    { id: 2, text: '您是否容易气短（呼吸短促、接不上气）？' },
    { id: 3, text: '您是否容易心慌？' },
    { id: 4, text: '您是否容易头晕或站起时晕眩？' },
    { id: 5, text: '您是否比别人容易感冒？' },
    { id: 6, text: '您是否感到手脚冰凉？' },
    { id: 7, text: '您是否感到胃部不适？' },
    { id: 8, text: '您是否容易便秘或大便干燥？' },
    { id: 9, text: '您是否容易腹泻？' },
    { id: 10, text: '您是否容易出汗？' },
    { id: 11, text: '您的皮肤是否干燥？' },
    { id: 12, text: '您是否感到眼睛干涩？' },
    { id: 13, text: '您是否容易失眠或多梦？' },
    { id: 14, text: '您是否容易健忘？' },
    { id: 15, text: '您是否容易焦虑或紧张？' },
    { id: 16, text: '您是否容易情绪低落？' },
    { id: 17, text: '您是否容易烦躁易怒？' },
    { id: 18, text: '您是否感到身体沉重？' },
    { id: 19, text: '您是否容易长痘痘或皮肤出油？' },
    { id: 20, text: '您是否容易有瘀斑（皮肤下出血点）？' }
];

let currentQuestionIndex = 0;
let tcmAnswers = new Array(20).fill(0);

const questionnaire = document.getElementById('tcmQuestionnaire');
const result = document.getElementById('tcmResult');
const questionTitle = document.getElementById('questionTitle');
const currentQuestionEl = document.getElementById('currentQuestion');
const progressFill = document.getElementById('tcmProgress');
const prevBtn = document.getElementById('prevQuestion');
const nextBtn = document.getElementById('nextQuestion');
const optionBtns = document.querySelectorAll('.option-btn');

function loadQuestion() {
    const question = tcmQuestions[currentQuestionIndex];
    questionTitle.textContent = question.text;
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    progressFill.style.width = `${((currentQuestionIndex + 1) / 20) * 100}%`;
    
    // Update option states
    optionBtns.forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.value) === tcmAnswers[currentQuestionIndex]) {
            btn.classList.add('selected');
        }
    });
    
    // Update button states
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = currentQuestionIndex === 19 ? '查看结果' : '下一题';
}

// Option click handler
optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        tcmAnswers[currentQuestionIndex] = parseInt(btn.dataset.value);
    });
});

// Previous question
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

// Next question / Show result
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < 19) {
        if (tcmAnswers[currentQuestionIndex] === 0) {
            showNotification('请先选择一个选项', 'warning');
            return;
        }
        currentQuestionIndex++;
        loadQuestion();
    } else {
        if (tcmAnswers[currentQuestionIndex] === 0) {
            showNotification('请先选择一个选项', 'warning');
            return;
        }
        calculateTCMResult();
    }
});

// Calculate TCM constitution result
function calculateTCMResult() {
    // Simple scoring algorithm for demonstration
    const totalScore = tcmAnswers.reduce((sum, ans) => sum + ans, 0);
    const avgScore = totalScore / 20;
    
    let constitutionType, description, traits, advice, foods;
    
    if (avgScore <= 2) {
        constitutionType = '平和质';
        description = '阴阳气血调和，体态适中，面色润泽';
        traits = ['体形匀称健壮', '面色肤色润泽', '精力充沛', '睡眠良好', '适应能力强'];
        advice = ['饮食有节，不要过饱', '作息规律，不熬夜', '适度运动，保持活力', '顺应四季变化调养'];
        foods = ['山药', '薏米', '红枣', '枸杞', '黑芝麻'];
    } else if (avgScore <= 2.5) {
        constitutionType = '气虚质';
        description = '元气不足，疲乏气短，自汗易感';
        traits = ['容易疲劳', '语声低弱', '容易气短', '容易出汗', '容易感冒'];
        advice = ['宜食益气健脾食物', '避免过度劳累', '适当运动，不宜剧烈', '保证充足睡眠'];
        foods = ['黄芪', '人参', '山药', '大枣', '小米'];
    } else if (avgScore <= 3) {
        constitutionType = '阳虚质';
        description = '阳气不足，畏寒怕冷，手足不温';
        traits = ['手脚发凉', '畏寒怕冷', '面色苍白', '精神不振', '大便溏薄'];
        advice = ['宜食温阳散寒食物', '避免生冷寒凉', '适当运动，晒太阳', '注意保暖'];
        foods = ['羊肉', '生姜', '桂圆', '核桃', '韭菜'];
    } else if (avgScore <= 3.5) {
        constitutionType = '阴虚质';
        description = '阴液亏少，口燥咽干，手足心热';
        traits = ['手足心热', '口燥咽干', '面色潮红', '容易失眠', '大便干燥'];
        advice = ['宜食滋阴润燥食物', '避免辛辣燥热', '保持心情平静', '充足睡眠'];
        foods = ['百合', '银耳', '枸杞', '梨', '鸭肉'];
    } else {
        constitutionType = '痰湿质';
        description = '痰湿凝聚，形体肥胖，腹部肥满';
        traits = ['形体肥胖', '腹部肥满', '口黏苔腻', '身重不爽', '多汗且黏'];
        advice = ['饮食清淡，少食肥甘', '坚持运动，出汗排湿', '避免潮湿环境', '规律作息'];
        foods = ['薏米', '冬瓜', '白萝卜', '陈皮', '荷叶'];
    }
    
    // Display result
    document.getElementById('resultType').textContent = constitutionType;
    document.getElementById('resultDesc').textContent = description;
    
    const traitsList = document.getElementById('resultTraits');
    traitsList.innerHTML = traits.map(t => `<li>${t}</li>`).join('');
    
    const adviceList = document.getElementById('resultAdvice');
    adviceList.innerHTML = advice.map(a => `<li>${a}</li>`).join('');
    
    const foodsContainer = document.getElementById('resultFoods');
    foodsContainer.innerHTML = foods.map(f => `<span class="food-tag">${f}</span>`).join('');
    
    // Show result, hide questionnaire
    questionnaire.style.display = 'none';
    result.style.display = 'block';
    
    // Save result
    localStorage.setItem('tcmResult', JSON.stringify({
        type: constitutionType,
        date: new Date().toISOString(),
        answers: tcmAnswers
    }));
}

// Retake test
document.getElementById('retakeTest').addEventListener('click', () => {
    currentQuestionIndex = 0;
    tcmAnswers = new Array(20).fill(0);
    questionnaire.style.display = 'block';
    result.style.display = 'none';
    loadQuestion();
});

// Initialize first question
loadQuestion();

// ===================================
// Labor Health Module
// ===================================

let laborRecords = JSON.parse(localStorage.getItem('laborRecords') || '[]');
let laborPoints = parseInt(localStorage.getItem('laborPoints') || '0');

const laborTypes = {
    cleaning: { name: '清洁卫生', icon: 'fa-broom', calories: 4 },
    gardening: { name: '园艺种植', icon: 'fa-seedling', calories: 5 },
    cooking: { name: '烹饪制作', icon: 'fa-utensils', calories: 3 },
    exercise: { name: '体育锻炼', icon: 'fa-running', calories: 8 },
    craft: { name: '手工制作', icon: 'fa-paint-brush', calories: 2 },
    other: { name: '其他劳动', icon: 'fa-tools', calories: 3 }
};

const laborLevels = [
    { name: '劳动新手', points: 0 },
    { name: '劳动达人', points: 100 },
    { name: '劳动能手', points: 300 },
    { name: '劳动标兵', points: 600 },
    { name: '劳动模范', points: 1000 }
];

// Add labor record
document.getElementById('addLaborBtn').addEventListener('click', () => {
    const form = document.getElementById('laborForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('saveLaborBtn').addEventListener('click', () => {
    const type = document.getElementById('laborType').value;
    const duration = parseInt(document.getElementById('laborDuration').value);
    
    if (!type || !duration) {
        showNotification('请填写完整的劳动信息', 'warning');
        return;
    }
    
    const record = {
        id: Date.now(),
        type,
        duration,
        calories: Math.round(duration * laborTypes[type].calories),
        date: new Date().toISOString()
    };
    
    laborRecords.unshift(record);
    localStorage.setItem('laborRecords', JSON.stringify(laborRecords));
    
    // Add points
    const points = Math.round(duration / 10);
    laborPoints += points;
    localStorage.setItem('laborPoints', laborPoints);
    
    // Update UI
    renderLaborList();
    updateLaborStats();
    updateLaborPoints();
    
    // Reset form
    document.getElementById('laborType').value = '';
    document.getElementById('laborDuration').value = '';
    document.getElementById('laborForm').style.display = 'none';
    
    showNotification(`劳动记录已保存！获得 ${points} 积分`, 'success');
});

function renderLaborList() {
    const list = document.getElementById('laborList');
    
    if (laborRecords.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>暂无劳动记录</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = laborRecords.slice(0, 10).map(record => {
        const type = laborTypes[record.type];
        const date = new Date(record.date);
        const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div class="labor-item">
                <div class="labor-item-info">
                    <div class="labor-item-icon">
                        <i class="fas ${type.icon}"></i>
                    </div>
                    <div>
                        <div class="labor-item-name">${type.name}</div>
                        <div class="labor-item-time">${timeStr} · ${record.duration}分钟</div>
                    </div>
                </div>
                <div class="labor-item-cal">${record.calories}千卡</div>
            </div>
        `;
    }).join('');
}

function updateLaborStats() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekRecords = laborRecords.filter(r => new Date(r.date) >= weekAgo);
    const totalDuration = laborRecords.reduce((sum, r) => sum + r.duration, 0);
    const totalCalories = laborRecords.reduce((sum, r) => sum + r.calories, 0);
    
    document.getElementById('weekLabor').textContent = weekRecords.length;
    document.getElementById('totalDuration').textContent = totalDuration;
    document.getElementById('totalCalories').textContent = totalCalories;
}

function updateLaborPoints() {
    document.getElementById('laborPoints').textContent = laborPoints;
    
    // Find current level
    let currentLevel = laborLevels[0];
    let nextLevel = laborLevels[1];
    
    for (let i = laborLevels.length - 1; i >= 0; i--) {
        if (laborPoints >= laborLevels[i].points) {
            currentLevel = laborLevels[i];
            nextLevel = laborLevels[i + 1] || null;
            break;
        }
    }
    
    document.getElementById('laborLevel').textContent = currentLevel.name;
    
    if (nextLevel) {
        const progress = ((laborPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100;
        document.getElementById('pointsBar').style.width = `${progress}%`;
        document.getElementById('pointsHint').textContent = `还需 ${nextLevel.points - laborPoints} 积分升级到 ${nextLevel.name}`;
    } else {
        document.getElementById('pointsBar').style.width = '100%';
        document.getElementById('pointsHint').textContent = '已达到最高等级！';
    }
}

// Initialize labor module
renderLaborList();
updateLaborStats();
updateLaborPoints();

// ===================================
// Nutrition Module
// ===================================

let nutritionChart = null;
let currentMeal = 'breakfast';

// Meal tabs
document.querySelectorAll('.meal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.meal-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMeal = tab.dataset.meal;
    });
});

// Analyze meal
document.getElementById('analyzeMealBtn').addEventListener('click', () => {
    const content = document.getElementById('mealContent').value.trim();
    
    if (!content) {
        showNotification('请输入饮食内容', 'warning');
        return;
    }
    
    // Simple nutrition analysis (simulated)
    const analysis = analyzeNutrition(content);
    
    // Update chart
    updateNutritionChart(analysis);
    
    // Update advice
    updateNutritionAdvice(analysis);
    
    // Save to localStorage
    const mealRecords = JSON.parse(localStorage.getItem('mealRecords') || '[]');
    mealRecords.push({
        meal: currentMeal,
        content,
        analysis,
        date: new Date().toISOString()
    });
    localStorage.setItem('mealRecords', JSON.stringify(mealRecords));
    
    showNotification('营养分析完成！', 'success');
});

function analyzeNutrition(content) {
    // Simple keyword-based analysis
    const foods = {
        grains: ['米饭', '面条', '馒头', '面包', '粥', '小麦', '玉米'],
        vegetables: ['青菜', '白菜', '萝卜', '西红柿', '黄瓜', '菠菜', '芹菜'],
        protein: ['鸡蛋', '牛奶', '肉', '鱼', '豆腐', '鸡肉', '牛肉'],
        fruits: ['苹果', '香蕉', '橙子', '葡萄', '梨', '西瓜']
    };
    
    let scores = {
        grains: 0,
        vegetables: 0,
        protein: 0,
        fruits: 0
    };
    
    for (const [category, items] of Object.entries(foods)) {
        items.forEach(item => {
            if (content.includes(item)) {
                scores[category] += 25;
            }
        });
    }
    
    // Normalize scores
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
        for (const key in scores) {
            scores[key] = Math.min(100, (scores[key] / total) * 100);
        }
    } else {
        scores = { grains: 25, vegetables: 25, protein: 25, fruits: 25 };
    }
    
    return scores;
}

function updateNutritionChart(analysis) {
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    
    if (nutritionChart) {
        nutritionChart.destroy();
    }
    
    nutritionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['谷物', '蔬菜', '蛋白质', '水果'],
            datasets: [{
                data: [analysis.grains, analysis.vegetables, analysis.protein, analysis.fruits],
                backgroundColor: [
                    'rgba(212, 175, 55, 0.8)',
                    'rgba(74, 222, 128, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(248, 113, 113, 0.8)'
                ],
                borderColor: [
                    'rgba(212, 175, 55, 1)',
                    'rgba(74, 222, 128, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(248, 113, 113, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#adb5bd',
                        padding: 15
                    }
                }
            }
        }
    });
}

function updateNutritionAdvice(analysis) {
    const adviceContainer = document.getElementById('nutritionAdvice');
    const advice = [];
    
    if (analysis.grains < 20) {
        advice.push({ icon: 'fa-exclamation', text: '建议增加谷物摄入，如米饭、面条等' });
    }
    if (analysis.vegetables < 20) {
        advice.push({ icon: 'fa-exclamation', text: '建议多吃蔬菜，补充维生素和膳食纤维' });
    }
    if (analysis.protein < 20) {
        advice.push({ icon: 'fa-exclamation', text: '建议增加蛋白质摄入，如鸡蛋、牛奶、鱼肉等' });
    }
    if (analysis.fruits < 20) {
        advice.push({ icon: 'fa-info', text: '建议适量食用水果，补充维生素C' });
    }
    
    if (advice.length === 0) {
        advice.push({ icon: 'fa-check', text: '饮食结构均衡，继续保持！' });
    }
    
    adviceContainer.innerHTML = advice.map(a => `
        <div class="advice-item">
            <i class="fas ${a.icon}"></i>
            <span>${a.text}</span>
        </div>
    `).join('');
}

// ===================================
// TCM Culture Module
// ===================================

const cultureTabs = document.querySelectorAll('.culture-tab');
const cultureContents = document.querySelectorAll('.culture-content');

cultureTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        cultureTabs.forEach(t => t.classList.remove('active'));
        cultureContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}Tab`).classList.add('active');
    });
});

// ===================================
// Acupoint Module
// ===================================

const acupoints = document.querySelectorAll('.acupoint');
const acupointInfo = document.getElementById('acupointInfo');
const infoPlaceholder = acupointInfo.querySelector('.info-placeholder');
const infoContent = document.getElementById('infoContent');

const acupointTips = {
    '666666666穴': '经常按摩此穴位可以提神醒脑，改善头痛和失眠症状。',
    '太阳穴': '轻轻按揉太阳穴可以缓解头痛、疲劳，提神醒脑。',
    '天突穴': '按摩此穴位可以缓解咳嗽、气喘等呼吸道症状。',
    '膻中穴': '按摩此穴位可以宽胸理气，缓解胸闷、心悸等症状。',
    '中脘穴': '按摩此穴位可以健脾和胃，缓解胃痛、腹胀等消化不良症状。',
    '气海穴': '按摩此穴位可以补气益肾，增强体力。',
    '曲池穴': '按摩此穴位可以清热解表，缓解发热、手臂疼痛等症状。',
    '合谷穴': '按摩此穴位可以镇痛止痛，缓解头痛、牙痛等症状。',
    '足三里': '经常按摩此穴位可以健脾和胃，增强免疫力，是重要的保健穴位。',
    '三阴交': '按摩此穴位可以调理脾胃，改善失眠、消化不良等症状。'
};

acupoints.forEach(point => {
    point.addEventListener('click', () => {
        const name = point.dataset.name;
        const desc = point.dataset.desc;
        
        infoPlaceholder.style.display = 'none';
        infoContent.style.display = 'block';
        
        document.getElementById('acupointName').textContent = name;
        document.getElementById('acupointDesc').textContent = desc;
        document.getElementById('acupointTip').textContent = acupointTips[name] || '经常按摩此穴位可以疏通经络，调和气血。';
        
        // Highlight selected point
        acupoints.forEach(p => p.style.fill = 'var(--gold)');
        point.style.fill = 'var(--gold-light)';
    });
});

// ===================================
// Growth System Module
// ===================================

let checkinData = JSON.parse(localStorage.getItem('checkinData') || '{}');
let checkinStreak = parseInt(localStorage.getItem('checkinStreak') || '0');
let totalCheckins = parseInt(localStorage.getItem('totalCheckins') || '0');

// Load today's checkin state
const today = new Date().toISOString().split('T')[0];
if (checkinData[today]) {
    document.getElementById('checkExercise').checked = checkinData[today].exercise || false;
    document.getElementById('checkWater').checked = checkinData[today].water || false;
    document.getElementById('checkSleep').checked = checkinData[today].sleep || false;
    document.getElementById('checkLabor').checked = checkinData[today].labor || false;
    document.getElementById('checkDiet').checked = checkinData[today].diet || false;
}

// Submit checkin
document.getElementById('submitCheckin').addEventListener('click', () => {
    const checkin = {
        exercise: document.getElementById('checkExercise').checked,
        water: document.getElementById('checkWater').checked,
        sleep: document.getElementById('checkSleep').checked,
        labor: document.getElementById('checkLabor').checked,
        diet: document.getElementById('checkDiet').checked
    };
    
    const checkedCount = Object.values(checkin).filter(v => v).length;
    
    if (checkedCount === 0) {
        showNotification('请至少选择一项打卡内容', 'warning');
        return;
    }
    
    checkinData[today] = checkin;
    localStorage.setItem('checkinData', JSON.stringify(checkinData));
    
    // Update streak
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (checkinData[yesterday]) {
        checkinStreak++;
    } else {
        checkinStreak = 1;
    }
    localStorage.setItem('checkinStreak', checkinStreak);
    
    // Update total
    totalCheckins++;
    localStorage.setItem('totalCheckins', totalCheckins);
    
    // Update UI
    updateGrowthUI();
    
    showNotification(`打卡成功！已连续打卡 ${checkinStreak} 天`, 'success');
});

function updateGrowthUI() {
    document.getElementById('checkinStreak').textContent = checkinStreak;
    document.getElementById('totalCheckins').textContent = totalCheckins;
    
    // Calculate tree level
    const treeLevel = Math.floor(totalCheckins / 10) + 1;
    document.getElementById('treeLevel').textContent = treeLevel;
    
    // Update tree leaves
    const leavesContainer = document.getElementById('treeLeaves');
    const leafCount = Math.min(totalCheckins, 50);
    
    leavesContainer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const leaf = document.createElement('div');
        leaf.className = `leaf ${i < leafCount ? 'active' : ''}`;
        leavesContainer.appendChild(leaf);
    }
}

// Initialize growth UI
updateGrowthUI();

// ===================================
// Report Module - DeepSeek AI Integration
// ===================================

// API Configuration - 使用 Vercel Serverless 代理（API Key 安全存储在后端）
const DEEPSEEK_API_URL = '/api/chat';
const DEEPSEEK_MODEL = 'deepseek-chat';

// DOM elements
const generateReportBtn = document.getElementById('generateReportBtn');
const regenerateReportBtn = document.getElementById('regenerateReport');
const retryReportBtn = document.getElementById('retryReport');
const exportReportBtn = document.getElementById('exportReport');
const reportLoading = document.getElementById('reportLoading');
const reportAiResult = document.getElementById('reportAiResult');
const reportError = document.getElementById('reportError');
const resultBody = document.getElementById('resultBody');
const resultTime = document.getElementById('resultTime');
const errorMsg = document.getElementById('errorMsg');

// Generate report
generateReportBtn.addEventListener('click', generateAIReport);
regenerateReportBtn.addEventListener('click', generateAIReport);
retryReportBtn.addEventListener('click', generateAIReport);

// Export report
exportReportBtn.addEventListener('click', exportReport);

async function generateAIReport() {
    // Show loading, hide others
    reportLoading.style.display = 'block';
    reportAiResult.style.display = 'none';
    reportError.style.display = 'none';

    try {
        // Gather user data from localStorage
        const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
        const laborRecordsData = JSON.parse(localStorage.getItem('laborRecords') || '[]');
        const mealRecords = JSON.parse(localStorage.getItem('mealRecords') || '[]');
        const checkinDataLocal = JSON.parse(localStorage.getItem('checkinData') || '{}');
        const checkinStreakLocal = parseInt(localStorage.getItem('checkinStreak') || '0');
        const totalCheckinsLocal = parseInt(localStorage.getItem('totalCheckins') || '0');
        const tcmResult = JSON.parse(localStorage.getItem('tcmResult') || 'null');
        const laborPointsLocal = parseInt(localStorage.getItem('laborPoints') || '0');

        // Build prompt context
        const healthSummary = healthRecords.length > 0
            ? `最近${healthRecords.length}条健康记录：${healthRecords.slice(-7).map(r => `${r.date} 评分${r.score}分(睡眠${r.sleep}h/饮水${r.water}杯/运动${r.exercise}min/饮食${r.diet}分/心情${r.mood}分)`).join('；')}`
            : '暂无健康检测记录';

        const laborSummary = laborRecordsData.length > 0
            ? `共${laborRecordsData.length}条劳动记录，累计${laborRecordsData.reduce((s, r) => s + r.duration, 0)}分钟，消耗${laborRecordsData.reduce((s, r) => s + r.calories, 0)}千卡，当前积分${laborPointsLocal}分`
            : '暂无劳动记录';

        const mealSummary = mealRecords.length > 0
            ? `最近${mealRecords.length}条饮食记录：${mealRecords.slice(-5).map(m => `${m.meal}: ${m.content}`).join('；')}`
            : '暂无饮食记录';

        const checkinSummary = `连续打卡${checkinStreakLocal}天，累计打卡${totalCheckinsLocal}次`;

        const tcmSummary = tcmResult
            ? `中医体质分析结果：${tcmResult.type}`
            : '尚未进行中医体质分析';

        const prompt = `你是一位专业的校园健康管理AI助手。请根据以下学生的健康数据，生成一份详细的个人健康分析报告。

【健康检测数据】
${healthSummary}

【劳动健康数据】
${laborSummary}

【饮食营养数据】
${mealSummary}

【打卡成长数据】
${checkinSummary}

【中医体质分析】
${tcmSummary}

请用Markdown格式输出报告，要求包含以下部分：
1. **总体健康评估** - 综合评分和整体状况概述
2. **各项指标分析** - 对睡眠、饮水、运动、饮食、心情逐项分析
3. **劳动与成长评价** - 劳动表现和成长系统完成情况
4. **饮食营养建议** - 基于饮食记录给出具体改善建议
5. **中医养生建议** - 结合体质分析给出个性化养生方案
6. **下阶段目标** - 给出3-5个具体可执行的改善目标

要求：语言亲切鼓励，适合中小学生阅读；建议具体可操作；体现中医文化特色；总字数控制在800-1200字。`;

        // Call DeepSeek API via Vercel proxy
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: '你是"智养未来"校园智慧健康平台的AI健康助手，擅长结合中医养生文化和现代健康管理知识，为中小学生提供专业、亲切的健康分析报告。请使用Markdown格式输出。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `API 请求失败 (${response.status})`);
        }

        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content;

        if (!aiContent) {
            throw new Error('未收到有效的AI回复内容');
        }

        // Render markdown content
        resultBody.innerHTML = renderMarkdown(aiContent);
        resultTime.textContent = `生成时间：${new Date().toLocaleString('zh-CN')}`;

        // Show result
        reportLoading.style.display = 'none';
        reportAiResult.style.display = 'block';

        // Save the generated report
        localStorage.setItem('lastAIReport', JSON.stringify({
            content: aiContent,
            timestamp: new Date().toISOString()
        }));

    } catch (error) {
        console.error('AI Report Error:', error);
        reportLoading.style.display = 'none';
        reportError.style.display = 'block';
        errorMsg.textContent = error.message || '生成报告时出错，请检查 API Key 是否正确';
    }
}

// Simple Markdown renderer
function renderMarkdown(text) {
    let html = text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Blockquote
        .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr>')
        // Unordered list
        .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
        // Ordered list
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*?<\/li>\s*(?:<br>)?)+)/g, '<ul>$1</ul>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }

    return html;
}

// Export report as text
function exportReport() {
    const content = resultBody.innerText;
    if (!content) {
        showNotification('没有可导出的报告内容', 'warning');
        return;
    }

    const blob = new Blob([
        `智养未来 Smart Health - AI 健康报告\n`,
        `生成时间：${new Date().toLocaleString('zh-CN')}\n`,
        `${'='.repeat(50)}\n\n`,
        content
    ], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `健康报告_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('报告已导出！', 'success');
}

// Restore last report on page load
const lastReport = JSON.parse(localStorage.getItem('lastAIReport') || 'null');
if (lastReport) {
    resultBody.innerHTML = renderMarkdown(lastReport.content);
    resultTime.textContent = `生成时间：${new Date(lastReport.timestamp).toLocaleString('zh-CN')}`;
    reportAiResult.style.display = 'block';
}

// ===================================
// Notification System
// ===================================

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid ${type === 'success' ? 'rgba(74, 222, 128, 0.5)' : type === 'warning' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(212, 175, 55, 0.5)'};
        border-radius: 12px;
        color: ${type === 'success' ? '#4ade80' : type === 'warning' ? '#fbbf24' : '#d4af37'};
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===================================
// GSAP Animations
// ===================================

gsap.registerPlugin(ScrollTrigger);

// Hero title animation
gsap.from('.hero-title', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
});

// Hero parallax (one-time, no scrub)
gsap.to('.hero-content', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
    },
    y: 100,
    opacity: 0.5
});

// ===================================
// AI Consultation Module
// ===================================

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const weatherTemp = document.getElementById('weatherTemp');
const weatherDesc = document.getElementById('weatherDesc');
const weatherTip = document.getElementById('weatherTip');

// Chat history for context
let chatHistory = [
    {
        role: 'system',
        content: '你是"智养未来"校园智慧健康平台的AI健康助手，具备中医养生和现代医学知识。请用亲切、专业的语气回答学生问题，结合中医文化给出建议，必要时建议就医。回答要具体可操作，适合中小学生理解。请使用Markdown格式，适当使用列表和加粗突出重点。'
    }
];

// Weather data (simulated - in production would use real API)
const weatherData = {
    temp: 22,
    desc: '晴转多云',
    humidity: 65,
    wind: '微风',
    tips: [
        '今日气温适宜，适合户外运动，建议傍晚散步30分钟',
        '空气湿度适中，注意补充水分，建议饮用温水或菊花茶',
        '春季阳气生发，可多食用绿色蔬菜，如菠菜、芹菜',
        '早晚温差较大，注意适时增减衣物，预防感冒',
        '晴天紫外线较强，户外活动注意防晒'
    ]
};

// Initialize weather widget
function initWeather() {
    weatherTemp.textContent = `${weatherData.temp}°C`;
    weatherDesc.textContent = weatherData.desc;

    const randomTip = weatherData.tips[Math.floor(Math.random() * weatherData.tips.length)];
    weatherTip.innerHTML = `
        <i class="fas fa-lightbulb"></i>
        <span>${randomTip}</span>
    `;
}

initWeather();

// Send message
sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Suggestion buttons
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        chatInput.value = question;
        sendMessage();
    });
});

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessageToChat('user', message);
    chatInput.value = '';

    // Add to history
    chatHistory.push({ role: 'user', content: message });

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
        // Build enhanced prompt with weather context
        const enhancedPrompt = `${message}\n\n【当前天气信息】\n温度：${weatherData.temp}°C\n天气：${weatherData.desc}\n湿度：${weatherData.humidity}%\n风力：${weatherData.wind}\n\n请结合以上天气信息，在回答中适当给出养生建议。`;

        const messages = [...chatHistory];
        messages[messages.length - 1] = { role: 'user', content: enhancedPrompt };

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `API 请求失败 (${response.status})`);
        }

        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content;

        removeTypingIndicator(typingIndicator);

        if (aiContent) {
            addMessageToChat('bot', aiContent);
            chatHistory.push({ role: 'assistant', content: aiContent });
        } else {
            addMessageToChat('bot', '抱歉，未能获取到回复，请重试。');
        }

    } catch (error) {
        console.error('AI Consult Error:', error);
        removeTypingIndicator(typingIndicator);
        addMessageToChat('bot', `❌ 请求失败：${error.message}\n\n请检查：\n1. API Key 是否正确\n2. 网络连接是否正常\n3. API 额度是否充足`);
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = `<i class="fas ${role === 'bot' ? 'fa-robot' : 'fa-user'}"></i>`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = renderMarkdown(content);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return typingDiv;
}

function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
    }
}

// ===================================
// ESP32-C3 实时心率监测模块
// 从 ESP32 WebServer 拉取 /data 接口数据
// ===================================

(function() {
    // 数据历史（最多 120 个点）
    const hist = { stable: [], raw: [], spo2: [] };
    let lastId = -1;
    let pollTimer = null;
    let isConnected = false;

    // DOM 元素
    const elStableHR = document.getElementById('esp32StableHR');
    const elRawHR = document.getElementById('esp32RawHR');
    const elSpO2 = document.getElementById('esp32SpO2');
    const elStatus = document.getElementById('esp32Status');
    const elTrend = document.getElementById('esp32HRTrend');
    const elSpO2Age = document.getElementById('esp32SpO2Age');
    const elHRStats = document.getElementById('esp32HRStats');
    const elSpO2Stats = document.getElementById('esp32SpO2Stats');
    const elAddress = document.getElementById('esp32Address');
    const elConnectBtn = document.getElementById('esp32ConnectBtn');

    // 获取 ESP32 基础地址
    function getBaseURL() {
        const val = (elAddress?.value || 'http://max30102.local').trim();
        return val.replace(/\/$/, '');
    }

    // 工具：数组统计
    function stats(arr) {
        const v = arr.filter(Number.isFinite);
        if (!v.length) return '--';
        const avg = v.reduce((x, y) => x + y, 0) / v.length;
        return `均 ${avg.toFixed(0)} · 低 ${Math.min(...v)} · 高 ${Math.max(...v)}`;
    }

    // 工具：推入历史
    function push(arr, v) {
        arr.push(v);
        if (arr.length > 120) arr.shift();
    }

    // 绘制 Canvas 图表（纯 Canvas 2D，不依赖 Chart.js）
    function drawChart(canvas, series, minY, maxY) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const pad = { l: 38, r: 8, t: 8, b: 22 };

        ctx.clearRect(0, 0, w, h);

        // 网格线 + Y 轴标签
        ctx.strokeStyle = 'rgba(56, 217, 230, 0.12)';
        ctx.fillStyle = '#91a4bb';
        ctx.font = '11px system-ui, sans-serif';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = pad.t + (h - pad.t - pad.b) * i / 4;
            const val = Math.round(maxY - (maxY - minY) * i / 4);
            ctx.beginPath();
            ctx.moveTo(pad.l, y);
            ctx.lineTo(w - pad.r, y);
            ctx.stroke();
            ctx.fillText(val, 4, y + 4);
        }

        // 绘制数据线
        series.forEach(s => {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            let started = false;
            s.data.forEach((v, i) => {
                if (!Number.isFinite(v)) return;
                const x = pad.l + (w - pad.l - pad.r) * (i / Math.max(1, s.data.length - 1));
                const y = pad.t + (h - pad.t - pad.b) * (maxY - v) / (maxY - minY);
                started ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
                started = true;
            });
            ctx.stroke();
        });
    }

    // ===================================
    // 医学健康评估算法
    // 参考标准：
    //   心率 - WHO/美国心脏协会(AHA) 成人静息心率标准
    //   血氧 - 中华医学会呼吸病学分会 SpO2 分级标准
    // ===================================

    function assessHeartRate(hr) {
        if (!hr || hr <= 0) return { level: '等待数据', detail: '--', badge: '--', cls: 'info' };

        // WHO/AHA 成人静息心率分级
        if (hr < 40) {
            return {
                level: '重度心动过缓',
                detail: '心率极低，可能存在房室传导阻滞',
                badge: '危险',
                cls: 'danger'
            };
        } else if (hr < 60) {
            return {
                level: '心动过缓',
                detail: '低于正常范围，运动员除外',
                badge: '注意',
                cls: 'warning'
            };
        } else if (hr <= 100) {
            return {
                level: '正常心率',
                detail: '符合 WHO 60-100 BPM 标准',
                badge: '正常',
                cls: 'normal'
            };
        } else if (hr <= 120) {
            return {
                level: '轻度心动过速',
                detail: '可能与运动、紧张、发热有关',
                badge: '注意',
                cls: 'warning'
            };
        } else if (hr <= 150) {
            return {
                level: '中度心动过速',
                detail: '建议休息后复测，持续需就医',
                badge: '警告',
                cls: 'danger'
            };
        } else {
            return {
                level: '重度心动过速',
                detail: '心率过高，建议立即就医检查',
                badge: '危险',
                cls: 'danger'
            };
        }
    }

    function assessSpO2(spo2) {
        if (!spo2 || spo2 <= 0) return { level: '等待数据', detail: '--', badge: '--', cls: 'info' };

        // 中华医学会呼吸病学分会 SpO2 分级
        if (spo2 >= 95) {
            return {
                level: '血氧正常',
                detail: 'SpO₂ ≥ 95%，氧合功能良好',
                badge: '正常',
                cls: 'normal'
            };
        } else if (spo2 >= 90) {
            return {
                level: '轻度低氧血症',
                detail: 'SpO₂ 90-94%，建议深呼吸、通风',
                badge: '注意',
                cls: 'warning'
            };
        } else if (spo2 >= 85) {
            return {
                level: '中度低氧血症',
                detail: 'SpO₂ 85-89%，建议吸氧并就医',
                badge: '警告',
                cls: 'danger'
            };
        } else {
            return {
                level: '重度低氧血症',
                detail: 'SpO₂ < 85%，属于医疗急症，立即就医',
                badge: '危险',
                cls: 'danger'
            };
        }
    }

    function generateSummary(hrResult, spo2Result) {
        const hrBad = hrResult.cls === 'danger';
        const spo2Bad = spo2Result.cls === 'danger';
        const hrWarn = hrResult.cls === 'warning';
        const spo2Warn = spo2Result.cls === 'warning';

        if (hrBad || spo2Bad) {
            return {
                text: '⚠️ 检测到异常指标！建议立即停止运动、保持安静，若持续异常请及时就医。以上评估仅供参考，不构成医疗诊断。',
                icon: 'fa-exclamation-triangle',
                color: '#ff5b67'
            };
        } else if (hrWarn || spo2Warn) {
            return {
                text: '部分指标偏离正常范围，建议休息 10 分钟后复测。保持规律作息、适度运动有助于改善。以上评估仅供参考。',
                icon: 'fa-exclamation-circle',
                color: '#fbbf24'
            };
        } else if (hrResult.cls === 'normal' && spo2Result.cls === 'normal') {
            return {
                text: '各项指标均在正常范围内，身体状况良好！继续保持健康的生活方式。',
                icon: 'fa-check-circle',
                color: '#4ade80'
            };
        }
        return {
            text: '数据采集中，请稍后查看完整评估结果。',
            icon: 'fa-spinner fa-spin',
            color: '#38d9e6'
        };
    }

    function updateAssessment(d) {
        const hrEl = document.getElementById('hrLevel');
        const hrDetail = document.getElementById('hrDetail');
        const hrBadge = document.getElementById('hrBadge');
        const spo2El = document.getElementById('spo2Level');
        const spo2Detail = document.getElementById('spo2Detail');
        const spo2Badge = document.getElementById('spo2Badge');
        const summaryText = document.getElementById('summaryText');
        const summaryIcon = document.querySelector('#assessmentSummary .summary-icon i');
        const summaryWrap = document.getElementById('assessmentSummary');

        const valid = d.hr_valid && d.stable_hr > 0;
        const hrResult = assessHeartRate(valid ? d.stable_hr : 0);
        const spo2Result = assessSpO2(d.spo2_valid ? d.spo2 : 0);

        // 更新心率评估
        hrEl.textContent = hrResult.level;
        hrDetail.textContent = hrResult.detail;
        hrBadge.textContent = hrResult.badge;
        hrBadge.className = 'assessment-badge ' + hrResult.cls;

        // 更新血氧评估
        spo2El.textContent = spo2Result.level;
        spo2Detail.textContent = spo2Result.detail;
        spo2Badge.textContent = spo2Badge.className = 'assessment-badge ' + spo2Result.cls;

        // 更新综合评估
        const summary = generateSummary(hrResult, spo2Result);
        summaryText.textContent = summary.text;
        if (summaryIcon) {
            summaryIcon.className = 'fas ' + summary.icon;
            summaryIcon.style.color = summary.color;
        }
        if (summaryWrap) {
            summaryWrap.style.borderColor = summary.color + '40';
        }
    }

    // 渲染数据到页面
    function render(d) {
        const valid = d.hr_valid && d.stable_hr > 0;

        // 更新数值
        elStableHR.textContent = valid ? d.stable_hr : '--';
        elRawHR.textContent = d.hr_valid ? d.raw_hr : '--';
        elSpO2.textContent = d.spo2_valid ? d.spo2 : '--';

        // 状态指示
        if (elStatus) {
            elStatus.className = 'esp32-status ' + (d.sensor_ready ? 'connected' : '');
            elStatus.querySelector('.status-text').textContent = d.collecting ? '采集中…' : '已连接';
        }

        // 血氧采样时间
        if (elSpO2Age) {
            elSpO2Age.textContent = d.update_id
                ? `上次完成 ${Math.floor(d.age_ms / 1000)} 秒前`
                : '正在准备第一组数据';
        }

        // 推入历史（仅当有新数据时）
        if (d.update_id !== lastId && d.update_id > 0) {
            lastId = d.update_id;
            push(hist.stable, valid ? d.stable_hr : NaN);
            push(hist.raw, d.hr_valid ? d.raw_hr : NaN);
            push(hist.spo2, d.spo2_valid ? d.spo2 : NaN);
        }

        // 趋势判断
        if (elTrend) {
            const v = hist.stable.filter(Number.isFinite);
            const delta = v.length > 1 ? v[v.length - 1] - v[Math.max(0, v.length - 4)] : 0;
            if (!valid) {
                elTrend.textContent = '当前结果无效';
                elTrend.className = 'metric-trend';
            } else if (Math.abs(delta) < 4) {
                elTrend.textContent = '近期平稳';
                elTrend.className = 'metric-trend stable';
            } else if (delta > 0) {
                elTrend.textContent = `近期上升 ${delta} BPM`;
                elTrend.className = 'metric-trend up';
            } else {
                elTrend.textContent = `近期下降 ${-delta} BPM`;
                elTrend.className = 'metric-trend down';
            }
        }

        // 统计
        if (elHRStats) elHRStats.textContent = stats(hist.stable);
        if (elSpO2Stats) elSpO2Stats.textContent = stats(hist.spo2);

        // 绘制图表
        const hrCanvas = document.getElementById('esp32HRChart');
        const spo2Canvas = document.getElementById('esp32SpO2Chart');
        if (hrCanvas) {
            drawChart(hrCanvas, [
                { data: hist.stable, color: '#38d9e6' },
                { data: hist.raw, color: '#ff5b67' }
            ], 40, 160);
        }
        if (spo2Canvas) {
            drawChart(spo2Canvas, [
                { data: hist.spo2, color: '#4ade80' }
            ], 85, 100);
        }

        // 更新医学健康评估
        updateAssessment(d);
    }

    // 轮询 ESP32 数据
    async function poll() {
        try {
            const url = `${getBaseURL()}/data`;
            const r = await fetch(url, { cache: 'no-store' });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data = await r.json();
            render(data);

            if (!isConnected) {
                isConnected = true;
                if (elConnectBtn) {
                    elConnectBtn.innerHTML = '<i class="fas fa-check"></i> 已连接';
                }
            }
        } catch (e) {
            isConnected = false;
            if (elStatus) {
                elStatus.className = 'esp32-status';
                elStatus.querySelector('.status-text').textContent = '连接中断';
            }
            if (elConnectBtn) {
                elConnectBtn.innerHTML = '<i class="fas fa-plug"></i> 连接';
            }
            console.warn('ESP32 数据拉取失败:', e.message);
        }
    }

    // 连接按钮
    if (elConnectBtn) {
        elConnectBtn.addEventListener('click', () => {
            // 清空历史，重新开始
            hist.stable = [];
            hist.raw = [];
            hist.spo2 = [];
            lastId = -1;

            if (elStatus) {
                elStatus.querySelector('.status-text').textContent = '正在连接…';
            }
            elConnectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 连接中…';

            // 立即拉取一次
            poll();

            // 启动定时轮询（每秒一次）
            if (pollTimer) clearInterval(pollTimer);
            pollTimer = setInterval(poll, 1000);
        });
    }

    // 窗口大小变化时重绘
    window.addEventListener('resize', () => {
        if (hist.stable.length > 0) {
            const hrCanvas = document.getElementById('esp32HRChart');
            const spo2Canvas = document.getElementById('esp32SpO2Chart');
            if (hrCanvas) {
                drawChart(hrCanvas, [
                    { data: hist.stable, color: '#38d9e6' },
                    { data: hist.raw, color: '#ff5b67' }
                ], 40, 160);
            }
            if (spo2Canvas) {
                drawChart(spo2Canvas, [
                    { data: hist.spo2, color: '#4ade80' }
                ], 85, 100);
            }
        }
    });

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        if (pollTimer) clearInterval(pollTimer);
    });
})();

// ===================================
// AI 舌诊模块（图片上传 + 手动描述）
// ===================================

(function() {
    const uploadArea = document.getElementById('tongueUploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('tonguePreviewImg');
    const removeBtn = document.getElementById('removeImageBtn');
    const fileInput = document.getElementById('tongueFileInput');
    const autoFeatures = document.getElementById('tongueAutoFeatures');
    const autoFeatureTags = document.getElementById('autoFeatureTags');
    const analyzeBtn = document.getElementById('analyzeTongueBtn');
    const extraInput = document.getElementById('tongueExtraInput');
    const resultPlaceholder = document.getElementById('tongueResultPlaceholder');
    const resultContent = document.getElementById('tongueResultContent');
    const resultImageWrap = document.getElementById('resultImageWrap');
    const resultImage = document.getElementById('tongueResultImage');
    const resultAnalysis = document.getElementById('tongueAnalysisResult');
    const loading = document.getElementById('tongueLoading');

    let uploadedImage = null;
    let detectedColor = '';
    let detectedCoatingColor = '';

    // 点击上传区域触发文件选择
    uploadPlaceholder.addEventListener('click', () => fileInput.click());

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadPlaceholder.style.borderColor = '#d4af37';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadPlaceholder.style.borderColor = '';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadPlaceholder.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImage(file);
    });

    // 文件选择
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImage(file);
    });

    // 删除图片
    removeBtn.addEventListener('click', () => {
        uploadedImage = null;
        detectedColor = '';
        detectedCoatingColor = '';
        uploadPreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        autoFeatures.style.display = 'none';
        fileInput.value = '';
    });

    // 处理图片：预览 + 颜色提取
    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage = e.target.result;
            previewImg.src = uploadedImage;
            uploadPlaceholder.style.display = 'none';
            uploadPreview.style.display = 'block';

            // 提取颜色特征
            extractColors(uploadedImage);
        };
        reader.readAsDataURL(file);
    }

    // 从图片提取舌色和苔色
    function extractColors(imageData) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;

            // 分析中心区域（舌头通常在中间）
            const colors = [];
            const start = Math.floor(size * 0.25);
            const end = Math.floor(size * 0.75);
            for (let y = start; y < end; y++) {
                for (let x = start; x < end; x++) {
                    const idx = (y * size + x) * 4;
                    colors.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
                }
            }

            // 计算平均颜色
            const avg = colors.reduce((acc, c) => {
                acc.r += c.r; acc.g += c.g; acc.b += c.b;
                return acc;
            }, { r: 0, g: 0, b: 0 });
            avg.r = Math.round(avg.r / colors.length);
            avg.g = Math.round(avg.g / colors.length);
            avg.b = Math.round(avg.b / colors.length);

            // 判断舌色
            detectedColor = classifyTongueColor(avg.r, avg.g, avg.b);
            detectedCoatingColor = classifyCoatingColor(avg.r, avg.g, avg.b);

            // 显示自动识别结果
            autoFeatureTags.innerHTML = `
                <span class="auto-feature-tag color-tag">🎨 舌色：${detectedColor}</span>
                <span class="auto-feature-tag color-tag"> 苔色：${detectedCoatingColor}</span>
                <span class="auto-feature-tag">RGB(${avg.r}, ${avg.g}, ${avg.b})</span>
            `;
            autoFeatures.style.display = 'block';
        };
        img.src = imageData;
    }

    // 根据 RGB 判断舌色
    function classifyTongueColor(r, g, b) {
        // 舌色偏红：R 明显高于 G 和 B
        if (r > 180 && r - g > 30 && r - b > 40) return '红舌';
        // 舌色深红/绛：R 很高但整体偏暗
        if (r > 140 && r < 200 && r - g > 20 && b < 100) return '绛舌';
        // 舌色偏紫：R 和 B 都较高
        if (r > 100 && b > 80 && Math.abs(r - b) < 50 && g < r - 10) return '紫舌';
        // 舌色偏白/淡白：三个值都高且接近
        if (r > 180 && g > 170 && b > 160 && Math.abs(r - g) < 30) return '淡白舌';
        // 正常淡红
        if (r > 150 && r > g && r > b && r - g < 40) return '淡红舌';
        return '淡红舌';
    }

    // 判断苔色
    function classifyCoatingColor(r, g, b) {
        // 黄苔：G 较高，R 也较高
        if (r > 160 && g > 140 && b < 120 && g > b + 20) return '黄苔';
        // 灰黑苔：整体偏暗
        if (r < 120 && g < 120 && b < 120) return '灰黑苔';
        // 白苔：整体偏亮
        if (r > 180 && g > 180 && b > 170) return '白苔';
        return '薄白苔';
    }

    // 获取手动选择的特征
    function getSelectedValue(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    // 点击分析按钮
    analyzeBtn.addEventListener('click', async () => {
        const shape = getSelectedValue('tongueShape');
        const coating = getSelectedValue('tongueCoating');
        const moisture = getSelectedValue('tongueMoisture');
        const extra = extraInput.value.trim();

        // 构建舌象描述
        let description = '';
        if (detectedColor) {
            description += `【AI 识别舌色】${detectedColor}。`;
        } else {
            description += '【舌色】未上传图片，请手动描述。';
        }
        if (detectedCoatingColor) {
            description += `【AI 识别苔色】${detectedCoatingColor}。`;
        }
        description += `【舌形】${shape}。`;
        description += `【舌苔】${coating}。`;
        description += `【润燥】${moisture}。`;
        if (extra) {
            description += `【补充】${extra}。`;
        }

        // 显示加载
        resultPlaceholder.style.display = 'none';
        resultContent.style.display = 'none';
        loading.style.display = 'flex';

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一位经验丰富的中医专家，精通舌诊。请根据用户描述的舌象特征，进行专业的中医辨证分析。请用通俗易懂的语言回答。'
                        },
                        {
                            role: 'user',
                            content: `请根据以下舌象特征进行中医舌诊分析：\n\n${description}\n\n请按以下格式返回分析结果：\n\n### 舌色分析\n[分析舌色的含义及对应的身体状况]\n\n### 舌形分析\n[分析舌形的含义]\n\n### 舌苔分析\n[分析舌苔的含义]\n\n### 综合辨证\n[综合舌色、舌形、舌苔进行整体辨证]\n\n### 体质判断\n[判断体质类型：平和质/气虚质/阳虚质/阴虚质/痰湿质/湿热质/血瘀质/气郁质/特禀质]\n\n### 养生建议\n[给出具体的饮食、起居、运动、情志调理建议]\n\n### 推荐食材\n[推荐适合的食材，用顿号分隔]\n\n### 注意事项\n[需要避免的食物或行为]`
                        }
                    ],
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `API 请求失败 (${response.status})`);
            }

            const data = await response.json();
            const analysis = data.choices?.[0]?.message?.content;

            if (!analysis) {
                throw new Error('未能获取分析结果');
            }

            // 显示结果
            if (uploadedImage) {
                resultImage.src = uploadedImage;
                resultImageWrap.style.display = 'block';
            } else {
                resultImageWrap.style.display = 'none';
            }
            resultAnalysis.innerHTML = renderMarkdown(analysis);

            loading.style.display = 'none';
            resultContent.style.display = 'flex';

        } catch (error) {
            console.error('舌诊分析失败:', error);
            loading.style.display = 'none';
            resultPlaceholder.style.display = 'flex';
            resultPlaceholder.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color:#ff5b67;"></i>
                <p style="color:#ff5b67;">分析失败：${error.message}</p>
                <p class="sub-text">请重试或检查 API Key 配置</p>
            `;
        }
    });
})();

// ===================================
// 健康趋势模块
// ===================================

(function() {
    let currentRange = 7;
    let charts = {};
    
    const trendBtns = document.querySelectorAll('.trend-btn');
    const trendEmpty = document.getElementById('trendEmpty');
    
    // 时间范围切换
    trendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            trendBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRange = parseInt(btn.dataset.range);
            renderTrends();
        });
    });
    
    // 获取健康记录
    function getHealthRecords() {
        try {
            const records = JSON.parse(localStorage.getItem('healthRecords') || '[]');
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            return records;
        } catch (e) {
            return [];
        }
    }
    
    // 渲染趋势图
    function renderTrends() {
        const records = getHealthRecords();
        
        if (records.length === 0) {
            trendEmpty.style.display = 'block';
            document.querySelector('.trend-charts').style.display = 'none';
            document.querySelector('.trend-stats').style.display = 'none';
            return;
        }
        
        trendEmpty.style.display = 'none';
        document.querySelector('.trend-charts').style.display = 'grid';
        document.querySelector('.trend-stats').style.display = 'grid';
        
        // 过滤最近 N 天的数据
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - currentRange);
        const filtered = records.filter(r => new Date(r.date) >= cutoff);
        
        if (filtered.length === 0) {
            trendEmpty.style.display = 'block';
            document.querySelector('.trend-charts').style.display = 'none';
            document.querySelector('.trend-stats').style.display = 'none';
            return;
        }
        
        const labels = filtered.map(r => {
            const d = new Date(r.date);
            return `${d.getMonth()+1}/${d.getDate()}`;
        });
        
        const scores = filtered.map(r => r.score || 0);
        const sleeps = filtered.map(r => r.sleep || 0);
        const exercises = filtered.map(r => r.exercise || 0);
        const waters = filtered.map(r => r.water || 0);
        
        // 更新统计
        const avg = arr => arr.length ? (arr.reduce((a,b) => a+b, 0) / arr.length).toFixed(1) : '--';
        document.getElementById('trendAvgScore').textContent = avg(scores);
        document.getElementById('trendAvgSleep').textContent = avg(sleeps);
        document.getElementById('trendAvgExercise').textContent = avg(exercises);
        document.getElementById('trendAvgWater').textContent = avg(waters);
        
        // 销毁旧图表
        Object.values(charts).forEach(c => c?.destroy());
        charts = {};
        
        // 通用图表配置
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#91a4bb', font: { size: 11 } },
                    grid: { color: 'rgba(212, 175, 55, 0.1)' }
                },
                y: {
                    ticks: { color: '#91a4bb', font: { size: 11 } },
                    grid: { color: 'rgba(212, 175, 55, 0.1)' }
                }
            }
        };
        
        // 健康评分趋势
        charts.score = new Chart(document.getElementById('scoreTrendChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: scores,
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#d4af37'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, min: 0, max: 100 }
                }
            }
        });
        
        // 睡眠趋势
        charts.sleep = new Chart(document.getElementById('sleepTrendChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: sleeps,
                    borderColor: '#38d9e6',
                    backgroundColor: 'rgba(56, 217, 230, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#38d9e6'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, min: 0, max: 12 }
                }
            }
        });
        
        // 运动趋势
        charts.exercise = new Chart(document.getElementById('exerciseTrendChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: exercises,
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#4ade80'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, min: 0, max: 180 }
                }
            }
        });
        
        // 饮水趋势
        charts.water = new Chart(document.getElementById('waterTrendChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: waters,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#60a5fa'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, min: 0, max: 15 }
                }
            }
        });
    }
    
    // 监听健康记录保存事件
    window.addEventListener('healthRecordSaved', renderTrends);
    
    // 页面加载时渲染
    window.addEventListener('load', () => {
        setTimeout(renderTrends, 500);
    });
})();

// ===================================
// Initialize on Load
// ===================================

window.addEventListener('load', () => {
    // Load saved TCM result if exists
    const savedTCM = localStorage.getItem('tcmResult');
    if (savedTCM) {
        console.log('Saved TCM result:', JSON.parse(savedTCM));
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

console.log('智养未来 Smart Health - 初始化完成');