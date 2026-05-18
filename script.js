const CONFIG = {
    // LOTO 6 の生成条件: 数字範囲、抽出個数、重み付け対象、合計値レンジ、許容する偶奇比
    loto6: {
        min: 1,
        max: 43,
        count: 6,
        frequent: [6, 43, 19, 38, 15],
        sumMin: 110,
        sumMax: 140,
        evenOddRatios: [[3, 3], [4, 2], [2, 4]], // [even, odd]
    },
    // LOTO 7 の生成条件: ルールはLOTO 6と同様だがレンジと個数が異なる
    loto7: {
        min: 1,
        max: 37,
        count: 7,
        frequent: [15, 13, 30, 9, 26],
        sumMin: 115,
        sumMax: 150,
        evenOddRatios: [[3, 4], [4, 3]], // [even, odd]
    }
};

const app = {
    // 指定タイプの予測を5件生成し、アニメーション付きで順番に描画する
    generateOrdered(type) {
        const resultsArea = document.getElementById('results-area');
        // 毎回、前回結果を消してから再生成する
        resultsArea.innerHTML = '';
        
        const config = CONFIG[type];
        
        // 5パターンを少しずつ遅延表示して、同時出現より見やすくする
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const combination = this.generateValidCombination(config);
                this.createTicketCard(combination, config, type, i);
            }, i * 150); // Stagger animations
        }
    },

    // 条件に合う組み合わせを探索する。上限回数までに見つからなければ簡易結果を返す
    generateValidCombination(config) {
        let attempts = 0;
        const maxAttempts = 1000;

        // 条件を満たすまで乱数生成を繰り返す
        while (attempts < maxAttempts) {
            attempts++;
            let numbers = this.generateRandomSet(config);
            
            // 合計値レンジと偶奇比を満たすかを検証
            if (!this.checkSum(numbers, config.sumMin, config.sumMax)) continue;
            if (!this.checkEvenOdd(numbers, config.evenOddRatios)) continue;
            
            // 50%の確率で連番を必須化し、出目の偏りを少し混ぜる
            if (Math.random() < 0.5) {
                if (!this.hasConsecutive(numbers)) continue;
            }

            return numbers; // Found a valid combination
        }
        
        // 条件が厳しすぎて見つからない場合のフォールバック
        return this.generateRandomSet(config);
    },

    // 頻出数字を重み付きにした乱数抽選で、昇順のユニーク配列を作る
    generateRandomSet(config) {
        const pool = [];
        // 全数字を1回ずつ入れ、頻出数字のみ追加で入れて当たりやすくする
        for (let n = config.min; n <= config.max; n++) {
            pool.push(n);
            // 頻出数字は2回分を追加し、通常数字より抽選される確率を上げる
            if (config.frequent.includes(n)) {
                pool.push(n);
                pool.push(n);
            }
        }

        const selection = new Set();
        // 重み付きプールから重複なしで必要数を抽出
        while (selection.size < config.count) {
            const index = Math.floor(Math.random() * pool.length);
            const num = pool[index];
            selection.add(num);
        }
        
        return Array.from(selection).sort((a, b) => a - b);
    },

    // 合計値が指定レンジ内かを判定
    checkSum(numbers, min, max) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        return sum >= min && sum <= max;
    },

    // 偶数個数と奇数個数の組み合わせが許容パターンに一致するかを判定
    checkEvenOdd(numbers, acceptedRatios) {
        const evens = numbers.filter(n => n % 2 === 0).length;
        const odds = numbers.length - evens;
        return acceptedRatios.some(r => r[0] === evens && r[1] === odds);
    },

    // 隣り合う数字(例: 14,15)が最低1組あるかを判定
    hasConsecutive(numbers) {
        for (let i = 0; i < numbers.length - 1; i++) {
            if (numbers[i] + 1 === numbers[i+1]) return true;
        }
        return false;
    },

    // 1件分の予測チケットDOMを組み立てて結果エリアに追加する
    createTicketCard(numbers, config, type, index) {
        const container = document.getElementById('results-area');
        
        const card = document.createElement('div');
        card.className = `ticket-card ${type}`;
        card.style.animationDelay = `${index * 0.1}s`;

        const ballsDiv = document.createElement('div');
        ballsDiv.className = 'balls-container';
        
        numbers.forEach(num => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.textContent = num < 10 ? `0${num}` : num;
            
            // 出現頻度が高い数字は強調表示
            if (config.frequent.includes(num)) {
                ball.classList.add('frequent');
            }
            ballsDiv.appendChild(ball);
        });

        const metaDiv = document.createElement('div');
        metaDiv.className = 'meta-info';
        
        // 合計値と生成順をチケット右側に表示
        const sum = numbers.reduce((a, b) => a + b, 0);
        metaDiv.innerHTML = `
            <span class="sum-badge">合計: ${sum}</span>
            <span>#${index + 1}</span>
        `;

        card.appendChild(ballsDiv);
        card.appendChild(metaDiv);
        container.appendChild(card);
    }
};
