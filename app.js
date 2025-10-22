
document.addEventListener("DOMContentLoaded", () => {
    // UI要素の取得
    const subjectSelect = document.getElementById("subject-select");
    const subjectInput = document.getElementById("subject-input");
    const addSubjectBtn = document.getElementById("add-subject-btn");
    const detailInput = document.getElementById("detail-input");
    const durationManualInput = document.getElementById("duration-manual");
    const durationSlider = document.getElementById("duration-slider");
    const dateInput = document.getElementById("date-input");
    const timeInput = document.getElementById("time-input");
    const addSessionBtn = document.getElementById("add-session-btn");
    const sessionList = document.getElementById("session-list");
    const totalDurationSpan = document.getElementById("total-duration");
    const totalStonesSpan = document.getElementById("total-stones");
    const subjectStatsList = document.getElementById("subject-stats-list");
    const recordTabBtn = document.getElementById("record-tab");
    const statsTabBtn = document.getElementById("stats-tab");
    const gachaTabBtn = document.getElementById("gacha-tab");
    const charactersTabBtn = document.getElementById("characters-tab");
    const settingsTabBtn = document.getElementById("settings-tab");
    const recordSection = document.getElementById("record-section");
    const statsSection = document.getElementById("stats-section");
    const gachaSection = document.getElementById("gacha-section");
    const charactersSection = document.getElementById("characters-section");
    const settingsSection = document.getElementById("settings-section");
    const noRecordsMessage = document.getElementById("no-records-message");
    const noStatsMessage = document.getElementById("no-stats-message");
    const registeredSubjectsList = document.getElementById("registered-subjects-list");
    const noSubjectsMessage = document.getElementById("no-subjects-message");
    const colorSettingsDiv = document.getElementById("color-settings");

    const currentStonesSpan = document.getElementById("current-stones");
    const pityCountSpan = document.getElementById("pity-count");
    const gachaSingleBtn = document.getElementById("gacha-single-btn");
    const gachaMultiBtn = document.getElementById("gacha-multi-btn");
    const gachaResultList = document.getElementById("gacha-result-list");
    const ownedCharactersList = document.getElementById("owned-characters-list");
    const noCharactersMessage = document.getElementById("no-characters-message");

    let studySessions = [];
    let registeredSubjects = [];
    let subjectColors = {};
    let totalStones = 0;
    let gachaPityCounter = 0; // 天井カウンター
    let lastGachaRarity = 0; // 最後に引いたレア度 (4 or 5)
    let gachaCountSinceLastHighRarity = 0; // 最後に星4/5を引いてからのガチャ回数
    let ownedCharacters = {}; // 獲得済みキャラ {name: {rarity: 5, count: 1}}

    let subjectChartInstance = null;
    let dailyChartInstance = null;

    // ガチャ排出リスト
    const gachaItems = {
        rarity5: [
            "ウェンティ", "ジン", "ディルック", "クレー", "アルベド", "モナ", "鍾離", "胡桃", "魈", "甘雨",
            "刻晴", "申鶴", "夜蘭", "七七", "白朮", "閑雲", "タルタリヤ", "雷電将軍", "八重神子", "神里綾華",
            "神里綾人", "楓原万葉", "宵宮", "珊瑚宮心海", "荒瀧一斗", "夢見月瑞希", "千織", "ナヒーダ", "ニィロウ",
            "ティナリ", "セノ", "アルハイゼン", "ディシア", "放浪者", "フリーナ", "ヌヴィレット", "リネ", "ナヴィア",
            "クロリンデ", "リオセスリ", "シグウィン", "アルレッキーノ", "エミリエ", "エスコフィエ", "スカーク",
            "ムアラニ", "キィニチ", "シロネン", "チャスカ", "シトラリ", "マーヴィカ", "ヴァレサ", "イネファ",
            "ラウマ", "フリンズ", "ネフェル"
        ],
        rarity4: [
            "アンバー", "ガイア", "リサ", "バーバラ", "ロサリア", "レザー", "ベネット", "ノエル", "スクロース",
            "エウルア", "ミカ", "フィッシュル", "ディオナ", "凝光", "香菱", "北斗", "煙緋", "ヨォーヨ", "行秋",
            "重雲", "雲菫", "辛炎", "嘉明", "トーマ", "早柚", "九条沙羅", "鹿野院平蔵", "ゴロー", "久岐忍",
            "綺良々", "コレイ", "キャンディス", "ドリー", "カーヴェ", "レイラ", "ファルザン", "リネット",
            "シャルロット", "フレミネ", "シュヴルーズ", "カチーナ", "オロルン", "藍硯", "イアンサ", "イファ",
            "ダリア", "アイノ"
        ],
        rarity3: [
            "素材<炎>", "素材<水>", "素材<雷>", "素材<草>", "素材<氷>", "素材<岩>"
        ]
    };

    // 初期化
    loadData();
    renderSubjects();
    renderSessions();
    renderStats();
    renderSubjectColorSettings();
    renderGachaState();
    renderOwnedCharacters();
    setCurrentDateTime(); // 初期表示時に現在日時を設定

    // イベントリスナー
    durationManualInput.addEventListener("input", () => {
        let value = parseInt(durationManualInput.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        durationManualInput.value = value;
        durationSlider.value = value;
    });
    durationSlider.addEventListener("input", () => {
        durationManualInput.value = durationSlider.value;
    });

    addSessionBtn.addEventListener("click", addSession);
    addSubjectBtn.addEventListener("click", addSubject);

    subjectSelect.addEventListener("change", () => {
        if (subjectSelect.value === "") {
            subjectInput.style.display = "block"; // 「科目を選択または入力」が選ばれたら入力フィールドを表示
            subjectInput.focus();
        } else {
            subjectInput.style.display = "none"; // 既存の科目が選ばれたら入力フィールドを隠す
            subjectInput.value = ""; // 入力フィールドの値をクリア
        }
    });

    recordTabBtn.addEventListener("click", () => switchTab("record"));
    statsTabBtn.addEventListener("click", () => switchTab("stats"));
    gachaTabBtn.addEventListener("click", () => switchTab("gacha"));
    charactersTabBtn.addEventListener("click", () => switchTab("characters"));
    settingsTabBtn.addEventListener("click", () => switchTab("settings"));

    gachaSingleBtn.addEventListener("click", () => performGacha(1));
    gachaMultiBtn.addEventListener("click", () => performGacha(10));

    // 関数定義
    function switchTab(tab) {
        // すべてのタブボタンとセクションを非アクティブ化
        document.querySelectorAll(".tab-selector button").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));

        // 選択されたタブをアクティブ化
        if (tab === "record") {
            recordTabBtn.classList.add("active");
            recordSection.classList.add("active");
            setCurrentDateTime(); // 記録タブに戻った時に現在日時を設定
        } else if (tab === "stats") {
            statsTabBtn.classList.add("active");
            statsSection.classList.add("active");
            renderStats(); // 統計タブ表示時に再描画
        } else if (tab === "gacha") {
            gachaTabBtn.classList.add("active");
            gachaSection.classList.add("active");
            renderGachaState();
        } else if (tab === "characters") {
            charactersTabBtn.classList.add("active");
            charactersSection.classList.add("active");
            renderOwnedCharacters();
        } else if (tab === "settings") {
            settingsTabBtn.classList.add("active");
            settingsSection.classList.add("active");
            renderSubjects(); // 設定タブ表示時に科目リストを再描画
            renderSubjectColorSettings(); // 設定タブ表示時に色設定を再描画
        }
    }

    function setCurrentDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        // 日付と時刻の入力フィールドが空の場合のみ現在日時を設定
        if (!dateInput.value) {
            dateInput.value = `${year}-${month}-${day}`;
        }
        if (!timeInput.value) {
            timeInput.value = `${hours}:${minutes}`;
        }
    }

    function addSubject() {
        const newSubject = subjectInput.value.trim();
        if (newSubject === "") {
            alert("科目名を入力してください。");
            return;
        }
        if (registeredSubjects.includes(newSubject)) {
            alert("その科目は既に登録されています。");
            return;
        }
        registeredSubjects.push(newSubject);
        registeredSubjects.sort();
        saveData();
        renderSubjects();
        subjectInput.value = "";
        subjectInput.style.display = "none"; // 追加後は入力フィールドを隠す
        subjectSelect.value = ""; // 選択をリセット
        renderSubjectColorSettings();
    }

    function deleteSubject(subjectToDelete) {
        if (confirm(`「${subjectToDelete}」を削除してもよろしいですか？この科目の記録は削除されません。`)) {
            registeredSubjects = registeredSubjects.filter(sub => sub !== subjectToDelete);
            // 削除された科目の色設定もクリア
            if (subjectColors[subjectToDelete]) {
                delete subjectColors[subjectToDelete];
            }
            saveData();
            renderSubjects();
            renderSubjectColorSettings();
            renderStats(); // 統計も更新
        }
    }

    function addSession() {
        let subject = subjectSelect.value;
        // 科目選択が空で、かつ入力フィールドに値がある場合、入力フィールドの値を採用
        if (subject === "" && subjectInput.value.trim() !== "") {
            subject = subjectInput.value.trim();
        } else if (subject === "") {
            alert("科目名を選択または入力してください。");
            return;
        }

        const detail = detailInput.value.trim();
        const duration = parseFloat(durationManualInput.value);
        let selectedDate = dateInput.value;
        let selectedTime = timeInput.value;

        if (isNaN(duration) || duration <= 0) {
            alert("勉強時間を正しく入力してください。");
            return;
        }

        // 日付または時刻が空の場合、現在の日時で補完
        const now = new Date();
        if (!selectedDate) {
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            selectedDate = `${year}-${month}-${day}`;
        }
        if (!selectedTime) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            selectedTime = `${hours}:${minutes}`;
        }

        const sessionDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
        if (isNaN(sessionDateTime.getTime())) {
            alert("日付または時刻の形式が正しくありません。\n例: 2023-01-01 12:30");
            return;
        }

        const confirmation = confirm(
            `以下の内容で記録しますか？\n\n` +
            `科目: ${subject}\n` +
            `時間: ${duration} 分\n` +
            `詳細: ${detail || 'なし'}\n` +
            `日時: ${sessionDateTime.toLocaleString('ja-JP')}`
        );

        if (!confirmation) {
            return;
        }

        // 新しい科目であれば登録
        if (!registeredSubjects.includes(subject)) {
            registeredSubjects.push(subject);
            registeredSubjects.sort();
        }

        const newSession = {
            id: Date.now().toString(),
            subject: subject,
            detail: detail,
            duration: duration,
            startTime: sessionDateTime.toISOString(),
            stones: duration * 10 // 1分あたり10個の石
        };

        studySessions.push(newSession);
        studySessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // 最新の記録が上に来るようにソート
        totalStones += newSession.stones;
        saveData();
        renderSubjects();
        renderSessions();
        renderStats();
        renderGachaState();

        // 入力フィールドをリセット
        subjectInput.value = "";
        subjectInput.style.display = "none";
        subjectSelect.value = "";
        detailInput.value = "";
        durationManualInput.value = "30";
        durationSlider.value = "30";
        setCurrentDateTime(); // 現在日時を再設定
    }

    function deleteSession(id) {
        if (confirm("この勉強記録を削除してもよろしいですか？")) {
            const sessionToDelete = studySessions.find(session => session.id === id);
            if (sessionToDelete) {
                totalStones -= sessionToDelete.stones;
            }
            studySessions = studySessions.filter((session) => session.id !== id);
            saveData();
            renderSessions();
            renderStats();
            renderGachaState();
        }
    }

    function loadData() {
        const savedSessions = localStorage.getItem("studySessions");
        if (savedSessions) {
            studySessions = JSON.parse(savedSessions).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        }
        const savedSubjects = localStorage.getItem("registeredSubjects");
        if (savedSubjects) {
            registeredSubjects = JSON.parse(savedSubjects).sort();
        }
        const savedColors = localStorage.getItem("subjectColors");
        if (savedColors) {
            subjectColors = JSON.parse(savedColors);
        }
        const savedTotalStones = localStorage.getItem("totalStones");
        if (savedTotalStones) {
            totalStones = parseInt(savedTotalStones);
        }
        const savedGachaPityCounter = localStorage.getItem("gachaPityCounter");
        if (savedGachaPityCounter) {
            gachaPityCounter = parseInt(savedGachaPityCounter);
        }
        const savedLastGachaRarity = localStorage.getItem("lastGachaRarity");
        if (savedLastGachaRarity) {
            lastGachaRarity = parseInt(savedLastGachaRarity);
        }
        const savedGachaCountSinceLastHighRarity = localStorage.getItem("gachaCountSinceLastHighRarity");
        if (savedGachaCountSinceLastHighRarity) {
            gachaCountSinceLastHighRarity = parseInt(savedGachaCountSinceLastHighRarity);
        }
        const savedOwnedCharacters = localStorage.getItem("ownedCharacters");
        if (savedOwnedCharacters) {
            ownedCharacters = JSON.parse(savedOwnedCharacters);
        }
    }

    function saveData() {
        localStorage.setItem("studySessions", JSON.stringify(studySessions));
        localStorage.setItem("registeredSubjects", JSON.stringify(registeredSubjects));
        localStorage.setItem("subjectColors", JSON.stringify(subjectColors));
        localStorage.setItem("totalStones", totalStones.toString());
        localStorage.setItem("gachaPityCounter", gachaPityCounter.toString());
        localStorage.setItem("lastGachaRarity", lastGachaRarity.toString());
        localStorage.setItem("gachaCountSinceLastHighRarity", gachaCountSinceLastHighRarity.toString());
        localStorage.setItem("ownedCharacters", JSON.stringify(ownedCharacters));
    }

    function renderSubjects() {
        subjectSelect.innerHTML = '<option value="">科目を選択または入力</option>';
        registeredSubjectsList.innerHTML = "";

        // 科目選択ドロップダウンの更新
        if (registeredSubjects.length > 0) {
            registeredSubjects.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
            subjectInput.style.display = "none"; // 登録科目がある場合は入力フィールドを隠す
        } else {
            subjectInput.style.display = "block"; // 登録科目がない場合は入力フィールドを表示
        }

        // 設定タブの科目リストの更新
        if (registeredSubjects.length === 0) {
            noSubjectsMessage.style.display = "block";
        } else {
            noSubjectsMessage.style.display = "none";
            registeredSubjects.forEach(subject => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${subject}</span>
                    <button class="delete-subject-btn" data-subject="${subject}">削除</button>
                `;
                registeredSubjectsList.appendChild(li);
            });
        }

        registeredSubjectsList.querySelectorAll(".delete-subject-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                deleteSubject(event.target.dataset.subject);
            });
        });
    }

    function renderSessions() {
        sessionList.innerHTML = "";
        if (studySessions.length === 0) {
            noRecordsMessage.style.display = "block";
        } else {
            noRecordsMessage.style.display = "none";
            studySessions.forEach((session) => {
                const li = document.createElement("li");
                const startTime = new Date(session.startTime);
                li.innerHTML = `
                    <div class="session-details">
                        <h4>${session.subject}</h4>
                        ${session.detail ? `<p>詳細: ${session.detail}</p>` : ''}
                        <p>時間: ${session.duration} 分</p>
                        <p>開始: ${startTime.toLocaleString('ja-JP')}</p>
                        <p>石: ${session.stones} 個</p>
                    </div>
                    <button class="delete-btn" data-id="${session.id}">削除</button>
                `;
                sessionList.appendChild(li);
            });

            sessionList.querySelectorAll(".delete-btn").forEach((button) => {
                button.addEventListener("click", (event) => {
                    deleteSession(event.target.dataset.id);
                });
            });
        }
    }

    function renderStats() {
        if (studySessions.length === 0) {
            totalDurationSpan.textContent = "0 時間";
            totalStonesSpan.textContent = "0 個";
            subjectStatsList.innerHTML = "";
            noStatsMessage.style.display = "block";
            if (subjectChartInstance) subjectChartInstance.destroy();
            if (dailyChartInstance) dailyChartInstance.destroy();
            return;
        }

        noStatsMessage.style.display = "none";

        const totalDurationMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
        totalDurationSpan.textContent = `${(totalDurationMinutes / 60).toFixed(1)} 時間`;
        totalStonesSpan.textContent = `${totalStones} 個`;

        // 科目別統計
        const subjectDurations = {};
        studySessions.forEach((session) => {
            subjectDurations[session.subject] = (subjectDurations[session.subject] || 0) + session.duration;
        });

        subjectStatsList.innerHTML = "";
        Object.entries(subjectDurations)
            .sort(([, a], [, b]) => b - a) // 降順でソート
            .forEach(([subject, duration]) => {
                const li = document.createElement("li");
                li.innerHTML = `<span>${subject}</span><span>${(duration / 60).toFixed(1)} 時間</span>`;
                subjectStatsList.appendChild(li);
            });
        
        renderSubjectChart(subjectDurations);

        // 日別統計
        const dailyDurations = {};
        studySessions.forEach(session => {
            const date = new Date(session.startTime).toLocaleDateString('ja-JP');
            dailyDurations[date] = (dailyDurations[date] || 0) + session.duration;
        });

        renderDailyChart(dailyDurations);
    }

    function renderSubjectChart(subjectDurations) {
        if (subjectChartInstance) {
            subjectChartInstance.destroy();
        }
        const ctx = document.getElementById('subjectChart').getContext('2d');
        const labels = Object.keys(subjectDurations);
        const data = Object.values(subjectDurations).map(d => (d / 60).toFixed(1)); // 時間に変換

        const backgroundColors = labels.map(subject => {
            // 既存の色があればそれを使用、なければランダムな色を生成して保存
            if (!subjectColors[subject]) {
                subjectColors[subject] = getRandomColor();
                saveData(); // 新しい色を保存
            }
            return subjectColors[subject];
        });

        subjectChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    },
                    title: {
                        display: true,
                        text: '科目別勉強時間 (時間)',
                        color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                    }
                }
            }
        });
    }

    function renderDailyChart(dailyDurations) {
        if (dailyChartInstance) {
            dailyChartInstance.destroy();
        }
        const ctx = document.getElementById('dailyChart').getContext('2d');
        // 日付をソートしてグラフの表示順を保証
        const sortedDates = Object.keys(dailyDurations).sort((a, b) => new Date(a) - new Date(b));
        const data = sortedDates.map(date => (dailyDurations[date] / 60).toFixed(1)); // 時間に変換

        dailyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: '日別勉強時間 (時間)',
                    data: data,
                    backgroundColor: '#007aff',
                    borderColor: '#007aff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                        labels: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    },
                    title: {
                        display: true,
                        text: '日別勉強時間 (時間)',
                        color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '時間',
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        },
                        ticks: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.body).color // テキスト色をCSSから取得
                        }
                    }
                }
            }
        });
    }

    function renderSubjectColorSettings() {
        colorSettingsDiv.innerHTML = ''; // コンテンツをクリア
        if (registeredSubjects.length === 0) {
            const p = document.createElement('p');
            p.className = 'message-text';
            p.textContent = '科目ごとのグラフ色をここで設定できます。科目を登録すると表示されます。';
            colorSettingsDiv.appendChild(p);
            return;
        }

        registeredSubjects.forEach(subject => {
            const div = document.createElement('div');
            // 色がまだ設定されていなければランダムな色を割り当てる
            if (!subjectColors[subject]) {
                subjectColors[subject] = getRandomColor();
                saveData(); // 新しい色を保存
            }
            div.innerHTML = `
                <label for="color-${subject}">${subject}</label>
                <input type="color" id="color-${subject}" value="${subjectColors[subject]}">
            `;
            const colorInput = div.querySelector(`#color-${subject}`);
            colorInput.addEventListener('change', (event) => {
                subjectColors[subject] = event.target.value;
                saveData();
                renderStats(); // 色変更後に統計グラフを再描画
            });
            colorSettingsDiv.appendChild(div);
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function renderGachaState() {
        currentStonesSpan.textContent = `${totalStones} 個`;
        pityCountSpan.textContent = `${gachaPityCounter} 連`;
        gachaSingleBtn.disabled = totalStones < 160;
        gachaMultiBtn.disabled = totalStones < 1600;
    }

    function performGacha(count) {
        const cost = 160 * count;
        if (totalStones < cost) {
            alert("石が足りません。");
            return;
        }

        if (!confirm(`${count}連ガチャを引きますか？ (石${cost}個消費)`)) {
            return;
        }

        totalStones -= cost;
        gachaResultList.innerHTML = '';
        let results = [];

        for (let i = 0; i < count; i++) {
            gachaPityCounter++;
            gachaCountSinceLastHighRarity++;

            let drawRarity = 3;
            let rarity5Rate = 0.006; // 0.6%
            let rarity4Rate = 0.06;  // 6%

            // 星5天井ロジック
            if (gachaPityCounter >= 75) {
                rarity5Rate += (gachaPityCounter - 74) * 0.06; // 75連目から1連ごとに6%上昇
            }
            // 星4/5天井ロジック (10連で星4以上確定)
            if (gachaCountSinceLastHighRarity === 10) {
                // 10連目は星4以上確定
                const tenPullRoll = Math.random();
                if (tenPullRoll < 0.006) { // 0.6%で星5
                    drawRarity = 5;
                } else { // 残り99.4%で星4
                    drawRarity = 4;
                }
            } else {
                const roll = Math.random();
                if (roll < rarity5Rate) {
                    drawRarity = 5;
                } else if (roll < rarity5Rate + rarity4Rate) {
                    drawRarity = 4;
                }
            }

            let item;
            let rarityClass;
            if (drawRarity === 5) {
                item = gachaItems.rarity5[Math.floor(Math.random() * gachaItems.rarity5.length)];
                rarityClass = 'rarity-5';
                gachaPityCounter = 0; // 天井リセット
                lastGachaRarity = 5;
                gachaCountSinceLastHighRarity = 0;
            } else if (drawRarity === 4) {
                item = gachaItems.rarity4[Math.floor(Math.random() * gachaItems.rarity4.length)];
                rarityClass = 'rarity-4';
                lastGachaRarity = 4;
                gachaCountSinceLastHighRarity = 0;
            } else {
                item = gachaItems.rarity3[Math.floor(Math.random() * gachaItems.rarity3.length)];
                rarityClass = 'rarity-3';
            }
            results.push({ item, rarity: drawRarity, rarityClass });
            addOwnedCharacter(item, drawRarity);
        }

        results.forEach(result => {
            const li = document.createElement('li');
            li.className = result.rarityClass;
            li.textContent = `★${result.rarity} ${result.item}`;
            gachaResultList.appendChild(li);
        });

        saveData();
        renderGachaState();
        renderOwnedCharacters();
    }

    function addOwnedCharacter(name, rarity) {
        if (ownedCharacters[name]) {
            ownedCharacters[name].count++;
        } else {
            ownedCharacters[name] = { rarity: rarity, count: 1 };
        }
    }

    function renderOwnedCharacters() {
        ownedCharactersList.innerHTML = '';
        const sortedCharacters = Object.entries(ownedCharacters).sort(([, a], [, b]) => b.rarity - a.rarity);

        if (sortedCharacters.length === 0) {
            noCharactersMessage.style.display = 'block';
        } else {
            noCharactersMessage.style.display = 'none';
            sortedCharacters.forEach(([name, data]) => {
                const li = document.createElement('li');
                li.className = `rarity-${data.rarity}`;
                li.innerHTML = `
                    <span>★${data.rarity}</span>
                    <span>${name}</span>
                    ${data.count > 1 ? `<span>x${data.count}</span>` : ''}
                `;
                ownedCharactersList.appendChild(li);
            });
        }
    }

    // 初期タブの表示
    switchTab("record");
});

