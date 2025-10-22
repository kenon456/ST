document.addEventListener("DOMContentLoaded", () => {
    // UI要素の取得
    const subjectSelect = document.getElementById("subject-select");
    const newSubjectInput = document.getElementById("new-subject-input"); // 設定タブの新しい科目入力フィールド
    const addSubjectBtnSettings = document.getElementById("add-subject-btn"); // 設定タブの科目追加ボタン
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
    const settingsTabBtn = document.getElementById("settings-tab");
    const recordSection = document.getElementById("record-section");
    const statsSection = document.getElementById("stats-section");
    const settingsSection = document.getElementById("settings-section");
    const gachaTabBtn = document.getElementById("gacha-tab");
    const charactersTabBtn = document.getElementById("characters-tab");
    const gachaSection = document.getElementById("gacha-section");
    const charactersSection = document.getElementById("characters-section");
    const currentStonesSpan = document.getElementById("current-stones");
    const gacha1PullBtn = document.getElementById("gacha-1-pull");
    const gacha10PullBtn = document.getElementById("gacha-10-pull");
    const gachaResultsDiv = document.getElementById("gacha-results");
    const characterListDiv = document.getElementById("character-list");
    const noCharactersMessage = document.getElementById("no-characters-message");
    const noRecordsMessage = document.getElementById("no-records-message");
    const noStatsMessage = document.getElementById("no-stats-message");
    const registeredSubjectsList = document.getElementById("registered-subjects-list");
    const noSubjectsMessage = document.getElementById("no-subjects-message");
    const colorSettingsDiv = document.getElementById("color-settings");

    let studySessions = [];
    let registeredSubjects = [];
    let subjectColors = {};
    let subjectChartInstance = null;
    let dailyChartInstance = null;
    let gachaHistory = [];
    let acquiredCharacters = [];
    let consecutivePullsWithoutSSR = 0; // 天井システム用: SSRが出なかった連続回数
    let gachaPullCount = 0; // 天井システム用: ガチャ総回数

    // ガチャアイテム定義
    const gachaItems = {
        'star5': Array.from({ length: 60 }, (_, i) => ({ name: `星5キャラ${i + 1}`, rarity: 5, type: 'character' })),
        'star4': Array.from({ length: 48 }, (_, i) => ({ name: `星4キャラ${i + 1}`, rarity: 4, type: 'character' })),
        'star3': Array.from({ length: 6 }, (_, i) => ({ name: `星3素材${i + 1}`, rarity: 3, type: 'material' }))
    };

    // 初期化
    loadData();
    renderSubjects();
    renderSessions();
    renderSubjectColorSettings();
    setCurrentDateTime(); // 初期表示時に現在日時を設定

    // 設定タブの科目追加ボタンにイベントリスナーを追加
    addSubjectBtnSettings.addEventListener("click", addSubject);

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

    
    // 科目選択が変更されたとき


    recordTabBtn.addEventListener("click", () => {
        switchTab("record");
    });

    statsTabBtn.addEventListener("click", () => {
        switchTab("stats");
    });

    settingsTabBtn.addEventListener("click", () => {
        switchTab("settings");
    });

    gachaTabBtn.addEventListener("click", () => {
        switchTab("gacha");
    });

    charactersTabBtn.addEventListener("click", () => {
        switchTab("characters");
    });

    // 関数定義
    function switchTab(tab) {
        // すべてのタブボタンとセクションを非アクティブ化
            document.querySelectorAll(".tab-selector button").forEach(btn => btn.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));

        // 選択されたタブをアクティブ化
        if (tab === "record") {
            document.getElementById(`${tab}-tab`).classList.add("active");
            document.getElementById(`${tab}-section`).classList.add("active");

            if (tab === "record") {
                setCurrentDateTime(); // 記録タブに戻った時に現在日時を設定
                renderSubjects(); // 記録タブでも科目選択を更新
            } else if (tab === "stats") {
                renderStats(); // 統計タブ表示時に再描画
            } else if (tab === "settings") {
                renderSubjects(); // 設定タブ表示時に科目リストを再描画
                renderSubjectColorSettings(); // 設定タブ表示時に色設定を再描画
            } else if (tab === "gacha") {
                updateGachaStoneCount();
            } else if (tab === "characters") {
                renderCharacters();
            }
        }
    }

    function setCurrentDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');

        dateInput.value = `${year}-${month}-${day}`;
        timeInput.value = `${hours}:${minutes}`;
    }

    function addSubject() {
        const newSubject = newSubjectInput.value.trim();
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
        newSubjectInput.value = "";

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
        const now = new Date(); // add this line to define 'now'
        let subject = subjectSelect.value;
        // 科目選択が空で、かつ入力フィールドに値がある場合、入力フィールドの値を採用
        if (subject === "" && newSubjectInput.value.trim() !== "") {
            subject = newSubjectInput.value.trim();
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

        // 日付または時刻が空の場合、記録追加ボタン押下時刻を自動設定
        if (!selectedDate) {
            selectedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        }
        if (!selectedTime) {
            selectedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
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
        gachaHistory.push({ type: 'stone_gain', amount: newSession.stones, sourceId: newSession.id, timestamp: new Date().toISOString() });
        studySessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // 最新の記録が上に来るようにソート
        saveData();
        renderSubjects();
        renderSessions();
        renderStats();
        updateGachaStoneCount();

        // 入力フィールドをリセット
        subjectSelect.value = "";
        newSubjectInput.value = "";
        detailInput.value = "";
        durationManualInput.value = "30";
        durationSlider.value = "30";
        // setCurrentDateTime(); // 現在日時を再設定 (記録追加後に自動リセットしない)
    }

    function deleteSession(id) {
        const sessionIdToDelete = id;

        if (confirm("この勉強記録を削除してもよろしいですか？")) {
            const deletedSession = studySessions.find(session => session.id === sessionIdToDelete);
            studySessions = studySessions.filter(session => session.id !== sessionIdToDelete);

            if (deletedSession) {
                // gachaHistoryから対応する石の獲得記録を削除
                gachaHistory = gachaHistory.filter(entry => !(entry.type === 'stone_gain' && entry.sourceId === sessionIdToDelete));
            }

            saveData();
            renderSessions();
            renderStats();
            updateGachaStoneCount();
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
        const savedGachaHistory = localStorage.getItem("gachaHistory");
        if (savedGachaHistory) {
            gachaHistory = JSON.parse(savedGachaHistory);
        }
        const savedAcquiredCharacters = localStorage.getItem("acquiredCharacters");
        if (savedAcquiredCharacters) {
            acquiredCharacters = JSON.parse(savedAcquiredCharacters);
        }
        const savedGachaPullCount = localStorage.getItem("gachaPullCount");
        if (savedGachaPullCount) {
            gachaPullCount = parseInt(savedGachaPullCount);
        }
        const savedConsecutivePullsWithoutSSR = localStorage.getItem("consecutivePullsWithoutSSR");
        if (savedConsecutivePullsWithoutSSR) {
            consecutivePullsWithoutSSR = parseInt(savedConsecutivePullsWithoutSSR);
        }
    }

    function saveData() {
        localStorage.setItem("studySessions", JSON.stringify(studySessions));
        localStorage.setItem("registeredSubjects", JSON.stringify(registeredSubjects));
        localStorage.setItem("subjectColors", JSON.stringify(subjectColors));
        localStorage.setItem("gachaHistory", JSON.stringify(gachaHistory));
        localStorage.setItem("acquiredCharacters", JSON.stringify(acquiredCharacters));
        localStorage.setItem("gachaPullCount", gachaPullCount.toString());
        localStorage.setItem("consecutivePullsWithoutSSR", consecutivePullsWithoutSSR.toString());
    }

    function renderSubjects() {
        subjectSelect.innerHTML = '<option value="">科目を選択または入力</option>';
        registeredSubjectsList.innerHTML = "";

        // 科目選択ドロップダウンの更新
        registeredSubjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });

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

            document.querySelectorAll(".delete-subject-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    deleteSubject(event.target.dataset.subject);
                });
            });
        }
    }

    function renderSessions() {
        sessionList.innerHTML = "";
        if (studySessions.length === 0) {
            noRecordsMessage.style.display = "block";
        } else {
            noRecordsMessage.style.display = "none";
            studySessions.forEach(session => {
                const li = document.createElement("li");
                const sessionDateTime = new Date(session.startTime);
                const formattedDate = sessionDateTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
                const formattedTime = sessionDateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
                li.innerHTML = `
                    <div>
                        <span class="session-subject">${session.subject}</span>
                        <span class="session-duration">${session.duration}分</span>
                        <span class="session-date">${formattedDate} ${formattedTime}</span>
                        <p class="session-detail">${session.detail || 'メモなし'}</p>
                    </div>
                    <button class="delete-session-btn" data-id="${session.id}">削除</button>
                `;
                sessionList.appendChild(li);
            });

            document.querySelectorAll(".delete-session-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    deleteSession(event.target.dataset.id);
                });
            });
        }
    }

    function renderStats() {
        let totalDuration = 0;
        let totalStones = 0;
        const subjectDurations = {};
        const dailyDurations = {};

        studySessions.forEach(session => {
            totalDuration += session.duration;
            totalStones += session.stones;
            subjectDurations[session.subject] = (subjectDurations[session.subject] || 0) + session.duration;

            const date = new Date(session.startTime).toLocaleDateString('ja-JP');
            dailyDurations[date] = (dailyDurations[date] || 0) + session.duration;
        });

        totalDurationSpan.textContent = `${Math.floor(totalDuration / 60)} 時間 ${totalDuration % 60} 分`;
        totalStonesSpan.textContent = `${totalStones}`;

        // 科目別統計
        subjectStatsList.innerHTML = "";
        const sortedSubjects = Object.keys(subjectDurations).sort((a, b) => subjectDurations[b] - subjectDurations[a]);
        sortedSubjects.forEach(subject => {
            const li = document.createElement("li");
            li.textContent = `${subject}: ${subjectDurations[subject]} 分`;
            subjectStatsList.appendChild(li);
        });

        // グラフの更新
        updateCharts(subjectDurations, dailyDurations);

        if (studySessions.length === 0) {
            noStatsMessage.style.display = "block";
        } else {
            noStatsMessage.style.display = "none";
        }
    }

    function updateCharts(subjectDurations, dailyDurations) {
        const subjectCtx = document.getElementById('subjectChart').getContext('2d');
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');

        // 科目別円グラフ
        if (subjectChartInstance) {
            subjectChartInstance.destroy();
        }
        const subjectLabels = Object.keys(subjectDurations);
        const subjectData = Object.values(subjectDurations);
        const subjectBackgroundColors = subjectLabels.map(subject => subjectColors[subject] || '#CCCCCC'); // デフォルト色

        subjectChartInstance = new Chart(subjectCtx, {
            type: 'pie',
            data: {
                labels: subjectLabels,
                datasets: [{
                    data: subjectData,
                    backgroundColor: subjectBackgroundColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '科目別勉強時間',
                        color: '#FFFFFF' // タイトル色を白に設定
                    }
                }
            },
        });

        // 日別棒グラフ
        if (dailyChartInstance) {
            dailyChartInstance.destroy();
        }
        const sortedDates = Object.keys(dailyDurations).sort((a, b) => new Date(a) - new Date(b));
        const dailyLabels = sortedDates;
        const dailyData = sortedDates.map(date => dailyDurations[date]);

        dailyChartInstance = new Chart(dailyCtx, {
            type: 'bar',
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: '日別勉強時間 (分)',
                    data: dailyData,
                    backgroundColor: '#42A5F5',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '日別勉強時間',
                        color: '#FFFFFF' // タイトル色を白に設定
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)' // グリッド線色を白に近い色に設定
                        },
                        ticks: {
                            color: '#FFFFFF' // 軸ラベル色を白に設定
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)' // グリッド線色を白に近い色に設定
                        },
                        ticks: {
                            color: '#FFFFFF' // 軸ラベル色を白に設定
                        }
                    }
                }
            }
        });
    }

    function renderSubjectColorSettings() {
        colorSettingsDiv.innerHTML = ''; // コンテンツをクリア

        if (registeredSubjects.length === 0) {
            colorSettingsDiv.innerHTML = '<p class="message-text">科目を登録すると、ここでグラフの色を設定できます。</p>';
            return;
        }

        registeredSubjects.forEach(subject => {
            // subjectColorsに色が設定されていない場合、ランダムな色を設定
            if (!subjectColors[subject]) {
                subjectColors[subject] = '#' + Math.floor(Math.random()*16777215).toString(16);
            }

            const div = document.createElement("div");
            div.classList.add("color-setting-item");
            div.innerHTML = `
                <label for="color-${subject}">${subject}:</label>
                <input type="color" id="color-${subject}" value="${subjectColors[subject]}">
            `;
            colorSettingsDiv.appendChild(div);

            const colorInput = div.querySelector(`#color-${subject}`);
            colorInput.addEventListener('change', (event) => {
                subjectColors[subject] = event.target.value;
                saveData();
                renderStats(); // 色変更をグラフに反映
            });
        });
    }

    // ガチャ関連関数
    gacha1PullBtn.addEventListener("click", () => pullGacha(1));
    gacha10PullBtn.addEventListener("click", () => pullGacha(10));

    function pullGacha(pullCount) {
        const stoneCost = pullCount === 1 ? 160 : 1600;
        const currentStones = calculateCurrentStones();

        if (currentStones < stoneCost) {
            alert(`石が足りません。現在${currentStones}個、${pullCount}回引くには${stoneCost}個必要です。`);
            return;
        }

        if (!confirm(`${pullCount}回ガチャを引きますか？ (石${stoneCost}個消費)`)) {
            return;
        }

        // 石を消費
        gachaHistory.push({ type: 'stone_spend', amount: stoneCost, timestamp: new Date().toISOString() });
        updateGachaStoneCount();

        const results = [];
        let isSSRGuaranteed = false;

        for (let i = 0; i < pullCount; i++) {
            gachaPullCount++;

            // 10連でSSRが出なかった場合、10連目はSSR確定
            if (pullCount === 10 && i === 9 && consecutivePullsWithoutSSR >= 9) {
                isSSRGuaranteed = true;
            }

            const item = drawGachaItem(isSSRGuaranteed);
            results.push(item);

            if (item.rarity === 5) {
                consecutivePullsWithoutSSR = 0; // SSRが出たらリセット
            } else {
                consecutivePullsWithoutSSR++;
            }
            
            // 獲得したキャラクターを保存
            if (item.type === 'character') {
                acquiredCharacters.push(item);
            }
            gachaHistory.push({ type: 'gacha_pull', item: item, timestamp: new Date().toISOString() });
        }

        saveData();
        displayGachaResults(results);
        renderCharacters(); // キャラリストを更新
        updateGachaStoneCount(); // 石の数を更新
    }

    function drawGachaItem(isSSRGuaranteed = false) {
        let star5Rate = 0.006;
        let star4Rate = 0.06;
        let star3Rate = 1 - star5Rate - star4Rate;

        // 10連でSSR確定の場合の確率調整
        if (isSSRGuaranteed) {
            star5Rate = 1; // SSR確定
            star4Rate = 0; 
            star3Rate = 0;
        }

        const rand = Math.random();
        if (rand < star5Rate) {
            return gachaItems.star5[Math.floor(Math.random() * gachaItems.star5.length)];
        } else if (rand < star5Rate + star4Rate) {
            return gachaItems.star4[Math.floor(Math.random() * gachaItems.star4.length)];
        } else {
            return gachaItems.star3[Math.floor(Math.random() * gachaItems.star3.length)];
        }
    }

    function displayGachaResults(results) {
        gachaResultsDiv.innerHTML = ""; // Clear previous results
        results.forEach((item, index) => {
            const p = document.createElement("p");
            p.textContent = `${index + 1}連目: ${"☆".repeat(item.rarity)}${item.name}`;
            gachaResultsDiv.appendChild(p);
        });
    }

    function calculateCurrentStones() {
        let totalEarned = 0;
        let totalSpent = 0;

        gachaHistory.forEach(entry => {
            if (entry.type === 'stone_gain') {
                totalEarned += entry.amount;
            } else if (entry.type === 'stone_spend') {
                totalSpent += entry.amount;
            }
        });
        return totalEarned - totalSpent;
    }

    function updateGachaStoneCount() {
        currentStonesSpan.textContent = calculateCurrentStones();
        saveData(); // 石の数を更新したら保存
    }

    function renderCharacters() {
        characterListDiv.innerHTML = "";
        if (acquiredCharacters.length === 0) {
            noCharactersMessage.style.display = "block";
        } else {
            noCharactersMessage.style.display = "none";
            // レア度順、名前順でソート
            const sortedCharacters = [...acquiredCharacters].sort((a, b) => {
                if (a.rarity !== b.rarity) {
                    return b.rarity - a.rarity; // レア度降順
                }
                return a.name.localeCompare(b.name); // 名前昇順
            });

            sortedCharacters.forEach(char => {
                const charDiv = document.createElement("div");
                charDiv.classList.add("character-item");
                charDiv.innerHTML = `
                    <span class="character-rarity">${"☆".repeat(char.rarity)}</span>
                    <span class="character-name">${char.name}</span>
                `;
                characterListDiv.appendChild(charDiv);
            });
        }
    }
});

