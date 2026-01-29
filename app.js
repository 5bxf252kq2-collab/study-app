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

function formatNumber(num) {
    // 指数記法を避け、見やすい形式で表示
    if (num === 0) return '0';
    const absNum = Math.abs(num);
    // より極端な値のみ指数表示（1e-8未満または1e12以上）
    if (absNum < 1e-8 || absNum >= 1e12) {
        return num.toExponential(6).replace(/\.?0+e/, 'e');
    }
    // 通常の数値は小数点以下の桁数を調整
    if (absNum < 1) {
        return num.toFixed(10).replace(/\.?0+$/, '');
    } else if (absNum < 1000) {
        return num.toFixed(6).replace(/\.?0+$/, '');
    } else {
        return num.toFixed(2).replace(/\.?0+$/, '');
    }
}

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
    const categorySelect = document.getElementById('categorySelect');
    const selectedCategory = categorySelect ? categorySelect.value : 'all';
    
    let category, categoryKey;
    
    if (selectedCategory === 'all') {
        const categories = Object.keys(unitCategories);
        categoryKey = categories[Math.floor(Math.random() * categories.length)];
    } else {
        categoryKey = selectedCategory;
    }
    
    category = unitCategories[categoryKey];
    
    let from, to;
    let validPair = false;
    let attempts = 0;
    
    while (!validPair && attempts < 10) {
        from = category.units[Math.floor(Math.random() * category.units.length)];
        to = category.units[Math.floor(Math.random() * category.units.length)];
        
        if (from === to) {
            attempts++;
            continue;
        }
        
        // 体積の場合、m3とmm3の組み合わせは避ける（10^9倍で不実用的）
        if (categoryKey === 'volume' && ((from === 'm3' && to === 'mm3') || (from === 'mm3' && to === 'm3'))) {
            attempts++;
            continue;
        }
        
        validPair = true;
    }
    
    const value = +(Math.random() * 99 + 1).toFixed(2);

    problem = {
        value: value,
        fromUnit: from,
        toUnit: to,
        category: categoryKey,
        answer: convertUnit(value, from, to, categoryKey)
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
    const result = (value * fromBase) / toBase;
    // 小数点以下の誤差を防ぐため、有効桁数で丸める
    return parseFloat(result.toPrecision(10));
}

function checkAnswer() {
    if (answered) return; // prevent repeated submissions
    const userAnswer = parseFloat(document.getElementById('answerInput').value);

    if (isNaN(userAnswer)) {
        alert('数値を入力してください');
        return;
    }

    const correctAnswer = problem.answer;
    // 誤差許容範囲を広げる（相対誤差で判定）
    const tolerance = Math.max(Math.abs(correctAnswer) * 0.0001, 0.0001);
    const isCorrect = Math.abs(userAnswer - correctAnswer) < tolerance;

    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('resultText');
    
    // 表示用に指数記法を避けるためにformatNumber()を使用
    const displayCorrectAnswer = formatNumber(correctAnswer);

    if (isCorrect) {
        streak += 1;
        updateStreakDisplay();
        resultDiv.className = 'result active correct';
        resultText.innerHTML = `✅ 正解です！<br>連続正解: ${streak}`;
    } else {
        streak = 0;
        updateStreakDisplay();
        resultDiv.className = 'result active incorrect';
        resultText.innerHTML = `❌ 不正解です。<br>正しい答え: ${displayCorrectAnswer}<br>連続正解: ${streak}`;
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
