let problem = {};
let streak = 0;
let answered = false;

// Unit categories with conversion bases
const unitCategories = {
    length: {
        name: '長さ',
        units: ['mm', 'cm', 'm', 'km'],
        toBase: { 'mm': 1, 'cm': 10, 'm': 1000, 'km': 1000000 }
    },
    weight: {
        name: '重さ',
        units: ['mg', 'g', 'kg', 't'],
        toBase: { 'mg': 1, 'g': 1000, 'kg': 1000000, 't': 1000000000 }
    },
    volume: {
        name: '体積',
        units: ['mm3', 'cm3', 'm3', 'L', 'dL'],
        toBase: { 'mm3': 1, 'cm3': 1000, 'm3': 1000000000, 'L': 1000000, 'dL': 100000 }
    },
    area: {
        name: '面積',
        units: ['mm2', 'cm2', 'm2', 'a', 'ha'],
        toBase: { 'mm2': 1, 'cm2': 100, 'm2': 1000000, 'a': 100000000, 'ha': 10000000000 }
    }
};

function updateStreakDisplay() {
    const el = document.getElementById('streakCount');
    if (el) el.textContent = streak;
}

function startQuestion() {
    const value = parseFloat(document.getElementById('value').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;

    if (isNaN(value) || value < 0) {
        alert('正の数値を入力してください');
        return;
    }

    if (fromUnit === toUnit) {
        alert('異なる単位を選んでください');
        return;
    }

    problem = {
        value: value,
        fromUnit: fromUnit,
        toUnit: toUnit,
        answer: convertUnit(value, fromUnit, toUnit)
    };

    document.getElementById('questionText').textContent = 
        `${value} ${fromUnit} は何 ${toUnit} ですか？`;
    document.getElementById('answerInput').value = '';
    document.getElementById('question').classList.add('active');
    document.getElementById('result').classList.remove('active');
    document.getElementById('answerInput').focus();
    answered = false;
    const btn = document.getElementById('checkBtn');
    if (btn) btn.disabled = false;
}

function generateRandomQuestion() {
    const categories = Object.keys(unitCategories);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const category = unitCategories[selectedCategory];
    
    let from = category.units[Math.floor(Math.random() * category.units.length)];
    let to = category.units[Math.floor(Math.random() * category.units.length)];
    while (from === to) to = category.units[Math.floor(Math.random() * category.units.length)];
    
    const value = +(Math.random() * 99 + 1).toFixed(2);

    problem = {
        value: value,
        fromUnit: from,
        toUnit: to,
        category: selectedCategory,
        answer: convertUnit(value, from, to, selectedCategory)
    };

    document.getElementById('questionText').textContent = `${value} ${from} は何 ${to} ですか？`;
    document.getElementById('answerInput').value = '';
    document.getElementById('question').classList.add('active');
    document.getElementById('result').classList.remove('active');
    document.getElementById('answerInput').focus();
    answered = false;
    const btn = document.getElementById('checkBtn');
    if (btn) btn.disabled = false;
}

function convertUnit(value, from, to, category) {
    const cat = unitCategories[category];
    const fromBase = cat.toBase[from];
    const toBase = cat.toBase[to];
    return (value * fromBase) / toBase;
}

function checkAnswer() {
    if (answered) return; // prevent repeated submissions
    const userAnswer = parseFloat(document.getElementById('answerInput').value);

    if (isNaN(userAnswer)) {
        alert('数値を入力してください');
        return;
    }

    const correctAnswer = problem.answer;
    const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.0001;

    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('resultText');

    if (isCorrect) {
        streak += 1;
        updateStreakDisplay();
        resultDiv.className = 'result active correct';
        resultText.innerHTML = `✅ 正解です！<br>連続正解: ${streak}`;
    } else {
        streak = 0;
        updateStreakDisplay();
        resultDiv.className = 'result active incorrect';
        resultText.innerHTML = `❌ 不正解です。<br>正しい答え: ${correctAnswer}<br>連続正解: ${streak}`;
    }
    answered = true;
    const btn = document.getElementById('checkBtn');
    if (btn) btn.disabled = true;
}

function nextQuestion() {
    document.getElementById('result').classList.remove('active');
    generateRandomQuestion();
}

document.getElementById('answerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (!answered) checkAnswer();
    }
});
