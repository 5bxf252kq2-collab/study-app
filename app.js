let problem = {};
let streak = 0;
let answered = false;

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
    const units = ['km','m','cm','mm'];
    let from = units[Math.floor(Math.random() * units.length)];
    let to = units[Math.floor(Math.random() * units.length)];
    while (from === to) to = units[Math.floor(Math.random() * units.length)];
    const value = +(Math.random() * 99 + 1).toFixed(2);

    problem = {
        value: value,
        fromUnit: from,
        toUnit: to,
        answer: convertUnit(value, from, to)
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

function convertUnit(value, from, to) {
    const toMm = {
        'mm': 1,
        'cm': 10,
        'm': 1000,
        'km': 1000000
    };
    return (value * toMm[from]) / toMm[to];
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
