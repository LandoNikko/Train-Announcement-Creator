export const translations = {
  en: {
    // Toolbar
    appTitle: 'Train Line',
    selectTool: 'Select',
    addStationTool: 'Add Station',
    createTrainLineTool: 'Create Train Line',
    drawPathTool: 'Draw Path',
    resetToDefault: 'Reset to Default',
    switchToLightMode: 'Switch to Light Mode',
    switchToDarkMode: 'Switch to Dark Mode',
    apiKeySet: 'API Key Set',
    setApiKey: 'Set API Key',
    zoom: 'Zoom',
    lineStyle: 'Line Style',
    lineStyleDirect: 'Direct Path',
    lineStyleMinimal: 'Path with Corners',
    lineStyleSmooth: 'Smooth Path',
    gridStyle: 'Grid Style',
    gridStyleNone: 'None',
    gridStyleDots: 'Dots',
    gridStyleHorizontal: 'Horizontal Lines',
    gridStyleVertical: 'Vertical Lines',
    gridStyleGrid: 'Grid Lines',
    gridStyleDiagonal: 'Diagonal Lines',
    canvasStyle: 'Canvas Style',
    undo: 'Undo',
    redo: 'Redo',
    showStationNumbers: 'Show Numbers',
    hideStationNumbers: 'Hide Numbers',
    
    // Map Editor
    clickGridToAddStation: 'Click on grid to add station',
    clickToAddStations: 'Click grid points to add stations. Right-click to finish.',
    clickToDrawPath: 'Click grid points to draw path. Right-click to finish.',
    tapToAddStations: 'Tap grid points to add stations. Tap "Finish" when done.',
    tapToDrawPath: 'Tap grid points to draw path. Tap "Finish" when done.',
    finishLine: 'Finish Line',
    populateStations: 'Populate Stations',
    centerView: 'Center View',
    clickPresetToLoad: 'Click any preset to load it onto the map',
    showPresets: 'Presets',
    showAnnouncements: 'Announcements',
    hideMenu: 'Hide',
    
    // Unified Editor
    editStation: 'Edit Station',
    editLine: 'Edit Line',
    editor: 'Editor',
    name: 'Name',
    color: 'Color',
    delete: 'Delete',
    
    // Preset Sidebar
    trainLinePresets: 'Train Line Presets',
    loadPresetHint: 'Load a preset to get started',
    stations: 'stations',
    active: 'Active',
    
    // Preset Names and Descriptions
    'Simple Demo': 'Simple Demo',
    'Yamanote Line': 'Yamanote Line',
    'Chuo Line': 'Chuo Line',
    'Ginza Line': 'Ginza Line',
    'Taiyokei Line': 'Taiyōkei Line',
    'Solar Express': 'Solar Express',
    
    // Preset Categories
    'Japan': 'Japan',
    'Solar System': 'Solar System',
    'Misc': 'Misc',
    
    // Preset Descriptions
    'A simple 4-station demo route': 'Misc',
    'Solar System train line from Mercury to Pluto in Japanese': 'Solar System',
    'Solar System train line from Mercury to Pluto in English': 'Solar System',
    
    // Preset Full Descriptions
    'Four stations in a simple loop. Good for testing the announcement system.': 'Four stations in a simple loop. Good for testing the announcement system.',
    'Tokyo\'s circular line with 21 stations. Connects major areas around central Tokyo.': 'Tokyo\'s circular line with 21 stations. Connects major areas around central Tokyo.',
    'East-west line through central Tokyo. Orange trains connect Tokyo Station to western suburbs.': 'East-west line through central Tokyo. Orange trains connect Tokyo Station to western suburbs.',
    'Tokyo\'s oldest subway line from 1927. Runs from Shibuya to Asakusa through Ginza and Ueno.': 'Tokyo\'s oldest subway line from 1927. Runs from Shibuya to Asakusa through Ginza and Ueno.',
    'Solar system route with Japanese announcements. Stations from Mercury to Pluto.': 'Solar system route with Japanese announcements. Stations from Mercury to Pluto.',
    'Solar system route with English announcements. Stations from Mercury to Pluto.': 'Solar system route with English announcements. Stations from Mercury to Pluto.',
    
    // Announcement Panel
    announcements: 'Announcements',
    generateAnnouncement: 'Generate Announcement',
    setApiKeyToGenerate: 'Set API key to generate announcements',
    addStationsFirst: 'Add stations to the map first',
    noAnnouncementsYet: 'No announcements yet',
    createFirstAnnouncement: 'Create stations and generate your first announcement',
    audioQueue: 'Queue',
    audioControlPanel: 'Audio Control Panel',
    displayAudioCaptions: 'Display audio captions',
    selectLine: 'Select a line to manage announcements',
    noLinesYet: 'No train lines created yet',
    createLineFirst: 'Create a train line to add announcements',
    stationAnnouncement: 'Station',
    betweenStations: 'Between Stations',
    uploadAudio: 'Upload',
    generateAudio: 'Generate',
    selectPreset: 'Preset',
    noAudioAssigned: 'No audio assigned',
    playAudio: 'Play',
    removeAudio: 'Remove',
    audioTypePreset: 'Preset',
    audioTypeUpload: 'Uploaded',
    audioTypeGenerated: 'AI Voice',
    presetArrival: 'We are now arriving at {station}. Please prepare to exit.',
    presetDeparture: 'This train is departing from {station}. Next stop: [Next Station Name].',
    presetTransfer: 'Transfer here for other lines. This is {station}.',
    presetInformation: 'Welcome to {station}. Please mind the gap between the train and the platform.',
    presetLive: 'Attention passengers. Live announcement for {station}.',
    presetWarning: 'Attention. Important safety announcement for {station}.',
    presetCentralStation: 'Now arriving at {station}, the central station. Transfer available for all lines.',
    playAll: 'Play All',
    stopPlayback: 'Stop',
    previousStation: 'Previous Station',
    nextStation: 'Next Station',
    playPause: 'Play/Pause',
    transcription: 'Captions',
    playAllSequence: 'Play All',
    cycleSpeed: 'Cycle Speed',
    toggleVolume: 'Toggle Volume',
    mute: 'Mute',
    unmute: 'Unmute',
    stationOf: 'Station {current} of {total}',
    
    // API Key Input
    elevenLabsApiKey: 'ElevenLabs API Key',
    apiKeyDescription: 'Enter your ElevenLabs API key. It will be stored in your browser session only and cleared when you close the browser.',
    apiKeyPlaceholder: 'sk_...',
    saveKey: 'Save Key',
    cancel: 'Cancel',
    close: 'Close',
    getApiKeyFrom: 'Get your API key from',
    
    // Station defaults
    station: 'Station',
    
    // Name Presets
    stationNamePresets: [
      // Cities
      'Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Kobe', 'Fukuoka', 'Sapporo', 'Yokohama', 'Sendai', 'Hiroshima', 'Kanazawa', 'Nagano', 'Shinjuku', 'Shibuya', 'Ikebukuro', 'Shinagawa', 'Ueno', 'Akihabara', 'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'New York', 'Los Angeles', 'Chicago', 'Boston', 'Seattle', 'San Francisco', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong', 'Taipei', 'Bangkok', 'Singapore', 'Sydney', 'Melbourne', 'Toronto', 'Vancouver', 'Mexico City', 'São Paulo', 'Buenos Aires', 'Moscow', 'Istanbul', 'Dubai', 'Mumbai', 'Delhi',
      // Directions
      'Central', 'North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest',
      // Locations
      'Station Front', 'City Hall', 'University', 'Hospital', 'Airport', 'Harbor', 'Park', 'Stadium', 'Convention Center', 'Museum',
      // Descriptive
      'Platform A', 'Platform B', 'Platform C', 'Junction', 'Terminal', 'Express Stop', 'Local Stop', 'Transfer', 'Interchange', 'Depot', 'Yard'
    ],
    lineNamePresets: [
      // Line Types
      'Express Line', 'Local Line', 'Rapid Line', 'Limited Express', 'Main Line', 'Branch Line', 'Loop Line', 'Circle Line', 'Metro Line', 'Subway Line', 'Commuter Line', 'Regional Line',
      // Colors
      'Red Line', 'Blue Line', 'Green Line', 'Yellow Line', 'Orange Line', 'Purple Line', 'Pink Line', 'Brown Line', 'Silver Line', 'Gold Line',
      // Geographic
      'North Line', 'South Line', 'East Line', 'West Line', 'Downtown Line', 'Uptown Line', 'Crosstown Line', 'Harbor Line', 'Mountain Line', 'Coastal Line', 'River Line', 'Valley Line'
    ],
    
    // Loop Modal
    createLoopLine: 'Create Loop Line',
    selectLoopStation: 'Select which station to use',
    firstStation: 'First station',
    lastStation: 'Last station',
    
    // Announcement Types
    stationTypes: 'Station Types',
    centralStation: 'Central Station',
    arrival: 'Arrival',
    departure: 'Departure',
    transfer: 'Transfer',
    information: 'Information',
    live: 'Live',
    warning: 'Warning',
    general: 'General',
    misc: 'Misc',
    chime: 'Chime',
    music: 'Music',
    ambience: 'Ambience'
  },
  ja: {
    // Toolbar
    appTitle: '路線図',
    selectTool: '選択',
    addStationTool: '駅を追加',
    createTrainLineTool: '路線を作成',
    drawPathTool: 'パスを描く',
    resetToDefault: 'デフォルトにリセット',
    switchToLightMode: 'ライトモードに切り替え',
    switchToDarkMode: 'ダークモードに切り替え',
    apiKeySet: 'APIキー設定済み',
    setApiKey: 'APIキーを設定',
    zoom: 'ズーム',
    lineStyle: '路線スタイル',
    lineStyleDirect: '直線パス',
    lineStyleMinimal: 'コーナー付きパス',
    lineStyleSmooth: 'スムーズパス',
    gridStyle: 'グリッドスタイル',
    gridStyleNone: 'なし',
    gridStyleDots: 'ドット',
    gridStyleHorizontal: '横線',
    gridStyleVertical: '縦線',
    gridStyleGrid: 'グリッド線',
    gridStyleDiagonal: '対角線',
    canvasStyle: 'キャンバススタイル',
    undo: '元に戻す',
    redo: 'やり直す',
    showStationNumbers: '番号を表示',
    hideStationNumbers: '番号を非表示',
    
    // Map Editor
    clickGridToAddStation: 'グリッドをクリックして駅を追加',
    clickToAddStations: 'グリッドポイントをクリックして駅を追加。右クリックで完了。',
    clickToDrawPath: 'グリッドポイントをクリックしてパスを描く。右クリックで完了。',
    tapToAddStations: 'グリッドポイントをタップして駅を追加。完了したら「完了」をタップ。',
    tapToDrawPath: 'グリッドポイントをタップしてパスを描く。完了したら「完了」をタップ。',
    finishLine: '路線を完了',
    populateStations: '駅を配置',
    centerView: 'ビューを中央に',
    clickPresetToLoad: 'プリセットをクリックしてマップに読み込む',
    showPresets: 'プリセット',
    showAnnouncements: 'アナウンス',
    hideMenu: '非表示',
    
    // Unified Editor
    editStation: '駅を編集',
    editLine: '路線を編集',
    editor: 'エディター',
    name: '名前',
    color: '色',
    delete: '削除',
    
    // Preset Sidebar
    trainLinePresets: '路線プリセット',
    loadPresetHint: 'プリセットを読み込んで開始',
    stations: '駅',
    active: 'アクティブ',
    
    // Preset Names and Descriptions
    'Simple Demo': 'シンプルデモ',
    'Yamanote Line': '山手線',
    'Chuo Line': '中央線',
    'Ginza Line': '銀座線',
    'Taiyokei Line': '太陽系線',
    'Solar Express': 'ソーラーエクスプレス',
    
    // Preset Categories
    'Japan': '日本',
    'Solar System': '太陽系',
    'Misc': 'その他',
    
    // Preset Descriptions
    'A simple 4-station demo route': 'その他',
    'Solar System train line from Mercury to Pluto in Japanese': '太陽系',
    'Solar System train line from Mercury to Pluto in English': '太陽系',
    
    // Preset Full Descriptions
    'Four stations in a simple loop. Good for testing the announcement system.': 'シンプルなループ状の4駅。アナウンスシステムのテスト用。',
    'Tokyo\'s circular line with 21 stations. Connects major areas around central Tokyo.': '東京の環状線。21駅で中心部の主要エリアを結ぶ。',
    'East-west line through central Tokyo. Orange trains connect Tokyo Station to western suburbs.': '東京中心部を東西に走る路線。オレンジ色の車両で東京駅から西部郊外へ。',
    'Tokyo\'s oldest subway line from 1927. Runs from Shibuya to Asakusa through Ginza and Ueno.': '1927年開業の東京最古の地下鉄。渋谷から浅草まで銀座・上野経由。',
    'Solar system route with Japanese announcements. Stations from Mercury to Pluto.': '太陽系ルート（日本語アナウンス）。水星から冥王星まで。',
    'Solar system route with English announcements. Stations from Mercury to Pluto.': '太陽系ルート（英語アナウンス）。水星から冥王星まで。',
    
    // Announcement Panel
    announcements: 'アナウンス',
    generateAnnouncement: 'アナウンスを生成',
    setApiKeyToGenerate: 'APIキーを設定してアナウンスを生成',
    addStationsFirst: '最初に駅をマップに追加',
    noAnnouncementsYet: 'まだアナウンスがありません',
    createFirstAnnouncement: '駅を作成して最初のアナウンスを生成',
    audioQueue: 'キュー',
    audioControlPanel: 'オーディオコントロールパネル',
    displayAudioCaptions: '音声字幕を表示',
    selectLine: '路線を選択してアナウンスを管理',
    noLinesYet: 'まだ路線が作成されていません',
    createLineFirst: '路線を作成してアナウンスを追加',
    stationAnnouncement: '駅',
    betweenStations: '駅間',
    uploadAudio: 'アップロード',
    generateAudio: '生成',
    selectPreset: 'プリセット',
    noAudioAssigned: 'オーディオ未割り当て',
    playAudio: '再生',
    removeAudio: '削除',
    audioTypePreset: 'プリセット',
    audioTypeUpload: 'アップロード済み',
    audioTypeGenerated: 'AI音声',
    presetArrival: 'まもなく、{station}、{station}です。出口は右側です。',
    presetDeparture: '{station}を発車いたします。次は、[次の駅名]です。',
    presetTransfer: 'お乗り換えの方は、{station}です。',
    presetInformation: '{station}にご到着です。足元にご注意ください。',
    presetLive: 'お客様にお知らせいたします。{station}からのご案内です。',
    presetWarning: 'ご注意ください。{station}からの重要なお知らせです。',
    presetCentralStation: 'まもなく、{station}、{station}です。各線にお乗り換えいただけます。',
    playAll: 'すべて再生',
    stopPlayback: '停止',
    previousStation: '前の駅',
    nextStation: '次の駅',
    playPause: '再生/一時停止',
    transcription: '車内放送原稿',
    playAllSequence: 'すべて再生',
    cycleSpeed: '速度切替',
    toggleVolume: '音量切替',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    stationOf: '駅 {current} / {total}',
    
    // API Key Input
    elevenLabsApiKey: 'ElevenLabs APIキー',
    apiKeyDescription: 'ElevenLabs APIキーを入力してください。ブラウザセッションにのみ保存され、ブラウザを閉じるとクリアされます。',
    apiKeyPlaceholder: 'sk_...',
    saveKey: 'キーを保存',
    cancel: 'キャンセル',
    close: '閉じる',
    getApiKeyFrom: 'APIキーを取得：',
    
    // Station defaults
    station: '駅',
    
    // Name Presets
    stationNamePresets: [
      // 都市
      '東京', '大阪', '京都', '名古屋', '神戸', '福岡', '札幌', '横浜', '仙台', '広島', '金沢', '長野', '新宿', '渋谷', '池袋', '品川', '上野', '秋葉原', 'ロンドン', 'パリ', 'ベルリン', 'マドリード', 'ローマ', 'アムステルダム', 'ニューヨーク', 'ロサンゼルス', 'シカゴ', 'ボストン', 'シアトル', 'サンフランシスコ', 'ソウル', '北京', '上海', '香港', '台北', 'バンコク', 'シンガポール', 'シドニー', 'メルボルン', 'トロント', 'バンクーバー', 'メキシコシティ', 'サンパウロ', 'ブエノスアイレス', 'モスクワ', 'イスタンブール', 'ドバイ', 'ムンバイ', 'デリー',
      // 方角
      '中央', '北', '南', '東', '西', '北東', '北西', '南東', '南西',
      // 場所
      '駅前', '本町', '市役所', '大学', '病院', '空港', '港', '公園', 'スタジアム', '国際展示場', '博物館',
      // 説明的
      '一番線', '二番線', '三番線', 'ジャンクション', 'ターミナル', '急行停車駅', '各駅停車', '乗換', 'インターチェンジ', '車庫', '操車場'
    ],
    lineNamePresets: [
      // 路線種別
      '急行線', '各駅停車線', '快速線', '特急線', '本線', '支線', '環状線', 'ループ線', '地下鉄線', 'メトロ線', '通勤線', '地方線',
      // 色
      '赤線', '青線', '緑線', '黄線', 'オレンジ線', '紫線', 'ピンク線', '茶線', '銀線', '金線',
      // 地理
      '北線', '南線', '東線', '西線', '都心線', '郊外線', '横断線', '港線', '山岳線', '海岸線', '川沿い線', '渓谷線'
    ],
    
    // Loop Modal
    createLoopLine: 'ループ路線を作成',
    selectLoopStation: '使用する駅を選択',
    firstStation: '最初の駅',
    lastStation: '最後の駅',
    
    // Announcement Types
    stationTypes: '駅種別',
    centralStation: '主要駅',
    arrival: '到着',
    departure: '発車',
    transfer: '乗換',
    information: '案内',
    live: '肉声放送',
    warning: '警告',
    general: '一般',
    misc: 'その他',
    chime: 'チャイム',
    music: '音楽',
    ambience: '環境音'
  }
}

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
]

