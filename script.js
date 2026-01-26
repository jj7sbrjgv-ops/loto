const CONFIG = {
    loto6: {
        min: 1,
        max: 43,
        count: 6,
        frequent: [6, 43, 19, 38, 15],
        sumMin: 110,
        sumMax: 140,
        evenOddRatios: [[3, 3], [4, 2], [2, 4]], // [even, odd]
    },
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
    generateOrdered(type) {
        const resultsArea = document.getElementById('results-area');
        resultsArea.innerHTML = '';
        
        const config = CONFIG[type];
        
        // Generate 5 patterns
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const combination = this.generateValidCombination(config);
                this.createTicketCard(combination, config, type, i);
            }, i * 150); // Stagger animations
        }
    },

    generateValidCombination(config) {
        let attempts = 0;
        const maxAttempts = 1000;

        while (attempts < maxAttempts) {
            attempts++;
            let numbers = this.generateRandomSet(config);
            
            // Check constraints
            if (!this.checkSum(numbers, config.sumMin, config.sumMax)) continue;
            if (!this.checkEvenOdd(numbers, config.evenOddRatios)) continue;
            
            // 50% chance to force a consecutive pair check, otherwise allow it
            if (Math.random() < 0.5) {
                if (!this.hasConsecutive(numbers)) continue;
            }

            return numbers; // Found a valid combination
        }
        
        // Fallback if strict rules fail (rare)
        return this.generateRandomSet(config);
    },

    generateRandomSet(config) {
        const pool = [];
        // Create pool with weighted frequent numbers
        for (let n = config.min; n <= config.max; n++) {
            pool.push(n);
            // Add frequent numbers extra times to increase probability
            if (config.frequent.includes(n)) {
                // Add 2 extra copies of frequent numbers
                pool.push(n);
                pool.push(n);
            }
        }

        const selection = new Set();
        while (selection.size < config.count) {
            const index = Math.floor(Math.random() * pool.length);
            const num = pool[index];
            selection.add(num);
        }
        
        return Array.from(selection).sort((a, b) => a - b);
    },

    checkSum(numbers, min, max) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        return sum >= min && sum <= max;
    },

    checkEvenOdd(numbers, acceptedRatios) {
        const evens = numbers.filter(n => n % 2 === 0).length;
        const odds = numbers.length - evens;
        return acceptedRatios.some(r => r[0] === evens && r[1] === odds);
    },

    hasConsecutive(numbers) {
        for (let i = 0; i < numbers.length - 1; i++) {
            if (numbers[i] + 1 === numbers[i+1]) return true;
        }
        return false;
    },

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
            
            if (config.frequent.includes(num)) {
                ball.classList.add('frequent');
            }
            ballsDiv.appendChild(ball);
        });

        const metaDiv = document.createElement('div');
        metaDiv.className = 'meta-info';
        
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
